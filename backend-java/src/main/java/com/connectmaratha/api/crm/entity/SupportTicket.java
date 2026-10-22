package com.connectmaratha.api.crm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A helpdesk ticket (table support_tickets); audit_trail is a JSON list kept as text. */
@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id private String id;
    private String source;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private String description;
    private String category;
    private String subcategory;
    private String priority;
    private String district;
    private String taluka;
    private String division;
    @Column(name = "assigned_center_id") private String assignedCenterId;
    @Column(name = "current_owner_level") private String currentOwnerLevel;
    private String status;
    @Column(name = "requester_id") private String requesterId;
    @Column(name = "requester_name") private String requesterName;
    @Column(name = "requester_phone") private String requesterPhone;
    @Column(name = "requester_email") private String requesterEmail;
    private String language;
    @Column(name = "sla_hours") private Integer slaHours;
    @Column(name = "audit_trail") private String auditTrail;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "updated_at") private String updatedAt;

    public String getId() { return id; }
    public String getSource() { return source; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getPriority() { return priority; }
    public String getDistrict() { return district; }
    public String getTaluka() { return taluka; }
    public String getDivision() { return division; }
    public String getAssignedCenterId() { return assignedCenterId; }
    public String getCurrentOwnerLevel() { return currentOwnerLevel; }
    public String getStatus() { return status; }
    public String getRequesterId() { return requesterId; }
    public String getRequesterName() { return requesterName; }
    public String getRequesterPhone() { return requesterPhone; }
    public String getRequesterEmail() { return requesterEmail; }
    public String getLanguage() { return language; }
    public Integer getSlaHours() { return slaHours; }
    public String getAuditTrail() { return auditTrail; }
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
}
