import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const heroViews = {
  hero: {
    badge: '🚩 मराठा वीर (Maratha Hero)',
    title: 'छत्रपती शिवाजी महाराज — हिंदवी स्वराज्य संस्थापक',
    desc: 'रयतेचे कल्याण, ३५०+ अभेद्य गडकोट, गनिमी काव्याचे जनक आणि सार्वभौम मराठा साम्राज्याची पायाभरणी करणारे युगपुरुष.',
    link: '/history/shivaji-maharaj',
    img: '/assets/images/real-shivaji-portrait.jpg'
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
    img: '/assets/images/real-maratha-peak-map.jpg'
  }
};

const heroBgSlides = [
  { img: '/assets/images/real-raigad-panoramic.jpg', title: 'दुर्गराज रायगड', desc: 'शिवराज्याभिषेक राजधानी व अखंड मराठा साम्राज्याचे अधिष्ठान' },
  { img: '/assets/images/maratha-samrajya.jpg', title: 'अखंड मराठा साम्राज्य सेना', desc: '१८ व्या शतकातील मराठा घोडदळ व पायदळाचे अस्सल ऐतिहासिक भित्तीचित्र' },
  { img: '/assets/images/real-pratapgad-fort.jpg', title: 'शिवप्रताप रणभूमी — प्रतापगड', desc: 'अफझलखान वध आणि स्वराज्याचा ऐतिहासिक विजय' },
  { img: '/assets/images/real-maratha-army-panoramic.jpg', title: 'मराठा दिग्विजय सैन्य', desc: 'अटकेपासून कटकपर्यंत भगवा फडकावणारे शूर योद्धे' },
  { img: '/assets/images/real-sindhudurg-fort.jpg', title: 'मराठा आरमार — सिंधुदुर्ग', desc: 'छत्रपती शिवरायांनी स्थापन केलेले भारतीय आरमाराचे जनकत्व' },
  { img: '/assets/images/real-sinhagad-fort.jpg', title: 'सिंहगड — तानाजी मालुसरे शौर्यपीठ', desc: 'गढ आला पण सिंह गेला — अद्वितीय बलिदान स्थळ' },
  { img: '/assets/images/real-raigad-bastions.jpg', title: 'रायगड अभेद्य तटबंदी', desc: 'टकमक टोक व सह्याद्रीच्या दुर्गम कड्यांवरील ऐतिहासिक बुरुज' },
  { img: '/assets/images/real-panhala-fort.jpg', title: 'किल्ले पन्हाळा व पावनखिंड', desc: 'नरवीर बाजीप्रभू देशपांडे यांचे अतुलनीय शौर्य' },
  { img: '/assets/images/real-shaniwar-wada.jpg', title: 'शनिवार वाडा — पेशवे सत्ताकेंद्र', desc: 'मराठा साम्राज्याचा विस्तार करणारा ऐतिहासिक वास्तू वारसा' },
  { img: '/assets/images/real-raigad-mahadarwaja.jpg', title: 'रायगड महादरवाजा', desc: 'दुर्गराज रायगडाचे भव्य ऐतिहासिक प्रवेशद्वार' },
  { img: '/assets/images/real-maratha-court-1792.jpg', title: 'मराठा महादरबार (१७९२)', desc: 'सवाई माधवराव, नाना फडणवीस व महादजी शिंदे यांचा राजदरबार' }
];

