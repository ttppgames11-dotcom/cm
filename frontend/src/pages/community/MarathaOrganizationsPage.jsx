import React, { useState } from 'react';

const orgsData = [
  {
    id: 1,
    name: 'अखिल भारतीय मराठा महासंघ',
    category: 'सामाजिक',
    established: '१९८१',
    hq: 'मुंबई / पुणे, महाराष्ट्र',
    presence: 'अखिल भारत व विदेश',
    members: '३५ लाख+ सदस्य',
    focus: 'मराठा आरक्षण, आर्थिक व शैक्षणिक हक्क, समाज प्रबोधन',
    icon: '🚩',
    contact: '+91 22 2430 1674'
  },
  {
    id: 2,
    name: 'मराठा सेवा संघ',
    category: 'सामाजिक',
    established: '१९९०',
    hq: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    presence: 'संपूर्ण महाराष्ट्र',
    members: '१५ लाख+ सदस्य',
    focus: 'शिव-शाहू-फुले-आंबेडकर विचारप्रसार, जिजाऊ ब्रिगेड, संभाजी ब्रिगेड',
    icon: '⚔️',
    contact: '+91 240 233 4455'
  },
  {
    id: 3,
    name: 'मराठा युवा मंच',
    category: 'युवक',
    established: '२०१२',
    hq: 'पुणे, महाराष्ट्र',
    presence: '३६ जिल्हे',
    members: '८ लाख+ युवक',
    focus: 'युवा रोजगार, करिअर मेन्टॉरशिप, रक्तदान शिबिरे व गड-किल्ले स्वच्छता',
    icon: '⚡',
    contact: '+91 98220 99887'
  },
  {
    id: 4,
    name: 'मराठा शिक्षण संस्था महासंघ',
    category: 'शैक्षणिक',
    established: '१९९५',
    hq: 'कोल्हापूर, महाराष्ट्र',
    presence: '२२ जिल्हे',
    members: '२५०+ शिक्षण संस्था',
    focus: 'वसतिगृहे, गरजू विद्यार्थ्यांना मोफत शिक्षण व स्पर्धा परीक्षा केंद्र',
    icon: '🎓',
    contact: '+91 231 265 1234'
  },
  {
    id: 5,
    name: 'मराठा महिला विकास संघटना',
    category: 'महिला',
    established: '२००८',
    hq: 'नाशिक, महाराष्ट्र',
    presence: '२८ जिल्हे',
    members: '४ लाख+ भगिनी',
    focus: 'महिला बचत गट सक्षमीकरण, कायदेशीर मदत, उद्योग उभारणी',
    icon: '👑',
    contact: '+91 98500 11223'
  },
  {
    id: 6,
    name: 'मराठा उद्योग व्यवसाय संघ',
    category: 'व्यावसायिक',
    established: '२०१५',
    hq: 'मुंबई / ठाणे, महाराष्ट्र',
    presence: 'राज्यव्यापी व जागतिक',
    members: '५०,०००+ उद्योजक',
    focus: 'B2B बिझनेस नेटवर्किंग, स्टार्टअप सीड फंडिंग, शासकीय योजना साहाय्य',
    icon: '💼',
    contact: '+91 22 2580 4455'
  },
  {
    id: 7,
    name: 'मराठा सांस्कृतिक परिषद',
    category: 'सांस्कृतिक',
    established: '२००२',
    hq: 'सातारा, महाराष्ट्र',
    presence: 'अखिल महाराष्ट्र',
    members: '२ लाख+ कार्यकर्ते',
    focus: 'शिवजयंती महामहोत्सव समन्वय, गड-किल्ले संवर्धन व शाहिरी परंपरा जतन',
    icon: '🪘',
    contact: '+91 94220 33221'
  },
  {
    id: 8,
    name: 'मराठा क्रीडा प्रोत्साहन मंडळ',
    category: 'क्रीडा',
    established: '२०१६',
    hq: 'सांगली, महाराष्ट्र',
    presence: 'महाराष्ट्र व राष्ट्रीय',
    members: '१ लाख+ खेळाडू',
    focus: 'कुस्ती, कबड्डी, मल्लखांब खेळाडूंना आर्थिक मदत व ऑलिम्पिक तयारी',
    icon: '🤼',
    contact: '+91 97650 88776'
  }
];

const categories = [
  'सर्व संघटना',
  'सामाजिक',
  'शैक्षणिक',
  'युवक',
  'महिला',
  'व्यावसायिक',
  'सांस्कृतिक',
  'क्रीडा',
  'इतर'
];

