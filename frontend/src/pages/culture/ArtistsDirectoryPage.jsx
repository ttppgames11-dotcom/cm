import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const artistsData = [
  {
    id: 1,
    name: 'सुबोध भावे',
    profession: 'अभिनेता, दिग्दर्शक',
    category: 'अभिनेते',
    avatar: '🎭',
    image: '/assets/images/artists/artist_subodh.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'बालगंधर्व, डॉ. काशिनाथ घाणेकर, हर हर महादेव',
    desc: 'मराठी चित्रपट, नाटक व दूरदर्शनवरील लोकप्रिय ज्येष्ठ अभिनेते व दिग्दर्शक.',
    awards: 'फिल्मफेअर, महाराष्ट्र राज्य चित्रपट पुरस्कार'
  },
  {
    id: 2,
    name: 'अंकुश चौधरी',
    profession: 'अभिनेता, दिग्दर्शक',
    category: 'अभिनेते',
    avatar: '🎬',
    image: '/assets/images/artists/artist_adash.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'दुनियादारी, क्लासमेट्स, दगडी चाळ, महाराष्ट्र शाहीर',
    desc: 'मराठी चित्रपटसृष्टीतील आघाडीचे सुपरस्टार व संवेदनशील दिग्दर्शक.',
    awards: 'झी चित्र गौरव, अनेक पुरस्कार सन्मान'
  },
  {
    id: 3,
    name: 'प्रसाद ओक',
    profession: 'अभिनेता, दिग्दर्शक',
    category: 'अभिनेते',
    avatar: '🎞️',
    image: '/assets/images/artists/artist_nagraj.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'धर्मवीर (आनंद दिघे भूमिका), हिरकणी (दिग्दर्शन), चंद्रमुखी',
    desc: 'अभिनय आणि दिग्दर्शन अशा दोन्ही क्षेत्रांत ऐतिहासिक व सामाजिक प्रभाव निर्माण करणारे कलाकार.',
    awards: 'राष्ट्रीय चित्रपट पुरस्कार (कच्चा लिंबू)'
  },
  {
    id: 4,
    name: 'नितीन देशमुख',
    profession: 'अभिनेता',
    category: 'अभिनेते',
    avatar: '🎭',
    image: '/assets/images/artists/artist_priyadarshan.jpg',
    city: 'नाशिक, महाराष्ट्र',
    popularWorks: 'मराठी नाटके, वेब सिरीज व चित्रपट',
    desc: 'रंगभूमी व चित्रपटातील समर्थ अभिनय क्षमता असलेले मराठा कलाकार.',
    awards: 'राज्य नाट्य स्पर्धा सुवर्णपदक'
  },
  {
    id: 5,
    name: 'स्वप्नील जोशी',
    profession: 'अभिनेता, निर्माता',
    category: 'अभिनेते',
    avatar: '🌟',
    image: '/assets/images/artists/artist_subodh.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'मितवा, मुंबई-पुणे-मुंबई, समांतर, दुनियादारी',
    desc: 'मराठी रसिकांच्या मनावर राज्य करणारे लाडके रोमँटिक व गंभीर अभिनेते.',
    awards: 'महाराष्ट्राचा फेव्हरेट कोण पुरस्कार'
  },
  {
    id: 6,
    name: 'मृणाल कुलकर्णी',
    profession: 'अभिनेत्री, दिग्दर्शिका',
    category: 'अभिनेत्री',
    avatar: '👑',
    image: '/assets/images/artists/artist_mukta.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'फत्तेशिकस्त, पावनखिंड, फर्जंद, सुभेदार, प्रेम म्हणजे प्रेम असतं',
    desc: 'जिजाऊ माँसाहेबांची भूमिका अजरामर करणाऱ्या मराठीतील श्रेष्ठ अभिनेत्री.',
    awards: 'राष्ट्रीय पुरस्कार सन्मानित'
  },
  {
    id: 7,
    name: 'सोनाली कुलकर्णी',
    profession: 'अभिनेत्री',
    category: 'अभिनेत्री',
    avatar: '💃',
    image: '/assets/images/artists/artist_amruta.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'नटरंग, मितवा, पोश्टर गर्ल, झोंबिवली',
    desc: 'उत्कृष्ट नृत्य आणि दर्जेदार अभिनयासाठी प्रसिद्ध असणाऱ्या महाराष्ट्राच्या अप्सरा.',
    awards: 'फिल्मफेअर सर्वोत्कृष्ट अभिनेत्री'
  },
  {
    id: 8,
    name: 'प्राजक्ता माळी',
    profession: 'अभिनेत्री, निवेदिका, कवयित्री',
    category: 'अभिनेत्री',
    avatar: '✨',
    image: '/assets/images/artists/artist_mukta.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'रानबाजार, पावनखिंड, चंद्रमुखी, हास्यजत्रा',
    desc: 'लोकप्रिय सूत्रसंचालिका, शास्त्रीय नृत्यांगना व सशक्त अभिनेत्री.',
    awards: 'कला सन्मान पुरस्कार'
  },
  {
    id: 9,
    name: 'आनंद शिंदे',
    profession: 'गायक (लोकगीते व भावगीते)',
    category: 'गायक',
    avatar: '🎤',
    image: '/assets/images/artists/artist_adash.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'नवीन पोपट, भीमगीते, लोकगीते, मराठी चित्रपट गीते',
    desc: 'महाराष्ट्राच्या मातीतील दमदार आणि बुलंद आवाजाचे लोकगायक.',
    awards: 'महाराष्ट्र गौरव पुरस्कार'
  },
  {
    id: 10,
    name: 'मंगेश बोरगांवकर',
    profession: 'गायक (भक्तिगीते व शास्त्रीय)',
    category: 'गायक',
    avatar: '🎵',
    image: '/assets/images/artists/artist_priyadarshan.jpg',
    city: 'कोल्हापूर, महाराष्ट्र',
    popularWorks: 'सूर नवा ध्यास नवा, भावगीते, अभंग',
    desc: 'सुमधुर स्वरांचे लोकप्रिय गायक व सांगीतिक मार्गदर्शक.',
    awards: 'सा रे ग म प महाविजेता'
  },
  {
    id: 11,
    name: 'अजिंक्य राऊत',
    profession: 'गायक व संगीतकार',
    category: 'गायक',
    avatar: '🎶',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'शिववंदना, पोवाडा, आधुनिक मराठी संगीत',
    desc: 'पारंपरिक मराठी लोककला व आधुनिक संगीत यांची सुरेख सांगड घालणारे युवा गायक.',
    awards: 'युवा संगीत भूषण'
  },
  {
    id: 12,
    name: 'स्वप्नील बांदोडकर',
    profession: 'पॉप व पार्श्वगायक',
    category: 'गायक',
    avatar: '🎙️',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'राधा ही बावरी, गालावर खळी, जिवलगा',
    desc: 'मराठी भावगीत आणि पार्श्वगायनातील रोमँटिक आवाज.',
    awards: 'राज्य सांस्कृतिक पुरस्कार'
  }
];

