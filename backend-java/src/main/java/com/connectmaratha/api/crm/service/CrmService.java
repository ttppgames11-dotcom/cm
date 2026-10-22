package com.connectmaratha.api.crm.service;

import static com.connectmaratha.api.common.util.WebsiteText.cleanMobile;
import static com.connectmaratha.api.common.util.WebsiteText.newId;
import static com.connectmaratha.api.common.util.WebsiteText.text;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.util.WebsiteText;
import com.connectmaratha.api.common.web.Envelope;
import com.connectmaratha.api.crm.entity.SupportTicket;
import com.connectmaratha.api.crm.repository.CommunityCenterRepository;
import com.connectmaratha.api.crm.repository.SupportTicketRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Website helpdesk (tickets) and community-centre front desk (backend/routes/crm.routes.js).
 * Members create tickets and see only their own; staff and admins see and work all.
 */
@Service
public class CrmService {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final List<String> LEVELS = List.of("taluka", "district", "division", "state");
    private static final List<String> PRIORITIES = List.of("Low", "Medium", "High", "Critical");
    private static final List<String> STATUSES = List.of("New", "In_Progress", "Escalated", "Resolved", "Closed");

    private final SupportTicketRepository tickets;
    private final CommunityCenterRepository centers;
    private final LazyTables tables;

    public CrmService(SupportTicketRepository tickets, CommunityCenterRepository centers, LazyTables tables) {
        this.tickets = tickets;
        this.centers = centers;
        this.tables = tables;
    }

