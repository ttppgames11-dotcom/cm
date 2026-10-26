package com.connectmaratha.api.business.repository;

import com.connectmaratha.api.business.entity.Business;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessRepository extends JpaRepository<Business, String> {

    /** Every filter optional; text search is a case-insensitive substring (Node's LIKE becomes ILIKE). */
    @Query(nativeQuery = true, value = """
        SELECT * FROM businesses
        WHERE (status IS NULL OR status <> 'hidden')
          AND (CAST(:cat AS TEXT) IS NULL OR cat = CAST(:cat AS TEXT))
          AND (CAST(:district AS TEXT) IS NULL OR district = CAST(:district AS TEXT))
          AND (CAST(:search AS TEXT) IS NULL
               OR name ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR owner ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR services ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR city ILIKE CONCAT('%', CAST(:search AS TEXT), '%'))
        ORDER BY rating DESC""")
    List<Business> search(@Param("cat") String cat, @Param("district") String district, @Param("search") String search);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO businesses (id, name, owner, cat, city, district, photo, phone, whatsapp, website, hours, services, offers, rating, created_at, owner_id, status)
        VALUES (:id, :name, :owner, :cat, :city, :district, :photo, :phone, :whatsapp, :website, :hours, :services, :offers, 5.0,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS'), :ownerId, 'visible')""")
    void insertBusiness(@Param("id") String id, @Param("name") String name, @Param("owner") String owner,
                        @Param("cat") String cat, @Param("city") String city, @Param("district") String district,
                        @Param("photo") String photo, @Param("phone") String phone, @Param("whatsapp") String whatsapp,
                        @Param("website") String website, @Param("hours") String hours, @Param("services") String services,
                        @Param("offers") String offers, @Param("ownerId") String ownerId);

    /** A member's own businesses, hidden ones included, newest first. */
    @Query(nativeQuery = true, value = "SELECT * FROM businesses WHERE owner_id = :ownerId ORDER BY created_at DESC, id DESC")
    List<Business> findByOwner(@Param("ownerId") String ownerId);
}