const categories = [
  'सर्व कलाकार',
  'अभिनेते',
  'अभिनेत्री',
  'दिग्दर्शक',
  'निर्माते',
  'गायक',
  'इतर'
];

export default function ArtistsDirectoryPage() {
  const [artistsList, setArtistsList] = useState(artistsData);
  const [selectedCat, setSelectedCat] = useState('सर्व कलाकार');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newArtistForm, setNewArtistForm] = useState({ name: '', category: 'अभिनेता', city: 'पुणे', popularWorks: '', phone: '', desc: '' });

  useEffect(() => {
    apiClient.getArtists()
      .then(list => {
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(a => ({
            id: a.id,
            name: a.name,
            profession: a.field || a.profession || 'कलाकार',
            category: a.category || (a.field && a.field.includes('गायक') ? 'गायक' : 'अभिनेते'),
            avatar: a.avatar || a.photo || '🎭',
            image: a.image || '/assets/images/artists/artist_subodh.jpg',
            city: a.city || 'महाराष्ट्र',
            popularWorks: a.popularWorks || a.field || 'विविध कलाकृती',
            desc: a.desc || a.awards || 'मराठा कलावंत',
            awards: a.awards || 'विशेष सन्मान'
          }));
          setArtistsList(formatted);
        }
      })
      .catch(err => console.warn('Could not load live artists:', err.message));
  }, []);

  const handleAddArtistSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addArtist({
        name: newArtistForm.name,
        field: newArtistForm.category,
        city: newArtistForm.city,
        awards: newArtistForm.popularWorks,
        phone: newArtistForm.phone
      });
      const added = {
        id: 'ART-' + Date.now(),
        name: newArtistForm.name,
        profession: newArtistForm.category,
        category: newArtistForm.category.includes('गायक') ? 'गायक' : 'अभिनेते',
        avatar: '🎭',
        image: '/assets/images/artists/artist_subodh.jpg',
        city: newArtistForm.city,
        popularWorks: newArtistForm.popularWorks,
        desc: newArtistForm.desc || 'नवीन नोंदणीकृत कलाकार',
        awards: 'नवीन नोंदणी'
      };
      setArtistsList(prev => [added, ...prev]);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  const filtered = artistsList.filter((artist) => {
    const matchCat = selectedCat === 'सर्व कलाकार' || artist.category === selectedCat;
    const matchSearch =
      (artist.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.profession || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.popularWorks || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="artists-directory-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.90) 0%, rgba(136, 14, 79, 0.88) 100%), url("/assets/images/generated/maratha_artists_hero.jpg") center/cover no-repeat',
        color: '#FFFFFF',
        padding: '50px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.3)',
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
            मराठी कला, मराठी अभिमान
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px' }}>
            मराठा कलाकार — आपली ओळख, आपला अभिमान !
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 20px', maxWidth: '650px' }}>
            महाराष्ट्रातील लोकप्रिय मराठा अभिनेते, अभिनेत्री, दिग्दर्शक व गायकांची अधिकृत यादी || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#4A148C',
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
              href="#artists-list"
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
              सर्व कलाकार पहा ({artistsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <div id="artists-list" style={{ maxWidth: '1180px', margin: '-22px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          border: '1px solid #EADBCE'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="नाव, चित्रपट, मालिका किंवा शहर शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                border: '1.5px solid #D7CCC8',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '2px solid #6A1B9A' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#6A1B9A' : '#FFFFFF',
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

      {/* Artists Cards Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {filtered.map((artist) => (
            <div
              key={artist.id}
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
                background: 'linear-gradient(135deg, #F3E5F5 0%, #EDE7F6 100%)',
                padding: '30px 20px',
                textAlign: 'center',
                borderBottom: '1px solid #E1BEE7'
              }}>
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 12px',
                      display: 'block',
                      border: '3px solid #6A1B9A',
                      boxShadow: '0 4px 14px rgba(106,27,154,0.2)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    boxShadow: '0 4px 12px rgba(106,27,154,0.15)'
                  }}>
                    {artist.avatar}
                  </div>
                )}
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4A148C', margin: '0 0 4px' }}>
                  {artist.name}
                </h3>
                <span style={{ fontSize: '0.82rem', background: '#D1C4E9', color: '#4A148C', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  {artist.profession}
                </span>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: '#555' }}>📍 स्थान:</strong> {artist.city}
                </div>
                <div>
                  <strong style={{ color: '#555' }}>🎬 प्रसिद्ध कार्य:</strong> {artist.popularWorks}
                </div>
                <div style={{ color: '#666', fontSize: '0.84rem', lineHeight: 1.5, marginTop: '4px' }}>
                  {artist.desc}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                <button
                  onClick={() => setSelectedArtist(artist)}
                  style={{
                    width: '100%',
                    background: '#6A1B9A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  प्रोफाइल पहा
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Highlight Section */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #311B92 0%, #6A1B9A 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
            मराठी कला हीच आपली ओळख !
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.9 }}>
            मराठा कलाकारांना प्रोत्साहन द्या, मराठी संस्कृतीचा अभिमान वाढवा.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFD54F',
              color: '#311B92',
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

      {/* Modal: Artist Detail */}
      {selectedArtist && (
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
              onClick={() => setSelectedArtist(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '3.5rem' }}>{selectedArtist.avatar}</span>
              <h2 style={{ color: '#4A148C', margin: '8px 0 4px', fontSize: '1.6rem' }}>{selectedArtist.name}</h2>
              <span style={{ background: '#EDE7F6', color: '#512DA8', padding: '4px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.86rem' }}>
                {selectedArtist.profession} • {selectedArtist.city}
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong>प्रमुख कामे / चित्रपट:</strong> {selectedArtist.popularWorks}</div>
              <div><strong>माहिती:</strong> {selectedArtist.desc}</div>
              <div><strong>पुरस्कार व सन्मान:</strong> {selectedArtist.awards}</div>
            </div>
            <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert(`Connect Maratha आर्टिस्ट डेस्कद्वारे संपर्क केला जाईल.`)}
                style={{ flex: 1, background: '#6A1B9A', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                संवाद साधा / बुक करा
              </button>
              <button
                onClick={() => setSelectedArtist(null)}
                style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Artist Profile */}
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4A148C', margin: '0 0 6px' }}>
              🎭 कलाकार / गायक प्रोफाइल जोडा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              आपल्या कलागुणांची नोंद Connect मराठा महामंचावर करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>प्रोफाइल यशस्वीरित्या सादर केला!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>आपला प्रोफाइल लवकरच डायरेक्टरीमध्ये प्रदर्शित होईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#6A1B9A', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddArtistSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    required
                    placeholder="कलाकाराचे पूर्ण नाव *"
                    value={newArtistForm.name}
                    onChange={(e) => setNewArtistForm({ ...newArtistForm, name: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select
                      value={newArtistForm.category}
                      onChange={(e) => setNewArtistForm({ ...newArtistForm, category: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    >
                      <option>अभिनेता</option>
                      <option>अभिनेत्री</option>
                      <option>गायक / गायिका</option>
                      <option>दिग्दर्शक</option>
                      <option>निर्माते</option>
                      <option>संगीतकार</option>
                    </select>
                    <input
                      required
                      placeholder="शहर *"
                      value={newArtistForm.city}
                      onChange={(e) => setNewArtistForm({ ...newArtistForm, city: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <input
                    placeholder="प्रसिद्ध कामे / नाटक / चित्रपट / गाणी"
                    value={newArtistForm.popularWorks}
                    onChange={(e) => setNewArtistForm({ ...newArtistForm, popularWorks: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <input
                    required
                    type="tel"
                    placeholder="मोबाईल नंबर *"
                    value={newArtistForm.phone}
                    onChange={(e) => setNewArtistForm({ ...newArtistForm, phone: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <textarea
                    placeholder="थोडक्यात परिचय"
                    rows="3"
                    value={newArtistForm.desc}
                    onChange={(e) => setNewArtistForm({ ...newArtistForm, desc: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  ></textarea>
                  <button type="submit" style={{ background: '#6A1B9A', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    प्रोफाइल थेट सादर करा ✓
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
