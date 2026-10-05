/**
 * CONNECT MARATHA — MAHARASHTRA CULTURAL & HISTORICAL KNOWLEDGE GRAPH
 * 
 * An authoritative, interconnected relational data model for Maharashtra's:
 * - 8 Cultural Regions (सांस्कृतिक प्रदेश)
 * - Languages & Dialects (भाषा आणि बोली)
 * - Food Culture & Provenance (खाद्यसंस्कृती)
 * - Temples & Village Deities (मंदिरे व ग्रामदैवत)
 * - Living Folk Traditions (खेळ, नाट्य, जत्रा, उत्सव)
 * - Archaeology, Forts & UNESCO Heritage (वारसा व पुरातत्त्व)
 * - Historical Events & Knowledge Graph (घटना ↔ स्थळे ↔ व्यक्ती ↔ दस्तऐवज)
 * 
 * Source Attribution:
 * - Tier 1: Primary / Government / ASI / UNESCO / Gazetteers
 * - Tier 2: Academic & Peer-Reviewed Historians
 * - Tier 3: Institutional & Museum Archives
 * - Tier 4: Community Knowledge & Oral Traditions
 * 
 * Historical Confidence Levels:
 * - 'documented': 🟢 समर्थित ऐतिहासिक / पुरातत्त्वीय पुरावे
 * - 'scholarly': 🔵 शैक्षणिक व अभ्यासकीय विवेचन
 * - 'traditional': 🟡 स्थानिक आख्यायिका / पारंपरिक समजूत
 * - 'community': 🟣 समुदाय नोंद / मौखिक इतिहास
 */

export const SOURCE_TIERS = {
  TIER_1: {
    id: 1,
    name: 'शासकीय व अधिकृत पुरातत्त्वीय स्रोत (Tier 1)',
    badge: 'Tier 1: अधिकृत स्रोत',
    color: '#15803d',
    bg: '#dcfce7',
    examples: 'पुरातत्त्व व वस्तुसंग्रहालय संचालनालय, ASI, UNESCO, महाराष्ट्र शासन गॅझेटिअर'
  },
  TIER_2: {
    id: 2,
    name: 'शैक्षणिक व संशोधकीय संदर्भ (Tier 2)',
    badge: 'Tier 2: अभ्यासकीय संदर्भ',
    color: '#0369a1',
    bg: '#e0f2fe',
    examples: 'विद्यापीठ शोधनिबंध, इतिहास संशोधक (रियासतकार सरदेसाई, राजवाडे, जदुनाथ सरकार)'
  },
  TIER_3: {
    id: 3,
    name: 'संस्थात्मक व संग्रहालय संग्रह (Tier 3)',
    badge: 'Tier 3: संस्थात्मक दस्तऐवज',
    color: '#b45309',
    bg: '#fef3c7',
    examples: 'भारत इतिहास संशोधक मंडळ, केळकर संग्रहालय, स्थानिक इतिहास संस्था'
  },
  TIER_4: {
    id: 4,
    name: 'मौखिक इतिहास व लोकपरंपरा (Tier 4)',
    badge: 'Tier 4: लोकपरंपरा / मौखिक',
    color: '#7e22ce',
    bg: '#f3e8ff',
    examples: 'स्थानिक गावकरी मुलाखती, कुळवृत्तांत, मौखिक पोवाडे व लोककथा'
  }
};

export const CONFIDENCE_LEVELS = {
  DOCUMENTED: {
    code: 'documented',
    label: 'अधिकृत सप्रमाण (Documented)',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '🟢',
    desc: 'पुरातत्त्वीय, शिलालेखीय किंवा अधिकृत समकालीन दस्तऐवजांद्वारे सिद्ध.'
  },
  SCHOLARLY: {
    code: 'scholarly',
    label: 'अभ्यासकीय निष्कर्ष (Scholarly Interpretation)',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    icon: '🔵',
    desc: 'संशोधक व इतिहासकारांच्या विश्लेषणावर आधारित मान्य मांडणी.'
  },
  TRADITIONAL: {
    code: 'traditional',
    label: 'पारंपरिक आख्यायिका (Traditional Account)',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: '🟡',
    desc: 'पिढ्यानपिढ्या चालत आलेली लोकश्रद्धा किंवा मौखिक परंपरा.'
  },
  COMMUNITY: {
    code: 'community',
    label: 'समुदाय योगदान (Community Submission)',
    color: '#9333ea',
    bg: '#faf5ff',
    border: '#d8b4fe',
    icon: '🟣',
    desc: 'स्थानिक नागरिक, अभ्यासक अथवा परिवारांनी नोंदवलेली माहिती.'
  }
};

