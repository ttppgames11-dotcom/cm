import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SHIPS_DATA = [
  {
    id: 'gurab',
    name: 'गुराब (Gurab / Grab)',
    type: 'प्रमुख तोफधारी युद्धनौका (Capital Warship)',
    image: '/assets/images/navy/gurab.jpg',
    specs: {
      displacement: '३०० ते ४०० टन',
      cannons: '१६ ते २४ तोफा (९ ते १२ पाउंडर)',
      crew: '१५० ते २०० कुशल सैनिक व नाविक',
      masts: '२ ते ३ डोलकाठ्या (Masts)',
      speed: 'उथळ व खोल दोन्ही समुद्रात प्रचंड चपळ'
    },
    tactics: 'मराठा आरमाराचे हे मुख्य लढाऊ महाकाय जहाज होते. याचे पुढचे टोक (Prow) चपटे व लांबट असल्याने समोरासमोर येणाऱ्या शत्रूच्या जहाजांवर थेट तोफांचा मारा करता येत असे.',
    desc: 'गुराब हे मराठा नौदलाचे सर्वात प्रभावी आणि ताकदवान युद्धजहाज मानले जात असे. युरोपीय व्यापारी कंपन्यांच्या मोठ्या जहाजांना जेरीस आणण्यात गुराबांचा सिंहाचा वाटा होता. छत्रपती शिवाजी महाराजांच्या काळात आणि नंतर सरखेल कान्होजी आंग्रे यांच्या कारकिर्दीत गुराबांच्या तोफखान्याने इंग्रज आणि पोर्तुगीजांच्या गलबतांना समुद्रात पाणी पाजले.',
    historicalRole: 'सरखेल कान्होजी आंग्रे यांच्याकडे १५ हून अधिक लढाऊ गुराबांचा ताफा होता, ज्यांनी वेस्ट कोस्टवर मराठ्यांचे निर्विवाद वर्चस्व प्रस्थापित केले.'
  },
  {
    id: 'galbat',
    name: 'गलबत (Galbat / Gallivat)',
    type: 'द्रुतगती लढाऊ नौका (Fast Attack Galley)',
    image: '/assets/images/navy/galbat.jpg',
    specs: {
      displacement: '७० ते १५० टन',
      cannons: '६ ते १० हलक्या तोफा व स्विव्हल गन',
      crew: '६० ते १०० नाविक व वल्हेकरी (Oarsmen)',
      masts: '२ तिरप्या डोलकाठ्या (Lateen Sails)',
      speed: 'वारे नसतानाही वल्ह्यांच्या साहाय्याने अतिजलद गती'
    },
    tactics: 'हवेचा वेग शांत झाल्यावर जेव्हा युरोपीय जहाजे स्तब्ध होत, तेव्हा गलबते ३० ते ४० वल्ह्यांच्या जोरावर शत्रूच्या जहाजाभोवती गिरक्या घेऊन अचानक हल्ला करत आणि बोर्डिंग करत.',
    desc: 'गलबत ही उथळ समुद्रात वाऱ्याची तमा न बाळगता चालणारी मराठ्यांची अतिशय चपळ आणि घातक लढाऊ नौका होती. या नौकेचा तळ उथळ असल्यामुळे ती किनाऱ्याजवळच्या खडकाळ भागात सहज शिरू शकत असे, जिथे इंग्रजांची अवजड जहाजे अडकून पडत असत.',
    historicalRole: 'खांदेरी-उंदेरीच्या सागरी लढाईत दर्यासारंग व मायनाक भंडारी यांच्या गलबतांच्या चपळाईनेच बलाढ्य ब्रिटिश युद्धनौकांना माघार घेण्यास भाग पाडले होते.'
  },
  {
    id: 'pal',
    name: 'पाल (Pal / Maratha Battleship)',
    type: 'महाकाय तिहेरी डोलकाठी युद्धनौका (Man-of-War Flagship)',
    image: '/assets/images/navy/pal.jpg',
    specs: {
      displacement: '५०० ते ६०० टन',
      cannons: '३० ते ४० जड तोफा (Broadside Cannons)',
      crew: '२५० ते ३५० सैनिक, तोफची व खलाशी',
      masts: '३ भव्य डोलकाठ्या व बहुमजली तोफ डेक',
      speed: 'खोल समुद्रात लांब पल्ल्याच्या तोफगोळ्यांचा मारा'
    },
    tactics: 'युरोपियन फ्रिगेट्स आणि मॅन-ऑफ-वॉर जहाजांशी थेट तोफखाना भिडवण्यासाठी आणि समुद्रात दीर्घकाळ तळ ठोकण्यासाठी पालचा वापर होत असे.',
    desc: 'पाल ही मराठा आरमाराची सर्वोच्च आकाराची व ताकदीची युद्धनौका होती. दोन ते तीन मजली तोफांच्या रांगा, सागवानी लाकडाचे मजबूत कवच आणि आधुनिक युरोपीय जहाजांइतकीच तोफगोळ्यांची मारक क्षमता हे पालचे वैशिष्ट्य होते. समुद्रातील निर्णायक युद्धांमध्ये ही मराठा आरमाराची धुरा सांभाळत असे.',
    historicalRole: 'कान्होजी आंग्रे व तुळाजी आंग्रे यांच्या काळात "फतेह लश्कर" व "सदाशिव" नावाच्या पाल जहाजांनी इंग्रज आरमाराच्या अनेक आघाड्या उद्ध्वस्त केल्या होत्या.'
  },
  {
    id: 'machwa',
    name: 'मचवा (Machwa / Coastal Patrol & Boarding)',
    type: 'टेहळणी व बोर्डिंग बोट (Scout & Assault Boat)',
    image: '/assets/images/navy/machwa.jpg',
    specs: {
      displacement: '२० ते ५० टन',
      cannons: '२ ते ४ लहान तोफा / जंबुरा',
      crew: '२० ते ४० लढाऊ मावळे व नाविक',
      masts: '१ मध्यवर्ती डोलकाठी (Single Lateen Mast)',
      speed: 'खाड्या, नद्यांचे मुख व खडकाळ किनाऱ्यांवर सर्वोत्तम हालचाल'
    },
    tactics: 'रात्रीच्या अंधारात किंवा धुक्यात शत्रूच्या जहाजांच्या नकळत जवळ जाऊन मशाली, बंदुका आणि तलवारींसह जहाजावर चढाई (Boarding) करणे.',
    desc: 'मचवा ही प्रामुख्याने गुप्तहेर माहिती मिळवणे, रसद वाहतूक आणि समुद्रातील गस्त घालण्यासाठी अत्यंत उपयुक्त अशी नौका होती. कोकणातील स्थानिक कोळी व भंडारी बांधवांच्या शतकानुशतकांच्या सागरी ज्ञानाचा वापर करून शिवरायांनी मचव्यांचा चपळ युद्धतंत्रात समावेश केला.',
    historicalRole: 'मराठा जलदुर्गांच्या दरम्यान तात्काळ संदेशवहन, बारुद पुरवठा आणि समुद्रात शत्रूची हालचाल टिपण्यात मचव्यांनी मोलाची कामगिरी बजावली.'
  },
  {
    id: 'shibad',
    name: 'शिबाड व तारंडे (Shibad & Tarande)',
    type: 'अवजड रसद, सैन्य व तोफ वाहतूक जहाज (Heavy Troop & Supply Transport)',
    image: '/assets/images/navy/shibad.jpg',
    specs: {
      displacement: '१५० ते २५० टन',
      cannons: '४ ते ८ स्वसंरक्षक तोफा',
      crew: '५० ते ८० सैनिक व मालवाहू खलाशी',
      masts: '२ डोलकाठ्या आणि विस्तृत आकाराची माल साठवणूक जागा',
      speed: 'सागरी वादळातही समतोल राखण्याची प्रचंड क्षमता'
    },
    tactics: 'सागरी मोहिमेवर जाणाऱ्या आरमारासाठी दारूगोळा, अन्नधान्य, तोफा आणि अतिरिक्त सैनिकांची एका जलदुर्गावरून दुसऱ्या जलदुर्गावर जलद ने-आण करणे.',
    desc: 'शिबाड हे मजबूत सागवानी फळ्यांनी जोडलेले मोठे मालवाहू व सैन्यवाहू जहाज होते. युद्धाच्या वेळी यात शेकडो सशस्त्र मावळे लपवून अचानक शत्रूच्या किनाऱ्यावर किंवा जहाजांवर उतरवले जात. आरमाराच्या प्रदीर्घ मोहिमा शिबाडांच्या भक्कम रसद व्यवस्थेमुळेच यशस्वी होत असत.',
    historicalRole: 'बसनूरची लूट (१६६५) आणि गोव्याच्या सागरी मोहिमेत शिवरायांच्या सैन्याची व घोड्यांची वाहतूक करण्यासाठी शिबाड व तारंडे नौकांचा मोठ्या प्रमाणावर उपयोग करण्यात आला होता.'
  }
];

