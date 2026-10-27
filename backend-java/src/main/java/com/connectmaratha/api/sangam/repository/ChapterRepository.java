package com.connectmaratha.api.sangam.repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Chapters and their seats. Counts and lists join businesses, so a deleted business drops out; "visible" means a
 * business whose status is not 'hidden'. A seat is active while it is waiting or approved.
 */
@Repository
public class ChapterRepository {

    static final String VISIBLE = "(b.status IS NULL OR b.status <> 'hidden')";

    /** A chapter row with the coordinator's name and its seat counts. */
    private static final String CHAPTER_SELECT = """
        SELECT c.*, m.name AS coordinator_name,
          (SELECT COUNT(*) FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.chapter_id = c.id AND s.status = 'approved' AND %s) AS businesses,
          (SELECT COUNT(*) FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.chapter_id = c.id AND s.status = 'approved') AS approved,
          (SELECT COUNT(*) FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.chapter_id = c.id AND s.status = 'waiting') AS waiting
        FROM chapters c LEFT JOIN members m ON m.id = c.coordinator_id
        """.formatted(VISIBLE);

    private final JdbcTemplate jdbc;

    public ChapterRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean existsChapter(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM chapters WHERE id = ?)", Boolean.class, id));
    }

    public Optional<Map<String, Object>> findChapter(String id) {
        return jdbc.queryForList(CHAPTER_SELECT + " WHERE c.id = ?", id).stream().findFirst();
    }

    /** Every chapter, newest first (the admin console). */
    public List<Map<String, Object>> allChapters() {
        return jdbc.queryForList(CHAPTER_SELECT + " ORDER BY c.created_at DESC, c.id DESC");
    }

    /** Open chapters by city, then name (the public page). */
    public List<Map<String, Object>> openChapters() {
        return jdbc.queryForList(CHAPTER_SELECT + " WHERE c.status = 'open' ORDER BY c.city, c.name");
    }

    /** {cat, count} of each chapter's approved visible businesses, keyed by chapter id. */
    public Map<String, List<Map<String, Object>>> categories() {
        Map<String, List<Map<String, Object>>> out = new LinkedHashMap<>();
        jdbc.query("""
            SELECT s.chapter_id, b.cat, COUNT(*) AS n FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.status = 'approved' AND %s GROUP BY s.chapter_id, b.cat ORDER BY s.chapter_id, n DESC, b.cat
            """.formatted(VISIBLE), rs -> {
                Map<String, Object> c = new LinkedHashMap<>();
                c.put("cat", rs.getString("cat"));
                c.put("count", rs.getInt("n"));
                out.computeIfAbsent(rs.getString("chapter_id"), k -> new java.util.ArrayList<>()).add(c);
            });
        return out;
    }

    public void insertChapter(String id, Map<String, Object> f, String now) {
        jdbc.update("""
            INSERT INTO chapters (id, name, city, district, area, meeting_day, meeting_time, venue, coordinator_id, max_seats, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)""",
            id, f.get("name"), f.get("city"), f.get("district"), f.get("area"), f.get("meetingDay"), f.get("meetingTime"),
            f.get("venue"), f.get("coordinatorId"), f.get("maxSeats"), now, now);
    }

    /** {status, max_seats} of a chapter, locking its row until the transaction ends (so two approvals cannot both pass the full check). */
    public Optional<Map<String, Object>> lockChapter(String id) {
        return jdbc.queryForList("SELECT status, max_seats FROM chapters WHERE id = ? FOR UPDATE", id).stream().findFirst();
    }

    /** Approved seats whose business still exists (hidden ones still hold their seat). */
    public int approvedCount(String chapterId) {
        return jdbc.queryForObject("""
            SELECT COUNT(*) FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.chapter_id = ? AND s.status = 'approved'""", Integer.class, chapterId);
    }

    /** {id, owner_id, status, name} of a business. */
    public Optional<Map<String, Object>> findBusiness(String id) {
        return jdbc.queryForList("SELECT id, owner_id, status, name FROM businesses WHERE id = ?", id).stream().findFirst();
    }

    public boolean businessHasActiveSeat(String businessId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM chapter_seats WHERE business_id = ? AND status IN ('waiting', 'approved'))", Boolean.class, businessId));
    }

    public boolean memberHasActiveSeat(String chapterId, String memberId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM chapter_seats WHERE chapter_id = ? AND member_id = ? AND status IN ('waiting', 'approved'))",
            Boolean.class, chapterId, memberId));
    }

    public boolean existsSeat(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM chapter_seats WHERE id = ?)", Boolean.class, id));
    }

    public void insertSeat(String id, String chapterId, String businessId, String memberId, String message, String now) {
        jdbc.update("""
            INSERT INTO chapter_seats (id, chapter_id, business_id, member_id, message, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'waiting', ?, ?)""", id, chapterId, businessId, memberId, message, now, now);
    }

    /** A seat with its chapter's name, coordinator and status, and its business name. */
    public Optional<Map<String, Object>> findSeat(String id) {
        return jdbc.queryForList("""
            SELECT s.*, c.name AS chapter_name, c.coordinator_id, c.status AS chapter_status, b.name AS business_name
            FROM chapter_seats s JOIN chapters c ON c.id = s.chapter_id LEFT JOIN businesses b ON b.id = s.business_id
            WHERE s.id = ?""", id).stream().findFirst();
    }

    /** Moves a seat from one status to another; 0 when it was no longer in the expected status. */
    public int setSeatStatusIf(String id, String from, String to, String decidedBy, String now) {
        return jdbc.update("""
            UPDATE chapter_seats SET status = ?, decided_by = COALESCE(?, decided_by), updated_at = ?
            WHERE id = ? AND status = ?""", to, decidedBy, now, id, from);
    }

    /** Declines every waiting seat of a chapter and returns the members who asked. */
    public List<String> declineWaiting(String chapterId, String decidedBy, String now) {
        return jdbc.queryForList("""
            UPDATE chapter_seats SET status = 'declined', decided_by = ?, updated_at = ?
            WHERE chapter_id = ? AND status = 'waiting' RETURNING member_id""", String.class, decidedBy, now, chapterId);
    }

    /** A member's own seats (every status), newest first, with chapter and business names. */
    public List<Map<String, Object>> seatsOfMember(String memberId) {
        return jdbc.queryForList("""
            SELECT s.*, c.name AS chapter_name, b.name AS business_name
            FROM chapter_seats s JOIN chapters c ON c.id = s.chapter_id JOIN businesses b ON b.id = s.business_id
            WHERE s.member_id = ? ORDER BY s.created_at DESC, s.id DESC""", memberId);
    }

    /** Chapters a member coordinates, with their waiting count. */
    public List<Map<String, Object>> coordinatedBy(String memberId) {
        return jdbc.queryForList(CHAPTER_SELECT + " WHERE c.coordinator_id = ? ORDER BY c.city, c.name", memberId);
    }

    /**
     * Waiting and approved seats of a chapter with business details; similar = approved businesses in the chapter
     * with the same category (not counting the row itself).
     */
    public List<Map<String, Object>> chapterSeats(String chapterId) {
        return jdbc.queryForList("""
            SELECT s.*, b.name AS business_name, b.cat, b.city, b.owner AS owner,
              NOT %s AS business_hidden,
              (SELECT COUNT(*) FROM chapter_seats o JOIN businesses ob ON ob.id = o.business_id
                WHERE o.chapter_id = s.chapter_id AND o.status = 'approved' AND o.id <> s.id AND ob.cat = b.cat) AS similar
            FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.chapter_id = ? AND s.status IN ('waiting', 'approved')
            ORDER BY s.status DESC, s.created_at""".formatted(VISIBLE), chapterId);
    }

    /** Approved visible businesses of a chapter, by name. */
    public List<Map<String, Object>> chapterBusinesses(String chapterId) {
        return jdbc.queryForList("""
            SELECT b.id AS business_id, b.name, b.cat, b.city, b.owner_id, b.owner
            FROM chapter_seats s JOIN businesses b ON b.id = s.business_id
            WHERE s.chapter_id = ? AND s.status = 'approved' AND %s ORDER BY b.name""".formatted(VISIBLE), chapterId);
    }

    public void updateChapter(String id, Map<String, Object> f, String status, String now) {
        jdbc.update("""
            UPDATE chapters SET name = ?, city = ?, district = ?, area = ?, meeting_day = ?, meeting_time = ?, venue = ?,
              coordinator_id = ?, max_seats = ?, status = ?, updated_at = ? WHERE id = ?""",
            f.get("name"), f.get("city"), f.get("district"), f.get("area"), f.get("meetingDay"), f.get("meetingTime"),
            f.get("venue"), f.get("coordinatorId"), f.get("maxSeats"), status, now, id);
    }
}
