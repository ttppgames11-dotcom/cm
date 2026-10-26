package com.connectmaratha.api.sangam.controller;

import com.connectmaratha.api.common.live.LiveUpdates;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.sangam.event.MeetingLiveRelay;
import com.connectmaratha.api.sangam.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** /api/sangam/meetings: private 1-to-1 business meetings (a new feature; the Node routes were open to everyone). */
@RestController
@RequestMapping("/api/sangam/meetings")
public class MeetingController {

    private final MeetingService meetings;
    private final LiveUpdates live;
    private final JsonBody bodies;

    public MeetingController(MeetingService meetings, LiveUpdates live, JsonBody bodies) {
        this.meetings = meetings;
        this.live = live;
        this.bodies = bodies;
    }

    /** Your meetings (asked and received); admins see all. */
    @RequireAuth
    @GetMapping
    public Map<String, Object> list(CurrentUser user, @RequestParam(required = false) String memberId) {
        return meetings.list(user, memberId);
    }

    /** Members who own a visible business: who a meeting can be requested from. */
    @RequireAuth
    @GetMapping("/partners")
    public Map<String, Object> partners(CurrentUser user) {
        return meetings.partners(user);
    }

    /** Live meeting events (server-sent events); ids and status only, so no login is needed (a browser cannot send one). */
    @GetMapping("/stream")
    public SseEmitter stream(HttpServletRequest req, HttpServletResponse res) throws IOException {
        return live.subscribe(MeetingLiveRelay.CHANNEL, req, res);
    }

    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meetings.create(user, bodies.read(req)));
    }

    /** The recipient answers (accepted, declined); either person cancels or, once the day has come, completes. */
    @RequireAuth
    @PutMapping("/{id}/status")
    public Map<String, Object> status(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return meetings.setStatus(user, id, bodies.read(req));
    }

    /** Either person proposes a new date and time (and optionally a new place); the other must accept again. */
    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> reschedule(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return meetings.reschedule(user, id, bodies.read(req));
    }

    /** The note both people can edit. */
    @RequireAuth
    @PutMapping("/{id}/notes")
    public Map<String, Object> notes(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return meetings.saveNote(user, id, bodies.read(req));
    }
}
