import React, { useState } from 'react';

const officersData = [
  {
    id: 1,
    service: 'IAS',
    name: 'श्री. आदित्य देशमुख',
    image: '/assets/images/officers/officer_tukaram.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 2004)',
    designation: 'मुख्य सचिव, महाराष्ट्र शासन',
    location: 'मंत्रालय, मुंबई',
    department: 'सामान्य प्रशासन व नियोजन',
    category: 'IAS अधिकारी',
    icon: '🏛️',
    contribution: 'डिजिटल गव्हर्नन्स आणि शेतकरी कल्याण योजनांची प्रभावी अंमलबजावणी.'
  },
  {
    id: 2,
    service: 'IPS',
    name: 'श्री. विश्वास पाटील',
    image: '/assets/images/officers/officer_vishwas.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 2008)',
    designation: 'महानिरीक्षक पोलिस (DGP कार्यालय)',
    location: 'महाराष्ट्र राज्य मुख्यालय, मुंबई',
    department: 'गृह व कायदा सुव्यवस्था',
    category: 'IPS अधिकारी',
    icon: '⭐',
    contribution: 'सायबर गुन्हेगारी नियंत्रण आणि महिला सुरक्षेसाठी विशेष टास्क फोर्स उभारणी.'
  },
  {
    id: 3,
    service: 'IFS',
    name: 'सौ. अश्विनी भोसले',
    image: '/assets/images/officers/officer_ashwini.jpg',
    cadre: 'भारतीय वन सेवा (IFS - 2011)',
    designation: 'प्रधान मुख्य वनसंरक्षक (PCCF)',
    location: 'नागपूर / सह्याद्री वनक्षेत्र, महाराष्ट्र',
    department: 'पर्यावरण व वन संवर्धन',
    category: 'IFS अधिकारी',
    icon: '🌲',
    contribution: 'सह्याद्री व्याघ्र प्रकल्प संवर्धन व गड-किल्ले परिसर हरितीकरण प्रकल्प.'
  },
  {
    id: 4,
    service: 'राज्यसेवा',
    name: 'श्री. सचिन पवार',
    image: '/assets/images/officers/officer_mahesh.jpg',
    cadre: 'महाराष्ट्र नागरी सेवा (MPSC State Service)',
    designation: 'जिल्हाधिकारी व जिल्हा दंडाधिकारी',
    location: 'पुणे, महाराष्ट्र',
    department: 'महसूल व जिल्हा प्रशासन',
    category: 'राज्यसेवा अधिकारी',
    icon: '⚖️',
    contribution: 'जिल्ह्यातील पाणीटंचाई निवारण, जमीन फेरफार गतिमानता व युवा रोजगार उपक्रम.'
  },
  {
    id: 5,
    service: 'अर्थ व महसूल',
    name: 'सौ. सुजाता शिंदे',
    image: '/assets/images/officers/officer_sujata.jpg',
    cadre: 'भारतीय महसूल सेवा / राज्य कर संवर्ग',
    designation: 'आयुक्त, राज्य कर विभाग (GST)',
    location: 'महाराष्ट्र राज्य, मुंबई',
    department: 'वित्त व कर संकलन',
    category: 'केंद्र शासन',
    icon: '📊',
    contribution: 'व्यापाऱ्यांसाठी सुलभ कर प्रणाली व पारदर्शक महसूल वाढ मोहिमा.'
  },
  {
    id: 6,
    service: 'शिक्षण प्रशासन',
    name: 'सौ. प्राजक्ता गायकवाड',
    cadre: 'महाराष्ट्र शिक्षण सेवा (Class-I)',
    designation: 'संचालक, माध्यमिक व उच्च माध्यमिक शिक्षण',
    location: 'पुणे / महाराष्ट्र राज्य',
    department: 'शालेय शिक्षण व क्रीडा',
    category: 'राज्यसेवा अधिकारी',
    icon: '🎓',
    contribution: 'मराठी शाळांचे आधुनिकीकरण व ग्रामीण विद्यार्थ्यांसाठी शिष्यवृत्ती विस्तार.'
  },
  {
    id: 7,
    service: 'नगर विकास',
    name: 'श्री. अमोल जाधव',
    cadre: 'भारतीय प्रशासकीय सेवा / म्हाडा आयुक्त',
    designation: 'महानगरपालिका अतिरिक्त आयुक्त',
    location: 'मुंबई महानगरपालिका (BMC)',
    department: 'नगर विकास व पायाभूत सुविधा',
    category: 'IAS अधिकारी',
    icon: '🏗️',
    contribution: 'स्मार्ट सिटी प्रकल्प व अर्बन ट्रॅफिक मॅनेजमेंट प्रकल्पांचे नेतृत्व.'
  },
  {
    id: 8,
    service: 'ग्रामीण विकास',
    name: 'सौ. वैशाली मोरे',
    cadre: 'महाराष्ट्र नागरी सेवा (Class-I)',
    designation: 'मुख्य कार्यकारी अधिकारी (CEO)',
    location: 'जिल्हा परिषद, नाशिक',
    department: 'ग्रामविकास व पंचायत राज',
    category: 'राज्यसेवा अधिकारी',
    icon: '🌾',
    contribution: 'महिला स्वयंसहाय्यता गट सक्षमीकरण व आदर्श गाव योजना यशस्वी अंमलबजावणी.'
  }
];

