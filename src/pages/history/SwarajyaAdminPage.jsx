import React from 'react';
import { Link } from 'react-router-dom';

const ASHTAPRADHAN = [
  { post: 'पंतप्रधान (पेशवे)', name: 'मोरोपंत त्र्यंबक पिंगळे', duty: 'समग्र राज्यकारभार चालवणे, छत्रपतींच्या अनुपस्थितीत राज्याचे रक्षण व युद्ध मोहीम नेतृत्व.', icon: '👑' },
  { post: 'पंत अमात्य (मुजुमदार)', name: 'रामचंद्र नीलकंठ मुजुमदार (अमात्य)', duty: 'राज्याचा जमाखर्च, वित्त व्यवस्थापन, महसूल तपासणी आणि कोषागार नियंत्रण.', icon: '💰' },
  { post: 'पंत सचिव (सुरनिस)', name: 'अण्णाजी दत्तो', duty: 'शासकीय आज्ञापत्रे, सनदा, फर्माने तपासणे व राज्य दस्तऐवजांची सत्यता प्रमाणित करणे.', icon: '📜' },
  { post: 'मंत्री (वाकनीस)', name: 'दत्ताजी त्रिंबक वाकनीस', duty: 'छत्रपतींची दैनंदिनी, खासगी व्यवहार, राजदरबारातील घडामोडी व गुप्तहेर यंत्रणा.', icon: '🕵️' },
  { post: 'सरसेनापती (हंबीरराव)', name: 'हंसाजी (हंबीरराव) मोहिते', duty: 'घोडदळ व पायदळाचे सर्वोच्च नेतृत्व, सैन्य भरती, रसद, छावण्या व युद्ध व्यूहरचना.', icon: '⚔️' },
  { post: 'सुमंत (डबीर)', name: 'रामचंद्र त्रिंबक डबीर', duty: 'परराष्ट्र धोरण, इतर सत्तांशी पत्रव्यवहार, गुप्त खलबते व परकीय वकिलांचे स्वागत.', icon: '🌍' },
  { post: 'न्यायाधीश (काझी/न्यायशास्त्री)', name: 'निराजी रावजी', duty: 'राज्यातील सर्वोच्च न्यायदान, दिवाणी व फौजदारी खटल्यांचा निःपक्षपाती निवाडा करणे.', icon: '⚖️' },
  { post: 'पंडितराव (दानाध्यक्ष)', name: 'रघुनाथराव पंडितराव', duty: 'धर्मव्यवस्था, दानधर्म, विद्वान ब्राह्मणांचे सत्कार व धार्मिक आचार-विचारांचे नियमन.', icon: '📿' }
];

export default function SwarajyaAdminPage() {
  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '40px 32px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#3D0D0D',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            ⚖️ शिवकालीन प्रशासन प्रणाली
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            स्वराज्य प्रशासन व अष्टप्रधान मंडळ
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
            छत्रपती शिवाजी महाराजांनी १६७४ च्या राज्याभिषेकानंतर स्थापन केलेले जगातील पहिले आधुनिक प्रजाकल्याणकारी व लोकशाही तत्त्वांवर आधारित मंत्रिमंडळ.
          </p>
        </div>

        {/* 8 Pradhans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          {ASHTAPRADHAN.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E6DDCE',
                boxShadow: '0 6px 20px rgba(199,56,0,0.06)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
              <div style={{
                fontSize: '28px',
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#FDF3E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {p.icon}
              </div>
              <div>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#3D0D0D',
                  margin: '0 0 4px'
                }}>
                  {p.post}
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#C9701C', fontWeight: 700, marginBottom: '8px' }}>
                  पदसिद्ध प्रमुख: <strong>{p.name}</strong>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.55, margin: 0 }}>
                  {p.duty}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Welfare Principles */}
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '32px', border: '1px solid #E6DDCE' }}>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.5rem', color: '#3D0D0D', margin: '0 0 16px' }}>
            🚩 शिवकालीन रयतेचे राज्य — प्रमुख सूत्रे
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div style={{ padding: '16px', background: '#FAF6F0', borderRadius: '12px', border: '1px solid #E6DDCE' }}>
              <div style={{ fontWeight: 800, color: '#7A1C1C', marginBottom: '6px' }}>🌾 रयतेच्या भाजीच्या देठालाही हात लावू नये</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5 }}>सैन्याकडून शेतकऱ्यांच्या पिकांचे नुकसान होऊ नये म्हणून शिवरायांचे अत्यंत कडक फर्मान होते.</div>
            </div>
            <div style={{ padding: '16px', background: '#FAF6F0', borderRadius: '12px', border: '1px solid #E6DDCE' }}>
              <div style={{ fontWeight: 800, color: '#7A1C1C', marginBottom: '6px' }}>💰 रोख वेतनाची पद्धत (कॅश पेमेंट)</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5 }}>वतनदारी किंवा जहागीरदारीऐवजी सैनिकांना व अधिकाऱ्यांना थेट राजकोषातून नियमित रोख पगार दिला जात असे.</div>
            </div>
            <div style={{ padding: '16px', background: '#FAF6F0', borderRadius: '12px', border: '1px solid #E6DDCE' }}>
              <div style={{ fontWeight: 800, color: '#7A1C1C', marginBottom: '6px' }}>🛡️ स्त्रियांचा सर्वोच्च आदर</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5 }}>शत्रूच्या प्रदेशातील महिलांनाही मातेसमान सन्मान देण्याचा अलिखित नियम शिवकालीन सैन्यात पाळला जात असे.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
