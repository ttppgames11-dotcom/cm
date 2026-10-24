package com.connectmaratha.api.event.repository;

import com.connectmaratha.api.event.entity.Event;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, String> {

    @Query(nativeQuery = true, value = """
        SELECT * FROM events
        WHERE (CAST(:district AS TEXT) IS NULL OR district = CAST(:district AS TEXT))
          AND (CAST(:category AS TEXT) IS NULL OR category = CAST(:category AS TEXT))
        ORDER BY date ASC""")
    List<Event> search(@Param("district") String district, @Param("category") String category);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO events (id, title, category, date, time, venue, district, "desc", organizer, banner, rsvp_count, created_at)
        VALUES (:id, :title, :category, :date, :time, :venue, :district, :desc, :organizer, :banner, 0,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertEvent(@Param("id") String id, @Param("title") String title, @Param("category") String category,
                     @Param("date") String date, @Param("time") String time, @Param("venue") String venue,
                     @Param("district") String district, @Param("desc") String desc, @Param("organizer") String organizer,
                     @Param("banner") String banner);

    @Query(nativeQuery = true, value = "SELECT COUNT(*) > 0 FROM event_rsvps WHERE id = :id")
    boolean rsvpExists(@Param("id") String id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO event_rsvps (id, event_id, member_id, member_name, phone, seats, created_at)
        VALUES (:id, :eventId, :memberId, :memberName, :phone, CAST(:seats AS INTEGER), to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertRsvp(@Param("id") String id, @Param("eventId") String eventId, @Param("memberId") String memberId,
                    @Param("memberName") String memberName, @Param("phone") String phone, @Param("seats") String seats);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "UPDATE events SET rsvp_count = rsvp_count + CAST(:seats AS INTEGER) WHERE id = :id")
    void addSeats(@Param("id") String id, @Param("seats") String seats);
}
