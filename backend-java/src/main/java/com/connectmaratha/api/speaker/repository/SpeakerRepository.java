package com.connectmaratha.api.speaker.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** The speakers and speaker_requests tables (migration 015). */
@Repository
public class SpeakerRepository {

    /** Every speaker column plus, for the viewer, whether it is their own profile and whether they have an open request. */
    private static final String SPEAKER_SELECT = """
        SELECT s.*, COALESCE(s.member_id = ?, false) AS mine,
          EXISTS (SELECT 1 FROM speaker_requests r WHERE r.speaker_id = s.id AND r.member_id = ? AND r.status = 'new') AS requested
        FROM speakers s""";

    private final JdbcTemplate jdbc;

    public SpeakerRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ------------------------------------------------------------------ profiles

    /** Approved, visible speakers, newest first; null filters are left out. */
    public List<Map<String, Object>> publicList(String category, String city, String search, String viewerId) {
        StringBuilder sql = new StringBuilder(SPEAKER_SELECT).append(" WHERE s.status = 'approved' AND NOT s.hidden");
        List<Object> args = new ArrayList<>(List.of(viewerIdOrBlank(viewerId), viewerIdOrBlank(viewerId)));
        if (category != null) {
            sql.append(" AND lower(trim(s.category)) = lower(trim(?))");
            args.add(category);
        }
        if (city != null) {
            sql.append(" AND lower(trim(s.city)) = lower(trim(?))");
            args.add(city);
        }
        if (search != null) {
            sql.append(" AND (s.name ILIKE ? OR s.title ILIKE ? OR s.topics ILIKE ? OR s.city ILIKE ? OR s.intro ILIKE ?)");
            String like = "%" + search.trim() + "%";
            for (int i = 0; i < 5; i++) args.add(like);
        }
        sql.append(" ORDER BY s.created_at DESC, s.id DESC");
        return jdbc.queryForList(sql.toString(), args.toArray());
    }

    public Optional<Map<String, Object>> find(String id) {
        return jdbc.queryForList("SELECT * FROM speakers WHERE id = ?", id).stream().findFirst();
    }

    public Optional<Map<String, Object>> ofMember(String memberId) {
        return jdbc.queryForList("SELECT * FROM speakers WHERE member_id = ?", memberId).stream().findFirst();
    }

