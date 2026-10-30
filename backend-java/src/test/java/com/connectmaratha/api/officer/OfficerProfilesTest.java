package com.connectmaratha.api.officer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/** /api/officers profiles and /api/admin/officers: applying, approval, editing, the accepting switch, hiding, adding and linking. */
@SpringBootTest
@AutoConfigureMockMvc
class OfficerProfilesTest extends OfficerTestBase {

    @Test
    void applyingNeedsALogin() throws Exception {
        send(post("/api/officers"), null, profile("Zo Anon")).andExpect(status().isUnauthorized());
        send(get("/api/officers/mine"), null, null).andExpect(status().isUnauthorized());
        send(put("/api/officers/mine"), null, profile("Zo Anon")).andExpect(status().isUnauthorized());
        setAccepting(null, false).andExpect(status().isUnauthorized());
    }

    @Test
    void memberAppliesAndWaits() throws Exception {
        JsonNode o = body(send(post("/api/officers"), m(1), profile("Zo Rahul")).andExpect(status().isCreated())).get("officer");
        assertThat(o.get("id").asText()).startsWith("OFF-");
        assertThat(o.get("status").asText()).isEqualTo("pending");
        assertThat(o.get("accepting").asBoolean()).isTrue();
        assertThat(o.get("phone").asText()).isEqualTo("9876500021");
        assertThat(o.get("exams").toString()).isEqualTo("[\"mpsc_group_b\",\"mpsc_rajyaseva\"]");
        assertThat(o.get("batch_year").asInt()).isEqualTo(2018);

        JsonNode mine = body(send(get("/api/officers/mine"), m(1), null).andExpect(status().isOk())).get("officer");
        assertThat(mine.get("id").asText()).isEqualTo(o.get("id").asText());
        assertThat(listed(publicList(null, ""), o.get("id").asText())).isFalse();
    }

    @Test
    void noProfileGivesNull() throws Exception {
        assertThat(body(send(get("/api/officers/mine"), m(2), null).andExpect(status().isOk())).get("officer").isNull()).isTrue();
    }

