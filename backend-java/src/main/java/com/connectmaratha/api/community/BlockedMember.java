package com.connectmaratha.api.community;

/** One row of GET /api/community/blocks. */
public interface BlockedMember {
    String getId();
    String getName();
    String getAvatar();
}
