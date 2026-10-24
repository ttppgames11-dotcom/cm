package com.connectmaratha.api.directory.service;

import com.connectmaratha.api.common.exception.ApiException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * At most 10 builder/dairy enquiries and registrations per visitor in 15 minutes (shared by all
 * three), counted the way the Node limiter counts: every attempt counts, the 11th is refused.
 */
@Component
public class EnquiryLimiter {

    static final long WINDOW_MS = 15 * 60 * 1000;
    static final int MAX = 10;

    private record Entry(int count, long resetTime) {}

    private final ConcurrentHashMap<String, Entry> entries = new ConcurrentHashMap<>();

    public void check(String ip) {
        long now = System.currentTimeMillis();
        Entry e = entries.compute(ip == null ? "unknown" : ip, (k, old) -> {
            if (old == null) return new Entry(1, now + WINDOW_MS);
            if (now > old.resetTime()) return new Entry(1, now + WINDOW_MS);
            return new Entry(old.count() + 1, old.resetTime());
        });
        if (e.count() > MAX) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "खूप जास्त चौकशी विनंत्या पाठवल्या आहेत. कृपया १५ मिनिटांनंतर पुन्हा प्रयत्न करा (Too many enquiry requests).");
        }
    }

    /** For tests. */
    public void reset() {
        entries.clear();
    }
}
