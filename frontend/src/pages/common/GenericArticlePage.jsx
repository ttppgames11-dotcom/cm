import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';

const articlesDatabase = {
  'shivaji-maharaj': {
    title: 'छत्रपती शिवाजी महाराज — अखंड हिंदवी स्वराज्य संस्थापक',
    eyebrow: 'श्रीमंत छत्रपती · युगपुरुष · भारतीय आरमाराचे जनक (१६३०–१६८०)',
    heroImage: '/assets/images/real-shivaji-contemporary.jpg',
    cardImage: '/assets/images/real-shivaji-portrait.jpg',
    tagline: 'रयतेचे राजे, अद्वितीय रणनीतीकार आणि भारतीय नौदलाचे जनक — ३५०+ गड-किल्ले जिंकून परकीय आक्रमक सत्तांना पराभूत करत अखंड लोककल्याणकारी हिंदवी स्वराज्याची स्थापना करणारे युगप्रवर्तक महापुरुष.',
    warCry: '|| प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ||',
    stats: [
      { num: '१६३०', label: 'जन्म शिवनेरीवर' },
      { num: '३५०+', label: 'जिंकलेले गडकोट' },
      { num: '१६७४', label: 'रायगडावर राज्याभिषेक' },
      { num: 'अष्टप्रधान', label: 'मंत्रिमंडळ व्यवस्था' },
      { num: '२८ वर्षे', label: 'अपराजित संघर्ष' },
      { num: 'पहिले आरमार', label: 'सागरी सार्वभौमत्व' }
    ],
    sections: [
      {
        heading: '१. बालपण, संस्कार आणि रायरेश्वरावर स्वराज्याची पवित्र शपथ (१६४५)',
        content: '१९ फेब्रुवारी १६३० रोजी सह्याद्रीच्या कुशीतील शिवनेरी किल्ल्यावर छत्रपती शिवाजी महाराजांचा जन्म झाला. राष्ट्रमाता जिजाऊ माँसाहेब आणि शहाजीराजे भोसले यांच्या उच्च संस्कारात शिवबांचे बालपण घडले. वयाच्या अवघ्या १५ व्या वर्षी १६४५ मध्ये त्यांनी रायरेश्वराच्या शिवलिंगावर स्वतःच्या रक्ताचा अभिषेक करून "हे राज्य व्हावे हे तो श्रींचे मनोगत!" अशी हिंदवी स्वराज्याची प्रतिज्ञा घेतली. कान्होजी जेधे, बाजी पासलकर, तानाजी मालुसरे, येसाजी कंक या निष्ठावंत मावळ्यांना सोबत घेऊन तोरणा किल्ला जिंकला आणि स्वराज्याचे पहिले तोरण बांधले.'
      },
      {
        heading: '२. जागतिक युद्धनीती — गनिमी कावा (Ganimi Kawa) आणि प्रतापगड विजय',
        content: 'सह्याद्रीचे दुर्गम डोंगर आणि घनदाट जंगलांचा रणनीतिक उपयोग करून शिवरायांनी "गनिमी कावा" ही अजोड युद्धपद्धती विकसित केली. १० नोव्हेंबर १६५९ रोजी विजापूरच्या बलाढ्य सेनापती अफझलखानाने केलेल्या दगाफटक्याला चोख उत्तर देत शिवरायांनी वाघनखांनी त्याचा कोथळा बाहेर काढला. प्रतापगडाच्या पायथ्याशी झालेल्या या युद्धाने विजापूर सल्तनतीचा पाया हलवला. त्यानंतर पावनखिंडीत वीर बाजीप्रभू देशपांडे आणि बांदल मावळ्यांनी सिद्दी जोहरच्या अजस्त्र सेनेला रोखून धरत अद्वितीय शौर्य गाजवले.'
      },
      {
        heading: '३. आग्ऱ्याहून अद्वितीय सुटका आणि मोगल सत्तेला आव्हान (१६६६)',
        content: 'मिर्झाराजे जयसिंगासोबत झालेल्या १६६५ च्या पुरंदर तहानंतर छत्रपती शिवराय १६६६ मध्ये आग्र्याला औरंगजेबाच्या दरबारात गेले. स्वाभिमानाला धक्का लागताच भर दरबारात बादशहाला आव्हान देणारे शिवराय जगातील एकमेव राजे ठरले. औरंगजेबाने नजरकैदेत ठेवल्यानंतर अत्यंत मुत्सद्दीपणे, गोड मिठाईच्या पेटाऱ्यातून बाल संभाजीराजांसह सुरक्षित निसटून शिवराय स्वराज्यात परतले. ही सुटका जागतिक गुप्तहेर आणि रणनीती इतिहासातील महाचमत्कार मानली जाते.'
      },
      {
        heading: '४. भारतीय आरमाराचे जनक (Father of Indian Navy) व सागरी किल्ले',
        content: '"ज्याचा समुद्र त्याचा देश!" हे तत्त्व ओळखून छत्रपती शिवरायांनी १६५७ मध्ये कल्याण-भिवंडी येथे भारताच्या पहिल्या स्वतंत्र आरमाराची स्थापना केली. मालवणच्या समुद्रात खडकांवर शिशाचा रस ओतून पायाभरणी केलेला सिंधुदुर्ग, विजयदुर्ग, सुवर्णदुर्ग, पद्मदुर्ग, खांदेरी-उंदेरी असे अभेद्य जलदुर्ग उभारले. गुराब, गलबत, पाल, मचवा अशी शेकडो लढाऊ जहाजे तयार करून इंग्रज, पोर्तुगीज, डच आणि जंजिऱ्याच्या सिद्दीच्या समुद्री आक्रमणांना समुद्रावरच कायमचे रोखून धरले.'
      },
      {
        heading: '५. शिवकालीन अष्टप्रधान मंडळ व सुशासन (Administrative Excellence)',
        content: '६ जून १६७४ रोजी दुर्गराज रायगडावर पंडित गागाभट्टांच्या उपस्थितीत छत्रपती शिवरायांचा वैदिक सुवर्ण राज्याभिषेक झाला आणि स्वतंत्र "शिवराज्याभिषेक शक" सुरू झाला. प्रशासनासाठी त्यांनी अष्टप्रधान मंडळ स्थापन केले: पेशवा (मुख्य प्रधान), अमात्य (अर्थमंत्री), सचिव (गृहमंत्री), मंत्री (वाकनीस), सेनापती (सरनोबत), सुमंत (परराष्ट्रमंत्री), पंडितराव (धर्माध्यक्ष) आणि न्यायाधीश (सरन्यायाधीश). स्वतःची सुवर्ण "होन" आणि तांब्याची "शिवराई" ही नाणी पाडून स्वराज्याचे आर्थिक स्वातंत्र्य सिद्ध केले.'
      },
      {
        heading: '६. शेतकरी हित, पर्यावरण आज्ञापत्र व स्त्री सन्मान',
        content: 'शिवरायांचे राज्य हे रयतेचे राज्य होते. अण्णाजी दत्तो यांच्या काठी मोजणी पद्धतीनुसार केवळ पिकांच्या उत्पन्नावर शेतसारा ठरवला गेला; दुष्काळात शेतकऱ्यांना तगाई कर्ज आणि बियाणे दिले. आज्ञापत्रात सक्त ताकीद दिली होती: "आरमारासाठी किंवा गडासाठी रयतेने पोटच्या पोरासारखी वाढवलेली फळझाडे तोडू नयेत!" सैन्याला सक्त नियम होता की युद्धाच्या वेळी शेतातील भाजीच्या देठालाही हात लावू नये, आणि शत्रूच्या प्रदेशातीलही स्त्री व बालकांना मातेसमान सन्मान दिला गेला पाहिजे.'
      }
    ]
  },
  'sambhaji-maharaj': {
    title: 'छत्रपती संभाजी महाराज — धर्मवीर व अजिंक्य योद्धा',
    eyebrow: '१२८ लढायांमध्ये अपराजित · संस्कृत महापंडित · बलिदान मास (१६५७–१६८९)',
    heroImage: '/assets/images/real-sambhaji-portrait.png',
    tagline: '१२८ लढाया लढून एकही लढाई न हरणारे अद्वितीय सेनापती, बुधभूषणम् ग्रंथकार आणि मातृभूमी व स्वराज्यासाठी सर्वोच्च बलिदान देणारे धर्मवीर.',
    warCry: '|| मरण आले तरी चालेल, पण स्वाभिमान सोडणार नाही — छत्रपती संभाजी महाराज अमर रहे! ||',
    stats: [
      { num: '१२८', label: 'अपराजित लढाया' },
      { num: '०', label: 'पराभव' },
      { num: 'बुधभूषणम्', label: 'संस्कृत ग्रंथ' },
      { num: 'तुळापूर', label: 'बलिदान तीर्थ' }
    ],
    sections: [
      {
        heading: 'अजिंक्य सेनापती व मोगल साम्राज्याला आव्हान',
        content: 'छत्रपती संभाजी महाराजांच्या ९ वर्षांच्या राजवटीत औरंगजेब ५ लाख फौजेसह महाराष्ट्रात आला, परंतु संभाजी महाराजांनी एकही किल्ला मोगलांच्या हाती जाऊ दिला नाही. जंजिरा मोहीम, पोर्तुगीज युद्ध आणि बुरहानपूर छापा हे त्यांचे देदीप्यमान विजय आहेत.'
      },
      {
        heading: 'साहित्य रचना व विद्वत्ता',
        content: 'संभाजी राजे केवळ रणांगणावरचे वीर नव्हते, तर ते अत्यंत प्रतिभावान कवी व संस्कृत महापंडित होते. त्यांनी बुधभूषणम्, नखशिख, नायिकाभेद आणि सातसतक हे श्रेष्ठ ग्रंथ रचले.'
      }
    ]
  },
  'rajmata-jijau': {
    title: 'राष्ट्रमाता राजमाता जिजाऊ — हिंदवी स्वराज्याची प्रेरिका',
    eyebrow: 'सिंदखेड राजा · शिवनेरी · पाचाड (१५९८–१६७४)',
    heroImage: '/assets/images/real-jijau-portrait.jpg',
    tagline: 'छत्रपती शिवाजी महाराजांना घडवणाऱ्या, रयतेला न्याय देणाऱ्या आणि गुलामगिरीच्या अंधारात स्वराज्याची ज्योत पेटवणाऱ्या युगमाता.',
    warCry: '|| जिजाऊंचे संस्कार, शिवरायांचे विचार — हेच आमचे जीवन! ||',
    stats: [
      { num: 'सिंदखेड', label: 'जन्मस्थान' },
      { num: 'पुणे', label: 'सुवर्ण नांगराने नांगरले' },
      { num: 'संस्कार', label: 'शिवरायांची घडण' },
      { num: 'पाचाड', label: 'समाधी स्थळ' }
    ],
    sections: [
      {
        heading: 'स्वराज्य निर्मितीतील मातृत्व व मार्गदर्शन',
        content: 'उध्वस्त झालेल्या पुण्यात सोन्याचा नांगर फिरवून जिजाऊंनी शेती आणि व्यापार पुन्हा सुरू केला. शिवरायांच्या बालपणापासून त्यांच्या मनात स्वाभिमान, राष्ट्रभक्ती आणि रयतेच्या रक्षणाची मूल्ये त्यांनी रुजवली.'
      }
    ]
  },
  'bajirao-peshwa': {
    title: 'श्रीमंत थोरले बाजीराव पेशवा — अपराजित सेनापती',
    eyebrow: '४१ लढाया, ० पराभव · शनिवार वाडा निर्माते (१७००–१७४०)',
    heroImage: '/assets/images/real-bajirao-statue.jpg',
    tagline: 'अश्वदलाच्या प्रचंड वेगावर आधारित युद्धनीती, पालखेडची जागतिक कीर्तीची लढाई आणि मराठा साम्राज्याचा नर्मदा पार विस्तार करणारे थोरले बाजीराव.',
    warCry: '|| "चला, मुघल साम्राज्याच्या मुळावरच घाव घालूया!" — श्रीमंत बाजीराव पेशवे ||',
    stats: [
      { num: '४१', label: 'लढाया' },
      { num: '०', label: 'पराभव' },
      { num: 'पालखेड', label: 'रणनीतीचा नमुना' },
      { num: 'शनिवार वाडा', label: 'राजधानी वाडा' }
    ],
    sections: [
      {
        heading: 'पालखेड व भोपाळचा ऐतिहासिक विजय',
        content: 'निजामाविरुद्ध पालखेड येथे बाजीरावांनी एकाही मोठ्या समोरासमोरच्या युद्धाशिवाय केवळ वेगवान हालचालींनी शत्रूला शरण येण्यास भाग पाडले. फील्ड मार्शल मॉन्टगोमेरी यांनी या लढाईचा उल्लेख जगातील सर्वोत्तम रणनीतींमध्ये केला आहे.'
      }
    ]
  },
  'rajaram-maharaj': {
    title: 'छत्रपती राजाराम महाराज — मराठा स्वातंत्र्यसंग्रामाचे नेतृत्व',
    eyebrow: 'जिंजीचा अभेद्य वेढा · संताजी-धनाजी युग (१६७०–१७००)',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'मोगल फौजांनी राजधानी रायगड घेरल्यानंतर दक्षिणेत जिंजी येथे जाऊन तब्बल ८ वर्षे मोगल साम्राज्याला झुंजवणारे छत्रपती.',
    warCry: '|| स्वातंत्र्य हाच आमचा धर्म, अखंड स्वराज्य हेच ध्येय! ||',
    stats: [
      { num: '८ वर्षे', label: 'जिंजी वेढा' },
      { num: 'संताजी-धनाजी', label: 'पराक्रमी सेनापती' },
      { num: '१६८९–१७००', label: 'राज्यकाळ' },
      { num: 'सिंहगड', label: 'समाधी तीर्थ' }
    ],
    sections: [
      {
        heading: 'जिंजीचा ऐतिहासिक वेढा व गनिमी युद्ध',
        content: 'छत्रपती संभाजी महाराजांच्या बलिदानानंतर मोगलांनी स्वराज्य नष्ट करण्याचा प्रयत्न केला. राजाराम महाराजांनी दक्षिणेतील जिंजी किल्ल्यावरून मोगल सम्राटाविरुद्ध लढा चालू ठेवला.'
      }
    ]
  },
  'tarabai': {
    title: 'महाराणी ताराबाई भोसले — मुघल साम्राज्य धडक देणाऱ्या रणरागिणी',
    eyebrow: 'मराठा साम्राज्य संरक्षिका · कोल्हापूर गादी संस्थापिका (१६७५–१७६१)',
    heroImage: '/assets/images/mughal empire.png',
    tagline: 'औरंगजेबाच्या मृत्यूपर्यंत मराठा स्वातंत्र्ययुद्ध धैर्याने चालवून मुघल बादशहाला महाराष्ट्राच्या मातीत गाडणाऱ्या अद्वितीय स्वाभिमानी विरांगना.',
    warCry: '|| स्वाभिमान, रणरागिणी आणि स्वराज्य — महाराणी ताराबाई अमर रहे! ||',
    stats: [
      { num: '१७००–१७०७', label: 'स्वातंत्र्यसंग्राम नेतृत्व' },
      { num: 'मुघल पराभव', label: 'औरंगजेब दफन' },
      { num: 'कोल्हापूर', label: 'गादी स्थापना' },
      { num: '८६ वर्षे', label: 'गौरवशाली जीवन' }
    ],
    sections: [
      {
        heading: 'मुघल फौजांचा धुव्वा',
        content: 'पती राजाराम महाराजांच्या निधनानंतर ताराबाईंनी स्वतः सैन्याचे नेतृत्व केले आणि माळवा, गुजरात व वऱ्हाडपर्यंत मराठा फौजा धाडल्या. त्यांच्या रणनीतीमुळे अखेर औरंगजेबाचा नगर येथे अंत झाला.'
      }
    ]
  },
  'shahu-maharaj': {
    title: 'छत्रपती शाहू महाराज (थोरले) — मराठा साम्राज्याचा विस्तार',
    eyebrow: 'सातारा राजधानी · पेशवे नियुक्ती · अटकेपार भगवा (१६८२–१७४९)',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'मोगल कैदेतून मुक्त होऊन सातारा येथे स्वराज्याची गादी सांभाळणारे आणि मराठा साम्राज्याचा भारतभर विस्तार करणारे द्रष्टे छत्रपती.',
    warCry: '|| सकल जनांचे कल्याण आणि साम्राज्याचा अखंड विस्तार! ||',
    stats: [
      { num: '४० वर्षे', label: 'यशस्वी शासन' },
      { num: 'अटकेपार', label: 'भगवा ध्वज' },
      { num: 'सातारा', label: 'राजधानी' },
      { num: 'समन्वय', label: 'साम्राज्य विस्तार' }
    ],
    sections: [
      {
        heading: 'मराठा साम्राज्याची सुवर्णयुगीन भरभराट',
        content: 'छत्रपती शाहू महाराजांनी बाळाजी विश्वनाथ आणि थोरले बाजीराव पेशवे यांच्या पराक्रमावर विश्वास ठेवून मराठा सत्तेचा विस्तार संपूर्ण भारतात केला.'
      }
    ]
  },
  'warriors': {
    title: 'अमर मराठा शिलेदार व मावळे — स्वाभिमानाची वज्रमूठ',
    eyebrow: 'तानाजी मालुसरे · बाजी प्रभू · येसाजी कंक · जीवा महाला · कान्होजी जेधे',
    heroImage: '/assets/images/real-sinhagad-fort.jpg',
    tagline: 'शिवरायांच्या खांद्याला खांदा लावून लढणारे, स्वराज्यासाठी प्राणांची आहुती देणारे निष्ठावान सरदार, मावळे आणि शिलेदार.',
    warCry: '|| हर हर महादेव! जय भवानी, जय शिवाजी! ||',
    stats: [
      { num: 'तानाजी', label: 'सिंहगडाचा सिंह' },
      { num: 'बाजी प्रभू', label: 'पावनखिंड वीर' },
      { num: 'जीवा महाला', label: 'होता जीवा म्हणून वाचला शिवा' },
      { num: 'कान्होजी', label: 'विश्वासू सरदार' }
    ],
    sections: [
      {
        heading: 'सुभेदार तानाजी मालुसरे — सिंहगडावरील अमर बलिदान',
        content: '४ फेब्रुवारी १६७० रोजी घोरपडीच्या साहाय्याने कोंढाण्याच्या कड्यावर चढून उदयभानविरुद्ध प्राणपणाने लढणारे तानाजी मालुसरे धारातीर्थी पडले. शिवरायांच्या तोंडून शब्द निघाले — "गड आला, पण सिंह गेला!"'
      },
      {
        heading: 'बाजी प्रभू देशपांडे — पावनखिंडीतील अभेद्य ढाल',
        content: '१३ जुलै १६६० रोजी पन्हाळगडावरून विशाळगडाकडे कूच करताना सिद्धी मसूदच्या सैन्याला घोडखिंडीत रोखून धरणारे बाजी प्रभू तोफांचे तीन आवाज होईपर्यंत प्राणपणाने लढले.'
      }
    ]
  },
  'raigad': {
    title: 'दुर्गराज रायगड — हिंदवी स्वराज्याची राजधानी',
    eyebrow: 'रायगड जिल्हा · समुद्रसपाटीपासून सुमारे २,७०० फूट · युनेस्को जागतिक वारसा',
    heroImage: '/assets/images/real-raigad-panoramic.jpg',
    tagline: '"जिथे स्वराज्याला सिंहासन मिळाले" — हिंदवी स्वराज्याची राजधानी, ६ जून १६७४ च्या ऐतिहासिक राज्याभिषेकाची पवित्र भूमी आणि छत्रपती शिवरायांची समाधी.',
    warCry: '|| जिथे स्वराज्याला सिंहासन मिळाले — दुर्गराज रायगड, हिंदवी स्वराज्याची राजधानी! ||',
    stats: [
      { num: '१६७४', label: 'राज्याभिषेक सोहळा' },
      { num: '२,७०० फूट', label: 'उंची समुद्रसपाटीपासून' },
      { num: '८४', label: 'पाण्याचे तलाव' },
      { num: 'UNESCO', label: 'जागतिक वारसा' }
    ],
    sections: [
      {
        heading: 'राज्याभिषेकाची पवित्र भूमी',
        content: '६ जून १६७४ रोजी दुर्गराज रायगडावर गागाभट्टांच्या उपस्थितीत ३२ मण सोन्याच्या सिंहासनावर छत्रपती शिवाजी महाराजांचा राज्याभिषेक झाला. याच गडावरून शिवरायांनी हिंदवी स्वराज्याचे सार्वभौम शासन चालवले.'
      },
      {
        heading: 'गडावरील प्रमुख ऐतिहासिक वास्तू',
        content: 'होळीचा माळ, नगारखाना, राजसभा, टकमक टोक, हिरकणी बुरुज, जगदीश्वर मंदिर आणि शिवछत्रपतींची समाधी ही रायगडावरील प्रमुख आकर्षणे आहेत.'
      }
    ]
  },
  'pratapgad': {
    title: 'किल्ले प्रतापगड — शौर्यपीठ व अफझलखान वध',
    eyebrow: 'सातारा जिल्हा · समुद्रसपाटीपासून ३,५४० फूट · युनेस्को नामांकन',
    heroImage: '/assets/images/real-pratapgad-fort.jpg',
    tagline: '१० नोव्हेंबर १६५९ रोजी छत्रपती शिवाजी महाराजांनी बलाढ्य अफझलखानाचा वध करून विजापूरच्या अफाट सेनेचा जावळीच्या जंगलात संपूर्ण धुव्वा उडवला.',
    warCry: '|| अखंड भवानी मातेचा आशीर्वाद आणि शिवरायांचे अद्वितीय शौर्य — किल्ले प्रतापगड! ||',
    stats: [
      { num: '१६५९', label: 'प्रतापगड रणसंग्राम' },
      { num: '३,५४० फूट', label: 'उंची' },
      { num: 'भवानी माता', label: 'स्वयंभू मंदिर' },
      { num: 'जावळी', label: 'अभेद्य अरण्य' }
    ],
    sections: [
      {
        heading: 'अफझलखानाचा वध आणि जावळी मोहीम',
        content: 'विजापूरहून स्वराज्यावर चालून आलेल्या अफाट अफझलखानाचा शिवरायांनी वाघनखे आणि बिचव्याच्या सहाय्याने कोथळा बाहेर काढून वध केला. प्रतापगडाच्या पायथ्याशी झालेल्या या युद्धात मराठा सैन्याने शत्रूची अफाट लूट जिंकली.'
      }
    ]
  },
  'rajgad': {
    title: 'किल्ले राजगड — स्वराज्याची पहिली राजधानी (२६ वर्षे)',
    eyebrow: 'पुणे जिल्हा · समुद्रसपाटीपासून ४,५१४ फूट · तीन माच्या व बालेकिल्ला',
    heroImage: '/assets/images/real-rajgad-fort.jpg',
    tagline: 'छत्रपती शिवरायांनी सर्वाधिक काळ (२६ वर्षे) वास्तव्य केलेला दुर्गराज. पद्मावती, संजीवनी आणि सुवेळा माचीचे अभेद्य स्थापत्य.',
    warCry: '|| सह्याद्रीचा मुकुटमणी — दुर्गराज राजगड! ||',
    stats: [
      { num: '२६ वर्षे', label: 'स्वराज्य राजधानी' },
      { num: '४,५१४ फूट', label: 'प्रचंड उंची' },
      { num: '३ माच्या', label: 'पद्मावती, सुवेळा, संजीवनी' },
      { num: 'बालेकिल्ला', label: 'चंद्रहार शिखर' }
    ],
    sections: [
      {
        heading: 'स्वराज्याचा आधारवड',
        content: 'राजगडावरून शिवरायांनी जावळी, कल्याण, सुरत आणि अफझलखान वध यासारख्या अनेक महत्त्वपूर्ण मोहिमांचे नियोजन केले. गडाचा बालेकिल्ला चढण्यासाठी जगातील सर्वात कठीण मार्गांपैकी एक मानला जातो.'
      }
    ]
  },
  'shivneri': {
    title: 'किल्ले शिवनेरी — छत्रपती शिवाजी महाराजांचे पावन जन्मस्थान',
    eyebrow: 'जुन्नर, पुणे जिल्हा · समुद्रसपाटीपासून ३,००० फूट · शिवजन्म स्थान',
    heroImage: '/assets/images/real-shivneri-fort.jpg',
    tagline: '१९ फेब्रुवारी १६३० रोजी याच गडावर युगपुरुष छत्रपती शिवाजी महाराजांचा जन्म झाला. शिवाई देवीच्या आशीर्वादाने स्वराज्याची पहाट उगवली.',
    warCry: '|| सह्याद्रीच्या कुशीत जन्मला रयतेचा राजा — किल्ले शिवनेरी! ||',
    stats: [
      { num: '१९ फेब्रु १६३०', label: 'शिवजन्म तारीख' },
      { num: '७ दरवाजे', label: 'अभेद्य प्रवेशद्वार' },
      { num: 'शिवाई देवी', label: 'कुलदेवता मंदिर' },
      { num: 'अंबरखाना', label: 'धान्य कोठार' }
    ],
    sections: [
      {
        heading: 'शिवजन्म व बालपण',
        content: 'जिजाऊ आऊसाहेबांनी शिवनेरीवर शिवाई देवीची आराधना करून पुत्रप्राप्तीचा नवस केला होता. गडावरील शिवजन्मस्थानी आजही अखंड नंदादीप तेवत असतो.'
      }
    ]
  },
  'torna': {
    title: 'किल्ले तोरणा (प्रचंडगड) — स्वराज्याचे पहिले तोरण',
    eyebrow: 'पुणे जिल्हा · समुद्रसपाटीपासून ४,६०३ फूट · वयाच्या १६ व्या वर्षी विजय',
    heroImage: '/assets/images/real-torna-fort.jpg',
    tagline: 'छत्रपती शिवरायांनी वयाच्या अवघ्या १६ व्या वर्षी जिंकलेला पहिला किल्ला. येथे मिळालेल्या सोन्याच्या घागरींनी राजगड बांधणीला हातभार लागला.',
    warCry: '|| तोरणा जिंकला आणि हिंदवी स्वराज्याचे पहिले तोरण बांधले! ||',
    stats: [
      { num: '१६४६', label: 'पहिला विजय' },
      { num: '४,६०३ फूट', label: 'प्रचंड उंची' },
      { num: 'झुंजार माची', label: 'अभेद्य कडा' },
      { num: 'प्रचंडगड', label: 'मूळ नाव' }
    ],
    sections: [
      {
        heading: 'स्वराज्याची पहिली गर्जना',
        content: 'तोरणा जिंकून शिवरायांनी विजापूरच्या आदिलशाहीला थेट आव्हान दिले. गडावरील मेंगाई देवी मंदिर आणि झुंजार माची हे आजही साहसप्रेमींसाठी आव्हानात्मक आकर्षण आहे.'
      }
    ]
  },
  'about': {
    title: 'Connect Maratha डिजिटल व्यासपीठ — परिचय व ध्येय',
    eyebrow: 'समुदाय · संस्कृती · व्यवसाय · सेवा · एकात्मता',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'मराठा समाजाला तंत्रज्ञान, व्यवसाय संगम, शिक्षण, रोजगार आणि सांस्कृतिक वारशाच्या माध्यमातून एका व्यासपीठावर जोडणारी डिजिटल क्रांती.',
    warCry: '|| मराठा समाजाची एकसंध शक्ती — कनेक्ट मराठा! ||',
    stats: [
      { num: '३६', label: 'जिल्हे नेटवर्क' },
      { num: '२४,०००+', label: 'नोंदणीकृत सदस्य' },
      { num: '१८४', label: 'व्यवसाय मंडळे' },
      { num: '१००%', label: 'विनाशुल्क सेवा' }
    ],
    sections: [
      {
        heading: 'संस्थेची उद्दिष्टे व कार्यप्रणाली',
        content: 'Connect Maratha हे राज्यातील प्रत्येक मराठा उद्योजक, विद्यार्थी, शेतकरी आणि युवकांसाठी एकसंध व्यासपीठ प्रदान करते. व्यवसाय संगम, डिजिटल सदस्य ओळखपत्र, आणि इतिहास संवर्धन हे आमचे प्रमुख स्तंभ आहेत.'
      },
      {
        heading: 'कार्यक्षेत्रे व डिजिटल उपक्रम',
        content: '१. व्यवसाय संगम (Business Networking & Referral Engine)\n२. डिजिटल स्मार्ट आयडी कार्ड\n३. ३५०+ गडकिल्ले संवर्धन व ऐतिहासिक संशोधन\n४. मराठा करिअर व नोकरी संधी केंद्र'
      }
    ]
  },
  'contact': {
    title: 'संपर्क व समाज साहाय्यता केंद्र — कनेक्ट मराठा',
    eyebrow: '२४/७ हेल्पलाईन · मध्यवर्ती कार्यालय · जिल्हा समन्वय केंद्र',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'Connect Maratha च्या कोणत्याही उपक्रमासाठी, सदस्यत्वासाठी किंवा मदतीसाठी आमच्याशी थेट संपर्क साधा.',
    warCry: '|| आम्ही सदैव समाजाच्या सेवेत तत्पर ||',
    stats: [
      { num: '१८००-२३३-१९८१', label: 'टोल-फ्री हेल्पलाईन' },
      { num: '३६', label: 'जिल्हा कार्यालये' },
      { num: 'पुणे', label: 'मध्यवर्ती कार्यालय' },
      { num: '२४ तास', label: 'प्रतिसाद वेळ' }
    ],
    sections: [
      {
        heading: 'मध्यवर्ती कार्यालय पत्ता',
        content: 'Connect Maratha भवन, नारायण पेठ, पुणे – ४११०३०, महाराष्ट्र.'
      },
      {
        heading: 'ईमेल व अधिकृत संपर्क',
        content: 'संपर्क: contact@connectmaratha.org | हेल्पलाईन: १८००-२३३-१९८१ | व्हॉट्सअ‍ॅप: +९१ ९८२०० ११९८१'
      }
    ]
  },
  'community': {
    title: 'मराठा समुदाय संवाद व उपक्रम मंच',
    eyebrow: 'एकसंध समाज · संवाद · साहाय्यता · युवा विकास',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'महाराष्ट्रासह देश-विदेशातील मराठा बांधवांना एकत्र आणणारा अधिकृत सामाजिक मंच.',
    warCry: '|| एकी हेच बळ — मराठा समाज ||',
    stats: [
      { num: '५,४०,०००+', label: 'सक्रिय बांधव' },
      { num: '३५८', label: 'तालुका गट' },
      { num: '१,२००+', label: 'गाव समित्या' },
      { num: 'दैनिक', label: 'विचारमंथन' }
    ],
    sections: [
      {
        heading: 'समुदाय उपक्रम व बंधुभाव',
        content: 'गावपातळीपासून जागतिक पातळीपर्यंत मराठा बांधवांच्या समस्या सोडवणे, आपत्कालीन मदत पुरवणे आणि सामाजिक एकता टिकवणे हे या मंचाचे प्रमुख उद्दिष्ट आहे.'
      }
    ]
  },
  'events': {
    title: 'आगामी मराठा मेळावे, स्नेहसंमेलन व शिवजयंती महोत्सव',
    eyebrow: 'शिवराज्याभिषेक शक ३५१ · महाअधिवेशन · उद्योग संगम',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'राज्यभरातील आगामी सामाजिक, व्यावसायिक आणि सांस्कृतिक कार्यक्रमांची सविस्तर दिनदर्शिका.',
    warCry: '|| शिवजयंती, दुर्ग मोहीम व समाज मेळावे — उत्साहाची अखंड लाट! ||',
    stats: [
      { num: '४८+', label: 'वार्षिक कार्यक्रम' },
      { num: '३६', label: 'जिल्हास्तरीय मेळावे' },
      { num: '६ जून', label: 'शिवराज्याभिषेक दिन' },
      { num: '१९ फेब्रु', label: 'अखंड शिवजयंती' }
    ],
    sections: [
      {
        heading: 'प्रमुख वार्षिक सोहळे',
        content: 'दुर्गराज रायगडावर शिवराज्याभिषेक सोहळा, शिवनेरीवर अखंड शिवजयंती महोत्सव, आणि दरमहा होणारे जिल्हा व्यवसाय संगम मेळावे हे आमचे प्रमुख आकर्षण आहेत.'
      }
    ]
  },
  'services': {
    title: 'मराठा सेवा, करिअर मार्गदर्शन व कौशल्य विकास',
    eyebrow: 'रोजगार · स्पर्धा परीक्षा · शेती मार्गदर्शन · कायदेशीर सल्ला',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'मराठा समाजातील तरुणांना नोकरी, व्यवसाय आणि उच्च शिक्षणासाठी सर्वतोपरी सहकार्य करणारे दालन.',
    warCry: '|| शिक्षण, कौशल्य आणि उद्योजकतेतून समृद्ध समाज! ||',
    stats: [
      { num: '१२,०००+', label: 'रोजगार संधी' },
      { num: '८,५००+', label: 'विद्यार्थी मार्गदर्शन' },
      { num: '५०+', label: 'कौशल्य प्रशिक्षण सत्रे' },
      { num: 'विनामूल्य', label: 'समुपदेशन' }
    ],
    sections: [
      {
        heading: 'उपलब्ध सेवा व करिअर दालन',
        content: '१. MPSC/UPSC स्पर्धा परीक्षा मार्गदर्शन केंद्र\n२. मराठा उद्योजकता विकास कार्यशाळा\n३. कृषी तंत्रज्ञान व शेतीमाल प्रक्रिया सल्ला\n४. विनामूल्य कायदेशीर व सामाजिक साहाय्यता'
      }
    ]
  }
};

