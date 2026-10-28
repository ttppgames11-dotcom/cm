package com.connectmaratha.api.blood.service;

import com.connectmaratha.api.blood.dto.BloodSchemas;
import com.connectmaratha.api.blood.repository.BloodRepository;
import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Blood help (रक्तदान मदत): blood requests owned by the member who posted them, which close when the blood is
 * received, when cancelled, or 7 days after they were posted or extended; one donor profile per member with an
 * availability switch and a 90-day gap after a donation. Phone numbers go only to logged-in members.
 */
@Service
public class BloodService {

    private static final Logger log = LoggerFactory.getLogger(BloodService.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    static final int MAX_REQUESTS_PER_DAY = 3;
    static final int MAX_NOTIFIED = 100;

    private final BloodRepository blood;
    private final MemberRepository members;
    private final ActivityRepository activity;
    private final LazyTables tables;
    private final TransactionTemplate ownTransaction;
    private final AtomicBoolean oldEntriesCopied = new AtomicBoolean();

    public BloodService(BloodRepository blood, MemberRepository members, ActivityRepository activity, LazyTables tables,
                        PlatformTransactionManager transactions) {
        this.blood = blood;
        this.members = members;
        this.activity = activity;
        this.tables = tables;
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /** Creates the tables and copies the old entries (once per start; copying again changes nothing). */
    void ensure() {
        tables.ensureBloodTables();
        if (oldEntriesCopied.get()) return;
        try {
            int[] copied = ownTransaction.execute(status -> blood.copyOldEntries());
            if (copied != null && (copied[0] > 0 || copied[1] > 0)) {
                log.info("Copied {} old blood requests and {} old donors", copied[0], copied[1]);
            }
            oldEntriesCopied.set(true);
        } catch (RuntimeException e) {
            log.warn("Copying old blood entries failed; will retry on next use", e);
        }
    }

    // ------------------------------------------------------------------ requests

    /** Open requests that have not expired, newest first; contact phones only for logged-in viewers. */
    @Transactional(readOnly = true)
    public Map<String, Object> requests(CurrentUser viewer, String bloodGroup, String district) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : blood.activeRequests(bloodGroup, district)) list.add(requestJson(row, viewer));
        return listResult("requests", list);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> myRequests(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : blood.requestsOfMember(user.id())) list.add(requestJson(row, user));
        return listResult("requests", list);
    }