    public boolean exists(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM speakers WHERE id = ?)", Boolean.class, id));
    }

    /** Saves a profile; 0 when this member already has one (the one-per-member index). */
    public int insert(String id, String memberId, Map<String, Object> p, String status) {
        return jdbc.update("""
            INSERT INTO speakers (id, member_id, name, title, category, city, topics, intro, phone, offers_talks, offers_guidance, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING""",
            id, memberId, p.get("name"), p.get("title"), p.get("category"), p.get("city"), p.get("topics"), p.get("intro"),
            p.get("phone"), Boolean.TRUE.equals(p.get("offers_talks")), Boolean.TRUE.equals(p.get("offers_guidance")), status);
    }

    /** New details; the profile goes back to pending and the old reason is cleared. */
    public int update(String id, Map<String, Object> p) {
        return jdbc.update("""
            UPDATE speakers SET name = ?, title = ?, category = ?, city = ?, topics = ?, intro = ?, phone = ?,
              offers_talks = ?, offers_guidance = ?, status = 'pending', reject_reason = NULL, updated_at = now()
            WHERE id = ?""",
            p.get("name"), p.get("title"), p.get("category"), p.get("city"), p.get("topics"), p.get("intro"), p.get("phone"),
            Boolean.TRUE.equals(p.get("offers_talks")), Boolean.TRUE.equals(p.get("offers_guidance")), id);
    }

    public int setStatus(String id, String status, String reason) {
        return jdbc.update("UPDATE speakers SET status = ?, reject_reason = ?, updated_at = now() WHERE id = ?", status, reason, id);
    }

    public int setHidden(String id, boolean hidden) {
        return jdbc.update("UPDATE speakers SET hidden = ?, updated_at = now() WHERE id = ?", hidden, id);
    }

    /** Gives the profile an account; 0 when that member already has a profile. */
    public int link(String id, String memberId) {
        try {
            return jdbc.update("UPDATE speakers SET member_id = ?, updated_at = now() WHERE id = ?", memberId, id);
        } catch (DuplicateKeyException e) {
            return 0;
        }
    }

    /** Every speaker for the admin: pending first, then newest. */
    public List<Map<String, Object>> all() {
        return jdbc.queryForList("SELECT * FROM speakers ORDER BY (status = 'pending') DESC, created_at DESC, id DESC");
    }

    public List<String> adminIds() {
        return jdbc.queryForList(
            "SELECT id FROM members WHERE lower(role) IN ('admin', 'superadmin', 'ceo') ORDER BY id", String.class);
    }

    /** A member by id, or by the last 10 digits of their phone. */
    public Optional<String> memberByIdOrPhone(String idOrPhone) {
        String digits = idOrPhone.replaceAll("\\D", "");
        String last10 = digits.length() >= 10 ? digits.substring(digits.length() - 10) : "#";
        return jdbc.queryForList("""
            SELECT id FROM members WHERE id = ? OR right(regexp_replace(coalesce(phone, ''), '\\D', '', 'g'), 10) = ?
            ORDER BY (id = ?) DESC, id LIMIT 1""", String.class, idOrPhone, last10, idOrPhone).stream().findFirst();
    }

    // ------------------------------------------------------------------ requests

    /** Every request column plus the speaker's name, phone and account, and the organiser's name and phone. */
    private static final String REQUEST_SELECT = """
        SELECT r.*, s.name AS speaker_name, s.phone AS speaker_phone, s.member_id AS speaker_member_id,
          m.name AS organiser_name, m.phone AS organiser_phone
        FROM speaker_requests r JOIN speakers s ON s.id = r.speaker_id LEFT JOIN members m ON m.id = r.member_id""";

    /** Requests this member sent in the last 24 hours. */
    public int recentRequests(String memberId) {
        Integer n = jdbc.queryForObject(
            "SELECT count(*) FROM speaker_requests WHERE member_id = ? AND created_at > now() - interval '24 hours'",
            Integer.class, memberId);
        return n == null ? 0 : n;
    }

    public boolean existsRequest(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM speaker_requests WHERE id = ?)", Boolean.class, id));
    }

    /** Saves a request; 0 when this member already has an open one for this speaker. */
    public int insertRequest(String id, String speakerId, String memberId, Map<String, Object> r) {
        return jdbc.update("""
            INSERT INTO speaker_requests (id, speaker_id, member_id, kind, event_date, place, event_type, audience, topic, mode, message)
            VALUES (?, ?, ?, ?, CAST(? AS DATE), ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING""",
            id, speakerId, memberId, r.get("kind"), r.get("event_date"), r.get("place"), r.get("event_type"),
            r.get("audience") instanceof Number n ? n.intValue() : null, r.get("topic"), r.get("mode"), r.get("message"));
    }

    public Optional<Map<String, Object>> findRequest(String id) {
        return jdbc.queryForList(REQUEST_SELECT + " WHERE r.id = ?", id).stream().findFirst();
    }

    /** Requests this member sent, newest first. */
    public List<Map<String, Object>> requestsBy(String memberId) {
        return jdbc.queryForList(REQUEST_SELECT + " WHERE r.member_id = ? ORDER BY r.created_at DESC, r.id DESC", memberId);
    }

    /** Requests to this speaker, newest first. */
    public List<Map<String, Object>> requestsTo(String speakerId) {
        return jdbc.queryForList(REQUEST_SELECT + " WHERE r.speaker_id = ? ORDER BY r.created_at DESC, r.id DESC", speakerId);
    }

    /** Requests to speakers without an account (admins answer them), open ones first. */
    public List<Map<String, Object>> requestsForUnlinked() {
        return jdbc.queryForList(REQUEST_SELECT
            + " WHERE s.member_id IS NULL ORDER BY (r.status = 'new') DESC, r.created_at DESC, r.id DESC");
    }

    /** Moves an open request to accepted / declined / cancelled; 0 when it was already answered. */
    public int answer(String id, String status) {
        return jdbc.update("UPDATE speaker_requests SET status = ?, updated_at = now() WHERE id = ? AND status = 'new'", status, id);
    }

    private static String viewerIdOrBlank(String viewerId) {
        return viewerId == null ? "" : viewerId;
    }
}
