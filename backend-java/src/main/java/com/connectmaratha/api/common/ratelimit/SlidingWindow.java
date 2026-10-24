package com.connectmaratha.api.common.ratelimit;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding-window counter per key — the Node limiter's
 * Map<key, timestamps[]>. Like Node, counts reset when the server restarts.
 */
final class SlidingWindow {

    /** Outcome of one check: allowed or not, and the numbers for the headers. */
    record Result(boolean allowed, int limit, int remaining, long resetEpochSeconds, long retryAfterSeconds) {}

    private final ConcurrentHashMap<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    /** Counts this request unless the key is already at the limit. */
    Result hit(String key, int max, long windowMs, long nowMs) {
        Deque<Long> times = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && nowMs - times.peekFirst() >= windowMs) times.pollFirst();
            long resetMs = times.isEmpty() ? nowMs + windowMs : times.peekFirst() + windowMs;
            long resetSeconds = (long) Math.ceil(resetMs / 1000.0);
            if (times.size() >= max) {
                long retryAfter = Math.max(1, (long) Math.ceil((resetMs - nowMs) / 1000.0));
                return new Result(false, max, 0, resetSeconds, retryAfter);
            }
            int remaining = Math.max(0, max - times.size());
            times.addLast(nowMs);
            return new Result(true, max, remaining > 0 ? remaining - 1 : 0, resetSeconds, 0);
        }
    }

    void remove(String key) {
        hits.remove(key);
    }

    void clear() {
        hits.clear();
    }
}
