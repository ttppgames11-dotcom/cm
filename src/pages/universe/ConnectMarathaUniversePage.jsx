import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ==========================================
// 12 MAJOR WORLDS OF CONNECT MARATHA
// ==========================================
const UNIVERSE_WORLDS = [
  { id: 'all', name: 'सर्व १२ विश्वे (All Worlds)', icon: '🌌', count: 'सर्व ४९ वैशिष्ट्ये', color: '#7C1D05', bg: '#FFF7ED' },
  { id: 'history', name: '🏰 इतिहास व साम्राज्य (History)', icon: '🏰', count: 'कालपट, रणांगणे व राजसत्ता', color: '#B91C1C', bg: '#FEF2F2' },
  { id: 'people', name: '👑 व्यक्ती व महापुरुष (People)', icon: '👑', count: 'राजे, राण्या, सेनानी व क्रांतिकारक', color: '#C2410C', bg: '#FFF7ED' },
  { id: 'places', name: '🗺️ गड, गावे व वास्तू (Places)', icon: '🗺️', count: '३५०+ किल्ले, गावे व वाडे', color: '#B45309', bg: '#FEF3C7' },
  { id: 'festivals', name: '🌺 सण व शिवकालीन उत्सव (Festivals)', icon: '🌺', count: 'शिवकाल ते आधुनिक सण', color: '#D97706', bg: '#FFFBEB' },
  { id: 'saints', name: '🧘 संत व अध्यात्म (Saints & Faith)', icon: '🧘', count: 'वारकरी, नाथ, दत्त व भक्ती परंपरा', color: '#15803D', bg: '#F0FDF4' },
  { id: 'culture', name: '🎭 लोककला व संगीत (Culture & Arts)', icon: '🎭', count: 'पोवाडा, लावणी, दशावतार व वाद्ये', color: '#0369A1', bg: '#F0F9FF' },
  { id: 'food', name: '🍲 खाद्यसंस्कृती (Food Atlas)', icon: '🍲', count: '३६ जिल्ह्यांची चव व उगम', color: '#BE123C', bg: '#FFF1F2' },
  { id: 'language', name: '🗣️ भाषा व बोली (Language & Dialects)', icon: '🗣️', count: 'मराठी विकास व प्रादेशिक बोली', color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'society', name: '🏘️ समाज व परंपरा (Society)', icon: '🏘️', count: 'आगरी-कोळी, बलुतेदारी व गावगाडा', color: '#0F766E', bg: '#F0FDFA' },
  { id: 'travel', name: '🛤️ ऐतिहासिक मार्ग व पर्यटन (Travel)', icon: '🛤️', count: 'शिवराय मार्ग, वारी व ट्रेल्स', color: '#C026D3', bg: '#FDF4FF' },
  { id: 'knowledge', name: '📚 ज्ञान, ग्रंथ व संशोधन (Knowledge)', icon: '📚', count: 'बखरी, गाथा व संशोधन स्तर', color: '#374151', bg: '#F3F4F6' },
  { id: 'community', name: '👥 समुदाय व वारसा पासपोर्ट (Community)', icon: '👥', count: 'माझे गाव, कुटुंब व बॅजेस', color: '#4338CA', bg: '#EEF2FF' }
];

