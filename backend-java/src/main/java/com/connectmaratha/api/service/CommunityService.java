package com.connectmaratha.api.service;

import com.connectmaratha.api.dto.PostJson;
import com.connectmaratha.api.entity.CommunityGroup;
import com.connectmaratha.api.entity.Member;
import com.connectmaratha.api.entity.Post;
import com.connectmaratha.api.entity.PostComment;
import com.connectmaratha.api.entity.PostLike;
import com.connectmaratha.api.repository.CommunityGroupRepository;
import com.connectmaratha.api.repository.MemberRepository;
import com.connectmaratha.api.repository.PostCommentRepository;
import com.connectmaratha.api.repository.PostLikeRepository;
import com.connectmaratha.api.repository.PostRepository;
import com.connectmaratha.api.schema.LazyTables;
import com.connectmaratha.api.util.Js;
import com.connectmaratha.api.web.ApiException;
import com.connectmaratha.api.web.CurrentUser;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Posts, likes, comments and groups (backend/routes/community.routes.js, minus report/block). */
@Service
public class CommunityService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    private final PostRepository posts;
    private final PostLikeRepository likes;
    private final PostCommentRepository comments;
    private final CommunityGroupRepository groups;
    private final MemberRepository members;
    private final LazyTables lazyTables;

    public CommunityService(PostRepository posts, PostLikeRepository likes, PostCommentRepository comments,
                            CommunityGroupRepository groups, MemberRepository members, LazyTables lazyTables) {
        this.posts = posts;
        this.likes = likes;
        this.comments = comments;
        this.groups = groups;
        this.members = members;
        this.lazyTables = lazyTables;
    }

    /** The feed. A logged-in viewer does not see posts or comments by members they blocked. */
    @Transactional
    public Map<String, Object> feed(CurrentUser viewer, String groupId) {
        String viewerId = viewer == null ? null : viewer.id();
        if (viewerId != null) lazyTables.ensureModeration();

        List<Post> found = posts.findFeed(viewerId, Js.nullIfFalsy(groupId));
        Set<String> liked = viewerId == null ? Set.of() : likes.likedPostIds(viewerId);

        List<Map<String, Object>> out = new ArrayList<>();
        for (Post p : found) {
            Map<String, Object> json = PostJson.post(p, members.findById(String.valueOf(p.getAuthorId())).orElse(null));
            json.put("is_liked", viewerId != null && liked.contains(p.getId()) ? 1 : 0);
            json.put("comments", commentsJson(comments.findForPost(p.getId(), viewerId)));
            out.add(json);
        }
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("count", out.size());
        reply.put("posts", out);
        return reply;
    }

    @Transactional
    public Map<String, Object> createPost(CurrentUser user, Map<String, Object> body) {
        if (!Js.truthy(body.get("text"))) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "मजकूर आवश्यक आहे.");
        }
        // The author is always the logged-in member, never a client-sent author_id.
        String authorName = Js.orElse(user.name(), "समाज सदस्य");
        String authorAvatar = Js.orElse(body.get("author_avatar"), "👤");
        Member author = members.findById(user.id()).orElse(null);
        if (author != null) {
            authorName = Js.orElse(author.getName(), authorName);
            authorAvatar = Js.orElse(author.getAvatar(), authorAvatar);
        }

        // 'image' (/media/xxx) or 'image_id' (xxx)
        String image = Js.nullIfFalsy(body.get("image"));
        if (Js.truthy(body.get("image_id"))) {
            String raw = String.valueOf(body.get("image_id"));
            image = raw.startsWith("/media/") ? raw : "/media/" + raw;
        }

        String id = freshId("P-", posts::existsById);
        posts.insertPost(id, user.id(), authorName, authorAvatar, Js.orElse(body.get("group_id"), "G09"),
            String.valueOf(body.get("text")), image);

        Post created = posts.findById(id).orElseThrow();
        Map<String, Object> json = PostJson.post(created, author);
        json.put("comments", new ArrayList<>());
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("message", "पोस्ट प्रसिद्ध झाली!");
        reply.put("post", json);
        return reply;
    }

    /** Like if not liked yet, otherwise take the like back. */
    @Transactional
    public Map<String, Object> toggleLike(CurrentUser user, String postId) {
        if (!posts.existsById(postId)) {
            throw ApiException.plain(HttpStatus.NOT_FOUND, "पोस्ट आढळली नाही.");
        }
        boolean liked;
        if (likes.existsByPostIdAndMemberId(postId, user.id())) {
            likes.deleteLike(postId, user.id());
            posts.decrementLikes(postId);
            liked = false;
        } else {
            String likeId = "PL-" + System.currentTimeMillis() + "-" + randomText(5);
            likes.saveAndFlush(new PostLike(likeId, postId, user.id()));
            posts.incrementLikes(postId);
            liked = true;
        }
        Integer count = posts.likesCountOf(postId);
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("liked", liked);
        reply.put("likes_count", count == null ? 0 : count);
        return reply;
    }

    @Transactional
    public Map<String, Object> addComment(CurrentUser user, String postId, Map<String, Object> body) {
        Object text = body.get("text");
        if (!Js.truthy(text) || String.valueOf(text).trim().isEmpty()) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "प्रतिक्रिया आवश्यक आहे.");
        }
        String authorName = Js.orElse(user.name(), "समाज सदस्य");
        Member author = members.findById(user.id()).orElse(null);
        if (author != null && Js.truthy(author.getName())) authorName = author.getName();

        comments.insertComment(freshId("CMM-", comments::existsById), postId, user.id(), authorName,
            String.valueOf(text).trim());

        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("message", "प्रतिक्रिया जोडली!");
        reply.put("comments", commentsJson(comments.findForPost(postId, null)));
        return reply;
    }

    public Map<String, Object> groups(String type, String district) {
        String districtFilter = Js.truthy(district) && !"सर्व".equals(district) ? district : null;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (CommunityGroup g : groups.findFiltered(Js.nullIfFalsy(type), districtFilter)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", g.getId());
            row.put("name", g.getName());
            row.put("type", g.getType());
            row.put("category", g.getCategory());
            row.put("district", g.getDistrict());
            row.put("desc", g.getDesc());
            row.put("cover", g.getCover());
            row.put("members_count", g.getMembersCount());
            row.put("created_at", g.getCreatedAt());
            rows.add(row);
        }
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("count", rows.size());
        reply.put("groups", rows);
        return reply;
    }

    @Transactional
    public Map<String, Object> joinGroup(String groupId) {
        groups.incrementMembers(groupId);
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("message", "गटात यशस्वीरित्या सामील झालात!");
        return reply;
    }

    private List<Map<String, Object>> commentsJson(List<PostComment> list) {
        Map<String, Member> authors = new HashMap<>();
        Set<String> ids = new HashSet<>();
        for (PostComment c : list) if (c.getAuthorId() != null) ids.add(c.getAuthorId());
        for (Member m : members.findAllById(ids)) authors.put(m.getId(), m);
        List<Map<String, Object>> out = new ArrayList<>();
        for (PostComment c : list) out.add(PostJson.comment(c, authors.get(c.getAuthorId())));
        return out;
    }

    /** prefix + milliseconds, like Node; if two arrive in the same millisecond the second moves on by one. */
    private static String freshId(String prefix, Predicate<String> taken) {
        long now = System.currentTimeMillis();
        while (taken.test(prefix + now)) now++;
        return prefix + now;
    }

    private static String randomText(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        return sb.toString();
    }
}
