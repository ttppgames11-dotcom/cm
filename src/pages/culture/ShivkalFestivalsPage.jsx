import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// 4-Level Evidence Classification System
const EVIDENCE_LEVELS = {
  DOCUMENTED: {
    code: 'documented',
    label: 'समकालीन / प्राथमिक पुरावा',
    badge: '🟢 समकालीन पुरावा',
    color: '#15803D',
    bg: '#DCFCE7',
    border: '#86EFAC',
    icon: '🟢',
    desc: 'शिवकालीन समकालीन पत्रव्यवहार, अधिकृत आज्ञापत्रे, समकालीन बखरी (सभासद), जेधे शकावली अथवा परदेशी प्रतिनिधींच्या (हेन्री ऑक्झिंडेन) अधिकृत नोंदी.'
  },
  LATER_SOURCE: {
    code: 'later_source',
    label: 'विश्वासार्ह नंतरचा ऐतिहासिक स्रोत',
    badge: '🔵 नंतरचा स्रोत',
    color: '#0369A1',
    bg: '#E0F2FE',
    border: '#7DD3FC',
    icon: '🔵',
    desc: 'पेशवे दफ्तर, १८व्या-१९व्या शतकातील अधिकृत कागदपत्रे, बॉम्बे गॅझेटिअर व मान्यताप्राप्त इतिहासकारांचे (जदुनाथ सरकार, रियासतकार सरदेसाई) संकलन.'
  },
  TRADITIONAL: {
    code: 'traditional',
    label: 'लोकपरंपरा / मौखिक परंपरा',
    badge: '🟡 लोकपरंपरा',
    color: '#B45309',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: '🟡',
    desc: 'महाराष्ट्रातील ग्रामीण व लोकजीवनात पूर्वापार चालत आलेली रूढी, ऋतूचक्र व शेतीसंस्कृतीशी निगडित अलिखित परंपरा.'
  },
  MODERN_RECONSTRUCTION: {
    code: 'modern',
    label: 'आधुनिक पुनर्रचना / सार्वजनिक विस्तार',
    badge: '⚪ आधुनिक पुनर्रचना',
    color: '#4B5563',
    bg: '#F3F4F6',
    border: '#D1D5DB',
    icon: '⚪',
    desc: '१९व्या शतकाच्या उत्तरार्धात (उदा. १८९० चे दशक) किंवा २०व्या शतकात विकसित झालेले आधुनिक सार्वजनिक, सामाजिक व व्यवस्थापकीय स्वरूप.'
  }
};

