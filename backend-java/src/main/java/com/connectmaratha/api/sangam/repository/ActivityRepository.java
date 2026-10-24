package com.connectmaratha.api.sangam.repository;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

/** Notifications to members and admin audit entries written when meetings change. */
@Repository
public class ActivityRepository {

    private final EntityManager em;

    public ActivityRepository(EntityManager em) {
        this.em = em;
    }

    public void notifyMember(String id, String memberId, String title, String message) {
        em.createNativeQuery("""
                INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
                VALUES (:id, :memberId, :title, :message, 'meeting', 0, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
            .setParameter("id", id).setParameter("memberId", memberId)
            .setParameter("title", title).setParameter("message", message)
            .executeUpdate();
    }

    public void audit(String id, String userId, String userName, String action, String details) {
        em.createNativeQuery("""
                INSERT INTO audit_logs (id, user_id, user_name, action, details, created_at)
                VALUES (:id, :userId, :userName, :action, :details, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
            .setParameter("id", id).setParameter("userId", userId).setParameter("userName", userName)
            .setParameter("action", action).setParameter("details", details)
            .executeUpdate();
    }
}
