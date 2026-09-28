import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FORTS_DATABASE } from '../../data/forts350Data';

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
              प्रत्येक किल्ला जपणारा प्रत्येक मावळा आमचा अभिमान! महाराष्ट्रातील सर्व १७१ ऐतिहासिक गडकोटांचे अस्सल छायाचित्रे आणि नावासह संपूर्ण डिजिटल दालन.
            </p>

            <div className="stats-glass" style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="stat-glass"><b>{FORTS_DATABASE.length}</b><span>सर्व गडकोट एकाच ठिकाणी</span></div>
              <div className="stat-glass"><b>२१</b><span>जिल्हे व्याप्ती</span></div>
              <div className="stat-glass"><b>१२</b><span>UNESCO नामांकित किल्ले</span></div>
              <div className="stat-glass"><b>४००+ वर्षे</b><span>अजिंक्य वारसा</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '36px 24px', margin: '0 auto' }}>
        
        {/* Search & Administrative Navigation */}
        <section style={{ marginBottom: '28px' }}>
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
                  {selectedFort.name}
                </h2>
                {selectedFort.englishName && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem', color: '#f5d5b0', fontWeight: 500 }}>
                    {selectedFort.englishName} Fort
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

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--maroon-900)', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>
                  📜 ऐतिहासिक महत्त्व व माहिती:
                </h4>
                <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--ink)', lineHeight: 1.7, background: 'var(--paper)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  {selectedFort.desc || `${selectedFort.name} हा महाराष्ट्र राज्यातील ${selectedFort.district} जिल्ह्यातील एक ऐतिहासिक व महत्त्वाचा किल्ला आहे. सह्याद्रीच्या डोंगररांगांमध्ये आणि मराठा साम्राज्याच्या गौरवशाली इतिहासात या किल्ल्याला अनन्यसाधारण स्थान लाभले आहे.`}
                </p>
              </div>

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
