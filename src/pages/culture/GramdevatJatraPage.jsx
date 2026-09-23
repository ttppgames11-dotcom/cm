import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GRAMDEVAT_TEMPLES_DATA, 
  FOLK_TRADITIONS_DATA, 
  SOURCE_TIERS, 
  CONFIDENCE_LEVELS 
} from '../../data/heritageKnowledgeGraph';

export default function GramdevatJatraPage() {
  const [activeTab, setActiveTab] = useState('gramdevat'); // 'gramdevat' | 'jatra' | 'natya' | 'khel'
  const [selectedDeityId, setSelectedDeityId] = useState(GRAMDEVAT_TEMPLES_DATA[0].id);

  const activeDeity = GRAMDEVAT_TEMPLES_DATA.find(d => d.id === selectedDeityId) || GRAMDEVAT_TEMPLES_DATA[0];

  const natyaList = FOLK_TRADITIONS_DATA.filter(f => f.category.includes('नाट्य') || f.category.includes('लोकसंगीत') || f.category.includes('प्रबोधन'));
  const khelList = FOLK_TRADITIONS_DATA.filter(f => f.category.includes('खेळ'));

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 60%, #E65100 100%)',
        color: '#FFFFFF',
        padding: '48px 20px 36px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <span>🛕 CONNECT MARATHA</span>
            <span>•</span>
            <span>ग्रामदैवत, जत्रा व लोकसंस्कृती</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            ग्रामदैवत, जत्रा, नाट्य व पारंपरिक खेळ
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            महाराष्ट्राच्या गावागावातील जिवंत संस्कृती: ग्रामदैवतांची उत्पत्ती आख्यायिका, वार्षिक जत्रा-उत्सव, 
            दशावतार-तमाशा-पोवाडा नाट्यपरंपरा आणि विटी-दांडू, लगोरीसारखे पारंपरिक देशी खेळ.
          </p>

          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('gramdevat')}
              style={{
                background: activeTab === 'gramdevat' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'gramdevat' ? '#B91C1C' : '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              🛕 ग्रामदैवत व कुलदैवत
            </button>
            <button
              onClick={() => setActiveTab('jatra')}
              style={{
                background: activeTab === 'jatra' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'jatra' ? '#B91C1C' : '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              🎪 जत्रा व उत्सव दिनदर्शिका
            </button>
            <button
              onClick={() => setActiveTab('natya')}
              style={{
                background: activeTab === 'natya' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'natya' ? '#B91C1C' : '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              🎭 नाट्य, तमाशा व दशावतार
            </button>
            <button
              onClick={() => setActiveTab('khel')}
              style={{
                background: activeTab === 'khel' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'khel' ? '#B91C1C' : '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              🏏 पारंपरिक देशी खेळ
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>

        {/* TAB 1: GRAMDEVAT (VILLAGE DEITIES & KNOWLEDGE CARD) */}
        {activeTab === 'gramdevat' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                विभाग १ • ग्रामदैवत ज्ञान कार्ड
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800 }}>
                महाराष्ट्राची ग्रामदैवते व स्वराज्य अधिष्ठात्री
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
                गावागावातील श्रद्धास्थाने, मूळ आख्यायिका, संबंधित घराणी, वार्षिक यात्रा आणि जवळील किल्ले.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(420px, 2fr)', gap: '28px', alignItems: 'flex-start' }}>
              
              {/* Left Column: Deity Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {GRAMDEVAT_TEMPLES_DATA.map(d => {
                  const isSelected = d.id === selectedDeityId;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDeityId(d.id)}
                      style={{
                        background: isSelected ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : '#FFFFFF',
                        border: isSelected ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                        borderRadius: '14px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.05rem', color: isSelected ? '#78350F' : '#1F2937', fontWeight: 800, margin: 0 }}>
                          🛕 {d.name}
                        </h4>
                        <span style={{ fontSize: '0.72rem', background: '#FEE2E2', color: '#B91C1C', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          {d.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '4px' }}>
                        📍 {d.location}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: d.sourceRef.confidence.color, fontWeight: 700 }}>
                        {d.sourceRef.confidence.icon} {d.sourceRef.confidence.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Active Deity Knowledge Card (Full Schema) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #F3E8D8',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(90deg, #7C1D05 0%, #B91C1C 100%)',
                  color: '#FFFFFF',
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {activeDeity.type}
                    </span>
                    <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '8px 0 4px' }}>
                      {activeDeity.name}
                    </h2>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                      📍 {activeDeity.location} • {activeDeity.region}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      background: activeDeity.sourceRef.confidence.bg,
                      color: activeDeity.sourceRef.confidence.color,
                      border: `1px solid ${activeDeity.sourceRef.confidence.color}`,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {activeDeity.sourceRef.confidence.icon} {activeDeity.sourceRef.confidence.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#FCD34D' }}>
                      {activeDeity.sourceRef.tier.badge}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Origin Story / आख्यायिका */}
                  <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#78350F', fontWeight: 800, marginBottom: '6px' }}>
                      📜 उत्पत्ती कथा व स्थानिक आख्यायिका:
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#92400E', lineHeight: 1.6, margin: 0 }}>
                      {activeDeity.deityOriginStory}
                    </p>
                  </div>

                  {/* Attributes Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>👑 संबंधित राजवंश / कालखंड:</span>
                      <div style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700, marginTop: '2px' }}>
                        {activeDeity.associatedDynasty} ({activeDeity.historicalPeriod})
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>🏛️ स्थापत्यशैली:</span>
                      <div style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700, marginTop: '2px' }}>
                        {activeDeity.architectureStyle}
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>👥 संबंधित कुळ व समाज:</span>
                      <div style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700, marginTop: '2px' }}>
                        {activeDeity.clanCommunityAssociation}
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>🗓️ वार्षिक जत्रा / उत्सव:</span>
                      <div style={{ fontSize: '0.88rem', color: '#B91C1C', fontWeight: 800, marginTop: '2px' }}>
                        {activeDeity.annualJatraDate}
                      </div>
                    </div>
                  </div>

                  {/* Jatra Rituals (यात्रा विधी) */}
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#7C1D05', fontWeight: 800, marginBottom: '8px' }}>
                      🎉 वार्षिक यात्रा विधी व लोकपरंपरा:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeDeity.jatraRituals.map((r, i) => (
                        <span key={i} style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                          🚩 {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connected Forts & Food (Connect Everything) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>🏰 जवळील किल्ला / दुर्ग:</div>
                      <div style={{ fontSize: '0.9rem', color: '#14532D', fontWeight: 800, marginTop: '2px' }}>
                        {activeDeity.connectedFort}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>🍲 संबंधित स्थानिक प्रसाद / खाद्य:</div>
                      <div style={{ fontSize: '0.9rem', color: '#14532D', fontWeight: 800, marginTop: '2px' }}>
                        {activeDeity.connectedFood}
                      </div>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', fontSize: '0.8rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong>संदर्भ:</strong> {activeDeity.sourceRef.source}
                    </div>
                    <Link to="/culture/heritage-map" style={{ color: '#B91C1C', fontWeight: 700 }}>
                      🗺️ नकाशावर स्थान पहा →
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JATRA CALENDAR (यात्रा व उत्सव) */}
        {activeTab === 'jatra' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                विभाग २ • जत्रा व वार्षिक यात्रा दिनदर्शिका
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800 }}>
                महाराष्ट्रातील प्रमुख जत्रा, पालखी व लोकोत्सव
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
                जत्रा म्हणजे केवळ धार्मिक विधी नव्हे, तर ग्रामीण अर्थव्यवस्था, लोककला, खेळ आणि सांस्कृतिक संमेलनाचा महासोहळा.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {GRAMDEVAT_TEMPLES_DATA.map(j => (
                <div key={j.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F3E8D8', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                      🎪 {j.name} यात्रा
                    </h3>
                    <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {j.region}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#B91C1C', fontWeight: 800, marginBottom: '8px' }}>
                    🗓️ कालावधी: {j.annualJatraDate}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '12px' }}>
                    <strong>प्रमुख विधी:</strong> {j.jatraRituals.join(' • ')}
                  </div>

                  <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', color: '#374151', marginBottom: '14px' }}>
                    <div>🍲 <strong>विशेष यात्रा खाद्य:</strong> {j.connectedFood}</div>
                    <div style={{ marginTop: '4px' }}>🏰 <strong>जवळील दुर्ग:</strong> {j.connectedFort}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px', fontSize: '0.78rem' }}>
                    <span style={{ color: j.sourceRef.confidence.color, fontWeight: 700 }}>
                      {j.sourceRef.confidence.icon} {j.sourceRef.confidence.label}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDeityId(j.id);
                        setActiveTab('gramdevat');
                      }}
                      style={{ background: 'none', border: 'none', color: '#B91C1C', fontWeight: 700, cursor: 'pointer' }}
                    >
                      सविस्तर देवस्थान प्रोफाइल →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NATYA & THEATRE (दशावतार, तमाशा, लावणी, पोवाडा) */}
        {activeTab === 'natya' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                विभाग ३ • नाट्य व लोककला परंपरा
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800 }}>
                महाराष्ट्राचे लोकनाट्य, दशावतार व पोवाडा परंपरा
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
                जत्रांच्या मैदानात रात्रभर रंगणारा दशावतार, रणांगणावर वीरश्री फुंकणारा पोवाडा आणि महाराष्ट्राचे लोकनाट्य तमाशा.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {natyaList.map(n => (
                <div key={n.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F3E8D8', padding: '26px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {n.category}
                      </span>
                      <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', fontWeight: 800, margin: '6px 0 2px' }}>
                        🎭 {n.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                        प्रदेश: <strong>{n.region}</strong>
                      </div>
                    </div>

                    <span style={{
                      background: n.sourceRef.confidence.bg,
                      color: n.sourceRef.confidence.color,
                      border: `1px solid ${n.sourceRef.confidence.color}`,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {n.sourceRef.confidence.icon} {n.sourceRef.confidence.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
                    <div style={{ background: '#F9FAFB', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700 }}>📜 ऐतिहासिक मुळे (Roots):</div>
                      <div style={{ fontSize: '0.88rem', color: '#1F2937', lineHeight: 1.5, marginTop: '2px' }}>
                        {n.historicalRoots}
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700 }}>🎪 सादरीकरणाचा प्रसंग:</div>
                      <div style={{ fontSize: '0.88rem', color: '#1F2937', lineHeight: 1.5, marginTop: '2px' }}>
                        {n.performanceOccasion}
                      </div>
                    </div>
                  </div>

                  {/* Elements */}
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4B5563' }}>मुख्य घटक व वाद्ये: </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {n.elements.map((el, i) => (
                        <span key={i} style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          ✓ {el}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: 600, background: '#F0FDF4', padding: '10px 14px', borderRadius: '8px' }}>
                    🌟 <strong>आजची स्थिती:</strong> {n.modernStatus}
                  </div>

                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', marginTop: '14px', fontSize: '0.78rem', color: '#9CA3AF' }}>
                    स्रोत: {n.sourceRef.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: KHEL (TRADITIONAL FOLK GAMES) */}
        {activeTab === 'khel' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                विभाग ४ • पारंपरिक देशी खेळ (Traditional Folk Games)
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800 }}>
                महाराष्ट्राचे पारंपरिक मैदानी व देशी खेळ
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
                विटी-दांडू, लगोरी, खो-खो व सूरपारंब्या—गावागावांतील बालपण, शारीरिक चपळता आणि सणांच्या उत्सवाशी जोडलेली क्रीडा संपदा.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {khelList.map(k => (
                <div key={k.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #F3E8D8', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                      🏏 {k.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {k.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '10px' }}>
                    {k.historicalRoots}
                  </div>

                  <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FEF3C7', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 700 }}>खेळण्याची पद्धत व साधने:</div>
                    <div style={{ fontSize: '0.85rem', color: '#78350F', marginTop: '2px' }}>
                      {k.elements.join(' • ')}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '12px' }}>
                    📍 <strong>प्रसंग:</strong> {k.performanceOccasion}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#166534', background: '#F0FDF4', padding: '8px 12px', borderRadius: '8px', fontWeight: 600 }}>
                    🏆 {k.modernStatus}
                  </div>

                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '10px', marginTop: '12px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                    संदर्भ: {k.sourceRef.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
