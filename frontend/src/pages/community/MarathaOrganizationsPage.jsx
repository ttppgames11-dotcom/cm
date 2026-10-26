import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'सर्व संघटना',
  'सामाजिक',
  'शैक्षणिक',
  'युवक',
  'महिला',
  'उद्योग व सहकार',
  'इतिहास व दुर्ग',
  'आरोग्य व रक्तपेढी'
];

const MAHARASHTRA_DISTRICTS = [
  'सर्व जिल्हे',
  'पुणे',
  'मुंबई',
  'ठाणे',
  'छत्रपती संभाजीनगर',
  'कोल्हापूर',
  'सातारा',
  'सांगली',
  'नाशिक',
  'सोलापूर',
  'अमरावती',
  'नागपूर',
  'जळगाव',
  'अहमदनगर',
  'नांदेड',
  'लातूर',
  'बीड',
  'रायगड',
  'रत्नागिरी',
  'सिंधुदुर्ग'
];

export default function MarathaOrganizationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'events' | 'collaborations' | 'crm'
  const [orgs, setOrgs] = useState([]);
  const [selectedCat, setSelectedCat] = useState('सर्व संघटना');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व जिल्हे');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showCollabModal, setShowCollabModal] = useState(null); // org object
  const [showEventModal, setShowEventModal] = useState(null);  // org object
  const [orgDetails, setOrgDetails] = useState(null);

  // CRM State
  const [crmStats, setCrmStats] = useState(null);

  // Forms State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  useEffect(() => {
    loadOrganizations();
    loadCrmStats();
  }, [selectedCat, selectedDistrict, selectedType]);

  const showNotification = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCat !== 'सर्व संघटना') params.category = selectedCat;
      if (selectedDistrict !== 'सर्व जिल्हे') params.district = selectedDistrict;
      if (selectedType !== 'all') params.type = selectedType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await apiClient.getOrganizations(params);
      if (data && Array.isArray(data)) {
        setOrgs(data);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCrmStats = async () => {
    try {
      const stats = await apiClient.getOrgCrmStats();
      if (stats) setCrmStats(stats);
    } catch {}
  };

  const handleOpenOrgDetails = async (org) => {
    setSelectedOrg(org);
    try {
      const res = await apiClient.getOrganizationById(org.id);
      if (res) {
        setOrgDetails(res);
      } else {
        setOrgDetails(org);
      }
    } catch {
      setOrgDetails(org);
    }
  };

  const handleAddOrgSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target);

    try {
      const payload = {
        name: fd.get('name'),
        category: fd.get('category'),
        type: fd.get('type'),
        reg_no: fd.get('reg_no'),
        pan_number: fd.get('pan_number'),
        tax_80g_12a: fd.get('tax_80g_12a'),
        established: fd.get('established'),
        city: fd.get('city'),
        district: fd.get('district'),
        taluka: fd.get('taluka'),
        presence: fd.get('presence'),
        members: fd.get('members'),
        contact: fd.get('contact'),
        email: fd.get('email'),
        website: fd.get('website'),
        president_name: fd.get('president_name'),
        president_phone: fd.get('president_phone'),
        secretary_name: fd.get('secretary_name'),
        focus: fd.get('focus'),
        description: fd.get('description'),
        regDoc: fd.get('regDoc') || 'CHARITY_CERT_UPLOADED.pdf'
      };

      const res = await apiClient.addOrganization(payload);
      setShowAddModal(false);
      showNotification('🚩 आपली संस्था यशस्वीरित्या नोंदवली गेली! पडताळणीनंतर अधिकृत बॅज सक्रिय होईल.');
      loadOrganizations();
      loadCrmStats();
    } catch (err) {
      alert('नोंदणी करताना त्रुटी: ' + (err.message || 'सर्व्हर संपर्क अयशस्वी'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollabSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target);

    try {
      await apiClient.requestOrgCollaboration(showCollabModal.id, {
        requestingOrgName: fd.get('requestingOrgName'),
        initiativeTitle: fd.get('initiativeTitle'),
        proposalSummary: fd.get('proposalSummary'),
        district: fd.get('district'),
        contactPerson: fd.get('contactPerson'),
        contactPhone: fd.get('contactPhone')
      });

      setShowCollabModal(null);
      showNotification(`🚩 ${showCollabModal.name} कडे सहकार्य विनंती यशस्वी पाठवली!`);
      loadCrmStats();
    } catch (err) {
      alert('सहकार्य विनंती त्रुटी: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target);

    try {
      await apiClient.addOrgEvent(showEventModal.id, {
        title: fd.get('title'),
        category: fd.get('category'),
        date: fd.get('date'),
        venue: fd.get('venue'),
        district: fd.get('district'),
        attendees: fd.get('attendees'),
        description: fd.get('description'),
        coordinatorName: fd.get('coordinatorName'),
        coordinatorPhone: fd.get('coordinatorPhone')
      });

      setShowEventModal(null);
      showNotification('🚩 संस्थेचा अधिकृत कार्यक्रम प्रसिद्ध करण्यात आला!');
      loadOrganizations();
      loadCrmStats();
    } catch (err) {
      alert('कार्यक्रम नोंदणी त्रुटी: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyStatus = async (orgId, newStatus) => {
    try {
      await apiClient.updateOrgStatus(orgId, {
        verificationStatus: newStatus,
        isVerified: newStatus.includes('सत्यापित') ? 1 : 0
      });
      showNotification(`संस्था स्थिती अद्ययावत: ${newStatus}`);
      loadOrganizations();
      loadCrmStats();
      if (selectedOrg && selectedOrg.id === orgId) {
        setSelectedOrg(prev => ({ ...prev, verification_status: newStatus, is_verified: newStatus.includes('सत्यापित') ? 1 : 0 }));
      }
    } catch (err) {
      alert('स्थिती बदलताना त्रुटी: ' + err.message);
    }
  };

  // Filter in-memory for instant search
  const filteredOrgs = orgs.filter((org) => {
    const q = searchQuery.toLowerCase();
    return (
      (org.name || '').toLowerCase().includes(q) ||
      (org.hq || '').toLowerCase().includes(q) ||
      (org.district || '').toLowerCase().includes(q) ||
      (org.focus || '').toLowerCase().includes(q) ||
      (org.president_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px', color: '#1E293B', fontFamily: 'inherit' }}>
      
      {/* SUCCESS TOAST */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#065F46',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✓</span> {successToast}
        </div>
      )}

      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #4A0E0E 0%, #8B1414 50%, #B71C1C 100%)',
        color: '#FFFFFF',
        padding: '52px 20px 48px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 12px 30px rgba(74,14,14,0.25)',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-30px', opacity: 0.08, fontSize: '18rem', pointerEvents: 'none' }}>
          🚩
        </div>

        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255, 213, 79, 0.2)',
              border: '1px solid #FFD54F',
              padding: '4px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#FFD54F'
            }}>
              🚩 CONNECT MARATHA — मराठा सामाजिक संस्था व महासंघ निर्देशिका
            </span>
            <span style={{ background: '#10B981', color: '#fff', padding: '4px 14px', borderRadius: '24px', fontSize: '0.82rem', fontWeight: 700 }}>
              ✓ धर्मादाय आयुक्त नोंदणी पडताळणी
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.25 }}>
            महाराष्ट्रभरातील मराठा संस्था, मंडळे व ट्रस्ट एकाच व्यासपीठावर
          </h1>
          <p style={{ fontSize: '1.08rem', color: '#F8FAFC', margin: '0 auto 24px', maxWidth: '780px', lineHeight: 1.6, opacity: 0.95 }}>
            सामाजिक न्याय, आरक्षण पाठपुरावा, शैक्षणिक वसतिगृहे, गडकोट संवर्धन व उद्योजक नेटवर्कसाठी कार्यरत 
            महाराष्ट्रातील अधिकृत नोंदणीकृत शिखर संस्थांची माहिती, पदाधिकारी व संयुक्त उपक्रम.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)',
                color: '#78350F',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.98rem',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
              }}>
              ＋ नवीन संस्था नोंदणी व कागदपत्र सादर करा
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(4px)',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}>
              📊 CRM संस्था ऑडिट व सक्रियता डॅशबोर्ड
            </button>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div style={{ maxWidth: '1240px', margin: '-22px auto 24px', padding: '0 16px', position: 'relative', zIndex: 5 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>नोंदणीकृत संस्था व ट्रस्ट</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#B71C1C', marginTop: '2px' }}>
              {crmStats?.totalOrganizations || orgs.length || 6}+
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>धर्मादाय आयुक्त नोंदणीकृत</div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>सत्यापित अधिकृत संस्था (Verified)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F766E', marginTop: '2px' }}>
              {crmStats?.verifiedOrganizations || 6}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>कागदपत्रे तपासणी पूर्ण</div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>आगामी राज्यव्यापी कार्यक्रम</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
              {crmStats?.totalEvents || 3}+
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>परिषदा, मेळावे व श्रमदान</div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>संयुक्त उपक्रम (Collaborations)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E293B', marginTop: '2px' }}>
              {crmStats?.totalCollabs || 2}+
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>संस्थांमधील परस्पर सहकार्य</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 20px', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'directory', label: '🏛️ संस्था व मंडळे निर्देशिका', count: orgs.length },
            { id: 'events', label: '📅 आगामी कार्यक्रम व मेळावे' },
            { id: 'crm', label: '📊 CRM संस्था पडताळणी व सक्रियता' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '3px solid #B71C1C' : '3px solid transparent',
                color: activeTab === t.id ? '#B71C1C' : '#64748B',
                fontWeight: activeTab === t.id ? 800 : 600,
                fontSize: '1rem',
                padding: '10px 18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: activeTab === t.id ? '#B71C1C' : '#E2E8F0',
                  color: activeTab === t.id ? '#fff' : '#64748B',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ORGANIZATIONS DIRECTORY */}
      {activeTab === 'directory' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          {/* Filters Bar */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="संस्थेचे नाव, पदाधिकारी, उद्दिष्ट किंवा शहर शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
              />

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}>
                <option value="all">सर्व प्रकार (All Types)</option>
                <option value="महासंघ">महासंघ (Federation)</option>
                <option value="ट्रस्ट">नोंदणीकृत ट्रस्ट (Trust)</option>
                <option value="प्रतिष्ठान">मंडळ / प्रतिष्ठान</option>
                <option value="सोसायटी">सोसायटी (Society)</option>
              </select>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: selectedCat === cat ? '1px solid #B71C1C' : '1px solid #E2E8F0',
                    background: selectedCat === cat ? '#B71C1C' : '#F8FAFC',
                    color: selectedCat === cat ? '#fff' : '#475569',
                    fontSize: '0.84rem',
                    fontWeight: selectedCat === cat ? 700 : 500,
                    cursor: 'pointer'
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Organizations Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>संघटना यादी लोड होत आहे...</div>
          ) : filteredOrgs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🏛️</div>
              <h3 style={{ margin: '0 0 6px 0', color: '#1E293B' }}>कोणतीही संस्था सापडली नाही</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>कृपया शोध संज्ञा किंवा फिल्टर्स बदलून पुन्हा प्रयत्न करा.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
              {filteredOrgs.map(org => (
                <div
                  key={org.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '22px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}>
                  <div>
                    {/* Top Row: Category & Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        background: '#FFEBEE',
                        color: '#B71C1C',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {org.category} • {org.type}
                      </span>
                      <span style={{
                        background: org.is_verified ? '#DCFCE7' : '#FEF3C7',
                        color: org.is_verified ? '#166534' : '#92400E',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {org.verification_status || 'सत्यापित (Verified)'}
                      </span>
                    </div>

                    {/* Org Title & Icon */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ fontSize: '2rem', lineHeight: 1 }}>{org.icon || '🚩'}</div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35 }}>
                          {org.name}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          धर्मादाय नोंदणी: <strong>{org.reg_no || 'नोंदणीकृत'}</strong> • स्था: {org.established}
                        </div>
                      </div>
                    </div>

                    {/* Focus Description */}
                    <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      {org.focus}
                    </p>

                    {/* Metadata details */}
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      <div><strong>मुख्यालय / शहर:</strong> {org.hq || org.district}</div>
                      <div><strong>कार्यक्षेत्र:</strong> {org.presence || 'महाराष्ट्र राज्य'}</div>
                      <div><strong>अध्यक्ष / नेतृत्व:</strong> {org.president_name || 'मा. अध्यक्ष'}</div>
                      <div><strong>सक्रियता गुण:</strong> <span style={{ color: '#B71C1C', fontWeight: 800 }}>{org.activity_score || 85}/100</span> (उच्च सक्रिय)</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={() => handleOpenOrgDetails(org)}
                      style={{
                        background: '#F1F5F9',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        padding: '9px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                      🔍 पदाधिकारी व अहवाल
                    </button>
                    <button
                      onClick={() => setShowCollabModal(org)}
                      style={{
                        background: '#B71C1C',
                        color: '#fff',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                      🤝 संयुक्त उपक्रम विनंती
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVENTS & GATHERINGS */}
      {activeTab === 'events' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                🚩 आगामी सामाजिक परिषदा, मेळावे व गड संवर्धन उपक्रम
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                विविध मराठा संघटना व मंडळांद्वारे आयोजित राज्यस्तरीय जाहीर कार्यक्रम.
              </p>
            </div>
            {orgs.length > 0 && (
              <button
                onClick={() => setShowEventModal(orgs[0])}
                style={{
                  background: '#B71C1C',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                ＋ नवीन कार्यक्रम जोडा
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {[
              {
                title: 'राज्यव्यापी मराठा विचारमंथन परिषद २०२६',
                org_name: 'अखिल भारतीय मराठा महासंघ',
                category: 'सामाजिक परिषद',
                date: '२०२६-११-१५',
                venue: 'यशवंतराव चव्हाण प्रतिष्ठान सभागृह, नरिमन पॉईंट, मुंबई',
                attendees: '१,५००+ प्रतिनिधी',
                desc: 'उच्च शिक्षण, व्यावसायिक आरक्षण आणि उद्योजकता विकासासाठी राज्यभरातील प्रतिनिधींची शिखर परिषद.',
                coordinator: 'राजेंद्र कोंढरे (9822055667)'
              },
              {
                title: 'दुर्गराज रायगड महादरवाजा श्रमदान व स्वच्छता मोहीम',
                org_name: 'सह्याद्री प्रतिष्ठान',
                category: 'दुर्ग संवर्धन',
                date: '२०२६-१०-२६',
                venue: 'किल्ले रायगड महादरवाजा परिसर',
                attendees: '५००+ मावळे',
                desc: 'तटबंदी स्वच्छता, ऐतिहासिक पायऱ्यांची डागडूजी आणि प्लास्टिक मुक्ती अभियान.',
                coordinator: 'गणेश कदम (9822044556)'
              },
              {
                title: 'मराठा नवउद्योजक B2B एक्सपो व निधी सहाय्य परिषद',
                org_name: 'मराठा चेंबर ऑफ कॉमर्स (MCCIA)',
                category: 'मेळावा',
                date: '२०२६-१२-०५',
                venue: 'ऑटो क्लस्टर एक्झिबिशन सेंटर, चिंचवड, पुणे',
                attendees: '३,०००+ उद्योजक',
                desc: 'कृषी प्रक्रिया उद्योग, आयटी स्टार्टअप्स आणि मॅन्युफॅक्चरिंग उद्योगांसाठी व्हेंचर कॅपिटल गुंतवणूकदार परिषद.',
                coordinator: 'विक्रमसिंह शिंदे (9822090001)'
              }
            ].map((evt, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '22px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                    {evt.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B71C1C' }}>
                    📅 {evt.date}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0F172A' }}>{evt.title}</h3>
                <div style={{ fontSize: '0.82rem', color: '#B71C1C', fontWeight: 600, marginBottom: '10px' }}>
                  आयोजक: {evt.org_name}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  {evt.desc}
                </p>

                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
                  <div><strong>स्थळ:</strong> {evt.venue}</div>
                  <div><strong>अपेक्षित उपस्थिती:</strong> {evt.attendees}</div>
                  <div><strong>समन्वयक:</strong> {evt.coordinator}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CRM AUDIT & GOVERNANCE */}
      {activeTab === 'crm' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
              📊 CRM संस्था सनियंत्रण, पडताळणी व सक्रियता तालिका
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>संस्थेचे नाव</th>
                    <th style={{ padding: '12px' }}>जिल्हा / प्रकार</th>
                    <th style={{ padding: '12px' }}>धर्मादाय नोंदणी क्र.</th>
                    <th style={{ padding: '12px' }}>सक्रियता गुण</th>
                    <th style={{ padding: '12px' }}>पडताळणी स्थिती</th>
                    <th style={{ padding: '12px' }}>प्रशासकीय कृती (Admin Action)</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A' }}>{o.name}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{o.district} • {o.category}</td>
                      <td style={{ padding: '12px', color: '#64748B' }}>{o.reg_no || 'नोंदणीकृत'}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#B71C1C' }}>{o.activity_score || 85}%</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: o.is_verified ? '#DCFCE7' : '#FEF3C7',
                          color: o.is_verified ? '#166534' : '#92400E',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}>
                          {o.verification_status || 'सत्यापित (Verified)'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleVerifyStatus(o.id, 'सत्यापित (Verified)')}
                            style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}>
                            ✓ मान्यता द्या
                          </button>
                          <button
                            onClick={() => handleVerifyStatus(o.id, 'कागदपत्रे अपूर्ण')}
                            style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                            ⚠️ अपूर्ण
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ORG DETAILS (Office Bearers, Events, Reports) */}
      {selectedOrg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '26px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedOrg(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedOrg.icon || '🚩'}</span>
              <div>
                <h2 style={{ color: '#B71C1C', margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800 }}>{selectedOrg.name}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                    {selectedOrg.category} • {selectedOrg.type}
                  </span>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                    धर्मादाय क्र: {selectedOrg.reg_no || 'MAH/PUN/F-1234'}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>
              {selectedOrg.description || selectedOrg.focus}
            </p>

            {/* Office Bearers Table */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              👥 अधिकृत पदाधिकारी व कार्यकारिणी (Office Bearers)
            </h4>
            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px', marginBottom: '18px' }}>
              {orgDetails?.office_bearers && orgDetails.office_bearers.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {orgDetails.office_bearers.map((b, i) => (
                    <div key={i} style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.84rem' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{b.name}</div>
                      <div style={{ color: '#B71C1C', fontWeight: 700, fontSize: '0.78rem' }}>{b.designation}</div>
                      <div style={{ color: '#64748B', fontSize: '0.78rem' }}>📞 {b.phone}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  अध्यक्ष: <strong>{selectedOrg.president_name}</strong> • संपर्क: {selectedOrg.contact}
                </div>
              )}
            </div>

            {/* Work Reports */}
            {orgDetails?.work_reports && orgDetails.work_reports.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  📜 वार्षिक कार्य अहवाल (Annual Work Report)
                </h4>
                {orgDetails.work_reports.map((r, i) => (
                  <div key={i} style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>वर्ष {r.report_year}: {r.title}</div>
                    <div style={{ color: '#475569', marginTop: '2px' }}>{r.summary}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedOrg(null)}
                style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                बंद करा
              </button>
              <button
                onClick={() => {
                  setShowCollabModal(selectedOrg);
                  setSelectedOrg(null);
                }}
                style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                🤝 संयुक्त उपक्रम प्रस्ताव पाठवा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW ORGANIZATION */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 6px' }}>
              🚩 नवीन मराठा संस्था / मंडळ नोंदणी अर्ज
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 18px' }}>
              आपल्या संस्थेचा अधिकृत धर्मादाय नोंदणी क्रमांक व कागदपत्रांसह माहिती सादर करा.
            </p>

            <form onSubmit={handleAddOrgSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>संस्थेचे पूर्ण नाव *</label>
                  <input name="name" required placeholder="उदा. सह्याद्री मित्र गड संवर्धन प्रतिष्ठान" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>कार्यक्षेत्र प्रकार *</label>
                    <select name="category" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      {CATEGORIES.filter(c => c !== 'सर्व संघटना').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>संस्था स्वरूप *</label>
                    <select name="type" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      <option value="नोंदणीकृत ट्रस्ट (Trust)">नोंदणीकृत ट्रस्ट (Trust)</option>
                      <option value="सोसायटी (Society)">सोसायटी (Society)</option>
                      <option value="मंडळ / प्रतिष्ठान (Foundation)">मंडळ / प्रतिष्ठान (Foundation)</option>
                      <option value="महासंघ (Federation)">महासंघ (Federation)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>धर्मादाय नोंदणी क्र. (Charity Reg No)</label>
                    <input name="reg_no" placeholder="MAH/PUN/F-1234/2026" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>स्थापना वर्ष</label>
                    <input name="established" placeholder="उदा. २०१०" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा *</label>
                    <select name="district" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व जिल्हे').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>तालुका / शहर</label>
                    <input name="taluka" placeholder="उदा. हवेली / महाड" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>अध्यक्षांचे नाव *</label>
                    <input name="president_name" required placeholder="उदा. संभाजीराव कदम" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>अधिकृत मोबाईल नंबर *</label>
                    <input name="contact" required type="tel" placeholder="9822000000" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>मुख्य उद्दिष्ट व कार्यक्षेत्र *</label>
                  <textarea name="focus" required placeholder="संस्थेचे मुख्य उद्दिष्ट, समाजोपयोगी उपक्रम..." rows="2" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }}></textarea>
                </div>

                <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '0.8rem', color: '#92400E' }}>
                  📎 <strong>कागदपत्र पडताळणी:</strong> नोंदणीनंतर धर्मादाय आयुक्त प्रमाणपत्र (Trust Registration Certificate) व कार्यकारिणी यादी अपलोड करणे अनिवार्य राहील.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: '#B71C1C',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                  {isSubmitting ? 'नोंदणी होत आहे...' : '🚩 संस्था नोंदणी सादर करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COLLABORATION REQUEST */}
      {showCollabModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '26px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCollabModal(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 6px' }}>
              🤝 संयुक्त उपक्रम प्रस्ताव (Collaboration Request)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 16px' }}>
              लक्ष्य संस्था: <strong>{showCollabModal.name}</strong>
            </p>

            <form onSubmit={handleCollabSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>आपल्या संस्थेचे नाव *</label>
                  <input name="requestingOrgName" required placeholder="उदा. मराठा युवा मंच" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>संयुक्त उपक्रमाचे नाव / शीर्षक *</label>
                  <input name="initiativeTitle" required placeholder="उदा. राज्यस्तरीय मराठा करिअर मार्गदर्शन व रोजगार मेळावा" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>प्रस्ताव सारांश व अपेक्षित सहकार्य *</label>
                  <textarea name="proposalSummary" required placeholder="दोन्ही संस्था मिळून काय साध्य करणार? तारीख व जागा..." rows="3" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>समन्वयक नाव *</label>
                    <input name="contactPerson" required placeholder="आपले नाव" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>मोबाईल नंबर *</label>
                    <input name="contactPhone" required type="tel" placeholder="9822000000" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <input type="hidden" name="district" value={showCollabModal.district || 'पुणे'} />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#B71C1C',
                    color: '#fff',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                  {isSubmitting ? 'पाठवत आहे...' : '🤝 अधिकृत प्रस्ताव सादर करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD EVENT MODAL */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '26px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowEventModal(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 6px' }}>
              📅 संस्थेचा नवीन कार्यक्रम प्रसिद्ध करा
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 16px' }}>
              संस्था: <strong>{showEventModal.name}</strong>
            </p>

            <form onSubmit={handleEventSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>कार्यक्रमाचे नाव *</label>
                  <input name="title" required placeholder="उदा. राज्यस्तरीय मराठा विचारमंथन परिषद" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>कार्यक्रम प्रकार</label>
                    <select name="category" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      <option value="सामाजिक परिषद">सामाजिक परिषद</option>
                      <option value="मेळावा">मेळावा</option>
                      <option value="रक्तदान शिबिर">रक्तदान शिबिर</option>
                      <option value="दुर्ग संवर्धन">दुर्ग संवर्धन</option>
                      <option value="व्याख्यानमाला">व्याख्यानमाला</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>दिनांक *</label>
                    <input name="date" required type="date" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>स्थळ व पत्ता *</label>
                  <input name="venue" required placeholder="सभागृह, शहर किंवा किल्ला परिसर" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>समन्वयक नाव</label>
                    <input name="coordinatorName" placeholder="नाव" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>मोबाईल नंबर</label>
                    <input name="coordinatorPhone" type="tel" placeholder="9822000000" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <input type="hidden" name="district" value={showEventModal.district || 'पुणे'} />
                <input type="hidden" name="attendees" value="500" />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#B71C1C',
                    color: '#fff',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                  {isSubmitting ? 'नोंद होत आहे...' : '🚩 कार्यक्रम प्रसिद्ध करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
