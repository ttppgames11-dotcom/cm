package com.connectmaratha.api.blood.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/** Validation rules for blood requests, donor profiles and request actions (applied after {@link #normalize}). Unknown fields are ignored. */
public final class BloodSchemas {

    private BloodSchemas() {}

    public static final Object[] GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"};

    public static final Map<String, Rule> REQUEST = ordered(
        "patientName", Rule.string().required().min(2).max(100),
        "bloodGroup", Rule.string().required().oneOf(GROUPS),
        "units", Rule.number().integer().minValue(1).maxValue(20),
        "hospital", Rule.string().required().min(2).max(150),
        "city", Rule.string().required().min(2).max(100),
        "district", Rule.string().required().min(2).max(100),
        "contactPhone", Rule.string().required().format("phone").min(10).max(15),
        "urgency", Rule.string().max(50),
        "note", Rule.string().max(300));

    /** lastDonated is checked separately (YYYY-MM-DD, not in the future, or empty). */
    public static final Map<String, Rule> DONOR = ordered(
        "name", Rule.string().required().min(2).max(100),
        "bloodGroup", Rule.string().required().oneOf(GROUPS),
        "city", Rule.string().required().min(2).max(100),
        "district", Rule.string().required().min(2).max(100),
        "phone", Rule.string().required().format("phone").min(10).max(15),
        "available", Rule.bool(),
        "lastDonated", Rule.string().max(10));

    public static final Map<String, Rule> ACTION = ordered(
        "action", Rule.string().required().oneOf("received", "close", "extend"));

    public static final Map<String, Rule> HIDDEN = ordered("hidden", Rule.bool().required());

    private static final Map<String, String> ALIASES = Map.of(
        "patient_name", "patientName", "blood_group", "bloodGroup", "contact_phone", "contactPhone", "last_donated", "lastDonated");

    /** A copy of the body with snake_case names mapped to camelCase (the camelCase key wins) and a text action trimmed and lower-cased. */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        ALIASES.forEach((snake, camel) -> {
            if (!copy.containsKey(camel) && copy.containsKey(snake)) copy.put(camel, copy.get(snake));
        });
        if (copy.get("action") instanceof String s) copy.put("action", s.trim().toLowerCase(Locale.ROOT));
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
