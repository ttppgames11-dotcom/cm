import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Tab categories for exploring Agri-Koli culture
const EXPLORE_TABS = [
  { id: 'all', label: 'सर्व दालने (Overview)', icon: '🌊' },
  { id: 'koliwada', label: 'कोळीवाडा दर्शन (Village Explorer)', icon: '🛶' },
  { id: 'agri', label: 'आगरी समाज व मिठागरे (Salt & Land)', icon: '🌾' },
  { id: 'navy', label: 'शिवराय आरमार व मायनाक भंडारी', icon: '⚓' },
  { id: 'food', label: 'अस्सल खाद्यसंस्कृती (Cuisine)', icon: '🍲' },
  { id: 'dialects', label: 'बोलीभाषा व शब्दकोश (Dialects)', icon: '🗣️' },
  { id: 'festivals', label: 'नारळी पौर्णिमा व उत्सव (Festivals)', icon: '🌕' },
  { id: 'sacred', label: 'कुलदैवत व तीर्थक्षेत्रे (Sacred Shrines)', icon: '🛕' },
  { id: 'then_now', label: 'पूर्वी विरुद्ध आज (Then vs Now)', icon: '🏙️' }
];

// Interactive Koliwada Village nodes
const KOLIWADA_NODES = [
  {
    id: 'boats',
    title: 'पारंपरिक होड्या व नावा (Boats & Craft)',
    icon: '🛶',
    shortDesc: 'मचवा, पगार, वाघूर आणि शिडाची लाकडी जहाजे.',
    fullDesc: 'कोळी बांधवांची होडी ही केवळ लाकूड नसते, तर ती समुद्रातील प्रत्यक्ष कुलदैवत मानली जाते. प्राचीन काळापासून सागवान किंवा बाभळीच्या लाकडापासून बनवलेल्या होड्या, त्यांना डिंक-तेलाचे लेपण करून जलरोधक करणे आणि शिडांच्या साहाय्याने वाऱ्याची दिशा पकडणे हे कोळी बांधवांचे परंपरागत तंत्रज्ञान आहे. आधुनिक काळात या होड्यांना डिझेल इंजिन व जीपीएस प्रणाली जोडली गेली आहे.',
    tools: ['मचवा (Machwa)', 'शिडाची बोट', 'पगार', 'लाकडी वल्ही']
  },
  {
    id: 'nets',
    title: 'जाळी व मासेमारी तंत्रज्ञान (Nets & Tides)',
    icon: '🎣',
    shortDesc: 'दोल जाळे, फाग जाळे व भरती-ओहोटीचे खगोल ज्ञान.',
    fullDesc: 'कोळी समाजाकडे समुद्राच्या लाटा, पाण्याचा रंग, वाऱ्याचा वेग आणि चंद्राच्या कलेवरून भरती-ओहोटी (उधाण व भांग) ओळखण्याचे अफाट निसर्गज्ञान असते. दोल जाळे हे खाडीत किंवा समुद्रात लाकडी खांबांना बांधून खोल पाण्यात सोडले जाते. लहान माशांसाठी बारीक जाळी आणि सुरमई, पापलेटसाठी विशिष्ट आकाराची फाग जाळी वापरली जातात.',
    tools: ['दोल जाळे', 'फाग जाळे', 'काथ जाळे', 'खांब दोरखंड']
  },
  {
    id: 'market',
    title: 'मासळी बाजार व कोळीणींचे नेतृत्व (Women Leadership)',
    icon: '🐟',
    shortDesc: 'कोळी महिलांचे आर्थिक नेतृत्व, ताजी मासळी लिलाव व व्यापार.',
    fullDesc: 'कोळी संस्कृतीचे सर्वात मोठे वैशिष्ट्य म्हणजे महिलांचे (कोळीणींचे) स्वाभिमानी व कणखर नेतृत्व! पुरुष रात्री समुद्रात मासेमारी करून पहाटे किनाऱ्यावर येतात, आणि तिथून पुढे मासळीचा ताबा कोळी महिलांकडे येतो. लिलाव पुकारणे, मुंबई-ठाण्याच्या मासळी बाजारात (उदा. ससून डॉक, भाऊचा धक्का, छत्रपती शिवाजी महाराज मार्केट) ताजी मासळी विकणे आणि घराचे संपूर्ण अर्थकारण सांभाळणे ही जबाबदारी कोळीण मोठ्या दिमाखात पार पाडते.',
    tools: ['बांबूची टोपली (पाटी)', 'वजन काटा', 'बर्फाचे थर', 'ताजी मासळी']
  },
  {
    id: 'house',
    title: 'पारंपरिक कोळी घर (Traditional Koli House)',
    icon: '🏠',
    shortDesc: 'ओटी, कौलारू छप्पर, सुके मासे साठवण व अंगण.',
    fullDesc: 'कोळीवाड्यातील घरे ही समुद्रकिनाऱ्याला लागून दाटीवाटीने पण एकमेकांच्या सुख-दुःखात धावून येणाऱ्या गल्लीबोळांमध्ये असतात. घराच्या दर्शनी भागात प्रशस्त ओटी (ओट्यावर जाळी विणण्याचे काम चालते), कौलारू छप्पर, माशांची खारवून साठवणूक करण्याची स्वतंत्र जागा आणि दारात तुळशी वृंदावन हे पारंपरिक कोळी घराचे रूप आहे.',
    tools: ['ओटी', 'कौलारू छप्पर', 'मासे सुकवण्याचे मांडव']
  },
  {
    id: 'temple',
    title: 'स्थानिक देवस्थान व वेताळ मंदिर (Coastal Deities)',
    icon: '🛕',
    shortDesc: 'वेताळ देव, हर्बादेवी, भद्रकाली व दर्यापीर पूजन.',
    fullDesc: 'समुद्रात जाण्यापूर्वी वादळांपासून रक्षण व्हावे म्हणून कोळी बांधव गावातील वेताळ देव, मरीआई, भद्रकाली व हर्बादेवीला कौल लावतात. समुद्रातील अज्ञात संकटांवर मात करण्यासाठी श्रद्धा हा त्यांचा सर्वात मोठा मानसिक आधार असतो.',
    tools: ['वेताळ मूर्ती', 'नारळ अर्पण', 'कुंकू-हळद', 'सिंदूर']
  },
  {
    id: 'music_dance',
    title: 'कोळी संगीत व नृत्य (Folk Music & Dance)',
    icon: '🎵',
    shortDesc: '‘मी हाय कोळी’, डफ, ढोलकी व लाटांच्या तालावरील नृत्य.',
    fullDesc: 'कोळी नृत्य हे लाटांच्या हेलकाव्यांवर आणि वल्हवण्याच्या हालचालींवर आधारित असते. पुरुष व महिला हातात हात घालून, कमरेवर हात ठेवून वाकून पुढे-मागे होत लयबद्ध नृत्य करतात. लग्नसमारंभात, नारळी पौर्णिमेला आणि होळीच्या सणात कोळी गीतांच्या तालावर संपूर्ण कोळीवाडा रात्रभर थिरकतो.',
    tools: ['डफ', 'ढोलकी', 'घुंगरू', 'काशाची थाळी']
  }
];

