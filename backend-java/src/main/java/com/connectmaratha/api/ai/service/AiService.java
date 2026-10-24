package com.connectmaratha.api.ai.service;

import static com.connectmaratha.api.common.util.WebsiteText.cleanMobile;
import static com.connectmaratha.api.common.util.WebsiteText.newId;
import static com.connectmaratha.api.common.util.WebsiteText.text;

import com.connectmaratha.api.ai.repository.AiTicketRepository;
import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.util.WebsiteText;
import com.connectmaratha.api.common.web.Envelope;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The website's AI assistant and technical-support request (backend/routes/ai.routes.js). */
@Service
public class AiService {

    private static final List<String> MARATHI = List.of("काय", "आहे", "सांगा", "इतिहास", "माहिती", "किल्ला", "स्वराज्य", "कसा", "कधी", "कोण");
    private static final List<String> HINDI = List.of("क्या", "है", "बताओ", "जानकारी", "किला", "कैसे", "कब", "कौन");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final KnowledgeBase knowledge;
    private final AiTicketRepository tickets;
    private final LazyTables tables;
    private final ObjectMapper json;
    private final String agentUrl;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public AiService(KnowledgeBase knowledge, AiTicketRepository tickets, LazyTables tables, ObjectMapper json,
                     @Value("${AI_AGENT_URL:}") String agentUrl) {
        this.knowledge = knowledge;
        this.tickets = tickets;
        this.tables = tables;
        this.json = json;
        this.agentUrl = agentUrl == null ? "" : agentUrl;
    }

    /** Answers from the optional external agent, else the knowledge file, else the built-in guidance. */
    public Map<String, Object> chat(Map<String, Object> body) {
        Object language = body.containsKey("language") ? body.get("language") : "mr";
        Object sessionRaw = body.containsKey("session_id") ? body.get("session_id") : "default";
        String message = text(body.get("message"), 1000);
        if (message.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_MESSAGE", "कृपया प्रश्न किंवा संदेश पाठवा.");
        }
        Object lang = detectLang(message, language);
        String langText = Js.string(lang);
        String sessionId = Js.orElse(text(sessionRaw, 80), "default");

        if (!agentUrl.isEmpty()) {
            Optional<String> reply = askAgent(message, lang, sessionId);
            if (reply.isPresent()) {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("response", reply.get());
                data.put("source", "python_agent");
                data.put("language", lang);
                data.put("sessionId", sessionId);
                return Envelope.success("AI उत्तर प्राप्त झाले (Python Agent)", data);
            }
        }

        Optional<KnowledgeBase.Match> found = knowledge.search(message, langText);
        if (found.isPresent()) {
            Map<String, Object> item = found.get().item();
            Map<?, ?> answer = item.get("answer") instanceof Map<?, ?> m ? m : Map.of();
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("response", pick(answer, langText));
            data.put("topic", item.get("topic"));
            data.put("category", item.get("category"));
            data.put("sourceUrl", item.get("source"));
            data.put("source", "embedded_rag");
            data.put("confidence", found.get().score());
            data.put("language", lang);
            data.put("sessionId", sessionId);
            return Envelope.success("AI उत्तर प्राप्त झाले (Knowledge Engine)", data);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("response", fallback(message, langText));
        data.put("source", "contextual_engine");
        data.put("language", lang);
        data.put("sessionId", sessionId);
        return Envelope.success("मार्गदर्शन उत्तर", data);
    }

    /** Saves the request as a helpdesk ticket so staff see it with all the others. */
    @Transactional
    public Map<String, Object> support(CurrentUser user, Map<String, Object> b) {
        String mobile = cleanMobile(b.get("mobile"));
        if (mobile.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PHONE", "कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.");
        }
        String email = text(b.get("email"), 120);
        if (!email.isEmpty() && !EMAIL.matcher(email).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_EMAIL", "कृपया वैध ई-मेल पत्ता प्रविष्ट करा.");
        }
        String issue = text(b.get("issue"), 2000);
        if (issue.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ISSUE_REQUIRED", "कृपया समस्येचे संक्षिप्त वर्णन द्या.");
        }
        tables.ensureWebsiteTables();

        String name = Js.orElse(text(b.get("name"), 100), "वापरकर्ता");
        String language = Js.orElse(text(b.get("language"), 5), "mr");
        String timestamp = WebsiteText.nowIso();
        Map<String, Object> ticket = new LinkedHashMap<>();
        ticket.put("id", newId("TECH"));
        ticket.put("name", name);
        ticket.put("mobile", mobile);
        ticket.put("email", email);
        ticket.put("issue", issue);
        ticket.put("language", language);
        ticket.put("status", "Open");
        ticket.put("timestamp", timestamp);

        Map<String, Object> created = new LinkedHashMap<>();
        created.put("action", "CREATED");
        created.put("by", name);
        created.put("timestamp", timestamp);
        tickets.insert((String) ticket.get("id"), issue.length() > 120 ? issue.substring(0, 120) : issue, issue,
            user != null && Js.truthy(user.id()) ? user.id() : "GUEST", name, mobile, email, language,
            toJson(List.of(created)), timestamp);
        return Envelope.success("आपली तांत्रिक साहाय्य विनंती नोंदवली गेली आहे! तांत्रिक पथक लवकरच संपर्क करेल.", Map.of("ticket", ticket));
    }

    public Map<String, Object> health() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("status", "online");
        data.put("knowledgeBaseItems", knowledge.size());
        data.put("externalAgent", !agentUrl.isEmpty());
        data.put("languages", List.of("mr", "hi", "en"));
        return Envelope.success("Connect Maratha AI Agent Active", data);
    }

