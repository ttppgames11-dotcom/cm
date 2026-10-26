package com.connectmaratha.api.sangam.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import com.connectmaratha.api.sangam.dto.ReferralJson;
import com.connectmaratha.api.sangam.dto.ReferralSchemas;
import com.connectmaratha.api.sangam.entity.SangamReferral;
import com.connectmaratha.api.sangam.event.ReferralChanged;
import com.connectmaratha.api.sangam.repository.ReferralReceiverRepository;
import com.connectmaratha.api.sangam.repository.SangamReferralRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Member-to-member business referrals. Not the Node behaviour: a login is needed, the receiver must be a
 * member who owns a visible business, only the giver, the receiver and admins can see a referral, and
 * nothing is invented. Changes are announced as events after the transaction commits.
 */
@Service
public class ReferralService {

    static final String DEFAULT_NAME = "सदस्य";

    private final SangamReferralRepository referrals;
    private final ReferralReceiverRepository receivers;
    private final MemberRepository members;
    private final ReferralLimiter limiter;
    private final LazyTables tables;
    private final JdbcTemplate jdbc;
    private final ApplicationEventPublisher events;

    public ReferralService(SangamReferralRepository referrals, ReferralReceiverRepository receivers, MemberRepository members,
                           ReferralLimiter limiter, LazyTables tables, JdbcTemplate jdbc, ApplicationEventPublisher events) {
        this.referrals = referrals;
        this.receivers = receivers;
        this.members = members;
        this.limiter = limiter;
        this.tables = tables;
        this.jdbc = jdbc;
        this.events = events;
    }

