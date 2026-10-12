/**
 * CONNECT MARATHA — MAHARASHTRA MASTER DATA PLATFORM
 * A unified relational data architecture spanning 50+ interconnected datasets across:
 * Geography (Atlas), Forts, Battles, Personalities, Timeline, Sources, Modi Script,
 * Temples, Sant Parampara, Dialects, Food, Textiles, Folk Arts, Nature, Rivers,
 * Wadas/Baravs, Oral History, Audio Guides, QR Heritage, and API Schemas.
 */

// 1. Platform-wide Live Metrics & Statistics
export const DATA_PLATFORM_STATS = {
  divisions: 6,
  districts: 36,
  talukas: 358,
  villages: 43665,
  forts: 352,
  battles: 84,
  personalities: 248,
  temples: 1240,
  saints: 68,
  dialects: 42,
  foodSpecialties: 195,
  textilesAndCrafts: 76,
  folkArts: 54,
  rivers: 48,
  stepwellsAndWadas: 312,
  oralHistoryRecordings: 1840,
  sourcesAndBakhars: 420,
  modiDocuments: 650,
  audioTracks: 120,
  activeContributors: 3420,
  verifiedEvidencePercentage: "94.8%"
};

// 2. Historical Accuracy & Evidence Hierarchy (Tiers A to E)
export const EVIDENCE_LEVELS = {
  A: {
    code: 'A',
    label: 'प्राथमिक ऐतिहासिक पुरावा (Primary Source)',
    english: 'Contemporary archival records, royal sanads, inscriptions, contemporary bakhars (Sabhasad, Jedhe Shakavali)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700',
    icon: '📜',
    confidence: '99%+'
  },
  B: {
    code: 'B',
    label: 'मान्यताप्राप्त इतिहासकार संशोधन (Reputable Secondary Source)',
    english: 'Peer-reviewed scholarly treatises (Yadunath Sarkar, G.H. Khare, Riyasatkar G.S. Sardesai, Setu Madhavrao Pagadi)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700',
    icon: '📚',
    confidence: '90-95%'
  },
  C: {
    code: 'C',
    label: 'तौलनिक अभ्यास व विश्लेषणात्मक निष्कर्ष (Scholarly Interpretation)',
    english: 'Academic debate, historical reconstruction, multi-source corroboration',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-700',
    icon: '🔬',
    confidence: '80-90%'
  },
  D: {
    code: 'D',
    label: 'पारंपरिक लोकस्मृती व आख्यायिका (Oral / Local Tradition)',
    english: 'Centuries-old folk memories, local legends, traditional oral accounts (labeled clearly as oral testimony)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700',
    icon: '🗣️',
    confidence: 'Cultural / Traditional'
  },
  E: {
    code: 'E',
    label: 'सत्यापनाधीन योगदान (Awaiting Verification)',
    english: 'Community-submitted data pending editorial and historical review',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700',
    icon: '⏳',
    confidence: 'Under Peer Review'
  }
};

