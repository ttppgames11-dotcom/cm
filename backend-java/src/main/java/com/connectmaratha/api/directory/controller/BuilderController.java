package com.connectmaratha.api.directory.controller;

import static com.connectmaratha.api.directory.controller.DirectoryErrors.guard;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.web.ClientIp;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.directory.service.BuilderService;
import com.connectmaratha.api.directory.service.EnquiryLimiter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/builders/* and /builders/* — the builders part of backend/routes/directories.routes.js. */
@RestController
@RequestMapping({"/api/builders", "/builders"})
public class BuilderController {

    private final BuilderService builders;
    private final EnquiryLimiter limiter;
    private final JsonBody bodies;

    public BuilderController(BuilderService builders, EnquiryLimiter limiter, JsonBody bodies) {
        this.builders = builders;
        this.limiter = limiter;
        this.bodies = bodies;
    }

    @GetMapping
    public Map<String, Object> list() {
        return guard(builders::list);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(guard(() -> builders.create(user, body)));
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        return guard(() -> builders.detail(id));
    }

    /** Rate-limited before anything else is checked, as in Node. */
    @PostMapping("/{id}/enquiries")
    public ResponseEntity<Map<String, Object>> enquire(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(ClientIp.of(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(guard(() -> builders.enquire(user, id, body)));
    }
}
