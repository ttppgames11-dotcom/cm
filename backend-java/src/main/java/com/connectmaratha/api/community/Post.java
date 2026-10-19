package com.connectmaratha.api.community;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A community post (table posts). */
@Entity
@Table(name = "posts")
public class Post {

    @Id
    private String id;
    @Column(name = "author_id") private String authorId;
    @Column(name = "author_name") private String authorName;
    @Column(name = "author_avatar") private String authorAvatar;
    @Column(name = "group_id") private String groupId;
    @Column(name = "text", nullable = false) private String text;
    private String image;
    @Column(name = "likes_count") private Integer likesCount;
    @Column(name = "created_at") private String createdAt;
    /** visible | hidden (set by moderators). */
    private String status;

    public String getId() { return id; }
    public String getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public String getAuthorAvatar() { return authorAvatar; }
    public String getGroupId() { return groupId; }
    public String getText() { return text; }
    public String getImage() { return image; }
    public Integer getLikesCount() { return likesCount; }
    public String getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
}
