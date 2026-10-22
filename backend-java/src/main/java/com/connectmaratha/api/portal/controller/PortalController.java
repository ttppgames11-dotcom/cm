package com.connectmaratha.api.portal.controller;

import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.portal.dto.PortalSchemas;
import com.connectmaratha.api.portal.service.PortalService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** The older community endpoints of backend/server.js (doctors, blood, matrimony, grievances, volunteers, women, loans). */
@RestController
public class PortalController {

    private final PortalService portal;
    private final JsonBody bodies;

    public PortalController(PortalService portal, JsonBody bodies) {
        this.portal = portal;
        this.bodies = bodies;
    }

    @GetMapping("/api/doctors")
    public List<Map<String, Object>> doctors() {
        return portal.list(PortalService.DOCTORS);
    }

    @PostMapping("/api/doctors")
    public ResponseEntity<Map<String, Object>> addDoctor(HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        SchemaValidator.check(body, PortalSchemas.DOCTOR, false, null);
        return created(portal::addDoctor, body);
    }

    @GetMapping("/api/blood/requests")
    public List<Map<String, Object>> bloodRequests() {
        return portal.list(PortalService.BLOOD_REQUESTS);
    }

    @PostMapping("/api/blood/requests")
    public ResponseEntity<Map<String, Object>> addBloodRequest(HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        SchemaValidator.check(body, PortalSchemas.BLOOD_REQUEST, false, null);
        return created(portal::addBloodRequest, body);
    }

    @GetMapping("/api/blood/donors")
    public List<Map<String, Object>> bloodDonors() {
        return portal.list(PortalService.BLOOD_DONORS);
    }

    @PostMapping("/api/blood/donors")
    public ResponseEntity<Map<String, Object>> addBloodDonor(HttpServletRequest req) {
        return created(portal::addBloodDonor, bodies.read(req));
    }

    @GetMapping("/api/matrimony")
    public List<Map<String, Object>> matrimony() {
        return portal.list(PortalService.MATRIMONY);
    }

    @PostMapping("/api/matrimony")
    public ResponseEntity<Map<String, Object>> addMatrimony(HttpServletRequest req) {
        return created(portal::addMatrimony, bodies.read(req));
    }

    @GetMapping("/api/political/grievances")
    public List<Map<String, Object>> grievances() {
        return portal.list(PortalService.GRIEVANCES);
    }

    @PostMapping("/api/political/grievances")
    public ResponseEntity<Map<String, Object>> addGrievance(HttpServletRequest req) {
        return created(portal::addGrievance, bodies.read(req));
    }

    @GetMapping("/api/social/volunteers")
    public List<Map<String, Object>> volunteers() {
        return portal.list(PortalService.VOLUNTEERS);
    }

    @PostMapping("/api/social/volunteers")
    public ResponseEntity<Map<String, Object>> addVolunteer(HttpServletRequest req) {
        return created(portal::addVolunteer, bodies.read(req));
    }

    @GetMapping("/api/women/help")
    public List<Map<String, Object>> womenHelp() {
        return portal.list(PortalService.WOMEN_HELP);
    }

    @PostMapping("/api/women/help")
    public ResponseEntity<Map<String, Object>> addWomenHelp(HttpServletRequest req) {
        return created(portal::addWomenHelp, bodies.read(req));
    }

    @GetMapping("/api/bank/loans")
    public List<Map<String, Object>> loans() {
        return portal.list(PortalService.BANK_LOANS);
    }

    @PostMapping("/api/bank/loans")
    public ResponseEntity<Map<String, Object>> addLoan(HttpServletRequest req) {
        return created(portal::addLoan, bodies.read(req));
    }

    private static ResponseEntity<Map<String, Object>> created(Function<Map<String, Object>, Map<String, Object>> action,
                                                              Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(action.apply(body));
    }
}