// ==========================================
// 1. MAHARASHTRA 8 CULTURAL REGIONS
// ==========================================
export const REGIONS_DATA = [
  {
    id: 'konkan',
    name: 'कोकण (Konkan)',
    nameEn: 'Konkan Coastal Region',
    icon: '🌊',
    marathiName: 'कोकण किनारपट्टी व पश्चिम घाट पायथा',
    districts: ['सिंधुदुर्ग', 'रत्नागिरी', 'रायगड', 'ठाणे', 'पालघर'],
    tagline: 'निसर्गसंपन्न समुद्रकिनारा, जलदुर्ग, नारळी-सुपारीच्या बागा आणि मालवणी-आगरी जीवनशैली',
    primaryDialects: ['मालवणी', 'आगरी', 'कोळी बोली', 'कुडाळी', 'चित्पावनी'],
    heroImage: '/assets/images/real-konkan-tarkarli.jpg',
    heroImageLocation: 'तारकर्ली समुद्रकिनारा, मालवण, सिंधुदुर्ग (कोकण)',
    heroImageSource: 'महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) अधिकृत / Wikimedia Commons',
    lifestyleImage: '/assets/images/real-konkan-ganpatipule.jpg',
    lifestyleImageLocation: 'गणपतीपुळे समुद्रकिनारा, रत्नागिरी (कोकण)',
    lifestyleImageSource: 'Wikimedia Commons (Verified Konkan Coastline)',
    foodImage: '/assets/images/real-konkan-malvani-thali.jpg',
    foodImageLocation: 'अस्सल मालवणी पद्धतीची केळीच्या पानावरची मेजवानी, कोळंबी भात, सोलकढी व वडे (कोकण)',
    foodImageSource: 'महाराष्ट्र पर्यटन व कोकण खाद्यसंस्कृती पुराभिलेख',
    artImage: '/assets/images/real-konkan-koli-dance.jpg',
    artImageLocation: 'कोकणी कोळी नृत्य व उत्सव परंपरा (कोकण)',
    artImageSource: 'Wikimedia Commons (Traditional Koli Dance)',
    fortImage: '/assets/images/real-sindhudurg-fort.jpg',
    fortImageLocation: 'सिंधुदुर्ग जलदुर्ग, मालवण, सिंधुदुर्ग (कोकण)',
    fortImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व पुराभिलेख',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) कोकण सर्किट व कुलाबा-रत्नागिरी गॅझेटिअर',
    lifestyle: 'भातशेती, आंबा-काजू बागायत, मासेमारी, दशावतार व गणपती उत्सवाची समृद्ध लोकधारा.',
    cultureHighlights: [
      'समुद्रकिनारी कौलारू घरांची वास्तुकला',
      'गणपती उत्सव — घरोघरी पारंपरिक भजने व आरत्या',
      'रात्रभर रंगणारे दशावतारी नाट्यप्रयोग',
      'कोळी नृत्य व नारळी पौर्णिमा मिरवणुका'
    ],
    forts: ['सिंधुदुर्ग', 'विजयदुर्ग', 'सुवर्णदुर्ग', 'मुरुड-जंजिरा', 'पद्मदुर्ग', 'कुलाबा'],
    temples: ['कुणकेश्वर (दक्षिण कोकण काशी)', 'गणपतीपुळे स्वयंभू मंदिर', 'हरिहरेश्वर', 'मार्लेश्वर'],
    gramdevats: ['श्री भराडीदेवी (आंगणेवाडी)', 'श्री देवी सातेरी (सावंतवाडी)', 'काळभैरव (हरिहरेश्वर)'],
    stapleFoods: ['सोलकढी', 'कोळंबी भात', 'घावणे', 'कोंबडी वडे', 'उकडीचे मोदक', 'काजू उसळ'],
    jatras: ['आंगणेवाडी भराडीदेवी जत्रा (मालवण)', 'कुणकेश्वर महाशिवरात्र जत्रा'],
    folkArts: ['दशावतार', 'कोळी नृत्य', 'तारपा नृत्य', 'जाखडी नृत्य'],
    cultureProfile: {
      language: 'मालवणी, आगरी, कोळी बोली, कुडाळी व चित्पावनी',
      lifestyle: 'भातशेती, आंबा-काजू बागायत, मासेमारी, दशावतार व गणपती उत्सवाची समृद्ध लोकधारा.',
      foodCulture: 'ताजे नारळ, कोकम, तिरफळ आणि स्थानिक मासळीचे वैविध्य असलेले सौम्य-आंबट-तिखट जेवण.',
      signatureDishes: ['सोलकढी', 'कोळंबी भात', 'घावणे', 'कोंबडी वडे', 'उकडीचे मोदक'],
      festivals: ['गणेशोत्सव', 'शिमगोत्सव (होळी)', 'नारळी पौर्णिमा', 'दशावतार जत्रा'],
      folkArts: ['दशावतार लोकनाट्य', 'कोळी नृत्य', 'तारपा नृत्य', 'जाखडी भजन'],
      forts: ['सिंधुदुर्ग', 'विजयदुर्ग', 'सुवर्णदुर्ग', 'मुरुड-जंजिरा', 'कुलाबा'],
      temples: ['कुणकेश्वर', 'गणपतीपुळे', 'हरिहरेश्वर', 'मार्लेश्वर']
    }
  },
  {
    id: 'western_maharashtra',
    name: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    nameEn: 'Western Maharashtra (Desh)',
    icon: '🚩',
    marathiName: 'सह्याद्रीचा माथा व कृष्णा-भीमा खोरे',
    districts: ['पुणे', 'सातारा', 'कोल्हापूर', 'सांगली', 'सोलापूर'],
    tagline: 'स्वराज्याची जननी, गडकिल्ल्यांची मांदियाळी, कुस्ती परंपरा आणि साखर पट्टा',
    primaryDialects: ['प्रमाण मराठी (पुणेरी)', 'कोल्हापुरी लहेजा', 'सातारची ग्रामीण बोली', 'सोलापुरी बोली'],
    heroImage: '/assets/images/real-shaniwar-wada.jpg',
    heroImageLocation: 'शनिवार वाडा दिल्ली दरवाजा, पुणे, पश्चिम महाराष्ट्र (देश)',
    heroImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व पुराभिलेख / Wikimedia Commons',
    lifestyleImage: '/assets/images/real-paschim-sahyadri-mahabaleshwar.jpg',
    lifestyleImageLocation: 'सह्याद्री पर्वतरांग, महाबळेश्वर व सातारा निसर्ग परिसर, पश्चिम महाराष्ट्र',
    lifestyleImageSource: 'Wikimedia Commons (Sahyadri Western Ghats, Mahabaleshwar)',
    foodImage: '/assets/images/real-paschim-kolhapuri-thali.jpg',
    foodImageLocation: 'अस्सल कोल्हापुरी तांबडा-पांढरा रस्सा, मटण व भाकरी थाळी, पश्चिम महाराष्ट्र',
    foodImageSource: 'Wikimedia Commons (Authentic Kolhapuri Tambda-Pandhra Rassa Thali)',
    artImage: '/assets/images/real-paschim-lavani-stage.jpg',
    artImageLocation: 'पारंपरिक लावणी रंगमंच सादरीकरण, पश्चिम महाराष्ट्र',
    artImageSource: 'Wikimedia Commons (Lavani Dance Performance Maharashtra)',
    fortImage: '/assets/images/Sinhagad.jpg',
    fortImageLocation: 'किल्ले सिंहगड कल्याण दरवाजा व भक्कम बुरुज, पुणे, पश्चिम महाराष्ट्र',
    fortImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व पुराभिलेख',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'बॉम्बे गॅझेटिअर (पुणे व सातारा खंड); MTDC पश्चिम महाराष्ट्र पर्यटन मंडळ',
    lifestyle: 'सह्याद्रीची दऱ्याखोरी, मावळ खोरे, समृद्ध शेती, वारकरी संप्रदायाची पायी वारी आणि तालीम संस्कृती.',
    cultureHighlights: [
      'आषाढी-कार्तिकी पंढरपूर पायी वारी परंपरा',
      'कोल्हापुरी लाल मातीतील कुस्ती व तालीम संस्कृती',
      'सह्याद्रीच्या दुर्गम कड्यांवरील मराठा राजधानी गड',
      'गणेशोत्सव व सार्वजनिक शिवजयंतीचे भव्य सोहळे'
    ],
    forts: ['राजगड', 'रायगड', 'सिंहगड', 'पन्हाळा', 'प्रतापगड', 'शिवनेरी', 'सज्जनगड', 'विशाळगड'],
    temples: ['विठ्ठल रुक्मिणी मंदिर (पंढरपूर)', 'महालक्ष्मी अंबाबाई (कोल्हापूर)', 'जेजुरी खंडोबा', 'शिखर शिंगणापूर'],
    gramdevats: ['कसबा गणपती (पुण्याचे ग्रामदैवत)', 'तांबडी जोगेश्वरी', 'जोतिबा (वाडी रत्नागिरी)', 'यमाई देवी (औंध)'],
    stapleFoods: ['तांबडा-पांढरा रस्सा', 'झुणका भाकरी', 'पुणेरी मिसळ', 'पुरणपोळी', 'कोल्हापुरी भेळ'],
    jatras: ['जोतिबा चैत्र पौर्णिमा यात्रा (कोल्हापूर)', 'जेजुरी सोमवती अमावस्या (येळकोट खंडोबा)', 'सिद्धेश्वर यात्रा (सोलापूर)'],
    folkArts: ['लावणी', 'पोवाडा (शाहीर परंपरा)', 'गोंधळ', 'वारकरी कीर्तन / भारुड'],
    cultureProfile: {
      language: 'प्रमाण मराठी, कोल्हापुरी ठसका, सातारची ग्रामीण व सोलापुरी लहेजा',
      lifestyle: 'सह्याद्रीची दऱ्याखोरी, मावळ खोरे, समृद्ध शेती, वारकरी संप्रदायाची पायी वारी आणि तालीम संस्कृती.',
      foodCulture: 'झणझणीत कांदा-लसूण मसाला, तांबडा-पांढरा रस्सा, बाजरीची भाकरी व अस्सल मिसळ.',
      signatureDishes: ['तांबडा-पांढरा रस्सा', 'पिठलं-भाकरी', 'पुणेरी मिसळ', 'पुरणपोळी', 'कोल्हापुरी भेळ'],
      festivals: ['पंढरपूर आषाढी वारी', 'सार्वजनिक गणेशोत्सव', 'शिवजयंती महामहोत्सव', 'चंपाषष्ठी'],
      folkArts: ['लावणी व तमाशा फड', 'शाहीर परंपरा व पोवाडा', 'गोंधळ व जागरण', 'वारकरी संकीर्तन'],
      forts: ['राजगड', 'रायगड', 'सिंहगड', 'पन्हाळा', 'प्रतापगड', 'शिवनेरी'],
      temples: ['विठ्ठल रुक्मिणी (पंढरपूर)', 'अंबाबाई (कोल्हापूर)', 'जेजुरी खंडोबा', 'शिखर शिंगणापूर']
    }
  },
  {
    id: 'marathwada',
    name: 'मराठवाडा (Marathwada)',
    nameEn: 'Marathwada Region',
    icon: '🏛️',
    marathiName: 'गोदावरीचे पावन खोरे व संतांची भूमी',
    districts: ['छत्रपती संभाजीनगर', 'जालना', 'बीड', 'लातूर', 'धाराशिव', 'नांदेड', 'परभणी', 'हिंगोली'],
    tagline: 'अजिंठा-वेरूळ जागतिक वारसा, तीन ज्योतिर्लिंगे, महानुभाव व संत परंपरा',
    primaryDialects: ['मराठवाडी बोली', 'लातुरी बोली', 'नांदेड-तेलंगणा सीमावर्ती बोली'],
    heroImage: '/assets/images/real-ellora-kailash.jpg',
    heroImageLocation: 'वेरूळ कैलास मंदिर (लेणी क्र. १६), छत्रपती संभाजीनगर, मराठवाडा',
    heroImageSource: 'UNESCO World Heritage Centre / ASI',
    lifestyleImage: '/assets/images/real-marathwada-ajanta-caves.jpg',
    lifestyleImageLocation: 'अजिंठा लेणी जागतिक वारसा संकुल, छत्रपती संभाजीनगर, मराठवाडा',
    lifestyleImageSource: 'UNESCO World Heritage / Wikimedia Commons',
    foodImage: '/assets/images/real-marathwada-bhakri.jpg',
    foodImageLocation: 'पारंपरिक गरम ज्वारीची भाकरी व ठेचा, मराठवाडा ग्रामीण संस्कृती',
    foodImageSource: 'Wikimedia Commons (Authentic Jowar Bhakri Maharashtra)',
    artImage: '/assets/images/real-marathwada-gondhal.jpg',
    artImageLocation: 'तुळजापूर व माहूर जागरण-गोंधळ लोककला, मराठवाडा',
    artImageSource: 'Wikimedia Commons (Traditional Gondhal Artist Performance)',
    fortImage: '/assets/images/forts/daulatabad-fort.jpg',
    fortImageLocation: 'दौलताबाद (देवगिरी) अजिंक्य किल्ला, छत्रपती संभाजीनगर, मराठवाडा',
    fortImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व पुराभिलेख',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'UNESCO World Heritage Centre (Ajanta-Ellora) व पुरातत्त्व संचालनालय, महाराष्ट्र शासन',
    lifestyle: 'वारकरी संतांची अध्यात्मिक ज्ञानपरंपरा, ऐतिहासिक वास्तू, ज्वारी-बाजरीचे शेतीजीवन आणि गोदावरी तीरावरील संस्कृती.',
    cultureHighlights: [
      'संत ज्ञानेश्वर, संत एकनाथ, समर्थ रामदास यांची कर्मभूमी',
      'अजिंठा-वेरूळ जागतिक वारसा लेणी वास्तुकला',
      'हैदराबाद मुक्ती संग्रामाचा दैदीप्यमान इतिहास',
      'पैठणी साडी विणकामाची प्राचीन कला'
    ],
    forts: ['दौलताबाद (देवगिरी)', 'कंधार किल्ला', 'धारूर किल्ला', 'नळदुर्ग (पाणी महाल)', 'औसा किल्ला'],
    temples: ['घृष्णेश्वर ज्योतिर्लिंग', 'परळी वैजनाथ ज्योतिर्लिंग', 'औंढा नागनाथ ज्योतिर्लिंग', 'तुळजापूर भवानी माता'],
    gramdevats: ['तुळजाभवानी (महाराष्ट्राची कुलस्वामिनी)', 'खंडोबा (बीड)', 'रेणुका माता (माहूर)'],
    stapleFoods: ['ज्वारीची भाकरी', 'धपाटे', 'पिठलं-ठेचा', 'उकडहंडी', 'नांदेडची बासुंदी', 'जालना खरडा'],
    jatras: ['तुळजापूर नवरात्र यात्रा', 'पैठणची नाथषष्ठी यात्रा', 'माहूर रेणुका माता यात्रा'],
    folkArts: ['भारुड (एकनाथी परंपरा)', 'शाहिरी पोवाडे', 'गोंधळ व जागरण', 'महानुभाव लीळा गायन'],
    cultureProfile: {
      language: 'मराठवाडी बोली, लातुरी व नांदेड सीमावर्ती लहेजा',
      lifestyle: 'वारकरी संतांची अध्यात्मिक ज्ञानपरंपरा, ऐतिहासिक वास्तू, ज्वारी-बाजरीचे शेतीजीवन आणि गोदावरी संस्कृती.',
      foodCulture: 'गरम ज्वारीची भाकरी, हिरव्या मिरचीचा ठेचा, शेंगदाणा चटणी आणि सणांचे धपाटे.',
      signatureDishes: ['ज्वारीची भाकरी', 'धपाटे', 'ठेचा', 'डाळ-बट्टी', 'नांदेड बासुंदी'],
      festivals: ['तुळजापूर नवरात्रोत्सव', 'पैठण नाथषष्ठी', 'माहूर यात्रा', 'दसरा'],
      folkArts: ['एकनाथी भारुड', 'गोंधळ व जागरण', 'महानुभाव लीळा गायन', 'शाहिरी'],
      forts: ['दौलताबाद (देवगिरी)', 'कंधार किल्ला', 'नळदुर्ग', 'धारूर', 'औसा'],
      temples: ['घृष्णेश्वर', 'परळी वैजनाथ', 'औंढा नागनाथ', 'तुळजाभवानी', 'माहूर रेणुका']
    }
  },
  {
    id: 'vidarbha',
    name: 'विदर्भ (Vidarbha / Varhad)',
    nameEn: 'Vidarbha & Varhad',
    icon: '🐅',
    marathiName: 'वऱ्हाड, झाडीपट्टी व ताडोबाचे अरण्य',
    districts: ['नागपूर', 'अमरावती', 'अकोला', 'यवतमाळ', 'बुलढाणा', 'वर्धा', 'चंद्रपूर', 'गडचिरोली', 'भंडारा', 'गोंदिया', 'वाशीम'],
    tagline: 'झाडीबोली नाट्य चळवळ, सावजी खाद्यसंस्कृती, संत गाडगेबाबा-तुकडोजी महाराज आणि घनदाट अरण्य',
    primaryDialects: ['वऱ्हाडी बोली', 'झाडीबोली', 'नागपुरी बोली', 'गोंडी बोली (आदिवासी)'],
    heroImage: '/assets/images/real-vidarbha-tadoba.jpg',
    heroImageLocation: 'ताडोबा-अंधारी व्याघ्र प्रकल्प, चंद्रपूर, विदर्भ',
    heroImageSource: 'महाराष्ट्र वन विभाग व व्याघ्र संवर्धन प्राधिकरण',
    lifestyleImage: '/assets/images/real-vidarbha-chikhaldara.jpg',
    lifestyleImageLocation: 'चिखलदरा व मेळघाट सातपुडा पर्वतरांग, अमरावती, विदर्भ',
    lifestyleImageSource: 'Wikimedia Commons (Melghat, Satpuda Ranges, Amravati)',
    foodImage: '/assets/images/real-vidarbha-saoji.jpg',
    foodImageLocation: 'अस्सल नागपुरी सावजी मटण व रस्सा, विदर्भ खाद्यसंस्कृती',
    foodImageSource: 'Wikimedia Commons (Authentic Vidarbha Saoji Cuisine)',
    artImage: '/assets/images/real-vidarbha-dhol-tasha.jpg',
    artImageLocation: 'शिवगर्जना ढोल-ताशा पथक, नागपूर, विदर्भ',
    artImageSource: 'Wikimedia Commons (Nagpur Traditional Cultural Troupe)',
    fortImage: '/assets/images/forts/gawilghur-fort.jpg',
    fortImageLocation: 'गावीलगड दुर्ग, चिखलदरा, अमरावती, विदर्भ',
    fortImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व पुराभिलेख',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'विदर्भ साहित्य संघ नोंदी व महाराष्ट्र शासन पर्यटन संचनालय',
    lifestyle: 'कापूस-संत्र्याची शेती, झाडीपट्टीची रात्ररात्र रंगणारी नाटके, सावजी परंपरा आणि वनवासी समृद्ध संस्कृती.',
    cultureHighlights: [
      'झाडीपट्टी रंगभूमी — महाराष्ट्रातील स्वतंत्र नाट्य चळवळ',
      'संत तुकडोजी महाराज (ग्रामगीता) व संत गाडगेबाबांची समाजसुधारणा',
      'मारबत व बडग्या उत्सव (नागपूरची अनन्य परंपरा)',
      'गोंड व कोलाम आदिवासी लोकसंस्कृती व हस्तकला'
    ],
    forts: ['गावीलगड (चिखलदरा)', 'नरनाळा किल्ला', 'माणिकगड', 'नगरधन किल्ला', 'सिंदेवाही'],
    temples: ['शेगाव गजानन महाराज मंदिर', 'दीक्षाभूमी (नागपूर)', 'टेकडी गणेश (नागपूर)', 'महाकाली मंदिर (चंद्रपूर)', 'अंबादेवी (अमरावती)'],
    gramdevats: ['अंबादेवी (अमरावती)', 'रुक्मिणी माता (कौंडिण्यपूर)', 'माता महाकाली (चंद्रपूर)'],
    stapleFoods: ['सावजी मटण व रस्सा', 'तरोट्याची भाजी', 'पातोडी रस्सा भाजी', 'गोळा भात', 'नागपुरी संत्रा बर्फी'],
    jatras: ['शेगाव प्रगट दिन सोहळा', 'चंद्रपूर महाकाली यात्रा', 'ऋद्धिपूर महानुभाव यात्रा'],
    folkArts: ['झाडीपट्टी नाटक', 'दंडार नृत्य', 'खडीगंमत', 'गोंडी लोकनृत्य', 'भजन-कीर्तन'],
    cultureProfile: {
      language: 'वऱ्हाडी बोली, झाडीबोली, नागपुरी व गोंडी बोली',
      lifestyle: 'कापूस-संत्र्याची शेती, झाडीपट्टीची रात्ररात्र रंगणारी नाटके, सावजी परंपरा आणि अरण्य संस्कृती.',
      foodCulture: '३२ दुर्मीळ खड्या मसाल्यांचे सावजी मटण, पातोडी रस्सा, चवदार बेसन व नागपुरी संत्रा बर्फी.',
      signatureDishes: ['सावजी मटण', 'पातोडी रस्सा', 'गोळा भात', 'तरोट्याची भाजी', 'संत्रा बर्फी'],
      festivals: ['नागपूर मारबत उत्सव', 'पोळा उत्सव', 'शेगाव प्रगट दिन', 'महाशिवरात्र'],
      folkArts: ['झाडीपट्टी स्वतंत्र रंगभूमी', 'दंडार नृत्य', 'खडीगंमत', 'गोंडी आदिवासी कला'],
      forts: ['गावीलगड (चिखलदरा)', 'नरनाळा', 'माणिकगड', 'नगरधन'],
      temples: ['शेगाव गजानन महाराज', 'टेकडी गणेश (नागपूर)', 'महाकाली (चंद्रपूर)', 'अंबादेवी']
    }
  },
  {
    id: 'khandesh',
    name: 'खानदेश (Khandesh)',
    nameEn: 'Khandesh Region',
    icon: '🌾',
    marathiName: 'तापी-गिरणा खोरे व सातपुड्याची कुस',
    districts: ['जळगाव', 'धुळे', 'नंदुरबार'],
    tagline: 'अहिराणी भाषेचा गोडवा, खानदेशी शेवभाजी, केळीचे आगर आणि बहिणाबाईंची अजरामर कविता',
    primaryDialects: ['अहिराणी', 'खानदेशी बोली', 'भिल्ली बोली'],
    heroImage: '/assets/images/real-khandesh-purna-river.jpg',
    heroImageLocation: 'पूर्णा व तापी नदी खोरे, मुक्ताईनगर, जळगाव (खानदेश)',
    heroImageSource: 'Wikimedia Commons (Purna-Tapi River Valley Jalgaon)',
    lifestyleImage: '/assets/images/real-khandesh-toranmal.jpg',
    lifestyleImageLocation: 'तोरणमाळ थंड हवेचे ठिकाण, नंदुरबार (खानदेश)',
    lifestyleImageSource: 'Wikimedia Commons (Toranmal Plateau, Nandurbar)',
    foodImage: '/assets/images/real-khandesh-shev-bhaji.jpg',
    foodImageLocation: 'अस्सल खानदेशी झणझणीत शेवभाजी, धुळे-जळगाव (खानदेश)',
    foodImageSource: 'Wikimedia Commons (Authentic Khandeshi Shev Bhaaji)',
    artImage: '/assets/images/real-khandesh-tribal-dance.jpg',
    artImageLocation: 'सातपुडा भिल्ल व आदिवासी पारंपरिक लोकनृत्य (खानदेश)',
    artImageSource: 'Wikimedia Commons (Maharashtra Tribal Dance Tradition)',
    fortImage: '/assets/images/forts/laling-fort.jpg',
    fortImageLocation: 'लळिंग किल्ला, धुळे (खानदेश)',
    fortImageSource: 'पुरातत्त्व संचालनालय महाराष्ट्र शासन व गॅझेटिअर',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'कवयित्री बहिणाबाई चौधरी उत्तर महाराष्ट्र विद्यापीठ व खानदेश गॅझेटिअर',
    lifestyle: 'तापी नदीच्या सुपीक खोऱ्यातील केळी व कपाशी शेती, बहिणाबाई चौधरींच्या ओव्यांची लोकपरंपरा आणि सातपुड्यातील आदिवासी उत्सव.',
    cultureHighlights: [
      'कवयित्री बहिणाबाई चौधरी यांची अहिराणी लोककविता',
      'तोरणमाळचे आदिवासी निसर्ग सौंदर्य व परंपरा',
      'खानदेशी लग्न सोहळ्यातील पारंपरिक अहिराणी गाणी',
      'सार्वजनिक कानबाई उत्सव व कुलदेवता पूजन'
    ],
    forts: ['लळिंग किल्ला (धुळे)', 'सोंगीर किल्ला', 'पारोळा किल्ला (झाशीच्या राणीचे माहेर)', 'अंमळनेर गढी'],
    temples: ['पद्मालय (दोन अर्ध गणपतींपैकी एक)', 'स्वामीनारायण मंदिर (धुळे)', 'प्रकाशे (दक्षिण काशी, तापी संगम)'],
    gramdevats: ['कानबाई माता (खानदेश कुलदैवत)', 'एकवीरा देवी (धुळे)', 'मनुदेवी (सातपुडा पायथा)'],
    stapleFoods: ['खानदेशी शेवभाजी', 'वांग्याचे भरीत व कळण्याची भाकरी', 'दाळ-बट्टी', 'मांडे (खापरवरची पोळी)', 'गुळाची खीर'],
    jatras: ['कानबाई उत्सव यात्रा', 'सारंगखेडा चेतक घोडे महोत्सव (नंदुरबार)', 'प्रकाशे तापी यात्रा'],
    folkArts: ['अहिराणी ओव्या व गाणी', 'सोंगी भजन', 'आदिवासी भिल्ल नृत्य', 'कानबाईची गीते'],
    cultureProfile: {
      language: 'अहिराणी, खानदेशी बोली व भिल्ली बोली',
      lifestyle: 'तापी खोऱ्यातील केळी-कपाशी शेती, बहिणाबाईंच्या ओव्यांची लोकपरंपरा आणि सातपुड्यातील आदिवासी संस्कृती.',
      foodCulture: 'झणझणीत काळा मसाला, वांग्याचे भरीत, कळण्याची भाकरी, शेवभाजी आणि खापरवरची पुरणपोळी (मांडे).',
      signatureDishes: ['खानदेशी शेवभाजी', 'वांग्याचे भरीत व कळण्याची भाकरी', 'मांडे', 'दाळ-बट्टी', 'गुळाची खीर'],
      festivals: ['कानबाई उत्सव', 'सारंगखेडा चेतक महोत्सव', 'दिवाळी', 'होळी (तोरणमाळ)'],
      folkArts: ['अहिराणी लोकगीते व ओव्या', 'सोंगी भजन', 'भिल्ल आदिवासी नृत्य', 'कानबाई गीते'],
      forts: ['लळिंग किल्ला', 'सोंगीर', 'पारोळा (झाशी राणी माहेर)', 'अंमळनेर'],
      temples: ['पद्मालय', 'प्रकाशे तापी संगम', 'स्वामीनारायण मंदिर', 'मनुदेवी']
    }
  },
  {
    id: 'north_maharashtra',
    name: 'उत्तर महाराष्ट्र (North Maharashtra / Nashik)',
    nameEn: 'North Maharashtra (Nashik Region)',
    icon: '⛰️',
    marathiName: 'गोदावरी उगम व सह्याद्रीच्या उत्तुंग रांगा',
    districts: ['नाशिक', 'अहमदनगर (अहिल्यानगर)'],
    tagline: 'कुंभमेळ्याची पावन भूमी, साडेतीन शक्तिपीठांपैकी सप्तशृंगी, अहिल्यादेवींचे वारसा कार्य आणि कळसूबाई',
    primaryDialects: ['नाशिकरी मराठी', 'अहमदनगरी ग्रामीण बोली', 'डांगी बोली'],
    heroImage: '/assets/images/real-trimbakeshwar.jpg',
    heroImageLocation: 'त्र्यंबकेश्वर ज्योतिर्लिंग मंदिर, ब्रह्मगिरी पायथा, नाशिक (उत्तर महाराष्ट्र)',
    heroImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व MTDC',
    lifestyleImage: '/assets/images/real-nashik-ramkund.jpg',
    lifestyleImageLocation: 'पवित्र गोदावरी रामकुंड व घाट परिसर, नाशिक (उत्तर महाराष्ट्र)',
    lifestyleImageSource: 'Wikimedia Commons (Verified Ramkund Godavari Nashik)',
    foodImage: '/assets/images/real-misal-pav.jpg',
    foodImageLocation: 'प्रसिद्ध नाशिक तर्रीदार मिसळ, नाशिक (उत्तर महाराष्ट्र)',
    foodImageSource: 'Wikimedia Commons (Authentic Nashik Misal)',
    artImage: '/assets/images/real-north-nashik-tarpa.jpg',
    artImageLocation: 'पारंपरिक आदिवासी तारपा नृत्य, नाशिक-अहिल्यानगर सीमाभाग',
    artImageSource: 'Wikimedia Commons (Tarpa Dance, North Maharashtra Tribes)',
    fortImage: '/assets/images/forts/harishchandragad-fort.jpg',
    fortImageLocation: 'हरिश्चंद्रगड दुर्ग, अहिल्यानगर-नाशिक सीमा (उत्तर महाराष्ट्र)',
    fortImageSource: 'पुरातत्त्व संचालनालय महाराष्ट्र शासन',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'नाशिक गॅझेटिअर व MTDC सिंहस्थ सर्किट दस्तऐवज',
    lifestyle: 'द्राक्ष व कांदा शेती, त्र्यंबकेश्वरची वैदिक परंपरा, कळसूबाई-हरिश्चंद्रगड ट्रेकिंग आणि वारकरी भक्तिभाव.',
    cultureHighlights: [
      'नाशिक-त्र्यंबकेश्वर सिंहस्थ कुंभमेळा (१२ वर्षांनी)',
      'पुण्यश्लोक अहिल्यादेवी होळकर यांनी बांधलेले घाट व बारवा',
      'सप्तशृंगी देवी — महाराष्ट्राचे साडेतीन शक्तिपीठांपैकी अर्धपीठ',
      'शिर्डी साईबाबा भक्ती व विश्वशांती केंद्र'
    ],
    forts: ['साल्हेर-मुल्हेर (महाराष्ट्रातील सर्वोच्च किल्ला)', 'हरिश्चंद्रगड', 'अहिवंत', 'अंकाई-टंकाई', 'अहमदनगर भुईकोट'],
    temples: ['त्र्यंबकेश्वर ज्योतिर्लिंग', 'सप्तशृंग निवासिनी (वणी)', 'काळाराम मंदिर (पंचवटी)', 'शिर्डी साईबाबा'],
    gramdevats: ['कालिका माता (नाशिक)', 'विशाल गणपती (अहिल्यानगर)', 'रेणुका माता (धामणगाव)'],
    stapleFoods: ['नाशिक मिसळ', 'बाजरीची भाकरी व ठेचा', 'मांडे-आमटी', 'द्राक्षांची वाईन व प्रक्रिया पदार्थ'],
    jatras: ['सप्तशृंगी चैत्रोत्सव यात्रा', 'त्र्यंबकेश्वर शिवरात्र यात्रा', 'शिर्डी रामनवमी उत्सव'],
    folkArts: ['गोंधळ', 'शाहीर परंपरा', 'वारकरी संकीर्तन', 'आदिवासी तारपा नृत्य'],
    cultureProfile: {
      language: 'नाशिकरी मराठी, अहमदनगरी ग्रामीण व डांगी बोली',
      lifestyle: 'द्राक्ष व कांदा शेती, त्र्यंबकेश्वर वैदिक परंपरा, कळसूबाई ट्रेकिंग आणि वारकरी भक्तिभाव.',
      foodCulture: 'तर्रीदार नाशिक मिसळ, चुलीवरची बाजरी भाकरी, शेवगा आमटी आणि द्राक्षांचे वैविध्य.',
      signatureDishes: ['नाशिक मिसळ', 'बाजरीची भाकरी व ठेचा', 'मांडे-आमटी', 'सुकं मटण थाळी'],
      festivals: ['सिंहस्थ कुंभमेळा', 'सप्तशृंगी चैत्रोत्सव', 'त्र्यंबकेश्वर महाशिवरात्र', 'रामनवमी'],
      folkArts: ['गोंधळ व जागरण', 'शाहीर परंपरा', 'वारकरी संकीर्तन', 'तारपा आदिवासी नृत्य'],
      forts: ['साल्हेर-मुल्हेर', 'हरिश्चंद्रगड', 'अंकाई-टंकाई', 'अहमदनगर भुईकोट'],
      temples: ['त्र्यंबकेश्वर ज्योतिर्लिंग', 'सप्तशृंगी देवी', 'काळाराम मंदिर', 'शिर्डी साईबाबा']
    }
  },
  {
    id: 'mumbai_mmr',
    name: 'मुंबई महानगर प्रदेश (Mumbai Metropolitan Region)',
    nameEn: 'Mumbai MMR',
    icon: '🏙️',
    marathiName: 'उपनगरीय किनारपट्टी, साल्सेट बेट व आर्थिक राजधानी',
    districts: ['मुंबई शहर', 'मुंबई उपनगर', 'ठाणे शहर', 'नवी मुंबई'],
    tagline: 'आगरी-कोळी मूळ रहिवासी, छत्रपती शिवाजी महाराज टर्मिनस जागतिक वारसा, आणि आधुनिक व्यापार केंद्र',
    primaryDialects: ['मुंबईया बोली (स्लँग)', 'आगरी-कोळी बोली', 'प्रमाण प्रशासकीय मराठी'],
    heroImage: '/assets/images/real-mumbai-csmt.jpg',
    heroPosition: 'center 35%',
    heroImageLocation: 'छत्रपती शिवाजी महाराज टर्मिनस (CSMT जागतिक वारसा), मुंबई',
    heroImageSource: 'UNESCO World Heritage Dossier / Wikimedia Commons',
    lifestyleImage: '/assets/images/real-mumbai-gateway.jpg',
    lifestyleImageLocation: 'गेटवे ऑफ इंडिया व मुंबई बंदर परिसर, मुंबई',
    lifestyleImageSource: 'महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) / पुराभिलेख',
    foodImage: '/assets/images/real-vada-pav.jpg',
    foodImageLocation: 'मुंबईचा जगप्रसिद्ध वडापाव, मुंबई महानगर प्रदेश',
    foodImageSource: 'Wikimedia Commons (Authentic Mumbai Vada Pav)',
    artImage: '/assets/images/real-ganesh-utsav.jpg',
    artImageLocation: 'मुंबईतील भव्य गणेशोत्सव मिरवणूक, मुंबई MMR',
    artImageSource: 'Wikimedia Commons (Mumbai Ganesh Utsav Procession)',
    fortImage: '/assets/images/forts/vasai-fort.jpg',
    fortImageLocation: 'वसई भुईकोट व जलदुर्ग (बाजीराव पेशवे विजय स्मारक), ठाणे-पालघर MMR',
    fortImageSource: 'पुरातत्त्व संचालनालय महाराष्ट्र शासन',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'UNESCO World Heritage Dossier (CSMT & Art Deco); बृहन्मुंबई महानगरपालिका पुराभिलेख',
    lifestyle: 'महानगरीय वेगवान जीवन, लोकल ट्रेन संस्कृती, गिरणगाव कामगार इतिहास आणि समृद्ध कोळीवाडे.',
    cultureHighlights: [
      'मुंबईचा राजा व लालबागचा राजा सार्वजनिक गणेशोत्सव',
      'वेसावे, माहीम, वरळी कोळीवाड्यांची मत्स्य संस्कृती',
      'गिरणगाव (कापड गिरणी) कामगार लढा व शाहिरी परंपरा',
      'व्हिक्टोरियन गोथिक व आर्ट डेको वास्तुकला (UNESCO World Heritage)'
    ],
    forts: ['शिवडी किल्ला', 'वांद्रे किल्ला (कॅस्टेला दी अगुआडा)', 'माहीम किल्ला', 'वसई भुईकोट किल्ला'],
    temples: ['मुंबादेवी मंदिर (मुंबईची कुलस्वामिनी)', 'सिद्धिविनायक (दादर-प्रभादेवी)', 'महालक्ष्मी मंदिर', 'बाबुलनाथ'],
    gramdevats: ['मुंबादेवी (मुंबई शहराचे नाव ज्यांच्यावरून पडले)', 'शीतलादेवी (माहीम)', 'गावदेवी (गिरगाव)'],
    stapleFoods: ['वडापाव', 'बॉम्बे डक (बोंबील फ्राय)', 'कोळी फिश करी', 'पावभाजी', 'मिसळ पाव'],
    jatras: ['माउंट मेरी वांद्रे फेअर', 'माहीम मखदूम शाह दर्गा उरूस', 'मुंबादेवी जत्रा'],
    folkArts: ['कोळी गीते व नृत्य', 'कामगार शाहिरी व पोवाडे', 'नाटक (मराठी प्रायोगिक व व्यावसायिक रंगभूमी)'],
    cultureProfile: {
      language: 'मुंबईया बोली, आगरी-कोळी बोली व प्रमाण प्रशासकीय मराठी',
      lifestyle: 'महानगरीय वेगवान जीवन, लोकल ट्रेन संस्कृती, गिरणगाव कामगार इतिहास आणि समृद्ध कोळीवाडे.',
      foodCulture: 'स्ट्रीट फूड, अस्सल आगरी-कोळी सीफूड, वडापाव, उसळ पाव आणि वैविध्यपूर्ण महानगरीय मेजवानी.',
      signatureDishes: ['वडापाव', 'बॉम्बे डक (बोंबील)', 'कोळी फिश करी', 'पावभाजी', 'मिसळ पाव'],
      festivals: ['लालबाग-परळ गणेशोत्सव', 'नारळी पौर्णिमा कोळी उत्सव', 'गोकुळाष्टमी दहीहंडी', 'गुढीपाडवा शोभायात्रा'],
      folkArts: ['कोळी लोकनृत्य', 'गिरणगाव कामगार शाहिरी', 'व्यावसायिक मराठी नाटक', 'संगीत नाटक'],
      forts: ['वसई किल्ला', 'वांद्रे किल्ला', 'शिवडी किल्ला', 'माहीम किल्ला'],
      temples: ['मुंबादेवी', 'सिद्धिविनायक (प्रभादेवी)', 'महालक्ष्मी मंदिर', 'बाबुलनाथ']
    }
  },
  {
    id: 'south_maharashtra',
    name: 'दक्षिण महाराष्ट्र (South Maharashtra & Borderlands)',
    nameEn: 'South Maharashtra',
    icon: '🛕',
    marathiName: 'वारणा-कृष्णा संगम, बेळगाव सीमाभाग व मलप्रभा खोरे',
    districts: ['कोल्हापूर दक्षिण', 'सांगली सीमाभाग', 'बेळगाव-निपाणी सीमावर्ती भाग'],
    tagline: 'सीमाभागातील मराठी भाषिक लढा, कुरुंदवाड वाद्य कला, आणि वारणा खोऱ्याची सहकार चळवळ',
    primaryDialects: ['सीमावर्ती कोल्हापुरी-कन्नड मिश्र बोली', 'कुरुंदवाडी मराठी', 'मल्हार बोली'],
    heroImage: '/assets/images/real-south-kolhapur-mahalaxmi.jpg',
    heroImageLocation: 'श्री महालक्ष्मी (अंबाबाई) मंदिर, कोल्हापूर, दक्षिण महाराष्ट्र',
    heroImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व कोल्हापूर देवस्थान व्यवस्थापन',
    lifestyleImage: '/assets/images/real-kolhapur-kusti.jpg',
    lifestyleImageLocation: 'कोल्हापूर लाल मातीतील कुस्ती तालीम आखाडा, दक्षिण महाराष्ट्र',
    lifestyleImageSource: 'कोल्हापूर कुस्तीगीर परिषद व क्रीडा पुराभिलेख',
    foodImage: '/assets/images/real-south-jhunka-bhakar.jpg',
    foodImageLocation: 'झुणका भाकर व ठेचा, दक्षिण महाराष्ट्र व सीमाभाग ग्रामीण खाद्यसंस्कृती',
    foodImageSource: 'Wikimedia Commons (Authentic Jhunka Bhakar)',
    artImage: '/assets/images/real-south-kopeshwar-khidrapur.jpg',
    artImageLocation: 'कोपेश्वर मंदिर स्वर्गमंडप शिलाहार वास्तुकला, खिद्रापूर, कोल्हापूर (दक्षिण महाराष्ट्र)',
    artImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) / Wikimedia Commons',
    fortImage: '/assets/images/real-panhala-fort.jpg',
    fortImageLocation: 'किल्ले पन्हाळा (तीन दरवाजा व अंबरखाना), कोल्हापूर, दक्षिण महाराष्ट्र',
    fortImageSource: 'भारतीय पुरातत्त्व सर्वेक्षण (ASI) व पुराभिलेख',
    imageVerified: true,
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceTier: SOURCE_TIERS.TIER_1,
    reference: 'सीमाभाग इतिहास संशोधन समिती व कोल्हापूर पुराभिलेख संग्रह',
    lifestyle: 'सहकारी साखर कारखाने, कुस्ती तालमी, शास्त्रीय संगीत वाद्य निर्मिती आणि मराठी अस्मितेचा अखंड लढा.',
    cultureHighlights: [
      'मिरज — भारतीय शास्त्रीय वाद्य (तंबोरा, सतार) निर्मितीचे जागतिक केंद्र',
      'सीमाभागातील (बेळगाव, निपाणी, कारवार) मराठी भाषिक लढा व साहित्य संमेलने',
      'छत्रपती राजाराम महाराज व शाहू महाराजांचा बहुजन शिक्षण वारसा',
      'नरसोबाची वाडी — दत्त संप्रदायाचे पवित्र राजधानी पीठ'
    ],
    forts: ['पारगड (चंदगड)', 'भूदरगड', 'सामनगड', 'वल्लभगड'],
    temples: ['श्री नृसिंह सरस्वती दत्त मंदिर (नरसोबाची वाडी)', 'कुरुंदवाड गणेश मंदिर', 'खिद्रापूर कोपेश्वर (शिलाहार वास्तुकला)'],
    gramdevats: ['कपिलतीर्थ महालक्ष्मी', 'कुरुंदवाड भैरवनाथ', 'चंदगड रवळनाथ'],
    stapleFoods: ['धारवाडी पेढा / बेळगावी कुंदा', 'मिरजची भेळ', 'काकडीची तांबडी उसळ', 'कुरुंदवाड पेढे'],
    jatras: ['नरसोबाची वाडी गुरुद्वादशी यात्रा', 'खिद्रापूर कोपेश्वर शिवरात्र उत्सव'],
    folkArts: ['शास्त्रीय वाद्य निर्मिती व वादन', 'कुस्ती फड शौर्य गाणी', 'गोंधळी परंपरा'],
    cultureProfile: {
      language: 'सीमावर्ती कोल्हापुरी, कुरुंदवाडी मराठी व मल्हार बोली',
      lifestyle: 'सहकारी साखर पट्टा, कुस्ती तालमी, शास्त्रीय वाद्य निर्मिती आणि मराठी भाषिक अस्मिता.',
      foodCulture: 'दूध, खवा व गुळाचे पारंपरिक मिष्टान्न (कुंदा, पेढा), झणझणीत काकडी उसळ व मिरज भेळ.',
      signatureDishes: ['बेळगावी कुंदा', 'कुरुंदवाड पेढे', 'मिरज भेळ', 'काकडी तांबडी उसळ'],
      festivals: ['नरसोबाची वाडी गुरुद्वादशी', 'खिद्रापूर शिवरात्र', 'दत्त जयंती', 'कुस्ती मैदाने'],
      folkArts: ['मिरज सतार-तंबोरा निर्मिती', 'कुस्ती फड शौर्य गाणी', 'गोंधळ', 'दत्त भजने'],
      forts: ['पारगड', 'भूदरगड', 'सामनगड', 'वल्लभगड'],
      temples: ['नरसोबाची वाडी', 'खिद्रापूर कोपेश्वर', 'कुरुंदवाड गणेश', 'चंदगड रवळनाथ']
    }
  }
];

