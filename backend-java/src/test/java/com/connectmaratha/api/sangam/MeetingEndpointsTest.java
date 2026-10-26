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
import com.connectmaratha.api.sangam.service.MeetingLimiter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
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

/** /api/sangam/meetings: private, real, receiver-controlled 1-to-1 business meetings. */
@SpringBootTest
@AutoConfigureMockMvc
class MeetingEndpointsTest extends PostgresTestBase {

    static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired MeetingLimiter limiter;
    @Autowired RateLimitFilter rateLimit;

    /** M9801 requester, M9802 and M9805 own a visible business, M9803 only a hidden one, M9804 none, M9809 admin. */
    @BeforeEach
    void fresh() {
        limiter.reset();
        rateLimit.reset();
        jdbc.update("DELETE FROM meetings WHERE requester_id LIKE 'M98%' OR recipient_id LIKE 'M98%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M98%'");
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zm%'");
        for (String id : List.of("M9801", "M9802", "M9803", "M9804", "M9805", "M9809")) member(id);
        business("ZMB1", "Zm Shop One", "M9802", "visible");
        business("ZMB2", "Zm Shop Hidden", "M9803", "hidden");
        business("ZMB3", "Zm Shop Three", "M9805", "visible");
    }

    // ------------------------------------------------------------------ helpers

    void member(String id) {
        jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name", id, "Member " + id, "98000" + id.substring(1));
    }

    void business(String id, String name, String ownerId, String status) {
        jdbc.update("INSERT INTO businesses (id, name, owner, cat, owner_id, status) VALUES (?, ?, 'x', 'it', ?, ?)", id, name, ownerId, status);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    static Map<String, Object> meeting(String recipientId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("recipientId", recipientId);
        body.put("date", LocalDate.now(IST).plusDays(7).toString());
        body.put("time", "10:30");
        body.put("mode", "Offline");
        body.put("place", "Zm Office, Pune");
        body.put("topic", "Zm Product demo");
        return body;
    }

    static Map<String, Object> with(Map<String, Object> body, String key, Object value) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        copy.put(key, value);
        return copy;
    }

