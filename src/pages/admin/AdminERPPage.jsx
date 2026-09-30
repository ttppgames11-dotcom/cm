// src/pages/admin/AdminShell.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../services/adminApi';

/* ============================================================
   STYLE TOKENS
   ============================================================ */
const T = {
  bg: '#FFFDF9',
  panel: '#FFFFFF',
  softBg: '#FFF7ED',
  border: '#FED7AA',
  saffron: '#EA580C',
  amber: '#D97706',
  deep: '#C2410C',
  ink: '#431407',
  text: '#1E293B',
  muted: '#64748B',
  green: '#16A34A',
  red: '#DC2626',
  gradient: 'linear-gradient(135deg, #EA580C, #D97706)'
};

/* ============================================================
   NAVIGATION DEFINITION (7 groups, all modules)
   ============================================================ */
const NAV_GROUPS = [
  { id: 'command', label: 'Command Center', icon: '📊', items: [
    { path: '/admin', label: 'Dashboard', icon: '🏠', exact: true },
    { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' }
  ]},
  { id: 'people', label: 'People', icon: '👥', items: [
    { path: '/admin/members', label: 'Members & KYC', icon: '👤' },
    { path: '/admin/leads', label: 'Leads Pipeline', icon: '🎯' },
    { path: '/admin/businesses', label: 'Businesses', icon: '💼' },
    { path: '/admin/referrals', label: 'B2B Referrals', icon: '🤝' },
    { path: '/admin/chapters', label: 'Chapters', icon: '📍' },
    { path: '/admin/admins', label: 'Admin Users', icon: '🛡️' }
  ]},
  { id: 'content', label: 'Content & Knowledge', icon: '📚', items: [
    { path: '/admin/articles', label: 'Articles', icon: '📝' },
    { path: '/admin/history', label: 'History', icon: '📜' },
    { path: '/admin/forts', label: 'Forts', icon: '🏰' },
    { path: '/admin/temples', label: 'Temples', icon: '🛕' },
    { path: '/admin/personalities', label: 'Personalities', icon: '👑' },
    { path: '/admin/media', label: 'Media Library', icon: '🖼️' }
  ]},
  { id: 'engagement', label: 'Engagement', icon: '🎯', items: [
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/campaigns', label: 'Campaigns', icon: '📣' },
    { path: '/admin/communication', label: 'Communication', icon: '💬' }
  ]},
  { id: 'ops', label: 'Operations', icon: '⚙️', items: [
    { path: '/admin/workflows', label: 'Workflows', icon: '🔄' },
    { path: '/admin/tickets', label: 'Complaints', icon: '🎫' },
    { path: '/admin/seva', label: 'Blood Helpdesk', icon: '🩸' },
    { path: '/admin/reports', label: 'Reports', icon: '📊' }
  ]},
  { id: 'system', label: 'System', icon: '🔒', items: [
    { path: '/admin/master-data', label: 'Master Data', icon: '🗃️' },
    { path: '/admin/roles', label: 'Roles & Permissions', icon: '🔑' },
    { path: '/admin/audit', label: 'Audit Logs', icon: '🛡️' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ]}
];

/* ============================================================
   REUSABLE UI COMPONENTS
   ============================================================ */
const Card = ({ children, style }) => (
  <div style={{
    background: T.panel, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: 16,
    boxShadow: '0 4px 15px rgba(234,88,12,0.06)', ...style
  }}>{children}</div>
);

const Btn = ({ children, variant = 'primary', onClick, style, ...rest }) => {
  const variants = {
    primary: { background: T.gradient, color: '#fff', border: 'none' },
    ghost: { background: T.softBg, color: T.saffron, border: `1px solid ${T.saffron}` },
    plain: { background: T.panel, color: T.ink, border: `1px solid ${T.border}` },
    danger: { background: '#FEE2E2', color: T.red, border: '1px solid #FCA5A5' },
    success: { background: '#DCFCE7', color: T.green, border: '1px solid #86EFAC' }
  };
  return (
    <button onClick={onClick} {...rest} style={{
      padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem',
      fontWeight: 800, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...variants[variant], ...style
    }}>{children}</button>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>{label}</label>}
    <input {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 6,
      background: T.softBg, border: `1px solid ${T.border}`,
      color: T.text, fontSize: '0.82rem', fontWeight: 600,
      outline: 'none', boxSizing: 'border-box', ...props.style
    }} />
  </div>
);

const Select = ({ label, options = [], ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>{label}</label>}
    <select {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 6,
      background: T.softBg, border: `1px solid ${T.border}`,
      color: T.text, fontSize: '0.82rem', fontWeight: 700,
      outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
    }}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, tone = 'saffron' }) => {
  const tones = {
    saffron: { bg: '#FFEDD5', fg: T.deep, bd: T.border },
    green: { bg: '#ECFDF5', fg: '#059669', bd: '#A7F3D0' },
    red: { bg: '#FEE2E2', fg: T.red, bd: '#FCA5A5' },
    gray: { bg: '#F1F5F9', fg: '#475569', bd: '#CBD5E1' }
  };
  const t = tones[tone];
  return (
    <span style={{
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      padding: '2px 8px', borderRadius: 4,
      fontSize: '0.68rem', fontWeight: 800,
      display: 'inline-block'
    }}>{children}</span>
  );
};