// ==========================================
// TIME MACHINE: 12 HISTORICAL EPOCHS
// ==========================================
const TIME_MACHINE_EPOCHS = [
  { id: 'satavahana', era: 'इ.स.पूर्व २३० - इ.स. २२०', title: 'सातवाहन साम्राज्य', capital: 'प्रतिष्ठान (पैठण)', highlight: 'महाराष्ट्राचे पहिले ज्ञात साम्राज्य, नाणेघाट शिलालेख, कार्ले व अजिंठा लेण्यांची सुरुवात, गाथासप्तशती.', mapCenter: 'पैठण / जुन्नर', ruler: 'गौतमीपुत्र सातकर्णी' },
  { id: 'vakataka', era: 'इ.स. २५० - ५००', title: 'वाकाटक राजसत्ता', capital: 'नंदीवर्धन (नागपूर) / वत्सगुल्म (वाशीम)', highlight: 'अजिंठा लेण्यांमधील अद्वितीय भित्तिचित्रे, कालिदासांचे रामटेक येथील मेघदूत लेखन.', mapCenter: 'विदर्भ / रामटेक', ruler: 'प्रवरसेन / प्रभावतीगुप्त' },
  { id: 'chalukya_rashtrakuta', era: 'इ.स. ६०० - ९७३', title: 'चालुक्य व राष्ट्रकूट साम्राज्य', capital: 'मान्यखेत / बादामी', highlight: 'वेरूळचे कैलास मंदिर (गुंफा १६) अखंड पाषाण कोरीव काम, राष्ट्रकूट कृष्ण प्रथमचे अचाट स्थापत्य.', mapCenter: 'वेरूळ / एलोरा', ruler: 'कृष्ण प्रथम / अमोघवर्ष' },
  { id: 'yadava', era: 'इ.स. ११८० - १३१७', title: 'यादव साम्राज्य व मराठी भाषेचा सुवर्णकाळ', capital: 'देवगिरी (दौलताबाद)', highlight: 'मराठी भाषेला राजभाषेचा मान, संत ज्ञानेश्वरांची भावार्थदीपिका (ज्ञानेश्वरी), हेमाडपंथी मंदिरे.', mapCenter: 'देवगिरी / नेवासे', ruler: 'सिंघणदेव यादव' },
  { id: 'sultanates', era: 'इ.स. १३४७ - १६३०', title: 'बहमनी व दख्खन सल्तनती', capital: 'गुलबर्गा / बिदर / अहमदनगर / विजापूर', highlight: 'निजामशाही, आदिलशाही, कुतुबशाही सत्ता; स्थानिक मराठी सरदारांचे (भोसले, जाधव, घोरपडे) लष्करी महत्त्व वाढले.', mapCenter: 'अहमदनगर / विजापूर', ruler: 'मलिक अंबर' },
  { id: 'shivkal_early', era: 'इ.स. १६३० - १६६०', title: 'छत्रपती शिवराय: स्वराज्य संकल्प', capital: 'राजगड (बालेकिल्ला)', highlight: 'रोहिडेश्वरावर स्वराज्य शपथ, तोरणा, कोंढाणा, पुरंदर विजय, जावळीचा ताबा व प्रतापगड विजय.', mapCenter: 'राजगड / प्रतापगड', ruler: 'छत्रपती शिवाजी महाराज' },
  { id: 'shivkal_golden', era: 'इ.स. १६७० - १६८०', title: 'हिंदवी स्वराज्य व सुवर्ण राज्याभिषेक', capital: 'किल्ले रायगड', highlight: '६ जून १६७४ शिवराज्याभिषेक सोहळा, स्वतंत्र मराठा आरमार, ३५०+ गडकिल्ले, अष्टप्रधान मंडळ, शिवराई-होन नाणी.', mapCenter: 'किल्ले रायगड', ruler: 'छत्रपती शिवाजी महाराज' },
  { id: 'shambhuraje', era: 'इ.स. १६८० - १७०७', title: 'संभाजी महाराज व स्वातंत्र्यसंग्राम', capital: 'रायगड / जिंजी', highlight: 'छत्रपती संभाजी महाराजांचे अतुलनीय शौर्य; औरंगजेबाच्या ५ लाखांच्या सैन्याविरुद्ध महाराणी ताराबाई व संताजी-धनाजींचा लढा.', mapCenter: 'तुळापूर / जिंजी / सातारा', ruler: 'छत्रपती संभाजी महाराज / महाराणी ताराबाई' },
  { id: 'maratha_empire', era: 'इ.स. १७१३ - १७६१', title: 'मराठा साम्राज्य विस्तार (अटकेपार झेंडे)', capital: 'सातारा / पुणे (शनिवारवाडा)', highlight: 'बाजीराव पेशवे यांचे पराक्रम, दिल्ली, माळवा, गुजरात ते अटकेपार (पेशावर) मराठ्यांचा भगवा फडकला.', mapCenter: 'शनिवारवाडा, पुणे', ruler: 'छत्रपती शाहू महाराज / बाजीराव पेशवे' },
  { id: 'british_raj', era: 'इ.स. १८१८ - १९४७', title: 'स्वातंत्र्य लढा व सामाजिक प्रबोधन', capital: 'मुंबई / पुणे', highlight: '१८५७ चा लढा, महात्मा फुले व सावित्रीबाई फुले यांचे स्त्रीशिक्षण, लोकमान्य टिळक, डॉ. बाबासाहेब आंबेडकर व स्वातंत्र्य चळवळ.', mapCenter: 'मुंबई / पुणे', ruler: 'क्रांतिकारक व समाजसुधारक' },
  { id: 'samyukta_maha', era: 'इ.स. १९४७ - १९६०', title: 'संयुक्त महाराष्ट्र चळवळ', capital: 'मुंबई (१०७ हुतात्मा स्मरण)', highlight: 'मुंबईसह संयुक्त महाराष्ट्रासाठी १०७ हुतात्म्यांचे बलिदान; १ मे १९६० रोजी स्वतंत्र महाराष्ट्र राज्याची स्थापना.', mapCenter: 'हुतात्मा चौक, मुंबई', ruler: 'संयुक्त महाराष्ट्र समिती' },
  { id: 'modern_maha', era: 'इ.स. १९६० - आजपर्यंत', title: 'आधुनिक व डिजिटल महाराष्ट्र', capital: 'मुंबई / उपराजधानी नागपूर', highlight: 'भारताची आर्थिक राजधानी, कृषी, उद्योग, अंतराळ, सांस्कृतिक वारसा व डिजिटल क्रांतीचे नेतृत्व.', mapCenter: 'महाराष्ट्र संपूर्ण', ruler: 'महाराष्ट्र शासन व जनता' }
];

