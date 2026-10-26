package com.connectmaratha.api.sangam.service;

import com.connectmaratha.api.sangam.entity.SangamReferral;
import com.connectmaratha.api.sangam.repository.MeetingRepository;
import com.connectmaratha.api.sangam.repository.SangamReferralRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Business networking totals and the shared referral row shape. Referrals live in {@link ReferralService} and
 * meetings in {@link MeetingService}.
 */
@Service
public class SangamService {

    private final SangamReferralRepository referrals;
    private final MeetingRepository meetings;

    public SangamService(SangamReferralRepository referrals, MeetingRepository meetings) {
        this.referrals = referrals;
        this.meetings = meetings;
    }

    public Map<String, Object> metrics() {
        Object[] won = referrals.wonDeals().get(0);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalReferrals", referrals.countAll());
        m.put("wonDeals", won[0] == null ? 0 : ((Number) won[0]).longValue());
        m.put("totalBusinessValue", won[1] == null ? 0.0 : ((Number) won[1]).doubleValue());
        m.put("totalMeetings", meetings.countAll());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("metrics", m);
        return out;
    }

    static Map<String, Object> referral(SangamReferral r) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", r.getId());
        o.put("title", r.getTitle());
        o.put("category", r.getCategory());
        o.put("giver_id", r.getGiverId());
        o.put("giver_name", r.getGiverName());
        o.put("recipient_id", r.getRecipientId());
        o.put("recipient_name", r.getRecipientName());
        o.put("client_name", r.getClientName());
        o.put("client_phone", r.getClientPhone());
        o.put("client_email", r.getClientEmail());
        o.put("status", r.getStatus());
        o.put("value", r.getValue());
        o.put("notes", r.getNotes());
        o.put("created_at", r.getCreatedAt());
        o.put("type", r.getType());
        o.put("referral_id", r.getReferralId());
        o.put("reference_id", r.getReferenceId());
        o.put("referrer_id", r.getReferrerId());
        o.put("referrer_referral_id", r.getReferrerReferralId());
        o.put("referrer_name", r.getReferrerName());
        o.put("referee_id", r.getRefereeId());
        o.put("referee_referral_id", r.getRefereeReferralId());
        o.put("referee_name", r.getRefereeName());
        o.put("referee_phone", r.getRefereePhone());
        o.put("referee_district", r.getRefereeDistrict());
        o.put("referee_city", r.getRefereeCity());
        return o;
    }
}
