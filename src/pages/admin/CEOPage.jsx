import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   INITIAL MOCK DATA FOR CEO COMMAND CENTER
   ============================================================ */
const INITIAL_KPIS = {
  members: 125480,
  membersMonth: 2340,
  businesses: 8420,
  businessesVerifiedMonth: 612,
  b2bOpportunities: 4820,
  pipelineValueCr: 32.5,
  closedValueCr: 18.4,
  closedValueMonthCr: 2.1,
  sevaCases: 1248,
  sevaOpen: 89,
  events: 326,
  eventsUpcoming: 18,
  activeLeaders: 2840,
  vacantLeaders: 42,
  growthYoY: 18.4
};

const REGIONAL_PERFORMANCE = [
  { region: 'पश्चिम महाराष्ट्र (Pune Div)', members: 42800, biz: 3120, b2bCr: 12.4, seva: 410, growth: '+22%' },
  { region: 'उत्तर महाराष्ट्र (Nashik Div)', members: 24500, biz: 1840, b2bCr: 6.8, seva: 280, growth: '+18%' },
  { region: 'मराठवाडा (Chhatrapati Sambhajinagar Div)', members: 28900, biz: 1650, b2bCr: 5.2, seva: 320, growth: '+16%' },
  { region: 'विदर्भ (Nagpur Div)', members: 16200, biz: 980, b2bCr: 4.1, seva: 140, growth: '+14%' },
  { region: 'कोकण व ठाणे (Thane/Konkan Div)', members: 13080, biz: 830, b2bCr: 4.0, seva: 98, growth: '+19%' }
];

