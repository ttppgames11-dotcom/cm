package com.connectmaratha.api.crmunit.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.service.CrmActivityService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/crm-hierarchy: the yearly activities of a CRM unit (see CrmActivityService). */
@RestController
@RequestMapping("/api/crm-hierarchy")
public class CrmActivityController {

    private final CrmActivityService activities;

    public CrmActivityController(CrmActivityService activities) {
        this.activities = activities;
    }

    /** The 12 activity types with their Marathi names and default targets. */
    @GetMapping("/activity-types")
    public Map<String, Object> types() {
        return activities.types();
    }

    /** A unit's activities of a year; optional ?year=, ?type=, ?status=. */
    @GetMapping("/units/{id}/activities")
    public Map<String, Object> list(@PathVariable String id, CurrentUser user,
                                    @RequestParam(required = false) String year,
                                    @RequestParam(required = false) String type,
                                    @RequestParam(required = false) String status) {
        return activities.list(user, id, year, type, status);
    }
}
