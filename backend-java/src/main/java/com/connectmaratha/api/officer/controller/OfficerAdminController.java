package com.connectmaratha.api.officer.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.officer.service.OfficerService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/officers: every officer, approving, hiding, pausing, adding without an account and linking; admins only. */
@RestController
@RequestMapping("/api/admin/officers")
public class OfficerAdminController {

    private final OfficerService officers;
    private final JsonBody bodies;

    public OfficerAdminController(OfficerService officers, JsonBody bodies) {
        this.officers = officers;
        this.bodies = bodies;
    }

    @RequireAuth
    @GetMapping
    public Map<String, Object> all(CurrentUser user) {
        return officers.adminAll(user);
    }

    /** An officer added with their permission: approved at once, no account needed. */
    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> add(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(officers.adminAdd(user, bodies.read(req)));
    }

    /** { action: approve | reject | hide | unhide | link | pause | resume, reason?, member? }. */
    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> act(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return officers.adminAct(user, id, bodies.read(req));
    }
}
