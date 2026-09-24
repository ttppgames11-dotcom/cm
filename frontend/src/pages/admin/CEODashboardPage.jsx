import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const scopeProfiles = {
  maharashtra: {
    badge: 'STATEWIDE EXECUTIVE • MAHARASHTRA',
    title: 'मराठा समाज व व्यवसाय संगम — राज्यस्तरीय CEO Cockpit',
    sub: '६ महसूल विभाग, ३६ जिल्हे, ३५८ तालुके व ३,२००+ शाखांचे एकत्रित नियंत्रण केंद्र',
    revenue: '₹ १८४.६ कोटी',
    revenueNumeric: 1846000000,
    members: '२४,८२०',
    businesses: '८,४२१',
    mandals: '१८४',
    active: '१७,४२०',
    referrals: '३२,८४१',
    jobs: '४,२८०',
    events: '३२८',
    growth: '+१६.४% MoM'
  },
  pune_div: {
    badge: 'DIVISIONAL EXECUTIVE • PUNE DIVISION',
    title: 'पुणे विभाग — विभागीय अध्यक्ष नियंत्रण केंद्र',
    sub: 'पुणे, सातारा, कोल्हापूर, सांगली, सोलापूर — ५ जिल्ह्यांचे थेट पर्यवेक्षण',
    revenue: '₹ ४८.२ कोटी',
    revenueNumeric: 482000000,
    members: '१२,४००',
    businesses: '३,९१०',
    mandals: '४२',
    active: '८,८५०',
    referrals: '१४,२९०',
    jobs: '१,८५०',
    events: '११२',
    growth: '+१२.८% MoM'
  },
  sangli_dist: {
    badge: 'DISTRICT EXECUTIVE • SANGLI DISTRICT',
    title: 'सांगली जिल्हा — जिल्हा अध्यक्ष डॅशबोर्ड',
    sub: '१० तालुके, ४ व्यवसाय चॅप्टर्स, ११०+ शाखा व स्थानिक उपक्रम',
    revenue: '₹ १४.८ कोटी',
    revenueNumeric: 148000000,
    members: '३,२५०',
    businesses: '८९०',
    mandals: '१०',
    active: '२,३००',
    referrals: '४,१२०',
    jobs: '४९०',
    events: '३४',
    growth: '+९.५% MoM'
  }
};

