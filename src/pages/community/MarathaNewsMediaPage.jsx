import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const newsChannels = [
  {
    id: 1,
    name: 'साम टीव्ही (Saam TV)',
    lang: 'मराठी',
    type: 'LIVE TV',
    views: '१.२ लाख सक्रिय',
    color: '#900C3F',
    logo: '/assets/images/news/saam_tv.jpg'
  },
  {
    id: 2,
    name: 'Zee 24 तास',
    lang: 'मराठी',
    type: 'LIVE TV',
    views: '१.९ लाख सक्रिय',
    color: '#000000',
    logo: '/assets/images/news/zee_24_taas.svg'
  },
  {
    id: 3,
    name: 'News18 लोकमत',
    lang: 'मराठी',
    type: 'LIVE TV',
    views: '२.५ लाख सक्रिय',
    color: '#B71C1C',
    logo: '/assets/images/news/news18_lokmat.svg'
  },
  {
    id: 4,
    name: 'एबीपी माझा (ABP Majha)',
    lang: 'मराठी',
    type: 'LIVE TV',
    views: '३.२ लाख सक्रिय',
    color: '#D32F2F',
    logo: '/assets/images/news/abp_majha.svg'
  },
  {
    id: 5,
    name: 'लोकशाही न्यूज (Lokshahi)',
    lang: 'मराठी',
    type: 'LIVE TV',
    views: '८५ हजार सक्रिय',
    color: '#E65100',
    logo: '/assets/images/news/lokshahi.svg'
  },
  {
    id: 6,
    name: 'तरुण भारत न्यूज',
    lang: 'मराठी',
    type: 'LIVE TV',
    views: '९० हजार सक्रिय',
    color: '#880E4F',
    logo: '/assets/images/news/tarun_bharat.svg'
  }
];

const epapersData = [
  { id: 1, name: 'तरुण भारत', year: '१९१९', city: 'कोल्हापूर', editor: 'स्वाभिमानातून स्वावलंबनाकडे' },
  { id: 2, name: 'सकाळ', year: '१९३२', city: 'पुणे', editor: 'समाज एकतेतून प्रगती शक्य' },
  { id: 3, name: 'लोकमत', year: '१९७१', city: 'नागपूर', editor: 'मराठा समाजाची दिशा आणि दशा' },
  { id: 4, name: 'पुढारी', year: '१९३९', city: 'कोल्हापूर', editor: 'शिक्षण, उद्योग आणि स्वाभिमान' },
  { id: 5, name: 'केसरी', year: '१८८१', city: 'पुणे (लोकमान्य टिळक)', editor: 'स्वराज्य हा माझा जन्मसिद्ध हक्क' },
  { id: 6, name: 'नवशक्ति', year: '१९३२', city: 'मुंबई', editor: 'महाराष्ट्राचा औद्योगिक विकास' }
];

const CATEGORIES = ['सर्व', 'सामाजिक', 'आरक्षण लढा', 'कृषी व ग्रामीण', 'शिक्षण व रोजगार', 'इतिहास व संस्कृती', 'संघटना वृत्त'];

