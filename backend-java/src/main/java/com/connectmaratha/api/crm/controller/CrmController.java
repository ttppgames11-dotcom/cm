package com.connectmaratha.api.crm.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.crm.service.CrmService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/crm/* and /api/admin/crm/* (same routes under both) — backend/routes/crm.routes.js. */
@RestController
@RequestMapping({"/api/crm", "/api/admin/crm"})
public class CrmController {

    private final CrmService crm;
    private final JsonBody bodies;

    public CrmController(CrmService crm, JsonBody bodies) {
        this.crm = crm;
        this.bodies = bodies;
    }

    @GetMapping("/tickets")
    @RequireAuth
    public Map<String, Object> tickets(CurrentUser user, @RequestParam Map<String, String> query) {
        return crm.listTickets(user, query);
    }

    @PostMapping("/tickets")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> createTicket(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(crm.createTicket(user, bodies.read(req)));
    }

    @PatchMapping("/tickets/{id}/escalate")
    @RequireAuth
    public Map<String, Object> escalate(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return crm.escalate(user, id, bodies.read(req));
    }

    @PatchMapping("/tickets/{id}/status")
    @RequireAuth
    public Map<String, Object> status(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return crm.changeStatus(user, id, bodies.read(req));
    }

    @GetMapping("/community-centers")
    public Map<String, Object> centers(@RequestParam(required = false) String tier,
                                       @RequestParam(required = false) String district,
                                       @RequestParam(required = false) String division) {
        return crm.listCenters(tier, district, division);
    }

    @PostMapping("/community-centers")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> createCenter(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(crm.createCenter(user, bodies.read(req)));
    }

    @PostMapping("/community-centers/{id}/checkin")
    @RequireAuth
    public Map<String, Object> checkIn(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return crm.checkIn(user, id, bodies.read(req));
    }

    @PostMapping("/community-centers/{id}/transaction")
    @RequireAuth
    public Map<String, Object> transaction(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return crm.transaction(user, id, bodies.read(req));
    }
}