// 13 Festivals with comprehensive historical dossiers
const SHIVKAL_FESTIVALS = [
  {
    id: 'gudhipadwa',
    title: 'गुढीपाडवा — चैत्र शुक्ल प्रतिपदा',
    subtitle: 'मराठी नववर्ष व शिवकालीन रायगडावरील संदर्भ',
    season: 'वसंत ऋतू (चैत्र)',
    evidenceLevel: 'DOCUMENTED',
    category: 'दरबारी व धार्मिक नववर्ष',
    heroIcon: '🚩',
    tags: ['नववर्ष', 'रायगड', 'चैत्र', 'दरबारी परंपरा'],
    documentedFacts: [
      'इ.स. १६७४ च्या चैत्र महिन्यात रायगडावर गुढीपाडवा साजरा झाल्याचा उल्लेख शिवकालीन पत्रसंग्रहाच्या संदर्भाने मिळतो.',
      'राजदरबारात धार्मिक व शुभ दिवसांना अनन्यसाधारण महत्त्व होते; कोणत्याही मोठ्या धोरणात्मक कामांची सुरुवात शुभ मुहूर्तावर केली जाई.',
      'चैत्र प्रतिपदेस पंचांग वाचन व ज्योतिषांकडून नववर्षाचे भविष्य ऐकण्याची मध्ययुगीन प्रथा होती.'
    ],
    traditionalReconstruction: [
      'घरोघरी व राजसदरेवर मंगलचिन्हे, तोरणे व दारात सडा-रांगोळी.',
      'तांब्या, कडुलिंबाची पाने, साखरेच्या गाठी आणि नवे जरीकाठ वस्त्र लावून पारंपरिक गुढी उभारणे.',
      'कडुलिंब व गुळाचा प्रसाद वाटप (आरोग्य व ऋतुबदलाचे पारंपरिक ज्ञान).',
      'वस्त्रदान, विद्वान ब्राह्मणांना दक्षिणा व दरबारी सेवकांना नवे पोशाख वाटप.',
      'दरबारात नौबत, नगारे व सनई-चौघड्यांचे वादन.'
    ],
    modernDistinction: 'आज आपण पाहतो तशा भव्य सार्वजनिक ‘हिंदू नववर्ष स्वागत यात्रा’ किंवा डीजे-ध्वनिप्रदूषणयुक्त मिरवणुका शिवकाळात नव्हत्या. तो उत्सव पवित्र, घरगुती आणि राजदरबारी शिस्तीत साजरा होई.',
    places: ['किल्ले रायगड', 'राजगड', 'पुणे कसबा']
  },
  {
    id: 'holi_shimga',
    title: 'होळी / शिमगा — शौर्य व लोककलांचा सोहळा',
    subtitle: 'इ.स. १६७१ रायगड नोंद: खेळ, सोंगे व युद्धकौशल्याचे प्रदर्शन',
    season: 'वसंत ऋतू (फाल्गुन पौर्णिमा)',
    evidenceLevel: 'DOCUMENTED',
    category: 'Festival + Martial Culture',
    heroIcon: '🔥',
    tags: ['१६७१ रायगड नोंद', 'शौर्यकला', 'दांडपट्टा', 'लोककला', 'शिमगा'],
    documentedFacts: [
      'इ.स. १६७१ मध्ये रायगडावर छत्रपती शिवाजी महाराजांनी शिमग्याचा उत्सव साजरा केल्याची थेट ऐतिहासिक नोंद उपलब्ध आहे.',
      'या नोंदीनुसार होळीच्या मैदानात केवळ रंग खेळले गेले नाहीत, तर विविध खेळ, सोंगे आणि प्रत्यक्ष युद्धकौशल्यांचे (Martial Arts) प्रदर्शन झाले.',
      'उत्सवात मावळ्यांनी दांडपट्टा फिरवणे, तलवारबाजी, मल्लविद्या व बाणफेकीचे साहसी प्रात्यक्षिक केले.'
    ],
    traditionalReconstruction: [
      'होळीचा माळ (रायगड): होळी पेटवून पुरणपोळीचा नैवेद्य अर्पण.',
      'लोककलावंत व मावळ्यांची सोंगे, वाघ्या-मुरळी, गोंधळी व पारंपरिक लोकनाट्य.',
      'हळगी, तुतारी, डफ व संबळाच्या तालावर वीररसात्मक खेळ.',
      'सैनिक व सामान्य रयतेचा एकत्र सहभाग; सरदारांचा सन्मान व बक्षीस वितरण.',
      'नैसर्गिक वनस्पती, पळसाची फुले व राखेपासून तयार केलेले सात्विक रंग.'
    ],
    modernDistinction: 'होळी म्हणजे आज केवळ पाण्याचे फुगे किंवा रासायनिक रंग उधळणे नव्हे; शिवकाळात हा सण रयतेचे शारीरिक बळ, लष्करी सज्जता आणि लोककलांचा गौरव करणारा जिवंत सामुदायिक सोहळा होता.',
    places: ['किल्ले रायगड (होळीचा माळ)', 'प्रतापगड', 'पन्हाळा']
  },
  {
    id: 'diwali',
    title: 'दिवाळी — दिव्यांचा व समृद्धीचा तेजोत्सव',
    subtitle: 'पणत्यांचा प्रकाश, लक्ष्मीपूजन व दुर्ग दीपोत्सव',
    season: 'शरद ऋतू (आश्विन-कार्तिक)',
    evidenceLevel: 'TRADITIONAL',
    category: 'सांस्कृतिक व आध्यात्मिक पुनर्रचना',
    heroIcon: '🪔',
    tags: ['दीपोत्सव', 'लक्ष्मीपूजन', 'अभ्यंगस्नान', 'दुर्ग दीपमाळा'],
    documentedFacts: [
      'दिवाळी हा महाराष्ट्रातील शतकानुशतके चालत आलेला प्राचीन हिंदू सण आहे.',
      'किल्ल्यांवरील राजवाडे व मंदिरांमध्ये दीपमाळांवर तेलाचे दिवे प्रज्वलित केले जात.',
      'विशिष्ट वर्षात रायगडावर कोणत्या दिवशी नेमका कोणता कार्यक्रम झाला याचा मिनिट-बाय-मिनिट समकालीन ताळेबंद नसला तरी दरबारी सण म्हणून दिवाळीचा मान मोठा होता.'
    ],
    traditionalReconstruction: [
      'मातीच्या पणत्या व तिळाच्या/करडईच्या तेलाचे सात्विक दिवे.',
      'पहाटेचे अभ्यंगस्नान, उटणे व सुगंधी तेलस्नान.',
      'लक्ष्मीपूजनाच्या दिवशी नाणी (होन, शिवराई), हिशोबाच्या वह्या व धान्याची पूजा.',
      'पारंपरिक फराळ: करंजी, लाडू, पोहे व गोडधोड वाटप.',
      'किल्ल्यांच्या बुरुजांवर व तटबंदीवर दिव्यांची आरास आणि नौबतीचे वादन.'
    ],
    modernDistinction: 'शिवकालीन दिवाळीत आधुनिक चायनीज विद्युत रोषणाई, मोठ्या आवाजाची रासायनिक आतषबाजी किंवा आधुनिक कमर्शियल शॉपिंग संस्कृती नव्हती; हा अंधारावर प्रकाशाच्या विजयाचा नितांत शांत, मांगलिक व घरगुती सण होता.',
    places: ['रायगड', 'राजगड', 'किल्ले शिवनेरी', 'सासवड']
  },
  {
    id: 'ganesh_chaturthi',
    title: 'गणेश चतुर्थी — घरगुती भक्ती ते सार्वजनिक विस्तार',
    subtitle: 'शिवकालीन पूजा परंपरा ↔ पेशवे काळ ↔ १८९० ची टिळक चळवळ',
    season: 'भाद्रपद शुक्ल चतुर्थी',
    evidenceLevel: 'DOCUMENTED',
    category: 'धार्मिक परंपरा व कालपट उत्क्रांती',
    heroIcon: '🐘',
    tags: ['गणेशपूजा', 'कसबा गणपती', 'टिळक १८९०', 'कालपट'],
    documentedFacts: [
      'गणेशपूजा महाराष्ट्रात शिवकाळाच्या अनेक शतके आधीपासून प्रचलित होती.',
      'पुण्यातील ग्रामदैवत श्री कसबा गणपतीची स्थापना व जिर्णोद्धार राष्ट्रमाता जिजाऊ माँसाहेब व बाल शिवाजी यांच्या काळाशी प्रत्यक्ष संबंधित आहे.',
      'शिवरायांच्या काळात गणेशोत्सव हा प्रामुख्याने घरगुती, देवघरातील व स्थानिक देवस्थानातील धार्मिक विधी स्वरूपात होता.',
      '⚠️ ऐतिहासिक तथ्य: आजचा १० दिवसांचा लाऊडस्पीकर व मंडपांचा "सार्वजनिक गणेशोत्सव" शिवरायांनी सुरू केला नाही; तो १८९३ मध्ये लोकमान्य टिळकांनी स्वातंत्र्यलढ्यात जनप्रबोधनासाठी सुरू केला.'
    ],
    traditionalReconstruction: [
      'भाद्रपद चतुर्थीस शाडूच्या मातीची सुबक मूर्ती किंवा देवघरातील तांदळाची पूजा.',
      'दूर्वा, जास्वंद व मोदकांचा पारंपरिक नैवेद्य अर्पण.',
      'कुटुंब, स्थानिक शेजारी व दरबारी व्यक्तींचे एकत्र दर्शन.',
      'मंत्रपठण, आरती व टाळ-मृदंगाच्या साथीने भक्तीगीते.'
    ],
    modernDistinction: 'शिवकाळ (घरगुती/देवस्थान पूजा) → पेशवे काळ (शनिवारवाडा दरबारी उत्सव) → १८९० चे दशक (टिळक प्रणित राष्ट्रीय सार्वजनिक व्यासपीठ). हा कालपट इतिहास समजण्यासाठी अत्यंत मोलाचा आहे.',
    places: ['कसबा गणपती (पुणे)', 'राजगड देवघर', 'रायगड']
  },
  {
    id: 'navratri',
    title: 'नवरात्र व भवानी उपासना — शक्तिपीठ भक्ती',
    subtitle: 'तुळजापूर कुलस्वामिनी, प्रतापगड भवानी व शस्त्र-शक्ती उपासना',
    season: 'आश्विन शुद्ध प्रतिपदा ते नवमी',
    evidenceLevel: 'DOCUMENTED',
    category: 'धार्मिक व आध्यात्मिक अधिष्ठान',
    heroIcon: '🛕',
    tags: ['तुळजाभवानी', 'प्रतापगड भवानी', 'घटस्थापना', 'शक्ती उपासना'],
    documentedFacts: [
      'छत्रपती शिवाजी महाराजांची कुलस्वामिनी श्री तुळजाभवानी देवी होती; अफझलखानाच्या वधानंतर त्यांनी प्रतापगडावर श्री भवानी मातेची स्थापना केली.',
      'प्रतापगड भवानी मंदिरातील नित्यपूजा, नवरात्र घटस्थापना व छबिना यासाठी महाराजांनी कायमस्वरूपी व्यवस्था लावून दिली होती.',
      'राज्याभिषेकापूर्वी तुळजापूर, प्रतापगड व इतर शक्तिपीठांना अभिषेक व देणग्या पाठवल्याच्या समकालीन नोंदी आहेत.'
    ],
    traditionalReconstruction: [
      'घटस्थापना: मातीच्या वेदीवर नऊ धान्यांची पेरणी व अखंड नंदादीप.',
      'शक्ती व जगदंबेचा गोंधळ, जोगवा आणि संबळाच्या तालावर देवीची आराधना.',
      'लष्करातील मावळे व सरदारांकडून भवानी मातेचे दर्शन व विजयासाठी प्रार्थना.',
      'सप्तशती पाठ, वेदघोष व देवीची विशेष अलंकार पूजा.'
    ],
    modernDistinction: 'आजच्या काळातील डीजेवर वाजणारा गरबा किंवा व्यावसायिक दांडिया उत्सव शिवकाळात नव्हता. नवरात्र हा आत्मिक बळ, शस्त्रपूजा व दुर्गेच्या आराधनेचा अत्यंत कडक व पवित्र विधी होता.',
    places: ['प्रतापगड भवानी मंदिर', 'तुळजापूर शक्तिपीठ', 'माहूर गड']
  },
  {
    id: 'dasara',
    title: 'दसरा (विजयादशमी) — शस्त्रपूजा व सीमोल्लंघन',
    subtitle: 'सैन्याची सज्जता, घोड्यांचे पूजन व स्वराज्य मोहिमांचा प्रारंभ',
    season: 'आश्विन शुक्ल दशमी',
    evidenceLevel: 'DOCUMENTED',
    category: 'Festival + Military History',
    heroIcon: '⚔️',
    tags: ['शस्त्रपूजा', 'सीमोल्लंघन', 'आपट्याची पाने', 'अश्वपूजा', 'मोहिमा'],
    documentedFacts: [
      'दसरा हा भारतीय व विशेषतः मराठा परंपरेत युद्धाचा, शस्त्रास्त्रांचा आणि विजयाचा सर्वोच्च दिवस मानला गेला.',
      'पावसाळा संपल्यानंतर सैन्याची छावणी हले आणि नव्या मुलुखावर मोहिमा काढण्यासाठी ‘सीमोल्लंघन’ केले जाई.',
      'शिवकालीन साधनांमध्ये शिवाजी महाराजांनी तलवारी, ढाली, धनुष्यबाण व तोफांची यथासांग पूजा केल्याचे स्पष्ट उल्लेख मिळतात.'
    ],
    traditionalReconstruction: [
      'शस्त्रपूजा (Shastra Puja): तोफखाना, भवानी तलवार, दांडपट्टे व बंदुकांची पूजा.',
      'अश्व व हत्ती पूजन: स्वराज्याच्या पागांमधील घोड्यांना स्नान घालून कुंकूम-फुलांनी सजवणे.',
      'सीमोल्लंघन विधी: राजा व सैन्याने गावाच्या/किल्ल्याच्या सीमेबाहेर जाऊन शमीच्या व आपट्याच्या वृक्षाची पूजा करणे.',
      'परस्परांना "सोने" (आपट्याची पाने) वाटून विजयाच्या शुभेच्छा देणे.',
      'सरदारांना मोहीमेचे विडे (तांबूल) देणे व नव्या सैनिकी मोहिमांचे प्रस्थान.'
    ],
    modernDistinction: 'हा केवळ गोडधोड खाण्याचा सण नव्हता, तर संपूर्ण स्वराज्याच्या लष्करी सज्जतेचे वार्षिक शक्तिप्रदर्शन होते.',
    places: ['रायगड राजसदर', 'राजगड', 'सिंहगड', 'सातारा']
  },
  {
    id: 'rajyabhishek',
    title: 'शिवराज्याभिषेक सोहळा — ६ जून १६७४',
    subtitle: 'स्वराज्याचा सार्वभौम सुवर्णमहोत्सव व तोफांची सलामी',
    season: 'ज्येष्ठ शुद्ध त्रयोदशी (६ जून १६७४)',
    evidenceLevel: 'DOCUMENTED',
    category: 'ऐतिहासिक सार्वभौम राज्यमहोत्सव',
    heroIcon: '👑',
    tags: ['६ जून १६७४', 'गागाभट्ट', 'सिंहासन', 'तोफांची सलामी', 'सप्तसिंधू'],
    documentedFacts: [
      'हा साधा धार्मिक कार्यक्रम नव्हता; तर ३०० वर्षांची गुलामगिरी मोडून स्वतंत्र मराठा सार्वभौमत्वाचा झालेला जागतिक जाहीरनामा होता.',
      'महाराष्ट्र विश्वकोश व समकालीन इंग्रज दूत हेन्री ऑक्झिंडेनच्या डायरीनुसार २९ मे रोजी उपनयन, सुवर्णतुला व विविध दानधर्म झाले.',
      '६ जून १६७४ रोजी पहाटे गागाभट्ट यांनी वेदोक्त मंत्रांच्या घोषात सप्तसिंधूंच्या पाण्याने शिवरायांवर अभिषेक केला.',
      'महाराज ३२ मणांच्या सुवर्णसिंहासनावर आरूढ झाले; ‘क्षत्रियकुलावतंस श्री छत्रपती’ ही पदवी धारण केली.',
      'स्वराज्यातील सर्व ३५०+ किल्ल्यांवर एकाच वेळी तोफांची सरबत्ती करून उत्सव साजरा करण्यात आला.'
    ],
    traditionalReconstruction: [
      'रायगडावर सुवर्ण होन व शिवराई नाण्यांचे वितरण.',
      'अष्टप्रधान मंडळाची अधिकृत नियुक्ती व वस्त्रे प्रदान.',
      'साखर वाटप, गोडधोड मेजवानी व बंदीवानांची मुक्ती.',
      'नगारे, शिंगे, कर्णे व तुताऱ्यांच्या गजरात छत्रपतींची भव्य मिरवणूक.'
    ],
    modernDistinction: 'आज आपण ‘शिवस्वराज्य दिन’ म्हणून हा दिवस साजरा करतो; १६७४ मध्ये तो प्रत्यक्ष स्वतंत्र राष्ट्राच्या स्थापनेचा सर्वोच्च दीक्षा सोहळा होता.',
    places: ['किल्ले रायगड (राजसदर व मेघडंबरी)', 'सर्व स्वराज्य दुर्ग']
  },
  {
    id: 'ashadhi_wari',
    title: 'आषाढी एकादशी व वारी — शिवकालीन भक्ती संस्कृती',
    subtitle: 'संत तुकाराम, वारकरी परंपरा व विठ्ठलभक्तीचा सामाजिक प्रभाव',
    season: 'आषाढ शुक्ल एकादशी',
    evidenceLevel: 'DOCUMENTED',
    category: 'वारकरी संप्रदाय व भक्ती चळवळ',
    heroIcon: '🌺',
    tags: ['पंढरपूर', 'संत तुकाराम', 'विठ्ठल', 'वारकरी', 'अभंग'],
    documentedFacts: [
      'पंढरपूरची वारी व विठ्ठलभक्ती ही शिवाजी महाराजांच्या जन्मापूर्वीपासून (ज्ञानोबा-तुकोबा परंपरा) महाराष्ट्रात अस्तित्वात होती.',
      'संत तुकाराम महाराज छत्रपती शिवाजी महाराजांचे समकालीन होते; शिवरायांनी संतांच्या कीर्तनाला उपस्थित राहिल्याचे उल्लेख सापडतात.',
      'वारकरी संप्रदायाने महाराष्ट्रातील जात-पात भेद बाजूला सारून सामाजिक एकात्मतेची मजबूत पार्श्वभूमी तयार केली होती.'
    ],
    traditionalReconstruction: [
      'गावोगावच्या दिंड्या टाळ-मृदंगाच्या गजरात ‘ज्ञानोबा माऊली तुकाराम’ गजर करत पायी पंढरीकडे रवाना.',
      'तुळशी वृंदावन डोक्यावर घेऊन चालणाऱ्या महिला व हातात भगवी पताका घेतलेले वारकरी.',
      'शिवकालीन खेड्यांमध्ये वारकऱ्यांच्या मुक्कामाची व्यवस्था, धान्यदान व अन्नछत्रे.',
      'चंद्रभागेत स्नान व विठ्ठल-रखुमाईचे भावपूर्ण दर्शन.'
    ],
    modernDistinction: 'आजच्या लाखो लोकांच्या आधुनिक पालखी व्यवस्थेचे रूप (हायवे, रुग्णवाहिका, पोलीस बंदोबस्त) नंतरच्या काळात (हैबतबाबांच्या प्रयत्नाने) विकसित झाले. शिवकाळात ही पूर्णतः स्थानिक व आंतरिक श्रद्धेवर आधारलेली भक्तीयात्रा होती.',
    places: ['पंढरपूर', 'देहू', 'आळंदी', 'मावळ खोरी']
  },
  {
    id: 'makarsankranti',
    title: 'मकरसंक्रांत — ऋतूचक्र व सौहार्द',
    subtitle: 'सूर्य संक्रांती, तीळ-गूळ वाटप व शेतीचा हंगाम',
    season: 'पौष महिना (जानेवारी)',
    evidenceLevel: 'TRADITIONAL',
    category: 'ऋतूचक्र व सामाजिक सौहार्द',
    heroIcon: '🌿',
    tags: ['तीळ-गूळ', 'संक्रांत', 'ऋतूचक्र', 'सौहार्द'],
    documentedFacts: [
      'सूर्य मकर राशीत प्रवेश करतो त्या खगोलीय घटनेवर आधारित हा सण मध्ययुगीन समाजातही प्रचलित होता.',
      'शिवराय स्वतः हा सण कसा साजरा करत याचा स्वतंत्र दस्तऐवजी तपशील उपलब्ध नसल्याने याला लोकपरंपरेच्या चौकटीत पाहणे ऐतिहासिकदृष्ट्या योग्य ठरते.'
    ],
    traditionalReconstruction: [
      'थंडीच्या मोसमात शरीराला उष्णता देणारे तीळ व गूळ एकत्र करून लाडू बनवणे.',
      '‘तीळगूळ घ्या, गोड गोड बोला’ या परंपरेतून गावकऱ्यांमधील वाद मिटवून सलोखा निर्माण करणे.',
      'महिलांचे हळदी-कुंकू व सुगड्यांचे वाण (हरभरे, बोरं, गाजर, ऊस) वाटप.',
      'शेतात रब्बी पिकांची पाहणी व जनावरांची काळजी.'
    ],
    modernDistinction: 'आजच्या काळातील नायलॉन मांजा व पतंगबाजीची चढाओढ शिवकाळात नव्हती; संक्रांत हा शुद्ध हवामान, शेती आणि सामाजिक स्नेह वाढवणारा सण होता.',
    places: ['महाराष्ट्रातील ग्रामीण गावे', 'किल्ले परिसर']
  },
  {
    id: 'pola',
    title: 'पोळा — शेतकरी व बैलांप्रति कृतज्ञता',
    subtitle: 'कृषी अर्थव्यवस्था, गोठा व स्वराज्याची अन्नधान्य रसद',
    season: 'श्रावण / भाद्रपद अमावास्या',
    evidenceLevel: 'TRADITIONAL',
    category: 'Festival + Agrarian Economy',
    heroIcon: '🌾',
    tags: ['बैलपोळा', 'शेतकरी', 'पशुधन', 'स्वराज्य रसद', 'गावव्यवस्था'],
    documentedFacts: [
      'शिवाजी महाराजांचे स्वराज्य केवळ किल्ले व सैन्यावर नाही, तर ग्रामीण शेतकरी व कृषी महसुलावर उभे होते.',
      'बैलांना शेतीतील मुख्य सहकारी मानले जाई; सैन्यासाठी धान्य पुरवठा करणारी बलुतेदारी व्यवस्था शेतीवर आधारित होती.',
      'शिवरायांनी आपल्या आज्ञापत्रात "रयतेच्या भाजीच्या देठालाही हात लावू नये" अशी सक्त ताकीद दिली होती, जी शेतकऱ्यांप्रती त्यांचा आदर दर्शवते.'
    ],
    traditionalReconstruction: [
      'त्या दिवशी बैलांना नांगरापासून पूर्ण विश्रांती दिली जाई.',
      'बैलांना नदी/तलावावर नेऊन स्वच्छ धुणे, शिंगांना हिंगूळ व बाशिंग लावणे.',
      'पाठीवर रंगीबेरंगी झूल टाकून गळ्यात घुंगरांची माळ बांधणे.',
      'पुरणपोळीचा घास भरवून बैलांची गावातील चौकात वाजतगाजत मिरवणूक काढणे.',
      'शेतकरी कुटुंबाकडून बैलांची आरती व कृतज्ञता व्यक्त करणे.'
    ],
    modernDistinction: 'आज ट्रॅक्टरमुळे बैलांचे शेतीतील प्रमाण कमी झाले आहे; पण शिवकाळात बैल हाच रयतेचा खरा संपत्तीचा आधार होता.',
    places: ['देश (पश्चिम महाराष्ट्र)', 'मराठवाडा', 'विदर्भ', 'खानदेश']
  },
  {
    id: 'narali_poornima',
    title: 'नारळी पौर्णिमा — समुद्रपूजन व आरमार सज्जता',
    subtitle: 'कोकण किनारा, कोळी समाज व मराठा आरमाराचा मोसम प्रारंभ',
    season: 'श्रावण शुक्ल पौर्णिमा',
    evidenceLevel: 'DOCUMENTED',
    category: 'Festival + Maritime Heritage',
    heroIcon: '🌊',
    tags: ['समुद्रपूजन', 'कोळी समाज', 'आरमार', 'सिंधुदुर्ग', 'सागरी संरक्षण'],
    documentedFacts: [
      'कोकण किनारपट्टीवर पावसाळ्यातील खवळलेला समुद्र शांत होण्याची ही खूण मानली जाई.',
      'शिवाजी महाराजांनी "ज्यांचे आरमार, त्याचा समुद्र" हे धोरण आखून सिंधुदुर्ग, विजयदुर्ग, पद्मदुर्ग, खांदेरी-अंदेरी या जलदुर्गांची निर्मिती केली.',
      'नारळी पौर्णिमेनंतर समुद्र शांत झाल्यावर मराठा आरमारी जहाजे (गुराब, गलबते, पाल) नव्या मोहिमांसाठी सज्ज होत.'
    ],
    traditionalReconstruction: [
      'कोळी बांधवांकडून सागराला सोन्याचा/चांदीचा अथवा खरा नारळ अर्पण करून प्रार्थना.',
      'होड्यांना रंगरंगोटी, नव्या पताका व शिडे लावून सज्ज करणे.',
      'सागरी मासेमारीच्या नव्या मोसमाची सुरुवात.',
      'पारंपरिक नारळी भाताचा नैवेद्य व कोळी बांधवांचे लोकनृत्य.'
    ],
    modernDistinction: 'केवळ सण म्हणून नव्हे, तर कोकणच्या सागरी संरक्षणाचा व आरमारी हालचालींचा मोसम या सणापासून सुरू होत असे.',
    places: ['सिंधुदुर्ग जलदुर्ग', 'विजयदुर्ग', 'कुलाबा किल्ला', 'वर्सोवा/माहिम कोळीवाडा']
  },
  {
    id: 'mahashivratri',
    title: 'महाशिवरात्री — शैव भक्ती व रायगड जगदीश्वर',
    subtitle: 'शिव मंदिरे, उपवास, जागरण व दुर्ग शैव परंपरा',
    season: 'माघ वद्य त्रयोदशी/चतुर्दशी',
    evidenceLevel: 'DOCUMENTED',
    category: 'शैव भक्ती व मंदिर स्थापत्य',
    heroIcon: '🕉️',
    tags: ['जगदीश्वर मंदिर', 'महादेव', 'शैव उपासना', 'रायगड'],
    documentedFacts: [
      'छत्रपती शिवाजी महाराज हे स्वतः शिवभक्त होते; त्यांच्या मुद्रांवर व नाण्यांवर शंकराचे स्मरण आहे.',
      'राजधानी रायगडावर छत्रपतींनी भव्य श्री जगदीश्वर मंदिराची उभारणी केली; मंदिराच्या पायरीवर "सेवेचे ठायी तत्पर हिरोजी इंदुलकर" असा शिलालेख कोरलेला आहे.',
      'महाशिवरात्रीला रायगड, शिंगणापूर, त्र्यंबकेश्वर व शिखर शिंगणापूर येथे विशेष पूजेची परंपरा होती.'
    ],
    traditionalReconstruction: [
      'शिवलिंगावर दूध, गंगाजल, बेलपत्र व धोत्र्याची फुले वाहणे.',
      'अखंड महामृत्युंजय जप व रुद्राभिषेक विधी.',
      'दिवसभर कडक उपवास व रात्री शिव मंदिरात जागरण व भजन-कीर्तन.',
      'रयतेसाठी साबुदाणा, वरीचे तांदूळ व रताळे यांचा फराळ.'
    ],
    modernDistinction: 'महाशिवरात्र हा आध्यात्मिक एकाग्रतेचा सण होता, ज्याने शिवरायांना न्यायाने व निग्रहाने स्वराज्य चालवण्याची नैतिक ताकद दिली.',
    places: ['जगदीश्वर मंदिर (रायगड)', 'शिखर शिंगणापूर', 'त्र्यंबकेश्वर']
  },
  {
    id: 'forts_festivals_matrix',
    title: 'उत्सव आणि किल्ले — दुर्गसंस्कृतीचा संगम',
    subtitle: 'रायगड, प्रतापगड, सज्जनगड व सिंधुदुर्ग येथील सण-सोहळे',
    season: 'वर्षभर (ऋतूनुसार)',
    evidenceLevel: 'DOCUMENTED',
    category: 'किल्ले व उत्सव सहसंबंध',
    heroIcon: '🏰',
    tags: ['रायगड', 'प्रतापगड', 'सज्जनगड', 'सिंधुदुर्ग', 'दुर्गसंस्कृती'],
    documentedFacts: [
      'शिवकालीन दुर्ग हे केवळ लष्करी छावण्या नव्हत्या; ते स्थानिक संस्कृती, शासन आणि धार्मिक सोहळ्यांचे जिवंत केंद्र होते.',
      'रायगड: गुढीपाडवा, १६७१ शिमगा, राज्याभिषेक सोहळा आणि जगदीश्वर महाशिवरात्र.',
      'प्रतापगड: तुळजाभवानी नवरात्रोत्सव, घटस्थापना व दसरा शस्त्रपूजा.',
      'सज्जनगड: समर्थ रामदास स्वामींचा मठ, रामनवमी उत्सव व दासबोध निरूपण.',
      'सिंधुदुर्ग: नारळी पौर्णिमा, समुद्रपूजन व आरमारी सज्जता.'
    ],
    traditionalReconstruction: [
      'किल्ल्यांच्या महाद्वारांवर तोरणे व जरीपटका फडकवणे.',
      'नगारखान्यातून चौघडे वादन व बुरुजांवरून तोफांची सलामी.',
      'गडावरील मावळे, हवालदार, कारभारी व स्थानिक रयतेचे एकत्र भोजन.'
    ],
    modernDistinction: 'आज किल्ले केवळ ट्रेकिंगची पर्यटन स्थळे वाटतात; शिवकाळात ते महाराष्ट्राच्या अस्मितेचे, सणांचे व स्वराज्याच्या श्वासाचे केंद्र होते.',
    places: ['रायगड', 'प्रतापगड', 'सज्जनगड', 'सिंधुदुर्ग']
  }
];

