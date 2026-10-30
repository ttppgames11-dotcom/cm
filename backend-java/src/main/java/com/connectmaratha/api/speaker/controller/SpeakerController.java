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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/speakers: approved speakers and mentors, members' own profiles (see SpeakerService). */
@RestController
@RequestMapping("/api/speakers")
public class SpeakerController {

    private final SpeakerService speakers;
    private final JsonBody bodies;

    public SpeakerController(SpeakerService speakers, JsonBody bodies) {
        this.speakers = speakers;
        this.bodies = bodies;
    }

    /** Approved, visible speakers, newest first; no phone numbers. Optional ?category=, ?city=, ?search=. */
    @GetMapping
    public Map<String, Object> list(CurrentUser user,
                                    @RequestParam(required = false) String category,
                                    @RequestParam(required = false) String city,
                                    @RequestParam(required = false) String search) {
        return speakers.list(user, category, city, search);
    }

    /** Your profile in any state, or null (declared before /{id}). */
    @RequireAuth
    @GetMapping("/mine")
    public Map<String, Object> mine(CurrentUser user) {
        return speakers.mine(user);
    }

    /** Edit your profile; it waits for approval again. */
    @RequireAuth
    @PutMapping("/mine")
    public Map<String, Object> editMine(CurrentUser user, HttpServletRequest req) {
        return speakers.editMine(user, bodies.read(req));
    }

    /** Requests you sent; the speaker's phone once accepted (declared before /{id}). */
    @RequireAuth
    @GetMapping("/requests/mine")
    public Map<String, Object> myRequests(CurrentUser user) {
        return speakers.myRequests(user);
    }

    /** Requests to your profile, with the organiser's name and phone. */
    @RequireAuth
    @GetMapping("/requests/incoming")
    public Map<String, Object> incoming(CurrentUser user) {
        return speakers.incoming(user);
    }

    /** { action: accept | decline } by the speaker (admins for a speaker without an account), or cancel by the organiser. */
    @RequireAuth
    @PutMapping("/requests/{requestId}")
    public Map<String, Object> answer(@PathVariable String requestId, CurrentUser user, HttpServletRequest req) {
        return speakers.answer(user, requestId, bodies.read(req));
    }

    /** A talk or guidance request: { kind, event_date, place, event_type, audience } or { kind, topic, mode }, and message. */
    @RequireAuth
    @PostMapping("/{id}/requests")
    public ResponseEntity<Map<String, Object>> sendRequest(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(speakers.sendRequest(user, id, bodies.read(req)));
    }

    /** Apply as a speaker; one profile per member, shown after an admin approves. */
    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> apply(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(speakers.apply(user, bodies.read(req)));
    }
}
