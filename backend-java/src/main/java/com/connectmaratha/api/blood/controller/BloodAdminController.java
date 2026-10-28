package com.connectmaratha.api.blood.controller;

import com.connectmaratha.api.blood.service.BloodService;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/blood: every blood request and donor for the admin Blood Helpdesk, and hiding donors. Admins only. */
@RestController
@RequestMapping("/api/admin/blood")
public class BloodAdminController {

    private final BloodService blood;
    private final JsonBody bodies;

    public BloodAdminController(BloodService blood, JsonBody bodies) {
        this.blood = blood;
        this.bodies = bodies;
    }

    /** All requests (every state) and all donors (hidden ones too), with phones and owner names. */
    @RequireAuth
    @GetMapping
    public Map<String, Object> all(CurrentUser user) {
        return blood.adminAll(user);
    }

    /** { hidden: true | false }. */
    @RequireAuth
    @PutMapping("/donors/{id}")
    public Map<String, Object> setHidden(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return blood.setHidden(user, id, bodies.read(req));
    }
}
