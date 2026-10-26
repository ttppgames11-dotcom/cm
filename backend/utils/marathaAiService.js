import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the 1,147 structured Q&A records
let knowledgeBase = [];
try {
  const kbPath = path.join(__dirname, '../data/connect_maratha_content.json');
  if (fs.existsSync(kbPath)) {
    const raw = fs.readFileSync(kbPath, 'utf8');
    knowledgeBase = JSON.parse(raw);
    console.log(`[MarathaAI Engine] Loaded ${knowledgeBase.length} knowledge base items.`);
  }
} catch (err) {
  console.error('[MarathaAI Engine] Failed to load knowledge base:', err.message);
}

// In-memory conversation history
const conversationHistory = new Map();

export function normalizeText(text = '') {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Language detection
export function detectLanguage(text = '') {
  const norm = normalizeText(text);
  const marathiWords = [
    'कसा', 'कशी', 'कसे', 'काय', 'कुठे', 'कधी', 'कोण', 'माहिती', 'नोंदणी', 'आहे',
    'आहेत', 'करावी', 'करावे', 'सांगा', 'द्या', 'मराठा', 'छत्रपती', 'जय', 'शिवराय',
    'स्वराज्य', 'किल्ला', 'इतिहास', 'व्यवसाय', 'नोकरी', 'सभासद', 'कार्ड'
  ];
  const hindiWords = [
    'क्या', 'कैसे', 'कहाँ', 'कब', 'कौन', 'जानकारी', 'पंजीकरण', 'है', 'हैं',
    'बताइए', 'दीजिए', 'इतिहास', 'किला', 'नौकरी'
  ];

  let mrScore = 0;
  let hiScore = 0;

  marathiWords.forEach(w => { if (norm.includes(w)) mrScore++; });
  hindiWords.forEach(w => { if (norm.includes(w)) hiScore++; });

  if (mrScore > hiScore) return 'mr';
  if (hiScore > mrScore) return 'hi';

  if (/[\u0900-\u097F]/.test(text)) return 'mr';
  return 'en';
}

export function getGreeting(lang = 'mr') {
  if (lang === 'mr') {
    return 'नमस्कार! 🙏 कनेक्ट मराठा एआय सहाय्यक मध्ये आपले सहर्ष स्वागत आहे. आपण कनेक्ट मराठा व्यासपीठ, व्यवसाय संगम, सभासद नोंदणी, गडकिल्ले आणि मराठा इतिहासाविषयी कोणताही प्रश्न विचारू शकता.';
  }
  if (lang === 'hi') {
    return 'नमस्ते! 🙏 कनेक्ट मराठा एआई सहायक में आपका स्वागत है। आप कनेक्ट मराठा, व्यवसाय संगम, सदस्यता और मराठा इतिहास से संबंधित प्रश्न पूछ सकते हैं।';
  }
  return 'Hello! 🙏 Welcome to Connect Maratha AI Assistant. You can ask anything about Connect Maratha, membership registration, Business Sangam, forts, or Maratha history.';
}

export function isGreeting(text = '') {
  const norm = normalizeText(text);
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'नमस्ते', 'नमस्कार', 'हॅलो', 'हेलो', 'जय शिवराय', 'jai shivrai'];
  return greetings.some(g => norm === g || norm.startsWith(`${g} `));
}

export function isThankYou(text = '') {
  const norm = normalizeText(text);
  const phrases = ['thank you', 'thanks', 'thankyou', 'thx', 'धन्यवाद', 'थँक्यू', 'थैंक यू', 'आभारी आहे', 'शुक्रिया'];
  return phrases.some(p => norm.includes(p));
}

export function isGoodbye(text = '') {
  const norm = normalizeText(text);
  const phrases = ['goodbye', 'good bye', 'bye', 'see you', 'बाय', 'पुन्हा भेटू', 'फिर मिलेंगे', 'अलविदा'];
  return phrases.some(p => norm.includes(p));
}

