package com.connectmaratha.api.notification.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.notification.repository.NotificationRepository;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** A member's own notification inbox: the newest 50, the unread count, and marking read. */
@Service
public class NotificationService {

    static final int LIMIT = 50;

    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> mine(CurrentUser user) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : notifications.newest(user.id(), LIMIT)) {
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("id", row.get("id"));
            n.put("title", text(row.get("title")));
            n.put("message", text(row.get("message")));
            n.put("type", text(row.get("type")));
            n.put("read", row.get("is_read") instanceof Number r && r.intValue() != 0);
            n.put("created_at", iso(row.get("created_ts"), row.get("created_at")));
            list.add(n);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("unread", notifications.unread(user.id()));
        out.put("notifications", list);
        return out;
    }

    @Transactional
    public Map<String, Object> markRead(CurrentUser user, String id) {
        if (notifications.markRead(user.id(), id) == 0) {
            throw ApiException.notFound("NOTIFICATION_NOT_FOUND", "ही सूचना सापडली नाही (Notification not found).");
        }
        return unreadResult(user);
    }

    @Transactional
    public Map<String, Object> markAllRead(CurrentUser user) {
        notifications.markAllRead(user.id());
        return unreadResult(user);
    }

    private Map<String, Object> unreadResult(CurrentUser user) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("unread", notifications.unread(user.id()));
        return out;
    }

    /** ISO-8601 (UTC) from the parsed timestamp, or from text that is already ISO; null when neither. */
    static String iso(Object timestamp, Object text) {
        if (timestamp instanceof java.sql.Timestamp t) return t.toInstant().toString();
        if (timestamp instanceof OffsetDateTime o) return o.toInstant().toString();
        if (text == null) return null;
        try {
            return Instant.parse(text.toString().trim()).toString();
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static String text(Object value) {
        return value == null ? "" : value.toString();
    }
}
