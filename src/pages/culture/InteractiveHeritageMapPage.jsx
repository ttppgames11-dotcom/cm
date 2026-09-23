import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MAP_LAYERS, 
  MAP_PINS, 
  REGIONS_DATA, 
  SOURCE_TIERS, 
  CONFIDENCE_LEVELS 
} from '../../data/heritageKnowledgeGraph';

export default function InteractiveHeritageMapPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePin, setActivePin] = useState(MAP_PINS[0]);

  // Filtering pins
  const filteredPins = MAP_PINS.filter(pin => {
    const matchesCategory = selectedCategory === 'all' || pin.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || pin.region.includes(selectedRegion);
    const matchesSearch = searchQuery === '' || 
      pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.significance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRegion && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 60%, #E65100 100%)',
        color: '#FFFFFF',
        padding: '44px 20px 32px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '12px' }}>
            <span>🗺️ CONNECT MARATHA</span>
            <span>•</span>
            <span>महाराष्ट्र परस्परसंवादी वारसा नकाशा</span>
          </div>

          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '10px', lineHeight: 1.2 }}>
            महाराष्ट्र वारसा व सांस्कृतिक नकाशा (Heritage Map)
          </h1>
          <p style={{ fontSize: '1.05rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '16px' }}>
            किल्ले, प्राचीन लेणी, मंदिरे, ग्रामदैवते, युनेस्को जागतिक वारसास्थळे, खाद्यसंस्कृती आणि स्वातंत्र्य लढा 
            यांचे बहुस्तरीय (Multi-Layer) प्रादेशिक नकाशा दर्शन.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>
              🟢 अधिकृत ASI व राज्य पुरातत्त्व निर्देशांक
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>
              🏛️ ३५०+ गडकिल्ले, ३४ लेणी संकुले, साडेतीन शक्तिपीठे
            </span>
          </div>
        </div>
      </section>

      {/* Main Map Explorer Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '30px 20px' }}>
        
        {/* Layer Filters & Search Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          {/* Search & Region row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 स्थळ, किल्ला, मंदिर किंवा शहराचे नाव शोधा (उदा. रायगड, वेरूळ, जेजुरी)..."
              style={{
                flex: '1',
                minWidth: '260px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                background: '#F9FAFB'
              }}
            >
              <option value="all">सर्व ८ प्रदेश (All Regions)</option>
              {REGIONS_DATA.map(r => (
                <option key={r.id} value={r.name}>{r.name} ({r.nameEn})</option>
              ))}
            </select>
          </div>

          {/* Category Filter Pills */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginBottom: '8px' }}>
              नकाशा स्तर निवडा (Select Layers):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MAP_LAYERS.map(layer => {
                const isActive = layer.id === selectedCategory;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedCategory(layer.id)}
                    style={{
                      background: isActive ? '#B91C1C' : '#F9FAFB',
                      color: isActive ? '#FFFFFF' : '#374151',
                      border: isActive ? '1px solid #7C1D05' : '1px solid #E5E7EB',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{layer.icon}</span>
                    <span>{layer.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column: Pins Grid/Map View + Active Pin Knowledge Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(380px, 1.8fr)', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Filtered Pins List with Quick Click */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '780px', overflowY: 'auto', paddingRight: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 700 }}>
                {filteredPins.length} वारसा स्थळे उपलब्ध
              </span>
              <span style={{ fontSize: '0.78rem', color: '#B91C1C', fontWeight: 600 }}>
                नकाशा कार्ड पाहण्यासाठी क्लिक करा ⬇
              </span>
            </div>

            {filteredPins.length === 0 ? (
              <div style={{ background: '#FFFFFF', padding: '40px 20px', textAlign: 'center', borderRadius: '14px', color: '#6B7280' }}>
                कोणतेही स्थळ आढळले नाही. कृपया इतर शोध शब्द किंवा विभाग निवडा.
              </div>
            ) : (
              filteredPins.map(pin => {
                const isSelected = activePin && activePin.id === pin.id;
                return (
                  <div
                    key={pin.id}
                    onClick={() => setActivePin(pin)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : '#FFFFFF',
                      border: isSelected ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(245,158,11,0.2)' : '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', color: isSelected ? '#78350F' : '#1F2937', fontWeight: 800, margin: 0 }}>
                        📍 {pin.title}
                      </h4>
                      <span style={{ fontSize: '0.72rem', background: '#FEE2E2', color: '#B91C1C', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        {pin.category}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px' }}>
                      🚩 {pin.location} • {pin.region}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {pin.significance}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem' }}>
                      <span style={{ color: pin.confidence.color, fontWeight: 700 }}>
                        {pin.confidence.icon} {pin.confidence.label}
                      </span>
                      <span style={{ color: '#6B7280' }}>
                        अक्षांश: {pin.lat}° N
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Interactive Map Canvas Simulation + Full Pin Knowledge Card */}
          {activePin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
              
              {/* Stylized Visual Map Card */}
              <div style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #334155',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Grid Pattern */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ background: '#DC2626', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                      🔴 थेट नकाशा निर्देशक (GPS: {activePin.lat}° N, {activePin.lng}° E)
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      महाराष्ट्र भूगोलाधारित निर्देशांक
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FCD34D', margin: '4px 0 6px' }}>
                    {activePin.title}
                  </h3>
                  <div style={{ color: '#E2E8F0', fontSize: '0.9rem', marginBottom: '12px' }}>
                    📍 {activePin.location} ({activePin.region})
                  </div>

                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {activePin.significance}
                  </p>
                </div>
              </div>

              {/* Full Relational Knowledge Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F3E8D8',
                padding: '26px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#7C1D05', fontWeight: 800 }}>
                    🔗 CONNECT EVERYTHING संबंध आलेख
                  </div>
                  <span style={{
                    background: activePin.confidence.bg,
                    color: activePin.confidence.color,
                    border: `1px solid ${activePin.confidence.color}`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {activePin.confidence.icon} {activePin.confidence.label}
                  </span>
                </div>

                {/* Related Entities Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                  {activePin.connectedFort && (
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', borderLeft: '3px solid #64748B' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>🏰 संबंधित दुर्ग / किल्ला:</span>
                      <div style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: 700, marginTop: '2px' }}>
                        {activePin.connectedFort}
                      </div>
                    </div>
                  )}

                  {activePin.connectedTemple && (
                    <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '10px', borderLeft: '3px solid #F59E0B' }}>
                      <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700 }}>🛕 संबंधित मंदिर / तीर्थ:</span>
                      <div style={{ fontSize: '0.88rem', color: '#78350F', fontWeight: 700, marginTop: '2px' }}>
                        {activePin.connectedTemple}
                      </div>
                    </div>
                  )}

                  {activePin.connectedFood && (
                    <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '10px', borderLeft: '3px solid #B91C1C' }}>
                      <span style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 700 }}>🍲 स्थानिक खाद्यसंस्कृती:</span>
                      <div style={{ fontSize: '0.88rem', color: '#7F1D1D', fontWeight: 700, marginTop: '2px' }}>
                        {activePin.connectedFood}
                      </div>
                    </div>
                  )}

                  {activePin.tourRoute && (
                    <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '10px', borderLeft: '3px solid #16A34A' }}>
                      <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700 }}>🚗 सुचवलेला पर्यटन मार्ग:</span>
                      <div style={{ fontSize: '0.88rem', color: '#14532D', fontWeight: 700, marginTop: '2px' }}>
                        {activePin.tourRoute}
                      </div>
                    </div>
                  )}
                </div>

                {/* References */}
                <div style={{ fontSize: '0.78rem', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong>अधिकृत संदर्भ:</strong> {activePin.reference}
                  </div>
                  <Link to="/history/knowledge-graph" style={{ color: '#B91C1C', fontWeight: 700 }}>
                    इतिहास नॉलेज ग्राफ मध्ये उघडा →
                  </Link>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
