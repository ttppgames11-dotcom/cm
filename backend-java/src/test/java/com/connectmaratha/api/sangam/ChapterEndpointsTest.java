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
import com.connectmaratha.api.sangam.service.ChapterLimiter;
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

/** /api/sangam/chapters and /api/admin/chapters: real business chapters, join requests and coordinator approval. */
@SpringBootTest
@AutoConfigureMockMvc
class ChapterEndpointsTest extends PostgresTestBase {

    static final String ADMIN = "M9309";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;
    @Autowired ChapterLimiter limiter;

    /**
     * M9301 coordinator; M9302 owns visible ZCB1 (it, Pune) and ZCB2 (it, Mumbai); M9303 owns ZCB3 (restaurant);
     * M9304 owns only hidden ZCB4; M9305 no business; M9306 owns ZCB6 (it); M9309 admin.
     */
    @BeforeEach
    void fresh() {
        rateLimit.reset();
        limiter.reset();
        if (Boolean.TRUE.equals(jdbc.queryForObject("SELECT to_regclass('chapter_seats') IS NOT NULL", Boolean.class))) {
            jdbc.update("DELETE FROM chapter_seats WHERE chapter_id IN (SELECT id FROM chapters WHERE name LIKE 'Zc%') OR member_id LIKE 'M93%'");
            jdbc.update("DELETE FROM chapters WHERE name LIKE 'Zc%'");
        }
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M93%'");
        jdbc.update("DELETE FROM audit_logs WHERE user_id LIKE 'M93%'");
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zc%'");
        for (String id : List.of("M9301", "M9302", "M9303", "M9304", "M9305", "M9306", ADMIN)) member(id);
        business("ZCB1", "Zc Shop One", "M9302", "it", "Pune", "visible");
        business("ZCB2", "Zc Shop Two", "M9302", "it", "Mumbai", "visible");
        business("ZCB3", "Zc Shop Three", "M9303", "restaurant", "Pune", "visible");
        business("ZCB4", "Zc Shop Hidden", "M9304", "it", "Pune", "hidden");
        business("ZCB6", "Zc Shop Six", "M9306", "it", "Pune", "visible");
    }

    // ------------------------------------------------------------------ helpers

