import React, { useState } from 'react';

const booksData = [
  {
    id: 1,
    title: 'छत्रपती शिवाजी महाराज',
    author: 'डॉ. जयसिंगराव पवार',
    category: 'छत्रपती शिवाजी महाराज',
    tag: 'शिवचरित्र',
    rating: '⭐ ४.९ (१.२K+ वाचक)',
    price: '₹३५०',
    pages: '४५० पृष्ठे',
    cover: '👑',
    desc: 'शिवरायांच्या जीवनकार्याचे ऐतिहासिक कागदपत्रांवर आधारित प्रामाणिक व प्रेरणादायी चरित्र.'
  },
  {
    id: 2,
    title: 'शिवरायांची रणनिती',
    author: 'संपादक मंडळ (इतिहास संशोधन)',
    category: 'युद्ध आणि पराक्रम',
    tag: 'रणनिती व गनिमी कावा',
    rating: '⭐ ४.८ (८५६ वाचक)',
    price: '₹२९९',
    pages: '३२० पृष्ठे',
    cover: '⚔️',
    desc: 'गनिमी कावा, आरमार उभारणी, गुप्तहेर खाते आणि किल्ले संरक्षण व्यूहरचनेचे सखोल विश्लेषण.'
  },
  {
    id: 3,
    title: 'मराठ्यांचा इतिहास',
    author: 'गो. स. सरदेसाई (रियासतकार)',
    category: 'मराठा इतिहास',
    tag: 'अखंड इतिहास',
    rating: '⭐ ५.० (२.१K+ वाचक)',
    price: '₹४५०',
    pages: '६५० पृष्ठे',
    cover: '📜',
    desc: 'मराठा साम्राज्याचा उगम, विस्तार आणि अटकेपार झेंड्याची सुवर्णगाथा मांडणारा संदर्भग्रंथ.'
  },
  {
    id: 4,
    title: 'बाजीप्रभू देशपांडे — अमर बलिदान',
    author: 'आशीष देशपांडे',
    category: 'युद्ध आणि पराक्रम',
    tag: 'अमर बलिदान',
    rating: '⭐ ४.९ (६४५ वाचक)',
    price: '₹२८०',
    pages: '२४० पृष्ठे',
    cover: '🛡️',
    desc: 'पावनखिंडीतील अद्वितीय शौर्य, स्वामीभक्ती आणि मराठ्यांच्या अद्वितीय बलिदानाची चित्तथरारक कथा.'
  },
  {
    id: 5,
    title: 'सह्याद्रीची गड-किल्ले',
    author: 'दुर्गमित्र अभ्यास मंडळ',
    category: 'संस्कृती आणि वारसा',
    tag: 'गड-किल्ले मार्गदर्शक',
    rating: '⭐ ४.८ (६४३ वाचक)',
    price: '₹३२०',
    pages: '३८० पृष्ठे',
    cover: '🏰',
    desc: 'महाराष्ट्रातील ३५०+ किल्ल्यांचे नकाशे, वाटा, पाण्याचे टाके आणि ट्रेकिंग मार्गदर्शिका.'
  },
  {
    id: 6,
    title: 'संभाजी महाराज — एक वादळ',
    author: 'श्री. नि. मराठे',
    category: 'चरित्र ग्रंथ',
    tag: 'शंभूराजे चरित्र',
    rating: '⭐ ४.९ (१.१K+ वाचक)',
    price: '₹३८०',
    pages: '४१० पृष्ठे',
    cover: '🔥',
    desc: 'धर्मवीर छत्रपती संभाजी महाराजांचे अजोड युद्धकौशल्य, साहित्यनिर्मिती आणि स्वाभिमानाचा लढा.'
  },
  {
    id: 7,
    title: 'मराठा संस्कृती आणि वारसा',
    author: 'डॉ. माधवी देशपांडे',
    category: 'संस्कृती आणि वारसा',
    tag: 'संस्कृती व इतिहास',
    rating: '⭐ ४.७ (७६२ वाचक)',
    price: '₹३००',
    pages: '२९० पृष्ठे',
    cover: '🪔',
    desc: 'सण, उत्सव, पारंपारिक शस्त्रे, मराठा कला आणि लोकजीवनाचा समृद्ध सांस्कृतिक अभ्यास.'
  },
  {
    id: 8,
    title: 'प्रेरणादायी मराठा विचार',
    author: 'संपादक मंडळ',
    category: 'प्रेरणादायी',
    tag: 'स्मरणे व विचार',
    rating: '⭐ ४.८ (१.०K+ वाचक)',
    price: '₹२५०',
    pages: '२१० पृष्ठे',
    cover: '💡',
    desc: 'तरुणांना स्वावलंबी, चारित्र्यसंपन्न आणि संघटित बनवणारे शिवसंस्कार व विचारधन.'
  }
];