// Aliases mapping to ensure 100% clean resolution
const slugAliases = {
  'cm-shivaji-maharaj.html': 'shivaji-maharaj',
  'cm-sambhaji-maharaj.html': 'sambhaji-maharaj',
  'cm-rajmata-jijau.html': 'rajmata-jijau',
  'cm-bajirao-peshwa.html': 'bajirao-peshwa',
  'cm-rajaram-maharaj.html': 'rajaram-maharaj',
  'cm-tarabai.html': 'tarabai',
  'cm-shahu-maharaj.html': 'shahu-maharaj',
  'cm-warriors.html': 'warriors',
  'cm-raigad-fort.html': 'raigad',
  'cm-pratapgad-fort.html': 'pratapgad',
  'cm-rajgad-fort.html': 'rajgad',
  'cm-shivneri-fort.html': 'shivneri',
  'cm-torna-fort.html': 'torna',
  'cm-about.html': 'about',
  'cm-contact.html': 'contact',
  'cm-community.html': 'community',
  'cm-events.html': 'events',
  'cm-services.html': 'services',
  'raigad-fort': 'raigad',
  'pratapgad-fort': 'pratapgad',
  'rajgad-fort': 'rajgad',
  'shivneri-fort': 'shivneri',
  'torna-fort': 'torna'
};

