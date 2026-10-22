package com.connectmaratha.api.community.repository;

import jakarta.persistence.EntityManager;
import java.util.Map;
import org.springframework.stereotype.Repository;

/** Checks that the thing being reported exists. Table names come from a fixed list, never from the request. */
@Repository
public class ReportTargetRepository {

    private static final Map<String, String> TABLES = Map.of(
        "post", "posts", "comment", "post_comments", "member", "members", "business", "businesses");

    private final EntityManager em;

    public ReportTargetRepository(EntityManager em) {
        this.em = em;
    }

    public static boolean isKnownType(String targetType) {
        return TABLES.containsKey(targetType);
    }

    public boolean exists(String targetType, String id) {
        String table = TABLES.get(targetType);
        if (table == null) return false;
        return !em.createNativeQuery("SELECT id FROM " + table + " WHERE id = :id")
            .setParameter("id", id).setMaxResults(1).getResultList().isEmpty();
    }
}
