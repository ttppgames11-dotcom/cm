package com.connectmaratha.api.portal.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Map;

/** Port of backend/schemas/general.schemas.js — same fields, rules and order. */
public final class PortalSchemas {

    private PortalSchemas() {}

    public static final Map<String, Rule> DOCTOR = ordered(
        "name", Rule.string().required().min(2).max(100),
        "specialty", Rule.string().required().min(2).max(100),
        "phone", Rule.string().format("phone").min(10).max(15),
        "hospital", Rule.string().max(150),
        "city", Rule.string().max(100),
        "district", Rule.string().max(100),
        "degree", Rule.string().max(100),
        "experience", Rule.string().max(50),
        "address", Rule.string().max(250));

    public static final Map<String, Rule> BLOOD_REQUEST = ordered(
        "patientName", Rule.string().required().min(2).max(100),
        "bloodGroup", Rule.string().required().oneOf("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
        "units", Rule.number().integer().minValue(1).maxValue(20),
        "hospital", Rule.string().required().min(2).max(150),
        "city", Rule.string().required().min(2).max(100),
        "district", Rule.string().required().min(2).max(100),
        "contactPhone", Rule.string().required().format("phone").min(10).max(15),
        "urgency", Rule.string().max(50),
        "date", Rule.string().max(50),
        "notes", Rule.string().max(500));

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
