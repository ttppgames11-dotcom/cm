import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SymbolsPage() {
  const [activeWeapon, setActiveWeapon] = useState('dandpatta');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const WEAPONS_DATA = {
    dandpatta: {
      id: 'dandpatta',
      name: 'दांडपट्टा (The Gauntlet Sword)',
      subtitle: 'मराठा सैन्याचे सर्वात संहारक व अद्वितीय अस्त्र',
      icon: '🗡️',
      image: '/assets/images/real-dandpatta.jpg',
      description: 'दांडपट्टा हे मराठा पायदळाचे अत्यंत वेगवान व महासंहारक शस्त्र होते. मनगटापासून कोपरापर्यंत पोलादी आवरण (Gauntlet) घालून फिरवले जाणारे हे शस्त्र शत्रूच्या घोडेस्वारांचे पाय तोडण्यासाठी आणि सैन्यात तुटून पडण्यासाठी वापरले जाई. बाजीप्रभू देशपांडे आणि तानाजी मालुसरे यांसारख्या नरवीरांनी दांडपट्ट्याच्या साह्याने शेकडो सैन्याशी एकाच वेळी झुंज दिली होती.',
      specs: [
        { label: 'लांबी व पाते', value: '३.५ ते ४.५ फूट अत्यंत लवचिक कार्बन स्टील' },
        { label: 'वजन', value: '१.५ ते २.२ किलो (संतुलित भार)' },
        { label: 'युद्धकौशल्य', value: 'दोन हातांत दोन पट्टे फिरवून अभेद्य वर्तुळाकार ढाल व वार' },
        { label: 'विशेष नोंद', value: 'छत्रपती शिवाजी महाराज स्वतः दांडपट्टा चालवण्यात सर्वोच्च निष्णात होते' }
      ]
    },
    waghnakh: {
      id: 'waghnakh',
      name: 'वाघनखे (Tiger Claws)',
      subtitle: 'प्रतापगडाच्या पायथ्याशी इतिहास घडवणारे गुप्त शस्त्र',
      icon: '🐾',
      image: '/assets/images/real-waghnakh.jpg',
      description: 'हाताच्या तळव्यात सहज लपवून ठेवता येणारे चार पोलादी नख्यांचे हे गुप्त अस्त्र. १० नोव्हेंबर १६५९ रोजी छत्रपती शिवाजी महाराजांनी बलाढ्य अफझलखानाचा विश्वासघाती वार उलथवून लावत त्याचा कोथळा बाहेर काढण्यासाठी या अस्त्राचा वापर केला. लंडनमधील व्हिक्टोरिया अँड अल्बर्ट संग्रहालयातून पुन्हा महाराष्ट्रात आणली गेलेली ही ऐतिहासिक वाघनखे मराठ्यांच्या समयसूचकतेचे सर्वोच्च प्रतीक आहेत.',
      specs: [
        { label: 'रचना व घटक', value: '४ तीक्ष्ण वक्राकार पोलादी नखे व बोटांसाठी २ कडी (अंगठ्या)' },
        { label: 'गुप्तता', value: 'अंगरख्याच्या बाहीत पूर्णपणे अदृश्य राहणारे' },
        { label: 'ऐतिहासिक प्रसंग', value: 'प्रतापगड युद्ध — अफझलखान वध (१० नोव्हेंबर १६५९)' },
        { label: 'सध्याचे स्थान', value: 'लंडनच्या व्हिक्टोरिया अँड अल्बर्ट म्युझियममधून भारतात आणले' }
      ]
    },
    bhavani: {
      id: 'bhavani',
      name: 'भवानी तलवार व खांडा (Bhavani Sword)',
      subtitle: 'छत्रपती शिवरायांची पवित्र व अजिंक्य तलवार',
      icon: '⚔️',
      image: '/assets/images/real-khanda-sword.jpg',
      description: 'कुलस्वामिनी श्री तुळजाभवानी मातेच्या कृपाशीर्वादाने पूजलेली भवानी तलवार ही हिंदवी स्वराज्याची प्राणज्योत मानली जाते. उत्तम दर्जाच्या दमास्कस/स्पॅनिश टोलेडो पोलादाची ही दुधारी तलवार अत्यंत संतुलित व अतिशय तीक्ष्ण होती. शिवरायांच्या हस्ते या अस्त्राने अनेक रणांगणे गाजवली आणि रयतेला अभय दिले.',
      specs: [
        { label: 'पोलादाचा प्रकार', value: 'उच्च दर्जाचे टोलेडो/दमास्कस कार्बन स्टील' },
        { label: 'मुठ रचना', value: 'पारंपरिक मराठा खांडा मुठ (स्पाइकसह धूप मुठ)' },
        { label: 'प्रतीक व मूल्य', value: 'अन्यायाचा संहार, धर्मसंस्थापना व रयतेचे संरक्षण' },
        { label: 'दुधारी पाते', value: 'दोन्ही बाजूंनी धारदार, एकाच फटक्यात चिलखत भेदण्याची ताकद' }
      ]
    },
    shivrai: {
      id: 'shivrai',
      name: 'शिवराई व होन नाणी (Swarajya Coinage)',
      subtitle: 'सार्वभौम स्वतंत्र अर्थव्यवस्थेचे सुवर्ण चिन्ह',
      icon: '🪙',
      image: '/assets/images/real-shivrai-coin.jpg',
      description: '६ जून १६७४ रोजी झालेल्या शिवराज्याभिषेकानंतर शिवरायांनी मुघल व विजापुरी नाणी नाकारून स्वतःची सोन्याची "होन" आणि तांब्याची "शिवराई" ही स्वतंत्र नाणी पाडली. नाण्यांच्या एका बाजूला "श्री राजा शिव" आणि दुसऱ्या बाजूला "छत्रपति" ही देवनागरी अक्षरे कोरलेली होती. हे परकीय आर्थिक दास्यातून मुक्तीचे सुवर्ण पाऊल होते.',
      specs: [
        { label: 'लिपी व मजकूर', value: 'शुद्ध देवनागरी अक्षरे — "श्री राजा शिव / छत्रपति"' },
        { label: 'सुवर्ण होन वजन', value: '२.८ ग्रॅम (अस्सल २४ कॅरेट सुवर्ण)' },
        { label: 'तांब्याची शिवराई', value: '९ ते १२ ग्रॅम (दैनिक व्यापारासाठी)' },
        { label: 'आर्थिक महत्त्व', value: 'परकीय हुकूमशाही आर्थिक चलनावर संपूर्ण बंदी' }
      ]
    }
  };

  const currentWeapon = WEAPONS_DATA[activeWeapon];

  const RAJMUDRA_WORDS = [
    { word: 'प्रतिपच्चंद्रलेखेव', meaning: 'प्रतिपदेच्या चंद्रकलेप्रमाणे (नव्या चंद्राच्या कलेसारखी)', exp: 'ज्याप्रमाणे प्रतिपदेचा चंद्र रोज थोडा थोडा वाढत जातो आणि पौर्णिमेला पूर्ण तेजाने तळपतो, तसेच हे स्वराज्य अखंड विस्तारत जाईल.' },
    { word: 'वर्धिष्णुर्विश्ववंदिता', meaning: 'सतत वृद्धिंगत होणारी व विश्वाला वंदनीय', exp: 'केवळ महाराष्ट्रातच नव्हे, तर साऱ्या विश्वातील सज्जनांना ही सत्ता आदरणीय आणि लोककल्याणकारी वाटेल.' },
    { word: 'शाहसूनोः शिवस्यैषा', meaning: 'शहाजीपुत्र शिवाजीची ही (मुद्रा)', exp: 'पराक्रमी शहाजीराजे भोसले यांचे सुपुत्र शिवाजी महाराजांची ही स्वतःची स्वतंत्र सार्वभौम मुद्रा आहे.' },
    { word: 'मुद्रा भद्राय राजते', meaning: 'मुद्रा लोककल्याणासाठी तळपते / शोभून दिसते', exp: 'ही सत्ता कोणावर जुलूम करण्यासाठी नाही, तर सर्व रयतेच्या "भद्रासाठी" (कल्याणासाठी व रक्षणासाठी) अधिष्ठित आहे.' }
  ];

  return (
    <div style={{ background: '#fdfbf7', color: '#1c1917', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
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
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}
          />
          <div style={{ color: '#fef08a', marginTop: '16px', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Baloo 2', textAlign: 'center' }}>
            {lightboxImage.caption}
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '4px', textAlign: 'center', maxWidth: '600px' }}>
            {lightboxImage.source} (बंद करण्यासाठी कुठेही क्लिक करा ✕)
          </div>
        </div>
      )}

      {/* Saffron War Cry Top Strip */}
      <div style={{
        background: 'linear-gradient(90deg, #7f1d1d, #c2410c, #991b1b)',
        color: '#fef08a',
        padding: '12px 16px',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: '0.98rem',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        borderBottom: '2px solid rgba(254, 240, 138, 0.3)'
      }}>
        <span>🔥</span>
        <span style={{ fontFamily: 'Baloo 2', fontSize: '1.1rem' }}>
          ॥ प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता । शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥
        </span>
        <span>🔥</span>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e7e5e4', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.88rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: '#78716c', textDecoration: 'none' }}>🏠 होम</Link>
          <span>›</span>
          <Link to="/culture" style={{ color: '#78716c', textDecoration: 'none' }}>संस्कृती व वारसा</Link>
          <span>›</span>
          <span style={{ color: '#c2410c', fontWeight: 700 }}>राजमुद्रा, भगवा व स्वराज्याची प्रतीके</span>
        </div>
      </div>

      {/* Grand Hero Section with Dedicated Maratha Heritage Fortress Sunset Banner */}
      <div style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(30, 5, 5, 0.78), rgba(55, 10, 10, 0.75), rgba(25, 4, 4, 0.9)), url(/assets/images/symbols-hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#fff',
        padding: '85px 24px 75px',
        borderBottom: '4px solid #f59e0b',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.25)',
            border: '1px solid rgba(254, 240, 138, 0.55)',
            backdropFilter: 'blur(8px)',
            color: '#fef08a',
            padding: '8px 22px',
            borderRadius: '30px',
            fontSize: '0.88rem',
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            <span>🔱</span>
            <span>अखंड सार्वभौमत्व व मराठा अस्मितेची पवित्र चिन्हे</span>
          </div>

          <h1 style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.18,
            margin: '0 0 18px',
            color: '#fff',
            textShadow: '0 4px 18px rgba(0,0,0,0.8), 0 2px 6px rgba(245, 158, 11, 0.5)'
          }}>
            राजमुद्रा, भगवा ध्वज आणि स्वराज्याची शस्त्रसंपदा
          </h1>

          <p style={{
            maxWidth: '840px',
            margin: '0 auto 28px',
            fontSize: '1.15rem',
            lineHeight: 1.7,
            color: '#fed7aa',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)'
          }}>
            स्वराज्याची मुद्रा, राष्ट्रध्वज, अजिंक्य गडकोट आणि संहारक शस्त्रे ही केवळ शासकीय साधने नव्हती — ती कोट्यवधी मावळ्यांच्या रक्ताने सिंचित झालेली स्वाभिमानाची, स्वातंत्र्याची आणि लोककल्याणकारी हिंदवी स्वराज्याची अमर प्रतीके होती.
          </p>

          {/* Quick Metrics Strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            paddingTop: '16px'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(254, 240, 138, 0.3)', borderRadius: '12px', padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Baloo 2' }}>१६४५ ई.</div>
              <div style={{ color: '#fed7aa', fontSize: '0.8rem' }}>राजमुद्रेची प्रथम निर्मिती</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(254, 240, 138, 0.3)', borderRadius: '12px', padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Baloo 2' }}>अष्टकोनी सुवर्ण</div>
              <div style={{ color: '#fed7aa', fontSize: '0.8rem' }}>राजमुद्रेचा विशिष्ट आकार</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(254, 240, 138, 0.3)', borderRadius: '12px', padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Baloo 2' }}>जरीपटका</div>
              <div style={{ color: '#fed7aa', fontSize: '0.8rem' }}>द्विमुखी भगवा राष्ट्रध्वज</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(254, 240, 138, 0.3)', borderRadius: '12px', padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Baloo 2' }}>३५०+ गडकोट</div>
              <div style={{ color: '#fed7aa', fontSize: '0.8rem' }}>सह्याद्रीची अभेद्य प्रतीके</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '48px 20px' }}>

        {/* SECTION 1: THE SACRED RAJMUDRA EXHIBIT - ROYAL SWARAJYA COURT & TREASURY BACKGROUND */}
        <section style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '54px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          border: '2px solid #b45309'
        }}>
          {/* Card Header with Royal Swarajya Darbar & Gold Throne Seal Hall Background */}
          <div style={{
            position: 'relative',
            backgroundImage: 'linear-gradient(rgba(30, 6, 6, 0.82), rgba(65, 10, 10, 0.8)), url(/assets/images/rajmudra-darbar-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            color: '#fff',
            padding: '42px 32px 36px',
            textAlign: 'center',
            borderBottom: '3px solid #f59e0b'
          }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid #f59e0b',
              color: '#fef08a',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '10px'
            }}>
              सर्वोच्च शासकीय व आध्यात्मिक अधिष्ठान
            </span>
            <h2 style={{
              fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)',
              fontFamily: 'Baloo 2',
              margin: '4px 0 10px',
              color: '#fff',
              textShadow: '0 3px 10px rgba(0,0,0,0.7)'
            }}>
              शिवछत्रपतींची सुवर्ण अष्टकोनी राजमुद्रा
            </h2>
            <p style={{
              maxWidth: '750px',
              margin: '0 auto',
              color: '#fed7aa',
              fontSize: '1rem',
              lineHeight: 1.6
            }}>
              अवघ्या १६ व्या वर्षी छत्रपती शिवाजी महाराजांनी स्वतःच्या सार्वभौम राज्यकारभारासाठी तयार केलेली जगातील पहिली लोककल्याणकारी संस्कृत राजमुद्रा.
            </p>
          </div>

          {/* Card Body with Detailed Info & Interactive Seals */}
          <div style={{ background: '#fff', padding: '36px 32px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '36px',
              alignItems: 'center',
              marginBottom: '36px'
            }}>
              {/* Dual Visual: Historical Metal Seal & High-res Vector Emblem */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {/* Metal Replica */}
                  <div
                    onClick={() => setLightboxImage({
                      url: '/assets/images/real-rajmudra-seal.jpg',
                      caption: 'अस्सल ऐतिहासिक सुवर्ण/कांस्य राजमुद्रा (Royal Seal of Chhatrapati Shivaji Maharaj)',
                      source: 'पुरातत्त्व विभाग व ऐतिहासिक फर्मानांवर उमटवलेली मूळ अष्टकोनी राजमुद्रा'
                    })}
                    title="मोठ्या आकारात पाहण्यासाठी क्लिक करा"
                    style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '4px solid #b45309',
                      boxShadow: '0 12px 28px rgba(180,83,9,0.35)',
                      cursor: 'pointer',
                      transition: 'transform 0.25s, box-shadow 0.25s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 16px 36px rgba(180,83,9,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(180,83,9,0.35)';
                    }}
                  >
                    <img
                      src="/assets/images/real-rajmudra-seal.jpg"
                      alt="अस्सल ऐतिहासिक राजमुद्रा"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Sacred Octagon Graphic */}
                  <div
                    style={{
                      width: '160px',
                      height: '160px',
                      filter: 'drop-shadow(0 10px 20px rgba(185, 28, 28, 0.4))',
                      transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08) rotate(2deg)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                  >
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <radialGradient id="mudraGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#b91c1c" />
                          <stop offset="100%" stopColor="#7f1d1d" />
                        </radialGradient>
                      </defs>
                      <polygon points="60,10 140,10 190,60 190,140 140,190 60,190 10,140 10,60" fill="url(#mudraGlow)" stroke="#f59e0b" strokeWidth="6"/>
                      <polygon points="63,18 137,18 182,63 182,137 137,182 63,182 18,137 18,63" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="4,2"/>
                      <text x="100" y="55" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">प्रतिपच्चंद्रलेखेव</text>
                      <text x="100" y="80" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">वर्धिष्णुर्विश्ववंदिता</text>
                      <text x="100" y="105" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">शाहसूनोः शिवस्यैषा</text>
                      <text x="100" y="130" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">मुद्रा भद्राय</text>
                      <text x="100" y="155" fontFamily="'Baloo 2', sans-serif" fontSize="13.5" fontWeight="800" fill="#fef08a" textAnchor="middle">राजते ॥</text>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#78716c', fontWeight: 600, textAlign: 'center' }}>
                  <span>डावीकडे: ऐतिहासिक मूळ धातू मुद्रा</span> • <span>उजवीकडे: पवित्र अष्टकोनी देवनागरी आलेखन</span>
                </div>
              </div>

              {/* Shloka, Translation & Deep Meaning */}
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffedd5 100%)',
                  border: '2px solid #f59e0b',
                  borderRadius: '16px',
                  padding: '24px 26px',
                  marginBottom: '18px',
                  boxShadow: '0 6px 16px rgba(245, 158, 11, 0.15)'
                }}>
                  <div style={{
                    fontFamily: "'Noto Sans Devanagari', 'Baloo 2', serif",
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: '#7f1d1d',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    marginBottom: '14px',
                    letterSpacing: '0.5px'
                  }}>
                    " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।<br/>
                    शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
                  </div>
                  <div style={{
                    fontSize: '0.98rem',
                    color: '#431407',
                    lineHeight: 1.6,
                    fontWeight: 600,
                    borderTop: '1px dashed #d97706',
                    paddingTop: '14px'
                  }}>
                    <strong>अचूक भावार्थ:</strong> प्रतिपदेच्या चंद्रकलेप्रमाणे दिवसेंदिवस विस्तारत जाणारी, संपूर्ण जगाला वंदनीय वाटणारी, शहाजीराजे भोसले यांचे सुपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा केवळ आणि केवळ रयतेच्या "भद्रासाठी" (कल्याणासाठी) राज्य करते!
                  </div>
                </div>

                <div style={{
                  background: '#fafaf9',
                  border: '1px solid #e7e5e4',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#44403c',
                  fontSize: '0.92rem',
                  lineHeight: 1.65
                }}>
                  <p style={{ margin: '0 0 10px' }}>
                    <strong>भाषाक्रांतीचे ऐतिहासिक पाऊल:</strong> १७ व्या शतकात दख्खनमधील सर्व सुलतानांच्या राजमुद्रा या फारसी (Persian) भाषेत असत. शिवरायांच्या वडिलांची (शहाजीराजांची) मुद्राही फारसीत होती. परंतु शिवरायांनी वयाच्या अवघ्या १६ व्या वर्षी परकीय भाषेचे दास्य नाकारून <strong>शुद्ध संस्कृत भाषा आणि देवनागरी लिपीत</strong> ही अष्टकोनी राजमुद्रा कोरून घेतली.
                  </p>
                  <p style={{ margin: 0 }}>
                    या राजमुद्रेत कुठेही राज्यविस्ताराचा दर्प, शत्रूचा नाश करण्याचा उल्लेख किंवा अहंकाराची भाषा नाही; तर केवळ <strong>"भद्राय" — म्हणजेच लोककल्याण, न्याय व रयतेचे संरक्षण</strong> हाच राज्यशासनाचा मूळ हेतू घोषित केला आहे.
                  </p>
                </div>
              </div>
            </div>

            {/* In-depth Breakdown: Word by Word Meaning of Rajmudra */}
            <div style={{ borderTop: '2px dashed #f59e0b', paddingTop: '28px', marginTop: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', color: '#7f1d1d', margin: '0 0 18px', textAlign: 'center' }}>
                📖 राजमुद्रेचा पदच्छेद व चार चरणांचे गूढ रहस्य
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {RAJMUDRA_WORDS.map((item, idx) => (
                  <div key={idx} style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '12px',
                    padding: '16px',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c2410c', fontFamily: 'Baloo 2', marginBottom: '4px' }}>
                      {idx + 1}. {item.word}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#78350f', marginBottom: '8px' }}>
                      अर्थ: {item.meaning}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#44403c', lineHeight: 1.5 }}>
                      {item.exp}
                    </div>
                  </div>
                ))}
              </div>

              {/* Octagonal Significance Box */}
              <div style={{
                marginTop: '20px',
                background: 'linear-gradient(90deg, #fef2f2, #fff7ed)',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ fontSize: '2rem' }}>🛑</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.98rem', marginBottom: '4px' }}>
                    अष्टकोनी आकाराचे महत्त्व (Eight Directions Sovereignty)
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#450a0a', lineHeight: 1.55 }}>
                    मुघल व विजापुरी मुद्रा गोल किंवा अंडाकृती असत. छत्रपती शिवरायांनी अष्टकोन (Octagon) निवडला कारण प्राचीन भारतीय वास्तुशास्त्र व नीतीशास्त्रात अष्टकोन हा आठही दिशांवर रक्षण आणि अष्टदिक्पालांचा आशीर्वाद मानला जातो. हे स्वराज्य सर्व दिशांनी स्वतंत्र आणि अभेद्य असेल, हा त्यामागचा उद्देश होता.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: BHAGWA DHWAJ EXHIBIT - UPGRADED WITH RICH IMAGES & DEEP HISTORICAL FACTS */}
        <section style={{ marginBottom: '54px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              राष्ट्रध्वज, शौर्य व सार्वभौमत्वाचे अधिष्ठान
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              🚩 अखंड भगवा ध्वज व जरीपटका
            </h2>
            <p style={{ color: '#78716c', fontSize: '0.95rem', maxWidth: '680px', margin: '8px auto 0' }}>
              दोन टोकांचा सूर्यप्रकाशासारखा तळपणारा भगवा — शतकानुशतके मराठ्यांच्या अस्मितेचे, त्यागाचे आणि विजयाचे प्रतीक
            </p>
          </div>

          {/* Featured Hero Banner for Bhagwa Dhwaj with Authentic Double-Swallowtail Flag */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
            borderRadius: '20px',
            border: '2px solid #fdba74',
            padding: '30px',
            boxShadow: '0 8px 30px rgba(194, 65, 12, 0.12)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            <div
              onClick={() => setLightboxImage({
                url: '/assets/images/real-bhagwa-dhwaj.svg',
                caption: 'मराठा साम्राज्य — अखंड दुहेरी टोक असलेला अस्सल भगवा ध्वज (Double Swallowtail Maratha Flag)',
                source: 'छत्रपती शिवाजी महाराज ते पेशवे काळातील मराठा सैन्याचा अधिकृत राष्ट्रध्वज व जरीपटका'
              })}
              title="मोठ्या आकारात पाहण्यासाठी क्लिक करा"
              style={{
                background: '#fff',
                padding: '16px 24px',
                borderRadius: '16px',
                border: '3px solid #f97316',
                boxShadow: '0 10px 24px rgba(234, 88, 12, 0.25)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src="/assets/images/real-bhagwa-dhwaj.svg"
                alt="मराठा भगवा ध्वज"
                style={{ width: '240px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(234, 88, 12, 0.35))' }}
              />
              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#c2410c', fontWeight: 800, marginTop: '10px' }}>
                अस्सल दुहेरी टोक (Swallowtail) मराठा भगवा ध्वज
              </div>
              <div style={{ fontSize: '0.72rem', color: '#78716c' }}>
                (क्लिक करा झूम दर्शनासाठी)
              </div>
            </div>

            <div style={{ maxWidth: '560px' }}>
              <div style={{ display: 'inline-block', background: '#ea580c', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', marginBottom: '8px' }}>
                जरीपटका व भगवा निशान
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: '1.5rem', fontFamily: 'Baloo 2', color: '#991b1b' }}>
                अटकेपार फडकणारा मराठ्यांचा विजयी झेंडा
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#44403c', lineHeight: 1.65 }}>
                मराठा फौजांचा जरीपटका हा दोन टोकांचा (Swallowtail) सोनेरी जरतारी असलेला शुद्ध भगवा ध्वज होता. हा ध्वज म्हणजे धर्मरक्षण, त्याग, सूर्यतेज आणि जुलमी सत्तेविरुद्ध पुकारलेल्या अखंड स्वातंत्र्यलढ्याचे प्रतीक होता.
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#78350f', fontWeight: 700 }}>
                <span>✓ संतांचे आध्यात्मिक तेज</span>
                <span>✓ क्षात्रधर्माचा अंगार</span>
                <span>✓ रयतेचे सार्वभौम छत्र</span>
              </div>
            </div>
          </div>

          {/* TWO ENHANCED CARDS WITH PROPER BACKGROUND IMAGES & RICH INFORMATION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '28px' }}>
            
            {/* Card 1: Historical Warfare & Imperial Campaigns with Real Army Image Background */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              border: '1px solid #fed7aa',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(194, 65, 12, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Card 1 Top Image Header */}
              <div style={{
                position: 'relative',
                height: '190px',
                backgroundImage: 'linear-gradient(rgba(69, 10, 10, 0.4), rgba(69, 10, 10, 0.85)), url(/assets/images/bhavya-maratha-army.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                color: '#fff'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fef08a',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  १७ वे व १८ वे शतक
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>⚔️</span>
                  <h3 style={{ fontSize: '1.35rem', fontFamily: 'Baloo 2', margin: 0, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                    ऐतिहासिक लष्करी संदर्भ व जरीपटका
                  </h3>
                </div>
              </div>

              {/* Card 1 Body Content */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.92rem', color: '#44403c', lineHeight: 1.7, margin: '0 0 14px' }}>
                    भगवा रंग हा त्याग, सूर्यतेज, निर्भयता आणि समर्थ रामदास स्वामी व वारकरी संतांच्या आशीर्वादाचे प्रतीक मानला गेला. लष्करी मोहिमेवर निघताना मराठा सैन्याचे सेनापती जरीपटका अत्यंत पवित्र मानून त्याचे पूजन करत असत.
                  </p>
                  
                  <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '14px', border: '1px solid #ffedd5', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.85rem', marginBottom: '6px' }}>
                      🚩 ऐतिहासिक लष्करी नियम व आचारसंहिता:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#431407', lineHeight: 1.6 }}>
                      <li><strong>अटकेपार भगवा (१७५८):</strong> पेशवे रघुनाथराव व मल्हारराव होळकर यांनी सिंधू नदीच्या तीरावरील अटकेच्या किल्ल्यावर हाच भगवा फडकावून मराठ्यांचे वर्चस्व सिद्ध केले.</li>
                      <li><strong>गडकोटांवरील निशाण:</strong> जिंकलेल्या प्रत्येक दुर्गावर भगवा ध्वज चढवणे म्हणजे त्या प्रांतातील मोगली जुलूम संपुष्टात येऊन रयतेचे राज्य प्रस्थापित झाल्याचा जाहीरनामा असे.</li>
                      <li><strong>जरीपटक्याचे रक्षण:</strong> रणांगणात ध्वजवाहक (निशानदार) कधीही मागे हटत नसे; शेवटच्या श्वासापर्यंत भगवा ध्वज उंच ठेवण्यासाठी मावळे प्राणांची बाजी लावत.</li>
                    </ul>
                  </div>
                </div>

                <div
                  onClick={() => setLightboxImage({
                    url: '/assets/images/bhavya-maratha-army.jpg',
                    caption: 'ऐतिहासिक मोहिमेवर निघणारी मराठा सेना व भगवा ध्वज',
                    source: 'मराठा घोडदळ व पायदळाची रणांगणातील कूच'
                  })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>🔍 रणांगणातील भगवा ध्वज चित्र झूम करा</span>
                </div>
              </div>
            </div>

            {/* Card 2: Contemporary Cultural Identity & Festivals with Real Raigad/Fort Wall Background */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              border: '1px solid #fed7aa',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(194, 65, 12, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Card 2 Top Image Header */}
              <div style={{
                position: 'relative',
                height: '190px',
                backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.35), rgba(69, 10, 10, 0.88)), url(/assets/images/real-raigad-bastions.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                color: '#fff'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fef08a',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  आजचा महाराष्ट्र
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🏛️</span>
                  <h3 style={{ fontSize: '1.35rem', fontFamily: 'Baloo 2', margin: 0, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                    समकालीन सांस्कृतिक संदर्भ व प्रेरणा
                  </h3>
                </div>
              </div>

              {/* Card 2 Body Content */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.92rem', color: '#44403c', lineHeight: 1.7, margin: '0 0 14px' }}>
                    आज २१ व्या शतकात भगवा ध्वज हा कोणत्याही एका जाती-धर्माचा अथवा लष्करी संहाराचा ध्वज उरलेला नसून, तो छत्रपती शिवरायांच्या सर्वसमावेशक, कल्याणकारी व स्वाभिमानी विचारांचा अखंड दीपस्तंभ आहे.
                  </p>

                  <div style={{ background: '#fdf4ff', borderRadius: '12px', padding: '14px', border: '1px solid #fbcfe8', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#86198f', fontSize: '0.85rem', marginBottom: '6px' }}>
                      🌟 आधुनिक महाराष्ट्रातील ५ मुख्य सांस्कृतिक भूमिका:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#701a75', lineHeight: 1.6 }}>
                      <li><strong>शिवजयंती उत्सव (१९ फेब्रुवारी):</strong> जगभरातील मराठी समुदायातून भगवे ध्वज अभिमानाने फडकवून शौर्य व नीतीची ज्योत जागवली जाते.</li>
                      <li><strong>दुर्गसंवर्धन मोहीम:</strong> सह्याद्रीतील ३५०+ गडकोटांवर स्वच्छता व इतिहास संवर्धन करताना भगवा ध्वज प्रेरणाबिंदू ठरतो.</li>
                      <li><strong>वारकरी दिंडी:</strong> आषाढी-कार्तिकी वारीत लाखो वारकऱ्यांच्या खांद्यावरील भगवी पताका भक्ती, समता व बंधुभावाचे दर्शन घडवते.</li>
                      <li><strong>मराठा क्रांती मोर्चे:</strong> मूक व शांततामय आंदोलनांत शिस्त, ऐक्य आणि न्यायासाठी भगव्या ध्वजाचे सन्मानपूर्वक नेतृत्व झाले.</li>
                    </ul>
                  </div>
                </div>

                <div
                  onClick={() => setLightboxImage({
                    url: '/assets/images/real-raigad-bastions.jpg',
                    caption: 'किल्ले रायगडाचे अभेद्य बुरुज व मराठा राजधानीचे अवशेष',
                    source: 'शिवछत्रपतींच्या स्वराज्याची राजधानी — रायगड'
                  })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: '#fdf2f8',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px',
                    color: '#86198f',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>🏰 रायगडाचे अभेद्य बुरुज चित्र झूम करा</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: MARATHA ARSENAL INTERACTIVE EXHIBIT */}
        <section style={{
          background: 'linear-gradient(135deg, #1c1917, #292524)',
          color: '#fff',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
          marginBottom: '54px',
          border: '1px solid rgba(251, 146, 60, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              गनिमी काव्याची अभेद्य शस्त्रसंपदा
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#fef08a' }}>
              ⚔️ शिवकालीन शस्त्रागार व युद्धकौशल्य
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '680px', margin: '8px auto 0' }}>
              गनिमी काव्यासाठी अत्यंत वेगवान, वजनाने हलकी, लवचिक आणि अचूक मारक क्षमता असणारी मराठ्यांची पारंपरिक शस्त्रास्त्रे
            </p>
          </div>

          {/* Weapon Switcher Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {Object.values(WEAPONS_DATA).map(w => {
              const active = activeWeapon === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveWeapon(w.id)}
                  style={{
                    background: active ? 'linear-gradient(135deg, #c2410c, #ea580c)' : 'rgba(255,255,255,0.08)',
                    color: active ? '#fff' : '#cbd5e1',
                    border: active ? '2px solid #fdba74' : '1px solid rgba(255,255,255,0.15)',
                    padding: '10px 22px',
                    borderRadius: '28px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: active ? '0 6px 20px rgba(234, 88, 12, 0.4)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{w.icon}</span>
                  <span>{w.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Weapon Detail Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.3)',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {currentWeapon.subtitle}
              </div>
              <h3 style={{ fontSize: '2rem', fontFamily: 'Baloo 2', color: '#fff', margin: '6px 0 16px' }}>
                {currentWeapon.name}
              </h3>
              <p style={{ fontSize: '0.96rem', color: '#e2e8f0', lineHeight: 1.75, marginBottom: '22px' }}>
                {currentWeapon.description}
              </p>

              {/* Specs Box */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {currentWeapon.specs.map((sp, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: idx < currentWeapon.specs.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    fontSize: '0.88rem',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{sp.label}:</span>
                    <span style={{ color: '#fef08a', fontWeight: 700, textAlign: 'right' }}>{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                onClick={() => setLightboxImage({
                  url: currentWeapon.image,
                  caption: currentWeapon.name,
                  source: currentWeapon.subtitle
                })}
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid #ea580c',
                  boxShadow: '0 12px 30px rgba(234, 88, 12, 0.25)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="मोठ्या आकारात पाहण्यासाठी क्लिक करा"
              >
                <img
                  src={currentWeapon.image}
                  alt={currentWeapon.name}
                  style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', background: '#0c0a09', padding: '12px' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#fed7aa',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '8px',
                  backdropFilter: 'blur(4px)'
                }}>
                  🔍 झूम दर्शन
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: 4 PILLARS SUMMARY CARDS */}
        <section style={{ marginBottom: '54px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              स्वराज्याचे चार मुख्य आधारस्तंभ
            </span>
            <h2 style={{ fontSize: '1.9rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              स्वराज्य चिन्हे — एका दृष्टिक्षेपात
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fed7aa', padding: '24px 20px', textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
              <img src="/assets/images/real-rajmudra-seal.jpg" alt="राजमुद्रा" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', border: '3px solid #b45309', boxShadow: '0 4px 12px rgba(180,83,9,0.25)' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>सुवर्ण राजमुद्रा</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#57534e', lineHeight: 1.55 }}>सार्वभौम लोककल्याणकारी सत्तेचा व रयतेच्या अधिकाराचा संस्कृत जाहीरनामा</p>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fed7aa', padding: '24px 20px', textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
              <img src="/assets/images/real-bhagwa-dhwaj.svg" alt="भगवा ध्वज" style={{ width: '90px', height: '54px', objectFit: 'contain', margin: '15px auto 15px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>अखंड भगवा ध्वज</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#57534e', lineHeight: 1.55 }}>त्याग, शौर्य आणि अन्यायाविरुद्ध पुकारलेल्या अखंड स्वातंत्र्यलढ्याचे राष्ट्रप्रतीक</p>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fed7aa', padding: '24px 20px', textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
              <img src="/assets/images/real-raigad-panoramic.jpg" alt="गड-किल्ले" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', border: '3px solid #b45309', boxShadow: '0 4px 12px rgba(180,83,9,0.25)' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>सह्याद्रीचे गडकोट</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#57534e', lineHeight: 1.55 }}>३५०+ अभेद्य गिरिदुर्ग, जलदुर्ग व भुईकोट — स्वराज्याची खरी कवचकुंडले</p>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #fed7aa', padding: '24px 20px', textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
              <img src="/assets/images/real-dandpatta.jpg" alt="तलवार व दांडपट्टा" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', border: '3px solid #b45309', boxShadow: '0 4px 12px rgba(180,83,9,0.25)' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#450a0a', fontFamily: 'Baloo 2' }}>तलवार व दांडपट्टा</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#57534e', lineHeight: 1.55 }}>मावळ्यांचे अद्वितीय बाहूबल, गनिमी काव्याचे तंत्र व स्वसंरक्षणाची अमोघ अस्त्रे</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: HISTORICAL PHOTO GALLERY WITH LIGHTBOX */}
        <section style={{ marginBottom: '54px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📸 अस्सल ऐतिहासिक संदर्भ दालन
            </span>
            <h2 style={{ fontSize: '1.9rem', fontFamily: 'Baloo 2', margin: '4px 0 0', color: '#450a0a' }}>
              चिन्हांचे ऐतिहासिक दर्शन व संग्रहालये
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#78716c', marginTop: '6px' }}>मोठ्या आकारात पाहण्यासाठी चित्रावर क्लिक करा</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div
              onClick={() => setLightboxImage({
                url: '/assets/images/real-shivaji-coronation.jpg',
                caption: 'शिवराज्याभिषेक सोहळा (६ जून १६७४)',
                source: 'रायगडावरील सुवर्ण सिंहासनाधिष्ठित सोहळा — राजमुद्रेची अधिकृत घोषणा'
              })}
              style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e5e4', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src="/assets/images/real-shivaji-coronation.jpg" alt="शिवराज्याभिषेक" style={{ width: '100%', height: '230px', objectFit: 'cover' }} />
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 800, color: '#450a0a', fontSize: '1.05rem', fontFamily: 'Baloo 2' }}>
                  राज्याभिषेक सोहळा
                </div>
                <div style={{ fontSize: '0.85rem', color: '#78716c', marginTop: '4px' }}>
                  राजमुद्रेच्या सार्वभौमत्वाची व होन नाण्यांची अधिकृत स्थापना
                </div>
              </div>
            </div>

            <div
              onClick={() => setLightboxImage({
                url: '/assets/images/bhavya-maratha-army.jpg',
                caption: 'मराठा सेना व भगवा ध्वज',
                source: 'भगवा ध्वज घेऊन रणांगणात उतरलेले मराठा घोडेस्वार व पायदळ'
              })}
              style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e5e4', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src="/assets/images/bhavya-maratha-army.jpg" alt="भगवा ध्वज मोहीम" style={{ width: '100%', height: '230px', objectFit: 'cover' }} />
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 800, color: '#450a0a', fontSize: '1.05rem', fontFamily: 'Baloo 2' }}>
                  भगवा ध्वज मोहीम
                </div>
                <div style={{ fontSize: '0.85rem', color: '#78716c', marginTop: '4px' }}>
                  ऐतिहासिक मोहिमांतील भगवा ध्वज व मराठा सेना दर्शन
                </div>
              </div>
            </div>

            <div
              onClick={() => setLightboxImage({
                url: '/assets/images/real-maratha-arms.jpg',
                caption: 'अस्सल ऐतिहासिक मराठा शस्त्रास्त्रे संग्रह',
                source: 'अस्सल मराठा तलवारी, खांडा, ढाल, चिलखत व दांडपट्टा'
              })}
              style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e5e4', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '100%', height: '230px', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img
                  src="/assets/images/real-maratha-arms.jpg"
                  alt="मराठा शस्त्रागार"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                />
              </div>
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#450a0a', fontSize: '1.05rem', fontFamily: 'Baloo 2' }}>
                    तलवार-ढाल शस्त्रागार
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78716c', marginTop: '4px' }}>
                    अस्सल मराठा युद्धकौशल्याचे जतन केलेले शस्त्र नमुने (तलवार, खांडा, ढाल)
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#ea580c', fontWeight: 700 }}>
                  🔍 संपूर्ण शस्त्रे पाहण्यासाठी क्लिक करा
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CONTEXTUAL DISCLAIMER */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '16px',
          padding: '20px 24px',
          color: '#92400e',
          fontSize: '0.9rem',
          lineHeight: 1.65,
          marginBottom: '36px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.8rem' }}>ℹ️</span>
          <div>
            <strong>ऐतिहासिक सत्यता व समकालीन वापर:</strong> वरील प्रतीकांचा (राजमुद्रा, भगवा ध्वज व शस्त्रे) ऐतिहासिक संदर्भ अस्सल शिवकालीन फर्माने, जेधे शकावली, समकालीन बखरी व पुरातत्त्वीय पुराव्यांवर आधारलेला आहे. आजचा वापर हा शिवरायांच्या सर्वसमावेशक, कल्याणकारी व लोकशाही मूल्यांच्या आदरासाठी आहे.
          </div>
        </div>

        {/* SECTION 7: RELATED READS & NAVIGATION */}
        <div style={{
          background: 'linear-gradient(135deg, #fff 0%, #fafaf9 100%)',
          borderRadius: '18px',
          border: '1px solid #e7e5e4',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: '#450a0a', fontFamily: 'Baloo 2', fontSize: '1.25rem' }}>
              पुढील संशोधन व वाचन
            </div>
            <div style={{ fontSize: '0.88rem', color: '#78716c', marginTop: '2px' }}>
              शिवकालीन प्रशासन, मराठा कालपट व ३५०+ किल्ल्यांची संपूर्ण माहिती
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/forts" style={{ padding: '10px 20px', background: '#f5f5f4', color: '#44403c', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', border: '1px solid #d6d3d1' }}>
              🏰 गड-किल्ले पाहा
            </Link>
            <Link to="/history/warriors" style={{ padding: '10px 20px', background: '#fef3c7', color: '#92400e', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', border: '1px solid #fde68a' }}>
              🛡️ पराक्रमी मावळे
            </Link>
            <Link to="/history" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #c2410c, #ea580c)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
              📖 मराठा इतिहास कालपट →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
