package com.connectmaratha.api.speaker;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.ResultActions;

/** /api/speakers/.../requests: talk and guidance requests, accept / decline / cancel, phones and notifications. */
@SpringBootTest
@AutoConfigureMockMvc
class SpeakerRequestsTest extends SpeakerTestBase {

    static final String DATE = LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(10).toString();

    static Map<String, Object> talk() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("kind", "talk");
        b.put("event_date", DATE);
        b.put("place", "Zs Satara");
        b.put("event_type", "शिवजयंती");
        b.put("audience", 300);
        return b;
    }

    static Map<String, Object> guidance() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("kind", "guidance");
        b.put("topic", "Zs MPSC");
        b.put("mode", "phone");
        return b;
    }

    ResultActions request(String token, String speakerId, Map<String, Object> body) throws Exception {
        return send(post("/api/speakers/" + speakerId + "/requests"), token, body);
    }

    String sent(String token, String speakerId, Map<String, Object> body) throws Exception {
        return body(request(token, speakerId, body).andExpect(status().isCreated())).get("request").get("id").asText();
    }

    ResultActions answer(String token, String requestId, String action) throws Exception {
        return send(put("/api/speakers/requests/" + requestId), token, action(action));
    }

    JsonNode find(JsonNode list, String id) {
        for (JsonNode r : list) if (id.equals(r.get("id").asText())) return r;
        return null;
    }

    JsonNode mine(String token) throws Exception {
        return body(send(get("/api/speakers/requests/mine"), token, null).andExpect(status().isOk())).get("requests");
    }

    JsonNode incoming(String token) throws Exception {
        return body(send(get("/api/speakers/requests/incoming"), token, null).andExpect(status().isOk())).get("requests");
    }

    @Test
    void requestsNeedALogin() throws Exception {
        String id = approved(1);
        request(null, id, talk()).andExpect(status().isUnauthorized());
        send(get("/api/speakers/requests/mine"), null, null).andExpect(status().isUnauthorized());
        send(get("/api/speakers/requests/incoming"), null, null).andExpect(status().isUnauthorized());
        send(put("/api/speakers/requests/SRQ-x"), null, action("accept")).andExpect(status().isUnauthorized());
    }

    @Test
    void memberSendsATalkRequest() throws Exception {
        String speaker = approved(1);
        JsonNode r = body(request(m(2), speaker, talk()).andExpect(status().isCreated())).get("request");
        assertThat(r.get("id").asText()).startsWith("SRQ-");
        assertThat(r.get("status").asText()).isEqualTo("new");

        List<Map<String, Object>> told = notificationsOf("M9101");
        Map<String, Object> last = told.get(told.size() - 1);
        assertThat(last.get("type")).isEqualTo("speaker_request");
        assertThat(last.get("title")).isEqualTo("🎙️ नवीन विनंती: व्याख्यान");
        assertThat(last.get("message")).isEqualTo("Member M9102: Zs Satara, " + DATE);

        for (JsonNode s : publicList(m(2), "")) if (s.get("id").asText().equals(speaker)) assertThat(s.get("requested").asBoolean()).isTrue();
    }

    @Test
    void guidanceRequestHasItsOwnTitle() throws Exception {
        String speaker = approved(1);
        sent(m(2), speaker, guidance());
        List<Map<String, Object>> told = notificationsOf("M9101");
        Map<String, Object> last = told.get(told.size() - 1);
        assertThat(last.get("title")).isEqualTo("🧭 नवीन विनंती: मार्गदर्शन");
        assertThat(last.get("message")).isEqualTo("Member M9102: Zs MPSC");
    }

    @Test
    void requestRulesAreChecked() throws Exception {
        String speaker = approved(1, with(profile("Zs Talks Only"), "offers_guidance", false));
        request(m(1), speaker, talk()).andExpect(status().isBadRequest());
        request(m(2), speaker, guidance()).andExpect(status().isBadRequest());
        request(m(2), speaker, with(talk(), "place", null)).andExpect(status().isBadRequest());
        request(m(2), speaker, with(talk(), "event_date", "2020-01-01")).andExpect(status().isBadRequest());
        request(m(2), speaker, with(talk(), "kind", "party")).andExpect(status().isBadRequest());

        String waiting = apply(m(3), profile("Zs Waiting"));
        request(m(2), waiting, talk()).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("SPEAKER_NOT_FOUND"));
        String hidden = approved(4);
        adminAct(hidden, action("hide"));
        request(m(2), hidden, talk()).andExpect(status().isNotFound());
        request(m(2), "SPK-nope", talk()).andExpect(status().isNotFound());

        sent(m(2), speaker, talk());
        request(m(2), speaker, talk()).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("REQUEST_EXISTS"));
    }

    @Test
    void fieldsOfTheOtherKindAreIgnored() throws Exception {
        String speaker = approved(1);
        Map<String, Object> g = guidance();
        g.put("event_date", "abc");
        g.put("audience", 99999999999L);
        g.put("place", "x".repeat(5000));
        String req = sent(m(2), speaker, g);
        Map<String, Object> row = jdbc.queryForMap("SELECT event_date, place, audience FROM speaker_requests WHERE id = ?", req);
        assertThat(row.get("event_date")).isNull();
        assertThat(row.get("place")).isNull();
        assertThat(row.get("audience")).isNull();

        Map<String, Object> t = talk();
        t.put("topic", "y".repeat(5000));
        String talkReq = sent(m(3), speaker, t);
        assertThat(jdbc.queryForObject("SELECT topic FROM speaker_requests WHERE id = ?", String.class, talkReq)).isNull();
    }

    @Test
    void atMostFiveRequestsADay() throws Exception {
        for (int i = 0; i < 5; i++) sent(m(6), adminAdded("Zs Guest " + i), talk());
        request(m(6), adminAdded("Zs Guest 5"), talk())
            .andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void speakerAcceptsAndThePhoneIsShared() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        assertThat(find(mine(m(2)), req).get("speaker").has("phone")).isFalse();
        JsonNode in = find(incoming(m(1)), req);
        assertThat(in.get("organiser").get("name").asText()).isEqualTo("Member M9102");
        assertThat(in.get("organiser").get("phone").asText()).isEqualTo(phoneOf("M9102"));

        answer(m(1), req, "accept").andExpect(status().isOk());
        Map<String, Object> told = notificationsOf("M9102").get(0);
        assertThat(told.get("type")).isEqualTo("speaker_reply");
        assertThat(told.get("title")).isEqualTo("✅ Zs Speaker 1 यांनी तुमची विनंती स्वीकारली");
        JsonNode after = find(mine(m(2)), req);
        assertThat(after.get("status").asText()).isEqualTo("accepted");
        assertThat(after.get("speaker").get("phone").asText()).isEqualTo("9876500011");
    }

    @Test
    void declinedRequestsShareNoPhone() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        answer(m(1), req, "decline").andExpect(status().isOk());
        assertThat(notificationsOf("M9102").get(0).get("title")).isEqualTo("❌ Zs Speaker 1 यांनी तुमची विनंती नाकारली");
        JsonNode after = find(mine(m(2)), req);
        assertThat(after.get("status").asText()).isEqualTo("declined");
        assertThat(after.get("speaker").has("phone")).isFalse();
        assertThat(mine(m(2)).toString()).doesNotContain("9876500011");
    }

    @Test
    void onlyTheRightPeopleAnswer() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        answer(m(2), req, "accept").andExpect(status().isForbidden());
        answer(m(1), req, "cancel").andExpect(status().isForbidden());
        answer(m(3), req, "decline").andExpect(status().isForbidden());
        answer(m(3), "SRQ-nope", "decline").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("REQUEST_NOT_FOUND"));
        answer(m(2), req, "cancel").andExpect(status().isOk());
        assertThat(find(mine(m(2)), req).get("status").asText()).isEqualTo("cancelled");
        assertThat(notificationsOf("M9102")).isEmpty();
    }

    @Test
    void answeredOnce() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        answer(m(1), req, "accept").andExpect(status().isOk());
        answer(m(1), req, "decline").andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALREADY_ANSWERED"));
        answer(m(2), req, "cancel").andExpect(status().isConflict());
    }

    @Test
    void askingAgainAfterAnAnswer() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        answer(m(1), req, "decline").andExpect(status().isOk());
        sent(m(2), speaker, talk());
    }

    @Test
    void speakerWithoutAnAccountGoesToAdmins() throws Exception {
        String guest = adminAdded("Zs Guest");
        String req = sent(m(2), guest, guidance());

        List<Map<String, Object>> adminTold = notificationsOf(ADMIN);
        assertThat(adminTold).hasSize(1);
        assertThat(adminTold.get(0).get("type")).isEqualTo("speaker_admin");
        assertThat(adminTold.get(0).get("title")).isEqualTo("🎙️ Zs Guest साठी नवीन विनंती");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM notifications WHERE member_id IS NULL AND type LIKE 'speaker%'", Integer.class)).isZero();

        JsonNode forAdmin = body(send(get("/api/admin/speakers/requests"), admin(), null).andExpect(status().isOk())).get("requests");
        JsonNode r = find(forAdmin, req);
        assertThat(r.get("organiser").get("phone").asText()).isEqualTo(phoneOf("M9102"));
        assertThat(r.get("speaker").get("name").asText()).isEqualTo("Zs Guest");
        send(get("/api/admin/speakers/requests"), m(3), null).andExpect(status().isForbidden());

        answer(m(3), req, "accept").andExpect(status().isForbidden());
        answer(admin(), req, "accept").andExpect(status().isOk());
        assertThat(notificationsOf("M9102").get(0).get("type")).isEqualTo("speaker_reply");
    }

    @Test
    void adminCannotAnswerForASpeakerWithAnAccount() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        answer(admin(), req, "accept").andExpect(status().isForbidden());
    }

    @Test
    void rejectedSpeakerCanStillAnswerOldRequests() throws Exception {
        String speaker = approved(1);
        String req = sent(m(2), speaker, talk());
        adminAct(speaker, action("reject")).andExpect(status().isOk());
        answer(m(1), req, "accept").andExpect(status().isOk());
        request(m(3), speaker, talk()).andExpect(status().isNotFound());
    }

    @Test
    void aFailingNotificationStillSavesTheRequest() throws Exception {
        String speaker = approved(1);
        jdbc.execute("ALTER TABLE notifications RENAME TO notifications_off");
        String req;
        try {
            req = sent(m(2), speaker, talk());
        } finally {
            jdbc.execute("ALTER TABLE notifications_off RENAME TO notifications");
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM speaker_requests WHERE id = ?", Integer.class, req)).isEqualTo(1);
    }
}
