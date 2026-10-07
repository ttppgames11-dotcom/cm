import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FORTS_DATABASE } from '../../data/forts350Data';
import { FORT_HISTORICAL_DETAILS } from '../../data/fortHistoryDetails';
import { ALL_FORTS_350_DIRECTORY } from '../../data/allForts350Directory';

const DIVISION_FILTERS = [
  { id: 'all', label: 'सर्व विभाग' },
  { id: 'पुणे विभाग', label: 'पुणे विभाग' },
  { id: 'कोकण विभाग', label: 'कोकण विभाग' },
  { id: 'नाशिक विभाग', label: 'नाशिक विभाग' },
  { id: 'छ. संभाजीनगर', label: 'छ. संभाजीनगर विभाग' },
  { id: 'विदर्भ व नागपूर', label: 'विदर्भ व नागपूर विभाग' }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'सर्व गड-किल्ले' },
  { id: 'giridurg', label: '⛰️ गिरीदुर्ग (Hill Forts)' },
  { id: 'jaladurg', label: '🌊 जलदुर्ग (Sea Forts)' },
  { id: 'bhuikot', label: '🏰 भुईकोट (Plain Forts)' },
  { id: 'unesco', label: '⭐ युनेस्को नामांकित (UNESCO List)' },
];

export default function FortsMapPage() {
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedFort, setSelectedFort] = useState(null);

  // Directory (350+ Forts) State
  const [dirSearch, setDirSearch] = useState('');
  const [dirDivision, setDirDivision] = useState('all');
  const [dirDistrict, setDirDistrict] = useState('all');
  const [dirType, setDirType] = useState('all');
  const [dirPhotoStatus, setDirPhotoStatus] = useState('all');
  const [dirVisibleCount, setDirVisibleCount] = useState(36);

  // Compute available districts across all 369 forts
  const dirDistricts = useMemo(() => {
    const list = dirDivision === 'all'
      ? ALL_FORTS_350_DIRECTORY
      : ALL_FORTS_350_DIRECTORY.filter(f => f.division === dirDivision);
    const set = new Set(list.map(f => f.district));
    return Array.from(set).sort();
  }, [dirDivision]);

  // Filtering for 350+ directory
  const filteredDirectory = useMemo(() => {
    return ALL_FORTS_350_DIRECTORY.filter(f => {
      const matchDiv = dirDivision === 'all' || f.division === dirDivision;
      const matchDist = dirDistrict === 'all' || f.district === dirDistrict;
      const matchType = dirType === 'all' || f.type === dirType;
      const matchPhoto = dirPhotoStatus === 'all' ||
        (dirPhotoStatus === 'with_photo' ? f.hasVerifiedPhoto : !f.hasVerifiedPhoto);
      
      const q = dirSearch.trim().toLowerCase();
      const matchSearch = !q ||
        f.marathiName.toLowerCase().includes(q) ||
        (f.englishName && f.englishName.toLowerCase().includes(q)) ||
        f.district.toLowerCase().includes(q) ||
        (f.taluka && f.taluka.toLowerCase().includes(q)) ||
        (f.desc && f.desc.toLowerCase().includes(q));

      return matchDiv && matchDist && matchType && matchPhoto && matchSearch;
    });
  }, [dirDivision, dirDistrict, dirType, dirPhotoStatus, dirSearch]);

  // Compute available districts for the selected division
  const availableDistricts = useMemo(() => {
    const fortsInDiv = selectedDiv === 'all' 
      ? FORTS_DATABASE 
      : FORTS_DATABASE.filter(f => f.division === selectedDiv);
    const set = new Set(fortsInDiv.map(f => f.district));
    return Array.from(set).sort();
  }, [selectedDiv]);

  // Filtering
  const filteredForts = useMemo(() => {
    return FORTS_DATABASE.filter(f => {
      const matchesType =
        activeType === 'all' ||
        (activeType === 'unesco' ? f.isUnesco : f.type === activeType);

      const matchesDiv =
        selectedDiv === 'all' || f.division === selectedDiv;

      const matchesDistrict =
        selectedDistrict === 'all' || f.district === selectedDistrict;

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.englishName && f.englishName.toLowerCase().includes(q)) ||
        f.district.toLowerCase().includes(q) ||
        f.division.toLowerCase().includes(q) ||
        (f.desc && f.desc.toLowerCase().includes(q));

      return matchesType && matchesDiv && matchesDistrict && matchesSearch;
    });
  }, [activeType, selectedDiv, selectedDistrict, search]);

  const resetFilters = () => {
    setActiveType('all');
    setSelectedDiv('all');
    setSelectedDistrict('all');
    setSearch('');
  };

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
          src="/assets/images/real-raigad-panoramic.jpg"
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
            <p className="tagline" style={{ fontSize: '1.1rem', maxWidth: '65ch', color: '#FFF8F2', lineHeight: 1.6 }}>
              प्रत्येक किल्ला जपणारा प्रत्येक मावळा आमचा अभिमान! १७१ प्रमाणित गडकोटांचे अस्सल छायाचित्र दालन आणि महाराष्ट्रातील सर्व ३६९ गडकोटांची अधिकृत ऐतिहासिक संदर्भ सूची.
            </p>

            <div className="stats-glass" style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="stat-glass"><b>{FORTS_DATABASE.length}</b><span>📸 छायाचित्र प्रमाणित किल्ले</span></div>
              <div className="stat-glass"><b>{ALL_FORTS_350_DIRECTORY.length}</b><span>📜 समग्र संदर्भ सूची (एकूण)</span></div>
              <div className="stat-glass"><b>३६</b><span>जिल्हे व्याप्ती</span></div>
              <div className="stat-glass"><b>१२</b><span>UNESCO नामांकित किल्ले</span></div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="#photo-gallery-section"
                style={{
                  background: 'linear-gradient(135deg, #C73800, #EA580C)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📸 छायाचित्र प्रमाणित दालन (१७१)</span>
                <span>↓</span>
              </a>
              <a
                href="#all-forts-directory"
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#78350F',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📜 ३५०+ समग्र संदर्भ सूची (३६९)</span>
                <span>↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '36px 24px', margin: '0 auto' }}>
        
        {/* Search & Administrative Navigation */}
        <section id="photo-gallery-section" style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'Baloo 2', color: '#C73800', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📸</span> छायाचित्र प्रमाणित गडकोट दालन (१७१ किल्ले)
            </h2>
            <span style={{ fontSize: '0.84rem', color: '#6B7280', fontWeight: 600 }}>
              प्रत्येक किल्ल्याचे प्रत्यक्ष पडताळलेले १००% अस्सल छायाचित्र व तपशील
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <input
                type="search"
                placeholder="किल्ल्याचे नाव किंवा जिल्हा शोधा (उदा. रायगड, प्रतापगड, तोरणा, सिंधुदुर्ग, जंजिरा, दौलताबाद)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* Quick District Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: '#FFFFFF',
                color: 'var(--maroon-900)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="all">सर्व जिल्हे ({availableDistricts.length})</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>📍 {dist} जिल्हा</option>
              ))}
            </select>

            {(search || selectedDiv !== 'all' || selectedDistrict !== 'all' || activeType !== 'all') && (
              <button
                onClick={resetFilters}
                style={{
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: '1px solid #e11d48',
                  background: '#ffe4e6',
                  color: '#9f1239',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 सर्व फिल्टर्स रिसेट
              </button>
            )}
          </div>

          {/* Division Buttons */}
          <div style={{
            background: 'var(--paper-2)',
            padding: '18px 24px',
            borderRadius: '14px',
            border: '1px solid var(--line)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ fontFamily: 'Baloo 2', fontSize: '1.05rem', color: 'var(--maroon-900)' }}>
                प्रशासकीय विभाग निहाय वर्गीकरण:
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                दाखवत असलेले एकूण किल्ले: {filteredForts.length} / {FORTS_DATABASE.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {DIVISION_FILTERS.map((d) => {
                const isSelected = selectedDiv === d.id;
                // Count forts in this division under current active category
                const count = d.id === 'all'
                  ? (activeType === 'all' ? FORTS_DATABASE.length : (activeType === 'unesco' ? FORTS_DATABASE.filter(f => f.isUnesco).length : FORTS_DATABASE.filter(f => f.type === activeType).length))
                  : FORTS_DATABASE.filter(f => f.division === d.id && (activeType === 'all' || (activeType === 'unesco' ? f.isUnesco : f.type === activeType))).length;

                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDiv(d.id);
                      setSelectedDistrict('all');
                      setActiveType('all');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: isSelected ? 'var(--maroon-900)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--ink)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--maroon-900)' : '1px solid var(--line)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{d.label}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {CATEGORY_TABS.map(t => {
              const isSelected = activeType === t.id;
              // Count forts in this category under currently selected division
              const count = FORTS_DATABASE.filter(f => {
                const matchesDiv = selectedDiv === 'all' || f.division === selectedDiv;
                const matchesDistrict = selectedDistrict === 'all' || f.district === selectedDistrict;
                const matchesCategory = t.id === 'all' || (t.id === 'unesco' ? f.isUnesco : f.type === t.id);
                return matchesDiv && matchesDistrict && matchesCategory;
              }).length;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveType(t.id);
                    setSelectedDiv('all');
                    setSelectedDistrict('all');
                  }}
                  className={`tab ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '24px',
                    border: '1px solid var(--line)',
                    background: isSelected ? 'var(--maroon-900)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--ink)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{t.label}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Info Strip */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '14px'
          }}>
            <div style={{ fontSize: '1rem', color: 'var(--ink)' }}>
              सर्व <strong>{filteredForts.length}</strong> किल्ले थेट खाली दाखवले आहेत
              {selectedDiv !== 'all' && <span> • विभाग: <b>{selectedDiv}</b></span>}
              {selectedDistrict !== 'all' && <span> • जिल्हा: <b>{selectedDistrict}</b></span>}
              {search && <span> • शोध: "<b>{search}</b>"</span>}
            </div>
          </div>

          {/* Fort Cards Grid — Rendering ALL forts cleanly with image + name */}
          {filteredForts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              marginTop: '24px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏰</div>
              <h3 style={{ color: 'var(--maroon-950)' }}>या निकषांमध्ये किल्ला सापडला नाही</h3>
              <p style={{ color: 'var(--muted)', maxWidth: '400px', margin: '8px auto 16px' }}>
                कृपया दुसऱ्या विभागात शोधा किंवा शोध संज्ञा बदला.
              </p>
              <button onClick={resetFilters} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                सर्व किल्ले पहा
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
              marginTop: '24px'
            }}>
              {filteredForts.map(f => {
                const fortTypeMarathi = f.type === 'giridurg' ? 'गिरीदुर्ग' : (f.type === 'jaladurg' ? 'जलदुर्ग' : 'भुईकोट');
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFort(f)}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Fort Image */}
                    <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: '#1c0a05' }}>
                      {f.image ? (
                        <img
                          src={f.image}
                          alt={f.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: f.image ? 'none' : 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #2b1108 0%, #150602 100%)',
                          color: '#FFCC80',
                          padding: '16px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🏛️</span>
                        <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#f3d9b1' }}>Verified image unavailable</span>
                        <span style={{ fontSize: '0.68rem', color: '#bca188', marginTop: '2px' }}>अस्सल छायाचित्र उपलब्ध नाही</span>
                      </div>
                      
                      {/* Top Badges */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        display: 'flex',
                        gap: '4px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          background: 'rgba(20, 5, 2, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#FFCC80',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 204, 128, 0.25)'
                        }}>
                          {fortTypeMarathi}
                        </span>
                        {f.isUnesco && (
                          <span style={{
                            background: '#d97706',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '3px 6px',
                            borderRadius: '4px'
                          }}>
                            ★ UNESCO
                          </span>
                        )}
                      </div>

                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#FFFFFF',
                        fontSize: '0.70rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {f.district}
                      </span>
                    </div>

                    {/* Fort Name & District */}
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{
                          fontSize: '1.05rem',
                          fontFamily: 'Baloo 2',
                          color: 'var(--maroon-950)',
                          lineHeight: 1.35,
                          display: 'block'
                        }}>
                          {f.name}
                        </strong>
                        {f.englishName && (
                          <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 500 }}>
                            {f.englishName} Fort
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '0.78rem',
                        color: '#c2410c',
                        fontWeight: 600,
                        marginTop: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>📍 {f.district}</span>
                        <span style={{ color: '#888' }}>{f.height}</span>
                      </div>

                      <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #eee',
                        fontSize: '0.76rem',
                        color: 'var(--maroon-800)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>सविस्तर माहिती पहा</span>
                        <span>➔</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION: महाराष्ट्रातील ३५०+ गडकोट समग्र संदर्भ सूची (350+ Forts Directory) */}
        {/* ========================================================================= */}
        <section id="all-forts-directory" style={{ marginTop: '56px', paddingTop: '40px', borderTop: '2.5px dashed #FCD34D' }}>
          
          {/* Section Header */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFDF8 0%, #FEF3C7 50%, #FFEDD5 100%)',
            borderRadius: '20px',
            padding: '32px 28px',
            border: '2px solid #FCD34D',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.08)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{
                  background: '#C73800',
                  color: '#FEF08A',
                  padding: '5px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📜 अधिकृत ऐतिहासिक निर्देशिका · ३६९ गडकोट
                </span>
                <h2 style={{
                  fontFamily: 'Baloo 2',
                  fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                  color: '#C73800',
                  margin: '12px 0 8px',
                  fontWeight: 900
                }}>
                  महाराष्ट्रातील ३५०+ गडकोट समग्र संदर्भ सूची
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.98rem', margin: 0, maxWidth: '85ch', lineHeight: 1.6, fontWeight: 600 }}>
                  छत्रपती शिवाजी महाराज, मराठा साम्राज्य व दख्खनच्या इतिहासातील सर्व ३६९ गडकोटांची तालुका, जिल्हा व प्रकारानिहाय अधिकृत संदर्भ यादी.
                </p>
              </div>

              {/* Policy badge guaranteeing zero wrong images */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #FDE68A',
                borderRadius: '14px',
                padding: '14px 18px',
                maxWidth: '380px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.88rem' }}>
                  <span>🛡️</span>
                  <span>प्रमाणित छायाचित्र धोरण (Zero Fake Policy)</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.55 }}>
                  वरील गॅलरीतील १७१ किल्ले प्रत्यक्ष प्रमाणित छायाचित्रांसह आहेत. उर्वरित ऐतिहासिक किल्ल्यांवर चुकीचे किंवा खोटे छायाचित्र न लावता, त्यांची खरी ऐतिहासिक नोंद व नकाशा स्थान दिले आहे.
                </p>
              </div>
            </div>
          </div>

          {/* Directory Search & Filters Bar */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5E7EB',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            marginBottom: '28px'
          }}>
            {/* Search + Dropdowns Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="search"
                  placeholder="किल्ल्याचे नाव, तालुका किंवा इतिहास शोधा..."
                  value={dirSearch}
                  onChange={(e) => { setDirSearch(e.target.value); setDirVisibleCount(36); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #D1D5DB',
                    fontSize: '0.94rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Division Dropdown */}
              <select
                value={dirDivision}
                onChange={(e) => { setDirDivision(e.target.value); setDirDistrict('all'); setDirVisibleCount(36); }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #D1D5DB',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  color: '#1F2937',
                  cursor: 'pointer'
                }}
              >
                <option value="all">सर्व विभाग ({ALL_FORTS_350_DIRECTORY.length})</option>
                {DIVISION_FILTERS.filter(d => d.id !== 'all').map(d => (
                  <option key={d.id} value={d.id}>
                    {d.label} ({ALL_FORTS_350_DIRECTORY.filter(f => f.division === d.id).length})
                  </option>
                ))}
              </select>

              {/* District Dropdown */}
              <select
                value={dirDistrict}
                onChange={(e) => { setDirDistrict(e.target.value); setDirVisibleCount(36); }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #D1D5DB',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  color: '#1F2937',
                  cursor: 'pointer'
                }}
              >
                <option value="all">सर्व जिल्हे ({dirDistricts.length})</option>
                {dirDistricts.map(dist => (
                  <option key={dist} value={dist}>
                    📍 {dist} ({ALL_FORTS_350_DIRECTORY.filter(f => f.district === dist).length})
                  </option>
                ))}
              </select>

              {/* Quick Reset */}
              {(dirSearch || dirDivision !== 'all' || dirDistrict !== 'all' || dirType !== 'all' || dirPhotoStatus !== 'all') && (
                <button
                  onClick={() => {
                    setDirSearch('');
                    setDirDivision('all');
                    setDirDistrict('all');
                    setDirType('all');
                    setDirPhotoStatus('all');
                    setDirVisibleCount(36);
                  }}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1.5px solid #FCA5A5',
                    background: '#FEF2F2',
                    color: '#B91C1C',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 सर्व फिल्टर्स रिसेट
                </button>
              )}
            </div>

            {/* Filter Pills for Type & Photo Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: 'सर्व प्रकार' },
                  { id: 'giridurg', label: '⛰️ गिरीदुर्ग' },
                  { id: 'jaladurg', label: '🌊 जलदुर्ग' },
                  { id: 'bhuikot', label: '🏰 भुईकोट' }
                ].map(t => {
                  const isSel = dirType === t.id;
                  const count = ALL_FORTS_350_DIRECTORY.filter(f => {
                    const matchDiv = dirDivision === 'all' || f.division === dirDivision;
                    const matchDist = dirDistrict === 'all' || f.district === dirDistrict;
                    const matchT = t.id === 'all' || f.type === t.id;
                    return matchDiv && matchDist && matchT;
                  }).length;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setDirType(t.id); setDirVisibleCount(36); }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSel ? '1.5px solid #C73800' : '1px solid #E5E7EB',
                        background: isSel ? '#FFF7ED' : '#F9FAFB',
                        color: isSel ? '#C73800' : '#4B5563',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t.label} ({count})
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: 'सर्व (३६९)' },
                  { id: 'with_photo', label: '✅ छायाचित्र उपलब्ध (१७१)' },
                  { id: 'historical_only', label: '📜 ऐतिहासिक नोंद (१९८)' }
                ].map(p => {
                  const isSel = dirPhotoStatus === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setDirPhotoStatus(p.id); setDirVisibleCount(36); }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSel ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
                        background: isSel ? '#F0FDF4' : '#F9FAFB',
                        color: isSel ? '#166534' : '#4B5563',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Directory Count Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.94rem', color: '#374151', fontWeight: 700 }}>
              शोध निकाल: <b style={{ color: '#C73800' }}>{filteredDirectory.length}</b> गडकोट सापडले
            </span>
            <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>
              दाखवत असलेले: {Math.min(dirVisibleCount, filteredDirectory.length)} / {filteredDirectory.length}
            </span>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '16px'
          }}>
            {filteredDirectory.slice(0, dirVisibleCount).map((f) => (
              <div
                key={f.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: f.hasVerifiedPhoto ? '1.5px solid #FED7AA' : '1.5px solid #E5E7EB',
                  overflow: 'hidden',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Header Strip with Type & Photo Status */}
                <div style={{
                  padding: '12px 16px',
                  background: f.hasVerifiedPhoto ? 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)' : '#F9FAFB',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9A3412' }}>
                    {f.typeLabel}
                  </span>
                  {f.hasVerifiedPhoto ? (
                    <span style={{
                      background: '#DCFCE7',
                      color: '#166534',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: '1px solid #BBF7D0'
                    }}>
                      ✅ अस्सल फोटो उपलब्ध
                    </span>
                  ) : (
                    <span style={{
                      background: '#FEF3C7',
                      color: '#854D0E',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: '1px solid #FDE68A'
                    }}>
                      📜 ऐतिहासिक नोंद
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: f.hasVerifiedPhoto ? '#FEF3C7' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {f.type === 'jaladurg' ? '🌊' : (f.type === 'bhuikot' ? '🏰' : '⛰️')}
                    </div>
                    <div>
                      <h4 style={{
                        margin: 0,
                        fontSize: '1.08rem',
                        fontFamily: 'Baloo 2',
                        color: '#C73800',
                        fontWeight: 800,
                        lineHeight: 1.3
                      }}>
                        {f.marathiName}
                      </h4>
                      <span style={{ fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>
                        {f.englishName} Fort {f.taluka ? `· ता. ${f.taluka}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Location & Height Details */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#78350F',
                    fontWeight: 700,
                    margin: '6px 0 10px',
                    padding: '6px 10px',
                    background: '#FFFDF9',
                    borderRadius: '8px',
                    border: '1px solid #FEF3C7'
                  }}>
                    <span>📍 {f.district} ({f.division})</span>
                    <span>{f.height}</span>
                  </div>

                  {/* Historical Description */}
                  <p style={{
                    fontSize: '0.84rem',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    margin: '0 0 14px',
                    flex: 1
                  }}>
                    {f.desc}
                  </p>

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed #E5E7EB', display: 'flex', gap: '8px' }}>
                    {f.hasVerifiedPhoto ? (
                      <button
                        onClick={() => {
                          const originalItem = FORTS_DATABASE.find(item => item.id === f.id);
                          if (originalItem) {
                            setSelectedFort(originalItem);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #F97316',
                          background: '#FFF7ED',
                          color: '#C2410C',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🔍 छायाचित्र व सविस्तर माहिती</span>
                      </button>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.marathiName + ' ' + f.district + ' किल्ला महाराष्ट्र')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          background: '#F9FAFB',
                          color: '#374151',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🗺️ Google Maps वर स्थान पहा</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredDirectory.length > dirVisibleCount && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => setDirVisibleCount(prev => prev + 36)}
                style={{
                  padding: '12px 32px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #C73800, #EA580C)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(199, 56, 0, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>अधिक गडकोट दाखवा (+३६)</span>
                <span>▼</span>
              </button>
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#6B7280' }}>
                उर्वरित {filteredDirectory.length - dirVisibleCount} किल्ले पाहण्यासाठी क्लिक करा
              </div>
            </div>
          )}

        </section>

      </div>

      {/* Fort Detail Modal */}
      {selectedFort && (
        <div
          onClick={() => setSelectedFort(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 5, 2, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              border: '1.5px solid var(--gold-500)'
            }}
          >
            {/* Modal Image Header */}
            <div style={{ position: 'relative', height: '280px', background: '#1c0a05', overflow: 'hidden', borderTopLeftRadius: '19px', borderTopRightRadius: '19px' }}>
              {selectedFort.image ? (
                <img
                  src={selectedFort.image}
                  alt={selectedFort.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3d9b1', flexDirection: 'column' }}>
                  <span style={{ fontSize: '3rem' }}>🏛️</span>
                  <span>अस्सल छायाचित्र</span>
                </div>
              )}
              
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(20,5,2,0.92) 0%, rgba(20,5,2,0.2) 60%, rgba(0,0,0,0.4) 100%)'
              }} />

              {/* Close Button */}
              <button
                onClick={() => setSelectedFort(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                ✕
              </button>

              {/* Title & Badges on Image */}
              <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', color: '#FFF' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'var(--gold-500)',
                    color: '#2b1108',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    {selectedFort.type === 'giridurg' ? '⛰️ गिरीदुर्ग' : (selectedFort.type === 'jaladurg' ? '🌊 जलदुर्ग' : '🏰 भुईकोट')}
                  </span>
                  {selectedFort.isUnesco && (
                    <span style={{
                      background: '#d97706',
                      color: '#FFF',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      ★ UNESCO World Heritage
                    </span>
                  )}
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    {selectedFort.division}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Baloo 2', color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {selectedFort.marathiName || selectedFort.name}
                </h2>
                {selectedFort.marathiName && selectedFort.name !== selectedFort.marathiName && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem', color: '#f5d5b0', fontWeight: 500 }}>
                    {selectedFort.name}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Quick Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>📍 जिल्हा</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--maroon-950)', marginTop: '2px' }}>
                    {selectedFort.district}
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>🏛️ प्रशासकीय विभाग</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--maroon-950)', marginTop: '2px' }}>
                    {selectedFort.division}
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>📐 किल्ला प्रकार</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--maroon-950)', marginTop: '2px' }}>
                    {selectedFort.type === 'giridurg' ? 'गिरीदुर्ग' : (selectedFort.type === 'jaladurg' ? 'जलदुर्ग' : 'भुईकोट')}
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>⛰️ उंची / स्थान</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--maroon-950)', marginTop: '2px' }}>
                    {selectedFort.height || 'ऐतिहासिक तटबंदी'}
                  </div>
                </div>
              </div>

              {/* Rich Historical Information & Details */}
              {(() => {
                const details = FORT_HISTORICAL_DETAILS[selectedFort.id] || {};
                const historyText = details.history || selectedFort.desc || `${selectedFort.marathiName || selectedFort.name} हा महाराष्ट्र राज्यातील ${selectedFort.district} जिल्ह्यातील एक ऐतिहासिक व महत्त्वाचा किल्ला आहे. सह्याद्रीच्या डोंगररांगांमध्ये आणि मराठा साम्राज्याच्या गौरवशाली इतिहासात या किल्ल्याला अनन्यसाधारण स्थान लाभले आहे.`;
                const monumentsList = details.monuments || [];
                const strategicValue = details.strategicImportance;
                const bestSeason = details.bestTimeToVisit;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '22px' }}>
                    {/* Detailed History */}
                    <div style={{
                      background: 'linear-gradient(to bottom, #FFFDF8, #FFF9ED)',
                      padding: '18px 20px',
                      borderRadius: '12px',
                      border: '1px solid #FED7AA',
                      boxShadow: '0 2px 6px rgba(154, 52, 18, 0.05)'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: 'var(--maroon-900)', fontFamily: 'Baloo 2', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📜</span> ऐतिहासिक महत्त्व व सविस्तर माहिती:
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.96rem', color: '#2b1108', lineHeight: 1.8, textAlign: 'justify' }}>
                        {historyText}
                      </p>
                    </div>

                    {/* Key Monuments & Attractions */}
                    {monumentsList.length > 0 && (
                      <div style={{
                        background: '#FAFAFA',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--maroon-900)', fontFamily: 'Baloo 2', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🏰</span> गडावरील प्रमुख वास्तू, अवशेष व आकर्षणे:
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '8px'
                        }}>
                          {monumentsList.map((m, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              fontSize: '0.9rem',
                              color: 'var(--ink)',
                              background: '#FFFFFF',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #ECECEC'
                            }}>
                              <span style={{ color: 'var(--maroon-700)', fontWeight: 'bold' }}>✓</span>
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strategic Importance & Best Time Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '12px'
                    }}>
                      {strategicValue && (
                        <div style={{
                          background: '#FEF2F2',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1px solid #FEE2E2'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🛡️</span> लष्करी व सामरिक महत्त्व
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#450A0A', lineHeight: 1.6 }}>
                            {strategicValue}
                          </div>
                        </div>
                      )}

                      {bestSeason && (
                        <div style={{
                          background: '#ECFDF5',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1px solid #D1FAE5'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🌤️</span> भेट देण्यासाठी सर्वोत्तम वेळ
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#064E3B', lineHeight: 1.6 }}>
                            {bestSeason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Photo Source / License if available */}
              {selectedFort.imageSource && (
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '20px', padding: '8px 12px', background: '#fafafa', borderRadius: '6px' }}>
                  <span>📷 छायाचित्र स्रोत: </span>
                  <a href={selectedFort.imageSource} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--maroon-800)', wordBreak: 'break-all' }}>
                    Wikimedia Commons ({selectedFort.imageLicense || 'Verified'})
                  </a>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFort.name + ' ' + selectedFort.district + ' Maharashtra')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  🗺️ Google Maps वर पहा
                </a>
                <button
                  onClick={() => setSelectedFort(null)}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: 'var(--maroon-900)',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
