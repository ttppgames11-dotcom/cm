import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const speakersData = [
  {
    id: 'SPK-301',
    name: 'प्रा. नितीन बानगुडे-पाटील',
    title: 'छत्रपती शिवराय व मराठा साम्राज्य इतिहास',
    topics: 'शिवकालीन व्यवस्थापन, गनिमी कावा व आजचा युवक, स्वराज्य प्रेरणा',
    city: 'सातारा / महाराष्ट्र दौरा',
    category: 'प्रेरणादायी वक्ते',
    photo: '/assets/images/speakers/spk_nitin_banugude.jpg',
    sessions: '५००+ व्याख्याने',
    desc: 'छत्रपती शिवरायांचे व्यवस्थापन कौशल्य, गनिमी कावा आणि स्वराज्य विचारांनी महाराष्ट्रातील लाखो युवकांना प्रेरित करणारे प्रख्यात व्याख्याते.'
  },
  {
    id: 'SPK-302',
    name: 'डॉ. सुधीर निरगुडकर',
    title: 'मराठा आरमार व सागरी युद्धशास्त्र',
    topics: 'कान्होजी आंग्रे, सिंधुदुर्ग व छत्रपती शिवरायांचे नौदल व्हिजन',
    city: 'पुणे, महाराष्ट्र',
    category: 'प्रेरणादायी वक्ते',
    photo: '/assets/images/speakers/spk_sudhir_nirgudkar.jpg',
    sessions: '३५०+ व्याख्याने',
    desc: 'सरखेल कान्होजी आंग्रे, सिंधुदुर्ग व मराठ्यांच्या अजेय सागरी आरमारावर सखोल आंतरराष्ट्रीय संशोधन मांडणारे इतिहास अभ्यासक.'
  },
  {
    id: 'SPK-303',
    name: 'श्री. विजय मोरे',
    title: 'मराठा उद्योजकता व बिझनेस लीडरशिप',
    topics: 'सहकार ते कॉर्पोरेट: मराठा तरुणांसाठी उद्योग संधी आणि स्टार्ट-अप',
    city: 'मुंबई, महाराष्ट्र',
    category: 'व्यवसाय मार्गदर्शन',
    photo: '/assets/images/speakers/spk_vijay_more.jpg',
    sessions: '४००+ उद्योग सेशन्स',
    desc: 'शून्यातून भव्य उद्योग कसा उभारावा आणि जागतिक बाजारपेठेत मराठा उद्योजकांनी स्वतःचा ब्रँड कसा बनवावा याचे प्रत्यक्ष मार्गदर्शन.'
  },
  {
    id: 'SPK-304',
    name: 'डॉ. अतुल जगदाळे',
    title: 'ज्येष्ठ प्रेरणादायी वक्ते & जीवन प्रशिक्षक',
    topics: 'यश, आत्मविश्वास, नेतृत्व & व्यक्तिमत्व विकास',
    city: 'पुणे, महाराष्ट्र',
    category: 'प्रेरणादायी वक्ते',
    photo: '/assets/images/speakers/spk_nitin_banugude.jpg',
    sessions: '४५०+ व्याख्याने',
    desc: 'तरुणांमध्ये सकारात्मक ऊर्जेचा संचार करणारे आणि शिवरायांच्या व्यवस्थापन कौशल्यावर मार्गदर्शन करणारे प्रभावी वक्ते.'
  },
  {
    id: 'SPK-305',
    name: 'श्री. संदीप वाघ',
    title: 'बिझनेस मोटिवेशन & कॉर्पोरेट कोच',
    topics: 'व्यवसाय वाढ, विक्री कौशल्य, उद्योजकीय मानसिकता',
    city: 'नाशिक, महाराष्ट्र',
    category: 'व्यवसाय मार्गदर्शन',
    photo: '/assets/images/speakers/spk_vijay_more.jpg',
    sessions: '३००+ कॉर्पोरेट सेशन्स',
    desc: 'मराठी तरुणांना नोकरी शोधण्यापेक्षा उद्योग सुरू करण्याची प्रेरणा देणारे बिझनेस मार्गदर्शक.'
  },
  {
    id: 'SPK-306',
    name: 'प्रा. विजय भोसले',
    title: 'शिक्षण तज्ञ व स्पर्धा परीक्षा मार्गदर्शक',
    topics: 'UPSC/MPSC तयारी, गुणवत्तापूर्ण शिक्षण, प्रशासन',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    category: 'शिक्षण तज्ञ',
    photo: '/assets/images/speakers/spk_sudhir_nirgudkar.jpg',
    sessions: '२८०+ मार्गदर्शन शिबिरे',
    desc: 'ग्रामीण भागातील शेकडो विद्यार्थ्यांना प्रशासकीय सेवेत पाठवणारे समर्पित शिक्षणतज्ज्ञ.'
  }
];

const categories = [
  'सर्व वक्ते',
  'प्रेरणादायी वक्ते',
  'व्यवसाय मार्गदर्शन',
  'यशस्वी उद्योजक',
  'युवा प्रेरणा',
  'शिक्षण तज्ञ',
  'इतर'
];

