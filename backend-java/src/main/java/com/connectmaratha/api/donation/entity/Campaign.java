package com.connectmaratha.api.donation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A fundraising campaign (table campaigns). */
@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    private String id;
    private String cat;
    @Column(nullable = false) private String title;
    private String icon;
    private Double target;
    private Double collected;
    private Integer donors;
    private String cover;
    @Column(name = "\"desc\"") private String desc;
    private String expenses;
    private Integer active;
    @Column(name = "created_at") private String createdAt;

    public String getId() { return id; }
    public String getCat() { return cat; }
    public String getTitle() { return title; }
    public String getIcon() { return icon; }
    public Double getTarget() { return target; }
    public Double getCollected() { return collected; }
    public Integer getDonors() { return donors; }
    public String getCover() { return cover; }
    public String getDesc() { return desc; }
    public String getExpenses() { return expenses; }
    public Integer getActive() { return active; }
    public String getCreatedAt() { return createdAt; }
}