// Fort name mapping between Marathi & English
const FORT_MAPPINGS = [
  { mr: 'रायगड', en: 'raigad' },
  { mr: 'राजगड', en: 'rajgad' },
  { mr: 'तोरणा', en: 'torna' },
  { mr: 'प्रतापगड', en: 'pratapgad' },
  { mr: 'शिवनेरी', en: 'shivneri' },
  { mr: 'सिंहगड', en: 'sinhagad' },
  { mr: 'सिंधुदुर्ग', en: 'sindhudurg' },
  { mr: 'पन्हाळा', en: 'panhala' },
  { mr: 'विजयदुर्ग', en: 'vijaydurg' },
  { mr: 'मुरुड', en: 'murud' },
  { mr: 'सुवर्णदुर्ग', en: 'suvarnadurg' },
  { mr: 'लोहगड', en: 'lohgad' },
  { mr: 'विसापूर', en: 'visapur' },
  { mr: 'हरिश्चंद्रगड', en: 'harishchandragad' },
  { mr: 'साल्हेर', en: 'salher' }
];

// Precision Intent Resolution to completely prevent identical/repeated answers
function detectSpecificIntent(query = '') {
  const norm = normalizeText(query);

  // 1. Specific Fort lookup
  for (const f of FORT_MAPPINGS) {
    if (norm.includes(f.mr) || norm.includes(f.en)) {
      return {
        type: 'FORT_SPECIFIC',
        fortNameEn: f.en,
        fortNameMr: f.mr
      };
    }
  }

  // 2. Shivaji Maharaj Coronation (राज्याभिषेक)
  if (norm.includes('राज्याभिषेक') || norm.includes('coronation') || norm.includes('coronated') || norm.includes('१६७४') || norm.includes('1674')) {
    return { type: 'CORONATION' };
  }

  // 3. Shivaji Maharaj Birth (जन्म)
  if (norm.includes('जन्म') || norm.includes('born') || norm.includes('birth') || norm.includes('१६३०') || norm.includes('1630')) {
    return { type: 'SHIVAJI_BIRTH' };
  }

  // 4. Shivaji Maharaj Mother / Jijabai (जिजामाता / जिजाबाई / आई / माता)
  if (norm.includes('जिजाबाई') || norm.includes('जिजामाता') || norm.includes('माता') || norm.includes('mother') || norm.includes('jijabai')) {
    return { type: 'JIJABAI' };
  }

  // 5. Shivaji Maharaj Father / Shahaji (शहाजी / वडील / पिता)
  if (norm.includes('शहाजी') || norm.includes('वडील') || norm.includes('पिता') || norm.includes('shahaji') || norm.includes('father')) {
    return { type: 'SHAHAJI' };
  }

  // 6. Sambhaji Maharaj (संभाजी महाराज / संभाजीराजे / धर्मवीर)
  if (norm.includes('संभाजी') || norm.includes('sambhaji')) {
    return { type: 'SAMBHAJI' };
  }

  // 7. Ashtapradhan Mandal (अष्टप्रधान मंडळ / पेशवे / अमात्य / मंत्री)
  if (norm.includes('अष्टप्रधान') || norm.includes('ashtapradhan') || norm.includes('पेशवा') || norm.includes('peshwa') || norm.includes('अमात्य') || norm.includes('amatya')) {
    return { type: 'ASHTAPRADHAN' };
  }

  // 8. Maratha Navy / Sea Forts / Kanhoji Angre (आरमार / कान्होजी आंग्रे / navy)
  if (norm.includes('आरमार') || norm.includes('नौदल') || norm.includes('navy') || norm.includes('आंग्रे') || norm.includes('angre')) {
    return { type: 'NAVY' };
  }

  // 9. Battles / Panipat / Pratapgad war (लढाई / पानिपत / युद्ध / battle)
  if (norm.includes('पानिपत') || norm.includes('panipat') || norm.includes('लढाई') || norm.includes('battle') || norm.includes('युद्ध')) {
    return { type: 'BATTLES' };
  }

  // 10. Business Sangam (व्यवसाय संगम / business sangam / नेटवर्किंग)
  if (norm.includes('व्यवसाय संगम') || norm.includes('business sangam') || (norm.includes('व्यवसाय') && norm.includes('संगम'))) {
    return { type: 'BUSINESS_SANGAM' };
  }

  // 11. Balidan Maas (बलिदान मास)
  if (norm.includes('बलिदान मास') || norm.includes('balidan maas') || norm.includes('बलिदान')) {
    return { type: 'BALIDAN_MAAS' };
  }

  // 12. Membership Registration (नोंदणी / सभासद / register / membership / सभासदत्व)
  if (norm.includes('नोंदणी') || norm.includes('सभासद') || norm.includes('सदस्य') || norm.includes('पंजीकरण') || norm.includes('register') || norm.includes('membership') || norm.includes('सभासदत्व')) {
    return { type: 'REGISTRATION' };
  }

  // 13. Digital ID Card (स्मार्ट कार्ड / डिजिटल कार्ड / ओळखपत्र / id card / member card)
  if (norm.includes('कार्ड') || norm.includes('card') || norm.includes('ओळखपत्र')) {
    return { type: 'DIGITAL_CARD' };
  }

  // 14. Jobs / Career / Employment (नोकरी / रोजगार / जॉब / job / career)
  if (norm.includes('नोकरी') || norm.includes('रोजगार') || norm.includes('जॉब') || norm.includes('job') || norm.includes('career')) {
    return { type: 'JOBS_PORTAL' };
  }

  // 15. Six Engines / Architecture of Connect Maratha (सहा इंजिन / 6 engines / प्रणाली)
  if (norm.includes('सहा') || norm.includes('six') || norm.includes('इंजिन') || norm.includes('engine') || norm.includes('प्रणाली')) {
    return { type: 'SIX_ENGINES' };
  }

  // 16. Four Pillars (चार स्तंभ / 4 pillars / आधारस्तंभ)
  if (norm.includes('चार स्तंभ') || norm.includes('four pillars') || norm.includes('आधारस्तंभ') || norm.includes('स्तंभ')) {
    return { type: 'FOUR_PILLARS' };
  }

  // 17. Slogan / Tagline / Motto (घोषवाक्य / motto / tagline / slogan)
  if (norm.includes('घोषवाक्य') || norm.includes('motto') || norm.includes('tagline') || norm.includes('slogan')) {
    return { type: 'SLOGAN' };
  }

  // 18. Akhil Bharatiya Maratha Mahasangh (महासंघ / mahasangh / संघटना)
  if (norm.includes('महासंघ') || norm.includes('mahasangh') || norm.includes('संघटना')) {
    return { type: 'MAHASANGH' };
  }

  // 19. General Connect Maratha platform definition
  if (norm.includes('connect maratha') || norm.includes('कनेक्ट मराठा') || norm.includes('व्यासपीठ') || norm.includes('platform')) {
    return { type: 'CONNECT_MARATHA_PLATFORM' };
  }

  return { type: 'GENERIC' };
}

