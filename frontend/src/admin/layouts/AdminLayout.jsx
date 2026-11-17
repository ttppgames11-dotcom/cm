import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopNavbar from '../components/AdminTopNavbar';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import '../styles/admin.css';

export default function AdminLayout() {
  const { adminUser, toasts, removeToast } = useMagazineAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#FFF9F5' }}>
      {/* 1. Fixed Sidebar: 100vh, NO internal scrollbar, ALL menu options visible */}
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* 2. Main Viewport: Height 100vh, Vertical Flex */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, overflow: 'hidden' }}>
        {/* Fixed / Sticky Top Navbar in Orange Theme (approx 72px) */}
        <AdminTopNavbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* 3. Main Scrollable Container (Only this area scrolls) */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Page Content */}
          <main style={{ flex: '1 0 auto', padding: '24px 28px', maxWidth: '1600px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            <Outlet />
          </main>

          {/* 4. Orange Footer with White Text */}
          <footer className="cm-admin-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800 }}>CONNECT MARATHA MAGAZINE</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span style={{ opacity: 0.9 }}>Enterprise Administration Suite</span>
            </div>
            <div>
              <span style={{ opacity: 0.9 }}>© {new Date().getFullYear()} Connect Maratha Media Network. All rights reserved.</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Toast Notification Container */}
      <div className="cm-toast-wrapper">
        {toasts.map(toast => (
          <div key={toast.id} className="cm-toast-item" onClick={() => removeToast(toast.id)} style={{ cursor: 'pointer' }}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
