package com.connectmaratha.api.crmunit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * The tree and the activities the roll-up tests share (all dates in 2020, so every status is known):
 * S → B1 (owner M9301) → D1 (owner M9302, staff M9304) → T1; S → B2 (owner M9303) → D2.
 * D1: blood_donation done 40 / target 100, job_fair in progress / 300, health_checkup planned / 200.
 * T1: blood_donation done 10 / 50, spiritual done 5 / 20. D2: food_expo done 30 / 200.
 */
abstract class CrmRollupTestBase extends CrmUnitTestBase {

    void rollupTree() {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-D1", "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        unit("UNIT-ZQ-T1", "taluka", "UNIT-ZQ-D1", "Zq Haveli", null);
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        unit("UNIT-ZQ-D2", "district", "UNIT-ZQ-B2", "Zq Nashik", null);
        jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES ('M9304', 'UNIT-ZQ-D1', 'staff') ON CONFLICT DO NOTHING");
        activity("UNIT-ZQ-D1", "blood_donation", "2020-03-15", 100, "done", 40);
        activity("UNIT-ZQ-D1", "job_fair", "2020-04-15", 300, "in_progress", 0);
        activity("UNIT-ZQ-D1", "health_checkup", "2020-05-15", 200, "planned", 0);
        activity("UNIT-ZQ-T1", "blood_donation", "2020-03-20", 50, "done", 10);
        activity("UNIT-ZQ-T1", "spiritual", "2020-09-15", 20, "done", 5);
        activity("UNIT-ZQ-D2", "food_expo", "2020-12-15", 200, "done", 30);
    }

    JsonNode summary(String token, String unitId, String query) throws Exception {
        return body(send(get(API + "/units/" + unitId + "/summary" + query), token, null).andExpect(status().isOk()));
    }

    JsonNode rollup(String token, String query) throws Exception {
        return body(send(get(API + "/rollup" + query), token, null).andExpect(status().isOk()));
    }
}