const authorsData = [
  { name: 'डॉ. जयंत नारळीकर', type: 'वैज्ञानिक लेखक', city: 'पुणे, महाराष्ट्र' },
  { name: 'वि. स. खांडेकर', type: 'कादंबरीकार (ज्ञानपीठ विजेते)', city: 'कोल्हापूर/पुणे' },
  { name: 'रणजीत देसाई', type: 'इतिहास कादंबरीकार (स्वामी, श्रीमान योगी)', city: 'कोल्हापूर' },
  { name: 'शांता शेळके', type: 'कवयित्री, गीतकार व लेखिका', city: 'पुणे, महाराष्ट्र' },
  { name: 'सचिन कुंभार', type: 'कथाकार व कादंबरीकार', city: 'कोल्हापूर, महाराष्ट्र' },
  { name: 'मेघना पेठे', type: 'कादंबरीकार व समीक्षक', city: 'नागपूर, महाराष्ट्र' },
  { name: 'मिलिंद बोकील', type: 'विचारवंत व लेखक (शाळा)', city: 'मुंबई, महाराष्ट्र' },
  { name: 'दत्तात्रय भोके', type: 'इतिहास लेखक व संशोधक', city: 'सातारा, महाराष्ट्र' }
];

const categories = [
  'सर्व पुस्तके',
  'छत्रपती शिवाजी महाराज',
  'मराठा इतिहास',
  'चरित्र ग्रंथ',
  'युद्ध आणि पराक्रम',
  'संस्कृती आणि वारसा',
  'प्रेरणादायी',
  'कथा / कादंबरी'
];

