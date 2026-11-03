package com.connectmaratha.api.crmunit.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.service.CrmAreaKpiService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/crm-hierarchy: counts of members, businesses, jobs, events and tickets in a unit's area (see CrmAreaKpiService). */
@RestController
@RequestMapping("/api/crm-hierarchy")
public class CrmAreaKpiController {

    private final CrmAreaKpiService kpis;

    public CrmAreaKpiController(CrmAreaKpiService kpis) {
        this.kpis = kpis;
    }

    /** The counts for the places of this unit and of the active units below it; 404 outside your scope. */
    @GetMapping("/units/{id}/area-kpis")
    public Map<String, Object> areaKpis(@PathVariable String id, CurrentUser user) {
        return kpis.areaKpis(user, id);
    }
}