// 3. Complete Master Atlas: 6 Administrative Divisions & 36 Districts
export const MAHARASHTRA_DIVISIONS = [
  {
    id: 'konkan',
    name: 'कोकण विभाग (Konkan Division)',
    headquarters: 'ठाणे / मुंबई',
    districtsCount: 7,
    districts: [
      { id: 'mumbai-city', name: 'मुंबई शहर (Mumbai City)', talukas: 1, area: '157 sq km', pop: '3.1M', hq: 'Mumbai', rivers: ['Mithi'], forts: ['Sewri', 'Worli', 'Mahim', 'Fort George'] },
      { id: 'mumbai-suburban', name: 'मुंबई उपनगर (Mumbai Suburban)', talukas: 3, area: '446 sq km', pop: '9.3M', hq: 'Bandra', rivers: ['Mithi', 'Dahisar', 'Poisar'], forts: ['Madh Fort', 'Bandra Fort'] },
      { id: 'thane', name: 'ठाणे (Thane)', talukas: 7, area: '4,214 sq km', pop: '8.0M', hq: 'Thane', rivers: ['Ulhas', 'Vaitarna'], forts: ['Mahuli', 'Gorakhgad', 'Durgadi'] },
      { id: 'palghar', name: 'पालघर (Palghar)', talukas: 8, area: '5,344 sq km', pop: '3.0M', hq: 'Palghar', rivers: ['Vaitarna', 'Surya'], forts: ['Vasai (Bassein)', 'Asava', 'Kaldurg', 'Shirgaon'] },
      { id: 'raigad', name: 'रायगड (Raigad)', talukas: 15, area: '7,152 sq km', pop: '2.6M', hq: 'Alibag', rivers: ['Kundalika', 'Savitri', 'Patalganga', 'Amba'], forts: ['Raigad (Capital)', 'Murud Janjira', 'Sudhagad', 'Sarasgad', 'Kolaba', 'Karnala'] },
      { id: 'ratnagiri', name: 'रत्नागिरी (Ratnagiri)', talukas: 9, area: '8,208 sq km', pop: '1.6M', hq: 'Ratnagiri', rivers: ['Shastri', 'Vashishti', 'Kajali'], forts: ['Ratnadurg', 'Jaigad', 'Suvarnadurg', 'Kanakdurg'] },
      { id: 'sindhudurg', name: 'सिंधुदुर्ग (Sindhudurg)', talukas: 8, area: '5,207 sq km', pop: '0.8M', hq: 'Oros', rivers: ['Terekhol', 'Karli', 'Gad'], forts: ['Sindhudurg (Naval Flagship)', 'Vijaydurg', 'Padmadurg', 'Rangna'] }
    ]
  },
  {
    id: 'pune',
    name: 'पुणे विभाग (Pune / Paschim Maharashtra)',
    headquarters: 'पुणे',
    districtsCount: 5,
    districts: [
      { id: 'pune', name: 'पुणे (Pune)', talukas: 14, area: '15,643 sq km', pop: '9.4M', hq: 'Pune', rivers: ['Mula', 'Mutha', 'Indrayani', 'Bhima', 'Neera', 'Karha', 'Ghod'], forts: ['Sinhagad', 'Rajgad', 'Torna', 'Shivneri', 'Lohagad', 'Visapur', 'Purandar', 'Vajragad', 'Tikona'] },
      { id: 'satara', name: 'सातारा (Satara)', talukas: 11, area: '10,480 sq km', pop: '3.0M', hq: 'Satara', rivers: ['Krishna', 'Koyna', 'Venna', 'Tarali'], forts: ['Pratapgad', 'Ajinkyatara', 'Sajjangad', 'Vasantgad', 'Kalyangad', 'Kamalgad'] },
      { id: 'sangli', name: 'सांगली (Sangli)', talukas: 10, area: '8,572 sq km', pop: '2.8M', hq: 'Sangli', rivers: ['Krishna', 'Warna'], forts: ['Prachitgad', 'Dandoba', 'Bhupalgad'] },
      { id: 'kolhapur', name: 'कोल्हापूर (Kolhapur)', talukas: 12, area: '7,685 sq km', pop: '3.9M', hq: 'Kolhapur', rivers: ['Panchganga', 'Dudhganga', 'Vedganga', 'Bhagawati'], forts: ['Panhala', 'Pavankhind Pass', 'Vishalgad', 'Bhudargad', 'Samangad', 'Gaganbawda'] },
      { id: 'solapur', name: 'सोलापूर (Solapur)', talukas: 11, area: '14,895 sq km', pop: '4.3M', hq: 'Solapur', rivers: ['Bhima (Chandrabhaga)', 'Sina'], forts: ['Solapur Bhuikot', 'Karmala Fort', 'Mangalwedha Fort'] }
    ]
  },
  {
    id: 'nashik',
    name: 'नाशिक विभाग (Khandesh & North Maharashtra)',
    headquarters: 'नाशिक',
    districtsCount: 5,
    districts: [
      { id: 'nashik', name: 'नाशिक (Nashik)', talukas: 15, area: '15,530 sq km', pop: '6.1M', hq: 'Nashik', rivers: ['Godavari (Origin: Trimbak)', 'Girna', 'Darna', 'Mosam'], forts: ['Salher (Highest Fort in MH)', 'Salota', 'Ankai-Tankai', 'Harihargad', 'Trimbak / Brahmagiri', 'Ramshej'] },
      { id: 'ahmednagar', name: 'अहिल्यानगर / अहमदनगर (Ahilyanagar)', talukas: 14, area: '17,048 sq km', pop: '4.5M', hq: 'Ahilyanagar', rivers: ['Pravara', 'Mula', 'Godavari', 'Bhima'], forts: ['Ahmednagar Bhuikot', 'Harishchandragad', 'Ratangad', 'Bhairavgad'] },
      { id: 'dhule', name: 'धुळे (Dhule)', talukas: 4, area: '8,063 sq km', pop: '2.1M', hq: 'Dhule', rivers: ['Panzara', 'Tapi'], forts: ['Laling Fort', 'Songir Fort', 'Bhamer Fort'] },
      { id: 'jalgaon', name: 'जळगाव (Jalgaon)', talukas: 15, area: '11,765 sq km', pop: '4.2M', hq: 'Jalgaon', rivers: ['Tapi', 'Girna', 'Waghur'], forts: ['Parola Fort (Jhansi Rani Fort)', 'Palsod Fort'] },
      { id: 'nandurbar', name: 'नंदुरबार (Nandurbar)', talukas: 6, area: '5,035 sq km', pop: '1.6M', hq: 'Nandurbar', rivers: ['Narmada', 'Tapi'], forts: ['Toranmal Fort', 'Sulpaneshwar'] }
    ]
  },
  {
    id: 'marathwada',
    name: 'छत्रपती संभाजीनगर विभाग (Marathwada)',
    headquarters: 'छत्रपती संभाजीनगर',
    districtsCount: 8,
    districts: [
      { id: 'chhatrapati-sambhajinagar', name: 'छत्रपती संभाजीनगर (Chhatrapati Sambhajinagar)', talukas: 9, area: '10,107 sq km', pop: '3.7M', hq: 'Chh. Sambhajinagar', rivers: ['Godavari', 'Shivna', 'Kham'], forts: ['Daulatabad (Devgiri Fort)', 'Antur Fort', 'Ellora Caves Heritage'] },
      { id: 'jalna', name: 'जालना (Jalna)', talukas: 8, area: '7,718 sq km', pop: '2.0M', hq: 'Jalna', rivers: ['Kundalika', 'Dudhna'], forts: ['Jalna Fort (Mastani Mahal)', 'Rohilgad'] },
      { id: 'beed', name: 'बीड (Beed)', talukas: 11, area: '10,693 sq km', pop: '2.6M', hq: 'Beed', rivers: ['Godavari', 'Manjara', 'Sindphana'], forts: ['Dharur Fort', 'Ambajogai Heritage'] },
      { id: 'parbhani', name: 'परभणी (Parbhani)', talukas: 9, area: '6,511 sq km', pop: '1.8M', hq: 'Parbhani', rivers: ['Godavari', 'Purna', 'Dudhna'], forts: ['Pathri Heritage', 'Jintur Digambar Fort'] },
      { id: 'hingoli', name: 'हिंगोली (Hingoli)', talukas: 5, area: '4,526 sq km', pop: '1.2M', hq: 'Hingoli', rivers: ['Kayadhu', 'Penganga'], forts: ['Aundha Nagnath Jyotirlinga', 'Kalamnuri Heritage'] },
      { id: 'nanded', name: 'नांदेड (Nanded)', talukas: 16, area: '10,528 sq km', pop: '3.4M', hq: 'Nanded', rivers: ['Godavari', 'Manyad', 'Penganga'], forts: ['Nanded Fort', 'Mahur Fort (Renuka Devi Shaktipeeth)', 'Kandhar Fort'] },
      { id: 'latur', name: 'लातूर (Latur)', talukas: 10, area: '7,157 sq km', pop: '2.5M', hq: 'Latur', rivers: ['Manjara', 'Terna', 'Lendi'], forts: ['Ausa Fort', 'Udgir Fort (Historic Battle 1760)'] },
      { id: 'dharashiv', name: 'धाराशिव (Dharashiv / Osmanabad)', talukas: 8, area: '7,569 sq km', pop: '1.7M', hq: 'Dharashiv', rivers: ['Bhogawati', 'Manjara', 'Terna'], forts: ['Naldurg Fort (Pani Mahal)', 'Tuljapur Bhavani Shaktipeeth', 'Paranda Fort'] }
    ]
  },
  {
    id: 'amravati',
    name: 'अमरावती विभाग (Western Vidarbha)',
    headquarters: 'अमरावती',
    districtsCount: 5,
    districts: [
      { id: 'amravati', name: 'अमरावती (Amravati)', talukas: 14, area: '12,210 sq km', pop: '2.9M', hq: 'Amravati', rivers: ['Wardha', 'Purna', 'Chandrabhaga'], forts: ['Gawilghur Fort (Chikhaldara)', 'Achalpur / Ellichpur Fort'] },
      { id: 'akola', name: 'अकोला (Akola)', talukas: 7, area: '5,429 sq km', pop: '1.8M', hq: 'Akola', rivers: ['Morna', 'Purna'], forts: ['Akola Asadgad Fort', 'Narnala Fort (Mahan)'] },
      { id: 'buldhana', name: 'बुलढाणा (Buldhana)', talukas: 13, area: '9,661 sq km', pop: '2.6M', hq: 'Buldhana', rivers: ['Penganga', 'Purna'], forts: ['Sindkhed Raja (Birthplace of Rajmata Jijau)', 'Lonar Crater', 'Khamgaon Fort'] },
      { id: 'yavatmal', name: 'यवतमाळ (Yavatmal)', talukas: 16, area: '13,582 sq km', pop: '2.8M', hq: 'Yavatmal', rivers: ['Wardha', 'Penganga'], forts: ['Kalamb Heritage', 'Darwha Fort'] },
      { id: 'washim', name: 'वाशीम (Washim)', talukas: 6, area: '5,155 sq km', pop: '1.2M', hq: 'Washim', rivers: ['Penganga', 'Kas', 'Arunavati'], forts: ['Washim Balaji Mandir', 'Pohradevi Pilgrimage'] }
    ]
  },
  {
    id: 'nagpur',
    name: 'नागपूर विभाग (Eastern Vidarbha)',
    headquarters: 'नागपूर',
    districtsCount: 6,
    districts: [
      { id: 'nagpur', name: 'नागपूर (Nagpur)', talukas: 14, area: '9,892 sq km', pop: '4.7M', hq: 'Nagpur', rivers: ['Kanhan', 'Pench', 'Nag', 'Koli'], forts: ['Sitabuldi Fort', 'Ramtek Gadmandir (Kalidasa Meghdoot)', 'Nagardhan Fort'] },
      { id: 'wardha', name: 'वर्धा (Wardha)', talukas: 8, area: '6,309 sq km', pop: '1.3M', hq: 'Wardha', rivers: ['Wardha', 'Pothra', 'Wana'], forts: ['Sevagram Ashram', 'Pavnar Ashram (Acharya Vinoba Bhave)'] },
      { id: 'bhandara', name: 'भंडारा (Bhandara - तलावांचा जिल्हा)', talukas: 7, area: '3,895 sq km', pop: '1.2M', hq: 'Bhandara', rivers: ['Wainganga', 'Sur'], forts: ['Bhandara Fort', 'Ambagad Fort'] },
      { id: 'gondia', name: 'गोंदिया (Gondia)', talukas: 8, area: '5,425 sq km', pop: '1.3M', hq: 'Gondia', rivers: ['Wainganga', 'Bagh'], forts: ['Pratappur Heritage', 'Navegaon National Park'] },
      { id: 'chandrapur', name: 'चंद्रपूर (Chandrapur)', talukas: 15, area: '11,443 sq km', pop: '2.2M', hq: 'Chandrapur', rivers: ['Wardha', 'Wainganga', 'Erai'], forts: ['Chandrapur Fort & Parikrama Walls', 'Ballarpur Fort', 'Tadoba Andhari Sanctuary'] },
      { id: 'gadchiroli', name: 'गडचिरोली (Gadchiroli)', talukas: 12, area: '14,412 sq km', pop: '1.1M', hq: 'Gadchiroli', rivers: ['Godavari', 'Pranhita', 'Indravati', 'Wainganga'], forts: ['Tipagad Fort', 'Markanda Temple Complex'] }
    ]
  }
];

