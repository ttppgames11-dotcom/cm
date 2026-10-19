package com.connectmaratha.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.ratelimit.AuthRateLimiter;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Per-account slowdown after wrong passwords, as in the Node login limiter (5 free tries, then 2s, 4s, 8s ...). */
@SpringBootTest(properties = {"app.rate-limit.auth-ip-max=1000", "app.rate-limit.public-max=100000"})
@AutoConfigureMockMvc
class LoginBackoffTest extends PostgresTestBase {

    private static final String HASH = "$2a$08$Zae3AcsrKIX2CdcClj.7tuAXsKIjvusfT/cGyFYXmMqpjHb7ZuJo."; // Swarajya#2026

    @Autowired MockMvc mvc;
    @Autowired AuthRateLimiter limiter;

    @BeforeEach
    void setUp() {
        limiter.reset();
        new JdbcTemplate(dataSource()).update(
            "INSERT INTO members (id, name, email, phone, password_hash) VALUES ('M8100', 'Backoff', 'backoff@example.com', '9811100100', ?) ON CONFLICT DO NOTHING",
            HASH);
    }

    private MockHttpServletRequestBuilder login(String identifier, String password) {
        Map<String, Object> body = new HashMap<>();
        body.put("identifier", identifier);
        body.put("password", password);
        try {
            return post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void afterFiveWrongPasswordsTheAccountIsSlowedDown() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(login("M8100", "wrong")).andExpect(status().isUnauthorized());
        }
        // 5th failure starts a 2 second pause (base 2s x 2^0).
        mvc.perform(login("M8100", "Swarajya#2026"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().string("X-RateLimit-Backoff", "true"))
            .andExpect(header().string("X-RateLimit-Failures", "5"))
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"))
            .andExpect(jsonPath("$.backoff").value(true))
            .andExpect(jsonPath("$.failures").value(5))
            .andExpect(jsonPath("$.retryAfter").isNumber());

        // The same account written differently (case) is the same account.
        mvc.perform(login("m8100", "Swarajya#2026")).andExpect(status().isTooManyRequests());
        // Another account is unaffected.
        mvc.perform(login("M8101", "x")).andExpect(status().isUnauthorized());

        Thread.sleep(2300);
        mvc.perform(login("M8100", "Swarajya#2026")).andExpect(status().isOk());
        // Success clears the failures.
        for (int i = 0; i < 4; i++) {
            mvc.perform(login("M8100", "wrong")).andExpect(status().isUnauthorized());
        }
        mvc.perform(login("M8100", "Swarajya#2026")).andExpect(status().isOk());
    }

    @Test
    void identifiersFollowNodesPickOrder() {
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("identifier", " M1 ", "email", "e@x.com"))).isEqualTo("m1");
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("email", "A@X.com"))).isEqualTo("a@x.com");
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("phone", "98"))).isEqualTo("98");
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("password", "x"))).isNull();
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("identifier", ""))).isNull();
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("identifier", "", "email", "e@x.com"))).isEqualTo("e@x.com");
        assertThat(AuthRateLimiter.accountIdentifier(Map.of("identifier", 12345))).isNull(); // truthy non-string
        assertThat(AuthRateLimiter.accountIdentifier(null)).isNull();
    }
}
