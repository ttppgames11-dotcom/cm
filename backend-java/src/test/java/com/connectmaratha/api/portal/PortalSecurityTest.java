package com.connectmaratha.api.portal;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.portal.service.SubmissionLimiter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * The older community forms are deliberately stricter than the Node backend:
 * only form fields are saved, sensitive lists are admin-only, private fields stay out of
 * public lists, and one IP cannot flood the forms.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PortalSecurityTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired SubmissionLimiter limiter;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    @AfterEach
    void freshLimits() {
        limiter.reset();
        rateLimit.reset();
    }

    private ResultActions send(String path, Map<String, Object> body) throws Exception {
        return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body)));
    }

    @Test
    void senderCannotSetTheServersOwnFields() throws Exception {
        Map<String, Object> volunteer = new LinkedHashMap<>();
        volunteer.put("name", "Safe Volunteer");
        volunteer.put("id", "HACKED-1");
        volunteer.put("verified", true);
        volunteer.put("isAdmin", true);
        send("/api/social/volunteers", volunteer)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.volunteer.name").value("Safe Volunteer"))
            .andExpect(jsonPath("$.volunteer.id").value(startsWith("VOL-")))
            .andExpect(jsonPath("$.volunteer.verified").doesNotExist())
            .andExpect(jsonPath("$.volunteer.isAdmin").doesNotExist());

        send("/api/matrimony", Map.of("name", "Safe Vadhu", "gender", "वधू", "verified", false,
                "caste", "other", "id", "HACKED-2"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.profile.id").value(startsWith("CM-F-")))
            .andExpect(jsonPath("$.profile.verified").value(true))
            .andExpect(jsonPath("$.profile.caste").value("९६ कुळी मराठा"));

        send("/api/political/grievances", Map.of("details", "Road", "createdAt", "yesterday"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.grievance.createdAt").value(not("yesterday")));
    }

    @Test
    void publicMatrimonyListHidesPhoneNumbers() throws Exception {
        send("/api/matrimony", Map.of("name", "Phone Hidden Vara", "gender", "वर (Groom)", "phone", "9876500011"))
            .andExpect(status().isCreated());
        mvc.perform(get("/api/matrimony"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("Phone Hidden Vara")))
            .andExpect(content().string(not(containsString("9876500011"))));
    }

    @Test
    void sensitiveListsAreForAdminsOnly() throws Exception {
        String member = jwt.generate("M5001", "Member", "member", "Gold");
        String admin = jwt.generate("M5002", "Admin", "admin", "Gold");
        for (String path : List.of("/api/political/grievances", "/api/women/help", "/api/bank/loans")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
            mvc.perform(get(path).header("Authorization", "Bearer " + member))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ADMIN_ONLY"));
            mvc.perform(get(path).header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Test
    void oversizedOrWrongTypeFieldsAreRejected() throws Exception {
        send("/api/social/volunteers", Map.of("name", "x".repeat(101)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        // Node failed with a server error here
        send("/api/matrimony", Map.of("gender", 5))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void oneSenderCannotFloodTheForms() throws Exception {
        for (int i = 0; i < 20; i++) {
            send("/api/social/volunteers", Map.of("name", "Volunteer " + i)).andExpect(status().isCreated());
        }
        send("/api/women/help", Map.of("name", "One too many"))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }
}
