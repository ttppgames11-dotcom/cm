package com.connectmaratha.api.donation.repository;

import com.connectmaratha.api.donation.entity.Donation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DonationRepository extends JpaRepository<Donation, String> {

    @Query(nativeQuery = true, value = "SELECT * FROM donations WHERE campaign_id = :campaignId ORDER BY created_at DESC LIMIT 10")
    List<Donation> latestForCampaign(@Param("campaignId") String campaignId);

    @Query(nativeQuery = true, value = "SELECT * FROM donations ORDER BY created_at DESC LIMIT 15")
    List<Donation> latest();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO donations (id, campaign_id, campaign_title, donor_name, donor_id, amount, payment_method, phone, is_anonymous, tx_id, created_at)
        VALUES (:id, :campaignId, :campaignTitle, :donorName, :donorId, :amount, :paymentMethod, :phone, :anonymous, :txId,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertDonation(@Param("id") String id, @Param("campaignId") String campaignId,
                        @Param("campaignTitle") String campaignTitle, @Param("donorName") String donorName,
                        @Param("donorId") String donorId, @Param("amount") double amount,
                        @Param("paymentMethod") String paymentMethod, @Param("phone") String phone,
                        @Param("anonymous") int anonymous, @Param("txId") String txId);
}