export default function HomePage() {
  const [heroView, setHeroView] = useState('hero');
  const [ecoTab, setEcoTab] = useState('tab-history');
  const [ecoQuery, setEcoQuery] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeHero = heroViews[heroView];

  // Continuously cycle hero background every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroBgSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Ensure all reveal elements and countup stats are activated on mount
  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    targets.forEach(el => el.classList.add('is-visible'));

    const counters = document.querySelectorAll('[data-countup]');
    counters.forEach(counter => {
      const targetVal = parseInt(counter.getAttribute('data-countup'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      if (!targetVal) return;
      counter.textContent = targetVal.toLocaleString('mr-IN') + suffix;
    });
  }, []);

  // Dynamic filter for ecosystem directory cards
  useEffect(() => {
    const pane = document.getElementById(ecoTab);
    if (!pane) return;
    const cards = pane.querySelectorAll('.eco-card');
    const q = ecoQuery.toLowerCase().trim();
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }, [ecoTab, ecoQuery]);

  return (
    <div className="home-page-root">
{/* ========== WAR CRY (living bhagwa flag video banner) ========== */}
<div className="war-cry-strip" style={{"position":"relative","overflow":"hidden","minHeight":"76px","display":"flex","justifyContent":"center","alignItems":"center","background":"linear-gradient(90deg,#F4511E,#E65100)","color":"#FFFFFF"}}>
  <video className="war-cry-video" style={{"position":"absolute","top":0,"left":0,"width":"100%","height":"100%","objectFit":"cover","zIndex":0,"pointerEvents":"none","filter":"saturate(1.25) brightness(.92)"}} autoPlay muted loop playsInline aria-hidden="true" poster="/assets/images/real-raigad-panoramic.jpg">
    <source src="/assets/videos/bhagwa-flag-waving.mp4" type="video/mp4" />
  </video>
  <div className="war-cry-overlay" style={{"position":"absolute","inset":0,"zIndex":1,"background":"linear-gradient(90deg,rgba(199,56,0,.88) 0%,rgba(230,81,0,.58) 50%,rgba(199,56,0,.88) 100%)"}}></div>
  <div className="war-cry-text">
    <span>🔥</span>
    <span>|| जय भवानी, जय शिवाजी || प्रौढ प्रताप पुरंधर क्षत्रियकुलावतंस सिंहासनाधीश्वर छत्रपती शिवाजी महाराज की जय!</span>
    <span>🔥</span>
  </div>
</div>

{/* ========== TODAY ON CONNECT MARATHA (Master Plan Section 8) ========== */}
<div className="today-ribbon">
  <div className="today-ribbon-inner">
    <div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}>
      <span className="today-pill">📅 आजचा दिवस</span>
      <span><strong>ऐतिहासिक स्मरण:</strong> १७२८ — पालखेडच्या रणांगणात थोरले बाजीराव पेशवे यांनी निजामाला शरण येण्यास भाग पाडले.</span>
    </div>
    <div style={{"display":"flex","alignItems":"center","gap":"14px","fontSize":"0.84rem"}}>
      <Link to="/history/battles" style={{"color":"#FFE082","textDecoration":"underline","fontWeight":"700"}}>⚔️ पालखेड युद्ध इतिहास वाचा →</Link>
      <span style={{"color":"rgba(255,255,255,0.6)"}}>•</span>
      <Link to="/history" style={{"color":"#FFFFFF","opacity":"0.95","textDecoration":"none"}}>सर्व ३६५ तिथी सूची</Link>
    </div>
  </div>
</div>

{/* ========== HERO SECTION (DYNAMIC CONTINUOUSLY CHANGING BACKGROUND) ========== */}
<section 
  className="hero"
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
  style={{ position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
  
  {/* Dynamic Multi-image Background Slider from assets */}
  {heroBgSlides.map((slide, idx) => (
    <div
      key={slide.img}
      aria-hidden={idx !== bgIndex}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${slide.img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: idx === bgIndex ? 1 : 0,
        transform: idx === bgIndex ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 1.4s ease-in-out, transform 8s ease-out',
        zIndex: 0,
        filter: 'brightness(0.85) contrast(1.10)'
      }}
    />
  ))}

  {/* Ambient Shadow & Saffron Vignette Overlay */}
  <div 
    className="hero-overlay" 
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(199,56,0,0.45) 45%, rgba(18,4,5,0.92) 100%)'
    }}
  />

  <div className="hero-content" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
    <div className="hero-copy" data-reveal="left">
      <div className="eyebrow"><svg className="svg-flag" viewBox="0 0 24 24" fill="none"><path d="M4 2v20" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round"/><path d="M4 3.5c2.5-1.6 4.8-1.6 7 0s4.5 1.6 7 0v9c-2.5 1.6-4.8 1.6-7 0s-4.5-1.6-7 0V3.5z" fill="#F4511E"/></svg> अस्सल ऐतिहासिक वारसा · अखंड मराठा साम्राज्य</div>
      <h1>संघटित मराठा,<br /><span className="gradient-text">शक्तिशाली महाराष्ट्र</span></h1>
      <p className="tagline">
        छत्रपती शिवरायांच्या स्वराज्याची जाज्वल्य निष्ठा, ३५० वर्षांची अखंड शौर्यपरंपरा आणि २१ व्या शतकातील तंत्रज्ञानावर आधारित मराठा समाजाचे राष्ट्रीय डिजिटल व्यासपीठ.
      </p>
      <div className="hero-ctas">
        <Link to="/register" className="btn btn-primary">🚩 व्यासपीठावर सहभागी व्हा</Link>
        <Link to="/login" className="btn-glass">👤 Demo लॉगिन</Link>
        <Link to="/business/directory" className="btn-glass">🔎 सर्वत्र शोध</Link>
        <Link to="/governance" className="btn-glass">🧭 Product Blueprint</Link>
      </div>
      <div className="hero-stats-grid">
        <div className="stat-glass"><b data-countup="350" data-suffix="+">0</b><span>अभ्यासित गड-किल्ले</span></div>
        <div className="stat-glass"><b data-countup="25420" data-suffix="+">0</b><span>सक्रिय बांधव</span></div>
        <div className="stat-glass"><b data-countup="2540" data-suffix="+">0</b><span>मराठा उद्योग</span></div>
        <div className="stat-glass"><b>अटकेपार</b><span>विस्तारित भगवा ध्वज</span></div>
      </div>
    </div>
    <div className="hero-feature-card" data-reveal="right">
      <div className="card-img-wrap">
        <img src={activeHero.img} alt={activeHero.title} id="heroCardImg" />
      </div>
      <div className="card-body">
        <span className="card-tag" id="heroBadge">{activeHero.badge}</span>
        <h4 id="heroCardTitle">{activeHero.title}</h4>
        <p id="heroCardDesc">{activeHero.desc}</p>
        <div className="hero-switcher-chips">
          <button type="button" className={`btn ${heroView === 'hero' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setHeroView('hero')}>🚩 मराठा वीर</button>
          <button type="button" className={`btn ${heroView === 'samrajya' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setHeroView('samrajya')}>⚔️ मराठा साम्राज्य</button>
          <button type="button" className={`btn ${heroView === 'coronation' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setHeroView('coronation')}>👑 राज्याभिषेक</button>
          <button type="button" className={`btn ${heroView === 'map' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setHeroView('map')}>🗺️ साम्राज्य नकाशा</button>
        </div>
        <Link to={activeHero.link} className="btn btn-primary" id="heroCardLink" style={{ marginTop: '8px', fontSize: '.8rem' }}>
          सविस्तर चरित्र वाचा →
        </Link>
      </div>
    </div>
  </div>

  {/* Active Slide Badge & Controller Navigation */}
  <div 
    style={{
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(20,5,5,0.78)',
      backdropFilter: 'blur(8px)',
      padding: '7px 18px',
      borderRadius: '30px',
      border: '1px solid rgba(255,204,128,0.4)',
      color: '#FFFFFF',
      fontSize: '0.80rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap'
    }}>
    <button 
      type="button" 
      onClick={() => setBgIndex((prev) => (prev - 1 + heroBgSlides.length) % heroBgSlides.length)}
      style={{ background: 'none', border: 'none', color: '#FFE082', cursor: 'pointer', fontSize: '1rem', fontWeight: '800', padding: '0 4px' }}
      title="मागील पार्श्वभूमी छायाचित्र">
      ◀
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ color: '#FFE082', fontWeight: '800' }}>📷 {heroBgSlides[bgIndex].title}</span>
      <span style={{ opacity: 0.6 }}>•</span>
      <span style={{ opacity: 0.9 }}>{bgIndex + 1}/{heroBgSlides.length}</span>
    </div>
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {heroBgSlides.map((_, i) => (
        <span
          key={i}
          onClick={() => setBgIndex(i)}
          style={{
            width: i === bgIndex ? '16px' : '6px',
            height: '6px',
            borderRadius: '4px',
            background: i === bgIndex ? '#FF5500' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title={heroBgSlides[i].title}
        />
      ))}
    </div>
    <button 
      type="button" 
      onClick={() => setBgIndex((prev) => (prev + 1) % heroBgSlides.length)}
      style={{ background: 'none', border: 'none', color: '#FFE082', cursor: 'pointer', fontSize: '1rem', fontWeight: '800', padding: '0 4px' }}
      title="पुढील पार्श्वभूमी छायाचित्र">
      ▶
    </button>
  </div>
</section>

{/* ========== FOUR PRIMARY PILLARS (Section 2 of Master Blueprint) ========== */}
<section className="section" style={{"background":"#FFFFFF","padding":"54px 0"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">Section 2 • Four Primary Pillars</span>
        <h2>Connect Maratha चे ४ आधारस्तंभ</h2>
      </div>
      <Link to="/governance" className="more-link">मास्टर ब्लूप्रिंट पहा →</Link>
    </div>
    <div className="grid-4" style={{"marginBottom":"40px"}} data-reveal-group>
      <div style={{"background":"linear-gradient(135deg, #FF5500, #E65100)","borderRadius":"16px","padding":"24px","color":"#FFFFFF","borderTop":"4px solid #FFFFFF"}}>
        <div style={{"fontSize":"2rem","marginBottom":"8px"}}>⚔️</div>
        <h4 style={{"color":"#FFFFFF","fontSize":"1.15rem","marginBottom":"6px"}}>१. जतन करा (PRESERVE)</h4>
        <p style={{"fontSize":"0.84rem","color":"rgba(255,255,255,0.92)","lineHeight":"1.55","marginBottom":"12px"}}>मराठा इतिहास, ३५०+ किल्ले, आरमार, समकालीन बखरी, पत्रे, नकाशे व बलिदान मास स्मृती.</p>
        <Link to="/history" style={{"color":"#FFFFFF","fontSize":"0.82rem","fontWeight":"700"}}>इतिहास दालन →</Link>
      </div>
      <div style={{"background":"linear-gradient(135deg, #E65100, #F4511E)","borderRadius":"16px","padding":"24px","color":"#FFFFFF","borderTop":"4px solid #FFFFFF"}}>
        <div style={{"fontSize":"2rem","marginBottom":"8px"}}>🌟</div>
        <h4 style={{"color":"#FFFFFF","fontSize":"1.15rem","marginBottom":"6px"}}>२. गौरव करा (CELEBRATE)</h4>
        <p style={{"fontSize":"0.84rem","color":"rgba(255,255,255,0.92)","lineHeight":"1.55","marginBottom":"12px"}}>मराठा गौरव — आधुनिक शास्त्रज्ञ, डीप टेक, डॉक्टर, ऑलिम्पिक क्रीडापटू, महिला व युवा नेतृत्व.</p>
        <Link to="/about" style={{"color":"#FFFFFF","fontSize":"0.82rem","fontWeight":"700"}}>गौरव व अचीव्हर्स →</Link>
      </div>
      <div style={{"background":"linear-gradient(135deg, #F4511E, #D84315)","borderRadius":"16px","padding":"24px","color":"#FFFFFF","borderTop":"4px solid #FFFFFF"}}>
        <div style={{"fontSize":"2rem","marginBottom":"8px"}}>🤝</div>
        <h4 style={{"color":"#FFFFFF","fontSize":"1.15rem","marginBottom":"6px"}}>३. जोडा (CONNECT)</h4>
        <p style={{"fontSize":"0.84rem","color":"rgba(255,255,255,0.92)","lineHeight":"1.55","marginBottom":"12px"}}>समुदाय व व्यवसाय — व्यवसाय संगम (BNI-शैली मराठा चॅप्टर्स), व्यावसायिक, विद्यार्थी व मेन्टॉर.</p>
        <Link to="/sangam" style={{"color":"#FFFFFF","fontSize":"0.82rem","fontWeight":"700"}}>व्यवसाय संगम →</Link>
      </div>
      <div style={{"background":"linear-gradient(135deg, #F4511E, #E65100)","borderRadius":"16px","padding":"24px","color":"#FFFFFF","borderTop":"4px solid #FFFFFF"}}>
        <div style={{"fontSize":"2rem","marginBottom":"8px"}}>🚀</div>
        <h4 style={{"color":"#FFFFFF","fontSize":"1.15rem","marginBottom":"6px"}}>४. घडवा (BUILD)</h4>
        <p style={{"fontSize":"0.84rem","color":"rgba(255,255,255,0.92)","lineHeight":"1.55","marginBottom":"12px"}}>भविष्य व संधी — करिअर, रोजगार, स्पर्धा परीक्षा, ग्लोबल मराठा नेटवर्किंग व सामाजिक प्रकल्प.</p>
        <Link to="/jobs" style={{"color":"#FFFFFF","fontSize":"0.82rem","fontWeight":"700"}}>करिअर व संधी →</Link>
      </div>
    </div>

    {/* Master Blueprint Spotlight Showcase Cards */}
    <div className="grid-2" style={{"gap":"24px"}} data-reveal-group>
      {/* Balidan Maas Card */}
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/balidan-maas-memorial.jpg')","minHeight":"300px"}}>
        <div className="card-bg-body">
          <span className="card-tag">Section 7 & 8 • स्मृती पर्व</span>
          <h3 style={{"fontSize":"1.4rem","color":"#FFFFFF","margin":"6px 0"}}>बलिदान मास व ऐतिहासिक स्मृती दालन</h3>
          <p style={{"fontSize":"0.88rem","color":"rgba(255,248,231,0.95)","marginBottom":"12px"}}>
            सक्तीचे धार्मिक कर्मकांड नसून स्वैच्छिक कृतज्ञता स्मरण आणि रचनात्मक समाजसेवा — रक्तदान, दुर्ग स्वच्छता, वृक्षारोपण व ३० दिवसांचे "आजची स्मृती" कॅलेंडर.
          </p>
          <Link to="/history" className="btn btn-primary" style={{"fontSize":"0.8rem","padding":"6px 14px"}}>बलिदान मास दालन पहा →</Link>
        </div>
      </div>

      {/* Morchas and Movements Card */}
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/maratha-kranti-morcha.jpg')","minHeight":"300px"}}>
        <div className="card-bg-body">
          <span className="card-tag">Section 9, 10 & 11 • मूक मोर्चे</span>
          <h3 style={{"fontSize":"1.4rem","color":"#FFFFFF","margin":"6px 0"}}>मराठा क्रांती मूक मोर्चे व ऐतिहासिक चळवळी</h3>
          <p style={{"fontSize":"0.88rem","color":"rgba(255,248,231,0.95)","marginBottom":"12px"}}>
            ५८ शांततापूर्ण मूक मोर्चे, विद्यार्थिनींचे नेतृत्व, सत्यशोधक व आरक्षण लढा — वस्तुनिष्ठ ऐतिहासिक दस्तऐवजीकरण.
          </p>
          <Link to="/history" className="btn btn-primary" style={{"fontSize":"0.8rem","padding":"6px 14px"}}>मोर्चे व चळवळी दालन →</Link>
        </div>
      </div>

      {/* Granthalaya Card */}
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/maratha-granthalaya.jpg')","minHeight":"300px"}}>
        <div className="card-bg-body">
          <span className="card-tag">Section 13, 14, 15 & 47 • ज्ञान भांडार</span>
          <h3 style={{"fontSize":"1.4rem","color":"#FFFFFF","margin":"6px 0"}}>मराठा महाग्रंथालय व डिजिटल अर्काईव्ह</h3>
          <p style={{"fontSize":"0.88rem","color":"rgba(255,248,231,0.95)","marginBottom":"12px"}}>
            बखरी, बुधभूषणम्, आज्ञापत्र, मोडी पत्रे व नकाशे — ५-स्तरीय संपादकीय प्रमाण दर्जा (Level 1 Primary ते Level 5 Oral).
          </p>
          <Link to="/history" className="btn btn-primary" style={{"fontSize":"0.8rem","padding":"6px 14px"}}>महाग्रंथालय उघडा →</Link>
        </div>
      </div>

      {/* Modern Achievers Card */}
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/modern-maratha-achievers.jpg')","minHeight":"300px"}}>
        <div className="card-bg-body">
          <span className="card-tag">Section 16, 17 & 25 • अचीव्हर्स</span>
          <h3 style={{"fontSize":"1.4rem","color":"#FFFFFF","margin":"6px 0"}}>मराठा गौरव, हॉल ऑफ फेम व ग्लोबल मराठा</h3>
          <p style={{"fontSize":"0.88rem","color":"rgba(255,248,231,0.95)","marginBottom":"12px"}}>
            डीप टेक, अंतराळ, संरक्षण, उद्योग, महिला व युवा नेतृत्वाची राष्ट्रीय व जागतिक निर्देशिका.
          </p>
          <Link to="/about" className="btn btn-primary" style={{"fontSize":"0.8rem","padding":"6px 14px"}}>अचीव्हर्स निर्देशिका →</Link>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ========== PORTRAIT STRIP ========== */}
<section className="section">
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">🖼️ अस्सल तैलचित्रे व पुतळे</span>
        <h2>अजरामर व्यक्तिरेखा (Legendary Portraits)</h2>
      </div>
    </div>
    <div className="portrait-strip" data-reveal-group>
      <div className="portrait-card" style={{"backgroundImage":"url('/assets/images/real-shivaji-raigad-statue.jpg')"}}>
        <div className="portrait-body"><h4>छत्रपती शिवाजी महाराज</h4><span>हिंदवी स्वराज्य संस्थापक</span></div>
      </div>
      <div className="portrait-card" style={{"backgroundImage":"url('/assets/images/real-sambhaji-portrait.png')"}}>
        <div className="portrait-body"><h4>छत्रपती संभाजी महाराज</h4><span>अपराजित धर्मवीर</span></div>
      </div>
      <div className="portrait-card" style={{"backgroundImage":"url('/assets/images/real-bajirao-statue.jpg')"}}>
        <div className="portrait-body"><h4>श्रीमंत बाजीराव पेशवे</h4><span>अपराजित सेनापती</span></div>
      </div>
      <div className="portrait-card" style={{"backgroundImage":"url('/assets/images/real-maratha-confederacy-map.png')"}}>
        <div className="portrait-body"><h4>मराठा साम्राज्य विस्तार</h4><span>अटकेपार पसरलेले साम्राज्य</span></div>
      </div>
      <div className="portrait-card" style={{"backgroundImage":"url('/assets/images/real-raigad-mahadarwaja.jpg')"}}>
        <div className="portrait-body"><h4>दुर्गराज रायगड</h4><span>स्वराज्याची राजधानी</span></div>
      </div>
    </div>
  </div>
</section>

{/* ========== TODAY IN HISTORY ========== */}
<div style={{"background":"linear-gradient(90deg,var(--maroon-900),var(--maroon-800))","color":"var(--paper)","padding":"16px 0"}}>
  <div className="container" style={{"display":"flex","justifyContent":"space-between","alignItems":"center","flexWrap":"wrap","gap":"12px"}}>
    <span style={{"background":"var(--gold-500)","color":"var(--maroon-950)","padding":"4px 12px","borderRadius":"20px","fontWeight":"700","fontSize":".8rem"}}>आजचा इतिहास</span>
    <span style={{"fontSize":".9rem"}}>६ जून १६७४ — दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचा वैदिक सुवर्ण राज्याभिषेक संपन्न झाला व 'शिवराज्याभिषेक शक' सुरू झाले.</span>
    <Link to="/history" style={{"color":"var(--gold-400)","fontWeight":"700"}}>पूर्ण दिनदर्शिका पहा (आज, आठवडा, महिना) →</Link>
  </div>
</div>

{/* ========== QUICK ACCESS ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">जलद प्रवेश</span>
        <h2>तुमच्यासाठी महत्त्वाचे विभाग</h2>
      </div>
      <Link to="/gallery" className="more-link">सर्व विभाग पहा →</Link>
    </div>
    <div className="quick-grid" data-reveal-group>
      <Link to="/history" className="quick-card" style={{"backgroundImage":"url('/assets/images/real-maratha-army-panoramic.jpg')"}}>
        <span className="icon">⚔️</span>
        <h3>इतिहास</h3>
        <p>साम्राज्य, लढाया, कालपट आणि अस्सल संदर्भ.</p>
      </Link>
      <Link to="/forts" className="quick-card" style={{"backgroundImage":"url('/assets/images/real-raigad-panoramic.jpg')"}}>
        <span className="icon">🏰</span>
        <h3>गड-किल्ले</h3>
        <p>३५०+ किल्ल्यांचे दालन, माहिती आणि नकाशा.</p>
      </Link>
      <Link to="/jobs" className="quick-card" style={{"backgroundImage":"url('/assets/images/real-maratha-arms.jpg')"}}>
        <span className="icon">🛠️</span>
        <h3>सेवा</h3>
        <p>समाजातील विश्वासू सेवा व तज्ज्ञ नेटवर्क.</p>
      </Link>
      <Link to="/directory" className="quick-card" style={{"backgroundImage":"url('/assets/images/real-sambhaji-photo.jpg')"}}>
        <span className="icon">👥</span>
        <h3>समुदाय</h3>
        <p>बांधव, नेटवर्किंग आणि सामाजिक जोडणी.</p>
      </Link>
      <Link to="/sangam" className="quick-card" style={{"backgroundImage":"url('/assets/images/real-shaniwar-wada.jpg')"}}>
        <span className="icon">🤝</span>
        <h3>व्यवसाय संगम</h3>
        <p>व्यवसाय मंडळे, संधी, भेटी आणि विश्वासाधारित नेटवर्क.</p>
      </Link>
      <Link to="/business/directory" className="quick-card" style={{"backgroundImage":"url('/assets/images/real-maratha-expansion-map.jpg')"}}>
        <span className="icon">🔎</span>
        <h3>सर्वत्र शोध</h3>
        <p>सदस्य, व्यवसाय, मंडळे, कार्यक्रम आणि मोहिमा शोधा.</p>
      </Link>
    </div>
  </div>
</section>

{/* ========== RAJMUDRA ========== */}
<section className="section" style={{"background":"#FBF5EC"}}>
  <div className="container">
    <div className="rajmudra-container" data-reveal="zoom">
      <div className="rajmudra-seal">
        <svg viewBox="0 0 200 200">
          <polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill="#C73800" stroke="#FFFFFF" strokeWidth="6"/>
          <polygon points="63,18 137,18 182,63 182,137 137,182 63,182 18,137 18,63" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4,2"/>
          <text x="100" y="55" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">प्रतिपच्चंद्रलेखेव</text>
          <text x="100" y="80" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">वर्धिष्णुर्विश्ववंदिता</text>
          <text x="100" y="105" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">शाहसूनोः शिवस्यैषा</text>
          <text x="100" y="130" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">मुद्रा भद्राय</text>
          <text x="100" y="155" fontFamily="'Baloo 2',sans-serif" fontSize="14" fontWeight="800" fill="#FFFFFF" textAnchor="middle">राजते ॥</text>
        </svg>
      </div>
      <div className="rajmudra-verse">" प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।<br />शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "</div>
      <div className="rajmudra-meaning">प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा केवळ आणि केवळ प्रजेच्या कल्याणासाठी तळपते आहे!</div>
    </div>
  </div>
</section>

{/* ========== LIVING BHAGWA FLAG (VIDEO FEATURE) ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="living-flag-card" data-reveal="zoom" style={{"position":"relative","borderRadius":"24px","overflow":"hidden","minHeight":"380px","display":"flex","alignItems":"center","border":"2px solid #FFFFFF","boxShadow":"0 12px 32px rgba(244,81,30,.2)"}}>
      <video className="living-flag-video" style={{"position":"absolute","inset":0,"width":"100%","height":"100%","objectFit":"cover","zIndex":0}} autoPlay muted loop playsInline aria-hidden="true" poster="/assets/images/real-sindhudurg-fort.jpg">
        <source src="/assets/videos/bhagwa-flag-waving.mp4" type="video/mp4" />
      </video>
      <div className="living-flag-overlay"></div>
      <div className="living-flag-copy">
        <span className="card-tag">🚩 स्वराज्याचे प्रतीक</span>
        <h2>आजही अभिमानाने फडकणारा जिवंत भगवा ध्वज</h2>
        <p>"ज्यांचे आरमार त्यांचा समुद्र!" म्हणणाऱ्या छत्रपती शिवरायांचा भगवा ध्वज — शौर्य, स्वाभिमान आणि अखंड स्वराज्याचे प्रतीक. साडेतीनशे वर्षांपूर्वी सह्याद्रीच्या कड्यांवर व गडकोटांवर फडकलेला हा ध्वज आजही प्रत्येक मराठ्याच्या मनात तितक्याच जाज्वल्य निष्ठेने फडकत आहे.</p>
        <Link to="/culture" className="btn btn-primary" style={{"marginTop":"6px"}}>राजमुद्रा व मराठा चिन्हे पहा →</Link>
      </div>
    </div>
  </div>
</section>

{/* ========== MARATHA EMPIRE ========== */}
<section className="section" id="maratha-samrajya-section">
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">🚩 ३.९ दशलक्ष चौ. किमी · अटकेपासून कटक व तंजावरपर्यंत</span>
        <h2>अखंड मराठा साम्राज्य (The Great Maratha Empire — १६७४ ते १८१८)</h2>
      </div>
      <Link to="/history" className="more-link">सविस्तर साम्राज्य इतिहास पाहा →</Link>
    </div>
    <p className="muted" style={{"marginBottom":"24px"}}>
      छत्रपती शिवाजी महाराजांनी १६७४ मध्ये स्थापन केलेले सार्वभौम स्वराज्य, छत्रपती संभाजी महाराजांचा अभेद्य लढा, आणि पेशवे, शिंदे, होळकर, भोसले, गायकवाड, पवार घराण्यांनी भारतभर फडकवलेला भगवा ध्वज. १८ व्या शतकात संपूर्ण हिंदुस्थानवर मराठा सत्तेचा एकछत्री दरारा होता.
    </p>

    <div style={{"position":"relative","borderRadius":"var(--radius)","overflow":"hidden","marginBottom":"32px"}} data-reveal="zoom">
      <img src="/assets/images/real-maratha-sowar.jpg" alt="मराठा सैन्य" style={{"width":"100%","height":"440px","objectFit":"cover","objectPosition":"50% 12%"}} />
      <div style={{"position":"absolute","bottom":"0","left":"0","right":"0","background":"linear-gradient(180deg, transparent 20%, rgba(18,9,3,0.5) 60%, rgba(15,7,3,0.92) 100%)","padding":"32px 24px"}}>
        <span className="card-tag">भव्य दृश्य</span>
        <h3 style={{"color":"#FFFFFF","margin":"8px 0 4px","fontSize":"1.5rem"}}>मराठा सैन्याची अजस्त्र घोडदौड</h3>
        <p style={{"color":"rgba(255,248,231,0.92)","fontSize":".92rem"}}>पागा, तोफखाना व पायदळासह संपूर्ण भारतभर फडकलेला भगवा ध्वज</p>
      </div>
    </div>

    <div className="grid-4" style={{"marginBottom":"32px"}}>
      <div className="stat-glass" style={{"background":"var(--maroon-900)","color":"#FFFFFF"}}><b style={{"color":"var(--gold-400)"}}>३.९ दशलक्ष चौ.किमी</b><span style={{"color":"var(--text-sec)"}}>१७५८ मधील सर्वोच्च भूभाग विस्तार</span></div>
      <div className="stat-glass" style={{"background":"var(--maroon-900)","color":"#FFFFFF"}}><b style={{"color":"var(--saffron-500)"}}>अटकेपार ध्वज</b><span style={{"color":"var(--text-sec)"}}>लाहोर व सिंधू नदीवर भगवा (१७५८)</span></div>
      <div className="stat-glass" style={{"background":"var(--maroon-900)","color":"#FFFFFF"}}><b style={{"color":"var(--gold-400)"}}>४१ लढाया अपराजित</b><span style={{"color":"var(--text-sec)"}}>श्रीमंत बाजीराव पेशवे — शून्य पराभव</span></div>
      <div className="stat-glass" style={{"background":"var(--maroon-900)","color":"#FFFFFF"}}><b style={{"color":"var(--saffron-500)"}}>३५०+ गडकोट</b><span style={{"color":"var(--text-sec)"}}>सह्याद्री ते अरबी समुद्र आणि तंजावर</span></div>
    </div>

    {/* 6 heritage cards with matching online bg images */}
    <div className="grid-3" data-reveal-group>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-maratha-army-panoramic.jpg')"}}>
        <div className="card-bg-body">
          <span className="card-tag">अस्सल १८ वे शतक</span>
          <h4>मराठा सैन्य युद्ध मोहीम (Historical Fresco)</h4>
          <p>घोडदळ (पागा), तोफखाना, पायदळ आणि भगवा ध्वज घेऊन रणांगणात उतरणाऱ्या मराठा सैन्याचे ऐतिहासिक समकालीन भित्तीचित्र.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-shivaji-coronation.jpg')"}}>
        <div className="card-bg-body">
          <span className="card-tag">६ जून १६७४</span>
          <h4>शिवराज्याभिषेक सोहळा (Coronation)</h4>
          <p>दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला वैदिक राज्याभिषेक. रयतेच्या सार्वभौम मराठा साम्राज्याची अधिकृत स्थापना.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-maratha-expansion-map.jpg')","backgroundPosition":"center 20%"}}>
        <div className="card-bg-body">
          <span className="card-tag">साम्राज्य नकाशा</span>
          <h4>मराठा साम्राज्य विस्तार नकाशा</h4>
          <p>छत्रपती शाहू महाराज व बाजीराव पेशवे यांच्या नेतृत्वाखाली माळवा, गुजरात, बुंदेलखंड, दिल्ली व ओरिसापर्यंत झालेला अफाट विस्तार.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-maratha-sowar.jpg')","backgroundPosition":"center 15%"}}>
        <div className="card-bg-body">
          <span className="card-tag">मराठा घोडदळ</span>
          <h4>मराठा घोडदळ शिलेदार (Maratha Sowar)</h4>
          <p>चिलखत, शिरस्त्राण, भाला (बर्ची), ढाल व तलवार सज्ज मराठा घोडेस्वार — ज्यांच्या वेगवान घोडदौडीने मुघल व युरोपीय सत्तांना पराभूत केले.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-maratha-arms.jpg')","backgroundPosition":"center 25%"}}>
        <div className="card-bg-body">
          <span className="card-tag">शस्त्रागार</span>
          <h4>मराठा शस्त्रास्त्रे व चिलखत संग्रह</h4>
          <p>दांडपट्टा, धोप, तेगा, कट्यार, वाघनखे, गेंड्याच्या कातड्याची ढाल आणि जाळीदार लोखंडी चिलखत — मराठा युद्धकलेची अस्सल शस्त्रे.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-pavankhind.jpg')"}}>
        <div className="card-bg-body">
          <span className="card-tag">१३ जुलै १६६०</span>
          <h4>पावनखिंडीचा रणसंग्राम (Pavankhind)</h4>
          <p>घोडखिंडीत सिद्दी जोहरच्या अजस्त्र सेनेला रोखून धरणारे वीर बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे अमर बलिदान.</p>
        </div>
      </div>
    </div>

    {/* Fort gallery */}
    <div className="section-head" style={{"marginTop":"48px"}} data-reveal>
      <div>
        <span className="eyebrow-sm">📸 उच्च-गुणवत्ता छायाचित्र दालन</span>
        <h2>गडकोटांचे वैभव (Fort Photo Gallery)</h2>
      </div>
      <Link to="/forts" className="more-link">सर्व ३५०+ किल्ले पाहा →</Link>
    </div>
    <div className="grid-4" style={{"gridTemplateColumns":"repeat(auto-fit,minmax(200px,1fr))"}} data-reveal-group>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-raigad-panoramic.jpg')","minHeight":"200px"}}><div className="card-bg-body"><h4>दुर्गराज रायगड</h4><p>स्वराज्याची राजधानी</p></div></div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-sindhudurg-fort.jpg')","minHeight":"200px"}}><div className="card-bg-body"><h4>किल्ले सिंधुदुर्ग</h4><p>अभेद्य जलदुर्ग, मालवण</p></div></div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-pratapgad-fort.jpg')","minHeight":"200px"}}><div className="card-bg-body"><h4>किल्ले प्रतापगड</h4><p>अफझलखान वध स्थळ</p></div></div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-sinhagad-fort.jpg')","minHeight":"200px"}}><div className="card-bg-body"><h4>किल्ले सिंहगड</h4><p>तानाजी मालुसरे बलिदान भूमी</p></div></div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-panhala-fort.jpg')","minHeight":"200px"}}><div className="card-bg-body"><h4>किल्ले पन्हाळगड</h4><p>बाजीप्रभूंच्या बलिदानाची साक्ष</p></div></div>
    </div>

    {/* Empire table */}
    <div className="table-wrap" style={{"marginTop":"32px"}}>
      <table>
        <thead><tr><th>कालखंड</th><th>युग नाव</th><th>प्रमुख छत्रपती / सेनापती</th><th>ऐतिहासिक कामगिरी</th></tr></thead>
        <tbody>
          <tr><td><strong>१६४५ – १६८०</strong></td><td><strong style={{"color":"var(--gold-500)"}}>हिंदवी स्वराज्य स्थापना युग</strong></td><td><strong>छत्रपती शिवाजी महाराज</strong></td><td>३५०+ गडकोट, स्वतंत्र आरमार, अष्टप्रधान मंडळ, गनिमी कावा आणि स्वराज्याची सार्वभौम स्थापना.</td></tr>
          <tr><td><strong>१६८१ – १७०७</strong></td><td><strong style={{"color":"var(--gold-500)"}}>२७ वर्षांचा स्वातंत्र्य संग्राम</strong></td><td><strong>संभाजी महाराज, राजाराम महाराज, महाराणी ताराबाई, संताजी घोरपडे, धनाजी जाधव</strong></td><td>मुघल बादशहा औरंगजेबाच्या ५ लाखांच्या सेनेशी अविरत संघर्ष; औरंगजेबाचा संपूर्ण पराभव व महाराष्ट्रातच दफन.</td></tr>
          <tr><td><strong>१७०८ – १७६१</strong></td><td><strong style={{"color":"var(--gold-500)"}}>साम्राज्य विस्तार व पेशवाई युग</strong></td><td><strong>छत्रपती शाहू महाराज, बाजीराव पेशवे, चिमाजी आप्पा, नानासाहेब पेशवे</strong></td><td>अटकेपार भगवा ध्वज फडकवला (१७५८), माळवा-गुजरात-बुंदेलखंड विजय, पोर्तुगीजांचा वसईत दारुण पराभव (१७३९).</td></tr>
          <tr><td><strong>१७६१ – १८१८</strong></td><td><strong style={{"color":"var(--gold-500)"}}>मराठा पुनरुत्थान व महादजी युग</strong></td><td><strong>महादजी शिंदे, नाना फडणवीस, अहिल्याबाई होळकर, तुकोजी होळकर</strong></td><td>पानिपतनंतर अवघ्या १० वर्षांत दिल्ली पुन्हा जिंकली; मुघल बादशहाला मराठ्यांचे मांडलिक बनवले व इंग्रजांना पराभूत केले.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

