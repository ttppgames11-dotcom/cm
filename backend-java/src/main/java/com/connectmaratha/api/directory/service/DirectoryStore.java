package com.connectmaratha.api.directory.service;

import com.connectmaratha.api.directory.entity.DirectoryRecord;
import com.connectmaratha.api.directory.entity.DirectoryRecordId;
import com.connectmaratha.api.directory.repository.DirectoryRecordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Builders and dairy records as JSON objects (the same store the Node backend uses,
 * backend/utils/directoryStore.js): each record is kept exactly as the API returns it.
 */
@Service
public class DirectoryStore {

    public static final String BUILDERS = "builders";
    public static final String BUILDER_ENQUIRIES = "builderInquiries";
    public static final String DAIRY = "dairy";
    public static final String PRODUCTS = "dairyProducts";
    public static final String PRODUCT_ENQUIRIES = "dairyEnquiries";
    public static final String REGISTRATIONS = "dairyRegistrations";

    private static final TypeReference<LinkedHashMap<String, Object>> RECORD = new TypeReference<>() {};

    private final DirectoryRecordRepository records;
    private final ObjectMapper json;
    private int seqCounter;

    public DirectoryStore(DirectoryRecordRepository records, ObjectMapper json) {
        this.records = records;
        this.json = json;
    }

    /** All records of a list, newest first. */
    public List<Map<String, Object>> list(String collection) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (DirectoryRecord r : records.list(collection)) out.add(parse(r.getData()));
        return out;
    }

    public Optional<Map<String, Object>> find(String collection, Object id) {
        return records.findById(new DirectoryRecordId(collection, String.valueOf(id))).map(r -> parse(r.getData()));
    }

    public void insert(String collection, Map<String, Object> item) {
        try {
            records.insert(collection, String.valueOf(item.get("id")), json.writeValueAsString(item), nextSeq());
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    /** prefix + the last 4 digits of the time ("BLD-4821"), moving on to the next free number when taken. */
    public String freeShortId(String collection, String prefix) {
        String ms = String.valueOf(System.currentTimeMillis());
        int n = Integer.parseInt(ms.substring(ms.length() - 4));
        for (int i = 0; i < 10000; i++) {
            String id = prefix + String.format("%04d", (n + i) % 10000);
            if (!records.existsById(new DirectoryRecordId(collection, id))) return id;
        }
        return prefix + System.currentTimeMillis();
    }

    /** Newest record = highest number (the old file kept the newest first). */
    private synchronized long nextSeq() {
        seqCounter = (seqCounter + 1) % 1000;
        return System.currentTimeMillis() * 1000 + seqCounter;
    }

    private Map<String, Object> parse(String data) {
        try {
            return json.readValue(data, RECORD);
        } catch (Exception e) {
            throw new IllegalStateException("Unreadable directory record", e);
        }
    }
}
