package com.connectmaratha.api.sangam.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Who can receive a referral: members who own at least one visible business
 * (businesses.owner_id = the member, status not "hidden").
 */
@Repository
public class ReferralReceiverRepository {

    public record Biz(String id, String name) {}

    public record Receiver(String id, String name, List<Biz> businesses) {}

    private static final String VISIBLE = "(b.status IS NULL OR b.status <> 'hidden')";

    private final JdbcTemplate jdbc;

    public ReferralReceiverRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Owners of visible businesses with those businesses, sorted by name; the excluded member (the caller) is left out. */
    public List<Receiver> receivers(String excludeMemberId, int limit) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT m.id AS member_id, m.name AS member_name, b.id AS business_id, b.name AS business_name "
                + "FROM members m JOIN businesses b ON b.owner_id = m.id "
                + "WHERE " + VISIBLE + " AND m.id <> ? "
                + "ORDER BY m.name, m.id, b.name, b.id", excludeMemberId == null ? "" : excludeMemberId);
        Map<String, Receiver> byMember = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String id = String.valueOf(row.get("member_id"));
            Receiver receiver = byMember.get(id);
            if (receiver == null) {
                if (byMember.size() >= limit) continue;
                receiver = new Receiver(id, (String) row.get("member_name"), new ArrayList<>());
                byMember.put(id, receiver);
            }
            receiver.businesses().add(new Biz((String) row.get("business_id"), (String) row.get("business_name")));
        }
        return new ArrayList<>(byMember.values());
    }

    public boolean ownsVisibleBusiness(String memberId) {
        return exists("SELECT EXISTS (SELECT 1 FROM businesses b WHERE b.owner_id = ? AND " + VISIBLE + ")", memberId);
    }

    /** True when that business is visible and the member's own. */
    public boolean ownsVisibleBusiness(String memberId, String businessId) {
        return exists("SELECT EXISTS (SELECT 1 FROM businesses b WHERE b.owner_id = ? AND b.id = ? AND " + VISIBLE + ")", memberId, businessId);
    }

    private boolean exists(String sql, Object... args) {
        return Boolean.TRUE.equals(jdbc.queryForObject(sql, Boolean.class, args));
    }
}
