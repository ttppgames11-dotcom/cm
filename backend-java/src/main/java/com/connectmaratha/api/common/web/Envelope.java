package com.connectmaratha.api.common.web;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The reply shape of the website features (backend/utils/response.js):
 * { success: true, message, data, ...the keys of data at the top level too }.
 */
public final class Envelope {

    private Envelope() {}

    public static Map<String, Object> success(String message, Map<String, Object> data) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", true);
        payload.put("message", message);
        payload.put("data", data);
        for (Map.Entry<String, Object> e : data.entrySet()) payload.putIfAbsent(e.getKey(), e.getValue());
        return payload;
    }
}
