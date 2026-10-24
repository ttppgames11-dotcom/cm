package com.connectmaratha.api.enquiry.event;

import java.util.Map;

/** A requirement was posted; card is its public shape (no phone, no member id). */
public record EnquiryCreated(Map<String, Object> card) {
}
