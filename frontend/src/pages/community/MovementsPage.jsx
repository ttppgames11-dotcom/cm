import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_MOVEMENTS = [
  {
    id: 'm1',
    category: 'muk_morcha',
    categoryLabel: 'मूक मोर्चे ५८',
    title: 'मराठा क्रांती मूक मोर्चे (५८ ऐतिहासिक शांततामय मोर्चे व आझाद मैदान महामोर्चा)',
    period: '९ ऑगस्ट २०१६ – ९ ऑगस्ट २०१७',
    participants: '५ कोटी+ अबालवृद्ध, माता-भगिनी व युवक',
    locations: 'औरंगाबाद (पहिली ऐतिहासिक ठिणगी) ते मुंबई आझाद मैदान (महामोर्चा)',
    image: '/assets/images/morcha-58-silent-rally.jpg',
    imageCaption: '५८ मूक मोर्चे: जगातील सर्वात शिस्तबद्ध व शांततामय जनसागर (Mumbai Azad Maidan & District Rallies)',
    desc: 'जगातील मानवी लोकशाही इतिहासातील सर्वात मोठा, अभूतपूर्व, शांततामय आणि शिस्तबद्ध जनआक्रोश! कोपर्डी घटनेच्या तीव्र संतापातून ९ ऑगस्ट २०१६ रोजी छत्रपती संभाजीनगर (औरंगाबाद) येथून सुरू झालेले हे वादळ संपूर्ण महाराष्ट्रात ५८ मूक मोर्चांच्या रूपाने धडकले. मोर्चात कोणताही राजकीय नेता व्यासपीठावर नव्हता; मोर्चेकऱ्यांनी रस्त्यावर एकही कचरा सोडला नाही, रुग्णवाहिकेला तात्काळ मार्ग दिला आणि मोर्चा संपल्यानंतर रस्ता स्वतः झाडून स्वच्छ केला. मोर्चाच्या अग्रभागी लहान मुलींनी चालून जिल्हाधिकाऱ्यांना अत्यंत अभ्यासपूर्ण निवेदने सादर केली.',
    keyStats: [
      { label: 'एकूण जिल्हे व तालुके', value: '३६ जिल्हे व ५८ महामोर्चे' },
      { label: 'एक मराठा लाख मराठा', value: 'अहिंसक शिस्त व ऐतिहासिक ऐक्य' },
      { label: 'नेतृत्व', value: 'माता-भगिनी व रणरागिणी मुलींचे नेतृत्व' },
      { label: 'जागतिक विक्रम', value: 'एकही अनुचित प्रकार न घडता ५ कोटी लोक रस्त्यावर' }
    ],
    demands: [
      'कोपर्डी घटनेतील नराधम गुन्हेगारांना जलद गतीने फाशीची शिक्षा',
      'मराठा समाजाला शिक्षण व शासकीय नोकऱ्यांमध्ये हक्काचे सामाजिक व शैक्षणिक आरक्षण',
      'ॲट्रॉसिटी कायद्याचा निष्पापांवर होणारा गैरवापर रोखण्यासाठी आवश्यक कायदेशीर सुधारणा',
      'शेतकऱ्यांना स्वामिनाथन आयोगानुसार उत्पादन खर्चावर आधारित ५०% नफ्यासह हमीभाव व संपूर्ण कर्जमुक्ती',
      'अरबी समुद्रातील छत्रपती शिवाजी महाराज आंतरराष्ट्रीय शिवस्मारकाचे काम त्वरित पूर्ण करणे',
      'मराठा समाजातील गुणवंत विद्यार्थ्यांसाठी वसतिगृहे, शिष्यवृत्ती व स्पर्धा परीक्षा केंद्रे उभारणे'
    ],
    outcomes: [
      'महाराष्ट्र शासनाकडून १६% SEBC मराठा आरक्षण कायदा विधिमंडळात एकमुखाने संमत',
      'छत्रपती शाहू महाराज संशोधन, प्रशिक्षण व मानव विकास संस्था (SARTHI) ची स्वायत्त स्थापना',
      'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना लागू (मासिक ३,००० ते ५,००० रु. थेट खात्यात)',
      'अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळाचे पुनरुज्जीवन व बिनव्याजी कर्जवाटप सुरू',
      'कोपर्डी खटल्यात आरोपींना फाशीची शिक्षा ठोठावून जलद न्यायनिर्णय'
    ],
    verified: true
  },
  {
    id: 'm7',
    category: 'satyagraha',
    categoryLabel: 'मराठवाडा आमरण उपोषण',
    title: 'अंतरवाली सराटी आमरण उपोषण व कुणबी नोंद शोध मोहीम',
    period: '२०२३ – २०२४ (सद्यस्थिती)',
    participants: 'लाखो गावकरी, शेतकरी व समस्त समाज',
    locations: 'अंतरवाली सराटी (जि. जालना), आझाद मैदान व संपूर्ण महाराष्ट्र',
    image: '/assets/images/real-jarange-antarwali-speech.jpg',
    imageFit: 'cover',
    imagePosition: 'center center',
    imageCaption: 'मनोज जरांगे पाटील — अंतरवाली सराटी (जि. जालना) व्यासपीठावरून समाज, गावकरी व शिष्टमंडळाला संबोधित करताना',
    desc: 'जालना जिल्ह्यातील अंतरवाली सराटी या छोट्याशा गावातून मनोज जरांगे पाटील यांच्या नेतृत्वाखाली सुरू झालेले आमरण उपोषण पाहता पाहता संपूर्ण महाराष्ट्रात पेटून उठले. लाठीहल्ल्यानंतरही आंदोलकांनी अहिंसा व शांततेचा मार्ग सोडला नाही. सगेसोयरे अध्यादेश, निजामकालीन व हैदराबाद संस्थानातील कुणबी नोंदी शोधून मराठ्यांना हक्काचे ओबीसी/कुणबी प्रमाणपत्र देण्याची मागणी या आंदोलनाने ऐरणीवर आणली.',
    keyStats: [
      { label: 'प्रमुख केंद्र', value: 'अंतरवाली सराटी (जि. जालना)' },
      { label: 'शोधलेल्या कुणबी नोंदी', value: '५७ लाखांहून अधिक ऐतिहासिक नोंदी' },
      { label: 'समिती', value: 'न्यायमूर्ती संदीप शिंदे (निवृत्त) समिती गठीत' },
      { label: 'मार्ग', value: 'महात्मा गांधी प्रणित आमरण उपोषण व सत्याग्रह' }
    ],
    demands: [
      'मराठा आणि कुणबी एकच असल्याचे पुरावे ग्राह्य धरून कुणबी जात प्रमाणपत्र देणे',
      'रक्ताच्या नातेवाईकांना (सगेसोयरे) शपथपत्राच्या आधारे प्रमाणपत्र देण्याचा शासन निर्णय पारित करणे',
      'आंदोलकांवरील दाखल झालेले सर्व गुन्हे त्वरित व बिनशर्त मागे घेणे',
      'हैदराबाद गॅझेटिअर, सातारा गॅझेटिअर व बॉम्बे प्रेसिडेन्सी अभिलेखांची अधिकृत अंमलबजावणी'
    ],
    outcomes: [
      'न्यायमूर्ती संदीप शिंदे समितीमार्फत महाराष्ट्रात ५७ लाखांहून अधिक कुणबी नोंदींचा शोध',
      'लाखो मराठा कुटुंबांना अधिकृत कुणबी दाखल्यांचे वितरण सुरू',
      'शासनाकडून विशेष अधिवेशन बोलावून १०% स्वतंत्र मराठा आरक्षण कायदा पारित',
      'आंदोलकांवरील अनेक खटले मागे घेण्याची शासकीय अधिसूचना'
    ],
    verified: true
  },
  {
    id: 'm2',
    category: 'reservation',
    categoryLabel: 'आरक्षण लढा',
    title: 'मराठा आरक्षण घटनात्मक व न्यायालयीन संघर्ष (Supreme Court & High Court Battle)',
    period: '२०१८ – चालू',
    participants: 'समस्त समाज, ज्येष्ठ विधीज्ञ, इतिहासकार व अभ्यासक',
    locations: 'मुंबई उच्च न्यायालय, सर्वोच्च न्यायालय, नवी दिल्ली',
    image: '/assets/images/morcha-court-battle.jpg',
    imageCaption: 'मुंबई उच्च न्यायालय व सर्वोच्च न्यायालयात ऐतिहासिक गॅझेटिअर, मोडी लिपी व वंशावळी पुराव्यांचा लढा',
    desc: 'न्यायमूर्ती एम. जी. गायकवाड मागासवर्ग आयोगाच्या ऐतिहासिक अहवालानंतर राज्य शासनाने पारित केलेले आरक्षण आणि त्यानंतर सर्वोच्च न्यायालयात उभा राहिलेला प्रदीर्घ घटनात्मक लढा. ५०% मर्यादेचे आव्हान, १०२ वी घटनादुरुस्ती, इंद्रा साहनी खटल्याचा फेरविचार आणि सध्या सुरू असलेली क्युरेटिव्ह याचिका. मराठा समाजाचा सामाजिक, शैक्षणिक व आर्थिक मागासलेपणा सिद्ध करण्यासाठी हजारो ऐतिहासिक पुरावे न्यायालयात मांडले गेले.',
    keyStats: [
      { label: 'मागासवर्ग आयोग', value: 'न्यायमूर्ती गायकवाड व न्यायमूर्ती शुक्रे आयोग' },
      { label: 'उच्च न्यायालय निकाल', value: 'मुंबई उच्च न्यायालयाकडून आरक्षणाची वैधता सिद्ध' },
      { label: 'ऐतिहासिक पुरावे', value: 'बॉम्बे प्रेसिडेन्सी व निजामकालीन गॅझेटिअर' },
      { label: 'सद्यस्थिती', value: '१०% स्वतंत्र कायदा व क्युरेटिव्ह पिटिशन' }
    ],
    demands: [
      'मराठा समाजाचा सामाजिक व शैक्षणिक मागासलेपणा सर्वोच्च न्यायालयात घटनात्मकरित्या सिद्ध करणे',
      'इंद्रा साहनी खटल्यातील ५० टक्क्यांच्या मर्यादेचे ९ न्यायाधीशांच्या खंडपीठाकडून पुनरावलोकन',
      'कुणबी नोंदींची शोध मोहीम व मोडी लिपीतील निजामकालीन वंशावळींची पडताळणी',
      'न्यायालयीन प्रक्रियेदरम्यान मराठा विद्यार्थ्यांना EWS व खुल्या प्रवर्गात संपूर्ण संरक्षण'
    ],
    outcomes: [
      'मुंबई उच्च न्यायालयाकडून जून २०१९ मध्ये आरक्षणावर शिक्कामोर्तब',
      'लाखो मराठा-कुणबी दाखल्यांचा शोध व वंशावळींचे डिजिटायझेशन पूर्ण',
      'उच्च शिक्षण व शासकीय भरतीत मराठा विद्यार्थ्यांना EWS व विशेष सवलती लागू',
      'सर्वोच्च न्यायालयात क्युरेटिव्ह याचिका दाखल होऊन फेरसुनावणीची दालने खुली'
    ],
    verified: true
  },
  {
    id: 'm3',
    category: 'education',
    categoryLabel: 'शिक्षण व युवा',
    title: 'सारथी (SARTHI) संस्था स्वायत्तता व विद्यार्थी एल्गार',
    period: '२०१८ – चालू',
    participants: 'लाखो विद्यार्थी, संशोधक व स्पर्धा परीक्षा उमेदवार',
    locations: 'पुणे मुख्यालय, नाशिक, छत्रपती संभाजीनगर, कोल्हापूर उपकेंद्रे',
    image: '/assets/images/morcha-sarthi-academy.jpg',
    imageCaption: 'सारथी (SARTHI) संस्थेच्या माध्यमातून यूपीएससी, एमपीएससी व पीएचडी संशोधक घडवणारी विद्यार्थी क्रांती',
    desc: 'राजर्षी छत्रपती शाहू महाराज संशोधन, प्रशिक्षण व मानव विकास संस्था (सारथी) च्या माध्यमातून मराठा व कुणबी विद्यार्थ्यांना यूपीएससी, एमपीएससी, सैन्य दल आणि पीएचडी संशोधनासाठी स्वायत्त निधी मिळवून देणारी अभूतपूर्व विद्यार्थी चळवळ. आंदोलनांच्या दबावामुळे शासनाने सारथीला स्वायत्तता दिली आणि दरवर्षी कोट्यवधींचा अर्थसंकल्पीय निधी उपलब्ध करून दिला.',
    keyStats: [
      { label: 'संस्थेचे नाव', value: 'राजर्षी छत्रपती शाहू महाराज संस्था (सारथी)' },
      { label: 'वार्षिक तरतूद', value: '५०० ते १,००० कोटी रुपयांचा निधी' },
      { label: 'लाभार्थी विद्यार्थी', value: '५ लाखांहून अधिक युवक-युवती' },
      { label: 'फेलोशिप्स', value: 'छत्रपती संभाजीराजे राष्ट्रीय पीएचडी फेलोशिप' }
    ],
    demands: [
      'सारथी संस्थेला बार्टी (BARTI) च्या धर्तीवर १००% प्रशासकीय व आर्थिक स्वायत्तता',
      'परदेशी उच्चशिक्षणासाठी जाणाऱ्या विद्यार्थ्यांना १००% पूर्ण शिष्यवृत्ती वेळेवर देणे',
      'महाराष्ट्रातील सर्व ३६ जिल्ह्यांत भव्य अभ्यासिका, वसतिगृहे व मोफत निवासी कोचिंग',
      'पीएचडी व एमफिल संशोधक विद्यार्थ्यांना नियमित मासिक फेलोशिप वाटप'
    ],
    outcomes: [
      'हजारो मराठा तरुण स्पर्धा परीक्षा उत्तीर्ण होऊन IAS, IPS, उपजिल्हाधिकारी व DySP पदांवर रुजू',
      'पीएचडी करणाऱ्या हजारो विद्यार्थ्यांना छत्रपती संभाजीराजे राष्ट्रीय फेलोशिप मंजूर',
      'विदेशी नामांकित विद्यापीठात शिक्षणासाठी दरवर्षी ७५ विद्यार्थ्यांना पूर्ण शिष्यवृत्ती सुरू',
      'पुणे, नाशिक, कोल्हापूर येथे सारथीची स्वतःची अद्ययावत उपकेंद्रे व अभ्यासिका कार्यरत'
    ],
    verified: true
  },
  {
    id: 'm4',
    category: 'business',
    categoryLabel: 'आर्थिक विकास',
    title: 'अण्णासाहेब पाटील आर्थिक विकास महामंडळ नवउद्योग क्रांती',
    period: '२०१७ – चालू',
    participants: '१,५०,०००+ नवउद्योजक, व्यावसायिक व शेतकरी पुत्र',
    locations: 'महाराष्ट्र राज्यभर (३६ जिल्हे)',
    image: '/assets/images/morcha-annasaheb-patil.jpg',
    imageCaption: 'अण्णासाहेब पाटील महामंडळाच्या बिनव्याजी कर्ज योजनेतून उभारलेले आधुनिक उद्योग व मॅन्युफॅक्चरिंग प्लांट्स',
    desc: 'मराठा तरुणांना व्यवसायासाठी भांडवल मिळावे, नोकरी मागणारे नव्हे तर नोकरी देणारे उद्योजक घडावेत यासाठी मराठा आंदोलनांच्या रेट्यातून अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळाचे संपूर्ण पुनरुज्जीवन करण्यात आले. १० लाख ते १५ लाखांपर्यंतचे बिनव्याजी कर्ज आणि संपूर्ण १२% व्याजाचा परतावा शासन थेट बँकेत भरते. आज महाराष्ट्रातील कानाकोपऱ्यात लाखो मराठा नवउद्योजक यशस्वीपणे उभे राहिले आहेत.',
    keyStats: [
      { label: 'योजना', value: 'वैयक्तिक कर्ज व्याज परतावा योजना (IR-I)' },
      { label: 'कर्ज मर्यादा', value: '१५ लाखांपर्यंत बिनव्याजी अर्थसाहाय्य' },
      { label: 'यशस्वी उद्योजक', value: '८५,०००+ हून अधिक उद्योग उभे' },
      { label: 'वितरित निधी', value: '६,०००+ कोटी रुपयांच्या कर्जाचे वाटप' }
    ],
    demands: [
      'राष्ट्रीयीकृत व सहकारी बँकांकडून होणारी तरुणांची अडवणूक थांबवणे व सुलभ कर्ज मंजुरी',
      'वैयक्तिक कर्ज मर्यादा १५ लाखांवरून २५ लाख व गटप्रकल्पांसाठी ५० लाखांपर्यंत वाढवणे',
      'शेतकरी पुत्रांना ॲग्रो-प्रोसेसिंग, कोल्ड स्टोरेज व ट्रान्सपोर्टसाठी विनाअडथळा भांडवल',
      'महिला बचत गट व महिला उद्योजकांसाठी विशेष सवलती योजना'
    ],
    outcomes: [
      '८५,००० हून अधिक मराठा तरुणांना स्वतःचा यशस्वी मॅन्युफॅक्चरिंग, डेअरी व आयटी उद्योग उभारण्यास यश',
      'शासनाने ६००+ कोटी रुपयांहून अधिक व्याज परतावा थेट बँकांना अदा केला',
      'गटकर्ज योजनेतून शेकडो सहकारी उद्योग व प्रक्रिया उद्योग उभे राहिले'
    ],
    verified: true
  },
  {
    id: 'm5',
    category: 'forts',
    categoryLabel: 'गड संवर्धन',
    title: 'सह्याद्री गडकोट संरक्षण, स्वच्छता व अतिक्रमणमुक्ती महाअभियान',
    period: 'अखंड अविरत लढा',
    participants: 'लाखो दुर्गप्रेमी मावळे, इतिहासप्रेमी व गडकोट संघटना',
    locations: 'रायगड, विशाळगड, प्रतापगड, राजगड, सिंहगड, शिवनेरी, पन्हाळा',
    image: '/assets/images/morcha-fort-conservation.jpg',
    imageCaption: 'सह्याद्रीतील ३५०+ गडकोटांवर भगवा ध्वज फडकवून दुर्गसंवर्धन व अतिक्रमणमुक्ती करणारा मावळ्यांचा एल्गार',
    desc: 'छत्रपती शिवाजी महाराजांच्या ३५०+ अभेद्य गडकिल्ल्यांवरील अनधिकृत अतिक्रमणे हटवण्यासाठी, प्लास्टिकमुक्तीसाठी, ऐतिहासिक तोफा व शिलालेख जतन करण्यासाठी उभा राहिलेला व्यापक सामूहिक लोकसहभाग. विशाळगड, प्रतापगड पायथा आणि लोहगड येथील अतिक्रमणमुक्ती हा या आंदोलनाचा सर्वात मोठा विजय ठरला. लाखो तरुणांनी श्रमदानातून किल्ल्यांवर पाण्याच्या टाक्या स्वच्छ केल्या व बुरुज पुनरुज्जीवित केले.',
    keyStats: [
      { label: 'किल्ले व्याप्ती', value: 'सह्याद्रीतील ३५०+ गडकोट व जलदुर्ग' },
      { label: 'श्रमदान', value: 'दर रविवारी हजारो दुर्गप्रेमींचे श्रमदान' },
      { label: 'अतिक्रमणमुक्ती', value: 'विशाळगड व प्रतापगड पायथा कायदेशीर मुक्ती' },
      { label: 'प्राधिकरण', value: 'रायगड विकास प्राधिकरणाची स्थापना' }
    ],
    demands: [
      'ऐतिहासिक गडकिल्ल्यांवरील सर्व प्रकारची अनधिकृत बांधकामे व अतिक्रमणे त्वरित हटवणे',
      'गडकिल्ल्यांच्या ३०० मीटर परिसरात दारू, मांस विक्री, पार्ट्या व गैरवर्तनावर कठोर कायदेशीर बंदी',
      'भारतीय पुरातत्व सर्वेक्षण (ASI) व राज्य पुरातत्व विभागाकडून किल्ल्यांचे मूळ स्वरूपात जतन',
      'गडांवर पिण्याचे पाणी, स्वच्छतागृहे आणि अधिकृत इतिहास माहितीफलक लावणे'
    ],
    outcomes: [
      'प्रतापगड पायथा व विशाळगडावरील शतकानुशतके झालेली अतिक्रमणे न्यायालयाच्या आदेशाने निष्कासित',
      'रायगड विकास प्राधिकरणास ६००+ कोटींचा विशेष शासकीय निधी मंजूर व जिर्णोद्धार सुरू',
      '१००+ किल्ल्यांवर नियमित स्वच्छता, प्लॅस्टिकमुक्ती आणि फलक व्यवस्थापन कार्यरत'
    ],
    verified: true
  },
  {
    id: 'm6',
    category: 'farmers',
    categoryLabel: 'कृषी व शेतकरी',
    title: 'बळीराजा हक्क एल्गार — शेतकरी कर्जमुक्ती व हमीभाव लढा',
    period: '२०१७ – चालू',
    participants: 'लाखो शेतकरी, शेतमजूर, अन्नदाते व कृषी संघटना',
    locations: 'पुणतांबा (ऐतिहासिक शेतकरी संप) ते मंत्रालय मुंबई',
    image: '/assets/images/morcha-farmers-elgar.jpg',
    imageCaption: 'पुणतांबा ते मुंबई — महाराष्ट्रातील बळीराजाचा ऐतिहासिक शेतकरी संप व ट्रॅक्टर रॅली',
    desc: 'महाराष्ट्रातील मराठा-कुणबी शेतकऱ्यांच्या वाढत्या आत्महत्या रोखण्यासाठी, दुधाला रास्त दर, शेतमालाला हमीभाव आणि संपूर्ण कर्जमाफीसाठी उभा राहिलेला ऐतिहासिक शेतकरी संप. १ जून २०१७ रोजी अहमदनगरमधील पुणतांबा गावातून सुरू झालेल्या संपाने मुंबई-पुण्यासारख्या महानगरांचे अन्नधान्य व दूध रोखून धरले. शेतकऱ्यांनी प्रथमच आपल्या एकीच्या बळावर सरकारला गुडघे टेकण्यास भाग पाडले.',
    keyStats: [
      { label: 'उगम स्थान', value: 'पुणतांबा गाव (जि. अहमदनगर)' },
      { label: 'कर्जमाफी रक्कम', value: '३४,००० कोटी रुपयांची ऐतिहासिक कर्जमाफी' },
      { label: 'सहभाग', value: 'महाराष्ट्रातील लाखो शेतकरी कुटुंबे' },
      { label: 'प्रमुख साधन', value: 'अहिंसक अन्नधान्य-दूध संप व ट्रॅक्टर मोर्चे' }
    ],
    demands: [
      'छत्रपती शिवाजी महाराज शेतकरी सन्मान योजना — शेतकऱ्यांची संपूर्ण सातबारा कोरी कर्जमुक्ती',
      'डॉ. एम. एस. स्वामिनाथन आयोगाच्या शिफारशींनुसार उत्पादन खर्चावर आधारित दीडपट हमीभाव',
      'गायीच्या दुधाला प्रति लिटर किमान ३५ रुपये दर व थेट बँक खात्यात अनुदान',
      'विमा कंपन्यांची नफेखोरी रोखून पीक विम्याची १००% नुकसानभरपाई शेतकऱ्यांना देणे'
    ],
    outcomes: [
      'महाराष्ट्र शासनाकडून ३४,००० कोटी रुपयांची ऐतिहासिक छत्रपती शिवाजी महाराज शेतकरी कर्जमाफी जाहीर',
      'दूध उत्पादक शेतकऱ्यांना थेट ५ रुपये प्रति लिटर शासकीय अनुदान लागू',
      'नियमित कर्ज भरणाऱ्या शेतकऱ्यांना ५०,००० रुपयांचे प्रोत्साहनपर अनुदान'
    ],
    verified: true
  }
];

