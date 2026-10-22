package com.connectmaratha.api.community.entity;

import java.io.Serializable;
import java.util.Objects;

/** Primary key of blocks: (blocker_id, blocked_id). */
public class BlockId implements Serializable {

    private String blockerId;
    private String blockedId;

    public BlockId() {}

    public BlockId(String blockerId, String blockedId) {
        this.blockerId = blockerId;
        this.blockedId = blockedId;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof BlockId b && Objects.equals(blockerId, b.blockerId) && Objects.equals(blockedId, b.blockedId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(blockerId, blockedId);
    }
}
