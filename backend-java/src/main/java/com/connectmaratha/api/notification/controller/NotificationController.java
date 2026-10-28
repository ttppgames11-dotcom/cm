package com.connectmaratha.api.notification.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.notification.service.NotificationService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/members/notifications: your own notifications (Node only wrote them; nothing read them back). */
@RestController
@RequestMapping("/api/members/notifications")
public class NotificationController {

    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    /** Your newest 50 notifications and the unread count. */
    @RequireAuth
    @GetMapping
    public Map<String, Object> mine(CurrentUser user) {
        return notifications.mine(user);
    }

    /** Declared before /{id}/read. */
    @RequireAuth
    @PutMapping("/read-all")
    public Map<String, Object> readAll(CurrentUser user) {
        return notifications.markAllRead(user);
    }

    @RequireAuth
    @PutMapping("/{id}/read")
    public Map<String, Object> read(@PathVariable String id, CurrentUser user) {
        return notifications.markRead(user, id);
    }
}