export default function MovementsPage() {
  const [movements, setMovements] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_movements_archive_data_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MOVEMENTS;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'muk_morcha',
    categoryLabel: 'मूक मोर्चे ५८',
    period: '',
    participants: '',
    locations: '',
    image: '',
    imageCaption: '',
    desc: '',
    demandsStr: '',
    outcomesStr: '',
    verified: true
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_movements_archive_data_v7', JSON.stringify(movements));
    } catch (e) {
      console.error(e);
    }
  }, [movements]);

  const filteredMovements = movements.filter(m => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesQuery = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.locations.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      category: 'muk_morcha',
      categoryLabel: 'सामाजिक लढा',
      period: '२०२६',
      participants: '१,००,०००+ बांधव',
      locations: 'महाराष्ट्र',
      image: '/assets/images/morcha-58-silent-rally.jpg',
      imageCaption: 'शांततामय जनआंदोलन',
      desc: '',
      demandsStr: 'आरक्षण व संरक्षण\nशैक्षणिक सवलती',
      outcomesStr: 'शासन निर्णय व लाभ',
      verified: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      categoryLabel: item.categoryLabel,
      period: item.period,
      participants: item.participants,
      locations: item.locations,
      image: item.image || '/assets/images/morcha-58-silent-rally.jpg',
      imageCaption: item.imageCaption || item.title,
      desc: item.desc,
      demandsStr: Array.isArray(item.demands) ? item.demands.join('\n') : '',
      outcomesStr: Array.isArray(item.outcomes) ? item.outcomes.join('\n') : '',
      verified: !!item.verified
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('हा चळवळ दस्तऐवज हटवायचा आहे का?')) {
      setMovements(movements.filter(m => m.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व चळवळ दस्तऐवज मूळ अधिकृत डेटावर रीसेट करायचे आहेत का?')) {
      setMovements(DEFAULT_MOVEMENTS);
      localStorage.setItem('cm_movements_archive_data_v2', JSON.stringify(DEFAULT_MOVEMENTS));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.desc.trim()) {
      alert('कृपया चळवळीचे नाव आणि विवरण प्रविष्ट करा.');
      return;
    }

    const demandsArr = formData.demandsStr
      ? formData.demandsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const outcomesArr = formData.outcomesStr
      ? formData.outcomesStr.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    if (editItem) {
      setMovements(movements.map(m => m.id === editItem.id ? {
        ...m,
        ...formData,
        demands: demandsArr,
        outcomes: outcomesArr
      } : m));
    } else {
      const newMovement = {
        id: 'mov_' + Date.now(),
        ...formData,
        demands: demandsArr,
        outcomes: outcomesArr
      };
      setMovements([newMovement, ...movements]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      
      {/* Lightbox Zoom Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            cursor: 'pointer'
          }}
        >
          <img
            src={lightboxImage.url}
            alt={lightboxImage.caption}
            style={{ maxWidth: '92vw', maxHeight: '82vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', objectFit: 'contain' }}
          />
          <div style={{ color: '#fef08a', marginTop: '16px', fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Baloo 2', textAlign: 'center' }}>
            {lightboxImage.caption}
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '4px' }}>
            (बंद करण्यासाठी कुठेही क्लिक करा ✕)
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section with Distinct Gateway & Azad Maidan Morcha Banner and Balanced Color Overlay */}
        <div style={{
          position: 'relative',
          backgroundImage: 'linear-gradient(135deg, rgba(35, 7, 7, 0.48) 0%, rgba(95, 20, 10, 0.36) 50%, rgba(18, 3, 3, 0.65) 100%), url(/assets/images/morcha-hero-banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          borderRadius: '20px',
          padding: '38px 30px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '28px',
          boxShadow: '0 16px 40px rgba(45,8,8,0.35)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(5px)', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(254, 240, 138, 0.25)', maxWidth: '840px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.3)', border: '1px solid #DD8A2E', padding: '5px 16px', borderRadius: '24px', marginBottom: '12px' }}>
                <span style={{ color: '#FFD700' }}>✊</span>
                <span style={{ color: '#FDF3E6', fontSize: '0.84rem', fontWeight: 800 }}>
                  ऐतिहासिक लोकआंदोलने • ५८ मूक मोर्चे, आरक्षण लढा व सत्याग्रह महादालन
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: 'clamp(2rem, 4.2vw, 3rem)',
                fontWeight: 900,
                margin: '0 0 10px',
                color: '#FFF',
                lineHeight: 1.2,
                textShadow: '0 3px 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.9)'
              }}>
                मराठा क्रांती मूक मोर्चे व ऐतिहासिक लढा
              </h1>
              <p style={{ color: '#FDF3E6', fontSize: '1rem', margin: 0, lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                ५८ मूक मोर्चे, अंतरवाली सराटी सत्याग्रह, सर्वोच्च न्यायालयातील घटनात्मक लढा, सारथी निर्मिती, अण्णासाहेब पाटील महामंडळ ते दुर्ग संवर्धन महामोहीम — समाज हितासाठी, अन्यायाविरुद्ध आणि स्वाभिमानासाठी उभी राहिलेली लोकआंदोलने.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleOpenAdd}
                style={{
                  background: 'linear-gradient(135deg, #DD8A2E 0%, #C9701C 100%)',
                  color: '#2A0606',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(221,138,46,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                <span>➕</span> नवीन लढा नोंदवा
              </button>
              <button
                onClick={handleResetDefaults}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  color: '#FFF',
                  border: '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(6px)',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}>
                ↺ मूळ डेटा रीसेट
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '26px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(221,138,46,0.4)'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(221,138,46,0.3)' }}>
              <div style={{ fontSize: '0.74rem', color: '#DD8A2E', fontWeight: 700 }}>नोंदवलेले ऐतिहासिक लढे</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>{movements.length} आंदोलने</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(221,138,46,0.3)' }}>
              <div style={{ fontSize: '0.74rem', color: '#DD8A2E', fontWeight: 700 }}>ऐतिहासिक मूक मोर्चे</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>५८ मूक मोर्चे</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(221,138,46,0.3)' }}>
              <div style={{ fontSize: '0.74rem', color: '#DD8A2E', fontWeight: 700 }}>एकूण समाज सहभाग</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ADE80' }}>५ कोटी+ नागरिक</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(221,138,46,0.3)' }}>
              <div style={{ fontSize: '0.74rem', color: '#DD8A2E', fontWeight: 700 }}>कुणबी नोंदींचा शोध</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDBA74' }}>५७ लाख+ नोंदी ✓</div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सर्व आंदोलने' },
              { id: 'muk_morcha', label: '🚩 मूक मोर्चे ५८' },
              { id: 'satyagraha', label: '🌾 अंतरवाली सराटी' },
              { id: 'reservation', label: '⚖️ आरक्षण लढा' },
              { id: 'education', label: '🎓 शिक्षण व युवा' },
              { id: 'business', label: '💼 आर्थिक विकास' },
              { id: 'forts', label: '🏰 दुर्ग संवर्धन' },
              { id: 'farmers', label: '🌾 शेतकरी एल्गार' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: activeCategory === tab.id ? '2px solid #DD8A2E' : '1px solid #E6DDCE',
                  background: activeCategory === tab.id ? '#3D0D0D' : '#FAF6F0',
                  color: activeCategory === tab.id ? '#FFD700' : '#5C534B',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="चळवळ किंवा मागण्या शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E6DDCE',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
              🔍
            </span>
          </div>
        </div>

        {/* Movements Archive Records with Complete Non-cropped Images and Rich Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredMovements.map(m => (
            <div
              key={m.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 8px 30px rgba(45,8,8,0.06)',
                overflow: 'hidden'
              }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF2E6 100%)',
                padding: '24px 28px',
                borderBottom: '1px solid #E6DDCE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#3D0D0D',
                      color: '#FFD700',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {m.categoryLabel || m.category}
                    </span>
                    {m.verified && (
                      <span style={{
                        background: '#E8F5E9',
                        color: '#166534',
                        border: '1px solid #BBF7D0',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        ✓ अधिकृत अभिलेख
                      </span>
                    )}
                    <span style={{ fontSize: '0.84rem', color: '#666' }}>📅 {m.period}</span>
                  </div>

                  <h2 style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: '1.55rem',
                    fontWeight: 800,
                    color: '#2A0606',
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {m.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#C9701C',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    ✏️ संपादित करा
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #E6DDCE',
                      color: '#991B1B',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* COMPACT CINEMATIC BANNER (OPTIMIZED HEIGHT) */}
              {m.image && (
                <div style={{
                  width: '100%',
                  borderBottom: '1.5px solid #E6DDCE',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0c0a09'
                }}
                onClick={() => setLightboxImage({
                  url: m.image,
                  caption: m.imageCaption || m.title
                })}
                title="मोठ्या आकारात पाहण्यासाठी क्लिक करा"
                >
                  <div style={{
                    width: '100%',
                    height: '260px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: m.imageFit === 'contain' ? '#1c1917' : '#0c0a09'
                  }}>
                    {m.imageFit === 'contain' && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${m.image})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        filter: 'blur(16px) brightness(0.4)',
                        transform: 'scale(1.1)'
                      }} />
                    )}
                    <img
                      src={m.image}
                      alt={m.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        position: 'relative',
                        zIndex: 1,
                        objectFit: m.imageFit || 'cover',
                        objectPosition: m.imagePosition || 'center 35%',
                        transition: 'transform 0.35s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>

                  <div style={{
                    background: 'linear-gradient(180deg, rgba(28, 25, 23, 0.82) 0%, rgba(20, 18, 16, 0.95) 100%)',
                    color: '#fed7aa',
                    padding: '8px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderTop: '1px solid rgba(254, 215, 170, 0.15)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📸</span>
                      <span>{m.imageCaption || m.title}</span>
                    </span>
                    <span style={{ color: '#fef08a', fontSize: '0.78rem', fontWeight: 700 }}>
                      🔍 संपूर्ण प्रतिमेसाठी क्लिक करा
                    </span>
                  </div>
                </div>
              )}

              {/* Compact Body Content */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ background: '#FAF6F0', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.74rem', color: '#888' }}>सहभागी संख्या</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#3D0D0D' }}>👥 {m.participants}</div>
                  </div>
                  <div style={{ background: '#FAF6F0', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.74rem', color: '#888' }}>प्रमुख कार्यक्षेत्र</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#3D0D0D' }}>📍 {m.locations}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#4A3B32', lineHeight: 1.65, margin: '0 0 16px' }}>
                  {m.desc}
                </p>

                {/* Key Highlights / Stats Bar if present */}
                {m.keyStats && m.keyStats.length > 0 && (
                  <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '10px'
                  }}>
                    {m.keyStats.map((st, sidx) => (
                      <div key={sidx}>
                        <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 700 }}>{st.label}</div>
                        <div style={{ fontSize: '0.86rem', color: '#78350F', fontWeight: 800, marginTop: '2px' }}>{st.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Demands & Outcomes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Demands */}
                  {m.demands && m.demands.length > 0 && (
                    <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                      <h4 style={{ color: '#9A3412', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📋</span>
                        <span>प्रमुख मागण्या:</span>
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#5C534B', fontSize: '0.86rem', lineHeight: 1.55 }}>
                        {m.demands.map((d, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Outcomes */}
                  {m.outcomes && m.outcomes.length > 0 && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px' }}>
                      <h4 style={{ color: '#166534', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎯</span>
                        <span>मिळालेले यश व फलश्रुती:</span>
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#14532D', fontSize: '0.86rem', lineHeight: 1.55 }}>
                        {m.outcomes.map((o, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredMovements.length === 0 && (
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              border: '1px dashed #DD8A2E',
              color: '#666'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>✊</div>
              <h3 style={{ color: '#3D0D0D' }}>कोणतीही चळवळ आढळली नाही</h3>
              <p>कृपया शोध संज्ञा बदला किंवा नवीन लढा नोंदवा.</p>
            </div>
          )}
        </div>

        {/* Modal for Add / Edit Movement */}
        {modalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              border: '2px solid #DD8A2E',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#3D0D0D', fontSize: '1.4rem', fontFamily: 'Baloo 2' }}>
                  {editItem ? '✏️ लढा संपादित करा' : '➕ नवीन लढा नोंदवा'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    आंदोलनाचे नाव / शीर्षक *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. मराठा क्रांती मूक मोर्चे..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      वर्ग / श्रेणी
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const labelMap = {
                          muk_morcha: 'मूक मोर्चे ५८',
                          satyagraha: 'अंतरवाली सराटी',
                          reservation: 'आरक्षण लढा',
                          education: 'शिक्षण व युवा',
                          business: 'आर्थिक विकास',
                          forts: 'गड संवर्धन',
                          farmers: 'शेतकरी एल्गार'
                        };
                        setFormData({ ...formData, category: val, categoryLabel: labelMap[val] || val });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="muk_morcha">🚩 मूक मोर्चे ५८</option>
                      <option value="satyagraha">🌾 अंतरवाली सराटी</option>
                      <option value="reservation">⚖️ आरक्षण लढा</option>
                      <option value="education">🎓 शिक्षण व युवा</option>
                      <option value="business">💼 आर्थिक विकास</option>
                      <option value="forts">🏰 दुर्ग संवर्धन</option>
                      <option value="farmers">🌾 शेतकरी एल्गार</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      कालावधी
                    </label>
                    <input
                      type="text"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      placeholder="उदा. ९ ऑगस्ट २०१६ – २०१७"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      सहभागी संख्या
                    </label>
                    <input
                      type="text"
                      value={formData.participants}
                      onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                      placeholder="उदा. ५ कोटी+ नागरिक"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      स्थान / विस्तार
                    </label>
                    <input
                      type="text"
                      value={formData.locations}
                      onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                      placeholder="उदा. महाराष्ट्रभर व नवी दिल्ली"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    प्रतिमा लिंक (Image URL)
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/assets/images/morcha-58-silent-rally.jpg"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    चळवळीचे सविस्तर वर्णन व पार्श्वभूमी *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="आंदोलनाचा उगम, शांततामय स्वरूप व इतिहास..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    प्रमुख मागण्या (प्रत्येक ओळीवर एक)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.demandsStr}
                    onChange={(e) => setFormData({ ...formData, demandsStr: e.target.value })}
                    placeholder="मागणी १&#10;मागणी २&#10;मागणी ३"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    मिळालेले यश व शासन निर्णय (प्रत्येक ओळीवर एक)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.outcomesStr}
                    onChange={(e) => setFormData({ ...formData, outcomesStr: e.target.value })}
                    placeholder="यश १&#10;यश २"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '9px 16px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 22px', background: '#DD8A2E', color: '#2A0606', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    {editItem ? 'बदल जतन करा ✓' : 'लढा नोंदवा ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