// Agri Samaj features
const AGRI_SAMAJ_DATA = {
  title: 'आगरी समाज — मिठागरे, भातशेती व खाडी परिसराचे वैभव',
  overview: 'आगरी समाज हा महाराष्ट्राच्या ठाणे, रायगड, पालघर, मुंबई उपनगर, नवी मुंबई, पनवेल, उरण, पेण व अलिबाग परिसरातील मूळ भूमिपुत्र समाज आहे. "आगर" म्हणजे मिठाचे आगार किंवा भाताची शेतजमीन; यावरून या समाजाला आगरी हे नाव पडले. हा समाज अत्यंत कष्टाळू, स्वाभिमानी, निधड्या छातीचा आणि आदरातिथ्यात अग्रेसर मानला जातो.',
  pillars: [
    {
      title: 'मिठागरे (Salt Pans Culture)',
      icon: '🧂',
      desc: 'समुद्राच्या खाऱ्या पाण्यापासून वाफे तयार करून ऊन व वाऱ्याच्या साहाय्याने नैसर्गिक मीठ तयार करण्याचे पारंपरिक कसब आगरी समाजाने शतकानुशतके जपले आहे. ठाणे, उरण, तुर्भे, वडाळा व वसईची मिठागरे ऐतिहासिकदृष्ट्या प्रसिद्ध आहेत.'
    },
    {
      title: 'खार जमिनीतील भातशेती (Coastal Paddy Farming)',
      icon: '🌾',
      desc: 'खाडीच्या खाऱ्या पाण्याला बांध घालून अटकाव करणे आणि पावसाच्या गोड्या पाण्यावर खारपाटातील तांदूळ (उदा. लाल भात, कोलम, वाडा कोलम) पिकवणे ही आगरी शेतकऱ्यांची खास ओळख आहे.'
    },
    {
      title: 'खाडी व खारफुटी परिसंस्था (Creek Ecosystem)',
      icon: '🦀',
      desc: 'खाडीतील दलदल, खारफुटी व गाळातून चिंबोरी (खेकडे), जवळा व स्थानिक मासे पकडण्यात आगरी बांधव निष्णात असतात.'
    },
    {
      title: 'आगरी स्वाभिमान व एकोपा',
      icon: '✊',
      desc: 'गावातील सण, लग्नकार्य किंवा कोणताही लढा असो; आगरी समाजात प्रचंड सामाजिक एकोपा व परस्पर सहकार्य दिसून येते.'
    }
  ],
  regions: ['ठाणे (Thane)', 'रायगड (Raigad)', 'पालघर (Palghar)', 'नवी मुंबई (Navi Mumbai)', 'पनवेल (Panvel)', 'उरण (Uran)', 'अलिबाग (Alibaug)', 'पेण (Pen)']
};

