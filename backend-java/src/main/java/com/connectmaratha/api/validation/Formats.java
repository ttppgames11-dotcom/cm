package com.connectmaratha.api.validation;

import java.util.Map;
import java.util.regex.Pattern;

/** The Node validator's FORMATS, same regular expressions. */
public final class Formats {

    private Formats() {}

    static final Map<String, Pattern> ALL = Map.of(
        "email", Pattern.compile(
            "^[a-zA-Z0-9_!#$%&'*+/=?^`{|}~-]+(?:\\.[a-zA-Z0-9_!#$%&'*+/=?^`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"),
        "phone", Pattern.compile("^(?:(?:\\+?91|0)?[6-9]\\d{9}|\\+[1-9]\\d{9,14})$"),
        "otp", Pattern.compile("^\\d{6}$"),
        "jwt", Pattern.compile("^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$"),
        "memberId", Pattern.compile("^M\\d{3,8}$", Pattern.CASE_INSENSITIVE),
        "referenceId", Pattern.compile("^REF-[A-Z0-9]{2,5}-\\d{3,8}$", Pattern.CASE_INSENSITIVE),
        "safeText", Pattern.compile("^[\\p{L}\\p{N}\\s.,_@#()'\"/-]*$"),
        "code", Pattern.compile("^[A-Za-z0-9_-]+$"),
        "url", Pattern.compile(
            "^https?://(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$")
    );
}
