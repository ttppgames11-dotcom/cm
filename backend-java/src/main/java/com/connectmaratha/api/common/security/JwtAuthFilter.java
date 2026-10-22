package com.connectmaratha.api.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads "Authorization: Bearer <token>" on every request, like the Node
 * backend's global optionalToken: a valid token sets the CurrentUser, a
 * missing one does nothing. Endpoints that need login use {@link RequireAuth}.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;

    public JwtAuthFilter(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && !header.isBlank()) {
            // Same split as Node: authHeader.split(' ')[1]
            String[] parts = header.trim().split(" ");
            String token = parts.length > 1 ? parts[1] : null;
            if (token != null) {
                // A password-reset token ("purpose" claim) proves an email OTP, not a login.
                // Node accepted it as a login token for 15 minutes; Java does not.
                jwt.parse(token).ifPresentOrElse(
                    claims -> {
                        if (claims.get("purpose") != null) {
                            req.setAttribute(CurrentUser.INVALID_TOKEN_ATTRIBUTE, Boolean.TRUE);
                        } else {
                            req.setAttribute(CurrentUser.ATTRIBUTE, CurrentUser.from(claims));
                        }
                    },
                    () -> req.setAttribute(CurrentUser.INVALID_TOKEN_ATTRIBUTE, Boolean.TRUE));
            }
        }
        chain.doFilter(req, res);
    }
}