// Shivaji Maharaj, Maratha Navy & Maynak Bhandari
const NAVY_HEROES_DATA = {
  title: 'छत्रपती शिवाजी महाराज, मराठा आरमार व मायनाक भंडारी',
  subheading: '“ज्यांचे आरमार, त्याचा समुद्र” — शिवरायांचे दूरगामी सागरी धोरण',
  concept: 'मध्ययुगीन काळात परकीय सत्ता (पोर्तुगीज, ब्रिटिश, डच, जंजिऱ्याचे सिद्दी) समुद्रावरून भारताला वेठीस धरत होत्या. छत्रपती शिवरायांनी ओळखले की सह्याद्रीच्या गडकोटांसोबतच पश्चिमेकडील अरबी समुद्रावर आपले नियंत्रण असल्याशिवाय स्वराज्य सुरक्षित राहू शकत नाही. यासाठी महाराजांनी स्थानिक कोळी, खारवी, भंडारी व सागरपुत्रांना एकत्र करून स्वतंत्र मराठा आरमाराची स्थापना केली.',
  maynakBhandari: {
    name: 'मायनाक भंडारी (Maynak Bhandari)',
    role: 'मराठा आरमाराचे प्रमुख सेनानी व खांदेरीचे अजिंक्य वीर',
    battle: 'खांदेरी बेटाची ऐतिहासिक सागरी लढाई (इ.स. १६७९)',
    desc: 'इ.स. १६७९ मध्ये छत्रपती शिवरायांनी मुंबईजवळील खांदेरी बेटावर तटबंदी बांधून आरमारी ठाणे उभारण्याचे आदेश दिले. इंग्रजांनी आणि सिद्दीने याला कडाडून विरोध केला व त्यांची बलाढ्य जहाजे खांदेरीवर चालून आली. त्यावेळी मायनाक भंडारी आणि दौलत खान यांनी आपल्या छोट्या पण चपळ मराठा गलबतांच्या साहाय्याने इंग्रजांच्या अजस्त्र जहाजांचा (उदा. रिव्हेंज) धुव्वा उडवला. इंग्रज तोफांचा भडिमार सुरू असतानाही मायनाक भंडारींनी अढळ धैर्याने लढा दिला आणि खांदेरी बेटावर मराठ्यांचे भगवे निशाण फडकते ठेवले.',
    sources: 'समकालीन ब्रिटिश ईस्ट इंडिया कंपनी फॅक्टरी रेकॉर्ड्स (बॉम्बे), जेधे शकावली व मराठा दफ्तर नोंदी.'
  },
  seaForts: [
    { name: 'किल्ले सिंधुदुर्ग', desc: 'मालवणजवळ कुरटे बेटावर शिवरायांनी उभारलेला अभेद्य जलदुर्ग; मराठा आरमाराचे मुख्य केंद्र.', icon: '🏰' },
    { name: 'किल्ले विजयदुर्ग (घेरिया)', desc: 'मराठा आरमाराची अजिंक्य राजधानी, कान्होजी आंग्रे यांचे मुख्य ठाणे व नैसर्गिक सुरक्षित बंदर.', icon: '⚓' },
    { name: 'खांदेरी-अंदेरी', desc: 'मुंबईच्या वेशीवर इंग्रजांच्या नाकावर टिच्चून मायनाक भंडारींनी लढवलेला आरमारी किल्ला.', icon: '🚩' },
    { name: 'किल्ले कुलाबा (अलिबाग)', desc: 'सागरी संरक्षणासाठी भर समुद्रात दगडी तटांनी बांधलेला शिवकालीन जलदुर्ग.', icon: '🌊' }
  ]
};