    // ------------------------------------------------------------------ helpers

    /** "mr" or "hi" as asked; otherwise guessed from typical Marathi/Hindi words, else what was asked (or "en"). */
    private static Object detectLang(String input, Object requested) {
        if ("mr".equals(requested) || "hi".equals(requested)) return requested;
        String t = input.toLowerCase(Locale.ROOT);
        for (String m : MARATHI) if (t.contains(m)) return "mr";
        for (String m : HINDI) if (t.contains(m)) return "hi";
        return Js.truthy(requested) ? requested : "en";
    }

    private Optional<String> askAgent(String message, Object lang, String sessionId) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("message", message);
            payload.put("language", lang);
            payload.put("session_id", sessionId);
            HttpRequest request = HttpRequest.newBuilder(URI.create(agentUrl)).timeout(Duration.ofSeconds(5))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                Object parsed = json.readValue(response.body(), Object.class);
                if (parsed instanceof Map<?, ?> m && Js.truthy(m.get("response"))) return Optional.of(Js.string(m.get("response")));
            }
        } catch (Exception e) {
            // Agent offline or slow: fall back to the built-in answers.
        }
        return Optional.empty();
    }

    private static Object pick(Map<?, ?> answer, String lang) {
        for (Object key : new Object[] {lang, "mr", "en"}) {
            Object v = answer.get(key);
            if (Js.truthy(v)) return v;
        }
        for (Object v : answer.values()) return v == null || !Js.truthy(v) ? "" : v;
        return "";
    }

    private static String fallback(String query, String lang) {
        String norm = KnowledgeBase.normalize(query);
        if (norm.contains("रक्त") || norm.contains("blood") || norm.contains("donat")) {
            if (lang.equals("mr")) return "🔴 रक्त साहाय्यासाठी /blood वर तात्काळ रक्त विनंती नोंदवा किंवा /crm/helpdesk वर मदत मागा.";
            if (lang.equals("hi")) return "🔴 रक्त सहायता के लिए /blood पोर्टल पर अनुरोध करें या /crm/helpdesk पर मदद माँगें।";
            return "🔴 For blood donor help, post a request at /blood or ask at /crm/helpdesk.";
        }
        if (norm.contains("नोंदणी") || norm.contains("सदस्य") || norm.contains("register") || norm.contains("membership")) {
            if (lang.equals("mr")) return "🚩 मराठा समाजात सामील होण्यासाठी आणि डिजिटल ओळखपत्र मिळवण्यासाठी /register वर जाऊन ऑनलाइन नोंदणी करा. अधिक माहितीसाठी /card तपासा.";
            if (lang.equals("hi")) return "🚩 डिजिटल पहचान पत्र और सदस्यता के लिए /register पर जाएँ या /card देखें।";
            return "🚩 To become a member and get your digital ID card, visit /register.";
        }
        if (norm.contains("संगम") || norm.contains("उद्योग") || norm.contains("business") || norm.contains("b2b")) {
            if (lang.equals("mr")) return "💼 मराठा बिझनेस संगम हा उद्योजकांसाठी B2B रेफरल आणि व्यावसायिक देवाणघेवाणीचा मंच आहे. अधिक माहितीसाठी /sangam किंवा /business/directory पहा.";
            if (lang.equals("hi")) return "💼 मराठा बिजनेस संगम उद्यमियों के लिए B2B रेफरल और नेटवर्किंग मंच है। अधिक जानकारी के लिए /sangam देखें।";
            return "💼 Maratha Business Sangam is the dedicated B2B networking platform for Maratha entrepreneurs. Visit /sangam.";
        }
        if (lang.equals("mr")) {
            return "🙏 आपल्या प्रश्नासाठी कनेक्ट मराठा ज्ञानकोशात थेट माहिती सापडली नाही. आपण गड-किल्ले, मराठा इतिहास, स्वराज्य, रक्तदान, व्यवसाय संगम किंवा सदस्यत्वाबाबत प्रश्न विचारू शकता. तांत्रिक मदतीसाठी खालील फॉर्म भरा.";
        }
        if (lang.equals("hi")) {
            return "🙏 आपके प्रश्न के लिए कनेक्ट मराठा ज्ञानकोश में सीधा उत्तर नहीं मिला। आप किले, मराठा इतिहास, स्वराज्य, रक्तदान या व्यवसाय संगम के बारे में पूछ सकते हैं।";
        }
        return "🙏 No direct matching information was found in the Connect Maratha knowledge base. Please ask about Maratha forts, history, Swarajya, blood donation, or Business Sangam, or contact our technical team below.";
    }

    private static String toJson(Object value) {
        try {
            return new ObjectMapper().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
