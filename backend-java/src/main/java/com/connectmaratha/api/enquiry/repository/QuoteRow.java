package com.connectmaratha.api.enquiry.repository;

import java.time.Instant;

/** One member's quote on a requirement (table enquiry_quotes); at most one per member per requirement. */
public record QuoteRow(
    String id,
    String enquiryId,
    String memberId,
    String businessName,
    String ownerName,
    String phone,
    String quoteAmount,
    String proposalNotes,
    Instant createdAt,
    Instant updatedAt) {
}
