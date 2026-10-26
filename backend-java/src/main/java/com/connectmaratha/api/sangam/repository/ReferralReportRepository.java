package com.connectmaratha.api.sangam.repository;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Read-only totals over the referrals table for the admin report. days limits the period to referrals
 * given in the last N days (by created_at); null means no limit. Won = status Won or the old Deal Won.
 */
@Repository
public class ReferralReportRepository {

    public record Summary(long given, long won, long lost, double wonValue) {}

    /** status as stored; a missing status is "". */
    public record StatusCount(String status, long count) {}

    /** total = referrals given (for a giver) or received (for a receiver). */
    public record TopMember(String memberId, String name, long total, long won, double wonValue) {}

    private static final String WON = "r.status IN ('Won', 'Deal Won')";

    /** The period condition; the days value is bound twice (null test and the date). */
    private static final String PERIOD = "(CAST(? AS INTEGER) IS NULL OR r.created_at >= "
        + "to_char(now() - make_interval(days => CAST(? AS INTEGER)), 'YYYY-MM-DD HH24:MI:SS'))";

    private final JdbcTemplate jdbc;

    public ReferralReportRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Summary summary(Integer days) {
        return jdbc.queryForObject("SELECT COUNT(*), COUNT(*) FILTER (WHERE " + WON + "), COUNT(*) FILTER (WHERE r.status = 'Lost'), "
                + "COALESCE(SUM(r.value) FILTER (WHERE " + WON + "), 0) FROM referrals r WHERE " + PERIOD,
            (rs, row) -> new Summary(rs.getLong(1), rs.getLong(2), rs.getLong(3), rs.getDouble(4)), days, days);
    }

    public List<StatusCount> statusCounts(Integer days) {
        return jdbc.query("SELECT COALESCE(r.status, '') AS status, COUNT(*) FROM referrals r WHERE " + PERIOD + " GROUP BY r.status",
            (rs, row) -> new StatusCount(rs.getString(1), rs.getLong(2)), days, days);
    }

    public List<TopMember> topGivers(Integer days, int limit) {
        return top("giver_id", "giver_name", days, limit);
    }

    public List<TopMember> topReceivers(Integer days, int limit) {
        return top("recipient_id", "recipient_name", days, limit);
    }

    /** Both top lists are the same query over the giver or the recipient columns (fixed names, never from a request). */
    private List<TopMember> top(String idColumn, String nameColumn, Integer days, int limit) {
        return jdbc.query("SELECT r." + idColumn + " AS member_id, COALESCE(m.name, MAX(r." + nameColumn + ")) AS name, COUNT(*) AS total, "
                + "COUNT(*) FILTER (WHERE " + WON + ") AS won, COALESCE(SUM(r.value) FILTER (WHERE " + WON + "), 0) AS won_value "
                + "FROM referrals r LEFT JOIN members m ON m.id = r." + idColumn + " "
                + "WHERE " + PERIOD + " AND r." + idColumn + " IS NOT NULL "
                + "GROUP BY r." + idColumn + ", m.name "
                + "ORDER BY won_value DESC, won DESC, total DESC, member_id ASC LIMIT ?",
            (rs, row) -> new TopMember(rs.getString("member_id"), rs.getString("name"), rs.getLong("total"), rs.getLong("won"),
                rs.getDouble("won_value")),
            days, days, limit);
    }
}
