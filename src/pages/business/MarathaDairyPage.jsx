import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const productsData = [
  {
    id: 1,
    name: 'ताजे गाईचे दूध (५०० मि.ली.)',
    size: '500 ml',
    price: '₹२८',
    category: 'दूध',
    icon: '🥛',
    fat: '३.८% फॅट',
    image: '/assets/images/dairy/dairy_milk_fresh.jpg',
    tag: 'ताजे व पौष्टिक'
  },
  {
    id: 2,
    name: 'ताजे गाईचे दूध (१ लिटर)',
    size: '1 Litre',
    price: '₹५४',
    category: 'दूध',
    icon: '🥛',
    fat: '३.८% फॅट',
    image: '/assets/images/dairy/dairy_milk_fresh.jpg',
    tag: 'कौटुंबिक पॅक'
  },
  {
    id: 3,
    name: 'ताजे गोड दही (५०० ग्रॅम)',
    size: '500 gm',
    price: '₹३०',
    category: 'दही',
    icon: '🥣',
    fat: 'नैसर्गिक चव',
    image: '/assets/images/dairy/dairy_dahi.jpg',
    tag: 'दाट व मलाईदार'
  },
  {
    id: 4,
    name: 'शुद्ध मलाई पनीर (२०० ग्रॅम)',
    size: '200 gm',
    price: '₹८०',
    category: 'पनीर',
    icon: '🧀',
    fat: 'उच्च प्रोटिन',
    image: '/assets/images/dairy/dairy_paneer_fresh.jpg',
    tag: 'मऊ व फ्रेश'
  },
  {
    id: 5,
    name: 'शुद्ध गाईचे तूप (५०० मि.ली.)',
    size: '500 ml',
    price: '₹३२०',
    category: 'तूप',
    icon: '🧈',
    fat: 'पारंपरिक दाणेदार',
    image: '/assets/images/dairy/dairy_ghee_pure.jpg',
    tag: '१००% शुद्ध'
  },
  {
    id: 6,
    name: 'मसाला ताक व लस्सी (२५० मि.ली.)',
    size: '250 ml',
    price: '₹२५',
    category: 'लस्सी / ताक',
    icon: '🥤',
    fat: 'थंडगार पाचक',
    image: '/assets/images/dairy/dairy_taak_lassi.jpg',
    tag: 'पाचक व चवदार'
  },
  {
    id: 7,
    name: 'केसर वेलची श्रीखंड (५०० ग्रॅम)',
    size: '500 gm',
    price: '₹१४०',
    category: 'मिठाई',
    icon: '🍨',
    fat: 'शाही मेजवानी',
    image: '/assets/images/dairy/dairy_shrikhand_fresh.jpg',
    tag: 'पारंपरिक गोड'
  }
];

