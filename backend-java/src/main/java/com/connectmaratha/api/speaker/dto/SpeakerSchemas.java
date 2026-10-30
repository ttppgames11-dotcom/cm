package com.connectmaratha.api.speaker.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/** Validation rules for speaker profiles, requests, answers and admin actions (applied after {@link #normalize}). Unknown fields are ignored. */
public final class SpeakerSchemas {

    private SpeakerSchemas() {}

    /** The categories the website offers. */
    public static final Object[] CATEGORIES = {"प्रेरणादायी वक्ते", "व्यवसाय मार्गदर्शन", "यशस्वी उद्योजक", "युवा प्रेरणा", "शिक्षण तज्ञ", "इतर"};

    private static final String TEN_DIGITS = "^[0-9]{10}$";
    private static final String PHONE_MESSAGE = "मोबाईल नंबर १० अंकी असावा (Phone must be 10 digits)";

    /** At least one of offers_talks / offers_guidance must be true (checked in the service). */
    public static final Map<String, Rule> PROFILE = ordered(
        "name", Rule.string().required().min(2).max(100),
        "title", Rule.string().max(100),
        "category", Rule.string().required().oneOf(CATEGORIES),
        "city", Rule.string().required().min(2).max(100),
        "topics", Rule.string().required().min(2).max(300),
        "intro", Rule.string().max(1000),
        "phone", Rule.string().required().pattern(TEN_DIGITS, PHONE_MESSAGE),
        "offers_talks", Rule.bool(),
        "offers_guidance", Rule.bool());

    /** event_date must also be today or later (checked in the service). */
    public static final Map<String, Rule> TALK = ordered(
        "kind", Rule.string().required().oneOf("talk"),
        "event_date", Rule.string().required().pattern("^\\d{4}-\\d{2}-\\d{2}$", "तारीख YYYY-MM-DD असावी (Date must be YYYY-MM-DD)"),
        "place", Rule.string().required().min(2).max(200),
        "event_type", Rule.string().max(200),
        "audience", Rule.number().integer().minValue(1).maxValue(100000),
        "message", Rule.string().max(1000));

    public static final Map<String, Rule> GUIDANCE = ordered(
        "kind", Rule.string().required().oneOf("guidance"),
        "topic", Rule.string().required().min(2).max(200),
        "mode", Rule.string().oneOf("phone", "meeting"),
        "message", Rule.string().max(1000));

    public static final Map<String, Rule> KIND = ordered(
        "kind", Rule.string().required().oneOf("talk", "guidance"));

    public static final Map<String, Rule> ANSWER = ordered(
        "action", Rule.string().required().oneOf("accept", "decline", "cancel"));

    public static final Map<String, Rule> ADMIN_ACTION = ordered(
        "action", Rule.string().required().oneOf("approve", "reject", "hide", "unhide", "link"),
        "reason", Rule.string().max(500),
        "member", Rule.string().max(30));

    private static final Map<String, String> ALIASES = Map.of(
        "offersTalks", "offers_talks", "offersGuidance", "offers_guidance", "eventDate", "event_date",
        "eventType", "event_type", "rejectReason", "reason", "memberId", "member");

    /**
     * A copy of the body with camelCase names mapped to the snake_case ones (the snake_case key wins), texts trimmed
     * (empty ones dropped), the phone without spaces or dashes, and kind/action/mode lower-cased.
     */
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
        if (copy.get("phone") instanceof String phone) copy.put("phone", phone.replaceAll("[\\s-]", ""));
        for (String key : new String[] {"kind", "action", "mode"}) {
            if (copy.get(key) instanceof String s) copy.put(key, s.toLowerCase(Locale.ROOT));
        }
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
