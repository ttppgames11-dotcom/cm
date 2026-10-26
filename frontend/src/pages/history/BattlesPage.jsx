import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BATTLES_LIST = [
  {
    id: 'pavankhind',
    era: 'shivaji',
    image: '/assets/images/battle-action-pavankhind.jpg',
    date: '१३ जुलै १६६०',
    location: 'पावनखिंड / विशाळगड',
    title: 'पावनखिंडीची ऐतिहासिक लढाई',
    desc: 'पन्हाळगडाच्या वेढ्यातून छत्रपती शिवाजी महाराजांची विशाळगडाकडे कूच. बाजीप्रभू देशपांडे, फुलाजी प्रभू व ३०० बांदल मावळ्यांनी सिद्धी मसूदच्या ४,००० फौजेला खिंडीत तोफांचे आवाज येईपर्यंत थोपवून धरले.',
    commander: 'बाजीप्रभू देशपांडे, फुलाजी प्रभू विरुद्ध सिद्धी मसूद',
    importance: 'महाराजांचे प्राणरक्षण व स्वराज्याची अखंडता',
    reference: 'सभासद बखर, जेधे शकावली',
    link: '/forts/panhala-pavankhind',
    linkText: 'सविस्तर माहिती पहा →'
  },
  {
    id: 'purandar',
    era: 'shivaji',
    image: '/assets/images/battle-action-purandar.jpg',
    date: 'एप्रिल - जून १६६५',
    location: 'पुरंदर किल्ला',
    title: 'पुरंदरचा संग्राम व वेढा',
    desc: 'मिर्झाराजे जयसिंह व दिलेरखानाने पुरंदरला प्रचंड वेढा घातला. किल्लेदार मुरारबाजी देशपांडे यांनी मूठभर मावळ्यांसह वज्रगडावरून दिलेरखानाच्या फौजेवर केलेला अद्वितीय प्रतिहल्ला.',
    commander: 'मुरारबाजी देशपांडे विरुद्ध दिलेरखान',
    importance: 'पुरंदरच्या तहाची पार्श्वभूमी व मुत्सद्दीपणा',
    reference: 'हफ्त अंजुमन, आलमगीरनामा',
    link: '/history/warriors',
    linkText: 'मुरारबाजी चरित्र पहा →'
  },
  {
    id: 'sinhagad',
    era: 'shivaji',
    image: '/assets/images/battle-action-sinhagad.jpg',
    date: '४ फेब्रुवारी १६७०',
    location: 'सिंहगड (कोंढाणा)',
    title: 'सिंहगडची रात्रीची चढाई',
    desc: "सुभेदार तानाजी मालुसरे यांनी घोरपडीच्या साहाय्याने द्रोणागिरी कडा चढून कोंढाण्यावर केलेला हल्ला. उदयभानू राठोडशी तुंबळ युद्ध; 'गड आला पण सिंह गेला' हा अमर उद्गार.",
    commander: 'तानाजी मालुसरे, सूर्याजी मालुसरे विरुद्ध उदयभानू',
    importance: 'मुघलांकडून किल्ले परत मिळवण्याची मोहीम',
    reference: 'सभासद बखर, पोवाडे',
    link: '/history/warriors',
    linkText: 'तानाजी मालुसरे चरित्र →'
  },
  {
    id: 'palkhed',
    era: 'peshwa',
    image: '/assets/images/maratha-battles-palkhed.jpg',
    date: '२८ फेब्रुवारी १७२८',
    location: 'पालखेड, नाशिक',
    title: 'पालखेडची ऐतिहासिक लढाई',
    desc: 'थोरले बाजीराव पेशव्यांची लष्करी रणनीतीची सर्वोत्तम किमया. तोफांचा वापर न करता केवळ वेगवान हालचालींनी निजामाला पाणी नसलेल्या पालखेडच्या मैदानात कोंडले व मुंगी-पैठणचा तह करण्यास भाग पाडले.',
    commander: 'बाजीराव पेशवे I विरुद्ध निजाम-उल-मुल्क',
    importance: 'छत्रपती शाहू महाराजांचे मराठा साम्राज्यावरील अधिपत्य सिद्ध',
    reference: 'पेशवे दप्तर खंड २२, फील्ड मार्शल मॉन्टगोमरी विश्लेषण',
    link: '/history/bajirao-peshwa',
    linkText: 'बाजीराव पेशवे चरित्र →'
  },
  {
    id: 'vasai',
    era: 'peshwa',
    image: '/assets/images/battle-action-vasai.jpg',
    date: '१२ मे १७३९',
    location: 'वसई किल्ला',
    title: 'वसईची प्रसिद्ध मोहीम',
    desc: 'पोर्तुगीजांच्या अत्याचारांविरुद्ध चिमाजी अप्पांच्या नेतृत्वाखालील दोन वर्षांचा प्रदीर्घ वेढा. खाणी उडवून आणि अद्वितीय तोफखान्याचा वापर करून युरोपीय सत्तेवर मराठ्यांनी मिळवलेला भव्य विजय.',
    commander: 'चिमाजी अप्पा, मानाजी आंग्रे विरुद्ध सिल्वा आल्बुकेर्क',
    importance: 'उत्तर कोकणातून पोर्तुगीज सत्तेचा अंत',
    reference: 'मराठ्यांच्या इतिहासाची साधने (राजवाडे), पोर्तुगीज दप्तर',
    link: '/history',
    linkText: 'इतिहास दालन पहा →'
  },
  {
    id: 'panipat',
    era: 'peshwa',
    image: '/assets/images/battle-action-panipat.jpg',
    date: '१४ जानेवारी १७६१',
    location: 'पानिपत, हरियाणा',
    title: 'पानिपतची तिसरी लढाई',
    desc: 'भारताच्या सार्वभौमत्वासाठी उत्तरेत लढलेली महाभीषण लढाई. सदाशिवराव भाऊ, विश्वासराव पेशवे, मल्हारराव होळकर व इब्राहिम खान गारदी यांनी अब्दालीच्या सैन्याविरुद्ध दिलेला असीम शौर्याचा लढा.',
    commander: 'सदाशिवराव भाऊ विरुद्ध अहमद शाह अब्दाली',
    importance: 'मराठ्यांचा राष्ट्रीय बलिदानाचा इतिहास',
    reference: 'भाऊसाहेबांची बखर, काशीराज अहवाल, सर जदुनाथ सरकार',
    link: '/granthalaya',
    linkText: 'भाऊसाहेबांची बखर वाचा →'
  },
  {
    id: 'wadgaon',
    era: 'anglo',
    image: '/assets/images/battle-action-wadgaon.jpg',
    date: '१२-१३ जानेवारी १७७९',
    location: 'तळेगाव - वडगाव मावळ',
    title: 'वडगावची लढाई (पहिले इंग्रज-मराठा युद्ध)',
    desc: 'महादजी शिंदे व तुकोजी होळकर यांच्या संयुक्त फौजांनी ब्रिटिश ईस्ट इंडिया कंपनीच्या मुंबई सैन्याला तळेगाव-वडगावमध्ये कोंडीत पकडून शरणागती पत्करायला लावली. वडगावचा प्रसिद्ध तह.',
    commander: 'महादजी शिंदे, हरिपंत फडके विरुद्ध कर्नल कॉकबर्न',
    importance: 'ब्रिटिशांचा भारतात झालेला पहिला मोठा पराभव',
    reference: 'मराठ्यांच्या इतिहासाची साधने, बॉम्बे गॅझेटियर',
    link: '/forts',
    linkText: 'युद्ध नकाशा पहा →'
  }
];

