import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const heroViews = {
  hero: {
    badge: '🚩 मराठा वीर (Maratha Hero)',
    title: 'छत्रपती शिवाजी महाराज — हिंदवी स्वराज्य संस्थापक',
    desc: 'रयतेचे कल्याण, ३५०+ अभेद्य गडकोट, गनिमी काव्याचे जनक आणि सार्वभौम मराठा साम्राज्याची पायाभरणी करणारे युगपुरुष.',
    link: '/history/shivaji-maharaj',
    img: '/assets/images/maratha-hero.jpg'
  },
  samrajya: {
    badge: '⚔️ मराठा साम्राज्य',
    title: 'अखंड मराठा साम्राज्य (१६७४ – १८१८)',
    desc: '३.९ दशलक्ष चौ. किमी, अटकेपासून कटक व तंजावरपर्यंत भगवा ध्वज फडकावणारे महासाम्राज्य.',
    link: '/history',
    img: '/assets/images/maratha-samrajya.jpg'
  },
  coronation: {
    badge: '👑 राज्याभिषेक',
    title: 'शिवराज्याभिषेक सोहळा (६ जून १६७४)',
    desc: 'दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला वैदिक राज्याभिषेक.',
    link: '/history/shivaji-maharaj',
    img: '/assets/images/real-shivaji-coronation.jpg'
  },
  map: {
    badge: '🗺️ साम्राज्य नकाशा',
    title: 'मराठा साम्राज्य विस्तार नकाशा (१७५८)',
    desc: 'पेशवे, शिंदे, होळकर, गायकवाड, भोसले यांच्या मांडलिक राज्यांसह संपूर्ण भारतभर पसरलेले साम्राज्य.',
    link: '/forts',
    img: '/assets/images/maratha-empire-accurate-map.jpg'
  }
};