// ==========================================
// 2. MAHARASHTRA'S DIALECTS & VOICE ARCHIVE
// ==========================================
export const DIALECTS_DATA = [
  {
    id: 'praman_marathi',
    name: 'प्रमाण मराठी (Standard Marathi)',
    region: 'महाराष्ट्र राज्यभर (प्रशासकीय, साहित्य, प्रसारमाध्यमे)',
    speakersApprox: '८+ कोटी',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'मराठी भाषा विभाग, महाराष्ट्र शासन (marathi.gov.in) व साहित्य अकादमी',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: 'व्याकरणदृष्ट्या प्रमाणित, बालभारती व वृत्तपत्रांमधून वापरले जाणारे अधिकृत रूप.',
    proverb: 'अति तिथे माती.',
    proverbMeaning: 'कोणत्याही गोष्टीचा अतिरेक नुकसानकारक ठरतो.',
    sampleSentence: 'तू कुठे चालला आहेस?',
    englishTranslation: 'Where are you going?'
  },
  {
    id: 'malwani',
    name: 'मालवणी (Malwani)',
    region: 'सिंधुदुर्ग व दक्षिण रत्नागिरी (कोकण)',
    speakersApprox: '२५+ लाख',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'डॉ. अरुण टिकेकर व मालवणी बोली शब्दकोश, मुंबई विद्यापीठ',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: 'गोड, वेगवान आणि लयबद्ध हेल. क्रियापदांमध्ये ‘य’ आणि ‘स’ चा वैशिष्ट्यपूर्ण वापर (उदा. खयतस, जातस).',
    proverb: 'खायचो तर मासो, नाहीतर उपाशीच बसो.',
    proverbMeaning: 'मिळाले तर मनासारखे उत्तम मिळायला हवे, नाहीतर तडजोड नको.',
    sampleSentence: 'तुका खय वचुक व्हया? तू खय चाललास रे?',
    englishTranslation: 'Where do you want to go? Where are you going?'
  },
  {
    id: 'varhadi',
    name: 'वऱ्हाडी (Varhadi)',
    region: 'अमरावती, अकोला, यवतमाळ, बुलढाणा, वाशीम (विदर्भ)',
    speakersApprox: '१.५+ कोटी',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'विदर्भ साहित्य संघ व संत गाडगेबाबा अमरावती विद्यापीठ मराठी विभाग',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: "अत्यंत रसाळ, स्पष्ट उच्चार, 'नाही' ऐवजी 'नाय' किंवा 'न्हई', आणि आपुलकीचे संबोधन (उदा. 'भाऊ', 'माय').",
    proverb: 'हातचं सोडून पळत्याच्या पाठी लागनं.',
    proverbMeaning: 'हातातली निश्चित गोष्ट सोडून अनिश्चित गोष्टीच्या मागे लागणे मूर्खपणाचे ठरते.',
    sampleSentence: 'तू कोठी चालला बे? कायले घाई करत हायिस?',
    englishTranslation: 'Where are you going, brother? Why are you in such a hurry?'
  },
  {
    id: 'ahirani',
    name: 'अहिराणी / खानदेशी (Ahirani / Khandeshi)',
    region: 'जळगाव, धुळे, नंदुरबार (खानदेश)',
    speakersApprox: '६०+ लाख',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'कवयित्री बहिणाबाई चौधरी उत्तर महाराष्ट्र विद्यापीठ, जळगाव',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: 'प्राचीन प्राकृत आणि शौरसेनीच्या प्रभावातून घडलेली, बहिणाबाईंच्या अजरामर ओव्यांनी समृद्ध भाषा.',
    proverb: 'मन वढाय वढाय, उभ्या पिकातलं ढोर.',
    proverbMeaning: 'मन हे पिकात चरणाऱ्या गुरासारखे असते, जे सतत इकडे तिकडे भटकत राहते.',
    sampleSentence: 'तू कठे जायी राहिना? कायले चालना?',
    englishTranslation: 'Where are you going? Why are you leaving?'
  },
  {
    id: 'agri',
    name: 'आगरी (Agri)',
    region: 'ठाणे, रायगड, पालघर, मुंबई उपनगरे',
    speakersApprox: '३०+ लाख',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_3,
      source: 'अखिल भारतीय आगरी समाज परिषद व ठाणे जिल्हा गॅझेटिअर',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: 'ठसकेबाज, उच्चारणात जोरकसपणा, मिठागरे व शेती करणाऱ्या आगरी बांधवांची पारंपरिक भाषा.',
    proverb: 'आपली पाठ आपल्याला दिसत नाय.',
    proverbMeaning: 'स्वतःचे दोष स्वतःला कधीही चटकन दिसत नाहीत.',
    sampleSentence: 'तु कवा चाललास? खय जाशील आता?',
    englishTranslation: 'Where are you heading right now?'
  },
  {
    id: 'koli',
    name: 'कोळी बोली (Koli)',
    region: 'मुंबई व कोकण किनारपट्टीचे कोळीवाडे',
    speakersApprox: '१५+ लाख',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'मुंबई विद्यापीठ भाषाशास्त्र केंद्र व कोळी संस्कृती अभ्यास',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: 'समुद्राच्या लाटांसारखी चंचल व वेगवान भाषा; सागरी वारे, मासे व निसर्गाशी संबंधित हजारो अनन्य शब्द.',
    proverb: 'दर्याचा राजा कोळी, जाळ्यात आला मासा भोळी.',
    proverbMeaning: 'सागरावर कोळ्यांचेच राज्य चालते.',
    sampleSentence: 'तू काई गेलो होतास? खय चाललो रे दादू?',
    englishTranslation: 'Where had you been? Where are you going, brother?'
  },
  {
    id: 'marathwadi',
    name: 'मराठवाडी बोली (Marathwadi)',
    region: 'छत्रपती संभाजीनगर, बीड, जालना, लातूर, धाराशिव',
    speakersApprox: '१.२+ कोटी',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'डॉ. बाबासाहेब आंबेडकर मराठवाडा विद्यापीठ मराठी विभाग',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: "संतांच्या भाषेचा थेट प्रभाव; 'चाललायस' ऐवजी 'चाल्लास', 'का' ऐवजी 'कशानं', आदरातिथ्याचा जिव्हाळा.",
    proverb: 'रातीच्या गर्भात उद्याचा उषःकाल असतो.',
    proverbMeaning: 'कठीण संकटांच्या पोटातूनच नवी आशा जन्माला येते.',
    sampleSentence: 'कुठं चाललास रं गड्या? कधी परत येशील?',
    englishTranslation: 'Where are you off to, my friend? When will you return?'
  },
  {
    id: 'zadi_boli',
    name: 'झाडीबोली (Zadi Boli)',
    region: 'चंद्रपूर, गडचिरोली, भंडारा, गोंदिया (झाडीपट्टी)',
    speakersApprox: '३५+ लाख',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'झाडीबोली साहित्य मंडळ व राष्ट्रसंत तुकडोजी महाराज नागपूर विद्यापीठ',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    characteristics: 'दंडार व झाडीपट्टी रंगभूमीच्या शेकडो नाटकांतून जिवंत राहिलेली समृद्ध वनवासी-ग्रामीण भाषा.',
    proverb: 'झाडाची सावली झाडालाच नाही भेटत.',
    proverbMeaning: 'परोपकारी माणसाचा फायदा स्वतःपेक्षा इतरांनाच अधिक होतो.',
    sampleSentence: 'तू कुनीकडे चाललास? नाटक पाहाले नाय येशीन का?',
    englishTranslation: 'Where are you going? Will you not come to watch the play?'
  }
];

// Interactive phrase comparison dictionary
export const PHRASE_COMPARISONS = [
  {
    id: 'where_going',
    phraseLabel: 'तू कुठे चालला आहेस? (Where are you going?)',
    standardMarathi: 'तू कुठे चालला आहेस?',
    standard: 'तू कुठे चालला आहेस?',
    english: 'Where are you going?',
    comparisons: [
      { dialect: 'मालवणी', region: 'सिंधुदुर्ग (कोकण)', text: 'तू खय चाललास रे?', notes: '‘कुठे’ ऐवजी ‘खय’ व विशिष्ट हेल' },
      { dialect: 'वऱ्हाडी', region: 'विदर्भ', text: 'तू कोठी चालला बे?', notes: '‘कोठी’ व मित्रांसाठी ‘बे’ संबोधन' },
      { dialect: 'अहिराणी', region: 'खानदेश', text: 'तू कठे जायी राहिना?', notes: '‘राहिना’ चालू वर्तमानकाळ प्रत्यय' },
      { dialect: 'आगरी', region: 'ठाणे-रायगड', text: 'तु खय चाललास आता?', notes: 'जोरकस व स्पष्ट उच्चार' },
      { dialect: 'कोळी बोली', region: 'मुंबई किनारपट्टी', text: 'खय चाललो रे दादू?', notes: '‘दादू’ आपुलकीचे संबोधन' },
      { dialect: 'मराठवाडी', region: 'मराठवाडा', text: 'कुठं चाललास रं गड्या?', notes: '‘गड्या’ व नादयुक्त हेल' }
    ]
  },
  {
    id: 'what_eating',
    phraseLabel: 'तू काय खाल्ले आहेस? (What did you eat?)',
    standardMarathi: 'तू जेवलास का? काय खाल्ले?',
    standard: 'तू जेवलास का? काय खाल्ले?',
    english: 'Have you eaten? What did you eat?',
    comparisons: [
      { dialect: 'मालवणी', region: 'सिंधुदुर्ग (कोकण)', text: 'तू जेवलोस काय? काय खाल्यान?', notes: '‘खाल्यान’ भूतकाळ रूप' },
      { dialect: 'वऱ्हाडी', region: 'विदर्भ', text: 'जेवन झालं का तुवं? काय खाल्लं?', notes: '‘तुवं’ (तुझे) सर्वनाम' },
      { dialect: 'अहिराणी', region: 'खानदेश', text: 'तू जेवाना का रे? काय खाधं?', notes: '‘खाधं’ प्राकृत प्रभाव' },
      { dialect: 'आगरी', region: 'ठाणे-रायगड', text: 'जेवलास का रे पोरा? काय खाल्लास?', notes: '‘पोरा’ आपुलकीचा उच्चार' },
      { dialect: 'कोळी बोली', region: 'मुंबई किनारपट्टी', text: 'तुका जेवूक भेटलं काय? काय खाल्लीस?', notes: '‘जेवूक’ प्रत्यय' },
      { dialect: 'मराठवाडी', region: 'मराठवाडा', text: 'जेवण केलं का रं? काय खालंत?', notes: '‘खालंत’ आदरातिथ्य' }
    ]
  },
  {
    id: 'come_home',
    phraseLabel: 'आमच्या घरी ये (Come to our home)',
    standardMarathi: 'कधीतरी आमच्या घरी या.',
    standard: 'कधीतरी आमच्या घरी या.',
    english: 'Please visit our home sometime.',
    comparisons: [
      { dialect: 'मालवणी', region: 'सिंधुदुर्ग (कोकण)', text: 'येवा, आमगेल्या घरा येत व्हया!', notes: '‘आमगेल्या’ मालवणी विशेषण' },
      { dialect: 'वऱ्हाडी', region: 'विदर्भ', text: 'कव्हातरी आमचे घरी येजा ना भाऊ!', notes: '‘येजा’ व ‘भाऊ’ संबोधन' },
      { dialect: 'अहिराणी', region: 'खानदेश', text: 'कव्हातरी आमना घरा येजो भो!', notes: '‘आमना’ व ‘भो’ प्रत्यय' },
      { dialect: 'आगरी', region: 'ठाणे-रायगड', text: 'आमच्या घरा येवूक व्हवा तवा!', notes: '‘व्हवा’ (हवे) वापर' },
      { dialect: 'कोळी बोली', region: 'मुंबई किनारपट्टी', text: 'आमचे खोपीवर येवूक पायजे!', notes: '‘खोपीवर’ (घरावर) पारंपारिक शब्द' },
      { dialect: 'मराठवाडी', region: 'मराठवाडा', text: 'आमच्या वाड्यावर या की राव!', notes: '‘वाड्यावर या की राव’ मराठवाडी लहेजा' }
    ]
  },
  {
    id: 'how_are_you',
    phraseLabel: 'तू कसा आहेस? (How are you?)',
    standardMarathi: 'तू कसा आहेस? सर्व ठीक आहे ना?',
    standard: 'तू कसा आहेस? सर्व ठीक आहे ना?',
    english: 'How are you? Is everything fine?',
    comparisons: [
      { dialect: 'मालवणी', region: 'सिंधुदुर्ग (कोकण)', text: 'कसो आहास रे? सगळा बरा आसा ना?', notes: '‘कसो आहास’ मालवणी व्याकरण' },
      { dialect: 'वऱ्हाडी', region: 'विदर्भ', text: 'कसा हायिस बे? बरी आहे ना तब्बेत?', notes: '‘हायिस’ वर्तमानकाळ क्रियापद' },
      { dialect: 'अहिराणी', region: 'खानदेश', text: 'कसा शे भो? सर्व ठीकठाक शे ना?', notes: '‘शे’ (आहे) चा वैशिष्ट्यपूर्ण वापर' },
      { dialect: 'आगरी', region: 'ठाणे-रायगड', text: 'कसा हायेस रे? बरं हाय ना?', notes: '‘बरं हाय ना’ ठेका' },
      { dialect: 'कोळी बोली', region: 'मुंबई किनारपट्टी', text: 'कसा आसोस दोस्ता? मजेत ना?', notes: '‘आसोस’ कोळी बोली रूप' },
      { dialect: 'मराठवाडी', region: 'मराठवाडा', text: 'कसा हायेस रं बापू? बरं चाललंय ना?', notes: '‘बापू’ मराठवाडी जिव्हाळा' }
    ]
  }
];