// Deep Sample Taluka-Level Explorer for Pune District
export const PUNE_DISTRICT_DEEP_ATLAS = {
  districtName: 'पुणे (Pune)',
  historicalNames: ['पुण्यविषय (राष्ट्रकूट सन ७५८)', 'पुनवडी (यादव काळ)', 'कसबे पुणे (शहाजीराजे जहागीर)'],
  area: '15,643 sq km',
  elevation: '560 m',
  rivers: ['मुळा', 'मुठा', 'इंद्रायणी', 'भीमा', 'नीरा', 'कऱ्हा', 'घोड'],
  talukas: [
    {
      name: 'हवेली (Haveli / Pune City & Suburbs)',
      villagesCount: 112,
      forts: ['सिंहगड (कोंढाणा)'],
      temples: ['कसबा गणपती', 'पर्वती देवस्थान', 'चतुःशृंगी', 'आळंदी (जवळ)'],
      history: 'शहाजीराज्यांनी जिजाऊ माँसाहेबांच्या हस्ते सोन्याचा नांगर फिरवून वसवलेले कसबे पुणे; पेशवेकालीन राजधानी.',
      cuisine: ['पुणेरी मिसळ', 'बाकरवडी (चितळे)', 'सुजाता मस्तानी', 'आंबा बर्फी'],
      markets: ['तुळशीबाग', 'महात्मा फुले मंडई', 'लक्ष्मी रोड']
    },
    {
      name: 'जुन्नर (Junnar)',
      villagesCount: 182,
      forts: ['शिवनेरी (छत्रपती शिवाजी महाराज जन्मस्थान)', 'चावंड', 'हडसर', 'जीवधन'],
      temples: ['लेण्याद्री (अष्टविनायक गिरિજાत्मज)', 'ओझर (अष्टविनायक विघ्नहर)'],
      history: 'सातवाहन कालीन प्राचीन राजधानी; नाणेघाट व्यापारी खिंड व ब्राह्मी-मोडी शिलालेखांचे दालन.',
      cuisine: ['जुन्नरचा कांदा भजी', 'द्राक्ष व पेरू', 'घावणे-पिठलं'],
      markets: ['जुन्नर आठवडे बाजार', 'नारायणगाव कृषी बाजार']
    },
    {
      name: 'मावळ (Maval)',
      villagesCount: 186,
      forts: ['लोहगड', 'विसापूर', 'तिकोना (वितंडगड)', 'तुंग (कठिणगड)'],
      temples: ['कार्ला लेणी (एकवीरा देवी)', 'भाजे लेणी'],
      history: 'स्वराज्याच्या पहिल्या मावळ्यांची जन्मभूमी; सह्याद्रीच्या निधड्या छातीच्या नरवीरांचा बालेकिल्ला.',
      cuisine: ['इंद्रायणी भात', 'खेकडा कालवण', 'लोणावळा चिक्की', 'मटकी उसळ'],
      markets: ['तळेगाव दाभाडे', 'लोणावळा बाजारपेठ']
    },
    {
      name: 'पुरंदर (Purandar)',
      villagesCount: 108,
      forts: ['पुरंदर (छत्रपती संभाजी महाराज जन्मस्थान)', 'वज्रगड'],
      temples: ['जेजुरी खंडोबा (येळकोट येळकोट जय मल्हार)', 'नारायणपूर एकमुखी दत्त'],
      history: 'सन १६६५ चा ऐतिहासिक पुरंदरचा तह; मुरारबाजी देशपांडे यांचे अद्भूत शौर्य.',
      cuisine: ['पुरंदरची अंजीर', 'सीताफळ', 'कऱ्हा काठची ज्वारी भाकरी'],
      markets: ['सासवड बाजार', 'जेजुरी हळद बाजार']
    },
    {
      name: 'भोर (Bhor / Velhe)',
      villagesCount: 194,
      forts: ['तोरणा (प्रचंडगड - स्वराज्याचे पहिले तोरण)', 'राजगड (स्वराज्याची पहिली राजधानी २५ वर्षे)'],
      temples: ['रायरेश्वर (स्वराज्य स्थापनेची शपथ)', 'अंबवडे नागेश्वर'],
      history: '१६४५ मध्ये रायरेश्वर मंदिरात बाल शिवाजींनी रक्ताचा अभिषेक करून घेतलेली हिंदवी स्वराज्य प्रतिज्ञा.',
      cuisine: ['हुर्डा पार्टी', 'रानभाज्या', 'पिठलं-भाकरी-ठेचा'],
      markets: ['भोर राजवाडा चौक', 'नसरापूर फाटा']
    },
    {
      name: 'बारामती (Baramati)',
      villagesCount: 116,
      forts: ['इंदापूर-बारामती भुईकोट गढी अवशेष'],
      temples: ['मोरगाव मयूरेश्वर (अष्टविनायक प्रथम पीठ)', 'सोमेश्वर'],
      history: 'कविवर्य मोरोपंतांची कर्मभूमी; पश्चिम महाराष्ट्राचे आधुनिक कृषी व दुग्ध व्यवसाय केंद्र.',
      cuisine: ['मटण रस्सा व भाकरी', 'उसाचा ताजा रस', 'पेढा'],
      markets: ['बारामती कॉटन व साखर बाजार', 'कृषी विज्ञान केंद्र प्रदर्शन']
    }
  ]
};

