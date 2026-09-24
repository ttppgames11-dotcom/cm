import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const mfgData = [
  {
    id: 1,
    name: 'श्रीशक्ती इंडस्ट्रीज प्रा. लि.',
    sector: 'मशीनरी मॅन्युफॅक्चरिंग',
    category: 'मशीनरी',
    city: 'पुणे, महाराष्ट्र',
    products: 'CNC लेथ मशीन, इंडस्ट्रियल गिअर्स, हायड्रॉलिक प्रेसेस',
    export: '२०+ देशांत निर्यात (जर्मनी, यूएई, अमेरिका)',
    employees: '३५०+ कामगार',
    icon: '⚙️'
  },
  {
    id: 2,
    name: 'सह्याद्री ऑटोमोटिव्ह प्रा. लि.',
    sector: 'ऑटो पार्ट्स & कॉम्पोनंट्स',
    category: 'ऑटोमोबाईल',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    products: 'इंजिन वॉल्व्ह, ब्रेक ड्रम, सस्पेन्शन सिस्टिम्स',
    export: 'टाटा, महिंद्रा व बजाज यांचे OEM सप्लायर',
    employees: '५००+ कामगार',
    icon: '🚗'
  },
  {
    id: 3,
    name: 'विजय इलेक्ट्रिकल्स प्रा. लि.',
    sector: 'इलेक्ट्रिकल उपकरणे & ट्रान्सफॉर्मर्स',
    category: 'इलेक्ट्रिकल',
    city: 'नाशिक, महाराष्ट्र',
    products: 'पॉवर ट्रान्सफॉर्मर, सोलर इन्व्हर्टर, कंट्रोल पॅनेल्स',
    export: 'महावितरण व आंतरराष्ट्रीय ऊर्जा प्रकल्प',
    employees: '२८०+ कामगार',
    icon: '⚡'
  },
  {
    id: 4,
    name: 'नेचर प्युअर फूड्स प्रा. लि.',
    sector: 'फूड प्रोसेसिंग & कृषी प्रक्रिया',
    category: 'फूड & बेव्हरेज',
    city: 'कोल्हापूर, महाराष्ट्र',
    products: 'गूळ पावडर, काजू, फळांचे पल्प, ऑर्गेनिक मसाले',
    export: 'यूरोप व आखाती देशांत थेट निर्यात',
    employees: '१८०+ शेतकरी व कामगार',
    icon: '🌾'
  },
  {
    id: 5,
    name: 'शिवनेरी पॉलिमर्स प्रा. लि.',
    sector: 'प्लास्टिक & पॅकेजिंग सोल्युशन्स',
    category: 'प्लास्टिक',
    city: 'सांगली, महाराष्ट्र',
    products: 'ड्रिप इरिगेशन पाईप्स, इंडस्ट्रियल कंटेनर्स, मोल्ड्स',
    export: 'पश्चिम भारत व आफ्रिकन देश',
    employees: '२२०+ कामगार',
    icon: '📦'
  }
];

