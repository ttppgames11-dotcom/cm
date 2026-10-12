import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_NEWS = [
  {
    id: 'n1',
    title: 'शिवराज्याभिषेक ३५१ वा महोत्सव — रायगडावर अभूतपूर्व सोहळा संपन्न',
    date: '६ जून २०२६',
    category: 'history',
    categoryLabel: 'इतिहास व उत्सव',
    tag: 'ठळक बातमी',
    summary: 'लाखो शिवभक्तांच्या उपस्थितीत दुर्गराज रायगडावर ३५१ व्या शिवराज्याभिषेक दिनानिमित्त भगवा ध्वजारोहण, पालखी सोहळा व शिवकालीन युद्धकलांचे प्रात्यक्षिक पार पडले. संस्थेच्या वतीने सर्व मावळ्यांना महाप्रसाद व सन्मानपत्र वाटप करण्यात आले.',
    author: 'मध्यवर्ती प्रसिद्धी कक्ष, रायगड',
    featured: true
  },
  {
    id: 'n2',
    title: 'Connect Maratha बिझनेस संगम २०२६ — ५००+ उद्योजकांचा भव्य मेळावा',
    date: '१२ मे २०२६',
    category: 'business',
    categoryLabel: 'उद्योग व व्यापार',
    tag: 'व्यापार संगम',
    summary: 'पुणे येथील बालगंधर्व रंगमंदिरात मराठा चेंबर ऑफ कॉमर्स व कनेक्ट मराठातर्फे बिझनेस संगमचे यशस्वी आयोजन. १००+ कोटींचे व्यावसायिक करार व बी२बी नेटवर्किंग संपन्न होऊन ५,०००+ नवीन रोजगार संधी निर्माण झाल्या.',
    author: 'उद्योग व व्यापार विभाग, पुणे',
    featured: false
  },
  {
    id: 'n3',
    title: 'सारथी शिष्यवृत्ती योजना २०२६ — परदेशी शिक्षण व स्पर्धा परीक्षा अर्ज सुरू',
    date: '२८ एप्रिल २०२६',
    category: 'education',
    categoryLabel: 'शिक्षण व करिअर',
    tag: 'सारथी योजना',
    summary: 'उच्च शिक्षणासाठी परदेशी जाणाऱ्या आणि UPSC/MPSC स्पर्धा परीक्षेची तयारी करणाऱ्या मराठा व कुणबी विद्यार्थ्यांना फेलोशिप व शिष्यवृत्ती वितरणाचे अधिकृत वेळापत्रक जाहीर. ५०,००० विद्यार्थ्यांना थेट शैक्षणिक लाभ.',
    author: 'शिक्षण सहाय्यता कक्ष',
    featured: false
  },
  {
    id: 'n4',
    category: 'forts',
    categoryLabel: 'दुर्ग संवर्धन',
    title: 'सह्याद्री गड संवर्धन महामोहीम — राजगड व तोरणा प्लास्टिकमुक्ती अभियान',
    date: '१५ मार्च २०२६',
    tag: 'श्रमदान मोहीम',
    summary: '२,५०० हून अधिक मावळ्यांच्या सहभागाने राजगड आणि तोरणा गडावर सलग तीन दिवस प्लास्टिकमुक्ती, शिलालेख जतन व बालेकिल्ला पायऱ्या दुरुस्ती महाअभियान राबवण्यात आले.',
    author: 'सह्याद्री दुर्ग रक्षक दल',
    featured: false
  },
  {
    id: 'n5',
    category: 'government',
    categoryLabel: 'शासकीय योजना',
    title: 'अण्णासाहेब पाटील महामंडळामार्फत १ लाख मराठा तरुणांना बिनव्याजी उद्योग कर्ज',
    date: '२ फेब्रुवारी २०२६',
    tag: 'आर्थिक विकास',
    summary: 'अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळाच्या माध्यमातून नवउद्योजकांना १५ लाखांपर्यंत बिनव्याजी कर्ज वाटप योजना गतीने लागू करण्यात आली असून ५,००० कोटी रुपयांचा पतपुरवठा मंजूर झाला आहे.',
    author: 'शासकीय समन्वय कक्ष',
    featured: false
  },
  {
    id: 'n6',
    category: 'business',
    categoryLabel: 'उद्योग व व्यापार',
    title: 'जागतिक मराठा बिझनेस एक्स्पो २०२६ — मुंबईत आंतरराष्ट्रीय व्यापार परिषद',
    date: '१८ जानेवारी २०२६',
    tag: 'जागतिक एक्स्पो',
    summary: 'दुबई, लंडन आणि अमेरिकेतील अनिवासी मराठा उद्योजकांच्या सहकार्याने मुंबईत बीकेसी येथे आंतरराष्ट्रीय कृषी निर्यात, आयटी आणि उत्पादन क्षेत्रातील जागतिक परिषद जाहीर.',
    author: 'ग्लोबल मराठा फोरम',
    featured: false
  }
];