{/* ========== ASHTAPRADHAN ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">शिवकालीन राज्यव्यवस्था व सुशासन</span>
        <h2>छत्रपती शिवाजी महाराजांचे अष्टप्रधान मंडळ (Ashtapradhan Council)</h2>
      </div>
      <Link to="/history/shivaji-maharaj" className="more-link">सविस्तर राज्यव्यवस्था →</Link>
    </div>
    <p className="muted" style={{"marginBottom":"16px"}}>१६७४ च्या राज्याभिषेकानंतर छत्रपती शिवरायांनी स्वराज्याच्या प्रशासनासाठी स्थापन केलेले आशिया खंडातील पहिले आधुनिक मंत्रीमंडळ:</p>
    <div className="table-wrap">
      <table>
        <thead><tr><th>क्र.</th><th>पद</th><th>शिवकालीन मंत्री</th><th>खाते व प्रशासकीय अधिकार</th><th>वेतन</th></tr></thead>
        <tbody>
          <tr><td>१</td><td><strong>पेशवा (मुख्य प्रधान)</strong></td><td><strong>मोरोपंत त्र्यंबक पिंगळे</strong></td><td>राजांच्या गैरहजेरीत संपूर्ण राज्यकारभार चालवणे, सर्व मुलकी व लष्करी खात्यांवर सर्वोच्च देखरेख, युद्धप्रसंगी सैन्याचे नेतृत्व.</td><td>१५,००० होन</td></tr>
          <tr><td>२</td><td><strong>अमात्य (अर्थ व महसूल मंत्री)</strong></td><td><strong>रामचंद्र नीलकंठ मुजुमदार</strong></td><td>स्वराज्याचा संपूर्ण जमाखर्च, तिजोरी, वार्षिक अंदाजपत्रक व महसूल खात्यावर पूर्ण नियंत्रण.</td><td>१२,००० होन</td></tr>
          <tr><td>३</td><td><strong>सचिव (गृह व पत्रव्यवहार प्रमुख)</strong></td><td><strong>अण्णाजी दत्तो</strong></td><td>राजांच्या सर्व आज्ञापत्रांची शुद्धता तपासणे, सरकारी दप्तर सांभाळणे आणि जमीन महसूल मोजणीची अंमलबजावणी.</td><td>१०,००० होन</td></tr>
          <tr><td>४</td><td><strong>मंत्री (वाकनीस / गुप्तवार्ता प्रमुख)</strong></td><td><strong>दत्ताजी त्रिंबक वाकनीस</strong></td><td>राजांची दैनंदिनी, राजदरबारातील सुरक्षा, गुप्तहेर खात्याचा समन्वय आणि भोजन व वैयक्तिक सुरक्षिततेची जबाबदारी.</td><td>१०,००० होन</td></tr>
          <tr><td>५</td><td><strong>सेनापती (सरनोबत)</strong></td><td><strong>हंबीरराव मोहिते</strong></td><td>स्वराज्याच्या संपूर्ण घोडदळ व पायदळाचे सर्वोच्च सेनापती; सैन्याची भरती, शिस्त, शस्त्रास्त्रे व प्रत्यक्ष युद्धव्यूहरचना.</td><td>१०,००० होन</td></tr>
          <tr><td>६</td><td><strong>सुमंत (परराष्ट्रमंत्री / डबीर)</strong></td><td><strong>रामचंद्र त्रिंबक डबीर</strong></td><td>परकीय सत्तांशी राजकीय व राजनैतिक पत्रव्यवहार आणि वकिलांचे स्वागत.</td><td>१०,००० होन</td></tr>
          <tr><td>७</td><td><strong>पंडितराव (धर्माध्यक्ष)</strong></td><td><strong>रघुनाथराव पंडितराव</strong></td><td>राज्यातील धर्मव्यवस्था, दानधर्म, विद्वानांचा सन्मान, आचारसंहिता आणि सांस्कृतिक उत्सवांचे नियोजन.</td><td>१०,००० होन</td></tr>
          <tr><td>८</td><td><strong>न्यायाधीश (सरन्यायाधीश)</strong></td><td><strong>निराजी रावजी</strong></td><td>स्वराज्यातील सर्वोच्च न्यायव्यवस्था; दिवाणी, फौजदारी आणि शेतजमिनींच्या तंट्यांवर निष्पक्ष व कठोर न्यायनिवाडा.</td><td>१०,००० होन</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

{/* ========== FORT ARCHITECTURE ========== */}
<section className="section">
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">वास्तुरचना व लष्करी अभियांत्रिकी</span>
        <h2>मराठा गडकोट स्थापत्यशास्त्र — त्रिविध वर्गीकरण</h2>
      </div>
      <Link to="/forts" className="more-link">सर्व ३५०+ किल्ले पाहा →</Link>
    </div>
    <div className="grid-3" data-reveal-group>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-raigad-panoramic.jpg')","minHeight":"360px"}}>
        <div className="card-bg-body">
          <span className="card-tag">⛰️ गिरीदुर्ग</span>
          <h4>गिरीदुर्ग (Hill Forts)</h4>
          <p>सह्याद्रीच्या नैसर्गिक उत्तुंग कड्यांवर वसलेले अभेद्य किल्ले. चहूबाजूंनी ताशीव कडे, गुप्त दिंडी दरवाजे, दुहेरी तटबंदी व बालेकिल्ला ही प्रमुख वैशिष्ट्ये.</p>
          <div className="tag-list"><span className="tag">ताशीव कडे</span><span className="tag">माच्या</span><span className="tag">टाके</span><span className="tag">गोमुखी रचना</span></div>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-sindhudurg-fort.jpg')","minHeight":"360px"}}>
        <div className="card-bg-body">
          <span className="card-tag">🌊 जलदुर्ग</span>
          <h4>जलदुर्ग / सागरी किल्ले (Sea Forts)</h4>
          <p>अरबी समुद्रात खडकांवर पायाभरणी करून बांधलेले अभेद्य नाविक किल्ले. समुद्राच्या अजस्त्र लाटांचा मारा सहन करण्यासाठी पायात शिशाचा रस ओतून दगड जोडले गेले.</p>
          <div className="tag-list"><span className="tag">शिशाची जोडणी</span><span className="tag">५२ बुरुज</span><span className="tag">सुरक्षित गोदी</span><span className="tag">गुप्त भुयारी मार्ग</span></div>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-shaniwar-wada.jpg')","minHeight":"360px"}}>
        <div className="card-bg-body">
          <span className="card-tag">🏰 भुईकोट</span>
          <h4>भुईकोट (Land / Plain Forts)</h4>
          <p>सपाट जमिनीवर किंवा पठारावर व्यापारी मार्गांच्या रक्षणासाठी बांधलेले किल्ले. किल्ल्याभोवती खोल खंदक खणून त्यात पाणी व मगरी सोडल्या जात असत.</p>
          <div className="tag-list"><span className="tag">खोल खंदक</span><span className="tag">व्यापारी नाके</span><span className="tag">तोफखाना तळे</span><span className="tag">वक्र प्रवेशद्वार</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ========== SHIVKALIN SUSHASAN ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">रयतेचे राज्य</span>
        <h2>शिवकालीन सुशासन, शेतकरी हित व पर्यावरण आज्ञापत्र</h2>
      </div>
    </div>
    <div className="grid-4" data-reveal-group>
      <div className="policy-card" style={{"minHeight":"300px","backgroundImage":"url('/assets/images/real-farmer-field.jpg')"}}>
        <div className="card-bg-body">
          <h4>🌾 काठी मोजणी व शेतसारा सुधारणा</h4>
          <p>अण्णाजी दत्तो यांच्या नेतृत्वाखाली ८० तसूं लांबीच्या 'शिवशाही काठी'ने जमिनीची अचूक मोजणी केली गेली. पिकांची प्रतवारी करून केवळ वास्तविक उत्पन्नावर सारा ठरवला जाई.</p>
        </div>
      </div>
      <div className="policy-card" style={{"minHeight":"300px","backgroundImage":"url('/assets/images/real-sahyadri-forest.jpg')"}}>
        <div className="card-bg-body">
          <h4>🌳 पर्यावरण व वृक्षसंवर्धन आज्ञापत्र</h4>
          <p>आरमारासाठी लाकूड हवे म्हणून रयतेने पोटच्या लेकरासारखी वाढवलेली आंबा, फणस, वड, पिंपळ अशी फळझाडे तोडण्यास सक्त मनाई होती!</p>
        </div>
      </div>
      <div className="policy-card" style={{"minHeight":"300px","backgroundImage":"url('/assets/images/real-maratha-court-1792.jpg')"}}>
        <div className="card-bg-body">
          <h4>🛡️ स्त्रियांचा सन्मान व कठोर न्यायव्यवस्था</h4>
          <p>स्वराज्यात स्त्रियांच्या सन्मानाला सर्वोच्च प्राधान्य होते. शत्रूच्या प्रदेशातही स्त्रिया, बालके, शेतकरी व धर्मस्थळांना स्पर्श करण्याची कोणाची हिम्मत नव्हती.</p>
        </div>
      </div>
      <div className="policy-card" style={{"minHeight":"300px","backgroundImage":"url('/assets/images/real-shivrai-coin.jpg')"}}>
        <div className="card-bg-body">
          <h4>🪙 शिवकालीन नाणी व चलन व्यवस्था</h4>
          <p>१६७४ च्या राज्याभिषेकानंतर शिवरायांनी स्वतःची अधिकृत नाणी पाडली: सुवर्ण 'होन' आणि तांब्याची 'शिवराई'. परकीय चलनावर अवलंबून न राहता स्वयंपूर्ण अर्थव्यवस्थेची मुहूर्तमेढ.</p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ========== NAVY ========== */}
