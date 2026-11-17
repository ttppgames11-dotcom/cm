import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Files,
  Palette,
  Images,
  Megaphone,
  BriefcaseBusiness,
  Ticket,
  ShieldCheck,
  ChartNoAxesCombined,
  Archive,
  Settings,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const { logout, approvals } = useMagazineAdmin();
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  const navSections = [
    {
      group: "MAIN",
      items: [
        { path: "/admin/dashboard", marathi: "डॅशबोर्ड", english: "Dashboard", Icon: LayoutDashboard },
        { path: "/admin/issues", marathi: "मासिक अंक", english: "Monthly Issues", Icon: BookOpen },
        { path: "/admin/articles", marathi: "लेख व्यवस्थापन", english: "Articles", Icon: FileText },
        { path: "/admin/authors", marathi: "लेखक प्रतिनिधी", english: "Authors", Icon: Users }
      ]
    },
    {
      group: "DESIGN & LAYOUT",
      items: [
        { path: "/admin/pages", marathi: "पृष्ठ व्यवस्थापन", english: "Pages", Icon: Files },
        { path: "/admin/designer", marathi: "१०-पान डिझायनर", english: "10-Page Designer", Icon: Palette },
        { path: "/admin/media", marathi: "मीडिया लायब्ररी", english: "Media Assets", Icon: Images }
      ]
    },
    {
      group: "COMMERCIAL",
      items: [
        { path: "/admin/advertisements", marathi: "जाहिरात व्यवस्थापन", english: "Advertisements", Icon: Megaphone },
        { path: "/admin/business", marathi: "बिझनेस लिस्टिंग्ज", english: "Business Listings", Icon: BriefcaseBusiness },
        { path: "/admin/subscriptions", marathi: "वर्गणीदार व्यवस्थापन", english: "Subscriptions", Icon: Ticket }
      ]
    },
    {
      group: "EDITORIAL & SYSTEM",
      items: [
        { 
          path: "/admin/approvals", 
          marathi: "संपादकीय मंजुरी", 
          english: "Approvals", 
          Icon: ShieldCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
        },
        { path: "/admin/analytics", marathi: "वाचक विश्लेषण", english: "Analytics", Icon: ChartNoAxesCombined },
        { path: "/admin/archive", marathi: "मासिक अर्काईव्ह", english: "Archive", Icon: Archive },
        { path: "/admin/settings", marathi: "प्रणाली सेटिंग्ज", english: "Settings", Icon: Settings }
      ]
    }
  ];

  return (
    <aside className={`cm-sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="cm-sidebar-header">
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              background: '#F4510B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#FFFFFF'
            }}>
              CM
            </div>
            <div>
              <span style={{ fontSize: '0.92rem', fontWeight: 900, letterSpacing: '-0.3px', color: '#252525', display: 'block', lineHeight: 1.15 }}>
                CONNECT MARATHA
              </span>
              <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#F4510B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Magazine Admin
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            background: '#F4510B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1rem',
            color: '#FFFFFF'
          }}>
            CM
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="cm-sidebar-toggle-btn"
          title={collapsed ? "साइडबार मोठा करा" : "साइडबार लहान करा"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav List: Fitted tightly with NO scrollbar */}
      <div className="cm-sidebar-nav-list">
        {navSections.map((sec, idx) => (
          <div key={idx} className="cm-nav-section-wrapper">
            {!collapsed && (
              <div className="cm-nav-group-title">
                {sec.group}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {sec.items.map((item, itemIdx) => {
                const ItemIcon = item.Icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    className={({ isActive }) => `cm-nav-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? `${item.marathi} (${item.english})` : undefined}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  >
                    <ItemIcon size={20} className="cm-nav-icon" />
                    {!collapsed && (
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                        <span className="cm-nav-text-marathi">
                          {item.marathi}
                        </span>
                        <span className="cm-nav-text-english">
                          ({item.english})
                        </span>
                      </div>
                    )}
                    {!collapsed && item.badge && (
                      <span style={{
                        background: '#D94100',
                        color: '#FFF',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '9999px',
                        lineHeight: 1
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Actions (Fixed at bottom) */}
      <div className="cm-sidebar-footer">
        <a 
          href="/magazine" 
          target="_blank" 
          rel="noreferrer"
          className="cm-nav-link cm-footer-link"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          title={collapsed ? "सार्वजनिक मासिक वेबसाइट पहा" : undefined}
        >
          <Globe size={20} className="cm-nav-icon" />
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span className="cm-nav-text-marathi" style={{ color: '#D94100' }}>
                पब्लिक वेबसाइट
              </span>
              <span className="cm-nav-text-english">
                (View Site ↗)
              </span>
            </div>
          )}
        </a>

        <button
          type="button"
          onClick={logout}
          className="cm-nav-link cm-footer-link"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
          title={collapsed ? "प्रणालीतून लॉगआउट करा" : undefined}
        >
          <LogOut size={20} className="cm-nav-icon" />
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span className="cm-nav-text-marathi" style={{ color: '#D94100' }}>
                लॉगआउट
              </span>
              <span className="cm-nav-text-english">
                (Logout)
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
