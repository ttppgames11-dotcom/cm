package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/** /units/{id}/summary: a unit's own numbers, the roll-up of everything below it and the numbers of its children. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmRollupSummaryTest extends CrmRollupTestBase {

    private List<String> childIds(JsonNode summary) {
        List<String> out = new ArrayList<>();
        for (JsonNode c : summary.get("children")) out.add(c.at("/unit/id").asText());
        return out;
    }

    @Test
    void ownNumbersOfOneUnit() throws Exception {
        rollupTree();
        JsonNode r = summary(m(2), "UNIT-ZQ-D1", "?year=2020");
        assertThat(r.get("year").asInt()).isEqualTo(2020);
        assertThat(r.at("/unit/id").asText()).isEqualTo("UNIT-ZQ-D1");
        assertThat(r.at("/unit/level").asText()).isEqualTo("district");
        JsonNode own = r.get("own");
        assertThat(own.get("total").asInt()).isEqualTo(3);
        assertThat(own.get("done").asInt()).isEqualTo(1);
        assertThat(own.get("overdue").asInt()).isEqualTo(2);
        assertThat(own.get("planned").asInt()).isZero();
        assertThat(own.get("in_progress").asInt()).isZero();
        assertThat(own.get("targetTotal").asInt()).isEqualTo(600);
        assertThat(own.get("achievedTotal").asInt()).isEqualTo(40);
        assertThat(own.get("typesDone").asInt()).isEqualTo(1);
        assertThat(own.get("typesPlanned").asInt()).isEqualTo(3);
        assertThat(own.get("typesRequired").asInt()).isEqualTo(12);
        assertThat(own.get("coveragePct").asInt()).isEqualTo(8);
        assertThat(own.get("completionPct").asInt()).isEqualTo(33);
        JsonNode byType = own.get("byType");
        assertThat(byType).hasSize(12);
        assertThat(byType.at("/blood_donation/total").asInt()).isEqualTo(1);
        assertThat(byType.at("/blood_donation/done").asInt()).isEqualTo(1);
        assertThat(byType.at("/blood_donation/overdue").asInt()).isZero();
        assertThat(byType.at("/blood_donation/target").asInt()).isEqualTo(100);
        assertThat(byType.at("/blood_donation/achieved").asInt()).isEqualTo(40);
        assertThat(byType.at("/job_fair/overdue").asInt()).isEqualTo(1);
        assertThat(byType.at("/food_expo/total").asInt()).isZero();
        assertThat(byType.at("/food_expo/target").asInt()).isZero();
        assertThat(r.get("types")).hasSize(12);
    }

    @Test
    void rollupSumsTheUnitAndEverythingBelow() throws Exception {
        rollupTree();
        JsonNode b1 = summary(m(1), "UNIT-ZQ-B1", "?year=2020");
        assertThat(b1.at("/own/total").asInt()).isZero();
        JsonNode roll = b1.get("rollup");
        assertThat(roll.get("total").asInt()).isEqualTo(5);
        assertThat(roll.get("done").asInt()).isEqualTo(3);
        assertThat(roll.get("overdue").asInt()).isEqualTo(2);
        assertThat(roll.get("targetTotal").asInt()).isEqualTo(670);
        assertThat(roll.get("achievedTotal").asInt()).isEqualTo(55);
        assertThat(roll.get("unitsCount").asInt()).isEqualTo(3);
        assertThat(roll.get("avgCoveragePct").asInt()).isEqualTo(8);
        assertThat(roll.get("unitsFullyCovered").asInt()).isZero();
        assertThat(roll.get("completionPct").asInt()).isEqualTo(60);
        assertThat(childIds(b1)).containsExactly("UNIT-ZQ-D1");
        JsonNode d1Row = b1.get("children").get(0);
        assertThat(d1Row.at("/own/total").asInt()).isEqualTo(3);
        assertThat(d1Row.at("/rollup/total").asInt()).isEqualTo(5);
        assertThat(d1Row.at("/rollup/done").asInt()).isEqualTo(3);

        JsonNode d1 = summary(m(2), "UNIT-ZQ-D1", "?year=2020");
        assertThat(childIds(d1)).containsExactly("UNIT-ZQ-T1");
        assertThat(d1.at("/rollup/unitsCount").asInt()).isEqualTo(2);
        assertThat(d1.at("/rollup/total").asInt()).isEqualTo(5);
        JsonNode t1 = summary(m(2), "UNIT-ZQ-T1", "?year=2020");
        assertThat(t1.at("/own/done").asInt()).isEqualTo(2);
        assertThat(t1.at("/own/coveragePct").asInt()).isEqualTo(17);
        assertThat(t1.at("/own/completionPct").asInt()).isEqualTo(100);
        assertThat(t1.get("children")).isEmpty();
    }

    @Test
    void coverageCountsOnlyDoneTypes() throws Exception {
        rollupTree();
        jdbc.update("DELETE FROM crm_activities WHERE unit_id = 'UNIT-ZQ-D1'");
        String[] types = {"health_checkup", "blood_donation", "job_fair", "business_expo", "job_business_consultancy", "matrimony",
            "education_consultancy", "childrens_games", "spiritual", "mahila_bachat_gat", "krushi_sabha", "food_expo"};
        for (int i = 0; i < 12; i++) activity("UNIT-ZQ-D1", types[i], String.format("2090-%02d-15", i + 1), 10, "planned", 0);
        JsonNode own = summary(m(2), "UNIT-ZQ-D1", "?year=2090").get("own");
        assertThat(own.get("typesPlanned").asInt()).isEqualTo(12);
        assertThat(own.get("typesDone").asInt()).isZero();
        assertThat(own.get("coveragePct").asInt()).isZero();
        assertThat(own.get("planned").asInt()).isEqualTo(12);
    }

    @Test
    void emptyYearIsZeros() throws Exception {
        rollupTree();
        JsonNode r = summary(m(1), "UNIT-ZQ-B1", "?year=2091");
        for (String part : new String[] {"own", "rollup"}) {
            assertThat(r.at("/" + part + "/total").asInt()).isZero();
            assertThat(r.at("/" + part + "/completionPct").asInt()).isZero();
            assertThat(r.at("/" + part + "/coveragePct").asInt() + r.at("/" + part + "/targetTotal").asInt()).isZero();
        }
        assertThat(r.at("/own/byType")).hasSize(12);
        assertThat(r.at("/rollup/unitsCount").asInt()).isEqualTo(3);
    }

    @Test
    void whoSeesWhat() throws Exception {
        rollupTree();
        // staff see their own unit only: no children, the roll-up equals their own numbers
        JsonNode staff = summary(m(4), "UNIT-ZQ-D1", "?year=2020");
        assertThat(staff.get("children")).isEmpty();
        assertThat(staff.at("/rollup/total").asInt()).isEqualTo(3);
        assertThat(staff.at("/rollup/unitsCount").asInt()).isEqualTo(1);
        for (String other : new String[] {"UNIT-ZQ-T1", "UNIT-ZQ-B1", "UNIT-ZQ-S"}) {
            send(get(API + "/units/" + other + "/summary?year=2020"), m(4), null).andExpect(status().isNotFound());
        }
        // a sibling's owner never sees this branch
        send(get(API + "/units/UNIT-ZQ-B1/summary"), m(3), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-D1/summary"), m(3), null).andExpect(status().isNotFound());
        // admin and CEO see the whole state
        for (String token : new String[] {admin(), ceo()}) {
            JsonNode s = summary(token, "UNIT-ZQ-S", "?year=2020");
            assertThat(childIds(s)).containsExactlyInAnyOrder("UNIT-ZQ-B1", "UNIT-ZQ-B2");
            assertThat(s.at("/rollup/total").asInt()).isEqualTo(6);
            assertThat(s.at("/rollup/unitsCount").asInt()).isEqualTo(6);
        }
        // strangers and visitors
        send(get(API + "/units/UNIT-ZQ-D1/summary"), m(6), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-D1/summary"), null, null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-NOPE/summary"), admin(), null).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("UNIT_NOT_FOUND"));
    }

    @Test
    void archivedUnitsAreLeftOut() throws Exception {
        rollupTree();
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-D1'");
        JsonNode b1 = summary(admin(), "UNIT-ZQ-B1", "?year=2020");
        assertThat(b1.at("/rollup/total").asInt()).isZero();
        assertThat(b1.at("/rollup/unitsCount").asInt()).isEqualTo(1);
        assertThat(b1.get("children")).isEmpty();
        // asked for directly, the archived unit answers with its own numbers and a roll-up of itself only
        JsonNode d1 = summary(admin(), "UNIT-ZQ-D1", "?year=2020");
        assertThat(d1.at("/own/total").asInt()).isEqualTo(3);
        assertThat(d1.at("/rollup/total").asInt()).isEqualTo(3);
        assertThat(d1.at("/rollup/unitsCount").asInt()).isEqualTo(1);
        assertThat(d1.get("children")).isEmpty();
        assertThat(d1.at("/unit/status").asText()).isEqualTo("archived");
    }

    @Test
    void badYear() throws Exception {
        rollupTree();
        for (String year : new String[] {"1999", "abc", "2101"}) {
            send(get(API + "/units/UNIT-ZQ-D1/summary?year=" + year), m(2), null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ACTIVITY"));
        }
        int thisYear = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata")).getYear();
        assertThat(summary(m(2), "UNIT-ZQ-D1", "").get("year").asInt()).isEqualTo(thisYear);
    }

    @Test
    void noDataLeaks() throws Exception {
        rollupTree();
        jdbc.update("UPDATE crm_activities SET notes = 'Zq secret note' WHERE unit_id = 'UNIT-ZQ-D1'");
        String text = summary(admin(), "UNIT-ZQ-S", "?year=2020").toString();
        assertThat(text).doesNotContain("phone").doesNotContain("secret note").doesNotContain(phoneOf("M9302"));
    }
}
