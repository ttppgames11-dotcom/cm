package com.connectmaratha.api.ratelimit;

import com.connectmaratha.api.web.ApiExceptionHandler;
import com.connectmaratha.api.web.ClientIp;
import com.connectmaratha.api.web.CurrentUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * The Node backend's generalRateLimiter: visitors are counted per IP
 * (100 / 15 min), logged-in members per account (600 / 15 min). Health checks,
 * CORS preflight and the login/registration routes (limited separately by
 * {@link AuthRateLimiter}) are skipped. Runs after {@code JwtAuthFilter}.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final List<String> AUTH_PREFIXES = List.of(
        "/api/auth/login", "/api/auth/register", "/api/auth/google",
        "/api/auth/forgot-password", "/api/auth/verify-reset-otp", "/api/auth/reset-password");

    static final String MESSAGE =
        "विनंत्यांची मर्यादा संपली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. (Rate limit exceeded. Please try again later.)";

    private final RateLimitProperties limits;
    private final ObjectMapper json;
    private final SlidingWindow window = new SlidingWindow();

    public RateLimitFilter(RateLimitProperties limits, ObjectMapper json) {
        this.limits = limits;
        this.json = json;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String path = req.getRequestURI();
        return "OPTIONS".equals(req.getMethod())
            || path.equals("/api/health") || path.equals("/health")
            || AUTH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        CurrentUser user = (CurrentUser) req.getAttribute(CurrentUser.ATTRIBUTE);
        boolean authenticated = user != null && user.id() != null;
        String key = authenticated ? "user:" + user.id() : "ip:" + ClientIp.of(req);
        SlidingWindow.Result r = authenticated
            ? window.hit(key, limits.userMax(), limits.userWindowMs(), System.currentTimeMillis())
            : window.hit(key, limits.publicMax(), limits.publicWindowMs(), System.currentTimeMillis());

        for (String prefix : List.of("X-RateLimit-", "RateLimit-")) {
            res.setHeader(prefix + "Limit", String.valueOf(r.limit()));
            res.setHeader(prefix + "Remaining", String.valueOf(r.remaining()));
            res.setHeader(prefix + "Reset", String.valueOf(r.resetEpochSeconds()));
        }
        if (!r.allowed()) {
            res.setHeader("Retry-After", String.valueOf(r.retryAfterSeconds()));
            Map<String, Object> body = ApiExceptionHandler.body("RATE_LIMIT_EXCEEDED", MESSAGE);
            body.put("retryAfter", r.retryAfterSeconds());
            body.put("tier", authenticated ? "authenticated" : "public");
            res.setStatus(429);
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            json.writeValue(res.getOutputStream(), body);
            return;
        }
        chain.doFilter(req, res);
    }

    /** Test hook: forget all counts. */
    public void reset() {
        window.clear();
    }
}
