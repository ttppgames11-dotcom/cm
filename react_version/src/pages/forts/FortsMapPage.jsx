import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const fortsList = [
  {
    id: 'raigad',
    name: 'दुर्गराज रायगड',
    district: 'रायगड',
    type: 'giridurg',
    isUnesco: true,
    height: '२,७०० फूट',
    desc: 'शिवराज्याभिषेक सोहळा, होळीचा माळ, नगारखाना व छत्रपती शिवरायांची पवित्र समाधी.',
    image: 'assets/images/real-raigad-panoramic.jpg',
    article: '/forts/raigad'
  },
  {
    id: 'pratapgad',
    name: 'किल्ले प्रतापगड',
    district: 'सातारा',
    type: 'giridurg',
    isUnesco: true,
    height: '३,५४० फूट',
    desc: 'अफझलखान वधाची ऐतिहासिक रणभूमी, भवानी माता मंदिर व बालेकिल्ला.',
    image: 'assets/images/real-pratapgad-fort.jpg',
    article: '/forts/pratapgad'
  },
  {
    id: 'sinhagad',
    name: 'किल्ले सिंहगड (कोंढाणा)',
    district: 'पुणे',
    type: 'giridurg',
    isUnesco: true,
    height: '४,३०० फूट',
    desc: 'नरवीर तानाजी मालुसरेंचे सर्वोच्च बलिदान, पुणे दरवाजा व देवटाके.',
    image: 'assets/images/real-sinhagad-fort.jpg',
    article: '/history/warriors'
  },
  {
    id: 'sindhudurg',
    name: 'किल्ले सिंधुदुर्ग',
    district: 'सिंधुदुर्ग',
    type: 'jaladurg',
    isUnesco: true,
    height: 'समुद्र पातळी',
    desc: 'मराठा आरमाराचा महादुर्ग, ५२ बुरुज, शिशाची जोडणी व शिवरायांचे एकमेव मंदिर.',
    image: 'assets/images/real-sindhudurg-fort.jpg',
    article: '/history/navy'
  },
  {
    id: 'panhala',
    name: 'किल्ले पन्हाळा',
    district: 'कोल्हापूर',
    type: 'giridurg',
    isUnesco: true,
    height: '२,७५६ फूट',
    desc: 'पावनखिंड मोहीम प्रारंभ, तीन दरवाजा, सज्जा कोठी व अंबरखाना.',
    image: 'assets/images/real-panhala-fort.jpg',
    article: '/forts/panhala-pavankhind'
  },
  {
    id: 'shivneri',
    name: 'किल्ले शिवनेरी',
    district: 'पुणे',
    type: 'giridurg',
    isUnesco: true,
    height: '३,५०० फूट',
    desc: 'छत्रपती शिवाजी महाराजांचे पवित्र जन्मस्थळ, शिवाई देवी मंदिर व बादशाही तलाव.',
    image: 'assets/images/real-raigad-panoramic.jpg',
    article: '/forts/shivneri'
  },
  {
    id: 'rajgad',
    name: 'किल्ले राजगड',
    district: 'पुणे',
    type: 'giridurg',
    isUnesco: true,
    height: '४,५१४ फूट',
    desc: '२५ वर्षे स्वराज्याची पहिली राजधानी, बालेकिल्ला, सुवेळा, संजीवनी व पद्मावती माची.',
    image: 'assets/images/real-raigad-bastions.jpg',
    article: '/forts/rajgad'
  },
  {
    id: 'torna',
    name: 'किल्ले तोरणा (प्रचंडगड)',
    district: 'पुणे',
    type: 'giridurg',
    isUnesco: false,
    height: '४,६०३ फूट',
    desc: 'शिवरायांनी वयाच्या १६ व्या वर्षी जिंकलेला स्वराज्याचा पहिला किल्ला.',
    image: 'assets/images/real-raigad-bastions.jpg',
    article: '/forts/torna'
  },
  {
    id: 'shaniwarwada',
    name: 'शनिवार वाडा (पुणे)',
    district: 'पुणे',
    type: 'bhuikot',
    isUnesco: false,
    height: 'भुईकोट',
    desc: 'बाजीराव पेशवे निर्मित मराठा साम्राज्याची मध्यवर्ती राजधानी, दिल्ली दरवाजा व हजारी कारंजे.',
    image: 'assets/images/real-shaniwar-wada.jpg',
    article: '/history/bajirao-peshwa'
  }
];

