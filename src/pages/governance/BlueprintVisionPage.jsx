import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_PILLARS = [
  {
    id: 'bp_1',
    category: 'digital',
    categoryLabel: 'डिजिटल ओळख व नागरिकत्व',
    title: '१. डिजिटल ओळख, बायोमेट्रिक स्मार्ट कार्ड व डिजिटल नागरिकत्व',
    leadDept: 'माहिती तंत्रज्ञान व सायबर सुरक्षा विभाग',
    budget: '₹१०० कोटी',
    targetYear: '२०२६–२०२८',
    progress: 75,
    metrics: '१ कोटी सदस्यांचे बायोमेट्रिक प्रमाणीकरण व सुरक्षित DPDP अनुपालन',
    desc: 'प्रत्येक मराठा बांधवाला अधिकृत डिजिटल सदस्य ओळखपत्र, अद्वितीय CM-ID, एनक्रिप्टेड QR कोड आणि डिजिटल स्वाक्षरीयुक्त प्रमाणपत्र प्रदान करणे. सर्व ३६ जिल्ह्यांतील सदस्यांचा एकात्मिक व गोपनीय डेटाबेस.',
    subDepts: [
      'विभाग १: डिजिटल स्मार्ट कार्ड व सदस्यत्व प्रमाणीकरण',
      'विभाग २: सायबर सुरक्षा व डेटा गोपनीयता कक्ष (DPDP कायदा)',
      'विभाग ३: ब्लॉकचेन व्हॅलिडेटेड वंशावळ व कुलवृत्तांत नोंद',
      'विभाग ४: एकात्मिक नागरिक हेल्पलाईन (१८००-१२३-१६७४)',
      'विभाग ५: डिजिटल ई-मतदान व संघटनात्मक निवडणूक प्रणाली'
    ]
  },
  {
    id: 'bp_2',
    category: 'business',
    categoryLabel: 'व्यवसाय संगम व उद्योग',
    title: '२. बिझनेस संगम, सह्याद्री इन्व्हेस्टमेंट फंड व औद्योगिक महामार्ग',
    leadDept: 'उद्योग, व्यापार व गुंतवणूक महामंडळ',
    budget: '₹१,००० कोटी',
    targetYear: '२०२६–२०३०',
    progress: 60,
    metrics: 'वार्षिक ₹५,००० कोटींची अंतर्गत बी२बी व्यापार उलाढाल व १,००० उद्योग चॅप्टर्स',
    desc: 'मराठा उद्योजकांना अंतर्गत ग्राहक, पुरवठादार आणि जागतिक भांडवल उपलब्ध करून देणे. नवउद्योजकांसाठी सीड फंडिंग, सहकारी पतसंस्थांचे बळकटीकरण आणि महिला उद्योजकता मंच उभारणी.',
    subDepts: [
      'विभाग ६: स्थानिक व तालुका बिझनेस संगम नेटवर्किंग',
      'विभाग ७: सह्याद्री व्हेंचर कॅपिटल व एंजल इन्व्हेस्टमेंट फंड',
      'विभाग ८: अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज समन्वय',
      'विभाग ९: महिला स्वयंसहाय्यता बचत गट व सूक्ष्म उद्योग मंच',
      'विभाग १०: मराठा आंतरराष्ट्रीय व्यापार एक्स्पो (दुबई, लंडन, मुंबई)'
    ]
  },
  {
    id: 'bp_3',
    category: 'agriculture',
    categoryLabel: 'कृषी व शेतकरी समृद्धी',
    title: '३. बळीराजा समृद्धी, कृषी प्रक्रिया (FPO) व जागतिक निर्यात साखळी',
    leadDept: 'कृषी, पणन व शेतकरी कल्याण विभाग',
    budget: '₹५०० कोटी',
    targetYear: '२०२६–२०३१',
    progress: 50,
    metrics: '५०० शेतकरी उत्पादक कंपन्या (FPO) व ५० देशांत शेतमालाची थेट निर्यात',
    desc: 'शेतकऱ्यांच्या आत्महत्येला कायमचा पूर्णविराम देणे. दलालांची साखळी तोडून कांदा, द्राक्षे, डाळिंब, हळद आणि सेंद्रिय अन्नधान्य आखाती व युरोपीय देशांत थेट निर्यात करण्याची महासाखळी उभारणे.',
    subDepts: [
      'विभाग ११: मराठा फार्मर प्रोड्युसर कंपनी (FPO) फेडरेशन',
      'विभाग १२: शीतगृह (Cold Storage) व लॉजिस्टिक कॉरिडॉर',
      'विभाग १३: सेंद्रिय प्रमाणीकरण व आंतरराष्ट्रीय पॅकेजिंग हब',
      'विभाग १४: कृषी ड्रोन, ठिबक व आधुनिक तंत्रज्ञान अनुदान कक्ष',
      'विभाग १५: दूध उत्पादक शेतकरी सहकारी महासंघ'
    ]
  },
  {
    id: 'bp_4',
    category: 'heritage',
    categoryLabel: 'गडकोट व वारसा संवर्धन',
    title: '४. सह्याद्री गडकोट पुनरुज्जीवन, 3D डिजिटल आर्काइव्ह व इतिहास संशोधन',
    leadDept: 'इतिहास संशोधन, पुरातत्व व दुर्ग संवर्धन परिषद',
    budget: '₹३५० कोटी',
    targetYear: '२०२६–२०३२',
    progress: 80,
    metrics: '३५०+ गडकिल्ल्यांचे ऐतिहासिक जतन व १२ UNESCO जागतिक वारसा पर्यटन केंद्र',
    desc: 'सह्याद्रीतील गडकोटांवरील अतिक्रमणे हटवणे, प्राचीन जलव्यवस्थांचे पुनरुज्जीवन, शिलालेख व तोफांचे संरक्षण, आणि शिवकालीन मोडी लिपीतील लाखो कागदपत्रांचे डिजिटल डिजिटायझेशन.',
    subDepts: [
      'विभाग १६: गडकिल्ले संरक्षण, स्वच्छता व श्रमदान दल',
      'विभाग १७: मोडी लिपी संशोधन व ऐतिहासिक दस्तऐवज डिजिटायझेशन',
      'विभाग १८: शिवकालीन शस्त्रविद्या व पारंपरिक युद्धकला आखाडे',
      'विभाग १९: अहिल्याबाई होळकर मंदिर जीर्णोद्धार निधी',
      'विभाग २०: जागतिक दर्जाची ३D व्हर्च्युअल म्युझियम निर्मिती'
    ]
  },
  {
    id: 'bp_5',
    category: 'education',
    categoryLabel: 'सारथी, शिक्षण व युवा',
    title: '५. सारथी युवा सक्षमीकरण, आंतरराष्ट्रीय फेलोशिप व करिअर महामार्ग',
    leadDept: 'उच्च शिक्षण, कौशल्य विकास व क्रीडा प्रबोधिनी',
    budget: '₹७५० कोटी',
    targetYear: '२०२६–२०३०',
    progress: 70,
    metrics: '१ लाख विद्यार्थ्यांना उच्च शिक्षण व स्पर्धा परीक्षा शिष्यवृत्ती',
    desc: 'ग्रामीण भागातील होतकरू मराठा मुला-मुलींना आयएएस, आयपीएस, सैन्य दल आणि जागतिक विद्यापीठांत पाठवण्यासाठी मोफत अभ्यासिका, निवास व्यवस्था, विदेशी फेलोशिप आणि कुस्ती-क्रीडा प्रबोधिनी उभारणी.',
    subDepts: [
      'विभाग २१: सारथी स्पर्धा परीक्षा (UPSC/MPSC) मार्गदर्शन केंद्र',
      'विभाग २२: राजर्षी शाहू महाराज आंतरराष्ट्रीय शिष्यवृत्ती निधी',
      'विभाग २३: ३६ जिल्ह्यांत विनामूल्य डिजिटल अभ्यासिका व वसतिगृहे',
      'विभाग २४: एआय, कोडिंग व औद्योगिक कौशल्य प्रशिक्षण प्रबोधिनी',
      'विभाग २५: हिंदकेसरी कुस्ती व पारंपरिक मल्लखांब अकादमी'
    ]
  },
  {
    id: 'bp_6',
    category: 'safety',
    categoryLabel: 'समाज सुरक्षा व विधी संरक्षण',
    title: '६. अखंड समाज सुरक्षा कवच, विनामूल्य विधी साहाय्य व आपत्कालीन आरोग्य साखळी',
    leadDept: 'विधी साहाय्य, समाज कल्याण व आरोग्य संरक्षण दल',
    budget: '₹२५० कोटी',
    targetYear: '२०२६–२०२९',
    progress: 65,
    metrics: '३६ जिल्ह्यांत विनामूल्य विधी साहाय्य केंद्र व २४x७ आपत्कालीन ॲम्ब्युलन्स नेटवर्क',
    desc: 'अन्यायग्रस्त बांधवांसाठी कायदेशीर संरक्षण, खोट्या गुन्ह्यांविरुद्ध कायदेशीर लढा, माता-भगिनींच्या सुरक्षेसाठी विशेष मदत कक्ष आणि वैद्यकीय आपत्तीत तातडीने रक्त व उपचार मिळवून देणारी एकात्मिक साखळी.',
    subDepts: [
      'विभाग २६: विनामूल्य विधी साहाय्य (Legal Aid) व वकील महासंघ',
      'विभाग २७: २४x७ आपत्कालीन आरोग्य व जीवनरक्षक रुग्णवाहिका नेटवर्क',
      'विभाग २८: जिजाऊ महिला सुरक्षा कक्ष व समुपदेशन केंद्र',
      'विभाग २९: रक्तदान महाअभियान व मराठा ब्लड डोनर्स रजिस्ट्री',
      'विभाग ३०: ज्येष्ठ नागरिक सन्मान व कुटुंब कल्याण योजना'
    ]
  }
];

