package com.connectmaratha.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A comment under a post (table post_comments). */
@Entity
@Table(name = "post_comments")
public class PostComment {

    @Id
    private String id;
    @Column(name = "post_id") private String postId;
    @Column(name = "author_id") private String authorId;
    @Column(name = "author_name") private String authorName;
    @Column(name = "text", nullable = false) private String text;
    @Column(name = "created_at") private String createdAt;
    /** visible | hidden (set by moderators). */
    private String status;

    public String getId() { return id; }
    public String getPostId() { return postId; }
    public String getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public String getText() { return text; }
    public String getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
}