// ==========================================
// CONNECT EVERYTHING: KNOWLEDGE GRAPH NODES
// ==========================================
const CONNECTED_NODES_DATA = {
  raigad: {
    id: 'raigad',
    title: 'किल्ले रायगड (राजधानी)',
    type: 'दुर्ग व राजधानी',
    icon: '🏰',
    summary: 'स्वराज्याची अजिंक्य राजधानी, जिथे छत्रपती शिवाजी महाराजांचा ६ जून १६७४ रोजी सुवर्ण राज्याभिषेक सोहळा संपन्न झाला.',
    connections: {
      persons: ['छत्रपती शिवाजी महाराज', 'जिजाऊ मॉंसाहेब', 'छत्रपती संभाजी महाराज', 'सोयराबाई', 'हिरोजी इंदुलकर (स्थापत्यकार)'],
      events: ['६ जून १६७४ राज्याभिषेक', 'इ.स. १६७१ शिमगा उत्सव', 'इ.स. १६७४ गुढीपाडवा', 'इ.स. १६८० शिवराय महाप्रयाण'],
      temples: ['श्री जगदीश्वर मंदिर (रायगड)', 'शिरकाई देवी मंदिर'],
      festivals: ['शिवराज्याभिषेक सोहळा', 'होळीचा माळ शिमगोत्सव', 'महाशिवरात्र'],
      food: ['कोकणी तांदळाची भाकरी', 'पिठलं', 'महाडची खानावळ सोलकढी'],
      dialects: ['रायगडी कोकणी', 'आगरी बोली'],
      routes: ['महाड ते पाचाड मार्ग', 'नाणे दरवाजा ते महादरवाजा ट्रेक', 'रायगड ते प्रतापगड दुर्गमार्ग'],
      documents: ['सभासद बखर', 'हेन्री ऑक्झिंडेन डायरी (इंग्रज दूत)', 'जेधे शकावली']
    }
  },
  shivaji_maharaj: {
    id: 'shivaji_maharaj',
    title: 'छत्रपती शिवाजी महाराज',
    type: 'स्वराज्य संस्थापक',
    icon: '👑',
    summary: 'अखंड महाराष्ट्राचे कुलदैवत, रयतेचे राजे, आरमार जनक व ३५०+ गडकोटांचे निर्माते.',
    connections: {
      persons: ['जिजाऊ मॉंसाहेब', 'शहाजीराजे', 'तानाजी मालुसरे', 'बाजीप्रभू देशपांडे', 'मायनाक भंडारी', 'संत तुकाराम'],
      events: ['१६४५ रोहिडेश्वर शपथ', '१६५९ प्रतापगड युद्ध', '१६६० पावनखिंड लढा', '१६६४ सुरत मोहीम', '१६७४ राज्याभिषेक'],
      temples: ['तुळजापूर भवानी', 'प्रतापगड भवानी मंदिर', 'कसबा गणपती', 'शिखर शिंगणापूर'],
      festivals: ['शिवजयंती', 'दसरा शस्त्रपूजा', 'नारळी पौर्णिमा आरमार मोसम', 'गुढीपाडवा'],
      food: ['ज्वारीची भाकरी', 'ठेचा', 'कडधान्य उसळ', 'मावळी जेवण'],
      dialects: ['शिवकालीन मराठी', 'मावळी बोली', 'कोकणी'],
      routes: ['शिवनेरी ते रायगड पदभ्रमण', 'आग्रा ते राजगढ परतीचा गुप्त मार्ग'],
      documents: ['शिवभारत', 'आज्ञापत्र (रामचंद्रपंत अमात्य)', 'राजव्यवहार कोश']
    }
  },
  sindhudurg: {
    id: 'sindhudurg',
    title: 'किल्ले सिंधुदुर्ग व आरमार',
    type: 'जलदुर्ग व आरमार',
    icon: '⚓',
    summary: 'अरबी समुद्रात कुरटे बेटावर शिवरायांनी उभारलेला सागरी बालेकिल्ला; मराठा आरमाराचा पाया.',
    connections: {
      persons: ['छत्रपती शिवाजी महाराज', 'मायनाक भंडारी', 'कान्होजी आंग्रे', 'स्थानिक कोळी व खारवी खलाशी'],
      events: ['इ.स. १६६४ जलदुर्ग पायाभरणी', 'मराठा आरमाराची सागरी गस्त', 'खांदेरीची सागरी लढाई (१६७९)'],
      temples: ['शिवराजेश्वर मंदिर (सिंधुदुर्ग)', 'कुणकेश्वर मंदिर'],
      festivals: ['नारळी पौर्णिमा समुद्रपूजन', 'महाशिवरात्र'],
      food: ['मालवणी मासळी', 'सोलकढी', 'घावणे', 'काजू उसळ'],
      dialects: ['मालवणी बोली', 'कोळी भाषा'],
      routes: ['मालवण ते विजयदुर्ग सागरी मार्ग', 'तारकर्ली ते देवबाग बोट सफारी'],
      documents: ['मुंबई फॅक्टरी रेकॉर्ड्स', 'मराठा आरमार दफ्तर']
    }
  }
};

// ==========================================
// MASTER MAP 21 LAYERS CONFIGURATION
// ==========================================
const MASTER_MAP_LAYERS = [
  { id: 'forts', name: '🏰 किल्ले (Forts)', active: true, color: '#DC2626' },
  { id: 'temples', name: '🛕 मंदिरे (Temples)', active: true, color: '#D97706' },
  { id: 'saints', name: '🧘 संत स्थाने (Saints)', active: true, color: '#15803D' },
  { id: 'festivals', name: '🌺 सण व जत्रा (Festivals)', active: false, color: '#E11D48' },
  { id: 'events', name: '⚔️ युद्धे व घटना (Battles)', active: true, color: '#B91C1C' },
  { id: 'caves', name: '🏛️ लेणी व प्राचीन स्थळे (Caves)', active: false, color: '#7C3AED' },
  { id: 'museums', name: '🏛️ संग्रहालये (Museums)', active: false, color: '#4B5563' },
  { id: 'wadas', name: '🏘️ ऐतिहासिक वाडे (Wadas)', active: false, color: '#92400E' },
  { id: 'rivers', name: '💧 नद्या व घाट (Rivers & Ghats)', active: false, color: '#0284C7' },
  { id: 'routes', name: '🛤️ व्यापारी व तीर्थ मार्ग (Routes)', active: false, color: '#C026D3' },
  { id: 'food', name: '🍲 प्रसिद्ध खाद्यपदार्थ (Food)', active: false, color: '#BE123C' },
  { id: 'dialects', name: '🗣️ प्रादेशिक बोली (Dialects)', active: false, color: '#6D28D9' }
];

