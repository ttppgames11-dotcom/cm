package com.connectmaratha.api.job.controller;

import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.job.service.JobService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/jobs/* — the same endpoints as backend/routes/jobs.routes.js. */
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobs;
    private final JsonBody bodies;

    public JobController(JobService jobs, JsonBody bodies) {
        this.jobs = jobs;
        this.bodies = bodies;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String category,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) String search) {
        return jobs.list(category, district, search);
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        return jobs.detail(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobs.create(bodies.read(req)));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Map<String, Object>> apply(@PathVariable String id, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobs.apply(id, bodies.read(req)));
    }
}