const historicalFigures = [
  // 👑 छत्रपती व स्वराज्य संस्थापक घराणे
  {
    id: 'shahaji-raje',
    name: 'राजे शहाजीराजे भोसले',
    category: 'chhatrapati',
    badge: 'स्वराज्य संकल्पक',
    desc: 'बंगळूर दरबारातून शिवरायांना राजमुद्रा, भगवा ध्वज व स्वराज्य संकल्पनेची प्रेरणा देणारे पितृछत्र.',
    link: '/history',
    image: '/assets/images/real-shahaji-bhosale-portrait.jpg',
    objectPosition: 'center 15%',
    objectFit: 'contain'
  },
  {
    id: 'shivaji',
    name: 'छत्रपती शिवाजी महाराज',
    category: 'chhatrapati',
    badge: 'हिंदवी स्वराज्य संस्थापक',
    desc: 'रयतेचे राजे, भारतीय आरमाराचे जनक, ३५०+ गड-किल्ले व अष्टप्रधान मंडळ रचनाकार.',
    link: '/history/shivaji-maharaj',
    image: 'https://wallpapercave.com/wp/wp4518353.jpg',
    objectPosition: 'center 10%',
    objectFit: 'contain'
  },
  {
    id: 'sambhaji',
    name: 'छत्रपती संभाजी महाराज',
    category: 'chhatrapati',
    badge: 'धर्मवीर व अपराजित छत्रपती',
    desc: '१२८ लढायांमध्ये अजिंक्य, बुधभूषणम् संस्कृत ग्रंथकार व धर्मरक्षणासाठी सर्वोच्च बलिदान.',
    link: '/history/sambhaji-maharaj',
    image: '/assets/images/Sambhaji_Maharaj.jpg',
    objectPosition: 'center 12%',
    objectFit: 'contain'
  },
  {
    id: 'rajaram',
    name: 'छत्रपती राजाराम महाराज',
    category: 'chhatrapati',
    badge: 'स्वातंत्र्यसंग्राम सूत्रधार',
    desc: 'जिंजीच्या वेढ्यातून मुघल सेनेला २७ वर्षे झुंजवून स्वराज्याची धग अखंड तेवत ठेवणारे छत्रपती.',
    link: '/history/rajaram-maharaj',
    image: '/assets/images/real-rajaram-historical.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'shahu',
    name: 'छत्रपती शाहू महाराज (थोरले)',
    category: 'chhatrapati',
    badge: 'साम्राज्य विस्तारक छत्रपती',
    desc: 'मराठा सत्तेचा संपूर्ण हिंदुस्थानभर विस्तार करणारे, पेशवे नियुक्ती व सातारा गादीचे मुत्सद्दी राजे.',
    link: '/history/shahu-maharaj',
    image: '/assets/images/real-shahu-peshwa-hunting.jpg',
    objectPosition: 'center 25%',
    objectFit: 'contain'
  },

  // 🐎 पेशवे व सेनापती
  {
    id: 'bajirao',
    name: 'श्रीमंत थोरले बाजीराव पेशवा',
    category: 'peshwa',
    badge: 'अपराजित सेनापती (४१ लढाया)',
    desc: 'पालखेड, भोपाळ, दिल्ली छापा आणि माळवा-बुंदेलखंड विजय; शनिवार वाड्याचे निर्माते.',
    link: '/history/bajirao-peshwa',
    image: '/assets/images/real-bajirao-pune-statue.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'chimaji-appa',
    name: 'श्रीमंत चिमाजी आप्पा पेशवे',
    category: 'peshwa',
    badge: 'वसई रणसंग्राम विजेता',
    desc: 'पोर्तुगीजांच्या जुलमी सत्तेला सुरुंग लावून अजिंक्य वसई किल्ला जिंकणारे मराठा रणझुंजार सेनापती.',
    link: '/history/warriors',
    image: '/assets/images/real-chimaji-appa.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'nanasaheb-peshwa',
    name: 'श्रीमंत नानासाहेब पेशवा',
    category: 'peshwa',
    badge: 'अटकेपार साम्राज्य विस्तारक',
    desc: 'मराठ्यांचा ध्वज सिंधू नदीवर आणि अटकेपार फडकवणारे व पुण्याचा सर्वांगीण विकास करणारे पेशवे.',
    link: '/history/warriors',
    image: '/assets/images/real-nanasaheb-peshwa.jpg',
    objectPosition: 'center 15%',
    objectFit: 'contain'
  },
  {
    id: 'madhavrao-peshwa',
    name: 'श्रीमंत माधवराव पेशवे (पहिले)',
    category: 'peshwa',
    badge: 'मराठा साम्राज्य पुनरुत्थानकर्ते',
    desc: 'पानिपतच्या पराभवानंतर अवघ्या १० वर्षांत दिल्ली पुन्हा मराठ्यांच्या अंमलाखाली आणणारे द्रष्टे मुत्सद्दी.',
    link: '/history/warriors',
    image: '/assets/images/real-madhavrao-peshwa.jpg',
    objectPosition: 'center 25%',
    objectFit: 'contain'
  },
  {
    id: 'mahadji-shinde',
    name: 'महादजी शिंदे (पाटीलबाबा)',
    category: 'peshwa',
    badge: 'हिंदुस्थानचे वकील-उल-मुत्लक',
    desc: 'पानिपतनंतर मराठा सत्तेचे दिल्लीवर पुनरुज्जीवन करणारे आणि फ्रेंच कवायती सैन्याचे प्रणेते सेनापती.',
    link: '/history/warriors',
    image: '/assets/images/real-mahadji-shinde.jpg',
    objectPosition: 'center 30%',
    objectFit: 'contain',
    bg: '#f5f5f5'
  },
  {
    id: 'nana-phadnavis',
    name: 'मुत्सद्दी नाना फडणवीस',
    category: 'peshwa',
    badge: 'मराठा कारभारी व प्रशासक',
    desc: 'बारभाई कारस्थान आणि इंग्रजांविरुद्ध पहिल्या मराठा युद्धात मराठा महासंघाचे नेतृत्व करणारे मुत्सद्दी.',
    link: '/history/swarajya-admin',
    image: '/assets/images/real-nana-phadnavis.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },

  // 🛡️ वीरांगना
  {
    id: 'jijau',
    name: 'राष्ट्रमाता राजमाता जिजाऊ',
    category: 'virangana',
    badge: 'स्वराज्य प्रेरिका व मार्गदर्शक',
    desc: 'शिवरायांना घडवणाऱ्या, रयतेचा न्यायनिवाडा करणाऱ्या आणि स्वराज्याची संकल्पना रुजवणारे मातृत्व.',
    link: '/history/rajmata-jijau',
    image: '/assets/images/real-jijabai-statue.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'tarabai',
    name: 'महाराणी ताराबाई भोसले',
    category: 'virangana',
    badge: 'मुघल मर्दिनी रणरागिणी',
    desc: 'औरंगजेबाच्या मृत्यूपर्यंत मराठा स्वातंत्र्ययुद्ध चालवून मुघल फौजांना महाराष्ट्राच्या मातीत गाडणाऱ्या वीरांगना.',
    link: '/history/warriors',
    image: '/assets/images/maharani-tarabai.webp',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'ahilyabai',
    name: 'पुण्यश्लोक अहिल्यादेवी होळकर',
    category: 'virangana',
    badge: 'धर्मरक्षिका व द्रष्ट्या राज्यकर्ती',
    desc: 'माळव्याच्या आदर्श महाराणी, देशभर १२ ज्योतिर्लिंगे, मंदिरे व घाट उभारणाऱ्या लोककल्याणकारी वीरांगना.',
    link: '/history/warriors',
    image: '/assets/images/real-ahilyabai-holkar.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'rani-lakshmibai',
    name: 'क्रांतिराज्ञी झाशीची राणी लक्ष्मीबाई',
    category: 'virangana',
    badge: '१८५७ स्वातंत्र्यसंग्राम रणरागिणी',
    desc: '"मेरी झाँसी नहीं दूँगी!" म्हणत इंग्रजांच्या प्रचंड सैन्याविरुद्ध रणांगणावर प्रत्यक्ष तलवार गाजवणारी अमर विरांगना.',
    link: '/history/warriors',
    image: '/assets/images/real-rani-lakshmibai.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },

  // ⚔️ अमर शिलेदार
  {
    id: 'kanhoji-angre',
    name: 'सरखेल कान्होजी आंग्रे',
    category: 'yodha',
    badge: 'आरमाराचे अजिंक्य सेनापती',
    desc: 'ब्रिटिश, डच आणि पोर्तुगीजांना समुद्रावर झुकवून ३० वर्षे अथांग अरबी समुद्रावर अधिराज्य गाजवणारे आरमारप्रमुख.',
    link: '/history/navy',
    image: '/assets/images/real-kanhoji-angre.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'tanaji-person',
    name: 'सुभेदार तानाजी मालुसरे',
    category: 'yodha',
    badge: 'सिंहगडाचे अमर सुभेदार',
    desc: 'कोंढाणा पुनर्जय मोहीम — "आधी लगीन कोंढाण्याचं, मग माझ्या रायबाचं!" म्हणत धारातीर्थी पडणारे वीर शिरोमणी.',
    link: '/history/warriors',
    image: '/assets/images/real-sardar-tanaji.jpg',
    objectPosition: 'center 15%',
    objectFit: 'contain'
  },
  {
    id: 'bajiprabhu-person',
    name: 'वीर बाजीप्रभू देशपांडे',
    category: 'yodha',
    badge: 'पावनखिंडीचे अमर संरक्षक',
    desc: 'तोफांचे तीन आवाज होईपर्यंत सिद्धी मसूदच्या अफाट सेनेला घोडखिंडीत रोखून धरणारे अद्वितीय स्वामीनिष्ठ वीर.',
    link: '/history/warriors',
    image: '/assets/images/real-bajiprabhu-statue.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  },
  {
    id: 'hambirrao-person',
    name: 'सरसेनापती हंबीरराव मोहिते',
    category: 'yodha',
    badge: 'स्वराज्याचे सरसेनापती',
    desc: 'छत्रपती शिवाजी महाराज व संभाजी महाराज या दोन्ही छत्रपतींच्या काळात अतुलनीय शौर्य गाजवणारे सरसेनापती.',
    link: '/history/warriors',
    image: '/assets/images/real-maratha-sowar.jpg',
    objectPosition: 'center 20%',
    objectFit: 'contain'
  }
];

const timelineEvents = [
  {
    year: '१९ फेब्रुवारी १६३०',
    event: 'छत्रपती शिवाजी महाराजांचा किल्ले शिवनेरीवर जन्म — अखंड महाराष्ट्राच्या भाग्यसूर्याचा उदय, हिंदवी स्वराज्याची पाऊलवाट.'
  },
  {
    year: '१६४५–१६४६',
    event: 'रोहिडेश्वराच्या साक्षीने अवघ्या १६ व्या वर्षी स्वराज्याची शपथ व तोरणा किल्ला जिंकून हिंदवी स्वराज्याची अभेद्य तोरणे बांधली.'
  },
  {
    year: '१० नोव्हेंबर १६५९',
    event: 'ऐतिहासिक प्रतापगड युद्ध — विजापूरचा बलाढ्य सरदार अफझलखानाचा कोथळा बाहेर काढून वध आणि विजापूरच्या प्रचंड सेनेचा संपूर्ण धुव्वा.'
  },
  {
    year: '१३ जुलै १६६०',
    event: 'पावनखिंडीचा अमर रणसंग्राम — छत्रपती शिवराय विशाळगडावर सुखरूप पोहोचेपर्यंत वीर बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे अद्वितीय आत्मबलिदान.'
  },
  {
    year: '५ एप्रिल १६६३',
    event: 'लाल महालावर गनिमी काव्याचा थरारक छापा — मुघल सुभेदार शायिस्तेखानाची बोटे छाटून मुघल सत्तेचा माज एका रात्रीत उतरवला.'
  },
  {
    year: '१६६४ व १६७०',
    event: 'सुरतेची ऐतिहासिक स्वारी — मुघल साम्राज्याची आर्थिक राजधानी सुरत लुटून स्वराज्याचा प्रचंड खजिना समृद्ध केला.'
  },
  {
    year: '१६६६',
    event: 'आग्रा मुघल दरबारातून अद्वितीय सुटका — औरंगजेबाच्या कडेकोट नजरकैदेतून छत्रपती शिवराय व बाल संभाजीराजे यांची बुद्धीचातुर्याने सुटका.'
  },
  {
    year: '४ फेब्रुवारी १६७०',
    event: 'सिंहगड मोहीम — "आधी लगीन कोंढाण्याचं, मग माझ्या रायबाचं!" म्हणत सुभेदार तानाजी मालुसरे यांचे सर्वोच्च बलिदान व कोंढाणा पुनर्जय.'
  },
  {
    year: '६ जून १६७४',
    event: 'दुर्गराज रायगडावर ऐतिहासिक वैदिक शिवराज्याभिषेक सोहळा — ३२ मण सुवर्ण सिंहासनावर स्वतंत्र सार्वभौम "हिंदवी स्वराज्य" साम्राज्याची अधिकृत स्थापना.'
  },
  {
    year: '१६७७–१६७८',
    event: 'छत्रपती शिवरायांची दक्षिण दिग्विजय मोहीम — जिंजी, वेल्लोर, तंजावरपर्यंत मराठा सत्तेचा अभेद्य विस्तार.'
  },
  {
    year: '१६८१–१६८९',
    event: 'छत्रपती संभाजी महाराजांचे अपराजित शौर्य — सलग ९ वर्षे १२८ लढायांमध्ये अजिंक्य राहत ५ लाख मुघल सेनेशी अजोड लढा व धर्मरक्षणासाठी सर्वोच्च बलिदान.'
  },
  {
    year: '१६८९–१७०७',
    event: '२७ वर्षांचे मराठा स्वातंत्र्ययुद्ध — छत्रपती राजाराम महाराज, महाराणी ताराबाई व संताजी-धनाजी यांच्या गनिमी काव्याने औरंगजेबाला महाराष्ट्राच्या मातीत गाडले.'
  },
  {
    year: '१७२८',
    event: 'पालखेडची लढाई — श्रीमंत थोरले बाजीराव पेशवे यांनी हैदराबादच्या निजामाला अन्न-पाण्यावाचून कोंडून शरणागती पत्करायला लावणारी जागतिक दर्जाची रणनीती.'
  },
  {
    year: '१७३७',
    event: 'बाजीराव पेशव्यांचा दिल्लीवर अचानक धाडसी छापा — मुघल बादशहाला थरकाप भरवत मराठ्यांचा दरारा दिल्लीच्या तख्तावर प्रस्थापित केला.'
  },
  {
    year: '१७३९',
    event: 'वसई रणसंग्राम — श्रीमंत चिमाजी आप्पा पेशवे यांनी पोर्तुगीजांच्या क्रूर व बलाढ्य सत्तेचा बीमोड करून अभेद्य वसई किल्ला जिंकला.'
  },
  {
    year: '१७५८',
    event: 'अटकेपार मराठा ध्वज — रघुनाथराव पेशवे, तुकोजी होळकर व मल्हारराव होळकर यांनी पंजाब, लाहोर व अटक जिंकून सिंधू नदीवर मराठ्यांचा भगवा फडकवला.'
  },
  {
    year: '१४ जानेवारी १७६१',
    event: 'पानिपतचे तिसरे महायुद्ध — अहमदशाह अब्दालीविरुद्ध अखंड हिंदुस्थानच्या रक्षणासाठी सदाशिवराव भाऊ, विश्वासराव व लाखो मराठ्यांचे शौर्यपूर्ण महाबलिदान.'
  },
  {
    year: '१७६१–१७७२',
    event: 'मराठा साम्राज्य पुनरुत्थान — अवघ्या एका दशकात श्रीमंत माधवराव पेशवे व महादजी शिंदे यांनी दिल्लीवर पुन्हा ताबा मिळवून मराठा सत्तेचा दबदबा निर्माण केला.'
  },
  {
    year: '१७८२–१७९४',
    event: 'महादजी शिंदे (पाटीलबाबा) व नाना फडणवीस यांचे सुवर्णयुग — पहिल्या मराठा-इंग्रज युद्धात ब्रिटिशांना नमवून सालबाईचा तह केला व दिल्लीच्या बादशहाला मराठ्यांचे मांडलिक बनवले.'
  },
  {
    year: '१८१८',
    event: 'तिसरे आंग्ल-मराठा युद्ध व शनिवार वाड्यावरील अखेरचा संघर्ष — मराठा साम्राज्याने संपूर्ण देशात प्रज्वलित केलेली स्वातंत्र्य व स्वाभिमानाची अखंड प्रेरणा.'
  }
];

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');
  const [heroView, setHeroView] = useState('hero');

  const activeHero = heroViews[heroView];

  const filteredFigures = filter === 'all'
    ? historicalFigures
    : historicalFigures.filter(f => f.category === filter);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: '70px' }}>
      
      {/* 1. War Cry Strip */}
      <div className="war-cry-strip">
        <span className="flame-icon">🔥</span>
        <span>|| गर्जा महाराष्ट्र माझा! सह्याद्रीच्या काळजातून उमटलेली अखंड स्वाभिमानाची अमर गाथा! ||</span>
        <span className="flame-icon">🔥</span>
      </div>

      {/* 2. Interactive Hero Section with View Switcher */}
      <div className="hero" style={{ minHeight: '520px', position: 'relative', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-samrajya.jpg"
          alt="मराठा साम्राज्य"
          className="hero-bg-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        <div className="hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(60, 15, 15, 0.78) 0%, rgba(185, 28, 28, 0.50) 50%, rgba(217, 119, 6, 0.38) 100%)' }}></div>

        <div className="wrap hero-content" style={{ maxWidth: '1320px', width: '100%', padding: '50px 24px', position: 'relative', zIndex: 2 }}>
          <div className="hero-website-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: '#FDE047', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                अखंड शौर्याची गौरवगाथा · १६३० ते १८१८
              </div>
              <h1 style={{ fontSize: 'clamp(2.3rem, 4.2vw, 3.8rem)', lineHeight: 1.15, color: '#FFFFFF', margin: '14px 0', fontFamily: 'Baloo 2' }}>
                मराठा इतिहास महाग्रंथालय व साम्राज्य दालन
              </h1>
              <div className="rule" style={{ background: 'var(--gold-500)', height: '4px', width: '90px', margin: '12px 0' }}></div>
              <p className="tagline" style={{ fontSize: '1.08rem', maxWidth: '58ch', color: '#FFF8F2', lineHeight: 1.65 }}>
                स्वराज्य, संस्कृती, आरमार, युद्धनीती आणि अद्वितीय शिवकालीन सुशासन — अस्सल ऐतिहासिक साधनांवर आधारित मराठा साम्राज्याचा देदीप्यमान इतिहास.
              </p>

              {/* Stats badges */}
              <div className="stats-glass" style={{ marginTop: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <div className="stat-glass"><b>३.९ दशलक्ष</b><span>चौ.किमी साम्राज्य विस्तार</span></div>
                <div className="stat-glass"><b>३५०+</b><span>अभ्यासित गड-किल्ले</span></div>
                <div className="stat-glass"><b>४१ लढाया</b><span>बाजीरावांची अपराजित युद्धे</span></div>
                <div className="stat-glass"><b>अटकेपार</b><span>विस्तारित भगवा ध्वज</span></div>
              </div>
            </div>

            {/* Interactive Feature Card with Switcher Chips */}
            <div className="hero-feature-card" style={{
              background: '#FFFFFF',
              border: '2px solid #F59E0B',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 16px 36px rgba(0,0,0,0.22)'
            }}>
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={activeHero.img}
                  alt={activeHero.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="card-tag" style={{ position: 'absolute', top: '14px', left: '14px', background: 'var(--maroon-900)', color: '#FFF' }}>
                  {activeHero.badge}
                </span>
              </div>
              <div style={{ padding: '22px' }}>
                <h4 style={{ color: 'var(--maroon-950)', margin: '0 0 8px', fontSize: '1.25rem', fontFamily: 'Baloo 2', fontWeight: 800 }}>
                  {activeHero.title}
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {activeHero.desc}
                </p>

                {/* Switcher Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={`btn ${heroView === 'hero' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => setHeroView('hero')}
                  >
                    🚩 मराठा वीर
                  </button>
                  <button
                    type="button"
                    className={`btn ${heroView === 'samrajya' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => setHeroView('samrajya')}
                  >
                    ⚔️ मराठा साम्राज्य
                  </button>
                  <button
                    type="button"
                    className={`btn ${heroView === 'coronation' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => setHeroView('coronation')}
                  >
                    👑 राज्याभिषेक
                  </button>
                  <button
                    type="button"
                    className={`btn ${heroView === 'map' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => setHeroView('map')}
                  >
                    🗺️ साम्राज्य नकाशा
                  </button>
                </div>

                <Link to={activeHero.link} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block', fontSize: '0.85rem' }}>
                  सविस्तर माहिती पाहा →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '40px 24px', margin: '0 auto' }}>
        
        {/* 3. Sacred Shivrajmudra (Octagonal Stamp + Verse) */}
        <section style={{ marginBottom: '44px' }}>
          <div className="rajmudra-container" style={{
            background: 'linear-gradient(135deg, #FFF8F2, #FFF3E8)',
            border: '2px solid var(--gold-500)',
            borderRadius: '20px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="rajmudra-seal" style={{ margin: '0 auto 18px', width: '110px', height: '110px' }}>
              <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                <polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill="#C73800" stroke="#FFFFFF" strokeWidth="6"/>
                <polygon points="63,18 137,18 182,63 182,137 137,182 63,182 18,137 18,63" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4,2"/>
                <text x="100" y="55" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">प्रतिपच्चंद्रलेखेव</text>
                <text x="100" y="80" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">वर्धिष्णुर्विश्ववंदिता</text>
                <text x="100" y="105" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">शाहसूनोः शिवस्यैषा</text>
                <text x="100" y="130" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">मुद्रा भद्राय</text>
                <text x="100" y="155" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">राजते ॥</text>
              </svg>
            </div>
            <div className="rajmudra-verse" style={{
              fontFamily: 'Baloo 2',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--maroon-950)',
              lineHeight: 1.6,
              marginBottom: '12px'
            }}>
              " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।<br/>
              शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
            </div>
            <div className="rajmudra-meaning" style={{
              fontSize: '1.05rem',
              color: 'var(--saffron-700)',
              fontWeight: 600,
              maxWidth: '850px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा केवळ आणि केवळ प्रजेच्या कल्याणासाठी तळपते आहे!
            </div>
          </div>
        </section>

        {/* 4. Living Bhagwa Flag Feature */}
        <section style={{ marginBottom: '44px' }}>
          <div className="living-flag-card" style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            minHeight: '380px',
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #FFFFFF',
            boxShadow: '0 12px 32px rgba(244,81,30,.2)'
          }}>
            <video
              className="living-flag-video"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              poster="/assets/images/real-sindhudurg-fort.jpg"
            >
              <source src="/assets/videos/bhagwa-flag-waving.mp4" type="video/mp4" />
            </video>
            <div className="living-flag-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(31,10,2,0.92) 0%, rgba(56,15,4,0.75) 55%, rgba(0,0,0,0.3) 100%)', zIndex: 1 }}></div>
            <div className="living-flag-copy" style={{ position: 'relative', zIndex: 2, padding: '40px 32px', maxWidth: '650px', color: '#FFFFFF' }}>
              <span className="card-tag" style={{ background: '#EA580C', color: '#FFF' }}>🚩 स्वराज्याचे प्रतीक</span>
              <h2 style={{ fontSize: '2.1rem', margin: '12px 0', fontFamily: 'Baloo 2', color: '#FFFFFF' }}>आजही अभिमानाने फडकणारा जिवंत भगवा ध्वज</h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#FFEDD5', marginBottom: '20px' }}>
                "ज्यांचे आरमार त्यांचा समुद्र!" म्हणणाऱ्या छत्रपती शिवरायांचा भगवा ध्वज — शौर्य, स्वाभिमान आणि अखंड स्वराज्याचे प्रतीक. साडेतीनशे वर्षांपूर्वी सह्याद्रीच्या कड्यांवर व गडकोटांवर फडकलेला हा ध्वज आजही प्रत्येक मराठ्याच्या मनात तितक्याच जाज्वल्य निष्ठेने फडकत आहे.
              </p>
              <Link to="/culture/symbols" className="btn btn-primary" style={{ display: 'inline-block' }}>
                राजमुद्रा व मराठा चिन्हे पहा →
              </Link>
            </div>
          </div>
        </section>

        {/* 5. अखंड मराठा साम्राज्य (The Great Maratha Empire — १६७४ ते १८१८) */}
        <section id="maratha-samrajya-section" style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.86rem' }}>
                🚩 ३.९ दशलक्ष चौ. किमी · अटकेपासून कटक व तंजावरपर्यंत
              </span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2.2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                अखंड मराठा साम्राज्य (The Great Maratha Empire — १६७४ ते १८१८)
              </h2>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '26px' }}>
            छत्रपती शिवाजी महाराजांनी १६७४ मध्ये स्थापन केलेले सार्वभौम स्वराज्य, छत्रपती संभाजी महाराजांचा अभेद्य लढा, आणि पेशवे, शिंदे, होळकर, भोसले, गायकवाड, पवार घराण्यांनी भारतभर फडकवलेला भगवा ध्वज. १८ व्या शतकात संपूर्ण हिंदुस्थानवर मराठा सत्तेचा एकछत्री दरारा होता.
          </p>

          {/* Panoramic Army Banner */}
          <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', marginBottom: '32px', backgroundColor: '#1a0a04' }}>
            <img
              src="/assets/images/bhavya-maratha-army.jpg"
              alt="मराठा सैन्य"
              style={{ width: '100%', height: '420px', objectFit: 'cover', objectPosition: 'center 45%' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(18,9,3,0.5) 60%, rgba(15,7,3,0.92) 100%)', padding: '32px 24px' }}>
              <span className="card-tag">भव्य दृश्य</span>
              <h3 style={{ color: '#FFFFFF', margin: '8px 0 4px', fontSize: '1.6rem', fontFamily: 'Baloo 2' }}>मराठा सैन्याची अजस्त्र घोडदौड</h3>
              <p style={{ color: 'rgba(255,248,231,0.92)', fontSize: '0.94rem', margin: 0 }}>पागा, तोफखाना व पायदळासह संपूर्ण भारतभर फडकलेला भगवा ध्वज</p>
            </div>
          </div>

          {/* 4 Glass Stats */}
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div className="stat-glass" style={{ background: 'var(--maroon-900)', color: '#FFFFFF', padding: '18px', borderRadius: '12px' }}>
              <b style={{ color: 'var(--gold-400)', fontSize: '1.4rem', display: 'block' }}>३.९ दशलक्ष चौ.किमी</b>
              <span style={{ color: '#E2E8F0', fontSize: '0.85rem' }}>१७५८ मधील सर्वोच्च भूभाग विस्तार</span>
            </div>
            <div className="stat-glass" style={{ background: 'var(--maroon-900)', color: '#FFFFFF', padding: '18px', borderRadius: '12px' }}>
              <b style={{ color: 'var(--saffron-500)', fontSize: '1.4rem', display: 'block' }}>अटकेपार ध्वज</b>
              <span style={{ color: '#E2E8F0', fontSize: '0.85rem' }}>लाहोर व सिंधू नदीवर भगवा (१७५८)</span>
            </div>
            <div className="stat-glass" style={{ background: 'var(--maroon-900)', color: '#FFFFFF', padding: '18px', borderRadius: '12px' }}>
              <b style={{ color: 'var(--gold-400)', fontSize: '1.4rem', display: 'block' }}>४१ लढाया अपराजित</b>
              <span style={{ color: '#E2E8F0', fontSize: '0.85rem' }}>श्रीमंत बाजीराव पेशवे — शून्य पराभव</span>
            </div>
            <div className="stat-glass" style={{ background: 'var(--maroon-900)', color: '#FFFFFF', padding: '18px', borderRadius: '12px' }}>
              <b style={{ color: 'var(--saffron-500)', fontSize: '1.4rem', display: 'block' }}>३५०+ गडकोट</b>
              <span style={{ color: '#E2E8F0', fontSize: '0.85rem' }}>सह्याद्री ते अरबी समुद्र आणि तंजावर</span>
            </div>
          </div>

          {/* 6 Heritage Cards */}
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-maratha-army-panoramic.jpg')", minHeight: '300px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">अस्सल १८ वे शतक</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.2rem', margin: '8px 0' }}>मराठा सैन्य युद्ध मोहीम (Historical Fresco)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.85rem', lineHeight: 1.5 }}>घोडदळ (पागा), तोफखाना, पायदळ आणि भगवा ध्वज घेऊन रणांगणात उतरणाऱ्या मराठा सैन्याचे ऐतिहासिक समकालीन भित्तीचित्र.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-shivaji-coronation.jpg')", minHeight: '300px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">६ जून १६७४</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.2rem', margin: '8px 0' }}>शिवराज्याभिषेक सोहळा (Coronation)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.85rem', lineHeight: 1.5 }}>दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला वैदिक राज्याभिषेक. रयतेच्या सार्वभौम मराठा साम्राज्याची अधिकृत स्थापना.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-maratha-expansion-map.jpg')", backgroundPosition: 'center 20%', minHeight: '300px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">साम्राज्य नकाशा</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.2rem', margin: '8px 0' }}>मराठा साम्राज्य विस्तार नकाशा</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.85rem', lineHeight: 1.5 }}>छत्रपती शाहू महाराज व बाजीराव पेशवे यांच्या नेतृत्वाखाली माळवा, गुजरात, बुंदेलखंड, दिल्ली व ओरिसापर्यंत झालेला अफाट विस्तार.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-maratha-sowar.jpg')", backgroundPosition: 'center 15%', minHeight: '300px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">मराठा घोडदळ</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.2rem', margin: '8px 0' }}>मराठा घोडदळ शिलेदार (Maratha Sowar)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.85rem', lineHeight: 1.5 }}>चिलखत, शिरस्त्राण, भाला (बर्ची), ढाल व तलवार सज्ज मराठा घोडेस्वार — ज्यांच्या वेगवान घोडदौडीने मुघल व युरोपीय सत्तांना पराभूत केले.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-maratha-arms.jpg')", backgroundPosition: 'center 18%', backgroundSize: 'cover', minHeight: '300px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">शस्त्रागार</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.2rem', margin: '8px 0' }}>मराठा शस्त्रास्त्रे व चिलखत संग्रह</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.85rem', lineHeight: 1.5 }}>दांडपट्टा, धोप, तेगा, कट्यार, वाघनखे, गेंड्याच्या कातड्याची ढाल आणि जाळीदार लोखंडी चिलखत — मराठा युद्धकलेची अस्सल शस्त्रे.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-pavankhind.jpg')", minHeight: '300px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">१३ जुलै १६६०</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.2rem', margin: '8px 0' }}>पावनखिंडीचा रणसंग्राम (Pavankhind)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.85rem', lineHeight: 1.5 }}>घोडखिंडीत सिद्दी जोहरच्या अजस्त्र सेनेला रोखून धरणारे वीर बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे अमर बलिदान.</p>
              </div>
            </div>
          </div>

          {/* Fort photo gallery preview */}
          <div className="section-head" style={{ marginTop: '40px', marginBottom: '18px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>📸 उच्च-गुणवत्ता छायाचित्र दालन</span>
              <h3 style={{ fontFamily: 'Baloo 2', fontSize: '1.6rem', color: 'var(--maroon-950)', margin: '4px 0' }}>गडकोटांचे वैभव (Fort Photo Gallery)</h3>
            </div>
            <Link to="/forts" className="more-link" style={{ fontWeight: 700, color: 'var(--saffron-700)' }}>सर्व ३५०+ किल्ले पाहा →</Link>
          </div>
          <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '36px' }}>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-raigad-panoramic.jpg')", minHeight: '190px', borderRadius: '12px' }}>
              <div className="card-bg-body"><h4 style={{ color: '#FFF', fontSize: '1rem', margin: 0 }}>दुर्गराज रायगड</h4><p style={{ color: '#E2E8F0', fontSize: '0.8rem', margin: '4px 0 0' }}>स्वराज्याची राजधानी</p></div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-sindhudurg-fort.jpg')", minHeight: '190px', borderRadius: '12px' }}>
              <div className="card-bg-body"><h4 style={{ color: '#FFF', fontSize: '1rem', margin: 0 }}>किल्ले सिंधुदुर्ग</h4><p style={{ color: '#E2E8F0', fontSize: '0.8rem', margin: '4px 0 0' }}>अभेद्य जलदुर्ग, मालवण</p></div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-pratapgad-fort.jpg')", minHeight: '190px', borderRadius: '12px' }}>
              <div className="card-bg-body"><h4 style={{ color: '#FFF', fontSize: '1rem', margin: 0 }}>किल्ले प्रतापगड</h4><p style={{ color: '#E2E8F0', fontSize: '0.8rem', margin: '4px 0 0' }}>अफझलखान वध स्थळ</p></div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-sinhagad-fort.jpg')", minHeight: '190px', borderRadius: '12px' }}>
              <div className="card-bg-body"><h4 style={{ color: '#FFF', fontSize: '1rem', margin: 0 }}>किल्ले सिंहगड</h4><p style={{ color: '#E2E8F0', fontSize: '0.8rem', margin: '4px 0 0' }}>तानाजी मालुसरे बलिदान</p></div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-panhala-fort.jpg')", minHeight: '190px', borderRadius: '12px' }}>
              <div className="card-bg-body"><h4 style={{ color: '#FFF', fontSize: '1rem', margin: 0 }}>किल्ले पन्हाळगड</h4><p style={{ color: '#E2E8F0', fontSize: '0.8rem', margin: '4px 0 0' }}>बाजीप्रभूंच्या शौर्याची साक्ष</p></div>
            </div>
          </div>

          {/* Empire table */}
          <div className="table-wrap" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ fontFamily: 'Baloo 2', fontSize: '1.3rem', color: 'var(--maroon-950)', marginBottom: '14px' }}>
              मराठा साम्राज्याची ४ प्रमुख युगे (१६४५ ते १८१८)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>कालखंड</th>
                  <th style={{ padding: '12px' }}>युग नाव</th>
                  <th style={{ padding: '12px' }}>प्रमुख छत्रपती / सेनापती</th>
                  <th style={{ padding: '12px' }}>ऐतिहासिक कामगिरी</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}><strong>१६४५ – १६८०</strong></td>
                  <td style={{ padding: '12px' }}><strong style={{ color: 'var(--saffron-700)' }}>हिंदवी स्वराज्य स्थापना युग</strong></td>
                  <td style={{ padding: '12px' }}><strong>छत्रपती शिवाजी महाराज</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>३५०+ गडकोट, स्वतंत्र आरमार, अष्टप्रधान मंडळ, गनिमी कावा आणि स्वराज्याची सार्वभौम स्थापना.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}><strong>१६८१ – १७०७</strong></td>
                  <td style={{ padding: '12px' }}><strong style={{ color: 'var(--saffron-700)' }}>२७ वर्षांचा स्वातंत्र्य संग्राम</strong></td>
                  <td style={{ padding: '12px' }}><strong>संभाजी महाराज, राजाराम महाराज, ताराबाई, संताजी-धनाजी</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>मुघल बादशहा औरंगजेबाच्या ५ लाखांच्या सेनेशी अविरत संघर्ष; औरंगजेबाचा संपूर्ण पराभव व महाराष्ट्रातच दफन.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}><strong>१७०८ – १७६१</strong></td>
                  <td style={{ padding: '12px' }}><strong style={{ color: 'var(--saffron-700)' }}>साम्राज्य विस्तार व पेशवाई युग</strong></td>
                  <td style={{ padding: '12px' }}><strong>छत्रपती शाहू महाराज, बाजीराव पेशवे, चिमाजी आप्पा</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>अटकेपार भगवा ध्वज फडकवला (१७५८), माळवा-गुजरात-बुंदेलखंड विजय, पोर्तुगीजांचा वसईत दारुण पराभव (१७३९).</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}><strong>१७६१ – १८१८</strong></td>
                  <td style={{ padding: '12px' }}><strong style={{ color: 'var(--saffron-700)' }}>मराठा पुनरुत्थान व महादजी युग</strong></td>
                  <td style={{ padding: '12px' }}><strong>महादजी शिंदे, नाना फडणवीस, अहिल्याबाई होळकर</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>पानिपतनंतर अवघ्या १० वर्षांत दिल्ली पुन्हा जिंकली; मुघल बादशहाला मराठ्यांचे मांडलिक बनवले व इंग्रजांना पराभूत केले.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. छत्रपती शिवाजी महाराजांचे अष्टप्रधान मंडळ (Ashtapradhan Council) */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '18px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>शिवकालीन राज्यव्यवस्था व सुशासन</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                छत्रपती शिवाजी महाराजांचे अष्टप्रधान मंडळ (Ashtapradhan Council)
              </h2>
            </div>
            <Link to="/history/shivaji-maharaj" className="more-link" style={{ fontWeight: 700, color: 'var(--saffron-700)' }}>
              सविस्तर राज्यव्यवस्था →
            </Link>
          </div>
          <p className="muted" style={{ marginBottom: '20px', fontSize: '0.98rem' }}>
            १६७४ च्या राज्याभिषेकानंतर छत्रपती शिवरायांनी स्वराज्याच्या प्रशासनासाठी स्थापन केलेले आशिया खंडातील पहिले आधुनिक मंत्रीमंडळ:
          </p>
          <div className="table-wrap" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>क्र.</th>
                  <th style={{ padding: '12px' }}>पद</th>
                  <th style={{ padding: '12px' }}>शिवकालीन मंत्री</th>
                  <th style={{ padding: '12px' }}>खाते व प्रशासकीय अधिकार</th>
                  <th style={{ padding: '12px' }}>वेतन</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>१</td>
                  <td style={{ padding: '12px' }}><strong>पेशवा (मुख्य प्रधान)</strong></td>
                  <td style={{ padding: '12px' }}><strong>मोरोपंत त्र्यंबक पिंगळे</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>राजांच्या गैरहजेरीत संपूर्ण राज्यकारभार चालवणे, सर्व मुलकी व लष्करी खात्यांवर सर्वोच्च देखरेख, युद्धप्रसंगी सैन्याचे नेतृत्व.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१५,००० होन</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>२</td>
                  <td style={{ padding: '12px' }}><strong>अमात्य (अर्थ व महसूल मंत्री)</strong></td>
                  <td style={{ padding: '12px' }}><strong>रामचंद्र नीलकंठ मुजुमदार</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>स्वराज्याचा संपूर्ण जमाखर्च, तिजोरी, वार्षिक अंदाजपत्रक व महसूल खात्यावर पूर्ण नियंत्रण.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१२,००० होन</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>३</td>
                  <td style={{ padding: '12px' }}><strong>सचिव (गृह व पत्रव्यवहार प्रमुख)</strong></td>
                  <td style={{ padding: '12px' }}><strong>अण्णाजी दत्तो</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>राजांच्या सर्व आज्ञापत्रांची शुद्धता तपासणे, सरकारी दप्तर सांभाळणे आणि जमीन महसूल मोजणीची अंमलबजावणी.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१०,००० होन</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>४</td>
                  <td style={{ padding: '12px' }}><strong>मंत्री (वाकनीस / गुप्तवार्ता प्रमुख)</strong></td>
                  <td style={{ padding: '12px' }}><strong>दत्ताजी त्रिंबक वाकनीस</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>राजांची दैनंदिनी, राजदरबारातील सुरक्षा, गुप्तहेर खात्याचा समन्वय आणि भोजन व वैयक्तिक सुरक्षिततेची जबाबदारी.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१०,००० होन</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>५</td>
                  <td style={{ padding: '12px' }}><strong>सेनापती (सरनोबत)</strong></td>
                  <td style={{ padding: '12px' }}><strong>हंबीरराव मोहिते</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>स्वराज्याच्या संपूर्ण घोडदळ व पायदळाचे सर्वोच्च सेनापती; सैन्याची भरती, शिस्त, शस्त्रास्त्रे व प्रत्यक्ष युद्धव्यूहरचना.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१०,००० होन</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>६</td>
                  <td style={{ padding: '12px' }}><strong>सुमंत (परराष्ट्रमंत्री / डबीर)</strong></td>
                  <td style={{ padding: '12px' }}><strong>रामचंद्र त्रिंबक डबीर</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>परकीय सत्तांशी राजकीय व राजनैतिक पत्रव्यवहार आणि वकिलांचे स्वागत.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१०,००० होन</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px' }}>७</td>
                  <td style={{ padding: '12px' }}><strong>पंडितराव (धर्माध्यक्ष)</strong></td>
                  <td style={{ padding: '12px' }}><strong>रघुनाथराव पंडितराव</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>राज्यातील धर्मव्यवस्था, दानधर्म, विद्वानांचा सन्मान, आचारसंहिता आणि सांस्कृतिक उत्सवांचे नियोजन.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१०,००० होन</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}>८</td>
                  <td style={{ padding: '12px' }}><strong>न्यायाधीश (सरन्यायाधीश)</strong></td>
                  <td style={{ padding: '12px' }}><strong>निराजी रावजी</strong></td>
                  <td style={{ padding: '12px', fontSize: '0.92rem' }}>स्वराज्यातील सर्वोच्च न्यायव्यवस्था; दिवाणी, फौजदारी आणि शेतजमिनींच्या तंट्यांवर निष्पक्ष व कठोर न्यायनिवाडा.</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--saffron-700)' }}>१०,००० होन</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. सह्याद्रीचे गडकिल्ले — ३५०+ किल्ले व स्थापत्यशास्त्र */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '22px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>सह्याद्रीचे गडकिल्ले · लष्करी अभियांत्रिकी</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                सह्याद्रीचे गडकिल्ले — ३५०+ किल्ले व स्थापत्यशास्त्र
              </h2>
            </div>
            <Link to="/forts" className="btn btn-primary" style={{ padding: '10px 22px' }}>
              सर्व ३५०+ किल्ले पाहा →
            </Link>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-raigad-panoramic.jpg')", minHeight: '340px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">⛰️ गिरीदुर्ग</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.25rem', margin: '8px 0' }}>गिरीदुर्ग (Hill Forts)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>सह्याद्रीच्या नैसर्गिक उत्तुंग कड्यांवर वसलेले अभेद्य किल्ले. चहूबाजूंनी ताशीव कडे, गुप्त दिंडी दरवाजे, दुहेरी तटबंदी व बालेकिल्ला ही प्रमुख वैशिष्ट्ये.</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>ताशीव कडे</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>माच्या</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>टाके</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>गोमुखी रचना</span>
                </div>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-sindhudurg-fort.jpg')", minHeight: '340px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">🌊 जलदुर्ग</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.25rem', margin: '8px 0' }}>जलदुर्ग / सागरी किल्ले (Sea Forts)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>अरबी समुद्रात खडकांवर पायाभरणी करून बांधलेले अभेद्य नाविक किल्ले. समुद्राच्या अजस्त्र लाटांचा मारा सहन करण्यासाठी पायात शिशाचा रस ओतून दगड जोडले गेले.</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>शिशाची जोडणी</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>५२ बुरुज</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>सुरक्षित गोदी</span>
                </div>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-ahmednagar-main-gate.jpg')", minHeight: '340px', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">🏰 भुईकोट</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.25rem', margin: '8px 0' }}>भुईकोट (Land / Plain Forts)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>सपाट जमिनीवर किंवा पठारावर व्यापारी मार्गांच्या रक्षणासाठी बांधलेले किल्ले. किल्ल्याभोवती खोल खंदक खणून त्यात पाणी व मगरी सोडल्या जात असत.</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>खोल खंदक</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>व्यापारी नाके</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#FFF' }}>तोफखाना तळे</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. शिवकालीन सुशासन, शेतकरी हित व पर्यावरण आज्ञापत्र */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '22px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>रयतेचे राज्य</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                शिवकालीन सुशासन, शेतकरी हित व पर्यावरण आज्ञापत्र
              </h2>
            </div>
          </div>
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            <div className="policy-card" style={{ minHeight: '290px', backgroundImage: "url('/assets/images/real-farmer-field.jpg')", borderRadius: '16px' }}>
              <div className="card-bg-body">
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>🌾 काठी मोजणी व शेतसारा सुधारणा</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>अण्णाजी दत्तो यांच्या नेतृत्वाखाली ८० तसूं लांबीच्या 'शिवशाही काठी'ने जमिनीची अचूक मोजणी केली गेली. पिकांची प्रतवारी करून केवळ वास्तविक उत्पन्नावर सारा ठरवला जाई.</p>
              </div>
            </div>
            <div className="policy-card" style={{ minHeight: '290px', backgroundImage: "url('/assets/images/real-sahyadri-forest.jpg')", borderRadius: '16px' }}>
              <div className="card-bg-body">
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>🌳 पर्यावरण व वृक्षसंवर्धन आज्ञापत्र</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>आरमारासाठी लाकूड हवे म्हणून रयतेने पोटच्या लेकरासारखी वाढवलेली आंबा, फणस, वड, पिंपळ अशी फळझाडे तोडण्यास सक्त मनाई होती!</p>
              </div>
            </div>
            <div className="policy-card" style={{ minHeight: '290px', backgroundImage: "url('/assets/images/real-maratha-court-1792.jpg')", borderRadius: '16px' }}>
              <div className="card-bg-body">
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>🛡️ स्त्रियांचा सन्मान व कठोर न्यायव्यवस्था</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>स्वराज्यात स्त्रियांच्या सन्मानाला सर्वोच्च प्राधान्य होते. शत्रूच्या प्रदेशातही स्त्रिया, बालके, शेतकरी व धर्मस्थळांना स्पर्श करण्याची कोणाची हिम्मत नव्हती.</p>
              </div>
            </div>
            <div className="policy-card" style={{ minHeight: '290px', backgroundImage: "url('/assets/images/real-shivrai-coin.jpg')", borderRadius: '16px' }}>
              <div className="card-bg-body">
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>🪙 शिवकालीन नाणी व चलन व्यवस्था</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>१६७४ च्या राज्याभिषेकानंतर शिवरायांनी स्वतःची अधिकृत नाणी पाडली: सुवर्ण 'होन' आणि तांब्याची 'शिवराई'. परकीय चलनावर अवलंबून न राहता स्वयंपूर्ण अर्थव्यवस्थेची मुहूर्तमेढ.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. मराठा आरमार व सागरी सार्वभौमत्व (Father of Indian Navy) */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>🌊 सागरी सीमांचे अभेद्य रक्षण · 'ज्यांचे आरमार त्यांचा समुद्र'</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                मराठा आरमार व सागरी सार्वभौमत्व (Father of Indian Navy)
              </h2>
            </div>
            <Link to="/history/maratha-navy" className="more-link" style={{ fontWeight: 700, color: 'var(--saffron-700)' }}>
              सविस्तर आरमार इतिहास →
            </Link>
          </div>
          <p className="muted" style={{ marginBottom: '24px', fontSize: '1rem', lineHeight: 1.6 }}>
            छत्रपती शिवाजी महाराजांनी १६५७ मध्ये कल्याण-भिवंडीत भारताच्या पहिल्या स्वतंत्र आरमाराची पायाभरणी केली. पोर्तुगीज, ब्रिटिश, डच व जंजिऱ्याच्या सिद्दीच्या समुद्री वर्चस्वाला सुरुंग लावून मराठ्यांनी पश्चिम किनारपट्टीवर स्वतःचे निर्विवाद प्रभुत्व प्रस्थापित केले.
          </p>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-kanhoji-angre.jpg')", minHeight: '380px', backgroundPosition: 'center 12%', backgroundSize: 'cover', borderRadius: '18px' }}>
              <div className="card-bg-body">
                <span className="card-tag">दर्यासारंग (Grand Admiral)</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.35rem', margin: '8px 0' }}>सरखेल कान्होजी आंग्रे (१६६९ – १७२९)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.88rem', lineHeight: 1.5 }}>मराठा आरमाराचे अद्वितीय सरखेल ज्यांनी सलग ३० वर्षे इंग्रज, पोर्तुगीज आणि डच नौदलांना एकाही सागरी लढाईत जिंकू दिले नाही. विजयदुर्ग, सुवर्णदुर्ग आणि खांदेरी-उंदेरीवरून त्यांनी संपूर्ण कोकण किनारपट्टीवर मराठ्यांचे सार्वभौमत्व राखले.</p>
                <div style={{ background: 'rgba(233,196,106,.2)', color: '#FFF', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid var(--gold-400)', fontSize: '0.84rem', marginTop: '12px' }}>
                  ⚓ भारतीय नौदलाचा वारसा: 'आयएनएस आंग्रे' (INS Angre) हे त्यांच्याच सन्मानार्थ नामकरण करण्यात आले आहे.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-sindhudurg-fort.jpg')", minHeight: '180px', borderRadius: '16px' }}>
                <div className="card-bg-body">
                  <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>⚓ शिवकालीन मराठा युद्धनौकांचे प्रकार</h4>
                  <p style={{ color: '#F1F5F9', fontSize: '0.84rem', lineHeight: 1.5 }}>
                    <strong>गुराब:</strong> २-३ डोलकाठ्यांची, १५०-३०० टनांची मुख्य तोफधारी युद्धनौका.<br />
                    <strong>गलबत:</strong> वेगवान वल्हवणारी लढाऊ नौका.<br />
                    <strong>पाल:</strong> अजस्त्र तीन मजली लढाऊ जहाज.<br />
                    <strong>मचवा व शिबाड:</strong> वेगवान टेहळणी नौका.
                  </p>
                </div>
              </div>
              <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-raigad-panoramic.jpg')", minHeight: '180px', borderRadius: '16px' }}>
                <div className="card-bg-body">
                  <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>📜 शिवछत्रपतींचे आज्ञापत्र — आरमाराचे महत्त्व</h4>
                  <p style={{ fontStyle: 'italic', color: '#FFF', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    "ज्यांचे आरमार त्यांचा समुद्र! जलदुर्ग व आरमार हे स्वतंत्र राज्यच आहे. ज्यास समुद्रतीराचे रक्षण करणे त्यास आरमार अवश्यकच आहे."
                  </p>
                  <span style={{ fontSize: '0.78rem', color: '#FED7AA' }}>— रामचंद्रपंत अमात्य लिखित 'शिवकालीन आज्ञापत्र'</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. पानिपतनंतरचे महापुनरुत्थान व महादजी युग (The Great Resurgence) */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>👑 राखेमधून पुन्हा उभे राहिलेले महासाम्राज्य · १७६१ ते १८०३</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                पानिपतनंतरचे महापुनरुत्थान व महादजी युग (The Great Resurgence)
              </h2>
            </div>
          </div>
          <p className="muted" style={{ marginBottom: '24px', fontSize: '1rem', lineHeight: 1.6 }}>
            १४ जानेवारी १७६१ रोजी पानिपतच्या तिसऱ्या युद्धात मोठा आघात सहन केल्यानंतर जगाला वाटले होते की मराठा सत्ता संपली. परंतु अवघ्या १० वर्षांत पेशवे माधवराव, महादजी शिंदे, तुकोजी होळकर आणि नाना फडणवीस यांनी पुन्हा दिल्लीवर भगवा फडकवून मुघल बादशहाला मराठ्यांचे मांडलिक बनवले.
          </p>
          <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', marginBottom: '28px', backgroundColor: '#1a0a04' }}>
            <img 
              src="/assets/images/real-maratha-court-1792.jpg" 
              alt="मराठा राजदरबार १७९२" 
              style={{ width: '100%', height: '440px', objectFit: 'cover', objectPosition: 'center 8%', display: 'block' }} 
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(18,9,3,0.65) 60%, rgba(15,7,3,0.95) 100%)', padding: '28px 24px' }}>
              <span className="card-tag">अस्सल ऐतिहासिक तैलचित्र · १७९२</span>
              <h4 style={{ color: '#FFFFFF', margin: '8px 0 6px', fontSize: '1.4rem', fontFamily: 'Baloo 2' }}>मराठा राजदरबार (The Maratha Durbar at Pune, 1792)</h4>
              <p style={{ color: 'rgba(255,248,231,0.92)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                ब्रिटिश चित्रकार जेम्स वेल्स याने शनिवार वाड्यामध्ये प्रत्यक्ष उपस्थित राहून रेखाटलेले ऐतिहासिक चित्र. यामध्ये पेशवे सवाई माधवराव, कारभारी नाना फडणवीस, महादजी शिंदे आणि मराठा मुत्सद्दी उपस्थित आहेत.
              </p>
            </div>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-mahadji-shinde.jpg')", minHeight: '340px', backgroundPosition: 'center 15%', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">वकील-ए-मुतलक</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.25rem', margin: '8px 0' }}>श्रीमंत महादजी शिंदे (पाटीलबाबा)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>पानिपतच्या युद्धात जखमी होऊनही पुन्हा फिनिक्स पक्ष्यासारखे झेप घेणारे महान योद्धे. १७७१ मध्ये दिल्ली जिंकली, मुघल बादशहाला मांडलिक केले आणि फ्रेंच सेनापती डी बॉईनच्या साहाय्याने भारतातील पहिली आधुनिक तोफखाना-सज्ज कवायती सेना उभारली.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-nana-phadnavis.jpg')", minHeight: '340px', backgroundPosition: 'center 15%', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">सर्वोच्च मुत्सद्दी</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.25rem', margin: '8px 0' }}>मुत्सद्दी नाना फडणवीस (१७४२ – १८००)</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>युरोपीय इतिहासकारांनी 'मराठ्यांचे मॅकियाव्हेली' संबोधलेले बुद्धिवंत राजकारणी. नारायणराव पेशव्यांच्या हत्येनंतर 'बारभाई कारस्थान' रचून स्वराज्याची धुरा सांभाळली. पहिल्या इंग्रज-मराठा युद्धात इंग्रजांना नमवून 'सालबाईचा तह' घडवून आणला.</p>
              </div>
            </div>
            <div className="card-bg" style={{ backgroundImage: "url('/assets/images/real-ahilyabai-holkar.jpg')", minHeight: '340px', backgroundPosition: 'center 6%', backgroundSize: 'cover', borderRadius: '16px' }}>
              <div className="card-bg-body">
                <span className="card-tag">लोकमाता व तत्त्वज्ञ राणी</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.25rem', margin: '8px 0' }}>पुण्यश्लोक अहिल्याबाई होळकर</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.86rem', lineHeight: 1.5 }}>माळवा प्रांताची आदर्श राज्यकर्ती ज्यांनी महेश्वर येथून ३० वर्षे सुशासन चालवले. महेश्वर साड्यांच्या वस्त्रोद्योगाची स्थापना केली, शेतकऱ्यांना करसवलती दिल्या, आणि काशी विश्वनाथ ते रामेश्वरमपर्यंत शेकडो मंदिरांचा जीर्णोद्धार केला.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. इतिहास संशोधकांचे विचारमंथन व अभ्यास (Scholarly Authorities) */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>📚 अस्सल ऐतिहासिक पुरावे · संशोधकांची निष्पक्ष मीमांसा</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                इतिहास संशोधकांचे विचारमंथन व अभ्यास (Scholarly Authorities)
              </h2>
            </div>
            <Link to="/history/granthalaya" className="more-link" style={{ fontWeight: 700, color: 'var(--saffron-700)' }}>
              इतिहास ग्रंथ दालन →
            </Link>
          </div>
          <p className="muted" style={{ marginBottom: '24px', fontSize: '1rem', lineHeight: 1.6 }}>
            मराठा साम्राज्याचा इतिहास हा केवळ काल्पनिक कथांवर नव्हे, तर समकालीन मोडी कागदपत्रे, बखरी, पोर्तुगीज-डच-ब्रिटिश पुराभिलेखागारे आणि प्रत्यक्ष गडकोटांच्या शास्त्रीय संशोधनावर अधिष्ठित आहे. महाराष्ट्रातील अग्रगण्य इतिहास संशोधकांचे हे अधिकृत निष्कर्ष:
          </p>
          <div className="researchers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="researcher-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="researcher-top" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <img className="researcher-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 35%' }} src="/assets/images/real-babasaheb-purandare.jpg" alt="शिवशाहीर बाबासाहेब पुरंदरे" />
                <div>
                  <div className="author-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--saffron-700)' }}>📖 'राजा शिवछत्रपती' महाग्रंथकार</div>
                  <h4 style={{ margin: '4px 0 0', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>बाबासाहेब पुरंदरे</h4>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>"शिवछत्रपतींचे स्वराज्य हे कोणत्याही धर्माविरुद्ध नव्हते, तर ते जुलूम, अन्याय आणि परावलंबित्वाविरुद्ध पुकारलेले बंड होते. शिवरायांचे राज्य हे 'रयतेचे स्वराज्य' होते!"</p>
              <div style={{ background: 'var(--paper-2)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--maroon-900)', fontWeight: 600, marginTop: '12px' }}>
                🌟 शिवशाही म्हणजे केवळ साम्राज्यविस्तार नव्हे, तर रयतेचे कल्याण व सर्वोच्च नैतिक सुशासन.
              </div>
            </div>
            <div className="researcher-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="researcher-top" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <img className="researcher-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', objectPosition: '45% 25%' }} src="/assets/images/real-mohan-shete.jpg" alt="इतिहास अभ्यासक मोहन शेटे" />
                <div>
                  <div className="author-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--saffron-700)' }}>⚔️ 'शिवस्पर्श' अभ्यासक</div>
                  <h4 style={{ margin: '4px 0 0', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>मोहन शेटे</h4>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>"मराठा सैन्याची खरी शक्ती त्यांच्या अद्वितीय वेगात आणि गनिमी काव्यात होती. श्रीमंत बाजीराव पेशव्यांनी ४१ लढाया लढल्या आणि एकाही लढाईत पराभव पत्करला नाही!"</p>
              <div style={{ background: 'var(--paper-2)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--maroon-900)', fontWeight: 600, marginTop: '12px' }}>
                ⚡ बाजीरावांची अपराजित ४१ युद्धे आणि संभाजीराजांचा ९ वर्षांचा अभेद्य लढा हे मराठा युद्धशास्त्राचे शिखर.
              </div>
            </div>
            <div className="researcher-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="researcher-top" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <img className="researcher-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', objectPosition: '22% 18%' }} src="/assets/images/real-ninad-bedekar.jpg" alt="इतिहास संशोधक निनाद बेडेकर" />
                <div>
                  <div className="author-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--saffron-700)' }}>🏰 आंतरराष्ट्रीय दुर्गशास्त्र तज्ज्ञ</div>
                  <h4 style={{ margin: '4px 0 0', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>निनाद बेडेकर</h4>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>"सह्याद्रीतील गडकोट हे केवळ दगडमातीचे बांधकाम नाहीत, तर ते जागतिक दर्जाचे लष्करी अभियांत्रिकी चमत्कार आहेत! गडांचे गोमुखी दरवाजे असे वळणावळणावर बांधले गेले की बाहेरील शत्रूच्या तोफांना थेट मारा करणे अशक्य होई."</p>
              <div style={{ background: 'var(--paper-2)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--maroon-900)', fontWeight: 600, marginTop: '12px' }}>
                🛡️ गोमुखी महाद्वारे, शिशाचा रस ओतलेली पायाभरणी व जलव्यवस्थापन हे शिवकालीन दुर्गशास्त्राचे वैभव.
              </div>
            </div>
            <div className="researcher-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="researcher-top" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <img className="researcher-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 20%' }} src="/assets/images/real-vk-rajwade.jpg" alt="इतिहासचार्य वि. का. राजवाडे" />
                <div>
                  <div className="author-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--saffron-700)' }}>📜 आधुनिक इतिहास संशोधनाचे जनक</div>
                  <h4 style={{ margin: '4px 0 0', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>वि. का. राजवाडे</h4>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>"कागदपत्रांशिवाय इतिहास नाही (No Document, No History)! इतिहास म्हणजे कल्पनाविलास नव्हे; तो अस्सल समकालीन कागदपत्रे, सनदा, मोडी पत्रव्यवहार आणि शकावलींवर आधारलेला असावा."</p>
              <div style={{ background: 'var(--paper-2)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--maroon-900)', fontWeight: 600, marginTop: '12px' }}>
                📜 २२ खंडांमधील अस्सल मोडी कागदपत्रांच्या आधारे सिद्ध झालेले मराठा साम्राज्याचे राष्ट्रव्यापी प्रभुत्व.
              </div>
            </div>
          </div>
        </section>

        {/* 12. Featured Legendary Leaders */}
        <section style={{ marginBottom: '50px' }}>
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>इतिहास दालन</span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
                साम्राज्याचे महायोद्धे व ऐतिहासिक चरित्र ग्रंथ
              </h2>
            </div>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Link to="/history/shivaji-maharaj" className="card-bg" style={{ backgroundImage: "url('/assets/images/maratha-hero.jpg')", minHeight: '340px', backgroundPosition: 'center 8%', backgroundSize: 'cover', borderRadius: '16px', textDecoration: 'none' }}>
              <div className="card-bg-body">
                <span className="card-tag">हिंदवी स्वराज्य संस्थापक</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.3rem', margin: '8px 0' }}>छत्रपती शिवाजी महाराज</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.88rem', lineHeight: 1.5 }}>रयतेचे राजे, आरमार पितामह, गनिमी काव्याचे जनक व अष्टप्रधान मंडळाचे शिल्पकार.</p>
                <span className="btn btn-primary" style={{ marginTop: '10px', fontSize: '0.82rem', display: 'inline-block' }}>सविस्तर चरित्र वाचा →</span>
              </div>
            </Link>
            <Link to="/history/sambhaji-maharaj" className="card-bg" style={{ backgroundImage: "url('/assets/images/Sambhaji_Maharaj.jpg')", minHeight: '340px', backgroundPosition: 'center 8%', backgroundSize: 'cover', borderRadius: '16px', textDecoration: 'none' }}>
              <div className="card-bg-body">
                <span className="card-tag">अपराजित धर्मवीर</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.3rem', margin: '8px 0' }}>छत्रपती संभाजी महाराज</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.88rem', lineHeight: 1.5 }}>१२८ लढायांमध्ये अजिंक्य, 'बुधभूषणम्' संस्कृत ग्रंथकार व तुळापूरचे सर्वोच्च बलिदान.</p>
                <span className="btn btn-primary" style={{ marginTop: '10px', fontSize: '0.82rem', display: 'inline-block' }}>सविस्तर चरित्र वाचा →</span>
              </div>
            </Link>
            <Link to="/history/bajirao-peshwa" className="card-bg" style={{ backgroundImage: "url('/assets/images/real-bajirao-pune-statue.jpg')", minHeight: '340px', backgroundPosition: 'center 15%', backgroundSize: 'cover', borderRadius: '16px', textDecoration: 'none' }}>
              <div className="card-bg-body">
                <span className="card-tag">अपराजित सेनापती</span>
                <h4 style={{ color: '#FFF', fontFamily: 'Baloo 2', fontSize: '1.3rem', margin: '8px 0' }}>श्रीमंत बाजीराव पेशवे</h4>
                <p style={{ color: '#F1F5F9', fontSize: '0.88rem', lineHeight: 1.5 }}>४१ लढाया, शून्य पराभव — पालखेड मोहीम, गनिमी घोडदौड व अटकेपार साम्राज्य विस्तार.</p>
                <span className="btn btn-primary" style={{ marginTop: '10px', fontSize: '0.82rem', display: 'inline-block' }}>सविस्तर चरित्र वाचा →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* 13. Category Tabs & Full Historical Figures Directory */}
        <section style={{ marginBottom: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ color: 'var(--saffron-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.86rem' }}>
              HISTORICAL FIGURES DIRECTORY
            </span>
            <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2.1rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
              मराठा साम्राज्याचे अमर युगपुरुष व वीरांगना
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.96rem' }}>
              छत्रपती, पेशवे, सेनापती, वीरांगना आणि स्वराज्याचे अमर शिलेदार यांची सचित्र माहिती
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
            {[
              { id: 'all', label: 'सर्व युगपुरुष व नेते' },
              { id: 'chhatrapati', label: '👑 छत्रपती घराणे' },
              { id: 'peshwa', label: '🐎 पेशवे व सेनापती' },
              { id: 'virangana', label: '🛡️ वीरांगना' },
              { id: 'yodha', label: '⚔️ अमर शिलेदार' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`tab ${filter === tab.id ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: '1px solid var(--line)',
                  background: filter === tab.id ? 'var(--maroon-900)' : '#FFFFFF',
                  color: filter === tab.id ? '#FFFFFF' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {filteredFigures.map(fig => (
              <Link
                key={fig.id}
                to={fig.link}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1.5px solid var(--line)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.14)';
                  e.currentTarget.style.borderColor = 'var(--saffron-500)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = 'var(--line)';
                }}
              >
                {/* Image Frame */}
                <div style={{
                  width: '100%',
                  aspectRatio: '4 / 3.8',
                  position: 'relative',
                  overflow: 'hidden',
                  background: fig.bg || 'radial-gradient(circle at center, #231209 0%, #0d0603 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={fig.image}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: '-10px',
                      width: 'calc(100% + 20px)',
                      height: 'calc(100% + 20px)',
                      objectFit: 'cover',
                      filter: 'blur(16px) brightness(0.35)',
                      opacity: 0.65,
                      pointerEvents: 'none'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />

                  <img
                    src={fig.image}
                    alt={fig.name}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      zIndex: 2,
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                    }}
                    onError={(e) => {
                      if (!e.target.dataset.tried) {
                        e.target.dataset.tried = '1';
                        e.target.src = fig.image.startsWith('/') ? fig.image.slice(1) : '/' + fig.image;
                      } else {
                        e.target.src = '/assets/images/real-raigad-panoramic.jpg';
                      }
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)',
                    zIndex: 3,
                    pointerEvents: 'none'
                  }} />
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1, background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      background: 'rgba(230,81,0,0.1)',
                      color: 'var(--maroon-900)',
                      border: '1px solid rgba(230,81,0,0.25)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {fig.badge}
                    </span>
                  </div>
                  <strong style={{ fontSize: '1.18rem', fontFamily: 'Baloo 2', color: 'var(--maroon-950)', display: 'block', marginBottom: '6px', lineHeight: 1.3 }}>
                    {fig.name}
                  </strong>
                  <div style={{ color: 'var(--muted)', fontSize: '0.84rem', lineHeight: 1.5, flexGrow: 1 }}>
                    {fig.desc}
                  </div>
                  <div style={{ marginTop: '12px', color: 'var(--saffron-700)', fontWeight: 700, fontSize: '0.85rem' }}>
                    सविस्तर चरित्र वाचा →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 14. Timeline of Empire (१६३०–१८१८) */}
        <section style={{ marginBottom: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: 'var(--saffron-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.86rem' }}>
              CHRONOLOGY OF GLORY
            </span>
            <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2.1rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
              मराठा साम्राज्याचा सुवर्ण कालपट (१६३०–१८१८)
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.96rem' }}>
              शिवनेरी ते रायगड आणि अटकेपार ते शनिवार वाडा — महत्त्वाच्या ऐतिहासिक घटनांचा कालक्रमानुसार आढावा
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '30px 24px', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              {timelineEvents.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: idx % 2 === 0 ? 'var(--paper-2)' : '#FFFFFF',
                    borderLeft: '4px solid var(--saffron-500)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <div style={{
                    minWidth: '190px',
                    flexShrink: 0,
                    fontWeight: 800,
                    color: 'var(--maroon-900)',
                    fontFamily: 'Baloo 2',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: 'var(--saffron-600)', fontSize: '0.9rem' }}>🚩</span>
                    <span>{t.year}</span>
                  </div>
                  <div style={{ fontSize: '0.96rem', color: 'var(--ink-soft)', lineHeight: 1.65, fontWeight: 500 }}>
                    {t.event}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 15. Quick Access to Historical Research Portals */}
        <section style={{ marginTop: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Baloo 2', fontSize: '1.6rem', color: 'var(--maroon-950)' }}>
              अधिक ऐतिहासिक दालने व संशोधन केंद्र
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <Link to="/history/granthalaya" style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📚</div>
              <strong style={{ color: 'var(--maroon-950)', display: 'block', fontSize: '0.95rem' }}>मराठा महाग्रंथालय</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>बखरी व ऐतिहासिक खंड</span>
            </Link>
            <Link to="/history/battles" style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>⚔️</div>
              <strong style={{ color: 'var(--maroon-950)', display: 'block', fontSize: '0.95rem' }}>प्रमुख रणसंग्राम</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>१००+ ऐतिहासिक लढाया</span>
            </Link>
            <Link to="/history/maratha-navy" style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>⚓</div>
              <strong style={{ color: 'var(--maroon-950)', display: 'block', fontSize: '0.95rem' }}>मराठा आरमार</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>सागरी सार्वभौमत्व व किल्ले</span>
            </Link>
            <Link to="/forts" style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🏰</div>
              <strong style={{ color: 'var(--maroon-950)', display: 'block', fontSize: '0.95rem' }}>३५०+ गडकिल्ले</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>सह्याद्रीची दुर्ग संपदा</span>
            </Link>
            <Link to="/history/balidan-maas" style={{ textDecoration: 'none', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🛡️</div>
              <strong style={{ color: 'var(--maroon-950)', display: 'block', fontSize: '0.95rem' }}>बलिदान मास</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>धर्मवीर संभाजी महाराज स्मृती</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
