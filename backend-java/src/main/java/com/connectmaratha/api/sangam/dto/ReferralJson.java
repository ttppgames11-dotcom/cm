package com.connectmaratha.api.sangam.dto;

import com.connectmaratha.api.sangam.entity.SangamReferral;
import java.util.Map;

/** A referral as its giver, receiver or an admin sees it. */
public final class ReferralJson {

    private ReferralJson() {}

    /**
     * The usual referral fields plus business_id and, for a viewer who is the giver or the receiver,
     * role ("giver" or "receiver"); an admin who is neither gets no role.
     */
    public static Map<String, Object> referral(Map<String, Object> base, SangamReferral r, String businessId, String viewerId) {
        base.put("business_id", businessId);
        if (viewerId != null) {
            if (viewerId.equals(r.getGiverId())) base.put("role", "giver");
            else if (viewerId.equals(r.getRecipientId())) base.put("role", "receiver");
        }
        return base;
    }
}
