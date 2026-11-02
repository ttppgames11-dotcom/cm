package com.connectmaratha.api.crmunit.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import com.connectmaratha.api.crmunit.service.CrmUnitService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/crm-hierarchy: the CRM unit ladder and who may see which unit (see CrmUnitService). */
@RestController
@RequestMapping("/api/crm-hierarchy")
public class CrmUnitController {

    private final CrmUnitService units;
    private final JsonBody bodies;

    public CrmUnitController(CrmUnitService units, JsonBody bodies) {
        this.bodies = bodies;
        this.units = units;
    }

    /** My unit, my role and what I may do here. */
    @RequireAuth
    @GetMapping("/me")
    public Map<String, Object> me(CurrentUser user) {
        return units.me(user);
    }

    /** Units inside my scope; optional ?level=, ?parentId=, ?search=. */
    @GetMapping("/units")
    public Map<String, Object> list(CurrentUser user,
                                    @RequestParam(required = false) String level,
                                    @RequestParam(required = false) String parentId,
                                    @RequestParam(required = false) String search) {
        return units.list(user, level, parentId, search);
    }

    /** One unit with the chain above it; 404 outside my scope. */
    @GetMapping("/units/{id}")
    public Map<String, Object> get(@PathVariable String id, CurrentUser user) {
        return units.get(user, id);
    }

    /** { level, name, parent_id, address, owner: { member | phone } }: a unit one level below its parent. */
    @RequireAuth
    @PostMapping("/units")
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(units.create(user, bodies.read(req)));
    }

    /** { name, address, status }: edit, or archive / restore (only by someone above the unit). */
    @RequireAuth
    @PutMapping("/units/{id}")
    public Map<String, Object> update(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return units.update(user, id, bodies.read(req));
    }

    /** { member | phone }: hand the unit to another member (only by someone above the unit). */
    @RequireAuth
    @PostMapping("/units/{id}/owner")
    public Map<String, Object> changeOwner(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return units.changeOwner(user, id, bodies.read(req));
    }
}
