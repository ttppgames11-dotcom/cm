package com.connectmaratha.api.sangam.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.sangam.service.ReferralReportService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** The referral report for the admin area: admins only. */
@RestController
public class ReferralReportController {

    private final ReferralReportService report;

    public ReferralReportController(ReferralReportService report) {
        this.report = report;
    }

    @RequireAuth
    @GetMapping("/api/admin/referrals/report")
    public Map<String, Object> report(CurrentUser user, @RequestParam(required = false) String period) {
        return report.report(user, period);
    }
}
