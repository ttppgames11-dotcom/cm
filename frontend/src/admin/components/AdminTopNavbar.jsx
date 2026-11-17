import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import { Menu, BookOpen, ExternalLink, X } from 'lucide-react';

export default function AdminTopNavbar({ onToggleSidebar }) {
  const { adminUser, logout } = useMagazineAdmin();
  const location = useLocation();

  // Route Name Mapping for Breadcrumbs
  const routeNameMap = {
    '/admin/dashboard': { marathi: 'मुख्य डॅशबोर्ड', english: 'Dashboard' },
    '/admin/issues': { marathi: 'मासिक अंक व्यवस्थापन', english: 'Monthly Issues' },
    '/admin/articles': { marathi: 'संपादकीय लेख व्यवस्थापन', english: 'Articles' },
    '/admin/authors': { marathi: 'लेखक व प्रतिनिधी', english: 'Authors' },
    '/admin/pages': { marathi: 'पृष्ठ व्यवस्थापन', english: 'Pages' },
    '/admin/designer': { marathi: '१०-पान मॅगझिन डिझायनर', english: 'Designer' },
    '/admin/advertisements': { marathi: 'जाहिरात व्यवस्थापन', english: 'Advertisements' },
    '/admin/business': { marathi: 'बिझनेस लिस्टिंग्ज व महसूल', english: 'Revenue & Packages' },
    '/admin/subscriptions': { marathi: 'वर्गणीदार व्यवस्थापन', english: 'Subscriptions' },
    '/admin/approvals': { marathi: 'संपादकीय मंजुरी कार्यप्रवाह', english: 'Approvals' },
    '/admin/media': { marathi: 'मीडिया लायब्ररी', english: 'Media Library' },
    '/admin/analytics': { marathi: 'वाचक विश्लेषण', english: 'Analytics' },
    '/admin/archive': { marathi: 'मासिक अर्काईव्ह', english: 'Archive' },
    '/admin/settings': { marathi: 'प्रणाली सेटिंग्ज', english: 'Settings' }
  };

  const currentRouteInfo = routeNameMap[location.pathname] || { marathi: 'प्रशासकीय कक्ष', english: 'Admin Suite' };

  return (
    <header className="cm-header-container">
      {/* Left: Toggle & Clean Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="cm-header-toggle-btn"
          title="साइडबार टॉगल करा"
        >
          <Menu size={18} />
        </button>

        {/* Clean Breadcrumb with high white contrast */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>CONNECT MARATHA</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>/</span>
          <span style={{ color: '#FFFFFF', fontWeight: 800 }}>
            {currentRouteInfo.marathi} <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>({currentRouteInfo.english})</span>
          </span>
        </div>
      </div>

      {/* Right: Active Issue Pill & Admin Profile in Orange/White Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {/* Edition Status Badge */}
        <div className="cm-header-edition-badge">
          <span className="cm-header-edition-dot" />
          <span>चालू आवृत्ती: नोव्हेंबर २०२६ अंक (Live)</span>
        </div>

        {/* Public Reader CTA (White background, Orange text) */}
        <a 
          href="/magazine/reader" 
          target="_blank" 
          rel="noreferrer"
          className="cm-header-reader-btn"
        >
          <BookOpen size={16} />
          <span>पब्लिक रीडर उघडा</span>
          <ExternalLink size={13} style={{ opacity: 0.7 }} />
        </a>

        {/* Admin Profile Chip (White / Clean styling) */}
        <div className="cm-header-profile-chip">
          <div className="cm-header-avatar">
            {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#252525' }}>
              {adminUser?.name || 'मुख्य प्रशासक'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#777777', fontWeight: 600 }}>
              {adminUser?.role || 'Super Admin'}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: '#D94100',
              cursor: 'pointer',
              marginLeft: '4px',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="लॉगआउट"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
