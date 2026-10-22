package com.connectmaratha.api.donation.repository;

import com.connectmaratha.api.donation.entity.Campaign;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CampaignRepository extends JpaRepository<Campaign, String> {

    @Query(nativeQuery = true, value = "SELECT * FROM campaigns WHERE active = 1 ORDER BY target DESC")
    List<Campaign> findActive();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "UPDATE campaigns SET collected = collected + :amount, donors = donors + 1 WHERE id = :id")
    void addDonation(@Param("id") String id, @Param("amount") double amount);
}