// Authentic Gastronomy (Agri vs Koli)
const CUISINE_ITEMS = [
  {
    community: 'आगरी खाद्यसंस्कृती',
    dishName: 'अस्सल आगरी मटण / चिकन सुका व तांदळाची भाकरी',
    type: 'आगरी खासियत',
    icon: '🍲',
    desc: '२५ पेक्षा अधिक खड्या मसाल्यांना मंद आचेवर भाजून तयार केलेला अस्सल आगरी मसाला, कांदा-खोबऱ्याचे घट्ट वाटण आणि चुलीवर भाजलेली मऊ तांदळाची गरमागरम भाकरी.',
    specialty: 'आगरी मसाल्याचा तीव्र स्वाद व लालभडक रस्सा.'
  },
  {
    community: 'आगरी खाद्यसंस्कृती',
    dishName: 'चिंबोरी (खेकडा) मसाला व रस्सा',
    type: 'खाडी पदार्थ',
    icon: '🦀',
    desc: 'खाडीतील ताजे भरगच्च खेकडे साफ करून आगरी मसाल्यात शिजवलेला झणझणीत रस्सा. हा भातासोबत किंवा भाकरीसोबत अत्यंत आवडीने खाल्ला जातो.',
    specialty: 'ताजे स्थानिक खेकडे व पारंपरिक वाटण.'
  },
  {
    community: 'कोळी खाद्यसंस्कृती',
    dishName: 'तळलेली कुरकुरीत सुरमई व पापलेट फ्राय',
    type: 'कोळी खासियत',
    icon: '🐟',
    desc: 'समुद्रातून थेट आलेली ताजी सुरमई किंवा पापलेट, तिला आले-लसूण, हळद, तिखट, आगळ (कोकम सरबत) लावून तांदळाच्या पिठात घोळवून तव्यावर कुरकुरीत तळणे.',
    specialty: 'आगळ (कोकम) व तांदळाच्या पिठाचे कोटिंग.'
  },
  {
    community: 'कोळी खाद्यसंस्कृती',
    dishName: 'बॉम्बे डक (कुरकुरीत बोंबील फ्राय)',
    type: 'जागतिक प्रसिद्ध',
    icon: '🍤',
    desc: 'आत मऊ आणि बाहेरून अत्यंत कुरकुरीत असलेला बोंबील फ्राय हा मुंबई व कोकणच्या कोळीवाड्यातील जगप्रसिद्ध खाद्यपदार्थ आहे.',
    specialty: 'पाणी पूर्णपणे निथळून रवा-तांदूळ पिठात तळणे.'
  },
  {
    community: 'कोळी खाद्यसंस्कृती',
    dishName: 'सोडे भात (सुके कोळंबी पुलाव)',
    type: 'पारंपरिक साठवणूक डिश',
    icon: '🍚',
    desc: 'पावसाळ्यात जेव्हा समुद्रात मासेमारी बंद असते, तेव्हा उन्हाळ्यात खारवून वाळवलेले सोडे (सुकी कोळंबी) वापरून केलेला मसालेदार भात.',
    specialty: 'पारंपरिक ड्राय-फिश संवर्धन पद्धत.'
  },
  {
    community: 'आगरी-कोळी संयुक्त',
    dishName: 'गोड नारळी भात (नारळी पौर्णिमा विशेष)',
    type: 'उत्सवी गोड पदार्थ',
    icon: '🥥',
    desc: 'नारळी पौर्णिमेच्या दिवशी ताजा खवलेला नारळ, बासमती/आंबेमोहर तांदूळ, गूळ किंवा साखर, तूप, लवंग, वेलची व जायफळ घालून केलेला सुगंधी भात.',
    specialty: 'सागराला अर्पण केलेला पवित्र नैवेद्य.'
  }
];

// Dialects & Vocabulary
const DIALECT_SAMPLES = [
  { standard: 'कुठे चाललास तू?', agri: 'कते चाललास तू रे बावा?', koli: 'कते चाल्लास गो?', context: 'विचारपूस / दैनंदिन संवाद' },
  { standard: 'काय करतो आहेस?', agri: 'काय करतंय?', koli: 'काय करतंयस?', context: 'सध्याची कृती' },
  { standard: 'जेवलास का तू?', agri: 'जेवलास का रे पोरा?', koli: 'जेवलास काय रे?', context: 'भोजन विचारणा' },
  { standard: 'समुद्रात मोठी भरती आली आहे.', agri: 'खाडीला पाणी चढलंय भरपूर.', koli: 'दर्याला उधाण आलंय भारी!', context: 'सागरी परिस्थिती' },
  { standard: 'होडी पाण्यात सोडा.', agri: 'नाव पाण्यात टाका.', koli: 'होडी लाटांवर सोरा!', context: 'मासेमारी प्रस्थान' }
];

