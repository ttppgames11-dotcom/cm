package com.connectmaratha.api.officer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.ResultActions;

/** /api/officers/.../requests: guidance requests, accept / decline / cancel, the switch, phones and notifications. */
@SpringBootTest
@AutoConfigureMockMvc
class OfficerRequestsTest extends OfficerTestBase {

    static final String QUESTION = "Zo अभ्यास कसा सुरू करू?";

    static Map<String, Object> request() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("exam", "mpsc_group_b");
        b.put("stage", "prelims");
        b.put("question", QUESTION);
        b.put("mode", "phone");
        return b;
    }

    ResultActions ask(String token, String officerId, Map<String, Object> body) throws Exception {
        return send(post("/api/officers/" + officerId + "/requests"), token, body);
    }

    String sent(String token, String officerId, Map<String, Object> body) throws Exception {
        return body(ask(token, officerId, body).andExpect(status().isCreated())).get("request").get("id").asText();
    }

    ResultActions answer(String token, String requestId, String action) throws Exception {
        return send(put("/api/officers/requests/" + requestId), token, action(action));
    }

    JsonNode mine(String token) throws Exception {
        return body(send(get("/api/officers/requests/mine"), token, null).andExpect(status().isOk())).get("requests");
    }

    JsonNode incoming(String token) throws Exception {
        return body(send(get("/api/officers/requests/incoming"), token, null).andExpect(status().isOk())).get("requests");
    }

    Map<String, Object> last(String memberId) {
        List<Map<String, Object>> told = notificationsOf(memberId);
        return told.get(told.size() - 1);
    }

    @Test
    void requestsNeedALogin() throws Exception {
        String id = approved(1);
        ask(null, id, request()).andExpect(status().isUnauthorized());
        send(get("/api/officers/requests/mine"), null, null).andExpect(status().isUnauthorized());
        send(get("/api/officers/requests/incoming"), null, null).andExpect(status().isUnauthorized());
        send(put("/api/officers/requests/ORQ-x"), null, action("accept")).andExpect(status().isUnauthorized());
    }

    @Test
    void studentSendsARequest() throws Exception {
        String officer = approved(1);
        JsonNode r = body(ask(m(2), officer, request()).andExpect(status().isCreated())).get("request");
        assertThat(r.get("id").asText()).startsWith("ORQ-");
        assertThat(r.get("status").asText()).isEqualTo("new");
        assertThat(r.get("exam").asText()).isEqualTo("mpsc_group_b");

        Map<String, Object> told = last("M9201");
        assertThat(told.get("type")).isEqualTo("officer_request");
        assertThat(told.get("title")).isEqualTo("🧭 नवीन मार्गदर्शन विनंती: MPSC गट ब");
        assertThat(told.get("message")).isEqualTo("Member M9202: " + QUESTION);
        assertThat(find(publicList(m(2), ""), officer).get("requested").asBoolean()).isTrue();
    }

    @Test
    void requestRulesAreChecked() throws Exception {
        String officer = approved(1);
        ask(m(1), officer, request()).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("OWN_PROFILE"));
        String waiting = apply(m(3), profile("Zo Waiting"));
        ask(m(2), waiting, request()).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("OFFICER_NOT_FOUND"));
        String hidden = approved(4);
        adminAct(hidden, action("hide"));
        ask(m(2), hidden, request()).andExpect(status().isNotFound());
        ask(m(2), "OFF-nope", request()).andExpect(status().isNotFound());

        sent(m(2), officer, request());
        ask(m(2), officer, request()).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("REQUEST_EXISTS"));
    }

    @Test
    void examMustBeTheOfficers() throws Exception {
        String officer = approved(1);
        ask(m(2), officer, with(request(), "exam", "upsc_cse"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("EXAM_NOT_OFFERED"));
        ask(m(2), officer, with(request(), "exam", "neet")).andExpect(status().isBadRequest());
        ask(m(2), officer, with(request(), "stage", "final")).andExpect(status().isBadRequest());
        ask(m(2), officer, with(request(), "mode", "letter")).andExpect(status().isBadRequest());
        ask(m(2), officer, with(request(), "question", null)).andExpect(status().isBadRequest());
        ask(m(2), officer, with(request(), "question", "x".repeat(501))).andExpect(status().isBadRequest());
    }

    @Test
    void pausedOfficerRefusesNewRequests() throws Exception {
        String officer = approved(1);
        String old = sent(m(2), officer, request());
        setAccepting(m(1), false).andExpect(status().isOk());
        ask(m(3), officer, request()).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("NOT_ACCEPTING"));
        answer(m(1), old, "accept").andExpect(status().isOk());
    }

    @Test
    void longQuestionIsShortenedInTheBellOnly() throws Exception {
        String officer = approved(1);
        String question = "Zo " + "प".repeat(197);
        String req = sent(m(2), officer, with(request(), "question", question));
        assertThat(last("M9201").get("message")).isEqualTo("Member M9202: " + question.substring(0, 80) + "…");
        assertThat(jdbc.queryForObject("SELECT question FROM officer_requests WHERE id = ?", String.class, req)).isEqualTo(question);
    }

    @Test
    void onlyTheRequestsOwnFieldsAreSaved() throws Exception {
        String officer = approved(1);
        Map<String, Object> b = request();
        b.put("status", "accepted");
        b.put("officer_id", "OFF-other");
        String req = sent(m(2), officer, b);
        Map<String, Object> row = jdbc.queryForMap("SELECT status, officer_id FROM officer_requests WHERE id = ?", req);
        assertThat(row.get("status")).isEqualTo("new");
        assertThat(row.get("officer_id")).isEqualTo(officer);
    }

    @Test
    void atMostFiveRequestsADay() throws Exception {
        for (int i = 0; i < 5; i++) sent(m(6), adminAdded("Zo Guest " + i), request());
        ask(m(6), adminAdded("Zo Guest 5"), request())
            .andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void officerAcceptsAndThePhoneIsShared() throws Exception {
        String officer = approved(1);
        String req = sent(m(2), officer, request());
        assertThat(find(mine(m(2)), req).get("officer").has("phone")).isFalse();
        JsonNode in = find(incoming(m(1)), req);
        assertThat(in.get("student").get("name").asText()).isEqualTo("Member M9202");
        assertThat(in.get("student").get("phone").asText()).isEqualTo(phoneOf("M9202"));
        assertThat(in.get("question").asText()).isEqualTo(QUESTION);

        answer(m(1), req, "accept").andExpect(status().isOk());
        Map<String, Object> told = notificationsOf("M9202").get(0);
        assertThat(told.get("type")).isEqualTo("officer_reply");
        assertThat(told.get("title")).isEqualTo("✅ Zo Officer 1 यांनी तुमची विनंती स्वीकारली");
        JsonNode after = find(mine(m(2)), req);
        assertThat(after.get("status").asText()).isEqualTo("accepted");
        assertThat(after.get("officer").get("phone").asText()).isEqualTo("9876500021");
    }

    @Test
    void declinedRequestsShareNoPhone() throws Exception {
        String officer = approved(1);
        String req = sent(m(2), officer, request());
        answer(m(1), req, "decline").andExpect(status().isOk());
        assertThat(notificationsOf("M9202").get(0).get("title")).isEqualTo("❌ Zo Officer 1 यांनी तुमची विनंती नाकारली");
        assertThat(find(mine(m(2)), req).get("officer").has("phone")).isFalse();
        assertThat(mine(m(2)).toString()).doesNotContain("9876500021");
    }

    @Test
    void onlyTheRightPeopleAnswer() throws Exception {
        String officer = approved(1);
        String req = sent(m(2), officer, request());
        answer(m(2), req, "accept").andExpect(status().isForbidden());
        answer(m(1), req, "cancel").andExpect(status().isForbidden());
        answer(m(3), req, "decline").andExpect(status().isForbidden());
        answer(admin(), req, "accept").andExpect(status().isForbidden());
        answer(m(3), "ORQ-nope", "decline").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("REQUEST_NOT_FOUND"));
        answer(m(2), req, "cancel").andExpect(status().isOk());
        assertThat(find(mine(m(2)), req).get("status").asText()).isEqualTo("cancelled");
        assertThat(notificationsOf("M9202")).isEmpty();
    }

    @Test
    void answeredOnce() throws Exception {
        String officer = approved(1);
        String req = sent(m(2), officer, request());
        answer(m(1), req, "accept").andExpect(status().isOk());
        answer(m(1), req, "decline").andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALREADY_ANSWERED"));
        answer(m(2), req, "cancel").andExpect(status().isConflict());
    }

    @Test
    void askingAgainAfterAnAnswer() throws Exception {
        String officer = approved(1);
        String req = sent(m(2), officer, request());
        answer(m(1), req, "decline").andExpect(status().isOk());
        sent(m(2), officer, request());
    }

    @Test
    void officerWithoutAnAccountGoesToAdmins() throws Exception {
        String guest = adminAdded("Zo Guest");
        String req = sent(m(2), guest, request());

        List<Map<String, Object>> adminTold = notificationsOf(ADMIN);
        assertThat(adminTold).hasSize(1);
        assertThat(adminTold.get(0).get("type")).isEqualTo("officer_admin");
        assertThat(adminTold.get(0).get("title")).isEqualTo("⭐ Zo Guest साठी नवीन मार्गदर्शन विनंती");
        assertThat(adminTold.get(0).get("message")).isEqualTo("Member M9202: " + QUESTION + ". अधिकाऱ्यांना फोन करून उत्तर द्या.");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM notifications WHERE member_id IS NULL AND type LIKE 'officer%'", Integer.class)).isZero();

        JsonNode forAdmin = body(send(get("/api/admin/officers/requests"), admin(), null).andExpect(status().isOk())).get("requests");
        JsonNode r = find(forAdmin, req);
        assertThat(r.get("student").get("phone").asText()).isEqualTo(phoneOf("M9202"));
        assertThat(r.get("officer").get("phone").asText()).isEqualTo("9876500021");
        send(get("/api/admin/officers/requests"), m(3), null).andExpect(status().isForbidden());

        answer(m(3), req, "accept").andExpect(status().isForbidden());
        answer(admin(), req, "accept").andExpect(status().isOk());
        assertThat(notificationsOf("M9202").get(0).get("type")).isEqualTo("officer_reply");
    }

    @Test
    void rejectedOfficerCanStillAnswerOldRequests() throws Exception {
        String officer = approved(1);
        String req = sent(m(2), officer, request());
        adminAct(officer, action("reject")).andExpect(status().isOk());
        answer(m(1), req, "accept").andExpect(status().isOk());
        ask(m(3), officer, request()).andExpect(status().isNotFound());
    }

    @Test
    void aFailingNotificationStillSavesTheRequest() throws Exception {
        String officer = approved(1);
        jdbc.execute("ALTER TABLE notifications RENAME TO notifications_off");
        String req;
        try {
            req = sent(m(2), officer, request());
        } finally {
            jdbc.execute("ALTER TABLE notifications_off RENAME TO notifications");
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM officer_requests WHERE id = ?", Integer.class, req)).isEqualTo(1);
    }
}