export default function ConnectMarathaUniversePage() {
  const [selectedWorld, setSelectedWorld] = useState('all');
  const [selectedEpoch, setSelectedEpoch] = useState(TIME_MACHINE_EPOCHS[6]); // 1674 default
  const [selectedConnectedNode, setSelectedConnectedNode] = useState(CONNECTED_NODES_DATA.raigad);
  const [learningMode, setLearningMode] = useState('detailed'); // 'simple' | 'detailed' | 'research'
  const [language, setLanguage] = useState('mr'); // 'mr' | 'en'
  const [activeLayers, setActiveLayers] = useState(
    MASTER_MAP_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: l.active }), {})
  );

  // Modals & Interactive Drawers
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showFamilyTreeModal, setShowFamilyTreeModal] = useState(false);
  const [showVillageModal, setShowVillageModal] = useState(false);
  const [villageSearch, setVillageSearch] = useState('');

  // Gamification User State
  const [passportStats, setPassportStats] = useState({
    points: 850,
    level: 'इतिहास संशोधक (Level 3 Researcher)',
    fortsVisited: 14,
    templesVisited: 9,
    quizzesCompleted: 6,
    badges: ['सह्याद्री दुर्गवीर', 'शिवराज्याभिषेक साक्षीदार', 'वारकरी भक्ती साधक']
  });

  const toggleLayer = (id) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9', color: '#431407' }}>
      
      {/* ================= HERO HEADER ================= */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 50%, #EA580C 100%)',
        color: '#FFFFFF',
        padding: '48px 20px 38px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Top Breadcrumb & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.9 }}>
              <Link to="/" style={{ color: '#FDE68A', textDecoration: 'none' }}>मुख्यपृष्ठ</Link>
              <span>/</span>
              <span>Connect Maratha — Expanded Feature Universe</span>
            </div>

            {/* Language & Learning Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLanguage('mr')}
                  style={{
                    background: language === 'mr' ? '#FFFFFF' : 'transparent',
                    color: language === 'mr' ? '#7C1D05' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  style={{
                    background: language === 'en' ? '#FFFFFF' : 'transparent',
                    color: language === 'en' ? '#7C1D05' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  English
                </button>
              </div>

              {/* 3 Learning Modes */}
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLearningMode('simple')}
                  title="Explain Like I'm 10 (बालमित्र सोपे स्वरूप)"
                  style={{
                    background: learningMode === 'simple' ? '#86EFAC' : 'transparent',
                    color: learningMode === 'simple' ? '#14532D' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🟢 १० वर्षे सोपे
                </button>
                <button
                  onClick={() => setLearningMode('detailed')}
                  title="Detailed Mode (सामान्य वाचक)"
                  style={{
                    background: learningMode === 'detailed' ? '#FED7AA' : 'transparent',
                    color: learningMode === 'detailed' ? '#7C1D05' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🔵 सविस्तर
                </button>
                <button
                  onClick={() => setLearningMode('research')}
                  title="Research Mode (संशोधक व पुरावे)"
                  style={{
                    background: learningMode === 'research' ? '#D8B4FE' : 'transparent',
                    color: learningMode === 'research' ? '#581C87' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🟣 संशोधन मोड
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '12px' }}>
            <span>🌐 CONNECT MARATHA MEGA-PLATFORM</span>
            <span>•</span>
            <span>४९ एकात्मिक वैशिष्ट्ये • १२ महाविश्वे</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px', lineHeight: 1.2 }}>
            {language === 'mr' ? 'कनेक्ट मराठा — संपूर्ण महाराष्ट्र ज्ञानविश्व' : 'Connect Maratha — Expanded Feature Universe'}
          </h1>

          <p style={{ fontSize: '1.15rem', maxWidth: '920px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            {language === 'mr' 
              ? 'महाराष्ट्र समजून घ्या एका व्यक्तीची किंवा काळाची कथा म्हणून नव्हे, तर माती, माणूस, किल्ले, मंदिरे, संत, शेती, खाद्य, भाषा, समाज, साहित्य, गावे आणि इतिहास यांची परस्परांशी अखंड जोडलेली अजरामर कथा म्हणून!'
              : 'Discover Maharashtra not just as a single event or era, but as an interconnected saga of soil, people, forts, temples, saints, farming, cuisine, dialects, literature, villages, and living heritage!'}
          </p>

          {/* Quick Launchpad Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <a href="#master-map" style={{ background: '#FFFFFF', color: '#7C1D05', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🗺️ मास्टर मॅप (२१ लेअर्स)
            </a>
            <a href="#time-machine" style={{ background: '#FEF3C7', color: '#92400E', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              ⏳ टाईम मशीन (इ.स.पू. २३० ते आज)
            </a>
            <a href="#connect-everything" style={{ background: '#DCFCE7', color: '#15803D', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🔗 कनेक्ट एव्हरीथिंग इंजिन
            </a>
            <button
              onClick={() => setShowPassportModal(true)}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.4)', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🪪 वारसा पासपोर्ट ({passportStats.points} गुण)
            </button>
            <button
              onClick={() => setShowEmergencyModal(true)}
              style={{ background: '#FEE2E2', color: '#B91C1C', border: '1.5px solid #FCA5A5', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🚨 वारसा संवर्धन आणीबाणी
            </button>
          </div>
        </div>
      </section>

      {/* ================= 12 WORLDS QUICK FILTER NAV ================= */}
      <div style={{ background: '#FFFFFF', borderBottom: '2px solid #FED7AA', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '10px 20px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {UNIVERSE_WORLDS.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWorld(w.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedWorld === w.id ? `2px solid ${w.color}` : '1px solid #FED7AA',
                background: selectedWorld === w.id ? w.color : '#FFFDF9',
                color: selectedWorld === w.id ? '#FFFFFF' : '#431407',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{w.icon}</span>
              <span>{w.name.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* ================= FEATURE 34: 5-TIER FACT VS TRADITION BADGE BANNER ================= */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #FED7AA',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              सत्यनिष्ठ मांडणी • FACT VS TRADITION VERIFICATION
            </span>
            <div style={{ fontSize: '0.92rem', color: '#78350F', fontWeight: 600 }}>
              Connect Maratha व्यासपीठावरील प्रत्येक ऐतिहासिक माहिती ५ स्तरांवर पडताळून दिली जाते:
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🟢 सप्रमाण दस्तऐवज (Fact)
            </span>
            <span style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🔵 अभ्यासकीय निष्कर्ष (Scholarly)
            </span>
            <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🟡 लोकपरंपरा (Oral Tradition)
            </span>
            <span style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🟠 धार्मिक श्रद्धा (Religious)
            </span>
            <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🔴 असत्यापित दावा (Unverified)
            </span>
          </div>
        </div>

        {/* ================= FEATURE 2: MAHARASHTRA TIME MACHINE ================= */}
        <section id="time-machine" style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
          border: '2px solid #F59E0B',
          borderRadius: '18px',
          padding: '28px',
          marginBottom: '40px',
          boxShadow: '0 6px 20px rgba(217,119,6,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य २ • MAHARASHTRA TIME MACHINE
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                ⏳ महाराष्ट्र टाईम मशीन (इ.स. पूर्व २३० ते आज)
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                कालखंड निवडा आणि त्या काळातील राजधानी, राज्यकर्ते, किल्ले, साहित्य व नकाशा बदलाचे दृश्य अनुभवा.
              </p>
            </div>

            <div style={{ background: '#FEF3C7', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, color: '#92400E', border: '1px solid #F59E0B' }}>
              निवडलेला काळ: {selectedEpoch.era}
            </div>
          </div>

          {/* Epoch Selector Slider/Buttons */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
            {TIME_MACHINE_EPOCHS.map(ep => (
              <button
                key={ep.id}
                onClick={() => setSelectedEpoch(ep)}
                style={{
                  minWidth: '150px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: selectedEpoch.id === ep.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                  background: selectedEpoch.id === ep.id ? '#7C1D05' : '#FFFFFF',
                  color: selectedEpoch.id === ep.id ? '#FFFFFF' : '#431407',
                  textAlign: 'left',
                  boxShadow: selectedEpoch.id === ep.id ? '0 4px 12px rgba(124,29,5,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>{ep.era}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, marginTop: '2px', lineHeight: 1.3 }}>{ep.title.split('(')[0]}</div>
              </button>
            ))}
          </div>

          {/* Active Epoch Full View */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1.5px solid #FED7AA',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>
                ऐतिहासिक कालखंड सारांश
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 8px' }}>
                {selectedEpoch.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#431407', lineHeight: 1.6, margin: '0 0 14px' }}>
                {selectedEpoch.highlight}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
                <div><strong>राजधानी:</strong> {selectedEpoch.capital}</div>
                <div><strong>प्रमुख राजे / सत्ताधीश:</strong> {selectedEpoch.ruler}</div>
                <div><strong>भौगोलिक केंद्र:</strong> {selectedEpoch.mapCenter}</div>
              </div>
            </div>

            <div style={{
              background: '#FFFDF9',
              border: '1px dashed #F59E0B',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                  त्या काळातील थेट वारसा अवशेष
                </span>
                <p style={{ fontSize: '0.88rem', color: '#78350F', marginTop: '6px', lineHeight: 1.5 }}>
                  या काळात निर्माण झालेले किल्ले, मंदिरे किंवा शिलालेख आज आपण प्रत्यक्ष कुठे पाहू शकतो ते नकाशावर शोधा.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <a
                  href="#master-map"
                  style={{
                    background: '#C2410C',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  नकाशावर पाहा →
                </a>
                <Link
                  to="/history/knowledge-graph"
                  style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #FED7AA'
                  }}
                >
                  नॉलेज ग्राफ उघडा ⚡
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURE 1: MASTER MAP WITH 21 LAYERS ================= */}
        <section id="master-map" style={{
          background: '#FFFFFF',
          border: '2px solid #FED7AA',
          borderRadius: '18px',
          padding: '28px',
          marginBottom: '40px',
          boxShadow: '0 4px 16px rgba(234,88,12,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य १ • MAHARASHTRA INTERACTIVE MASTER MAP
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                🗺️ महाराष्ट्र परस्परसंवादी मास्टर मॅप (Multi-Layer Map)
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                लेअर्स चालू/बंद करा: किल्ले, मंदिरे, संत, सण, रणांगणे, नद्या, घाट, खाद्य आणि प्रादेशिक बोली.
              </p>
            </div>

            <Link
              to="/culture/heritage-map"
              style={{
                background: '#7C1D05',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(124,29,5,0.2)'
              }}
            >
              पूर्ण स्क्रीन मॅप उघडा ⛶
            </Link>
          </div>

          {/* Layer Toggle Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {MASTER_MAP_LAYERS.map(layer => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeLayers[layer.id] ? `1.5px solid ${layer.color}` : '1px solid #D1D5DB',
                  background: activeLayers[layer.id] ? `${layer.color}15` : '#F3F4F6',
                  color: activeLayers[layer.id] ? layer.color : '#6B7280',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{activeLayers[layer.id] ? '✓' : '+'}</span>
                <span>{layer.name}</span>
              </button>
            ))}
          </div>

          {/* Interactive Map Visual Simulator Container */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFDF9 0%, #FEF3C7 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            minHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#7C1D05' }}>
                📍 सह्याद्री व दख्खन पठार — एका क्लिकवर वारसा संबंध
              </div>
              <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                सक्रिय लेअर्स: {Object.values(activeLayers).filter(Boolean).length} / {MASTER_MAP_LAYERS.length}
              </span>
            </div>

            {/* Stylized Pin Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '20px 0' }}>
              <div
                onClick={() => setSelectedConnectedNode(CONNECTED_NODES_DATA.raigad)}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #DC2626',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>🏰</div>
                <strong style={{ color: '#7C1D05', fontSize: '0.9rem' }}>किल्ले रायगड (राजधानी)</strong>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>शिवराज्याभिषेक, होळीचा माळ, जगदीश्वर</div>
              </div>

              <div
                onClick={() => setSelectedConnectedNode(CONNECTED_NODES_DATA.sindhudurg)}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #0284C7',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>⚓</div>
                <strong style={{ color: '#0369A1', fontSize: '0.9rem' }}>किल्ले सिंधुदुर्ग व आरमार</strong>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>मायनाक भंडारी, जलदुर्ग, नारळी पौर्णिमा</div>
              </div>

              <div
                onClick={() => setSelectedConnectedNode(CONNECTED_NODES_DATA.shivaji_maharaj)}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #C2410C',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>👑</div>
                <strong style={{ color: '#C2410C', fontSize: '0.9rem' }}>छत्रपती शिवाजी महाराज</strong>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>स्वराज्य, ३५०+ किल्ले, आरमार, संत व शेती</div>
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#78350F', fontStyle: 'italic' }}>
              💡 वरील कोणत्याही कार्डवर क्लिक करून खालील "Connect Everything" इंजिनमध्ये त्याचे संपूर्ण नातेसंबंध जाळे पहा.
            </div>
          </div>
        </section>

        {/* ================= FEATURE 48 & 30: "CONNECT EVERYTHING" KNOWLEDGE GRAPH ================= */}
        <section id="connect-everything" style={{
          background: '#FFFFFF',
          border: '2px solid #FED7AA',
          borderRadius: '18px',
          padding: '28px',
          marginBottom: '40px',
          boxShadow: '0 4px 16px rgba(234,88,12,0.06)'
        }}>
          <div style={{ marginBottom: '18px' }}>
            <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
              वैशिष्ट्य ४८ व ३० • THE CORE ENGINE: CONNECT EVERYTHING
            </span>
            <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
              🔗 कनेक्ट एव्हरीथिंग (Connect Everything Engine)
            </h2>
            <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
              उदा. रायगड उघडल्यास: रायगड → शिवराय → राज्याभिषेक → जिजाऊ → जगदीश्वर मंदिर → शिमगा उत्सव → भातशेती → रसद → कागदपत्रे.
            </p>
          </div>

          {/* Active Node Card with Connected Web */}
          <div style={{
            background: '#FFFDF9',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', borderBottom: '1.5px solid #FED7AA', paddingBottom: '12px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedConnectedNode.icon}</span>
              <div>
                <span style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800 }}>
                  {selectedConnectedNode.type}
                </span>
                <h3 style={{ fontSize: '1.6rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  {selectedConnectedNode.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#431407', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedConnectedNode.summary}
            </p>

            {/* Interconnected Matrix Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              
              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>👑 संबंधित व्यक्ती (Personalities)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {selectedConnectedNode.connections.persons.map((p, idx) => (
                    <span key={idx} style={{ background: '#FFF7ED', color: '#7C1D05', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase' }}>⚔️ ऐतिहासिक घटना (Events)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {selectedConnectedNode.connections.events.map((e, idx) => (
                    <span key={idx} style={{ background: '#FEF2F2', color: '#991B1B', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>🛕 मंदिरे व श्रद्धास्थाने (Temples)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {selectedConnectedNode.connections.temples.map((t, idx) => (
                    <span key={idx} style={{ background: '#FFFBEB', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>🌺 उत्सव व परंपरा (Festivals)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {selectedConnectedNode.connections.festivals.map((f, idx) => (
                    <span key={idx} style={{ background: '#F0FDF4', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>🍲 खाद्यसंस्कृती (Food)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {selectedConnectedNode.connections.food.map((fd, idx) => (
                    <span key={idx} style={{ background: '#FFF1F2', color: '#9F1239', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {fd}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase' }}>📜 ऐतिहासिक पुरावे व दस्तऐवज (Sources)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {selectedConnectedNode.connections.documents.map((d, idx) => (
                    <span key={idx} style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= 49 EXPANDED FEATURES HIGHLIGHT MATRIX ================= */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
              ४९ मुख्य दालने • THE 49 FEATURE TILES
            </span>
            <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
              महाराष्ट्राच्या समृद्धीचा सर्वांगीण ज्ञानकोश
            </h2>
            <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
              इतिहास, किल्ले, युद्धे, स्त्रियांचे कर्तृत्व, गावे, मंदिरे, वास्तू, पाणी व्यवस्थापन, पोवाडे व लोककला.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* 3. Fort Explorer 2.0 */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>🏰</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>३. फोर्ट एक्सप्लोरर २.०</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  इतिहास, भौगोलिक उंची, पाण्याचे टाके, वास्तुकला, दरवाजे, ट्रेक काठिण्यपातळी व ३६०° दृश्य.
                </p>
              </div>
              <Link to="/forts" style={{ marginTop: '12px', color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                किल्ले एक्सप्लोर करा →
              </Link>
            </div>

            {/* 4. Battle Explorer */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>⚔️</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>४. बॅटल एक्सप्लोरर (रणसंग्राम)</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  प्रतापगड, पावनखिंड, सिंहगड, साल्हेर, उंबरखिंड व पानिपत—तारीख, व्यूहरचना, नेतृत्व व परिणाम.
                </p>
              </div>
              <Link to="/history/battles" style={{ marginTop: '12px', color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                रणांगणे पाहा →
              </Link>
            </div>

            {/* 6. Women in Maharashtra History */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>👑</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>६. महाराष्ट्रातील वीरांगना</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  राजमाता जिजाऊ, महाराणी ताराबाई, अहिल्याबाई होळकर, येसूबाई, सावित्रीबाई फुले व संत कवयित्री.
                </p>
              </div>
              <Link to="/community/women-empowerment" style={{ marginTop: '12px', color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                कर्तृत्व गाथा वाचा →
              </Link>
            </div>

            {/* 7. Family Heritage */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>👨‍👩‍👧</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>७. फॅमिली हेरिटेज (कुटुंब वृक्ष)</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  आजोबा → आई-वडील → तुम्ही → मुले; मूळ गाव, पारंपरिक व्यवसाय, जुने फोटो व कौटुंबिक इतिहास जतन.
                </p>
              </div>
              <button onClick={() => setShowFamilyTreeModal(true)} style={{ marginTop: '12px', background: 'none', border: 'none', padding: 0, color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                कुटुंब वृक्ष सुरू करा →
              </button>
            </div>

            {/* 8. Village Encyclopedia */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>🏡</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>८. गाव ज्ञानकोश ("माझे गाव")</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  महाराष्ट्रातील ४३,०००+ गावांचे स्वतंत्र पान: जुने नाव, ग्रामदैवत, जत्रा, पारंपरिक व्यवसाय व इतिहास.
                </p>
              </div>
              <button onClick={() => setShowVillageModal(true)} style={{ marginTop: '12px', background: 'none', border: 'none', padding: 0, color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                माझे गाव शोधा →
              </button>
            </div>

            {/* 17. Maharashtra Water Heritage */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>💧</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>१७. जलव्यवस्थापन वारसा</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  पाऊस → पाणलोट → दगडी टाके → खडक गाळण → वितरण; सह्याद्रीतील गडांवर पाण्याचे स्वयंपूर्ण विज्ञान.
                </p>
              </div>
              <Link to="/culture/heritage-map" style={{ marginTop: '12px', color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                जलव्यवस्थापन पाहा →
              </Link>
            </div>

            {/* 18. Wada Architecture */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>🏘️</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>१८. वाडा वास्तुकला दालन</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  चौक, दिंडी दरवाजा, लाकडी खांब, नगारखाना, देवघर, स्वयंपाकघर व गुप्त तळघरे यांची रचना.
                </p>
              </div>
              <Link to="/culture" style={{ marginTop: '12px', color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                वाडे वास्तुकला पाहा →
              </Link>
            </div>

            {/* 22. Powada Archive */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '2rem' }}>🎤</span>
                <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '8px 0 4px' }}>२२. पोवाडा अभिलेखागार</h4>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  शाहीर अज्ञानदास, तुळशीदास, राम जोशी, शाहीर अमर शेख; काव्यात्मक परंपरा वि. ऐतिहासिक तथ्ये.
                </p>
              </div>
              <Link to="/culture/gramdevat-jatra" style={{ marginTop: '12px', color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                पोवाडे ऐका व वाचा →
              </Link>
            </div>

          </div>
        </section>

      </div>

      {/* ================= MODAL: DIGITAL HERITAGE PASSPORT ================= */}
      {showPassportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '650px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '2px solid #FED7AA',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPassportModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>🪪</span>
              <div>
                <span style={{ fontSize: '0.78rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  अधिकृत सदस्य वारसा पासपोर्ट
                </span>
                <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, margin: '2px 0 0' }}>
                  महाराष्ट्र वारसा पासपोर्ट (Heritage Passport)
                </h3>
              </div>
            </div>

            <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: '#78350F' }}>सदस्य दर्जा: <strong>{passportStats.level}</strong></span>
                <span style={{ fontSize: '1.1rem', color: '#C2410C', fontWeight: 800 }}>{passportStats.points} गुण (XP)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7C1D05' }}>{passportStats.fortsVisited}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>किल्ले भेट</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#D97706' }}>{passportStats.templesVisited}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>मंदिरे दर्शन</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803D' }}>{passportStats.quizzesCompleted}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>क्विझ पूर्ण</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7C1D05', textTransform: 'uppercase' }}>
                प्राप्त झालेले डिजिटल सन्मान बॅजेस:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {passportStats.badges.map((b, idx) => (
                  <span key={idx} style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                    🏅 {b}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setPassportStats(prev => ({ ...prev, points: prev.points + 50, fortsVisited: prev.fortsVisited + 1 }));
                  alert('अभिनंदन! वारसा स्थळ चेक-इन यशस्वी! +५० गुण जोडले गेले.');
                }}
                style={{ flex: 1, background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                📍 सध्याच्या वारसा स्थळावर चेक-इन करा (+५० गुण)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HERITAGE EMERGENCY ================= */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '2px solid #FCA5A5',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowEmergencyModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>🚨</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#991B1B', fontWeight: 800, margin: 0 }}>
                  वारसा संवर्धन आणीबाणी (Heritage Emergency Alert)
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>धोक्यात आलेली मंदिरे, वाडे किंवा लोप पावणारी कला नोंदवा</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
              आपल्या परिसरातील एखाद्या ऐतिहासिक वास्तूची पडझड होत असल्यास, दुर्मीळ हस्तलिखित नष्ट होण्याचा धोका असल्यास, किंवा एखादी पारंपरिक हस्तकला लोप पावत असल्यास येथे सप्रमाण नोंद करा. ॲडमिन पडताळणीनंतर अधिकृत पावले उचलली जातील.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <input type="text" placeholder="वारसा स्थळाचे किंवा कलेचे नाव..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }} />
              <input type="text" placeholder="जिल्हा, तालुका व अचूक ठिकाण..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }} />
              <textarea placeholder="समस्येचे सविस्तर वर्णन (उदा. तटबंदी खचणे, चोरीची भीती, उपेक्षा)..." rows={3} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', resize: 'none' }} />
            </div>

            <button
              onClick={() => {
                alert('धन्यवाद! आपली नोंद यशस्वीरीत्या नोंदवली गेली असून पडताळणीसाठी पाठवण्यात आली आहे.');
                setShowEmergencyModal(false);
              }}
              style={{ width: '100%', background: '#B91C1C', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              आणीबाणी अलर्ट पाठवा 📢
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: FAMILY HERITAGE BUILDER ================= */}
      {showFamilyTreeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '650px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '2px solid #FED7AA',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowFamilyTreeModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>👨‍👩‍👧</span>
              <div>
                <span style={{ fontSize: '0.78rem', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  खाजगी व सुरक्षित (Private by Default)
                </span>
                <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: '2px 0 0' }}>
                  माझा कौटुंबिक इतिहास व वंशावळ (Family Heritage)
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
              आपले मूळ गाव, आजोबा-पणजोबांची नावे, जुने व्यवसाय, जुनी छायाचित्रे आणि कौटुंबिक कथा येथे सुरक्षितपणे जतन करा.
            </p>

            <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}>
                  👴 <strong>आजोबा / आजी:</strong> मूळ गाव, वास्तव्य व जुनी स्मृती
                </div>
                <div style={{ textAlign: 'center', color: '#F59E0B' }}>↓</div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}>
                  👨 <strong>आई - वडील:</strong> शिक्षण, व्यवसाय व स्थलांतर कथा
                </div>
                <div style={{ textAlign: 'center', color: '#F59E0B' }}>↓</div>
                <div style={{ background: '#FFF7ED', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C2410C', fontSize: '0.85rem', fontWeight: 700 }}>
                  👤 <strong>तुम्ही व भावंडे:</strong> वर्तमान योगदान व डिजिटल प्रोफाइल
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert('कौटुंबिक माहिती ड्राफ्ट स्वरूपात सेव्ह झाली!');
                setShowFamilyTreeModal(false);
              }}
              style={{ width: '100%', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              माझा कुटुंब इतिहास जतन करा 💾
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: VILLAGE ENCYCLOPEDIA SEARCH ================= */}
      {showVillageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '650px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '2px solid #FED7AA',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowVillageModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>🏡</span>
              <div>
                <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                  गाव ज्ञानकोश — "माझे गाव" (Village Encyclopedia)
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>महाराष्ट्रातील ४३,०००+ गावांचे वारसा दालन</span>
              </div>
            </div>

            <input
              type="text"
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              placeholder="गावाचे नाव किंवा तालुका शोधा (उदा. पाचाड, आंगणेवाडी, नेवासे, जेजुरी)..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #FED7AA', fontSize: '0.95rem', outline: 'none', marginBottom: '16px' }}
            />

            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#7C1D05' }}>पाचाड (ता. महाड, जि. रायगड)</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6B7280' }}>रायगड पायथ्याचे गाव, राजमाता जिजाऊ समाधी स्मारक व कोट.</p>
              </div>
              <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#7C1D05' }}>आंगणेवाडी (ता. मालवण, जि. सिंधुदुर्ग)</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6B7280' }}>श्री भराडीदेवी प्रसिद्ध वार्षिक जत्रा, लाखो भाविकांचे श्रद्धास्थान.</p>
              </div>
              <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#7C1D05' }}>नेवासे (जि. अहिल्यानगर/अहमदनगर)</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6B7280' }}>संत ज्ञानेश्वर महाराजांनी पैस खांबाला टेकून ज्ञानेश्वरी सांगितली ती पवित्र भूमी.</p>
              </div>
            </div>

            <button
              onClick={() => {
                alert('गावाची माहिती सबमिशन फॉर्म लवकरच उघडत आहे!');
                setShowVillageModal(false);
              }}
              style={{ width: '100%', background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              माझ्या गावाची माहिती / जुने फोटो जोडा ✍️
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
