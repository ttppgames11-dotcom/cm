package com.connectmaratha.api.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/** Enforces {@link RequireAuth} with the Node backend's statuses and messages. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    static final String TOKEN_MISSING = "प्रमाणीकरण आवश्यक आहे (Token missing)";
    static final String TOKEN_INVALID = "अवैध टोकन (Invalid or expired token)";

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if (!(handler instanceof HandlerMethod method)) return true;
        boolean required = method.hasMethodAnnotation(RequireAuth.class)
            || method.getBeanType().isAnnotationPresent(RequireAuth.class);
        if (!required || req.getAttribute(CurrentUser.ATTRIBUTE) != null) return true;

        if (Boolean.TRUE.equals(req.getAttribute(CurrentUser.INVALID_TOKEN_ATTRIBUTE))) {
            throw ApiException.plain(HttpStatus.FORBIDDEN, TOKEN_INVALID);
        }
        throw ApiException.plain(HttpStatus.UNAUTHORIZED, TOKEN_MISSING);
    }
}
