import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SymbolsPage() {
  const [activeWeapon, setActiveWeapon] = useState('dandpatta');
  const [lightboxImage, setLightboxImage] = useState(null);

  const WEAPONS_DATA = {
    dandpatta: {
      id: 'dandpatta',
      name: 'दांडपट्टा (The Gauntlet Sword)',
      subtitle: 'मराठा सैन्याचे सर्वात संहारक व अद्वितीय अस्त्र',
      icon: '🗡️',
      image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600',
      description: 'दांडपट्टा हे मराठा पायदळाचे अत्यंत वेगवान व घातक शस्त्र होते. हाताच्या मनगटापासून कोपरापर्यंत पोलादी आवरण (Gauntlet) घालून फिरवले जाणारे हे शस्त्र एकाच वेळी शेकडो शत्रू फौजेत तुटून पडण्यासाठी वापरले जाई. बाजीप्रभू देशपांडे आणि तानाजी मालुसरे यांसारख्या वीरांनी दांडपट्ट्याच्या जोरावर अद्वितीय शौर्य गाजवले.',
      specs: [
        { label: 'लांबी', value: '३.५ ते ४.५ फूट लवचिक पोलाद' },
        { label: 'वजन', value: '१.५ ते २.२ किलो' },
        { label: 'कौशल्य', value: 'दोन हातांत दोन पट्टे फिरवून वर्तुळाकार संरक्षण' }
      ]
    },
    waghnakh: {
      id: 'waghnakh',
      name: 'वाघनखे (Tiger Claws)',
      subtitle: 'प्रतापगडाच्या पायथ्याशी इतिहास घडवणारे गुप्त शस्त्र',
      icon: '🐾',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
      description: 'हाताच्या तळव्यात सहज लपवून ठेवता येणारे चार पोलादी नख्यांचे हे शस्त्र. १० नोव्हेंबर १६५९ रोजी छत्रपती शिवाजी महाराजांनी बलाढ्य अफझलखानाचा कोथळा बाहेर काढण्यासाठी या अस्त्राचा वापर केला. अलीकडेच लंडनमधील व्हिक्टोरिया अँड अल्बर्ट संग्रहालयातून ही ऐतिहासिक वाघनखे महाराष्ट्रात प्रदर्शनासाठी आणली गेली आहेत.',
      specs: [
        { label: 'रचना', value: 'चार तीक्ष्ण वक्राकार पोलादी नखे व दोन अंगठ्या' },
        { label: 'वैशिष्ट्य', value: 'अंगरख्याच्या बाहीत पूर्णपणे गुप्त राहणारे' },
        { label: 'ऐतिहासिक प्रसंग', value: 'प्रतापगड युद्ध — अफझलखान वध' }
      ]
    },
    bhavani: {
      id: 'bhavani',
      name: 'भवानी तलवार (Bhavani Sword)',
      subtitle: 'छत्रपती शिवरायांची पवित्र व अजिंक्य तलवार',
      icon: '⚔️',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
      description: 'तुळजाभवानी मातेच्या आशीर्वादाने पूजलेली भवानी तलवार ही स्वराज्याची प्राणज्योत मानली जाते. उत्तम दर्जाच्या स्पॅनिश टोलेडो पोलादाची ही तलवार अत्यंत संतुलित व तीक्ष्ण होती. शिवरायांच्या हस्ते या तलवारीने अनेक लढाया जिंकल्या आणि अन्यायाचा निःपात केला.',
      specs: [
        { label: 'पोलाद', value: 'उच्च दर्जाचे दमास्कस / टोलेडो कार्बन स्टील' },
        { label: 'मुठ', value: 'पारंपरिक मराठा खांडा मुठ (धूप मुठ)' },
        { label: 'प्रतीक', value: 'अन्यायाचा नाश व रयतेचे रक्षण' }
      ]
    },
    shivrai: {
      id: 'shivrai',
      name: 'शिवराई व होन नाणी (Swarajya Coinage)',
      subtitle: 'सार्वभौम स्वतंत्र अर्थव्यवस्थेचे सुवर्ण चिन्ह',
      icon: '🪙',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      description: '६ जून १६७४ रोजी झालेल्या शिवराज्याभिषेकानंतर शिवरायांनी मुघल व विजापुरी नाणी नाकारून स्वतःची सोन्याची "होन" आणि तांब्याची "शिवराई" ही स्वतंत्र नाणी पाडली. नाण्यांच्या एका बाजूला "श्री राजा शिव" आणि दुसऱ्या बाजूला "छत्रपति" ही देवनागरी अक्षरे कोरलेली होती.',
      specs: [
        { label: 'लिपी', value: 'शुद्ध देवनागरी अक्षरे' },
        { label: 'धातू', value: 'सुवर्ण (होन: २.८ ग्रॅम) व तांबे (शिवराई: ९ ते १२ ग्रॅम)' },
        { label: 'महत्त्व', value: 'परकीय आर्थिक चलनापासून पूर्ण मुक्ती' }
      ]
    }
  };

  const currentWeapon = WEAPONS_DATA[activeWeapon];

  return (
    <div style={{ background: '#fdfbf7', color: '#1c1917', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            cursor: 'pointer'
          }}
        >
          <img
            src={lightboxImage.url}
            alt={lightboxImage.caption}
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
          />
          <div style={{ color: '#fef08a', marginTop: '16px', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Baloo 2' }}>
            {lightboxImage.caption}
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '4px' }}>
            {lightboxImage.source} (बंद करण्यासाठी कुठेही क्लिक करा)
          </div>
        </div>
      )}

      {/* Saffron War Cry Top Strip */}
      <div style={{
        background: 'linear-gradient(90deg, #991b1b, #c2410c, #991b1b)',
        color: '#fef08a',
        padding: '10px 16px',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: '0.95rem',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <span>🔥</span>
        <span style={{ fontFamily: 'Baloo 2', fontSize: '1.05rem' }}>
          ॥ भगवा फडकला की स्वाभिमान जागा होतो! जय भवानी, जय शिवाजी ॥
        </span>
        <span>🔥</span>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e7e5e4', padding: '10px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: '#78716c', textDecoration: 'none' }}>🏠 होम</Link>
          <span>›</span>
          <Link to="/more" style={{ color: '#78716c', textDecoration: 'none' }}>अधिक विभाग</Link>
          <span>›</span>
          <span style={{ color: '#c2410c', fontWeight: 700 }}>राजमुद्रा, भगवा व स्वराज्याची प्रतीके</span>
        </div>
      </div>

      {/* Grand Hero Section */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #9a3412 100%)',
        color: '#fff',
        padding: '60px 24px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.15), transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(254, 240, 138, 0.2)',
            border: '1px solid rgba(254, 240, 138, 0.4)',
            color: '#fef08a',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '14px'
          }}>
            🔱 अखंड सार्वभौमत्व व मराठा अस्मितेची चिन्हे
          </div>

          <h1 style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 0 16px',
            color: '#fff',
            textShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            राजमुद्रा, भगवा ध्वज आणि स्वराज्याची शस्त्रसंपदा
          </h1>

          <p style={{
            maxWidth: '780px',
            margin: '0 auto',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: '#fed7aa',
            opacity: 0.95
          }}>
            स्वराज्याची मुद्रा, ध्वज, गडकोट आणि शस्त्रे ही केवळ शासकीय चिन्हे नव्हती — ती कोट्यवधी मावळ्यांच्या स्वाभिमानाची, स्वातंत्र्याची आणि लोककल्याणकारी सत्तेची जिवंत प्रतीके होती.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '40px 20px' }}>

        {/* SECTION 1: THE SACRED RAJMUDRA EXHIBIT */}
        <section style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid #e7e5e4',
          padding: '36px 32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          marginBottom: '44px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              सर्वोच्च शासकीय अधिष्ठान
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              शिवछत्रपतींची सुवर्ण अष्टकोनी राजमुद्रा
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center', marginBottom: '28px' }}>
            {/* The SVG Royal Seal */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '240px',
                height: '240px',
                filter: 'drop-shadow(0 12px 24px rgba(199, 56, 0, 0.35))',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill="#991b1b" stroke="#f59e0b" strokeWidth="5"/>
                  <polygon points="63,18 137,18 182,63 182,137 137,182 63,182 18,137 18,63" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="100" y="55" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">प्रतिपच्चंद्रलेखेव</text>
                  <text x="100" y="80" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">वर्धिष्णुर्विश्ववंदिता</text>
                  <text x="100" y="105" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">शाहसूनोः शिवस्यैषा</text>
                  <text x="100" y="130" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">मुद्रा भद्राय</text>
                  <text x="100" y="155" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">राजते ॥</text>
                </svg>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '12px', fontWeight: 600 }}>
                अष्टकोनी शुद्ध संस्कृत सुवर्ण राजमुद्रा (इ.स. १६४० चे दशक)
              </div>
            </div>

            {/* Shloka & Deep Meaning */}
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #ffedd5)',
                border: '2px solid #f59e0b',
                borderRadius: '14px',
                padding: '20px 24px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontFamily: "'Noto Sans Devanagari', serif",
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#7f1d1d',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  marginBottom: '12px'
                }}>
                  " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।<br/>
                  शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  color: '#431407',
                  lineHeight: 1.55,
                  fontWeight: 600,
                  borderTop: '1px dashed #d97706',
                  paddingTop: '10px'
                }}>
                  <strong>भावार्थ:</strong> प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीराजे भोसले यांचे सुपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा लोककल्याणासाठी तळपते आहे!
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#44403c', lineHeight: 1.7, margin: 0 }}>
                अवघ्या १६ व्या वर्षी छत्रपती शिवरायांनी स्वतःची अष्टकोनी राजमुद्रा तयार करवून घेतली. त्या काळी दख्खनमधील सर्व सत्ताधीशांच्या मुद्रा पर्शियन भाषेत असत. शिवरायांनी पारतंत्र्याची भाषा नाकारून <strong>संस्कृत भाषा व देवनागरी लिपी</strong> निवडली — हा निर्णय म्हणजे स्वतंत्र, सार्वभौम व स्वाभिमानी रयतेच्या स्वराज्याचा औपचारिक जाहीरनामा होता.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: BHAGWA DHWAJ EXHIBIT */}
        <section style={{ marginBottom: '44px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              राष्ट्रध्वज व शौर्याचे प्रतीक
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              🚩 अखंड भगवा ध्वज (जरीपटका)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #fed7aa',
              padding: '26px',
              boxShadow: '0 4px 20px rgba(194, 65, 12, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚔️</span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', margin: 0, color: '#991b1b' }}>
                  ऐतिहासिक संदर्भ (१७ वे व १८ वे शतक)
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#44403c', lineHeight: 1.65, margin: 0 }}>
                भगवा रंग हा त्याग, तेज, निर्भयता आणि संतांच्या आशीर्वादाचे प्रतीक मानला गेला. मोहिमांवर जाणाऱ्या मराठा फौजांसोबत जरीपटका (सोनेरी जरतारी असलेला भगवा ध्वज) मानाने मिरवला जाई. जिंकलेल्या गडकोटांवर भगवा ध्वज चढवणे म्हणजे त्या भूमीवरील जुलमी सत्तेचा अंत होऊन रयतेचे राज्य स्थापन झाल्याची घोषणा असे.
              </p>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #fed7aa',
              padding: '26px',
              boxShadow: '0 4px 20px rgba(194, 65, 12, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>🏛️</span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', margin: 0, color: '#991b1b' }}>
                  समकालीन सांस्कृतिक संदर्भ
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#44403c', lineHeight: 1.65, margin: 0 }}>
                आजही महाराष्ट्रातील सांस्कृतिक उत्सव, शिवजयंती, गडकोट स्वच्छता मोहिमा आणि समाज उत्थानाच्या कार्यात भगवा ध्वज स्वाभिमानाचा झेंडा म्हणून अभिमानाने फडकवला जातो. हा वापर ऐतिहासिक लष्करी संघर्षापेक्षा सांस्कृतिक अस्मिता, एकता आणि शिवरायांच्या सुशासनाच्या स्मरणासाठी आहे.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: MARATHA ARSENAL INTERACTIVE EXHIBIT */}
        <section style={{
          background: 'linear-gradient(135deg, #1c1917, #292524)',
          color: '#fff',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          marginBottom: '44px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              शस्त्र व युद्धसामग्री
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#fef08a' }}>
              ⚔️ शिवकालीन शस्त्रागार व युद्धकौशल्य
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '650px', margin: '8px auto 0' }}>
              गनिमी काव्यासाठी अत्यंत चपळ, वजनाने हलकी आणि अचूक मारक क्षमता असणारी मराठ्यांची पारंपरिक शस्त्रास्त्रे
            </p>
          </div>

          {/* Weapon Switcher Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {Object.values(WEAPONS_DATA).map(w => {
              const active = activeWeapon === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveWeapon(w.id)}
                  style={{
                    background: active ? '#c2410c' : 'rgba(255,255,255,0.08)',
                    color: active ? '#fff' : '#cbd5e1',
                    border: active ? '1px solid #ea580c' : '1px solid rgba(255,255,255,0.15)',
                    padding: '8px 18px',
                    borderRadius: '24px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ marginRight: '6px' }}>{w.icon}</span>
                  {w.name}
                </button>
              );
            })}
          </div>

          {/* Active Weapon Detail Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentWeapon.subtitle}
              </div>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'Baloo 2', color: '#fff', margin: '4px 0 14px' }}>
                {currentWeapon.name}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.7, marginBottom: '20px' }}>
                {currentWeapon.description}
              </p>

              {/* Specs Box */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {currentWeapon.specs.map((sp, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < currentWeapon.specs.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', fontSize: '0.84rem' }}>
                    <span style={{ color: '#94a3b8' }}>{sp.label}:</span>
                    <span style={{ color: '#fef08a', fontWeight: 700 }}>{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <img
                src={currentWeapon.image}
                alt={currentWeapon.name}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '14px', border: '2px solid #ea580c' }}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: 4 PILLARS SUMMARY CARDS */}
        <section style={{ marginBottom: '44px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              थोडक्यात समजून घ्या
            </span>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              स्वराज्य चिन्हे — एका दृष्टिक्षेपात
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔱</div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>राजमुद्रा</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78716c' }}>सार्वभौम सत्तेचे व रयत कल्याणाचे अधिकृत सुवर्ण चिन्ह</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚩</div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>भगवा ध्वज</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78716c' }}>त्याग, तेज आणि अखंड स्वाभिमानाचे राष्ट्रप्रतीक</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏰</div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>गड-किल्ले</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78716c' }}>सह्याद्रीतील ३५०+ अभेद्य लष्करी व सांस्कृतिक दुर्ग</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚔️</div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>तलवार व दांडपट्टा</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78716c' }}>मराठा योद्ध्यांचे अद्वितीय शौर्य व संरक्षण साधने</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: HISTORICAL PHOTO GALLERY WITH LIGHTBOX */}
        <section style={{ marginBottom: '44px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📸 अस्सल ऐतिहासिक संदर्भ दालन
            </span>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              चिन्हांचे ऐतिहासिक दर्शन व संग्रहालये
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#78716c' }}>मोठ्या आकारात पाहण्यासाठी चित्रावर क्लिक करा</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div
              onClick={() => setLightboxImage({
                url: 'https://wallpapercave.com/wp/wp4518353.jpg',
                caption: 'शिवराज्याभिषेक सोहळा (६ जून १६७४)',
                source: 'रायगडावरील सुवर्ण सिंहासनाधिष्ठित सोहळा — राजमुद्रेची अधिकृत घोषणा'
              })}
              style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e7e5e4', cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <img src="https://wallpapercave.com/wp/wp4518353.jpg" alt="शिवराज्याभिषेक" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontWeight: 700, color: '#450a0a', fontSize: '1rem', fontFamily: 'Baloo 2' }}>
                  राज्याभिषेक सोहळा
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78716c' }}>
                  राजमुद्रेच्या सार्वभौमत्वाची अधिकृत स्थापना
                </div>
              </div>
            </div>

            <div
              onClick={() => setLightboxImage({
                url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
                caption: 'अस्सल १८ व्या शतकातील भित्तीचित्र',
                source: 'भगवा ध्वज घेऊन रणांगणात उतरलेले मराठा सैन्य'
              })}
              style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e7e5e4', cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800" alt="भगवा ध्वज मोहीम" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontWeight: 700, color: '#450a0a', fontSize: '1rem', fontFamily: 'Baloo 2' }}>
                  भगवा ध्वज मोहीम
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78716c' }}>
                  ऐतिहासिक भित्तीचित्रांतील जरीपटका दर्शन
                </div>
              </div>
            </div>

            <div
              onClick={() => setLightboxImage({
                url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800',
                caption: 'राजा दिनकर केळकर संग्रहालय, पुणे',
                source: 'अस्सल मराठा शस्त्रास्त्रे, दांडपट्टे, चिलखत व वाघनखे संग्रह'
              })}
              style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e7e5e4', cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <img src="https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800" alt="केळकर संग्रहालय" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontWeight: 700, color: '#450a0a', fontSize: '1rem', fontFamily: 'Baloo 2' }}>
                  तलवार-ढाल शस्त्रागार
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78716c' }}>
                  ऐतिहासिक युद्धकौशल्याचे जतन केलेले नमुने
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CONTEXTUAL DISCLAIMER */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#991b1b',
          fontSize: '0.86rem',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          ℹ️ <strong>ऐतिहासिक विरुद्ध समकालीन वापर:</strong> वरील प्रतीकांचा ऐतिहासिक संदर्भ अस्सल कागदपत्रे, बखरी व साधनांवर आधारित आहे; तर समकालीन वापर हा शिवरायांच्या विचारांचे स्मरण, अस्मिता व सांस्कृतिक अभिमानासाठी आहे.
        </div>

        {/* SECTION 7: RELATED READS */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #e7e5e4',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#450a0a', fontFamily: 'Baloo 2', fontSize: '1.1rem' }}>
              पुढील संशोधन व वाचन
            </div>
            <div style={{ fontSize: '0.85rem', color: '#78716c' }}>
              शिवकालीन प्रशासन, मराठा कालपट व ३५०+ किल्ल्यांची संपूर्ण माहिती
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/forts" style={{ padding: '8px 16px', background: '#f5f5f4', color: '#44403c', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.84rem' }}>
              🏰 गड-किल्ले पाहा
            </Link>
            <Link to="/history" style={{ padding: '8px 16px', background: '#c2410c', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.84rem' }}>
              📖 मराठा इतिहास कालपट →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
