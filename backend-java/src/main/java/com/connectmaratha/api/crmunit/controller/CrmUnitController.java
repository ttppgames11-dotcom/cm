package com.connectmaratha.api.crmunit.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
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

    public CrmUnitController(CrmUnitService units) {
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
}
