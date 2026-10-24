package com.connectmaratha.api.common.live;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;

/** The shared live-update hub over real HTTP: first event, published events, heartbeats, limits, clean-up. */
@ExtendWith(OutputCaptureExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "app.live.heartbeat-seconds=1")
class SseLiveUpdatesTest extends PostgresTestBase {

    @LocalServerPort int port;
    @Autowired SseLiveUpdates live;
    @Autowired RateLimitFilter rateLimit;

    private final List<SseTestClient> clients = new ArrayList<>();

    private SseTestClient open() {
        SseTestClient c = SseTestClient.open(port, "/api/test/live");
        clients.add(c);
        return c;
    }

    @AfterEach
    void cleanUp() {
        clients.forEach(SseTestClient::close);
        live.disconnectAll();
        rateLimit.reset();
    }

    @Test
    void streamStartsWithConnectedThenDeliversEventsAndHeartbeats() {
        SseTestClient c = open();
        assertThat(c.status()).isEqualTo(200);
        assertThat(c.contentType()).startsWith("text/event-stream");
        c.awaitLine(l -> l.equals("retry:5000"), Duration.ofSeconds(3));
        c.awaitLine(l -> l.equals("event:connected"), Duration.ofSeconds(3));
        live.publish("test", "demo", Map.of("n", 1));
        c.awaitLine(l -> l.equals("event:demo"), Duration.ofSeconds(3));
        c.awaitLine(l -> l.equals("data:{\"n\":1}"), Duration.ofSeconds(3));
        c.awaitLine(l -> l.startsWith(":"), Duration.ofSeconds(3)); // heartbeat comment
    }

    @Test
    void sixthStreamFromOneIpIsRefusedWith429() {
        for (int i = 0; i < 5; i++) assertThat(open().status()).isEqualTo(200);
        SseTestClient sixth = open();
        assertThat(sixth.status()).isEqualTo(429);
        assertThat(sixth.contentType()).startsWith("application/json");
        sixth.awaitLine(l -> l.contains("\"code\":\"RATE_LIMIT_EXCEEDED\""), Duration.ofSeconds(3));
    }

    @Test
    void closedStreamsAreForgottenWithoutLoggingAServerError(CapturedOutput output) {
        SseTestClient c = open();
        c.awaitLine(l -> l.equals("event:connected"), Duration.ofSeconds(3));
        c.close();
        // the next heartbeats (every second) fail to send and drop it
        await().atMost(Duration.ofSeconds(5)).until(() -> live.connectionCount() == 0);
        // a visitor closing the page is normal, not a server error
        await().pollDelay(Duration.ofSeconds(2)).atMost(Duration.ofSeconds(3)).until(() -> true);
        assertThat(output.getAll()).doesNotContain("SERVER ERROR").doesNotContain("No converter");
    }
}