// ==========================================
// 3. MAHARASHTRA FOOD CULTURE & PROVENANCE
// ==========================================
export const FOOD_CULTURE_DATA = [
  {
    id: 'sol_kadhi',
    regionId: 'kokan',
    name: 'सोलकढी (Sol Kadhi)',
    region: 'कोकण किनारपट्टी (सिंधुदुर्ग, रत्नागिरी, रायगड)',
    category: 'पारंपरिक पेय / पाचक',
    heroImage: '/assets/images/real-solkadhi.jpg',
    ingredients: ['ताजे नारळाचे दूध', 'रसरशीत आगळ (ताजा कोकम अर्क)', 'लसूण', 'हिरवी मिरची', 'जिरे', 'बारीक चिरलेली कोथिंबीर'],
    traditionalPrep: 'ताजा नारळ किसून त्याचे घट्ट दूध काढले जाते. त्यात कोकमाचा आंबट-लाल अर्क (आगळ), ठेचलेला लसूण आणि मिरची मिसळून गुलाबी रंगाची चविष्ट सोलकढी बनते. ही कधीही उकळली जात नाही.',
    occasion: 'दुपारच्या जेवणानंतर पाचक म्हणून; कोकणी मासळी व मटणाच्या जेवणात अविभाज्य घटक.',
    communityAssociation: 'कोकणातील सर्व समाज, कोळी, भंडारी आणि ब्राह्मण कुटुंबांत पिढ्यानपिढ्या चालत आलेले पेय.',
    history: 'कोकणातील दमट आणि उष्ण हवामानाला तोंड देण्यासाठी तसेच पचनक्रिया सुलभ करण्यासाठी नारळ आणि कोकमाचा वापर प्राचीन काळापासून केला गेला.',
    whereToExperience: 'मालवण, देवबाग, गणपतीपुळे, अलिबाग मधील स्थानिक घरगुती खानावळी.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) — Flavors of Maharashtra',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'tambda_pandhra_rassa',
    regionId: 'kolhapur',
    name: 'कोल्हापुरी तांबडा-पांढरा रस्सा (Tambda & Pandhra Rassa)',
    region: 'कोल्हापूर',
    category: 'शाही मांसाहारी रस्सा / मटण थाळी',
    heroImage: '/assets/images/real-paschim-kolhapuri-thali.jpg',
    ingredients: ['ताजे मटण स्टॉक (अर्क)', 'लवंगी मिरची व कोल्हापुरी कांदा-लसूण मसाला', 'दालचिनी, लवंग, जायपत्री खडे मसाले', 'पांढऱ्या रश्शासाठी: नारळाचे दूध, खसखस, पांढरे तीळ, काजू पूड'],
    traditionalPrep: 'मटण उकडताना निघणाऱ्या शुद्ध अर्काचे दोन भाग केले जातात. एका भागात कोल्हापुरी तिखट व गरम मसाल्यांची फोडणी देऊन झणझणीत ‘तांबडा रस्सा’ बनतो; तर दुसऱ्या भागात खसखस, सुंठ, तीळ व नारळाच्या दुधाचा सौम्य पण अत्यंत चवदार ‘पांढरा रस्सा’ तयार केला जातो.',
    occasion: 'कुस्तीच्या फडातील मल्लांचा आहार; कोल्हापुरातील सण, पाहुणचार आणि रविवारची मेजवानी.',
    communityAssociation: 'छत्रपती शाहू महाराजांच्या दरबारी आणि मराठा सरदार घराण्यांच्या शिकार मेजवान्यांशी ऐतिहासिक नाते.',
    history: 'कोल्हापूरच्या लाल मातीतील मल्लांना प्रथिनयुक्त आणि पाचक पोषण देण्यासाठी राजर्षी शाहूंच्या काळात या रश्शाच्या पाककृतीला विशेष राजमान्यता लाभली.',
    whereToExperience: 'कोल्हापुरातील भाऊसिंगजी रोड, खासबाग मैदान परिसरातील पारंपरिक खानावळी.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'कोल्हापूर दर्शन — इतिहास व खाद्यसंस्कृती संशोधन ग्रंथ',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'saoji_mutton',
    regionId: 'vidarbha',
    name: 'सावजी मटण व रस्सा (Saoji Cuisine)',
    region: 'नागपूर व वऱ्हाड (विदर्भ)',
    category: 'झणझणीत पारंपरिक मांसाहारी',
    heroImage: '/assets/images/real-vidarbha-saoji.jpg',
    ingredients: ['काळे मसाले (३२ दुर्मीळ मसाल्यांचे मिश्रण)', 'दगडीफूल', 'जायपत्री', 'खसखस', 'नागपुरी भिवपुरी मिरची', 'ताजे मटण'],
    traditionalPrep: 'लोखंडी कढईत मंद आचेवर ३२ खडे मसाले भाजून बनवलेल्या गुप्त सावजी मसाल्यामध्ये मटण तासनतास शिजवले जाते. यातील झणझणीतपणा आणि लाल रंगाचा तवंग तोंडाला पाणी आणणारा असतो.',
    occasion: 'विदर्भातील कौटुंबिक स्नेहसंमेलन, हिवाळ्यातील मेजवानी, होळी व पोळा उत्सव.',
    communityAssociation: 'विदर्भातील हलबा कोष्टी (सावजी) विणकर समाजाची ही शतकानुशतके जपलेली गुप्त पाककृती आहे.',
    history: 'हातमागावर काम करणाऱ्या विणकर मजुरांना शारीरिक थकवा दूर करण्यासाठी आणि उत्साह टिकवण्यासाठी हा उष्ण, मसालेदार आहार सुरू झाला.',
    whereToExperience: 'नागपुरातील गांधीबाग, इतवारी आणि महाल परिसरातील अस्सल सावजी भोजनालये.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_3,
      source: 'विदर्भ खाद्यसंस्कृती कोश — नागपूर हेरिटेज फोरम',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'puran_poli',
    regionId: 'paschim',
    name: 'पुरणपोळी व कटाची आमटी (Puran Poli & Katachi Amti)',
    region: 'पश्चिम महाराष्ट्र (पुणे, सातारा, सांगली)',
    category: 'गोड सणासुदीचे नैवेद्य',
    heroImage: '/assets/images/real-puran-poli.jpg',
    ingredients: ['हरभरा डाळ', 'सेंद्रिय गूळ किंवा साखर', 'जायफळ-वेलची पूड', 'गव्हाची कणीक/मैदा', 'शुद्ध साजूक तूप'],
    traditionalPrep: 'डाळ शिजवून गूळ घालून मंद आचेवर घट्ट पुरण भाजले जाते. पुरणयंत्रातून ते मऊ केले जाते. कणकेच्या गोळ्यात पुरण भरून पातळ पोळी लाटून लोखंडी तव्यावर तुपात भाजली जाते. डाळीच्या उकडलेल्या पाण्याचा वापर करून तिखट-आंबट ‘कटाची आमटी’ बनते.',
    occasion: 'होळी (धुलिवंदन), गुढीपाडवा, बैलपोळा, नागपंचमी व सर्व आनंदाचे सण.',
    communityAssociation: 'महाराष्ट्रातील अठरापगड जाती-धर्मांत शतकानुशतके पूजनीय मानले जाणारे महाप्रसाद अन्न.',
    history: 'संत साहित्यात (ज्ञानेश्वरी व संत एकनाथ गाथा) पुरणपोळीचे उल्लेख आढळतात. १२ व्या शतकातील मानसोल्लास ग्रंथात ‘पोलिका’ असा प्राचीन उल्लेख आहे.',
    whereToExperience: 'पुणे, सातारा, नाशिक व पंढरपूर येथील पारंपरिक मेजवान्या आणि घरगुती सण.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'मानसोल्लास ग्रंथ (१२ वे शतक) व महाराष्ट्र शासन संस्कृती विभाग',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'khandeshi_shevbhaji',
    regionId: 'khandesh',
    name: 'खानदेशी शेवभाजी व कळण्याची भाकरी (Khandeshi Shev Bhaji)',
    region: 'खानदेश (जळगाव, धुळे, नंदुरबार)',
    category: 'शाकाहारी झणझणीत भाजी',
    heroImage: '/assets/images/real-khandesh-shev-bhaji.jpg',
    ingredients: ['खानदेशी जाड तिखट शेव', 'कांदा-खोबऱ्याचे काळे वाटण (खोबरं विस्तवावर भाजून केलेले)', 'गरम मसाला', 'उडीद व ज्वारीची कळण्याची भाकरी'],
    traditionalPrep: 'कांदा आणि सुके खोबरे थेट चुलीच्या निखाऱ्यावर काळे होईपर्यंत भाजले जाते. त्याचे घट्ट वाटण बनवून तेलाचा भरपूर तवंग येईपर्यंत फोडणी दिली जाते. ताटात वाढताना वरून कुरकुरीत शेव घालून गरम कळण्याच्या भाकरीसोबत खाल्ले जाते.',
    occasion: 'रोजचे शेतकरी दुपारचे जेवण, शेतातील आखाडी पार्टी, पाहुण्यांचे स्वागत.',
    communityAssociation: 'खानदेशातील लेवा पाटील, मराठा व अहीर शेतकरी कुटुंबांची स्वाक्षरी डिश.',
    history: 'तापी खोऱ्यातील शेतात काम करणाऱ्या शेतकऱ्यांना त्वरित बनवता येणारी आणि भरपूर ऊर्जा देणारी भाजी म्हणून लोकप्रिय झाली.',
    whereToExperience: 'धुळे-जळगाव महामार्गावरील स्थानिक ढाबे व अमळनेर-पारोळ्याची भोजनालये.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'खानदेश दर्शन व खानदेशी खाद्य अभ्यास, उत्तर महाराष्ट्र विद्यापीठ',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'ukadiche_modak',
    regionId: 'kokan',
    name: 'उकडीचे मोदक (Ukadiche Modak)',
    region: 'कोकण (रत्नागिरी, सिंधुदुर्ग, रायगड)',
    category: 'गणेशोत्सवाचा मुख्य नैवेद्य / गोड',
    heroImage: '/assets/images/real-ukadiche-modak.jpg',
    ingredients: ['तांदळाची सुवासिक पिठी (आंबेमोहोर)', 'ओला खोवलेला नारळ', 'सेंद्रिय गूळ', 'जायफळ-वेलची', 'शुद्ध साजूक तूप'],
    traditionalPrep: 'पाण्यात थोडे तूप घालून उकड काढली जाते. आतल्या सारणासाठी ओला नारळ व गूळ परतून वेलची मिसळली जाते. हातावर पाकळ्या पाडून सारण भरले जाते आणि हळदीच्या किंवा केळीच्या पानावर वाफवले जाते.',
    occasion: 'गणेश चतुर्थी, संकष्टी चतुर्थी आणि कौटुंबिक मंगल प्रसंग.',
    communityAssociation: 'श्री गणेशाचा आवडता नैवेद्य म्हणून संपूर्ण महाराष्ट्रात अनन्यसाधारण श्रद्धा.',
    history: 'ऋग्वेदात आणि गणेश पुराणात मोदकाचा देवदानवांच्या कथेतील संदर्भ आढळतो. पेशवेकालीन रोजकीर्दीत मोदकाच्या भोजनाचे शेकडो उल्लेख आहेत.',
    whereToExperience: 'पुणे, अलिबाग, गणपतीपुळे, दिवेआगर येथील गणेशोत्सवात.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'पेशवे दप्तर — गणेशोत्सव नोंदी व पुरातत्त्वीय संदर्भ',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'malvani_kombdi_vade',
    regionId: 'kokan',
    name: 'मालवणी कोंबडी वडे (Malvani Kombdi Vade)',
    region: 'कोकण (सिंधुदुर्ग व रत्नागिरी)',
    category: 'कोकणी शाही मेजवानी / मांसाहारी थाळी',
    heroImage: '/assets/images/real-kombdi-vade.jpg',
    ingredients: ['वडे पीठ (तांदूळ, चणा डाळ, उडीद डाळ, मेथी, धने, बडीशेप भाजून दळलेले पीठ)', 'गावरान चिकन', 'सुकं खोबरं-कांदा भाजलेले मालवणी वाटण', 'मालवणी मसाला व दालचिनी-तमालपत्र', 'कोकम आगळ व कढीपत्ता'],
    traditionalPrep: 'तांदूळ व विविध डाळी भाजून खास वड्यांचे पीठ तयार केले जाते. ते मळून गरम तेलात टम्म फुगवून कुरकुरीत वडे तळले जातात. सोबत ताज्या भाजलेल्या खोबऱ्याच्या वाटणातील रसरशीत मालवणी चिकन रस्सा व कांदा-लिंबू सर्व्ह केला जातो.',
    occasion: 'गौरी-गणपती विसर्जन मेजवानी, पाहुण्यांचे आदरातिथ्य, रविवारची खास मेजवानी.',
    communityAssociation: 'कोकणातील मराठा, कुणबी व सर्व स्थानिक समाजाचे लाडके पारंपारिक भोजन.',
    history: 'कोकणातील भातशेती आणि मसूर-उडीद पिकांच्या समतोलातून शरीराला भरपूर ऊर्जा देण्यासाठी वडे आणि रश्शाचा हा उत्कृष्ट संगम शतकानुशतके चालत आला आहे.',
    whereToExperience: 'मालवण, कुडाळ, सावंतवाडी आणि वेंगुर्ला येथील पारंपारिक स्थानिक खानावळी.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) कोकण खाद्य नोंद व सिंधुदुर्ग गॅझेटिअर',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'konkani_kolambi_bhat',
    regionId: 'kokan',
    name: 'कोकणी कोळंबी भात (Konkani Kolambi Bhat)',
    region: 'कोकण किनारपट्टी (मुंबई, ठाणे, रायगड, रत्नागिरी, सिंधुदुर्ग)',
    category: 'सागरी खाद्य / पारंपारिक भात प्रकार',
    heroImage: '/assets/images/real-kolambi-bhat.jpg',
    ingredients: ['ताजी समुद्राची कोळंबी (Prawns)', 'सुवासिक आंबेमोहोर किंवा बासमती तांदूळ', 'कोकम आगळ', 'ओले खोबरे व हिरवे वाटण (मिरची-कोथिंबीर-आले-लसूण)', 'दालचिनी, लवंग व कांदा'],
    traditionalPrep: 'ताजी कोळंबी हळद, मीठ आणि कोकमाच्या आगळात मॅरीनेट केली जाते. तेलात खडे मसाले आणि कांदा परतून हिरव्या वाटणात कोळंबी शिजवली जाते. त्यात सुवासिक तांदूळ मिसळून मंद वाफेवर दम देऊन हा रुचकर कोळंबी भात बनवला जातो.',
    occasion: 'नारळी पौर्णिमेनंतर मासेमारीचा हंगाम सुरू होताना, सुट्टीच्या दिवसांतील कौटुंबिक जेवण.',
    communityAssociation: 'कोकणातील कोळी, आगरी, भंडारी आणि मराठा किनारपट्टी बांधवांची खास स्वाक्षरी पाककृती.',
    history: 'अरबी समुद्रातील ताजी मासळी आणि सह्याद्रीच्या पायथ्याशी पिकणाऱ्या सुवासिक तांदळाचा मिलाफ साधणारी ही किनारपट्टीची समृद्ध पाककला आहे.',
    whereToExperience: 'अलिबाग, रेवस, मालवण व वर्सोवा कोळीवाडा परिसरातील अस्सल सीफूड भोजनालये.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'बॉम्बे गॅझेटिअर — सागरी आहार व मत्स्य व्यवसाय नोंदी',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'konkani_ghavane',
    regionId: 'kokan',
    name: 'कोकणी घावणे व नारळाची चटणी (Konkani Ghavane)',
    region: 'कोकण (रत्नागिरी, सिंधुदुर्ग, रायगड)',
    category: 'पारंपरिक नाश्ता / सकाळचा आहार',
    heroImage: '/assets/images/real-konkan-ghavane.jpg',
    ingredients: ['तांदळाचे बारीक पीठ', 'पाणी व चवीनुसार मीठ', 'ओल्या नारळाची चटणी किंवा गूळ-नारळाचे दूध (रसावळ)', 'भाजण्यासाठी बीडाचा तवा'],
    traditionalPrep: 'तांदळाच्या पिठात पाणी घालून पातळसर घोळ केला जातो. तापलेल्या बीडाच्या तव्यावर कांद्याने तेल लावून वाटीने पीठ गोलाकार पसरवले जाते. क्षणात जाळीदार, मऊ आणि लुसलुशीत पांढराशुभ्र घावणा तयार होतो.',
    occasion: 'सकाळचा पारंपरिक नाश्ता, सणावाराला किंवा आजारपणातून उठल्यावर सहज पचणारा सात्विक आहार.',
    communityAssociation: 'कोकणातील प्रत्येक घरोघरी सकाळच्या न्याहारीचा अविभाज्य भाग.',
    history: 'कोकणातील मुबलक तांदळाच्या पिकाचा वापर करून विना आंबवता (No Fermentation) झटपट बनवला जाणारा हा शतकानुशतके जुना नैसर्गिक आहार आहे.',
    whereToExperience: 'गणपतीपुळे, देवबाग, चिपळूण आणि गुहागर येथील होमस्टे व घरगुती खानावळी.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र राज्य लोकसाहित्य व पारंपारिक गृहपाककला संग्रह',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'olya_kajuchi_usal',
    regionId: 'kokan',
    name: 'ओल्या काजूची उसळ (Olya Kajuchi Usal)',
    region: 'कोकण (सिंधुदुर्ग व दक्षिण रत्नागिरी)',
    category: 'हंगामी पारंपरिक शाकाहारी मेजवानी',
    heroImage: '/assets/images/real-kaju-uswal.jpg',
    ingredients: ['झाडावरून तोडलेले ताजे ओले काजूगर (Tender Cashews)', 'ओले खोबरे व भाजलेला कांदा', 'मालवणी गरम मसाला', 'कोकम व कढीपत्ता', 'बारीक चिरलेली कोथिंबीर'],
    traditionalPrep: 'उन्हाळ्याच्या सुरुवातीला काजूच्या बोंडातून ताजे पांढरे ओले गर सोलून काढले जातात. ते कांदा-खोबऱ्याच्या पारंपरिक लाल वाटणात मंद आचेवर शिजवून सुग्रास आणि शाही उसळ बनवली जाते.',
    occasion: 'मार्च-एप्रिल महिन्यातील काजूचा हंगाम, होळी (शिमगा) उत्सव आणि वसंत ऋतूतील विशेष मेजवानी.',
    communityAssociation: 'वेंगुर्ला, मालवण व दोडामार्ग परिसरातील काजू बागायतदार व स्थानिक कुटुंबे.',
    history: 'पोर्तुगीज काळात कोकणात आलेल्या आणि नंतर स्थानिक संस्कृतीचा भाग बनलेल्या काजूच्या ओल्या गराची ही कोकणी माणसाने शोधलेली अप्रतिम शाकाहारी पाककृती आहे.',
    whereToExperience: 'वेंगुर्ला, सावंतवाडी आणि मालवण येथील स्थानिक बाजारपेठ व पारंपारिक भोजनालये.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'सिंधुदुर्ग जिल्हा कृषी व वनौषधी अभ्यास गट नोंद',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'kolhapuri_misal',
    regionId: 'kolhapur',
    name: 'कोल्हापुरी झणझणीत मिसळ (Kolhapuri Misal Pav)',
    region: 'कोल्हापूर',
    category: 'झणझणीत कट-रस्सा नाश्ता',
    heroImage: '/assets/images/real-misal-pav.jpg',
    ingredients: ['मटकीची उसळ (मोड आलेली मटकी)', 'कोल्हापुरी लवंगी तिखट व कांदा-लसूण मसाला कट (लाल तवंग रस्सा)', 'बारीक चिरलेला कांदा, कोथिंबीर, लिंबू', 'कुरकुरीत फरसाण व चिवडा', 'ताजे पांढरे लादी पाव'],
    traditionalPrep: 'मोड आलेली मटकी हळद-मिठाच्या पाण्यात उकडून वाटीत घेतली जाते. त्यावर अस्सल कोल्हापुरी तिखटाचा लालभडक उकळता ‘कट’ किंवा ‘सॅम्पल’ ओतला जातो. वरून फरसाण, कांदा, लिंबू आणि कोथिंबीर घालून गरमागरम पावासोबत वाढले जाते.',
    occasion: 'सकाळचा राजाश्रय लाभलेला लोकप्रिय नाश्ता, रविवारची चवदार सकाळ आणि कोल्हापूरकरांचा जीव की प्राण.',
    communityAssociation: 'शाहूनगरी कोल्हापुरातील सर्व स्तरांतील नागरिक, तालमीतील मल्ल व खवय्ये.',
    history: 'शाहू महाराजांच्या काळात कोल्हापूरच्या गल्लीबोळांतील खानावळींतून उगम पावलेली ही मिसळ आज संपूर्ण जगात महाराष्ट्राची ओळख बनली आहे.',
    whereToExperience: 'खासबाग, राजारामपुरी, भवानी मंडप व दसरा चौक परिसरातील प्रसिद्ध मिसळ केंद्रे.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) कोल्हापूर खाद्य वारसा नोंद',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'vidarbha_patodi_rassa',
    regionId: 'vidarbha',
    name: 'विदर्भाची पाटोडी रस्सा (Vidarbha Patodi Rassa)',
    region: 'विदर्भ (नागपूर, अमरावती, अकोला, चंद्रपूर)',
    category: 'पारंपरिक झणझणीत शाकाहारी कालवण',
    heroImage: '/assets/images/real-vidarbha-patodi.jpg',
    ingredients: ['बेसन (हरभरा डाळीचे पीठ)', 'कांदा-खोबऱ्याचे नागपुरी वाटण व खसखस', 'काळी मिरी, लवंग, दालचिनी खडे मसाले', 'लसूण-आले पेस्ट व हिरवी मिरची', 'तेल व भरपूर ताजी कोथिंबीर'],
    traditionalPrep: 'बेसन व्यवस्थित शिजवून पोळपाटावर थापून त्याच्या चौकोनी किंवा हिऱ्याच्या आकाराच्या वड्या (पाटोडी) कापल्या जातात. दुसऱ्या बाजूला काळे मसाले व लसूण-कांद्याची खमंग फोडणी देऊन लालभडक तरीदार रस्सा तयार केला जातो. जेवताना रश्श्यात या वड्या सोडून ज्वारीच्या भाकरीसोबत खाल्ला जातो.',
    occasion: 'विदर्भातील शाकाहारी सण, पाहुण्यांची खास मेजवानी, पावसाळ्यातील व हिवाळ्यातील दुपारचे जेवण.',
    communityAssociation: 'नागपूर व वऱ्हाडातील पारंपरिक मराठी व तेली-कोष्टी समाजाची स्वाक्षरी शाकाहारी पाककृती.',
    history: 'विदर्भातील उष्ण आणि कोरड्या हवामानात डाळींच्या पोषणाचा पुरेपूर वापर करून मांसाहारी रश्श्याला तोडीस तोड शाकाहारी चव देण्यासाठी ही पाटोडी निर्माण झाली.',
    whereToExperience: 'नागपूर, वर्धा आणि अमरावती परिसरातील पारंपरिक भोजनालये व घरगुती पंगती.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'विदर्भ साहित्य संघ — लोकसंस्कृती व खाद्यकोश',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'paschim_jhunka_bhakar',
    regionId: 'paschim',
    name: 'पिठलं-भाकरी व खरडा / ठेचा (Jhunka Bhakar & Thecha)',
    region: 'पश्चिम महाराष्ट्र (सातारा, पुणे, सांगली, सोलापूर)',
    category: 'गावरान अस्सल शेतकरी आहार',
    heroImage: '/assets/images/real-south-jhunka-bhakar.jpg',
    ingredients: ['ताजी ज्वारी किंवा बाजरीची गरमागरम भाकरी', 'लोखंडी कढईत परतलेले बेसन पिठलं / झुणका', 'खलबत्त्यात कुटलेला हिरव्या मिरच्या व लसणाचा ठेचा (खरडा)', 'पांढराशुभ्र कांदा व शेंगदाणा चटणी', 'घरचे पांढरे लोणी'],
    traditionalPrep: 'लोखंडी कढईत जिरं-मोहरी, हिंग आणि हिरव्या मिरच्यांची फोडणी देऊन बेसन पिठलं किंवा सुका झुणका घोटला जातो. चुलीवर थापलेली टम्म फुगणारी गरमागरम ज्वारीची भाकरी आणि खलबत्त्यात ठेचलेला हिरवागार तिखट खरडा एकत्र करून जेवले जाते.',
    occasion: 'शेतकऱ्यांचे दुपारचे जेवण, गडकिल्ल्यांवर ट्रेकर्सचा मुख्य आहार, शिवकालीन मावळ्यांचा ऊर्जादायी खुराक.',
    communityAssociation: 'सह्याद्रीच्या रांगांतील मावळे, शेतकरी आणि महाराष्ट्रातील प्रत्येक मराठी माणसाचा आत्मा.',
    history: 'छत्रपती शिवाजी महाराजांच्या सैन्याचा रणांगणावरील सर्वात विश्वासू आणि ऊर्जा देणारा सात्विक आहार म्हणून शतकानुशतके गौरविला गेला.',
    whereToExperience: 'सिंहगड, राजगड, महाबळेश्वरच्या पायथ्याशी व सातारा-पुणे ग्रामीण भागातील चुलीवरचे जेवण.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र गॅझेटिअर — कृषी व पारंपरिक लोकजीवन',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'khandeshi_vange_bharit',
    regionId: 'khandesh',
    name: 'खानदेशी वांग्याचे भरीत व पुरी (Khandeshi Vange Bharit)',
    region: 'खानदेश (जळगाव, धुळे, नंदुरबार)',
    category: 'पारंपरिक प्रसिद्ध शाकाहारी मेजवानी',
    heroImage: '/assets/images/real-khandeshi-bharit.jpg',
    ingredients: ['जळगावची काटेरी पांढुरकी भरताची वांगी', 'शेंगदाणे व सुके खोबरे', 'हिरवी मिरची व लसूण पेस्ट', 'कढीपत्ता, कोथिंबीर व अस्सल शेंगदाणा तेल', 'उडीद डाळीची कळण्याची भाकरी किंवा पुरी'],
    traditionalPrep: 'मोठी काटेरी वांगी थेट कापूस किंवा तुरीच्या सुक्या काट्यांच्या निखाऱ्यावर मंद भाजली जातात. भाजलेली साल काढून वांग्याचा गर चमच्याने घोटला जातो. त्यात लसूण, शेंगदाणे व मिरचीची खमंग फोडणी देऊन वरून भरपूर शेंगदाणा तेल सोडले जाते.',
    occasion: 'मार्गशीर्ष महिन्यातील शेतातील भरीत पार्ट्या, मकर संक्रांत आणि कौटुंबिक स्नेहभोजन.',
    communityAssociation: 'खानदेशातील लेवा पाटीदार व शेतकरी कुटुंबांची जागतिक कीर्तीची खासियत.',
    history: 'जळगावच्या काळ्या सुपीक मातीत पिकणारी विशिष्ट काटेरी वांगी आणि तापी काठच्या शेंगदाण्याच्या तेलाचा सुवर्णसंगम म्हणजे हे भरीत.',
    whereToExperience: 'जळगाव, भुसावळ व चोपडा येथील शेतातील अस्सल भरीत पंगती.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'जळगाव जिल्हा गॅझेटिअर व खानदेश कृषी संशोधन केंद्र',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'khandeshi_mande',
    regionId: 'khandesh',
    name: 'खानदेशी मांडे / खापरवरची पुरणपोळी (Khandeshi Mande)',
    region: 'खानदेश (धुळे, जळगाव, नंदुरबार)',
    category: 'पारंपरिक गोड महाप्रसाद / सणासुदीचे मिष्टान्न',
    heroImage: '/assets/images/real-puran-poli.jpg',
    ingredients: ['गव्हाचा बारीक मैदा किंवा रवा', 'हरभरा डाळीचे गोड पुरण', 'गूळ व वेलची पूड', 'शुद्ध साजूक तूप', 'उलट्या मातीच्या खापराचा तवा (खापर)'],
    traditionalPrep: 'मैद्याची कणीक तेलात तासनतास मुरवून हातावर रुमालासारखी गोल फिरवून अत्यंत पातळ आणि भव्य आकाराची पोळी हवेत उडवून बनवली जाते. चुलीवर ठेवलेल्या उलट्या मातीच्या तापलेल्या खापरावर क्षणार्धात भाजली जाते. ही पोळी घडी घालून दुधासोबत किंवा तुपासोबत खाल्ली जाते.',
    occasion: 'अक्षय्य तृतीया (आखाजी), कानबाई उत्सव, लग्नकार्यातील पंगत आणि जावयाचा पाहुणचार.',
    communityAssociation: 'खानदेशातील अहिराणी संस्कृती आणि मांडे तयार करणाऱ्या कुशल कारागीर महिलांची शतकानुशतके चालत आलेली लोककला.',
    history: 'संत ज्ञानेश्वरांच्या काळात चांगदेवांच्या भेटीच्या वेळी मुक्ताबाईंनी ज्ञानेश्वरांच्या पाठीवर मांडे भाजल्याची प्रसिद्ध संतगाथा याच खापरवरच्या मांड्यांशी निगडीत आहे.',
    whereToExperience: 'धुळे, अमळनेर व साक्री परिसरातील आखाजी सणादरम्यान घरगुती पंगती.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'खानदेश लोकसंस्कृती व खाद्यपरंपरा — उत्तर महाराष्ट्र विद्यापीठ',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'khandeshi_dal_batti',
    regionId: 'khandesh',
    name: 'खानदेशी डाळ-बट्टी व वांग्याची भाजी (Khandeshi Dal Batti)',
    region: 'खानदेश (धुळे, नंदुरबार, जळगाव)',
    category: 'पारंपरिक सण मेजवानी / शाही थाळी',
    heroImage: '/assets/images/real-khandeshi-dal-batti.jpg',
    ingredients: ['गव्हाचा जाडसर रवा/पीठ', 'तुरीची व हरभऱ्याची घट्ट डाळ', 'जिरे, मोहरी, कढीपत्ता, हिंग', 'गावरान साजूक तूप', 'काळा मसाला व हिरवी मिरची'],
    traditionalPrep: 'गव्हाच्या जाडसर कणकेत ओवा व तूप घालून घट्ट गोळे वळून उकडले किंवा निखाऱ्यावर भाजले जातात. नंतर शुद्ध साजूक तुपात सोनेरी रंगावर तळून कुरकुरीत बट्टी तयार होते. ही बट्टी हाताने चुरून त्यावर भरपूर साजूक तूप व झणझणीत काळ्या मसाल्याची डाळ ओतून खाल्ली जाते.',
    occasion: 'खानदेशातील लग्न सोहळे, सत्यनारायण महापूजा, पाहुण्यांचे आदरातिथ्य आणि रविवारचे स्नेहभोजन.',
    communityAssociation: 'खानदेशातील मराठा, लेवा पाटील, गुजर व राजपूत समाजाची अत्यंत आवडती पारंपरिक डिश.',
    history: 'मध्य भारतातून खानदेशात आलेल्या आणि स्थानिक काळ्या मसाल्याच्या तडक्याने समृद्ध झालेल्या या पदार्थाने खानदेशात स्वतःची एक वेगळी आणि शाही ओळख निर्माण केली.',
    whereToExperience: 'धुळे शहर, शिरपूर आणि जळगाव परिसरातील पारंपरिक भोजनालये.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'धुळे गॅझेटिअर व खानदेश खाद्य संस्कृती शोधनिबंध',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'vidarbha_tarot_bhaji',
    regionId: 'vidarbha',
    name: 'तरोट्याची रानभाजी व ज्वारीची भाकरी (Tarota Bhaji Vidarbha)',
    region: 'विदर्भ (यवतमाळ, अमरावती, नागपूर, चंद्रपूर)',
    category: 'पारंपरिक आरोग्यदायी रानभाजी',
    heroImage: '/assets/images/real-marathwada-bhakri.jpg',
    ingredients: ['पावसाळ्यात रानात उगवणारी ताजी तरोट्याची कोवळी पाने', 'हरभरा डाळ किंवा शेंगदाणे', 'लसूण व सुकी लाल मिरची', 'जिरं-मोहरी व हळद', 'ज्वारीची गरम भाकरी'],
    traditionalPrep: 'पावसाळ्याच्या सुरुवातीला रानातून तोडून आणलेली कोवळी तरोट्याची पाने स्वच्छ धुवून बारीक चिरली जातात. भिजवलेली हरभरा डाळ, भरपूर लसूण आणि लाल मिरच्यांच्या खमंग तेलाच्या फोडणीत मंद आचेवर वाफवून ही औषधी रानभाजी तयार केली जाते.',
    occasion: 'आषाढ-श्रावण महिना, पावसाळ्यातील रोजचे शेतकरी जेवण आणि आरोग्य संवर्धन.',
    communityAssociation: 'विदर्भातील शेतकरी, वनवासी गोंड-कोलाम समाज व ग्रामीण जनतेची शतकानुशतके जपलेली निसर्ग देणगी.',
    history: 'आयुर्वेदात ‘चक्रमर्द’ म्हणून ओळखली जाणारी ही वनस्पती पावसाळ्यात शरीरातील वात-पित्त संतुलित ठेवण्यासाठी विदर्भात आवर्जून खाल्ली जाते.',
    whereToExperience: 'यवतमाळ, वर्धा व अमरावती ग्रामीण भागातील आठवडी बाजार व शेतातील पंगती.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'विदर्भ कृषी विद्यापीठ (अकोला) रानभाज्या अभ्यास प्रकल्प',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'vidarbha_gola_bhat',
    regionId: 'vidarbha',
    name: 'विदर्भाचा प्रसिद्ध गोळा भात (Vidarbha Gola Bhat)',
    region: 'विदर्भ (नागपूर, वर्धा, चंद्रपूर)',
    category: 'झटपट पारंपरिक रुचकर भात प्रकार',
    heroImage: '/assets/images/real-kolambi-bhat.jpg',
    ingredients: ['हरभरा डाळीचे पीठ (बेसन)', 'सुवासिक तांदूळ', 'कांदा, लसूण, हिरवी मिरची', 'ओवा, हळद, हिंग व धनेपूड', 'फोडणीसाठी तेल व जिरे-मोहरी'],
    traditionalPrep: 'बेसन मसाल्यांत घट्ट मळून त्याचे छोटे-छोटे मसालेदार गोळे बनवले जातात. दुसऱ्या बाजूला तांदळाची खमंग फोडणी देऊन त्यात हे बेसनाचे गोळे शिजताना सोडले जातात. भातासोबतच हे मसालेदार गोळे मऊ शिजून एक अत्यंत रुचकर व पौष्टिक एकपात्री जेवण बनते.',
    occasion: 'विदर्भातील दुपारचे रुचकर जेवण, पावसाळी दिवसांतील कौटुंबिक आस्वाद.',
    communityAssociation: 'वऱ्हाडी व नागपुरी घरांमधील पिढ्यानपिढ्या चालत आलेली सात्विक गृहपाककृती.',
    history: 'घरात भाजीपाला उपलब्ध नसताना डाळीचे पोषण आणि भाताचा मिलाफ करून झटपट पोटभरीचे रुचकर जेवण बनवण्याची विदर्भाची ही अनोखी कलाकृती आहे.',
    whereToExperience: 'नागपूर व वर्धा परिसरातील अस्सल घरगुती खानावळी.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_3,
      source: 'विदर्भ खाद्य संस्कृती कोश — नागपूर हेरिटेज फोरम',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'puneri_misal',
    regionId: 'paschim',
    name: 'पुणेरी मिसळ व पोहे-मटकी उसळ (Puneri Misal)',
    region: 'पश्चिम महाराष्ट्र (पुणे)',
    category: 'सकाळचा अस्सल पुणेरी नाश्ता',
    heroImage: '/assets/images/real-misal-pav.jpg',
    ingredients: ['मोड आलेली मटकी उसळ', 'कांदा-खोबऱ्याचा मध्यम तिखट कट रस्सा', 'कांदे पोहे (तळाशी बेस)', 'बारीक शेव, चिवडा व फरसाण', 'बारीक चिरलेला कांदा, लिंबू व लादी पाव'],
    traditionalPrep: 'वाटीच्या तळाशी प्रथम गरम कांदे पोहे घातले जातात. त्यावर उकडलेली मटकी उसळ आणि पुणेरी चवदार कट ओतला जातो. वरून कुरकुरीत फरसाण, बारीक चिरलेला कांदा व लिंबाचा रस पिळून पावासोबत वाढला जातो. कोल्हापुरी मिसळीपेक्षा ही मिसळ सौम्य आणि सुगंधी असते.',
    occasion: 'रविवारची सकाळ, मित्रमंडळींच्या गप्पा, पुण्यातील शनिवार-रविवारचा ठरलेला नाश्ता.',
    communityAssociation: 'पुणेरी संस्कृती, सदाशिव पेठ, फर्ग्युसन कॉलेज रोड व प्रभात रोडवरील पुणेकरांचा अविभाज्य भाग.',
    history: 'स्वातंत्र्योत्तर काळात पुण्यातील पेठांमधील जुन्या उपहारगृहांनी पोहे आणि मटकी उसळीचा सुरेख संगम घडवून ही प्रसिद्ध पुणेरी मिसळ रूढ केली.',
    whereToExperience: 'सदाशिव पेठ, आपटे रोड, तुळशीबाग व फर्ग्युसन कॉलेज रोड, पुणे.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'पुणे हेरिटेज सेल व महाराष्ट्र पर्यटन विकास महामंडळ (MTDC)',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'kolhapuri_bhel',
    regionId: 'kolhapur',
    name: 'कोल्हापुरी राजाभाऊ / फडतरे भेळ (Kolhapuri Bhel)',
    region: 'कोल्हापूर',
    category: 'खमंग तिखट-आंबट स्ट्रीट फूड',
    heroImage: '/assets/images/real-kolhapuri-bhel.jpg',
    ingredients: ['कुरकुरीत चुरमुरे (मुरमुरे)', 'कोल्हापुरी तिखट चटणी (लसूण व लवंगी मिरची)', 'चिंच-गुळाची आंबट-गोड चटणी', 'बारीक चिरलेला कांदा, टोमॅटो, कोथिंबीर', 'फरसाण व शेव'],
    traditionalPrep: 'मोठ्या भांड्यात चुरमुरे घेऊन त्यात अस्सल कोल्हापुरी तिखट लसूण चटणी, गोड चिंचेची चटणी, बारीक कांदा, कोथिंबीर आणि चवदार शेव-फरसाण घालून झटपट एकत्र केले जाते. कागदाच्या पुडीत वाटी किंवा चमच्याने खाल्ली जाणारी ही भेळ जिभेवर अप्रतिम चव सोडते.',
    occasion: 'संध्याकाळचा लोकप्रिय खाऊ, मित्रमंडळींची बैठक आणि कोल्हापूरच्या गल्लीबोळातील खवय्यांचा आनंद.',
    communityAssociation: 'खासबाग, राजारामपुरी आणि भवानी मंडप परिसरातील शतकानुशतके भेळ तयार करणारे प्रसिद्ध कारागीर.',
    history: 'कोल्हापूरच्या कुस्ती फडांतील मल्ल आणि तालमींनंतर संध्याकाळी अल्पोपहार म्हणून साध्या मुरमुऱ्यात कोल्हापुरी ठसका मिसळून ही प्रसिद्ध भेळ जन्माला आली.',
    whereToExperience: 'खासबाग मैदान, राजारामपुरी व महाद्वार रोड, कोल्हापूर.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'कोल्हापूर खाद्य संस्कृती नोंद — MTDC कोल्हापूर',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  }
];

// ==========================================
// 4. GRAMDEVAT, TEMPLES & JATRA REGISTRY
// ==========================================
export const GRAMDEVAT_TEMPLES_DATA = [
  {
    id: 'khandoba_jejuri',
    name: 'जेजुरीचा खंडेराया (Jejuri Khandoba)',
    type: 'कुलदैवत व ग्रामदैवत',
    region: 'पश्चिम महाराष्ट्र (पुणे जिल्हा)',
    location: 'जेजुरी, ता. पुरंदर, जि. पुणे',
    heroImage: '/assets/images/real-jejuri-khandoba.jpg',
    deity: 'मार्तंड भैरव (खंडोबा)',
    deityOriginStory: 'मणी आणि मल्ल या दैत्यांचा संहार करण्यासाठी शंकराने मार्तंड भैरवाचा अवतार धारण केला. जेजुरीच्या कडेपठारावर त्यांचे मूळ स्थान आहे.',
    associatedDynasty: 'मराठा साम्राज्य, होळकर घराणे, पेशवे',
    historicalPeriod: 'प्राचीन काळ ते १७-१८ वे शतक (किल्लेवजा मंदिर रचना)',
    architectureStyle: 'हेमाडपंथी व मराठा दुर्ग शैली (बुरुज, दीपमाळा, कमानदार प्रवेशद्वारे)',
    clanCommunityAssociation: '९६ कुळी मराठा, धनगर, आगरी, रामोशी आणि बहुजन समाजाचे कुलदैवत.',
    annualJatraDate: 'सोमवती अमावस्या, चंपाषष्ठी व माघ पौर्णिमा',
    jatraRituals: ['भंडारा उधळण (सोनेरी जेजुरी)', 'तळी भरणे', 'जागरण गोंधळ', 'घोड्यांची शर्यत व छबीना'],
    connectedFort: 'पुरंदर किल्ला (८ किमी अंतरावर)',
    connectedFood: 'कांद्याची भजी, पुरणपोळी व भंडार भात',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'पुणे जिल्हा गॅझेटिअर व महाराष्ट्र पुरातत्त्व संचालनालय',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'bharadi_devi_anganewadi',
    name: 'श्री भराडीदेवी, आंगणेवाडी (Bharadi Devi Anganewadi)',
    type: 'ग्रामदैवत व नवसाला पावणारी आई',
    region: 'कोकण (सिंधुदुर्ग जिल्हा)',
    location: 'आंगणेवाडी, ता. मालवण, जि. सिंधुदुर्ग',
    heroImage: '/assets/images/real-bharadidevi-anganewadi.jpg',
    deity: 'आई भराडीदेवी (पाषाणरूपी स्वयंभू)',
    deityOriginStory: 'एका गाईच्या दुधाच्या धारेवरून आंगणे कुटुंबीयांना रानात पाषाणरूपी देवीचा साक्षात्कार झाला. देवी ‘भराडात’ (माळरानावर) प्रकट झाली म्हणून ‘भराडीदेवी’ नाव पडले.',
    associatedDynasty: 'स्थानिक सावंतवाडी संस्थान व मराठा आरमार काळ',
    historicalPeriod: 'सुमारे ४०० वर्षांपूर्वीची जिवंत परंपरा',
    architectureStyle: 'पारंपरिक कोकणी कौलारू मंदिर वास्तुकला',
    clanCommunityAssociation: 'आंगणे कुटुंबीयांचे मानकरीपण व महाराष्ट्रातील लाखो भाविकांचे श्रद्धास्थान.',
    annualJatraDate: 'फेब्रुवारी महिन्यात (देवीचा कौल घेऊन तारीख ठरते)',
    jatraRituals: ['दीड दिवसाची अखंड जत्रा', 'लाखो भाविकांची ताटातील नवस ओटी', 'रात्रभर चालणारा महाप्रसाद'],
    connectedFort: 'सिंधुदुर्ग किल्ला (१२ किमी अंतरावर)',
    connectedFood: 'कोकणी भात, आमटी, काकडीची उसळ व लाडू महाप्रसाद',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_4,
      source: 'आंगणेवाडी ग्रामस्थ मंडळ नोंदवही व मौखिक परंपरा',
      confidence: CONFIDENCE_LEVELS.TRADITIONAL
    }
  },
  {
    id: 'tuljabhavani_tuljapur',
    name: 'आई तुळजाभवानी (Tuljapur Bhavani Mata)',
    type: 'महाराष्ट्राची कुलस्वामिनी व स्वराज्य अधिष्ठात्री',
    region: 'मराठवाडा (धाराशिव जिल्हा)',
    location: 'तुळजापूर, जि. धाराशिव',
    heroImage: '/assets/images/real-tuljabhavani-temple.jpg',
    deity: 'भवानी माता (अष्टभुजा महिषासुरमर्दिनी)',
    deityOriginStory: 'महिषासुर आणि अनकुळ दैत्यांचा वध करण्यासाठी अवतरलेली आदिशक्ती. छत्रपती शिवाजी महाराजांना भवानी तलवार प्रदान केल्याची ऐतिहासिक श्रद्धा.',
    associatedDynasty: 'कदम घराणे, चालुक्य, राष्ट्रकूट, छत्रपती शिवाजी महाराज',
    historicalPeriod: '१२ वे शतक ते १७ वे शतक',
    architectureStyle: 'हेमाडपंथी व मराठा दगडी वास्तुकला, कल्लोळ तीर्थ',
    clanCommunityAssociation: 'छत्रपती भोसले घराण्याची कुलस्वामिनी व अठरापगड महाराष्ट्राचे आराध्य दैवत.',
    annualJatraDate: 'अश्विन नवरात्र उत्सव व कोजागरी पौर्णिमा',
    jatraRituals: ['सिंहासन पूजा', 'छबिना मिरवणूक', 'गोंधळ व जागरण', 'मंचकी निद्रा'],
    connectedFort: 'नळदुर्ग किल्ला (३५ किमी)',
    connectedFood: 'तुळजापूरचे पेढे, पुरणपोळी व नैवेद्य ताट',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र शासन राजपत्र (धाराशिव जिल्हा) व छत्रपती घराणे ऐतिहासिक पत्रव्यवहार',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'jotiba_wadi_ratnagiri',
    name: 'श्री जोतिबा देवस्थान, वाडी रत्नागिरी (Jotiba Wadi Ratnagiri)',
    type: 'दख्खनचा राजा व कुलदैवत',
    region: 'पश्चिम महाराष्ट्र (कोल्हापूर जिल्हा)',
    location: 'वाडी रत्नागिरी, ता. पन्हाळा, जि. कोल्हापूर',
    heroImage: '/assets/images/real-jotiba-wadi-ratnagiri.jpg',
    deity: 'केदारनाथ (जोतिबा - ब्रह्मा, विष्णू, महेश एकत्र रूप)',
    deityOriginStory: 'कोल्हापूरच्या महालक्ष्मीला कोल्हासुर दैत्याच्या संहारात साहाय्य करण्यासाठी केदारनाथांनी प्रकट होऊन रत्नासुर दैत्याचा वध केला.',
    associatedDynasty: 'शिलाहार घराणे, कोल्हापूर छत्रपती घराणे, शिंदे घराणे (ग्वाल्हेर)',
    historicalPeriod: 'इ.स. ८३० ते १८ वे शतक (रामोजीराव शिंदे यांनी १७३० मध्ये पुनर्बांधणी केली)',
    architectureStyle: 'काळ्या बेसॉल्ट पाषाणातील उंच शिखरे व भव्य दीपमाळा',
    clanCommunityAssociation: 'कोल्हापूर, सांगली, सातारा व उत्तर कर्नाटकातील लक्षावधी घराण्यांचे कुलदैवत.',
    annualJatraDate: 'चैत्र पौर्णिमा (मोठी चैत्र यात्रा)',
    jatraRituals: ['गुलाल-खोबऱ्याची मुक्त उधळण', 'सासनकाठ्यांचे विलोभनीय नृत्य', 'घोड्यांचा छबिना'],
    connectedFort: 'पन्हाळा किल्ला (१८ किमी अंतरावर)',
    connectedFood: 'गुलाल-खोबरे प्रसाद, पेढे व झुणका भाकरी',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'कोल्हापूर जिल्हा गॅझेटिअर व पश्चिम महाराष्ट्र देवस्थान व्यवस्थापन समिती',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'kailasa_ellora',
    name: 'कैलास मंदिर, वेरूळ लेणी (Kailasa Temple Ellora)',
    type: 'जागतिक वारसा (UNESCO World Heritage) व शैलशिल्प चमत्कार',
    region: 'मराठवाडा (छत्रपती संभाजीनगर जिल्हा)',
    location: 'वेरूळ, ता. खुलताबाद, जि. छत्रपती संभाजीनगर',
    heroImage: '/assets/images/real-ellora-kailash.jpg',
    deity: 'महादेव शिव (कैलास पर्वत स्वरूप)',
    deityOriginStory: 'एकाच अखंड सह्याद्रीच्या बेसाल्ट पाषाणात वरून खाली (Top to Bottom) कोरून काढलेले जगातील सर्वात भव्य दगडी मंदिर.',
    associatedDynasty: 'राष्ट्रकूट राजवंश (सम्राट कृष्ण प्रथम, इ.स. ७५६-७७३)',
    historicalPeriod: '८ वे शतक (इ.स. ७५६-७७३)',
    architectureStyle: 'द्रविड शैलशिल्प वास्तुकला (Rock-cut Monolithic Architecture)',
    clanCommunityAssociation: 'समग्र भारतीय वास्तुकलेचा सर्वोच्च मानबिंदू; वेरूळ हे भोसले घराण्याचे मूळ गाव (मालोजीराजे भोसले गढी येथेच आहे).',
    annualJatraDate: 'महाशिवरात्र उत्सव व वेरूळ-अजिंठा आंतरराष्ट्रीय संगीत महोत्सव',
    jatraRituals: ['महाशिवरात्र रुद्राभिषेक', 'घृष्णेश्वर जोतिर्लिंग पालखी दर्शन'],
    connectedFort: 'देवगिरी (दौलताबाद) किल्ला (१५ किमी अंतरावर)',
    connectedFood: 'मराठवाडी धपाटे व शेवभाजी',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'UNESCO World Heritage List (Ref 243) व भारतीय पुरातत्त्व सर्वेक्षण (ASI)',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  }
];

