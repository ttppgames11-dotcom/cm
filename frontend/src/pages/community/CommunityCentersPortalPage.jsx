import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EVENTS_DATA = [
  {
    id: 'job-fair',
    title: 'मेगा जॉब फेयर (Mega Job Fair)',
    month: 'jul',
    monthLabel: 'जुलै',
    level: 'राज्य / जिल्हा',
    emoji: '💼',
    badge: 'रोजगार क्रांती',
    bg: '/images/maratha_job_fair.jpg',
    short: 'महाराष्ट्रातील हजारो सुशिक्षित तरुण-तरुणींना नामांकित MNC, बँकिंग व औद्योगिक आस्थापनांमध्ये थेट नोकरी देणारा महामेळावा.',
    details: {
      target: '१८-३५ वर्षे युवक-युवती (सर्व शैक्षणिक पात्रता)',
      duration: '२ पूर्ण दिवस (सकाळी ९ ते संध्याकाळी ६)',
      what: '५०+ आघाडीच्या कंपन्या, थेट एचआर मुलाखती (On-the-spot Interviews), बायोडाटा तपासणी, कौशल्य चाचणी आणि थेट निवड पत्र वाटप.',
      who: [
        '१०वी, १२वी, आयटीआय (ITI), पदविका (Polytechnic)',
        'बी.ए., बी.कॉम, बी.एस्सी, इंजिनिअरिंग (BE/BTech), एमसीए व एमबीए पदवीधर',
        'नवीन फ्रेशर्स व अनुभवी नोकरदार'
      ],
      benefits: 'मध्यस्थांशिवाय थेट नोकरी, उद्योग क्षेत्रातील तज्ज्ञांकडून मुलाखत तंत्र, करिअर समुपदेशन, पूर्णपणे मोफत प्रवेश व नोंदणी.',
      registration: 'ऑनलाइन किंवा कार्यक्रम स्थळी थेट मोफत नावनोंदणी. किमान ५ बायोडाटा प्रति, आधार कार्ड व शैक्षणिक कागदपत्रे आवश्यक.'
    }
  },
  {
    id: 'blood-donation',
    title: 'रक्तदान शिबिर व आरोग्य तपासणी (Blood Donation Camp)',
    month: 'aug',
    monthLabel: 'ऑगस्ट',
    level: 'जिल्हा / तालुका',
    emoji: '🩸',
    badge: 'जीवनदान सेवा',
    bg: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800&q=80',
    short: 'अखंड समाजसेवेचा संकल्प! शासकीय व नामांकित रक्तपेढ्यांच्या सहकार्याने आयोजित तालुका व जिल्हास्तरीय रक्तदान शिबिर.',
    details: {
      target: '१८-६० वर्षे निरोगी समाजबांधव',
      duration: '१ दिवस (सकाळी ८:३० ते दुपारी ३:३०)',
      what: 'प्रमाणित वैद्यकीय पथकाद्वारे रक्त संकलन, मोफत हिमोग्लोबिन, वजन, रक्तदाब तपासणी आणि रक्तदाता शासकीय प्रमाणपत्र वाटप.',
      who: [
        'किमान ४५ किलो वजन असलेले निरोगी स्त्री-पुरुष',
        'मागील ३ महिन्यांत रक्तदान न केलेले स्वयंसेवक'
      ],
      benefits: 'कुटुंबासाठी १ वर्ष मोफत रक्त उपलब्धता कार्ड, तत्काळ आरोग्य तपासणी, राष्ट्रसेवा आणि समाजाप्रती उत्तरदायित्व.',
      registration: 'शिबिर स्थळी त्वरित नोंदणी. सर्व रक्तदात्यांसाठी पौष्टिक नाश्ता, फळे व प्रमाणपत्र.'
    }
  },
  {
    id: 'matrimony',
    title: 'भव्य वैवाहिक वधू-वर परिचय मेळावा (Matrimony)',
    month: 'may',
    monthLabel: 'मे',
    level: 'राज्य / जिल्हा',
    emoji: '💍',
    badge: 'संस्कार व नातेसंबंध',
    bg: '/images/maratha_matrimony.jpg',
    short: 'मराठा समाजातील उच्चशिक्षित, व्यावसायिक व पुनर्विवाह इच्छुकांसाठी १००% पारदर्शक, विश्वासार्ह व कौटुंबिक परिचय मेळावा.',
    details: {
      target: 'विवाहयोग्य तरुण-तरुणी व त्यांचे पालक',
      duration: '१ पूर्ण दिवस (सकाळी ९ ते संध्याकाळी ७)',
      what: 'डिजिटल प्रोफाइल डिस्प्ले, थेट वधू-वर व पालक भेट, कुंडली जुळवणी कक्ष, स्वतंत्र समुपदेशन विभाग.',
      who: [
        'इंजिनिअर, डॉक्टर, सीए, शासकीय अधिकारी, उद्योजक व सर्व क्षेत्रांतील युवक-युवती',
        'पुनर्विवाह इच्छुक वधू-वर (स्वतंत्र समर्पित कक्ष)'
      ],
      benefits: 'दलालांशिवाय थेट सुसंस्कृत संवाद, वेळेची व पैशांची प्रचंड बचत, १००% पडताळणी केलेले बायोडाटा.',
      registration: 'पोर्टलवर आगाऊ नोंदणी अथवा स्थळावर प्रत्यक्ष बायोडाटा व २ छायाचित्रांसह नोंदणी.'
    }
  },
  {
    id: 'b2b-expo',
    title: 'मराठा B2B बिझनेस व इंडस्ट्रियल एक्स्पो',
    month: 'any',
    monthLabel: 'वर्षभर',
    level: 'राज्य / जिल्हा',
    emoji: '🤝',
    badge: 'उद्योग भरारी',
    bg: '/images/maratha_b2b.jpg',
    short: 'उद्योजक, उत्पादक, व्यापारी व स्टार्टअप्ससाठी भव्य नेटवर्किंग, भांडवल उभारणी, सरकारी सबसिडी व व्यावसायिक भागीदारी मंच.',
    details: {
      target: 'लघु, मध्यम व मोठे उद्योजक, व्यावसायिक व नवउद्योजक',
      duration: '३ दिवस भव्य प्रदर्शन',
      what: '१००+ औद्योगिक स्टॉल्स, व्हेंचर कॅपिटलिस्ट्स व बँकर्स मिट, बायर-सेलर मिट, सरकारी योजना व क्लस्टर मार्गदर्शन.',
      who: [
        'उत्पादक (Manufacturers), सेवा पुरवठादार, महिला उद्योजक',
        'नवीन फ्रँचायझी व वितरक शोधणारे व्यावसायिक'
      ],
      benefits: 'करोडो रुपयांचे व्यावसायिक करार, थेट नवीन ग्राहक वर्ग, राज्यस्तरीय नेटवर्किंग, ग्लोबल एक्सपोर्ट संधी.',
      registration: 'स्टॉलधारकांसाठी आगाऊ आरक्षण; व्यावसायिक अभ्यागतांसाठी मोफत डिजिटल व्हिजिटर पास.'
    }
  },
  {
    id: 'health-camp',
    title: 'सर्वोपचार मोफत महा-आरोग्य तपासणी शिबिर',
    month: 'dec',
    monthLabel: 'डिसेंबर',
    level: 'जिल्हा / तालुका',
    emoji: '🏥',
    badge: 'आरोग्य संपदा',
    bg: '/images/maratha_health.jpg',
    short: 'नावाजलेल्या सुपर-स्पेशालिटी हॉस्पिटलच्या तज्ज्ञ डॉक्टरांच्या उपस्थितीत मोफत तपासणी, औषधोपचार व शस्त्रक्रिया मार्गदर्शन.',
    details: {
      target: 'ग्रामीण व शहरी भागातील सर्व नागरिक व ज्येष्ठ',
      duration: '१ दिवस (सकाळी ९ ते संध्याकाळी ५)',
      what: 'ईसीजी (ECG), मधुमेह, उच्च रक्तदाब, नेत्रचिकित्सा, दंतचिकित्सा, हाडांची तपासणी आणि मोफत प्राथमिक औषधे.',
      who: [
        'सर्व सामान्य नागरिक (पूर्णतः विनामूल्य)',
        'महिला व बालकांसाठी स्वतंत्र स्त्रीरोग व बालरोग विभाग'
      ],
      benefits: 'गंभीर आजारांचे वेळेवर निदान, मोफत चष्मे वाटप, महात्मा जोतिराव फुले जनआरोग्य योजनेशी जोडणी.',
      registration: 'थेट शिबिर स्थळी विनामूल्य नोंदणी. मागील आजारांच्या फाईल्स सोबत आणाव्यात.'
    }
  },
  {
    id: 'women-empowerment',
    title: 'महिला स्वावलंबन व बचत गट महापरिषद',
    month: 'mar',
    monthLabel: 'मार्च',
    level: 'राज्य / जिल्हा',
    emoji: '👩💼',
    badge: 'स्त्री शक्ती',
    bg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    short: 'महिला उद्योजकता, गृहउद्योग ब्रँडिंग, बचत गट सबलीकरण आणि कायदेशीर हक्कांच्या जागृतीसाठी समर्पित राज्यव्यापी परिषद.',
    details: {
      target: 'सर्व महिला, बचत गट अध्यक्षा, गृहिणी व नवउद्योजक भगिनी',
      duration: '२ दिवस',
      what: 'अन्नप्रक्रिया व गृहउद्योग प्रशिक्षण, डिजिटल मार्केटिंग व पॅकेजिंग कार्यशाळा, मुद्रा लोन व शासकीय अनुदान सत्र.',
      who: [
        'महिला बचत गट सदस्य',
        'स्वतःचा व्यवसाय सुरू करू इच्छिणाऱ्या ग्रामीण व शहरी महिला'
      ],
      benefits: 'आर्थिक स्वातंत्र्य, नवीन बाजारपेठांची जोडणी, शून्य भांडवलात उद्योग सुरू करण्याचे कौशल्य.',
      registration: 'स्थानिक कम्युनिटी सेंटरमध्ये किंवा ऑनलाइन विनामूल्य नोंदणी.'
    }
  },
  {
    id: 'senior-citizen',
    title: 'ज्येष्ठ नागरिक सन्मान, पेन्शन व स्वास्थ्य शिबिर',
    month: 'nov',
    monthLabel: 'नोव्हेंबर',
    level: 'जिल्हा / तालुका',
    emoji: '👴',
    badge: 'वडिलधारे सन्मान',
    bg: 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=800&q=80',
    short: 'समाजाचा पाया असलेल्या ज्येष्ठ नागरिकांचा कृतज्ञता सत्कार, पेन्शन कायदेशीर समस्या निवारण व निरोगी दीर्घायुष्य मार्गदर्शन.',
    details: {
      target: '६० वर्षे व त्यापुढील सर्व ज्येष्ठ नागरिक',
      duration: '१ दिवस',
      what: 'विशेष आरोग्य व मोतीबिंदू तपासणी, शासकीय पेन्शन व वारस नोंदणी कायदेशीर सल्ला, योगा व जीवनशैली सत्र.',
      who: [
        'सर्व ज्येष्ठ माता-पिता व आजी-आजोबा',
        'कुटुंबीयांसह उपस्थिती स्वागतार्ह'
      ],
      benefits: 'तातडीने पेन्शन तक्रार निवारण, ज्येष्ठ नागरिक ओळखपत्र (Senior Card) बनवून देणे, सन्मानपूर्वक स्नेहभोजन.',
      registration: 'शिबिर स्थळी त्वरित मोफत नोंदणी.'
    }
  },
  {
    id: 'children-camp',
    title: 'बाल संस्कार, शिवकालीन युद्धकला व क्रीडा शिबिर',
    month: 'apr',
    monthLabel: 'एप्रिल',
    level: 'तालुका स्तर',
    emoji: '🧒',
    badge: 'भावी पिढी संस्कार',
    bg: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    short: 'मुलांमधील सुप्त कलागुणांना वाव देण्यासाठी लाठीकाठी, दांडपट्टा, वक्तृत्व, विज्ञान प्रयोग आणि इतिहास संस्कार शिबिर.',
    details: {
      target: '६ ते १५ वर्षे वयोगटातील मुले-मुली',
      duration: '३ दिवस निवासी / अनिवासी शिबिर',
      what: 'शिवकालीन मर्दानी खेळांचे प्रशिक्षण, वक्तृत्व व संवाद कला, विज्ञान मॉडेल मेकिंग, पर्यावरण व ट्रेकिंग ओळख.',
      who: [
        'शालेय विद्यार्थी व विद्यार्थिनी'
      ],
      benefits: 'मोबाईलचे व्यसन सुटून शारीरिक व मानसिक कणखरता, शिवकालीन शौर्याची जाणीव, नेतृत्वगुणांचा विकास.',
      registration: 'तालुका कम्युनिटी सेंटरमध्ये पालकांच्या संमतीने पूर्वनोंदणी.'
    }
  },
  {
    id: 'career-consultation',
    title: 'युवा करिअर समुपदेशन व दिशा-दर्शन परिषद',
    month: 'jan',
    monthLabel: 'जानेवारी',
    level: 'जिल्हा स्तर',
    emoji: '🎯',
    badge: 'ध्येयपूर्ती',
    bg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    short: '१०वी, १२वी व पदवीनंतर योग्य करिअर निवड कशी करावी? आयटी, एआय, संरक्षण दल आणि नवीन क्षेत्रांतील संधींचे मार्गदर्शन.',
    details: {
      target: '१५ ते २५ वर्षे युवक-युवती व पालक',
      duration: '१ दिवस',
      what: 'ॲप्टिट्यूड टेस्ट विश्लेषण, उच्च शिक्षणासाठी शिष्यवृत्ती व शैक्षणिक कर्ज सहाय्य कक्ष, नामांकित करिअर कौन्सिलर्सची व्याख्याने.',
      who: [
        '१०वी, १२वी, पदवी व पदविका विद्यार्थी आणि त्यांचे पालक'
      ],
      benefits: 'करिअरचा अचूक रोडमॅप, लाखो रुपयांची फी वाचवण्यासाठी शासकीय स्कॉलरशिप्सची संपूर्ण माहिती.',
      registration: 'पोर्टलवर किंवा कार्यक्रम स्थळी मोफत प्रवेश.'
    }
  },
  {
    id: 'mpsc-upsc',
    title: 'MPSC / UPSC व प्रशासकीय सेवा महामार्गदर्शन',
    month: 'jun',
    monthLabel: 'जून',
    level: 'राज्य / जिल्हा',
    emoji: '📚',
    badge: 'प्रशासक घडवा',
    bg: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    short: 'सध्या कार्यरत असलेले आयएएस, आयपीएस व उपजिल्हाधिकारी यांच्याकडून स्पर्धा परीक्षांची अचूक रणनीती व मोफत नोट्स किट.',
    details: {
      target: 'MPSC, UPSC, पोलीस भरती व बँकिंग परीक्षेचे उमेदवार',
      duration: '२ दिवस सखोल कार्यशाळा',
      what: 'अभ्यासक्रम विश्लेषण, नोट्स मेकिंग पद्धत, मुख्य परीक्षा उत्तर लेखन तंत्र, मुलाखतीची पूर्वतयारी व मॉक टेस्ट.',
      who: [
        'स्पर्धा परीक्षेची प्रामाणिक तयारी करणारे सर्व पदवीधर'
      ],
      benefits: 'अधिकारी पदावर बसलेल्या मान्यवरांचे थेट मार्गदर्शन, अभ्यासिका (Library) व ई-लर्निंग मटेरियलची मोफत सोय.',
      registration: 'पोर्टलवर आगाऊ नोंदणी अनिवार्य.'
    }
  },
  {
    id: 'shopping-mela',
    title: 'दिवाळी शॉपिंग मेळा – महिला बचत गट व कारागीर',
    month: 'oct',
    monthLabel: 'ऑक्टोबर',
    level: 'जिल्हा / तालुका',
    emoji: '🛍️',
    badge: 'स्थानिक स्वावलंबन',
    bg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    short: 'दिवाळीच्या पार्श्वभूमीवर अस्सल मराठमोळा फराळ, हस्तकला, पैठणी, मसाले व घरगुती सजावटीच्या वस्तूंचे भव्य प्रदर्शन.',
    details: {
      target: 'महिला बचत गट, शेतकरी कुटुंबे व सर्व नागरिक',
      duration: '३ दिवस भव्य बाजारपेठ',
      what: '५०+ स्टॉल्स, थेट ग्राहकांशी विक्री संवाद, डिजिटल पेमेंट सुविधा, चवदार खाद्यपदार्थ महोत्सव.',
      who: [
        'उत्पादन विक्रीसाठी नोंदणीकृत बचत गट व कारागीर',
        'खरेदीसाठी समस्त कुटुंब व नागरिक'
      ],
      benefits: 'बचत गटांच्या हाती थेट लाखो रुपयांचा नफा, मध्यस्थांशिवाय ग्राहकांना शुद्ध व दर्जेदार उत्पादने.',
      registration: 'स्टॉलसाठी १५ दिवस आधी अर्ज; ग्राहकांसाठी विनामूल्य प्रवेश.'
    }
  },
  {
    id: 'sanskrutik',
    title: 'सांस्कृतिक महोत्सव – मराठा गौरव महामेळावा',
    month: 'feb',
    monthLabel: 'फेब्रुवारी',
    level: 'राज्य / जिल्हा',
    emoji: '🎭',
    badge: 'अस्मिता व वारसा',
    bg: '/images/maratha_cultural_expo.jpg',
    short: 'शिवकालीन शौर्य, पोवाडे, मर्दानी खेळ, ऐतिहासिक महानाट्य आणि समाजातील विविध क्षेत्रांतील गुणवंतांचा भव्य राज्यस्तरीय गौरव.',
    details: {
      target: 'समस्त समाजबांधव व संपूर्ण कुटुंब',
      duration: '२ दिवस भव्य उत्सव',
      what: 'ढोल-ताशा पथके, शाहीर परिषदेचे शाहिरी पोवाडे, शिवकालीन शस्त्र प्रदर्शन, ऐतिहासिक महानाट्य व गौरव सोहळा.',
      who: [
        'सर्व आबालवृद्ध, शिवभक्त व संस्कृतीप्रेमी बांधव'
      ],
      benefits: 'छत्रपती शिवाजी महाराजांच्या विचारांचे पुनरुज्जीवन, भावी पिढीला स्वाभिमानाची शिकवण, अभूतपूर्व सामाजिक एकात्मता.',
      registration: 'सर्वांसाठी खुला व मोफत प्रवेश.'
    }
  },
  {
    id: 'convention',
    title: 'वार्षिक राज्य महाअधिवेशन व रणनीती परिषद',
    month: 'any',
    monthLabel: 'वर्षातून एकदा',
    level: 'राज्य स्तर',
    emoji: '📋',
    badge: 'सर्वोच्च धोरण',
    bg: '/images/community_hero_white_orange.jpg',
    short: 'संघटनात्मक प्रगतीचा वार्षिक लेखाजोखा, आगामी वर्षाचा कृती आराखडा, सामाजिक ठराव व राज्यस्तरीय पदाधिकारी संमेलन.',
    details: {
      target: 'राज्य, विभाग, जिल्हा व तालुका स्तरावरील सर्व पदाधिकारी',
      duration: '३ दिवस निवासी महाअधिवेशन',
      what: 'मागील कामांचा आढावा, धोरणात्मक ठराव मंजुरी, कम्युनिटी सेंटर्सचे वार्षिक नियोजन व नेतृत्व प्रशिक्षण.',
      who: [
        'सर्व नियुक्त कम्युनिटी सेंटर प्रमुख व अधिकृत प्रतिनिधी'
      ],
      benefits: 'संघटनात्मक एकजूट, प्रत्येक तालुक्याच्या समस्यांचे उच्च पातळीवर निवारण, भविष्यातील महाप्रकल्पांची आखणी.',
      registration: 'अधिकृत निमंत्रित प्रतिनिधींसाठीच राखीव.'
    }
  },
  {
    id: 'krishi',
    title: 'कृषी महापरिषद, आधुनिक ॲग्रो तंत्रज्ञान व शेतकरी मेळावा',
    month: 'any',
    monthLabel: 'हंगामानुसार',
    level: 'जिल्हा स्तर',
    emoji: '🌾',
    badge: 'बळीराजा सन्मान',
    bg: 'https://images.unsplash.com/photo-1500937386664-56d7fcb7e0e2?w=800&q=80',
    short: 'कमी खर्चात भरघोस उत्पन्न देणारे आधुनिक कृषी तंत्रज्ञान, ठिबक सिंचन, ड्रोन फवारणी, प्रक्रिया उद्योग व शेतमाल निर्यात मार्गदर्शन.',
    details: {
      target: 'शेतकरी बांधव, बागायतदार, ॲग्रो-स्टार्टअप्स व कृषी पदवीधर',
      duration: '२ ते ३ दिवस',
      what: 'आधुनिक यंत्रसामग्री प्रात्यक्षिके, सेंद्रिय खते व दर्जेदार बियाणे स्टॉल्स, कृषी शास्त्रज्ञांचे थेट चर्चासत्र, निर्यात संधी.',
      who: [
        'सर्व लहान व मोठे शेतकरी, प्रक्रिया व्यावसायिक'
      ],
      benefits: 'शेतीमधील उत्पादन खर्चात मोठी बचत, दलालांशिवाय थेट ग्राहक व निर्यातदार जोडणी, शासकीय अनुदानांची माहिती.',
      registration: 'शेतकऱ्यांसाठी मोफत प्रवेश; कंपन्यांसाठी स्टॉल बुकिंग.'
    }
  },
  {
    id: 'local-food',
    title: 'पारंपरिक स्थानिक खाद्य महोत्सव व पाककला स्पर्धा',
    month: 'any',
    monthLabel: 'वर्षभर',
    level: 'तालुका / जिल्हा',
    emoji: '🍛',
    badge: 'अस्सल मेजवानी',
    bg: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80',
    short: 'अस्सल मराठमोळ्या चुलीवरच्या पारंपरिक खाद्यसंस्कृतीचा उत्सव. ग्रामीण महिलांना व्यासपीठ व खवय्यांसाठी स्वादिष्ट मेजवानी.',
    details: {
      target: 'सर्व खवय्ये, कुटुंबे आणि ग्रामीण सुगरण भगिनी',
      duration: '२ दिवस खाद्य महोत्सव',
      what: 'ज्वारी-बाजरी भाकरी, पिठलं, मटण रस्सा, पुरणपोळी, मांडे, घावणे व दुर्मिळ पारंपरिक पदार्थांचे थेट ताजे स्टॉल्स व स्पर्धा.',
      who: [
        'स्थानिक महिला स्वयंपाकी, बचत गट (स्टॉलसाठी)',
        'सर्व खाद्यप्रेमी नागरिक'
      ],
      benefits: 'स्थानिक भगिनींना थेट रोख नफा व सन्मान, मराठमोळ्या समृद्ध खाद्यपरंपरेचे जतन व पर्यटन वृद्धी.',
      registration: 'स्टॉल व स्पर्धेसाठी नाममात्र शुल्कात पूर्वनोंदणी; अभ्यागतांसाठी मोफत प्रवेश.'
    }
  }
];

