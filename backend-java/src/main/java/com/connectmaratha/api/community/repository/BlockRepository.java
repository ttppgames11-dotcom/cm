package com.connectmaratha.api.community.repository;

import com.connectmaratha.api.community.dto.BlockedMember;
import com.connectmaratha.api.community.entity.Block;
import com.connectmaratha.api.community.entity.BlockId;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlockRepository extends JpaRepository<Block, BlockId> {

    @Query(nativeQuery = true, value = """
        SELECT m.id AS id, m.name AS name, m.avatar AS avatar
        FROM blocks b JOIN members m ON m.id = b.blocked_id
        WHERE b.blocker_id = :blocker ORDER BY b.created_at DESC""")
    List<BlockedMember> listBlocked(@Param("blocker") String blocker);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value =
        "INSERT INTO blocks (blocker_id, blocked_id) VALUES (:blocker, :blocked) ON CONFLICT DO NOTHING")
    void block(@Param("blocker") String blocker, @Param("blocked") String blocked);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "DELETE FROM blocks WHERE blocker_id = :blocker AND blocked_id = :blocked")
    void unblock(@Param("blocker") String blocker, @Param("blocked") String blocked);
}
