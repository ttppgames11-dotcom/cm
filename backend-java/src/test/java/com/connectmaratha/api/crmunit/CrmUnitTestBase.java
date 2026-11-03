package com.connectmaratha.api.crmunit;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Members M9301–M9308, admin M9390 and ceo M9391; units are named Zq… and have ids starting UNIT-ZQ. */
abstract class CrmUnitTestBase extends PostgresTestBase {

    static final String ADMIN = "M9390";
    static final String CEO = "M9391";
    static final String API = "/api/crm-hierarchy";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() throws Exception {
        rateLimit.reset();
        // creates the columns before cleaning
        send(get(API + "/units"), null, null);
        // creates the activity table too (a 404 request still prepares it)
        send(get(API + "/units/UNIT-ZQ-NONE/activities"), null, null);
        jdbc.update("DELETE FROM crm_activities WHERE unit_id LIKE 'UNIT-ZQ%'");
        jdbc.update("DELETE FROM community_centers WHERE id LIKE 'UNIT-ZQ%' OR name LIKE 'Zq%' OR name LIKE 'zq%'");
        jdbc.update("DELETE FROM community_centers WHERE id = 'OLD-ZQ-1'");
        for (String table : new String[] {"talukas", "districts", "states", "countries"}) {
            jdbc.update("DELETE FROM " + table + " WHERE id LIKE 'ZQ%'");
        }
        jdbc.update("DELETE FROM crm_unit_members WHERE member_id LIKE 'M93%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M93%'");
        jdbc.update("DELETE FROM audit_logs WHERE user_id LIKE 'M93%'");
        for (int i = 1; i <= 8; i++) member("M930" + i, "member");
        member(ADMIN, "admin");
        member(CEO, "ceo");
    }


    /** Leaves the shared M93xx members as plain members again, so other test classes that use the same ids are not affected. */
    @AfterEach
    void restoreSharedMembers() {
        for (int i = 1; i <= 8; i++) {
            jdbc.update("UPDATE members SET role = 'member', phone = ? WHERE id = ?", phoneOf("M930" + i), "M930" + i);
        }
        jdbc.update("DELETE FROM crm_unit_members WHERE member_id LIKE 'M93%'");
    }
    void member(String id, String role) {
        jdbc.update("INSERT INTO members (id, name, phone, role) VALUES (?, ?, ?, ?) "
            + "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, role = EXCLUDED.role",
            id, "Member " + id, phoneOf(id), role);
    }

    /** M9303 → 9876509303. */
    static String phoneOf(String memberId) {
        return "987650" + memberId.substring(1);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    /** Token of M930n as a plain member. */
    String m(int n) {
        return token("M930" + n, "member");
    }

    String admin() {
        return token(ADMIN, "admin");
    }

    String ceo() {
        return token(CEO, "ceo");
    }

    ResultActions send(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) req.header("Authorization", token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
        return mvc.perform(req);
    }

    JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString(UTF_8));
    }

    /** Inserts a unit straight into the table (path built from the parent's) and, with an owner, links that member. */
    void unit(String id, String level, String parentId, String name, String ownerId) {
        String parentPath = parentId == null ? "/" : jdbc.queryForObject("SELECT path FROM community_centers WHERE id = ?", String.class, parentId);
        jdbc.update("INSERT INTO community_centers (id, name, level, parent_id, path, owner_id, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
            id, name, level, parentId, parentPath + id + "/", ownerId);
        if (ownerId != null) jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES (?, ?, 'owner') ON CONFLICT (member_id) DO UPDATE SET unit_id = EXCLUDED.unit_id, unit_role = 'owner'", ownerId, id);
    }

    /** The ids of the units in a list answer. */
    List<String> ids(JsonNode answer) {
        List<String> out = new ArrayList<>();
        for (JsonNode u : answer.get("units")) out.add(u.get("id").asText());
        return out;
    }



    /** The test places: districts ZQD1 and ZQD2 and talukas ZQT1 and ZQT2 (in ZQD1) and ZQT3 (in ZQD2); names are bilingual. */
    void places() {
        jdbc.update("INSERT INTO countries (id, name, code) VALUES ('ZQC', 'Zqland', 'ZQC') ON CONFLICT (id) DO NOTHING");
        jdbc.update("INSERT INTO states (id, country_id, name, code) VALUES ('ZQS', 'ZQC', 'Zqstate', 'ZQS') ON CONFLICT (id) DO NOTHING");
        jdbc.update("INSERT INTO districts (id, state_id, name, code) VALUES ('ZQD1', 'ZQS', 'Zqpune / झक्यूपुणे', 'ZQD1'), "
            + "('ZQD2', 'ZQS', 'Zqsatara / झक्यूसातारा', 'ZQD2') ON CONFLICT (id) DO NOTHING");
        jdbc.update("INSERT INTO talukas (id, district_id, name, code) VALUES ('ZQT1', 'ZQD1', 'Zqhaveli / झक्यूहवेली', 'ZQT1'), "
            + "('ZQT2', 'ZQD1', 'Zqmulshi / झक्यूमुळशी', 'ZQT2'), ('ZQT3', 'ZQD2', 'Zqkarad / झक्यूकराड', 'ZQT3') ON CONFLICT (id) DO NOTHING");
    }
    private int activitySerial;

    /** Inserts an activity straight into the table; the year is the year of the date. */
    String activity(String unitId, String type, String date, int target, String status, int attendees) {
        String id = "ACT-ZQ" + (++activitySerial);
        jdbc.update("INSERT INTO crm_activities (id, unit_id, year, type, title, scheduled_date, target_count, attendee_count, status) "
            + "VALUES (?, ?, ?, ?, ?, CAST(? AS DATE), ?, ?, ?)",
            id, unitId, Integer.parseInt(date.substring(0, 4)), type, "Zq " + type, date, target, attendees, status);
        return id;
    }
    static Map<String, Object> map(Object... pairs) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], pairs[i + 1]);
        return m;
    }
}
