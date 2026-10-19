package com.connectmaratha.api.validation;

import com.connectmaratha.api.web.ApiException;
import java.util.List;
import org.springframework.http.HttpStatus;

/** 400 { success:false, code:'VALIDATION_ERROR', error: first, errors: all } — Node's validateBody reply. */
public class ValidationException extends ApiException {

    private final List<String> errors;

    public ValidationException(List<String> errors) {
        super(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", errors.get(0));
        this.errors = List.copyOf(errors);
    }

    public List<String> getErrors() { return errors; }
}
