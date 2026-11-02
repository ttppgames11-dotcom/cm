package com.connectmaratha.api.officer.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.officer.dto.OfficerSchemas;
import com.connectmaratha.api.officer.repository.OfficerRepository;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
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
 * Officer mentors (सनदी अधिकारी मार्गदर्शक) for MPSC / UPSC students: members apply and an admin approves (after
 * checking the person really is an officer); admins can also add officers without an account. Officers pause new
 * requests with their accepting switch. An officer's phone is never in the public list.
 */
@Service
public class OfficerService {

    private static final Logger log = LoggerFactory.getLogger(OfficerService.class);
    static final int MAX_REQUESTS_PER_DAY = 5;

    private final OfficerRepository officers;
    private final ActivityRepository activity;
    private final LazyTables tables;
    private final TransactionTemplate ownTransaction;

    public OfficerService(OfficerRepository officers, ActivityRepository activity, LazyTables tables,
                          PlatformTransactionManager transactions) {
        this.officers = officers;
        this.activity = activity;
        this.tables = tables;
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    void ensure() {
        tables.ensureOfficerTables();
    }

    // ------------------------------------------------------------------ profiles

    /** Approved, visible officers, newest first; "all" / empty mean no filter. */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser viewer, String exam, String service, String search) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : officers.publicList(filter(exam), filter(service), blank(search) ? null : search, viewerId(viewer))) {
            list.add(officerJson(row, viewer));
        }
        return listResult("officers", list);
    }

    /** My profile in any state, or null. */
    @Transactional(readOnly = true)
    public Map<String, Object> mine(CurrentUser user) {
        ensure();
        Map<String, Object> out = success(null);
        out.put("officer", officers.ofMember(user.id()).map(OfficerService::ownJson).orElse(null));
        return out;
    }

    /** A member's application: one profile each, waiting for an admin. */
    public Map<String, Object> apply(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = validProfile(body);
        if (officers.ofMember(user.id()).isPresent()) throw officerExists();
        String id = newId("OFF-", officers::exists);
        if (officers.insert(id, user.id(), input, examsText(input), "pending") == 0) throw officerExists();
        Map<String, Object> out = success("अर्ज मिळाला! तपासणी व मंजुरीनंतर प्रोफाइल प्रकाशित होईल. (Application received.)");
        out.put("officer", ownJson(officers.find(id).orElseThrow()));
        return out;
    }

    /** New details for my profile; it waits for approval again (the switch is kept). */
    public Map<String, Object> editMine(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> mine = officers.ofMember(user.id()).orElseThrow(OfficerService::officerNotFound);
        Map<String, Object> input = validProfile(body);
        String id = text(mine.get("id"));
        officers.update(id, input, examsText(input));
        Map<String, Object> out = success("बदल जतन झाले; प्रोफाइल पुन्हा मंजुरीसाठी पाठवले. (Saved; waiting for approval.)");
        out.put("officer", ownJson(officers.find(id).orElseThrow()));
        return out;
    }

    /** { accepting }: pause or resume new requests; no re-approval. */
    public Map<String, Object> setAccepting(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = OfficerSchemas.normalize(body);
        SchemaValidator.check(input, OfficerSchemas.ACCEPTING, true, null);
        Map<String, Object> mine = officers.ofMember(user.id()).orElseThrow(OfficerService::officerNotFound);
        boolean accepting = Boolean.TRUE.equals(input.get("accepting"));
        officers.setAccepting(text(mine.get("id")), accepting);
        Map<String, Object> out = success(accepting ? "आता विनंत्या स्वीकारल्या जातील. (Accepting requests.)"
                                                    : "नवीन विनंत्या थांबवल्या. (Requests paused.)");
        out.put("officer", ownJson(officers.find(text(mine.get("id"))).orElseThrow()));
        return out;
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public Map<String, Object> adminAll(CurrentUser user) {
        requireAdmin(user);
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        int pending = 0;
        for (Map<String, Object> row : officers.all()) {
            list.add(adminJson(row));
            if ("pending".equals(row.get("status"))) pending++;
        }
        Map<String, Object> out = listResult("officers", list);
        out.put("pending", pending);
        return out;
    }

    /** An officer added by an admin (with their permission): approved at once, no account needed. */
    public Map<String, Object> adminAdd(CurrentUser user, Map<String, Object> body) {
        requireAdmin(user);
        ensure();
        Map<String, Object> input = validProfile(body);
        String id = newId("OFF-", officers::exists);
        officers.insert(id, null, input, examsText(input), "approved");
        Map<String, Object> out = success("अधिकारी जोडले. (Officer added.)");
        out.put("officer", adminJson(officers.find(id).orElseThrow()));
        return out;
    }

    /** approve / reject (optional reason) / hide / unhide / link (member id or phone) / pause / resume. */
    public Map<String, Object> adminAct(CurrentUser user, String id, Map<String, Object> body) {
        requireAdmin(user);
        ensure();
        Map<String, Object> input = OfficerSchemas.normalize(body);
        SchemaValidator.check(input, OfficerSchemas.ADMIN_ACTION, true, null);
        Map<String, Object> officer = officers.find(id).orElseThrow(OfficerService::officerNotFound);
        String memberId = (String) officer.get("member_id");
        switch (text(input.get("action"))) {
            case "approve" -> {
                officers.setStatus(id, "approved", null);
                if (memberId != null) send(id, memberId, "⭐ तुमचे अधिकारी-मार्गदर्शक प्रोफाइल प्रकाशित झाले",
                    "आता विद्यार्थी तुम्हाला मार्गदर्शनासाठी विनंती पाठवू शकतात.", "officer");
            }
            case "reject" -> {
                String reason = (String) input.get("reason");
                officers.setStatus(id, "rejected", reason);
                if (memberId != null) send(id, memberId, "⭐ अधिकारी प्रोफाइल मंजूर झाले नाही",
                    reason != null ? reason : "कृपया माहिती तपासून पुन्हा अर्ज करा.", "officer");
            }
            case "hide" -> officers.setHidden(id, true);
            case "unhide" -> officers.setHidden(id, false);
            case "pause" -> officers.setAccepting(id, false);
            case "resume" -> officers.setAccepting(id, true);
            case "link" -> link(id, input);
            default -> throw new IllegalStateException("validated above");
        }
        Map<String, Object> out = success("बदल जतन झाला. (Saved.)");
        out.put("officer", adminJson(officers.find(id).orElseThrow()));
        return out;
    }

    private void link(String id, Map<String, Object> input) {
        if (!(input.get("member") instanceof String member)) {
            throw ApiException.badRequest("VALIDATION_ERROR", "सदस्य आयडी किंवा मोबाईल नंबर द्या (Give a member id or phone).");
        }
        List<String> found = officers.membersByIdOrPhone(member);
        if (found.isEmpty()) throw ApiException.notFound("MEMBER_NOT_FOUND", "हा सदस्य आढळला नाही (Member not found).");
        if (found.size() > 1) {
            throw new ApiException(HttpStatus.CONFLICT, "MEMBER_AMBIGUOUS",
                "हा मोबाईल नंबर एकापेक्षा जास्त सदस्यांचा आहे; सदस्य आयडी द्या (Several members share this phone; give the member id).");
        }
        String memberId = found.get(0);
        boolean hasOther = officers.ofMember(memberId).map(o -> !id.equals(o.get("id"))).orElse(false);
        if (hasOther || officers.link(id, memberId) == 0) throw officerExists();
    }

    // ------------------------------------------------------------------ requests

    /**
     * A guidance request to an approved, visible, accepting officer for one of their exams (5 per member per 24 hours,
     * one open per officer). Saved first; then the officer, or every admin when the officer has no account, is told.
     */
    public Map<String, Object> sendRequest(CurrentUser user, String officerId, Map<String, Object> body) {
        ensure();
        Map<String, Object> officer = officers.find(officerId)
            .filter(o -> "approved".equals(o.get("status")) && !Boolean.TRUE.equals(o.get("hidden")))
            .orElseThrow(OfficerService::officerNotFound);
        String officerMember = (String) officer.get("member_id");
        if (user.id().equals(officerMember)) {
            throw ApiException.badRequest("OWN_PROFILE", "स्वतःला विनंती पाठवता येत नाही (You cannot request yourself).");
        }
        if (!Boolean.TRUE.equals(officer.get("accepting"))) {
            throw new ApiException(HttpStatus.CONFLICT, "NOT_ACCEPTING",
                "हे अधिकारी सध्या विनंत्या घेत नाहीत (This officer is not taking requests right now).");
        }
        Map<String, Object> input = OfficerSchemas.normalize(body);
        SchemaValidator.check(input, OfficerSchemas.REQUEST, true, null);
        // only the checked fields of a request are saved; anything else in the body is dropped
        input.keySet().retainAll(OfficerSchemas.REQUEST.keySet());
        String exam = text(input.get("exam"));
        if (!exams(officer.get("exams")).contains(exam)) {
            throw ApiException.badRequest("EXAM_NOT_OFFERED",
                "हे अधिकारी या परीक्षेसाठी मार्गदर्शन करत नाहीत (This officer does not guide for this exam).");
        }
        if (officers.recentRequests(user.id()) >= MAX_REQUESTS_PER_DAY) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "२४ तासांत जास्तीत जास्त ५ विनंत्या पाठवता येतात (At most 5 requests in 24 hours).");
        }
        String id = newId("ORQ-", officers::existsRequest);
        if (officers.insertRequest(id, officerId, user.id(), input) == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "REQUEST_EXISTS",
                "या अधिकाऱ्यांना तुमची विनंती आधीच पाठवली आहे (You already have an open request).");
        }
        Map<String, Object> row = officers.findRequest(id).orElseThrow();

        String student = orElse(row.get("student_name"), "सदस्य");
        String question = text(row.get("question"));
        if (officerMember != null) {
            send(id, officerMember, "🧭 नवीन मार्गदर्शन विनंती: " + OfficerSchemas.EXAM_LABELS.getOrDefault(exam, exam),
                student + ": " + shortened(question), "officer_request");
        } else {
            String title = "⭐ " + text(officer.get("name")) + " साठी नवीन मार्गदर्शन विनंती";
            String message = student + ": " + shortened(question) + ". अधिकाऱ्यांना फोन करून उत्तर द्या.";
            try {
                for (String adminId : officers.adminIds()) {
                    if (!adminId.equals(user.id())) send(id, adminId, title, message, "officer_admin");
                }
            } catch (RuntimeException e) {
                // the request is already saved: a failed admin lookup must not turn it into an error
                log.warn("Officer request {}: could not look up admins", id, e);
            }
        }
        Map<String, Object> out = success("विनंती पाठवली! उत्तर आल्यावर सूचना मिळेल. (Request sent.)");
        out.put("request", sentJson(row));
        return out;
    }

    /** Requests I sent, newest first; the officer's phone only once accepted. */
    @Transactional(readOnly = true)
    public Map<String, Object> myRequests(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : officers.requestsBy(user.id())) list.add(sentJson(row));
        return listResult("requests", list);
    }

    /** Requests to my profile, newest first, with the student's name and phone. */
    @Transactional(readOnly = true)
    public Map<String, Object> incoming(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        officers.ofMember(user.id()).ifPresent(mine -> {
            for (Map<String, Object> row : officers.requestsTo(text(mine.get("id")))) list.add(receivedJson(row, false));
        });
        return listResult("requests", list);
    }

    /** Requests to officers without an account, which admins answer after phoning the officer. */
    @Transactional(readOnly = true)
    public Map<String, Object> adminRequests(CurrentUser user) {
        requireAdmin(user);
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : officers.requestsForUnlinked()) list.add(receivedJson(row, true));
        return listResult("requests", list);
    }

    /**
     * accept / decline (the officer, or an admin when the officer has no account) or cancel (the student), only while
     * the request is open, whatever the officer's status or switch; the student is told about an accept or decline.
     */
    public Map<String, Object> answer(CurrentUser user, String requestId, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = OfficerSchemas.normalize(body);
        SchemaValidator.check(input, OfficerSchemas.ANSWER, true, null);
        String action = text(input.get("action"));
        Map<String, Object> row = officers.findRequest(requestId).orElseThrow(() ->
            ApiException.notFound("REQUEST_NOT_FOUND", "विनंती आढळली नाही (Request not found)."));
        String officerMember = (String) row.get("officer_member_id");
        boolean allowed = "cancel".equals(action)
            ? user.id().equals(row.get("member_id"))
            : officerMember != null ? user.id().equals(officerMember) : isAdmin(user);
        if (!allowed) throw ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");

        String status = switch (action) {
            case "accept" -> "accepted";
            case "decline" -> "declined";
            default -> "cancelled";
        };
        if (officers.answer(requestId, status) == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_ANSWERED", "या विनंतीला आधीच उत्तर दिले आहे (Already answered).");
        }
        String officerName = text(row.get("officer_name"));
        String student = text(row.get("member_id"));
        if ("accepted".equals(status)) {
            send(requestId, student, "✅ " + officerName + " यांनी तुमची विनंती स्वीकारली",
                "संपर्क क्रमांक 'माझ्या विनंत्या' मध्ये पहा.", "officer_reply");
        } else if ("declined".equals(status)) {
            send(requestId, student, "❌ " + officerName + " यांनी तुमची विनंती नाकारली",
                "'माझ्या विनंत्या' मध्ये पहा.", "officer_reply");
        }
        Map<String, Object> out = success("उत्तर जतन झाले. (Saved.)");
        out.put("request", requestFields(officers.findRequest(requestId).orElseThrow()));
        return out;
    }

    /** The first 80 characters of a question, with "…" when it was longer (for a notification). */
    static String shortened(String question) {
        return question.length() <= 80 ? question : question.substring(0, 80) + "…";
    }

    static Map<String, Object> requestFields(Map<String, Object> row) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", row.get("id"));
        for (String k : new String[] {"exam", "stage", "question", "mode", "message", "status"}) r.put(k, text(row.get(k)));
        r.put("created_at", iso(row.get("created_at")));
        return r;
    }

    /** For the student: the officer's name, and their phone only once the request is accepted. */
    static Map<String, Object> sentJson(Map<String, Object> row) {
        Map<String, Object> r = requestFields(row);
        Map<String, Object> officer = new LinkedHashMap<>();
        officer.put("id", row.get("officer_id"));
        officer.put("name", text(row.get("officer_name")));
        if ("accepted".equals(row.get("status"))) officer.put("phone", text(row.get("officer_phone")));
        r.put("officer", officer);
        return r;
    }

    /** For the officer (or the admins, who also see the officer's phone): who is asking, with their name and phone. */
    static Map<String, Object> receivedJson(Map<String, Object> row, boolean forAdmin) {
        Map<String, Object> r = requestFields(row);
        Map<String, Object> officer = new LinkedHashMap<>();
        officer.put("id", row.get("officer_id"));
        officer.put("name", text(row.get("officer_name")));
        if (forAdmin) officer.put("phone", text(row.get("officer_phone")));
        r.put("officer", officer);
        Map<String, Object> student = new LinkedHashMap<>();
        student.put("name", orElse(row.get("student_name"), "सदस्य"));
        student.put("phone", text(row.get("student_phone")));
        r.put("student", student);
        return r;
    }

    // ------------------------------------------------------------------ helpers

    /** The normalized, validated profile (exams de-duplicated and sorted by normalize). */
    private static Map<String, Object> validProfile(Map<String, Object> body) {
        Map<String, Object> input = OfficerSchemas.normalize(body);
        SchemaValidator.check(input, OfficerSchemas.profile(), true, null);
        return input;
    }

    @SuppressWarnings("unchecked")
    private static String examsText(Map<String, Object> input) {
        return String.join(",", (List<String>) input.get("exams"));
    }

    /** One notification in its own transaction; false (logged) when it fails, which never undoes the action. */
    boolean send(String about, String memberId, String title, String message, String type) {
        try {
            ownTransaction.executeWithoutResult(status -> activity.notifyMember(notificationId(), memberId, title, message, type));
            return true;
        } catch (RuntimeException e) {
            log.warn("Officer {}: could not notify {}", about, memberId, e);
            return false;
        }
    }

    private static final String[] PUBLIC_FIELDS = {"name", "service", "service_status", "post", "department", "city", "intro"};

    /** An officer as anyone may see it: no phone, no member id. */
    static Map<String, Object> officerJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", row.get("id"));
        for (String k : PUBLIC_FIELDS) o.put(k, text(row.get(k)));
        o.put("batch_year", row.get("batch_year"));
        o.put("exams", exams(row.get("exams")));
        o.put("accepting", Boolean.TRUE.equals(row.get("accepting")));
        o.put("mine", viewer != null && Boolean.TRUE.equals(row.get("mine")));
        o.put("requested", viewer != null && Boolean.TRUE.equals(row.get("requested")));
        return o;
    }

    /** The owner's view: the public fields plus phone, status, reason and the hidden flag. */
    static Map<String, Object> ownJson(Map<String, Object> row) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", row.get("id"));
        for (String k : PUBLIC_FIELDS) o.put(k, text(row.get(k)));
        o.put("batch_year", row.get("batch_year"));
        o.put("exams", exams(row.get("exams")));
        o.put("phone", text(row.get("phone")));
        o.put("accepting", Boolean.TRUE.equals(row.get("accepting")));
        o.put("status", text(row.get("status")));
        o.put("reject_reason", row.get("reject_reason"));
        o.put("hidden", Boolean.TRUE.equals(row.get("hidden")));
        o.put("created_at", iso(row.get("created_at")));
        return o;
    }

    /** The admin's view: the owner's view plus whether there is an account, and which. */
    static Map<String, Object> adminJson(Map<String, Object> row) {
        Map<String, Object> o = ownJson(row);
        o.put("has_account", row.get("member_id") != null);
        o.put("member_id", row.get("member_id"));
        return o;
    }

    static List<String> exams(Object stored) {
        String s = text(stored);
        return s.isEmpty() ? List.of() : Arrays.asList(s.split(","));
    }

    static void requireAdmin(CurrentUser user) {
        if (!isAdmin(user)) throw ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");
    }

    static boolean isAdmin(CurrentUser user) {
        return user != null && Roles.isAdmin(user);
    }

    static ApiException officerExists() {
        return new ApiException(HttpStatus.CONFLICT, "OFFICER_EXISTS", "या सदस्याचे अधिकारी प्रोफाइल आधीच आहे (A profile already exists).");
    }

    static ApiException officerNotFound() {
        return ApiException.notFound("OFFICER_NOT_FOUND", "अधिकारी आढळले नाहीत (Officer not found).");
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

    /** A filter value, or null for empty / "all" / "सर्व". */
    static String filter(String value) {
        if (blank(value)) return null;
        String v = value.trim();
        return "all".equalsIgnoreCase(v) || "सर्व".equals(v) ? null : v;
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
