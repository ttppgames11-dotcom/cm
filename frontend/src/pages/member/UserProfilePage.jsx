import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MAHARASHTRA_DISTRICTS = [
  'पुणे', 'मुंबई', 'मुंबई उपनगर', 'ठाणे', 'नाशिक', 'सातारा', 'कोल्हापूर',
  'छत्रपती संभाजीनगर', 'नागपूर', 'सोलापूर', 'अहमदनगर', 'सांगली', 'जळगाव',
  'अमरावती', 'नांदेड', 'लातूर', 'धुळे', 'रत्नागिरी', 'सिंधुदुर्ग', 'रायगड'
];

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();

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

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'अमोल जाधव',
    phone: user?.phone || '9876500011',
    city: user?.city || 'पुणे',
    district: user?.district || 'पुणे',
    profession: user?.profession || 'Web Developer',
    business: user?.business || 'स्वराज्य टेक',
    education: user?.education || 'B.E. Computer Engineering',
    skillsText: Array.isArray(user?.skills) ? user.skills.join(', ') : 'JavaScript, React, Node.js',
    about: user?.about || 'फुल-स्टॅक वेब डेव्हलपर, समाजातील स्टार्टअप्सना मोफत मार्गदर्शन करतो.'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const skills = formData.skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const updated = await updateProfile({
      ...formData,
      skills
    });
    setSaveSuccess(true);
    setEditMode(false);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '28px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '3.2rem', background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>
              {user?.avatar || '👨'}
            </span>
            <div>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                🚩 {user?.tier || 'Gold'} सदस्य
              </span>
              <h1 style={{ fontSize: '1.8rem', margin: '6px 0 2px', fontFamily: 'Baloo 2' }}>
                {user?.name || 'अमोल जाधव'}
              </h1>
              <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                सदस्य आयडी: <strong>{user?.id || 'M1001'}</strong> | 📍 {user?.district || 'पुणे'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/card" className="btn btn-primary" style={{ background: '#fff', color: '#C73800', border: 'none', padding: '10px 18px', fontWeight: 700, borderRadius: '8px', textDecoration: 'none' }}>
              🪪 स्मार्ट कार्ड पहा
            </Link>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
            ✔ प्रोफाईल माहिती यशस्वीरित्या अद्ययावत केली गेली!
          </div>
        )}

        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#C73800', margin: 0, fontFamily: 'Baloo 2' }}>
              👤 सदस्य माहिती व तपशील
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                background: editMode ? '#F3F4F6' : '#C73800',
                color: editMode ? '#333' : '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
              {editMode ? 'रद्द करा' : '✏️ प्रोफाईल संपादित करा'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>फोन नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>शहर *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>जिल्हा *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                    {MAHARASHTRA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>व्यवसाय / पद (Profession)</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>उद्योग / कंपनीचे नाव</label>
                  <input
                    type="text"
                    value={formData.business}
                    onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>कौशल्ये (Skills - कॉमाने वेगळे करा)</label>
                <input
                  type="text"
                  value={formData.skillsText}
                  onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>थोडक्यात माहिती (Bio / About)</label>
                <textarea
                  rows="3"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  style={{ background: '#F3F4F6', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                  बदल जतन करा 💾
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>नाव:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937' }}>{user?.name}</div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>मोबाईल / संपर्क:</div>
                  <div style={{ fontSize: '1rem', color: '#1F2937' }}>{user?.phone || '९८७६५०००११'}</div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>स्थान:</div>
                  <div style={{ fontSize: '1rem', color: '#1F2937' }}>{user?.city || 'पुणे'}, {user?.district || 'पुणे'}</div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>शिक्षण:</div>
                  <div style={{ fontSize: '1rem', color: '#1F2937' }}>{user?.education || 'पदवीधर'}</div>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>व्यवसाय / उद्योग:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#C73800' }}>{user?.profession || 'Web Developer'}</div>
                  {user?.business && <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>{user.business}</div>}
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>कौशल्ये:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {user?.skills && (Array.isArray(user.skills) ? user.skills : []).map((s, idx) => (
                      <span key={idx} style={{ background: '#FFF3E0', color: '#C73800', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>परिचय:</div>
                  <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5, margin: '4px 0 0' }}>
                    {user?.about || 'मराठा समाजाचा सक्रिय घटक.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-outline" style={{ borderColor: '#C73800', color: '#C73800', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
            ← सदस्य डॅशबोर्डवर जा
          </Link>
          <Link to="/card" className="btn btn-primary" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
            🪪 डिजिटल स्मार्ट कार्ड पहा
          </Link>
        </div>

      </div>
    </div>
  );
}
