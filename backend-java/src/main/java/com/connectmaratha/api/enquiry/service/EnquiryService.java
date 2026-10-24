package com.connectmaratha.api.enquiry.service;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.enquiry.dto.EnquiryJson;
import com.connectmaratha.api.enquiry.dto.EnquirySchemas;
import com.connectmaratha.api.enquiry.event.EnquiryCreated;
import com.connectmaratha.api.enquiry.repository.EnquiryRepository;
import com.connectmaratha.api.enquiry.repository.EnquiryRow;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * B2B opportunities (/leads): members post requirements and other members send quotes.
 * Not in the Node backend. Changes are announced as events after the transaction commits.
 */
@Service
public class EnquiryService {

    static final int LIST_LIMIT = 100;
    static final String DEFAULT_NAME = "सदस्य";

    private final EnquiryRepository repo;
    private final MemberRepository members;
    private final PostingLimiter limiter;
    private final ApplicationEventPublisher events;

    public EnquiryService(EnquiryRepository repo, MemberRepository members, PostingLimiter limiter,
                          ApplicationEventPublisher events) {
        this.repo = repo;
        this.members = members;
        this.limiter = limiter;
        this.events = events;
    }

    /** The public list: open ones first, newest first, at most 100. Empty or "सर्व" filters mean all. */
    public Map<String, Object> list(CurrentUser viewer, String district, String category) {
        String viewerId = viewer == null ? null : viewer.id();
        List<Map<String, Object>> cards = repo.list(filter(district), filter(category), viewerId, LIST_LIMIT).stream()
            .map(row -> EnquiryJson.card(row, viewerId))
            .toList();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", cards.size());
        out.put("enquiries", cards);
        return out;
    }

    @Transactional
    public Map<String, Object> create(CurrentUser user, Map<String, Object> body) {
        Map<String, Object> input = EnquirySchemas.normalizePhone(body);
        SchemaValidator.check(input, EnquirySchemas.ENQUIRY, false, null); // invalid requests do not count
        limiter.checkPost(user.id());

        Member member = members.findById(user.id()).orElse(null);
        String clientName = text(input.get("clientName"));
        if (clientName == null) clientName = member == null || text(member.getName()) == null ? DEFAULT_NAME : text(member.getName());
        String phone = text(input.get("phone"));
        if (phone == null && member != null) phone = text(member.getPhone());

        String id = Ids.millis("ENQ-", repo::exists);
        repo.insert(new EnquiryRow(id, user.id(), text(input.get("title")), text(input.get("description")),
            text(input.get("category")), text(input.get("city")), text(input.get("district")), text(input.get("budget")),
            clientName, phone, "open", null, null, null, 0, false));
        EnquiryRow row = repo.find(id, user.id()).orElseThrow();
        events.publishEvent(new EnquiryCreated(EnquiryJson.card(row, null)));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "तुमची मागणी प्रसिद्ध झाली! (Your requirement is live.)");
        out.put("enquiry", EnquiryJson.card(row, user.id()));
        return out;
    }

    /** Empty or "सर्व" (all) means no filter. */
    private static String filter(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() || v.equals("सर्व") ? null : v;
    }

    /** Trimmed text; empty becomes null. */
    private static String text(Object value) {
        String s = Js.textOrEmpty(value).trim();
        return s.isEmpty() ? null : s;
    }
}
