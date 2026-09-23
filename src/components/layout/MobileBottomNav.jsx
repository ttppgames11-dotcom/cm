import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const QUICK_ACTIONS = [
  { label: 'नवीन पोस्ट करा', en: 'Create Post', icon: '📝', path: '/community', color: '#3b82f6' },
  { label: 'व्यवसाय नोंदवा', en: 'Add Business', icon: '🏢', path: '/business/directory', color: '#f59e0b' },
  { label: 'डॉक्टर जोडा', en: 'Add Doctor', icon: '👨‍⚕️', path: '/doctors', color: '#10b981' },
  { label: 'नोकरी पोस्ट करा', en: 'Post Job', icon: '💼', path: '/jobs', color: '#6366f1' },
  { label: 'कार्यक्रम जोडा', en: 'Create Event', icon: '📅', path: '/events', color: '#ec4899' },
  { label: 'संस्था नोंदवा', en: 'Add Organization', icon: '🤝', path: '/organizations', color: '#8b5cf6' },
  { label: 'तातडीने रक्त मागा', en: 'Blood Request', icon: '🩸', path: '/blood', color: '#ef4444' },
  { label: 'रक्तदान नोंदणी', en: 'Register Donor', icon: '💉', path: '/blood', color: '#059669' },
  { label: 'घोषणा / बातमी द्या', en: 'Announcement', icon: '📢', path: '/news', color: '#ea580c' }
];

export default function MobileBottomNav() {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (path) => {
    setIsActionSheetOpen(false);
    navigate(path);
  };

  return (
    <>
      <style>{`
        .cm-mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
          z-index: 900;
          align-items: center;
          justify-content: space-around;
          padding: 0 0.5rem;
        }

        @media (max-width: 768px) {
          .cm-mobile-bottom-nav {
            display: flex;
          }
          /* Add bottom padding to body/main so content isn't hidden under bottom nav on mobile */
          body {
            padding-bottom: 64px;
          }
        }

        .cm-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 54px;
        }

        .cm-nav-item.active {
          color: #c2410c;
        }

        .cm-nav-icon {
          font-size: 1.3rem;
          margin-bottom: 2px;
        }

        .cm-plus-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          color: #fff;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          font-weight: 700;
          cursor: pointer;
          transform: translateY(-12px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cm-plus-btn:active {
          transform: translateY(-8px) scale(0.95);
        }
      `}</style>

      {/* Sticky Bottom Nav Bar */}
      <nav className="cm-mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => `cm-nav-item ${isActive ? 'active' : ''}`} end>
          <span className="cm-nav-icon">🏠</span>
          <span>होम</span>
        </NavLink>

        <NavLink to="/community" className={({ isActive }) => `cm-nav-item ${isActive ? 'active' : ''}`}>
          <span className="cm-nav-icon">👥</span>
          <span>कम्युनिटी</span>
        </NavLink>

        {/* Central Action Button */}
        <button
          className="cm-plus-btn"
          onClick={() => setIsActionSheetOpen(true)}
          aria-label="Quick Actions Menu"
        >
          ＋
        </button>

        <NavLink to="/events" className={({ isActive }) => `cm-nav-item ${isActive ? 'active' : ''}`}>
          <span className="cm-nav-icon">📅</span>
          <span>कार्यक्रम</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `cm-nav-item ${isActive ? 'active' : ''}`}>
          <span className="cm-nav-icon">👤</span>
          <span>खाते</span>
        </NavLink>
      </nav>

      {/* Universal Floating Action Sheet Modal */}
      {isActionSheetOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Backdrop click to close */}
          <div
            style={{ position: 'absolute', inset: 0 }}
            onClick={() => setIsActionSheetOpen(false)}
          />

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            background: '#ffffff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '1.5rem 1.25rem 2.5rem',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            {/* Header Handle */}
            <div style={{
              width: '40px',
              height: '4px',
              background: '#cbd5e1',
              borderRadius: '999px',
              margin: '0 auto 1.25rem'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  नवीन नोंदणी / कृती (Quick Action)
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  कनेक्ट मराठा प्लॅटफॉर्मवर थेट योगदान द्या
                </p>
              </div>
              <button
                onClick={() => setIsActionSheetOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  fontSize: '1rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* 9 Actions Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.85rem'
            }}>
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action.path)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${action.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '0.5rem'
                  }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                    {action.label}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                    {action.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
