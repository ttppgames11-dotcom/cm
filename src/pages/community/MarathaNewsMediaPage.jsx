import React, { useState } from 'react';

const newsChannels = [
  { id: 1, name: 'साम टीव्ही (Saam TV)', lang: 'मराठी', type: 'LIVE TV', views: '१.२ लाख सक्रिय', color: '#D32F2F' },
  { id: 2, name: 'लोकशाही न्यूज (Lokshahi)', lang: 'मराठी', type: 'LIVE TV', views: '८५ हजार सक्रिय', color: '#E65100' },
  { id: 3, name: 'News18 लोकमत', lang: 'मराठी', type: 'LIVE TV', views: '२.५ लाख सक्रिय', color: '#0D47A1' },
  { id: 4, name: 'Zee 24 तास', lang: 'मराठी', type: 'LIVE TV', views: '१.९ लाख सक्रिय', color: '#1B5E20' },
  { id: 5, name: 'तरुण भारत न्यूज', lang: 'मराठी', type: 'LIVE TV', views: '९० हजार सक्रिय', color: '#C2185B' }
];

const epapersData = [
  { id: 1, name: 'तरुण भारत', year: '१९१९', city: 'कोल्हापूर', editor: 'स्वाभिमानातून स्वावलंबनाकडे' },
  { id: 2, name: 'सकाळ', year: '१९३२', city: 'पुणे', editor: 'समाज एकतेतून प्रगती शक्य' },
  { id: 3, name: 'लोकमत', year: '१९७१', city: 'नागपूर', editor: 'मराठा समाजाची दिशा आणि दशा' },
  { id: 4, name: 'पुढारी', year: '१९३९', city: 'कोल्हापूर', editor: 'शिक्षण, उद्योग आणि स्वाभिमान' },
  { id: 5, name: 'केसरी', year: '१८८१', city: 'पुणे (लोकमान्य टिळक)', editor: 'स्वराज्य हा माझा जन्मसिद्ध हक्क' },
  { id: 6, name: 'नवशक्ति', year: '१९३२', city: 'मुंबई', editor: 'महाराष्ट्राचा औद्योगिक विकास' }
];

const headlinesData = [
  { title: 'मराठा आरक्षणावर सर्वोच्च न्यायालयात ऐतिहासिक सुनावणी व शासनाची भूमिका', tag: 'ताज्या घडामोडी', time: '१० मिनिटांपूर्वी' },
  { title: 'दुर्गराज रायगडावर शिवराज्याभिषेक दिन उत्साहात संपन्न, लाखोंच्या संख्येत शिवभक्त दाखल', tag: 'संस्कृती', time: '१ तासापूर्वी' },
  { title: 'शेतकऱ्यांसाठी नवीन कर्जमाफी व वीज दर सवलत योजना जाहीर', tag: 'कृषी व शेतकरी', time: '२ तासांपूर्वी' },
  { title: 'मराठा नवउद्योजकांसाठी ५०० कोटींच्या विशेष सीड फंडाची घोषणा', tag: 'उद्योग', time: '४ तासांपूर्वी' }
];

export default function MarathaNewsMediaPage() {
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeEpaper, setActiveEpaper] = useState(null);

  return (
    <div className="maratha-news-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(183, 28, 28, 0.90) 0%, rgba(216, 67, 21, 0.88) 100%), url("/assets/images/generated/maratha_news_hero.jpg") center/cover no-repeat',
        color: '#FFFFFF',
        padding: '48px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#FFD54F'
          }}>
            🚩 CONNECT मराठा — एक लढा! एक समाज! एक भविष्य!
          </div>
          <p style={{ fontSize: '1.2rem', color: '#FFE082', fontWeight: 600, margin: '0 0 6px' }}>
            मराठा अस्मिता, मराठा समाचार !
          </p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा न्यूज & वृत्तपत्र महादालन
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '650px' }}>
            बातमी खरी, भूमिका स्पष्ट, समाजासाठी सदैव तत्पर ! || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="#live-tv"
              style={{
                background: '#FFD54F',
                color: '#B71C1C',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none'
              }}
            >
              🔴 ५ लाईव्ह न्यूज चॅनल्स
            </a>
            <a
              href="#epapers"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              📰 E-Paper वाचा (६ वृत्तपत्रे)
            </a>
          </div>
        </div>
      </section>

      {/* Breaking News Ticker */}
      <div style={{ background: '#212121', color: '#FFFFFF', padding: '12px 20px', borderBottom: '2px solid #E65100' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ background: '#D32F2F', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>
            ब्रेकिंग न्यूज
          </span>
          <span style={{ fontSize: '0.92rem', color: '#FFD54F', fontWeight: 600 }}>
            {headlinesData[0].title}
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
                padding: '22px 18px',
                textAlign: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: ch.color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '1.6rem',
                fontWeight: 900
              }}>
                📺
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2E1A17', margin: '0 0 4px' }}>
                {ch.name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '12px' }}>
                भाषा: {ch.lang} • {ch.views}
              </div>
              <button
                style={{
                  background: ch.color,
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ▶ लाईव्ह पहा
              </button>
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
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EADBCE',
                padding: '22px',
                boxShadow: '0 6px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#B71C1C', margin: 0 }}>
                    {ep.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', background: '#FFEBEE', color: '#B71C1C', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                    स्था: {ep.year}
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#555', marginBottom: '6px' }}>
                  📍 {ep.city}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#666', fontStyle: 'italic', background: '#FAF7F2', padding: '8px', borderRadius: '6px' }}>
                  संपादकीय: "{ep.editor}"
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => setActiveEpaper(ep)}
                  style={{
                    flex: 1,
                    background: '#B71C1C',
                    color: '#fff',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  📖 आजचा अंक वाचा
                </button>
                <button
                  onClick={() => alert(`${ep.name} बद्दल अधिक माहिती: स्थापना ${ep.year}, मुख्यालय ${ep.city}`)}
                  style={{
                    border: '1px solid #B71C1C',
                    background: '#fff',
                    color: '#B71C1C',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  माहिती
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Headlines List */}
      <section style={{ maxWidth: '1180px', margin: '50px auto 0', padding: '0 16px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #EADBCE' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3E2723', margin: '0 0 16px' }}>
            📌 आजच्या महत्त्वाच्या बातम्या
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {headlinesData.map((h, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx < headlinesData.length - 1 ? '1px solid #EEEEEE' : 'none', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', background: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {h.tag}
                  </span>
                  <span style={{ fontWeight: 700, color: '#2E1A17', fontSize: '0.95rem' }}>
                    {h.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