<section className="section">
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">🌊 सागरी सीमांचे अभेद्य रक्षण · 'ज्यांचे आरमार त्यांचा समुद्र'</span>
        <h2>मराठा आरमार व सागरी सार्वभौमत्व (Father of Indian Navy)</h2>
      </div>
      <Link to="/forts" className="more-link">सागरी किल्ले नकाशा →</Link>
    </div>
    <p className="muted" style={{"marginBottom":"24px"}}>छत्रपती शिवाजी महाराजांनी १६५७ मध्ये कल्याण-भिवंडीत भारताच्या पहिल्या स्वतंत्र आरमाराची पायाभरणी केली. पोर्तुगीज, ब्रिटिश, डच व जंजिऱ्याच्या सिद्दीच्या समुद्री वर्चस्वाला सुरुंग लावून मराठ्यांनी पश्चिम किनारपट्टीवर स्वतःचे निर्विवाद प्रभुत्व प्रस्थापित केले.</p>
    <div className="grid-2" data-reveal-group>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-kanhoji-angre.jpg')","minHeight":"400px"}}>
        <div className="card-bg-body">
          <span className="card-tag">दर्यासारंग (Grand Admiral)</span>
          <h4>सरखेल कान्होजी आंग्रे (१६६९ – १७२९)</h4>
          <p>मराठा आरमाराचे अद्वितीय सरखेल ज्यांनी सलग ३० वर्षे इंग्रज, पोर्तुगीज आणि डच नौदलांना एकाही सागरी लढाईत जिंकू दिले नाही. विजयदुर्ग, सुवर्णदुर्ग आणि खांदेरी-उंदेरीवरून त्यांनी संपूर्ण कोकण किनारपट्टीवर मराठ्यांचे सार्वभौमत्व राखले.</p>
          <div className="key-takeaway" style={{"background":"rgba(233,196,106,.15)","color":"#FFFFFF","borderLeftColor":"var(--gold-400)"}}>⚓ भारतीय नौदलाचा वारसा: 'आयएनएस आंग्रे' (INS Angre) हे त्यांच्याच सन्मानार्थ नामकरण करण्यात आले आहे.</div>
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
        <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-sindhudurg-fort.jpg')","minHeight":"190px"}}>
          <div className="card-bg-body">
            <h4>⚓ शिवकालीन मराठा युद्धनौकांचे प्रकार</h4>
            <p><strong>गुराब:</strong> २-३ डोलकाठ्यांची, १५०-३०० टनांची मुख्य तोफधारी युद्धनौका.<br /><strong>गलबत:</strong> वेगवान वल्हवणारी लढाऊ नौका.<br /><strong>पाल:</strong> अजस्त्र तीन मजली लढाऊ जहाज.<br /><strong>मचवा व शिबाड:</strong> वेगवान टेहळणी नौका.</p>
          </div>
        </div>
        <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-raigad-panoramic.jpg')","minHeight":"190px"}}>
          <div className="card-bg-body">
            <h4>📜 शिवछत्रपतींचे आज्ञापत्र — आरमाराचे महत्त्व</h4>
            <p style={{"fontStyle":"italic"}}>"ज्यांचे आरमार त्यांचा समुद्र! जलदुर्ग व आरमार हे स्वतंत्र राज्यच आहे. ज्यास समुद्रतीराचे रक्षण करणे त्यास आरमार अवश्यकच आहे."</p>
            <span style={{"fontSize":".76rem","color":"var(--text-sec)"}}>— रामचंद्रपंत अमात्य लिखित 'शिवकालीन आज्ञापत्र'</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ========== RESURGENCE ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">👑 राखेमधून पुन्हा उभे राहिलेले महासाम्राज्य · १७६१ ते १८०३</span>
        <h2>पानिपतनंतरचे महापुनरुत्थान व महादजी युग (The Great Resurgence)</h2>
      </div>
      <Link to="/history" className="more-link">सविस्तर इतिहास →</Link>
    </div>
    <p className="muted" style={{"marginBottom":"24px"}}>१४ जानेवारी १७६१ रोजी पानिपतच्या तिसऱ्या युद्धात मोठा आघात सहन केल्यानंतर जगाला वाटले होते की मराठा सत्ता संपली. परंतु अवघ्या १० वर्षांत पेशवे माधवराव, महादजी शिंदे, तुकोजी होळकर आणि नाना फडणवीस यांनी पुन्हा दिल्लीवर भगवा फडकवून मुघल बादशहाला मराठ्यांचे मांडलिक बनवले.</p>
    <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-maratha-court-1792.jpg')","minHeight":"400px","marginBottom":"32px"}} data-reveal="zoom">
      <div className="card-bg-body">
        <span className="card-tag">अस्सल ऐतिहासिक तैलचित्र · १७९२</span>
        <h4>मराठा राजदरबार (The Maratha Durbar at Pune, 1792)</h4>
        <p>ब्रिटिश चित्रकार जेम्स वेल्स याने शनिवार वाड्यामध्ये प्रत्यक्ष उपस्थित राहून रेखाटलेले ऐतिहासिक चित्र. यामध्ये पेशवे सवाई माधवराव, कारभारी नाना फडणवीस, महादजी शिंदे आणि मराठा मुत्सद्दी उपस्थित आहेत.</p>
      </div>
    </div>
    <div className="grid-3" data-reveal-group>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-mahadji-shinde.jpg')","minHeight":"360px","backgroundPosition":"center 15%"}}>
        <div className="card-bg-body">
          <span className="card-tag">वकील-ए-मुतलक</span>
          <h4>श्रीमंत महादजी शिंदे (पाटीलबाबा)</h4>
          <p>पानिपतच्या युद्धात जखमी होऊनही पुन्हा फिनिक्स पक्ष्यासारखे झेप घेणारे महान योद्धे. १७७१ मध्ये दिल्ली जिंकली, मुघल बादशहाला मांडलिक केले आणि फ्रेंच सेनापती डी बॉईनच्या साहाय्याने भारतातील पहिली आधुनिक तोफखाना-सज्ज कवायती सेना उभारली.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-nana-phadnavis.jpg')","minHeight":"360px","backgroundPosition":"center 15%"}}>
        <div className="card-bg-body">
          <span className="card-tag">सर्वोच्च मुत्सद्दी</span>
          <h4>मुत्सद्दी नाना फडणवीस (१७४२ – १८००)</h4>
          <p>युरोपीय इतिहासकारांनी 'मराठ्यांचे मॅकियाव्हेली' संबोधलेले बुद्धिवंत राजकारणी. नारायणराव पेशव्यांच्या हत्येनंतर 'बारभाई कारस्थान' रचून स्वराज्याची धुरा सांभाळली. पहिल्या इंग्रज-मराठा युद्धात इंग्रजांना नमवून 'सालबाईचा तह' घडवून आणला.</p>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"url('/assets/images/real-ahilyabai-holkar.jpg')","minHeight":"360px","backgroundPosition":"center 8%"}}>
        <div className="card-bg-body">
          <span className="card-tag">लोकमाता व तत्त्वज्ञ राणी</span>
          <h4>पुण्यश्लोक अहिल्याबाई होळकर</h4>
          <p>माळवा प्रांताची आदर्श राज्यकर्ती ज्यांनी महेश्वर येथून ३० वर्षे सुशासन चालवले. महेश्वर साड्यांच्या वस्त्रोद्योगाची स्थापना केली, शेतकऱ्यांना करसवलती दिल्या, आणि काशी विश्वनाथ ते रामेश्वरमपर्यंत शेकडो मंदिरांचा जीर्णोद्धार केला.</p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ========== RESEARCHERS ========== */}
