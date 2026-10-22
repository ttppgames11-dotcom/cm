package com.connectmaratha.api.common.ratelimit;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.web.ClientIp;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * The Node backend's authRateLimiter for login, registration, password reset
 * and account deletion:
 * <ul>
 *   <li>per account (email / phone / id in the body): after 5 failures, exponential
 *       backoff 2s, 4s, 8s ... up to 15 min;</li>
 *   <li>per IP: 20 attempts per 15 minutes.</li>
 * </ul>
 * Controllers call {@link #check} first; {@link AuthOutcomeInterceptor} then
 * records success (2xx: counters cleared) or failure (4xx/5xx) like Node's
 * res.json hook.
 */
@Component
public class AuthRateLimiter {

    static final String ATTEMPT_ATTRIBUTE = "cm.authAttempt";

    private final RateLimitProperties limits;
    private final SlidingWindow ipWindow = new SlidingWindow();
    private final ConcurrentHashMap<String, Account> accounts = new ConcurrentHashMap<>();

    public AuthRateLimiter(RateLimitProperties limits) {
        this.limits = limits;
    }

    /** One attempt in progress: what to update once the outcome is known. */
    record Attempt(String identifier, String ip) {}

    private static final class Account {
        final Deque<Long> attempts = new ArrayDeque<>();
        int consecutiveFailures;
        long backoffUntil;
    }

    /**
     * Node's getAccountIdentifier: body.identifier || email || phone || memberId || userId,
     * trimmed and lower-cased; null when none is a non-empty string.
     */
    public static String accountIdentifier(Map<String, Object> body) {
        if (body == null) return null;
        for (String key : new String[] {"identifier", "email", "phone", "memberId", "userId"}) {
            Object raw = body.get(key);
            if (jsTruthy(raw)) {
                // Node takes the first truthy value, then requires it to be a string.
                if (!(raw instanceof String s)) return null;
                String trimmed = s.trim();
                return trimmed.isEmpty() ? null : trimmed.toLowerCase();
            }
        }
        return null;
    }

    /** JavaScript truthiness for parsed JSON values. */
    static boolean jsTruthy(Object v) {
        if (v == null) return false;
        if (v instanceof String s) return !s.isEmpty();
        if (v instanceof Boolean b) return b;
        if (v instanceof Number n) return n.doubleValue() != 0 && !Double.isNaN(n.doubleValue());
        return true;
    }

    public void check(HttpServletRequest req, HttpServletResponse res, Map<String, Object> body) {
        long now = System.currentTimeMillis();
        String ip = ClientIp.of(req);
        String identifier = accountIdentifier(body);

        // 1. Account backoff
        if (identifier != null) {
            Account acct = accounts.computeIfAbsent(identifier, k -> new Account());
            synchronized (acct) {
                if (acct.backoffUntil > now) {
                    long remaining = (long) Math.ceil((acct.backoffUntil - now) / 1000.0);
                    res.setHeader("Retry-After", String.valueOf(remaining));
                    res.setHeader("X-RateLimit-Backoff", "true");
                    res.setHeader("X-RateLimit-Failures", String.valueOf(acct.consecutiveFailures));
                    Map<String, Object> extra = new LinkedHashMap<>();
                    extra.put("retryAfter", remaining);
                    extra.put("backoff", true);
                    extra.put("failures", acct.consecutiveFailures);
                    throw new RateLimitedException("RATE_LIMIT_EXCEEDED",
                        "वारंवार चुकीचे प्रयत्न झाल्याने कृपया " + remaining
                            + " सेकंदांनंतर पुन्हा प्रयत्न करा. (Too many failed attempts. Exponential backoff active. Try again in "
                            + remaining + "s.)", extra);
                }
                while (!acct.attempts.isEmpty() && now - acct.attempts.peekFirst() >= limits.authAccountWindowMs()) {
                    acct.attempts.pollFirst();
                }
                acct.attempts.addLast(now);
            }
        }

        // 2. IP limit
        SlidingWindow.Result r = ipWindow.hit(ip, limits.authIpMax(), limits.authIpWindowMs(), now);
        if (!r.allowed()) {
            long s = r.retryAfterSeconds();
            res.setHeader("Retry-After", String.valueOf(s));
            res.setHeader("X-RateLimit-Limit", String.valueOf(limits.authIpMax()));
            res.setHeader("X-RateLimit-Remaining", "0");
            res.setHeader("X-RateLimit-Reset", String.valueOf(r.resetEpochSeconds()));
            throw new RateLimitedException("AUTH_IP_RATE_LIMIT_EXCEEDED",
                "या आयपी पत्त्यावरून प्रमाणीकरणाचे अनेक प्रयत्न झाले आहेत. कृपया " + s
                    + " सेकंदांनंतर प्रयत्न करा. (Too many authentication requests from this IP. Please try again in "
                    + s + "s.)", Map.of("retryAfter", s));
        }

        // 3. Outcome is recorded once the reply is known.
        req.setAttribute(ATTEMPT_ATTRIBUTE, new Attempt(identifier, ip));
    }

    /** Node's recordAuthSuccess: forget the account's failures and the IP's count. */
    void recordSuccess(Attempt attempt) {
        if (attempt.identifier() != null) accounts.remove(attempt.identifier());
        if (attempt.ip() != null) ipWindow.remove(attempt.ip());
    }

    /** Node's recordAuthFailure: count it and start backoff after the allowed failures. */
    void recordFailure(Attempt attempt) {
        if (attempt.identifier() == null) return;
        Account acct = accounts.computeIfAbsent(attempt.identifier(), k -> new Account());
        synchronized (acct) {
            acct.consecutiveFailures++;
            if (acct.consecutiveFailures >= limits.authAccountMax()) {
                int exponent = acct.consecutiveFailures - limits.authAccountMax();
                long delaySec = Math.min(limits.authBackoffMaxSec(),
                    Math.round(limits.authBackoffBaseSec() * Math.pow(limits.authBackoffFactor(), exponent)));
                acct.backoffUntil = System.currentTimeMillis() + delaySec * 1000;
            }
        }
    }

    /** Test hook: forget all counts. */
    public void reset() {
        ipWindow.clear();
        accounts.clear();
    }

    /** 429 with Node's extra fields (retryAfter, backoff, failures) in the body. */
    public static class RateLimitedException extends ApiException {
        private final Map<String, Object> extra;

        RateLimitedException(String code, String message, Map<String, Object> extra) {
            super(HttpStatus.TOO_MANY_REQUESTS, code, message);
            this.extra = Map.copyOf(extra);
        }

        public Map<String, Object> getExtra() { return extra; }
    }
}
