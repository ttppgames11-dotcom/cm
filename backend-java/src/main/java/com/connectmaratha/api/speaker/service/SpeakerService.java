package com.connectmaratha.api.speaker.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.exception.ValidationException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.connectmaratha.api.speaker.dto.SpeakerSchemas;
import com.connectmaratha.api.speaker.repository.SpeakerRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Speakers and mentors (वक्ते व मार्गदर्शक): members apply and an admin approves before a profile is public; admins
 * can also add speakers without an account. A speaker's phone is never in the public list.
 */
@Service
public class SpeakerService {

    private static final Logger log = LoggerFactory.getLogger(SpeakerService.class);

    private final SpeakerRepository speakers;
    private final ActivityRepository activity;
    private final LazyTables tables;
    private final TransactionTemplate ownTransaction;

    public SpeakerService(SpeakerRepository speakers, ActivityRepository activity, LazyTables tables,
                          PlatformTransactionManager transactions) {
        this.speakers = speakers;
        this.activity = activity;
        this.tables = tables;
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    void ensure() {
        tables.ensureSpeakerTables();
    }

    // ------------------------------------------------------------------ profiles

    /** Approved, visible speakers, newest first; "सर्व वक्ते" / empty mean no filter. */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser viewer, String category, String city, String search) {
        ensure();
        String categoryFilter = blank(category) || "सर्व वक्ते".equals(category.trim()) ? null : category;
        String cityFilter = blank(city) ? null : city;
        String searchFilter = blank(search) ? null : search;
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : speakers.publicList(categoryFilter, cityFilter, searchFilter, viewerId(viewer))) {
            list.add(speakerJson(row, viewer));
        }
        return listResult("speakers", list);
    }

    /** My profile in any state, or null. */
    @Transactional(readOnly = true)
    public Map<String, Object> mine(CurrentUser user) {
        ensure();
        Map<String, Object> out = success(null);
        out.put("speaker", speakers.ofMember(user.id()).map(SpeakerService::ownJson).orElse(null));
        return out;
    }

    /** A member's application: one profile each, waiting for an admin. */
    public Map<String, Object> apply(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = validProfile(body);
        if (speakers.ofMember(user.id()).isPresent()) throw speakerExists();
        String id = newId("SPK-", speakers::exists);
        if (speakers.insert(id, user.id(), input, "pending") == 0) throw speakerExists();
        Map<String, Object> out = success("अर्ज मिळाला! मंजुरीनंतर प्रोफाइल प्रकाशित होईल. (Application received.)");
        out.put("speaker", ownJson(speakers.find(id).orElseThrow()));
        return out;
    }

    /** New details for my profile; it waits for approval again. */
    public Map<String, Object> editMine(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> mine = speakers.ofMember(user.id()).orElseThrow(SpeakerService::speakerNotFound);
        Map<String, Object> input = validProfile(body);
        speakers.update(text(mine.get("id")), input);
        Map<String, Object> out = success("बदल जतन झाले; प्रोफाइल पुन्हा मंजुरीसाठी पाठवले. (Saved; waiting for approval.)");
        out.put("speaker", ownJson(speakers.find(text(mine.get("id"))).orElseThrow()));
        return out;
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public Map<String, Object> adminAll(CurrentUser user) {
        requireAdmin(user);
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        int pending = 0;
        for (Map<String, Object> row : speakers.all()) {
            list.add(adminJson(row));
            if ("pending".equals(row.get("status"))) pending++;
        }
        Map<String, Object> out = listResult("speakers", list);
        out.put("pending", pending);
        return out;
    }

    /** A speaker added by an admin (with their permission): approved at once, no account needed. */
    public Map<String, Object> adminAdd(CurrentUser user, Map<String, Object> body) {
        requireAdmin(user);
        ensure();
        Map<String, Object> input = validProfile(body);
        String id = newId("SPK-", speakers::exists);
        speakers.insert(id, null, input, "approved");
        Map<String, Object> out = success("वक्ता जोडला. (Speaker added.)");
        out.put("speaker", adminJson(speakers.find(id).orElseThrow()));
        return out;
    }

    /** approve / reject (optional reason) / hide / unhide / link (member id or phone). */
    public Map<String, Object> adminAct(CurrentUser user, String id, Map<String, Object> body) {
        requireAdmin(user);
        ensure();
        Map<String, Object> input = SpeakerSchemas.normalize(body);
        SchemaValidator.check(input, SpeakerSchemas.ADMIN_ACTION, true, null);
        Map<String, Object> speaker = speakers.find(id).orElseThrow(SpeakerService::speakerNotFound);
        String memberId = (String) speaker.get("member_id");
        switch (text(input.get("action"))) {
            case "approve" -> {
                speakers.setStatus(id, "approved", null);
                if (memberId != null) send(id, memberId, "🎙️ तुमचे वक्ता प्रोफाइल प्रकाशित झाले",
                    "आता सदस्य तुम्हाला विनंती पाठवू शकतात.", "speaker");
            }
            case "reject" -> {
                String reason = (String) input.get("reason");
                speakers.setStatus(id, "rejected", reason);
                if (memberId != null) send(id, memberId, "🎙️ वक्ता प्रोफाइल मंजूर झाले नाही",
                    reason != null ? reason : "कृपया माहिती तपासून पुन्हा अर्ज करा.", "speaker");
            }
            case "hide" -> speakers.setHidden(id, true);
            case "unhide" -> speakers.setHidden(id, false);
            case "link" -> link(id, input);
            default -> throw new IllegalStateException("validated above");
        }
        Map<String, Object> out = success("बदल जतन झाला. (Saved.)");
        out.put("speaker", adminJson(speakers.find(id).orElseThrow()));
        return out;
    }

    private void link(String id, Map<String, Object> input) {
        if (!(input.get("member") instanceof String member)) {
            throw ApiException.badRequest("VALIDATION_ERROR", "सदस्य आयडी किंवा मोबाईल नंबर द्या (Give a member id or phone).");
        }
        String memberId = speakers.memberByIdOrPhone(member).orElseThrow(() ->
            ApiException.notFound("MEMBER_NOT_FOUND", "हा सदस्य आढळला नाही (Member not found)."));
        boolean hasOther = speakers.ofMember(memberId).map(s -> !id.equals(s.get("id"))).orElse(false);
        if (hasOther || speakers.link(id, memberId) == 0) throw speakerExists();
    }

    // ------------------------------------------------------------------ helpers

    /** The normalized, validated profile; at least one of talks / guidance. */
    private static Map<String, Object> validProfile(Map<String, Object> body) {
        Map<String, Object> input = SpeakerSchemas.normalize(body);
        SchemaValidator.check(input, SpeakerSchemas.PROFILE, true, null);
        if (!Boolean.TRUE.equals(input.get("offers_talks")) && !Boolean.TRUE.equals(input.get("offers_guidance"))) {
            throw new ValidationException(List.of("व्याख्यान किंवा मार्गदर्शन यापैकी किमान एक निवडा (Offer talks, guidance or both)."));
        }
        return input;
    }

    /** One notification in its own transaction; false (logged) when it fails, which never undoes the action. */
    boolean send(String about, String memberId, String title, String message, String type) {
        try {
            ownTransaction.executeWithoutResult(status -> activity.notifyMember(notificationId(), memberId, title, message, type));
            return true;
        } catch (RuntimeException e) {
            log.warn("Speaker {}: could not notify {}", about, memberId, e);
            return false;
        }
    }

    /** A speaker as anyone may see it: no phone, no member id. */
    static Map<String, Object> speakerJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("id", row.get("id"));
        for (String k : new String[] {"name", "title", "category", "city", "topics", "intro"}) s.put(k, text(row.get(k)));
        s.put("offers_talks", Boolean.TRUE.equals(row.get("offers_talks")));
        s.put("offers_guidance", Boolean.TRUE.equals(row.get("offers_guidance")));
        s.put("mine", viewer != null && Boolean.TRUE.equals(row.get("mine")));
        s.put("requested", viewer != null && Boolean.TRUE.equals(row.get("requested")));
        return s;
    }

    /** The owner's view: the public fields plus phone, status, reason and the hidden flag. */
    static Map<String, Object> ownJson(Map<String, Object> row) {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("id", row.get("id"));
        for (String k : new String[] {"name", "title", "category", "city", "topics", "intro", "phone"}) s.put(k, text(row.get(k)));
        s.put("offers_talks", Boolean.TRUE.equals(row.get("offers_talks")));
        s.put("offers_guidance", Boolean.TRUE.equals(row.get("offers_guidance")));
        s.put("status", text(row.get("status")));
        s.put("reject_reason", row.get("reject_reason"));
        s.put("hidden", Boolean.TRUE.equals(row.get("hidden")));
        s.put("created_at", iso(row.get("created_at")));
        return s;
    }

    /** The admin's view: the owner's view plus whether there is an account, and which. */
    static Map<String, Object> adminJson(Map<String, Object> row) {
        Map<String, Object> s = ownJson(row);
        s.put("has_account", row.get("member_id") != null);
        s.put("member_id", row.get("member_id"));
        return s;
    }

    static void requireAdmin(CurrentUser user) {
        if (!isAdmin(user)) throw ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");
    }

    static boolean isAdmin(CurrentUser user) {
        return user != null && Roles.isAdmin(user);
    }

    static ApiException speakerExists() {
        return new ApiException(HttpStatus.CONFLICT, "SPEAKER_EXISTS", "या सदस्याचे वक्ता प्रोफाइल आधीच आहे (A profile already exists).");
    }

    static ApiException speakerNotFound() {
        return ApiException.notFound("SPEAKER_NOT_FOUND", "वक्ता आढळला नाही (Speaker not found).");
    }

    /** prefix + milliseconds + 4 random characters, so two saves in the same millisecond never share an id. */
    static String newId(String prefix, java.util.function.Predicate<String> taken) {
        String id;
        do {
            id = prefix + System.currentTimeMillis() + Ids.base36(4);
        } while (taken.test(id));
        return id;
    }

    private static String notificationId() {
        return "NOTIF-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    static String viewerId(CurrentUser viewer) {
        return viewer == null ? null : viewer.id();
    }

    static String iso(Object timestamp) {
        if (timestamp instanceof java.sql.Timestamp t) return t.toInstant().toString();
        if (timestamp instanceof OffsetDateTime o) return o.toInstant().toString();
        return timestamp == null ? null : timestamp.toString();
    }

    static boolean blank(String s) {
        return s == null || s.isBlank();
    }

    static String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    static Map<String, Object> success(String message) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        if (message != null) out.put("message", message);
        return out;
    }

    static Map<String, Object> listResult(String key, List<Map<String, Object>> list) {
        Map<String, Object> out = success(null);
        out.put("count", list.size());
        out.put(key, list);
        return out;
    }
}
