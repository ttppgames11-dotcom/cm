package com.connectmaratha.api.common.live;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;

/** Reads a server-sent-events stream line by line over a real HTTP connection (tests only). */
public final class SseTestClient implements AutoCloseable {

    private static final HttpClient HTTP = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();

    private final HttpResponse<InputStream> response;
    private final LinkedBlockingQueue<String> lines = new LinkedBlockingQueue<>();
    private final List<String> seen = new CopyOnWriteArrayList<>();

    private SseTestClient(HttpResponse<InputStream> response) {
        this.response = response;
        Thread reader = new Thread(this::drain, "sse-test-reader");
        reader.setDaemon(true);
        reader.start();
    }

    /** Opens the stream and returns as soon as the response headers arrive, whatever the status. */
    public static SseTestClient open(int port, String path) {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .header("Accept", "text/event-stream")
            .GET()
            .build();
        try {
            return new SseTestClient(HTTP.sendAsync(request, HttpResponse.BodyHandlers.ofInputStream()).get(10, TimeUnit.SECONDS));
        } catch (Exception e) {
            throw new AssertionError("could not open " + path, e);
        }
    }

    public int status() {
        return response.statusCode();
    }

    public String contentType() {
        return response.headers().firstValue("Content-Type").orElse("");
    }

    /** The first line (from now on) that matches, or a test failure listing every line received. */
    public String awaitLine(Predicate<String> match, Duration timeout) {
        long deadline = System.nanoTime() + timeout.toNanos();
        while (true) {
            long left = deadline - System.nanoTime();
            if (left <= 0) throw new AssertionError("no matching line within " + timeout + "; lines received: " + seen);
            String line;
            try {
                line = lines.poll(left, TimeUnit.NANOSECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new AssertionError("interrupted", e);
            }
            if (line != null && match.test(line)) return line;
        }
    }

    /** True when no matching line arrives during the whole window. */
    public boolean noLineWithin(Predicate<String> match, Duration window) {
        try {
            awaitLine(match, window);
            return false;
        } catch (AssertionError none) {
            return true;
        }
    }

    @Override
    public void close() {
        try {
            response.body().close();
        } catch (IOException ignored) {
            // already closed
        }
    }

    private void drain() {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body(), UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                seen.add(line);
                lines.add(line);
            }
        } catch (IOException closed) {
            // the stream was closed by close() or by the server
        }
    }
}
