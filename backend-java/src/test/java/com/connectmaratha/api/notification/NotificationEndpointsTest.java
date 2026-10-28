package com.connectmaratha.api.notification;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** /api/members/notifications: a member reads and marks their own notifications. */
@SpringBootTest
@AutoConfigureMockMvc
class NotificationEndpointsTest extends PostgresTestBase {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() {
        rateLimit.reset();
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M91%'");
        if (Boolean.TRUE.equals(jdbc.queryForObject("SELECT to_regclass('blood_requests') IS NOT NULL", Boolean.class))) {
            jdbc.update("DELETE FROM blood_requests WHERE member_id LIKE 'M91%'");
            jdbc.update("DELETE FROM blood_donors WHERE member_id LIKE 'M91%'");
        }
        for (String id : List.of("M9101", "M9102")) {
            jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name",
                id, "Member " + id, "98000" + id.substring(1));
        }
    }

    String token(String id) {
        return "Bearer " + jwt.generate(id, "Test", "member", "Gold");
    }

    void notif(String id, String memberId, String type, int read, String createdAt) {
        jdbc.update("INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            id, memberId, "Title " + id, "Message " + id, type, read, createdAt);
    }

    ResultActions send(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) req.header("Authorization", token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
        return mvc.perform(req);
    }

    JsonNode body(ResultActions r) throws Exception {
        return json.readTree(r.andReturn().getResponse().getContentAsString(UTF_8));
    }

    List<String> ids(JsonNode reply) {
        List<String> out = new ArrayList<>();
        for (JsonNode n : reply.get("notifications")) out.add(n.get("id").asText());
        return out;
    }

    int isRead(String id) {
        return jdbc.queryForObject("SELECT is_read FROM notifications WHERE id = ?", Integer.class, id);
    }

    @Test
    void needsALogin() throws Exception {
        send(get("/api/members/notifications"), null, null).andExpect(status().isUnauthorized());
        send(put("/api/members/notifications/N1/read"), null, null).andExpect(status().isUnauthorized());
        send(put("/api/members/notifications/read-all"), null, null).andExpect(status().isUnauthorized());
    }

    @Test
    void listsOnlyMyOwnNewestFirstWithUnreadCount() throws Exception {
        notif("NZ1", "M9101", "meeting", 0, "2026-10-27 09:00:00");
        notif("NZ2", "M9101", "blood", 1, "2026-10-28 09:00:00");
        notif("NZ3", "M9101", "chapter", 0, "2026-10-28 10:30:00");
        notif("NZ4", "M9102", "meeting", 0, "2026-10-28 11:00:00");
        JsonNode reply = body(send(get("/api/members/notifications"), token("M9101"), null).andExpect(status().isOk()));
        assertThat(ids(reply)).containsExactly("NZ3", "NZ2", "NZ1");
        assertThat(reply.get("unread").asInt()).isEqualTo(2);
        JsonNode first = reply.get("notifications").get(0);
        assertThat(first.get("title").asText()).isEqualTo("Title NZ3");
        assertThat(first.get("message").asText()).isEqualTo("Message NZ3");
        assertThat(first.get("type").asText()).isEqualTo("chapter");
        assertThat(first.get("read").asBoolean()).isFalse();
        assertThat(reply.get("notifications").get(1).get("read").asBoolean()).isTrue();
        assertThat(first.has("member_id")).isFalse();
    }

    @Test
    void createdAtIsIsoTime() throws Exception {
        notif("NZ1", "M9101", "meeting", 0, "2026-10-28 10:30:00");
        notif("NZ2", "M9101", "meeting", 0, "2026-10-27T08:00:00.000Z");
        notif("NZ3", "M9101", "meeting", 0, null);
        JsonNode reply = body(send(get("/api/members/notifications"), token("M9101"), null));
        for (JsonNode n : reply.get("notifications")) {
            if (n.get("id").asText().equals("NZ3")) {
                assertThat(n.get("created_at").isNull()).isTrue();
            } else {
                java.time.Instant.parse(n.get("created_at").asText()); // throws when not ISO-8601
            }
        }
    }

    @Test
    void atMostFiftyAreListed() throws Exception {
        for (int i = 0; i < 55; i++) notif("NZL" + i, "M9101", "meeting", 0, String.format("2026-10-28 10:%02d:00", i));
        JsonNode reply = body(send(get("/api/members/notifications"), token("M9101"), null));
        assertThat(reply.get("notifications").size()).isEqualTo(50);
        assertThat(reply.get("unread").asInt()).isEqualTo(55);
        assertThat(reply.get("notifications").get(0).get("id").asText()).isEqualTo("NZL54");
    }

    @Test
    void markOneAsRead() throws Exception {
        notif("NZ1", "M9101", "meeting", 0, "2026-10-28 10:00:00");
        send(put("/api/members/notifications/NZ1/read"), token("M9101"), null)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.unread").value(0));
        assertThat(isRead("NZ1")).isEqualTo(1);
        send(put("/api/members/notifications/NZ1/read"), token("M9101"), null).andExpect(status().isOk());
    }

    @Test
    void someoneElsesNotificationIsNotFound() throws Exception {
        notif("NZ4", "M9102", "meeting", 0, "2026-10-28 10:00:00");
        send(put("/api/members/notifications/NZ4/read"), token("M9101"), null)
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOTIFICATION_NOT_FOUND"));
        assertThat(isRead("NZ4")).isZero();
        send(put("/api/members/notifications/NZ-none/read"), token("M9101"), null).andExpect(status().isNotFound());
    }

    @Test
    void markAllReadTouchesOnlyMine() throws Exception {
        notif("NZ1", "M9101", "meeting", 0, "2026-10-28 10:00:00");
        notif("NZ2", "M9101", "blood", 0, "2026-10-28 10:01:00");
        notif("NZ4", "M9102", "meeting", 0, "2026-10-28 10:00:00");
        send(put("/api/members/notifications/read-all"), token("M9101"), null)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.unread").value(0));
        assertThat(isRead("NZ1")).isEqualTo(1);
        assertThat(isRead("NZ2")).isEqualTo(1);
        assertThat(isRead("NZ4")).isZero();
    }

    @Test
    void aBloodRequestSendsABloodNotification() throws Exception {
        send(get("/api/blood/donors"), null, null).andExpect(status().isOk()); // creates the blood tables on first use
        jdbc.update("INSERT INTO blood_donors (id, member_id, name, blood_group, city, district, phone) "
            + "VALUES ('BDZn1', 'M9102', 'Zn Donor', 'AB-', 'Pune', 'पुणे', '9811111111')");
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("patientName", "Zn Patient");
        b.put("bloodGroup", "AB-");
        b.put("hospital", "Zn Hospital");
        b.put("city", "Pune");
        b.put("district", "पुणे");
        b.put("contactPhone", "9876543211");
        send(post("/api/blood/requests"), token("M9101"), b).andExpect(status().isCreated());
        JsonNode reply = body(send(get("/api/members/notifications"), token("M9102"), null));
        assertThat(reply.get("notifications").get(0).get("type").asText()).isEqualTo("blood");
        assertThat(reply.get("unread").asInt()).isEqualTo(1);
    }
}