export default function NewsAnnouncementsPage() {
  const [newsList, setNewsList] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_news_articles_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NEWS;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'business',
    categoryLabel: 'उद्योग व व्यापार',
    tag: 'घोषणा',
    date: 'आत्ताच',
    summary: '',
    author: 'अधिकृत प्रसिद्धी कक्ष'
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_news_articles_data', JSON.stringify(newsList));
    } catch (e) {
      console.error(e);
    }
  }, [newsList]);

  const filteredNews = newsList.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    const today = new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    setFormData({
      title: '',
      category: 'business',
      categoryLabel: 'उद्योग व व्यापार',
      tag: 'ताज्या घडामोडी',
      date: today,
      summary: '',
      author: 'Connect Maratha प्रसिद्धी कक्ष'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      categoryLabel: item.categoryLabel,
      tag: item.tag || 'घोषणा',
      date: item.date,
      summary: item.summary,
      author: item.author || 'प्रसिद्धी कक्ष'
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('ही बातमी हटवायची आहे का?')) {
      setNewsList(newsList.filter(n => n.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व बातम्या मूळ अधिकृत डेटावर रीसेट करायच्या आहेत का?')) {
      setNewsList(DEFAULT_NEWS);
      localStorage.setItem('cm_news_articles_data', JSON.stringify(DEFAULT_NEWS));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.summary.trim()) {
      alert('कृपया बातमीचे शीर्षक आणि तपशील प्रविष्ट करा.');
      return;
    }

    if (editItem) {
      setNewsList(newsList.map(n => n.id === editItem.id ? { ...n, ...formData } : n));
    } else {
      const newArticle = {
        id: 'news_' + Date.now(),
        ...formData
      };
      setNewsList([newArticle, ...newsList]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 60%, #7D1B1B 100%)',
          borderRadius: '24px',
          padding: '40px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 20px 50px rgba(61,13,13,0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.2)', border: '1px solid #DD8A2E', padding: '4px 14px', borderRadius: '20px', marginBottom: '12px' }}>
              <span>📰</span>
              <span style={{ color: '#FDF3E6', fontSize: '0.82rem', fontWeight: 800 }}>
                अधिकृत घोषणा व प्रसिद्धीपत्रके (Real-Time Press Portal)
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              margin: '0 0 10px',
              color: '#FFF',
              lineHeight: 1.2
            }}>
              बातम्या, घडामोडी व प्रसिद्धीपत्रके
            </h1>
            <p style={{ color: '#F1E7D8', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
              Connect Maratha अधिकृत घोषणा, सामाजिक उपक्रम, शासकीय निर्णय, आरक्षण लढा व व्यावसायिक घडामोडींचा रिअल-टाइम प्रवाह.
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
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(221,138,46,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              <span>➕</span> प्रसिद्धीपत्रक जोडा
            </button>
            <button
              onClick={handleResetDefaults}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}>
              ↺ रीसेट
            </button>
          </div>
        </div>

        {/* Filter and Search Controls */}
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
              { id: 'all', label: 'सर्व बातम्या' },
              { id: 'history', label: '🚩 इतिहास व उत्सव' },
              { id: 'business', label: '💼 उद्योग व व्यापार' },
              { id: 'education', label: '🎓 शिक्षण व करिअर' },
              { id: 'forts', label: '🏰 दुर्ग संवर्धन' },
              { id: 'government', label: '🏛️ शासकीय योजना' }
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
              placeholder="बातम्या किंवा घोषणा शोधा..."
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

        {/* News Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredNews.map(item => (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '28px',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 6px 20px rgba(61,13,13,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s'
              }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      background: '#FFF7ED',
                      color: '#EA580C',
                      border: '1px solid #FED7AA',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {item.tag}
                    </span>
                    <span style={{
                      background: '#FDF3E6',
                      color: '#7A1C1C',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {item.categoryLabel || item.category}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.84rem', color: '#666', fontWeight: 600 }}>
                    📅 {item.date}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#2A0606',
                  margin: '0 0 10px',
                  lineHeight: 1.35
                }}>
                  {item.title}
                </h2>

                <p style={{ fontSize: '0.94rem', color: '#4B3F35', lineHeight: 1.65, margin: '0 0 16px' }}>
                  {item.summary}
                </p>

                <div style={{ fontSize: '0.82rem', color: '#888', fontStyle: 'italic', marginBottom: '8px' }}>
                  ✍️ स्रोत: {item.author}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #E6DDCE'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    style={{
                      background: '#FAF6F0',
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
                    onClick={() => handleDelete(item.id)}
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
                  to={`/article/${item.id}`}
                  style={{
                    color: '#EA580C',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                  सविस्तर वृत्त वाचा →
                </Link>
              </div>
            </div>
          ))}

          {filteredNews.length === 0 && (
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              border: '1px dashed #DD8A2E',
              color: '#666'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📰</div>
              <h3 style={{ color: '#3D0D0D' }}>कोणतीही बातमी आढळली नाही</h3>
              <p>कृपया शोध संज्ञा बदला किंवा नवीन प्रसिद्धीपत्रक जोडा.</p>
            </div>
          )}
        </div>

        {/* Modal for Add / Edit News */}
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
                background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
                color: '#FFF',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', margin: 0 }}>
                  {editItem ? '✏️ बातमी संपादित करा' : '➕ नवीन बातमी / प्रसिद्धीपत्रक जोडा'}
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
                    बातमीचे मुख्य शीर्षक *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. शिवराज्याभिषेक सोहळा रायगडावर संपन्न"
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
                          history: 'इतिहास व उत्सव',
                          business: 'उद्योग व व्यापार',
                          education: 'शिक्षण व करिअर',
                          forts: 'दुर्ग संवर्धन',
                          government: 'शासकीय योजना'
                        };
                        setFormData({ ...formData, category: cat, categoryLabel: labels[cat] || 'बातम्या' });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="history">इतिहास व उत्सव</option>
                      <option value="business">उद्योग व व्यापार</option>
                      <option value="education">शिक्षण व करिअर</option>
                      <option value="forts">दुर्ग संवर्धन</option>
                      <option value="government">शासकीय योजना</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      टॅग / लेबल
                    </label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="उदा. ठळक बातमी, व्यापार"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      तारीख
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="उदा. ६ जून २०२६"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      स्रोत / लेखक
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="उदा. मध्यवर्ती प्रसिद्धी कक्ष"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    बातमीचा संपूर्ण गोषवारा व मजकूर *
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="घडामोडीचा संपूर्ण तपशील येथे लिहा..."
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
                    {editItem ? 'बदल जतन करा ✓' : 'प्रसिद्ध करा ✓'}
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
