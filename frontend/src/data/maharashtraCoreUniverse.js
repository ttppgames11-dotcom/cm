/**
 * CONNECT MARATHA — 6 CORE ENGINES & 28 EXPANDED MODULES ARCHITECTURE
 * 
 * Central Knowledge Graph and Interconnected Relationship Backbone for Maharashtra:
 * PERSON ↔ EVENT ↔ PLACE ↔ FORT ↔ TEMPLE ↔ FESTIVAL ↔ FOOD ↔ TRADITION ↔ COMMUNITY ↔ BUSINESS
 */

export const CORE_ENGINES = [
  {
    id: 'calendar',
    title: '१. 📅 दिनदर्शिका प्रणाली (Calendar Engine)',
    subtitle: 'मराठी पंचांग, ३६५ दिवस इतिहास, संत दिनविशेष, सण व वैयक्तिक रिमाइंडर्स',
    icon: '📅',
    color: '#D97706',
    bg: '#FEF3C7',
    route: '/calendar',
    modules: ['1. Maratha Calendar 2.0', '18. Maharashtra Knowledge Quiz', '22. Maharashtra Knowledge Feed']
  },
  {
    id: 'history',
    title: '२. 📚 ज्ञान व इतिहास प्रणाली (Knowledge & History Engine)',
    subtitle: '१२ कालखंड टाइम मशीन, ३५०+ गडकोट, ऐतिहासिक दस्तऐवज, व्यक्ती परिचय व ज्ञानकोश',
    icon: '📚',
    color: '#B91C1C',
    bg: '#FEF2F2',
    route: '/history',
    modules: ['2. History Explorer', '4. Know the Person', '5. Document Library', '17. Connect Learning', '23. Digital Encyclopedia', '25. Knowledge Graph', '26. Trust & Verification']
  },
  {
    id: 'map',
    title: '३. 🗺️ महाराष्ट्र नकाशा व पर्यटन प्रणाली (Map & Tourism Engine)',
    subtitle: 'गडकोट परस्परसंवादी नकाशा, तीर्थक्षेत्रे, वारसा ट्रेल्स व "Build My Maharashtra Trip"',
    icon: '🗺️',
    color: '#0D9488',
    bg: '#CCFBF1',
    route: '/forts',
    modules: ['3. Interactive Fort Map', '10. Temple Heritage Explorer', '11. Maharashtra Tourism', '12. Historical Route Explorer']
  },
  {
    id: 'community',
    title: '४. 👥 समुदाय व मौखिक इतिहास प्रणाली (Community & Oral History Engine)',
    subtitle: '४३,०००+ गाव ज्ञानकोश, मौखिक इतिहास ऑडिओ/व्हिडिओ, आठवणी दालन व कुटुंबवृक्ष',
    icon: '👥',
    color: '#4F46E5',
    bg: '#EEF2FF',
    route: '/community',
    modules: ['6. Marathi Language Explorer', '7. Food Atlas', '8. Clothing & Craft', '9. Performing Arts', '13. Connect Community', '19. Family History', '20. Oral History Archive', '21. Memory Archive']
  },
  {
    id: 'business',
    title: '५. 💼 व्यवसाय व रेफरल CRM प्रणाली (Business & Referral CRM Engine)',
    subtitle: 'मराठा व्यवसाय निर्देशिका, BNI-शैली चॅप्टर्स, रेफरल ट्रॅकिंग व १-to-१ बैठका',
    icon: '💼',
    color: '#C2410C',
    bg: '#FFEDD5',
    route: '/sangam',
    modules: ['14. Business Network', '15. Maharashtra Business Directory', '28. Connect Maratha Dashboard']
  },
  {
    id: 'seva',
    title: '६. 🤝 सेवा व उपक्रम प्रणाली (Seva & Events Engine)',
    subtitle: '२४×७ रक्त मदत, शिक्षण मदत, आपत्ती निवारण, पारदर्शक देणगी व स्वयंसेवक नेटवर्क',
    icon: '🤝',
    color: '#15803D',
    bg: '#DCFCE7',
    route: '/donation',
    modules: ['16. Seva Platform', '27. Contributor System']
  }
];

