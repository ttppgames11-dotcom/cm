import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import CommandPalette from './CommandPalette';

export default function AppLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
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
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
