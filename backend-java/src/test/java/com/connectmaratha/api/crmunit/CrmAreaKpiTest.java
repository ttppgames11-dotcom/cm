package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.common.schema.LazyTables;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * /units/{id}/area-kpis: counts of members (by id) and businesses, jobs, events and tickets (by the typed district
 * name) in the places of a unit and of the active units below it.
 *
 * Tree: S → B → V (owner M9301) → UD1 (district ZQD1, owner M9302, staff M9306) → UT1 (taluka ZQT1, owner M9303);
 * V → UD2 (district ZQD2, owner M9304) → UT3 (taluka ZQT3, owner M9305).
 */
@SpringBootTest
@AutoConfigureMockMvc
class CrmAreaKpiTest extends CrmUnitTestBase {

    @Autowired LazyTables tables;

    @BeforeEach
    void data() {
        tables.ensureJobColumns();
        tables.ensureWebsiteTables();
        jdbc.update("DELETE FROM businesses WHERE id LIKE 'ZQ%'");
        jdbc.update("DELETE FROM jobs WHERE id LIKE 'ZQ%'");
        jdbc.update("DELETE FROM events WHERE id LIKE 'ZQ%'");
        jdbc.update("DELETE FROM support_tickets WHERE id LIKE 'ZQ%'");
        for (int i = 11; i <= 15; i++) member("M93" + i, "member");
        jdbc.update("UPDATE members SET district_id = NULL, taluka_id = NULL WHERE id LIKE 'M93%'");
    }

    private void tree() {
        places();
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B", "branch", "UNIT-ZQ-S", "Zq Branch", null);
        unit("UNIT-ZQ-V", "division", "UNIT-ZQ-B", "Zq Division", "M9301");
        unit("UNIT-ZQ-UD1", "district", "UNIT-ZQ-V", "Zq District One", "M9302");
        unit("UNIT-ZQ-UT1", "taluka", "UNIT-ZQ-UD1", "Zq Taluka One", "M9303");
        unit("UNIT-ZQ-UD2", "district", "UNIT-ZQ-V", "Zq District Two", "M9304");
        unit("UNIT-ZQ-UT3", "taluka", "UNIT-ZQ-UD2", "Zq Taluka Three", "M9305");
        area("UNIT-ZQ-UD1", "ZQD1", null);
        area("UNIT-ZQ-UT1", "ZQD1", "ZQT1");
        area("UNIT-ZQ-UD2", "ZQD2", null);
        area("UNIT-ZQ-UT3", "ZQD2", "ZQT3");
        jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES ('M9306', 'UNIT-ZQ-UD1', 'staff') ON CONFLICT DO NOTHING");
    }

    private void area(String unitId, String districtId, String talukaId) {
        jdbc.update("UPDATE community_centers SET area_district_id = ?, area_taluka_id = ? WHERE id = ?", districtId, talukaId, unitId);
    }

    private void data5() {
        // members: ids only
        jdbc.update("UPDATE members SET district_id = 'ZQD1' WHERE id = 'M9311'");
        jdbc.update("UPDATE members SET district_id = 'ZQD1', taluka_id = 'ZQT1' WHERE id = 'M9312'");
        jdbc.update("UPDATE members SET district_id = 'ZQD2', taluka_id = 'ZQT3' WHERE id = 'M9313'");
        jdbc.update("UPDATE members SET district_id = 'ZQD2' WHERE id = 'M9314'");
        // businesses: typed districts
        String[][] biz = {{"ZQB1", "zqpune"}, {"ZQB2", "झक्यूपुणे"}, {"ZQB3", "  ZQPUNE "}, {"ZQB4", "Zqsatara"}, {"ZQB5", "Nowhere"}, {"ZQB6", "Zqpunex"}};
        for (String[] b : biz) jdbc.update("INSERT INTO businesses (id, name, district) VALUES (?, ?, ?)", b[0], "Zq Biz " + b[0], b[1]);
        // jobs: open, closed, hidden in Zqpune; one open in Zqsatara
        job("ZQJ1", "Zqpune", "open", false);
        job("ZQJ2", "Zqpune", "closed", false);
        job("ZQJ3", "Zqpune", "open", true);
        job("ZQJ4", "Zqsatara", "open", false);
        // events
        for (String[] e : new String[][] {{"ZQE1", "Zqpune"}, {"ZQE2", "झक्यूपुणे"}, {"ZQE3", "Zqsatara"}}) {
            jdbc.update("INSERT INTO events (id, title, district) VALUES (?, ?, ?)", e[0], "Zq Event " + e[0], e[1]);
        }
        // tickets: district and taluka typed
        ticket("ZQT-A", "Zqpune", null, "New");
        ticket("ZQT-B", "Zqpune", null, "Resolved");
        ticket("ZQT-C", "Zqsatara", "Zqkarad", "New");
        ticket("ZQT-D", "Zqsatara", "zqkarad", "New");
        ticket("ZQT-E", "Zqsatara", "other", "New");
    }