    ResultActions book(String token, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/sangam/meetings").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    ResultActions list(String token, String query) throws Exception {
        MockHttpServletRequestBuilder req = get("/api/sangam/meetings" + query);
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    JsonNode listBody(String token, String query) throws Exception {
        return json.readTree(list(token, query).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(UTF_8));
    }

    /** Books as the member and returns the meeting id. */
    String booked(String token, String recipientId) throws Exception {
        String body = book(token, meeting(recipientId)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(UTF_8);
        return json.readTree(body).at("/meeting/id").asText();
    }

    int meetingRows() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM meetings WHERE requester_id LIKE 'M98%'", Integer.class);
    }

    // ------------------------------------------------------------------ requesting

    @Test
    void bookingNeedsALogin() throws Exception {
        book(null, meeting("M9802")).andExpect(status().isUnauthorized());
        assertThat(meetingRows()).isZero();
    }

    @Test
    void bookingStoresARequestedMeetingWithTheCallersOwnName() throws Exception {
        String body = book(token("M9801", "member"), meeting("M9802"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.meeting.requester_id").value("M9801"))
            .andExpect(jsonPath("$.meeting.requester_name").value("Member M9801"))
            .andExpect(jsonPath("$.meeting.recipient_id").value("M9802"))
            .andExpect(jsonPath("$.meeting.recipient_name").value("Member M9802"))
            .andExpect(jsonPath("$.meeting.status").value("Requested"))
            .andExpect(jsonPath("$.meeting.mode").value("Offline"))
            .andExpect(jsonPath("$.meeting.location").value("Zm Office, Pune"))
            .andExpect(jsonPath("$.meeting.role").value("requester"))
            .andExpect(jsonPath("$.meeting.partner_id").value("M9802"))
            .andReturn().getResponse().getContentAsString(UTF_8);
        String id = json.readTree(body).at("/meeting/id").asText();
        assertThat(jdbc.queryForObject("SELECT status FROM meetings WHERE id = ?", String.class, id)).isEqualTo("Requested");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = 'M9802'", Integer.class)).isEqualTo(1);
    }

    @Test
    void aBodyCannotSetTheRequester() throws Exception {
        Map<String, Object> body = with(with(meeting("M9802"), "requester_id", "M9805"), "requesterName", "Fake Name");
        String id = json.readTree(book(token("M9801", "member"), body).andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString(UTF_8)).at("/meeting/id").asText();
        Map<String, Object> saved = jdbc.queryForMap("SELECT * FROM meetings WHERE id = ?", id);
        assertThat(saved.get("requester_id")).isEqualTo("M9801");
        assertThat(saved.get("requester_name")).isEqualTo("Member M9801");
    }

    @Test
    void recipientMustOwnAVisibleBusiness() throws Exception {
        for (String recipient : List.of("M9803", "M9804", "M0000")) {
            book(token("M9801", "member"), meeting(recipient)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("RECIPIENT_NOT_ELIGIBLE"));
        }
        assertThat(meetingRows()).isZero();
    }

    @Test
    void cannotBookYourself() throws Exception {
        book(token("M9802", "member"), meeting("M9802")).andExpect(status().isBadRequest());
        assertThat(meetingRows()).isZero();
    }

    @Test
    void badDatesAndTimesAreRefused() throws Exception {
        String today = LocalDate.now(IST).toString();
        List<Map<String, Object>> bad = new java.util.ArrayList<>(List.of(
            with(meeting("M9802"), "date", "2026-02-30"),
            with(meeting("M9802"), "date", LocalDate.now(IST).minusDays(1).toString()),
            with(meeting("M9802"), "time", "25:99"),
            with(meeting("M9802"), "time", "10.30"),
            with(meeting("M9802"), "date", 20261102),
            with(meeting("M9802"), "time", 1030)));
        LocalTime now = LocalTime.now(IST);
        if (now.isAfter(LocalTime.of(0, 2))) bad.add(with(with(meeting("M9802"), "date", today), "time", now.minusMinutes(1).withSecond(0).withNano(0).toString()));
        for (Map<String, Object> body : bad) {
            book(token("M9801", "member"), body).andExpect(status().isBadRequest());
        }
        assertThat(meetingRows()).isZero();
    }

    @Test
    void anOnlineLinkMustBeAWebAddress() throws Exception {
        for (String place : List.of("javascript:alert(1)", "meet", "ftp://x.test/a")) {
            book(token("M9801", "member"), with(with(meeting("M9802"), "mode", "Online"), "place", place)).andExpect(status().isBadRequest());
        }
        assertThat(meetingRows()).isZero();
        book(token("M9801", "member"), with(with(meeting("M9802"), "mode", "Online"), "place", "https://meet.google.com/abc"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.meeting.mode").value("Online"));
    }

    @Test
    void topicPlaceAndModeAreRequired() throws Exception {
        for (String key : List.of("topic", "place", "mode", "date", "time", "recipientId")) {
            Map<String, Object> body = meeting("M9802");
            body.remove(key);
            book(token("M9801", "member"), body).andExpect(status().isBadRequest());
        }
        book(token("M9801", "member"), with(meeting("M9802"), "mode", "Teleport")).andExpect(status().isBadRequest());
        book(token("M9801", "member"), with(meeting("M9802"), "topic", "ab")).andExpect(status().isBadRequest());
        assertThat(meetingRows()).isZero();
    }

    @Test
    void onlyOneOpenMeetingPerPairInEitherDirection() throws Exception {
        booked(token("M9801", "member"), "M9802");
        book(token("M9801", "member"), meeting("M9802")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("DUPLICATE_REQUEST"));
        member("M9801");
        business("ZMB4", "Zm Shop Four", "M9801", "visible");
        book(token("M9802", "member"), meeting("M9801")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("DUPLICATE_REQUEST"));
    }

    @Test
    void tenOpenRequestsIsTheMaximum() throws Exception {
        for (int i = 0; i < 10; i++) {
            String id = "M983" + i;
            member(id);
            business("ZMX" + i, "Zm Extra " + i, id, "visible");
            booked(token("M9801", "member"), id);
        }
        book(token("M9801", "member"), meeting("M9802")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("TOO_MANY_OPEN_REQUESTS"));
    }

    @Test
    void twentyBookingsADayIsTheMaximum() throws Exception {
        for (int i = 0; i < 20; i++) limiter.check("M9801");
        book(token("M9801", "member"), meeting("M9802")).andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
        assertThat(meetingRows()).isZero();
    }

    // ------------------------------------------------------------------ listing and partners

    @Test
    void youSeeOnlyYourOwnMeetings() throws Exception {
        booked(token("M9801", "member"), "M9802");

        JsonNode mine = listBody(token("M9801", "member"), "");
        assertThat(mine.get("count").asInt()).isEqualTo(1);
        assertThat(mine.at("/meetings/0/role").asText()).isEqualTo("requester");
        assertThat(mine.at("/meetings/0/partner_name").asText()).isEqualTo("Member M9802");

        JsonNode theirs = listBody(token("M9802", "member"), "");
        assertThat(theirs.at("/meetings/0/role").asText()).isEqualTo("recipient");
        assertThat(theirs.at("/meetings/0/partner_name").asText()).isEqualTo("Member M9801");

        assertThat(listBody(token("M9805", "member"), "").get("count").asInt()).isZero();
        assertThat(listBody(token("M9805", "member"), "?memberId=M9801").get("count").asInt()).isZero();

        assertThat(listBody(token("M9809", "admin"), "").get("count").asInt()).isGreaterThanOrEqualTo(1);
        assertThat(listBody(token("M9809", "admin"), "?memberId=M9805").get("count").asInt()).isZero();
        assertThat(listBody(token("M9809", "admin"), "?memberId=M9801").get("count").asInt()).isEqualTo(1);
        assertThat(listBody(token("M9809", "admin"), "").at("/meetings/0/role").isMissingNode()).isTrue();
    }

    @Test
    void listNeedsALogin() throws Exception {
        list(null, "").andExpect(status().isUnauthorized());
    }

    @Test
    void partnersAreRealBusinessOwnersWithoutTheCaller() throws Exception {
        business("ZMB5", "Zm Shop Five", "M9801", "visible");
        MockHttpServletRequestBuilder req = get("/api/sangam/meetings/partners").header("Authorization", token("M9801", "member"));
        JsonNode body = json.readTree(mvc.perform(req).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(UTF_8));
        List<String> ids = body.get("partners").findValuesAsText("id");
        assertThat(ids).contains("M9802", "M9805").doesNotContain("M9801", "M9803", "M9804");
        mvc.perform(get("/api/sangam/meetings/partners")).andExpect(status().isUnauthorized());
    }

    @Test
    void oldRowsWithoutAModeReadAsOffline() throws Exception {
        jdbc.update("INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, status) "
            + "VALUES ('MT-ZM1', 'M9801', 'Member M9801', 'M9802', 'Member M9802', '2026-12-01', '10:00', 'old', 'Confirmed')");
        JsonNode mine = listBody(token("M9801", "member"), "");
        assertThat(mine.at("/meetings/0/mode").asText()).isEqualTo("Offline");
        assertThat(mine.at("/meetings/0/id").asText()).isEqualTo("MT-ZM1");
    }

    // ------------------------------------------------------------------ answering, cancelling, completing, rescheduling, notes

    ResultActions send(String method, String token, String path, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = put("/api/sangam/meetings" + path).contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    ResultActions answer(String token, String id, Object word) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", word);
        return send("PUT", token, "/" + id + "/status", body);
    }

    String statusOf(String id) {
        return jdbc.queryForObject("SELECT status FROM meetings WHERE id = ?", String.class, id);
    }

    int notificationsFor(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = ?", Integer.class, memberId);
    }

    /** A Confirmed meeting between M9801 and M9802 on the given date, written straight to the table. */
    String confirmedOn(String date) {
        String id = "MT-ZM" + System.nanoTime() % 100000;
        jdbc.update("INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, status, mode) "
            + "VALUES (?, 'M9801', 'Member M9801', 'M9802', 'Member M9802', ?, '10:00', 'Zm seeded', 'Confirmed', 'Offline')", id, date);
        return id;
    }

    @Test
    void recipientAccepts() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        int before = notificationsFor("M9801");
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isOk())
            .andExpect(jsonPath("$.meeting.status").value("Confirmed")).andExpect(jsonPath("$.meeting.role").value("recipient"));
        assertThat(statusOf(id)).isEqualTo("Confirmed");
        assertThat(notificationsFor("M9801")).isEqualTo(before + 1);
    }

    @Test
    void recipientDeclines() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        answer(token("M9802", "member"), id, " DECLINED ").andExpect(status().isOk()).andExpect(jsonPath("$.meeting.status").value("Declined"));
        assertThat(statusOf(id)).isEqualTo("Declined");
    }

    @Test
    void requesterCannotAcceptTheirOwnRequest() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        answer(token("M9801", "member"), id, "accepted").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NOT_RECIPIENT"));
        answer(token("M9801", "member"), id, "declined").andExpect(status().isForbidden());
        assertThat(statusOf(id)).isEqualTo("Requested");
    }

    @Test
    void acceptingTwiceIsRefused() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isOk());
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_TRANSITION"));
        answer(token("M9802", "member"), id, "declined").andExpect(status().isBadRequest());
    }

    @Test
    void eitherSideCanCancelARequestedOrConfirmedMeeting() throws Exception {
        String requested = booked(token("M9801", "member"), "M9802");
        answer(token("M9801", "member"), requested, "cancelled").andExpect(status().isOk()).andExpect(jsonPath("$.meeting.status").value("Cancelled"));
        answer(token("M9801", "member"), requested, "accepted").andExpect(status().isForbidden()); // the requester never answers
        answer(token("M9802", "member"), requested, "accepted").andExpect(status().isBadRequest());
        answer(token("M9801", "member"), requested, "cancelled").andExpect(status().isBadRequest());

        String confirmed = booked(token("M9801", "member"), "M9802");
        answer(token("M9802", "member"), confirmed, "accepted").andExpect(status().isOk());
        int before = notificationsFor("M9801");
        answer(token("M9802", "member"), confirmed, "cancelled").andExpect(status().isOk());
        assertThat(notificationsFor("M9801")).isEqualTo(before + 1);

        String declined = booked(token("M9801", "member"), "M9802");
        answer(token("M9802", "member"), declined, "declined").andExpect(status().isOk());
        answer(token("M9801", "member"), declined, "cancelled").andExpect(status().isBadRequest());
    }

    @Test
    void strangerAndAdminCannotChangeAMeeting() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        Map<String, Object> when = with(with(new LinkedHashMap<>(), "date", LocalDate.now(IST).plusDays(9).toString()), "time", "11:00");
        for (String who : List.of(token("M9805", "member"), token("M9809", "admin"))) {
            answer(who, id, "accepted").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("FORBIDDEN"));
            answer(who, id, "cancelled").andExpect(status().isForbidden());
            send("PUT", who, "/" + id, when).andExpect(status().isForbidden());
            send("PUT", who, "/" + id + "/notes", with(new LinkedHashMap<>(), "notes", "hello")).andExpect(status().isForbidden());
        }
        assertThat(statusOf(id)).isEqualTo("Requested");
        answer(null, id, "accepted").andExpect(status().isUnauthorized());
    }

    @Test
    void unknownMeetingIs404() throws Exception {
        answer(token("M9801", "member"), "MT-NONE", "accepted").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("MEETING_NOT_FOUND"));
        send("PUT", token("M9801", "member"), "/MT-NONE/notes", with(new LinkedHashMap<>(), "notes", "x")).andExpect(status().isNotFound());
    }

    @Test
    void badStatusWordsAre400() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        for (Object word : new Object[] {"done", 5, "", "रद्द", "Confirmed"}) {
            answer(token("M9802", "member"), id, word).andExpect(status().isBadRequest());
        }
        send("PUT", token("M9802", "member"), "/" + id + "/status", new LinkedHashMap<>()).andExpect(status().isBadRequest());
        assertThat(statusOf(id)).isEqualTo("Requested");
    }

    @Test
    void completeNeedsAConfirmedMeetingOnOrAfterItsDay() throws Exception {
        String future = booked(token("M9801", "member"), "M9802");
        answer(token("M9802", "member"), future, "accepted").andExpect(status().isOk());
        answer(token("M9801", "member"), future, "completed").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TOO_EARLY"));

        String requested = booked(token("M9801", "member"), "M9805");
        answer(token("M9801", "member"), requested, "completed").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_TRANSITION"));

        String today = confirmedOn(LocalDate.now(IST).toString());
        answer(token("M9801", "member"), today, "completed").andExpect(status().isOk()).andExpect(jsonPath("$.meeting.status").value("Completed"));
        assertThat(statusOf(today)).isEqualTo("Completed");
        answer(token("M9802", "member"), today, "cancelled").andExpect(status().isBadRequest());
    }

    @Test
    void rescheduleResetsToRequestedAndNotifiesTheOtherSide() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isOk());
        String newDate = LocalDate.now(IST).plusDays(10).toString();
        Map<String, Object> when = with(with(new LinkedHashMap<>(), "date", newDate), "time", "15:45");

        int before = notificationsFor("M9801");
        send("PUT", token("M9802", "member"), "/" + id, when).andExpect(status().isOk())
            .andExpect(jsonPath("$.meeting.status").value("Requested")).andExpect(jsonPath("$.meeting.date").value(newDate))
            .andExpect(jsonPath("$.meeting.time").value("15:45")).andExpect(jsonPath("$.meeting.location").value("Zm Office, Pune"));
        assertThat(notificationsFor("M9801")).isEqualTo(before + 1);

        send("PUT", token("M9801", "member"), "/" + id, with(when, "place", "Zm New Cafe")).andExpect(status().isOk())
            .andExpect(jsonPath("$.meeting.location").value("Zm New Cafe"));
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isOk());

        send("PUT", token("M9801", "member"), "/" + id, with(when, "date", LocalDate.now(IST).minusDays(1).toString())).andExpect(status().isBadRequest());
        send("PUT", token("M9801", "member"), "/" + id, with(when, "time", "25:00")).andExpect(status().isBadRequest());
        send("PUT", token("M9801", "member"), "/" + id, new LinkedHashMap<>()).andExpect(status().isBadRequest());
        assertThat(statusOf(id)).isEqualTo("Confirmed");
    }

    @Test
    void cannotRescheduleAFinishedMeeting() throws Exception {
        Map<String, Object> when = with(with(new LinkedHashMap<>(), "date", LocalDate.now(IST).plusDays(9).toString()), "time", "11:00");
        String cancelled = booked(token("M9801", "member"), "M9802");
        answer(token("M9801", "member"), cancelled, "cancelled").andExpect(status().isOk());
        send("PUT", token("M9801", "member"), "/" + cancelled, when).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_TRANSITION"));

        String declined = booked(token("M9801", "member"), "M9805");
        answer(token("M9805", "member"), declined, "declined").andExpect(status().isOk());
        send("PUT", token("M9801", "member"), "/" + declined, when).andExpect(status().isBadRequest());

        String completed = confirmedOn(LocalDate.now(IST).toString());
        answer(token("M9801", "member"), completed, "completed").andExpect(status().isOk());
        send("PUT", token("M9801", "member"), "/" + completed, when).andExpect(status().isBadRequest());
    }

    @Test
    void notesAreSharedBetweenTheTwoPeopleOnly() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        send("PUT", token("M9802", "member"), "/" + id + "/notes", with(new LinkedHashMap<>(), "notes", "Bring the price list")).andExpect(status().isOk())
            .andExpect(jsonPath("$.meeting.notes").value("Bring the price list"));
        assertThat(listBody(token("M9801", "member"), "").at("/meetings/0/notes").asText()).isEqualTo("Bring the price list");
        send("PUT", token("M9801", "member"), "/" + id + "/notes", with(new LinkedHashMap<>(), "notes", "x".repeat(2000))).andExpect(status().isOk());
        send("PUT", token("M9801", "member"), "/" + id + "/notes", with(new LinkedHashMap<>(), "notes", "x".repeat(2001))).andExpect(status().isBadRequest());
        send("PUT", token("M9801", "member"), "/" + id + "/notes", with(new LinkedHashMap<>(), "notes", 5)).andExpect(status().isBadRequest());
        send("PUT", token("M9805", "member"), "/" + id + "/notes", with(new LinkedHashMap<>(), "notes", "spy")).andExpect(status().isForbidden());
        assertThat(jdbc.queryForObject("SELECT LENGTH(notes) FROM meetings WHERE id = ?", Integer.class, id)).isEqualTo(2000);
    }

    // ------------------------------------------------------------------ review fixes

    @Test
    void theOneWhoProposedANewTimeCannotAcceptIt() throws Exception {
        String id = booked(token("M9801", "member"), "M9802");
        assertThat(listBody(token("M9802", "member"), "").at("/meetings/0/awaiting_id").asText()).isEqualTo("M9802");
        Map<String, Object> when = with(with(new LinkedHashMap<>(), "date", LocalDate.now(IST).plusDays(9).toString()), "time", "16:00");

        send("PUT", token("M9802", "member"), "/" + id, when).andExpect(status().isOk()).andExpect(jsonPath("$.meeting.awaiting_id").value("M9801"));
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NOT_RECIPIENT"));
        answer(token("M9802", "member"), id, "declined").andExpect(status().isForbidden());
        assertThat(statusOf(id)).isEqualTo("Requested");
        answer(token("M9801", "member"), id, "accepted").andExpect(status().isOk()).andExpect(jsonPath("$.meeting.status").value("Confirmed"));

        send("PUT", token("M9801", "member"), "/" + id, when).andExpect(status().isOk()).andExpect(jsonPath("$.meeting.awaiting_id").value("M9802"));
        answer(token("M9801", "member"), id, "accepted").andExpect(status().isForbidden());
        answer(token("M9802", "member"), id, "accepted").andExpect(status().isOk());
    }

    @Test
    void twoAnswersAtOnceCannotBothWin() throws Exception {
        for (int round = 0; round < 5; round++) {
            jdbc.update("DELETE FROM meetings WHERE requester_id LIKE 'M98%'");
            jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M98%'");
            String id = booked(token("M9801", "member"), "M9802");
            java.util.concurrent.CountDownLatch go = new java.util.concurrent.CountDownLatch(1);
            java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(2);
            List<java.util.concurrent.Future<Integer>> results = new java.util.ArrayList<>();
            for (String word : List.of("accepted", "declined")) {
                results.add(pool.submit(() -> {
                    go.await();
                    return answer(token("M9802", "member"), id, word).andReturn().getResponse().getStatus();
                }));
            }
            go.countDown();
            int ok = 0;
            for (java.util.concurrent.Future<Integer> f : results) if (f.get() == 200) ok++;
            pool.shutdown();
            assertThat(ok).as("round " + round).isEqualTo(1);
            assertThat(statusOf(id)).isIn("Confirmed", "Declined");
            assertThat(notificationsFor("M9801")).as("one answer, one notification, round " + round).isEqualTo(1);
        }
    }

    @Test
    void anOldMeetingWithAMarathiDateDoesNotBlockANewRequest() throws Exception {
        jdbc.update("INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, status) "
            + "VALUES ('MT-ZMOLD', 'M9801', 'Member M9801', 'M9802', 'Member M9802', '२० ऑक्टोबर २०२६', 'सकाळी ११:००', 'old', 'Confirmed')");
        book(token("M9801", "member"), meeting("M9802")).andExpect(status().isCreated());
    }

    @Test
    void anOnlineMeetingCannotBeMovedToANonWebLink() throws Exception {
        String id = book(token("M9801", "member"), with(with(meeting("M9802"), "mode", "Online"), "place", "https://meet.google.com/abc"))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(UTF_8);
        String meetingId = json.readTree(id).at("/meeting/id").asText();
        Map<String, Object> when = with(with(with(new LinkedHashMap<>(), "date", LocalDate.now(IST).plusDays(9).toString()), "time", "16:00"), "place", "javascript:alert(1)");
        send("PUT", token("M9802", "member"), "/" + meetingId, when).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_PLACE"));
    }
}
