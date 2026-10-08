import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import api from '../../services/api';
import { MAHARASHTRA_DISTRICTS, DISTRICT_TALUKAS } from '../../services/referralService';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';

export default function DistrictAdminCRM() {
  const [selectedDistrict, setSelectedDistrict] = useState('पुणे');
  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc', 'mandals', 'stats', 'opportunities'
  const [loading, setLoading] = useState(true);
  const [realUsers, setRealUsers] = useState([]);
  const [realBusinesses, setRealBusinesses] = useState([]);
  const [jobApps, setJobApps] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [talukaFilter, setTalukaFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, bizRes, appsRes, enqsRes] = await Promise.all([
        apiClient.getAdminUsers().catch(() => ({ users: [] })),
        apiClient.get('businesses').catch(() => ({ data: { businesses: [] } })),
        api.admin.getJobApplications().catch(() => ({ applications: [] })),
        api.admin.getEnquiriesSummary().catch(() => ({ enquiries: [] }))
      ]);

      const usersList = usersRes.users || [];
      const bizList = bizRes.data?.businesses || bizRes.businesses || (Array.isArray(bizRes) ? bizRes : []);
      const appsList = appsRes.applications || [];
      const enqsList = enqsRes.enquiries || [];

      setRealUsers(usersList);
      setRealBusinesses(bizList);
      setJobApps(appsList);
      setEnquiries(enqsList);
    } catch (err) {
      console.warn('District CRM loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users by selected district
  const distUsers = realUsers.filter(u => {
    const uDist = (u.district || u.city || '').toLowerCase();
    const sDist = selectedDistrict.toLowerCase();
    return uDist.includes(sDist) || sDist.includes(uDist);
  });

  const distBusinesses = realBusinesses.filter(b => {
    const bDist = (b.district || b.city || '').toLowerCase();
    const sDist = selectedDistrict.toLowerCase();
    return bDist.includes(sDist) || sDist.includes(bDist);
  });

  const distApps = jobApps.filter(a => {
    const d = (a.district || '').toLowerCase();
    const s = selectedDistrict.toLowerCase();
    return d.includes(s) || s.includes(d);
  });

  const distEnqs = enquiries.filter(e => {
    const d = (e.district || e.city || '').toLowerCase();
    const s = selectedDistrict.toLowerCase();
    return d.includes(s) || s.includes(d);
  });

  // Calculate live statistics from actual DB members
  const totalMembers = distUsers.length;
  const verifiedCount = distUsers.filter(u => u.verified).length;
  const pendingCount = distUsers.filter(u => !u.verified).length;
  const verifiedBizCount = distBusinesses.length;

  // Available talukas dynamically from district or lookup
  const knownTalukas = DISTRICT_TALUKAS[selectedDistrict] || [];
  const activeTalukas = Array.from(new Set([
    ...knownTalukas,
    ...distUsers.map(u => u.taluka).filter(Boolean)
  ]));

  // Live taluka-wise breakdown from real database
  const talukaStats = activeTalukas.map(taluka => {
    const membersInTaluka = distUsers.filter(u => (u.taluka || '').toLowerCase() === taluka.toLowerCase());
    return {
      taluka,
      members: membersInTaluka.length,
      verified: membersInTaluka.filter(u => u.verified).length,
      pending: membersInTaluka.filter(u => !u.verified).length
    };
  });

  // KYC Verification actions that update real database
  const handleApprove = async (id, name) => {
    try {
      await apiClient.updateAdminUser(id, { verified: true, verified_profile: 1 });
      setRealUsers(prev => prev.map(m => m.id === id ? { ...m, verified: true } : m));
      showToast(`✓ सदस्य '${name}' (ID: ${id}) यांचे डिजिटल ओळखपत्र थेट डेटाबेसमध्ये मंजूर झाले!`);
    } catch (e) {
      showToast(`मंजूर करताना त्रुटी: ${e.message}`);
    }
  };

  const handleReject = async (id, name) => {
    try {
      await apiClient.updateAdminUser(id, { verified: false, verified_profile: 0 });
      setRealUsers(prev => prev.map(m => m.id === id ? { ...m, verified: false } : m));
      showToast(`✕ अर्ज #${id} (${name}) नाकारण्यात आला.`);
    } catch (e) {
      showToast(`नाकारताना त्रुटी: ${e.message}`);
    }
  };

  // Filtered members for display
  const filteredMembers = distUsers.filter(m => {
    const matchTaluka = talukaFilter === 'all' || (m.taluka || '').toLowerCase() === talukaFilter.toLowerCase();
    const matchSearch = searchTerm === '' ||
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.profession || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(m.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTaluka && matchSearch;
  });

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', paddingBottom: '60px' }}>
      <CRMScopeSwitcher currentScope="district" />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#431407',
          color: '#FED7AA',
          border: '1px solid #EA580C',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          zIndex: 9999,
          fontWeight: 600
        }}>
          {toastMessage}
        </div>
      )}

      {/* TOP ISOLATED HEADER BAR */}
      <div style={{ background: '#FFFFFF', color: '#1E293B', padding: '12px 24px', borderBottom: '1.5px solid #FED7AA' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>📍</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                CONNECT MARATHA — जिल्हा समन्वयक CRM (Live Database)
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#7C2D12' }}>
                थेट डेटाबेस सदस्य पडताळणी व जिल्हा प्रशासन नियंत्रण कक्ष
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={loadData}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: '#EA580C',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
              🔄 रीफ्रेश ({realUsers.length} सदस्य)
            </button>
            <Link
              to="/crm"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: '#FFF7ED',
                color: '#EA580C',
                border: '1px solid #FED7AA',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              CRM मुख्य कक्ष
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px' }}>
        
        {/* DISTRICT HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #EA580C, #D97706, #C2410C)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
              📍 LIVE DATABASE DISTRICT CRM
            </span>
            <h1 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              {selectedDistrict} जिल्हा — थेट डेटाबेस प्रशासन
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9 }}>
              एकूण नोंदणीकृत सदस्य: <strong>{totalMembers}</strong> • सत्यापित: {verifiedCount} • प्रलंबित: {pendingCount}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFEDD5' }}>जिल्हा निवडा:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setTalukaFilter('all');
              }}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {MAHARASHTRA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 TOP DISTRICT KPIS (LIVE FROM DATABASE) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>जिल्ह्यातील एकूण सदस्य (Live)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {totalMembers}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>डेटाबेस थेट संख्या</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(234,88,12,0.05)' }}>
            <div style={{ fontSize: '0.82rem', color: '#7C2D12', fontWeight: 700 }}>प्रमाणित सभासद (Verified)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {verifiedCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ओळखपत्र पडताळणी पूर्ण</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>प्रलंबित पडताळण्या (Pending KYC)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#dc2626', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>छाननी प्रक्रियेत</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>नोंदणीकृत व्यवसाय (Live)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#EA580C', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {verifiedBizCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>जिल्हा डिरेक्टरी नोंदी</div>
          </div>
        </div>

        {/* DISTRICT MODULE TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #FED7AA', marginBottom: '20px', overflowX: 'auto' }}>
          {[
            { id: 'kyc', label: '📋 ओळखपत्र पडताळणी कक्ष (Live KYC Queue)', count: filteredMembers.length },
            { id: 'opportunities', label: '💼 संधी, नोकऱ्या व लीड्स', count: distApps.length + distEnqs.length },
            { id: 'stats', label: '📊 तालुकानिहाय सांख्यिकी (Taluka Stats)', count: talukaStats.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#EA580C' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#7C2D12',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#FFEDD5',
                  color: activeTab === tab.id ? '#fff' : '#C2410C',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: KYC VERIFICATION QUEUE (LIVE DATABASE MEMBERS) */}
        {activeTab === 'kyc' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #FED7AA', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                  📋 थेट डेटाबेस सदस्य पडताळणी कक्ष ({selectedDistrict} जिल्हा)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  प्रत्यक्ष नोंदणीकृत सदस्यांची यादी. 'मंजूर करा' वर क्लिक केल्यास स्थिती थेट डेटाबेसमध्ये सेव्ह होईल.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={talukaFilter}
                  onChange={(e) => setTalukaFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                >
                  <option value="all">सर्व तालुके</option>
                  {activeTalukas.map(t => (
                    <option key={t} value={t}>{t} तालुका</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="🔎 नाव, ID, फोन किंवा पेशा शोधा..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', minWidth: '220px' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#EA580C', fontWeight: 800 }}>
                डेटाबेसमधून थेट सदस्य लोड करत आहे...
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', textAlign: 'left', color: '#7C2D12' }}>
                      <th style={{ padding: '12px 14px' }}>सदस्य आयडी</th>
                      <th style={{ padding: '12px 14px' }}>पूर्ण नाव</th>
                      <th style={{ padding: '12px 14px' }}>संपर्क</th>
                      <th style={{ padding: '12px 14px' }}>तालुका / शहर</th>
                      <th style={{ padding: '12px 14px' }}>व्यवसाय / पेशा</th>
                      <th style={{ padding: '12px 14px' }}>नोंदणी दिनांक</th>
                      <th style={{ padding: '12px 14px' }}>स्थिती</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती (Actions)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                          या जिल्ह्यात/तालुक्यात अद्याप नोंदणीकृत सदस्य नाहीत.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #FED7AA' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#EA580C', fontFamily: 'monospace' }}>
                            {m.id}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            {m.name}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.82rem' }}>
                            {m.phone || m.mobile || '—'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {m.taluka || m.city || 'सर्व'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {m.profession || m.business || 'सभासद'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.82rem' }}>
                            {m.joined || (m.createdAt ? String(m.createdAt).slice(0, 10) : 'नुकतेच')}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: m.verified ? '#DCFCE7' : '#FEF3C7',
                              color: m.verified ? '#15803D' : '#B45309'
                            }}>
                              {m.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {!m.verified ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(m.id, m.name)}
                                  style={{ padding: '6px 12px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  ✓ मंजूर करा
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(m.id, m.name)}
                                  style={{ padding: '6px 12px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  ✕ नाकारा
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReject(m.id, m.name)}
                                style={{ padding: '4px 10px', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                प्रलंबित करा
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TALUKA STATS (LIVE DATABASE AGGREGATION) */}
        {activeTab === 'stats' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #FED7AA', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#431407', fontWeight: 900 }}>
              📊 {selectedDistrict} जिल्ह्यातील थेट तालुकानिहाय सदस्य सांख्यिकी
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', textAlign: 'left', color: '#7C2D12' }}>
                    <th style={{ padding: '12px 14px' }}>तालुका</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>एकूण सदस्य</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>प्रमाणित सभासद</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>प्रलंबित पडताळण्या</th>
                  </tr>
                </thead>
                <tbody>
                  {talukaStats.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #FED7AA' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1E293B' }}>{t.taluka}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#EA580C' }}>{t.members}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#16A34A', fontWeight: 800 }}>{t.verified}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#DC2626', fontWeight: 800 }}>{t.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OPPORTUNITIES, JOBS & B2B LEADS */}
        {activeTab === 'opportunities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. Job Applications in District */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #FED7AA', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#431407', fontFamily: 'Baloo 2', fontWeight: 900 }}>
                    💼 {selectedDistrict} जिल्ह्यातील नोकरी अर्ज (Job Candidate Applications)
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    स्थानिक कंपन्यांकडे Connect Maratha द्वारे आलेले थेट उमेदवारांचे अर्ज
                  </p>
                </div>
                <Link
                  to="/jobs"
                  target="_blank"
                  style={{
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '1px solid #FED7AA',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  Jobs Portal उघडा ➔
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', textAlign: 'left', color: '#7C2D12' }}>
                      <th style={{ padding: '10px 12px' }}>अर्ज क्र.</th>
                      <th style={{ padding: '10px 12px' }}>उमेदवाराचे नाव</th>
                      <th style={{ padding: '10px 12px' }}>पद (Job Role)</th>
                      <th style={{ padding: '10px 12px' }}>कंपनी</th>
                      <th style={{ padding: '10px 12px' }}>मोबाईल</th>
                      <th style={{ padding: '10px 12px' }}>शिक्षण / अनुभव</th>
                      <th style={{ padding: '10px 12px' }}>स्थिती (Status)</th>
                      <th style={{ padding: '10px 12px' }}>तारीख</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distApps.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                          या जिल्ह्यासाठी सध्या कोणताही नोकरी अर्ज प्रलंबित नाही.
                        </td>
                      </tr>
                    ) : (
                      distApps.map(app => (
                        <tr key={app.id} style={{ borderBottom: '1px solid #FED7AA' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#C2410C' }}>{app.id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1E293B' }}>{app.applicantName}</td>
                          <td style={{ padding: '10px 12px', color: '#431407', fontWeight: 800 }}>{app.jobTitle}</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>{app.company}</td>
                          <td style={{ padding: '10px 12px', color: '#1E293B', fontFamily: 'monospace' }}>{app.applicantPhone || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#64748B' }}>{app.resumeUrl}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              background: app.status?.includes('Shortlist') ? '#DCFCE7' : '#FEF3C7',
                              color: app.status?.includes('Shortlist') ? '#15803D' : '#92400E',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}>
                              {app.status || 'Applied'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '0.78rem' }}>
                            {new Date(app.appliedAt).toLocaleDateString('mr-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Client Enquiries & B2B Leads in District */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #FED7AA', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#431407', fontFamily: 'Baloo 2', fontWeight: 900 }}>
                    🏢 {selectedDistrict} जिल्ह्यातील ग्राहक Enquiries व B2B व्यावसायिक Leads
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    स्थानिक व्यावसायिकांसाठी उपलब्ध झालेल्या ग्राहक मागण्या व कोटेशन्स
                  </p>
                </div>
                <Link
                  to="/leads"
                  target="_blank"
                  style={{
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '1px solid #FED7AA',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  Leads Portal उघडा ➔
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', textAlign: 'left', color: '#7C2D12' }}>
                      <th style={{ padding: '10px 12px' }}>क्र.</th>
                      <th style={{ padding: '10px 12px' }}>गरजेचे स्वरूप (Requirement)</th>
                      <th style={{ padding: '10px 12px' }}>उद्योग श्रेणी</th>
                      <th style={{ padding: '10px 12px' }}>अंदाजे बजेट</th>
                      <th style={{ padding: '10px 12px' }}>ग्राहक नाव</th>
                      <th style={{ padding: '10px 12px' }}>मोबाईल</th>
                      <th style={{ padding: '10px 12px' }}>कोटेशन्स प्राप्त</th>
                      <th style={{ padding: '10px 12px' }}>स्थिती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distEnqs.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                          या जिल्ह्यात सध्या कोणतीही ग्राहक Enquiry नोंद झालेली नाही.
                        </td>
                      </tr>
                    ) : (
                      distEnqs.map(enq => (
                        <tr key={enq.id} style={{ borderBottom: '1px solid #FED7AA' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#C2410C' }}>{enq.id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1E293B', maxWidth: '240px' }}>{enq.title}</td>
                          <td style={{ padding: '10px 12px', color: '#78350F', fontWeight: 700 }}>{enq.category}</td>
                          <td style={{ padding: '10px 12px', color: '#15803D', fontWeight: 800 }}>{enq.budget || 'चर्चेनुसार'}</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>{enq.clientName || 'सभासद'}</td>
                          <td style={{ padding: '10px 12px', color: '#1E293B', fontFamily: 'monospace' }}>{enq.phone || '-'}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'center' }}>{enq.quotesCount || (enq.quotes ? enq.quotes.length : 0)}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}>
                              ● {enq.status || 'सक्रिय'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
