import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MAHARASHTRA_DISTRICTS = [
  'पुणे', 'मुंबई', 'मुंबई उपनगर', 'ठाणे', 'नाशिक', 'सातारा', 'कोल्हापूर',
  'छत्रपती संभाजीनगर', 'नागपूर', 'सोलापूर', 'अहमदनगर', 'सांगली', 'जळगाव',
  'अमरावती', 'नांदेड', 'लातूर', 'धुळे', 'रत्नागिरी', 'सिंधुदुर्ग', 'रायगड',
  'बीड', 'जालना', 'परभणी', 'हिंगोली', 'उस्मानाबाद (धाराशिव)', 'बुलढाणा',
  'अकोला', 'वाशीम', 'यवतमाळ', 'वर्धा', 'चंद्रपूर', 'गडचिरोली', 'भंडारा', 'गोंदिया', 'नंदुरबार'
];

const AVAILABLE_AVATARS = ['👤', '👨', '👩', '🚩', '🦁', '🛡️', '👑', '⚔️', '💼', '🌾', '🎓'];

const POPULAR_INTERESTS = [
  'उद्योग व व्यापार (Business)',
  'शेती व ॲग्रो-बिझनेस (Agro)',
  'इतिहास व गड-किल्ले (History)',
  'सामाजिक सेवा (Social Work)',
  'राजकारण व प्रशासन (Politics)',
  'कला, साहित्य व संस्कृती (Culture)',
  'क्रीडा व व्यायाम (Sports)',
  'माहिती तंत्रज्ञान (IT & Tech)',
  'कायदेशीर व प्रशासकीय सहाय्य (Legal)',
  'शिक्षण व स्पर्धा परीक्षा (Education)'
];

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '👤',
    photo: '',
    city: '',
    district: 'पुणे',
    taluka: '',
    village: '',
    kul: '९६ कुळी मराठा',
    profession: '',
    business: '',
    education: '',
    skillsText: '',
    interestsText: '',
    selectedInterests: [],
    about: ''
  });

  useEffect(() => {
    if (user) {
      const skillsArray = Array.isArray(user.skills) ? user.skills : (user.skills ? [user.skills] : []);
      const interestsArray = Array.isArray(user.interests) ? user.interests : (user.interests ? [user.interests] : []);

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '👤',
        photo: user.photo || user.photoUrl || '',
        city: user.city || 'पुणे',
        district: user.district || 'पुणे',
        taluka: user.taluka || '',
        village: user.village || '',
        kul: user.kul || '९६ कुळी मराठा',
        profession: user.profession || '',
        business: user.business || '',
        education: user.education || '',
        skillsText: skillsArray.join(', '),
        interestsText: interestsArray.join(', '),
        selectedInterests: interestsArray,
        about: user.about || ''
      });
    }
  }, [user]);

  if (!user || !user.id) {
    return (
      <div style={{
        background: '#f8fafc',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: '#fff7ed',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1.5rem'
          }}>
            👤
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            सभासद प्रोफाईल
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
            आपली वैयक्तिक माहिती व प्रोफाईल पाहण्यासाठी कृपया प्रथम आपल्या खात्यात लॉगिन करा.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <Link
              to="/login"
              style={{
                background: '#ea580c',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.9rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'block'
              }}
            >
              👤 लॉगिन करा (Login Now)
            </Link>
            <Link
              to="/register"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'block'
              }}
            >
              🚩 नवीन सभासद नोंदणी (Register)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleInterest = (interest) => {
    setFormData(prev => {
      const exists = prev.selectedInterests.includes(interest);
      const updated = exists
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest];
      return {
        ...prev,
        selectedInterests: updated,
        interestsText: updated.join(', ')
      };
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);

    const applyFallback = () => {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const dataUrl = uploadEvt.target?.result;
        if (dataUrl) {
          setFormData(prev => ({ ...prev, photo: dataUrl }));
          alert('प्रोफाईल छायाचित्र जोडले गेले! 📸 बदल जतन करण्यासाठी खाली "बदल जतन करा" वर क्लिक करा.');
        }
      };
      reader.readAsDataURL(file);
    };

    try {
      const buffer = await file.arrayBuffer();
      const origin = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'http://localhost:5000' : '';
      const endpoints = [
        `${origin}/api/media/post`,
        '/api/media/post',
        `${API_SERVER_ORIGIN}/api/media/post`
      ].filter(Boolean);

      let savedPath = null;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: buffer
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.path) {
              savedPath = data.path;
              break;
            }
          }
        } catch {
          // try next endpoint
        }
      }

      if (savedPath) {
        setFormData(prev => ({ ...prev, photo: savedPath }));
        alert('प्रोफाईल छायाचित्र अपलोड झाले! 📸 बदल जतन करण्यासाठी खाली "बदल जतन करा" वर क्लिक करा.');
      } else {
        applyFallback();
      }
    } catch {
      applyFallback();
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const skills = formData.skillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Merge selected interests and custom text
      const manualInterests = formData.interestsText
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);
      const allInterests = [...new Set([...formData.selectedInterests, ...manualInterests])];

      const patchData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        photo: formData.photo,
        city: formData.city,
        district: formData.district,
        taluka: formData.taluka,
        village: formData.village,
        kul: formData.kul,
        profession: formData.profession,
        business: formData.business,
        education: formData.education,
        skills,
        interests: allInterests,
        about: formData.about
      };

      await updateProfile(patchData);
      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setSaveError(err.message || 'प्रोफाईल अद्ययावत करताना अडचण आली.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '20px',
          color: '#fff',
          padding: '30px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 12px 30px rgba(199,56,0,0.25)'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: '#fff',
              border: '3px solid #FFD54F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}>
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt={formData.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                formData.avatar || user?.avatar || '👤'
              )}
            </div>

            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.82rem', fontWeight: 700 }}>
                  🚩 {user?.tier || 'Gold'} सदस्य
                </span>
                {user?.kul && (
                  <span style={{ background: '#FFD54F', color: '#8D2600', padding: '4px 12px', borderRadius: '14px', fontSize: '0.82rem', fontWeight: 800 }}>
                    {user.kul}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.9rem', margin: '6px 0 2px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
                {user?.name || 'मराठा सदस्य'}
              </h1>
              <div style={{ opacity: 0.95, fontSize: '0.92rem' }}>
                सदस्य आयडी: <strong>{user?.id}</strong> | 📍 {user?.taluka ? `${user.taluka}, ` : ''}{user?.district || 'पुणे'} | 📞 {user?.phone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                background: editMode ? '#FFF' : '#FFD54F',
                color: '#8D2600',
                border: 'none',
                padding: '10px 22px',
                fontWeight: 800,
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}>
              {editMode ? '✕ संपादन रद्द करा' : '✏️ प्रोफाईल संपादित करा'}
            </button>
            <Link
              to="/card"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '10px 18px',
                fontWeight: 700,
                borderRadius: '10px',
                textDecoration: 'none'
              }}>
              🪪 स्मार्ट कार्ड
            </Link>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', color: '#166534', padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>✔</span>
            <span>आपली प्रोफाईल माहिती, आवडी-निवडी व छायाचित्र थेट डेटाबेसमध्ये सुरक्षित सेव्ह झाले!</span>
          </div>
        )}

        {saveError && (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', color: '#991B1B', padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>
            ⚠ {saveError}
          </div>
        )}

        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '34px', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px', borderBottom: '1.5px solid #F3F4F6', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.45rem', color: '#C73800', margin: 0, fontFamily: 'Baloo 2', fontWeight: 800 }}>
              👤 सदस्य माहिती, कौशल्ये व आवडी-निवडी (Profile & Interests)
            </h2>
          </div>

          {editMode ? (
            <form onSubmit={handleSave}>
              
              {/* SECTION 1: AVATAR & PHOTO */}
              <div style={{ background: '#FFF8F2', padding: '20px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #FFE0B2' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 12px', color: '#C73800', fontWeight: 800 }}>
                  📸 प्रोफाईल चिन्ह व छायाचित्र बदला (Avatar & Photo)
                </h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                      चिन्ह निवडा (Choose Avatar Emoji):
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {AVAILABLE_AVATARS.map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: av })}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            border: formData.avatar === av ? '2.5px solid #C73800' : '1px solid #D1D5DB',
                            background: formData.avatar === av ? '#FFF3E0' : '#fff',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}>
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#374151' }}>
                      किंवा स्वतःचा फोटो अपलोड करा:
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <label style={{
                        padding: '9px 18px',
                        background: '#C73800',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>📷</span>
                        <span>{uploadingPhoto ? 'अपलोड होत आहे...' : 'फोटो निवडा'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPhoto}
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: '' })}
                          style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '9px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                          ✕ फोटो काढा
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BASIC DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>ईमेल पत्ता</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>कुळ (Kul)</label>
                  <input
                    type="text"
                    value={formData.kul}
                    placeholder="उदा. ९६ कुळी मराठा, सुर्यवंशी, भोसले"
                    onChange={(e) => setFormData({ ...formData, kul: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* SECTION 3: LOCATION DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>जिल्हा *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '0.95rem' }}>
                    {MAHARASHTRA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>तालुका</label>
                  <input
                    type="text"
                    value={formData.taluka}
                    placeholder="उदा. हवेली, कराड, पाटण"
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>शहर / गाव</label>
                  <input
                    type="text"
                    value={formData.city}
                    placeholder="उदा. पुणे, सातारा"
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>मूळ गाव (Native Village)</label>
                  <input
                    type="text"
                    value={formData.village}
                    placeholder="उदा. औंध, कोरेगाव"
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* SECTION 4: PROFESSIONAL & BUSINESS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>व्यवसाय / पद (Profession)</label>
                  <input
                    type="text"
                    value={formData.profession}
                    placeholder="उदा. Software Engineer, शेतकरी, उद्योजक"
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>उद्योग / कंपनीचे नाव (Business/Company)</label>
                  <input
                    type="text"
                    value={formData.business}
                    placeholder="उदा. स्वराज्य ॲग्रो फूड्स"
                    onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>शिक्षण (Education)</label>
                  <input
                    type="text"
                    value={formData.education}
                    placeholder="उदा. B.Tech, M.Com, MBA, Ph.D"
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* SECTION 5: SKILLS */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>
                  🎯 कौशल्ये (Skills - कॉमाने वेगळे करा):
                </label>
                <input
                  type="text"
                  value={formData.skillsText}
                  placeholder="उदा. डिजिटल मार्केटिंग, फायनान्स, सौर ऊर्जा, शेती तंत्रज्ञान"
                  onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                />
              </div>

              {/* SECTION 6: INTERESTS (आवडी-निवडी) */}
              <div style={{ background: '#F8FAFC', padding: '22px', borderRadius: '14px', marginBottom: '22px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px', color: '#0F172A' }}>
                  🌟 आवडी-निवडी व सामाजिक रुची (Interests & Passions):
                </label>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 12px' }}>
                  आपल्या आवडीनुसार खालील पर्यायांवर क्लिक करा किंवा अतिरिक्त आवडी खाली टाईप करा:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {POPULAR_INTERESTS.map(interest => {
                    const isSelected = formData.selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleToggleInterest(interest)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '20px',
                          border: isSelected ? '1.5px solid #C73800' : '1px solid #CBD5E1',
                          background: isSelected ? '#C73800' : '#fff',
                          color: isSelected ? '#fff' : '#334155',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}>
                        {isSelected ? '✓ ' : '+ '} {interest}
                      </button>
                    );
                  })}
                </div>

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '5px', color: '#475569' }}>
                  इतर आवडी (कॉमाने जोडा):
                </label>
                <input
                  type="text"
                  value={formData.interestsText}
                  placeholder="उदा. ट्रेकिंग, वाचन, उद्योग मार्गदर्शन"
                  onChange={(e) => setFormData({ ...formData, interestsText: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}
                />
              </div>

              {/* SECTION 7: BIO / ABOUT */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '5px', color: '#374151' }}>
                  📝 थोडक्यात परिचय व समाज कार्य (Bio / About):
                </label>
                <textarea
                  rows="4"
                  value={formData.about}
                  placeholder="आपला अल्पपरिचय, समाजकार्यातील सहभाग किंवा व्यवसाय ध्येये..."
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontFamily: 'inherit', fontSize: '0.95rem' }}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: '#C73800',
                    color: '#fff',
                    border: 'none',
                    padding: '11px 28px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(199,56,0,0.25)',
                    fontSize: '1rem'
                  }}>
                  {saving ? 'जतन होत आहे...' : 'बदल डेटाबेसमध्ये सेव्ह करा 💾'}
                </button>
              </div>

            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
              
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>पूर्ण नाव:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F2937' }}>{user?.name}</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>कुळ:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#C73800' }}>{user?.kul || '९६ कुळी मराठा'}</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>मोबाईल / संपर्क:</div>
                  <div style={{ fontSize: '1rem', color: '#1F2937', fontWeight: 600 }}>📞 {user?.phone}</div>
                </div>

                {user?.email && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>ईमेल:</div>
                    <div style={{ fontSize: '0.95rem', color: '#1F2937' }}>✉ {user.email}</div>
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>स्थान व मूळ गाव:</div>
                  <div style={{ fontSize: '1rem', color: '#1F2937' }}>
                    📍 {user?.city || user?.district || 'पुणे'}, {user?.taluka ? `ता. ${user.taluka}, ` : ''}जि. {user?.district || 'पुणे'}
                    {user?.village ? ` (मूळ गाव: ${user.village})` : ''}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>शिक्षण:</div>
                  <div style={{ fontSize: '1rem', color: '#1F2937' }}>🎓 {user?.education || 'पदवीधर'}</div>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>व्यवसाय / उद्योग:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#C73800' }}>
                    💼 {user?.profession || 'व्यावसायिक / नोकरी'}
                  </div>
                  {user?.business && (
                    <div style={{ fontSize: '0.92rem', color: '#4B5563', marginTop: '2px', fontWeight: 600 }}>
                      🏢 {user.business}
                    </div>
                  )}
                </div>

                {/* SKILLS */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700, marginBottom: '6px' }}>
                    🎯 कौशल्ये (Skills):
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {user?.skills && (Array.isArray(user.skills) ? user.skills : []).length > 0 ? (
                      user.skills.map((s, idx) => (
                        <span key={idx} style={{ background: '#FFF3E0', color: '#C73800', padding: '3px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #FFE0B2' }}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>कौशल्ये जोडलेली नाहीत.</span>
                    )}
                  </div>
                </div>

                {/* INTERESTS */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700, marginBottom: '6px' }}>
                    🌟 आवडी-निवडी व रुची (Interests):
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {user?.interests && (Array.isArray(user.interests) ? user.interests : []).length > 0 ? (
                      user.interests.map((i, idx) => (
                        <span key={idx} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #BFDBFE' }}>
                          ★ {i}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>आवडी-निवडी जोडलेल्या नाहीत.</span>
                    )}
                  </div>
                </div>

                {/* BIO / ABOUT */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700 }}>📝 परिचय / बायो:</div>
                  <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.6, margin: '4px 0 0', background: '#F9FAFB', padding: '12px 14px', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                    {user?.about || 'मराठा समाजाचा सक्रिय घटक.'}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ background: '#fff', border: '1.5px solid #C73800', color: '#C73800', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
            ← सदस्य डॅशबोर्डवर जा
          </Link>
          <Link to="/community" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
            🚩 समाज मंच व फीड पहा
          </Link>
        </div>

      </div>
    </div>
  );
}
