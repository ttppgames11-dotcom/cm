import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  const filteredFigures = filter === 'all'
    ? historicalFigures
    : historicalFigures.filter(f => f.category === filter);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* War Cry Strip */}
      <div className="war-cry-strip">
        <span className="flame-icon">🔥</span>
        <span>|| गर्जा महाराष्ट्र माझा! सह्याद्रीच्या काळजातून उमटलेली अखंड स्वाभिमानाची अमर गाथा! ||</span>
        <span className="flame-icon">🔥</span>
      </div>

      {/* Hero Section */}
      <div className="hero" style={{ minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-samrajya.jpg"
          alt="मराठा साम्राज्य"
          className="hero-bg-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        <div className="hero-overlay" style={{ background: 'radial-gradient(circle at 75% 35%, rgba(230,81,0,0.55), rgba(12,2,4,0.92) 80%)' }}></div>

        <div className="wrap hero-content" style={{ maxWidth: '1320px', width: '100%', padding: '50px 24px', position: 'relative', zIndex: 2 }}>
          <div className="hero-website-grid">
            <div>
              <div className="eyebrow">अखंड शौर्याची गौरवगाथा · १६३० ते १८१८</div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', lineHeight: 1.12, color: '#FFFFFF', margin: '12px 0' }}>
                मराठा इतिहास महाग्रंथालय
              </h1>
              <div className="rule" style={{ background: 'var(--gold-500)', height: '4px', width: '80px', margin: '12px 0' }}></div>
              <p className="tagline" style={{ fontSize: '1.1rem', maxWidth: '54ch', color: '#FFF8F2', lineHeight: 1.6 }}>
                स्वराज्य, संस्कृती, युद्धनीती आणि अद्वितीय सुशासन — अस्सल ऐतिहासिक साधनांवर आधारित मराठा साम्राज्याचा देदीप्यमान इतिहास.
              </p>

              <div className="stats-glass" style={{ marginTop: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="stat-glass"><b>१८८</b><span>वर्षांचे देदीप्यमान साम्राज्य</span></div>
                <div className="stat-glass"><b>३५०+</b><span>अभ्यासित गड-किल्ले</span></div>
                <div className="stat-glass"><b>१००+</b><span>निर्णायक लढाया</span></div>
                <div className="stat-glass"><b>अटकेपार</b><span>विस्तारित भगवा ध्वज</span></div>
              </div>
            </div>

            <div className="hero-real-card" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '24px' }}>
                <span className="card-badge" style={{ background: '#C73800', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  🚩 हिंदवी स्वराज्य
                </span>
                <h4 style={{ color: '#FFFFFF', margin: '14px 0 8px', fontSize: '1.25rem', fontFamily: 'Baloo 2' }}>
                  छत्रपती शिवाजी महाराज — अखंड स्वराज्य
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  ६ जून १६७४ रोजी दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला ऐतिहासिक वैदिक राज्याभिषेक व स्वतंत्र सार्वभौम मराठा साम्राज्याची स्थापना.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <Link to="/history/shivaji-maharaj" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    सविस्तर शिवचरित्र वाचा →
                  </Link>
                  <Link to="/forts" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF', padding: '8px 16px', fontSize: '0.85rem' }}>
                    ३५०+ गड-किल्ले नकाशा 🏰
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '40px 24px' }}>
        
        {/* Sacred Shivrajmudra */}
        <section style={{ marginBottom: '40px' }}>
          <div className="rajmudra-container" style={{
            background: 'linear-gradient(135deg, #FFF8F2, #FFF3E8)',
            border: '2px solid var(--gold-500)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="rajmudra-verse" style={{
              fontFamily: 'Baloo 2',
              fontSize: '1.4rem',
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
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा लोककल्याणासाठी तळपते आहे!
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
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

          {/* Cards Grid - 4 columns on desktop, compact width so images fill 100% width and height cleanly without crop */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
            marginTop: '30px'
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
                  borderRadius: '14px',
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
                {/* Image Frame - 100% width, aspect-ratio tuned so full portrait shows without crop */}
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
                  {/* Soft ambient background */}
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

                  {/* Complete Historical Portrait - 100% full visible width & height, zero crop */}
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

                  {/* Subtle Gradient Shadow at bottom for clean edge */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)',
                    zIndex: 3,
                    pointerEvents: 'none'
                  }} />
                </div>

                {/* Card Info with Badge nicely integrated below the image (Zero face overlap) */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1, background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      background: 'rgba(230,81,0,0.1)',
                      color: 'var(--maroon-900)',
                      border: '1px solid rgba(230,81,0,0.25)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.2px'
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

        {/* Timeline of Empire */}
        <section style={{ marginTop: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: 'var(--saffron-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              CHRONOLOGY OF GLORY
            </span>
            <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
              मराठा साम्राज्याचा सुवर्ण कालपट (१६३०–१८१८)
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '30px 24px', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              {timelineEvents.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    padding: '16px 20px',
                    borderRadius: '10px',
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
                    letterSpacing: '0.3px',
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

      </div>
    </div>
  );
}
