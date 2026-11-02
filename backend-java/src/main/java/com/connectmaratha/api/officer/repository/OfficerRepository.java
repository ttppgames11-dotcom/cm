package com.connectmaratha.api.officer.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** The officers and officer_requests tables (migration 016). */
@Repository
public class OfficerRepository {

    /** Every officer column plus, for the viewer, whether it is their own profile and whether they have an open request. */
    private static final String OFFICER_SELECT = """
        SELECT o.*, COALESCE(o.member_id = ?, false) AS mine,
          EXISTS (SELECT 1 FROM officer_requests r WHERE r.officer_id = o.id AND r.member_id = ? AND r.status = 'new') AS requested
        FROM officers o""";

    private final JdbcTemplate jdbc;

    public OfficerRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ------------------------------------------------------------------ profiles

    /** Approved, visible officers, newest first; null filters are left out. The exam is matched as a whole code in the list. */
    public List<Map<String, Object>> publicList(String exam, String service, String search, String viewerId) {
        StringBuilder sql = new StringBuilder(OFFICER_SELECT).append(" WHERE o.status = 'approved' AND NOT o.hidden");
        List<Object> args = new ArrayList<>(List.of(blankIfNull(viewerId), blankIfNull(viewerId)));
        if (exam != null) {
            sql.append(" AND (',' || o.exams || ',') LIKE ('%,' || ? || ',%')");
            args.add(exam);
        }
        if (service != null) {
            sql.append(" AND o.service = ?");
            args.add(service);
        }
        if (search != null) {
            sql.append(" AND (o.name ILIKE ? OR o.post ILIKE ? OR o.department ILIKE ? OR o.city ILIKE ? OR o.intro ILIKE ?)");
            String like = "%" + search.trim() + "%";
            for (int i = 0; i < 5; i++) args.add(like);
        }
        sql.append(" ORDER BY o.created_at DESC, o.id DESC");
        return jdbc.queryForList(sql.toString(), args.toArray());
    }

    public Optional<Map<String, Object>> find(String id) {
        return jdbc.queryForList("SELECT * FROM officers WHERE id = ?", id).stream().findFirst();
    }

    public Optional<Map<String, Object>> ofMember(String memberId) {
        return jdbc.queryForList("SELECT * FROM officers WHERE member_id = ?", memberId).stream().findFirst();
    }

