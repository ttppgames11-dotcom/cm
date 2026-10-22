package com.connectmaratha.api.directory.repository;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Tells a builder or dairy owner about a new enquiry or registration. */
@Repository
public class DirectoryNotificationRepository {

    private final EntityManager em;

    public DirectoryNotificationRepository(EntityManager em) {
        this.em = em;
    }

    /** Its own transaction, so a failed notification never undoes the enquiry itself. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyMember(String id, String memberId, String title, String message, String type) {
        em.createNativeQuery("""
                INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
                VALUES (:id, :memberId, :title, :message, :type, 0, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
            .setParameter("id", id).setParameter("memberId", memberId).setParameter("title", title)
            .setParameter("message", message).setParameter("type", type)
            .executeUpdate();
    }
}
