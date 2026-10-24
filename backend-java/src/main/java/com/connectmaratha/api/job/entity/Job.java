package com.connectmaratha.api.job.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A job opening (table jobs). */
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    private String id;
    @Column(nullable = false) private String title;
    private String company;
    private String district;
    private String category;
    private String salary;
    @Column(name = "job_type") private String jobType;
    private String experience;
    @Column(name = "\"desc\"") private String desc;
    @Column(name = "contact_email") private String contactEmail;
    private String phone;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "poster_id") private String posterId;

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCompany() { return company; }
    public String getDistrict() { return district; }
    public String getCategory() { return category; }
    public String getSalary() { return salary; }
    public String getJobType() { return jobType; }
    public String getExperience() { return experience; }
    public String getDesc() { return desc; }
    public String getContactEmail() { return contactEmail; }
    public String getPhone() { return phone; }
    public String getCreatedAt() { return createdAt; }
    public String getPosterId() { return posterId; }
}
