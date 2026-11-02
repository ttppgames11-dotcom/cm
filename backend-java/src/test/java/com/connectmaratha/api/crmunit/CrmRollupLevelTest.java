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

/** /rollup: one table per level with a row per unit and the totals of the level, inside the viewer's own area. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmRollupLevelTest extends CrmRollupTestBase {

    private List<String> levels(JsonNode r) {
        List<String> out = new ArrayList<>();
        for (JsonNode l : r.get("levels")) out.add(l.get("level").asText());
        return out;
    }

    private JsonNode level(JsonNode r, String code) {
        for (JsonNode l : r.get("levels")) if (l.get("level").asText().equals(code)) return l;
        throw new AssertionError("no level " + code);
    }

    private List<String> unitIds(JsonNode level) {
        List<String> out = new ArrayList<>();
        for (JsonNode u : level.get("units")) out.add(u.at("/unit/id").asText());
        return out;
    }

    @Test
    void oneTablePerLevelWithTotals() throws Exception {
        rollupTree();
        JsonNode r = rollup(admin(), "?year=2020");
        assertThat(r.get("year").asInt()).isEqualTo(2020);
        assertThat(levels(r)).containsExactly("state", "branch", "district", "taluka");
        JsonNode district = level(r, "district");
        assertThat(district.get("levelLabel").asText()).isEqualTo("जिल्हा");
        assertThat(district.get("unitsCount").asInt()).isEqualTo(2);
        assertThat(unitIds(district)).containsExactlyInAnyOrder("UNIT-ZQ-D1", "UNIT-ZQ-D2");
        JsonNode totals = district.get("totals");
        assertThat(totals.get("unitsCount").asInt()).isEqualTo(2);
        assertThat(totals.get("total").asInt()).isEqualTo(4);
        assertThat(totals.get("done").asInt()).isEqualTo(2);
        assertThat(totals.get("overdue").asInt()).isEqualTo(2);
        assertThat(totals.get("targetTotal").asInt()).isEqualTo(800);
        assertThat(totals.get("achievedTotal").asInt()).isEqualTo(70);
        assertThat(totals.get("completionPct").asInt()).isEqualTo(50);
        assertThat(totals.get("avgCoveragePct").asInt()).isEqualTo(8);
        for (JsonNode row : district.get("units")) {
            if (row.at("/unit/id").asText().equals("UNIT-ZQ-D1")) {
                assertThat(row.at("/own/total").asInt()).isEqualTo(3);
                assertThat(row.at("/rollup/total").asInt()).isEqualTo(5);
            }
        }
        JsonNode state = level(r, "state").get("units").get(0);
        assertThat(state.at("/unit/id").asText()).isEqualTo("UNIT-ZQ-S");
        assertThat(state.at("/own/total").asInt()).isZero();
        assertThat(state.at("/rollup/total").asInt()).isEqualTo(6);
        assertThat(state.at("/rollup/done").asInt()).isEqualTo(4);
        assertThat(state.at("/rollup/achievedTotal").asInt()).isEqualTo(85);
        assertThat(state.at("/rollup/unitsCount").asInt()).isEqualTo(6);
    }

    @Test
    void levelFilter() throws Exception {
        rollupTree();
        assertThat(levels(rollup(admin(), "?year=2020&level=district"))).containsExactly("district");
        assertThat(levels(rollup(admin(), "?year=2020&level=all"))).hasSize(4);
        assertThat(levels(rollup(admin(), "?year=2020&level="))).hasSize(4);
        assertThat(levels(rollup(admin(), "?year=2020&level=division"))).isEmpty();
        send(get(API + "/rollup?year=2020&level=village"), admin(), null).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_ACTIVITY"));
    }

    @Test
    void ownersSeeOnlyTheirOwnArea() throws Exception {
        rollupTree();
        JsonNode b1 = rollup(m(1), "?year=2020");
        assertThat(levels(b1)).containsExactly("branch", "district", "taluka");
        assertThat(unitIds(level(b1, "branch"))).containsExactly("UNIT-ZQ-B1");
        assertThat(unitIds(level(b1, "district"))).containsExactly("UNIT-ZQ-D1");
        assertThat(unitIds(level(b1, "taluka"))).containsExactly("UNIT-ZQ-T1");
        JsonNode d1 = level(b1, "district").get("units").get(0);
        JsonNode adminD1 = null;
        for (JsonNode row : level(rollup(admin(), "?year=2020"), "district").get("units")) {
            if (row.at("/unit/id").asText().equals("UNIT-ZQ-D1")) adminD1 = row;
        }
        assertThat(d1.toString()).isEqualTo(adminD1.toString());
        assertThat(rollup(m(1), "?year=2020").toString()).doesNotContain("UNIT-ZQ-B2").doesNotContain("UNIT-ZQ-D2").doesNotContain("UNIT-ZQ-S\"");

        JsonNode d1Owner = rollup(m(2), "?year=2020");
        assertThat(levels(d1Owner)).containsExactly("district", "taluka");

        // staff: only their own unit, and the roll-up equals the own numbers
        JsonNode staff = rollup(m(4), "?year=2020");
        assertThat(levels(staff)).containsExactly("district");
        assertThat(unitIds(level(staff, "district"))).containsExactly("UNIT-ZQ-D1");
        JsonNode row = level(staff, "district").get("units").get(0);
        assertThat(row.at("/rollup/total").asInt()).isEqualTo(3);
        assertThat(row.at("/rollup/unitsCount").asInt()).isEqualTo(1);
    }

    @Test
    void ceoSeesEverythingAndStrangersNothing() throws Exception {
        rollupTree();
        assertThat(rollup(ceo(), "?year=2020").toString()).isEqualTo(rollup(admin(), "?year=2020").toString());
        assertThat(rollup(m(6), "?year=2020").get("levels")).isEmpty();
        assertThat(rollup(null, "?year=2020").get("levels")).isEmpty();
    }

    @Test
    void archivedUnitsAreNotListed() throws Exception {
        rollupTree();
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-B1'");
        JsonNode r = rollup(admin(), "?year=2020");
        String text = r.toString();
        assertThat(text).doesNotContain("UNIT-ZQ-B1\"").doesNotContain("UNIT-ZQ-D1\"").doesNotContain("UNIT-ZQ-T1\"");
        JsonNode state = level(r, "state").get("units").get(0);
        assertThat(state.at("/rollup/unitsCount").asInt()).isEqualTo(3);
        assertThat(state.at("/rollup/total").asInt()).isEqualTo(1);
        assertThat(levels(r)).containsExactly("state", "branch", "district");
        // the archived branch's owner has no access at all
        assertThat(rollup(m(1), "?year=2020").get("levels")).isEmpty();
    }

    @Test
    void emptyYearAndBadYear() throws Exception {
        rollupTree();
        JsonNode r = rollup(admin(), "?year=2091");
        assertThat(r.get("levels")).hasSize(4);
        JsonNode totals = level(r, "district").get("totals");
        assertThat(totals.get("total").asInt()).isZero();
        assertThat(totals.get("completionPct").asInt()).isZero();
        assertThat(totals.get("avgCoveragePct").asInt()).isZero();
        send(get(API + "/rollup?year=1999"), admin(), null).andExpect(status().isBadRequest());
        send(get(API + "/rollup?year=abc"), admin(), null).andExpect(status().isBadRequest());
    }
}
