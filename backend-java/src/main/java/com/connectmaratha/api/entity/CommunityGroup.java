package com.connectmaratha.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A community group (table groups). */
@Entity
@Table(name = "groups")
public class CommunityGroup {

    @Id
    private String id;
    @Column(nullable = false) private String name;
    private String type;
    private String category;
    private String district;
    @Column(name = "\"desc\"") private String desc;
    private String cover;
    @Column(name = "members_count") private Integer membersCount;
    @Column(name = "created_at") private String createdAt;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getCategory() { return category; }
    public String getDistrict() { return district; }
    public String getDesc() { return desc; }
    public String getCover() { return cover; }
    public Integer getMembersCount() { return membersCount; }
    public String getCreatedAt() { return createdAt; }
}