    private void job(String id, String district, String state, boolean hidden) {
        jdbc.update("INSERT INTO jobs (id, title, district, status, hidden) VALUES (?, ?, ?, ?, ?)", id, "Zq Job " + id, district, state, hidden);
    }

    private void ticket(String id, String district, String taluka, String state) {
        jdbc.update("INSERT INTO support_tickets (id, title, description, district, taluka, status) VALUES (?, ?, 'Zq test', ?, ?, ?)",
            id, "Zq Ticket " + id, district, taluka, state);
    }

    private JsonNode kpis(String token, String unitId) throws Exception {
        return body(send(get(API + "/units/" + unitId + "/area-kpis"), token, null).andExpect(status().isOk()));
    }

    private static int value(JsonNode answer, String kpi) {
        return answer.at("/kpis/" + kpi + "/value").asInt(-1);
    }

    @Test
    void districtUnitCounts() throws Exception {
        tree();
        data5();
        JsonNode r = kpis(m(2), "UNIT-ZQ-UD1");
        assertThat(value(r, "members")).isEqualTo(2);
        assertThat(value(r, "businesses")).isEqualTo(3);
        assertThat(value(r, "jobsOpen")).isEqualTo(1);
        assertThat(value(r, "eventsCount")).isEqualTo(2);
        assertThat(value(r, "ticketsTotal")).isEqualTo(2);
        assertThat(value(r, "ticketsOpen")).isEqualTo(1);
        assertThat(r.at("/kpis/members/byName").asBoolean()).isFalse();
        for (String k : new String[] {"businesses", "jobsOpen", "eventsCount", "ticketsTotal", "ticketsOpen"}) {
            assertThat(r.at("/kpis/" + k + "/byName").asBoolean()).as(k).isTrue();
        }
        assertThat(r.get("talukaOnly").asBoolean()).isFalse();
        assertThat(r.at("/places/districts")).hasSize(1);
        assertThat(r.at("/places/districts/0/id").asText()).isEqualTo("ZQD1");
        assertThat(r.at("/places/talukas")).isEmpty();   // the taluka of the child is already inside the district
        assertThat(r.get("unitsCounted").asInt()).isEqualTo(2);
        assertThat(r.at("/unit/id").asText()).isEqualTo("UNIT-ZQ-UD1");
    }

    @Test
    void divisionAddsItsDistricts() throws Exception {
        tree();
        data5();
        JsonNode r = kpis(m(1), "UNIT-ZQ-V");
        assertThat(value(r, "members")).isEqualTo(4);          // a member with both ids counts once
        assertThat(value(r, "businesses")).isEqualTo(4);
        assertThat(value(r, "jobsOpen")).isEqualTo(2);
        assertThat(value(r, "eventsCount")).isEqualTo(3);
        assertThat(value(r, "ticketsTotal")).isEqualTo(5);
        assertThat(value(r, "ticketsOpen")).isEqualTo(4);
        assertThat(r.at("/places/districts")).hasSize(2);
        assertThat(r.at("/places/talukas")).isEmpty();
        assertThat(r.get("unitsCounted").asInt()).isEqualTo(4);
        assertThat(r.get("talukaOnly").asBoolean()).isFalse();
    }

    @Test
    void talukaOnlyUnit() throws Exception {
        tree();
        data5();
        JsonNode r = kpis(m(5), "UNIT-ZQ-UT3");
        assertThat(r.get("talukaOnly").asBoolean()).isTrue();
        assertThat(r.at("/places/districts")).isEmpty();
        assertThat(r.at("/places/talukas/0/id").asText()).isEqualTo("ZQT3");
        assertThat(value(r, "members")).isEqualTo(1);           // M9313 by taluka id
        assertThat(value(r, "ticketsTotal")).isEqualTo(2);      // the two with taluka karad, either case
        assertThat(value(r, "ticketsOpen")).isEqualTo(2);
        for (String k : new String[] {"businesses", "jobsOpen", "eventsCount"}) {
            assertThat(r.at("/kpis/" + k + "/value").isNull()).as(k).isTrue();
        }
        JsonNode t1 = kpis(m(3), "UNIT-ZQ-UT1");
        assertThat(t1.get("talukaOnly").asBoolean()).isTrue();
        assertThat(value(t1, "members")).isEqualTo(1);          // M9312
        assertThat(value(t1, "ticketsTotal")).isZero();
    }

