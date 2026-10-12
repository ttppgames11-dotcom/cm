import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'दुर्गराज रायगड — राज्याभिषेक सुवर्ण सिंहासन',
    category: 'forts',
    image: '/assets/images/real-raigad-panoramic.jpg',
    desc: 'दुर्गराज रायगडावरील छत्रपती शिवाजी महाराजांचे ३२ मण सुवर्ण सिंहासनाची जागा व राजसभा.'
  },
  {
    id: 2,
    title: 'छत्रपती शिवाजी महाराज — ऐतिहासिक राजमुद्रा',
    category: 'symbols',
    image: '/assets/images/real-shivaji-portrait.jpg',
    desc: '|| प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ||'
  },
  {
    id: 3,
    title: 'किल्ले राजगड — बालेकिल्ला व पद्मावती माची',
    category: 'forts',
    image: '/assets/images/real-rajgad-fort.jpg',
    desc: 'स्वराज्याची २६ वर्षे राजधानी राहिलेला सह्याद्रीचा मुकुटमणी किल्ले राजगड.'
  },
  {
    id: 4,
    title: 'शिवकालीन नाणी — शिवराई व होन',
    category: 'symbols',
    image: '/assets/images/real-shivrai-coin.jpg',
    desc: 'स्वराज्याचे सार्वभौमत्व सिद्ध करणारी तांब्याची शिवराई आणि सोन्याचा होन.'
  },
  {
    id: 5,
    title: 'किल्ले प्रतापगड — भवानी माता मंदिर',
    category: 'forts',
    image: '/assets/images/real-pratapgad-fort.jpg',
    desc: '१० नोव्हेंबर १६५९ रोजी अफझलखान वध आणि स्वराज्याचा जावळीतील देदीप्यमान विजय.'
  },
  {
    id: 6,
    title: 'किल्ले शिवनेरी — शिवजन्म स्थान व शिवाई देवी',
    category: 'forts',
    image: '/assets/images/real-shivneri-fort.jpg',
    desc: '१९ फेब्रुवारी १६३० रोजी सह्याद्रीच्या कुशीत युगप्रवर्तक शिवरायांचा जन्म झालेला पावन गड.'
  },
  {
    id: 7,
    title: 'किल्ले तोरणा — स्वराज्याचे पहिले तोरण',
    category: 'forts',
    image: '/assets/images/real-torna-fort.jpg',
    desc: 'वयाच्या अवघ्या १६ व्या वर्षी शिवरायांनी जिंकलेला प्रचंडगड म्हणजेच किल्ले तोरणा.'
  },
  {
    id: 8,
    title: 'अखंड मराठा साम्राज्य विस्तार नकाशा (१७५८)',
    category: 'history',
    image: '/assets/images/real-maratha-peak-map.jpg',
    desc: 'अटकेपासून कटकपर्यंत आणि तंजावरपासून दिल्लीपर्यंत पसरलेले अखंड मराठा साम्राज्य.'
  }
];

export default function PhotoGalleryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filteredItems = activeTab === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeTab);

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              📸 मराठा वारसा व चित्रदालन
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              ऐतिहासिक छायाचित्र दालन व सांस्कृतिक वारसा (Gallery)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              सह्याद्रीचे ३५०+ अभेद्य गडकोट, शिवकालीन नाणी, राजमुद्रा, मराठा आरमार आणि सण-उत्सवांचे विहंगम दृश्य दालन.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/forts" className="btn btn-primary" style={{ background: '#fff', color: '#C73800', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
              🏰 ३५०+ गडकोट नकाशा
            </Link>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: 'सर्व छायाचित्रे 🖼️' },
            { id: 'forts', label: 'दुर्गराज व गडकिल्ले 🏰' },
            { id: 'symbols', label: 'राजमुद्रा व नाणी 🪙' },
            { id: 'history', label: 'साम्राज्य नकाशे व इतिहास 🗺️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: activeTab === tab.id ? '2px solid #C73800' : '1px solid #E5E7EB',
                background: activeTab === tab.id ? '#FFF3E0' : '#fff',
                color: activeTab === tab.id ? '#C73800' : '#4B5563',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
              <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onError={(e) => { e.target.src = '/assets/images/real-raigad-panoramic.jpg'; }}
                />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                  🔍 मोठे पहा
                </div>
              </div>

              <div style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#1F2937', margin: '0 0 6px', fontWeight: 700 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Cultural Deep-Dive Strip */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#C73800', margin: '0 0 16px', fontFamily: 'Baloo 2' }}>
            🚩 स्वराज्य प्रतीके व ऐतिहासिक वारसा
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFF8F2', padding: '20px', borderRadius: '12px', border: '1px solid #FFCC80' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#C73800', margin: '0 0 8px' }}>⚜️ छत्रपती शिवरायांची राजमुद्रा</h3>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                'प्रतिपच्चंद्रलेखेव...' — प्रतिपदेच्या चंद्रकलेप्रमाणे वाढत जाणारी आणि विश्वाला वंद्य ठरणारी ही मुद्रा रयतेच्या कल्याणासाठी राज्य करते.
              </p>
            </div>

            <div style={{ background: '#FFF8F2', padding: '20px', borderRadius: '12px', border: '1px solid #FFCC80' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#C73800', margin: '0 0 8px' }}>🚩 जरीपटक व भगवा ध्वज</h3>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                स्वराज्याचे सार्वभौम प्रतीक, त्याग, शौर्य आणि सह्याद्रीच्या बलिदानाचे तेज दर्शवणारा दोन टोकांचा पवित्र भगवा ध्वज.
              </p>
            </div>

            <div style={{ background: '#FFF8F2', padding: '20px', borderRadius: '12px', border: '1px solid #FFCC80' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#C73800', margin: '0 0 8px' }}>⚓ भारतीय आरमाराचे जनक</h3>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                सिंधुदुर्ग, विजयदुर्ग, पद्मदुर्ग यांसारखे जलदुर्ग उभारून परकीय आक्रमक सत्तांना समुद्रावरच थोपवणारे शिवरायांचे अद्वितीय नौदल.
              </p>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxItem && (
          <div
            onClick={() => setLightboxItem(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '16px', maxWidth: '800px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ height: '480px', background: '#000' }}>
                <img src={lightboxItem.image} alt={lightboxItem.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#C73800' }}>{lightboxItem.title}</h3>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>{lightboxItem.desc}</p>
                </div>
                <button onClick={() => setLightboxItem(null)} style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>बंद करा ✕</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