export default function BlueprintVisionPage() {
  const [pillars, setPillars] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_master_blueprint_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PILLARS;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'business',
    categoryLabel: 'उद्योग व व्यापार',
    leadDept: '',
    budget: '₹१०० कोटी',
    targetYear: '२०२६–२०३०',
    progress: 50,
    metrics: '',
    desc: '',
    subDeptsStr: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_master_blueprint_data', JSON.stringify(pillars));
    } catch (e) {
      console.error(e);
    }
  }, [pillars]);

  const filteredPillars = pillars.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leadDept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      category: 'business',
      categoryLabel: 'उद्योग व व्यापार',
      leadDept: 'उद्योग व विकास विभाग',
      budget: '₹१०० कोटी',
      targetYear: '२०२६–२०३०',
      progress: 40,
      metrics: '१०,००० लाभार्थी व १०० कोटी उलाढाल',
      desc: '',
      subDeptsStr: 'विभाग १: उपविभाग अ\nविभाग २: उपविभाग ब'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditItem(p);
    setFormData({
      title: p.title,
      category: p.category,
      categoryLabel: p.categoryLabel,
      leadDept: p.leadDept,
      budget: p.budget,
      targetYear: p.targetYear,
      progress: p.progress,
      metrics: p.metrics,
      desc: p.desc,
      subDeptsStr: Array.isArray(p.subDepts) ? p.subDepts.join('\n') : ''
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('हा रणनीतिक आराखडा हटवायचा आहे का?')) {
      setPillars(pillars.filter(p => p.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व रणनीतिक उद्दिष्टे मूळ अधिकृत ब्लूप्रिंटवर रीसेट करायची आहेत का?')) {
      setPillars(DEFAULT_PILLARS);
      localStorage.setItem('cm_master_blueprint_data', JSON.stringify(DEFAULT_PILLARS));
    }
  };

  const handleProgressChange = (id, newProgress) => {
    setPillars(pillars.map(p => p.id === id ? { ...p, progress: Number(newProgress) } : p));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.desc.trim()) {
      alert('कृपया स्तंभाचे नाव आणि विवरण प्रविष्ट करा.');
      return;
    }

    const subArr = formData.subDeptsStr
      ? formData.subDeptsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    if (editItem) {
      setPillars(pillars.map(p => p.id === editItem.id ? {
        ...p,
        ...formData,
        progress: Number(formData.progress),
        subDepts: subArr
      } : p));
    } else {
      const newPillar = {
        id: 'bp_' + Date.now(),
        ...formData,
        progress: Number(formData.progress),
        subDepts: subArr
      };
      setPillars([newPillar, ...pillars]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #2A0808 0%, #4D1212 50%, #6E1818 100%)',
          borderRadius: '24px',
          padding: '44px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 20px 50px rgba(42,8,8,0.4)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.25)', border: '1px solid #DD8A2E', padding: '5px 16px', borderRadius: '24px', marginBottom: '14px' }}>
                <span style={{ color: '#FFD700' }}>🧭</span>
                <span style={{ color: '#FDF3E6', fontSize: '0.84rem', fontWeight: 800 }}>
                  स्वराज्य महाब्लूप्रिंट (२०२६–२०३६) • ५० विभाग एकात्मिक आराखडा
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
                Connect Maratha १०-वर्षीय व्हिजन व कार्य आराखडा
              </h1>
              <p style={{ color: '#F1E7D8', fontSize: '1.05rem', maxWidth: '780px', margin: 0, lineHeight: 1.65 }}>
                शिवछत्रपतींच्या अष्टप्रधान पद्धतीवरून प्रेरणा घेऊन २१ व्या शतकातील मराठा समाजाच्या सर्वांगीण उन्नतीसाठी आखलेला ५० विभागांचा एकात्मिक मास्टर प्लॅन. सर्व विभाग थेट संपादनक्षम (Real-Time Editable) आहेत.
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
                <span>➕</span> नवीन रणनीतिक स्तंभ जोडा
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
                ↺ मूळ आराखडा रीसेट
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
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>रणनीतिक स्तंभ</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>{pillars.length} प्रमुख स्तंभ</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>समाविष्ट विभाग</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>५० कार्य विभाग</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>अंदाजित महा-बजेट</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80' }}>₹३,००० कोटी</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#DD8A2E', fontWeight: 700 }}>अंमलबजावणी कालावधी</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FDBA74' }}>२०२६–२०३६</div>
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
              { id: 'all', label: 'सर्व स्तंभ' },
              { id: 'digital', label: '🪪 डिजिटल नागरिकत्व' },
              { id: 'business', label: '💼 उद्योग संगम' },
              { id: 'agriculture', label: '🌾 कृषी व FPO' },
              { id: 'heritage', label: '🏰 गडकोट व वारसा' },
              { id: 'education', label: '🎓 सारथी व शिक्षण' },
              { id: 'safety', label: '🛡️ समाज सुरक्षा' }
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
              placeholder="विभाग किंवा उद्दिष्ट शोधा..."
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

        {/* Blueprint Pillars Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {filteredPillars.map(p => (
            <div
              key={p.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 8px 30px rgba(42,8,8,0.06)',
                overflow: 'hidden'
              }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF2E6 100%)',
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
                      {p.categoryLabel || p.category}
                    </span>
                    <span style={{ fontSize: '0.84rem', color: '#666', fontWeight: 600 }}>
                      🎯 ध्येय वर्ष: {p.targetYear}
                    </span>
                  </div>

                  <h2 style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#2A0606',
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {p.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(p)}
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
                    onClick={() => handleDelete(p.id)}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ background: '#FAF6F0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>अधिष्ठाता विभाग</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#3D0D0D' }}>🏛️ {p.leadDept}</div>
                  </div>
                  <div style={{ background: '#FAF6F0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>तरतूद बजेट</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}>💰 {p.budget}</div>
                  </div>
                  <div style={{ background: '#FAF6F0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E6DDCE' }}>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>मोजता येणारे उद्दिष्ट</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9A3412' }}>📊 {p.metrics}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.96rem', color: '#4A3B32', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {p.desc}
                </p>

                {/* Progress Bar & Slider */}
                <div style={{ background: '#FFFDF8', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#9A3412' }}>
                      प्रकल्प अंमलबजावणी प्रगती: {p.progress}%
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#666' }}>स्लाइडरने बदला ➔</span>
                  </div>

                  <div style={{ width: '100%', height: '10px', background: '#FEE2E2', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{
                      width: `${p.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #EA580C 0%, #16A34A 100%)',
                      borderRadius: '6px',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={p.progress}
                    onChange={(e) => handleProgressChange(p.id, e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Sub-departments List */}
                {p.subDepts && p.subDepts.length > 0 && (
                  <div>
                    <h4 style={{ color: '#3D0D0D', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 10px' }}>
                      📂 या स्तंभातील समाविष्ट ५ कार्य विभाग:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                      {p.subDepts.map((sub, i) => (
                        <div key={i} style={{ background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', color: '#3D0D0D', fontWeight: 600 }}>
                          ● {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Add / Edit Pillar */}
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
                background: 'linear-gradient(135deg, #2A0808 0%, #4D1212 100%)',
                color: '#FFF',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', margin: 0 }}>
                  {editItem ? '✏️ रणनीतिक स्तंभ संपादित करा' : '➕ नवीन रणनीतिक उद्दिष्ट जोडा'}
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
                    स्तंभाचे नाव व शीर्षक *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. १. डिजिटल ओळख व स्मार्ट कार्ड"
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
                          digital: 'डिजिटल नागरिकत्व',
                          business: 'उद्योग संगम',
                          agriculture: 'कृषी व FPO',
                          heritage: 'गडकोट व वारसा',
                          education: 'सारथी व शिक्षण',
                          safety: 'समाज सुरक्षा'
                        };
                        setFormData({ ...formData, category: cat, categoryLabel: labels[cat] || 'रणनीतिक स्तंभ' });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="digital">डिजिटल नागरिकत्व</option>
                      <option value="business">उद्योग संगम</option>
                      <option value="agriculture">कृषी व FPO</option>
                      <option value="heritage">गडकोट व वारसा</option>
                      <option value="education">सारथी व शिक्षण</option>
                      <option value="safety">समाज सुरक्षा</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      ध्येय वर्ष
                    </label>
                    <input
                      type="text"
                      value={formData.targetYear}
                      onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                      placeholder="उदा. २०२६–२०३०"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      अधिष्ठाता विभाग
                    </label>
                    <input
                      type="text"
                      value={formData.leadDept}
                      onChange={(e) => setFormData({ ...formData, leadDept: e.target.value })}
                      placeholder="उदा. माहिती तंत्रज्ञान विभाग"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      तरतूद बजेट
                    </label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="उदा. ₹५०० कोटी"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    मोजता येणारे उद्दिष्ट (Metrics)
                  </label>
                  <input
                    type="text"
                    value={formData.metrics}
                    onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                    placeholder="उदा. १ कोटी सदस्यांचे बायोमेट्रिक प्रमाणीकरण"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    सविस्तर वर्णन *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="या स्तंभाचे महत्त्व, कार्यपद्धती व फलश्रुती..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    उपविभाग (प्रत्येक ओळीवर एक)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.subDeptsStr}
                    onChange={(e) => setFormData({ ...formData, subDeptsStr: e.target.value })}
                    placeholder="विभाग १: ...&#10;विभाग २: ..."
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
                    {editItem ? 'बदल जतन करा ✓' : 'स्तंभ जोडा ✓'}
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
