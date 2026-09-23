import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DNYANKOSH_ENTRIES = [
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
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = DNYANKOSH_ENTRIES.filter(e => {
    const matchCat = activeCat === 'all' || e.cat === activeCat;
    const matchSearch = search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.meta.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
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
          <span style={{
            background: '#DD8A2E',
            color: '#2A0709',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            📚 मराठा डिजिटल ज्ञानकोश
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            Connect Maratha ज्ञानकोश
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '1rem', maxWidth: '680px', margin: 0 }}>
            व्यक्ती, किल्ले, लढाया, घराणी आणि संज्ञा — मराठा इतिहासाशी संबंधित अस्सल ऐतिहासिक संदर्भ माहिती एकाच ठिकाणी शोधा.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 व्यक्ती, किल्ला, लढाई किंवा संज्ञा शोधा (उदा. शिवाजी महाराज, राजगड, अष्टप्रधान)..."
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              border: '2px solid #DD8A2E',
              fontSize: '1rem',
              outline: 'none',
              background: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[
            { id: 'all', label: '🗂️ सर्व नोंदी' },
            { id: 'vyakti', label: '👤 व्यक्तिमत्त्वे' },
            { id: 'killa', label: '🏰 किल्ले' },
            { id: 'ladhai', label: '⚔️ लढाया' },
            { id: 'gharane', label: '🏛️ घराणी' },
            { id: 'peshwe', label: '🐎 पेशवे' },
            { id: 'sainya', label: '🛡️ सैन्य व शिलेदार' },
            { id: 'aarmar', label: '⚓ आरमार' },
            { id: 'prashasan', label: '⚖️ प्रशासन' },
            { id: 'shabdakosh', label: '📖 शब्दकोश' }
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
                padding: '18px 20px',
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
                width: '48px',
                height: '48px',
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
                  margin: '0 0 4px'
                }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#5C534B', lineHeight: 1.5, margin: 0 }}>
                  {item.meta}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
