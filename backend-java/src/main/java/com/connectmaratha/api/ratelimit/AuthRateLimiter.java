package com.connectmaratha.api.ratelimit;

import com.connectmaratha.api.web.ApiException;
import com.connectmaratha.api.web.ClientIp;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * The Node backend's authRateLimiter, IP part: 20 login/registration/reset
 * attempts per IP per 15 minutes. Auth controllers call {@link #check} first.
 * The per-account exponential backoff after failed logins comes with the
 * login endpoint (phase 2).
 */
@Component
public class AuthRateLimiter {

    private final RateLimitProperties limits;
    private final SlidingWindow window = new SlidingWindow();

    public AuthRateLimiter(RateLimitProperties limits) {
        this.limits = limits;
    }

    public void check(HttpServletRequest req, HttpServletResponse res) {
        SlidingWindow.Result r = window.hit(
            ClientIp.of(req), limits.authIpMax(), limits.authIpWindowMs(), System.currentTimeMillis());
        if (r.allowed()) return;
        res.setHeader("Retry-After", String.valueOf(r.retryAfterSeconds()));
        res.setHeader("X-RateLimit-Limit", String.valueOf(limits.authIpMax()));
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", String.valueOf(r.resetEpochSeconds()));
        long s = r.retryAfterSeconds();
        throw new RateLimitedException(s,
            "या आयपी पत्त्यावरून प्रमाणीकरणाचे अनेक प्रयत्न झाले आहेत. कृपया " + s
                + " सेकंदांनंतर प्रयत्न करा. (Too many authentication requests from this IP. Please try again in "
                + s + "s.)");
    }

    /** Test hook: forget all counts. */
    public void reset() {
        window.clear();
    }

    /** 429 AUTH_IP_RATE_LIMIT_EXCEEDED, with retryAfter in the body like Node. */
    public static class RateLimitedException extends ApiException {
        private final long retryAfter;

        RateLimitedException(long retryAfter, String message) {
            super(HttpStatus.TOO_MANY_REQUESTS, "AUTH_IP_RATE_LIMIT_EXCEEDED", message);
            this.retryAfter = retryAfter;
        }

        public long getRetryAfter() { return retryAfter; }
    }
}
