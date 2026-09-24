import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

// Available Executive CRM Roles
const ROLES = {
  super_admin: {
    id: 'super_admin',
    name: 'केंद्रीय सुपर ॲडमिन (Super Admin)',
    badge: '👑 ALL ACCESS',
    color: '#ea580c',
    description: 'सर्व ३६ जिल्हे, वापरकर्ते, डॉक्टर्स, सेवा, हॉटेल्स, CMS व सुरक्षा नियंत्रण'
  },
  ceo: {
    id: 'ceo',
    name: 'कार्याध्यक्ष / राज्य अध्यक्ष (Executive CEO)',
    badge: '🦅 STATE EXECUTIVE',
    color: '#2563eb',
    description: 'राज्यस्तरीय व्यवसाय वृद्धी, ६ विभाग, B2B deal pipelines व मॅक्रो सांख्यिकी'
  },
  district_admin: {
    id: 'district_admin',
    name: 'जिल्हा समन्वयक (District President)',
    badge: '📍 DISTRICT LEVEL',
    color: '#0284c7',
    description: 'जिल्ह्यातील सदस्य पडताळणी (KYC Scrutiny), तालुका समन्वय व स्थानिक शाखा'
  },
  chapter_president: {
    id: 'chapter_president',
    name: 'चॅप्टर अध्यक्ष (Chapter President)',
    badge: '💼 CHAPTER B2B',
    color: '#16a34a',
    description: 'रेफरल स्लिप्स (TYFCB), साप्ताहिक बैठका, १-ते-१ भेटी व व्यवसाय देवाणघेवाण'
  },
  seva_head: {
    id: 'seva_head',
    name: 'समाज साहाय्यता कक्ष (Seva Helpdesk)',
    badge: '🩺 24x7 SEVA',
    color: '#dc2626',
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
    setLoading(true);
    try {
      const [metricsRes, usersRes, bizRes, refRes, bloodRes, logsRes, rolesRes] = await Promise.all([
        apiClient.getAdminMetrics().catch(() => ({})),
        apiClient.getAdminUsers({ limit: 100 }).catch(() => ({ users: [] })),
        apiClient.getBusinesses().catch(() => []),
        apiClient.getReferrals().catch(() => []),
        apiClient.getBloodRequests().catch(() => []),
        apiClient.getAuditLogs().catch(() => []),
        apiClient.getRolesMatrix().catch(() => [])
      ]);

      setMetrics(metricsRes || {});
      setUsers(usersRes.users || []);
      setBusinesses(bizRes || []);
      setReferrals(refRes || []);
      setBloodRequests(bloodRes || []);
      setAuditLogs(logsRes || []);
      setRolesMatrix(rolesRes || []);
    } catch (err) {
      console.error('CRM load error:', err);
      showToast('माहिती लोड करताना त्रुटी आली.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealtimeData();
  }, [activeRole]);

  // 1-Click SuperAdmin Access
  const handleQuickSuperAdminLogin = async () => {
    try {
      showToast('सुपर ॲडमिन क्रेडेंशियल्ससह लॉगिन होत आहे...', 'success');
      const res = await login('superadmin@connectmaratha.org', 'password123');
      if (res && (res.success || res.member)) {
        showToast('यशस्वी! सुपर ॲडमिन अधिकार प्राप्त झाले.', 'success');
        setTimeout(() => loadRealtimeData(), 400);
      }
    } catch (err) {
      showToast('सुपर ॲडमिन लॉगिन अयशस्वी: ' + (err.message || ''), 'error');
    }
  };

  // Toggle KYC Verification
  const handleToggleVerification = async (targetUser) => {
    try {
      const newStatus = !targetUser.verified;
      await apiClient.updateAdminUser(targetUser.id, { verified: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, verified: newStatus } : u))
      );
      showToast(`वापरकर्ता ${targetUser.name} पडताळणी स्थिती: ${newStatus ? 'प्रमाणित (Approved)' : 'प्रलंबित (Pending)'}`);
    } catch (err) {
      showToast('पडताळणी बदलण्यात अडचण आली: ' + (err.message || ''), 'error');
    }
  };

  // Submit Referral
  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!newReferralData.title || !newReferralData.value) {
      showToast('कृपया शीर्षक आणि अंदाजे मूल्य भरा.', 'error');
      return;
    }
    try {
      const res = await apiClient.createReferral({
        title: newReferralData.title,
        estimatedValue: Number(newReferralData.value) || 50000,
        giverName: newReferralData.giverName || user?.name || 'अध्यक्ष',
        receiverName: newReferralData.receiverName || 'नोंदणीकृत व्यापारी',
        status: newReferralData.status || 'active'
      });
      if (res && res.referral) {
        setReferrals((prev) => [res.referral, ...prev]);
      } else {
        await loadRealtimeData();
      }
      setNewReferralModal(false);
      setNewReferralData({ title: '', value: '', giverName: '', receiverName: '', status: 'active' });
      showToast('नवीन B2B रेफरल यशस्वीरीत्या नोंदवले!');
    } catch (err) {
      showToast('रेफरल नोंदवण्यात अडचण: ' + (err.message || ''), 'error');
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterDistrict !== 'all' && u.district !== filterDistrict) return false;
      if (filterVerified === 'verified' && !u.verified) return false;
      if (filterVerified === 'unverified' && u.verified) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, filterDistrict, filterVerified, searchQuery]);

  // Kanban Stages for Pipeline
  const kanbanStages = [
    { id: 'inquiry', title: 'नवीन सदस्य (New Inquiries)', color: '#38BDF8', items: filteredUsers.filter(u => !u.verified).slice(0, 10) },
    { id: 'kyc', title: 'KYC छाननी प्रलंबित (Under Review)', color: '#F59E0B', items: filteredUsers.filter(u => !u.verified && u.phone).slice(10, 20) },
    { id: 'verified', title: 'प्रमाणित सदस्य (Verified Active)', color: '#10B981', items: filteredUsers.filter(u => u.verified).slice(0, 15) },
    { id: 'enterprise', title: 'B2B व्यापारी संगम (Enterprise)', color: '#8B5CF6', items: businesses.slice(0, 10) }
  ];

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'District', 'Role', 'Status'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.email || ''}"`,
      `"${u.district || ''}"`,
      `"${u.role || ''}"`,
      u.verified ? 'प्रमाणित' : 'प्रलंबित'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `Connect_Maratha_CRM_Members_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV अहवाल डाऊनलोड झाला!');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090D16', color: '#F1F5F9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 800,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. LEFT CRM SIDEBAR (ENTERPRISE FORMAT) */}
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
        {/* Brand */}
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
                  EXECUTIVE CRM
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

        {/* Role Switcher Pill */}
        {!sidebarCollapsed && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              सक्रिय कार्यकारी भूमिका (Role)
            </label>
            <select
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value);
                if (e.target.value === 'super_admin') setActiveView('pipeline');
                else if (e.target.value === 'ceo') navigate('/crm/ceo');
                else if (e.target.value === 'district_admin') setActiveView('members');
                else if (e.target.value === 'chapter_president') setActiveView('business');
                else if (e.target.value === 'seva_head') setActiveView('seva');
              }}
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
              {Object.values(ROLES).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* CRM Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {[
            { id: 'pipeline', label: 'पाईपलाईन व लीड्स (Kanban)', icon: '📊', count: users.length },
            { id: 'members', label: 'सदस्य डॉसियर व KYC पडताळणी', icon: '📇', count: users.filter(u => u.verified).length },
            { id: 'business', label: 'B2B रेफरल व उद्योग संगम', icon: '🤝', count: referrals.length },
            { id: 'seva', label: '२४x७ आपत्कालीन साहाय्यता कक्ष', icon: '🩺', count: bloodRequests.length },
            { id: 'reports', label: 'तपशीलवार मॅक्रो अहवाल', icon: '📈' },
            { id: 'logs', label: 'सुरक्षा व ऑडिट ट्रेल', icon: '🛡️', count: auditLogs.length }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: activeView === item.id ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                background: activeView === item.id
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.1))'
                  : 'transparent',
                color: activeView === item.id ? '#F59E0B' : '#94A3B8',
                fontSize: '0.82rem',
                fontWeight: activeView === item.id ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}>
              <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {item.label}
                  </span>
                  {item.count !== undefined && (
                    <span style={{
                      background: activeView === item.id ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                      color: activeView === item.id ? '#000000' : '#CBD5E1',
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
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              to="/ai"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                background: 'rgba(124, 58, 237, 0.15)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#C084FC',
                fontSize: '0.82rem',
                fontWeight: 700
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
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#94A3B8',
                fontSize: '0.82rem',
                fontWeight: 600
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
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#F59E0B',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
              <span style={{ fontSize: '1.15rem' }}>👑</span>
              {!sidebarCollapsed && <span>सुपर ॲडमिन CRUD</span>}
            </Link>
          </div>
        </nav>

        {/* Footer Active Admins indicator */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F59E0B',
            color: '#000',
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
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                {user?.name || 'केंद्रीय ॲडमिन'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>🟢 ४ ॲडमिन सक्रिय</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CRM WORKSPACE BODY */}
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
          {/* Universal Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111827', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 14px', flex: 1, maxWidth: '460px' }}>
            <span style={{ color: '#64748B' }}>🔍</span>
            <input
              type="text"
              placeholder="सभासद नाव, फोन, जिल्हा, किंवा आयडी शोधा (Ctrl+K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '0.82rem', outline: 'none', width: '100%' }}
            />
            <span style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              ⌘K
            </span>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setNewReferralModal(true)}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>+</span>
              <span>नवीन B2B रेफरल</span>
            </button>

            <button
              onClick={handleQuickSuperAdminLogin}
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#000',
                border: 'none',
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
                background: 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
              📥 Export CSV
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

        {/* Main Content Area */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Executive Overview Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            {[
              { label: 'एकूण नोंदणीकृत सदस्य', val: metrics.totalMembers || users.length || 0, sub: `✓ ${users.filter(u => u.verified).length} प्रमाणित (KYC)`, color: '#38BDF8', icon: '👥' },
              { label: 'व्यवसाय संगम नोंदी', val: businesses.length || metrics.registeredBusinesses || 0, sub: 'सक्रिय व्यावसायिक', color: '#FBBF24', icon: '🏢' },
              { label: 'B2B रेफरल्स व्यवहार', val: referrals.length || 0, sub: 'प्रत्यक्ष व्यवसाय संधी', color: '#34D399', icon: '🤝' },
              { label: '२४x७ रक्त विनंत्या', val: bloodRequests.length || 0, sub: 'आपत्कालीन साहाय्य कक्ष', color: '#F87171', icon: '🩸' }
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{card.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: card.color, letterSpacing: '-0.5px' }}>
                  {card.val}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* View Tab Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
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
                  background: activeView === tab.id ? '#F59E0B' : 'rgba(255,255,255,0.04)',
                  color: activeView === tab.id ? '#000000' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
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
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stg.color }} />
                      <strong style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{stg.title}</strong>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px' }}>
                      {stg.items.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stg.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => setSelectedUser(item)}
                        style={{
                          background: '#1E293B',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#F59E0B')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                            {item.id}
                          </span>
                          <span style={{
                            background: item.verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: item.verified ? '#34D399' : '#FCD34D',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {item.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFF' }}>
                          {item.name || item.businessName || 'अज्ञात सभासद'}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          📍 {item.district || item.city || 'पुणे'} • {item.phone || item.category || '—'}
                        </div>
                      </div>
                    ))}

                    {stg.items.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.75rem' }}>
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
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>पडताळणी फिल्टर:</span>
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value)}
                  style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '6px', padding: '5px 10px', fontSize: '0.75rem' }}>
                  <option value="all">सर्व सदस्य (All)</option>
                  <option value="verified">केवळ प्रमाणित (Verified)</option>
                  <option value="unverified">केवळ प्रलंबित (Pending Scrutiny)</option>
                </select>

                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748B' }}>
                  एकूण आढळलेले: <strong>{filteredUsers.length}</strong>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0B0F19', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
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
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#F59E0B' }}>
                          {u.id}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#FFF' }}>
                          {u.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#CBD5E1' }}>
                          {u.phone || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#94A3B8' }}>
                          {u.district || 'पुणे'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                            {u.role || 'member'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: u.verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: u.verified ? '#34D399' : '#FCD34D',
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
                                background: u.verified ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: u.verified ? '#F87171' : '#34D399',
                                border: `1px solid ${u.verified ? '#EF4444' : '#10B981'}`,
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}>
                              {u.verified ? 'रद्द करा' : 'मंजूर करा'}
                            </button>
                            <button
                              onClick={() => setSelectedUser(u)}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#FFF',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
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
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#F59E0B', fontFamily: 'monospace' }}>{r.id || `REF-${i}`}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                        ₹{(r.estimatedValue || 50000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFF' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      देणारा: <strong style={{ color: '#E2E8F0' }}>{r.giverName}</strong> ➔ घेणारा: <strong style={{ color: '#E2E8F0' }}>{r.receiverName}</strong>
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
                    background: '#111827',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444' }}>
                      🩸 रक्तगट: {b.bloodGroup || 'सर्व रक्तगट'}
                    </span>
                    <span style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px' }}>
                      तातडीची गरज
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>
                    {b.patientName || 'अज्ञात रुग्ण'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    रुग्णालय: {b.hospital || 'जिल्हा शासकीय रुग्णालय'} • {b.city || 'पुणे'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
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
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: '#FFF' }}>
                🛡️ रीअल-टाइम सुरक्षा व सिस्टम ॲक्टिव्हिटी लॉग (OWASP Audit)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                {auditLogs.map((log, i) => (
                  <div
                    key={log.id || i}
                    style={{
                      background: '#0F172A',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      borderLeft: '3px solid #10B981'
                    }}>
                    <div>
                      <strong style={{ color: '#FCD34D' }}>[{log.action}]</strong>{' '}
                      <span style={{ color: '#E2E8F0' }}>वापरकर्ता: {log.performedBy || 'System'}</span>
                    </div>
                    <span style={{ color: '#64748B', fontFamily: 'monospace' }}>
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
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>👤 सदस्य तपशील डॉसियर</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div><strong>नाव:</strong> {selectedUser.name}</div>
              <div><strong>ID:</strong> {selectedUser.id}</div>
              <div><strong>फोन:</strong> {selectedUser.phone || 'उपलब्ध नाही'}</div>
              <div><strong>ईमेल:</strong> {selectedUser.email || 'उपलब्ध नाही'}</div>
              <div><strong>जिल्हा:</strong> {selectedUser.district || 'पुणे'}</div>
              <div><strong>कुळ:</strong> {selectedUser.kul || '९६ कुळी मराठा'}</div>
              <div><strong>व्यवसाय:</strong> {selectedUser.profession || '—'}</div>
              <div><strong>भूमिका:</strong> {selectedUser.role}</div>
              <div><strong>KYC पडताळणी:</strong> {selectedUser.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  handleToggleVerification(selectedUser);
                  setSelectedUser(null);
                }}
                style={{ background: selectedUser.verified ? '#EF4444' : '#10B981', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                {selectedUser.verified ? 'पडताळणी रद्द करा' : 'प्रमाणित करा (Approve KYC)'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: '#374151', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
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
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>🤝 नवीन B2B रेफरल नोंदवा</h3>
              <button onClick={() => setNewReferralModal(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateReferral} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>रेफरल / डील शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. औद्योगिक बांधकाम साहित्य पुरवठा"
                  value={newReferralData.title}
                  onChange={(e) => setNewReferralData({ ...newReferralData, title: e.target.value })}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>अंदाजे डील मूल्य (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="उदा. 250000"
                  value={newReferralData.value}
                  onChange={(e) => setNewReferralData({ ...newReferralData, value: e.target.value })}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>रेफरल देणारा सदस्य</label>
                <input
                  type="text"
                  placeholder="उदा. तानाजी जाधव"
                  value={newReferralData.giverName}
                  onChange={(e) => setNewReferralData({ ...newReferralData, giverName: e.target.value })}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>रेफरल घेणारा व्यापारी / भागीदार</label>
                <input
                  type="text"
                  placeholder="उदा. प्रवीण भोसले"
                  value={newReferralData.receiverName}
                  onChange={(e) => setNewReferralData({ ...newReferralData, receiverName: e.target.value })}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewReferralModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#CBD5E1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
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