export default function MotivationalSpeakersPage() {
  const [speakers, setSpeakers] = useState(speakersData);
  const [selectedCat, setSelectedCat] = useState('सर्व वक्ते');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    apiClient.getSpeakers().then((liveData) => {
      if (liveData && liveData.length > 0) {
        const photoMap = {
          'SPK-301': '/assets/images/speakers/spk_nitin_banugude.jpg',
          'SPK-302': '/assets/images/speakers/spk_sudhir_nirgudkar.jpg',
          'SPK-303': '/assets/images/speakers/spk_vijay_more.jpg'
        };
        const mapped = liveData.map((s, idx) => ({
          id: s.id,
          name: s.name,
          title: s.expertise || s.title || 'ज्येष्ठ प्रेरणादायी वक्ते',
          topics: s.topics || 'शिवचरित्र, व्यवस्थापन व सामाजिक प्रबोधन',
          city: s.city || 'महाराष्ट्र',
          category: s.category || 'प्रेरणादायी वक्ते',
          photo: (s.photo && s.photo.startsWith('/assets/')) 
            ? s.photo 
            : (photoMap[s.id] || (idx % 3 === 0 ? '/assets/images/speakers/spk_nitin_banugude.jpg' : idx % 3 === 1 ? '/assets/images/speakers/spk_sudhir_nirgudkar.jpg' : '/assets/images/speakers/spk_vijay_more.jpg')),
          sessions: s.sessions || '२५०+ व्याख्याने',
          desc: s.desc || `${s.name} - प्रबोधनकार व समाज प्रबोधन मार्गदर्शक.`,
          contact: s.contact || ''
        }));
        setSpeakers(mapped);
      }
    }).catch(() => {});
  }, []);

  const handleAddSpeaker = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const name = form.elements['name'].value;
    const cat = form.elements['category'].value;
    const city = form.elements['city'].value;
    const topics = form.elements['topics'].value;
    const phone = form.elements['phone'].value;
    const intro = form.elements['intro']?.value;

    try {
      const res = await apiClient.addSpeaker({
        name,
        expertise: cat,
        topics,
        city,
        contact: phone.replace(/\D/g, '').slice(-10) || '9822011223'
      });
      const created = res.data?.speaker || res.speaker || {
        id: `SPK-${Date.now().toString().slice(-4)}`,
        name,
        title: cat,
        topics,
        city,
        category: cat,
        avatar: '🎤',
        sessions: 'नवीन नोंदणी',
        desc: intro || 'Connect Maratha विचारपीठ अधिकृत वक्ते.'
      };
      setSpeakers((prev) => [created, ...prev]);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'नोंदणी करताना त्रुटी आली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookSpeaker = async (speaker) => {
    try {
      await apiClient.bookSpeaker({
        speakerId: String(speaker.id),
        speakerName: speaker.name,
        eventDate: '२०२६ मधील नियोजित तारीख',
        venue: speaker.city || 'महाराष्ट्र',
        organizerPhone: '9822011223'
      });
      alert(`Connect Maratha व्याख्यान समन्वय कक्ष: ${speaker.name} यांच्यासाठी आपली विनंती नोंदवली गेली आहे!`);
      setSelectedSpeaker(null);
    } catch {
      alert(`Connect Maratha व्याख्यान समन्वय कक्ष: ${speaker.name} यांच्या तारखा निश्चित करण्यासाठी लवकरच संपर्क होईल.`);
      setSelectedSpeaker(null);
    }
  };

  const filtered = speakers.filter((s) => {
    const matchCat = selectedCat === 'सर्व वक्ते' || s.category === selectedCat;
    const matchSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.topics || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="speakers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(18, 12, 8, 0.40), rgba(18, 12, 8, 0.58)), url("/assets/images/generated/maratha_speakers_hero.jpg")',
        backgroundPosition: 'center 30%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        padding: '54px 20px 48px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderBottom: '4px solid #E65100'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
            border: '1px solid rgba(255,255,255,0.4)',
            padding: '6px 20px',
            borderRadius: '20px',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '14px',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(230,81,0,0.4)'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: '#FFD54F',
            fontWeight: 800,
            margin: '0 0 8px',
            letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.85)'
          }}>
            प्रेरणा जी घडवते यशस्वी भविष्य !
          </p>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            margin: '0 0 14px',
            lineHeight: 1.25,
            color: '#FFFFFF',
            textShadow: '0 4px 18px rgba(0,0,0,0.98), 0 2px 6px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.9)'
          }}>
            मराठा वक्ते – प्रेरणा, मार्गदर्शन आणि नेतृत्व
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: '#FFF8E1',
            margin: '0 auto 24px',
            maxWidth: '720px',
            lineHeight: 1.6,
            fontWeight: 700,
            textShadow: '0 3px 12px rgba(0,0,0,0.98), 0 1px 4px rgba(0,0,0,0.95)'
          }}>
            मराठा विचार, मराठा प्रेरणा, मराठा अभिमान ! व्याख्यान, सेमिनार, कार्यशाळा आणि मोटिवेशनसाठी संपर्क करा.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #FFD54F 0%, #FFCA28 100%)',
                color: '#3E2723',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'all 0.2s'
              }}
            >
              ＋ आपला प्रोफाइल जोडा
            </button>
            <a
              href="#speakers-list"
              style={{
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.6)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              सर्व वक्ते पहा ({speakersData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Filter - Clean spacing below hero with no overlapping */}
      <div id="speakers-list" style={{ maxWidth: '1180px', margin: '32px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          border: '1px solid #EADBCE'
        }}>
          <input
            type="text"
            placeholder="वक्त्यांचे नाव, विषय किंवा शहर शोधा..."
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
                  border: selectedCat === cat ? '2px solid #E65100' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#E65100' : '#FFFFFF',
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
      </div>

      {/* Speakers Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {filtered.map((s) => (
            <div
              key={s.id}
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
                background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                padding: '24px 20px 18px',
                textAlign: 'center',
                borderBottom: '1px solid #FFCC80'
              }}>
                <div style={{
                  width: '105px',
                  height: '105px',
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3.5px solid #E65100',
                  boxShadow: '0 6px 16px rgba(230,81,0,0.28)',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {s.photo && s.photo.startsWith('/assets/') ? (
                    <img
                      src={s.photo}
                      alt={s.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/speakers/spk_nitin_banugude.jpg';
                      }}
                    />
                  ) : (
                    <img
                      src="/assets/images/speakers/spk_nitin_banugude.jpg"
                      alt={s.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E65100', margin: '0 0 6px' }}>
                  {s.name}
                </h3>
                <span style={{ fontSize: '0.82rem', background: '#E65100', color: '#fff', padding: '3px 12px', borderRadius: '12px', fontWeight: 700, display: 'inline-block' }}>
                  {s.title}
                </span>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: '#E65100' }}>🎯 मुख्य विषय:</strong> {s.topics}
                </div>
                <div>
                  <strong>📍 स्थान:</strong> {s.city}
                </div>
                <div>
                  <strong>🎤 अनुभव:</strong> <span style={{ color: '#2E7D32', fontWeight: 700 }}>{s.sessions}</span>
                </div>
                <div style={{ color: '#666', fontSize: '0.84rem', marginTop: '4px' }}>
                  {s.desc}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                <button
                  onClick={() => setSelectedSpeaker(s)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    boxShadow: '0 3px 10px rgba(230,81,0,0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  व्याख्यानासाठी संपर्क / प्रोफाइल
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Highlight */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #BF360C 0%, #D84315 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
            आपणही प्रेरणादायी वक्ते आहात?
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.9 }}>
            आपला अनुभव आणि ज्ञान समाजापर्यंत पोहोचवा. Connect मराठा मंचावर नोंदणी करा.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFD54F',
              color: '#BF360C',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            आपला प्रोफाइल जोडा
          </button>
        </div>
      </section>

      {/* Modal: Speaker Detail & Booking */}
      {selectedSpeaker && (
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
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedSpeaker(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 10px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #E65100',
                boxShadow: '0 4px 14px rgba(230,81,0,0.3)',
                background: '#FFFFFF'
              }}>
                <img
                  src={selectedSpeaker.photo || '/assets/images/speakers/spk_nitin_banugude.jpg'}
                  alt={selectedSpeaker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/speakers/spk_nitin_banugude.jpg';
                  }}
                />
              </div>
              <h2 style={{ color: '#E65100', margin: '6px 0 2px', fontSize: '1.5rem', fontWeight: 800 }}>{selectedSpeaker.name}</h2>
              <span style={{ color: '#666', fontSize: '0.88rem' }}>{selectedSpeaker.title} • {selectedSpeaker.city}</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>विषय:</strong> {selectedSpeaker.topics}</div>
              <div><strong>अनुभव:</strong> {selectedSpeaker.sessions}</div>
              <div><strong>परिचय:</strong> {selectedSpeaker.desc}</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleBookSpeaker(selectedSpeaker)}
                style={{ flex: 1, background: '#E65100', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                व्याख्यानासाठी निमंत्रित करा
              </button>
              <button
                onClick={() => setSelectedSpeaker(null)}
                style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Speaker */}
      {showAddModal && (
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
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowAddModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#E65100', margin: '0 0 6px' }}>
              🎤 वक्ते नोंदणी फॉर्म
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              आपल्या व्याख्यान कौशल्याची माहिती Connect Maratha वर नोंदवा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>नोंदणी यशस्वीरित्या प्राप्त झाली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>आपली माहिती पडताळणीनंतर यादीत समाविष्ट केली जाईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#E65100', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddSpeaker}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input name="name" required placeholder="पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select name="category" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      {categories.filter(c => c !== 'सर्व वक्ते').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input name="city" required placeholder="शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <input name="topics" required placeholder="व्याख्यानाचे मुख्य विषय *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input name="phone" required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <textarea name="intro" placeholder="अनुभव व थोडक्यात परिचय" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#E65100', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'नोंदणी करत आहे...' : 'प्रोफाइल सबमिट करा'}
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
