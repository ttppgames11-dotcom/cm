import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuery } from '../../database/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ensureWebsiteTables, cleanMobile, text, newId } from '../utils/websiteTables.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Optional Q&A knowledge base (array of { question, topic, category, answer: { mr, hi, en }, source }).
// Without it, chat answers with the contextual fallback guidance below.
const KNOWLEDGE_BASE_PATH = process.env.AI_KNOWLEDGE_FILE ||
  path.join(__dirname, '..', '..', 'Connect-Maratha-AI-Agent', 'backend', 'data', 'connect_maratha_content.json');
// Optional external agent (e.g. the Python FastAPI service); only called when configured.
const AI_AGENT_URL = process.env.AI_AGENT_URL || '';

let knowledgeBase = [];
try {
  if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8'));
    console.log(`[AI Agent] Loaded ${knowledgeBase.length} Q&A items from knowledge base.`);
  }
} catch (err) {
  console.warn('[AI Agent] Could not load knowledge base file:', err.message);
}

function normalize(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\w\sऀ-ॿ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLang(input = '', requested = 'en') {
  if (requested === 'mr' || requested === 'hi') return requested;
  const t = input.toLowerCase();
  const marathiMarkers = ['काय', 'आहे', 'सांगा', 'इतिहास', 'माहिती', 'किल्ला', 'स्वराज्य', 'कसा', 'कधी', 'कोण'];
  const hindiMarkers = ['क्या', 'है', 'बताओ', 'जानकारी', 'किला', 'कैसे', 'कब', 'कौन'];
  if (marathiMarkers.some((m) => t.includes(m))) return 'mr';
  if (hindiMarkers.some((m) => t.includes(m))) return 'hi';
  return requested || 'en';
}

// Keyword search over the knowledge base; null below the match threshold.
function searchKnowledge(query, lang = 'en') {
  if (!knowledgeBase.length || !query) return null;
  const qNorm = normalize(query);
  const qTokens = qNorm.split(' ').filter((w) => w.length > 1);

  let bestMatch = null;
  let highestScore = 0;
  for (const item of knowledgeBase) {
    let score = 0;
    const qText = normalize(item.question);
    const topic = normalize(item.topic || '');
    const category = normalize(item.category || '');
    const ansText = normalize(item.answer?.[lang] || item.answer?.en || '');

    if (qNorm === qText || qText.includes(qNorm) || qNorm.includes(qText)) score += 50;
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
  return highestScore >= 6 ? { match: bestMatch, score: highestScore } : null;
}

function getFallbackResponse(query, lang = 'mr') {
  const norm = normalize(query);

  if (norm.includes('रक्त') || norm.includes('blood') || norm.includes('donat')) {
    if (lang === 'mr') return '🔴 रक्त साहाय्यासाठी /blood वर तात्काळ रक्त विनंती नोंदवा किंवा /crm/helpdesk वर मदत मागा.';
    if (lang === 'hi') return '🔴 रक्त सहायता के लिए /blood पोर्टल पर अनुरोध करें या /crm/helpdesk पर मदद माँगें।';
    return '🔴 For blood donor help, post a request at /blood or ask at /crm/helpdesk.';
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
  }
  if (lang === 'hi') {
    return '🙏 आपके प्रश्न के लिए कनेक्ट मराठा ज्ञानकोश में सीधा उत्तर नहीं मिला। आप किले, मराठा इतिहास, स्वराज्य, रक्तदान या व्यवसाय संगम के बारे में पूछ सकते हैं।';
  }
  return '🙏 No direct matching information was found in the Connect Maratha knowledge base. Please ask about Maratha forts, history, Swarajya, blood donation, or Business Sangam, or contact our technical team below.';
}

// POST /api/ai/chat  { message, language?, session_id? }
router.post('/chat', async (req, res) => {
  const { language = 'mr', session_id = 'default' } = req.body || {};
  const cleanMessage = text(req.body?.message, 1000);
  if (!cleanMessage) {
    return sendError(res, 'कृपया प्रश्न किंवा संदेश पाठवा.', 'EMPTY_MESSAGE', 400);
  }
  const effectiveLang = detectLang(cleanMessage, language);
  const sessionId = text(session_id, 80) || 'default';

  if (AI_AGENT_URL) {
    try {
      const agentRes = await fetch(AI_AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanMessage, language: effectiveLang, session_id: sessionId }),
        signal: AbortSignal.timeout(5000),
      });
      if (agentRes.ok) {
        const data = await agentRes.json();
        if (data && data.response) {
          return sendSuccess(res, 'AI उत्तर प्राप्त झाले (Python Agent)', {
            response: data.response, source: 'python_agent', language: effectiveLang, sessionId,
          });
        }
      }
    } catch (_) {
      // Agent offline or slow: fall back to the built-in knowledge search.
    }
  }

  const found = searchKnowledge(cleanMessage, effectiveLang);
  if (found) {
    const answer = found.match.answer || {};
    return sendSuccess(res, 'AI उत्तर प्राप्त झाले (Knowledge Engine)', {
      response: answer[effectiveLang] || answer.mr || answer.en || Object.values(answer)[0] || '',
      topic: found.match.topic,
      category: found.match.category,
      sourceUrl: found.match.source,
      source: 'embedded_rag',
      confidence: found.score,
      language: effectiveLang,
      sessionId,
    });
  }

  return sendSuccess(res, 'मार्गदर्शन उत्तर', {
    response: getFallbackResponse(cleanMessage, effectiveLang),
    source: 'contextual_engine',
    language: effectiveLang,
    sessionId,
  });
});

