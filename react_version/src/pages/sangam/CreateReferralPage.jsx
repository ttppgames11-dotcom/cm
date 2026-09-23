import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

export default function CreateReferralPage() {
  const [formData, setFormData] = useState({
    recipientId: 'M1002',
    prospect: '',
    requirement: '',
    category: 'बांधकाम व साहित्य',
    estimatedValue: '',
    location: 'पुणे'
  });
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const members = CMDB.raw ? CMDB.raw().members : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.prospect || !formData.requirement) {
      alert('कृपया ग्राहकाचे नाव व कामाचे स्वरूप प्रविष्ट करा.');
      return;
    }

    if (CMDB.createReferral) {
      CMDB.createReferral({
        recipient: formData.recipientId,
        recipientId: formData.recipientId,
        prospect: formData.prospect,
        requirement: formData.requirement,
        category: formData.category,
        estimatedValue: Number(formData.estimatedValue) || 50000,
        location: formData.location,
        status: 'New'
      });
      setSuccessMsg('संदर्भ यशस्वीरीत्या नोंदवला गेला! आपल्या खात्यात +१० गुण जोडले गेले आहेत.');
      setTimeout(() => navigate('/referrals'), 1200);
    }
  };

  return (
    <div className="container py-5" style={{ padding: '40px 16px', maxWidth: '620px', margin: '0 auto' }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ borderBottom: '1px solid #EEE', paddingBottom: '14px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--maroon-900, #D84315)', margin: '0 0 4px' }}>
            🤝 नवीन व्यवसाय संदर्भ द्या (Give Referral)
          </h1>
          <p style={{ color: '#666', fontSize: '0.88rem', margin: 0 }}>
            मराठा बांधवांच्या व्यवसायाला ग्राहक मिळवून द्या. प्रत्येक वैध संदर्भाला +१० योगदान गुण.
          </p>
        </div>

        {successMsg && (
          <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 600 }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              हा संदर्भ कोणाला द्यायचा आहे? (सदस्य निवडा)
            </label>
            <select
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.profession || m.business || 'सदस्य'} - {m.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              ग्राहकाचे / कंपनीचे नाव (Prospect Name) *
            </label>
            <input
              type="text"
              placeholder="उदा. सह्याद्री इन्फ्रा (श्री. महेश पवार)"
              value={formData.prospect}
              onChange={(e) => setFormData({ ...formData, prospect: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              कामाचे स्वरूप / गरज (Requirement) *
            </label>
            <textarea
              rows="3"
              placeholder="उदा. ५०० चौरस मीटर जागेसाठी आर्किटेक्चरल प्लॅनिंग व डिझाइन आवश्यक आहे."
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                अपेक्षित व्यवसाय मूल्य (₹)
              </label>
              <input
                type="number"
                placeholder="उदा. 75000"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                स्थान / शहर
              </label>
              <input
                type="text"
                placeholder="उदा. पुणे"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <Link to="/referrals" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
              ← रद्द करा व मागे जा
            </Link>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              संदर्भ सबमिट करा ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