const KPI = ({ label, value, sub, icon, color = T.saffron }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: T.ink, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.7rem', fontWeight: 900, color, letterSpacing: -0.5 }}>
      {value}
    </div>
    <div style={{ fontSize: '0.72rem', color: T.muted, fontWeight: 600 }}>{sub}</div>
  </Card>
);

const Table = ({ headers, rows, onRowClick }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
      <thead>
        <tr style={{ background: T.softBg, borderBottom: `1px solid ${T.border}`, color: T.deep, fontWeight: 800 }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={headers.length} style={{ padding: 32, textAlign: 'center', color: T.muted, fontWeight: 600 }}>
              कोणत्याही नोंदी नाहीत
            </td>
          </tr>
        )}
        {rows.map((row, ri) => (
          <tr key={ri} onClick={() => onRowClick?.(row)}
              style={{ borderBottom: `1px solid ${T.border}`, cursor: onRowClick ? 'pointer' : 'default' }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '12px 16px' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Modal = ({ title, children, onClose, width = 500 }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
  }}>
    <div style={{
      background: T.panel, border: `2px solid ${T.saffron}`,
      borderRadius: 16, padding: 24, width: '100%', maxWidth: width,
      boxShadow: '0 20px 50px rgba(234,88,12,0.25)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: T.ink }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.saffron, fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: T.ink }}>{children}</h2>
    {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: T.muted, fontWeight: 600 }}>{subtitle}</p>}
  </div>
);

/* ============================================================
   MAIN ADMIN SHELL
   ============================================================ */
export default function AdminShell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    command: true, people: true, content: false, engagement: false, ops: false, system: false
  });
  const [toast, setToast] = useState(null);

  // Global data (shared across views)
  const [data, setData] = useState({
    metrics: {}, users: [], leads: [], businesses: [], referrals: [],
    content: { articles: [], history: [], forts: [], temples: [], personalities: [] },
    media: [], events: [], campaigns: [], tickets: [], workflows: [],
    blood: [], audit: [], roles: []
  });
  const [loading, setLoading] = useState(true);

  const toast$ = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ---- Load everything once ----
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [
        metrics, users, leads, businesses, referrals,
        articles, history, forts, temples, personalities,
        media, events, campaigns, tickets, workflows,
        blood, audit, roles
      ] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getMembers(),
        adminApi.getLeads(),
        adminApi.getBusinesses(),
        adminApi.getReferrals(),
        adminApi.getContent('articles'),
        adminApi.getContent('history'),
        adminApi.getContent('forts'),
        adminApi.getContent('temples'),
        adminApi.getContent('personalities'),
        adminApi.getMedia(),
        adminApi.getEvents(),
        adminApi.getCampaigns(),
        adminApi.getTickets(),
        adminApi.getWorkflows(),
        adminApi.getBloodRequests(),
        adminApi.getAuditLogs(),
        adminApi.getRoles()
      ]);

      setData({
        metrics: metrics || {},
        users: Array.isArray(users) ? users : users?.users || [],
        leads: Array.isArray(leads) ? leads : [],
        businesses: Array.isArray(businesses) ? businesses : [],
        referrals: Array.isArray(referrals) ? referrals : [],
        content: {
          articles: Array.isArray(articles) ? articles : [],
          history: Array.isArray(history) ? history : [],
          forts: Array.isArray(forts) ? forts : [],
          temples: Array.isArray(temples) ? temples : [],
          personalities: Array.isArray(personalities) ? personalities : []
        },
        media: Array.isArray(media) ? media : [],
        events: Array.isArray(events) ? events : [],
        campaigns: Array.isArray(campaigns) ? campaigns : [],
        tickets: Array.isArray(tickets) ? tickets : [],
        workflows: Array.isArray(workflows) ? workflows : [],
        blood: Array.isArray(blood) ? blood : [],
        audit: Array.isArray(audit) ? audit : [],
        roles: Array.isArray(roles) ? roles : []
      });
      setLoading(false);
    })();
  }, []);

  const toggleGroup = (id) =>
    setOpenGroups(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 10000,
          background: toast.type === 'error' ? T.red : T.saffron,
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(234,88,12,0.35)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: '0.85rem', fontWeight: 700
        }}>
          <span>🚩</span><span>{toast.msg}</span>
        </div>
      )}

      {/* ============== SIDEBAR ============== */}
      <aside style={{
        width: collapsed ? 68 : 270,
        background: T.panel, borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        transition: 'width .2s ease',
        boxShadow: '2px 0 10px rgba(234,88,12,0.04)', zIndex: 40
      }}>
        {/* Brand */}
        <div style={{
          padding: '16px', borderBottom: `1px solid ${T.border}`,
          background: T.softBg, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: T.gradient, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontSize: '1.2rem', fontWeight: 900,
            boxShadow: '0 2px 8px rgba(234,88,12,0.35)', flexShrink: 0
          }}>🚩</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: T.ink, whiteSpace: 'nowrap' }}>
                CONNECT MARATHA
              </div>
              <div style={{ fontSize: '0.62rem', color: T.saffron, fontWeight: 800, letterSpacing: 1 }}>
                ADMIN CONSOLE
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft: 'auto', background: T.panel,
              border: `1px solid ${T.border}`, color: T.saffron,
              width: 26, height: 26, borderRadius: 6,
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem'
            }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Super Admin badge */}
        {!collapsed && (
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              background: T.softBg, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: 10
            }}>
              <Badge>👑 ALL ACCESS</Badge>
              <div style={{ fontSize: '0.68rem', color: T.deep, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>
                सर्व ३६ जिल्हे, वापरकर्ते, व्यवसाय, CMS व सुरक्षा नियंत्रण
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {NAV_GROUPS.map(g => (
            <div key={g.id} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(g.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    padding: '8px 10px', cursor: 'pointer',
                    fontSize: '0.68rem', fontWeight: 900,
                    color: T.deep, letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                  <span>{g.icon}</span>
                  <span style={{ flex: 1 }}>{g.label}</span>
                  <span style={{ fontSize: '0.6rem' }}>{openGroups[g.id] ? '▾' : '▸'}</span>
                </button>
              )}
              {(collapsed || openGroups[g.id]) && g.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', margin: '2px 4px',
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    background: isActive ? T.softBg : 'transparent',
                    color: isActive ? T.saffron : '#475569',
                    border: isActive ? `1px solid ${T.border}` : '1px solid transparent',
                    transition: 'all 0.12s'
                  })}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '12px 14px', borderTop: `1px solid ${T.border}`,
          background: T.softBg, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: T.gradient, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 900, fontSize: '0.75rem', flexShrink: 0
          }}>AD</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: T.ink, whiteSpace: 'nowrap' }}>
                {user?.name || 'केंद्रीय ॲडमिन'}
              </div>
              <div style={{ fontSize: '0.65rem', color: T.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                ऑनलाईन
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============== MAIN ============== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar navigate={navigate} toast={toast$} />
        <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {loading ? (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: T.saffron }}>
                ⏳ डेटा लोड होत आहे...
              </div>
            </Card>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard data={data} navigate={navigate} />} />
              <Route path="/members" element={<MembersView data={data} setData={setData} toast={toast$} />} />
              <Route path="/leads" element={<LeadsView data={data} toast={toast$} />} />
              <Route path="/businesses" element={<BusinessesView data={data} />} />
              <Route path="/referrals" element={<ReferralsView data={data} setData={setData} toast={toast$} />} />
              <Route path="/chapters" element={<GenericListView title="Chapters" icon="📍" items={[]} columns={['ID','Name','District','Members']} />} />
              <Route path="/admins" element={<GenericListView title="Admin Users" icon="🛡️" items={[]} columns={['ID','Name','Role','Last Login']} />} />

              <Route path="/articles" element={<ContentView type="articles" data={data} toast={toast$} />} />
              <Route path="/history" element={<ContentView type="history" data={data} toast={toast$} />} />
              <Route path="/forts" element={<ContentView type="forts" data={data} toast={toast$} />} />
              <Route path="/temples" element={<ContentView type="temples" data={data} toast={toast$} />} />
              <Route path="/personalities" element={<ContentView type="personalities" data={data} toast={toast$} />} />
              <Route path="/media" element={<MediaView data={data} toast={toast$} />} />

              <Route path="/events" element={<EventsView data={data} toast={toast$} />} />
              <Route path="/campaigns" element={<CampaignsView data={data} toast={toast$} />} />
              <Route path="/communication" element={<CommunicationView data={data} toast={toast$} />} />

              <Route path="/workflows" element={<WorkflowsView data={data} />} />
              <Route path="/tickets" element={<TicketsView data={data} toast={toast$} />} />
              <Route path="/seva" element={<BloodView data={data} />} />
              <Route path="/reports" element={<ReportsView data={data} />} />
              <Route path="/analytics" element={<ReportsView data={data} />} />
              <Route path="/approvals" element={<ApprovalsView data={data} />} />

              <Route path="/master-data" element={<MasterDataView toast={toast$} />} />
              <Route path="/roles" element={<RolesView data={data} toast={toast$} />} />
              <Route path="/audit" element={<AuditView data={data} />} />
              <Route path="/settings" element={<SettingsView toast={toast$} />} />

              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   TOP BAR
   ============================================================ */
function TopBar({ navigate, toast }) {
  const [q, setQ] = useState('');
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: T.panel, borderBottom: `1px solid ${T.border}`,
      padding: '12px 24px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      boxShadow: '0 2px 10px rgba(234,88,12,0.05)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: T.softBg, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: '8px 14px', flex: 1, maxWidth: 460
      }}>
        <span style={{ color: T.saffron }}>🔍</span>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="सभासद, व्यवसाय, सामग्री शोधा..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: T.text, fontSize: '0.82rem', fontWeight: 600, width: '100%'
          }} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Btn variant="primary" onClick={() => toast('नवीन नोंद तयार करा', 'success')}>
          + नवीन नोंद
        </Btn>
        <Btn variant="plain" onClick={() => window.location.reload()}>🔄 Refresh</Btn>
        <Btn variant="ghost" onClick={() => navigate('/ai')}>🤖 AI</Btn>
      </div>
    </header>
  );
}