    @Test
    void nameMatchingHalvesAndCase() throws Exception {
        tree();
        data5();
        // the English half, the Marathi half and padded upper case all match ZQD1; "Zqpunex" and "Nowhere" match nothing
        assertThat(value(kpis(m(2), "UNIT-ZQ-UD1"), "businesses")).isEqualTo(3);
        assertThat(value(kpis(m(4), "UNIT-ZQ-UD2"), "businesses")).isEqualTo(1);
        assertThat(value(kpis(m(2), "UNIT-ZQ-UD1"), "eventsCount")).isEqualTo(2);   // "Zqpune" and the Marathi half
    }

    @Test
    void unitWithoutAPlaceIsZeros() throws Exception {
        tree();
        data5();
        unit("UNIT-ZQ-UDN", "district", "UNIT-ZQ-V", "Zq No Place", null);
        JsonNode r = kpis(admin(), "UNIT-ZQ-UDN");
        assertThat(r.at("/places/districts")).isEmpty();
        assertThat(r.at("/places/talukas")).isEmpty();
        for (String k : new String[] {"members", "businesses", "jobsOpen", "eventsCount", "ticketsTotal", "ticketsOpen"}) {
            assertThat(value(r, k)).as(k).isZero();
        }
        assertThat(r.get("unitsCounted").asInt()).isZero();
        assertThat(r.get("talukaOnly").asBoolean()).isFalse();
    }

    @Test
    void scopeRules() throws Exception {
        tree();
        data5();
        // the owner of a sibling district cannot read this one
        send(get(API + "/units/UNIT-ZQ-UD1/area-kpis"), m(4), null).andExpect(status().isNotFound());
        // staff of UD1 read UD1 but not the taluka below it or the division above
        kpis(m(6), "UNIT-ZQ-UD1");
        send(get(API + "/units/UNIT-ZQ-UT1/area-kpis"), m(6), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-V/area-kpis"), m(6), null).andExpect(status().isNotFound());
        // the owner of the division reads the district; admin and CEO read all
        kpis(m(1), "UNIT-ZQ-UD1");
        assertThat(value(kpis(admin(), "UNIT-ZQ-V"), "members")).isEqualTo(4);
        assertThat(value(kpis(ceo(), "UNIT-ZQ-V"), "members")).isEqualTo(4);
        // visitor, a member without a unit, an unknown unit
        send(get(API + "/units/UNIT-ZQ-UD1/area-kpis"), null, null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-UD1/area-kpis"), m(7), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-NOPE/area-kpis"), admin(), null).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("UNIT_NOT_FOUND"));
    }

    @Test
    void archivedSubtreesAreLeftOut() throws Exception {
        tree();
        data5();
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-UD2'");
        JsonNode v = kpis(m(1), "UNIT-ZQ-V");
        assertThat(value(v, "members")).isEqualTo(2);
        assertThat(value(v, "ticketsTotal")).isEqualTo(2);
        assertThat(v.at("/places/districts")).hasSize(1);
        // asked for directly, an archived unit still answers with its own place (its subtree is left out)
        JsonNode own = kpis(admin(), "UNIT-ZQ-UD2");
        assertThat(own.at("/places/districts/0/id").asText()).isEqualTo("ZQD2");
        assertThat(own.at("/places/talukas")).isEmpty();
        assertThat(value(own, "members")).isEqualTo(2);
        assertThat(own.get("unitsCounted").asInt()).isEqualTo(1);
    }

    @Test
    void noPersonalData() throws Exception {
        tree();
        data5();
        String text = kpis(admin(), "UNIT-ZQ-V").toString();
        assertThat(text).doesNotContain("Member M93").doesNotContain("Zq Biz").doesNotContain("Zq Ticket")
            .doesNotContain(phoneOf("M9311")).doesNotContain("phone");
    }
}
