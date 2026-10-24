package com.connectmaratha.api.culture.controller;

import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.culture.service.CultureService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/culture/* — the same endpoints as backend/routes/culture.routes.js. */
@RestController
@RequestMapping("/api/culture")
public class CultureController {

    private final CultureService culture;
    private final JsonBody bodies;

    public CultureController(CultureService culture, JsonBody bodies) {
        this.culture = culture;
        this.bodies = bodies;
    }

    @GetMapping("/oral-history")
    public Map<String, Object> oralHistory() {
        return culture.oralHistory();
    }

    @PostMapping("/oral-history")
    public ResponseEntity<Map<String, Object>> addOralHistory(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(culture.addOralHistory(bodies.read(req)));
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return culture.stats();
    }
}
