package com.connectmaratha.api.community;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityGroupRepository extends JpaRepository<CommunityGroup, String> {

    @Query(nativeQuery = true, value = """
        SELECT * FROM groups
        WHERE (CAST(:type AS TEXT) IS NULL OR type = CAST(:type AS TEXT))
          AND (CAST(:district AS TEXT) IS NULL OR district = CAST(:district AS TEXT))
        ORDER BY members_count DESC""")
    List<CommunityGroup> findFiltered(@Param("type") String type, @Param("district") String district);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "UPDATE groups SET members_count = members_count + 1 WHERE id = :id")
    void incrementMembers(@Param("id") String id);
}
