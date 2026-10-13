import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import CommandPalette from './CommandPalette';
import AIAssistantWidget from '../common/AIAssistantWidget';

const isUserLoggedIn = (user) => {
  if (!user) return false;
  if (!user.id && !user._id && !user.phone) return false;
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cm_logged_in') !== 'true') return false;
  }
  return true;
};

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'ceo');
  const [searchOpen, setSearchOpen] = useState(false);
  const [authRequiredPrompt, setAuthRequiredPrompt] = useState(null);

  const loggedIn = isUserLoggedIn(user);

  // Global listener to trigger Login Prompt Modal from anywhere across the entire website
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

  // Public routes that do not require prior member login
  const isPublicRoute = (pathname) => {
    if (pathname === '/') return true;
    if (pathname === '/login' || pathname.startsWith('/login')) return true;
    if (pathname === '/register' || pathname.startsWith('/register')) return true;
    if (pathname === '/crm/login' || pathname.startsWith('/crm/login')) return true;
    return false;
  };

  const showLoginGate = !loggedIn && !isPublicRoute(location.pathname);

  // Scroll to top and activate all reveal elements on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    targets.forEach((el) => el.classList.add('is-visible'));
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader onOpenSearch={() => setSearchOpen(true)} />
      
      <main style={{ flex: 1 }}>
        {showLoginGate ? (
          <div 
            className="login-required-gate" 
            style={{ 
              minHeight: '75vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px 20px', 
              background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)' 
            }}
          >
            <div 
              style={{ 
                maxWidth: '520px', 
                width: '100%', 
                background: '#FFFFFF', 
                border: '2px solid #FED7AA', 
                borderRadius: '24px', 
                padding: '36px 28px', 
                textAlign: 'center', 
                boxShadow: '0 20px 45px rgba(234, 88, 12, 0.18)' 
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔐 🚩</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#431407', margin: '0 0 8px' }}>
                Connect Maratha — सभासद लॉगिन आवश्यक
              </h2>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#EA580C', marginBottom: '16px' }}>
                Please Login to Access Platform Features
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Connect Maratha वरील इतिहास, ३५०+ गडकोट, व्यवसाय निर्देशिका, दालने आणि सर्व डिजिटल सुविधा पाहण्यासाठी आपले अधिकृत सभासद खात्यात लॉगिन असणे आवश्यक आहे.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const target = location.pathname + location.search;
                    sessionStorage.setItem('cm_login_redirect', target);
                    navigate(`/login?redirect=${encodeURIComponent(target)}`);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  👤 सभासद लॉगिन करा (Login Now) ➔
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = location.pathname + location.search;
                    sessionStorage.setItem('cm_login_redirect', target);
                    navigate(`/register?redirect=${encodeURIComponent(target)}`);
                  }}
                  style={{
                    background: '#FFF7ED',
                    color: '#EA580C',
                    border: '2px solid #FED7AA',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🚩 नवीन मोफत नोंदणी करा (Register Free)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    background: 'transparent',
                    color: '#64748B',
                    border: 'none',
                    padding: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🏠 मुख्यपृष्ठावर परत जा
                </button>
              </div>
            </div>
          </div>
        ) : (
          children || <Outlet />
        )}
      </main>

      <SiteFooter />
      
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {user?.role === 'superadmin' && location.pathname !== '/superadmin' && (
        <Link
          to="/superadmin"
          className="cm-superadmin-fab"
          style={{
            position: 'fixed',
            bottom: '124px',
            right: '20px',
            zIndex: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: 'linear-gradient(135deg, #EA580C, #F97316)',
            color: '#FFFFFF',
            borderRadius: '50px',
            fontWeight: '800',
            fontSize: '0.82rem',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
            border: '2px solid #FED7AA',
            backdropFilter: 'blur(8px)',
            transition: 'transform 0.2s ease'
          }}
          title="सर्वोच्च प्रशासक कन्सोल: वापरकर्ते, डॉक्टर्स, सेवा, हॉटेल्स CRUD">
          <span>👑</span>
          <span>SuperAdmin CRUD</span>
        </Link>
      )}
      
      {isAdmin && location.pathname !== '/admin/cms' && (
        <Link
          to="/admin/cms"
          className="cm-cms-fab"
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '20px',
            zIndex: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: '#FFFFFF',
            color: '#EA580C',
            borderRadius: '50px',
            fontWeight: '800',
            fontSize: '0.82rem',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.2)',
            border: '2px solid #EA580C',
            backdropFilter: 'blur(8px)',
            transition: 'transform 0.2s ease'
          }}
          title="वेबसाईटचे सर्व मजकूर, बटणे, चित्रे व लिंक्स संपादित करा">
          <span>🎨</span>
          <span>संपादित करा (CMS)</span>
        </Link>
      )}

      {/* Global Floating Connect Maratha AI Assistant Widget */}
      {location.pathname !== '/ai' && location.pathname !== '/ai-agent' && (
        <AIAssistantWidget />
      )}

      {/* 🔐 GLOBAL AUTHENTICATION REQUIRED PROMPT DIALOG */}
      {authRequiredPrompt && (
        <div 
          data-auth-prompt="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(67, 20, 7, 0.65)',
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
            {/* Close button */}
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

            {/* Icon & Title */}
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐 🚩</div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#431407', margin: '0 0 6px' }}>
              Connect Maratha — सभासद लॉगिन आवश्यक
            </h3>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#EA580C', marginBottom: '14px' }}>
              Please Login to Access Platform Features
            </div>

            {/* Feature Target Badge */}
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

            {/* Explanatory Text */}
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
              Connect Maratha वरील व्यवसाय, इतिहास, ३५०+ गडकोट, वधु-वर, रक्तपेढी, चॅप्टर्स आणि सर्व डिजिटल सुविधांचा लाभ घेण्यासाठी आपले अधिकृत सभासद खात्यात लॉगिन असणे आवश्यक आहे.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const target = authRequiredPrompt.targetUrl || '/history';
                  setAuthRequiredPrompt(null);
                  sessionStorage.setItem('cm_login_redirect', target);
                  navigate(`/login?redirect=${encodeURIComponent(target)}`);
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
                }}
              >
                👤 सभासद लॉगिन करा (Login Now) ➔
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = authRequiredPrompt.targetUrl || '/history';
                  setAuthRequiredPrompt(null);
                  sessionStorage.setItem('cm_login_redirect', target);
                  navigate(`/register?redirect=${encodeURIComponent(target)}`);
                }}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  color: '#EA580C',
                  border: '2px solid #FED7AA',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                🚩 नवीन मोफत नोंदणी करा (Register Free)
              </button>
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#94A3B8' }}>
              लॉगिन झाल्यानंतर आपण थेट निवडलेल्या पानावर आपोआप पोहोचू शकाल.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
