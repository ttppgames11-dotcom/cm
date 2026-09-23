import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_MOVEMENTS = [
  {
    id: 'm1',
    category: 'muk_morcha',
    categoryLabel: 'मूक मोर्चे ५८',
    title: 'मराठा क्रांती मूक मोर्चे (५८ ऐतिहासिक शांततामय मोर्चे)',
    period: '९ ऑगस्ट २०१६ – ९ ऑगस्ट २०१७',
    participants: '५ कोटी+ मराठा बांधव',
    locations: 'औरंगाबाद (पहिली ठिणगी) ते मुंबई आझाद मैदान (महामोर्चा)',
    desc: 'जगातील मानवी इतिहासातील सर्वात मोठा, अभूतपूर्व, शांततामय आणि शिस्तबद्ध जनआक्रोश. लाखोंच्या संख्येने भगवे ध्वज हाती घेतलेले मराठा माता-भगिनी, युवक आणि वृद्ध रस्त्यावर उतरले; पण एकाही पालापाचोळ्याला इजा झाली नाही किंवा वाहतूक विस्कळीत झाली नाही. लहान मुलींनी मोर्चाचे नेतृत्व करून जिल्हाधिकाऱ्यांना निवेदने दिली.',
    demands: [
      'कोपर्डी घटनेतील गुन्हेगारांना फाशीची शिक्षा',
      'मराठा समाजाला शिक्षण व नोकऱ्यांमध्ये हक्काचे आरक्षण',
      'ॲट्रॉसिटी कायद्याचा गैरवापर रोखण्यासाठी सुधारणा',
      'शेतकऱ्यांना स्वामिनाथन आयोगानुसार हमीभाव व संपूर्ण कर्जमुक्ती',
      'छत्रपती शिवाजी महाराज अरबी समुद्र स्मारकाचे जलद काम'
    ],
    outcomes: [
      'महाराष्ट्र शासनाकडून १६% SEBC आरक्षण कायदा संमत',
      'सारथी (SARTHI) संस्थेची स्वायत्त निर्मिती व कोट्यवधींचा निधी',
      'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना लागू',
      'अण्णासाहेब पाटील आर्थिक विकास महामंडळाचे पुनरुज्जीवन'
    ],
    verified: true
  },
  {
    id: 'm2',
    category: 'reservation',
    categoryLabel: 'आरक्षण लढा',
    title: 'मराठा आरक्षण घटनात्मक व न्यायालयीन संघर्ष',
    period: '२०१८ – चालू',
    participants: 'समस्त समाज, अभ्यासक व विधीज्ञ',
    locations: 'मुंबई उच्च न्यायालय, सर्वोच्च न्यायालय, नवी दिल्ली',
    desc: 'न्यायमूर्ती एम. जी. गायकवाड मागासवर्ग आयोगाच्या अहवालानंतर राज्य शासनाने पारित केलेले आरक्षण आणि त्यानंतर सर्वोच्च न्यायालयात उभा राहिलेला घटनात्मक लढा. ५०% मर्यादेचे आव्हान, १०२ वी घटनादुरुस्ती आणि सध्या सुरू असलेली क्यूरेटिव्ह याचिका.',
    demands: [
      'मराठा समाजाचा सामाजिक व शैक्षणिक मागासलेपणा सिद्ध करणे',
      '५० टक्क्यांच्या मर्यादेचे पुनरावलोकन',
      'कुणबी नोंदींची शोध मोहीम व निजामकालीन वंशावळी तपासणी',
      'विद्यार्थ्यांना व उमेदवारांना तात्पुरते EWS संरक्षण'
    ],
    outcomes: [
      'मुंबई उच्च न्यायालयाकडून आरक्षणाची वैधता मान्य',
      'लाखो मराठा-कुणबी दाखल्यांचे शोध व वितरण (हैदराबाद गॅझेटिअर तपासणी)',
      'EWS आरक्षणाचा लाभ उच्च शिक्षणात सुरू'
    ],
    verified: true
  },
  {
    id: 'm3',
    category: 'education',
    categoryLabel: 'शिक्षण व युवा',
    title: 'सारथी (SARTHI) संस्था स्वायत्तता व विद्यार्थी एल्गार',
    period: '२०१८ – चालू',
    participants: 'विद्यार्थी, संशोधक व स्पर्धा परीक्षा उमेदवार',
    locations: 'पुणे, नाशिक, छत्रपती संभाजीनगर, कोल्हापूर',
    desc: 'छत्रपती शाहू महाराज संशोधन, प्रशिक्षण व मानव विकास संस्था (सारथी) च्या माध्यमातून मराठा व कुणबी विद्यार्थ्यांना यूपीएससी, एमपीएससी, सैन्य दल आणि पीएचडी संशोधनासाठी स्वायत्त निधी मिळवून देणारी विद्यार्थी चळवळ.',
    demands: [
      'सारथी संस्थेला बार्टी (BARTI) च्या धर्तीवर १००% स्वायत्तता व १,००० कोटी वार्षिक निधी',
      'परदेशी फेलोशिप विद्यार्थ्यांच्या शुल्काची वेळेवर भरपाई',
      '३६ जिल्ह्यांत अभ्यासिका, वसतिगृहे व मोफत कोचिंग सेंटर्स'
    ],
    outcomes: [
      'हजारो मराठा तरुण स्पर्धा परीक्षा उत्तीर्ण होऊन प्रशासकीय सेवेत रुजू',
      'पीएचडी विद्यार्थ्यांसाठी छत्रपती संभाजीराजे फेलोशिप मंजूर',
      'विदेशी शिक्षणासाठी दरवर्षी ७५ विद्यार्थ्यांना पूर्ण शिष्यवृत्ती'
    ],
    verified: true
  },
  {
    id: 'm4',
    category: 'business',
    categoryLabel: 'आर्थिक विकास',
    title: 'अण्णासाहेब पाटील आर्थिक महामंडळ नवउद्योग क्रांती',
    period: '२०१७ – चालू',
    participants: '१,५०,०००+ नवउद्योजक व व्यावसायिक',
    locations: 'महाराष्ट्र राज्यभर (३६ जिल्हे)',
    desc: 'मराठा तरुणांना व्यवसायासाठी भांडवल मिळावे म्हणून अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळाच्या माध्यमातून १५ लाख रुपयांपर्यंतचे बिनव्याजी बँक कर्ज देण्याची ऐतिहासिक योजना यशस्वी करण्यात आली.',
    demands: [
      'बँकांकडून होणारी अडवणूक थांबवणे व त्वरित कर्ज मंजुरी',
      'कर्ज मर्यादा १० लाखांवरून १५ लाख व पुढे ५० लाखांपर्यंत वाढवणे',
      'शेतकरी पुत्रांना फूड प्रोसेसिंग व ट्रान्सपोर्टसाठी विशेष अनुदान'
    ],
    outcomes: [
      '८०,००० हून अधिक मराठा तरुणांना स्वतःचा व्यवसाय उभारण्यास यश',
      '५,०००+ कोटी रुपयांच्या कर्जाचे व्याज शासनामार्फत भरले गेले'
    ],
    verified: true
  },
  {
    id: 'm5',
    category: 'forts',
    categoryLabel: 'गड संवर्धन',
    title: 'सह्याद्री गडकोट संरक्षण, स्वच्छता व अतिक्रमणमुक्ती महाअभियान',
    period: 'अखंड अविरत लढा',
    participants: 'लाखो दुर्गप्रेमी मावळे व संघटना',
    locations: 'रायगड, विशाळगड, प्रतापगड, राजगड, सिंहगड, शिवनेरी',
    desc: 'छत्रपती शिवरायांच्या पवित्र गडकिल्ल्यांवरील अनधिकृत अतिक्रमणे हटवण्यासाठी, प्लास्टिकमुक्तीसाठी, ऐतिहासिक तोफा व शिलालेख जतन करण्यासाठी उभा राहिलेला सामूहिक लोकसहभाग. विशाळगड व प्रतापगड पायथा अतिक्रमण मुक्ती ही या लढ्याची प्रमुख उपलब्धी ठरली.',
    demands: [
      'किल्ल्यांवरील सर्व अनधिकृत अतिक्रमणे त्वरित हटवणे',
      'गडकिल्ल्यांच्या ३०० मीटर परिसरात दारू, मांस विक्री व पार्ट्यांवर बंदी',
      'भारतीय पुरातत्व सर्वेक्षण (ASI) व राज्य पुरातत्व विभागाकडून जलद जिर्णोद्धार'
    ],
    outcomes: [
      'प्रतापगड व विशाळगडावरील अतिक्रमणांवर कायदेशीर कारवाई व मुक्ती',
      'रायगड विकास प्राधिकरणास ६००+ कोटींचा निधी',
      '५०+ किल्ल्यांवर नियमित स्वच्छता व मार्गदर्शक फलक'
    ],
    verified: true
  },
  {
    id: 'm6',
    category: 'farmers',
    categoryLabel: 'कृषी व शेतकरी',
    title: 'बळीराजा हक्क एल्गार — शेतकरी कर्जमुक्ती व हमीभाव लढा',
    period: '२०१७ – चालू',
    participants: 'लाखो शेतकरी, शेतमजूर व कृषी संघटना',
    locations: 'पुणतांबा (ऐतिहासिक संप) ते मंत्रालय मुंबई',
    desc: 'महाराष्ट्रातील मराठा-कुणबी शेतकऱ्यांच्या आत्महत्या रोखण्यासाठी, दुधाला रास्त भाव, शेतमालाला हमीभाव आणि संपूर्ण कर्जमाफीसाठी उभा राहिलेला ऐतिहासिक शेतकरी संप. महाराष्ट्रातील शेतकऱ्यांनी पहिल्यांदा अन्नधान्य व दूध शहरात जाणे रोखून सरकारला गुडघे टेकवले.',
    demands: [
      'छत्रपती शिवाजी महाराज शेतकरी सन्मान योजना — संपूर्ण कर्जमुक्ती',
      'स्वामिनाथन आयोगाच्या शिफारशींनुसार दीडपट हमीभाव',
      'दुधाला प्रति लिटर किमान ३५ रुपये दर व थेट अनुदान'
    ],
    outcomes: [
      '३४,००० कोटी रुपयांची ऐतिहासिक शेतकरी कर्जमाफी जाहीर',
      'दूध उत्पादक शेतकऱ्यांना थेट बँक खात्यात अनुदान'
    ],
    verified: true
  }
];

