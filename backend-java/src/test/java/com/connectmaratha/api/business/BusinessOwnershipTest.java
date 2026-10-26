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

    ResultActions edit(String token, String id, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = put("/api/businesses/" + id).contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    ResultActions visibility(String token, String id, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = put("/api/businesses/" + id + "/visibility").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    Map<String, Object> row(String id) {
        return jdbc.queryForMap("SELECT id, name, owner, cat, city, phone, services, owner_id, status, rating FROM businesses WHERE id = ?", id);
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

    // ------------------------------------------------------------------ editing

    @Test
    void ownerEditsOnlyTheFieldsSent() throws Exception {
        String id = added(token("M9501", "member"), "Zo Edit Me");
        Map<String, Object> before = row(id);
        edit(token("M9501", "member"), id, Map.of("phone", "9800000001", "services", List.of("A", "B")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("व्यवसाय अद्ययावत केला गेला! (Business updated.)"))
            .andExpect(jsonPath("$.business.phone").value("9800000001"));
        Map<String, Object> after = row(id);
        assertThat(after.get("phone")).isEqualTo("9800000001");
        assertThat(after.get("services")).isEqualTo("[\"A\",\"B\"]");
        for (String unchanged : List.of("name", "owner", "cat", "city", "owner_id", "status")) {
            assertThat(after.get(unchanged)).as(unchanged).isEqualTo(before.get(unchanged));
        }
    }

    @Test
    void adminCanEditToo() throws Exception {
        String id = added(token("M9501", "member"), "Zo Admin Edit");
        edit(token("M9509", "admin"), id, Map.of("city", "नाशिक")).andExpect(status().isOk());
        assertThat(row(id).get("city")).isEqualTo("नाशिक");
    }

    @Test
    void otherMemberCannotEdit() throws Exception {
        String id = added(token("M9501", "member"), "Zo Not Yours");
        edit(token("M9502", "member"), id, Map.of("phone", "9800000002")).andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("NOT_OWNER"));
        assertThat(row(id).get("phone")).isNotEqualTo("9800000002");
        edit(null, id, Map.of("phone", "9800000002")).andExpect(status().isUnauthorized());
        edit(token("M9501", "member"), "B0", Map.of("phone", "9800000002")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value(NOT_FOUND));
    }

    @Test
    void emptyRequiredFieldIsRejected() throws Exception {
        String id = added(token("M9501", "member"), "Zo Required");
        edit(token("M9501", "member"), id, Map.of("name", "")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value(NO_FIELDS));
        edit(token("M9501", "member"), id, Map.of("cat", "  ")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value(NO_FIELDS));
        Map<String, Object> after = row(id);
        assertThat(after.get("name")).isEqualTo("Zo Required");
        assertThat(after.get("cat")).isEqualTo("it");
    }

    @Test
    void protectedFieldsCannotBeChanged() throws Exception {
        String id = added(token("M9501", "member"), "Zo Protected");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("owner_id", "M9502");
        body.put("status", "hidden");
        body.put("rating", 1);
        body.put("id", "X9");
        body.put("name", "Zo Renamed");
        edit(token("M9501", "member"), id, body).andExpect(status().isOk());
        Map<String, Object> after = row(id);
        assertThat(after.get("owner_id")).isEqualTo("M9501");
        assertThat(after.get("status")).isEqualTo("visible");
        assertThat(((Number) after.get("rating")).doubleValue()).isEqualTo(5.0);
        assertThat(after.get("id")).isEqualTo(id);
        assertThat(after.get("name")).isEqualTo("Zo Renamed");
    }

    // ------------------------------------------------------------------ hide and show

    @Test
    void ownerHidesAndShowsAgain() throws Exception {
        String id = added(token("M9501", "member"), "Zo Hide Me");
        visibility(token("M9501", "member"), id, Map.of("hidden", true)).andExpect(status().isOk())
            .andExpect(jsonPath("$.business.status").value("hidden"));
        assertThat(row(id).get("status")).isEqualTo("hidden");
        assertThat(listBody(null).findValuesAsText("name").toString()).doesNotContain("Zo Hide Me");
        fetch("/api/businesses/" + id, null).andExpect(status().isNotFound());
        visibility(token("M9501", "member"), id, Map.of("hidden", false)).andExpect(status().isOk())
            .andExpect(jsonPath("$.business.status").value("visible"));
        assertThat(listBody(null).findValuesAsText("name").toString()).contains("Zo Hide Me");
    }

    @Test
    void visibilityNeedsABooleanAndTheRightPerson() throws Exception {
        String id = added(token("M9501", "member"), "Zo Visibility");
        visibility(token("M9501", "member"), id, Map.of("hidden", "yes")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        visibility(token("M9501", "member"), id, Map.of()).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        visibility(token("M9502", "member"), id, Map.of("hidden", true)).andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("NOT_OWNER"));
        visibility(token("M9509", "admin"), id, Map.of("hidden", true)).andExpect(status().isOk());
        assertThat(row(id).get("status")).isEqualTo("hidden");
    }

    // ------------------------------------------------------------------ admin assigns an owner

    ResultActions assign(String token, String id, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = put("/api/admin/businesses/" + id + "/owner").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    @Test
    void adminAssignsAnOwnerWhoCanThenEdit() throws Exception {
        String id = added(token("M9501", "member"), "Zo Handover");
        assign(token("M9502", "member"), id, Map.of("memberId", "M9502")).andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("ADMIN_ONLY"));
        assign(null, id, Map.of("memberId", "M9502")).andExpect(status().isUnauthorized());
        assign(token("M9509", "admin"), id, Map.of("memberId", "M0000")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
        assign(token("M9509", "admin"), "B0", Map.of("memberId", "M9502")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value(NOT_FOUND));
        assign(token("M9509", "admin"), id, Map.of()).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        assertThat(row(id).get("owner_id")).isEqualTo("M9501");

        assign(token("M9509", "admin"), id, Map.of("memberId", "M9502")).andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.business.owner_id").value("M9502"));
        assertThat(row(id).get("owner_id")).isEqualTo("M9502");
        edit(token("M9502", "member"), id, Map.of("phone", "9800000003")).andExpect(status().isOk());
        edit(token("M9501", "member"), id, Map.of("phone", "9800000004")).andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------ review fixes

    ResultActions review(String token, String id) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/businesses/" + id + "/reviews").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(Map.of("member_name", "Rao", "rating", "4", "text", "ok")));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    @Test
    void hiddenBusinessCannotBeReviewedByOutsiders() throws Exception {
        String id = added(token("M9501", "member"), "Zo Frozen");
        visibility(token("M9501", "member"), id, Map.of("hidden", true)).andExpect(status().isOk());
        review(null, id).andExpect(status().isNotFound()).andExpect(jsonPath("$.error").value(NOT_FOUND));
        review(token("M9502", "member"), id).andExpect(status().isNotFound());
        review(token("M9501", "member"), id).andExpect(status().isCreated());
        review(null, "B0").andExpect(status().isNotFound());
        visibility(token("M9501", "member"), id, Map.of("hidden", false)).andExpect(status().isOk());
        review(null, id).andExpect(status().isCreated());
    }

    @Test
    void addRejectsABlankNameOwnerOrCategory() throws Exception {
        for (String field : List.of("name", "owner", "cat")) {
            Map<String, Object> body = business("Zo Blank");
            body.put(field, "   ");
            add(token("M9501", "member"), body).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value(NO_FIELDS));
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM businesses WHERE name LIKE 'Zo Blank%'", Integer.class)).isZero();
    }
}
