import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function MatrimonyPortalPage() {
  const [profilesList, setProfilesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my_profile', 'interests'
  
  // Search & Filter State
  const [genderFilter, setGenderFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [kulFilter, setKulFilter] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingProfile, setReportingProfile] = useState(null);

  // Forms
  const [regForm, setRegForm] = useState({
    name: '',
    gender: 'वर (Groom)',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    age: '',
    height: "5' 8\"",
    caste: '९६ कुळी मराठा',
    kul: '',
    gotra: '',
    devak: '',
    rashi: '',
    nakshatra: '',
    mangal: 'नाही',
    education: '',
    profession: '',
    company: '',
    income: '',
    city: 'पुणे',
    district: 'पुणे',
    taluka: '',
    nativePlace: '',
    fatherName: '',
    fatherOccupation: '',
    motherMaherKul: '',
    mamaKul: '',
    siblingsInfo: '',
    expectations: '',
    about: '',
    phone: '',
    photo: ''
  });

  const [interestForm, setInterestForm] = useState({
    relation: 'स्वतः / पालक',
    phone: '',
    message: 'आम्हाला आपल्या बायो-डाटा मध्ये आवड आहे. कृपया पसंती स्वीकारून संपर्क साधावा.'
  });

  const [reportForm, setReportForm] = useState({
    reason: 'चुकीची किंवा दिशाभूल करणारी माहिती',
    details: ''
  });

  // User's own data
  const [myProfiles, setMyProfiles] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadProfiles = () => {
    setLoading(true);
    const params = {};
    if (genderFilter !== 'all') params.gender = genderFilter;
    if (professionFilter !== 'all') params.profession = professionFilter;
    if (districtFilter !== 'all') params.district = districtFilter;
    if (kulFilter) params.kul = kulFilter;
    if (minAge) params.minAge = minAge;
    if (maxAge) params.maxAge = maxAge;
    if (searchQuery) params.search = searchQuery;

    apiClient.getMatrimonyProfiles(params)
      .then(profs => {
        setProfilesList(Array.isArray(profs) ? profs : []);
        setLoading(false);
      })
      .catch(() => {
        setProfilesList([]);
        setLoading(false);
      });
  };

  const loadMyData = () => {
    apiClient.getMyMatrimony()
      .then(data => {
        if (data) {
          setMyProfiles(data.profiles || []);
          setSentInterests(data.sentInterests || []);
          setReceivedInterests(data.receivedInterests || []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProfiles();
  }, [genderFilter, professionFilter, districtFilter]);

  useEffect(() => {
    loadMyData();
  }, [activeTab]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.addMatrimonyProfile(regForm);
      showToast(res.message || '💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!');
      setIsRegisterModalOpen(false);
      loadProfiles();
      loadMyData();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  const handleSendInterest = async (e) => {
    e.preventDefault();
    if (!selectedProfile) return;
    try {
      const res = await apiClient.sendMatrimonyInterest(selectedProfile.id, interestForm);
      showToast(res.message || '❤️ पसंती विनंती यशस्वीरीत्या पाठवली!');
      setIsInterestModalOpen(false);
      setSelectedProfile(null);
      loadMyData();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  const handleRespondInterest = async (interestId, action) => {
    try {
      const res = await apiClient.respondToMatrimonyInterest(interestId, action);
      showToast(res.message || 'स्थिती अद्ययावत केली.');
      loadMyData();
      loadProfiles();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportingProfile) return;
    try {
      const res = await apiClient.reportMatrimonyProfile(reportingProfile.id, reportForm);
      showToast(res.message || 'तक्रार नोंदवण्यात आली आहे. विवाह समिती तपास करेल.');
      setIsReportModalOpen(false);
      setReportingProfile(null);
      setReportForm({ reason: 'चुकीची किंवा दिशाभूल करणारी माहिती', details: '' });
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  return (
    <div style={{ background: '#fdf8f6', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#7c2d12',
          color: '#ffedd5',
          border: '1.5px solid #ea580c',
          padding: '12px 22px',
          borderRadius: '12px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
          zIndex: 99999,
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Hero Banner with Authentic Maratha Ceremony Visual */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1240px',
        margin: '1.25rem auto 0',
        padding: '0 1rem'
      }}>
        <div style={{
          width: '100%',
          height: 'clamp(260px, 34vw, 400px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 16px 36px -10px rgba(0,0,0,0.18)',
          border: '2px solid rgba(254, 215, 170, 0.8)',
          position: 'relative'
        }}>
          <img
            src="/assets/images/generated/maratha_matrimony_hero.jpg"
            alt="अखंड मराठा रेशीमगाठ विवाह सोहळा"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'cover',
              objectPosition: 'center 22%'
            }}
          />
        </div>
      </div>

      {/* Main Header & Tab Navigation */}
      <div style={{ maxWidth: '1150px', margin: '2rem auto 1.5rem', padding: '0 1.25rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFF7ED',
          border: '1.5px solid #FFEDD5',
          color: '#C2410C',
          padding: '0.45rem 1.4rem',
          borderRadius: '999px',
          fontSize: '0.92rem',
          fontWeight: 800,
          marginBottom: '0.8rem',
          boxShadow: '0 2px 8px rgba(194, 65, 12, 0.08)'
        }}>
          <span>💍</span>
          <span>९६ कुळी मराठा वधू-वर सूचक केंद्र | Maratha Matrimony</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)',
          fontWeight: 900,
          margin: '0.2rem 0 0.8rem',
          fontFamily: 'Baloo 2, sans-serif',
          color: '#7C2D12',
          lineHeight: 1.25
        }}>
          कुलीन घराणी, सुशिक्षित स्थळे — अखंड मराठा रेशीमगाठ
        </h1>

        <p style={{
          fontSize: '1.1rem',
          fontWeight: 500,
          color: '#4B5563',
          maxWidth: '820px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.6
        }}>
          मराठा समाजातील उच्चशिक्षित, शासकीय सेवेतील, व्यावसायिक आणि कृषी उद्योजक वधू-वरांसाठी विश्वासाचे, गोपनीय व सन्मानाचे व्यासपीठ.
        </p>

        {/* Portal Control Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('browse')}
            style={{
              background: activeTab === 'browse' ? '#9a3412' : '#fff',
              color: activeTab === 'browse' ? '#fff' : '#7c2d12',
              border: '1.5px solid #fed7aa',
              padding: '0.65rem 1.4rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔍 स्थळे शोधा (Browse Profiles)
          </button>

          <button
            onClick={() => setActiveTab('interests')}
            style={{
              background: activeTab === 'interests' ? '#9a3412' : '#fff',
              color: activeTab === 'interests' ? '#fff' : '#7c2d12',
              border: '1.5px solid #fed7aa',
              padding: '0.65rem 1.4rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💌 पसंती व संपर्क विनंत्या ({receivedInterests.length})
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            + नवीन वधू-वर नोंदणी करा
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE PROFILES */}
      {activeTab === 'browse' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
          
          {/* Advanced Search & Filter Box */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1.5px solid #fed7aa',
            marginBottom: '2rem',
            boxShadow: '0 4px 15px -2px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#7c2d12', marginBottom: '3px' }}>लिंग (Gender)</label>
                <select
                  value={genderFilter}
                  onChange={e => setGenderFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">सर्व (वर व वधू)</option>
                  <option value="वर (Groom)">🤵 वर (Groom)</option>
                  <option value="वधू (Bride)">👰 वधू (Bride)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#7c2d12', marginBottom: '3px' }}>शिक्षण / व्यवसाय</label>
                <select
                  value={professionFilter}
                  onChange={e => setProfessionFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">सर्व क्षेत्रे</option>
                  <option value="Software">Software / IT Engineers</option>
                  <option value="Doctor">Doctor / Medical</option>
                  <option value="CA">CA / Finance / Banking</option>
                  <option value="शासकीय">शासकीय सेवा / MPSC / UPSC</option>
                  <option value="उद्योजक">उद्योजक / Business</option>
                  <option value="कृषी">कृषी / शेती पूरक</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#7c2d12', marginBottom: '3px' }}>जिल्हा (District)</label>
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">सर्व जिल्हे</option>
                  {['पुणे', 'सातारा', 'कोल्हापूर', 'सांगली', 'सोलापूर', 'नाशिक', 'छत्रपती संभाजीनगर', 'मुंबई', 'ठाणे', 'अहमदनगर', 'नांदेड', 'जळगाव'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#7c2d12', marginBottom: '3px' }}>कुळ / आडनाव शोध</label>
                <input
                  type="text"
                  placeholder="उदा. कदम, पाटील, भोसले..."
                  value={kulFilter}
                  onChange={e => setKulFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={loadProfiles}
                  style={{
                    flex: 1,
                    background: '#9a3412',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  शोधा 🔍
                </button>
              </div>
            </div>
          </div>

          {/* Profiles Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#7c2d12', fontWeight: 700 }}>
              स्थळे लोड होत आहेत... ⏳
            </div>
          ) : profilesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid #fed7aa' }}>
              <h3>या निकषांनुसार सध्या कोणतेही स्थळ उपलब्ध नाही.</h3>
              <p style={{ color: '#64748b' }}>कृपया फिल्टर्स बदलून पुन्हा शोध घ्या किंवा नवीन स्थळ नोंदणी करा.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {profilesList.map(p => (
                <div key={p.id} style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  border: '1.5px solid #fed7aa',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s',
                  position: 'relative'
                }}>
                  {/* Verified 96 Kuli Badge */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px' }}>
                      ✓ सत्यापित ९६ कुळी
                    </span>
                  </div>

                  <div>
                    {/* Header: Photo + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      {p.photo && (p.photo.startsWith('/') || p.photo.startsWith('http')) ? (
                        <img
                          src={p.photo}
                          alt={p.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            objectFit: 'cover',
                            border: '2px solid #fdba74',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          background: '#ffedd5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.2rem',
                          flexShrink: 0
                        }}>
                          {p.gender?.includes('वर') ? '👨‍💼' : '👩‍💼'}
                        </div>
                      )}

                      <div style={{ paddingRight: '70px' }}>
                        <span style={{
                          background: p.gender?.includes('वर') ? '#e0f2fe' : '#fce7f3',
                          color: p.gender?.includes('वर') ? '#0369a1' : '#be185d',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {p.gender} • वय: {p.age} वर्षे ({p.height})
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                          {p.name}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#7c2d12', fontWeight: 700 }}>
                          कुळ: {p.kul || 'मराठा'} ({p.gotra ? `गोत्र: ${p.gotra}` : '९६ कुळी'})
                        </div>
                      </div>
                    </div>

                    {/* Quick Specs Pill */}
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                      <div style={{ marginBottom: '4px' }}>🎓 <strong>शिक्षण:</strong> {p.education}</div>
                      <div style={{ marginBottom: '4px' }}>💼 <strong>व्यवसाय:</strong> {p.profession} {p.company ? `(${p.company})` : ''}</div>
                      <div style={{ marginBottom: '4px' }}>💰 <strong>उत्पन्न:</strong> {p.income}</div>
                      <div>📍 <strong>पत्ता / मूळ गाव:</strong> {p.city} {p.native_place ? `(मूळ: ${p.native_place})` : ''}</div>
                    </div>

                    {/* Expectations preview */}
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1rem', background: '#fffbeb', padding: '6px 10px', borderRadius: '8px' }}>
                      🎯 <strong>अपेक्षा:</strong> "{p.expectations || 'सुशिक्षित व सुसंस्कृत अनुरूप जोडीदार'}"
                    </div>
                  </div>

                  {/* Actions & Two-Way Contact Reveal */}
                  <div style={{ borderTop: '1px solid #fed7aa', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.78rem' }}>
                        {p.isContactUnlocked ? (
                          <span style={{ color: '#16a34a', fontWeight: 800 }}>
                            📞 संपर्क: <strong>{p.contact}</strong>
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>
                            🔒 संपर्क: <strong>{p.contact}</strong>
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReportingProfile(p);
                          setIsReportModalOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        तक्रार / रिपोर्ट
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(p)}
                        style={{
                          background: '#f8fafc',
                          color: '#7c2d12',
                          border: '1.5px solid #fed7aa',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        संपूर्ण पत्रिका व माहिती ➔
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProfile(p);
                          setIsInterestModalOpen(true);
                        }}
                        style={{
                          background: '#9a3412',
                          color: '#fff',
                          border: 'none',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        💌 पसंती पाठवा (Connect)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY INTERESTS & RESPONSES */}
      {activeTab === 'interests' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.25rem' }}>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c2d12', marginBottom: '1rem', fontFamily: 'Baloo 2' }}>
            💌 प्राप्त पसंती विनंत्या (Interests Received)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem' }}>
            आपल्या बायो-डाटा प्रोफाईलला इतर मराठा कुटुंबांकडून आलेल्या पसंती विनंत्या. आपण संमती दिल्यास दोन्ही बाजूंचे संपर्क क्रमांक तात्काळ उघड होतील.
          </p>

          {receivedInterests.length === 0 ? (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #fed7aa', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📬</div>
              <h4>सध्या कोणतीही नवीन पसंती विनंती आलेली नाही.</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>नवीन विनंत्या आल्यावर येथे दिसतील.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {receivedInterests.map(item => (
                <div key={item.id} style={{
                  background: '#fff',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1.5px solid #fed7aa',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.sender_name}</strong>
                      <span style={{ fontSize: '0.72rem', background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        {item.relation || 'पालक'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '6px' }}>
                      संदेश: <em>"{item.message}"</em>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      तारीख: {new Date(item.created_at).toLocaleDateString('mr-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.status === 'accepted' ? (
                      <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>
                        ✓ पसंती स्वीकारली (फोन: {item.sender_phone})
                      </div>
                    ) : item.status === 'declined' ? (
                      <div style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>
                        ✕ नाकारले
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRespondInterest(item.id, 'accept')}
                          style={{
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ पसंती स्वीकारा (Unlock Phone)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespondInterest(item.id, 'decline')}
                          style={{
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #cbd5e1',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          नाकारा
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c2d12', marginBottom: '1rem', fontFamily: 'Baloo 2' }}>
            📤 मी पाठवलेल्या पसंती विनंत्या (Interests Sent)
          </h2>
          {sentInterests.length === 0 ? (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #fed7aa' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>आपण अद्याप कोणत्याही स्थळाला पसंती विनंती पाठवलेली नाही.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {sentInterests.map(item => (
                <div key={item.id} style={{
                  background: '#fff',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{item.target_name || item.receiver_profile_id}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {item.target_education} • {item.target_city}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: item.status === 'accepted' ? '#dcfce7' : item.status === 'declined' ? '#fee2e2' : '#ffedd5',
                      color: item.status === 'accepted' ? '#166534' : item.status === 'declined' ? '#991b1b' : '#c2410c'
                    }}>
                      {item.status === 'accepted' ? `✓ संमती दिली! (फोन: ${item.target_phone || 'अनलॉक'})` : item.status === 'declined' ? 'नाकारले' : 'प्रलंबित (Pending)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* FULL BIO-DATA MODAL */}
      {selectedProfile && !isInterestModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', background: '#ffedd5', color: '#9a3412', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  {selectedProfile.id}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0', color: '#7c2d12' }}>
                  संपूर्ण विवाह परिचय बायो-डाटा
                </h2>
              </div>
              <button onClick={() => setSelectedProfile(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Profile Header */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#fff7ed', padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3rem' }}>
                {selectedProfile.photo && (selectedProfile.photo.startsWith('/') || selectedProfile.photo.startsWith('http')) ? (
                  <img src={selectedProfile.photo} alt={selectedProfile.name} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
                ) : (
                  selectedProfile.gender?.includes('वर') ? '👨‍💼' : '👩‍💼'
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedProfile.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#7c2d12', fontWeight: 700, margin: '3px 0' }}>
                  {selectedProfile.caste} • {selectedProfile.kul} (गोत्र: {selectedProfile.gotra || 'कश्यप'})
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  वय: {selectedProfile.age} वर्षे • उंची: {selectedProfile.height} • जन्म: {selectedProfile.birth_date || 'उपलब्ध'} ({selectedProfile.birth_place || selectedProfile.city})
                </div>
              </div>
            </div>

            {/* Section 1: Horoscope / Kundali */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7c2d12', borderBottom: '1px solid #fed7aa', paddingBottom: '4px', marginBottom: '8px' }}>
              📜 जन्म व पत्रिका तपशील (Horoscope Details)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.84rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem' }}>
              <div>जन्म वेळ: <strong>{selectedProfile.birth_time || 'उपलब्ध नाही'}</strong></div>
              <div>जन्म ठिकाण: <strong>{selectedProfile.birth_place || selectedProfile.city}</strong></div>
              <div>रास: <strong>{selectedProfile.rashi || 'वृश्चिक'}</strong></div>
              <div>नक्षत्र: <strong>{selectedProfile.nakshatra || 'अनुराधा'}</strong></div>
              <div>देवक: <strong>{selectedProfile.devak || 'पंचपल्लव / सूर्यफूल'}</strong></div>
              <div>मंगळ / दोष: <strong style={{ color: selectedProfile.mangal === 'नाही' ? '#16a34a' : '#ea580c' }}>{selectedProfile.mangal || 'नाही'}</strong></div>
            </div>

            {/* Section 2: Education & Career */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7c2d12', borderBottom: '1px solid #fed7aa', paddingBottom: '4px', marginBottom: '8px' }}>
              💼 शिक्षण व नोकरी / व्यवसाय (Career)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.84rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem' }}>
              <div>शिक्षण: <strong>{selectedProfile.education}</strong></div>
              <div>व्यवसाय: <strong>{selectedProfile.profession}</strong></div>
              <div>कंपनी / कार्यालय: <strong>{selectedProfile.company || selectedProfile.city}</strong></div>
              <div>वार्षिक उत्पन्न: <strong>{selectedProfile.income}</strong></div>
            </div>

            {/* Section 3: Family & Roots */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7c2d12', borderBottom: '1px solid #fed7aa', paddingBottom: '4px', marginBottom: '8px' }}>
              🏛️ कौटुंबिक पार्श्वभूमी व नातेसंबंध (Family Background)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.84rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem' }}>
              <div>वडिलांचे नाव: <strong>{selectedProfile.father_name || 'माहिती उपलब्ध'}</strong></div>
              <div>वडिलांचा व्यवसाय: <strong>{selectedProfile.father_occupation || 'शेती / नोकरी'}</strong></div>
              <div>आईचे माहेर (कुळ): <strong>{selectedProfile.mother_maher_kul || 'मोरे / पाटील'}</strong></div>
              <div>मामाचे घराणे: <strong>{selectedProfile.mama_kul || 'माहिती उपलब्ध'}</strong></div>
              <div>भावंडे: <strong>{selectedProfile.siblings_info || '१ भाऊ / बहीण'}</strong></div>
              <div>मूळ गाव: <strong>{selectedProfile.native_place || selectedProfile.city}</strong></div>
            </div>

            {/* Section 4: Expectations */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <strong>🎯 वधू/वराकडून अपेक्षा:</strong>
              <div style={{ marginTop: '4px', color: '#92400e' }}>"{selectedProfile.expectations}"</div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                बंद करा
              </button>
              <button
                type="button"
                onClick={() => setIsInterestModalOpen(true)}
                style={{ background: '#9a3412', color: '#fff', border: 'none', padding: '9px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                💌 पसंती विनंती पाठवा (Express Interest)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND INTEREST MODAL */}
      {isInterestModalOpen && selectedProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#9a3412' }}>
                पसंती व संपर्क विनंती पाठवा
              </h3>
              <button onClick={() => setIsInterestModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '10px', border: '1px solid #fed7aa', marginBottom: '1.25rem', fontSize: '0.84rem' }}>
              उमेदवार: <strong>{selectedProfile.name}</strong> ({selectedProfile.gender})<br />
              कुळ: {selectedProfile.kul} • {selectedProfile.city}
            </div>

            <form onSubmit={handleSendInterest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '3px' }}>आपले नातेसंबंध *</label>
                <select
                  value={interestForm.relation}
                  onChange={e => setInterestForm({ ...interestForm, relation: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="स्वतः (Self)">स्वतः (Self)</option>
                  <option value="पालक / वडील (Father)">पालक / वडील (Father)</option>
                  <option value="आई (Mother)">आई (Mother)</option>
                  <option value="भाऊ / बहीण (Sibling)">भाऊ / बहीण (Sibling)</option>
                  <option value="नातेवाईक (Relative)">नातेवाईक (Relative)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '3px' }}>आपला संपर्क क्रमांक *</label>
                <input
                  type="tel"
                  required
                  placeholder="9822XXXXXX"
                  value={interestForm.phone}
                  onChange={e => setInterestForm({ ...interestForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '3px' }}>संदेश / टिप्पणी</label>
                <textarea
                  rows={3}
                  value={interestForm.message}
                  onChange={e => setInterestForm({ ...interestForm, message: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                🔒 <strong>गोपनीयता नियम:</strong> समोरील उमेदवाराने किंवा पालकांनी पसंती स्वीकारल्यावरच दोन्ही बाजूंना थेट संपर्क नंबर दिसेल.
              </div>

              <button
                type="submit"
                style={{
                  background: '#9a3412',
                  color: '#fff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                💌 विनंती पाठवा (Send Interest)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT PROFILE MODAL */}
      {isReportModalOpen && reportingProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#dc2626' }}>
                🚨 प्रोफाईल तक्रार / रिपोर्ट करा
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '1rem' }}>
              उमेदवार: <strong>{reportingProfile.name}</strong> ({reportingProfile.id}).<br />
              आपल्या तक्रारीची विवाह समितीमार्फत तातडीने पडताळणी करण्यात येईल.
            </p>

            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '3px' }}>तक्रारीचे कारण *</label>
                <select
                  value={reportForm.reason}
                  onChange={e => setReportForm({ ...reportForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="चुकीची किंवा दिशाभूल करणारी माहिती">चुकीची किंवा दिशाभूल करणारी माहिती</option>
                  <option value="विवाह आधीच झालेला आहे">विवाह आधीच झालेला आहे</option>
                  <option value="बनावट प्रोफाईल किंवा फोटो">बनावट प्रोफाईल किंवा फोटो</option>
                  <option value="अयोग्य किंवा अपमानास्पद वर्तन">अयोग्य किंवा अपमानास्पद वर्तन</option>
                  <option value="आर्थिक फसवणुकीचा संशय">आर्थिक फसवणुकीचा संशय</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '3px' }}>सविस्तर तपशील</label>
                <textarea
                  rows={3}
                  placeholder="तक्रारीचे सविस्तर कारण लिहा..."
                  value={reportForm.details}
                  onChange={e => setReportForm({ ...reportForm, details: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                तक्रार सादर करा (Submit Report)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL REGISTER MODAL */}
      {isRegisterModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#9a3412' }}>
                  नवीन वधू-वर नोंदणी अर्ज (Register Bio-data)
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>९६ कुळी मराठा वधू-वर सूचक केंद्र अधिकृत नोंदणी</div>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. रोहन संभाजीराव कदम"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>लिंग *</label>
                  <select
                    value={regForm.gender}
                    onChange={e => setRegForm({ ...regForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="वर (Groom)">वर (Groom)</option>
                    <option value="वधू (Bride)">वधू (Bride)</option>
                  </select>
                </div>
              </div>

              {/* Age, Height, Birthdate */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>वय (Age) *</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    required
                    value={regForm.age}
                    onChange={e => setRegForm({ ...regForm, age: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>उंची (उदा. 5' 9") *</label>
                  <input
                    type="text"
                    required
                    value={regForm.height}
                    onChange={e => setRegForm({ ...regForm, height: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>जन्म तारीख</label>
                  <input
                    type="date"
                    value={regForm.birthDate}
                    onChange={e => setRegForm({ ...regForm, birthDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Kul, Gotra, Devak */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>कुळ (Kul) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. कदम / मोरे / पाटील"
                    value={regForm.kul}
                    onChange={e => setRegForm({ ...regForm, kul: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>गोत्र (Gotra)</label>
                  <input
                    type="text"
                    placeholder="उदा. भारद्वाज / कश्यप"
                    value={regForm.gotra}
                    onChange={e => setRegForm({ ...regForm, gotra: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>मंगळ (Mangal)</label>
                  <select
                    value={regForm.mangal}
                    onChange={e => setRegForm({ ...regForm, mangal: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="नाही">नाही</option>
                    <option value="आहे">आहे</option>
                    <option value="सौम्य">सौम्य</option>
                  </select>
                </div>
              </div>

              {/* Education, Profession, Income */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>शिक्षण *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. B.Tech / MBBS / MBA"
                    value={regForm.education}
                    onChange={e => setRegForm({ ...regForm, education: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>व्यवसाय / नोकरी *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Software Engineer"
                    value={regForm.profession}
                    onChange={e => setRegForm({ ...regForm, profession: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>वार्षिक उत्पन्न *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. ₹१५ लाख वार्षिक"
                    value={regForm.income}
                    onChange={e => setRegForm({ ...regForm, income: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Location & Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>जिल्हा *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. पुणे"
                    value={regForm.district}
                    onChange={e => setRegForm({ ...regForm, district: e.target.value, city: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>मूळ गाव (Native)</label>
                  <input
                    type="text"
                    placeholder="उदा. कराड, सातारा"
                    value={regForm.nativePlace}
                    onChange={e => setRegForm({ ...regForm, nativePlace: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>पालक संपर्क क्रमांक *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9822XXXXXX"
                    value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Family Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>वडिलांचे नाव व व्यवसाय</label>
                  <input
                    type="text"
                    placeholder="उदा. संभाजीराव कदम (शेती/निवृत्त)"
                    value={regForm.fatherName}
                    onChange={e => setRegForm({ ...regForm, fatherName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>आईचे माहेर (कुळ / गाव)</label>
                  <input
                    type="text"
                    placeholder="उदा. मोरे (पाटण)"
                    value={regForm.motherMaherKul}
                    onChange={e => setRegForm({ ...regForm, motherMaherKul: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>अनुरूप जोडीदाराकडून अपेक्षा</label>
                <textarea
                  rows={2}
                  placeholder="उदा. सुशिक्षित, पदवीधर, कौटुंबिक मूल्यांची जाण असणारी अनुरूप वधू..."
                  value={regForm.expectations}
                  onChange={e => setRegForm({ ...regForm, expectations: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                नोंदणी सादर करा (Submit Profile)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
