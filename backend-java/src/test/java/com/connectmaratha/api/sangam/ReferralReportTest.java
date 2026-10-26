package com.connectmaratha.api.sangam;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** GET /api/admin/referrals/report: numbers for admins, never customer data. */
@SpringBootTest
@AutoConfigureMockMvc
class ReferralReportTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    int sequence = 0;

    /** The report is global, so every test starts from an empty referrals table. */
    @BeforeEach
    void fresh() {
        rateLimit.reset();
        sequence = 0;
        jdbc.update("DELETE FROM referrals");
        for (String id : List.of("M9701", "M9702", "M9703", "M9704", "M9709")) {
            jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING", id, "Member " + id, "98001" + id.substring(1));
        }
    }

    // ------------------------------------------------------------------ helpers

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    /** A referral with customer data that must never reach the report. createdAt null = now. */
    void referral(String giver, String recipient, String status, Double value, Integer daysAgo) {
        String id = "RPT" + (++sequence);
        String created = daysAgo == null ? "to_char(now(), 'YYYY-MM-DD HH24:MI:SS')"
            : "to_char(now() - interval '" + daysAgo + " days', 'YYYY-MM-DD HH24:MI:SS')";
        jdbc.update("INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone,"
            + " client_email, status, value, notes, created_at) VALUES (?, 'Secret title', 'x', ?, ?, ?, ?, 'Secret Customer', '9822144550',"
            + " 'secret@example.com', ?, ?, 'private note', " + created + ")",
            id, giver, "Giver " + giver, recipient, "Receiver " + recipient, status, value);
    }

    ResultActions report(String token, String query) throws Exception {
        MockHttpServletRequestBuilder req = get("/api/admin/referrals/report" + query);
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andExpect(status().isOk()).andReturn().getResponse().getContentAsString(UTF_8));
    }

    // ------------------------------------------------------------------ access

    @Test
    void reportNeedsALoginAndAnAdmin() throws Exception {
        report(null, "").andExpect(status().isUnauthorized());
        report(token("M9701", "member"), "").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ADMIN_ONLY"));
        for (String role : List.of("admin", "superadmin", "ceo")) report(token("M9709", role), "").andExpect(status().isOk());
    }

    @Test
    void unknownPeriodIsRefused() throws Exception {
        String admin = token("M9709", "admin");
        report(admin, "?period=7d").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        report(admin, "?period=year").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        report(admin, "").andExpect(status().isOk()).andExpect(jsonPath("$.period").value("all"));
        report(admin, "?period=30d").andExpect(status().isOk()).andExpect(jsonPath("$.period").value("30d"));
    }

    // ------------------------------------------------------------------ numbers

    @Test
    void emptyReportHasZerosAndNoWinRate() throws Exception {
        JsonNode r = body(report(token("M9709", "admin"), ""));
        JsonNode s = r.get("summary");
        assertThat(s.get("given").asLong()).isZero();
        assertThat(s.get("won").asLong()).isZero();
        assertThat(s.get("lost").asLong()).isZero();
        assertThat(s.get("open").asLong()).isZero();
        assertThat(s.get("winRate").isNull()).isTrue();
        assertThat(s.get("wonValue").asDouble()).isZero();
        assertThat(r.get("byStatus").findValuesAsText("status"))
            .containsExactly("New", "Contacted", "Qualified", "Proposal", "Won", "Lost", "Other");
        for (JsonNode row : r.get("byStatus")) assertThat(row.get("count").asLong()).isZero();
        assertThat(r.get("topReferrers")).isEmpty();
        assertThat(r.get("topReceivers")).isEmpty();
    }

    private void mixedReferrals() {
        referral("M9701", "M9702", "Won", 1000.0, null);
        referral("M9701", "M9702", "Deal Won", 500.0, null);
        referral("M9701", "M9703", "Lost", 300.0, null);
        referral("M9702", "M9703", "New", null, null);
        referral("M9702", "M9703", "Contacted", 20.0, null);
        referral("M9703", "M9701", null, null, null);
        referral("M9703", "M9701", "In Progress", 99.0, null);
    }

    @Test
    void numbersFollowTheDefinitions() throws Exception {
        mixedReferrals();
        JsonNode s = body(report(token("M9709", "admin"), "")).get("summary");
        assertThat(s.get("given").asLong()).isEqualTo(7);
        assertThat(s.get("won").asLong()).isEqualTo(2);
        assertThat(s.get("lost").asLong()).isEqualTo(1);
        assertThat(s.get("open").asLong()).isEqualTo(4);
        assertThat(s.get("wonValue").asDouble()).isEqualTo(1500.0);
        assertThat(s.get("winRate").asDouble()).isEqualTo(66.7);
    }

    @Test
    void winRateIsExactWhenItDividesEvenly() throws Exception {
        referral("M9701", "M9702", "Won", 10.0, null);
        referral("M9701", "M9702", "Lost", null, null);
        assertThat(body(report(token("M9709", "admin"), "")).at("/summary/winRate").asDouble()).isEqualTo(50.0);
        jdbc.update("DELETE FROM referrals WHERE status = 'Lost'");
        assertThat(body(report(token("M9709", "admin"), "")).at("/summary/winRate").asDouble()).isEqualTo(100.0);
    }

    @Test
    void stageCountsGroupOldWords() throws Exception {
        mixedReferrals();
        JsonNode by = body(report(token("M9709", "admin"), "")).get("byStatus");
        assertThat(by.findValuesAsText("status")).containsExactly("New", "Contacted", "Qualified", "Proposal", "Won", "Lost", "Other");
        long[] expected = {1, 1, 0, 0, 2, 1, 2};
        for (int i = 0; i < expected.length; i++) assertThat(by.get(i).get("count").asLong()).as(by.get(i).get("status").asText()).isEqualTo(expected[i]);
    }

    // ------------------------------------------------------------------ period and top lists

    @Test
    void periodFilterUsesTheGivenDate() throws Exception {
        referral("M9701", "M9702", "New", null, 5);
        referral("M9701", "M9702", "New", null, 45);
        referral("M9701", "M9702", "New", null, 200);
        jdbc.update("INSERT INTO referrals (id, title, giver_id, recipient_id, status, created_at) VALUES ('RPTNULL', 't', 'M9701', 'M9702', 'New', NULL)");
        String admin = token("M9709", "admin");
        assertThat(body(report(admin, "?period=30d")).at("/summary/given").asLong()).isEqualTo(1);
        assertThat(body(report(admin, "?period=90d")).at("/summary/given").asLong()).isEqualTo(2);
        assertThat(body(report(admin, "?period=all")).at("/summary/given").asLong()).isEqualTo(4);
    }

    @Test
    void periodEdgeIsExactToTheHour() throws Exception {
        for (String[] row : new String[][] {{"EDGE1", "29 days 23 hours"}, {"EDGE2", "30 days 1 hour"}, {"EDGE3", "89 days 23 hours"}, {"EDGE4", "90 days 1 hour"}}) {
            jdbc.update("INSERT INTO referrals (id, title, giver_id, recipient_id, status, created_at) VALUES (?, 't', 'M9701', 'M9702', 'New', "
                + "to_char(now() - interval '" + row[1] + "', 'YYYY-MM-DD HH24:MI:SS'))", row[0]);
        }
        String admin = token("M9709", "admin");
        assertThat(body(report(admin, "?period=30d")).at("/summary/given").asLong()).isEqualTo(1);
        assertThat(body(report(admin, "?period=90d")).at("/summary/given").asLong()).isEqualTo(3);
        assertThat(body(report(admin, "?period=all")).at("/summary/given").asLong()).isEqualTo(4);
    }

    @Test
    void topReferrersAreOrderedByWonValueThenCounts() throws Exception {
        // M9701 gave 3: two won worth 2000 in total; M9702 gave 5: one won worth 2000; M9703 gave 1: won worth 9000
        referral("M9701", "M9702", "Won", 1500.0, null);
        referral("M9701", "M9702", "Won", 500.0, null);
        referral("M9701", "M9702", "New", null, null);
        referral("M9702", "M9701", "Won", 2000.0, null);
        for (int i = 0; i < 4; i++) referral("M9702", "M9701", "New", null, null);
        referral("M9703", "M9701", "Won", 9000.0, null);
        JsonNode top = body(report(token("M9709", "admin"), "")).get("topReferrers");
        assertThat(top.findValuesAsText("memberId")).containsExactly("M9703", "M9701", "M9702");
        assertThat(top.get(0).get("given").asLong()).isEqualTo(1);
        assertThat(top.get(0).get("won").asLong()).isEqualTo(1);
        assertThat(top.get(0).get("wonValue").asDouble()).isEqualTo(9000.0);
        assertThat(top.get(1).get("given").asLong()).isEqualTo(3);
        assertThat(top.get(1).get("won").asLong()).isEqualTo(2);
        assertThat(top.get(1).get("wonValue").asDouble()).isEqualTo(2000.0);
        assertThat(top.get(2).get("given").asLong()).isEqualTo(5);
        assertThat(top.get(2).get("won").asLong()).isEqualTo(1);
        assertThat(top.get(2).get("name").asText()).isEqualTo("Member M9702");
    }

    @Test
    void topReceiversMirrorThat() throws Exception {
        referral("M9701", "M9702", "Won", 700.0, null);
        referral("M9703", "M9702", "New", null, null);
        referral("M9701", "M9704", "Lost", null, null);
        JsonNode top = body(report(token("M9709", "admin"), "")).get("topReceivers");
        assertThat(top.findValuesAsText("memberId")).containsExactly("M9702", "M9704");
        assertThat(top.get(0).get("received").asLong()).isEqualTo(2);
        assertThat(top.get(0).get("won").asLong()).isEqualTo(1);
        assertThat(top.get(0).get("wonValue").asDouble()).isEqualTo(700.0);
        // M9701 and M9703 only gave, so they are not receivers
        assertThat(top.findValuesAsText("memberId")).doesNotContain("M9701", "M9703");
    }

    @Test
    void topListsAreCappedAtTen() throws Exception {
        for (int i = 1; i <= 12; i++) {
            String giver = String.format("M98%02d", i);
            jdbc.update("INSERT INTO members (id, name) VALUES (?, ?) ON CONFLICT (id) DO NOTHING", giver, "Giver " + i);
            referral(giver, "M9702", "Won", i * 100.0, null); // M9801 is the weakest, M9812 the strongest
        }
        JsonNode top = body(report(token("M9709", "admin"), "")).get("topReferrers");
        assertThat(top).hasSize(10);
        assertThat(top.get(0).get("memberId").asText()).isEqualTo("M9812");
        assertThat(top.findValuesAsText("memberId")).doesNotContain("M9801", "M9802");
    }

    @Test
    void namesComeFromMembersWithAStoredFallback() throws Exception {
        jdbc.update("UPDATE members SET name = 'Renamed Giver' WHERE id = 'M9704'");
        referral("M9704", "M9702", "New", null, null);
        referral("M9799", "M9702", "New", null, null); // M9799 is not a member (deleted account)
        JsonNode top = body(report(token("M9709", "admin"), "")).get("topReferrers");
        for (JsonNode row : top) {
            if (row.get("memberId").asText().equals("M9704")) assertThat(row.get("name").asText()).isEqualTo("Renamed Giver");
            if (row.get("memberId").asText().equals("M9799")) assertThat(row.get("name").asText()).isEqualTo("Giver M9799");
        }
        assertThat(top.findValuesAsText("memberId")).contains("M9704", "M9799");
    }

    @Test
    void periodAlsoLimitsTheTopLists() throws Exception {
        referral("M9701", "M9702", "Won", 5000.0, 200);
        referral("M9703", "M9702", "New", null, 2);
        JsonNode top = body(report(token("M9709", "admin"), "?period=30d")).get("topReferrers");
        assertThat(top.findValuesAsText("memberId")).containsExactly("M9703");
    }

    @Test
    void replyHoldsNoCustomerData() throws Exception {
        mixedReferrals();
        String raw = report(token("M9709", "admin"), "").andExpect(status().isOk()).andReturn().getResponse().getContentAsString(UTF_8);
        assertThat(raw).doesNotContain("Secret").doesNotContain("9822144550").doesNotContain("secret@example.com").doesNotContain("private note");
    }
}