// 4. Fort Registry (गड-किल्ले विस्तृत नोंदवही - Field-Rich Database)
export const FORT_REGISTRY = [
  {
    id: 'raigad',
    name: 'किल्ले रायगड (Raigad Fort)',
    alternativeNames: ['रायरी', 'इस्लामगड (मुघल नामकरण)', 'जिब्राल्टर ऑफ द ईस्ट'],
    district: 'रायगड',
    taluka: 'महाड',
    village: 'पाचाड',
    coordinates: { lat: 18.2346, lng: 73.4442 },
    elevation: '820 m (2,700 ft)',
    fortType: 'गिरीदुर्ग (Hill Fort / Royal Capital)',
    constructionPeriod: '१२ व्या शतकात मोरे घराणे; १६५६ मध्ये शिवरायांनी जिंकून भव्य राजधानी उभारली',
    majorRulers: ['चंद्रराव मोरे', 'छत्रपती शिवाजी महाराज', 'छत्रपती संभाजी महाराज', 'राजाराम महाराज', 'जुल्फिकार खान', 'पेशवे', 'ब्रिटिश (१८१८)'],
    historicalEvents: [
      '६ जून १६७४: छत्रपती शिवाजी महाराजांचा सुवर्ण सिंहासनावर ऐतिहासिक राज्याभिषेक',
      '३ एप्रिल १६८०: छत्रपती शिवाजी महाराजांचे महापरिनिर्वाण',
      '१६८९: महाराणी येसूबाईंच्या नेतृत्वाखाली मुघल वेढ्याचा प्रखर प्रतिकार'
    ],
    gates: ['महादरवाजा', 'नाणे दरवाजा', 'हत्ती दरवाजा', 'पालखी दरवाजा'],
    bastions: ['टकमक टोक', 'भवानी कडा', 'हिरकणी बुरूज', 'बाजारपेठ बुरूज'],
    waterTanks: ['गंगासागर तलाव', 'हत्ती तलाव', 'कुशवर्त तलाव', 'बारा टाकी'],
    secretStructures: ['वाघ दरवाजा (गुप्त चोरदिंडी)', 'दारूचे कोठार', 'जगदीश्वर मंदिर गुप्त मार्ग'],
    trekDifficulty: 'मध्यम (१,४५० पायऱ्या किंवा आधुनिक रोप-वे सेवा)',
    bestSeason: 'ऑक्टोबर ते मार्च (पावसाळ्यात निसर्गरम्य धुके व हिरवळ)',
    currentCondition: 'एएसआय (ASI) राष्ट्रीय संरक्षित स्मारक; नवनिर्मित संवर्धन प्रकल्प',
    emergencyContact: 'पाचाड पोलीस चौकी: ०२१४५-२२२१०० | रायगड रोप-वे: ०२१४५-२३२४४४',
    evidenceLevel: 'A',
    citations: ['सभासद बखर, पृ. ५४-६२', 'जेधे शकावली, शके १५९६', 'इंग्रजी दस्तऐवज (हेन्री ऑक्झिंडेन डायरी)'],
    audioTrackUrl: '/audio/raigad-history-10min.mp3',
    qrCodeId: 'QR-MH-FORT-001',
    hasDroneView: true,
    has360View: true
  },
  {
    id: 'rajgad',
    name: 'किल्ले राजगड (Rajgad Fort)',
    alternativeNames: ['मुरुमदेव', 'स्वराज्याची पहिली राजधानी'],
    district: 'पुणे',
    taluka: 'भोर / वेल्हे',
    village: 'गुंजवणे / पाबे',
    coordinates: { lat: 18.2464, lng: 73.6811 },
    elevation: '1,376 m (4,514 ft)',
    fortType: 'गिरीदुर्ग (Triple-Machised Hill Fortress)',
    constructionPeriod: 'बहामनी/निजामशाही काळ; १६४६ मध्ये छत्रपती शिवरायांनी जिंकून २५ वर्षे राजधानी केली',
    majorRulers: ['छत्रपती शिवाजी महाराज', 'छत्रपती संभाजी महाराज', 'मुघल', 'पेशवे'],
    historicalEvents: [
      '१६४६-१६७१: अखंड २५ वर्षे स्वराज्याची पहिली दुर्गराज राजधानी',
      '१६६६: आग्र्याहून सुटकेनंतर बाल संभाजीराजांसह शिवरायांचे राजगडावर पुनरागमन',
      'सईबाई राणीसाहेबांचे समाधीस्थळ'
    ],
    gates: ['गुंजवणे दरवाजा', 'पाली दरवाजा', 'सुवेळा दरवाजा', 'अळू दरवाजा'],
    bastions: ['बालेकिल्ला (चंद्रकला)', 'सुवेळा माची (नेढे - नैसर्गिक आरपार छिद्र)', 'पद्मावती माची', 'संजीवनी माची'],
    waterTanks: ['पद्मावती तळे', 'चंद्रतळे', 'कापूर बावडी', 'ब्रह्मर्षी टाकी'],
    secretStructures: ['संजीवनी माची दुहेरी तटबंदीची चोरदिंडी', 'बालेकिल्ल्याचे गुप्त भुयार'],
    trekDifficulty: 'कठीण (पाली मार्गे मध्यम, गुंजवणे मार्गे तीव्र चढण, ३-४ तास)',
    bestSeason: 'ऑक्टोबर ते फेब्रुवारी',
    currentCondition: 'पद्मावती मंदिरात ट्रेकर्ससाठी मुक्काम व्यवस्था; राज्य संरक्षित स्मारक',
    emergencyContact: 'वेल्हे पोलीस ठाणे: ०२१३०-२२१२३३',
    evidenceLevel: 'A',
    citations: ['शिवभारत (परमानंद)', 'सभासद बखर', 'तारीख-इ-दिलकुशा'],
    audioTrackUrl: '/audio/rajgad-history-10min.mp3',
    qrCodeId: 'QR-MH-FORT-002',
    hasDroneView: true,
    has360View: true
  },
  {
    id: 'sinhagad',
    name: 'किल्ले सिंहगड (Sinhagad Fort)',
    alternativeNames: ['कोंढाणा', 'बक्षीस-ए-खुदा (मुघल)'],
    district: 'पुणे',
    taluka: 'हवेली',
    village: 'डोणजे / आतकरवाडी',
    coordinates: { lat: 18.3663, lng: 73.7558 },
    elevation: '1,312 m (4,304 ft)',
    fortType: 'गिरीदुर्ग (Pre-eminent Strategic Shield of Pune)',
    constructionPeriod: 'कौंडिण्य ऋषींचे स्थान; सुमारे २००० वर्षे प्राचीन; शिलाहार व यादव काळ',
    majorRulers: ['नाग नाईक (कोळी राजे)', 'मुहम्मद बिन तुघलक', 'छत्रपती शिवाजी महाराज', 'तानाजी मालुसरे', 'उदयभान राठोड', 'राजाराम महाराज'],
    historicalEvents: [
      '४ फेब्रुवारी १६७०: सुभेदार तानाजी मालुसरे व शेलारमामा यांचे अतुलनीय शौर्य; "गड आला पण सिंह गेला!"',
      '३ मार्च १७००: छत्रपती राजाराम महाराजांचे सिंहगडावर निर्वाण'
    ],
    gates: ['पुणे दरवाजा', 'कल्याण दरवाजा'],
    bastions: ['तानाजी कडा', 'झुंजार बुरूज', 'टिळक बंगला बुरूज'],
    waterTanks: ['देवटाके (गोड पाण्याचा झरा)', 'दारूचे कोठार तळे'],
    secretStructures: ['कल्याण दरवाजा बाहेरील चोरवाट', 'पश्चिमेकडील गुप्त खंदक'],
    trekDifficulty: 'सोपे ते मध्यम (वाहनाने थेट माथ्यापर्यंत रस्ता उपलब्ध; आतकरवाडी मार्गे १.५ तास ट्रेक)',
    bestSeason: 'वर्षभर (पावसाळ्यात अतिशय लोकप्रिय पर्यटन)',
    currentCondition: 'अत्यंत उत्तम; तानाजी मालुसरे समाधी स्मारक व लोकमान्य टिळक निवासस्थान संरक्षित',
    emergencyContact: 'हवेली पोलीस ठाणे: ०२०-२४३९११०० | पीएमपीएल सिंहगड बस सेवा',
    evidenceLevel: 'A',
    citations: ['सभासद बखर (१६९७)', 'जेधे करीना', 'तुलसीदास पोवाडा (तानाजी पोवाडा १६७०)'],
    audioTrackUrl: '/audio/sinhagad-history-10min.mp3',
    qrCodeId: 'QR-MH-FORT-003',
    hasDroneView: true,
    has360View: true
  },
  {
    id: 'sindhudurg',
    name: 'किल्ले सिंधुदुर्ग (Sindhudurg Sea Fort)',
    alternativeNames: ['शिवकालीन आरमार राजधानी', 'कुरटे बेट दुर्ग'],
    district: 'सिंधुदुर्ग',
    taluka: 'मालवण',
    village: 'मालवण बंदर',
    coordinates: { lat: 16.0425, lng: 73.4608 },
    elevation: 'समुद्रसपाटीवर (Sea Fort / Water Fortress)',
    fortType: 'जलदुर्ग (Naval Sea Fortress)',
    constructionPeriod: '२५ नोव्हेंबर १६६४ रोजी शिवरायांच्या हस्ते पायाभरणी; हिरोजी इंदुलकर वास्तुविशारद',
    majorRulers: ['छत्रपती शिवाजी महाराज', 'सरखेल कान्होजी आंग्रे', 'छत्रपती संभाजी महाराज', 'ब्रिटिश'],
    historicalEvents: [
      '१६६४-१६६७: अरबी समुद्रातील कुरटे खडकावर ५०० मण शिसे ओतून अभेद्य पायाभरणी',
      'छत्रपती शिवरायांचे एकमेव हाताचे व पायाचे ठसे आणि श्री शिवराजेश्वर मंदिर'
    ],
    gates: ['महादरवाजा (समुद्रातून सहज न दिसणारा जिग-जॅग वळणाचा दरवाजा)'],
    bastions: ['५२ भव्य बुरूज', 'धनुष्य बुरूज', 'सूर्या बुरूज'],
    waterTanks: ['दूधबाव', 'दहीबाव', 'साखरबाव (समुद्राच्या मधोमध गोड्या पाण्याचे अद्वितीय विहिरी)'],
    secretStructures: ['समुद्राखालून जाणारे गुप्त भुयार (स्थानिक परंपरा)', 'किल्लेदारांची गुप्त कोठारे'],
    trekDifficulty: 'सोपे (मालवण बंदरावरून प्रवासी होडीने १५ मिनिटे जलप्रवास)',
    bestSeason: 'ऑक्टोबर ते मे (पावसाळ्यात समुद्रातील बोट सेवा बंद असते)',
    currentCondition: 'उत्कृष्ट संवर्धन; शिवराजेश्वर मंदिरात दैनंदिन पूजा अर्चा',
    emergencyContact: 'मालवण पोलीस ठाणे: ०२३६५-२५२२३३ | मालवण बंदर कार्यालय',
    evidenceLevel: 'A',
    citations: ['शिवछत्रपतींचे आरमार (डॉ. बाळकृष्ण)', 'चित्रगुप्त बखर', 'डच व पोर्तुगीज दस्तऐवज (गोवा आर्काइव्ह्ज)'],
    audioTrackUrl: '/audio/sindhudurg-history-10min.mp3',
    qrCodeId: 'QR-MH-FORT-004',
    hasDroneView: true,
    has360View: true
  },
  {
    id: 'pratapgad',
    name: 'किल्ले प्रतापgad (Pratapgad Fort)',
    alternativeNames: ['भोरप्याचा डोंगर', 'अकबरपूर'],
    district: 'सातारा',
    taluka: 'महाबळेश्वर',
    village: 'पार / वाडा',
    coordinates: { lat: 17.9333, lng: 73.5833 },
    elevation: '1,080 m (3,540 ft)',
    fortType: 'गिरीदुर्ग / वनदुर्ग (Hill & Dense Forest Fortress)',
    constructionPeriod: '१६५६ मध्ये मोरोपंत त्रिंबक पिंगळे यांच्या देखरेखीखाली जावळीच्या खोऱ्यात उभारणी',
    majorRulers: ['छत्रपती शिवाजी महाराज', 'पेशवे', 'ब्रिटिश'],
    historicalEvents: [
      '१० नोव्हेंबर १६५९: अफझलखानाचा ऐतिहासिक वध; विजापूर सल्तनतीच्या बलाढ्य सैन्याचा संपूर्ण धुव्वा',
      'आई भवानी मातेची पाषाण मूर्ती स्थापना (नेपाळच्या गंडकी नदीतील शिळेपासून)'
    ],
    gates: ['महादरवाजा', 'रेड्याचा दरवाजा'],
    bastions: ['अफझल बुरूज', 'सुवेळा बुरूज', 'यशवंत बुरूज'],
    waterTanks: ['भवानी टाकी', 'बालेकिल्ला टाकी'],
    secretStructures: ['जावळीच्या जंगलात उतरणाऱ्या गुप्त पायवाटा'],
    trekDifficulty: 'सोपे (वाहनाने पायथ्यापर्यंत रस्ता, सुमारे ४५० पायऱ्या)',
    bestSeason: 'ऑगस्ट ते मार्च',
    currentCondition: 'अत्यंत सुस्थितीत; शिवरायांचा भव्य अश्वारूढ पुतळा व भवानी मंदिर',
    emergencyContact: 'महाबळेश्वर पोलीस: ०२१६८-२६०२३३',
    evidenceLevel: 'A',
    citations: ['सभासद बखर, पृ. १५-२२', 'अफझलखान वध पोवाडा (अज्ञानदास)', 'इंग्रजी फॅक्टरी रेकॉर्ड्स राजपूर'],
    audioTrackUrl: '/audio/pratapgad-history-10min.mp3',
    qrCodeId: 'QR-MH-FORT-005',
    hasDroneView: true,
    has360View: true
  },
  {
    id: 'shivneri',
    name: 'किल्ले शिवनेरी (Shivneri Fort)',
    alternativeNames: ['शिवजन्मभूमी', 'जुन्नरचा दुर्ग'],
    district: 'पुणे',
    taluka: 'जुन्नर',
    village: 'शिवनेरी पायथा',
    coordinates: { lat: 19.2081, lng: 73.8647 },
    elevation: '1,040 m (3,412 ft)',
    fortType: 'गिरीदुर्ग (Hill Fort of Royal Birth)',
    constructionPeriod: 'सातवाहन काळ (इ.स. पूर्व पहिले शतक); बौद्ध लेणी व यादव कालीन',
    majorRulers: ['सातवाहन', 'यादव', 'शहाजीराजे भोसले', 'छत्रपती शिवाजी महाराज', 'मुघल'],
    historicalEvents: [
      '१९ फेब्रुवारी १६३०: राष्ट्रनिर्माते छत्रपती शिवाजी महाराज यांचा शुभ जन्म',
      'जिजाऊ माँसाहेबांची कुलदेवता शिवाई देवीची आराधना'
    ],
    gates: ['महादरवाजा', 'पीर दरवाजा', 'परवानगी दरवाजा', 'हाती दरवाजा', 'शिपाई दरवाजा', 'फाटक दरवाजा', 'कुलाबकर दरवाजा (एकूण ७ भव्य दरवाजे)'],
    bastions: ['कडेलोट टोक', 'शिवाई बुरूज'],
    waterTanks: ['गंगा-जमुना टाकी (वर्षाचे बाराही महिने खळाळणारे गोड पाणी)', 'बदामी तलाव'],
    secretStructures: ['बौद्ध कालीन गुहा व भुयारे'],
    trekDifficulty: 'सोपे ते मध्यम (पायऱ्यांची सुबक वाट, १ तास)',
    bestSeason: 'वर्षभर (शिवजयंतीला भव्य उत्सव)',
    currentCondition: 'एएसआय राष्ट्रीय संरक्षित स्मारक; शिवकुंज व जिजाऊ-बालशिवाजी स्मारक',
    emergencyContact: 'जुन्नर पोलीस ठाणे: ०२१३२-२२२०३३',
    evidenceLevel: 'A',
    citations: ['शिवभारत', 'जेधे शकावली', 'बहिरी बखर'],
    audioTrackUrl: '/audio/shivneri-history-10min.mp3',
    qrCodeId: 'QR-MH-FORT-006',
    hasDroneView: true,
    has360View: true
  }
];

