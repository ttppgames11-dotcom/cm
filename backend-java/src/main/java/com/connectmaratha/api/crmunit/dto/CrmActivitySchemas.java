package com.connectmaratha.api.crmunit.dto;

import com.connectmaratha.api.common.validation.Rule;
import com.connectmaratha.api.crmunit.ActivityTypes;
import java.util.LinkedHashMap;
import java.util.Map;

/** Validation rules for the yearly plan and the activities of a CRM unit (after {@link #normalize}). */
public final class CrmActivitySchemas {

    private CrmActivitySchemas() {}

    public static final int MAX_COUNT = 1_000_000;
    private static final String DATE = "^[0-9]{4}-[0-9]{2}-[0-9]{2}$";
    private static final String DATE_MESSAGE = "तारीख YYYY-MM-DD अशी द्या (Date must be YYYY-MM-DD)";

    public static final Map<String, Rule> ADD = ordered(
        "type", Rule.string().required().oneOf(ActivityTypes.KEYS),
        "scheduled_date", Rule.string().required().pattern(DATE, DATE_MESSAGE),
        "target_count", Rule.number().integer().minValue(0).maxValue(MAX_COUNT),
        "title", Rule.string().max(200),
        "notes", Rule.string().max(2000));

    public static final Map<String, Rule> UPDATE = ordered(
        "scheduled_date", Rule.string().pattern(DATE, DATE_MESSAGE),
        "target_count", Rule.number().integer().minValue(0).maxValue(MAX_COUNT),
        "title", Rule.string().max(200),
        "notes", Rule.string().max(2000),
        "photo_url", Rule.string().max(500),
        "status", Rule.string().oneOf("planned", "in_progress", "done"));

    public static final Map<String, Rule> COMPLETE = ordered(
        "attendee_count", Rule.number().required().integer().minValue(0).maxValue(MAX_COUNT),
        "notes", Rule.string().required().min(3).max(2000),
        "photo_url", Rule.string().max(500));

    public static final Map<String, Rule> PLAN = ordered(
        "year", Rule.number().integer().minValue(2000).maxValue(2100),
        "targets", Rule.object());

    private static final Map<String, String> ALIASES = Map.of(
        "scheduledDate", "scheduled_date", "targetCount", "target_count",
        "attendeeCount", "attendee_count", "photoUrl", "photo_url");

    /** A copy of the body with camelCase names mapped to snake_case (the snake_case key wins) and texts trimmed (empty ones dropped). */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        ALIASES.forEach((camel, snake) -> {
            if (!copy.containsKey(snake) && copy.containsKey(camel)) copy.put(snake, copy.get(camel));
        });
        for (String key : copy.keySet().toArray(new String[0])) {
            if (copy.get(key) instanceof String s) {
                String trimmed = s.trim();
                if (trimmed.isEmpty()) copy.remove(key); else copy.put(key, trimmed);
            }
        }
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
