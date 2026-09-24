import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import CommandPalette from './CommandPalette';
import MobileBottomNav from './MobileBottomNav';

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'ceo');
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

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
        {children || <Outlet />}
      </main>
      <SiteFooter />
      <MobileBottomNav />
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {isAdmin && location.pathname !== '/admin/cms' && (
        <Link
          to="/admin/cms"
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '20px',
            zIndex: 9999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color: '#FFFFFF',
            borderRadius: '50px',
            fontWeight: '700',
            fontSize: '0.82rem',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(8px)',
            transition: 'transform 0.2s ease'
          }}
          title="वेबसाईटचे सर्व मजकूर, बटणे, चित्रे व लिंक्स संपादित करा">
          <span>🎨</span>
          <span>संपादित करा (CMS)</span>
        </Link>
      )}
    </div>
  );
}

