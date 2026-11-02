package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/** Staff of a unit: what they see, the /me flags and the team list (who sees phones). */
@SpringBootTest
@AutoConfigureMockMvc
class CrmStaffReadTest extends CrmUnitTestBase {

    /** Inserts a staff row for the member. */
    void staff(String memberId, String unitId) {
        jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES (?, ?, 'staff') "
            + "ON CONFLICT (member_id) DO UPDATE SET unit_id = EXCLUDED.unit_id, unit_role = 'staff'", memberId, unitId);
    }

    /** S → B1 (owner M9301) → D1 (owner M9302, staff M9304, M9305) → T1; S → B2 (owner M9303) → D2. */
    private void tree() {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-D1", "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        unit("UNIT-ZQ-T1", "taluka", "UNIT-ZQ-D1", "Zq Haveli", null);
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        unit("UNIT-ZQ-D2", "district", "UNIT-ZQ-B2", "Zq Nashik", null);
        staff("M9304", "UNIT-ZQ-D1");
        staff("M9305", "UNIT-ZQ-D1");
    }

    @Test
    void staffSeeOnlyTheirOwnUnit() throws Exception {
        tree();
        JsonNode me = body(send(get(API + "/me"), m(4), null).andExpect(status().isOk()));
        assertThat(me.get("scopeKind").asText()).isEqualTo("staff");
        assertThat(me.get("unitRole").asText()).isEqualTo("staff");
        assertThat(me.at("/unit/id").asText()).isEqualTo("UNIT-ZQ-D1");
        assertThat(me.at("/permissions/readOnly").asBoolean()).isTrue();
        assertThat(me.at("/permissions/canCreateUnits").asBoolean()).isFalse();
        assertThat(me.at("/permissions/canManageStaff").asBoolean()).isFalse();

        assertThat(ids(body(send(get(API + "/units"), m(4), null)))).containsExactly("UNIT-ZQ-D1");
        send(get(API + "/units/UNIT-ZQ-D1"), m(4), null).andExpect(status().isOk());
        for (String other : new String[] {"UNIT-ZQ-T1", "UNIT-ZQ-B1", "UNIT-ZQ-S", "UNIT-ZQ-D2"}) {
            send(get(API + "/units/" + other), m(4), null).andExpect(status().isNotFound());
        }
        // the filters never widen a staff member's view
        assertThat(ids(body(send(get(API + "/units?level=taluka"), m(4), null)))).isEmpty();
        assertThat(ids(body(send(get(API + "/units?parentId=UNIT-ZQ-D1"), m(4), null)))).isEmpty();
    }

    @Test
    void staffScopeIsEqualityNotPrefix() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", null);
        unit("UNIT-ZQ-D1", "district", "UNIT-ZQ-B1", "Zq Pune", null);
        unit("UNIT-ZQ-D10", "district", "UNIT-ZQ-B1", "Zq Pune Ten", null);
        staff("M9304", "UNIT-ZQ-D1");
        send(get(API + "/units/UNIT-ZQ-D10"), m(4), null).andExpect(status().isNotFound());
        assertThat(ids(body(send(get(API + "/units"), m(4), null)))).containsExactly("UNIT-ZQ-D1");
    }

    @Test
    void staffOfAnArchivedUnitHaveNoAccess() throws Exception {
        tree();
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-D1'");
        assertThat(body(send(get(API + "/me"), m(4), null)).get("scopeKind").asText()).isEqualTo("none");
        assertThat(ids(body(send(get(API + "/units"), m(4), null)))).isEmpty();
        send(get(API + "/units/UNIT-ZQ-D1"), m(4), null).andExpect(status().isNotFound());
    }

    @Test
    void removedStaffRowMeansNoAccess() throws Exception {
        tree();
        assertThat(body(send(get(API + "/me"), m(4), null)).get("scopeKind").asText()).isEqualTo("staff");
        jdbc.update("DELETE FROM crm_unit_members WHERE member_id = 'M9304'");
        assertThat(body(send(get(API + "/me"), m(4), null)).get("scopeKind").asText()).isEqualTo("none");
        assertThat(ids(body(send(get(API + "/units"), m(4), null)))).isEmpty();
    }

    @Test
    void meFlagsForOwnerAndAdmin() throws Exception {
        tree();
        assertThat(body(send(get(API + "/me"), m(2), null)).at("/permissions/canManageStaff").asBoolean()).isTrue();
        assertThat(body(send(get(API + "/me"), admin(), null)).at("/permissions/canManageStaff").asBoolean()).isTrue();
        assertThat(body(send(get(API + "/me"), ceo(), null)).at("/permissions/canManageStaff").asBoolean()).isFalse();
        // the owner of a unit above can see the team of D1 but the flag is about the own unit; it is true for any owner
        assertThat(body(send(get(API + "/me"), m(1), null)).at("/permissions/canManageStaff").asBoolean()).isTrue();
    }

    @Test
    void teamListShowsPhonesOnlyToManagers() throws Exception {
        tree();
        String url = API + "/units/UNIT-ZQ-D1/staff";
        for (String manager : new String[] {m(2), admin()}) {
            JsonNode team = body(send(get(url), manager, null).andExpect(status().isOk()));
            assertThat(team.get("canManage").asBoolean()).isTrue();
            assertThat(team.at("/staff/0/phone").asText()).isEqualTo(phoneOf("M9304"));
            assertThat(team.at("/staff/1/phone").asText()).isEqualTo(phoneOf("M9305"));
        }
        for (String viewer : new String[] {m(4), m(1), ceo()}) {
            JsonNode team = body(send(get(url), viewer, null).andExpect(status().isOk()));
            assertThat(team.get("canManage").asBoolean()).isFalse();
            assertThat(team.get("max").asInt()).isEqualTo(10);
            assertThat(team.get("staff")).hasSize(2);
            assertThat(team.at("/staff/0/id").asText()).isEqualTo("M9304");
            assertThat(team.at("/staff/1/id").asText()).isEqualTo("M9305");
            assertThat(team.at("/staff/0").has("phone")).isFalse();
            assertThat(team.at("/staff/0/name").asText()).isEqualTo("Member M9304");
            assertThat(team.at("/owner/id").asText()).isEqualTo("M9302");
        }
    }

    @Test
    void teamListOutsideScopeIsNotFound() throws Exception {
        tree();
        send(get(API + "/units/UNIT-ZQ-D2/staff"), m(4), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-D1/staff"), m(3), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-D1/staff"), null, null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-NOPE/staff"), admin(), null).andExpect(status().isNotFound());
    }
}
