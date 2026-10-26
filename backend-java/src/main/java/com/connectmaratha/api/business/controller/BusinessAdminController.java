package com.connectmaratha.api.business.controller;

import com.connectmaratha.api.business.service.BusinessService;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

/** Admin-only business management: assigning a business to a member. */
@RestController
public class BusinessAdminController {

    private final BusinessService businesses;
    private final JsonBody bodies;

    public BusinessAdminController(BusinessService businesses, JsonBody bodies) {
        this.businesses = businesses;
        this.bodies = bodies;
    }

    @RequireAuth
    @PutMapping("/api/admin/businesses/{id}/owner")
    public Map<String, Object> assignOwner(CurrentUser user, @PathVariable String id, HttpServletRequest req) {
        return businesses.assignOwner(user, id, bodies.read(req));
    }
}
