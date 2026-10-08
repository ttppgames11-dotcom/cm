import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

// Helper to verify genuine logged in state
const isUserLoggedIn = (user) => {
  if (!user) return false;
  if (!user.id && !user._id && !user.phone) return false;
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cm_logged_in') !== 'true') return false;
  }
  return true;
};

// Dedicated AuthLink: Automatically halts navigation and prompts login modal if user is unauthenticated
function AuthLink({ to, children, onClick, title, ...props }) {
  const { user } = useAuth();
  const toStr = typeof to === 'string' ? to : String(to || '');
  const isDirectLogin = toStr === '/login' || toStr.startsWith('/login?') || toStr.startsWith('#') || toStr.startsWith('tel:') || toStr.startsWith('mailto:') || toStr.startsWith('http');
  const loggedIn = isUserLoggedIn(user);

  const handleClick = (e) => {
    if (!loggedIn && !isDirectLogin) {
      e.preventDefault();
      e.stopPropagation();
      sessionStorage.setItem('cm_login_redirect', toStr);
      const featureTitle = (
        title ||
        (typeof children === 'string' ? children : '') ||
        'Connect Maratha सुविधा'
      ).trim().replace(/\s+/g, ' ').slice(0, 50);

      if (typeof window !== 'undefined' && typeof window.__cmOpenLoginPrompt === 'function') {
        window.__cmOpenLoginPrompt(toStr, featureTitle);
      }
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <Link 
      to={loggedIn || isDirectLogin ? toStr : '#'} 
      onClick={handleClick} 
      title={title} 
      {...props}
    >
      {children}
    </Link>
  );
}

// District data for Maharashtra Opportunity Map
const districtOpportunities = {
  'pune': {
    name: 'पुणे (Pune)',
    businesses: '१,२४०',
    jobs: '३४०',
    services: '१२५',
    b2b: '४८',
    events: '१७',
    highlight: 'आयटी, ऑटोमोबाईल, शिक्षण, रिअल इस्टेट व मॅन्युफॅक्चरिंग हब'
  },
  'mumbai': {
    name: 'मुंबई (Mumbai MMR)',
    businesses: '२,१८०',
    jobs: '५२०',
    services: '२१०',
    b2b: '८५',
    events: '२९',
    highlight: 'आर्थिक राजधानी, आंतरराष्ट्रीय व्यापार, कॉर्पोरेट व मीडिया'
  },
  'nashik': {
    name: 'नाशिक (Nashik)',
    businesses: '६४०',
    jobs: '११०',
    services: '६५',
    b2b: '२४',
    events: '१२',
    highlight: 'कृषी प्रक्रिया, वाईनरी, फार्मास्युटिकल व ऑटो हब'
  },
  'kolhapur': {
    name: 'कोल्हापूर (Kolhapur)',
    businesses: '५२०',
    jobs: '९५',
    services: '५८',
    b2b: '२२',
    events: '१४',
    highlight: 'फाउंड्री, साखर उद्योग, गूळ, वस्त्रोद्योग व क्रीडा'
  },
  'chhatrapati-sambhajinagar': {
    name: 'छत्रपती संभाजीनगर (Aurangabad)',
    businesses: '४८०',
    jobs: '८२',
    services: '४५',
    b2b: '१९',
    events: '९',
    highlight: 'ऑटो क्लस्टर, पर्यटन राजधानी, फार्मा व मराठवाडा औद्योगिक केंद्र'
  },
  'satara': {
    name: 'सातारा (Satara)',
    businesses: '३२०',
    jobs: '४८',
    services: '३२',
    b2b: '१४',
    events: '८',
    highlight: 'कृषी प्रक्रिया, पर्यटन, संरक्षण दल व सह्याद्री उद्योग'
  },
  'nagpur': {
    name: 'नागपूर (Nagpur)',
    businesses: '४१०',
    jobs: '७५',
    services: '४२',
    b2b: '१६',
    events: '१०',
    highlight: 'लॉजिस्टिक्स हब, मिहान (MIHAN), कृषी व्यापार व विदर्भ केंद्र'
  },
  'solapur': {
    name: 'सोलापूर (Solapur)',
    businesses: '२९०',
    jobs: '४२',
    services: '२८',
    b2b: '११',
    events: '७',
    highlight: 'टेक्सटाईल, चादर व टॉवेल उद्योग, सिमेंट व कृषी'
  }
};

export default function HomePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { getContent } = useSiteContent();

  const [selectedDistrict, setSelectedDistrict] = useState('pune');
  const [ecoTab, setEcoTab] = useState('tab-business');
  const [ecoQuery, setEcoQuery] = useState('');
  const [authRequiredPrompt, setAuthRequiredPrompt] = useState(null);

  // Quick Modal Login States
  const [modalPhone, setModalPhone] = useState('');
  const [modalPass, setModalPass] = useState('');
  const [modalLoginErr, setModalLoginErr] = useState('');
  const [modalLoginLoading, setModalLoginLoading] = useState(false);

  const loggedIn = isUserLoggedIn(user);

  // Expose global prompt trigger so AuthLink or any other click can open the auth prompt modal
  useEffect(() => {
    window.__cmOpenLoginPrompt = (targetUrl, featureTitle) => {
      setAuthRequiredPrompt({
        targetUrl: targetUrl || '/history',
        featureTitle: featureTitle || 'Connect Maratha सुविधा'
      });
    };
    return () => {
      delete window.__cmOpenLoginPrompt;
    };
  }, []);

  // Global click interception: Require login for all internal features/cards/links
  const handleGlobalClickCapture = (e) => {
    if (loggedIn) return;
    if (e.target.closest('[data-auth-prompt]')) return;
    if (e.target.closest('.hero-switcher-chips') || e.target.closest('.district-pill') || e.target.closest('.eco-tabs')) {
      return;
    }

    const anchor = e.target.closest('a');
    const button = e.target.closest('button');
    const standaloneCard = !anchor && !button && (
      e.target.closest('.card-bg') || 
      e.target.closest('.eco-card') || 
      e.target.closest('.opportunity-card') ||
      e.target.closest('[data-portal-action]')
    );

    if (!anchor && !button && !standaloneCard) return;

    const href = anchor ? anchor.getAttribute('href') : null;
    if (href) {
      if (
        href === '/login' ||
        href.startsWith('/login?') ||
        href.startsWith('/login/') ||
        href.startsWith('tel:') ||
        href.startsWith('mailto:') ||
        href.startsWith('http')
      ) {
        return;
      }
      if (href === '#' || href === '') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    e.preventDefault();
    e.stopPropagation();

    const targetUrl = href || (button ? (button.getAttribute('data-target') || '/jobs') : '/jobs');
    const featureTitle = (
      (anchor ? (anchor.getAttribute('title') || anchor.textContent) : (button ? button.textContent : (standaloneCard ? standaloneCard.textContent : 'सुविधा'))) || 'सुविधा'
    ).trim().replace(/\s+/g, ' ').slice(0, 50);

    sessionStorage.setItem('cm_login_redirect', targetUrl);
    setAuthRequiredPrompt({
      targetUrl,
      featureTitle: featureTitle || 'सुविधा'
    });
  };

  const currDistrict = districtOpportunities[selectedDistrict] || districtOpportunities['pune'];

  return (
    <div className="home-page-root" onClickCapture={handleGlobalClickCapture} style={{ background: '#FFFFFF' }}>
      
      {/* 🔐 Informative Security & Access Bar for Non-logged Users */}
      {!loggedIn && (
        <div style={{
          background: 'linear-gradient(90deg, #EA580C 0%, #C2410C 100%)',
          color: '#FFFFFF',
          padding: '10px 16px',
          textAlign: 'center',
          fontSize: '0.86rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          borderBottom: '2px solid #FED7AA',
          position: 'relative',
          zIndex: 50
        }}>
          <span>💼 🚩 नोकरी, व्यवसाय, B2B लीड्स आणि सेवा संधींमध्ये प्रवेशासाठी मोफत सभासद नोंदणी करा किंवा लॉगिन करा.</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AuthLink to="/login" style={{ background: '#FFFFFF', color: '#EA580C', padding: '4px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 900, fontSize: '0.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              लॉगिन करा ➔
            </AuthLink>
            <AuthLink to="/register" style={{ background: '#FFF7ED', color: '#431407', border: '1px solid #FED7AA', padding: '4px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem' }}>
              मोफत नोंदणी
            </AuthLink>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. HERO SECTION — पहिल्याच स्क्रीनवर थेट वैयक्तिक फायदा (Opportunity First)
      ========================================================================= */}
      <section style={{
        position: 'relative',
        background: 'url("/assets/images/hero-cinematic-bg.jpg") center/cover no-repeat',
        borderBottom: '1.5px solid #FED7AA',
        padding: '54px 20px 48px',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative saffron glow */}
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '36px', alignItems: 'center' }}>
          
          {/* Left Column: Direct Value Statement */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 237, 213, 0.92)', border: '1px solid #FDBA74', padding: '6px 14px', borderRadius: '30px', color: '#9A3412', fontSize: '0.84rem', fontWeight: 800, marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <span>🚩</span>
              <span>Connect Maratha • आधुनिक युगातील आधुनिक संघटन</span>
            </div>

            <h1 className="hero-main-title" style={{
              fontSize: 'clamp(1.75rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 900,
              fontFamily: 'Baloo 2, sans-serif',
              color: '#FFFFFF',
              margin: '0 0 16px',
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 22px rgba(0,0,0,0.7)'
            }}>
              तुमच्या प्रगतीसाठी <span style={{ color: '#FFB74D', borderBottom: '4px solid #FF9800', textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>एकच डिजिटल नेटवर्क</span>
            </h1>

            <p className="hero-subtitle" style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.5,
              margin: '0 0 14px',
              textShadow: '0 2px 8px rgba(0,0,0,0.95)'
            }}>
              नोकरी शोधा • व्यवसाय वाढवा • ग्राहक मिळवा • सेवा द्या • B2B कनेक्शन करा • शिकण्याच्या संधी मिळवा • आपल्या समाजाशी जोडा
            </p>

            <p className="hero-desc" style={{
              fontSize: 'clamp(0.92rem, 2vw, 1.02rem)',
              color: '#F8FAFC',
              lineHeight: 1.6,
              margin: '0 0 24px',
              maxWidth: '560px',
              textShadow: '0 1px 6px rgba(0,0,0,0.95)'
            }}>
              <strong style={{ color: '#FEF08A' }}>Connect Maratha म्हणजे फक्त इतिहास पाहण्यासाठीची website नाही</strong> — तुमच्या रोजगार, व्यवसाय, ग्राहक, शिक्षण, सेवा आणि आर्थिक उन्नतीसाठीचे सर्वसमावेशक डिजिटल व्यासपीठ आहे. आजच तुमची Digital Profile तयार करा.
            </p>

            {/* Action Buttons */}
            <div className="hero-action-btns" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '22px' }}>
              <AuthLink
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                  color: '#FFFFFF',
                  padding: '13px 26px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '1.02rem',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🟠</span>
                <span>मोफत Join करा</span>
                <span>➔</span>
              </AuthLink>

              <AuthLink
                to="/jobs"
                style={{
                  background: '#FFFFFF',
                  color: '#EA580C',
                  border: '2px solid #EA580C',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>💼</span>
                <span>नोकरी शोधा</span>
              </AuthLink>

              <AuthLink
                to="/business/directory"
                style={{
                  background: '#FFFFFF',
                  color: '#431407',
                  border: '2px solid #FED7AA',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏢</span>
                <span>व्यवसाय शोधा</span>
              </AuthLink>
            </div>

            {/* Geographic & Functional Breadcrumb Strip */}
            <div className="hero-breadcrumbs" style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#78350F',
              background: '#FFF7ED',
              padding: '10px 14px',
              borderRadius: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              border: '1px solid #FFEDD5',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              <span>📍 <strong>तुमच्या शहरात</strong></span>
              <span>|</span>
              <span>💼 <strong>तुमच्या क्षेत्रात</strong></span>
              <span>|</span>
              <span>🏢 <strong>तुमच्या व्यवसायासाठी</strong></span>
              <span>|</span>
              <span>🎓 <strong>तुमच्या करिअरसाठी</strong></span>
            </div>
          </div>

          {/* Right Column: Live Opportunity Dashboard Preview Box */}
          <div className="hero-preview-box" style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '24px',
            padding: 'clamp(18px, 3.5vw, 28px)',
            boxShadow: '0 20px 45px rgba(234, 88, 12, 0.12)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LIVE OPPORTUNITY RADAR</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontFamily: 'Baloo 2', color: '#431407' }}>
                  आज तुमच्यासाठी काय उपलब्ध आहे?
                </h3>
              </div>
              <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                ● Real-Time
              </span>
            </div>

            <div className="hero-preview-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '14px', marginBottom: '20px' }}>
              {/* Card 1: Jobs */}
              <AuthLink to="/jobs" style={{ textDecoration: 'none', background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <div style={{ height: '95px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-jobs-card.jpg" alt="Active Jobs" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(234, 88, 12, 0.92)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>
                    💼 Jobs Radar
                  </span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#C2410C', lineHeight: 1.1 }}>128+</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginTop: '2px' }}>सक्रिय Jobs (पुणे, मुंबई...)</div>
                </div>
              </AuthLink>

              {/* Card 2: Customer Enquiries */}
              <AuthLink to="/business/directory" style={{ textDecoration: 'none', background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <div style={{ height: '95px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-customers-card.jpg" alt="Customer Enquiries" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(21, 128, 61, 0.92)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>
                    🏢 ग्राहक Enquiries
                  </span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#15803D', lineHeight: 1.1 }}>72+</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginTop: '2px' }}>नवीन ग्राहक मागण्या</div>
                </div>
              </AuthLink>

              {/* Card 3: B2B Leads */}
              <AuthLink to="/sangam" style={{ textDecoration: 'none', background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <div style={{ height: '95px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-b2b-card.jpg" alt="B2B Business Leads" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(194, 65, 12, 0.92)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>
                    🤝 B2B Leads
                  </span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#C2410C', lineHeight: 1.1 }}>46+</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginTop: '2px' }}>B2B बिझनेस Deals</div>
                </div>
              </AuthLink>

              {/* Card 4: Education & Scholarships */}
              <AuthLink to="/jobs" style={{ textDecoration: 'none', background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <div style={{ height: '95px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-education-card.jpg" alt="Scholarships and Courses" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(124, 45, 18, 0.92)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>
                    🎓 Scholarships
                  </span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#7C2D12', lineHeight: 1.1 }}>24+</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginTop: '2px' }}>शिष्यवृत्ती व कोर्सेस</div>
                </div>
              </AuthLink>
            </div>

            <AuthLink
              to="/register"
              style={{
                display: 'block',
                textAlign: 'center',
                background: '#431407',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.94rem',
                textDecoration: 'none'
              }}
            >
              🎯 तुमची Profile तयार करा आणि या संधी मिळवा →
            </AuthLink>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. सर्वात महत्त्वाचे — “मला यातून पैसे कसे मिळतील?” (Income & Earnings Section)
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              REVENUE & EARNING PATHWAYS
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.9rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '6px 0 10px' }}>
              💰 Connect Maratha वर तुम्ही कमवू शकता
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
              रोजगार शोधण्यापासून ते व्यवसायाची विक्री वाढवण्यापर्यंत आणि नेटवर्कद्वारे मानधन मिळवण्यापर्यंत — तीन थेट मार्ग:
            </p>
          </div>

          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '24px' }}>
            
            {/* 1. रोजगार मिळवा */}
            <div style={{
              background: '#FFF7ED',
              border: '2px solid #FFEDD5',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{ position: 'relative', height: '175px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <img
                  src="/assets/images/job-opportunities-banner.jpg"
                  alt="रोजगार व करिअर संधी"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(67, 20, 7, 0.8) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#EA580C', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 900 }}>
                    💼 १२८+ नोकऱ्या उपलब्ध
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>पायरी १ • थेट करिअर</span>
              <h3 style={{ fontSize: '1.45rem', fontFamily: 'Baloo 2', color: '#431407', margin: '4px 0 8px' }}>
                १. रोजगार मिळवा (Jobs)
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '14px' }}>
                तुमच्या कौशल्याला योग्य Job Opportunity शोधा. फ्रेशर्सपासून ते अनुभवी व्यवस्थापकांपर्यंत सर्व क्षेत्रांतील पदे:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {['IT & Software', 'Sales & Marketing', 'Finance & Accounts', 'HR', 'Manufacturing', 'Healthcare', 'Education', 'Tourism', 'Digital Media', 'Govt/Private'].map((tag, idx) => (
                  <span key={idx} style={{ background: '#FFFFFF', border: '1px solid #FED7AA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#78350F' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 'auto' }}>
                <AuthLink to="/jobs" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px' }}>
                  💼 उपलब्ध Jobs पहा (128+) →
                </AuthLink>
              </div>
            </div>

            {/* 2. व्यवसायाला ग्राहक मिळवा */}
            <div style={{
              background: '#FFF7ED',
              border: '2px solid #FFEDD5',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.06)'
            }}>
              <div style={{ position: 'relative', height: '175px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <img
                  src="/assets/images/business-growth-banner.jpg"
                  alt="व्यवसाय वाढ व ग्राहक"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(67, 20, 7, 0.8) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#15803D', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 900 }}>
                    🏢 ७२+ ग्राहक Enquiries
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>पायरी २ • विक्री व ग्राहक</span>
              <h3 style={{ fontSize: '1.45rem', fontFamily: 'Baloo 2', color: '#431407', margin: '4px 0 8px' }}>
                २. तुमच्या व्यवसायाला ग्राहक मिळवा
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '12px' }}>
                तुमचा व्यवसाय Connect Maratha Business Directory मध्ये list करा. राज्यभरातील लाखो सदस्य आणि कॉर्पोरेट्स तुम्हाला थेट शोधू शकतात:
              </p>
              
              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FED7AA', marginBottom: '16px', fontSize: '0.84rem' }}>
                <div style={{ marginBottom: '4px', color: '#1E293B' }}>📍 <strong>Pune</strong> → Interior Designer → Verified Businesses</div>
                <div style={{ marginBottom: '4px', color: '#1E293B' }}>📍 <strong>Nashik</strong> → CA / Tax Expert → Verified Professionals</div>
                <div style={{ color: '#1E293B' }}>📍 <strong>Mumbai</strong> → Industrial Manufacturer → B2B Supply</div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <AuthLink to="/leads" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px' }}>
                  🏢 ग्राहक Leads व Enquiries पहा →
                </AuthLink>
              </div>
            </div>

            {/* 3. Referral मधून कमाई */}
            <div style={{
              background: '#FFF7ED',
              border: '2px solid #FFEDD5',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.06)'
            }}>
              <div style={{ position: 'relative', height: '175px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <img
                  src="/assets/images/referral-rewards-banner.jpg"
                  alt="Referral मानधन व पारितोषिक"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(67, 20, 7, 0.8) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#C2410C', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 900 }}>
                    🎁 थेट मानधन व पात्रता गुण
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>पायरी ३ • नेटवर्कचा फायदा</span>
              <h3 style={{ fontSize: '1.45rem', fontFamily: 'Baloo 2', color: '#431407', margin: '4px 0 8px' }}>
                ३. Referral मधून सन्मान व कमाई
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '12px' }}>
                तुमचा वैयक्तिक Referral Link आप्तेष्ट, मित्र आणि व्यावसायिक भागीदारांना शेअर करा. संघटनात्मक नियमांनुसार मानधन व पारितोषिक मिळवा:
              </p>

              {/* Referral diagram */}
              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FED7AA', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#EA580C', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <span>तुम्ही</span>
                  <span>➔</span>
                  <span>मित्र / ग्राहक</span>
                  <span>➔</span>
                  <span>Connect Maratha</span>
                </div>
                <div style={{ margin: '4px 0', fontSize: '0.74rem', color: '#64748B' }}>↓ यशस्वी नोंदणी व पडताळणी</div>
                <div style={{ background: '#DCFCE7', color: '#166534', padding: '4px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                  🎁 अधिकृत मानधन व पात्रता गुण
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <AuthLink to="/referrals" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px' }}>
                  🔗 माझा Referral Link व मानधन केंद्र →
                </AuthLink>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
      {/* =========================================================================
          3. “तुमच्यासाठी काय?” — Personal Opportunity Finder
      ========================================================================= */}
      <section style={{
        padding: '70px 20px',
        position: 'relative',
        background: '#FFFFFF',
        borderTop: '2px solid #FED7AA',
        borderBottom: '2px solid #FED7AA'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ textAlign: 'center', marginBottom: '38px' }}>
            <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              PERSONAL OPPORTUNITY FINDER
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '6px 0 10px' }}>
              🎯 तुमची गरज निवडा — एका क्लिकवर थेट संधी!
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.02rem', maxWidth: '640px', margin: '0 auto', fontWeight: 600 }}>
              तुम्हाला नेमके काय हवे आहे? खालील पर्यायावर क्लिक करा आणि तुमच्या आवडीच्या दालनात थेट पोहोचा:
            </p>
          </div>

          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: '18px' }}>
            {[
              {
                need: 'नोकरी हवी आहे (Job Search)',
                dest: 'Jobs & Employment Hub',
                link: '/jobs',
                image: '/assets/images/radar-jobs-card.jpg',
                badge: '128+ Jobs',
                badgeColor: '#EA580C'
              },
              {
                need: 'नवीन व्यवसाय सुरू / वाढवायचा आहे',
                dest: 'Business Directory & Listing',
                link: '/business/directory',
                image: '/assets/images/b2b-industrial-network.jpg',
                badge: 'B2B Listing',
                badgeColor: '#C2410C'
              },
              {
                need: 'नवीन ग्राहक हवे आहेत',
                dest: 'Business Promotion Network',
                link: '/leads',
                image: '/assets/images/radar-customers-card.jpg',
                badge: '72+ Leads',
                badgeColor: '#15803D'
              },
              {
                need: 'B2B नेटवर्किंग व भागीदारी',
                dest: 'Business Sangam Chapters',
                link: '/sangam',
                image: '/assets/images/sangam-business-meet.jpg',
                badge: 'BNI-Style',
                badgeColor: '#7C2D12'
              },
              {
                need: 'उत्पन्नाची अतिरिक्त संधी',
                dest: 'Referral & Business Leads',
                link: '/referrals',
                image: '/assets/images/referral-rewards-banner.jpg',
                badge: '९ Bands',
                badgeColor: '#EA580C'
              },
              {
                need: 'उच्च शिक्षण व शिष्यवृत्ती',
                dest: 'Courses & Scholarships',
                link: '/jobs',
                image: '/assets/images/student-career-launchpad.jpg',
                badge: 'Scholarships',
                badgeColor: '#16A34A'
              },
              {
                need: 'व्यावसायिक सेवा हवी किंवा द्यायची आहे',
                dest: 'Professional Services',
                link: '/jobs',
                image: '/assets/images/service-architect-design.jpg',
                badge: 'Services',
                badgeColor: '#0284C7'
              },
              {
                need: 'निवास, हॉटेल्स व गडकोट पर्यटन',
                dest: 'Hotels & Tourism Ecosystem',
                link: '/forts',
                image: '/assets/images/real-travel-trekkers.jpg',
                badge: 'Tourism',
                badgeColor: '#D97706'
              },
              {
                need: 'फ्रीलान्स काम हवे आहे',
                dest: 'Professional Freelance Network',
                link: '/jobs',
                image: '/assets/images/campus-it-datascience.jpg',
                badge: 'Freelance',
                badgeColor: '#6366F1'
              },
              {
                need: 'स्टार्टअपसाठी मार्गदर्शन व मेंटॉर्स',
                dest: 'Startup Mentors & Capital',
                link: '/sangam',
                image: '/assets/images/state-network-leadership-meeting.jpg',
                badge: 'Mentorship',
                badgeColor: '#9333EA'
              },
              {
                need: 'व्यवसायाची जाहिरात करायची आहे',
                dest: 'Digital Brand Promotion',
                link: '/business/directory',
                image: '/assets/images/women-entrepreneurs-banner.jpg',
                badge: 'Brand Ads',
                badgeColor: '#E11D48'
              },
              {
                need: 'समाजासाठी योगदान / सेवा करायची आहे',
                dest: 'Seva & Helpdesk Desk',
                link: '/community',
                image: '/assets/images/seva.jpg',
                badge: 'Seva Help',
                badgeColor: '#DC2626'
              }
            ].map((item, idx) => (
              <AuthLink
                key={idx}
                to={item.link}
                style={{
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #FED7AA',
                  boxShadow: '0 4px 14px rgba(67, 20, 7, 0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.need}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: item.badgeColor,
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EA580C', marginBottom: '2px' }}>
                    मला हवे आहे:
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: '#0F172A', display: 'block', margin: '0 0 6px', lineHeight: 1.3, fontWeight: 800 }}>
                    {item.need}
                  </strong>
                  <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                    ➔ {item.dest}
                  </div>
                </div>
              </AuthLink>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. 🔥 “आजच्या संधी” Section (Live Job & B2B Feed)
      ========================================================================= */}
      <section style={{
        padding: '64px 20px',
        position: 'relative',
        background: '#FFF7ED',
        borderTop: '1px solid #FED7AA',
        borderBottom: '1px solid #FED7AA'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <div>
              <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                LIVE DAILY RADAR
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.6vw, 2.6rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '4px 0' }}>
                🔥 आजच्या ताज्या संधी (Today's Opportunities)
              </h2>
              <p style={{ color: '#64748B', fontSize: '1rem', margin: 0, fontWeight: 600 }}>
                दररोज अपडेट होणाऱ्या खात्रीशीर नोकऱ्या आणि व्यावसायिक संधी:
              </p>
            </div>
            <AuthLink to="/jobs" className="btn btn-primary" style={{ padding: '10px 22px' }}>
              सर्व 128+ Jobs पहा ➔
            </AuthLink>
          </div>

          {/* Job cards grid */}
          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: '20px' }}>
            {[
              { 
                title: 'Full Stack Web Developer', 
                loc: 'पुणे (Pune / Hybrid)', 
                type: 'Full Time', 
                exp: '२-४ वर्षे अनुभव', 
                field: 'IT & Software', 
                sal: '₹६ - १० लाख / वर्ष',
                image: '/assets/images/job-radar-dev.jpg',
                alt: 'Full Stack Web Developer Pune'
              },
              { 
                title: 'Corporate Sales Executive', 
                loc: 'मुंबई (Mumbai MMR)', 
                type: 'Full Time', 
                exp: '१-३ वर्षे अनुभव', 
                field: 'B2B Sales', 
                sal: '₹४ - ७ लाख + Incentives',
                image: '/assets/images/job-radar-sales.jpg',
                alt: 'Corporate Sales Executive Mumbai'
              },
              { 
                title: 'Senior Accountant & GST Lead', 
                loc: 'नाशिक (Nashik)', 
                type: 'Full Time', 
                exp: '३+ वर्षे अनुभव', 
                field: 'Finance & Accounts', 
                sal: '₹३.५ - ५ लाख',
                image: '/assets/images/job-radar-finance.jpg',
                alt: 'Senior Accountant & GST Lead Nashik'
              },
              { 
                title: 'Digital Marketing Specialist', 
                loc: 'कोल्हापूर (Kolhapur)', 
                type: 'Full Time', 
                exp: '१-२ वर्षे अनुभव', 
                field: 'Marketing & SEO', 
                sal: '₹३ - ४.५ लाख',
                image: '/assets/images/job-radar-marketing.jpg',
                alt: 'Digital Marketing Specialist Kolhapur'
              }
            ].map((job, idx) => (
              <div key={idx} style={{
                background: '#FFFFFF',
                border: '1.5px solid #FED7AA',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(234, 88, 12, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(234, 88, 12, 0.08)';
              }}>
                {/* Photo Header with Badges */}
                <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
                  <img
                    src={job.image}
                    alt={job.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      background: 'rgba(255, 237, 213, 0.95)',
                      color: '#9A3412',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
                    }}>
                      {job.field}
                    </span>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.92)',
                      fontSize: '0.74rem',
                      color: '#16A34A',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
                    }}>
                      ● Active
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '1.2rem', fontFamily: 'Baloo 2', color: '#431407', margin: '0 0 8px', fontWeight: 800, lineHeight: 1.3 }}>
                    {job.title}
                  </h4>
                  <div style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>📍 {job.loc}</div>
                  <div style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '14px' }}>⏳ {job.exp} • {job.type}</div>
                  <div style={{
                    background: '#FFF7ED',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #FFEDD5',
                    fontWeight: 800,
                    color: '#C2410C',
                    fontSize: '0.9rem',
                    marginBottom: '16px'
                  }}>
                    💰 {job.sal}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <AuthLink to="/jobs" style={{
                      display: 'block',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                      color: '#FFFFFF',
                      padding: '10px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      boxShadow: '0 3px 10px rgba(234, 88, 12, 0.25)'
                    }}>
                      अर्ज करा (Apply Now) ➔
                    </AuthLink>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. 💼 “तुम्ही Business करता का?” — Grow Your Business Conversion Block
      ========================================================================= */}
      <section style={{
        padding: '64px 20px',
        position: 'relative',
        background: 'linear-gradient(135deg, #1C0A04 0%, #2D1106 50%, #150803 100%)',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#FDBA74', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              BUSINESS ACCELERATOR & INDUSTRIAL NETWORK
            </span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4vw, 3rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#FFFFFF', margin: '6px 0 12px' }}>
              तुमचा व्यवसाय Connect Maratha वर वाढवा
            </h2>
            <p style={{ color: '#FFEDD5', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto', fontWeight: 600 }}>
              एक प्रोफाइल ➔ हजारो संभाव्य ग्राहक ➔ B2B कनेक्शन्स ➔ खात्रीशीर रेफरल्स ➔ थेट इन्क्वायरीज
            </p>
          </div>

          {/* Industrial Showcase Banner Poster */}
          <div className="b2b-showcase-poster" style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '36px',
            border: '2px solid rgba(254, 215, 170, 0.4)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
            minHeight: '230px'
          }}>
            <img
              src="/assets/images/b2b-banner-showcase.jpg"
              alt="Maharashtra MIDC Industrial & Automation Hub"
              className="b2b-showcase-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '230px' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(31, 10, 2, 0.94) 0%, rgba(67, 20, 7, 0.72) 58%, rgba(0,0,0,0.2) 100%)' }} />
            <div className="b2b-showcase-overlay" style={{ position: 'absolute', inset: 0, padding: '26px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '640px' }}>
              <span style={{ background: '#EA580C', color: '#FFF', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900, alignSelf: 'flex-start', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                ⚙️ चाकण, भोसरी, तळोजा, रांजणगाव, वाळूज MIDC
              </span>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontFamily: 'Baloo 2', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25 }}>
                लघुउद्योग ते मॅन्युफॅक्चरिंग — B2B सप्लाय चेन
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#FED7AA', lineHeight: 1.45 }}>
                कच्चा माल पुरवठादार, सीएनसी मशीन्स, ऑटोमेशन आणि स्थानिक उत्पादकांना राज्यव्यापी ग्राहक मिळवून देणारे मराठा उद्योग व्यासपीठ.
              </p>
            </div>
          </div>

          {/* 6 Rich B2B Feature Photo Cards */}
          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: '20px', marginBottom: '40px' }}>
            {[
              {
                icon: '🔍',
                image: '/assets/images/b2b-feat-listing.jpg',
                title: 'Google-like Business Listing',
                desc: 'शहर, तालुका व कॅटेगरीनुसार ग्राहक तुम्हाला थेट शोधू शकतात.'
              },
              {
                icon: '📱',
                image: '/assets/images/b2b-feat-whatsapp.jpg',
                title: 'WhatsApp व Direct Call',
                desc: 'ग्राहकांकडून थेट तुमच्या मोबाईलवर किंवा दुकानावर संपर्क.'
              },
              {
                icon: '🛍️',
                image: '/assets/images/b2b-feat-products.jpg',
                title: 'Products & Services Showcase',
                desc: 'तुमच्या वस्तू व सेवांचे फोटो, माहिती व किंमतींचे डिजिटल दालन.'
              },
              {
                icon: '💬',
                image: '/assets/images/b2b-feat-reviews.jpg',
                title: 'Customer Enquiries & Reviews',
                desc: 'पडताळणी झालेले ग्राहक अभिप्राय आणि थेट व्यवसाय लीड्स.'
              },
              {
                icon: '🤝',
                image: '/assets/images/b2b-feat-leads.jpg',
                title: 'Verified B2B Leads',
                desc: 'इतर व्यावसायिकांशी कच्चा माल, पुरवठा आणि कंत्राटांसाठी थेट संवाद.'
              },
              {
                icon: '📊',
                image: '/assets/images/b2b-feat-growth.jpg',
                title: 'Monthly Growth Tracking',
                desc: 'तुमच्या प्रोफाईलला किती ग्राहकांनी पाहिले व संपर्क केला याची आकडेवारी.'
              }
            ].map((feat, idx) => (
              <div key={idx} style={{
                background: 'rgba(31, 10, 2, 0.78)',
                border: '1.5px solid rgba(254, 215, 170, 0.28)',
                borderRadius: '16px',
                overflow: 'hidden',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#FDBA74';
                e.currentTarget.style.boxShadow = '0 10px 26px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(254, 215, 170, 0.28)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
              }}>
                <div style={{ position: 'relative', height: '130px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={feat.image}
                    alt={feat.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(31,10,2,0.85) 100%)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '12px',
                    fontSize: '1.3rem',
                    background: 'rgba(254, 215, 170, 0.25)',
                    backdropFilter: 'blur(6px)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(254, 215, 170, 0.45)'
                  }}>
                    {feat.icon}
                  </div>
                </div>
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '1.14rem', fontFamily: 'Baloo 2', color: '#FED7AA', margin: '0 0 6px', fontWeight: 800 }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#F1F5F9', margin: 0, lineHeight: 1.45, opacity: 0.92 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <AuthLink
              to="/business/directory"
              style={{
                background: '#EA580C',
                color: '#FFFFFF',
                padding: '16px 36px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1.15rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}
            >
              <span>🏢</span>
              <span>माझा व्यवसाय जोडूया (List Business Free) ➔</span>
            </AuthLink>
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. 🤝 Business Sangam — BNI-style Referral Chapters
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              BNI-STYLE EMPOWERMENT CHAPTERS
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '6px 0 10px' }}>
              🤝 Business Sangam — एकमेकांना ग्राहक देणारे व्यवसायिकांचे नेटवर्क
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.02rem', maxWidth: '680px', margin: '0 auto 28px' }}>
              फक्त डिरेक्टरी नाही — तर साप्ताहिकी बैठका, 1-to-1 संभाषण आणि परस्पर रेफरल द्वारे व्यवसायाची मोठी देवाणघेवाण!
            </p>
          </div>

          {/* Business Sangam Chapter Meeting Visual Banner */}
          {/* Business Sangam Chapter Meeting Visual Banner */}
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            minHeight: '260px',
            marginBottom: '32px',
            boxShadow: '0 10px 30px rgba(67, 20, 7, 0.18)',
            border: '2px solid #FED7AA'
          }}>
            <img
              src="/assets/images/sangam-banner-hero.jpg"
              alt="Business Sangam Chapter Meeting Pune"
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '260px' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(67, 20, 7, 0.25) 0%, rgba(67, 20, 7, 0.88) 100%)' }} />
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '28px',
              right: '28px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span style={{ background: '#EA580C', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                  🤝 BNI-STYLE MARATHA BUSINESS CHAPTERS
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '1.5rem', fontFamily: 'Baloo 2', fontWeight: 900 }}>
                  साप्ताहिक बिझनेस संगम — उद्योजकांचे थेट नेटवर्किंग
                </h3>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#FED7AA' }}>
                  पुणे, मुंबई, नाशिक, कोल्हापूर, छत्रपती संभाजीनगरमधील अधिकृत चॅप्टर्स
                </p>
              </div>
              <AuthLink to="/sangam" style={{ background: '#FFFFFF', color: '#431407', padding: '12px 24px', borderRadius: '10px', fontWeight: 900, textDecoration: 'none', fontSize: '0.92rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                चॅप्टर शोधा / सभासद व्हा ➔
              </AuthLink>
            </div>
          </div>

          {/* 6 Professions Business Synergy Loop with Images */}
          <div style={{ background: '#FFF7ED', border: '2px solid #FED7AA', borderRadius: '20px', padding: '26px 20px', marginBottom: '36px', boxShadow: '0 6px 20px rgba(234, 88, 12, 0.06)' }}>
            <div style={{ textAlign: 'center', fontWeight: 900, color: '#9A3412', marginBottom: '18px', fontSize: '1rem', fontFamily: 'Baloo 2' }}>
              💡 उदा. एकाच नेटवर्कमधील उद्योजक कसे एकमेकांना व्यवसाय देतात (Cross-Industry Referral Chain):
            </div>
            <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', alignItems: 'center' }}>
              {[
                { title: 'Architect', role: 'प्लॅनिंग व डिझाइन', img: '/assets/images/sangam-syn-architect.jpg', step: '१' },
                { title: 'Builder', role: 'कन्स्ट्रक्शन व प्रकल्प', img: '/assets/images/sangam-syn-builder.jpg', step: '२' },
                { title: 'Interior Designer', role: 'इंटीरियर व सजावट', img: '/assets/images/sangam-syn-interior.jpg', step: '३' },
                { title: 'Electrician', role: 'इलेक्ट्रिकल वायरिंग', img: '/assets/images/sangam-syn-electrician.jpg', step: '४' },
                { title: 'Furniture Maker', role: 'फर्निचर व वूडवर्क', img: '/assets/images/sangam-syn-furniture.jpg', step: '५' },
                { title: 'Home Loan Consultant', role: 'गृहकर्ज सल्लागार', img: '/assets/images/sangam-syn-loan.jpg', step: '६' }
              ].map((syn, sIdx) => (
                <div key={sIdx} style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #FED7AA',
                  overflow: 'hidden',
                  textAlign: 'center',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.05)';
                }}>
                  <div style={{ height: '90px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img src={syn.img} alt={syn.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '6px', left: '6px', background: '#EA580C', color: '#FFF', width: '22px', height: '22px', borderRadius: '50%', fontSize: '0.72rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {syn.step}
                    </span>
                  </div>
                  <div style={{ padding: '8px 6px' }}>
                    <div style={{ fontWeight: 800, color: '#431407', fontSize: '0.88rem' }}>{syn.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9A3412', fontWeight: 600 }}>{syn.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Sangam Pillar Cards with Rich Visuals */}
          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px', marginBottom: '32px' }}>
            {[
              {
                title: 'साप्ताहिक बिझनेस बैठका',
                subtitle: 'Weekly business meetings',
                desc: 'तुमच्या क्षेत्रातील इतर उद्योजकांशी दर आठवड्याला भेटून व्यवसायाची चर्चा करा.',
                img: '/assets/images/sangam-card-meeting.jpg',
                icon: '🗓️'
              },
              {
                title: 'कॅटेगरी एक्सक्लुझिव्हिटी',
                subtitle: 'Category Exclusivity',
                desc: 'एका चॅप्टरमध्ये एका व्यवसायाचा एकच अधिकृत प्रतिनिधी — शून्य स्पर्धा!',
                img: '/assets/images/sangam-card-exclusivity.jpg',
                icon: '🏆'
              },
              {
                title: '1-to-1 व्यवसाय संभाषण',
                subtitle: '1-to-1 business conversation',
                desc: 'दुसऱ्या उद्योजकाची सेवा सखोल समजून घेऊन त्यांना योग्य ग्राहक मिळवून द्या.',
                img: '/assets/images/sangam-card-1to1.jpg',
                icon: '🤝'
              },
              {
                title: 'क्लोज्ड बिझनेस ट्रॅकिंग',
                subtitle: 'Closed Business Tracking',
                desc: 'रेफरल मधून प्रत्यक्षात किती रुपयांचा व्यवसाय झाला याचे पारदर्शक मूल्यमापन.',
                img: '/assets/images/sangam-card-tracking.jpg',
                icon: '📈'
              }
            ].map((pCard, pIdx) => (
              <div key={pIdx} style={{
                border: '1.5px solid #FED7AA',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(234, 88, 12, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.06)';
              }}>
                <div style={{ position: 'relative', height: '120px', width: '100%', overflow: 'hidden' }}>
                  <img src={pCard.img} alt={pCard.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(67, 20, 7, 0.6) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '1.25rem', background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '8px' }}>
                    {pCard.icon}
                  </div>
                </div>
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontFamily: 'Baloo 2', fontSize: '1.16rem', color: '#431407', margin: '0 0 2px', fontWeight: 800 }}>
                    {pCard.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 700, marginBottom: '6px' }}>
                    {pCard.subtitle}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    {pCard.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <AuthLink to="/sangam" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
              Business Sangam मध्ये Join व्हा ➔
            </AuthLink>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. 🧑‍💼 “तुमचे कौशल्य विकता का?” — Skill Monetization
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: '#FFF7ED', borderTop: '1px solid #FED7AA', borderBottom: '1px solid #FED7AA' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              MONETIZE YOUR EXPERTISE
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '6px 0 10px' }}>
              🧑‍💼 तुमचे Skill → तुमची कमाई!
            </h2>
            <p style={{ color: '#78350F', fontSize: '1.02rem', maxWidth: '640px', margin: '0 auto' }}>
              तुमचे Professional Profile तयार करा आणि हजारो लोकांकडून थेट Service Enquiries व ग्राहक मिळवा.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {[
              { role: 'Developer', icon: '💻', image: '/assets/images/prof-developer.jpg', desc: 'वेब व सॉफ्टवेअर' },
              { role: 'Photographer', icon: '📸', image: '/assets/images/prof-photographer.jpg', desc: 'इव्हेंट व पोर्ट्रेट' },
              { role: 'Lawyer / वकील', icon: '⚖️', image: '/assets/images/prof-lawyer.jpg', desc: 'कायदेशीर सल्ला' },
              { role: 'CA / कर सल्लागार', icon: '📊', image: '/assets/images/prof-ca.jpg', desc: 'टॅक्स व अकौंट्स' },
              { role: 'Interior Designer', icon: '🎨', image: '/assets/images/prof-interior.jpg', desc: 'होम व कमर्शियल' },
              { role: 'Electrician / प्लंबर', icon: '🔧', image: '/assets/images/prof-electrician.jpg', desc: 'मेंटेनन्स सेवा' },
              { role: 'Civil Contractor', icon: '🏗️', image: '/assets/images/prof-civil.jpg', desc: 'बांधकाम प्रकल्प' },
              { role: 'Driver / वाहन', icon: '🚗', image: '/assets/images/prof-driver.jpg', desc: 'ट्रॅव्हल्स व ट्रान्सपोर्ट' },
              { role: 'शिक्षक / प्राध्यापक', icon: '📚', image: '/assets/images/prof-teacher.jpg', desc: 'कोचिंग व मार्गदर्शन' },
              { role: 'Digital Marketer', icon: '📱', image: '/assets/images/prof-marketer.jpg', desc: 'सोशल मीडिया व ॲड्स' },
              { role: 'Videographer', icon: '📹', image: '/assets/images/prof-videographer.jpg', desc: 'शूटिंग व एडिटिंग' },
              { role: 'Trek Guide / दुर्गमित्र', icon: '🥾', image: '/assets/images/prof-trek-guide.jpg', desc: 'सह्याद्री मोहीम' }
            ].map((sk, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  textAlign: 'center',
                  border: '1.5px solid #FED7AA',
                  boxShadow: '0 3px 12px rgba(234, 88, 12, 0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(234, 88, 12, 0.16)';
                  e.currentTarget.style.borderColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(234, 88, 12, 0.06)';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
              >
                <div style={{ position: 'relative', height: '105px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={sk.image}
                    alt={sk.role}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(67, 20, 7, 0.6) 100%)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    fontSize: '1.15rem',
                    background: 'rgba(255, 255, 255, 0.92)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {sk.icon}
                  </div>
                </div>
                <div style={{ padding: '10px 8px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#431407', fontSize: '0.92rem', fontFamily: 'Baloo 2', lineHeight: 1.25, marginBottom: '2px' }}>
                    {sk.role}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 700 }}>
                    {sk.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <AuthLink to="/register" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Professional Profile तयार करा ➔
            </AuthLink>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. 👨‍🎓 Student Zone — विद्यार्थ्यांसाठी स्वतंत्र फायदा
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '32px', alignItems: 'flex-start' }}>
            <div>
              {/* Student Launchpad Banner */}
              <div style={{ position: 'relative', height: '175px', borderRadius: '16px', overflow: 'hidden', marginBottom: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
                <img
                  src="/assets/images/student-career-launchpad.jpg"
                  alt="Student & Career Launchpad"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(67, 20, 7, 0.85) 100%)' }} />
                <span style={{ position: 'absolute', bottom: '12px', left: '14px', background: '#EA580C', color: '#FFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 900 }}>
                  🎓 उच्च शिक्षण, स्पर्धा परीक्षा व शिष्यवृत्ती
                </span>
              </div>

              <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                STUDENT & YOUTH LAUNCHPAD
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '6px 0 14px' }}>
                👨‍🎓 Student Zone — आजचा विद्यार्थी ➔ उद्याचा यशस्वी Professional
              </h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '22px' }}>
                उच्च शिक्षण, शिष्यवृत्ती, स्पर्धा परीक्षा, मोफत रेझ्युमे बिल्डर आणि नामांकित कंपन्यांमध्ये नोकरीच्या थेट संधी:
              </p>

              <div className="student-mini-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', marginBottom: '24px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                  🎓 शिष्यवृत्ती शोध (Scholarships)
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                  📚 MPSC / UPSC / स्पर्धा परीक्षा
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                  💼 फ्रेशर्स Jobs व Internships
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                  🧑‍🏫 तज्ज्ञ IAS/IPS मेंटॉरशिप
                </div>
              </div>

              <AuthLink to="/jobs" className="btn btn-primary" style={{ padding: '12px 26px' }}>
                माझे Career Profile बनवा ➔
              </AuthLink>
            </div>

            {/* Right side: Women entrepreneur highlight */}
            <div style={{ background: '#FFF1F2', border: '2px solid #FECDD3', borderRadius: '24px', padding: '24px' }}>
              <div style={{ position: 'relative', height: '175px', borderRadius: '16px', overflow: 'hidden', marginBottom: '18px', boxShadow: '0 4px 14px rgba(190, 18, 60, 0.15)' }}>
                <img
                  src="/assets/images/women-entrepreneurs-banner.jpg"
                  alt="Women Entrepreneurs"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(136, 19, 55, 0.85) 100%)' }} />
                <span style={{ position: 'absolute', bottom: '12px', left: '14px', background: '#BE123C', color: '#FFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 900 }}>
                  👩‍💼 स्वदेशी शक्ती • महिला उद्योग व बचत गट
                </span>
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>WOMEN EMPOWERMENT</span>
              <h3 style={{ fontSize: '1.6rem', fontFamily: 'Baloo 2', color: '#881337', margin: '4px 0 10px' }}>
                महिला उद्योजकांसाठी विशेष नेटवर्क
              </h3>
              <p style={{ color: '#4C0519', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '18px' }}>
                गृहउद्योग, बचत गट, व्यावसायिक महिला, आणि स्टार्टअप्स यांच्यासाठी विशेष ग्राहक वर्ग, भांडवली माहिती आणि राज्यस्तरीय प्रदर्शने:
              </p>
              <ul style={{ paddingLeft: '20px', margin: '0 0 20px', color: '#9F1239', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <li>महिला व्यवसाय मोफत लिस्टिंग</li>
                <li>महिला B2B नेटवर्किंग व थेट ग्राहक</li>
                <li>शासकीय अनुदान व निधी माहिती</li>
                <li>प्रशिक्षण व तज्ज्ञ मेंटॉरशिप</li>
              </ul>
              <AuthLink to="/women-empowerment" style={{ display: 'block', textAlign: 'center', background: '#E11D48', color: '#FFFFFF', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '0.92rem' }}>
                महिला व्यवसाय नेटवर्कमध्ये सहभागी व्हा ➔
              </AuthLink>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          11. 🌍 Maharashtra Opportunity Map (Interactive District Breakdown)
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              GEOGRAPHIC OPPORTUNITY NETWORK
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px' }}>
              🌍 महाराष्ट्राचा Opportunity Map
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', margin: 0 }}>
              खालील जिल्हा निवडा आणि तुमच्या भागातील नोकऱ्या, व्यवसाय व सेवांचे ताजे आकडे पाहा:
            </p>
          </div>

          {/* District selector pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
            {Object.keys(districtOpportunities).map((key) => {
              const d = districtOpportunities[key];
              const isSelected = selectedDistrict === key;
              return (
                <button
                  key={key}
                  type="button"
                  className="district-pill"
                  onClick={() => setSelectedDistrict(key)}
                  style={{
                    background: isSelected ? '#EA580C' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    border: isSelected ? '1.5px solid #EA580C' : '1.5px solid #CBD5E1',
                    borderRadius: '24px',
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          {/* District details card */}
          <div style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'Baloo 2', color: '#431407', margin: 0 }}>
                  📍 {currDistrict.name}
                </h3>
                <span style={{ fontSize: '0.86rem', color: '#64748B' }}>{currDistrict.highlight}</span>
              </div>
              <AuthLink to={`/business/directory?city=${selectedDistrict}`} className="btn btn-outline" style={{ color: '#EA580C', borderColor: '#EA580C', fontSize: '0.85rem' }}>
                या जिल्ह्यातील सर्व सूची पाहा ➔
              </AuthLink>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>{currDistrict.businesses}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#78350F' }}>🏢 नोंदणीकृत व्यवसाय</div>
              </div>
              <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>{currDistrict.jobs}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#78350F' }}>💼 उपलब्ध Jobs</div>
              </div>
              <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>{currDistrict.services}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#78350F' }}>🛠️ व्यावसायिक सेवा</div>
              </div>
              <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>{currDistrict.b2b}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#78350F' }}>🤝 B2B Leads</div>
              </div>
              <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>{currDistrict.events}</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#78350F' }}>📅 इव्हेंट्स व मेळावे</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          13. 🛠️ “आज कोणाला काय हवे आहे?” (Live Urgent Enquiries Feed)
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <div>
              <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                DIRECT CLIENT DEMAND
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.6vw, 2.6rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '4px 0' }}>
                🔥 आज कोणाला काय हवे आहे? (Live Urgent Enquiries)
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.98rem', margin: 0 }}>
                ग्राहकांकडून थेट नोंदवलेल्या गरजा — व्यावसायिक त्वरित प्रतिसाद देऊ शकतात:
              </p>
            </div>
            <AuthLink to="/business/directory" className="btn btn-outline" style={{ color: '#EA580C', borderColor: '#EA580C' }}>
              सर्व Enquiries पहा (72+) ➔
            </AuthLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              { image: '/assets/images/service-architect-design.jpg', loc: 'पुणे (Pune)', title: 'Interior Designer हवा', desc: '३ BHK फ्लॅटचे पूर्ण इंटेरियर काम. बजेट: ₹१५ ते २० लाख.' },
              { image: '/assets/images/job-opportunities-banner.jpg', loc: 'मुंबई (Mumbai)', title: 'E-commerce Website Developer हवा', desc: 'कपड्यांच्या ब्रँडसाठी पेमेंट गेटवे सज्ज पोर्टल.' },
              { image: '/assets/images/real-paschim-lavani-stage.jpg', loc: 'नाशिक (Nashik)', title: 'Wedding Photographer & Drone Team', desc: 'दोन दिवसीय पारंपरिक विवाह सोहळ्याचे पूर्ण कव्हरेज.' },
              { image: '/assets/images/service-legal-advocate.jpg', loc: 'कोल्हापूर (Kolhapur)', title: 'GST & Legal Consultant हवा', desc: 'मॅन्युफॅक्चरिंग युनिटचे ऑडिट व जीएसटी अनुपालन.' },
              { image: '/assets/images/business-growth-banner.jpg', loc: 'सातारा (Satara)', title: 'कृषी मालासाठी Transport Partner', desc: 'साताऱ्यातून मुंबई-पुणे भाजीपाला व धान्य वाहतूक.' },
              { image: '/assets/images/b2b-industrial-network.jpg', loc: 'पुणे (Pune)', title: 'Civil Contractor हवा', desc: 'कमर्शियल गोडाऊन बांधकामासाठी अनुभवी कंत्राटदार.' }
            ].map((enq, idx) => (
              <div key={idx} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
                  <img src={enq.image} alt={enq.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(67, 20, 7, 0.7) 100%)' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '10px', background: '#FFEDD5', color: '#9A3412', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                    📍 {enq.loc}
                  </span>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '1.12rem', fontFamily: 'Baloo 2', color: '#431407', margin: '0 0 6px' }}>
                    {enq.title}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
                    {enq.desc}
                  </p>
                  <div style={{ marginTop: 'auto' }}>
                    <AuthLink to="/business/directory" style={{ color: '#EA580C', fontWeight: 800, fontSize: '0.84rem', textDecoration: 'none' }}>
                      कोटेशन पाठवा / संपर्क करा ➔
                    </AuthLink>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          14. 🎁 Login Retention Hook — “My Opportunity Dashboard” Preview
      ========================================================================= */}
      <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ color: '#FDBA74', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
            DAILY RETENTION ENGINE
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#FFFFFF', margin: '6px 0 14px' }}>
            👤 Login केल्यानंतर तुमचा वैयक्तिक "Opportunity Dashboard"
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: '0 0 32px' }}>
            दररोज सकाळी login करा आणि तुमच्या कौशल्य, व्यवसाय आणि शहरानुसार थेट मॅच झालेल्या संधी पाहा:
          </p>

          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '20px', padding: '28px', textAlign: 'left', maxWidth: '640px', margin: '0 auto 32px', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '14px', fontWeight: 800, color: '#FDBA74' }}>
              <span>संधी प्रकार (Opportunity Category)</span>
              <span>आजच्या संधी (Live)</span>
            </div>
            {[
              { label: '💼 Jobs matching your skills', count: '12 नवीन' },
              { label: '🤝 B2B Opportunities in your sector', count: '5 नवीन' },
              { label: '🏢 Customer Enquiries for your service', count: '3 नवीन' },
              { label: '🎓 Education & Scholarships', count: '4 नवीन' },
              { label: '🛠️ Service Leads in your city', count: '7 नवीन' },
              { label: '🔗 Referral & Reward Opportunities', count: '8 उपलब्ध' },
              { label: '📅 Upcoming Business & Community Events', count: '6 इव्हेंट्स' }
            ].map((row, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', fontSize: '0.92rem' }}>
                <span style={{ color: '#E2E8F0' }}>{row.label}</span>
                <span style={{ color: '#38BDF8', fontWeight: 800 }}>{row.count}</span>
              </div>
            ))}
          </div>

          <AuthLink
            to="/login"
            style={{
              background: 'linear-gradient(135deg, #EA580C, #C2410C)',
              color: '#FFFFFF',
              padding: '16px 36px',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '1.1rem',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 6px 20px rgba(234, 88, 12, 0.4)'
            }}
          >
            👤 Login करून तुमच्या संधी अनलॉक करा ➔
          </AuthLink>

        </div>
      </section>

      {/* =========================================================================
          15. 🚩 History, Culture & Heritage (Positioned with Royal Dignity)
      ========================================================================= */}
      <section style={{ padding: '70px 20px', background: '#FFF8F2', borderTop: '2px solid #FED7AA' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Brand Philosophy Anchor */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-block', background: '#FFEDD5', color: '#9A3412', border: '1px solid #FDBA74', padding: '6px 16px', borderRadius: '30px', fontWeight: 800, fontSize: '0.84rem', marginBottom: '12px' }}>
              🚩 आमचा वारसा • आमची अस्मिता
            </div>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4vw, 3rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '4px 0 12px' }}>
              इतिहास देतो स्वाभिमान, नेटवर्क देते प्रगती!
            </h2>
            <p style={{ color: '#78350F', fontSize: '1.1rem', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
              <em>"History gives us identity. Network gives us opportunity. Business gives us growth. Skills give us income. Community gives us support."</em>
            </p>
          </div>

          {/* Sacred Shivrajmudra Seal */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF, #FFF3E8)',
            border: '2px solid #F59E0B',
            borderRadius: '20px',
            padding: '36px 24px',
            textAlign: 'center',
            marginBottom: '40px',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.12)'
          }}>
            <div style={{ margin: '0 auto 16px', width: '90px', height: '90px' }}>
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
            <div style={{ fontFamily: 'Baloo 2', fontSize: '1.4rem', fontWeight: 800, color: '#431407', marginBottom: '8px' }}>
              " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता । शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
            </div>
            <p style={{ color: '#9A3412', fontSize: '0.96rem', maxWidth: '780px', margin: '0 auto', fontWeight: 600 }}>
              प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा केवळ आणि केवळ प्रजेच्या कल्याणासाठी तळपते आहे!
            </p>
          </div>

          {/* Living Flag & Forts Quick Exhibit */}
          <div className="cm-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center' }}>
              <video style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline poster="/assets/images/real-sindhudurg-fort.jpg">
                <source src="/assets/videos/bhagwa-flag-waving.mp4" type="video/mp4" />
              </video>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(31,10,2,0.92) 0%, rgba(56,15,4,0.7) 100%)' }}></div>
              <div style={{ position: 'relative', zIndex: 2, padding: '30px', color: '#FFFFFF' }}>
                <span style={{ background: '#EA580C', color: '#FFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>🚩 स्वराज्याचे प्रतीक</span>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'Baloo 2', margin: '8px 0' }}>अभिमानाने फडकणारा जिवंत भगवा ध्वज</h3>
                <p style={{ fontSize: '0.88rem', color: '#FFEDD5', lineHeight: 1.5, marginBottom: '16px' }}>
                  "ज्यांचे आरमार त्यांचा समुद्र!" म्हणणाऱ्या छत्रपती शिवरायांचा भगवा ध्वज — शौर्य आणि स्वाभिमानाचे प्रतीक.
                </p>
                <AuthLink to="/culture/symbols" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  राजमुद्रा व चिन्हे पहा ➔
                </AuthLink>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/maharashtra-forts-majesty.jpg"
                  alt="सह्याद्रीचे दुर्गवैभव"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(67, 20, 7, 0.8) 100%)' }} />
                <span style={{ position: 'absolute', bottom: '10px', left: '14px', background: '#EA580C', color: '#FFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 900 }}>
                  🏰 ३५०+ अभेद्य गडकोट व नकाशे
                </span>
              </div>
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.45rem', fontFamily: 'Baloo 2', color: '#431407', margin: '0 0 10px' }}>
                  सह्याद्रीचे दुर्गवैभव व स्थापत्यशास्त्र
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  दुर्गराज रायगड, सिंधुदुर्ग, प्रतापगड, सिंहगड, पन्हाळगड — गिरीदुर्ग, जलदुर्ग आणि भुईकोटांचा संपूर्ण इतिहास, नकाशे व ट्रेक गाईड:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <span style={{ background: '#FFF7ED', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#C2410C' }}>⛰️ गिरीदुर्ग</span>
                  <span style={{ background: '#FFF7ED', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#C2410C' }}>🌊 जलदुर्ग</span>
                  <span style={{ background: '#FFF7ED', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#C2410C' }}>🏰 भुईकोट</span>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <AuthLink to="/forts" className="btn btn-primary" style={{ fontSize: '0.85rem', width: '100%', textAlign: 'center', display: 'block' }}>
                    सर्व ३५०+ किल्ले व नकाशे पाहा ➔
                  </AuthLink>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <AuthLink to="/history" className="history-hub-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#431407', color: '#FFFFFF', padding: '14px 24px', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', maxWidth: '100%', whiteSpace: 'normal', textAlign: 'center', justifyContent: 'center' }}>
              <span>📜</span>
              <span>संपूर्ण मराठा इतिहास महाग्रंथालयात प्रवेश करा (History Hub) ➔</span>
            </AuthLink>
          </div>

        </div>
      </section>

      {/* =========================================================================
          16. 💻 70+ Digital Ecosystem Portals & Search
      ========================================================================= */}
      <section className="eco-directory-wrap" style={{ padding: '60px 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              COMPLETE 70+ PLATFORM PORTALS
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontFamily: 'Baloo 2, sans-serif', fontWeight: 900, color: '#431407', margin: '6px 0 8px' }}>
              Connect Maratha संपूर्ण डिजिटल परिसंस्था
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', margin: '0 0 20px' }}>
              उद्योग, करिअर, समाज, आरोग्य, संस्कृती आणि प्रशासनाची ७० हून अधिक विशेष दालने:
            </p>

            {/* Quick search input */}
            <div style={{ maxWidth: '480px', margin: '0 auto 24px' }}>
              <input
                type="text"
                placeholder="🔍 कोणतेही दालन शोधा (उदा. रक्तपेढी, वधु-वर, उद्योग, किल्ले...)"
                value={ecoQuery}
                onChange={(e) => setEcoQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '2px solid #FED7AA',
                  fontSize: '0.94rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Tabs */}
            <div className="eco-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { id: 'tab-business', label: '🏢 व्यवसाय व करिअर' },
                { id: 'tab-community', label: '🤝 समाज व कल्याण' },
                { id: 'tab-history', label: '🚩 इतिहास व संस्कृती' },
                { id: 'tab-governance', label: '⚖️ प्रशासन व नेटवर्क' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEcoTab(tab.id)}
                  style={{
                    background: ecoTab === tab.id ? '#EA580C' : '#FFF7ED',
                    color: ecoTab === tab.id ? '#FFFFFF' : '#78350F',
                    border: '1.5px solid #FED7AA',
                    borderRadius: '20px',
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick ecosystem grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {ecoTab === 'tab-business' && [
              { title: 'मराठा उद्योग निर्देशिका', desc: 'राज्यभरातील सत्यापित मराठा उद्योग व व्यापारी.', link: '/business/directory', icon: '🏢', img: '/assets/images/b2b-feat-listing.jpg' },
              { title: 'बिझनेस संगम (Chapters)', desc: 'परस्पर रेफरल देणारे व्यावसायिक चॅप्टर्स.', link: '/sangam', icon: '🤝', img: '/assets/images/sangam-banner-hero.jpg' },
              { title: 'रोजगार व करिअर केंद्र', desc: 'नोकऱ्या, वॉक-इन आणि मुलाखती.', link: '/jobs', icon: '💼', img: '/assets/images/job-radar-dev.jpg' },
              { title: 'व्यावसायिक सेवा बुकिंग', desc: 'प्लंबर, इलेक्ट्रिशियन, वकील, सीए.', link: '/jobs', icon: '🛠️', img: '/assets/images/service-architect-design.jpg' },
              { title: 'बिल्डर्स व डेव्हलपर्स', desc: 'रिअल इस्टेट व बांधकाम व्यावसायिक.', link: '/builders', icon: '🏗️', img: '/assets/images/real-estate-pune-apartments.jpg' },
              { title: 'उत्पादक व मॅन्युफॅक्चरर्स', desc: 'लहान व मध्यम कारखाने आणि उद्योग.', link: '/manufacturers', icon: '⚙️', img: '/assets/images/mfg-cnc-machining.jpg' },
              { title: 'मराठा बँक व पतसंस्था', desc: 'सहकारी बँका, पतसंस्था व कर्ज सहाय्य.', link: '/maratha-bank', icon: '🏦', img: '/assets/images/campus-commerce-banking.jpg' },
              { title: 'दुग्ध व्यवसाय व शेती', desc: 'डेअरी फार्मिंग व कृषी प्रक्रिया केंद्र.', link: '/maratha-dairy', icon: '🥛', img: '/assets/images/mfg-dairy-foods.jpg' }
            ].map((p, idx) => (
              <AuthLink
                key={idx}
                to={p.link}
                style={{
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 3px 12px rgba(234, 88, 12, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(234, 88, 12, 0.16)';
                  e.currentTarget.style.borderColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(234, 88, 12, 0.06)';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
              >
                <div style={{ position: 'relative', height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(67, 20, 7, 0.6) 100%)' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    fontSize: '1.2rem',
                    background: 'rgba(255, 255, 255, 0.92)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {p.icon}
                  </div>
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#431407', display: 'block', fontSize: '1.05rem', fontFamily: 'Baloo 2', marginBottom: '4px', lineHeight: 1.25 }}>
                    {p.title}
                  </strong>
                  <span style={{ color: '#64748B', fontSize: '0.84rem', lineHeight: 1.4 }}>
                    {p.desc}
                  </span>
                </div>
              </AuthLink>
            ))}

            {ecoTab === 'tab-community' && [
              { title: 'तातडीची रक्त मदत (Blood Help)', desc: '२४x७ रक्तदाते व रक्तपेढी समन्वय.', link: '/blood', icon: '🩸', img: '/assets/images/campus-medical.jpg' },
              { title: 'मराठा वधू-वर सूचक केंद्र', desc: 'संस्कारक्षम विवाह स्थळे व कुंडली जुळवणी.', link: '/matrimony', icon: '💍', img: '/assets/images/matrimony/bride_pooja.jpg' },
              { title: 'डॉक्टर्स निर्देशिका', desc: 'तज्ज्ञ शल्यचिकित्सक व आरोग्य केंद्रे.', link: '/doctors', icon: '🩺', img: '/assets/images/maratha-doctors-hero.jpg' },
              { title: 'महिला सक्षमीकरण केंद्र', desc: 'बचत गट, गृहउद्योग व समुपदेशन.', link: '/women-empowerment', icon: '👩‍💼', img: '/assets/images/women-entrepreneurs-banner.jpg' },
              { title: 'मराठा सामाजिक संस्था', desc: 'अखिल भारतीय मराठा महासंघ व मंडळे.', link: '/organizations', icon: '🏛️', img: '/assets/images/community-network-hands.jpg' },
              { title: 'समाजसेवक व कार्यकर्ते', desc: 'आपत्ती व्यवस्थापन व समाजकार्य.', link: '/social-workers', icon: '🤝', img: '/assets/images/maratha-social-workers-hero.jpg' }
            ].map((p, idx) => (
              <AuthLink
                key={idx}
                to={p.link}
                style={{
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 3px 12px rgba(234, 88, 12, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(234, 88, 12, 0.16)';
                  e.currentTarget.style.borderColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(234, 88, 12, 0.06)';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
              >
                <div style={{ position: 'relative', height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(67, 20, 7, 0.6) 100%)' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    fontSize: '1.2rem',
                    background: 'rgba(255, 255, 255, 0.92)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {p.icon}
                  </div>
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#431407', display: 'block', fontSize: '1.05rem', fontFamily: 'Baloo 2', marginBottom: '4px', lineHeight: 1.25 }}>
                    {p.title}
                  </strong>
                  <span style={{ color: '#64748B', fontSize: '0.84rem', lineHeight: 1.4 }}>
                    {p.desc}
                  </span>
                </div>
              </AuthLink>
            ))}

            {ecoTab === 'tab-history' && [
              { title: 'मराठा इतिहास महाग्रंथालय', desc: '१६३० ते १८१८ कालपट, लढाया व बखरी.', link: '/history', icon: '📜', img: '/assets/images/maratha-granthalaya.jpg' },
              { title: 'सह्याद्रीचे ३५०+ गडकिल्ले', desc: 'सर्व किल्ल्यांचे नकाशे, फोटो व मार्ग.', link: '/forts', icon: '🏰', img: '/assets/images/maharashtra-forts-majesty.jpg' },
              { title: 'मराठा आरमार व सागरी किल्ले', desc: 'भारतीय आरमाराचे जनकत्व व जलदुर्ग.', link: '/history/maratha-navy', icon: '⚓', img: '/assets/images/real-kanhoji-angre.jpg' },
              { title: 'शिवचरित्र कथन (१० भाग)', desc: 'बाबासाहेब पुरंदरे शिवचरित्र व्याख्यानमाला.', link: '/article/babasaheb-purandare-shivcharitra-kathan-bhag-1', icon: '🎙️', img: '/assets/images/real-babasaheb-purandare.jpg' },
              { title: 'बलिदान मास स्मृती', desc: 'छत्रपती संभाजी महाराज बलिदान पर्व.', link: '/history/balidan-maas', icon: '🛡️', img: '/assets/images/balidan-maas-memorial.jpg' },
              { title: 'मराठा ग्रंथालय व बखरी', desc: 'अस्सल मोडी कागदपत्रे व ऐतिहासिक ग्रंथ.', link: '/history/granthalaya', icon: '📚', img: '/assets/images/maratha-granthalaya.jpg' }
            ].map((p, idx) => (
              <AuthLink
                key={idx}
                to={p.link}
                style={{
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 3px 12px rgba(234, 88, 12, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(234, 88, 12, 0.16)';
                  e.currentTarget.style.borderColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(234, 88, 12, 0.06)';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
              >
                <div style={{ position: 'relative', height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(67, 20, 7, 0.6) 100%)' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    fontSize: '1.2rem',
                    background: 'rgba(255, 255, 255, 0.92)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {p.icon}
                  </div>
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#431407', display: 'block', fontSize: '1.05rem', fontFamily: 'Baloo 2', marginBottom: '4px', lineHeight: 1.25 }}>
                    {p.title}
                  </strong>
                  <span style={{ color: '#64748B', fontSize: '0.84rem', lineHeight: 1.4 }}>
                    {p.desc}
                  </span>
                </div>
              </AuthLink>
            ))}

            {ecoTab === 'tab-governance' && [
              { title: '५६ पदे व पात्रता मॅट्रिक्स', desc: 'संघटनात्मक रचना व उमेदवार निकष.', link: '/roles-matrix', icon: '⚖️', img: '/assets/images/connect-maratha-council.jpg' },
              { title: 'शासकीय अधिकारी (IAS/IPS)', desc: 'मराठा सनदी अधिकारी व स्पर्धा परीक्षा यश.', link: '/officers', icon: '🎖️', img: '/assets/images/officers/officer_ias_admin.jpg' },
              { title: 'राजकीय नेते व पक्ष', desc: 'महाराष्ट्र राजकीय नेतृत्व व विचारधारा.', link: '/political-leaders', icon: '🗳️', img: '/assets/images/leaders/leader_eknath_real.jpg' },
              { title: 'व्हिजन व मिशन २०२६-२०३५', desc: '३ कोटी समाजाच्या सर्वांगीण उत्कर्षाचा संकल्प.', link: '/vision', icon: '🎯', img: '/assets/images/maharashtra-network-team.jpg' },
              { title: 'तक्रार निवारण व हेल्पलाईन', desc: 'सचिवालय संपर्क, १८००-२३३-१९८१.', link: '/contact', icon: '☎️', img: '/assets/images/maratha-services-care.jpg' },
              { title: 'गोपनीयता धोरण (Privacy)', desc: 'DPDP २०२३ अधिकृत गोपनीयता धोरण.', link: '/privacy', icon: '🔒', img: '/assets/images/server-network-datacenter.jpg' }
            ].map((p, idx) => (
              <AuthLink
                key={idx}
                to={p.link}
                style={{
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 3px 12px rgba(234, 88, 12, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(234, 88, 12, 0.16)';
                  e.currentTarget.style.borderColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(234, 88, 12, 0.06)';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
              >
                <div style={{ position: 'relative', height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(67, 20, 7, 0.6) 100%)' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    fontSize: '1.2rem',
                    background: 'rgba(255, 255, 255, 0.92)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {p.icon}
                  </div>
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#431407', display: 'block', fontSize: '1.05rem', fontFamily: 'Baloo 2', marginBottom: '4px', lineHeight: 1.25 }}>
                    {p.title}
                  </strong>
                  <span style={{ color: '#64748B', fontSize: '0.84rem', lineHeight: 1.4 }}>
                    {p.desc}
                  </span>
                </div>
              </AuthLink>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          17. Final Grand Call to Action
      ========================================================================= */}
      <section style={{
        padding: '84px 20px',
        position: 'relative',
        background: 'url("/assets/images/foot1.jpeg") center/cover no-repeat',
        color: '#FFFFFF',
        textAlign: 'center',
        borderTop: '2px solid rgba(254, 215, 170, 0.3)'
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '12px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🚩</div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.4rem)', fontFamily: 'Baloo 2', fontWeight: 900, margin: '0 0 14px', textShadow: '0 3px 10px rgba(0,0,0,0.4)' }}>
            एक विचार... एक समाज... एक संघटन...
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#FED7AA', fontWeight: 700, margin: '0 0 32px', lineHeight: 1.5, textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
            समृद्ध महाराष्ट्र... समर्थ भारत! आजच Connect Maratha च्या महासंधींमध्ये सहभागी व्हा.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <AuthLink
              to="/register"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
                color: '#EA580C',
                padding: '16px 36px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
              }}
            >
              🟠 मोफत सभासद व्हा ➔
            </AuthLink>
            <AuthLink
              to="/login"
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: '#FFFFFF',
                border: '2px solid rgba(255,255,255,0.85)',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
              }}
            >
              👤 सभासद लॉगिन
            </AuthLink>
          </div>
        </div>
      </section>

      {/* 🔐 AUTHENTICATION REQUIRED MODAL (TRIGGERED WHEN UNLOGGED VISITOR CLICKS ANY FEATURE) */}
      {authRequiredPrompt && (
        <div 
          data-auth-prompt="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(67, 20, 7, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setAuthRequiredPrompt(null)}
        >
          <div
            data-auth-prompt="true"
            style={{
              background: '#FFFFFF',
              border: '2px solid #FED7AA',
              borderRadius: '24px',
              padding: '30px 24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 24px 50px rgba(234, 88, 12, 0.25)',
              position: 'relative',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAuthRequiredPrompt(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                color: '#EA580C',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐 🚩</div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#431407', margin: '0 0 6px' }}>
              Connect Maratha — सभासद लॉगिन आवश्यक
            </h3>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#EA580C', marginBottom: '14px' }}>
              Please Login to Access Platform Features
            </div>

            <div style={{
              background: '#FFF7ED',
              border: '1.5px solid #FED7AA',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.88rem',
              color: '#78350F',
              fontWeight: 800
            }}>
              🎯 आपण निवडलेली सुविधा: <span style={{ color: '#EA580C' }}>"{authRequiredPrompt.featureTitle}"</span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: '0 0 18px' }}>
              Connect Maratha वरील नोकऱ्या, व्यवसाय, B2B लीड्स, इतिहास, ३५०+ गडकोट, वधु-वर, रक्तपेढी, चॅप्टर्स आणि सर्व डिजिटल सुविधांचा लाभ घेण्यासाठी आपले अधिकृत सभासद खात्यात लॉगिन असणे आवश्यक आहे.
            </p>

            {/* Quick Login Form inside Modal */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setModalLoginLoading(true);
                setModalLoginErr('');
                try {
                  const res = await login(modalPhone, modalPass);
                  if (res && (res.success || res.member)) {
                    const target = authRequiredPrompt.targetUrl || '/jobs';
                    setAuthRequiredPrompt(null);
                    navigate(target);
                  } else {
                    setModalLoginErr(res?.message || 'अवैध मोबाईल क्रमांक किंवा पासवर्ड.');
                  }
                } catch (err) {
                  setModalLoginErr(err.message || 'लॉगिन अयशस्वी झाले.');
                } finally {
                  setModalLoginLoading(false);
                }
              }}
              style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                ⚡ त्वरित लॉगिन करा (Quick Login):
              </div>

              {modalLoginErr && (
                <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 700 }}>
                  ⚠️ {modalLoginErr}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="मोबाईल किंवा ईमेल (Mobile / Email)"
                  required
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
                <input
                  type="password"
                  placeholder="पासवर्ड (Password)"
                  required
                  value={modalPass}
                  onChange={(e) => setModalPass(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={modalLoginLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: modalLoginLoading ? 'wait' : 'pointer'
                }}
              >
                {modalLoginLoading ? 'लॉगिन करत आहे...' : '🔐 लॉगिन करून पुढे जा ➔'}
              </button>
            </form>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const target = authRequiredPrompt.targetUrl;
                  setAuthRequiredPrompt(null);
                  navigate(`/login?redirect=${encodeURIComponent(target)}`);
                }}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  color: '#EA580C',
                  border: '1.5px solid #FED7AA',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                लॉगिन मुख्य पान
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = authRequiredPrompt.targetUrl;
                  setAuthRequiredPrompt(null);
                  navigate(`/register?redirect=${encodeURIComponent(target)}`);
                }}
                style={{
                  flex: 1,
                  background: '#431407',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                🚩 मोफत नोंदणी करा
              </button>
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.74rem', color: '#94A3B8' }}>
              लॉगिन झाल्यानंतर आपण निवडलेल्या पोर्टलवर आपोआप पोहोचाल.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
