package com.connectmaratha.api.business;

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

/** Business ownership: who adds, edits, hides and is assigned a directory business. */
@SpringBootTest
@AutoConfigureMockMvc
class BusinessOwnershipTest extends PostgresTestBase {

    static final String NO_FIELDS = "व्यवसायाचे नाव, मालकाचे नाव आणि वर्गवारी आवश्यक आहे.";
    static final String NOT_FOUND = "व्यवसाय सापडला नाही.";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() {
        rateLimit.reset();
        jdbc.update("DELETE FROM business_reviews WHERE business_id IN (SELECT id FROM businesses WHERE name LIKE 'Zo%')");
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zo%'");
        for (String id : List.of("M9501", "M9502", "M9509")) {
            jdbc.update("INSERT INTO members (id, name) VALUES (?, ?) ON CONFLICT (id) DO NOTHING", id, "Member " + id);
        }
    }

    // ------------------------------------------------------------------ helpers

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    static Map<String, Object> business(String name) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("owner", "Patil");
        body.put("cat", "it");
        body.put("city", "पुणे");
        body.put("district", "Zodistrict");
        return body;
    }

    ResultActions add(String token, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/businesses").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    /** Adds a business as the given member and returns its id. */
    String added(String token, String name) throws Exception {
        String body = add(token, business(name)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(UTF_8);
        return json.readTree(body).at("/business/id").asText();
    }

    ResultActions fetch(String path, String token) throws Exception {
        MockHttpServletRequestBuilder req = get(path);
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    JsonNode listBody(String token) throws Exception {
        String body = fetch("/api/businesses?district=Zodistrict", token).andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString(UTF_8);
        return json.readTree(body);
    }

    // ------------------------------------------------------------------ adding

    @Test
    void addingNeedsALogin() throws Exception {
        add(null, business("Zo Needs Login")).andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM businesses WHERE name = 'Zo Needs Login'", Integer.class)).isZero();
    }

    @Test
    void addRecordsTheLoggedInMemberAsOwner() throws Exception {
        Map<String, Object> body = business("Zo Owned");
        body.put("owner_id", "M9502");
        body.put("status", "hidden");
        body.put("rating", 1);
        body.put("id", "X1");
        add(token("M9501", "member"), body)
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.business.owner_id").value("M9501"))
            .andExpect(jsonPath("$.business.status").value("visible"));
        Map<String, Object> row = jdbc.queryForMap("SELECT id, owner_id, status, rating FROM businesses WHERE name = 'Zo Owned'");
        assertThat(row.get("owner_id")).isEqualTo("M9501");
        assertThat(row.get("status")).isEqualTo("visible");
        assertThat(((Number) row.get("rating")).doubleValue()).isEqualTo(5.0);
        assertThat(row.get("id")).isNotEqualTo("X1");
    }

    @Test
    void addStillRequiresNameOwnerAndCategory() throws Exception {
        Map<String, Object> noOwner = business("Zo No Owner");
        noOwner.remove("owner");
        add(token("M9501", "member"), noOwner)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value(NO_FIELDS));
    }

    // ------------------------------------------------------------------ list and detail

    @Test
    void listAndDetailFlagMineOnlyWhenLoggedIn() throws Exception {
        String id = added(token("M9501", "member"), "Zo Mine");
        assertThat(listBody(token("M9501", "member")).at("/businesses/0/isMine").asBoolean()).isTrue();
        assertThat(listBody(token("M9502", "member")).at("/businesses/0/isMine").asBoolean(true)).isFalse();
        assertThat(listBody(null).at("/businesses/0").has("isMine")).isFalse();
        fetch("/api/businesses/" + id, token("M9501", "member")).andExpect(jsonPath("$.business.isMine").value(true));
        fetch("/api/businesses/" + id, token("M9502", "member")).andExpect(jsonPath("$.business.isMine").value(false));
        String anonymous = fetch("/api/businesses/" + id, null).andReturn().getResponse().getContentAsString(UTF_8);
        assertThat(json.readTree(anonymous).at("/business").has("isMine")).isFalse();
    }

    @Test
    void brokenTokenStillGetsThePublicList() throws Exception {
        added(token("M9501", "member"), "Zo Public");
        JsonNode list = listBody("Bearer not.a.token");
        assertThat(list.get("count").asInt()).isGreaterThanOrEqualTo(1);
        assertThat(list.at("/businesses/0").has("isMine")).isFalse();
    }

    @Test
    void hiddenBusinessIsLeftOutOfTheList() throws Exception {
        added(token("M9501", "member"), "Zo Visible");
        String hiddenId = added(token("M9501", "member"), "Zo Hidden");
        String nullId = added(token("M9501", "member"), "Zo Null Status");
        jdbc.update("UPDATE businesses SET status = 'hidden' WHERE id = ?", hiddenId);
        jdbc.update("UPDATE businesses SET status = NULL WHERE id = ?", nullId);
        String names = listBody(null).findValuesAsText("name").toString();
        assertThat(names).contains("Zo Visible").contains("Zo Null Status").doesNotContain("Zo Hidden");
    }

    @Test
    void hiddenBusinessDetailIsHiddenExceptFromOwnerAndAdmin() throws Exception {
        String id = added(token("M9501", "member"), "Zo Secret");
        jdbc.update("UPDATE businesses SET status = 'hidden' WHERE id = ?", id);
        fetch("/api/businesses/" + id, null).andExpect(status().isNotFound()).andExpect(jsonPath("$.error").value(NOT_FOUND));
        fetch("/api/businesses/" + id, token("M9502", "member")).andExpect(status().isNotFound());
        fetch("/api/businesses/" + id, token("M9501", "member")).andExpect(status().isOk());
        fetch("/api/businesses/" + id, token("M9509", "admin")).andExpect(status().isOk());
    }

    @Test
    void mineListsMyBusinessesIncludingHiddenNewestFirst() throws Exception {
        String first = added(token("M9501", "member"), "Zo First");
        String second = added(token("M9501", "member"), "Zo Second");
        jdbc.update("UPDATE businesses SET status = 'hidden', created_at = '2026-01-01 10:00:00' WHERE id = ?", first);
        jdbc.update("UPDATE businesses SET created_at = '2026-02-01 10:00:00' WHERE id = ?", second);
        fetch("/api/businesses/mine", token("M9501", "member"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.count").value(2))
            .andExpect(jsonPath("$.businesses[0].id").value(second))
            .andExpect(jsonPath("$.businesses[1].id").value(first))
            .andExpect(jsonPath("$.businesses[1].status").value("hidden"))
            .andExpect(jsonPath("$.businesses[0].isMine").value(true));
        fetch("/api/businesses/mine", token("M9502", "member")).andExpect(jsonPath("$.count").value(0));
        fetch("/api/businesses/mine", null).andExpect(status().isUnauthorized());
    }
}