    public boolean exists(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM officers WHERE id = ?)", Boolean.class, id));
    }

    /** Saves a profile (exams as a sorted comma list); 0 when this member already has one. */
    public int insert(String id, String memberId, Map<String, Object> p, String exams, String status) {
        return jdbc.update("""
            INSERT INTO officers (id, member_id, name, service, service_status, batch_year, post, department, city, exams,
              intro, phone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING""",
            id, memberId, p.get("name"), p.get("service"), p.get("service_status"), year(p.get("batch_year")), p.get("post"),
            p.get("department"), p.get("city"), exams, p.get("intro"), p.get("phone"), status);
    }

    /** New details; the profile goes back to pending and the old reason is cleared; the switch is kept. */
    public int update(String id, Map<String, Object> p, String exams) {
        return jdbc.update("""
            UPDATE officers SET name = ?, service = ?, service_status = ?, batch_year = ?, post = ?, department = ?, city = ?,
              exams = ?, intro = ?, phone = ?, status = 'pending', reject_reason = NULL, updated_at = now()
            WHERE id = ?""",
            p.get("name"), p.get("service"), p.get("service_status"), year(p.get("batch_year")), p.get("post"),
            p.get("department"), p.get("city"), exams, p.get("intro"), p.get("phone"), id);
    }

    public int setAccepting(String id, boolean accepting) {
        return jdbc.update("UPDATE officers SET accepting = ?, updated_at = now() WHERE id = ?", accepting, id);
    }

    public int setStatus(String id, String status, String reason) {
        return jdbc.update("UPDATE officers SET status = ?, reject_reason = ?, updated_at = now() WHERE id = ?", status, reason, id);
    }

    public int setHidden(String id, boolean hidden) {
        return jdbc.update("UPDATE officers SET hidden = ?, updated_at = now() WHERE id = ?", hidden, id);
    }

    /** Gives the profile an account; 0 when that member already has a profile. */
    public int link(String id, String memberId) {
        try {
            return jdbc.update("UPDATE officers SET member_id = ?, updated_at = now() WHERE id = ?", memberId, id);
        } catch (DuplicateKeyException e) {
            return 0;
        }
    }

    /** Every officer for the admin: pending first, then newest. */
    public List<Map<String, Object>> all() {
        return jdbc.queryForList("SELECT * FROM officers ORDER BY (status = 'pending') DESC, created_at DESC, id DESC");
    }

    public List<String> adminIds() {
        return jdbc.queryForList(
            "SELECT id FROM members WHERE lower(role) IN ('admin', 'superadmin', 'ceo') ORDER BY id", String.class);
    }

    /** The member with this id; otherwise every member whose phone ends in the same 10 digits (more than one = ambiguous). */
    public List<String> membersByIdOrPhone(String idOrPhone) {
        List<String> byId = jdbc.queryForList("SELECT id FROM members WHERE id = ?", String.class, idOrPhone);
        if (!byId.isEmpty()) return byId;
        String digits = idOrPhone.replaceAll("\\D", "");
        if (digits.length() < 10) return List.of();
        return jdbc.queryForList(
            "SELECT id FROM members WHERE right(regexp_replace(coalesce(phone, ''), '\\D', '', 'g'), 10) = ? ORDER BY id",
            String.class, digits.substring(digits.length() - 10));
    }

    // ------------------------------------------------------------------ requests

    /** Every request column plus the officer's name, phone and account, and the student's name and phone. */
    private static final String REQUEST_SELECT = """
        SELECT r.*, o.name AS officer_name, o.phone AS officer_phone, o.member_id AS officer_member_id,
          m.name AS student_name, m.phone AS student_phone
        FROM officer_requests r JOIN officers o ON o.id = r.officer_id LEFT JOIN members m ON m.id = r.member_id""";

    /** Requests this member sent in the last 24 hours. */
    public int recentRequests(String memberId) {
        Integer n = jdbc.queryForObject(
            "SELECT count(*) FROM officer_requests WHERE member_id = ? AND created_at > now() - interval '24 hours'",
            Integer.class, memberId);
        return n == null ? 0 : n;
    }

    public boolean existsRequest(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM officer_requests WHERE id = ?)", Boolean.class, id));
    }

    /** Saves a request; 0 when this member already has an open one for this officer. */
    public int insertRequest(String id, String officerId, String memberId, Map<String, Object> r) {
        return jdbc.update("""
            INSERT INTO officer_requests (id, officer_id, member_id, exam, stage, question, mode, message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING""",
            id, officerId, memberId, r.get("exam"), r.get("stage"), r.get("question"), r.get("mode"), r.get("message"));
    }

    public Optional<Map<String, Object>> findRequest(String id) {
        return jdbc.queryForList(REQUEST_SELECT + " WHERE r.id = ?", id).stream().findFirst();
    }

    /** Requests this member sent, newest first. */
    public List<Map<String, Object>> requestsBy(String memberId) {
        return jdbc.queryForList(REQUEST_SELECT + " WHERE r.member_id = ? ORDER BY r.created_at DESC, r.id DESC", memberId);
    }

    /** Requests to this officer, newest first. */
    public List<Map<String, Object>> requestsTo(String officerId) {
        return jdbc.queryForList(REQUEST_SELECT + " WHERE r.officer_id = ? ORDER BY r.created_at DESC, r.id DESC", officerId);
    }

    /** Requests to officers without an account (admins answer them), open ones first. */
    public List<Map<String, Object>> requestsForUnlinked() {
        return jdbc.queryForList(REQUEST_SELECT
            + " WHERE o.member_id IS NULL ORDER BY (r.status = 'new') DESC, r.created_at DESC, r.id DESC");
    }

    /** Moves an open request to accepted / declined / cancelled; 0 when it was already answered. */
    public int answer(String id, String status) {
        return jdbc.update("UPDATE officer_requests SET status = ?, updated_at = now() WHERE id = ? AND status = 'new'", status, id);
    }

    private static Integer year(Object value) {
        return value instanceof Number n ? n.intValue() : null;
    }

    private static String blankIfNull(String viewerId) {
        return viewerId == null ? "" : viewerId;
    }
}
