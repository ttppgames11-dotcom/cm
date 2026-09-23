import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  KNOWLEDGE_GRAPH_EVENTS, 
  SOURCE_TIERS, 
  CONFIDENCE_LEVELS 
} from '../../data/heritageKnowledgeGraph';

export default function KnowledgeGraphExplorerPage() {
  const [selectedEventId, setSelectedEventId] = useState(KNOWLEDGE_GRAPH_EVENTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEpochFilter, setActiveEpochFilter] = useState('all');

  const filteredEvents = KNOWLEDGE_GRAPH_EVENTS.filter(ev => {
    const matchesSearch = searchQuery === '' || 
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.primaryLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEpoch = activeEpochFilter === 'all' || ev.historicalEpoch.includes(activeEpochFilter);
    return matchesSearch && matchesEpoch;
  });

  const activeEvent = KNOWLEDGE_GRAPH_EVENTS.find(e => e.id === selectedEventId) || KNOWLEDGE_GRAPH_EVENTS[0];

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
            <span>⚡ CONNECT MARATHA</span>
            <span>•</span>
            <span>इतिहास नॉलेज ग्राफ (Historical Knowledge Graph)</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            घटना शोधा ↔ इतिहास संबंध आलेख (Knowledge Graph)
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            इतिहासातील एका घटनेपासून ते आजची ठिकाणे, गड-किल्ले, मंदिरे, दस्तऐवज, स्थानिक खाद्यसंस्कृती 
            आणि प्रत्यक्ष पर्यटन मार्गापर्यंत—सर्व काही एकमेकांशी जोडलेले!
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px' }}>
              📜 दस्तऐवज: जेधे शकावली, सबासदाची बखर, शिवभारत
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px' }}>
              🏛️ पुरातत्त्व: ASI, UNESCO व राज्य पुराभिलेख संदर्भ
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* Search & Timeline Filter */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '22px',
          marginBottom: '28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="⚡ ऐतिहासिक घटना, व्यक्ती किंवा ठिकाण शोधा (उदा. राज्याभिषेक, पन्हाळा, वेरूळ, बाजीप्रभू)..."
              style={{
                flex: '1',
                minWidth: '280px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Historical Epoch Filter Tabs */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginBottom: '8px' }}>
              ऐतिहासिक कालखंड निवडा (Historical Epoch):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'all', label: 'सर्व कालखंड' },
                { id: 'स्वराज्य', label: 'मराठा स्वराज्य कालखंड (१७ वे शतक)' },
                { id: 'राष्ट्रकूट', label: 'प्राचीन व मध्ययुगीन (राष्ट्रकूट/यादव)' },
                { id: 'पेशवे', label: 'मराठा साम्राज्य व पेशवे काळ (१८ वे शतक)' }
              ].map(epoch => (
                <button
                  key={epoch.id}
                  onClick={() => setActiveEpochFilter(epoch.id)}
                  style={{
                    background: activeEpochFilter === epoch.id ? '#B91C1C' : '#F9FAFB',
                    color: activeEpochFilter === epoch.id ? '#FFFFFF' : '#374151',
                    border: activeEpochFilter === epoch.id ? '1px solid #7C1D05' : '1px solid #E5E7EB',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {epoch.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column: Event Selector List + Complete Graph Explorer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(440px, 2fr)', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Events Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 700, padding: '0 4px' }}>
              उपलब्ध ऐतिहासिक घटनांची नोंद ({filteredEvents.length}):
            </div>

            {filteredEvents.map(ev => {
              const isSelected = ev.id === selectedEventId;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : '#FFFFFF',
                    border: isSelected ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(245,158,11,0.2)' : '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.15rem', color: isSelected ? '#78350F' : '#1F2937', fontWeight: 800, margin: 0 }}>
                      🚩 {ev.title}
                    </h3>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#B91C1C', fontWeight: 700, marginBottom: '6px' }}>
                    📅 {ev.date}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.4, marginBottom: '10px' }}>
                    {ev.summary}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ color: ev.confidence.color, fontWeight: 700 }}>
                      {ev.confidence.icon} {ev.confidence.label}
                    </span>
                    <span style={{ color: '#78350F', fontWeight: 700 }}>
                      आलेख पहा →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interconnected Knowledge Graph View */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #F3E8D8',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
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
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {activeEvent.historicalEpoch}
                </span>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '8px 0 4px' }}>
                  {activeEvent.title}
                </h2>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  📅 <strong>दिनांक:</strong> {activeEvent.date} • 📍 <strong>मुख्य स्थान:</strong> {activeEvent.primaryLocation}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  background: activeEvent.confidence.bg,
                  color: activeEvent.confidence.color,
                  border: `1px solid ${activeEvent.confidence.color}`,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {activeEvent.confidence.icon} {activeEvent.confidence.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#FCD34D' }}>
                  {activeEvent.sourceRef.tier.badge}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                ऐतिहासिक महत्त्व व परिणाम:
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#1F2937', lineHeight: 1.6, margin: 0 }}>
                {activeEvent.summary}
              </p>
            </div>

            {/* Relational Entity Nodes (The Knowledge Graph Branches) */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Branch 1: Connected People (संबंधित ऐतिहासिक व्यक्ती) */}
              <div>
                <h4 style={{ fontSize: '1rem', color: '#7C1D05', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👑</span> संबंधित व्यक्ती (Connected Personalities):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {activeEvent.connectedEntities.people.map((p, i) => (
                    <div key={i} style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                      <div style={{ fontWeight: 800, color: '#78350F', fontSize: '0.92rem' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#92400E', marginTop: '2px' }}>
                        भूमिका: {p.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch 2: Connected Places (संबंधित किल्ले, मंदिरे व स्थळे) */}
              <div>
                <h4 style={{ fontSize: '1rem', color: '#7C1D05', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏰</span> संबंधित ऐतिहासिक स्थळे व मंदिरे (Places & Forts):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {activeEvent.connectedEntities.places.map((pl, i) => (
                    <div key={i} style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.92rem' }}>
                        📍 {pl.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                        {pl.type} ({pl.district})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch 3: Artifacts, Coins & Symbols */}
              {activeEvent.connectedEntities.artifactsAndSymbols && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#7C1D05', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏷️</span> दस्तऐवज, नाणी व चिन्हे (Artifacts & Documents):
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {activeEvent.connectedEntities.artifactsAndSymbols.map((item, i) => (
                      <span key={i} style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: '4px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                        🪙 {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Branch 4: Connected Food & Tourism Route (Connect Everything in action!) */}
              <div style={{ background: '#F0FDF4', padding: '18px', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🚗</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#166534', fontWeight: 800, margin: 0 }}>
                    या घटनेशी जोडलेला आजचा प्रत्यक्ष पर्यटन व खाद्य मार्ग:
                  </h4>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#14532D', lineHeight: 1.5, marginBottom: '10px' }}>
                  <strong>सुचवलेला मार्ग:</strong> {activeEvent.connectedEntities.heritageRoute.join(' → ')}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700 }}>स्थानिक खाद्य:</span>
                  {activeEvent.connectedEntities.localCuisine.map((c, i) => (
                    <span key={i} style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                      🍲 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Branch 5: References (Source Attribution) */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '14px', fontSize: '0.82rem', color: '#4B5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong>अधिकृत दस्तऐवज संदर्भ:</strong> {activeEvent.sourceRef.source}
                </div>
                <Link to="/culture/heritage-map" style={{ color: '#B91C1C', fontWeight: 700 }}>
                  🗺️ नकाशावर सर्व संबंधित ठिकाणे पहा →
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
