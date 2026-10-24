package com.connectmaratha.api.services.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.services.service.ServiceCatalogService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/services/* (public) and /api/admin/services/* (admins) — backend/routes/services.routes.js. */
@RestController
public class ServicesController {

    private final ServiceCatalogService catalog;
    private final JsonBody bodies;

    public ServicesController(ServiceCatalogService catalog, JsonBody bodies) {
        this.catalog = catalog;
        this.bodies = bodies;
    }

    @GetMapping("/api/services")
    public Map<String, Object> list() {
        return catalog.publicList();
    }

    @PostMapping("/api/services/booking")
    public ResponseEntity<Map<String, Object>> book(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.book(user, bodies.read(req)));
    }

    @GetMapping("/api/admin/services")
    @RequireAuth
    public Map<String, Object> adminList(CurrentUser user) {
        return catalog.adminList(user);
    }

    @PostMapping("/api/admin/services")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> adminCreate(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.adminCreate(user, bodies.read(req)));
    }

    @PutMapping("/api/admin/services/{id}")
    @RequireAuth
    public Map<String, Object> adminUpdate(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return catalog.adminUpdate(user, id, bodies.read(req));
    }

    @DeleteMapping("/api/admin/services/{id}")
    @RequireAuth
    public Map<String, Object> adminDelete(@PathVariable String id, CurrentUser user) {
        return catalog.adminDelete(user, id);
    }
}
