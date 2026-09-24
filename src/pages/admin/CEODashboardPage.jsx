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
    day: '12',
    userId: 'CM-10315',
    leader: 'अनिरुद्ध भालचंद्र पाटील',
    name: 'पिंपरी-चिंचवड औद्योगिक मंडळ',
    state: 'महाराष्ट्र',
    district: 'पुणे',
    city: 'पिंपरी-चिंचवड',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 52,
    refs: '१,१५०',
    rev: '₹११.२ कोटी',
    revNumeric: 112000000,
    grade: 'A+ Elite',
    growth: '+२१.३%'
  },
  {
    id: 'MNDL-2026-004',
    stage: 'active',
    year: '2026',
    month: '08',
    week: 'Week 34',
    day: '22',
    userId: 'ADM-02',
    leader: 'विश्वासराव मोरे',
    name: 'ठाणे – सह्याद्री उद्योग चॅप्टर',
    state: 'महाराष्ट्र',
    district: 'ठाणे',
    city: 'ठाणे',
    division: 'कोकण विभाग',
    members: 40,
    refs: '९८०',
    rev: '₹६.५ कोटी',
    revNumeric: 65000000,
    grade: 'A Grade',
    growth: '+१४.१%'
  },
  {
    id: 'MNDL-2026-005',
    stage: 'active',
    year: '2026',
    month: '08',
    week: 'Week 32',
    day: '08',
    userId: 'CM-10480',
    leader: 'विक्रमसिंह घाटगे',
    name: 'कोल्हापूर – महालक्ष्मी व्यापारी संघ',
    state: 'महाराष्ट्र',
    district: 'कोल्हापूर',
    city: 'कोल्हापूर',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 38,
    refs: '८४०',
    rev: '₹७.२ कोटी',
    revNumeric: 72000000,
    grade: 'A Grade',
    growth: '+१५.०%'
  },
  {
    id: 'MNDL-2026-006',
    stage: 'review',
    year: '2026',
    month: '07',
    week: 'Week 28',
    day: '14',
    userId: 'CM-10512',
    leader: 'सुभाषराव जगताप',
    name: 'सातारा – अजिंक्यतारा उद्योग गट',
    state: 'महाराष्ट्र',
    district: 'सातारा',
    city: 'सातारा',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 35,
    refs: '६२०',
    rev: '₹४.८ कोटी',
    revNumeric: 48000000,
    grade: 'B+ Gold',
    growth: '+११.५%'
  },
  {
    id: 'MNDL-2026-007',
    stage: 'review',
    year: '2026',
    month: '06',
    week: 'Week 24',
    day: '10',
    userId: 'CM-10650',
    leader: 'संदीप दत्तात्रय कदम',
    name: 'नाशिक – गोदावरी कृषी-व्यापार चॅप्टर',
    state: 'महाराष्ट्र',
    district: 'नाशिक',
    city: 'नाशिक',
    division: 'उत्तर महाराष्ट्र विभाग',
    members: 42,
    refs: '१,०५०',
    rev: '₹६.९ कोटी',
    revNumeric: 69000000,
    grade: 'A Grade',
    growth: '+१३.८%'
  },
  {
    id: 'MNDL-2026-008',
    stage: 'new',
    year: '2026',
    month: '05',
    week: 'Week 20',
    day: '18',
    userId: 'CM-10722',
    leader: 'राजेंद्रसिंह देशमुख',
    name: 'छत्रपती संभाजीनगर – देवगिरी उद्योग परिषद',
    state: 'महाराष्ट्र',
    district: 'छत्रपती संभाजीनगर',
    city: 'छत्रपती संभाजीनगर',
    division: 'मराठवाडा विभाग',
    members: 36,
    refs: '८९०',
    rev: '₹५.८ कोटी',
    revNumeric: 58000000,
    grade: 'B+ Gold',
    growth: '+१०.२%'
  },
  {
    id: 'MNDL-2025-009',
    stage: 'new',
    year: '2025',
    month: '11',
    week: 'Week 46',
    day: '15',
    userId: 'ADM-02',
    leader: 'विश्वासराव मोरे',
    name: 'नागपूर – दीक्षाभूमी व्यापार महासंघ',
    state: 'महाराष्ट्र',
    district: 'नागपूर',
    city: 'नागपूर',
    division: 'विदर्भ विभाग',
    members: 34,
    refs: '७६०',
    rev: '₹५.२ कोटी',
    revNumeric: 52000000,
    grade: 'B+ Gold',
    growth: '+९.८%'
  }
];