const SEA_FORTS = [
  {
    name: 'किल्ले सिंधुदुर्ग',
    place: 'मालवण, सिंधुदुर्ग',
    image: '/assets/images/forts/sindhudurg-fort.jpg',
    builder: 'छत्रपती शिवाजी महाराज (१६६४–१६६७)',
    architect: 'हिरोजी इंदुलकर (प्रमुख वास्तुविशारद)',
    features: [
      'कुर्ते बेटावरील ४८ एकर विस्तीर्ण खडकावर उभारणी',
      'पायाभरणीत १०० मण शिसे (Lead) वितळवून दगडी चिरे जोडले',
      '४२ भव्य बुरुज आणि ३ किमी लांबीची नागमोडी अभेद्य तटबंदी',
      'गडाच्या पोटात ३ गोड्या पाण्याची विहिरी (दूधबाव, साखरबाव, दहीबाव)',
      'शिवरायांचे एकमेव ऐतिहासिक मंदिर आणि त्यांच्या हाता-पायांचे ठसे'
    ],
    desc: 'सिंधुदुर्ग हा छत्रपती शिवाजी महाराजांच्या आरमारी दूरदृष्टीचा सर्वोच्च मुकुटमणी आहे. परकीय सागरी आक्रमकांना पायबंद घालण्यासाठी आणि अरबी समुद्रावर मराठ्यांचे सार्वभौमत्व प्रस्थापित करण्यासाठी शिवरायांनी स्वतः मालवणच्या समुद्रात जागा शोधून हा अजिंक्य जलदुर्ग निर्माण केला. समुद्राच्या प्रचंड लाटा आजही याच्या तटबंदीवर आदळून परत फिरतात.',
    historicalFact: '१६६४ मध्ये शिवरायांनी स्वतः या जलदुर्गाची पायाभरणी केली. हा किल्ला जिंकणे पोर्तुगीज किंवा इंग्रजांना कधीही शक्य झाले नाही.'
  },
  {
    name: 'किल्ले विजयदुर्ग (घेरिया)',
    place: 'देवगड, सिंधुदुर्ग',
    image: '/assets/images/forts/vijaydurg-fort.jpg',
    builder: 'शिलाहार राजा भोज (पुनर्बांधणी: छत्रपती शिवाजी महाराज, १६५३)',
    architect: 'कान्होजी आंग्रे यांचे प्रमुख नौदल केंद्र',
    features: [
      'तीन बाजूंनी अरबी समुद्र व वाघोटन खाडीचे नैसर्गिक संरक्षण',
      'पाण्याखाली २०० मीटर लांब, ७ मीटर उंच गुप्त दगडी भिंत (Undersea Wall)',
      'आरमारी जहाजे दुरुस्त करण्यासाठी भारतातील पहिली ऐतिहासिक ड्रायडॉक (गोदी)',
      'तिहेरी तटबंदी आणि २७ अजस्त्र बुरुज',
      'तोफांच्या गोळ्यांचा मारा सहन करू शकणारी कातळात कोरलेली रचना'
    ],
    desc: 'विजयदुर्ग हे मराठा आरमाराचे प्रमुख नौदल मुख्यालय (Naval Headquarters) होते. या किल्ल्याच्या संरक्षणासाठी समुद्रात पाण्याखाली बांधलेली गुप्त दगडी भिंत हे प्राचीन भारतीय सागरी तंत्रज्ञानाचे अद्भूत आश्चर्य मानले जाते. शत्रूची मोठी जहाजे भरतीच्या वेळी या भिंतीवर आदळून फुटत असत, तर मराठ्यांची उथळ जहाजे सहज आत प्रवेश करत.',
    historicalFact: 'सरखेल कान्होजी आंग्रे यांच्या कारकिर्दीत ब्रिटिश व पोर्तुगीजांच्या संयुक्त नौदलाने विजयदुर्गावर अनेकदा हल्ले केले, परंतु मराठ्यांच्या तोफांसमोर त्यांना प्रत्येक वेळी पराभव पत्करावा लागला.'
  },
  {
    name: 'किल्ले सुवर्णदुर्ग',
    place: 'हर्णे, दापोली (रत्नागिरी)',
    image: '/assets/images/forts/suvarnadurg-fort.jpg',
    builder: 'छत्रपती शिवाजी महाराज (१६६० मध्ये स्वराज्यात समाविष्ट व बळकटीकरण)',
    architect: 'आंग्रे घराण्याचे जहाजबांधणी केंद्र',
    features: [
      'समुद्रात खडकाळ बेटावर ८ एकरांवर वसलेला अभेद्य दुर्ग',
      'किनाऱ्यावरील कनकदुर्ग, फत्तेदुर्ग व गोवागड या तीन भूदुर्गांचे तिहेरी संरक्षण कडे',
      'खडकातून तासून काढलेला गुप्त महाद्वार व समुद्रातून थेट प्रवेशमार्ग',
      'जहाजबांधणी व दुरुस्तीसाठी संरक्षित नैसर्गिक बंदर'
    ],
    desc: 'सुवर्णदुर्ग म्हणजेच "सुवर्णाचा किल्ला" हा मराठा आरमाराचा सुवर्णकाळ घडवणारा ऐतिहासिक जलदुर्ग आहे. सरखेल कान्होजी आंग्रे आणि त्यांचे सुपुत्र तुळाजी आंग्रे यांच्या काळात येथे भव्य जहाजे घडवली जात असत. समुद्राच्या लाटांच्या धडका सहन करणारी भक्कम काळ्या पाषाणातील तटबंदी आजही तटस्थ उभी आहे.',
    historicalFact: 'हर्णे बंदराच्या संरक्षणासाठी समुद्रात सुवर्णदुर्ग आणि किनाऱ्यावर तीन संरक्षक किल्ले अशी अनोखी चौपदरी सुरक्षा यंत्रणा शिवरायांनी उभारली होती.'
  },
  {
    name: 'किल्ले पद्मदुर्ग (कासा किल्ला)',
    place: 'मुरुड-जंजिरा समोर, रायगड',
    image: '/assets/images/forts/padmadurg-fort.jpg',
    builder: 'छत्रपती शिवाजी महाराज (१६७६)',
    architect: 'दर्यासारंग दौलत खान व मायनाक भंडारी',
    features: [
      'सिद्दीच्या अजिंक्य मानल्या गेलेल्या जंजिऱ्याला रोखण्यासाठी समुद्रातील खडकावर निर्मिती',
      'कमळाच्या पाकळ्यांसारखी वैशिष्ट्यपूर्ण बुरुजांची रचना (पद्म = कमळ)',
      'जंजिऱ्याच्या तोफांच्या टप्प्यात असूनही शिवरायांनी धाडसाने उभा केलेला प्रति-दुर्ग',
      'दोन स्वतंत्र भागांमध्ये विभागलेली भक्कम तटबंदी'
    ],
    desc: 'मुरुडचा सिद्दी स्वराज्याच्या रयतेला अतोनात त्रास देत असे. सिद्दीच्या जंजिऱ्याला थेट टक्कर देण्यासाठी आणि त्याचा सागरी मार्ग रोखण्यासाठी छत्रपती शिवरायांनी जंजिऱ्याच्या अगदी समोर समुद्रात पद्मदुर्ग (कासा किल्ला) उभा केला. सभासद बखरीमध्ये लिहिले आहे: "पद्मदुर्ग वसवून जंजिऱ्याच्या उरावरी दुसरी फांदी रोविली!"',
    historicalFact: 'अथांग समुद्रातील खडक तोडून, लाटांचा सामना करत मराठ्यांनी पद्मदुर्ग उभारला, ज्याने सिद्दीच्या सागरी हालचालींना कायमचे वेसण घातले.'
  },
  {
    name: 'किल्ले खांदेरी-उंदेरी',
    place: 'थल, अलिबाग (मुंबईच्या समुद्रासमोर)',
    image: '/assets/images/forts/khanderi-fort.jpg',
    builder: 'छत्रपती शिवाजी महाराज (१६७९)',
    architect: 'मायनाक भंडारी (प्रमुख आरमारी सेनापती)',
    features: [
      'मुंबई बंदरावर इंग्रजांच्या नाकावर टिच्चून मोक्याच्या बेटावर बांधकाम',
      'ब्रिटिश युद्धनौकांच्या तोफांचा सतत मारा चालू असतानाही तटबंदी पूर्ण',
      'अरबी समुद्रातील व्यापारी जहाजांच्या मुख्य मार्गावर मराठ्यांचे नियंत्रण',
      'उंदेरी बेटावर सिद्दीविरुद्ध आणि खांदेरीवर इंग्रजांविरुद्ध एकाच वेळी संघर्ष'
    ],
    desc: 'खांदेरी बेटावरील किल्ला हे छत्रपती शिवरायांच्या असीम सागरी धैर्याचे प्रतीक आहे. मुंबईच्या ब्रिटिश गव्हर्नरने हा किल्ला बांधू नये म्हणून संपूर्ण आरमारी ताकदीनिशी हल्ला चढवला होता. परंतु मायनाक भंडारी आणि त्यांच्या साथीदारांनी लहान गलबतांच्या साहाय्याने बलाढ्य इंग्रज आरमाराला परतावून लावले आणि किल्ल्यावर भगवा फडकवला.',
    historicalFact: 'ऑक्टोबर १६७९ मधील खांदेरीची सागरी लढाई ही मराठा आरमार आणि ब्रिटिश ईस्ट इंडिया कंपनी यांच्यातील पहिली थेट ऐतिहासिक नौदल चकमक मानली जाते.'
  },
  {
    name: 'किल्ले कुलाबा (अलिबाग)',
    place: 'अलिबाग, रायगड',
    image: '/assets/images/forts/kolaba-fort.jpg',
    builder: 'छत्रपती शिवाजी महाराज (१६८०, पूर्णत्व: छत्रपती संभाजी महाराज)',
    architect: 'कान्होजी आंग्रे यांची आरमारी राजधानी',
    features: [
      'ओहोटीच्या वेळी चालत जाता येणारा आणि भरतीच्या वेळी समुद्राने वेढला जाणारा जलदुर्ग',
      'गडाच्या आत गोड्या पाण्याचा प्रसिद्ध पद्मावती तलाव',
      '१७ भव्य बुरुज आणि तोफांच्या भडीमारासाठी विशेष झरोके',
      'सरखेल कान्होजी आंग्रे यांची समाधी व ऐतिहासिक राजवाड्यांचे अवशेष'
    ],
    desc: 'अलिबागच्या समुद्रात दिमाखात उभा असलेला किल्ले कुलाबा हा मराठा आरमाराचे प्रमुख राजकीय केंद्र होता. छत्रपती शिवाजी महाराजांनी आपल्या आयुष्याच्या अखेरच्या काळात या किल्ल्याची उभारणी सुरू केली आणि छत्रपती संभाजी महाराजांनी तो पूर्णत्वास नेला. सरखेल कान्होजी आंग्रे यांनी कुलाब्यावरून संपूर्ण उत्तर कोकणच्या समुद्रावर आपले वर्चस्व गाजवले.',
    historicalFact: '१७२१ मध्ये ब्रिटिश व पोर्तुगीज फौजांनी कुलाबा किल्ल्याला वेढा दिला होता, परंतु कान्होजी आंग्रे आणि पेशवे बाळाजी विश्वनाथ यांच्या संयुक्त सैन्याने शत्रूचा दारुण पराभव केला.'
  }
];

