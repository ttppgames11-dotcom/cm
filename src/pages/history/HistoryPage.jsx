import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const historicalFigures = [
  {
    id: 'shivaji',
    name: 'छत्रपती शिवाजी महाराज',
    category: 'chhatrapati',
    badge: 'हिंदवी स्वराज्य संस्थापक',
    desc: 'रयतेचे राजे, भारतीय आरमाराचे जनक, ३५०+ गड-किल्ले व अष्टप्रधान मंडळ रचनाकार.',
    link: '/history/shivaji-maharaj',
    image: 'https://wallpapercave.com/wp/wp4518353.jpg'
  },
  {
    id: 'sambhaji',
    name: 'छत्रपती संभाजी महाराज',
    category: 'chhatrapati',
    badge: 'अपराजित १२८ लढाया',
    desc: '१२८ लढायांमध्ये अजिंक्य, बुधभूषणम् संस्कृत ग्रंथकार व धर्मरक्षणासाठी सर्वोच्च बलिदान.',
    link: '/history/sambhaji-maharaj',
    image: 'assets/images/real-sambhaji-portrait.png'
  },
  {
    id: 'jijau',
    name: 'राष्ट्रमाता राजमाता जिजाऊ',
    category: 'virangana',
    badge: 'स्वराज्य प्रेरिका व मार्गदर्शक',
    desc: 'शिवरायांना घडवणाऱ्या, रयतेचा न्यायनिवाडा करणाऱ्या आणि स्वराज्याची संकल्पना रुजवणारे मातृत्व.',
    link: '/history/rajmata-jijau',
    image: 'assets/images/real-jijau-portrait.jpg'
  },
  {
    id: 'bajirao',
    name: 'श्रीमंत थोरले बाजीराव पेशवा',
    category: 'peshwa',
    badge: '४१ लढाया, ० पराभव',
    desc: 'पालखेड, भोपाळ, दिल्ली छापा आणि माळवा-बुंदेलखंड विजय; शनिवार वाड्याचे निर्माते.',
    link: '/history/bajirao-peshwa',
    image: 'assets/images/real-bajirao-statue.jpg'
  },
  {
    id: 'tarabai',
    name: 'महाराणी ताराबाई भोसले',
    category: 'virangana',
    badge: 'मोगल साम्राज्य धडक',
    desc: 'औरंगजेबाच्या मृत्यूपर्यंत मराठा स्वातंत्र्ययुद्ध चालवून मोगल फौजांना महाराष्ट्राच्या मातीत गाडणाऱ्या रणरागिणी.',
    link: '/history/tarabai',
    image: 'assets/images/real-tarabai-portrait.jpg'
  },
  {
    id: 'tanaji',
    name: 'सुभेदार तानाजी मालुसरे',
    category: 'yodha',
    badge: 'सिंहगडाचा सिंह',
    desc: 'कोंढाणा पुनर्जय मोहीम — "आधी लगीन कोंढाण्याचं, मग माझ्या रायबाचं!" अमर बाणा.',
    link: '/history/warriors',
    image: 'assets/images/real-sinhagad-fort.jpg'
  },
  {
    id: 'bajiprabhu',
    name: 'वीर बाजी प्रभू देशपांडे',
    category: 'yodha',
    badge: 'पावनखिंड संग्राम',
    desc: 'घोडखिंडीतील अभेद्य ढाल — तोफांचे तीन आवाज होईपर्यंत सिद्धी मसूदच्या अफाट सेनेला रोखून धरले.',
    link: '/history/warriors',
    image: 'assets/images/real-panhala-fort.jpg'
  },
  {
    id: 'shahu',
    name: 'छत्रपती शाहू महाराज (थोरले)',
    category: 'chhatrapati',
    badge: 'साम्राज्य विस्तार पर्व',
    desc: 'मराठा सत्तेचा संपूर्ण हिंदुस्थानभर विस्तार करणारे मुत्सद्दी छत्रपती.',
    link: '/history/shahu-maharaj',
    image: 'assets/images/real-maratha-expansion-map.jpg'
  }
];

