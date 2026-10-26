package com.connectmaratha.api.sangam.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Map;

/** Validation rules for requesting a meeting (applied to the body after {@link #normalize}). Unknown fields are ignored. */
public final class MeetingSchemas {

    private MeetingSchemas() {}

    private static final String DATE = "^[0-9]{4}-[0-9]{2}-[0-9]{2}$";
    private static final String TIME = "^[0-9]{2}:[0-9]{2}$";

    public static final Map<String, Rule> MEETING = ordered(
        "recipientId", Rule.string().required().max(20),
        "date", Rule.string().required().pattern(DATE, "date must look like 2026-12-31"),
        "time", Rule.string().required().pattern(TIME, "time must look like 10:30"),
        "mode", Rule.string().required().oneOf("Offline", "Online"),
        "place", Rule.string().required().max(200),
        "topic", Rule.string().required().min(3).max(300));

    /** A new date, time and optionally a new place for an existing meeting. */
    public static final Map<String, Rule> RESCHEDULE = ordered(
        "date", Rule.string().required().pattern(DATE, "date must look like 2026-12-31"),
        "time", Rule.string().required().pattern(TIME, "time must look like 10:30"),
        "place", Rule.string().max(200));

    /** The four words a participant can answer or close a meeting with. */
    public static final Map<String, Rule> STATUS = ordered(
        "status", Rule.string().required().oneOf("accepted", "declined", "cancelled", "completed"));

    public static final Map<String, Rule> NOTE = ordered("notes", Rule.string().required().max(2000));

    /** A copy of the body with the snake_case recipient_id mapped to recipientId (the camelCase key wins when both are sent). */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        if (!copy.containsKey("recipientId") && copy.containsKey("recipient_id")) copy.put("recipientId", copy.get("recipient_id"));
        return copy;
    }

    /** A copy of the body with a text status trimmed and lower-cased. */
    public static Map<String, Object> normalizeStatus(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        if (copy.get("status") instanceof String s) copy.put("status", s.trim().toLowerCase(java.util.Locale.ROOT));
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