<section className="section">
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">📚 अस्सल ऐतिहासिक पुरावे · संशोधकांची निष्पक्ष मीमांसा</span>
        <h2>इतिहास संशोधकांचे विचारमंथन व अभ्यास (Scholarly Authorities)</h2>
      </div>
      <Link to="/history" className="more-link">इतिहास ग्रंथ दालन →</Link>
    </div>
    <p className="muted" style={{"marginBottom":"24px"}}>मराठा साम्राज्याचा इतिहास हा केवळ काल्पनिक कथांवर नव्हे, तर समकालीन मोडी कागदपत्रे, बखरी, पोर्तुगीज-डच-ब्रिटिश पुराभिलेखागारे आणि प्रत्यक्ष गडकोटांच्या शास्त्रीय संशोधनावर अधिष्ठित आहे. महाराष्ट्रातील अग्रगण्य इतिहास संशोधकांचे हे अधिकृत निष्कर्ष:</p>
    <div className="researchers-grid" data-reveal-group>
      <div className="researcher-card">
        <div className="researcher-top">
          <span className="quote-mark">“</span>
          <img className="researcher-avatar" style={{"objectPosition":"50% 35%"}} src="/assets/images/real-babasaheb-purandare.jpg" alt="शिवशाहीर बाबासाहेब पुरंदरे" />
        </div>
        <div className="author-badge">📖 'राजा शिवछत्रपती' महाग्रंथकार</div>
        <h4>शिवशाहीर बाबासाहेब पुरंदरे</h4>
        <div className="researcher-title">पद्मविभूषण इतिहासकार, शिवचरित्रकार</div>
        <p>"शिवछत्रपतींचे स्वराज्य हे कोणत्याही धर्माविरुद्ध नव्हते, तर ते जुलूम, अन्याय आणि परावलंबित्वाविरुद्ध पुकारलेले बंड होते. शिवरायांचे राज्य हे 'रयतेचे स्वराज्य' होते!"</p>
        <div className="key-takeaway">🌟 शिवशाही म्हणजे केवळ साम्राज्यविस्तार नव्हे, तर रयतेचे कल्याण व सर्वोच्च नैतिक सुशासन.</div>
      </div>
      <div className="researcher-card">
        <div className="researcher-top">
          <span className="quote-mark">“</span>
          <img className="researcher-avatar" style={{"objectPosition":"45% 25%"}} src="/assets/images/real-mohan-shete.jpg" alt="इतिहास अभ्यासक मोहन शेटे" />
        </div>
        <div className="author-badge">⚔️ 'शिवस्पर्श' अभ्यासक</div>
        <h4>इतिहास अभ्यासक मोहन शेटे</h4>
        <div className="researcher-title">ज्येष्ठ इतिहास अभ्यासक व व्याख्याते</div>
        <p>"मराठा सैन्याची खरी शक्ती त्यांच्या अद्वितीय वेगात आणि गनिमी काव्यात होती. श्रीमंत बाजीराव पेशव्यांनी ४१ लढाया लढल्या आणि एकाही लढाईत पराभव पत्करला नाही!"</p>
        <div className="key-takeaway">⚡ बाजीरावांची अपराजित ४१ युद्धे आणि संभाजीराजांचा ९ वर्षांचा अभेद्य लढा हे मराठा युद्धशास्त्राचे शिखर.</div>
      </div>
      <div className="researcher-card">
        <div className="researcher-top">
          <span className="quote-mark">“</span>
          <img className="researcher-avatar" style={{"objectPosition":"22% 18%"}} src="/assets/images/real-ninad-bedekar.jpg" alt="इतिहास संशोधक निनाद बेडेकर" />
        </div>
        <div className="author-badge">🏰 आंतरराष्ट्रीय दुर्गशास्त्र तज्ज्ञ</div>
        <h4>इतिहास संशोधक निनाद बेडेकर</h4>
        <div className="researcher-title">दुर्गमहर्षी, तोफखाना अभ्यासक</div>
        <p>"सह्याद्रीतील गडकोट हे केवळ दगडमातीचे बांधकाम नाहीत, तर ते जागतिक दर्जाचे लष्करी अभियांत्रिकी चमत्कार आहेत! गडांचे गोमुखी दरवाजे असे वळणावळणावर बांधले गेले की बाहेरील शत्रूच्या तोफांना थेट मारा करणे अशक्य होई."</p>
        <div className="key-takeaway">🛡️ गोमुखी महाद्वारे, शिशाचा रस ओतलेली पायाभरणी व जलव्यवस्थापन हे शिवकालीन दुर्गशास्त्राचे वैभव.</div>
      </div>
      <div className="researcher-card">
        <div className="researcher-top">
          <span className="quote-mark">“</span>
          <img className="researcher-avatar" style={{"objectPosition":"50% 20%"}} src="/assets/images/real-vk-rajwade.jpg" alt="इतिहासचार्य वि. का. राजवाडे" />
        </div>
        <div className="author-badge">📜 आधुनिक इतिहास संशोधनाचे जनक</div>
        <h4>इतिहासचार्य वि. का. राजवाडे</h4>
        <div className="researcher-title">'मराठ्यांच्या इतिहासाची साधने' (२२ खंड) संकलक</div>
        <p>"कागदपत्रांशिवाय इतिहास नाही (No Document, No History)! इतिहास म्हणजे कल्पनाविलास किंवा अंधश्रद्धा नव्हे; तो अस्सल समकालीन कागदपत्रे, सनदा, मोडी पत्रव्यवहार आणि शकावलींवर आधारलेला असावा."</p>
        <div className="key-takeaway">📜 २२ खंडांमधील अस्सल मोडी कागदपत्रांच्या आधारे सिद्ध झालेले मराठा साम्राज्याचे राष्ट्रव्यापी प्रभुत्व.</div>
      </div>
    </div>
  </div>
