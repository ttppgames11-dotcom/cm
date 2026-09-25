import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// CONNECT MARATHA — DIGITAL MAHARASHTRA CIVILIZATION OPERATING SYSTEM
// 70 COMPREHENSIVE FEATURES • 12 CIVILIZATION WORLDS • UNBROKEN KNOWLEDGE CHAIN:
// Maharashtra → Region → District → Taluka → Village/City → Place → Person
// → Event → Tradition → Festival → Food → Language → Art → Literature → Community → Source
// ============================================================================

// 12 MAJOR CIVILIZATION WORLDS (Feature 70 Matrix)
const CIVILIZATION_WORLDS = [
  { id: 'graph', name: 'ज्ञानजाळे व कालपट', icon: '🧬', count: 'Features 1–4', desc: 'Civilization Graph, What Was Here Before?, City Explorer, Old Cities' },
  { id: 'heritage', name: 'वारसा जतन व दस्तऐवज', icon: '🏚️', count: 'Features 5–8', desc: 'Vanishing Maharashtra, Heritage Home, Old Documents, Modi Reader' },
  { id: 'numismatics', name: 'नाणी, शिलालेख व लेणी', icon: '🪙', count: 'Features 9–13', desc: 'Coins, Inscriptions, Rock Caves, Archaeology, Trade Routes' },
  { id: 'military', name: 'आरमार, गडकोट व युद्धनीती', icon: '⚓', count: 'Features 14–20', desc: 'Maritime, Cavalry, Armour Museum, Fort Simulator, Strategy Game' },
  { id: 'historiography', name: 'इतिहास संशोधन व पुरावे', icon: '⚖️', count: 'Features 21–25', desc: 'Historical Mystery, Find Source, Disputed Views, Data, Geography' },
  { id: 'nature', name: 'सह्याद्री, नद्या व देवराई', icon: '⛰️', count: 'Features 26–30', desc: 'Sahyadri, Sacred Nature, Wildlife, Sacred Groves, River Civilization' },
  { id: 'spirituality', name: 'वारी, तीर्थक्षेत्र व सण', icon: '🥁', count: 'Features 31–33', desc: 'Pilgrimage Network, Wari Live Mode, Festival Calendar Engine' },
  { id: 'daily_life', name: 'दैनंदिन जीवन, वस्त्र व खाद्य', icon: '👨‍👩‍👧', count: 'Features 34–39', desc: 'How People Lived, Day in History, Fashion, Food, Education, Firsts' },
  { id: 'industry', name: 'उद्योग, रेल्वे व वर्तमानपत्रे', icon: '🚂', count: 'Features 40–46', desc: 'Industrial History, Railway, Mill Heritage, Newspapers, Audio/Video' },
  { id: 'research', name: 'संशोधक व डिजिटल ग्रंथ', icon: '🧑‍🔬', count: 'Features 47–53', desc: 'Ask Historian, Expert Profiles, Research Notebook, Digital Book, AI Doc' },
  { id: 'platform', name: 'ओपन API व अचूकता इंजिन', icon: '🛡️', count: 'Features 54–58', desc: 'Open Heritage API, Standards, Accuracy Engine, Context Finder, Graph' },
  { id: 'tourism', name: 'ट्रेकिंग, सुरक्षा व समुदाय', icon: '📱', count: 'Features 59–69', desc: 'QR Heritage, Audio Tours, Offline Trek, Safety, Awards, Marketplace' }
];

// CITIES DATA (Feature 3 & 4)
const MAHA_CITIES = [
  {
    id: 'pune',
    name: 'पुणे (पुण्यनगरी / Punawadi)',
    oldNames: 'पुन्नक विषय (इ.स. ७५८), कसबे पुणे, पेशवे राजधानी',
    eras: {
      today: 'भारताची आयटी, ऑटोमोबाईल व शैक्षणिक राजधानी (विद्येचे माहेरघर).',
      british: 'खडकी लष्करी छावणी, पूना पॅक्ट, फर्ग्युसन कॉलेज, डेक्कन जिमखाना (१८१८-१९४७).',
      peshwa: 'शनिवारवाडा, कात्रज पाण्याचा नळ, १७ पेठांची उभारणी, बाजीराव पेशवे (१७२०-१८१८).',
      maratha: 'लाल महाल, कसबा गणपती जिजाऊंनी स्थापन केला, दादोजी कोंडदेव (१६३०-१६८०).',
      earlier: 'राष्ट्रकूट राजवट (पुन्नक विषय), यादव काळ व पुणेश्वर-केदारेश्वर मंदिरे.'
    },
    architecture: 'शनिवारवाडा, विश्रामबाग वाडा, ओंकारेश्वर मंदिर, चतुःशृंगी',
    food: 'पुणेरी मिसळ, बाकरवडी, सुजाता मस्तानी, आंबा बर्फी',
    industry: 'माहिती तंत्रज्ञान (Hinjawadi), ऑटोमोबाईल (Tata, Bajaj), शिक्षण'
  },
  {
    id: 'mumbai',
    name: 'मुंबई (बॉम्बे / Mumbai)',
    oldNames: 'मुंबादेवी बेट, हेप्टानेशिया (टॉलेमीची सात बेटे)',
    eras: {
      today: 'भारताची आर्थिक राजधानी, आंतरराष्ट्रीय बंदर, बॉलिवूड व तंत्रज्ञान केंद्र.',
      british: 'सात बेटांचे एकत्रीकरण (हॉर्नबी व्हेलार्ड), व्हिक्टोरिया टर्मिनस (CST), फोर्ट परिसर.',
      peshwa: 'मराठा आरमाराचे कल्याण-वसई मोहीम, चिमाजी अप्पांचा वसई विजय (१७३९).',
      maratha: 'छत्रपती शिवाजी महाराजांची खांदेरी-उंदेरी मोहीम, इंग्रजांशी मुत्सद्दी तह.',
      earlier: 'शिलाहार राजवट, वाळकेश्वर बाणगंगा, घारापुरी (एलिफंटा लेणी इ.स. ६००).'
    },
    architecture: 'गेटवे ऑफ इंडिया, छत्रपती शिवाजी महाराज टर्मिनस, मुंबादेवी मंदिर, राजाबाई टॉवर',
    food: 'वडापाव, बॉम्बे सँडविच, उसळ-पाव, पावभाजी',
    industry: 'बँकिंग, वित्त (BSE/NSE), कापड गिरण्यांचा इतिहास, चित्रपट'
  },
  {
    id: 'chhatrapati_sambhajinagar',
    name: 'छत्रपती संभाजीनगर (औरंगाबाद / खडकी)',
    oldNames: 'राजतडाग, खडकी (मलिक अंबर १६१०), औरंगाबाद, छत्रपती संभाजीनगर',
    eras: {
      today: 'महाराष्ट्राची पर्यटन राजधानी, ऑटो हब, फार्मास्युटिकल व शैक्षणिक केंद्र.',
      british: 'निझाम-ब्रिटिश छावणी, मराठवाडा मुक्ती संग्राम लढा (१९४८).',
      peshwa: 'मराठ्यांचा मराठवाड्यातील प्रभाव, शिंदेशाही व होळकरांच्या मोहिमा.',
      maratha: 'छत्रपती संभाजी महाराजांचे मराठवाड्यातील पराक्रम, हंबीरराव मोहिते यांची गस्त.',
      earlier: 'सातवाहन काळ, वाकाटक, यादव देवगिरी राजधानी (११८०-१३१७), वेरूळ कैलास.'
    },
    architecture: 'देवगिरी (दौलताबाद) किल्ला, वेरूळ लेणी, बीबी का मकबरा, नहरे अंबरी जलप्रणाली',
    food: 'नानखलिया, मांडे, दाल बट्टी, सीताफळ रबडी',
    industry: 'पर्यटन, हिमरू व पैठणी विणकाम, ऑटोमोबाईल'
  },
  {
    id: 'kolhapur',
    name: 'कोल्हापूर (करवीर / Dakshin Kashi)',
    oldNames: 'करवीर पीठ, कोल्लापूर (शिलाहार राजधानी)',
    eras: {
      today: 'कुस्तीची पंढरी, साखर उद्योग, चित्रपटनिर्मिती व धार्मिक पर्यटन केंद्र.',
      british: 'राजर्षी छत्रपती शाहू महाराजांचे सामाजिक क्रांती युग (आरक्षण १८०२, मोफत शिक्षण).',
      peshwa: 'करवीर छत्रपती घराणे, महाराणी ताराबाईंची राजधानी (१७१०).',
      maratha: 'छत्रपती शिवरायांचा पन्हाळा वेढा, बाजीप्रभूंचा पावनखिंड लढा (१६६०).',
      earlier: 'शिलाहार राजवट, महालक्ष्मी (अंबाबाई) मंदिर निर्माण (इ.स. ७००), ब्रह्मपुरी उत्खनन.'
    },
    architecture: 'न्यू पॅलेस, अंबाबाई मंदिर, रंकाळा तलाव, भवानी मंडप, पन्हाळा गड',
    food: 'तांबडा-पांढरा रस्सा, कोल्हापुरी मिसळ, भडंग, गूळ',
    industry: 'साखर कारखाने, फाउंड्री व अभियांत्रिकी, कोल्हापुरी चप्पल'
  },
  {
    id: 'nagpur',
    name: 'नागपूर (विदर्भाची राजधानी / Orange City)',
    oldNames: 'नाग नदी काठची वस्ती, गोंड राजधानी (भक्त बुलंद शाह १७०२)',
    eras: {
      today: 'महाराष्ट्राची उपराजधानी, भारताचा झिरो माईल केंद्रबिंदू, मेट्रो व लॉजिस्टिक हब.',
      british: 'सेंट्रल प्रॉव्हिन्स आणि बेरारची राजधानी, सीताबर्डीची लढाई (१८१७).',
      peshwa: 'रघुजी भोसले प्रथम यांचे नागपूरकर भोसले साम्राज्य (कटक, बंगालपर्यंत विस्तार).',
      maratha: 'विदर्भातील मराठा जहागिरी, गोंड राजांशी मैत्री व संरक्षण संबंध.',
      earlier: 'वाकाटक राजवट (नंदीवर्धन रामटेक), मौर्य अवशेष (मनसर उत्खनन).'
    },
    architecture: 'दीक्षाभूमी, रामटेक गडमंदिर, सीताबर्डी किल्ला, कस्तुरचंद पार्क',
    food: 'सावजी मटण/चिकन, पोहे-तर्री, संत्रा बर्फी, पाटवडी रस्सा',
    industry: 'लॉजिस्टिक, संत्रा प्रक्रिया, कापूस जिनिंग, MIHAN SEZ'
  },
  {
    id: 'nashik',
    name: 'नाशिक (पंचवटी / कुंभमेळा नगरी)',
    oldNames: 'पद्मनगरी, जनस्थान (रामायण), नासिक्य (पतंजली महाभाष्य)',
    eras: {
      today: 'भारताची वाइन कॅपिटल, कृषी निर्यात केंद्र, धार्मिक तीर्थ व डिफेन्स हब.',
      british: 'क्रांतिकारी अभिनव भारत संघटना (स्वातंत्र्यवीर सावरकर), तोफखाना केंद्र (देवळाली).',
      peshwa: 'गोदावरी काठावरील घाट, काळाराम मंदिर निर्माण, पेशव्यांचे सुभेदार.',
      maratha: 'साल्हेर-मुल्हेर लढाया (१६७२), त्र्यंबकेश्वर व बागलाणवर शिवशाही वर्चस्व.',
      earlier: 'सातवाहन काळ (पांडवलेणी शिलालेख), यादव काळ, राम-सीता-लक्ष्मण पंचवटी.'
    },
    architecture: 'काळाराम मंदिर, त्र्यंबकेश्वर ज्योतिर्लिंग, पांडवलेणी, सुंदरनारायण मंदिर',
    food: 'मिसळ पाव (तुकडा/तर्री), द्राक्षे, चिवडा, खांदेशी वांग्याचे भरीत',
    industry: 'द्राक्ष व वाइनरी, HAL ओझर (लढाऊ विमाने), करन्सी नोट प्रेस'
  }
];

