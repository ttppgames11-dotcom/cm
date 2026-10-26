package com.connectmaratha.api.business.controller;

import com.connectmaratha.api.business.service.BusinessService;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
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

/** /api/businesses/* — the same endpoints as backend/routes/businesses.routes.js. */
@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businesses;
    private final JsonBody bodies;

    public BusinessController(BusinessService businesses, JsonBody bodies) {
        this.businesses = businesses;
        this.bodies = bodies;
    }

    @GetMapping
    public Map<String, Object> list(CurrentUser user,
                                    @RequestParam(required = false) String cat,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) String search) {
        return businesses.list(user, cat, district, search);
    }

    /** The member's own businesses (declared before /{id}). */
    @RequireAuth
    @GetMapping("/mine")
    public Map<String, Object> mine(CurrentUser user) {
        return businesses.mine(user);
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(CurrentUser user, @PathVariable String id) {
        return businesses.detail(user, id);
    }

    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businesses.create(user, bodies.read(req)));
    }

    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> update(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        return businesses.update(user, id, bodies.read(req));
    }

    @RequireAuth
    @PutMapping("/{id}/visibility")
    public Map<String, Object> visibility(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        return businesses.setVisibility(user, id, bodies.read(req));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Map<String, Object>> review(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businesses.addReview(user, id, bodies.read(req)));
    }
}
