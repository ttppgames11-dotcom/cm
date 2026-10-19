package com.connectmaratha.api.dto;

/** One row of GET /api/community/blocks. */
public interface BlockedMember {
    String getId();
    String getName();
    String getAvatar();
}
