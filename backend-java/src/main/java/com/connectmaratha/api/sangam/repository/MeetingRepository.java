package com.connectmaratha.api.sangam.repository;

import com.connectmaratha.api.sangam.entity.Meeting;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MeetingRepository extends JpaRepository<Meeting, String> {

    @Query(nativeQuery = true, value = """
        SELECT * FROM meetings
        WHERE (CAST(:memberId AS TEXT) IS NULL OR requester_id = CAST(:memberId AS TEXT) OR recipient_id = CAST(:memberId AS TEXT))
        ORDER BY date DESC, time DESC""")
    List<Meeting> search(@Param("memberId") String memberId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, location, status, notes, created_at)
        VALUES (:id, :requesterId, :requesterName, :recipientId, :recipientName, :date, :time, :topic, :location, :status, :notes,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertMeeting(@Param("id") String id, @Param("requesterId") String requesterId,
                       @Param("requesterName") String requesterName, @Param("recipientId") String recipientId,
                       @Param("recipientName") String recipientName, @Param("date") String date, @Param("time") String time,
                       @Param("topic") String topic, @Param("location") String location, @Param("status") String status,
                       @Param("notes") String notes);

    @Query(nativeQuery = true, value = "SELECT COUNT(*) FROM meetings WHERE requester_id = :requesterId AND status = :status")
    long countByRequesterAndStatus(@Param("requesterId") String requesterId, @Param("status") String status);

    /** True when the two members already have a Requested or Confirmed meeting, whoever asked. */
    @Query(nativeQuery = true, value = """
        SELECT EXISTS (SELECT 1 FROM meetings WHERE status IN ('Requested', 'Confirmed')
            AND date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND date >= :today
            AND ((requester_id = :a AND recipient_id = :b) OR (requester_id = :b AND recipient_id = :a)))""")
    boolean existsOpenBetween(@Param("a") String a, @Param("b") String b, @Param("today") String today);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        UPDATE meetings SET date = :date, time = :time, location = :location, status = 'Requested', awaiting_id = :awaitingId,
            updated_at = :updatedAt
        WHERE id = :id AND status = :from""")
    int rescheduleIf(@Param("id") String id, @Param("from") String from, @Param("date") String date, @Param("time") String time,
                     @Param("location") String location, @Param("awaitingId") String awaitingId, @Param("updatedAt") String updatedAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "UPDATE meetings SET notes = :notes, updated_at = :updatedAt WHERE id = :id")
    void updateNotes(@Param("id") String id, @Param("notes") String notes, @Param("updatedAt") String updatedAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        UPDATE meetings SET status = :status, awaiting_id = NULL, updated_at = :updatedAt
        WHERE id = :id AND status = :from""")
    int setStatusIf(@Param("id") String id, @Param("from") String from, @Param("status") String status,
                    @Param("updatedAt") String updatedAt);

    @Query(nativeQuery = true, value = "SELECT COUNT(*) FROM meetings")
    long countAll();
}
