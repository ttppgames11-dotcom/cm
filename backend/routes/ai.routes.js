import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  generateAIAnswer,
  searchKnowledgeBase,
  detectLanguage,
  getGreeting
} from '../utils/marathaAiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const SUPPORT_FILE = path.join(__dirname, '../data/technical_support_requests.json');

// POST /api/ai/chat
// Main conversation endpoint supporting English, Marathi, and Hindi
router.post('/chat', async (req, res) => {
  try {
    const { message, language, session_id } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendError(res, 'संदेश आवश्यक आहे (Message is required)', 400);
    }

    const cleanMsg = message.trim();
    const effectiveLang = language || detectLanguage(cleanMsg);
    const sessionId = session_id || req.headers['x-session-id'] || 'default';

    const aiResult = await generateAIAnswer(cleanMsg, effectiveLang, sessionId);

    return sendSuccess(res, 'AI response generated successfully', {
      response: aiResult.response,
      sources: aiResult.sources || [],
      language: effectiveLang,
      session_id: sessionId,
      mode: aiResult.mode
    });
  } catch (error) {
    console.error('[AI Chat Route Error]:', error);
    return sendError(res, 'AI सेवा प्रक्रिया करण्यात अडचण आली.', 500, error.message);
  }
});

// GET /api/ai/suggestions
// Quick question pills for users in Marathi/English
router.get('/suggestions', (req, res) => {
  const lang = (req.query.lang || 'mr').toLowerCase();

  const suggestions = {
    mr: [
      { text: "Connect Maratha म्हणजे काय?", category: "Digital Ecosystem" },
      { text: "नवीन सभासद नोंदणी कशी करावी?", category: "Membership" },
      { text: "व्यवसाय संगम (Business Sangam) काय आहे?", category: "Business" },
      { text: "छत्रपती शिवाजी महाराजांचा राज्याभिषेक कधी झाला?", category: "History" },
      { text: "रायगड किल्ल्याबद्दल माहिती सांगा.", category: "Heritage" },
      { text: "अखिल भारतीय मराठा महासंघाची उद्दिष्टे काय आहेत?", category: "About" }
    ],
    en: [
      { text: "What is Connect Maratha?", category: "Digital Ecosystem" },
      { text: "How to register as a new member?", category: "Membership" },
      { text: "What is Business Sangam?", category: "Business" },
      { text: "When was Chhatrapati Shivaji Maharaj coronated?", category: "History" },
      { text: "Tell me about Raigad Fort.", category: "Heritage" },
      { text: "What are the objectives of Maratha Mahasangh?", category: "About" }
    ],
    hi: [
      { text: "Connect Maratha क्या है?", category: "Digital Ecosystem" },
      { text: "नए सदस्य का पंजीकरण कैसे करें?", category: "Membership" },
      { text: "बिजनेस संगम क्या है?", category: "Business" },
      { text: "छत्रपति शिवाजी महाराज का राज्याभिषेक कब हुआ था?", category: "History" },
      { text: "रायगढ़ किले के बारे में बताइए।", category: "Heritage" }
    ]
  };

  return sendSuccess(res, 'AI suggestions fetched', {
    suggestions: suggestions[lang] || suggestions.mr
  });
});

// POST /api/ai/technical-support
// Escalation endpoint matching the Python agent's /technical-support
router.post('/technical-support', async (req, res) => {
  try {
    const { mobile, email, issue, language, session_id } = req.body || {};

    if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
      return sendError(res, 'अवैध मोबाईल क्रमांक (10 अंकी क्रमांक आवश्यक)', 400);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return sendError(res, 'अवैध ईमेल पत्ता (Invalid email address)', 400);
    }

    if (!issue || !String(issue).trim()) {
      return sendError(res, 'समस्येचे वर्णन आवश्यक आहे (Issue details required)', 400);
    }

    const ticket = {
      id: `TKT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),
      mobile: String(mobile).trim(),
      email: String(email).trim(),
      issue: String(issue).trim(),
      language: language || 'mr',
      session_id: session_id || 'default',
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };

    let tickets = [];
    try {
      if (fs.existsSync(SUPPORT_FILE)) {
        tickets = JSON.parse(fs.readFileSync(SUPPORT_FILE, 'utf8'));
      }
    } catch (_e) {
      tickets = [];
    }

    tickets.push(ticket);

    const dir = path.dirname(SUPPORT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify(tickets, null, 2), 'utf8');

    return sendSuccess(res, 'तांत्रिक सहाय्य विनंती यशस्वीरीत्या नोंदवली गेली.', {
      ticket_id: ticket.id,
      timestamp: ticket.timestamp
    });
  } catch (error) {
    console.error('[AI Technical Support Route Error]:', error);
    return sendError(res, 'तांत्रिक सहाय्य विनंती जतन करण्यात अयशस्वी.', 500, error.message);
  }
});

// GET /api/ai/health
// Status endpoint checking both Node RAG engine and Python Microservice
router.get('/health', async (req, res) => {
  let pythonStatus = 'OFFLINE';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const pyRes = await fetch('http://127.0.0.1:8000/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (pyRes.ok) {
      pythonStatus = 'ONLINE (Port 8000)';
    }
  } catch (_e) {
    pythonStatus = 'OFFLINE (Using Built-in Node.js Knowledge Graph RAG)';
  }

  return sendSuccess(res, 'Connect Maratha AI Agent Service Health', {
    agentName: 'Connect Maratha Chhatrapati AI Assistant',
    version: '2.0.0',
    embeddedKnowledgeBaseRecords: 1147,
    pythonFastApiStatus: pythonStatus,
    supportedLanguages: ['mr (Marathi)', 'en (English)', 'hi (Hindi)']
  });
});

export default router;
