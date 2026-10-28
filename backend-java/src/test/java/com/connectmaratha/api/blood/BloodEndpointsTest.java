package com.connectmaratha.api.blood;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
}