const MONTHS = [
  { key: 'jan', label: 'जाने' },
  { key: 'feb', label: 'फेब्रु' },
  { key: 'mar', label: 'मार्च' },
  { key: 'apr', label: 'एप्रि' },
  { key: 'may', label: 'मे' },
  { key: 'jun', label: 'जून' },
  { key: 'jul', label: 'जुलै' },
  { key: 'aug', label: 'ऑग' },
  { key: 'sep', label: 'सप्टें' },
  { key: 'oct', label: 'ऑक्टो' },
  { key: 'nov', label: 'नोव्हें' },
  { key: 'dec', label: 'डिसें' },
];

const LEVEL_FILTERS = [
  { key: 'all', label: 'सर्व स्तर' },
  { key: 'राज्य', label: 'राज्य' },
  { key: 'जिल्हा', label: 'जिल्हा' },
  { key: 'तालुका', label: 'तालुका' },
];


const SERVICES = [
  {
    icon: '🏛️',
    title: 'शासकीय योजना मार्गदर्शन',
    image: '/images/service_govt_schemes.jpg',
    desc: 'जात प्रमाणपत्र, नॉन-क्रिमिलेअर, सारथी व अण्णासाहेब पाटील महामंडळ कर्ज योजनांचे मोफत अर्ज सहाय्य.',
    tags: ['सारथी', 'EWS / SEBC', 'महामंडळ कर्ज'],
  },
  {
    icon: '📚',
    title: 'अभ्यासिका व स्पर्धा परीक्षा',
    image: '/images/service_library_study.jpg',
    desc: 'शांत अभ्यासिका, मोफत वाय-फाय, चालू घडामोडी संदर्भ ग्रंथ आणि MPSC/UPSC सराव चाचण्या.',
    tags: ['लायब्ररी', 'मॉक टेस्ट', 'ई-लर्निंग'],
  },
  {
    icon: '💼',
    title: 'रोजगार व कौशल्य विकास',
    image: '/images/maratha_job_fair.jpg',
    desc: 'जॉब फेयर, बायोडाटा कार्यशाळा, मुलाखत तयारी आणि अल्पमुदतीचे कौशल्य प्रशिक्षण अभ्यासक्रम.',
    tags: ['जॉब फेयर', 'प्रशिक्षण', 'करिअर सल्ला'],
  },
  {
    icon: '🤝',
    title: 'उद्योजकता व B2B नेटवर्क',
    image: '/images/maratha_b2b.jpg',
    desc: 'नवउद्योजकांना मार्गदर्शक, बँक कर्ज प्रस्ताव तयारी, बायर-सेलर मिट आणि व्यावसायिक भागीदारी.',
    tags: ['स्टार्टअप', 'मुद्रा लोन', 'एक्स्पो'],
  },
  {
    icon: '🩺',
    title: 'आरोग्य व आपत्कालीन मदत',
    image: '/images/maratha_health.jpg',
    desc: 'रक्तदाता नेटवर्क, रुग्णवाहिका समन्वय, हॉस्पिटल उपचार मार्गदर्शन व जनआरोग्य योजनेशी जोडणी.',
    tags: ['रक्तदान', 'रुग्णवाहिका', 'जनआरोग्य'],
  },
  {
    icon: '⚖️',
    title: 'कायदेशीर सल्ला केंद्र',
    image: '/images/service_legal_aid.jpg',
    desc: 'जमीन, वारस नोंदणी, कौटुंबिक व पेन्शन विषयक प्रश्नांवर स्वयंसेवी वकिलांकडून प्राथमिक सल्ला.',
    tags: ['वारस नोंद', 'पेन्शन', 'जमीन'],
  },
  {
    icon: '👩‍💼',
    title: 'महिला सबलीकरण कक्ष',
    image: '/images/service_women_shg.jpg',
    desc: 'बचत गट नोंदणी, गृहउद्योग प्रशिक्षण, उत्पादन ब्रँडिंग व विक्रीसाठी बाजारपेठ उपलब्धता.',
    tags: ['बचत गट', 'गृहउद्योग', 'ब्रँडिंग'],
  },
  {
    icon: '💍',
    title: 'वधू-वर सूचक केंद्र',
    image: '/images/maratha_matrimony.jpg',
    desc: 'पडताळणी केलेले बायोडाटा, पालक भेट व्यवस्था आणि पुनर्विवाह इच्छुकांसाठी स्वतंत्र कक्ष.',
    tags: ['पडताळणी', 'परिचय मेळावा', 'समुपदेशन'],
  },
];

