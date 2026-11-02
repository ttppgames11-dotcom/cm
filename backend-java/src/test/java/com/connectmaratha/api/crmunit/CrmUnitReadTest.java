package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/** /api/crm-hierarchy: /me, the list and one unit, as seen by an admin, the CEO, owners, strangers and visitors. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmUnitReadTest extends CrmUnitTestBase {

    /** S → B1 (owner M9301) → D1 (owner M9302); S → B2 (owner M9303). */
    private void tree() {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-D1", "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
    }

    @Test
    void visitorGetsAnEmptyListAndMeNeedsLogin() throws Exception {
        tree();
        send(get(API + "/me"), null, null).andExpect(status().isUnauthorized());
        JsonNode list = body(send(get(API + "/units"), null, null).andExpect(status().isOk()));
        assertThat(ids(list)).isEmpty();
    }

    @Test
    void adminSeesEverythingAndCanWrite() throws Exception {
        tree();
        JsonNode me = body(send(get(API + "/me"), admin(), null).andExpect(status().isOk()));
        assertThat(me.get("scopeKind").asText()).isEqualTo("global");
        assertThat(me.at("/permissions/canCreateState").asBoolean()).isTrue();
        assertThat(me.at("/permissions/readOnly").asBoolean()).isFalse();
        JsonNode list = body(send(get(API + "/units"), admin(), null).andExpect(status().isOk()));
        assertThat(ids(list)).contains("UNIT-ZQ-S", "UNIT-ZQ-B1", "UNIT-ZQ-D1", "UNIT-ZQ-B2");
        assertThat(list.get("units").get(0).get("level").asText()).isEqualTo("state");
    }

    @Test
    void ceoSeesEverythingButIsReadOnly() throws Exception {
        tree();
        JsonNode me = body(send(get(API + "/me"), ceo(), null).andExpect(status().isOk()));
        assertThat(me.get("scopeKind").asText()).isEqualTo("global");
        assertThat(me.at("/permissions/readOnly").asBoolean()).isTrue();
        assertThat(me.at("/permissions/canCreateUnits").asBoolean()).isFalse();
        assertThat(me.at("/permissions/canCreateState").asBoolean()).isFalse();
        JsonNode one = body(send(get(API + "/units/UNIT-ZQ-B1"), ceo(), null).andExpect(status().isOk()));
        assertThat(one.at("/unit/owner/id").asText()).isEqualTo("M9301");
        assertThat(one.at("/unit/owner").has("phone")).isFalse();
    }

    @Test
    void ownerSeesOwnUnitAndBelowOnly() throws Exception {
        tree();
        JsonNode me = body(send(get(API + "/me"), m(1), null).andExpect(status().isOk()));
        assertThat(me.get("scopeKind").asText()).isEqualTo("unit");
        assertThat(me.get("unitRole").asText()).isEqualTo("owner");
        assertThat(me.at("/unit/id").asText()).isEqualTo("UNIT-ZQ-B1");
        assertThat(me.at("/permissions/canCreateUnits").asBoolean()).isTrue();
        assertThat(me.at("/permissions/canCreateState").asBoolean()).isFalse();

        JsonNode list = body(send(get(API + "/units"), m(1), null).andExpect(status().isOk()));
        assertThat(ids(list)).containsExactly("UNIT-ZQ-B1", "UNIT-ZQ-D1");

        send(get(API + "/units/UNIT-ZQ-B2"), m(1), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-S"), m(1), null).andExpect(status().isNotFound());
        JsonNode d1 = body(send(get(API + "/units/UNIT-ZQ-D1"), m(1), null).andExpect(status().isOk()));
        assertThat(d1.at("/unit/owner/phone").asText()).isEqualTo(phoneOf("M9302"));
        assertThat(d1.get("ancestors")).hasSize(2);
        assertThat(d1.at("/ancestors/0/id").asText()).isEqualTo("UNIT-ZQ-S");
        assertThat(d1.at("/ancestors/1/id").asText()).isEqualTo("UNIT-ZQ-B1");
    }

    @Test
    void missingUnitIsNotFound() throws Exception {
        send(get(API + "/units/UNIT-ZQ-NOPE"), admin(), null).andExpect(status().isNotFound());
    }

    @Test
    void prefixLookalikeIsNotInScope() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq One", "M9301");
        unit("UNIT-ZQ-B10", "branch", "UNIT-ZQ-S", "Zq Ten", "M9302");
        JsonNode list = body(send(get(API + "/units"), m(1), null).andExpect(status().isOk()));
        assertThat(ids(list)).containsExactly("UNIT-ZQ-B1");
        send(get(API + "/units/UNIT-ZQ-B10"), m(1), null).andExpect(status().isNotFound());
    }

    @Test
    void filtersNeverWidenTheScope() throws Exception {
        tree();
        assertThat(ids(body(send(get(API + "/units?parentId=UNIT-ZQ-S"), m(1), null)))).containsExactly("UNIT-ZQ-B1");
        assertThat(ids(body(send(get(API + "/units?parentId=UNIT-ZQ-B2"), m(1), null)))).isEmpty();
        assertThat(ids(body(send(get(API + "/units?level=state"), m(1), null)))).isEmpty();
        assertThat(ids(body(send(get(API + "/units?level=district"), m(1), null)))).containsExactly("UNIT-ZQ-D1");
        assertThat(ids(body(send(get(API + "/units?search=zq PUNE"), m(1), null)))).containsExactly("UNIT-ZQ-B1", "UNIT-ZQ-D1");
        assertThat(ids(body(send(get(API + "/units?search=nashik"), m(1), null)))).isEmpty();
        assertThat(ids(body(send(get(API + "/units?search=nashik"), admin(), null)))).containsExactly("UNIT-ZQ-B2");
    }

    @Test
    void staleTokenGetsNoAccess() throws Exception {
        tree();
        // the token says admin, the row says member without a unit
        JsonNode me = body(send(get(API + "/me"), token("M9304", "admin"), null).andExpect(status().isOk()));
        assertThat(me.get("scopeKind").asText()).isEqualTo("none");
        assertThat(ids(body(send(get(API + "/units"), token("M9304", "admin"), null)))).isEmpty();
        // the token says member, the row says admin
        jdbc.update("UPDATE members SET role = 'admin' WHERE id = 'M9305'");
        assertThat(body(send(get(API + "/me"), m(5), null)).get("scopeKind").asText()).isEqualTo("global");
    }

    @Test
    void ownerOfAnArchivedUnitHasNoAccess() throws Exception {
        tree();
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-B1'");
        assertThat(body(send(get(API + "/me"), m(1), null)).get("scopeKind").asText()).isEqualTo("none");
        assertThat(ids(body(send(get(API + "/units"), m(1), null)))).isEmpty();
        send(get(API + "/units/UNIT-ZQ-B1"), m(1), null).andExpect(status().isNotFound());
    }

    @Test
    void oldCentresAreIgnoredByTheLadder() throws Exception {
        tree();
        jdbc.update("INSERT INTO community_centers (id, name, status) VALUES ('OLD-ZQ-1', 'Zq Old Centre', 'active')");
        assertThat(ids(body(send(get(API + "/units"), admin(), null)))).doesNotContain("OLD-ZQ-1");
        JsonNode old = body(send(get("/api/crm/community-centers"), null, null).andExpect(status().isOk()));
        String all = old.toString();
        assertThat(all).contains("OLD-ZQ-1").doesNotContain("UNIT-ZQ-B1");
    }
}