// 5. Battles & Military History Database (रणभूमी व युद्ध इतिहास)
export const BATTLE_DATABASE = [
  {
    id: 'battle-pratapgad',
    name: 'प्रतापगडचे धर्मयुद्ध (Battle of Pratapgad)',
    date: '१० नोव्हेंबर १६५९ (मार्गशीर्ष शुद्ध सप्तमी)',
    location: 'प्रतापगड पायथा व जावळीचे अरण्य (सातारा)',
    commandersMaratha: ['छत्रपती शिवाजी महाराज', 'कान्होजी जेधे', 'मोरोपंत पिंगळे', 'नेताजी पालकर', 'तानाजी मालुसरे'],
    commandersEnemy: ['अफझलखान (विजापूर सल्तनत सेनापती)', 'फाजलखान', 'सय्यद बंडा'],
    forcesMaratha: 'सुमारे १०,००० मावळे पायदळ व ३,००० घोडेस्वार (गुरिल्ला युद्धनीती)',
    forcesEnemy: 'सुमारे ३०,००० फौज, तोफखाना, हत्तीदळ व भारी घोडदळ',
    strategicContext: 'विजापूर सल्तनतीने शिवरायांचा निःपात करण्यासाठी सर्वशक्तिनिशी पाठवलेली महाकाय मोहीम.',
    tacticalExecution: 'अफझलखानाला जावळीच्या दुर्गम जंगलात आणून शामियान्यात वाघनखे व बिचव्याने कोथळा बाहेर काढला; तोफेचा इशारा होताच लपलेल्या मावळ्यांचा तिन्ही बाजूंनी अचानक महाप्रहार.',
    outcome: 'मराठ्यांचा ऐतिहासिक संपूर्ण विजय; अफझलखानाचा खात्मा; ६५ हत्ती, ४,००० घोडे, १,२०० उंट व संपूर्ण तोफखाना हस्तगत.',
    consequences: 'स्वराज्याची सीमा थेट कोल्हापूर, पन्हाळा व कोकण किनाऱ्यापर्यंत विस्तारली; मराठा सत्तेची दहशत संपूर्ण दख्खनवर निर्माण झाली.',
    evidenceLevel: 'A',
    citations: ['सभासद बखर', 'तारीख-इ-अली आदिलशाही', 'डच ईस्ट इंडिया कंपनी पत्रव्यवहार', 'जेधे शकावली']
  },
  {
    id: 'battle-pavankhind',
    name: 'पावनखिंडीचा अतुलनीय लढा (Battle of Pavankhind / Ghodkhind)',
    date: '१३ जुलै १६६० (आषाढ वद्य प्रतिपदा)',
    location: 'घोडखिंड (पावनखिंड), विशाळगड जवळ (कोल्हापूर)',
    commandersMaratha: ['बाजीप्रभू देशपांडे', 'फुलाजीप्रभू देशपांडे', 'संभाजी जाधव', '३०० बांदल मावळे'],
    commandersEnemy: ['सिद्दी मसूद', 'फाजलखान (विजापूर सल्तनत फौज)'],
    forcesMaratha: 'केवळ ३०० बांदल वीर',
    forcesEnemy: '१०,००० हून अधिक पाठलाग करणारी सुसज्ज विजापुरी सेना',
    strategicContext: 'पन्हाळगडाच्या सिद्दी जोहरच्या ४ महिन्यांच्या वेढ्यातून शिवरायांचे विशाळगडाकडे सुरक्षित प्रयाण.',
    tacticalExecution: 'घोडखिंडीच्या चिंचोळ्या वाटेवर बाजीप्रभू व मावळ्यांनी रक्ताचा शेवटचा थेंब असेपर्यंत शत्रूची महाकाय सेना ६ तास रोखून धरली.',
    outcome: 'तोफेचे तीन आवाज ऐकून शिवराय विशाळगडावर सुखरूप पोहोचल्याची खात्री झाल्यावर बाजीप्रभूंनी वीरमरण स्वीकारले; खिंड बांदल वीरांच्या रक्ताने पावन झाली.',
    consequences: 'छत्रपती शिवरायांचे प्राण वाचले; स्वराज्य सुरक्षित राहिले; विश्वासाच्या आणि स्वामीनिष्ठेच्या इतिहासातील सर्वोच्च बलिदान.',
    evidenceLevel: 'A',
    citations: ['जेधे करीना', 'सभासद बखर', 'बांदल बखर']
  },
  {
    id: 'battle-salher',
    name: 'साल्हेरची मैदानी महालढाई (Battle of Salher)',
    date: 'जानेवारी १६७२',
    location: 'साल्हेर किल्ला व पायथा (बागलाण, नाशिक)',
    commandersMaratha: ['प्रतापराव गुजर (सरनोबत)', 'मोरोपंत पिंगळे (पेशवे)', 'सूर्याजी काकडे'],
    commandersEnemy: ['इखलास खान', 'बहादूर खान', 'दिलेर खान (मुघल सेनापती)'],
    forcesMaratha: '२०,००० मराठा घोडदळ व पायदळ',
    forcesEnemy: '४०,०००+ सुसज्ज शाही मुघल फौज (तोफखाना व भारी रिसाला)',
    strategicContext: 'सूरत लुटीनंतर मुघलांनी मराठ्यांचा बागलाण प्रांत परत मिळवण्यासाठी केलेला महाहल्ला.',
    tacticalExecution: 'खुद्द मोकळ्या मैदानात समोरासमोर भिडलेली पहिली महालढाई. मराठा घोडदळाने मुघलांची आघाडी कापून काढली.',
    outcome: 'मराठ्यांचा प्रचंड विजय; मुघलांचे संपूर्ण सैन्य पराभूत; लाखो रुपयांची लूट व हत्ती-घोडे जप्त.',
    consequences: 'मराठे केवळ गनिमी काव्यानेच नव्हे तर मोकळ्या मैदानातही मुघल सैन्याचा पाडाव करू शकतात हे संपूर्ण भारताला सिद्ध झाले; १६७४ च्या राज्याभिषेकाचा मार्ग प्रशस्त झाला.',
    evidenceLevel: 'A',
    citations: ['सभासद बखर, पृ. ६९-७२', 'मासिरी आलमगिरी', 'जेधे शकावली']
  },
  {
    id: 'battle-palkhed',
    name: 'पालखेडची युद्धकला मोहीम (Battle of Palkhed)',
    date: '२८ फेब्रुवारी १७२८',
    location: 'पालखेड, गोदावरी खोरे (नाशिक जवळ)',
    commandersMaratha: ['श्रीमंत थोरले बाजीराव पेशवे'],
    commandersEnemy: ['निजाम-उल-मुल्क (हैदराबादचा निजाम आसफ जाह पहिला)'],
    forcesMaratha: 'चपळ मराठा हलके घोडदळ (कमी रसद, अतिवेगवान हालचाली)',
    forcesEnemy: 'निजामाची अवजड तोफखानायुक्त महाकाय सेना',
    strategicContext: 'निजामाने छत्रपती शाहू महाराजांच्या विरोधात कोल्हापूरच्या संभाजींना पुढे करून मराठ्यांची चौथाई नाकारली होती.',
    tacticalExecution: 'बाजीरावांनी निजामाला गोदावरीच्या कोरड्या प्रदेशात पाणी व चाऱ्याविना फिरवून चकवले आणि पालखेड येथे विहिरीविना घेरले. फील्ड मार्शल बर्नार्ड माँटगोमेरीने याचे वर्णन "सामरिक बुद्धिमत्तेची उत्कृष्ट कलाकृती" केले आहे.',
    outcome: 'एकाही गोळीबाराशिवाय निजामाचा संपूर्ण पराभव; ६ मार्च १७२८ रोजी मुंगी-पैठणचा तह.',
    consequences: 'निजामाने छत्रपती शाहूंचे सर्वंकष सार्वभौमत्व व मराठ्यांचा चौथाई-सरदेशमुखी हक्क मान्य केला.',
    evidenceLevel: 'A',
    citations: ['मराठी रियासत (सरदेसाई)', 'पेशवे दप्तर खंड १५', 'History of the Marathas (Grant Duff)']
  }
];

