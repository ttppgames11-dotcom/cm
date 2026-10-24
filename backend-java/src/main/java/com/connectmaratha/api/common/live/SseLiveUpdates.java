package com.connectmaratha.api.common.live;

import com.connectmaratha.api.common.web.ClientIp;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter.SseEventBuilder;

/**
 * The open streams live in memory. Every send (events and heartbeats) happens on one background
 * thread, so the request that caused an event never waits for a slow connection and sends to one
 * stream never overlap. A stream that fails to send is dropped.
 */
@Component
public class SseLiveUpdates implements LiveUpdates {

    static final int MAX_PER_IP = 5;
    static final int MAX_TOTAL = 500;
    static final long TIMEOUT_MS = 30 * 60 * 1000L;
    static final long RETRY_MS = 5000;

    private record Stream(String channel, String ip, SseEmitter emitter) {}

    private final ObjectMapper json;
    private final Set<Stream> streams = ConcurrentHashMap.newKeySet();
    private final ScheduledExecutorService sender = Executors.newSingleThreadScheduledExecutor(task -> {
        Thread t = new Thread(task, "live-updates");
        t.setDaemon(true);
        return t;
    });

    /** heartbeatSeconds: how often an empty comment is sent so idle connections stay open (Cloudflare closes quiet ones). */
    public SseLiveUpdates(ObjectMapper json, @Value("${app.live.heartbeat-seconds:25}") long heartbeatSeconds) {
        this.json = json;
        sender.scheduleAtFixedRate(this::heartbeat, heartbeatSeconds, heartbeatSeconds, TimeUnit.SECONDS);
    }

    @Override
    public synchronized SseEmitter subscribe(String channel, HttpServletRequest req, HttpServletResponse res) throws IOException {
        String ip = ClientIp.of(req);
        long fromIp = streams.stream().filter(s -> s.ip().equals(ip)).count();
        if (fromIp >= MAX_PER_IP || streams.size() >= MAX_TOTAL) {
            refuse(res);
            return null;
        }
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        Stream stream = new Stream(channel, ip, emitter);
        emitter.onCompletion(() -> streams.remove(stream));
        emitter.onTimeout(() -> streams.remove(stream));
        emitter.onError(e -> streams.remove(stream));
        // Sent before the stream is shared with the sender thread; Spring holds it until the response starts.
        emitter.send(SseEmitter.event().reconnectTime(RETRY_MS).name("connected").data("{}"));
        streams.add(stream);
        return emitter;
    }

    @Override
    public void publish(String channel, String eventName, Object payload) {
        String data;
        try {
            data = json.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("live event payload is not JSON", e);
        }
        sender.execute(() -> {
            for (Stream s : streams) {
                if (s.channel().equals(channel)) send(s, () -> SseEmitter.event().name(eventName).data(data));
            }
        });
    }

    /** How many streams are open (tests). */
    public int connectionCount() {
        return streams.size();
    }

    /** Ends every open stream (tests and shutdown). */
    public void disconnectAll() {
        for (Stream s : streams) {
            streams.remove(s);
            s.emitter().complete();
        }
    }

    @PreDestroy
    void shutdown() {
        disconnectAll();
        sender.shutdownNow();
    }

    private void heartbeat() {
        try {
            for (Stream s : streams) send(s, () -> SseEmitter.event().comment("ping"));
        } catch (RuntimeException e) {
            // never let an exception cancel the schedule
        }
    }

    /** A fresh builder per stream: a builder appends to itself when it is built, so it cannot be shared. */
    private void send(Stream s, Supplier<SseEventBuilder> event) {
        try {
            s.emitter().send(event.get());
        } catch (IOException | IllegalStateException e) {
            streams.remove(s);
            s.emitter().completeWithError(e);
        }
    }

    private void refuse(HttpServletResponse res) throws IOException {
        res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        res.setContentType("application/json;charset=UTF-8");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("code", "RATE_LIMIT_EXCEEDED");
        body.put("error", "खूप जास्त लाइव्ह कनेक्शन्स उघडले आहेत. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा (Too many live connections, try again later).");
        json.writeValue(res.getOutputStream(), body);
    }
}
