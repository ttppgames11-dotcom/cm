import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const SEARCH_DATABASE = [
  { id: '1', title: 'छत्रपती शिवाजी महाराज चरित्र व राज्याभिषेक', type: 'इतिहास', desc: 'हिंदवी स्वराज्य संस्थापक, युगप्रवर्तक महापुरुष, अष्टप्रधान मंडळ व आरमारी जनक.', link: '/history/shivaji-maharaj', tag: '🚩 महापुरुष' },
  { id: '2', title: 'छत्रपती संभाजी महाराज व बलिदान मास', type: 'इतिहास', desc: '१२८ लढायांमध्ये अपराजित सेनापती, बुधभूषणम् ग्रंथकार व धर्मवीर.', link: '/history/sambhaji-maharaj', tag: '🚩 महापुरुष' },
  { id: '3', title: 'धर्मवीर बलिदान मास स्मरण', type: 'इतिहास', desc: 'संभाजी महाराजांच्या असीम बलिदानाचे स्मरण, ३१ दिवसांचे ऐतिहासिक अध्ययन.', link: '/history/balidan-maas', tag: '🕯️ बलिदान मास' },
  { id: '4', title: 'किल्ले रायगड — स्वराज्याची राजधानी', type: 'किल्ले', desc: 'सह्याद्रीची राजधानी, जगदीश्वर मंदिर, होळीचा माळ, नगारखाना व छत्रपती शिवराय समाधी.', link: '/forts/raigad', tag: '🏰 राजधानी दुर्ग' },
  { id: '5', title: 'किल्ले प्रतापगड व अफझलखान वध', type: 'किल्ले', desc: 'जावळीच्या जंगलातील अभेद्य दुर्ग, भवानी माता मंदिर आणि गनिमी काव्याचा विजय.', link: '/forts/pratapgad', tag: '🏰 गिरीदुर्ग' },
  { id: '6', title: 'किल्ले शिवनेरी — छत्रपती शिवरायांचे जन्मस्थान', type: 'किल्ले', desc: 'जुन्नर येथील ऐतिहासिक दुर्ग, जिजाऊ माँसाहेब व बाल शिवाजी शिल्प, शिवाई देवी.', link: '/forts/shivneri', tag: '🏰 जन्मस्थान' },
  { id: '7', title: 'सह्याद्रीचे ३५०+ गड-किल्ले', type: 'किल्ले', desc: 'महाराष्ट्रातील सर्व गिरीदुर्ग, जलदुर्ग, भुईकोट व वनदुर्गांचा तपशीलवार नकाशा.', link: '/forts', tag: '🏰 गडकिल्ले' },
  { id: '8', title: 'मराठा महाग्रंथालय व डिजिटल अर्काईव्ह', type: 'ग्रंथ', desc: 'सभासद बखर, शिवभारत, आज्ञापत्र व मोडीलिपी दस्तऐवजांचा संग्रह.', link: '/granthalaya', tag: '📚 साहित्य' },
  { id: '9', title: 'मराठा ज्ञानकोश (Dnyankosh)', type: 'ज्ञानकोश', desc: 'व्यक्ती, किल्ले, लढाया, घराणी आणि संज्ञा संदर्भ माहितीकोश.', link: '/dnyankosh', tag: '💡 संदर्भ' },
  { id: '10', title: 'शिवचरित्र अखंड कथन (१५ भाग)', type: 'इतिहास', desc: 'शिवजन्मापासून ते राज्याभिषेकापर्यंतचे संपूर्ण १५ ऑडिओ व टेक्स्ट भाग.', link: '/shivcharitra', tag: '🚩 शिवचरित्र' },
  { id: '11', title: 'प्रमुख ७ ऐतिहासिक रणांगणे व व्यूहरचना', type: 'लढाया', desc: 'पावनखिंड, प्रतापगड, उंबरखिंड, पुरंदर, साल्हेर, संगमेश्वर व पानिपत.', link: '/history/battles', tag: '⚔️ रणसंग्राम' },
  { id: '12', title: 'मराठा आरमार व कान्होजी आंग्रे', type: 'आरमार', desc: 'भारतीय नौदलाचे जनक, गुराब, गलबत व अभेद्य जलदुर्ग विजयदुर्ग, सिंधुदुर्ग.', link: '/history/navy', tag: '⚓ आरमार' },
  { id: '13', title: 'बिझनेस संगम व चॅप्टर्स', type: 'व्यवसाय', desc: 'मराठा उद्योजक व व्यावसायिकांचे परस्पर सहकार्य, लीड्स व रेफरल नेटवर्क.', link: '/sangam', tag: '🤝 उद्योग' },
  { id: '14', title: 'अखिल मराठा व्यवसाय निर्देशिका', type: 'व्यवसाय', desc: 'हजारो मराठा व्यवसाय, दुकाने, कंपन्या, सेवा व उद्योग डिरेक्टरी.', link: '/business/directory', tag: '🏢 व्यवसाय' },
  { id: '15', title: 'रेफरल व व्यावसायिक देवाणघेवाण', type: 'व्यवसाय', desc: 'विश्वासू व्यवसाय संदर्भ नोंदवा, ट्रॅक करा आणि सौदे पूर्ण करा.', link: '/referrals', tag: '🔗 रेफरल' },
  { id: '16', title: 'मराठा बँक व वित्त संस्था', type: 'व्यवसाय', desc: 'मराठा पतसंस्था, को-ऑपरेटिव्ह बँका व व्यवसाय वित्तपुरवठा माहिती.', link: '/bank', tag: '🏦 वित्त' },
  { id: '17', title: 'मराठा बिल्डर्स व डेव्हलपर्स', type: 'व्यवसाय', desc: 'प्रॉपर्टी, बांधकाम, गृहप्रकल्प व प्लॉटिंग व्यावसायिक नेटवर्क.', link: '/builders', tag: '🏗️ बिल्डर्स' },
  { id: '18', title: 'रोजगार व करिअर केंद्र', type: 'करिअर', desc: 'मराठा तरुणांसाठी नोकऱ्या, भरती, करिअर मार्गदर्शन व कौशल्य प्रशिक्षण.', link: '/jobs', tag: '💼 नोकरी' },
  { id: '19', title: 'मराठा तज्ज्ञ डॉक्टर्स डिरेक्टरी', type: 'कल्याण', desc: 'महाराष्ट्रातील नामांकित मराठा डॉक्टर्स, हॉस्पिटल्स व तज्ज्ञ वैद्यकीय सल्ला.', link: '/doctors', tag: '👨‍⚕️ आरोग्य' },
  { id: '20', title: '२४×७ आपत्कालीन रक्त मदत केंद्र', type: 'कल्याण', desc: 'तातडीने रक्ताची गरज असल्यास संपूर्ण महाराष्ट्रातून रक्तदाते साहाय्य.', link: '/blood', tag: '🩸 रक्त मदत' },
  { id: '21', title: 'मराठा वधू-वर सूचक केंद्र', type: 'कल्याण', desc: 'सुशिक्षित व अनुरूप मराठा वधू-वर स्थळे शोधण्यासाठी डिजिटल व्यासपीठ.', link: '/matrimony', tag: '💍 विवाह' },
  { id: '22', title: 'महिला सक्षमीकरण व बचत गट', type: 'कल्याण', desc: 'मराठा महिला उद्योजकता, बचत गट उत्पादने व सक्षमीकरण उपक्रम.', link: '/women', tag: '🌸 महिला' },
  { id: '23', title: 'मराठा दिनदर्शिका (पंचांग व इतिहास)', type: 'संस्कृती', desc: 'शिवकालीन तिथी, ऐतिहासिक दिनविशेष, सण-उत्सव व पंचांग.', link: '/calendar', tag: '📅 दिनदर्शिका' },
  { id: '24', title: 'संपूर्ण महाराष्ट्र महाविश्व (४९ वैशिष्ट्ये)', type: 'महाविश्व', desc: 'इतिहास, किल्ले, मंदिरे, उद्योग, संस्कृती व लोकांचे परस्पर जोडलेले महाविश्व.', link: '/universe', tag: '🌌 महाविश्व' },
  { id: '25', title: '५६ पदे व संघटनात्मक चौकट मॅट्रिक्स', type: 'प्रशासन', desc: 'मध्यवर्ती कार्यकारिणीपासून ग्रामशाखेपर्यंत ५६ पदांची जबाबदारी व पात्रता.', link: '/roles-matrix', tag: '⚖️ ५६ पदे' },
  { id: '26', title: 'आमच्याबद्दल (About Connect Maratha)', type: 'संस्था', desc: 'अखिल भारतीय मराठा महासंघाची सनद, मार्गदर्शक मंडळ व उद्दिष्टे.', link: '/about', tag: '🏛️ संस्था' },
  { id: '27', title: 'व्हिजन व ध्येय (Vision & Mission)', type: 'संस्था', desc: 'मराठा समाजाच्या सर्वांगीण उत्थानासाठी निश्चित केलेले दीर्घकालीन ध्येय.', link: '/vision', tag: '🎯 व्हिजन' },
  { id: '28', title: 'सहभागी का व्हावे? (Why to Join)', type: 'संस्था', desc: 'Connect Maratha डिजिटल व्यासपीठाचे सभासद होण्याचे १० प्रमुख फायदे.', link: '/why-join', tag: '⭐ सहभाग' },
  { id: '29', title: 'डिजिटल स्मार्ट सभासद ओळखपत्र', type: 'सदस्य', desc: 'प्रत्येक अधिकृत सभासदासाठी QR कोडयुक्त डिजिटल स्मार्ट ओळखपत्र.', link: '/card', tag: '🪪 ओळखपत्र' },
  { id: '30', title: 'स्वराज्य इतिहास महाक्विझ', type: 'इतिहास', desc: 'मराठा इतिहास, किल्ले व महापुरुषांवर आधारित ऑनलाइन स्पर्धा.', link: '/quiz', tag: '🎯 क्विझ' }
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('सर्व');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const categories = ['सर्व', 'इतिहास', 'किल्ले', 'व्यवसाय', 'करिअर', 'कल्याण', 'संस्कृती', 'महाविश्व', 'प्रशासन', 'संस्था'];

  const filtered = SEARCH_DATABASE.filter(item => {
    const matchesCategory = selectedCategory === 'सर्व' || item.type === selectedCategory;
    const qLower = query.toLowerCase().trim();
    const matchesQuery = qLower === '' ||
      item.title.toLowerCase().includes(qLower) ||
      item.desc.toLowerCase().includes(qLower) ||
      item.tag.toLowerCase().includes(qLower) ||
      item.type.toLowerCase().includes(qLower);
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Search Hero Box */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '36px 24px',
          color: '#FFFFFF',
          border: '2px solid #DD8A2E',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)',
          textAlign: 'center',
          marginBottom: '28px'
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
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            सर्वत्र शोध (Global Knowledge Search)
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto 20px' }}>
            इतिहास, गड-किल्ले, ग्रंथ, अचीव्हर्स, व्यवसाय, संस्था, ५६ पदे, व्हिजन व सभासद एकाच ठिकाणी शोधा.
          </p>

          {/* Search Input */}
          <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#888' }}>
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="उदा. शिवाजी महाराज, रायगड, ५६ पदे, व्हिजन, डॉक्टर्स, व्यवसाय संगम, ग्रंथालय..."
              style={{
                width: '100%',
                padding: '15px 24px 15px 54px',
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
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#E2E8F0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '0.8rem'
                }}
              >
                ✕
              </button>
            )}
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
            एकूण सापडलेले परिणाम: <strong>{filtered.length}</strong> {selectedCategory !== 'सर्व' && `(${selectedCategory} श्रेणीमध्ये)`}
          </div>
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              style={{ background: 'none', border: 'none', color: '#7A1C1C', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
              शोध साफ करा ✕
            </button>
          )}
        </div>

        {/* Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
              <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>काहीही सापडले नाही</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 16px' }}>
                '{query}' साठी कोणतेही परिणाम जुळले नाहीत. कृपया दुसरा शब्द वापरून पहा.
              </p>
              <button
                onClick={() => { handleQueryChange(''); setSelectedCategory('सर्व'); }}
                style={{
                  background: '#F97316',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                सर्व दाखवा
              </button>
            </div>
          ) : (
            filtered.map(item => (
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
                    fontSize: '1.15rem',
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
            ))
          )}
        </div>

      </div>
    </div>
  );
}