// Extract appropriate language text
function getLocalizedAnswer(item, lang) {
  if (!item || !item.answer) return '';
  if (typeof item.answer === 'object') {
    return item.answer[lang] || item.answer['mr'] || item.answer['en'] || Object.values(item.answer)[0] || '';
  }
  return String(item.answer);
}

// Search with Intent Resolution Guarantee
export function searchKnowledgeBase(query = '', requestedLang = 'mr', topK = 3) {
  if (!query || !knowledgeBase.length) return [];

  const intent = detectSpecificIntent(query);
  const normQuery = normalizeText(query);
  let filtered = [];

  // 1. Direct Intent Routing
  if (intent.type === 'FORT_SPECIFIC') {
    filtered = knowledgeBase.filter(x => {
      if (x.topic !== 'Forts') return false;
      const kws = (x.keywords || []).map(k => k.toLowerCase());
      return kws.includes(intent.fortNameEn) || kws.includes(intent.fortNameMr);
    });
  } else if (intent.type === 'CORONATION') {
    // Specifically return coronation item cm_0178 or timeline 1674 cm_0124
    filtered = knowledgeBase.filter(x => x.id === 'cm_0178' || x.id === 'cm_0124' || (x.question && x.question.toLowerCase().includes('coronation of shivaji')));
  } else if (intent.type === 'SHIVAJI_BIRTH') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0177');
  } else if (intent.type === 'JIJABAI') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0179' || (x.question && x.question.toLowerCase().includes('jijabai')));
  } else if (intent.type === 'SHAHAJI') {
    filtered = knowledgeBase.filter(x => (x.keywords || []).includes('Shahaji'));
  } else if (intent.type === 'SAMBHAJI') {
    filtered = knowledgeBase.filter(x => x.topic === 'Sambhaji Maharaj' || (x.keywords || []).includes('Sambhaji'));
  } else if (intent.type === 'ASHTAPRADHAN') {
    filtered = knowledgeBase.filter(x => x.topic === 'Ashtapradhan');
  } else if (intent.type === 'NAVY') {
    filtered = knowledgeBase.filter(x => x.topic === 'Maratha Navy');
  } else if (intent.type === 'BATTLES') {
    if (normQuery.includes('पानिपत') || normQuery.includes('panipat')) {
      filtered = knowledgeBase.filter(x => x.question && x.question.toLowerCase().includes('panipat'));
    } else {
      filtered = knowledgeBase.filter(x => x.topic === 'Battles');
    }
  } else if (intent.type === 'BUSINESS_SANGAM') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0018' || x.id === 'cm_0019' || x.id === 'cm_0020');
  } else if (intent.type === 'BALIDAN_MAAS') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0021' || x.id === 'cm_0022' || x.id === 'cm_0023');
  } else if (intent.type === 'REGISTRATION') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0027' || (x.question && x.question.toLowerCase().includes('register')));
  } else if (intent.type === 'DIGITAL_CARD') {
    // Special Connect Maratha Smart ID Card answer
    return [{
      id: 'cm_custom_card',
      category: 'Membership',
      topic: 'Digital ID Card',
      question: 'सभासद डिजिटल कार्ड कसे मिळवायचे?',
      answer: requestedLang === 'mr'
        ? "कनेक्ट मराठावर नोंदणी पूर्ण केल्यानंतर प्रत्येक सभासदाला अधिकृत QR-कोड असलेले 'स्मार्ट डिजिटल सभासद कार्ड' (Digital ID Card) मिळते. आपण आपल्या प्रोफाईलमध्ये किंवा मेनूतील 'डिजिटल कार्ड' पर्यायावर जाऊन आपले कार्ड डाउनलोड किंवा प्रिंट करू शकता."
        : requestedLang === 'hi'
        ? "कनेक्ट मराठा पर पंजीकरण पूरा करने के बाद प्रत्येक सदस्य को आधिकारिक क्यूआर कोड युक्त 'स्मार्ट डिजिटल सदस्यता कार्ड' मिलता है। आप प्रोफाइल या 'डिजिटल कार्ड' सेक्शन से इसे डाउनलोड कर सकते हैं।"
        : "After completing your registration on Connect Maratha, every member receives an official QR-verified 'Smart Digital Membership Card'. You can view, download, or print it directly from your Profile or the Digital Card section.",
      score: 1.0,
      source: 'https://www.connectmaratha.com/member/card'
    }];
  } else if (intent.type === 'JOBS_PORTAL') {
    return [{
      id: 'cm_custom_jobs',
      category: 'Employment',
      topic: 'Jobs Portal',
      question: 'नोकरी कशी शोधायची / रोजगार संधी काय आहेत?',
      answer: requestedLang === 'mr'
        ? "कनेक्ट मराठावर 'नोकरी व सेवा दालन' (Jobs & Opportunities) उपलब्ध आहे. येथे मराठा उद्योजक, कंपन्या व संस्था नवीन नोकऱ्यांची माहिती पोस्ट करतात. आपण आपल्या शैक्षणिक पात्रतेनुसार विविध पदांसाठी थेट अर्ज करू शकता."
        : requestedLang === 'hi'
        ? "कनेक्ट मराठा पर 'जॉब्स पोर्टल' उपलब्ध है जहाँ समाज के उद्यमी और कंपनियाँ रोजगार के अवसर पोस्ट करते हैं। आप सीधे आवेदन कर सकते हैं।"
        : "Connect Maratha provides a dedicated Jobs & Career Portal where businesses and community entrepreneurs post vacancies across various sectors. Members can explore and apply directly.",
      score: 1.0,
      source: 'https://www.connectmaratha.com/jobs'
    }];
  } else if (intent.type === 'SIX_ENGINES') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0006' || x.id === 'cm_0007' || x.id === 'cm_0008');
  } else if (intent.type === 'FOUR_PILLARS') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0011' || x.id === 'cm_0012' || x.id === 'cm_0013');
  } else if (intent.type === 'SLOGAN') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0015' || x.id === 'cm_0016' || x.id === 'cm_0017');
  } else if (intent.type === 'MAHASANGH') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0448' || x.id === 'cm_0449' || x.id === 'cm_0450');
  } else if (intent.type === 'CONNECT_MARATHA_PLATFORM') {
    filtered = knowledgeBase.filter(x => x.id === 'cm_0001' || x.id === 'cm_0002' || x.id === 'cm_0003');
  }

  // If intent filter matched, return sorted hits
  if (filtered.length > 0) {
    return filtered.slice(0, topK).map(item => ({
      id: item.id,
      category: item.category,
      topic: item.topic,
      question: item.question,
      answer: getLocalizedAnswer(item, requestedLang),
      score: 0.95,
      source: item.source || 'Connect Maratha Knowledge Graph'
    }));
  }

  // 2. Fallback: Word-level semantic search across all items
  const queryTokens = normQuery.split(' ').filter(t => t.length > 2);
  const scored = [];

  for (const item of knowledgeBase) {
    let score = 0;
    const itemQuestion = normalizeText(item.question || '');
    const itemTopic = normalizeText(item.topic || '');
    const itemCategory = normalizeText(item.category || '');
    const itemKeywords = (item.keywords || []).map(k => normalizeText(k)).join(' ');
    const ansMr = normalizeText(item.answer?.mr || '');
    const ansEn = normalizeText(item.answer?.en || '');

    const combined = `${itemQuestion} ${itemTopic} ${itemCategory} ${itemKeywords} ${ansMr} ${ansEn}`;

    // Token match
    let matchCount = 0;
    for (const token of queryTokens) {
      if (combined.includes(token)) matchCount++;
    }

    if (queryTokens.length > 0) {
      score = matchCount / queryTokens.length;
    }

    if (score >= 0.30) {
      scored.push({
        id: item.id,
        category: item.category,
        topic: item.topic,
        question: item.question,
        answer: getLocalizedAnswer(item, requestedLang),
        score: Math.min(score, 1.0),
        source: item.source || 'Connect Maratha Knowledge Graph'
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// Generate the final answer
export async function generateAIAnswer(message, lang, sessionId = 'default') {
  const norm = normalizeText(message);
  const effectiveLang = lang || detectLanguage(message);

  // 1. Conversational greetings & polite intents
  if (isGreeting(norm)) {
    return {
      response: getGreeting(effectiveLang),
      sources: [],
      mode: 'conversational'
    };
  }

  if (isThankYou(norm)) {
    const thankResp = effectiveLang === 'mr'
      ? "आपले स्वागत आहे! 🙏 तुम्हाला आणखी काही माहिती हवी असल्यास नक्की विचारा. जय शिवराय! 🚩"
      : effectiveLang === 'hi'
      ? "आपका स्वागत है! 🙏 अगर आपको और कोई जानकारी चाहिए तो जरूर पूछें। जय शिवराय! 🚩"
      : "You're welcome! 🙏 Feel free to ask if you have any more questions. Jai Shivrai! 🚩";
    return { response: thankResp, sources: [], mode: 'conversational' };
  }

  if (isGoodbye(norm)) {
    const byeResp = effectiveLang === 'mr'
      ? "पुन्हा भेटूया! 👋 तुमचा दिवस छान जावो. जय शिवराय! 🚩"
      : effectiveLang === 'hi'
      ? "फिर मिलेंगे! 👋 आपका दिन शुभ हो। जय शिवराय! 🚩"
      : "Goodbye! 👋 Have a great day ahead. Jai Shivrai! 🚩";
    return { response: byeResp, sources: [], mode: 'conversational' };
  }

  // 2. Try Python FastAPI microservice if running on port 8000
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const pyResp = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language: effectiveLang, session_id: sessionId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (pyResp.ok) {
      const pyData = await pyResp.json();
      if (pyData && pyData.response && !pyData.response.toLowerCase().includes('not available')) {
        return {
          response: pyData.response,
          sources: pyData.sources || [],
          mode: 'fastapi-llm'
        };
      }
    }
  } catch (_pyErr) {
    // Microservice not active or timed out; proceed to precision Knowledge Graph lookup
  }

  // 3. Precision Knowledge Graph Lookup (Referencing connect_maratha_content.json)
  const results = searchKnowledgeBase(message, effectiveLang, 3);

  // Function to strictly redact any personal data, phone numbers, passwords, emails
  const sanitizeOutput = (text = '') => {
    if (!text) return '';
    return text
      // Redact passwords or secrets
      .replace(/password\s*[:=]\s*\S+/gi, 'password: [सुरक्षित/REDACTED]')
      .replace(/passcode\s*[:=]\s*\S+/gi, 'passcode: [सुरक्षित/REDACTED]')
      .replace(/pwd\s*[:=]\s*\S+/gi, 'pwd: [सुरक्षित/REDACTED]')
      // Redact personal email addresses (keep general official contact if any)
      .replace(/([a-zA-Z0-9_.+-]+@(?!connectmaratha\.com)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/gi, '[ईमेल सुरक्षित/REDACTED]')
      // Redact 10-digit mobile phone numbers
      .replace(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g, '[संपर्क सुरक्षित/REDACTED]');
  };

  if (results && results.length > 0) {
    const best = results[0];
    return {
      response: sanitizeOutput(best.answer),
      sources: [
        {
          id: best.id,
          topic: best.topic,
          category: best.category,
          source: best.source
        }
      ],
      mode: 'knowledge-rag'
    };
  }

  // 4. Default no-match fallback
  const noMatchMsg = effectiveLang === 'mr'
    ? "माफ करा, या प्रश्नाशी संबंधित नेमकी माहिती नॉलेज बेसमध्ये सापडली नाही. कृपया आपला प्रश्न पुन्हा विचारून पहा किंवा खालील 'तांत्रिक मदत' बटनावर क्लिक करून आमच्या टीमशी संपर्क साधा."
    : effectiveLang === 'hi'
    ? "क्षमा करें, इस प्रश्न से संबंधित सटीक जानकारी नहीं मिली। कृपया पुनः प्रयास करें अथवा तकनीकी सहायता अनुरोध सबमिट करें।"
    : "Sorry, no exact matching information was found in the Connect Maratha knowledge base. Please rephrase or submit a technical support request.";

  return {
    response: noMatchMsg,
    sources: [],
    mode: 'no-match'
  };
}