export default function MarathaNewsMediaPage() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeEpaper, setActiveEpaper] = useState(null);

  // Real-time News Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Submit Form state
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'सामाजिक',
    district: 'पुणे',
    summary: '',
    content: '',
    source_name: 'कम्युनिटी रिपोर्टर',
    source_url: '',
    image_url: '',
    author_name: user?.name || ''
  });

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCat !== 'सर्व') params.category = selectedCat;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await api.portals.getNewsArticles(params);
      const list = res?.data?.articles || res?.articles || [];
      setArticles(list);
    } catch (err) {
      console.error('Failed to load news articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedCat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArticles();
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      alert('कृपया बातमीचे शीर्षक आणि तपशील प्रविष्ट करा.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.portals.submitNewsArticle({
        ...newsForm,
        author_name: newsForm.author_name || user?.name || 'मराठा बातमीदार'
      });
      setSubmitSuccess('🚩 आपली बातमी यशस्वीरित्या सादर झाली आहे! संपादकीय पडताळणीनंतर ती थेट पोर्टलवर प्रसिद्ध होईल.');
      setNewsForm({
        title: '',
        category: 'सामाजिक',
        district: 'पुणे',
        summary: '',
        content: '',
        source_name: 'कम्युनिटी रिपोर्टर',
        source_url: '',
        image_url: '',
        author_name: user?.name || ''
      });
      setTimeout(() => {
        setSubmitSuccess('');
        setShowSubmitModal(false);
      }, 2500);
      loadArticles();
    } catch (err) {
      alert('बातमी सबमिट करताना त्रुटी: ' + (err.message || 'सर्व्हर संपर्क अयशस्वी'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="maratha-news-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(90deg, rgba(15, 10, 8, 0.72) 0%, rgba(15, 10, 8, 0.45) 45%, rgba(15, 10, 8, 0.10) 75%, rgba(15, 10, 8, 0.25) 100%), url("/assets/images/generated/maratha_news_hero.jpg")',
        backgroundPosition: 'right 30% center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        padding: '50px 24px',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        borderBottom: '4px solid #E65100'
      }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '580px', textAlign: 'left' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '14px',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              🚩 CONNECT मराठा — एक लढा! एक समाज! एक भविष्य!
            </div>
            <p style={{
              fontSize: '1.2rem',
              color: '#FFD54F',
              fontWeight: 800,
              margin: '0 0 8px',
              letterSpacing: '0.5px',
              textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.85)'
            }}>
              मराठा अस्मिता, मराठा समाचार !
            </p>
            <h1 style={{
              fontSize: 'clamp(2.1rem, 4.2vw, 3rem)',
              fontWeight: 900,
              margin: '0 0 12px',
              lineHeight: 1.25,
              color: '#FFE082',
              textShadow: '0 3px 10px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,1)'
            }}>
              मराठा न्यूज & वृत्तपत्र महादालन
            </h1>
            <p style={{
              fontSize: '1.05rem',
              color: '#FFFFFF',
              margin: '0 0 24px',
              maxWidth: '520px',
              lineHeight: 1.6,
              fontWeight: 600,
              textShadow: '0 2px 8px rgba(0,0,0,0.95)'
            }}>
              बातमी खरी, भूमिका स्पष्ट, समाजासाठी सदैव तत्पर ! || जय भवानी ! जय शिवाजी !
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a
                href="#live-tv"
                style={{
                  background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔴 ५ लाईव्ह न्यूज चॅनल्स
              </a>
              <a
                href="#epapers"
                style={{
                  background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📰 E-Paper वाचा (६ वृत्तपत्रे)
              </a>
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ✍️ बातमी सबमिट करा (कम्युनिटी रिपोर्टर)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Community Reports Section */}
      <section style={{ maxWidth: '1180px', margin: '36px auto 0', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1A17', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚡ ताजी घडामोडी & समाज वृत्त
              <span style={{ fontSize: '0.85rem', background: '#E65100', color: '#fff', padding: '3px 10px', borderRadius: '12px' }}>
                रिअल-टाइम अपडेट्स
              </span>
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
              जिल्हानिहाय मराठा समाज, शेतकरी आंदोलन, शैक्षणिक निर्णय व यशोगाथा
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="बातमी किंवा जिल्हा शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #CCC',
                fontSize: '0.9rem',
                minWidth: '220px'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#E65100',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              शोधा
            </button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: selectedCat === cat ? '#B71C1C' : '#FFFFFF',
                color: selectedCat === cat ? '#FFFFFF' : '#4E342E',
                border: '1px solid #E0D4C8',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Real-time Articles Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            बातमी फीड लोड होत आहे...
          </div>
        ) : articles.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px dashed #DDD',
            color: '#666'
          }}>
            <span style={{ fontSize: '2.5rem' }}>📢</span>
            <h3 style={{ margin: '10px 0 6px', color: '#3E2723' }}>सध्या या वर्गात नवीन बातम्या नाहीत</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.9rem' }}>
              आपल्या परिसरातील मराठा समाज वृत्त किंवा उपक्रमाची बातमी आपण स्वतः सबमिट करू शकता.
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              style={{
                background: '#E65100',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✍️ पहिली बातमी सबमिट करा
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {articles.map((art) => (
              <div
                key={art.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #EADBCE',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s'
                }}
              >
                {art.image && (
                  <img
                    src={art.image}
                    alt={art.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: '#FFF3E0',
                      color: '#E65100',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      {art.category || 'सामाजिक'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>
                      📍 {art.district || 'महाराष्ट्र'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2E1A17', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {art.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#555', margin: '0 0 14px', flex: 1, lineHeight: 1.5 }}>
                    {art.summary || (art.content ? art.content.slice(0, 120) + '...' : '')}
                  </p>
                  <div style={{ borderTop: '1px solid #F0E6DE', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#888' }}>
                    <span>बातमीदार: {art.author || art.source || 'मराठा बातमीदार'}</span>
                    <span>{art.created_at ? new Date(art.created_at).toLocaleDateString('mr-IN') : 'आज'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* News & Community Motto Strip */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)',
        color: '#3E2723',
        padding: '12px 20px',
        borderTop: '1px solid #FFE0B2',
        borderBottom: '2px solid #E65100',
        boxShadow: '0 2px 8px rgba(230,81,0,0.08)'
      }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)',
            color: '#FFFFFF',
            padding: '4px 14px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 800,
            boxShadow: '0 2px 6px rgba(216,67,21,0.25)',
            letterSpacing: '0.5px'
          }}>
            ध्येय वाक्य
          </span>
          <span style={{ fontSize: '0.94rem', color: '#B71C1C', fontWeight: 800, letterSpacing: '0.3px' }}>
            सत्य, निर्भीड व समाजहितैषी पत्रकारिता — दर्पण ते डिजिटल युगापर्यंत अखंड मराठा जागर !
          </span>
        </div>
      </div>

      {/* Live TV Channels Section */}
      <section id="live-tv" style={{ maxWidth: '1180px', margin: '36px auto 0', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1A17', margin: 0 }}>
            🔴 मराठा न्यूज चॅनल्स (Live TV)
          </h2>
          <span style={{ color: '#2E7D32', fontWeight: 700, fontSize: '0.9rem' }}>
            ● थेट प्रक्षेपण २४x७ उपलब्ध
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '18px' }}>
          {newsChannels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EADBCE',
                padding: '24px 18px 20px',
                textAlign: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1.5px solid #F0E6DE',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                overflow: 'hidden',
                padding: '6px'
              }}>
                <img
                  src={ch.logo}
                  alt={ch.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/news/saam_tv.jpg';
                  }}
                />
              </div>
              <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#2E1A17', margin: '0 0 6px' }}>
                {ch.name}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#666' }}>
                भाषा: {ch.lang} • {ch.views}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leading Newspapers & E-Paper Section */}
      <section id="epapers" style={{ maxWidth: '1180px', margin: '50px auto 0', padding: '0 16px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1A17', marginBottom: '8px' }}>
          📰 प्रमुख वृत्तपत्रे व E-Paper
        </h2>
        <p style={{ color: '#666', fontSize: '0.92rem', marginBottom: '24px' }}>
          सत्य, निर्भीड आणि समाजहितासाठी मराठा वृत्तपत्रांचा एक विश्वसनीय मंच
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {epapersData.map((ep) => (
            <div
              key={ep.id}
              onClick={() => setActiveEpaper(ep)}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EADBCE',
                padding: '24px',
                boxShadow: '0 6px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.09)';
                e.currentTarget.style.borderColor = '#B71C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#EADBCE';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#B71C1C', margin: 0 }}>
                    {ep.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', background: '#FFEBEE', color: '#B71C1C', padding: '3px 10px', borderRadius: '10px', fontWeight: 700 }}>
                    स्था: {ep.year}
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#555', marginBottom: '8px' }}>
                  📍 {ep.city}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#555', fontStyle: 'italic', background: '#FAF7F2', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #B71C1C' }}>
                  संपादकीय: "{ep.editor}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Maratha Journalism Heritage & Charter Section */}
      <section style={{ maxWidth: '1180px', margin: '50px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF3E0 100%)',
          borderRadius: '16px',
          padding: '36px 32px',
          border: '2px solid #FFCC80',
          boxShadow: '0 8px 24px rgba(230,81,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
              color: '#FFFFFF',
              padding: '5px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              boxShadow: '0 3px 8px rgba(230,81,0,0.25)'
            }}>
              🚩 मराठी वृत्तपत्र परंपरा व तत्त्वप्रणाली
            </span>
          </div>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 12px' }}>
            📰 निर्भीड पत्रकारितेचा ऐतिहासिक वारसा
          </h3>
          <p style={{ fontSize: '0.96rem', lineHeight: 1.7, color: '#4E342E', margin: '0 0 24px', maxWidth: '920px', fontWeight: 500 }}>
            दर्पणकार बाळशास्त्री जांभेकर, लोकमान्य टिळक (केसरी) आणि अच्युतराव पटवर्धन यांच्यापासून सुरू झालेली मराठी पत्रकारिता ही केवळ बातम्या देण्याचे साधन नसून समाजप्रबोधन, सत्यनिष्ठा आणि लोकशाहीच्या संरक्षणाचा आधारस्तंभ राहिली आहे. CONNECT मराठा याच सत्यशोधक विचारधारेवर चालत समस्त मराठी बांधवांना विश्वासार्ह व एकात्म माहिती मंच उपलब्ध करून देण्यास कटिबद्ध आहे.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            borderTop: '1px solid #FFE0B2',
            paddingTop: '20px'
          }}>
            <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', borderLeft: '4px solid #FF6F00', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #FFE0B2', borderLeftWidth: '4px' }}>
              <div style={{ fontWeight: 800, color: '#E65100', fontSize: '1.02rem', marginBottom: '6px' }}>
                १. सत्य व निष्पक्षता
              </div>
              <p style={{ fontSize: '0.86rem', color: '#5D4037', margin: 0, lineHeight: 1.5 }}>
                समाजाच्या प्रत्येक घटकाचा आवाज, अधिकृत व पडताळणी केलेले निष्पक्ष वृत्त विश्लेषण.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', borderLeft: '4px solid #E65100', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #FFE0B2', borderLeftWidth: '4px' }}>
              <div style={{ fontWeight: 800, color: '#E65100', fontSize: '1.02rem', marginBottom: '6px' }}>
                २. अखंड डिजिटल उपलब्धता
              </div>
              <p style={{ fontSize: '0.86rem', color: '#5D4037', margin: 0, lineHeight: 1.5 }}>
                महाराष्ट्रातील अग्रगण्य टीव्ही चॅनल्स व वृत्तपत्रांचे डिजिटल अंक एकाच क्लिकवर.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', borderLeft: '4px solid #B71C1C', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #FFE0B2', borderLeftWidth: '4px' }}>
              <div style={{ fontWeight: 800, color: '#B71C1C', fontSize: '1.02rem', marginBottom: '6px' }}>
                ३. सामाजिक व कृषी विकास
              </div>
              <p style={{ fontSize: '0.86rem', color: '#5D4037', margin: 0, lineHeight: 1.5 }}>
                शेतकरी, युवक, उद्योग व संस्कृती या महत्त्वाच्या विषयांना अग्रक्रम व न्याय.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Community Reporter News Submission */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowSubmitModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            <h3 style={{ color: '#B71C1C', margin: '0 0 6px', fontSize: '1.4rem' }}>✍️ बातमी सबमिट करा (Community Reporter)</h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '18px' }}>
              आपल्या गावातील, तालुक्यातील किंवा संघटनेची बातमी थेट कनेक्ट मराठा पोर्टलवर सादर करा.
            </p>

            {submitSuccess ? (
              <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '16px', borderRadius: '8px', fontWeight: 700, textAlign: 'center' }}>
                {submitSuccess}
              </div>
            ) : (
              <form onSubmit={handleNewsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>बातमीचे शीर्षक *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. सकल मराठा समाजाच्या वतीने पुण्यात भव्य रक्तदान शिबिर संपन्न"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>वर्ग (Category)</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    >
                      {CATEGORIES.filter(c => c !== 'सर्व').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>जिल्हा</label>
                    <input
                      type="text"
                      placeholder="उदा. पुणे, छत्रपती संभाजीनगर"
                      value={newsForm.district}
                      onChange={(e) => setNewsForm({ ...newsForm, district: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>संक्षिप्त सारांश (Summary)</label>
                  <input
                    type="text"
                    placeholder="१-२ ओळीत बातमीचा मुख्य मुद्दा"
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>सविस्तर मजकूर (Full Content) *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="घडामोडीचा संपूर्ण तपशील, मान्यवर, घेतलेले निर्णय इत्यादी..."
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>बातमीदाराचे नाव</label>
                    <input
                      type="text"
                      placeholder="आपले नाव"
                      value={newsForm.author_name}
                      onChange={(e) => setNewsForm({ ...newsForm, author_name: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333', marginBottom: '4px' }}>फोटो लिंक (Image URL)</label>
                    <input
                      type="url"
                      placeholder="https://... किंवा मोकळे ठेवा"
                      value={newsForm.image_url}
                      onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #E65100 0%, #B71C1C 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {isSubmitting ? 'सादर करत आहे...' : '🚀 बातमी सादर करा'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    style={{ background: '#eee', color: '#333', border: 'none', padding: '12px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    रद्द करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Live TV Player */}
      {activeChannel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#1E1E1E', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px', color: '#fff', position: 'relative' }}>
            <button onClick={() => setActiveChannel(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: '#333', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#fff', fontWeight: 700 }}>✕</button>
            <div style={{ background: '#000', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '3.5rem' }}>🔴</span>
              <div style={{ color: '#FFD54F', fontSize: '1.2rem', fontWeight: 800, marginTop: '8px' }}>{activeChannel.name} — थेट प्रक्षेपण (Live Stream)</div>
              <p style={{ color: '#888', fontSize: '0.84rem' }}>अधिकृत मराठी न्यूज फीड कनेक्टेड</p>
            </div>
            <button onClick={() => setActiveChannel(null)} style={{ width: '100%', background: '#B71C1C', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>बंद करा</button>
          </div>
        </div>
      )}

      {/* Modal: E-Paper Reader */}
      {activeEpaper && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setActiveEpaper(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            <h3 style={{ color: '#B71C1C', margin: '0 0 6px', fontSize: '1.4rem' }}>📰 {activeEpaper.name} — आजचा ई-पेपर</h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '16px' }}>मुख्यालय: {activeEpaper.city} • स्थापना वर्ष: {activeEpaper.year}</p>
            <div style={{ border: '2px dashed #B71C1C', borderRadius: '10px', padding: '40px 20px', textAlign: 'center', background: '#FAF7F2', marginBottom: '18px' }}>
              <span style={{ fontSize: '3rem' }}>📄</span>
              <div style={{ fontWeight: 800, color: '#3E2723', marginTop: '10px' }}>ई-पेपर पीडीएफ (E-Paper PDF) लोड झाले आहे</div>
              <p style={{ color: '#666', fontSize: '0.84rem' }}>एकूण पाने: १२ • मुख्य आवृत्ती</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => alert(`${activeEpaper.name} ई-पेपर डाऊनलोड सुरू झाले!`)} style={{ flex: 1, background: '#B71C1C', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                ⬇️ पीडीएफ डाउनलोड करा
              </button>
              <button onClick={() => setActiveEpaper(null)} style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
