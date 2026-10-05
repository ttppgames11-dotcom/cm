import React from 'react';
import { Link } from 'react-router-dom';

export default function WhyJoinPage() {
  const benefits = [
    {
      icon: '🪪',
      title: '१. अधिकृत डिजिटल स्मार्ट ओळखपत्र (Smart ID Card)',
      badge: 'NFC 2.0 & DPDP प्रमाणित',
      color: '#C2410C',
      bg: '#FFF7ED',
      border: '#FED7AA',
      desc: 'प्रत्येक सदस्याला अद्वितीय CM-ID, एनक्रिप्टेड QR कोड आणि लेझर प्रिंटेड डिजिटल स्मार्ट ओळखपत्र मिळते. हे ओळखपत्र सर्व अधिकृत कार्यक्रमांमध्ये, व्यवसाय बैठकांमध्ये आणि आपत्कालीन मदतीसाठी प्रमाणित मानले जाते.'
    },
    {
      icon: '🤝',
      title: '२. बिझनेस संगम व अंतर्गत B2B व्यवसाय संदर्भ (Referrals)',
      badge: 'वार्षिक ₹५००+ कोटी व्यापार लक्ष्य',
      color: '#9A3412',
      bg: '#FEF3C7',
      border: '#FCD34D',
      desc: 'मराठा उद्योजक, व्यावसायिक, उत्पादक आणि सेवा पुरवठादारांना परस्परांशी जोडून थेट व्यवसाय संदर्भ (Referral Exchange) व १-टू-१ बैठकांचे दालन. अंतर्गत बाजारपेठेचा लाभ घेऊन व्यवसाय वाढवा.'
    },
    {
      icon: '🩸',
      title: '३. २४×७ आपत्कालीन रक्तदाता नेटवर्क व आरोग्य साहाय्य',
      badge: '३६ जिल्हे • तात्काळ मदत',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      desc: 'राज्यातील ३६ जिल्ह्यांतील १०,०००+ सक्रिय रक्तदात्यांचे लाईव्ह नेटवर्क. कोणत्याही आपत्कालीन प्रसंगी, शस्त्रक्रियेवेळी किंवा अपघाताच्या वेळी एका क्लिकवर मोफत रक्तदाता व वैद्यकीय मार्गदर्शन उपलब्ध.'
    },
    {
      icon: '🏰',
      title: '४. ३५०+ गड-किल्ले संवर्धन व सत्य इतिहास संशोधन',
      badge: 'स्वराज्य वारसा जतन',
      color: '#7C1D05',
      bg: '#FFF8F0',
      border: '#FED7AA',
      desc: 'सह्याद्रीतील गडकोटांचे जतन, स्वच्छता मोहिमा, ऐतिहासिक बखरींचे डिजिटायझेशन आणि विकृतीकरणाला चोख उत्तर देणारे संशोधन. इतिहासाचे अभ्यासक व दुर्गप्रेमींचे भव्य व्यासपीठ.'
    },
    {
      icon: '💼',
      title: '५. रोजगार केंद्र, स्पर्धा परीक्षा व उच्च शिक्षण शिष्यवृत्ती',
      badge: 'करिअर व युवा सक्षमीकरण',
      color: '#0369A1',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      desc: 'MPSC, UPSC, सैनिकी सेवा, बँकिंग आणि आयटी क्षेत्रातील रोजगाराच्या संधी. ग्रामीण भागातील होतकरू व गुणवंत विद्यार्थ्यांना तज्ज्ञ अधिकाऱ्यांचे थेट मार्गदर्शन व शिष्यवृत्ती साहाय्य.'
    },
    {
      icon: '⚖️',
      title: '६. ५६ प्रशासकीय पदे, नेतृत्व व सामाजिक योगदान',
      badge: 'ग्रामशाखा ते राज्य कार्यकारिणी',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      desc: '३५८+ तालुक्यांमध्ये आणि ३,२००+ ग्रामशाखांमध्ये विविध ५६ सन्माननीय पदांवर काम करण्याची संधी. आपल्या भागातील सामाजिक प्रश्न सोडवण्यासाठी थेट नेतृत्व आणि अधिकृत अधिकार.'
    },
    {
      icon: '💍',
      title: '७. सुरक्षित व प्रमाणित मराठा वधू-वर सूचक मंच',
      badge: 'DPDP सुरक्षित • ९६ कुळे',
      color: '#BE185D',
      bg: '#FDF2F8',
      border: '#FBCFE8',
      desc: 'समाजातील उच्चशिक्षित व अनुरूप स्थळांची १००% बायोमेट्रिक/आधार प्रमाणित प्रोफाइल. गोपनीय आणि सुरक्षित वातावरणात योग्य जोडीदाराचा शोध.'
    },
    {
      icon: '🛡️',
      title: '८. पूर्णपणे स्वायत्त, अ-राजकीय व नफाविरहित रचना',
      badge: 'Section 8 Non-Profit',
      color: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      desc: 'Connect Maratha हे कंपनी कायदा २०१३ च्या कलम ८ अंतर्गत नोंदणीकृत असून कोणत्याही राजकीय पक्षाशी बांधील नाही. संपूर्ण कारभार लोकशाही मूल्यांवर आणि १००% सार्वजनिक पारदर्शकतेवर चालतो.'
    }
  ];

  return (
    <div style={{ background: '#FDFBF7', minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* HERO SECTION */}
        <div style={{
          background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 50%, #9A3412 100%)',
          borderRadius: '24px',
          color: '#FFFFFF',
          padding: '48px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(124, 29, 5, 0.2)',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '30px',
            fontSize: '0.86rem',
            fontWeight: 800,
            marginBottom: '16px'
          }}>
            <span>🚩</span>
            <span>अखिल भारतीय डिजिटल महासंघ • अधिकृत सभासदत्व</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.2vw, 3.2rem)',
            margin: '0 0 16px',
            fontWeight: 900,
            fontFamily: 'Baloo 2',
            lineHeight: 1.2
          }}>
            Connect Maratha मध्ये सहभागी का व्हावे?
          </h1>

          <p style={{
            fontSize: '1.15rem',
            maxWidth: '780px',
            margin: '0 auto 28px',
            opacity: 0.95,
            lineHeight: 1.7
          }}>
            इतिहास जपणे, व्यवसाय वाढवणे, संकटात परस्परांना साथ देणे आणि भावी पिढीसाठी एक सशक्त, समृद्ध व स्वाभिमानी समाज घडवणे — या महायज्ञात आजच आपले योगदान द्या!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              className="btn"
              style={{
                background: '#FFFFFF',
                color: '#7C1D05',
                fontWeight: 900,
                fontSize: '1.05rem',
                padding: '14px 28px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🚩</span>
              <span>आता मोफत नोंदणी करा (Join Now)</span>
            </Link>

            <Link
              to="/card"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1.5px solid #FFFFFF',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.02rem',
                padding: '14px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🪪</span>
              <span>स्मार्ट ओळखपत्र पहा</span>
            </Link>
          </div>
        </div>

        {/* 8 CORE REASONS GRID */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ background: '#FFF7ED', color: '#C2410C', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid #FED7AA' }}>
              ⭐ प्रमुख ८ फायदे व वैशिष्ट्ये
            </span>
            <h2 style={{ fontSize: '2rem', color: '#7C1D05', margin: '10px 0 6px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              Connect Maratha सदस्यत्वाचे मुख्य लाभ
            </h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '1rem' }}>
              प्रत्येक सभासदाच्या वैयक्तिक, व्यावसायिक आणि सामाजिक प्रगतीसाठी तयार केलेली बहुआयामी परिसंस्था.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {benefits.map((b, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '28px 24px',
                  border: `1.5px solid ${b.border}`,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{
                      fontSize: '2rem',
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: b.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${b.border}`
                    }}>
                      {b.icon}
                    </div>
                    <span style={{
                      background: b.bg,
                      color: b.color,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '10px',
                      border: `1px solid ${b.border}`
                    }}>
                      {b.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 10px', fontWeight: 800, fontFamily: 'Baloo 2' }}>
                    {b.title}
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-STEP EASY REGISTRATION WALKTHROUGH */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #FED7AA',
          padding: '36px 28px',
          marginBottom: '48px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.6rem', color: '#7C1D05', textAlign: 'center', margin: '0 0 28px', fontWeight: 800, fontFamily: 'Baloo 2' }}>
            🚩 सभासद होण्याची सुलभ ३-टप्पीय प्रक्रिया
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFF8F0', padding: '20px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#7C1D05', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                १
              </div>
              <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontWeight: 800 }}>नोंदणी फॉर्म भरा</h4>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>आपले नाव, संपर्क, जिल्हा व प्राथमिक माहिती नोंदवा.</p>
            </div>

            <div style={{ background: '#FFF8F0', padding: '20px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#C2410C', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                २
              </div>
              <h4 style={{ margin: '0 0 6px', color: '#C2410C', fontWeight: 800 }}>फोटो व तपशील अपलोड</h4>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>स्मार्ट कार्डसाठी पासपोर्ट फोटो व व्यवसाय माहिती जोडा.</p>
            </div>

            <div style={{ background: '#FFF8F0', padding: '20px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#15803D', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                ३
              </div>
              <h4 style={{ margin: '0 0 6px', color: '#15803D', fontWeight: 800 }}>स्मार्ट कार्ड प्राप्त करा</h4>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>त्वरित डिजिटल कार्ड डाऊनलोड करा व सर्व सुविधांचा लाभ घ्या.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div style={{
          background: 'linear-gradient(135deg, #1E293B, #0F172A)',
          borderRadius: '20px',
          color: '#FFFFFF',
          padding: '36px 28px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 900, fontFamily: 'Baloo 2', color: '#FED7AA' }}>
            आजच आपल्या मराठा समाजाच्या अधिकृत महाव्यासपीठाचे शिलेदार व्हा!
          </h2>
          <p style={{ margin: 0, opacity: 0.88, fontSize: '1rem', maxWidth: '650px' }}>
            कोणतीही फी नाही, १००% सुरक्षित DPDP २०२३ अनुपालन आणि आजीवन सामाजिक ओळख.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
            <Link to="/register" className="btn" style={{ background: '#C2410C', color: '#FFFFFF', fontWeight: 900, padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}>
              🚩 नवीन नोंदणी करा
            </Link>
            <Link to="/login" className="btn" style={{ background: 'transparent', border: '1.5px solid #FFFFFF', color: '#FFFFFF', fontWeight: 700, padding: '12px 24px', borderRadius: '10px', textDecoration: 'none' }}>
              👤 आधीच खाते आहे? लॉगिन करा
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