// FEATURE 9: COINS & CURRENCY DATABASE
const COINS_DATA = [
  {
    name: 'सातवाहन पोटिन नाणे (Satavahana Coin)',
    period: 'इ.स.पूर्व १०० - इ.स. १००',
    metal: 'पोटिन / शिसे (Lead alloy)',
    ruler: 'गौतमीपुत्र सातकर्णी / वसिष्ठीपुत्र',
    front: 'हत्ती / सिंह आणि ब्राह्मी लिपीत राजाचे नाव',
    back: 'उज्जैन चिन्ह (चार वर्तुळांचे चक्र) व चैत्य प्रतीक',
    source: 'महाराष्ट्र राज्य पुरातत्व संग्रहालय व नाणेघाट शोध'
  },
  {
    name: 'यादव सुवर्ण गद्याण (Yadava Gold Gadyana)',
    period: 'इ.स. ११८० - १३१०',
    metal: 'शुद्ध सोने (Gold)',
    ruler: 'सिंघणदेव यादव (देवगिरी)',
    front: 'गरुड मुद्रा अथवा शंख-चक्र-गदा-पद्म',
    back: 'नागरी लिपीत श्री सिंघणदेव असा स्पष्ट शिक्का',
    source: 'देवगिरी किल्ला उत्खनन व ब्रिटिश म्युझियम'
  },
  {
    name: 'शिवराई नाणे (Chhatrapati Shivaji Maharaj Shivrai)',
    period: 'इ.स. १६७४ - १८१८',
    metal: 'तांबे (Copper)',
    ruler: 'छत्रपती शिवाजी महाराज (६ जून १६७४ राज्याभिषेक)',
    front: 'नागरी लिपीत तीन ओळींमध्ये: "श्री / राजा / शिव"',
    back: 'नागरी लिपीत दोन ओळींमध्ये: "छत्र / पती"',
    source: 'किल्ले रायगड संग्रहालय व पेशवे दफ्तर'
  },
  {
    name: 'शिवकालीन सुवर्ण होन (Shivrai Hon)',
    period: 'इ.स. १६७४ - १६८०',
    metal: 'शुद्ध सोने (Gold - सुमारे २.८ ग्रॅम)',
    ruler: 'छत्रपती शिवाजी महाराज',
    front: 'देवनागरी अक्षरे: "श्री राजा शिव"',
    back: 'देवनागरी अक्षरे: "छत्रपती"',
    source: 'छत्रपती शिवाजी महाराज वस्तुसंग्रहालय (CSMVS), मुंबई'
  }
];

// FEATURE 10: HISTORIC INSCRIPTIONS
const INSCRIPTIONS_DATA = [
  {
    name: 'नाणेघाट शिलालेख (Naneghat Inscription)',
    location: 'नाणेघाट खिंड, जुन्नर (पुणे-ठाणे सीमा)',
    script: 'प्राचीन ब्राह्मी लिपी',
    lang: 'महाराष्ट्री प्राकृत',
    period: 'इ.स.पूर्व पहिले शतक (सातवाहन)',
    desc: 'राणी नागनिका यांनी कोरलेला शिलालेख. सातवाहन साम्राज्यातील यज्ञ, दानधर्म आणि जगातील सर्वांत प्राचीन अंकांचे (१, २, ४, ६, ७, ९) कोरीव पुरावे.',
    evidence: '🟢 प्रत्यक्ष कातळात कोरलेला मूळ पुरावा (Archaeological In-situ)'
  },
  {
    name: 'कार्ले लेणी शिलालेख (Karla Caves Inscription)',
    location: 'कार्ले महाचैत्य, लोणावळा',
    script: 'ब्राह्मी लिपी',
    lang: 'प्राकृत',
    period: 'इ.स. पहिले शतक',
    desc: 'भारतातील सर्वात मोठ्या कातळ-खोदीव बौद्ध चैत्यगृहातील खांबांवर कोरलेले व्यापाऱ्यांचे व कारागिरांचे देणगी शिलालेख.',
    evidence: '🟢 भारतीय पुरातत्व सर्वेक्षण (ASI) प्रमाणित'
  },
  {
    name: 'रायगड जगदीश्वर शिलालेख (Raigad Inscription)',
    location: 'श्री जगदीश्वर मंदिर, किल्ले रायगड पायरी',
    script: 'देवनागरी लिपी',
    lang: 'संस्कृत / जुनी मराठी',
    period: 'इ.स. १६७४ (राज्याभिषेक काळ)',
    desc: 'मुख्य स्थापत्यकार हिरोजी इंदुलकर यांनी नम्रतेने कोरलेली ओळ: "सेवेचे ठायी तत्पर हिरोजी इंदुलकर". गडावरील वास्तुरचनेचा ऐतिहासिक दस्तऐवज.',
    evidence: '🟢 शिवकालीन समकालीन दगडी शिलालेख'
  }
];

