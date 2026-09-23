import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  // Interactive Hero Switcher State
  const [heroView, setHeroView] = useState('hero');

  const heroData = {
    hero: {
      tag: '🚩 मराठा वीर (Maratha Hero)',
      title: 'छत्रपती शिवाजी महाराज — हिंदवी स्वराज्य संस्थापक',
      desc: 'रयतेचे कल्याण, ३५०+ अभेद्य गडकोट, गनिमी काव्याचे जनक आणि सार्वभौम मराठा साम्राज्याची पायाभरणी करणारे युगपुरुष.',
      img: '/assets/images/real-shivaji-portrait.jpg',
      link: '/history/shivaji-maharaj'
    },
    samrajya: {
      tag: '⚔️ मराठा साम्राज्य (Maratha Samrajya)',
      title: 'अखंड मराठा साम्राज्य — अटकेपार ते कटक',
      desc: 'अटकेपासून कटकपर्यंत आणि तंजावरपासून दिल्लीच्या लाल किल्ल्यावर भगवा फडकवणारे मराठा साम्राज्याचे अथांग शौर्य.',
      img: '/assets/images/real-maratha-army-panoramic.jpg',
      link: '/history/battles'
    },
    coronation: {
      tag: '👑 राज्याभिषेक (Shivrajyabhishek 1674)',
      title: 'दुर्गराज रायगडावर सुवर्ण सिंहासनारोहण',
      desc: '६ जून १६७४ रोजी ज्येष्ठ शुद्ध त्रयोदशीला झालेला सार्वभौम हिंदवी स्वराज्याचा सुवर्ण राज्याभिषेक सोहळा.',
      img: '/assets/images/real-shivaji-dhurandhar.jpg',
      link: '/history/shivaji-maharaj'
    },
    map: {
      tag: '🗺️ गडकोट नकाशा (Forts & Geography)',
      title: 'सह्याद्रीचे ३५०+ दुर्ग व जलदुर्गांचे जाळे',
      desc: 'रायगड, राजगड, प्रतापगड, सिंधुदुर्ग, पन्हाळा ते विजयदुर्ग — सह्याद्रीच्या छातीवर कोरलेला अजिंक्य इतिहास.',
      img: '/assets/images/real-raigad-panoramic.jpg',
      link: '/forts'
    }
  };

  const activeHero = heroData[heroView] || heroData.hero;

  const stats = [
    { label: 'अभ्यासित गड-किल्ले', value: '३५०+', icon: '🏰' },
    { label: 'सक्रिय समाज बांधव', value: '५,४०,०००+', icon: '👥' },
    { label: 'मराठा व्यवसाय उद्योग', value: '२,५४०+', icon: '🏛️' },
    { label: 'अटकेपार साम्राज्य विस्तार', value: 'अखंड भगवा', icon: '🚩' }
  ];

  const pillars = [
    {
      num: '१',
      title: 'जतन करा (PRESERVE)',
      desc: 'मराठा इतिहास, ३५०+ किल्ले, आरमार, समकालीन बखरी, पत्रे, नकाशे व बलिदान मास स्मृती.',
      link: '/history',
      cta: 'इतिहास दालन →',
      icon: '⚔️',
      gradient: 'linear-gradient(135deg, #FF5500, #E65100)'
    },
    {
      num: '२',
      title: 'गौरव करा (CELEBRATE)',
      desc: 'मराठा गौरव — आधुनिक शास्त्रज्ञ, डीप टेक, डॉक्टर, ऑलिम्पिक क्रीडापटू, महिला व युवा नेतृत्व.',
      link: '/about',
      cta: 'गौरव व अचीव्हर्स →',
      icon: '🌟',
      gradient: 'linear-gradient(135deg, #E65100, #F4511E)'
    },
    {
      num: '३',
      title: 'जोडा (CONNECT)',
      desc: 'समुदाय व व्यवसाय — व्यवसाय संगम (मराठा चॅप्टर्स), व्यावसायिक, विद्यार्थी व मेन्टॉर.',
      link: '/sangam',
      cta: 'व्यवसाय संगम →',
      icon: '🤝',
      gradient: 'linear-gradient(135deg, #F4511E, #D84315)'
    },
    {
      num: '४',
      title: 'घडवा (BUILD)',
      desc: 'भविष्य व संधी — करिअर, रोजगार, स्पर्धा परीक्षा, ग्लोबल मराठा नेटवर्किंग व सामाजिक प्रकल्प.',
      link: '/jobs',
      cta: 'करिअर व संधी →',
      icon: '🚀',
      gradient: 'linear-gradient(135deg, #F4511E, #E65100)'
    }
  ];

  const royalFigures = [
    {
      name: 'छत्रपती शिवाजी महाराज',
      title: 'हिंदवी स्वराज्य संस्थापक',
      role: 'युगपुरुष · भारतीय आरमाराचे जनक',
      image: '/assets/images/real-shivaji-portrait.jpg',
      link: '/history/shivaji-maharaj'
    },
    {
      name: 'छत्रपती संभाजी महाराज',
      title: 'धर्मवीर व अजिंक्य सेनापती',
      role: '१२८ लढायांमध्ये अपराजित · संस्कृत महापंडित',
      image: '/assets/images/real-sambhaji-portrait.png',
      link: '/history/sambhaji-maharaj'
    },
    {
      name: 'राष्ट्रमाता राजमाता जिजाऊ',
      title: 'स्वराज्य प्रेरिका व युगमाता',
      role: 'संस्कार, न्यायनिवाडा व स्वराज्य संकल्पना',
      image: '/assets/images/real-jijau-portrait.jpg',
      link: '/history/rajmata-jijau'
    },
    {
      name: 'श्रीमंत थोरले बाजीराव पेशवा',
      title: 'अजिंक्य सेनापती',
      role: '४१ लढाया, ० पराभव · पालखेड रणसंग्राम',
      image: '/assets/images/real-bajirao-statue.jpg',
      link: '/history/bajirao-peshwa'
    },
    {
      name: 'महाराणी ताराबाई',
      title: 'स्वराज्य रक्षक वीरांगना',
      role: 'औरंगजेबाच्या २७ वर्षांच्या आक्रमणाला धुळीस मिळवणारी महाराणी',
      image: '/assets/images/real-tarabai-statue.jpg',
      link: '/history/tarabai'
    }
  ];

  return (
    <div className="home-page" style={{ background: '#FBF5EC', minHeight: '100vh' }}>
      
      {/* 1. Living War Cry Banner with Video */}
      <div className="war-cry-strip">
        <video 
          className="war-cry-video" 
          autoPlay 
          muted 
          loop 
          playsInline 
          poster="/assets/images/real-raigad-panoramic.jpg"
          onError={(e) => { e.target.style.display = 'none'; }}>
          <source src="/assets/videos/bhagwa-flag-waving.mp4" type="video/mp4" />
        </video>
        <div className="war-cry-overlay"></div>
        <div className="war-cry-text">
          <span>🔥</span>
          <span>|| जय भवानी, जय शिवाजी || प्रौढ प्रताप पुरंधर क्षत्रियकुलावतंस सिंहासनाधीश्वर छत्रपती शिवाजी महाराज की जय!</span>
          <span>🔥</span>
        </div>
      </div>

      {/* 2. Today on Connect Maratha Ribbon */}
      <div className="today-ribbon" style={{ background: '#C73800', color: '#FFFFFF', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="today-ribbon-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="today-pill">📅 आजचा दिवस</span>
            <span style={{ fontSize: '0.88rem' }}>
              <strong>ऐतिहासिक स्मरण:</strong> १७२८ — पालखेडच्या रणांगणात थोरले बाजीराव पेशवे यांनी निजामाला शरण येण्यास भाग पाडले.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
            <Link to="/history/bajirao-peshwa" style={{ color: '#FFE082', textDecoration: 'underline', fontWeight: 600 }}>
              ⚔️ पालखेड युद्ध इतिहास वाचा →
            </Link>
            <span>•</span>
            <Link to="/history" style={{ color: '#FFFFFF', opacity: 0.9 }}>
              सर्व ३६५ ऐतिहासिक तिथी सूची
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Cinematic Hero with Interactive Feature Card */}
      <section className="hero">
        <div className="hero-bg-layer"></div>
        <div className="hero-bg-layer"></div>
        <div className="hero-bg-layer"></div>
        <div className="hero-bg-layer"></div>
        <div className="hero-bg-layer"></div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-copy">
            <div className="eyebrow">
              <svg className="svg-flag" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2v20" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M4 3.5c2.5-1.6 4.8-1.6 7 0s4.5 1.6 7 0v9c-2.5 1.6-4.8 1.6-7 0s-4.5-1.6-7 0V3.5z" fill="#F4511E" />
              </svg>{' '}
              अस्सल ऐतिहासिक वारसा · अखंड मराठा साम्राज्य
            </div>
            <h1>
              संघटित मराठा,<br />
              <span className="gradient-text">शक्तिशाली महाराष्ट्र</span>
            </h1>
            <p className="tagline">
              छत्रपती शिवरायांच्या स्वराज्याची जाज्वल्य निष्ठा, ३५० वर्षांची अखंड शौर्यपरंपरा आणि २१ व्या शतकातील तंत्रज्ञानावर आधारित मराठा समाजाचे अधिकृत राष्ट्रीय डिजिटल व्यासपीठ.
            </p>

            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary" style={{ padding: '10px 22px' }}>
                🚩 महासंघात सहभागी व्हा
              </Link>
              <Link to="/card" className="btn-glass">
                🪪 डिजिटल स्मार्ट कार्ड
              </Link>
              <Link to="/sangam" className="btn-glass">
                💼 व्यवसाय संगम
              </Link>
              <Link to="/network" className="btn-glass">
                🗺️ ३६ जिल्हे नेटवर्क
              </Link>
            </div>

            <div className="hero-stats-grid">
              {stats.map((s, idx) => (
                <div key={idx} className="stat-glass">
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Feature Card with Switcher Chips */}
          <div className="hero-feature-card">
            <div className="card-img-wrap">
              <img 
                src={activeHero.img} 
                alt={activeHero.title} 
                onError={(e) => { e.target.src = '/assets/images/real-raigad-panoramic.jpg'; }}
              />
            </div>
            <div className="card-body">
              <span className="card-tag">{activeHero.tag}</span>
              <h4>{activeHero.title}</h4>
              <p>{activeHero.desc}</p>

              <div className="hero-switcher-chips">
                <button 
                  type="button" 
                  className={`btn ${heroView === 'hero' ? 'active' : ''}`}
                  onClick={() => setHeroView('hero')}>
                  🚩 मराठा वीर
                </button>
                <button 
                  type="button" 
                  className={`btn ${heroView === 'samrajya' ? 'active' : ''}`}
                  onClick={() => setHeroView('samrajya')}>
                  ⚔️ मराठा साम्राज्य
                </button>
                <button 
                  type="button" 
                  className={`btn ${heroView === 'coronation' ? 'active' : ''}`}
                  onClick={() => setHeroView('coronation')}>
                  👑 राज्याभिषेक
                </button>
                <button 
                  type="button" 
                  className={`btn ${heroView === 'map' ? 'active' : ''}`}
                  onClick={() => setHeroView('map')}>
                  🗺️ साम्राज्य नकाशा
                </button>
              </div>

              <Link to={activeHero.link} className="btn btn-primary" style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                सविस्तर माहिती पहा →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sacred Rajmudra Section */}
      <section style={{ maxWidth: '1400px', margin: '36px auto 0', padding: '0 24px' }}>
        <div className="rajmudra-container">
          <div className="rajmudra-seal">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="100,10 165,37 190,100 165,163 100,190 35,163 10,100 35,37" stroke="#FFE082" strokeWidth="6" fill="#BF360C"/>
              <circle cx="100" cy="100" r="75" stroke="#FFE082" strokeWidth="2.5" fill="none"/>
              <text x="100" y="86" fill="#FFF8E7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="Baloo 2">प्रतिपच्चंद्रलेखेव</text>
              <text x="100" y="104" fill="#FFF8E7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="Baloo 2">वर्धिष्णुर्विश्ववंदिता</text>
              <text x="100" y="122" fill="#FFF8E7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="Baloo 2">शाहसूनोः शिवस्यैषा</text>
              <text x="100" y="140" fill="#FFF8E7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="Baloo 2">मुद्रा भद्राय राजते</text>
            </svg>
          </div>
          <div className="rajmudra-verse">
            " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता । शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
          </div>
          <div className="rajmudra-meaning">
            प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा लोककल्याणासाठी तळपते आहे!
          </div>
        </div>
      </section>

      {/* 5. Four Primary Pillars */}
      <section style={{ maxWidth: '1400px', margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div>
            <span style={{ color: 'var(--saffron-600, #E65100)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              महासंघाचे चार मुख्य आधारस्तंभ
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: 'var(--maroon-950, #C73800)', marginTop: '4px' }}>
              Connect Maratha चे ४ आधारस्तंभ
            </h2>
          </div>
          <Link to="/about" style={{ color: 'var(--maroon-800, #E65100)', fontWeight: 700, fontSize: '0.9rem' }}>
            महासंघ कार्यप्रणाली पहा →
          </Link>
        </div>

        <div className="grid-4" style={{ marginBottom: '36px' }}>
          {pillars.map((p, idx) => (
            <div key={idx} style={{ background: p.gradient, borderRadius: '16px', padding: '24px', color: '#FFFFFF', borderTop: '4px solid #FFFFFF', boxShadow: '0 8px 24px rgba(244,81,30,0.15)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{p.icon}</div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '8px', fontWeight: 800 }}>{p.title}</h4>
              <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.55, marginBottom: '16px' }}>{p.desc}</p>
              <Link to={p.link} style={{ color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'underline' }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* 6. Spotlight Showcase Cards */}
        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="card-bg" style={{ backgroundImage: "url('/assets/images/balidan-maas-memorial.jpg')", minHeight: '300px' }}>
            <div className="card-bg-body">
              <span className="card-tag">स्मृती पर्व • ३० दिवस</span>
              <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: '6px 0' }}>बलिदान मास व ऐतिहासिक स्मृती दालन</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,248,231,0.95)', marginBottom: '14px' }}>
                स्वैच्छिक कृतज्ञता स्मरण आणि रचनात्मक समाजसेवा — रक्तदान, दुर्ग स्वच्छता, वृक्षारोपण व ३० दिवसांचे "आजची स्मृती" कॅलेंडर.
              </p>
              <Link to="/history/balidan-maas" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                बलिदान मास दालन पहा →
              </Link>
            </div>
          </div>

          <div className="card-bg" style={{ backgroundImage: "url('/assets/images/maratha-kranti-morcha.jpg')", minHeight: '300px' }}>
            <div className="card-bg-body">
              <span className="card-tag">शांतता व अनुशासन • ५८ मोर्चे</span>
              <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: '6px 0' }}>मराठा क्रांती मूक मोर्चे व चळवळी</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,248,231,0.95)', marginBottom: '14px' }}>
                ५८ शांततापूर्ण मूक मोर्चे, विद्यार्थिनींचे नेतृत्व, सत्यशोधक व आरक्षण लढा — अधिकृत ऐतिहासिक दस्तऐवजीकरण.
              </p>
              <Link to="/history/movements" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                मोर्चे व चळवळी दालन →
              </Link>
            </div>
          </div>

          <div className="card-bg" style={{ backgroundImage: "url('/assets/images/maratha-granthalaya.jpg')", minHeight: '300px' }}>
            <div className="card-bg-body">
              <span className="card-tag">ज्ञान भांडार • बखरी व मोडी</span>
              <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: '6px 0' }}>मराठा महाग्रंथालय व डिजिटल अर्काईव्ह</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,248,231,0.95)', marginBottom: '14px' }}>
                बखरी, बुधभूषणम्, आज्ञापत्र, मोडी पत्रे व नकाशे — ५-स्तरीय संपादकीय प्रमाण दर्जा (Primary Sources).
              </p>
              <Link to="/history/granthalaya" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                महाग्रंथालय उघडा →
              </Link>
            </div>
          </div>

          <div className="card-bg" style={{ backgroundImage: "url('/assets/images/modern-maratha-achievers.jpg')", minHeight: '300px' }}>
            <div className="card-bg-body">
              <span className="card-tag">आधुनिक कर्तृत्व • जागतिक मंच</span>
              <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: '6px 0' }}>आधुनिक मराठा अचिव्हर्स व डीप-टेक</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,248,231,0.95)', marginBottom: '14px' }}>
                आयटी, स्पेस सायन्स, संरक्षण, क्रीडा आणि कॉर्पोरेट क्षेत्रात भारताचा झेंडा जगभर फडकवणारे मराठा नेते.
              </p>
              <Link to="/about" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                अचिव्हर्स नामावली पहा →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Royal Portraits Strip */}
      <section style={{ maxWidth: '1400px', margin: '54px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <span style={{ color: 'var(--saffron-600, #E65100)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              शौर्य, न्याय व सुशासन
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: 'var(--maroon-950, #C73800)', marginTop: '4px' }}>
              युगपुरुष व पराक्रमी छत्रपती
            </h2>
          </div>
          <Link to="/history" style={{ color: 'var(--maroon-800, #E65100)', fontWeight: 700, fontSize: '0.9rem' }}>
            सर्व ऐतिहासिक महादालन पहा →
          </Link>
        </div>

        <div className="portrait-strip">
          {royalFigures.map((fig, idx) => (
            <Link key={idx} to={fig.link} className="portrait-card">
              <img 
                src={fig.image} 
                alt={fig.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                onError={(e) => { e.target.src = '/assets/images/real-shivaji-portrait.jpg'; }}
              />
              <div className="portrait-body">
                <span>{fig.title}</span>
                <h4>{fig.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Quick Access Grid */}
      <section style={{ maxWidth: '1400px', margin: '54px auto 0', padding: '0 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ color: 'var(--saffron-600, #E65100)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            त्वरित सेवा व दालने
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: 'var(--maroon-950, #C73800)', marginTop: '4px' }}>
            महत्त्वाचे डिजिटल विभाग
          </h2>
        </div>

        <div className="quick-grid">
          <Link to="/forts" className="quick-card" style={{ backgroundImage: "url('/assets/images/real-raigad-bastions.jpg')" }}>
            <span className="icon">🏰</span>
            <h3>३५०+ गड-किल्ले नकाशा</h3>
            <p>सह्याद्री व कोकणातील जलदुर्ग, गिरिदुर्ग व भुईकोटांचा ३६०° नकाशा.</p>
          </Link>

          <Link to="/history/navy" className="quick-card" style={{ backgroundImage: "url('/assets/images/real-sindhudurg-fort.jpg')" }}>
            <span className="icon">⚓</span>
            <h3>मराठा आरमार व सागरी किल्ले</h3>
            <p>कान्होजी आंग्रे, सिंधुदुर्ग, विजयदुर्ग व भारतीय आरमाराचा सुवर्ण इतिहास.</p>
          </Link>

          <Link to="/sangam" className="quick-card" style={{ backgroundImage: "url('/assets/images/real-maratha-army-panoramic.jpg')" }}>
            <span className="icon">💼</span>
            <h3>व्यवसाय संगम (Business Sangam)</h3>
            <p>स्थानिक मंडळे (Chapters), १-टू-१ भेटी व उद्योग संदर्भ देवाणघेवाण.</p>
          </Link>

          <Link to="/card" className="quick-card" style={{ backgroundImage: "url('/assets/images/real-sahyadri-forest.jpg')" }}>
            <span className="icon">🪪</span>
            <h3>डिजिटल सदस्य स्मार्ट कार्ड</h3>
            <p>अधिकृत QR कोड आधारित राष्ट्रीय ओळखपत्र व विशेष सदस्य लाभ.</p>
          </Link>

          <Link to="/network" className="quick-card" style={{ backgroundImage: "url('/assets/images/real-raigad-panoramic.jpg')" }}>
            <span className="icon">🗺️</span>
            <h3>महाराष्ट्र राज्य नेटवर्क</h3>
            <p>६ प्रशासकीय विभाग, ३६ जिल्हे, ३५८ तालुके व गावपातळी संघटन.</p>
          </Link>

          <Link to="/jobs" className="quick-card" style={{ backgroundImage: "url('/assets/images/real-shivaji-dhurandhar.jpg')" }}>
            <span className="icon">🎯</span>
            <h3>करिअर व रोजगार मंच</h3>
            <p>स्पर्धा परीक्षा मार्गदर्शन, उद्योग प्रशिक्षण व खाजगी नोकरी संधी.</p>
          </Link>
        </div>
      </section>

      {/* 9. Living Flag Video Banner Feature */}
      <section style={{ maxWidth: '1400px', margin: '54px auto 60px', padding: '0 24px' }}>
        <div className="living-flag-card">
          <video 
            className="living-flag-video" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="/assets/images/real-raigad-panoramic.jpg"
            onError={(e) => { e.target.style.display = 'none'; }}>
            <source src="/assets/videos/bhagwa-flag-waving.mp4" type="video/mp4" />
          </video>
          <div className="living-flag-overlay"></div>
          <div className="living-flag-copy">
            <span style={{ background: '#FFFFFF', color: '#E65100', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
              🚩 अखंड स्वराज्य, अखंड भगवा
            </span>
            <h2>शिवरायांचे आठवावे रूप, शिवरायांचा आठवावा प्रताप!</h2>
            <p>
              अखिल भारतीय मराठा महासंघाच्या अधिकृत डिजिटल महाव्यासपीठावर आपले स्वागत आहे. समाजहित, शिक्षण, रोजगार आणि स्वाभिमानासाठी सज्ज व्हा.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
                🚩 आजच सदस्य नोंदणी करा
              </Link>
              <Link to="/card" className="btn-glass">
                🪪 स्मार्ट कार्ड मिळवा
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
