package com.connectmaratha.api.enquiry.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.enquiry.service.EnquiryService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** The requirements list for the admin dashboards (SuperAdmin, CEO, district CRM). Admins only. */
@RestController
public class EnquiryAdminController {

    private final EnquiryService enquiries;

    public EnquiryAdminController(EnquiryService enquiries) {
        this.enquiries = enquiries;
    }

    @RequireAuth
    @GetMapping("/api/admin/enquiries-summary")
    public Map<String, Object> summary(CurrentUser user) {
        return enquiries.adminSummary(user);
    }
}