export default function CEOPage() {
  const { user } = useAuth();

  // Navigation & UI States
  const [activeView, setActiveView] = useState('command_center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inlineNotice, setInlineNotice] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    state: 'महाराष्ट्र',
    division: 'All',
    district: 'All',
    city: 'All',
    fromDate: '2026-09-01',
    toDate: '2026-09-30'
  });
  const [globalSearch, setGlobalSearch] = useState('');

  // Datasets for CRUD operations across all modules
  const [kpiData, setKpiData] = useState(INITIAL_KPIS);
  const [goals, setGoals] = useState([
    { id: 1, title: 'राज्यभरात १५०,००० नोंदणीकृत सभासद', target: 150000, current: 125480, deadline: '2026-12-31', owner: 'आनंदराव देशमुख', progress: 83, status: 'On Track' },
    { id: 2, title: 'B2B बंद व्यवहार ₹ ५० कोटी टप्पा', target: 50, current: 18.4, deadline: '2026-12-31', owner: 'राजेंद्र मोहिते', progress: 37, status: 'At Risk' }
  ]);

  const [decisions, setDecisions] = useState([
    { id: 'DEC-101', title: 'ठाणे विभागात डिजिटल उद्योग संगम परिषद मंजुरी', date: '2026-09-28', owner: 'राजेश पाटील (CEO)', department: 'Business', status: 'Approved', deadline: '2026-10-15' },
    { id: 'DEC-102', title: 'नाशिक जिल्हा रुग्णालय मदत निधी ₹ १० लाख वाटप', date: '2026-09-25', owner: 'महेश शिंदे (Finance)', department: 'Seva', status: 'In Progress', deadline: '2026-10-05' }
  ]);

  const [b2bDeals, setB2bDeals] = useState([
    { id: 'B2B-901', title: 'पुणे एमआयडीसी सोलर प्रोजेक्ट सप्लाय', source: 'Member Referral', stage: 'Negotiation', valueCr: 4.5, probability: '85%', assignedTo: 'अमित कदम' },
    { id: 'B2B-902', title: 'नागपूर टेक्स्टाईल पार्क व्हेन्डर करार', source: 'Sangam Meet', stage: 'Opportunity', valueCr: 2.8, probability: '60%', assignedTo: 'संजय काळे' }
  ]);

  const [sevaCases, setSevaCases] = useState([
    { id: 'SEVA-441', beneficiary: 'गणेश तुकाराम शिंदे', category: 'Emergency Blood (A+ve)', priority: 'Emergency', status: 'Open', district: 'पुणे' },
    { id: 'SEVA-442', beneficiary: 'सुनीता बाळकृष्ण कदम', category: 'Hospital Bill Support', priority: 'High', status: 'Assigned', district: 'सोलापूर' }
  ]);

  const [businesses, setBusinesses] = useState([
    { id: 'BIZ-101', name: 'जाधव आयटी सोल्युशन्स प्रायव्हेट लिमिटेड', owner: 'अमोल जाधव', category: 'IT Services', district: 'पुणे', verified: true },
    { id: 'BIZ-102', name: 'शिर्के टेक्स्टाईल्स व गारमेंट्स', owner: 'सुरेश शिर्के', category: 'Textiles', district: 'सातारा', verified: true }
  ]);

  const [events, setEvents] = useState([
    { id: 'EV-101', title: 'जागतिक मराठी उद्योजक परिषद २०२६', date: '2026-10-15', venue: 'पुणे बालेवाडी', status: 'Upcoming' },
    { id: 'EV-102', title: 'महाराष्ट्रातील प्रमुख गडकोट संवर्धन मोहीम', date: '2026-10-28', venue: 'किल्ले रायगड', status: 'Upcoming' }
  ]);

  const [tickets, setTickets] = useState([
    { id: 'TCK-201', subject: 'व्यावसायिक श्रेणी अद्ययावत होत नाही', category: 'Technical', priority: 'High', status: 'Open' },
    { id: 'TCK-202', subject: 'KYC दस्तऐवज पडताळणी तक्रार', category: 'KYC', priority: 'Normal', status: 'In Progress' }
  ]);

  // Active Modals
  const [activeModal, setActiveModal] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});

  const triggerInlineNotice = (msg) => {
    setInlineNotice({ msg, time: new Date().toLocaleTimeString() });
  };

  /* ============================================================
     NAVIGATION STRUCTURE
     ============================================================ */
  const NAV_ITEMS = [
    {
      group: 'MAIN DASHBOARD',
      items: [
        { id: 'command_center', label: '🏠 CEO Command Center', icon: '🏠' },
        { id: 'mis', label: '📊 Executive MIS', icon: '📊' },
        { id: 'membership', label: '👥 Membership Growth', icon: '👥' },
        { id: 'business', label: '🏢 Business Network', icon: '🏢' },
        { id: 'b2b', label: '🤝 B2B CRM', icon: '🤝' },
        { id: 'seva', label: '🩸 Seva Performance', icon: '🩸' },
        { id: 'tickets', label: '🎫 Complaints & Escalations', icon: '🎫' },
        { id: 'events', label: '📅 Events & Programs', icon: '📅' }
      ]
    },
    {
      group: 'EXECUTION & STRATEGY',
      items: [
        { id: 'org_perf', label: '🏛️ Organization Performance', icon: '🏛️' },
        { id: 'leadership', label: '👑 Leadership Performance', icon: '👑' },
        { id: 'goals', label: '🎯 Goals & KPIs', icon: '🎯' },
        { id: 'decisions', label: '📝 Decisions Register', icon: '📝' },
        { id: 'reports', label: '📊 Executive Reports', icon: '📊' }
      ]
    }
  ];

  /* ============================================================
     CRUD ACTIONS
     ============================================================ */
  const handleSaveGeneric = (e) => {
    e.preventDefault();
    if (activeModal === 'goal') {
      if (editingRecord) {
        setGoals(goals.map(g => g.id === editingRecord.id ? { ...g, ...formData } : g));
      } else {
        setGoals([{ id: Date.now(), title: formData.title || 'नवीन ध्येय', target: Number(formData.target) || 100, current: 0, owner: user?.name || 'CEO', progress: 0, status: 'On Track' }, ...goals]);
      }
    } else if (activeModal === 'decision') {
      if (editingRecord) {
        setDecisions(decisions.map(d => d.id === editingRecord.id ? { ...d, ...formData } : d));
      } else {
        setDecisions([{ id: `DEC-${Math.floor(100 + Math.random() * 900)}`, title: formData.title || 'नवीन निर्णय', date: new Date().toISOString().split('T')[0], owner: 'CEO', department: formData.department || 'Executive', status: 'Approved' }, ...decisions]);
      }
    } else if (activeModal === 'b2b') {
      if (editingRecord) {
        setB2bDeals(b2bDeals.map(b => b.id === editingRecord.id ? { ...b, ...formData } : b));
      } else {
        setB2bDeals([{ id: `B2B-${Math.floor(100 + Math.random() * 900)}`, title: formData.title || 'नवीन B2B संधी', source: 'CEO Direct', stage: 'Opportunity', valueCr: Number(formData.valueCr) || 1.0, probability: '70%', assignedTo: 'B2B Cell' }, ...b2bDeals]);
      }
    } else if (activeModal === 'business') {
      if (editingRecord) {
        setBusinesses(businesses.map(b => b.id === editingRecord.id ? { ...b, ...formData } : b));
      } else {
        setBusinesses([{ id: `BIZ-${Math.floor(100 + Math.random() * 900)}`, name: formData.name || 'नवीन व्यवसाय', owner: formData.owner || 'संस्थापक', category: formData.category || 'General', district: 'पुणे', verified: true }, ...businesses]);
      }
    } else if (activeModal === 'event') {
      if (editingRecord) {
        setEvents(events.map(ev => ev.id === editingRecord.id ? { ...ev, ...formData } : ev));
      } else {
        setEvents([{ id: `EV-${Math.floor(100 + Math.random() * 900)}`, title: formData.title || 'नवीन कार्यक्रम', date: formData.date || '2026-10-30', venue: formData.venue || 'पुणे', status: 'Upcoming' }, ...events]);
      }
    } else if (activeModal === 'ticket') {
      if (editingRecord) {
        setTickets(tickets.map(t => t.id === editingRecord.id ? { ...t, ...formData } : t));
      } else {
        setTickets([{ id: `TCK-${Math.floor(100 + Math.random() * 900)}`, subject: formData.subject || 'नवीन तक्रार', category: 'General', priority: 'High', status: 'Open' }, ...tickets]);
      }
    }

    setActiveModal(null);
    setEditingRecord(null);
    setFormData({});
    triggerInlineNotice('माहिती यशस्विरीत्या अपडेट केली गेली.');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#FFFDF9',
      color: '#1E293B',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* HEADER WITH FULL FROM-TO DATE FILTERS */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1.5px solid #FED7AA',
        padding: '10px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', cursor: 'pointer' }}
            >
              ☰
            </button>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#431407' }}>
                👑 CONNECT MARATHA <span style={{ fontSize: '0.75rem', background: '#EA580C', color: '#FFF', padding: '2px 8px', borderRadius: '999px' }}>CEO COMMAND CENTER</span>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 240px', maxWidth: '360px' }}>
            <input
              type="text"
              placeholder="🔍 शोधा..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 14px', borderRadius: '10px', border: '1px solid #FED7AA', background: '#FFF7ED', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('goal'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
              + Add Goal
            </button>
            <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('b2b'); }} style={{ background: '#FFF7ED', color: '#EA580C', border: '1.5px solid #FED7AA', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
              + Add B2B Deal
            </button>
          </div>
        </div>

        {/* FROM DATE TO DATE FILTER BAR */}
        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #FFF7ED', display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EA580C', whiteSpace: 'nowrap' }}>📍 Date & Geo Filter:</span>
          
          <select value={filters.division} onChange={(e) => setFilters({ ...filters, division: e.target.value })} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #FED7AA', background: '#FFF7ED', fontSize: '0.8rem' }}>
            <option value="All">सर्व विभाग (All Divisions)</option>
            <option value="पुणे">पुणे विभाग</option>
            <option value="नाशिक">नाशिक विभाग</option>
          </select>

          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C' }}>From:</span>
          <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #FED7AA', fontSize: '0.78rem' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C' }}>To:</span>
          <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #FED7AA', fontSize: '0.78rem' }} />
        </div>
      </header>

      {/* NOTICE BANNER */}
      {inlineNotice && (
        <div style={{ background: '#FFF7ED', borderBottom: '2px solid #EA580C', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', color: '#431407', fontWeight: 700, fontSize: '0.88rem' }}>
          <div><span>⚡ EXECUTIVE NOTICE ({inlineNotice.time}):</span> {inlineNotice.msg}</div>
          <button onClick={() => setInlineNotice(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900, color: '#EA580C' }}>✕</button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: sidebarCollapsed ? '72px' : '260px', transition: 'width 0.2s ease', background: '#FFFFFF', borderRight: '1.5px solid #FED7AA', padding: '8px' }}>
          {NAV_ITEMS.map((grp, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '16px' }}>
              {!sidebarCollapsed && <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#94A3B8', padding: '4px 8px' }}>{grp.group}</div>}
              {grp.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '4px', cursor: 'pointer',
                    background: activeView === item.id ? '#FFF7ED' : 'transparent',
                    border: activeView === item.id ? '1.5px solid #FED7AA' : '1px solid transparent',
                    color: activeView === item.id ? '#EA580C' : '#475569', fontWeight: 800, fontSize: '0.88rem'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label.replace(/^[^\s]+\s/, '')}</span>}
                </div>
              ))}
            </div>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '20px', background: '#FFFDF9' }}>
          
          {/* VIEW: COMMAND CENTER */}
          {activeView === 'command_center' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#431407', marginBottom: '16px' }}>CONNECT MARATHA — CEO COMMAND CENTER</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B' }}>👥 एकूण सदस्य</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', margin: '6px 0' }}>{kpiData.members.toLocaleString()}</div>
                </div>
                <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B' }}>🤝 B2B संधी</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', margin: '6px 0' }}>₹ {kpiData.pipelineValueCr} Cr</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BUSINESS NETWORK CRUD */}
          {activeView === 'business' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>🏢 Business Network CRUD</h3>
                <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('business'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>+ Add Business</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#EA580C' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>व्यवसाय नाव</th><th style={{ padding: '10px' }}>संस्थापक</th><th style={{ padding: '10px' }}>श्रेणी</th><th style={{ padding: '10px' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {businesses.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #FFF7ED' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{b.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#431407' }}>{b.name}</td>
                      <td style={{ padding: '10px' }}>{b.owner}</td>
                      <td style={{ padding: '10px', color: '#EA580C', fontWeight: 700 }}>{b.category}</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingRecord(b); setFormData(b); setActiveModal('business'); }} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => setBusinesses(businesses.filter(x => x.id !== b.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: B2B CRM CRUD */}
          {activeView === 'b2b' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>🤝 B2B Opportunities CRUD</h3>
                <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('b2b'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>+ Add B2B Deal</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#EA580C' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>करार शीर्षक</th><th style={{ padding: '10px' }}>मूल्य (₹ Cr)</th><th style={{ padding: '10px' }}>टप्पा</th><th style={{ padding: '10px' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {b2bDeals.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #FFF7ED' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{d.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#431407' }}>{d.title}</td>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#16A34A' }}>₹ {d.valueCr} Cr</td>
                      <td style={{ padding: '10px' }}>{d.stage}</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingRecord(d); setFormData(d); setActiveModal('b2b'); }} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => setB2bDeals(b2bDeals.filter(x => x.id !== d.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: SEVA PERFORMANCE CRUD */}
          {activeView === 'seva' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>🩸 Seva Performance Desk CRUD</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#EA580C' }}><th style={{ padding: '10px' }}>Case ID</th><th style={{ padding: '10px' }}>लाभार्थी</th><th style={{ padding: '10px' }}>प्रकार</th><th style={{ padding: '10px' }}>स्थिती</th><th style={{ padding: '10px' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {sevaCases.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #FFF7ED' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{s.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#431407' }}>{s.beneficiary}</td>
                      <td style={{ padding: '10px' }}>{s.category}</td>
                      <td style={{ padding: '10px' }}>{s.status}</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => setSevaCases(sevaCases.filter(x => x.id !== s.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: EVENTS & PROGRAMS CRUD */}
          {activeView === 'events' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>📅 Events & Programs CRUD</h3>
                <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('event'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>+ Add Event</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#EA580C' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>कार्यक्रम</th><th style={{ padding: '10px' }}>तारीख</th><th style={{ padding: '10px' }}>स्थान</th><th style={{ padding: '10px' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid #FFF7ED' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{ev.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#431407' }}>{ev.title}</td>
                      <td style={{ padding: '10px' }}>{ev.date}</td>
                      <td style={{ padding: '10px' }}>{ev.venue}</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingRecord(ev); setFormData(ev); setActiveModal('event'); }} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => setEvents(events.filter(x => x.id !== ev.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: COMPLAINTS & TICKETS CRUD */}
          {activeView === 'tickets' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>🎫 Complaints & Tickets CRUD</h3>
                <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('ticket'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>+ Add Ticket</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#EA580C' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>विषय</th><th style={{ padding: '10px' }}>श्रेणी</th><th style={{ padding: '10px' }}>स्थिती</th><th style={{ padding: '10px' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #FFF7ED' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{t.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#431407' }}>{t.subject}</td>
                      <td style={{ padding: '10px' }}>{t.category}</td>
                      <td style={{ padding: '10px' }}>{t.status}</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingRecord(t); setFormData(t); setActiveModal('ticket'); }} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => setTickets(tickets.filter(x => x.id !== t.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: GOALS & KPIS */}
          {activeView === 'goals' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>🎯 Strategic Goals & KPIs CRUD</h3>
                <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('goal'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>+ Create Goal</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {goals.map(g => (
                  <div key={g.id} style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#431407' }}>{g.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', margin: '6px 0' }}>लक्ष्य: {g.target} • प्रमुख: {g.owner}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button onClick={() => { setEditingRecord(g); setFormData(g); setActiveModal('goal'); }} style={{ background: '#FFFFFF', border: '1px solid #FED7AA', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>✏️ Edit</button>
                      <button onClick={() => setGoals(goals.filter(x => x.id !== g.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: DECISIONS REGISTER */}
          {activeView === 'decisions' && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>📝 Decisions Register CRUD</h3>
                <button onClick={() => { setEditingRecord(null); setFormData({}); setActiveModal('decision'); }} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>+ Add Decision</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#EA580C' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>निर्णय शीर्षक</th><th style={{ padding: '10px' }}>विभाग</th><th style={{ padding: '10px' }}>तारीख</th><th style={{ padding: '10px' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {decisions.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #FFF7ED' }}>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{d.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#431407' }}>{d.title}</td>
                      <td style={{ padding: '10px' }}>{d.department}</td>
                      <td style={{ padding: '10px' }}>{d.date}</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingRecord(d); setFormData(d); setActiveModal('decision'); }} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => setDecisions(decisions.filter(x => x.id !== d.id))} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>

      {/* DYNAMIC EDIT / CREATE MODAL */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(67, 20, 7, 0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '20px', padding: '24px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 900, color: '#431407' }}>
              {editingRecord ? `✏️ Edit ${activeModal.toUpperCase()}` : `➕ Add ${activeModal.toUpperCase()}`}
            </h3>
            <form onSubmit={handleSaveGeneric}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>शीर्षक / नाव</label>
                <input
                  type="text"
                  required
                  defaultValue={editingRecord?.name || editingRecord?.title || editingRecord?.subject || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value, subject: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontWeight: 700, cursor: 'pointer' }}>रद्द करा</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#EA580C', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}>जतन करा</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
