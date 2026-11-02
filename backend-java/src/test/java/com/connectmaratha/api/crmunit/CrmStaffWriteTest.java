package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.ResultActions;

/** Adding and removing the staff of a unit: who may, the refusals, the limit of ten and the races. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmStaffWriteTest extends CrmUnitTestBase {

    private static final String D1 = "UNIT-ZQ-D1";

    /** S → B1 (owner M9301) → D1 (owner M9302); S → B2 (owner M9303) → D2. */
    private void tree() {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit(D1, "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        unit("UNIT-ZQ-D2", "district", "UNIT-ZQ-B2", "Zq Nashik", null);
    }

    private ResultActions add(String token, String unitId, Object body) throws Exception {
        return send(post(API + "/units/" + unitId + "/staff"), token, body);
    }

    private ResultActions remove(String token, String unitId, String memberId) throws Exception {
        return send(delete(API + "/units/" + unitId + "/staff/" + memberId), token, null);
    }

    private static java.util.Map<String, Object> member(String id) {
        return map("member", id);
    }

    private int bells(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = ? AND type = 'crm_unit'", Integer.class, memberId);
    }

    private int audits(String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action = ? AND user_id LIKE 'M93%'", Integer.class, action);
    }

    private int staffRows(String unitId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM crm_unit_members WHERE unit_id = ? AND unit_role = 'staff'", Integer.class, unitId);
    }

    /** Creates members M9311 … M93(10+n). */
    private void extras(int n) {
        for (int i = 11; i < 11 + n; i++) member("M93" + i, "member");
    }

    @Test
    void ownerAddsAndRemovesStaff() throws Exception {
        tree();
        JsonNode r = body(add(m(2), D1, member("M9304")).andExpect(status().isCreated()));
        assertThat(r.at("/staff/0/id").asText()).isEqualTo("M9304");
        assertThat(r.at("/staff/0/phone").asText()).isEqualTo(phoneOf("M9304"));
        assertThat(jdbc.queryForObject("SELECT unit_role FROM crm_unit_members WHERE member_id = 'M9304'", String.class)).isEqualTo("staff");
        assertThat(bells("M9304")).isEqualTo(1);
        assertThat(audits("CRM_STAFF_ADD")).isEqualTo(1);
        assertThat(body(send(get(API + "/me"), m(4), null)).get("scopeKind").asText()).isEqualTo("staff");

        String p = phoneOf("M9305");
        String spaced = p.substring(0, 5) + " " + p.substring(5, 7) + "-" + p.substring(7);
        add(m(2), D1, map("phone", spaced)).andExpect(status().isCreated());
        assertThat(staffRows(D1)).isEqualTo(2);

        JsonNode after = body(remove(m(2), D1, "M9304").andExpect(status().isOk()));
        assertThat(after.get("staff")).hasSize(1);
        assertThat(body(send(get(API + "/me"), m(4), null)).get("scopeKind").asText()).isEqualTo("none");
        assertThat(bells("M9304")).isEqualTo(2);
        assertThat(audits("CRM_STAFF_REMOVE")).isEqualTo(1);
        remove(m(2), D1, "M9304").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("STAFF_NOT_FOUND"));
    }

    @Test
    void adminAddsStaffToAnyUnit() throws Exception {
        tree();
        add(admin(), D1, member("M9304")).andExpect(status().isCreated());
        add(admin(), "UNIT-ZQ-D2", member("M9305")).andExpect(status().isCreated());
        remove(admin(), D1, "M9304").andExpect(status().isOk());
    }

    @Test
    void nobodyElseManagesStaff() throws Exception {
        tree();
        add(admin(), D1, member("M9304")).andExpect(status().isCreated());
        add(m(4), D1, member("M9305")).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NO_ACCESS"));
        add(m(1), D1, member("M9305")).andExpect(status().isForbidden());
        add(m(3), D1, member("M9305")).andExpect(status().isNotFound());
        add(ceo(), D1, member("M9305")).andExpect(status().isForbidden());
        add(m(6), D1, member("M9305")).andExpect(status().isForbidden());
        add(null, D1, member("M9305")).andExpect(status().isUnauthorized());
        remove(m(4), D1, "M9304").andExpect(status().isForbidden());
        remove(m(1), D1, "M9304").andExpect(status().isForbidden());
        remove(m(3), D1, "M9304").andExpect(status().isNotFound());
        remove(ceo(), D1, "M9304").andExpect(status().isForbidden());
        remove(null, D1, "M9304").andExpect(status().isUnauthorized());
        assertThat(staffRows(D1)).isEqualTo(1);
        assertThat(audits("CRM_STAFF_ADD")).isEqualTo(1);
    }

    @Test
    void addRefusals() throws Exception {
        tree();
        add(admin(), D1, member("M9399")).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
        // two members whose phones end in the same ten digits
        jdbc.update("UPDATE members SET phone = ? WHERE id = 'M9307'", "+91" + phoneOf("M9305"));
        add(admin(), D1, map("phone", phoneOf("M9305"))).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER_AMBIGUOUS"));
        jdbc.update("UPDATE members SET phone = ? WHERE id = 'M9307'", phoneOf("M9307"));
        add(admin(), D1, member(ADMIN)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("OWNER_NOT_ALLOWED"));
        add(admin(), D1, member(CEO)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("OWNER_NOT_ALLOWED"));
        add(admin(), D1, member("M9301")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER_IN_UNIT"));
        add(admin(), D1, member("M9304")).andExpect(status().isCreated());
        add(admin(), D1, member("M9304")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER_IN_UNIT"));
        add(admin(), "UNIT-ZQ-D2", member("M9304")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER_IN_UNIT"));
        add(admin(), D1, map()).andExpect(status().isBadRequest());
        add(admin(), D1, map("member", "")).andExpect(status().isBadRequest());
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-D2'");
        add(admin(), "UNIT-ZQ-D2", member("M9305")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("UNIT_ARCHIVED"));
        assertThat(staffRows(D1)).isEqualTo(1);
        assertThat(bells("M9305")).isZero();
        assertThat(bells("M9307")).isZero();
    }

    @Test
    void aMemberOfAnArchivedUnitCanBeAddedAsStaff() throws Exception {
        tree();
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-B2'");
        // M9303 owned the archived unit; as a free member they join D1 as staff
        add(admin(), D1, member("M9303")).andExpect(status().isCreated());
        assertThat(jdbc.queryForObject("SELECT unit_id FROM crm_unit_members WHERE member_id = 'M9303'", String.class)).isEqualTo(D1);
        assertThat(jdbc.queryForObject("SELECT owner_id FROM community_centers WHERE id = 'UNIT-ZQ-B2'", String.class)).isNull();
    }

    @Test
    void theTeamIsLimitedToTen() throws Exception {
        tree();
        extras(12);
        for (int i = 11; i <= 20; i++) add(m(2), D1, member("M93" + i)).andExpect(status().isCreated());
        assertThat(staffRows(D1)).isEqualTo(10);
        add(m(2), D1, member("M9321")).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("STAFF_LIMIT"));
        assertThat(bells("M9321")).isZero();
        remove(m(2), D1, "M9311").andExpect(status().isOk());
        add(m(2), D1, member("M9321")).andExpect(status().isCreated());
        assertThat(staffRows(D1)).isEqualTo(10);
    }

    @Test
    void twoSimultaneousAddsOneWins() throws Exception {
        tree();
        extras(12);
        String token = admin();
        // the same member to two units
        List<Integer> sameMember = both(
            () -> add(token, D1, member("M9304")).andReturn().getResponse().getStatus(),
            () -> add(token, "UNIT-ZQ-D2", member("M9304")).andReturn().getResponse().getStatus());
        assertThat(sameMember).containsExactlyInAnyOrder(201, 409);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM crm_unit_members WHERE member_id = 'M9304'", Integer.class)).isEqualTo(1);
        // two members for the last seat
        jdbc.update("DELETE FROM crm_unit_members WHERE member_id = 'M9304'");
        for (int i = 11; i <= 19; i++) add(token, D1, member("M93" + i)).andExpect(status().isCreated());
        List<Integer> lastSeat = both(
            () -> add(token, D1, member("M9321")).andReturn().getResponse().getStatus(),
            () -> add(token, D1, member("M9322")).andReturn().getResponse().getStatus());
        assertThat(lastSeat).containsExactlyInAnyOrder(201, 409);
        assertThat(staffRows(D1)).isEqualTo(10);
    }

    @Test
    void archivingTheUnitCutsStaffOff() throws Exception {
        tree();
        add(admin(), D1, member("M9304")).andExpect(status().isCreated());
        send(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(API + "/units/" + D1), admin(),
            map("status", "archived")).andExpect(status().isOk());
        assertThat(body(send(get(API + "/me"), m(4), null)).get("scopeKind").asText()).isEqualTo("none");
        assertThat(ids(body(send(get(API + "/units"), m(4), null)))).isEmpty();
    }

    @Test
    void staffCannotBecomeOwnerUntilRemoved() throws Exception {
        tree();
        add(admin(), D1, member("M9304")).andExpect(status().isCreated());
        send(post(API + "/units/UNIT-ZQ-D2/owner"), admin(), member("M9304")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("OWNER_IN_UNIT"));
        remove(admin(), D1, "M9304").andExpect(status().isOk());
        send(post(API + "/units/UNIT-ZQ-D2/owner"), admin(), member("M9304")).andExpect(status().isOk());
    }

    private List<Integer> both(Callable<Integer> a, Callable<Integer> b) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            CountDownLatch go = new CountDownLatch(1);
            List<Future<Integer>> futures = new ArrayList<>();
            for (Callable<Integer> c : List.of(a, b)) {
                futures.add(pool.submit(() -> {
                    go.await();
                    return c.call();
                }));
            }
            go.countDown();
            List<Integer> out = new ArrayList<>();
            for (Future<Integer> f : futures) out.add(f.get());
            return out;
        } finally {
            pool.shutdown();
        }
    }
}
