package com.connectmaratha.api.sangam.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import com.connectmaratha.api.sangam.dto.ChapterSchemas;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.connectmaratha.api.sangam.repository.ChapterRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business Sangam chapters (a new feature; Node has none). Admins create and edit chapters and name a coordinator;
 * business owners ask to join with one business; the coordinator or an admin decides. Every number is counted
 * from real seats.
 */
@Service
public class ChapterService {

    private static final ObjectMapper JSON = new ObjectMapper();
    static final String OPEN = "open";
    static final String CLOSED = "closed";
    static final String WAITING = "waiting";
    static final String APPROVED = "approved";
    static final int MAX_SEATS = 200;
    private static final String[] FIELDS = {"name", "city", "district", "area", "meetingDay", "meetingTime", "venue", "coordinatorId"};

    private final ChapterRepository chapters;
    private final MemberRepository members;
    private final ActivityRepository activity;
    private final LazyTables tables;
    private final ChapterLimiter limiter;

    public ChapterService(ChapterRepository chapters, MemberRepository members, ActivityRepository activity, LazyTables tables,
                          ChapterLimiter limiter) {
        this.chapters = chapters;
        this.members = members;
        this.activity = activity;
        this.tables = tables;
        this.limiter = limiter;
    }

    // ------------------------------------------------------------------ public

