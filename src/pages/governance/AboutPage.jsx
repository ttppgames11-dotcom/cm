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
      <div className="hero" style={{ position: 'relative', minHeight: '280px', overflow: 'hidden', display: 'flex', alignItems: 'center', background: '#120204' }}>
        <img 
          src="/assets/images/connect-maratha-council.jpg" 
          alt="Connect Maratha Advisory Council" 
          className="hero-bg-img" 
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.68) contrast(1.05)' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(18,2,4,0.85) 0%, rgba(35,8,12,0.68) 55%, rgba(18,2,4,0.8) 100%)' }}></div>
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1300px', margin: '0 auto', padding: '32px 24px', color: '#fff', width: '100%' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.2px', fontWeight: 700, marginBottom: '4px' }}>
            Spec Page 2 • Institutional Framework
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', lineHeight: 1.2, color: '#fff', margin: '4px 0 10px', fontFamily: 'Baloo 2' }}>
            आमच्याबद्दल — <span style={{ background: 'linear-gradient(90deg, #F3C06B, #FF8C42)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connect Maratha</span>
          </h1>
          <div style={{ background: 'var(--gold-500, #E0A96D)', width: '60px', height: '3px', marginBottom: '12px' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.98rem', maxWidth: '72ch', lineHeight: 1.55, margin: '0 0 18px' }}>
            इतिहासाचे अस्सल संवर्धन, आधुनिक पिढीची विधायक जोडणी आणि सक्षम भविष्यनिर्मिती • अभ्यासक, विचारवंत, तंत्रज्ञान तज्ज्ञ व समाजसेवकांचे स्वतंत्र लोकसहभागी डिजिटल महाव्यासपीठ.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => setShowCharterModal(true)} 
              className="btn btn-primary" 
              style={{ padding: '8px 18px', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', background: 'var(--saffron-600, #C73800)', border: 'none', borderRadius: '6px', color: '#fff' }}
            >
              📜 समुदाय सनद (Charter)
            </button>
            <button 
              type="button" 
              onClick={() => handleTabSwitch('leadership')} 
              className="btn btn-outline" 
              style={{ padding: '8px 18px', fontSize: '0.86rem', color: '#fff', borderColor: 'var(--gold-400)', background: 'transparent', borderRadius: '6px', cursor: 'pointer', border: '1px solid #F3C06B' }}
            >
              👥 नेतृत्व व IP सल्लागार मंडळ (Leadership)
            </button>
            <Link 
              to="/achievers" 
              className="btn" 
              style={{ padding: '8px 18px', fontSize: '0.86rem', color: 'var(--gold-400)', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', fontWeight: 600 }}
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
            { id: 'leadership', label: '👥 नेतृत्व & IP मंडळ (Leadership)' },
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
            <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  संस्थेचा मूलभूत परिचय • OVERVIEW
                </span>
                <h2 style={{ fontSize: '2.3rem', margin: '12px 0 8px', fontFamily: 'Baloo 2' }}>संस्कृती, स्वाभिमान व समृद्धीचे लोकसहभागी व्यासपीठ</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto' }}>"जपा इतिहास • जपा संस्कृती • सन्मान करा कर्तृत्वाचा • जोडा समाज • घडवा भविष्य"</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '26px' }}>
                {/* Overview Card 1 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                    <img 
                      src="/assets/images/real-raigad-panoramic.jpg" 
                      alt="इतिहास व वारसा संवर्धन" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                      onError={(e) => { e.target.src = '/assets/images/Sinhagad.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(61,13,13,0.9)', backdropFilter: 'blur(4px)', color: '#F3C06B', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      🚩 वारसा रक्षण व डिजिटायझेशन
                    </div>
                  </div>
                  <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#1F2937', fontFamily: 'Baloo 2', fontWeight: 700 }}>१. इतिहास व वारसा संवर्धन</h3>
                    <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '14px' }}>
                      छत्रपती शिवाजी महाराज, धर्मवीर छत्रपती संभाजी महाराज व मराठा साम्राज्याची स्वाभिमानी विचारधारा जपणे. महाराष्ट्रातील ३५०+ गड-किल्ल्यांचे स्वच्छता व संवर्धन, अस्सल मोडी लिपी कागदपत्रांचे डिजिटायझेशन आणि विकृतीकरणाला चोख ऐतिहासिक पुरावे देऊन विरोध करणे.
                    </p>
                    
                    {/* Key highlights / detail pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>🏛️ ३५०+ दुर्ग संवर्धन</span>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>📜 मोडी लिपी अर्काइव्ह</span>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>🔍 ऐतिहासिक पुरावे समिती</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>३५०+ दुर्ग नोंदी • डिजिटल पुराभिलेखागार</span>
                      <Link to="/forts" style={{ color: 'var(--saffron-600, #C73800)', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>दुर्ग दालन पहा →</Link>
                    </div>
                  </div>
                </div>

                {/* Overview Card 2 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                    <img 
                      src="/assets/images/maratha-business-sangam.jpg" 
                      alt="उद्योग व व्यावसायिक सक्षमीकरण" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = '/assets/images/meeting.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(199,56,0,0.92)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      💼 व्यवसाय संगम व B2B व्यापार
                    </div>
                  </div>
                  <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#1F2937', fontFamily: 'Baloo 2', fontWeight: 700 }}>२. उद्योग व व्यावसायिक सक्षमीकरण</h3>
                    <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '14px' }}>
                      मराठी तरुणांना उद्योजकतेची दिशा देऊन 'शून्य मध्यस्थी' B2B व्यापार उपलब्ध करणे. शेतीमाल प्रक्रिया, उत्पादन, बांधकाम, तंत्रज्ञान व सेवा क्षेत्रातील उद्योजकांना परस्पर सहकार्यातून कोट्यवधींच्या व्यवसाय संधी मिळवून देणे.
                    </p>

                    {/* Key highlights / detail pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>🤝 BNI धर्तीवर चॅप्टर्स</span>
                      <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>📦 ग्लोबल एक्स्पोर्ट मदत</span>
                      <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>🌾 कृषी-उद्योग मूल्यसाखळी</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>५००+ B2B चॅप्टर्स • कोट्यवधींचे व्यवहार</span>
                      <Link to="/business" style={{ color: 'var(--saffron-600, #C73800)', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>व्यापार जोडा →</Link>
                    </div>
                  </div>
                </div>

                {/* Overview Card 3 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                    <img 
                      src="/assets/images/morcha-sarthi-academy.jpg" 
                      alt="शिक्षण, करिअर व सामाजिक एकता" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = '/assets/images/library.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(21,128,61,0.92)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      🎓 करिअर, आरोग्य & सामाजिक सुरक्षा
                    </div>
                  </div>
                  <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#1F2937', fontFamily: 'Baloo 2', fontWeight: 700 }}>३. शिक्षण, करिअर व सामाजिक एकता</h3>
                    <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '14px' }}>
                      UPSC, MPSC, आयटी, आणि संरक्षण दलात मराठा तरुणांना विशेष शिष्यवृत्ती व मोफत मार्गदर्शन. २४x७ राज्यव्यापी आपत्कालीन रक्तदाता नेटवर्क, मोफत आरोग्य शिबिरे आणि महिला सक्षमीकरणासाठी सक्षम व्यासपीठ.
                    </p>

                    {/* Key highlights / detail pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>🎖️ सारथी व स्पर्धा परीक्षा</span>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>🩸 २४x७ रक्तदाता नेटवर्क</span>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>👩‍💼 महिला बचत गट फेडरेशन</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>१०,०००+ विद्यार्थी साहाय्य • २४x७ सेवा</span>
                      <Link to="/education" style={{ color: 'var(--saffron-600, #C73800)', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>मार्गदर्शन पहा →</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* IMPACT & NUMBERS STRIP */}
              <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #1C0507 0%, #3D0D0D 100%)', borderRadius: '16px', padding: '28px 24px', color: '#fff', border: '1px solid rgba(243,192,107,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                  <span style={{ color: 'var(--gold-400, #F3C06B)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                    🚩 राज्यव्यापी थेट परिणाम • REAL-TIME IMPACT SNAPSHOT
                  </span>
                  <h3 style={{ fontSize: '1.5rem', margin: '6px 0 0', fontFamily: 'Baloo 2', color: '#fff' }}>
                    महाराष्ट्रातील ३६ जिल्हे, ३,०००+ शाखा व ५०+ लाख बंधू-भगिनींचे संघटन
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold-400, #F3C06B)', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>३५०+</div>
                    <div style={{ fontSize: '0.86rem', color: '#E5E7EB', fontWeight: 600, marginTop: '4px' }}>संरक्षित व डिजिटल दुर्ग</div>
                    <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '2px' }}>३६०° VR व ऐतिहासिक दस्तऐवज</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>₹ ५०+ कोटी</div>
                    <div style={{ fontSize: '0.86rem', color: '#E5E7EB', fontWeight: 600, marginTop: '4px' }}>वार्षिक B2B व्यवसाय विनिमय</div>
                    <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '2px' }}>५००+ उद्योग चॅप्टर्स व निर्यातीस साहाय्य</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60A5FA', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>२५,०००+</div>
                    <div style={{ fontSize: '0.86rem', color: '#E5E7EB', fontWeight: 600, marginTop: '4px' }}>नोंदणीकृत रक्तदाते</div>
                    <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '2px' }}>२४x७ आपत्कालीन आरोग्य मदत कक्ष</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F472B6', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>१०,०००+</div>
                    <div style={{ fontSize: '0.86rem', color: '#E5E7EB', fontWeight: 600, marginTop: '4px' }}>स्पर्धा परीक्षा विद्यार्थी</div>
                    <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '2px' }}>मोफत ग्रंथालय, हॉस्टेल व करिअर मार्गदर्शन</div>
                  </div>
                </div>
              </div>

              {/* 4 CORE PRINCIPLES / FOUNDATIONS */}
              <div style={{ marginTop: '36px' }}>
                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                  <h3 style={{ fontSize: '1.45rem', color: '#1F2937', fontFamily: 'Baloo 2', fontWeight: 700, margin: 0 }}>
                    व्यासपीठाची चार मूलभूत तत्त्वे (Our 4 Core Pillars)
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0' }}>
                    कोणत्याही राजकीय दबावाशिवाय समाजाच्या सर्व घटकांसाठी निष्पक्ष व पारदर्शक कार्यप्रणाली.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🛡️</div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>स्वायत्त व अराजनैतिक</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                      संस्था कलम ८ अंतर्गत नफाविरहित असून कोणत्याही राजकीय पक्षाची मांडलिक नाही.
                    </p>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📊</div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>१००% सार्वजनिक ऑडिट</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                      प्राप्त होणारा प्रत्येक रुपया व निधी विनियोग संकेतस्थळावर खुला व लेखापरीक्षित (Audited) असतो.
                    </p>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔒</div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>डेटा गोपनीयता (DPDP Act)</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                      सभासदांची कोणतीही वैयक्तिक माहिती विकली जात नाही; एन्क्रिप्टेड सुरक्षा मानके लागू.
                    </p>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤝</div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>शून्य मध्यस्थी सहकार्य</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                      शेतकरी ते ग्राहक आणि व्यावसायिक ते उद्योजक थेट व्यवहार, कमिशन किंवा दलाली मुक्त.
                    </p>
                  </div>
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
            <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--saffron-600, #C73800)', color: '#fff', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  दूरदृष्टी • VISION 2030
                </span>
                <h2 style={{ fontSize: '2.3rem', margin: '12px 0 8px', fontFamily: 'Baloo 2' }}>ग्लोबल मराठा: आर्थिक व बौद्धिक महाशक्ती</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto' }}>
                  २०३० पर्यंत जगभरातील ५ कोटी मराठा समाजाला तंत्रज्ञानाच्या साहाय्याने एकत्र जोडून समृद्ध, स्वावलंबी व सुशिक्षित समाज घडवणे.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Vision Card 1 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '210px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img 
                      src="/assets/images/real-purandar-fort.jpg" 
                      alt="३५०+ गड-किल्ल्यांचे संवर्धन" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
                      onError={(e) => { e.target.src = '/assets/images/real-raigad-panoramic.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(61,13,13,0.9)', backdropFilter: 'blur(4px)', color: '#F3C06B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      🏰 वारसा संवर्धन मोहीम
                    </div>
                    <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      अस्सल ऐतिहासिक दुर्ग
                    </div>
                  </div>
                  <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>३५०+ गड-किल्ल्यांचे १००% डिजिटायझेशन</h3>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        प्रत्येक किल्ल्याचे ३६०° ड्रोन मॅपिंग, आभासी दर्शन (VR Tour), अस्सल शिलालेख व बुरूजांचा इतिहास आणि प्रत्यक्ष श्रमदान शिबिरे राबवून स्वराज्याचा वारसा जागतिक पटलावर नेणे.
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🛸 ३६०° ड्रोन मॅपिंग</span>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🏛️ शिलालेख पुराभिलेखागार</span>
                        <span style={{ background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ श्रमदान दुर्ग स्वच्छता</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>लक्ष्य: २०३० पर्यंत सर्व दुर्ग डिजिटल</span>
                        <Link to="/forts" style={{ color: 'var(--saffron-600, #C73800)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>दुर्ग दालन →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vision Card 2 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '210px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img 
                      src="/assets/images/maratha-business-sangam.jpg" 
                      alt="B2B व्यापार परिषद" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
                      onError={(e) => { e.target.src = '/assets/images/meeting.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(199,56,0,0.92)', backdropFilter: 'blur(4px)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      💼 व्यावसायिक उन्नती & B2B संगम
                    </div>
                    <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      उद्योजक परिषद
                    </div>
                  </div>
                  <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>₹ १०,००० कोटींचा वार्षिक B2B व्यापार</h3>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        'व्यवसाय संगम' नेटवर्कच्या माध्यमातून स्थानिक उद्योजक, शेतकरी व व्यावसायिकांना थेट राष्ट्रीय व आंतरराष्ट्रीय खरेदीदारांशी जोडून स्वावलंबी मराठा उद्योजकता परिसंस्था उभी करणे.
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🤝 ५००+ B2B चॅप्टर्स</span>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🌐 ग्लोबल एक्स्पोर्ट हब</span>
                        <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ शून्य मध्यस्थी व्यापार</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>लक्ष्य: स्वावलंबी उद्योजक महाराष्ट्र</span>
                        <Link to="/business" style={{ color: 'var(--saffron-600, #C73800)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>व्यापार जोडा →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vision Card 3 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '210px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img 
                      src="/assets/images/achievers/nda_cadets_pune.jpg" 
                      alt="१ लाख मराठा युवा करिअर सक्षमीकरण" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                      onError={(e) => { e.target.src = '/assets/images/modern-maratha-achievers.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(21,128,61,0.92)', backdropFilter: 'blur(4px)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      🎯 नेतृत्व घडवणूक & संरक्षण
                    </div>
                    <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      NDA / UPSC कॅडेट्स
                    </div>
                  </div>
                  <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>१ लाख मराठा युवा करिअर सक्षमीकरण</h3>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        UPSC, MPSC, आयटी तंत्रज्ञान, कृत्रिम बुद्धिमत्ता (AI) आणि भारतीय लष्करात मराठा तरुण-तरुणींचे प्रमाण सर्वोच्च पातळीवर नेण्यासाठी मोफत अभ्यासिका, टेस्ट सिरीज व मेंटॉरशिप देणे.
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🎖️ सैनिकी व NDA भरती</span>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📚 मोफत डिजिटल अभ्यासिका</span>
                        <span style={{ background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ IAS/IPS तज्ज्ञ मार्गदर्शन</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>लक्ष्य: १,००,००० सक्षम युवा</span>
                        <Link to="/education" style={{ color: 'var(--saffron-600, #C73800)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>करिअर दालन →</Link>
                      </div>
                    </div>
                  </div>
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
            <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  ध्येयस्तंभ • MISSION PILLARS
                </span>
                <h2 style={{ fontSize: '2.3rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>आमचे ५ मुख्य कार्यस्तंभ</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.02rem', maxWidth: '750px', margin: '0 auto' }}>
                  महाराष्ट्रातील प्रत्येक कुटुंबापर्यंत थेट पोहोचून सर्वांगीण प्रगती साध्य करणारी ठोस कार्यप्रणाली.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Mission Card 1 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/maratha-granthalaya.jpg" alt="ऐतिहासिक ज्ञाननिर्मिती" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/library.jpg'; }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(199,56,0,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                      स्तंभ १ • ज्ञान & इतिहास
                    </div>
                  </div>
                  <div style={{ padding: '22px', borderTop: '4px solid var(--saffron-500, #E65100)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.22rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>१. अस्सल ऐतिहासिक ज्ञाननिर्मिती</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        ऐतिहासिक बखरी, अस्सल मोडी कागदपत्रे व पुराव्यांचे डिजिटल ग्रंथालय. नव्या पिढीला विकृतीकरणापासून वाचवून निर्भेळ शिवचरित्र व शंभूचरित्र घराघरात पोहोचवणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📚 मोडी दस्तऐवज</span>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🔍 संदर्भ पडताळणी</span>
                        <span style={{ background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ ई-ग्रंथालय</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                        <span>उपलब्ध: ५,०००+ मोडी हस्तलिखिते</span>
                        <Link to="/history" style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700, textDecoration: 'none' }}>इतिहास दालन →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Card 2 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/maratha-business-sangam.jpg" alt="स्वयंपूर्ण व्यवसाय मंडळे" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(184,134,11,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                      स्तंभ २ • उद्योग & B2B
                    </div>
                  </div>
                  <div style={{ padding: '22px', borderTop: '4px solid var(--gold-500, #E0A96D)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.22rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>२. स्वयंपूर्ण व्यवसाय मंडळे</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        ३६ जिल्ह्यांत ५००+ व्यवसाय संगम चॅप्टर्सची स्थापना. मराठी उद्योजकांचे नेटवर्किंग, शून्य मध्यस्थी थेट व्यापार आणि स्टार्टअप निधी सहकार्य पुरवणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🤝 B2B नेटवर्किंग</span>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>💼 एंजल फंडिंग</span>
                        <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ शून्य मध्यस्थी</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                        <span>नेटवर्क: ५००+ सक्रिय उद्योग गट</span>
                        <Link to="/business" style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700, textDecoration: 'none' }}>उद्योग दालन →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Card 3 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/seva.jpg" alt="आपत्कालीन सेवा" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/maratha-services-care.jpg'; }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(46,125,50,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                      स्तंभ ३ • आपत्कालीन सुरक्षा
                    </div>
                  </div>
                  <div style={{ padding: '22px', borderTop: '4px solid #2E7D32', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.22rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>३. आपत्कालीन सेवा व रक्तदाते नेटवर्क</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        महाराष्ट्रातील ३५०+ तालुक्यांमध्ये २४x७ 'ब्लड कनेक्ट' व संकटमोचक रुग्ण साहाय्य पथके. पूर, अपघात व नैसर्गिक आपत्तीत त्वरित मदत पोहोचवणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🩸 २४x७ ब्लड कनेक्ट</span>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🚑 आपत्कालीन रुग्णवाहिका</span>
                        <span style={{ background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ आपत्ती सहाय्य दल</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                        <span>कव्हरेज: ३६ जिल्हे • १८००-१२३-१६७४</span>
                        <Link to="/seva" style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700, textDecoration: 'none' }}>सेवा दालन →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Card 4 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/real-kolhapur-kusti.jpg" alt="युवा व क्रीडा प्रतिभा" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/bhavya-maratha-army.jpg'; }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(25,118,210,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                      स्तंभ ४ • क्रीडा & शौर्य
                    </div>
                  </div>
                  <div style={{ padding: '22px', borderTop: '4px solid #1976D2', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.22rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>४. युवा व क्रीडा प्रतिभा विकास</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        मर्दानी खेळ, पारंपरिक कुस्ती, दुर्गभ्रमंती, आणि ऑलिम्पिक क्रीडा प्रकारांसाठी ग्रामीण गुणवंतांना थेट आर्थिक प्रायोजकत्व, पोषण आहार व आंतरराष्ट्रीय दर्जाचे प्रशिक्षण देणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🤼 पारंपरिक कुस्ती संवर्धन</span>
                        <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>⚔️ मर्दानी खेळ आखाडे</span>
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ क्रीडा शिष्यवृत्ती</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                        <span>सहकार्य: ५००+ तालीम मंडळे</span>
                        <Link to="/sports" style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700, textDecoration: 'none' }}>क्रीडा दालन →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Card 5 */}
                <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/morcha-court-battle.jpg" alt="पारदर्शक कारभार" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(123,31,162,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                      स्तंभ ५ • स्वायत्तता & पारदर्शकता
                    </div>
                  </div>
                  <div style={{ padding: '22px', borderTop: '4px solid #7B1FA2', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.22rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>५. डिजिटल स्वाभिमान व सुरक्षितता</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        DPDP कायदा २०२३ नुसार १००% डेटा गोपनीयता, डिजिटल कॉपीराइट रक्षण आणि कोणताही राजकीय स्वार्थ न ठेवता संपूर्ण पारदर्शक व नियमित सीए ऑडिटेड कारभार चालवणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🔒 DPDP 2023 गोपनीयता</span>
                        <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📋 वार्षिक CA ऑडिट</span>
                        <span style={{ background: '#FAF5FF', color: '#581C87', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ शून्य राजकीय निधी</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                        <span>दर्जा: कलम ८ नफाविरहित नोंदणी</span>
                        <Link to="/governance" style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700, textDecoration: 'none' }}>संविधान व विधी →</Link>
                      </div>
                    </div>
                  </div>
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
            <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  नैतिक मूल्ये • CORE VALUES
                </span>
                <h2 style={{ fontSize: '2.3rem', margin: '12px 0 8px', fontFamily: 'Baloo 2' }}>ज्या मूल्यांवर CONNECT MARATHA उभा आहे</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.02rem', maxWidth: '750px', margin: '0 auto' }}>
                  शिवरायांच्या स्वराज्याची चार मूलभूत तत्त्वे आमची मार्गदर्शक प्रकाशकिरणे आहेत.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
                {/* Value Card 1 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/battle-action-sinhagad.jpg" alt="शौर्य व स्वाभिमान" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/real-maratha-arms.jpg'; }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(61,13,13,0.9)', color: '#F3C06B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      मूल्य १ • स्वराज्य निष्ठा
                    </div>
                  </div>
                  <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚔️</span>
                        <h3 style={{ margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.25rem', fontWeight: 700 }}>शौर्य व स्वाभिमान</h3>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        छत्रपतींच्या स्वराज्याचे बाणेदार वारसदार म्हणून सन्मानाने आणि ताठ मानेने जगणे. अन्याय, विकृतीकरण आणि खोट्या प्रचाराविरोधात पुराव्यानिशी सदैव खंबीर उभे राहणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🚩 स्वाभिमानी जीवन</span>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🛡️ सत्यनिष्ठ भूमिका</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', fontSize: '0.76rem', color: '#6B7280' }}>
                        आदर्श: छत्रपती शिवाजी महाराज विचार
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value Card 2 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/morcha-58-silent-rally.jpg" alt="परस्पर सहकार्य (बंधुभाव)" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/real-warkari-pandharpur.jpg'; }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(199,56,0,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      मूल्य २ • ऐक्य & बंधुभाव
                    </div>
                  </div>
                  <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🤝</span>
                        <h3 style={{ margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.25rem', fontWeight: 700 }}>परस्पर सहकार्य (बंधुभाव)</h3>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        'एक मराठा लाख मराठा' या भावनेला आर्थिक, व्यावसायिक व शैक्षणिक सहकार्याची ठोस जोड देणे. बांधवांच्या प्रगतीत स्वतःचा आनंद मानून परस्परांचे हात बळकट करणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🌐 परस्पर व्यापार</span>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>👥 समाज संघटन</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', fontSize: '0.76rem', color: '#6B7280' }}>
                        संकल्प: विस्कळीत घटकांना एका व्यासपीठावर जोडणे
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value Card 3 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/seva.jpg" alt="निःस्वार्थ समाजसेवा" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(46,125,50,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      मूल्य ३ • सेवा परमो धर्मः
                    </div>
                  </div>
                  <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                        <h3 style={{ margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.25rem', fontWeight: 700 }}>निःस्वार्थ समाजसेवा</h3>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        पीडित, वंचित, शेतकरी व गरजू घटकांना निरपेक्ष साहाय्य करणे हेच आमचे प्रथम कर्तव्य. आपत्तीकाळात स्वयंसेवक म्हणून कोणताही गाजावाजा न करता अग्रभागी धावणे.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🩸 रुग्ण साहाय्य</span>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🌾 शेतकरी मदत दल</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', fontSize: '0.76rem', color: '#6B7280' }}>
                        संस्कृती: रयतेची सेवा हेच स्वराज्य कार्य
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value Card 4 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#F3F4F6' }}>
                    <img src="/assets/images/morcha-court-battle.jpg" alt="पारदर्शकता व निष्पक्षता" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(88,28,135,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      मूल्य ४ • नीती & न्याय
                    </div>
                  </div>
                  <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                        <h3 style={{ margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.25rem', fontWeight: 700 }}>पारदर्शकता व निष्पक्षता</h3>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        शून्य राजकीय हस्तक्षेप, १००% डिजिटल आर्थिक ऑडिट पारदर्शकता आणि समाजातील प्रत्येक घटकाला गुणवत्ता व समान विकासाची संधी उपलब्ध करून देणारा निष्पक्ष कारभार.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📋 ओपन ऑडिट</span>
                        <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>⚖️ समान हक्क</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', fontSize: '0.76rem', color: '#6B7280' }}>
                        हमी: पक्षविरहित व लोकाभिमुख संस्था
                      </div>
                    </div>
                  </div>
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
            <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--saffron-600, #C73800)', color: '#fff', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  आपली यशोगाथा • OUR STORY
                </span>
                <h2 style={{ fontSize: '2.3rem', margin: '12px 0 8px', fontFamily: 'Baloo 2' }}>एका संकल्पातून उभे राहिलेले डिजिटल महाव्यासपीठ</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.02rem', maxWidth: '750px', margin: '0 auto' }}>
                  इतिहास संवर्धन, आधुनिक तंत्रज्ञान आणि सहकार्यातून आकारास आलेला सुवर्ण प्रवास.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* Story Card 1 */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', background: '#FFFFFF', boxShadow: '0 4px 18px rgba(0,0,0,0.05)' }}>
                  <div style={{ minHeight: '230px', position: 'relative' }}>
                    <img src="/assets/images/morcha-fort-conservation.jpg" alt="२०२४ — संकल्प व बीज" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/real-raigad-bastions.jpg'; }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      टप्पा १ • आरंभ
                    </div>
                  </div>
                  <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ display: 'inline-block', background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                          २०२४ — संकल्प व बीज
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>पहिला टप्पा</span>
                      </div>
                      <h3 style={{ margin: '0 0 10px', color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.35rem', fontWeight: 700 }}>इतिहास संवर्धन व विस्कळीत तरुणांची एकजूट</h3>
                      <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.65, margin: '0 0 16px' }}>
                        गड-किल्ले भटकंती करणारे तरुण, इतिहास अभ्यासक आणि मराठी आयटी व्यावसायिकांनी एकत्र येऊन समाजाला जात-पात किंवा पक्षीय राजकारणाच्या पलीकडे नेऊन एकात्मिक डिजिटल महाव्यासपीठ देण्याचा संकल्प सोडला. ३५०+ गड-किल्ल्यांचे सर्वेक्षण व मोडी कागदपत्रांचे डिजिटायझेशन सुरू झाले.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🚩 ५०+ किल्ले श्रमदान</span>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>💻 ५००+ आयटी अभियंते एकवटले</span>
                        <span style={{ background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ कलम ८ संस्था नोंदणी</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.8rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                        <span>उपलब्धी: अखंड डिजिटल प्लॅटफॉर्मचा पाया</span>
                        <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>२०२४ संकल्प सिद्धी ★</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Card 2 */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', background: '#FFFFFF', boxShadow: '0 4px 18px rgba(0,0,0,0.05)' }}>
                  <div style={{ minHeight: '230px', position: 'relative' }}>
                    <img src="/assets/images/maratha-business-sangam.jpg" alt="२०२५ — व्यवसाय संगम व नेटवर्क विस्तार" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      टप्पा २ • विस्तार
                    </div>
                  </div>
                  <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ display: 'inline-block', background: 'var(--saffron-600, #C73800)', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                          २०२५ — व्यवसाय संगम व नेटवर्क विस्तार
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>दुसरा टप्पा</span>
                      </div>
                      <h3 style={{ margin: '0 0 10px', color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.35rem', fontWeight: 700 }}>BNI धर्तीवर मराठा बिझनेस संगमची स्थापना</h3>
                      <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.65, margin: '0 0 16px' }}>
                        पुणे, मुंबई, छत्रपती संभाजीनगर व नाशिकमध्ये पहिले ५० व्यवसाय संगम चॅप्टर्स सुरू झाले. अवघ्या एका वर्षात ५,०००+ व्यावसायिकांनी परस्परांना कोट्यवधींचा व्यापार मिळवून दिला, महिला बचत गटांना बाजारपेठ उपलब्ध झाली व हजारो सुशिक्षित तरुणांना थेट रोजगार मिळाला.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>💼 ५०००+ सक्रिय उद्योजक</span>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>💰 ₹१००+ कोटी B2B उलाढाल</span>
                        <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ थेट रोजगार मेळावे</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.8rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                        <span>उपलब्धी: राज्यव्यापी स्वावलंबी उद्योग साखळी</span>
                        <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>२०२५ विस्तार सिद्धी ★</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Card 3 */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', background: '#FFFFFF', boxShadow: '0 4px 18px rgba(0,0,0,0.05)' }}>
                  <div style={{ minHeight: '230px', position: 'relative' }}>
                    <img src="/assets/images/modern-maratha-achievers.jpg" alt="२०२६ — अखिल भारतीय डिजिटल व्यासपीठ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/connect-maratha-council.jpg'; }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      टप्पा ३ • महाविस्तार
                    </div>
                  </div>
                  <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ display: 'inline-block', background: '#2E7D32', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                          २०२६ — अखिल भारतीय व जागतिक विस्तार
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>वर्तमान टप्पा</span>
                      </div>
                      <h3 style={{ margin: '0 0 10px', color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.35rem', fontWeight: 700 }}>८०+ एकात्मिक दालने, ३६ जिल्हे व जागतिक मराठा</h3>
                      <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.65, margin: '0 0 16px' }}>
                        आज CONNECT MARATHA हे महाराष्ट्रातील ६ महसूल विभाग, ३६ जिल्हे, ३५०+ तालुके आणि ३,०००+ शाखांमध्ये पोहोचलेले सर्वात मोठे स्वतंत्र सांस्कृतिक, सामाजिक व व्यावसायिक डिजिटल नेटवर्क बनले आहे. जगातील २०+ देशांतील मराठा मंडळे या नेटवर्कशी जोडली गेली आहेत.
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🌍 २०+ आंतरराष्ट्रीय चॅप्टर्स</span>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📱 ८०+ डिजिटल दालने</span>
                        <span style={{ background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ ३५०+ तालुके थेट जोडलेले</span>
                      </div>
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.8rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                        <span>उपलब्धी: अखंड ग्लोबल मराठा महाशक्ती</span>
                        <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>२०२६ डिजिटल क्रांती ★</span>
                      </div>
                    </div>
                  </div>
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
            <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="tag" style={{ background: 'var(--maroon-900, #3d0d0d)', color: 'var(--gold-400, #F3C06B)', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  संघटनात्मक रचना • ORGANIZATION
                </span>
                <h2 style={{ fontSize: '2.3rem', margin: '12px 0 8px', fontFamily: 'Baloo 2' }}>स्वायत्त, लोकसहभागी व नफाविरहित रचना</h2>
                <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.02rem', maxWidth: '750px', margin: '0 auto' }}>
                  संवैधानिक तत्त्वांवर आधारित पारदर्शक व्यवस्थापन, ३-स्तरीय कार्यप्रणाली व स्वायत्त निर्णयप्रक्रिया.
                </p>
              </div>

              {/* Legal Charter Card */}
              <div className="card" style={{ padding: '32px', borderRadius: '16px', marginBottom: '28px', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700 }}>✓ सेक्शन ८ नफाविरहित नोंदणीकृत</span>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 600 }}>कंपनी कायदा २०१३</span>
                    </div>
                    <h3 style={{ color: '#111827', fontFamily: 'Baloo 2', fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>📜 कायदेशीर स्वरूप व सनद (Section 8 Non-Profit Framework)</h3>
                    <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.65, margin: '0 0 16px' }}>
                      CONNECT MARATHA हे कंपनी कायदा २०१३ च्या कलम ८ अंतर्गत नोंदणीकृत नफाविरहित स्वायत्त व्यासपीठ आहे. या व्यासपीठावर कोणताही राजकीय पक्ष, दबावगट किंवा वैयक्तिक मालकी हक्क चालत नाही. व्यासपीठाचे संचालन लोकशाही पद्धतीने सल्लागार मंडळ, विधी समिती आणि जिल्हा प्रतिनिधींद्वारे केले जाते.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🔒 DPDP कायदा २०२३ डेटा सुरक्षा</span>
                      <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📋 वार्षिक ऑडिट अहवाल सार्वजनिक</span>
                      <span style={{ background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ शून्य राजकीय निधी धोरण</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Link to="/governance" className="btn btn-primary" style={{ padding: '9px 18px', textDecoration: 'none', background: 'var(--saffron-600, #C73800)', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}>
                        ⚖️ संस्थात्मक संविधान व DPDP धोरण पहा
                      </Link>
                      <Link to="/network" className="btn btn-outline" style={{ padding: '9px 18px', textDecoration: 'none', border: '1px solid var(--saffron-600, #C73800)', color: 'var(--saffron-600, #C73800)', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}>
                        🗺️ राज्य → विभाग → जिल्हा नेटवर्क पहा
                      </Link>
                    </div>
                  </div>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '230px', position: 'relative' }}>
                    <img src="/assets/images/morcha-court-battle.jpg" alt="कायदेशीर स्वरूप" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      संविधान & न्यायनिष्ठा
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Structural 3-Tier Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Org Card 1 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                      <img src="/assets/images/connect-maratha-council.jpg" alt="केंद्रीय सल्लागार मंडळ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(199,56,0,0.92)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        स्तर १ • सर्वोच्च धोरण
                      </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>केंद्रीय सल्लागार व तज्ज्ञ समिती</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        इतिहास संशोधक, कायदेतज्ज्ञ, निवृत्त लष्करी अधिकारी आणि शिक्षणतज्ज्ञांचे स्वतंत्र मंडळ, जे व्यासपीठाच्या ऐतिहासिक, बौद्धिक व घटनात्मक धोरणांवर देखरेख ठेवते.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🏛️ इतिहास संशोधन</span>
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>⚖️ विधी सल्ला</span>
                        <span style={{ background: '#ECFDF5', color: '#065F46', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ धोरण मान्यता</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>मार्गदर्शन: वार्षिक धोरण आखणी</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>सक्रिय समिती ★</span>
                  </div>
                </div>

                {/* Org Card 2 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                      <img src="/assets/images/meeting.jpg" alt="विभागीय समन्वय मंडळ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(184,134,11,0.92)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        स्तर २ • प्रशासकीय अंमलबजावणी
                      </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>६ महसूल विभागीय समन्वय केंद्रे</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        कोकण, पश्चिम महाराष्ट्र, मराठवाडा, उत्तर महाराष्ट्र, विदर्भ व नागपूर विभागातील समन्वयकांमार्फत उपक्रमांचे थेट नियोजन, निधी विनियोग व क्षेत्रीय अंमलबजावणी.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🗺️ ६ महसूल विभाग</span>
                        <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📊 त्रैमासिक आढावा</span>
                        <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ थेट समन्वय</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>प्रशासन: विभागवार समन्वयक</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>६/६ केंद्रे सक्रिय ★</span>
                  </div>
                </div>

                {/* Org Card 3 */}
                <div className="card" style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                      <img src="/assets/images/maratha-business-sangam.jpg" alt="जिल्हा व तालुका शाखा" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(46,125,50,0.92)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        स्तर ३ • स्थानिक कृती दल
                      </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>३६ जिल्हा व ३५०+ तालुका कृती दल</h4>
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                        स्थानिक पातळीवर रक्तपेढी समन्वय, दुर्ग स्वच्छता श्रमदान, उद्योजकांचे नेटवर्किंग, महिला बचत गट मार्गदर्शन आणि विद्यार्थी मदत केंद्रांचे प्रत्यक्ष संचलन.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🩸 रुग्णमित्र पथके</span>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🏰 दुर्ग श्रमदान गट</span>
                        <span style={{ background: '#F0FDF4', color: '#15803D', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ स्थानिक शाखा</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>विस्तार: ३५०+ तालुके कव्हर</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>स्थानिक सहभाग ★</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 7 / ADVISORY COUNCIL & LEADERSHIP */}
      <section className="section" id="council" style={{ padding: '64px 24px', background: activeTab === 'leadership' ? 'var(--paper, #fff)' : 'var(--paper-2, #FBF5EC)' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px' }}>
            <span className="tag" style={{ background: 'var(--saffron-500, #E65100)', color: '#fff', padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
              मार्गदर्शन, नेतृत्व व बौद्धिक संपदा (Leadership & IP Rights Governance)
            </span>
            <h2 style={{ fontSize: '2.3rem', margin: '12px 0 8px', fontFamily: 'Baloo 2' }}>सल्लागार मंडळ व अभ्यासक समिती</h2>
            <p style={{ color: 'var(--text-sec, #666)', fontSize: '1.02rem' }}>
              इतिहास संशोधक, कायदेतज्ज्ञ, निवृत्त लष्करी अधिकारी, वैद्यकीय संचालक व तंत्रज्ञान तज्ज्ञांचे निष्पक्ष मार्गदर्शक मंडळ.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Leader 1 */}
            <div className="card" style={{ 
              borderRadius: '16px', 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}>
              <div style={{ height: '210px', position: 'relative', background: '#F3F4F6', overflow: 'hidden' }}>
                <img 
                  src="/assets/images/council/council_historian.jpg" 
                  alt="डॉ. जयसिंगराव पवार" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%' }} 
                  onError={(e) => { e.target.src = '/assets/images/achievers/dr_jaysingrao_pawar.jpg'; }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(61,13,13,0.9)', backdropFilter: 'blur(4px)', color: '#F3C06B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  🏛️ इतिहास संशोधन & पुराभिलेखागार
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                  कोल्हापूर / पुणे
                </div>
              </div>
              <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>डॉ. जयसिंगराव पवार</h3>
                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>पुराभिलेखागार</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '10px' }}>
                    ज्येष्ठ इतिहास संशोधक, शिवचरित्र अभ्यासक व लेखक
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                    मराठा साम्राज्य, छत्रपती ताराराणी, छत्रपती राजाराम महाराज व शिवकालीन इतिहासाचे व्यासंगी मार्गदर्शक. ऐतिहासिक साधनांचे संपादन, अस्सल मोडी कागदपत्रांचे डिजिटायझेशन व सत्यता पडताळणी समितीचे प्रमुख.
                  </p>
                </div>
                
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>📚 ४०+ संशोधन ग्रंथ</span>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🏛️ मोडी लिपी तज्ज्ञ</span>
                    <span style={{ background: '#ECFDF5', color: '#065F46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ ऐतिहासिक पुरावे समिती</span>
                  </div>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>मार्गदर्शन: इतिहास व संदर्भ संकलन</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>सक्रिय सल्लागार ★</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leader 2 */}
            <div className="card" style={{ 
              borderRadius: '16px', 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}>
              <div style={{ height: '210px', position: 'relative', background: '#F3F4F6', overflow: 'hidden' }}>
                <img 
                  src="/assets/images/council/council_legal.jpg" 
                  alt="ॲड. विश्वासराव पाटील" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%' }} 
                  onError={(e) => { e.target.src = '/assets/images/achievers/advocate_portrait.jpg'; }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(61,13,13,0.9)', backdropFilter: 'blur(4px)', color: '#F3C06B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  ⚖️ विधी, घटना व IP Rights
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                  मुंबई / छत्रपती संभाजीनगर
                </div>
              </div>
              <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>ॲड. विश्वासराव पाटील</h3>
                    <span style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>IP Rights & Law</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '10px' }}>
                    उच्च न्यायालय विधी व डिजिटल कायदा सल्लागार
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                    मुंबई उच्च न्यायालयातील ज्येष्ठ विधी अभ्यासक. समुदाय डिजिटल डेटा संरक्षण (DPDP Act 2023), बौद्धिक संपदा हक्क, मराठा ट्रेडमार्क व कॉपीराइट संरक्षण आणि घटनात्मक आरक्षण कायदेशीर मसुदा समितीचे मार्गदर्शक.
                  </p>
                </div>
                
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>⚖️ मुंबई उच्च न्यायालय</span>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🔒 DPDP 2023 संरक्षण</span>
                    <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ पेटंट व बौद्धिक संपदा</span>
                  </div>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>मार्गदर्शन: विधी, सनद व डेटा हक्क</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>कायदेशीर सल्लागार ★</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leader 3 */}
            <div className="card" style={{ 
              borderRadius: '16px', 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}>
              <div style={{ height: '210px', position: 'relative', background: '#F3F4F6', overflow: 'hidden' }}>
                <img 
                  src="/assets/images/council/council_women_education.jpg" 
                  alt="प्रा. अनुराधा मोरे" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} 
                  onError={(e) => { e.target.src = '/assets/images/achievers/prof_sujata_patel.jpg'; }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(61,13,13,0.9)', backdropFilter: 'blur(4px)', color: '#F3C06B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  🎓 शिक्षण व महिला उद्योजकता
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                  पुणे विद्यापीठ / सातारा
                </div>
              </div>
              <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>प्रा. अनुराधा मोरे</h3>
                    <span style={{ background: '#FCE7F3', color: '#9D174D', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>महिला विकास</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '10px' }}>
                    उच्च शिक्षण मार्गदर्शक व महिला उद्योजक महासंघ अध्यक्षा
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                    सावित्रीबाई फुले पुणे विद्यापीठ अकॅडमिक कौन्सिल सदस्या. ग्रामीण व निमशहरी भागातील विद्यार्थिनींसाठी उच्च शिक्षण शिष्यवृत्ती, महिला स्टार्टअप इन्क्युबेशन आणि महिला बचत गटांच्या उत्पादनांना ई-कॉमर्स बाजारपेठ मिळवून देण्याचे कार्य.
                  </p>
                </div>
                
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🎓 विद्यार्थिनी शिष्यवृत्ती</span>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>💼 महिला बचत गट फेडरेशन</span>
                    <span style={{ background: '#FDF2F8', color: '#BE185D', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ SPPU अकॅडमिक कौन्सिल</span>
                  </div>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>मार्गदर्शन: महिला सक्षमीकरण & शिक्षण</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>शैक्षणिक मार्गदर्शक ★</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leader 4 */}
            <div className="card" style={{ 
              borderRadius: '16px', 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}>
              <div style={{ height: '210px', position: 'relative', background: '#F3F4F6', overflow: 'hidden' }}>
                <img 
                  src="/assets/images/council/council_defence.jpg" 
                  alt="कर्नल विजयराव साळुंखे" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} 
                  onError={(e) => { e.target.src = '/assets/images/achievers/db_shekatkar.jpg'; }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(61,13,13,0.9)', backdropFilter: 'blur(4px)', color: '#F3C06B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  🎖️ संरक्षण, युवा सैनिकी & आपत्ती निवारण
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                  मराठा लाईट इन्फंट्री / बेळगाव
                </div>
              </div>
              <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>कर्नल विजयराव साळुंखे</h3>
                    <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>मराठा लाईट इन्फंट्री</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--saffron-600, #C73800)', fontWeight: 700, marginBottom: '10px' }}>
                    निवृत्त संरक्षण अधिकारी, सेना मेडल व आपत्ती मदत प्रमुख
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 14px' }}>
                    मराठा लाईट इन्फंट्रीमध्ये प्रदीर्घ सेवा. मराठा तरुणांसाठी एनडीए, सीडीएस, अग्निवीर व पॅरामिलिटरी पूर्वतयारी अकादमीचे प्रमुख तसेच महाराष्ट्रातील पूर व भूस्खलन संकटात कार्य करणाऱ्या राज्यव्यापी स्वयंसेवक मदत दलाचे मुख्य निर्देशक.
                  </p>
                </div>
                
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🎖️ सेना मेडल सन्मानित</span>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>🛡️ आपत्कालीन बचाव दल</span>
                    <span style={{ background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>✓ युवा सैनिकी भरती पूर्वतयारी</span>
                  </div>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.78rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>मार्गदर्शन: राष्ट्रीय सुरक्षा व युवा शिस्त</span>
                    <span style={{ color: 'var(--saffron-600, #C73800)', fontWeight: 700 }}>संरक्षण मार्गदर्शक ★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINANCIAL TRANSPARENCY & AUDIT */}
      <section className="section" style={{ padding: '48px 24px 64px' }}>
        <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '36px 32px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ✓ १००% सार्वजनिक पारदर्शकता
                  </span>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 600 }}>
                    कलम ८ (Section 8 Non-Profit)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.9rem', margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>
                  आर्थिक अहवाल व निधी विनियोग (Financial Audit & Utilization)
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => showToast('📥 २०२५-२६ वित्तीय ऑडिट अहवाल डाऊनलोड सुरू झाला...')} 
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--saffron-600, #C73800)', color: 'var(--saffron-600, #C73800)', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  📥 ऑडिट अहवाल (PDF)
                </button>
                <Link
                  to="/governance"
                  style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--saffron-600, #C73800)', color: '#FFFFFF', textDecoration: 'none', fontWeight: 700, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  संविधान व नियमावली →
                </Link>
              </div>
            </div>

            <p style={{ fontSize: '0.94rem', color: '#4B5563', lineHeight: 1.65, maxWidth: '900px', marginBottom: '28px' }}>
              CONNECT MARATHA हे नफाविरहित (Not-for-profit) स्वायत्त व्यासपीठ आहे. दुर्ग संवर्धन, ग्रामीण विद्यार्थी शिष्यवृत्ती, आरोग्य मदत व आपत्कालीन सेवांसाठी प्राप्त झालेल्या प्रत्येक रुपयाचा काटेकोर व त्रैमासिक हिशेब संकेतस्थळावर जाहीर ठेवला जातो.
            </p>

            {/* 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#C2410C', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>₹४२.५ लाख</div>
                <div style={{ fontSize: '0.9rem', color: '#1F2937', fontWeight: 700, marginTop: '6px' }}>दुर्ग संवर्धन विनियोग</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>किल्ले स्वच्छता, फलक व VR डिजिटायझेशन</div>
              </div>

              <div style={{ background: '#FEFCE8', border: '1px solid #FEF08A', padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#854D0E', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>१,४५०+</div>
                <div style={{ fontSize: '0.9rem', color: '#1F2937', fontWeight: 700, marginTop: '6px' }}>विद्यार्थ्यांना शिष्यवृत्ती</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>MPSC, UPSC व सैनिकी भरती साहाय्य</div>
              </div>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#15803D', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>₹१८.३ लाख</div>
                <div style={{ fontSize: '0.9rem', color: '#1F2937', fontWeight: 700, marginTop: '6px' }}>आरोग्य व आपत्कालीन मदत</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>रक्तपेढी समन्वय व संकटग्रस्त कुटुंबे</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#334155', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>०%</div>
                <div style={{ fontSize: '0.9rem', color: '#1F2937', fontWeight: 700, marginTop: '6px' }}>प्रशासकीय नफा (Zero Profit)</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>१००% निधी थेट सामाजिक कामांसाठी</div>
              </div>
            </div>

            {/* Funds Utilization Breakdown & Statutory Badges */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', margin: 0, color: '#111827', fontFamily: 'Baloo 2', fontWeight: 700 }}>
                  निधी विनियोग प्रमाण (Fund Allocation Breakdown 2025-26)
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  लेखापरीक्षक: मे. जोशी आणि असोसिएट्‌स, चार्टर्ड अकाउंटंट्स (पुणे)
                </span>
              </div>

              {/* Progress bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#374151', fontWeight: 600 }}>
                    <span>🏰 गड-किल्ले संवर्धन व संशोधन</span>
                    <span style={{ color: '#C2410C', fontWeight: 700 }}>४५%</span>
                  </div>
                  <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: '#EA580C', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#374151', fontWeight: 600 }}>
                    <span>🎓 शैक्षणिक शिष्यवृत्ती व ग्रंथालये</span>
                    <span style={{ color: '#854D0E', fontWeight: 700 }}>३०%</span>
                  </div>
                  <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: '#CA8A04', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#374151', fontWeight: 600 }}>
                    <span>🩸 आपत्कालीन मदत व आरोग्य सेवा</span>
                    <span style={{ color: '#15803D', fontWeight: 700 }}>१५%</span>
                  </div>
                  <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '15%', height: '100%', background: '#16A34A', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: '#374151', fontWeight: 600 }}>
                    <span>💻 डिजिटल प्लॅटफॉर्म व सर्व्हर मेंटेनन्स</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>१०%</span>
                  </div>
                  <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '10%', height: '100%', background: '#2563EB', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>

              {/* Statutory verification chips */}
              <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px dashed #D1D5DB', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600 }}>वैधानिक मान्यता:</span>
                <span style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#374151', fontWeight: 600 }}>📜 Section 8 License No. 142857</span>
                <span style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#374151', fontWeight: 600 }}>🛡️ 12A & 80G आयकर सूट पात्र</span>
                <span style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#374151', fontWeight: 600 }}>💼 MCA नोंदणीकृत स्वायत्त संस्था</span>
                <span style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#374151', fontWeight: 600 }}>🔒 DPDP 2023 अनुपालन</span>
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
