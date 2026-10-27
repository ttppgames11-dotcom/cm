package com.connectmaratha.api.sangam.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.sangam.service.ChapterService;
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

/** /api/sangam/chapters: Business Sangam chapters (a new feature; Node has no chapters). */
@RestController
@RequestMapping("/api/sangam/chapters")
public class ChapterController {

    private final ChapterService chapters;
    private final JsonBody bodies;

    public ChapterController(ChapterService chapters, JsonBody bodies) {
        this.chapters = chapters;
        this.bodies = bodies;
    }

    /** Open chapters with public details and counts; no login needed. */
    @GetMapping
    public Map<String, Object> list() {
        return chapters.publicList();
    }

    /** Your requests and seats, and the chapters you coordinate. */
    @RequireAuth
    @GetMapping("/mine")
    public Map<String, Object> mine(CurrentUser user) {
        return chapters.mine(user);
    }

    /** The businesses with a seat in a chapter (members only). */
    @RequireAuth
    @GetMapping("/{id}/businesses")
    public Map<String, Object> businesses(@PathVariable String id, CurrentUser user) {
        return chapters.businesses(user, id);
    }

    /** Waiting and approved seats, for the chapter's coordinator or an admin. */
    @RequireAuth
    @GetMapping("/{id}/seats")
    public Map<String, Object> seats(@PathVariable String id, CurrentUser user) {
        return chapters.seats(user, id);
    }

    /** Ask for a seat: { businessId, message }. */
    @RequireAuth
    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, Object>> join(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chapters.join(user, id, bodies.read(req)));
    }

    /** { action: approve | decline | remove | cancel | leave }. */
    @RequireAuth
    @PutMapping("/seats/{seatId}")
    public Map<String, Object> act(@PathVariable String seatId, CurrentUser user, HttpServletRequest req) {
        return chapters.act(user, seatId, bodies.read(req));
    }
}
