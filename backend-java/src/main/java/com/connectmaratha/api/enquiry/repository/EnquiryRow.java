package com.connectmaratha.api.enquiry.repository;

import java.time.Instant;

/**
 * One business requirement (table enquiries). quotesCount and quotedByMe are computed when it is
 * read; quotedByMe is about the member who is looking (false when nobody is logged in).
 */
public record EnquiryRow(
    String id,
    String memberId,
    String title,
    String description,
    String category,
    String city,
    String district,
    String budget,
    String clientName,
    String phone,
    String status,
    Instant createdAt,
    Instant updatedAt,
    Instant closedAt,
    int quotesCount,
    boolean quotedByMe) {
}
