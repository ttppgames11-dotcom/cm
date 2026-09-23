import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BATTLES_LIST = [
  {
    id: 'pavankhind',
    era: 'shivaji',
    date: '१३ जुलै १६६०',
    location: 'पावनखिंड / विशाळगड',
    title: 'पावनखिंडीची ऐतिहासिक लढाई',
    desc: 'पन्हाळगडाच्या वेढ्यातून छत्रपती शिवाजी महाराजांची विशाळगडाकडे कूच. बाजीप्रभू देशपांडे, फुलाजी प्रभू व ३०० बांदल मावळ्यांनी सिद्धी मसूदच्या ४,००० फौजेला खिंडीत तोफांचे आवाज येईपर्यंत थोपवून धरले.',
    commander: 'बाजीप्रभू देशपांडे, फुलाजी प्रभू विरुद्ध सिद्धी मसूद',
    importance: 'महाराजांचे प्राणरक्षण व स्वराज्याची अखंडता',
    reference: 'सभासद बखर, जेधे शकावली',
    link: '/forts/panhala-pavankhind',
    linkText: 'सविस्तर माहिती पहा →'
  },
  {
    id: 'purandar',
    era: 'shivaji',
    date: 'एप्रिल - जून १६६५',
    location: 'पुरंदर किल्ला',
    title: 'पुरंदरचा संग्राम व वेढा',
    desc: 'मिर्झाराजे जयसिंह व दिलेरखानाने पुरंदरला प्रचंड वेढा घातला. किल्लेदार मुरारबाजी देशपांडे यांनी मूठभर मावळ्यांसह वज्रगडावरून दिलेरखानाच्या फौजेवर केलेला अद्वितीय प्रतिहल्ला.',
    commander: 'मुरारबाजी देशपांडे विरुद्ध दिलेरखान',
    importance: 'पुरंदरच्या तहाची पार्श्वभूमी व मुत्सद्दीपणा',
    reference: 'हफ्त अंजुमन, आलमगीरनामा',
    link: '/history/warriors',
    linkText: 'मुरारबाजी चरित्र पहा →'
  },
  {
    id: 'sinhagad',
    era: 'shivaji',
    date: '४ फेब्रुवारी १६७०',
    location: 'सिंहगड (कोंढाणा)',
    title: 'सिंहगडची रात्रीची चढाई',
    desc: "सुभेदार तानाजी मालुसरे यांनी घोरपडीच्या साहाय्याने द्रोणागिरी कडा चढून कोंढाण्यावर केलेला हल्ला. उदयभानू राठोडशी तुंबळ युद्ध; 'गड आला पण सिंह गेला' हा अमर उद्गार.",
    commander: 'तानाजी मालुसरे, सूर्याजी मालुसरे विरुद्ध उदयभानू',
    importance: 'मुघलांकडून किल्ले परत मिळवण्याची मोहीम',
    reference: 'सभासद बखर, पोवाडे',
    link: '/history/warriors',
    linkText: 'तानाजी मालुसरे चरित्र →'
  },
  {
    id: 'palkhed',
    era: 'peshwa',
    date: '२८ फेब्रुवारी १७२८',
    location: 'पालखेड, नाशिक',
    title: 'पालखेडची ऐतिहासिक लढाई',
    desc: 'थोरले बाजीराव पेशव्यांची लष्करी रणनीतीची सर्वोत्तम किमया. तोफांचा वापर न करता केवळ वेगवान हालचालींनी निजामाला पाणी नसलेल्या पालखेडच्या मैदानात कोंडले व मुंगी-पैठणचा तह करण्यास भाग पाडले.',
    commander: 'बाजीराव पेशवे I विरुद्ध निजाम-उल-मुल्क',
    importance: 'छत्रपती शाहू महाराजांचे मराठा साम्राज्यावरील अधिपत्य सिद्ध',
    reference: 'पेशवे दप्तर खंड २२, फील्ड मार्शल मॉन्टगोमरी विश्लेषण',
    link: '/history/bajirao-peshwa',
    linkText: 'बाजीराव पेशवे चरित्र →'
  },
  {
    id: 'vasai',
    era: 'peshwa',
    date: '१२ मे १७३९',
    location: 'वसई किल्ला',
    title: 'वसईची प्रसिद्ध मोहीम',
    desc: 'पोर्तुगीजांच्या अत्याचारांविरुद्ध चिमाजी अप्पांच्या नेतृत्वाखालील दोन वर्षांचा प्रदीर्घ वेढा. खाणी उडवून आणि अद्वितीय तोफखान्याचा वापर करून युरोपीय सत्तेवर मराठ्यांनी मिळवलेला भव्य विजय.',
    commander: 'चिमाजी अप्पा, मानाजी आंग्रे विरुद्ध सिल्वा आल्बुकेर्क',
    importance: 'उत्तर कोकणातून पोर्तुगीज सत्तेचा अंत',
    reference: 'मराठ्यांच्या इतिहासाची साधने (राजवाडे), पोर्तुगीज दप्तर',
    link: '/history',
    linkText: 'इतिहास दालन पहा →'
  },
  {
    id: 'panipat',
    era: 'peshwa',
    date: '१४ जानेवारी १७६१',
    location: 'पानिपत, हरियाणा',
    title: 'पानिपतची तिसरी लढाई',
    desc: 'भारताच्या सार्वभौमत्वासाठी उत्तरेत लढलेली महाभीषण लढाई. सदाशिवराव भाऊ, विश्वासराव पेशवे, मल्हारराव होळकर व इब्राहिम खान गारदी यांनी अब्दालीच्या सैन्याविरुद्ध दिलेला असीम शौर्याचा लढा.',
    commander: 'सदाशिवराव भाऊ विरुद्ध अहमद शाह अब्दाली',
    importance: 'मराठ्यांचा राष्ट्रीय बलिदानाचा इतिहास',
    reference: 'भाऊसाहेबांची बखर, काशीराज अहवाल, सर जदुनाथ सरकार',
    link: '/granthalaya',
    linkText: 'भाऊसाहेबांची बखर वाचा →'
  },
  {
    id: 'wadgaon',
    era: 'anglo',
    date: '१२-१३ जानेवारी १७७९',
    location: 'तळेगाव - वडगाव मावळ',
    title: 'वडगावची लढाई (पहिले इंग्रज-मराठा युद्ध)',
    desc: 'महादजी शिंदे व तुकोजी होळकर यांच्या संयुक्त फौजांनी ब्रिटिश ईस्ट इंडिया कंपनीच्या मुंबई सैन्याला तळेगाव-वडगावमध्ये कोंडीत पकडून शरणागती पत्करायला लावली. वडगावचा प्रसिद्ध तह.',
    commander: 'महादजी शिंदे, हरिपंत फडके विरुद्ध कर्नल कॉकबर्न',
    importance: 'ब्रिटिशांचा भारतात झालेला पहिला मोठा पराभव',
    reference: 'मराठ्यांच्या इतिहासाची साधने, बॉम्बे गॅझेटियर',
    link: '/forts',
    linkText: 'युद्ध नकाशा पहा →'
  }
];

