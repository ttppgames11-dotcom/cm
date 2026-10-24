package com.connectmaratha.api.media.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A member-uploaded picture (table media). The image bytes live in the database, so backups include them. */
@Entity
@Table(name = "media")
public class Media {

    @Id
    private String id;
    @Column(name = "owner_id", nullable = false) private String ownerId;
    @Column(nullable = false) private String kind;
    @Column(nullable = false) private String mime;
    @Column(nullable = false, columnDefinition = "bytea") private byte[] bytes;
    @Column(nullable = false) private Integer size;
    @Column(name = "created_at") private String createdAt;

    public String getId() { return id; }
    public String getOwnerId() { return ownerId; }
    public String getKind() { return kind; }
    public String getMime() { return mime; }
    public byte[] getBytes() { return bytes; }
    public Integer getSize() { return size; }
    public String getCreatedAt() { return createdAt; }
}
