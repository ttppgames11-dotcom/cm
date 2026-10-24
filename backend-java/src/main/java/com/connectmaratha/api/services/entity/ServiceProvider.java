package com.connectmaratha.api.services.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A local service professional (legal, CA, electrician, ...) (table services). */
@Entity
@Table(name = "services")
public class ServiceProvider {

    @Id private String id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String category;
    private String location;
    private String phone;
    private String experience;
    private String pricing;
    private String description;
    private String status;
    @Column(name = "created_by") private String createdBy;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "updated_at") private String updatedAt;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getPhone() { return phone; }
    public String getExperience() { return experience; }
    public String getPricing() { return pricing; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getCreatedBy() { return createdBy; }
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
}
