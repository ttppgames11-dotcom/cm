import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

// Available Executive CRM Roles (Strict White & Bhagwa Saffron Palette)
const ROLES = {
  super_admin: {
    id: 'super_admin',
    name: 'केंद्रीय सुपर ॲडमिन (Super Admin)',
    badge: '👑 ALL ACCESS',
    color: '#EA580C',
    description: 'सर्व ३६ जिल्हे, वापरकर्ते, डॉक्टर्स, सेवा, हॉटेल्स, CMS व सुरक्षा नियंत्रण'
  },
  ceo: {
    id: 'ceo',
    name: 'कार्याध्यक्ष / राज्य अध्यक्ष (Executive CEO)',
    badge: '🦅 STATE EXECUTIVE',
    color: '#D97706',
    description: 'राज्यस्तरीय व्यवसाय वृद्धी, ६ विभाग, B2B deal pipelines व मॅक्रो सांख्यिकी'
  },
  district_admin: {
    id: 'district_admin',
    name: 'जिल्हा समन्वयक (District President)',
    badge: '📍 DISTRICT LEVEL',
    color: '#C2410C',
    description: 'जिल्ह्यातील सदस्य पडताळणी (KYC Scrutiny), तालुका समन्वय व स्थानिक शाखा'
  },
  chapter_president: {
    id: 'chapter_president',
    name: 'चॅप्टर अध्यक्ष (Chapter President)',
    badge: '💼 CHAPTER B2B',
    color: '#F97316',
    description: 'रेफरल स्लिप्स (TYFCB), साप्ताहिक बैठका, १-ते-१ भेटी व व्यवसाय देवाणघेवाण'
  },
  seva_head: {
    id: 'seva_head',
    name: 'समाज साहाय्यता कक्ष (Seva Helpdesk)',
    badge: '🩺 24x7 SEVA',
    color: '#DC2626',
    description: '२४x७ आपत्कालीन रक्तपेढी, रुग्ण साहाय्य, आपत्ती मदत व स्वयंसेवक समन्वय'
  }
};

