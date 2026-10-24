package com.connectmaratha.api.business.repository;

import com.connectmaratha.api.business.entity.BusinessReview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessReviewRepository extends JpaRepository<BusinessReview, String> {

    @Query(nativeQuery = true, value = "SELECT * FROM business_reviews WHERE business_id = :businessId ORDER BY created_at DESC")
    List<BusinessReview> findForBusiness(@Param("businessId") String businessId);

    /** rating arrives as the client sent it (number or text) and is converted by PostgreSQL, as with Node. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO business_reviews (id, business_id, member_name, rating, text, created_at)
        VALUES (:id, :businessId, :memberName, CAST(:rating AS INTEGER), :text, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertReview(@Param("id") String id, @Param("businessId") String businessId, @Param("memberName") String memberName,
                      @Param("rating") String rating, @Param("text") String text);
}