</section>

{/* ========== TIMELINE ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">अखंड गौरवगाथा</span>
        <h2>मराठा साम्राज्य महत्त्वाचे कालखंड (1630 – 1818 Timeline)</h2>
      </div>
      <Link to="/history" className="more-link">सविस्तर कालपट →</Link>
    </div>
    <div className="table-wrap">
      <table>
        <thead><tr><th>वर्ष</th><th>महत्त्वाची ऐतिहासिक घटना</th><th>रणनीतिक महत्त्व व परिणाम</th></tr></thead>
        <tbody>
          <tr><td><strong>१६३०</strong></td><td>शिवनेरी गडावर छत्रपती शिवरायांचा जन्म (१९ फेब्रुवारी १६३०)</td><td>माता जिजाऊ व शहाजीराजे यांच्या प्रेरणेने हिंदवी स्वराज्याची बीजे रोवली गेली.</td></tr>
          <tr><td><strong>१६४५</strong></td><td>रायरेश्वराच्या मंदिरात स्वराज्याची शपथ व तोरणा किल्ला विजय</td><td>अवघ्या १५ व्या वर्षी मावळ्यांना एकत्र करून स्वराज्याची अधिकृत घोषणा.</td></tr>
          <tr><td><strong>१६५९</strong></td><td>प्रतापगड युद्ध — अफझलखानाचा वध (१० नोव्हेंबर १६५९)</td><td>विजापूरच्या बलाढ्य फौजेचा धुव्वा; वाघनखांनी अफझलखानाचा कोथळा बाहेर काढला.</td></tr>
          <tr><td><strong>१६६६</strong></td><td>आग्रा भेट व मिठाईच्या पेटाऱ्यातून ऐतिहासिक सुटका (१७ ऑगस्ट १६६६)</td><td>औरंगजेबाच्या कपटी कैदेतून शिवरायांची सुटका; जागतिक गुप्तहेर शास्त्रातील चमत्कार.</td></tr>
          <tr><td><strong>१६७४</strong></td><td>दुर्गराज रायगडावर सुवर्ण राज्याभिषेक (६ जून १६७४)</td><td>हिंदवी स्वराज्य सार्वभौम झाले, 'शिवराज्याभिषेक शक' सुरू व स्वतःचे चलन सुरू.</td></tr>
          <tr><td><strong>१६८०–१६८९</strong></td><td>छत्रपती संभाजी महाराज — १२८ लढायांचे अपराजित पर्व</td><td>औरंगजेब ५ लाख फौजेसह दक्षिणेत उतरला; शंभूराजांनी ९ वर्षे त्याला एकही किल्ला जिंकू दिला नाही.</td></tr>
          <tr><td><strong>१६८९–१७०७</strong></td><td>२७ वर्षांचे स्वातंत्र्ययुद्ध — महाराणी ताराबाई, संताजी-धनाजी</td><td>मराठ्यांनी मुघल सैन्याला सळो की पळो केले; शेवटी औरंगजेब महाराष्ट्राच्या मातीत गाडला गेला.</td></tr>
          <tr><td><strong>१७२०–१७४०</strong></td><td>श्रीमंत बाजीराव पेशवे — ४१ लढाया, शून्य पराभव</td><td>पालखेड, माळवा, बुंदेलखंड, दिल्ली व भोपाळ जिंकून मराठा साम्राज्य थेट अटकेपार पोहोचवले.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

{/* ========== LEGENDARY LEADERS ========== */}
<section className="section">
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">इतिहास दालन</span>
        <h2>साम्राज्याचे महायोद्धे व ऐतिहासिक चरित्र ग्रंथ</h2>
      </div>
      <Link to="/history" className="more-link">सर्व इतिहास पाहा →</Link>
    </div>
    <div className="grid-3" data-reveal-group>
      <Link to="/history/shivaji-maharaj" className="card-bg" style={{"backgroundImage":"url('/assets/images/real-shivaji-portrait.jpg')","minHeight":"320px","backgroundPosition":"center 15%"}}>
        <div className="card-bg-body">
          <span className="card-tag">हिंदवी स्वराज्य संस्थापक</span>
          <h4>छत्रपती शिवाजी महाराज</h4>
          <p>रयतेचे राजे, आरमार पितामह, गनिमी काव्याचे जनक व अष्टप्रधान मंडळाचे शिल्पकार.</p>
          <span className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>सविस्तर चरित्र वाचा →</span>
        </div>
      </Link>
      <Link to="/history/sambhaji-maharaj" className="card-bg" style={{"backgroundImage":"url('/assets/images/real-sambhaji-portrait.png')","minHeight":"320px","backgroundPosition":"center 15%"}}>
        <div className="card-bg-body">
          <span className="card-tag">अपराजित धर्मवीर</span>
          <h4>छत्रपती संभाजी महाराज</h4>
          <p>१२८ लढायांमध्ये अजिंक्य, 'बुधभूषणम्' संस्कृत ग्रंथकार व तुळापूरचे सर्वोच्च बलिदान.</p>
          <span className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>सविस्तर चरित्र वाचा →</span>
        </div>
      </Link>
      <Link to="/history/bajirao-peshwa" className="card-bg" style={{"backgroundImage":"url('/assets/images/real-bajirao-statue.jpg')","minHeight":"320px","backgroundPosition":"50% 8%"}}>
        <div className="card-bg-body">
          <span className="card-tag">अपराजित सेनापती</span>
          <h4>श्रीमंत बाजीराव पेशवे</h4>
          <p>४१ लढाया, शून्य पराभव — पालखेड मोहीम, गनिमी घोडदौड व अटकेपार साम्राज्य विस्तार.</p>
          <span className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>सविस्तर चरित्र वाचा →</span>
        </div>
      </Link>
    </div>
  </div>