export default function BattlesPage() {
  const [activeEra, setActiveEra] = useState('all');

  const filteredBattles = activeEra === 'all'
    ? BATTLES_LIST
    : BATTLES_LIST.filter(b => b.era === activeEra);

  return (
    <>
      {/* HERO SECTION */}
      <div className="hero" style={{ position: 'relative', minHeight: '480px', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-battles-palkhed.jpg"
          alt="मराठा युद्धे व रणव्यूह"
          className="hero-bg-img"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38)' }}
        />
        <div
          className="hero-overlay"
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(20,4,6,0.6), rgba(12,2,4,0.95) 85%)' }}
        />
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1300px', padding: '64px 24px', color: '#fff' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 700 }}>
            Spec Page 13 & 14 • Blueprint Section 4
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.15, color: '#fff', margin: '8px 0 16px', fontFamily: 'Baloo 2' }}>
            मराठा युद्धे, लढाया व{' '}
            <span style={{ background: 'linear-gradient(90deg,var(--gold-400),var(--saffron-500))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              रणव्यूह दालन
            </span>
          </h1>
          <div style={{ background: 'var(--gold-500)', width: '80px', height: '4px', marginBottom: '18px' }} />
          <p style={{ color: 'var(--text-sec)', fontSize: '1.12rem', maxWidth: '68ch', lineHeight: 1.6 }}>
            गनिमी कावा, वेगवान अश्वदल, जलदुर्ग वेढा व डोंगररांगांमधील अजोड रणनीती • पावनखिंड ते पालखेड, वसई ते पानिपत — मराठा लष्करी इतिहासाची सत्य व संदर्भयुक्त शौर्यगाथा.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
            <a href="#battlesList" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: 700 }}>
              ⚔️ प्रमुख लढाया पहा
            </a>
            <Link to="/forts" className="btn btn-outline" style={{ padding: '12px 24px', color: '#fff', borderColor: 'var(--gold-400)' }}>
              🗺️ युद्धस्थळांचा नकाशा
            </Link>
          </div>
        </div>
      </div>

      {/* TACTICAL STRATEGY OVERVIEW PILLARS */}
      <section className="section" style={{ padding: '56px 24px', background: 'var(--paper-2)' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
            <span className="tag" style={{ background: 'var(--saffron-500)', color: '#fff' }}>
              रणनीती व लष्करी व्यवस्था
            </span>
            <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>
              मराठा लष्करी डावपेच — पाच मुख्य आधारस्तंभ
            </h2>
            <p style={{ color: 'var(--text-sec)' }}>
              ऐतिहासिक साधनांवर आधारित मराठा सैन्याची युद्धपद्धती, ज्याने समकालीन सत्तांना चकित केले.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--saffron-600)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>गनिमी कावा (Guerrilla Warfare)</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                भौगोलिक परिस्थितीचा परिपूर्ण अभ्यास, आकस्मिक हल्ले, शत्रूचा रसद पुरवठा तोडणे आणि सुरक्षित आश्रयस्थानांत झटपट परतणे.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--gold-500)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🐎</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>वेगवान अश्वदल (Light Cavalry)</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                थोरले बाजीराव पेशव्यांच्या काळात विकसित झालेली दिवसभरात ५०-६० मैल धाव घेण्याची क्षमता, हलकी शस्त्रे व वेगवान हालचाली.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid #C73800' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💣</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>तोफखाना व दारुगोळा</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                पुरंदर, रायगड, आणि वसईच्या वेढ्यात मराठा कारागिरांनी निर्माण केलेल्या तोफा व सुरूंग तंत्रज्ञानाचा प्रभावी रणवापर.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid #1E88E5' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚓</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>मराठा आरमार व सागरी वेढा</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                छत्रपती शिवाजी महाराजांनी स्थापलेले स्वतंत्र आरमार व कान्होजी आंग्रे यांनी राखलेले अरबी समुद्रावरील मराठा वर्चस्व.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--maroon-900)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏰</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>दुर्ग संरक्षण व रसद साखळी</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                ३५० हून अधिक डोंगरी व जलदुर्गांचे अभेद्य जाळे, नैसर्गिक जलसाठे आणि आणीबाणीच्या वेळी स्वतंत्र प्रतिकार क्षमता.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BATTLES LIST SECTION */}
      <section className="section" id="battlesList" style={{ padding: '64px 24px' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="tag" style={{ background: 'var(--maroon-900)', color: 'var(--gold-400)' }}>
                ऐतिहासिक लढायांचा विस्तृत संग्रह
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: '8px 0 0', fontFamily: 'Baloo 2' }}>
                ७ ऐतिहासिक निर्णायक लढाया
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'all' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('all')}
              >
                सर्व लढाया
              </button>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'shivaji' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('shivaji')}
              >
                शिवकाल (१६४५-१६८०)
              </button>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'peshwa' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('peshwa')}
              >
                पेशवे काल (१७०७-१७६१)
              </button>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'anglo' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('anglo')}
              >
                ब्रिटिश संघर्ष (१७७५-१८१८)
              </button>
            </div>
          </div>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {filteredBattles.map((b) => (
              <div
                key={b.id}
                className="card battle-card"
                data-era={b.era}
                style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ background: 'var(--maroon-950)', color: '#fff', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 700 }}>{b.date}</span>
                    <span className="tag" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', color: '#fff' }}>
                      {b.location}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginTop: '6px', color: '#fff', fontFamily: 'Baloo 2' }}>{b.title}</h3>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-sec)', marginBottom: '14px', lineHeight: 1.6 }}>
                      {b.desc}
                    </p>
                    <div style={{ fontSize: '0.82rem', background: 'var(--paper-3)', padding: '12px', borderRadius: '8px', marginBottom: '14px', lineHeight: 1.5 }}>
                      <div><strong>सेनापती:</strong> {b.commander}</div>
                      <div style={{ marginTop: '4px' }}><strong>महत्त्व:</strong> {b.importance}</div>
                      <div style={{ marginTop: '4px' }}><strong>संदर्भ:</strong> {b.reference}</div>
                    </div>
                  </div>
                  <Link
                    to={b.link}
                    className="btn btn-outline"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                  >
                    {b.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
