package com.connectmaratha.api.community.controller;

import com.connectmaratha.api.community.service.CommunityService;
import com.connectmaratha.api.community.service.ModerationService;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.common.security.RequireAuth;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/community/* — the same endpoints as backend/routes/community.routes.js. */
@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService community;
    private final ModerationService moderation;
    private final JsonBody bodies;

    public CommunityController(CommunityService community, ModerationService moderation, JsonBody bodies) {
        this.community = community;
        this.moderation = moderation;
        this.bodies = bodies;
    }

    /** Open to visitors; a logged-in viewer also gets is_liked and blocked members are hidden. */
    @GetMapping("/posts")
    public Map<String, Object> posts(CurrentUser viewer, @RequestParam(required = false) String groupId) {
        return community.feed(viewer, groupId);
    }

    @PostMapping("/posts")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> createPost(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(community.createPost(user, bodies.read(req)));
    }

    @PostMapping("/posts/{id}/like")
    @RequireAuth
    public Map<String, Object> like(@PathVariable String id, CurrentUser user) {
        return community.toggleLike(user, id);
    }

    @PostMapping("/posts/{id}/comments")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> comment(@PathVariable String id, CurrentUser user,
                                                       HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(community.addComment(user, id, bodies.read(req)));
    }

    @GetMapping("/groups")
    public Map<String, Object> groups(@RequestParam(required = false) String type,
                                      @RequestParam(required = false) String district) {
        return community.groups(type, district);
    }

    @PostMapping("/groups/{id}/join")
    public Map<String, Object> join(@PathVariable String id) {
        return community.joinGroup(id);
    }

    @PostMapping("/report")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> report(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moderation.report(user, bodies.read(req)));
    }

    @GetMapping("/blocks")
    @RequireAuth
    public Map<String, Object> blocks(CurrentUser user) {
        return moderation.listBlocked(user);
    }

    @PostMapping("/blocks/{memberId}")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> block(@PathVariable String memberId, CurrentUser user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moderation.block(user, memberId));
    }

    @DeleteMapping("/blocks/{memberId}")
    @RequireAuth
    public Map<String, Object> unblock(@PathVariable String memberId, CurrentUser user) {
        return moderation.unblock(user, memberId);
    }
}
