import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SEARCH_DATABASE = [
  { id: '1', title: 'छत्रपती शिवाजी महाराज चरित्र व राज्याभिषेक', type: 'इतिहास', desc: 'हिंदवी स्वराज्य संस्थापक, युगप्रवर्तक महापुरुष, अष्टप्रधान मंडळ व आरमारी जनक.', link: '/history/shivaji-maharaj', tag: '🚩 महापुरुष' },
  { id: '2', title: 'छत्रपती संभाजी महाराज व बलिदान मास', type: 'इतिहास', desc: '१२८ लढायांमध्ये अपराजित सेनापती, बुधभूषणम् ग्रंथकार व धर्मवीर.', link: '/history/sambhaji-maharaj', tag: '🚩 महापुरुष' },
  { id: '3', title: 'किल्ले रायगड — स्वराज्याची राजधानी', type: 'किल्ले', desc: 'सह्याद्रीची राजधानी, जगदीश्वर मंदिर, होळीचा माळ, नगारखाना व छत्रपती शिवराय समाधी.', link: '/forts/raigad', tag: '🏰 राजधानी दुर्ग' },
  { id: '4', title: 'किल्ले प्रतापगड व अफझलखान वध', type: 'किल्ले', desc: 'जावळीच्या जंगलातील अभेद्य दुर्ग, भवानी माता मंदिर आणि गनिमी काव्याचा विजय.', link: '/forts/pratapgad', tag: '🏰 गिरीदुर्ग' },
  { id: '5', title: 'किल्ले शिवनेरी — छत्रपती शिवरायांचे जन्मस्थान', type: 'किल्ले', desc: 'जुन्नर येथील ऐतिहासिक दुर्ग, जिजाऊ माँसाहेब व बाल शिवाजी शिल्प, शिवाई देवी.', link: '/forts/shivneri', tag: '🏰 जन्मस्थान' },
  { id: '6', title: 'मराठा महाग्रंथालय व डिजिटल अर्काईव्ह', type: 'ग्रंथ', desc: 'सभासद बखर, शिवभारत, आज्ञापत्र व मोडीलिपी दस्तऐवजांचा संग्रह.', link: '/granthalaya', tag: '📚 साहित्य' },
  { id: '7', title: 'मराठा ज्ञानकोश (Dnyankosh)', type: 'ज्ञानकोश', desc: 'व्यक्ती, किल्ले, लढाया, घराणी आणि संज्ञा संदर्भ माहितीकोश.', link: '/dnyankosh', tag: '💡 संदर्भ' },
  { id: '8', title: 'पावनखिंड युद्ध व बाजीप्रभू देशपांडे', type: 'लढाया', desc: 'घोडखिंडीतील असीम पराक्रम, बांदल सेना व छत्रपती शिवरायांची विशाळगड सुटका.', link: '/forts/panhala-pavankhind', tag: '⚔️ रणसंग्राम' },
  { id: '9', title: 'मराठा आरमार व कान्होजी आंग्रे', type: 'आरमार', desc: 'भारतीय नौदलाचे जनक, गुराब, गलबत व अभेद्य जलदुर्ग विजयदुर्ग, सिंधुदुर्ग.', link: '/history/navy', tag: '⚓ आरमार' },
  { id: '10', title: 'बिझनेस संगम (Business Sangam)', type: 'व्यवसाय', desc: 'मराठा उद्योजक व व्यावसायिकांचे परस्पर सहकार्य, लीड्स व रेफरल नेटवर्क.', link: '/sangam', tag: '🤝 उद्योग' },
  { id: '11', title: 'महाराष्ट्र नेटवर्क व ३६ जिल्हा शाखा', type: 'नेटवर्क', desc: 'पुणे, मुंबई, सातारा, कोल्हापूर, नाशिक, संभाजीनगर व नागपूर विभागीय समन्वय.', link: '/network', tag: '🗺️ शाखा' },
  { id: '12', title: 'समाज सुरक्षा व मदत कक्ष (Community Safety)', type: 'कल्याण', desc: 'कायदेशीर सल्ला, वैद्यकीय मदत, २४x७ आपत्कालीन साहाय्य व महिला सुरक्षा.', link: '/community/safety', tag: '🛡️ मदत कक्ष' }
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('सर्व');

  const categories = ['सर्व', 'इतिहास', 'किल्ले', 'ग्रंथ', 'ज्ञानकोश', 'लढाया', 'व्यवसाय', 'नेटवर्क', 'कल्याण'];

  const filtered = SEARCH_DATABASE.filter(item => {
    const matchesCategory = selectedCategory === 'सर्व' || item.type === selectedCategory;
    const matchesQuery = query === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.tag.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Search Hero Box */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '40px 24px',
          color: '#FFFFFF',
          border: '2px solid #DD8A2E',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <span style={{
            background: 'rgba(221,138,46,0.25)',
            border: '1px solid #DD8A2E',
            color: '#F0B866',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            🔎 Connect Maratha Global Search
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            सर्वत्र शोध (Global Knowledge Search)
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto 24px' }}>
            इतिहास, गड-किल्ले, ग्रंथ, अचीव्हर्स, व्यवसाय, संस्था, चळवळी व सदस्य एकाच ठिकाणी शोधा.
          </p>

          {/* Search Input */}
          <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#888' }}>
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="उदा. शिवाजी महाराज, रायगड, ग्रंथालय, व्यवसाय संगम, पावनखिंड..."
              style={{
                width: '100%',
                padding: '16px 24px 16px 54px',
                borderRadius: '40px',
                border: '2px solid #DD8A2E',
                background: '#FFFFFF',
                fontSize: '1rem',
                color: '#2B2420',
                outline: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '18px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: selectedCategory === cat ? '#DD8A2E' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: selectedCategory === cat ? '#3D0D0D' : '#F0B866',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.92rem', color: '#5C534B', fontWeight: 600 }}>
            एकूण सापडलेले परिणाम: <strong>{filtered.length}</strong>
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: '#7A1C1C', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
              शोध साफ करा ✕
            </button>
          )}
        </div>

        {/* Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filtered.map(item => (
            <Link
              key={item.id}
              to={item.link}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '22px',
                border: '1px solid #E6DDCE',
                boxShadow: '0 4px 16px rgba(199,56,0,0.05)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: '#FDF3E6',
                  color: '#C9701C',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  {item.tag}
                </span>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#3D0D0D',
                  margin: '0 0 8px',
                  lineHeight: 1.4
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#5C534B', lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ marginTop: '16px', fontSize: '0.85rem', fontWeight: 700, color: '#C9701C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                तपशील पहा <span>→</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
