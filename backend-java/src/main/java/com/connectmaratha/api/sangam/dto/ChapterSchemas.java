package com.connectmaratha.api.sangam.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/** Validation rules for chapters, join requests and seat actions (applied after {@link #normalize}). Unknown fields are ignored. */
public final class ChapterSchemas {

    private ChapterSchemas() {}

    /** A whole chapter; maxSeats is checked separately (a whole number 1-200, or empty for no limit). */
    public static final Map<String, Rule> CHAPTER = ordered(
        "name", Rule.string().required().min(3).max(120),
        "city", Rule.string().required().max(60),
        "district", Rule.string().required().max(60),
        "area", Rule.string().max(120),
        "meetingDay", Rule.string().max(40),
        "meetingTime", Rule.string().max(40),
        "venue", Rule.string().max(200),
        "coordinatorId", Rule.string().required().max(20));

    public static final Map<String, Rule> STATUS = ordered("status", Rule.string().oneOf("open", "closed"));

    public static final Map<String, Rule> JOIN = ordered(
        "businessId", Rule.string().required().max(40),
        "message", Rule.string().max(300));

    public static final Map<String, Rule> ACTION = ordered(
        "action", Rule.string().required().oneOf("approve", "decline", "remove", "cancel", "leave"));

    private static final Map<String, String> ALIASES = Map.of(
        "meeting_day", "meetingDay", "meeting_time", "meetingTime", "coordinator_id", "coordinatorId",
        "max_seats", "maxSeats", "business_id", "businessId");

    /** A copy of the body with snake_case names mapped to camelCase (the camelCase key wins) and a text action or status trimmed and lower-cased. */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        ALIASES.forEach((snake, camel) -> {
            if (!copy.containsKey(camel) && copy.containsKey(snake)) copy.put(camel, copy.get(snake));
        });
        for (String key : new String[] {"action", "status"}) {
            if (copy.get(key) instanceof String s) copy.put(key, s.trim().toLowerCase(Locale.ROOT));
        }
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
