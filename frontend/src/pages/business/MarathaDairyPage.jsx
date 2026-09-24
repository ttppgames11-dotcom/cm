import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const productsData = [
  { id: 1, name: 'ताजे गाईचे दूध (५०० मि.ली.)', size: '500 ml', price: '₹२८', category: 'दूध', icon: '🥛', fat: '३.८% फॅट' },
  { id: 2, name: 'ताजे गाईचे दूध (१ लिटर)', size: '1 Litre', price: '₹५४', category: 'दूध', icon: '🥛', fat: '३.८% फॅट' },
  { id: 3, name: 'ताजे गोड दही (५०० ग्रॅम)', size: '500 gm', price: '₹३०', category: 'दही', icon: '🥣', fat: 'नैसर्गिक चव' },
  { id: 4, name: 'शुद्ध मलाई पनीर (२०० ग्रॅम)', size: '200 gm', price: '₹३०', category: 'पनीर', icon: '🧀', fat: 'उच्च प्रोटिन' },
  { id: 5, name: 'शुद्ध गाईचे तूप (५०० मि.ली.)', size: '500 ml', price: '₹३२०', category: 'तूप', icon: '🧈', fat: 'पारंपरिक दाणेदार' },
  { id: 6, name: 'मसाला ताक / लस्सी (२५० मि.ली.)', size: '250 ml', price: '₹२५', category: 'लस्सी / ताक', icon: '🥤', fat: 'थंडगार पाचक' }
];

const collectionCentersData = [
  {
    id: 1,
    name: 'संकलन केंद्र - इस्लामपूर',
    location: 'इस्लामपूर, ता. वाळवा, जि. सांगली, महाराष्ट्र',
    phone: '98654 32100',
    timing: 'सकाळी ५:०० ते ११:००',
    dailyCollection: '१,२५० लिटर',
    avgFat: '४.२%',
    farmers: '३१० शेतकरी'
  },
  {
    id: 2,
    name: 'संकलन केंद्र - शिरोळ',
    location: 'शिरोळ, ता. शिरोळ, जि. कोल्हापूर, महाराष्ट्र',
    phone: '94220 87654',
    timing: 'सकाळी ५:३० ते ११:३०',
    dailyCollection: '९८० लिटर',
    avgFat: '४.३%',
    farmers: '२४० शेतकरी'
  },
  {
    id: 3,
    name: 'संकलन केंद्र - कागल',
    location: 'कागल, ता. कागल, जि. कोल्हापूर, महाराष्ट्र',
    phone: '91580 11223',
    timing: 'सकाळी ६:०० ते ११:००',
    dailyCollection: '७६५ लिटर',
    avgFat: '४.१%',
    farmers: '१९५ शेतकरी'
  },
  {
    id: 4,
    name: 'संकलन केंद्र - हातकणंगले',
    location: 'हातकणंगले, ता. हातकणंगले, जि. कोल्हापूर, महाराष्ट्र',
    phone: '88056 99887',
    timing: 'सकाळी ५:०० ते १०:३०',
    dailyCollection: '१,१२० लिटर',
    avgFat: '४.२%',
    farmers: '२८५ शेतकरी'
  }
];

