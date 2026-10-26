package com.connectmaratha.api.sangam.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.sangam.repository.ReferralReportRepository;
import com.connectmaratha.api.sangam.repository.ReferralReportRepository.StatusCount;
import com.connectmaratha.api.sangam.repository.ReferralReportRepository.Summary;
import com.connectmaratha.api.sangam.repository.ReferralReportRepository.TopMember;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The admin referral report: headline numbers, stage counts and the top referrers and receivers.
 * Only numbers and member names; nothing about the customers.
 */
@Service
public class ReferralReportService {

    static final List<String> PIPELINE = List.of("New", "Contacted", "Qualified", "Proposal", "Won", "Lost");
    static final int TOP = 10;

    private final ReferralReportRepository repo;

    public ReferralReportService(ReferralReportRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> report(CurrentUser user, String period) {
        if (!Roles.isAdmin(user)) throw ApiException.forbidden("ADMIN_ONLY", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        Integer days = daysOf(period);

        Summary s = repo.summary(days);
        long open = s.given() - s.won() - s.lost();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("given", s.given());
        summary.put("won", s.won());
        summary.put("lost", s.lost());
        summary.put("open", open);
        summary.put("winRate", winRate(s.won(), s.lost()));
        summary.put("wonValue", s.wonValue());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("period", period == null || period.isBlank() ? "all" : period);
        out.put("summary", summary);
        out.put("byStatus", byStatus(repo.statusCounts(days)));
        out.put("topReferrers", members(repo.topGivers(days, TOP), "given"));
        out.put("topReceivers", members(repo.topReceivers(days, TOP), "received"));
        return out;
    }

    /** 30d and 90d limit the period; all (or nothing) does not. Anything else is a 400. */
    public static Integer daysOf(String period) {
        if (period == null || period.isBlank() || "all".equals(period)) return null;
        if ("30d".equals(period)) return 30;
        if ("90d".equals(period)) return 90;
        throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "अवैध कालावधी (Invalid period).");
    }

    /** Won ÷ (won + lost) × 100 with one decimal; null while nothing has closed. */
    static Double winRate(long won, long lost) {
        long closed = won + lost;
        if (closed == 0) return null;
        return Math.round(won * 1000.0 / closed) / 10.0;
    }

    /** The six pipeline words in order (0 when none, Deal Won counted as Won), then Other for every other word. */
    static List<Map<String, Object>> byStatus(List<StatusCount> counts) {
        Map<String, Long> totals = new LinkedHashMap<>();
        for (String word : PIPELINE) totals.put(word, 0L);
        totals.put("Other", 0L);
        for (StatusCount c : counts) {
            String word = "Deal Won".equals(c.status()) ? "Won" : c.status();
            String key = PIPELINE.contains(word) ? word : "Other";
            totals.merge(key, c.count(), Long::sum);
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        totals.forEach((status, count) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("status", status);
            row.put("count", count);
            rows.add(row);
        });
        return rows;
    }

    /** totalKey is "given" for referrers and "received" for receivers. */
    static List<Map<String, Object>> members(List<TopMember> list, String totalKey) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (TopMember m : list) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("memberId", m.memberId());
            row.put("name", m.name());
            row.put(totalKey, m.total());
            row.put("won", m.won());
            row.put("wonValue", m.wonValue());
            rows.add(row);
        }
        return rows;
    }
}
