package com.connectmaratha.api.directory.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.directory.repository.DirectoryNotificationRepository;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Checks and small helpers shared by the builders and dairy services (same rules as directories.routes.js). */
@Component
public class DirectoryRules {

    private static final Logger log = LoggerFactory.getLogger(DirectoryRules.class);
    private static final Pattern MOBILE = Pattern.compile("^(?:91|0)?([6-9]\\d{9})$");
    private static final DateTimeFormatter JS_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private final DirectoryNotificationRepository notifications;

    public DirectoryRules(DirectoryNotificationRepository notifications) {
        this.notifications = notifications;
    }

    /** An Indian mobile (10 digits starting 6-9, optionally +91 or 0 in front) -> the 10 digits; else null. */
    public static String indianMobile(Object phone) {
        if (!(phone instanceof String s) || s.isEmpty()) return null;
        Matcher m = MOBILE.matcher(s.replaceAll("\\D", ""));
        return m.matches() ? m.group(1) : null;
    }

    public static ApiException validation(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    /** typeof v === 'string' && v.trim() !== '' */
    public static boolean nonBlankString(Object v) {
        return v instanceof String s && !s.trim().isEmpty();
    }

    /** v !== undefined && v !== null ? String(v).trim() : '' */
    public static String trimmedOrEmpty(Object v) {
        return v == null ? "" : Js.string(v).trim();
    }

    /** v ? String(v).trim() : fallback */
    public static String trimmedOr(Object v, String fallback) {
        return Js.truthy(v) ? Js.string(v).trim() : fallback;
    }

    /** (v !== undefined && v !== null && !isNaN(Number(v))) ? Number(v) : 0 */
    public static Number numberOrZero(Object v) {
        if (v == null) return 0L;
        double d = Js.number(v);
        return Double.isNaN(d) ? 0L : Js.jsNumber(d);
    }

    public static String nowIso() {
        return JS_ISO.format(Instant.now());
    }

    /** prefix + milliseconds + "-" + 3 random digits (ENQ-, DENQ-, REG-). */
    public static String timedId(String prefix) {
        return prefix + System.currentTimeMillis() + "-" + Ids.between(100, 1000);
    }

    /** Notification to an owner; a failure is logged and ignored, as in Node. */
    public void notifyOwner(Object ownerId, String title, String message, String type) {
        try {
            notifications.notifyMember("NOTIF-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000),
                Js.string(ownerId), title, message, type);
        } catch (RuntimeException e) {
            log.error("Error inserting {} notification", type, e);
        }
    }
}