export default function BooksLiteraturePage() {
  const [selectedCat, setSelectedCat] = useState('सर्व पुस्तके');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [buyModal, setBuyModal] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const filtered = booksData.filter((b) => {
    const matchCat = selectedCat === 'सर्व पुस्तके' || b.category === selectedCat;
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="books-literature-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(78, 52, 46, 0.90) 0%, rgba(109, 76, 65, 0.88) 100%), url("/assets/images/generated/maratha_books_hero.jpg") center/cover no-repeat',
        color: '#FFFFFF',
        padding: '50px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.18)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#FFD54F'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.2rem', color: '#FFE082', fontWeight: 600, margin: '0 0 6px' }}>
            वाचा मराठ्यांचा अभिमान, जपा इतिहास, घडवा भविष्य !
          </p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा पुस्तक संग्रह & साहित्य दालन
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '680px' }}>
            इतिहास, चरित्र, प्रेरणादायी आणि संशोधन ग्रंथांचे अमोल दालन — वाचा... समजा... अभिमानाने जगा !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="#books-grid"
              style={{
                background: '#FFD54F',
                color: '#4E342E',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none'
              }}
            >
              सर्व पुस्तके पहा ({booksData.length}+)
            </a>
            <a
              href="#authors-section"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              मराठी साहित्यिक ({authorsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '18px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid #EADBCE',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <strong style={{ color: '#6D4C41', display: 'block', fontSize: '1rem' }}>📖 अस्सल ऐतिहासिक ग्रंथ</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>विश्वसनीय प्रकाशकांची मूळ पुस्तके</span>
          </div>
          <div>
            <strong style={{ color: '#6D4C41', display: 'block', fontSize: '1rem' }}>🚚 वेगवान होम डिलिव्हरी</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>संपूर्ण महाराष्ट्रात सुरक्षित वितरण</span>
          </div>
          <div>
            <strong style={{ color: '#6D4C41', display: 'block', fontSize: '1rem' }}>🏷️ विशेष सदस्य सवलत</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>Connect Maratha सदस्यांना १५% सूट</span>
          </div>
          <div>
            <strong style={{ color: '#6D4C41', display: 'block', fontSize: '1rem' }}>📱 ई-बुक (E-Book) उपलब्ध</strong>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>मोबाईलवर वाचा कधीही, कुठेही</span>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div id="books-grid" style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
          border: '1px solid #EADBCE',
          marginBottom: '28px'
        }}>
          <input
            type="text"
            placeholder="पुस्तकाचे नाव, लेखक किंवा प्रकार शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1.5px solid #D7CCC8',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '14px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '2px solid #6D4C41' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#6D4C41' : '#FFFFFF',
                  color: selectedCat === cat ? '#FFFFFF' : '#424242',
                  fontSize: '0.88rem',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
          {filtered.map((book) => (
            <div
              key={book.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8DFD8',
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)',
                padding: '36px 20px',
                textAlign: 'center',
                borderBottom: '1px solid #BCAAA4',
                position: 'relative'
              }}>
                <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '8px' }}>{book.cover}</span>
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#6D4C41',
                  color: '#fff',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}>
                  {book.tag}
                </span>
              </div>

              <div style={{ padding: '18px 18px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3E2723', margin: 0 }}>
                  {book.title}
                </h3>
                <div style={{ color: '#8D6E63', fontSize: '0.88rem', fontWeight: 700 }}>
                  ✍️ {book.author}
                </div>
                <div style={{ color: '#F57F17', fontSize: '0.82rem', fontWeight: 700, margin: '2px 0' }}>
                  {book.rating}
                </div>
                <p style={{ fontSize: '0.84rem', color: '#666', lineHeight: 1.5, margin: '4px 0 0' }}>
                  {book.desc}
                </p>
              </div>

              <div style={{ padding: '14px 18px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B71C1C' }}>
                  {book.price}
                </div>
                <button
                  onClick={() => { setSelectedBook(book); setBuyModal(true); }}
                  style={{
                    background: '#6D4C41',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  पुस्तकाची मागणी करा
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authors Section */}
      <section id="authors-section" style={{ maxWidth: '1180px', margin: '50px auto 0', padding: '0 16px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', border: '1px solid #EADBCE' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '2.5rem' }}>✒️</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4E342E', margin: '8px 0 4px' }}>
              मराठा लेखक – साहित्याचे प्रेरणास्थान
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#795548' }}>
              शब्दांच्या शक्तीने समाजजागृती करणारे मराठी साहित्याचे शिल्पकार
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {authorsData.map((author, idx) => (
              <div key={idx} style={{
                background: '#FAF7F2',
                borderRadius: '10px',
                padding: '16px',
                borderLeft: '4px solid #6D4C41'
              }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#3E2723' }}>
                  {author.name}
                </h4>
                <div style={{ color: '#B71C1C', fontSize: '0.84rem', fontWeight: 700 }}>
                  {author.type}
                </div>
                <div style={{ color: '#795548', fontSize: '0.8rem', marginTop: '4px' }}>
                  📍 {author.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal: Buy / Order Book */}
      {buyModal && selectedBook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setBuyModal(false); setOrderDone(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h3 style={{ color: '#6D4C41', margin: '0 0 6px', fontSize: '1.3rem' }}>
              📖 {selectedBook.title}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '16px' }}>
              लेखक: {selectedBook.author} • किंमत: <strong style={{ color: '#B71C1C' }}>{selectedBook.price}</strong>
            </p>

            {orderDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '3rem' }}>📦</span>
                <h4 style={{ color: '#2E7D32', margin: '10px 0' }}>ऑर्डर यशस्वीरित्या नोंदवली गेली!</h4>
                <p style={{ fontSize: '0.88rem', color: '#555' }}>आपल्या पत्त्यावर ३ ते ५ दिवसांत वितरण होईल. कॅश ऑन डिलिव्हरी उपलब्ध.</p>
                <button
                  onClick={() => { setBuyModal(false); setOrderDone(false); }}
                  style={{ background: '#6D4C41', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setOrderDone(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="आपले पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <textarea required placeholder="वितरणाचा संपूर्ण पत्ता व पिनकोड *" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                    <option>पेमेंट पद्धत: कॅश ऑन डिलिव्हरी (COD)</option>
                    <option>पेमेंट पद्धत: UPI / QR कोड द्वारे</option>
                  </select>
                  <button type="submit" style={{ background: '#6D4C41', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    ऑर्डर निश्चित करा ({selectedBook.price})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