const categories = [
  'सर्व अधिकारी',
  'IAS अधिकारी',
  'IPS अधिकारी',
  'IFS अधिकारी',
  'राज्यसेवा अधिकारी',
  'केंद्र शासन',
  'इतर'
];

export default function GovernmentOfficersPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व अधिकारी');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const filtered = officersData.filter((o) => {
    const matchCat = selectedCat === 'सर्व अधिकारी' || o.category === selectedCat;
    const matchSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="government-officers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.90) 0%, rgba(40, 53, 147, 0.88) 100%), url("/assets/images/connect-maratha-council.jpg") center/cover no-repeat',
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
            समाजाच्या प्रगतीसाठी, शासन सेवेत कार्यरत
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 10px' }}>
            आपले अभिमानास्पद शासकीय अधिकारी !
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '680px' }}>
            प्रामाणिक सेवा, निष्ठावान नेतृत्व, समाज आणि राष्ट्रासाठी समर्पित ! || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#1A237E',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ＋ अधिकारी नोंदणी / माहिती जोडा
            </button>
            <a
              href="#officers-list"
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
              अधिकारी यादी पहा ({officersData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div id="officers-list" style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
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
              placeholder="नाव, पद, विभाग, शहर शोधा..."
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
                  border: selectedCat === cat ? '2px solid #1A237E' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#1A237E' : '#FFFFFF',
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

      {/* Officers Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((o) => (
            <div
              key={o.id}
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
                background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
                padding: '24px 20px',
                borderBottom: '1px solid #9FA8DA',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                {o.image ? (
                  <img
                    src={o.image}
                    alt={o.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '2px solid #1A237E',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: '#1A237E',
                    color: '#FFD54F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {o.service}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A237E', margin: '0 0 4px' }}>
                    {o.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: '#283593', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {o.cadre}
                  </span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ color: '#C2185B', fontWeight: 700 }}>
                  🎖️ {o.designation}
                </div>
                <div>
                  <strong>📍 पोस्टिंग:</strong> {o.location}
                </div>
                <div>
                  <strong>🏛️ विभाग:</strong> {o.department}
                </div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: '4px' }}>
                  <strong>महत्त्वाचे कार्य:</strong> {o.contribution}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                <button
                  onClick={() => setSelectedOfficer(o)}
                  style={{
                    width: '100%',
                    background: '#1A237E',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  अधिकारी तपशील पहा
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Highlight */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
            आपल्या समाजाचा अभिमान वाढवा !
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.9 }}>
            आपल्याला माहिती असलेले कर्तव्यदक्ष शासकीय अधिकारी Connect Maratha वर जोडा आणि नवीन पिढीला प्रेरणा द्या.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFD54F',
              color: '#1A237E',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            अधिकारी प्रोफाइल जोडा →
          </button>
        </div>
      </section>

      {/* Modal: Officer Detail */}
      {selectedOfficer && (
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
              onClick={() => setSelectedOfficer(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedOfficer.icon}</span>
              <h2 style={{ color: '#1A237E', margin: '8px 0 4px', fontSize: '1.5rem' }}>{selectedOfficer.name}</h2>
              <span style={{ background: '#C5CAE9', color: '#1A237E', padding: '3px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.86rem' }}>
                {selectedOfficer.cadre}
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong>सध्याचे पद:</strong> {selectedOfficer.designation}</div>
              <div><strong>कार्यक्षेत्र:</strong> {selectedOfficer.location}</div>
              <div><strong>मंत्रालय / विभाग:</strong> {selectedOfficer.department}</div>
              <div><strong>योगदान:</strong> {selectedOfficer.contribution}</div>
            </div>
            <button
              onClick={() => setSelectedOfficer(null)}
              style={{ width: '100%', marginTop: '20px', background: '#1A237E', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Officer */}
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A237E', margin: '0 0 6px' }}>
              🏛️ शासकीय अधिकारी माहिती जोडा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              समाजातील प्रेरणादायी अधिकाऱ्यांची माहिती Connect Maratha वर सादर करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>माहिती सादर झाली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>प्रशासकीय पडताळणीनंतर प्रोफाइल यादीत समाविष्ट केली जाईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#1A237E', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="अधिकाऱ्यांचे नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option>IAS अधिकारी</option>
                      <option>IPS अधिकारी</option>
                      <option>IFS अधिकारी</option>
                      <option>राज्यसेवा अधिकारी</option>
                      <option>महसूल व पोलीस</option>
                      <option>इतर</option>
                    </select>
                    <input required placeholder="सध्याचे पद (Designation) *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <input required placeholder="पोस्टिंगचे ठिकाण / शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <textarea placeholder="उल्लेखनीय कामगिरी व कार्य" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <button type="submit" style={{ background: '#1A237E', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    माहिती पाठवा
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
