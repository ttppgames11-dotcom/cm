import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { asNumberOrUndefined } from './referralList';

export default function CreateReferralPage() {
  const [formData, setFormData] = useState({
    recipientId: '',
    businessId: '',
    prospect: '',
    phone: '',
    requirement: '',
    category: 'बांधकाम व साहित्य',
    estimatedValue: '',
    location: 'पुणे'
  });
  const [receivers, setReceivers] = useState([]);
  const [loadingReceivers, setLoadingReceivers] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Real members who own a business: the only ones a referral can be given to.
  useEffect(() => {
    apiClient.getReferralReceivers()
      .then((list) => setReceivers(Array.isArray(list) ? list : []))
      .catch((err) => setErrorMsg(err.message || 'सदस्यांची यादी मिळाली नाही.'))
      .finally(() => setLoadingReceivers(false));
  }, []);

  const chosenReceiver = receivers.find((m) => m.id === formData.recipientId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.recipientId) {
      setErrorMsg('कृपया संदर्भ कोणत्या सदस्याला द्यायचा ते निवडा.');
      return;
    }
    if (!formData.prospect.trim() || !formData.requirement.trim()) {
      setErrorMsg('कृपया ग्राहकाचे नाव व कामाचे स्वरूप प्रविष्ट करा.');
      return;
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg('कृपया ग्राहकाचा १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    try {
      const payload = {
        title: formData.requirement.trim().slice(0, 60),
        clientName: formData.prospect.trim(),
        clientPhone: cleanPhone,
        recipientId: formData.recipientId,
        category: formData.category,
        notes: formData.requirement.trim() + (formData.location.trim() ? ' (' + formData.location.trim() + ')' : '')
      };
      if (formData.businessId) payload.businessId = formData.businessId;
      const value = asNumberOrUndefined(formData.estimatedValue);
      if (value !== undefined) payload.value = value;

      await apiClient.createReferral(payload);

      setSuccessMsg('संदर्भ यशस्वीरीत्या दिला गेला! संबंधित सदस्याला तो आपल्या यादीत दिसेल.');
      setTimeout(() => navigate('/referrals/tracker'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'संदर्भ नोंदवताना त्रुटी आली.');
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
            मराठा बांधवांच्या व्यवसायाला ग्राहक मिळवून द्या. ग्राहकाचा संपर्क फक्त तुम्हाला व संदर्भ घेणाऱ्या सदस्याला दिसतो.
          </p>
        </div>

        {successMsg && (
          <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 600 }}>
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              हा संदर्भ कोणाला द्यायचा आहे? (सदस्य निवडा)
            </label>
            {!loadingReceivers && receivers.length === 0 ? (
              <div style={{ background: '#FFF8E1', color: '#8D6E00', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                अद्याप कोणत्याही सदस्याने आपला व्यवसाय नोंदवलेला नाही. व्यवसाय नोंदवलेल्या सदस्यांनाच संदर्भ देता येतो.
              </div>
            ) : (
              <select
                value={formData.recipientId}
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value, businessId: '' })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}>
                <option value="">— सदस्य निवडा —</option>
                {receivers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({(m.businesses || []).map(b => b.name).join(', ')})
                  </option>
                ))}
              </select>
            )}
            {chosenReceiver && (chosenReceiver.businesses || []).length > 1 && (
              <select
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem', marginTop: '8px' }}>
                <option value="">— कोणता व्यवसाय? (ऐच्छिक) —</option>
                {chosenReceiver.businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
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
              ग्राहकाचा संपर्क नंबर (Client Phone) *
            </label>
            <input
              type="tel"
              placeholder="उदा. 9822144550"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
