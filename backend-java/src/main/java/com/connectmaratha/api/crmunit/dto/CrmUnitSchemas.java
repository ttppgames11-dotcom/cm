package com.connectmaratha.api.crmunit.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Validation rules for creating and editing CRM units and changing their owner (after {@link #normalize}). */
public final class CrmUnitSchemas {

    private CrmUnitSchemas() {}

    public static final List<String> LEVELS = List.of("state", "branch", "division", "district", "taluka");
    public static final Object[] STATUSES = {"active", "archived"};

    private static final String TEN_DIGITS = "^[0-9]{10}$";
    private static final String PHONE_MESSAGE = "मोबाईल नंबर १० अंकी असावा (Phone must be 10 digits)";

    public static final Map<String, Rule> CREATE = ordered(
        "level", Rule.string().required().oneOf(LEVELS.toArray()),
        "name", Rule.string().required().min(2).max(100),
        "parent_id", Rule.string().max(60),
        "address", Rule.string().max(300),
        "owner_member", Rule.string().max(30),
        "owner_phone", Rule.string().pattern(TEN_DIGITS, PHONE_MESSAGE));

    public static final Map<String, Rule> UPDATE = ordered(
        "name", Rule.string().min(2).max(100),
        "address", Rule.string().max(300),
        "status", Rule.string().oneOf(STATUSES));

    public static final Map<String, Rule> OWNER = ordered(
        "owner_member", Rule.string().max(30),
        "owner_phone", Rule.string().pattern(TEN_DIGITS, PHONE_MESSAGE));

    /**
     * A copy of the body with camelCase names mapped to snake_case, texts trimmed (empty ones dropped), the level and
     * status lower-cased, and the owner flattened: {@code owner: {member, phone}} (or a top-level {@code member} /
     * {@code phone}) becomes {@code owner_member} / {@code owner_phone}, the phone without spaces or dashes.
     */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        if (!copy.containsKey("parent_id") && copy.containsKey("parentId")) copy.put("parent_id", copy.get("parentId"));
        Object owner = copy.get("owner");
        if (owner instanceof Map<?, ?> o) {
            if (o.get("member") != null) copy.put("owner_member", o.get("member"));
            if (o.get("phone") != null) copy.put("owner_phone", o.get("phone"));
        }
        if (copy.get("member") != null && !copy.containsKey("owner_member")) copy.put("owner_member", copy.get("member"));
        if (copy.get("phone") != null && !copy.containsKey("owner_phone")) copy.put("owner_phone", copy.get("phone"));
        for (String key : copy.keySet().toArray(new String[0])) {
            if (copy.get(key) instanceof String s) {
                String trimmed = s.trim();
                if (trimmed.isEmpty()) copy.remove(key); else copy.put(key, trimmed);
            }
        }
        if (copy.get("owner_phone") instanceof String phone) copy.put("owner_phone", phone.replaceAll("[\\s-]", ""));
        for (String key : new String[] {"level", "status"}) {
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
