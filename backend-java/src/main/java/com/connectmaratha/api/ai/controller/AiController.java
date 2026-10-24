package com.connectmaratha.api.ai.controller;

import com.connectmaratha.api.ai.service.AiService;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.web.JsonBody;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/ai/* — the same endpoints as backend/routes/ai.routes.js. */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService ai;
    private final JsonBody bodies;

    public AiController(AiService ai, JsonBody bodies) {
        this.ai = ai;
        this.bodies = bodies;
    }

    @PostMapping("/chat")
    public Map<String, Object> chat(HttpServletRequest req) {
        return ai.chat(bodies.read(req));
    }

    @PostMapping({"/support", "/technical-support"})
    public ResponseEntity<Map<String, Object>> support(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ai.support(user, bodies.read(req)));
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return ai.health();
    }
}
