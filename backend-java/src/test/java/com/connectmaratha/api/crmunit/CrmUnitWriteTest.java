package com.connectmaratha.api.crmunit;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.test.web.servlet.ResultActions;

/** Creating, editing, archiving and changing the owner of CRM units. */
@SpringBootTest
@AutoConfigureMockMvc
class CrmUnitWriteTest extends CrmUnitTestBase {

    private ResultActions create(String token, String level, String parentId, String name, Object owner) throws Exception {
        Map<String, Object> b = map("level", level, "name", name);
        if (parentId != null) b.put("parent_id", parentId);
        if (owner != null) b.put("owner", owner);
        return send(post(API + "/units"), token, b);
    }

    private static Map<String, Object> member(String id) {
        return map("member", id);
    }

    private String created(ResultActions result) throws Exception {
        return body(result.andExpect(status().isCreated())).at("/unit/id").asText();
    }

    private int bells(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = ? AND type = 'crm_unit'", Integer.class, memberId);
    }

    private int audits(String action) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action = ? AND user_id LIKE 'M93%'", Integer.class, action);
    }

    @Test
    void adminCreatesAStateWithAnOwner() throws Exception {
        JsonNode r = body(create(admin(), "state", null, "Zq Maharashtra", member("M9301")).andExpect(status().isCreated()));
        String id = r.at("/unit/id").asText();
        assertThat(id).startsWith("UNIT-STA-");
        assertThat(r.at("/unit/level").asText()).isEqualTo("state");
        assertThat(r.at("/unit/path").asText()).isEqualTo("/" + id + "/");
        assertThat(r.at("/unit/owner/id").asText()).isEqualTo("M9301");
        assertThat(jdbc.queryForObject("SELECT owner_id FROM community_centers WHERE id = ?", String.class, id)).isEqualTo("M9301");
        assertThat(jdbc.queryForObject("SELECT unit_id FROM crm_unit_members WHERE member_id = 'M9301'", String.class)).isEqualTo(id);
        assertThat(bells("M9301")).isEqualTo(1);
        assertThat(audits("CRM_UNIT_CREATE")).isEqualTo(1);
        JsonNode me = body(send(get(API + "/me"), m(1), null).andExpect(status().isOk()));
        assertThat(me.at("/unit/id").asText()).isEqualTo(id);
        assertThat(me.get("scopeKind").asText()).isEqualTo("unit");
    }

    @Test
    void onlyAdminsCreateAState() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        create(m(1), "state", null, "Zq Other", member("M9302")).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NO_ACCESS"));
        create(ceo(), "state", null, "Zq Other", member("M9302")).andExpect(status().isForbidden());
        create(null, "state", null, "Zq Other", member("M9302")).andExpect(status().isUnauthorized());
        create(m(5), "state", null, "Zq Other", member("M9302")).andExpect(status().isForbidden());
    }

    @Test
    void levelMustSitDirectlyBelowTheParent() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        create(admin(), "district", "UNIT-ZQ-S", "Zq Pune", member("M9301")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_LEVEL_ORDER"));
        create(admin(), "state", "UNIT-ZQ-S", "Zq Goa", member("M9301")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_LEVEL_ORDER"));
        create(admin(), "branch", null, "Zq Loose", member("M9301")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_LEVEL_ORDER"));
        create(admin(), "branch", "UNIT-ZQ-NOPE", "Zq Pune Branch", member("M9301")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("UNIT_NOT_FOUND"));
        jdbc.update("UPDATE community_centers SET status = 'archived' WHERE id = 'UNIT-ZQ-S'");
        create(admin(), "branch", "UNIT-ZQ-S", "Zq Pune Branch", member("M9301")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("UNIT_ARCHIVED"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM community_centers WHERE name LIKE 'Zq%' AND level IS NOT NULL", Integer.class)).isEqualTo(1);
    }

    @Test
    void ownerCreatesBelowOnly() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        JsonNode r = body(create(m(1), "division", "UNIT-ZQ-B1", "Zq Pune Division", member("M9304")).andExpect(status().isCreated()));
        assertThat(r.at("/unit/path").asText()).startsWith("/UNIT-ZQ-S/UNIT-ZQ-B1/UNIT-DIV-");
        create(m(1), "division", "UNIT-ZQ-B2", "Zq Nashik Division", member("M9305")).andExpect(status().isNotFound());
        create(m(1), "branch", "UNIT-ZQ-S", "Zq Third Branch", member("M9305")).andExpect(status().isNotFound());
        create(m(4), "district", "UNIT-ZQ-B1", "Zq Hack", member("M9306")).andExpect(status().isNotFound());
        create(m(1), "branch", "UNIT-ZQ-B1", "Zq Under Own", member("M9306")).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_LEVEL_ORDER"));
        // the new owner can now create below their own unit
        String division = r.at("/unit/id").asText();
        create(m(4), "district", division, "Zq Pune District", member("M9306")).andExpect(status().isCreated());
    }

    @Test
    void ownerMustBeAFreeNonAdminMember() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", "M9301");
        create(admin(), "branch", "UNIT-ZQ-S", "Zq A", member("M9399")).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
        create(admin(), "branch", "UNIT-ZQ-S", "Zq B", member("M9301")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("OWNER_IN_UNIT"));
        create(admin(), "branch", "UNIT-ZQ-S", "Zq C", member(ADMIN)).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("OWNER_NOT_ALLOWED"));
        create(admin(), "branch", "UNIT-ZQ-S", "Zq D", member(CEO)).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("OWNER_NOT_ALLOWED"));
        // two members share a phone (written differently, same last 10 digits)
        jdbc.update("UPDATE members SET phone = ? WHERE id = 'M9303'", "+91" + phoneOf("M9302"));
        create(admin(), "branch", "UNIT-ZQ-S", "Zq E", map("phone", phoneOf("M9302"))).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("MEMBER_AMBIGUOUS"));
        jdbc.update("UPDATE members SET phone = ? WHERE id = 'M9303'", phoneOf("M9303"));
        // a phone with spaces and dashes finds the one member
        String spaced = phoneOf("M9302").substring(0, 5) + " " + phoneOf("M9302").substring(5, 7) + "-" + phoneOf("M9302").substring(7);
        JsonNode r = body(create(admin(), "branch", "UNIT-ZQ-S", "Zq F", map("phone", spaced)).andExpect(status().isCreated()));
        assertThat(r.at("/unit/owner/id").asText()).isEqualTo("M9302");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM community_centers WHERE name IN ('Zq A','Zq B','Zq C','Zq D','Zq E')", Integer.class)).isZero();
    }

    @Test
    void sameNameUnderTheSameParentIsRefused() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-S2", "state", null, "Zq Goa", null);
        create(admin(), "branch", "UNIT-ZQ-S", "Zq Satara", member("M9301")).andExpect(status().isCreated());
        int bellsBefore = bells("M9302");
        create(admin(), "branch", "UNIT-ZQ-S", "zq SATARA", member("M9302")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("UNIT_EXISTS"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM crm_unit_members WHERE member_id = 'M9302'", Integer.class)).isZero();
        assertThat(bells("M9302")).isEqualTo(bellsBefore);
        create(admin(), "branch", "UNIT-ZQ-S2", "Zq Satara", member("M9302")).andExpect(status().isCreated());
    }

    @Test
    void badBodiesAreRefused() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        send(post(API + "/units"), admin(), map("level", "branch", "parent_id", "UNIT-ZQ-S", "owner", member("M9301")))
            .andExpect(status().isBadRequest());
        send(post(API + "/units"), admin(), map("name", "Zq X", "parent_id", "UNIT-ZQ-S", "owner", member("M9301")))
            .andExpect(status().isBadRequest());
        send(post(API + "/units"), admin(), map("level", "branch", "name", "Zq X", "parent_id", "UNIT-ZQ-S"))
            .andExpect(status().isBadRequest());
        create(admin(), "branch", "UNIT-ZQ-S", "Z", member("M9301")).andExpect(status().isBadRequest());
        create(admin(), "village", "UNIT-ZQ-S", "Zq X", member("M9301")).andExpect(status().isBadRequest());
        create(admin(), "branch", "UNIT-ZQ-S", "Zq X", map()).andExpect(status().isBadRequest());
    }

    @Test
    void editChangesNameAndAddressOnly() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        Map<String, Object> edit = map("name", "Zq Pune Renamed", "address", "Shivajinagar", "level", "state",
            "parent_id", "UNIT-ZQ-B2", "path", "/hacked/", "owner_id", "M9399");
        JsonNode r = body(send(put(API + "/units/UNIT-ZQ-B1"), m(1), edit).andExpect(status().isOk()));
        assertThat(r.at("/unit/name").asText()).isEqualTo("Zq Pune Renamed");
        assertThat(r.at("/unit/address").asText()).isEqualTo("Shivajinagar");
        Map<String, Object> row = jdbc.queryForMap("SELECT level, parent_id, path, owner_id FROM community_centers WHERE id = 'UNIT-ZQ-B1'");
        assertThat(row.get("level")).isEqualTo("branch");
        assertThat(row.get("parent_id")).isEqualTo("UNIT-ZQ-S");
        assertThat(row.get("path")).isEqualTo("/UNIT-ZQ-S/UNIT-ZQ-B1/");
        assertThat(row.get("owner_id")).isEqualTo("M9301");
        assertThat(audits("CRM_UNIT_UPDATE")).isEqualTo(1);
        send(put(API + "/units/UNIT-ZQ-B2"), m(1), map("name", "Zq Steal")).andExpect(status().isNotFound());
        send(put(API + "/units/UNIT-ZQ-B1"), ceo(), map("name", "Zq Steal")).andExpect(status().isForbidden());
        send(put(API + "/units/UNIT-ZQ-B1"), m(5), map("name", "Zq Steal")).andExpect(status().isForbidden());
        send(put(API + "/units/UNIT-ZQ-B1"), m(1), map("name", "zq nashik BRANCH")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("UNIT_EXISTS"));
        send(put(API + "/units/UNIT-ZQ-B1"), m(1), map("name", "")).andExpect(status().isBadRequest());
    }

    @Test
    void archiveAndRestoreNeedSomeoneAbove() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-D1", "district", "UNIT-ZQ-B1", "Zq Pune", "M9302");
        // the district owner cannot archive their own unit
        send(put(API + "/units/UNIT-ZQ-D1"), m(2), map("status", "archived")).andExpect(status().isForbidden());
        send(put(API + "/units/UNIT-ZQ-B1"), m(1), map("status", "archived")).andExpect(status().isForbidden());
        send(put(API + "/units/UNIT-ZQ-D1"), m(1), map("status", "archived")).andExpect(status().isOk());
        assertThat(audits("CRM_UNIT_ARCHIVE")).isEqualTo(1);
        // the district owner has no access at once
        assertThat(body(send(get(API + "/me"), m(2), null)).get("scopeKind").asText()).isEqualTo("none");
        // an archived unit rejects edits and new children, even from above
        send(put(API + "/units/UNIT-ZQ-D1"), m(1), map("name", "Zq Renamed")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("UNIT_ARCHIVED"));
        create(m(1), "taluka", "UNIT-ZQ-D1", "Zq Haveli", member("M9303")).andExpect(status().isConflict());
        send(put(API + "/units/UNIT-ZQ-D1"), m(1), map("status", "active")).andExpect(status().isOk());
        assertThat(audits("CRM_UNIT_RESTORE")).isEqualTo(1);
        assertThat(body(send(get(API + "/me"), m(2), null)).get("scopeKind").asText()).isEqualTo("unit");
    }

    @Test
    void changeOwnerMovesAccessAtOnce() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        unit("UNIT-ZQ-B1", "branch", "UNIT-ZQ-S", "Zq Pune Branch", "M9301");
        unit("UNIT-ZQ-B2", "branch", "UNIT-ZQ-S", "Zq Nashik Branch", "M9303");
        // the unit's own owner cannot hand it over, a sibling cannot see it
        send(post(API + "/units/UNIT-ZQ-B1/owner"), m(1), member("M9302")).andExpect(status().isForbidden());
        send(post(API + "/units/UNIT-ZQ-B1/owner"), m(3), member("M9302")).andExpect(status().isNotFound());
        send(post(API + "/units/UNIT-ZQ-B1/owner"), ceo(), member("M9302")).andExpect(status().isForbidden());
        // a new owner who already owns a unit is refused and nothing moves
        send(post(API + "/units/UNIT-ZQ-B1/owner"), admin(), member("M9303")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("OWNER_IN_UNIT"));
        assertThat(ids(body(send(get(API + "/units"), m(1), null)))).containsExactly("UNIT-ZQ-B1");
        // the real change
        JsonNode r = body(send(post(API + "/units/UNIT-ZQ-B1/owner"), admin(), member("M9302")).andExpect(status().isOk()));
        assertThat(r.at("/unit/owner/id").asText()).isEqualTo("M9302");
        assertThat(ids(body(send(get(API + "/units"), m(1), null)))).isEmpty();
        assertThat(body(send(get(API + "/me"), m(1), null)).get("scopeKind").asText()).isEqualTo("none");
        assertThat(ids(body(send(get(API + "/units"), m(2), null)))).containsExactly("UNIT-ZQ-B1");
        assertThat(bells("M9302")).isEqualTo(1);
        assertThat(bells("M9301")).isEqualTo(1);
        assertThat(audits("CRM_UNIT_OWNER_CHANGE")).isEqualTo(1);
        String details = jdbc.queryForObject("SELECT details FROM audit_logs WHERE action = 'CRM_UNIT_OWNER_CHANGE' AND user_id LIKE 'M93%'", String.class);
        assertThat(details).contains("M9301").contains("M9302");
        // the same member again: nothing happens
        send(post(API + "/units/UNIT-ZQ-B1/owner"), admin(), member("M9302")).andExpect(status().isOk());
        assertThat(bells("M9302")).isEqualTo(1);
        assertThat(audits("CRM_UNIT_OWNER_CHANGE")).isEqualTo(1);
    }

    @Test
    void twoSimultaneousCreatesOneWins() throws Exception {
        unit("UNIT-ZQ-S", "state", null, "Zq Maharashtra", null);
        String token = admin();
        // same name, different owners
        List<Integer> sameName = both(
            () -> create(token, "branch", "UNIT-ZQ-S", "Zq Race", member("M9301")).andReturn().getResponse().getStatus(),
            () -> create(token, "branch", "UNIT-ZQ-S", "Zq Race", member("M9302")).andReturn().getResponse().getStatus());
        assertThat(sameName).containsExactlyInAnyOrder(201, 409);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM community_centers WHERE lower(name) = 'zq race'", Integer.class)).isEqualTo(1);
        // different names, same owner
        List<Integer> sameOwner = both(
            () -> create(token, "branch", "UNIT-ZQ-S", "Zq Race A", member("M9304")).andReturn().getResponse().getStatus(),
            () -> create(token, "branch", "UNIT-ZQ-S", "Zq Race B", member("M9304")).andReturn().getResponse().getStatus());
        assertThat(sameOwner).containsExactlyInAnyOrder(201, 409);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM community_centers WHERE name LIKE 'Zq Race _'", Integer.class)).isEqualTo(1);
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
