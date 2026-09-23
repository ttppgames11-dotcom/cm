import React, { useState } from 'react';

const buildersData = [
  {
    id: 1,
    name: 'साई कन्स्ट्रक्शन्स',
    specialty: 'गृहनिर्माण प्रकल्प तज्ज्ञ',
    category: 'गृहनिर्माण',
    city: 'पुणे, महाराष्ट्र',
    projects: 'साई हाइट्स (कोथरूड), साई रेसिडेन्सी (बाणेर)',
    experience: '१५+ वर्षे',
    rera: 'P52100018942',
    icon: '🏢',
    phone: '+91 98220 11445',
    desc: 'पुणे परिसरातील विश्वासार्ह व दर्जेदार गृहप्रकल्प उभारणीतील अग्रगण्य मराठा ब्रँड.'
  },
  {
    id: 2,
    name: 'शिवनेरी बिल्डर्स',
    specialty: 'गुणवत्तेची हमी आमची ओळख',
    category: 'लक्झरी प्रोजेक्ट्स',
    city: 'कोल्हापूर, महाराष्ट्र',
    projects: 'शिवनेरी व्हिला, शिवनेरी प्राईम',
    experience: '२०+ वर्षे',
    rera: 'P52800022331',
    icon: '🏰',
    phone: '+91 94220 55667',
    desc: 'पारंपरिक भक्कम पाया आणि आधुनिक वास्तुकलेचा संगम साधणारे कोल्हापूरचे नामांकित बिल्डर्स.'
  },
  {
    id: 3,
    name: 'राजवीर डेव्हलपर्स',
    specialty: 'स्वप्नातील घर, आमची जबाबदारी',
    category: 'गृहनिर्माण',
    city: 'नाशिक, महाराष्ट्र',
    projects: 'राजवीर पार्क, गंगापूर रोड प्रोजेक्ट',
    experience: '१२+ वर्षे',
    rera: 'P51600034120',
    icon: '🏡',
    phone: '+91 98500 77889',
    desc: 'मध्यमवर्गीय आणि उच्च मध्यमवर्गीय परिवारांसाठी परवडणारी दर्जेदार घरे.'
  },
  {
    id: 4,
    name: 'महादेव कन्स्ट्रक्शन्स',
    specialty: 'व्यावसायिक प्रकल्प तज्ज्ञ',
    category: 'व्यावसायिक प्रकल्प',
    city: 'मुंबई, महाराष्ट्र',
    projects: 'महादेव बिझनेस बे, बांद्रा आयटी पार्क',
    experience: '२५+ वर्षे',
    rera: 'P51800045671',
    icon: '🏬',
    phone: '+91 98200 88990',
    desc: 'मुंबई महानगर क्षेत्रातील हाय-राइज व्यावसायिक कॉम्प्लेक्स व कॉर्पोरेट ऑफिस स्पेसेसचे तज्ज्ञ.'
  },
  {
    id: 5,
    name: 'भूमी बिल्डर्स',
    specialty: 'निर्माणसौंदर्य आधुनिकता',
    category: 'टाउनशिप',
    city: 'नागपूर, महाराष्ट्र',
    projects: 'भूमी ग्रीन सिटी टाउनशिप, मिहान लगत',
    experience: '१८+ वर्षे',
    rera: 'P50500012984',
    icon: '🌆',
    phone: '+91 97650 44332',
    desc: 'विदर्भातील सर्वात मोठी हरित टाउनशिप व निसर्गरम्य परिसर निर्मिती.'
  },
  {
    id: 6,
    name: 'जगदंब इन्फ्रा',
    specialty: 'भक्कम पाया, सुरक्षित उद्या',
    category: 'इंडस्ट्रियल',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    projects: 'जगदंब इंडस्ट्रियल पार्क, वाळूज',
    experience: '१४+ वर्षे',
    rera: 'P51500078901',
    icon: '🏗️',
    phone: '+91 94230 66554',
    desc: 'उद्योग, गोदामांसाठी प्री-इंजिनिअरिंग इंडस्ट्रियल शेड व फॅक्टरी युनिट्स निर्मिती.'
  },
  {
    id: 7,
    name: 'वीर बिल्डर्स',
    specialty: 'नवीन विचार, भव्य निर्माण',
    category: 'लक्झरी प्रोजेक्ट्स',
    city: 'ठाणे, महाराष्ट्र',
    projects: 'वीर सॉलिटेअर, घोडबंदर रोड',
    experience: '१६+ वर्षे',
    rera: 'P51700099432',
    icon: '💎',
    phone: '+91 98900 22113',
    desc: 'ठाणे व नवी मुंबईमधील प्रीमियम लक्झरी अपार्टमेंट्स आणि क्लबहाऊस सुविधा.'
  },
  {
    id: 8,
    name: 'स्वराज कन्स्ट्रक्शन्स',
    specialty: 'आपले घर, आपला अभिमान',
    category: 'गृहनिर्माण',
    city: 'सातारा, महाराष्ट्र',
    projects: 'स्वराज हाइट्स, अजिंक्यतारा पायथा',
    experience: '१०+ वर्षे',
    rera: 'P52700033118',
    icon: '🚩',
    phone: '+91 98224 99001',
    desc: 'छत्रपतींच्या पावन भूमीत १००% कायदेशीर व रेरा नोंदणीकृत गृहप्रकल्प.'
  }
];

