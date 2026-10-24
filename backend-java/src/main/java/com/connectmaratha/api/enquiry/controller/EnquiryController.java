package com.connectmaratha.api.enquiry.controller;

import com.connectmaratha.api.common.live.LiveUpdates;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.enquiry.event.EnquiryLiveRelay;
import com.connectmaratha.api.enquiry.service.EnquiryService;
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

/** /api/enquiries — B2B opportunities for the website's /leads page (not in Node). */
@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiries;
    private final JsonBody bodies;
    private final LiveUpdates live;

    public EnquiryController(EnquiryService enquiries, JsonBody bodies, LiveUpdates live) {
        this.enquiries = enquiries;
        this.bodies = bodies;
        this.live = live;
    }

    /** Live updates for the /leads page (server-sent events). No login: only public data is sent. */
    @GetMapping("/stream")
    public SseEmitter stream(HttpServletRequest req, HttpServletResponse res) throws IOException {
        return live.subscribe(EnquiryLiveRelay.CHANNEL, req, res);
    }

    /** Anyone may browse; a login only adds isMine / quotedByMe. */
    @GetMapping
    public Map<String, Object> list(CurrentUser user,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) String category) {
        return enquiries.list(user, district, category);
    }

    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enquiries.create(user, bodies.read(req)));
    }

    /** 201 for a new quote, 200 when the member's earlier quote was updated. */
    @RequireAuth
    @PostMapping("/{id}/quote")
    public ResponseEntity<Map<String, Object>> quote(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        EnquiryService.QuoteResult result = enquiries.quote(user, id, bodies.read(req));
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK).body(result.reply());
    }

    @RequireAuth
    @GetMapping("/mine")
    public Map<String, Object> mine(CurrentUser user) {
        return enquiries.mine(user);
    }

    @RequireAuth
    @PutMapping("/{id}/status")
    public Map<String, Object> status(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        return enquiries.setStatus(user, id, bodies.read(req));
    }
}
