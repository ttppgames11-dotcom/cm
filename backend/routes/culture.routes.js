import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize } from '../utils/validator.js';

const router = Router();

// ==========================================
// 1. ORAL HISTORY ARCHIVE (/api/culture/oral-history)
// ==========================================
router.get('/oral-history', (req, res) => {
  const list = db.getCollection('oralHistory');
  return sendSuccess(res, 'मौखिक इतिहास व लोकपरंपरा नोंदी प्राप्त झाल्या', list);
});

router.post('/oral-history', optionalToken, (req, res) => {
  const { title, village, taluka, district, region, contributor, contributorClan, story, historicalReference, audioUrl } = req.body;
  const cleanTitle = sanitize(title);
  const cleanStory = sanitize(story);

  if (!cleanTitle || !cleanStory || cleanStory.length < 5) {
    return sendError(res, 'कथेचे शीर्षक आणि सविस्तर माहिती (किमान ५ अक्षरे) आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const newStory = {
    id: `oral_${Date.now()}`,
    title: cleanTitle,
    village: sanitize(village) || 'अज्ञात',
    taluka: sanitize(taluka) || '',
    district: sanitize(district) || 'महाराष्ट्र',
    region: sanitize(region) || 'महाराष्ट्र',
    contributor: sanitize(contributor) || req.user?.name || 'अनामिक इतिहासप्रेमी',
    contributorId: req.user?.id || 'GUEST',
    contributorClan: sanitize(contributorClan) || 'मराठा कुळ',
    dateSubmitted: new Date().toLocaleDateString('mr-IN'),
    story: cleanStory,
    historicalReference: sanitize(historicalReference) || 'मौखिक कुटुंब परंपरा व वृद्ध व्यक्तींची स्मृती',
    tier: 'Tier 4: मौखिक इतिहास व लोकपरंपरा',
    status: 'पडताळणी अंतर्गत (Under Community Review)',
    audioUrl: sanitize(audioUrl) || null,
    createdAt: new Date().toISOString()
  };

  db.insert('oralHistory', newStory);
  db.addAuditLog('SUBMIT_ORAL_HISTORY', req.user?.id || 'GUEST', { title: cleanTitle, village: newStory.village });

  return sendSuccess(res, 'आपली मौखिक परंपरा नोंद यशस्वीरीत्या जतन करण्यात आली!', { story: newStory }, 201);
});

// ==========================================
// 2. MARATHI DIALECTS ARCHIVE (/api/culture/dialects)
// ==========================================
router.get('/dialects', (req, res) => {
  const dialects = [
    { id: 'DIA-01', name: 'अहिराणी (खानदेशी)', region: 'उत्तर महाराष्ट्र (जळगाव, धुळे, नंदुरबार)', speakers: 'सुमारे १ कोटी', samplePhrase: 'कसं शे रे भाऊ? घरचे सगळा खुशाल का?', audioUrl: '/assets/audio/ahirani.mp3' },
    { id: 'DIA-02', name: 'वऱ्हाडी', region: 'विदर्भ (नागपूर, अमरावती, अकोला)', speakers: 'सुमारे १.५ कोटी', samplePhrase: 'का बे, काय चाललं? आज पोट्टे कुठं गेले?', audioUrl: '/assets/audio/varhadi.mp3' },
    { id: 'DIA-03', name: 'मालवणी', region: 'दक्षिण कोकण (सिंधुदुर्ग, रत्नागिरी)', speakers: 'सुमारे ५० लाख', samplePhrase: 'काय रे मका सांग, कडेक का जावचा?', audioUrl: '/assets/audio/malvani.mp3' },
    { id: 'DIA-04', name: 'मराठवाडी (गोदाकाठची बोली)', region: 'मराठवाडा (छत्रपती संभाजीनगर, नांदेड, लातूर)', speakers: 'सुमारे २ कोटी', samplePhrase: 'काय चाललंय मग, बरे हाय का समदे?', audioUrl: '/assets/audio/marathwadi.mp3' },
    { id: 'DIA-05', name: 'कोल्हापुरी / घाटी बोली', region: 'पश्चिम महाराष्ट्र (कोल्हापूर, सांगली, सातारा)', speakers: 'सुमारे १ कोटी', samplePhrase: 'काय भावा, कसं काय चाललंय? एकदम कडक!', audioUrl: '/assets/audio/kolhapuri.mp3' },
    { id: 'DIA-06', name: 'आगरी / कोळी बोली', region: 'उत्तर कोकण (ठाणे, रायगड, मुंबई उपनगर)', speakers: 'सुमारे २५ लाख', samplePhrase: 'आमचा पाडा, आमची खाडी! चालला का मासेमारीला?', audioUrl: '/assets/audio/agri.mp3' }
  ];

  return sendSuccess(res, 'मराठी बोलीभाषा ध्वनीसंग्रह व शब्दकोश', { dialects });
});

// ==========================================
// 3. MAHARASHTRA FOOD CULTURE (/api/culture/food)
// ==========================================
router.get('/food', (req, res) => {
  const foodHeritage = [
    { id: 'FD-01', name: 'तांबडा-पांढरा रस्सा', region: 'कोल्हापूर', type: 'पारंपरिक मांसाहारी सूप', desc: 'मराठा सैनिकी खानावळीतील पारंपरिक मसालेयुक्त तांबडा आणि नारळाच्या दुधाचा पांढरा रस्सा.' },
    { id: 'FD-02', name: 'झुणका-भाकर व ठेचा', region: 'संपूर्ण महाराष्ट्र', type: 'स्वराज्य मावळा आहार', desc: 'शिवकालीन सैनिकांचा मुख्य ऊर्जादायी आहार, ज्वारी/बाजरीची भाकरी व खर्डा.' },
    { id: 'FD-03', name: 'पूरणपोळी व कटाची आमटी', region: 'महाराष्ट्र', type: 'सण व उत्सव पक्वान्न', desc: 'गुळ-डाळीचे सारण भरलेली मऊ पोळी व चण्याची कटाची झणझणीत आमटी.' },
    { id: 'FD-04', name: 'मालवणी सुके मटण व वडे', region: 'कोकण', type: 'किनारपट्टी पारंपरिक मेजवानी', desc: 'दहा धान्यांचे पीठ तळून केलेले कोंबडी वडे आणि नारळी वाटपातील मटण.' },
    { id: 'FD-05', name: 'सावजी मटण व रस्सा', region: 'विदर्भ', type: 'पारंपरिक मसालेदार पाककृती', desc: 'काळ्या मसाल्यातील प्रसिद्ध सावजी पाककला.' }
  ];

  return sendSuccess(res, 'महाराष्ट्राची समृद्ध खाद्यसंस्कृती', { foodHeritage });
});

// ==========================================
// 4. GRAMDEVAT & JATRA (/api/culture/gramdevat)
// ==========================================
router.get('/gramdevat', (req, res) => {
  const gramdevats = [
    { id: 'GD-01', deity: 'श्री खंडोबा (मल्हारी मार्तंड)', place: 'जेजुरी (पुणे)', significance: 'मराठ्यांचे कुलदैवत, येळकोट येळकोट जय मल्हार!', jatraTime: 'चंपाषष्ठी व सोमवती अमावस्या' },
    { id: 'GD-02', deity: 'आई तुळजाभवानी', place: 'तुळजापूर (धाराशिव)', significance: 'छत्रपती शिवरायांची आराध्य देवता व कुलस्वामिनी', jatraTime: 'शारदीय नवरात्र महोत्सव' },
    { id: 'GD-03', deity: 'श्री महालक्ष्मी (अंबाबाई)', place: 'कोल्हापूर', significance: 'करवीर निवासिनी शक्तीपीठ', jatraTime: 'किरणोत्सव व नवरात्र' },
    { id: 'GD-04', deity: 'शिखर शिंगणापूर शंभू महादेव', place: 'माण (सातारा)', significance: 'छत्रपती शहाजीराजे व शिवरायांचे श्रद्धस्थान', jatraTime: 'चैत्र शुद्ध द्वादशी कावड यात्रा' },
    { id: 'GD-05', deity: 'काळभैरवनाथ ग्रामदैवत', place: 'गाव-परत्वे संपूर्ण महाराष्ट्र', significance: 'गावाचे रक्षणकर्ता ग्रामदैवत', jatraTime: 'चैत्र-वैशाख यात्रा' }
  ];

  return sendSuccess(res, 'कुलदैवत व ग्रामदैवत यात्रा सूची', { gramdevats });
});

// ==========================================
// 5. KNOWLEDGE GRAPH (/api/culture/knowledge-graph)
// ==========================================
router.get('/knowledge-graph', (req, res) => {
  const knowledgeGraph = {
    nodes: [
      { id: 'shivaji', label: 'छत्रपती शिवाजी महाराज', type: 'छत्रपती', era: '१६३०-१६८०' },
      { id: 'jijau', label: 'राजमाता जिजाऊ', type: 'प्रेरणास्थान', era: '१५९८-१६७४' },
      { id: 'sambhaji', label: 'छत्रपती संभाजी महाराज', type: 'छत्रपती', era: '१६५७-१६८९' },
      { id: 'raigad', label: 'किल्ले रायगड', type: 'राजधानी', district: 'रायगड' },
      { id: 'rajgad', label: 'किल्ले राजगड', type: 'पहिली राजधानी', district: 'पुणे' },
      { id: 'ashta_pradhan', label: 'अष्टप्रधान मंडळ', type: 'प्रशासन प्रणाली' },
      { id: 'navy', label: 'मराठा आरमार (कान्होजी आंग्रे)', type: 'आरमार दल' }
    ],
    edges: [
      { source: 'jijau', target: 'shivaji', relation: 'मातृ-मार्गदर्शन व संस्कार' },
      { source: 'shivaji', target: 'rajgad', relation: '२६ वर्षे स्वराज्य संचलन' },
      { source: 'shivaji', target: 'raigad', relation: 'शिवराज्याभिषेक राजधानी' },
      { source: 'shivaji', target: 'sambhaji', relation: 'पितृ-पुत्र व वारसा' },
      { source: 'shivaji', target: 'ashta_pradhan', relation: 'संस्थापन' },
      { source: 'shivaji', target: 'navy', relation: 'सिंधुदुर्ग व विजयदुर्ग निर्मिती' }
    ]
  };

  return sendSuccess(res, 'मराठा साम्राज्य नॉलेज ग्राफ', { knowledgeGraph });
});

// ==========================================
// 6. FORTS MAP & TRAILS (/api/culture/forts)
// ==========================================
router.get('/forts', (req, res) => {
  const forts = [
    { id: 'raigad', name: 'किल्ले रायगड', district: 'रायगड', type: 'गिरीदुर्ग', altitude: '८२० मी.', significance: 'स्वराज्याची राजधानी, छत्रपती शिवरायांची समाधी व मेघडंबरी.' },
    { id: 'rajgad', name: 'किल्ले राजगड', district: 'पुणे', type: 'गिरीदुर्ग', altitude: '१३७६ मी.', significance: 'स्वराज्याची पहिली राजधानी, सुवेळा व पद्मावती माची.' },
    { id: 'shivneri', name: 'किल्ले शिवनेरी', district: 'पुणे (जुन्नर)', type: 'गिरीदुर्ग', altitude: '१०२४ मी.', significance: 'छत्रपती शिवाजी महाराजांचे जन्मस्थान.' },
    { id: 'pratapgad', name: 'किल्ले प्रतापगड', district: 'सातारा (महाबळेश्वर)', type: 'गिरीदुर्ग', altitude: '१०८० मी.', significance: 'अफजलखान वध व मराठा रणनीतीचे प्रतीक.' },
    { id: 'sindhudurg', name: 'किल्ले सिंधुदुर्ग', district: 'सिंधुदुर्ग (मालवण)', type: 'जलदुर्ग', altitude: 'समुद्रसपाटी', significance: 'छत्रपती शिवरायांनी उभारलेले अजिंक्य नौदल केंद्र.' },
    { id: 'panhala', name: 'किल्ले पन्हाळा', district: 'कोल्हापूर', type: 'गिरीदुर्ग', altitude: '९२५ मी.', significance: 'सिद्दी जौहरचा वेढा व पावनखिंड रणसंग्राम.' }
  ];

  return sendSuccess(res, 'महाराष्ट्रातील प्रमुख ३५०+ गडकिल्ले सूची', { forts, totalFortsCount: 350 });
});

export default router;
