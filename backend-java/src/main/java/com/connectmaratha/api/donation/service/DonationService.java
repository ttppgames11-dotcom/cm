package com.connectmaratha.api.donation.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.donation.entity.Campaign;
import com.connectmaratha.api.donation.entity.Donation;
import com.connectmaratha.api.donation.repository.CampaignRepository;
import com.connectmaratha.api.donation.repository.DonationRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Donation campaigns and gifts (backend/routes/donations.routes.js). */
@Service
public class DonationService {

    private final CampaignRepository campaigns;
    private final DonationRepository donations;

    public DonationService(CampaignRepository campaigns, DonationRepository donations) {
        this.campaigns = campaigns;
        this.donations = donations;
    }

    public Map<String, Object> activeCampaigns() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Campaign c : campaigns.findActive()) rows.add(campaign(c));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("campaigns", rows);
        return out;
    }

    public Map<String, Object> campaignDetail(String id) {
        Campaign c = campaigns.findById(id).orElseThrow(() -> ApiException.plain(HttpStatus.NOT_FOUND, "अभियान सापडले नाही."));
        Map<String, Object> json = campaign(c);
        List<Map<String, Object>> recent = new ArrayList<>();
        for (Donation d : donations.latestForCampaign(id)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("donor_name", d.getDonorName());
            row.put("amount", d.getAmount());
            row.put("is_anonymous", d.getIsAnonymous());
            row.put("created_at", d.getCreatedAt());
            recent.add(row);
        }
        json.put("recentDonations", recent);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("campaign", json);
        return out;
    }

    /** Records a gift and returns the receipt. A gift for a named campaign is added to its totals. */
    @Transactional
    public Map<String, Object> donate(Map<String, Object> b) {
        Double amount = Js.parseFloat(b.get("amount"));
        if (amount == null || amount == 0 || amount <= 0) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "कृपया वैध देणगी रक्कम प्रविष्ट करा.");
        }
        boolean anonymous = Js.truthy(b.get("is_anonymous"));
        String txId = "TXN-" + Ids.base36(8).toUpperCase(Locale.ROOT);
        String donationId = Ids.millis("DON-", donations::existsById);
        Object campaignId = b.get("campaign_id");

        donations.insertDonation(donationId, Js.orElse(campaignId, "C01"), Js.orElse(b.get("campaign_title"), "रायगड संवर्धन"),
            Js.orElse(b.get("donor_name"), "समाज बांधव"), Js.orElse(b.get("donor_id"), "M1001"), amount,
            Js.orElse(b.get("payment_method"), "UPI"), Js.textOrEmpty(b.get("phone")), anonymous ? 1 : 0, txId);
        if (Js.truthy(campaignId)) campaigns.addDonation(Js.string(campaignId), amount);

        Map<String, Object> receipt = new LinkedHashMap<>();
        receipt.put("donationId", donationId);
        receipt.put("txId", txId);
        receipt.put("amount", amount);
        receipt.put("donor_name", anonymous ? "गुप्त दान" : Js.orElse(b.get("donor_name"), "समाज बांधव"));
        receipt.put("campaign_title", Js.orElse(b.get("campaign_title"), "रायगड संवर्धन अभियान"));
        receipt.put("date", LocalDate.now(ZoneOffset.UTC).toString());
        receipt.put("taxDeduction80G", "80G(5)(vi) अंतर्गत आयकर सवलत पात्र");
        receipt.put("receiptNumber", "CM-80G-" + Ids.between(10000, 100000));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "देणगी यशस्वीरित्या स्वीकारली! आपले मनःपूर्वक आभार.");
        out.put("receipt", receipt);
        return out;
    }

    public Map<String, Object> recent() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Donation d : donations.latest()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", d.getId());
            row.put("campaign_title", d.getCampaignTitle());
            row.put("donor_name", d.getDonorName());
            row.put("amount", d.getAmount());
            row.put("is_anonymous", d.getIsAnonymous());
            row.put("created_at", d.getCreatedAt());
            rows.add(row);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("donations", rows);
        return out;
    }

    static Map<String, Object> campaign(Campaign c) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", c.getId());
        out.put("cat", c.getCat());
        out.put("title", c.getTitle());
        out.put("icon", c.getIcon());
        out.put("target", c.getTarget());
        out.put("collected", c.getCollected());
        out.put("donors", c.getDonors());
        out.put("cover", c.getCover());
        out.put("desc", c.getDesc());
        out.put("expenses", c.getExpenses());
        out.put("active", c.getActive());
        out.put("created_at", c.getCreatedAt());
        return out;
    }
}
