package com.connectmaratha.api.dto;

import com.connectmaratha.api.entity.Member;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Members as the Node backend sends them: database column names (snake_case)
 * as keys, plus its normalizeMemberStrings / interests / ensureMemberReferral
 * clean-ups. Each endpoint picks the same columns its Node SELECT returned.
 */
public final class MemberJson {

    /** Strict like JSON.parse: "[1] extra" is not JSON. */
    private static final ObjectMapper JSON = new ObjectMapper()
        .enable(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

    private MemberJson() {}

    private static final Map<String, Function<Member, Object>> COLUMNS = new LinkedHashMap<>();
    static {
        COLUMNS.put("id", Member::getId);
        COLUMNS.put("name", Member::getName);
        COLUMNS.put("email", Member::getEmail);
        COLUMNS.put("phone", Member::getPhone);
        COLUMNS.put("avatar", Member::getAvatar);
        COLUMNS.put("photo", Member::getPhoto);
        COLUMNS.put("city", Member::getCity);
        COLUMNS.put("district", Member::getDistrict);
        COLUMNS.put("state", Member::getState);
        COLUMNS.put("country", Member::getCountry);
        COLUMNS.put("country_id", Member::getCountryId);
        COLUMNS.put("state_id", Member::getStateId);
        COLUMNS.put("district_id", Member::getDistrictId);
        COLUMNS.put("taluka_id", Member::getTalukaId);
        COLUMNS.put("village_id", Member::getVillageId);
        COLUMNS.put("taluka", Member::getTaluka);
        COLUMNS.put("village", Member::getVillage);
        COLUMNS.put("profession", Member::getProfession);
        COLUMNS.put("business", Member::getBusiness);
        COLUMNS.put("skills", Member::getSkills);
        COLUMNS.put("education", Member::getEducation);
        COLUMNS.put("interests", Member::getInterests);
        COLUMNS.put("about", Member::getAbout);
        COLUMNS.put("tier", Member::getTier);
        COLUMNS.put("role", Member::getRole);
        COLUMNS.put("status", Member::getStatus);
        COLUMNS.put("auth_provider", Member::getAuthProvider);
        COLUMNS.put("verified_mobile", Member::getVerifiedMobile);
        COLUMNS.put("verified_email", Member::getVerifiedEmail);
        COLUMNS.put("verified_profile", Member::getVerifiedProfile);
        COLUMNS.put("joined", Member::getJoined);
        COLUMNS.put("created_at", Member::getCreatedAt);
        COLUMNS.put("last_login_at", Member::getLastLoginAt);
        COLUMNS.put("reference_id", Member::getReferenceId);
        COLUMNS.put("referral_id", Member::getReferralId);
        COLUMNS.put("referred_by", Member::getReferredBy);
        COLUMNS.put("total_referrals", Member::getTotalReferrals);
    }

    /** "SELECT *" minus password_hash. */
    public static final List<String> ALL = List.copyOf(COLUMNS.keySet());

    /** The register endpoint's SELECT. */
    public static final List<String> REGISTERED = List.of(
        "id", "name", "email", "phone", "avatar", "city", "district", "state", "country",
        "country_id", "state_id", "district_id", "taluka_id", "village_id", "taluka", "village",
        "profession", "business", "education", "skills", "about", "tier", "role", "joined",
        "reference_id", "referral_id", "referred_by", "total_referrals");

    /** GET /api/auth/me's SELECT. */
    public static final List<String> ME = List.of(
        "id", "name", "email", "phone", "avatar", "city", "district", "state", "country", "profession",
        "business", "skills", "education", "interests", "about", "tier", "role",
        "verified_mobile", "verified_email", "verified_profile", "joined");

    /** GET /api/members (the directory list). */
    public static final List<String> LIST = List.of(
        "id", "name", "avatar", "photo", "city", "district", "state", "profession", "business",
        "skills", "education", "about", "tier", "role", "joined");

    /** GET /api/members/:id (contact details are removed for strangers). */
    public static final List<String> DETAIL = List.of(
        "id", "name", "email", "phone", "avatar", "photo", "city", "district", "state", "country",
        "profession", "business", "skills", "education", "interests", "about", "tier", "role",
        "verified_mobile", "verified_email", "verified_profile", "joined");

    /** PUT /api/members/:id reply. */
    public static final List<String> UPDATED = List.of(
        "id", "name", "email", "phone", "avatar", "city", "district", "profession", "business",
        "skills", "education", "about", "tier", "role");

    /** The chosen columns, with skills/about normalised like Node's normalizeMemberStrings. */
    public static Map<String, Object> of(Member m, List<String> columns) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (String c : columns) out.put(c, COLUMNS.get(c).apply(m));
        if (out.containsKey("skills")) out.put("skills", joinJsonArray((String) out.get("skills"), ", "));
        if (out.containsKey("about")) out.put("about", joinJsonArray((String) out.get("about"), "\n"));
        return out;
    }

    /** interests: JSON.parse(member.interests || '[]'), or [] when it isn't JSON. */
    public static void parseInterests(Map<String, Object> out) {
        Object raw = out.get("interests");
        String text = raw instanceof String s && !s.isEmpty() ? s : "[]";
        try {
            out.put("interests", JSON.readValue(text, Object.class));
        } catch (Exception e) {
            out.put("interests", new ArrayList<>());
        }
    }

    /**
     * Node's ensureMemberReferral (response only, not saved): fill missing codes
     * as REF-96K-&lt;digits of id&gt; and make total_referrals a number.
     */
    public static void ensureReferral(Map<String, Object> out) {
        Object ref = out.get("reference_id");
        Object code = out.get("referral_id");
        if (isBlank(ref) || isBlank(code)) {
            String digits = String.valueOf(out.get("id")).replaceAll("\\D", "");
            if (digits.isEmpty()) digits = String.valueOf(1000 + (int) (Math.random() * 9000));
            String generated = "REF-96K-" + digits;
            if (isBlank(ref)) out.put("reference_id", generated);
            if (isBlank(code)) out.put("referral_id", out.get("reference_id"));
        }
        Object total = out.get("total_referrals");
        out.put("total_referrals", total instanceof Number n ? n.intValue() : 0);
    }

    /** A JSON array stored as text ("[\"a\",\"b\"]") becomes "a, b"; other text stays; null becomes "". */
    static String joinJsonArray(String value, String separator) {
        if (value == null || value.isEmpty()) return "";
        try {
            Object parsed = JSON.readValue(value, Object.class);
            if (parsed instanceof List<?> list) {
                List<String> parts = new ArrayList<>();
                for (Object o : list) parts.add(o == null ? "" : String.valueOf(o));
                return String.join(separator, parts);
            }
        } catch (Exception ignored) {
            // Plain text, keep it.
        }
        return value;
    }

    private static boolean isBlank(Object v) {
        return v == null || (v instanceof String s && s.isEmpty());
    }
}
