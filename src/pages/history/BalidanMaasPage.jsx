import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BalidanMaasPage() {
  const [pledgeTaken, setPledgeTaken] = useState(false);
  const [pledgeCount, setPledgeCount] = useState(16743);

  const handlePledge = () => {
    if (!pledgeTaken) {
      setPledgeTaken(true);
      setPledgeCount(prev => prev + 1);
    }
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Solemn Hero Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #2A0709 0%, #4A0E17 60%, #1A0407 100%)',
          color: '#FFF',
          padding: '44px 32px',
          border: '2px solid #DD8A2E',
          boxShadow: '0 20px 50px rgba(42,7,9,0.4)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              background: '#C9701C',
              color: '#FFF',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              🕯️ ऐतिहासिक स्मृती पर्व
            </span>
            <span style={{ color: '#F0B866', fontSize: '0.88rem', fontWeight: 600 }}>
              फाल्गुन शुद्ध प्रतिपदा ते फाल्गुन अमावास्या
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
            fontWeight: 800,
            margin: '8px 0 12px',
            color: '#FFF',
            lineHeight: 1.3
          }}>
            छत्रपती संभाजी महाराज बलिदान मास व स्मृती दालन
          </h1>

          <p style={{ color: '#E6DDCE', fontSize: '1.05rem', maxWidth: '760px', lineHeight: 1.6, margin: '0 0 24px' }}>
            "मरण आले तरी चालेल, पण स्वाभिमान व स्वराज्य सोडणार नाही!" — मोगल आक्रमक औरंगजेबाच्या अमानुष छळाला न झुकता मातृभूमी व धर्मासाठी सर्वोच्च बलिदान देणारे अद्वितीय युगपुरुष धर्मवीर छत्रपती संभाजी महाराज.
          </p>

          {/* Pledge Button */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handlePledge}
              disabled={pledgeTaken}
              style={{
                padding: '13px 28px',
                background: pledgeTaken ? '#4CAF50' : 'linear-gradient(135deg, #E65100 0%, #EA580C 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '30px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: pledgeTaken ? 'default' : 'pointer',
                boxShadow: '0 6px 20px rgba(230,81,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              {pledgeTaken ? '✓ आपण बलिदान मास संकल्प केला आहे!' : '🕯️ मी बलिदान मास संकल्प करतो'}
            </button>
            <div style={{ color: '#F0B866', fontSize: '0.9rem', fontWeight: 700 }}>
              🚩 आतापर्यंत <strong>{pledgeCount.toLocaleString('mr-IN')}</strong> बांधवांनी संकल्प केला आहे
            </div>
          </div>
        </div>

        {/* 3 Pillars of Balidan Maas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #DD8A2E' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>⚔️</div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#3D0D0D', margin: '0 0 8px' }}>
              १२८ लढायांमध्ये अपराजित
            </h3>
            <p style={{ color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
              छत्रपती संभाजी महाराजांनी आपल्या ९ वर्षांच्या राजवटीत औरंगजेब, आदिलशाही, कुतुबशाही, सिद्दी व पोर्तुगीज या पाचही शत्रूंविरुद्ध अखंड लढा दिला आणि एकाही लढाईत पराभव स्वीकारला नाही.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #7A1C1C' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>📚</div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#3D0D0D', margin: '0 0 8px' }}>
              संस्कृत महापंडित व बुधभूषणम्
            </h3>
            <p style={{ color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
              अवघ्या १४ व्या वर्षी 'बुधभूषणम्' या संस्कृत ग्रंथाची रचना करणारे शंभूराजे उत्तम कवी, १६ भाषांचे जाणकार आणि प्रज्ञावंत विचारवंत होते.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #DD8A2E' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🚩</div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#3D0D0D', margin: '0 0 8px' }}>
              तुळापूर व वधू बुद्रुक समाधी तीर्थ
            </h3>
            <p style={{ color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
              भीमा आणि भामा नदीच्या संगमावरील तुळापूर येथे बलिदान आणि वधू बुद्रुक येथे वीर शिवले शिंदेंच्या सहकार्याने उभारलेली पवित्र समाधी हे महाराष्ट्राचे अढळ प्रेरणास्थान आहे.
            </p>
          </div>

        </div>

        {/* 40-Day Observance Guide */}
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '32px', border: '1px solid #E6DDCE', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.55rem', color: '#3D0D0D', margin: '0 0 16px' }}>
            🕯️ बलिदान मास आचरण मार्गदर्शक (४० दिवस)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ fontWeight: 800, color: '#C9701C', marginBottom: '6px' }}>१. रोज सकाळी दीप प्रज्वलन</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>घरासमोर किंवा देवघरात छत्रपती संभाजी महाराजांच्या प्रतिमेपुढे एक दीप प्रज्वलित करून नमन करावे.</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ fontWeight: 800, color: '#C9701C', marginBottom: '6px' }}>२. शिव-शंभू चरित्राचे वाचन</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>कुटुंबासमवेत रोज किमान १५ मिनिटे छत्रपती संभाजी महाराजांच्या पराक्रमाचा इतिहास वाचावा.</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ fontWeight: 800, color: '#C9701C', marginBottom: '6px' }}>३. व्यसनमुक्ती व साधेपणा</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>या ४० दिवसांत मद्यपान, धूम्रपान व व्यसनांपासून पूर्ण दूर राहून संयम व साधेपणा पाळावा.</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ fontWeight: 800, color: '#C9701C', marginBottom: '6px' }}>४. समाजसेवा व दुर्ग संवर्धन</div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B' }}>रक्तदान, गड संवर्धन श्रमदान किंवा गरजू विद्यार्थ्यांना शैक्षणिक मदत करून शंभूरायांना आदरांजली द्यावी.</div>
            </div>
          </div>

          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link
              to="/history/sambhaji-maharaj"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: '#5C1414',
                color: '#FFF',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(92,20,20,0.3)'
              }}>
              छत्रपती संभाजी महाराज सविस्तर चरित्र वाचा →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