/* ============================================================
   1. DASHBOARD
   ============================================================ */
function Dashboard({ data, navigate }) {
  const m = data.metrics;
  const pendingKyc = data.users.filter(u => !u.verified).length;

  const kpis = [
    { label: 'एकूण सदस्य', value: m.totalMembers || data.users.length, sub: `${data.users.filter(u => u.verified).length} प्रमाणित`, icon: '👥', color: T.saffron },
    { label: 'प्रलंबित KYC', value: pendingKyc, sub: 'पडताळणी आवश्यक', icon: '⏳', color: T.amber },
    { label: 'व्यवसाय', value: data.businesses.length, sub: 'नोंदणीकृत', icon: '🏢', color: T.deep },
    { label: 'B2B रेफरल्स', value: data.referrals.length, sub: 'सक्रिय व्यवहार', icon: '🤝', color: T.saffron },
    { label: 'रक्त विनंत्या', value: data.blood.length, sub: '२४x७ सेवा', icon: '🩸', color: T.red },
    { label: 'तक्रारी', value: data.tickets.length, sub: 'खुल्या तिकिट', icon: '🎫', color: T.amber },
    { label: 'कार्यक्रम', value: data.events.length, sub: 'नियोजित', icon: '📅', color: T.deep },
    { label: 'सामग्री', value: (data.content.articles.length + data.content.history.length + data.content.forts.length + data.content.temples.length + data.content.personalities.length), sub: 'प्रकाशित नोंदी', icon: '📚', color: T.saffron }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle subtitle="प्लॅटफॉर्मची संपूर्ण स्थिती एका दृष्टिक्षेपात">
        📊 Command Center
      </SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {kpis.map((k, i) => <KPI key={i} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 12, fontSize: '0.95rem' }}>
            🔥 अलीकडील क्रियाकलाप (Recent Activity)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.audit.slice(0, 8).map((log, i) => (
              <div key={i} style={{
                background: T.softBg, border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${T.saffron}`,
                padding: '10px 14px', borderRadius: 8,
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.78rem', fontWeight: 600
              }}>
                <span>
                  <strong style={{ color: T.saffron }}>[{log.action || 'ACTION'}]</strong>{' '}
                  {log.performedBy || 'System'}
                </span>
                <span style={{ color: T.muted, fontFamily: 'monospace', fontSize: '0.72rem' }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'आत्ताच'}
                </span>
              </div>
            ))}
            {data.audit.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: T.muted, fontWeight: 600 }}>
                क्रियाकलाप उपलब्ध नाही
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 12, fontSize: '0.95rem' }}>
            ⚡ जलद कृती
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" onClick={() => navigate('/admin/members')}>👤 सदस्य पडताळणी</Btn>
            <Btn variant="plain" onClick={() => navigate('/admin/referrals')}>🤝 नवीन रेफरल</Btn>
            <Btn variant="plain" onClick={() => navigate('/admin/articles')}>📝 नवीन लेख</Btn>
            <Btn variant="plain" onClick={() => navigate('/admin/events')}>📅 कार्यक्रम तयार करा</Btn>
            <Btn variant="ghost" onClick={() => navigate('/admin/reports')}>📊 अहवाल पहा</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   2. MEMBERS + KYC
   ============================================================ */
function MembersView({ data, setData, toast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return data.users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || u.name?.toLowerCase().includes(q)
        || u.phone?.includes(search)
        || (u.id || u._id)?.toLowerCase().includes(q);
      const matchFilter =
        filter === 'all'
        || (filter === 'verified' && u.verified)
        || (filter === 'unverified' && !u.verified);
      return matchSearch && matchFilter;
    });
  }, [data.users, search, filter]);

  const toggleVerify = async (u) => {
    const id = u.id || u._id;
    const newStatus = !u.verified;
    try {
      await adminApi.verifyMember(id, newStatus);
    } catch {}
    setData(prev => ({
      ...prev,
      users: prev.users.map(x => (x.id || x._id) === id ? { ...x, verified: newStatus } : x)
    }));
    toast(`${u.name} यांची पडताळणी ${newStatus ? 'मंजूर' : 'रद्द'}`, 'success');
  };

  return (
    <>
      <SectionTitle subtitle={`एकूण ${data.users.length} सदस्य`}>👤 Members & KYC</SectionTitle>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 12, background: T.softBg, borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="नाव, फोन किंवा ID शोधा..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: '8px 12px',
              background: T.panel, border: `1px solid ${T.border}`,
              borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, outline: 'none'
            }} />
          <Select
            value={filter} onChange={e => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'सर्व' },
              { value: 'verified', label: 'प्रमाणित' },
              { value: 'unverified', label: 'प्रलंबित' }
            ]} />
        </div>

        <Table
          headers={['ID', 'नाव', 'फोन', 'जिल्हा', 'KYC', 'कृती']}
          onRowClick={setSelected}
          rows={filtered.map(u => [
            <span style={{ fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{u.id || u._id}</span>,
            <strong>{u.name}</strong>,
            u.phone || '—',
            u.district || '—',
            <Badge tone={u.verified ? 'green' : 'saffron'}>
              {u.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
            </Badge>,
            <Btn
              variant={u.verified ? 'danger' : 'success'}
              onClick={(e) => { e.stopPropagation(); toggleVerify(u); }}>
              {u.verified ? 'रद्द करा' : 'मंजूर करा'}
            </Btn>
          ])}
        />
      </Card>

      {selected && (
        <Modal title="👤 सदस्य डॉसियर" onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
            <div><strong style={{ color: T.deep }}>नाव:</strong> {selected.name}</div>
            <div><strong style={{ color: T.deep }}>ID:</strong> <span style={{ fontFamily: 'monospace', color: T.saffron }}>{selected.id || selected._id}</span></div>
            <div><strong style={{ color: T.deep }}>फोन:</strong> {selected.phone || '—'}</div>
            <div><strong style={{ color: T.deep }}>ईमेल:</strong> {selected.email || '—'}</div>
            <div><strong style={{ color: T.deep }}>जिल्हा:</strong> {selected.district || '—'}</div>
            <div><strong style={{ color: T.deep }}>व्यवसाय:</strong> {selected.profession || '—'}</div>
            <div><strong style={{ color: T.deep }}>KYC:</strong> <Badge tone={selected.verified ? 'green' : 'saffron'}>{selected.verified ? 'प्रमाणित' : 'प्रलंबित'}</Badge></div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="primary" onClick={() => { toggleVerify(selected); setSelected(null); }}>
              {selected.verified ? 'रद्द करा' : 'प्रमाणित करा'}
            </Btn>
            <Btn variant="plain" onClick={() => setSelected(null)}>बंद करा</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   3. LEADS PIPELINE (KANBAN)
   ============================================================ */
const LEAD_STAGES = [
  { id: 'new', label: '१. नवीन', color: '#F59E0B' },
  { id: 'contacted', label: '२. संपर्क', color: '#EA580C' },
  { id: 'qualified', label: '३. पात्र', color: '#D97706' },
  { id: 'meeting', label: '४. भेट', color: '#C2410C' },
  { id: 'converted', label: '५. रूपांतरित', color: '#16A34A' }
];

function LeadsView({ data, toast }) {
  const [leads, setLeads] = useState(data.leads);

  useEffect(() => setLeads(data.leads), [data.leads]);

  const moveLead = (leadId, newStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    adminApi.updateLeadStage(leadId, newStage);
    toast('लीड स्थिती अद्ययावत', 'success');
  };

  return (
    <>
      <SectionTitle subtitle="CRM Sales Pipeline">🎯 Leads Pipeline</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, alignItems: 'flex-start' }}>
        {LEAD_STAGES.map(stage => {
          const stageLeads = leads.filter(l => (l.stage || 'new') === stage.id);
          return (
            <Card key={stage.id} style={{ background: T.softBg, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                  <strong style={{ fontSize: '0.78rem', color: T.ink }}>{stage.label}</strong>
                </div>
                <Badge>{stageLeads.length}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageLeads.map(l => (
                  <div key={l.id} style={{
                    background: T.panel, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: 10, fontSize: '0.78rem'
                  }}>
                    <div style={{ fontWeight: 800, color: T.text }}>{l.name || 'लीड'}</div>
                    <div style={{ color: T.muted, fontSize: '0.72rem' }}>📞 {l.phone || '—'}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {LEAD_STAGES.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                        <Btn key={s.id} variant="plain" style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                          onClick={() => moveLead(l.id, s.id)}>→ {s.label}</Btn>
                      ))}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, color: T.muted, fontSize: '0.72rem', fontWeight: 600 }}>
                    रिक्त
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
   4. BUSINESSES
   ============================================================ */
function BusinessesView({ data }) {
  return (
    <>
      <SectionTitle subtitle="व्यवसाय संगम नोंदणी">🏢 Businesses</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {data.businesses.map((b, i) => (
          <Card key={i}>
            <div style={{ fontWeight: 900, color: T.ink, fontSize: '0.95rem', marginBottom: 6 }}>
              {b.name || b.businessName || 'व्यवसाय'}
            </div>
            <div style={{ fontSize: '0.78rem', color: T.muted, marginBottom: 4 }}>
              👤 {b.owner || b.ownerName || '—'}
            </div>
            <div style={{ fontSize: '0.78rem', color: T.muted, marginBottom: 4 }}>
              📂 {b.category || '—'} • 📍 {b.district || '—'}
            </div>
            <div style={{ marginTop: 10 }}>
              <Badge tone={b.verified ? 'green' : 'saffron'}>
                {b.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
              </Badge>
            </div>
          </Card>
        ))}
        {data.businesses.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणतेही व्यवसाय नोंदवलेले नाहीत
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   5. REFERRALS
   ============================================================ */
function ReferralsView({ data, setData, toast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', giverName: '', receiverName: '' });

  const submit = async (e) => {
    e.preventDefault();
    await adminApi.createReferral(form);
    setData(prev => ({
      ...prev,
      referrals: [{ id: `REF-${Date.now()}`, ...form, createdAt: new Date() }, ...prev.referrals]
    }));
    toast('नवीन B2B रेफरल नोंदवला!', 'success');
    setShowModal(false);
    setForm({ title: '', value: '', giverName: '', receiverName: '' });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`एकूण ${data.referrals.length} रेफरल्स`}>🤝 B2B Referrals</SectionTitle>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ नवीन रेफरल</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.referrals.map((r, i) => (
          <Card key={r.id || i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>
                {r.id || `REF-${i}`}
              </span>
              <Badge>₹{Number(r.value || r.estimatedValue || 0).toLocaleString('en-IN')}</Badge>
            </div>
            <div style={{ fontWeight: 900, color: T.ink, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: '0.75rem', color: T.muted }}>
              <strong>{r.giverName || '—'}</strong> → <strong>{r.receiverName || '—'}</strong>
            </div>
          </Card>
        ))}
        {data.referrals.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणतेही रेफरल्स नाहीत
          </Card>
        )}
      </div>

      {showModal && (
        <Modal title="🤝 नवीन B2B रेफरल" onClose={() => setShowModal(false)}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शीर्षक *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="अंदाजे मूल्य (₹)" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            <Input label="देणारा" value={form.giverName} onChange={e => setForm({ ...form, giverName: e.target.value })} />
            <Input label="घेणारा" value={form.receiverName} onChange={e => setForm({ ...form, receiverName: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowModal(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">नोंदवा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   6. CONTENT (articles / history / forts / temples / personalities)
   ============================================================ */
function ContentView({ type, data, toast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', status: 'draft' });
  const items = data.content[type] || [];
  const labels = {
    articles: '📝 Articles',
    history: '📜 History',
    forts: '🏰 Forts',
    temples: '🛕 Temples',
    personalities: '👑 Personalities'
  };

  const submit = async (e) => {
    e.preventDefault();
    await adminApi.saveContent({ ...form, type });
    toast('सामग्री जतन केली', 'success');
    setShowModal(false);
    setForm({ title: '', body: '', status: 'draft' });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`${items.length} नोंदी`}>{labels[type]}</SectionTitle>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ नवीन</Btn>
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          headers={['शीर्षक', 'प्रकार', 'स्थिती', 'कृती']}
          rows={items.map((c, i) => [
            <strong>{c.title || c.name || 'शीर्षक नाही'}</strong>,
            <Badge>{type}</Badge>,
            <Badge tone={c.status === 'published' ? 'green' : 'saffron'}>{c.status || 'draft'}</Badge>,
            <Btn variant="ghost" onClick={() => { adminApi.publishContent(c.id); toast('प्रकाशित!', 'success'); }}>प्रकाशित करा</Btn>
          ])}
        />
      </Card>

      {showModal && (
        <Modal title={`नवीन ${type}`} onClose={() => setShowModal(false)} width={600}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शीर्षक *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>मजकूर</label>
              <textarea
                rows={6} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                style={{
                  width: '100%', padding: 12, borderRadius: 6,
                  background: T.softBg, border: `1px solid ${T.border}`,
                  fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                  resize: 'vertical', boxSizing: 'border-box'
                }} />
            </div>
            <Select label="स्थिती" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'review', label: 'Review' },
                { value: 'published', label: 'Published' }
              ]} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowModal(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">जतन करा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   7. MEDIA LIBRARY
   ============================================================ */
function MediaView({ data, toast }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`${data.media.length} फायली`}>🖼️ Media Library</SectionTitle>
        <label style={{
          background: T.gradient, color: '#fff', padding: '8px 14px',
          borderRadius: 8, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
        }}>
          + अपलोड करा
          <input type="file" style={{ display: 'none' }} onChange={() => toast('अपलोड सुरू...', 'success')} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {data.media.map((m, i) => (
          <Card key={i} style={{ padding: 8, textAlign: 'center' }}>
            <div style={{
              height: 100, background: T.softBg, borderRadius: 6,
              display: 'grid', placeItems: 'center', fontSize: '2rem', marginBottom: 6
            }}>{m.type === 'video' ? '🎬' : m.type === 'pdf' ? '📄' : '🖼️'}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.name || `file-${i}`}
            </div>
          </Card>
        ))}
        {data.media.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            मीडिया लायब्ररी रिकामी आहे
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   8. EVENTS
   ============================================================ */
function EventsView({ data, toast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', venue: '' });

  const submit = async (e) => {
    e.preventDefault();
    await adminApi.createEvent(form);
    toast('कार्यक्रम तयार झाला!', 'success');
    setShowModal(false);
    setForm({ title: '', date: '', venue: '' });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`${data.events.length} कार्यक्रम`}>📅 Events</SectionTitle>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ नवीन कार्यक्रम</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.events.map((e, i) => (
          <Card key={i}>
            <div style={{ fontSize: '0.7rem', color: T.saffron, fontWeight: 800, marginBottom: 4 }}>
              📅 {e.date || '—'}
            </div>
            <div style={{ fontWeight: 900, color: T.ink, marginBottom: 6 }}>{e.title || 'कार्यक्रम'}</div>
            <div style={{ fontSize: '0.78rem', color: T.muted }}>📍 {e.venue || '—'}</div>
          </Card>
        ))}
        {data.events.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणतेही कार्यक्रम नाहीत
          </Card>
        )}
      </div>

      {showModal && (
        <Modal title="📅 नवीन कार्यक्रम" onClose={() => setShowModal(false)}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शीर्षक *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="दिनांक" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="स्थळ" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowModal(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">तयार करा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   9. CAMPAIGNS
   ============================================================ */
function CampaignsView({ data }) {
  return (
    <>
      <SectionTitle subtitle="मोहिमा व्यवस्थापन">📣 Campaigns</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table
          headers={['मोहीम', 'प्रकार', 'प्रेक्षक', 'स्थिती']}
          rows={data.campaigns.map(c => [
            <strong>{c.name || 'मोहीम'}</strong>,
            <Badge>{c.type || '—'}</Badge>,
            c.audience || '—',
            <Badge tone={c.status === 'active' ? 'green' : 'saffron'}>{c.status || 'draft'}</Badge>
          ])}
        />
      </Card>
    </>
  );
}

/* ============================================================
   10. COMMUNICATION
   ============================================================ */
function CommunicationView({ toast }) {
  const [channel, setChannel] = useState('sms');
  const [message, setMessage] = useState('');

  return (
    <>
      <SectionTitle subtitle="एकत्रित संवाद केंद्र">💬 Communication Center</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Select label="चॅनेल" value={channel} onChange={e => setChannel(e.target.value)}
            options={[
              { value: 'sms', label: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'Email' },
              { value: 'push', label: 'Push Notification' }
            ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>संदेश</label>
            <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)}
              style={{
                padding: 12, borderRadius: 6,
                background: T.softBg, border: `1px solid ${T.border}`,
                fontSize: '0.82rem', fontFamily: 'inherit',
                resize: 'vertical', boxSizing: 'border-box'
              }} />
          </div>
          <div>
            <Btn variant="primary" onClick={() => {
              adminApi.sendCampaign({ channel, message });
              toast('संदेश पाठवला!', 'success');
              setMessage('');
            }}>📤 पाठवा</Btn>
          </div>
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   11. WORKFLOWS
   ============================================================ */
function WorkflowsView({ data }) {
  return (
    <>
      <SectionTitle subtitle="स्वयंचलित प्रक्रिया">🔄 Workflows</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.workflows.map((w, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ color: T.ink }}>{w.name || 'Workflow'}</strong>
              <Badge tone={w.enabled ? 'green' : 'gray'}>{w.enabled ? 'सक्रिय' : 'बंद'}</Badge>
            </div>
            <div style={{ fontSize: '0.75rem', color: T.muted }}>
              {w.trigger} → {w.action}
            </div>
          </Card>
        ))}
        {data.workflows.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणत्याही वर्कफ्लो नाहीत
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   12. TICKETS / COMPLAINTS
   ============================================================ */
function TicketsView({ data, toast }) {
  const resolve = (id) => {
    adminApi.updateTicket(id, { status: 'resolved' });
    toast('तिकीट निराकरण', 'success');
  };
  return (
    <>
      <SectionTitle subtitle={`${data.tickets.length} तिकिटे`}>🎫 Complaints & Tickets</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table
          headers={['ID', 'विषय', 'प्राधान्य', 'स्थिती', 'कृती']}
          rows={data.tickets.map(t => [
            <span style={{ fontFamily: 'monospace', color: T.saffron }}>{t.id}</span>,
            <strong>{t.subject || '—'}</strong>,
            <Badge tone={t.priority === 'high' ? 'red' : 'saffron'}>{t.priority || 'normal'}</Badge>,
            <Badge tone={t.status === 'resolved' ? 'green' : 'saffron'}>{t.status || 'open'}</Badge>,
            <Btn variant="success" onClick={() => resolve(t.id)}>निराकरण</Btn>
          ])}
        />
      </Card>
    </>
  );
}

/* ============================================================
   13. BLOOD / SEVA
   ============================================================ */
function BloodView({ data }) {
  return (
    <>
      <SectionTitle subtitle={`${data.blood.length} विनंत्या`}>🩸 Blood Helpdesk</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.blood.map((b, i) => (
          <Card key={i} style={{ borderColor: '#FCA5A5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge tone="red">🩸 {b.bloodGroup || 'सर्व'}</Badge>
              <Badge tone="red">तातडीची</Badge>
            </div>
            <div style={{ fontWeight: 900, color: T.ink }}>{b.patientName || 'रुग्ण'}</div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 6 }}>
              🏥 {b.hospital || '—'} • 📍 {b.city || '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 4 }}>
              📞 {b.contactNumber || '—'}
            </div>
          </Card>
        ))}
        {data.blood.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणत्याही विनंत्या नाहीत
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   14. REPORTS / ANALYTICS
   ============================================================ */
function ReportsView({ data }) {
  const stats = [
    { label: 'एकूण सदस्य', value: data.users.length, color: T.saffron },
    { label: 'व्यवसाय', value: data.businesses.length, color: T.amber },
    { label: 'रेफरल्स', value: data.referrals.length, color: T.deep },
    { label: 'तक्रारी', value: data.tickets.length, color: T.red },
    { label: 'रक्त विनंत्या', value: data.blood.length, color: T.red },
    { label: 'कार्यक्रम', value: data.events.length, color: T.saffron }
  ];
  return (
    <>
      <SectionTitle subtitle="प्लॅटफॉर्म विश्लेषण">📊 Reports & Analytics</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => (
          <Card key={i}>
            <div style={{ fontSize: '0.75rem', color: T.ink, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, marginTop: 6 }}>{s.value}</div>
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 900, color: T.ink, marginBottom: 12 }}>📈 वाढ ट्रेंड</div>
        <div style={{ height: 200, background: T.softBg, borderRadius: 8, display: 'grid', placeItems: 'center', color: T.muted, fontWeight: 600 }}>
          Chart placeholder — connect a charting library (Recharts / Chart.js)
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   15. APPROVALS
   ============================================================ */
function ApprovalsView({ data }) {
  const pending = data.users.filter(u => !u.verified);
  return (
    <>
      <SectionTitle subtitle={`${pending.length} प्रलंबित`}>✅ Approvals</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table
          headers={['प्रकार', 'नाव', 'स्थिती']}
          rows={pending.map(u => [
            <Badge>KYC Verification</Badge>,
            <strong>{u.name}</strong>,
            <Badge tone="saffron">प्रलंबित</Badge>
          ])}
        />
      </Card>
    </>
  );
}

/* ============================================================
   16. MASTER DATA
   ============================================================ */
function MasterDataView({ toast }) {
  const tables = [
    { name: 'जिल्हे', count: 36, icon: '🗺️' },
    { name: 'तालुके', count: 358, icon: '📍' },
    { name: 'श्रेणी', count: 120, icon: '📂' },
    { name: 'व्यवसाय प्रकार', count: 240, icon: '💼' },
    { name: 'कौशल्ये', count: 85, icon: '🎯' },
    { name: 'ऐतिहासिक कालखंड', count: 15, icon: '📜' }
  ];
  return (
    <>
      <SectionTitle subtitle="केंद्रीय संदर्भ सारण्या">🗃️ Master Data</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {tables.map((t, i) => (
          <Card key={i} style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={() => toast(`${t.name} उघडत आहे...`, 'success')}>
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontWeight: 800, color: T.ink }}>{t.name}</div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 4 }}>{t.count} नोंदी</div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   17. ROLES & PERMISSIONS
   ============================================================ */
function RolesView({ data, toast }) {
  const defaultRoles = [
    { name: 'Super Admin', perms: 'ALL', color: T.saffron },
    { name: 'State Admin', perms: 'State-level', color: T.amber },
    { name: 'District Admin', perms: 'District-level', color: T.deep },
    { name: 'Chapter Admin', perms: 'Chapter-level', color: T.saffron },
    { name: 'Content Admin', perms: 'CMS only', color: T.amber },
    { name: 'CRM Admin', perms: 'CRM only', color: T.deep }
  ];
  const roles = data.roles.length ? data.roles : defaultRoles;

  return (
    <>
      <SectionTitle subtitle="प्रवेश नियंत्रण">🔑 Roles & Permissions</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {roles.map((r, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ color: T.ink }}>{r.name}</strong>
              <span style={{ fontSize: '1.2rem' }}>🔑</span>
            </div>
            <Badge>{r.perms || 'Custom'}</Badge>
            <div style={{ marginTop: 12 }}>
              <Btn variant="plain" onClick={() => toast(`${r.name} संपादित करा`, 'success')}>संपादित</Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   18. AUDIT LOGS
   ============================================================ */
function AuditView({ data }) {
  return (
    <>
      <SectionTitle subtitle="सुरक्षा व सिस्टम क्रियाकलाप">🛡️ Audit Logs</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
          {data.audit.map((log, i) => (
            <div key={i} style={{
              background: T.softBg, border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.saffron}`,
              padding: '10px 14px', borderRadius: 8,
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.78rem'
            }}>
              <div>
                <strong style={{ color: T.saffron }}>[{log.action || 'ACTION'}]</strong>{' '}
                <span style={{ color: T.text, fontWeight: 600 }}>{log.performedBy || 'System'}</span>
                {log.module && <span style={{ color: T.muted }}> • {log.module}</span>}
              </div>
              <span style={{ color: T.muted, fontFamily: 'monospace', fontSize: '0.72rem' }}>
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'आत्ताच'}
              </span>
            </div>
          ))}
          {data.audit.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontWeight: 600 }}>
              कोणतेही लॉग नाहीत
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   19. SETTINGS
   ============================================================ */
