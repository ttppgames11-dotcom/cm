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
          { time: '०७:३० AM', place: 'महाड - किल्ले रायगड पायथा', desc: 'शिवराजधानी रायगड गडावर आगमन व रोपवे/पायरी चढाई.', tag: 'दुर्ग', icon: '🏰' },
          { time: '०९:०० AM', place: 'राजसदर, नगारखाना व होळीचा माळ', desc: 'इ.स. १६७४ च्या छत्रपती शिवराय राज्याभिषेकाची प्रत्यक्ष भूमी.', tag: 'इतिहास', icon: '👑' },
          { time: '११:३० AM', place: 'श्री जगदीश्वर मंदिर व समाधी स्मारक', desc: 'शिवकालीन जगदीश्वर दर्शन व शिवरायांच्या पवित्र समाधीचे दर्शन.', tag: 'मंदिर', icon: '🛕' },
          { time: '०१:३० PM', place: 'स्थानिक कोकणी खानावळ (महाड)', desc: 'पारंपरिक मालवणी पद्धतीचे जेवण, तांदळाची भाकरी आणि अस्सल सोलकढी.', tag: 'खाद्यसंस्कृती', icon: '🍲' },
          { time: '०३:३० PM', place: 'दासगाव व सावित्री नदी बंदर', desc: 'मराठा आरमाराची ऐतिहासिक व्यापारी व जहाजांची हालचाल अनुभवणे.', tag: 'आरमार', icon: '⚓' },
          { time: '०६:०० PM', place: 'हरिहरेश्वर / श्रीवर्धन समुद्रकिनारा', desc: 'दक्षिण काशी हरिहरेश्वर कालभैरव दर्शन व सूर्यास्त.', tag: 'तीर्थक्षेत्र', icon: '🌊' }
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
          { time: '०८:०० AM', place: 'वेरूळ (Ellora) लेणी संकुल', desc: 'युनेस्को जागतिक वारसा - राष्ट्रकूट कालीन कैलास मंदिर (गुंफा क्र. १६) अखंड पाषाण कोरीव काम.', tag: 'UNESCO वारसा', icon: '🏛️' },
          { time: '११:३० AM', place: 'श्री घृष्णेश्वर ज्योतिर्लिंग', desc: '१२ वे ज्योतिर्लिंग, पुण्यश्लोक अहिल्यादेवी होळकर यांनी केलेला जिर्णोद्धार.', tag: 'ज्योतिर्लिंग', icon: '🛕' },
          { time: '०१:३० PM', place: 'स्थानिक मराठवाडी भोजनगृह', desc: 'ज्वारीची भाकरी, ठेचा, शेंगदाणा चटणी, डाळ बट्टी आणि आंबाडीची भाजी.', tag: 'खाद्यसंस्कृती', icon: '🍲' },
          { time: '०३:३० PM', place: 'दौलताबाद (देवगिरी) अजिंक्य किल्ला', desc: 'यादवकालीन राजधानी, भारत की अद्वितीय मध्ययुगीन संरक्षण स्थापत्य व खंदक.', tag: 'दुर्ग', icon: '🏰' },
          { time: '०६:३० PM', place: 'तुळजापूर श्री भवानी माता महापीठ', desc: 'स्वराज्य संस्थापकांची कुलस्वामिनी तुळजाभवानी दर्शन व काकड आरती.', tag: 'शक्तिपीठ', icon: '🚩' }
        ],
        references: 'UNESCO World Heritage Dossier 243; पुरातत्त्व व वस्तुसंग्रहालय संचालनालय, महाराष्ट्र शासन.',
        confidence: CONFIDENCE_LEVELS.DOCUMENTED
      });
    } else {
      // Default: Western Maharashtra / Pune route
      setGeneratedRoute({
        title: 'पश्चिम महाराष्ट्र: स्वराज्य गड, कुलदैवत व पारंपरिक मिसळ-भाकरी मार्ग',
        region: 'पश्चिम महाराष्ट्र (पुणे-सातारा-कोल्हापूर)',
        duration: '१ दिवस (सकाळी ६:०० ते रात्री ८:००)',
        steps: [
          { time: '०६:३० AM', place: 'पुणे - कात्रज घाट ओलांडून जेजुरी', desc: 'महाराष्ट्राचे कुलदैवत खंडोबा मंदिर (सोन्याची जेजुरी), ऐतिहासिक पायऱ्या व दीपमाळा.', tag: 'कुलदैवत', icon: '☀️' },
          { time: '०९:०० AM', place: 'स्थानिक पारंपरिक नाश्ता (जेजुरी/सासवड)', desc: 'झणझणीत मटकी उसळ, गरमागरम पोहे व गुळाचा चहा.', tag: 'खाद्य', icon: '☕' },
          { time: '१०:३० AM', place: 'किल्ले पुरंदर व वज्रगड', desc: 'छत्रपती संभाजी महाराज जन्मस्थान, मुरारबाजी देशपांडे यांचे अतुलनीय शौर्यपीठ.', tag: 'दुर्ग', icon: '🏰' },
          { time: '०१:३० PM', place: 'सासवड / नारायणपूर अस्सल जेवण', desc: 'चुलीवरची बाजरीची भाकरी, पिठलं, लसूण चटणी आणि ताक.', tag: 'खाद्यसंस्कृती', icon: '🍲' },
          { time: '०३:३० PM', place: 'श्री क्षेत्र भुलेश्वर हेमाडपंथी मंदिर', desc: 'यादवकालीन अत्यंत समृद्ध दगडी कोरीव शिल्पकाम, गुप्त भुयार रचना.', tag: 'प्राचीन वास्तुकला', icon: '🛕' },
          { time: '०६:०० PM', place: 'सिंहगड पायथा / पुणे', desc: 'सूर्यास्ताच्या वेळी सुभेदार तानाजी मालुसरे स्मारक व कल्याण दरवाजा.', tag: 'शौर्यपीठ', icon: '🚩' }
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

          {/* Region Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
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
                    borderRadius: '12px',
                    padding: '14px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 6px 16px rgba(185,28,28,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{region.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{region.name}</div>
                  <div style={{ fontSize: '0.72rem', opacity: isActive ? 0.9 : 0.6 }}>{region.nameEn}</div>
                </button>
              );
            })}
          </div>

          {/* Active Region Full Knowledge Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #F3E8D8',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            overflow: 'hidden'
          }}>
            {/* Card Header with Banner */}
            <div style={{
              background: 'linear-gradient(90deg, #FDE68A 0%, #FED7AA 100%)',
              padding: '24px 30px',
              borderBottom: '1px solid #FCD34D',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2.5rem', background: '#FFFFFF', padding: '10px 14px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                  {activeRegion.icon}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                    {activeRegion.name} ({activeRegion.nameEn})
                  </h3>
                  <div style={{ color: '#92400E', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>
                    समाविष्ट जिल्हे: {activeRegion.districts.join(', ')}
                  </div>
                </div>
              </div>

              {/* Source Attribution Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  background: activeRegion.confidence.bg,
                  color: activeRegion.confidence.color,
                  border: `1px solid ${activeRegion.confidence.color}`,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  {activeRegion.confidence.icon} {activeRegion.confidence.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {activeRegion.sourceTier.badge}
                </span>
              </div>
            </div>

            {/* Cultural Attributes Grid */}
            <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Dialects & Speech */}
              <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: '14px', border: '1px solid #FEF3C7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#B45309' }}>
                  <span style={{ fontSize: '1.3rem' }}>🗣️</span>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>भाषा व प्रमुख बोली</h4>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#78350F', marginBottom: '6px' }}>
                  {activeRegion.cultureProfile.language}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#4B5563' }}>
                  स्थानिक संवाद, लहेजा आणि वाक्प्रचार या प्रदेशाच्या दैनंदिन संभाषणाला समृद्ध रूप देतात.
                </div>
                <div style={{ marginTop: '12px' }}>
                  <Link to="/culture/dialects" style={{ color: '#B91C1C', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>
                    या बोलीतील संवाद ऐका व तुलना करा →
                  </Link>
                </div>
              </div>

              {/* Lifestyle & Geog */}
              <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#15803D' }}>
                  <span style={{ fontSize: '1.3rem' }}>🌊</span>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>जीवनशैली व निसर्ग</h4>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#166534', lineHeight: 1.5 }}>
                  {activeRegion.cultureProfile.lifestyle}
                </div>
              </div>

              {/* Food Culture */}
              <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '14px', border: '1px solid #FEE2E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#B91C1C' }}>
                  <span style={{ fontSize: '1.3rem' }}>🍲</span>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>खाद्यसंस्कृतीची वैशिष्ट्ये</h4>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#991B1B', lineHeight: 1.5, marginBottom: '8px' }}>
                  {activeRegion.cultureProfile.foodCulture}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeRegion.cultureProfile.signatureDishes.map((dish, i) => (
                    <span key={i} style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', color: '#B91C1C', fontWeight: 600 }}>
                      🍽️ {dish}
                    </span>
                  ))}
                </div>
              </div>

              {/* Festivals & Jatras */}
              <div style={{ background: '#FAF5FF', padding: '20px', borderRadius: '14px', border: '1px solid #F3E8FF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#7E22CE' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎉</span>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>प्रमुख सण, जत्रा व उत्सव</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {activeRegion.cultureProfile.festivals.map((fest, i) => (
                    <span key={i} style={{ background: '#F3E8FF', color: '#6B21A8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                      🚩 {fest}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#581C87' }}>
                  स्थानिक ग्रामदैवते आणि वार्षिक यात्रांमध्ये या सणांची उत्स्फूर्त ऊर्जा दिसते.
                </div>
              </div>

              {/* Folk Art & Theatre */}
              <div style={{ background: '#FFF1F2', padding: '20px', borderRadius: '14px', border: '1px solid #FFE4E6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#BE123C' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎭</span>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>लोककला, नाट्य व खेळ</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeRegion.cultureProfile.folkArts.map((art, i) => (
                    <span key={i} style={{ background: '#FFFFFF', border: '1px solid #FECDD3', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', color: '#9F1239', fontWeight: 700 }}>
                      🎭 {art}
                    </span>
                  ))}
                </div>
              </div>

              {/* Forts & Temples */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#334155' }}>
                  <span style={{ fontSize: '1.3rem' }}>🏰</span>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>प्रमुख दुर्ग व तीर्थक्षेत्रे</h4>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>किल्ले: </span>
                  <span style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>{activeRegion.cultureProfile.forts.join(', ')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>मंदिरे: </span>
                  <span style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>{activeRegion.cultureProfile.temples.join(', ')}</span>
                </div>
              </div>

            </div>

            {/* Official Source Reference Bar */}
            <div style={{
              background: '#F9FAFB',
              borderTop: '1px solid #E5E7EB',
              padding: '14px 30px',
              fontSize: '0.82rem',
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

          {/* Generated Result Container */}
          {generatedRoute && (
            <div style={{
              marginTop: '28px',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #FDE68A',
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    सत्यापित वारसा मार्ग (Verified Route)
                  </span>
                  <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', fontWeight: 800, marginTop: '6px' }}>
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

              {/* Timeline Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
                {generatedRoute.steps.map((st, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      minWidth: '70px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      {st.time}
                    </div>

                    <div style={{
                      flex: 1,
                      background: '#F9FAFB',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      borderLeft: '4px solid #B91C1C'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                          {st.icon} {st.place}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#E5E7EB', color: '#374151', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {st.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.4 }}>
                        {st.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
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
