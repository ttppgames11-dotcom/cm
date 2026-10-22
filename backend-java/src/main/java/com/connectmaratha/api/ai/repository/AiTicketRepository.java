package com.connectmaratha.api.ai.repository;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

/** Saves a technical-support request from the AI assistant as a helpdesk ticket (table support_tickets). */
@Repository
public class AiTicketRepository {

    private final EntityManager em;

    public AiTicketRepository(EntityManager em) {
        this.em = em;
    }

    public void insert(String id, String title, String description, String requesterId, String name,
                       String mobile, String email, String language, String auditTrail, String timestamp) {
        em.createNativeQuery("""
                INSERT INTO support_tickets (id, source, title, description, category, priority, status,
                  requester_id, requester_name, requester_phone, requester_email, language, audit_trail, updated_at)
                VALUES (:id, 'ai_support', :title, :description, 'Technical Support', 'Medium', 'New',
                  :requesterId, :name, :mobile, :email, :language, :auditTrail, :timestamp)""")
            .setParameter("id", id).setParameter("title", title).setParameter("description", description)
            .setParameter("requesterId", requesterId).setParameter("name", name).setParameter("mobile", mobile)
            .setParameter("email", email).setParameter("language", language).setParameter("auditTrail", auditTrail)
            .setParameter("timestamp", timestamp).executeUpdate();
    }
}
