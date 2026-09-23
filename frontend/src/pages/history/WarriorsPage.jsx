import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WARRIORS_DATA = [
  {
    id: 'tanaji',
    name: 'सुभेदार तानाजी मालुसरे',
    title: 'सिंहगडाचे अमर नायक · "गड आला पण सिंह गेला!"',
    role: 'सुभेदार व बालसखा',
    deed: 'कोंढाणा किल्ल्यावर रात्रीच्या अंधारात द्रोणागिरी कड्यावरून यशवंती घोरपडीच्या साहाय्याने चढाई करून मुघल किल्लेदार उदयभानचा पराभव केला आणि स्वतः धारातीर्थी पडले.',
    icon: '🛡️'
  },
  {
    id: 'bajiprabhu',
    name: 'वीर बाजी प्रभू देशपांडे व फुलाजी प्रभू',
    title: 'पावनखिंडीचे अमर संरक्षक · बांदल मावळे',
    role: 'सरनोबत व देशपांडे',
    deed: 'पन्हाळगडावरून विशाळगडाकडे कूच करताना घोडखिंडीत अवघ्या ३०० बांदल वीरांसह सिद्दी मसूदच्या ४,००० फौजेला तोफांचा आवाज ऐकू येईपर्यंत अडवून ठेवत सर्वोच्च बलिदान दिले.',
    icon: '🗡️'
  },
  {
    id: 'murarbaji',
    name: 'मुरारबाजी देशपांडे',
    title: 'पुरंदरचे सिंह · "मावळ्यांचा एकही पाय मागे हटणार नाही!"',
    role: 'पुरंदरचे किल्लेदार',
    deed: 'दिलेरखानाच्या प्रचंड मोगल फौजेने पुरंदरला वेढा घातला असता, अवघ्या ७०० मावळ्यांसह वज्रगडावरून दिलेरखानाच्या तळावर तुटून पडले आणि छातीवर वार झेलत धारातीर्थी पडले.',
    icon: '🏰'
  },
  {
    id: 'shivakashid',
    name: 'वीर शिवा काशिद (नाभिक)',
    title: 'शिवरायांचे प्रतिरूप · अमर बलिदान',
    role: 'विश्वासू अंगरक्षक',
    deed: 'पन्हाळगडाच्या वेढ्यात शिवरायांचे रूप घेऊन पालखीत बसले आणि शत्रूला भ्रमात ठेवत स्वतःचे प्राण स्वराज्यासाठी अर्पण केले, ज्यामुळे शिवरायांना निसटण्याची संधी मिळाली.',
    icon: '👑'
  },
  {
    id: 'firangoji',
    name: 'फिरंगोजी नरसाळा',
    title: 'चाकणच्या संग्रामदुर्गाचे झुंजार किल्लेदार',
    role: 'किल्लेदार',
    deed: 'शाइस्तेखानाच्या लाखो फौजेविरुद्ध चाकणच्या भुईकोट किल्ल्यात अवघ्या ३०० जवानांसह तब्बल ५६ दिवस झुंज दिली. त्यांच्या शौर्याने मोगलही थक्क झाले.',
    icon: '🛡️'
  },
  {
    id: 'hambirrao',
    name: 'हंबीरराव मोहिते',
    title: 'स्वराज्याचे सरसेनापती · शंभूराजांचे खंदे पाठीराखे',
    role: 'सरसेनापती',
    deed: 'छत्रपती शिवाजी महाराज व संभाजी महाराज या दोन्ही छत्रपतींच्या काळात अनेक महत्त्वाच्या मोहिमांचे यशस्वी नेतृत्व केले. वाईच्या लढाईत तोफगोळा लागून वीरमरण आले.',
    icon: '⚔️'
  },
  {
    id: 'santaji-dhanaji',
    name: 'संताजी घोरपडे व धनाजी जाधव',
    title: 'मोगल फौजेचे कर्दनकाळ · "पाण्यात संताजी-धनाजी दिसतात!"',
    role: 'मराठा सरसेनापती',
    deed: 'छत्रपती राजाराम महाराजांच्या काळात मराठा स्वातंत्र्यसंग्रामात औरंगजेबाच्या प्रचंड मोगल सैन्याला सळो की पळो करून सोडणारे अद्वितीय गनिमी सेनापती.',
    icon: '🐎'
  },
  {
    id: 'kanhoji-angre',
    name: 'सरखेल कान्होजी आंग्रे',
    title: 'भारतीय आरमाराचे अजिंक्य सेनापती',
    role: 'आरमार प्रमुख',
    deed: 'ब्रिटिश, डच, पोर्तुगीज आणि सिद्दी या सर्व सागरी सत्तांना आव्हान देत अरबी समुद्रावर ३० वर्षांहून अधिक काळ निर्विवाद मराठा सत्ता प्रस्थापित केली.',
    icon: '⚓'
  }
];

export default function WarriorsPage() {
  const [search, setSearch] = useState('');

  const filtered = WARRIORS_DATA.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.deed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '40px 32px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)',
          marginBottom: '32px'
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
            🚩 स्वराज्याचे अमर वीर शिलेदार
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            स्वराज्याचे अमर वीर व वीरांगना
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
            तानाजी, बाजीप्रभू, मुरारबाजी, शिवा काशिद, हंबीरराव, संताजी-धनाजी आणि लाखो निष्ठावंत मावळे — ज्यांच्या रक्ताने हिंदवी स्वराज्याची इमारत उभी राहिली.
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 वीरांचे नाव किंवा पराक्रम शोधा (उदा. तानाजी, बाजीप्रभू, कान्होजी)..."
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '2px solid #DD8A2E',
              fontSize: '1rem',
              outline: 'none',
              background: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Warriors Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
          {filtered.map(w => (
            <div
              key={w.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E6DDCE',
                boxShadow: '0 6px 20px rgba(199,56,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '32px' }}>{w.icon}</span>
                  <div>
                    <h3 style={{
                      fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#3D0D0D',
                      margin: 0
                    }}>
                      {w.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#DD8A2E', fontWeight: 700 }}>
                      {w.role}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#FDF3E6',
                  color: '#7A1C1C',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '12px'
                }}>
                  {w.title}
                </div>

                <p style={{ fontSize: '0.88rem', color: '#5C534B', lineHeight: 1.55, margin: 0 }}>
                  {w.deed}
                </p>
              </div>

              <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #E6DDCE' }}>
                <Link
                  to={`/article/${w.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '9px 12px',
                    background: '#5C1414',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    textDecoration: 'none'
                  }}>
                  सविस्तर शौर्यगाथा वाचा →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