// ==========================================
// 5. LIVING FOLK TRADITIONS (खेळ, नाट्य, उत्सव)
// ==========================================
export const FOLK_TRADITIONS_DATA = [
  {
    id: 'dashavatar',
    category: 'नाट्य (Folk Theatre)',
    name: 'दशावतार (Dashavatar)',
    region: 'कोकण (सिंधुदुर्ग व गोवा सीमाभाग)',
    heroImage: '/assets/images/real-dashavatar-konkan.jpg',
    historicalRoots: 'सुमारे ४०० वर्षांपूर्वी कर्नाटकातील यक्षगान आणि कोकणातील स्थानिक देवदासी/भक्त परंपरेच्या मिलाफातून उगम पावलेली लोककला.',
    performanceOccasion: 'ग्रामदैवतांच्या वार्षिक जत्रा, शिमगोत्सव आणि देवदिवाळीच्या रात्री.',
    elements: ['गणपती व सरस्वती स्तवन', 'शंखासुर विनोद', 'पुराणातील मुख्य आख्यान', 'पारंपरिक लाकडी मुकुट व मुखवटे', 'झांज व पखवाज साथ'],
    modernStatus: 'आजही कोकणात शेकडो दशावतारी कंपन्या (उदा. मोचेमाडकर, खानोलकर) गावोगावी जत्रांमध्ये रात्रभर प्रयोग सादर करतात.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_2,
      source: 'महाराष्ट्र राज्य लोकसाहित्य समिती व प्रा. डॉ. तारा परांजपे शोधनिबंध',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'tamasha_lavani',
    category: 'नाट्य व लोकसंगीत (Folk Theatre & Music)',
    name: 'तमाशा व लावणी (Tamasha & Lavani)',
    region: 'पश्चिम महाराष्ट्र, मराठवाडा व खानदेश',
    heroImage: '/assets/images/real-lavani.jpg',
    historicalRoots: 'मराठा पेशवेकाळात (१८ व्या शतकात) सैनिकांना रणांगणावर व छावण्यांमध्ये ऊर्जा देण्यासाठी आणि लोकरंजनासाठी विकसित झालेली प्रगल्भ कला.',
    performanceOccasion: 'जत्रा, यात्रा, ऊसतोड कामगारांचे हंगामी फड आणि रंगमंदिरे.',
    elements: ['गण (गणपती वंदन)', 'गौळण (कृष्ण-गोपी संवाद)', 'फार्स / सोंगाड्याचा राजकीय-सामाजिक विनोद', 'लावणी नृत्य व ढोलकी-तुणतुणे वादन'],
    modernStatus: 'शाहीर पठ्ठे बापूराव, बाळू कऱ्हाडकर यांच्यापासून ते आजच्या संगीतरत्न विठाबाई नारायणगावकर पुरस्कारापर्यंत जिवंत कला.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'महाराष्ट्र शासन सांस्कृतिक कार्य संचालनालय व साहित्य परिषद नोंदी',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'viti_dandu',
    category: 'खेळ (Traditional Folk Games)',
    name: 'विटी-दांडू (Viti Dandu)',
    region: 'महाराष्ट्र राज्यभर (विशेषतः खेडोपाडी)',
    heroImage: '/assets/images/real-viti-dandu.jpg',
    historicalRoots: 'प्राचीन ग्रामीण खेळ; क्रिकेटच्या मूळ प्रेरणांमधील एक मानला जाणारा देशी खेळ.',
    performanceOccasion: 'उन्हाळ्याच्या सुट्ट्या, जत्रांचे मैदान आणि शेतीतील विश्रांतीचा काळ.',
    elements: ['लाकडी विटी (दोन बाजूंनी अणकुचीदार)', 'मोठा दांडू', 'गल किंवा खड्डा', 'वग आणि दांड्याने मारून लांब उडवणे'],
    modernStatus: 'आधुनिक शहरात कमी झालेला असला तरी ग्रामीण भागात आणि स्थानिक क्रीडा स्पर्धांमध्ये पुनरुज्जीवित केला जात आहे.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_3,
      source: 'महाराष्ट्र देशी खेळ परिषद व क्रीडा संचालनालय संदर्भ',
      confidence: CONFIDENCE_LEVELS.TRADITIONAL
    }
  },
  {
    id: 'lagori',
    category: 'खेळ (Traditional Folk Games)',
    name: 'लिंगोरचा / लगोरी (Lagori / Seven Stones)',
    region: 'महाराष्ट्र राज्यभर',
    heroImage: '/assets/images/real-lagori-game.jpg',
    historicalRoots: 'महाभारतात भगवान श्रीकृष्णाने सवंगड्यांसोबत लगोरी खेळल्याचे लोककथांमध्ये संदर्भ आढळतात.',
    performanceOccasion: 'गल्लीबोळात, शाळांच्या मैदानावर आणि सणासुदीच्या दिवसांत.',
    elements: ['७ चपटे दगड एकावर एक रचलेले', 'रबरी चेंडू', 'दोन संघ: फोडणारा व रचणारा संघ'],
    modernStatus: 'आता राष्ट्रीय व आंतरराष्ट्रीय स्तरावर "Lagori World Cup" च्या रूपाने आधुनिक नियमांसह खेळला जातो.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_3,
      source: 'भारतीय पारंपरिक क्रीडा महासंघ (Indian Traditional Games Federation)',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  },
  {
    id: 'powada',
    category: 'नाट्य व शौर्यगाथा (Heroic Ballad)',
    name: 'शाहिरी पोवाडा (Shahiri Powada)',
    region: 'पश्चिम महाराष्ट्र व संपूर्ण सह्याद्री पट्टा',
    heroImage: '/assets/images/real-shahiri-powada.jpg',
    historicalRoots: 'छत्रपती शिवाजी महाराजांच्या काळात १६५९ मध्ये अज्ञानदासाने रचलेला ‘अफझलखान वधाचा पोवाडा’ हा मराठीतील पहिला अधिकृत ऐतिहासिक पोवाडा मानला जातो.',
    performanceOccasion: 'शिवजयंती, जत्रा, गडकोटांवरील संमेलने आणि लोकजागृती मेळावे.',
    elements: ['डफ व तुणतुणे वादन', 'कडकडाट आवाज व अंगावर रोमांच उभे करणारी वीररसाची शाहिरी', 'जिजाऊ व शिवराय शौर्यगायन'],
    modernStatus: 'शाहीर अमर शेख, शाहीर अण्णा भाऊ साठे यांच्यापासून आजच्या पिढीतील शाहिरांपर्यंत अविरत चालू परंपरा.',
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'भारत इतिहास संशोधक मंडळ (पुणे) व ऐतिहासिक समकालीन दस्तऐवज',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    }
  }
];

