package com.connectmaratha.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.DynamicInsert;

/** A user report about a post, comment, member or business (table reports). Status and date come from DB defaults. */
@Entity
@Table(name = "reports")
@DynamicInsert
public class Report {

    @Id
    private String id;
    @Column(name = "reporter_id", nullable = false) private String reporterId;
    @Column(name = "target_type", nullable = false) private String targetType;
    @Column(name = "target_id", nullable = false) private String targetId;
    @Column(nullable = false) private String reason;
    private String details;
    private String status;

    protected Report() {}

    public Report(String id, String reporterId, String targetType, String targetId, String reason, String details) {
        this.id = id;
        this.reporterId = reporterId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.details = details;
    }

    public String getId() { return id; }
    public String getStatus() { return status; }
}
