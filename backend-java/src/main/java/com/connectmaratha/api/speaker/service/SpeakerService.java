package com.connectmaratha.api.speaker.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.exception.ValidationException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.validation.Rule;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.connectmaratha.api.speaker.dto.SpeakerSchemas;
import com.connectmaratha.api.speaker.repository.SpeakerRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
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
    private static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");
    static final int MAX_REQUESTS_PER_DAY = 5;

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
        List<String> found = speakers.membersByIdOrPhone(member);
        if (found.isEmpty()) throw ApiException.notFound("MEMBER_NOT_FOUND", "हा सदस्य आढळला नाही (Member not found).");
        if (found.size() > 1) {
            throw new ApiException(HttpStatus.CONFLICT, "MEMBER_AMBIGUOUS",
                "हा मोबाईल नंबर एकापेक्षा जास्त सदस्यांचा आहे; सदस्य आयडी द्या (Several members share this phone; give the member id).");
        }
        String memberId = found.get(0);
        boolean hasOther = speakers.ofMember(memberId).map(s -> !id.equals(s.get("id"))).orElse(false);
        if (hasOther || speakers.link(id, memberId) == 0) throw speakerExists();
    }

    // ------------------------------------------------------------------ requests

    /**
     * A talk or guidance request to an approved, visible speaker (5 per member per 24 hours, one open per speaker).
     * Saved first; then the speaker, or every admin when the speaker has no account, is told.
     */
    public Map<String, Object> sendRequest(CurrentUser user, String speakerId, Map<String, Object> body) {
        ensure();
        Map<String, Object> speaker = speakers.find(speakerId)
            .filter(s -> "approved".equals(s.get("status")) && !Boolean.TRUE.equals(s.get("hidden")))
            .orElseThrow(SpeakerService::speakerNotFound);
        String speakerMember = (String) speaker.get("member_id");
        if (user.id().equals(speakerMember)) {
            throw ApiException.badRequest("OWN_PROFILE", "स्वतःला विनंती पाठवता येत नाही (You cannot request yourself).");
        }
        Map<String, Object> input = validRequest(speaker, body);
        if (speakers.recentRequests(user.id()) >= MAX_REQUESTS_PER_DAY) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "२४ तासांत जास्तीत जास्त ५ विनंत्या पाठवता येतात (At most 5 requests in 24 hours).");
        }
        String id = newId("SRQ-", speakers::existsRequest);
        if (speakers.insertRequest(id, speakerId, user.id(), input) == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "REQUEST_EXISTS",
                "या वक्त्यांना तुमची विनंती आधीच पाठवली आहे (You already have an open request).");
        }
        Map<String, Object> row = speakers.findRequest(id).orElseThrow();

        boolean talk = "talk".equals(row.get("kind"));
        String organiser = orElse(row.get("organiser_name"), "सदस्य");
        String detail = talk ? organiser + ": " + text(row.get("place")) + ", " + text(row.get("event_date"))
                             : organiser + ": " + text(row.get("topic"));
        if (speakerMember != null) {
            send(id, speakerMember, talk ? "🎙️ नवीन विनंती: व्याख्यान" : "🧭 नवीन विनंती: मार्गदर्शन", detail, "speaker_request");
        } else {
            String title = "🎙️ " + text(speaker.get("name")) + " साठी नवीन विनंती";
            String message = detail + ". वक्त्यांना फोन करून उत्तर द्या.";
            try {
                for (String adminId : speakers.adminIds()) {
                    if (!adminId.equals(user.id())) send(id, adminId, title, message, "speaker_admin");
                }
            } catch (RuntimeException e) {
                // the request is already saved: a failed admin lookup must not turn it into an error
                log.warn("Speaker request {}: could not look up admins", id, e);
            }
        }
        Map<String, Object> out = success("विनंती पाठवली! उत्तर आल्यावर सूचना मिळेल. (Request sent.)");
        out.put("request", sentJson(row));
        return out;
    }

    /** Requests I sent, newest first; the speaker's phone only once accepted. */
    @Transactional(readOnly = true)
    public Map<String, Object> myRequests(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : speakers.requestsBy(user.id())) list.add(sentJson(row));
        return listResult("requests", list);
    }

    /** Requests to my profile, newest first, with the organiser's name and phone. */
    @Transactional(readOnly = true)
    public Map<String, Object> incoming(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        speakers.ofMember(user.id()).ifPresent(mine -> {
            for (Map<String, Object> row : speakers.requestsTo(text(mine.get("id")))) list.add(receivedJson(row));
        });
        return listResult("requests", list);
    }

    /** Requests to speakers without an account, which admins answer after phoning the speaker. */
    @Transactional(readOnly = true)
    public Map<String, Object> adminRequests(CurrentUser user) {
        requireAdmin(user);
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : speakers.requestsForUnlinked()) {
            Map<String, Object> r = receivedJson(row);
            @SuppressWarnings("unchecked")
            Map<String, Object> speaker = (Map<String, Object>) r.get("speaker");
            speaker.put("phone", text(row.get("speaker_phone")));
            list.add(r);
        }
        return listResult("requests", list);
    }

    /**
     * accept / decline (the speaker, or an admin when the speaker has no account) or cancel (the organiser), only
     * while the request is open; the organiser is told about an accept or decline.
     */
    public Map<String, Object> answer(CurrentUser user, String requestId, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = SpeakerSchemas.normalize(body);
        SchemaValidator.check(input, SpeakerSchemas.ANSWER, true, null);
        String action = text(input.get("action"));
        Map<String, Object> row = speakers.findRequest(requestId).orElseThrow(() ->
            ApiException.notFound("REQUEST_NOT_FOUND", "विनंती आढळली नाही (Request not found)."));
        String speakerMember = (String) row.get("speaker_member_id");
        boolean allowed = "cancel".equals(action)
            ? user.id().equals(row.get("member_id"))
            : speakerMember != null ? user.id().equals(speakerMember) : isAdmin(user);
        if (!allowed) throw ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");

        String status = switch (action) {
            case "accept" -> "accepted";
            case "decline" -> "declined";
            default -> "cancelled";
        };
        if (speakers.answer(requestId, status) == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_ANSWERED", "या विनंतीला आधीच उत्तर दिले आहे (Already answered).");
        }
        String speakerName = text(row.get("speaker_name"));
        String organiser = text(row.get("member_id"));
        if ("accepted".equals(status)) {
            send(requestId, organiser, "✅ " + speakerName + " यांनी तुमची विनंती स्वीकारली",
                "संपर्क क्रमांक 'माझ्या विनंत्या' मध्ये पहा.", "speaker_reply");
        } else if ("declined".equals(status)) {
            send(requestId, organiser, "❌ " + speakerName + " यांनी तुमची विनंती नाकारली",
                "'माझ्या विनंत्या' मध्ये पहा.", "speaker_reply");
        }
        Map<String, Object> out = success("उत्तर जतन झाले. (Saved.)");
        out.put("request", requestFields(speakers.findRequest(requestId).orElseThrow()));
        return out;
    }

    /** The kind's fields, validated; the speaker must offer that kind and a talk's date must not be past. */
    private static Map<String, Object> validRequest(Map<String, Object> speaker, Map<String, Object> body) {
        Map<String, Object> input = SpeakerSchemas.normalize(body);
        SchemaValidator.check(input, SpeakerSchemas.KIND, true, null);
        boolean talk = "talk".equals(input.get("kind"));
        if (!Boolean.TRUE.equals(speaker.get(talk ? "offers_talks" : "offers_guidance"))) {
            throw ApiException.badRequest("KIND_NOT_OFFERED", talk
                ? "हे वक्ते व्याख्यानासाठी उपलब्ध नाहीत (This speaker does not give talks)."
                : "हे वक्ते मार्गदर्शनासाठी उपलब्ध नाहीत (This speaker does not give guidance).");
        }
        Map<String, Rule> schema = talk ? SpeakerSchemas.TALK : SpeakerSchemas.GUIDANCE;
        SchemaValidator.check(input, schema, true, null);
        // only the checked fields of this kind are saved; anything else in the body is dropped
        input.keySet().retainAll(schema.keySet());
        if (talk) {
            LocalDate date;
            try {
                date = LocalDate.parse(text(input.get("event_date")));
            } catch (DateTimeParseException e) {
                throw new ValidationException(List.of("तारीख चुकीची आहे (Invalid date)."));
            }
            if (date.isBefore(LocalDate.now(INDIA))) {
                throw new ValidationException(List.of("कार्यक्रमाची तारीख आज किंवा पुढची असावी (The date must be today or later)."));
            }
        }
        return input;
    }

    /** The request's own fields (only the ones of its kind). */
    static Map<String, Object> requestFields(Map<String, Object> row) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", row.get("id"));
        r.put("kind", text(row.get("kind")));
        if ("talk".equals(row.get("kind"))) {
            r.put("event_date", row.get("event_date") == null ? null : row.get("event_date").toString());
            r.put("place", text(row.get("place")));
            r.put("event_type", text(row.get("event_type")));
            r.put("audience", row.get("audience"));
        } else {
            r.put("topic", text(row.get("topic")));
            r.put("mode", text(row.get("mode")));
        }
        r.put("message", text(row.get("message")));
        r.put("status", text(row.get("status")));
        r.put("created_at", iso(row.get("created_at")));
        return r;
    }

    /** For the organiser: the speaker's name, and their phone only once the request is accepted. */
    static Map<String, Object> sentJson(Map<String, Object> row) {
        Map<String, Object> r = requestFields(row);
        Map<String, Object> speaker = new LinkedHashMap<>();
        speaker.put("id", row.get("speaker_id"));
        speaker.put("name", text(row.get("speaker_name")));
        if ("accepted".equals(row.get("status"))) speaker.put("phone", text(row.get("speaker_phone")));
        r.put("speaker", speaker);
        return r;
    }

    /** For the speaker (or the admins): who is asking, with their name and phone. */
    static Map<String, Object> receivedJson(Map<String, Object> row) {
        Map<String, Object> r = requestFields(row);
        Map<String, Object> speaker = new LinkedHashMap<>();
        speaker.put("id", row.get("speaker_id"));
        speaker.put("name", text(row.get("speaker_name")));
        r.put("speaker", speaker);
        Map<String, Object> organiser = new LinkedHashMap<>();
        organiser.put("name", orElse(row.get("organiser_name"), "सदस्य"));
        organiser.put("phone", text(row.get("organiser_phone")));
        r.put("organiser", organiser);
        return r;
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

    static String orElse(Object value, String fallback) {
        String s = text(value);
        return s.isEmpty() ? fallback : s;
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
