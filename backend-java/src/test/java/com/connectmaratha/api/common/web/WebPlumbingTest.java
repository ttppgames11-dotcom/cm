package com.connectmaratha.api.common.web;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** Error replies and login checks must match the Node backend exactly. */
@SpringBootTest
@AutoConfigureMockMvc
class WebPlumbingTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void freshLimits() {
        rateLimit.reset();
    }

    @Test
    void unknownRouteGetsTheNode404() throws Exception {
        mvc.perform(get("/api/nope"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("ROUTE_NOT_FOUND"))
            .andExpect(jsonPath("$.error").value("विनंती केलेला मार्ग आढळला नाही (Requested endpoint not found)."));
    }

    @Test
    void wrongMethodAlsoGetsThe404LikeNode() throws Exception {
        mvc.perform(put("/api/health")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ROUTE_NOT_FOUND"));
    }

    @Test
    void serverErrorsHideInternalDetails() throws Exception {
        mvc.perform(get("/api/test/boom"))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.code").value("INTERNAL_SERVER_ERROR"))
            .andExpect(jsonPath("$.errorId").value(org.hamcrest.Matchers.startsWith("ERR-")))
            .andExpect(content().string(not(containsString("syntax error"))))
            .andExpect(content().string(not(containsString("/var/app"))));
    }

    @Test
    void apiErrorsKeepTheirCodeAndMessage() throws Exception {
        mvc.perform(get("/api/test/bad"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REPORT"))
            .andExpect(jsonPath("$.error").value("अवैध तक्रार. कृपया कारण निवडा."));
    }

    @Test
    void brokenJsonGetsTheNodeMessage() throws Exception {
        mvc.perform(post("/api/test/echo").contentType(MediaType.APPLICATION_JSON).content("{ broken"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_JSON_BODY"));
    }

    @Test
    void loginRequiredWithoutTokenIs401TokenMissing() throws Exception {
        mvc.perform(get("/api/test/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("प्रमाणीकरण आवश्यक आहे (Token missing)"));
    }

    @Test
    void loginRequiredWithBadTokenIs403() throws Exception {
        mvc.perform(get("/api/test/me").header("Authorization", "Bearer not.a.token"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error").value("अवैध टोकन (Invalid or expired token)"));
    }

    @Test
    void validTokenReachesTheEndpointWithTheMember() throws Exception {
        String token = jwt.generate("M1001", "Test", "admin", "Gold");
        mvc.perform(get("/api/test/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("M1001"))
            .andExpect(jsonPath("$.role").value("admin"));
    }

    @Test
    void optionalLoginWorksBothWays() throws Exception {
        mvc.perform(get("/api/test/optional")).andExpect(jsonPath("$.loggedIn").value(false));
        String token = jwt.generate("M1001", "Test", "member", "Gold");
        mvc.perform(get("/api/test/optional").header("Authorization", "Bearer " + token))
            .andExpect(jsonPath("$.loggedIn").value(true));
        // A bad token on an optional endpoint is simply ignored, like Node's optionalToken.
        mvc.perform(get("/api/test/optional").header("Authorization", "Bearer bad"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.loggedIn").value(false));
    }
}
