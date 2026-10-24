package com.connectmaratha.api.enquiry.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Map;

/** Validation rules for B2B requirements. Unknown fields are rejected. */
public final class EnquirySchemas {

    private EnquirySchemas() {}

    public static final Map<String, Rule> ENQUIRY = ordered(
        "title", Rule.string().required().min(3).max(150),
        "category", Rule.string().required().max(100),
        "district", Rule.string().required().max(100),
        "city", Rule.string().max(100),
        "budget", Rule.string().max(50),
        "description", Rule.string().max(2000),
        "clientName", Rule.string().max(100),
        "phone", Rule.string().format("phone"));

    /** A copy in which a text phone has its spaces and dashes removed ("+91 98221-44550" → "+919822144550"). */
    public static Map<String, Object> normalizePhone(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        if (copy.get("phone") instanceof String phone) copy.put("phone", phone.replaceAll("[\\s-]", ""));
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
