package com.connectmaratha.api.sangam.event;

/** A meeting was asked for, answered or moved. Carries no meeting content: only ids and the status. */
public record MeetingChanged(String id, String requesterId, String recipientId, String status) {
}