const NETWORK_TIERS = [
  {
    icon: '🚩',
    title: 'राज्य मुख्यालय',
    sub: 'State HQ',
    points: ['वार्षिक महाअधिवेशन व धोरण ठराव', 'शासन स्तरावर पाठपुरावा', 'राज्यव्यापी प्रकल्प नियंत्रण'],
  },
  {
    icon: '🗺️',
    title: 'विभागीय केंद्र',
    sub: '६ विभाग',
    points: ['जिल्ह्यांमध्ये समन्वय', 'विभागीय एक्स्पो व परिषदा', 'कामगिरी आढावा व प्रशिक्षण'],
  },
  {
    icon: '📍',
    title: 'जिल्हा केंद्र',
    sub: '३६ जिल्हे',
    points: ['जॉब फेयर व आरोग्य शिबिरे', 'वधू-वर मेळावे', 'स्पर्धा परीक्षा मार्गदर्शन'],
  },
  {
    icon: '🏡',
    title: 'तालुका व गाव केंद्र',
    sub: '३५८ तालुके',
    points: ['दैनंदिन नागरिक सेवा', 'रक्तदान व बाल संस्कार शिबिरे', 'बचत गट जत्रा व खाद्य महोत्सव'],
  },
];

const DIVISIONS = ['कोकण', 'पुणे', 'नाशिक', 'छत्रपती संभाजीनगर', 'अमरावती', 'नागपूर'];

const FACILITIES = [
  { icon: '📖', label: 'वातानुकूलित अभ्यासिका' },
  { icon: '💻', label: 'संगणक व इंटरनेट कक्ष' },
  { icon: '🎤', label: 'सभागृह / कार्यक्रम हॉल' },
  { icon: '🗣️', label: 'समुपदेशन कक्ष' },
  { icon: '📝', label: 'अर्ज सहाय्य खिडकी' },
  { icon: '🩸', label: 'रक्तदाता नोंदणी डेस्क' },
  { icon: '🧘', label: 'योग व व्यायाम जागा' },
  { icon: '🛍️', label: 'बचत गट विक्री दालन' },
];

const STEPS = [
  { n: '१', title: 'ऑनलाइन नोंदणी', desc: 'पोर्टलवर मोफत सभासद नोंदणी करा आणि आपला सदस्य क्रमांक मिळवा.' },
  { n: '२', title: 'जवळचे केंद्र निवडा', desc: 'आपल्या तालुका किंवा जिल्हा कम्युनिटी सेंटरशी संपर्क साधा.' },
  { n: '३', title: 'सेवा / कार्यक्रम निवडा', desc: 'आवश्यक सेवा किंवा आगामी उपक्रम निवडून कागदपत्रे सादर करा.' },
  { n: '४', title: 'सहभाग व पाठपुरावा', desc: 'केंद्र प्रतिनिधी आपल्या अर्जाचा व सहभागाचा पाठपुरावा करतील.' },
];

const DOCUMENTS = ['आधार कार्ड', 'पासपोर्ट आकाराचे २ फोटो', 'रहिवासी दाखला', 'शैक्षणिक प्रमाणपत्रे (लागू असल्यास)', 'उत्पन्न दाखला (योजनांसाठी)'];

const ROLES = [
  {
    icon: '🙋',
    title: 'स्वयंसेवक व्हा',
    desc: 'शिबिरे, मेळावे व दैनंदिन सेवेत आठवड्यातून काही तास द्या आणि समाजकार्याचा अनुभव मिळवा.',
    to: '/register',
    cta: 'स्वयंसेवक नोंदणी',
  },
  {
    icon: '🏢',
    title: 'केंद्र सुरू करा',
    desc: 'आपल्या तालुक्यात अद्याप केंद्र नसल्यास जागा, टीम व आराखड्यासह केंद्र प्रमुख म्हणून अर्ज करा.',
    to: '/contact',
    cta: 'केंद्रासाठी अर्ज',
  },
  {
    icon: '🎗️',
    title: 'प्रायोजक / सहयोगी',
    desc: 'उद्योजक, संस्था व हॉस्पिटल्स यांनी शिबिरे, शिष्यवृत्ती किंवा अभ्यासिकेसाठी सहयोग करावा.',
    to: '/contact',
    cta: 'सहयोगासाठी संपर्क',
  },
];

const FAQS = [
  {
    q: 'कम्युनिटी सेंटरच्या सेवा मोफत आहेत का?',
    a: 'होय. मार्गदर्शन, अर्ज सहाय्य, अभ्यासिका व बहुतांश शिबिरे पूर्णपणे मोफत आहेत. काही प्रदर्शनांतील स्टॉल्ससाठी नाममात्र शुल्क असू शकते.',
  },
  {
    q: 'सेवा घेण्यासाठी सभासद असणे आवश्यक आहे का?',
    a: 'आरोग्य शिबिरे व सांस्कृतिक कार्यक्रम सर्वांसाठी खुले आहेत. योजना अर्ज, अभ्यासिका व वधू-वर सूचक सेवेसाठी मोफत सभासद नोंदणी आवश्यक आहे.',
  },
  {
    q: 'माझ्या तालुक्यातील केंद्र कसे शोधावे?',
    a: 'संपर्क पृष्ठावर आपला जिल्हा व तालुका कळवा; आमची टीम जवळच्या केंद्र प्रमुखांची माहिती आपल्याला देईल.',
  },
  {
    q: 'कार्यक्रमांच्या तारखा कुठे जाहीर होतात?',
    a: 'प्रत्येक उपक्रमाचा महिना या पृष्ठावरील वार्षिक कॅलेंडरमध्ये दिला आहे. अचूक तारीख व ठिकाण स्थानिक केंद्र व बातम्या विभागात जाहीर केले जाते.',
  },
  {
    q: 'आमच्या गावात कार्यक्रम आयोजित करता येईल का?',
    a: 'होय. ग्रामपंचायत, शाळा किंवा स्थानिक मंडळ यांच्या सहकार्याने तालुका केंद्रामार्फत कोणताही उपक्रम आयोजित करता येतो.',
  },
];

const STATS = [
  { value: 6, label: 'प्रशासकीय विभाग', icon: '🗺️' },
  { value: 36, label: 'जिल्हा केंद्रे', icon: '📍' },
  { value: 358, label: 'तालुका केंद्रे', icon: '🏡' },
  { value: 15, label: 'वार्षिक महा-उपक्रम', icon: '🚩' },
];

const NEEDS = [
  {
    key: 'job', icon: '💼', label: 'मला नोकरी हवी',
    service: 'रोजगार व कौशल्य विकास',
    image: '/images/need_job_service.jpg',
    line: 'बायोडाटा तपासणी, मुलाखतीची तयारी आणि थेट कंपन्यांशी भेट — सर्व एकाच केंद्रात.',
    events: ['job-fair', 'career-consultation', 'mpsc-upsc'],
  },
  {
    key: 'health', icon: '🩺', label: 'आरोग्य मदत हवी',
    service: 'आरोग्य व आपत्कालीन मदत',
    image: '/images/need_health_service.jpg',
    line: 'रक्तदाता नेटवर्क, रुग्णवाहिका समन्वय आणि जनआरोग्य योजनेशी जोडणी.',
    events: ['health-camp', 'blood-donation', 'senior-citizen'],
  },
  {
    key: 'biz', icon: '🏭', label: 'व्यवसाय सुरू करायचा',
    service: 'उद्योजकता व B2B नेटवर्क',
    image: '/images/need_biz_service.jpg',
    line: 'कर्ज प्रस्ताव तयारी, बायर-सेलर भेटी आणि अनुभवी उद्योजकांचे मार्गदर्शन.',
    events: ['b2b-expo', 'shopping-mela', 'women-empowerment'],
  },
  {
    key: 'farm', icon: '🌾', label: 'शेतीसाठी मार्गदर्शन',
    service: 'शासकीय योजना मार्गदर्शन',
    image: '/images/need_biz_service.jpg',
    line: 'अनुदान माहिती, आधुनिक तंत्रज्ञान आणि थेट ग्राहक/निर्यातदार जोडणी.',
    events: ['krishi', 'local-food'],
  },
  {
    key: 'study', icon: '🎓', label: 'शिक्षण व स्पर्धा परीक्षा',
    service: 'अभ्यासिका व स्पर्धा परीक्षा',
    image: '/images/maratha_job_fair.jpg',
    line: 'शांत अभ्यासिका, मोफत इंटरनेट, शिष्यवृत्ती माहिती आणि मॉक टेस्ट.',
    events: ['mpsc-upsc', 'career-consultation', 'children-camp'],
  },
  {
    key: 'family', icon: '💍', label: 'विवाह / कुटुंब',
    service: 'वधू-वर सूचक केंद्र',
    image: '/images/maratha_matrimony.jpg',
    line: 'पडताळणी केलेले बायोडाटा, पालक भेट आणि पुनर्विवाहासाठी स्वतंत्र कक्ष.',
    events: ['matrimony', 'sanskrutik', 'women-empowerment'],
  },
];

const DAY_PLAN = [
  { time: '७:०० सकाळ', icon: '📖', title: 'अभ्यासिका उघडते', desc: 'स्पर्धा परीक्षेचे विद्यार्थी शांत वातावरणात दिवसाची सुरुवात करतात.' },
  { time: '९:०० सकाळ', icon: '🪑', title: 'अर्ज सहाय्य खिडकी', desc: 'जात, उत्पन्न व योजना अर्जांसाठी स्वयंसेवक मार्गदर्शन करतात.' },
  { time: '११:०० सकाळ', icon: '🗣️', title: 'समुपदेशन सत्र', desc: 'करिअर, कायदेशीर व कौटुंबिक विषयांवर भेटीची वेळ घेऊन चर्चा.' },
  { time: '२:०० दुपार', icon: '👩‍🍳', title: 'बचत गट कार्यशाळा', desc: 'गृहउद्योग प्रशिक्षण, पॅकेजिंग आणि विक्री मार्गदर्शन.' },
  { time: '५:०० संध्याकाळ', icon: '🤝', title: 'उद्योजक भेट', desc: 'स्थानिक व्यावसायिक नेटवर्किंग आणि नवउद्योजकांना सल्ला.' },
  { time: '७:०० रात्र', icon: '🌙', title: 'अभ्यासिका (रात्र सत्र)', desc: 'केंद्र बंद होते; अभ्यासिका १०:०० पर्यंत सुरू राहते.' },
];

const WARLI_ARMS = {
  down: 'M-5 -9 L-13 -3 M5 -9 L13 -3',
  up: 'M-5 -9 L-12 -18 M5 -9 L12 -18',
  side: 'M-5 -9 L-14 -9 M5 -9 L14 -9',
};

// A Warli figure: round head, two triangles meeting at the waist, stick limbs
function WarliFig({ x, y, s = 1, r = 0, pose = 'down', className }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <circle cx="0" cy="-15" r="3.2" fill="currentColor" stroke="none" />
      <path d="M-6 -10 L6 -10 L0 0 Z M-6 11 L6 11 L0 0 Z" fill="currentColor" stroke="none" />
      <path d={WARLI_ARMS[pose]} />
      <path d="M-3 11 L-5 20 M3 11 L5 20" />
    </g>
  );
}

// Dancers in a ring, heads outward, as in the tarpa circle dance
function WarliRing({ cx, cy, R, n, s, pose = 'side', className }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * 360;
        const rad = (a * Math.PI) / 180;
        return <WarliFig key={i} className={className} x={cx + R * Math.cos(rad)} y={cy + R * Math.sin(rad)} s={s} r={a + 90} pose={pose} />;
      })}
    </>
  );
}

function WarliInk({ children, width = 1.8 }) {
  return (
    <g stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {children}
    </g>
  );
}

const IMG_DIR = '/images/community-events';
const HERO_IMG = { id: 'hero', bg: '/images/community_hero_white_orange.jpg', title: 'मराठा कम्युनिटी सेंटर महासंमेलन' };
// Full-bleed hero background: drop an AI image at IMG_DIR/hero-bg.jpg to replace the fallback
const HERO_BG = { id: 'hero-bg', bg: '/images/community_hero.jpg', title: '' };

// Shows an AI-generated image dropped in IMG_DIR/<id>.jpg, else falls back to the existing photo. No overlays.
function EventImage({ evt, className = '' }) {
  const own = `${IMG_DIR}/${evt.id}.jpg`;
  const [src, setSrc] = useState(own);
  return (
    <img
      className={`ccp-img ${className}`}
      src={src}
      alt={evt.title}
      loading="lazy"
      onError={() => { if (src !== evt.bg) setSrc(evt.bg); }}
    />
  );
}

