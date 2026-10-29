package com.connectmaratha.api.job;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
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

/** /api/jobs/alerts: up to 3 saved alerts per member, and a notification when a matching job is posted. */
@SpringBootTest
@AutoConfigureMockMvc
class JobAlertsTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() throws Exception {
        rateLimit.reset();
        // adds the columns and the alerts table before cleaning
        send(get("/api/jobs"), null, null).andExpect(status().isOk());
        jdbc.update("DELETE FROM job_alerts WHERE member_id LIKE 'M90%'");
        String jobs = "SELECT id FROM jobs WHERE poster_id LIKE 'M90%' OR title LIKE 'Zj%'";
        jdbc.update("DELETE FROM job_applications WHERE job_id IN (" + jobs + ") OR member_id LIKE 'M90%'");
        jdbc.update("DELETE FROM jobs WHERE poster_id LIKE 'M90%' OR title LIKE 'Zj%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M90%'");
        for (String id : List.of("M9001", "M9002", "M9003", "M9004", "M9005", "M9006")) {
            jdbc.update("INSERT INTO members (id, name, phone, role) VALUES (?, ?, ?, 'member') "
                + "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = 'member'",
                id, "Member " + id, "98000" + id.substring(1));
        }
    }

    // ------------------------------------------------------------------ helpers

    String m(int n) {
        return "Bearer " + jwt.generate("M900" + n, "Test", "member", "Gold");
    }

    static Map<String, Object> jobBody() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("title", "Zj Accountant");
        b.put("company", "Zj Traders");
        b.put("district", "पुणे");
        b.put("category", "Finance & Accounts");
        b.put("salary", "₹25,000");
        b.put("phone", "9876500001");
        return b;
    }

    ResultActions send(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) req.header("Authorization", token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
        return mvc.perform(req);
    }

    JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString(UTF_8));
    }

    ResultActions alert(String token, String district, String category) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        if (district != null) b.put("district", district);
        if (category != null) b.put("category", category);
        return send(post("/api/jobs/alerts"), token, b);
    }

    String alertId(String token, String district, String category) throws Exception {
        return body(alert(token, district, category).andExpect(status().isCreated())).get("alert").get("id").asText();
    }

    List<Map<String, Object>> notificationsOf(String memberId) {
        return jdbc.queryForList("SELECT * FROM notifications WHERE member_id = ? AND type = 'job_alert'", memberId);
    }

    int alertRows(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM job_alerts WHERE member_id = ?", Integer.class, memberId);
    }

    JsonNode postJob(String token) throws Exception {
        return body(send(post("/api/jobs"), token, jobBody()).andExpect(status().isCreated()));
    }

    // ------------------------------------------------------------------ saving alerts

    @Test
    void alertsNeedALogin() throws Exception {
        send(get("/api/jobs/alerts"), null, null).andExpect(status().isUnauthorized());
        alert(null, "पुणे", "Finance & Accounts").andExpect(status().isUnauthorized());
        send(delete("/api/jobs/alerts/JA-1"), null, null).andExpect(status().isUnauthorized());
    }

    @Test
    void memberAddsListsAndDeletesAlerts() throws Exception {
        String first = alertId(m(1), "पुणे", "Finance & Accounts");
        assertThat(first).startsWith("JA-");
        JsonNode any = body(alert(m(1), "सर्व", "IT & Software").andExpect(status().isCreated())).get("alert");
        assertThat(any.get("district").isNull()).isTrue();
        assertThat(any.get("category").asText()).isEqualTo("IT & Software");

        JsonNode list = body(send(get("/api/jobs/alerts"), m(1), null).andExpect(status().isOk()));
        assertThat(list.get("count").asInt()).isEqualTo(2);
        assertThat(list.get("alerts").get(0).get("id").asText()).isEqualTo(first);
        assertThat(list.get("alerts").get(0).get("district").asText()).isEqualTo("पुणे");

        send(delete("/api/jobs/alerts/" + first), m(1), null).andExpect(status().isOk());
        assertThat(body(send(get("/api/jobs/alerts"), m(1), null)).get("count").asInt()).isEqualTo(1);
    }

    @Test
    void bothAnyIsRefused() throws Exception {
        alert(m(1), "सर्व", "all").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        alert(m(1), "", "").andExpect(status().isBadRequest());
        alert(m(1), null, null).andExpect(status().isBadRequest());
        alert(m(1), "", "सर्व").andExpect(status().isBadRequest());
        assertThat(alertRows("M9001")).isZero();
    }

    @Test
    void badCategoryIsRefused() throws Exception {
        alert(m(1), "पुणे", "Cooking").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        alert(m(1), "x".repeat(101), null).andExpect(status().isBadRequest());
        assertThat(alertRows("M9001")).isZero();
    }

    @Test
    void atMostThreeAlerts() throws Exception {
        alertId(m(1), "पुणे", null);
        alertId(m(1), "सातारा", null);
        alertId(m(1), null, "Manufacturing");
        alert(m(1), "मुंबई", null).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALERT_LIMIT"));
        assertThat(alertRows("M9001")).isEqualTo(3);
    }

    @Test
    void sameAlertTwiceIsRefused() throws Exception {
        alertId(m(1), "Pune", "Finance & Accounts");
        alert(m(1), " pune ", "Finance & Accounts").andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALERT_EXISTS"));
        assertThat(alertRows("M9001")).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT district FROM job_alerts WHERE member_id = 'M9001'", String.class)).isEqualTo("Pune");
    }

    @Test
    void othersCannotDeleteMyAlert() throws Exception {
        String id = alertId(m(1), "पुणे", null);
        send(delete("/api/jobs/alerts/" + id), m(2), null).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ALERT_NOT_FOUND"));
        assertThat(alertRows("M9001")).isEqualTo(1);
        send(delete("/api/jobs/alerts/JA-Zj0"), m(1), null).andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------ matching

    @Test
    void matchingMembersAreTold() throws Exception {
        alertId(m(2), "पुणे", "Finance & Accounts");
        alertId(m(3), null, "Finance & Accounts");
        alertId(m(4), " पुणे ", null);
        alertId(m(5), "सातारा", "Finance & Accounts");
        alertId(m(6), "पुणे", "IT & Software");
        alertId(m(1), "पुणे", null);

        assertThat(postJob(m(1)).get("alerted").asInt()).isEqualTo(3);
        for (String id : List.of("M9002", "M9003", "M9004")) {
            List<Map<String, Object>> rows = notificationsOf(id);
            assertThat(rows).as(id).hasSize(1);
            assertThat(rows.get(0).get("title")).isEqualTo("💼 नवीन नोकरी: Zj Accountant — पुणे");
            assertThat(rows.get(0).get("message")).isEqualTo("Zj Traders · ₹25,000. रोजगार केंद्रात पहा.");
        }
        for (String id : List.of("M9005", "M9006", "M9001")) assertThat(notificationsOf(id)).as(id).isEmpty();
    }

    @Test
    void twoMatchingAlertsGiveOneNotification() throws Exception {
        alertId(m(2), "पुणे", null);
        alertId(m(2), null, "Finance & Accounts");
        assertThat(postJob(m(1)).get("alerted").asInt()).isEqualTo(1);
        assertThat(notificationsOf("M9002")).hasSize(1);
    }

    @Test
    void alertsAreCappedAt200() throws Exception {
        jdbc.update("""
            INSERT INTO job_alerts (id, member_id, district)
            SELECT 'JA-Zj' || g, 'M90A' || lpad(g::text, 3, '0'), 'पुणे' FROM generate_series(1, 205) g""");
        try {
            assertThat(postJob(m(1)).get("alerted").asInt()).isEqualTo(200);
        } finally {
            jdbc.update("DELETE FROM job_alerts WHERE member_id LIKE 'M90A%'");
            jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M90A%'");
        }
    }
}
