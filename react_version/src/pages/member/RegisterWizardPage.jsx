import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CMDB from '../../services/cmdb';

const PERSONAS = [
  { id: 'business', title: '💼 व्यावसायिक / उद्योजक', desc: 'स्वतःचा व्यवसाय वाढवण्यासाठी आणि इतर उद्योजकांशी जोडण्यासाठी' },
  { id: 'professional', title: '👔 नोकरदार / तज्ज्ञ', desc: 'विविध क्षेत्रातील कुशल तज्ज्ञ, सीए, वकील, डॉक्टर व इंजिनिअर्स' },
  { id: 'farmer', title: '🌾 शेतकरी / कृषी उद्योजक', desc: 'कृषी प्रक्रिया, शेतकरी गट आणि आधुनिक शेती तंत्रज्ञानासाठी' },
  { id: 'student', title: '🎓 विद्यार्थी / युवक', desc: 'करिअर मार्गदर्शन, स्पर्धा परीक्षा आणि कौशल्य विकासासाठी' },
  { id: 'activist', title: '🤝 सामाजिक कार्यकर्ता', desc: 'दुर्ग संवर्धन, रक्तदान व समाजोपयोगी उपक्रमांत योगदानासाठी' }
];

const INTERESTS = [
  '🚩 इतिहास व दुर्ग संवर्धन',
  '💼 व्यवसाय व उद्योग संगम',
  '🎓 स्पर्धा परीक्षा व शिक्षण',
  '🌾 कृषी तंत्रज्ञान व निर्यात',
  '🏥 आरोग्य व रक्तदान शिबिरे',
  '⚖️ विधी व कायदेशीर सल्ला'
];