    /** The logged-in member gives a referral to a member who owns a visible business. */
    @Transactional
    public Map<String, Object> give(CurrentUser user, Map<String, Object> body) {
        tables.ensureReferralColumns();
        Map<String, Object> input = ReferralSchemas.normalize(body);
        SchemaValidator.check(input, ReferralSchemas.REFERRAL, true, null); // invalid requests do not count
        limiter.check(user.id());

        String recipientId = text(input.get("recipientId"));
        if (recipientId.equals(user.id())) {
            throw ApiException.badRequest("SELF_REFERRAL", "स्वतःला संदर्भ देता येत नाही (You cannot refer to yourself).");
        }
        Member recipient = members.findById(recipientId).orElse(null);
        if (recipient == null || !receivers.ownsVisibleBusiness(recipientId)) {
            throw ApiException.badRequest("RECIPIENT_NOT_ELIGIBLE",
                "हा सदस्य संदर्भ स्वीकारू शकत नाही; त्याच्याकडे नोंदवलेला व्यवसाय असावा (This member has no listed business).");
        }
        String businessId = text(input.get("businessId"));
        if (!businessId.isEmpty() && !receivers.ownsVisibleBusiness(recipientId, businessId)) {
            throw ApiException.badRequest("BUSINESS_NOT_RECEIVERS",
                "हा व्यवसाय निवडलेल्या सदस्याचा नाही (That business does not belong to this member).");
        }

        Member giver = members.findById(user.id()).orElse(null);
        String giverName = giver == null || text(giver.getName()).isEmpty() ? DEFAULT_NAME : text(giver.getName());
        Object value = input.get("value");
        String id = Ids.twoDigit("REF-", referrals::existsById, 100, 1000);
        referrals.insertReferral(id, text(input.get("title")), orElse(text(input.get("category")), "सामान्य"),
            user.id(), giverName, recipientId, orElse(text(recipient.getName()), DEFAULT_NAME),
            text(input.get("clientName")), text(input.get("clientPhone")), text(input.get("clientEmail")),
            Js.truthy(value) ? Js.string(value) : "0", text(input.get("notes")));
        if (!businessId.isEmpty()) jdbc.update("UPDATE referrals SET business_id = ? WHERE id = ?", businessId, id);

        SangamReferral saved = referrals.findById(id).orElseThrow();
        events.publishEvent(new ReferralChanged(id, user.id(), recipientId, saved.getStatus()));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "नवीन संदर्भ यशस्वीरीत्या नोंदवला! (Referral given.)");
        out.put("referral", ReferralJson.referral(SangamService.referral(saved), saved, businessId.isEmpty() ? null : businessId, user.id()));
        return out;
    }

    /** Only the receiver or an admin moves a referral through the pipeline; value (when sent) is the deal value. */
    @Transactional
    public Map<String, Object> setStatus(CurrentUser user, String id, Map<String, Object> body) {
        tables.ensureReferralColumns();
        SchemaValidator.check(body, ReferralSchemas.STATUS, true, null);
        SangamReferral referral = referrals.findById(id).orElseThrow(() ->
            ApiException.notFound("REFERRAL_NOT_FOUND", "हा संदर्भ आढळला नाही (Referral not found)."));
        if (!user.id().equals(referral.getRecipientId()) && !Roles.isAdmin(user)) {
            throw ApiException.forbidden("NOT_RECEIVER",
                "फक्त संदर्भ स्वीकारणारा सदस्य किंवा प्रशासक स्थिती बदलू शकतात (Only the receiver or an admin can change the status).");
        }
        Object value = body.get("value");
        referrals.updateStatus(id, text(body.get("status")), value == null ? null : Js.string(value));
        SangamReferral saved = referrals.findById(id).orElseThrow();
        events.publishEvent(new ReferralChanged(id, saved.getGiverId(), saved.getRecipientId(), saved.getStatus()));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "स्थिती अद्ययावत केली! (Status updated.)");
        out.put("referral", ReferralJson.referral(SangamService.referral(saved), saved, businessIds(List.of(saved)).get(id), user.id()));
        return out;
    }

    /**
     * The caller's referrals (as giver or receiver), newest first. Admins get every referral, and only they may
     * narrow the list with memberIdFilter. status empty or "all" means every status.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser user, String memberIdFilter, String status) {
        tables.ensureReferralColumns();
        String statusFilter = Js.truthy(status) && !"all".equals(status) ? status : null;
        String member = Roles.isAdmin(user) ? Js.nullIfFalsy(memberIdFilter) : user.id();
        List<SangamReferral> rows = referrals.search(member, statusFilter);
        Map<String, String> businessIds = businessIds(rows);
        List<Map<String, Object>> list = new ArrayList<>();
        for (SangamReferral r : rows) {
            list.add(ReferralJson.referral(SangamService.referral(r), r, businessIds.get(r.getId()), user.id()));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("referrals", list);
        return out;
    }

    /** Members who own a visible business, with those businesses (the picker for "give a referral"). */
    public Map<String, Object> receivers(CurrentUser user) {
        List<ReferralReceiverRepository.Receiver> list = receivers.receivers(user.id(), 200);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("receivers", list);
        return out;
    }

    /** Totals for everyone to see: numbers only, no names. */
    public Map<String, Object> stats() {
        Object[] won = referrals.wonDeals().get(0);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("given", referrals.countAll());
        stats.put("won", won[0] == null ? 0 : ((Number) won[0]).longValue());
        stats.put("wonValue", won[1] == null ? 0.0 : ((Number) won[1]).doubleValue());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("stats", stats);
        return out;
    }

    /** business_id of each referral (read separately: the column is created on first use). */
    private Map<String, String> businessIds(List<SangamReferral> rows) {
        if (rows.isEmpty()) return Map.of();
        String placeholders = String.join(", ", Collections.nCopies(rows.size(), "?"));
        Map<String, String> out = new HashMap<>();
        jdbc.query("SELECT id, business_id FROM referrals WHERE id IN (" + placeholders + ")",
            rs -> { out.put(rs.getString("id"), rs.getString("business_id")); },
            rows.stream().map(SangamReferral::getId).toArray());
        return out;
    }

    /** Trimmed text; null or missing becomes "". */
    private static String text(Object value) {
        return value == null ? "" : Js.string(value).trim();
    }

    private static String orElse(String value, String fallback) {
        return value.isEmpty() ? fallback : value;
    }
}