export const TRUST_STATUS_MAP = {
  verified: { label: 'सप्रमाण पुरावा (Verified)', badgeBg: '#DCFCE7', badgeColor: '#166534', icon: '🟢', desc: 'समकालीन शिलालेख, बखरी, ऐतिहासिक दस्तऐवज किंवा ASI नोंदींद्वारे सिद्ध.' },
  source_backed: { label: 'संदर्भयुक्त (Source-Backed)', badgeBg: '#E0F2FE', badgeColor: '#075985', icon: '🔵', desc: 'मान्यवर इतिहासकार, शासकीय गॅझेटिअर व संशोधक संदर्भांवर आधारित.' },
  traditional: { label: 'पारंपरिक समजूत (Traditional Account)', badgeBg: '#FEF3C7', badgeColor: '#92400E', icon: '🟡', desc: 'पिढ्यानपिढ्या चालत आलेली लोकसमजूत अथवा मौखिक आख्यायिका.' },
  community_contributed: { label: 'समुदाय नोंद (Community Contributed)', badgeBg: '#F3E8FF', badgeColor: '#6B21A8', icon: '🟣', desc: 'स्थानिक नागरिक व अभ्यासकांनी प्रत्यक्ष नोंदवलेली माहिती.' },
  needs_review: { label: 'पुनरावलोकन बाकी (Needs Review)', badgeBg: '#FEE2E2', badgeColor: '#991B1B', icon: '🟠', desc: 'तज्ज्ञ इतिहासकार मंडळाकडे तपासणीसाठी प्रलंबित नोंद.' },
  uncertain: { label: 'अभ्यासकीय मतभेद (Disputed / Uncertain)', badgeBg: '#F1F5F9', badgeColor: '#475569', icon: '⚪', desc: 'इतिहासकारांमध्ये वेगवेगळ्या संदर्भांवरून मतप्रवाह असणारा विषय.' }
};

export const CONTRIBUTOR_ROLES = [
  { id: 'heritage_contributor', title: 'दुर्ग व वारसा रक्षक (Heritage Contributor)', icon: '🏰', points: 150 },
  { id: 'history_researcher', title: 'इतिहास संशोधक (History Researcher)', icon: '📜', points: 200 },
  { id: 'photographer', title: 'वारसा छायाचित्रकार (Heritage Photographer)', icon: '📸', points: 120 },
  { id: 'local_historian', title: 'स्थानिक इतिहासकार (Local Historian)', icon: '🏛️', points: 180 },
  { id: 'cultural_contributor', title: 'सांस्कृतिक अभ्यासक (Cultural Contributor)', icon: '🎭', points: 140 },
  { id: 'translator', title: 'मोडी/भाषा अनुवादक (Language Translator)', icon: '🗣️', points: 160 },
  { id: 'volunteer', title: 'सेवा स्वयंसेवक (Community Volunteer)', icon: '🤝', points: 100 },
  { id: 'business_contributor', title: 'उद्योग मार्गदर्शक (Business Contributor)', icon: '💼', points: 150 },
  { id: 'event_organizer', title: 'उत्सव व मेळावा संयोजक (Event Organizer)', icon: '🎪', points: 130 }
];

