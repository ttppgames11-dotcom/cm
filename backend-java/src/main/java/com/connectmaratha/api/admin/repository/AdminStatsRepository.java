package com.connectmaratha.api.admin.repository;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

/** Whole-site counts for the admin dashboard (the Node /api/admin/metrics queries). */
@Repository
public class AdminStatsRepository {

    private final EntityManager em;

    public AdminStatsRepository(EntityManager em) {
        this.em = em;
    }

    /** COUNT(*) of one of the fixed tables below (never a table name from a request). */
    public long count(Table table) {
        Object n = em.createNativeQuery("SELECT COUNT(*) FROM " + table.sql).getSingleResult();
        return n == null ? 0 : ((Number) n).longValue();
    }

    /** [total collected, total donors] over all donation campaigns (nulls when there are none). */
    public Number[] campaignTotals() {
        Object[] row = (Object[]) em.createNativeQuery("SELECT SUM(collected), SUM(donors) FROM campaigns").getSingleResult();
        return new Number[] {(Number) row[0], (Number) row[1]};
    }

    public int setVerifiedProfile(String memberId, int value) {
        return em.createNativeQuery("UPDATE members SET verified_profile = :v WHERE id = :id")
            .setParameter("v", value).setParameter("id", memberId).executeUpdate();
    }

    public enum Table {
        MEMBERS("members"), BUSINESSES("businesses"), REFERRALS("referrals"), EVENTS("events"), POSTS("posts");

        final String sql;

        Table(String sql) {
            this.sql = sql;
        }
    }

}
