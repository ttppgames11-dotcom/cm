package com.connectmaratha.api.donation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** One donation (table donations). */
@Entity
@Table(name = "donations")
public class Donation {

    @Id
    private String id;
    @Column(name = "campaign_id") private String campaignId;
    @Column(name = "campaign_title") private String campaignTitle;
    @Column(name = "donor_name") private String donorName;
    @Column(name = "donor_id") private String donorId;
    @Column(nullable = false) private Double amount;
    @Column(name = "payment_method") private String paymentMethod;
    private String phone;
    @Column(name = "is_anonymous") private Integer isAnonymous;
    @Column(name = "tx_id") private String txId;
    @Column(name = "created_at") private String createdAt;

    public String getId() { return id; }
    public String getCampaignId() { return campaignId; }
    public String getCampaignTitle() { return campaignTitle; }
    public String getDonorName() { return donorName; }
    public String getDonorId() { return donorId; }
    public Double getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPhone() { return phone; }
    public Integer getIsAnonymous() { return isAnonymous; }
    public String getTxId() { return txId; }
    public String getCreatedAt() { return createdAt; }
}
