package com.connectmaratha.api.officer.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.officer.service.OfficerService;
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

/** /api/officers: approved officer mentors, members' own profiles and the accepting switch (see OfficerService). */
@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    private final OfficerService officers;
    private final JsonBody bodies;

    public OfficerController(OfficerService officers, JsonBody bodies) {
        this.officers = officers;
        this.bodies = bodies;
    }

    /** Approved, visible officers, newest first; no phone numbers. Optional ?exam=, ?service=, ?search=. */
    @GetMapping
    public Map<String, Object> list(CurrentUser user,
                                    @RequestParam(required = false) String exam,
                                    @RequestParam(required = false) String service,
                                    @RequestParam(required = false) String search) {
        return officers.list(user, exam, service, search);
    }

    /** Your profile in any state, or null (declared before /{id}). */
    @RequireAuth
    @GetMapping("/mine")
    public Map<String, Object> mine(CurrentUser user) {
        return officers.mine(user);
    }

    /** Edit your profile; it waits for approval again. */
    @RequireAuth
    @PutMapping("/mine")
    public Map<String, Object> editMine(CurrentUser user, HttpServletRequest req) {
        return officers.editMine(user, bodies.read(req));
    }

    /** { accepting: true | false }: pause or resume new requests. */
    @RequireAuth
    @PutMapping("/mine/accepting")
    public Map<String, Object> setAccepting(CurrentUser user, HttpServletRequest req) {
        return officers.setAccepting(user, bodies.read(req));
    }

    /** Requests you sent; the officer's phone once accepted (declared before /{id}). */
    @RequireAuth
    @GetMapping("/requests/mine")
    public Map<String, Object> myRequests(CurrentUser user) {
        return officers.myRequests(user);
    }

    /** Requests to your profile, with the student's name and phone. */
    @RequireAuth
    @GetMapping("/requests/incoming")
    public Map<String, Object> incoming(CurrentUser user) {
        return officers.incoming(user);
    }

    /** { action: accept | decline } by the officer (admins for an officer without an account), or cancel by the student. */
    @RequireAuth
    @PutMapping("/requests/{requestId}")
    public Map<String, Object> answer(@PathVariable String requestId, CurrentUser user, HttpServletRequest req) {
        return officers.answer(user, requestId, bodies.read(req));
    }

    /** A guidance request: { exam, stage, question, mode, message }. */
    @RequireAuth
    @PostMapping("/{id}/requests")
    public ResponseEntity<Map<String, Object>> sendRequest(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(officers.sendRequest(user, id, bodies.read(req)));
    }

    /** Apply as an officer mentor; one profile per member, shown after an admin approves. */
    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> apply(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(officers.apply(user, bodies.read(req)));
    }
}
