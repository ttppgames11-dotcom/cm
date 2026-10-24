package com.connectmaratha.api.business.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A business listing (table businesses). */
@Entity
@Table(name = "businesses")
public class Business {

    @Id
    private String id;
    @Column(nullable = false) private String name;
    private String owner;
    private String cat;
    private String city;
    private String district;
    private String photo;
    private String phone;
    private String whatsapp;
    private String website;
    private String hours;
    /** JSON array as text, e.g. ["Catering","Delivery"]. */
    private String services;
    private String offers;
    private Double rating;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "owner_id") private String ownerId;
    private String status;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getOwner() { return owner; }
    public String getCat() { return cat; }
    public String getCity() { return city; }
    public String getDistrict() { return district; }
    public String getPhoto() { return photo; }
    public String getPhone() { return phone; }
    public String getWhatsapp() { return whatsapp; }
    public String getWebsite() { return website; }
    public String getHours() { return hours; }
    public String getServices() { return services; }
    public String getOffers() { return offers; }
    public Double getRating() { return rating; }
    public String getCreatedAt() { return createdAt; }
    public String getOwnerId() { return ownerId; }
    public String getStatus() { return status; }
}
