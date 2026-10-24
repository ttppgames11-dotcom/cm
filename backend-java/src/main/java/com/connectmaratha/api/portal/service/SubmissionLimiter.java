package com.connectmaratha.api.portal.service;

import com.connectmaratha.api.common.exception.ApiException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * At most 20 form submissions (blood, matrimony, grievances, volunteers, women's help, loans,
 * doctors) per IP in 15 minutes. The forms need no login, so this stops one sender or bot from
 * filling the public lists with junk. Not in the Node backend.
 */
@Component
public class SubmissionLimiter {

    static final long WINDOW_MS = 15 * 60 * 1000;
    static final int MAX = 20;

    private record Entry(int count, long resetTime) {}

    private final ConcurrentHashMap<String, Entry> entries = new ConcurrentHashMap<>();

    public void check(String ip) {
        long now = System.currentTimeMillis();
        Entry e = entries.compute(ip == null ? "unknown" : ip, (k, old) -> {
            if (old == null || now > old.resetTime()) return new Entry(1, now + WINDOW_MS);
            return new Entry(old.count() + 1, old.resetTime());
        });
        if (e.count() > MAX) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "खूप जास्त अर्ज पाठवले आहेत. कृपया १५ मिनिटांनंतर पुन्हा प्रयत्न करा (Too many submissions, try again in 15 minutes).");
        }
        // Forget expired senders now and then, so the map cannot grow without limit.
        if (entries.size() > 10_000) entries.values().removeIf(old -> now > old.resetTime());
    }

    /** For tests. */
    public void reset() {
        entries.clear();
    }
}
