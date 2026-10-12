import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCharterModal, setShowCharterModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'vision', 'mission', 'values', 'story', 'org', 'leadership'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    window.location.hash = tabKey;
    if (tabKey === 'leadership') {
      const council = document.getElementById('council');
      if (council) {
        council.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const downloadCharterFile = () => {
    const charterText = `=====================================================
CONNECT MARATHA — समुदाय सनद व संस्थात्मक घटना (CHARTER)
Connect Maratha (Section 8 Non-Profit Framework)
=====================================================

१. स्वायत्त व नफाविरहित रचना:
Connect Maratha हे कंपनी कायदा २०१३ च्या कलम ८ अंतर्गत नोंदणीकृत असून, कोणत्याही राजकीय पक्षापासून अलिप्त आणि पूर्णपणे स्वायत्त आहे.

२. उद्दिष्टे:
- ३५०+ गड-किल्ल्यांचे अस्सल ऐतिहासिक संवर्धन व डिजिटायझेशन.
- व्यवसाय संगम द्वारे मराठी उद्योजक, शेतकरी व व्यावसायिकांना थेट B2B संधी.
- गरजू विद्यार्थ्यांना स्पर्धा परीक्षा, उच्च शिक्षण व सैनिकी भरती साहाय्य.
- २४x७ आपत्कालीन रक्तदाता नेटवर्क व सामाजिक सुरक्षा.

३. डिजिटल गोपनीयता (DPDP Act 2023):
कोणत्याही सदस्याची वैयक्तिक माहिती, फोन नंबर किंवा ओळखपत्र परवानगीशिवाय त्रयस्थ पक्षाला दिली जाणार नाही. सर्व व्यवहार सुरक्षित आणि एनक्रिप्टेड आहेत.

४. शून्य प्रशासकीय नफा (Zero Administrative Profit):
व्यासपीठावर मिळणारा प्रत्येक निधी थेट समाजकल्याण, दुर्गसंवर्धन आणि विद्यार्थी शिष्यवृत्तीसाठी १००% सार्वजनिक पारदर्शकतेसह खर्च केला जातो.

तारीख: २०२६-२७
सल्लागार मंडळ: डॉ. जयसिंगराव पवार, ॲड. विश्वासराव पाटील, प्रा. अनुराधा मोरे, कर्नल विजयराव साळुंखे.
=====================================================`;

    const blob = new Blob([charterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Connect_Maratha_Charter_2026.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📜 कनेक्ट मराठा समुदाय सनद (Charter) डाऊनलोड यशस्वी!');
    setShowCharterModal(false);
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--maroon-950, #140406)',
          color: 'var(--gold-400, #F3C06B)',
          border: '1px solid var(--gold-500, #E0A96D)',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <span>🚩</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP SUB-BAR */}
      <div style={{ background: '#1c0507', color: '#fff', padding: '6px 24px', fontSize: '0.82rem' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>🚩 CONNECT MARATHA</span>
            <span style={{ color: 'var(--text-sec)', opacity: 0.8 }}>इतिहास जपूया • समाज जोडूया • भविष्य घडवूया</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>📞 समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
            <Link to="/achievers" style={{ color: 'var(--gold-400)', textDecoration: 'none', fontWeight: 600 }}>🏆 हॉल ऑफ फेम</Link>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="hero" style={{ position: 'relative', minHeight: '460px', overflow: 'hidden', display: 'flex', alignItems: 'center', background: '#120204' }}>
        <img 
          src="/assets/images/connect-maratha-council.jpg" 
          alt="Connect Maratha Advisory Council" 
          className="hero-bg-img" 
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38)' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(20,4,6,0.6), rgba(12,2,4,0.95) 85%)' }}></div>
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1300px', margin: '0 auto', padding: '64px 24px', color: '#fff', width: '100%' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 700 }}>
            Spec Page 2 • Institutional Framework
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.15, color: '#fff', margin: '8px 0 16px', fontFamily: 'Baloo 2' }}>
            आमच्याबद्दल — <span style={{ background: 'linear-gradient(90deg, #F3C06B, #FF8C42)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connect Maratha</span>
          </h1>
          <div style={{ background: 'var(--gold-500, #E0A96D)', width: '80px', height: '4px', marginBottom: '18px' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.12rem', maxWidth: '68ch', lineHeight: 1.6 }}>
            इतिहासाचे अस्सल संवर्धन, आधुनिक पिढीची विधायक जोडणी आणि सक्षम भविष्यनिर्मिती • अभ्यासक, विचारवंत, तंत्रज्ञान तज्ज्ञ व समाजसेवकांचे स्वतंत्र लोकसहभागी डिजिटल महाव्यासपीठ.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => setShowCharterModal(true)} 
              className="btn btn-primary" 
              style={{ padding: '12px 24px', fontWeight: 700, cursor: 'pointer', background: 'var(--saffron-600, #C73800)', border: 'none', borderRadius: '8px', color: '#fff' }}
            >
              📜 समुदाय सनद (Charter) डाऊनलोड करा
            </button>
            <button 
              type="button" 
              onClick={() => handleTabSwitch('leadership')} 
              className="btn btn-outline" 
              style={{ padding: '12px 24px', color: '#fff', borderColor: 'var(--gold-400)', background: 'transparent', borderRadius: '8px', cursor: 'pointer', border: '1px solid #F3C06B' }}
            >
              👥 सल्लागार मंडळ पहा
            </button>
            <Link 
              to="/achievers" 
              className="btn" 
              style={{ padding: '12px 24px', color: 'var(--gold-400)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', fontWeight: 600 }}
            >
              🏆 अचीव्हर्स दालन
            </Link>
          </div>
        </div>
      </div>

      {/* SUBPAGES TAB BAR (Route: /about/*) */}
      <div className="subpage-nav-bar" style={{ position: 'sticky', top: '0px', zIndex: 850, background: 'var(--paper, #fff)', borderBottom: '2px solid var(--border, #E5E7EB)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'overview', label: '🏛️ परिचय (/about)' },
            { id: 'vision', label: '🎯 दृष्टी (Vision)' },
            { id: 'mission', label: '🚩 ध्येय (Mission)' },
            { id: 'values', label: '💎 मूल्ये (Values)' },
            { id: 'story', label: '📖 आमची गाथा (Story)' },
            { id: 'org', label: '🏢 संघटना (Organization)' },
            { id: 'leadership', label: '👥 नेतृत्व मंडळ (Leadership)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSwitch(tab.id)}
              style={{
                padding: '14px 18px',
                fontWeight: activeTab === tab.id ? 700 : 600,
                color: activeTab === tab.id ? 'var(--saffron-600, #C73800)' : 'var(--text, #333)',
                borderBottom: activeTab === tab.id ? '3px solid var(--saffron-600, #C73800)' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.92rem',
                borderBottomStyle: 'solid',
                borderBottomWidth: activeTab === tab.id ? '3px' : '0'
              }}
            >
              {tab.label}
            </button>
          ))}
          <Link
            to="/network"
            style={{
              padding: '14px 18px',
              fontWeight: 700,
              color: 'var(--gold-600, #B8860B)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontSize: '0.92rem',
              background: 'rgba(224,169,109,0.12)',
              borderRadius: '6px 6px 0 0',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            🗺️ महाराष्ट्र नेटवर्क (/network) →
          </Link>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & MISSION & PHILOSOPHY */}
      {activeTab === 'overview' && (
        <div id="tab-overview" className="about-tab-content">
          <section className="section" style={{ padding: '56px 24px' }}>
            <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  आमचे मूलभूत ध्येय
                </span>
                <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>संस्कृती, स्वाभिमान व समृद्धीचे व्यासपीठ</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.05rem' }}>"जपा इतिहास • जपा संस्कृती • सन्मान करा कर्तृत्वाचा • जोडा समाज • घडवा भविष्य"</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
                <div className="card" style={{ padding: '28px', borderRadius: '14px', borderLeft: '4px solid var(--saffron-600, #C73800)', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--maroon-900, #3d0d0d)', fontFamily: 'Baloo 2' }}>१. इतिहास व वारसा संवर्धन</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>
                    छत्रपती शिवाजी महाराज व छत्रपती संभाजी महाराजांच्या स्वराज्याची विचारधारा, गड-किल्ल्यांचे जतन आणि ऐतिहासिक साधनांची सत्यता जपणे. विकृतीकरणाला विरोध करून संशोधनधारित इतिहास पुढील पिढीपर्यंत पोहोचवणे.
                  </p>
                </div>
                <div className="card" style={{ padding: '28px', borderRadius: '14px', borderLeft: '4px solid var(--gold-500, #E0A96D)', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--maroon-900, #3d0d0d)', fontFamily: 'Baloo 2' }}>२. उद्योग व व्यावसायिक सक्षमीकरण</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>
                    मराठी तरुणांमध्ये उद्योजकतेची बीजे रोवणे, 'व्यवसाय संगम'च्या माध्यमातून स्थानिक व जागतिक पातळीवर परस्परांना उद्योग-व्यवसाय मिळवून देणे आणि आर्थिक सक्षमीकरणाचा मार्ग प्रशस्त करणे.
                  </p>
                </div>
                <div className="card" style={{ padding: '28px', borderRadius: '14px', borderLeft: '4px solid #2E7D32', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--maroon-900, #3d0d0d)', fontFamily: 'Baloo 2' }}>३. शिक्षण, करिअर व सामाजिक एकता</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>
                    गरजू विद्यार्थ्यांना शिष्यवृत्ती व स्पर्धा परीक्षांचे मार्गदर्शन देणे, आपत्कालीन रक्तपुरवठा व वैद्यकीय साहाय्य करणे आणि महिला नेतृत्वाला सर्व क्षेत्रांत बळ देणे.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: VISION (/about/vision) */}
      {activeTab === 'vision' && (
        <div id="tab-vision" className="about-tab-content">
          <section className="section" style={{ padding: '56px 24px', background: 'var(--paper-2, #FBF5EC)' }}>
            <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--saffron-600, #C73800)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  दूरदृष्टी • VISION 2030
                </span>
                <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>ग्लोबल मराठा: आर्थिक व बौद्धिक महाशक्ती</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.05rem' }}>२०३० पर्यंत जगभरातील ५ कोटी मराठा समाजाला जोडणारे सर्वात विश्वासू व स्वतंत्र डिजिटल व्यासपीठ.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏰</div>
                  <h3 style={{ marginBottom: '8px', color: '#140406', fontFamily: 'Baloo 2' }}>३५०+ गड-किल्ल्यांचे १००% डिजिटायझेशन</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>प्रत्येक किल्ल्याचा अस्सल इतिहास, ३६०° आभासी दर्शन, संवर्धन कृती आराखडा आणि आंतरराष्ट्रीय पातळीवर शिवकालीन स्थापत्यकलेचा प्रचार.</p>
                </div>
                <div className="card" style={{ padding: '24px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💼</div>
                  <h3 style={{ marginBottom: '8px', color: '#140406', fontFamily: 'Baloo 2' }}>₹ १०,००० कोटींचा वार्षिक B2B व्यापार</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>'व्यवसाय संगम' चॅप्टर्सच्या माध्यमातून मराठी उद्योजक व व्यावसायिकांना थेट राष्ट्रीय व आंतरराष्ट्रीय खरेदीदारांशी जोडून आर्थिक संपन्नता निर्माण करणे.</p>
                </div>
                <div className="card" style={{ padding: '24px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎓</div>
                  <h3 style={{ marginBottom: '8px', color: '#140406', fontFamily: 'Baloo 2' }}>१ लाख मराठा युवा करिअर सक्षमीकरण</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>UPSC, MPSC, आयटी, आर्टिफिशिअल इंटेलिजन्स आणि संरक्षण दलात मराठा तरुणांचे प्रमाण सर्वोच्च पातळीवर नेणे.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: MISSION (/about/mission) */}
      {activeTab === 'mission' && (
        <div id="tab-mission" className="about-tab-content">
          <section className="section" style={{ padding: '56px 24px' }}>
            <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  ध्येयस्तंभ • MISSION PILLARS
                </span>
                <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>आमचे ५ मुख्य कार्यस्तंभ</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--saffron-500, #E65100)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#140406' }}>१. अस्सल ऐतिहासिक ज्ञाननिर्मिती</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', marginTop: '6px', lineHeight: 1.5 }}>ऐतिहासिक साधनांचे (बखरी, मोडी लिपी कागदपत्रे, अस्सल फर्मान) संकलन व सार्वजनिक डिजिटल ग्रंथालय.</p>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--gold-500, #E0A96D)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#140406' }}>२. स्वयंपूर्ण व्यवसाय मंडळे</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', marginTop: '6px', lineHeight: 1.5 }}>३६ जिल्ह्यांत ५००+ व्यवसाय संगम चॅप्टर्सची स्थापना आणि शून्य मध्यस्थी व्यापार.</p>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #2E7D32', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#140406' }}>३. आपत्कालीन सेवा व रक्तदाते नेटवर्क</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', marginTop: '6px', lineHeight: 1.5 }}>महाराष्ट्रातील ३५०+ तालुक्यांमध्ये २४x७ 'ब्लड कनेक्ट' व संकटमोचक रुग्ण साहाय्य पथके.</p>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #1976D2', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#140406' }}>४. युवा व क्रीडा प्रतिभा विकास</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', marginTop: '6px', lineHeight: 1.5 }}>मर्दानी खेळ, कुस्ती, दुर्गभ्रमंती, आणि ऑलिम्पिक खेळांसाठी ग्रामीण गुणवंतांना आर्थिक पाठबळ.</p>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #7B1FA2', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#140406' }}>५. डिजिटल स्वाभिमान व सुरक्षितता</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', marginTop: '6px', lineHeight: 1.5 }}>DPDP कायदा २०२३ नुसार १००% डेटा गोपनीयता, विना-राजकारण लोकसहभाग व पारदर्शक कारभार.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: VALUES (/about/values) */}
      {activeTab === 'values' && (
        <div id="tab-values" className="about-tab-content">
          <section className="section" style={{ padding: '56px 24px', background: 'var(--paper-2, #FBF5EC)' }}>
            <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  नैतिक मूल्ये • CORE VALUES
                </span>
                <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>ज्या मूल्यांवर CONNECT MARATHA उभा आहे</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', textAlign: 'center' }}>
                <div className="card" style={{ padding: '28px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2.4rem' }}>⚔️</div>
                  <h3 style={{ margin: '12px 0 6px', color: '#140406', fontFamily: 'Baloo 2' }}>शौर्य व स्वाभिमान</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>छत्रपतींच्या स्वराज्याचे बाणेदार वारसदार म्हणून सन्मानाने आणि ताठ मानेने जगणे.</p>
                </div>
                <div className="card" style={{ padding: '28px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2.4rem' }}>🤝</div>
                  <h3 style={{ margin: '12px 0 6px', color: '#140406', fontFamily: 'Baloo 2' }}>परस्पर सहकार्य (बंधुभाव)</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>'एक मराठा लाख मराठा' या घोषणेला आर्थिक व व्यावसायिक सहकार्याची खरी दिशा देणे.</p>
                </div>
                <div className="card" style={{ padding: '28px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2.4rem' }}>🛡️</div>
                  <h3 style={{ margin: '12px 0 6px', color: '#140406', fontFamily: 'Baloo 2' }}>निःस्वार्थ समाजसेवा</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>पीडित, वंचित व गरजू घटकांना सर्वतोपरी साहाय्य करणे हेच आमचे प्रथम कर्तव्य.</p>
                </div>
                <div className="card" style={{ padding: '28px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2.4rem' }}>⚖️</div>
                  <h3 style={{ margin: '12px 0 6px', color: '#140406', fontFamily: 'Baloo 2' }}>पारदर्शकता व निष्पक्षता</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>शून्य राजकारण, १००% ऑडिट पारदर्शकता आणि सर्वांसाठी समान विकासाची संधी.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: OUR STORY (/about/our-story) */}
      {activeTab === 'story' && (
        <div id="tab-story" className="about-tab-content">
          <section className="section" style={{ padding: '56px 24px' }}>
            <div className="wrap" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--saffron-600, #C73800)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  आपली यशोगाथा • OUR STORY
                </span>
                <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>एका संकल्पातून उभे राहिलेले डिजिटल महाव्यासपीठ</h2>
              </div>
              <div style={{ borderLeft: '3px solid var(--gold-500, #E0A96D)', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <span className="badge" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                    २०२४ — संकल्प व बीज
                  </span>
                  <h3 style={{ margin: '8px 0', color: '#140406', fontFamily: 'Baloo 2' }}>इतिहास संवर्धन व विस्कळीत तरुणांची एकजूट</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>
                    गड-किल्ले भटकंती करणारे तरुण, इतिहास अभ्यासक आणि काही मराठी आयटी व्यावसायिकांनी एकत्र येऊन समाजाला जात-पात किंवा राजकारणाच्या पलीकडे नेऊन एकात्मिक डिजिटल व्यासपीठ देण्याचा निर्णय घेतला.
                  </p>
                </div>
                <div>
                  <span className="badge" style={{ background: 'var(--saffron-600, #C73800)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                    २०२५ — व्यवसाय संगम व नेटवर्क विस्तार
                  </span>
                  <h3 style={{ margin: '8px 0', color: '#140406', fontFamily: 'Baloo 2' }}>BNI धर्तीवर मराठा बिझनेस संगमची स्थापना</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>
                    पुणे, मुंबई व नाशिकमध्ये पहिले २० व्यवसाय संगम चॅप्टर्स सुरू झाले. अवघ्या एका वर्षात ५,०००+ व्यावसायिकांनी परस्परांना कोट्यवधींचा व्यापार मिळवून दिला.
                  </p>
                </div>
                <div>
                  <span className="badge" style={{ background: '#2E7D32', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                    २०२६ — अखिल भारतीय डिजिटल व्यासपीठ
                  </span>
                  <h3 style={{ margin: '8px 0', color: '#140406', fontFamily: 'Baloo 2' }}>८०+ एकात्मिक दालने, ३६ जिल्हे व जागतिक मराठा</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sec, #555)', lineHeight: 1.6 }}>
                    आज CONNECT MARATHA हे महाराष्ट्रातील ६ महसूल विभाग, ३६ जिल्हे, ३५०+ तालुके आणि ३,०००+ शाखांमध्ये पोहोचलेले सर्वात मोठे स्वतंत्र सांस्कृतिक व व्यावसायिक डिजिटल नेटवर्क बनले आहे.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 6: ORGANIZATION & CHARTER (/about/organization) */}
      {activeTab === 'org' && (
        <div id="tab-org" className="about-tab-content">
          <section className="section" style={{ padding: '56px 24px', background: 'var(--paper-2, #FBF5EC)' }}>
            <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  संघटनात्मक रचना • ORGANIZATION
                </span>
                <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>स्वायत्त, लोकसहभागी व नफाविरहित रचना</h2>
              </div>
              <div className="card" style={{ padding: '32px', borderRadius: '14px', marginBottom: '24px', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ color: '#140406', fontFamily: 'Baloo 2' }}>📜 कायदेशीर स्वरूप व सनद (Section 8 Non-Profit)</h3>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-sec, #555)', lineHeight: 1.6, margin: '12px 0 20px' }}>
                  CONNECT MARATHA हे कंपनी कायदा २०१३ च्या कलम ८ अंतर्गत नोंदणीकृत नफाविरहित स्वायत्त व्यासपीठ आहे. या व्यासपीठावर कोणताही राजकीय पक्ष, दबावगट किंवा वैयक्तिक मालकी हक्क चालत नाही. व्यासपीठाचे संचालन लोकशाही पद्धतीने सल्लागार मंडळ, विधी समिती आणि जिल्हा प्रतिनिधींद्वारे केले जाते.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <Link to="/governance" className="btn btn-primary" style={{ padding: '10px 20px', textDecoration: 'none', background: 'var(--saffron-600, #C73800)', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>
                    ⚖️ संस्थात्मक संविधान व DPDP धोरण पहा
                  </Link>
                  <Link to="/network" className="btn btn-outline" style={{ padding: '10px 20px', textDecoration: 'none', border: '1px solid var(--saffron-600, #C73800)', color: 'var(--saffron-600, #C73800)', borderRadius: '8px', fontWeight: 600 }}>
                    🗺️ राज्य → विभाग → जिल्हा नेटवर्क रचना पहा
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 7 / ADVISORY COUNCIL & LEADERSHIP */}
      <section className="section" id="council" style={{ padding: '64px 24px', background: activeTab === 'leadership' ? 'var(--paper, #fff)' : 'var(--paper-2, #FBF5EC)' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
            <span className="tag" style={{ background: 'var(--saffron-500, #E65100)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
              मार्गदर्शन व नेतृत्व
            </span>
            <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>सल्लागार मंडळ व अभ्यासक समिती</h2>
            <p style={{ color: 'var(--text-sec, #666)' }}>इतिहासकार, कायदेतज्ज्ञ, निवृत्त लष्करी अधिकारी व तंत्रज्ञान तज्ज्ञांचे मार्गदर्शक मंडळ.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', textAlign: 'center', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', background: 'var(--paper-2, #FBF5EC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '2px solid var(--gold-500, #E0A96D)' }}>
                📚
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', color: '#140406', fontFamily: 'Baloo 2' }}>डॉ. जयसिंगराव पवार</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '8px' }}>ज्येष्ठ इतिहास संशोधक</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sec, #555)', lineHeight: 1.5 }}>मराठा साम्राज्य, छत्रपती ताराराणी व शिवकालीन इतिहासाचे गाढे अभ्यासक आणि ऐतिहासिक सत्यता पडताळणी प्रमुख.</p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '14px', textAlign: 'center', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', background: 'var(--paper-2, #FBF5EC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '2px solid var(--gold-500, #E0A96D)' }}>
                ⚖️
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', color: '#140406', fontFamily: 'Baloo 2' }}>ॲड. विश्वासराव पाटील</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '8px' }}>घटनात्मक सल्लागार</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sec, #555)', lineHeight: 1.5 }}>उच्च न्यायालय विधी सल्लागार, डिजिटल डेटा संरक्षण (DPDP) व समुदाय कायदेशीर हक्क समिती समन्वयक.</p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '14px', textAlign: 'center', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', background: 'var(--paper-2, #FBF5EC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '2px solid var(--gold-500, #E0A96D)' }}>
                👩‍💼
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', color: '#140406', fontFamily: 'Baloo 2' }}>प्रा. अनुराधा मोरे</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '8px' }}>महिला व युवा सक्षमीकरण</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sec, #555)', lineHeight: 1.5 }}>सावित्रीबाई फुले पुणे विद्यापीठ शिक्षणतज्ज्ञ, विद्यार्थिनी मार्गदर्शन व महिला उद्योजक मंचाच्या अध्यक्षा.</p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '14px', textAlign: 'center', background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', background: 'var(--paper-2, #FBF5EC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '2px solid var(--gold-500, #E0A96D)' }}>
                🎖️
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', color: '#140406', fontFamily: 'Baloo 2' }}>कर्नल विजयराव साळुंखे</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '8px' }}>निवृत्त संरक्षण अधिकारी</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sec, #555)', lineHeight: 1.5 }}>मराठा लाईट इन्फंट्री निवृत्त अधिकारी, युवा सैनिकी प्रशिक्षण व आपत्कालीन मदत दलाचे मुख्य निर्देशक.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINANCIAL TRANSPARENCY & AUDIT */}
      <section className="section" style={{ padding: '56px 24px' }}>
        <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ background: '#fff', border: '2px solid var(--gold-500, #E0A96D)', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="tag" style={{ background: '#2E7D32', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  १००% सार्वजनिक पारदर्शकता
                </span>
                <h3 style={{ fontSize: '1.8rem', margin: '6px 0 0', color: '#140406', fontFamily: 'Baloo 2' }}>आर्थिक अहवाल व निधी विनियोग</h3>
              </div>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => showToast('📥 २०२५-२६ वित्तीय ऑडिट अहवाल डाऊनलोड सुरू झाला...')} 
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--saffron-600, #C73800)', color: 'var(--saffron-600, #C73800)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
              >
                📥 ऑडिट अहवाल (PDF)
              </button>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-sec, #555)', lineHeight: 1.6, marginBottom: '24px' }}>
              CONNECT MARATHA हे नफाविरहित (Not-for-profit) धर्तीवर चालवले जाणारे डिजिटल व्यासपीठ आहे. दुर्ग संवर्धन, विद्यार्थी साहाय्य व रक्तदान मोहिमांसाठी जमा झालेल्या प्रत्येक रुपयाचा काटेकोर हिशेब संकेतस्थळावर जाहीर ठेवला जातो.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
              <div style={{ background: 'var(--paper-2, #FBF5EC)', padding: '18px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--saffron-600, #C73800)' }}>₹४२.५ लाख</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-sec, #666)' }}>दुर्ग संवर्धनासाठी थेट विनियोग</div>
              </div>
              <div style={{ background: 'var(--paper-2, #FBF5EC)', padding: '18px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-600, #B8860B)' }}>१,४५०+</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-sec, #666)' }}>विद्यार्थ्यांना शैक्षणिक साहाय्य</div>
              </div>
              <div style={{ background: 'var(--paper-2, #FBF5EC)', padding: '18px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2E7D32' }}>०%</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-sec, #666)' }}>प्रशासकीय नफा (Zero Profit)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY CHARTER MODAL */}
      {showCharterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            padding: '32px',
            border: '2px solid var(--gold-500, #E0A96D)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', background: 'rgba(199,56,0,0.1)', color: '#C73800', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  कायदेशीर सनद २०२६
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '1.4rem', color: '#140406', fontFamily: 'Baloo 2' }}>
                  📜 कनेक्ट मराठा — समुदाय सनद (Charter)
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCharterModal(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#374151', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p><strong>१. स्वतंत्र व स्वायत्त व्यासपीठ:</strong> कंपनी कायदा २०१३ च्या कलम ८ अंतर्गत स्थापन झालेले नफाविरहित व्यासपीठ. कोणत्याही राजकीय पक्षापासून अलिप्त.</p>
              <p><strong>२. ऐतिहासिक सत्यता संरक्षण:</strong> छत्रपती शिवाजी महाराज, छत्रपती संभाजी महाराज व मराठा साम्राज्याच्या अस्सल ऐतिहासिक संदर्भांचे रक्षण आणि प्रचार.</p>
              <p><strong>३. व्यवसाय व रोजगार सक्षमीकरण:</strong> मराठी तरुणांना शून्य-मध्यस्थी B2B व्यापार, नोकऱ्या व स्टार्टअप मार्गदर्शन उपलब्ध करणे.</p>
              <p><strong>४. डिजिटल वैयक्तिक डेटा संरक्षण (DPDP 2023):</strong> कोणत्याही सदस्याची माहिती विक्री किंवा गैरवापर केली जाणार नाही. एनक्रिप्टेड व गोपनीय डेटा.</p>
              <p><strong>५. १००% ऑडिट पारदर्शकता:</strong> सार्वजनिक निधीचा प्रत्येक रुपया थेट गड-किल्ले संवर्धन, विद्यार्थी साहाय्य व आपत्कालीन मदतीसाठी वापरला जाईल.</p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '18px' }}>
              <button 
                type="button" 
                onClick={() => setShowCharterModal(false)} 
                style={{ padding: '8px 18px', border: '1px solid #D1D5DB', background: '#F3F4F6', borderRadius: '8px', cursor: 'pointer' }}
              >
                बंद करा
              </button>
              <button 
                type="button" 
                onClick={downloadCharterFile} 
                style={{ padding: '8px 20px', background: 'var(--saffron-600, #C73800)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                📥 सनद डाऊनलोड करा (.txt)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
