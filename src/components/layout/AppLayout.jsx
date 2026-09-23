import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import CommandPalette from './CommandPalette';
import MobileBottomNav from './MobileBottomNav';

export default function AppLayout({ children }) {
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
    </div>
  );
}