export default function GenericArticlePage() {
  const location = useLocation();
  const params = useParams();

  // Normalize slug
  let rawSlug = params.slug || location.pathname.replace(/^\//, '');
  rawSlug = rawSlug
    .replace(/^history\//, '')
    .replace(/^forts\//, '')
    .replace(/^article\//, '');

  const normalizedKey = slugAliases[rawSlug] || rawSlug.replace(/^cm-/, '').replace(/\.html$/, '');

  // Look up known article or create high-fidelity fallback
  const article = articlesDatabase[normalizedKey] || {
    title: normalizedKey.replace(/-/g, ' ').toUpperCase() + ' — कनेक्ट मराठा',
    eyebrow: 'इतिहास, संस्कृती व समाज विकास दालन',
    heroImage: '/assets/images/maratha-samrajya.jpg',
    tagline: 'अखंड मराठा साम्राज्य, संस्कृती व समाज विकासाचा गौरवशाली वारसा जपणारे विशेष डिजिटल दालन.',
    warCry: '|| गर्जा महाराष्ट्र माझा! अखंड स्वाभिमानाची गौरवगाथा! ||',
    stats: [
      { num: '१६३०', label: 'स्वराज्य मुहूर्तमेढ' },
      { num: '३६', label: 'जिल्हे' },
      { num: '३५०+', label: 'गड-किल्ले' },
      { num: 'अखंड', label: 'वारसा' }
    ],
    sections: [
      {
        heading: 'ऐतिहासिक व सांस्कृतिक माहिती',
        content: 'सदर दालनात मराठा संस्कृती, ऐतिहासिक दस्तऐवज, युद्धनीती आणि समाजोपयोगी उपक्रमांची अद्ययावत माहिती उपलब्ध आहे. अधिक माहितीसाठी आपल्या जवळच्या मराठा समन्वयकांशी संपर्क साधा.'
      }
    ]
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Breadcrumbs */}
      <div className="breadcrumbs-bar">
        <div className="breadcrumbs-inner" style={{ maxWidth: '1320px', margin: '0 auto', padding: '10px 24px' }}>
          <Link to="/" title="होम" style={{ color: 'var(--maroon-900)', textDecoration: 'none' }}>🏠 होम</Link>
          <span className="sep" style={{ margin: '0 8px', color: '#9ca3af' }}>›</span>
          <Link to="/history" style={{ color: 'var(--maroon-900)', textDecoration: 'none' }}>इतिहास व वारसा</Link>
          <span className="sep" style={{ margin: '0 8px', color: '#9ca3af' }}>›</span>
          <span className="current" style={{ fontWeight: 700, color: 'var(--muted)' }}>{article.title}</span>
        </div>
      </div>

      {/* War Cry Banner */}
      <div className="war-cry-strip">
        <span className="flame-icon">🔥</span>
        <span>{article.warCry}</span>
        <span className="flame-icon">🔥</span>
      </div>

      {/* Hero Section */}
      <div className="hero" style={{ minHeight: '480px', position: 'relative', overflow: 'hidden', background: '#120502' }}>
        <img
          src={article.heroImage}
          alt={article.title}
          className="hero-bg-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', position: 'absolute', inset: 0, opacity: 0.35, filter: 'blur(2px)' }}
          onError={(e) => { e.target.src = '/assets/images/maratha-samrajya.jpg'; }}
        />
        <div className="hero-overlay" style={{ background: 'linear-gradient(90deg, rgba(18,5,2,0.94) 0%, rgba(35,10,5,0.85) 50%, rgba(18,5,2,0.92) 100%)' }}></div>

        <div className="wrap hero-content" style={{ maxWidth: '1320px', width: '100%', padding: '44px 24px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 580px', minWidth: '300px' }}>
            <div className="eyebrow" style={{ color: 'var(--gold-300)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.88rem' }}>
              {article.eyebrow}
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)', lineHeight: 1.18, color: '#FFFFFF', margin: '14px 0 10px', fontFamily: 'Baloo 2' }}>
              {article.title}
            </h1>
            <div className="rule" style={{ background: 'var(--gold-500)', height: '4px', width: '80px', margin: '14px 0' }}></div>
            <p className="tagline" style={{ fontSize: '1.08rem', maxWidth: '64ch', color: '#FFF8F2', lineHeight: 1.65 }}>
              {article.tagline}
            </p>

            <div className="stats-glass" style={{ marginTop: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {article.stats.map((s, i) => (
                <div key={i} className="stat-glass" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(228,162,82,0.3)', padding: '10px 16px', borderRadius: '10px' }}>
                  <b style={{ color: 'var(--gold-300)', fontSize: '1.15rem', display: 'block' }}>{s.num}</b>
                  <span style={{ color: '#E2E8F0', fontSize: '0.82rem' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Portrait Card (Fully Visible, Exact Fit & No Cropping) */}
          <div style={{
            flex: '0 0 320px',
            maxWidth: '360px',
            width: '100%',
            background: 'linear-gradient(145deg, rgba(45,15,8,0.95), rgba(20,5,2,0.98))',
            padding: '14px',
            borderRadius: '20px',
            border: '2px solid rgba(245,158,11,0.5)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '340px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#0D0402',
              position: 'relative'
            }}>
              <img
                src={article.cardImage || article.heroImage}
                alt={article.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block'
                }}
                onError={(e) => { e.target.src = '/assets/images/real-shivaji-contemporary.jpg'; }}
              />
              <span style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.75)',
                color: 'var(--gold-300)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: '1px solid rgba(245,158,11,0.4)',
                whiteSpace: 'nowrap'
              }}>
                अस्सल समकालीन व्यक्तिरेखा
              </span>
            </div>
            <div style={{ marginTop: '10px', color: '#FFF8F2', fontWeight: 700, fontSize: '0.94rem' }}>
              श्री राजा शिवछत्रपती
            </div>
            <div style={{ fontSize: '0.78rem', color: '#D1D5DB' }}>
              अखंड हिंदवी स्वराज्य संस्थापक
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="wrap" style={{ maxWidth: '1120px', padding: '40px 24px', margin: '0 auto' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '36px', border: '1px solid var(--line)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          {article.sections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: idx === article.sections.length - 1 ? 0 : '36px' }}>
              <h3 style={{ fontFamily: 'Baloo 2', color: 'var(--maroon-900)', fontSize: '1.45rem', marginBottom: '14px', borderBottom: '2px solid var(--gold-300)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span> {sec.heading}
              </h3>
              <p style={{ fontSize: '1.04rem', lineHeight: 1.85, color: '#374151', margin: 0, textAlign: 'justify' }}>
                {sec.content}
              </p>
            </div>
          ))}

          {/* New Interactive Block 1: शिवकालीन अष्टप्रधान मंडळ तक्ता */}
          <div style={{ marginTop: '44px', padding: '24px', background: '#FFF8F2', borderRadius: '14px', border: '1px solid #FFCC80' }}>
            <h3 style={{ fontFamily: 'Baloo 2', color: '#C73800', fontSize: '1.4rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏛️</span> शिवकालीन अष्टप्रधान मंत्रिमंडळ रचना (१६७४)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#C73800', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 0' }}>पद</th>
                    <th style={{ padding: '10px 14px' }}>शिवकालीन मंत्री</th>
                    <th style={{ padding: '10px 14px' }}>प्रशासकीय अधिकार व खाते</th>
                    <th style={{ padding: '10px 14px', borderRadius: '0 6px 0 0' }}>वार्षिक वेतन</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #FED7AA' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>पेशवा (मुख्य प्रधान)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>मोरोपंत त्र्यंबक पिंगळे</td>
                    <td style={{ padding: '10px 14px' }}>राजांनंतर संपूर्ण राज्यकारभार चालवणे, युद्धप्रसंगी सैन्याचे नेतृत्व.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१५,००० होन</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #FED7AA', background: '#FFFDF9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>अमात्य (अर्थमंत्री)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>रामचंद्र नीलकंठ मुजुमदार</td>
                    <td style={{ padding: '10px 14px' }}>स्वराज्याची तिजोरी, जमाखर्च व महसूल व्यवस्था सांभाळणे.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१२,००० होन</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #FED7AA' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>सेनापती (सरनोबत)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>हंबीरराव मोहिते</td>
                    <td style={{ padding: '10px 14px' }}>स्वराज्याच्या संपूर्ण घोडदळ व पायदळाचे सर्वोच्च लष्करप्रमुख.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१०,००० होन</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #FED7AA', background: '#FFFDF9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>सचिव (सुरनीस)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>अण्णाजी दत्तो</td>
                    <td style={{ padding: '10px 14px' }}>राजांच्या सर्व आज्ञापत्रांची शुद्धता तपासणे व जमीन महसूल मोजणी.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१०,००० होन</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #FED7AA' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>मंत्री (वाकनीस)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>दत्ताजी त्रिंबक वाकनीस</td>
                    <td style={{ padding: '10px 14px' }}>राजांची दैनंदिनी, राजदरबारातील सुरक्षा व गुप्तहेर समन्वय.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१०,००० होन</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #FED7AA', background: '#FFFDF9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>सुमंत (डबीर)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>रामचंद्र त्रिंबक डबीर</td>
                    <td style={{ padding: '10px 14px' }}>परराष्ट्र संबंध, वकिलांशी बोलणी आणि राजकीय पत्रव्यवहार.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१०,००० होन</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #FED7AA' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>पंडितराव (धर्माध्यक्ष)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>रघुनाथराव पंडितराव</td>
                    <td style={{ padding: '10px 14px' }}>धर्मव्यवस्था, न्यायदान मार्गदर्शन, विद्वान सत्कार व दानधर्म.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१०,००० होन</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#9A3412' }}>न्यायाधीश</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>निराजी रावजी</td>
                    <td style={{ padding: '10px 14px' }}>स्वराज्यातील दिवाणी व फौजदारी खटल्यांवर निष्पक्ष न्यायनिवाडा.</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>१०,००० होन</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* New Interactive Block 2: शिवकालीन आज्ञापत्र व प्रसिद्ध उद्गार */}
          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontWeight: 800, color: '#B45309', marginBottom: '6px' }}>📜 आरमारविषयक आज्ञापत्र:</div>
              <p style={{ fontSize: '0.9rem', color: '#451A03', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                "ज्यांचे आरमार त्यांचा समुद्र! आरमार हे एक स्वतंत्रच राज्य आहे. ज्यास समुद्रतीराचे रक्षण करणे त्यास आरमार अवश्यकच आहे."
              </p>
              <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '6px', textAlign: 'right' }}>— रामचंद्रपंत अमात्य लिखित आज्ञापत्र</div>
            </div>

            <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #EF4444' }}>
              <div style={{ fontWeight: 800, color: '#991B1B', marginBottom: '6px' }}>🌾 रयतेची काळजी घेणारा राजा:</div>
              <p style={{ fontSize: '0.9rem', color: '#450A0A', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                "रयतेस काडीचाही उपद्रव न देणे. शेतातील भाजीच्या देठासही हात न लावणे. जबरदस्तीने कोणाचेही काही न घेणे."
              </p>
              <div style={{ fontSize: '0.78rem', color: '#7F1D1D', marginTop: '6px', textAlign: 'right' }}>— छत्रपती शिवरायांचे सेनापतींना पत्र (१६७४)</div>
            </div>

            <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
              <div style={{ fontWeight: 800, color: '#065F46', marginBottom: '6px' }}>⚔️ कवी भूषणांचे ऐतिहासिक गौरवगान:</div>
              <p style={{ fontSize: '0.9rem', color: '#064E3B', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                "काशी की कला जाती, मथुरा की मसजिद होती, सिवाजी न होतो तो सुनति होत सबकी!"
              </p>
              <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '6px', textAlign: 'right' }}>— महाकवी भूषण कृत शिवराजभूषण</div>
            </div>
          </div>

          {/* Action / Navigation Bar */}
          <div style={{ marginTop: '44px', paddingTop: '24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Link to="/history" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', color: '#C73800', borderColor: '#C73800', fontWeight: 700 }}>
              ← इतिहास दालनात परत जा
            </Link>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/forts" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', color: '#374151', borderColor: '#D1D5DB', fontWeight: 700 }}>
                ३५०+ गड-किल्ले 🏰
              </Link>
              <Link to="/gallery" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', color: '#374151', borderColor: '#D1D5DB', fontWeight: 700 }}>
                छायाचित्र दालन 🖼️
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #C73800, #E65100)', color: '#fff', fontWeight: 700 }}>
                🚩 व्यासपीठावर सामील व्हा
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
