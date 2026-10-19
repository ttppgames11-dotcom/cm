package com.connectmaratha.api.member;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, String> {

    Optional<Member> findByEmailIgnoreCase(String email);

    /** A member's own referral code, as stored by registration (REF-96K-...). */
    @Query("select m from Member m where upper(m.referenceId) = upper(:code) or upper(m.referralId) = upper(:code)")
    Optional<Member> findByReferralCode(@Param("code") String code);
}
