package com.connectmaratha.api.sangam.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.sangam.service.SangamService;
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

/** /api/sangam/* — the same endpoints as backend/routes/sangam.routes.js. */
@RestController
@RequestMapping("/api/sangam")
public class SangamController {

    private final SangamService sangam;
    private final JsonBody bodies;

    public SangamController(SangamService sangam, JsonBody bodies) {
        this.sangam = sangam;
        this.bodies = bodies;
    }

    @GetMapping("/referrals")
    public Map<String, Object> referrals(@RequestParam(required = false) String memberId,
                                         @RequestParam(required = false) String status) {
        return sangam.listReferrals(memberId, status);
    }

    @PostMapping("/referrals")
    public ResponseEntity<Map<String, Object>> createReferral(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sangam.createReferral(user, bodies.read(req)));
    }

    @PutMapping("/referrals/{id}/status")
    public Map<String, Object> referralStatus(@PathVariable String id, HttpServletRequest req) {
        return sangam.updateReferralStatus(id, bodies.read(req));
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
