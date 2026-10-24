package com.connectmaratha.api.event.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A community event (table events). */
@Entity
@Table(name = "events")
public class Event {

    @Id
    private String id;
    @Column(nullable = false) private String title;
    private String category;
    private String date;
    private String time;
    private String venue;
    private String district;
    @Column(name = "\"desc\"") private String desc;
    private String organizer;
    private String banner;
    @Column(name = "rsvp_count") private Integer rsvpCount;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "creator_id") private String creatorId;

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getVenue() { return venue; }
    public String getDistrict() { return district; }
    public String getDesc() { return desc; }
    public String getOrganizer() { return organizer; }
    public String getBanner() { return banner; }
    public Integer getRsvpCount() { return rsvpCount; }
    public String getCreatedAt() { return createdAt; }
    public String getCreatorId() { return creatorId; }
}
