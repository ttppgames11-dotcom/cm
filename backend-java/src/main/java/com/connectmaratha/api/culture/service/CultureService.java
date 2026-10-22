package com.connectmaratha.api.culture.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.directory.service.DirectoryStore;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Community oral-history stories and culture totals (backend/routes/culture.routes.js). Stories
 * are kept in the shared records table (list "oralHistory"); the Node server copies the old
 * data_oral_history.json file in once.
 */
@Service
public class CultureService {

    static final String ORAL_HISTORY = "oralHistory";

    private final DirectoryStore store;

    public CultureService(DirectoryStore store) {
        this.store = store;
    }

    public Map<String, Object> oralHistory() {
        List<Map<String, Object>> data = store.list(ORAL_HISTORY);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", data.size());
        out.put("data", data);
        return out;
    }

    /** New stories wait for community review. Values are stored as sent (like Node). */
    public Map<String, Object> addOralHistory(Map<String, Object> b) {
        if (!Js.truthy(b.get("title")) || !Js.truthy(b.get("story")) || !Js.truthy(b.get("village"))) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "शीर्षक, गाव आणि इतिहास कथा आवश्यक आहे.");
        }
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("id", freeId());
        entry.put("title", b.get("title"));
        entry.put("village", b.get("village"));
        // taluka || district: when both are missing the field is left out (JSON drops undefined).
        if (Js.truthy(b.get("taluka"))) entry.put("taluka", b.get("taluka"));
        else if (b.containsKey("district")) entry.put("taluka", b.get("district"));
        entry.put("district", or(b.get("district"), "महाराष्ट्र"));
        entry.put("region", or(b.get("region"), "महाराष्ट्र"));
        entry.put("contributor", or(b.get("contributor"), "अनाम मराठा बांधव"));
        entry.put("contributorClan", or(b.get("contributorClan"), "मराठा कुळ"));
        entry.put("dateSubmitted", marathiDate(LocalDate.now(ZoneId.systemDefault())));
        entry.put("story", b.get("story"));
        entry.put("historicalReference", or(b.get("historicalReference"), "मौखिक कुटुंब परंपरा"));
        entry.put("tier", "Tier 4: मौखिक इतिहास व लोकपरंपरा");
        entry.put("status", "पडताळणी अंतर्गत (Under Community Review)");
        store.insert(ORAL_HISTORY, entry);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "आपली मौखिक इतिहास नोंद यशस्वीरित्या संग्रहित करण्यात आली!");
        out.put("entry", entry);
        return out;
    }

    public Map<String, Object> stats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalForts", 350);
        stats.put("totalTemples", 120);
        stats.put("totalRegions", 8);
        stats.put("totalDialects", 7);
        stats.put("sourceTiers", 4);
        stats.put("totalOralHistories", store.list(ORAL_HISTORY).size());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("stats", stats);
        return out;
    }

    /** new Date().toLocaleDateString('mr-IN'): day/month/year in Devanagari digits, e.g. ५/१०/२०२६. */
    static String marathiDate(LocalDate d) {
        String latin = d.getDayOfMonth() + "/" + d.getMonthValue() + "/" + d.getYear();
        StringBuilder sb = new StringBuilder(latin.length());
        for (char c : latin.toCharArray()) sb.append(c >= '0' && c <= '9' ? (char) ('०' + (c - '0')) : c);
        return sb.toString();
    }

    /** "oral_" + milliseconds, moving on by one when taken. */
    private String freeId() {
        long now = System.currentTimeMillis();
        while (store.find(ORAL_HISTORY, "oral_" + now).isPresent()) now++;
        return "oral_" + now;
    }

    private static Object or(Object v, String fallback) {
        return Js.truthy(v) ? v : fallback;
    }
}
