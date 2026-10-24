package com.connectmaratha.api.enquiry.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.enquiry.dto.EnquiryJson;
import com.connectmaratha.api.enquiry.dto.EnquirySchemas;
import com.connectmaratha.api.enquiry.event.EnquiryCreated;
import com.connectmaratha.api.enquiry.event.EnquiryUpdated;
import com.connectmaratha.api.enquiry.repository.EnquiryRepository;
import com.connectmaratha.api.enquiry.repository.EnquiryRow;
import com.connectmaratha.api.enquiry.repository.QuoteRow;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
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
        if (clientName == null) clientName = nameOf(member);
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

    /** created: a new quote (201) rather than an update of the member's earlier one (200). */
    public record QuoteResult(boolean created, Map<String, Object> reply) {}

    @Transactional
    public QuoteResult quote(CurrentUser user, String enquiryId, Map<String, Object> body) {
        Map<String, Object> input = EnquirySchemas.normalizePhone(body);
        SchemaValidator.check(input, EnquirySchemas.QUOTE, false, null);
        EnquiryRow enquiry = repo.find(enquiryId, user.id()).orElseThrow(EnquiryService::notFound);
        if (user.id().equals(enquiry.memberId())) {
            throw ApiException.forbidden("OWN_ENQUIRY", "स्वतःच्या मागणीवर कोटेशन देता येत नाही (You cannot quote on your own requirement).");
        }
        if ("closed".equals(enquiry.status())) {
            throw new ApiException(HttpStatus.CONFLICT, "ENQUIRY_CLOSED", "ही मागणी बंद झाली आहे (This requirement is closed).");
        }
        limiter.checkQuote(user.id());

        String ownerName = text(input.get("ownerName"));
        if (ownerName == null) ownerName = nameOf(members.findById(user.id()).orElse(null));
        boolean created = repo.upsertQuote(new QuoteRow(Ids.millis("QT-", repo::quoteExists), enquiryId, user.id(),
            text(input.get("businessName")), ownerName, text(input.get("phone")), text(input.get("quoteAmount")),
            text(input.get("proposalNotes")), null, null));
        events.publishEvent(new EnquiryUpdated(enquiryId, enquiry.status(), repo.countQuotes(enquiryId)));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", created ? "कोटेशन पाठवले! (Quote sent.)" : "कोटेशन अपडेट केले! (Quote updated.)");
        out.put("updated", !created);
        out.put("quote", EnquiryJson.quote(repo.findQuote(enquiryId, user.id()).orElseThrow()));
        return new QuoteResult(created, out);
    }

    /** The member's own requirements, each with every quote received (business phones included). */
    public Map<String, Object> mine(CurrentUser user) {
        List<EnquiryRow> rows = repo.listByMember(user.id());
        Map<String, List<QuoteRow>> quotesByEnquiry = repo.quotesFor(rows.stream().map(EnquiryRow::id).toList()).stream()
            .collect(Collectors.groupingBy(QuoteRow::enquiryId, LinkedHashMap::new, Collectors.toList()));
        List<Map<String, Object>> list = rows.stream()
            .map(row -> EnquiryJson.mine(row, quotesByEnquiry.getOrDefault(row.id(), List.of())))
            .toList();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("enquiries", list);
        return out;
    }

    /** Close or reopen: the poster or an admin. Setting the status it already has is fine. */
    @Transactional
    public Map<String, Object> setStatus(CurrentUser user, String enquiryId, Map<String, Object> body) {
        SchemaValidator.check(body, EnquirySchemas.STATUS, false, null);
        EnquiryRow enquiry = repo.find(enquiryId, user.id()).orElseThrow(EnquiryService::notFound);
        if (!user.id().equals(enquiry.memberId()) && !Roles.isAdmin(user)) {
            throw ApiException.forbidden("NOT_OWNER",
                "फक्त मागणी करणारा सदस्य किंवा प्रशासक हे बदलू शकतात (Only the poster or an admin can change this).");
        }
        repo.setStatus(enquiryId, text(body.get("status")));
        EnquiryRow row = repo.find(enquiryId, user.id()).orElseThrow();
        events.publishEvent(new EnquiryUpdated(enquiryId, row.status(), row.quotesCount()));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("enquiry", EnquiryJson.card(row, user.id()));
        return out;
    }

    /** Every requirement with the poster's phone, for the admin dashboards. */
    public Map<String, Object> adminSummary(CurrentUser user) {
        if (!Roles.isAdmin(user)) throw ApiException.forbidden("ADMIN_ONLY", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        List<Map<String, Object>> list = repo.listAll().stream().map(EnquiryJson::admin).toList();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("enquiries", list);
        return out;
    }

    private static ApiException notFound() {
        return ApiException.notFound("ENQUIRY_NOT_FOUND", "ही मागणी आढळली नाही (Requirement not found).");
    }

    /** The member's name, or "सदस्य" when there is none. */
    private static String nameOf(Member member) {
        String name = member == null ? null : text(member.getName());
        return name == null ? DEFAULT_NAME : name;
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
