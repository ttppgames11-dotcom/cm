import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';

/* ============================================================
   🚩 CONNECT MARATHA — UNIFIED CRM OPERATIONS DASHBOARD
   One Master Data → Multiple Views Architecture (12 Golden Rules)
   ============================================================ */

export default function UnifiedOperationsDashboard() {
  const { user } = useAuth();

  // Scope selection: 'pradesh' | 'division' | 'district' | 'taluka' | 'branch' | 'center'
  const [selectedScope, setSelectedScope] = useState('pradesh');
  const [selectedDivision, setSelectedDivision] = useState('पुणे विभाग');
  const [selectedDistrict, setSelectedDistrict] = useState('पुणे');
  const [selectedTaluka, setSelectedTaluka] = useState('हवेली');

  // Active view tab inside dashboard
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'work_queue' | 'tickets' | 'subordinate' | 'exceptions'

  // Live Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // New Ticket Form State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium',
    requesterName: '',
    requesterPhone: ''
  });

  // Selected Ticket for Audit & Action Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [resolveNote, setResolveNote] = useState('');

  // Fetch Dashboard Data whenever scope or filters change
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getUnifiedCRMDashboard({
        scope: selectedScope,
        division: selectedScope !== 'pradesh' ? selectedDivision : '',
        district: ['district', 'taluka', 'branch'].includes(selectedScope) ? selectedDistrict : '',
        taluka: ['taluka', 'branch'].includes(selectedScope) ? selectedTaluka : ''
      });
      setDashboardData(res);
      setTicketsList(res?.recentTickets || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setNotice({ type: 'error', text: 'डॅशबोर्ड डेटा लोड करताना अडचण आली.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedScope, selectedDivision, selectedDistrict, selectedTaluka]);

  // Handle Ticket Escalation
  const handleEscalate = async (ticketId) => {
    if (!escalateReason.trim()) {
      alert('कृपया वरिष्ठ स्तरावर वर्ग करण्याचे कारण नमूद करा.');
      return;
    }
    try {
      const res = await apiClient.escalateUnifiedTicket(ticketId, escalateReason);
      if (res.success) {
        setNotice({ type: 'success', text: `तिकीट यशस्वीरित्या वर्ग केले! (${res.data?.currentOwnerLevel?.toUpperCase()})` });
        setSelectedTicket(null);
        setEscalateReason('');
        fetchDashboard();
      }
    } catch (err) {
      alert('एस्केलेशन अयशस्वी: ' + err.message);
    }
  };

  // Handle Ticket Status Update (Resolve/Close)
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await apiClient.updateUnifiedTicketStatus(ticketId, newStatus, resolveNote);
      if (res.success) {
        setNotice({ type: 'success', text: `स्थिती अपडेट झाली: ${newStatus}` });
        setSelectedTicket(null);
        setResolveNote('');
        fetchDashboard();
      }
    } catch (err) {
      alert('स्थिती अपडेट अयशस्वी: ' + err.message);
    }
  };

  // Handle Create New Unified Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketData.title || !newTicketData.description) {
      alert('कृपया शीर्षक व तपशील भरा.');
      return;
    }
    try {
      const payload = {
        ...newTicketData,
        division: selectedDivision,
        district: selectedDistrict,
        taluka: selectedTaluka
      };
      const res = await apiClient.createUnifiedTicket(payload);
      if (res.success) {
        setNotice({ type: 'success', text: `नवीन तिकीट नोंदवले गेले: ${res.data?.ticketNumber}` });
        setShowNewTicketModal(false);
        setNewTicketData({
          title: '',
          description: '',
          category: 'General',
          priority: 'Medium',
          requesterName: '',
          requesterPhone: ''
        });
        fetchDashboard();
      }
    } catch (err) {
      alert('तिकीट नोंदवताना त्रुटी: ' + err.message);
    }
  };

  const kpis = dashboardData?.kpis || {};
  const workQueue = dashboardData?.workQueue || {};
  const exceptions = dashboardData?.exceptions || [];
  const subordinateUnits = dashboardData?.subordinateUnits || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', paddingBottom: '60px' }}>
      <CRMScopeSwitcher currentScope="operations" />
      
      {/* Top Banner & Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '24px 32px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '26px' }}>🚩</span>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CONNECT मराठा — युनिफाइड ऑपरेशन्स व गर्व्हनन्स CRM
              </h1>
              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 700 }}>
                १२ सुवर्ण नियम प्रणाली (12 Golden Rules)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              One Master Data → One Owner → One Form → Multiple Views • {user?.name || 'अधिकारी'} ({user?.role || 'Admin'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowNewTicketModal(true)}
              style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}
            >
              <span>➕</span> नवीन तिकीट / मागणी नोंदवा
            </button>
            <Link
              to="/crm/center"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🏢</span> कम्युनिटी सेंटर
            </Link>
            <Link
              to="/ceo"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🦅</span> CEO मॅक्रो
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 32px' }}>
        
        {/* Notice alert */}
        {notice && (
          <div style={{ background: notice.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${notice.type === 'error' ? '#ef4444' : '#10b989'}`, borderRadius: '8px', padding: '12px 18px', marginBottom: '20px', color: notice.type === 'error' ? '#fca5a5' : '#6ee7b7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
        )}

        {/* 1. Scope Selector Bar (वरिष्ठ ते तळागाळ निवडक) */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
              🎯 अधिकार व भौगोलिक स्कोप निवडा (Scope Selector):
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'pradesh', label: '🟠 प्रदेशाध्यक्ष (State Strategic)', icon: '🦅' },
                { id: 'division', label: '🟣 विभागीय अध्यक्ष (Division)', icon: '🏛️' },
                { id: 'district', label: '🔵 जिल्हाध्यक्ष (District)', icon: '🏢' },
                { id: 'taluka', label: '🟢 तालुकाध्यक्ष (Taluka)', icon: '📍' },
                { id: 'branch', label: '🔴 शाखाध्यक्ष (Branch)', icon: '🚩' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScope(s.id)}
                  style={{
                    background: selectedScope === s.id ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: selectedScope === s.id ? '#0f172a' : '#cbd5e1',
                    border: '1px solid ' + (selectedScope === s.id ? '#f59e0b' : 'rgba(255,255,255,0.1)'),
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drill-down Geographical Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {selectedScope !== 'pradesh' && (
              <select
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value)}
                style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '7px 12px', fontSize: '12px' }}
              >
                <option value="पुणे विभाग">पुणे विभाग</option>
                <option value="कोकण विभाग">कोकण विभाग</option>
                <option value="नाशिक विभाग">नाशिक विभाग</option>
                <option value="छत्रपती संभाजीनगर विभाग">छ. संभाजीनगर विभाग</option>
                <option value="अमरावती विभाग">अमरावती विभाग</option>
                <option value="नागपूर विभाग">नागपूर विभाग</option>
              </select>
            )}

            {['district', 'taluka', 'branch'].includes(selectedScope) && (
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '7px 12px', fontSize: '12px' }}
              >
                <option value="पुणे">पुणे जिल्हा</option>
                <option value="सातारा">सातारा जिल्हा</option>
                <option value="सांगली">सांगली जिल्हा</option>
                <option value="कोल्हापूर">कोल्हापूर जिल्हा</option>
                <option value="सोलापूर">सोलापूर जिल्हा</option>
              </select>
            )}

            {['taluka', 'branch'].includes(selectedScope) && (
              <select
                value={selectedTaluka}
                onChange={e => setSelectedTaluka(e.target.value)}
                style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '7px 12px', fontSize: '12px' }}
              >
                <option value="हवेली">हवेली तालुका</option>
                <option value="मुळशी">मुळशी तालुका</option>
                <option value="मावळ">मावळ तालुका</option>
                <option value="बारामती">बारामती तालुका</option>
              </select>
            )}
          </div>
        </div>

        {/* 2. Top Tier Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '24px' }}>
          {[
            { id: 'overview', label: '📊 विहंगावलोकन (Overview KPIs)', icon: '📈' },
            { id: 'work_queue', label: `📋 आजची कार्यसूची (Work Queue - ${workQueue?.urgentTicketsList?.length || 0})`, icon: '⚡' },
            { id: 'tickets', label: `🎫 युनिफाइड तिकिटे (${ticketsList.length})`, icon: '🎫' },
            { id: 'subordinate', label: '🏛️ कनिष्ठ घटक कामगिरी (Hierarchy Performance)', icon: '🏢' },
            { id: 'exceptions', label: `⚠️ अपवाद व SLA सूचना (${exceptions.length})`, icon: '⚠️' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: activeTab === t.id ? '#fbbf24' : '#94a3b8',
                border: activeTab === t.id ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '16px' }}>
            डॅशबोर्ड माहिती संकलित होत आहे... कृपया प्रतीक्षा करा.
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW KPIS */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  
                  <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>एकूण सदस्य</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                      {kpis.totalMembers || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                      सक्रिय: {kpis.activeMembers || 0} सभासद
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>प्रलंबित KYC</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                      {kpis.pendingKyc || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      पडताळणी अनुशेष
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>नोंदणीकृत उद्योग / फर्म्स</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                      {kpis.totalBusinesses || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                      प्रमाणित भागीदार: {kpis.verifiedPartners || 0}
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>उघडी तिकिटे / मागण्या</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                      {kpis.openTickets || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>
                      तातडीची: {kpis.criticalTickets || 0} • वर्ग केलेली: {kpis.escalatedTickets || 0}
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>केंद्रातील आजचे अभ्यागत</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                      {kpis.todayVisitors || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      एकूण सक्रिय केंद्रे: {kpis.centersCount || 0}
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>दैनिक वर्गणी लेजर</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                      ₹{(kpis.dailyCollection || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                      थेट पावती संकलन
                    </div>
                  </div>
                </div>

                {/* Split Overview Row: Left Recent Tickets, Right Fast Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                  
                  {/* Left: Latest Tickets in Scope */}
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🎫</span> अलीकडील तिकिटे व तक्रार प्रवाह
                      </h3>
                      <button onClick={() => setActiveTab('tickets')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                        सर्व पहा →
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {ticketsList.length === 0 ? (
                        <div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center', fontSize: '13px' }}>
                          या स्कोपमध्ये कोणतीही प्रलंबित तिकिटे नाहीत.
                        </div>
                      ) : (
                        ticketsList.slice(0, 5).map(t => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>{t.ticketNumber}</span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, background: t.priority === 'Critical' ? '#7f1d1d' : t.priority === 'High' ? '#7c2d12' : '#1e3a8a', color: '#fff' }}>
                                  {t.priority}
                                </span>
                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, background: t.status === 'Escalated' ? '#831843' : t.status === 'Resolved' ? '#064e3b' : '#374151', color: '#fff' }}>
                                  {t.status}
                                </span>
                              </div>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>अर्जदार: {t.requesterName}</span>
                              <span>वर्तमान स्तर: <strong>{t.currentOwnerLevel?.toUpperCase()}</strong></span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right: Work Queue Sneak Peek & Quick Tools */}
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⚡</span> त्वरित कार्यप्रवाह (Quick Actions)
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#f59e0b', marginBottom: '4px' }}>
                          🏢 कम्युनिटी सेंटर ऑपरेशन्स
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                          १२ सेवा कक्ष, अभ्यागत नोंदणी व थेट हिशोब लेजर चालवण्यासाठी कम्युनिटी सेंटर CRM उघडा.
                        </div>
                        <Link to="/crm/center" style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                          कम्युनिटी सेंटर CRM उघडा →
                        </Link>
                      </div>

                      <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#38bdf8', marginBottom: '4px' }}>
                          👥 सदस्यत्व व KYC पडताळणी
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                          स्थानिक पातळीवर प्रलंबित ओळखपत्रांची पडताळणी करून डिजिटल कार्ड जारी करा.
                        </div>
                        <button onClick={() => setActiveTab('work_queue')} style={{ background: 'none', border: 'none', padding: 0, color: '#38bdf8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          पडताळणी कतार पहा ({workQueue.pendingKycList?.length || 0}) →
                        </button>
                      </div>

                      <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#c084fc', marginBottom: '4px' }}>
                          🤝 B2B लीड्स व उद्योग भागीदारी
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                          स्थानिक उत्पादक आणि खरेदीदार यांना जोडण्यासाठी B2B डेस्कचा वापर करा.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: WORK QUEUE */}
            {activeTab === 'work_queue' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Urgent Tickets */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚨</span> तातडीची कार्यसूची (Urgent Tickets Queue)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {workQueue.urgentTicketsList?.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>
                        सर्व तातडीची कामे पूर्ण झाली आहेत!
                      </div>
                    ) : (
                      workQueue.urgentTicketsList?.map(t => (
                        <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>{t.ticketNumber}</span>
                            <span style={{ fontSize: '10px', background: '#7f1d1d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{t.priority}</span>
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{t.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>फोन: {t.requesterPhone}</span>
                            <button
                              onClick={() => setSelectedTicket(t)}
                              style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              कृती करा / वर्ग करा
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pending KYC Backlog */}
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👥</span> प्रलंबित KYC पडताळणी कतार
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {workQueue.pendingKycList?.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>
                        कोणताही KYC अनुशेष शिल्लक नाही. सर्व सदस्य प्रमाणित आहेत.
                      </div>
                    ) : (
                      workQueue.pendingKycList?.map(m => (
                        <div key={m.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{m.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.id} • {m.phone} • {m.district}</div>
                          </div>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 700 }}>
                            पडताळणी प्रलंबित
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TICKETS FULL MASTER */}
            {activeTab === 'tickets' && (
              <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                    🎫 युनिफाइड तिकीट प्रणाली (Unified Ticket Master)
                  </h3>
                  <button
                    onClick={() => setShowNewTicketModal(true)}
                    style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    ➕ नवीन तिकीट
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '12px' }}>
                        <th style={{ padding: '10px' }}>तिकीट क्र.</th>
                        <th style={{ padding: '10px' }}>विषय व मागणी</th>
                        <th style={{ padding: '10px' }}>वर्गवारी</th>
                        <th style={{ padding: '10px' }}>प्राधान्य</th>
                        <th style={{ padding: '10px' }}>वर्तमान स्तर</th>
                        <th style={{ padding: '10px' }}>स्थिती</th>
                        <th style={{ padding: '10px' }}>कृती</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketsList.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 10px', color: '#38bdf8', fontWeight: 700 }}>{t.ticketNumber}</td>
                          <td style={{ padding: '12px 10px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>{t.title}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.requesterName} ({t.requesterPhone})</div>
                          </td>
                          <td style={{ padding: '12px 10px' }}>{t.category}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: t.priority === 'Critical' ? '#7f1d1d' : t.priority === 'High' ? '#7c2d12' : '#1e3a8a', color: '#fff' }}>
                              {t.priority}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', fontWeight: 700, color: '#fbbf24' }}>
                            {t.currentOwnerLevel?.toUpperCase()}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: t.status === 'Escalated' ? '#831843' : t.status === 'Resolved' ? '#064e3b' : '#374151', color: '#fff' }}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <button
                              onClick={() => setSelectedTicket(t)}
                              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              तपशील व ऑडिट
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: SUBORDINATE UNITS */}
            {activeTab === 'subordinate' && (
              <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
                  🏛️ कनिष्ठ भौगोलिक घटक कामगिरी (Subordinate Units Comparison)
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
                  सध्याच्या स्कोपनुसार खालील घटकांची लाइव्ह तुलना व कामगिरी:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {subordinateUnits.map(unit => (
                    <div key={unit.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#f59e0b' }}>{unit.name}</span>
                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {unit.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
                        एकूण नोंदणीकृत सदस्य: <strong>{unit.membersCount || 0}</strong>
                      </div>
                      {unit.centersCount !== undefined && (
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
                          सक्रिय कम्युनिटी सेंटर्स: <strong>{unit.centersCount}</strong>
                        </div>
                      )}
                      {unit.dailyCollection !== undefined && (
                        <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>
                          दैनिक संकलन: ₹{(unit.dailyCollection || 0).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: EXCEPTIONS */}
            {activeTab === 'exceptions' && (
              <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
                  ⚠️ अपवाद व SLA सूचना (System Exceptions & Alerts)
                </h3>
                {exceptions.length === 0 ? (
                  <div style={{ padding: '20px', color: '#10b981', fontWeight: 600 }}>
                    कोणतेही गंभीर धोके किंवा SLA उल्लंघन आढळले नाही. सर्व सुरळीत आहे!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {exceptions.map(exc => (
                      <div key={exc.id} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#fca5a5', fontSize: '14px' }}>{exc.title}</span>
                          <span style={{ fontSize: '11px', background: '#7f1d1d', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            संख्या: {exc.count}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>{exc.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: CREATE NEW TICKET */}
      {showNewTicketModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>➕ नवीन तिकीट / मागणी नोंदवा</h3>
              <button onClick={() => setShowNewTicketModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>विषय / शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. शैक्षणिक मदत, B2B करार, KYC दुरुस्ती"
                  value={newTicketData.title}
                  onChange={e => setNewTicketData({ ...newTicketData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>वर्गवारी</label>
                  <select
                    value={newTicketData.category}
                    onChange={e => setNewTicketData({ ...newTicketData, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="General">सामान्य (General)</option>
                    <option value="KYC">सदस्यत्व व KYC</option>
                    <option value="B2B">व्यापार व B2B</option>
                    <option value="Jobs">रोजगार व नोकरी</option>
                    <option value="Seva">सेवा व आरोग्य</option>
                    <option value="Legal">कायदेशीर सल्ला</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>प्राधान्य</label>
                  <select
                    value={newTicketData.priority}
                    onChange={e => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="Low">कमी (Low)</option>
                    <option value="Medium">मध्यम (Medium)</option>
                    <option value="High">उच्च (High)</option>
                    <option value="Critical">तातडीचे (Critical)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>सविस्तर तपशील *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="तक्रारीचे किंवा मागणीचे संपूर्ण स्पष्टीकरण..."
                  value={newTicketData.description}
                  onChange={e => setNewTicketData({ ...newTicketData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>अर्जदाराचे नाव</label>
                  <input
                    type="text"
                    placeholder="नाव"
                    value={newTicketData.requesterName}
                    onChange={e => setNewTicketData({ ...newTicketData, requesterName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>मोबाईल नंबर</label>
                  <input
                    type="text"
                    placeholder="९८२२..."
                    value={newTicketData.requesterPhone}
                    onChange={e => setNewTicketData({ ...newTicketData, requesterPhone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNewTicketModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  रद्द करा
                </button>
                <button type="submit" style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '9px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                  नोंदणी करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TICKET DETAILS & ESCALATION / AUDIT TRAIL */}
      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>{selectedTicket.ticketNumber}</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '17px', fontWeight: 800 }}>{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 8px 0', color: '#cbd5e1' }}>{selectedTicket.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <span>अर्जदार: <strong style={{ color: '#fff' }}>{selectedTicket.requesterName}</strong></span>
                <span>फोन: <strong style={{ color: '#fff' }}>{selectedTicket.requesterPhone}</strong></span>
                <span>वर्तमान स्तर: <strong style={{ color: '#fbbf24' }}>{selectedTicket.currentOwnerLevel?.toUpperCase()}</strong></span>
                <span>स्थिती: <strong style={{ color: '#38bdf8' }}>{selectedTicket.status}</strong></span>
              </div>
            </div>

            {/* Audit Trail Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📜</span> ऑडिट ट्रेल व इतिहास (Audit Trail Log)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTicket.auditTrail?.map((entry, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #f59e0b', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10px' }}>
                      <span>{entry.action} by <strong>{entry.by}</strong> ({entry.role})</span>
                      <span>{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                    {entry.reason && <div style={{ color: '#fca5a5', marginTop: '4px' }}>कारण: {entry.reason}</div>}
                    {entry.note && <div style={{ color: '#cbd5e1', marginTop: '4px' }}>{entry.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Escalate or Resolve */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700 }}>⚡ त्वरित कृती:</h4>
              
              {/* Escalate block */}
              {selectedTicket.currentOwnerLevel !== 'state' && selectedTicket.status !== 'Resolved' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <label style={{ fontSize: '11px', color: '#fca5a5', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    वरिष्ठ स्तरावर वर्ग करण्याचे कारण (Escalate to Next Tier):
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="उदा. अधिकाराबाहेर किंवा धोरणात्मक विषय..."
                      value={escalateReason}
                      onChange={e => setEscalateReason(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                    <button
                      onClick={() => handleEscalate(selectedTicket.id)}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      वर वर्ग करा 🔺
                    </button>
                  </div>
                </div>
              )}

              {/* Status Update Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {selectedTicket.status !== 'In_Progress' && selectedTicket.status !== 'Resolved' && (
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'In_Progress')}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    प्रक्रियेत घ्या (In Progress)
                  </button>
                )}
                {selectedTicket.status !== 'Resolved' && (
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'Resolved')}
                    style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    निवारण झाले (Mark Resolved) ✅
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  बंद करा
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