// 6. Modi Script Learning & Document Explorer (मोडी लिपी दालन)
export const MODI_SCRIPT_DATA = {
  title: 'मोडी लिपी ज्ञानपीठ (Modi Script Learning & Digital Archive)',
  intro: 'शिवकालीन व पेशवेकालीन शेकडो वर्षे महाराष्ट्राची राजभाषा व प्रशासकीय दस्तऐवजांची लिपी म्हणून मोडी लिपीचा वापर होत होता. मोडी म्हणजे जलद लेखनासाठी अक्षरे "मोडून" सलग लिहिण्याची सुंदर पद्धती.',
  alphabets: {
    vowels: [
      { devanagari: 'अ', modi: '𑘀', transliteration: 'a' },
      { devanagari: 'आ', modi: '𑘁', transliteration: 'aa' },
      { devanagari: 'इ', modi: '𑘂', transliteration: 'i' },
      { devanagari: 'ई', modi: '𑘃', transliteration: 'ee' },
      { devanagari: 'उ', modi: '𑘄', transliteration: 'u' },
      { devanagari: 'ऊ', modi: '𑘅', transliteration: 'oo' },
      { devanagari: 'ए', modi: '𑘊', transliteration: 'e' },
      { devanagari: 'ऐ', modi: '𑘋', transliteration: 'ai' },
      { devanagari: 'ओ', modi: '𑘌', transliteration: 'o' },
      { devanagari: 'औ', modi: '𑘍', transliteration: 'au' }
    ],
    consonants: [
      { devanagari: 'क', modi: '𑘎', transliteration: 'ka' },
      { devanagari: 'ख', modi: '𑘏', transliteration: 'kha' },
      { devanagari: 'ग', modi: '𑘐', transliteration: 'ga' },
      { devanagari: 'घ', modi: '𑘑', transliteration: 'gha' },
      { devanagari: 'च', modi: '𑘔', transliteration: 'cha' },
      { devanagari: 'छ', modi: '𑘕', transliteration: 'chha' },
      { devanagari: 'ज', modi: '𑘖', transliteration: 'ja' },
      { devanagari: 'झ', modi: '𑘗', transliteration: 'jha' },
      { devanagari: 'ट', modi: '𑘘', transliteration: 'ta' },
      { devanagari: 'ठ', modi: '𑘙', transliteration: 'tha' },
      { devanagari: 'ड', modi: '𑘚', transliteration: 'da' },
      { devanagari: 'ढ', modi: '𑘛', transliteration: 'dha' },
      { devanagari: 'त', modi: '𑘝', transliteration: 'ta' },
      { devanagari: 'थ', modi: '𑘞', transliteration: 'tha' },
      { devanagari: 'द', modi: '𑘟', transliteration: 'da' },
      { devanagari: 'ध', modi: '𑘠', transliteration: 'dha' },
      { devanagari: 'न', modi: '𑘡', transliteration: 'na' },
      { devanagari: 'प', modi: '𑘢', transliteration: 'pa' },
      { devanagari: 'फ', modi: '𑘣', transliteration: 'pha' },
      { devanagari: 'ब', modi: '𑘤', transliteration: 'ba' },
      { devanagari: 'भ', modi: '𑘥', transliteration: 'bha' },
      { devanagari: 'म', modi: '𑘦', transliteration: 'ma' },
      { devanagari: 'य', modi: '𑘧', transliteration: 'ya' },
      { devanagari: 'र', modi: '𑘨', transliteration: 'ra' },
      { devanagari: 'ल', modi: '𑘩', transliteration: 'la' },
      { devanagari: 'व', modi: '𑘪', transliteration: 'va' },
      { devanagari: 'श', modi: '𑘫', transliteration: 'sha' },
      { devanagari: 'ष', modi: '𑘬', transliteration: 'sha' },
      { devanagari: 'स', modi: '𑘭', transliteration: 'sa' },
      { devanagari: 'ह', modi: '𑘮', transliteration: 'ha' },
      { devanagari: 'ळ', modi: '𑘯', transliteration: 'la' }
    ]
  },
  sampleExercises: [
    { marathi: 'स्वराज्य', transliteration: 'Swarajya', hint: 'स + व + र + ा + ज + य' },
    { marathi: 'शिवराय', transliteration: 'Shivrai', hint: 'श + ि + व + र + ा + य' },
    { marathi: 'रायगड', transliteration: 'Raigad', hint: 'र + ा + य + ग + ड' },
    { marathi: 'महाराष्ट्र', transliteration: 'Maharashtra', hint: 'म + ह + ा + र + ा + ष + ट + र' }
  ],
  sampleDocuments: [
    {
      title: 'शिवकालीन तहनामा सनद (Shivaji Maharaj Royal Sanad 1672)',
      period: 'इ.स. १६७२ (शिवकाल)',
      archiveLocation: 'पुणे पुराभिलेखागार (Pune Archives, Peshwa Daftar)',
      transcriptionMarathi: 'अज रख्तखाने राजश्री सिवाजी राजे संमत कान्होजी जेधे देसमुख तापे भोर...',
      englishTranslation: 'From the Court of King Shivaji to Deshmukh Kanhoji Jedhe of Tapa Bhor regarding village revenues and military readiness.',
      evidenceLevel: 'A'
    }
  ]
};

// 7. Temple Database & Pilgrimage Networks (देवस्थान व तीर्थक्षेत्र नेटवर्क)
export const TEMPLE_AND_PILGRIMAGE_DATABASE = {
  jyotirlingas: [
    { name: 'त्र्यंबकेश्वर ज्योतिर्लिंग (Trimbakeshwar)', district: 'नाशिक', deity: 'त्रिदेव (ब्रह्मा-विष्णू-महेश)', feature: 'गोदावरी नदीचे उगमस्थान; कुशावर्त कुंड' },
    { name: 'भीमाशंकर ज्योतिर्लिंग (Bhimashankar)', district: 'पुणे', deity: 'महादेव', feature: 'भीमा नदीचे उगमस्थान; सह्याद्रीच्या दाट जंगलात शेकरू अभयारण्य' },
    { name: 'घृष्णेश्वर ज्योतिर्लिंग (Grishneshwar)', district: 'छत्रपती संभाजीनगर', deity: 'महादेव', feature: 'वेरूळ लेण्यांशेजारी; अहिल्याबाई होळकर यांनी केलेला जीर्णोद्धार' },
    { name: 'औंढा नागनाथ ज्योतिर्लिंग (Aundha Nagnath)', district: 'हिंगोली', deity: 'महादेव', feature: 'पांडवकालीन हेमाडपंथी मंदिर; संत नामदेवांच्या भक्तीने मंदिर फिरल्याची परंपरा' },
    { name: 'परळी वैजनाथ ज्योतिर्लिंग (Parli Vaijnath)', district: 'बीड', deity: 'वैद्यनाथ महादेव', feature: 'अमृतमंथनाशी संबंधित पौराणिक तीर्थक्षेत्र' }
  ],
  shaktipeethas: [
    { name: 'श्री तुळजाभवानी माता (Tuljapur)', district: 'धाराशिव', significance: 'संपूर्ण पीठ (छत्रपती शिवाजी महाराजांची कुलस्वामिनी)' },
    { name: 'श्री महालक्ष्मी / अंबाबाई (Kolhapur)', district: 'कोल्हापूर', significance: 'संपूर्ण पीठ (करवीर निवासिनी; किरणोत्सव सोहळा)' },
    { name: 'श्री रेणुका माता (Mahur)', district: 'नांदेड', significance: 'संपूर्ण पीठ (माहूरगड दत्तक्षेत्र)' },
    { name: 'श्री सप्तशृंगी माता (Vani - Saptashrungi)', district: 'नाशिक', significance: 'अर्धे पीठ (सात शिखरांच्या कुशीत विराजमान)' }
  ],
  ashtavinayak: [
    { name: 'मयूरेश्वर (मोरगाव)', district: 'पुणे', sequence: 1 },
    { name: 'सिद्धिविनायक (सिद्धटेक)', district: 'अहिल्यानगर', sequence: 2 },
    { name: 'बल्लाळेश्वर (पाली)', district: 'रायगड', sequence: 3 },
    { name: 'वरदविनायक (महड)', district: 'रायगड', sequence: 4 },
    { name: 'चिंतामणी (थेऊर)', district: 'पुणे', sequence: 5 },
    { name: 'गिरिजात्मज (लेण्याद्री)', district: 'पुणे', sequence: 6 },
    { name: 'विघ्नहर (ओझर)', district: 'पुणे', sequence: 7 },
    { name: 'महागणपती (रांजणगाव)', district: 'पुणे', sequence: 8 }
  ],
  majorPilgrimages: [
    { name: 'श्री विठ्ठल रुक्मिणी मंदिर (पंढरपूर)', district: 'सोलापूर', significance: 'महाराष्ट्राचे आराध्य दैवत; आषाढी-कार्तिकी वारी महासोहळा' },
    { name: 'श्री खंडोबा देवस्थान (जेजुरी)', district: 'पुणे', significance: 'महाराष्ट्राचे कुलदैवत; सुवर्ण नगरी (हळदीचा भंडारा)' },
    { name: 'संत ज्ञानेश्वर महाराज समाधी मंदिर (आळंदी)', district: 'पुणे', significance: 'इंद्रायणी काठ; ज्ञानेश्वरी संजीवन समाधी' },
    { name: 'संत तुकाराम महाराज मंदिर (देहू)', district: 'पुणे', significance: 'गाथा मंदिर व वैकुंठ गमन शिला' }
  ]
};

