package com.connectmaratha.api.sangam.event;

/** A referral was given or its status changed. Carries no customer data: only ids and the status. */
public record ReferralChanged(String id, String giverId, String recipientId, String status) {
}