function SettingsView({ toast }) {
  return (
    <>
      <SectionTitle subtitle="सिस्टम कॉन्फिगरेशन">⚙️ Settings</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 10 }}>🌐 Site Configuration</div>
          <Input label="Site Name" defaultValue="Connect Maratha" />
          <div style={{ height: 10 }} />
          <Input label="Contact Email" defaultValue="admin@connectmaratha.org" />
          <div style={{ height: 10 }} />
          <Btn variant="primary" onClick={() => toast('जतन केले!', 'success')}>जतन करा</Btn>
        </Card>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 10 }}>🔔 Notifications</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
            {['Email alerts', 'SMS alerts', 'Push notifications', 'Weekly digest'].map((x, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontWeight: 600 }}>{x}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 10 }}>🔒 Security</div>
          <div style={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.7 }}>
            • Session timeout: 60 min<br />
            • 2FA: Disabled<br />
            • IP whitelist: Not set<br />
            • Audit logging: Enabled
          </div>
        </Card>
      </div>
    </>
  );
}

/* ============================================================
   20. GENERIC LIST (chapters, admins, etc.)
   ============================================================ */
function GenericListView({ title, icon, items = [], columns }) {
  return (
    <>
      <SectionTitle>{icon} {title}</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table headers={columns} rows={items} />
      </Card>
    </>
  );
}