export default function CEODashboardPage() {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState('maharashtra');
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' (kanban) | 'grid' (table) | 'divisions'
  const [period, setPeriod] = useState('mtd'); // 'today' | 'week' | 'mtd' | 'ytd'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedMandal, setSelectedMandal] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    division: 'all',
    district: 'all',
    stage: 'all',
    search: ''
  });

  const profile = scopeProfiles[selectedArea] || scopeProfiles.maharashtra;

  // Filtered dataset
  const filteredReports = useMemo(() => {
    return CEO_DETAILED_MANDAL_REPORTS.filter((r) => {
      if (filters.division !== 'all' && r.division !== filters.division) return false;
      if (filters.district !== 'all' && r.district !== filters.district) return false;
      if (filters.stage !== 'all' && r.stage !== filters.stage) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.leader.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.division.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filters]);

  // Kanban Stage Grouping
  const stages = [
    { id: 'new', name: 'नवीन नोंदणी (New Inquiries)', badge: '#60A5FA', count: filteredReports.filter(r => r.stage === 'new').length },
    { id: 'review', name: 'पडताळणी प्रलंबित (Under Scrutiny)', badge: '#F59E0B', count: filteredReports.filter(r => r.stage === 'review').length },
    { id: 'active', name: 'सक्रिय चॅप्टर्स (Active Mandals)', badge: '#10B981', count: filteredReports.filter(r => r.stage === 'active').length },
    { id: 'vip', name: 'एलिट VIP मंडळ (A+ Elite)', badge: '#8B5CF6', count: filteredReports.filter(r => r.stage === 'vip').length }
  ];

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mandal ID', 'Name', 'Leader', 'Division', 'District', 'Members', 'Referrals', 'Revenue', 'Growth', 'Stage'];
    const rows = filteredReports.map((r) => [
      r.id,
      `"${r.name}"`,
      `"${r.leader}"`,
      `"${r.division}"`,
      `"${r.district}"`,
      r.members,
      `"${r.refs}"`,
      `"${r.rev}"`,
      `"${r.growth}"`,
      r.stage
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Connect_Maratha_CEO_CRM_${period}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090D16', color: '#F1F5F9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ============================================================ */}
      {/* 1. LEFT CRM SIDEBAR NAVIGATION (ENTERPRISE FORMAT) */}
      {/* ============================================================ */}
      <aside style={{
        width: sidebarCollapsed ? '72px' : '260px',
        background: '#0B0F19',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40
      }}>
        {/* Brand & Workspace */}
        <div style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between'
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 900
              }}>
                🚩
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#FFFFFF', display: 'block', lineHeight: 1.2 }}>
                  CONNECT MARATHA
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: 700, letterSpacing: '0.5px' }}>
                  ENTERPRISE CRM v2.4
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#94A3B8',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
            {sidebarCollapsed ? '➔' : '←'}
          </button>
        </div>

        {/* Territory Scope Switcher */}
        {!sidebarCollapsed && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              कार्यक्षेत्र व्याप्ती (Territory Scope)
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{
                width: '100%',
                background: '#111827',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#FCD34D',
                borderRadius: '6px',
                padding: '7px 10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}>
              <option value="maharashtra">🦅 महाराष्ट्र राज्य (Statewide)</option>
              <option value="pune_div">🏢 पुणे विभाग (Divisional)</option>
              <option value="sangli_dist">📍 सांगली जिल्हा (District)</option>
            </select>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {[
            { id: 'ceo', label: 'कार्यकारी नियंत्रण (CEO Cockpit)', icon: '📊', active: true, to: '/crm/ceo', badge: 'Active' },
            { id: 'pipeline', label: 'डील्स व व्यवसाय पाईपलाईन', icon: '👥', to: '/sangam', badge: profile.businesses },
            { id: 'mandals', label: 'व्यवसाय मंडळे व चॅप्टर्स', icon: '📇', to: '/crm/chapter', badge: profile.mandals },
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
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.1))'
                  : item.highlight
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'transparent',
                color: item.active
                  ? '#F59E0B'
                  : item.highlight
                  ? '#C084FC'
                  : '#94A3B8',
                border: item.active
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : item.highlight
                  ? '1px solid rgba(124, 58, 237, 0.3)'
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
                      background: item.active ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                      color: item.active ? '#000000' : '#CBD5E1',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#F59E0B',
            color: '#000',
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
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                कार्याध्यक्ष (State CEO)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>🟢 ४ ॲडमिन लाईव्ह</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CRM WORKSPACE AREA */}
      {/* ============================================================ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Sticky Executive Top Bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Global Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 14px',
              width: '100%'
            }}>
              <span style={{ color: '#64748B' }}>🔍</span>
              <input
                type="text"
                placeholder="मंडळ, जिल्हा, पदाधिकारी किंवा युझर शोधा (Ctrl+K)..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#94A3B8',
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                ⌘K
              </span>
            </div>
          </div>

          {/* Timeframe & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Period Selector */}
            <div style={{ display: 'flex', background: '#111827', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '2px' }}>
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
                    background: period === p.id ? '#F59E0B' : 'transparent',
                    color: period === p.id ? '#000000' : '#94A3B8',
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
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>+</span>
              <span>नवीन डील / रेफरल</span>
            </Link>

            <button
              onClick={handleExportCSV}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
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
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
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
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 60%, #172554 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', borderRadius: '20px', padding: '3px 12px', fontSize: '0.72rem', color: '#FDE68A', marginBottom: '8px' }}>
                <span>🚩 {profile.badge}</span>
                <span>•</span>
                <span>🟢 लाईव्ह डेटाबेस सिंक्रोनाइझेशन</span>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                {profile.title}
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94A3B8' }}>
                {profile.sub}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '10px' }}>
              <button
                onClick={() => setViewMode('pipeline')}
                style={{
                  background: viewMode === 'pipeline' ? '#F59E0B' : 'transparent',
                  color: viewMode === 'pipeline' ? '#000' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>📊</span>
                <span>पाईपलाईन (Kanban)</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? '#F59E0B' : 'transparent',
                  color: viewMode === 'grid' ? '#000' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>📋</span>
                <span>डेटा ग्रिड (Table)</span>
              </button>

              <button
                onClick={() => setViewMode('divisions')}
                style={{
                  background: viewMode === 'divisions' ? '#F59E0B' : 'transparent',
                  color: viewMode === 'divisions' ? '#000' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>🗺️</span>
                <span>विभागीय सांख्यिकी</span>
              </button>
            </div>
          </div>

          {/* KPI Ribbon (Compact, Modern Metric Cards) */}
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
                  background: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{kpi.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>{kpi.icon}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                    {kpi.val}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '6px' }}>
                    {kpi.delta}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>फिल्टर्स:</span>

            <select
              value={filters.division}
              onChange={(e) => setFilters({ ...filters, division: e.target.value })}
              style={{
                background: '#0F172A',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFF',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.78rem'
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
                background: '#0F172A',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFF',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.78rem'
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
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#F87171',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}>
                ✕ रिसेट फिल्टर्स
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748B' }}>
              एकूण सापडलेले अहवाल: <strong>{filteredReports.length}</strong>
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
                      background: '#0F172A',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                    {/* Stage Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stg.badge }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#E2E8F0' }}>
                          {stg.name}
                        </span>
                      </div>
                      <span style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#94A3B8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
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
                            background: '#1E293B',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#F59E0B';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.transform = 'none';
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                              {item.id}
                            </span>
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#FCD34D',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {item.grade}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {item.name}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                            👤 अध्यक्ष: <strong style={{ color: '#E2E8F0' }}>{item.leader}</strong>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '6px',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            fontSize: '0.72rem'
                          }}>
                            <span style={{ color: '#10B981', fontWeight: 800 }}>
                              {item.rev}
                            </span>
                            <span style={{ color: '#64748B' }}>
                              👥 {item.members} सदस्य | 🤝 {item.refs}
                            </span>
                          </div>
                        </div>
                      ))}

                      {stageItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748B', fontSize: '0.75rem' }}>
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
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
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
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#F59E0B' }}>
                          {row.id}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#FFFFFF' }}>
                          {row.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#CBD5E1' }}>
                          {row.leader}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#94A3B8' }}>
                          {row.division} • {row.district}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#E2E8F0' }}>
                          {row.members}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#E2E8F0' }}>
                          {row.refs}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#10B981' }}>
                          {row.rev}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#FCD34D',
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
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#FFF',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
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
                    background: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {div.name}
                    </h3>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      {div.growth}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                    {div.dists}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>व्यवसाय मंडळे</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FCD34D' }}>{div.mandals}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>एकूण उलाढाल</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10B981' }}>{div.rev}</div>
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
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 9999
        }}>
          <div style={{
            width: '460px',
            maxWidth: '100%',
            height: '100%',
            background: '#0F172A',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontFamily: 'monospace' }}>
                {selectedMandal.id}
              </span>
              <button
                onClick={() => setSelectedMandal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#FFF', fontWeight: 900 }}>
              {selectedMandal.name}
            </h2>

            <div style={{ background: '#1E293B', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>अध्यक्ष / समन्वयक</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>{selectedMandal.leader}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>User ID: {selectedMandal.userId}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>उलाढाल</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10B981' }}>{selectedMandal.rev}</div>
              </div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>सदस्य संख्या</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF' }}>{selectedMandal.members}</div>
              </div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>रेफरल्स</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FCD34D' }}>{selectedMandal.refs}</div>
              </div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>दर्जा</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#A78BFA' }}>{selectedMandal.grade}</div>
              </div>
            </div>

            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>भौगोलिक स्थान</div>
              <div style={{ fontSize: '0.88rem', color: '#FFF' }}>
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
                  background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
                  color: '#000',
                  fontWeight: 900,
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: '0.82rem'
                }}>
                B2B बैठका पहा
              </Link>
              <button
                onClick={() => setSelectedMandal(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#CBD5E1',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
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
