import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EMERGENCY_CATEGORIES = [
  { id: 'all', label: 'सर्व आणीबाणी', icon: '🚨' },
  { id: 'medical', label: 'वैद्यकीय मदत', icon: '🩺' },
  { id: 'blood', label: 'रक्त SOS', icon: '🩸' },
  { id: 'accident', label: 'अपघात व रस्ता मदत', icon: '🚗' },
  { id: 'disaster', label: 'पूर, आग व आपत्ती', icon: '🌊' },
  { id: 'personal_safety', label: 'वैयक्तिक सुरक्षा', icon: '🛡️' },
  { id: 'missing_person', label: 'बेपत्ता व्यक्ती शोध', icon: '🔍' },
];

const MAHARASHTRA_DISTRICTS = [
  'सर्व', 'पुणे', 'मुंबई', 'ठाणे', 'नाशिक', 'छत्रपती संभाजीनगर', 'कोल्हापूर', 'सातारा', 'सांगली',
  'सोलापूर', 'नागपूर', 'अमरावती', 'नांदेड', 'जळगाव', 'अहमदनगर', 'लातूर', 'रत्नागिरी', 'सिंधुदुर्ग'
];

export default function EmergencyAlertNetworkPage() {
  const { user } = useAuth();

  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(null);
  const [showFlagModal, setShowFlagModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Report Form State
  const [reportForm, setReportForm] = useState({
    title: '',
    category: 'medical',
    severity: 'high',
    description: '',
    location: '',
    city: 'पुणे',
    district: 'पुणे',
    landmark: '',
    reporterName: user?.name || '',
    reporterPhone: user?.phone || '',
    isAnonymous: false,
    officialServicesContacted: false,
    reportingFor: 'self',
    peopleAffected: 1,
    photoUrl: ''
  });

  // Response Form State
  const [respondForm, setRespondForm] = useState({
    responderName: user?.name || '',
    responderPhone: user?.phone || '',
    etaMinutes: 30,
    capabilities: 'प्रत्यक्ष उपस्थिती व साहाय्य',
    message: 'मी मदतीसाठी तात्काळ निघत आहे.'
  });

  // Report Inaccuracy State
  const [flagForm, setFlagForm] = useState({
    reason: 'चुकीची किंवा दिशाभूल करणारी माहिती',
    details: ''
  });

  useEffect(() => {
    loadEmergencies();
  }, [selectedCategory, selectedDistrict]);

  const loadEmergencies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDistrict !== 'सर्व') params.district = selectedDistrict;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.emergency.getEmergencies(params);
      const list = res?.data?.emergencies || res?.emergencies || [];
      setEmergencies(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading emergencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEmergencies();
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.description.trim() || !reportForm.location.trim()) {
      alert('कृपया घटनेचे ठिकाण आणि मदतीचे वर्णन लिहा.');
      return;
    }
    setSubmitting(true);
    try {
      await api.emergency.reportEmergency(reportForm);
      alert('🚨 आपत्कालीन अलर्ट यशस्वीरीत्या नोंदवला गेला! नजीकच्या समन्वयकांना सतर्क केले जात आहे.');
      setShowReportModal(false);
      setReportForm({
        title: '',
        category: 'medical',
        severity: 'high',
        description: '',
        location: '',
        city: 'पुणे',
        district: 'पुणे',
        landmark: '',
        reporterName: user?.name || '',
        reporterPhone: user?.phone || '',
        isAnonymous: false,
        officialServicesContacted: false,
        reportingFor: 'self',
        peopleAffected: 1,
        photoUrl: ''
      });
      loadEmergencies();
    } catch (err) {
      alert(err.message || 'अलर्ट नोंदवताना त्रुटी उद्भवली.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    if (!respondForm.responderPhone.trim()) {
      alert('कृपया आपला संपर्क नंबर प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      await api.emergency.respondToEmergency(showRespondModal.id, respondForm);
      alert('❤️ मदतीसाठी पुढे आल्याबद्दल धन्यवाद! समन्वय कक्ष व कुटुंबियांना आपल्या प्रतिसादाची नोंद पोहोचवली आहे.');
      setShowRespondModal(null);
      loadEmergencies();
    } catch (err) {
      alert(err.message || 'प्रतिसाद नोंदवताना त्रुटी.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.emergency.reportContent(showFlagModal.id, {
        contentType: 'emergency',
        reason: flagForm.reason,
        details: flagForm.details
      });
      alert('आपली तक्रार प्राप्त झाली आहे. समन्वय कक्ष याची तात्काळ पडताळणी करेल.');
      setShowFlagModal(null);
    } catch (err) {
      alert(err.message || 'तक्रार नोंदवताना त्रुटी.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, verified) => {
    if (status === 'resolved') {
      return <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>🏁 निवारण झाले (Resolved)</span>;
    }
    if (status === 'responders_assigned') {
      return <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>🏃 मदत सुरू (Responders Assigned)</span>;
    }
    if (verified || status === 'verified') {
      return <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>✅ सत्यापित (Verified)</span>;
    }
    if (status === 'under_review') {
      return <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>⏳ पडताळणी सुरू (Under Review)</span>;
    }
    return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>📢 प्रविष्ट (Reported)</span>;
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') {
      return <span style={{ background: '#B91C1C', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>🔥 अत्यंत तातडीचे (Critical)</span>;
    }
    if (severity === 'high') {
      return <span style={{ background: '#EA580C', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>⚡ उच्च प्राधान्य (High)</span>;
    }
    return <span style={{ background: '#F59E0B', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>⚠️ मध्यम (Moderate)</span>;
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* 1. Official Emergency Safety Guidance Banner */}
      <div style={{ background: '#991B1B', color: '#FFFFFF', padding: '12px 20px', textAlign: 'center', fontSize: '0.92rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span>🚨 <strong>तातडीची सूचना:</strong> जीव धोक्यात असल्यास किंवा तात्काळ पोलीस/रुग्णवाहिका मदतीची गरज असल्यास प्रथम अधिकृत शासकीय आपत्कालीन हेल्पलाईन <strong>११२ (किंवा १०८ रुग्णवाहिका)</strong> वर त्वरित कॉल करा.</span>
          <a href="tel:112" style={{ background: '#FFFFFF', color: '#991B1B', padding: '3px 12px', borderRadius: '20px', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>📞 कॉल ११२</a>
          <a href="tel:108" style={{ background: '#FFFFFF', color: '#991B1B', padding: '3px 12px', borderRadius: '20px', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>🚑 कॉल १०८</a>
        </div>
      </div>

      {/* 2. Page Header & Seva Hub Navigation */}
      <div style={{ background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 50%, #EA580C 100%)', color: '#fff', padding: '40px 20px 50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>🚩 कनेक्ट मराठा सेवा नेटवर्क</span>
                <span>•</span>
                <span>आपत्कालीन प्रतिसाद प्रणाली</span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '4px 0 8px', letterSpacing: '0.5px' }}>
                🚨 आपत्कालीन मदत व सतर्कता नेटवर्क
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.02rem', maxWidth: '750px', lineHeight: 1.5 }}>
                स्थानिक संकट, अपघात, पूर, रक्त गरज किंवा तात्काळ मदतीसाठी जवळच्या मराठा बांधवांना व स्वयंसेवक पथकांना जोडणारे अधिकृत व्यासपीठ.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: '2px solid #FEE2E2',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.2s'
                }}>
                <span>🚨</span>
                <span>अलर्ट नोंदवा (Report Emergency)</span>
              </button>

              <Link
                to="/seva/help-requests"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>🤝</span>
                <span>समाज मदत मागण्या</span>
              </Link>
            </div>
          </div>

          {/* Connected Seva Module Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Link to="/emergency" style={{ background: '#FFFFFF', color: '#7C2D12', padding: '6px 14px', borderRadius: '16px', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
              🚨 १. आपत्कालीन अलर्ट
            </Link>
            <Link to="/seva/help-requests" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🤝 २. मदत विनंत्या व साहाय्य
            </Link>
            <Link to="/community/services" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🛠️ ३. सेवा देवाणघेवाण (Exchange)
            </Link>
            <Link to="/blood" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🩸 ४. २४×७ रक्त SOS
            </Link>
            {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'ceo' || user?.role === 'district_admin') && (
              <Link to="/crm/seva/emergency" style={{ background: '#FDE68A', color: '#92400E', padding: '6px 14px', borderRadius: '16px', fontWeight: 900, fontSize: '0.82rem', textDecoration: 'none', marginLeft: 'auto' }}>
                🛡️ सेवा कमांड सेंटर (CRM)
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 3. Main Content Container */}
      <div style={{ maxWidth: '1200px', margin: '-24px auto 0', padding: '0 16px' }}>

        {/* Filter Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
          
          {/* Categories Horizontal Scroll */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
            {EMERGENCY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? '#7C2D12' : '#F8FAFC',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#334155',
                  border: selectedCategory === cat.id ? '1.5px solid #7C2D12' : '1px solid #E2E8F0',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Geographic & Text Search Filters */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>📍 जिल्हा:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '2 1 320px' }}>
              <input
                type="text"
                placeholder="स्थान किंवा घटनेचा शोध घ्या (उदा. खेड-शिवापूर, पूर)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
              />
              <button
                type="submit"
                style={{ background: '#EA580C', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                शोध 🔍
              </button>
            </div>
          </form>

        </div>

        {/* Emergencies Alert Cards Grid */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            सक्रिय स्थानिक आणीबाणी अलर्ट्स ({emergencies.length})
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            🔄 रिअल-टाइम डेटाबेस कनेक्टेड
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
            <div>जवळचे आपत्कालीन अलर्ट्स लोड होत आहेत...</div>
          </div>
        ) : emergencies.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
            <h3 style={{ margin: '0 0 6px', color: '#1E293B' }}>निवडलेल्या भागात सध्या कोणतीही सक्रिय आणीबाणी नाही.</h3>
            <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto 20px' }}>
              सर्व बांधव सुरक्षित आहेत. कोणतीही तातडीची घटना घडल्यास त्वरित अलर्ट प्रविष्ट करा.
            </p>
            <button
              onClick={() => setShowReportModal(true)}
              style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 800, cursor: 'pointer' }}>
              🚨 नवीन अलर्ट नोंदवा
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {emergencies.map(emg => (
              <div
                key={emg.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  border: emg.severity === 'critical' ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
                  boxShadow: emg.severity === 'critical' ? '0 8px 24px rgba(239,68,68,0.12)' : '0 4px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {getSeverityBadge(emg.severity)}
                      {getStatusBadge(emg.status, emg.verified)}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                      {new Date(emg.created_at || Date.now()).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {emg.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {emg.description}
                  </p>

                  {/* Location & Context Tags */}
                  <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', color: '#475569', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>📍 <strong>स्थान:</strong> {emg.location}, {emg.city} ({emg.district})</div>
                    {emg.landmark && <div>🏛️ <strong>खूण (Landmark):</strong> {emg.landmark}</div>}
                    <div>👥 <strong>प्रभावित व्यक्ती:</strong> {emg.people_affected || 1} • {emg.official_services_contacted ? '✅ शासकीय मदत (११२/१०८) पाचारण केली आहे' : '⚠️ शासकीय मदतीची वाट पाहत आहे'}</div>
                    <div>👤 <strong>नोंदणीकर्ता:</strong> {emg.reporter_name} ({emg.reporter_phone || 'गोपनीय'})</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => setShowRespondModal(emg)}
                    style={{
                      flex: 1,
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                    <span>🤝</span>
                    <span>मी मदत करू शकतो (I Can Help)</span>
                  </button>

                  <button
                    onClick={() => setShowFlagModal(emg)}
                    style={{
                      background: '#F1F5F9',
                      color: '#64748B',
                      border: '1px solid #CBD5E1',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                    title="माहिती चुकीची किंवा दिशाभूल करणारी असल्यास तक्रार करा">
                    🚩
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* 4. Report Emergency Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#991B1B' }}>
                🚨 आपत्कालीन अलर्ट नोंदवा (Report Emergency)
              </h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#991B1B', marginBottom: '16px', lineHeight: 1.5 }}>
              ⚠️ <strong>लक्षात ठेवा:</strong> हा फॉर्म तणावाच्या वेळी तत्परतेने वापरण्यासाठी आहे. जर परिस्थिती त्वरित जीवघेणी असेल तर आधी <strong>११२ किंवा १०८</strong> वर कॉल करा.
            </div>

            <form onSubmit={handleReportSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आणीबाणी प्रकार *</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                  <option value="medical">🩺 वैद्यकीय आणीबाणी (Medical Emergency)</option>
                  <option value="blood">🩸 तातडीचे रक्त (Blood SOS)</option>
                  <option value="accident">🚗 रस्ता अपघात (Road Accident / Hazard)</option>
                  <option value="disaster">🌊 पूर, आग व नैसर्गिक आपत्ती (Fire/Flood/Disaster)</option>
                  <option value="personal_safety">🛡️ वैयक्तिक सुरक्षा (Personal Safety)</option>
                  <option value="missing_person">🔍 बेपत्ता व्यक्ती शोध (Missing Person)</option>
                  <option value="other">⚠️ इतर तातडीची मदत (Other Urgent Help)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>काय घडले आहे व कोणती मदत हवी आहे? *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="उदा. २ वाहनांचा अपघात, रुग्णालयात रक्त हवे आहे, किंवा घरात पाणी शिरले असून बोटीची गरज आहे..."
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा *</label>
                  <select
                    value={reportForm.district}
                    onChange={(e) => setReportForm({ ...reportForm, district: e.target.value, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                    {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>शहर / तालुका *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. पुणे शहर, हवेली"
                    value={reportForm.city}
                    onChange={(e) => setReportForm({ ...reportForm, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>अचूक परिसर / रस्ता / खूण *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. खेड-शिवापूर टोलनाक्याजवळ, पुणे-सातारा हायवे"
                  value={reportForm.location}
                  onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपला संपर्क क्रमांक *</label>
                  <input
                    type="tel"
                    required
                    placeholder="१० अंकी मोबाईल नंबर"
                    value={reportForm.reporterPhone}
                    onChange={(e) => setReportForm({ ...reportForm, reporterPhone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>प्राधान्य / तीव्रता</label>
                  <select
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                    <option value="critical">अत्यंत तातडीचे (Critical)</option>
                    <option value="high">उच्च (High)</option>
                    <option value="moderate">मध्यम (Moderate)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportForm.officialServicesContacted}
                    onChange={(e) => setReportForm({ ...reportForm, officialServicesContacted: e.target.checked })}
                  />
                  <span>मी अधिकृत शासकीय हेल्पलाइन (११२/१०८/१०१) ला आधीच कॉल केला आहे.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportForm.isAnonymous}
                    onChange={(e) => setReportForm({ ...reportForm, isAnonymous: e.target.checked })}
                  />
                  <span>माझे नाव सार्वजनिकपणे गुप्त ठेवा (केवळ अधिकृत समन्वयकांना दिसेल).</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'अलर्ट पाठवत आहे...' : '🚨 तात्काळ अलर्ट प्रसारित करा (Broadcast Alert)'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 5. "I Can Help" Modal */}
      {showRespondModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#166534' }}>
                🤝 मी मदत करू शकतो (Offer Assistance)
              </h3>
              <button onClick={() => setShowRespondModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
              आपत्कालीन संदर्भ: <strong>{showRespondModal.title}</strong> ({showRespondModal.location}, {showRespondModal.city})
            </p>

            <form onSubmit={handleRespondSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपले नाव *</label>
                <input
                  type="text"
                  required
                  value={respondForm.responderName}
                  onChange={(e) => setRespondForm({ ...respondForm, responderName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपला थेट संपर्क नंबर *</label>
                <input
                  type="tel"
                  required
                  placeholder="१० अंकी नंबर"
                  value={respondForm.responderPhone}
                  onChange={(e) => setRespondForm({ ...respondForm, responderPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>घटनास्थळी पोहोचण्यासाठी लागणारा वेळ (ETA)</label>
                <select
                  value={respondForm.etaMinutes}
                  onChange={(e) => setRespondForm({ ...respondForm, etaMinutes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                  <option value={15}>१५ मिनिटे (खूप जवळ)</option>
                  <option value={30}>३० मिनिटे</option>
                  <option value={45}>४५ मिनिटे</option>
                  <option value={60}>१ तास</option>
                  <option value={120}>२ तास</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>कशा प्रकारची मदत करू शकता? संदेश</label>
                <textarea
                  rows="2"
                  value={respondForm.message}
                  onChange={(e) => setRespondForm({ ...respondForm, message: e.target.value })}
                  placeholder="उदा. माझ्याकडे वाहन उपलब्ध आहे, किंवा मी प्रथमोपचार करू शकतो..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: '#16A34A',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'नोंद होत आहे...' : '✅ मदतीची तयारी निश्चित करा'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 6. Flag Inaccuracy Modal */}
      {showFlagModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '450px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#DC2626' }}>
                🚩 तक्रार किंवा दिशाभूल करणारी माहिती
              </h3>
              <button onClick={() => setShowFlagModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleFlagSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>तक्रारीचे कारण *</label>
                <select
                  value={flagForm.reason}
                  onChange={(e) => setFlagForm({ ...flagForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                  <option value="खोटी किंवा दिशाभूल करणारी घटना">खोटी किंवा दिशाभूल करणारी घटना</option>
                  <option value="जुनी / आधीच निवारण झालेली घटना">जुनी / आधीच निवारण झालेली घटना</option>
                  <option value="चुकीचा पत्ता किंवा संपर्क">चुकीचा पत्ता किंवा संपर्क</option>
                  <option value="फसवणूक किंवा स्पॅम">फसवणूक किंवा स्पॅम</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>अधिक माहिती (पर्यायी)</label>
                <textarea
                  rows="3"
                  value={flagForm.details}
                  onChange={(e) => setFlagForm({ ...flagForm, details: e.target.value })}
                  placeholder="तपशील लिहा..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{ width: '100%', background: '#DC2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                तक्रार सबमिट करा
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
