package com.connectmaratha.api.directory.controller;

import com.connectmaratha.api.common.exception.ApiException;
import java.util.function.Supplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

/**
 * The builders/dairy endpoints answer unexpected errors in their own format (as Node's
 * directories routes do): { success: false, error: <generic message>, code: "INTERNAL_ERROR" }.
 */
final class DirectoryErrors {

    private static final Logger log = LoggerFactory.getLogger(DirectoryErrors.class);
    private static final String MESSAGE = "सर्व्हरवर तांत्रिक अडचण आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा (Internal server error).";

    private DirectoryErrors() {}

    static <T> T guard(Supplier<T> action) {
        try {
            return action.get();
        } catch (ApiException e) {
            throw e;
        } catch (RuntimeException e) {
            log.error("[DIRECTORIES ERROR INTERNAL_ERROR]", e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", MESSAGE);
        }
    }
}
