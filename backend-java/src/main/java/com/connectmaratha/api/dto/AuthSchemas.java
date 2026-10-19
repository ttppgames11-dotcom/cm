package com.connectmaratha.api.dto;

import com.connectmaratha.api.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Map;

/** Port of backend/schemas/auth.schemas.js — same fields, rules and order. */
public final class AuthSchemas {

    private AuthSchemas() {}

    public static final Map<String, Rule> LOGIN = ordered(
        "identifier", Rule.string().min(1).max(120),
        "phone", Rule.string().max(30),
        "mobile", Rule.string().max(30),
        "email", Rule.string().max(120),
        "password", Rule.string().min(1).max(128));

    public static final Map<String, Rule> REGISTER = ordered(
        "name", Rule.string().required().min(2).max(100),
        "email", Rule.string().format("email").max(120),
        "phone", Rule.string().format("phone").min(10).max(15),
        "password", Rule.string().min(6).max(128),
        "city", Rule.string().max(100),
        "district", Rule.string().max(100),
        "state", Rule.string().max(100),
        "country", Rule.string().max(100),
        "countryId", Rule.string().max(50),
        "stateId", Rule.string().max(50),
        "districtId", Rule.string().max(50),
        "talukaId", Rule.string().max(50),
        "villageId", Rule.string().max(50),
        "taluka", Rule.string().max(100),
        "village", Rule.string().max(100),
        "profession", Rule.string().max(100),
        "business", Rule.string().max(150),
        "education", Rule.string().max(100),
        "skills", Rule.of("string", "array").max(500).maxItems(30).items(Rule.string().max(50)),
        "about", Rule.of("string", "array").max(1000),
        "reference_id", Rule.string().max(50),
        "referral_code", Rule.string().max(50),
        "referred_by", Rule.string().max(50),
        "referenceId", Rule.string().max(50),
        "referredBy", Rule.string().max(50),
        "referralCode", Rule.string().max(50),
        "mobile", Rule.string().max(30),
        "organization", Rule.string().max(150),
        "legalCompliance", Rule.object(),
        "interests", Rule.of("string", "array").max(200).maxItems(30),
        "goals", Rule.of("string", "array").max(500).maxItems(30),
        "kul", Rule.string().max(100),
        "gotra", Rule.string().max(100),
        "avatar", Rule.string().max(250),
        "dob", Rule.string().max(50),
        "gender", Rule.string().max(30),
        "bloodGroup", Rule.string().max(20),
        "blood_group", Rule.string().max(20));

    public static final Map<String, Rule> GOOGLE = ordered(
        "idToken", Rule.string().required().min(20).max(5000),
        "register", Rule.bool(),
        "legalCompliance", Rule.object());

    public static final Map<String, Rule> FORGOT_PASSWORD = ordered(
        "email", Rule.string().required().format("email").max(120));

    public static final Map<String, Rule> VERIFY_RESET_OTP = ordered(
        "email", Rule.string().required().format("email").max(120),
        "otp", Rule.string().required().format("otp"));

    public static final Map<String, Rule> RESET_PASSWORD = ordered(
        "email", Rule.string().required().format("email").max(120),
        "resetToken", Rule.string().required().min(20).max(1024),
        "newPassword", Rule.string().required().min(6).max(128));

    public static final Map<String, Rule> DELETE_ACCOUNT = ordered(
        "confirm", Rule.string().required().oneOf("DELETE"),
        "password", Rule.string().max(128),
        "idToken", Rule.string().max(2048));

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return java.util.Collections.unmodifiableMap(m);
    }
}
