package com.connectmaratha.api.blood.service;

import com.connectmaratha.api.blood.dto.BloodSchemas;
import com.connectmaratha.api.blood.repository.BloodRepository;
import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.validation.SchemaValidator;
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

    private final BloodRepository blood;
    private final LazyTables tables;
    private final TransactionTemplate ownTransaction;
    private final AtomicBoolean oldEntriesCopied = new AtomicBoolean();

    public BloodService(BloodRepository blood, LazyTables tables, PlatformTransactionManager transactions) {
        this.blood = blood;
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
