package com.connectmaratha.api.event.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.event.entity.Event;
import com.connectmaratha.api.event.repository.EventRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Community events (backend/routes/events.routes.js). */
@Service
public class EventService {

    private final EventRepository events;

    public EventService(EventRepository events) {
        this.events = events;
    }

    public Map<String, Object> list(String district, String category) {
        String districtFilter = Js.truthy(district) && !"सर्व".equals(district) ? district : null;
        String categoryFilter = Js.truthy(category) && !"all".equals(category) ? category : null;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Event e : events.search(districtFilter, categoryFilter)) rows.add(json(e));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("events", rows);
        return out;
    }

    public Map<String, Object> detail(String id) {
        Event e = events.findById(id).orElseThrow(() -> ApiException.plain(HttpStatus.NOT_FOUND, "कार्यक्रम आढळला नाही."));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("event", json(e));
        return out;
    }

    /**
     * Books seats. As in Node, an unreadable seat count or an unknown event is a server error
     * (the database refuses the booking).
     */
    @Transactional
    public Map<String, Object> rsvp(String eventId, Map<String, Object> b) {
        Object seatsRaw = b.get("seats");
        Long parsed = Js.parseInt(Js.truthy(seatsRaw) ? seatsRaw : 1);
        // An unreadable count goes to the database as NaN, which refuses it (same error as Node).
        String seats = parsed == null ? "NaN" : String.valueOf(parsed);
        events.insertRsvp(Ids.millis("RSVP-", events::rsvpExists), eventId, Js.orElse(b.get("member_id"), "M1001"),
            Js.orElse(b.get("member_name"), "सदस्य"), Js.textOrEmpty(b.get("phone")), seats);
        events.addSeats(eventId, seats);
        Event updated = events.findById(eventId).orElseThrow(() -> new IllegalStateException("event " + eventId + " not found"));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "उपस्थिती नोंदणी (RSVP) यशस्वी झाली!");
        out.put("rsvp_count", updated.getRsvpCount());
        return out;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> b) {
        if (!Js.truthy(b.get("title")) || !Js.truthy(b.get("date")) || !Js.truthy(b.get("venue"))) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "कार्यक्रमाचे नाव, तारीख आणि ठिकाण आवश्यक आहे.");
        }
        String id = Ids.twoDigit("E", events::existsById);
        events.insertEvent(id, Js.string(b.get("title")), Js.orElse(b.get("category"), "सामाजिक मेळावा"),
            Js.string(b.get("date")), Js.orElse(b.get("time"), "सकाळी १०:००"), Js.string(b.get("venue")),
            Js.orElse(b.get("district"), "पुणे"), Js.textOrEmpty(b.get("desc")),
            Js.orElse(b.get("organizer"), "अखिल भारतीय मराठा महासंघ"), Js.orElse(b.get("banner"), "/assets/images/meeting.jpg"));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "कार्यक्रम यशस्वीरित्या जोडला!");
        out.put("event", json(events.findById(id).orElseThrow()));
        return out;
    }

    static Map<String, Object> json(Event e) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", e.getId());
        out.put("title", e.getTitle());
        out.put("category", e.getCategory());
        out.put("date", e.getDate());
        out.put("time", e.getTime());
        out.put("venue", e.getVenue());
        out.put("district", e.getDistrict());
        out.put("desc", e.getDesc());
        out.put("organizer", e.getOrganizer());
        out.put("banner", e.getBanner());
        out.put("rsvp_count", e.getRsvpCount());
        out.put("created_at", e.getCreatedAt());
        out.put("creator_id", e.getCreatorId());
        return out;
    }
}