export const INTERCONNECTED_ENTITIES = [
  {
    id: 'raigad',
    name: 'दुर्गराज रायगड (Raigad)',
    category: 'fort',
    typeBadge: 'राजधानी व जलदुर्ग',
    tagline: 'अखंड मराठा साम्राज्याची राजधानी व शिवराज्याभिषेक भूमी',
    image: '/assets/images/real-raigad-panoramic.jpg',
    trustStatus: 'verified',
    sourceCitation: 'सभासद बखर, जेधे शकावली, हेन्री ऑक्झिंडेन डायरी (१६७४)',
    connections: {
      person: { name: 'छत्रपती शिवाजी महाराज', role: 'स्वराज्य संस्थापक', route: '/history/shivaji-maharaj' },
      event: { name: 'वैदिक शिवराज्याभिषेक सोहळा (६ जून १६७४)', date: '६ जून १६७४', route: '/history/shivaji-maharaj' },
      place: { name: 'पाचाड गाव (जिजाऊ माँसाहेब समाधी)', district: 'रायगड', route: '/universe' },
      temple: { name: 'जगदीश्वर मंदिर व नगारखाना', deity: 'शिवशंकर', route: '/culture/temples' },
      festival: { name: 'शिवराज्याभिषेक दिनोत्सव (ज्येष्ठ शुद्ध त्रयोदशी)', season: 'मे-जून', route: '/culture/shivkal-festivals' },
      food: { name: 'कोकणी घावणे, सोलकढी व साखरेची पुरणपोळी', region: 'कोकण', route: '/culture/food' },
      tradition: { name: 'दुर्ग पूजा, नगारखाना नौबत वादन व गड फेरफटका', route: '/culture' },
      route: { name: 'स्वराज्य राजधानी मार्ग: पुणे → तोरणा → राजगड → रायगड', days: '२ ते ३ दिवस', route: '/forts/trails' },
      books: { title: 'सबासदाची बखर, शिवभारत, इंग्रज डायऱ्या', route: '/history/granthalaya' },
      community: { name: 'दुर्ग संवर्धन व स्वच्छता श्रमदान गट (पाचाड मंडळ)', route: '/community' },
      business: { name: 'स्थानिक होमस्टे, दुर्ग वाटाड्या (Guide) व कोकण कृषी उत्पादने', route: '/business/directory' },
      calendarDate: { tithi: 'ज्येष्ठ शुद्ध त्रयोदशी (६ जून)', route: '/calendar' }
    }
  },
  {
    id: 'shivaji_maharaj',
    name: 'छत्रपती शिवाजी महाराज (Shivaji Maharaj)',
    category: 'person',
    typeBadge: 'युगपुरुष व स्वराज्य संस्थापक',
    tagline: 'रयतेचे राजे, आरमार जनक, सह्याद्रीचे दुर्गपती व गनिमी काव्याचे प्रवर्तक',
    image: '/assets/images/real-shivaji-portrait.jpg',
    trustStatus: 'verified',
    sourceCitation: 'जेधे शकावली, शिवभारत, समकालीन डच-इंग्रज पत्रव्यवहार, आज्ञापत्र',
    connections: {
      person: { name: 'राष्ट्रमाता जिजाऊ माँसाहेब व छत्रपती संभाजी महाराज', role: 'प्रेरणास्थान व वारसदार', route: '/history/rajmata-jijau' },
      event: { name: 'रोहिडेश्वरावर स्वराज्य शपथ (१६४५) व अफझलखान वध (१६५९)', date: '१६४५-१६८०', route: '/history/battles' },
      place: { name: 'किल्ले शिवनेरी (जन्मभूमी) व राजगड (पहिली राजधानी)', district: 'पुणे', route: '/forts' },
      temple: { name: 'तुळजापूर भवानी माता व शिखरावर रोहिडेश्वर', deity: 'आई भवानी', route: '/culture/temples' },
      festival: { name: 'शिवजयंती (फाल्गुन वद्य तृतीया / १९ फेब्रुवारी)', season: 'फेब्रुवारी-मार्च', route: '/calendar' },
      food: { name: 'बाजरीची भाकरी, पिठलं, लसूण चटणी व रानभाज्या', region: 'मावळ-घाटमाथा', route: '/culture/food' },
      tradition: { name: 'गनिमी कावा, अष्टप्रधान मंडळ न्यायव्यवस्था, रयत रक्षण', route: '/history/swarajya-administration' },
      route: { name: 'शिवनेरी ते रायगड महासंस्कृती महामार्ग', days: '३ दिवस', route: '/forts/trails' },
      books: { title: 'शिवचरित्र निबंधावली, आज्ञापत्र, सभासद बखर', route: '/history/granthalaya' },
      community: { name: 'अखिल भारतीय मराठा समाज व शिवप्रेमी युवक मंडळ', route: '/community' },
      business: { name: 'मराठा व्यवसाय संगम व उद्योजक चॅप्टर', route: '/sangam' },
      calendarDate: { tithi: 'फाल्गुन वद्य तृतीया (शिवजयंती) व ज्येष्ठ शुद्ध त्रयोदशी', route: '/calendar' }
    }
  },
  {
    id: 'sinhagad',
    name: 'किल्ले सिंहगड (Sinhagad)',
    category: 'fort',
    typeBadge: 'रणभूमी व गिरीदुर्ग',
    tagline: 'नरवीर तानाजी मालुसरे यांचे अतुलनीय बलिदान — "गड आला पण सिंह गेला"',
    image: '/assets/images/real-sinhagad-fort.jpg',
    trustStatus: 'verified',
    sourceCitation: 'सबासदाची बखर, तान्हाजी पोवाडा (तुळशीदास शाहीर), जेधे शकावली',
    connections: {
      person: { name: 'नरवीर तानाजी मालुसरे व शेलारमामा', role: 'सुभेदार व सेनापती', route: '/history/warriors' },
      event: { name: 'सिंहगड मोहीम व कल्याण दरवाजा लढाई (४ फेब्रुवारी १६७०)', date: 'फेब्रुवारी १६७०', route: '/history/battles' },
      place: { name: 'उमराठे गाव (तानाजींचे मूळ गाव, ता. महाड)', district: 'पुणे/रायगड', route: '/universe' },
      temple: { name: 'कोंढाणेश्वर मंदिर व तानाजी स्मारक', deity: 'महादेव', route: '/culture/temples' },
      festival: { name: 'तानाजी मालुसरे पुण्यस्मरण दिन (माघ वद्य नवमी)', season: 'फेब्रुवारी', route: '/calendar' },
      food: { name: 'गरमागरम पिठलं-भाकरी, कांदा भजी व मटक्यातील दही', region: 'पुणे-हवेली', route: '/culture/food' },
      tradition: { name: 'घोरपडीच्या साहाय्याने कडा चढणे, ऐतिहासिक पोवाडा गायन', route: '/culture/gramdevat-jatra' },
      route: { name: 'पुणे दुर्ग सर्किट: सिंहगड → राजगड → तोरणा', days: '२ दिवस', route: '/forts/trails' },
      books: { title: 'तुळशीदास शाहीर पोवाडा, ह. ना. आपटे "गड आला पण सिंह गेला"', route: '/history/granthalaya' },
      community: { name: 'सह्याद्री ट्रेकर्स, मालुसरे वंशज प्रतिष्ठान', route: '/community' },
      business: { name: 'स्थानिक गावकरी बचत गट व खाद्य पर्यटन व्यवसाय', route: '/business/directory' },
      calendarDate: { tithi: 'माघ वद्य नवमी (सिंहगड विजय)', route: '/calendar' }
    }
  },
  {
    id: 'sindhudurg',
    name: 'किल्ले सिंधुदुर्ग (Sindhudurg)',
    category: 'fort',
    typeBadge: 'जलदुर्ग व नौदल केंद्र',
    tagline: 'भारतीय आरमाराचे जनक छत्रपती शिवरायांनी कुरटे बेटावर उभारलेला महाजलदुर्ग',
    image: '/assets/images/real-sindhudurg-fort.jpg',
    trustStatus: 'verified',
    sourceCitation: 'जेधे शकावली, सिंधुदुर्ग शिलालेख (१६६४), पोर्तुगीज पत्रे',
    connections: {
      person: { name: 'मायनाक भंडारी, कान्होजी आंग्रे व हिरोजी इंदुलकर', role: 'आरमारप्रमुख व वास्तुविशारद', route: '/history/navy' },
      event: { name: 'सिंधुदुर्ग पायाभरणी व छत्रपती शिवरायांचे पदचिन्ह (१६६४)', date: '२५ नोव्हेंबर १६६४', route: '/history/navy' },
      place: { name: 'मालवण शहर व कुरटे बेट', district: 'सिंधुदुर्ग', route: '/universe' },
      temple: { name: 'श्री शिवराजेश्वर छत्रपती मंदिर (जगातील एकमेव मंदिर)', deity: 'शिवराय', route: '/culture/temples' },
      festival: { name: 'आंगणेवाडी जत्रा व शिवछत्रपती जन्मोत्सव मालवण', season: 'जानेवारी-फेब्रुवारी', route: '/culture/gramdevat-jatra' },
      food: { name: 'मालवणी कोळंबी भात, सुरमई फ्राय, सोलकढी, काजू उसळ', region: 'कोकण', route: '/culture/food' },
      tradition: { name: 'सागरी जलपर्यटन, स्कुबा डायव्हिंग व दशावतार लोकनाट्य', route: '/culture/dialects' },
      route: { name: 'कोकण सागरी वारसा मार्ग: विजयदुर्ग → सिंधुदुर्ग → वेंगुर्ला', days: '३ दिवस', route: '/forts/trails' },
      books: { title: 'मराठा आरमार (भा. द. खेर), कान्होजी आंग्रे चरित्र', route: '/history/granthalaya' },
      community: { name: 'मालवण मच्छीमार सहकारी संस्था व सागरी गावे', route: '/community' },
      business: { name: 'स्थानिक रिसॉर्ट्स, स्कुबा सेंटर्स व मालवणी मसाले उद्योग', route: '/business/directory' },
      calendarDate: { tithi: 'मार्गशीर्ष शुद्ध द्वितीया (सिंधुदुर्ग प्रतिष्ठापना)', route: '/calendar' }
    }
  },
  {
    id: 'tukaram_maharaj',
    name: 'संत जगद्गुरु तुकाराम महाराज (Sant Tukaram)',
    category: 'saint',
    typeBadge: 'वारकरी संप्रदाय व तत्त्वज्ञान',
    tagline: '"जे का रंजले गांजले, त्यांसी म्हणे जो आपुले" — समतेचा संदेश देणारे महासंत',
    image: '/assets/images/sant-tukaram-dehu.jpg',
    trustStatus: 'verified',
    sourceCitation: 'तुकाराम गाथा (४,५००+ अभंग), महिपतीकृत भक्तलीलामृत',
    connections: {
      person: { name: 'छत्रपती शिवाजी महाराज (तुकोबारायांचे परम भक्त) व संत ज्ञानेश्वर', role: 'समकालीन संवाद', route: '/history/shivaji-maharaj' },
      event: { name: 'तुकाराम बीज (वैकुंठगमन) व इंद्रायणीत गाथा तरणे', date: 'फाल्गुन वद्य द्वितीया', route: '/calendar' },
      place: { name: 'देहू गाव (इंद्रायणी काठ व भंडारा डोंगर)', district: 'पुणे', route: '/universe' },
      temple: { name: 'देहू विठ्ठल मंदिर व गाथा मंदिर', deity: 'विठ्ठल-रखुमाई', route: '/culture/temples' },
      festival: { name: 'आषाढी पंढरपूर वारी व तुकाराम बीज उत्सव', season: 'जून-जुलै / मार्च', route: '/culture/shivkal-festivals' },
      food: { name: 'वारकरी महाप्रसाद — खिचडी, ताक, सुंठवडा व बाजरी भाकरी', region: 'पुणे-पंढरपूर पट्टा', route: '/culture/food' },
      tradition: { name: 'पालखी सोहळा, टाळ-मृदंग संकीर्तन व अभंग गायन', route: '/culture/gramdevat-jatra' },
      route: { name: 'तुकाराम महाराज पालखी मार्ग: देहू → पुणे → सासवड → पंढरपूर', days: '१८ दिवस वारी', route: '/forts/trails' },
      books: { title: 'सकळसंतगाथा, तुकाराम दर्शन (डॉ. सदानंद मोरे)', route: '/history/granthalaya' },
      community: { name: 'देहू वारी दिंडी मंडळे व वारकरी शिक्षण संस्था', route: '/community' },
      business: { name: 'टाळ, मृदंग व पेटी कारागीर, धार्मिक पर्यटन सेवा', route: '/business/directory' },
      calendarDate: { tithi: 'फाल्गुन वद्य द्वितीया (तुकाराम बीज)', route: '/calendar' }
    }
  },
  {
    id: 'puran_poli',
    name: 'महाराष्ट्राची पुरणपोळी (Puran Poli)',
    category: 'food',
    typeBadge: 'सण व मिष्टान्न वारसा',
    tagline: 'चना डाळ, गूळ/साखर, जायफळ व शुद्ध तूप यांच्या संगमातून साकारलेले महासंस्कृतीचे प्रतीक',
    image: '/assets/images/puran-poli-traditional.jpg',
    trustStatus: 'source_backed',
    sourceCitation: 'यादवकालीन "मानसोल्लास" ग्रंथ (इ.स. ११३०), संत साहित्यातील उल्लेख',
    connections: {
      person: { name: 'गृहिणी, पारंपरिक आचार्य व सण संस्कृती वाहक', role: 'पाककला शिल्पकार', route: '/culture/food' },
      event: { name: 'होळी पौर्णिमा व गुढीपाडवा महानैवेद्य', date: 'फाल्गुन पौर्णिमा व चैत्र शुद्ध प्रतिपदा', route: '/calendar' },
      place: { name: 'खानदेश (खापरावरची मांडे), पुणे (गुळाची पोळी), कोकण (नारळाची पोळी)', district: 'महाराष्ट्रव्यापी', route: '/culture/food' },
      temple: { name: 'तुळजाभवानी, महालक्ष्मी कोल्हापूर व कुलदैवत नैवेद्य', deity: 'कुलस्वामिनी', route: '/culture/temples' },
      festival: { name: 'होळी, गुढीपाडवा, बैलपोळा व नागपंचमी', season: 'वर्षभर सणांनुसार', route: '/culture/shivkal-festivals' },
      food: { name: 'गरमागरम कटाची आमटी, कुरडई, भजी, साजूक तूप व दूध', region: 'सर्व ३६ जिल्हे', route: '/culture/food' },
      tradition: { name: 'पुरणयंत्रातून वाटणे, नैवेद्य दाखवून सहभोजन', route: '/culture' },
      route: { name: 'महाराष्ट्र फूड ट्रेल: पुणे → सातारा → कोल्हापूर → नागपूर', days: '४ दिवस', route: '/forts/trails' },
      books: { title: 'रसचंद्रिका पाकशास्त्र, यादवकालीन खाद्य इतिहास', route: '/history/granthalaya' },
      community: { name: 'महिला गृहउद्योग, बचत गट व सण केटरिंग मंडळे', route: '/women' },
      business: { name: 'रेडिमेड पुरणपोळी ब्रँड्स व सेंद्रिय गूळ उत्पादक शेतकरी', route: '/business/directory' },
      calendarDate: { tithi: 'फाल्गुन पौर्णिमा (होळी नैवेद्य)', route: '/calendar' }
    }
  },
  {
    id: 'paithani',
    name: 'पैठणी महावस्त्र (Paithani Saree)',
    category: 'craft',
    typeBadge: 'वस्त्रकला व पेशवेकालीन वैभव',
    tagline: 'शुद्ध रेशीम व सोन्या-चांदीच्या जरतारीतून विणलेली महाराष्ट्राची राजवस्त्र परंपरा',
    image: '/assets/images/paithani-weaving-art.jpg',
    trustStatus: 'verified',
    sourceCitation: 'सातवाहन नाणेघाट नोंदी, पेशवे दफ्तर हिशेब नोंद (इ.स. १७७०)',
    connections: {
      person: { name: 'पैठण व येवला येथील पारंपरिक विणकर कारागीर', role: 'हस्तकला शिल्पकार', route: '/universe' },
      event: { name: 'पेशवे माधवराव काळात येवला येथे विणकरांचे पुनर्वसन (१७७५)', date: '१८ वे शतक', route: '/history' },
      place: { name: 'पैठण (जि. छ. संभाजीनगर) व येवला (जि. नाशिक)', district: 'मराठवाडा/उत्तर महाराष्ट्र', route: '/universe' },
      temple: { name: 'संत एकनाथ महाराज समाधी मंदिर (पैठण)', deity: 'एकनाथ महाराज', route: '/culture/temples' },
      festival: { name: 'मराठी विवाह सोहळे, दसरा, दिवाळी पाडवा', season: 'अश्विन-कार्तिक', route: '/culture/shivkal-festivals' },
      food: { name: 'पैठणची गरमागरम बाजरी भाकरी व नाशिक मिसळ', region: 'गोदावरी खोरे', route: '/culture/food' },
      tradition: { name: 'हस्तमाग विणकाम, मोर-पोपट नक्षी, नारळी पदर', route: '/culture' },
      route: { name: 'वस्त्र व लेणी वारसा मार्ग: नाशिक (येवला) → अजिंठा → वेरूळ → पैठण', days: '३ दिवस', route: '/forts/trails' },
      books: { title: 'महाराष्ट्राची वस्त्रपरंपरा, पेशवेकालीन वस्त्र संस्कृती', route: '/history/granthalaya' },
      community: { name: 'येवला-पैठण विणकर महामंडळ व सहकारी संस्था', route: '/community' },
      business: { name: 'हस्तमाग पैठणी दालने व जागतिक निर्यातदार', route: '/business/directory' },
      calendarDate: { tithi: 'कार्तिक शुद्ध प्रतिपदा (दिवाळी पाडवा)', route: '/calendar' }
    }
  }
];