// POST /api/ai/support (or /technical-support)  { mobile, email?, issue, name?, language? }
// Saved as a helpdesk ticket so staff see it with all other tickets.
router.post(['/support', '/technical-support'], async (req, res, next) => {
  try {
    const mobile = cleanMobile(req.body?.mobile);
    if (!mobile) {
      return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }
    const email = text(req.body?.email, 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendError(res, 'कृपया वैध ई-मेल पत्ता प्रविष्ट करा.', 'INVALID_EMAIL', 400);
    }
    const issue = text(req.body?.issue, 2000);
    if (!issue) {
      return sendError(res, 'कृपया समस्येचे संक्षिप्त वर्णन द्या.', 'ISSUE_REQUIRED', 400);
    }

    await ensureWebsiteTables();
    const ticket = {
      id: newId('TECH'),
      name: text(req.body?.name, 100) || 'वापरकर्ता',
      mobile,
      email,
      issue,
      language: text(req.body?.language, 5) || 'mr',
      status: 'Open',
      timestamp: new Date().toISOString(),
    };
    await runQuery(
      `INSERT INTO support_tickets (id, source, title, description, category, priority, status,
         requester_id, requester_name, requester_phone, requester_email, language, audit_trail, updated_at)
       VALUES (?, 'ai_support', ?, ?, 'Technical Support', 'Medium', 'New', ?, ?, ?, ?, ?, ?, ?)`,
      [ticket.id, issue.slice(0, 120), issue, req.user?.id || 'GUEST', ticket.name, mobile, email,
        ticket.language, JSON.stringify([{ action: 'CREATED', by: ticket.name, timestamp: ticket.timestamp }]), ticket.timestamp]
    );

    return sendSuccess(res, 'आपली तांत्रिक साहाय्य विनंती नोंदवली गेली आहे! तांत्रिक पथक लवकरच संपर्क करेल.', { ticket }, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/health
router.get('/health', (req, res) => {
  return sendSuccess(res, 'Connect Maratha AI Agent Active', {
    status: 'online',
    knowledgeBaseItems: knowledgeBase.length,
    externalAgent: Boolean(AI_AGENT_URL),
    languages: ['mr', 'hi', 'en'],
  });
});

export default router;