const timelineEvents = [
  { year: '१९ फेब्रुवारी १६३०', event: 'छत्रपती शिवाजी महाराजांचा किल्ले शिवनेरीवर जन्म' },
  { year: '१६४६', event: 'वयाच्या १६ व्या वर्षी तोरणा किल्ला जिंकून हिंदवी स्वराज्याची तोरणे बांधली' },
  { year: '१० नोव्हेंबर १६५९', event: 'प्रतापगड युद्ध — अफझलखानाचा वध व विजापूर सैन्याचा पराभव' },
  { year: '१३ जुलै १६६०', event: 'पावनखिंड युद्ध — बाजी प्रभू देशपांडे व बांदल मावळ्यांचे शौर्य' },
  { year: '६ जून १६७४', event: 'दुर्गराज रायगडावर ऐतिहासिक वैदिक शिवराज्याभिषेक सोहळा' },
  { year: '१६८१–१६८९', event: 'छत्रपती संभाजी महाराजांचे पराक्रमी राज्य व मोगलांविरुद्ध अखंड संघर्ष' },
  { year: '१७२८', event: 'पालखेडची लढाई — बाजीराव पेशव्यांची जागतिक युद्धशास्त्रातील आदर्श रणनीती' },
  { year: '१७५८', event: 'अटकेपार मराठा ध्वज — रघुनाथराव पेशवे व तुकोजी होळकरांचा पंजाब व लाहोर विजय' },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');

  const filteredFigures = filter === 'all'
    ? historicalFigures
    : historicalFigures.filter(f => f.category === filter);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* War Cry Strip */}
      <div className="war-cry-strip">
        <span className="flame-icon">🔥</span>
        <span>|| गर्जा महाराष्ट्र माझा! सह्याद्रीच्या काळजातून उमटलेली अखंड स्वाभिमानाची अमर गाथा! ||</span>
        <span className="flame-icon">🔥</span>
      </div>

      {/* Hero Section */}
      <div className="hero" style={{ minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-samrajya.jpg"
          alt="मराठा साम्राज्य"
          className="hero-bg-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        <div className="hero-overlay" style={{ background: 'radial-gradient(circle at 75% 35%, rgba(230,81,0,0.55), rgba(12,2,4,0.92) 80%)' }}></div>

        <div className="wrap hero-content" style={{ maxWidth: '1320px', width: '100%', padding: '50px 24px', position: 'relative', zIndex: 2 }}>
          <div className="hero-website-grid">
            <div>
              <div className="eyebrow">अखंड शौर्याची गौरवगाथा · १६३० ते १८१८</div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', lineHeight: 1.12, color: '#FFFFFF', margin: '12px 0' }}>
                मराठा इतिहास महाग्रंथालय
              </h1>
              <div className="rule" style={{ background: 'var(--gold-500)', height: '4px', width: '80px', margin: '12px 0' }}></div>
              <p className="tagline" style={{ fontSize: '1.1rem', maxWidth: '54ch', color: '#FFF8F2', lineHeight: 1.6 }}>
                स्वराज्य, संस्कृती, युद्धनीती आणि अद्वितीय सुशासन — अस्सल ऐतिहासिक साधनांवर आधारित मराठा साम्राज्याचा देदीप्यमान इतिहास.
              </p>

              <div className="stats-glass" style={{ marginTop: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="stat-glass"><b>१८८</b><span>वर्षांचे देदीप्यमान साम्राज्य</span></div>
                <div className="stat-glass"><b>३५०+</b><span>अभ्यासित गड-किल्ले</span></div>
                <div className="stat-glass"><b>१००+</b><span>निर्णायक लढाया</span></div>
                <div className="stat-glass"><b>अटकेपार</b><span>विस्तारित भगवा ध्वज</span></div>
              </div>
            </div>

            <div className="hero-real-card" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '24px' }}>
                <span className="card-badge" style={{ background: '#C73800', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  🚩 हिंदवी स्वराज्य
                </span>
                <h4 style={{ color: '#FFFFFF', margin: '14px 0 8px', fontSize: '1.25rem', fontFamily: 'Baloo 2' }}>
                  छत्रपती शिवाजी महाराज — अखंड स्वराज्य
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  ६ जून १६७४ रोजी दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला ऐतिहासिक वैदिक राज्याभिषेक व स्वतंत्र सार्वभौम मराठा साम्राज्याची स्थापना.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <Link to="/history/shivaji-maharaj" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    सविस्तर शिवचरित्र वाचा →
                  </Link>
                  <Link to="/forts" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF', padding: '8px 16px', fontSize: '0.85rem' }}>
                    ३५०+ गड-किल्ले नकाशा 🏰
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '40px 24px' }}>
        
        {/* Sacred Shivrajmudra */}
        <section style={{ marginBottom: '40px' }}>
          <div className="rajmudra-container" style={{
            background: 'linear-gradient(135deg, #FFF8F2, #FFF3E8)',
            border: '2px solid var(--gold-500)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="rajmudra-verse" style={{
              fontFamily: 'Baloo 2',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--maroon-950)',
              lineHeight: 1.6,
              marginBottom: '12px'
            }}>
              " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।<br/>
              शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
            </div>
            <div className="rajmudra-meaning" style={{
              fontSize: '1.05rem',
              color: 'var(--saffron-700)',
              fontWeight: 600,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा लोककल्याणासाठी तळपते आहे!
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {[
              { id: 'all', label: 'सर्व युगपुरुष व नेते' },
              { id: 'chhatrapati', label: '👑 छत्रपती घराणे' },
              { id: 'peshwa', label: '🐎 पेशवे व सेनापती' },
              { id: 'virangana', label: '🛡️ वीरांगना' },
              { id: 'yodha', label: '⚔️ अमर शिलेदार' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`tab ${filter === tab.id ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: '1px solid var(--line)',
                  background: filter === tab.id ? 'var(--maroon-900)' : '#FFFFFF',
                  color: filter === tab.id ? '#FFFFFF' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-3" style={{ marginTop: '30px', gap: '24px' }}>
            {filteredFigures.map(fig => (
              <Link
                key={fig.id}
                to={fig.link}
                className="hd-feature-card"
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: 'var(--maroon-950)' }}>
                  <img
                    src={fig.image}
                    alt={fig.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'assets/images/real-raigad-panoramic.jpg'; }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'var(--maroon-900)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}>
                    {fig.badge}
                  </span>
                </div>
                <div style={{ padding: '20px' }}>
                  <strong style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', color: 'var(--maroon-950)', display: 'block', marginBottom: '8px' }}>
                    {fig.name}
                  </strong>
                  <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {fig.desc}
                  </div>
                  <div style={{ marginTop: '14px', color: 'var(--saffron-700)', fontWeight: 700, fontSize: '0.85rem' }}>
                    सविस्तर चरित्र वाचा →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Timeline of Empire */}
        <section style={{ marginTop: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: 'var(--saffron-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              CHRONOLOGY OF GLORY
            </span>
            <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
              मराठा साम्राज्याचा सुवर्ण कालपट (१६३०–१८१८)
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {timelineEvents.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    background: idx % 2 === 0 ? 'var(--paper-2)' : '#FFFFFF',
                    borderLeft: '4px solid var(--saffron-500)'
                  }}
                >
                  <div style={{ width: '180px', flexShrink: 0, fontWeight: 800, color: 'var(--maroon-900)', fontFamily: 'Baloo 2', fontSize: '1.05rem' }}>
                    {t.year}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
                    {t.event}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