    @Test
    void oneProfilePerMember() throws Exception {
        apply(m(1), profile("Zo Rahul"));
        send(post("/api/officers"), m(1), profile("Zo Rahul Again"))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("OFFICER_EXISTS"));
    }

    @Test
    void badProfilesAreRefused() throws Exception {
        for (Map<String, Object> bad : List.of(
                with(profile("Zo Bad"), "name", null),
                with(profile("Zo Bad"), "post", null),
                with(profile("Zo Bad"), "phone", "12345"))) {
            send(post("/api/officers"), m(1), bad)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
    }

    @Test
    void badCodesAreRefused() throws Exception {
        int nextYear = LocalDate.now(ZoneId.of("Asia/Kolkata")).getYear() + 1;
        for (Map<String, Object> bad : List.of(
                with(profile("Zo Bad"), "service", "collector"),
                with(profile("Zo Bad"), "service_status", "active"),
                with(profile("Zo Bad"), "exams", List.of()),
                with(profile("Zo Bad"), "exams", null),
                with(profile("Zo Bad"), "exams", List.of("neet")),
                with(profile("Zo Bad"), "exams", "upsc_cse"),
                with(profile("Zo Bad"), "batch_year", 1949),
                with(profile("Zo Bad"), "batch_year", nextYear))) {
            send(post("/api/officers"), m(1), bad)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
    }

    @Test
    void batchYearIsOptional() throws Exception {
        JsonNode o = body(send(post("/api/officers"), m(1), with(profile("Zo NoBatch"), "batch_year", null))
            .andExpect(status().isCreated())).get("officer");
        assertThat(o.get("batch_year").isNull()).isTrue();
    }

    @Test
    void duplicateExamsAreStoredOnce() throws Exception {
        JsonNode o = body(send(post("/api/officers"), m(1),
                with(profile("Zo Dup"), "exams", List.of("upsc_cse", "mpsc_group_b", "upsc_cse")))
            .andExpect(status().isCreated())).get("officer");
        assertThat(o.get("exams").toString()).isEqualTo("[\"mpsc_group_b\",\"upsc_cse\"]");
    }

    @Test
    void adminApprovesAndTheMemberIsTold() throws Exception {
        String id = apply(m(1), profile("Zo Rahul"));
        adminAct(id, action("approve")).andExpect(status().isOk());

        JsonNode list = publicList(null, "");
        assertThat(listed(list, id)).isTrue();
        assertThat(list.toString()).doesNotContain("\"phone\"").doesNotContain("member_id").doesNotContain("9876500021");

        List<Map<String, Object>> told = notificationsOf("M9201");
        assertThat(told).hasSize(1);
        assertThat(told.get(0).get("type")).isEqualTo("officer");
        assertThat(told.get(0).get("title")).isEqualTo("⭐ तुमचे अधिकारी-मार्गदर्शक प्रोफाइल प्रकाशित झाले");
        assertThat(told.get(0).get("message")).isEqualTo("आता विद्यार्थी तुम्हाला मार्गदर्शनासाठी विनंती पाठवू शकतात.");
    }

    @Test
    void adminRejectsWithAReason() throws Exception {
        String id = apply(m(1), profile("Zo Rahul"));
        Map<String, Object> reject = action("reject");
        reject.put("reason", "Zo ओळखपत्र तपासता आले नाही");
        adminAct(id, reject).andExpect(status().isOk());

        JsonNode mine = body(send(get("/api/officers/mine"), m(1), null)).get("officer");
        assertThat(mine.get("status").asText()).isEqualTo("rejected");
        assertThat(mine.get("reject_reason").asText()).isEqualTo("Zo ओळखपत्र तपासता आले नाही");
        Map<String, Object> told = notificationsOf("M9201").get(0);
        assertThat(told.get("title")).isEqualTo("⭐ अधिकारी प्रोफाइल मंजूर झाले नाही");
        assertThat(told.get("message")).isEqualTo("Zo ओळखपत्र तपासता आले नाही");
    }

    @Test
    void editingSendsItBackForApproval() throws Exception {
        String id = approved(1);
        setAccepting(m(1), false).andExpect(status().isOk());
        send(put("/api/officers/mine"), m(1), with(profile("Zo Officer 1"), "post", "Zo जिल्हाधिकारी")).andExpect(status().isOk());

        JsonNode mine = body(send(get("/api/officers/mine"), m(1), null)).get("officer");
        assertThat(mine.get("status").asText()).isEqualTo("pending");
        assertThat(mine.get("post").asText()).isEqualTo("Zo जिल्हाधिकारी");
        assertThat(mine.get("accepting").asBoolean()).isFalse();
        assertThat(listed(publicList(null, ""), id)).isFalse();
    }

    @Test
    void editingARejectedProfileClearsTheReason() throws Exception {
        String id = apply(m(1), profile("Zo Rahul"));
        Map<String, Object> reject = action("reject");
        reject.put("reason", "Zo जुने कारण");
        adminAct(id, reject).andExpect(status().isOk());
        send(put("/api/officers/mine"), m(1), profile("Zo Rahul")).andExpect(status().isOk());

        JsonNode mine = body(send(get("/api/officers/mine"), m(1), null)).get("officer");
        assertThat(mine.get("status").asText()).isEqualTo("pending");
        assertThat(mine.get("reject_reason").isNull()).isTrue();
    }

    @Test
    void editingWithoutAProfileIs404() throws Exception {
        send(put("/api/officers/mine"), m(2), profile("Zo Nobody"))
            .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("OFFICER_NOT_FOUND"));
    }

    @Test
    void officerPausesAndResumes() throws Exception {
        String id = approved(1);
        setAccepting(m(1), false).andExpect(status().isOk());
        JsonNode card = find(publicList(null, ""), id);
        assertThat(card.get("accepting").asBoolean()).isFalse();
        assertThat(body(send(get("/api/officers/mine"), m(1), null)).get("officer").get("status").asText()).isEqualTo("approved");

        setAccepting(m(1), true).andExpect(status().isOk());
        assertThat(find(publicList(null, ""), id).get("accepting").asBoolean()).isTrue();

        setAccepting(m(1), null).andExpect(status().isBadRequest());
        setAccepting(m(1), "no").andExpect(status().isBadRequest());
        setAccepting(m(2), false).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("OFFICER_NOT_FOUND"));
    }

    @Test
    void adminPausesAnOfficerWithoutAnAccount() throws Exception {
        String guest = adminAdded("Zo Guest");
        adminAct(guest, action("pause")).andExpect(status().isOk());
        assertThat(find(publicList(null, ""), guest).get("accepting").asBoolean()).isFalse();
        adminAct(guest, action("resume")).andExpect(status().isOk());
        assertThat(find(publicList(null, ""), guest).get("accepting").asBoolean()).isTrue();
    }

    @Test
    void hiddenOfficersAreNotPublic() throws Exception {
        String id = approved(1);
        adminAct(id, action("hide")).andExpect(status().isOk());
        assertThat(listed(publicList(null, ""), id)).isFalse();
        adminAct(id, action("unhide")).andExpect(status().isOk());
        assertThat(listed(publicList(null, ""), id)).isTrue();
    }

    @Test
    void adminAddsAnOfficerWithoutAnAccount() throws Exception {
        JsonNode o = body(send(post("/api/admin/officers"), admin(), profile("Zo Guest")).andExpect(status().isCreated())).get("officer");
        assertThat(o.get("status").asText()).isEqualTo("approved");
        assertThat(listed(publicList(null, ""), o.get("id").asText())).isTrue();

        JsonNode all = body(send(get("/api/admin/officers"), admin(), null).andExpect(status().isOk())).get("officers");
        assertThat(find(all, o.get("id").asText()).get("has_account").asBoolean()).isFalse();
    }

    @Test
    void adminListShowsPendingFirst() throws Exception {
        String live = approved(1);
        String waiting = apply(m(2), profile("Zo Waiting"));
        JsonNode reply = body(send(get("/api/admin/officers"), admin(), null));
        assertThat(reply.get("pending").asInt()).isGreaterThanOrEqualTo(1);
        JsonNode all = reply.get("officers");
        int waitingAt = -1, liveAt = -1;
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).get("id").asText().equals(waiting)) waitingAt = i;
            if (all.get(i).get("id").asText().equals(live)) liveAt = i;
        }
        assertThat(waitingAt).isGreaterThanOrEqualTo(0).isLessThan(liveAt);
    }

    @Test
    void adminLinksAnOfficerToAMember() throws Exception {
        String guest = adminAdded("Zo Guest");
        Map<String, Object> link = action("link");
        link.put("member", phoneOf("M9203"));
        adminAct(guest, link).andExpect(status().isOk());
        assertThat(body(send(get("/api/officers/mine"), m(3), null)).get("officer").get("id").asText()).isEqualTo(guest);

        String other = adminAdded("Zo Other");
        link.put("member", "M9203");
        adminAct(other, link).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("OFFICER_EXISTS"));
        link.put("member", "9000000000");
        adminAct(other, link).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
    }

    @Test
    void linkingByAPhoneTwoMembersShareIsRefused() throws Exception {
        jdbc.update("UPDATE members SET phone = '9822000002' WHERE id = 'M9204'");
        jdbc.update("UPDATE members SET phone = '+91 9822000002' WHERE id = 'M9205'");
        String guest = adminAdded("Zo Guest");
        Map<String, Object> link = action("link");
        link.put("member", "9822000002");
        adminAct(guest, link).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER_AMBIGUOUS"));
        link.put("member", "M9205");
        adminAct(guest, link).andExpect(status().isOk());
    }

    @Test
    void adminRoutesAreForAdmins() throws Exception {
        String id = apply(m(1), profile("Zo Rahul"));
        send(get("/api/admin/officers"), m(2), null).andExpect(status().isForbidden());
        send(post("/api/admin/officers"), m(2), profile("Zo Sneaky")).andExpect(status().isForbidden());
        send(put("/api/admin/officers/" + id), m(2), action("approve")).andExpect(status().isForbidden());
        send(put("/api/admin/officers/" + id), m(1), action("approve")).andExpect(status().isForbidden());
    }

    @Test
    void unknownAdminActionIsRefused() throws Exception {
        String id = apply(m(1), profile("Zo Rahul"));
        adminAct(id, action("delete")).andExpect(status().isBadRequest());
        adminAct("OFF-nope", action("approve")).andExpect(status().isNotFound());
    }

    @Test
    void publicListFilters() throws Exception {
        String state = approved(1, profile("Zo State"));
        Map<String, Object> central = with(with(with(with(profile("Zo Central"), "service", "ias"),
            "exams", List.of("upsc_cse")), "city", "पुणे"), "post", "Zo Secretary");
        String ias = approved(2, central);

        JsonNode byExam = publicList(null, "?exam=mpsc_group_b");
        assertThat(listed(byExam, state)).isTrue();
        assertThat(listed(byExam, ias)).isFalse();
        JsonNode byService = publicList(null, "?service=ias");
        assertThat(listed(byService, ias)).isTrue();
        assertThat(listed(byService, state)).isFalse();
        JsonNode bySearch = publicList(null, "?search=zo secretary");
        assertThat(listed(bySearch, ias)).isTrue();
        assertThat(listed(bySearch, state)).isFalse();
        JsonNode all = publicList(null, "?exam=all&service=all");
        assertThat(listed(all, state)).isTrue();
        assertThat(listed(all, ias)).isTrue();
    }

    @Test
    void theViewerSeesWhichProfileIsTheirs() throws Exception {
        String id = approved(1);
        assertThat(find(publicList(m(1), ""), id).get("mine").asBoolean()).isTrue();
        assertThat(find(publicList(m(2), ""), id).get("mine").asBoolean()).isFalse();
    }
}
