package com.connectmaratha.api.enquiry.event;

/** A requirement got a new or changed quote, or was closed or reopened. */
public record EnquiryUpdated(String id, String status, int quotesCount) {
}
