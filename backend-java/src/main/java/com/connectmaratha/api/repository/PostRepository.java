package com.connectmaratha.api.repository;

import com.connectmaratha.api.entity.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, String> {

    /**
     * The feed, newest first. Posts by members the viewer blocked are hidden
     * (same SQL as the Node backend); with no viewer nothing is hidden.
     */
    @Query(nativeQuery = true, value = """
        SELECT p.* FROM posts p
        WHERE (CAST(:groupId AS TEXT) IS NULL OR p.group_id = CAST(:groupId AS TEXT))
          AND (CAST(:viewer AS TEXT) IS NULL
               OR p.author_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = CAST(:viewer AS TEXT)))
        ORDER BY p.created_at DESC""")
    List<Post> findFeed(@Param("viewer") String viewer, @Param("groupId") String groupId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO posts (id, author_id, author_name, author_avatar, group_id, text, image, likes_count, created_at)
        VALUES (:id, :authorId, :authorName, :authorAvatar, :groupId, :text, :image, 0,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertPost(@Param("id") String id, @Param("authorId") String authorId,
                    @Param("authorName") String authorName, @Param("authorAvatar") String authorAvatar,
                    @Param("groupId") String groupId, @Param("text") String text, @Param("image") String image);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "UPDATE posts SET likes_count = likes_count + 1 WHERE id = :id")
    void incrementLikes(@Param("id") String id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value =
        "UPDATE posts SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END WHERE id = :id")
    void decrementLikes(@Param("id") String id);

    @Query(nativeQuery = true, value = "SELECT likes_count FROM posts WHERE id = :id")
    Integer likesCountOf(@Param("id") String id);
}
