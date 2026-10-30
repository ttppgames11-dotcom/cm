package com.connectmaratha.api.officer.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;

/** Codes and validation rules for officer profiles, guidance requests, the switch, answers and admin actions (after {@link #normalize}). */
public final class OfficerSchemas {

    private OfficerSchemas() {}

    public static final Object[] SERVICES = {"ias", "ips", "ifs", "irs", "central", "mpsc_1", "mpsc_2", "mpsc_psi", "other"};
    public static final Object[] SERVICE_STATUSES = {"serving", "retired"};
    public static final Object[] STAGES = {"start", "prelims", "mains", "interview"};
    public static final Object[] MODES = {"phone", "meeting", "online"};

    /** The exams an officer guides for, with the labels used in notifications (the website keeps the same labels). */
    public static final Map<String, String> EXAM_LABELS;
    static {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("upsc_cse", "UPSC नागरी सेवा");
        m.put("mpsc_rajyaseva", "MPSC राज्यसेवा");
        m.put("mpsc_group_b", "MPSC गट ब");
        m.put("mpsc_group_c", "MPSC गट क");
        m.put("other_exam", "इतर स्पर्धा परीक्षा");
        EXAM_LABELS = java.util.Collections.unmodifiableMap(m);
    }
    public static final Object[] EXAMS = EXAM_LABELS.keySet().toArray();

    private static final String TEN_DIGITS = "^[0-9]{10}$";
    private static final String PHONE_MESSAGE = "मोबाईल नंबर १० अंकी असावा (Phone must be 10 digits)";

    /** The profile rules; the batch year may not be after the current year in India. */
    public static Map<String, Rule> profile() {
        int thisYear = LocalDate.now(ZoneId.of("Asia/Kolkata")).getYear();
        return ordered(
            "name", Rule.string().required().min(2).max(100),
            "service", Rule.string().required().oneOf(SERVICES),
            "service_status", Rule.string().required().oneOf(SERVICE_STATUSES),
            "batch_year", Rule.number().integer().minValue(1950).maxValue(thisYear),
            "post", Rule.string().required().min(2).max(100),
            "department", Rule.string().max(100),
            "city", Rule.string().required().min(2).max(100),
            "exams", Rule.array().required().minItems(1).items(Rule.string().oneOf(EXAMS)),
            "intro", Rule.string().max(1000),
            "phone", Rule.string().required().pattern(TEN_DIGITS, PHONE_MESSAGE));
    }

    public static final Map<String, Rule> REQUEST = ordered(
        "exam", Rule.string().required().oneOf(EXAMS),
        "stage", Rule.string().required().oneOf(STAGES),
        "question", Rule.string().required().min(2).max(500),
        "mode", Rule.string().required().oneOf(MODES),
        "message", Rule.string().max(1000));

    public static final Map<String, Rule> ACCEPTING = ordered("accepting", Rule.bool().required());

    public static final Map<String, Rule> ANSWER = ordered(
        "action", Rule.string().required().oneOf("accept", "decline", "cancel"));

    public static final Map<String, Rule> ADMIN_ACTION = ordered(
        "action", Rule.string().required().oneOf("approve", "reject", "hide", "unhide", "link", "pause", "resume"),
        "reason", Rule.string().max(500),
        "member", Rule.string().max(30));

    private static final Map<String, String> ALIASES = Map.of(
        "serviceStatus", "service_status", "batchYear", "batch_year", "memberId", "member");

    /**
     * A copy of the body with camelCase names mapped to the snake_case ones (the snake_case key wins), texts trimmed
     * (empty ones dropped), the phone without spaces or dashes, codes lower-cased, and a list of exams trimmed,
     * lower-cased, de-duplicated and sorted.
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
        for (String key : new String[] {"service", "service_status", "exam", "stage", "mode", "action"}) {
            if (copy.get(key) instanceof String s) copy.put(key, s.toLowerCase(Locale.ROOT));
        }
        if (copy.get("exams") instanceof List<?> list) {
            boolean allText = list.stream().allMatch(x -> x instanceof String);
            if (allText) {
                TreeSet<String> codes = new TreeSet<>();
                for (Object x : list) {
                    String code = ((String) x).trim().toLowerCase(Locale.ROOT);
                    if (!code.isEmpty()) codes.add(code);
                }
                copy.put("exams", new ArrayList<>(codes));
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
