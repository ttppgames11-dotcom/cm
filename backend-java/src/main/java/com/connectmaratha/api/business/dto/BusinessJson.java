package com.connectmaratha.api.business.dto;

import com.connectmaratha.api.business.entity.Business;
import com.connectmaratha.api.business.entity.BusinessReview;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

/** Businesses and reviews as the Node backend sends them (all columns, services parsed from JSON text). */
public final class BusinessJson {

    private static final ObjectMapper JSON = new ObjectMapper().enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

    private BusinessJson() {}

    /** The business as Node sends it; for a logged-in viewer also isMine (absent for anonymous requests, so those replies stay as before). */
    public static Map<String, Object> business(Business b, String viewerId) {
        Map<String, Object> out = business(b);
        if (viewerId != null) out.put("isMine", viewerId.equals(b.getOwnerId()));
        return out;
    }

    public static Map<String, Object> business(Business b) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", b.getId());
        out.put("name", b.getName());
        out.put("owner", b.getOwner());
        out.put("cat", b.getCat());
        out.put("city", b.getCity());
        out.put("district", b.getDistrict());
        out.put("photo", b.getPhoto());
        out.put("phone", b.getPhone());
        out.put("whatsapp", b.getWhatsapp());
        out.put("website", b.getWebsite());
        out.put("hours", b.getHours());
        out.put("services", parseServices(b.getServices()));
        out.put("offers", b.getOffers());
        out.put("rating", b.getRating());
        out.put("created_at", b.getCreatedAt());
        out.put("owner_id", b.getOwnerId());
        out.put("status", b.getStatus());
        return out;
    }

    public static Map<String, Object> review(BusinessReview r) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", r.getId());
        out.put("business_id", r.getBusinessId());
        out.put("member_name", r.getMemberName());
        out.put("rating", r.getRating());
        out.put("text", r.getText());
        out.put("created_at", r.getCreatedAt());
        out.put("member_id", r.getMemberId());
        return out;
    }

    /** JSON.parse(services || '[]'), or [] when it is not JSON. */
    static Object parseServices(String raw) {
        try {
            return JSON.readValue(raw == null || raw.isEmpty() ? "[]" : raw, Object.class);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
