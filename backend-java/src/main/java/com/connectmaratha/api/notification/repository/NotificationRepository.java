package com.connectmaratha.api.notification.repository;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Reads and marks a member's rows in the notifications table (written by meetings, chapters, blood help and enquiries). */
@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbc;

    public NotificationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * The member's newest notifications. created_ts is the "YYYY-MM-DD HH24:MI:SS" text the server writes, read as a
     * time in the database's own time zone (the zone that wrote it); other formats are left to the caller.
     */
    public List<Map<String, Object>> newest(String memberId, int limit) {
        return jdbc.queryForList("""
            SELECT id, title, message, type, is_read, created_at,
                   CASE WHEN created_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$'
                        THEN to_timestamp(created_at, 'YYYY-MM-DD HH24:MI:SS') END AS created_ts
            FROM notifications WHERE member_id = ?
            ORDER BY created_at DESC NULLS LAST, id DESC LIMIT ?""", memberId, limit);
    }

    public int unread(String memberId) {
        Integer n = jdbc.queryForObject(
            "SELECT COUNT(*) FROM notifications WHERE member_id = ? AND COALESCE(is_read, 0) = 0", Integer.class, memberId);
        return n == null ? 0 : n;
    }

    /** 0 when the notification does not exist or is someone else's. */
    public int markRead(String memberId, String id) {
        return jdbc.update("UPDATE notifications SET is_read = 1 WHERE id = ? AND member_id = ?", id, memberId);
    }

    public int markAllRead(String memberId) {
        return jdbc.update("UPDATE notifications SET is_read = 1 WHERE member_id = ? AND COALESCE(is_read, 0) = 0", memberId);
    }
}