export default function RegisterWizardPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personaRole: '💼 व्यावसायिक / उद्योजक',
    interests: ['🚩 इतिहास व दुर्ग संवर्धन', '💼 व्यवसाय व उद्योग संगम'],
    fullName: '',
    mobile: '',
    district: 'पुणे',
    city: 'पुणे',
    profession: '',
    business: ''
  });
  const [generatedId, setGeneratedId] = useState('');
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
      };
    });
  };

  const handleFinish = (e) => {
    e.preventDefault();
    const newId = 'CM-MH-2026-' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedId(newId);

    const payload = {
      id: newId,
      name: formData.fullName || 'नवीन सदस्य',
      mobile: formData.mobile,
      district: formData.district,
      city: formData.city,
      profession: formData.profession,
      business: formData.business,
      personaRole: formData.personaRole,
      interests: formData.interests,
      tier: 'Basic',
      joined: new Date().toISOString()
    };

    if (CMDB.upsertCurrentMember) {
      CMDB.upsertCurrentMember(payload);
    }
    if (updateProfile) {
      updateProfile(payload);
    }

    setStep(5);
  };

  return (
    <div className="container py-5" style={{ padding: '40px 16px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s !== 5 ? 1 : 'none' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: step >= s ? 'var(--saffron-500, #F4511E)' : '#E0E0E0',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {step > s ? '✓' : s}
            </div>
            {s !== 5 && (
              <div style={{ flex: 1, height: '4px', background: step > s ? 'var(--saffron-500, #F4511E)' : '#E0E0E0', margin: '0 8px' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        {/* Step 1: Persona */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--maroon-900, #D84315)', marginBottom: '8px' }}>
              पायरी १: तुमची भूमिका निवडा
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '24px' }}>
              तुम्ही या व्यासपीठावर प्रामुख्याने कोणत्या भूमिकेतून सहभागी होऊ इच्छिता?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PERSONAS.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setFormData({ ...formData, personaRole: p.title })}
                  style={{
                    border: formData.personaRole === p.title ? '2px solid var(--saffron-500, #F4511E)' : '1px solid #E0E0E0',
                    background: formData.personaRole === p.title ? '#FFF3E0' : '#FFFFFF',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    cursor: 'pointer'
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#222' }}>{p.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>{p.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '28px', textAlign: 'right' }}>
              <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                पुढील पायरी →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--maroon-900, #D84315)', marginBottom: '8px' }}>
              पायरी २: आवडीची कार्यक्षेत्रे निवडा
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px' }}>
              कोणत्या उपक्रमांमध्ये सहभागी होण्यास किंवा माहिती मिळवण्यास आवडेल?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {INTERESTS.map(item => {
                const active = formData.interests.includes(item);
                return (
                  <div 
                    key={item}
                    onClick={() => handleInterestToggle(item)}
                    style={{
                      border: active ? '2px solid var(--saffron-500, #F4511E)' : '1px solid #DDD',
                      background: active ? '#FFF3E0' : '#FFF',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                    <span>{active ? '☑️' : '◻️'}</span>
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                ← मागे
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                पुढील पायरी →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Geographic and Personal Information */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--maroon-900, #D84315)', marginBottom: '8px' }}>
              पायरी ३: वैयक्तिक व भौगोलिक माहिती
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px' }}>
              आपले नाव आणि जिल्हा प्रविष्ट करा.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>पूर्ण नाव *</label>
                <input 
                  type="text"
                  placeholder="उदा. राहुल प्रकाश मोरे"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>मोबाईल नंबर (WhatsApp) *</label>
                <input 
                  type="tel"
                  placeholder="उदा. 9822123456"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>जिल्हा</label>
                  <select 
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}>
                    <option value="पुणे">पुणे</option>
                    <option value="सातारा">सातारा</option>
                    <option value="कोल्हापूर">कोल्हापूर</option>
                    <option value="सांगली">सांगली</option>
                    <option value="सोलापूर">सोलापूर</option>
                    <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
                    <option value="नाशिक">नाशिक</option>
                    <option value="नागपूर">नागपूर</option>
                    <option value="ठाणे">ठाणे</option>
                    <option value="मुंबई">मुंबई</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>तालुका / शहर</label>
                  <input 
                    type="text"
                    placeholder="उदा. कोथरूड / बारामती"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button onClick={() => setStep(2)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                ← मागे
              </button>
              <button onClick={() => setStep(4)} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                पुढील पायरी →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Professional & Business Details */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--maroon-900, #D84315)', marginBottom: '8px' }}>
              पायरी ४: व्यवसाय व व्यवसायिक माहिती
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px' }}>
              इतर मराठा बांधवांना तुमच्या सेवांची माहिती मिळण्यासाठी व्यवसाय तपशील नोंदवा.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>व्यवसाय / फर्मचे नाव</label>
                <input 
                  type="text"
                  placeholder="उदा. सह्याद्री कन्स्ट्रक्शन प्रा. लि."
                  value={formData.business}
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>उद्योग वर्ग / प्रोफेशन</label>
                <input 
                  type="text"
                  placeholder="उदा. सिव्हिल इंजिनिअर, सीए, डिजिटल मार्केटिंग, कृषी प्रक्रिया"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ background: '#F9F9F9', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#555' }}>
                🔒 <strong>DPDP Act २०२३ संमती:</strong> आपली माहिती अखिल भारतीय मराठा महासंघाच्या सुरक्षित डेटाबेसमध्ये साठवली जाईल आणि केवळ समाजहितासाठी वापरली जाईल.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button onClick={() => setStep(3)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                ← मागे
              </button>
              <button onClick={handleFinish} className="btn btn-primary" style={{ padding: '10px 24px', background: 'var(--maroon-900, #D84315)' }}>
                नोंदणी पूर्ण करा ✓
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success & Generated Card */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--maroon-900, #D84315)', marginBottom: '8px' }}>
              नोंदणी यशस्वीरीत्या पूर्ण झाली!
            </h2>
            <p style={{ color: '#555', fontSize: '1rem', marginBottom: '20px' }}>
              अखिल भारतीय मराठा महासंघ परिवारात आपले सहर्ष स्वागत आहे.
            </p>

            <div style={{ background: '#FFF3E0', border: '1px dashed #D84315', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>आपला अधिकृत डिजिटल सदस्य आयडी</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--maroon-900, #D84315)' }}>
                {generatedId}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/card" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                🪪 डिजिटल स्मार्ट कार्ड पहा
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: '12px 24px' }}>
                👤 सदस्य डॅशबोर्डला जा
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
