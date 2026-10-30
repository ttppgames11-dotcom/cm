package com.connectmaratha.api.officer;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Members M9201–M9206 and admin M9209, officers named Zo…, and the request helpers both officer test classes use. */
abstract class OfficerTestBase extends PostgresTestBase {

    static final String ADMIN = "M9209";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() throws Exception {
        rateLimit.reset();
        // creates the tables before cleaning
        send(get("/api/officers"), null, null).andExpect(status().isOk());
        String officers = "SELECT id FROM officers WHERE member_id LIKE 'M92%' OR name LIKE 'Zo%'";
        jdbc.update("DELETE FROM officer_requests WHERE officer_id IN (" + officers + ") OR member_id LIKE 'M92%'");
        jdbc.update("DELETE FROM officers WHERE member_id LIKE 'M92%' OR name LIKE 'Zo%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M92%'");
        for (String id : List.of("M9201", "M9202", "M9203", "M9204", "M9205", "M9206")) member(id, "member");
        member(ADMIN, "admin");
    }

    void member(String id, String role) {
        jdbc.update("INSERT INTO members (id, name, phone, role) VALUES (?, ?, ?, ?) "
            + "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, role = EXCLUDED.role",
            id, "Member " + id, phoneOf(id), role);
    }

    /** M9203 → 9876509203. */
    static String phoneOf(String memberId) {
        return "987650" + memberId.substring(1);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    String m(int n) {
        return token("M920" + n, "member");
    }

    String admin() {
        return token(ADMIN, "admin");
    }

    static Map<String, Object> profile(String name) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("name", name);
        b.put("service", "mpsc_1");
        b.put("service_status", "serving");
        b.put("batch_year", 2018);
        b.put("post", "Zo उपजिल्हाधिकारी");
        b.put("department", "महसूल");
        b.put("city", "सातारा");
        b.put("exams", List.of("mpsc_rajyaseva", "mpsc_group_b"));
        b.put("intro", "Zo परिचय");
        b.put("phone", "98765-00021");
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

    /** The member applies with this profile; returns the officer id. */
    String apply(String token, Map<String, Object> profile) throws Exception {
        return body(send(post("/api/officers"), token, profile).andExpect(status().isCreated())).get("officer").get("id").asText();
    }

    ResultActions adminAct(String id, Map<String, Object> action) throws Exception {
        return send(put("/api/admin/officers/" + id), admin(), action);
    }

    static Map<String, Object> action(String action) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("action", action);
        return b;
    }

    /** M920n applies as "Zo Officer n" and the admin approves; returns the officer id. */
    String approved(int n) throws Exception {
        return approved(n, profile("Zo Officer " + n));
    }

    String approved(int n, Map<String, Object> profile) throws Exception {
        String id = apply(m(n), profile);
        adminAct(id, action("approve")).andExpect(status().isOk());
        return id;
    }

    /** The admin adds an officer without an account; returns its id. */
    String adminAdded(String name) throws Exception {
        return body(send(post("/api/admin/officers"), admin(), profile(name)).andExpect(status().isCreated()))
            .get("officer").get("id").asText();
    }

    ResultActions setAccepting(String token, Object accepting) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        if (accepting != null) b.put("accepting", accepting);
        return send(put("/api/officers/mine/accepting"), token, b);
    }

    JsonNode publicList(String token, String query) throws Exception {
        return body(send(get("/api/officers" + query), token, null).andExpect(status().isOk())).get("officers");
    }

    JsonNode find(JsonNode list, String id) {
        for (JsonNode o : list) if (id.equals(o.get("id").asText())) return o;
        return null;
    }

    boolean listed(JsonNode list, String id) {
        return find(list, id) != null;
    }

    List<Map<String, Object>> notificationsOf(String memberId) {
        return jdbc.queryForList("SELECT title, message, type FROM notifications WHERE member_id = ? ORDER BY created_at, id", memberId);
    }
}
