package com.connectmaratha.api.sangam.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Map;

/** Validation rules for giving a referral (applied to the body after {@link #normalize}). Unknown fields are ignored. */
public final class ReferralSchemas {

    private ReferralSchemas() {}

    public static final Map<String, Rule> REFERRAL = ordered(
        "title", Rule.string().required().min(3).max(150),
        "clientName", Rule.string().required().max(100),
        "clientPhone", Rule.string().required().format("phone"),
        "clientEmail", Rule.string().format("email").max(120),
        "recipientId", Rule.string().required().max(20),
        "businessId", Rule.string().max(30),
        "category", Rule.string().max(100),
        "value", Rule.number().minValue(0),
        "notes", Rule.string().max(1000));

    /**
     * A copy of the body with the snake_case field names the older callers use mapped to the camelCase ones
     * (the camelCase key wins when both are sent) and spaces and dashes removed from a text phone.
     */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        alias(copy, "client_name", "clientName");
        alias(copy, "client_phone", "clientPhone");
        alias(copy, "client_email", "clientEmail");
        alias(copy, "recipient_id", "recipientId");
        alias(copy, "business_id", "businessId");
        if (copy.get("clientPhone") instanceof String phone) copy.put("clientPhone", phone.replaceAll("[\\s-]", ""));
        return copy;
    }

    private static void alias(Map<String, Object> body, String snake, String camel) {
        if (!body.containsKey(camel) && body.containsKey(snake)) body.put(camel, body.get(snake));
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
