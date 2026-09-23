import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  REGIONS_DATA, 
  SOURCE_TIERS, 
  CONFIDENCE_LEVELS,
  GRAMDEVAT_TEMPLES_DATA,
  FOOD_CULTURE_DATA,
  KNOWLEDGE_GRAPH_EVENTS
} from '../../data/heritageKnowledgeGraph';

export default function MaharashtraCultureHubPage() {
  const [selectedRegionId, setSelectedRegionId] = useState('konkan');
  const [tripQuery, setTripQuery] = useState('');
  const [generatedRoute, setGeneratedRoute] = useState(null);

  const activeRegion = REGIONS_DATA.find(r => r.id === selectedRegionId) || REGIONS_DATA[0];

  // Quick preset queries for "Connect Everything" discovery
  const sampleQueries = [
    { label: 'पुणे व पश्चिम महाराष्ट्र १-दिवसीय वारसा', query: 'पुण्याजवळचा इतिहास, मंदिर, किल्ला आणि पारंपरिक जेवण असलेला एक दिवसाचा प्रवास' },
    { label: 'कोकण दुर्ग व समुद्रकिनारी खाद्यसंस्कृती', query: 'रायगड दुर्ग, जगदीश्वर मंदिर आणि मालवणी सोलकढी चा प्रवास' },
    { label: 'मराठवाडा अध्यात्म व लेण्यांचा मार्ग', query: 'वेरूळ लेणी, घृष्णेश्वर ज्योतिर्लिंग आणि तुळजापूर दर्शन' },
    { label: 'विदर्भ साओजी खाद्य व प्राचीन किल्ले', query: 'नागपूर साओजी संस्कृती, रामटेक गडमंदिर व पवनी' }
  ];

  const handleGenerateRoute = (queryText) => {
    const q = (queryText || tripQuery).toLowerCase();
    
    if (q.includes('कोकण') || q.includes('रायगड') || q.includes('मालवण') || q.includes('सोलकढी')) {
      setGeneratedRoute({
        title: 'कोकण दुर्ग, कुलदेवता व सागरी खाद्यसंस्कृती मार्ग',
        region: 'कोकण',
        duration: '१ दिवस (सकाळी ७:०० ते रात्री ९:००)',
        steps: [
          { time: '०७:३० AM', place: 'महाड - किल्ले रायगड पायथा', desc: 'शिवराजधानी रायगड गडावर आगमन व रोपवे/पायरी चढाई.', tag: 'दुर्ग', icon: '🏰', image: '/assets/images/real-raigad-bastions.jpg' },
          { time: '०९:०० AM', place: 'राजसदर, नगारखाना व होळीचा माळ', desc: 'इ.स. १६७४ च्या छत्रपती शिवराय राज्याभिषेकाची प्रत्यक्ष भूमी.', tag: 'इतिहास', icon: '👑', image: '/assets/images/real-raigad-panoramic.jpg' },
          { time: '११:३० AM', place: 'श्री जगदीश्वर मंदिर व समाधी स्मारक', desc: 'शिवकालीन जगदीश्वर दर्शन व शिवरायांच्या पवित्र समाधीचे दर्शन.', tag: 'मंदिर', icon: '🛕', image: '/assets/images/real-raigad-mahadarwaja.jpg' },
          { time: '०१:३० PM', place: 'स्थानिक कोकणी खानावळ (महाड)', desc: 'पारंपरिक मालवणी पद्धतीचे जेवण, तांदळाची भाकरी आणि अस्सल सोलकढी.', tag: 'खाद्यसंस्कृती', icon: '🍲', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
          { time: '०३:३० PM', place: 'दासगाव व सावित्री नदी बंदर', desc: 'मराठा आरमाराची ऐतिहासिक व्यापारी व जहाजांची हालचाल अनुभवणे.', tag: 'आरमार', icon: '⚓', image: '/assets/images/real-kanhoji-angre.jpg' },
          { time: '०६:०० PM', place: 'हरिहरेश्वर / श्रीवर्धन समुद्रकिनारा', desc: 'दक्षिण काशी हरिहरेश्वर कालभैरव दर्शन व सूर्यास्त.', tag: 'तीर्थक्षेत्र', icon: '🌊', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' }
        ],
        references: 'महाराष्ट्र शासन गॅझेटिअर - कुलाबा (रायगड) जिल्हा; MTDC कोकण टूरिझम सर्किट.',
        confidence: CONFIDENCE_LEVELS.DOCUMENTED
      });
    } else if (q.includes('मराठवाडा') || q.includes('वेरूळ') || q.includes('तुळजापूर') || q.includes('लेणी')) {
      setGeneratedRoute({
        title: 'मराठवाडा लेणी स्थापत्य, शक्तिपीठ व संत परंपरेचा महामार्ग',
        region: 'मराठवाडा',
        duration: '१ ते २ दिवस',
        steps: [
          { time: '०८:०० AM', place: 'वेरूळ (Ellora) लेणी संकुल', desc: 'युनेस्को जागतिक वारसा - राष्ट्रकूट कालीन कैलास मंदिर (गुंफा क्र. १६) अखंड पाषाण कोरीव काम.', tag: 'UNESCO वारसा', icon: '🏛️', image: 'https://images.unsplash.com/photo-1600100397608-f010f4439c28?auto=format&fit=crop&w=600&q=80' },
          { time: '११:३० AM', place: 'श्री घृष्णेश्वर ज्योतिर्लिंग', desc: '१२ वे ज्योतिर्लिंग, पुण्यश्लोक अहिल्यादेवी होळकर यांनी केलेला जिर्णोद्धार.', tag: 'ज्योतिर्लिंग', icon: '🛕', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
          { time: '०१:३० PM', place: 'स्थानिक मराठवाडी भोजनगृह', desc: 'ज्वारीची भाकरी, ठेचा, शेंगदाणा चटणी, डाळ बट्टी आणि आंबाडीची भाजी.', tag: 'खाद्यसंस्कृती', icon: '🍲', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' },
          { time: '०३:३० PM', place: 'दौलताबाद (देवगिरी) अजिंक्य किल्ला', desc: 'यादवकालीन राजधानी, भारत की अद्वितीय मध्ययुगीन संरक्षण स्थापत्य व खंदक.', tag: 'दुर्ग', icon: '🏰', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80' },
          { time: '०६:३० PM', place: 'तुळजापूर श्री भवानी माता महापीठ', desc: 'स्वराज्य संस्थापकांची कुलस्वामिनी तुळजाभवानी दर्शन व काकड आरती.', tag: 'शक्तिपीठ', icon: '🚩', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80' }
        ],
        references: 'UNESCO World Heritage Dossier 243; पुरातत्त्व व वस्तुसंग्रहालय संचालनालय, महाराष्ट्र शासन.',
        confidence: CONFIDENCE_LEVELS.DOCUMENTED
      });
    } else if (q.includes('विदर्भ') || q.includes('साओजी') || q.includes('नागपूर') || q.includes('रामटेक')) {
      setGeneratedRoute({
        title: 'विदर्भ: रामटेक गडमंदिर, सावजी मेजवानी व ताडोबा अरण्य मार्ग',
        region: 'विदर्भ (नागपूर-वर्धा-चंद्रपूर)',
        duration: '१ ते २ दिवस',
        steps: [
          { time: '०८:०० AM', place: 'रामटेक गडमंदिर (नागपूर)', desc: 'कालिदासाच्या मेघदूताची भूमी व प्रभू रामचंद्रांचे ऐतिहासिक गडमंदिर.', tag: 'तीर्थक्षेत्र', icon: '🛕', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
          { time: '११:३० AM', place: 'गावीलगड / नगरधन किल्ला', desc: 'प्राचीन वाकाटक कालीन स्थापत्य आणि मध्ययुगीन लष्करी ठाणे.', tag: 'दुर्ग', icon: '🏰', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80' },
          { time: '०१:३० PM', place: 'स्थानिक सावजी भोजनालय (नागपूर)', desc: '३२ खड्या मसाल्यांचे अस्सल सावजी मटण/पातोडी रस्सा व गरम भाकरी.', tag: 'खाद्यसंस्कृती', icon: '🍲', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80' },
          { time: '०४:०० PM', place: 'ताडोबा-अंधारी व्याघ्र प्रकल्प परिसर', desc: 'महाराष्ट्रातील सर्वात जुने राष्ट्रीय उद्यान, समृद्ध जैवविविधता व वनसंपदा.', tag: 'निसर्ग व अरण्य', icon: '🐅', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
          { time: '०७:३० PM', place: 'नागपूर संत्रा मार्केट व इतवारी', desc: 'विश्वप्रसिद्ध नागपुरी संत्रा बर्फी व विदर्भाचा प्रसिद्ध चिवडा आस्वाद.', tag: 'स्थानिक बाजार', icon: '🍊', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' }
        ],
        references: 'विदर्भ साहित्य संघ नोंदी व महाराष्ट्र पर्यटन विकास महामंडळ (MTDC) नागपूर सर्किट.',
        confidence: CONFIDENCE_LEVELS.DOCUMENTED
      });
    } else {
      // Default: Western Maharashtra / Pune route
      setGeneratedRoute({
        title: 'पश्चिम महाराष्ट्र: स्वराज्य गड, कुलदैवत व पारंपरिक मिसळ-भाकरी मार्ग',
        region: 'पश्चिम महाराष्ट्र (पुणे-सातारा-कोल्हापूर)',
        duration: '१ दिवस (सकाळी ६:०० ते रात्री ८:००)',
        steps: [
          { time: '०६:३० AM', place: 'पुणे - कात्रज घाट ओलांडून जेजुरी', desc: 'महाराष्ट्राचे कुलदैवत खंडोबा मंदिर (सोन्याची जेजुरी), ऐतिहासिक पायऱ्या व दीपमाळा.', tag: 'कुलदैवत', icon: '☀️', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
          { time: '०९:०० AM', place: 'स्थानिक पारंपरिक नाश्ता (जेजुरी/सासवड)', desc: 'झणझणीत मटकी उसळ, गरमागरम पोहे व गुळाचा चहा.', tag: 'खाद्य', icon: '☕', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80' },
          { time: '१०:३० AM', place: 'किल्ले पुरंदर व वज्रगड', desc: 'छत्रपती संभाजी महाराज जन्मस्थान, मुरारबाजी देशपांडे यांचे अतुलनीय शौर्यपीठ.', tag: 'दुर्ग', icon: '🏰', image: '/assets/images/real-pratapgad-fort.jpg' },
          { time: '०१:३० PM', place: 'सासवड / नारायणपूर अस्सल जेवण', desc: 'चुलीवरची बाजरीची भाकरी, पिठलं, लसूण चटणी आणि ताक.', tag: 'खाद्यसंस्कृती', icon: '🍲', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
          { time: '०३:३० PM', place: 'श्री क्षेत्र भुलेश्वर हेमाडपंथी मंदिर', desc: 'यादवकालीन अत्यंत समृद्ध दगडी कोरीव शिल्पकाम, गुप्त भुयार रचना.', tag: 'प्राचीन वास्तुकला', icon: '🛕', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80' },
          { time: '०६:०० PM', place: 'सिंहगड पायथा / पुणे', desc: 'सूर्यास्ताच्या वेळी सुभेदार तानाजी मालुसरे स्मारक व कल्याण दरवाजा.', tag: 'शौर्यपीठ', icon: '🚩', image: '/assets/images/real-sinhagad-fort.jpg' }
        ],
        references: 'महाराष्ट्र शासन पर्यटन संचनालय (MTDC); बॉम्बे गॅझेटिअर (पुणे व सातारा खंड).',
        confidence: CONFIDENCE_LEVELS.DOCUMENTED
      });
    }
  };

  return (
    <div className="culture-hub-container" style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      
      {/* Top Banner / Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 60%, #E65100 100%)',
        color: '#FFFFFF',
        padding: '50px 20px 40px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <span>🏛️ CONNECT MARATHA</span>
            <span>•</span>
            <span>अधिकृत महाराष्ट्र संस्कृती व वारसा ज्ञानकोश</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            महाराष्ट्राची सांस्कृतिक विविधता
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '24px' }}>
            कोकणापासून विदर्भापर्यंत आणि खानदेशापासून पश्चिम महाराष्ट्रापर्यंत—आपल्या राज्याची प्रादेशिक अस्मिता, 
            भाषा-बोली, खाद्यसंस्कृती, ग्रामदैवते, लोककला व ऐतिहासिक संदर्भ एकात्मिक ज्ञानप्रणालीत (Knowledge Graph) जोडणारा महामंच.
          </p>

          {/* Quick Sub-Pillars Navigation Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Link to="/culture/dialects" style={{ background: '#FFFFFF', color: '#B91C1C', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🗣️ भाषा व बोली आर्काइव्ह
            </Link>
            <Link to="/culture/food" style={{ background: '#FFFFFF', color: '#B91C1C', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🍲 महाराष्ट्राची खाद्यसंस्कृती
            </Link>
            <Link to="/culture/gramdevat-jatra" style={{ background: '#FFFFFF', color: '#B91C1C', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🛕 ग्रामदैवत, जत्रा व खेळ-नाट्य
            </Link>
            <Link to="/culture/heritage-map" style={{ background: '#FFFFFF', color: '#B91C1C', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🗺️ परस्परसंवादी वारसा नकाशा
            </Link>
            <Link to="/history/knowledge-graph" style={{ background: '#FEF3C7', color: '#92400E', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              ⚡ घटना ↔ स्थळे नॉलेज ग्राफ
            </Link>
            <Link to="/community/oral-history" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              📜 मौखिक इतिहास संकलन
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* Section 1: 8 Regional Cultural Profiles */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <span style={{ color: '#B91C1C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                विभाग १ • प्रादेशिक सांस्कृतिक विविधता
              </span>
              <h2 style={{ fontSize: '1.9rem', color: '#7C1D05', fontWeight: 800 }}>
                महाराष्ट्राचे ८ प्रमुख सांस्कृतिक प्रदेश
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                प्रत्येक प्रदेशाची स्वतंत्र भौगोलिक वैशिष्ट्ये, लोकभाषा, खाद्यपरंपरा व ऐतिहासिक गड-मंदिरांचा शोध घ्या.
              </p>
            </div>
            
            {/* Confidence & Reference Legend Indicator */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#1E40AF' }}>
              <strong>संदर्भ आधार:</strong> महाराष्ट्र पर्यटन संचालनालय (MTDC), पुराभिलेख व गॅझेटिअर (Tier 1 & 2)
            </div>
          </div>

          {/* Region Tabs with Visual Thumbnails */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {REGIONS_DATA.map(region => {
              const isActive = region.id === selectedRegionId;
              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  style={{
                    background: isActive ? '#B91C1C' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#374151',
                    border: isActive ? '2px solid #7C1D05' : '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 8px 18px rgba(185,28,28,0.35)' : '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: isActive ? '2px solid #FFFFFF' : '2px solid #FCD34D',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    position: 'relative',
                    background: '#F3F4F6'
                  }}>
                    <img 
                      src={region.heroImage} 
                      alt={region.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      background: 'rgba(0,0,0,0.2)'
                    }}>
                      {region.icon}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.2 }}>{region.name.split(' (')[0]}</div>
                  <div style={{ fontSize: '0.72rem', opacity: isActive ? 0.9 : 0.6 }}>{region.nameEn.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Active Region Full Knowledge Card with Rich Panoramic Hero */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #F3E8D8',
            boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            {/* Card Header: Panoramic Visual Banner with Gradient Overlay */}
            <div style={{
              position: 'relative',
              minHeight: '220px',
              backgroundImage: `linear-gradient(to right, rgba(20, 6, 2, 0.92) 0%, rgba(124, 29, 5, 0.82) 55%, rgba(0, 0, 0, 0.45) 100%), url(${activeRegion.heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '30px 32px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
              borderBottom: '4px solid #F59E0B'
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>
                  <span>{activeRegion.icon}</span>
                  <span>{activeRegion.marathiName || activeRegion.name}</span>
                </div>
                <h3 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 6px 0', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                  {activeRegion.name}
                </h3>
                <p style={{ fontSize: '1rem', color: '#FEF3C7', maxWidth: '720px', margin: '0 0 10px 0', lineHeight: 1.4, fontStyle: 'italic' }}>
                  "{activeRegion.tagline}"
                </p>
                <div style={{ fontSize: '0.85rem', color: '#FDE68A', fontWeight: 600 }}>
                  📍 समाविष्ट जिल्हे: {activeRegion.districts.join(', ')}
                </div>
              </div>

              {/* Source & Confidence Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{
                  background: activeRegion.confidence.bg,
                  color: activeRegion.confidence.color,
                  border: `1px solid ${activeRegion.confidence.color}`,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {activeRegion.confidence.icon} {activeRegion.confidence.label}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#FCD34D', background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: '6px' }}>
                  {activeRegion.sourceTier.badge}
                </span>
              </div>
            </div>

            {/* Cultural Attributes Grid - 4 Image-backed Pillar Cards */}
            <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* 1. Lifestyle & Nature (जीवनशैली व निसर्ग) */}
              <div style={{ background: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCFCE7', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden', background: '#E2E8F0' }}>
                  <img 
                    src={activeRegion.lifestyleImage} 
                    alt={activeRegion.name + ' lifestyle'}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    🌿 जीवनशैली व परिसर
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontWeight: 800, color: '#15803D', fontSize: '1.1rem' }}>
                      भौगोलिक परिसर व जीवनधारा
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#166534', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      {activeRegion.cultureProfile.lifestyle}
                    </p>
                    {activeRegion.cultureHighlights && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {activeRegion.cultureHighlights.map((hl, i) => (
                          <div key={i} style={{ fontSize: '0.82rem', color: '#14532D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span> {hl}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Food Culture (खाद्यसंस्कृतीची वैशिष्ट्ये) */}
              <div style={{ background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FEE2E2', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden', background: '#E2E8F0' }}>
                  <img 
                    src={activeRegion.foodImage} 
                    alt={activeRegion.name + ' cuisine'}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    🍲 प्रादेशिक खाद्यसंस्कृती
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontWeight: 800, color: '#B91C1C', fontSize: '1.1rem' }}>
                      अस्सल चव व स्वाक्षरी पदार्थ
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#991B1B', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      {activeRegion.cultureProfile.foodCulture}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {activeRegion.cultureProfile.signatureDishes.map((dish, i) => (
                        <span key={i} style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', color: '#B91C1C', fontWeight: 600 }}>
                          🍽️ {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to="/culture/food" style={{ color: '#B91C1C', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>
                    या प्रदेशाचे संपूर्ण खाद्यसंस्कृती कोश पहा →
                  </Link>
                </div>
              </div>

              {/* 3. Folk Art & Festivals (लोककला, नाट्य व उत्सव) */}
              <div style={{ background: '#FAF5FF', borderRadius: '16px', border: '1px solid #F3E8FF', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden', background: '#E2E8F0' }}>
                  <img 
                    src={activeRegion.artImage} 
                    alt={activeRegion.name + ' folk arts'}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    🎭 लोककला, नाट्य व सण
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontWeight: 800, color: '#7E22CE', fontSize: '1.1rem' }}>
                      उत्सव, जत्रा व रंगभूमी परंपरा
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {activeRegion.cultureProfile.festivals.map((fest, i) => (
                        <span key={i} style={{ background: '#F3E8FF', color: '#6B21A8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          🚩 {fest}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {activeRegion.cultureProfile.folkArts.map((art, i) => (
                        <span key={i} style={{ background: '#FFFFFF', border: '1px solid #E9D5FF', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', color: '#7E22CE', fontWeight: 600 }}>
                          🎭 {art}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <Link to="/culture/gramdevat-jatra" style={{ color: '#7E22CE', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>
                      जत्रा व नाट्य कॅलेंडर उघडा →
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. Forts & Temples (प्रमुख दुर्ग व तीर्थक्षेत्रे) */}
              <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden', background: '#E2E8F0' }}>
                  <img 
                    src={activeRegion.fortImage} 
                    alt={activeRegion.name + ' forts and temples'}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    🏰 दुर्ग व तीर्थक्षेत्रे
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontWeight: 800, color: '#334155', fontSize: '1.1rem' }}>
                      ऐतिहासिक गडकोट व पवित्र स्थाने
                    </h4>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>किल्ले: </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {activeRegion.cultureProfile.forts.map((fort, i) => (
                          <span key={i} style={{ background: '#E2E8F0', color: '#1E293B', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                            🏰 {fort}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>मंदिरे: </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {activeRegion.cultureProfile.temples.map((temple, i) => (
                          <span key={i} style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                            🛕 {temple}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <Link to="/culture/heritage-map" style={{ color: '#0369A1', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>
                      वारसा नकाशावर स्थाने पहा →
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* Official Source Reference Bar */}
            <div style={{
              background: '#F9FAFB',
              borderTop: '1px solid #E5E7EB',
              padding: '16px 30px',
              fontSize: '0.85rem',
              color: '#4B5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <strong>प्रमाणीकरण संदर्भ:</strong> {activeRegion.reference}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link to="/culture/heritage-map" style={{ color: '#B91C1C', fontWeight: 700 }}>
                  🗺️ या प्रदेशाचा नकाशा उघडा
                </Link>
                <Link to="/history/knowledge-graph" style={{ color: '#B91C1C', fontWeight: 700 }}>
                  🔗 इतिहास संबंध आलेख
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: "Connect Everything" Interactive Discovery Route Generator */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          borderRadius: '20px',
          border: '2px solid #FCD34D',
          padding: '36px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(245,158,11,0.1)'
        }}>
          <div style={{ maxWidth: '850px', marginBottom: '20px' }}>
            <span style={{ background: '#F59E0B', color: '#78350F', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
              CONNECT EVERYTHING तंत्रज्ञान
            </span>
            <h2 style={{ fontSize: '1.8rem', color: '#78350F', fontWeight: 800, marginTop: '10px', marginBottom: '8px' }}>
              "इतिहास + मंदिर + किल्ला + खाद्यसंस्कृती + पर्यटन मार्ग" एकात्मिक शोध
            </h2>
            <p style={{ color: '#92400E', fontSize: '0.95rem', lineHeight: 1.6 }}>
              आपल्याला काय हवे आहे ते सांगा (उदा. <em>"मला पुण्याजवळचा इतिहास, मंदिर, किल्ला आणि पारंपरिक जेवण असलेला एक दिवसाचा प्रवास हवा."</em>).
              कनेक्ट मराठा नॉलेज ग्राफ सर्व दुवे जोडून आपल्यासाठी अधिकृत संदर्भ व वेळेसह परिपूर्ण मार्ग तयार करतो!
            </p>
          </div>

          {/* Search Box & Presets */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <input
              type="text"
              value={tripQuery}
              onChange={(e) => setTripQuery(e.target.value)}
              placeholder="उदा. पुण्याजवळचा इतिहास, मंदिर, किल्ला आणि पारंपरिक जेवण..."
              style={{
                flex: '1',
                minWidth: '280px',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '2px solid #F59E0B',
                fontSize: '1rem',
                outline: 'none',
                background: '#FFFFFF',
                color: '#1F2937'
              }}
            />
            <button
              onClick={() => handleGenerateRoute(tripQuery)}
              style={{
                background: 'linear-gradient(135deg, #B91C1C 0%, #7C1D05 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(185,28,28,0.3)'
              }}
            >
              मार्ग जोडा व शोधा ⚡
            </button>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#78350F', fontWeight: 700 }}>लोकप्रिय नमुने:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setTripQuery(sq.query);
                  handleGenerateRoute(sq.query);
                }}
                style={{
                  background: '#FFFFFF',
                  color: '#92400E',
                  border: '1px solid #FCD34D',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {sq.label}
              </button>
            ))}
          </div>

          {/* Generated Result Container with Visual Milestones */}
          {generatedRoute && (
            <div style={{
              marginTop: '28px',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #FDE68A',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    सत्यापित वारसा मार्ग (Verified Route)
                  </span>
                  <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, marginTop: '6px' }}>
                    {generatedRoute.title}
                  </h3>
                  <div style={{ color: '#4B5563', fontSize: '0.85rem' }}>
                    प्रदेश: <strong>{generatedRoute.region}</strong> • अंदाजे वेळ: <strong>{generatedRoute.duration}</strong>
                  </div>
                </div>

                <span style={{
                  background: generatedRoute.confidence.bg,
                  color: generatedRoute.confidence.color,
                  border: `1px solid ${generatedRoute.confidence.color}`,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {generatedRoute.confidence.icon} {generatedRoute.confidence.label}
                </span>
              </div>

              {/* Timeline Steps with Photos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
                {generatedRoute.steps.map((st, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'stretch',
                    background: '#F9FAFB',
                    borderRadius: '14px',
                    border: '1px solid #E5E7EB',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}>
                    {/* Time Pill */}
                    <div style={{
                      minWidth: '85px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      padding: '16px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      {st.time}
                    </div>

                    {/* Step Thumbnail Photo */}
                    {st.image && (
                      <div style={{ width: '120px', minHeight: '90px', flexShrink: 0, overflow: 'hidden', background: '#E2E8F0' }}>
                        <img 
                          src={st.image} 
                          alt={st.place}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    {/* Step Description */}
                    <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1F2937' }}>
                          {st.icon} {st.place}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#E0E7FF', color: '#3730A3', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {st.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.4 }}>
                        {st.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                <strong>पुरातत्त्व व गॅझेटिअर संदर्भ:</strong> {generatedRoute.references}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Reference Hierarchy & Confidence System explanation */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E5E7EB',
          padding: '30px',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', fontWeight: 800, marginBottom: '8px' }}>
            📚 संदर्भ चौकट व ऐतिहासिक सत्यता प्रणाली (Reference & Confidence System)
          </h3>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '20px' }}>
            कनेक्ट मराठावर प्रत्येक नोंदीचे वर्गीकरण अधिकृत दस्तऐवज, शैक्षणिक संशोधन, संस्थात्मक संग्रह आणि जनसामान्यांच्या मौखिक परंपरेमध्ये स्पष्टपणे केले जाते:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {Object.values(CONFIDENCE_LEVELS).map(conf => (
              <div key={conf.id} style={{
                background: conf.bg,
                border: `1px solid ${conf.color}30`,
                padding: '16px',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: conf.color, fontWeight: 800, marginBottom: '6px' }}>
                  <span>{conf.icon}</span>
                  <span>{conf.label}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.4 }}>
                  {conf.description}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
