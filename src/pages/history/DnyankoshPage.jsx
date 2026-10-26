import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEFAULT_ENTRIES = [
  { id: '1', name: 'छत्रपती शिवाजी महाराज', cat: 'vyakti', icon: '🚩', meta: 'हिंदवी स्वराज्याचे संस्थापक — गडकोट, आरमार व अष्टप्रधान मंडळाचे शिल्पकार', link: '/history/shivaji-maharaj' },
  { id: '2', name: 'छत्रपती संभाजी महाराज', cat: 'vyakti', icon: '⚔️', meta: 'धर्मवीर छत्रपती — १२८ लढायांतील अजिंक्य नेतृत्व व तुळापूरचे सर्वोच्च बलिदान', link: '/history/sambhaji-maharaj' },
  { id: '3', name: 'श्रीमंत थोरले बाजीराव पेशवे', cat: 'peshwe', icon: '🐎', meta: '४१ लढाया, शून्य पराभव — मराठा साम्राज्याचा नर्मदेपलीकडे विस्तार करणारे पेशवे', link: '/history/bajirao-peshwa' },
  { id: '4', name: 'राष्ट्रमाता जिजाऊ माँसाहेब', cat: 'vyakti', icon: '🌸', meta: 'स्वराज्याच्या संकल्पक, नीतीवंत न्यायकर्त्या व शिवरायांच्या मार्गदर्शक माता', link: '/history/rajmata-jijau' },
  { id: '5', name: 'सुभेदार तानाजी मालुसरे', cat: 'sainya', icon: '🛡️', meta: 'कोंढाणा (सिंहगड) पुनर्जय मोहिमेचे नायक — "आधी लगीन कोंढाण्याचं, मग माझ्या रायबाचं!"', link: '/history/warriors' },
  { id: '6', name: 'वीर बाजी प्रभू देशपांडे', cat: 'sainya', icon: '🗡️', meta: 'पावनखिंडीतील अजरामर बलिदानाचे अद्वितीय महानायक', link: '/forts/panhala-pavankhind' },
  { id: '7', name: 'सरखेल कान्होजी आंग्रे', cat: 'aarmar', icon: '⚓', meta: 'मराठा आरमाराचे सर्वोच्च सेनापती — ३० वर्षे अजिंक्य सागरी वर्चस्व', link: '/history/navy' },
  { id: '8', name: 'श्रीमंत महादजी शिंदे', cat: 'sainya', icon: '🏇', meta: 'दिल्लीचे तख्त नियंत्रक — आधुनिक कवायती सेनेचे (कंपू) संस्थापक व मराठा साम्राज्याचे रक्षक', link: '/history/warriors' },
  { id: '9', name: 'पुण्यश्लोक अहिल्याबाई होळकर', cat: 'vyakti', icon: '🙏', meta: 'लोकमाता — न्यायप्रिय सुशासन, औद्योगिक विकास व भारतभर मंदिर जीर्णोद्धाराच्या प्रणेत्या', link: '/history/warriors' },
  { id: '10', name: 'दुर्गराज रायगड', cat: 'killa', icon: '🏰', meta: 'स्वराज्याची राजधानी — शिवराज्याभिषेक सोहळ्याचे साक्षीदार व शिवतीर्थ', link: '/forts/raigad' },
  { id: '11', name: 'किल्ले राजगड', cat: 'killa', icon: '⛰️', meta: 'स्वराज्याची पहिली राजधानी — छत्रपती शिवरायांच्या प्रारंभिक कारकिर्दीचे २५ वर्षे केंद्र', link: '/forts/rajgad' },
  { id: '12', name: 'किल्ले सिंधुदुर्ग', cat: 'killa', icon: '🏝️', meta: 'अरबी समुद्रातील अजिंक्य जलदुर्ग — मराठा आरमाराचे केंद्र व UNESCO वारसा स्थळ', link: '/forts' },
  { id: '13', name: 'किल्ले विजयदुर्ग (घेरिया)', cat: 'killa', icon: '⚓', meta: 'आरमाराचे प्रमुख तळ, जहाजबांधणी गोदी व तिहेरी तटबंदीचा अभेद्य जलदुर्ग', link: '/forts' },
  { id: '14', name: 'किल्ले सिंहगड (कोंढाणा)', cat: 'killa', icon: '🏔️', meta: 'तानाजी मालुसरेंच्या पराक्रमाने पावन झालेला पुण्याजवळील सामरिक गड', link: '/forts' },
  { id: '15', name: 'किल्ले पन्हाळगड', cat: 'killa', icon: '🗻', meta: 'सिद्दी जौहरच्या वेढ्यातून शिवरायांच्या ऐतिहासिक सुटकेचे व शंभूराजांचे वास्तव्य स्थळ', link: '/forts/panhala-pavankhind' },
  { id: '16', name: 'प्रतापगड युद्ध (१६५९)', cat: 'ladhai', icon: '⚔️', meta: 'अफझलखानाचा वध व विजापूरच्या बलाढ्य फौजेचा धुव्वा उडवणारी गनिमी काव्याची लढाई', link: '/history/battles' },
  { id: '17', name: 'पालखेडची लढाई (१७२८)', cat: 'ladhai', icon: '🐎', meta: 'बाजीराव पेशव्यांची निजामाविरुद्ध गनिमी काव्याची जागतिक कीर्तीची रणनीती', link: '/history/battles' },
  { id: '18', name: 'अष्टप्रधान मंडळ व्यवस्था', cat: 'prashasan', icon: '⚖️', meta: 'पंतप्रधान, अमात्य, सचिव, मंत्री, सेनापती, सुमंत, न्यायाधीश व पंडितराव', link: '/history/swarajya-administration' },
  { id: '19', name: 'गनिमी कावा (Ganimi Kawa)', cat: 'shabdakosh', icon: '🏹', meta: 'सह्याद्रीच्या भौगोलिक रचनेचा वापर करून बलाढ्य शत्रूवर अचूक आघात करण्याची मराठा युद्धनीती', link: '/history/battles' },
  { id: '20', name: 'मोडी लिपी व सनदा', cat: 'shabdakosh', icon: '📜', meta: 'मराठा साम्राज्याची अधिकृत जलद प्रशासकीय लिपी आणि ऐतिहासिक दस्तऐवज', link: '/granthalaya' },
  { id: '21', name: '९६ कुळी मराठा घराणी', cat: 'gharane', icon: '🏛️', meta: 'भोसले, शिंदे, होळकर, गायकवाड, घोरपडे, मोरे, मोहिते, कदम, साळुंखे इत्यादी प्रमुख घराणी', link: '/history/warriors' }
];

