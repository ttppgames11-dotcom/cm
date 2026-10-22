package com.connectmaratha.api.donation.controller;

import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.donation.service.DonationService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/donations/* — the same endpoints as backend/routes/donations.routes.js. */
@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donations;
    private final JsonBody bodies;

    public DonationController(DonationService donations, JsonBody bodies) {
        this.donations = donations;
        this.bodies = bodies;
    }

    @GetMapping("/campaigns")
    public Map<String, Object> campaigns() {
        return donations.activeCampaigns();
    }

    @GetMapping("/campaigns/{id}")
    public Map<String, Object> campaign(@PathVariable String id) {
        return donations.campaignDetail(id);
    }

    @PostMapping("/donate")
    public ResponseEntity<Map<String, Object>> donate(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(donations.donate(bodies.read(req)));
    }

    @GetMapping("/recent")
    public Map<String, Object> recent() {
        return donations.recent();
    }
}
