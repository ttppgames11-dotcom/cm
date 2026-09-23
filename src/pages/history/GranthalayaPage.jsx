import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GRANTH_COLLECTION = [
  {
    id: 'g1',
    title: 'सभासद बखर (Sabhasad Bakhar)',
    author: 'कृष्णाजी अनंत सभासद (इ.स. १६९७)',
    category: 'बखर',
    level: 'मूलभूत संदर्भ',
    desc: 'छत्रपती शिवाजी महाराजांच्या समकालीन अधिकृत बखरींपैकी सर्वात महत्त्वाची बखर. जिंजी येथे छत्रपती राजाराम महाराजांच्या आज्ञेवरून लिहिली गेली.',
    pages: '१४२ पृष्ठे',
    language: 'मराठी (देवनागरी / मोडी संदर्भासह)',
    tag: 'अस्सल बखर'
  },
  {
    id: 'g2',
    title: 'बुधभूषणम् (Budhabhushanam)',
    author: 'छत्रपती संभाजी महाराज',
    category: 'ग्रंथ',
    level: 'राजधर्म व नीती',
    desc: 'छत्रपती संभाजी महाराजांनी संस्कृत भाषेत रचलेला अलौकिक नीती व राज्यशास्त्र ग्रंथ. राजाची कर्तव्ये, राजकारण, सैन्य व्यवस्था व दुर्ग संरक्षणाचा अभ्यास.',
    pages: '२८० पृष्ठे',
    language: 'संस्कृत (मराठी अनुवादासह)',
    tag: 'शिवपुत्र रचना'
  },
  {
    id: 'g3',
    title: 'आज्ञापत्र (Agyapatra)',
    author: 'रामचंद्रपंत अमात्य बावडेकर (इ.स. १७१५)',
    category: 'प्रशासन',
    level: 'मराठा राज्यशास्त्र',
    desc: 'शिवकालीन दुर्ग व्यवस्थापन, आरमार, परराष्ट्र धोरण व रयतेच्या रक्षणाविषयीचा जागतिक दर्जाचा प्रशासकीय मार्गदर्शक ग्रंथ.',
    pages: '९६ पृष्ठे',
    language: 'मराठी',
    tag: 'प्रशासकीय सनद'
  },
  {
    id: 'g4',
    title: 'शिवभारत (Shivabharata)',
    author: 'कवींद्र परमानंद नेवासकर',
    category: 'महाकाव्य',
    level: 'समकालीन महाकाव्य',
    desc: 'छत्रपती शिवरायांच्या आज्ञेवरून रचलेले संस्कृत ऐतिहासिक महाकाव्य. शिवजन्मापासून पुरंदर तहापर्यंतचा समग्र इतिहास.',
    pages: '३२० पृष्ठे',
    language: 'संस्कृत',
    tag: 'समकालीन साक्ष'
  },
  {
    id: 'g5',
    title: 'मराठी रियासत (Marathi Riyasat)',
    author: 'रियासतकार गोविंद सखाराम सरदेसाई',
    category: 'इतिहास संशोधन',
    level: 'समग्र इतिहास',
    desc: 'मराठा साम्राज्याचा १६०० ते १८४८ पर्यंतचा सविस्तर ऐतिहासिक आढावा घेणारा बहुखंडीय संशोधन ग्रंथ.',
    pages: '८ खंड (३२००+ पृष्ठे)',
    language: 'मराठी',
    tag: 'अभिजात इतिहास'
  },
  {
    id: 'g6',
    title: 'मोडी लिपी प्राथमिक पाठमाला व सनदा संग्रह',
    author: 'Connect Maratha अर्काईव्ह मंडळ',
    category: 'मोडी लिपी',
    level: 'संशोधक व विद्यार्थी',
    desc: 'शिवकालीन व पेशवेकालीन अस्सल मोडी हस्तलिखिते, आज्ञापत्रे, सनदा आणि पत्रव्यवहार वाचण्याचे सचित्र मार्गदर्शन.',
    pages: '८४ पृष्ठे (सचित्र)',
    language: 'मोडी / मराठी',
    tag: 'डिजिटल अर्काईव्ह'
  }
];

export default function GranthalayaPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व');
  const [search, setSearch] = useState('');

  const categories = ['सर्व', 'बखर', 'ग्रंथ', 'प्रशासन', 'महाकाव्य', 'इतिहास संशोधन', 'मोडी लिपी'];

  const filtered = GRANTH_COLLECTION.filter(g => {
    const matchCat = selectedCat === 'सर्व' || g.category === selectedCat;
    const matchSearch = search === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.author.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '40px 32px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)',
          marginBottom: '32px'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#3D0D0D',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            📚 डिजिटल अर्काईव्ह
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            मराठा महाग्रंथालय व डिजिटल अर्काईव्ह
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
            सभासद बखर, शिवभारत, आज्ञापत्र, बुधभूषणम् आणि मोडी लिपीतील ऐतिहासिक दस्तऐवजांचा अस्सल व प्रमाणीकृत संग्रह.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 18px rgba(199,56,0,0.05)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 ग्रंथ, बखर, लेखक किंवा विषय शोधा..."
              style={{
                width: '100%',
                padding: '10px 18px',
                borderRadius: '30px',
                border: '1.5px solid #DD8A2E',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '1.5px solid #5C1414' : '1px solid #E6DDCE',
                  background: selectedCat === cat ? '#5C1414' : '#F8F5F0',
                  color: selectedCat === cat ? '#FFFFFF' : '#2B2420',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Granth Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
          {filtered.map(granth => (
            <div
              key={granth.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E6DDCE',
                boxShadow: '0 6px 20px rgba(199,56,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
              <div style={{
                background: 'linear-gradient(135deg, #FFFFFF, #FDF3E6)',
                padding: '20px',
                borderBottom: '1px solid rgba(221,138,46,0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    background: '#5C1414',
                    color: '#FFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {granth.tag}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#777', fontWeight: 600 }}>{granth.pages}</span>
                </div>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#3D0D0D',
                  margin: '0 0 4px',
                  lineHeight: 1.35
                }}>
                  {granth.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#C9701C', fontWeight: 700 }}>
                  ✍️ {granth.author}
                </div>
              </div>

              <div style={{ padding: '20px', flexGrow: 1 }}>
                <p style={{ fontSize: '0.88rem', color: '#5C534B', lineHeight: 1.55, margin: '0 0 16px' }}>
                  {granth.desc}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  भाषा: <strong>{granth.language}</strong>
                </div>
              </div>

              <div style={{ padding: '16px 20px', background: '#FAF6F0', borderTop: '1px solid #E6DDCE', display: 'flex', gap: '10px' }}>
                <Link
                  to={`/article/${granth.id}`}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '9px 12px',
                    background: 'linear-gradient(135deg, #E65100 0%, #EA580C 100%)',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 10px rgba(234,88,12,0.3)'
                  }}>
                  📖 ग्रंथ वाचा / अभ्यास
                </Link>
                <a
                  href="#download"
                  onClick={(e) => { e.preventDefault(); alert(`'${granth.title}' डिजिटल आवृत्ती लवकरच पीडीएफ स्वरूपात उपलब्ध होईल.`); }}
                  style={{
                    padding: '9px 14px',
                    background: '#FFF',
                    border: '1.5px solid #DD8A2E',
                    color: '#DD8A2E',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}>
                  📥 PDF
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
