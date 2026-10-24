package com.connectmaratha.api.event.controller;

import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.event.service.EventService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/events/* — the same endpoints as backend/routes/events.routes.js. */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService events;
    private final JsonBody bodies;

    public EventController(EventService events, JsonBody bodies) {
        this.events = events;
        this.bodies = bodies;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String district,
                                    @RequestParam(required = false) String category) {
        return events.list(district, category);
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        return events.detail(id);
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<Map<String, Object>> rsvp(@PathVariable String id, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(events.rsvp(id, bodies.read(req)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(events.create(bodies.read(req)));
    }
}
