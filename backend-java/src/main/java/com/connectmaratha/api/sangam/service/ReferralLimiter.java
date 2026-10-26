package com.connectmaratha.api.sangam.service;

import com.connectmaratha.api.common.exception.ApiException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** At most 20 referrals per giver in 24 hours (a fixed window from their first one; kept in memory, so a restart resets it). */
@Component
public class ReferralLimiter {

    static final int MAX = 20;
    static final long WINDOW_MS = 24 * 60 * 60 * 1000L;

    private record Entry(int count, long resetTime) {}

    private final ConcurrentHashMap<String, Entry> entries = new ConcurrentHashMap<>();

    public void check(String memberId) {
        long now = System.currentTimeMillis();
        Entry e = entries.compute(memberId, (k, old) -> old == null || now > old.resetTime()
            ? new Entry(1, now + WINDOW_MS)
            : new Entry(old.count() + 1, old.resetTime()));
        if (e.count() > MAX) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "खूप जास्त संदर्भ दिले आहेत. कृपया उद्या पुन्हा प्रयत्न करा (Too many referrals today).");
        }
    }

    /** For tests. */
    public void reset() {
        entries.clear();
    }
}
