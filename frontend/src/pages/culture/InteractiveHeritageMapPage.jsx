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
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'siteplan' | 'trek'
  const [selectedLandmarkIdx, setSelectedLandmarkIdx] = useState(0);

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

  // Calculate coordinates on the stylized Maharashtra map canvas
  // Bounds: Lat 15.6°N to 22.1°N, Lng 72.6°E to 80.9°E
  const getPinCoords = (pin) => {
    const minLat = 15.6;
    const maxLat = 22.1;
    const minLng = 72.6;
    const maxLng = 80.9;
    
    const x = ((pin.lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - pin.lat) / (maxLat - minLat)) * 100;
    
    return {
      left: `${Math.max(6, Math.min(94, x))}%`,
      top: `${Math.max(6, Math.min(94, y))}%`
    };
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'forts': return '#DC2626';
      case 'temples': return '#D97706';
      case 'gramdevat': return '#B45309';
      case 'unesco': return '#7C3AED';
      case 'food': return '#E11D48';
      case 'jatra': return '#059669';
      default: return '#B91C1C';
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'forts': return '🏰';
      case 'temples': return '🛕';
      case 'gramdevat': return '🙏';
      case 'unesco': return '🏛️';
      case 'food': return '🍲';
      case 'jatra': return '🎉';
      default: return '📍';
    }
  };

  const handleSelectPin = (pin) => {
    setActivePin(pin);
    setSelectedLandmarkIdx(0);
  };

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
            महाराष्ट्र वारसा, गड-किल्ले व सांस्कृतिक नकाशा
          </h1>
          <p style={{ fontSize: '1.05rem', maxWidth: '880px', opacity: 0.95, lineHeight: 1.6, marginBottom: '16px' }}>
            किल्ले, प्राचीन लेणी, मंदिरे, ग्रामदैवते, युनेस्को जागतिक वारसास्थळे, आणि स्थानिक खाद्यसंस्कृती 
            यांचे अचूक जीपीएस (GPS), अंतर्गत स्थापत्य आराखडा (Site Plan) व थेट रस्ता नकाशा दर्शन.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>
              🟢 थेट OpenStreetMap व Google Maps नेव्हिगेशन
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>
              🏰 गड-किल्ल्यांचे अंतर्गत वास्तू आराखडे (Architectural Site Plans)
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px' }}>
              🚗 पायथा गाव व ट्रेक मार्गदर्शक (Base Village & Trek Guide)
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
              placeholder="🔍 स्थळ, किल्ला, मंदिर किंवा शहराचे नाव शोधा (उदा. रायगड, वेरूळ, सिंहगड, जेजुरी)..."
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
              नकाशा स्तर निवडा (Select Map Layers):
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
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
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

        {/* ======================================================== */}
        {/* STATEWIDE GEOGRAPHIC OVERVIEW MAP (महाराष्ट्र भूगोलाचा नकाशा) */}
        {/* ======================================================== */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          border: '1px solid #334155',
          padding: '20px',
          marginBottom: '28px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🗺️ महाराष्ट्र भौगोलिक नकाशा दृश्य (Geo-Proportional Coordinates)
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0', color: '#F8FAFC' }}>
                नकाशावर स्थळाची नेमकी जागा (क्लिक करून तपशील उघडा)
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94A3B8' }}>
              <span>📍 {filteredPins.length} स्थळे दर्शवली आहेत</span>
              <span>•</span>
              <span style={{ color: '#FCD34D' }}>पिवळा रिंग = निवडलेले स्थळ</span>
            </div>
          </div>

          {/* Interactive Graphic Canvas */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            background: 'radial-gradient(ellipse at center, #1E293B 0%, #0B1120 100%)',
            borderRadius: '12px',
            border: '1px solid #334155',
            overflow: 'hidden'
          }}>
            {/* Grid Coordinates Lines */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              opacity: 0.7
            }} />

            {/* Stylized Maharashtra Coastline & River Outlines */}
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.25, pointerEvents: 'none' }}
              viewBox="0 0 800 340"
              preserveAspectRatio="none"
            >
              {/* Arabian Sea Coastline (Western border curve) */}
              <path
                d="M 60 40 Q 90 120 100 180 T 115 280 T 130 330"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
              {/* Sahyadri Ridge Line */}
              <path
                d="M 95 30 Q 130 110 140 180 T 155 270 T 170 330"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              {/* Godavari River Course (NW to SE) */}
              <path
                d="M 140 110 Q 300 120 480 180 T 720 220"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                opacity="0.6"
              />
              {/* Krishna-Bhima River Course */}
              <path
                d="M 160 190 Q 280 230 450 260 T 560 300"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>

            {/* Regional Watermarks */}
            <div style={{ position: 'absolute', left: '2%', top: '48%', color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700, opacity: 0.6, transform: 'rotate(-90deg)' }}>
              🌊 अरबी समुद्र (Arabian Sea)
            </div>
            <div style={{ position: 'absolute', left: '16%', top: '6%', color: '#F59E0B', fontSize: '0.72rem', fontWeight: 700, opacity: 0.6 }}>
              ⛰️ सह्याद्री पर्वतरांग
            </div>
            <div style={{ position: 'absolute', right: '5%', top: '15%', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, opacity: 0.6 }}>
              🌲 विदर्भ व वने
            </div>
            <div style={{ position: 'absolute', right: '15%', bottom: '15%', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, opacity: 0.6 }}>
              🌾 मराठवाडा प्रदेश
            </div>

            {/* Plotting Dynamic Pins */}
            {filteredPins.map(pin => {
              const coords = getPinCoords(pin);
              const isSelected = activePin && activePin.id === pin.id;
              const catColor = getCategoryColor(pin.category);

              return (
                <div
                  key={pin.id}
                  onClick={() => handleSelectPin(pin)}
                  title={`${pin.title} (${pin.location}) - क्लिक करा`}
                  style={{
                    position: 'absolute',
                    left: coords.left,
                    top: coords.top,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 30 : 10,
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  {/* Outer Glowing Ring for Active Pin */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '2px solid #F59E0B',
                      background: 'rgba(245, 158, 11, 0.25)',
                      animation: 'pulse 1.8s infinite',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {/* Marker Circle */}
                  <div style={{
                    background: isSelected ? '#F59E0B' : catColor,
                    color: '#FFFFFF',
                    width: isSelected ? '34px' : '26px',
                    height: isSelected ? '34px' : '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSelected ? '0.95rem' : '0.75rem',
                    boxShadow: isSelected ? '0 0 16px #F59E0B' : '0 2px 6px rgba(0,0,0,0.4)',
                    border: isSelected ? '2px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.85)'
                  }}>
                    {getCategoryIcon(pin.category)}
                  </div>

                  {/* Pin Name Label on Canvas */}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    marginTop: '4px',
                    background: isSelected ? '#F59E0B' : 'rgba(15, 23, 42, 0.85)',
                    color: isSelected ? '#78350F' : '#F8FAFC',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {pin.title.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2-COLUMN DISPLAY: PIN SELECTOR + RICH INTERACTIVE MAP VIEWER */}
        {/* ======================================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(420px, 1.9fr)', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Filtered Pins List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '820px', overflowY: 'auto', paddingRight: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 700 }}>
                {filteredPins.length} वारसा स्थळे उपलब्ध
              </span>
              <span style={{ fontSize: '0.78rem', color: '#B91C1C', fontWeight: 600 }}>
                तपशील व नकाशा पाहण्यासाठी निवडा ⬇
              </span>
            </div>

            {filteredPins.length === 0 ? (
              <div style={{ background: '#FFFFFF', padding: '40px 20px', textAlign: 'center', borderRadius: '14px', color: '#6B7280' }}>
                कोणतेही स्थळ आढळले नाही. कृपया इतर शोध शब्द किंवा विभाग निवडा.
              </div>
            ) : (
              filteredPins.map(pin => {
                const isSelected = activePin && activePin.id === pin.id;
                const catColor = getCategoryColor(pin.category);

                return (
                  <div
                    key={pin.id}
                    onClick={() => handleSelectPin(pin)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : '#FFFFFF',
                      border: isSelected ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(245,158,11,0.25)' : '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', color: isSelected ? '#78350F' : '#1F2937', fontWeight: 800, margin: 0 }}>
                        {getCategoryIcon(pin.category)} {pin.title}
                      </h4>
                      <span style={{
                        fontSize: '0.72rem',
                        background: isSelected ? '#FDE68A' : '#F3F4F6',
                        color: isSelected ? '#92400E' : '#4B5563',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        {pin.district}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px' }}>
                      📍 {pin.location} • {pin.region.split(' ')[0]}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {pin.significance}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.74rem' }}>
                      <span style={{
                        color: pin.confidence ? pin.confidence.color : '#059669',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {pin.confidence ? pin.confidence.icon : '🟢'} {pin.confidence ? pin.confidence.label : 'नोंदणीकृत'}
                      </span>
                      <span style={{ color: '#6B7280', fontFamily: 'monospace' }}>
                        GPS: {pin.lat.toFixed(2)}°N, {pin.lng.toFixed(2)}°E
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Interactive Location Map Viewer */}
          {activePin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Location Title & Mode Tabs Header */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '22px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <span style={{
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {getCategoryIcon(activePin.category)} {activePin.category.toUpperCase()} • {activePin.region}
                    </span>
                    <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1F2937', margin: '8px 0 4px' }}>
                      {activePin.title}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                      📍 {activePin.location} ({activePin.district} जिल्हा)
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>समुद्रसपाटीपासून उंची:</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#B91C1C' }}>
                      {activePin.altitude || 'उपलब्ध नाही'}
                    </div>
                  </div>
                </div>

                {/* 3 Map Modes Switcher Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  background: '#F3F4F6',
                  padding: '6px',
                  borderRadius: '12px',
                  marginTop: '16px'
                }}>
                  <button
                    onClick={() => setActiveTab('live')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'live' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'live' ? '#B91C1C' : '#4B5563',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'live' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🌐</span>
                    <span>थेट रस्ता व उपग्रह नकाशा</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('siteplan')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'siteplan' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'siteplan' ? '#B91C1C' : '#4B5563',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'siteplan' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🏰</span>
                    <span>अंतर्गत वास्तू आराखडा ({activePin.sitePlan ? activePin.sitePlan.length : 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('trek')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'trek' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'trek' ? '#B91C1C' : '#4B5563',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'trek' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🚗</span>
                    <span>कसे पोहोचावे व ट्रेक</span>
                  </button>
                </div>
              </div>

              {/* ============================================== */}
              {/* TAB 1: LIVE OPENSTREETMAP & GOOGLE MAPS GPS VIEW */}
              {/* ============================================== */}
              {activeTab === 'live' && (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  {/* Map Quick Bar */}
                  <div style={{
                    padding: '12px 18px',
                    background: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                      <strong>अचूक भौगोलिक निर्देशांक:</strong>
                      <span style={{ fontFamily: 'monospace', color: '#64748B' }}>
                        {activePin.lat.toFixed(4)}° N, {activePin.lng.toFixed(4)}° E
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activePin.lat},${activePin.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#1E40AF',
                          color: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🚗 Google Maps नेव्हिगेशन</span>
                      </a>
                      <a
                        href={`https://earth.google.com/web/search/${activePin.lat},${activePin.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#047857',
                          color: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🛰️ 3D सॅटेलाइट व्ह्यू</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded Interactive OpenStreetMap iframe */}
                  <div style={{ width: '100%', height: '420px', position: 'relative', background: '#E2E8F0' }}>
                    <iframe
                      title={`OpenStreetMap for ${activePin.title}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${activePin.lng - 0.035}%2C${activePin.lat - 0.025}%2C${activePin.lng + 0.035}%2C${activePin.lat + 0.025}&layer=mapnik&marker=${activePin.lat}%2C${activePin.lng}`}
                      style={{ border: 0 }}
                    />
                  </div>

                  {/* Map Footer Note */}
                  <div style={{ padding: '12px 18px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
                    <span>
                      🌐 OpenStreetMap योगदात्यांचे भौगोलिक डेटा आधारित थेट नकाशा.
                    </span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${activePin.lat}&mlon=${activePin.lng}#map=15/${activePin.lat}/${activePin.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#B91C1C', fontWeight: 700, textDecoration: 'none' }}
                    >
                      पूर्ण पडद्यावर नकाशा उघडा →
                    </a>
                  </div>
                </div>
              )}

              {/* ============================================== */}
              {/* TAB 2: ARCHITECTURAL SITE PLAN & KEY LANDMARKS */}
              {/* ============================================== */}
              {activeTab === 'siteplan' && (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                        🏛️ {activePin.title} : अंतर्गत आराखडा व प्रमुख ऐतिहासिक वास्तू
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0 0' }}>
                        गडावरील / मंदिरातील प्रवेशद्वार, महाल, तलाव, तोफा आणि पवित्र स्थळांचा तपशीलवार क्रम.
                      </p>
                    </div>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {activePin.sitePlan ? activePin.sitePlan.length : 0} प्रमुख वास्तू
                    </span>
                  </div>

                  {/* Photo & Schematic Layout Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(280px, 1.3fr)', gap: '20px', marginBottom: '20px' }}>
                    {/* Location Real Photo */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F8FAFC', position: 'relative' }}>
                      <img
                        src={activePin.image}
                        alt={activePin.title}
                        style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '8px 12px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.75rem'
                      }}>
                        📸 {activePin.title} — प्रत्यक्ष स्वरूप
                      </div>
                    </div>

                    {/* Interactive Landmark Selector */}
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#4B5563', fontWeight: 700, marginBottom: '8px' }}>
                        प्रमुख वास्तू निवडून माहिती वाचा:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
                        {activePin.sitePlan && activePin.sitePlan.map((landmark, idx) => {
                          const isCurrent = selectedLandmarkIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedLandmarkIdx(idx)}
                              style={{
                                background: isCurrent ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : '#F9FAFB',
                                border: isCurrent ? '1.5px solid #DC2626' : '1px solid #E5E7EB',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: isCurrent ? '#DC2626' : '#9CA3AF',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}>
                                {idx + 1}
                              </span>
                              <span style={{
                                fontSize: '0.88rem',
                                fontWeight: isCurrent ? 800 : 600,
                                color: isCurrent ? '#991B1B' : '#1F2937'
                              }}>
                                {landmark.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selected Landmark Highlight Box */}
                  {activePin.sitePlan && activePin.sitePlan[selectedLandmarkIdx] && (
                    <div style={{
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                      border: '1.5px solid #F59E0B',
                      borderRadius: '12px',
                      padding: '16px 20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ background: '#B45309', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
                          वास्तू #{selectedLandmarkIdx + 1}
                        </span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350F', margin: 0 }}>
                          {activePin.sitePlan[selectedLandmarkIdx].name}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.92rem', color: '#92400E', lineHeight: 1.6, margin: 0 }}>
                        {activePin.sitePlan[selectedLandmarkIdx].desc}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================== */}
              {/* TAB 3: ACCESS, TRANSIT & TREK GUIDE */}
              {/* ============================================== */}
              {activeTab === 'trek' && (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
                    🚗 कसे पोहोचावे, पायथा गाव व ट्रेक मार्गदर्शक
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {/* Base Village */}
                    <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #3B82F6' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>🏡 पायथा गाव (Base Village):</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                        {activePin.baseVillage || activePin.location}
                      </div>
                    </div>

                    {/* Trek Difficulty */}
                    <div style={{ background: '#FFFBEB', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #F59E0B' }}>
                      <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700 }}>🧗‍♂️ काठिण्य पातळी (Trek Difficulty):</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>
                        {activePin.trekDifficulty || 'सोपे मार्ग'}
                      </div>
                    </div>

                    {/* Altitude */}
                    <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #EF4444' }}>
                      <div style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: 700 }}>⛰️ समुद्रसपाटीपासून उंची:</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7F1D1D', marginTop: '2px' }}>
                        {activePin.altitude || 'उपलब्ध नाही'}
                      </div>
                    </div>

                    {/* Best Season */}
                    <div style={{ background: '#F0FDF4', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #22C55E' }}>
                      <div style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700 }}>🌤️ सर्वोत्तम भेट काळ:</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#14532D', marginTop: '2px' }}>
                        ऑगस्ट ते फेब्रुवारी (पावसाळा व हिवाळा)
                      </div>
                    </div>
                  </div>

                  {/* Recommended Transit Route */}
                  {activePin.tourRoute && (
                    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 800, marginBottom: '6px' }}>
                        🗺️ शिफारस केलेला प्रवास मार्ग (Tour Circuit Route):
                      </div>
                      <div style={{ fontSize: '0.92rem', color: '#1F2937', fontWeight: 600, lineHeight: 1.5 }}>
                        {activePin.tourRoute}
                      </div>
                    </div>
                  )}

                  {/* Direct Navigation Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activePin.lat},${activePin.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#B91C1C',
                      color: '#FFFFFF',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(185,28,28,0.3)'
                    }}
                  >
                    <span>🚗 Google Maps वर थेट टर्न-बाय-टर्न नेव्हिगेशन सुरू करा</span>
                    <span>→</span>
                  </a>
                </div>
              )}

              {/* ============================================== */}
              {/* KNOWLEDGE GRAPH RELATIONAL CARDS & CITATIONS */}
              {/* ============================================== */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F3E8D8',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#7C1D05', fontWeight: 800 }}>
                    🔗 CONNECT EVERYTHING संबंध आलेख (Cultural Cross-Links)
                  </div>
                  <span style={{
                    background: activePin.confidence ? activePin.confidence.bg : '#ECFDF5',
                    color: activePin.confidence ? activePin.confidence.color : '#059669',
                    border: `1px solid ${activePin.confidence ? activePin.confidence.color : '#059669'}`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {activePin.confidence ? activePin.confidence.icon : '🟢'} {activePin.confidence ? activePin.confidence.label : 'नोंदणीकृत'}
                  </span>
                </div>

                {/* Related Entities Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
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
                </div>

                {/* References & Links */}
                <div style={{ fontSize: '0.78rem', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong>अधिकृत संदर्भ:</strong> {activePin.reference}
                  </div>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <Link to="/culture" style={{ color: '#B91C1C', fontWeight: 700, textDecoration: 'none' }}>
                      सांस्कृतिक दालन →
                    </Link>
                    <Link to="/culture/food" style={{ color: '#B91C1C', fontWeight: 700, textDecoration: 'none' }}>
                      खाद्यसंस्कृती →
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
