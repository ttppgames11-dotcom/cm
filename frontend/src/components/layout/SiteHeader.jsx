import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import apiClient from '../../services/apiClient';
import { unreadBadge, NOTIFICATIONS_CHANGED } from '../../pages/member/notificationList';

export default function SiteHeader({ onOpenSearch }) {
  const { user, logout } = useAuth();
  const { getContent } = useSiteContent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!(user && (user.id || user._id) && (typeof window === 'undefined' || localStorage.getItem('cm_logged_in') === 'true'));

  // The bell's unread count, checked again on every page change and whenever notifications are marked read.
  useEffect(() => {
    if (!isLoggedIn) {
      setUnread(0);
      return undefined;
    }
    let cancelled = false;
    const recount = () => apiClient.getMyNotifications()
      .then((res) => { if (!cancelled) setUnread(res.unread); })
      .catch(() => { if (!cancelled) setUnread(0); });
    recount();
    window.addEventListener(NOTIFICATIONS_CHANGED, recount);
    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_CHANGED, recount);
    };
  }, [isLoggedIn, location.pathname]);

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
            <span>ðŸš© <strong>à¤œà¤¯ à¤œà¤¿à¤œà¤¾à¤Š Â· à¤œà¤¯ à¤¶à¤¿à¤µà¤°à¤¾à¤¯ Â· à¤œà¤¯ à¤¶à¤‚à¤­à¥‚à¤°à¤¾à¤œà¥‡</strong></span>
            <span className="topbar-divider">|</span>
            <span className="topbar-tagline">{getContent('texts.tagline', 'Connect Maratha à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ ')}</span>
          </div>
          <div className="right-info">
            <Link to="/calendar" style={{ color: '#FDE68A', fontWeight: 800, textDecoration: 'none' }}>ðŸ“… à¤¦à¤¿à¤¨à¤¦à¤°à¥à¤¶à¤¿à¤•à¤¾</Link>
            <span>|</span>
            <Link to="/universe" style={{ color: '#FED7AA', fontWeight: 700, textDecoration: 'none' }}>ðŸŒŒ à¤®à¤¹à¤¾à¤µà¤¿à¤¶à¥à¤µ</Link>
            <span>|</span>
            <span>ðŸ“ž <strong>{getContent('forms.contactSupport.emergencyHelpline', 'à¥§à¥®à¥¦à¥¦-à¥§à¥¨à¥©-à¥§à¥¬à¥­à¥ª')}</strong></span>
            <span className="topbar-hide-tablet">|</span>
            <Link to="/about" className="topbar-hide-tablet">à¤¸à¤‚à¤¸à¥à¤¥à¤¾ à¤ªà¤°à¤¿à¤šà¤¯</Link>
            <span className="topbar-hide-tablet">|</span>
            <LanguageSwitcher variant="topbar" />
          </div>
        </div>
      </div>

      {/* ========== MAIN HEADER ========== */}
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand-desktop" onClick={handleLinkClick} title="Connect Maratha - à¤®à¥à¤–à¥à¤¯à¤ªà¥ƒà¤·à¥à¤ " aria-label="Connect Maratha Home">
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
                <span className="en">CONNECT</span> <span className="mr">à¤®à¤°à¤¾à¤ à¤¾</span>
              </div>
              <div className="brand-sub" style={{ color: '#7C2D12', fontWeight: '800', fontSize: '0.74rem', letterSpacing: '0.3px', opacity: 1 }}>
                à¤…à¤–à¤¿à¤² à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ 
              </div>
            </div>
          </Link>

          {/* Desktop Navigation (Hidden <= 1024px) */}
          <nav className="desktop-nav">
            {!isLoggedIn ? (
              <>
                <NavLink to="/about" onClick={handleLinkClick}>
                  ðŸ›ï¸ à¤†à¤®à¤šà¥à¤¯à¤¾à¤¬à¤¦à¥à¤¦à¤²
                </NavLink>
                <NavLink to="/vision" onClick={handleLinkClick}>
                  ðŸŽ¯ à¤µà¥à¤¹à¤¿à¤œà¤¨
                </NavLink>
                <NavLink to="/goals" onClick={handleLinkClick}>
                  ðŸ† à¤‰à¤¦à¥à¤¦à¤¿à¤·à¥à¤Ÿà¥‡
                </NavLink>
                <NavLink to="/why-join" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>
                  â­ à¤¸à¤¹à¤­à¤¾à¤—à¥€ à¤•à¤¾ à¤µà¥à¤¹à¤¾à¤µà¥‡?
                </NavLink>
                <NavLink to="/contact" onClick={handleLinkClick}>
                  â˜Žï¸ à¤¸à¤‚à¤ªà¤°à¥à¤•
                </NavLink>
              </>
            ) : (
              <>
                {/* 1. Community (à¤•à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€) */}
                <div className="nav-item-has-mega">
                  <Link to="/community" onClick={handleLinkClick}>ðŸ‘¥ à¤•à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€ â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸš© à¤®à¤‚à¤š à¤µ à¤¸à¤¾à¤®à¤¾à¤œà¤¿à¤• à¤•à¤²à¥à¤¯à¤¾à¤£</div>
                        <Link to="/community" onClick={handleLinkClick}>ðŸ’¬ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤•à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€ à¤®à¤‚à¤š</Link>
                        <Link to="/blood" onClick={handleLinkClick} style={{ color: '#DC2626', fontWeight: 800 }}>ðŸ©¸ à¥¨à¥ªÃ—à¥­ à¤†à¤ªà¤¤à¥à¤•à¤¾à¤²à¥€à¤¨ à¤°à¤•à¥à¤¤ à¤®à¤¦à¤¤</Link>
                        <Link to="/matrimony" onClick={handleLinkClick}>ðŸ’ à¤®à¤°à¤¾à¤ à¤¾ à¤µà¤§à¥‚-à¤µà¤° à¤¸à¥‚à¤šà¤• à¤•à¥‡à¤‚à¤¦à¥à¤°</Link>
                        <Link to="/women" onClick={handleLinkClick}>ðŸŒ¸ à¤®à¤¹à¤¿à¤²à¤¾ à¤¸à¤•à¥à¤·à¤®à¥€à¤•à¤°à¤£ à¤•à¤•à¥à¤·</Link>
                        <Link to="/donation" onClick={handleLinkClick}>â¤ï¸ à¤¦à¥à¤°à¥à¤— à¤¸à¤‚à¤µà¤°à¥à¤§à¤¨ à¤µ à¤¦à¥‡à¤£à¤—à¥€ à¤•à¥‹à¤·</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ¤ à¤¸à¤‚à¤˜à¤Ÿà¤¨à¤¾ à¤µ à¤¨à¥‡à¤¤à¥ƒà¤¤à¥à¤µ</div>
                        <Link to="/organizations" onClick={handleLinkClick}>ðŸ¤ à¤®à¤°à¤¾à¤ à¤¾ à¤¸à¤¾à¤®à¤¾à¤œà¤¿à¤• à¤¸à¤‚à¤˜à¤Ÿà¤¨à¤¾</Link>
                        <Link to="/political" onClick={handleLinkClick}>ðŸ›ï¸ à¤°à¤¾à¤œà¤•à¥€à¤¯ à¤¨à¥‡à¤¤à¥ƒà¤¤à¥à¤µ à¤µ à¤ªà¤•à¥à¤·</Link>
                        <Link to="/social-workers" onClick={handleLinkClick}>ðŸ¤ à¤¨à¤¿à¤·à¥à¤ à¤¾à¤µà¤‚à¤¤ à¤¸à¤®à¤¾à¤œà¤¸à¥‡à¤µà¤•</Link>
                        <Link to="/officers" onClick={handleLinkClick}>â­ à¤®à¤°à¤¾à¤ à¤¾ à¤¸à¤¨à¤¦à¥€ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ (IAS/IPS)</Link>
                        <Link to="/maratha-news" onClick={handleLinkClick}>ðŸ“º à¤®à¤°à¤¾à¤ à¤¾ à¤¨à¥à¤¯à¥‚à¤œ à¤µ à¤ˆ-à¤ªà¥‡à¤ªà¤°à¥à¤¸</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Business (à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯) */}
                <div className="nav-item-has-mega">
                  <Link to="/business" onClick={handleLinkClick}>ðŸ’¼ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ¤ à¤¸à¤‚à¤—à¤® à¤µ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¸à¤‚à¤§à¥€</div>
                        <Link to="/business" onClick={handleLinkClick}>ðŸ¢ à¤…à¤–à¤¿à¤² à¤®à¤°à¤¾à¤ à¤¾ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶à¤¿à¤•à¤¾</Link>
                        <Link to="/sangam" onClick={handleLinkClick}>ðŸ¤ à¤¬à¤¿à¤à¤¨à¥‡à¤¸ à¤¸à¤‚à¤—à¤® à¤µ à¤šà¥…à¤ªà¥à¤Ÿà¤°à¥à¤¸</Link>
                        <Link to="/leads" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>ðŸš€ B2B à¤¸à¤‚à¤§à¥€ à¤µ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¸à¥Œà¤¦à¥‡</Link>
                        <Link to="/referrals" onClick={handleLinkClick}>ðŸ”— à¤°à¥‡à¤«à¤°à¤² à¤µ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤¦à¥‡à¤µà¤¾à¤£à¤˜à¥‡à¤µà¤¾à¤£</Link>
                        <Link to="/meetings" onClick={handleLinkClick}>â˜• 1-to-1 à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥ˆà¤ à¤•à¤¾</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ­ à¤‰à¤¦à¥à¤¯à¥‹à¤— à¤µ à¤µà¤¿à¤¤à¥à¤¤ à¤¸à¤‚à¤¸à¥à¤¥à¤¾</div>
                        <Link to="/bank" onClick={handleLinkClick}>ðŸ¦ à¤®à¤°à¤¾à¤ à¤¾ à¤¬à¤à¤• à¤µ à¤µà¤¿à¤¤à¥à¤¤ à¤¸à¤‚à¤¸à¥à¤¥à¤¾</Link>
                        <Link to="/builders" onClick={handleLinkClick}>ðŸ—ï¸ à¤®à¤°à¤¾à¤ à¤¾ à¤¬à¤¿à¤²à¥à¤¡à¤°à¥à¤¸ à¤µ à¤¡à¥‡à¤µà¥à¤¹à¤²à¤ªà¤°à¥à¤¸</Link>
                        <Link to="/manufacturers" onClick={handleLinkClick}>ðŸ­ à¤®à¤°à¤¾à¤ à¤¾ à¤®à¥…à¤¨à¥à¤¯à¥à¤«à¥…à¤•à¥à¤šà¤°à¤°à¥à¤¸ à¤µ à¤‰à¤¦à¥à¤¯à¥‹à¤—</Link>
                        <Link to="/dairy" onClick={handleLinkClick}>ðŸ¥› à¤®à¤°à¤¾à¤ à¤¾ à¤¦à¥‚à¤§ à¤µ à¤•à¥ƒà¤·à¥€ à¤¸à¤‚à¤•à¤²à¤¨ à¤•à¥‡à¤‚à¤¦à¥à¤°</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Education (à¤¶à¤¿à¤•à¥à¤·à¤£) */}
                <div className="nav-item-has-mega">
                  <Link to="/education" onClick={handleLinkClick}>ðŸŽ“ à¤¶à¤¿à¤•à¥à¤·à¤£ â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸŽ“ à¤‰à¤šà¥à¤š à¤¶à¤¿à¤•à¥à¤·à¤£ à¤µ à¤¶à¤¿à¤·à¥à¤¯à¤µà¥ƒà¤¤à¥à¤¤à¥€</div>
                        <Link to="/education" onClick={handleLinkClick}>ðŸŽ“ à¤‰à¤šà¥à¤š à¤¶à¤¿à¤•à¥à¤·à¤£ à¤µ à¤•à¤°à¤¿à¤…à¤° à¤ªà¥‹à¤°à¥à¤Ÿà¤²</Link>
                        <Link to="/colleges" onClick={handleLinkClick}>ðŸ›ï¸ à¤¨à¤¾à¤®à¤¾à¤‚à¤•à¤¿à¤¤ à¤®à¤¹à¤¾à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤²à¤¯à¥‡ à¤µ à¤¸à¤‚à¤¸à¥à¤¥à¤¾</Link>
                        <Link to="/scholarships" onClick={handleLinkClick} style={{ color: '#EA580C', fontWeight: 800 }}>ðŸ“œ à¤®à¤°à¤¾à¤ à¤¾ à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤°à¥à¤¥à¥€ à¤¶à¤¿à¤·à¥à¤¯à¤µà¥ƒà¤¤à¥à¤¤à¥€</Link>
                        <Link to="/quiz" onClick={handleLinkClick}>ðŸŽ¯ à¤¸à¥à¤µà¤°à¤¾à¤œà¥à¤¯ à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸ à¤®à¤¹à¤¾à¤•à¥à¤µà¤¿à¤</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ“š à¤œà¥à¤žà¤¾à¤¨à¤•à¥‹à¤¶ à¤µ à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤¦à¤¾à¤²à¤¨</div>
                        <Link to="/dnyankosh" onClick={handleLinkClick}>ðŸ’¡ à¤®à¤°à¤¾à¤ à¤¾ à¤œà¥à¤žà¤¾à¤¨à¤•à¥‹à¤¶ (Dnyankosh)</Link>
                        <Link to="/history/granthalaya" onClick={handleLinkClick}>ðŸ“š à¤®à¤°à¤¾à¤ à¤¾ à¤—à¥à¤°à¤‚à¤¥à¤¾à¤²à¤¯ à¤µ à¤¦à¥à¤°à¥à¤®à¥€à¤³ à¤¬à¤–à¤°à¥€</Link>
                        <Link to="/time-machine" onClick={handleLinkClick}>â³ à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤Ÿà¤¾à¤‡à¤® à¤®à¤¶à¥€à¤¨</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Jobs (à¤°à¥‹à¤œà¤—à¤¾à¤°) */}
                <div className="nav-item-has-mega">
                  <Link to="/jobs" onClick={handleLinkClick}>ðŸ’¼ à¤°à¥‹à¤œà¤—à¤¾à¤° â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ’¼ à¤­à¤°à¤¤à¥€ à¤µ à¤•à¤°à¤¿à¤…à¤° à¤•à¥‡à¤‚à¤¦à¥à¤°</div>
                        <Link to="/jobs" onClick={handleLinkClick} style={{ color: '#EA580C', fontWeight: 800 }}>ðŸ’¼ à¤®à¤°à¤¾à¤ à¤¾ à¤°à¥‹à¤œà¤—à¤¾à¤° à¤•à¥‡à¤‚à¤¦à¥à¤° (Jobs Portal)</Link>
                        <Link to="/directory" onClick={handleLinkClick}>ðŸ‘¨â€ðŸ’¼ à¤ªà¥à¤°à¥‹à¤«à¥‡à¤¶à¤¨à¥‡à¤²à¥à¤¸ à¤¡à¤¿à¤°à¥‡à¤•à¥à¤Ÿà¤°à¥€</Link>
                        <Link to="/doctors" onClick={handleLinkClick}>ðŸ‘¨â€âš•ï¸ à¤®à¤°à¤¾à¤ à¤¾ à¤¤à¤œà¥à¤œà¥à¤ž à¤¡à¥‰à¤•à¥à¤Ÿà¤°à¥à¤¸</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ› ï¸ à¤¸à¥‡à¤µà¤¾ à¤µ à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•à¥€à¤¯ à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨</div>
                        <Link to="/services" onClick={handleLinkClick}>ðŸ› ï¸ à¤¸à¥‡à¤µà¤¾ à¤µ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥à¤•à¤¿à¤‚à¤—</Link>
                        <Link to="/officers" onClick={handleLinkClick}>â­ à¤¸à¤¨à¤¦à¥€ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¸à¥à¤ªà¤°à¥à¤§à¤¾ à¤ªà¤°à¥€à¤•à¥à¤·à¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤°</Link>
                        <Link to="/speakers" onClick={handleLinkClick}>ðŸŽ™ï¸ à¤ªà¥à¤°à¥‡à¤°à¤• à¤µà¤•à¥à¤¤à¥‡ à¤µ à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤•</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Networking (à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¤¿à¤‚à¤—) */}
                <div className="nav-item-has-mega">
                  <Link to="/network" onClick={handleLinkClick}>ðŸŒ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¤¿à¤‚à¤— â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ—ºï¸ à¤°à¤¾à¤œà¥à¤¯ à¤µ à¤œà¤¿à¤²à¥à¤¹à¤¾ à¤¸à¤®à¤¨à¥à¤µà¤¯</div>
                        <Link to="/network" onClick={handleLinkClick}>ðŸ—ºï¸ à¥©à¥¬ à¤œà¤¿à¤²à¥à¤¹à¤¾ à¤¸à¤®à¤¨à¥à¤µà¤¯ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•</Link>
                        <Link to="/network" onClick={handleLinkClick}>ðŸ›ï¸ à¥¬ à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•à¥€à¤¯ à¤µà¤¿à¤­à¤¾à¤— à¤•à¥‡à¤‚à¤¦à¥à¤°à¥‡</Link>
                        <Link to="/platform" onClick={handleLinkClick}>ðŸ“Š à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤¡à¥‡à¤Ÿà¤¾ à¤ªà¥à¤²à¥…à¤Ÿà¤«à¥‰à¤°à¥à¤®</Link>
                        <Link to="/calendar" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>ðŸ“… à¤®à¤°à¤¾à¤ à¤¾ à¤¦à¤¿à¤¨à¤¦à¤°à¥à¤¶à¤¿à¤•à¤¾ (à¤ªà¤‚à¤šà¤¾à¤‚à¤—)</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ¤ à¤¸à¤¹à¤•à¤¾à¤°à¥à¤¯ à¤µ à¤¸à¤­à¤¾à¤¸à¤¦à¤¤à¥à¤µ</div>
                        <Link to="/referrals" onClick={handleLinkClick}>ðŸ”— à¤¬à¤¿à¤à¤¨à¥‡à¤¸ à¤°à¥‡à¤«à¤°à¤² à¤¦à¥‡à¤µà¤¾à¤£à¤˜à¥‡à¤µà¤¾à¤£</Link>
                        <Link to="/meetings" onClick={handleLinkClick}>â˜• 1-to-1 à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥ˆà¤ à¤•à¤¾</Link>
                        <Link to="/roles-matrix" onClick={handleLinkClick}>âš–ï¸ à¥«à¥¬ à¤ªà¤¦à¥‡ à¤µ à¤ªà¤¾à¤¤à¥à¤°à¤¤à¤¾ à¤®à¥…à¤Ÿà¥à¤°à¤¿à¤•à¥à¤¸</Link>
                        <Link to="/card" onClick={handleLinkClick} style={{ color: '#EA580C', fontWeight: 800 }}>ðŸªª à¤…à¤§à¤¿à¤•à¥ƒà¤¤ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤¸à¤­à¤¾à¤¸à¤¦ à¤•à¤¾à¤°à¥à¤¡</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. History (à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸) */}
                <div className="nav-item-has-mega">
                  <Link to="/history" onClick={handleLinkClick}>âš”ï¸ à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸ â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸš© à¤®à¤¹à¤¾à¤ªà¥à¤°à¥à¤· à¤µ à¤¶à¥Œà¤°à¥à¤¯à¤—à¤¾à¤¥à¤¾</div>
                        <Link to="/history/shivaji-maharaj" onClick={handleLinkClick}>ðŸ‘‘ à¤›à¤¤à¥à¤°à¤ªà¤¤à¥€ à¤¶à¤¿à¤µà¤¾à¤œà¥€ à¤®à¤¹à¤¾à¤°à¤¾à¤œ à¤šà¤°à¤¿à¤¤à¥à¤°</Link>
                        <Link to="/history/sambhaji-maharaj" onClick={handleLinkClick}>âš”ï¸ à¤›à¤¤à¥à¤°à¤ªà¤¤à¥€ à¤¸à¤‚à¤­à¤¾à¤œà¥€ à¤®à¤¹à¤¾à¤°à¤¾à¤œ à¤¶à¥Œà¤°à¥à¤¯à¤—à¤¾à¤¥à¤¾</Link>
                        <Link to="/history/balidan-maas" onClick={handleLinkClick}>ðŸ•¯ï¸ à¤§à¤°à¥à¤®à¤µà¥€à¤° à¤¬à¤²à¤¿à¤¦à¤¾à¤¨ à¤®à¤¾à¤¸ à¤¸à¥à¤®à¤°à¤£</Link>
                        <Link to="/history/rajmata-jijau" onClick={handleLinkClick}>ðŸŒ¸ à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤®à¤¾à¤¤à¤¾ à¤œà¤¿à¤œà¤¾à¤Š à¤®à¤¾à¤à¤¸à¤¾à¤¹à¥‡à¤¬</Link>
                        <Link to="/history/bajirao-peshwa" onClick={handleLinkClick}>ðŸŽ à¤¶à¥à¤°à¥€à¤®à¤‚à¤¤ à¤¥à¥‹à¤°à¤²à¥‡ à¤¬à¤¾à¤œà¥€à¤°à¤¾à¤µ à¤ªà¥‡à¤¶à¤µà¥‡</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ° à¤•à¤¿à¤²à¥à¤²à¥‡, à¤°à¤£à¤¾à¤‚à¤—à¤£à¥‡ à¤µ à¤†à¤°à¤®à¤¾à¤°</div>
                        <Link to="/forts" onClick={handleLinkClick}>ðŸ° à¤¸à¤¹à¥à¤¯à¤¾à¤¦à¥à¤°à¥€à¤šà¥‡ à¥©à¥«à¥¦+ à¤—à¤¡à¤•à¤¿à¤²à¥à¤²à¥‡</Link>
                        <Link to="/history/battles" onClick={handleLinkClick}>âš”ï¸ à¤ªà¥à¤°à¤®à¥à¤– à¥­ à¤°à¤£à¤¾à¤‚à¤—à¤£à¥‡ à¤µ à¤µà¥à¤¯à¥‚à¤¹à¤°à¤šà¤¨à¤¾</Link>
                        <Link to="/history/navy" onClick={handleLinkClick}>âš“ à¤®à¤°à¤¾à¤ à¤¾ à¤†à¤°à¤®à¤¾à¤° à¤µ à¤œà¤²à¤¦à¥à¤°à¥à¤—</Link>
                        <Link to="/shivcharitra" onClick={handleLinkClick} style={{ color: '#C73800', fontWeight: 800 }}>ðŸš© à¤¶à¤¿à¤µà¤šà¤°à¤¿à¤¤à¥à¤° à¤•à¤¥à¤¨ (à¥§à¥« à¤­à¤¾à¤—)</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Culture (à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€) */}
                <div className="nav-item-has-mega">
                  <Link to="/culture" onClick={handleLinkClick}>ðŸš© à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€ â–¾</Link>
                  <div className="mega-menu">
                    <div className="mega-menu-grid">
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸ—ºï¸ à¤µà¤¾à¤°à¤¸à¤¾, à¤¸à¤£ à¤µ à¤¦à¥‡à¤µà¤¸à¥à¤¥à¤¾à¤¨à¥‡</div>
                        <Link to="/culture" onClick={handleLinkClick}>ðŸš© à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€ à¤®à¤¹à¤¾à¤¦à¤¾à¤²à¤¨</Link>
                        <Link to="/culture/heritage-map" onClick={handleLinkClick}>ðŸ—ºï¸ à¤¬à¤¹à¥à¤¸à¥à¤¤à¤°à¥€à¤¯ à¤ªà¤°à¤¸à¥à¤ªà¤°à¤¸à¤‚à¤µà¤¾à¤¦à¥€ à¤¨à¤•à¤¾à¤¶à¤¾</Link>
                        <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>ðŸ›• à¤—à¥à¤°à¤¾à¤®à¤¦à¥ˆà¤µà¤¤ à¤µ à¤•à¥à¤²à¤¦à¥ˆà¤µà¤¤ à¤ªà¤°à¤‚à¤ªà¤°à¤¾</Link>
                        <Link to="/culture/shivkal-festivals" onClick={handleLinkClick}>ðŸš© à¤¶à¤¿à¤µà¤•à¤¾à¤²à¥€à¤¨ à¤‰à¤¤à¥à¤¸à¤µ à¤µ à¤¸à¤£</Link>
                        <Link to="/history/knowledge-graph" onClick={handleLinkClick}>âš¡ à¤˜à¤Ÿà¤¨à¤¾ â†” à¤¸à¥à¤¥à¤³à¥‡ à¤¨à¥‰à¤²à¥‡à¤œ à¤—à¥à¤°à¤¾à¤«</Link>
                      </div>
                      <div className="mega-col">
                        <div className="mega-col-title">ðŸŽ­ à¤­à¤¾à¤·à¤¾, à¤–à¤¾à¤¦à¥à¤¯à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€ à¤µ à¤•à¤²à¤¾</div>
                        <Link to="/culture/dialects" onClick={handleLinkClick}>ðŸ—£ï¸ à¤®à¤°à¤¾à¤ à¥€ à¤¬à¥‹à¤²à¥€à¤­à¤¾à¤·à¤¾ à¤¦à¤¾à¤²à¤¨</Link>
                        <Link to="/culture/food" onClick={handleLinkClick}>ðŸ² à¤ªà¤¾à¤°à¤‚à¤ªà¤¾à¤°à¤¿à¤• à¤–à¤¾à¤¦à¥à¤¯à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€</Link>
                        <Link to="/artists" onClick={handleLinkClick}>ðŸŽ­ à¤•à¤²à¤¾à¤•à¤¾à¤°, à¤—à¤¾à¤¯à¤• à¤µ à¤°à¤‚à¤—à¤­à¥‚à¤®à¥€</Link>
                        <Link to="/movies" onClick={handleLinkClick}>ðŸŽ¬ à¤¦à¤°à¥à¤œà¥‡à¤¦à¤¾à¤° à¤®à¤°à¤¾à¤ à¥€ à¤šà¤¿à¤¤à¥à¤°à¤ªà¤Ÿ</Link>
                        <Link to="/gallery" onClick={handleLinkClick}>ðŸ–¼ï¸ à¤†à¤ªà¥à¤²à¤¾ à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤›à¤¾à¤¯à¤¾à¤šà¤¿à¤¤à¥à¤° à¤¦à¤¾à¤²à¤¨</Link>
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
              title="à¤¶à¥‹à¤§ / Search (Ctrl+K)"
              aria-label="à¤¶à¥‹à¤§ / Search"
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
              ðŸ”
            </button>

            <LanguageSwitcher variant="header" />

            <Link
              to="/universe"
              onClick={handleLinkClick}
              className="btn universe-btn"
              title="Connect Maratha â€” Expanded Feature Universe">
              <span>ðŸŒŒ</span>
              <span className="universe-btn-text">à¤®à¤¹à¤¾à¤µà¤¿à¤¶à¥à¤µ</span>
            </Link>

            {isLoggedIn ? (
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
                  title="à¤®à¤¾à¤à¤¾ à¤¡à¥…à¤¶à¤¬à¥‹à¤°à¥à¤¡"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0] || 'à¤¡à¥…à¤¶à¤¬à¥‹à¤°à¥à¤¡'}
                  </span>
                </Link>
                <Link
                  to="/notifications"
                  onClick={handleLinkClick}
                  style={{
                    position: 'relative',
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
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
                  }}
                  title={unread ? `${unread} à¤¨ à¤µà¤¾à¤šà¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¸à¥‚à¤šà¤¨à¤¾` : 'à¤¸à¥‚à¤šà¤¨à¤¾ (Notifications)'}
                  aria-label="à¤¸à¥‚à¤šà¤¨à¤¾ (Notifications)"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadBadge(unread) && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px', minWidth: '18px', height: '18px', padding: '0 4px',
                      borderRadius: '9px', background: '#DC2626', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'
                    }}>
                      {unreadBadge(unread)}
                    </span>
                  )}
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
                  title="à¤®à¤¾à¤à¥‡ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤“à¤³à¤–à¤ªà¤¤à¥à¤° (Digital ID Card)"
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
                  title="à¤–à¤¾à¤¤à¥à¤¯à¤¾à¤¤à¥‚à¤¨ à¤¬à¤¾à¤¹à¥‡à¤° à¤ªà¤¡à¤¾ (Logout)"
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
                <Link to="/login" className="btn btn-outline header-login-btn" onClick={handleLinkClick} title="à¤¸à¤­à¤¾à¤¸à¤¦ à¤²à¥‰à¤—à¤¿à¤¨">
                  ðŸ‘¤ <span className="header-btn-text">à¤²à¥‰à¤—à¤¿à¤¨</span>
                </Link>
                <Link to="/register" className="btn btn-primary header-register-btn" onClick={handleLinkClick} title="à¤¨à¤µà¥€à¤¨ à¤¨à¥‹à¤‚à¤¦à¤£à¥€">
                  ðŸš© <span className="header-btn-text">à¤¨à¥‹à¤‚à¤¦à¤£à¥€</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "à¤®à¥‡à¤¨à¥‚ à¤¬à¤‚à¤¦ à¤•à¤°à¤¾" : "à¤®à¥‡à¤¨à¥‚ à¤‰à¤˜à¤¡à¤¾"}
              aria-expanded={mobileOpen}>
              <span className="hamburger-icon">{mobileOpen ? 'âœ•' : 'â˜°'}</span>
              <span className="hamburger-text">{mobileOpen ? 'à¤¬à¤‚à¤¦' : 'à¤®à¥‡à¤¨à¥‚'}</span>
            </button>
          </div>
        </div>

        {/* Mobile / Responsive Horizontal Category Navigation Bar */}
        <nav className="site-mobile-subnav" aria-label="à¤®à¥à¤–à¥à¤¯ à¤µà¤¿à¤­à¤¾à¤— à¤¨à¥‡à¤µà¥à¤¹à¤¿à¤—à¥‡à¤¶à¤¨">
          <div className="site-mobile-subnav-scroll">
            <button
              type="button"
              className="subnav-pill subnav-pill-dropdown-trigger"
              onClick={() => setMobileOpen(true)}
              aria-label="à¤¸à¤°à¥à¤µ à¤®à¥‡à¤¨à¥‚ à¤‰à¤˜à¤¡à¤¾"
            >
              <span className="subnav-pill-icon">ðŸ“‘</span> à¤¸à¤°à¥à¤µ à¤®à¥‡à¤¨à¥‚ â–¾
            </button>
            <NavLink to="/" end onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
              <span className="subnav-pill-icon">ðŸ </span> à¤®à¥à¤–à¥à¤¯à¤ªà¥ƒà¤·à¥à¤ 
            </NavLink>
            {!isLoggedIn ? (
              <>
                <NavLink to="/about" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ›ï¸</span> à¤†à¤®à¤šà¥à¤¯à¤¾à¤¬à¤¦à¥à¤¦à¤²
                </NavLink>
                <NavLink to="/vision" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸŽ¯</span> à¤µà¥à¤¹à¤¿à¤œà¤¨
                </NavLink>
                <NavLink to="/goals" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ†</span> à¤‰à¤¦à¥à¤¦à¤¿à¤·à¥à¤Ÿà¥‡
                </NavLink>
                <NavLink to="/why-join" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill highlight-gold ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">â­</span> à¤¸à¤¹à¤­à¤¾à¤—à¥€ à¤µà¥à¤¹à¤¾
                </NavLink>
                <NavLink to="/contact" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">â˜Žï¸</span> à¤¸à¤‚à¤ªà¤°à¥à¤•
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/history" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">âš”ï¸</span> à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸
                </NavLink>
                <NavLink to="/culture" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ›ï¸</span> à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€
                </NavLink>
                <NavLink to="/calendar" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill highlight-gold ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ“…</span> à¤¦à¤¿à¤¨à¤¦à¤°à¥à¤¶à¤¿à¤•à¤¾
                </NavLink>
                <NavLink to="/business/directory" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ’¼</span> à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯
                </NavLink>
                <NavLink to="/community" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ‘¥</span> à¤¸à¤®à¤¾à¤œ
                </NavLink>
                <NavLink to="/universe" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill highlight-universe ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸŒŒ</span> à¤®à¤¹à¤¾à¤µà¤¿à¤¶à¥à¤µ
                </NavLink>
                <NavLink to="/forts" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ°</span> à¤—à¤¡-à¤•à¤¿à¤²à¥à¤²à¥‡
                </NavLink>
                <NavLink to="/temples" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ›•</span> à¤®à¤‚à¤¦à¤¿à¤°à¥‡
                </NavLink>
                <NavLink to="/sangam" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ¤</span> à¤¸à¤‚à¤—à¤®
                </NavLink>
                <NavLink to="/gallery" onClick={handleLinkClick} className={({ isActive }) => `subnav-pill ${isActive ? 'active' : ''}`}>
                  <span className="subnav-pill-icon">ðŸ–¼ï¸</span> à¤¦à¤¾à¤²à¤¨à¥‡
                </NavLink>
              </>
            )}
            <button
              type="button"
              className="subnav-pill subnav-pill-more"
              onClick={() => setMobileOpen(true)}
              aria-label="à¤¸à¤°à¥à¤µ à¥«à¥¦+ à¤µà¤¿à¤­à¤¾à¤— à¤µ à¤®à¥‡à¤¨à¥‚"
            >
              <span className="subnav-pill-icon">â˜°</span> à¤…à¤§à¤¿à¤•
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
        aria-label="à¤®à¥à¤–à¥à¤¯ à¤¨à¥‡à¤µà¥à¤¹à¤¿à¤—à¥‡à¤¶à¤¨ à¤®à¥‡à¤¨à¥‚">
        
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
              <div className="cm-drawer-brand-title">CONNECT à¤®à¤°à¤¾à¤ à¤¾</div>
              <div className="cm-drawer-brand-sub">à¤…à¤–à¤¿à¤² à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ </div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageSwitcher variant="header" />
            <button
              type="button"
              className="cm-drawer-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="à¤®à¥‡à¤¨à¥‚ à¤¬à¤‚à¤¦ à¤•à¤°à¤¾">
              âœ•
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="cm-drawer-body">
          {/* User Status / Auth Action Card */}
          <div className="cm-drawer-user-card">
            {isLoggedIn ? (
              <>
                <div className="cm-drawer-user-header">
                  <div className="cm-drawer-user-avatar">ðŸ‘¤</div>
                  <div>
                    <div className="cm-drawer-user-name">{user.name || 'à¤¸à¤­à¤¾à¤¸à¤¦'}</div>
                    <span className="cm-drawer-user-badge">
                      {user.role === 'superadmin' ? 'ðŸ‘‘ SuperAdmin' : user.role === 'admin' ? 'ðŸ›¡ï¸ Admin' : user.role === 'business_member' ? 'ðŸ’¼ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¸à¤­à¤¾à¤¸à¤¦' : 'ðŸš© à¤…à¤§à¤¿à¤•à¥ƒà¤¤ à¤¸à¤­à¤¾à¤¸à¤¦'}
                    </span>
                  </div>
                </div>
                <div className="cm-drawer-user-btns">
                  <Link to="/dashboard" onClick={handleLinkClick} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>à¤¡à¥…à¤¶à¤¬à¥‹à¤°à¥à¤¡</span>
                  </Link>
                  <Link to="/notifications" onClick={handleLinkClick} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>ðŸ”” à¤¸à¥‚à¤šà¤¨à¤¾{unreadBadge(unread) ? ` (${unreadBadge(unread)})` : ''}</span>
                  </Link>
                  <Link to="/card" onClick={handleLinkClick} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                      <circle cx="7" cy="15" r="1.5" />
                      <line x1="12" y1="15" x2="18" y2="15" />
                    </svg>
                    <span>à¤“à¤³à¤–à¤ªà¤¤à¥à¤°</span>
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
                    <span>à¤¬à¤¾à¤¹à¥‡à¤° à¤ªà¤¡à¤¾</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="cm-drawer-guest-btns">
                <Link to="/login" onClick={handleLinkClick} className="btn btn-outline">
                  ðŸ‘¤ à¤¸à¤­à¤¾à¤¸à¤¦ à¤²à¥‰à¤—à¤¿à¤¨
                </Link>
                <Link to="/register" onClick={handleLinkClick} className="btn btn-primary">
                  ðŸš© à¤¨à¤µà¥€à¤¨ à¤¨à¥‹à¤‚à¤¦à¤£à¥€
                </Link>
              </div>
            )}
          </div>

          {/* Featured Highlight: à¤®à¤¹à¤¾à¤µà¤¿à¤¶à¥à¤µ Banner */}
          <Link to="/universe" onClick={handleLinkClick} className="cm-drawer-universe-banner">
            <span className="banner-icon">ðŸŒŒ</span>
            <div className="banner-text">
              <strong>à¤¸à¤‚à¤ªà¥‚à¤°à¥à¤£ à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤®à¤¹à¤¾à¤µà¤¿à¤¶à¥à¤µ</strong>
              <small>à¥ªà¥¯ à¤µà¥ˆà¤¶à¤¿à¤·à¥à¤Ÿà¥à¤¯à¥‡ â€¢ à¥§à¥¨ à¤œà¤— â€¢ à¤ªà¤°à¤¸à¥à¤ªà¤° à¤œà¥‹à¤¡à¤£à¥€</small>
            </div>
            <span className="banner-arrow">â†’</span>
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
                  <span>â­</span>
                  <span>à¤¸à¤¹à¤­à¤¾à¤—à¥€ à¤µà¥à¤¹à¤¾</span>
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
                  <span>â˜Žï¸</span>
                  <span>à¤®à¤¦à¤¤ à¤µ à¤¸à¤‚à¤ªà¤°à¥à¤•</span>
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
                  <span>âš–ï¸</span>
                  <span>à¥«à¥¬ à¤ªà¤¦à¥‡ à¤®à¥…à¤Ÿà¥à¤°à¤¿à¤•à¥à¤¸</span>
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
                  <span>ðŸ“…</span>
                  <span>à¤¦à¤¿à¤¨à¤¦à¤°à¥à¤¶à¤¿à¤•à¤¾</span>
                </Link>
              </>
            )}
          </div>

          {!user ? (
            /* Guest Navigation Items */
            <div className="cm-drawer-guest-menu" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <Link to="/about" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', color: '#1E293B', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '1.2rem' }}>ðŸ›ï¸</span>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 800 }}>à¤†à¤®à¤šà¥à¤¯à¤¾à¤¬à¤¦à¥à¤¦à¤² à¤µ à¤¸à¤‚à¤¸à¥à¤¥à¤¾ à¤ªà¤°à¤¿à¤šà¤¯</div>
                  <small style={{ color: '#64748B' }}>à¤¸à¤‚à¤¸à¥à¤¥à¥‡à¤šà¥€ à¤ªà¤¾à¤°à¥à¤¶à¥à¤µà¤­à¥‚à¤®à¥€ à¤µ à¤‰à¤¦à¥à¤¦à¤¿à¤·à¥à¤Ÿà¥‡</small>
                </div>
              </Link>

              <Link to="/vision" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF8F0', color: '#EA580C', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FED7AA' }}>
                <span style={{ fontSize: '1.2rem' }}>ðŸŽ¯</span>
                <div>
                  <div style={{ color: '#EA580C', fontWeight: 800 }}>à¤µà¥à¤¹à¤¿à¤œà¤¨ (Vision 2030)</div>
                  <small style={{ color: '#C2410C' }}>à¤¦à¥€à¤°à¥à¤˜à¤•à¤¾à¤²à¥€à¤¨ à¤¸à¤‚à¤•à¤²à¥à¤ªà¤¨à¤¾</small>
                </div>
              </Link>

              <Link to="/goals" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF8F0', color: '#EA580C', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FED7AA' }}>
                <span style={{ fontSize: '1.2rem' }}>ðŸ†</span>
                <div>
                  <div style={{ color: '#EA580C', fontWeight: 800 }}>à¤‰à¤¦à¥à¤¦à¤¿à¤·à¥à¤Ÿà¥‡ à¤µ à¤¸à¤‚à¤•à¤²à¥à¤ª (Goals)</div>
                  <small style={{ color: '#C2410C' }}>à¥§à¥¦ à¤ªà¥à¤°à¤®à¥à¤– à¤°à¤£à¤¨à¥€à¤¤à¤¿à¤• à¤‰à¤¦à¥à¤¦à¤¿à¤·à¥à¤Ÿà¥‡</small>
                </div>
              </Link>

              <Link to="/why-join" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF7ED', color: '#C2410C', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #FFCC80' }}>
                <span style={{ fontSize: '1.2rem' }}>â­</span>
                <div>
                  <div style={{ color: '#EA580C', fontWeight: 900 }}>à¤¸à¤¹à¤­à¤¾à¤—à¥€ à¤•à¤¾ à¤µà¥à¤¹à¤¾à¤µà¥‡? (à¤¸à¤¦à¤¸à¥à¤¯à¤¤à¥à¤µà¤¾à¤šà¥‡ à¤²à¤¾à¤­)</div>
                  <small style={{ color: '#C2410C' }}>à¥® à¤®à¥à¤–à¥à¤¯ à¤«à¤¾à¤¯à¤¦à¥‡ à¤µ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤¸à¥à¤®à¤¾à¤°à¥à¤Ÿ à¤•à¤¾à¤°à¥à¤¡</small>
                </div>
              </Link>

              <Link to="/contact" onClick={handleLinkClick} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', color: '#1E293B', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '1.2rem' }}>â˜Žï¸</span>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 800 }}>à¤¸à¤‚à¤ªà¤°à¥à¤• à¤µ à¤®à¤¦à¤¤ à¤•à¥‡à¤‚à¤¦à¥à¤°</div>
                  <small style={{ color: '#64748B' }}>à¤¹à¥‡à¤²à¥à¤ªà¤²à¤¾à¤ˆà¤¨ à¤µ à¤¸à¤®à¤¨à¥à¤µà¤¯ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€</small>
                </div>
              </Link>
            </div>
          ) : (
            /* Logged-In User Accordion Menu (7 Pillars) */
            <>
              {/* 1. Community (à¤•à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'community' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('community')}>
                  <span>ðŸ‘¥ à¤•à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€ (Community)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'community' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'community' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/community" onClick={handleLinkClick}>ðŸ’¬ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤•à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€ à¤®à¤‚à¤š</Link>
                    <Link to="/blood" onClick={handleLinkClick} style={{ color: '#DC2626', fontWeight: 800 }}>ðŸ©¸ à¥¨à¥ªÃ—à¥­ à¤†à¤ªà¤¤à¥à¤•à¤¾à¤²à¥€à¤¨ à¤°à¤•à¥à¤¤ à¤®à¤¦à¤¤</Link>
                    <Link to="/matrimony" onClick={handleLinkClick}>ðŸ’ à¤®à¤°à¤¾à¤ à¤¾ à¤µà¤§à¥‚-à¤µà¤° à¤¸à¥‚à¤šà¤• à¤•à¥‡à¤‚à¤¦à¥à¤°</Link>
                    <Link to="/women" onClick={handleLinkClick}>ðŸŒ¸ à¤®à¤¹à¤¿à¤²à¤¾ à¤¸à¤•à¥à¤·à¤®à¥€à¤•à¤°à¤£ à¤•à¤•à¥à¤·</Link>
                    <Link to="/donation" onClick={handleLinkClick}>â¤ï¸ à¤¦à¥à¤°à¥à¤— à¤¸à¤‚à¤µà¤°à¥à¤§à¤¨ à¤µ à¤¦à¥‡à¤£à¤—à¥€ à¤•à¥‹à¤·</Link>
                    <Link to="/organizations" onClick={handleLinkClick}>ðŸ¤ à¤®à¤°à¤¾à¤ à¤¾ à¤¸à¤¾à¤®à¤¾à¤œà¤¿à¤• à¤¸à¤‚à¤˜à¤Ÿà¤¨à¤¾</Link>
                    <Link to="/political" onClick={handleLinkClick}>ðŸ›ï¸ à¤°à¤¾à¤œà¤•à¥€à¤¯ à¤¨à¥‡à¤¤à¥ƒà¤¤à¥à¤µ à¤µ à¤ªà¤•à¥à¤·</Link>
                    <Link to="/social-workers" onClick={handleLinkClick}>ðŸ¤ à¤¨à¤¿à¤·à¥à¤ à¤¾à¤µà¤‚à¤¤ à¤¸à¤®à¤¾à¤œà¤¸à¥‡à¤µà¤•</Link>
                    <Link to="/officers" onClick={handleLinkClick}>â­ à¤®à¤°à¤¾à¤ à¤¾ à¤¸à¤¨à¤¦à¥€ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ (IAS/IPS)</Link>
                    <Link to="/maratha-news" onClick={handleLinkClick}>ðŸ“º à¤®à¤°à¤¾à¤ à¤¾ à¤¨à¥à¤¯à¥‚à¤œ à¤µ à¤ˆ-à¤ªà¥‡à¤ªà¤°à¥à¤¸</Link>
                  </div>
                )}
              </div>

              {/* 2. Business (à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'business' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('business')}>
                  <span>ðŸ’¼ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ (Business)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'business' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'business' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/business" onClick={handleLinkClick}>ðŸ¢ à¤…à¤–à¤¿à¤² à¤®à¤°à¤¾à¤ à¤¾ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶à¤¿à¤•à¤¾</Link>
                    <Link to="/sangam" onClick={handleLinkClick}>ðŸ¤ à¤¬à¤¿à¤à¤¨à¥‡à¤¸ à¤¸à¤‚à¤—à¤® à¤µ à¤šà¥…à¤ªà¥à¤Ÿà¤°à¥à¤¸</Link>
                    <Link to="/leads" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>ðŸš€ B2B à¤¸à¤‚à¤§à¥€ à¤µ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¸à¥Œà¤¦à¥‡</Link>
                    <Link to="/referrals" onClick={handleLinkClick}>ðŸ”— à¤°à¥‡à¤«à¤°à¤² à¤µ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤¦à¥‡à¤µà¤¾à¤£à¤˜à¥‡à¤µà¤¾à¤£</Link>
                    <Link to="/meetings" onClick={handleLinkClick}>â˜• 1-to-1 à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥ˆà¤ à¤•à¤¾</Link>
                    <Link to="/bank" onClick={handleLinkClick}>ðŸ¦ à¤®à¤°à¤¾à¤ à¤¾ à¤¬à¤à¤• à¤µ à¤µà¤¿à¤¤à¥à¤¤ à¤¸à¤‚à¤¸à¥à¤¥à¤¾</Link>
                    <Link to="/builders" onClick={handleLinkClick}>ðŸ—ï¸ à¤®à¤°à¤¾à¤ à¤¾ à¤¬à¤¿à¤²à¥à¤¡à¤°à¥à¤¸ à¤µ à¤¡à¥‡à¤µà¥à¤¹à¤²à¤ªà¤°à¥à¤¸</Link>
                    <Link to="/manufacturers" onClick={handleLinkClick}>ðŸ­ à¤®à¤°à¤¾à¤ à¤¾ à¤®à¥…à¤¨à¥à¤¯à¥à¤«à¥…à¤•à¥à¤šà¤°à¤°à¥à¤¸ à¤µ à¤‰à¤¦à¥à¤¯à¥‹à¤—</Link>
                    <Link to="/dairy" onClick={handleLinkClick}>ðŸ¥› à¤®à¤°à¤¾à¤ à¤¾ à¤¦à¥‚à¤§ à¤µ à¤•à¥ƒà¤·à¥€ à¤¸à¤‚à¤•à¤²à¤¨ à¤•à¥‡à¤‚à¤¦à¥à¤°</Link>
                  </div>
                )}
              </div>

              {/* 3. Education (à¤¶à¤¿à¤•à¥à¤·à¤£) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'education' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('education')}>
                  <span>ðŸŽ“ à¤¶à¤¿à¤•à¥à¤·à¤£ (Education)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'education' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'education' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/education" onClick={handleLinkClick}>ðŸŽ“ à¤‰à¤šà¥à¤š à¤¶à¤¿à¤•à¥à¤·à¤£ à¤µ à¤•à¤°à¤¿à¤…à¤° à¤ªà¥‹à¤°à¥à¤Ÿà¤²</Link>
                    <Link to="/colleges" onClick={handleLinkClick}>ðŸ›ï¸ à¤¨à¤¾à¤®à¤¾à¤‚à¤•à¤¿à¤¤ à¤®à¤¹à¤¾à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤²à¤¯à¥‡ à¤µ à¤¸à¤‚à¤¸à¥à¤¥à¤¾</Link>
                    <Link to="/scholarships" onClick={handleLinkClick} style={{ color: '#EA580C', fontWeight: 800 }}>ðŸ“œ à¤®à¤°à¤¾à¤ à¤¾ à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤°à¥à¤¥à¥€ à¤¶à¤¿à¤·à¥à¤¯à¤µà¥ƒà¤¤à¥à¤¤à¥€</Link>
                    <Link to="/dnyankosh" onClick={handleLinkClick}>ðŸ’¡ à¤®à¤°à¤¾à¤ à¤¾ à¤œà¥à¤žà¤¾à¤¨à¤•à¥‹à¤¶ (Dnyankosh)</Link>
                    <Link to="/history/granthalaya" onClick={handleLinkClick}>ðŸ“š à¤®à¤°à¤¾à¤ à¤¾ à¤—à¥à¤°à¤‚à¤¥à¤¾à¤²à¤¯ à¤µ à¤¬à¤–à¤°à¥€</Link>
                    <Link to="/quiz" onClick={handleLinkClick}>ðŸŽ¯ à¤¸à¥à¤µà¤°à¤¾à¤œà¥à¤¯ à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸ à¤®à¤¹à¤¾à¤•à¥à¤µà¤¿à¤</Link>
                    <Link to="/time-machine" onClick={handleLinkClick}>â³ à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤Ÿà¤¾à¤‡à¤® à¤®à¤¶à¥€à¤¨</Link>
                  </div>
                )}
              </div>

              {/* 4. Jobs (à¤°à¥‹à¤œà¤—à¤¾à¤°) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'jobs' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('jobs')}>
                  <span>ðŸ’¼ à¤°à¥‹à¤œà¤—à¤¾à¤° (Jobs)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'jobs' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'jobs' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/jobs" onClick={handleLinkClick} style={{ color: '#EA580C', fontWeight: 800 }}>ðŸ’¼ à¤®à¤°à¤¾à¤ à¤¾ à¤°à¥‹à¤œà¤—à¤¾à¤° à¤•à¥‡à¤‚à¤¦à¥à¤° (Jobs Portal)</Link>
                    <Link to="/directory" onClick={handleLinkClick}>ðŸ‘¨â€ðŸ’¼ à¤ªà¥à¤°à¥‹à¤«à¥‡à¤¶à¤¨à¥‡à¤²à¥à¤¸ à¤¡à¤¿à¤°à¥‡à¤•à¥à¤Ÿà¤°à¥€</Link>
                    <Link to="/doctors" onClick={handleLinkClick}>ðŸ‘¨â€âš•ï¸ à¤®à¤°à¤¾à¤ à¤¾ à¤¤à¤œà¥à¤œà¥à¤ž à¤¡à¥‰à¤•à¥à¤Ÿà¤°à¥à¤¸</Link>
                    <Link to="/services" onClick={handleLinkClick}>ðŸ› ï¸ à¤¸à¥‡à¤µà¤¾ à¤µ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥à¤•à¤¿à¤‚à¤—</Link>
                    <Link to="/officers" onClick={handleLinkClick}>â­ à¤¸à¤¨à¤¦à¥€ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¸à¥à¤ªà¤°à¥à¤§à¤¾ à¤ªà¤°à¥€à¤•à¥à¤·à¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤°</Link>
                    <Link to="/speakers" onClick={handleLinkClick}>ðŸŽ™ï¸ à¤ªà¥à¤°à¥‡à¤°à¤• à¤µà¤•à¥à¤¤à¥‡ à¤µ à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤•</Link>
                  </div>
                )}
              </div>

              {/* 5. Networking (à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¤¿à¤‚à¤—) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'network' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('network')}>
                  <span>ðŸŒ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¤¿à¤‚à¤— (Networking)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'network' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'network' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/network" onClick={handleLinkClick}>ðŸ—ºï¸ à¥©à¥¬ à¤œà¤¿à¤²à¥à¤¹à¤¾ à¤¸à¤®à¤¨à¥à¤µà¤¯ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•</Link>
                    <Link to="/network" onClick={handleLinkClick}>ðŸ›ï¸ à¥¬ à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•à¥€à¤¯ à¤µà¤¿à¤­à¤¾à¤— à¤•à¥‡à¤‚à¤¦à¥à¤°à¥‡</Link>
                    <Link to="/platform" onClick={handleLinkClick}>ðŸ“Š à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤¡à¥‡à¤Ÿà¤¾ à¤ªà¥à¤²à¥…à¤Ÿà¤«à¥‰à¤°à¥à¤®</Link>
                    <Link to="/calendar" onClick={handleLinkClick} style={{ color: '#C2410C', fontWeight: 800 }}>ðŸ“… à¤®à¤°à¤¾à¤ à¤¾ à¤¦à¤¿à¤¨à¤¦à¤°à¥à¤¶à¤¿à¤•à¤¾ (à¤ªà¤‚à¤šà¤¾à¤‚à¤—)</Link>
                    <Link to="/referrals" onClick={handleLinkClick}>ðŸ”— à¤¬à¤¿à¤à¤¨à¥‡à¤¸ à¤°à¥‡à¤«à¤°à¤² à¤¦à¥‡à¤µà¤¾à¤£à¤˜à¥‡à¤µà¤¾à¤£</Link>
                    <Link to="/meetings" onClick={handleLinkClick}>â˜• 1-to-1 à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥ˆà¤ à¤•à¤¾</Link>
                    <Link to="/roles-matrix" onClick={handleLinkClick}>âš–ï¸ à¥«à¥¬ à¤ªà¤¦à¥‡ à¤µ à¤ªà¤¾à¤¤à¥à¤°à¤¤à¤¾ à¤®à¥…à¤Ÿà¥à¤°à¤¿à¤•à¥à¤¸</Link>
                    <Link to="/card" onClick={handleLinkClick} style={{ color: '#EA580C', fontWeight: 800 }}>ðŸªª à¤…à¤§à¤¿à¤•à¥ƒà¤¤ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤¸à¤­à¤¾à¤¸à¤¦ à¤•à¤¾à¤°à¥à¤¡</Link>
                  </div>
                )}
              </div>

              {/* 6. History (à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'history' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('history')}>
                  <span>âš”ï¸ à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸ (History)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'history' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'history' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/history/shivaji-maharaj" onClick={handleLinkClick}>ðŸ‘‘ à¤›à¤¤à¥à¤°à¤ªà¤¤à¥€ à¤¶à¤¿à¤µà¤¾à¤œà¥€ à¤®à¤¹à¤¾à¤°à¤¾à¤œ à¤šà¤°à¤¿à¤¤à¥à¤°</Link>
                    <Link to="/history/sambhaji-maharaj" onClick={handleLinkClick}>âš”ï¸ à¤›à¤¤à¥à¤°à¤ªà¤¤à¥€ à¤¸à¤‚à¤­à¤¾à¤œà¥€ à¤®à¤¹à¤¾à¤°à¤¾à¤œ à¤¶à¥Œà¤°à¥à¤¯à¤—à¤¾à¤¥à¤¾</Link>
                    <Link to="/history/balidan-maas" onClick={handleLinkClick}>ðŸ•¯ï¸ à¤§à¤°à¥à¤®à¤µà¥€à¤° à¤¬à¤²à¤¿à¤¦à¤¾à¤¨ à¤®à¤¾à¤¸ à¤¸à¥à¤®à¤°à¤£</Link>
                    <Link to="/history/rajmata-jijau" onClick={handleLinkClick}>ðŸŒ¸ à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤®à¤¾à¤¤à¤¾ à¤œà¤¿à¤œà¤¾à¤Š à¤®à¤¾à¤à¤¸à¤¾à¤¹à¥‡à¤¬</Link>
                    <Link to="/history/bajirao-peshwa" onClick={handleLinkClick}>ðŸŽ à¤¶à¥à¤°à¥€à¤®à¤‚à¤¤ à¤¥à¥‹à¤°à¤²à¥‡ à¤¬à¤¾à¤œà¥€à¤°à¤¾à¤µ à¤ªà¥‡à¤¶à¤µà¥‡</Link>
                    <Link to="/forts" onClick={handleLinkClick}>ðŸ° à¤¸à¤¹à¥à¤¯à¤¾à¤¦à¥à¤°à¥€à¤šà¥‡ à¥©à¥«à¥¦+ à¤—à¤¡à¤•à¤¿à¤²à¥à¤²à¥‡</Link>
                    <Link to="/history/battles" onClick={handleLinkClick}>âš”ï¸ à¤ªà¥à¤°à¤®à¥à¤– à¥­ à¤°à¤£à¤¾à¤‚à¤—à¤£à¥‡ à¤µ à¤µà¥à¤¯à¥‚à¤¹à¤°à¤šà¤¨à¤¾</Link>
                    <Link to="/history/navy" onClick={handleLinkClick}>âš“ à¤®à¤°à¤¾à¤ à¤¾ à¤†à¤°à¤®à¤¾à¤° à¤µ à¤œà¤²à¤¦à¥à¤°à¥à¤—</Link>
                    <Link to="/shivcharitra" onClick={handleLinkClick} style={{ color: '#C73800', fontWeight: 800 }}>ðŸš© à¤¶à¤¿à¤µà¤šà¤°à¤¿à¤¤à¥à¤° à¤•à¤¥à¤¨ (à¥§à¥« à¤­à¤¾à¤—)</Link>
                  </div>
                )}
              </div>

              {/* 7. Culture (à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€) */}
              <div className="cm-drawer-accordion-item">
                <button
                  type="button"
                  className={`cm-drawer-accordion-btn ${expandedPillar === 'culture' ? 'expanded' : ''}`}
                  onClick={() => togglePillar('culture')}>
                  <span>ðŸš© à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€ (Culture)</span>
                  <span className="cm-drawer-accordion-chevron">{expandedPillar === 'culture' ? 'â–²' : 'â–¼'}</span>
                </button>
                {expandedPillar === 'culture' && (
                  <div className="cm-drawer-accordion-panel">
                    <Link to="/culture" onClick={handleLinkClick}>ðŸš© à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€ à¤®à¤¹à¤¾à¤¦à¤¾à¤²à¤¨</Link>
                    <Link to="/culture/heritage-map" onClick={handleLinkClick}>ðŸ—ºï¸ à¤¬à¤¹à¥à¤¸à¥à¤¤à¤°à¥€à¤¯ à¤ªà¤°à¤¸à¥à¤ªà¤°à¤¸à¤‚à¤µà¤¾à¤¦à¥€ à¤¨à¤•à¤¾à¤¶à¤¾</Link>
                    <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>ðŸ›• à¤—à¥à¤°à¤¾à¤®à¤¦à¥ˆà¤µà¤¤ à¤µ à¤•à¥à¤²à¤¦à¥ˆà¤µà¤¤ à¤ªà¤°à¤‚à¤ªà¤°à¤¾</Link>
                    <Link to="/culture/shivkal-festivals" onClick={handleLinkClick}>ðŸš© à¤¶à¤¿à¤µà¤•à¤¾à¤²à¥€à¤¨ à¤‰à¤¤à¥à¤¸à¤µ à¤µ à¤¸à¤£</Link>
                    <Link to="/history/knowledge-graph" onClick={handleLinkClick}>âš¡ à¤˜à¤Ÿà¤¨à¤¾ â†” à¤¸à¥à¤¥à¤³à¥‡ à¤¨à¥‰à¤²à¥‡à¤œ à¤—à¥à¤°à¤¾à¤«</Link>
                    <Link to="/culture/dialects" onClick={handleLinkClick}>ðŸ—£ï¸ à¤®à¤°à¤¾à¤ à¥€ à¤¬à¥‹à¤²à¥€à¤­à¤¾à¤·à¤¾ à¤¦à¤¾à¤²à¤¨</Link>
                    <Link to="/culture/food" onClick={handleLinkClick}>ðŸ² à¤ªà¤¾à¤°à¤‚à¤ªà¤¾à¤°à¤¿à¤• à¤–à¤¾à¤¦à¥à¤¯à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€</Link>
                    <Link to="/artists" onClick={handleLinkClick}>ðŸŽ­ à¤•à¤²à¤¾à¤•à¤¾à¤°, à¤—à¤¾à¤¯à¤• à¤µ à¤°à¤‚à¤—à¤­à¥‚à¤®à¥€</Link>
                    <Link to="/movies" onClick={handleLinkClick}>ðŸŽ¬ à¤¦à¤°à¥à¤œà¥‡à¤¦à¤¾à¤° à¤®à¤°à¤¾à¤ à¥€ à¤šà¤¿à¤¤à¥à¤°à¤ªà¤Ÿ</Link>
                    <Link to="/gallery" onClick={handleLinkClick}>ðŸ–¼ï¸ à¤†à¤ªà¥à¤²à¤¾ à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤›à¤¾à¤¯à¤¾à¤šà¤¿à¤¤à¥à¤° à¤¦à¤¾à¤²à¤¨</Link>
                    {user && (user.role === 'superadmin' || user.role === 'admin' || user.role === 'ceo' || user.role === 'district_admin') && (
                      <Link to="/crm" onClick={handleLinkClick} style={{ color: '#DC2626', fontWeight: 800, borderTop: '1px dashed #CBD5E1', paddingTop: '8px' }}>
                        ðŸ›¡ï¸ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ CRM à¤ªà¥‹à¤°à¥à¤Ÿà¤² â†’
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
              ðŸ“ž à¥¨à¥ªÃ—à¥­ à¤¸à¤®à¤¾à¤œ à¤¹à¥‡à¤²à¥à¤ªà¤²à¤¾à¤ˆà¤¨: <strong>{getContent('forms.contactSupport.emergencyHelpline', 'à¥§à¥®à¥¦à¥¦-à¥§à¥¨à¥©-à¥§à¥¬à¥­à¥ª')}</strong>
            </div>
            <div className="cm-drawer-footer-links">
              <Link to="/governance" onClick={handleLinkClick}>DPDP à¤§à¥‹à¤°à¤£</Link>
              <span>â€¢</span>
              <Link to="/about" onClick={handleLinkClick}>à¤¸à¤‚à¤¸à¥à¤¥à¤¾ à¤ªà¤°à¤¿à¤šà¤¯</Link>
              <span>â€¢</span>
              <Link to="/contact" onClick={handleLinkClick}>à¤®à¤¦à¤¤ à¤µ à¤¸à¤‚à¤ªà¤°à¥à¤•</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
