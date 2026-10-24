package com.connectmaratha.api.portal.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DOCTOR and BLOOD_REQUEST: port of backend/schemas/general.schemas.js (same fields, rules and order;
 * unknown fields are rejected, as in Node).
 *
 * The other lists accepted ANY fields in Node, so a sender could set the server's own fields
 * (id, verified, createdAt...). Here only the fields the website forms send are kept; anything
 * else is dropped, and every field has a type and a size limit.
 */
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

    public static final Map<String, Rule> BLOOD_DONOR = ordered(
        "name", Rule.string().max(100),
        "group", Rule.string().max(10),
        "bloodGroup", Rule.string().max(10),
        "city", Rule.string().max(100),
        "district", Rule.string().max(100),
        "phone", Rule.string().max(20));

    public static final Map<String, Rule> MATRIMONY = ordered(
        "name", Rule.string().max(100),
        "gender", Rule.string().max(50),
        "age", Rule.of("string", "number").max(10),
        "height", Rule.string().max(30),
        "kul", Rule.string().max(100),
        "education", Rule.string().max(150),
        "profession", Rule.string().max(150),
        "income", Rule.of("string", "number").max(100),
        "city", Rule.string().max(100),
        "phone", Rule.string().max(20),
        "expectations", Rule.string().max(500));

    public static final Map<String, Rule> GRIEVANCE = ordered(
        "name", Rule.string().max(100),
        "mobile", Rule.string().max(20),
        "district", Rule.string().max(100),
        "targetLeader", Rule.string().max(150),
        "demandTopic", Rule.string().max(150),
        "title", Rule.string().max(200),
        "details", Rule.string().max(2000));

    public static final Map<String, Rule> VOLUNTEER = ordered(
        "name", Rule.string().max(100),
        "phone", Rule.string().max(20),
        "district", Rule.string().max(100),
        "field", Rule.string().max(150),
        "availability", Rule.of("string", "number").max(100));

    public static final Map<String, Rule> WOMEN_HELP = ordered(
        "name", Rule.string().max(100),
        "phone", Rule.string().max(20),
        "city", Rule.string().max(100),
        "subject", Rule.string().max(250),
        "category", Rule.string().max(100),
        "description", Rule.string().max(2000));

    public static final Map<String, Rule> LOAN = ordered(
        "name", Rule.string().max(100),
        "phone", Rule.string().max(20),
        "email", Rule.string().max(150),
        "city", Rule.string().max(100),
        "district", Rule.string().max(100),
        "loanType", Rule.string().max(100),
        "purpose", Rule.string().max(250),
        "amount", Rule.of("string", "number").max(30),
        "income", Rule.of("string", "number").max(100),
        "business", Rule.string().max(150));

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
