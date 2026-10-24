package com.connectmaratha.api.community.repository;

import com.connectmaratha.api.community.entity.PostLike;

import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostLikeRepository extends JpaRepository<PostLike, String> {

    boolean existsByPostIdAndMemberId(String postId, String memberId);

    /** Ids of the posts this member has liked (for the is_liked flag). */
    @Query("select l.postId from PostLike l where l.memberId = :memberId")
    Set<String> likedPostIds(@Param("memberId") String memberId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "DELETE FROM post_likes WHERE post_id = :postId AND member_id = :memberId")
    void deleteLike(@Param("postId") String postId, @Param("memberId") String memberId);
}
