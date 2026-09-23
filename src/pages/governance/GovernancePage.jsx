import React, { useState } from 'react';

export default function GovernancePage() {
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', district: 'पुणे', subject: '', message: '' });
  const [ticketSuccess, setTicketSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticketId = 'TKT-' + Math.floor(10000 + Math.random() * 90000);
    setTicketSuccess({
      ticketId,
      name: contactForm.name,
      subject: contactForm.subject
    });
    setContactForm({ name: '', phone: '', email: '', district: 'पुणे', subject: '', message: '' });
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              🏛️ Connect Maratha
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              प्रशासन, ध्येयधोरणे व संपर्क केंद्र (Governance)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              पारदर्शक कारभार, लोकशाही मूल्ये, युवा नेतृत्व आणि ३६ जिल्ह्यांमधील समन्वय यंत्रणेची संपूर्ण माहिती.
            </p>
          </div>
        </div>

        {/* 2-Column: Governance Principles + Interactive Contact/Help Desk */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Left Column: Mission, Vision, Council & DPDP Charter */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#C73800', margin: '0 0 16px', fontFamily: 'Baloo 2' }}>
                🚩 संस्थेची उद्दिष्टे व कार्यप्रणाली
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#4B5563', lineHeight: 1.8, marginBottom: '16px' }}>
                Connect Maratha हे मराठा समाजाच्या सर्वांगीण विकासासाठी, शैक्षणिक समृद्धीसाठी, उद्योजकता वाढीसाठी आणि ऐतिहासिक वारसा जतनासाठी कटिबद्ध आहे.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#FFF8F2', padding: '14px 18px', borderRadius: '10px', borderLeft: '4px solid #C73800' }}>
                  <div style={{ fontWeight: 700, color: '#C73800', marginBottom: '4px' }}>१. व्यवसाय संगम व आर्थिक स्वावलंबन</div>
                  <div style={{ fontSize: '0.88rem', color: '#555' }}>राज्यातील प्रत्येक मराठा उद्योजकाला आंतरराष्ट्रीय बाजारपेठ आणि स्थानिक व्यवसाय नेटवर्कशी जोडणे.</div>
                </div>

                <div style={{ background: '#FFF8F2', padding: '14px 18px', borderRadius: '10px', borderLeft: '4px solid #C73800' }}>
                  <div style={{ fontWeight: 700, color: '#C73800', marginBottom: '4px' }}>२. शैक्षणिक व स्पर्धा परीक्षा साहाय्य</div>
                  <div style={{ fontSize: '0.88rem', color: '#555' }}>MPSC/UPSC, सैनिकी सेवा आणि उच्च शिक्षणासाठी होतकरू विद्यार्थ्यांना थेट शिष्यवृत्ती व मार्गदर्शन.</div>
                </div>

                <div style={{ background: '#FFF8F2', padding: '14px 18px', borderRadius: '10px', borderLeft: '4px solid #C73800' }}>
                  <div style={{ fontWeight: 700, color: '#C73800', marginBottom: '4px' }}>३. ३५०+ गड-किल्ले संवर्धन</div>
                  <div style={{ fontSize: '0.88rem', color: '#555' }}>सह्याद्रीतील गडकोटांचे जतन, स्वच्छता मोहिमा आणि ऐतिहासिक संशोधनाला सर्वतोपरी पाठबळ.</div>
                </div>
              </div>
            </div>

            {/* DPDP 2023 Compliance */}
            <div style={{ background: '#F0FDF4', borderRadius: '16px', padding: '24px', border: '1px solid #BBF7D0' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#166534', margin: '0 0 10px' }}>
                🛡️ डिजिटल वैयक्तिक डेटा संरक्षण (DPDP 2023)
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                Connect Maratha हे व्यासपीठ भारताच्या <strong>Digital Personal Data Protection Act, 2023</strong> चे काटेकोर पालन करते. प्रत्येक सदस्याचा डेटा एनक्रिप्टेड असून, परवानगीशिवाय कोणताही वैयक्तिक डेटा त्रयस्थ पक्षासोबत सामायिक केला जात नाही.
              </p>
            </div>
          </div>

          {/* Right Column: Contact & Support Desk Form */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#C73800', margin: '0 0 16px', fontFamily: 'Baloo 2' }}>
                ✉️ थेट संपर्क व साहाय्यता कक्ष
              </h2>

              {ticketSuccess ? (
                <div style={{ background: '#F0FDF4', border: '2px dashed #86EFAC', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>📩</div>
                  <h3 style={{ color: '#2E7D32', margin: '0 0 8px' }}>संदेश यशस्वीरित्या प्राप्त झाला!</h3>
                  <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 12px' }}>
                    आपला तिकीट आयडी: <strong>{ticketSuccess.ticketId}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                    समन्वय समितीचे प्रतिनिधी २४ तासांच्या आत आपल्याशी संपर्क साधतील.
                  </p>
                  <button
                    onClick={() => setTicketSuccess(null)}
                    style={{ marginTop: '16px', background: '#C73800', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    नवीन संदेश पाठवा
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>नाव *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="आपले संपूर्ण नाव"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>फोन नंबर *</label>
                      <input
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="9876500000"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>जिल्हा</label>
                      <input
                        type="text"
                        value={contactForm.district}
                        onChange={(e) => setContactForm({ ...contactForm, district: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>विषय *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="उदा. सदस्य नोंदणी, व्यवसाय संगम, मदत"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>संदेश / तक्रार / साहाय्य *</label>
                    <textarea
                      rows="3"
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="आपला संदेश येथे लिहा..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ width: '100%', background: '#C73800', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                    संदेश पाठवा 🚀
                  </button>
                </form>
              )}
            </div>

            {/* Central Office Card */}
            <div style={{ background: '#FFF8F2', borderRadius: '16px', padding: '24px', border: '1px solid #FFCC80' }}>
              <div style={{ fontWeight: 800, color: '#C73800', fontSize: '1.1rem', marginBottom: '8px' }}>
                📍 मध्यवर्ती कार्यालय
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 12px' }}>
                Connect Maratha भवन,<br />
                नारायण पेठ, छत्रपती शिवाजी महाराज चौक,<br />
                पुणे – ४११०३०, महाराष्ट्र, भारत.
              </p>
              <div style={{ fontSize: '0.9rem', color: '#C73800', fontWeight: 700 }}>
                📞 २४/७ हेल्पलाईन: १८००-२३३-१९८१<br />
                ✉️ ईमेल: contact@connectmaratha.org
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
