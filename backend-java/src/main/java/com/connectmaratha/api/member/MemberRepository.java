package com.connectmaratha.api.member;


import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lookups whose exact matching rules the app depends on use the Node backend's
 * own SQL (native queries), with LIKE written as ILIKE because Node's
 * toPgSql() turns every LIKE into ILIKE on PostgreSQL.
 */
public interface MemberRepository extends JpaRepository<Member, String> {

    Optional<Member> findByEmailIgnoreCase(String email);

    /** A member's own referral code, as stored by registration (REF-96K-...). */
    @Query("select m from Member m where upper(m.referenceId) = upper(:code) or upper(m.referralId) = upper(:code)")
    Optional<Member> findByReferralCode(@Param("code") String code);

    /** Login: id, email (any case), exact phone, or a phone ending in the last 10 digits. */
    @Query(nativeQuery = true, value = """
        SELECT * FROM members
        WHERE id = :id
           OR LOWER(email) = LOWER(:id)
           OR phone = :id
           OR (:digits10 != '' AND (phone ILIKE :suffix OR phone ILIKE :contains))
        LIMIT 1""")
    Optional<Member> findForLogin(@Param("id") String id, @Param("digits10") String digits10,
                                  @Param("suffix") String suffix, @Param("contains") String contains);

    /** Referral code check: reference/referral code, member id, or a 10-digit phone. */
    @Query(nativeQuery = true, value = """
        SELECT * FROM members
        WHERE UPPER(reference_id) = :code
           OR UPPER(referral_id) = :code
           OR UPPER(id) = :code
           OR (:digits10 != '' AND SUBSTR(phone, -10) = :digits10)
        LIMIT 1""")
    Optional<Member> findReferrer(@Param("code") String upperCode, @Param("digits10") String digits10);

    /** Registration duplicate check (only non-empty values, exact match). */
    @Query(nativeQuery = true, value = """
        SELECT * FROM members
        WHERE (:email != '' AND email = :email)
           OR (:phone != '' AND phone = :phone)
        LIMIT 1""")
    Optional<Member> findExisting(@Param("email") String email, @Param("phone") String phone);

    /** Website delete-account request: email, member id, or a phone ending in the digits. */
    @Query(nativeQuery = true, value = """
        SELECT * FROM members
        WHERE LOWER(email) = LOWER(:identifier) OR UPPER(id) = UPPER(:identifier)
           OR (:digits10 != '' AND phone ILIKE :suffix)
        LIMIT 1""")
    Optional<Member> findForDeletionRequest(@Param("identifier") String identifier,
                                            @Param("digits10") String digits10, @Param("suffix") String suffix);

    /** Members who registered with one of this member's codes, newest first. */
    @Query(nativeQuery = true, value = """
        SELECT * FROM members
        WHERE id != :id AND (UPPER(referred_by) = :refId OR UPPER(referred_by) = :code OR UPPER(referred_by) = :memberId)
        ORDER BY created_at DESC""")
    List<Member> findReferredBy(@Param("id") String id, @Param("refId") String refId,
                                @Param("code") String code, @Param("memberId") String memberId);

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "UPDATE members SET total_referrals = COALESCE(total_referrals, 0) + 1 WHERE id = :id")
    void incrementTotalReferrals(@Param("id") String id);
    /** Directory search: every filter is optional (empty means "any"); text matches are case-insensitive substrings. */
    @Query(nativeQuery = true, value = """
        SELECT * FROM members
        WHERE (CAST(:district AS TEXT) IS NULL OR district = CAST(:district AS TEXT))
          AND (CAST(:tier AS TEXT) IS NULL OR tier = CAST(:tier AS TEXT))
          AND (CAST(:profession AS TEXT) IS NULL OR profession ILIKE CONCAT('%', CAST(:profession AS TEXT), '%'))
          AND (CAST(:search AS TEXT) IS NULL
               OR name ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR profession ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR business ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR city ILIKE CONCAT('%', CAST(:search AS TEXT), '%'))
        ORDER BY id ASC""")
    List<Member> search(@Param("district") String district, @Param("tier") String tier,
                        @Param("profession") String profession, @Param("search") String search);

    long countByTier(String tier);

    @Query(nativeQuery = true, value = "SELECT COUNT(DISTINCT district) FROM members")
    long countDistinctDistricts();
}
