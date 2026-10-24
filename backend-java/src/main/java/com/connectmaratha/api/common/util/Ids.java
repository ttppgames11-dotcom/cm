package com.connectmaratha.api.common.util;

import java.security.SecureRandom;
import java.util.function.Predicate;

/**
 * Record ids in the Node backend's formats. Node picks them blindly and fails (500) when
 * one is already taken; these skip taken ids instead.
 */
public final class Ids {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Ids() {}

    /** prefix + milliseconds ("REV-1729...") ; two in the same millisecond move on by one. */
    public static String millis(String prefix, Predicate<String> taken) {
        long now = System.currentTimeMillis();
        while (taken.test(prefix + now)) now++;
        return prefix + now;
    }

    /** prefix + a random 2-digit number 10-99 ("B42"), as Node; falls back to milliseconds when all are taken. */
    public static String twoDigit(String prefix, Predicate<String> taken) {
        return twoDigit(prefix, taken, 10, 100);
    }

    /** prefix + a random number from min (inclusive) to max (exclusive), e.g. REF-100..999 for sangam referrals. */
    public static String twoDigit(String prefix, Predicate<String> taken, int min, int max) {
        for (int i = 0; i < 3 * (max - min); i++) {
            String id = prefix + (min + RANDOM.nextInt(max - min));
            if (!taken.test(id)) return id;
        }
        return millis(prefix, taken);
    }

    /** Math.random().toString(36).slice(2, 2 + length): random lowercase letters and digits. */
    public static String base36(int length) {
        String alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) sb.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
        return sb.toString();
    }

    /** A random whole number from min (inclusive) to max (exclusive). */
    public static int between(int min, int max) {
        return min + RANDOM.nextInt(max - min);
    }
}
