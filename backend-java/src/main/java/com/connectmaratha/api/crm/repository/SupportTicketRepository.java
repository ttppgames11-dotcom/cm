package com.connectmaratha.api.crm.repository;

import com.connectmaratha.api.crm.entity.SupportTicket;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {

    /** Every filter optional; requester limits a member to their own tickets. Newest first. */
    @Query(nativeQuery = true, value = """
        SELECT * FROM support_tickets
        WHERE (CAST(:requester AS TEXT) IS NULL OR requester_id = CAST(:requester AS TEXT))
          AND (CAST(:status AS TEXT) IS NULL OR status = CAST(:status AS TEXT))
          AND (CAST(:priority AS TEXT) IS NULL OR priority = CAST(:priority AS TEXT))
          AND (CAST(:category AS TEXT) IS NULL OR category = CAST(:category AS TEXT))
          AND (CAST(:district AS TEXT) IS NULL OR district = CAST(:district AS TEXT))
          AND (CAST(:taluka AS TEXT) IS NULL OR taluka = CAST(:taluka AS TEXT))
          AND (CAST(:division AS TEXT) IS NULL OR division = CAST(:division AS TEXT))
        ORDER BY created_at DESC""")
    List<SupportTicket> search(@Param("requester") String requester, @Param("status") String status,
                               @Param("priority") String priority, @Param("category") String category,
                               @Param("district") String district, @Param("taluka") String taluka,
                               @Param("division") String division);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO support_tickets (id, source, title, description, category, subcategory, priority,
          district, taluka, division, assigned_center_id, requester_id, requester_name, requester_phone,
          sla_hours, audit_trail, updated_at)
        VALUES (:id, 'helpdesk', :title, :description, :category, :subcategory, :priority,
          :district, :taluka, :division, :assignedCenterId, :requesterId, :requesterName, :requesterPhone,
          :slaHours, :auditTrail, :updatedAt)""")
    void insertTicket(@Param("id") String id, @Param("title") String title, @Param("description") String description,
                      @Param("category") String category, @Param("subcategory") String subcategory,
                      @Param("priority") String priority, @Param("district") String district,
                      @Param("taluka") String taluka, @Param("division") String division,
                      @Param("assignedCenterId") String assignedCenterId, @Param("requesterId") String requesterId,
                      @Param("requesterName") String requesterName, @Param("requesterPhone") String requesterPhone,
                      @Param("slaHours") int slaHours, @Param("auditTrail") String auditTrail,
                      @Param("updatedAt") String updatedAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        UPDATE support_tickets SET status = :status, current_owner_level = :level, audit_trail = :trail,
          updated_at = :updatedAt WHERE id = :id""")
    void updateTicket(@Param("id") String id, @Param("status") String status, @Param("level") String level,
                      @Param("trail") String trail, @Param("updatedAt") String updatedAt);
}
