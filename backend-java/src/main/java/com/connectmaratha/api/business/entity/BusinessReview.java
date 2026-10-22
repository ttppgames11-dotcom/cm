package com.connectmaratha.api.business.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A review of a business (table business_reviews). */
@Entity
@Table(name = "business_reviews")
public class BusinessReview {

    @Id
    private String id;
    @Column(name = "business_id", nullable = false) private String businessId;
    @Column(name = "member_name") private String memberName;
    private Integer rating;
    private String text;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "member_id") private String memberId;

    public String getId() { return id; }
    public String getBusinessId() { return businessId; }
    public String getMemberName() { return memberName; }
    public Integer getRating() { return rating; }
    public String getText() { return text; }
    public String getCreatedAt() { return createdAt; }
    public String getMemberId() { return memberId; }
}