// FEATURE 16: ARMS & ARMOUR DATA
const WEAPONS_DATA = [
  {
    name: 'दांडपट्टा (Dandpatta / Gauntlet Sword)',
    period: '१६ वे ते १८ वे शतक (मराठा सैन्य)',
    design: 'हातात लोखंडी पंजासारखे कवच घालून ३ ते ४ फूट लांब लवचिक पोलादी पात्याची तलवार.',
    use: 'घोडदळाविरुद्ध पायदळाचे आत्मरक्षण; चारी बाजूंना फिरवून एका वेळी अनेक शत्रूंचा संहार.',
    fame: 'तानाजी मालुसरे, बाजीप्रभू देशपांडे व शिवकालीन मावळ्यांचे आवडते शस्त्र.'
  },
  {
    name: 'वाघनखे (Wagh Nakh / Tiger Claws)',
    period: 'शिवकाल (१६५९ प्रतापगड युद्ध)',
    design: 'हाताच्या मुठीत सहज लपवता येणारी चार तीक्ष्ण वाकडी लोखंडी नखे आणि बोटांमध्ये अडकवायच्या दोन अंगठ्या.',
    use: 'अनपेक्षित हल्ल्यात शत्रूचा कोथळा बाहेर काढण्यासाठी गुप्त शस्त्र.',
    fame: '१० नोव्हेंबर १६५९ रोजी अफझलखानाने कपटी आलिंगन देताच शिवरायांनी याच वाघनख्यांनी त्याचा खात्मा केला.'
  },
  {
    name: 'फिरंगी तलवार (Firangi Straight Sword)',
    period: '१७ वे शतक',
    design: 'पोर्तुगीज किंवा युरोपीय बनावटीचे थेट सपाट पाते, ज्यावर मराठ्यांनी स्वतःची स्थानिक मुठ (Khanda Hilt) बसवली.',
    use: 'घोडदळाच्या वेगवान हल्ल्यात समोरासमोर जबरदस्त वार करण्यासाठी वापर.',
    fame: 'छत्रपती शिवाजी महाराजांच्या पवित्र "भवानी" व "जगदंबा" तलवारी याच धाटणीच्या होत्या.'
  }
];

// FEATURE 30: RIVER CIVILIZATION DATA
const RIVERS_DATA = [
  {
    name: 'गोदावरी (दक्षिण गंगा)',
    origin: 'ब्रह्मगिरी, त्र्यंबकेश्वर (नाशिक)',
    course: 'नाशिक → कोपरगाव → पैठण → नांदेड → तेलंगणा/आंध्र प्रदेश → बंगालचा उपसागर',
    significance: 'महाराष्ट्राची जीवनवाहिनी. काठावर सातवाहनांची पैठण राजधानी, संत ज्ञानेश्वरांचे नेवासे, संत एकनाथांचे पैठण, गुरु गोबिंद सिंग यांचे नांदेड सचखंड गुरुद्वारा.',
    crops: 'ऊस, द्राक्षे, कांदा, बाजरी'
  },
  {
    name: 'कृष्णा नदी',
    origin: 'महाबळेश्वर (सातारा)',
    course: 'महाबळेश्वर → वाई → सातारा → सांगली → कोल्हापूर सीमा → कर्नाटक',
    significance: 'पश्चिम महाराष्ट्राची जलसंस्कृती. वाईचे ऐतिहासिक घाट व गणपती मंदिर, सांगलीची हळद व शेती, नरसोबाची वाडी दत्त पीठ.',
    crops: 'ऊस, हळद, केळी, तांदूळ'
  },
  {
    name: 'भीमा (चंद्रभागा)',
    origin: 'भीमाशंकर ज्योतिर्लिंग (पुणे)',
    course: 'भीमाशंकर → खेड → दौंड → पंढरपूर (येथे चंद्रकोरीसारखी वळते म्हणून चंद्रभागा) → कृष्णा संगम',
    significance: 'वारकरी संप्रदायाचे पवित्र तीर्थ. पंढरपूरचे विठ्ठल मंदिर, संत तुकाराम व संतांचे अभंग आणि आषाढी-कार्तिकी महावारी.',
    crops: 'ज्वारी, डाळिंब, ऊस'
  }
];

