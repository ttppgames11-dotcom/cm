package com.connectmaratha.api.common.live;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;

/** A live stream that reaches its time limit ends quietly: it is normal, not a server error. */
@ExtendWith(OutputCaptureExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.live.heartbeat-seconds=60", "app.live.timeout-ms=1500"})
class SseTimeoutTest extends PostgresTestBase {

    @LocalServerPort int port;
    @Autowired SseLiveUpdates live;
    @Autowired RateLimitFilter rateLimit;

    @AfterEach
    void cleanUp() {
        live.disconnectAll();
        rateLimit.reset();
    }

    @Test
    void streamThatTimesOutEndsWithoutLoggingAServerError(CapturedOutput output) {
        try (SseTestClient c = SseTestClient.open(port, "/api/test/live")) {
            c.awaitLine(l -> l.equals("event:connected"), Duration.ofSeconds(3));
            await().atMost(Duration.ofSeconds(6)).until(() -> live.connectionCount() == 0);
            await().pollDelay(Duration.ofSeconds(1)).atMost(Duration.ofSeconds(2)).until(() -> true);
        }
        assertThat(output.getAll()).doesNotContain("SERVER ERROR").doesNotContain("No converter")
            .doesNotContain("AsyncRequestTimeoutException");
    }
}
