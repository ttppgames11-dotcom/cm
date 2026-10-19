package com.connectmaratha.api.ratelimit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/** Small limits so the Node limiter's behaviour can be checked quickly. */
@SpringBootTest(properties = {
    "app.rate-limit.public-max=3",
    "app.rate-limit.user-max=5",
    "app.rate-limit.auth-ip-max=2"
})
@AutoConfigureMockMvc
class RateLimitTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired RateLimitFilter rateLimit;
    @Autowired AuthRateLimiter authLimiter;

    @BeforeEach
    void freshLimits() {
        rateLimit.reset();
        authLimiter.reset();
    }

    @Test
    void visitorsAreLimitedPerIpWithNodeHeadersAndBody() throws Exception {
        for (int i = 0; i < 3; i++) {
            mvc.perform(get("/api/test/optional").header("X-Forwarded-For", "203.0.113.7"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-RateLimit-Limit", "3"))
                .andExpect(header().string("X-RateLimit-Remaining", String.valueOf(2 - i)));
        }
        mvc.perform(get("/api/test/optional").header("X-Forwarded-For", "203.0.113.7"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"))
            .andExpect(jsonPath("$.tier").value("public"))
            .andExpect(jsonPath("$.retryAfter").isNumber());
        // A different visitor is counted separately.
        mvc.perform(get("/api/test/optional").header("X-Forwarded-For", "203.0.113.8"))
            .andExpect(status().isOk());
    }

    @Test
    void loggedInMembersHaveTheirOwnLargerAllowance() throws Exception {
        String token = jwt.generate("M1001", "Test", "member", "Gold");
        for (int i = 0; i < 5; i++) {
            mvc.perform(get("/api/test/optional").header("Authorization", "Bearer " + token)
                    .header("X-Forwarded-For", "203.0.113.9"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-RateLimit-Limit", "5"));
        }
        mvc.perform(get("/api/test/optional").header("Authorization", "Bearer " + token))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.tier").value("authenticated"));
    }

    @Test
    void healthIsNeverLimited() throws Exception {
        for (int i = 0; i < 10; i++) {
            mvc.perform(get("/api/health").header("X-Forwarded-For", "203.0.113.10")).andExpect(status().isOk());
        }
    }

    @Test
    void authRoutesUseTheSeparateLoginAttemptLimit() throws Exception {
        for (int i = 0; i < 2; i++) {
            mvc.perform(post("/api/auth/login-probe").header("X-Forwarded-For", "198.51.100.1"))
                .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/auth/login-probe").header("X-Forwarded-For", "198.51.100.1"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.code").value("AUTH_IP_RATE_LIMIT_EXCEEDED"))
            .andExpect(jsonPath("$.retryAfter").isNumber());
    }
}
