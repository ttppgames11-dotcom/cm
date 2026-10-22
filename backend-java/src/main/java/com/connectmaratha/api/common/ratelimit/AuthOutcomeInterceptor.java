package com.connectmaratha.api.common.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * After an auth request that passed {@link AuthRateLimiter#check}, records the
 * outcome like Node's res.json hook: 2xx is a success, any error reply a failure.
 */
@Component
public class AuthOutcomeInterceptor implements HandlerInterceptor {

    private final AuthRateLimiter limiter;

    public AuthOutcomeInterceptor(AuthRateLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object handler, Exception ex) {
        if (!(req.getAttribute(AuthRateLimiter.ATTEMPT_ATTRIBUTE) instanceof AuthRateLimiter.Attempt attempt)) return;
        int status = res.getStatus();
        if (status >= 200 && status < 300) {
            limiter.recordSuccess(attempt);
        } else if (status >= 400) {
            limiter.recordFailure(attempt);
        }
    }
}
