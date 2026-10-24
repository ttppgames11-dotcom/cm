package com.connectmaratha.api.enquiry.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.enquiry.service.EnquiryService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/enquiries — B2B opportunities for the website's /leads page (not in Node). */
@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiries;
    private final JsonBody bodies;

    public EnquiryController(EnquiryService enquiries, JsonBody bodies) {
        this.enquiries = enquiries;
        this.bodies = bodies;
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
}