const CEO_DETAILED_MANDAL_REPORTS = [
  {
    id: 'MNDL-2026-001',
    stage: 'vip',
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '19',
    userId: 'ADM-04',
    leader: 'तानाजी विठ्ठलराव जाधव',
    name: 'पुणे – शिवनेरी व्यवसाय मंडळ',
    state: 'महाराष्ट्र',
    district: 'पुणे',
    city: 'पुणे',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 48,
    refs: '१,४२०',
    rev: '₹८.४ कोटी',
    revNumeric: 84000000,
    grade: 'A+ Elite',
    growth: '+१६.२%'
  },
  {
    id: 'MNDL-2026-002',
    stage: 'vip',
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '18',
    userId: 'CM-10292',
    leader: 'प्रवीण संभाजी भोसले',
    name: 'मुंबई – दादर व्यवसाय मंडळ',
    state: 'महाराष्ट्र',
    district: 'मुंबई उपनगर',
    city: 'मुंबई',
    division: 'कोकण विभाग',
    members: 45,
    refs: '१,२९०',
    rev: '₹९.१ कोटी',
    revNumeric: 91000000,
    grade: 'A+ Elite',
    growth: '+१८.४%'
  },
  {
    id: 'MNDL-2026-003',
    stage: 'active',
    year: '2026',
    month: '09',
    week: 'Week 37',
    day: '14',
    userId: 'CM-22019',
    leader: 'दिग्विजय राजे कदम',
    name: 'कोल्हापूर – महालक्ष्मी व्यवसाय मंडळ',
    state: 'महाराष्ट्र',
    district: 'कोल्हापूर',
    city: 'कोल्हापूर',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 38,
    refs: '९८०',
    rev: '₹५.८ कोटी',
    revNumeric: 58000000,
    grade: 'A Active',
    growth: '+१४.१%'
  },
  {
    id: 'MNDL-2026-004',
    stage: 'active',
    year: '2026',
    month: '09',
    week: 'Week 37',
    day: '12',
    userId: 'CM-88392',
    leader: 'अमोल सूर्यवंशी',
    name: 'नाशिक – गोदावरी उद्योजक मंच',
    state: 'महाराष्ट्र',
    district: 'नाशिक',
    city: 'नाशिक',
    division: 'उत्तर महाराष्ट्र विभाग',
    members: 34,
    refs: '७६०',
    rev: '₹४.२ कोटी',
    revNumeric: 42000000,
    grade: 'A Active',
    growth: '+११.६%'
  },
  {
    id: 'MNDL-2026-005',
    stage: 'review',
    year: '2026',
    month: '09',
    week: 'Week 36',
    day: '08',
    userId: 'CM-90124',
    leader: 'सचिन मोहिते',
    name: 'सातारा – अजिंक्यतारा उद्योग गट',
    state: 'महाराष्ट्र',
    district: 'सातारा',
    city: 'सातारा',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 28,
    refs: '५४०',
    rev: '₹३.१ कोटी',
    revNumeric: 31000000,
    grade: 'B+ Review',
    growth: '+९.८%'
  },
  {
    id: 'MNDL-2026-006',
    stage: 'review',
    year: '2026',
    month: '09',
    week: 'Week 36',
    day: '05',
    userId: 'CM-11930',
    leader: 'रणजित जगताप',
    name: 'संभाजीनगर – दौलताबाद व्यापार मंडळ',
    state: 'महाराष्ट्र',
    district: 'छत्रपती संभाजीनगर',
    city: 'संभाजीनगर',
    division: 'मराठवाडा विभाग',
    members: 24,
    refs: '४२०',
    rev: '₹२.६ कोटी',
    revNumeric: 26000000,
    grade: 'B+ Review',
    growth: '+८.४%'
  },
  {
    id: 'MNDL-2026-007',
    stage: 'new',
    year: '2026',
    month: '09',
    week: 'Week 35',
    day: '01',
    userId: 'CM-54129',
    leader: 'विकास गायकवाड',
    name: 'नागपूर – दीक्षाभूमी उद्योग मंच',
    state: 'महाराष्ट्र',
    district: 'नागपूर',
    city: 'नागपूर',
    division: 'विदर्भ विभाग',
    members: 18,
    refs: '२१०',
    rev: '₹१.२ कोटी',
    revNumeric: 12000000,
    grade: 'C New',
    growth: '+१५.०%'
  },
  {
    id: 'MNDL-2026-008',
    stage: 'new',
    year: '2026',
    month: '08',
    week: 'Week 34',
    day: '28',
    userId: 'CM-66201',
    leader: 'उदयसिंह पवार',
    name: 'सोलापूर – सिद्धेश्वर व्यवसाय मंडळ',
    state: 'महाराष्ट्र',
    district: 'सोलापूर',
    city: 'सोलापूर',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 16,
    refs: '१८०',
    rev: '₹९५ लाख',
    revNumeric: 9500000,
    grade: 'C New',
    growth: '+१२.२%'
  }
];

