package com.connectmaratha.api.common.live;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Pushes events to open browser pages (server-sent events). One instance per server: running
 * several servers would need a shared channel (e.g. Redis) behind this same interface.
 */
public interface LiveUpdates {

    /**
     * Opens a live stream on a channel for this request; a controller returns the result as is.
     * Returns null after writing a 429 RATE_LIMIT_EXCEEDED JSON reply when the caller's IP already
     * has 5 streams or the server has 500.
     */
    SseEmitter subscribe(String channel, HttpServletRequest req, HttpServletResponse res) throws IOException;

    /** Sends one named event to every stream on the channel. Returns at once: sending happens in the background. */
    void publish(String channel, String eventName, Object payload);
}
