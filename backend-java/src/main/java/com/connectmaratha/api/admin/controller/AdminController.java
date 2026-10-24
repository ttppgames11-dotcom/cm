package com.connectmaratha.api.admin.controller;

import com.connectmaratha.api.admin.service.AdminService;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/* — the same endpoints as backend/routes/admin.routes.js. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;
    private final JsonBody bodies;

    public AdminController(AdminService admin, JsonBody bodies) {
        this.admin = admin;
        this.bodies = bodies;
    }

    @GetMapping("/metrics")
    @RequireAuth
    public Map<String, Object> metrics(CurrentUser user) {
        return admin.metrics(user);
    }

    @GetMapping("/audit-logs")
    public Map<String, Object> auditLogs() {
        return admin.auditLogs();
    }

    @PostMapping("/verify-member/{id}")
    @RequireAuth
    public Map<String, Object> verifyMember(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return admin.verifyMember(user, id, bodies.read(req));
    }

    @GetMapping("/users")
    @RequireAuth
    public Map<String, Object> users(CurrentUser user,
                                     @RequestParam(required = false) String search,
                                     @RequestParam(required = false) String role,
                                     @RequestParam(required = false) String verified) {
        return admin.users(user, search, role, verified);
    }

    @GetMapping("/users/{id}")
    @RequireAuth
    public Map<String, Object> user(@PathVariable String id, CurrentUser user) {
        return admin.user(user, id);
    }
}