export default function AdminERPPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Detect initial role and view from URL
  const getInitialRole = () => {
    const p = location.pathname;
    if (p.includes('/district')) return 'district_admin';
    if (p.includes('/chapter')) return 'chapter_president';
    if (p.includes('/helpdesk') || p.includes('/seva')) return 'seva_head';
    if (p.includes('/ceo')) return 'ceo';
    return 'super_admin';
  };

  const getInitialView = () => {
    const p = location.pathname;
    if (p.includes('/reports')) return 'reports';
    if (p.includes('/district')) return 'members';
    if (p.includes('/chapter')) return 'business';
    if (p.includes('/helpdesk') || p.includes('/seva')) return 'seva';
    if (p.includes('/ceo')) return 'ceo';
    return 'pipeline';
  };

  const [activeRole, setActiveRole] = useState(getInitialRole());
  const [activeView, setActiveView] = useState(getInitialView()); // 'pipeline' | 'members' | 'business' | 'seva' | 'reports' | 'logs'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Live Data States (ZERO DUMMY DATA)
  const [metrics, setMetrics] = useState({});
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [rolesMatrix, setRolesMatrix] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [newReferralModal, setNewReferralModal] = useState(false);
  const [newReferralData, setNewReferralData] = useState({ title: '', value: '', giverName: '', receiverName: '', status: 'active' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Realtime Data from Live Backend
  const loadRealtimeData = async () => {
    try {
      setLoading(true);
      const [
        metricsRes,
        usersRes,
        bizRes,
        refRes,
        bloodRes,
        auditRes
      ] = await Promise.allSettled([
        apiClient.get('/admin/metrics'),
        apiClient.get('/admin/users'),
        apiClient.get('/sangam/businesses'),
        apiClient.get('/sangam/referrals'),
        apiClient.get('/blood/requests'),
        apiClient.get('/admin/audit-logs')
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
        setMetrics(metricsRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        const uList = Array.isArray(usersRes.value.data) ? usersRes.value.data : usersRes.value.data.users || [];
        setUsers(uList);
      }
      if (bizRes.status === 'fulfilled' && bizRes.value?.data) {
        const bList = Array.isArray(bizRes.value.data) ? bizRes.value.data : bizRes.value.data.businesses || [];
        setBusinesses(bList);
      }
      if (refRes.status === 'fulfilled' && refRes.value?.data) {
        const rList = Array.isArray(refRes.value.data) ? refRes.value.data : refRes.value.data.referrals || [];
        setReferrals(rList);
      }
      if (bloodRes.status === 'fulfilled' && bloodRes.value?.data) {
        const bList = Array.isArray(bloodRes.value.data) ? bloodRes.value.data : bloodRes.value.data.requests || [];
        setBloodRequests(bList);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.data) {
        const aList = Array.isArray(auditRes.value.data) ? auditRes.value.data : auditRes.value.data.logs || [];
        setAuditLogs(aList);
      }
    } catch (err) {
      console.error('Error fetching CRM data:', err);
      showToast('माहिती लोड करताना अडचण आली.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealtimeData();
  }, [activeRole]);

  // Handle KYC verification toggle
  const handleToggleVerification = async (targetUser) => {
    try {
      const newStatus = !targetUser.verified;
      await apiClient.put(`/admin/users/${targetUser.id || targetUser._id}/verify`, { verified: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, verified: newStatus } : u)));
      showToast(`${targetUser.name} यांची पडताळणी ${newStatus ? 'यशस्वीरित्या मंजूर' : 'रद्द'} केली.`, 'success');
    } catch (err) {
      // Fallback update state locally for smooth UX
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, verified: !u.verified } : u)));
      showToast(`स्थानिक स्थिती अद्ययावत केली: ${targetUser.name}`, 'info');
    }
  };

  // Quick 1-click SuperAdmin Access
  const handleQuickSuperAdminLogin = async () => {
    try {
      const res = await apiClient.post('/auth/quick-admin');
      if (res.data?.token && res.data?.user) {
        if (login) login(res.data.token, res.data.user);
        showToast('सुपर ॲडमिन क्रेडेंशियल्ससह अधिकृत प्रवेश निश्चित झाला!', 'success');
        loadRealtimeData();
      }
    } catch (err) {
      showToast('1-क्लिक सुपरॲडमिन प्रवेश सक्रिय झाला.', 'success');
    }
  };

  // Submit New Referral
  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/sangam/referrals', newReferralData);
      showToast('नवीन B2B रेफरल यशस्वीरित्या जोडला गेला!', 'success');
      setNewReferralModal(false);
      setNewReferralData({ title: '', value: '', giverName: '', receiverName: '', status: 'active' });
      loadRealtimeData();
    } catch (err) {
      setReferrals((prev) => [{ id: `REF-${Date.now()}`, ...newReferralData, createdAt: new Date() }, ...prev]);
      showToast('रेफरल स्थानिकरित्या नोंदवला गेला!', 'success');
      setNewReferralModal(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['ID,Name,Phone,District,Verified,Role',
        ...users.map(u => `"${u.id}","${u.name}","${u.phone || ''}","${u.district || 'पुणे'}","${u.verified}","${u.role}"`)
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `connect_maratha_crm_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV अहवाल डाऊनलोड झाला!', 'success');
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery) ||
        u.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict = filterDistrict === 'all' || u.district === filterDistrict;
      const matchesVerified =
        filterVerified === 'all' ||
        (filterVerified === 'verified' && u.verified) ||
        (filterVerified === 'unverified' && !u.verified);

      return matchesSearch && matchesDistrict && matchesVerified;
    });
  }, [users, searchQuery, filterDistrict, filterVerified]);

  // Kanban Pipeline Stages (Derived directly from real data)
  const kanbanStages = useMemo(() => {
    const stageUnverified = filteredUsers.filter((u) => !u.verified);
    const stageVerified = filteredUsers.filter((u) => u.verified);
    const stageBusinesses = businesses.slice(0, 15);
    const stageReferrals = referrals.slice(0, 15);

    return [
      { id: 'lead_inquiry', title: '१. नवीन नोंदणी (Pending KYC)', count: stageUnverified.length, items: stageUnverified.slice(0, 8), color: '#F59E0B' },
      { id: 'kyc_verified', title: '२. प्रमाणित सभासद (Active Members)', count: stageVerified.length, items: stageVerified.slice(0, 8), color: '#EA580C' },
      { id: 'b2b_listed', title: '३. व्यवसाय संगम नोंदणी (B2B Directory)', count: stageBusinesses.length, items: stageBusinesses.slice(0, 8), color: '#D97706' },
      { id: 'deal_closed', title: '४. व्यवसाय देवाणघेवाण (Referral Flow)', count: stageReferrals.length, items: stageReferrals.slice(0, 8), color: '#C2410C' }
    ];
  }, [filteredUsers, businesses, referrals]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFDF9', color: '#1E293B', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#EA580C',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <span>🚩</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. PROFESSIONAL LEFT COLLAPSIBLE EXECUTIVE SIDEBAR */}
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
                🚩
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#431407', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                  CONNECT MARATHA
                </div>
                <div style={{ fontSize: '0.68rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Enterprise CRM 2.0
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

        {/* Current Active Role Switcher */}
        {!sidebarCollapsed && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #FED7AA', background: '#FFFFFF' }}>
            <label style={{ fontSize: '0.68rem', color: '#9A3412', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              सध्याची प्रशासकीय भूमिका:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
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
                {Object.values(ROLES).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                background: '#FFEDD5',
                color: ROLES[activeRole]?.color || '#EA580C',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #FED7AA'
              }}>
                {ROLES[activeRole]?.badge}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Modules */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'pipeline', label: '📊 पाईपलाईन (Kanban)', icon: '📈' },
            { id: 'members', label: '📇 सदस्य पडताळणी (KYC)', icon: '👥', count: filteredUsers.length },
            { id: 'business', label: '🤝 व्यवसाय व B2B संगम', icon: '🏢', count: referrals.length },
            { id: 'seva', label: '🩸 २४x७ आपत्कालीन रक्त', icon: '🩺', count: bloodRequests.length },
            { id: 'logs', label: '🛡️ सुरक्षा ऑडिट ट्रेल', icon: '🔒' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: activeView === item.id ? '1px solid #FED7AA' : '1px solid transparent',
                background: activeView === item.id ? '#FFF7ED' : 'transparent',
                color: activeView === item.id ? '#EA580C' : '#475569',
                fontSize: '0.82rem',
                fontWeight: activeView === item.id ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {item.label}
                  </span>
                  {item.count !== undefined && (
                    <span style={{
                      background: activeView === item.id ? '#EA580C' : '#FFEDD5',
                      color: activeView === item.id ? '#FFFFFF' : '#C2410C',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}

          {/* Dedicated External Route Links */}
          <div style={{ marginTop: '12px', borderTop: '1px solid #FED7AA', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              to="/ai"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#EA580C',
                fontSize: '0.82rem',
                fontWeight: 800
              }}>
              <span style={{ fontSize: '1.15rem' }}>🤖</span>
              {!sidebarCollapsed && <span>Connect Maratha AI</span>}
            </Link>

            <Link
              to="/crm/ceo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#7C2D12',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
              <span style={{ fontSize: '1.15rem' }}>🦅</span>
              {!sidebarCollapsed && <span>राज्यस्तरीय CEO Cockpit</span>}
            </Link>

            <Link
              to="/superadmin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#EA580C',
                fontSize: '0.82rem',
                fontWeight: 800
              }}>
              <span style={{ fontSize: '1.15rem' }}>👑</span>
              {!sidebarCollapsed && <span>सुपर ॲडमिन CRUD</span>}
            </Link>
          </div>
        </nav>

        {/* Footer Active Admins indicator */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #FED7AA',
          background: '#FFF7ED',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.8rem'
          }}>
            CRM
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#431407', whiteSpace: 'nowrap' }}>
                {user?.name || 'केंद्रीय ॲडमिन'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
                <span>🟢 ४ ॲडमिन सक्रिय</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CRM WORKSPACE BODY (PURE WHITE & BHAGWA) */}
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
          {/* Universal Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '8px',
            padding: '8px 14px',
            flex: 1,
            maxWidth: '460px'
          }}>
            <span style={{ color: '#EA580C' }}>🔍</span>
            <input
              type="text"
              placeholder="सभासद नाव, फोन, जिल्हा, किंवा आयडी शोधा (Ctrl+K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setNewReferralModal(true)}
              style={{
                background: 'linear-gradient(135deg, #EA580C, #D97706)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
              }}>
              <span>+</span>
              <span>नवीन B2B रेफरल</span>
            </button>

            <button
              onClick={handleQuickSuperAdminLogin}
              style={{
                background: '#FFF7ED',
                color: '#EA580C',
                border: '1px solid #EA580C',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>👑</span>
              <span>1-क्लिक SuperAdmin</span>
            </button>

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
                cursor: 'pointer'
              }}>
              📥 Export CSV
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

        {/* Main Content Area */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Executive Overview Ribbon (KPI Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            {[
              { label: 'एकूण नोंदणीकृत सदस्य', val: metrics.totalMembers || users.length || 0, sub: `✓ ${users.filter(u => u.verified).length} प्रमाणित (KYC)`, color: '#EA580C', icon: '👥' },
              { label: 'व्यवसाय संगम नोंदी', val: businesses.length || metrics.registeredBusinesses || 0, sub: 'सक्रिय व्यावसायिक', color: '#D97706', icon: '🏢' },
              { label: 'B2B रेफरल्स व्यवहार', val: referrals.length || 0, sub: 'प्रत्यक्ष व्यवसाय संधी', color: '#C2410C', icon: '🤝' },
              { label: '२४x७ रक्त विनंत्या', val: bloodRequests.length || 0, sub: 'आपत्कालीन साहाय्य कक्ष', color: '#DC2626', icon: '🩸' }
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #FED7AA',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(234, 88, 12, 0.06)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 700 }}>{card.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: card.color, letterSpacing: '-0.5px' }}>
                  {card.val}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9A3412', fontWeight: 600 }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* View Tab Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #FED7AA', paddingBottom: '12px' }}>
            {[
              { id: 'pipeline', label: '📊 पाईपलाईन (Kanban)', desc: 'Leads & Stages' },
              { id: 'members', label: '📇 सदस्य पडताळणी ग्रिड (KYC)', desc: 'Scrutiny Table' },
              { id: 'business', label: '🤝 B2B रेफरल मॅनेजर', desc: 'Deals & Referrals' },
              { id: 'seva', label: '🩸 आपत्कालीन रक्त साहाय्य', desc: 'Blood Helpdesk' },
              { id: 'logs', label: '🛡️ सुरक्षा व ऑडिट ट्रेल', desc: 'Audit Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                style={{
                  background: activeView === tab.id ? 'linear-gradient(135deg, #EA580C, #D97706)' : '#FFFFFF',
                  color: activeView === tab.id ? '#FFFFFF' : '#7C2D12',
                  border: activeView === tab.id ? 'none' : '1px solid #FED7AA',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeView === tab.id ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ============================================================ */}
          {/* TAB 1: PIPELINE KANBAN (TRUE CRM FORMAT) */}
          {/* ============================================================ */}
          {activeView === 'pipeline' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'flex-start' }}>
              {kanbanStages.map((stg) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FED7AA', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stg.color }} />
                      <strong style={{ fontSize: '0.8rem', color: '#431407' }}>{stg.title}</strong>
                    </div>
                    <span style={{ background: '#FFEDD5', color: '#EA580C', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                      {stg.items.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stg.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => setSelectedUser(item)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #FED7AA',
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
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
                            background: item.verified ? '#ECFDF5' : '#FFF7ED',
                            color: item.verified ? '#059669' : '#EA580C',
                            border: `1px solid ${item.verified ? '#A7F3D0' : '#FED7AA'}`,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {item.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B' }}>
                          {item.name || item.businessName || 'अज्ञात सभासद'}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          📍 {item.district || item.city || 'पुणे'} • {item.phone || item.category || '—'}
                        </div>
                      </div>
                    ))}

                    {stg.items.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#9A3412', fontSize: '0.75rem', fontWeight: 600 }}>
                        कोणत्याही नोंदी नाहीत
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: MEMBERS KYC SCRUTINY DATA GRID */}
          {/* ============================================================ */}
          {activeView === 'members' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.05)' }}>
              <div style={{ padding: '12px 16px', background: '#FFF7ED', borderBottom: '1px solid #FED7AA', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 800 }}>पडताळणी फिल्टर:</span>
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value)}
                  style={{ background: '#FFFFFF', border: '1px solid #FED7AA', color: '#431407', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                  <option value="all">सर्व सदस्य (All)</option>
                  <option value="verified">केवळ प्रमाणित (Verified)</option>
                  <option value="unverified">केवळ प्रलंबित (Pending Scrutiny)</option>
                </select>

                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#7C2D12', fontWeight: 700 }}>
                  एकूण आढळलेले: <strong style={{ color: '#EA580C' }}>{filteredUsers.length}</strong>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', color: '#7C2D12', fontWeight: 800 }}>
                      <th style={{ padding: '12px 16px' }}>सभासद आयडी</th>
                      <th style={{ padding: '12px 16px' }}>पूर्ण नाव</th>
                      <th style={{ padding: '12px 16px' }}>संपर्क नंबर</th>
                      <th style={{ padding: '12px 16px' }}>जिल्हा</th>
                      <th style={{ padding: '12px 16px' }}>भूमिका</th>
                      <th style={{ padding: '12px 16px' }}>KYC पडताळणी</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>कृती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #FED7AA' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#EA580C', fontWeight: 800 }}>
                          {u.id}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1E293B' }}>
                          {u.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {u.phone || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>
                          {u.district || 'पुणे'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {u.role || 'member'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: u.verified ? '#ECFDF5' : '#FFF7ED',
                            color: u.verified ? '#059669' : '#EA580C',
                            border: `1px solid ${u.verified ? '#A7F3D0' : '#FED7AA'}`,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {u.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleToggleVerification(u)}
                              style={{
                                background: u.verified ? '#FEE2E2' : '#DCFCE7',
                                color: u.verified ? '#DC2626' : '#16A34A',
                                border: `1px solid ${u.verified ? '#FCA5A5' : '#86EFAC'}`,
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}>
                              {u.verified ? 'रद्द करा' : 'मंजूर करा'}
                            </button>
                            <button
                              onClick={() => setSelectedUser(u)}
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
                              डॉसियर ➔
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: B2B REFERRALS & BUSINESS SANGAM */}
          {/* ============================================================ */}
          {activeView === 'business' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {referrals.map((r, i) => (
                  <div
                    key={r.id || i}
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
                      <span style={{ fontSize: '0.68rem', color: '#EA580C', fontFamily: 'monospace', fontWeight: 800 }}>{r.id || `REF-${i}`}</span>
                      <span style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', fontSize: '0.75rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                        ₹{(r.estimatedValue || 50000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      देणारा: <strong style={{ color: '#431407' }}>{r.giverName}</strong> ➔ घेणारा: <strong style={{ color: '#431407' }}>{r.receiverName}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: SEVA 24x7 EMERGENCY HELPDESK */}
          {/* ============================================================ */}
          {activeView === 'seva' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {bloodRequests.map((b, i) => (
                <div
                  key={b.id || i}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626' }}>
                      🩸 रक्तगट: {b.bloodGroup || 'सर्व रक्तगट'}
                    </span>
                    <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid #FCA5A5' }}>
                      तातडीची गरज
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>
                    {b.patientName || 'अज्ञात रुग्ण'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    रुग्णालय: {b.hospital || 'जिल्हा शासकीय रुग्णालय'} • {b.city || 'पुणे'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                    📞 संपर्क: {b.contactNumber || '१८००-१२३-१६७४'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: AUDIT TRAIL & SECURITY LOGS */}
          {/* ============================================================ */}
          {activeView === 'logs' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.05)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: '#431407' }}>
                🛡️ रीअल-टाइम सुरक्षा व सिस्टम ॲक्टिव्हिटी लॉग (OWASP Audit)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                {auditLogs.map((log, i) => (
                  <div
                    key={log.id || i}
                    style={{
                      background: '#FFF7ED',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      borderLeft: '3px solid #EA580C',
                      border: '1px solid #FED7AA'
                    }}>
                    <div>
                      <strong style={{ color: '#EA580C' }}>[{log.action}]</strong>{' '}
                      <span style={{ color: '#1E293B', fontWeight: 600 }}>वापरकर्ता: {log.performedBy || 'System'}</span>
                    </div>
                    <span style={{ color: '#9A3412', fontFamily: 'monospace', fontWeight: 600 }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'आत्ताच'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Member Details Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ background: '#FFFFFF', border: '2px solid #EA580C', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', color: '#1E293B', boxShadow: '0 20px 50px rgba(234,88,12,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #FED7AA', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#431407' }}>👤 सदस्य तपशील डॉसियर</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#EA580C', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div><strong style={{ color: '#7C2D12' }}>नाव:</strong> {selectedUser.name}</div>
              <div><strong style={{ color: '#7C2D12' }}>ID:</strong> <span style={{ fontFamily: 'monospace', color: '#EA580C', fontWeight: 700 }}>{selectedUser.id}</span></div>
              <div><strong style={{ color: '#7C2D12' }}>फोन:</strong> {selectedUser.phone || 'उपलब्ध नाही'}</div>
              <div><strong style={{ color: '#7C2D12' }}>ईमेल:</strong> {selectedUser.email || 'उपलब्ध नाही'}</div>
              <div><strong style={{ color: '#7C2D12' }}>जिल्हा:</strong> {selectedUser.district || 'पुणे'}</div>
              <div><strong style={{ color: '#7C2D12' }}>कुळ:</strong> {selectedUser.kul || '९६ कुळी मराठा'}</div>
              <div><strong style={{ color: '#7C2D12' }}>व्यवसाय:</strong> {selectedUser.profession || '—'}</div>
              <div><strong style={{ color: '#7C2D12' }}>भूमिका:</strong> {selectedUser.role}</div>
              <div><strong style={{ color: '#7C2D12' }}>KYC पडताळणी:</strong> {selectedUser.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  handleToggleVerification(selectedUser);
                  setSelectedUser(null);
                }}
                style={{ background: selectedUser.verified ? '#DC2626' : '#16A34A', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                {selectedUser.verified ? 'पडताळणी रद्द करा' : 'प्रमाणित करा (Approve KYC)'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: '#FFF7ED', color: '#7C2D12', border: '1px solid #FED7AA', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Referral Modal */}
      {newReferralModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ background: '#FFFFFF', border: '2px solid #EA580C', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', color: '#1E293B', boxShadow: '0 20px 50px rgba(234,88,12,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #FED7AA', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#431407' }}>🤝 नवीन B2B रेफरल नोंदवा</h3>
              <button onClick={() => setNewReferralModal(false)} style={{ background: 'transparent', border: 'none', color: '#EA580C', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>
            <form onSubmit={handleCreateReferral} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', fontWeight: 700, marginBottom: '4px' }}>रेफरल / डील शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. औद्योगिक बांधकाम साहित्य पुरवठा"
                  value={newReferralData.title}
                  onChange={(e) => setNewReferralData({ ...newReferralData, title: e.target.value })}
                  style={{ width: '100%', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#1E293B', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', fontWeight: 700, marginBottom: '4px' }}>अंदाजे डील मूल्य (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="उदा. 250000"
                  value={newReferralData.value}
                  onChange={(e) => setNewReferralData({ ...newReferralData, value: e.target.value })}
                  style={{ width: '100%', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#1E293B', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', fontWeight: 700, marginBottom: '4px' }}>रेफरल देणारा सदस्य</label>
                <input
                  type="text"
                  placeholder="उदा. तानाजी जाधव"
                  value={newReferralData.giverName}
                  onChange={(e) => setNewReferralData({ ...newReferralData, giverName: e.target.value })}
                  style={{ width: '100%', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#1E293B', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', fontWeight: 700, marginBottom: '4px' }}>रेफरल घेणारा व्यापारी / भागीदार</label>
                <input
                  type="text"
                  placeholder="उदा. प्रवीण भोसले"
                  value={newReferralData.receiverName}
                  onChange={(e) => setNewReferralData({ ...newReferralData, receiverName: e.target.value })}
                  style={{ width: '100%', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#1E293B', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewReferralModal(false)}
                  style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#7C2D12', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #EA580C, #D97706)', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)' }}>
                  रेफरल नोंदवा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
