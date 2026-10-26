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
import com.connectmaratha.api.sangam.dto.MeetingJson;
import com.connectmaratha.api.sangam.dto.MeetingSchemas;
import com.connectmaratha.api.sangam.event.MeetingChanged;
import com.connectmaratha.api.sangam.entity.Meeting;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.connectmaratha.api.sangam.repository.MeetingRepository;
import com.connectmaratha.api.sangam.repository.ReferralReceiverRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-to-one business meetings between members. Not the Node behaviour: a login is needed, the other person must
 * be a member who owns a visible business, only the two people (and admins, to read) can see a meeting, and
 * nothing is invented. Dates and times are real and judged in Indian time.
 */
@Service
public class MeetingService {

    private static final ObjectMapper JSON = new ObjectMapper();
    static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    static final String REQUESTED = "Requested";
    static final String CONFIRMED = "Confirmed";
    static final String DECLINED = "Declined";
    static final String CANCELLED = "Cancelled";
    static final String COMPLETED = "Completed";
    static final int MAX_OPEN_REQUESTS = 10;
    static final String DEFAULT_NAME = "सदस्य";

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE.withResolverStyle(ResolverStyle.STRICT);
    /** new Date().toISOString(): always milliseconds and Z (the format the older rows use for updated_at). */
    private static final DateTimeFormatter JS_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm").withResolverStyle(ResolverStyle.STRICT);

    private final MeetingRepository meetings;
    private final ReferralReceiverRepository receivers;
    private final MemberRepository members;
    private final MeetingLimiter limiter;
    private final LazyTables tables;
    private final JdbcTemplate jdbc;
    private final ActivityRepository activity;
    private final ApplicationEventPublisher events;

    public MeetingService(MeetingRepository meetings, ReferralReceiverRepository receivers, MemberRepository members,
                          MeetingLimiter limiter, LazyTables tables, JdbcTemplate jdbc, ActivityRepository activity,
                          ApplicationEventPublisher events) {
        this.meetings = meetings;
        this.receivers = receivers;
        this.members = members;
        this.limiter = limiter;
        this.tables = tables;
        this.jdbc = jdbc;
        this.activity = activity;
        this.events = events;
    }

