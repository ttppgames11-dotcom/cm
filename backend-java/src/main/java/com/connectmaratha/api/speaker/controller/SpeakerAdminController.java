package com.connectmaratha.api.speaker.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.speaker.service.SpeakerService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/speakers: every speaker, approving, hiding, adding without an account and linking an account; admins only. */
@RestController
@RequestMapping("/api/admin/speakers")
public class SpeakerAdminController {

    private final SpeakerService speakers;
    private final JsonBody bodies;

    public SpeakerAdminController(SpeakerService speakers, JsonBody bodies) {
        this.speakers = speakers;
        this.bodies = bodies;
    }

    @RequireAuth
    @GetMapping
    public Map<String, Object> all(CurrentUser user) {
        return speakers.adminAll(user);
    }

    /** A speaker added with their permission: approved at once, no account needed. */
    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> add(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(speakers.adminAdd(user, bodies.read(req)));
    }

    /** { action: approve | reject | hide | unhide | link, reason?, member? }. */
    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> act(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return speakers.adminAct(user, id, bodies.read(req));
    }
}
