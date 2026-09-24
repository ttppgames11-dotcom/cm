import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const speakersData = [
  {
    id: 1,
    name: 'डॉ. अतुल जगदाळे',
    title: 'ज्येष्ठ प्रेरणादायी वक्ते',
    topics: 'यश, आत्मविश्वास, नेतृत्व & व्यक्तिमत्व विकास',
    city: 'पुणे, महाराष्ट्र',
    category: 'प्रेरणादायी वक्ते',
    avatar: '🎙️',
    sessions: '५००+ व्याख्याने',
    desc: 'तरुणांमध्ये सकारात्मक ऊर्जेचा संचार करणारे आणि शिवरायांच्या व्यवस्थापन कौशल्यावर मार्गदर्शन करणारे प्रभावी वक्ते.'
  },
  {
    id: 2,
    name: 'सौ. मृणालिनी काठे',
    title: 'युवा प्रेरक वक्त्या & समुपदेशक',
    topics: 'विद्यार्थी प्रेरणा, करिअर नियोजन, ध्येय निश्चिती',
    city: 'मुंबई, महाराष्ट्र',
    category: 'युवा प्रेरणा',
    avatar: '👩‍🏫',
    sessions: '३५०+ कार्यशाळा',
    desc: 'स्पर्धा परीक्षा देणाऱ्या विद्यार्थ्यांसाठी व महिलांसाठी प्रेरणादायी सत्रे घेणाऱ्या प्रख्यात वक्त्या.'
  },
  {
    id: 3,
    name: 'श्री. संदीप वाघ',
    title: 'बिझनेस मोटिवेशन & ग्रोथ कोच',
    topics: 'व्यवसाय वाढ, विक्री कौशल्य, उद्योजकीय मानसिकता',
    city: 'नाशिक, महाराष्ट्र',
    category: 'व्यवसाय मार्गदर्शन',
    avatar: '💼',
    sessions: '४००+ कॉर्पोरेट सेशन्स',
    desc: 'मराठी तरुणांना नोकरी शोधण्यापेक्षा उद्योग सुरू करण्याची प्रेरणा देणारे बिझनेस मार्गदर्शक.'
  },
  {
    id: 4,
    name: 'स्वामी समर्थानंद',
    title: 'आध्यात्मिक मार्गदर्शक व विचारवंत',
    topics: 'जीवन परिवर्तन, मनःशांती, सकारात्मक विचारसरणी',
    city: 'कोल्हापूर, महाराष्ट्र',
    category: 'आध्यात्मिक',
    avatar: '🧘‍♂️',
    sessions: '६००+ प्रवचने',
    desc: 'वारकरी संप्रदाय व शिवसंस्कारांची सांगड घालून तणावमुक्त जीवनाचे तत्त्वज्ञान मांडणारे संत विचारवंत.'
  },
  {
    id: 5,
    name: 'प्रा. विजय भोसले',
    title: 'शिक्षण तज्ञ व स्पर्धा परीक्षा मार्गदर्शक',
    topics: 'UPSC/MPSC तयारी, गुणवत्तापूर्ण शिक्षण, प्रशासन',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    category: 'शिक्षण तज्ञ',
    avatar: '📚',
    sessions: '२८०+ मार्गदर्शन शिबिरे',
    desc: 'ग्रामीण भागातील शेकडो विद्यार्थ्यांना प्रशासकीय सेवेत पाठवणारे समर्पित शिक्षणतज्ज्ञ.'
  },
  {
    id: 6,
    name: 'श्री. सचिन पाटील',
    title: 'यशस्वी उद्योजक & स्टार्टअप मेंटॉर',
    topics: 'उद्योजकता, एमएसएमई फंड, तंत्रज्ञान व नवकल्पना',
    city: 'सांगली, महाराष्ट्र',
    category: 'यशस्वी उद्योजक',
    avatar: '🚀',
    sessions: '२००+ स्टार्टअप मार्गदर्शन',
    desc: 'शून्यातून जागतिक पातळीवर उद्योग उभारणीचा अनुभव तरुणांपर्यंत पोहोचवणारे उद्योजक.'
  },
  {
    id: 7,
    name: 'सौ. स्वाती देशमुख',
    title: 'महिला सक्षमीकरण वक्त्या',
    topics: 'महिला नेतृत्व, आर्थिक आत्मनिर्भरता, कुटुंब स्वाभिमान',
    city: 'पुणे, महाराष्ट्र',
    category: 'प्रेरणादायी वक्ते',
    avatar: '👑',
    sessions: '३००+ महिला मेळावे',
    desc: 'महिलांना स्वयंरोजगार आणि स्वाभिमानाने जगण्यासाठी प्रेरित करणाऱ्या विचारवंत वक्त्या.'
  },
  {
    id: 8,
    name: 'श्री. रोहित शिंदे',
    title: 'करिअर मार्गदर्शक व कॉर्पोरेट ट्रेनर',
    topics: 'भविष्यातील नोकऱ्या, एआय युग, सॉफ्ट स्किल्स',
    city: 'मुंबई, महाराष्ट्र',
    category: 'युवा प्रेरणा',
    avatar: '🎯',
    sessions: '२५०+ कॉलेज परिसंवाद',
    desc: 'आधुनिक कॉर्पोरेट जगात मराठा तरुणांनी ग्लोबल लीडर कसे बनावे याचे सखोल मार्गदर्शन.'
  }
];

