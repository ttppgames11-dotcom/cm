import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_TRAILS = [
  {
    id: 'trail_1',
    title: 'तोरणा → राजगड → रायगड (स्वराज्य विजय व राजधानी महामार्ग)',
    route: 'किल्ले तोरणा ते किल्ले राजगड ते दुर्गराज रायगड',
    region: 'पुणे - वेल्हे - महाड (सह्याद्री मुख्य रांग)',
    diff: 'कठीण (Hard)',
    diffColor: '#DC2626',
    time: '३–४ दिवस (१६० किमी)',
    distance: '~१६० किमी',
    desc: 'स्वराज्याच्या स्थापनेपासून ते छत्रपतींच्या राज्याभिषेक सिंहासनापर्यंतचा ऐतिहासिक प्रवास — पहिला विजय (तोरणा), पहिली दीर्घकालीन राजधानी (राजगड) आणि अंतिम महासाम्राज्याची राजधानी (दुर्गराज रायगड) असा तीन अद्वितीय टप्प्यांचा महामार्ग.',
    forts: ['किल्ले तोरणा', 'किल्ले राजगड', 'दुर्गराज रायगड'],
    highlights: 'झुंजार माची, संजीवनी माचीचे दुहेरी बुरूज, महादरवाजा, टकमक टोक व शिवराय समाधी.',
    bestSeason: 'ऑक्टोबर ते फेब्रुवारी (हिवाळा)'
  },
  {
    id: 'trail_2',
    title: 'पन्हाळा → पावनखिंड → विशाळगड (अमर शौर्य व बलिदान स्मृती ट्रेल)',
    route: 'किल्ले पन्हाळा ते घोडखिंड (पावनखिंड) ते किल्ले विशाळगड',
    region: 'कोल्हापूर (पन्हाळा-शाहुवाडी)',
    diff: 'मध्यम-दीर्घ (Moderate)',
    diffColor: '#EA580C',
    time: '२ दिवस (रात्रीचा प्रवास)',
    distance: '~६५ किमी (४७ किमी पायी)',
    desc: 'सिद्दी जौहरच्या वेढ्यातून छत्रपती शिवाजी महाराजांची थरारक सुटका, मध्यरात्रीचा मुसळधार पावसात प्रवास आणि बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे पावनखिंडीतील अमर आत्मबलिदान प्रत्यक्ष अनुभवणारा भावनिक व ऐतिहासिक मार्ग.',
    forts: ['किल्ले पन्हाळा', 'पावनखिंड', 'किल्ले विशाळगड'],
    highlights: 'तीन दरवाजा, सज्जा कोठी, पावनखिंड स्मारक, विशाळगड रणमंडळ.',
    bestSeason: 'जुलै (पावसाळी पदभ्रमण स्मृती) किंवा नोव्हेंबर ते जानेवारी'
  },
  {
    id: 'trail_3',
    title: 'शिवनेरी → जुन्नर लेणी → चाकण संग्रामदुर्ग (शिवजन्मोत्सव ट्रेल)',
    route: 'किल्ले शिवनेरी ते जुन्नर प्राचीन बाजारपेठ ते चाकण किल्ला',
    region: 'पुणे उत्तर (जुन्नर-चाकण)',
    diff: 'सोपा (Easy)',
    diffColor: '#16A34A',
    time: '१–२ दिवस',
    distance: '~९५ किमी',
    desc: 'स्वराज्याच्या संस्थापकांच्या जन्मभूमीपासून सुरू होणारा वारसा प्रवास — शिवनेरीवरील शिवाई देवी मंदिर, शिवजन्मस्थान जिजाऊ वाडा, जुन्नरमधील प्राचीन बौद्ध लेणी, आणि फिरंगोजी नरसाळा यांच्या वीर लढ्याची साक्ष देणारा चाकणचा भुईकोट.',
    forts: ['किल्ले शिवनेरी', 'चाकण भुईकोट', 'लेण्याद्री', 'जुन्नर लेणी'],
    highlights: 'शिवाई देवी, अंबरखाना, बदामी तलाव, फिरंगोजी नरसाळा शौर्य स्थळ.',
    bestSeason: 'वर्षभर (विशेषतः फेब्रुवारी शिवजयंती महिना)'
  },
  {
    id: 'trail_4',
    title: 'प्रतापगड → जावळी अरण्य → महाबळेश्वर (अफझलखान रणभूमी ट्रेल)',
    route: 'किल्ले प्रतापगड ते जावळीचे घनदाट खोरे ते महाबळेश्वर',
    region: 'सातारा (महाबळेश्वर-वाई)',
    diff: 'मध्यम (Moderate)',
    diffColor: '#EA580C',
    time: '१ दिवस (५–६ तास)',
    distance: '~२५ किमी',
    desc: '१० नोव्हेंबर १६५९ च्या ऐतिहासिक अफझलखान वधाची रणभूमी. मोरोपंत पिंगळे व कान्होजी जेधे यांच्या रणनीतीची साक्ष देणारे जावळीचे दुर्गम अरण्य आणि छत्रपती शिवरायांनी स्थापन केलेले भवानी माता मंदिर.',
    forts: ['किल्ले प्रतापगड', 'जावळी खोरे', 'महाबळेश्वर देवस्थान'],
    highlights: 'भवानी माता मंदिर, बालेकिल्ला, अफझलखान कबर परिसर, बुरूज दर्शन.',
    bestSeason: 'ऑक्टोबर ते मार्च'
  },
  {
    id: 'trail_5',
    title: 'सिंधुदुर्ग → विजयदुर्ग → सुवर्णदुर्ग (आरमारी जलदुर्ग महापरिक्रमा)',
    route: 'मालवण सिंधुदुर्ग ते राजापूर विजयदुर्ग ते दापोली सुवर्णदुर्ग',
    region: 'कोकण किनारपट्टी (सिंधुदुर्ग - रत्नागिरी)',
    diff: 'सोपा (जलदुर्ग नौका सफर)',
    diffColor: '#0284C7',
    time: '३ दिवस',
    distance: '~२२० किमी सागरी पट्टा',
    desc: 'मराठा आरमाराचे जनक छत्रपती शिवराय आणि सरखेल कान्होजी आंग्रे यांच्या सागरी वर्चस्वाची साक्ष देणारा कोकण किनारपट्टीवरील अभेद्य जलदुर्ग मार्ग — समुद्रात शिशाचा पाया ओतून बांधलेले बुरूज आणि तिहेरी तटबंदी.',
    forts: ['किल्ले सिंधुदुर्ग', 'किल्ले विजयदुर्ग', 'किल्ले सुवर्णदुर्ग', 'पद्मदुर्ग'],
    highlights: 'शिवरायांच्या हाताचे व पायाचे ठसे, विजयदुर्गातील भुयारी मार्ग व गोदी, समुद्रातील नौका सफर.',
    bestSeason: 'ऑक्टोबर ते मे'
  },
  {
    id: 'trail_6',
    title: 'कात्रज ते सिंहगड नाईट ट्रेक (तानाजी मालुसरे शौर्य ट्रेल)',
    route: 'कात्रज जुना बोगदा ते डोंगरमाथ्यावरून किल्ले सिंहगड',
    region: 'पुणे (हवेली)',
    diff: 'मध्यम-दीर्घ (Night Trek)',
    diffColor: '#EA580C',
    time: '१ रात्र (७–८ तास)',
    distance: '~१६ किमी डोंगररांग',
    desc: 'पुण्यातील तरुणाईचा अत्यंत लोकप्रिय ऐतिहासिक नाईट ट्रेक. १६ डोंगरांच्या सलग चढाओढीतून पहाटे सिंहगडावर कल्याण दरवाजाने प्रवेश आणि सुभेदार तानाजी मालुसरेंच्या बलिदानाला मानवंदना.',
    forts: ['किल्ले सिंहगड'],
    highlights: 'तानाजी मालुसरे समाधी, कल्याण दरवाजा, देवटाके, पुणे शहराचे रात्रीचे विहंगम दृश्य.',
    bestSeason: 'नोव्हेंबर ते मार्च (पौर्णिमेच्या रात्री सर्वोत्तम)'
  },
  {
    id: 'trail_7',
    title: 'हरिश्चंद्रगड ते नळिची वाट (सह्याद्रीचे सर्वोच्च आव्हान)',
    route: 'बेळपाडा ते नळिची वाट ते कोकणकडा ते तारामती शिखर',
    region: 'अहिल्यानगर (अकोले)',
    diff: 'अति-कठीण (Extreme)',
    diffColor: '#7F1D1D',
    time: '२ दिवस',
    distance: '~१२ किमी प्रस्तरारोहण',
    desc: 'सह्याद्रीचा सम्राट कोकणकडा आणि नळिची खडतर वाट. प्राचीन हरिश्चंद्रेश्वर मंदिर, पुष्करणी आणि तीन खांबांवर तोललेले केदारेश्वर गुहा मंदिर.',
    forts: ['किल्ले हरिश्चंद्रगड', 'कोकणकडा', 'तारामती शिखर'],
    highlights: 'कोकणकडा अर्धवर्तुळाकार कडा, इंद्रवज्र, केदारेश्वर शिवलिंग, लेणी समूह.',
    bestSeason: 'ऑक्टोबर ते फेब्रुवारी'
  }
];