    void member(String id) {
        jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name",
            id, "Member " + id, "98000" + id.substring(1));
    }

    void business(String id, String name, String ownerId, String cat, String city, String status) {
        jdbc.update("INSERT INTO businesses (id, name, owner, cat, city, owner_id, status, phone) VALUES (?, ?, 'Owner Name', ?, ?, ?, ?, '9822000000')",
            id, name, cat, city, ownerId, status);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    String admin() {
        return token(ADMIN, "admin");
    }

    static Map<String, Object> chapterBody() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", "Zc Pune West");
        body.put("city", "पुणे");
        body.put("district", "पुणे");
        body.put("area", "हिंजवडी");
        body.put("meetingDay", "प्रत्येक बुधवार");
        body.put("meetingTime", "सकाळी ७:३० ते ९:००");
        body.put("venue", "Zc Hall");
        body.put("coordinatorId", "M9301");
        body.put("maxSeats", 3);
        return body;
    }

    static Map<String, Object> with(Map<String, Object> body, String key, Object value) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        if (value == null) copy.remove(key); else copy.put(key, value);
        return copy;
    }

    ResultActions send(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) req.header("Authorization", token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
        return mvc.perform(req);
    }

    ResultActions createAs(String token, Map<String, Object> body) throws Exception {
        return send(post("/api/admin/chapters"), token, body);
    }

    ResultActions update(String token, String id, Map<String, Object> body) throws Exception {
        return send(put("/api/admin/chapters/" + id), token, body);
    }

    /** Creates a chapter as admin and returns its id. */
    String createChapter(Map<String, Object> body) throws Exception {
        String out = createAs(admin(), body).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(UTF_8);
        return json.readTree(out).at("/chapter/id").asText();
    }

    /** Inserts a seat row directly and returns its id. */
    String seat(String chapterId, String businessId, String memberId, String status) {
        String id = "CS" + System.nanoTime();
        jdbc.update("INSERT INTO chapter_seats (id, chapter_id, business_id, member_id, message, status, created_at, updated_at) "
            + "VALUES (?, ?, ?, ?, '', ?, '2026-10-27T10:00:00.000Z', '2026-10-27T10:00:00.000Z')",
            id, chapterId, businessId, memberId, status);
        return id;
    }

    ResultActions join(String token, String chapterId, String businessId) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("businessId", businessId);
        return send(post("/api/sangam/chapters/" + chapterId + "/join"), token, b);
    }

    /** Joins as the member (expects 201) and returns the seat id. */
    String joined(String memberId, String chapterId, String businessId) throws Exception {
        return body(join(token(memberId, "member"), chapterId, businessId).andExpect(status().isCreated())).at("/seat/id").asText();
    }

    ResultActions act(String token, String seatId, Object action) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        if (action != null) b.put("action", action);
        return send(put("/api/sangam/chapters/seats/" + seatId), token, b);
    }

    String seatStatus(String seatId) {
        return jdbc.queryForObject("SELECT status FROM chapter_seats WHERE id = ?", String.class, seatId);
    }

    int notificationsFor(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = ?", Integer.class, memberId);
    }

    int seatRows() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM chapter_seats WHERE member_id LIKE 'M93%'", Integer.class);
    }

    int auditBy(String userId, String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE user_id = ? AND action = ?", Integer.class, userId, action);
    }

    /** Runs the calls at the same instant and returns their HTTP statuses. */
    List<Integer> atOnce(List<java.util.concurrent.Callable<ResultActions>> calls) throws Exception {
        java.util.concurrent.CountDownLatch go = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(calls.size());
        List<java.util.concurrent.Future<Integer>> results = new java.util.ArrayList<>();
        for (java.util.concurrent.Callable<ResultActions> call : calls) {
            results.add(pool.submit(() -> {
                go.await();
                return call.call().andReturn().getResponse().getStatus();
            }));
        }
        go.countDown();
        List<Integer> out = new java.util.ArrayList<>();
        for (java.util.concurrent.Future<Integer> f : results) out.add(f.get());
        pool.shutdown();
        return out;
    }

    JsonNode body(ResultActions r) throws Exception {
        return json.readTree(r.andReturn().getResponse().getContentAsString(UTF_8));
    }

    JsonNode publicChapter(String id) throws Exception {
        for (JsonNode c : body(send(get("/api/sangam/chapters"), null, null).andExpect(status().isOk())).get("chapters")) {
            if (c.get("id").asText().equals(id)) return c;
        }
        return null;
    }

    int chapterRows() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM chapters WHERE name LIKE 'Zc%'", Integer.class);
    }

    int auditRows(String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE user_id = ? AND action = ?", Integer.class, ADMIN, action);
    }

    // ------------------------------------------------------------------ admin: create, edit, list

    @Test
    void onlyAnAdminCanCreateChapters() throws Exception {
        createAs(null, chapterBody()).andExpect(status().isUnauthorized());
        createAs(token("M9302", "member"), chapterBody()).andExpect(status().isForbidden());
        createAs(admin(), chapterBody()).andExpect(status().isCreated())
            .andExpect(jsonPath("$.chapter.status").value("open"))
            .andExpect(jsonPath("$.chapter.name").value("Zc Pune West"))
            .andExpect(jsonPath("$.chapter.max_seats").value(3));
        String id = jdbc.queryForObject("SELECT id FROM chapters WHERE name = 'Zc Pune West'", String.class);
        assertThat(id).startsWith("CH");
        assertThat(auditRows("CHAPTER_CREATE")).isEqualTo(1);
    }

    @Test
    void chapterFieldsAreValidated() throws Exception {
        createAs(admin(), with(chapterBody(), "name", "Zc")).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "city", null)).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "maxSeats", 0)).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "maxSeats", 201)).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "maxSeats", "x")).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "maxSeats", 2.5)).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "meetingDay", "x".repeat(41))).andExpect(status().isBadRequest());
        createAs(admin(), with(chapterBody(), "coordinatorId", "M9399")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("COORDINATOR_NOT_FOUND"));
        assertThat(chapterRows()).isZero();
    }

    @Test
    void snakeCaseFieldsAreAccepted() throws Exception {
        Map<String, Object> body = with(with(with(chapterBody(), "coordinatorId", null), "maxSeats", null), "meetingDay", null);
        body.put("coordinator_id", "M9303");
        body.put("max_seats", 5);
        body.put("meeting_day", "प्रत्येक शुक्रवार");
        createAs(admin(), body).andExpect(status().isCreated())
            .andExpect(jsonPath("$.chapter.coordinator_id").value("M9303"))
            .andExpect(jsonPath("$.chapter.max_seats").value(5))
            .andExpect(jsonPath("$.chapter.meeting_day").value("प्रत्येक शुक्रवार"));
    }

    @Test
    void anEmptyMaximumMeansNoLimit() throws Exception {
        createAs(admin(), with(chapterBody(), "maxSeats", "")).andExpect(status().isCreated())
            .andExpect(jsonPath("$.chapter.max_seats").doesNotExist());
    }

    @Test
    void adminEditsKeepUnsentFields() throws Exception {
        String id = createChapter(chapterBody());
        update(admin(), id, Map.of("venue", "Zc New Hall")).andExpect(status().isOk())
            .andExpect(jsonPath("$.chapter.venue").value("Zc New Hall"))
            .andExpect(jsonPath("$.chapter.name").value("Zc Pune West"))
            .andExpect(jsonPath("$.chapter.max_seats").value(3));
        assertThat(auditRows("CHAPTER_UPDATE")).isEqualTo(1);
        update(token("M9301", "member"), id, Map.of("venue", "x")).andExpect(status().isForbidden());
        update(admin(), id, Map.of("name", "Zc")).andExpect(status().isBadRequest());
    }

    @Test
    void adminChangesTheCoordinator() throws Exception {
        String id = createChapter(chapterBody());
        update(admin(), id, Map.of("coordinatorId", "M9303")).andExpect(status().isOk())
            .andExpect(jsonPath("$.chapter.coordinator_id").value("M9303"));
        update(admin(), id, Map.of("coordinatorId", "M9399")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("COORDINATOR_NOT_FOUND"));
    }

    @Test
    void closingAndReopeningAreAudited() throws Exception {
        String id = createChapter(chapterBody());
        update(admin(), id, Map.of("status", "closed")).andExpect(status().isOk()).andExpect(jsonPath("$.chapter.status").value("closed"));
        assertThat(auditRows("CHAPTER_CLOSE")).isEqualTo(1);
        update(admin(), id, Map.of("status", "open")).andExpect(status().isOk()).andExpect(jsonPath("$.chapter.status").value("open"));
        assertThat(auditRows("CHAPTER_REOPEN")).isEqualTo(1);
        update(admin(), id, Map.of("status", "paused")).andExpect(status().isBadRequest());
    }

    @Test
    void editingAnUnknownChapterIs404() throws Exception {
        update(admin(), "CH0", Map.of("venue", "x")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("CHAPTER_NOT_FOUND"));
    }

    @Test
    void adminListShowsOpenAndClosedWithCounts() throws Exception {
        String open = createChapter(chapterBody());
        String closed = createChapter(with(chapterBody(), "name", "Zc Closed One"));
        update(admin(), closed, Map.of("status", "closed")).andExpect(status().isOk());
        seat(open, "ZCB1", "M9302", "approved");
        seat(open, "ZCB3", "M9303", "waiting");
        seat(open, "ZCB6", "M9306", "declined");

        send(get("/api/admin/chapters"), token("M9302", "member"), null).andExpect(status().isForbidden());
        JsonNode list = body(send(get("/api/admin/chapters"), admin(), null).andExpect(status().isOk())).get("chapters");
        JsonNode o = null;
        JsonNode c = null;
        for (JsonNode n : list) {
            if (n.get("id").asText().equals(open)) o = n;
            if (n.get("id").asText().equals(closed)) c = n;
        }
        assertThat(c).isNotNull();
        assertThat(c.get("status").asText()).isEqualTo("closed");
        assertThat(o.get("businesses").asInt()).isEqualTo(1);
        assertThat(o.get("waiting").asInt()).isEqualTo(1);
        assertThat(o.get("coordinator_name").asText()).isEqualTo("Member M9301");
    }

    // ------------------------------------------------------------------ public list

    @Test
    void publicListNeedsNoLoginAndShowsOnlyOpenChapters() throws Exception {
        String open = createChapter(chapterBody());
        String closed = createChapter(with(chapterBody(), "name", "Zc Closed One"));
        update(admin(), closed, Map.of("status", "closed")).andExpect(status().isOk());
        JsonNode c = publicChapter(open);
        assertThat(c).isNotNull();
        assertThat(c.get("coordinator_name").asText()).isEqualTo("Member M9301");
        assertThat(c.get("meeting_day").asText()).isEqualTo("प्रत्येक बुधवार");
        assertThat(publicChapter(closed)).isNull();
    }

    @Test
    void publicListCountsRealSeatsOnly() throws Exception {
        String id = createChapter(chapterBody());
        seat(id, "ZCB1", "M9302", "approved");
        seat(id, "ZCB4", "M9304", "approved");
        seat(id, "ZCB3", "M9303", "waiting");
        seat(id, "ZCB2", "M9302", "declined");
        JsonNode c = publicChapter(id);
        assertThat(c.get("businesses").asInt()).isEqualTo(1);
        assertThat(c.get("open_seats").asInt()).isEqualTo(1);
        assertThat(c.get("categories")).hasSize(1);
        assertThat(c.at("/categories/0/cat").asText()).isEqualTo("it");
        assertThat(c.at("/categories/0/count").asInt()).isEqualTo(1);
    }

    @Test
    void openSeatsIsNullWithoutAMaximumAndNeverNegative() throws Exception {
        String unlimited = createChapter(with(chapterBody(), "maxSeats", null));
        assertThat(publicChapter(unlimited).get("open_seats").isNull()).isTrue();
        String small = createChapter(with(with(chapterBody(), "name", "Zc Small One"), "maxSeats", 1));
        seat(small, "ZCB1", "M9302", "approved");
        seat(small, "ZCB3", "M9303", "approved");
        assertThat(publicChapter(small).get("open_seats").asInt()).isZero();
    }

    @Test
    void publicListHasNoPrivateFields() throws Exception {
        String id = createChapter(chapterBody());
        seat(id, "ZCB1", "M9302", "approved");
        String raw = send(get("/api/sangam/chapters"), null, null).andReturn().getResponse().getContentAsString(UTF_8);
        assertThat(raw).contains(id);
        assertThat(raw).doesNotContain("phone").doesNotContain("coordinator_id").doesNotContain("member_id").doesNotContain("Zc Shop");
    }

    @Test
    void aDeletedBusinessDropsOutOfCounts() throws Exception {
        String id = createChapter(chapterBody());
        seat(id, "ZCB1", "M9302", "approved");
        jdbc.update("DELETE FROM businesses WHERE id = 'ZCB1'");
        JsonNode c = publicChapter(id);
        assertThat(c.get("businesses").asInt()).isZero();
        assertThat(c.get("open_seats").asInt()).isEqualTo(3);
    }

    // ------------------------------------------------------------------ joining

    @Test
    void joinNeedsALogin() throws Exception {
        String id = createChapter(chapterBody());
        join(null, id, "ZCB1").andExpect(status().isUnauthorized());
    }

    @Test
    void ownerAsksToJoin() throws Exception {
        String id = createChapter(chapterBody());
        Map<String, Object> b = Map.of("business_id", "ZCB1", "message", "Zc please");
        send(post("/api/sangam/chapters/" + id + "/join"), token("M9302", "member"), b).andExpect(status().isCreated())
            .andExpect(jsonPath("$.seat.status").value("waiting"))
            .andExpect(jsonPath("$.seat.business_id").value("ZCB1"))
            .andExpect(jsonPath("$.seat.message").value("Zc please"));
        assertThat(notificationsFor("M9301")).isEqualTo(1);
    }

    @Test
    void cannotJoinWithSomeoneElsesBusiness() throws Exception {
        String id = createChapter(chapterBody());
        join(token("M9303", "member"), id, "ZCB1").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NOT_OWNER"));
        assertThat(seatRows()).isZero();
    }

    @Test
    void joinChecks() throws Exception {
        String id = createChapter(chapterBody());
        String closed = createChapter(with(chapterBody(), "name", "Zc Closed One"));
        update(admin(), closed, Map.of("status", "closed")).andExpect(status().isOk());
        String member = token("M9302", "member");
        join(member, "CH0", "ZCB1").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("CHAPTER_NOT_FOUND"));
        join(member, closed, "ZCB1").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CHAPTER_CLOSED"));
        join(member, id, "ZCB0").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("BUSINESS_NOT_FOUND"));
        join(token("M9304", "member"), id, "ZCB4").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("BUSINESS_HIDDEN"));
        send(post("/api/sangam/chapters/" + id + "/join"), member, Map.of("businessId", "ZCB1", "message", "x".repeat(301)))
            .andExpect(status().isBadRequest());
        join(member, id, null).andExpect(status().isBadRequest());
        assertThat(seatRows()).isZero();
    }

    @Test
    void aBusinessCanBeInOnlyOneChapter() throws Exception {
        String a = createChapter(chapterBody());
        String b = createChapter(with(chapterBody(), "name", "Zc Second One"));
        joined("M9302", a, "ZCB1");
        join(token("M9302", "member"), b, "ZCB1").andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BUSINESS_ALREADY_IN_CHAPTER"));
    }

    @Test
    void oneSeatPerMemberPerChapter() throws Exception {
        String a = createChapter(chapterBody());
        String b = createChapter(with(chapterBody(), "name", "Zc Second One"));
        joined("M9302", a, "ZCB1");
        join(token("M9302", "member"), a, "ZCB2").andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("ALREADY_IN_THIS_CHAPTER"));
        join(token("M9302", "member"), b, "ZCB2").andExpect(status().isCreated());
    }

    @Test
    void simultaneousJoinsGiveOneSeat() throws Exception {
        String a = createChapter(chapterBody());
        String b = createChapter(with(chapterBody(), "name", "Zc Second One"));
        for (int round = 0; round < 10; round++) {
            jdbc.update("DELETE FROM chapter_seats WHERE member_id LIKE 'M93%'");
            limiter.reset();
            List<Integer> codes = atOnce(List.of(
                () -> join(token("M9302", "member"), a, "ZCB1"),
                () -> join(token("M9302", "member"), b, "ZCB1")));
            assertThat(codes).as("round " + round).containsExactlyInAnyOrder(201, 400);
            assertThat(seatRows()).isEqualTo(1);
        }
    }

    @Test
    void tenJoinsADayIsTheMaximum() throws Exception {
        String id = createChapter(chapterBody());
        for (int i = 0; i < 10; i++) {
            String seat = joined("M9302", id, "ZCB1");
            act(token("M9302", "member"), seat, "cancel").andExpect(status().isOk());
        }
        join(token("M9302", "member"), id, "ZCB1").andExpect(status().isTooManyRequests());
    }

    // ------------------------------------------------------------------ deciding

    @Test
    void coordinatorApproves() throws Exception {
        String id = createChapter(chapterBody());
        String seat = joined("M9302", id, "ZCB1");
        act(token("M9301", "member"), seat, "approve").andExpect(status().isOk()).andExpect(jsonPath("$.seat.status").value("approved"));
        assertThat(jdbc.queryForObject("SELECT decided_by FROM chapter_seats WHERE id = ?", String.class, seat)).isEqualTo("M9301");
        assertThat(notificationsFor("M9302")).isEqualTo(1);
        assertThat(auditBy("M9301", "CHAPTER_SEAT_APPROVE")).isEqualTo(1);
        assertThat(publicChapter(id).get("businesses").asInt()).isEqualTo(1);
    }

    @Test
    void adminCanApproveAnyChapter() throws Exception {
        String seat = joined("M9302", createChapter(chapterBody()), "ZCB1");
        act(admin(), seat, "approve").andExpect(status().isOk());
    }

    @Test
    void othersCannotDecide() throws Exception {
        String id = createChapter(chapterBody());
        String seat = joined("M9302", id, "ZCB1");
        for (String who : List.of("M9302", "M9305")) {
            for (String action : List.of("approve", "decline")) {
                act(token(who, "member"), seat, action).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("FORBIDDEN"));
            }
        }
        act(token("M9301", "member"), seat, "approve").andExpect(status().isOk());
        act(token("M9305", "member"), seat, "remove").andExpect(status().isForbidden());
        act(token("M9305", "member"), seat, "leave").andExpect(status().isForbidden());
        assertThat(seatStatus(seat)).isEqualTo("approved");
    }

    @Test
    void approvingTwiceIsRefused() throws Exception {
        String seat = joined("M9302", createChapter(chapterBody()), "ZCB1");
        act(token("M9301", "member"), seat, "approve").andExpect(status().isOk());
        act(token("M9301", "member"), seat, "approve").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_TRANSITION"));
    }

    @Test
    void unknownSeatIs404() throws Exception {
        act(admin(), "CS0", "approve").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("SEAT_NOT_FOUND"));
    }

    @Test
    void simultaneousApprovalsDecideOnce() throws Exception {
        String id = createChapter(chapterBody());
        for (int round = 0; round < 10; round++) {
            jdbc.update("DELETE FROM chapter_seats WHERE member_id LIKE 'M93%'");
            jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M93%'");
            String seat = seat(id, "ZCB1", "M9302", "waiting");
            List<Integer> codes = atOnce(List.of(
                () -> act(token("M9301", "member"), seat, "approve"),
                () -> act(admin(), seat, "decline")));
            assertThat(codes).as("round " + round).containsExactlyInAnyOrder(200, 400);
            assertThat(notificationsFor("M9302")).as("round " + round).isEqualTo(1);
        }
    }

    @Test
    void simultaneousApprovalsCannotOverfillAChapter() throws Exception {
        String id = createChapter(with(chapterBody(), "maxSeats", 1));
        for (int round = 0; round < 10; round++) {
            jdbc.update("DELETE FROM chapter_seats WHERE member_id LIKE 'M93%'");
            String one = seat(id, "ZCB1", "M9302", "waiting");
            String two = seat(id, "ZCB3", "M9303", "waiting");
            List<Integer> codes = atOnce(List.of(
                () -> act(token("M9301", "member"), one, "approve"),
                () -> act(admin(), two, "approve")));
            assertThat(codes).as("round " + round).containsExactlyInAnyOrder(200, 400);
        }
    }

    @Test
    void fullChapterRefusesApproval() throws Exception {
        String id = createChapter(with(chapterBody(), "maxSeats", 1));
        seat(id, "ZCB1", "M9302", "approved");
        String waiting = seat(id, "ZCB3", "M9303", "waiting");
        act(token("M9301", "member"), waiting, "approve").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CHAPTER_FULL"));
        assertThat(seatStatus(waiting)).isEqualTo("waiting");
    }

    @Test
    void declineAndRemoveNotifyTheMember() throws Exception {
        String id = createChapter(chapterBody());
        String waiting = seat(id, "ZCB3", "M9303", "waiting");
        act(token("M9301", "member"), waiting, "decline").andExpect(status().isOk()).andExpect(jsonPath("$.seat.status").value("declined"));
        assertThat(notificationsFor("M9303")).isEqualTo(1);
        assertThat(auditBy("M9301", "CHAPTER_SEAT_DECLINE")).isEqualTo(1);

        String approved = seat(id, "ZCB1", "M9302", "approved");
        act(token("M9301", "member"), approved, "decline").andExpect(status().isBadRequest());
        act(token("M9301", "member"), approved, "remove").andExpect(status().isOk()).andExpect(jsonPath("$.seat.status").value("removed"));
        assertThat(notificationsFor("M9302")).isEqualTo(1);
        assertThat(auditBy("M9301", "CHAPTER_SEAT_REMOVE")).isEqualTo(1);
    }

    @Test
    void memberCancelsAndLeaves() throws Exception {
        String id = createChapter(chapterBody());
        String seat = joined("M9302", id, "ZCB1");
        act(token("M9305", "member"), seat, "cancel").andExpect(status().isForbidden());
        act(token("M9302", "member"), seat, "leave").andExpect(status().isBadRequest());
        act(token("M9302", "member"), seat, "cancel").andExpect(status().isOk()).andExpect(jsonPath("$.seat.status").value("cancelled"));
        String again = joined("M9302", id, "ZCB1");
        act(token("M9301", "member"), again, "approve").andExpect(status().isOk());
        act(token("M9302", "member"), again, "leave").andExpect(status().isOk()).andExpect(jsonPath("$.seat.status").value("left"));
        joined("M9302", id, "ZCB1");
    }

    @Test
    void coordinatorMayApproveTheirOwnBusiness() throws Exception {
        String id = createChapter(with(chapterBody(), "coordinatorId", "M9302"));
        String seat = joined("M9302", id, "ZCB1");
        act(token("M9302", "member"), seat, "approve").andExpect(status().isOk());
    }

    @Test
    void closingDeclinesWaitingRequestsAndReopeningRestoresSeats() throws Exception {
        String id = createChapter(chapterBody());
        String waiting = seat(id, "ZCB3", "M9303", "waiting");
        String approved = seat(id, "ZCB1", "M9302", "approved");
        update(admin(), id, Map.of("status", "closed")).andExpect(status().isOk());
        assertThat(seatStatus(waiting)).isEqualTo("declined");
        assertThat(seatStatus(approved)).isEqualTo("approved");
        assertThat(notificationsFor("M9303")).isEqualTo(1);
        String late = seat(id, "ZCB6", "M9306", "waiting");
        act(admin(), late, "approve").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CHAPTER_CLOSED"));
        update(admin(), id, Map.of("status", "open")).andExpect(status().isOk());
        assertThat(publicChapter(id).get("businesses").asInt()).isEqualTo(1);
    }

    @Test
    void aNewCoordinatorGetsTheRightsAtOnce() throws Exception {
        String id = createChapter(chapterBody());
        String seat = seat(id, "ZCB6", "M9306", "waiting");
        update(admin(), id, Map.of("coordinatorId", "M9303")).andExpect(status().isOk());
        act(token("M9301", "member"), seat, "approve").andExpect(status().isForbidden());
        act(token("M9303", "member"), seat, "approve").andExpect(status().isOk());
    }

    @Test
    void badActionWordsAre400() throws Exception {
        String seat = joined("M9302", createChapter(chapterBody()), "ZCB1");
        act(token("M9301", "member"), seat, "accept").andExpect(status().isBadRequest());
        act(token("M9301", "member"), seat, "").andExpect(status().isBadRequest());
        act(token("M9301", "member"), seat, null).andExpect(status().isBadRequest());
        act(token("M9301", "member"), seat, 5).andExpect(status().isBadRequest());
        act(token("M9301", "member"), seat, " APPROVE ").andExpect(status().isOk());
    }

    // ------------------------------------------------------------------ lists for members

    @Test
    void businessesListIsForLoggedInMembersOnly() throws Exception {
        String id = createChapter(chapterBody());
        seat(id, "ZCB1", "M9302", "approved");
        seat(id, "ZCB4", "M9304", "approved");
        seat(id, "ZCB3", "M9303", "waiting");
        send(get("/api/sangam/chapters/" + id + "/businesses"), null, null).andExpect(status().isUnauthorized());
        JsonNode list = body(send(get("/api/sangam/chapters/" + id + "/businesses"), token("M9305", "member"), null)
            .andExpect(status().isOk())).get("businesses");
        assertThat(list).hasSize(1);
        assertThat(list.get(0).get("business_id").asText()).isEqualTo("ZCB1");
        assertThat(list.get(0).get("owner_id").asText()).isEqualTo("M9302");
        assertThat(list.get(0).get("name").asText()).isEqualTo("Zc Shop One");
        assertThat(list.get(0).has("phone")).isFalse();

        update(admin(), id, Map.of("status", "closed")).andExpect(status().isOk());
        send(get("/api/sangam/chapters/" + id + "/businesses"), token("M9305", "member"), null).andExpect(status().isNotFound());
        send(get("/api/sangam/chapters/" + id + "/businesses"), token("M9301", "member"), null).andExpect(status().isOk());
    }

    @Test
    void mineShowsMyRowsAndChaptersICoordinate() throws Exception {
        String id = createChapter(chapterBody());
        joined("M9302", id, "ZCB1");
        send(get("/api/sangam/chapters/mine"), null, null).andExpect(status().isUnauthorized());
        JsonNode mine = body(send(get("/api/sangam/chapters/mine"), token("M9302", "member"), null).andExpect(status().isOk()));
        assertThat(mine.get("seats")).hasSize(1);
        assertThat(mine.at("/seats/0/chapter_name").asText()).isEqualTo("Zc Pune West");
        assertThat(mine.at("/seats/0/business_name").asText()).isEqualTo("Zc Shop One");
        assertThat(mine.at("/seats/0/status").asText()).isEqualTo("waiting");
        assertThat(mine.get("coordinating")).isEmpty();
        JsonNode coord = body(send(get("/api/sangam/chapters/mine"), token("M9301", "member"), null).andExpect(status().isOk()));
        assertThat(coord.at("/coordinating/0/id").asText()).isEqualTo(id);
        assertThat(coord.at("/coordinating/0/waiting").asInt()).isEqualTo(1);
    }

    @Test
    void seatsListShowsSimilarAndHidden() throws Exception {
        String id = createChapter(chapterBody());
        seat(id, "ZCB1", "M9302", "approved");
        String six = seat(id, "ZCB6", "M9306", "waiting");
        String three = seat(id, "ZCB3", "M9303", "waiting");
        send(get("/api/sangam/chapters/" + id + "/seats"), token("M9305", "member"), null).andExpect(status().isForbidden());
        JsonNode rows = body(send(get("/api/sangam/chapters/" + id + "/seats"), token("M9301", "member"), null)
            .andExpect(status().isOk())).get("seats");
        assertThat(rows).hasSize(3);
        for (JsonNode r : rows) {
            if (r.get("id").asText().equals(six)) assertThat(r.get("similar").asInt()).isEqualTo(1);
            if (r.get("id").asText().equals(three)) assertThat(r.get("similar").asInt()).isZero();
            assertThat(r.get("business_hidden").asBoolean()).isFalse();
        }
        jdbc.update("UPDATE businesses SET status = 'hidden' WHERE id = 'ZCB6'");
        JsonNode after = body(send(get("/api/sangam/chapters/" + id + "/seats"), admin(), null).andExpect(status().isOk())).get("seats");
        boolean sawHidden = false;
        for (JsonNode r : after) if (r.get("id").asText().equals(six)) sawHidden = r.get("business_hidden").asBoolean();
        assertThat(sawHidden).isTrue();
        act(token("M9301", "member"), six, "approve").andExpect(status().isOk());
    }
}
