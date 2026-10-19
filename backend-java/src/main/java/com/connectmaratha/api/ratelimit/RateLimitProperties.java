package com.connectmaratha.api.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Limits under app.rate-limit; same env names and defaults as the Node backend. */
@ConfigurationProperties(prefix = "app.rate-limit")
public record RateLimitProperties(
    long publicWindowMs,
    int publicMax,
    long userWindowMs,
    int userMax,
    long authIpWindowMs,
    int authIpMax
) {
}
