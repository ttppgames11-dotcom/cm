package com.connectmaratha.api.sangam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A one-to-one business meeting between two members (table meetings). */
@Entity
@Table(name = "meetings")
public class Meeting {

    @Id
    private String id;
    @Column(name = "requester_id") private String requesterId;
    @Column(name = "requester_name") private String requesterName;
    @Column(name = "recipient_id") private String recipientId;
    @Column(name = "recipient_name") private String recipientName;
    private String date;
    private String time;
    private String topic;
    private String status;
    private String notes;
    @Column(name = "created_at") private String createdAt;
    private String location;
    @Column(name = "updated_at") private String updatedAt;

    public String getId() { return id; }
    public String getRequesterId() { return requesterId; }
    public String getRequesterName() { return requesterName; }
    public String getRecipientId() { return recipientId; }
    public String getRecipientName() { return recipientName; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getTopic() { return topic; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
    public String getLocation() { return location; }
    public String getUpdatedAt() { return updatedAt; }
}