export default function ConnectMarathaUniversePage() {
  const [activeTab, setActiveTab] = useState('graph');
  const [selectedCity, setSelectedCity] = useState(MAHA_CITIES[0]);
  const [selectedCityEra, setSelectedCityEra] = useState('peshwa');
  const [selectedCoin, setSelectedCoin] = useState(COINS_DATA[2]);
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS_DATA[0]);
  const [selectedRiver, setSelectedRiver] = useState(RIVERS_DATA[0]);
  const [learningMode, setLearningMode] = useState('detailed'); // 'simple' | 'detailed' | 'research'
  const [language, setLanguage] = useState('mr'); // 'mr' | 'en'

  // Modals & Interactive Tools
  const [showDocScannerModal, setShowDocScannerModal] = useState(false);
  const [showHeritageHomeModal, setShowHeritageHomeModal] = useState(false);
  const [showFortSimModal, setShowFortSimModal] = useState(false);
  const [showMysteryModal, setShowMysteryModal] = useState(false);
  const [showAskHistorianModal, setShowAskHistorianModal] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const [showAudioTourModal, setShowAudioTourModal] = useState(false);

  // Fort Construction Simulator Game State (Feature 17 & 18)
  const [fortSimState, setFortSimState] = useState({
    mountain: 'सह्याद्री सुळका (दुर्गम कातळ)',
    water: 'पाषाणातील नैसर्गिक टाक्या (बारामाही)',
    bastion: 'दुहेरी बुरुज व गोमुखी दरवाजा',
    storage: 'तळघरातील गुप्त धान्य कोठार',
    score: 95,
    siegeDays: 365,
    feedback: 'उत्कृष्ट योजना! गोमुखी दरवाजा व पाषाण टाक्यांमुळे किल्ला १ वर्षाहून अधिक काळ शत्रूच्या वेढ्यात अजिंक्य राहील.'
  });

  // Historical Mystery Clue Game State (Feature 21)
  const [mysteryAnswer, setMysteryAnswer] = useState(null);

  // Search filter
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9', color: '#431407', fontFamily: 'inherit' }}>

      {/* ========================================================================= */}
      {/* 1. MEGA HERO HEADER: CONNECT MARATHA CIVILIZATION OPERATING SYSTEM        */}
      {/* ========================================================================= */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 40%, #C2410C 75%, #EA580C 100%)',
        color: '#FFFFFF',
        padding: '38px 20px 30px',
        borderBottom: '4px solid #F59E0B',
        boxShadow: '0 8px 24px rgba(124, 29, 5, 0.3)'
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          {/* Top Bar: Breadcrumb + Language + 3 Learning Modes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.9 }}>
              <Link to="/" style={{ color: '#FDE68A', textDecoration: 'none' }}>मुख्यपृष्ठ</Link>
              <span>/</span>
              <span>महाराष्ट्र संस्कृती व सभ्यता महाज्ञानकोश (Civilization OS)</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Language Switcher */}
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLanguage('mr')}
                  style={{ background: language === 'mr' ? '#FFFFFF' : 'transparent', color: language === 'mr' ? '#7C1D05' : '#FFFFFF', border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  style={{ background: language === 'en' ? '#FFFFFF' : 'transparent', color: language === 'en' ? '#7C1D05' : '#FFFFFF', border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  English
                </button>
              </div>

              {/* 3 Learning Modes: Feature 31 */}
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLearningMode('simple')}
                  style={{ background: learningMode === 'simple' ? '#86EFAC' : 'transparent', color: learningMode === 'simple' ? '#14532D' : '#FFFFFF', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  title="Explain Like I'm 10 (बालमित्र सोपे स्वरूप)"
                >
                  🟢 १० वर्षे सोपे
                </button>
                <button
                  onClick={() => setLearningMode('detailed')}
                  style={{ background: learningMode === 'detailed' ? '#FED7AA' : 'transparent', color: learningMode === 'detailed' ? '#7C1D05' : '#FFFFFF', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  title="Detailed Mode (सामान्य वाचक)"
                >
                  🔵 सविस्तर
                </button>
                <button
                  onClick={() => setLearningMode('research')}
                  style={{ background: learningMode === 'research' ? '#D8B4FE' : 'transparent', color: learningMode === 'research' ? '#581C87' : '#FFFFFF', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  title="Research Mode (संशोधक व पुरावे)"
                >
                  🟣 संशोधन मोड
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.84rem', marginBottom: '10px' }}>
            <span>🌐 CONNECT MARATHA CIVILIZATION OPERATING SYSTEM</span>
            <span>•</span>
            <span>७० एकात्मिक वैशिष्ट्ये • १२ सभ्यता विश्वे • अखंड ज्ञानसाखळी</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.2 }}>
            {language === 'mr' ? 'Connect Maratha — संपूर्ण महाराष्ट्र महाविश्व' : 'Connect Maratha — Maharashtra Civilization OS'}
          </h1>

          <p style={{ fontSize: '1.05rem', maxWidth: '1000px', opacity: 0.95, lineHeight: 1.6, marginBottom: '18px' }}>
            {language === 'mr'
              ? 'महाराष्ट्र: राज्य → विभाग → जिल्हा → तालुका → गाव/शहर → स्थळ → व्यक्ती → ऐतिहासिक घटना → परंपरा → सण → खाद्य → भाषा → कला → साहित्य → समुदाय → आधुनिक जीवन → मूळ दस्तऐवजी पुरावे!'
              : 'Maharashtra: State → Region → District → Taluka → Village/City → Place → Person → Event → Tradition → Festival → Food → Language → Art → Literature → Community → Modern Life → Verified Source!'}
          </p>

          {/* Quick Action Matrix (Features 6, 7, 17, 21, 47, 54, 60) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button onClick={() => setShowFortSimModal(true)} style={{ background: '#FFFFFF', color: '#7C1D05', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🧱 गडकोट निर्माण सिम्युलेटर
            </button>
            <button onClick={() => setShowDocScannerModal(true)} style={{ background: '#FEF3C7', color: '#92400E', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              📜 जुनी मोडी/मराठी वाचक
            </button>
            <button onClick={() => setShowHeritageHomeModal(true)} style={{ background: '#DCFCE7', color: '#166534', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🏠 हेरिटेज होम नोंदणी
            </button>
            <button onClick={() => setShowMysteryModal(true)} style={{ background: '#F3E8FF', color: '#6B21A8', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🧠 ऐतिहासिक गूढ शोधक
            </button>
            <button onClick={() => setShowAudioTourModal(true)} style={{ background: '#E0F2FE', color: '#0369A1', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🎧 ऑडिओ वॉकिंग टूर
            </button>
            <button onClick={() => setShowAskHistorianModal(true)} style={{ background: '#FFE4E6', color: '#9F1239', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🧑‍🔬 इतिहासकारांना विचारा
            </button>
            <button onClick={() => setShowAPIModal(true)} style={{ background: 'rgba(255,255,255,0.22)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🧑‍💻 ओपन हेरिटेज API
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 70-FEATURE 12-WORLD NAVIGATION BAR                                 */}
      {/* ========================================================================= */}
      <div style={{ background: '#FFFFFF', borderBottom: '2px solid #FED7AA', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '8px 20px', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {CIVILIZATION_WORLDS.map(w => (
            <button
              key={w.id}
              onClick={() => setActiveTab(w.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: activeTab === w.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                background: activeTab === w.id ? '#7C1D05' : '#FFFDF9',
                color: activeTab === w.id ? '#FFFFFF' : '#431407',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{w.icon}</span>
              <span>{w.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE CONTAINER                                               */}
      {/* ========================================================================= */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '28px 20px' }}>

        {/* FACT VS TRADITION RATING BAR (Feature 56) */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #FED7AA',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.86rem', color: '#78350F', fontWeight: 700 }}>
            🛡️ ऐतिहासिक अचूकता निकष (Historical Accuracy Protocol):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>🟢 Verified Fact</span>
            <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>🔵 Interpretation</span>
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>🟡 Oral Tradition</span>
            <span style={{ background: '#FFFBEB', color: '#B45309', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>🟠 Needs Verification</span>
            <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>🔴 Rejected Claim</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WORLD 1: 🧬 CIVILIZATION GRAPH, CITIES & "WHAT WAS HERE BEFORE?"         */}
        {/* ========================================================================= */}
        {activeTab === 'graph' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            
            {/* Feature 1: Maharashtra Civilization Graph */}
            <div style={{ marginBottom: '24px', borderBottom: '1.5px solid #FED7AA', paddingBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य १ • MAHARASHTRA CIVILIZATION GRAPH
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 6px' }}>
                🧬 महाराष्ट्र सभ्यता ज्ञानजाळे (Civilization Relationship Engine)
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.92rem', margin: '0 0 14px' }}>
                उदा. संत तुकाराम → देहू → अभंग → वारी → पंढरपूर → वारकरी परंपरा → साहित्य → समकालीन सांस्कृतिक आचरण.
              </p>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #F59E0B', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                  <span style={{ background: '#7C1D05', color: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem' }}>संत तुकाराम महाराज</span>
                  <span style={{ color: '#C2410C', fontWeight: 900 }}>→</span>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>देहू (इंद्रायणी काठ)</span>
                  <span style={{ color: '#C2410C', fontWeight: 900 }}>→</span>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>तुकाराम गाथा (अभंग)</span>
                  <span style={{ color: '#C2410C', fontWeight: 900 }}>→</span>
                  <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>पंढरपूर वारी</span>
                  <span style={{ color: '#C2410C', fontWeight: 900 }}>→</span>
                  <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>वारकरी संप्रदाय</span>
                  <span style={{ color: '#C2410C', fontWeight: 900 }}>→</span>
                  <span style={{ background: '#FFF1F2', color: '#9F1239', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>भजन, कीर्तन व समकालीन जीवन</span>
                </div>
              </div>
            </div>

            {/* Feature 2, 3, 4: City History Explorer & "What Was Here Before?" */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                <div>
                  <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                    वैशिष्ट्य २, ३, ४ • CITY HISTORY & "WHAT WAS HERE BEFORE?"
                  </span>
                  <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, margin: '2px 0 0' }}>
                    🏙️ महाराष्ट्राची १८ शहरे व "येथे पूर्वी काय होते?" (City Time Layers)
                  </h3>
                </div>
              </div>

              {/* City Selector */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
                {MAHA_CITIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCity(c)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: selectedCity.id === c.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                      background: selectedCity.id === c.id ? '#7C1D05' : '#FFFDF9',
                      color: selectedCity.id === c.id ? '#FFFFFF' : '#431407',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {c.name.split('(')[0]}
                  </button>
                ))}
              </div>

              {/* City Card with Era Switcher */}
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#7C1D05' }}>{selectedCity.name}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#92400E' }}>प्राचीन/ऐतिहासिक नावे: {selectedCity.oldNames}</span>
                  </div>
                </div>

                {/* What Was Here Before: Era Slider Buttons */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px' }}>
                  {[
                    { id: 'today', label: '१. आज (Today)' },
                    { id: 'british', label: '२. ब्रिटिश काळ (British Period)' },
                    { id: 'peshwa', label: '३. पेशवे काळ (Peshwa Period)' },
                    { id: 'maratha', label: '४. शिवकाळ / मराठा सत्ता (Maratha Period)' },
                    { id: 'earlier', label: '५. प्राचीन काळ (Ancient / Earlier)' }
                  ].map(era => (
                    <button
                      key={era.id}
                      onClick={() => setSelectedCityEra(era.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: selectedCityEra === era.id ? '1.5px solid #C2410C' : '1px solid #D1D5DB',
                        background: selectedCityEra === era.id ? '#C2410C' : '#FFFFFF',
                        color: selectedCityEra === era.id ? '#FFFFFF' : '#4B5563'
                      }}
                    >
                      {era.label}
                    </button>
                  ))}
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA', marginBottom: '14px' }}>
                  <strong style={{ color: '#7C1D05', fontSize: '0.88rem' }}>या कालखंडातील शहराचे स्वरूप:</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.92rem', color: '#431407', lineHeight: 1.6 }}>
                    {selectedCity.eras[selectedCityEra]}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '0.84rem' }}>
                  <div style={{ background: '#FFF7ED', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                    <strong style={{ color: '#C2410C' }}>🏛️ प्रमुख ऐतिहासिक वास्तू:</strong>
                    <div style={{ marginTop: '2px', color: '#7C1D05' }}>{selectedCity.architecture}</div>
                  </div>
                  <div style={{ background: '#FFF1F2', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                    <strong style={{ color: '#BE123C' }}>🍲 पारंपरिक खाद्यविशेष:</strong>
                    <div style={{ marginTop: '2px', color: '#9F1239' }}>{selectedCity.food}</div>
                  </div>
                  <div style={{ background: '#F0FDFA', padding: '10px', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <strong style={{ color: '#0F766E' }}>🏭 उद्योग व आर्थिक विकास:</strong>
                    <div style={{ marginTop: '2px', color: '#115E59' }}>{selectedCity.industry}</div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 2: 🏚️ VANISHING MAHARASHTRA & OLD DOCUMENTS (FEATURES 5–8)        */}
        {/* ========================================================================= */}
        {activeTab === 'heritage' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ५, ६, ७, ८ • VANISHING MAHARASHTRA & DOCUMENT ARCHIVES
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 6px' }}>
                🏚️ लोप पावणारा महाराष्ट्र व जुनी मोडी/मराठी कागदपत्रे
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.92rem', margin: 0 }}>
                जुने वाडे, बारवा, नष्ट होणाऱ्या बोली व शेती औजारे जतन करण्याचा महाप्रकल्प; कौटुंबिक जुनी कागदपत्रे व मोडी लिपी वाचक.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🏚️</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1.15rem', color: '#7C1D05' }}>लोप पावणारा महाराष्ट्र (Vanishing Heritage)</h4>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  दगडी बारवा, लाकडी कोरीव काम, खळ्यातील दावणी, जाते, पाटा-वरवंटा, लुप्त होणाऱ्या म्हणी व पारंपरिक गाणी यांचे दस्तऐवजीकरण.
                </p>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🏠</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1.15rem', color: '#7C1D05' }}>डिजिटल हेरिटेज होम (Ancestral Home)</h4>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  आपले मूळ गावातील वडिलोपार्जित घर, खोल्या, लाकडी खांब, ओसरी व जुने फोटो डिजिटल स्वरूपात चिरंतन जतन करा.
                </p>
                <button onClick={() => setShowHeritageHomeModal(true)} style={{ marginTop: '10px', background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  घर नोंदवा ✍️
                </button>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>✍️</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1.15rem', color: '#7C1D05' }}>जुनी मोडी व मराठी वाचक (Document Reader)</h4>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  मूळ स्कॅन + समोरासमोर मराठी लिप्यंतरण + आधुनिक मराठी अर्थ; इतिहास संशोधक व विद्यार्थ्यांसाठी वरदान.
                </p>
                <button onClick={() => setShowDocScannerModal(true)} style={{ marginTop: '10px', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  कागदपत्र स्कॅनर उघडा 📜
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 3: 🪙 COINS, INSCRIPTIONS & ROCK CAVES (FEATURES 9–13)             */}
        {/* ========================================================================= */}
        {activeTab === 'numismatics' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#D97706', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ९, १०, ११, १२, १३ • NUMISMATICS, INSCRIPTIONS & ANCIENT CAVES
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 6px' }}>
                🪙 नाणी संग्रहालय, शिलालेख, अजिंठा-वेरूळ व प्राचीन व्यापार मार्ग
              </h2>
            </div>

            {/* Coins Carousel */}
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '14px', padding: '20px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#92400E', fontSize: '1.1rem' }}>🪙 नाणी व चलन संग्रहालय (Coin Museum):</strong>
                <span style={{ fontSize: '0.8rem', color: '#78350F' }}>नाणे निवडा</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '14px' }}>
                {COINS_DATA.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCoin(c)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      border: selectedCoin.name === c.name ? '2px solid #B45309' : '1px solid #FDE68A',
                      background: selectedCoin.name === c.name ? '#B45309' : '#FFFFFF',
                      color: selectedCoin.name === c.name ? '#FFFFFF' : '#92400E',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {c.name.split('(')[0]}
                  </button>
                ))}
              </div>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.2rem' }}>{selectedCoin.name}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
                  <div><strong>कालखंड:</strong> {selectedCoin.period}</div>
                  <div><strong>धातू:</strong> {selectedCoin.metal}</div>
                  <div><strong>राजा / सत्ताधीश:</strong> {selectedCoin.ruler}</div>
                  <div><strong>पुढील बाजू (Obverse):</strong> {selectedCoin.front}</div>
                  <div><strong>मागील बाजू (Reverse):</strong> {selectedCoin.back}</div>
                  <div><strong>विश्वसनीय पुरावा:</strong> {selectedCoin.source}</div>
                </div>
              </div>
            </div>

            {/* Inscriptions & Ancient Trade Routes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#7C1D05', fontSize: '1.15rem' }}>🪧 शिलालेख ज्ञानकोश (Inscriptions)</h4>
                {INSCRIPTIONS_DATA.map((ins, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', borderBottom: idx < INSCRIPTIONS_DATA.length - 1 ? '1px dashed #FED7AA' : 'none', paddingBottom: '8px' }}>
                    <strong style={{ color: '#C2410C', fontSize: '0.88rem' }}>{ins.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>स्थान: {ins.location} • लिपी: {ins.script}</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>{ins.desc}</div>
                    <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700 }}>{ins.evidence}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#7C1D05', fontSize: '1.15rem' }}>🛣️ प्राचीन व्यापारी मार्ग (Ancient Trade Routes)</h4>
                <p style={{ fontSize: '0.85rem', color: '#431407', lineHeight: 1.5, margin: '0 0 10px' }}>
                  बंदर → बाजार → नगर → घाट → किल्ला → राजधानी. सह्याद्रीच्या घाटवाटांनी दख्खन पठार आणि अरबी समुद्राचा व्यापार जोडला.
                </p>
                <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                    <strong>नाणेघाट मार्ग:</strong> कल्याण बंदर → नाणेघाट → जुन्नर (सातवाहन राजधानी) → पैठण
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                    <strong>बोरघाट मार्ग:</strong> पनवेल / चोल बंदर → खालापूर → खंडाळा → पुणे पठार
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                    <strong>कुंभारली घाट:</strong> चिपळूण बंदर → कुंभारली घाट → कराड → पंढरपूर
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 4: ⚓ MARITIME, ARMS, SIMULATOR & STRATEGY (FEATURES 14–20)         */}
        {/* ========================================================================= */}
        {activeTab === 'military' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#0369A1', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य १४, १५, १६, १७, १८, १९, २० • MARITIME, CAVALRY, WEAPONS & FORT SIMULATOR
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#0C4A6E', fontWeight: 800, margin: '4px 0 6px' }}>
                ⚓ मराठा आरमार, शस्त्रास्त्रे व किल्ला निर्माण सिम्युलेटर
              </h2>
            </div>

            {/* Arms & Armour Picker */}
            <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#0369A1', fontSize: '1.1rem' }}>🛡️ शस्त्रास्त्र दालन (Arms & Armour Museum):</strong>
                <span style={{ fontSize: '0.8rem', color: '#0284C7' }}>शस्त्र निवडा</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px' }}>
                {WEAPONS_DATA.map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWeapon(w)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      border: selectedWeapon.name === w.name ? '2px solid #0284C7' : '1px solid #BAE6FD',
                      background: selectedWeapon.name === w.name ? '#0284C7' : '#FFFFFF',
                      color: selectedWeapon.name === w.name ? '#FFFFFF' : '#0369A1',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {w.name.split('(')[0]}
                  </button>
                ))}
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
                <h4 style={{ margin: '0 0 6px', color: '#0C4A6E', fontSize: '1.2rem' }}>{selectedWeapon.name}</h4>
                <div style={{ fontSize: '0.88rem', color: '#431407', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>कालखंड:</strong> {selectedWeapon.period}</div>
                  <div><strong>रचना व पाते:</strong> {selectedWeapon.design}</div>
                  <div><strong>युद्धात वापर:</strong> {selectedWeapon.use}</div>
                  <div><strong>ऐतिहासिक संदर्भ:</strong> {selectedWeapon.fame}</div>
                </div>
              </div>
            </div>

            {/* Fort Construction Simulator Launch Widget (Features 17 & 18) */}
            <div style={{ background: '#FFFDF9', border: '2px solid #F59E0B', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, color: '#92400E', marginBottom: '6px' }}>
                  🎮 परस्परसंवादी शिकण्याचा खेळ (Learning Game)
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.35rem', color: '#7C1D05' }}>
                  किल्ला निर्माण व वेढा संरक्षण सिम्युलेटर (Fort Simulator)
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350F' }}>
                  पर्वत, पाण्याची टाकी, गोमुखी दरवाजा, धान्य कोठार व बुरुज निवडा; आपला किल्ला ६ महिने वेढ्यात टिकेल का ते तपासा!
                </p>
              </div>

              <button
                onClick={() => setShowFortSimModal(true)}
                style={{ background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(194,65,12,0.3)' }}
              >
                सिम्युलेटर खेळा 🎮
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 5: ⚖️ HISTORICAL MYSTERY & MULTIPLE VIEWS (FEATURES 21–25)          */}
        {/* ========================================================================= */}
        {activeTab === 'historiography' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#6D28D9', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य २१, २२, २३, २४ • HISTORICAL LITERACY & OBJECTIVE RESEARCH
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#4C1D95', fontWeight: 800, margin: '4px 0 6px' }}>
                ⚖️ इतिहास संशोधन, पुरावे पडताळणी व मतभिन्नता
              </h2>
              <p style={{ color: '#5B21B6', fontSize: '0.92rem', margin: 0 }}>
                प्रचाराऐवजी सप्रमाण ऐतिहासिक सत्य; इतिहासकारांचे मतप्रवाह (View A vs View B) व अनिश्चित राहिलेल्या नोंदींची स्पष्ट कबुली.
              </p>
            </div>

            {/* Feature 23: Different Historical Views Showcase */}
            <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#4C1D95', fontSize: '1.15rem' }}>
                ⚖️ इतिहासकारांचे मतप्रवाह (Different Historical Views): उदा. आग्रा सुटका योजना
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                  <strong style={{ color: '#5B21B6', fontSize: '0.85rem' }}>मतप्रवाह अ (पारंपरिक बखर नोंद):</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                    मिठाईच्या पेटाऱ्यांतून शिवराय व शंभूराजे निसटले (सभासद बखर).
                  </p>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                  <strong style={{ color: '#5B21B6', fontSize: '0.85rem' }}>मतप्रवाह ब (समकालीन राजस्थानी पत्रे व दस्तऐवज):</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                    शिवरायांनी वेश बदलून मुघल रक्षकांच्या समोरून अत्यंत सावधपणे रात्रीच्या वेळी पलायन केले (पार्कळदास व दिनकर पत्रे).
                  </p>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #86EFAC', fontSize: '0.85rem', color: '#166534' }}>
                🟢 <strong>प्रत्यक्ष ऐतिहासिक सत्य:</strong> शिवराय आग्य्राच्या नजरकैदेतून सुखरूप निसटले आणि राजगडावर सुरक्षित पोहोचले ही सिद्ध वस्तुस्थिती आहे; सुटकेच्या पद्धतीबाबत समकालीन साधनांमध्ये सूक्ष्म फरक आढळतात.
              </div>
            </div>

            {/* Mystery Clue Launcher (Feature 21 & 22) */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowMysteryModal(true)}
                style={{ background: '#6D28D9', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                🧠 ऐतिहासिक गूढ शोधक सुरू करा (Investigate Mystery)
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 6: ⛰️ SAHYADRI, RIVERS & SACRED GROVES (FEATURES 26–30)             */}
        {/* ========================================================================= */}
        {activeTab === 'nature' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#15803D', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य २६, २७, २८, २९, ३० • SAHYADRI, RIVERS & SACRED NATURE
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#14532D', fontWeight: 800, margin: '4px 0 6px' }}>
                ⛰️ सह्याद्री, नद्यांची सभ्यता व देवराई (Sacred Groves)
              </h2>
            </div>

            {/* Rivers Explorer */}
            <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#15803D', fontSize: '1.1rem' }}>🌊 महाराष्ट्र नदी संस्कृती (River Civilizations):</strong>
                <span style={{ fontSize: '0.8rem', color: '#166534' }}>नदी निवडा</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px' }}>
                {RIVERS_DATA.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedRiver(r)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      border: selectedRiver.name === r.name ? '2px solid #166534' : '1px solid #BBF7D0',
                      background: selectedRiver.name === r.name ? '#166534' : '#FFFFFF',
                      color: selectedRiver.name === r.name ? '#FFFFFF' : '#15803D',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                <h4 style={{ margin: '0 0 6px', color: '#14532D', fontSize: '1.2rem' }}>{selectedRiver.name}</h4>
                <div style={{ fontSize: '0.88rem', color: '#431407', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>उगम स्थान:</strong> {selectedRiver.origin}</div>
                  <div><strong>प्रवाह मार्ग:</strong> {selectedRiver.course}</div>
                  <div><strong>सांस्कृतिक व ऐतिहासिक महत्त्व:</strong> {selectedRiver.significance}</div>
                  <div><strong>सिंचित पिके व शेती:</strong> {selectedRiver.crops}</div>
                </div>
              </div>
            </div>

            {/* Sacred Groves (Devrai) */}
            <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🌿 देवराई (Devrai — Sacred Forest Conservation)</h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#431407', lineHeight: 1.5 }}>
                स्थानिक देवतेच्या नावाने शतकानुशतके मानवाने हात न लावलेली, जैवविविधतेचे संरक्षण करणारी पवित्र वने.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  <strong>आहुपे देवराई (भीमाशंकर):</strong> महाकाय शेकरू (उडी मारणारी खार) चे नैसर्गिक घर.
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  <strong>माथेरान वनक्षेत्र:</strong> सह्याद्रीतील सदाहरित पर्जन्य वने व औषधी वनस्पती.
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  <strong>ताडोबा व मेळघाट:</strong> वाघ, बिबटे व गोंड संस्कृतीचा जंगलाशी एकात्म संबंध.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 7: 🥁 WARI LIVE MODE, PILGRIMAGE & CALENDAR (FEATURES 31–33)        */}
        {/* ========================================================================= */}
        {activeTab === 'spirituality' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#B45309', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ३१, ३२, ३३ • PILGRIMAGE, WARI & CALENDAR ENGINE
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 6px' }}>
                🥁 पंढरीची वारी, तीर्थक्षेत्रे व सण-उत्सव दिनदर्शिका
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🚶 वारी महामार्ग (Wari Route)</h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                  संत ज्ञानेश्वर माऊली पालखी (आळंदी → पुणे → सासवड → जेजुरी → पंढरपूर) आणि संत तुकाराम महाराज पालखी (देहू → आकुर्डी → पुणे → इंदापूर → पंढरपूर).
                </p>
                <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 700 }}>३५० किमी चालणारी जगातील सर्वात मोठी सामाजिक समतेची पदयात्रा!</div>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🪔 सण दिनदर्शिका इंजिन (Calendar)</h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                  महाराष्ट्र → जिल्हा → तालुका → गाव; गुढीपाडवा, शिवराज्याभिषेक दिन (६ जून), आषाढी एकादशी, नारळी पौर्णिमा, गणेशोत्सव व शिवजयंती.
                </p>
                <Link to="/culture/shivkal-festivals" style={{ color: '#C2410C', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>
                  शिवकालीन १३ सण दालन उघडा →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 8: 👨‍👩‍👧 HOW PEOPLE LIVED & DAILY LIFE SIMULATION (FEATURES 34–39)     */}
        {/* ========================================================================= */}
        {activeTab === 'daily_life' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#BE123C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ३४, ३५, ३६, ३७, ३८, ३९ • HOW PEOPLE LIVED & A DAY IN HISTORY
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#881337', fontWeight: 800, margin: '4px 0 6px' }}>
                👨‍👩‍👧 १७ व्या शतकातील जनजीवन व महाराष्ट्राचे ऐतिहासिक पहिले क्षण
              </h2>
            </div>

            {/* Feature 35: One Day in History Timeline */}
            <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '14px', padding: '20px', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#881337', fontSize: '1.15rem' }}>
                🕰️ १७ व्या शतकातील खेड्यातील एक दिवस (A Day in a 17th Century Village)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>🌅 सकाळ (Morning):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>विहिरीचे पाणी → बैलांची दावण → शेतात नांगरणी → गावचा बाजार.</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>☀️ दुपार (Afternoon):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>भाकरी-ठेचा भोजन → बलुतेदारांचे काम → चावडीवर न्यायनिवाडे व महसूल.</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>🌇 संध्याकाळ (Evening):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>गुरांचे परतीचे खूर → मारुती मंदिरात कीर्तन/भजन → दिवाबत्ती.</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>🌙 रात्र (Night):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>रामोशी-मांग पहारेकऱ्यांची गस्त → कुटुंब गोष्टी → कोट संरक्षण.</div>
                </div>
              </div>
            </div>

            {/* Feature 39: Firsts of Maharashtra */}
            <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#7C1D05', fontSize: '1.15rem' }}>📖 महाराष्ट्राचे ऐतिहासिक 'पहिले' (Firsts of Maharashtra)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  🚂 <strong>पहिली रेल्वे (१८५३):</strong> बोरीबंदर ते ठाणे (३४ किमी)
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  👩‍🏫 <strong>पहिली मुलींची शाळा (१८४८):</strong> सावित्रीबाई व जोतीराव फुले, भिडे वाडा पुणे
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  🩺 <strong>पहिल्या महिला डॉक्टर (१८८६):</strong> डॉ. आनंदीबाई जोशी (M.D. USA)
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  📰 <strong>पहिले मराठी वृत्तपत्र (१८३२):</strong> बाळशास्त्री जांभेकर यांचे 'दर्पण'
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 9: 🚂 INDUSTRIAL & RAILWAY HERITAGE (FEATURES 40–46)                 */}
        {/* ========================================================================= */}
        {activeTab === 'industry' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#0F766E', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ४०, ४१, ४२, ४३, ४४, ४५, ४६ • INDUSTRIAL, RAILWAY & ARCHIVE HERITAGE
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#115E59', fontWeight: 800, margin: '4px 0 6px' }}>
                🚂 महाराष्ट्राचा औद्योगिक, रेल्वे व वृत्तपत्रीय वारसा
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#F0FDFA', border: '1.5px solid #CCFBF1', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#0F766E', fontSize: '1.15rem' }}>🚆 रेल्वे वारसा (Railway Heritage)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#134E4A', lineHeight: 1.5 }}>
                  १६ एप्रिल १८५३: बोरीबंदर ते ठाणे पहिली आगगाडी; भोर घाटातील रिव्हर्सिंग स्टेशन व जागतिक स्थापत्य वारसा असणारे CST मुख्यालय.
                </p>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🏭 गिरणी व साखर सहकार इतिहास</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                  मुंबईच्या गिरणगावातील कापड गिरण्या (१८५४) ते प्रवरानगरमधील आशियातील पहिला सहकारी साखर कारखाना (विठ्ठलराव विखे पाटील).
                </p>
              </div>

              <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#C2410C', fontSize: '1.15rem' }}>📰 वृत्तपत्र अभिलेखागार (Newspaper Archive)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7C2D12', lineHeight: 1.5 }}>
                  दर्पण (१८३२), ज्ञानप्रकाश (१८४९), केसरी व मराठा (लोकमान्य टिळक १८८१), मूकनायक व बहिष्कृत भारत (डॉ. बाबासाहेब आंबेडकर १९२०).
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 10: 🧑‍🔬 RESEARCH, EXPERTS & DIGITAL BOOK (FEATURES 47–53)            */}
        {/* ========================================================================= */}
        {activeTab === 'research' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#4338CA', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ४७, ४८, ५०, ५१, ५२, ५३ • RESEARCH TOOLS & DIGITAL BOOK BUILDER
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#312E81', fontWeight: 800, margin: '4px 0 6px' }}>
                🧑‍🔬 इतिहास संशोधक दालन व स्वतःचे डिजिटल पुस्तक
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#3730A3', fontSize: '1.15rem' }}>📚 "माझे महाराष्ट्र पुस्तक" (Build Your Book)</h4>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#312E81', lineHeight: 1.5 }}>
                  आपले आवडते २५ किल्ले, १० मंदिरे, कुटुंब इतिहास व छायाचित्रे निवडा; Connect Maratha त्याचे सुबक PDF डिजिटल पुस्तकात रूपांतर करेल!
                </p>
                <button onClick={() => alert('डिजिटल पुस्तक निर्मिती संकलन सुरू झाले!')} style={{ background: '#4338CA', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  पुस्तक तयार करा 📖
                </button>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🧑‍🔬 इतिहासकारांना विचारा (Ask a Historian)</h4>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5 }}>
                  पुरातत्वशास्त्र, मोडी लिपी, नाणी किंवा युद्धशास्त्राबाबतचा आपला प्रश्न थेट प्रमाणित इतिहासकारांकडे पडताळणीसाठी पाठवा.
                </p>
                <button onClick={() => setShowAskHistorianModal(true)} style={{ background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  प्रश्न विचारा ✍️
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 11: 🛡️ OPEN API & STANDARDS (FEATURES 54–58)                        */}
        {/* ========================================================================= */}
        {activeTab === 'platform' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#374151', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ५४, ५५, ५६, ५७, ५८ • OPEN HERITAGE API & DATA STANDARDS
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#1F2937', fontWeight: 800, margin: '4px 0 6px' }}>
                🛡️ ओपन हेरिटेज API व महाराष्ट्र ज्ञान प्रमाणीकरण
              </h2>
            </div>

            <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#111827', fontSize: '1.1rem' }}>🧑‍💻 ओपन हेरिटेज API (Developer Schema):</h4>
              <pre style={{ background: '#1F2937', color: '#34D399', padding: '14px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto' }}>
{`// GET /api/v1/civilization/entity?id=raigad
{
  "id": "cm_raigad_001",
  "name_mr": "किल्ले रायगड",
  "name_en": "Raigad Fort",
  "category": "Fort_Capital",
  "coordinates": [18.2346, 73.4432],
  "dynasty": "Maratha_Empire",
  "coronation_date": "1674-06-06",
  "evidence_level": "Documented_Fact",
  "water_sources": ["Gangasagar", "Hatti_Talav", "Cisterns"],
  "sources": ["Sabhasad_Bakhar", "Henry_Oxinden_Diary_1674"]
}`}
              </pre>
            </div>

            <button onClick={() => setShowAPIModal(true)} style={{ background: '#1F2937', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              API कागदपत्रे व स्कीमा पाहा 📖
            </button>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 12: 📱 FIELD EXPLORATION, SAFETY & AWARDS (FEATURES 59–69)          */}
        {/* ========================================================================= */}
        {activeTab === 'tourism' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ५९–६९ • FIELD EXPERIENCE, TREK SAFETY & AWARDS
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#C2410C', fontWeight: 800, margin: '4px 0 6px' }}>
                📱 प्रत्यक्ष गडभ्रमण, ऑडिओ गाईड, सुरक्षा व हेरिटेज पुरस्कार
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎧</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1.15rem', color: '#7C1D05' }}>ऑडिओ वॉकिंग टूर (Audio Guide)</h4>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: '0 0 10px' }}>
                  गडावर पोहोचताच ५ मिनिटांची रंजक व सत्यनिष्ठ ऐतिहासिक ऑडिओ गाईड ऐका.
                </p>
                <button onClick={() => setShowAudioTourModal(true)} style={{ background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  ऑडिओ टूर ऐका 🎧
                </button>
              </div>

              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🆘</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1.15rem', color: '#991B1B' }}>ट्रेकिंग सुरक्षा व जबाबदार पर्यटन</h4>
                <p style={{ fontSize: '0.85rem', color: '#7F1D1D', lineHeight: 1.5, margin: 0 }}>
                  हवामान इशारे, पाण्याची उपलब्धता, जवळचे रुग्णालय व आपत्कालीन क्रमांक; गडावर प्लास्टिक बंदी व ऐतिहासिक पावित्र्य जपणे.
                </p>
              </div>

              <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🏆</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1.15rem', color: '#92400E' }}>वार्षिक हेरिटेज पुरस्कार (Heritage Awards)</h4>
                <p style={{ fontSize: '0.85rem', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                  उत्कृष्ट गाव इतिहास संकलन, गडकोट स्वच्छता, मौखिक इतिहास नोंदणी व वारसा संवर्धन करणाऱ्या तरुणांचा गौरव.
                </p>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS FOR COMPLEX FEATURES                                            */}
      {/* ========================================================================= */}

      {/* MODAL: FORT CONSTRUCTION SIMULATOR (FEATURE 17 & 18) */}
      {showFortSimModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '680px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowFortSimModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.4rem' }}>🧱</span>
              <div>
                <h3 style={{ margin: 0, color: '#7C1D05', fontSize: '1.45rem' }}>किल्ला निर्माण व वेढा सिम्युलेटर (Fort Simulator)</h3>
                <span style={{ fontSize: '0.8rem', color: '#C2410C', fontWeight: 700 }}>१७ व्या शतकातील सह्याद्री स्थापत्य शास्त्र</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#431407' }}>१. भौगोलिक स्थान निवडा:</label>
                <select value={fortSimState.mountain} onChange={(e) => setFortSimState(prev => ({ ...prev, mountain: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', marginTop: '4px' }}>
                  <option>सह्याद्री सुळका (दुर्गम कातळ - उदा. राजगड)</option>
                  <option>सागरी बेट (समुद्रातील खडक - उदा. सिंधुदुर्ग)</option>
                  <option>पठारी डोंगर (विस्तीर्ण सपाटी - उदा. रायगड)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#431407' }}>२. जलव्यवस्थापन रचना (Water Engineering):</label>
                <select value={fortSimState.water} onChange={(e) => setFortSimState(prev => ({ ...prev, water: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', marginTop: '4px' }}>
                  <option>पाषाणातील नैसर्गिक टाक्या (बारामाही जलसाठा)</option>
                  <option>पावसाचे पाणी साठवण तलाव (गंगासागर पद्धत)</option>
                  <option>खडक गाळण विहिरी (सागरी गोडे पाणी)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#431407' }}>३. तटबंदी व दरवाजा रचना:</label>
                <select value={fortSimState.bastion} onChange={(e) => setFortSimState(prev => ({ ...prev, bastion: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', marginTop: '4px' }}>
                  <option>दुहेरी बुरुज व गोमुखी दरवाजा (बाहेरून न दिसणारा)</option>
                  <option>सरळ प्रवेशद्वार (तोफांच्या माऱ्यास उघडे)</option>
                  <option>चोरदिंडी व भुयारी मार्ग</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#FFFDF9', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: '#7C1D05' }}>वेढा टिकाव क्षमता (Siege Survival):</strong>
                <span style={{ color: '#15803D', fontWeight: 900 }}>{fortSimState.siegeDays} दिवस</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350F', lineHeight: 1.5 }}>
                {fortSimState.feedback}
              </p>
            </div>

            <button onClick={() => alert('किल्ल्याची संरक्षण चाचणी यशस्वी! +१०० गुण जोडले गेले.')} style={{ width: '100%', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              चाचणी पूर्ण करा व गुण मिळवा 🛡️
            </button>
          </div>
        </div>
      )}

      {/* MODAL: OLD MARATHI / MODI DOCUMENT READER (FEATURE 7 & 8) */}
      {showDocScannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '720px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowDocScannerModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.4rem' }}>📜</span>
              <div>
                <h3 style={{ margin: 0, color: '#7C1D05', fontSize: '1.45rem' }}>जुनी मोडी व ऐतिहासिक मराठी कागदपत्र वाचक</h3>
                <span style={{ fontSize: '0.8rem', color: '#92400E' }}>स्कॅन → देवनागरी लिप्यंतरण → आधुनिक अर्थ</span>
              </div>
            </div>

            <div style={{ background: '#FFFDF9', border: '1px dashed #C2410C', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>📤 जुने पत्र, सनद किंवा मोडी कागदपत्र अपलोड करा</div>
              <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>JPG, PNG किंवा PDF (अस्पष्ट मजकूर असल्यास तज्ज्ञ तपासणीसाठी चिन्हांकित केला जाईल)</span>
            </div>

            {/* Side-by-side Sample */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <strong style={{ color: '#92400E' }}>१. शिवकालीन अस्सल मजकूर (आज्ञापत्र):</strong>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: '#78350F' }}>
                  "किल्ले हेच राज्याचे मुख्य सार. गडकोट नसता देश उघडा पडे..."
                </p>
              </div>

              <div style={{ background: '#DCFCE7', padding: '12px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <strong style={{ color: '#166534' }}>२. आधुनिक मराठी सोपा अर्थ:</strong>
                <p style={{ margin: '4px 0 0', color: '#14532D' }}>
                  "स्वराज्याचे अस्तित्व आणि रयतेचे संरक्षण हे गडकोटांवरच अवलंबून आहे. किल्ले नसतील तर संपूर्ण देश शत्रूसाठी उघडा पडेल."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORICAL MYSTERY (FEATURE 21 & 22) */}
      {showMysteryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '640px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowMysteryModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.4rem' }}>🧠</span>
              <div>
                <h3 style={{ margin: 0, color: '#6D28D9', fontSize: '1.4rem' }}>ऐतिहासिक गूढ शोधक (Historical Mystery)</h3>
                <span style={{ fontSize: '0.8rem', color: '#5B21B6' }}>पुरावे जोडून सत्य शोधा</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#431407', lineHeight: 1.5, marginBottom: '14px' }}>
              <strong>कोडे:</strong> "वेरूळचे कैलास मंदिर वरून खाली एका अखंड कातळात कोणी कोरले?"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <button onClick={() => setMysteryAnswer('राष्ट्रकूट कृष्ण प्रथम (इ.स. ७५६-७७३) — बडोदा ताम्रपटातील पुराव्यानुसार!')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', fontWeight: 700 }}>
                A) राष्ट्रकूट कृष्ण प्रथम (इ.स. ७५६–७७३)
              </button>
              <button onClick={() => setMysteryAnswer('चुकीचा पर्याय! यादव सिंघणदेव यांनी हेमाडपंथी मंदिरे उभारली.')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', fontWeight: 700 }}>
                B) यादव सिंघणदेव
              </button>
            </div>

            {mysteryAnswer && (
              <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px', borderRadius: '8px', border: '1px solid #86EFAC', fontSize: '0.88rem', fontWeight: 700 }}>
                {mysteryAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: OPEN HERITAGE API (FEATURE 54 & 55) */}
      {showAPIModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '640px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAPIModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <h3 style={{ margin: '0 0 10px', color: '#1F2937', fontSize: '1.4rem' }}>🧑‍💻 ओपन हेरिटेज API व डेटा मानके</h3>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '14px' }}>
              Connect Maratha व्यासपीठ संशोधक, ॲप डेव्हलपर्स आणि शाळांसाठी मुक्त हेरिटेज डेटाबेस उपलब्ध करून देत आहे.
            </p>
            <div style={{ background: '#F3F4F6', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
              Endpoints: /api/v1/forts, /api/v1/temples, /api/v1/saints, /api/v1/timeline
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDIO TOUR (FEATURE 60) */}
      {showAudioTourModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAudioTourModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.2rem' }}>🎧</span>
              <h3 style={{ margin: 0, color: '#0C4A6E', fontSize: '1.4rem' }}>किल्ले रायगड: ५ मिनिटांची ऐतिहासिक ऑडिओ सफर</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#431407', lineHeight: 1.6, marginBottom: '14px' }}>
              "तुम्ही सध्या किल्ले रायगडाच्या महादरवाज्यासमोर उभे आहात. हा दरवाजा दोन अजस्र बुरुजांच्या मागे असा वळणावर लपवलेला आहे की तोफेचा गोळा थेट दरवाजावर आदळू शकत नाही..."
            </p>
            <button onClick={() => alert('ऑडिओ प्लेअर सुरू झाला!')} style={{ width: '100%', background: '#0284C7', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              ▶️ ऑडिओ सुरू करा (Play Audio Guide)
            </button>
          </div>
        </div>
      )}

      {/* MODAL: HERITAGE HOME (FEATURE 6) */}
      {showHeritageHomeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowHeritageHomeModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <h3 style={{ margin: '0 0 10px', color: '#7C1D05', fontSize: '1.4rem' }}>🏠 माझे हेरिटेज होम नोंदणी</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <input type="text" placeholder="घराचे नाव / वाडा नाव..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              <input type="text" placeholder="मूळ गाव, तालुका व जिल्हा..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              <input type="text" placeholder="अंदाजे बांधकाम वर्ष (उदा. १९१०)..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              <textarea placeholder="घरातील वैशिष्ट्ये (ओसरी, लाकडी खांब, जुनी विहीर, कौटुंबिक आठवणी)..." rows={3} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }} />
            </div>
            <button onClick={() => { alert('हेरिटेज होम नोंदवले गेले!'); setShowHeritageHomeModal(false); }} style={{ width: '100%', background: '#15803D', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              जतन करा 💾
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ASK A HISTORIAN (FEATURE 47) */}
      {showAskHistorianModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAskHistorianModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <h3 style={{ margin: '0 0 10px', color: '#9F1239', fontSize: '1.4rem' }}>🧑‍🔬 इतिहासकारांना विचारा</h3>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: '0 0 12px' }}>आपला प्रश्न तज्ज्ञ मंडळाकडे पाठवला जाईल व संदर्भानुसार उत्तर दिले जाईल.</p>
            <textarea placeholder="ऐतिहासिक प्रश्न, शिलालेख शंका किंवा संदर्भ विचारणा येथे लिहा..." rows={4} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '14px', resize: 'none' }} />
            <button onClick={() => { alert('प्रश्न सबमिट झाला!'); setShowAskHistorianModal(false); }} style={{ width: '100%', background: '#9F1239', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              प्रश्न पाठवा 📩
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