</section>

{/* ========== SERVICES ========== */}
<section className="section" style={{"background":"#FFFFFF"}}>
  <div className="container">
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow-sm">समाजाचे स्वतःचे सेवा नेटवर्क</span>
        <h2>विश्वासू सेवा व उद्योग निर्देशिका</h2>
      </div>
      <Link to="/jobs" className="more-link">सर्व सेवा पाहा →</Link>
    </div>
    <div className="grid-4" data-reveal-group>
      <div className="card-bg" style={{"backgroundImage":"linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,7,3,0.72) 65%, rgba(15,7,3,0.92) 100%),url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80')","minHeight":"280px","borderRadius":"16px","backgroundSize":"cover","backgroundPosition":"center"}}>
        <div className="card-bg-body">
          <div style={{"fontSize":"1.8rem","marginBottom":"4px"}}>💻</div>
          <h4>आयटी व सॉफ्टवेअर</h4>
          <p>वेबसाईट, ॲप डेव्हलपमेंट, क्लाउड सोल्युशन्स व डिजिटल मार्केटिंग.</p>
          <Link to="/jobs" className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>सेवा बुक करा</Link>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,7,3,0.72) 65%, rgba(15,7,3,0.92) 100%),url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80')","minHeight":"280px","borderRadius":"16px","backgroundSize":"cover","backgroundPosition":"center"}}>
        <div className="card-bg-body">
          <div style={{"fontSize":"1.8rem","marginBottom":"4px"}}>⚖️</div>
          <h4>कायदेशीर सल्ला व CA</h4>
          <p>हायकोर्ट वकिली, कर सल्लागार, जीएसटी, कंपनी रजिस्ट्रेशन व ऑडिट.</p>
          <Link to="/jobs" className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>सल्ला घ्या</Link>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,7,3,0.72) 65%, rgba(15,7,3,0.92) 100%),url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80')","minHeight":"280px","borderRadius":"16px","backgroundSize":"cover","backgroundPosition":"center"}}>
        <div className="card-bg-body">
          <div style={{"fontSize":"1.8rem","marginBottom":"4px"}}>🌱</div>
          <h4>ॲग्री-टेक व आधुनिक शेती</h4>
          <p>ड्रोन फवारणी, सेंद्रिय खते, माती परीक्षण व थेट शेतकरी बाजारपेठ.</p>
          <Link to="/jobs" className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>तपशील पाहा</Link>
        </div>
      </div>
      <div className="card-bg" style={{"backgroundImage":"linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,7,3,0.72) 65%, rgba(15,7,3,0.92) 100%),url('/assets/images/real-raigad-panoramic.jpg')","minHeight":"280px","borderRadius":"16px","backgroundSize":"cover","backgroundPosition":"center"}}>
        <div className="card-bg-body">
          <div style={{"fontSize":"1.8rem","marginBottom":"4px"}}>🥾</div>
          <h4>गडभ्रमंती व ट्रेक गाईड</h4>
          <p>इतिहास संशोधक गाईड्स, सुरक्षित ट्रेकिंग, कॅम्पिंग व गड संवर्धन.</p>
          <Link to="/jobs" className="btn btn-outline" style={{"marginTop":"10px","fontSize":".78rem","color":"#E65100","borderColor":"#E65100"}}>गाईड बुक करा</Link>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ========== CLASSIFIED ECOSYSTEM DIRECTORY (Classified & Optimized) ========== */}
