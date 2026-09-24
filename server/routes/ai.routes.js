import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/realtimeDb.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, isValidPhone, cleanPhone, isValidEmail } from '../utils/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Paths to AI Agent knowledge base & support file
const KNOWLEDGE_BASE_PATH = path.join(__dirname, '..', '..', 'Connect-Maratha-AI-Agent', 'backend', 'data', 'connect_maratha_content.json');
const SUPPORT_FILE_PATH = path.join(__dirname, '..', '..', 'Connect-Maratha-AI-Agent', 'backend', 'technical_support_requests.json');

let knowledgeBase = [];
try {
  if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8'));
    console.log(`[AI Agent] Loaded ${knowledgeBase.length} Q&A items from knowledge base.`);
  }
} catch (err) {
  console.warn('[AI Agent] Could not load knowledge base file:', err.message);
}

// Text normalization helper
function normalize(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\w\s\u0900-\u097f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Language detection
function detectLang(text = '', requested = 'en') {
  if (requested === 'mr' || requested === 'hi') return requested;
  const t = text.toLowerCase();
  const marathiMarkers = ['काय', 'आहे', 'सांगा', 'इतिहास', 'माहिती', 'किल्ला', 'स्वराज्य', 'कसा', 'कधी', 'कोण'];
  const hindiMarkers = ['क्या', 'है', 'बताओ', 'जानकारी', 'किला', 'कैसे', 'कब', 'कौन'];
  if (marathiMarkers.some(m => t.includes(m))) return 'mr';
  if (hindiMarkers.some(m => t.includes(m))) return 'hi';
  return requested || 'en';
}

// Semantic & keyword search over Connect Maratha knowledge base
function searchKnowledge(query, lang = 'en') {
  if (!knowledgeBase.length || !query) return null;
  const qNorm = normalize(query);
  const qTokens = qNorm.split(' ').filter(w => w.length > 1);

  let bestMatch = null;
  let highestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;
    const qText = normalize(item.question);
    const topic = normalize(item.topic || '');
    const category = normalize(item.category || '');
    const ansText = normalize(item.answer?.[lang] || item.answer?.en || '');

    // Exact question match
    if (qNorm === qText || qText.includes(qNorm) || qNorm.includes(qText)) {
      score += 50;
    }

    // Token overlap in question
    for (const token of qTokens) {
      if (qText.includes(token)) score += 8;
      if (topic.includes(token)) score += 5;
      if (category.includes(token)) score += 4;
      if (ansText.includes(token)) score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Minimum threshold to prevent spurious false positives
  if (highestScore >= 6) {
    return {
      match: bestMatch,
      score: highestScore
    };
  }

  return null;
}

// Fallback response generator
function getFallbackResponse(query, lang = 'mr') {
  const norm = normalize(query);

  if (norm.includes('रक्त') || norm.includes('blood') || norm.includes('donat')) {
    if (lang === 'mr') return '🔴 Connect Maratha २४x७ आपत्कालीन रक्त साहाय्य उपलब्ध आहे. तुम्ही /blood किंवा /crm/helpdesk वर जाऊन तात्काळ रक्त विनंती नोंदवू शकता किंवा थेट हेल्पलाइन १८००-१२३-१६७४ वर संपर्क करू शकता.';
    if (lang === 'hi') return '🔴 Connect Maratha २४x७ आपातकालीन रक्त सहायता उपलब्ध कराता है। आप /blood पोर्टल पर अनुरोध कर सकते हैं या हेल्पलाइन 1800-123-1674 पर संपर्क करें।';
    return '🔴 Connect Maratha provides 24x7 emergency blood donor coordination. Visit /blood or call helpline 1800-123-1674.';
  }

  if (norm.includes('नोंदणी') || norm.includes('सदस्य') || norm.includes('register') || norm.includes('membership')) {
    if (lang === 'mr') return '🚩 मराठा समाजात सामील होण्यासाठी आणि डिजिटल ओळखपत्र मिळवण्यासाठी /register वर जाऊन ऑनलाइन नोंदणी करा. अधिक माहितीसाठी /card तपासा.';
    if (lang === 'hi') return '🚩 डिजिटल पहचान पत्र और सदस्यता के लिए /register पर जाएँ या /card देखें।';
    return '🚩 To become a member and get your digital ID card, visit /register.';
  }

  if (norm.includes('संगम') || norm.includes('उद्योग') || norm.includes('business') || norm.includes('b2b')) {
    if (lang === 'mr') return '💼 मराठा बिझनेस संगम हा उद्योजकांसाठी B2B रेफरल आणि व्यावसायिक देवाणघेवाणीचा मंच आहे. अधिक माहितीसाठी /sangam किंवा /business/directory पहा.';
    if (lang === 'hi') return '💼 मराठा बिजनेस संगम उद्यमियों के लिए B2B रेफरल और नेटवर्किंग मंच है। अधिक जानकारी के लिए /sangam देखें।';
    return '💼 Maratha Business Sangam is the dedicated B2B networking platform for Maratha entrepreneurs. Visit /sangam.';
  }

  if (lang === 'mr') {
    return '🙏 आपल्या प्रश्नासाठी कनेक्ट मराठा ज्ञानकोशात थेट माहिती सापडली नाही. आपण गड-किल्ले, मराठा इतिहास, स्वराज्य, रक्तदान, व्यवसाय संगम किंवा सदस्यत्वाबाबत प्रश्न विचारू शकता. तांत्रिक मदतीसाठी खालील फॉर्म भरा.';
  } else if (lang === 'hi') {
    return '🙏 आपके प्रश्न के लिए कनेक्ट मराठा ज्ञानकोश में सीधा उत्तर नहीं मिला। आप किले, मराठा इतिहास, स्वराज्य, रक्तदान या व्यवसाय संगम के बारे में पूछ सकते हैं।';
  } else {
    return "🙏 No direct matching information was found in the Connect Maratha knowledge base. Please ask about Maratha forts, history, Swarajya, blood donation, or Business Sangam, or contact our technical team below.";
  }
}

// ============================================================
// POST /api/ai/chat
// Trilingual AI Chat Agent endpoint
// ============================================================
router.post('/chat', async (req, res) => {
  const { message, language = 'mr', session_id = 'default' } = req.body;
  const cleanMessage = sanitize(message || '').trim();

  if (!cleanMessage) {
    return sendError(res, 'कृपया प्रश्न किंवा संदेश पाठवा.', 'EMPTY_MESSAGE', 400);
  }

  const effectiveLang = detectLang(cleanMessage, language);

  // 1. First attempt calling local Python FastAPI agent if running on port 8000
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800); // 1.8s fast timeout

    const pyRes = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanMessage,
        language: effectiveLang,
        session_id
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (pyRes.ok) {
      const data = await pyRes.json();
      if (data && data.response) {
        return sendSuccess(res, 'AI उत्तर प्राप्त झाले (Python Agent)', {
          response: data.response,
          source: 'python_agent',
          language: effectiveLang,
          sessionId: session_id
        });
      }
    }
  } catch (pyErr) {
    // Python agent offline or timed out; proceed to built-in knowledge RAG
  }

  // 2. Intelligent embedded RAG query over Connect Maratha knowledge base
  const searchResult = searchKnowledge(cleanMessage, effectiveLang);

  if (searchResult && searchResult.match) {
    const item = searchResult.match;
    const answerObj = item.answer || {};
    const text = answerObj[effectiveLang] || answerObj.mr || answerObj.en || Object.values(answerObj)[0] || '';

    return sendSuccess(res, 'AI उत्तर प्राप्त झाले (Knowledge Engine)', {
      response: text,
      topic: item.topic,
      category: item.category,
      sourceUrl: item.source,
      source: 'embedded_rag',
      confidence: searchResult.score,
      language: effectiveLang,
      sessionId: session_id
    });
  }

  // 3. Contextual fallback guidance
  const fallback = getFallbackResponse(cleanMessage, effectiveLang);
  return sendSuccess(res, 'मार्गदर्शन उत्तर', {
    response: fallback,
    source: 'contextual_engine',
    language: effectiveLang,
    sessionId: session_id
  });
});

