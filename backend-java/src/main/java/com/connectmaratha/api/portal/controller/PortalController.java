package com.connectmaratha.api.portal.controller;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.validation.Rule;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.common.web.ClientIp;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.portal.dto.PortalSchemas;
import com.connectmaratha.api.portal.service.PortalService;
import com.connectmaratha.api.portal.service.SubmissionLimiter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The older community endpoints of backend/server.js (doctors, blood, matrimony, grievances, volunteers, women, loans).
 * Safer than Node: every form is validated and limited per IP, grievances, women's help and loan
 * applications are visible to admins only, and private fields are hidden from public lists.
 */
@RestController
public class PortalController {

    private final PortalService portal;
    private final JsonBody bodies;
    private final SubmissionLimiter limiter;

    public PortalController(PortalService portal, JsonBody bodies, SubmissionLimiter limiter) {
        this.portal = portal;
        this.bodies = bodies;
        this.limiter = limiter;
    }

    // ------------------------------------------------------------ public lists

    @GetMapping("/api/doctors")
    public List<Map<String, Object>> doctors() {
        return portal.publicList(PortalService.DOCTORS);
    }

    @GetMapping("/api/blood/requests")
    public List<Map<String, Object>> bloodRequests() {
        return portal.publicList(PortalService.BLOOD_REQUESTS);
    }

    @GetMapping("/api/blood/donors")
    public List<Map<String, Object>> bloodDonors() {
        return portal.publicList(PortalService.BLOOD_DONORS);
    }

    @GetMapping("/api/matrimony")
    public List<Map<String, Object>> matrimony() {
        return portal.publicList(PortalService.MATRIMONY);
    }

    @GetMapping("/api/social/volunteers")
    public List<Map<String, Object>> volunteers() {
        return portal.publicList(PortalService.VOLUNTEERS);
    }

    // ------------------------------------------------------ admin-only lists
    // People's names, phone numbers and problems. No public page shows these lists.

    @RequireAuth
    @GetMapping("/api/political/grievances")
    public List<Map<String, Object>> grievances(CurrentUser user) {
        requireAdmin(user);
        return portal.list(PortalService.GRIEVANCES);
    }

    @RequireAuth
    @GetMapping("/api/women/help")
    public List<Map<String, Object>> womenHelp(CurrentUser user) {
        requireAdmin(user);
        return portal.list(PortalService.WOMEN_HELP);
    }

    @RequireAuth
    @GetMapping("/api/bank/loans")
    public List<Map<String, Object>> loans(CurrentUser user) {
        requireAdmin(user);
        return portal.list(PortalService.BANK_LOANS);
    }

    // ------------------------------------------------------------------ forms

    @PostMapping("/api/doctors")
    public ResponseEntity<Map<String, Object>> addDoctor(HttpServletRequest req) {
        return submit(req, PortalSchemas.DOCTOR, true, portal::addDoctor);
    }

    @PostMapping("/api/blood/requests")
    public ResponseEntity<Map<String, Object>> addBloodRequest(HttpServletRequest req) {
        return submit(req, PortalSchemas.BLOOD_REQUEST, true, portal::addBloodRequest);
    }

    @PostMapping("/api/blood/donors")
    public ResponseEntity<Map<String, Object>> addBloodDonor(HttpServletRequest req) {
        return submit(req, PortalSchemas.BLOOD_DONOR, false, portal::addBloodDonor);
    }

    @PostMapping("/api/matrimony")
    public ResponseEntity<Map<String, Object>> addMatrimony(HttpServletRequest req) {
        return submit(req, PortalSchemas.MATRIMONY, false, portal::addMatrimony);
    }

    @PostMapping("/api/political/grievances")
    public ResponseEntity<Map<String, Object>> addGrievance(HttpServletRequest req) {
        return submit(req, PortalSchemas.GRIEVANCE, false, portal::addGrievance);
    }

    @PostMapping("/api/social/volunteers")
    public ResponseEntity<Map<String, Object>> addVolunteer(HttpServletRequest req) {
        return submit(req, PortalSchemas.VOLUNTEER, false, portal::addVolunteer);
    }

    @PostMapping("/api/women/help")
    public ResponseEntity<Map<String, Object>> addWomenHelp(HttpServletRequest req) {
        return submit(req, PortalSchemas.WOMEN_HELP, false, portal::addWomenHelp);
    }

    @PostMapping("/api/bank/loans")
    public ResponseEntity<Map<String, Object>> addLoan(HttpServletRequest req) {
        return submit(req, PortalSchemas.LOAN, false, portal::addLoan);
    }

    /**
     * Limit per IP, then validate. strict = unknown fields are an error (doctors and blood
     * requests, as in Node); otherwise unknown fields are simply not saved.
     */
    private ResponseEntity<Map<String, Object>> submit(HttpServletRequest req, Map<String, Rule> schema, boolean strict,
                                                       Function<Map<String, Object>, Map<String, Object>> action) {
        limiter.check(ClientIp.of(req));
        Map<String, Object> body = bodies.read(req);
        SchemaValidator.check(body, schema, !strict, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(action.apply(body));
    }

    private static void requireAdmin(CurrentUser user) {
        if (!Roles.isAdmin(user)) {
            throw ApiException.forbidden("ADMIN_ONLY", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        }
    }
}
