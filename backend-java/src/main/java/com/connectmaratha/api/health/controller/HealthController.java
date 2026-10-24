package com.connectmaratha.api.health.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    /** Same reply shape as the Node backend's GET /api/health. */
    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "OK");
        body.put("system", "Connect Maratha Spring Boot REST API Server");
        body.put("timestamp", Instant.now().toString());
        return body;
    }
}