export default function DnyankoshPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [dbArticles, setDbArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'मराठा इतिहास',
    subcategory: 'शिवचरित्र',
    summary: '',
    content: '',
    sources: ''
  });

  // Fetch articles from backend API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.portals.getDnyankosh()
      .then(res => {
        if (isMounted && res?.data) {
          setDbArticles(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Combine static curated entries and dynamic DB articles
  const allArticles = [
    ...dbArticles.map(a => ({
      id: a.id,
      name: a.title,
      cat: a.category === 'प्रशासन व राज्यव्यवस्था' ? 'prashasan' : (a.category === 'युद्धशास्त्र व लढाया' ? 'ladhai' : 'vyakti'),
      icon: a.icon || '📖',
      meta: a.summary,
      link: `/history/dnyankosh#${a.slug}`
    })),
    ...DEFAULT_ENTRIES
  ];

  const filtered = allArticles.filter(e => {
    const matchCat = activeCat === 'all' || e.cat === activeCat;
    const matchSearch = search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.meta.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      showToast('कृपया लेखाचे शीर्षक आणि मुख्य मजकूर भरा.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.portals.submitDnyankoshArticle({
        title: articleForm.title,
        category: articleForm.category,
        subcategory: articleForm.subcategory,
        summary: articleForm.summary || articleForm.title,
        content: articleForm.content,
        author_name: user?.name || 'ज्ञानकोश योगदानकर्ता',
        sources: articleForm.sources.split(',').map(s => s.trim()).filter(Boolean)
      });
      showToast('तुमचा ज्ञानकोश लेख संपादकीय पुनरावलोकनासाठी (Editorial Review) सादर झाला आहे!', 'success');
      setShowSubmitModal(false);
      setArticleForm({ title: '', category: 'मराठा इतिहास', subcategory: 'शिवचरित्र', summary: '', content: '', sources: '' });
    } catch (err) {
      showToast(err.message || 'लेख सबमिट करताना त्रुटी आली.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px 80px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Hero Header */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #2A0709 0%, #5C1414 100%)',
          color: '#FFF',
          padding: '40px 32px',
          border: '1.5px solid #DD8A2E',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{
                background: '#DD8A2E',
                color: '#2A0709',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}>
                मराठी ज्ञानकोश व संदर्भ दालन
              </span>
              <h1 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: '2.4rem',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '12px 0 8px'
              }}>
                मराठा ज्ञानकोश (Dnyankosh)
              </h1>
              <p style={{ color: '#E8D2C2', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
                छत्रपती शिवराय, स्वराज्य प्रशासन, शूर मावळे, ३५०+ अभेद्य दुर्ग, लढाया आणि ९६ कुळी मराठा संस्कृतीचा 
                विश्वासार्ह, संदर्भाधारित मराठी ज्ञानकोश.
              </p>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              style={{
                background: 'linear-gradient(135deg, #DD8A2E 0%, #B86B18 100%)',
                color: '#2A0709',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 16px rgba(221,138,46,0.3)'
              }}
            >
              ✍️ ज्ञानकोशात लेख जोडा (Giver)
            </button>
          </div>
        </div>

        {/* Quick Portal Switcher */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          {[
            { label: '🎓 उच्च शिक्षण', path: '/education' },
            { label: '🏛️ महाविद्यालये', path: '/colleges' },
            { label: '📜 शिष्यवृत्ती', path: '/scholarships' },
            { label: '🎯 स्वराज्य क्विझ', path: '/quiz' },
            { label: '💡 ज्ञानकोश (सक्रिय)', path: '/dnyankosh', active: true },
            { label: '📚 ग्रंथालय व बखरी', path: '/history/granthalaya' },
            { label: '⏳ टाइम मशीन', path: '/time-machine' }
          ].map((portal, idx) => (
            <Link
              key={idx}
              to={portal.path}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: portal.active ? '#5C1414' : '#FFF',
                color: portal.active ? '#FFF' : '#4A1005',
                border: portal.active ? '1px solid #5C1414' : '1px solid #E6DDCE',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {portal.label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="ज्ञानकोशात शोधा (उदा. शिवाजी महाराज, तानाजी मालुसरे, रायगड, गनिमी कावा)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '1rem',
              borderRadius: '14px',
              border: '1.5px solid #E6DDCE',
              background: '#FFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              outline: 'none'
            }}
          />
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[
            { id: 'all', label: 'सर्व विभाग' },
            { id: 'vyakti', label: '👑 महापुरुष व व्यक्तिमत्त्वे' },
            { id: 'killa', label: '🏰 गडकोट व दुर्ग' },
            { id: 'ladhai', label: '⚔️ रणसंग्राम व लढाया' },
            { id: 'prashasan', label: '⚖️ स्वराज्य प्रशासन' },
            { id: 'aarmar', label: '⚓ मराठा आरमार' },
            { id: 'peshwe', label: '🐎 पेशवे व साम्राज्य' },
            { id: 'sainya', label: '🛡️ शूर सरदार व मावळे' },
            { id: 'shabdakosh', label: '📜 संकल्पना व लिपी' },
            { id: 'gharane', label: '🏛️ ९६ कुळी घराणी' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCat(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                border: activeCat === tab.id ? '2px solid #5C1414' : '1px solid #E6DDCE',
                background: activeCat === tab.id ? '#5C1414' : '#FFFFFF',
                color: activeCat === tab.id ? '#FFFFFF' : '#2B2420',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Entries Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map(item => (
            <Link
              key={item.id}
              to={item.link}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E6DDCE',
                boxShadow: '0 4px 14px rgba(199,56,0,0.04)',
                textDecoration: 'none',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
              <div style={{
                fontSize: '28px',
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: '#FDF3E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#3D0D0D',
                  margin: '0 0 6px'
                }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.5, margin: 0 }}>
                  {item.meta}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Contributor Article Submit Modal (Giver Flow) */}
        {showSubmitModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontFamily: 'Baloo 2', color: '#5C1414', fontSize: '1.5rem' }}>
                  ✍️ ज्ञानकोशात नवीन लेख सादर करा
                </h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitArticle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
                    लेखाचे शीर्षक *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. किल्ले साल्हेरची ऐतिहासिक लढाई"
                    value={articleForm.title}
                    onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
                      श्रेणी (Category)
                    </label>
                    <select
                      value={articleForm.category}
                      onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                    >
                      <option value="इतिहास व युगपुरुष">इतिहास व युगपुरुष</option>
                      <option value="गडकोट व दुर्ग">गडकोट व दुर्ग</option>
                      <option value="युद्धशास्त्र व लढाया">युद्धशास्त्र व लढाया</option>
                      <option value="प्रशासन व राज्यव्यवस्था">प्रशासन व राज्यव्यवस्था</option>
                      <option value="संस्कृती व परंपरा">संस्कृती व परंपरा</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
                      उपश्रेणी (Subcategory)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. मराठा साम्राज्य विस्तार"
                      value={articleForm.subcategory}
                      onChange={e => setArticleForm({ ...articleForm, subcategory: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
                    संक्षिप्त सारांश (Short Summary)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="लेखाचा १-२ ओळींत सारांश लिहा..."
                    value={articleForm.summary}
                    onChange={e => setArticleForm({ ...articleForm, summary: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
                    विस्तृत मजकूर (Detailed Content) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="लेखाचा संपूर्ण मजकूर सविस्तर लिहा..."
                    value={articleForm.content}
                    onChange={e => setArticleForm({ ...articleForm, content: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
                    ऐतिहासिक संदर्भ व ग्रंथ (Sources - स्वल्पविरामाने वेगळे करा)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सभासद बखर, रियासत, जेधे शकावली"
                    value={articleForm.sources}
                    onChange={e => setArticleForm({ ...articleForm, sources: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #CCC', background: '#FFF', cursor: 'pointer' }}
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#5C1414',
                      color: '#FFF',
                      fontWeight: 800,
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submitting ? 'सादर करत आहे...' : '🚀 संपादकीय मंजुरीसाठी सादर करा'}
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
