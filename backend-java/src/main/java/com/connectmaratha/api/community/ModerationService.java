package com.connectmaratha.api.community;

import com.connectmaratha.api.member.Member;
import com.connectmaratha.api.member.MemberRepository;
import com.connectmaratha.api.schema.LazyTables;
import com.connectmaratha.api.util.Js;
import com.connectmaratha.api.web.ApiException;
import com.connectmaratha.api.web.CurrentUser;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Report and block, required by Google Play for apps with user-generated content. */
@Service
public class ModerationService {

    private static final List<String> REASONS = List.of(
        "spam", "abuse", "harassment", "hate", "sexual", "violence", "misinformation", "impersonation", "other");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    private final ReportRepository reports;
    private final ReportTargetRepository targets;
    private final BlockRepository blocks;
    private final MemberRepository members;
    private final LazyTables lazyTables;

    public ModerationService(ReportRepository reports, ReportTargetRepository targets, BlockRepository blocks,
                             MemberRepository members, LazyTables lazyTables) {
        this.reports = reports;
        this.targets = targets;
        this.blocks = blocks;
        this.members = members;
        this.lazyTables = lazyTables;
    }

    /** Saves a report; reporting the same thing twice while the first is open is accepted but not stored again. */
    @Transactional
    public Map<String, Object> report(CurrentUser user, Map<String, Object> body) {
        String targetType = Js.textOrEmpty(body.get("target_type"));
        String targetId = Js.textOrEmpty(body.get("target_id"));
        if (targetId.length() > 60) targetId = targetId.substring(0, 60);
        String reason = Js.textOrEmpty(body.get("reason"));
        if (!ReportTargetRepository.isKnownType(targetType) || targetId.isEmpty() || !REASONS.contains(reason)) {
            throw ApiException.badRequest("INVALID_REPORT", "अवैध तक्रार. कृपया कारण निवडा.");
        }
        if (targetType.equals("member") && targetId.equals(user.id())) {
            throw ApiException.badRequest("INVALID_REPORT", "आपण स्वतःची तक्रार करू शकत नाही.");
        }
        if (!targets.exists(targetType, targetId)) {
            throw ApiException.notFound("NOT_FOUND", "सामग्री सापडली नाही.");
        }

        lazyTables.ensureModeration();
        if (!reports.existsByReporterIdAndTargetTypeAndTargetIdAndStatus(user.id(), targetType, targetId, "open")) {
            String details = Js.textOrEmpty(body.get("details"));
            if (details.length() > 500) details = details.substring(0, 500);
            String id = "RPT-" + Long.toString(System.currentTimeMillis(), 36) + randomText(6);
            reports.saveAndFlush(new Report(id, user.id(), targetType, targetId, reason, details));
        }
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("message", "तक्रार नोंदवली गेली. आमची टीम ती तपासेल.");
        return reply;
    }

    @Transactional
    public Map<String, Object> listBlocked(CurrentUser user) {
        lazyTables.ensureModeration();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (BlockedMember b : blocks.listBlocked(user.id())) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", b.getId());
            row.put("name", b.getName());
            row.put("avatar", b.getAvatar());
            rows.add(row);
        }
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("count", rows.size());
        reply.put("blocks", rows);
        return reply;
    }

    @Transactional
    public Map<String, Object> block(CurrentUser user, String memberId) {
        if (memberId.equals(user.id())) {
            throw ApiException.badRequest("INVALID_BLOCK", "आपण स्वतःला ब्लॉक करू शकत नाही.");
        }
        Member target = members.findById(memberId)
            .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "सदस्य आढळला नाही."));
        lazyTables.ensureModeration();
        blocks.block(user.id(), target.getId());
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("message", "सदस्य ब्लॉक केला.");
        return reply;
    }

    @Transactional
    public Map<String, Object> unblock(CurrentUser user, String memberId) {
        lazyTables.ensureModeration();
        blocks.unblock(user.id(), memberId);
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        return reply;
    }

    private static String randomText(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        return sb.toString();
    }
}