function CountUp({ to }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setVal(to);
      return undefined;
    }
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1400, 1);
        setVal(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);

  return <span ref={ref}>{new Intl.NumberFormat('mr-IN-u-nu-deva').format(val)}</span>;
}

const MONTH_KEYS = MONTHS.map((m) => m.key);

function matchesLevel(evt, level) {
  return level === 'all' || evt.level.includes(level);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;500;600;700;800&display=swap');

.ccp-root {
  --ccp-madder: #B93807;
  --ccp-clay: #7C2D12;
  --ccp-saffron: #C2410C;
  --ccp-saffron-2: #EA580C;
  --ccp-gold: #D97706;
  --ccp-indigo: #9A3412;
  --ccp-wash: #FFF7ED;
  --ccp-line: #FDBA74;
  --ccp-ink: #0F172A;
  --ccp-text: #1E293B;
  --ccp-muted: #475569;
  --ccp-display: 'Rozha One', 'Noto Serif Devanagari', serif;
  background: #fff;
  color: var(--ccp-ink);
  min-height: 100vh;
  font-family: 'Mukta', 'Noto Sans Devanagari', -apple-system, sans-serif;
  overflow-x: hidden;
}
.ccp-root *, .ccp-root *::before, .ccp-root *::after { box-sizing: border-box; }
.ccp-root :focus-visible { outline: 3px solid var(--ccp-gold); outline-offset: 3px; }
.ccp-root :is(h1, h2, h3, h4) { font-family: var(--ccp-display); font-weight: 700; color: #0F172A; }
.ccp-wrap { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
.ccp-section { padding: 92px 0; scroll-margin-top: 80px; }

.ccp-progress { position: fixed; top: 0; left: 0; right: 0; height: 4px; z-index: 9999; pointer-events: none; transform: scaleX(0); transform-origin: left; background: linear-gradient(90deg, var(--ccp-saffron), var(--ccp-gold), var(--ccp-saffron)); }

/* Section heads: a tiny Warli dancer leads each eyebrow */
.ccp-eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #C2410C; font-size: 1rem; font-weight: 800; }
.ccp-eyebrow::before {
  content: ''; width: 16px; height: 26px; flex-shrink: 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='26' viewBox='-8 -18 16 40'><g fill='%23C2410C'><circle cx='0' cy='-15' r='3.2'/><path d='M-6 -10 L6 -10 L0 0Z M-6 11 L6 11 L0 0Z'/></g><path d='M-5 -9 L-12 -17 M5 -9 L12 -17 M-3 11 L-5 20 M3 11 L5 20' stroke='%23C2410C' stroke-width='1.6' stroke-linecap='round'/></svg>") center / contain no-repeat;
}
.ccp-h2 { font-size: clamp(1.9rem, 3.5vw, 2.8rem); line-height: 1.3; margin: 8px 0 12px; color: #0F172A; font-weight: 800; }
.ccp-lead { color: #334155; font-size: 1.1rem; line-height: 1.75; max-width: 640px; margin: 0; font-weight: 500; }
.ccp-head { margin-bottom: 46px; }
.ccp-head.center { text-align: center; }
.ccp-head.center .ccp-lead { margin: 0 auto; }

.ccp-btn { display: inline-flex; align-items: center; gap: 10px; border-radius: 999px; font-weight: 700; font-size: 1.02rem; padding: 14px 30px; text-decoration: none; cursor: pointer; border: 2px solid transparent; transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease; font-family: inherit; }
.ccp-btn-primary { background: linear-gradient(135deg, var(--ccp-saffron), var(--ccp-saffron-2)); color: #fff !important; box-shadow: 0 10px 24px rgba(234,88,12,.32); }
.ccp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(234,88,12,.42); }
.ccp-btn-ghost { background: #fff; color: #C2410C !important; border-color: var(--ccp-line); font-weight: 700; }
.ccp-btn-ghost:hover { border-color: var(--ccp-saffron-2); background: var(--ccp-wash); }
.ccp-btn-white { background: #fff; color: #C2410C !important; font-weight: 700; }
.ccp-btn-white:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.25); }
.ccp-btn-outline-light { color: #fff !important; border-color: rgba(255,255,255,.8); background: transparent; font-weight: 700; }
.ccp-btn-outline-light:hover { background: rgba(255,255,255,.15); }
.ccp-btn-sm { padding: 10px 20px; font-size: .94rem; }

/* ===== HERO: red-earth ground, Warli dancers around the photograph ===== */
.ccp-hero {
  position: relative; overflow: hidden; color: #FFF1DC; padding: 76px 0 104px;
  background: radial-gradient(900px 560px at 78% 48%, #FF8A2A 0%, transparent 62%), linear-gradient(180deg, #E8650A 0%, #F97316 100%);
}
.ccp-hero-bg { position: absolute; inset: 0; z-index: 0; }
.ccp-hero-bg .ccp-img { transform: none !important; }
.ccp-hero-grid { z-index: 1; }
.ccp-hero-panel { background: rgba(214,84,8,.86); backdrop-filter: blur(10px); border: 1px solid rgba(245,181,60,.4); border-radius: 30px; padding: 32px 30px 30px; box-shadow: 0 30px 70px rgba(0,0,0,.4); }
.ccp-hero-panel h1 { margin-top: 20px; }
.ccp-blob { display: none; }
.ccp-blob.b1 { width: 360px; height: 360px; background: rgba(245,181,60,.28); left: -120px; top: -100px; }
.ccp-blob.b2 { width: 320px; height: 320px; background: rgba(234,88,12,.35); right: 4%; bottom: -140px; }
.ccp-hero-grid { position: relative; display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 48px; align-items: center; }
.ccp-chip { display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,227,176,.35); color: #FFF3E3; padding: 7px 16px; border-radius: 999px; font-size: .92rem; font-weight: 600; }
.ccp-chip-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 0 4px rgba(74,222,128,.2); }
.ccp-hero h1 {
  font-size: clamp(2rem, 3.6vw, 3.3rem); line-height: 1.25; margin: 24px 0 20px;
  background: linear-gradient(100deg, #FFFFFF 0%, #FFE9C7 25%, #FFFFFF 50%, #FFE9C7 75%, #FFFFFF 100%); background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.ccp-hero-lead { font-size: 1.08rem; color: #FFF3E3; line-height: 1.85; margin: 0 0 32px; max-width: 540px; }
.ccp-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
.ccp-hero .ccp-btn-ghost { background: transparent; color: #FFE8CC !important; border-color: rgba(255,232,204,.4); }
.ccp-hero .ccp-btn-ghost:hover { background: rgba(255,255,255,.1); border-color: #FFE8CC; }
.ccp-hero-trust { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-top: 30px; color: #F3D9C0; font-size: .98rem; font-weight: 600; }
.ccp-hero-trust span { display: inline-flex; align-items: center; gap: 8px; }
.ccp-hero-trust span::before { content: '✓'; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: rgba(245,181,60,.2); color: var(--ccp-gold); font-size: .75rem; font-weight: 900; }

.ccp-hero-visual { position: relative; }
.ccp-collage { position: relative; width: 100%; max-width: 540px; margin-left: auto; aspect-ratio: 1; }
.ccp-ring { position: absolute; inset: 0; width: 100%; height: 100%; color: #FFE3B0; overflow: visible; }
.ccp-collage-main { position: absolute; left: 20%; top: 20%; width: 60%; height: 60%; border-radius: 50%; overflow: hidden; border: 5px solid var(--ccp-gold); box-shadow: 0 0 0 12px rgba(245,181,60,.16), 0 30px 70px rgba(0,0,0,.5); }
.ccp-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ccp-collage-poster { position: absolute; width: 150px; z-index: 3; transition: transform .4s cubic-bezier(.16,1,.3,1); }
.ccp-collage-poster.a { left: -34px; bottom: -22px; transform: rotate(-7deg); }
.ccp-collage-poster.b { right: -20px; top: -24px; width: 134px; transform: rotate(8deg); }
.ccp-collage-poster:hover { transform: rotate(0) scale(1.06); z-index: 5; }
.ccp-float { position: absolute; z-index: 4; background: #FFF8EE; color: var(--ccp-ink); border-radius: 18px; padding: 12px 16px; box-shadow: 0 18px 40px rgba(0,0,0,.35); display: flex; align-items: center; gap: 12px; border: 2px solid var(--ccp-gold); }
.ccp-float b { display: block; font-size: 1rem; }
.ccp-float small { color: var(--ccp-muted); font-size: .82rem; font-weight: 600; }
.ccp-float-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-size: 21px; background: var(--ccp-wash); }
.ccp-float.one { top: 40px; left: -28px; }
.ccp-float.two { bottom: 52px; right: -22px; }

/* Paithani border: indigo ground, gold lozenge, madder core */
.ccp-paithani {
  height: 34px; background-color: var(--ccp-indigo);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='34'><rect width='56' height='34' fill='%23E8650A'/><path d='M0 2H56M0 32H56' stroke='%23F5B53C' stroke-width='1.2'/><path d='M28 4 L44 17 L28 30 L12 17Z' fill='none' stroke='%23F5B53C' stroke-width='1.6'/><path d='M28 10 L37 17 L28 24 L19 17Z' fill='%23B8321F'/><circle cx='28' cy='17' r='2.2' fill='%23F5B53C'/><circle cx='0' cy='17' r='2' fill='%23F5B53C'/><circle cx='56' cy='17' r='2' fill='%23F5B53C'/></svg>");
  background-size: 56px 34px;
}

/* Ticker */
.ccp-ticker { background: #C2410C; color: #fff; overflow: hidden; }
.ccp-ticker-track { display: flex; width: max-content; gap: 44px; padding: 13px 44px 13px 0; will-change: transform; }
.ccp-ticker-item { display: inline-flex; align-items: center; gap: 10px; font-size: .98rem; font-weight: 600; white-space: nowrap; }
.ccp-ticker-item b { color: var(--ccp-gold); font-weight: 800; }
.ccp-ticker-item::after { content: '🚩'; margin-left: 34px; font-size: .8rem; opacity: .7; }

/* Stats */
.ccp-stats { position: relative; z-index: 2; margin-top: 44px; display: grid; grid-template-columns: repeat(4, 1fr); background: #fff; border: 2px solid var(--ccp-line); border-radius: 26px; box-shadow: 0 20px 50px rgba(79,25,14,.1); overflow: hidden; }
.ccp-stat { padding: 26px 22px; display: flex; align-items: center; gap: 16px; }
.ccp-stat + .ccp-stat { border-left: 2px dashed var(--ccp-line); }
.ccp-stat-icon { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 24px; background: var(--ccp-wash); flex-shrink: 0; }
.ccp-stat-value { font-family: var(--ccp-display); font-size: 2.3rem; line-height: 1; color: var(--ccp-clay); }
.ccp-stat-label { font-size: .95rem; color: var(--ccp-muted); font-weight: 600; margin-top: 4px; }
.ccp-quicknav { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 30px; }
.ccp-quicknav a { text-decoration: none; color: var(--ccp-text); font-weight: 600; font-size: .95rem; padding: 7px 16px; border-radius: 999px; background: var(--ccp-wash); border: 1px solid var(--ccp-line); transition: color .2s, border-color .2s; }
.ccp-quicknav a:hover { color: var(--ccp-saffron); border-color: var(--ccp-saffron-2); }

.ccp-finder { position: relative; border-radius: 34px; padding: 46px 40px; overflow: hidden; background-color: #FFF3E2; border: 2px solid var(--ccp-line);
  background-image: linear-gradient(135deg, rgba(255, 248, 238, 0.72) 0%, rgba(255, 235, 210, 0.6) 100%), url('/images/finder_maratha_bg.jpg');
  background-size: cover; background-position: center; }
.ccp-needs { display: flex; flex-wrap: wrap; gap: 12px; margin: 26px 0 28px; }
.ccp-need { display: inline-flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 999px; cursor: pointer; background: #fff; border: 2px solid var(--ccp-line); color: var(--ccp-text); font-weight: 700; font-size: 1.02rem; font-family: inherit; transition: transform .25s cubic-bezier(.16,1,.3,1), border-color .2s, background .2s; }
.ccp-need span:first-child { font-size: 1.3rem; }
.ccp-need:hover { transform: translateY(-3px); border-color: var(--ccp-saffron-2); }
.ccp-need.active { background: var(--ccp-madder); border-color: var(--ccp-madder); color: #FFE8CC; box-shadow: 0 12px 26px rgba(79,25,14,.35); }
.ccp-need-result { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; animation: ccpRise .35s cubic-bezier(.16,1,.3,1); }
.ccp-need-service { background: #fff; border-radius: 22px; padding: 26px; border: 2px solid var(--ccp-line); }
.ccp-need-service small { color: var(--ccp-saffron); font-weight: 700; font-size: .9rem; }
.ccp-need-service h3 { margin: 6px 0 10px; font-size: 1.4rem; }
.ccp-need-service p { margin: 0 0 20px; color: var(--ccp-text); line-height: 1.75; font-size: 1.02rem; }
.ccp-need-events { display: grid; gap: 12px; align-content: start; }
.ccp-need-evt { display: flex; align-items: center; gap: 14px; text-align: left; width: 100%; cursor: pointer; font-family: inherit; background: #fff; border: 2px solid var(--ccp-line); border-radius: 18px; padding: 14px 16px; transition: border-color .2s, transform .2s, box-shadow .2s; }
.ccp-need-evt:hover { border-color: var(--ccp-saffron-2); transform: translateX(6px); box-shadow: 0 10px 24px rgba(234,88,12,.14); }
.ccp-need-evt-emoji { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; font-size: 24px; background: var(--ccp-wash); flex-shrink: 0; }
.ccp-need-evt b { display: block; font-size: 1.02rem; color: var(--ccp-ink); line-height: 1.4; }
.ccp-need-evt small { color: var(--ccp-muted); font-weight: 600; }
.ccp-need-evt i { margin-left: auto; font-style: normal; color: var(--ccp-saffron); font-weight: 900; }

/* Services */
.ccp-services { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.ccp-service { background: #fff; border: 2px solid #FBE3CB; border-radius: 22px; padding: 26px 22px; transition: transform .3s ease, border-color .3s, box-shadow .3s; position: relative; overflow: hidden; display: flex; flex-direction: column; }
.ccp-service::after { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 5px; background: repeating-linear-gradient(90deg, var(--ccp-saffron) 0 14px, var(--ccp-gold) 14px 28px); transform: scaleX(0); transform-origin: left; transition: transform .35s ease; }
.ccp-service:hover { transform: translateY(-6px); border-color: var(--ccp-line); box-shadow: 0 20px 45px rgba(79,25,14,.12); }
.ccp-service:hover::after { transform: scaleX(1); }
.ccp-service-icon { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; font-size: 28px; background: var(--ccp-wash); margin-bottom: 18px; }
.ccp-service h3 { font-size: 1.22rem; margin: 0 0 8px; line-height: 1.4; }
.ccp-service p { color: var(--ccp-text); font-size: 1rem; line-height: 1.7; margin: 0 0 16px; }
.ccp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
.ccp-tag { font-size: .84rem; font-weight: 700; color: var(--ccp-clay); background: var(--ccp-wash); border: 1px solid var(--ccp-line); padding: 3px 10px; border-radius: 999px; }

/* Network */
.ccp-network-bg { background: linear-gradient(180deg, #FFF4E6 0%, #FFFFFF 100%); border-top: 1px solid #FBE3CB; border-bottom: 1px solid #FBE3CB; }
.ccp-tiers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; position: relative; }
.ccp-tiers::before { content: ''; position: absolute; top: 36px; left: 12%; right: 12%; height: 2px; background: repeating-linear-gradient(90deg, var(--ccp-saffron-2) 0 10px, transparent 10px 18px); }
.ccp-tier { position: relative; text-align: center; }
.ccp-tier-badge { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 18px; display: grid; place-items: center; font-size: 30px; background: #fff; border: 3px solid var(--ccp-saffron-2); box-shadow: 0 0 0 8px var(--ccp-wash), 0 10px 24px rgba(234,88,12,.2); position: relative; z-index: 1; }
.ccp-tier-card { background: #fff; border: 2px solid #FBE3CB; border-radius: 20px; padding: 22px 20px; text-align: left; }
.ccp-tier-card h3 { font-size: 1.25rem; margin: 0; color: #7C2D12; font-weight: 800; }
.ccp-tier-sub { font-size: .92rem; font-weight: 800; color: #C2410C; margin-top: 2px; }
.ccp-tier-card ul { list-style: none; padding: 0; margin: 14px 0 0; }
.ccp-tier-card li { font-size: 1rem; color: #1E293B; padding: 6px 0 6px 22px; position: relative; line-height: 1.5; font-weight: 500; }
.ccp-tier-card li::before { content: '›'; position: absolute; left: 4px; top: 4px; color: var(--ccp-saffron); font-weight: 900; font-size: 1.2rem; }
.ccp-divisions { margin-top: 40px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; }
.ccp-divisions-label { font-weight: 800; color: #0F172A; margin-right: 6px; font-size: 1.05rem; }
.ccp-division { background: #fff; border: 2px solid var(--ccp-line); color: #7C2D12; font-weight: 800; font-size: .98rem; padding: 7px 18px; border-radius: 999px; }

/* Facilities */
.ccp-facility-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 48px; align-items: center; }
.ccp-facility-media { position: relative; }
.ccp-facility-media img { width: 100%; height: 460px; object-fit: cover; border-radius: 28px; display: block; box-shadow: 0 24px 60px rgba(79,25,14,.2); }
.ccp-hours { position: absolute; right: -18px; bottom: -26px; background: linear-gradient(135deg, #7C2D12, #C2410C); color: #fff; border-radius: 20px; padding: 20px 22px; width: 270px; box-shadow: 0 18px 40px rgba(79,25,14,.4); }
.ccp-hours h4 { margin: 0 0 10px; font-size: 1.15rem; color: #fff; font-weight: 800; }
.ccp-hours-row { display: flex; justify-content: space-between; gap: 12px; font-size: .95rem; padding: 6px 0; border-top: 1px solid rgba(255,255,255,.35); color: #FFF7ED; font-weight: 600; }
.ccp-hours-note { font-size: .82rem; color: #FED7AA; margin-top: 8px; font-weight: 600; }
.ccp-facilities { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 28px; }
.ccp-facility { display: flex; align-items: center; gap: 12px; background: #fff; border: 2px solid #FBE3CB; border-radius: 14px; padding: 12px 14px; font-weight: 700; font-size: 1.02rem; color: #0F172A; transition: border-color .2s; }
.ccp-facility:hover { border-color: var(--ccp-saffron-2); }
.ccp-facility span:first-child { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--ccp-wash); font-size: 19px; flex-shrink: 0; }

/* Images: always clean, never overlaid */
.ccp-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.16,1,.3,1); }
.ccp-frame { position: relative; aspect-ratio: 3 / 4; border-radius: 18px; overflow: hidden; border: 4px solid #FFF1DC; box-shadow: 0 24px 50px rgba(0,0,0,.4); background: #2a1008; }

.ccp-gallery-bg { position: relative; background: linear-gradient(180deg, #FFFFFF 0%, #FFF4E6 55%, #FFEBD2 100%); overflow: hidden; }
.ccp-gallery { display: flex; gap: 22px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 18px 24px 34px; margin: 0 -24px; scrollbar-width: thin; scrollbar-color: var(--ccp-saffron-2) transparent; }
.ccp-gallery-item { flex: 0 0 min(260px, 70vw); scroll-snap-align: start; border: 0; padding: 0; background: none; cursor: pointer; font-family: inherit; text-align: left; transition: transform .35s cubic-bezier(.16,1,.3,1); }
.ccp-gcard { display: block; background: #fff; border: 2px solid #FBE3CB; border-radius: 22px; overflow: hidden; box-shadow: 0 18px 40px rgba(79,25,14,.14); }
.ccp-gimg { display: block; aspect-ratio: 4 / 5; overflow: hidden; }
.ccp-gcap { display: block; padding: 14px 16px 16px; }
.ccp-gcap b { display: block; font-family: var(--ccp-display); font-weight: 400; font-size: 1.1rem; line-height: 1.4; color: var(--ccp-ink); }
.ccp-gcap span { display: block; margin-top: 6px; font-size: .92rem; font-weight: 600; color: var(--ccp-saffron); }
.ccp-gallery-item:nth-child(odd) { transform: translateY(14px) rotate(-1.2deg); }
.ccp-gallery-item:nth-child(even) { transform: translateY(-6px) rotate(1.2deg); }
.ccp-gallery-item:hover { transform: translateY(-14px) rotate(0) scale(1.04); z-index: 2; }
.ccp-gallery-item:hover .ccp-img, .ccp-evt-card:hover .ccp-img { transform: scale(1.06); }

/* Day at the centre */
.ccp-day-bg { background-color: var(--ccp-indigo); color: #fff; position: relative; overflow: hidden;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><g fill='white' fill-opacity='.08' stroke='white' stroke-opacity='.08' stroke-width='1.4'><circle cx='40' cy='34' r='3'/><path d='M34 38 h12 l-6 10z M34 62 h12 l-6 -10z'/><path d='M35 40 l-9 6 M45 40 l9 6' fill='none'/><circle cx='118' cy='108' r='3'/><path d='M112 112 h12 l-6 10z M112 136 h12 l-6 -10z'/><path d='M113 114 l-9 -8 M123 114 l9 -8' fill='none'/></g></svg>"); }
.ccp-day-bg .ccp-h2 { color: #fff; }
.ccp-day-bg .ccp-lead { color: #E8CDB6; }
.ccp-day-bg .ccp-eyebrow { color: var(--ccp-gold); }
.ccp-day { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.ccp-day-item { position: relative; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); border-radius: 22px; padding: 24px 22px; transition: background .3s, border-color .3s, transform .3s; }
.ccp-day-item:hover { background: rgba(245,181,60,.12); border-color: var(--ccp-gold); transform: translateY(-5px); }
.ccp-day-time { display: inline-block; font-weight: 800; font-size: .88rem; color: #4F190E; background: var(--ccp-gold); padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; }
.ccp-day-icon { position: absolute; right: 20px; top: 18px; font-size: 30px; }
.ccp-day-item h3 { margin: 0 0 6px; font-size: 1.2rem; }
.ccp-day-item p { margin: 0; color: #F0DCCB; font-size: 1rem; line-height: 1.7; }

/* Events */
.ccp-events-bg { background: #FFFBF6; }
.ccp-featured { display: grid; grid-template-columns: 1.1fr 1fr; border-radius: 28px; overflow: hidden; margin-bottom: 44px; background: var(--ccp-madder); color: #fff; box-shadow: 0 24px 60px rgba(79,25,14,.3); }
.ccp-featured-img { position: relative; min-height: 320px; }
.ccp-featured-img { overflow: hidden; }
.ccp-featured-img .ccp-img { position: absolute; inset: 0; }
.ccp-featured-body { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
.ccp-featured-kicker { display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; background: rgba(245,181,60,.18); color: #FFD27A; font-weight: 700; font-size: .9rem; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px; }
.ccp-featured h3 { font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0 0 12px; line-height: 1.35; }
.ccp-featured p { color: #EBCDB5; line-height: 1.75; margin: 0 0 22px; font-size: 1.04rem; }
.ccp-featured-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
.ccp-featured-meta span { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); padding: 6px 12px; border-radius: 10px; font-size: .92rem; font-weight: 600; }

.ccp-months { display: grid; grid-template-columns: repeat(12, minmax(56px, 1fr)); gap: 8px; overflow-x: auto; padding: 10px 0 6px; }
.ccp-month { border: 2px solid #FBE3CB; background: #fff; border-radius: 14px; padding: 10px 4px 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; font-family: inherit; transition: border-color .2s, background .2s; position: relative; }
.ccp-month:hover:not(:disabled) { border-color: var(--ccp-saffron-2); }
.ccp-month:disabled { opacity: .45; cursor: not-allowed; }
.ccp-month-name { font-size: .92rem; font-weight: 700; color: var(--ccp-text); }
.ccp-month-dots { display: flex; gap: 3px; height: 6px; }
.ccp-month-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--ccp-saffron-2); }
.ccp-month.is-current::before { content: 'आता'; position: absolute; top: -9px; font-size: .7rem; font-weight: 800; background: var(--ccp-madder); color: #fff; padding: 1px 7px; border-radius: 999px; }
.ccp-month.active { background: linear-gradient(135deg, var(--ccp-saffron), var(--ccp-saffron-2)); border-color: transparent; box-shadow: 0 8px 20px rgba(234,88,12,.3); }
.ccp-month.active .ccp-month-name { color: #fff; }
.ccp-month.active .ccp-month-dots i { background: #fff; }

.ccp-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin: 22px 0 30px; }
.ccp-toolbar-left { display: flex; flex-wrap: wrap; gap: 8px; }
.ccp-pill { padding: 9px 18px; border-radius: 999px; background: #fff; border: 2px solid #FBE3CB; color: var(--ccp-text); font-size: .95rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: border-color .2s, color .2s; }
.ccp-pill:hover { border-color: var(--ccp-saffron-2); color: var(--ccp-saffron); }
.ccp-pill.active { background: var(--ccp-madder); border-color: var(--ccp-madder); color: #fff; }
.ccp-search { position: relative; flex: 1 1 260px; max-width: 360px; }
.ccp-search input { width: 100%; padding: 11px 16px 11px 40px; border-radius: 999px; border: 2px solid #FBE3CB; font-size: 1rem; font-family: inherit; outline: none; background: #fff; color: var(--ccp-ink); transition: border-color .2s, box-shadow .2s; }
.ccp-search input:focus { border-color: var(--ccp-saffron-2); box-shadow: 0 0 0 4px rgba(249,115,22,.15); }
.ccp-search::before { content: '🔍'; position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: .9rem; }
.ccp-result-count { font-size: .98rem; color: var(--ccp-muted); font-weight: 600; margin-bottom: 18px; }

.ccp-evt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 24px; }
.ccp-evt-card { background: #fff; border: 2px solid #FBE3CB; border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; transition: transform .3s ease, border-color .3s, box-shadow .3s; }
.ccp-evt-card:hover { transform: translateY(-6px); border-color: var(--ccp-line); box-shadow: 0 22px 48px rgba(79,25,14,.14); }
.ccp-evt-media { position: relative; height: 210px; overflow: hidden; }
.ccp-evt-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.ccp-evt-month { background: #FFF7ED; border: 1.5px solid #FDBA74; color: #C2410C; padding: 4px 12px; border-radius: 999px; font-size: .88rem; font-weight: 800; }
.ccp-evt-level { background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #1E293B; padding: 4px 12px; border-radius: 999px; font-size: .88rem; font-weight: 700; }
.ccp-evt-body { padding: 22px; display: flex; flex-direction: column; flex: 1; }
.ccp-evt-badge { font-size: .92rem; font-weight: 800; color: #C2410C; margin-bottom: 6px; }
.ccp-evt-body h3 { font-size: 1.25rem; font-weight: 800; line-height: 1.45; margin: 0 0 10px; color: #0F172A; }
.ccp-evt-body p { font-size: 1rem; color: #334155; line-height: 1.7; margin: 0 0 16px; font-weight: 500; }
.ccp-evt-meta { display: grid; gap: 6px; margin: 0 0 18px; padding: 12px 14px; background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 12px; font-size: .95rem; color: #1E293B; }
.ccp-evt-meta div { display: flex; gap: 8px; }
.ccp-evt-meta b { color: #9A3412; white-space: nowrap; font-weight: 800; }
.ccp-evt-meta span { color: #1E293B; font-weight: 600; }
.ccp-evt-actions { margin-top: auto; display: flex; gap: 10px; flex-wrap: wrap; }
.ccp-empty { text-align: center; padding: 60px 20px; border: 2px dashed var(--ccp-line); border-radius: 22px; background: #fff; color: var(--ccp-muted); }

/* Modal */
.ccp-modal-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(15,23,42,.75); backdrop-filter: blur(5px); display: grid; place-items: center; padding: 20px; animation: ccpFade .2s ease; }
.ccp-modal { background: #fff; width: 100%; max-width: 760px; max-height: 90vh; overflow-y: auto; border-radius: 26px; box-shadow: 0 40px 100px rgba(0,0,0,.4); }
.ccp-modal-hero { position: relative; height: 250px; overflow: hidden; }
.ccp-modal-title { font-size: clamp(1.4rem, 2.6vw, 1.8rem); margin: 10px 0 20px; line-height: 1.4; color: #0F172A; font-weight: 800; }
.ccp-modal-close { position: absolute; top: 16px; right: 16px; z-index: 6; width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(255,255,255,.95); font-size: 1.1rem; cursor: pointer; font-weight: 800; color: #0F172A; }
.ccp-modal-body { padding: 26px 28px 30px; }
.ccp-modal-facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 22px; }
.ccp-fact { background: #FFF7ED; border: 1.5px solid #FDBA74; border-radius: 14px; padding: 12px 14px; }
.ccp-fact small { display: block; color: #C2410C; font-size: .84rem; font-weight: 800; }
.ccp-fact span { display: block; font-size: 1.02rem; font-weight: 800; margin-top: 3px; color: #0F172A; }
.ccp-modal-block { margin-bottom: 18px; }
.ccp-modal-block h4 { margin: 0 0 6px; font-size: 1.15rem; color: #9A3412; font-weight: 800; }
.ccp-modal-block p, .ccp-modal-block li { color: #334155; font-size: 1.02rem; line-height: 1.75; margin: 0; font-weight: 500; }
.ccp-modal-block ul { margin: 0; padding-left: 20px; }
.ccp-modal-block.benefit { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 14px; padding: 14px 16px; }
.ccp-modal-block.benefit h4 { color: #047857; }
@keyframes ccpFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ccpRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }

/* Process */
.ccp-process { display: grid; grid-template-columns: 1.6fr 1fr; gap: 28px; align-items: stretch; }
.ccp-steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.ccp-step { background: #fff; border: 2px solid #FBE3CB; border-radius: 20px; padding: 22px; }
.ccp-step-n { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-family: var(--ccp-display); font-size: 1.3rem; color: #fff; background: linear-gradient(135deg, var(--ccp-clay), var(--ccp-saffron)); margin-bottom: 14px; }
.ccp-step h3 { font-size: 1.15rem; margin: 0 0 6px; }
.ccp-step p { font-size: 1rem; color: var(--ccp-text); line-height: 1.65; margin: 0; }
.ccp-docs { background: var(--ccp-madder); color: #fff; border-radius: 22px; padding: 28px 26px; }
.ccp-docs h3 { margin: 0 0 6px; font-size: 1.25rem; }
.ccp-docs > p { color: #E3C3AA; font-size: .98rem; margin: 0 0 18px; }
.ccp-docs ul { list-style: none; padding: 0; margin: 0; }
.ccp-docs li { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-top: 1px solid rgba(255,255,255,.12); font-size: 1.02rem; }
.ccp-docs li::before { content: '✓'; width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; background: rgba(245,181,60,.2); color: #FFD27A; font-weight: 900; font-size: .75rem; flex-shrink: 0; }

/* Roles */
.ccp-roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.ccp-role { border-radius: 22px; padding: 28px 24px; background: linear-gradient(160deg, #FFF4E6, #FFFFFF 70%); border: 2px solid #FBE3CB; display: flex; flex-direction: column; transition: border-color .3s, transform .3s, box-shadow .3s; }
.ccp-role:hover { border-color: var(--ccp-saffron-2); transform: translateY(-4px); box-shadow: 0 18px 40px rgba(234,88,12,.12); }
.ccp-role-icon { font-size: 34px; margin-bottom: 12px; }
.ccp-role h3 { margin: 0 0 8px; font-size: 1.25rem; }
.ccp-role p { color: var(--ccp-text); font-size: 1.02rem; line-height: 1.7; margin: 0 0 20px; }
.ccp-role a { margin-top: auto; align-self: flex-start; color: var(--ccp-saffron); font-weight: 700; text-decoration: none; font-size: 1.02rem; }
.ccp-role a:hover { text-decoration: underline; }

/* FAQ */
.ccp-faq-wrap { display: grid; grid-template-columns: 1fr 1.6fr; gap: 48px; align-items: start; }
.ccp-faq-item { border: 2px solid #FBE3CB; border-radius: 16px; background: #fff; margin-bottom: 12px; overflow: hidden; transition: border-color .2s; }
.ccp-faq-item.open { border-color: var(--ccp-line); box-shadow: 0 10px 26px rgba(234,88,12,.08); }
.ccp-faq-q { width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: inherit; font-size: 1.1rem; font-weight: 700; color: var(--ccp-ink); }
.ccp-faq-q i { font-style: normal; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--ccp-wash); color: var(--ccp-saffron); font-weight: 900; flex-shrink: 0; transition: transform .25s; }
.ccp-faq-item.open .ccp-faq-q i { transform: rotate(45deg); background: var(--ccp-saffron); color: #fff; }
.ccp-faq-a { padding: 0 20px 18px; color: var(--ccp-text); font-size: 1.04rem; line-height: 1.75; margin: 0; }

/* CTA */
.ccp-cta { position: relative; overflow: hidden; border-radius: 32px; padding: 64px 48px; color: #fff; background: linear-gradient(120deg, #C2410C 0%, #EA580C 55%, #F97316 100%); display: grid; grid-template-columns: 1.4fr 1fr; gap: 32px; align-items: center; box-shadow: 0 30px 70px rgba(79,25,14,.4); }
.ccp-cta-art { position: absolute; width: 520px; height: 520px; right: -150px; top: 50%; transform: translateY(-50%); color: #FFE3B0; opacity: .2; pointer-events: none; overflow: visible; }
.ccp-cta h2 { position: relative; font-size: clamp(1.8rem, 3.2vw, 2.5rem); line-height: 1.4; margin: 0 0 12px; }
.ccp-cta p { position: relative; margin: 0; color: #F6DCC4; font-size: 1.1rem; line-height: 1.75; }
.ccp-cta-actions { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }

@media (max-width: 1080px) {
  .ccp-services { grid-template-columns: repeat(2, 1fr); }
  .ccp-tiers { grid-template-columns: repeat(2, 1fr); }
  .ccp-tiers::before { display: none; }
  .ccp-day { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .ccp-section { padding: 64px 0; }
  .ccp-hero { padding: 48px 0 76px; }
  .ccp-hero-panel { padding: 28px 22px; }
  .ccp-hero-grid, .ccp-facility-grid, .ccp-featured, .ccp-process, .ccp-faq-wrap, .ccp-cta { grid-template-columns: 1fr; }
  .ccp-collage { max-width: 440px; margin: 0 auto; }
  .ccp-collage-poster { width: 108px; }
  .ccp-collage-poster.a { left: -6px; bottom: -14px; }
  .ccp-collage-poster.b { right: -4px; top: -14px; width: 96px; }
  .ccp-float.one { left: 0; }
  .ccp-float.two { right: 0; }
  .ccp-stats { grid-template-columns: repeat(2, 1fr); }
  .ccp-stat:nth-child(3) { border-left: none; }
  .ccp-stat:nth-child(n+3) { border-top: 2px dashed var(--ccp-line); }
  .ccp-roles { grid-template-columns: 1fr; }
  .ccp-featured-body { padding: 28px 26px 32px; }
  .ccp-hours { position: relative; right: auto; bottom: auto; width: auto; margin-top: -40px; margin-left: 16px; margin-right: 16px; }
  .ccp-facility-media img { height: 320px; }
  .ccp-cta { padding: 44px 26px; }
  .ccp-need-result { grid-template-columns: 1fr; }
  .ccp-finder { padding: 30px 20px; }
}
@media (max-width: 600px) {
  .ccp-wrap { padding: 0 16px; }
  .ccp-services, .ccp-tiers, .ccp-facilities, .ccp-steps, .ccp-modal-facts, .ccp-day { grid-template-columns: 1fr; }
  .ccp-float { display: none; }
  .ccp-stat { padding: 18px 14px; gap: 10px; }
  .ccp-stat-icon { width: 40px; height: 40px; font-size: 19px; }
  .ccp-stat-value { font-size: 1.7rem; }
  .ccp-evt-grid { grid-template-columns: 1fr; }
  .ccp-modal-body { padding: 22px 18px 24px; }
  .ccp-search { max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ccp-root * { transition: none !important; }
  .ccp-need-result, .ccp-modal-backdrop { animation: none; }
}
`;

export default function CommunityCentersPortalPage() {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [query, setQuery] = useState('');
  const [activeEvent, setActiveEvent] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [need, setNeed] = useState(NEEDS[0].key);
  const activeNeed = NEEDS.find((n) => n.key === need) || NEEDS[0];

  const rootRef = useRef(null);
  const firstFilterRun = useRef(true);
  const firstNeedRun = useRef(true);

  const currentMonth = MONTH_KEYS[new Date().getMonth()];

  // Next scheduled event from the current month onwards, wrapping into next year
  const nextEvent = useMemo(() => {
    const start = MONTH_KEYS.indexOf(currentMonth);
    for (let i = 0; i < 12; i += 1) {
      const key = MONTH_KEYS[(start + i) % 12];
      const found = EVENTS_DATA.find((e) => e.month === key);
      if (found) return found;
    }
    return EVENTS_DATA[0];
  }, [currentMonth]);

  const monthCounts = useMemo(() => {
    const counts = {};
    EVENTS_DATA.forEach((e) => { counts[e.month] = (counts[e.month] || 0) + 1; });
    return counts;
  }, []);

  const filteredEvents = EVENTS_DATA.filter((evt) => {
    if (selectedMonth !== 'all' && evt.month !== selectedMonth) return false;
    if (!matchesLevel(evt, selectedLevel)) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return `${evt.title} ${evt.short} ${evt.badge}`.toLowerCase().includes(q);
    }
    return true;
  });

  // One orchestrated moment: the hero ring of dancers. Everything else is a quiet reveal.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(root);
      const cleanups = [];

      gsap.to(q('.ccp-progress'), { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(q('.ccp-chip'), { y: -20, opacity: 0, duration: 0.6 })
        .fromTo(
          q('.ccp-hero h1'),
          { clipPath: 'inset(-20% 100% -20% -5%)', y: 28, opacity: 0 },
          { clipPath: 'inset(-20% -5% -20% -5%)', y: 0, opacity: 1, duration: 1.1, ease: 'power4.out', clearProps: 'clipPath' },
          '-=0.3'
        )
        .from(q('.ccp-hero-lead'), { y: 24, opacity: 0, duration: 0.7 }, '-=0.6')
        .from(q('.ccp-hero-ctas .ccp-btn'), { y: 24, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.5')
        .from(q('.ccp-hero-trust span'), { x: -16, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.4')
        .from(q('.ccp-collage-main'), { scale: 0.5, opacity: 0, duration: 1.2, ease: 'power4.out' }, 0.2)
        .from(q('.ccp-ring-fig'), { opacity: 0, duration: 0.5, stagger: { each: 0.07, from: 'start' } }, 0.5)
        .from(q('.ccp-collage-poster .ccp-frame'), { y: 120, rotate: 20, opacity: 0, stagger: 0.15, duration: 1, ease: 'back.out(1.4)' }, 1)
        .from(q('.ccp-float'), { scale: 0.5, opacity: 0, stagger: 0.2, duration: 0.7, ease: 'back.out(2)' }, 1.3)
        .add(() => {
          gsap.to(q('.ccp-float'), { y: -8, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.6 });
        });

      // The ring turns slowly, like the tarpa dance
      gsap.to(q('.ccp-ring-spin'), { rotation: 360, svgOrigin: '250 250', duration: 140, repeat: -1, ease: 'none' });
      gsap.to(q('.ccp-hero h1'), { backgroundPosition: '100% 50%', duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // Ticker surges with scroll speed
      const tickerTween = gsap.to(q('.ccp-ticker-track'), { xPercent: -50, duration: 55, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        onUpdate: (self) => {
          tickerTween.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 220, 9));
          gsap.to(tickerTween, { timeScale: 1, duration: 1.1, ease: 'power2.out', overwrite: true });
        },
      });

      // Quiet scroll reveals (one gesture: rise)
      const reveal = (sel, from = {}, stagger = 0.09) => {
        const els = q(sel);
        if (!els.length) return;
        gsap.set(els, { y: 44, opacity: 0, ...from });
        ScrollTrigger.batch(els, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { y: 0, x: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger, overwrite: true, clearProps: 'transform,opacity' }),
        });
      };
      reveal('.ccp-head', {}, 0);
      reveal('.ccp-stat', { y: 30 });
      reveal('.ccp-finder', { y: 50 }, 0);
      reveal('.ccp-service');
      reveal('.ccp-tier', {}, 0.14);
      reveal('.ccp-tier-badge', { y: 0, scale: 0 }, 0.14);
      reveal('.ccp-gcard', { y: 80, rotate: 8 }, 0.07);
      reveal('.ccp-day-item', {}, 0.1);
      reveal('.ccp-featured', { y: 56 }, 0);
      reveal('.ccp-evt-card', { y: 64 }, 0.08);
      reveal('.ccp-step', {}, 0.12);
      reveal('.ccp-role', {}, 0.12);
      reveal('.ccp-faq-item', { y: 0, x: 40 }, 0.08);
      reveal('.ccp-cta', { y: 56 }, 0);

      // 3D tilt on gallery posters
      q('.ccp-gallery-item').forEach((item) => {
        const p = item.querySelector('.ccp-gcard');
        if (!p) return;
        const move = (e) => {
          const r = item.getBoundingClientRect();
          gsap.to(p, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 22, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 22, transformPerspective: 700, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        };
        const leave = () => gsap.to(p, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1,0.5)', overwrite: 'auto' });
        item.addEventListener('pointermove', move);
        item.addEventListener('pointerleave', leave);
        cleanups.push(() => { item.removeEventListener('pointermove', move); item.removeEventListener('pointerleave', leave); });
      });

      const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 900);
      cleanups.push(() => clearTimeout(refreshTimer));
      return () => cleanups.forEach((fn) => fn());
    }, root);

    return () => mm.revert();
  }, []);

  // Re-stagger event cards whenever the filters change
  useEffect(() => {
    if (firstFilterRun.current) { firstFilterRun.current = false; return undefined; }
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.ccp-evt-card', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' });
    }, rootRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [selectedMonth, selectedLevel, query]);

  // Need-finder result swap
  useEffect(() => {
    if (firstNeedRun.current) { firstNeedRun.current = false; return undefined; }
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.ccp-need-service', { x: -40, opacity: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' });
      gsap.from('.ccp-need-evt', { x: 60, opacity: 0, stagger: 0.1, delay: 0.1, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' });
    }, rootRef);
    return () => ctx.revert();
  }, [need]);

  // Event modal entrance
  useEffect(() => {
    if (!activeEvent || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.ccp-modal', { y: 70, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'power4.out' });
      gsap.from('.ccp-modal .ccp-img', { scale: 1.25, duration: 1.2, ease: 'power3.out' });
      gsap.from('.ccp-modal .ccp-fact', { y: 20, opacity: 0, stagger: 0.07, delay: 0.25, duration: 0.5 });
      gsap.from('.ccp-modal .ccp-modal-block', { y: 24, opacity: 0, stagger: 0.08, delay: 0.4, duration: 0.5 });
    }, rootRef);
    return () => ctx.revert();
  }, [activeEvent]);

  useEffect(() => {
    if (!activeEvent) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setActiveEvent(null); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeEvent]);

  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedLevel('all');
    setQuery('');
  };

  const sanskrutik = EVENTS_DATA.find((e) => e.id === 'sanskrutik');

  return (
    <div className="ccp-root" ref={rootRef}>
      <div className="ccp-progress" aria-hidden="true" />
      <style>{CSS}</style>

      {/* HERO */}
      <section className="ccp-hero">
        <div className="ccp-hero-bg" aria-hidden="true"><EventImage evt={HERO_BG} /></div>
        <div className="ccp-wrap ccp-hero-grid">
          <div className="ccp-hero-panel">
            <span className="ccp-chip">
              <span className="ccp-chip-dot" />
              राज्य • विभाग • जिल्हा • तालुका — एकसंध सेवा नेटवर्क
            </span>
            <h1>
              प्रत्येक समाजबांधवासाठी<br />
              हक्काचे कम्युनिटी सेंटर
            </h1>
            <p className="ccp-hero-lead">
              शिक्षण, रोजगार, आरोग्य, उद्योग आणि कायदेशीर हक्क — गावापासून राजधानीपर्यंत एकाच छताखाली मार्गदर्शन.
              वर्षभर चालणारे १५ महा-उपक्रम आणि दररोजच्या मोफत सेवा येथे जाणून घ्या.
            </p>
            <div className="ccp-hero-ctas">
              <a href="#events" className="ccp-btn ccp-btn-primary">वार्षिक कार्यक्रम पहा <span>↓</span></a>
              <a href="#services" className="ccp-btn ccp-btn-ghost">केंद्रातील सेवा</a>
            </div>
            <div className="ccp-hero-trust">
              <span>बहुतांश सेवा मोफत</span>
              <span>पडताळणी केलेले मार्गदर्शक</span>
              <span>प्रत्येक तालुक्यात संपर्क</span>
            </div>
          </div>

          <div className="ccp-hero-visual">
            <div className="ccp-collage">
              <svg className="ccp-ring" viewBox="0 0 500 500" aria-hidden="true">
                <circle cx="250" cy="250" r="250" fill="#C2410C" fillOpacity="0.6" />
                <circle cx="250" cy="250" r="168" fill="none" stroke="#F5B53C" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
                <g className="ccp-ring-spin">
                  <WarliInk width={1.6}>
                    <WarliRing cx={250} cy={250} R={206} n={18} s={1.9} className="ccp-ring-fig" />
                  </WarliInk>
                </g>
              </svg>
              <div className="ccp-collage-main">
                <EventImage evt={HERO_IMG} className="ccp-hero-img" />
              </div>
              <div className="ccp-collage-poster a"><div className="ccp-frame"><EventImage evt={EVENTS_DATA[0]} /></div></div>
              <div className="ccp-collage-poster b"><div className="ccp-frame"><EventImage evt={sanskrutik} /></div></div>
              <div className="ccp-float one">
                <div className="ccp-float-icon">📅</div>
                <div><b>पुढील: {nextEvent.monthLabel}</b><small>{nextEvent.badge}</small></div>
              </div>
              <div className="ccp-float two">
                <div className="ccp-float-icon">🤝</div>
                <div><b>८ सेवा विभाग</b><small>एकाच छताखाली</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ccp-paithani" aria-hidden="true" />

      {/* TICKER */}
      <div className="ccp-ticker" aria-label="वार्षिक उपक्रम">
        <div className="ccp-ticker-track">
          {[...EVENTS_DATA, ...EVENTS_DATA].map((e, i) => (
            <span className="ccp-ticker-item" key={`${e.id}-${i}`}>
              <span>{e.emoji}</span>
              <b>{e.monthLabel.split(' ')[0]}</b>
              <span>{e.title.split('(')[0].trim()}</span>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="ccp-wrap">
        <div className="ccp-stats">
          {STATS.map((s) => (
            <div className="ccp-stat" key={s.label}>
              <div className="ccp-stat-icon">{s.icon}</div>
              <div>
                <div className="ccp-stat-value"><CountUp to={s.value} /></div>
                <div className="ccp-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <nav className="ccp-quicknav" aria-label="पृष्ठ विभाग">
          <a href="#finder">तुमची गरज</a>
          <a href="#services">सेवा</a>
          <a href="#network">नेटवर्क रचना</a>
          <a href="#facilities">सुविधा</a>
          <a href="#gallery">पोस्टर गॅलरी</a>
          <a href="#events">वार्षिक कार्यक्रम</a>
          <a href="#process">प्रक्रिया</a>
          <a href="#faq">प्रश्नोत्तरे</a>
        </nav>
      </div>

      {/* NEED FINDER */}
      <section id="finder" className="ccp-section" style={{ paddingBottom: 0 }}>
        <div className="ccp-wrap">
          <div className="ccp-finder">
            <span className="ccp-eyebrow">तुमच्यासाठी योग्य मार्ग</span>
            <h2 className="ccp-h2" style={{ marginBottom: 0 }}>तुम्हाला आज कशाची गरज आहे?</h2>
            <div className="ccp-needs" role="tablist" aria-label="गरज निवडा">
              {NEEDS.map((n) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={need === n.key}
                  key={n.key}
                  className={`ccp-need ${need === n.key ? 'active' : ''}`}
                  onClick={() => setNeed(n.key)}
                >
                  <span>{n.icon}</span><span>{n.label}</span>
                </button>
              ))}
            </div>
            <div className="ccp-need-result" key={activeNeed.key}>
              <div className="ccp-need-service">
                {activeNeed.image && (
                  <div style={{ borderRadius: '16px', overflow: 'hidden', height: '180px', marginBottom: '18px', border: '1.5px solid var(--ccp-line)' }}>
                    <img
                      src={activeNeed.image}
                      alt={activeNeed.service}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
                <small>शिफारस केलेली सेवा</small>
                <h3>{activeNeed.icon} {activeNeed.service}</h3>
                <p>{activeNeed.line}</p>
                <Link to="/contact" className="ccp-btn ccp-btn-primary ccp-btn-sm">जवळचे केंद्र संपर्क →</Link>
              </div>
              <div className="ccp-need-events">
                {activeNeed.events.map((id) => EVENTS_DATA.find((e) => e.id === id)).filter(Boolean).map((e) => (
                  <button type="button" className="ccp-need-evt" key={e.id} onClick={() => setActiveEvent(e)}>
                    <span className="ccp-need-evt-emoji">{e.emoji}</span>
                    <span>
                      <b>{e.title.split('(')[0].trim()}</b>
                      <small>{e.monthLabel} • {e.level}</small>
                    </span>
                    <i>→</i>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="ccp-section">
        <div className="ccp-wrap">
          <div className="ccp-head center">
            <span className="ccp-eyebrow">केंद्रातील सेवा</span>
            <h2 className="ccp-h2">कम्युनिटी सेंटर म्हणजे काय?</h2>
            <p className="ccp-lead">
              केवळ एक कार्यालय नव्हे — समाजातील प्रत्येक घटकाला समर्थ बनवणारी बहुआयामी व्यवस्था.
              प्रत्येक केंद्रात खालील ८ सेवा विभाग कार्यरत असतात.
            </p>
          </div>
          <div className="ccp-services">
            {SERVICES.map((s) => (
              <div className="ccp-service" key={s.title}>
                {s.image && (
                  <div style={{ borderRadius: '14px', overflow: 'hidden', height: '150px', marginBottom: '16px', border: '1.5px solid var(--ccp-line)' }}>
                    <img
                      src={s.image}
                      alt={s.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s ease' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div className="ccp-service-icon" style={{ margin: 0, width: '38px', height: '38px', fontSize: '18px' }}>{s.icon}</div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem' }}>{s.title}</h3>
                </div>
                <p>{s.desc}</p>
                <div className="ccp-tags" style={{ marginTop: 'auto' }}>
                  {s.tags.map((t) => <span className="ccp-tag" key={t}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NETWORK */}
      <section id="network" className="ccp-section ccp-network-bg">
        <div className="ccp-wrap">
          <div className="ccp-head center">
            <span className="ccp-eyebrow">नेटवर्क रचना</span>
            <h2 className="ccp-h2">राज्य ते तालुका — चार-स्तरीय सेवा साखळी</h2>
            <p className="ccp-lead">गाव पातळीवरील समाजबांधवापासून थेट राज्य नेतृत्वापर्यंत अखंड जोडलेली व्यवस्था.</p>
          </div>
          <div className="ccp-tiers">
            {NETWORK_TIERS.map((t) => (
              <div className="ccp-tier" key={t.title}>
                <div className="ccp-tier-badge">{t.icon}</div>
                <div className="ccp-tier-card">
                  <h3>{t.title}</h3>
                  <div className="ccp-tier-sub">{t.sub}</div>
                  <ul>
                    {t.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="ccp-divisions">
            <span className="ccp-divisions-label">महाराष्ट्रातील विभाग:</span>
            {DIVISIONS.map((d) => <span className="ccp-division" key={d}>{d}</span>)}
          </div>

          <div style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
            border: '2px solid #FED7AA',
            borderRadius: '20px',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '36px', background: '#FFEDD5', borderRadius: '14px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏢</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#EA580C' }}>कम्युनिटी सेंटर प्रशासकीय व्यवस्थापन प्रणाली (CRM)</div>
                <div style={{ color: '#7C2D12', fontSize: '0.92rem', fontWeight: 600 }}>केंद्र व्यवस्थापक, स्टाफ व समन्वयकांसाठी १२+ सेवा कक्ष, KYC व दैनिक कार्यप्रणाली नियंत्रण डॅशबोर्ड.</div>
              </div>
            </div>
            <Link to="/crm/center" className="ccp-btn ccp-btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '0.95rem' }}>
              सेंटर CRM डॅशबोर्ड उघडा ➔
            </Link>
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section id="facilities" className="ccp-section">
        <div className="ccp-wrap ccp-facility-grid">
          <div className="ccp-facility-media">
            <img src="/images/community_hero.jpg" alt="कम्युनिटी सेंटर सुविधा" />
            <div className="ccp-hours">
              <h4>🕘 केंद्राचे वेळापत्रक</h4>
              <div className="ccp-hours-row"><span>सोमवार – शनिवार</span><b>९:०० – ७:००</b></div>
              <div className="ccp-hours-row"><span>अभ्यासिका</span><b>७:०० – १०:००</b></div>
              <div className="ccp-hours-row"><span>रविवार</span><b>फक्त अभ्यासिका</b></div>
              <div className="ccp-hours-note">* वेळा स्थानिक केंद्रानुसार बदलू शकतात</div>
            </div>
          </div>
          <div>
            <span className="ccp-eyebrow">केंद्रातील सुविधा</span>
            <h2 className="ccp-h2">एका आदर्श केंद्रात काय मिळते?</h2>
            <p className="ccp-lead">
              प्रत्येक जिल्हा व तालुका केंद्र किमान सुविधा मानकांनुसार उभारले जाते, जेणेकरून विद्यार्थी, महिला,
              शेतकरी व ज्येष्ठ नागरिक — सर्वांना एकाच ठिकाणी मदत मिळेल.
            </p>
            <div className="ccp-facilities">
              {FACILITIES.map((f) => (
                <div className="ccp-facility" key={f.label}>
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* POSTER GALLERY */}
      <section id="gallery" className="ccp-section ccp-gallery-bg">
        <div className="ccp-wrap">
          <div className="ccp-head center" style={{ marginBottom: '20px' }}>
            <span className="ccp-eyebrow">उपक्रम पोस्टर गॅलरी</span>
            <h2 className="ccp-h2">१५ उपक्रम — एका नजरेत</h2>
            <p className="ccp-lead">बाजूला सरकवा आणि कोणत्याही पोस्टरवर क्लिक करून संपूर्ण माहिती पहा.</p>
          </div>
          <div className="ccp-gallery">
            {EVENTS_DATA.map((e) => (
              <button type="button" className="ccp-gallery-item" key={e.id} onClick={() => setActiveEvent(e)} aria-label={e.title}>
                <span className="ccp-gcard">
                  <span className="ccp-gimg"><EventImage evt={e} /></span>
                  <span className="ccp-gcap">
                    <b>{e.title.split('(')[0].trim()}</b>
                    <span>{e.emoji} {e.monthLabel}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DAY AT THE CENTRE */}
      <section id="day" className="ccp-section ccp-day-bg">
        <div className="ccp-wrap" style={{ position: 'relative' }}>
          <div className="ccp-head center">
            <span className="ccp-eyebrow">एक दिवस केंद्रात</span>
            <h2 className="ccp-h2">सकाळपासून रात्रीपर्यंत — केंद्र कसे चालते?</h2>
            <p className="ccp-lead">एका सामान्य दिवशी तालुका केंद्रात घडणाऱ्या गोष्टींची झलक (नमुना वेळापत्रक).</p>
          </div>
          <div className="ccp-day">
            {DAY_PLAN.map((d) => (
              <div className="ccp-day-item" key={d.time}>
                <span className="ccp-day-icon">{d.icon}</span>
                <span className="ccp-day-time">{d.time}</span>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ccp-paithani" aria-hidden="true" />

      {/* EVENTS */}
      <section id="events" className="ccp-section ccp-events-bg">
        <div className="ccp-wrap">
          <div className="ccp-head">
            <span className="ccp-eyebrow">वार्षिक कॅलेंडर</span>
            <h2 className="ccp-h2">वर्षभरातील १५ प्रमुख महा-उपक्रम</h2>
            <p className="ccp-lead">महिना, स्तर किंवा शोधाद्वारे कार्यक्रम निवडा आणि “पूर्ण माहिती” वर क्लिक करून सविस्तर तपशील वाचा.</p>
          </div>

          <div className="ccp-featured">
            <div className="ccp-featured-img"><EventImage evt={nextEvent} /></div>
            <div className="ccp-featured-body">
              <span className="ccp-featured-kicker">⏳ पुढील प्रमुख उपक्रम • {nextEvent.monthLabel}</span>
              <h3>{nextEvent.emoji} {nextEvent.title}</h3>
              <p>{nextEvent.short}</p>
              <div className="ccp-featured-meta">
                <span>📍 {nextEvent.level}</span>
                <span>⏱ {nextEvent.details.duration}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" className="ccp-btn ccp-btn-primary ccp-btn-sm" onClick={() => setActiveEvent(nextEvent)}>पूर्ण माहिती →</button>
                <Link to="/contact" className="ccp-btn ccp-btn-outline-light ccp-btn-sm">सहभाग नोंदवा</Link>
              </div>
            </div>
          </div>

          <div className="ccp-months" role="group" aria-label="महिना निवडा">
            {MONTHS.map((m) => {
              const count = monthCounts[m.key] || 0;
              return (
                <button
                  type="button"
                  key={m.key}
                  className={`ccp-month ${selectedMonth === m.key ? 'active' : ''} ${currentMonth === m.key ? 'is-current' : ''}`}
                  onClick={() => setSelectedMonth(selectedMonth === m.key ? 'all' : m.key)}
                  disabled={count === 0}
                  title={count ? `${count} कार्यक्रम` : 'या महिन्यात नियोजित कार्यक्रम नाही'}
                >
                  <span className="ccp-month-name">{m.label}</span>
                  <span className="ccp-month-dots">{Array.from({ length: count }).map((_, i) => <i key={i} />)}</span>
                </button>
              );
            })}
          </div>

          <div className="ccp-toolbar">
            <div className="ccp-toolbar-left">
              <button type="button" className={`ccp-pill ${selectedMonth === 'all' ? 'active' : ''}`} onClick={() => setSelectedMonth('all')}>
                सर्व महिने
              </button>
              <button type="button" className={`ccp-pill ${selectedMonth === 'any' ? 'active' : ''}`} onClick={() => setSelectedMonth('any')}>
                वर्षभर / हंगामी ({monthCounts.any || 0})
              </button>
              <span style={{ width: '1px', background: 'var(--ccp-line)', margin: '0 4px' }} />
              {LEVEL_FILTERS.map((l) => (
                <button
                  type="button"
                  key={l.key}
                  className={`ccp-pill ${selectedLevel === l.key ? 'active' : ''}`}
                  onClick={() => setSelectedLevel(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <label className="ccp-search">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="कार्यक्रम शोधा… (उदा. आरोग्य, Job)"
                aria-label="कार्यक्रम शोधा"
              />
            </label>
          </div>

          <div className="ccp-result-count">{filteredEvents.length} कार्यक्रम दाखवत आहे</div>

          {filteredEvents.length === 0 ? (
            <div className="ccp-empty">
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔎</div>
              <p style={{ margin: '0 0 16px' }}>निवडलेल्या फिल्टरनुसार कोणताही कार्यक्रम सापडला नाही.</p>
              <button type="button" className="ccp-btn ccp-btn-ghost ccp-btn-sm" onClick={resetFilters}>फिल्टर रीसेट करा</button>
            </div>
          ) : (
            <div className="ccp-evt-grid">
              {filteredEvents.map((evt) => (
                <article key={evt.id} className="ccp-evt-card">
                  <div className="ccp-evt-media"><EventImage evt={evt} /></div>
                  <div className="ccp-evt-body">
                    <div className="ccp-evt-chips">
                      <span className="ccp-evt-month">📅 {evt.monthLabel}</span>
                      <span className="ccp-evt-level">{evt.level}</span>
                    </div>
                    <div className="ccp-evt-badge">{evt.emoji} {evt.badge}</div>
                    <h3>{evt.title}</h3>
                    <p>{evt.short}</p>
                    <div className="ccp-evt-meta">
                      <div><b>⏱ कालावधी:</b><span>{evt.details.duration}</span></div>
                      <div><b>👥 कोणासाठी:</b><span>{evt.details.target}</span></div>
                    </div>
                    <div className="ccp-evt-actions">
                      <button type="button" className="ccp-btn ccp-btn-primary ccp-btn-sm" onClick={() => setActiveEvent(evt)}>
                        पूर्ण माहिती →
                      </button>
                      <Link to="/contact" className="ccp-btn ccp-btn-ghost ccp-btn-sm">संपर्क</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="ccp-section">
        <div className="ccp-wrap">
          <div className="ccp-head center">
            <span className="ccp-eyebrow">सेवा कशी घ्यावी</span>
            <h2 className="ccp-h2">चार सोप्या टप्प्यांत केंद्राशी जोडा</h2>
          </div>
          <div className="ccp-process">
            <div className="ccp-steps">
              {STEPS.map((s) => (
                <div className="ccp-step" key={s.n}>
                  <div className="ccp-step-n">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="ccp-docs">
              <h3>📂 सोबत आणावयाची कागदपत्रे</h3>
              <p>बहुतांश सेवा व नोंदणीसाठी सामान्यतः लागणारी कागदपत्रे</p>
              <ul>
                {DOCUMENTS.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* GET INVOLVED */}
      <section id="join" className="ccp-section" style={{ paddingTop: 0 }}>
        <div className="ccp-wrap">
          <div className="ccp-head center">
            <span className="ccp-eyebrow">सहभागी व्हा</span>
            <h2 className="ccp-h2">समाजकार्यात आपले योगदान द्या</h2>
          </div>
          <div className="ccp-roles">
            {ROLES.map((r) => (
              <div className="ccp-role" key={r.title}>
                <div className="ccp-role-icon">{r.icon}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <Link to={r.to}>{r.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="ccp-section ccp-network-bg">
        <div className="ccp-wrap ccp-faq-wrap">
          <div>
            <span className="ccp-eyebrow">प्रश्नोत्तरे</span>
            <h2 className="ccp-h2">नेहमी विचारले जाणारे प्रश्न</h2>
            <p className="ccp-lead" style={{ marginBottom: '24px' }}>आपला प्रश्न येथे नसल्यास आमच्या टीमशी थेट संपर्क साधा.</p>
            <Link to="/contact" className="ccp-btn ccp-btn-ghost">प्रश्न विचारा</Link>
          </div>
          <div>
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div className={`ccp-faq-item ${isOpen ? 'open' : ''}`} key={f.q}>
                  <button type="button" className="ccp-faq-q" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : i)}>
                    <span>{f.q}</span>
                    <i>+</i>
                  </button>
                  {isOpen && <p className="ccp-faq-a">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="ccp-paithani" aria-hidden="true" />

      {/* CTA */}
      <section className="ccp-section">
        <div className="ccp-wrap">
          <div className="ccp-cta">
            <svg className="ccp-cta-art" viewBox="0 0 500 500" aria-hidden="true">
              <WarliInk width={1.6}>
                <WarliRing cx={250} cy={250} R={206} n={18} s={1.9} />
              </WarliInk>
            </svg>
            <div>
              <h2>🚩 आपल्या तालुका किंवा जिल्ह्यात उपक्रम राबवायचा आहे?</h2>
              <p>
                कम्युनिटी सेंटर सुरू करण्यासाठी अथवा वरील १५ पैकी कोणत्याही कार्यक्रमाचे आयोजन करण्यासाठी आजच संपर्क साधा —
                राज्य टीम आपल्याला संपूर्ण मार्गदर्शन करेल.
              </p>
            </div>
            <div className="ccp-cta-actions">
              <Link to="/contact" className="ccp-btn ccp-btn-white">कम्युनिटी सेंटरसाठी अर्ज करा →</Link>
              <Link to="/register" className="ccp-btn ccp-btn-outline-light">सभासद म्हणून नोंदणी करा</Link>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT DETAILS MODAL */}
      {activeEvent && (
        <div className="ccp-modal-backdrop" onClick={() => setActiveEvent(null)}>
          <div className="ccp-modal" role="dialog" aria-modal="true" aria-label={activeEvent.title} onClick={(e) => e.stopPropagation()}>
            <div className="ccp-modal-hero">
              <EventImage evt={activeEvent} />
              <button type="button" className="ccp-modal-close" onClick={() => setActiveEvent(null)} aria-label="बंद करा">✕</button>
            </div>
            <div className="ccp-modal-body">
              <span className="ccp-evt-month">{activeEvent.emoji} {activeEvent.badge}</span>
              <h3 className="ccp-modal-title">{activeEvent.title}</h3>
              <div className="ccp-modal-facts">
                <div className="ccp-fact"><small>महिना</small><span>{activeEvent.monthLabel}</span></div>
                <div className="ccp-fact"><small>स्तर</small><span>{activeEvent.level}</span></div>
                <div className="ccp-fact"><small>कालावधी</small><span>{activeEvent.details.duration}</span></div>
                <div className="ccp-fact"><small>लक्ष्य गट</small><span>{activeEvent.details.target}</span></div>
              </div>
              <div className="ccp-modal-block">
                <h4>कार्यक्रमाचे सविस्तर स्वरूप</h4>
                <p>{activeEvent.details.what}</p>
              </div>
              <div className="ccp-modal-block">
                <h4>कोण सहभागी होऊ शकतो?</h4>
                <ul>
                  {activeEvent.details.who.map((w) => <li key={w}>{w}</li>)}
                </ul>
              </div>
              <div className="ccp-modal-block benefit">
                <h4>✨ फायदे व महत्त्व</h4>
                <p>{activeEvent.details.benefits}</p>
              </div>
              <div className="ccp-modal-block">
                <h4>नोंदणी प्रक्रिया</h4>
                <p>{activeEvent.details.registration}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
                <Link to="/contact" className="ccp-btn ccp-btn-primary ccp-btn-sm">सहभागासाठी संपर्क →</Link>
                <button type="button" className="ccp-btn ccp-btn-ghost ccp-btn-sm" onClick={() => setActiveEvent(null)}>बंद करा</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
