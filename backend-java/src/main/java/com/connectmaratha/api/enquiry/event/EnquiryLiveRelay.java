package com.connectmaratha.api.enquiry.event;

import com.connectmaratha.api.common.live.LiveUpdates;
import com.connectmaratha.api.enquiry.dto.EnquiryJson;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Forwards requirement events to the open /leads pages, only once the change is committed: a
 * request that fails or is rolled back never shows up live.
 */
@Component
public class EnquiryLiveRelay {

    public static final String CHANNEL = "enquiries";

    private final LiveUpdates live;

    public EnquiryLiveRelay(LiveUpdates live) {
        this.live = live;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void created(EnquiryCreated e) {
        live.publish(CHANNEL, "enquiry.created", e.card());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void updated(EnquiryUpdated e) {
        live.publish(CHANNEL, "enquiry.updated", EnquiryJson.update(e.id(), e.status(), e.quotesCount()));
    }
}
