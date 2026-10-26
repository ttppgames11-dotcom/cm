package com.connectmaratha.api.enquiry.dto;

import com.connectmaratha.api.enquiry.repository.EnquiryRow;
import com.connectmaratha.api.enquiry.repository.QuoteRow;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
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

    /** A quote, as the poster sees it (with the business's phone). */
    public static Map<String, Object> quote(QuoteRow q) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", q.id());
        m.put("businessName", q.businessName());
        m.put("ownerName", q.ownerName());
        m.put("phone", q.phone());
        m.put("quoteAmount", q.quoteAmount());
        m.put("proposalNotes", q.proposalNotes());
        m.put("createdAt", iso(q.createdAt()));
        m.put("updatedAt", iso(q.updatedAt()));
        return m;
    }

    /** The poster's own requirement: the card plus their phone and every quote received. */
    public static Map<String, Object> mine(EnquiryRow r, List<QuoteRow> quotes) {
        Map<String, Object> m = card(r, r.memberId());
        m.put("phone", r.phone());
        m.put("quotes", quotes.stream().map(EnquiryJson::quote).toList());
        return m;
    }

    /** For admins: the card fields plus the poster's phone and member id. */
    public static Map<String, Object> admin(EnquiryRow r) {
        Map<String, Object> m = card(r, null);
        m.remove("isMine");
        m.remove("quotedByMe");
        m.put("phone", r.phone());
        m.put("memberId", r.memberId());
        return m;
    }

    /** The live "enquiry.updated" payload. */
    public static Map<String, Object> update(String id, String status, int quotesCount) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("status", status);
        m.put("quotesCount", quotesCount);
        return m;
    }

    static String iso(Instant t) {
        return t == null ? null : t.toString();
    }
}
