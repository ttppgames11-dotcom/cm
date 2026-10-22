package com.connectmaratha.api.business.controller;

import com.connectmaratha.api.business.service.BusinessService;
import com.connectmaratha.api.common.web.JsonBody;
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
    public Map<String, Object> list(@RequestParam(required = false) String cat,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) String search) {
        return businesses.list(cat, district, search);
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        return businesses.detail(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businesses.create(bodies.read(req)));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Map<String, Object>> review(@PathVariable String id, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businesses.addReview(id, bodies.read(req)));
    }
}