export default function CEODashboardPage() {
  const [scope, setScope] = useState('maharashtra');
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'grid' | 'divisions'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState('mtd'); // 'today' | 'week' | 'mtd' | 'ytd'
  const [selectedMandal, setSelectedMandal] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    division: 'all',
    district: 'all',
    stage: 'all',
    search: ''
  });

  const profile = scopeProfiles[scope] || scopeProfiles.maharashtra;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return CEO_DETAILED_MANDAL_REPORTS.filter((item) => {
      const matchDivision = filters.division === 'all' || item.division === filters.division;
      const matchStage = filters.stage === 'all' || item.stage === filters.stage;
      const matchSearch =
        !filters.search ||
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.leader.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.district.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.id.toLowerCase().includes(filters.search.toLowerCase());

      return matchDivision && matchStage && matchSearch;
    });
  }, [filters]);

  // Kanban Stages Definition (Strict White & Bhagwa Saffron Palette)
  const stages = [
    { id: 'vip', name: '👑 A+ Elite VIP मंडळे', badge: '#EA580C', desc: '₹५+ कोटी उलाढाल' },
    { id: 'active', name: '⚡ सक्रिय व्यवसाय मंडळे', badge: '#D97706', desc: '₹२ ते ₹५ कोटी' },
    { id: 'review', name: '⏳ पडताळणी प्रलंबित', badge: '#F97316', desc: '₹१ ते ₹२ कोटी' },
    { id: 'new', name: '🌱 नवीन नोंदणीकृत', badge: '#C2410C', desc: 'नवीन स्थापन' }
  ];

  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['ID,Mandal Name,Leader,Division,District,Members,Referrals,Revenue,Grade',
        ...filteredReports.map(r => `"${r.id}","${r.name}","${r.leader}","${r.division}","${r.district}",${r.members},"${r.refs}","${r.rev}","${r.grade}"`)
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `connect_maratha_ceo_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFDF9', color: '#1E293B', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ============================================================ */}
      {/* 1. COLLAPSIBLE EXECUTIVE LEFT SIDEBAR (WHITE & BHAGWA) */}
      {/* ============================================================ */}
      <aside style={{
        width: sidebarCollapsed ? '72px' : '260px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#FFFFFF',
        borderRight: '1px solid #FED7AA',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '2px 0 10px rgba(234, 88, 12, 0.04)'
      }}>
        {/* Brand & Toggle Header */}
        <div style={{
          padding: '18px 16px',
          borderBottom: '1px solid #FED7AA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          background: '#FFF7ED'
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
                flexShrink: 0
              }}>
                🦅
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#431407', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                  CEO COCKPIT
                </div>
                <div style={{ fontSize: '0.68rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  State Executive
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'विस्तार करा' : 'संक्षिप्त करा'}
            style={{
              background: '#FFFFFF',
              border: '1px solid #FED7AA',
              color: '#EA580C',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Scope Selector (State vs Division vs District) */}
        {!sidebarCollapsed && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #FED7AA', background: '#FFFFFF' }}>
            <label style={{ fontSize: '0.68rem', color: '#9A3412', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              प्रशासकीय कक्ष (Jurisdiction):
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                style={{
                  width: '100%',
                  background: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  color: '#431407',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}>
                <option value="maharashtra">महाराष्ट्र राज्य (सर्व ६ विभाग)</option>
                <option value="pune_div">पुणे विभाग (५ जिल्हे)</option>
                <option value="sangli_dist">सांगली जिल्हा (१० तालुके)</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'cockpit', label: 'राज्यस्तरीय CEO Cockpit', icon: '🦅', to: '/crm/ceo', active: true },
            { id: 'erp', label: 'केंद्रीय सुपर ॲडमिन ERP', icon: '👑', to: '/crm' },
            { id: 'sangam', label: 'व्यवसाय मंडळे व चॅप्टर्स', icon: '🏢', to: '/sangam', badge: profile.mandals },
            { id: 'referrals', label: 'B2B रेफरल्स (TYFCB)', icon: '🤝', to: '/referrals', badge: profile.referrals },
            { id: 'district', label: 'जिल्हा KYC पडताळणी', icon: '📍', to: '/crm/district', badge: '३६ जिल्हे' },
            { id: 'helpdesk', label: 'समाज साहाय्यता व हेल्पडेस्क', icon: '🩺', to: '/crm/helpdesk', badge: '२४x७' },
            { id: 'ai', label: 'Connect Maratha AI Agent', icon: '🤖', to: '/ai', badge: 'RAG 2.0', highlight: true },
            { id: 'finance', label: 'महसूल व लेजर अहवाल', icon: '💰', to: '/crm/finance', badge: profile.revenue },
            { id: 'superadmin', label: 'सुपर ॲडमिन CRUD कन्सोल', icon: '👑', to: '/superadmin', badge: 'SuperAdmin' }
          ].map((item) => (
            <Link
              key={item.id}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                background: item.active
                  ? '#FFF7ED'
                  : item.highlight
                  ? '#FFEDD5'
                  : 'transparent',
                color: item.active
                  ? '#EA580C'
                  : item.highlight
                  ? '#C2410C'
                  : '#475569',
                border: item.active
                  ? '1px solid #FED7AA'
                  : item.highlight
                  ? '1px solid #FDBA74'
                  : '1px solid transparent',
                fontSize: '0.82rem',
                fontWeight: item.active ? 800 : 600,
                transition: 'all 0.15s ease'
              }}>
              <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      background: item.active ? '#EA580C' : '#FFEDD5',
                      color: item.active ? '#FFFFFF' : '#C2410C',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #FED7AA',
          background: '#FFF7ED',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.85rem'
          }}>
            CEO
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#431407', whiteSpace: 'nowrap' }}>
                कार्याध्यक्ष (State CEO)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
                <span>🟢 ४ ॲडमिन लाईव्ह</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CRM WORKSPACE AREA (WHITE & BHAGWA) */}
      {/* ============================================================ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Sticky Executive Top Bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #FED7AA',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 10px rgba(234, 88, 12, 0.05)'
        }}>
          {/* Global Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: '8px',
              padding: '8px 14px',
              width: '100%'
            }}>
              <span style={{ color: '#EA580C' }}>🔍</span>
              <input
                type="text"
                placeholder="मंडळ, जिल्हा, पदाधिकारी किंवा युझर शोधा (Ctrl+K)..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1E293B',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: '100%',
                  fontWeight: 600
                }}
              />
              <span style={{
                background: '#FFFFFF',
                border: '1px solid #FED7AA',
                color: '#9A3412',
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                ⌘K
              </span>
            </div>
          </div>

          {/* Timeframe & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Period Selector */}
            <div style={{ display: 'flex', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '6px', padding: '2px' }}>
              {[
                { id: 'today', label: 'आज' },
                { id: 'week', label: 'आठवडा' },
                { id: 'mtd', label: 'MTD (महिना)' },
                { id: 'ytd', label: 'YTD (वार्षिक)' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  style={{
                    background: period === p.id ? 'linear-gradient(135deg, #EA580C, #D97706)' : 'transparent',
                    color: period === p.id ? '#FFFFFF' : '#7C2D12',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <Link
              to="/sangam"
              style={{
                background: 'linear-gradient(135deg, #EA580C, #D97706)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
              }}>
              <span>+</span>
              <span>नवीन डील / रेफरल</span>
            </Link>

            <button
              onClick={handleExportCSV}
              style={{
                background: '#FFFFFF',
                color: '#7C2D12',
                border: '1px solid #FED7AA',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>📥</span>
              <span>CSV अहवाल</span>
            </button>

            <Link
              to="/ai"
              style={{
                background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
              }}>
              <span>🤖</span>
              <span>AI सहाय्यक</span>
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Executive Header Banner */}
          <div style={{
            background: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(234, 88, 12, 0.06)'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFEDD5', border: '1px solid #FDBA74', borderRadius: '20px', padding: '3px 12px', fontSize: '0.72rem', color: '#9A3412', fontWeight: 800, marginBottom: '8px' }}>
                <span>🚩 {profile.badge}</span>
                <span>•</span>
                <span style={{ color: '#16A34A' }}>🟢 लाईव्ह डेटाबेस सिंक्रोनाइझेशन</span>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#431407', letterSpacing: '-0.3px' }}>
                {profile.title}
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#7C2D12', fontWeight: 600 }}>
                {profile.sub}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', background: '#FFFFFF', padding: '6px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
              <button
                onClick={() => setViewMode('pipeline')}
                style={{
                  background: viewMode === 'pipeline' ? 'linear-gradient(135deg, #EA580C, #D97706)' : 'transparent',
                  color: viewMode === 'pipeline' ? '#FFFFFF' : '#7C2D12',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: viewMode === 'pipeline' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                }}>
                <span>📊</span>
                <span>पाईपलाईन (Kanban)</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'linear-gradient(135deg, #EA580C, #D97706)' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#7C2D12',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                }}>
                <span>📋</span>
                <span>डेटा ग्रिड (Table)</span>
              </button>

              <button
                onClick={() => setViewMode('divisions')}
                style={{
                  background: viewMode === 'divisions' ? 'linear-gradient(135deg, #EA580C, #D97706)' : 'transparent',
                  color: viewMode === 'divisions' ? '#FFFFFF' : '#7C2D12',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: viewMode === 'divisions' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                }}>
                <span>🗺️</span>
                <span>विभागीय सांख्यिकी</span>
              </button>
            </div>
          </div>

          {/* KPI Ribbon (White Cards with Bhagwa Highlights) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {[
              { label: 'एकूण बिझनेस उलाढाल', val: profile.revenue, delta: profile.growth, icon: '💰', sub: 'Gross Business Closed' },
              { label: 'सक्रिय व्यावसायिक मंडळे', val: profile.mandals, delta: '+१२ चॅप्टर्स', icon: '🏢', sub: 'Mandals / Chapters' },
              { label: 'नोंदणीकृत व्यापारी सदस्य', val: profile.businesses, delta: '+१४.२%', icon: '💼', sub: 'Verified Enterprises' },
              { label: 'B2B रेफरल व्यवहार', val: profile.referrals, delta: '+२२.८%', icon: '🤝', sub: 'TYFCB Referrals Passed' },
              { label: 'एकूण प्रमाणित समाज सभासद', val: profile.members, delta: '+८.४%', icon: '👥', sub: 'Active Verified Members' },
              { label: 'सक्रिय रोजगाराच्या संधी', val: profile.jobs, delta: '+१८.०%', icon: '🚀', sub: 'Open Career Opportunities' }
            ].map((kpi, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #FED7AA',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.06)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 700 }}>{kpi.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>{kpi.icon}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#EA580C', letterSpacing: '-0.5px' }}>
                    {kpi.val}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 800, background: '#DCFCE7', padding: '2px 6px', borderRadius: '6px', border: '1px solid #86EFAC' }}>
                    {kpi.delta}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#9A3412', fontWeight: 600 }}>
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.04)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C2D12' }}>फिल्टर्स:</span>

            <select
              value={filters.division}
              onChange={(e) => setFilters({ ...filters, division: e.target.value })}
              style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#431407',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
              <option value="all">सर्व विभाग (All Divisions)</option>
              <option value="पश्चिम महाराष्ट्र विभाग">पश्चिम महाराष्ट्र विभाग</option>
              <option value="कोकण विभाग">कोकण विभाग</option>
              <option value="उत्तर महाराष्ट्र विभाग">उत्तर महाराष्ट्र विभाग</option>
              <option value="मराठवाडा विभाग">मराठवाडा विभाग</option>
              <option value="विदर्भ विभाग">विदर्भ विभाग</option>
            </select>

            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#431407',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
              <option value="all">सर्व टप्पे (All Stages)</option>
              <option value="vip">A+ Elite VIP मंडळ</option>
              <option value="active">सक्रिय मंडळ</option>
              <option value="review">पडताळणी प्रलंबित</option>
              <option value="new">नवीन नोंदणी</option>
            </select>

            {(filters.division !== 'all' || filters.stage !== 'all' || filters.search) && (
              <button
                onClick={() => setFilters({ division: 'all', district: 'all', stage: 'all', search: '' })}
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontWeight: 700
                }}>
                ✕ रिसेट फिल्टर्स
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#7C2D12', fontWeight: 700 }}>
              एकूण सापडलेले अहवाल: <strong style={{ color: '#EA580C' }}>{filteredReports.length}</strong>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VIEW MODE 1: PIPELINE KANBAN (TRUE CRM FORMAT) */}
          {/* ============================================================ */}
          {viewMode === 'pipeline' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              {stages.map((stg) => {
                const stageItems = filteredReports.filter((r) => r.stage === stg.id);
                return (
                  <div
                    key={stg.id}
                    style={{
                      background: '#FFF7ED',
                      border: '1px solid #FED7AA',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.04)'
                    }}>
                    {/* Stage Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FED7AA', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stg.badge }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#431407' }}>
                          {stg.name}
                        </span>
                      </div>
                      <span style={{
                        background: '#FFEDD5',
                        color: '#EA580C',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {stageItems.length}
                      </span>
                    </div>

                    {/* Stage Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {stageItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMandal(item)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #FED7AA',
                            borderRadius: '10px',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#EA580C';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#FED7AA';
                            e.currentTarget.style.transform = 'none';
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.68rem', color: '#9A3412', fontFamily: 'monospace', fontWeight: 700 }}>
                              {item.id}
                            </span>
                            <span style={{
                              background: '#FFF7ED',
                              color: '#EA580C',
                              border: '1px solid #FED7AA',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {item.grade}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                            {item.name}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            👤 अध्यक्ष: <strong style={{ color: '#431407' }}>{item.leader}</strong>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '6px',
                            borderTop: '1px solid #FED7AA',
                            fontSize: '0.72rem'
                          }}>
                            <span style={{ color: '#EA580C', fontWeight: 900 }}>
                              {item.rev}
                            </span>
                            <span style={{ color: '#9A3412', fontWeight: 600 }}>
                              👥 {item.members} सदस्य | 🤝 {item.refs}
                            </span>
                          </div>
                        </div>
                      ))}

                      {stageItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px 12px', color: '#9A3412', fontSize: '0.75rem', fontWeight: 600 }}>
                          या टप्प्यात नोंदी नाहीत
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW MODE 2: HIGH-DENSITY DATA GRID TABLE */}
          {/* ============================================================ */}
          {viewMode === 'grid' && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #FED7AA',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(234, 88, 12, 0.05)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', color: '#7C2D12', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>अहवाल आयडी</th>
                      <th style={{ padding: '12px 16px' }}>मंडळाचे नाव</th>
                      <th style={{ padding: '12px 16px' }}>अध्यक्ष / समन्वयक</th>
                      <th style={{ padding: '12px 16px' }}>विभाग व जिल्हा</th>
                      <th style={{ padding: '12px 16px' }}>सदस्य संख्या</th>
                      <th style={{ padding: '12px 16px' }}>रेफरल्स</th>
                      <th style={{ padding: '12px 16px' }}>बिझनेस उलाढाल</th>
                      <th style={{ padding: '12px 16px' }}>दर्जा</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>कृती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((row) => (
                      <tr
                        key={row.id}
                        style={{ borderBottom: '1px solid #FED7AA' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF7ED')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#EA580C', fontWeight: 800 }}>
                          {row.id}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1E293B' }}>
                          {row.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {row.leader}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>
                          {row.division} • {row.district}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#1E293B', fontWeight: 600 }}>
                          {row.members}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#1E293B', fontWeight: 600 }}>
                          {row.refs}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 900, color: '#EA580C' }}>
                          {row.rev}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: '#FFF7ED',
                            color: '#C2410C',
                            border: '1px solid #FED7AA',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {row.grade}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedMandal(row)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #FED7AA',
                              color: '#EA580C',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}>
                            तपशील ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW MODE 3: DIVISIONAL PERFORMANCE VELOCITY */}
          {/* ============================================================ */}
          {viewMode === 'divisions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {[
                { name: 'पश्चिम महाराष्ट्र विभाग', dists: 'पुणे, सातारा, कोल्हापूर, सांगली, सोलापूर', mandals: 68, rev: '₹७२.४ कोटी', growth: '+१८.२%' },
                { name: 'कोकण विभाग (मुंबई-ठाणे)', dists: 'मुंबई, उपनगर, ठाणे, पालघर, रायगड, रत्नागिरी, सिंधुदुर्ग', mandals: 54, rev: '₹६१.२ कोटी', growth: '+१६.८%' },
                { name: 'उत्तर महाराष्ट्र विभाग', dists: 'नाशिक, जळगाव, धुळे, नंदुरबार, अहिल्यानगर', mandals: 28, rev: '₹२४.५ कोटी', growth: '+१४.१%' },
                { name: 'मराठवाडा विभाग', dists: 'संभाजीनगर, जालना, बीड, परभणी, नांदेड, लातूर, धाराशिव, हिंगोली', mandals: 22, rev: '₹१८.४ कोटी', growth: '+१२.०%' },
                { name: 'विदर्भ विभाग', dists: 'नागपूर, अमरावती, अकोला, यवतमाळ, वर्धा, चंद्रपूर, भंडारा, गोंदिया', mandals: 12, rev: '₹८.१ कोटी', growth: '+९.५%' }
              ].map((div, i) => (
                <div
                  key={i}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FED7AA',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.06)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#431407' }}>
                      {div.name}
                    </h3>
                    <span style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      {div.growth}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                    {div.dists}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #FED7AA' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#7C2D12', fontWeight: 700 }}>व्यवसाय मंडळे</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#EA580C' }}>{div.mandals}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: '#7C2D12', fontWeight: 700 }}>एकूण उलाढाल</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#C2410C' }}>{div.rev}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Detail Modal */}
      {selectedMandal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 9999
        }}>
          <div style={{
            width: '460px',
            maxWidth: '100%',
            height: '100%',
            background: '#FFFFFF',
            borderLeft: '2px solid #EA580C',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            boxShadow: '-10px 0 30px rgba(234, 88, 12, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#EA580C', fontFamily: 'monospace', fontWeight: 800 }}>
                {selectedMandal.id}
              </span>
              <button
                onClick={() => setSelectedMandal(null)}
                style={{ background: 'none', border: 'none', color: '#EA580C', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}>
                ✕
              </button>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#431407', fontWeight: 900 }}>
              {selectedMandal.name}
            </h2>

            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 700 }}>अध्यक्ष / समन्वयक</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{selectedMandal.leader}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>User ID: {selectedMandal.userId}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#7C2D12', fontWeight: 700 }}>उलाढाल</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#EA580C' }}>{selectedMandal.rev}</div>
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#7C2D12', fontWeight: 700 }}>सदस्य संख्या</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E293B' }}>{selectedMandal.members}</div>
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#7C2D12', fontWeight: 700 }}>रेफरल्स</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D97706' }}>{selectedMandal.refs}</div>
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#7C2D12', fontWeight: 700 }}>दर्जा</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#C2410C' }}>{selectedMandal.grade}</div>
              </div>
            </div>

            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 700, marginBottom: '6px' }}>भौगोलिक स्थान</div>
              <div style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: 600 }}>
                {selectedMandal.city}, {selectedMandal.district} ({selectedMandal.state})
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                {selectedMandal.division}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <Link
                to="/sangam"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #EA580C, #D97706)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                }}>
                B2B बैठका पहा
              </Link>
              <button
                onClick={() => setSelectedMandal(null)}
                style={{
                  background: '#FFF7ED',
                  color: '#7C2D12',
                  border: '1px solid #FED7AA',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}>
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
