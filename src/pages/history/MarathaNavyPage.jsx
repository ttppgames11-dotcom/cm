import React from 'react';
import { Link } from 'react-router-dom';

const SHIPS_DATA = [
  { name: 'गुराब (Gurab)', type: 'मोठे लढाऊ जहाज', desc: '३०० ते ४०० टन वजनाचे, ३ डोलकाठ्यांचे आणि १५ ते २० तोफांनी सज्ज असलेले प्रमुख युद्धनौका जहाज.' },
  { name: 'गलबत (Galbat)', type: 'वेगवान लढाऊ नौका', desc: '१०० ते १५० टन, ३० ते ४० वल्ह्यांची आणि उथळ पाण्यात शत्रूच्या जहाजांना वेगाने घेरण्यास सक्षम.' },
  { name: 'पाल (Pal)', type: 'प्रचंड युद्धनौका', desc: 'युरोपियन फ्रिगेट जहाजांशी मुकाबला करणारी मराठा आरमाराची महाकाय तोफधारी नौका.' },
  { name: 'मचवा व शिबाड (Machwa)', type: 'पुरवठा व टेहळणी नौका', desc: 'रसद पुरवठा, सैनिकांची वाहतूक आणि उथळ खाडीत टेहळणीसाठी वापरल्या जाणाऱ्या चपळ नौका.' }
];

const SEA_FORTS = [
  { name: 'किल्ले सिंधुदुर्ग', place: 'मालवण', desc: 'छत्रपती शिवरायांनी १६६४ मध्ये उभारलेला अभेद्य जलदुर्ग. दगडामध्ये शिसे ओतून बांधलेली पायाभरणी आणि आत शिवरायांचे एकमेव मंदिर.' },
  { name: 'किल्ले विजयदुर्ग (घेरिया)', place: 'देवगड', desc: 'मराठा आरमाराची मुख्य राजधानी व गोदी. पाण्याखालील गुप्त भिंत (Undersea Wall) ही संरक्षणाची अद्भुत रचना.' },
  { name: 'किल्ले सुवर्णदुर्ग', place: 'दापोली, हर्णे', desc: 'आंग्रे घराण्याचे जहाजबांधणी तळ आणि चारी बाजूंनी समुद्राच्या लाटांनी वेढलेला सागरी गड.' },
  { name: 'किल्ले पद्मदुर्ग (कासा)', place: 'मुरुड-जंजिरा समोर', desc: 'सिद्दीच्या जंजिऱ्याला शह देण्यासाठी शिवरायांनी समुद्रात खडकावर उभा केलेला प्रति-जंजिरा.' },
  { name: 'खांदेरी-उंदेरी', place: 'अलिबाग-मुंबईजवळ', desc: 'मुंबईच्या समुद्रावर ब्रिटिशांच्या नाकावर टिच्चून शिवरायांनी १६७९ मध्ये उभारलेला नाविक तळ.' }
];

export default function MarathaNavyPage() {
  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Navy Hero */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 50%, #0F172A 100%)',
          color: '#FFF',
          padding: '44px 32px',
          border: '2px solid #DD8A2E',
          boxShadow: '0 16px 40px rgba(10,25,47,0.4)',
          marginBottom: '32px'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#0A192F',
            padding: '4px 14px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            ⚓ भारतीय आरमाराचे जनक
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            मराठा आरमार व सागरी सार्वभौमत्व
          </h1>
          <p style={{ color: '#93C5FD', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 12px' }}>
            "ज्याचा समुद्र, त्याचा देश!" — छत्रपती शिवाजी महाराज (आज्ञापत्र)
          </p>
          <p style={{ color: '#E2E8F0', fontSize: '0.95rem', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
            पोर्तुगीज, डच, ब्रिटिश व सिद्दी या परकीय सागरी सत्तांचा धोका ओळखून छत्रपती शिवरायांनी स्वतंत्र जहाजांची निर्मिती, आरमारी किल्ले आणि कुशल कोळी-भंडारी मावळ्यांचे अजिंक्य आरमार उभे केले.
          </p>
        </div>

        {/* Navy Leaders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚓</div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#1E3A8A', margin: '0 0 6px' }}>
              सरखेल कान्होजी आंग्रे (१६६९–१७२९)
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#DD8A2E', fontWeight: 700, marginBottom: '10px' }}>
              मराठा आरमाराचे सर्वोच्च नौदल प्रमुख
            </div>
            <p style={{ color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
              ३० वर्षांच्या प्रदीर्घ कारकिर्दीत एकाही सागरी युद्धात पराभूत न झालेले अद्वितीय मराठा अॅडमिरल. ब्रिटिश, पोर्तुगीज व डचांच्या संयुक्त आक्रमणांना धूळ चारून त्यांनी कोकण किनारपट्टी अजिंक्य राखली.
            </p>
          </div>

          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E6DDCE', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗡️</div>
            <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#1E3A8A', margin: '0 0 6px' }}>
              मायनाक भंडारी व दर्यासारंग दौलत खान
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#DD8A2E', fontWeight: 700, marginBottom: '10px' }}>
              शिवकालीन पहिले आरमारी सेनापती
            </div>
            <p style={{ color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
              छत्रपती शिवरायांच्या विश्वासू नेतृत्वाखाली खांदेरी-उंदेरी बेटांवर ब्रिटिशांना रोखणारे मायनाक भंडारी आणि आरमाराची उभारणी करणारे दर्यासारंग दौलत खान यांनी मराठा आरमाराचा पाया रचला.
            </p>
          </div>
        </div>

        {/* Warships Section */}
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '30px', border: '1px solid #E6DDCE', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.5rem', color: '#1E3A8A', margin: '0 0 18px' }}>
            🚢 मराठा लढाऊ जहाजांचे प्रकार
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {SHIPS_DATA.map((s, i) => (
              <div key={i} style={{ background: '#F0F9FF', padding: '18px', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0369A1', marginBottom: '4px' }}>{s.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#C9701C', fontWeight: 700, marginBottom: '6px' }}>{s.type}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sea Forts */}
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '30px', border: '1px solid #E6DDCE' }}>
          <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.5rem', color: '#1E3A8A', margin: '0 0 18px' }}>
            🏰 ऐतिहासिक सागरी जलदुर्ग (Sea Forts)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {SEA_FORTS.map((f, i) => (
              <div key={i} style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{f.name}</span>
                  <span style={{ fontSize: '0.78rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>{f.place}</span>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
