package com.connectmaratha.api.sangam;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.sangam.service.ReferralLimiter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** /api/sangam/referrals: private, real, receiver-controlled business referrals. */
@SpringBootTest
@AutoConfigureMockMvc
class ReferralEndpointsTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired ReferralLimiter limiter;
    @Autowired RateLimitFilter rateLimit;

    /** M9601 giver, M9602 receiver (visible business), M9603 only a hidden business, M9604 no business, M9609 admin. */
    @BeforeEach
    void fresh() {
        limiter.reset();
        rateLimit.reset();
        jdbc.update("DELETE FROM referrals WHERE title LIKE 'Zr%' OR giver_id LIKE 'M96%' OR recipient_id LIKE 'M96%'");
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zr%'");
        for (String id : List.of("M9601", "M9602", "M9603", "M9604", "M9609")) {
            jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING", id, "Member " + id, "98000" + id.substring(1));
        }
        business("ZRB1", "Zr Shop One", "M9602", "visible");
        business("ZRB2", "Zr Shop Hidden", "M9603", "hidden");
    }

    // ------------------------------------------------------------------ helpers

    void business(String id, String name, String ownerId, String status) {
        jdbc.update("INSERT INTO businesses (id, name, owner, cat, owner_id, status) VALUES (?, ?, 'x', 'it', ?, ?)", id, name, ownerId, status);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    static Map<String, Object> referral(String recipientId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", "Zr Office interior");
        body.put("clientName", "Suresh Kale");
        body.put("clientPhone", "9822144550");
        body.put("recipientId", recipientId);
        body.put("category", "इंटेरियर");
        body.put("notes", "लवकर संपर्क करा");
        return body;
    }

    static Map<String, Object> with(Map<String, Object> body, String key, Object value) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        copy.put(key, value);
        return copy;
    }

    ResultActions give(String token, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/sangam/referrals").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    /** Gives a referral as the member and returns its id. */
    String given(String giverToken, String recipientId, String title) throws Exception {
        String body = give(giverToken, with(referral(recipientId), "title", title)).andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString(UTF_8);
        return json.readTree(body).at("/referral/id").asText();
    }

    Map<String, Object> row(String id) {
        return jdbc.queryForMap("SELECT * FROM referrals WHERE id = ?", id);
    }

    // ------------------------------------------------------------------ giving a referral

    @Test
    void givingNeedsALogin() throws Exception {
        give(null, referral("M9602")).andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM referrals WHERE title = 'Zr Office interior'", Integer.class)).isZero();
    }

    @Test
    void giveSavesTheReferralWithRealNames() throws Exception {
        String body = give(token("M9601", "member"), referral("M9602"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.referral.giver_id").value("M9601"))
            .andExpect(jsonPath("$.referral.giver_name").value("Member M9601"))
            .andExpect(jsonPath("$.referral.recipient_id").value("M9602"))
            .andExpect(jsonPath("$.referral.recipient_name").value("Member M9602"))
            .andExpect(jsonPath("$.referral.client_name").value("Suresh Kale"))
            .andExpect(jsonPath("$.referral.client_phone").value("9822144550"))
            .andExpect(jsonPath("$.referral.status").value("New"))
            .andExpect(jsonPath("$.referral.role").value("giver"))
            .andExpect(jsonPath("$.referral.business_id").doesNotExist())
            .andReturn().getResponse().getContentAsString(UTF_8);
        String id = json.readTree(body).at("/referral/id").asText();
        assertThat(id).startsWith("REF-");
        Map<String, Object> saved = row(id);
        assertThat(saved.get("giver_id")).isEqualTo("M9601");
        assertThat(saved.get("recipient_id")).isEqualTo("M9602");
        assertThat(saved.get("business_id")).isNull();
    }

    @Test
    void giverAndReceiverNamesCannotBeForged() throws Exception {
        Map<String, Object> body = referral("M9602");
        body.put("giver_id", "M9604");
        body.put("giverName", "Fake Giver");
        body.put("giver_name", "Fake Giver");
        body.put("recipient_name", "Fake Receiver");
        String id = json.readTree(give(token("M9601", "member"), body).andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString(UTF_8)).at("/referral/id").asText();
        Map<String, Object> saved = row(id);
        assertThat(saved.get("giver_id")).isEqualTo("M9601");
        assertThat(saved.get("giver_name")).isEqualTo("Member M9601");
        assertThat(saved.get("recipient_name")).isEqualTo("Member M9602");
    }

    @Test
    void receiverMustOwnAVisibleBusiness() throws Exception {
        for (String recipient : List.of("M9604", "M9603", "M0000")) {
            give(token("M9601", "member"), referral(recipient)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("RECIPIENT_NOT_ELIGIBLE"));
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM referrals WHERE giver_id = 'M9601'", Integer.class)).isZero();
    }

    @Test
    void cannotReferYourself() throws Exception {
        give(token("M9602", "member"), referral("M9602")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("SELF_REFERRAL"));
    }

    @Test
    void businessMustBelongToTheReceiver() throws Exception {
        give(token("M9601", "member"), with(referral("M9602"), "businessId", "ZRB2")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BUSINESS_NOT_RECEIVERS"));
        String id = json.readTree(give(token("M9601", "member"), with(referral("M9602"), "businessId", "ZRB1"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.referral.business_id").value("ZRB1"))
            .andReturn().getResponse().getContentAsString(UTF_8)).at("/referral/id").asText();
        assertThat(row(id).get("business_id")).isEqualTo("ZRB1");
    }

    @Test
    void requiredFieldsAndPhoneFormat() throws Exception {
        String t = token("M9601", "member");
        for (String missing : List.of("title", "clientName", "clientPhone", "recipientId")) {
            Map<String, Object> body = referral("M9602");
            body.remove(missing);
            give(t, body).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
        give(t, with(referral("M9602"), "clientPhone", "12345")).andExpect(status().isBadRequest());
        give(t, with(referral("M9602"), "clientEmail", "not-an-email")).andExpect(status().isBadRequest());
        give(t, with(referral("M9602"), "value", -5)).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM referrals WHERE giver_id = 'M9601'", Integer.class)).isZero();
    }

    @Test
    void snakeCaseFieldsAndMessyPhoneAreAccepted() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", "Zr Snake case");
        body.put("client_name", "Priya");
        body.put("client_phone", "+91 98221-44550");
        body.put("recipient_id", "M9602");
        body.put("requirement", "ignored");
        body.put("prospect", "ignored");
        body.put("estimatedValue", 5);
        body.put("city", "Pune");
        String id = json.readTree(give(token("M9601", "member"), body).andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString(UTF_8)).at("/referral/id").asText();
        assertThat(row(id).get("client_phone")).isEqualTo("+919822144550");
        assertThat(row(id).get("client_name")).isEqualTo("Priya");
    }

    @Test
    void twentyFirstReferralInADayIsRefused() throws Exception {
        String t = token("M9601", "member");
        for (int i = 0; i < 20; i++) give(t, with(referral("M9602"), "title", "Zr Bulk " + i)).andExpect(status().isCreated());
        give(t, with(referral("M9602"), "title", "Zr One too many")).andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }
}
