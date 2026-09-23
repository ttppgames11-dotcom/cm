import React, { useState } from 'react';

export default function MarathaBankPage() {
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'institute'
  const [accountModal, setAccountModal] = useState(false);
  const [courseModal, setCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formDone, setFormDone] = useState(false);

  // Interest Rates Table
  const interestRates = [
    { type: 'बचत खाते (Savings Account)', rate: '३.५०%' },
    { type: '१ वर्ष मुदत ठेव (1 Year FD)', rate: '६.७५%' },
    { type: '२ वर्ष मुदत ठेव (2 Year FD)', rate: '७.२५%' },
    { type: '३ वर्ष मुदत ठेव (3 Year FD)', rate: '७.७५%' },
    { type: '५ वर्ष मुदत ठेव (5 Year FD)', rate: '८.२५%' }
  ];

  // Banking Loans
  const loans = [
    { title: 'वैयक्तिक कर्ज', desc: 'गरजा तुमच्या, साथ आमची', icon: '👤', rate: '१०.५% पासून' },
    { title: 'गृह कर्ज', desc: 'स्वप्नातील घर आता होईल साकार', icon: '🏡', rate: '८.४०% पासून' },
    { title: 'व्यवसाय कर्ज', desc: 'व्यवसाय वाढीसाठी भक्कम साथ', icon: '💼', rate: '९.२५% पासून' },
    { title: 'वाहन कर्ज', desc: 'आपल्या स्वप्नातील वाहनासाठी', icon: '🚗', rate: '८.७५% पासून' },
    { title: 'शैक्षणिक कर्ज', desc: 'शिक्षणासाठी आम्ही सोबत आहोत', icon: '🎓', rate: '७.५०% पासून' },
    { title: 'कृषी कर्ज', desc: 'शेतकऱ्यांच्या प्रगतीसाठी विशेष योजना', icon: '🌾', rate: '४.००% सवलत' }
  ];

  // Financial Institute Courses
  const courses = [
    {
      id: 1,
      title: 'शेअर बाजार ट्रेडिंग कोर्स',
      level: 'मूलभूत ते प्रगत स्तर (Basic to Pro)',
      duration: '२ महिने',
      icon: '📈',
      highlights: 'टेक्निकल ॲनालिसिस, फ्युचर्स & ऑप्शन्स, लाईव्ह मार्केट प्रॅक्टिस'
    },
    {
      id: 2,
      title: 'म्युच्युअल फंड इन्व्हेस्टमेंट कोर्स',
      level: 'SIP, SWP आणि पोर्टफोलिओ व्यवस्थापन',
      duration: '१ महिना',
      icon: '📊',
      highlights: 'फंड सिलेक्शन, रिस्क मॅनेजमेंट, निवृत्ती नियोजन'
    },
    {
      id: 3,
      title: 'विमा सल्लागार प्रशिक्षण कार्यक्रम',
      level: 'जीवन व सामान्य विमा संपूर्ण प्रशिक्षण',
      duration: '१.५ महिने',
      icon: '🛡️',
      highlights: 'IRDAI परीक्षा तयारी, पॉलिसी मॅपिंग, बिझनेस ग्रोथ'
    },
    {
      id: 4,
      title: 'बँकिंग & फायनान्स प्रोफेशनल कोर्स',
      level: 'क्रेडिट, फायनान्स व्यवहार आणि अनुपालन',
      duration: '२ महिने',
      icon: '🏛️',
      highlights: 'बँक ऑपरेशन्स, लोन प्रोसेसिंग, १००% प्लेसमेंट सहाय्य'
    }
  ];

  return (
    <div className="maratha-bank-page" style={{ background: '#FBF9F5', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Top Selector: Bank vs Financial Institute */}
      <div style={{ background: '#212121', padding: '12px 20px', borderBottom: '2px solid #E65100' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ color: '#FFE082', fontWeight: 800, fontSize: '0.95rem' }}>
            🚩 CONNECT मराठा — अर्थ व समृद्धी विभाग
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('bank')}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === 'bank' ? '#E65100' : 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              🏦 मराठा बँक™
            </button>
            <button
              onClick={() => setActiveTab('institute')}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === 'institute' ? '#E65100' : 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              🎓 मराठा फायनान्शियल इन्स्टिट्यूट
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'bank' ? (
        <>
          {/* Bank Hero Banner */}
          <section style={{
            background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.90) 0%, rgba(46, 125, 50, 0.88) 100%), url("/assets/images/generated/maratha_bank_hero.jpg") center/cover no-repeat',
            color: '#FFFFFF',
            padding: '48px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            <div style={{ maxWidth: '980px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '5px 18px',
                borderRadius: '20px',
                fontSize: '0.86rem',
                fontWeight: 700,
                marginBottom: '14px',
                color: '#FFD54F'
              }}>
                एक लढा ! एक समाज ! एक भविष्य !
              </div>
              <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0 0 10px', textShadow: '0 3px 10px rgba(0,0,0,0.3)' }}>
                मराठा बँक™
              </h1>
              <p style={{ fontSize: '1.3rem', fontWeight: 600, color: '#FFF59D', margin: '0 0 8px' }}>
                आपली बँक, आपला अभिमान ! विश्वास, सेवा आणि समृद्धीची परंपरा
              </p>
              <p style={{ fontSize: '1.05rem', opacity: 0.95, margin: '0 auto 24px' }}>
                || जय भवानी ! जय शिवाजी ! || मराठी माणसाच्या आर्थिक प्रगतीसाठी हक्काची बँक
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setAccountModal(true)}
                  style={{
                    background: '#FFD54F',
                    color: '#1B5E20',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  ⚡ नवीन खाते उघडा
                </button>
                <a
                  href="#bank-rates"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  💰 व्याजदर पहा (८.२५% पर्यंत)
                </a>
              </div>
            </div>
          </section>

          {/* 4 Pillars */}
          <section style={{ maxWidth: '1180px', margin: '-24px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              {[
                { title: 'सुरक्षित', sub: 'आपला पैसा १००% सुरक्षित', icon: '🔒', color: '#1B5E20' },
                { title: 'विश्वासार्ह', sub: 'शतकांचा अढळ विश्वास', icon: '🤝', color: '#0D47A1' },
                { title: 'समृद्धी', sub: 'आपल्या व्यवसायाच्या प्रगतीसाठी', icon: '🌱', color: '#E65100' },
                { title: 'समर्पित', sub: 'मराठी माणसासाठी हक्काची सेवा', icon: '🚩', color: '#B71C1C' }
              ].map((p, i) => (
                <div key={i} style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  border: '1px solid #EADBCE',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '2.2rem' }}>{p.icon}</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: p.color, margin: '8px 0 4px' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>{p.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bank Services Grid */}
          <section style={{ maxWidth: '1180px', margin: '40px auto 0', padding: '0 16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1A17', textAlign: 'center', marginBottom: '24px' }}>
              आमच्या प्रमुख बँकिंग सेवा
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '14px',
              textAlign: 'center'
            }}>
              {[
                { name: 'खाते उघडा', icon: '📝', action: () => setAccountModal(true) },
                { name: 'मोबाईल बँकिंग', icon: '📱', action: () => alert('मराठा बँक ॲप लवकरच उपलब्ध!') },
                { name: 'इंटरनेट बँकिंग', icon: '💻', action: () => alert('नेट बँकिंग पोर्टलवर पुनर्निर्देशित करत आहे...') },
                { name: 'फंड ट्रान्सफर', icon: '💸', action: () => alert('RTGS/NEFT/IMPS सेवा सक्रिय') },
                { name: 'UPI पेमेंट', icon: '📲', action: () => alert('QR द्वारे अखंड UPI व्यवहार') },
                { name: 'बिल पेमेंट', icon: '🧾', action: () => alert('लाईट बिल, पाणी बिल, फोन बिल पेमेंट') },
                { name: 'कार्ड सेवा', icon: '💳', action: () => alert('RuPay प्लॅटिनम डेबिट कार्ड') },
                { name: 'ग्राहक सेवा', icon: '📞', action: () => alert('मराठा बँक हेल्पलाईन: १८००-१२३-१६७४') }
              ].map((srv, idx) => (
                <div
                  key={idx}
                  onClick={srv.action}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '20px 10px',
                    border: '1px solid #E8DFD8',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '2.2rem' }}>{srv.icon}</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#333', marginTop: '8px' }}>{srv.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Accounts & FD Interest Rates Table */}
          <section id="bank-rates" style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Account Types */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #EADBCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B5E20', margin: '0 0 16px' }}>
                  आमची खाती (Accounts)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#F1F8E9', borderRadius: '10px', borderLeft: '5px solid #2E7D32' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#1B5E20' }}>मराठा बचत खाते</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>सुलभ बचत, मोफत डेबिट कार्ड, ३.५०% वार्षिक व्याज.</p>
                  </div>
                  <div style={{ padding: '16px', background: '#FFF8E1', borderRadius: '10px', borderLeft: '5px solid #F57F17' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#F57F17' }}>मराठा चालू खाते</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>व्यावसायिकांसाठी सर्वोत्तम, अमर्यादित व्यवहार, ओव्हरड्राफ्ट सुविधा.</p>
                  </div>
                  <div style={{ padding: '16px', background: '#E8EAF6', borderRadius: '10px', borderLeft: '5px solid #283593' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#283593' }}>मराठा मुदत ठेव (Fixed Deposit)</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>जास्त व्याजदर, निश्चित हमी परतावा, ज्येष्ठ नागरिकांना ०.५०% जास्त.</p>
                  </div>
                </div>
              </div>

              {/* Interest Rate Table */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #EADBCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 6px' }}>
                  व्याजदर (वार्षिक - Annual Rates)
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#666', margin: '0 0 16px' }}>
                  मराठी माणसाच्या घामाच्या पैशाला सर्वोत्तम परतावा
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF3E0', borderBottom: '2px solid #FFE0B2' }}>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#E65100' }}>ठेवीचा प्रकार</th>
                      <th style={{ padding: '10px', textAlign: 'right', color: '#E65100' }}>व्याजदर</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interestRates.map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EEEEEE' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#333' }}>{r.type}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: '#2E7D32' }}>{r.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() => setAccountModal(true)}
                  style={{
                    width: '100%',
                    background: '#2E7D32',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  मुदत ठेव (FD) सुरू करा
                </button>
              </div>
            </div>
          </section>

          {/* Loans Section */}
          <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1A17', textAlign: 'center', marginBottom: '24px' }}>
              आमची कर्जे (Loan Solutions)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {loans.map((ln, idx) => (
                <div key={idx} style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '22px',
                  border: '1px solid #EADBCE',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    background: '#FFF3E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    flexShrink: 0
                  }}>
                    {ln.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#2E1A17' }}>{ln.title}</h4>
                      <span style={{ fontSize: '0.78rem', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        {ln.rate}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#666' }}>{ln.desc}</p>
                    <button
                      onClick={() => alert(`${ln.title} साठी अर्ज प्रक्रिया: Connect Maratha हेल्पलाईन १८००-१२३-१६७४ वर संपर्क करा.`)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #E65100',
                        color: '#E65100',
                        padding: '4px 14px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      अधिक माहिती →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bank Statistics */}
          <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1B5E20 0%, #004D40 100%)',
              borderRadius: '16px',
              padding: '40px 24px',
              color: '#FFFFFF',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#FFD54F' }}>
                बँकेची विश्वासार्ह आकडेवारी
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>२५०+</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>शाखा संपूर्ण महाराष्ट्रात</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>५००+</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>ATM केंद्रे</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>१० लाख+</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>समाधानी ग्राहक</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>₹२५,००० कोटी+</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>व्यवहार क्षमता</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>१००%</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>सुरक्षित बँकिंग</div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Financial Institute Section */
        <>
          {/* Institute Hero */}
          <section style={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #00838F 100%)',
            color: '#FFFFFF',
            padding: '48px 20px',
            textAlign: 'center'
          }}>
            <div style={{ maxWidth: '980px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '5px 18px',
                borderRadius: '20px',
                fontSize: '0.86rem',
                fontWeight: 700,
                marginBottom: '14px',
                color: '#FFD54F'
              }}>
                ज्ञान • संपत्ती • स्वातंत्र्य — एक लढा ! एक समाज ! एक भविष्य !
              </div>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 10px' }}>
                मराठा फायनान्शियल इन्स्टिट्यूट
              </h1>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#BBDEFB', margin: '0 0 8px' }}>
                आर्थिक ज्ञानातून समृद्धीचा विजय मिळवा ! शिका • समजा • गुंतवा • वाढवा
              </p>
              <p style={{ fontSize: '1.05rem', opacity: 0.95, margin: '0 auto 24px' }}>
                मराठा समाजासाठी, मराठा समाजाच्या आर्थिक उन्नतीसाठी समर्पित व्यावसायिक प्रशिक्षण
              </p>

              <button
                onClick={() => setCourseModal(true)}
                style={{
                  background: '#FFD54F',
                  color: '#0D47A1',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                कोर्स प्रवेश घ्या (Admission Open)
              </button>
            </div>
          </section>

          {/* Live Market Ticker */}
          <div style={{ background: '#263238', color: '#FFFFFF', padding: '14px 20px' }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFCA28' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#00E676', animation: 'pulse 1.5s infinite' }}></span>
                आजचे बाजार अपडेट (Live Market):
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.92rem' }}>
                <div>
                  <strong>NIFTY 50:</strong> <span style={{ color: '#00E676' }}>२२,५३२.४५ ▲ ०.८६%</span>
                </div>
                <div>
                  <strong>SENSEX:</strong> <span style={{ color: '#00E676' }}>७४,१०५.३२ ▲ ०.७४%</span>
                </div>
                <div>
                  <strong>NIFTY BANK:</strong> <span style={{ color: '#00E676' }}>४८,७६२.१५ ▲ १.०२%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Courses */}
          <section style={{ maxWidth: '1180px', margin: '40px auto 0', padding: '0 16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0D47A1', textAlign: 'center', marginBottom: '24px' }}>
              लोकप्रिय प्रशिक्षण कार्यक्रम (Popular Courses)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {courses.map((c) => (
                <div key={c.id} style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #CFD8DC',
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ background: '#E3F2FD', padding: '24px 20px', textAlign: 'center', borderBottom: '1px solid #BBDEFB' }}>
                    <span style={{ fontSize: '2.5rem' }}>{c.icon}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D47A1', margin: '10px 0 4px' }}>{c.title}</h3>
                    <span style={{ fontSize: '0.82rem', background: '#BBDEFB', color: '#0D47A1', padding: '2px 10px', borderRadius: '10px', fontWeight: 700 }}>
                      कालावधी: {c.duration}
                    </span>
                  </div>
                  <div style={{ padding: '18px 20px', flex: 1, fontSize: '0.88rem', color: '#444' }}>
                    <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{c.level}</p>
                    <div style={{ color: '#555', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      <strong>वैशिष्ट्ये:</strong> {c.highlights}
                    </div>
                  </div>
                  <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                    <button
                      onClick={() => { setSelectedCourse(c); setCourseModal(true); }}
                      style={{
                        width: '100%',
                        background: '#0D47A1',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      माहिती पहा & प्रवेश घ्या
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Services & Certifications */}
          <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', border: '1px solid #CFD8DC', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#263238', margin: '0 0 20px', textAlign: 'center' }}>
                आमचे सहयोगी व प्रमाणपत्र संस्था
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center', opacity: 0.9 }}>
                {['NSE Academy', 'BSE Institute', 'NISM Certified', 'AMFI Registered', 'IRDAI Compliant', 'NSDL Partner'].map((p, idx) => (
                  <div key={idx} style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#ECEFF1',
                    fontWeight: 700,
                    color: '#37474F',
                    fontSize: '0.92rem'
                  }}>
                    ✓ {p}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Modal: Open Bank Account */}
      {accountModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => { setAccountModal(false); setFormDone(false); }} style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            <h3 style={{ color: '#1B5E20', margin: '0 0 8px', fontSize: '1.3rem' }}>मराठा बँक खाते उघडा</h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '16px' }}>घरबसल्या ५ मिनिटांत डिजिटल खाते उघडा.</p>
            {formDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h4 style={{ color: '#2E7D32', margin: '10px 0' }}>आपला अर्ज नोंदवला गेला आहे!</h4>
                <p style={{ fontSize: '0.88rem', color: '#555' }}>बँकेचे प्रतिनिधी KYC प्रक्रियेसाठी संपर्क करतील.</p>
                <button onClick={() => { setAccountModal(false); setFormDone(false); }} style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}>पूर्ण झाले</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormDone(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required type="tel" placeholder="१० अंकी मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required placeholder="आधार क्रमांक / पॅन क्रमांक *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                    <option>बचत खाते (Savings Account - ३.५०%)</option>
                    <option>चालू खाते (Current Account)</option>
                    <option>मुदत ठेव (Fixed Deposit - ८.२५% पर्यंत)</option>
                  </select>
                  <input required placeholder="शहर / जिल्हा *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <button type="submit" style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    खाते उघडण्यासाठी अर्ज करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Course Admission */}
      {courseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => { setCourseModal(false); setFormDone(false); }} style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            <h3 style={{ color: '#0D47A1', margin: '0 0 8px', fontSize: '1.3rem' }}>
              {selectedCourse ? selectedCourse.title : 'कोर्स प्रवेश नोंदणी'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '16px' }}>
              मराठा विद्यार्थ्यांसाठी विशेष शिष्यवृत्ती व सवलत उपलब्ध.
            </p>
            {formDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎓</span>
                <h4 style={{ color: '#0D47A1', margin: '10px 0' }}>प्रवेश नोंदणी यशस्वी झाली!</h4>
                <p style={{ fontSize: '0.88rem', color: '#555' }}>आमचे करिअर कौन्सिलर बॅच वेळापत्रकासाठी संपर्क करतील.</p>
                <button onClick={() => { setCourseModal(false); setFormDone(false); }} style={{ background: '#0D47A1', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}>पूर्ण झाले</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormDone(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="विद्यार्थ्याचे नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required type="email" placeholder="ईमेल आयडी" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required placeholder="शिक्षण / व्यवसाय" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <button type="submit" style={{ background: '#0D47A1', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    प्रवेश निश्चित करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