export const MAHARASHTRA_TRIP_SUGGESTIONS = [
  {
    id: 'pune_2days',
    title: 'पुणे-स्वराज्य राजधानी २-दिवसीय सहल',
    region: 'पुणे व घाटमाथा',
    duration: '२ दिवस / १ रात्र',
    idealFor: 'कुटुंब, इतिहासप्रेमी व ट्रेकर्स',
    itinerary: [
      { day: 'दिवस १', spots: 'शनिवार वाडा → लाल महाल → सिंहगड किल्ला → पिठलं-भाकरी आस्वाद → मुक्काम वेल्हे/पुणे' },
      { day: 'दिवस २', spots: 'किल्ले राजगड बालेकिल्ला ट्रेक किंवा तोरणा दर्शन → नारायणपूर एकमुखी दत्त → पुण्यात परत' }
    ],
    stayRecommendation: 'वेल्हे पायथा कृषी पर्यटन केंद्र किंवा सिंहगड एमटीडीसी रिसॉर्ट',
    foodHighlights: 'झणझणीत मिसळ, पिठलं-भाकरी, मटका दही',
    forts: ['सिंहगड', 'राजगड', 'तोरणा']
  },
  {
    id: 'konkan_3days',
    title: 'दक्षिण कोकण दुर्ग व सागर ३-दिवसीय सहल',
    region: 'सिंधुदुर्ग व रत्नागिरी',
    duration: '३ दिवस / २ रात्री',
    idealFor: 'आरमार इतिहास, समुद्रकिनारे व खाद्यप्रेमी',
    itinerary: [
      { day: 'दिवस १', spots: 'विजयदुर्ग जलदुर्ग (कान्होजी आंग्रे आरमार तळ) → देवगड हापूस बागा → मालवण मुक्काम' },
      { day: 'दिवस २', spots: 'किल्ले सिंधुदुर्ग बोट सफर → श्री शिवराजेश्वर छत्रपती मंदिर → तारकर्ली वॉटर स्पोर्ट्स व स्कुबा' },
      { day: 'दिवस ३', spots: 'आंगणेवाडी भराडीदेवी दर्शन → धामपूर तलाव → वेंगुर्ला दीपगृह' }
    ],
    stayRecommendation: 'तारकर्ली समुद्रकिनारा होमस्टे किंवा मालवण एमटीडीसी',
    foodHighlights: 'मालवणी सुरमई थाळी, कोळंबी भात, सोलकढी, काजू मोदक',
    forts: ['विजयदुर्ग', 'सिंधुदुर्ग', 'पद्मगड']
  },
  {
    id: 'marathwada_4days',
    title: 'छ. संभाजीनगर व मराठवाडा महासंस्कृती ४-दिवसीय सहल',
    region: 'मराठवाडा',
    duration: '४ दिवस / ३ रात्री',
    idealFor: 'जागतिक वारसा (UNESCO), मंदिरे व संत परंपरा',
    itinerary: [
      { day: 'दिवस १', spots: 'दौलताबाद (देवगिरी) किल्ला → वेरूळ कैलास मंदिर (गुंफा १६) → घृष्णेश्वर ज्योतिर्लिंग' },
      { day: 'दिवस २', spots: 'अजिंठा लेण्या जागतिक वारसा भित्तीचित्रे → छ. संभाजीनगर बीबी का मकबरा' },
      { day: 'दिवस ३', spots: 'पैठण संत एकनाथ महाराज समाधी → पैठणी विणकाम केंद्र → जायकवाडी धरण उद्यान' },
      { day: 'दिवस ४', spots: 'नेवासे संत ज्ञानेश्वर मंदिर (ज्ञानेश्वरी जन्मस्थान) → शनी शिंगणापूर' }
    ],
    stayRecommendation: 'छ. संभाजीनगर हेरिटेज हॉटेल्स किंवा पैठण शासकीय विश्रामगृह',
    foodHighlights: 'मराठवाडी शेवभाजी, ज्वारी भाकरी, मांडे, दाल बट्टी',
    forts: ['दौलताबाद', 'अंकाई-टंकाई']
  }
];