    public void requireStaff(CurrentUser user) {
        if (!Roles.isStaff(user)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "फक्त अधिकृत कर्मचाऱ्यांना परवानगी आहे. (Staff only)");
        }
    }

    // ------------------------------------------------------------------ tickets

    @Transactional
    public Map<String, Object> listTickets(CurrentUser user, Map<String, String> query) {
        tables.ensureWebsiteTables();
        String requester = Roles.isStaff(user) ? null : user.id();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (SupportTicket t : tickets.search(requester, q(query, "status"), q(query, "priority"), q(query, "category"),
                                              q(query, "district"), q(query, "taluka"), q(query, "division"))) {
            rows.add(ticket(t));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total", rows.size());
        data.put("tickets", rows);
        return Envelope.success("Tickets fetched", data);
    }

    @Transactional
    public Map<String, Object> createTicket(CurrentUser user, Map<String, Object> b) {
        String title = text(b.get("title"), 200);
        String description = text(b.get("description"), 3000);
        if (title.isEmpty() || description.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "शीर्षक व तपशील आवश्यक आहे.");
        }
        String priority = PRIORITIES.contains(b.get("priority")) ? (String) b.get("priority") : "Medium";
        tables.ensureWebsiteTables();

        String id = "TKT-" + LocalDate.now(ZoneOffset.UTC).toString().substring(0, 7).replace("-", "") + "-"
            + newId("").substring(1);
        String name = Js.truthy(user.name()) ? user.name() : first(text(b.get("requesterName"), 100), "नागरिक");
        String now = WebsiteText.nowIso();

        Map<String, Object> created = new LinkedHashMap<>();
        created.put("action", "CREATED");
        created.put("by", name);
        created.put("role", Js.orElse(user.role(), "member"));
        created.put("timestamp", now);
        created.put("note", "नवीन तक्रार / मागणी नोंदवली गेली.");

        tickets.insertTicket(id, title, description, first(text(b.get("category"), 60), "General"),
            text(b.get("subcategory"), 100), priority, text(b.get("district"), 60), text(b.get("taluka"), 60),
            text(b.get("division"), 60), text(b.get("assignedCenterId"), 60), user.id(), name,
            cleanMobile(b.get("requesterPhone")), priority.equals("Critical") ? 4 : priority.equals("High") ? 24 : 72,
            toJson(List.of(created)), now);
        return Envelope.success("तिकीट यशस्वीरित्या नोंदवले गेले.", ticket(tickets.findById(id).orElseThrow()));
    }

    /** taluka -> district -> division -> state. */
    @Transactional
    public Map<String, Object> escalate(CurrentUser user, String id, Map<String, Object> b) {
        requireStaff(user);
        tables.ensureWebsiteTables();
        SupportTicket t = find(id);
        String from = LEVELS.contains(t.getCurrentOwnerLevel()) ? t.getCurrentOwnerLevel() : "taluka";
        String to = LEVELS.get(Math.min(LEVELS.indexOf(from) + 1, LEVELS.size() - 1));
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("action", "ESCALATED");
        entry.put("fromLevel", from);
        entry.put("toLevel", to);
        entry.put("by", user.name());
        entry.put("role", user.role());
        entry.put("reason", first(text(b.get("reason"), 500), "स्थानिक पातळीवर अनिर्णित राहिल्यामुळे वरिष्ठ स्तरावर वर्ग."));
        SupportTicket updated = save(t, "Escalated", to, entry);
        return Envelope.success("तिकीट यशस्वीरित्या " + to.toUpperCase(Locale.ROOT) + " स्तरावर वर्ग केले.", ticket(updated));
    }

    @Transactional
    public Map<String, Object> changeStatus(CurrentUser user, String id, Map<String, Object> b) {
        requireStaff(user);
        Object status = b.get("status");
        if (!STATUSES.contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "स्टेटस यापैकी असावे: " + String.join(", ", STATUSES));
        }
        tables.ensureWebsiteTables();
        SupportTicket t = find(id);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("action", "STATUS_CHANGE_TO_" + ((String) status).toUpperCase(Locale.ROOT));
        entry.put("by", user.name());
        entry.put("role", user.role());
        entry.put("note", text(b.get("note"), 500));
        SupportTicket updated = save(t, (String) status, t.getCurrentOwnerLevel(), entry);
        return Envelope.success("स्थिती यशस्वीरित्या बदलली: " + status, ticket(updated));
    }

    // ------------------------------------------------------------------ centres

    @Transactional
    public Map<String, Object> listCenters(String tier, String district, String division) {
        tables.ensureWebsiteTables();
        List<Map<String, Object>> rows = centers.findActive(Js.nullIfFalsy(tier), Js.nullIfFalsy(district), Js.nullIfFalsy(division));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total", rows.size());
        data.put("centers", rows);
        return Envelope.success("Centers fetched", data);
    }

    @Transactional
    public Map<String, Object> createCenter(CurrentUser user, Map<String, Object> b) {
        if (!Roles.isAdmin(user)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        }
        String name = text(b.get("name"), 150);
        if (name.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "केंद्राचे नाव आवश्यक आहे.");
        tables.ensureWebsiteTables();
        String id = newId("CC");
        centers.insertCenter(id, name, text(b.get("tier"), 30), text(b.get("division"), 60), text(b.get("district"), 60),
            text(b.get("taluka"), 60), text(b.get("address"), 300), text(b.get("contactPerson"), 100), text(b.get("phone"), 30));
        return Envelope.success("केंद्र जोडले!", Map.of("center", centers.find(id).orElseThrow()));
    }

    @Transactional
    public Map<String, Object> checkIn(CurrentUser user, String centerId, Map<String, Object> b) {
        requireStaff(user);
        tables.ensureWebsiteTables();
        requireCenter(centerId);
        centers.insertCheckIn(newId("ACT"), centerId, first(text(b.get("visitorName"), 100), "अभ्यागत नागरिक"),
            cleanMobile(b.get("phone")), first(text(b.get("purpose"), 200), "सामान्य चौकशी"),
            first(text(b.get("desk"), 60), "फ्रंट डेस्क"), user.id());
        Map<String, Object> center = requireCenter(centerId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("centerId", center.get("id"));
        data.put("todayVisitors", center.get("todayVisitors"));
        return Envelope.success("अभ्यागत नोंद यशस्वी!", data);
    }

    /** Records a receipt (1 to 1,00,00,000 rupees) and returns the centre's collection so far today. */
    @Transactional
    public Map<String, Object> transaction(CurrentUser user, String centerId, Map<String, Object> b) {
        requireStaff(user);
        double amount = Js.number(b.get("amount"));
        if (Double.isNaN(amount) || Double.isInfinite(amount) || amount <= 0 || amount > 10000000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "वैध रक्कम आवश्यक आहे.");
        }
        tables.ensureWebsiteTables();
        requireCenter(centerId);
        String receipt = newId("RCPT");
        centers.insertReceipt(receipt, centerId, first(text(b.get("payerName"), 100), "देणगीदार / सभासद"),
            first(text(b.get("category"), 100), "सदस्यता वर्गणी"), amount,
            first(text(b.get("paymentMode"), 40), "UPI / रोख"), user.id());
        Map<String, Object> center = requireCenter(centerId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("centerId", center.get("id"));
        data.put("dailyCollection", center.get("dailyCollection"));
        data.put("receiptNumber", receipt);
        return Envelope.success("पावती नोंद यशस्वी!", data);
    }

    // ------------------------------------------------------------------ helpers

    private SupportTicket find(String id) {
        return tickets.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TICKET_NOT_FOUND", "तिकीट सापडले नाही."));
    }

    private Map<String, Object> requireCenter(String id) {
        return centers.find(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CENTER_NOT_FOUND", "केंद्र सापडले नाही."));
    }

    /** Adds a timestamped entry to the ticket's history and updates its status and level. */
    private SupportTicket save(SupportTicket t, String status, String level, Map<String, Object> entry) {
        List<Object> trail = new ArrayList<>(parseTrail(t.getAuditTrail()));
        Map<String, Object> withTime = new LinkedHashMap<>(entry);
        withTime.put("timestamp", WebsiteText.nowIso());
        trail.add(withTime);
        tickets.updateTicket(t.getId(), status, level, toJson(trail), WebsiteText.nowIso());
        return tickets.findById(t.getId()).orElseThrow();
    }

    private static List<Object> parseTrail(String raw) {
        try {
            Object parsed = JSON.readValue(raw == null || raw.isEmpty() ? "[]" : raw, Object.class);
            return parsed instanceof List<?> list ? new ArrayList<>(list) : new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private static String toJson(Object value) {
        try {
            return JSON.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    /** A filter value from the query string, or null when it is missing or empty. */
    private static String q(Map<String, String> query, String key) {
        return Js.nullIfFalsy(query.get(key));
    }

    private static String first(String value, String fallback) {
        return value.isEmpty() ? fallback : value;
    }

    static Map<String, Object> ticket(SupportTicket t) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", t.getId());
        o.put("ticketNumber", t.getId());
        o.put("source", t.getSource());
        o.put("title", t.getTitle());
        o.put("description", t.getDescription());
        o.put("category", t.getCategory());
        o.put("subcategory", orEmpty(t.getSubcategory()));
        o.put("priority", t.getPriority());
        o.put("district", orEmpty(t.getDistrict()));
        o.put("taluka", orEmpty(t.getTaluka()));
        o.put("division", orEmpty(t.getDivision()));
        o.put("assignedCenterId", orEmpty(t.getAssignedCenterId()));
        o.put("currentOwnerLevel", t.getCurrentOwnerLevel());
        o.put("status", t.getStatus());
        o.put("requesterId", t.getRequesterId());
        o.put("requesterName", t.getRequesterName());
        o.put("requesterPhone", orEmpty(t.getRequesterPhone()));
        o.put("slaHours", t.getSlaHours() == null || t.getSlaHours() == 0 ? null : t.getSlaHours());
        o.put("created_at", t.getCreatedAt());
        o.put("updated_at", Js.truthy(t.getUpdatedAt()) ? t.getUpdatedAt() : t.getCreatedAt());
        o.put("auditTrail", parseTrail(t.getAuditTrail()));
        return o;
    }

    private static String orEmpty(String v) {
        return v == null ? "" : v;
    }

}
