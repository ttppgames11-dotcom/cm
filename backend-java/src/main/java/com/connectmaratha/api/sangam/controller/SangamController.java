package com.connectmaratha.api.sangam.controller;

import com.connectmaratha.api.common.live.LiveUpdates;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.sangam.event.ReferralLiveRelay;
import com.connectmaratha.api.sangam.service.ReferralService;
import com.connectmaratha.api.sangam.service.SangamService;
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

/** /api/sangam/* — the same endpoints as backend/routes/sangam.routes.js. */
@RestController
@RequestMapping("/api/sangam")
public class SangamController {

    private final SangamService sangam;
    private final ReferralService referrals;
    private final LiveUpdates live;
    private final JsonBody bodies;

    public SangamController(SangamService sangam, ReferralService referrals, LiveUpdates live, JsonBody bodies) {
        this.sangam = sangam;
        this.referrals = referrals;
        this.live = live;
        this.bodies = bodies;
    }

    /** Your referrals (given and received); admins see all. */
    @RequireAuth
    @GetMapping("/referrals")
    public Map<String, Object> referrals(CurrentUser user,
                                         @RequestParam(required = false) String memberId,
                                         @RequestParam(required = false) String status) {
        return referrals.list(user, memberId, status);
    }

    /** Members who own a visible business: the receivers a referral can go to. */
    @RequireAuth
    @GetMapping("/referrals/receivers")
    public Map<String, Object> receivers(CurrentUser user) {
        return referrals.receivers(user);
    }

    /** Live referral events (server-sent events); ids and status only, so no login is needed. */
    @GetMapping("/referrals/stream")
    public SseEmitter referralStream(HttpServletRequest req, HttpServletResponse res) throws IOException {
        return live.subscribe(ReferralLiveRelay.CHANNEL, req, res);
    }

    /** Community totals: numbers only. */
    @GetMapping("/referrals/stats")
    public Map<String, Object> stats() {
        return referrals.stats();
    }

    /** Giving a referral needs a login and a receiver who owns a visible business. */
    @RequireAuth
    @PostMapping("/referrals")
    public ResponseEntity<Map<String, Object>> createReferral(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referrals.give(user, bodies.read(req)));
    }

    /** Only the receiver (or an admin) changes a referral status. */
    @RequireAuth
    @PutMapping("/referrals/{id}/status")
    public Map<String, Object> referralStatus(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        return referrals.setStatus(user, id, bodies.read(req));
    }

    @GetMapping("/meetings")
    public Map<String, Object> meetings(@RequestParam(required = false) String memberId) {
        return sangam.listMeetings(memberId);
    }

    @PostMapping("/meetings")
    public ResponseEntity<Map<String, Object>> createMeeting(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sangam.createMeeting(user, bodies.read(req)));
    }

    @PutMapping("/meetings/{id}")
    @RequireAuth
    public Map<String, Object> reschedule(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return sangam.reschedule(user, id, bodies.read(req));
    }

    @PutMapping("/meetings/{id}/status")
    @RequireAuth
    public Map<String, Object> meetingStatus(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return sangam.setMeetingStatus(user, id, bodies.read(req));
    }

    @GetMapping("/metrics")
    public Map<String, Object> metrics() {
        return sangam.metrics();
    }
}
