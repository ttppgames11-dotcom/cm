import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './platform.css';
import {
  DATA_PLATFORM_STATS,
  EVIDENCE_LEVELS,
  MAHARASHTRA_DIVISIONS,
  PUNE_DISTRICT_DEEP_ATLAS,
  FORT_REGISTRY,
  BATTLE_DATABASE,
  MODI_SCRIPT_DATA,
  TEMPLE_AND_PILGRIMAGE_DATABASE,
  SANT_PARAMPARA_DATABASE,
  DIALECT_ATLAS,
  DIALECT_COMPARATOR,
  FOOD_ATLAS,
  TEXTILE_AND_CRAFT_REGISTRY,
  HERITAGE_TRAILS_PRESETS,
  API_ENDPOINTS_SPEC
} from '../../data/maharashtraMasterDataPlatform';

export default function MaharashtraDataPlatformPage() {
  const [activeTab, setActiveTab] = useState('atlas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Atlas filters
  const [selectedDivision, setSelectedDivision] = useState('pune');
  const [selectedDistrict, setSelectedDistrict] = useState('pune');

  // Fort Registry filters
  const [fortFilterType, setFortFilterType] = useState('ALL');
  const [selectedFort, setSelectedFort] = useState(FORT_REGISTRY[0]);

  // Modi Script interactive state
  const [modiAlphabetType, setModiAlphabetType] = useState('consonants');
  const [modiExerciseIndex, setModiExerciseIndex] = useState(0);
  const [userModiInput, setUserModiInput] = useState('');
  const [modiFeedback, setModiFeedback] = useState(null);

  // Audio Heritage Player state
  const [currentAudioTrack, setCurrentAudioTrack] = useState({
    title: 'किल्ले रायगड संक्षिप्त इतिहास (2 Min Quick Briefing)',
    fortName: 'रायगड',
    duration: '2:15',
    isPlaying: false
  });

  // QR Code Simulator
  const [qrFort, setQrFort] = useState('raigad');

  // Contribution Form State
  const [contributionData, setContributionData] = useState({
    title: '',
    category: 'fort',
    location: '',
    evidenceLevel: 'B',
    sourceCitation: '',
    description: '',
    contributorName: ''
  });
  const [contributionSuccess, setContributionSuccess] = useState(false);

  // Universal Omnibox Search Logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    FORT_REGISTRY.forEach(f => {
      if (f.name.toLowerCase().includes(q) || f.district.toLowerCase().includes(q) || f.taluka.toLowerCase().includes(q)) {
        results.push({ type: 'दुर्ग (Fort)', title: f.name, subtitle: `${f.district} जिल्हा • ${f.fortType}`, id: f.id, tab: 'forts' });
      }
    });

    BATTLE_DATABASE.forEach(b => {
      if (b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)) {
        results.push({ type: 'युद्ध (Battle)', title: b.name, subtitle: `${b.date} • ${b.location}`, id: b.id, tab: 'battles' });
      }
    });

    TEMPLE_AND_PILGRIMAGE_DATABASE.jyotirlingas.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.district.toLowerCase().includes(q)) {
        results.push({ type: 'ज्योतिर्लिंग (Temple)', title: t.name, subtitle: `${t.district} • ${t.deity}`, tab: 'temples' });
      }
    });

    SANT_PARAMPARA_DATABASE.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.birthplace.toLowerCase().includes(q)) {
        results.push({ type: 'संत (Saint)', title: s.name, subtitle: `${s.period} • ${s.majorShrine}`, tab: 'saints' });
      }
    });

    FOOD_ATLAS.forEach(food => {
      if (food.name.toLowerCase().includes(q) || food.region.toLowerCase().includes(q)) {
        results.push({ type: 'खाद्यसंस्कृती (Food)', title: food.name, subtitle: food.region, tab: 'culture' });
      }
    });

    PUNE_DISTRICT_DEEP_ATLAS.talukas.forEach(tal => {
      if (tal.name.toLowerCase().includes(q)) {
        results.push({ type: 'तालुका (Taluka)', title: `पुणे जिल्हा: ${tal.name}`, subtitle: `${tal.villagesCount} गावे`, tab: 'atlas' });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  const handleModiCheck = (e) => {
    e.preventDefault();
    const currentEx = MODI_SCRIPT_DATA.sampleExercises[modiExerciseIndex];
    if (userModiInput.trim().toLowerCase() === currentEx.marathi.toLowerCase() || userModiInput.trim().toLowerCase() === currentEx.transliteration.toLowerCase()) {
      setModiFeedback({ correct: true, msg: 'अभिनंदन! आपले उत्तर तंतोतंत बरोबर आहे!' });
    } else {
      setModiFeedback({ correct: false, msg: `अचूक उत्तर: "${currentEx.marathi}" (${currentEx.transliteration})` });
    }
  };

  const handleContributionSubmit = (e) => {
    e.preventDefault();
    if (!contributionData.title || !contributionData.description) return;
    setContributionSuccess(true);
    setTimeout(() => {
      setContributionSuccess(false);
      setContributionData({
        title: '',
        category: 'fort',
        location: '',
        evidenceLevel: 'B',
        sourceCitation: '',
        description: '',
        contributorName: ''
      });
    }, 4000);
  };

  return (
    <div className="platform-container">
      
      {/* 1. Hero & Search Banner */}
      <section className="platform-hero">
        <div className="platform-hero-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div className="platform-badge-pill">
              <span>🚩</span>
              <span>महाराष्ट्र डेटा व ज्ञान महाप्लॅटफॉर्म • 50+ Datasets</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#FED7AA' }}>
              <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)' }}>
                🟢 {DATA_PLATFORM_STATS.verifiedEvidencePercentage} प्रमाणित ऐतिहासिक पुरावे
              </span>
            </div>
          </div>

          <h1 className="platform-hero-title">
            CONNECT MARATHA <span>DATA ENGINE</span>
          </h1>
          <p className="platform-hero-subtitle">
            महाराष्ट्राचा सर्वंकष डिजिटल भूगोल, ३५०+ गड-किल्ले, रणभूमी इतिहास, मोडी लिपी, संत परंपरा, भाषा व खाद्यसंस्कृती यांचे एकात्मिक ज्ञानपीठ व रिलेशनशिप इंजिन.
          </p>

          {/* Omnibox Search */}
          <div className="platform-search-wrapper">
            <div className="platform-search-box">
              <span className="platform-search-icon">🔎</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="महाराष्ट्र शोधा... (उदा. रायगड, प्रतापगड, बाजीप्रभू, मोडी, पुरणपोळी, जुन्नर)"
                className="platform-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="platform-search-clear">✕</button>
              )}
            </div>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="platform-search-dropdown">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveTab(res.tab);
                      setSearchQuery('');
                      if (res.id && res.tab === 'forts') {
                        const targetFort = FORT_REGISTRY.find(f => f.id === res.id);
                        if (targetFort) setSelectedFort(targetFort);
                      }
                    }}
                    className="platform-search-item"
                  >
                    <div>
                      <span className="platform-search-tag">{res.type}</span>
                      <span className="platform-search-item-title">{res.title}</span>
                      <div className="platform-search-item-sub">{res.subtitle}</div>
                    </div>
                    <span style={{ color: '#C2410C', fontWeight: 700, fontSize: '0.85rem' }}>पहा →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metrics Counter Grid */}
          <div className="platform-stats-grid">
            <div className="platform-stat-card">
              <div className="platform-stat-number">{DATA_PLATFORM_STATS.divisions}</div>
              <div className="platform-stat-label">प्रशासकीय विभाग</div>
            </div>
            <div className="platform-stat-card">
              <div className="platform-stat-number">{DATA_PLATFORM_STATS.districts}</div>
              <div className="platform-stat-label">जिल्हे (Districts)</div>
            </div>
            <div className="platform-stat-card">
              <div className="platform-stat-number">{DATA_PLATFORM_STATS.talukas}</div>
              <div className="platform-stat-label">तालुके (Talukas)</div>
            </div>
            <div className="platform-stat-card">
              <div className="platform-stat-number">{DATA_PLATFORM_STATS.forts}+</div>
              <div className="platform-stat-label">नोंदणीकृत दुर्ग (Forts)</div>
            </div>
            <div className="platform-stat-card">
              <div className="platform-stat-number">{DATA_PLATFORM_STATS.temples}+</div>
              <div className="platform-stat-label">पुरातन देवस्थाने</div>
            </div>
            <div className="platform-stat-card">
              <div className="platform-stat-number">{DATA_PLATFORM_STATS.activeContributors}</div>
              <div className="platform-stat-label">सक्रिय संशोधक</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Standards & Evidence Bar */}
      <section className="platform-standards-bar">
        <div className="platform-standards-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', display: 'block' }}>
                ऐतिहासिक अचूकता मानके (Evidence Tiers)
              </span>
              <strong style={{ fontSize: '0.88rem', color: '#1E293B' }}>Connect Maratha Verification System</strong>
            </div>
          </div>
          <div className="platform-tier-badges">
            {Object.values(EVIDENCE_LEVELS).map((tier) => (
              <span key={tier.code} className={`platform-tier-badge tier-badge-${tier.code}`} title={tier.english}>
                <span>{tier.icon}</span>
                <span>Tier {tier.code}: {tier.label.split(' ')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Sticky World Navigator Tabs */}
      <section className="platform-tabs-nav">
        <div className="platform-tabs-scroll">
          {[
            { id: 'atlas', label: '🗺️ मास्टर नकाशा व भूगोल' },
            { id: 'forts', label: '🏯 दुर्ग नोंदवही' },
            { id: 'battles', label: '⚔️ रणभूमी व डावपेच' },
            { id: 'modi', label: '📝 मोडी लिपी ज्ञानपीठ' },
            { id: 'temples', label: '🛕 देवस्थान व तीर्थमार्ग' },
            { id: 'saints', label: '🙏 संत परंपरा' },
            { id: 'dialects', label: '🗣️ भाषा व बोलीकोश' },
            { id: 'culture', label: '🍛 खाद्य व वस्त्र वारसा' },
            { id: 'trails', label: '🧭 हेरिटेज ट्रेल्स व ऑडिओ' },
            { id: 'contribute', label: '🧩 योगदान व QR प्रणाली' },
            { id: 'api', label: '🔌 API व डेटा स्कीमा' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`platform-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Main Body Content Area */}
      <main className="platform-content">

        {/* TAB 1: MASTER ATLAS */}
        {activeTab === 'atlas' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🗺️</span>
                  <span>महाराष्ट्र मास्टर ॲटलास (Master Atlas Database)</span>
                </h2>
                <p className="platform-section-desc">
                  ६ प्रशासकीय विभाग → ३६ जिल्हे → ३५८ तालुके → ४३,६६५ खेडी व गावे.
                </p>
              </div>

              {/* Division Selector */}
              <div className="platform-division-buttons">
                {MAHARASHTRA_DIVISIONS.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => {
                      setSelectedDivision(div.id);
                      setSelectedDistrict(div.districts[0].id);
                    }}
                    className={`platform-division-btn ${selectedDivision === div.id ? 'active' : ''}`}
                  >
                    {div.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Division & District Grid */}
            {(() => {
              const currentDiv = MAHARASHTRA_DIVISIONS.find(d => d.id === selectedDivision) || MAHARASHTRA_DIVISIONS[1];
              return (
                <div>
                  <div className="platform-division-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#7C1D05', fontWeight: 800 }}>
                        {currentDiv.name} • मुख्यालय: {currentDiv.headquarters}
                      </h3>
                      <span style={{ background: '#FFEDD5', color: '#C2410C', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {currentDiv.districtsCount} जिल्हे समाविष्ट
                      </span>
                    </div>

                    <div className="platform-districts-grid">
                      {currentDiv.districts.map((dist) => (
                        <div
                          key={dist.id}
                          onClick={() => setSelectedDistrict(dist.id)}
                          className={`platform-district-card ${selectedDistrict === dist.id ? 'active' : ''}`}
                        >
                          <div className="platform-card-header">
                            <h4 className="platform-card-title">{dist.name}</h4>
                            <span className="platform-card-pill">{dist.talukas} तालुके</span>
                          </div>
                          <div className="platform-card-body">
                            <div><strong>क्षेत्रफळ:</strong> {dist.area} • <strong>लोकसंख्या:</strong> {dist.pop}</div>
                            <div><strong>नद्या:</strong> {dist.rivers.join(', ')}</div>
                            <div style={{ color: '#C2410C', fontWeight: 700, marginTop: '4px' }}>
                              प्रमुख दुर्ग: {dist.forts.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deep Taluka-Level Explorer (Featured for Pune District) */}
                  <div className="platform-taluka-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', marginBottom: '20px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#C2410C', letterSpacing: '0.5px' }}>
                          तालुका व ग्रामीण सखोल डेटा (Deep Taluka Explorer)
                        </span>
                        <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', color: '#1E293B', fontWeight: 900 }}>
                          {PUNE_DISTRICT_DEEP_ATLAS.districtName} — तालुकावार विस्तृत नोंदवही
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                          ऐतिहासिक नावे: {PUNE_DISTRICT_DEEP_ATLAS.historicalNames.join(' | ')}
                        </p>
                      </div>
                      <span className="platform-tier-badge tier-badge-A">
                        📜 Tier A: समकालीन पुराभिलेखागार संच
                      </span>
                    </div>

                    <div className="platform-taluka-grid">
                      {PUNE_DISTRICT_DEEP_ATLAS.talukas.map((tal, idx) => (
                        <div key={idx} className="platform-taluka-card">
                          <div className="platform-card-header">
                            <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>{tal.name}</h4>
                            <span style={{ background: '#E2E8F0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                              {tal.villagesCount} गावे
                            </span>
                          </div>

                          <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', margin: '8px 0 12px', lineHeight: 1.5 }}>
                            "{tal.history}"
                          </p>

                          <div style={{ fontSize: '0.82rem', color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: '10px', lineHeight: 1.6 }}>
                            <div><strong style={{ color: '#0F172A' }}>दुर्ग:</strong> {tal.forts.join(', ')}</div>
                            <div><strong style={{ color: '#0F172A' }}>देवस्थाने:</strong> {tal.temples.join(', ')}</div>
                            <div><strong style={{ color: '#0F172A' }}>खाद्यसंस्कृती:</strong> {tal.cuisine.join(', ')}</div>
                            <div><strong style={{ color: '#0F172A' }}>बाजारपेठ:</strong> {tal.markets.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: FORT REGISTRY */}
        {activeTab === 'forts' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🏯</span>
                  <span>स्वराज्य दुर्ग नोंदवही (Maharashtra Fort Registry)</span>
                </h2>
                <p className="platform-section-desc">
                  प्रत्येक किल्ल्याचे दरवाजे, बुरूज, टाकी, चोरदिंड्या, ट्रेक काठिण्य आणि ऐतिहासिक पुरावे.
                </p>
              </div>

              {/* Type Filter Buttons */}
              <div className="platform-division-buttons">
                {['ALL', 'गिरीदुर्ग', 'जलदुर्ग', 'वनदुर्ग'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFortFilterType(type)}
                    className={`platform-division-btn ${fortFilterType === type ? 'active' : ''}`}
                  >
                    {type === 'ALL' ? 'सर्व किल्ले' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Fort Spotlight Card */}
            <div className="platform-fort-spotlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: '#FFEDD5', color: '#C2410C', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                      {selectedFort.fortType}
                    </span>
                    <span style={{ background: '#F1F5F9', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      उंची: {selectedFort.elevation}
                    </span>
                    <span className={`platform-tier-badge tier-badge-${selectedFort.evidenceLevel}`}>
                      Tier {selectedFort.evidenceLevel}: प्रमाणित संदर्भ
                    </span>
                  </div>
                  <h3 className="platform-fort-title">{selectedFort.name}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    स्थान: {selectedFort.village}, ता. {selectedFort.taluka}, जि. {selectedFort.district} • पर्यायी नावे: {selectedFort.alternativeNames.join(', ')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setCurrentAudioTrack({
                        title: `${selectedFort.name} संपूर्ण इतिहास (10 Min Detailed Audio)`,
                        fortName: selectedFort.name,
                        duration: '9:48',
                        isPlaying: true
                      });
                      setActiveTab('trails');
                    }}
                    className="platform-fort-btn-primary"
                  >
                    <span>🎧</span>
                    <span>ऑडिओ गाईड ऐका</span>
                  </button>
                  <button
                    onClick={() => {
                      setQrFort(selectedFort.id);
                      setActiveTab('contribute');
                    }}
                    className="platform-fort-btn-secondary"
                  >
                    <span>📍</span>
                    <span>QR हेरिटेज कोड</span>
                  </button>
                </div>
              </div>

              {/* 4 Attributes Grid */}
              <div className="platform-attributes-grid">
                <div>
                  <div className="platform-attr-title">महादरवाजे (Gates)</div>
                  <div className="platform-attr-value">{selectedFort.gates.join(', ')}</div>
                </div>
                <div>
                  <div className="platform-attr-title">प्रमुख बुरूज व कडे (Bastions)</div>
                  <div className="platform-attr-value">{selectedFort.bastions.join(', ')}</div>
                </div>
                <div>
                  <div className="platform-attr-title">पाण्याचे तलाव व टाकी (Tanks)</div>
                  <div className="platform-attr-value">{selectedFort.waterTanks.join(', ')}</div>
                </div>
                <div>
                  <div className="platform-attr-title">गुप्त चोरदिंड्या व भुयारे</div>
                  <div className="platform-attr-value">{selectedFort.secretStructures.join(', ')}</div>
                </div>
              </div>

              {/* Historical Timeline & Events */}
              <div style={{ margin: '20px 0' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#1E293B', fontWeight: 800, margin: '0 0 10px' }}>
                  📜 महत्त्वाच्या ऐतिहासिक घटना व राजकर्ते
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#334155', lineHeight: 1.8 }}>
                  {selectedFort.historicalEvents.map((ev, idx) => (
                    <li key={idx}><strong>{ev.split(':')[0]}:</strong> {ev.split(':')[1] || ''}</li>
                  ))}
                </ul>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '10px' }}>
                  <strong>प्रमाणित संदर्भ:</strong> {selectedFort.citations.join(' | ')}
                </div>
              </div>

              {/* Trekker Guide Box */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <strong>ट्रेक काठिण्य:</strong> {selectedFort.trekDifficulty} | <strong>उत्तम ऋतू:</strong> {selectedFort.bestSeason}
                </div>
                <div style={{ color: '#C2410C', fontWeight: 700 }}>
                  {selectedFort.emergencyContact}
                </div>
              </div>
            </div>

            {/* Quick Fort Grid Selector */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '12px' }}>
                इतर प्रमुख दुर्ग निवडा:
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                {FORT_REGISTRY
                  .filter(f => fortFilterType === 'ALL' || f.fortType.includes(fortFilterType))
                  .map((fort) => (
                    <div
                      key={fort.id}
                      onClick={() => setSelectedFort(fort)}
                      style={{
                        background: selectedFort.id === fort.id ? '#FFF7ED' : '#FFFFFF',
                        border: selectedFort.id === fort.id ? '2px solid #C2410C' : '1.5px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: '#1E293B', display: 'block' }}>{fort.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{fort.district} • {fort.fortType.split(' ')[0]}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BATTLES & MILITARY TACTICS */}
        {activeTab === 'battles' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>⚔️</span>
                  <span>रणभूमी व युद्ध इतिहास ज्ञानपीठ (Battles & Military Tactics)</span>
                </h2>
                <p className="platform-section-desc">
                  गनिमी कावा, समोरासमोरील लढाया, सेनापती, सैन्यबळ, सामरिक डावपेच आणि निर्णायक ऐतिहासिक परिणाम.
                </p>
              </div>
            </div>

            <div className="platform-battle-grid">
              {BATTLE_DATABASE.map((battle) => (
                <div key={battle.id} className="platform-battle-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                      {battle.date}
                    </span>
                    <span className={`platform-tier-badge tier-badge-${battle.evidenceLevel}`}>
                      Tier {battle.evidenceLevel}: प्रमाणित
                    </span>
                  </div>

                  <h3 className="platform-battle-title">{battle.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '10px' }}>स्थान: {battle.location}</div>

                  <div className="platform-commanders-box">
                    <div>
                      <strong style={{ color: '#047857', display: 'block', marginBottom: '4px' }}>🚩 मराठा नेतृत्व:</strong>
                      <p style={{ margin: 0 }}>{battle.commandersMaratha.join(', ')}</p>
                      <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '4px' }}>सैन्य: {battle.forcesMaratha}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#BE123C', display: 'block', marginBottom: '4px' }}>⚔️ शत्रू नेतृत्व:</strong>
                      <p style={{ margin: 0 }}>{battle.commandersEnemy.join(', ')}</p>
                      <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '4px' }}>सैन्य: {battle.forcesEnemy}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    <div><strong>सामरिक पार्श्वभूमी:</strong> {battle.strategicContext}</div>
                    <div style={{ margin: '6px 0' }}><strong>डावपेच (Tactics):</strong> {battle.tacticalExecution}</div>
                    <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px', marginTop: '8px', color: '#7C1D05', fontWeight: 700 }}>
                      विजयी निकाल: {battle.outcome}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '12px' }}>
                    संदर्भ: {battle.citations.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MODI SCRIPT LEARNING & DOCUMENT ARCHIVE */}
        {activeTab === 'modi' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>📝</span>
                  <span>{MODI_SCRIPT_DATA.title}</span>
                </h2>
                <p className="platform-section-desc">
                  {MODI_SCRIPT_DATA.intro}
                </p>
              </div>
            </div>

            {/* Interactive Alphabet Visualizer */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '18px', padding: '24px', marginBottom: '30px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#7C1D05', fontWeight: 800 }}>मोडी मुळाक्षरे तक्ता (Modi Alphabet Chart)</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setModiAlphabetType('consonants')}
                    className={`platform-division-btn ${modiAlphabetType === 'consonants' ? 'active' : ''}`}
                  >
                    व्यंजने (३२)
                  </button>
                  <button
                    onClick={() => setModiAlphabetType('vowels')}
                    className={`platform-division-btn ${modiAlphabetType === 'vowels' ? 'active' : ''}`}
                  >
                    स्वर (१०)
                  </button>
                </div>
              </div>

              <div className="platform-modi-grid">
                {MODI_SCRIPT_DATA.alphabets[modiAlphabetType].map((item, idx) => (
                  <div key={idx} className="platform-modi-card">
                    <div className="platform-modi-glyph">{item.modi}</div>
                    <strong style={{ fontSize: '0.9rem', color: '#1E293B', display: 'block' }}>{item.devanagari}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.transliteration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Transliteration Quiz Studio */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '18px', padding: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#C2410C' }}>मोडी सराव दालन</span>
                <h3 style={{ margin: '6px 0', fontSize: '1.3rem', color: '#1E293B', fontWeight: 800 }}>
                  सराव {modiExerciseIndex + 1}: शब्द ओळखा
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                  खालील मोडी अक्षरांचे देवनागरी किंवा इंग्रजीत भाषांतर लिहा:
                </p>

                <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '18px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '2.8rem', color: '#C2410C', fontWeight: 900, marginBottom: '6px' }}>
                    {MODI_SCRIPT_DATA.sampleExercises[modiExerciseIndex].marathi}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    संकेत (Hint): {MODI_SCRIPT_DATA.sampleExercises[modiExerciseIndex].hint}
                  </div>
                </div>

                <form onSubmit={handleModiCheck} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={userModiInput}
                    onChange={(e) => setUserModiInput(e.target.value)}
                    placeholder="उत्तर येथे टाईप करा (उदा. स्वराज्य / Swarajya)..."
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="platform-fort-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      उत्तर तपासा
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModiExerciseIndex((prev) => (prev + 1) % MODI_SCRIPT_DATA.sampleExercises.length);
                        setUserModiInput('');
                        setModiFeedback(null);
                      }}
                      className="platform-fort-btn-secondary"
                    >
                      पुढील सराव →
                    </button>
                  </div>
                </form>

                {modiFeedback && (
                  <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: modiFeedback.correct ? '#ECFDF5' : '#FFF1F2', border: modiFeedback.correct ? '1px solid #A7F3D0' : '1px solid #FECDD3', color: modiFeedback.correct ? '#065F46' : '#9F1239', fontWeight: 700, fontSize: '0.85rem' }}>
                    {modiFeedback.msg}
                  </div>
                )}
              </div>

              {/* Sample Archival Document */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>ऐतिहासिक दस्तऐवज</span>
                <h3 style={{ margin: '6px 0', fontSize: '1.25rem', color: '#1E293B', fontWeight: 800 }}>
                  {MODI_SCRIPT_DATA.sampleDocuments[0].title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>
                  कालावधी: {MODI_SCRIPT_DATA.sampleDocuments[0].period} • पुराभिलेखागार: {MODI_SCRIPT_DATA.sampleDocuments[0].archiveLocation}
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  <div>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '4px' }}>मराठी लिप्यंतरण (Transcription):</strong>
                    <p style={{ margin: 0, fontStyle: 'italic', color: '#334155' }}>
                      "{MODI_SCRIPT_DATA.sampleDocuments[0].transcriptionMarathi}"
                    </p>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '4px' }}>English Context & Translation:</strong>
                    <p style={{ margin: 0, color: '#475569' }}>
                      {MODI_SCRIPT_DATA.sampleDocuments[0].englishTranslation}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                  <span>✓</span>
                  <span>प्रमाणित पुरावा (Tier A Archive Authenticated)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEMPLES & PILGRIMAGE */}
        {activeTab === 'temples' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🛕</span>
                  <span>देवस्थान व तीर्थक्षेत्र नेटवर्क (Temples & Pilgrimage Routes)</span>
                </h2>
                <p className="platform-section-desc">
                  महाराष्ट्रातील ५ ज्योतिर्लिंगे, अष्टविनायक, साडेतीन शक्तिपीठे आणि आराध्य विठ्ठल-खंडोबा देवस्थाने.
                </p>
              </div>
            </div>

            {/* 5 Jyotirlingas */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#7C1D05', fontWeight: 800, marginBottom: '14px' }}>
                🔱 महाराष्ट्रातील ५ स्वयंभू ज्योतिर्लिंगे
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {TEMPLE_AND_PILGRIMAGE_DATABASE.jyotirlingas.map((j, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {j.district}
                    </span>
                    <h4 style={{ margin: '8px 0 4px', fontSize: '1rem', color: '#1E293B', fontWeight: 800 }}>{j.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{j.feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ashtavinayak & Shaktipeethas Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>
                  🐘 अष्टविनायक तीर्थक्षेत्र परिक्रमा (Ashtavinayak)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {TEMPLE_AND_PILGRIMAGE_DATABASE.ashtavinayak.map((a) => (
                    <div key={a.sequence} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>{a.sequence}. {a.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{a.district} जिल्हा</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>
                  🌺 साडेतीन शक्तिपीठे (Divine Shaktipeethas)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {TEMPLE_AND_PILGRIMAGE_DATABASE.shaktipeethas.map((s, idx) => (
                    <div key={idx} style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#9F1239' }}>{s.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{s.district} जिल्हा</div>
                      </div>
                      <span style={{ background: '#FFE4E6', color: '#9F1239', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {s.significance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SANT PARAMPARA */}
        {activeTab === 'saints' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🙏</span>
                  <span>महाराष्ट्र संत परंपरा व साहित्य ज्ञानपीठ</span>
                </h2>
                <p className="platform-section-desc">
                  वारकरी भागवत धर्माचा पाया, अभंग गाथा, सामाजिक समता आणि लोकजागृतीचे महामेरू.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {SANT_PARAMPARA_DATABASE.map((sant, idx) => (
                <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#FFEDD5', color: '#C2410C', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {sant.period}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>जन्म: {sant.birthplace}</span>
                  </div>

                  <h3 style={{ margin: '6px 0', fontSize: '1.25rem', color: '#7C1D05', fontWeight: 800 }}>{sant.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#C2410C', fontWeight: 700, marginBottom: '12px' }}>समाधी स्थान: {sant.majorShrine}</div>

                  <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', fontStyle: 'italic', color: '#78350F', lineHeight: 1.6, marginBottom: '12px' }}>
                    "{sant.famousQuote}"
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#334155', borderTop: '1px solid #F1F5F9', paddingTop: '10px', lineHeight: 1.5 }}>
                    <div><strong>ग्रंथ व रचना:</strong> {sant.works.join(', ')}</div>
                    <div><strong>विचारधारा:</strong> {sant.philosophy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: LANGUAGE & DIALECT ATLAS */}
        {activeTab === 'dialects' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🗣️</span>
                  <span>महाराष्ट्र भाषा व बोलीकोश (Dialect Atlas & Comparator)</span>
                </h2>
                <p className="platform-section-desc">
                  "दर बारा कोसांवर भाषा बदलते" — प्रमाण मराठी, वऱ्हाडी, अहिराणी, मालवणी आणि आगरी बोलींचा शब्दसंग्रह.
                </p>
              </div>
            </div>

            {/* Comparative Vocabulary Table */}
            <div className="platform-table-card">
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>
                तौलनिक शब्दकोश (Dialect Vocabulary Comparator)
              </h3>
              <table className="platform-table">
                <thead>
                  <tr>
                    <th>प्रमाण मराठी (Standard)</th>
                    <th>पुणेरी (Puneri)</th>
                    <th>वऱ्हाडी (Varhadi)</th>
                    <th>अहिराणी (Ahirani)</th>
                    <th>मालवणी (Malvani)</th>
                    <th>आगरी (Agri)</th>
                  </tr>
                </thead>
                <tbody>
                  {DIALECT_COMPARATOR.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: '#0F172A' }}>{row.standard}</strong></td>
                      <td>{row.puneri}</td>
                      <td style={{ color: '#D97706', fontWeight: 700 }}>{row.varhadi}</td>
                      <td style={{ color: '#2563EB', fontWeight: 700 }}>{row.ahirani}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{row.malvani}</td>
                      <td style={{ color: '#7C3AED', fontWeight: 700 }}>{row.agri}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dialects Grid Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
              {DIALECT_ATLAS.map((d, idx) => (
                <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#1E293B', fontWeight: 800 }}>{d.dialect}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>प्रदेश: {d.regions}</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '10px' }}>
                    <strong>वैशिष्ट्ये:</strong> {d.tone}
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontStyle: 'italic', color: '#0F172A' }}>
                    "{d.sample}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CUISINE, TEXTILES & CRAFTS */}
        {activeTab === 'culture' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🍛</span>
                  <span>महाराष्ट्र खाद्यसंस्कृती व वस्त्रकला वारसा</span>
                </h2>
                <p className="platform-section-desc">
                  पुरणपोळी, पिठलं-भाकरी, कोल्हापुरी रस्सा आणि पैठणी, वारली कला व कोल्हापुरी चप्पल.
                </p>
              </div>
            </div>

            {/* Food Grid */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#7C1D05', fontWeight: 800, marginBottom: '14px' }}>
                🍽️ पारंपरिक खाद्यपदार्थ व इतिहास
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {FOOD_ATLAS.map((food, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>{food.name}</h4>
                      <span style={{ background: '#FFEDD5', color: '#C2410C', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {food.region.split(' ')[0]}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', margin: '8px 0 12px', lineHeight: 1.5 }}>
                      "{food.history}"
                    </p>
                    <div style={{ fontSize: '0.82rem', color: '#334155', borderTop: '1px solid #F1F5F9', paddingTop: '10px', lineHeight: 1.5 }}>
                      <div><strong>साहित्य:</strong> {food.ingredients}</div>
                      <div><strong>सण / उत्सव:</strong> {food.festivalAssociation}</div>
                      <div><strong>पद्धती:</strong> {food.servingStyle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Textiles & Crafts Grid */}
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#7C1D05', fontWeight: 800, marginBottom: '14px' }}>
                👘 वस्त्र व हस्तकला कारागीर वारसा (Textiles & GI Tags)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {TEXTILE_AND_CRAFT_REGISTRY.map((craft, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>{craft.name}</h4>
                      {craft.giTag && (
                        <span style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                          GI Tag
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#C2410C', fontWeight: 700, marginBottom: '8px' }}>केंद्र: {craft.cluster}</div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {craft.characteristics}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                      इतिहास: {craft.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: HERITAGE TRAILS & AUDIO */}
        {activeTab === 'trails' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🧭</span>
                  <span>वारसा पर्यटन ट्रेल्स व ऑडिओ गाईड (Heritage Trails & Audio)</span>
                </h2>
                <p className="platform-section-desc">
                  दुर्ग, समुद्रकिनारे आणि संत परिक्रमा मार्गांचे सुसूत्र नियोजन आणि ऑन-साइट ऑडिओ गाईड.
                </p>
              </div>
            </div>

            {/* Audio Player Card */}
            <div className="platform-audio-player">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#FDE68A' }}>
                    🎧 ऑडिओ वारसा प्लेअर
                  </span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.8rem', fontWeight: 900 }}>{currentAudioTrack.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#FFEDD5' }}>किल्ले {currentAudioTrack.fortName} • कालावधी: {currentAudioTrack.duration}</div>
                </div>

                <button
                  onClick={() => setCurrentAudioTrack(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                  className="platform-audio-playbtn"
                >
                  {currentAudioTrack.isPlaying ? '❚❚' : '▶'}
                </button>
              </div>

              {/* Progress bar */}
              <div className="platform-audio-progress">
                <div className="platform-audio-progress-bar" style={{ width: currentAudioTrack.isPlaying ? '42%' : '8%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#FFEDD5' }}>
                <span>{currentAudioTrack.isPlaying ? '0:45' : '0:00'}</span>
                <span>{currentAudioTrack.duration}</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '14px', marginTop: '14px', fontSize: '0.85rem', fontStyle: 'italic', color: '#FFEDD5', lineHeight: 1.6 }}>
                "सादर प्रणाम! आपण ऐकत आहात किल्ले रायगडाचा ज्वलंत इतिहास. १६५६ मध्ये छत्रपती शिवाजी महाराजांनी जावळीचे मोरे यांच्याकडून रायरीचा किल्ला जिंकला आणि त्याचे नामकरण 'रायगड' केले. १६७४ च्या ६ जून रोजी याच गडावर हिंदवी स्वराज्याचा सुवर्ण सिंहासनारूढ राज्याभिषेक संपन्न झाला..."
              </div>
            </div>

            {/* Trails Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {HERITAGE_TRAILS_PRESETS.map((trail) => (
                <div key={trail.id} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {trail.duration}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{trail.theme}</span>
                  </div>

                  <h3 style={{ margin: '6px 0', fontSize: '1.15rem', color: '#1E293B', fontWeight: 800 }}>{trail.title}</h3>
                  <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', margin: '8px 0 12px' }}>
                    मार्ग: {trail.route}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '4px' }}>प्रमुख आकर्षणे:</strong>
                    {trail.highlights.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ color: '#C2410C' }}>✓</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: CONTRIBUTION & QR HERITAGE */}
        {activeTab === 'contribute' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🧩</span>
                  <span>डेटा योगदान व QR हेरिटेज प्रणाली (CMS & QR Generator)</span>
                </h2>
                <p className="platform-section-desc">
                  इतिहास संशोधक व नागरिकांसाठी दस्तऐवज नोंदणी, पीअर रिव्ह्यू कार्यप्रणाली आणि किल्ले-स्मारकांसाठी QR कोड जनरेटर.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* QR Code Heritage Generator */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '18px', padding: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#C2410C' }}>
                  ऑन-साइट स्मारक फलक (Monument QR Code Generator)
                </span>
                <h3 style={{ margin: '6px 0', fontSize: '1.3rem', color: '#1E293B', fontWeight: 800 }}>
                  पर्यटकांसाठी थेट डिजिटल माहिती पाटी
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
                  स्मारकाच्या प्रवेशद्वारावर स्कॅन करताच पर्यटकाला त्या वास्तूचा प्रमाणित इतिहास, नकाशे व ऑडिओ गाईड उपलब्ध होते.
                </p>

                <div style={{ marginBottom: '18px' }}>
                  <select
                    value={qrFort}
                    onChange={(e) => setQrFort(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {FORT_REGISTRY.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.district})</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const target = FORT_REGISTRY.find(f => f.id === qrFort) || FORT_REGISTRY[0];
                  return (
                    <div style={{ background: '#FFF7ED', border: '2px dashed #FED7AA', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                      <div style={{ width: '130px', height: '130px', background: '#FFFFFF', padding: '8px', borderRadius: '12px', margin: '0 auto 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', width: '100%', height: '100%', background: '#0F172A', borderRadius: '6px', padding: '6px' }}>
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div key={i} style={{ background: (i % 2 === 0 || i % 5 === 0) ? '#FFFFFF' : 'transparent', borderRadius: '2px' }}></div>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C1D05' }}>{target.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>QR ID: {target.qrCodeId}</div>
                      <div style={{ fontSize: '0.85rem', color: '#C2410C', fontWeight: 800, marginTop: '6px' }}>
                        स्कॅन करा • इतिहास, नकाशे व ऑडिओ ऐका
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Researcher Contribution CMS */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669' }}>
                  नवीन नोंदणी प्रस्ताव (Research Contribution Form)
                </span>
                <h3 style={{ margin: '6px 0', fontSize: '1.3rem', color: '#1E293B', fontWeight: 800 }}>
                  इतिहास नोंद किंवा सुधारणा सादर करा
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
                  प्रत्येक योगदान आमच्या संपादक मंडळ व इतिहासकारांद्वारे तपासून मगच प्रसिद्ध केले जाते.
                </p>

                {contributionSuccess ? (
                  <div style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🎉</span>
                    <strong style={{ fontSize: '1.1rem', color: '#065F46', display: 'block' }}>आपले योगदान यशस्वीरीत्या प्राप्त झाले!</strong>
                    <p style={{ fontSize: '0.85rem', color: '#047857', margin: '4px 0 0' }}>
                      संशोधक मंडळाकडून पडताळणी झाल्यानंतर आपली नोंद Tier {contributionData.evidenceLevel} अंतर्गत प्रसिद्ध केली जाईल.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContributionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>नोंदीचे शीर्षक (Title):</label>
                      <input
                        type="text"
                        required
                        value={contributionData.title}
                        onChange={(e) => setContributionData({ ...contributionData, title: e.target.value })}
                        placeholder="उदा. साल्हेर लढाईतील सूर्याजी काकडे यांचे समाधीस्थळ..."
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>श्रेणी (Category):</label>
                        <select
                          value={contributionData.category}
                          onChange={(e) => setContributionData({ ...contributionData, category: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="fort">दुर्ग (Fort)</option>
                          <option value="battle">लढाई (Battle)</option>
                          <option value="personality">व्यक्तिमत्त्व (Personality)</option>
                          <option value="temple">मंदिर (Temple)</option>
                          <option value="oral">मौखिक इतिहास (Oral Testimony)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>पुरावा दर्जा (Evidence):</label>
                        <select
                          value={contributionData.evidenceLevel}
                          onChange={(e) => setContributionData({ ...contributionData, evidenceLevel: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="A">Tier A: समकालीन दस्तऐवज</option>
                          <option value="B">Tier B: मान्यताप्राप्त इतिहासकार</option>
                          <option value="C">Tier C: तौलनिक अभ्यास</option>
                          <option value="D">Tier D: स्थानिक लोकस्मृती</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>संदर्भ / पुरावा नोंद (Sources):</label>
                      <input
                        type="text"
                        value={contributionData.sourceCitation}
                        onChange={(e) => setContributionData({ ...contributionData, sourceCitation: e.target.value })}
                        placeholder="उदा. सभासद बखर पृ. ६८ किंवा जेधे शकावली..."
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>सविस्तर तपशील (Description):</label>
                      <textarea
                        rows={3}
                        required
                        value={contributionData.description}
                        onChange={(e) => setContributionData({ ...contributionData, description: e.target.value })}
                        placeholder="नोंदीचा सविस्तर ऐतिहासिक तपशील येथे लिहा..."
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      style={{ background: '#059669', color: '#FFFFFF', padding: '12px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)', marginTop: '4px' }}
                    >
                      योगदान पुनरावलोकनासाठी पाठवा →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: DEVELOPER API & SCHEMA DOCUMENTATION */}
        {activeTab === 'api' && (
          <div className="platform-tab-panel">
            <div className="platform-section-header">
              <div>
                <h2 className="platform-section-title">
                  <span>🔌</span>
                  <span>Connect Maratha Knowledge Graph API Explorer</span>
                </h2>
                <p className="platform-section-desc">
                  संशोधक, मोबाईल ॲप्स आणि शैक्षणिक संस्थांसाठी महाराष्ट्र डेटा प्लॅटफॉर्मची रेस्ट (REST) API विनिर्देशने.
                </p>
              </div>
            </div>

            <div className="platform-api-terminal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ color: '#FDE68A', fontWeight: 700, fontSize: '0.85rem' }}>BASE URL: https://api.connectmaratha.com</span>
                <span style={{ background: '#064E3B', color: '#6EE7B7', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>v1.4 Live</span>
              </div>

              {API_ENDPOINTS_SPEC.map((api, idx) => (
                <div key={idx} className="platform-api-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`platform-api-badge-${api.method.toLowerCase()}`}>{api.method}</span>
                    <span style={{ color: '#FEF08A', fontWeight: 700 }}>{api.endpoint}</span>
                  </div>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>{api.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 5. Footer Navigation */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '24px 20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: '#1E293B' }}>CONNECT MARATHA</strong> • महाराष्ट्र सांस्कृतिक, ऐतिहासिक व डेटा प्लॅटफॉर्म
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{ color: '#C2410C', textDecoration: 'none', fontWeight: 700 }}>मुख्यपृष्ठ</Link>
            <Link to="/universe" style={{ color: '#C2410C', textDecoration: 'none', fontWeight: 700 }}>विश्व दालन</Link>
            <Link to="/forts" style={{ color: '#C2410C', textDecoration: 'none', fontWeight: 700 }}>दुर्ग नकाशा</Link>
            <Link to="/calendar" style={{ color: '#C2410C', textDecoration: 'none', fontWeight: 700 }}>मराठा दिनदर्शिका</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
