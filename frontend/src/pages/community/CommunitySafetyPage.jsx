import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CommunitySafetyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [helpForm, setHelpForm] = useState({
    name: '',
    mobile: '',
    district: 'पुणे',
    helpType: 'कायदेशीर सल्ला',
    details: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)',
          borderRadius: '20px',
          padding: '40px 32px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 16px 40px rgba(26,54,93,0.35)'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#1A365D',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            🛡️ समाज सुरक्षा व साहाय्यता कक्ष
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            मराठा समाज सुरक्षा व मदत कक्ष
          </h1>
          <p style={{ color: '#BEE3F8', fontSize: '1rem', maxWidth: '680px', margin: 0, lineHeight: 1.6 }}>
            आपत्कालीन साहाय्य, कायदेशीर सल्ला, वैद्यकीय मदत आणि समाज बांधवांसाठी २४x७ विनामूल्य मदत प्रणाली.
          </p>

          <div style={{
            marginTop: '22px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.15)',
            padding: '12px 24px',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>📞</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>टोल-फ्री हेल्पलाईन: १८००-१२३-१६७४</span>
          </div>
        </div>

        {/* 4 Pillars of Safety */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid #E6DDCE' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚖️</div>
            <div style={{ fontWeight: 800, color: '#1A365D', fontSize: '1.1rem', marginBottom: '4px' }}>मोफत कायदेशीर सल्ला</div>
            <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>विधी कक्षातील ज्येष्ठ वकिलांचे मार्गदर्शन.</div>
          </div>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid #E6DDCE' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</div>
            <div style={{ fontWeight: 800, color: '#1A365D', fontSize: '1.1rem', marginBottom: '4px' }}>आपत्कालीन वैद्यकीय मदत</div>
            <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>रक्तदान साखळी व रुग्णालयीन सवलत समन्वय.</div>
          </div>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid #E6DDCE' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👩</div>
            <div style={{ fontWeight: 800, color: '#1A365D', fontSize: '1.1rem', marginBottom: '4px' }}>जिजाऊ महिला सुरक्षा कक्ष</div>
            <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>महिला व युवतींसाठी स्वतंत्र समुपदेशन व सुरक्षा.</div>
          </div>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '14px', border: '1px solid #E6DDCE' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤝</div>
            <div style={{ fontWeight: 800, color: '#1A365D', fontSize: '1.1rem', marginBottom: '4px' }}>जिल्हास्तरावर प्रत्यक्ष धाव</div>
            <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>३६ जिल्ह्यांत स्थानिक समन्वयकांचे तात्काळ साहाय्य.</div>
          </div>
        </div>

        {/* Assistance Request Form */}
        <div style={{ background: '#FFF', borderRadius: '18px', padding: '32px', border: '1px solid #E6DDCE', boxShadow: '0 6px 24px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.5rem', color: '#3D0D0D', margin: '0 0 8px' }}>
            📩 साहाय्यासाठी ऑनलाइन विनंती नोंदवा
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
            आपली माहिती पूर्णपणे गोपनीय ठेवली जाईल आणि आमचे समन्वयक पुढील २ तासांत आपल्याशी संपर्क साधतील.
          </p>

          {submitted ? (
            <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', padding: '20px', borderRadius: '10px', color: '#2E7D32', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✓</div>
              <h3 style={{ margin: '0 0 6px' }}>आपली विनंती यशस्वीरीत्या नोंदवली गेली आहे!</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>स्थानिक मदत कक्ष आपल्याशी लवकरच संपर्क करेल. तातडीच्या मदतीसाठी कृपया १८००-१२३-१६७४ वर कॉल करा.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#2B2420', marginBottom: '4px' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={helpForm.name}
                    onChange={(e) => setHelpForm({ ...helpForm, name: e.target.value })}
                    placeholder="उदा. राहुल पाटील"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#2B2420', marginBottom: '4px' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={helpForm.mobile}
                    onChange={(e) => setHelpForm({ ...helpForm, mobile: e.target.value })}
                    placeholder="९८७६५ ४३२१०"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#2B2420', marginBottom: '4px' }}>जिल्हा</label>
                  <input
                    type="text"
                    value={helpForm.district}
                    onChange={(e) => setHelpForm({ ...helpForm, district: e.target.value })}
                    placeholder="उदा. पुणे, कोल्हापूर, नाशिक"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#2B2420', marginBottom: '4px' }}>मदतीचा प्रकार</label>
                  <select
                    value={helpForm.helpType}
                    onChange={(e) => setHelpForm({ ...helpForm, helpType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', boxSizing: 'border-box' }}>
                    <option>कायदेशीर सल्ला (Legal Aid)</option>
                    <option>वैद्यकीय व आरोग्य मदत</option>
                    <option>महिला सुरक्षा व समुपदेशन</option>
                    <option>शैक्षणिक / प्रवेश अडचण</option>
                    <option>इतर सामाजिक अडचण</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#2B2420', marginBottom: '4px' }}>अडचणीचे सविस्तर वर्णन</label>
                <textarea
                  rows="3"
                  value={helpForm.details}
                  onChange={(e) => setHelpForm({ ...helpForm, details: e.target.value })}
                  placeholder="आपल्या समस्येचा संक्षिप्त तपशील येथे लिहा..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}>
                मदत विनंती सादर करा →
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
