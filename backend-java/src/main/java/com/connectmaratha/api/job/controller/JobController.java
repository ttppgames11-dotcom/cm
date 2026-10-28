package com.connectmaratha.api.job.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.job.service.JobService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/jobs: the job board, jobs owned by members, and their applications (see JobService). */
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobs;
    private final JsonBody bodies;

    public JobController(JobService jobs, JsonBody bodies) {
        this.jobs = jobs;
        this.bodies = bodies;
    }

    /** Open jobs, newest first; contacts only when logged in. Optional ?category=, ?district=, ?search=. */
    @GetMapping
    public Map<String, Object> list(CurrentUser user,
                                    @RequestParam(required = false) String category,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) String search) {
        return jobs.list(user, category, district, search);
    }

    /** { open_jobs, hired } (declared before /{id}). */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return jobs.stats();
    }

    /** Your jobs, every state, with application counts (declared before /{id}). */
    @RequireAuth
    @GetMapping("/mine")
    public Map<String, Object> mine(CurrentUser user) {
        return jobs.mine(user);
    }

    /** One job in any state (for shared links); hidden jobs only for the poster and admins. */
    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id, CurrentUser user) {
        return jobs.detail(user, id);
    }

    /** Post a job (5 per 24 hours); it closes in 30 days. */
    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobs.create(user, bodies.read(req)));
    }

    /** { action: close | extend }, by the poster or an admin. */
    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> act(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return jobs.act(user, id, bodies.read(req));
    }
}
