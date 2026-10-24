package com.connectmaratha.api.community.dto;

import com.connectmaratha.api.community.entity.Post;
import com.connectmaratha.api.community.entity.PostComment;

import com.connectmaratha.api.member.entity.Member;
import java.util.LinkedHashMap;
import java.util.Map;

/** Posts and comments as the Node backend sends them (database column names as keys). */
public final class PostJson {

    private PostJson() {}

    /** author is the posting member (for the photo), or null when that member no longer exists. */
    public static Map<String, Object> post(Post p, Member author) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", p.getId());
        out.put("author_id", p.getAuthorId());
        out.put("author_name", p.getAuthorName());
        out.put("author_avatar", p.getAuthorAvatar());
        out.put("group_id", p.getGroupId());
        out.put("text", p.getText());
        out.put("image", p.getImage());
        out.put("likes_count", p.getLikesCount());
        out.put("created_at", p.getCreatedAt());
        out.put("status", p.getStatus());
        out.put("author_photo", author == null ? null : author.getPhoto());
        return out;
    }

    /** The comment author's current name wins over the name saved with the comment. */
    public static Map<String, Object> comment(PostComment c, Member author) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", c.getId());
        out.put("post_id", c.getPostId());
        out.put("author_id", c.getAuthorId());
        String liveName = author == null ? null : author.getName();
        out.put("author_name", liveName != null ? liveName : c.getAuthorName());
        out.put("text", c.getText());
        out.put("created_at", c.getCreatedAt());
        out.put("status", c.getStatus());
        out.put("author_photo", author == null ? null : author.getPhoto());
        return out;
    }
}
