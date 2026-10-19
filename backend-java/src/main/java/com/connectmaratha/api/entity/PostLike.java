package com.connectmaratha.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** One like by one member on one post (table post_likes). */
@Entity
@Table(name = "post_likes")
public class PostLike {

    @Id
    private String id;
    @Column(name = "post_id") private String postId;
    @Column(name = "member_id") private String memberId;

    protected PostLike() {}

    public PostLike(String id, String postId, String memberId) {
        this.id = id;
        this.postId = postId;
        this.memberId = memberId;
    }

    public String getId() { return id; }
    public String getPostId() { return postId; }
    public String getMemberId() { return memberId; }
}