// 8. Sant Parampara Database (संत परंपरा व साहित्य ज्ञानपीठ)
export const SANT_PARAMPARA_DATABASE = [
  {
    name: 'संत ज्ञानेश्वर महाराज (Sant Dnyaneshwar)',
    period: 'इ.स. १२७५ - १२९६ (वय २१ वर्षे)',
    birthplace: 'आपगाव / आपेगाव (पैठण जवळ)',
    majorShrine: 'आळंदी (पुणे)',
    works: ['भावार्थ दीपिका (ज्ञानेश्वरी)', 'अमृतानुभव', 'चांगदेव पासष्टी', 'हरिपाठ'],
    philosophy: 'चिद्विलासवाद; भागवत धर्माचा पाया ("ज्ञानदेवे रचिला पाया, उभारिले देवालया")',
    famousQuote: 'जे खळांची व्यंकटी सांडो । तया सत्कर्मी रती वाढो । भूतां परस्परे पडो । मैत्र जीवांचे ॥'
  },
  {
    name: 'संत तुकाराम महाराज (Sant Tukaram)',
    period: 'इ.स. १६०८ - १६५०',
    birthplace: 'देहू (पुणे)',
    majorShrine: 'देहू (इंद्रायणी काठ)',
    works: ['तुकाराम गाथा (साडेचार हजार अभंग)'],
    philosophy: 'कर्मठतेवर प्रहार; प्रपंच सांभाळून परमार्थ; समता व सामाजिक जागृती',
    famousQuote: 'वृक्षवल्ली आम्हा सोयरी वनचरे । पक्षीही सुस्वरे आळविती ॥'
  },
  {
    name: 'संत नामदेव महाराज (Sant Namdev)',
    period: 'इ.स. १२७० - १३५०',
    birthplace: 'नरसी बामणी (हिंगोली)',
    majorShrine: 'पंढरपूर पायरी / घुमान (पंजाब)',
    works: ['नामदेव गाथा', 'गुरु ग्रंथ साहिब मधील ६१ पदे'],
    philosophy: 'भागवत धर्माची पताका पंजाबपर्यंत नेणारे राष्ट्रसंत ("नाचू कीर्तनाचे रंगी, ज्ञानदीप लावू जगी")',
    famousQuote: 'नामा म्हणे आम्ही विठ्ठलाचे दास । नाही आम्हा भय कोणाचेही ॥'
  },
  {
    name: 'संत एकनाथ महाराज (Sant Eknath)',
    period: 'इ.स. १५३३ - १५९९',
    birthplace: 'पैठण (छत्रपती संभाजीनगर)',
    majorShrine: 'पैठण (गोदावरी काठ)',
    works: ['एकनाथी भागवत', 'भावार्थ रामायण', 'रुक्मिणी स्वयंवर', 'भारुडे'],
    philosophy: 'लोकप्रबोधनासाठी भारुडांचा वापर; अस्पृश्यता निवारण व भूतदया',
    famousQuote: 'संस्कृत वाणी देवे केली । तरी प्राकृत काय चोरापासुनि झाली ?'
  },
  {
    name: 'संत गाडगे बाबा (Sant Gadge Baba)',
    period: 'इ.स. १८७६ - १९५६',
    birthplace: 'शेंडगाव (अमरावती)',
    majorShrine: 'अमरावती',
    works: ['दहा कलमी संदेश', 'स्वच्छता कीर्तने'],
    philosophy: 'देव देवळात नाही तर भुकेलेल्या आणि दरिद्री माणसात आहे; ग्रामस्वच्छता',
    famousQuote: 'भुकेलेल्यांना अन्न द्या, तहानलेल्यांना पाणी द्या, उघड्यांना वस्त्र द्या, बेघरांना आसरा द्या!'
  }
];

// 9. Dialects & Language Atlas (महाराष्ट्र भाषा व बोलीकोश)
export const DIALECT_ATLAS = [
  {
    dialect: 'पुणेरी / प्रमाण मराठी (Standard Marathi)',
    regions: 'पुणे, सातारा, पश्चिम महाराष्ट्र',
    tone: 'स्पष्ट, व्याकरणबद्ध, उपरोधात्मक विनोदप्रियता',
    sample: 'तुम्ही नक्की कवा येणार आहात? आटोपशीर बोलायला शिका.'
  },
  {
    dialect: 'वऱ्हाडी (Varhadi)',
    regions: 'अमरावती, अकोला, यवतमाळ, बुलढाणा, वाशीम',
    tone: 'गोड, ओघवती, आपलेपणाने भरलेली',
    sample: 'कुठं चालले बे बापू? जरा थांबून चाहा पानी घेऊन जा ना!'
  },
  {
    dialect: 'अहिराणी / खानदेशी (Ahirani / Khandeshi)',
    regions: 'जळगाव, धुळे, नंदुरबार',
    tone: 'लयबद्ध, ग्रामीण चैतन्य, कानडी व गुजराती संमिश्रण',
    sample: 'मना घर मा आवजो! तुना काम व्हई गय का रे?'
  },
  {
    dialect: 'मालवणी / कोकणी (Malvani)',
    regions: 'सिंधुदुर्ग, रत्नागिरी, गोवा सीमा',
    tone: 'जलद, नादमधुर, हजरजबाबी, नाट्यमय',
    sample: 'काय रं गोव्याक चाललास काय? मासळी खावूक व्हयी का नाय?'
  },
  {
    dialect: 'आगरी (Agri)',
    regions: 'ठाणे, रायगड, पालघर समुद्रकिनारपट्टी',
    tone: 'खणखणीत, थेट, समुद्राच्या लाटांसारखा नाद',
    sample: 'आरं बाबा, बाजारामंदी काय भाव हाय आज सुकटिचा?'
  }
];

// Comparative Vocabulary Table (शब्द तुलना)
export const DIALECT_COMPARATOR = [
  { standard: 'मुलगा (Boy)', puneri: 'पोरगा', varhadi: 'पोरगा / बे', ahirani: 'पोरस', malvani: 'भुरगो / चेडो', agri: 'पोरगा' },
  { standard: 'पाणी (Water)', puneri: 'पाणी', varhadi: 'पानी', ahirani: 'पानी', malvani: 'उदक / पाणी', agri: 'पानी' },
  { standard: 'कुठे चालला आहेस? (Where are you going?)', puneri: 'कुठे चाललायस?', varhadi: 'कुठं चालला बे?', ahirani: 'कठे जाई राहिना?', malvani: 'खयं चाललास?', agri: 'कुठं निगालास?' },
  { standard: 'जेवण झाले का? (Did you have food?)', puneri: 'जेवलात का?', varhadi: 'जेवन झालं का बापू?', ahirani: 'जेवण व्हयणा का?', malvani: 'जेवलंस काय रे?', agri: 'खाल्लास का?' }
];

// 10. Food & Culinary Heritage Atlas (महाराष्ट्र खाद्यसंस्कृती)
export const FOOD_ATLAS = [
  {
    name: 'पुरणपोळी (Puran Poli)',
    region: 'संपूर्ण महाराष्ट्र (पुणे/खानदेश/मराठवाडा विशेष प्रकार)',
    ingredients: 'हरभरा डाळ, गूळ, वेलची, जायफळ, कणिक, साजूक तूप',
    history: '१२ व्या शतकातील मानसोल्लास ग्रंथात "पोलिका" असा उल्लेख; होळी व सणांचे अविभाज्य गोड पक्वान्न.',
    festivalAssociation: 'होळी, गुढीपाडवा, बैलपोळा, गणेशोत्सव',
    servingStyle: 'गरमागरम पुरणपोळीवर साजूक तूपाची धार आणि कटाची आमटी / गुळवणी.'
  },
  {
    name: 'पिठलं-भाकरी व खर्डा (Pithla Bhakri & Thecha)',
    region: 'सह्याद्रीची ग्रामीण संस्कृती व मावळ प्रांत',
    ingredients: 'बेसन, लसूण, हिरव्या मिरच्या, जिरं, ज्वारी/बाजरी पीठ, शेंगदाणे',
    history: 'मावळ्यांचा युद्धातील मुख्य आहार; झटपट, पौष्टिक आणि अफाट चवदार.',
    festivalAssociation: 'दैनिक शेतकरी व दुर्गभटक्यांचा आवडता आहार',
    servingStyle: 'गरम तव्यावरची बाजरीची भाकरी, कांदा फोडून आणि लोण्याचा गोळा.'
  },
  {
    name: 'कोल्हापुरी तांबडा-पांढरा रस्सा (Kolhapuri Tambda-Pandhra Rassa)',
    region: 'कोल्हापूर',
    ingredients: 'मटणाचा अर्क, लवंगी मिरची, खसखस, सुके खोबरे, तीळ, जायपत्री',
    history: 'छत्रपती शाहू महाराजांच्या शिकार व मल्ल परंपरेतून विकसित झालेली अद्वितीय पाककृती.',
    festivalAssociation: 'रविवार विशेष, जत्रा, पाहुणचार',
    servingStyle: 'मटण सुक्का, ज्वारीची भाकरी आणि रस्सा वाटी.'
  },
  {
    name: 'उकडीचे मोदक (Ukadiche Modak)',
    region: 'कोकण व पश्चिम महाराष्ट्र',
    ingredients: 'तांदळाची पिठी (आंबेमोहोर), ओला नारळ, गूळ, वेलची, जायफळ',
    history: 'गणपती बाप्पांचे परमप्रिय नैवेद्य; प्राचीन पुराणांत मोदकाचा उल्लेख.',
    festivalAssociation: 'गणेश चतुर्थी, संकष्टी चतुर्थी',
    servingStyle: 'केळीच्या पानावर वाफाळलेल्या मोदकावर साजूक तूप ओतून.'
  },
  {
    name: 'सोलकढी (Solkadhi)',
    region: 'कोकण किनारपट्टी (मालवण, अलिबाग, रत्नागिरी)',
    ingredients: 'ताज्या नारळाचे दूध, आमसूल (कोकम), लसूण, हिरवी मिरची, कोथिंबीर',
    history: 'उष्ण दमट हवामानात पचनासाठी कोकणी पूर्वजांनी शोधलेले नैसर्गिक अमृत.',
    festivalAssociation: 'कोकणी जेवणाचा तृप्तीदायक शेवट',
    servingStyle: 'थंडगार वाटीत जेवणानंतर प्यावे.'
  }
];