export default function BattlesPage() {
  const [activeEra, setActiveEra] = useState('all');
  const [activePillar, setActivePillar] = useState(0);

  const STRATEGY_PILLARS = [
    {
      id: 'ganimi-kawa',
      icon: '⚡',
      title: 'गनिमी कावा (Guerrilla Warfare)',
      subtitle: 'आकस्मिक हल्ले व अचूक नियोजन',
      accent: '#F4511E',
      image: '/assets/images/battle-action-pavankhind.jpg',
      imageCaption: '🚩 सह्याद्रीच्या डोंगर-खिंडीत गनिमी कावा: मूठभर मावळ्यांचा अफाट फौजेवर अभेद्य गनिमी हल्ला',
      quote: '"शत्रूवर संकट कोसळण्याआधी मराठ्यांचे अस्त्र पोहोचले पाहिजे."',
      keyPoints: [
        'भौगोलिक परिस्थितीचा आणि दुर्गम डोंगराळ भागाचा रणनीतिक वापर',
        'शत्रूचा रसद व दारुगोळा पुरवठा मध्यभागीच रोखणे आणि तोडणे',
        'आकस्मिक झंझावाती हल्ला करून लगेच सुरक्षित आश्रयस्थानांत झटपट परतणे',
        'कमी सैन्यात अफाट शत्रू सैन्याला थकवून नामोहरम करण्याची अद्वितीय पद्धत'
      ]
    },
    {
      id: 'cavalry',
      icon: '🐎',
      title: 'वेगवान अश्वदल (Light Cavalry)',
      subtitle: 'झंझावाती वेग व हालचाल',
      accent: '#D84315',
      image: '/assets/images/bhavya-maratha-army.jpg',
      imageCaption: '🐎 मराठा वेगवान घोडदळ: भीमथडी तट्टांवर स्वार होऊन झंझावाती वेगाने मुसंडी मारणारे अश्वदल',
      quote: '"दिवसभरात ५०-६० मैल मजल मारणारे जगातील सर्वांत चपळ घोडदळ."',
      keyPoints: [
        'थोरले बाजीराव पेशवे व धनाजी-संताजी यांच्या काळात जागतिक ख्याती',
        'किमान ओझे, हलकी शस्त्रे (भाला व तलवार) आणि सतत गतिमानता',
        'शत्रूला सावरण्याची किंवा तोफा रोखण्याची संधी न देता चहूबाजूंनी घेरण्याची पद्धत',
        'भीमथडी तट्टांचा चपळ व खडकाळ डोंगरवाटांवर धावणारा नैसर्गिक वापर'
      ]
    },
    {
      id: 'artillery',
      icon: '💣',
      title: 'तोफखाना व दारुगोळा',
      subtitle: 'सुरूंग, बंदुका व तोफांचे तंत्रज्ञान',
      accent: '#C73800',
      image: '/assets/images/real-maratha-artillery-cannon.jpg',
      imageCaption: '💣 ऐतिहासिक मराठा तोफ व दारुगोळा तोफखाना तंत्रज्ञान',
      quote: '"पुरंदर व वसईच्या वेढ्यात मराठा तंत्रज्ञानाने युरोपीय सत्तांना अचंबित केले."',
      keyPoints: [
        'स्वदेशी कारागिरांनी ओतलेल्या तोफा व फिरते हलके तोफखाने (सुतरनाळ/जंबुरा)',
        'इब्राहिम खान गारदी यांच्या फ्रेंच धर्तीवरील प्रशिक्षित तोफखाना ब्रिगेड',
        'वसईच्या किल्ल्यात पोर्तुगीज तटबंदी भुईसपाट करणारे अचूक भुयारी सुरूंग तंत्र',
        'किल्ले व घाटांच्या संरक्षणासाठी तोफांची सामरिक मोर्चेबांधणी'
      ]
    },
    {
      id: 'navy',
      icon: '⚓',
      title: 'मराठा आरमार व सागरी वेढा',
      subtitle: 'भारतीय नौदलाचे जनकत्व',
      accent: '#1565C0',
      image: '/assets/images/navy/maratha_navy_hero.jpg',
      imageCaption: '⚓ मराठा आरमार: छत्रपती शिवाजी महाराज व कान्होजी आंग्रे यांची सागरी फळी',
      quote: '"ज्यांचे आरमार त्यांचा समुद्र — छत्रपती शिवाजी महाराज."',
      keyPoints: [
        'छत्रपती शिवाजी महाराजांनी सिंधुदुर्ग, विजयदुर्ग, पद्मदुर्ग उभारून रचलेला पाया',
        'सरखेल कान्होजी आंग्रे यांच्या नेतृत्वाखाली ब्रिटिश, डच, पोर्तुगीज आरमारावर दरारा',
        'गुराब, गलबत व पाल या चपळ जहाजांचा उथळ सागरी पाण्यात प्रभावी वापर',
        'अरबी समुद्रातील व्यापारी मार्गांवर मराठा स्वराज्याचा ५० वर्षे अखंड पहारा'
      ]
    },
    {
      id: 'forts-logistics',
      icon: '🏰',
      title: 'दुर्ग संरक्षण व रसद साखळी',
      subtitle: '३५०+ किल्ल्यांचे अभेद्य जाळे',
      accent: '#6A1B9A',
      image: '/assets/images/forts/raigad-fort.jpg',
      imageCaption: '🏰 सह्याद्रीचे दुर्गवैभव: ३५०+ गडकोटांचे अभेद्य संरक्षण जाळे व तटबंदी (किल्ले रायगड)',
      quote: '"किल्ला म्हणजे केवळ दगड-धोंडे नव्हे, तर स्वराज्याचे अभेद्य कवच."',
      keyPoints: [
        'डोंगरी, भुईकोट व जलदुर्गांचे परस्परपूरक संरक्षण जाळे',
        'प्रत्येक गडावर किमान वर्षभराचा अन्नधान्य, पाणी व दारुगोळा साठा',
        'हवालदार, सबनीस व कारखानीस अशी त्रिस्तरीय कार्यक्षम प्रशासन व्यवस्था',
        'एका गडावर संकट आले तरी शेजारील गडांवरून तत्काळ प्रतिहल्ल्याची रणनीती'
      ]
    }
  ];

  const filteredBattles = activeEra === 'all'
    ? BATTLES_LIST
    : BATTLES_LIST.filter(b => b.era === activeEra);

  return (
    <>
      {/* HERO SECTION */}
      <div className="hero" style={{ position: 'relative', minHeight: '440px', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-battles-palkhed.jpg"
          alt="मराठा युद्धे व रणव्यूह"
          className="hero-bg-img"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          className="hero-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(14, 4, 6, 0.85) 0%, rgba(14, 4, 6, 0.60) 38%, rgba(14, 4, 6, 0.25) 70%, rgba(14, 4, 6, 0.05) 100%)'
          }}
        />
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', padding: '56px 20px', color: '#fff' }}>
          <div className="eyebrow" style={{ color: '#FFD54F', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1.5px', fontWeight: 800 }}>
            लष्करी रणनीती व युद्ध इतिहास
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.15, color: '#fff', margin: '8px 0 14px', fontFamily: 'Baloo 2', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            मराठा युद्धे, लढाया व{' '}
            <span style={{ color: '#FF8A65' }}>
              रणव्यूह दालन
            </span>
          </h1>
          <div style={{ background: '#FF8A65', width: '70px', height: '3px', marginBottom: '16px' }} />
          <p style={{
            color: '#FFF8E7',
            fontSize: '1.10rem',
            fontWeight: 600,
            maxWidth: '64ch',
            lineHeight: 1.65,
            background: 'rgba(15, 3, 5, 0.42)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: '12px 18px',
            borderRadius: '8px',
            borderLeft: '4px solid #FF8A65',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)',
            margin: '0 0 8px'
          }}>
            गनिमी कावा, वेगवान अश्वदल, जलदुर्ग वेढा व डोंगररांगांमधील अजोड रणनीती • पावनखिंड ते पालखेड, वसई ते पानिपत — मराठा लष्करी इतिहासाची सत्य व संदर्भयुक्त शौर्यगाथा.
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '24px', flexWrap: 'wrap' }}>
            <a href="#battlesList" className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: 700, background: '#F4511E', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 14px rgba(244,81,30,0.4)' }}>
              ⚔️ प्रमुख लढाया पहा
            </a>
            <Link to="/forts" className="btn btn-outline" style={{ padding: '10px 22px', color: '#fff', borderColor: '#FFD54F', background: 'rgba(0,0,0,0.30)', borderRadius: '8px', fontWeight: 600 }}>
              🗺️ युद्धस्थळांचा नकाशा
            </Link>
          </div>
        </div>
      </div>

      {/* MODERN INTERACTIVE TACTICAL STRATEGY OVERVIEW */}
      <section className="section" style={{ padding: '50px 20px', background: '#F8F4EC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px' }}>
            <span style={{ background: '#F4511E', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              रणनीती व लष्करी व्यवस्था
            </span>
            <h2 style={{ fontSize: '2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2', color: '#2B1810' }}>
              मराठा लष्करी डावपेच — पाच मुख्य आधारस्तंभ
            </h2>
            <p style={{ color: '#665C54', fontSize: '0.95rem' }}>
              ऐतिहासिक साधनांवर आधारित मराठा सैन्याची अद्वितीय युद्धनीती. सविस्तर जाणून घेण्यासाठी खालील स्तंभांवर क्लिक करा:
            </p>
          </div>

          {/* 5 PILLAR TABS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {STRATEGY_PILLARS.map((p, idx) => {
              const isActive = activePillar === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePillar(idx)}
                  style={{
                    background: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                    border: isActive ? `2px solid ${p.accent}` : '1px solid rgba(0, 0, 0, 0.08)',
                    borderTop: `4px solid ${p.accent}`,
                    borderRadius: '12px',
                    padding: '14px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 8px 20px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isActive ? p.accent : '#2B1810', lineHeight: 1.3 }}>
                    {p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#776E65', marginTop: '3px' }}>
                    {p.subtitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTIVE PILLAR HERO SHOWCASE */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: `1.5px solid ${STRATEGY_PILLARS[activePillar].accent}33`,
              boxShadow: '0 10px 30px rgba(43, 24, 16, 0.08)',
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Details & Key Points */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '2.2rem', background: '#FFF3E0', padding: '8px 12px', borderRadius: '12px' }}>
                  {STRATEGY_PILLARS[activePillar].icon}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.45rem', margin: 0, color: '#2B1810', fontFamily: 'Baloo 2' }}>
                    {STRATEGY_PILLARS[activePillar].title}
                  </h3>
                  <span style={{ color: STRATEGY_PILLARS[activePillar].accent, fontWeight: 700, fontSize: '0.85rem' }}>
                    {STRATEGY_PILLARS[activePillar].subtitle}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontStyle: 'italic',
                  color: '#665C54',
                  borderLeft: `3px solid ${STRATEGY_PILLARS[activePillar].accent}`,
                  paddingLeft: '14px',
                  margin: '14px 0 16px',
                  fontSize: '0.94rem',
                  lineHeight: 1.5
                }}
              >
                {STRATEGY_PILLARS[activePillar].quote}
              </p>

              <div style={{ background: '#FAF7F2', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', color: '#2B1810', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  लष्करी वैशिष्ट्ये व सामर्थ्य:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#4A3B32', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {STRATEGY_PILLARS[activePillar].keyPoints.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '5px' }}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Uncropped Authentic Image Display */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{
                width: '100%',
                height: '280px',
                background: 'linear-gradient(135deg, #1C0A04 0%, #2D1408 50%, #150602 100%)',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1.5px solid rgba(0,0,0,0.12)',
                boxShadow: '0 8px 24px rgba(43, 24, 16, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img
                  src={STRATEGY_PILLARS[activePillar].image}
                  alt={STRATEGY_PILLARS[activePillar].title}
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    padding: '8px',
                    display: 'block'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#FED7AA',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(254, 215, 170, 0.25)'
                }}>
                  📜 अस्सल ऐतिहासिक संदर्भ
                </span>
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '0.82rem',
                color: '#78350F',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.4
              }}>
                {STRATEGY_PILLARS[activePillar].imageCaption}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BATTLES LIST SECTION */}
      <section className="section" id="battlesList" style={{ padding: '48px 20px', background: '#FAF7F2' }}>
        <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ background: '#C73800', color: '#fff', padding: '3px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700 }}>
                ऐतिहासिक लढायांचा विस्तृत संग्रह
              </span>
              <h2 style={{ fontSize: '1.9rem', margin: '6px 0 0', fontFamily: 'Baloo 2', color: '#2B1810' }}>
                ७ ऐतिहासिक निर्णायक लढाया
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  borderRadius: '20px',
                  border: activeEra === 'all' ? '1.5px solid #C73800' : '1px solid #D7CCC8',
                  background: activeEra === 'all' ? '#C73800' : '#FFFFFF',
                  color: activeEra === 'all' ? '#FFFFFF' : '#4E342E',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setActiveEra('all')}
              >
                सर्व लढाया
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  borderRadius: '20px',
                  border: activeEra === 'shivaji' ? '1.5px solid #C73800' : '1px solid #D7CCC8',
                  background: activeEra === 'shivaji' ? '#C73800' : '#FFFFFF',
                  color: activeEra === 'shivaji' ? '#FFFFFF' : '#4E342E',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setActiveEra('shivaji')}
              >
                शिवकाल (१६४५-१६८०)
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  borderRadius: '20px',
                  border: activeEra === 'peshwa' ? '1.5px solid #C73800' : '1px solid #D7CCC8',
                  background: activeEra === 'peshwa' ? '#C73800' : '#FFFFFF',
                  color: activeEra === 'peshwa' ? '#FFFFFF' : '#4E342E',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setActiveEra('peshwa')}
              >
                पेशवे काल (१७०७-१७६१)
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  borderRadius: '20px',
                  border: activeEra === 'anglo' ? '1.5px solid #C73800' : '1px solid #D7CCC8',
                  background: activeEra === 'anglo' ? '#C73800' : '#FFFFFF',
                  color: activeEra === 'anglo' ? '#FFFFFF' : '#4E342E',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setActiveEra('anglo')}
              >
                ब्रिटिश संघर्ष (१७७५-१८१८)
              </button>
            </div>
          </div>

          {/* COMPACT BATTLE CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
            {filteredBattles.map((b) => (
              <div
                key={b.id}
                data-era={b.era}
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(43, 24, 16, 0.12)',
                  boxShadow: '0 4px 14px rgba(43, 24, 16, 0.06)',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* COMPACT 16:9 BATTLE ACTION IMAGE */}
                <div style={{ position: 'relative', width: '100%', height: '175px', overflow: 'hidden', background: '#1c0d12' }}>
                  <img
                    src={b.image}
                    alt={b.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      right: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 2
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(20, 4, 6, 0.85)',
                        color: '#FFE082',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        border: '1px solid rgba(255, 213, 79, 0.4)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {b.date}
                    </span>
                    <span
                      style={{
                        background: 'rgba(20, 4, 6, 0.85)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        margin: 0,
                        padding: '3px 8px',
                        borderRadius: '5px',
                        border: '1px solid rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {b.location}
                    </span>
                  </div>
                </div>

                {/* COMPACT BATTLE TITLE */}
                <div style={{ background: '#C73800', color: '#FFFFFF', padding: '10px 14px', borderBottom: '2px solid #E65100' }}>
                  <h3 style={{ fontSize: '1.12rem', margin: 0, color: '#FFFFFF', fontFamily: 'Baloo 2', lineHeight: 1.25, fontWeight: 700 }}>
                    {b.title}
                  </h3>
                </div>

                {/* COMPACT TIGHT BATTLE CONTENT */}
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.84rem', color: '#3E2723', margin: '0 0 10px 0', lineHeight: 1.48 }}>
                      {b.desc}
                    </p>
                    <div style={{ fontSize: '0.78rem', background: '#F5EBE1', padding: '9px 11px', borderRadius: '8px', margin: '0 0 12px 0', lineHeight: 1.45, border: '1px solid rgba(199, 56, 0, 0.12)' }}>
                      <div style={{ color: '#2B1810' }}><strong>सेनापती:</strong> {b.commander}</div>
                      <div style={{ marginTop: '3px', color: '#2B1810' }}><strong>महत्त्व:</strong> {b.importance}</div>
                      <div style={{ marginTop: '3px', color: '#5D4037' }}><strong>संदर्भ:</strong> {b.reference}</div>
                    </div>
                  </div>
                  <Link
                    to={b.link}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      color: '#C73800',
                      border: '1.5px solid #C73800',
                      background: '#FFFFFF',
                      textDecoration: 'none',
                      transition: 'background 0.2s ease, color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#C73800';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.color = '#C73800';
                    }}
                  >
                    {b.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

