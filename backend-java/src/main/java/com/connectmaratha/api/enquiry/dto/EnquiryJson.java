package com.connectmaratha.api.enquiry.dto;

import com.connectmaratha.api.enquiry.repository.EnquiryRow;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** The reply shapes for B2B requirements. Public shapes never contain a phone number or member id. */
public final class EnquiryJson {

    private EnquiryJson() {}

    /** The public card. viewerId is the logged-in member (null when nobody is). */
    public static Map<String, Object> card(EnquiryRow r, String viewerId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.id());
        m.put("title", r.title());
        m.put("description", r.description());
        m.put("category", r.category());
        m.put("city", r.city());
        m.put("district", r.district());
        m.put("budget", r.budget());
        m.put("clientName", r.clientName());
        m.put("status", r.status());
        m.put("quotesCount", r.quotesCount());
        m.put("createdAt", iso(r.createdAt()));
        m.put("isMine", viewerId != null && viewerId.equals(r.memberId()));
        m.put("quotedByMe", r.quotedByMe());
        return m;
    }

    static String iso(Instant t) {
        return t == null ? null : t.toString();
    }
}
