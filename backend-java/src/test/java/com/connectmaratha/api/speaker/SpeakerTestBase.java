package com.connectmaratha.api.speaker;

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

/** Members M9101–M9106 and admin M9109, speakers named Zs…, and the request helpers both speaker test classes use. */
abstract class SpeakerTestBase extends PostgresTestBase {

    static final String ADMIN = "M9109";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() throws Exception {
        rateLimit.reset();
        // creates the tables before cleaning
        send(get("/api/speakers"), null, null).andExpect(status().isOk());
        String speakers = "SELECT id FROM speakers WHERE member_id LIKE 'M91%' OR name LIKE 'Zs%'";
        jdbc.update("DELETE FROM speaker_requests WHERE speaker_id IN (" + speakers + ") OR member_id LIKE 'M91%'");
        jdbc.update("DELETE FROM speakers WHERE member_id LIKE 'M91%' OR name LIKE 'Zs%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M91%'");
        for (String id : List.of("M9101", "M9102", "M9103", "M9104", "M9105", "M9106")) member(id, "member");
        member(ADMIN, "admin");
    }

    void member(String id, String role) {
        jdbc.update("INSERT INTO members (id, name, phone, role) VALUES (?, ?, ?, ?) "
            + "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, role = EXCLUDED.role",
            id, "Member " + id, phoneOf(id), role);
    }

    /** M9103 → 9876509103. */
    static String phoneOf(String memberId) {
        return "987650" + memberId.substring(1);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    String m(int n) {
        return token("M910" + n, "member");
    }

    String admin() {
        return token(ADMIN, "admin");
    }

    static Map<String, Object> profile(String name) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("name", name);
        b.put("title", "Zs वक्ते");
        b.put("category", "शिक्षण तज्ञ");
        b.put("city", "पुणे");
        b.put("topics", "MPSC तयारी");
        b.put("intro", "Zs परिचय");
        b.put("phone", "98765-00011");
        b.put("offers_talks", true);
        b.put("offers_guidance", true);
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

    /** The member applies with this profile; returns the speaker id. */
    String apply(String token, Map<String, Object> profile) throws Exception {
        return body(send(post("/api/speakers"), token, profile).andExpect(status().isCreated())).get("speaker").get("id").asText();
    }

    ResultActions adminAct(String id, Map<String, Object> action) throws Exception {
        return send(put("/api/admin/speakers/" + id), admin(), action);
    }

    static Map<String, Object> action(String action) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("action", action);
        return b;
    }

    /** M910n applies as "Zs Speaker n" and the admin approves; returns the speaker id. */
    String approved(int n) throws Exception {
        return approved(n, profile("Zs Speaker " + n));
    }

    String approved(int n, Map<String, Object> profile) throws Exception {
        String id = apply(m(n), profile);
        adminAct(id, action("approve")).andExpect(status().isOk());
        return id;
    }

    /** The admin adds a speaker without an account; returns its id. */
    String adminAdded(String name) throws Exception {
        return body(send(post("/api/admin/speakers"), admin(), profile(name)).andExpect(status().isCreated()))
            .get("speaker").get("id").asText();
    }

    JsonNode publicList(String token, String query) throws Exception {
        return body(send(get("/api/speakers" + query), token, null).andExpect(status().isOk())).get("speakers");
    }

    boolean listed(JsonNode list, String id) {
        for (JsonNode s : list) if (id.equals(s.get("id").asText())) return true;
        return false;
    }

    List<Map<String, Object>> notificationsOf(String memberId) {
        return jdbc.queryForList("SELECT title, message, type FROM notifications WHERE member_id = ? ORDER BY created_at, id", memberId);
    }
}
