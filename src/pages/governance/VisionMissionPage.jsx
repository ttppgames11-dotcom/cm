import React from 'react';
import { Link } from 'react-router-dom';

export default function VisionMissionPage() {
  const visionPillars = [
    {
      icon: '🏰',
      title: '३५०+ गड-किल्ल्यांचे १००% डिजिटायझेशन व संवर्धन',
      color: '#C2410C',
      bg: '#FFF7ED',
      border: '#FED7AA',
      desc: 'सह्याद्रीतील प्रत्येक किल्ल्याचा अस्सल इतिहास, ३६०° आभासी दर्शन, संवर्धन कृती आराखडा आणि आंतरराष्ट्रीय पातळीवर शिवकालीन स्थापत्यकलेचा प्रचार.'
    },
    {
      icon: '💼',
      title: '₹ १०,००० कोटींचा वार्षिक B2B व्यापार संगम',
      color: '#9A3412',
      bg: '#FEF3C7',
      border: '#FCD34D',
      desc: "'व्यवसाय संगम' चॅप्टर्सच्या माध्यमातून मराठी उद्योजक, उत्पादक व व्यावसायिकांना थेट राष्ट्रीय व आंतरराष्ट्रीय खरेदीदारांशी जोडून आर्थिक संपन्नता निर्माण करणे."
    },
    {
      icon: '🎓',
      title: '१ लाख मराठा युवा करिअर व रोजगार सक्षमीकरण',
      color: '#0369A1',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      desc: 'UPSC, MPSC, आयटी, आर्टिफिशिअल इंटेलिजन्स, सैनिकी सेवा आणि संरक्षण दलात मराठा तरुणांचे प्रमाण सर्वोच्च पातळीवर नेणे.'
    },
    {
      icon: '🩸',
      title: '२४×७ आपत्कालीन सुरक्षा व रक्तदाता महासाखळी',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      desc: 'महाराष्ट्रातील सर्व ३६ जिल्हे व ३५८+ तालुक्यांमध्ये एका क्लिकवर तत्काळ रक्तदाता, वैद्यकीय साहाय्य आणि कायदेशीर मदत उपलब्ध करणे.'
    }
  ];

  const missionPillars = [
    {
      num: '१',
      title: 'अस्सल ऐतिहासिक ज्ञाननिर्मिती व ग्रंथालय',
      color: '#C2410C',
      desc: 'ऐतिहासिक साधनांचे (बखरी, मोडी लिपी कागदपत्रे, अस्सल फर्मान) संकलन व सार्वजनिक डिजिटल ग्रंथालय निर्माण करणे. इतिहासाचे विकृतीकरण रोखून सत्य इतिहास समाजासमोर मांडणे.'
    },
    {
      num: '२',
      title: 'स्वयंपूर्ण व्यवसाय संगम व शून्य मध्यस्थी व्यापार',
      color: '#D97706',
      desc: '३६ जिल्ह्यांत ५००+ व्यवसाय संगम चॅप्टर्सची स्थापना करणे. शेतकरी, उत्पादक आणि व्यापारी यांच्यातील दलाली संपवून थेट नफा उत्पादकाच्या हातात देणे.'
    },
    {
      num: '३',
      title: 'सामाजिक कल्याण व संकटमोचक रुग्ण साहाय्य',
      color: '#15803D',
      desc: 'गरजू रुग्णांना आर्थिक व वैद्यकीय साहाय्य, आपत्कालीन रुग्णवाहिका समन्वय आणि ग्रामीण भागात मोफत आरोग्य तपासणी शिबिरे.'
    },
    {
      num: '४',
      title: 'युवा, क्रीडा व ऑलिम्पिक प्रतिभा विकास',
      color: '#0284C7',
      desc: 'मर्दानी खेळ, कुस्ती, दुर्गभ्रमंती आणि राष्ट्रीय-आंतरराष्ट्रीय खेळांसाठी ग्रामीण भागातील गुणवंत खेळाडूंना आर्थिक व तांत्रिक पाठबळ देणे.'
    },
    {
      num: '५',
      title: 'डिजिटल स्वाभिमान व १००% डेटा गोपनीयता (DPDP २०२३)',
      color: '#7C3AED',
      desc: 'कोणत्याही राजकीय हस्तक्षेपाशिवाय संपूर्ण पारदर्शक, लोकशाही व स्वायत्त कारभार चालवणे. प्रत्येक सदस्याच्या माहितीचे सर्वोच्च एनक्रिप्शन.'
    }
  ];

  const coreValues = [
    { icon: '⚔️', title: 'शौर्य व स्वाभिमान', desc: 'शिवरायांच्या स्वराज्य तत्त्वांचा आदर आणि अन्याय-असत्याविरोधात अखंड जागृती.' },
    { icon: '🤝', title: 'एकता व सहकार्य', desc: 'आपसातील हेवेदावे विसरून परस्परांच्या प्रगतीसाठी खांद्याला खांदा लावून उभे राहणे.' },
    { icon: '🔍', title: 'सत्यनिष्ठा व पारदर्शकता', desc: 'संशोधनधारित इतिहास आणि प्रत्येक रुपयाच्या जमा-खर्चाची १००% सार्वजनिक पारदर्शकता.' },
    { icon: '🚀', title: 'आधुनिकता व प्रगती', desc: 'परंपरा आणि संस्कृतीचा अभिमान बाळगून विज्ञानाभिमुख व आधुनिक तंत्रज्ञानाचा अंगीकार.' }
  ];

  return (
    <div style={{ background: '#FDFBF7', minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* HERO BANNER */}
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
            <span>🎯</span>
            <span>Connect Maratha • दूरदृष्टी, ध्येय व संकल्प (Vision 2030)</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)',
            margin: '0 0 16px',
            fontWeight: 900,
            fontFamily: 'Baloo 2',
            lineHeight: 1.2
          }}>
            आमची दूरदृष्टी व ध्येय (Vision & Mission)
          </h1>

          <p style={{
            fontSize: '1.15rem',
            maxWidth: '820px',
            margin: '0 auto 28px',
            opacity: 0.95,
            lineHeight: 1.7
          }}>
            "ग्लोबल मराठा: आर्थिक, बौद्धिक व सांस्कृतिक महाशक्ती" — २०३० पर्यंत जगभरातील ५ कोटी मराठा समाजाला जोडणारे सर्वात विश्वासू, स्वायत्त व तंत्रज्ञानसज्ज डिजिटल महाव्यासपीठ.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/why-join"
              className="btn"
              style={{
                background: '#FFFFFF',
                color: '#7C1D05',
                fontWeight: 900,
                fontSize: '1.02rem',
                padding: '12px 26px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⭐</span>
              <span>सहभागी का व्हावे?</span>
            </Link>

            <Link
              to="/blueprint"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1.5px solid #FFFFFF',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.02rem',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🏆</span>
              <span>५० विभाग मास्टर ब्लूप्रिंट पहा</span>
            </Link>
          </div>
        </div>

        {/* SECTION 1: VISION 2030 (४ मुख्य ध्येयस्तंभ) */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ background: '#FFF7ED', color: '#C2410C', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid #FED7AA' }}>
              🌟 VISION 2030
            </span>
            <h2 style={{ fontSize: '2rem', color: '#7C1D05', margin: '10px 0 6px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              २०३० ची दूरदृष्टी व संकल्प
            </h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '1rem' }}>
              आगामी दशकात समाजाला सर्वोच्च उंचीवर नेण्यासाठी आखलेली ठोस उद्दिष्टे.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {visionPillars.map((v, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '28px 24px',
                  border: `1.5px solid ${v.border}`,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{
                  fontSize: '2.2rem',
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: v.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${v.border}`
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: 0, fontWeight: 800, fontFamily: 'Baloo 2' }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: MISSION (आमचे ५ मुख्य कार्यस्तंभ) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #FED7AA',
          padding: '40px 32px',
          marginBottom: '50px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid #FCD34D' }}>
              🚩 MISSION PILLARS
            </span>
            <h2 style={{ fontSize: '2rem', color: '#7C1D05', margin: '10px 0 6px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              आमचे ५ मूलभूत कार्यस्तंभ
            </h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '1rem' }}>
              प्रत्येक क्षेत्रात शाश्वत विकास घडवून आणण्यासाठी आखलेली कृती-योजना.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {missionPillars.map((m, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFDF9',
                  border: '1px solid #FED7AA',
                  borderLeft: `5px solid ${m.color}`,
                  borderRadius: '14px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: m.color,
                  color: '#FFFFFF',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '1.05rem'
                }}>
                  {m.num}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 6px', fontWeight: 800, fontFamily: 'Baloo 2' }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: CORE VALUES */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ background: '#F1F5F9', color: '#334155', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid #CBD5E1' }}>
              💎 CORE VALUES
            </span>
            <h2 style={{ fontSize: '2rem', color: '#7C1D05', margin: '10px 0 6px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              ज्या मूल्यांवर CONNECT MARATHA उभा आहे
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {coreValues.map((val, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '24px 20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>{val.icon}</div>
                <h3 style={{ fontSize: '1.15rem', color: '#0F172A', margin: '0 0 8px', fontWeight: 800, fontFamily: 'Baloo 2' }}>
                  {val.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
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
            या ऐतिहासिक व्हिजनचा भाग व्हा!
          </h2>
          <p style={{ margin: 0, opacity: 0.88, fontSize: '1rem', maxWidth: '650px' }}>
            आपल्या ज्ञानाचे, व्यवसायाचे आणि वेळेचे योगदान देऊन मराठा समाजाच्या समृद्धीसाठी एकत्र या.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
            <Link to="/register" className="btn" style={{ background: '#C2410C', color: '#FFFFFF', fontWeight: 900, padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}>
              🚩 अधिकृत सभासद व्हा
            </Link>
            <Link to="/about" className="btn" style={{ background: 'transparent', border: '1.5px solid #FFFFFF', color: '#FFFFFF', fontWeight: 700, padding: '12px 24px', borderRadius: '10px', textDecoration: 'none' }}>
              🏛️ संस्था परिचय पहा
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