// ==========================================
// 6. HISTORICAL EVENTS & KNOWLEDGE GRAPH NODES
// ==========================================
export const KNOWLEDGE_GRAPH_EVENTS = [
  {
    id: 'event_rajyabhishek',
    title: 'शिवराज्याभिषेक सोहळा (Coronation of Chhatrapati Shivaji Maharaj)',
    date: '६ जून १६७४ (ज्येष्ठ शुद्ध त्रयोदशी, आनंद नाम संवत्सर)',
    historicalEpoch: 'मराठा स्वराज्य कालखंड',
    primaryLocation: 'रायगड किल्ला (राजधानी)',
    heroImage: '/assets/images/real-shivaji-coronation.jpg',
    heroImageCaption: 'दुर्गराज रायगडावरील ३२ मण सुवर्ण सिंहासनावरील शिवराज्याभिषेक सोहळा (६ जून १६७४)',
    summary: 'हिंदवी स्वराज्याची सार्वभौम घोषणा, शिवशक कालगणनेची सुरुवात, शिवराई व होन नाण्यांची निर्मिती आणि अष्टप्रधान मंडळाची स्थापना.',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'जेधे शकावली, सबासदाची बखर व हेन्री ऑक्झिंडेन इंग्रज वकिलाची समकालीन दैनंदिनी (१६७४)',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    connectedEntities: {
      people: [
        { name: 'छत्रपती शिवाजी महाराज', role: 'हिंदवी स्वराज्य संस्थापक व छत्रपती' },
        { name: 'गागाभट्ट (विश्वेश्वर भट्ट)', role: 'काशीचे प्रकांड पंडित व प्रमुख पुरोहित' },
        { name: 'राष्ट्रमाता जिजाऊ माँसाहेब', role: 'प्रेरणास्थान व राजमाता' },
        { name: 'सोयराबाई राणीसाहेब', role: 'पट्टराणी' },
        { name: 'संभाजी महाराज', role: 'युवराज' },
        { name: 'मोरोपंत त्र्यंबक पिंगळे', role: 'पंतप्रधान (पंतपेशवे)' },
        { name: 'हंबीरराव मोहिते', role: 'सरसेनापती' }
      ],
      places: [
        { name: 'रायगड किल्ला', type: 'राजधानी दुर्ग', district: 'रायगड' },
        { name: 'पाचाड', type: 'माँसाहेब जिजाऊंची समाधी व वाडा', district: 'रायगड' },
        { name: 'जगदीश्वर मंदिर', type: 'शिवमंदिर व शिवरायांचे नमनस्थान', district: 'रायगड' },
        { name: 'गंगासागर तलाव', type: 'सप्तनद्यांच्या जलाने अभिषेक केलेले तीर्थ', district: 'रायगड' }
      ],
      artifactsAndSymbols: [
        'सुवर्ण सिंहासन (३२ मण वजनाचे)',
        'शिवराई व होन (अधिकृत चलन)',
        'राजमुद्रा (प्रतिपच्चंद्रलेखेव...)',
        'भगवा ध्वज (जरीपटक)'
      ],
      heritageRoute: [
        'मुंबई/पुणे → महाड → पाचाड जिजाऊ वाडा → रायगड पायथा (चित्त दरवाजा/रोपवे) → महादरवाजा → होळीचा माळ → राजसभा व मेघडंबरी → जगदीश्वर मंदिर व शिवसमाधी'
      ],
      localCuisine: [
        'महाडची भाकरी व पिठलं',
        'कोकणी सोलकढी व मोदक'
      ]
    }
  },
  {
    id: 'event_panhala_siege',
    title: 'पन्हाळा वेढा व पावनखिंडीचा रणसंग्राम (Siege of Panhala & Pavankhind Battle)',
    date: '२ मार्च १६६० ते १३ जुलै १६६०',
    historicalEpoch: 'मराठा-आदिलशाही संघर्ष',
    primaryLocation: 'पन्हाळा किल्ला ते विशाळगड (घोडखिंड)',
    heroImage: '/assets/images/real-pavankhind.jpg',
    heroImageCaption: 'पावनखिंडीचा ऐतिहासिक रणसंग्राम — वीर बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे अद्वितीय शौर्य',
    summary: 'सिद्दी जौहरच्या ४ महिन्यांच्या भीषण वेढ्यातून छत्रपती शिवरायांची सुटका, शिवा काशिद यांचे बलिदान आणि बाजीप्रभू देशपांडे यांनी विशाळगडावरील तोफांचे आवाज होईपर्यंत खिंड लढवलेला अद्वितीय पराक्रम.',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'शिवभारत (कवी परमानंद), जेधे करीना व आदिलशाही पत्रव्यवहार',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    connectedEntities: {
      people: [
        { name: 'छत्रपती शिवाजी महाराज', role: 'सेनापती व छत्रपती' },
        { name: 'बाजीप्रभू देशपांडे', role: 'वीर सरदार, पावनखिंड रक्षक' },
        { name: 'शिवा काशिद', role: 'शिवरायांचे रूप धारण करून बलिदान देणारे वीर' },
        { name: 'फुलाजीप्रभू देशपांडे', role: 'वीर बाजीप्रभूंचे बंधू' },
        { name: 'सिद्दी जौहर', role: 'आदिलशाही वेढा प्रमुख' }
      ],
      places: [
        { name: 'पन्हाळा किल्ला', type: 'वेढ्याचे ठिकाण', district: 'कोल्हापूर' },
        { name: 'पावनखिंड (घोडखिंड)', type: 'रणसंग्राम खिंड', district: 'कोल्हापूर' },
        { name: 'विशाळगड', type: 'शिवरायांचे सुरक्षित आश्रयस्थान', district: 'कोल्हापूर' }
      ],
      artifactsAndSymbols: [
        'बाजीप्रभूंची तलवार व दांडपट्टा',
        'तोफांची सलामी (विशाळगडावरून)',
        'शिवा काशिद समाधी स्थळ'
      ],
      heritageRoute: [
        'कोल्हापूर → पन्हाळा किल्ला (सज्जा कोठी व तीन दरवाजा) → पावनखिंड ऐतिहासिक ट्रेक (४७ किमी) → विशाळगड'
      ],
      localCuisine: [
        'कोल्हापुरी तांबडा-पांढरा रस्सा',
        'झुणका भाकरी व ठेचा'
      ]
    }
  },
  {
    id: 'event_ellora_creation',
    title: 'कैलास मंदिर व वेरूळ लेणी निर्मिती (Carving of Kailasa Temple)',
    date: 'इ.स. ७५६ ते ७७३ (८ वे शतक)',
    historicalEpoch: 'राष्ट्रकूट साम्राज्य कालखंड',
    primaryLocation: 'वेरूळ लेणी (गुहा क्र. १६)',
    heroImage: '/assets/images/real-ellora-kailash.jpg',
    heroImageCaption: 'वेरूळ कैलास मंदिर (गुहा क्र. १६) — सह्याद्रीच्या काळ्या पाषाणात अखंड वरून खाली कोरलेले अद्वितीय शैलशिल्प',
    summary: 'राष्ट्रकूट राजा कृष्ण (प्रथम) याच्या राजवटीत सह्याद्रीच्या काळ्या पाषाणात संपूर्ण मंदिर व रथाची रचना वरून खाली अखंड कोरून काढण्यात आलेली मानवी इतिहासातील अद्वितीय वास्तू.',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    sourceRef: {
      tier: SOURCE_TIERS.TIER_1,
      source: 'बडोदा ताम्रपट (इ.स. ८१२), UNESCO World Heritage Convention & ASI Records',
      confidence: CONFIDENCE_LEVELS.DOCUMENTED
    },
    connectedEntities: {
      people: [
        { name: 'सम्राट कृष्ण प्रथम (राष्ट्रकूट)', role: 'निर्मिती प्रेरक व संरक्षक सम्राट' },
        { name: 'अनाम भारतीय स्थपती व शिल्पकार', role: 'जगातील सर्वश्रेष्ठ शैलशिल्पकार' },
        { name: 'मालोजीराजे भोसले', role: 'वेरूळचे जहागीरदार व घृष्णेश्वर जीर्णोद्धारक (१६ वे शतक)' }
      ],
      places: [
        { name: 'वेरूळ लेणी (गुहा १६)', type: 'शैलशिल्प मंदिर', district: 'छत्रपती संभाजीनगर' },
        { name: 'घृष्णेश्वर ज्योतिर्लिंग', type: '१२ वे ज्योतिर्लिंग', district: 'छत्रपती संभाजीनगर' },
        { name: 'दौलताबाद किल्ला', type: 'देवगिरी राजधानी', district: 'छत्रपती संभाजीनगर' }
      ],
      artifactsAndSymbols: [
        'रावणानुग्रह शिल्प (रावण कैलास पर्वत हलवतानाचे भव्य शिल्प)',
        'हत्ती व सिंह आधारस्तंभ',
        'महाभारत व रामायण प्रसंग पाषाणपट'
      ],
      heritageRoute: [
        'छत्रपती संभाजीनगर → दौलताबाद किल्ला → खुलताबाद (भद्रा मारुती) → घृष्णेश्वर मंदिर → वेरूळ कैलास लेणी'
      ],
      localCuisine: [
        'मराठवाडी धपाटे',
        'नांदेड बासुंदी'
      ]
    }
  }
];

// ==========================================
// 7. INTERACTIVE HERITAGE MAP DATA POINTS
// ==========================================
export const MAP_LAYERS = [
  { id: 'all', label: 'सर्व वारसा ठिकाणे (All Heritage)', icon: '🚩' },
  { id: 'forts', label: 'गड-किल्ले (Forts)', icon: '🏰' },
  { id: 'temples', label: 'मंदिरे व तीर्थ (Temples)', icon: '🛕' },
  { id: 'gramdevat', label: 'ग्रामदैवत (Village Deities)', icon: '🙏' },
  { id: 'unesco', label: 'UNESCO व लेणी (Caves)', icon: '🏛️' },
  { id: 'food', label: 'खाद्यसंस्कृती केंद्रे (Food Culture)', icon: '🍲' },
  { id: 'jatra', label: 'वार्षिक जत्रा व उत्सव (Fairs)', icon: '🎉' }
];

