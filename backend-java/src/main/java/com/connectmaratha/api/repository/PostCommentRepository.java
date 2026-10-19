package com.connectmaratha.api.repository;

import com.connectmaratha.api.entity.PostComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostCommentRepository extends JpaRepository<PostComment, String> {

    /** Comments on a post, oldest first, hiding authors the viewer blocked. */
    @Query(nativeQuery = true, value = """
        SELECT c.* FROM post_comments c
        WHERE c.post_id = :postId
          AND (CAST(:viewer AS TEXT) IS NULL
               OR c.author_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = CAST(:viewer AS TEXT)))
        ORDER BY c.created_at ASC""")
    List<PostComment> findForPost(@Param("postId") String postId, @Param("viewer") String viewer);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO post_comments (id, post_id, author_id, author_name, text, created_at)
        VALUES (:id, :postId, :authorId, :authorName, :text, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertComment(@Param("id") String id, @Param("postId") String postId, @Param("authorId") String authorId,
                       @Param("authorName") String authorName, @Param("text") String text);
}
