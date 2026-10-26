package com.connectmaratha.api.sangam.dto;

import com.connectmaratha.api.sangam.entity.Meeting;
import java.util.LinkedHashMap;
import java.util.Map;

/** A meeting as a viewer sees it: the stored fields plus mode, who must answer a request, the viewer's role and who the other person is. */
public final class MeetingJson {

    private MeetingJson() {}

    public static Map<String, Object> meeting(Meeting m, String mode, String awaitingId, String viewerId) {
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
        o.put("mode", mode == null || mode.isBlank() ? "Offline" : mode);
        if (awaitingId != null) o.put("awaiting_id", awaitingId);
        if (viewerId != null && viewerId.equals(m.getRequesterId())) {
            o.put("role", "requester");
            o.put("partner_id", m.getRecipientId());
            o.put("partner_name", m.getRecipientName());
        } else if (viewerId != null && viewerId.equals(m.getRecipientId())) {
            o.put("role", "recipient");
            o.put("partner_id", m.getRequesterId());
            o.put("partner_name", m.getRequesterName());
        }
        return o;
    }
}
