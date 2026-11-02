package com.connectmaratha.api.crmunit.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.service.CrmRollupService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/crm-hierarchy: read-only roll-ups of the yearly activities (see CrmRollupService). */
@RestController
@RequestMapping("/api/crm-hierarchy")
public class CrmRollupController {

    private final CrmRollupService rollups;

    public CrmRollupController(CrmRollupService rollups) {
        this.rollups = rollups;
    }

    /** One unit: its own numbers, the roll-up of everything below it, its children and the 12 types; optional ?year=. */
    @GetMapping("/units/{id}/summary")
    public Map<String, Object> summary(@PathVariable String id, CurrentUser user, @RequestParam(required = false) String year) {
        return rollups.summary(user, id, year);
    }
}
