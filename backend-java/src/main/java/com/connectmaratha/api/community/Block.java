package com.connectmaratha.api.community;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

/** "The blocker no longer sees the blocked member" (table blocks). */
@Entity
@Table(name = "blocks")
@IdClass(BlockId.class)
public class Block {

    @Id @Column(name = "blocker_id") private String blockerId;
    @Id @Column(name = "blocked_id") private String blockedId;

    public String getBlockerId() { return blockerId; }
    public String getBlockedId() { return blockedId; }
}
