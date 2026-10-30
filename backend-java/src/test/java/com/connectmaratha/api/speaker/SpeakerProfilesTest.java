package com.connectmaratha.api.speaker;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

/** /api/speakers profiles and /api/admin/speakers: applying, admin approval, editing, hiding, admin-added speakers and linking. */
@SpringBootTest
@AutoConfigureMockMvc
class SpeakerProfilesTest extends SpeakerTestBase {

    @Test
    void applyingNeedsALogin() throws Exception {
        send(post("/api/speakers"), null, profile("Zs Anon")).andExpect(status().isUnauthorized());
        send(get("/api/speakers/mine"), null, null).andExpect(status().isUnauthorized());
        send(put("/api/speakers/mine"), null, profile("Zs Anon")).andExpect(status().isUnauthorized());
    }

    @Test
    void memberAppliesAndWaits() throws Exception {
        JsonNode reply = body(send(post("/api/speakers"), m(1), profile("Zs Rahul")).andExpect(status().isCreated()));
        JsonNode s = reply.get("speaker");
        assertThat(s.get("id").asText()).startsWith("SPK-");
        assertThat(s.get("status").asText()).isEqualTo("pending");
        assertThat(s.get("phone").asText()).isEqualTo("9876500011");

        JsonNode mine = body(send(get("/api/speakers/mine"), m(1), null).andExpect(status().isOk())).get("speaker");
        assertThat(mine.get("id").asText()).isEqualTo(s.get("id").asText());
        assertThat(listed(publicList(null, ""), s.get("id").asText())).isFalse();
    }

    @Test
    void noProfileGivesNull() throws Exception {
        assertThat(body(send(get("/api/speakers/mine"), m(2), null).andExpect(status().isOk())).get("speaker").isNull()).isTrue();
    }