const categories = [
  'सर्व वक्ते',
  'प्रेरणादायी वक्ते',
  'व्यवसाय मार्गदर्शन',
  'यशस्वी उद्योजक',
  'युवा प्रेरणा',
  'शिक्षण तज्ञ',
  'आध्यात्मिक',
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
        const mapped = liveData.map((s) => ({
          id: s.id,
          name: s.name,
          title: s.expertise || s.title || 'ज्येष्ठ प्रेरणादायी वक्ते',
          topics: s.topics || 'शिवचरित्र, व्यवस्थापन व सामाजिक प्रबोधन',
          city: s.city || 'महाराष्ट्र',
          category: s.category || 'प्रेरणादायी वक्ते',
          avatar: s.avatar || s.photo || '🎙️',
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
        background: 'linear-gradient(135deg, rgba(230, 81, 0, 0.90) 0%, rgba(216, 67, 21, 0.88) 100%), url("/assets/images/generated/maratha_speakers_hero.jpg") center/cover no-repeat',
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
            🚩 CONNECT मराठा — एक लढा भाग्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.2rem', color: '#FFE082', fontWeight: 600, margin: '0 0 6px' }}>
            प्रेरणा जी घडवते यशस्वी भविष्य !
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 10px' }}>
            मराठा वक्ते – प्रेरणा, मार्गदर्शन आणि नेतृत्व
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '680px' }}>
            मराठा विचार, मराठा प्रेरणा, मराठा अभिमान ! व्याख्यान, सेमिनार, कार्यशाळा आणि मोटिवेशनसाठी संपर्क करा.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#E65100',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ＋ आपला प्रोफाइल जोडा
            </button>
            <a
              href="#speakers-list"
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
              सर्व वक्ते पहा ({speakersData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <div id="speakers-list" style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
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
                padding: '30px 20px',
                textAlign: 'center',
                borderBottom: '1px solid #FFCC80'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>{s.avatar}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E65100', margin: '0 0 4px' }}>
                  {s.name}
                </h3>
                <span style={{ fontSize: '0.82rem', background: '#E65100', color: '#fff', padding: '2px 10px', borderRadius: '10px', fontWeight: 700 }}>
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
                    background: '#E65100',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
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
              <span style={{ fontSize: '3rem' }}>{selectedSpeaker.avatar}</span>
              <h2 style={{ color: '#E65100', margin: '6px 0 2px', fontSize: '1.5rem' }}>{selectedSpeaker.name}</h2>
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