const categories = [
  'सर्व बिल्डर्स',
  'गृहनिर्माण',
  'लक्झरी प्रोजेक्ट्स',
  'व्यावसायिक प्रकल्प',
  'टाउनशिप',
  'इंडस्ट्रियल',
  'इतर'
];

export default function BuildersDirectoryPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व बिल्डर्स');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const filtered = buildersData.filter((b) => {
    const matchCat = selectedCat === 'सर्व बिल्डर्स' || b.category === selectedCat;
    const matchSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.projects.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="builders-directory-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(191, 54, 12, 0.90) 0%, rgba(216, 67, 21, 0.88) 100%), url("/assets/images/generated/maratha_builders_hero.jpg") center/cover no-repeat',
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
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.2rem', color: '#FFE082', fontWeight: 600, margin: '0 0 6px' }}>
            मराठा बांधवांच्या यशाची भव्य वास्तू, मजबूत भविष्याची पायरी !
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा बिल्डर्स – विश्वास, गुणवत्ता आणि अभिमान
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '650px' }}>
            घर ते स्वप्न नाही... आमची ओळख आहे ! महाराष्ट्रातील विश्वासार्ह मराठा बिल्डर्स आणि डेव्हलपर्स || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#BF360C',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ＋ आपला प्रोफाइल जोडा
            </button>
            <a
              href="#builders-list"
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
              बिल्डर्स यादी पहा ({buildersData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div id="builders-list" style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          border: '1px solid #EADBCE'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="नाव, कंपनी नाव, शहर शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                border: '1.5px solid #D7CCC8',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '2px solid #BF360C' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#BF360C' : '#FFFFFF',
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

      {/* Builders Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((b) => (
            <div
              key={b.id}
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
                background: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 100%)',
                padding: '24px 20px',
                borderBottom: '1px solid #FFAB91',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                }}>
                  {b.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#BF360C', margin: '0 0 4px' }}>
                    {b.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: '#D84315', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {b.category}
                  </span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ color: '#D84315', fontWeight: 700 }}>
                  ✨ {b.specialty}
                </div>
                <div>
                  <strong>📍 स्थान:</strong> {b.city}
                </div>
                <div>
                  <strong>🏗️ प्रमुख प्रकल्प:</strong> {b.projects}
                </div>
                <div>
                  <strong>📜 RERA क्र.:</strong> <span style={{ color: '#2E7D32', fontWeight: 700 }}>{b.rera}</span>
                </div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: '4px' }}>
                  {b.desc}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedBuilder(b)}
                  style={{
                    flex: 1,
                    background: '#BF360C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  प्रोफाइल पहा
                </button>
                <button
                  onClick={() => alert(`${b.name} संपर्क क्रमांक: ${b.phone}`)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #BF360C',
                    background: '#FFFFFF',
                    color: '#BF360C',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📞 कॉल
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Highlight */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #D84315 0%, #BF360C 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
            आपले बांधकाम व्यवसाय Connect Maratha वर प्रदर्शित करा
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.9 }}>
            विश्वास वाढवा, अधिक ग्राहक मिळवा आणि आपल्या ब्रँडची ओळख वाढवा.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFD54F',
              color: '#BF360C',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            आपला प्रोफाइल जोडा
          </button>
        </div>
      </section>

      {/* Modal: Builder Detail */}
      {selectedBuilder && (
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
              onClick={() => setSelectedBuilder(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.8rem' }}>{selectedBuilder.icon}</span>
              <div>
                <h2 style={{ color: '#BF360C', margin: '0 0 4px', fontSize: '1.5rem' }}>{selectedBuilder.name}</h2>
                <span style={{ background: '#FFCCBC', color: '#BF360C', padding: '3px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}>
                  {selectedBuilder.category} • {selectedBuilder.city}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong>वैशिष्ट्य:</strong> {selectedBuilder.specialty}</div>
              <div><strong>चालू व पूर्ण प्रकल्प:</strong> {selectedBuilder.projects}</div>
              <div><strong>अनुभव:</strong> {selectedBuilder.experience}</div>
              <div><strong>MahaRERA Reg:</strong> {selectedBuilder.rera}</div>
              <div><strong>परिचय:</strong> {selectedBuilder.desc}</div>
              <div><strong>संपर्क:</strong> {selectedBuilder.phone}</div>
            </div>
            <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert(`${selectedBuilder.name} च्या प्रतिनिधींशी चर्चा करण्यासाठी कॉल केला जात आहे: ${selectedBuilder.phone}`)}
                style={{ flex: 1, background: '#BF360C', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                📞 त्वरित संपर्क करा
              </button>
              <button
                onClick={() => setSelectedBuilder(null)}
                style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Builder Profile */}
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#BF360C', margin: '0 0 6px' }}>
              🏗️ बिल्डर्स / डेव्हलपर नोंदणी
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              आपले कन्स्ट्रक्शन फर्म Connect Maratha नेटवर्कवर लिस्ट करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>माहिती यशस्वीरित्या नोंदवली गेली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>रेरा व फर्म पडताळणीनंतर प्रोफाइल सक्रिय होईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#BF360C', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="फर्म / कंपनीचे नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      {categories.filter(c => c !== 'सर्व बिल्डर्स').map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input required placeholder="शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <input placeholder="RERA नोंदणी क्रमांक" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required type="tel" placeholder="अधिकृत मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input placeholder="चालू प्रकल्पांची नावे" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <button type="submit" style={{ background: '#BF360C', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    फर्म सबमिट करा
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
