package com.connectmaratha.api.media.repository;

import com.connectmaratha.api.media.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MediaRepository extends JpaRepository<Media, String> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO media (id, owner_id, kind, mime, bytes, size, created_at)
        VALUES (:id, :ownerId, :kind, :mime, :bytes, :size, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertMedia(@Param("id") String id, @Param("ownerId") String ownerId, @Param("kind") String kind,
                     @Param("mime") String mime, @Param("bytes") byte[] bytes, @Param("size") int size);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "DELETE FROM media WHERE owner_id = :ownerId AND kind = :kind")
    void deleteByOwnerAndKind(@Param("ownerId") String ownerId, @Param("kind") String kind);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "UPDATE members SET photo = :photo WHERE id = :memberId")
    void setMemberPhoto(@Param("memberId") String memberId, @Param("photo") String photo);
}