export default function MovementsPage() {
  const [movements, setMovements] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_movements_archive_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MOVEMENTS;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'muk_morcha',
    categoryLabel: 'मूक मोर्चे ५८',
    period: '',
    participants: '',
    locations: '',
    desc: '',
    demandsStr: '',
    outcomesStr: '',
    verified: true
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_movements_archive_data', JSON.stringify(movements));
    } catch (e) {
      console.error(e);
    }
  }, [movements]);

  const filteredMovements = movements.filter(m => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesQuery = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.locations.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      category: 'muk_morcha',
      categoryLabel: 'सामाजिक लढा',
      period: '२०२६',
      participants: '१,००,०००+ बांधव',
      locations: 'महाराष्ट्र',
      desc: '',
      demandsStr: 'आरक्षण व संरक्षण, शैक्षणिक सवलती',
      outcomesStr: 'शासन निर्णय व लाभ',
      verified: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      categoryLabel: item.categoryLabel,
      period: item.period,
      participants: item.participants,
      locations: item.locations,
      desc: item.desc,
      demandsStr: Array.isArray(item.demands) ? item.demands.join('\n') : '',
      outcomesStr: Array.isArray(item.outcomes) ? item.outcomes.join('\n') : '',
      verified: !!item.verified
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('हा चळवळ दस्तऐवज हटवायचा आहे का?')) {
      setMovements(movements.filter(m => m.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व चळवळ दस्तऐवज मूळ अधिकृत डेटावर रीसेट करायचे आहेत का?')) {
      setMovements(DEFAULT_MOVEMENTS);
      localStorage.setItem('cm_movements_archive_data', JSON.stringify(DEFAULT_MOVEMENTS));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.desc.trim()) {
      alert('कृपया चळवळीचे नाव आणि विवरण प्रविष्ट करा.');
      return;
    }

    const demandsArr = formData.demandsStr
      ? formData.demandsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const outcomesArr = formData.outcomesStr
      ? formData.outcomesStr.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    if (editItem) {
      setMovements(movements.map(m => m.id === editItem.id ? {
        ...m,
        ...formData,
        demands: demandsArr,
        outcomes: outcomesArr
      } : m));
    } else {
      const newMovement = {
        id: 'mov_' + Date.now(),
        ...formData,
        demands: demandsArr,
        outcomes: outcomesArr
      };
      setMovements([newMovement, ...movements]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #2D0808 0%, #4D1212 50%, #6E1818 100%)',
          borderRadius: '24px',
          padding: '44px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 20px 50px rgba(45,8,8,0.4)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.25)', border: '1px solid #DD8A2E', padding: '5px 16px', borderRadius: '24px', marginBottom: '14px' }}>
                <span style={{ color: '#FFD700' }}>✊</span>
                <span style={{ color: '#FDF3E6', fontSize: '0.84rem', fontWeight: 800 }}>
                  ऐतिहासिक लोकआंदोलने • मूक मोर्चे व सत्याग्रह महादालन
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
                मराठा चळवळी, मूक मोर्चे व ऐतिहासिक लढा
              </h1>
              <p style={{ color: '#F1E7D8', fontSize: '1.05rem', maxWidth: '780px', margin: 0, lineHeight: 1.65 }}>
                ५८ मूक मोर्चे, आरक्षण लढा, सारथी निर्मिती, अण्णासाहेब पाटील महामंडळ ते दुर्ग संवर्धन महामोहीम — समाज हितासाठी, अन्यायाविरुद्ध आणि हक्कासाठी उभी राहिलेली लोकआंदोलने.
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
                <span>➕</span> नवीन लढा नोंदवा
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
                ↺ मूळ दस्तऐवज रीसेट
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
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>नोंदवलेले ऐतिहासिक लढे</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>{movements.length} आंदोलने</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>ऐतिहासिक मूक मोर्चे</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>५८ मूक मोर्चे</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>एकूण समाज सहभाग</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80' }}>५ कोटी+ नागरिक</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>अभिलेख पडताळणी</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FDBA74' }}>अधिकृत गॅझेट ✓</div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
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
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सर्व आंदोलने' },
              { id: 'muk_morcha', label: '🚩 मूक मोर्चे ५८' },
              { id: 'reservation', label: '⚖️ आरक्षण लढा' },
              { id: 'education', label: '🎓 शिक्षण व युवा' },
              { id: 'business', label: '💼 आर्थिक विकास' },
              { id: 'forts', label: '🏰 दुर्ग संवर्धन' },
              { id: 'farmers', label: '🌾 शेतकरी एल्गार' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: activeCategory === tab.id ? '2px solid #DD8A2E' : '1px solid #E6DDCE',
                  background: activeCategory === tab.id ? '#3D0D0D' : '#FAF6F0',
                  color: activeCategory === tab.id ? '#FFD700' : '#5C534B',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="चळवळ किंवा मागण्या शोधा..."
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

        {/* Movements Archive Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {filteredMovements.map(m => (
            <div
              key={m.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 8px 30px rgba(45,8,8,0.06)',
                overflow: 'hidden'
              }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF2E6 100%)',
                padding: '24px 28px',
                borderBottom: '1px solid #E6DDCE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: '#3D0D0D',
                      color: '#FFD700',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {m.categoryLabel || m.category}
                    </span>
                    {m.verified && (
                      <span style={{
                        background: '#E8F5E9',
                        color: '#166534',
                        border: '1px solid #BBF7D0',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        ✓ अधिकृत अभिलेख
                      </span>
                    )}
                    <span style={{ fontSize: '0.84rem', color: '#666' }}>📅 {m.period}</span>
                  </div>

                  <h2 style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#2A0606',
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {m.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#C9701C',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    ✏️ संपादित करा
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #E6DDCE',
                      color: '#991B1B',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ background: '#FAF6F0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>सहभागी संख्या</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#3D0D0D' }}>👥 {m.participants}</div>
                  </div>
                  <div style={{ background: '#FAF6F0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>प्रमुख कार्यक्षेत्र</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#3D0D0D' }}>📍 {m.locations}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.96rem', color: '#4A3B32', lineHeight: 1.7, margin: '0 0 24px' }}>
                  {m.desc}
                </p>

                {/* Demands & Outcomes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Demands */}
                  {m.demands && m.demands.length > 0 && (
                    <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px' }}>
                      <h4 style={{ color: '#9A3412', fontSize: '1rem', fontWeight: 800, margin: '0 0 12px' }}>
                        📋 प्रमुख मागण्या (Charter of Demands):
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        {m.demands.map((d, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Outcomes */}
                  {m.outcomes && m.outcomes.length > 0 && (
                    <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '14px', padding: '20px' }}>
                      <h4 style={{ color: '#166534', fontSize: '1rem', fontWeight: 800, margin: '0 0 12px' }}>
                        🎯 मिळालेले यश व फलश्रुती (Outcomes & GRs):
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#14532D', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        {m.outcomes.map((o, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredMovements.length === 0 && (
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              border: '1px dashed #DD8A2E',
              color: '#666'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>✊</div>
              <h3 style={{ color: '#3D0D0D' }}>कोणतीही चळवळ आढळली नाही</h3>
              <p>कृपया शोध संज्ञा बदला किंवा नवीन लढा नोंदवा.</p>
            </div>
          )}
        </div>

        {/* Modal for Add / Edit Movement */}
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
              maxWidth: '660px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '2px solid #DD8A2E'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #2D0808 0%, #4D1212 100%)',
                color: '#FFF',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', margin: 0 }}>
                  {editItem ? '✏️ चळवळ दस्तऐवज संपादित करा' : '➕ नवीन ऐतिहासिक लढा नोंदवा'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    चळवळ / आंदोलनाचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. ५८ मराठा क्रांती मूक मोर्चे"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      श्रेणी *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const labels = {
                          muk_morcha: 'मूक मोर्चे ५८',
                          reservation: 'आरक्षण लढा',
                          education: 'शिक्षण व युवा',
                          business: 'आर्थिक विकास',
                          forts: 'गड संवर्धन',
                          farmers: 'शेतकरी एल्गार'
                        };
                        setFormData({ ...formData, category: cat, categoryLabel: labels[cat] || 'सामाजिक लढा' });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="muk_morcha">मूक मोर्चे ५८</option>
                      <option value="reservation">आरक्षण लढा</option>
                      <option value="education">शिक्षण व युवा</option>
                      <option value="business">आर्थिक विकास</option>
                      <option value="forts">गड संवर्धन</option>
                      <option value="farmers">शेतकरी एल्गार</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      कालावधी / वर्ष
                    </label>
                    <input
                      type="text"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      placeholder="उदा. २०१६–२०१८"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      सहभागी संख्या
                    </label>
                    <input
                      type="text"
                      value={formData.participants}
                      onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                      placeholder="उदा. ५ कोटी+ नागरिक"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      स्थान / विस्तार
                    </label>
                    <input
                      type="text"
                      value={formData.locations}
                      onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                      placeholder="उदा. महाराष्ट्रभर व नवी दिल्ली"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    चळवळीचे सविस्तर वर्णन व पार्श्वभूमी *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="आंदोलनाचा उगम, शांततामय स्वरूप व इतिहास..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    प्रमुख मागण्या (प्रत्येक ओळीवर एक)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.demandsStr}
                    onChange={(e) => setFormData({ ...formData, demandsStr: e.target.value })}
                    placeholder="मागणी १&#10;मागणी २&#10;मागणी ३"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    मिळालेले यश व शासन निर्णय (प्रत्येक ओळीवर एक)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.outcomesStr}
                    onChange={(e) => setFormData({ ...formData, outcomesStr: e.target.value })}
                    placeholder="यश १&#10;यश २"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '9px 16px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 22px', background: '#DD8A2E', color: '#2A0606', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    {editItem ? 'बदल जतन करा ✓' : 'लढा नोंदवा ✓'}
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