// Comparative "Then vs Now" Scenarios
const COMPARATIVE_SCENARIOS = [
  {
    id: 'ganesh',
    title: 'गणेशोत्सव — शिवकाळ विरुद्ध आज',
    festivalName: 'श्री गणेश चतुर्थी',
    shivkalTime: '१६७० चे दशक (शिवकाळ)',
    modernTime: 'आजचा काळ (२०२६)',
    shivkalIcon: '🛕',
    modernIcon: '🎪',
    caution: '⚠️ Historical Caution: आजचा आधुनिक सार्वजनिक १०-दिवसीय गणेशोत्सव आणि शिवकालीन गणेशपूजा यांना एकच स्वरूप समजू नये. लोकमान्य टिळकांनी १८९३ मध्ये याला सार्वजनिक चळवळीचे रूप दिले.',
    comparison: [
      { aspect: 'स्वरूप', shivkal: 'घरगुती, देवघर, व स्थानिक कसबा मंदिरातील धार्मिक विधी.', modern: 'हजारो सार्वजनिक गणेश मंडळे, भव्य देखावे, १० दिवस अखंड गर्दी.' },
      { aspect: 'उद्देश', shivkal: 'कुटुंब व समाजाची सात्विक देवपूजा आणि आशिर्वाद प्राप्ती.', modern: 'सामाजिक उत्सव, सांस्कृतिक स्पर्धा, प्रबोधन व मनोरंजन.' },
      { aspect: 'संगीत/वाद्ये', shivkal: 'मृदंग, टाळ, संबळ, तुतारी व शास्त्रीय आरत्या.', modern: 'डीजे, लेझर शो, ढोल-ताशा पथके व लाऊडस्पीकर्स.' },
      { aspect: 'मूर्ती', shivkal: 'शाडूची माती अथवा देवघरातील धातूची मूर्ती (छोटी व पर्यावरणपूरक).', modern: '१० ते २५ फूट उंच प्लास्टर ऑफ पॅरिस (POP) व फायबरच्या भव्य मूर्ती.' }
    ]
  },
  {
    id: 'shimga',
    title: 'होळी / शिमगा — शौर्यकला विरुद्ध आज',
    festivalName: 'होळी / शिमगा',
    shivkalTime: '१६७१ रायगड नोंद (शिवकाळ)',
    modernTime: 'आजचा काळ (२०२६)',
    caution: '⚠️ Historical Fact: १६७१ च्या रायगड नोंदीनुसार शिमग्यामध्ये दांडपट्टा, तलवारबाजी, मल्लविद्या व सोंगे अशा युद्धकौशल्यांचे (Martial Arts) सादरीकरण झाले होते.',
    comparison: [
      { aspect: 'स्वरूप', shivkal: 'शौर्यप्रदर्शन, मैदानी खेळ, युद्धकला व लोककलेचा मेळ.', modern: 'प्रामुख्याने रंगपंचमी, रंगांची उधळण व कौटुंबिक पार्टी.' },
      { aspect: 'खेळ', shivkal: 'दांडपट्टा फिरवणे, तलवारबाजी, कुस्ती, बाणफेक प्रात्यक्षिके.', modern: 'पाण्याचे फुगे, पिचकाऱ्या व गाण्यांवर नाचणे.' },
      { aspect: 'रंग', shivkal: 'पळसाची फुले, हळद, वनस्पती व होळीची पवित्र राख.', modern: 'रासायनिक, गुलाल व कृत्रिम वॉटर कलर्स.' },
      { aspect: 'वातावरण', shivkal: 'स्वाभिमानी, वीररसाने भरलेले व मावळ्यांच्या पराक्रमाला दाद देणारे.', modern: 'आनंदोत्सव, पार्टी व मनोरंजनात्मक जल्लोष.' }
    ]
  },
  {
    id: 'diwali_comp',
    title: 'दिवाळी — सात्विक दीपमाळा विरुद्ध आज',
    festivalName: 'दीपावली',
    shivkalTime: '१७वे शतक (शिवकाळ)',
    modernTime: 'आजचा काळ (२०२६)',
    caution: '⚠️ Historical Reality: शिवकालीन महाराष्ट्रात तेलाच्या मातीच्या पणत्या, दुर्ग दीपमाळा व लक्ष्मीपूजन हे मुख्य होते; आजची विद्युत रोषणाई व फटाके तेव्हा नव्हते.',
    comparison: [
      { aspect: 'प्रकाश', shivkal: 'मातीच्या पणत्या, तीळ/करडई तेलाचे दिवे व दगडी दीपमाळा.', modern: 'एलईडी लाईट्स, चायनीज तोरणे, विद्युत रोषणाई.' },
      { aspect: 'ध्वनी/आतषबाजी', shivkal: 'तोफांची मर्यादित सलामी, नौबत व सनई-चौघडे.', modern: 'मोठ्या आवाजाचे फटाके, शोभेची दारूकाम व स्कायशॉट्स.' },
      { aspect: 'खरेदी/बाजार', shivkal: 'स्थानिक विणकरांची साधी वस्त्रे, गूळ-धान्याची देवघेव.', modern: 'ऑनलाइन ई-कॉमर्स शॉपिंग, मॉल, गॅझेट्स व कपडे.' }
    ]
  },
  {
    id: 'dasara_comp',
    title: 'दसरा — लष्करी सीमोल्लंघन विरुद्ध आज',
    festivalName: 'विजयादशमी / दसरा',
    shivkalTime: 'शिवकाळ (१६३०-१६८०)',
    modernTime: 'आजचा काळ (२०२६)',
    caution: '⚠️ Historical Context: दसरा हा मराठा साम्राज्यासाठी वर्षातील सर्वात मोठा लष्करी दिवस होता, कारण या दिवशी संपूर्ण सैन्याची सज्जता तपासून मोहिमा सुरू केल्या जात.',
    comparison: [
      { aspect: 'शस्त्रपूजा', shivkal: 'तोफा, भवानी तलवार, खजिना, चिलखत व घोड्यांचे थेट पूजन.', modern: 'घरातील लहान चाकू/कात्री किंवा वही-पुस्तकांची प्रतिकात्मक पूजा.' },
      { aspect: 'सीमोल्लंघन', shivkal: 'सैन्यासह राज्याची सीमा ओलांडून शत्रूवर नव्या मोहिमांचे प्रस्थान.', modern: 'गाव/शहराच्या सीमेवर प्रतिकात्मक जाऊन आपट्याची पाने वाटणे.' },
      { aspect: 'महत्त्व', shivkal: 'स्वराज्य विस्तार व सैनिकी पराक्रमाचा प्रत्यक्ष शुभारंभ.', modern: 'सद्भावना, पाटीपूजन व कौटुंबिक स्नेहमेळावा.' }
    ]
  }
];

