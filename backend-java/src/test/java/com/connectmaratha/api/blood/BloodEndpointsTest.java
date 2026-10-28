package com.connectmaratha.api.blood;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.blood.repository.BloodRepository;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
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

/** /api/blood/... and /api/admin/blood: member-owned blood requests that close, donor profiles, matching notifications. */
@SpringBootTest
@AutoConfigureMockMvc
class BloodEndpointsTest extends PostgresTestBase {

    static final String ADMIN = "M9209";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;
    @Autowired BloodRepository repository;

    @BeforeEach
    void fresh() throws Exception {
        rateLimit.reset();
        // creates the tables (and runs the old-entry copy) before cleaning
        send(get("/api/blood/donors"), null, null).andExpect(status().isOk());
        jdbc.update("DELETE FROM blood_requests WHERE member_id LIKE 'M92%' OR patient_name LIKE 'Zb%'");
        jdbc.update("DELETE FROM blood_donors WHERE member_id LIKE 'M92%' OR name LIKE 'Zb%'");
        jdbc.update("DELETE FROM directory_records WHERE id LIKE '%Zb%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M92%'");
        jdbc.update("DELETE FROM audit_logs WHERE user_id LIKE 'M92%'");
        for (String id : List.of("M9201", "M9202", "M9203", "M9204", "M9205", "M9206", "M9207", "M9208", ADMIN)) member(id);
    }

    // ------------------------------------------------------------------ helpers

    void member(String id) {
        jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name",
            id, "Member " + id, "98000" + id.substring(1));
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    String member1() {
        return token("M9201", "member");
    }

    String admin() {
        return token(ADMIN, "admin");
    }

    static Map<String, Object> donorBody() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("name", "Zb Donor");
        b.put("bloodGroup", "O+");
        b.put("city", "Pune");
        b.put("district", "पुणे");
        b.put("phone", "9876543210");
        return b;
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

    JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString(UTF_8));
    }

    String raw(ResultActions result) throws Exception {
        return result.andReturn().getResponse().getContentAsString(UTF_8);
    }

    ResultActions saveDonor(String token, Map<String, Object> body) throws Exception {
        return send(post("/api/blood/donors"), token, body);
    }

    /** Inserts a donor row directly. */
    void donor(String id, String memberId, String group, String district, boolean available, Integer lastDonatedDaysAgo, boolean hidden) {
        jdbc.update("INSERT INTO blood_donors (id, member_id, name, blood_group, city, district, phone, available, last_donated, hidden) "
            + "VALUES (?, ?, ?, ?, 'Pune', ?, '9811111111', ?, ?, ?)",
            id, memberId, "Zb " + id, group, district, available,
            lastDonatedDaysAgo == null ? null : java.sql.Date.valueOf(LocalDate.now().minusDays(lastDonatedDaysAgo)), hidden);
    }

    int donorRows(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM blood_donors WHERE member_id = ?", Integer.class, memberId);
    }

    JsonNode donorRow(JsonNode list, String name) {
        for (JsonNode d : list.get("donors")) if (name.equals(d.get("name").asText())) return d;
        return null;
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
        List<Integer> statuses = new java.util.ArrayList<>();
        for (java.util.concurrent.Future<Integer> f : results) statuses.add(f.get());
        pool.shutdown();
        return statuses;
    }

    // ------------------------------------------------------------------ donors

    @Test
    void donorProfileNeedsALogin() throws Exception {
        saveDonor(null, donorBody()).andExpect(status().isUnauthorized());
        send(get("/api/blood/donors/me"), null, null).andExpect(status().isUnauthorized());
        send(delete("/api/blood/donors/me"), null, null).andExpect(status().isUnauthorized());
    }

    @Test
    void memberCreatesThenUpdatesTheirProfile() throws Exception {
        JsonNode created = body(saveDonor(member1(), donorBody()).andExpect(status().isCreated()));
        String id = created.at("/donor/id").asText();
        assertThat(id).startsWith("BD");
        JsonNode updated = body(saveDonor(member1(), with(donorBody(), "city", "Satara")).andExpect(status().isOk()));
        assertThat(updated.at("/donor/id").asText()).isEqualTo(id);
        assertThat(updated.at("/donor/city").asText()).isEqualTo("Satara");
        assertThat(donorRows("M9201")).isEqualTo(1);
        send(get("/api/blood/donors/me"), member1(), null)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.donor.id").value(id))
            .andExpect(jsonPath("$.donor.phone").value("9876543210"));
    }

    @Test
    void myDonorIsNullWithoutAProfile() throws Exception {
        send(get("/api/blood/donors/me"), member1(), null)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.donor").isEmpty());
    }

    @Test
    void simultaneousFirstProfilesLeaveOneRow() throws Exception {
        String t = token("M9202", "member");
        for (int round = 0; round < 10; round++) {
            jdbc.update("DELETE FROM blood_donors WHERE member_id = 'M9202'");
            List<Integer> statuses = atOnce(List.of(() -> saveDonor(t, donorBody()), () -> saveDonor(t, donorBody())));
            assertThat(statuses).as("round " + round).allMatch(s -> s == 200 || s == 201);
            assertThat(donorRows("M9202")).isEqualTo(1);
        }
    }

    @Test
    void donorFieldsAreValidated() throws Exception {
        String tomorrow = LocalDate.now().plusDays(1).toString();
        for (Map<String, Object> bad : List.of(
                with(donorBody(), "name", "Z"),
                with(donorBody(), "bloodGroup", "Z+"),
                with(donorBody(), "district", null),
                with(donorBody(), "phone", "123"),
                with(donorBody(), "lastDonated", tomorrow),
                with(donorBody(), "lastDonated", "28-10-2026"),
                with(donorBody(), "available", "yes"))) {
            saveDonor(member1(), bad).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
        assertThat(donorRows("M9201")).isZero();
    }

    @Test
    void snakeCaseFieldsAreAccepted() throws Exception {
        Map<String, Object> b = with(with(donorBody(), "bloodGroup", null), "blood_group", "AB-");
        b.put("last_donated", LocalDate.now().minusDays(10).toString());
        saveDonor(member1(), b).andExpect(status().isCreated())
            .andExpect(jsonPath("$.donor.blood_group").value("AB-"))
            .andExpect(jsonPath("$.donor.last_donated").value(LocalDate.now().minusDays(10).toString()));
    }

    @Test
    void unknownFieldsAreNotStored() throws Exception {
        Map<String, Object> b = donorBody();
        b.put("hidden", true);
        b.put("member_id", "M9299");
        b.put("id", "HACKED");
        saveDonor(member1(), b).andExpect(status().isCreated());
        assertThat(donorRows("M9201")).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT hidden FROM blood_donors WHERE member_id = 'M9201'", Boolean.class)).isFalse();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM blood_donors WHERE id = 'HACKED'", Integer.class)).isZero();
    }

    @Test
    void ninetyDayGapControlsAvailability() throws Exception {
        LocalDate thirty = LocalDate.now().minusDays(30);
        saveDonor(member1(), with(donorBody(), "lastDonated", thirty.toString())).andExpect(status().isCreated());
        JsonNode row = donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb Donor");
        assertThat(row.get("available").asBoolean()).isFalse();
        assertThat(row.get("can_donate_from").asText()).isEqualTo(thirty.plusDays(90).toString());

        saveDonor(member1(), with(donorBody(), "lastDonated", LocalDate.now().minusDays(90).toString())).andExpect(status().isOk());
        row = donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb Donor");
        assertThat(row.get("available").asBoolean()).isTrue();
        assertThat(row.get("can_donate_from").isNull()).isTrue();
    }

    @Test
    void availabilitySwitchOffHidesFromAvailable() throws Exception {
        saveDonor(member1(), with(donorBody(), "available", false)).andExpect(status().isCreated());
        JsonNode row = donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb Donor");
        assertThat(row.get("available").asBoolean()).isFalse();
        assertThat(row.get("can_donate_from").isNull()).isTrue();
    }

    @Test
    void visitorsSeeNoPhonesMembersDo() throws Exception {
        saveDonor(member1(), donorBody()).andExpect(status().isCreated());
        String visitor = raw(send(get("/api/blood/donors"), null, null));
        assertThat(visitor).doesNotContain("9876543210").doesNotContain("member_id").doesNotContain("\"phone\"");
        assertThat(donorRow(json.readTree(visitor), "Zb Donor").get("mine").asBoolean()).isFalse();

        JsonNode asOwner = donorRow(body(send(get("/api/blood/donors"), member1(), null)), "Zb Donor");
        assertThat(asOwner.get("phone").asText()).isEqualTo("9876543210");
        assertThat(asOwner.get("mine").asBoolean()).isTrue();
        JsonNode asOther = donorRow(body(send(get("/api/blood/donors"), token("M9202", "member"), null)), "Zb Donor");
        assertThat(asOther.get("phone").asText()).isEqualTo("9876543210");
        assertThat(asOther.get("mine").asBoolean()).isFalse();
        assertThat(raw(send(get("/api/blood/donors"), token("M9202", "member"), null))).doesNotContain("member_id");
    }

    @Test
    void listFiltersByGroupAndDistrictAndSkipsHidden() throws Exception {
        donor("BDZb1", null, "O+", "पुणे", true, null, false);
        donor("BDZb2", null, "A+", "पुणे", true, null, false);
        donor("BDZb3", null, "O+", "सातारा", true, null, false);
        donor("BDZb4", null, "O+", "पुणे", true, null, true);
        donor("BDZb5", null, "O+", "पुणे", false, null, false);
        JsonNode list = body(send(get("/api/blood/donors").param("bloodGroup", "O+").param("district", "पुणे"), null, null));
        List<String> names = new java.util.ArrayList<>();
        for (JsonNode d : list.get("donors")) if (d.get("name").asText().startsWith("Zb")) names.add(d.get("name").asText());
        assertThat(names).containsExactly("Zb BDZb1", "Zb BDZb5"); // available first; hidden, A+ and Satara left out
    }

    @Test
    void deleteRemovesOnlyMyProfile() throws Exception {
        saveDonor(member1(), donorBody()).andExpect(status().isCreated());
        saveDonor(token("M9202", "member"), with(donorBody(), "name", "Zb Other")).andExpect(status().isCreated());
        send(delete("/api/blood/donors/me"), member1(), null).andExpect(status().isOk());
        assertThat(donorRows("M9201")).isZero();
        assertThat(donorRows("M9202")).isEqualTo(1);
        send(delete("/api/blood/donors/me"), member1(), null)
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("DONOR_NOT_FOUND"));
    }

    @Test
    void hiddenProfileStaysHiddenWhenUpdated() throws Exception {
        saveDonor(member1(), donorBody()).andExpect(status().isCreated());
        jdbc.update("UPDATE blood_donors SET hidden = true WHERE member_id = 'M9201'");
        saveDonor(member1(), with(donorBody(), "city", "Satara")).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT hidden FROM blood_donors WHERE member_id = 'M9201'", Boolean.class)).isTrue();
        assertThat(donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb Donor")).isNull();
    }

    @Test
    void oldEntriesAreCopiedOnce() throws Exception {
        jdbc.update("INSERT INTO directory_records (collection, id, data, seq) VALUES (?, ?, ?, ?)",
            "bloodDonors", "DON-Zb1", "{\"name\":\"Zb Old\",\"group\":\"B+\",\"city\":\"Pune\",\"phone\":\"9000000001\"}", 900001L);
        jdbc.update("INSERT INTO directory_records (collection, id, data, seq) VALUES (?, ?, ?, ?)",
            "bloodDonors", "DON-Zb2", "{\"name\":\"Zb Bad\",\"group\":\"X\"}", 900002L);
        jdbc.update("INSERT INTO directory_records (collection, id, data, seq) VALUES (?, ?, ?, ?)",
            "bloodRequests", "REQ-Zb1",
            "{\"patient\":\"Zb Patient\",\"bloodGroup\":\"A+\",\"hospital\":\"Sassoon\",\"contact\":\"9000000002\"}", 900003L);

        int[] first = repository.copyOldEntries();
        assertThat(first[0]).isGreaterThanOrEqualTo(1);
        assertThat(first[1]).isGreaterThanOrEqualTo(1);
        Map<String, Object> d = jdbc.queryForMap("SELECT * FROM blood_donors WHERE id = 'DON-Zb1'");
        assertThat(d.get("member_id")).isNull();
        assertThat(d.get("blood_group")).isEqualTo("B+");
        assertThat(d.get("phone")).isEqualTo("9000000001");
        assertThat(d.get("hidden")).isEqualTo(false);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM blood_donors WHERE id = 'DON-Zb2'", Integer.class)).isZero();
        Map<String, Object> r = jdbc.queryForMap("SELECT * FROM blood_requests WHERE id = 'REQ-Zb1'");
        assertThat(r.get("status")).isEqualTo("closed");
        assertThat(r.get("patient_name")).isEqualTo("Zb Patient");
        assertThat(r.get("contact_phone")).isEqualTo("9000000002");
        assertThat(r.get("member_id")).isNull();

        int[] second = repository.copyOldEntries();
        assertThat(second).containsExactly(0, 0);
        assertThat(donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb Old")).isNotNull();
    }

    // ------------------------------------------------------------------ requests

    static Map<String, Object> requestBody() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("patientName", "Zb Patient");
        b.put("bloodGroup", "O+");
        b.put("units", 2);
        b.put("hospital", "Zb Hospital");
        b.put("city", "Pune");
        b.put("district", "पुणे");
        b.put("contactPhone", "9876543211");
        b.put("urgency", "तात्काळ");
        return b;
    }

    ResultActions postRequest(String token, Map<String, Object> body) throws Exception {
        return send(post("/api/blood/requests"), token, body);
    }

    /** Posts as the member (expects 201) and returns the request id. */
    String posted(String token, Map<String, Object> body) throws Exception {
        return body(postRequest(token, body).andExpect(status().isCreated())).at("/request/id").asText();
    }

    ResultActions act(String token, String id, Object action) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        if (action != null) b.put("action", action);
        return send(put("/api/blood/requests/" + id), token, b);
    }

    void expire(String id) {
        jdbc.update("UPDATE blood_requests SET closes_at = now() - interval '1 second' WHERE id = ?", id);
    }

    String requestStatus(String id) {
        return jdbc.queryForObject("SELECT status FROM blood_requests WHERE id = ?", String.class, id);
    }

    List<String> publicIds(String token) throws Exception {
        List<String> ids = new java.util.ArrayList<>();
        for (JsonNode r : body(send(get("/api/blood/requests"), token, null)).get("requests")) ids.add(r.get("id").asText());
        return ids;
    }

    JsonNode mineRow(String token, String id) throws Exception {
        for (JsonNode r : body(send(get("/api/blood/requests/mine"), token, null)).get("requests")) {
            if (id.equals(r.get("id").asText())) return r;
        }
        return null;
    }

    int notificationsFor(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = ?", Integer.class, memberId);
    }

    int auditBy(String userId, String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE user_id = ? AND action = ?", Integer.class, userId, action);
    }

    @Test
    void postingNeedsALogin() throws Exception {
        postRequest(null, requestBody()).andExpect(status().isUnauthorized());
        send(get("/api/blood/requests/mine"), null, null).andExpect(status().isUnauthorized());
        act(null, "BR1", "close").andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM blood_requests WHERE patient_name = 'Zb Patient'", Integer.class)).isZero();
    }

    @Test
    void memberPostsARequest() throws Exception {
        JsonNode reply = body(postRequest(member1(), requestBody()).andExpect(status().isCreated()));
        JsonNode r = reply.get("request");
        assertThat(r.get("id").asText()).startsWith("BR");
        assertThat(r.get("state").asText()).isEqualTo("open");
        assertThat(r.get("mine").asBoolean()).isTrue();
        assertThat(r.get("units").asInt()).isEqualTo(2);
        assertThat(reply.get("notified").asInt()).isZero();
        java.time.Instant closes = java.time.Instant.parse(r.get("closes_at").asText());
        java.time.Instant expected = java.time.Instant.now().plus(java.time.Duration.ofDays(7));
        assertThat(java.time.Duration.between(closes, expected).abs()).isLessThan(java.time.Duration.ofMinutes(1));
        assertThat(jdbc.queryForObject("SELECT member_id FROM blood_requests WHERE id = ?", String.class, r.get("id").asText()))
            .isEqualTo("M9201");
    }

    @Test
    void requestFieldsAreValidated() throws Exception {
        for (Map<String, Object> bad : List.of(
                with(requestBody(), "bloodGroup", "Z+"),
                with(requestBody(), "city", ""),
                with(requestBody(), "contactPhone", "1"),
                with(requestBody(), "units", 25),
                with(requestBody(), "units", 2.5),
                with(requestBody(), "note", "x".repeat(301)),
                with(requestBody(), "patientName", null))) {
            String reply = raw(postRequest(member1(), bad).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR")));
            assertThat(reply).doesNotContain("9876543211");
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM blood_requests WHERE member_id = 'M9201'", Integer.class)).isZero();
    }

    @Test
    void threeRequestsADay() throws Exception {
        for (int i = 0; i < 3; i++) posted(member1(), requestBody());
        postRequest(member1(), requestBody())
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
        jdbc.update("UPDATE blood_requests SET created_at = now() - interval '25 hours' WHERE member_id = 'M9201'");
        postRequest(member1(), requestBody()).andExpect(status().isCreated());
    }

    @Test
    void visitorsSeeRequestsWithoutPhones() throws Exception {
        posted(member1(), requestBody());
        String visitor = raw(send(get("/api/blood/requests"), null, null));
        assertThat(visitor).contains("Zb Patient").doesNotContain("9876543211").doesNotContain("member_id").doesNotContain("contact_phone");
        JsonNode asMember = body(send(get("/api/blood/requests"), token("M9202", "member"), null));
        boolean found = false;
        for (JsonNode r : asMember.get("requests")) {
            if ("Zb Patient".equals(r.get("patient_name").asText())) {
                found = true;
                assertThat(r.get("contact_phone").asText()).isEqualTo("9876543211");
                assertThat(r.get("mine").asBoolean()).isFalse();
                assertThat(r.has("member_id")).isFalse();
            }
        }
        assertThat(found).isTrue();
    }

    @Test
    void listShowsOnlyActiveNewestFirstWithFilters() throws Exception {
        String done = posted(member1(), requestBody());
        String closed = posted(member1(), requestBody());
        String expired = posted(member1(), requestBody());
        act(member1(), done, "received").andExpect(status().isOk());
        act(member1(), closed, "close").andExpect(status().isOk());
        expire(expired);
        String older = posted(token("M9202", "member"), with(requestBody(), "bloodGroup", "A+"));
        jdbc.update("UPDATE blood_requests SET created_at = now() - interval '1 hour' WHERE id = ?", older);
        String newer = posted(token("M9202", "member"), with(requestBody(), "district", "सातारा"));

        List<String> ids = publicIds(null);
        assertThat(ids).doesNotContain(done, closed, expired);
        assertThat(ids.indexOf(newer)).isLessThan(ids.indexOf(older)).isGreaterThanOrEqualTo(0);

        List<String> aPlus = new java.util.ArrayList<>();
        for (JsonNode r : body(send(get("/api/blood/requests").param("bloodGroup", "A+"), null, null)).get("requests")) aPlus.add(r.get("id").asText());
        assertThat(aPlus).contains(older).doesNotContain(newer);
        List<String> satara = new java.util.ArrayList<>();
        for (JsonNode r : body(send(get("/api/blood/requests").param("district", " सातारा "), null, null)).get("requests")) satara.add(r.get("id").asText());
        assertThat(satara).contains(newer).doesNotContain(older);
    }

    @Test
    void ownerMarksReceivedOrCloses() throws Exception {
        String a = posted(member1(), requestBody());
        String b = posted(member1(), requestBody());
        act(member1(), a, "received").andExpect(status().isOk()).andExpect(jsonPath("$.request.state").value("fulfilled"));
        act(member1(), b, " Close ").andExpect(status().isOk()).andExpect(jsonPath("$.request.state").value("closed"));
        assertThat(publicIds(null)).doesNotContain(a, b);
        assertThat(jdbc.queryForObject("SELECT closed_by FROM blood_requests WHERE id = ?", String.class, a)).isEqualTo("M9201");
    }

    @Test
    void extendAddsSevenDaysEvenAfterExpiry() throws Exception {
        String id = posted(member1(), requestBody());
        expire(id);
        assertThat(publicIds(null)).doesNotContain(id);
        assertThat(mineRow(member1(), id).get("state").asText()).isEqualTo("expired");
        act(member1(), id, "extend").andExpect(status().isOk()).andExpect(jsonPath("$.request.state").value("open"));
        assertThat(publicIds(null)).contains(id);
        java.time.Instant closes = java.time.Instant.parse(mineRow(member1(), id).get("closes_at").asText());
        assertThat(closes).isAfter(java.time.Instant.now().plus(java.time.Duration.ofDays(6)));

        String other = posted(member1(), requestBody());
        expire(other);
        act(member1(), other, "received").andExpect(status().isOk());
        assertThat(requestStatus(other)).isEqualTo("fulfilled");
    }

    @Test
    void othersCannotActOnMyRequest() throws Exception {
        String id = posted(member1(), requestBody());
        for (String action : List.of("received", "close", "extend")) {
            act(token("M9202", "member"), id, action).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NOT_OWNER"));
        }
        assertThat(requestStatus(id)).isEqualTo("open");
        act(member1(), "BR-none", "close").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("REQUEST_NOT_FOUND"));
    }

    @Test
    void actingTwiceIsRefused() throws Exception {
        String id = posted(member1(), requestBody());
        act(member1(), id, "received").andExpect(status().isOk());
        for (String action : List.of("close", "extend", "received")) {
            act(member1(), id, action).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("INVALID_TRANSITION"));
        }
        assertThat(requestStatus(id)).isEqualTo("fulfilled");
    }

    @Test
    void badActionWordsAre400() throws Exception {
        String id = posted(member1(), requestBody());
        for (Object bad : new Object[] {"accept", "", null, 5}) {
            act(member1(), id, bad).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
        assertThat(requestStatus(id)).isEqualTo("open");
    }

    @Test
    void adminClosesAnyRequestAndItIsAudited() throws Exception {
        String id = posted(member1(), requestBody());
        act(admin(), id, "close").andExpect(status().isOk());
        assertThat(requestStatus(id)).isEqualTo("closed");
        assertThat(auditBy(ADMIN, "BLOOD_REQUEST_CLOSE")).isEqualTo(1);
        String own = posted(member1(), requestBody());
        act(member1(), own, "close").andExpect(status().isOk());
        assertThat(auditBy("M9201", "BLOOD_REQUEST_CLOSE")).isZero();
    }

    @Test
    void mineListsAllMyRequestsWithState() throws Exception {
        String open = posted(member1(), requestBody());
        String expired = posted(member1(), requestBody());
        String done = posted(member1(), requestBody());
        String other = posted(token("M9202", "member"), requestBody());
        expire(expired);
        act(member1(), done, "received").andExpect(status().isOk());
        jdbc.update("UPDATE blood_requests SET created_at = now() - interval '25 hours' WHERE member_id = 'M9201'");
        String closed = posted(member1(), requestBody());
        act(member1(), closed, "close").andExpect(status().isOk());

        assertThat(mineRow(member1(), open).get("state").asText()).isEqualTo("open");
        assertThat(mineRow(member1(), expired).get("state").asText()).isEqualTo("expired");
        assertThat(mineRow(member1(), done).get("state").asText()).isEqualTo("fulfilled");
        assertThat(mineRow(member1(), closed).get("state").asText()).isEqualTo("closed");
        assertThat(mineRow(member1(), other)).isNull();
        assertThat(mineRow(member1(), open).get("contact_phone").asText()).isEqualTo("9876543211");
    }

    @Test
    void matchingDonorsAreNotified() throws Exception {
        donor("BDZbN2", "M9202", "O+", " पुणे ", true, null, false);   // matches (district spaces ignored)
        donor("BDZbN3", "M9203", "O+", "पुणे", true, 89, false);      // gave blood 89 days ago
        donor("BDZbN4", "M9204", "O+", "पुणे", false, null, false);   // switched off
        donor("BDZbN5", "M9205", "O+", "पुणे", true, null, true);     // hidden
        donor("BDZbN6", "M9206", "A+", "पुणे", true, null, false);    // other group
        donor("BDZbN7", "M9207", "O+", "सातारा", true, null, false);  // other district
        donor("BDZbN1", "M9201", "O+", "पुणे", true, null, false);    // the poster
        donor("BDZbN0", null, "O+", "पुणे", true, null, false);       // old entry without an owner
        donor("BDZbN8", "M9208", "O+", "पुणे", true, 90, false);      // exactly 90 days: eligible

        JsonNode reply = body(postRequest(member1(), requestBody()).andExpect(status().isCreated()));
        assertThat(reply.get("notified").asInt()).isEqualTo(2);
        assertThat(notificationsFor("M9202")).isEqualTo(1);
        assertThat(notificationsFor("M9208")).isEqualTo(1);
        for (String id : List.of("M9201", "M9203", "M9204", "M9205", "M9206", "M9207")) {
            assertThat(notificationsFor(id)).as(id).isZero();
        }
        Map<String, Object> n = jdbc.queryForMap("SELECT * FROM notifications WHERE member_id = 'M9202'");
        assertThat(String.valueOf(n.get("title"))).contains("O+").contains("पुणे");
        assertThat(String.valueOf(n.get("message"))).contains("Zb Hospital");
    }

    @Test
    void notificationsAreCappedAt100() throws Exception {
        for (int i = 0; i < 105; i++) {
            String m = "M92A" + String.format("%03d", i);
            member(m);
            donor("BDZbC" + i, m, "B-", "पुणे", true, null, false);
        }
        JsonNode reply = body(postRequest(member1(), with(requestBody(), "bloodGroup", "B-")).andExpect(status().isCreated()));
        assertThat(reply.get("notified").asInt()).isEqualTo(100);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id LIKE 'M92A%'", Integer.class)).isEqualTo(100);
    }

    @Test
    void adminSeesEverythingAndHidesDonors() throws Exception {
        send(get("/api/admin/blood"), member1(), null).andExpect(status().isForbidden());
        send(put("/api/admin/blood/donors/BDZbA"), member1(), Map.of("hidden", true)).andExpect(status().isForbidden());
        send(get("/api/admin/blood"), null, null).andExpect(status().isUnauthorized());

        String closed = posted(member1(), requestBody());
        act(member1(), closed, "close").andExpect(status().isOk());
        donor("BDZbA", "M9202", "O+", "पुणे", true, null, false);
        donor("BDZbH", null, "A+", "पुणे", true, null, true);

        JsonNode all = body(send(get("/api/admin/blood"), admin(), null).andExpect(status().isOk()));
        JsonNode req = null;
        for (JsonNode r : all.get("requests")) if (closed.equals(r.get("id").asText())) req = r;
        assertThat(req).isNotNull();
        assertThat(req.get("state").asText()).isEqualTo("closed");
        assertThat(req.get("contact_phone").asText()).isEqualTo("9876543211");
        assertThat(req.get("owner_name").asText()).isEqualTo("Member M9201");
        JsonNode hidden = null;
        JsonNode owned = null;
        for (JsonNode d : all.get("donors")) {
            if ("BDZbH".equals(d.get("id").asText())) hidden = d;
            if ("BDZbA".equals(d.get("id").asText())) owned = d;
        }
        assertThat(hidden).isNotNull();
        assertThat(hidden.get("hidden").asBoolean()).isTrue();
        assertThat(owned.get("phone").asText()).isEqualTo("9811111111");
        assertThat(owned.get("owner_name").asText()).isEqualTo("Member M9202");

        send(put("/api/admin/blood/donors/BDZbA"), admin(), Map.of("hidden", true))
            .andExpect(status().isOk()).andExpect(jsonPath("$.donor.hidden").value(true));
        assertThat(donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb BDZbA")).isNull();
        assertThat(auditBy(ADMIN, "BLOOD_DONOR_HIDE")).isEqualTo(1);
        send(put("/api/admin/blood/donors/BDZbA"), admin(), Map.of("hidden", false)).andExpect(status().isOk());
        assertThat(donorRow(body(send(get("/api/blood/donors"), null, null)), "Zb BDZbA")).isNotNull();
        assertThat(auditBy(ADMIN, "BLOOD_DONOR_UNHIDE")).isEqualTo(1);
        send(put("/api/admin/blood/donors/BD-none"), admin(), Map.of("hidden", true))
            .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("DONOR_NOT_FOUND"));
        send(put("/api/admin/blood/donors/BDZbA"), admin(), Map.of("hidden", "yes")).andExpect(status().isBadRequest());
    }
}
