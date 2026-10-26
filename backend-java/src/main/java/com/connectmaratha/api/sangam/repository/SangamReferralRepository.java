package com.connectmaratha.api.sangam.repository;

import com.connectmaratha.api.sangam.entity.SangamReferral;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SangamReferralRepository extends JpaRepository<SangamReferral, String> {

    @Query(nativeQuery = true, value = """
        SELECT * FROM referrals
        WHERE (CAST(:memberId AS TEXT) IS NULL OR giver_id = CAST(:memberId AS TEXT) OR recipient_id = CAST(:memberId AS TEXT))
          AND (CAST(:status AS TEXT) IS NULL OR status = CAST(:status AS TEXT))
        ORDER BY created_at DESC""")
    List<SangamReferral> search(@Param("memberId") String memberId, @Param("status") String status);

    /** value arrives as the client sent it and PostgreSQL converts it, as with Node. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name,
                               client_phone, client_email, status, value, notes, created_at)
        VALUES (:id, :title, :category, :giverId, :giverName, :recipientId, :recipientName, :clientName,
                :clientPhone, :clientEmail, 'New', CAST(:value AS DOUBLE PRECISION), :notes, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertReferral(@Param("id") String id, @Param("title") String title, @Param("category") String category,
                        @Param("giverId") String giverId, @Param("giverName") String giverName,
                        @Param("recipientId") String recipientId, @Param("recipientName") String recipientName,
                        @Param("clientName") String clientName, @Param("clientPhone") String clientPhone,
                        @Param("clientEmail") String clientEmail, @Param("value") String value, @Param("notes") String notes);

    /** status null clears it (as Node does when none is sent); value null keeps the old value. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        UPDATE referrals SET status = CAST(:status AS TEXT),
                             value = COALESCE(CAST(:value AS DOUBLE PRECISION), value)
        WHERE id = :id""")
    void updateStatus(@Param("id") String id, @Param("status") String status, @Param("value") String value);

    @Query(nativeQuery = true, value = "SELECT COUNT(*) FROM referrals")
    long countAll();

    /** [count, total value] of won referrals: the old status 'Deal Won' and the pipeline's 'Won'. */
    @Query(nativeQuery = true, value = "SELECT COUNT(*), SUM(value) FROM referrals WHERE status IN ('Won', 'Deal Won')")
    List<Object[]> wonDeals();
}