    /** Open chapters with public details and real counts: no member ids, phones or business names. */
    @Transactional(readOnly = true)
    public Map<String, Object> publicList() {
        tables.ensureChapterTables();
        Map<String, List<Map<String, Object>>> cats = chapters.categories();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : chapters.openChapters()) {
            Map<String, Object> c = details(row);
            c.put("businesses", count(row.get("businesses")));
            Integer max = maxOf(row);
            c.put("open_seats", max == null ? null : Math.max(0, max - count(row.get("approved"))));
            c.put("categories", cats.getOrDefault(text(row.get("id")), List.of()));
            list.add(c);
        }
        return listResult("chapters", list);
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public Map<String, Object> adminList(CurrentUser user) {
        requireAdmin(user);
        tables.ensureChapterTables();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : chapters.allChapters()) list.add(adminJson(row));
        return listResult("chapters", list);
    }

    @Transactional
    public Map<String, Object> create(CurrentUser user, Map<String, Object> body) {
        requireAdmin(user);
        tables.ensureChapterTables();
        Map<String, Object> fields = validChapter(ChapterSchemas.normalize(body));
        String id = Ids.millis("CH", chapters::existsChapter);
        chapters.insertChapter(id, fields, now());
        audit(user, "CHAPTER_CREATE", Map.of("chapterId", id));
        return chapterResult("चॅप्टर तयार झाला! (Chapter created.)", id);
    }

    /** Edits a chapter; fields left out keep their value. status open/closed closes or reopens it. */
    @Transactional
    public Map<String, Object> update(CurrentUser user, String id, Map<String, Object> body) {
        requireAdmin(user);
        tables.ensureChapterTables();
        Map<String, Object> row = chapters.findChapter(id).orElseThrow(ChapterService::chapterNotFound);
        Map<String, Object> input = ChapterSchemas.normalize(body);
        SchemaValidator.check(input, ChapterSchemas.STATUS, true, null);

        Map<String, Object> merged = new LinkedHashMap<>();
        for (String f : FIELDS) merged.put(f, row.get(column(f)));
        merged.put("maxSeats", row.get("max_seats"));
        for (String f : FIELDS) if (input.containsKey(f)) merged.put(f, input.get(f));
        if (input.containsKey("maxSeats")) merged.put("maxSeats", input.get("maxSeats"));
        Map<String, Object> fields = validChapter(merged);

        String oldStatus = text(row.get("status"));
        String status = input.get("status") == null ? oldStatus : text(input.get("status"));
        chapters.updateChapter(id, fields, status, now());
        if (status.equals(CLOSED) && !oldStatus.equals(CLOSED)) {
            for (String memberId : chapters.declineWaiting(id, user.id(), now())) {
                activity.notifyMember(notificationId(), memberId, "चॅप्टर बंद झाला (Chapter closed)",
                    "\"" + text(fields.get("name")) + "\" चॅप्टर बंद झाल्याने आपली विनंती नाकारली गेली (The chapter was closed, so your request was declined).", "chapter");
            }
        }
        String action = status.equals(oldStatus) ? "CHAPTER_UPDATE" : status.equals(CLOSED) ? "CHAPTER_CLOSE" : "CHAPTER_REOPEN";
        audit(user, action, Map.of("chapterId", id));
        return chapterResult("चॅप्टर जतन झाला (Chapter saved.)", id);
    }

    // ------------------------------------------------------------------ members

    /** The approved visible businesses of an open chapter (a closed one only for its coordinator and admins). */
    @Transactional(readOnly = true)
    public Map<String, Object> businesses(CurrentUser user, String chapterId) {
        tables.ensureChapterTables();
        Map<String, Object> chapter = chapters.findChapter(chapterId).orElseThrow(ChapterService::chapterNotFound);
        if (text(chapter.get("status")).equals(CLOSED) && !mayDecide(user, chapter)) throw chapterNotFound();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : chapters.chapterBusinesses(chapterId)) {
            Map<String, Object> b = new LinkedHashMap<>();
            for (String k : new String[] {"business_id", "name", "cat", "city", "owner_id", "owner"}) b.put(k, text(row.get(k)));
            list.add(b);
        }
        return listResult("businesses", list);
    }

    /** The caller's own seats (every status) and the chapters they coordinate. */
    @Transactional(readOnly = true)
    public Map<String, Object> mine(CurrentUser user) {
        tables.ensureChapterTables();
        List<Map<String, Object>> seats = new ArrayList<>();
        for (Map<String, Object> row : chapters.seatsOfMember(user.id())) {
            Map<String, Object> s = seatJson(row);
            s.put("chapter_name", text(row.get("chapter_name")));
            s.put("business_name", text(row.get("business_name")));
            seats.add(s);
        }
        List<Map<String, Object>> coordinating = new ArrayList<>();
        for (Map<String, Object> row : chapters.coordinatedBy(user.id())) {
            Map<String, Object> c = new LinkedHashMap<>();
            c.put("id", row.get("id"));
            c.put("name", text(row.get("name")));
            c.put("status", text(row.get("status")));
            c.put("waiting", count(row.get("waiting")));
            coordinating.add(c);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("seats", seats);
        out.put("coordinating", coordinating);
        return out;
    }

    /** Waiting and approved seats of a chapter, for its coordinator or an admin. */
    @Transactional(readOnly = true)
    public Map<String, Object> seats(CurrentUser user, String chapterId) {
        tables.ensureChapterTables();
        Map<String, Object> chapter = chapters.findChapter(chapterId).orElseThrow(ChapterService::chapterNotFound);
        if (!mayDecide(user, chapter)) throw forbidden();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : chapters.chapterSeats(chapterId)) {
            Map<String, Object> s = seatJson(row);
            s.put("business_name", text(row.get("business_name")));
            s.put("cat", text(row.get("cat")));
            s.put("city", text(row.get("city")));
            s.put("owner", text(row.get("owner")));
            s.put("similar", count(row.get("similar")));
            s.put("business_hidden", Boolean.TRUE.equals(row.get("business_hidden")));
            list.add(s);
        }
        return listResult("seats", list);
    }

    /** A business owner asks for a seat for one of their businesses. */
    @Transactional
    public Map<String, Object> join(CurrentUser user, String chapterId, Map<String, Object> body) {
        tables.ensureChapterTables();
        Map<String, Object> input = ChapterSchemas.normalize(body);
        SchemaValidator.check(input, ChapterSchemas.JOIN, true, null);
        Map<String, Object> chapter = chapters.findChapter(chapterId).orElseThrow(ChapterService::chapterNotFound);
        if (text(chapter.get("status")).equals(CLOSED)) throw chapterClosed();
        String businessId = text(input.get("businessId"));
        Map<String, Object> business = chapters.findBusiness(businessId)
            .orElseThrow(() -> ApiException.notFound("BUSINESS_NOT_FOUND", "व्यवसाय सापडला नाही (Business not found)."));
        if (!user.id().equals(text(business.get("owner_id")))) {
            throw ApiException.forbidden("NOT_OWNER", "हा व्यवसाय आपल्या नावावर नाही (This business is not yours).");
        }
        if (text(business.get("status")).equals("hidden")) {
            throw ApiException.badRequest("BUSINESS_HIDDEN", "लपवलेला व्यवसाय चॅप्टरमध्ये सामील होऊ शकत नाही (A hidden business cannot join).");
        }
        if (chapters.businessHasActiveSeat(businessId)) throw businessAlreadyIn();
        if (chapters.memberHasActiveSeat(chapterId, user.id())) throw alreadyInThisChapter();
        limiter.check(user.id());

        String id = Ids.millis("CS", chapters::existsSeat);
        try {
            chapters.insertSeat(id, chapterId, businessId, user.id(), text(input.get("message")), now());
        } catch (DataIntegrityViolationException e) { // the same request arrived at the same moment
            throw String.valueOf(e.getMessage()).contains("one_per_member") ? alreadyInThisChapter() : businessAlreadyIn();
        }
        String coordinator = text(chapter.get("coordinator_id"));
        if (!coordinator.isEmpty() && !coordinator.equals(user.id())) {
            activity.notifyMember(notificationId(), coordinator, "नवीन चॅप्टर विनंती (New Chapter Request)",
                nameOf(user.id()) + " यांनी \"" + text(business.get("name")) + "\" साठी \"" + text(chapter.get("name"))
                    + "\" चॅप्टरमध्ये सामील होण्याची विनंती केली आहे.", "chapter");
        }
        return seatResult("विनंती पाठवली! समन्वयकाच्या निर्णयाची प्रतीक्षा करा (Request sent.)", id);
    }

    /** approve, decline, remove (coordinator or admin); cancel, leave (the member who asked). */
    @Transactional
    public Map<String, Object> act(CurrentUser user, String seatId, Map<String, Object> body) {
        tables.ensureChapterTables();
        Map<String, Object> input = ChapterSchemas.normalize(body);
        SchemaValidator.check(input, ChapterSchemas.ACTION, true, null);
        String action = text(input.get("action"));
        Map<String, Object> seat = chapters.findSeat(seatId)
            .orElseThrow(() -> ApiException.notFound("SEAT_NOT_FOUND", "विनंती सापडली नाही (Request not found)."));
        boolean decision = action.equals("approve") || action.equals("decline") || action.equals("remove");
        if (decision ? !mayDecide(user, seat) : !user.id().equals(text(seat.get("member_id")))) throw forbidden();

        String from = action.equals("remove") || action.equals("leave") ? APPROVED : WAITING;
        String to = switch (action) {
            case "approve" -> APPROVED;
            case "decline" -> "declined";
            case "remove" -> "removed";
            case "cancel" -> "cancelled";
            default -> "left";
        };
        if (!text(seat.get("status")).equals(from)) throw invalidTransition();
        String chapterId = text(seat.get("chapter_id"));
        if (action.equals("approve")) {
            Map<String, Object> locked = chapters.lockChapter(chapterId).orElseThrow(ChapterService::chapterNotFound);
            if (text(locked.get("status")).equals(CLOSED)) throw chapterClosed();
            Integer max = maxOf(locked);
            if (max != null && chapters.approvedCount(chapterId) >= max) {
                throw ApiException.badRequest("CHAPTER_FULL", "चॅप्टरमधील सर्व जागा भरल्या आहेत (The chapter is full).");
            }
        }
        if (chapters.setSeatStatusIf(seatId, from, to, decision ? user.id() : null, now()) == 0) throw invalidTransition();

        if (decision) {
            String chapterName = text(seat.get("chapter_name"));
            String businessName = text(seat.get("business_name"));
            String message = switch (action) {
                case "approve" -> "\"" + businessName + "\" ला \"" + chapterName + "\" चॅप्टरमध्ये जागा मिळाली! (Your request was approved.)";
                case "decline" -> "\"" + chapterName + "\" चॅप्टरसाठी \"" + businessName + "\" ची विनंती नाकारली गेली (Your request was declined).";
                default -> "\"" + businessName + "\" ला \"" + chapterName + "\" चॅप्टरमधून काढण्यात आले (Your business was removed from the chapter).";
            };
            activity.notifyMember(notificationId(), text(seat.get("member_id")), "चॅप्टर: " + chapterName + " (Chapter update)", message, "chapter");
            audit(user, "CHAPTER_SEAT_" + action.toUpperCase(java.util.Locale.ROOT), Map.of(
                "chapterId", chapterId, "seatId", seatId, "businessId", text(seat.get("business_id")), "memberId", text(seat.get("member_id"))));
        }
        return seatResult(switch (action) {
            case "approve" -> "मंजूर केले (Approved.)";
            case "decline" -> "नाकारले (Declined.)";
            case "remove" -> "काढले (Removed.)";
            case "cancel" -> "विनंती रद्द केली (Request cancelled.)";
            default -> "चॅप्टर सोडला (You left the chapter.)";
        }, seatId);
    }

    // ------------------------------------------------------------------ helpers

    /** The chapter's coordinator, or an admin (row has the chapter's coordinator_id). */
    private static boolean mayDecide(CurrentUser user, Map<String, Object> row) {
        return Roles.isAdmin(user) || user.id().equals(text(row.get("coordinator_id")));
    }

    private static Map<String, Object> seatJson(Map<String, Object> row) {
        Map<String, Object> s = new LinkedHashMap<>();
        for (String k : new String[] {"id", "chapter_id", "business_id", "member_id", "message", "status", "decided_by", "created_at", "updated_at"}) {
            s.put(k, row.get(k));
        }
        return s;
    }

    private Map<String, Object> seatResult(String message, String id) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", message);
        out.put("seat", seatJson(chapters.findSeat(id).orElseThrow()));
        return out;
    }

    private static ApiException forbidden() {
        return ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");
    }

    private static ApiException chapterClosed() {
        return ApiException.badRequest("CHAPTER_CLOSED", "हा चॅप्टर बंद आहे (This chapter is closed).");
    }

    private static ApiException invalidTransition() {
        return ApiException.badRequest("INVALID_TRANSITION", "या विनंतीवर आधीच निर्णय झाला आहे (This request was already decided).");
    }

    private static ApiException businessAlreadyIn() {
        return ApiException.badRequest("BUSINESS_ALREADY_IN_CHAPTER",
            "हा व्यवसाय आधीच एका चॅप्टरमध्ये आहे किंवा त्याची विनंती प्रलंबित आहे (This business is already in a chapter or waiting).");
    }

    private static ApiException alreadyInThisChapter() {
        return ApiException.badRequest("ALREADY_IN_THIS_CHAPTER",
            "आपण या चॅप्टरमध्ये आधीच आहात किंवा आपली विनंती प्रलंबित आहे (You already have a seat or request in this chapter).");
    }

    private static String notificationId() {
        return "NOTIF-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    /** The validated chapter fields, trimmed, with maxSeats as an Integer or null and a coordinator who exists. */
    private Map<String, Object> validChapter(Map<String, Object> input) {
        SchemaValidator.check(input, ChapterSchemas.CHAPTER, true, null);
        Map<String, Object> f = new LinkedHashMap<>();
        for (String k : FIELDS) f.put(k, text(input.get(k)));
        f.put("maxSeats", maxSeats(input.get("maxSeats")));
        if (!members.existsById(text(f.get("coordinatorId")))) {
            throw ApiException.badRequest("COORDINATOR_NOT_FOUND", "हा समन्वयक सदस्य सापडला नाही (Coordinator member not found).");
        }
        return f;
    }

    static Integer maxSeats(Object value) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        Long n = null;
        if (value instanceof Integer || value instanceof Long) n = ((Number) value).longValue();
        else if (value instanceof Number num && num.doubleValue() == Math.rint(num.doubleValue())) n = (long) num.doubleValue();
        else if (value instanceof String s && s.trim().matches("[0-9]{1,4}")) n = Long.parseLong(s.trim());
        if (n == null || n < 1 || n > MAX_SEATS) {
            throw ApiException.badRequest("VALIDATION_ERROR",
                "जास्तीत जास्त जागा १ ते २०० असाव्यात किंवा रिकाम्या ठेवा (maxSeats must be a whole number from 1 to 200, or empty).");
        }
        return n.intValue();
    }

    /** The details everyone may see. */
    private static Map<String, Object> details(Map<String, Object> row) {
        Map<String, Object> c = new LinkedHashMap<>();
        c.put("id", row.get("id"));
        for (String k : new String[] {"name", "city", "district", "area", "meeting_day", "meeting_time", "venue", "coordinator_name"}) {
            c.put(k, text(row.get(k)));
        }
        Integer max = maxOf(row);
        if (max != null) c.put("max_seats", max);
        return c;
    }

    private static Map<String, Object> adminJson(Map<String, Object> row) {
        Map<String, Object> c = details(row);
        c.put("coordinator_id", text(row.get("coordinator_id")));
        c.put("status", text(row.get("status")));
        c.put("businesses", count(row.get("businesses")));
        c.put("approved", count(row.get("approved")));
        c.put("waiting", count(row.get("waiting")));
        c.put("created_at", row.get("created_at"));
        c.put("updated_at", row.get("updated_at"));
        return c;
    }

    private Map<String, Object> chapterResult(String message, String id) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", message);
        out.put("chapter", adminJson(chapters.findChapter(id).orElseThrow()));
        return out;
    }

    private static Map<String, Object> listResult(String key, List<Map<String, Object>> list) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put(key, list);
        return out;
    }

    private static Integer maxOf(Map<String, Object> row) {
        return row.get("max_seats") instanceof Number n ? n.intValue() : null;
    }

    private static int count(Object value) {
        return value instanceof Number n ? n.intValue() : 0;
    }

    /** meetingDay -> meeting_day. */
    private static String column(String field) {
        return field.replaceAll("([A-Z])", "_$1").toLowerCase(java.util.Locale.ROOT);
    }

    static void requireAdmin(CurrentUser user) {
        if (!Roles.isAdmin(user)) throw ApiException.forbidden("FORBIDDEN", "फक्त ॲडमिनसाठी (Admins only).");
    }

    static ApiException chapterNotFound() {
        return ApiException.notFound("CHAPTER_NOT_FOUND", "चॅप्टर सापडला नाही (Chapter not found).");
    }

    void audit(CurrentUser user, String action, Map<String, Object> details) {
        activity.audit(logId(), user.id(), nameOf(user.id()), action, json(details));
    }

    String nameOf(String memberId) {
        return members.findById(memberId).map(Member::getName).map(ChapterService::text).filter(s -> !s.isEmpty()).orElse("सदस्य");
    }

    static String now() {
        return Instant.now().toString();
    }

    private static String logId() {
        return "LOG-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000);
    }

    private static String json(Map<String, Object> m) {
        try {
            return JSON.writeValueAsString(m);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Trimmed text; null or missing becomes "". */
    static String text(Object value) {
        return value == null ? "" : Js.string(value).trim();
    }
}
