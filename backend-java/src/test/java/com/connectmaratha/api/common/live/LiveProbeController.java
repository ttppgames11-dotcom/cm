package com.connectmaratha.api.common.live;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Test-only live stream on the "test" channel, to exercise the live-update hub. */
@RestController
class LiveProbeController {

    private final LiveUpdates live;

    LiveProbeController(LiveUpdates live) {
        this.live = live;
    }

    @GetMapping("/api/test/live")
    SseEmitter stream(HttpServletRequest req, HttpServletResponse res) throws IOException {
        return live.subscribe("test", req, res);
    }
}