    /** The logged-in member asks a business owner for a meeting. */
    @Transactional
    public Map<String, Object> create(CurrentUser user, Map<String, Object> body) {
        tables.ensureMeetingColumns();
        Map<String, Object> input = MeetingSchemas.normalize(body);
        SchemaValidator.check(input, MeetingSchemas.MEETING, true, null); // invalid requests do not count
        String date = text(input.get("date"));
        String time = text(input.get("time"));
        String mode = text(input.get("mode"));
        String place = text(input.get("place"));
        validateWhen(date, time);
        validatePlace(mode, place);
        limiter.check(user.id());

        String recipientId = text(input.get("recipientId"));
        if (recipientId.equals(user.id())) {
            throw ApiException.badRequest("SELF_MEETING", "स्वतःसोबत बैठक ठरवता येत नाही (You cannot meet yourself).");
        }
        Member recipient = members.findById(recipientId).orElse(null);
        if (recipient == null || !receivers.ownsVisibleBusiness(recipientId)) {
            throw ApiException.badRequest("RECIPIENT_NOT_ELIGIBLE",
                "हा सदस्य बैठक स्वीकारू शकत नाही; त्याच्याकडे नोंदवलेला व्यवसाय असावा (This member has no listed business).");
        }
        if (meetings.existsOpenBetween(user.id(), recipientId, LocalDate.now(IST).toString())) {
            throw ApiException.badRequest("DUPLICATE_REQUEST",
                "या सदस्यासोबत आधीच एक बैठक सुरू आहे (You already have an open meeting with this member).");
        }
        if (meetings.countByRequesterAndStatus(user.id(), REQUESTED) >= MAX_OPEN_REQUESTS) {
            throw ApiException.badRequest("TOO_MANY_OPEN_REQUESTS",
                "आधीच १० विनंत्या उत्तराच्या प्रतीक्षेत आहेत (You already have 10 requests waiting for an answer).");
        }

        Member requester = members.findById(user.id()).orElse(null);
        String requesterName = requester == null || text(requester.getName()).isEmpty() ? DEFAULT_NAME : text(requester.getName());
        String recipientName = text(recipient.getName()).isEmpty() ? DEFAULT_NAME : text(recipient.getName());
        String id = Ids.millis("MT-", meetings::existsById);
        meetings.insertMeeting(id, user.id(), requesterName, recipientId, recipientName, date, time,
            text(input.get("topic")), place, REQUESTED, "");
        jdbc.update("UPDATE meetings SET mode = ?, awaiting_id = ? WHERE id = ?", mode, recipientId, id);
        activity.notifyMember(notificationId(), recipientId, "नवीन व्यवसाय बैठक विनंती (New Meeting Request)",
            requesterName + " यांनी आपल्यासोबत बैठकीची विनंती केली आहे (" + date + " " + time + ").");
        announce(user.id(), recipientId, id, REQUESTED);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "बैठकीची विनंती पाठवली! (Meeting requested.)");
        out.put("meeting", MeetingJson.meeting(meetings.findById(id).orElseThrow(), mode, recipientId, user.id()));
        return out;
    }

    /**
     * The caller's meetings (as requester or recipient), newest date first. Admins get every meeting, and only they
     * may narrow the list with memberIdFilter.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser user, String memberIdFilter) {
        tables.ensureMeetingColumns();
        String member = Roles.isAdmin(user) ? Js.nullIfFalsy(memberIdFilter) : user.id();
        List<Meeting> rows = meetings.search(member);
        Map<String, String[]> extras = extras(rows);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Meeting m : rows) list.add(MeetingJson.meeting(m, modeFrom(extras.get(m.getId())), awaitingOf(m, extras.get(m.getId())), user.id()));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("meetings", list);
        return out;
    }

    /** The recipient accepts or declines a request; either person cancels; once its day has come either completes it. */
    @Transactional
    public Map<String, Object> setStatus(CurrentUser user, String id, Map<String, Object> body) {
        tables.ensureMeetingColumns();
        Map<String, Object> input = MeetingSchemas.normalizeStatus(body);
        SchemaValidator.check(input, MeetingSchemas.STATUS, true, null);
        String word = text(input.get("status"));
        Meeting m = find(id);
        requireParticipant(user, m);
        String awaiting = storedAwaiting(m);
        String from = text(m.getStatus());
        String to;
        switch (word) {
            case "accepted", "declined" -> {
                if (!user.id().equals(awaiting)) {
                    throw ApiException.forbidden("NOT_RECIPIENT",
                        "फक्त ज्याच्या उत्तराची वाट पाहिली जात आहे तोच सदस्य उत्तर देऊ शकतो (Only the member whose answer is awaited can answer).");
                }
                requireState(from, REQUESTED);
                to = word.equals("accepted") ? CONFIRMED : DECLINED;
            }
            case "cancelled" -> {
                requireState(from, REQUESTED, CONFIRMED);
                to = CANCELLED;
            }
            default -> {
                requireState(from, CONFIRMED);
                requireDayArrived(m.getDate());
                to = COMPLETED;
            }
        }
        if (meetings.setStatusIf(id, from, to, JS_ISO.format(Instant.now())) == 0) throw changedMeanwhile(); // someone else changed it first
        Meeting saved = find(id);
        String name = myName(user, m);
        if (to.equals(CANCELLED) || to.equals(COMPLETED)) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("meetingId", id);
            details.put("oldStatus", from);
            details.put("newStatus", to);
            activity.audit(logId(), user.id(), name, to.equals(CANCELLED) ? "CANCEL_MEETING" : "COMPLETE_MEETING", json(details));
        }
        notifyOther(user, m, "व्यवसाय बैठक: " + to + " (Meeting " + to + ")",
            name + " यांनी बैठकीची (" + m.getDate() + ") स्थिती \"" + to + "\" केली आहे.");
        announce(saved);
        return reply("बैठकीची स्थिती अद्ययावत केली! (Meeting updated.)", saved, user);
    }

    /** Either person proposes a new date and time (and optionally a place); the meeting goes back to Requested. */
    @Transactional
    public Map<String, Object> reschedule(CurrentUser user, String id, Map<String, Object> body) {
        tables.ensureMeetingColumns();
        SchemaValidator.check(body, MeetingSchemas.RESCHEDULE, true, null);
        String date = text(body.get("date"));
        String time = text(body.get("time"));
        validateWhen(date, time);
        Meeting m = find(id);
        requireParticipant(user, m);
        String from = text(m.getStatus());
        requireState(from, REQUESTED, CONFIRMED);
        String place = text(body.get("place"));
        if (!place.isEmpty()) validatePlace(modeOf(m), place);
        String location = place.isEmpty() ? text(m.getLocation()) : place;
        String other = user.id().equals(m.getRequesterId()) ? m.getRecipientId() : m.getRequesterId();
        if (meetings.rescheduleIf(id, from, date, time, location, other, JS_ISO.format(Instant.now())) == 0) throw changedMeanwhile();
        String name = myName(user, m);
        notifyOther(user, m, "व्यवसाय बैठक पुनर्नियोजित (Meeting Rescheduled)",
            name + " यांनी नवीन वेळ सुचवली आहे (" + date + " " + time + "). कृपया उत्तर द्या.");
        Meeting saved = find(id);
        announce(saved);
        return reply("नवीन वेळ पाठवली! (New time sent.)", saved, user);
    }

    /** The note both people can edit (up to 2000 characters). */
    @Transactional
    public Map<String, Object> saveNote(CurrentUser user, String id, Map<String, Object> body) {
        tables.ensureMeetingColumns();
        SchemaValidator.check(body, MeetingSchemas.NOTE, true, null);
        Meeting m = find(id);
        requireParticipant(user, m);
        meetings.updateNotes(id, text(body.get("notes")), JS_ISO.format(Instant.now()));
        return reply("नोंद जतन केली! (Note saved.)", find(id), user);
    }

    /** Members who own a visible business, with those businesses (the picker for "request a meeting"). */
    public Map<String, Object> partners(CurrentUser user) {
        List<ReferralReceiverRepository.Receiver> list = receivers.receivers(user.id(), 200);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("partners", list);
        return out;
    }

    // -------------------------------------------------------------------- helpers

    private void announce(Meeting m) {
        announce(m.getRequesterId(), m.getRecipientId(), m.getId(), m.getStatus());
    }

    /** Published inside the transaction; the relay sends it only once the change is committed. */
    private void announce(String requesterId, String recipientId, String id, String status) {
        events.publishEvent(new MeetingChanged(id, requesterId, recipientId, status));
    }

    private Meeting find(String id) {
        return meetings.findById(id)
            .orElseThrow(() -> ApiException.notFound("MEETING_NOT_FOUND", "बैठक आढळली नाही (Meeting not found)."));
    }

    /** Only the two members can change a meeting; admins can read but not change. */
    private static void requireParticipant(CurrentUser user, Meeting m) {
        if (user.id() == null || (!user.id().equals(m.getRequesterId()) && !user.id().equals(m.getRecipientId()))) {
            throw ApiException.forbidden("FORBIDDEN", "परवानगी नाकारली (Access forbidden).");
        }
    }

    private static void requireState(String current, String... allowed) {
        for (String a : allowed) if (a.equals(current)) return;
        throw ApiException.badRequest("INVALID_TRANSITION",
            "या बैठकीची स्थिती \"" + current + "\" असल्याने हा बदल करता येत नाही (This change is not possible in the current state).");
    }

    /** A meeting can be completed from its day onwards; a date that cannot be read (an old row) does not block it. */
    private static void requireDayArrived(String date) {
        try {
            if (LocalDate.parse(text(date), DATE).isAfter(LocalDate.now(IST))) {
                throw ApiException.badRequest("TOO_EARLY", "बैठकीचा दिवस येण्याआधी ती पूर्ण करता येत नाही (The meeting day has not come yet).");
            }
        } catch (DateTimeException e) {
            // unreadable old date: allow
        }
    }

    private String modeOf(Meeting m) {
        return modeFrom(extras(List.of(m)).get(m.getId()));
    }

    private static String modeFrom(String[] extra) {
        return extra == null || extra[0] == null || extra[0].isBlank() ? "Offline" : extra[0];
    }

    /** Who must answer a Requested meeting: the stored person, or the recipient for rows made before awaiting_id existed. */
    private String storedAwaiting(Meeting m) {
        String[] extra = extras(List.of(m)).get(m.getId());
        return extra == null || extra[1] == null || extra[1].isBlank() ? m.getRecipientId() : extra[1];
    }

    /** The person whose answer is awaited; only a Requested meeting is waiting for anyone. */
    private static String awaitingOf(Meeting m, String[] extra) {
        if (!REQUESTED.equals(m.getStatus())) return null;
        return extra == null || extra[1] == null || extra[1].isBlank() ? m.getRecipientId() : extra[1];
    }

    private static ApiException changedMeanwhile() {
        return ApiException.badRequest("INVALID_TRANSITION",
            "ही बैठक नुकतीच बदलली आहे; पान ताजे करून पुन्हा प्रयत्न करा (This meeting was just changed; refresh and try again).");
    }

    private Map<String, Object> reply(String message, Meeting saved, CurrentUser user) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", message);
        String[] extra = extras(List.of(saved)).get(saved.getId());
        out.put("meeting", MeetingJson.meeting(saved, modeFrom(extra), awaitingOf(saved, extra), user.id()));
        return out;
    }

    private static String myName(CurrentUser user, Meeting m) {
        if (Js.truthy(user.name())) return user.name();
        return user.id().equals(m.getRequesterId()) ? text(m.getRequesterName()) : text(m.getRecipientName());
    }

    /** Tells the other person in the meeting. */
    private void notifyOther(CurrentUser user, Meeting m, String title, String message) {
        String other = user.id().equals(m.getRequesterId()) ? m.getRecipientId() : m.getRequesterId();
        if (Js.truthy(other)) activity.notifyMember(notificationId(), other, title, message);
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

    /** A real calendar date and 24-hour time that are still ahead in Indian time. */
    static void validateWhen(String date, String time) {
        LocalDate d;
        LocalTime t;
        try {
            d = LocalDate.parse(date, DATE);
        } catch (DateTimeException e) {
            throw ApiException.badRequest("INVALID_DATE", "तारीख बरोबर नाही (That is not a real date).");
        }
        try {
            t = LocalTime.parse(time, TIME);
        } catch (DateTimeException e) {
            throw ApiException.badRequest("INVALID_TIME", "वेळ बरोबर नाही; २४ तासांच्या स्वरूपात लिहा, उदा. 10:30 (That is not a real time).");
        }
        if (!LocalDateTime.of(d, t).isAfter(LocalDateTime.now(IST))) {
            throw ApiException.badRequest("PAST_TIME", "बैठकीची वेळ भविष्यातील असावी (The meeting must be in the future).");
        }
    }

    /** An online meeting needs a web link; an offline one just a place. */
    static void validatePlace(String mode, String place) {
        if ("Online".equals(mode) && !place.matches("(?i)^https?://\\S+$")) {
            throw ApiException.badRequest("INVALID_PLACE", "ऑनलाइन बैठकीसाठी http:// किंवा https:// ने सुरू होणारी लिंक द्या (An online meeting needs a web link).");
        }
    }

    /** {mode, awaiting_id} of each meeting (read separately: the columns are created on first use). */
    private Map<String, String[]> extras(List<Meeting> rows) {
        if (rows.isEmpty()) return Map.of();
        String placeholders = String.join(", ", Collections.nCopies(rows.size(), "?"));
        Map<String, String[]> out = new HashMap<>();
        jdbc.query("SELECT id, mode, awaiting_id FROM meetings WHERE id IN (" + placeholders + ")",
            rs -> { out.put(rs.getString("id"), new String[] {rs.getString("mode"), rs.getString("awaiting_id")}); },
            rows.stream().map(Meeting::getId).toArray());
        return out;
    }

    private static String notificationId() {
        return "NOTIF-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000);
    }

    /** Trimmed text; null or missing becomes "". */
    static String text(Object value) {
        return value == null ? "" : Js.string(value).trim();
    }
}