export default function MarathaNavyPage() {
  const [selectedShip, setSelectedShip] = useState(null);

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Navy Hero Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #071326 0%, #0F2D59 45%, #1B3B6F 75%, #0A192F 100%)',
          color: '#FFF',
          padding: '44px 32px',
          border: '2px solid #DD8A2E',
          boxShadow: '0 20px 45px rgba(7,19,38,0.45)',
          marginBottom: '36px'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DD8A2E', color: '#071326', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
            <span>⚓</span> भारतीय आरमाराचे जनक (Father of Indian Navy)
          </div>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(2rem, 4.5vw, 2.9rem)',
            fontWeight: 800,
            margin: '0 0 10px',
            color: '#FFF',
            lineHeight: 1.2
          }}>
            मराठा आरमार व ऐतिहासिक जलदुर्ग
          </h1>
          <p style={{ color: '#FDBA74', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 14px', letterSpacing: '0.2px' }}>
            "ज्यांचे आरमार त्याचा समुद्र!" — रामचंद्रपंत अमात्य (आज्ञापत्र)
          </p>
          <p style={{ color: '#E2E8F0', fontSize: '0.98rem', maxWidth: '820px', lineHeight: 1.65, margin: 0 }}>
            १७ व्या शतकात परकीय सागरी शक्तींचा (ब्रिटिश, पोर्तुगीज, डच आणि सिद्दी) धोका ओळखून छत्रपती शिवाजी महाराजांनी स्वतंत्र स्वदेशी जहाजांची निर्मिती, अजिंक्य सागरी जलदुर्ग आणि स्थानिक कोळी-भंडारी मावळ्यांचे अजिंक्य आरमार उभे केले. छत्रपती संभाजी महाराज आणि सरखेल कान्होजी आंग्रे यांनी हे साम्राज्य समुद्रावर अजेय ठेवले.
          </p>
        </div>

        {/* Navy Leaders Highlight */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px', marginBottom: '40px' }}>
          <div style={{ background: '#FFF', borderRadius: '18px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#DD8A2E' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '2.2rem', background: '#FEF3C7', padding: '8px 12px', borderRadius: '12px' }}>⚓</div>
              <div>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', color: '#0F2D59', margin: 0, fontWeight: 800 }}>
                  सरखेल कान्होजी आंग्रे (१६६९–१७२९)
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#DD8A2E', fontWeight: 800, marginTop: '2px' }}>
                  मराठा आरमाराचे अजिंक्य नौदल प्रमुख (Grand Admiral)
                </div>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              ३० वर्षांच्या प्रदीर्घ कारकिर्दीत एकाही सागरी युद्धात पराभूत न झालेले मराठा अॅडमिरल. ब्रिटिश, पोर्तुगीज व डचांच्या संयुक्त आरमारी आक्रमणांना धुळीस मिळवून त्यांनी अरबी समुद्रावर मराठ्यांचे निर्विवाद सार्वभौमत्व प्रस्थापित केले.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '18px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#0F2D59' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '2.2rem', background: '#DBEAFE', padding: '8px 12px', borderRadius: '12px' }}>🗡️</div>
              <div>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', color: '#0F2D59', margin: 0, fontWeight: 800 }}>
                  मायनाक भंडारी व दर्यासारंग दौलत खान
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 800, marginTop: '2px' }}>
                  शिवकालीन पहिले आरमारी सेनापती
                </div>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              छत्रपती शिवरायांच्या थेट मार्गदर्शनाखाली सिंधुदुर्ग, विजयदुर्ग व खांदेरीच्या समुद्रात शत्रूशी भिडणारे मायनाक भंडारी आणि आरमाराची उभारणी करणारे दर्यासारंग दौलत खान यांनी मराठा आरमाराचा भक्कम पाया रचला.
            </p>
          </div>
        </div>

        {/* Warships Section with Authentic Generated Illustrations */}
        <div style={{ background: '#FFF', borderRadius: '24px', padding: '32px 28px', border: '1px solid #E6DDCE', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', borderBottom: '2px solid #F1E9DA', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.75rem', color: '#0F2D59', margin: '0 0 4px', fontWeight: 800 }}>
                🚢 मराठा आरमाराची युद्धजहाजे (Warships of Maratha Navy)
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.92rem', margin: 0 }}>
                सागवानी लाकूड, तोफांची ताकद आणि गनिमी काव्यावर आधारित वैशिष्ट्यपूर्ण युद्धनौका
              </p>
            </div>
            <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
              एकूण ५ प्रमुख प्रकार
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '24px' }}>
            {SHIPS_DATA.map((ship) => (
              <div
                key={ship.id}
                style={{
                  background: '#FAFCFF',
                  borderRadius: '18px',
                  border: '1px solid #BAE6FD',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 14px rgba(186, 230, 253, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Ship Image */}
                <div style={{ position: 'relative', width: '100%', height: '210px', background: '#0A192F', overflow: 'hidden' }}>
                  <img
                    src={ship.image}
                    alt={ship.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#FDBA74',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid rgba(221, 138, 46, 0.4)'
                  }}>
                    {ship.specs.displacement}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(10, 25, 47, 0.95) 0%, rgba(10, 25, 47, 0.4) 60%, transparent 100%)',
                    padding: '24px 16px 10px'
                  }}>
                    <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#FFF', margin: 0, fontWeight: 800 }}>
                      {ship.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#7DD3FC', fontWeight: 600 }}>
                      {ship.type}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '12px' }}>
                  <p style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
                    {ship.desc}
                  </p>

                  {/* Ship Specs Grid */}
                  <div style={{ background: '#F0F9FF', borderRadius: '12px', padding: '12px', border: '1px solid #E0F2FE' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚙️</span> जहाजाची तांत्रिक वैशिष्ट्ये:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px', fontSize: '0.8rem', color: '#475569' }}>
                      <div><strong>तोफा:</strong> {ship.specs.cannons}</div>
                      <div><strong>सैनिक व नाविक:</strong> {ship.specs.crew}</div>
                      <div><strong>डोलकाठ्या (Masts):</strong> {ship.specs.masts}</div>
                      <div><strong>खास वैशिष्ट्य:</strong> {ship.specs.speed}</div>
                    </div>
                  </div>

                  {/* Tactics */}
                  <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '12px', border: '1px solid #FEF3C7', fontSize: '0.82rem', color: '#92400E', lineHeight: 1.5 }}>
                    <strong>⚔️ युद्धतंत्र:</strong> {ship.tactics}
                  </div>

                  {/* Historical Role */}
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', borderTop: '1px dashed #E2E8F0', paddingTop: '8px', marginTop: 'auto' }}>
                    🚩 {ship.historicalRole}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sea Forts Section with Authentic Images and Detailed Engineering */}
        <div style={{ background: '#FFF', borderRadius: '24px', padding: '32px 28px', border: '1px solid #E6DDCE', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', borderBottom: '2px solid #F1E9DA', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.75rem', color: '#0F2D59', margin: '0 0 4px', fontWeight: 800 }}>
                🏰 ऐतिहासिक सागरी जलदुर्ग (Sea Forts of Maharashtra)
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.92rem', margin: 0 }}>
                समुद्राच्या लाटांशी आणि परकीय आक्रमकांशी शतकानुशतके मुकाबला करणारे शिवकालीन अभेद्य जलदुर्ग
              </p>
            </div>
            <Link
              to="/history/forts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#DD8A2E',
                color: '#FFF',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              सर्व किल्ले पहा (१७१+) →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {SEA_FORTS.map((fort, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Fort Image */}
                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#0F172A', overflow: 'hidden' }}>
                  <img
                    src={fort.image}
                    alt={fort.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      e.target.src = '/assets/images/forts/sindhudurg-fort.jpg';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#FDBA74',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid rgba(221, 138, 46, 0.5)'
                  }}>
                    📍 {fort.place}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)',
                    padding: '24px 18px 10px'
                  }}>
                    <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.35rem', color: '#FFF', margin: 0, fontWeight: 800 }}>
                      {fort.name}
                    </h3>
                  </div>
                </div>

                {/* Fort Details */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '14px' }}>
                  {/* Builder & Architect info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '0.82rem', background: '#F1F5F9', padding: '10px 12px', borderRadius: '10px', color: '#334155' }}>
                    <div><strong>संस्थापक / पुनर्बांधणी:</strong> {fort.builder}</div>
                    <div><strong>वैशिष्ट्य / प्रमुख:</strong> {fort.architect}</div>
                  </div>

                  {/* Description */}
                  <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {fort.desc}
                  </p>

                  {/* Architecture & Engineering Features */}
                  <div style={{ background: '#FEF3C7', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🛡️</span> वास्तुकला व संरक्षणाची वैशिष्ट्ये:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#78350F', lineHeight: 1.5 }}>
                      {fort.features.map((feat, fIdx) => (
                        <li key={fIdx} style={{ marginBottom: '3px' }}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Historical Fact */}
                  <div style={{ fontSize: '0.82rem', color: '#0369A1', background: '#E0F2FE', padding: '10px 12px', borderRadius: '10px', marginTop: 'auto', border: '1px solid #BAE6FD' }}>
                    <strong>📜 ऐतिहासिक संदर्भ:</strong> {fort.historicalFact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navy Philosophy Quote Banner */}
        <div style={{
          marginTop: '36px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '20px',
          padding: '28px 24px',
          color: '#FFF',
          textAlign: 'center',
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🌊</div>
          <blockquote style={{ margin: '0 0 10px', fontSize: '1.15rem', fontStyle: 'italic', color: '#FDBA74', fontFamily: "'Baloo 2', sans-serif" }}>
            "ज्याप्रमाणे घोड्याशिवाय सैन्य पांगळे, त्याप्रमाणे समुद्राच्या रक्षणासाठी आरमार नसेल तर राज्य सदैव संकटात सापडेल. आरमार हे एक स्वतंत्र राज्यांगच आहे."
          </blockquote>
          <div style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
            — रामचंद्रपंत अमात्य (छत्रपती शिवरायांच्या आज्ञेनुसार संकलित 'आज्ञापत्र', १७१६)
          </div>
        </div>

      </div>
    </div>
  );
}