const categories = [
  'सर्व श्रेणी',
  'मशीनरी',
  'ऑटोमोबाईल',
  'इलेक्ट्रिकल',
  'प्लास्टिक',
  'केमिकल',
  'फूड & बेव्हरेज',
  'टेक्सटाईल',
  'इतर'
];

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState(mfgData);
  const [selectedCat, setSelectedCat] = useState('सर्व श्रेणी');
  const [searchQuery, setSearchQuery] = useState('');
  const [b2bModal, setB2bModal] = useState(false);
  const [selectedMfg, setSelectedMfg] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getManufacturers().then((liveData) => {
      if (liveData && liveData.length > 0) {
        const mapped = liveData.map((m) => ({
          id: m.id,
          name: m.companyName || m.name || 'मराठा इंडस्ट्रीज',
          sector: m.industry || m.sector || 'उत्पादन व तंत्रज्ञान',
          category: m.category || 'मशीनरी',
          city: m.district ? `${m.district}, महाराष्ट्र` : (m.city || 'महाराष्ट्र'),
          products: m.products || 'औद्योगिक उपकरणे व उत्पादने',
          export: m.turnover ? `उलाढाल: ${m.turnover}` : (m.export || 'स्थानिक व आंतरराष्ट्रीय पुरवठा'),
          employees: m.employees || '५०+ कामगार',
          icon: m.icon || '⚙️',
          contact: m.contact || ''
        }));
        setManufacturers(mapped);
      }
    }).catch(() => {});
  }, []);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = manufacturers.filter((m) => {
    const matchCat = selectedCat === 'सर्व श्रेणी' || m.category === selectedCat;
    const matchSearch =
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.sector || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.products || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="manufacturers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(38, 50, 56, 0.90) 0%, rgba(55, 71, 79, 0.88) 100%), url("/assets/images/generated/maratha_manufacturers_hero.jpg") center/cover no-repeat',
        color: '#FFFFFF',
        padding: '50px 20px',
        textAlign: 'center'
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
            🚩 CONNECT मराठा — मेड इन मराठा | फॉर द वर्ल्ड
          </div>
          <p style={{ fontSize: '1.2rem', color: '#FFE082', fontWeight: 600, margin: '0 0 6px' }}>
            मराठा उद्योग, मराठा अभिमान !
          </p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा मॅन्युफॅक्चरर्स & इंडस्ट्री हब
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '680px' }}>
            गुणवत्तापूर्ण उत्पादन, जागतिक ओळख — मराठा मॅन्युफॅक्चरिंगचा एक नवा विश्वास || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedMfg(null); setB2bModal(true); }}
              style={{
                background: '#FFD54F',
                color: '#263238',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ＋ कंपनी नोंदणी / B2B लीड्स
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid #EADBCE',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>२,५००+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>नोंदणीकृत कंपन्या</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>५००+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>शहरांमध्ये विस्तार</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>१ लाख+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>रोजगार निर्मिती</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>१००+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>देशांमध्ये निर्यात</span>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #EADBCE', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="कंपनी नाव, उत्पादन, श्रेणी, शहर शोधा..."
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
                  border: selectedCat === cat ? '2px solid #37474F' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#37474F' : '#FFFFFF',
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

        {/* Manufacturing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((m) => (
            <div
              key={m.id}
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
                background: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
                padding: '24px 20px',
                borderBottom: '1px solid #B0BEC5',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: '#37474F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>
                  {m.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#263238', margin: '0 0 4px' }}>
                    {m.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: '#37474F', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {m.sector}
                  </span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div>
                  <strong>📍 स्थान:</strong> {m.city}
                </div>
                <div>
                  <strong>⚙️ मुख्य उत्पादने:</strong> {m.products}
                </div>
                <div>
                  <strong>🌍 विस्तार / निर्यात:</strong> {m.export}
                </div>
                <div>
                  <strong>👥 कामगार:</strong> <span style={{ color: '#2E7D32', fontWeight: 700 }}>{m.employees}</span>
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                <button
                  onClick={() => { setSelectedMfg(m); setB2bModal(true); }}
                  style={{
                    width: '100%',
                    background: '#37474F',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  B2B चौकशी / संपर्क साधा
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: B2B Enquiry / Add Company */}
      {b2bModal && (
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
              onClick={() => { setB2bModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#37474F', margin: '0 0 6px' }}>
              {selectedMfg ? `${selectedMfg.name} — B2B ट्रेड चौकशी` : 'कंपनी नोंदणी करा'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              Connect Maratha B2B ट्रेड नेटवर्कशी थेट संपर्क.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🤝</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>चौकशी यशस्वीरित्या पाठवली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>कंपनीचे विक्री प्रतिनिधी २४ तासांत संपर्क करतील.</p>
                <button
                  onClick={() => { setB2bModal(false); setSubmitted(false); }}
                  style={{ background: '#37474F', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquiry}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="आपले / कंपनीचे नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input required placeholder="शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <textarea required placeholder="आपली गरज / उत्पादनांची विचारणा (Quantity & Specifications) *" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#37474F', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'पाठवत आहे...' : 'चौकशी पाठवा'}
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
