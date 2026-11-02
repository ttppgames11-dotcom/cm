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

/** The 12 activity types and the activity list of a unit: who may read, statuses worked out, progress numbers. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmActivityReadTest extends CrmUnitTestBase {

    private int serial;

    /** Inserts an activity straight into the table; the year is the year of the date. */
    String activity(String unitId, String type, String date, int target, String status, int attendees) {
        String id = "ACT-ZQ" + (++serial);
        jdbc.update("INSERT INTO crm_activities (id, unit_id, year, type, title, scheduled_date, target_count, attendee_count, status) "
            + "VALUES (?, ?, ?, ?, ?, CAST(? AS DATE), ?, ?, ?)",
            id, unitId, Integer.parseInt(date.substring(0, 4)), type, "Zq " + type, date, target, attendees, status);
        return id;
    }

    /** S → B1 (owner M9301) → D1 (owner M9302, staff M9304) → T1; S → B2 (owner M9303) → D2. */
    private void tree() {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-D1", "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        unit("UNIT-ZQ-T1", "taluka", "UNIT-ZQ-D1", "Zq Haveli", null);
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        unit("UNIT-ZQ-D2", "district", "UNIT-ZQ-B2", "Zq Nashik", null);
        jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES ('M9304', 'UNIT-ZQ-D1', 'staff') ON CONFLICT DO NOTHING");
    }

    private JsonNode list(String token, String unitId, String query) throws Exception {
        return body(send(get(API + "/units/" + unitId + "/activities" + query), token, null).andExpect(status().isOk()));
    }

    @Test
    void typesListHasTwelveInOrder() throws Exception {
        JsonNode r = body(send(get(API + "/activity-types"), null, null).andExpect(status().isOk()));
        JsonNode types = r.get("types");
        assertThat(types).hasSize(12);
        assertThat(types.get(0).get("key").asText()).isEqualTo("health_checkup");
        assertThat(types.get(0).get("mr").asText()).isEqualTo("आरोग्य तपासणी");
        assertThat(types.get(0).get("defaultTarget").asInt()).isEqualTo(200);
        assertThat(types.get(11).get("key").asText()).isEqualTo("food_expo");
        assertThat(types.get(11).get("defaultTarget").asInt()).isEqualTo(200);
        List<String> keys = new ArrayList<>();
        for (JsonNode t : types) {
            keys.add(t.get("key").asText());
            if (t.get("key").asText().equals("blood_donation")) assertThat(t.get("defaultTarget").asInt()).isEqualTo(100);
            if (t.get("key").asText().equals("mahila_bachat_gat")) assertThat(t.get("defaultTarget").asInt()).isEqualTo(60);
        }
        assertThat(keys).doesNotHaveDuplicates();
    }

    @Test
    void everyoneWhoSeesTheUnitCanReadItsActivities() throws Exception {
        tree();
        activity("UNIT-ZQ-D1", "blood_donation", "2090-03-15", 100, "planned", 0);
        for (String viewer : new String[] {m(2), m(4), m(1), ceo(), admin()}) {
            JsonNode r = list(viewer, "UNIT-ZQ-D1", "?year=2090");
            assertThat(r.get("activities")).hasSize(1);
        }
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2090").get("canWrite").asBoolean()).isTrue();
        assertThat(list(m(4), "UNIT-ZQ-D1", "?year=2090").get("canWrite").asBoolean()).isTrue();
        assertThat(list(admin(), "UNIT-ZQ-D1", "?year=2090").get("canWrite").asBoolean()).isTrue();
        assertThat(list(m(1), "UNIT-ZQ-D1", "?year=2090").get("canWrite").asBoolean()).isFalse();
        assertThat(list(ceo(), "UNIT-ZQ-D1", "?year=2090").get("canWrite").asBoolean()).isFalse();
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2090").get("canDelete").asBoolean()).isTrue();
        assertThat(list(admin(), "UNIT-ZQ-D1", "?year=2090").get("canDelete").asBoolean()).isTrue();
        assertThat(list(m(4), "UNIT-ZQ-D1", "?year=2090").get("canDelete").asBoolean()).isFalse();
        assertThat(list(m(1), "UNIT-ZQ-D1", "?year=2090").get("canDelete").asBoolean()).isFalse();
        assertThat(list(ceo(), "UNIT-ZQ-D1", "?year=2090").get("canDelete").asBoolean()).isFalse();
    }

    @Test
    void outsidersGetNotFound() throws Exception {
        tree();
        for (String token : new String[] {m(3), m(5), null}) {
            send(get(API + "/units/UNIT-ZQ-D1/activities"), token, null).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("UNIT_NOT_FOUND"));
        }
        // staff of D1 cannot read the activities of the unit below or beside it
        send(get(API + "/units/UNIT-ZQ-T1/activities"), m(4), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-D2/activities"), m(4), null).andExpect(status().isNotFound());
        send(get(API + "/units/UNIT-ZQ-NOPE/activities"), admin(), null).andExpect(status().isNotFound());
    }

    @Test
    void statusesAndProgressAreWorkedOut() throws Exception {
        tree();
        activity("UNIT-ZQ-D1", "job_fair", "2090-04-15", 300, "planned", 0);
        activity("UNIT-ZQ-D1", "blood_donation", "2090-03-15", 100, "planned", 0);
        activity("UNIT-ZQ-D1", "matrimony", "2090-05-15", 250, "in_progress", 0);
        JsonNode future = list(m(2), "UNIT-ZQ-D1", "?year=2090");
        assertThat(future.get("activities").get(0).get("type").asText()).isEqualTo("blood_donation");
        assertThat(future.get("activities").get(1).get("type").asText()).isEqualTo("job_fair");
        assertThat(future.get("activities").get(0).get("status").asText()).isEqualTo("planned");
        assertThat(future.get("activities").get(2).get("status").asText()).isEqualTo("in_progress");
        assertThat(future.at("/progress/planned").asInt()).isEqualTo(2);
        assertThat(future.at("/progress/in_progress").asInt()).isEqualTo(1);

        activity("UNIT-ZQ-D1", "blood_donation", "2020-03-15", 100, "done", 40);
        activity("UNIT-ZQ-D1", "job_fair", "2020-04-15", 300, "in_progress", 0);
        activity("UNIT-ZQ-D1", "health_checkup", "2020-05-15", 200, "planned", 0);
        JsonNode past = list(m(2), "UNIT-ZQ-D1", "?year=2020");
        assertThat(past.get("year").asInt()).isEqualTo(2020);
        assertThat(past.get("count").asInt()).isEqualTo(3);
        assertThat(past.get("activities").get(0).get("status").asText()).isEqualTo("done");
        assertThat(past.get("activities").get(1).get("status").asText()).isEqualTo("overdue");
        assertThat(past.get("activities").get(2).get("status").asText()).isEqualTo("overdue");
        JsonNode p = past.get("progress");
        assertThat(p.get("total").asInt()).isEqualTo(3);
        assertThat(p.get("done").asInt()).isEqualTo(1);
        assertThat(p.get("overdue").asInt()).isEqualTo(2);
        assertThat(p.get("planned").asInt()).isZero();
        assertThat(p.get("in_progress").asInt()).isZero();
        assertThat(p.get("targetTotal").asInt()).isEqualTo(600);
        assertThat(p.get("achievedTotal").asInt()).isEqualTo(40);
        assertThat(p.get("typesCovered").asInt()).isEqualTo(3);
        assertThat(p.get("typesRequired").asInt()).isEqualTo(12);
        assertThat(p.get("coveragePct").asInt()).isEqualTo(25);
        assertThat(p.get("completionPct").asInt()).isEqualTo(33);

        JsonNode empty = list(m(2), "UNIT-ZQ-D1", "?year=2091");
        assertThat(empty.get("activities")).isEmpty();
        assertThat(empty.at("/progress/total").asInt()).isZero();
        assertThat(empty.at("/progress/coveragePct").asInt()).isZero();
        assertThat(empty.at("/progress/completionPct").asInt()).isZero();
    }

    @Test
    void filtersAndYears() throws Exception {
        tree();
        activity("UNIT-ZQ-D1", "blood_donation", "2020-03-15", 100, "done", 40);
        activity("UNIT-ZQ-D1", "job_fair", "2020-04-15", 300, "planned", 0);
        activity("UNIT-ZQ-D1", "job_fair", "2090-04-15", 300, "planned", 0);
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2020&type=blood_donation").get("activities")).hasSize(1);
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2020&status=overdue").get("activities")).hasSize(1);
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2020&status=done").get("activities")).hasSize(1);
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2020&status=all&type=all").get("activities")).hasSize(2);
        assertThat(list(m(2), "UNIT-ZQ-D1", "?year=2090").get("activities")).hasSize(1);
        send(get(API + "/units/UNIT-ZQ-D1/activities?year=1999"), m(2), null).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_ACTIVITY"));
        send(get(API + "/units/UNIT-ZQ-D1/activities?year=abc"), m(2), null).andExpect(status().isBadRequest());
        send(get(API + "/units/UNIT-ZQ-D1/activities?year=2101"), m(2), null).andExpect(status().isBadRequest());
        // no year means this year
        int thisYear = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata")).getYear();
        assertThat(list(m(2), "UNIT-ZQ-D1", "").get("year").asInt()).isEqualTo(thisYear);
    }

    @Test
    void meFlagsForActivities() throws Exception {
        tree();
        assertThat(body(send(get(API + "/me"), admin(), null)).at("/permissions/canWriteActivities").asBoolean()).isTrue();
        assertThat(body(send(get(API + "/me"), m(2), null)).at("/permissions/canWriteActivities").asBoolean()).isTrue();
        assertThat(body(send(get(API + "/me"), m(4), null)).at("/permissions/canWriteActivities").asBoolean()).isTrue();
        assertThat(body(send(get(API + "/me"), ceo(), null)).at("/permissions/canWriteActivities").asBoolean()).isFalse();
        assertThat(body(send(get(API + "/me"), m(6), null)).at("/permissions/canWriteActivities").asBoolean()).isFalse();
    }
}