<section className="eco-directory-wrap">
  <div className="container">
    <div className="section-title" style={{"textAlign":"center","maxWidth":"850px","margin":"0 auto 24px"}}>
      <span className="card-tag" style={{"background":"rgba(255,255,255,0.15)","color":"#FFFFFF","borderColor":"rgba(255,255,255,0.3)","fontSize":"0.75rem"}}>परिसंस्था निर्देशिका • Classified Portals</span>
      <h2 style={{"color":"#FFFFFF","fontSize":"clamp(1.7rem, 3.2vw, 2.4rem)","margin":"8px 0 10px"}}>अखिल भारतीय मराठा डिजिटल परिसंस्था</h2>
      <p style={{"color":"rgba(255,248,231,0.85)","fontSize":"0.95rem"}}>इतिहास, गडकोट, व्यवसाय, शिक्षण आणि प्रशासनाची सर्व ७०+ अधिकृत दालने ५ सुस्पष्ट वर्गवारीत</p>
    </div>

    {/* Live Portal Filter Search */}
    <div className="eco-search-bar">
      <span className="eco-search-icon">🔎</span>
      <input type="text" id="ecoSearchInput" value={ecoQuery} onChange={e => setEcoQuery(e.target.value)} />
    </div>

    {/* Category Tabs */}
    <div className="eco-tabs">
      <button type="button" className={`eco-tab-btn ${ecoTab === 'tab-history' ? 'active' : ''}`} data-target="tab-history" onClick={() => setEcoTab('tab-history')}>⚔️ इतिहास व राज्यकर्ते</button>
      <button type="button" className={`eco-tab-btn ${ecoTab === 'tab-forts' ? 'active' : ''}`} data-target="tab-forts" onClick={() => setEcoTab('tab-forts')}>🏰 गड-किल्ले व पर्यटन</button>
      <button type="button" className={`eco-tab-btn ${ecoTab === 'tab-knowledge' ? 'active' : ''}`} data-target="tab-knowledge" onClick={() => setEcoTab('tab-knowledge')}>📚 ग्रंथालय व चळवळी</button>
      <button type="button" className={`eco-tab-btn ${ecoTab === 'tab-business' ? 'active' : ''}`} data-target="tab-business" onClick={() => setEcoTab('tab-business')}>💼 व्यवसाय व करिअर</button>
      <button type="button" className={`eco-tab-btn ${ecoTab === 'tab-community' ? 'active' : ''}`} data-target="tab-community" onClick={() => setEcoTab('tab-community')}>🌐 समुदाय व प्रशासन</button>
    </div>

    {/* Tab Pane 1: History & Rulers */}
    <div className="eco-tab-pane active" id="tab-history">
      <div className="eco-grid">
        <Link to="/history" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">📜</span>
            <div>
              <div className="eco-card-title">मराठा इतिहास कालपट</div>
              <div className="eco-card-desc">१६३० ते १८१८ चा अखंड मराठा साम्राज्य विस्तार व महत्त्वाच्या घडामोडी.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/battles" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚔️</span>
            <div>
              <div className="eco-card-title">प्रमुख ७ रणांगणे</div>
              <div className="eco-card-desc">पावनखिंड, पुरंदर, सिंहगड, पालखेड, वसई, पानिपत व वडगाव व्यूहरचना.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/shivaji-maharaj" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">👑</span>
            <div>
              <div className="eco-card-title">छत्रपती शिवाजी महाराज</div>
              <div className="eco-card-desc">हिंदवी स्वराज्य संस्थापक, रयतेचे राजे व युगपुरुष जीवनगाथा.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/sambhaji-maharaj" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🛡️</span>
            <div>
              <div className="eco-card-title">छत्रपती संभाजी महाराज</div>
              <div className="eco-card-desc">अपराजित पराक्रम, १२० लढाया, संस्कृत बुधभूषणम् व सर्वोच्च बलिदान.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/rajmata-jijau" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🌸</span>
            <div>
              <div className="eco-card-title">राष्ट्रमाता जिजाऊ माँसाहेब</div>
              <div className="eco-card-desc">स्वराज्याची प्रेरणा, न्याय व संस्कार देणाऱ्या माँसाहेब चरित्र.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/tarabai" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🗡️</span>
            <div>
              <div className="eco-card-title">महाराणी ताराबाई</div>
              <div className="eco-card-desc">मोगल बादशहाला सळो की पळो करून स्वराज्य टिकवणारी रणरागिणी.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/bajirao-peshwa" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🐎</span>
            <div>
              <div className="eco-card-title">बाजीराव पेशवे प्रथम</div>
              <div className="eco-card-desc">४१ लढायांमध्ये अपराजित, अटकेपार भगवा नेणारे महान सेनापती.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/warriors" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🚩</span>
            <div>
              <div className="eco-card-title">मराठा सरदार व ९६ कुळे</div>
              <div className="eco-card-desc">शिंदे, होळकर, गायकवाड, भोसले, पवार व ९६ कुळी सरदार घराणी.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/warriors" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🥾</span>
            <div>
              <div className="eco-card-title">शिवकालीन मावळे</div>
              <div className="eco-card-desc">तानाजी, बाजीप्रभू, जिवा महाला, येसाजी कंक व निष्ठावंत वीर.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/navy" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚓</span>
            <div>
              <div className="eco-card-title">मराठा आरमार व जलदुर्ग</div>
              <div className="eco-card-desc">सरखेल कान्होजी आंग्रे, सिंधुदुर्ग, विजयदुर्ग व सागरी साम्राज्य.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/rajaram-maharaj" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚔️</span>
            <div>
              <div className="eco-card-title">छत्रपती राजाराम महाराज</div>
              <div className="eco-card-desc">जिंजीहून चालवलेले २७ वर्षांचे मराठा स्वातंत्र्ययुद्ध व नेतृत्व.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/shahu-maharaj" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚖️</span>
            <div>
              <div className="eco-card-title">छत्रपती शाहू महाराज</div>
              <div className="eco-card-desc">मराठा साम्राज्याचा सुवर्णकाळ, सातारा व कोल्हापूर गादी वारसा.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
      </div>
    </div>

    {/* Tab Pane 2: Forts & Trails */}
    <div className="eco-tab-pane" id="tab-forts">
      <div className="eco-grid">
        <Link to="/forts" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🏰</span>
            <div>
              <div className="eco-card-title">३५०+ दुर्ग संवादी नकाशा</div>
              <div className="eco-card-desc">महाराष्ट्रातील ३५०+ किल्ल्यांचे जीपीएस नकाशे, मार्ग व इतिहास.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/forts" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">👑</span>
            <div>
              <div className="eco-card-title">दुर्गराज रायगड</div>
              <div className="eco-card-desc">स्वराज्याची राजधानी, राज्याभिषेक वास्तू व पावन समाधी स्थळ.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/forts" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⛰️</span>
            <div>
              <div className="eco-card-title">किल्ले राजगड</div>
              <div className="eco-card-desc">स्वराज्याची पहिली राजधानी, सुवेळा, पद्मावती व संजीवनी माची.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/forts" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🚩</span>
            <div>
              <div className="eco-card-title">किल्ले शिवनेरी</div>
              <div className="eco-card-desc">छत्रपती शिवाजी महाराजांचे पावन जन्मस्थान व शिवाई मंदिर.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/forts" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚔️</span>
            <div>
              <div className="eco-card-title">किल्ले प्रतापगड</div>
              <div className="eco-card-desc">अफझलखान वध स्थळ, भवानी माता मंदिर व जावळीचे अभेद्य खोरे.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/gallery" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🖼️</span>
            <div>
              <div className="eco-card-title">आपुला महाराष्ट्र छायाचित्र दालन</div>
              <div className="eco-card-desc">सह्याद्री, किल्ले व संस्कृतीची उच्च दर्जाची छायाचित्रे.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/forts" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🥾</span>
            <div>
              <div className="eco-card-title">वारसा ट्रेक व भ्रमंती</div>
              <div className="eco-card-desc">पन्हाळा-पावनखिंड, राजगड-तोरणा व सह्याद्री दुर्ग भ्रमंती मार्ग.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/culture/temples" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🛕</span>
            <div>
              <div className="eco-card-title">शिवकालीन मंदिरे</div>
              <div className="eco-card-desc">तुळजापूर भवानी, शिखर शिंगणापूर व शिवकालीन श्रद्धास्थाने.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/culture" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🌍</span>
            <div>
              <div className="eco-card-title">सांस्कृतिक विविधता (८ प्रदेश)</div>
              <div className="eco-card-desc">कोकण, विदर्भ, मराठवाडा, खानदेश व पश्चिम महाराष्ट्राची जीवनशैली.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/culture/dialects" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🗣️</span>
            <div>
              <div className="eco-card-title">महाराष्ट्राच्या बोली व लहेजा</div>
              <div className="eco-card-desc">मालवणी, वऱ्हाडी, अहिराणी, आगरी व कोळी बोलींची परस्पर तुलना व ऑडिओ.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/culture/food" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🍲</span>
            <div>
              <div className="eco-card-title">महाराष्ट्राची खाद्यसंस्कृती</div>
              <div className="eco-card-desc">सोलकढी, तांबडा-पांढरा रस्सा, सावजी मटण व अस्सल पारंपरिक पदार्थ.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/culture/gramdevat-jatra" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🎪</span>
            <div>
              <div className="eco-card-title">ग्रामदैवत, जत्रा व लोककला</div>
              <div className="eco-card-desc">गावची ग्रामदैवते, वार्षिक यात्रा दिनदर्शिका, दशावतार व देशी खेळ.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/culture/heritage-map" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🗺️</span>
            <div>
              <div className="eco-card-title">परस्परसंवादी वारसा नकाशा</div>
              <div className="eco-card-desc">किल्ले, लेणी, मंदिरे व युनेस्को जागतिक वारसास्थळांचे थेट नकाशा दर्शन.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
      </div>
    </div>

    {/* Tab Pane 3: Knowledge, Granths & Movements */}
    <div className="eco-tab-pane" id="tab-knowledge">
      <div className="eco-grid">
        <Link to="/granthalaya" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">📖</span>
            <div>
              <div className="eco-card-title">मराठा महाग्रंथालय</div>
              <div className="eco-card-desc">सभासद बखर, शिवभारत, आज्ञापत्र व दुर्मीळ हस्तलिखिते.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/dnyankosh" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">💡</span>
            <div>
              <div className="eco-card-title">मराठा ज्ञानकोश</div>
              <div className="eco-card-desc">इतिहास, लष्करी रणनीती, दुर्ग स्थापत्य व संस्कृती संदर्भकोश.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">📖</span>
            <div>
              <div className="eco-card-title">विशेष संशोधन लेख</div>
              <div className="eco-card-desc">शिवकालीन जलव्यवस्थापन, तोफखाना व परराष्ट्र धोरण अभ्यास.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🕯️</span>
            <div>
              <div className="eco-card-title">धर्मवीर बलिदान मास स्मरण</div>
              <div className="eco-card-desc">छत्रपती संभाजी महाराज व वीरांचे ऐतिहासिक स्वाभिमान स्मरण.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🚩</span>
            <div>
              <div className="eco-card-title">५८ क्रांती मूक मोर्चे</div>
              <div className="eco-card-desc">जागतिक दर्जाची शांततापूर्ण जनआंदोलने व आरक्षण पाठपुरावा.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/dates" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">📅</span>
            <div>
              <div className="eco-card-title">३६५ दिनविशेष दिनदर्शिका</div>
              <div className="eco-card-desc">मराठा इतिहासातील प्रत्येक दिवसाचे ऐतिहासिक स्मरण व घटना.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/history/knowledge-graph" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚡</span>
            <div>
              <div className="eco-card-title">घटना ↔ स्थळे नॉलेज ग्राफ</div>
              <div className="eco-card-desc">राज्याभिषेक, पन्हाळा वेढा यांसारख्या घटना, व्यक्ती, किल्ले व पर्यटन मार्ग आलेख.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/community/oral-history" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">✍️</span>
            <div>
              <div className="eco-card-title">मौखिक इतिहास संकलन (Tier 4)</div>
              <div className="eco-card-desc">आपल्या गावाचा इतिहास, मौखिक आख्यायिका व जुनी कागदपत्रे नोंदवा.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
      </div>
    </div>

    {/* Tab Pane 4: Business, Jobs & Sangam */}
    <div className="eco-tab-pane" id="tab-business">
      <div className="eco-grid">
        <Link to="/business/directory" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🏢</span>
            <div>
              <div className="eco-card-title">मराठा व्यवसाय निर्देशिका</div>
              <div className="eco-card-desc">२५००+ अधिकृत मराठा उद्योजक, कंपन्या व व्यावसायिक मंच.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/sangam" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🤝</span>
            <div>
              <div className="eco-card-title">व्यवसाय संगम (Chapters)</div>
              <div className="eco-card-desc">स्थानिक व जागतिक बिझनेस चॅप्टर्स, साप्ताहिक नेटवर्किंग.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/jobs" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🛠️</span>
            <div>
              <div className="eco-card-title">सेवा बुकिंग विझार्ड</div>
              <div className="eco-card-desc">कायदे सल्ला, आयटी, कृषी व सीए सेवांवर १५% बांधव सवलत.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/business/directory" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">📈</span>
            <div>
              <div className="eco-card-title">B2B व्यवसाय संधी व सौदे</div>
              <div className="eco-card-desc">कॉन्ट्रॅक्ट्स, जॉइंट व्हेंचर्स आणि थेट व्यावसायिक भागीदारी.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/jobs" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">💼</span>
            <div>
              <div className="eco-card-title">रोजगार व करिअर केंद्र</div>
              <div className="eco-card-desc">नोकऱ्या, इंटर्नशिप, करिअर समुपदेशन व एचआर नेटवर्क.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/jobs" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🎓</span>
            <div>
              <div className="eco-card-title">उच्च शिक्षण व शिष्यवृत्ती</div>
              <div className="eco-card-desc">सारथी, सरकारी योजना व परदेशी शिक्षणासाठी आर्थिक सहाय्य.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
      </div>
    </div>

    {/* Tab Pane 5: Community & Governance */}
    <div className="eco-tab-pane" id="tab-community">
      <div className="eco-grid">
        <Link to="/community" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">💬</span>
            <div>
              <div className="eco-card-title">मराठा डिजिटल कम्युनिटी</div>
              <div className="eco-card-desc">विचारविनिमय, सामाजिक संवाद आणि सुरक्षित बांधव मंच.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/about" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🏛️</span>
            <div>
              <div className="eco-card-title">संस्था सनद व मार्गदर्शक मंडळ</div>
              <div className="eco-card-desc">ज्येष्ठ इतिहासकार, विधी सल्लागार व सामाजिक नेतृत्व.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/profile" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">⚙️</span>
            <div>
              <div className="eco-card-title">खाते व DPDP २०२३ सेटिंग्ज</div>
              <div className="eco-card-desc">प्रोफाइल दृश्यमानता, २FA सुरक्षा व डेटा गोपनीयता अधिकार.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/community" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🔔</span>
            <div>
              <div className="eco-card-title">एकात्मिक सूचना केंद्र</div>
              <div className="eco-card-desc">व्यवसाय सौदे, बैठका व उपक्रमांचे थेट नोटिफिकेशन्स.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/governance" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🎯</span>
            <div>
              <div className="eco-card-title">व्हिजन, धोरण व संविधान</div>
              <div className="eco-card-desc">प्लॅटफॉर्मची ध्येयधोरणे आणि कायदेशीर गोपनीयता नियमावली.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
        <Link to="/governance" className="eco-card">
          <div className="eco-card-top">
            <span className="eco-card-icon">🧭</span>
            <div>
              <div className="eco-card-title">मास्टर ब्लूप्रिंट (५० विभाग)</div>
              <div className="eco-card-desc">प्लॅटफॉर्मची संपूर्ण तांत्रिक रचना व कार्यपद्धती.</div>
            </div>
          </div>
          <div className="eco-card-action">दालन उघडा →</div>
        </Link>
      </div>
    </div>

    {/* Directory Bottom Actions */}
    <div style={{"textAlign":"center","marginTop":"36px","display":"flex","justifyContent":"center","gap":"14px","flexWrap":"wrap"}}>
      <Link to="/gallery" className="btn btn-outline" style={{"background":"rgba(255,255,255,0.08)","color":"#FFFFFF","borderColor":"rgba(255,255,255,0.4)","fontSize":"0.86rem","padding":"10px 22px"}}>📂 सर्व ७०+ दालनांची संपूर्ण निर्देशिका सूची</Link>
      <Link to="/business/directory" className="btn btn-primary" style={{"fontSize":"0.86rem","padding":"10px 22px"}}>⚡ ग्लोबल सर्च इंजिन</Link>
    </div>

  </div>
</section>

    </div>
  );
}