    /**
     * Posts a request (3 per member per 24 hours) that closes in 7 days, then tells the matching donors. Not one
     * transaction: the request is saved first, and each notification is sent on its own, so a failed notification
     * never undoes the post.
     */
    public Map<String, Object> post(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = BloodSchemas.normalize(body);
        SchemaValidator.check(input, BloodSchemas.REQUEST, true, null);
        if (blood.recentRequests(user.id()) >= MAX_REQUESTS_PER_DAY) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "२४ तासांत जास्तीत जास्त ३ मागण्या करता येतात (At most 3 requests in 24 hours).");
        }
        String id = newId("BR", blood::existsRequest);
        int units = input.get("units") instanceof Number n ? n.intValue() : 1;
        String group = text(input.get("bloodGroup"));
        String district = text(input.get("district"));
        String hospital = text(input.get("hospital"));
        String city = text(input.get("city"));
        String note = text(input.get("note"));
        blood.insertRequest(id, user.id(), text(input.get("patientName")), group, units, hospital, city, district,
            text(input.get("contactPhone")), text(input.get("urgency")), note.isEmpty() ? null : note);

        int notified = 0;
        String title = "🩸 " + group + " रक्ताची गरज — " + district;
        String message = hospital + ", " + city + ": " + units + " युनिट. रक्तदान मदत पानावर संपर्क पहा.";
        for (String memberId : blood.matchingDonorMembers(group, district, user.id(), MAX_NOTIFIED)) {
            try {
                ownTransaction.executeWithoutResult(status -> activity.notifyMember(notificationId(), memberId, title, message, "blood"));
                notified++;
            } catch (RuntimeException e) {
                log.warn("Blood request {}: could not notify {}", id, memberId, e);
            }
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "🚨 रक्ताची मागणी प्रसिद्ध झाली! (Request posted.)");
        out.put("request", requestJson(blood.findRequest(id).orElseThrow(), user));
        out.put("notified", notified);
        return out;
    }

    /** { action: received | close | extend } by the owner or an admin, only while the request is open. */
    @Transactional
    public Map<String, Object> act(CurrentUser user, String id, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = BloodSchemas.normalize(body);
        SchemaValidator.check(input, BloodSchemas.ACTION, true, null);
        String action = text(input.get("action"));
        Map<String, Object> row = blood.findRequest(id).orElseThrow(BloodService::requestNotFound);
        boolean owner = user.id().equals(row.get("member_id"));
        if (!owner && !isAdmin(user)) {
            throw ApiException.forbidden("NOT_OWNER", "ही मागणी आपली नाही (This request is not yours).");
        }
        int changed = switch (action) {
            case "received" -> blood.closeIfOpen(id, "fulfilled", user.id());
            case "close" -> blood.closeIfOpen(id, "closed", user.id());
            default -> blood.extendIfOpen(id);
        };
        if (changed == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "INVALID_TRANSITION", "ही मागणी आधीच बंद झाली आहे (This request is already closed).");
        }
        if (!owner && action.equals("close")) audit(user, "BLOOD_REQUEST_CLOSE", Map.of("requestId", id));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", switch (action) {
            case "received" -> "रक्त मिळाले — मागणी बंद केली ✅ (Marked as received.)";
            case "close" -> "मागणी बंद केली (Request closed.)";
            default -> "मागणी आणखी ७ दिवस सुरू राहील (Request extended by 7 days.)";
        });
        out.put("request", requestJson(blood.findRequest(id).orElseThrow(), user));
        return out;
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public Map<String, Object> adminAll(CurrentUser user) {
        requireAdmin(user);
        ensure();
        List<Map<String, Object>> requests = new ArrayList<>();
        for (Map<String, Object> row : blood.allRequests()) requests.add(adminRequestJson(row, user));
        List<Map<String, Object>> donors = new ArrayList<>();
        for (Map<String, Object> row : blood.allDonors()) donors.add(adminDonorJson(row, user));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("requests", requests);
        out.put("donors", donors);
        return out;
    }

    /** { hidden: true | false }: hide a donor from the public list, or show them again. */
    @Transactional
    public Map<String, Object> setHidden(CurrentUser user, String donorId, Map<String, Object> body) {
        requireAdmin(user);
        ensure();
        SchemaValidator.check(body, BloodSchemas.HIDDEN, true, null);
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        if (blood.setDonorHidden(donorId, hidden) == 0) throw donorNotFound();
        audit(user, hidden ? "BLOOD_DONOR_HIDE" : "BLOOD_DONOR_UNHIDE", Map.of("donorId", donorId));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", hidden ? "रक्तदाता लपवला (Donor hidden.)" : "रक्तदाता पुन्हा दिसेल (Donor shown again.)");
        out.put("donor", adminDonorJson(blood.findDonor(donorId).orElseThrow(), user));
        return out;
    }

    // ------------------------------------------------------------------ donors

    /** Visible donors, available first; phones only for logged-in viewers. */
    @Transactional(readOnly = true)
    public Map<String, Object> donors(CurrentUser viewer, String bloodGroup, String district) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : blood.visibleDonors(bloodGroup, district)) list.add(donorJson(row, viewer));
        return listResult("donors", list);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> myDonor(CurrentUser user) {
        ensure();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("donor", blood.donorOfMember(user.id()).map(row -> ownDonorJson(row, user)).orElse(null));
        return out;
    }

    /** Creates or updates the caller's own profile: 201 when created, 200 when updated. */
    @Transactional
    public ResponseEntity<Map<String, Object>> saveMyDonor(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = BloodSchemas.normalize(body);
        SchemaValidator.check(input, BloodSchemas.DONOR, true, null);
        LocalDate lastDonated = lastDonated(input.get("lastDonated"));
        boolean available = !Boolean.FALSE.equals(input.get("available"));
        boolean created = blood.upsertDonor(newId("BD", blood::existsDonor), user.id(), text(input.get("name")),
            text(input.get("bloodGroup")), text(input.get("city")), text(input.get("district")), text(input.get("phone")),
            available, lastDonated);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", created
            ? "❤️ रक्तदाता म्हणून नोंदणी झाली! (Donor profile created.)"
            : "रक्तदाता प्रोफाइल जतन झाले (Donor profile saved.)");
        out.put("donor", ownDonorJson(blood.donorOfMember(user.id()).orElseThrow(), user));
        return ResponseEntity.status(created ? HttpStatus.CREATED : HttpStatus.OK).body(out);
    }

    @Transactional
    public Map<String, Object> deleteMyDonor(CurrentUser user) {
        ensure();
        if (blood.deleteDonorOfMember(user.id()) == 0) throw donorNotFound();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "रक्तदाता प्रोफाइल काढले (Donor profile deleted.)");
        return out;
    }

    // ------------------------------------------------------------------ helpers

    /** A request as a viewer may see it: no member id; the contact phone only for logged-in viewers. */
    static Map<String, Object> requestJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", row.get("id"));
        for (String k : new String[] {"patient_name", "blood_group"}) r.put(k, text(row.get(k)));
        r.put("units", row.get("units") instanceof Number n ? n.intValue() : 1);
        for (String k : new String[] {"hospital", "city", "district", "urgency", "note"}) r.put(k, text(row.get(k)));
        r.put("created_at", iso(row.get("created_at")));
        r.put("closes_at", iso(row.get("closes_at")));
        r.put("state", text(row.get("state")));
        r.put("mine", viewer != null && viewer.id().equals(row.get("member_id")));
        if (viewer != null) r.put("contact_phone", text(row.get("contact_phone")));
        return r;
    }

    static Map<String, Object> adminRequestJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> r = requestJson(row, viewer);
        r.put("member_id", row.get("member_id"));
        r.put("owner_name", row.get("owner_name"));
        r.put("closed_by", row.get("closed_by"));
        return r;
    }

    static Map<String, Object> adminDonorJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> d = ownDonorJson(row, viewer);
        d.put("member_id", row.get("member_id"));
        d.put("owner_name", row.get("owner_name"));
        d.put("created_at", iso(row.get("created_at")));
        return d;
    }

    private static void requireAdmin(CurrentUser user) {
        if (!isAdmin(user)) throw ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");
    }

    private void audit(CurrentUser user, String action, Map<String, Object> details) {
        String name = members.findById(user.id()).map(Member::getName).map(BloodService::text).filter(s -> !s.isEmpty()).orElse("सदस्य");
        String json;
        try {
            json = JSON.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        activity.audit("LOG-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000), user.id(), name, action, json);
    }

    private static String notificationId() {
        return "NOTIF-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    static ApiException requestNotFound() {
        return ApiException.notFound("REQUEST_NOT_FOUND", "ही रक्त मागणी सापडली नाही (Blood request not found).");
    }

    /** A donor as a viewer may see it: no member id; the phone only for logged-in viewers. */
    static Map<String, Object> donorJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("id", row.get("id"));
        for (String k : new String[] {"name", "blood_group", "city", "district"}) d.put(k, text(row.get(k)));
        boolean eligible = Boolean.TRUE.equals(row.get("eligible"));
        d.put("available", Boolean.TRUE.equals(row.get("available")) && eligible && !Boolean.TRUE.equals(row.get("hidden")));
        d.put("can_donate_from", date(row.get("can_donate_from")));
        d.put("mine", viewer != null && viewer.id().equals(row.get("member_id")));
        if (viewer != null) d.put("phone", text(row.get("phone")));
        return d;
    }

    /** The owner's own profile: the public fields plus the stored switch and the last donation date. */
    static Map<String, Object> ownDonorJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> d = donorJson(row, viewer);
        d.put("available_setting", Boolean.TRUE.equals(row.get("available")));
        d.put("last_donated", date(row.get("last_donated")));
        d.put("hidden", Boolean.TRUE.equals(row.get("hidden")));
        return d;
    }

    /** A YYYY-MM-DD date that is not in the future, or null when empty. */
    static LocalDate lastDonated(Object value) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        String s = text(value);
        try {
            if (s.matches("\\d{4}-\\d{2}-\\d{2}")) {
                LocalDate date = LocalDate.parse(s);
                if (!date.isAfter(LocalDate.now())) return date;
            }
        } catch (DateTimeParseException ignored) {
            // falls through to the error below
        }
        throw ApiException.badRequest("VALIDATION_ERROR",
            "शेवटच्या रक्तदानाची तारीख YYYY-MM-DD स्वरूपात, आजची किंवा आधीची असावी (lastDonated must be a YYYY-MM-DD date, not in the future).");
    }

    /** prefix + milliseconds + 4 random characters, so two saves in the same millisecond never share an id. */
    static String newId(String prefix, java.util.function.Predicate<String> taken) {
        String id;
        do {
            id = prefix + System.currentTimeMillis() + Ids.base36(4);
        } while (taken.test(id));
        return id;
    }

    static boolean isAdmin(CurrentUser user) {
        return user != null && Roles.isAdmin(user);
    }

    static String date(Object value) {
        return value == null ? null : value.toString().substring(0, 10);
    }

    /** A timestamp as ISO-8601 text (UTC). */
    static String iso(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Timestamp t) return t.toInstant().toString();
        if (value instanceof OffsetDateTime o) return o.toInstant().toString();
        return value.toString();
    }

    static String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    static Map<String, Object> listResult(String key, List<Map<String, Object>> list) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put(key, list);
        return out;
    }

    static ApiException donorNotFound() {
        return ApiException.notFound("DONOR_NOT_FOUND", "रक्तदाता प्रोफाइल सापडले नाही (Donor profile not found).");
    }
}
