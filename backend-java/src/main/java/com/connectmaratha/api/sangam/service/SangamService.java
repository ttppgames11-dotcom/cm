package com.connectmaratha.api.sangam.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.sangam.entity.Meeting;
import com.connectmaratha.api.sangam.entity.SangamReferral;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.connectmaratha.api.sangam.repository.MeetingRepository;
import com.connectmaratha.api.sangam.repository.SangamReferralRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business networking: member-to-member business referrals and 1-to-1 meetings (backend/routes/sangam.routes.js). */
@Service
public class SangamService {

    private static final ObjectMapper JSON = new ObjectMapper();
    /** new Date().toISOString(): always milliseconds and Z. */
    private static final DateTimeFormatter JS_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
    private static final String CANCELLED = "रद्द (Cancelled)";
    private static final String COMPLETED = "पूर्ण (Completed)";

    private final SangamReferralRepository referrals;
    private final MeetingRepository meetings;
    private final ActivityRepository activity;

    public SangamService(SangamReferralRepository referrals, MeetingRepository meetings, ActivityRepository activity) {
        this.referrals = referrals;
        this.meetings = meetings;
        this.activity = activity;
    }

    // ------------------------------------------------------------------ referrals

    /** Sets the status (cleared when none is sent, as in Node) and, if sent, the deal value. */
    @Transactional
    public Map<String, Object> updateReferralStatus(String id, Map<String, Object> b) {
        Object status = b.get("status");
        Object value = b.get("value");
        referrals.updateStatus(id, status == null ? null : Js.string(status), value == null ? null : Js.string(value));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "स्थिती अद्ययावत केली!");
        // For an unknown id Node sends "referral": null.
        out.put("referral", referrals.findById(id).map(SangamService::referral).orElse(null));
        return out;
    }

    // ------------------------------------------------------------------- meetings

    public Map<String, Object> listMeetings(String memberId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Meeting m : meetings.search(Js.nullIfFalsy(memberId))) rows.add(meeting(m));
        return list("meetings", rows);
    }

    @Transactional
    public Map<String, Object> createMeeting(CurrentUser user, Map<String, Object> b) {
        String requesterId = Js.orElse(firstOr(first(b, "requester_id", "requesterId"), user == null ? null : user.id()), "M1001");
        String requesterName = Js.orElse(firstOr(first(b, "requester_name", "requesterName"), user == null ? null : user.name()), "अमोल जाधव");
        String recipientId = Js.orElse(first(b, "recipient_id", "recipientId"), "M1002");
        String recipientName = Js.orElse(first(b, "recipient_name", "recipientName"), "प्रिया देशमुख");
        String date = Js.orElse(b.get("date"), "२० ऑक्टोबर २०२६");
        String time = Js.orElse(b.get("time"), "सकाळी ११:००");
        String id = Ids.millis("MT-", meetings::existsById);

        meetings.insertMeeting(id, requesterId, requesterName, recipientId, recipientName, date, time,
            Js.orElse(b.get("topic"), "व्यवसाय संगम १-टू-१ चर्चा"), Js.textOrEmpty(b.get("location")), Js.textOrEmpty(b.get("notes")));
        activity.notifyMember(notificationId(), recipientId, "नवीन व्यवसाय बैठक विनंती (New Meeting Request)",
            requesterName + " यांनी आपल्यासोबत बैठकीची विनंती केली आहे (" + date + " " + time + ").");

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "भेट नियोजित केली!");
        out.put("meeting", meeting(meetings.findById(id).orElseThrow()));
        return out;
    }

    /** Only the two members in the meeting, an admin or the CEO may reschedule; the other side is notified. */
    @Transactional
    public Map<String, Object> reschedule(CurrentUser user, String id, Map<String, Object> b) {
        Meeting m = findMeeting(id);
        Access access = access(user, m);
        Object date = b.get("date");
        if (!(date instanceof String d) || d.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "बैठकीची तारीख आवश्यक आहे (Meeting date is required).");
        }
        String newDate = d.trim();
        String newTime = b.get("time") != null ? Js.string(b.get("time")).trim() : Objects.requireNonNullElse(m.getTime(), "");
        String location = b.get("location") != null ? Js.string(b.get("location")).trim() : Objects.requireNonNullElse(m.getLocation(), "");
        String notes = b.get("notes") != null ? Js.string(b.get("notes")).trim() : Objects.requireNonNullElse(m.getNotes(), "");
        meetings.reschedule(id, newDate, newTime, location, notes, JS_ISO.format(Instant.now()));

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("meetingId", id);
        details.put("oldDate", m.getDate());
        details.put("newDate", newDate);
        details.put("oldTime", m.getTime());
        details.put("newTime", newTime);
        details.put("location", location);
        activity.audit(logId(), user.id(), access.userName(user, m), "RESCHEDULE_MEETING", json(details));

        String message = "आपली बैठक नवीन वेळेसाठी (" + newDate + (newTime.isEmpty() ? "" : " " + newTime) + ") पुनर्नियोजित करण्यात आली आहे.";
        for (String target : access.notifyTargets(user, m)) {
            activity.notifyMember(notificationId(), target, "व्यवसाय बैठक पुनर्नियोजित (Meeting Rescheduled)", message);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "बैठक पुनर्नियोजित केली!");
        out.put("meeting", meeting(meetings.findById(id).orElseThrow()));
        return out;
    }

    /** Cancel or complete a meeting (same people as reschedule). */
    @Transactional
    public Map<String, Object> setMeetingStatus(CurrentUser user, String id, Map<String, Object> b) {
        Meeting m = findMeeting(id);
        Access access = access(user, m);
        Object raw = b.get("status");
        if (Js.truthy(raw) && !(raw instanceof String)) {
            throw new IllegalStateException("status is not text"); // Node: (status).toLowerCase is not a function -> 500
        }
        String status = Js.textOrEmpty(raw).toLowerCase(Locale.ROOT).trim();
        String mapped;
        String action;
        if (status.equals("cancelled") || status.equals("रद्द (cancelled)") || status.equals("रद्द")) {
            mapped = CANCELLED;
            action = "CANCEL_MEETING";
        } else if (status.equals("completed") || status.equals("पूर्ण (completed)") || status.equals("पूर्ण")) {
            mapped = COMPLETED;
            action = "COMPLETE_MEETING";
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                "अवैध स्थिती. स्थिती \"cancelled\" किंवा \"completed\" असणे आवश्यक आहे (Status must be \"cancelled\" or \"completed\").");
        }
        meetings.setStatus(id, mapped, JS_ISO.format(Instant.now()));

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("meetingId", id);
        details.put("oldStatus", m.getStatus());
        details.put("newStatus", mapped);
        activity.audit(logId(), user.id(), access.userName(user, m), action, json(details));

        String date = Objects.requireNonNullElse(m.getDate(), "");
        String title = mapped.equals(CANCELLED) ? "व्यवसाय बैठक रद्द केली (Meeting Cancelled)" : "व्यवसाय बैठक पूर्ण झाली (Meeting Completed)";
        String message = mapped.equals(CANCELLED)
            ? "आपली बैठक (" + date + ") रद्द करण्यात आली आहे."
            : "आपली बैठक (" + date + ") यशस्वीरीत्या पूर्ण झाली म्हणून नोंदवली गेली आहे.";
        for (String target : access.notifyTargets(user, m)) activity.notifyMember(notificationId(), target, title, message);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "बैठक स्थिती अद्ययावत केली!");
        out.put("meeting", meeting(meetings.findById(id).orElseThrow()));
        return out;
    }

    public Map<String, Object> metrics() {
        Object[] won = referrals.wonDeals().get(0);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalReferrals", referrals.countAll());
        m.put("wonDeals", won[0] == null ? 0 : ((Number) won[0]).longValue());
        m.put("totalBusinessValue", won[1] == null ? 0.0 : ((Number) won[1]).doubleValue());
        m.put("totalMeetings", meetings.countAll());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("metrics", m);
        return out;
    }

    // -------------------------------------------------------------------- helpers

    private Meeting findMeeting(String id) {
        return meetings.findById(id)
            .orElseThrow(() -> ApiException.notFound("MEETING_NOT_FOUND", "बैठक आढळली नाही (Meeting not found)."));
    }

    /** Who the caller is in this meeting; refuses anyone who is not in it and not admin/CEO. */
    private static Access access(CurrentUser user, Meeting m) {
        String role = user.role() == null ? "" : user.role().toLowerCase(Locale.ROOT);
        boolean adminOrCeo = role.equals("admin") || role.equals("ceo");
        boolean requester = user.id() != null && user.id().equals(m.getRequesterId());
        boolean recipient = user.id() != null && user.id().equals(m.getRecipientId());
        if (!requester && !recipient && !adminOrCeo) {
            throw ApiException.forbidden("FORBIDDEN", "परवानगी नाकारली (Access forbidden).");
        }
        return new Access(requester, recipient, adminOrCeo);
    }

    private record Access(boolean requester, boolean recipient, boolean adminOrCeo) {

        String userName(CurrentUser user, Meeting m) {
            if (Js.truthy(user.name())) return user.name();
            return requester ? m.getRequesterName() : recipient ? m.getRecipientName() : "Admin";
        }

        /** The other participant; for an admin/CEO, both participants except themselves. */
        List<String> notifyTargets(CurrentUser user, Meeting m) {
            List<String> targets = new ArrayList<>();
            if (requester && Js.truthy(m.getRecipientId())) {
                targets.add(m.getRecipientId());
            } else if (recipient && Js.truthy(m.getRequesterId())) {
                targets.add(m.getRequesterId());
            } else if (adminOrCeo) {
                if (Js.truthy(m.getRecipientId()) && !m.getRecipientId().equals(user.id())) targets.add(m.getRecipientId());
                if (Js.truthy(m.getRequesterId()) && !m.getRequesterId().equals(user.id())) targets.add(m.getRequesterId());
            }
            return targets;
        }
    }

    private static Object first(Map<String, Object> b, String a, String c) {
        return Js.truthy(b.get(a)) ? b.get(a) : b.get(c);
    }

    private static Object firstOr(Object value, Object fallback) {
        return Js.truthy(value) ? value : fallback;
    }

    private static String notificationId() {
        return "NOTIF-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000);
    }

    private static String logId() {
        return "LOG-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000);
    }

    private static String json(Map<String, Object> m) {
        try {
            return JSON.writeValueAsString(m);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private static Map<String, Object> list(String key, List<Map<String, Object>> rows) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put(key, rows);
        return out;
    }

    static Map<String, Object> referral(SangamReferral r) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", r.getId());
        o.put("title", r.getTitle());
        o.put("category", r.getCategory());
        o.put("giver_id", r.getGiverId());
        o.put("giver_name", r.getGiverName());
        o.put("recipient_id", r.getRecipientId());
        o.put("recipient_name", r.getRecipientName());
        o.put("client_name", r.getClientName());
        o.put("client_phone", r.getClientPhone());
        o.put("client_email", r.getClientEmail());
        o.put("status", r.getStatus());
        o.put("value", r.getValue());
        o.put("notes", r.getNotes());
        o.put("created_at", r.getCreatedAt());
        o.put("type", r.getType());
        o.put("referral_id", r.getReferralId());
        o.put("reference_id", r.getReferenceId());
        o.put("referrer_id", r.getReferrerId());
        o.put("referrer_referral_id", r.getReferrerReferralId());
        o.put("referrer_name", r.getReferrerName());
        o.put("referee_id", r.getRefereeId());
        o.put("referee_referral_id", r.getRefereeReferralId());
        o.put("referee_name", r.getRefereeName());
        o.put("referee_phone", r.getRefereePhone());
        o.put("referee_district", r.getRefereeDistrict());
        o.put("referee_city", r.getRefereeCity());
        return o;
    }

    static Map<String, Object> meeting(Meeting m) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", m.getId());
        o.put("requester_id", m.getRequesterId());
        o.put("requester_name", m.getRequesterName());
        o.put("recipient_id", m.getRecipientId());
        o.put("recipient_name", m.getRecipientName());
        o.put("date", m.getDate());
        o.put("time", m.getTime());
        o.put("topic", m.getTopic());
        o.put("status", m.getStatus());
        o.put("notes", m.getNotes());
        o.put("created_at", m.getCreatedAt());
        o.put("location", m.getLocation());
        o.put("updated_at", m.getUpdatedAt());
        return o;
    }
}
