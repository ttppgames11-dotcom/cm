package com.connectmaratha.api.job.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.job.service.JobService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/jobs: every job (hidden, closed and old ones too) and hiding a job; admins only. */
@RestController
@RequestMapping("/api/admin/jobs")
public class JobAdminController {

    private final JobService jobs;
    private final JsonBody bodies;

    public JobAdminController(JobService jobs, JsonBody bodies) {
        this.jobs = jobs;
        this.bodies = bodies;
    }

    @RequireAuth
    @GetMapping
    public Map<String, Object> all(CurrentUser user) {
        return jobs.adminAll(user);
    }

    /** { hidden: true | false }. */
    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> setHidden(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return jobs.setHidden(user, id, bodies.read(req));
    }
}
