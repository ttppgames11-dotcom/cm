import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const historicalFigures = [
  {
    id: 'shivaji',
    name: 'छत्रपती शिवाजी महाराज',
    category: 'chhatrapati',
    badge: 'हिंदवी स्वराज्य संस्थापक',
    desc: 'रयतेचे राजे, भारतीय आरमाराचे जनक, ३५०+ गड-किल्ले व अष्टप्रधान मंडळ रचनाकार.',
    link: '/history/shivaji-maharaj',
    image: 'https://wallpapercave.com/wp/wp4518353.jpg'
  },
  {
    id: 'sambhaji',
    name: 'छत्रपती संभाजी महाराज',
    category: 'chhatrapati',
    badge: 'अपराजित १२८ लढाया',
    desc: '१२८ लढायांमध्ये अजिंक्य, बुधभूषणम् संस्कृत ग्रंथकार व धर्मरक्षणासाठी सर्वोच्च बलिदान.',
    link: '/history/sambhaji-maharaj',
    image: 'assets/images/real-sambhaji-portrait.png'
  },
  {
    id: 'jijau',
    name: 'राष्ट्रमाता राजमाता जिजाऊ',
    category: 'virangana',
    badge: 'स्वराज्य प्रेरिका व मार्गदर्शक',
    desc: 'शिवरायांना घडवणाऱ्या, रयतेचा न्यायनिवाडा करणाऱ्या आणि स्वराज्याची संकल्पना रुजवणारे मातृत्व.',
    link: '/history/rajmata-jijau',
    image: 'assets/images/real-jijau-portrait.jpg'
  },
  {
    id: 'bajirao',
    name: 'श्रीमंत थोरले बाजीराव पेशवा',
    category: 'peshwa',
    badge: '४१ लढाया, ० पराभव',
    desc: 'पालखेड, भोपाळ, दिल्ली छापा आणि माळवा-बुंदेलखंड विजय; शनिवार वाड्याचे निर्माते.',
    link: '/history/bajirao-peshwa',
    image: 'assets/images/real-bajirao-statue.jpg'
  },
  {
    id: 'mahadji',
    name: 'महादजी शिंदे (द ग्रेट मराठा)',
    category: 'yodha',
    badge: 'दौलतीचे खांब · वकील-ए-मुतालिक',
    desc: 'पानिपतानंतर दिल्लीवर पुन्हा भगवा फडकवणारे, आधुनिक १ लाख कवायती सैन्याचे जनक व इंग्रजांना वडगावात नमवणारे युगपुरुष.',
    link: '/history/mahadji-shinde',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mahadji_Scindia_in_Darbar.jpg/1280px-Mahadji_Scindia_in_Darbar.jpg'
  },
  {
    id: 'tarabai',
    name: 'महाराणी ताराबाई भोसले',
    category: 'virangana',
    badge: 'मोगल साम्राज्य धडक',
    desc: 'औरंगजेबाच्या मृत्यूपर्यंत मराठा स्वातंत्र्ययुद्ध चालवून मोगल फौजांना महाराष्ट्राच्या मातीत गाडणाऱ्या रणरागिणी.',
    link: '/history/tarabai',
    image: 'assets/images/real-tarabai-portrait.jpg'
  },
  {
    id: 'tanaji',
    name: 'सुभेदार तानाजी मालुसरे',
    category: 'yodha',
    badge: 'सिंहगडाचा सिंह',
    desc: 'कोंढाणा पुनर्जय मोहीम — "आधी लगीन कोंढाण्याचं, मग माझ्या रायबाचं!" अमर बाणा.',
    link: '/article/tanaji-malusare',
    image: 'assets/images/real-sinhagad-fort.jpg'
  },
  {
    id: 'bajiprabhu',
    name: 'वीर बाजी प्रभू देशपांडे',
    category: 'yodha',
    badge: 'पावनखिंड संग्राम',
    desc: 'घोडखिंडीतील अभेद्य ढाल — तोफांचे तीन आवाज होईपर्यंत सिद्धी मसूदच्या अफाट सेनेला रोखून धरले.',
    link: '/article/shiva-kashid-baji-prabhu',
    image: 'assets/images/real-panhala-fort.jpg'
  },
  {
    id: 'shahu',
    name: 'छत्रपती शाहू महाराज (थोरले)',
    category: 'chhatrapati',
    badge: 'साम्राज्य विस्तार पर्व',
    desc: 'मराठा सत्तेचा संपूर्ण हिंदुस्थानभर विस्तार करणारे मुत्सद्दी छत्रपती.',
    link: '/history/shahu-maharaj',
    image: 'assets/images/real-maratha-expansion-map.jpg'
  },
  {
    id: 'hambirrao',
    name: 'सरसेनापती हंबीरराव मोहिते',
    category: 'yodha',
    badge: 'बहादूरगड विजय व सरसेनापती',
    desc: 'बहादूरगडावर २०० घोडदळाची गनिमी काव्याची खेळी करून १ कोटींचा मुघल खजिना व २०० अरबी घोडे स्वराज्यात आणणारे शूर सेनापती.',
    link: '/article/hambirrao-mohite-bahadurgad',
    image: '/assets/images/warriors/hambirrao.jpg'
  },
  {
    id: 'shivakashid',
    name: 'वीर शिवा काशिद (नाभिक)',
    category: 'yodha',
    badge: 'प्रतिशिवाजी बलिदान',
    desc: 'पन्हाळगडाच्या वेढ्यात शिवरायांची राजवस्त्रे चढवून सिद्दी जोहरच्या छावणीत हसतमुखाने बलिदान देणारे अमर निष्ठावंत वीर.',
    link: '/article/shiva-kashid-baji-prabhu',
    image: '/assets/images/warriors/shivakashid.jpg'
  },
];

