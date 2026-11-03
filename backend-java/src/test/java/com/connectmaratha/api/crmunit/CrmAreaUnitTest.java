package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.ResultActions;

/** The place (district / taluka from the master list) of district and taluka units: create, edit, clear and the rules. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmAreaUnitTest extends CrmUnitTestBase {

    /** S → B → V (owner M9301), and a district unit UD (owner M9302) under V; places ZQD1, ZQD2, ZQT1, ZQT2, ZQT3 exist. */
    private void tree() {
        places();
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B", "branch", "UNIT-ZQ-S", "Zq Pune Branch", null);
        unit("UNIT-ZQ-V", "division", "UNIT-ZQ-B", "Zq Pune Division", "M9301");
        unit("UNIT-ZQ-UD", "district", "UNIT-ZQ-V", "Zq District Unit", "M9302");
    }

    private ResultActions create(String token, String level, String parent, String name, String owner, Map<String, Object> area) throws Exception {
        Map<String, Object> b = map("level", level, "name", name, "parent_id", parent, "owner", map("member", owner));
        b.putAll(area);
        return send(post(API + "/units"), token, b);
    }

    private int unitCount() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM community_centers WHERE name LIKE 'Zq%' AND level IS NOT NULL", Integer.class);
    }

    @Test
    void districtUnitGetsADistrictPlace() throws Exception {
        tree();
        JsonNode r = body(create(admin(), "district", "UNIT-ZQ-V", "Zq D1", "M9304", map("districtId", "ZQD1")).andExpect(status().isCreated()));
        assertThat(r.at("/unit/area/districtId").asText()).isEqualTo("ZQD1");
        assertThat(r.at("/unit/area/districtName").asText()).isEqualTo("Zqpune / झक्यूपुणे");
        assertThat(r.at("/unit/area/talukaId").isNull()).isTrue();
        assertThat(r.at("/unit/area/talukaName").isNull()).isTrue();
    }

    @Test
    void talukaUnitGetsATalukaPlace() throws Exception {
        tree();
        // only the taluka: the district is derived from it
        JsonNode a = body(create(m(2), "taluka", "UNIT-ZQ-UD", "Zq T1", "M9304", map("talukaId", "ZQT1")).andExpect(status().isCreated()));
        assertThat(a.at("/unit/area/talukaId").asText()).isEqualTo("ZQT1");
        assertThat(a.at("/unit/area/talukaName").asText()).isEqualTo("Zqhaveli / झक्यूहवेली");
        assertThat(a.at("/unit/area/districtId").asText()).isEqualTo("ZQD1");
        assertThat(a.at("/unit/area/districtName").asText()).isEqualTo("Zqpune / झक्यूपुणे");
        // both, matching
        JsonNode b = body(create(m(2), "taluka", "UNIT-ZQ-UD", "Zq T2", "M9305", map("districtId", "ZQD1", "talukaId", "ZQT2")).andExpect(status().isCreated()));
        assertThat(b.at("/unit/area/talukaId").asText()).isEqualTo("ZQT2");
        // a taluka unit may carry just a district
        JsonNode c = body(create(m(2), "taluka", "UNIT-ZQ-UD", "Zq T3", "M9306", map("districtId", "ZQD2")).andExpect(status().isCreated()));
        assertThat(c.at("/unit/area/districtId").asText()).isEqualTo("ZQD2");
        assertThat(c.at("/unit/area/talukaId").isNull()).isTrue();
    }

    @Test
    void placeRulesAreEnforced() throws Exception {
        tree();
        int before = unitCount();
        // other levels have no place
        create(admin(), "state", null, "Zq S2", "M9304", map("districtId", "ZQD1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_ALLOWED"));
        create(admin(), "branch", "UNIT-ZQ-S", "Zq B2", "M9304", map("districtId", "ZQD1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_ALLOWED"));
        create(admin(), "division", "UNIT-ZQ-B", "Zq V2", "M9304", map("talukaId", "ZQT1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_ALLOWED"));
        // unknown places
        create(admin(), "district", "UNIT-ZQ-V", "Zq D3", "M9304", map("districtId", "ZQNOPE")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_FOUND"));
        create(m(2), "taluka", "UNIT-ZQ-UD", "Zq T4", "M9304", map("talukaId", "ZQNOPE")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_FOUND"));
        // a taluka of another district, and a taluka on a district unit
        create(m(2), "taluka", "UNIT-ZQ-UD", "Zq T5", "M9304", map("districtId", "ZQD1", "talukaId", "ZQT3")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_MISMATCH"));
        create(admin(), "district", "UNIT-ZQ-V", "Zq D4", "M9304", map("districtId", "ZQD1", "talukaId", "ZQT1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_MISMATCH"));
        create(admin(), "district", "UNIT-ZQ-V", "Zq D5", "M9304", map("talukaId", "ZQT1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_MISMATCH"));
        // nothing was saved and the owner is still free
        assertThat(unitCount()).isEqualTo(before);
        create(admin(), "district", "UNIT-ZQ-V", "Zq D6", "M9304", map("districtId", "ZQD2")).andExpect(status().isCreated());
    }

    @Test
    void placeIsOptional() throws Exception {
        tree();
        JsonNode r = body(create(admin(), "district", "UNIT-ZQ-V", "Zq D7", "M9304", map()).andExpect(status().isCreated()));
        assertThat(r.at("/unit/area/districtId").isNull()).isTrue();
        assertThat(r.at("/unit/area/talukaId").isNull()).isTrue();
        JsonNode state = body(send(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(API + "/units/UNIT-ZQ-S"), admin(), null));
        assertThat(state.at("/unit/area/districtId").isNull()).isTrue();
    }

    @Test
    void editSetsChangesAndClearsThePlace() throws Exception {
        tree();
        String url = API + "/units/UNIT-ZQ-UD";
        // the parent's owner sets it
        JsonNode set = body(send(put(url), m(1), map("districtId", "ZQD2")).andExpect(status().isOk()));
        assertThat(set.at("/unit/area/districtId").asText()).isEqualTo("ZQD2");
        assertThat(audits("CRM_UNIT_UPDATE")).isEqualTo(1);
        // the unit's own owner changes it
        JsonNode changed = body(send(put(url), m(2), map("district_id", "ZQD1")).andExpect(status().isOk()));
        assertThat(changed.at("/unit/area/districtId").asText()).isEqualTo("ZQD1");
        assertThat(changed.at("/unit/area/districtName").asText()).isEqualTo("Zqpune / झक्यूपुणे");
        // the place can be sent together with a new name
        send(put(url), m(2), map("name", "Zq District Renamed", "districtId", "ZQD2")).andExpect(status().isOk());
        // an empty value clears it
        JsonNode cleared = body(send(put(url), m(2), map("districtId", "")).andExpect(status().isOk()));
        assertThat(cleared.at("/unit/area/districtId").isNull()).isTrue();
        assertThat(cleared.at("/unit/name").asText()).isEqualTo("Zq District Renamed");
        // who may not: the owner of a sibling branch cannot even see this unit
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Other Branch", "M9303");
        send(put(url), m(3), map("districtId", "ZQD1")).andExpect(status().isNotFound());
        send(put(url), ceo(), map("districtId", "ZQD1")).andExpect(status().isForbidden());
        send(put(url), m(6), map("districtId", "ZQD1")).andExpect(status().isForbidden());
        // an archived unit refuses
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-UD'");
        send(put(url), admin(), map("districtId", "ZQD1")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("UNIT_ARCHIVED"));
        assertThat(jdbc.queryForObject("SELECT area_district_id FROM community_centers WHERE id = 'UNIT-ZQ-UD'", String.class)).isNull();
    }


    @Test
    void theLevelRuleAppliesToEditsToo() throws Exception {
        tree();
        send(put(API + "/units/UNIT-ZQ-B"), admin(), map("districtId", "ZQD1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_ALLOWED"));
        send(put(API + "/units/UNIT-ZQ-UD"), m(2), map("districtId", "ZQD1", "talukaId", "ZQT1")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_MISMATCH"));
        send(put(API + "/units/UNIT-ZQ-UD"), m(2), map("districtId", "ZQNOPE")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_NOT_FOUND"));
        // a taluka unit: a taluka of another district is refused, the right one is saved
        unit("UNIT-ZQ-UT", "taluka", "UNIT-ZQ-UD", "Zq Taluka Unit", "M9307");
        send(put(API + "/units/UNIT-ZQ-UT"), m(2), map("districtId", "ZQD1", "talukaId", "ZQT3")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AREA_MISMATCH"));
        JsonNode ok = body(send(put(API + "/units/UNIT-ZQ-UT"), m(2), map("talukaId", "ZQT2")).andExpect(status().isOk()));
        assertThat(ok.at("/unit/area/districtId").asText()).isEqualTo("ZQD1");
        assertThat(ok.at("/unit/area/talukaId").asText()).isEqualTo("ZQT2");
    }

    private int audits(String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action = ? AND user_id LIKE 'M93%'", Integer.class, action);
    }
}