export default function AgriKoliSamajPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedKoliNode, setSelectedKoliNode] = useState(KOLIWADA_NODES[0]);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9', color: '#431407' }}>
      
      {/* ================= HERO HEADER ================= */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 50%, #EA580C 100%)',
        color: '#FFFFFF',
        padding: '50px 20px 42px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '16px', opacity: 0.9 }}>
            <Link to="/" style={{ color: '#FDE68A', textDecoration: 'none' }}>मुख्यपृष्ठ</Link>
            <span>/</span>
            <Link to="/culture" style={{ color: '#FDE68A', textDecoration: 'none' }}>संस्कृती व वारसा</Link>
            <span>/</span>
            <span>आगरी-कोळी समाज व सागरी वारसा</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <span>🌊 कोकण किनारपट्टी व खाडीचे भूमिपुत्र</span>
            <span>•</span>
            <span>स्वतंत्र संस्कृती, इतिहास व आरमार</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            आगरी-कोळी समाज व सागरी वारसा
          </h1>
          
          <p style={{ fontSize: '1.15rem', maxWidth: '920px', opacity: 0.95, lineHeight: 1.6, marginBottom: '24px' }}>
            कोकणच्या अथांग समुद्राचे राजे ‘कोळी बांधव’ आणि मिठागरे व खार जमिनीतील भातशेतीचे वैभव ‘आगरी समाज’—दोन्ही समुदायांची स्वतंत्र सामाजिक ओळख, जीवनशैली, खाद्यसंस्कृती, नारळी पौर्णिमा आणि छत्रपती शिवरायांच्या आरमारात मायनाक भंडारींनी गाजवलेला अतुलनीय पराक्रम!
          </p>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FDE68A' }}>🟠 आगरी समाज</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>मिठागरे, भातशेती व ठाणे-रायगड परिसर</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#93C5FD' }}>🔵 कोळी समाज</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>अथांग समुद्र, पारंपरिक मासेमारी व कोळीवाडा</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#86EFAC' }}>⚓ मायनाक भंडारी</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>१६७९ खांदेरीचे ऐतिहासिक आरमारी शौर्य</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FDE68A' }}>🌕 नारळी पौर्णिमा</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>दर्यापूजन व सुवर्ण नारळ अर्पण सोहळा</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NAVIGATION TABS ================= */}
      <div style={{ background: '#FFFFFF', borderBottom: '2px solid #FED7AA', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '10px 20px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {EXPLORE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeTab === tab.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                background: activeTab === tab.id ? '#7C1D05' : '#FFFDF9',
                color: activeTab === tab.id ? '#FFFFFF' : '#7C1D05',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* ================= CULTURAL DISTINCTION NOTICE ================= */}
        <section style={{
          background: '#FFFFFF',
          border: '2px solid #FED7AA',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '36px',
          boxShadow: '0 4px 14px rgba(234,88,12,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🧭</span>
            <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
              महत्त्वपूर्ण ऐतिहासिक व सामाजिक स्पष्टीकरण
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: '0 0 10px' }}>
            आगरी आणि कोळी: एकच नव्हे, तर स्वतंत्र सांस्कृतिक ओळख असलेले दोन स्वाभिमानी समाज
          </h2>
          <p style={{ color: '#78350F', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
            अनेकदा लोकप्रिय बोलचालीत ‘आगरी-कोळी’ असा एकच जोडशब्द वापरला जातो; परंतु ऐतिहासिक व सामाजिकदृष्ट्या हे दोन स्वतंत्र समुदाय आहेत. 
            <strong> आगरी समाज</strong> हा प्रामुख्याने खाडी परिसर, मिठागरे (Salt pans) आणि किनारी भातशेतीशी जोडलेला आहे. 
            तर <strong>कोळी समाज</strong> हा अथांग समुद्र, थेट खोल पाण्यातील मासेमारी, होड्या आणि कोळीवाड्यांशी जोडलेला आहे. 
            Connect Maratha या दोन्ही समुदायांच्या स्वतंत्र अस्मितेचा, परस्पर बंधुभावाचा आणि महाराष्ट्राच्या जडणघडणीतील योगदानाचा गौरव करतो.
          </p>
        </section>

        {/* ================= TAB 1: OVERVIEW / ALL ================= */}
        {(activeTab === 'all' || activeTab === 'koliwada') && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                परस्परसंवादी मॉडेल • INTERACTIVE VILLAGE
              </span>
              <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                कोळीवाडा दर्शन — समुद्राच्या कुशीतील गावसंस्कृती
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                खालील घटकांवर क्लिक करा आणि पारंपरिक कोळीवाड्याचे जीवन, साधने व संस्कृती समजून घ्या.
              </p>
            </div>

            {/* Clickable Node Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {KOLIWADA_NODES.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedKoliNode(node)}
                  style={{
                    background: selectedKoliNode.id === node.id ? '#7C1D05' : '#FFFFFF',
                    color: selectedKoliNode.id === node.id ? '#FFFFFF' : '#431407',
                    border: selectedKoliNode.id === node.id ? '2px solid #7C1D05' : '1.5px solid #FED7AA',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: selectedKoliNode.id === node.id ? '0 4px 12px rgba(124,29,5,0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{node.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{node.title.split('(')[0]}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85, lineHeight: 1.3 }}>{node.shortDesc}</span>
                </button>
              ))}
            </div>

            {/* Selected Node Detailed Showcase Card */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              padding: '26px',
              boxShadow: '0 6px 20px rgba(217,119,6,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2.5rem', background: '#FFF7ED', padding: '6px 12px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                  {selectedKoliNode.icon}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                    {selectedKoliNode.title}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#C2410C', fontWeight: 600 }}>
                    कोळी संस्कृतीचे अविभाज्य अंग
                  </span>
                </div>
              </div>

              <p style={{ color: '#431407', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {selectedKoliNode.fullDesc}
              </p>

              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7C1D05', textTransform: 'uppercase' }}>
                  महत्त्वाची साधने व घटक:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {selectedKoliNode.tools.map((t, idx) => (
                    <span key={idx} style={{ background: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: AGRI SAMAJ & SALT PANS ================= */}
        {(activeTab === 'all' || activeTab === 'agri') && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '30px',
            marginBottom: '40px',
            boxShadow: '0 4px 16px rgba(234,88,12,0.05)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                भूमी व संस्कृती • AGRI SAMAJ HERITAGE
              </span>
              <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                {AGRI_SAMAJ_DATA.title}
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.96rem', lineHeight: 1.6, marginTop: '8px' }}>
                {AGRI_SAMAJ_DATA.overview}
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {AGRI_SAMAJ_DATA.pillars.map((pillar, idx) => (
                <div key={idx} style={{
                  background: '#FFFDF9',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{pillar.icon}</span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#7C1D05', fontWeight: 800 }}>
                      {pillar.title}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#431407', lineHeight: 1.5 }}>
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Regions list */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>
                आगरी समाजाचे प्रमुख भौगोलिक केंद्र:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {AGRI_SAMAJ_DATA.regions.map((reg, idx) => (
                  <span key={idx} style={{ background: '#FFFFFF', color: '#7C1D05', border: '1px solid #FDBA74', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                    📍 {reg}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 3: SHIVAJI MAHARAJ, MARATHA NAVY & MAYNAK BHANDARI ================= */}
        {(activeTab === 'all' || activeTab === 'navy') && (
          <section style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '18px',
            padding: '30px',
            marginBottom: '40px',
            boxShadow: '0 8px 24px rgba(217,119,6,0.08)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>⚓ मराठा आरमार व सागरी संरक्षण</span>
                <span>•</span>
                <span>HISTORICAL MARITIME DEFENSE</span>
              </div>
              <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                {NAVY_HEROES_DATA.title}
              </h2>
              <p style={{ color: '#C2410C', fontSize: '1.1rem', fontWeight: 700, margin: '6px 0 0' }}>
                {NAVY_HEROES_DATA.subheading}
              </p>
              <p style={{ color: '#78350F', fontSize: '0.96rem', lineHeight: 1.6, marginTop: '8px' }}>
                {NAVY_HEROES_DATA.concept}
              </p>
            </div>

            {/* Maynak Bhandari Hero Card */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #C2410C',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(194,65,12,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1.5px solid #FED7AA', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'inline-block', background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
                    🟢 समकालीन ऐतिहासिक पुरावा
                  </div>
                  <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                    ⚔️ {NAVY_HEROES_DATA.maynakBhandari.name}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#C2410C', fontWeight: 600 }}>
                    {NAVY_HEROES_DATA.maynakBhandari.role}
                  </div>
                </div>

                <span style={{ background: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
                  {NAVY_HEROES_DATA.maynakBhandari.battle}
                </span>
              </div>

              <p style={{ color: '#431407', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '14px' }}>
                {NAVY_HEROES_DATA.maynakBhandari.desc}
              </p>

              <div style={{ background: '#FFFBEB', borderLeft: '4px solid #D97706', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: '#92400E' }}>
                <strong>प्राथमिक ऐतिहासिक संदर्भ:</strong> {NAVY_HEROES_DATA.maynakBhandari.sources}
              </div>
            </div>

            {/* Sea Forts Grid */}
            <div>
              <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '0 0 12px' }}>
                स्वराज्याचे प्रमुख जलदुर्ग व सागरी संरक्षण केंद्रे
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {NAVY_HEROES_DATA.seaForts.map((fort, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{fort.icon}</span>
                      <strong style={{ color: '#7C1D05', fontSize: '0.95rem' }}>{fort.name}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#78350F', lineHeight: 1.45 }}>
                      {fort.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 4: CUISINE (AGRI VS KOLI) ================= */}
        {(activeTab === 'all' || activeTab === 'food') && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                अस्सल चव • COASTAL GASTRONOMY
              </span>
              <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                आगरी व कोळी खाद्यसंस्कृती — झणझणीत मसाल्यांची मेजवानी
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                तांदळाची भाकरी, आगरी लाल मसाला, ताजी मासळी, सुकट आणि पारंपरिक खारवून वाळवण्याचे तंत्रज्ञान.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              {CUISINE_ITEMS.map((item, idx) => (
                <div key={idx} style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                      <span style={{ fontSize: '0.78rem', background: '#FFF7ED', color: '#C2410C', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, border: '1px solid #FED7AA' }}>
                        {item.community}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', color: '#7C1D05', fontWeight: 800, margin: '0 0 6px' }}>
                      {item.dishName}
                    </h4>

                    <p style={{ fontSize: '0.88rem', color: '#431407', lineHeight: 1.5, margin: '0 0 12px' }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{ background: '#FFFDF9', border: '1px dashed #FED7AA', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#9A3412', fontWeight: 600 }}>
                    💡 वैशिष्ट्य: {item.specialty}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= TAB 5: DIALECTS & VOCABULARY ================= */}
        {(activeTab === 'all' || activeTab === 'dialects') && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '40px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                भाषा व लहेजा • DIALECT SOUNDBOARD
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                आगरी व कोळी बोली — समुद्राचा हेल व मातीचा गोडवा
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                प्रमाण मराठी, आगरी बोली आणि कोळी भाषेतील दैनंदिन संवादांची समोरासमोर तुलना.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '12px', color: '#7C1D05', fontWeight: 800, fontSize: '0.9rem' }}>प्रमाण मराठी</th>
                    <th style={{ padding: '12px', color: '#C2410C', fontWeight: 800, fontSize: '0.9rem' }}>आगरी बोली (Agri)</th>
                    <th style={{ padding: '12px', color: '#0369A1', fontWeight: 800, fontSize: '0.9rem' }}>कोळी बोली (Koli)</th>
                    <th style={{ padding: '12px', color: '#4B5563', fontWeight: 800, fontSize: '0.9rem' }}>संदर्भ</th>
                  </tr>
                </thead>
                <tbody>
                  {DIALECT_SAMPLES.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #FED7AA', background: idx % 2 === 0 ? '#FFFFFF' : '#FFFDF9' }}>
                      <td style={{ padding: '12px', fontSize: '0.9rem', color: '#374151' }}>{row.standard}</td>
                      <td style={{ padding: '12px', fontSize: '0.92rem', color: '#C2410C', fontWeight: 700 }}>{row.agri}</td>
                      <td style={{ padding: '12px', fontSize: '0.92rem', color: '#0369A1', fontWeight: 700 }}>{row.koli}</td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: '#6B7280' }}>{row.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= TAB 6: NARALI POORNIMA & FESTIVALS ================= */}
        {(activeTab === 'all' || activeTab === 'festivals') && (
          <section style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🌕</span>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  सागरी महाउत्सव • NARALI POORNIMA
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '2px 0 0' }}>
                  नारळी पौर्णिमा — समुद्राला सुवर्ण नारळ अर्पण व मासेमारीचा शुभारंभ
                </h2>
              </div>
            </div>

            <p style={{ color: '#78350F', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '20px' }}>
              श्रावण शुक्ल पौर्णिमेला पावसाळ्यातील उधाणाचा, खवळलेला समुद्र शांत होतो. या दिवशी कोळी व आगरी बांधव पारंपरिक वेशभूषेत एकत्र येतात. 
              समुद्राला (वरुण देवाला) सोन्याचा किंवा चांदीचा नारळ अर्पण करून प्रार्थना केली जाते: <em>"हे दर्या राजा! आमच्या होड्यांना वादळापासून वाचव, आमच्या मासेमारीला भरभरून यश दे."</em>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <strong style={{ color: '#7C1D05', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>🛶 होड्यांची रंगरंगोटी व सजावट</strong>
                <p style={{ fontSize: '0.85rem', color: '#431407', margin: 0, lineHeight: 1.5 }}>
                  सर्व होड्यांना स्वच्छ धुवून नवीन रंग, भगव्या व रंगीबेरंगी पताका, फुलांचे हार लावून नववधूसारखे सजवले जाते.
                </p>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <strong style={{ color: '#7C1D05', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>🥥 गोड नारळी भात व नैवेद्य</strong>
                <p style={{ fontSize: '0.85rem', color: '#431407', margin: 0, lineHeight: 1.5 }}>
                  घरोघरी खवलेला ताजा नारळ आणि गूळ घालून सुगंधी नारळी भात बनवला जातो आणि परस्परांना वाटून सण साजरा होतो.
                </p>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <strong style={{ color: '#7C1D05', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>💃 पारंपारिक कोळी नृत्य व गीते</strong>
                <p style={{ fontSize: '0.85rem', color: '#431407', margin: 0, lineHeight: 1.5 }}>
                  महिला नऊवारी साडी आणि सोन्याच्या दागिन्यांमध्ये, तर पुरुष कानबाळी व रुमाल बांधून ढोल-ताशांच्या तालावर नाचतात.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 7: SACRED SHRINES (EKVIRA & DEITIES) ================= */}
        {(activeTab === 'all' || activeTab === 'sacred') && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '40px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                श्रद्धास्थाने • SACRED TEMPLES & DEITIES
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                आगरी-कोळी समाजाची कुलदैवते व तीर्थक्षेत्रे
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🚩</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.1rem', fontWeight: 800 }}>श्री एकवीरा देवी (कार्ला लेणी, लोणावळा)</h4>
                    <span style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 700 }}>आगरी-कोळी समाजाची सर्वोच्च कुलस्वामिनी</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  पांडवकालीन कार्ला बौद्ध लेण्यांच्या शेजारी वसलेले हे शक्तिपीठ समस्त आगरी, कोळी व सोनकोळी समाजाचे सर्वोच्च श्रद्धास्थान आहे. दरवर्षी चैत्र पौर्णिमेला लाखो भाविक देवीच्या दर्शनाला पालख्या घेऊन येतात.
                </p>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>☀️</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.1rem', fontWeight: 800 }}>जेजुरीचा खंडोबा (मल्हारी मार्तंड)</h4>
                    <span style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 700 }}>सोन्याची जेजुरी व यळकोट गजर</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  महाराष्ट्राचे कुलदैवत असलेल्या खंडोबारायावर आगरी-कोळी समाजाची असीम श्रद्धा आहे. लग्नानंतर कुलदैवताची तळी भरणे, जागरण-गोंधळ घालणे ही या समाजाची अनिवार्य प्रथा आहे.
                </p>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🛕</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.1rem', fontWeight: 800 }}>मुंबादेवी व शितलादेवी (मुंबई परिसर)</h4>
                    <span style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 700 }}>मुंबईची मूळ अधिष्ठात्री देवी</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#431407', lineHeight: 1.5, margin: 0 }}>
                  मुंबईचे नाव ज्या देवीवरून पडले ती ‘मुंबादेवी’ ही मूळ कोळी बांधवांची ग्रामदेवता होती. माहीमची शितलादेवी आणि उरणची हर्बादेवी या स्थानिक संरक्षिका मानल्या जातात.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 8: THEN VS NOW (URBAN TRANSITION) ================= */}
        {(activeTab === 'all' || activeTab === 'then_now') && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '40px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                समकालीन वास्तव • THEN VS NOW
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                पूर्वी विरुद्ध आज — शहरीकरणाच्या लाटांमध्ये अस्तित्व टिकवण्याचा लढा
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ color: '#9A3412', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌊</span> पूर्वीचा समृद्ध वारसा
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', color: '#431407', lineHeight: 1.55 }}>
                  <li>अखंड विस्तीर्ण समुद्रकिनारे आणि नैसर्गिक बंदरे.</li>
                  <li>खाडी परिसरात मुबलक खारफुटी, मासे आणि नैसर्गिक मिठागरे.</li>
                  <li>स्वराज्याच्या आरमारी उभारणीत मुख्य भूमिका.</li>
                  <li>संयुक्त कुटुंबे, पारंपरिक जाळी विणणे आणि स्वयंपूर्ण गावव्यवस्था.</li>
                </ul>
              </div>

              <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ color: '#374151', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏙️</span> आजची आव्हाने व संवर्धन
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.55 }}>
                  <li>मुंबई, ठाणे व नवी मुंबईच्या अवाढव्य शहरीकरणामुळे जमिनींचे अधिग्रहण.</li>
                  <li>सागरी प्रदूषण आणि मोठ्या ट्रॉलर्समुळे स्थानिक लहान मच्छीमारांचे नुकसान.</li>
                  <li>कोळीवाड्यांचे ऐतिहासिक सीमांकन आणि सीआरझेड (CRZ) हक्कांचे रक्षण.</li>
                  <li>नवीन पिढीचे उच्च शिक्षण, व्यवसाय आणि सांस्कृतिक वारशाचे डिजिटल जतन.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ================= BACK TO SHIVKAL FESTIVALS & CULTURE HUB ================= */}
        <section style={{
          background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px' }}>
              🚩 शिवकालीन उत्सव व पुरावे दालन
            </h3>
            <p style={{ fontSize: '0.95rem', opacity: 0.95, margin: 0, maxWidth: '750px' }}>
              १६७१ चा रायगड शिमगा, १६७४ गुढीपाडवा, छत्रपतींचा सुवर्ण राज्याभिषेक आणि शिवकालीन १३ सणांचे समकालीन पुरावे वाचण्यासाठी येथे भेट द्या.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/culture/shivkal-festivals"
              style={{
                background: '#F59E0B',
                color: '#7C1D05',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>शिवकालीन उत्सव पहा</span>
              <span>→</span>
            </Link>
            <Link
              to="/culture"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              संस्कृती मुख्य दालन
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}
