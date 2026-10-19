package com.connectmaratha.api.web;

import com.connectmaratha.api.ratelimit.AuthRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Test-only endpoints that exercise the shared web plumbing. */
@RestController
class ProbeController {

    private final AuthRateLimiter authLimiter;

    ProbeController(AuthRateLimiter authLimiter) {
        this.authLimiter = authLimiter;
    }

    @RequireAuth
    @GetMapping("/api/test/me")
    Map<String, Object> me(CurrentUser user) {
        return Map.of("success", true, "id", user.id(), "role", user.role());
    }

    @GetMapping("/api/test/optional")
    Map<String, Object> optional(CurrentUser user) {
        return Map.of("success", true, "loggedIn", user != null);
    }

    @GetMapping("/api/test/boom")
    Map<String, Object> boom() {
        throw new IllegalStateException("syntax error at or near SELECT in /var/app/backend/routes/x.js:12:3");
    }

    @GetMapping("/api/test/bad")
    Map<String, Object> bad() {
        throw ApiException.badRequest("INVALID_REPORT", "अवैध तक्रार. कृपया कारण निवडा.");
    }

    @PostMapping("/api/test/echo")
    Map<String, Object> echo(@RequestBody Map<String, Object> body) {
        return Map.of("success", true, "received", body);
    }

    @PostMapping("/api/auth/login-probe")
    Map<String, Object> authAttempt(HttpServletRequest req, HttpServletResponse res) {
        authLimiter.check(req, res, java.util.Map.of());
        // Always a failed attempt: a success clears the IP count, as in Node.
        throw ApiException.badRequest("BAD_LOGIN", "x");
    }
}
