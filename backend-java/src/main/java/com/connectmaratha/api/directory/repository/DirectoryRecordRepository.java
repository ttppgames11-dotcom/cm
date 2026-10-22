package com.connectmaratha.api.directory.repository;

import com.connectmaratha.api.directory.entity.DirectoryRecord;
import com.connectmaratha.api.directory.entity.DirectoryRecordId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface DirectoryRecordRepository extends JpaRepository<DirectoryRecord, DirectoryRecordId> {

    /** A list, newest first. */
    @Query(nativeQuery = true, value = "SELECT * FROM directory_records WHERE collection = :collection ORDER BY seq DESC")
    List<DirectoryRecord> list(@Param("collection") String collection);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "INSERT INTO directory_records (collection, id, data, seq) VALUES (:collection, :id, :data, :seq)")
    void insert(@Param("collection") String collection, @Param("id") String id, @Param("data") String data, @Param("seq") long seq);
}