const timelineEvents = [
  { year: '१९ फेब्रुवारी १६३०', event: 'छत्रपती शिवाजी महाराजांचा किल्ले शिवनेरीवर जन्म' },
  { year: '१६४६', event: 'वयाच्या १६ व्या वर्षी तोरणा किल्ला जिंकून हिंदवी स्वराज्याची तोरणे बांधली' },
  { year: '१० नोव्हेंबर १६५९', event: 'प्रतापगड युद्ध — अफझलखानाचा वध व विजापूर सैन्याचा पराभव' },
  { year: '१३ जुलै १६६०', event: 'पावनखिंड युद्ध — बाजी प्रभू देशपांडे व बांदल मावळ्यांचे शौर्य' },
  { year: '३ ऑक्टोबर १६७०', event: 'सुरत स्वारी व कांचनबारी विजय — प्रत्यक्ष लक्ष्मीपूजनाच्या दिवशी स्वराज्याचा खजिना संचय' },
  { year: '६ मार्च १६७३', event: 'पन्हाळगड विजय — वीर कोंडाजी फर्जंद व ६० मावळ्यांचा सवाद्य रणसंग्राम' },
  { year: '६ जून १६७४', event: 'दुर्गराज रायगडावर ऐतिहासिक वैदिक शिवराज्याभिषेक सोहळा' },
  { year: '१६८१–१६८९', event: 'छत्रपती संभाजी महाराजांचे पराक्रमी राज्य व मोगलांविरुद्ध अखंड संघर्ष' },
  { year: '१७२८', event: 'पालखेडची लढाई — बाजीराव पेशव्यांची जागतिक युद्धशास्त्रातील आदर्श रणनीती' },
  { year: '१० फेब्रुवारी १७७२', event: 'महादजी शिंदे यांच्या नेतृत्वाखाली दिल्लीवर पुन्हा मराठ्यांचा भगवा झेंडा फडकला' },
  { year: 'जानेवारी १७७९', event: 'वडगावची लढाई — महादजी शिंदे यांनी इंग्रजांना नमवून शरणागती पत्करायला लावली' },
  { year: '१७५८', event: 'अटकेपार मराठा ध्वज — रघुनाथराव पेशवे व तुकोजी होळकरांचा पंजाब व लाहोर विजय' },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');

  const filteredFigures = filter === 'all'
    ? historicalFigures
    : historicalFigures.filter(f => f.category === filter);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* War Cry Strip */}
      <div className="war-cry-strip">
        <span className="flame-icon">🔥</span>
        <span>|| गर्जा महाराष्ट्र माझा! सह्याद्रीच्या काळजातून उमटलेली अखंड स्वाभिमानाची अमर गाथा! ||</span>
        <span className="flame-icon">🔥</span>
      </div>

      {/* Hero Section */}
      <div className="hero" style={{ minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-samrajya.jpg"
          alt="मराठा साम्राज्य"
          className="hero-bg-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        <div className="hero-overlay" style={{ background: 'radial-gradient(circle at 75% 35%, rgba(230,81,0,0.55), rgba(12,2,4,0.92) 80%)' }}></div>

        <div className="wrap hero-content" style={{ maxWidth: '1320px', width: '100%', padding: '50px 24px', position: 'relative', zIndex: 2 }}>
          <div className="hero-website-grid">
            <div>
              <div className="eyebrow">अखंड शौर्याची गौरवगाथा · १६३० ते १८१८</div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', lineHeight: 1.12, color: '#FFFFFF', margin: '12px 0' }}>
                मराठा इतिहास महाग्रंथालय
              </h1>
              <div className="rule" style={{ background: 'var(--gold-500)', height: '4px', width: '80px', margin: '12px 0' }}></div>
              <p className="tagline" style={{ fontSize: '1.1rem', maxWidth: '54ch', color: '#FFF8F2', lineHeight: 1.6 }}>
                स्वराज्य, संस्कृती, युद्धनीती आणि अद्वितीय सुशासन — अस्सल ऐतिहासिक साधनांवर आधारित मराठा साम्राज्याचा देदीप्यमान इतिहास.
              </p>

              <div className="stats-glass" style={{ marginTop: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="stat-glass"><b>१८८</b><span>वर्षांचे देदीप्यमान साम्राज्य</span></div>
                <div className="stat-glass"><b>३५०+</b><span>अभ्यासित गड-किल्ले</span></div>
                <div className="stat-glass"><b>१००+</b><span>निर्णायक लढाया</span></div>
                <div className="stat-glass"><b>अटकेपार</b><span>विस्तारित भगवा ध्वज</span></div>
              </div>
            </div>

            <div className="hero-real-card" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '24px' }}>
                <span className="card-badge" style={{ background: '#C73800', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  🚩 हिंदवी स्वराज्य
                </span>
                <h4 style={{ color: '#FFFFFF', margin: '14px 0 8px', fontSize: '1.25rem', fontFamily: 'Baloo 2' }}>
                  छत्रपती शिवाजी महाराज — अखंड स्वराज्य
                </h4>
                <p style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  ६ जून १६७४ रोजी दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला ऐतिहासिक वैदिक राज्याभिषेक व स्वतंत्र सार्वभौम मराठा साम्राज्याची स्थापना.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <Link to="/history/shivaji-maharaj" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    सविस्तर शिवचरित्र वाचा →
                  </Link>
                  <Link to="/forts" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF', padding: '8px 16px', fontSize: '0.85rem' }}>
                    ३५०+ गड-किल्ले नकाशा 🏰
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1320px', padding: '40px 24px' }}>
        
        {/* Sacred Shivrajmudra */}
        <section style={{ marginBottom: '40px' }}>
          <div className="rajmudra-container" style={{
            background: 'linear-gradient(135deg, #FFF8F2, #FFF3E8)',
            border: '2px solid var(--gold-500)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="rajmudra-verse" style={{
              fontFamily: 'Baloo 2',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--maroon-950)',
              lineHeight: 1.6,
              marginBottom: '12px'
            }}>
              " प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता ।<br/>
              शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ "
            </div>
            <div className="rajmudra-meaning" style={{
              fontSize: '1.05rem',
              color: 'var(--saffron-700)',
              fontWeight: 600,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा लोककल्याणासाठी तळपते आहे!
            </div>
          </div>
        </section>

        
        {/* Special History Feature Banner - History Boring Watat Asel Tar */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--maroon-950) 0%, #3e0b12 60%, var(--saffron-900) 100%)',
            borderRadius: '16px',
            padding: '36px',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--gold-500)'
          }}>
            <div style={{ maxWidth: '850px' }}>
              <span style={{ background: 'var(--gold-500)', color: '#000', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                विशेष पॉडकास्ट चिंतन · मोहन शेटे सर
              </span>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)', color: 'var(--gold-200)', margin: '14px 0 10px' }}>
                इतिहास Boring वाटत असेल तर? — भविष्य गगनी भरारी घेण्या भूतकाळाचे भान हवे!
              </h2>
              <p style={{ color: '#FFEBD6', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }}>
                सिंहगडावर रात्री १२ वाजता कड्यावर इतिहास, दिवाळीतील किल्ले संस्कृतीतील तंत्रज्ञान, पुण्याचा हेरिटेज वॉक, आणि शाळांमधील कल्पक उपक्रम — २८ वर्षे मुलांना इतिहास जगवणाऱ्या मोहन शेटे सरांचे डोळे उघडणारे विचार.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/history/history-boring" className="btn btn-gold" style={{ padding: '10px 24px', fontWeight: 800, fontSize: '0.95rem' }}>
                  🎙️ संपूर्ण पॉडकास्ट संवाद वाचा →
                </Link>
                <Link to="/history/shivaji-yudhniti" className="btn btn-outline" style={{ padding: '10px 24px', color: '#FFFFFF', borderColor: 'var(--gold-400)', fontWeight: 700, fontSize: '0.95rem' }}>
                  ⚔️ शिवरायांची युद्धनीती व गनिमी कावा →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {[
              { id: 'all', label: 'सर्व युगपुरुष व नेते' },
              { id: 'chhatrapati', label: '👑 छत्रपती घराणे' },
              { id: 'peshwa', label: '🐎 पेशवे व सेनापती' },
              { id: 'virangana', label: '🛡️ वीरांगना' },
              { id: 'yodha', label: '⚔️ अमर शिलेदार' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`tab ${filter === tab.id ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: '1px solid var(--line)',
                  background: filter === tab.id ? 'var(--maroon-900)' : '#FFFFFF',
                  color: filter === tab.id ? '#FFFFFF' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-3" style={{ marginTop: '30px', gap: '24px' }}>
            {filteredFigures.map(fig => (
              <Link
                key={fig.id}
                to={fig.link}
                className="hd-feature-card"
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: 'var(--maroon-950)' }}>
                  <img
                    src={fig.image}
                    alt={fig.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'assets/images/real-raigad-panoramic.jpg'; }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'var(--maroon-900)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}>
                    {fig.badge}
                  </span>
                </div>
                <div style={{ padding: '20px' }}>
                  <strong style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', color: 'var(--maroon-950)', display: 'block', marginBottom: '8px' }}>
                    {fig.name}
                  </strong>
                  <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {fig.desc}
                  </div>
                  <div style={{ marginTop: '14px', color: 'var(--saffron-700)', fontWeight: 700, fontSize: '0.85rem' }}>
                    सविस्तर चरित्र वाचा →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

                {/* Shivcharitra Kathan 10 Episodes Grand Showcase */}
        <section style={{ marginTop: '50px', marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2A0709 0%, #4A0E17 50%, #5C1414 100%)',
            borderRadius: '20px',
            padding: '36px 30px',
            color: '#FFFFFF',
            border: '2px solid #DD8A2E',
            boxShadow: '0 12px 36px rgba(61,13,13,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(221,138,46,0.35)', paddingBottom: '18px' }}>
              <div>
                <span style={{
                  background: '#DD8A2E',
                  color: '#2A0709',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  🚩 विशेष ऐतिहासिक महागाथा · पुरंदरे प्रकाशन
                </span>
                <h2 style={{ fontFamily: 'Baloo 2', fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', color: '#FDE047', margin: '10px 0 4px' }}>
                  शिवशाहीर बाबासाहेब पुरंदरे — शिवचरित्र कथन (भाग १ ते १० अखंड व्याख्यानमाला)
                </h2>
                <p style={{ color: '#E6DDCE', fontSize: '0.96rem', margin: 0, maxWidth: '780px' }}>
                  इतिहासमहर्षी पद्मविभूषण शिवशाहीर बाबासाहेब पुरंदरे यांच्या ओजस्वी अमृतवाणीतून उलगडलेली शिवचरित्राची सुवर्णगाथा — यादवांच्या अस्तापासून, शिवजन्म, अफजलखान वध, पावनखिंड ते लाल महालावरील सर्जिकल स्ट्राईक!
                </p>
              </div>
              <Link
                to="/shivcharitra"
                style={{
                  background: 'linear-gradient(135deg, #DD8A2E, #E65100)',
                  color: '#FFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(230,81,0,0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                🚩 सर्व १५ भाग एकाच पानावर वाचा →
              </Link>
            </div>

            {/* 15 Episodes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
              {[
                { n: 1, title: 'भाग १: यादवांचा अस्त ते भातवडी संग्राम', time: '१२९४ ते १६२४', link: '/shivcharitra#bhag-1' },
                { n: 2, title: 'भाग २: जिजाऊ स्वराज्य प्रेरणा व शिवजन्म', time: '१९ फेब्रुवारी १६३०', link: '/shivcharitra#bhag-2' },
                { n: 3, title: 'भाग ३: रोहिडेश्वराची शपथ ते तोरणा विजय', time: '१६४५ ते १६५०', link: '/shivcharitra#bhag-3' },
                { n: 4, title: 'भाग ४: पुरंदर संग्राम व शहाजीराजे सुटका', time: '१६४८ ते १६५५', link: '/shivcharitra#bhag-4' },
                { n: 5, title: 'भाग ५: जावळी, प्रतापगड व खानाचा विडा', time: '१६५६ ते १६५९', link: '/shivcharitra#bhag-5' },
                { n: 6, title: 'भाग ६: तुळजापूर, वाई ते कान्होजी जेधे', time: 'मे-ऑक्टो १६५९', link: '/shivcharitra#bhag-6' },
                { n: 7, title: 'भाग ७: प्रतापगड युद्ध — अफजलखान वध', time: '१० नोव्हेंबर १६५९', link: '/shivcharitra#bhag-7' },
                { n: 8, title: 'भाग ८: पन्हाळा वेढा व पावनखिंड झुंज', time: '१२-१३ जुलै १६६०', link: '/shivcharitra#bhag-8' },
                { n: 9, title: 'भाग ९: चाकण वेढा, फिरंगोजी व जखमनामा', time: 'मे १६६० - जाने १६६१', link: '/shivcharitra#bhag-9' },
                { n: 10, title: 'भाग १०: उंबरखिंड ते लाल महाल छापा', time: 'जाने १६६१ - एप्रिल १६६३', link: '/shivcharitra#bhag-10' },
                { n: 11, title: 'भाग ११: सुरत स्वारी व सिंधुदुर्ग जलदुर्ग', time: '१६६४ ते १६६५', link: '/shivcharitra#bhag-11' },
                { n: 12, title: 'भाग १२: पुरंदर संग्राम, मुरारबाजी व तह', time: 'जाने-सप्टें १६६५', link: '/shivcharitra#bhag-12' },
                { n: 13, title: 'भाग १३: आग्रा दरबार व नजरकैदेतून सुटका', time: 'जाने-ऑगस्ट १६६६', link: '/shivcharitra#bhag-13' },
                { n: 14, title: 'भाग १४: तानाजींचे बलिदान व सिंहगड विजय', time: '१६६६ ते १६७३', link: '/shivcharitra#bhag-14' },
                { n: 15, title: 'भाग १५: ६ जून १६७४: शिवराज्याभिषेक सोहळा', time: '१६७३ ते १६७४', link: '/shivcharitra#bhag-15' }
              ].map(ep => (
                <Link
                  key={ep.n}
                  to={ep.link}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(221,138,46,0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ background: '#DD8A2E', color: '#2A0709', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                        भाग {ep.n}
                      </span>
                      <span style={{ color: '#E6DDCE', fontSize: '0.75rem' }}>{ep.time}</span>
                    </div>
                    <h4 style={{ fontFamily: 'Baloo 2', color: '#FFFFFF', fontSize: '1.05rem', margin: '4px 0 8px', lineHeight: 1.35 }}>
                      {ep.title}
                    </h4>
                  </div>
                  <div style={{ color: '#FDE047', fontSize: '0.82rem', fontWeight: 700, marginTop: '8px' }}>
                    व्याख्यान वाचा →
                  </div>
                </Link>
              ))}
            </div>

            {/* 3 Featured Character Cards */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(221,138,46,0.3)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <Link
                to="/article/shiva-kashid-baji-prabhu"
                style={{
                  background: 'rgba(221,138,46,0.12)',
                  border: '1px solid #DD8A2E',
                  borderRadius: '10px',
                  padding: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>🗡️</span>
                <div>
                  <strong style={{ color: '#FDE047', fontSize: '0.95rem', display: 'block' }}>शिवा काशिद व बाजीप्रभू देशपांडे</strong>
                  <span style={{ color: '#E6DDCE', fontSize: '0.8rem' }}>पन्हाळा ते पावनखिंड अखंड रणसंग्राम सविस्तर वाचा →</span>
                </div>
              </Link>

              <Link
                to="/article/hambirrao-mohite-bahadurgad"
                style={{
                  background: 'rgba(221,138,46,0.12)',
                  border: '1px solid #DD8A2E',
                  borderRadius: '10px',
                  padding: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>🏇</span>
                <div>
                  <strong style={{ color: '#FDE047', fontSize: '0.95rem', display: 'block' }}>सरसेनापती हंबीरराव मोहिते</strong>
                  <span style={{ color: '#E6DDCE', fontSize: '0.8rem' }}>बहादूरगडावरील १ कोटींची गनिमी काव्याची लूट वाचा →</span>
                </div>
              </Link>

              <Link
                to="/article/babasaheb-purandare-shivrajyabhishek-mahasohala"
                style={{
                  background: 'rgba(221,138,46,0.12)',
                  border: '1px solid #DD8A2E',
                  borderRadius: '10px',
                  padding: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>👑</span>
                <div>
                  <strong style={{ color: '#FDE047', fontSize: '0.95rem', display: 'block' }}>शिवराज्याभिषेक महासोहळा</strong>
                  <span style={{ color: '#E6DDCE', fontSize: '0.8rem' }}>३२ मणांचे सुवर्णसिंहासन व स्वातंत्र्याची गाथा वाचा →</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

{/* Timeline of Empire */}
        <section style={{ marginTop: '50px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: 'var(--saffron-700)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              CHRONOLOGY OF GLORY
            </span>
            <h2 style={{ fontFamily: 'Baloo 2', fontSize: '2rem', color: 'var(--maroon-950)', margin: '6px 0' }}>
              मराठा साम्राज्याचा सुवर्ण कालपट (१६३०–१८१८)
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {timelineEvents.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    background: idx % 2 === 0 ? 'var(--paper-2)' : '#FFFFFF',
                    borderLeft: '4px solid var(--saffron-500)'
                  }}
                >
                  <div style={{ width: '180px', flexShrink: 0, fontWeight: 800, color: 'var(--maroon-900)', fontFamily: 'Baloo 2', fontSize: '1.05rem' }}>
                    {t.year}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
                    {t.event}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