export const MAP_PINS = [
  {
    id: 'pin_raigad',
    title: 'किल्ले रायगड (शिवराजधानी)',
    category: 'forts',
    region: 'कोकण (Konkan)',
    district: 'रायगड',
    location: 'महाड, ता. महाड, जि. रायगड',
    lat: 18.2346,
    lng: 73.4418,
    altitude: '२,८५१ फूट (८६९ मी.)',
    trekDifficulty: 'मध्यम (१,४५० पायऱ्या किंवा रोपवे सुविधा)',
    baseVillage: 'पाचाड / हिरकणी वाडी',
    image: '/assets/images/real-raigad-panoramic.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'छत्रपती शिवाजी महाराजांची राजधानी, ६ जून १६७४ चा ऐतिहासिक शिवराज्याभिषेक सोहळा आणि ३२ मणांचे सुवर्ण सिंहासन अधिष्ठान.',
    significance: 'इ.स. १६७४ ते १६८९ मराठा साम्राज्याची राजधानी. हिरोजी इंदुलकरांनी बांधलेले अप्रतिम नगररचना स्थापत्य, बाजारपेठ आणि जगदीश्वर मंदिर.',
    connectedFort: 'राजगड, तोरणा, लिंगाणा',
    connectedTemple: 'श्री जगदीश्वर मंदिर व वाघ्या कुत्रा समाधी',
    connectedFood: 'महाडची तांदळाची भाकरी व अस्सल कोकणी सोलकढी',
    tourRoute: 'मुंबई/पुणे → महाड → पाचाड जिजाऊ वाडा → रायगड पायथा (रोपवे/पायऱ्या)',
    reference: 'बॉम्बे गॅझेटिअर (कुलाबा खंड) व भारतीय पुरातत्त्व सर्वेक्षण (ASI)',
    connectedLinks: ['event_rajyabhishek', 'sol_kadhi'],
    sitePlan: [
      { name: 'चित्त दरवाजा', desc: 'गडाचा पहिला पायथा दरवाजा' },
      { name: 'महादरवाजा', desc: 'गोमुखी रचनेचे अभेद्य प्रवेशद्वार' },
      { name: 'हत्ती तलाव', desc: 'हत्तींच्या स्नानासाठी विशाल दगडी तलाव' },
      { name: 'गंगासागर तलाव', desc: 'राज्याभिषेकासाठी सप्तनद्यांच्या पाण्याने भरलेला तलाव' },
      { name: 'नगारखाना', desc: '३२ मण सिंहासनासमोरचा भव्य ध्वनी-अभियांत्रिकी नमुना' },
      { name: 'राजसभा व छत्रपती मेघडंबरी', desc: 'इ.स. १६७४ च्या शिवराज्याभिषेकाची प्रत्यक्ष जागा' },
      { name: 'जगदीश्वर मंदिर', desc: 'शिवरायांचे नमनस्थान व सेवातत्परता' },
      { name: 'शिवछत्रपती समाधी स्मारक', desc: 'स्वराज्य संस्थापकांची अमर समाधी' },
      { name: 'टकमक टोक', desc: 'सह्याद्रीच्या खोल दरीत झेपावणारा नैसर्गिक कडेलोट कडा' }
    ]
  },
  {
    id: 'pin_sindhudurg',
    title: 'सिंधुदुर्ग जलदुर्ग',
    category: 'forts',
    region: 'कोकण (Konkan)',
    district: 'सिंधुदुर्ग',
    location: 'मालवण, जि. सिंधुदुर्ग',
    lat: 15.9984,
    lng: 73.5358,
    altitude: 'समुद्रसपाटीवर (कुरटे बेट)',
    trekDifficulty: 'सोपे (मालवण बंदरावरून होडी/बोट प्रवास)',
    baseVillage: 'मालवण बंदर',
    image: '/assets/images/real-sindhudurg-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'छत्रपती शिवाजी महाराजांनी १६६४ मध्ये अरबी समुद्रात कुरटे खडकावर बांधलेला अजिंक्य मराठा जलदुर्ग.',
    significance: 'मराठा आरमाराचे प्रमुख केंद्र. समुद्राच्या लाटा थोपवणारी ३ किमी लांब तटबंदी, शिसे ओतून जोडलेले दगडी चिरे आणि छत्रपतींचे एकमेव अधिकृत मंदिर.',
    connectedFort: 'पद्मदुर्ग, विजयदुर्ग, सुवर्णदुर्ग',
    connectedTemple: 'शिवराजेश्वर मंदिर (शिवरायांचे मंदिर)',
    connectedFood: 'मालवणी कोळंबी भात, सुरमई फ्राय व सोलकढी',
    tourRoute: 'कोल्हापूर/गोवा → कणकवली → मालवण बंदर → सिंधुदुर्ग बोट प्रवास',
    reference: 'महाराष्ट्र पुरातत्त्व व वस्तुसंग्रहालय संचालनालय',
    connectedLinks: ['sol_kadhi', 'bharadi_devi_anganewadi'],
    sitePlan: [
      { name: 'गुप्त महादरवाजा', desc: 'कुरटे खडकात समुद्रातून न दिसणारा प्रवेश' },
      { name: 'शिवराजेश्वर मंदिर', desc: 'छत्रपती शिवाजी महाराजांचे राजाराम महाराजांनी बांधलेले मंदिर' },
      { name: 'शिवरायांचे हस्त व पदचिन्ह', desc: 'चुन्यात घेतलेले महाराजांचे प्रत्यक्ष हाताचे व पायाचे ठसे' },
      { name: 'दूध, दही व साखर विहीर', desc: 'खारट समुद्राच्या मध्यभागी असणाऱ्या ३ गोड्या पाण्याच्या विहिरी' },
      { name: 'फांदी बुरुज', desc: 'तोफांचा मारा करण्यासाठी समुद्रात पुढे आलेला बुरुज' }
    ]
  },
  {
    id: 'pin_sinhagad',
    title: 'किल्ले सिंहगड (कोंढाणा)',
    category: 'forts',
    region: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    district: 'पुणे',
    location: 'डोणजे / आतकरवाडी, ता. हवेली, जि. पुणे',
    lat: 18.3663,
    lng: 73.7558,
    altitude: '४,३०४ फूट (१,३१२ मी.)',
    trekDifficulty: 'सोपे ते मध्यम (आतकरवाडी पायऱ्या किंवा थेट घाट रस्ता)',
    baseVillage: 'आतकरवाडी / डोणजे पायथा',
    image: '/assets/images/real-sinhagad-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'इ.स. १६७० च्या ऐतिहासिक सिंहगड संग्रामाचे रणपीठ; "गड आला पण सिंह गेला" या शिववचनाने अजरामर झालेले शौर्यस्थळ.',
    significance: 'सुभेदार तानाजी मालुसरे यांनी घोरपडीच्या साहाय्याने सर केलेला कडा, उदयभानू विरुद्ध तुंबळ लढाई आणि नरवीर तानाजींची समाधी.',
    connectedFort: 'राजगड, तोरणा, पुरंदर',
    connectedTemple: 'कोंढाणेश्वर प्राचीन महादेव मंदिर',
    connectedFood: 'गरमागरम पिठलं-भाकरी, कांदा भजी व मटका दही',
    tourRoute: 'पुणे → स्वारगेट → खडकवासला धरण → सिंहगड घाट रस्ता → पुणे दरवाजा',
    reference: 'बॉम्बे गॅझेटिअर (पुणे खंड) व सभासद बखर',
    connectedLinks: ['event_panhala_siege'],
    sitePlan: [
      { name: 'पुणे दरवाजा', desc: 'पुण्याच्या दिशेला तोंड असणारा त्रिस्तरीय महादरवाजा' },
      { name: 'कल्याण दरवाजा', desc: 'कोंढाणा मोहिमेत मावळ्यांनी उघडलेला दक्षिण दरवाजा' },
      { name: 'तानाजी मालुसरे समाधी व पुतळा', desc: 'नरवीर सुभेदारांचे पवित्र शौर्य स्मारक' },
      { name: 'तानाजी कडा', desc: 'रात्रीच्या अंधारात सर केलेला उत्तुंग उभा कडा' },
      { name: 'देवटाके', desc: 'थंडगार गोड्या पाण्याचे नैसर्गिक दगडी टाके' },
      { name: 'टिळक बंगला', desc: 'लोकमान्य टिळक व महात्मा गांधींची ऐतिहासिक भेट स्थळ' }
    ]
  },
  {
    id: 'pin_pratapgad',
    title: 'किल्ले प्रतापगड (जावळीचे खोरे)',
    category: 'forts',
    region: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    district: 'सातारा',
    location: 'महाबळेश्वर जवळ, जि. सातारा',
    lat: 17.9333,
    lng: 73.5833,
    altitude: '३,५४३ फूट (१,०८० मी.)',
    trekDifficulty: 'सोपे (पायऱ्यांची चढाई)',
    baseVillage: 'कुंभारोशी / प्रतापगड पायथा',
    image: '/assets/images/real-pratapgad-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: '१० नोव्हेंबर १६५९ च्या अफझलखान वधाची ऐतिहासिक रणभूमी; छत्रपती शिवरायांनी स्थापन केलेले आई भवानीचे पाषाण मंदिर.',
    significance: 'मोरोपंत पिंगळे यांनी जावळीच्या घनदाट अरण्यात बांधलेला बालेकिल्ला. अफझलखानाचा कोथळा बाहेर काढून विजापूरच्या बलाढ्य सैन्याचा पराभव.',
    connectedFort: 'मकरंदगड, वासोटा, सज्जनगड',
    connectedTemple: 'आई भवानी माता मंदिर (गंडकी शिळा)',
    connectedFood: 'चुलीवरची बाजरी भाकरी, ठेचा व सातारची कंदी पेढे',
    tourRoute: 'सातारा/पुणे → वाई → महाबळेश्वर → प्रतापगड पायथा',
    reference: 'शिवभारत व जेधे शकावली समकालीन संदर्भ',
    connectedLinks: ['event_rajyabhishek'],
    sitePlan: [
      { name: 'अफझलखान भेट शामियाना स्थळ', desc: '१० नोव्हेंबर १६५९ च्या भेटीची जागा' },
      { name: 'अफझलखानाची कबर', desc: 'पायथ्याशी बांधलेली ऐतिहासिक कबर' },
      { name: 'आई भवानी मंदिर', desc: 'नेपाळच्या गंडकी नदीतील शिळेपासून घडवलेली मूर्ती' },
      { name: 'बालेकिल्ला व ध्वजस्तंभ', desc: 'जावळीच्या संपूर्ण खोऱ्यावर नजर ठेवणारा गडमाथा' },
      { name: 'रेडे बुरुज व तटबंदी', desc: 'अभंग दक्षिण बुरुज' }
    ]
  },
  {
    id: 'pin_panhala',
    title: 'किल्ले पन्हाळा (पर्णालपर्वत)',
    category: 'forts',
    region: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    district: 'कोल्हापूर',
    location: 'पन्हाळा, जि. कोल्हापूर',
    lat: 16.8118,
    lng: 74.1102,
    altitude: '२,७७२ फूट (८४५ मी.)',
    trekDifficulty: 'अत्यंत सोपे (थेट वाहन पोहोचते)',
    baseVillage: 'पन्हाळा शहर',
    image: '/assets/images/real-panhala-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'शिलाहार कालीन राजधानी आणि १६६० च्या सिद्धी जौहर वेढ्यातून छत्रपती शिवरायांच्या अद्भूत सुटकेचे ऐतिहासिक केंद्र.',
    significance: 'शिवा काशिद यांचे बलिदान, बाजीप्रभूंची पावनखिंड लढाई, सज्जा कोठी आणि तिहेरी धान्य कोठारे (अंबरखाना).',
    connectedFort: 'विशाळगड, बावडा, रांगणा',
    connectedTemple: 'ज्योतिबा मंदिर (वाडी रत्नागिरी)',
    connectedFood: 'कोल्हापुरी तांबडा-पांढरा रस्सा व मटण थाळी',
    tourRoute: 'कोल्हापूर → पन्हाळा (१८ किमी) → सज्जा कोठी → तीन दरवाजा',
    reference: 'पुरातत्त्व सर्वेक्षण व कोल्हापूर गॅझेटिअर',
    connectedLinks: ['event_panhala_siege', 'tambda_pandhra_rassa'],
    sitePlan: [
      { name: 'तीन दरवाजा', desc: 'दुहेरी तटबंदी व गुप्त खिडक्या असणारा भव्य दरवाजा' },
      { name: 'सज्जा कोठी', desc: 'वेढ्याच्या वेळी संभाजी महाराज व शिवरायांचे विश्रामस्थान' },
      { name: 'अंबरखाना', desc: 'गंगा, यमुना व सरस्वती नावाची २५,००० खंडी धान्याची कोठारे' },
      { name: 'पुतळा - शिवा काशिद व बाजीप्रभू', desc: 'स्वामिनिष्ठ वीरांची स्मारके' },
      { name: 'अंधारबाव', desc: 'शत्रूच्या हालचालींवर लक्ष ठेवणारी तीन मजली विहीर' }
    ]
  },
  {
    id: 'pin_kailasa',
    title: 'कैलास मंदिर (वेरूळ लेणी संकुल)',
    category: 'unesco',
    region: 'मराठवाडा (Marathwada)',
    district: 'छत्रपती संभाजीनगर',
    location: 'वेरूळ, ता. खुलताबाद, जि. छत्रपती संभाजीनगर',
    lat: 20.0268,
    lng: 75.1780,
    altitude: '२,१०० फूट (६४० मी.)',
    trekDifficulty: 'अत्यंत सोपे (रस्ता व पादचारी मार्ग)',
    baseVillage: 'वेरूळ गाव',
    image: '/assets/images/real-ellora-kailash.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'UNESCO World Heritage (गुहा क्र. १६); राष्ट्रकूट सम्राट कृष्ण प्रथम (इ.स. ७५६-७७३) यांनी एकाच अखंड पाषाणात वरून खाली कोरून काढलेले जगातील सर्वात मोठे शैलशिल्प.',
    significance: '२ लाख टन काळा पाषाण हाताने खोदून काढलेला स्थापत्य चमत्कार. रावणानुग्रह शिल्पपट, हत्ती आधारस्तंभ व ३ मजली मंदिर शिखर.',
    connectedFort: 'दौलताबाद (देवगिरी) किल्ला',
    connectedTemple: 'श्री घृष्णेश्वर १२ वे ज्योतिर्लिंग',
    connectedFood: 'मराठवाडी धपाटे, ज्वारी भाकरी व ठेचा',
    tourRoute: 'छत्रपती संभाजीनगर → दौलताबाद किल्ला → घृष्णेश्वर → वेरूळ लेणी',
    reference: 'UNESCO World Heritage List 243 व ASI दस्तऐवज',
    connectedLinks: ['event_ellora_creation', 'kailasa_ellora'],
    sitePlan: [
      { name: 'प्रवेश गोपुरम', desc: 'पाषाणात कोरलेले दोन मजली प्रवेशद्वार' },
      { name: 'नंदी मंडप', desc: 'अखंड दगडात कोरलेली नंदी मूर्ती व छत' },
      { name: 'ध्वजस्तंभ (Victory Pillars)', desc: 'दोन उत्तुंग ३० फूट दगडी दीपस्तंभ' },
      { name: 'विशाल हत्ती मालिका', desc: 'मंदिराचा भार वाहणारे सजीव वाटणारे पाषाण हत्ती' },
      { name: 'मुख्य गर्भगृह व विमान', desc: '९६ फूट उंच कैलास शिखर व शिवलिंग' },
      { name: 'रावणानुग्रह शिल्पपट', desc: 'रावण दोन्ही हातांनी कैलास पर्वत थरथर कापतानाचे शिल्प' }
    ]
  },
  {
    id: 'pin_jejuri',
    title: 'जेजुरी खंडोबा गड (सोन्याची जेजुरी)',
    category: 'gramdevat',
    region: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    district: 'पुणे',
    location: 'जेजुरी, ता. पुरंदर, जि. पुणे',
    lat: 18.2778,
    lng: 74.1593,
    altitude: '२,४०० फूट (७३० मी.)',
    trekDifficulty: 'सोपे (ऐतिहासिक २००+ पायऱ्या किंवा वाहन रस्ता)',
    baseVillage: 'जेजुरी शहर',
    image: '/assets/images/real-jejuri-khandoba.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'महाराष्ट्राचे कुलदैवत मार्तंड भैरव जेजुरी; पिवळाधमक भंडारा उधळण, "येळकोट येळकोट जय मल्हार" चा गजर आणि किल्लेवजा हेमाडपंथी मंदिर.',
    significance: 'मराठा सरदार, होळकर घराणे आणि बहुजन समाजाचे आराध्य दैवत. चिमाजी आप्पांनी वसई विजयानंतर अर्पण केलेली पोर्तुगीज पितळी घंटा.',
    connectedFort: 'पुरंदर किल्ला व वज्रगड',
    connectedTemple: 'भुलेश्वर मंदिर व कडेपठार',
    connectedFood: 'जेजुरीची मटकी उसळ व कांद्याची भजी',
    tourRoute: 'पुणे → हडपसर → सासवड → जेजुरी खंडोबा मंदिर',
    reference: 'पुणे जिल्हा गॅझेटिअर व पुराभिलेख',
    connectedLinks: ['khandoba_jejuri', 'puran_poli'],
    sitePlan: [
      { name: 'ऐतिहासिक दीपमाळा व कमानी', desc: 'भंडारा उधळणीने पिवळ्या झालेल्या शेकडो दीपमाळा' },
      { name: 'महादरवाजा व नगारखाना', desc: 'किल्लेवजा मजबूत दगडी बुरुज प्रवेश' },
      { name: 'मुख्य मार्तंड भैरव गर्भगृह', desc: 'खंडोबा व म्हाळसाबाई स्वयंभू मूर्ती' },
      { name: 'पोर्तुगीज घंटा', desc: 'वसईच्या मोहिमेनंतर चिमाजी आप्पांनी अर्पण केलेली महाघंटा' },
      { name: 'कडेपठार (मूळ स्थान)', desc: 'डोंगराच्या टोकावरील खंडोबाचे मूळ आदिस्थान' }
    ]
  },
  {
    id: 'pin_tuljapur',
    title: 'श्री क्षेत्र तुळजापूर (आई भवानी)',
    category: 'gramdevat',
    region: 'मराठवाडा (Marathwada)',
    district: 'धाराशिव',
    location: 'तुळजापूर, जि. धाराशिव',
    lat: 18.0069,
    lng: 76.0827,
    altitude: '२,१२६ फूट (६४८ मी.)',
    trekDifficulty: 'अत्यंत सोपे (शहराच्या मध्यभागी)',
    baseVillage: 'तुळजापूर शहर',
    image: '/assets/images/real-tuljabhavani-temple.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'महाराष्ट्राची कुलस्वामिनी, साडेतीन शक्तिपीठांपैकी स्वयंसिद्ध पूर्ण पीठ आणि छत्रपती शिवरायांना भवानी तलवार प्रदान करणारी अधिष्ठात्री.',
    significance: 'स्वराज्य स्थापनेची मुख्य प्रेरणा. कलोल तीर्थ, गोमुख तीर्थ, अष्टभुजा महिषासुरमर्दिनी मूर्ती आणि अश्विन नवरात्र महाउत्सव.',
    connectedFort: 'नळदुर्ग किल्ला (पाणी महाल)',
    connectedTemple: 'घटोत्कच व यमाई देवी मंदिर',
    connectedFood: 'तुळजापूरची डाळ-बट्टी व शेंगदाणा चटणी',
    tourRoute: 'सोलापूर / धाराशिव → तुळजापूर महामार्ग',
    reference: 'धाराशिव गॅझेटिअर व देवस्थान न्यास नोंदी',
    connectedLinks: ['tuljabhavani_tuljapur'],
    sitePlan: [
      { name: 'कलोल तीर्थ', desc: 'गंगा, यमुना व सरस्वती संगमाचे पवित्र कुंड' },
      { name: 'गोमुख तीर्थ', desc: 'अखंड वाहणारा पाषाण जलप्रवाह' },
      { name: 'मुख्य गर्भगृह', desc: 'अष्टभुजा महिषासुरमर्दिनी आई भवानी मूर्ती' },
      { name: 'पलंग व शेजघर', desc: 'आई भवानीच्या वर्षातील निद्रा काळाचे स्थान' },
      { name: 'होमकुंड', desc: 'नवरात्र उत्सवातील अखंड यज्ञाचे पवित्र कुंड' }
    ]
  },
  {
    id: 'pin_kolhapur_mahalaxmi',
    title: 'करवीर निवासिनी श्री महालक्ष्मी (अंबाबाई)',
    category: 'temples',
    region: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    district: 'कोल्हापूर',
    location: 'कोल्हापूर शहर, जि. कोल्हापूर',
    lat: 16.6944,
    lng: 74.2238,
    altitude: '१,८६० फूट (५६७ मी.)',
    trekDifficulty: 'अत्यंत सोपे (शहर मध्यवर्ती)',
    baseVillage: 'कोल्हापूर शहर',
    image: '/assets/images/real-south-kolhapur-mahalaxmi.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'साडेतीन शक्तिपीठांपैकी एक आद्य महापीठ; वर्षातून दोनदा प्रत्यक्ष सूर्यकिरणे देवीच्या चरणांवर पडणारा किरणोत्सव स्थापत्य चमत्कार.',
    significance: 'शिलाहार व चालुक्य राजांच्या काळातील (७ वे ते ११ वे शतक) समृद्ध हेमाडपंथी दगडी मंदिर. छत्रपती शाहू महाराजांचे श्रद्धास्थान.',
    connectedFort: 'पन्हाळा किल्ला, विशाळगड',
    connectedTemple: 'जोतिबा (वाडी रत्नागिरी) व कोपेश्वर (खिद्रापूर)',
    connectedFood: 'कोल्हापुरी तांबडा-पांढरा रस्सा, मिसळ व गुळाची जिलेबी',
    tourRoute: 'पुणे/बंगळूर राष्ट्रीय महामार्ग → कोल्हापूर शहर मध्यवर्ती',
    reference: 'बॉम्बे गॅझेटिअर (कोल्हापूर खंड) व करवीर महात्म्य',
    connectedLinks: ['tambda_pandhra_rassa'],
    sitePlan: [
      { name: 'गरुड मंडप', desc: 'भव्य लाकडी कोरीव मंडप' },
      { name: 'मुख्य महालक्ष्मी गर्भगृह', desc: 'चमकणाऱ्या काळ्या पाषाणातील श्रीमहालक्ष्मी' },
      { name: 'सूर्यकिरण मार्ग', desc: 'किरणोत्सवासाठी अचूक कोनात रचलेले दरवाजे' },
      { name: 'मणिकर्णिका कुंड', desc: 'मंदिराच्या आवारातील पवित्र जलतीर्थ' }
    ]
  },
  {
    id: 'pin_trimbakeshwar',
    title: 'श्री क्षेत्र त्र्यंबकेश्वर (ज्योतिर्लिंग)',
    category: 'temples',
    region: 'उत्तर महाराष्ट्र (North Maharashtra / Nashik)',
    district: 'नाशिक',
    location: 'त्र्यंबकेश्वर, जि. नाशिक',
    lat: 19.9324,
    lng: 73.5308,
    altitude: '२,३९० फूट (७२८ मी.)',
    trekDifficulty: 'सोपे (ब्रह्मगिरी ट्रेक मध्यम)',
    baseVillage: 'त्र्यंबकेश्वर शहर',
    image: '/assets/images/real-trimbakeshwar.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'भारतातील १२ ज्योतिर्लिंगांपैकी एक; ब्रह्मा, विष्णू व महेश या त्रिमूर्तींचे संयुक्त शिवलिंग आणि दक्षिण गंगा गोदावरी नदीचे उगमस्थान.',
    significance: 'सिंहस्थ कुंभमेळ्याचे पावन केंद्र. नानासाहेब पेशवे यांनी संपूर्ण काळ्या पाषाणात बांधलेले भव्य मंदिर आणि पवित्र कुशावर्त कुंड.',
    connectedFort: 'ब्रह्मगिरी, भास्करगड, हरघर',
    connectedTemple: 'गंगाद्वार व कपालेश्वर',
    connectedFood: 'नाशिक मिसळ व बाजरीची भाकरी',
    tourRoute: 'नाशिक → त्र्यंबकेश्वर (२८ किमी)',
    reference: 'नाशिक गॅझेटिअर व MTDC सिंहस्थ दस्तऐवज',
    connectedLinks: [],
    sitePlan: [
      { name: 'कुशावर्त तीर्थकुंड', desc: 'गोदावरी प्रगट स्थान व कुंभमेळा स्नान कुंड' },
      { name: 'काळ्या पाषाणातील मुख्य मंदिर', desc: 'नानासाहेब पेशवे कालीन भव्य वास्तुकला' },
      { name: 'त्रिमूर्ती गर्भगृह', desc: 'ब्रह्मा, विष्णू, महेश तीन लिंगांचे संयुक्त स्थान' },
      { name: 'ब्रह्मगिरी डोंगर मार्ग', desc: 'गोदावरी उगमस्थानाकडे जाणारा ७५० पायऱ्यांचा मार्ग' }
    ]
  },
  {
    id: 'pin_saoji_nagpur',
    title: 'नागपूर सावजी खाद्य केंद्र',
    category: 'food',
    region: 'विदर्भ (Vidarbha / Varhad)',
    district: 'नागपूर',
    location: 'गांधीबाग / इतवारी, नागपूर',
    lat: 21.1458,
    lng: 79.0882,
    altitude: '१,०१७ फूट (३१० मी.)',
    trekDifficulty: 'अत्यंत सोपे (महानगरीय रस्ता)',
    baseVillage: 'नागपूर शहर',
    image: '/assets/images/real-vidarbha-saoji.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_2,
    desc: '३२ मसाल्यांच्या गुप्त मिश्रणातून तयार होणाऱ्या अस्सल सावजी मटण, पातोडी रस्सा, चपाती व तरी थाळी नागपूर खाद्यपरंपरेचे माहेरघर.',
    significance: 'हलबा कोष्टी विणकर समाजाने शतकानुशतके जपलेली गुप्त पाककृती. विदर्भाच्या अस्सल झणझणीत चवीची व खानावळींची ओळख.',
    connectedFort: 'गावीलगड, नगरधन किल्ला',
    connectedTemple: 'टेकडी गणेश व रामटेक गडमंदिर',
    connectedFood: 'सावजी मटण, गोळा भात व संत्रा बर्फी',
    tourRoute: 'नागपूर रेल्वे स्टेशन → इतवारी / महाल सावजी मार्ग',
    reference: 'विदर्भ साहित्य संघ नोंदी व हेरिटेज फोरम',
    connectedLinks: ['saoji_mutton'],
    sitePlan: [
      { name: 'इतवारी जुनी पेठ', desc: 'शतकानुशतके चालत आलेली अस्सल खानावळ गल्ली' },
      { name: 'गांधीबाग परिसर', desc: 'पारंपरिक हातमाग विणकर वसाहत व सावजी पाकशाळा' }
    ]
  },
  {
    id: 'pin_ajanta',
    title: 'अजिंठा जागतिक वारसा लेणी (Ajanta Caves)',
    category: 'unesco',
    region: 'मराठवाडा (Marathwada)',
    district: 'छत्रपती संभाजीनगर',
    location: 'अजिंठा, ता. सोयगाव, जि. छत्रपती संभाजीनगर',
    lat: 20.5519,
    lng: 75.7033,
    altitude: '१,९०० फूट (५८० मी.)',
    trekDifficulty: 'मध्यम (वाघूर नदी व दरीतील पादचारी मार्ग)',
    baseVillage: 'फरदापूर / अजिंठा पायथा',
    image: '/assets/images/real-ajanta-caves.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'UNESCO World Heritage (इ.स.पू. २ रे शतक ते ६ वे शतक); वाघूर नदीच्या अर्धचंद्राकृती घळीत कोरलेली ३० बौद्ध शैलकृत लेणी व अप्रतिम भित्तीचित्रे.',
    significance: 'बोधिसत्व पद्मपाणी व वज्रपाणी यांची अमर जागतिक भित्तीचित्रे, जातक कथा आणि प्राचीन भारतीय चित्रकलेचा जागतिक मानदंड.',
    connectedFort: 'वेताळवाडी किल्ला (जवळच)',
    connectedTemple: 'घृष्णेश्वर ज्योतिर्लिंग',
    connectedFood: 'मराठवाडी धपाटे व शेंगदाणा चटणी',
    tourRoute: 'छत्रपती संभाजीनगर / जळगाव → फरदापूर टी-पॉइंट → अजिंठा व्ह्यू पॉइंट',
    reference: 'UNESCO World Heritage Site 242 व ASI पुराभिलेख',
    connectedLinks: ['kailasa_ellora'],
    sitePlan: [
      { name: 'लेणी क्र. १ (पद्मपाणी)', desc: 'बोधिसत्व पद्मपाणी व वज्रपाणी यांची विश्वविख्यात भित्तीचित्रे' },
      { name: 'लेणी क्र. ९ व १०', desc: 'सर्वात प्राचीन हीनयान चैत्यगृहे (इ.स.पू. २ रे शतक)' },
      { name: 'लेणी क्र. १९ व २६', desc: 'भव्य कोरीव महापरिनिर्वाण बुद्ध मूर्ती व स्तूपांचे चैत्य' },
      { name: 'वाघूर नदी घळ दृश्य', desc: 'नैसर्गिक अर्धचंद्राकृती दरी व धबधबा' }
    ]
  },
  {
    id: 'pin_jotiba_yatra',
    title: 'श्री क्षेत्र जोतिबा चैत्र पौर्णिमा महायात्रा',
    category: 'jatra',
    region: 'पश्चिम महाराष्ट्र (Western Maharashtra / Desh)',
    district: 'कोल्हापूर',
    location: 'वाडी रत्नागिरी (जोतिबा डोंगर), ता. पन्हाळा, जि. कोल्हापूर',
    lat: 16.8016,
    lng: 74.1772,
    altitude: '३,१२४ फूट (९५२ मी.)',
    trekDifficulty: 'सोपे (डोंगर रस्ता व ऐतिहासिक पायऱ्या)',
    baseVillage: 'वाडी रत्नागिरी / जोतिबा डोंगर',
    image: '/assets/images/real-jotiba-wadi-ratnagiri.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'महाराष्ट्रातील सर्वात मोठी गुलाल-खोबरे उधळणीची चैत्र यात्रा; "चांगभलं" च्या गजरात लाखो सासनकाठ्यांचे भव्य नृत्य व शिखर दर्शन.',
    significance: 'केदारलिंग ज्योतिबा हे दक्षिण महाराष्ट्राचे कुलदैवत. हिंमतबहादूर चव्हाण घराण्याची व मानाच्या सासनकाठ्यांची शेकडो वर्षांची परंपरा.',
    connectedFort: 'पन्हाळा किल्ला (१० किमी अंतरावर)',
    connectedTemple: 'करवीर निवासिनी श्री महालक्ष्मी अंबाबाई',
    connectedFood: 'कोल्हापुरी तांबडा-पांढरा रस्सा व पुरणपोळी महाप्रसाद',
    tourRoute: 'कोल्हापूर शहर → केर्ली → वाडी रत्नागिरी (१८ किमी)',
    reference: 'कोल्हापूर जिल्हा गॅझेटिअर व जोतिबा देवस्थान न्यास',
    connectedLinks: ['tambda_pandhra_rassa'],
    sitePlan: [
      { name: 'मुख्य केदारलिंग मंदिर', desc: 'काळ्या पाषाणातील अष्टकोनी प्राचीन शिखर' },
      { name: 'सासनकाठी चौक', desc: 'मानाची सासनकाठ्यांची भव्य मिरवणूक जागा' },
      { name: 'यमाई मंदिर व दीपमाळा', desc: 'डोंगराच्या माथ्यावरील पवित्र तीर्थक्षेत्र' }
    ]
  },
  {
    id: 'pin_anganewadi',
    title: 'आंगणेवाडी श्री भराडीदेवी जत्रा',
    category: 'jatra',
    region: 'कोकण (Konkan)',
    district: 'सिंधुदुर्ग',
    location: 'आंगणेवाडी, ता. मालवण, जि. सिंधुदुर्ग',
    lat: 16.0385,
    lng: 73.4912,
    altitude: 'समुद्रसपाटी जवळ',
    trekDifficulty: 'अत्यंत सोपे (रस्ता मार्ग)',
    baseVillage: 'आंगणेवाडी',
    image: '/assets/images/real-bharadidevi-anganewadi.jpg',
    confidence: CONFIDENCE_LEVELS.TRADITIONAL,
    tier: SOURCE_TIERS.TIER_4,
    desc: 'दक्षिण कोकणातील सुप्रसिद्ध जत्रा; दीड दिवसाच्या अखंड जत्रेत लाखो भाविक ताटातील नवसाची ओटी भरण्यासाठी एकत्र येतात.',
    significance: 'आंगणे कुटुंबीयांचे मानकरीपण. देवीचा कौल घेऊन दरवर्षी फेब्रुवारीत तारीख निश्चित होते. अथांग भक्ती व सामूहिक महाप्रसाद.',
    connectedFort: 'सिंधुदुर्ग किल्ला (१२ किमी)',
    connectedTemple: 'कुणकेश्वर महादेव मंदिर',
    connectedFood: 'कोकणी भात, आमटी व काकडीची उसळ',
    tourRoute: 'कणकवली / कुडाळ → मालवण रस्ता → आंगणेवाडी',
    reference: 'आंगणेवाडी ग्रामस्थ मंडळ नोंदवही व मौखिक परंपरा',
    connectedLinks: ['bharadi_devi_anganewadi', 'sol_kadhi'],
    sitePlan: [
      { name: 'मुख्य भराडीदेवी मंदिर', desc: 'कौलारू कोकणी वास्तुकलेतील स्वयंभू पाषाण' },
      { name: 'नवस ओटी मंडप', desc: 'लाखो महिलांची शिस्तीत चालणारी ओटी भरण्याची जागा' },
      { name: 'महाप्रसाद अन्नछत्र', desc: 'रात्रभर चालणारा अथांग भोजन सोहळा' }
    ]
  },
  {
    id: 'pin_vijaydurg',
    title: 'किल्ले विजयदुर्ग (घेरिया जलदुर्ग)',
    category: 'forts',
    region: 'कोकण (Konkan)',
    district: 'सिंधुदुर्ग',
    location: 'विजयदुर्ग, ता. देवगड, जि. सिंधुदुर्ग',
    lat: 16.5594,
    lng: 73.3328,
    altitude: 'समुद्रसपाटीवर (वाघोटन खाडी मुख)',
    trekDifficulty: 'सोपे (थेट रस्ता संपर्क)',
    baseVillage: 'विजयदुर्ग गाव',
    image: '/assets/images/forts/vijaydurg-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'सरखेल कान्होजी आंग्रे यांच्या आरमाराचे मुख्य ठाणे आणि छत्रपती शिवाजी महाराजांनी समुद्रात २० फूट रुंद पाण्याखालील भिंत उभारून अजिंक्य केलेला जलदुर्ग.',
    significance: 'इ.स. १६५३ मध्ये शिवरायांनी जिंकून याचे नाव "विजयदुर्ग" ठेवले. वाघोटन खाडीच्या मुखावरील तिहेरी तटबंदी, गुप्त भुयारे आणि समुद्राखालील नैसर्गिक संरक्षण भिंत.',
    connectedFort: 'सिंधुदुर्ग, देवगड, सुवर्णदुर्ग',
    connectedTemple: 'कुणकेश्वर महादेव व रामेश्वर मंदिर',
    connectedFood: 'देवगड हापूस आंबा, सोलकढी व मालवणी जेवण',
    tourRoute: 'तळेरे / कणकवली → देवगड → विजयदुर्ग बंदर',
    reference: 'बॉम्बे गॅझेटिअर व भारतीय पुरातत्त्व सर्वेक्षण (ASI)',
    connectedLinks: ['sol_kadhi'],
    sitePlan: [
      { name: 'गोमुखी महादरवाजा', desc: 'शत्रूच्या तोफांच्या टप्प्याबाहेर असणारा मुख्य दरवाजा' },
      { name: 'पाण्याखालील गुप्त भिंत', desc: 'शत्रूची जहाजे अडकवण्यासाठी समुद्राखाली रचलेली दगडी भिंत' },
      { name: 'सदर व ध्वजस्तंभ', desc: 'आरमारी अधिकाऱ्यांचे खलबतखाना केंद्र' },
      { name: 'तोफखाना व दारूगोळा कोठार', desc: 'अनेक ऐतिहासिक तोफा आजही सुस्थितीत' }
    ]
  },
  {
    id: 'pin_suvarnadurg',
    title: 'किल्ले सुवर्णदुर्ग (सोनेरी जलदुर्ग)',
    category: 'forts',
    region: 'कोकण (Konkan)',
    district: 'रत्नागिरी',
    location: 'हर्णे बंदर, ता. दापोली, जि. रत्नागिरी',
    lat: 17.8153,
    lng: 73.0917,
    altitude: 'समुद्रसपाटीवर (हर्णे बेट)',
    trekDifficulty: 'सोपे ते मध्यम (हर्णे बंदरावरून स्थानिक होडी)',
    baseVillage: 'हर्णे कोळीवाडा',
    image: '/assets/images/forts/suvarnadurg-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'मराठा आरमाराचे उत्तर कोकणातील अजिंक्य केंद्र; हर्णे बंदराच्या संरक्षणासाठी समुद्रात ८ एकरांवर वसलेला ऐतिहासिक जलदुर्ग.',
    significance: 'कान्होजी आंग्रेंचे जन्मस्थान व कार्यभूमी. लाटांचे प्रचंड तडाखे सहन करणारी काळ्या पाषाणातील अभेद्य तटबंदी.',
    connectedFort: 'कनकदुर्ग, फत्तेदुर्ग, गोवा किल्ला',
    connectedTemple: 'हर्णे मुरुड दुर्गादेवी मंदिर',
    connectedFood: 'कोकणी पोहे, घावणे व पापलेट फ्राय',
    tourRoute: 'दापोली → हर्णे बंदर (१६ किमी) → सुवर्णदुर्ग होडी प्रवास',
    reference: 'रत्नागिरी जिल्हा गॅझेटिअर व पुराभिलेख',
    connectedLinks: ['sol_kadhi'],
    sitePlan: [
      { name: 'समुद्र दरवाजा', desc: 'समुद्रातून थेट आत जाणारा गुप्त दरवाजा' },
      { name: 'महादरवाजा व वाघ शिल्पे', desc: 'मराठा स्थापत्याचे शौर्यचिन्ह' },
      { name: 'गोड्या पाण्याचे टाके', desc: 'समुद्राच्या मध्यभागी असणारे पिण्यायोग्य पाण्याचे टाके' }
    ]
  },
  {
    id: 'pin_murud_janjira',
    title: 'मुरुड-जंजिरा जलदुर्ग',
    category: 'forts',
    region: 'कोकण (Konkan)',
    district: 'रायगड',
    location: 'मुरुड, जि. रायगड',
    lat: 18.3007,
    lng: 72.9634,
    altitude: 'समुद्रसपाटीवर (अरबी समुद्र बेट)',
    trekDifficulty: 'सोपे (राजपुरी जेटीवरून शिडाची बोट)',
    baseVillage: 'राजपुरी / मुरुड',
    image: '/assets/images/forts/janjira-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'अरबी समुद्राच्या लाटांवर उभा असलेला अभेद्य बेट-किल्ला; ज्याला छत्रपती संभाजी महाराजांनी समुद्रात पूल बांधूनही वेढा घातला होता.',
    significance: '१९ भव्य बुरुज, कलाल बांगडी तोफ, समुद्राच्या मधोमध असणारे दोन गोड्या पाण्याचे महातलाव आणि मजबूत तटबंदी.',
    connectedFort: 'पद्मदुर्ग (कासा किल्ला)',
    connectedTemple: 'दत्त मंदिर (मुरुड टेकडी)',
    connectedFood: 'आगरी-कोळी पद्धतीची मासळी व सोलकढी',
    tourRoute: 'रोहा / अलिबाग → मुरुड → राजपुरी जेटी → जंजिरा बोट',
    reference: 'बॉम्बे गॅझेटिअर (कुलाबा) व पुरातत्त्व अभिलेख',
    connectedLinks: ['sol_kadhi'],
    sitePlan: [
      { name: 'महादरवाजा', desc: 'अतिशय जवळ गेल्याशिवाय न दिसणारा वळणदार दरवाजा' },
      { name: 'कलाल बांगडी व लांडा कासम तोफ', desc: 'ऐतिहासिक पंचधातूच्या प्रचंड तोफा' },
      { name: 'गोड्या पाण्याचे तलाव', desc: 'खारट समुद्राच्या मध्यभागी दोन विस्तीर्ण गोड्या पाण्याची तळी' },
      { name: 'सुभेदार वाडा व सदर', desc: 'ऐतिहासिक बहुमजली अवशेष' }
    ]
  },
  {
    id: 'pin_kolaba',
    title: 'किल्ले कुलाबा (अलिबाग जलदुर्ग)',
    category: 'forts',
    region: 'कोकण (Konkan)',
    district: 'रायगड',
    location: 'अलिबाग समुद्रकिनारा, जि. रायगड',
    lat: 18.6366,
    lng: 72.8647,
    altitude: 'समुद्रसपाटीवर (ओहोटीच्या वेळी चालत जाता येते)',
    trekDifficulty: 'अत्यंत सोपे (ओहोटीच्या वेळी पायी किंवा घोडागाडीने)',
    baseVillage: 'अलिबाग शहर',
    image: '/assets/images/forts/kolaba-fort.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'छत्रपती शिवाजी महाराजांच्या कारकिर्दीतील अखेरचा बांधलेला सागरी किल्ला; कान्होजी आंग्रे व मराठा आरमाराची प्रमुख राजधानी.',
    significance: 'इ.स. १६८०-८१ मध्ये छत्रपती शिवरायांनी काम सुरू करून छत्रपती संभाजी महाराजांनी पूर्ण केला. ओहोटीच्या वेळी समुद्रातून चालत जाण्याचा अनोखा अनुभव.',
    connectedFort: 'खांदेरी, उंदेरी, पद्मदुर्ग',
    connectedTemple: 'सिद्धिविनायक मंदिर (गडाच्या आत)',
    connectedFood: 'अलिबागचे पांढरे कांदे व सुरमई थाळी',
    tourRoute: 'मुंबई (भाऊचा धक्का/मांडवा) → अलिबाग समुद्रकिनारा → कुलाबा किल्ला',
    reference: 'ASI राष्ट्रीय संरक्षित स्मारक व कुलाबा गॅझेटिअर',
    connectedLinks: ['sol_kadhi'],
    sitePlan: [
      { name: 'मुख्य प्रवेशद्वार (महादरवाजा)', desc: 'किनाऱ्याच्या दिशेने असणारा भव्य दगडी दरवाजा' },
      { name: 'सिद्धिविनायक मंदिर', desc: 'कान्होजी आंग्रेंनी बांधलेले सुंदर गणेश मंदिर' },
      { name: 'गोड्या पाण्याचे पुष्करणी कुंड', desc: 'समुद्रात असूनही निर्मळ पाण्याचे कुंड' },
      { name: 'तोफांचे बुरुज', desc: 'अरबी समुद्रावर नियंत्रण ठेवणारे १७ बुरुज' }
    ]
  },
  {
    id: 'pin_ganpatipule',
    title: 'गणपतीपुळे स्वयंभू गणेश मंदिर',
    category: 'temples',
    region: 'कोकण (Konkan)',
    district: 'रत्नागिरी',
    location: 'गणपतीपुळे, ता. जि. रत्नागिरी',
    lat: 17.1444,
    lng: 73.2678,
    altitude: 'समुद्रकिनारी',
    trekDifficulty: 'अत्यंत सोपे (डोंगर प्रदक्षिणा १ किमी)',
    baseVillage: 'गणपतीपुळे',
    image: '/assets/images/real-konkan-ganpatipule.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'अरबी समुद्राच्या वाळूत प्रगट झालेले ४०० वर्षे प्राचीन पश्चिमाभिमुख स्वयंभू गणेश स्थान; भाविक संपूर्ण डोंगरालाच प्रदक्षिणा घालतात.',
    significance: 'अष्टद्वारपाल गणपतींपैकी पश्चिमेचे मुख्य संरक्षक पीठ. छत्रपती शिवाजी महाराजांच्या आज्ञेने छत्रपतींच्या सरदारांनी मंदिराचा जीर्णोद्धार केला होता.',
    connectedFort: 'जयगड किल्ला, रत्नदुर्ग',
    connectedTemple: 'प्राचीन शिवमंदिर व मालगुंड (केशवसुत स्मारक)',
    connectedFood: 'मोदक, सोलकढी, आंबोळी व घावणे',
    tourRoute: 'रत्नागिरी → गणपतीपुळे (२५ किमी सागरी महामार्ग)',
    reference: 'रत्नागिरी गॅझेटिअर व श्री गणपतीपुळे संस्थान',
    connectedLinks: ['sol_kadhi'],
    sitePlan: [
      { name: 'स्वयंभू पाषाण गणेश गर्भगृह', desc: 'पश्चिमाभिमुख वाळूच्या खडकातील स्वयंभू मूर्ती' },
      { name: 'समुद्रकिनारा दर्शन पथ', desc: 'लाटांच्या थेट सान्निध्यातील प्रदक्षिणा' },
      { name: 'डोंगर प्रदक्षिणा मार्ग', desc: 'संपूर्ण डोंगराच्या आकाराला प्रदक्षिणा घालणारा १ किमी मार्ग' }
    ]
  },
  {
    id: 'pin_kunkeshwar',
    title: 'श्री क्षेत्र कुणकेश्वर (दक्षिण कोकण काशी)',
    category: 'temples',
    region: 'कोकण (Konkan)',
    district: 'सिंधुदुर्ग',
    location: 'कुणकेश्वर, ता. देवगड, जि. सिंधुदुर्ग',
    lat: 16.3385,
    lng: 73.2974,
    altitude: 'समुद्रसपाटीवर (खडकाळ किनारा)',
    trekDifficulty: 'सोपे (पायऱ्या उतरून समुद्रकिनाऱ्यावर)',
    baseVillage: 'कुणकेश्वर गाव',
    image: '/assets/images/real-kunkeshwar-temple.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'अरबी समुद्राच्या खडकावर वसलेले ११ व्या शतकातील यादवकालीन भव्य महादेव मंदिर; कोकणची दक्षिण काशी म्हणून विख्यात.',
    significance: 'एका मुस्लिम अरबी व्यापाऱ्याने वादळात जहाज वाचल्यानंतर हे भव्य मंदिर उभारले अशी जनश्रुती. छत्रपती शिवाजी महाराजांनी अनेकदा येथे येऊन दर्शन घेतले होते.',
    connectedFort: 'विजयदुर्ग, देवगड किल्ला, सिंधुदुर्ग',
    connectedTemple: 'आंगणेवाडी भराडीदेवी, रामेश्वर',
    connectedFood: 'देवगड आंबा, तांदळाची भाकरी व काजू उसळ',
    tourRoute: 'नांदगाव / कणकवली → देवगड → कुणकेश्वर (१४ किमी)',
    reference: 'सिंधुदुर्ग गॅझेटिअर व देवस्थान ट्रस्ट',
    connectedLinks: ['bharadi_devi_anganewadi', 'sol_kadhi'],
    sitePlan: [
      { name: 'मुख्य शिव गर्भगृह', desc: 'काळ्या पाषाणातील यादवकालीन नक्षीकाम व शिवलिंग' },
      { name: 'अरबी समुद्र दर्शन कट्टा', desc: 'मंदिराच्या पायऱ्या थेट समुद्राच्या लाटांशी भिडतात' },
      { name: 'महाशिवरात्र यात्रा मैदान', desc: 'लाखो भाविकांच्या दर्शनाची जागा' }
    ]
  },
  {
    id: 'pin_harihareshwar',
    title: 'श्री क्षेत्र हरिहरेश्वर (दक्षिण काशी व काळभैरव)',
    category: 'temples',
    region: 'कोकण (Konkan)',
    district: 'रायगड',
    location: 'हरिहरेश्वर, ता. श्रीवर्धन, जि. रायगड',
    lat: 17.9942,
    lng: 73.0244,
    altitude: 'समुद्रसपाटीवर',
    trekDifficulty: 'सोपे (सागरी प्रदक्षिणा मार्ग खडकाळ)',
    baseVillage: 'हरिहरेश्वर',
    image: '/assets/images/real-harihareshwar-temple.jpg',
    confidence: CONFIDENCE_LEVELS.DOCUMENTED,
    tier: SOURCE_TIERS.TIER_1,
    desc: 'हरी (विष्णू), हर (शिव), आणि ईश्वर (ब्रह्मा) या त्रिमूर्तींचे पावन अधिष्ठान आणि प्रथम काळभैरवाचे दर्शन घेण्याची प्राचीन परंपरा.',
    significance: 'पेशव्यांचे कुलदैवत. समुद्राच्या लाटांनी कोरलेल्या अद्भुत काळ्या पाषाणातील प्रदक्षिणा मार्ग हा निसर्गाचा व स्थापत्याचा चमत्कार आहे.',
    connectedFort: 'बाणकोट किल्ला, सुवर्णदुर्ग, जंजिरा',
    connectedTemple: 'काळभैरव मंदिर, योगेश्वरी मंदिर',
    connectedFood: 'श्रीवर्धनची रोठा सुपारी, पोहे व सोलकढी',
    tourRoute: 'माणगाव → म्हसळा → श्रीवर्धन → हरिहरेश्वर',
    reference: 'कुलाबा गॅझेटिअर व पेशवे दप्तर',
    connectedLinks: ['sol_kadhi'],
    sitePlan: [
      { name: 'काळभैरव मंदिर', desc: 'सर्वप्रथम दर्शनाची परंपरा असणारे रक्षणकर्ते मंदिर' },
      { name: 'हरिहरेश्वर मुख्य मंदिर', desc: '१६ व्या शतकातील लाकडी कोरीव काम व शिवलिंग' },
      { name: 'सागरी प्रदक्षिणा मार्ग', desc: 'समुद्राच्या खडकांमधून जाणारा विहंगम नैसर्गिक प्रदक्षिणा पथ' }
    ]
  }
];