export default function HeritageTrailsPage() {
  const [trails, setTrails] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_heritage_trails_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TRAILS;
  });

  const [activeDiff, setActiveDiff] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    route: '',
    region: '',
    diff: 'मध्यम (Moderate)',
    diffColor: '#EA580C',
    time: '१-२ दिवस',
    distance: '~५० किमी',
    desc: '',
    fortsStr: '',
    highlights: '',
    bestSeason: 'ऑक्टोबर ते फेब्रुवारी'
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_heritage_trails_data', JSON.stringify(trails));
    } catch (e) {
      console.error(e);
    }
  }, [trails]);

  const filteredTrails = trails.filter(t => {
    const matchesDiff = activeDiff === 'all' || t.diff.includes(activeDiff);
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiff && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      route: '',
      region: '',
      diff: 'मध्यम (Moderate)',
      diffColor: '#EA580C',
      time: '१-२ दिवस',
      distance: '~४० किमी',
      desc: '',
      fortsStr: 'किल्ले राजगड, किल्ले तोरणा',
      highlights: '',
      bestSeason: 'ऑक्टोबर ते फेब्रुवारी'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditItem(t);
    setFormData({
      title: t.title,
      route: t.route || '',
      region: t.region,
      diff: t.diff,
      diffColor: t.diffColor || '#EA580C',
      time: t.time,
      distance: t.distance || '',
      desc: t.desc,
      fortsStr: Array.isArray(t.forts) ? t.forts.join(', ') : '',
      highlights: t.highlights || '',
      bestSeason: t.bestSeason || 'हिवाळा'
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('हा ट्रेक मार्ग रेकॉर्ड हटवायचा आहे का?')) {
      setTrails(trails.filter(t => t.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व वारसा ट्रेल्स मूळ अधिकृत डेटावर रीसेट करायचे आहेत का?')) {
      setTrails(DEFAULT_TRAILS);
      localStorage.setItem('cm_heritage_trails_data', JSON.stringify(DEFAULT_TRAILS));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.region.trim()) {
      alert('कृपया ट्रेलचे नाव आणि परिसर प्रविष्ट करा.');
      return;
    }

    const fortsArray = formData.fortsStr
      ? formData.fortsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (editItem) {
      setTrails(trails.map(t => t.id === editItem.id ? {
        ...t,
        ...formData,
        forts: fortsArray
      } : t));
    } else {
      const newTrail = {
        id: 'trail_' + Date.now(),
        ...formData,
        forts: fortsArray
      };
      setTrails([newTrail, ...trails]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1C0A00 0%, #3D1200 50%, #5C1E00 100%)',
          borderRadius: '24px',
          padding: '44px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 20px 50px rgba(45,15,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.25)', border: '1px solid #DD8A2E', padding: '5px 16px', borderRadius: '24px', marginBottom: '14px' }}>
                <span style={{ color: '#FFD700' }}>🥾</span>
                <span style={{ color: '#FDF3E6', fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  सह्याद्री बहु-किल्ले पदभ्रमण • हेरिटेज ट्रेल्स
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                margin: '0 0 10px',
                color: '#FFF',
                lineHeight: 1.2
              }}>
                वारसा भ्रमंती मार्ग (Sahyadri Heritage Trails)
              </h1>
              <p style={{ color: '#F1E7D8', fontSize: '1.05rem', maxWidth: '780px', margin: 0, lineHeight: 1.65 }}>
                एका किल्ल्यापुरते मर्यादित न राहता, इतिहासाच्या साखळीने जोडलेले अनेक गडकोट, घाटवाटा व रणभूमी एकाच भ्रमंतीत अनुभवण्यासाठी तयार केलेले अधिकृत मार्ग — अंतर, कालावधी, अवघडपणा व सुरक्षिततेसह.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleOpenAdd}
                style={{
                  background: 'linear-gradient(135deg, #DD8A2E 0%, #C9701C 100%)',
                  color: '#2A0606',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(221,138,46,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                <span>➕</span> नवीन ट्रेल जोडा
              </button>
              <button
                onClick={handleResetDefaults}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#FFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}>
                ↺ मूळ ट्रेल्स रीसेट
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(221,138,46,0.3)'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>नोंदवलेले ट्रेक मार्ग</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>{trails.length} ट्रेल्स</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>समाविष्ट गड-किल्ले</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>२४+ गडकोट</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>जीपीएस व गाईड संपर्क</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80' }}>सत्यापित ✓</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>संपादकीय स्वरूप</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FDBA74' }}>Real-time Live</div>
            </div>
          </div>
        </div>

        {/* Safety & Trekking Best Practices Notice */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          border: '1.5px solid #FED7AA',
          padding: '22px 28px',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          boxShadow: '0 4px 16px rgba(199,56,0,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '28px' }}>🧭</span>
            <div>
              <strong style={{ color: '#9A3412', display: 'block', fontSize: '0.95rem', marginBottom: '2px' }}>
                स्थानिक दुर्ग गाईड सोबत घ्या
              </strong>
              <span style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5 }}>
                कठीण मार्गांवर स्थानिक ग्रामस्थांना किंवा पंजीकृत दुर्गमित्र गाईडना सोबत घेणे सुरक्षिततेसाठी आवश्यक आहे.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '28px' }}>💧</span>
            <div>
              <strong style={{ color: '#9A3412', display: 'block', fontSize: '0.95rem', marginBottom: '2px' }}>
                पाणी व प्रथमोपचार व्यवस्था
              </strong>
              <span style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5 }}>
                प्रत्येक सदस्याकडे किमान ३ लिटर पाणी, ओआरएस, सुका मेवा आणि टॉर्च असणे बंधनकारक आहे.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '28px' }}>🚩</span>
            <div>
              <strong style={{ color: '#9A3412', display: 'block', fontSize: '0.95rem', marginBottom: '2px' }}>
                गड पावित्र्य व स्वच्छता
              </strong>
              <span style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5 }}>
                गडावर प्लास्टिक, कचरा, मद्यपान करण्यास सक्त मनाई आहे. ऐतिहासिक अवशेषांवर नावे कोरणे दंडनीय गुन्हा आहे.
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Filters & Search Bar */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Difficulty Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सर्व मार्ग (All)' },
              { id: 'सोपा', label: '🟢 सोपे (Easy)' },
              { id: 'मध्यम', label: '🟠 मध्यम (Moderate)' },
              { id: 'कठीण', label: '🔴 कठीण (Hard)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDiff(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: activeDiff === tab.id ? '2px solid #EA580C' : '1px solid #E6DDCE',
                  background: activeDiff === tab.id ? '#FFF7ED' : '#FAF6F0',
                  color: activeDiff === tab.id ? '#9A3412' : '#5C534B',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="किल्ला, मार्ग किंवा परिसर शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E6DDCE',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
              🔍
            </span>
          </div>
        </div>

        {/* Trails Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '26px' }}>
          {filteredTrails.map((t) => (
            <div
              key={t.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 8px 24px rgba(45,15,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '26px',
                position: 'relative'
              }}>
              <div>
                {/* Diff Badge & Region */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    background: '#FFF7ED',
                    color: t.diffColor || '#EA580C',
                    border: `1px solid ${t.diffColor || '#EA580C'}`,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    {t.diff}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>
                    ⏱️ {t.time}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#2A0606',
                  margin: '0 0 6px',
                  lineHeight: 1.3
                }}>
                  {t.title}
                </h3>

                <div style={{ fontSize: '0.84rem', color: '#DD8A2E', fontWeight: 700, marginBottom: '12px' }}>
                  📍 {t.region} · 📏 {t.distance}
                </div>

                <p style={{ fontSize: '0.9rem', color: '#5C534B', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {t.desc}
                </p>

                {t.highlights && (
                  <div style={{
                    background: '#FAF6F0',
                    borderLeft: '3px solid #DD8A2E',
                    padding: '8px 12px',
                    borderRadius: '0 6px 6px 0',
                    fontSize: '0.82rem',
                    color: '#3D0D0D',
                    marginBottom: '14px'
                  }}>
                    <strong>प्रमुख आकर्षण:</strong> {t.highlights}
                  </div>
                )}

                {/* Fort Tags */}
                {t.forts && t.forts.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {t.forts.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#FDF3E6',
                          color: '#9A3412',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                        🏰 {f}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700, marginBottom: '14px' }}>
                  🗓️ सर्वोत्तम हंगाम: {t.bestSeason || 'हिवाळा'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #E6DDCE'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#C9701C',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    ✏️ संपादित करा
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #E6DDCE',
                      color: '#991B1B',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    🗑️
                  </button>
                </div>

                <Link
                  to="/forts"
                  style={{
                    background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                    color: '#FFF',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 3px 10px rgba(234,88,12,0.25)'
                  }}>
                  दुर्ग नकाशा →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Add / Edit Trail */}
        {modalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '2px solid #DD8A2E'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #2D0F00 0%, #4D1A00 100%)',
                color: '#FFF',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', margin: 0 }}>
                  {editItem ? '✏️ ट्रेक मार्ग संपादित करा' : '➕ नवीन वारसा ट्रेल जोडा'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    ट्रेलचे नाव व मार्ग *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. तोरणा → राजगड → रायगड"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      परिसर / जिल्हा *
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="उदा. पुणे (वेल्हे) - महाड"
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      अवघडपणा स्तर *
                    </label>
                    <select
                      value={formData.diff}
                      onChange={(e) => {
                        const val = e.target.value;
                        let color = '#EA580C';
                        if (val.includes('सोपा')) color = '#16A34A';
                        if (val.includes('कठीण')) color = '#DC2626';
                        setFormData({ ...formData, diff: val, diffColor: color });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="सोपा (Easy)">सोपा (Easy)</option>
                      <option value="मध्यम (Moderate)">मध्यम (Moderate)</option>
                      <option value="कठीण (Hard)">कठीण (Hard)</option>
                      <option value="अति-कठीण (Extreme)">अति-कठीण (Extreme)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      कालावधी
                    </label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="उदा. २ दिवस / ६-८ तास"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      अंतर (किमी)
                    </label>
                    <input
                      type="text"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      placeholder="उदा. ~५० किमी"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    समाविष्ट किल्ले (स्वल्पविरामाने वेगळे करा)
                  </label>
                  <input
                    type="text"
                    value={formData.fortsStr}
                    onChange={(e) => setFormData({ ...formData, fortsStr: e.target.value })}
                    placeholder="उदा. किल्ले तोरणा, किल्ले राजगड, किल्ले रायगड"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    तपशील व ऐतिहासिक पार्श्वभूमी *
                  </label>
                  <textarea
                    rows="3"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="या ट्रेकचे ऐतिहासिक महत्त्व, आव्हाने व वर्णन..."
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    प्रमुख आकर्षण व सर्वोत्तम हंगाम
                  </label>
                  <input
                    type="text"
                    value={formData.highlights}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    placeholder="उदा. झुंजार माची, संजीवनी माची, विहंगम दृश्ये"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '10px 18px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 24px', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    {editItem ? 'बदल जतन करा ✓' : 'ट्रेल जोडा ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