// 11. Textiles, Sarees & Handicrafts (वस्त्र व हस्तकला वारसा)
export const TEXTILE_AND_CRAFT_REGISTRY = [
  {
    name: 'पैठणी साडी (Paithani Saree)',
    cluster: 'पैठण (छत्रपती संभाजीनगर) व येवला (नाशिक)',
    period: 'सातवाहन काळ (सुमारे २,००० वर्षे प्राचीन); पेशवे काळात सुवर्णकाळ',
    characteristics: 'शुद्ध रेशीम आणि सोन्या-चांदीच्या जरतारीने विणलेला पदर; मोराची नक्षी (मोरपंख), पोपट, कमळ व मुनिया बॉर्डर.',
    giTag: 'भौगोलिक मानांकन (GI Tag) प्राप्त'
  },
  {
    name: 'कोल्हापुरी चप्पल (Kolhapuri Chappals)',
    cluster: 'कोल्हापूर, मिरज, अथणी परिसर',
    period: '१३ व्या शतकात बिच्छू व इतर कारागिरांकडून प्रारंभ; छत्रपती शाहू महाराजांचे राज्याश्रय',
    characteristics: '१००% अस्सल स्थानिक कातडे, वनस्पती रंगांचा वापर, हाताने केलेले बारीक शिवण, खडखड वाजणारा नाद.',
    giTag: 'भौगोलिक मानांकन (GI Tag) प्राप्त'
  },
  {
    name: 'वारली चित्रकला (Warli Folk Painting)',
    cluster: 'पालघर, डहाणू, तलासरी (आदिवासी पट्टा)',
    period: 'इ.स. पूर्व १० व्या शतकापासून चालत आलेली आदिम परंपरा',
    characteristics: 'तांदळाच्या पिठाचा पांढरा रंग आणि गेरूची लाल माती; त्रिकोण, वर्तुळ व रेषांमधून रेखाटलेले निसर्ग, शेती व तारपा नृत्य.',
    giTag: 'भौगोलिक मानांकन (GI Tag) प्राप्त'
  },
  {
    name: 'सोलापूर चादर व टॉवेल (Solapur Chaddar)',
    cluster: 'सोलापूर',
    period: 'पेशवे काळ व नंतरच्या गिरणी उद्योगातून जागतिक ख्याती',
    characteristics: 'जाड Jacquard विणकाम, टिकाऊपणा आणि मोहक भौमितिक डिझाईन्स.',
    giTag: 'भौगोलिक मानांकन (GI Tag) प्राप्त'
  },
  {
    name: 'पुणेरी पगडी व फेटा (Puneri Pagadi & Feta)',
    cluster: 'पुणे व कोल्हापूर',
    period: '१७ व्या शतकापासून मराठा व पेशवेकालीन सन्मानाचे प्रतीक',
    characteristics: 'स्वाभिमान, शौर्य व आदरातिथ्याचे शिरोभूषण (पुणेरी फेटा, कोल्हापुरी फेटा, मावळी फेटा).'
  }
];

// 12. Stepwells & Wadas (बारव व ऐतिहासिक वाडे)
export const HERITAGE_ARCHITECTURE = [
  {
    name: 'शनिवार वाडा (Shaniwar Wada)',
    location: 'पुणे',
    builtBy: 'पहिले बाजीराव पेशवे (इ.स. १७३२)',
    features: 'मराठा साम्राज्याची सत्ताकेंद्र; दिल्ली दरवाजा, मस्तानी दरवाजा, कारंजे व सात मजली वाड्याचे अवशेष.'
  },
  {
    name: 'विश्रामबाग वाडा (Vishrambaug Wada)',
    location: 'पुणे (बाजीराव रस्ता)',
    builtBy: 'दुसरे बाजीराव पेशवे (इ.स. १८०७)',
    features: 'सुरेख लाकडी कोरीव काम, मेघडंबरी, हत्ती अंबारी डिझाईन आणि भव्य चौक.'
  },
  {
    name: 'बारा मोटेची विहीर (Limb Stepwell)',
    location: 'लिंब (सातारा)',
    builtBy: 'विरूबाई भोसले (इ.स. १७१९-१७२४)',
    features: '११० फूट खोल अद्भूत पायऱ्यांची विहीर; आत महाल, गुप्त दालने व एकाच वेळी १२ मोटा चालवण्याची सोय.'
  },
  {
    name: 'पिंपळेश्वर बारव (Pimpleshwar Barav)',
    location: 'पारनेर / अहमदनगर',
    builtBy: 'यादव काळ / पेशवे काळ',
    features: 'हेमाडपंथी पाषाण पायऱ्या, कोनाडे, गणेश मूर्ती व प्राचीन जलसंवर्धन तंत्रज्ञान.'
  }
];

// 13. Curated Heritage Trails (वारसा पर्यटन ट्रेल्स)
export const HERITAGE_TRAILS_PRESETS = [
  {
    id: 'trail-swarajya-forts',
    title: 'स्वराज्य राजधानी व बालेकिल्ला सर्किट (Swarajya Forts Trail)',
    duration: '३ दिवस / २ रात्री',
    route: 'पुणे → तोरणा → राजगड → सिंहगड → रायगड',
    theme: 'दुर्गभ्रमण व स्वराज्य इतिहास',
    highlights: ['रायरेश्वर शपथ स्थळ', 'राजगडावरील २५ वर्षे राजधानी', 'रायगडावर राज्याभिषेक दालन', 'सिंहगडावरील तानाजी स्मारक']
  },
  {
    id: 'trail-konkan-naval',
    title: 'शिवकालीन आरमार व सागरी दुर्ग परिक्रमा (Maratha Naval Trail)',
    duration: '४ दिवस / ३ रात्री',
    route: 'अलिबाग (कुलाबा) → मुरुड जंजिरा → सुवर्णदुर्ग → विजयदुर्ग → सिंधुदुर्ग',
    theme: 'सागरी युद्धनीती व जलदुर्ग',
    highlights: ['सिंधुदुर्ग हाताचे ठसे', 'विजयदुर्ग तिहेरी तटबंदी', 'कासा व पद्मदुर्ग', 'मालवणी पद्धतीचे जेवण']
  },
  {
    id: 'trail-sant-wari',
    title: 'वारकरी भक्तीमार्ग व संत पदस्पर्श ट्रेल (Sant Parampara Trail)',
    duration: '३ दिवस / २ रात्री',
    route: 'आळंदी (ज्ञानेश्वर महाराज) → देहू (तुकाराम महाराज) → जेजुरी (खंडोबा) → पंढरपूर (विठ्ठल)',
    theme: 'अध्यात्म व वारकरी संस्कृती',
    highlights: ['इंद्रायणी काठ', 'चंद्रभागा स्नान', 'भजन-कीर्तन अनुभव', 'वारी मुक्काम स्थळे']
  }
];

// 14. API Endpoints Schema Specification for Developers & Research
export const API_ENDPOINTS_SPEC = [
  { method: 'GET', endpoint: '/api/v1/atlas/divisions', desc: 'महाराष्ट्रातील ६ प्रशासकीय विभाग व ३६ जिल्ह्यांची संपूर्ण भौगोलिक माहिती' },
  { method: 'GET', endpoint: '/api/v1/forts', desc: '३५०+ गड-किल्ल्यांची सविस्तर नोंदवही, ट्रेक काठिण्य, मार्ग व पुरावे' },
  { method: 'GET', endpoint: '/api/v1/forts/:slug', desc: 'विशिष्ट किल्ल्याचा इतिहास, बुरूज, दरवाजे, टाकी व संवर्धन स्थिती' },
  { method: 'GET', endpoint: '/api/v1/battles', desc: 'ऐतिहासिक लढाया, सेनापती, सैन्यबळ, डावपेच व परिणाम' },
  { method: 'GET', endpoint: '/api/v1/temples', desc: 'ज्योतिर्लिंग, अष्टविनायक, शक्तिपीठे व तीर्थक्षेत्रांची संपूर्ण माहिती' },
  { method: 'GET', endpoint: '/api/v1/modi-script/alphabets', desc: 'मोडी लिपी मुळाक्षरे, बाराखडी व सराव उदाहरणे' },
  { method: 'GET', endpoint: '/api/v1/dialects/compare', desc: 'प्रमाण मराठी, वऱ्हाडी, अहिराणी, मालवणी व आगरी शब्द तुलना' },
  { method: 'GET', endpoint: '/api/v1/knowledge-graph/entity/:id', desc: 'एका घटकाशी (उदा. रायगड) जोडलेले लोक, लढाया, मंदिरे, अन्न व संदर्भ' },
  { method: 'POST', endpoint: '/api/v1/contributions/submit', desc: 'नवीन इतिहास नोंद किंवा सुधारणा पुनरावलोकनासाठी पाठवणे' }
];