export default function ShivkalFestivalsPage() {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [activeScenarioId, setActiveScenarioId] = useState('ganesh');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFestivalModal, setSelectedFestivalModal] = useState(null);

  // Filter festivals based on category / evidence level / search
  const filteredFestivals = SHIVKAL_FESTIVALS.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'DOCUMENTED') return f.evidenceLevel === 'DOCUMENTED';
    if (selectedFilter === 'LATER_SOURCE') return f.evidenceLevel === 'LATER_SOURCE';
    if (selectedFilter === 'TRADITIONAL') return f.evidenceLevel === 'TRADITIONAL';
    if (selectedFilter === 'MODERN') return f.evidenceLevel === 'MODERN_RECONSTRUCTION';
    return true;
  });

  const activeScenario = COMPARATIVE_SCENARIOS.find(s => s.id === activeScenarioId) || COMPARATIVE_SCENARIOS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9', color: '#431407' }}>
      
      {/* ================= HERO HEADER ================= */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 50%, #EA580C 100%)',
        color: '#FFFFFF',
        padding: '50px 20px 40px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '16px', opacity: 0.9 }}>
            <Link to="/" style={{ color: '#FDE68A', textDecoration: 'none' }}>मुख्यपृष्ठ</Link>
            <span>/</span>
            <Link to="/culture" style={{ color: '#FDE68A', textDecoration: 'none' }}>संस्कृती व वारसा</Link>
            <span>/</span>
            <span>शिवकालीन उत्सव व पुरावे</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <span>🏰 शिवकालीन ऐतिहासिक संशोधन</span>
            <span>•</span>
            <span>इ.स. १६३० ते १६८० कालखंड</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            शिवकालीन उत्सव — पुरावे, परंपरा व ऐतिहासिक सत्य
          </h1>
          
          <p style={{ fontSize: '1.15rem', maxWidth: '900px', opacity: 0.95, lineHeight: 1.6, marginBottom: '24px' }}>
            आज आपण जे उत्सव मोठ्या सार्वजनिक स्वरूपात पाहतो, ते सर्व छत्रपती शिवाजी महाराजांच्या काळात अगदी त्याच पद्धतीने होत नव्हते. 
            समकालीन ऐतिहासिक संदर्भ, नंतरचे पुरावे, लोकपरंपरा व आधुनिक सार्वजनिक स्वरूप यांमधील फरक अचूकपणे समजून घेणे ऐतिहासिक सत्यतेसाठी आवश्यक आहे.
          </p>

          {/* Quick Stats / Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDE68A' }}>१३ सण व प्रसंग</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>दस्तऐवजी पुरावे व सविस्तर पुनर्रचना</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#86EFAC' }}>४-स्तरीय पुरावे प्रणाली</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>🟢 समकालीन ते ⚪ आधुनिक वर्गवारी</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDE68A' }}>१६७१ रायगड शिमगा</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>दांडपट्टा, कुस्ती व शौर्यकलांचा थेट संदर्भ</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDE68A' }}>६ जून १६७४</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>शिवराज्याभिषेक सार्वभौम महामहोत्सव</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTAINER ================= */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* ================= 4-LEVEL EVIDENCE EXPLANATION BANNER ================= */}
        <section style={{
          background: '#FFFFFF',
          border: '2px solid #FED7AA',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '36px',
          boxShadow: '0 4px 14px rgba(234,88,12,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                ऐतिहासिक पद्धतशास्त्र • 4-LEVEL EVIDENCE SYSTEM
              </span>
              <h2 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                सत्यनिष्ठ इतिहास मांडणीसाठी पुराव्यांची ४-स्तरीय चौकट
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', background: '#FFF7ED', color: '#C2410C', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, border: '1px solid #FED7AA' }}>
              सप्रमाण व पूर्वग्रहमुक्त मांडणी
            </span>
          </div>

          <p style={{ color: '#78350F', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
            इतिहास म्हणजे केवळ आख्यायिका किंवा अंधश्रद्धा नव्हे. शिवकालीन कोणत्याही उत्सवाचा अभ्यास करताना उपलब्ध साधनांची विश्वासार्हता तपासणे अनिवार्य आहे. Connect Maratha खालील ४ स्तरांवर प्रत्येक सणाची वर्गवारी करते:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {Object.values(EVIDENCE_LEVELS).map(lvl => (
              <div key={lvl.code} style={{
                background: lvl.bg,
                border: `1.5px solid ${lvl.border}`,
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{lvl.icon}</span>
                  <span style={{ fontWeight: 800, color: lvl.color, fontSize: '0.95rem' }}>{lvl.label}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                  {lvl.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= INTERACTIVE TOOL: "त्या काळात आजचा सण कसा दिसला असता?" ================= */}
        <section style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
          border: '2px solid #F59E0B',
          borderRadius: '18px',
          padding: '28px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(217,119,6,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>⚡ परस्परसंवादी तुलना साधन</span>
                <span>•</span>
                <span>RECONSTRUCTION ENGINE</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                “त्या काळात आजचा सण कसा दिसला असता?”
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', marginTop: '6px' }}>
                सण निवडा आणि १६७० चे शिवकालीन स्वरूप व आजचे आधुनिक रूप यांची समोरासमोर ऐतिहासिक तुलना अनुभवा.
              </p>
            </div>

            {/* Scenario Selector Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COMPARATIVE_SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioId(sc.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    border: activeScenarioId === sc.id ? '2px solid #7C1D05' : '1px solid #D97706',
                    background: activeScenarioId === sc.id ? '#C2410C' : '#FFFFFF',
                    color: activeScenarioId === sc.id ? '#FFFFFF' : '#92400E',
                    boxShadow: activeScenarioId === sc.id ? '0 4px 12px rgba(194,65,12,0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {sc.title.split('—')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Active Comparative Scenario Display */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1.5px solid #FED7AA',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #FED7AA', paddingBottom: '14px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', margin: 0, fontWeight: 800 }}>
                {activeScenario.title}
              </h3>
              <span style={{ fontSize: '0.85rem', background: '#FFF7ED', color: '#C2410C', padding: '4px 12px', borderRadius: '6px', fontWeight: 700 }}>
                उत्सव: {activeScenario.festivalName}
              </span>
            </div>

            {/* Caution Banner */}
            <div style={{
              background: '#FFFBEB',
              borderLeft: '4px solid #D97706',
              padding: '12px 16px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '20px',
              fontSize: '0.92rem',
              color: '#92400E',
              lineHeight: 1.5,
              fontWeight: 600
            }}>
              {activeScenario.caution}
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              
              {/* Shivkal Column */}
              <div style={{
                background: '#FFF7ED',
                border: '1.5px solid #FDBA74',
                borderRadius: '12px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px dashed #FDBA74', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🏰</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#9A3412', fontSize: '1.05rem' }}>{activeScenario.shivkalTime}</div>
                    <div style={{ fontSize: '0.78rem', color: '#C2410C' }}>राजदरबार, किल्ले व स्थानिक गावकुस</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeScenario.comparison.map((item, idx) => (
                    <div key={idx} style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>
                        {item.aspect}
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#431407', lineHeight: 1.45 }}>
                        {item.shivkal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modern Column */}
              <div style={{
                background: '#F9FAFB',
                border: '1.5px solid #E5E7EB',
                borderRadius: '12px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px dashed #D1D5DB', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🏙️</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#374151', fontSize: '1.05rem' }}>{activeScenario.modernTime}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>आधुनिक शहरे, मंडळे व डिजिटल समाज</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeScenario.comparison.map((item, idx) => (
                    <div key={idx} style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase' }}>
                        {item.aspect}
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#374151', lineHeight: 1.45 }}>
                        {item.modern}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= 13 FESTIVALS DIRECTORY & FILTER ================= */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                विभाग २ • सविस्तर उत्सव नोंदवही (१३ सण)
              </span>
              <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                शिवकालीन १३ सण, उत्सव व विधी
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                प्रत्येक उत्सवाचे समकालीन दस्तऐवज, संभाव्य पारंपरिक स्वरूप, किल्ले संदर्भ व आधुनिक फरक तपासा.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="सण, किल्ला किंवा पुरावा शोधा..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #FED7AA',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FFFFFF'
                }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => setSelectedFilter('ALL')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedFilter === 'ALL' ? '2px solid #7C1D05' : '1px solid #E5E7EB',
                background: selectedFilter === 'ALL' ? '#7C1D05' : '#FFFFFF',
                color: selectedFilter === 'ALL' ? '#FFFFFF' : '#431407'
              }}
            >
              सर्व १३ उत्सव ({SHIVKAL_FESTIVALS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('DOCUMENTED')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedFilter === 'DOCUMENTED' ? '2px solid #15803D' : '1px solid #BBF7D0',
                background: selectedFilter === 'DOCUMENTED' ? '#15803D' : '#DCFCE7',
                color: selectedFilter === 'DOCUMENTED' ? '#FFFFFF' : '#15803D'
              }}
            >
              🟢 समकालीन पुरावा (Documented)
            </button>
            <button
              onClick={() => setSelectedFilter('TRADITIONAL')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedFilter === 'TRADITIONAL' ? '2px solid #B45309' : '1px solid #FDE68A',
                background: selectedFilter === 'TRADITIONAL' ? '#B45309' : '#FEF3C7',
                color: selectedFilter === 'TRADITIONAL' ? '#FFFFFF' : '#92400E'
              }}
            >
              🟡 पारंपरिक पुनर्रचना (Traditional)
            </button>
          </div>
        </div>

        {/* Festivals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {filteredFestivals.map(festival => {
            const ev = EVIDENCE_LEVELS[festival.evidenceLevel] || EVIDENCE_LEVELS.TRADITIONAL;
            return (
              <div
                key={festival.id}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '16px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(234,88,12,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Top Bar: Icon, Category & Evidence Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '2rem', background: '#FFF7ED', padding: '6px 10px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                        {festival.heroIcon}
                      </span>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {festival.category}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          ऋतू: {festival.season}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      background: ev.bg,
                      color: ev.color,
                      border: `1px solid ${ev.border}`,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      whiteSpace: 'nowrap'
                    }}>
                      {ev.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 style={{ fontSize: '1.25rem', color: '#7C1D05', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.3 }}>
                    {festival.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#78350F', margin: '0 0 16px', lineHeight: 1.45, fontWeight: 500 }}>
                    {festival.subtitle}
                  </p>

                  {/* Documented Facts Excerpt */}
                  <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', marginBottom: '6px' }}>
                      📜 ऐतिहासिक संदर्भ व पुरावे:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: '#431407', lineHeight: 1.5 }}>
                      {festival.documentedFacts.slice(0, 2).map((fact, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{fact}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Places Tagging */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {festival.places.map((place, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', background: '#FFF7ED', color: '#9A3412', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                        🏰 {place}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedFestivalModal(festival)}
                  style={{
                    width: '100%',
                    background: '#C2410C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(194,65,12,0.2)'
                  }}
                >
                  <span>सविस्तर पुरावे व पुनर्रचना वाचा</span>
                  <span>→</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= SHIVKAL TIMELINE (1630 - 1680) ================= */}
        <section style={{
          background: '#FFFFFF',
          border: '2px solid #FED7AA',
          borderRadius: '18px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 4px 16px rgba(234,88,12,0.06)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
              कालपट • CHRONOLOGICAL FESTIVAL TIMELINE
            </span>
            <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
              शिवकालीन उत्सव कालपट (इ.स. १६३० ते १६८०)
            </h2>
            <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
              स्वराज्य विस्तार, किल्ले, युद्धे व उत्सव यांच्या ऐतिहासिक नोंदींचा कालक्रमानुसार मागोवा.
            </p>
          </div>

          <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '3px solid #F59E0B' }}>
            
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-35px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#7C1D05', border: '3px solid #FFFDF9' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7C1D05' }}>इ.स. १६३० — छत्रपती शिवाजी महाराजांचा जन्म (शिवनेरी)</div>
              <p style={{ fontSize: '0.88rem', color: '#431407', margin: '4px 0 0', lineHeight: 1.5 }}>
                जिजाऊ मॉंसाहेब व शहाजीराजे भोसले यांच्या पोटी जन्म; बालवयात पारंपरिक धार्मिक व सैनिकी संस्कार.
              </p>
            </div>

            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-35px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#C2410C', border: '3px solid #FFFDF9' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#C2410C' }}>इ.स. १६४०–१६५० चे दशक — रोहिडेश्वरावर स्वराज्य शपथ व कसबा गणपती प्रतिष्ठापना</div>
              <p style={{ fontSize: '0.88rem', color: '#431407', margin: '4px 0 0', lineHeight: 1.5 }}>
                पुण्यात कसबा गणपती मंदिराचा जिर्णोद्धार; स्थानिक ग्रामदेवता व विठ्ठलभक्तीचा सामाजिक प्रभाव; मावळ खोऱ्यातील सलोखा.
              </p>
            </div>

            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-35px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#D97706', border: '3px solid #FFFDF9' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D97706' }}>इ.स. १६६० चे दशक — किल्ले, आरमार, प्रतापगड भवानी मंदिर व दसरा सज्जता</div>
              <p style={{ fontSize: '0.88rem', color: '#431407', margin: '4px 0 0', lineHeight: 1.5 }}>
                अफझलखान वधानंतर प्रतापगडावर श्री भवानी देवीची स्थापना; सिंधुदुर्ग व आरमारी बंदरांची उभारणी; नारळी पौर्णिमा व दसरा शस्त्रपूजेचे महत्त्व वाढले.
              </p>
            </div>

            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-35px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#15803D', border: '3px solid #FFFDF9' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803D' }}>इ.स. १६७१ — रायगडावर शिमग्याची (होळी) समकालीन नोंद</div>
              <p style={{ fontSize: '0.88rem', color: '#431407', margin: '4px 0 0', lineHeight: 1.5 }}>
                शिमग्यामध्ये होळीच्या मैदानात दांडपट्टा, तलवारबाजी, मल्लविद्या व विविध सोंगे घेऊन मावळ्यांचे शौर्यप्रदर्शन. थेट समकालीन कागदपत्रातील उल्लेख.
              </p>
            </div>

            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-35px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#7C1D05', border: '3px solid #FFFDF9' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7C1D05' }}>इ.स. १६७४ — रायगड गुढीपाडवा व ६ जून महान शिवराज्याभिषेक सोहळा</div>
              <p style={{ fontSize: '0.88rem', color: '#431407', margin: '4px 0 0', lineHeight: 1.5 }}>
                चैत्रात रायगडावर गुढीपाडवा साजरा झाल्याचा पत्रसंग्रह संदर्भ; २९ मे ते ६ जून दरम्यान गागाभट्ट यांच्या उपस्थितीत वेदोक्त राज्याभिषेक; सर्व किल्ल्यांवर तोफांची सलामी व साखर वाटप.
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-35px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#4B5563', border: '3px solid #FFFDF9' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4B5563' }}>इ.स. १६८० — छत्रपतींचे महाप्रयाण (किल्ले रायगड)</div>
              <p style={{ fontSize: '0.88rem', color: '#431407', margin: '4px 0 0', lineHeight: 1.5 }}>
                हनुमान जयंतीच्या सुमारास (चैत्र पौर्णिमा) छत्रपती शिवाजी महाराजांचे रायगडावर निधन; स्वराज्याच्या सणांना व मूल्यांना अमर वारसा लाभला.
              </p>
            </div>

          </div>
        </section>

        {/* ================= CONNECTED PILLARS (AGRI-KOLI & CULTURE) ================= */}
        <section style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
          borderRadius: '16px',
          padding: '28px',
          border: '2px solid #F59E0B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ maxWidth: '780px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '1px' }}>
              पुढील महत्त्वाचा सांस्कृतिक विभाग
            </span>
            <h3 style={{ fontSize: '1.6rem', color: '#7C1D05', fontWeight: 800, margin: '6px 0 8px' }}>
              🌊 आगरी-कोळी समाज व सागरी वारसा
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
              कोकणच्या अथांग समुद्राचे राजे ‘कोळी बांधव’ आणि मिठागरे व भातशेतीचे वैभव ‘आगरी समाज’—त्यांचे स्वतंत्र जीवन, नारळी पौर्णिमा, कोळीवाडा, मायनाक भंडारी आणि मराठा आरमाराचा गौरवशाली इतिहास समजून घ्या.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/culture/agri-koli"
              style={{
                background: '#7C1D05',
                color: '#FFFFFF',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(124,29,5,0.3)'
              }}
            >
              <span>आगरी-कोळी दालन उघडा</span>
              <span>→</span>
            </Link>
            <Link
              to="/culture"
              style={{
                background: '#FFFFFF',
                color: '#7C1D05',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1.5px solid #7C1D05'
              }}
            >
              संस्कृती मुख्य दालन
            </Link>
          </div>
        </section>

      </div>

      {/* ================= MODAL: DETAILED FESTIVAL DOSSIER ================= */}
      {selectedFestivalModal && (
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
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '2px solid #FED7AA',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedFestivalModal(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#374151'
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedFestivalModal.heroIcon}</span>
              <div>
                <span style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  background: EVIDENCE_LEVELS[selectedFestivalModal.evidenceLevel]?.bg || '#FEF3C7',
                  color: EVIDENCE_LEVELS[selectedFestivalModal.evidenceLevel]?.color || '#92400E',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {EVIDENCE_LEVELS[selectedFestivalModal.evidenceLevel]?.badge}
                </span>
                <h2 style={{ fontSize: '1.6rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  {selectedFestivalModal.title}
                </h2>
              </div>
            </div>

            <p style={{ color: '#78350F', fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px' }}>
              {selectedFestivalModal.subtitle}
            </p>

            {/* Documented Evidence Box */}
            <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#15803D', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📜</span> समकालीन दस्तऐवजी संदर्भ व पुरावे
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#14532D', fontSize: '0.9rem', lineHeight: 1.55 }}>
                {selectedFestivalModal.documentedFacts.map((fact, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{fact}</li>
                ))}
              </ul>
            </div>

            {/* Reconstructed Atmosphere Box */}
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#B45309', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏰</span> शिवकालीन संभाव्य पारंपरिक स्वरूप
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350F', fontSize: '0.9rem', lineHeight: 1.55 }}>
                {selectedFestivalModal.traditionalReconstruction.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Modern Distinction Box */}
            <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 6px', color: '#374151', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span> आजच्या स्वरूपाशी तुलना व ऐतिहासिक सावधगिरी
              </h4>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {selectedFestivalModal.modernDistinction}
              </p>
            </div>

            {/* Associated Forts & Places */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7C1D05' }}>संबंधित किल्ले / स्थाने:</span>
              {selectedFestivalModal.places.map((place, idx) => (
                <span key={idx} style={{ background: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                  🏰 {place}
                </span>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