export default function FortsMapPage() {
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('all');

  const filteredForts = fortsList.filter(f => {
    const matchesType =
      activeType === 'all' ||
      (activeType === 'unesco' ? f.isUnesco : f.type === activeType);

    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.district.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* War Cry Banner */}
      <div className="war-cry-strip">
        <span className="flame-icon">🔥</span>
        <span>|| सह्याद्रीचे अभेद्य शिलेदार — महाराष्ट्रातील ३५०+ गड-किल्ले आमचा स्वाभिमान! ||</span>
        <span className="flame-icon">🔥</span>
      </div>

      {/* Hero Section */}
      <div className="hero" style={{ minHeight: '460px', position: 'relative', overflow: 'hidden' }}>
        <img
          src="assets/images/real-raigad-panoramic.jpg"
          alt="रायगड व सह्याद्री किल्ले"
          className="hero-bg-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        <div className="hero-overlay"></div>

        <div className="wrap hero-content" style={{ maxWidth: '1320px', width: '100%', padding: '40px 24px', position: 'relative', zIndex: 2 }}>
          <div>
            <div className="eyebrow">सह्याद्रीचे अभेद्य पाषाण · युनेस्को जागतिक वारसा नामांकन</div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: '#FFFFFF', margin: '10px 0' }}>
              महाराष्ट्रातील ३५०+ गड-किल्ले
            </h1>
            <div className="rule" style={{ background: 'var(--gold-500)', height: '4px', width: '80px', margin: '12px 0' }}></div>
            <p className="tagline" style={{ fontSize: '1.1rem', maxWidth: '60ch', color: '#FFF8F2', lineHeight: 1.6 }}>
              प्रत्येक किल्ला जपणारा प्रत्येक मावळा आमचा अभिमान! इतिहास, स्थापत्यशास्त्र, जलव्यवस्थापन आणि सुरक्षित ट्रेकिंगचे संपूर्ण डिजिटल दालन.
            </p>

            <div className="stats-glass" style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="stat-glass"><b>३५०+</b><span>अभ्यासित गडकोट</span></div>
              <div className="stat-glass"><b>३६</b><span>जिल्हे व्याप्ती</span></div>
              <div className="stat-glass"><b>१२</b><span>UNESCO नामांकित किल्ले</span></div>
              <div className="stat-glass"><b>४००+ वर्षे</b><span>अजिंक्य वारसा</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '36px 24px' }}>
        
        {/* Search & District Navigation Bar */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="search"
              placeholder="किल्ल्याचे नाव किंवा जिल्हा शोधा (उदा. रायगड, प्रतापगड, सिंहगड, सिंधुदुर्ग)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                fontSize: '1rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
          </div>

          <div style={{
            background: 'var(--paper-2)',
            padding: '18px 24px',
            borderRadius: '12px',
            border: '1px solid var(--line)'
          }}>
            <strong style={{ fontFamily: 'Baloo 2', fontSize: '1.05rem', color: 'var(--maroon-900)' }}>
              प्रशासकीय विभाग निहाय वर्गीकरण:
            </strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {['सर्व विभाग', 'पुणे विभाग (१२०+)', 'कोकण विभाग (८५+)', 'नाशिक विभाग (६५+)', 'छ. संभाजीनगर (४०+)', 'विदर्भ व नागपूर (२५+)'].map((d, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedDiv(d)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: selectedDiv === d ? 'var(--maroon-900)' : '#FFFFFF',
                    color: selectedDiv === d ? '#FFFFFF' : 'var(--ink)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--line)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { id: 'all', label: 'सर्व ३५०+ किल्ले' },
              { id: 'giridurg', label: '⛰️ गिरीदुर्ग (Hill Forts)' },
              { id: 'jaladurg', label: '🌊 जलदुर्ग (Sea Forts)' },
              { id: 'bhuikot', label: '🏰 भुईकोट (Plain Forts)' },
              { id: 'unesco', label: '⭐ युनेस्को नामांकित (UNESCO List)' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`tab ${activeType === t.id ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: '1px solid var(--line)',
                  background: activeType === t.id ? 'var(--maroon-900)' : '#FFFFFF',
                  color: activeType === t.id ? '#FFFFFF' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Fort Cards Grid */}
          <div className="grid grid-3" style={{ marginTop: '28px', gap: '24px' }}>
            {filteredForts.map(f => (
              <Link
                key={f.id}
                to={f.article}
                className="hd-feature-card"
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: 'var(--maroon-950)' }}>
                  <img
                    src={f.image}
                    alt={f.name}
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
                    {f.height} {f.isUnesco ? '· UNESCO' : ''}
                  </span>
                </div>
                <div style={{ padding: '20px' }}>
                  <strong style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', color: 'var(--maroon-950)', display: 'block', marginBottom: '4px' }}>
                    {f.name}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--saffron-700)', fontWeight: 700, marginBottom: '8px' }}>
                    📍 {f.district} जिल्हा
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                  <div style={{ marginTop: '14px', color: 'var(--maroon-900)', fontWeight: 700, fontSize: '0.85rem' }}>
                    किल्ल्याची माहिती व ट्रेकिंग गाईड →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