    @Test
    void oneProfilePerMember() throws Exception {
        apply(m(1), profile("Zs Rahul"));
        send(post("/api/speakers"), m(1), profile("Zs Rahul Again"))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("SPEAKER_EXISTS"));
    }

    @Test
    void badProfilesAreRefused() throws Exception {
        for (Map<String, Object> bad : List.of(
                with(profile("Zs Bad"), "name", null),
                with(profile("Zs Bad"), "category", "Cooking"),
                with(with(profile("Zs Bad"), "offers_talks", false), "offers_guidance", false),
                with(profile("Zs Bad"), "phone", "12345"))) {
            send(post("/api/speakers"), m(1), bad)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
    }

    @Test
    void adminApprovesAndTheMemberIsTold() throws Exception {
        String id = apply(m(1), profile("Zs Rahul"));
        adminAct(id, action("approve")).andExpect(status().isOk());

        JsonNode list = publicList(null, "");
        assertThat(listed(list, id)).isTrue();
        String raw = list.toString();
        assertThat(raw).doesNotContain("\"phone\"").doesNotContain("member_id").doesNotContain("9876500011");

        List<Map<String, Object>> told = notificationsOf("M9101");
        assertThat(told).hasSize(1);
        assertThat(told.get(0).get("type")).isEqualTo("speaker");
        assertThat(told.get(0).get("title")).isEqualTo("🎙️ तुमचे वक्ता प्रोफाइल प्रकाशित झाले");
    }

    @Test
    void adminRejectsWithAReason() throws Exception {
        String id = apply(m(1), profile("Zs Rahul"));
        Map<String, Object> reject = action("reject");
        reject.put("reason", "Zs अधिक माहिती द्या");
        adminAct(id, reject).andExpect(status().isOk());

        JsonNode mine = body(send(get("/api/speakers/mine"), m(1), null)).get("speaker");
        assertThat(mine.get("status").asText()).isEqualTo("rejected");
        assertThat(mine.get("reject_reason").asText()).isEqualTo("Zs अधिक माहिती द्या");
        Map<String, Object> told = notificationsOf("M9101").get(0);
        assertThat(told.get("title")).isEqualTo("🎙️ वक्ता प्रोफाइल मंजूर झाले नाही");
        assertThat(told.get("message")).isEqualTo("Zs अधिक माहिती द्या");
    }

    @Test
    void editingSendsItBackForApproval() throws Exception {
        String id = approved(1);
        send(put("/api/speakers/mine"), m(1), with(profile("Zs Speaker 1"), "topics", "Zs नवीन विषय")).andExpect(status().isOk());

        JsonNode mine = body(send(get("/api/speakers/mine"), m(1), null)).get("speaker");
        assertThat(mine.get("status").asText()).isEqualTo("pending");
        assertThat(mine.get("topics").asText()).isEqualTo("Zs नवीन विषय");
        assertThat(listed(publicList(null, ""), id)).isFalse();
    }

    @Test
    void editingARejectedProfileClearsTheReason() throws Exception {
        String id = apply(m(1), profile("Zs Rahul"));
        Map<String, Object> reject = action("reject");
        reject.put("reason", "Zs जुने कारण");
        adminAct(id, reject).andExpect(status().isOk());
        send(put("/api/speakers/mine"), m(1), profile("Zs Rahul")).andExpect(status().isOk());

        JsonNode mine = body(send(get("/api/speakers/mine"), m(1), null)).get("speaker");
        assertThat(mine.get("status").asText()).isEqualTo("pending");
        assertThat(mine.get("reject_reason").isNull()).isTrue();
    }

    @Test
    void editingWithoutAProfileIs404() throws Exception {
        send(put("/api/speakers/mine"), m(2), profile("Zs Nobody"))
            .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("SPEAKER_NOT_FOUND"));
    }

    @Test
    void hiddenSpeakersAreNotPublic() throws Exception {
        String id = approved(1);
        adminAct(id, action("hide")).andExpect(status().isOk());
        assertThat(listed(publicList(null, ""), id)).isFalse();
        adminAct(id, action("unhide")).andExpect(status().isOk());
        assertThat(listed(publicList(null, ""), id)).isTrue();
    }

    @Test
    void adminAddsASpeakerWithoutAnAccount() throws Exception {
        JsonNode s = body(send(post("/api/admin/speakers"), admin(), profile("Zs Guest")).andExpect(status().isCreated())).get("speaker");
        assertThat(s.get("status").asText()).isEqualTo("approved");
        assertThat(listed(publicList(null, ""), s.get("id").asText())).isTrue();

        JsonNode all = body(send(get("/api/admin/speakers"), admin(), null).andExpect(status().isOk())).get("speakers");
        for (JsonNode one : all) {
            if (one.get("id").asText().equals(s.get("id").asText())) assertThat(one.get("has_account").asBoolean()).isFalse();
        }
    }

    @Test
    void adminListShowsPendingFirst() throws Exception {
        String live = approved(1);
        String waiting = apply(m(2), profile("Zs Waiting"));
        JsonNode all = body(send(get("/api/admin/speakers"), admin(), null)).get("speakers");
        int waitingAt = -1, liveAt = -1;
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).get("id").asText().equals(waiting)) waitingAt = i;
            if (all.get(i).get("id").asText().equals(live)) liveAt = i;
        }
        assertThat(waitingAt).isGreaterThanOrEqualTo(0).isLessThan(liveAt);
    }

    @Test
    void adminLinksASpeakerToAMember() throws Exception {
        String guest = adminAdded("Zs Guest");
        Map<String, Object> link = action("link");
        link.put("member", phoneOf("M9103"));
        adminAct(guest, link).andExpect(status().isOk());
        JsonNode mine = body(send(get("/api/speakers/mine"), m(3), null)).get("speaker");
        assertThat(mine.get("id").asText()).isEqualTo(guest);

        String other = adminAdded("Zs Other");
        link.put("member", "M9103");
        adminAct(other, link).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("SPEAKER_EXISTS"));
        link.put("member", "9000000000");
        adminAct(other, link).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("MEMBER_NOT_FOUND"));
    }

    @Test
    void linkingByAPhoneTwoMembersShareIsRefused() throws Exception {
        jdbc.update("UPDATE members SET phone = '9822000001' WHERE id = 'M9104'");
        jdbc.update("UPDATE members SET phone = '+91 9822000001' WHERE id = 'M9105'");
        String guest = adminAdded("Zs Guest");
        Map<String, Object> link = action("link");
        link.put("member", "9822000001");
        adminAct(guest, link).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("MEMBER_AMBIGUOUS"));
        assertThat(jdbc.queryForObject("SELECT member_id FROM speakers WHERE id = ?", String.class, guest)).isNull();

        link.put("member", "M9105");
        adminAct(guest, link).andExpect(status().isOk());
    }

    @Test
    void adminRoutesAreForAdmins() throws Exception {
        String id = apply(m(1), profile("Zs Rahul"));
        send(get("/api/admin/speakers"), m(2), null).andExpect(status().isForbidden());
        send(post("/api/admin/speakers"), m(2), profile("Zs Sneaky")).andExpect(status().isForbidden());
        send(put("/api/admin/speakers/" + id), m(2), action("approve")).andExpect(status().isForbidden());
        send(put("/api/admin/speakers/" + id), m(1), action("approve")).andExpect(status().isForbidden());
    }

    @Test
    void unknownAdminActionIsRefused() throws Exception {
        String id = apply(m(1), profile("Zs Rahul"));
        adminAct(id, action("delete")).andExpect(status().isBadRequest());
        adminAct("SPK-nope", action("approve")).andExpect(status().isNotFound());
    }

    @Test
    void publicListFilters() throws Exception {
        String pune = approved(1, profile("Zs Pune"));
        Map<String, Object> satara = with(with(with(profile("Zs Satara"), "city", "सातारा"), "category", "युवा प्रेरणा"), "topics", "Zs Leadership");
        String sat = approved(2, satara);

        JsonNode byCity = publicList(null, "?city=पुणे");
        assertThat(listed(byCity, pune)).isTrue();
        assertThat(listed(byCity, sat)).isFalse();
        JsonNode byCategory = publicList(null, "?category=युवा प्रेरणा");
        assertThat(listed(byCategory, sat)).isTrue();
        assertThat(listed(byCategory, pune)).isFalse();
        JsonNode bySearch = publicList(null, "?search=mpsc");
        assertThat(listed(bySearch, pune)).isTrue();
        assertThat(listed(bySearch, sat)).isFalse();
        JsonNode all = publicList(null, "?category=सर्व वक्ते");
        assertThat(listed(all, pune)).isTrue();
        assertThat(listed(all, sat)).isTrue();
    }

    @Test
    void theViewerSeesWhichProfileIsTheirs() throws Exception {
        String id = approved(1);
        for (JsonNode s : publicList(m(1), "")) if (s.get("id").asText().equals(id)) assertThat(s.get("mine").asBoolean()).isTrue();
        for (JsonNode s : publicList(m(2), "")) if (s.get("id").asText().equals(id)) assertThat(s.get("mine").asBoolean()).isFalse();
    }
}