export default function MarathaOrganizationsPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व संघटना');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const filtered = orgsData.filter((org) => {
    const matchCat = selectedCat === 'सर्व संघटना' || org.category === selectedCat;
    const matchSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.hq.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.focus.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="organizations-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(183, 28, 28, 0.90) 0%, rgba(216, 67, 21, 0.88) 100%), url("/assets/images/maratha-samrajya.jpg") center/cover no-repeat',
        color: '#FFFFFF',
        padding: '50px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.18)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#FFD54F'
          }}>
            🚩 CONNECT मराठा — एक लढा! एक संघर्ष! एक समाज! | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.25rem', color: '#FFE082', fontWeight: 600, margin: '0 0 6px' }}>
            संघटित मराठा ! सशक्त मराठा !!
          </p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा संघटना – एकत्र येऊ, प्रगती करू !
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '680px' }}>
            सन्मान, स्वाभिमान आणि हक्कासाठी मराठा समाज एकत्र आहे. महाराष्ट्रातील सर्व अधिकृत संघटनांची सूची.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#B71C1C',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ＋ आपली संघटना नोंदवा
            </button>
            <a
              href="#orgs-list"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              नोंदणीकृत संघटना पहा ({orgsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div id="orgs-list" style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          border: '1px solid #EADBCE'
        }}>
          <input
            type="text"
            placeholder="संघटना नाव, कार्यक्षेत्र किंवा मुख्यालय शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1.5px solid #D7CCC8',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '14px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '2px solid #B71C1C' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#B71C1C' : '#FFFFFF',
                  color: selectedCat === cat ? '#FFFFFF' : '#424242',
                  fontSize: '0.88rem',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((org) => (
            <div
              key={org.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8DFD8',
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                padding: '24px 20px',
                borderBottom: '1px solid #EF9A9A',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: '#B71C1C',
                  color: '#FFD54F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: '0 4px 10px rgba(183,28,28,0.2)'
                }}>
                  {org.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 4px' }}>
                    {org.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: '#D32F2F', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {org.category} • स्था: {org.established}
                  </span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div>
                  <strong>📍 मुख्यालय:</strong> {org.hq}
                </div>
                <div>
                  <strong>🌍 विस्तार:</strong> {org.presence}
                </div>
                <div>
                  <strong>👥 सदस्य संख्या:</strong> <span style={{ color: '#2E7D32', fontWeight: 700 }}>{org.members}</span>
                </div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: '4px' }}>
                  <strong>उद्दिष्ट:</strong> {org.focus}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedOrg(org)}
                  style={{
                    flex: 1,
                    background: '#B71C1C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  संघटना माहिती
                </button>
                <button
                  onClick={() => alert(`${org.name} संपर्क: ${org.contact}`)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #B71C1C',
                    background: '#FFFFFF',
                    color: '#B71C1C',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📞 संपर्क
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Banner */}
      <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #B71C1C 0%, #7F0000 100%)',
          borderRadius: '16px',
          padding: '40px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 20px', color: '#FFD54F' }}>
            संघटित मराठा, सक्षम मराठा, समृद्ध मराठा
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>५००+</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>नोंदणीकृत संघटना</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>१ लाख+</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>सक्रिय पदाधिकारी</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>३६</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>जिल्ह्यांमध्ये प्रत्यक्ष उपस्थिती</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>१</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>एकच ध्येय — समाजहित व प्रगती</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Org Detail */}
      {selectedOrg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedOrg(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedOrg.icon}</span>
              <div>
                <h2 style={{ color: '#B71C1C', margin: '0 0 4px', fontSize: '1.4rem' }}>{selectedOrg.name}</h2>
                <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '3px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}>
                  {selectedOrg.category} • स्थापना: {selectedOrg.established}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>मुख्यालय:</strong> {selectedOrg.hq}</div>
              <div><strong>विस्तार:</strong> {selectedOrg.presence}</div>
              <div><strong>सदस्य:</strong> {selectedOrg.members}</div>
              <div><strong>ध्येय व उपक्रम:</strong> {selectedOrg.focus}</div>
              <div><strong>अधिकृत संपर्क:</strong> {selectedOrg.contact}</div>
            </div>
            <button
              onClick={() => setSelectedOrg(null)}
              style={{ width: '100%', marginTop: '20px', background: '#B71C1C', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Organization */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowAddModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 6px' }}>
              🚩 आपली संघटना नोंदवा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              Connect Maratha व्यासपीठावर आपल्या संघटनेचा अधिकृत समावेश करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>संघटना नोंदणी प्राप्त झाली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>पडताळणी समितीकडून तपासणीनंतर अधिकृत मान्यता दिली जाईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="संघटनेचे पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      {categories.filter(c => c !== 'सर्व संघटना').map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input required placeholder="मुख्यालय / शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input placeholder="स्थापना वर्ष" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input required type="tel" placeholder="अध्यक्ष / सचिव मोबाईल *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <textarea placeholder="संघटनेची मुख्य ध्येये व कार्यक्षेत्र" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <button type="submit" style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    संघटना नोंदणी सादर करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
