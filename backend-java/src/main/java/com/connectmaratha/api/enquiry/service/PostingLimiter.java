package com.connectmaratha.api.enquiry.service;

import com.connectmaratha.api.common.exception.ApiException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Anti-spam limits per member: 10 requirements per 24 hours and 30 quotes per hour. Fixed windows
 * that start at the member's first post or quote; kept in memory, so a restart resets them.
 */
@Component
public class PostingLimiter {

    static final int MAX_POSTS = 10;
    static final long POST_WINDOW_MS = 24 * 60 * 60 * 1000L;
    static final int MAX_QUOTES = 30;
    static final long QUOTE_WINDOW_MS = 60 * 60 * 1000L;

    private record Entry(int count, long resetTime) {}

    private final ConcurrentHashMap<String, Entry> posts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Entry> quotes = new ConcurrentHashMap<>();

    public void checkPost(String memberId) {
        check(posts, memberId, MAX_POSTS, POST_WINDOW_MS,
            "खूप जास्त मागण्या पोस्ट केल्या आहेत. कृपया उद्या पुन्हा प्रयत्न करा (Too many requirements today).");
    }

    public void checkQuote(String memberId) {
        check(quotes, memberId, MAX_QUOTES, QUOTE_WINDOW_MS,
            "खूप जास्त कोटेशन्स पाठवली आहेत. कृपया एका तासानंतर पुन्हा प्रयत्न करा (Too many quotes, try again in an hour).");
    }

    /** For tests. */
    public void reset() {
        posts.clear();
        quotes.clear();
    }

    private static void check(ConcurrentHashMap<String, Entry> counts, String memberId, int max, long windowMs, String message) {
        long now = System.currentTimeMillis();
        Entry e = counts.compute(memberId, (k, old) -> old == null || now > old.resetTime()
            ? new Entry(1, now + windowMs)
            : new Entry(old.count() + 1, old.resetTime()));
        if (e.count() > max) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED", message);
    }
}
