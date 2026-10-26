package com.connectmaratha.api.sangam.event;

import com.connectmaratha.api.common.live.LiveUpdates;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Announces a requested, answered or moved meeting to the open pages, only once the change is committed. The event
 * holds ids and the status only: a page that is not about the member ignores it, the others reload their own list.
 */
@Component
public class MeetingLiveRelay {

    public static final String CHANNEL = "meetings";

    private final LiveUpdates live;

    public MeetingLiveRelay(LiveUpdates live) {
        this.live = live;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void changed(MeetingChanged e) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", e.id());
        payload.put("requesterId", e.requesterId());
        payload.put("recipientId", e.recipientId());
        payload.put("status", e.status());
        live.publish(CHANNEL, "meeting.changed", payload);
    }
}
