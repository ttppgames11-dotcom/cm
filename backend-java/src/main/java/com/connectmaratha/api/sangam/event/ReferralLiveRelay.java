package com.connectmaratha.api.sangam.event;

import com.connectmaratha.api.common.live.LiveUpdates;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Announces a given or moved referral to the open pages, only once the change is committed. The event holds
 * ids and the status only: a page that is not about the member ignores it, the others reload their own list.
 */
@Component
public class ReferralLiveRelay {

    public static final String CHANNEL = "referrals";

    private final LiveUpdates live;

    public ReferralLiveRelay(LiveUpdates live) {
        this.live = live;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void changed(ReferralChanged e) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", e.id());
        payload.put("giverId", e.giverId());
        payload.put("recipientId", e.recipientId());
        payload.put("status", e.status());
        live.publish(CHANNEL, "referral.changed", payload);
    }
}
