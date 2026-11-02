package com.connectmaratha.api.crmunit;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

/** Planning, adding, editing, completing (with proof) and deleting the activities of a unit. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmActivityWriteTest extends CrmUnitTestBase {

    @org.springframework.beans.factory.annotation.Autowired
    com.connectmaratha.api.crmunit.repository.CrmActivityRepository repository;

    private static final String D1 = "UNIT-ZQ-D1";
    private static final String BASE = API + "/units/" + D1;

    /** S → B1 (owner M9301) → D1 (owner M9302, staff M9304); S → B2 (owner M9303) → D2. */
    private void tree() {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit(D1, "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        unit("UNIT-ZQ-D2", "district", "UNIT-ZQ-B2", "Zq Nashik", null);
        jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES ('M9304', ?, 'staff') ON CONFLICT DO NOTHING", D1);
    }

    private ResultActions add(String token, Map<String, Object> body) throws Exception {
        return send(post(BASE + "/activities"), token, body);
    }

    private static Map<String, Object> valid() {
        return map("type", "blood_donation", "scheduledDate", "2090-03-15", "targetCount", 120, "notes", "Zq plan");
    }

    private String added(String token) throws Exception {
        return body(add(token, valid()).andExpect(status().isCreated())).at("/activity/id").asText();
    }

    private int rows(String where) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM crm_activities WHERE unit_id = 'UNIT-ZQ-D1'" + where, Integer.class);
    }

    private int audits(String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action = ? AND user_id LIKE 'M93%'", Integer.class, action);
    }

    private static Map<String, Object> proof() {
        return map("attendeeCount", 40, "notes", "Camp done", "photoUrl", "https://example.com/p.jpg");
    }

    @Test
    void ownerStaffAndAdminWriteOthersDoNot() throws Exception {
        tree();
        for (String writer : new String[] {m(2), m(4), admin()}) add(writer, valid()).andExpect(status().isCreated());
        assertThat(rows("")).isEqualTo(3);

        String id = added(m(2));
        String[] refused = {m(1), ceo(), m(6)};
        for (String who : refused) {
            add(who, valid()).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NO_ACCESS"));
            send(post(BASE + "/plan"), who, map("year", 2091)).andExpect(status().isForbidden());
            send(put(BASE + "/activities/" + id), who, map("targetCount", 5)).andExpect(status().isForbidden());
            send(post(BASE + "/activities/" + id + "/complete"), who, proof()).andExpect(status().isForbidden());
            send(delete(BASE + "/activities/" + id), who, null).andExpect(status().isForbidden());
        }
        // a sibling's owner cannot even see the unit, a visitor must log in
        add(m(3), valid()).andExpect(status().isNotFound());
        send(post(BASE + "/plan"), m(3), map("year", 2091)).andExpect(status().isNotFound());
        send(delete(BASE + "/activities/" + id), m(3), null).andExpect(status().isNotFound());
        add(null, valid()).andExpect(status().isUnauthorized());
        send(delete(BASE + "/activities/" + id), null, null).andExpect(status().isUnauthorized());
        assertThat(rows("")).isEqualTo(4);
        assertThat(rows(" AND target_count = 5")).isZero();
        assertThat(audits("CRM_ACTIVITY_ADD")).isEqualTo(4);
    }

    @Test
    void planCreatesTheTwelveOncePerMonth() throws Exception {
        tree();
        JsonNode r = body(send(post(BASE + "/plan"), m(2), map("year", 2090, "targets", map("blood_donation", 120, "job_fair", "350")))
            .andExpect(status().isCreated()));
        assertThat(r.get("created")).hasSize(12);
        assertThat(r.get("skipped").asInt()).isZero();
        assertThat(r.get("year").asInt()).isEqualTo(2090);
        List<String> types = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            JsonNode a = r.get("created").get(i);
            types.add(a.get("type").asText());
            assertThat(a.get("scheduledDate").asText()).isEqualTo(String.format("2090-%02d-15", i + 1));
            assertThat(a.get("status").asText()).isEqualTo("planned");
        }
        assertThat(types.get(0)).isEqualTo("health_checkup");
        assertThat(types.get(11)).isEqualTo("food_expo");
        assertThat(r.get("created").get(0).get("title").asText()).isEqualTo("आरोग्य तपासणी");
        assertThat(r.get("created").get(0).get("targetCount").asInt()).isEqualTo(200);
        assertThat(r.get("created").get(1).get("targetCount").asInt()).isEqualTo(120);
        assertThat(r.get("created").get(2).get("targetCount").asInt()).isEqualTo(350);
        assertThat(audits("CRM_PLAN_CREATE")).isEqualTo(1);

        JsonNode again = body(send(post(BASE + "/plan"), m(2), map("year", 2090)).andExpect(status().isCreated()));
        assertThat(again.get("created")).isEmpty();
        assertThat(again.get("skipped").asInt()).isEqualTo(12);
        assertThat(rows("")).isEqualTo(12);

        // a unit that already has one type this year gets the other eleven
        add(m(2), map("type", "blood_donation", "scheduledDate", "2091-07-01", "targetCount", 10)).andExpect(status().isCreated());
        JsonNode eleven = body(send(post(BASE + "/plan"), m(4), map("year", 2091)).andExpect(status().isCreated()));
        assertThat(eleven.get("created")).hasSize(11);
        assertThat(eleven.get("skipped").asInt()).isEqualTo(1);

        // no year means this year; a bad year is refused
        send(post(BASE + "/plan"), m(2), map()).andExpect(status().isCreated());
        send(post(BASE + "/plan"), m(2), map("year", 1999)).andExpect(status().isBadRequest());
        send(post(BASE + "/plan"), m(2), map("year", "abc")).andExpect(status().isBadRequest());
        send(post(BASE + "/plan"), m(2), map("year", 2101)).andExpect(status().isBadRequest());
        send(post(BASE + "/plan"), m(2), map("year", 2092, "targets", map("blood_donation", -3))).andExpect(status().isBadRequest());
        assertThat(rows(" AND year = 2092")).isZero();
    }

    @Test
    void twoSimultaneousPlansMakeOneSet() throws Exception {
        tree();
        String token = admin();
        List<MvcResult> results = both(
            () -> send(post(BASE + "/plan"), token, map("year", 2093)).andReturn(),
            () -> send(post(BASE + "/plan"), token, map("year", 2093)).andReturn());
        int created = 0;
        for (MvcResult r : results) {
            assertThat(r.getResponse().getStatus()).isEqualTo(201);
            created += json.readTree(r.getResponse().getContentAsString(UTF_8)).get("created").size();
        }
        assertThat(created).isEqualTo(12);
        assertThat(rows(" AND year = 2093")).isEqualTo(12);
    }

    @Test
    void addValidation() throws Exception {
        tree();
        add(m(2), map("type", "nope", "scheduledDate", "2090-03-15")).andExpect(status().isBadRequest());
        add(m(2), map("scheduledDate", "2090-03-15")).andExpect(status().isBadRequest());
        add(m(2), map("type", "job_fair")).andExpect(status().isBadRequest());
        for (String badDate : new String[] {"2090-02-30", "2090-13-01", "15-03-2090", "1999-12-31", "2101-01-01", "x"}) {
            add(m(2), map("type", "job_fair", "scheduledDate", badDate)).andExpect(status().isBadRequest());
        }
        for (Object badTarget : new Object[] {-1, 1.5, 1000001, "ten"}) {
            add(m(2), map("type", "job_fair", "scheduledDate", "2090-03-15", "targetCount", badTarget)).andExpect(status().isBadRequest());
        }
        add(m(2), map("type", "job_fair", "scheduledDate", "2090-03-15", "title", "x".repeat(201))).andExpect(status().isBadRequest());
        assertThat(rows("")).isZero();

        JsonNode a = body(add(m(2), map("type", "job_fair", "scheduledDate", "2090-03-15", "targetCount", 7, "status", "done",
            "attendeeCount", 99, "unit_id", "UNIT-ZQ-D2", "year", 2000, "id", "ACT-HACK")).andExpect(status().isCreated())).get("activity");
        assertThat(a.get("title").asText()).isEqualTo("रोजगार मेळावा");
        assertThat(a.get("status").asText()).isEqualTo("planned");
        assertThat(a.get("attendeeCount").asInt()).isZero();
        assertThat(a.get("year").asInt()).isEqualTo(2090);
        assertThat(a.get("id").asText()).startsWith("ACT-").isNotEqualTo("ACT-HACK");
        assertThat(rows("")).isEqualTo(1);
        // no target given means zero, and a title of one's own is kept
        JsonNode b = body(add(m(2), map("type", "spiritual", "scheduledDate", "2090-05-01", "title", "Zq Satsang")).andExpect(status().isCreated())).get("activity");
        assertThat(b.get("targetCount").asInt()).isZero();
        assertThat(b.get("title").asText()).isEqualTo("Zq Satsang");
    }

    @Test
    void editChangesOnlyAllowedFieldsWhileNotDone() throws Exception {
        tree();
        String id = added(m(2));
        JsonNode r = body(send(put(BASE + "/activities/" + id), m(4), map("scheduledDate", "2091-04-20", "targetCount", 55, "notes", "moved",
            "title", "Zq New", "status", "in_progress", "unit_id", "UNIT-ZQ-D2", "type", "food_expo", "attendeeCount", 9, "id", "ACT-X"))
            .andExpect(status().isOk())).get("activity");
        assertThat(r.get("scheduledDate").asText()).isEqualTo("2091-04-20");
        assertThat(r.get("year").asInt()).isEqualTo(2091);
        assertThat(r.get("targetCount").asInt()).isEqualTo(55);
        assertThat(r.get("status").asText()).isEqualTo("in_progress");
        assertThat(r.get("type").asText()).isEqualTo("blood_donation");
        assertThat(r.get("attendeeCount").asInt()).isZero();
        assertThat(jdbc.queryForObject("SELECT unit_id FROM crm_activities WHERE id = ?", String.class, id)).isEqualTo(D1);
        assertThat(audits("CRM_ACTIVITY_UPDATE")).isEqualTo(1);

        send(put(BASE + "/activities/" + id), m(2), map("status", "done")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("USE_COMPLETE"));
        send(put(BASE + "/activities/" + id), m(2), map("status", "planned")).andExpect(status().isOk());
        send(put(BASE + "/activities/" + id), m(2), map("scheduledDate", "2090-02-30")).andExpect(status().isBadRequest());
        send(put(BASE + "/activities/" + id), m(2), map("photoUrl", "javascript:alert(1)")).andExpect(status().isBadRequest());
        send(put(BASE + "/activities/" + id), m(2), map("photoUrl", "https://example.com/a.jpg")).andExpect(status().isOk());
        send(put(BASE + "/activities/" + id), m(2), map()).andExpect(status().isBadRequest());
        send(put(BASE + "/activities/ACT-NOPE"), m(2), map("targetCount", 1)).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ACTIVITY_NOT_FOUND"));
        // an activity of another unit is not found through this unit
        jdbc.update("INSERT INTO crm_activities (id, unit_id, year, type, title, scheduled_date) VALUES ('ACT-ZQ-OTHER', 'UNIT-ZQ-D2', 2090, 'food_expo', 'Zq x', DATE '2090-12-15')");
        send(put(BASE + "/activities/ACT-ZQ-OTHER"), m(2), map("targetCount", 1)).andExpect(status().isNotFound());
        send(post(BASE + "/activities/ACT-ZQ-OTHER/complete"), m(2), proof()).andExpect(status().isNotFound());
        send(delete(BASE + "/activities/ACT-ZQ-OTHER"), m(2), null).andExpect(status().isNotFound());
    }

    @Test
    void completeNeedsProofAndIsFinal() throws Exception {
        tree();
        String id = added(m(2));
        String url = BASE + "/activities/" + id + "/complete";
        send(post(url), m(4), map("notes", "Camp done")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("PROOF_REQUIRED"));
        send(post(url), m(4), map("attendeeCount", 40)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("PROOF_REQUIRED"));
        send(post(url), m(4), map("attendeeCount", 40, "notes", "ok")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("PROOF_REQUIRED"));
        send(post(url), m(4), map("attendeeCount", -1, "notes", "Camp done")).andExpect(status().isBadRequest());
        send(post(url), m(4), map("attendeeCount", 40, "notes", "Camp done", "photoUrl", "ftp://x")).andExpect(status().isBadRequest());
        assertThat(rows(" AND status = 'done'")).isZero();

        JsonNode done = body(send(post(url), m(4), proof()).andExpect(status().isOk())).get("activity");
        assertThat(done.get("status").asText()).isEqualTo("done");
        assertThat(done.get("attendeeCount").asInt()).isEqualTo(40);
        assertThat(done.get("notes").asText()).isEqualTo("Camp done");
        assertThat(done.get("photoUrl").asText()).isEqualTo("https://example.com/p.jpg");
        assertThat(done.get("completedAt").isNull()).isFalse();
        assertThat(jdbc.queryForObject("SELECT completed_by FROM crm_activities WHERE id = ?", String.class, id)).isEqualTo("M9304");
        assertThat(audits("CRM_ACTIVITY_COMPLETE")).isEqualTo(1);

        send(post(url), m(2), map("attendeeCount", 99, "notes", "Changed")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALREADY_DONE"));
        send(put(BASE + "/activities/" + id), m(2), map("targetCount", 1)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALREADY_DONE"));
        assertThat(jdbc.queryForObject("SELECT attendee_count FROM crm_activities WHERE id = ?", Integer.class, id)).isEqualTo(40);
        // the list shows it as done
        JsonNode list = body(send(get(BASE + "/activities?year=2090"), m(2), null));
        assertThat(list.at("/progress/done").asInt()).isEqualTo(1);
        assertThat(list.at("/progress/achievedTotal").asInt()).isEqualTo(40);
    }

    @Test
    void twoSimultaneousCompletesOneWins() throws Exception {
        tree();
        String id = added(m(2));
        String url = BASE + "/activities/" + id + "/complete";
        String token = m(2);
        List<MvcResult> results = both(
            () -> send(post(url), token, map("attendeeCount", 10, "notes", "first one")).andReturn(),
            () -> send(post(url), token, map("attendeeCount", 20, "notes", "second one")).andReturn());
        List<Integer> codes = new ArrayList<>();
        int winner = -1;
        for (MvcResult r : results) {
            codes.add(r.getResponse().getStatus());
            if (r.getResponse().getStatus() == 200) {
                winner = json.readTree(r.getResponse().getContentAsString(UTF_8)).at("/activity/attendeeCount").asInt();
            }
        }
        assertThat(codes).containsExactlyInAnyOrder(200, 409);
        assertThat(jdbc.queryForObject("SELECT attendee_count FROM crm_activities WHERE id = ?", Integer.class, id)).isEqualTo(winner);
        assertThat(audits("CRM_ACTIVITY_COMPLETE")).isEqualTo(1);
    }

    @Test
    void deleteRules() throws Exception {
        tree();
        String planned = added(m(2));
        String other = added(m(2));
        send(delete(BASE + "/activities/" + planned), m(4), null).andExpect(status().isForbidden());
        assertThat(rows("")).isEqualTo(2);
        send(delete(BASE + "/activities/" + planned), m(2), null).andExpect(status().isOk());
        send(delete(BASE + "/activities/" + planned), m(2), null).andExpect(status().isNotFound());
        assertThat(audits("CRM_ACTIVITY_DELETE")).isEqualTo(1);
        // a done record: the owner cannot remove it, an admin can
        send(post(BASE + "/activities/" + other + "/complete"), m(2), proof()).andExpect(status().isOk());
        send(delete(BASE + "/activities/" + other), m(2), null).andExpect(status().isForbidden());
        assertThat(rows("")).isEqualTo(1);
        send(delete(BASE + "/activities/" + other), admin(), null).andExpect(status().isOk());
        assertThat(rows("")).isZero();
        assertThat(audits("CRM_ACTIVITY_DELETE")).isEqualTo(2);
    }


    @Test
    void aNonAdminDeleteNeverRemovesARecordThatIsDone() throws Exception {
        tree();
        String planned = added(m(2));
        String finished = added(m(2));
        send(post(BASE + "/activities/" + finished + "/complete"), m(2), proof()).andExpect(status().isOk());
        // the delete itself refuses a done record, even if it became done after the owner's request had looked at it
        assertThat(repository.deleteIfNotDone(D1, finished)).isZero();
        assertThat(rows(" AND status = 'done'")).isEqualTo(1);
        assertThat(repository.deleteIfNotDone(D1, planned)).isEqualTo(1);
        assertThat(repository.deleteIfNotDone(D1, planned)).isZero();
        // a second delete of a record that is gone is 404 and writes no audit row
        String gone = added(m(2));
        send(delete(BASE + "/activities/" + gone), m(2), null).andExpect(status().isOk());
        int before = audits("CRM_ACTIVITY_DELETE");
        send(delete(BASE + "/activities/" + gone), m(2), null).andExpect(status().isNotFound());
        assertThat(audits("CRM_ACTIVITY_DELETE")).isEqualTo(before);
    }

    @Test
    void theListKeepsTheStoredStatusOfAnOverdueActivity() throws Exception {
        tree();
        jdbc.update("INSERT INTO crm_activities (id, unit_id, year, type, title, scheduled_date, status) VALUES ('ACT-ZQ-S1', ?, 2020, 'job_fair', 'Zq x', DATE '2020-04-15', 'in_progress')", D1);
        JsonNode a = body(send(get(BASE + "/activities?year=2020"), m(2), null)).get("activities").get(0);
        assertThat(a.get("status").asText()).isEqualTo("overdue");
        assertThat(a.get("storedStatus").asText()).isEqualTo("in_progress");
    }
    @Test
    void anArchivedUnitIsReadOnly() throws Exception {
        tree();
        String id = added(m(2));
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = ?", D1);
        String admin = admin();
        send(get(BASE + "/activities?year=2090"), admin, null).andExpect(status().isOk());
        add(admin, valid()).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("UNIT_ARCHIVED"));
        send(post(BASE + "/plan"), admin, map("year", 2095)).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("UNIT_ARCHIVED"));
        send(put(BASE + "/activities/" + id), admin, map("targetCount", 3)).andExpect(status().isConflict());
        send(post(BASE + "/activities/" + id + "/complete"), admin, proof()).andExpect(status().isConflict());
        send(delete(BASE + "/activities/" + id), admin, null).andExpect(status().isConflict());
        assertThat(rows("")).isEqualTo(1);
        assertThat(rows(" AND year = 2095")).isZero();
        // the owner of an archived unit has no access at all
        add(m(2), valid()).andExpect(status().isForbidden());
    }

    private <T> List<T> both(Callable<T> a, Callable<T> b) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            CountDownLatch go = new CountDownLatch(1);
            List<Future<T>> futures = new ArrayList<>();
            for (Callable<T> c : List.of(a, b)) {
                futures.add(pool.submit(() -> {
                    go.await();
                    return c.call();
                }));
            }
            go.countDown();
            List<T> out = new ArrayList<>();
            for (Future<T> f : futures) out.add(f.get());
            return out;
        } finally {
            pool.shutdown();
        }
    }
}
