package com.connectmaratha.api.common.exception;

import org.springframework.http.HttpStatus;

/**
 * An error with a status, a machine code and a member-facing message, sent as
 * { success: false, code, error } — the Node backend's error shape. Some Node
 * errors have no code; {@link #plain} makes those ({ success: false, error }).
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    /** An error reply without a "code" field, as several Node endpoints send. */
    public static ApiException plain(HttpStatus status, String message) {
        return new ApiException(status, null, message);
    }

    public HttpStatus getStatus() { return status; }
    /** Null for {@link #plain} errors. */
    public String getCode() { return code; }

    public static ApiException badRequest(String code, String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, code, message);
    }

    public static ApiException notFound(String code, String message) {
        return new ApiException(HttpStatus.NOT_FOUND, code, message);
    }

    public static ApiException forbidden(String code, String message) {
        return new ApiException(HttpStatus.FORBIDDEN, code, message);
    }
}
