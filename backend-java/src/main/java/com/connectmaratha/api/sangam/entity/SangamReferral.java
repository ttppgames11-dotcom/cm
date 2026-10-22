package com.connectmaratha.api.sangam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A business lead passed from one member to another (table referrals). The table also has
 * the member-registration referral columns added by migration 004; they are mapped so the
 * replies contain every column, like Node's SELECT *.
 */
@Entity
@Table(name = "referrals")
public class SangamReferral {

    @Id
    private String id;
    @Column(nullable = false) private String title;
    private String category;
    @Column(name = "giver_id") private String giverId;
    @Column(name = "giver_name") private String giverName;
    @Column(name = "recipient_id") private String recipientId;
    @Column(name = "recipient_name") private String recipientName;
    @Column(name = "client_name") private String clientName;
    @Column(name = "client_phone") private String clientPhone;
    @Column(name = "client_email") private String clientEmail;
    private String status;
    private Double value;
    private String notes;
    @Column(name = "created_at") private String createdAt;
    private String type;
    @Column(name = "referral_id") private String referralId;
    @Column(name = "reference_id") private String referenceId;
    @Column(name = "referrer_id") private String referrerId;
    @Column(name = "referrer_referral_id") private String referrerReferralId;
    @Column(name = "referrer_name") private String referrerName;
    @Column(name = "referee_id") private String refereeId;
    @Column(name = "referee_referral_id") private String refereeReferralId;
    @Column(name = "referee_name") private String refereeName;
    @Column(name = "referee_phone") private String refereePhone;
    @Column(name = "referee_district") private String refereeDistrict;
    @Column(name = "referee_city") private String refereeCity;

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getGiverId() { return giverId; }
    public String getGiverName() { return giverName; }
    public String getRecipientId() { return recipientId; }
    public String getRecipientName() { return recipientName; }
    public String getClientName() { return clientName; }
    public String getClientPhone() { return clientPhone; }
    public String getClientEmail() { return clientEmail; }
    public String getStatus() { return status; }
    public Double getValue() { return value; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
    public String getType() { return type; }
    public String getReferralId() { return referralId; }
    public String getReferenceId() { return referenceId; }
    public String getReferrerId() { return referrerId; }
    public String getReferrerReferralId() { return referrerReferralId; }
    public String getReferrerName() { return referrerName; }
    public String getRefereeId() { return refereeId; }
    public String getRefereeReferralId() { return refereeReferralId; }
    public String getRefereeName() { return refereeName; }
    public String getRefereePhone() { return refereePhone; }
    public String getRefereeDistrict() { return refereeDistrict; }
    public String getRefereeCity() { return refereeCity; }
}