const collectionCentersData = [
  {
    id: 1,
    name: 'सह्याद्री ग्रामीण दूध संकलन केंद्र',
    location: 'इस्लामपूर, ता. वाळवा, जि. सांगली',
    timing: 'सकाळी ५:०० ते १०:३० | संध्या. ५:०० ते ८:००',
    dailyCollection: '१,४५० लिटर',
    avgFat: '४.४% फॅट',
    farmers: '३२० नोंदणीकृत शेतकरी',
    centerHead: 'शशिकांत पाटील (प्रमुख)',
    image: '/assets/images/dairy/dairy_center_islampur.jpg',
    facility: 'ऑटोमॅटिक मिल्क अ‍ॅनालायझर व वजनकाटा'
  },
  {
    id: 2,
    name: 'स्वाभिमान बीएमसी मिल्क चिलिंग केंद्र',
    location: 'शिरोळ, ता. शिरोळ, जि. कोल्हापूर',
    timing: 'सकाळी ५:३० ते ११:०० | संध्या. ४:३० ते ७:३०',
    dailyCollection: '२,१०० लिटर',
    avgFat: '४.६% फॅट',
    farmers: '४१० नोंदणीकृत शेतकरी',
    centerHead: 'तानाजीराव मोहिते (अध्यक्ष)',
    image: '/assets/images/dairy/dairy_center_shirol.jpg',
    facility: '५,००० लिटर बल्क मिल्क कुलर (BMC)'
  },
  {
    id: 3,
    name: 'सहकारी शेतकरी दूध संस्था केंद्र',
    location: 'कागल ग्रामीण, ता. कागल, जि. कोल्हापूर',
    timing: 'सकाळी ६:०० ते १०:०० | संध्या. ५:०० ते ८:३०',
    dailyCollection: '९२० लिटर',
    avgFat: '४.२% फॅट',
    farmers: '२१५ नोंदणीकृत शेतकरी',
    centerHead: 'आनंदराव घोरपडे (व्यवस्थापक)',
    image: '/assets/images/dairy/dairy_center_kagal.jpg',
    facility: 'कॉम्प्युटराइज्ड फॅट टेस्टिंग व त्वरित पावती'
  },
  {
    id: 4,
    name: 'महामिल्क हायटेक सोलर संकलन केंद्र',
    location: 'हातकणंगले, ता. हातकणंगले, जि. कोल्हापूर',
    timing: 'सकाळी ५:०० ते ११:०० | संध्या. ४:०० ते ८:००',
    dailyCollection: '२,८५० लिटर',
    avgFat: '४.५% फॅट',
    farmers: '४८० नोंदणीकृत शेतकरी',
    centerHead: 'बाळासाहेब जाधव (संचालक)',
    image: '/assets/images/dairy/dairy_center_hatkanangale.jpg',
    facility: 'सोलर पॉवर्ड प्लांट व इन्सुलेटेड टँकर सुविधा'
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
        // Map live data if any exists, ensuring fallbacks and images
        const mapped = liveData.map((d, idx) => ({
          id: d.id,
          name: d.dairyName || collectionCentersData[idx % collectionCentersData.length].name,
          location: d.district ? `${d.district}, महाराष्ट्र` : collectionCentersData[idx % collectionCentersData.length].location,
          timing: collectionCentersData[idx % collectionCentersData.length].timing,
          dailyCollection: d.dailyCollection || collectionCentersData[idx % collectionCentersData.length].dailyCollection,
          avgFat: d.milkRateCow || collectionCentersData[idx % collectionCentersData.length].avgFat,
          farmers: d.centerHead ? `प्रमुख: ${d.centerHead}` : collectionCentersData[idx % collectionCentersData.length].farmers,
          centerHead: d.centerHead || collectionCentersData[idx % collectionCentersData.length].centerHead,
          image: collectionCentersData[idx % collectionCentersData.length].image,
          facility: collectionCentersData[idx % collectionCentersData.length].facility
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
      {/* Hero Banner with Light Translucent Overlay for clear image visibility */}
      <section style={{
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '2px solid #C8E6C9'
      }}>
        {/* Background Image Container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/assets/images/generated/maratha_dairy_hero.jpg")',
          backgroundPosition: 'center 45%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.02)'
        }} />

        {/* LIGHT, GENTLE TRANSLUCENT OVERLAY (IMAGE IS CLEARLY VISIBLE) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(20, 75, 24, 0.40) 0%, rgba(46, 125, 50, 0.30) 50%, rgba(10, 45, 12, 0.45) 100%)',
          backdropFilter: 'blur(1px)'
        }} />

        {/* Soft bottom vignette for readable contrast */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)'
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '980px',
          margin: '0 auto',
          padding: '50px 20px',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 213, 79, 0.6)',
            padding: '6px 18px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '14px',
            color: '#FFD54F',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}>
            <span>🚩 CONNECT मराठा</span>
            <span style={{ color: '#FFFFFF', opacity: 0.6 }}>|</span>
            <span>दुग्ध व्यवसाय व गो-संवर्धन मंच</span>
          </div>

          <p style={{
            fontSize: '1.25rem',
            color: '#FFF9C4',
            fontWeight: 700,
            margin: '0 0 8px',
            textShadow: '0 2px 8px rgba(0,0,0,0.85)'
          }}>
            शुद्धता, विश्वास आणि मराठा अभिमान !
          </p>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            fontFamily: 'Baloo 2, sans-serif',
            lineHeight: 1.25,
            color: '#FFFFFF',
            textShadow: '0 3px 12px rgba(0,0,0,0.9)'
          }}>
            मराठा मिल्क डेअरी (Maratha Milk Dairy)
          </h1>

          <p style={{
            fontSize: '1.1rem',
            margin: '0 auto 24px',
            maxWidth: '720px',
            lineHeight: 1.55,
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0,0,0,0.85)',
            fontWeight: 500
          }}>
            शेतकऱ्यांच्या हातून, ग्राहकांच्या आरोग्यासाठी — शुद्ध दूध, निरोगी जीवन || जय भवानी ! जय शिवाजी !
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                background: activeTab === 'products' ? '#FFD54F' : 'rgba(255, 255, 255, 0.22)',
                color: activeTab === 'products' ? '#1B5E20' : '#FFFFFF',
                border: activeTab === 'products' ? 'none' : '1.5px solid rgba(255, 255, 255, 0.6)',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.96rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'all 0.2s'
              }}
            >
              🥛 डेअरी उत्पादने ({productsData.length})
            </button>
            <button
              onClick={() => setActiveTab('centers')}
              style={{
                background: activeTab === 'centers' ? '#FFD54F' : 'rgba(255, 255, 255, 0.22)',
                color: activeTab === 'centers' ? '#1B5E20' : '#FFFFFF',
                border: activeTab === 'centers' ? 'none' : '1.5px solid rgba(255, 255, 255, 0.6)',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.96rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'all 0.2s'
              }}
            >
              📍 दूध संकलन केंद्रे ({centers.length}+)
            </button>
            <button
              onClick={() => setFarmerModal(true)}
              style={{
                background: '#FFFFFF',
                color: '#1B5E20',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.96rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
              }}
            >
              🌾 दूध उत्पादक शेतकरी व्हा
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Dairy - Placed cleanly below hero */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px 24px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
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
        <section style={{ maxWidth: '1180px', margin: '36px auto 0', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1B5E20', margin: '0 0 6px' }}>
              लोकप्रिय शुद्ध उत्पादने (Dairy Products)
            </h2>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
              शेतकऱ्यांकडून संकलित केलेल्या शुद्ध व ताज्या दुधापासून बनवलेली दर्जेदार उत्पादने
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {productsData.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #D7EBD8',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Product Image - Suitable display without awkward cropping */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  background: '#F4F8F4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: '1px solid #E8F5E9'
                }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    style={{
                      display: 'none',
                      position: 'absolute',
                      inset: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.5rem',
                      background: '#E8F5E9'
                    }}
                  >
                    {prod.icon}
                  </div>

                  {/* Fat / Quality Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(27, 94, 32, 0.90)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    {prod.fat}
                  </span>

                  {/* Tag badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#FFD54F',
                    color: '#1B5E20',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}>
                    {prod.tag}
                  </span>
                </div>

                {/* Product Info */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B5E20', margin: '0 0 8px', lineHeight: 1.35 }}>
                    {prod.name}
                  </h3>
                  <div style={{ color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>उपलब्ध प्रमाण:</span>
                    <strong style={{ color: '#1B5E20', background: '#E8F5E9', padding: '3px 10px', borderRadius: '6px', fontSize: '0.88rem' }}>
                      {prod.size}
                    </strong>
                  </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {centers.map((center) => (
              <div
                key={center.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #C8E6C9',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Center Image */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '190px',
                  background: '#E8F5E9',
                  overflow: 'hidden'
                }}>
                  <img
                    src={center.image}
                    alt={center.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(27, 94, 32, 0.90)',
                    color: '#FFFFFF',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    📍 {center.location.split(',')[0]}
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#FFD54F',
                    color: '#1B5E20',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    सक्रिय संकलन केंद्र
                  </span>
                </div>

                {/* Center Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#1B5E20', margin: 0, lineHeight: 1.35 }}>
                    {center.name}
                  </h3>

                  <div style={{ fontSize: '0.88rem', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span>
                    <span>{center.location}</span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#666', background: '#F9FBF9', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E8F5E9' }}>
                    ⏰ <strong>वेळ:</strong> {center.timing}
                  </div>

                  {center.facility && (
                    <div style={{ fontSize: '0.84rem', color: '#2E7D32', background: '#E8F5E9', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}>
                      ⚡ <strong>सुविधा:</strong> {center.facility}
                    </div>
                  )}

                  {/* Daily Collection & Fat Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#F1F8E9', padding: '12px', borderRadius: '10px', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.76rem', color: '#666', display: 'block' }}>दैनिक संकलन</span>
                      <strong style={{ fontSize: '1.15rem', color: '#1B5E20' }}>{center.dailyCollection}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.76rem', color: '#666', display: 'block' }}>फॅट सरासरी</span>
                      <strong style={{ fontSize: '1.15rem', color: '#1B5E20' }}>{center.avgFat}</strong>
                    </div>
                  </div>

                  {/* Footer details (Farmers and Center Head) - NO BUTTON */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F0F4F0', fontSize: '0.86rem', color: '#444' }}>
                    <span style={{ fontWeight: 600 }}>👥 {center.farmers}</span>
                    {center.centerHead && (
                      <span style={{ color: '#1B5E20', fontWeight: 700, fontSize: '0.84rem' }}>{center.centerHead}</span>
                    )}
                  </div>
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