export default function MarathaDairyPage() {
  const [centers, setCenters] = useState(collectionCentersData);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'centers'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [farmerModal, setFarmerModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getDairy().then((liveData) => {
      if (liveData && liveData.length > 0) {
        const mapped = liveData.map((d) => ({
          id: d.id,
          name: d.dairyName || 'संकलन केंद्र',
          location: d.district ? `${d.district}, महाराष्ट्र` : 'महाराष्ट्र',
          phone: d.contact || '9822011223',
          timing: 'सकाळी ५:३० ते १०:३०',
          dailyCollection: d.dailyCollection || '१,००० लिटर',
          avgFat: d.milkRateCow || '४.२%',
          farmers: d.centerHead ? `प्रमुख: ${d.centerHead}` : '२५० शेतकरी'
        }));
        setCenters(mapped);
      }
    }).catch(() => {});
  }, []);

  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const name = form.elements['name'].value;
    const phone = form.elements['phone'].value;
    const village = form.elements['village'].value;
    const liters = form.elements['liters']?.value;

    try {
      const res = await apiClient.addDairy({
        dairyName: `संकलन केंद्र (${village})`,
        centerHead: name,
        dailyCollection: `${liters || 50} लिटर/दिवस`,
        district: village,
        contact: phone.replace(/\D/g, '').slice(-10) || '9822011223'
      });
      const created = res.data?.dairyCenter || res.dairyCenter || {
        id: `DRY-${Date.now().toString().slice(-4)}`,
        name: `संकलन केंद्र - ${village}`,
        location: `${village}, महाराष्ट्र`,
        phone,
        timing: 'सकाळी ५:३० ते १०:३०',
        dailyCollection: `${liters || 50} लिटर`,
        avgFat: '४.२%',
        farmers: `प्रमुख: ${name}`
      };
      setCenters((prev) => [created, ...prev]);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'नोंदणी करताना त्रुटी आली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="maratha-dairy-page" style={{ background: '#F8FBF8', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.90) 0%, rgba(46, 125, 50, 0.88) 100%), url("/assets/images/generated/maratha_dairy_hero.jpg") center/cover no-repeat',
        color: '#FFFFFF',
        padding: '50px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#FFD54F'
          }}>
            🚩 CONNECT मराठा — एक लढा! एक समाज! एक भविष्य!
          </div>
          <p style={{ fontSize: '1.25rem', color: '#FFF59D', fontWeight: 600, margin: '0 0 6px' }}>
            शुद्धता, विश्वास आणि मराठा अभिमान !
          </p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा मिल्क डेअरी (Maratha Milk Dairy)
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 24px', maxWidth: '680px' }}>
            शेतकऱ्यांच्या हातून, ग्राहकांच्या आरोग्यासाठी — शुद्ध दूध, निरोगी जीवन || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                background: activeTab === 'products' ? '#FFD54F' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'products' ? '#1B5E20' : '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🥛 डेअरी उत्पादने
            </button>
            <button
              onClick={() => setActiveTab('centers')}
              style={{
                background: activeTab === 'centers' ? '#FFD54F' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'centers' ? '#1B5E20' : '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              📍 दूध संकलन केंद्रे (१५६+)
            </button>
            <button
              onClick={() => setFarmerModal(true)}
              style={{
                background: '#FFFFFF',
                color: '#1B5E20',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🌾 दूध उत्पादक शेतकरी व्हा
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Dairy */}
      <section style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid #C8E6C9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <strong style={{ color: '#1B5E20', display: 'block', fontSize: '1rem' }}>🌱 शेतकऱ्यांची समृद्धी</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>योग्य भाव व थेट बँक खात्यात वेळेवर पेमेंट</span>
          </div>
          <div>
            <strong style={{ color: '#1B5E20', display: 'block', fontSize: '1rem' }}>🐄 गो-संवर्धन संस्कृती</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>देशी गाईचे जतन ही आपली सामाजिक जबाबदारी</span>
          </div>
          <div>
            <strong style={{ color: '#1B5E20', display: 'block', fontSize: '1rem' }}>🧪 १००% शुद्धतेची खात्री</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>नो अँटिबायोटिक, नो केमिकल, लॅब टेस्टेड</span>
          </div>
          <div>
            <strong style={{ color: '#1B5E20', display: 'block', fontSize: '1rem' }}>🚚 वेळेवर होम डिलिव्हरी</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>सकाळी ७ च्या आत ताजे दूध थेट घरी</span>
          </div>
        </div>
      </section>

      {/* Content depending on Tab */}
      {activeTab === 'products' ? (
        <section style={{ maxWidth: '1180px', margin: '40px auto 0', padding: '0 16px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B5E20', textAlign: 'center', marginBottom: '24px' }}>
            लोकप्रिय उत्पादने (Dairy Products)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
            {productsData.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #C8E6C9',
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ background: '#E8F5E9', padding: '36px 20px', textAlign: 'center', borderBottom: '1px solid #C8E6C9' }}>
                  <span style={{ fontSize: '3.5rem' }}>{prod.icon}</span>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', background: '#2E7D32', color: '#fff', display: 'inline-block', padding: '2px 10px', borderRadius: '10px', fontWeight: 700 }}>
                    {prod.fat}
                  </div>
                </div>
                <div style={{ padding: '18px', flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2E7D32', margin: '0 0 6px' }}>
                    {prod.name}
                  </h3>
                  <div style={{ color: '#666', fontSize: '0.86rem' }}>
                    प्रमाण: <strong>{prod.size}</strong>
                  </div>
                </div>
                <div style={{ padding: '14px 18px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1B5E20' }}>
                    {prod.price}
                  </div>
                  <button
                    onClick={() => { setSelectedProduct(prod); setOrderModal(true); }}
                    style={{
                      background: '#2E7D32',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem'
                    }}
                  >
                    मागवा (Order)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Collection Centers */
        <section style={{ maxWidth: '1180px', margin: '40px auto 0', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B5E20', margin: 0 }}>
                मराठा दूध संकलन केंद्रे
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#555', margin: '4px 0 0' }}>
                गावोगावी संकलन, शेतकऱ्यांना न्याय्य दर, ग्राहकांना शुद्ध दूध ! (एकूण केंद्रे: १५६)
              </p>
            </div>
            <button
              onClick={() => setFarmerModal(true)}
              style={{
                background: '#1B5E20',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ＋ नवीन केंद्र जोडा / शेतकरी नोंदणी
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {centers.map((center) => (
              <div
                key={center.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #C8E6C9',
                  padding: '24px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B5E20', margin: 0 }}>
                    {center.name}
                  </h3>
                  <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '8px' }}>
                    सक्रिय केंद्र
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#555' }}>
                  📍 {center.location}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#555' }}>
                  ⏰ <strong>वेळ:</strong> {center.timing}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#F1F8E9', padding: '12px', borderRadius: '10px', marginTop: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#666', display: 'block' }}>आजचे संकलन</span>
                    <strong style={{ fontSize: '1.1rem', color: '#1B5E20' }}>{center.dailyCollection}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#666', display: 'block' }}>फॅट सरासरी</span>
                    <strong style={{ fontSize: '1.1rem', color: '#1B5E20' }}>{center.avgFat}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #EEEEEE' }}>
                  <span style={{ fontSize: '0.84rem', color: '#666' }}>👥 {center.farmers}</span>
                  <button
                    onClick={() => alert(`संकलन केंद्र संपर्क: ${center.phone}`)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2E7D32',
                      color: '#2E7D32',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📞 केंद्र संपर्क
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dairy Statistics */}
      <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #004D40 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 20px', color: '#FFD54F' }}>
            आपला अभिमान, आपली ताकद — मराठा दूध डेअरी
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>२,५००+</div>
              <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>शेतकरी जोडले गेले</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>१.५ लाख+</div>
              <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>लिटर दूध दैनिक संकलन</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>१५६+</div>
              <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>गावोगावी संकलन केंद्रे</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>१००%</div>
              <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>शुद्धता व विश्वास</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Order Product */}
      {orderModal && selectedProduct && (
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
            maxWidth: '460px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setOrderModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h3 style={{ color: '#1B5E20', margin: '0 0 6px', fontSize: '1.3rem' }}>
              {selectedProduct.icon} {selectedProduct.name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '16px' }}>
              किंमत: <strong style={{ color: '#2E7D32' }}>{selectedProduct.price}</strong> • थेट शेतकऱ्यांकडून ताजे उत्पादन
            </p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '3rem' }}>🥛</span>
                <h4 style={{ color: '#2E7D32', margin: '10px 0' }}>ऑर्डर यशस्वीरित्या स्वीकारली!</h4>
                <p style={{ fontSize: '0.86rem', color: '#555' }}>डेअरी प्रतिनिधी लवकरच डिलिव्हरीसाठी संपर्क करतील.</p>
                <button onClick={() => { setOrderModal(false); setSubmitted(false); }} style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}>पूर्ण झाले</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required placeholder="डिलिव्हरी पत्ता व शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input type="number" defaultValue="1" min="1" placeholder="प्रमाण (Quantity)" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <button type="submit" style={{ background: '#2E7D32', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    ऑर्डर निश्चित करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Farmer Registration */}
      {farmerModal && (
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
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setFarmerModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h3 style={{ color: '#1B5E20', margin: '0 0 6px', fontSize: '1.3rem' }}>
              🌾 दूध उत्पादक शेतकरी नोंदणी
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '16px' }}>
              चांगला दर • नियमित व वेळेवर पेमेंट • तांत्रिक मार्गदर्शन व गो-खाद्य सवलत.
            </p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h4 style={{ color: '#2E7D32', margin: '10px 0' }}>नोंदणी यशस्वीरित्या प्राप्त झाली!</h4>
                <p style={{ fontSize: '0.86rem', color: '#555' }}>जवळच्या संकलन केंद्राचे व्यवस्थापक २ दिवसांत भेट देतील.</p>
                <button onClick={() => { setFarmerModal(false); setSubmitted(false); }} style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}>पूर्ण झाले</button>
              </div>
            ) : (
              <form onSubmit={handleFarmerSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input name="name" required placeholder="शेतकऱ्याचे पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input name="phone" required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input name="village" required placeholder="गाव, तालुका व जिल्हा *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input name="cattle" placeholder="गाई/म्हशी संख्या" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input name="liters" placeholder="अंदाजे दैनिक लिटर" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'नोंदणी करत आहे...' : 'नोंदणी सबमिट करा'}
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
