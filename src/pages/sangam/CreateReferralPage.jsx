import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';
import { api } from '../../services/api';
import apiClient from '../../services/apiClient';

export default function CreateReferralPage() {
  const [formData, setFormData] = useState({
    recipientId: '',
    recipientName: '',
    prospect: '',
    phone: '',
    email: '',
    requirement: '',
    category: 'औद्योगिक उत्पादन व मशिनरी',
    estimatedValue: '50000',
    location: 'पुणे',
    urgency: 'मध्यम (Medium)',
    warmth: 'थेट चर्चा झाली आहे'
  });
  const [memberList, setMemberList] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load members from live API or fallback to CMDB
  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await apiClient.fetchJson('/members').catch(() => null);
        const members = res?.data?.members || res?.members;
        if (members && members.length) {
          setMemberList(members);
          setFormData(prev => ({
            ...prev,
            recipientId: members[0].id,
            recipientName: members[0].name
          }));
          return;
        }
      } catch (e) {
        console.warn('Could not load members from API:', e);
      }

      // Fallback
      const fallback = CMDB.raw ? CMDB.raw().members : [
        { id: 'M1001', name: 'राजेश कदम', profession: 'सोलर सिस्टिम्स', district: 'पुणे' },
        { id: 'M1002', name: 'संजय माने', profession: 'इंजिनिअरिंग व फॅब्रिकेशन', district: 'पुणे' },
        { id: 'M1003', name: 'सुनील साळुंखे', profession: 'लॉजिस्टिक्स व ट्रान्सपोर्ट', district: 'मुंबई' },
        { id: 'M1004', name: 'दीपक चव्हाण', profession: 'मेटल्स व स्टील', district: 'कोल्हापूर' }
      ];
      setMemberList(fallback);
      if (fallback.length) {
        setFormData(prev => ({
          ...prev,
          recipientId: fallback[0].id,
          recipientName: fallback[0].name
        }));
      }
    }
    loadMembers();
  }, []);

  const handleRecipientChange = (e) => {
    const selId = e.target.value;
    const selected = memberList.find(m => m.id === selId);
    setFormData(prev => ({
      ...prev,
      recipientId: selId,
      recipientName: selected?.name || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prospect || !formData.requirement) {
      alert('कृपया ग्राहकाचे नाव व कामाचे स्वरूप प्रविष्ट करा.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const cleanDigits = formData.phone ? formData.phone.replace(/[^0-9]/g, '') : '';
      const cleanPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '9822144550';

      const payload = {
        title: formData.requirement.slice(0, 60),
        clientName: formData.prospect,
        prospect: formData.prospect,
        clientPhone: cleanPhone,
        phone: cleanPhone,
        clientEmail: formData.email,
        recipientId: formData.recipientId,
        recipientName: formData.recipientName,
        category: formData.category,
        requirement: formData.requirement,
        value: Number(formData.estimatedValue) || 50000,
        estimatedValue: Number(formData.estimatedValue) || 50000,
        city: formData.location,
        location: formData.location,
        urgency: formData.urgency,
        warmth: formData.warmth
      };

      if (api.sangam && api.sangam.createReferral) {
        await api.sangam.createReferral(payload);
      } else {
        await apiClient.createReferral(payload);
      }

      setSuccessMsg('संदर्भ थेट बिझनेस संगम डेटाबेसमध्ये यशस्वीरीत्या नोंदवला गेला! आपल्या खात्यात +१० योगदान गुण जोडले गेले आहेत.');
      setTimeout(() => navigate('/referrals'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'संदर्भ नोंदवताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '40px 16px', color: '#1F2937' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FED7AA',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 10px 30px rgba(67, 20, 7, 0.08)'
        }}>
          {/* Header */}
          <div style={{ borderBottom: '1px solid #FED7AA', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', color: '#EA580C', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '8px' }}>
              ● FEATURE 26 VERIFIED B2B PIPELINE
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#7C2D12', margin: '0 0 6px', fontWeight: 900 }}>
              🤝 नवीन व्यवसाय संदर्भ द्या (Give Referral)
            </h1>
            <p style={{ color: '#9A3412', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
              मराठा व्यवसाय बंधूंच्या फर्मसाठी विश्वासार्ह ग्राहक मिळवून द्या. प्रत्येक पडताळणीकृत संदर्भावर +१० कर्म गुण.
            </p>
          </div>

          {successMsg && (
            <div style={{ background: '#DCFCE7', color: '#166534', padding: '14px', borderRadius: '10px', fontSize: '0.92rem', marginBottom: '20px', fontWeight: 700, border: '1px solid #BBF7D0' }}>
              ✅ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '14px', borderRadius: '10px', fontSize: '0.92rem', marginBottom: '20px', fontWeight: 700, border: '1px solid #FECACA' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Recipient Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                हा संदर्भ कोणासाठी आहे? (उद्योजक सदस्य निवडा) *
              </label>
              <select
                value={formData.recipientId}
                onChange={handleRecipientChange}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}
                required>
                {memberList.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.profession || m.business || 'सदस्य'} - {m.district || m.city || 'महाराष्ट्र'})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                उद्योग क्षेत्र / वर्गवारी (Category) *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}>
                <option value="औद्योगिक उत्पादन व मशिनरी">औद्योगिक उत्पादन व मशिनरी</option>
                <option value="बांधकाम व साहित्य">बांधकाम व रिअल इस्टेट</option>
                <option value="अन्न प्रक्रिया व पॅकेजिंग">अन्न प्रक्रिया व कृषी उत्पादने</option>
                <option value="वाहतूक व पुरवठा साखळी">वाहतूक व लॉजिस्टिक्स</option>
                <option value="आयटी व सॉफ्टवेअर">आयटी व डिजिटल सेवा</option>
                <option value="हॉस्पिटॅलिटी व पर्यटन">हॉस्पिटॅलिटी व पर्यटन</option>
                <option value="वस्त्रोद्योग व गारमेंट्स">वस्त्रोद्योग व गारमेंट्स</option>
                <option value="इतर व्यावसायिक सेवा">इतर व्यावसायिक सेवा</option>
              </select>
            </div>

            {/* Prospect Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                ग्राहकाचे / कंपनीचे नाव (Prospect / Client Name) *
              </label>
              <input
                type="text"
                placeholder="उदा. सह्याद्री इन्फ्रा (श्री. महेश पवार)"
                value={formData.prospect}
                onChange={e => setFormData({ ...formData, prospect: e.target.value })}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                required
              />
            </div>

            {/* Client Phone & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  ग्राहकाचा फोन नंबर *
                </label>
                <input
                  type="tel"
                  placeholder="उदा. 9822144550"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  ग्राहकाचा ईमेल (ऐच्छिक)
                </label>
                <input
                  type="email"
                  placeholder="उदा. contact@firm.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            {/* Requirement */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                कामाचे सविस्तर स्वरूप / गरज (Requirement) *
              </label>
              <textarea
                rows="3"
                placeholder="उदा. चाकण MIDC मधील ३० HP सोलर चिलर युनिट व वेअरहाऊस डिझाइन कंत्राट..."
                value={formData.requirement}
                onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', fontFamily: 'inherit' }}
                required
              />
            </div>

            {/* Value, City, Urgency & Warmth */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  अपेक्षित व्यवसाय मूल्य (₹) *
                </label>
                <input
                  type="number"
                  placeholder="उदा. 850000"
                  value={formData.estimatedValue}
                  onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', fontWeight: 700, color: '#7C2D12' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  स्थान / शहर *
                </label>
                <input
                  type="text"
                  placeholder="उदा. पुणे"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  गरजेची तातडी (Urgency)
                </label>
                <select
                  value={formData.urgency}
                  onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}>
                  <option value="उच्च (High)">⚡ उच्च (High - तातडीने संपर्क)</option>
                  <option value="मध्यम (Medium)">मध्यम (Medium - २-३ दिवसांत)</option>
                  <option value="सामान्य (Normal)">सामान्य (Normal - चालू आठवडा)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  परिचय स्तर (Connection Warmth)
                </label>
                <select
                  value={formData.warmth}
                  onChange={e => setFormData({ ...formData, warmth: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}>
                  <option value="थेट चर्चा झाली आहे">थेट चर्चा झाली आहे (कॉलची वाट पाहत आहेत)</option>
                  <option value="संदर्भ दिला आहे">संदर्भ दिला आहे (परिचय करून द्यावा)</option>
                  <option value="ग्राहक संपर्क करणार आहे">ग्राहक स्वतः संपर्क करणार आहे</option>
                </select>
              </div>
            </div>

            {/* Privacy note */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#9A3412' }}>
              🔒 <strong>गोपनीयता नियम:</strong> ग्राहकाचा संपर्क क्रमांक फक्त आपण व निवडलेले उद्योजक यांच्यासाठीच दृश्यमान राहील. इतर सदस्यांसाठी तो सुरक्षितरीत्या लपविला जातो.
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <Link to="/referrals" style={{ color: '#7C2D12', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
                ← रद्द करा व मागे जा
              </Link>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#EA580C',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
                }}>
                {submitting ? 'नोंद होत आहे...' : 'संदर्भ सबमिट करा ✓'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
