import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function SiteHeader({ onOpenSearch }) {
  const { user, logout } = useAuth();
  const { getContent } = useSiteContent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState(null);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      navigate('/search');
    }
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const togglePillar = (pillarId) => {
    setExpandedPillar((prev) => (prev === pillarId ? null : pillarId));
  };

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* ========== TOPBAR ========== */}
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <div className="left-info">
            <span>🚩 <strong>जय जिजाऊ · जय शिवराय · जय शंभूराजे</strong></span>
            <span className="topbar-divider">|</span>
            <span className="topbar-tagline">{getContent('texts.tagline', 'Connect Maratha डिजिटल व्यासपीठ')}</span>
          </div>
          <div className="right-info">
            <Link to="/calendar" style={{ color: '#FDE68A', fontWeight: 800, textDecoration: 'none' }}>📅 दिनदर्शिका</Link>
            <span>|</span>
            <Link to="/universe" style={{ color: '#FED7AA', fontWeight: 700, textDecoration: 'none' }}>🌌 महाविश्व</Link>
            <span>|</span>
            <span>📞 <strong>{getContent('forms.contactSupport.emergencyHelpline', '१८००-१२३-१६७४')}</strong></span>
            <span className="topbar-hide-tablet">|</span>
            <Link to="/about" className="topbar-hide-tablet">संस्था परिचय</Link>
            <span className="topbar-hide-tablet">|</span>
            <LanguageSwitcher variant="topbar" />
          </div>
        </div>
      </div>

      {/* ========== MAIN HEADER ========== */}
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand-desktop" onClick={handleLinkClick} title="Connect Maratha - मुख्यपृष्ठ" aria-label="Connect Maratha Home">
            <img
              src={getContent('images.brandLogo', '/assets/images/logo.png')}
              alt="Connect Maratha Logo"
              className="brand-logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/logo.png';
              }}
            />
            <div className="brand-titles">
              <div className="brand-main">
                <span className="en">CONNECT</span> <span className="mr">मराठा</span>
              </div>
              <div className="brand-sub" style={{ color: '#7C2D12', fontWeight: '800', fontSize: '0.74rem', letterSpacing: '0.3px', opacity: 1 }}>
                अखिल भारतीय डिजिटल व्यासपीठ
              </div>
            </div>
          </Link>

          {/* Desktop Navigation (Hidden <= 1024px) */}
          <nav className="desktop-nav">
            {!user ? (
              <>
                <NavLink to="/about" onClick={handleLinkClick}>
                  🏛️ आमच्याबद्दल
                </NavLink>
                <NavLink to="/vision" onClick={handleLinkClick}>
                  🎯 व्हिजन
                </NavLink>
                <NavLink to="/goals" onClick={handleLinkClick}>
                  🏆 उद्दिष्टे
                </NavLink>
                <NavLink to="/why-join" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>
                  ⭐ सहभागी का व्हावे?
                </NavLink>
                <NavLink to="/contact" onClick={handleLinkClick}>
                  ☎️ संपर्क
                </NavLink>
              </>
            ) : (
              <>
                {/* Pillar 1: इतिहास व संस्कृती */}
                <div className="nav-item-has-mega">
                  <Link to="/history" onClick={handleLinkClick}>⚔️ इतिहास व संस्कृती ▾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">🚩 महापुरुष व शौर्यगाथा</div>
                        <Link to="/history/shivaji-maharaj" onClick={handleLinkClick}>👑 छत्रपती शिवाजी महाराज चरित्र</Link>
                        <Link to="/history/sambhaji-maharaj" onClick={handleLinkClick}>⚔️ छत्रपती संभाजी महाराज शौर्यगाथा</Link>
                        <Link to="/history/balidan-maas" onClick={handleLinkClick}>🕯️ धर्मवीर बलिदान मास स्मरण</Link>
                        <Link to="/history/rajmata-jijau" onClick={handleLinkClick}>🌸 राष्ट्रमाता जिजाऊ माँसाहेब</Link>
                        <Link to="/history/bajirao-peshwa" onClick={handleLinkClick}>🐎 श्रीमंत थोरले बाजीराव पेशवे</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">🏰 किल्ले, रणांगणे व आरमार</div>
                        <Link to="/forts" onClick={handleLinkClick}>🏰 सह्याद्रीचे ३५०+ गडकिल्ले</Link>
                        <Link to="/history/battles" onClick={handleLinkClick}>⚔️ प्रमुख ७ रणांगणे व व्यूहरचना</Link>
                        <Link to="/history/navy" onClick={handleLinkClick}>⚓ मराठा आरमार व जलदुर्ग</Link>
                        <Link to="/shivcharitra" onClick={handleLinkClick} style={{ color: '#C73800', fontWeight: 800 }}>🚩 शिवचरित्र कथन (१५ भाग)</Link>
                        <Link to="/quiz" onClick={handleLinkClick} style={{ color: 'var(--maroon-800)', fontWeight: 700 }}>🎯 स्वराज्य इतिहास महाक्विझ</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">📚 ग्रंथालय व ज्ञानकोश</div>
                        <Link to="/history/granthalaya" onClick={handleLinkClick}>📚 मराठा ग्रंथालय व बखरी</Link>
                        <Link to="/dnyankosh" onClick={handleLinkClick}>💡 मराठा ज्ञानकोश (Dnyankosh)</Link>
                        <Link to="/time-machine" onClick={handleLinkClick}>⏳ महाराष्ट्र टाइम मशीन</Link>
                        <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>🛕 ग्रामदैवत व कुलदैवत</Link>
                        <Link to="/culture/shivkal-festivals" onClick={handleLinkClick}>🚩 शिवकालीन उत्सव व सण</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">🗺️ वारसा नकाशा व गौरव</div>
                        <Link to="/culture/heritage-map" onClick={handleLinkClick}>🗺️ बहुस्तरीय परस्परसंवादी नकाशा</Link>
                        <Link to="/history/knowledge-graph" onClick={handleLinkClick}>⚡ नॉलेज ग्राफ (घटना ↔ स्थळे)</Link>
                        <Link to="/gallery" onClick={handleLinkClick}>🖼️ आपुला महाराष्ट्र छायाचित्र दालन</Link>
                        <Link to="/achievers" onClick={handleLinkClick}>🏆 राष्ट्रीय मराठा गौरव व अचीव्हर्स</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pillar 2: व्यवसाय व संगम */}
                <div className="nav-item-has-mega">
                  <Link to="/sangam" onClick={handleLinkClick}>💼 व्यवसाय व संगम ▾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">🤝 बिझनेस संगम</div>
                        <Link to="/business/directory" onClick={handleLinkClick}>🏢 अखिल मराठा व्यवसाय निर्देशिका</Link>
                        <Link to="/sangam" onClick={handleLinkClick}>🤝 बिझनेस संगम व चॅप्टर्स</Link>
                        <Link to="/referrals" onClick={handleLinkClick}>🔗 रेफरल व व्यवसाय देवाणघेवाण</Link>
                        <Link to="/meetings" onClick={handleLinkClick}>☕ 1-to-1 व्यावसायिक बैठका</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">🏭 उद्योग व वित्त</div>
                        <Link to="/bank" onClick={handleLinkClick}>🏦 मराठा बँक व वित्त संस्था</Link>
                        <Link to="/builders" onClick={handleLinkClick}>🏗️ मराठा बिल्डर्स व डेव्हलपर्स</Link>
                        <Link to="/manufacturers" onClick={handleLinkClick}>🏭 मराठा मॅन्युफॅक्चरर्स व उद्योग</Link>
                        <Link to="/dairy" onClick={handleLinkClick}>🥛 मराठा दूध व संकलन केंद्र</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">💼 रोजगार व करिअर</div>
                        <Link to="/jobs" onClick={handleLinkClick}>💼 रोजगार व करिअर केंद्र</Link>
                        <Link to="/directory" onClick={handleLinkClick}>👨‍💼 प्रोफेशनेल्स डिरेक्टरी</Link>
                        <Link to="/jobs" onClick={handleLinkClick}>🎓 उच्च शिक्षण व शिष्यवृत्ती</Link>
                        <Link to="/business/directory" onClick={handleLinkClick}>🚀 B2B संधी व सौदे</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pillar 3: समाज व कल्याण */}
                <div className="nav-item-has-mega">
                  <Link to="/community" onClick={handleLinkClick}>🚩 समाज व कल्याण ▾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">👥 कम्युनिटी व कल्याण</div>
                        <Link to="/community" onClick={handleLinkClick}>💬 मराठा डिजिटल कम्युनिटी मंच</Link>
                        <Link to="/blood" onClick={handleLinkClick}>🩸 २४×७ आपत्कालीन रक्त मदत केंद्र</Link>
                        <Link to="/matrimony" onClick={handleLinkClick}>💍 मराठा वधू-वर सूचक केंद्र</Link>
                        <Link to="/women" onClick={handleLinkClick}>🌸 महिला सक्षमीकरण कक्ष</Link>
                        <Link to="/donation" onClick={handleLinkClick}>❤️ दुर्ग संवर्धन व देणगी कोष</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">🤝 संघटना व नेतृत्व</div>
                        <Link to="/organizations" onClick={handleLinkClick}>🤝 मराठा सामाजिक संघटना</Link>
                        <Link to="/political" onClick={handleLinkClick}>🏛️ राजकीय नेतृत्व व पक्ष</Link>
                        <Link to="/social-workers" onClick={handleLinkClick}>🤝 मराठा निष्ठावंत समाजसेवक</Link>
                        <Link to="/officers" onClick={handleLinkClick}>⭐ मराठा सनदी अधिकारी (IAS/IPS)</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">🎭 आरोग्य, कला व मीडिया</div>
                        <Link to="/doctors" onClick={handleLinkClick}>👨‍⚕️ मराठा तज्ज्ञ डॉक्टर्स</Link>
                        <Link to="/artists" onClick={handleLinkClick}>🎭 कलाकार, गायक व दिग्दर्शक</Link>
                        <Link to="/movies" onClick={handleLinkClick}>🎬 मराठी दर्जेदार चित्रपट</Link>
                        <Link to="/speakers" onClick={handleLinkClick}>🎙️ प्रेरक वक्ते व मार्गदर्शक</Link>
                        <Link to="/maratha-news" onClick={handleLinkClick}>📺 मराठा न्यूज व ई-पेपर्स</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pillar 4: नेटवर्क व दालने */}
                <div className="nav-item-has-mega">
                  <Link to="/network" onClick={handleLinkClick}>🗺️ नेटवर्क व दालने ▾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">🗺️ राज्य समन्वय नेटवर्क</div>
                        <Link to="/network" onClick={handleLinkClick}>🗺️ ३६ जिल्हा समन्वय शाखा</Link>
                        <Link to="/network" onClick={handleLinkClick}>🏛️ ६ प्रशासकीय विभाग नेटवर्क</Link>
                        <Link to="/platform" onClick={handleLinkClick}>📊 महाराष्ट्र डेटा प्लॅटफॉर्म (50+)</Link>
                        <Link to="/calendar" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>📅 मराठा दिनदर्शिका (पंचांग)</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">🏛️ संस्था सनद व चौकट</div>
                        <Link to="/roles-matrix" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>⚖️ ५६ पदे व पात्रता मॅट्रिक्स</Link>
                        <Link to="/about" onClick={handleLinkClick}>🏛️ संस्था परिचय व सनद</Link>
                        <Link to="/governance" onClick={handleLinkClick}>🎯 व्हिजन व DPDP धोरण</Link>
                        <Link to="/goals" onClick={handleLinkClick}>🏆 १० प्रमुख उद्दिष्टे</Link>
                        <Link to="/contact" onClick={handleLinkClick}>☎️ संपर्क व तक्रार निवारण</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            <button
              type="button"
              className="header-search-btn"
              onClick={handleSearchClick}
              title="शोध / Search (Ctrl+K)"
              aria-label="शोध / Search"
              style={{
                background: '#FFF8F0',
                border: '1.5px solid #FFCC80',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor: 'pointer',
                color: '#C2410C',
                flexShrink: 0
              }}
            >
              🔍
            </button>

            <LanguageSwitcher variant="header" />

            <Link
              to="/universe"
              onClick={handleLinkClick}
              className="btn universe-btn"
              title="Connect Maratha — Expanded Feature Universe">
              <span>🌌</span>
              <span className="universe-btn-text">महाविश्व</span>
            </Link>

            {user && user.id ? (
              <div className="cm-user-menu-wrap" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/dashboard"
                  onClick={handleLinkClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 14px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(234, 88, 12, 0.25)',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  title="माझा डॅशबोर्ड"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0] || 'डॅशबोर्ड'}
                  </span>
                </Link>
                <Link
                  to="/card"
                  onClick={handleLinkClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#FFF7ED',
                    border: '1.5px solid #FED7AA',
                    color: '#EA580C',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
                  }}
                  title="माझे डिजिटल ओळखपत्र (Digital ID Card)"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <circle cx="7" cy="15" r="1.5" />
                    <line x1="12" y1="15" x2="18" y2="15" />
                  </svg>
                </Link>
                <button
                  onClick={logout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#FEF2F2',
                    border: '1.5px solid #FECACA',
                    color: '#DC2626',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)'
                  }}
                  title="खात्यातून बाहेर पडा (Logout)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="guest-header-btns">
                <Link to="/login" className="btn btn-outline header-login-btn" onClick={handleLinkClick} title="सभासद लॉगिन">
                  👤 <span className="header-btn-text">लॉगिन</span>
                </Link>
                <Link to="/register" className="btn btn-primary header-register-btn" onClick={handleLinkClick} title="नवीन नोंदणी">
                  🚩 <span className="header-btn-text">नोंदणी</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "मेनू बंद करा" : "मेनू उघडा"}
              aria-expanded={mobileOpen}>
              <span className="hamburger-icon">{mobileOpen ? '✕' : '☰'}</span>
              <span className="hamburger-text">{mobileOpen ? 'बंद' : 'मेनू'}</span>
            </button>
          </div>
        </div>

        {/* Mobile / Responsive Horizontal Category Navigation Bar */}
        <nav className="site-mobile-subnav" aria-label="मुख्य विभाग नेव्हिगेशन">
          <div className="site-mobile-subnav-scroll">
            <button
              type="button"
              className="subnav-pill subnav-pill-dropdown-trigger"
              onClick={() => setMobileOpen(true)}
              aria-label="सर्व मेनू उघडा"
            >
              <span className="subnav-pill-icon">📑</span> सर्व मेनू ▾
            </button>
            <NavLink to="/" end onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
              <span className="subnav-pill-icon">🏠</span> मुख्यपृष्ठ
            </NavLink>
            {!user ? (
              <>
                <NavLink to="/about" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🏛️</span> आमच्याबद्दल
                </NavLink>
                <NavLink to="/vision" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🎯</span> व्हिजन
                </NavLink>
                <NavLink to="/goals" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🏆</span> उद्दिष्टे
                </NavLink>
                <NavLink to="/why-join" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill highlight-gold ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">⭐</span> सहभागी व्हा
                </NavLink>
                <NavLink to="/contact" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">☎️</span> संपर्क
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/history" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">⚔️</span> इतिहास
                </NavLink>
                <NavLink to="/culture" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🏛️</span> संस्कृती
                </NavLink>
                <NavLink to="/calendar" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill highlight-gold ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">📅</span> दिनदर्शिका
                </NavLink>
                <NavLink to="/business/directory" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">💼</span> व्यवसाय
                </NavLink>
                <NavLink to="/community" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">👥</span> समाज
                </NavLink>
                <NavLink to="/universe" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill highlight-universe ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🌌</span> महाविश्व
                </NavLink>
                <NavLink to="/forts" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🏰</span> गड-किल्ले
                </NavLink>
                <NavLink to="/temples" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🛕</span> मंदिरे
                </NavLink>
                <NavLink to="/sangam" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🤝</span> संगम
                </NavLink>
                <NavLink to="/gallery" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">🖼️</span> दालने
                </NavLink>
              </>
            )}
            <button
              type="button"
              className="subnav-pill subnav-pill-more"
              onClick={() => setMobileOpen(true)}
              aria-label="सर्व ५०+ विभाग व मेनू"
            >
              <span className="subnav-pill-icon">☰</span> अधिक
            </button>
          </div>
        </nav>
      </header>

      {/* ========== MOBILE SLIDE-OUT DRAWER & BACKDROP ========== */}
      <div
        className={`cm-mobile-drawer-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`cm-mobile-drawer ${mobileOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="मुख्य नेव्हिगेशन मेनू">
        
        {/* Drawer Header */}
        <div className="cm-drawer-header">
          <Link to="/" onClick={handleLinkClick} className="cm-drawer-brand">
            <img
              src={getContent('images.brandLogo', '/assets/images/logo.png')}
              alt="Connect Maratha"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/logo.png';
              }}
            />
            <div>
              <div className="cm-drawer-brand-title">CONNECT मराठा</div>
              <div className="cm-drawer-brand-sub">अखिल भारतीय डिजिटल व्यासपीठ</div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageSwitcher variant="header" />
            <button
              type="button"
              className="cm-drawer-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="मेनू बंद करा">
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="cm-drawer-body">
          {/* User Status / Auth Action Card */}
          <div className="cm-drawer-user-card">
            {user && user.id ? (
              <>
                <div className="cm-drawer-user-header">
                  <div className="cm-drawer-user-avatar">👤</div>
                  <div>
                    <div className="cm-drawer-user-name">{user.name || 'सभासद'}</div>
                    <span className="cm-drawer-user-badge">
                      {user.role === 'superadmin' ? '👑 SuperAdmin' : user.role === 'admin' ? '🛡️ Admin' : user.role === 'business_member' ? '💼 व्यावसायिक सभासद' : '🚩 अधिकृत सभासद'}
                    </span>
                  </div>
                </div>
                <div className="cm-drawer-user-btns">
                  <Link to="/dashboard" onClick={handleLinkClick} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>डॅशबोर्ड</span>
                  </Link>
                  <Link to="/card" onClick={handleLinkClick} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                      <circle cx="7" cy="15" r="1.5" />
                      <line x1="12" y1="15" x2="18" y2="15" />
                    </svg>
                    <span>ओळखपत्र</span>
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="btn"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1.5px solid #FECACA', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>बाहेर पडा</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="cm-drawer-guest-btns">
                <Link to="/login" onClick={handleLinkClick} className="btn btn-outline">
                  👤 सभासद लॉगिन
                </Link>
                <Link to="/register" onClick={handleLinkClick} className="btn btn-primary">
                  🚩 नवीन नोंदणी
                </Link>
              </div>
            )}
          </div>

          {/* Featured Highlight: महाविश्व Banner */}
          <Link to="/universe" onClick={handleLinkClick} className="cm-drawer-universe-banner">
            <span className="banner-icon">🌌</span>
            <div className="banner-text">
              <strong>संपूर्ण महाराष्ट्र महाविश्व</strong>
              <small>४९ वैशिष्ट्ये • १२ जग • परस्पर जोडणी</small>
            </div>
            <span className="banner-arrow">→</span>
          </Link>

          {/* Quick Jump Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {!user ? (
              <>
                <Link
                  to="/why-join"
                  onClick={handleLinkClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    color: '#C2410C',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}>
                  <span>⭐</span>
                  <span>सहभागी व्हा</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={handleLinkClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    color: '#92400E',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}>
                  <span>☎️</span>
                  <span>मदत व संपर्क</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/roles-matrix"
                  onClick={handleLinkClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    color: '#C2410C',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}>
                  <span>⚖️</span>
                  <span>५६ पदे मॅट्रिक्स</span>
                </Link>
                <Link
                  to="/calendar"
                  onClick={handleLinkClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    color: '#92400E',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}>
                  <span>📅</span>
                  <span>दिनदर्शिका</span>
                </Link>
              </>
            )}
          </div>

          {!user ? (
            /* Guest Navigation Items */
            <div className="cm-drawer-guest-menu" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <Link to="/about" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', color: '#1E293B', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '1.2rem' }}>🏛️</span>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 800 }}>आमच्याबद्दल व संस्था परिचय</div>
                  <small style={{ color: '#64748B' }}>संस्थेची पार्श्वभूमी व उद्दिष्टे</small>
                </div>
              </Link>

              <Link to="/vision" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF8F0', color: '#EA580C', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FED7AA' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                <div>
                  <div style={{ color: '#EA580C', fontWeight: 800 }}>व्हिजन (Vision 2030)</div>
                  <small style={{ color: '#C2410C' }}>दीर्घकालीन संकल्पना</small>
                </div>
              </Link>

              <Link to="/goals" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF8F0', color: '#EA580C', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FED7AA' }}>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
                <div>
                  <div style={{ color: '#EA580C', fontWeight: 800 }}>उद्दिष्टे व संकल्प (Goals)</div>
                  <small style={{ color: '#C2410C' }}>१० प्रमुख रणनीतिक उद्दिष्टे</small>
                </div>
              </Link>

              <Link to="/why-join" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF7ED', color: '#C2410C', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #FFCC80' }}>
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                <div>
                  <div style={{ color: '#EA580C', fontWeight: 900 }}>सहभागी का व्हावे? (सदस्यत्वाचे लाभ)</div>
                  <small style={{ color: '#C2410C' }}>८ मुख्य फायदे व डिजिटल स्मार्ट कार्ड</small>
                </div>
              </Link>

              <Link to="/contact" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', color: '#1E293B', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '1.2rem' }}>☎️</span>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 800 }}>संपर्क व मदत केंद्र</div>
                  <small style={{ color: '#64748B' }}>हेल्पलाईन व समन्वय अधिकारी</small>
                </div>
              </Link>
            </div>
          ) : (
            /* Logged-In User Accordion Menu */
            <>
              {/* Pillar 1: इतिहास व वारसा */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'history' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('history')}>
                  <span>⚔️ इतिहास व वारसा</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'history' ? '▲' : '▼'}</span>
                </button>
                {expandedPillar === 'history' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/history" onClick={handleLinkClick}>📜 मराठा कालपट (१६३०-१८१८)</Link>
                    <Link to="/history/battles" onClick={handleLinkClick}>⚔️ प्रमुख ७ रणांगणे व व्यूहरचना</Link>
                    <Link to="/forts" onClick={handleLinkClick}>🏰 सह्याद्रीचे गड-किल्ले (३५०+)</Link>
                    <Link to="/history/navy" onClick={handleLinkClick}>⚓ मराठा आरमार व जलदुर्ग</Link>
                    <Link to="/quiz" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 700 }}>🎯 स्वराज्य इतिहास महाक्विझ</Link>
                    <Link to="/history/balidan-maas" onClick={handleLinkClick}>🕯️ धर्मवीर बलिदान मास स्मरण</Link>
                    <Link to="/history/granthalaya" onClick={handleLinkClick}>📚 मराठा ग्रंथालय व बखरी</Link>
                    <Link to="/history/warriors" onClick={handleLinkClick}>👑 ९६ कुळे व सरदार घराणी</Link>
                    <Link to="/history/movements" onClick={handleLinkClick}>🚩 मराठा क्रांती मूक मोर्चे</Link>
                    <Link to="/history/dates" onClick={handleLinkClick}>📅 ऐतिहासिक दिनविशेष</Link>
                    <Link to="/history/shivaji-maharaj" onClick={handleLinkClick}>📖 विशेष संशोधन लेख</Link>
                  </div>
                )}
              </div>

              {/* Pillar 2: संस्कृती व ज्ञानकोश */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'culture' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('culture')}>
                  <span>🏛️ संस्कृती व ज्ञानकोश</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'culture' ? '▲' : '▼'}</span>
                </button>
                {expandedPillar === 'culture' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/platform" onClick={handleLinkClick} style={{ color: '#9A3412', fontWeight: 700 }}>🗺️ महाराष्ट्र डेटा प्लॅटफॉर्म</Link>
                    <Link to="/universe" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 700 }}>🌌 संपूर्ण महाराष्ट्र महाविश्व</Link>
                    <Link to="/time-machine" onClick={handleLinkClick}>⏳ महाराष्ट्र टाइम मशीन (१२ कालखंड)</Link>
                    <Link to="/culture/shivkal-festivals" onClick={handleLinkClick}>🚩 शिवकालीन उत्सव (१६३०-१६८०)</Link>
                    <Link to="/culture" onClick={handleLinkClick}>🗺️ ८ प्रादेशिक सांस्कृतिक प्रोफाइल</Link>
                    <Link to="/culture/dialects" onClick={handleLinkClick}>🗣️ महाराष्ट्राच्या बोली व उच्चार</Link>
                    <Link to="/culture/food" onClick={handleLinkClick}>🍲 खाद्यसंस्कृती व उगम इतिहास</Link>
                    <Link to="/culture/symbols" onClick={handleLinkClick}>🏷️ राजमुद्रा व मराठा चिन्हे</Link>
                    <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>🛕 ग्रामदैवत व कुलदैवत ज्ञानकार्ड</Link>
                    <Link to="/jatra" onClick={handleLinkClick}>🎪 जत्रा व वार्षिक यात्रा दिनदर्शिका</Link>
                    <Link to="/culture/heritage-map" onClick={handleLinkClick}>🗺️ बहुस्तरीय परस्परसंवादी नकाशा</Link>
                    <Link to="/history/knowledge-graph" onClick={handleLinkClick}>⚡ घटना ↔ स्थळे नॉलेज ग्राफ</Link>
                  </div>
                )}
              </div>

              {/* Pillar 3: व्यवसाय व संधी */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'business' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('business')}>
                  <span>💼 व्यवसाय व संधी</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'business' ? '▲' : '▼'}</span>
                </button>
                {expandedPillar === 'business' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/business/directory" onClick={handleLinkClick}>🏢 व्यवसाय निर्देशिका</Link>
                    <Link to="/sangam" onClick={handleLinkClick}>🤝 बिझनेस संगम व चॅप्टर्स</Link>
                    <Link to="/referrals" onClick={handleLinkClick}>🔗 रेफरल व व्यवसाय देवाणघेवाण</Link>
                    <Link to="/meetings" onClick={handleLinkClick}>☕ 1-to-1 व्यावसायिक बैठका</Link>
                    <Link to="/jobs" onClick={handleLinkClick}>💼 रोजगार व करिअर केंद्र</Link>
                    <Link to="/bank" onClick={handleLinkClick}>🏦 मराठा बँक व वित्त संस्था</Link>
                    <Link to="/builders" onClick={handleLinkClick}>🏗️ मराठा बिल्डर्स व डेव्हलपर्स</Link>
                    <Link to="/dairy" onClick={handleLinkClick}>🥛 मराठा दूध व संकलन केंद्र</Link>
                    <Link to="/manufacturers" onClick={handleLinkClick}>🏭 मराठा मॅन्युफॅक्चरर्स</Link>
                  </div>
                )}
              </div>

              {/* Pillar 4: समाज व उपक्रम */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'community' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('community')}>
                  <span>🚩 समाज व उपक्रम</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'community' ? '▲' : '▼'}</span>
                </button>
                {expandedPillar === 'community' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/community" onClick={handleLinkClick}>💬 मराठा डिजिटल कम्युनिटी</Link>
                    <Link to="/women" onClick={handleLinkClick}>🌸 महिला सक्षमीकरण कक्ष</Link>
                    <Link to="/blood" onClick={handleLinkClick} style={{ color: '#DC2626', fontWeight: 700 }}>🩸 २४×७ रक्त मदत केंद्र</Link>
                    <Link to="/matrimony" onClick={handleLinkClick}>💍 मराठा वधू-वर सूचक केंद्र</Link>
                    <Link to="/organizations" onClick={handleLinkClick}>🤝 मराठा सामाजिक संघटना</Link>
                    <Link to="/political" onClick={handleLinkClick}>🏛️ राजकीय नेतृत्व व पक्ष</Link>
                    <Link to="/social-workers" onClick={handleLinkClick}>🤝 मराठा निष्ठावंत समाजसेवक</Link>
                    <Link to="/officers" onClick={handleLinkClick}>⭐ मराठा सनदी अधिकारी (IAS/IPS)</Link>
                    <Link to="/doctors" onClick={handleLinkClick}>👨‍⚕️ मराठा तज्ज्ञ डॉक्टर्स</Link>
                    <Link to="/artists" onClick={handleLinkClick}>🎭 कलाकार, गायक व दिग्दर्शक</Link>
                  </div>
                )}
              </div>

              {/* Pillar 5: महाराष्ट्र नेटवर्क */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'network' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('network')}>
                  <span>🗺️ महाराष्ट्र नेटवर्क</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'network' ? '▲' : '▼'}</span>
                </button>
                {expandedPillar === 'network' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/network" onClick={handleLinkClick}>🏛️ पुणे विभाग (पुणे, सातारा, कोल्हापूर)</Link>
                    <Link to="/network" onClick={handleLinkClick}>🌊 कोकण विभाग (मुंबई, ठाणे, पालघर)</Link>
                    <Link to="/network" onClick={handleLinkClick}>⛵ रायगड, रत्नागिरी, सिंधुदुर्ग</Link>
                    <Link to="/network" onClick={handleLinkClick}>🌄 छ. संभाजीनगर, जालना, बीड</Link>
                    <Link to="/network" onClick={handleLinkClick}>🌾 नाशिक, अहमदनगर, जळगाव, धुळे</Link>
                    <Link to="/network" onClick={handleLinkClick}>🌿 विदर्भ (अमरावती, नागपूर, चंद्रपूर)</Link>
                    <Link to="/network" onClick={handleLinkClick}>🚩 बेळगाव, कारवार सीमावर्ती शाखा</Link>
                    <Link to="/network" onClick={handleLinkClick}>🏢 ३६ जिल्हा समन्वय केंद्रे</Link>
                  </div>
                )}
              </div>

              {/* Pillar 6: सर्व दालने, सनद व ओळख */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'all' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('all')}>
                  <span>📂 सर्व दालने व सनद</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'all' ? '▲' : '▼'}</span>
                </button>
                {expandedPillar === 'all' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/card" onClick={handleLinkClick}>🪪 डिजिटल सभासद ओळखपत्र</Link>
                    <Link to="/calendar" onClick={handleLinkClick}>📅 मराठा दिनदर्शिका</Link>
                    <Link to="/about" onClick={handleLinkClick}>🏛️ संस्था परिचय व सल्लागार मंडळ</Link>
                    <Link to="/governance" onClick={handleLinkClick}>🎯 व्हिजन व DPDP २०२३ धोरण</Link>
                    <Link to="/blueprint" onClick={handleLinkClick}>🧭 ५० विभाग मास्टर ब्लूप्रिंट</Link>
                    <Link to="/achievers" onClick={handleLinkClick}>🏆 राष्ट्रीय मराठा गौरव व अचीव्हर्स</Link>
                    <Link to="/roles-matrix" onClick={handleLinkClick}>⚖️ भूमिका व पात्रता मॅट्रिक्स</Link>
                    <Link to="/donation" onClick={handleLinkClick}>❤️ दुर्ग संवर्धन व देणगी कोष</Link>
                    <Link to="/contact" onClick={handleLinkClick}>☎️ संपर्क व तक्रार निवारण</Link>
                    {user && (user.role === 'superadmin' || user.role === 'admin' || user.role === 'ceo' || user.role === 'district_admin') && (
                      <Link to="/crm" onClick={handleLinkClick} style={{ color: '#DC2626', fontWeight: 800, borderTop: '1px dashed #CBD5E1', paddingTop: '8px' }}>
                        🛡️ अधिकारी CRM पोर्टल →
                      </Link>
                    )}
                    {user && user.role === 'superadmin' && (
                      <Link to="/superadmin" onClick={handleLinkClick} style={{ color: '#D97706', fontWeight: 800 }}>
                        👑 SuperAdmin कन्सोल →
                      </Link>
                    )}
                    {user && (user.role === 'superadmin' || user.role === 'admin' || user.role === 'ceo') && (
                      <Link to="/admin/cms" onClick={handleLinkClick} style={{ color: '#7C3AED', fontWeight: 800 }}>
                        🎨 CMS संपादक →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Drawer Footer */}
          <div className="cm-drawer-footer">
            <div className="cm-drawer-helpline">
              📞 २४×७ समाज हेल्पलाईन: <strong>{getContent('forms.contactSupport.emergencyHelpline', '१८००-१२३-१६७४')}</strong>
            </div>
            <div className="cm-drawer-footer-links">
              <Link to="/governance" onClick={handleLinkClick}>DPDP धोरण</Link>
              <span>•</span>
              <Link to="/about" onClick={handleLinkClick}>संस्था परिचय</Link>
              <span>•</span>
              <Link to="/contact" onClick={handleLinkClick}>मदत व संपर्क</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