// ============================================================
// POST /api/ai/support (or /technical-support)
// Technical Support Ticket creation
// ============================================================
router.post(['/support', '/technical-support'], (req, res) => {
  const { mobile, email, issue, language = 'mr', name = '' } = req.body;

  const cleanedPhone = cleanPhone(mobile);
  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const cleanEmailStr = sanitize(email || '').trim();
  if (cleanEmailStr && !isValidEmail(cleanEmailStr)) {
    return sendError(res, 'कृपया वैध ई-मेल पत्ता प्रविष्ट करा.', 'INVALID_EMAIL', 400);
  }

  const cleanIssue = sanitize(issue || '').trim();
  if (!cleanIssue) {
    return sendError(res, 'कृपया समस्येचे संक्षिप्त वर्णन द्या.', 'ISSUE_REQUIRED', 400);
  }

  const ticketData = {
    id: `TECH-REQ-${Date.now().toString().slice(-6)}`,
    name: sanitize(name) || 'वापरकर्ता',
    mobile: cleanedPhone,
    email: cleanEmailStr || `${cleanedPhone}@connectmaratha.org`,
    issue: cleanIssue,
    language: sanitize(language) || 'mr',
    status: 'Open',
    timestamp: new Date().toISOString()
  };

  // Save to technical support requests file in AI agent directory
  try {
    let requestsList = [];
    if (fs.existsSync(SUPPORT_FILE_PATH)) {
      const raw = fs.readFileSync(SUPPORT_FILE_PATH, 'utf8');
      requestsList = JSON.parse(raw);
      if (!Array.isArray(requestsList)) requestsList = [];
    }
    requestsList.push(ticketData);
    fs.writeFileSync(SUPPORT_FILE_PATH, JSON.stringify(requestsList, null, 2), 'utf8');
  } catch (fErr) {
    console.warn('[AI Support] File write warning:', fErr.message);
  }

  // Log in central audit and notification system
  try {
    db.addAuditLog('AI_TECH_SUPPORT_TICKET', ticketData.mobile, {
      ticketId: ticketData.id,
      issue: cleanIssue.slice(0, 100)
    });
  } catch (e) {}

  return sendSuccess(res, 'आपली तांत्रिक साहाय्य विनंती नोंदवली गेली आहे! तांत्रिक पथक लवकरच संपर्क करेल.', {
    ticket: ticketData
  }, 201);
});

// ============================================================
// GET /api/ai/health
// Healthcheck & Knowledge Base status
// ============================================================
router.get('/health', (req, res) => {
  return sendSuccess(res, 'Connect Maratha AI Agent Active', {
    status: 'online',
    knowledgeBaseItems: knowledgeBase.length,
    languages: ['mr', 'hi', 'en'],
    capabilities: ['rag', 'voice_speech_to_text', 'text_to_speech', 'tech_support', 'history_forts_swarajya']
  });
});

export default router;
