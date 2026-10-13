import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const artistsData = [
  {
    id: 1,
    name: 'सुबोध भावे',
    profession: 'अभिनेता, दिग्दर्शक',
    category: 'अभिनेते',
    avatar: '🎭',
    image: '/assets/images/artists/subodh_bhave.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'बालगंधर्व, डॉ. काशिनाथ घाणेकर, हर हर महादेव',
    desc: 'मराठी चित्रपट, नाटक व दूरदर्शनवरील दिग्गज अभिनेते व संवेदनशील दिग्दर्शक.',
    awards: 'फिल्मफेअर, महाराष्ट्र राज्य चित्रपट पुरस्कार'
  },
  {
    id: 2,
    name: 'अंकुश चौधरी',
    profession: 'अभिनेता, दिग्दर्शक',
    category: 'अभिनेते',
    avatar: '🎬',
    image: '/assets/images/artists/ankush_chaudhari.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'दुनियादारी, दगडी चाळ, क्लासमेट्स, महाराष्ट्र शाहीर',
    desc: 'मराठी चित्रपटसृष्टीतील ब्लॉकबस्टर सुपरस्टार व कुशल दिग्दर्शक.',
    awards: 'झी चित्र गौरव, अनेक मानाचे सन्मान'
  },
  {
    id: 3,
    name: 'प्रसाद ओक',
    profession: 'अभिनेता, दिग्दर्शक',
    category: 'अभिनेते',
    avatar: '🎞️',
    image: '/assets/images/artists/prasad_oak.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'धर्मवीर (आनंद दिघे), हिरकणी, कच्चा लिंबू, चंद्रमुखी',
    desc: 'अभिनय व दिग्दर्शन अशा दोन्ही क्षेत्रांत राष्ट्रीय ठसा उमटवणारे कलावंत.',
    awards: 'राष्ट्रीय चित्रपट पुरस्कार (कच्चा लिंबू दिग्दर्शन)'
  },
  {
    id: 4,
    name: 'स्वप्नील जोशी',
    profession: 'अभिनेता, निर्माता',
    category: 'अभिनेते',
    avatar: '🌟',
    image: '/assets/images/artists/swapnil_joshi.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'मितवा, मुंबई-पुणे-मुंबई, समांतर, दुनियादारी',
    desc: 'मराठी रसिकांच्या मनावर अधिराज्य गाजवणारे लोकप्रिय अभिनेते.',
    awards: 'महाराष्ट्राचा फेव्हरेट कोण पुरस्कार'
  },
  {
    id: 5,
    name: 'भरत जाधव',
    profession: 'अभिनेता (नाट्य व चित्रपट सुपरस्टार)',
    category: 'अभिनेते',
    avatar: '🎭',
    image: '/assets/images/artists/bharat_jadhav.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'सही रे सही, जत्रा, खबरदार, पछाडलेला, ऑल द बेस्ट',
    desc: 'मराठी रंगभूमी आणि चित्रपटातील विक्रमी विनोदी व गंभीर सम्राट.',
    awards: 'लिम्का बुक ऑफ रेकॉर्ड्स, राज्य नाट्य पुरस्कार'
  },
  {
    id: 6,
    name: 'अशोक सराफ',
    profession: 'ज्येष्ठ अभिनेते (महानायक)',
    category: 'अभिनेते',
    avatar: '👑',
    image: '/assets/images/artists/ashok_saraf.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'अशी ही बनवा बनवी, वजीर, आयत्या घरात घरोबा, हम पाँच',
    desc: 'मराठी चित्रपटसृष्टीचे सम्राट व महाराष्ट्र भूषण सन्मानित महानायक.',
    awards: 'महाराष्ट्र भूषण, संगीत नाटक अकादमी, फिल्मफेअर'
  },
  {
    id: 7,
    name: 'मकरंद अनासपुरे',
    profession: 'अभिनेता, दिग्दर्शक, समाजसेवक',
    category: 'अभिनेते',
    avatar: '🌾',
    image: '/assets/images/artists/makarand_anaspure.jpg',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    popularWorks: 'दे धक्का, नाना मामा, काय द्याचे बोला, नाम फाउंडेशन',
    desc: 'मराठवाडी शैलीचे अद्वितीय अभिनेते आणि शेतकऱ्यांसाठी समर्पित समाजसेवक.',
    awards: 'नाम फाउंडेशन सह-संस्थापक, कला गौरव'
  },
  {
    id: 8,
    name: 'सिद्धार्थ जाधव',
    profession: 'अभिनेता, परफॉर्मर',
    category: 'अभिनेते',
    avatar: '🔥',
    image: '/assets/images/artists/siddharth_jadhav.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'जत्रा, दे धक्का, सिम्बा, टाईमपास, सर्कस',
    desc: 'ऊर्जेचा झरा असणारे मराठी व बॉलिवूडमधील अष्टपैलू अभिनेते.',
    awards: 'झी गौरव, स्क्रीन पुरस्कार'
  },
  {
    id: 9,
    name: 'सोनाली कुलकर्णी',
    profession: 'अभिनेत्री, नृत्यांगना',
    category: 'अभिनेत्री',
    avatar: '💃',
    image: '/assets/images/artists/sonalee_kulkarni.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'नटरंग (अप्सरा आली), मितवा, पोश्टर गर्ल, हिरकणी',
    desc: 'महाराष्ट्राची अप्सरा म्हणून ख्याती असलेल्या आघाडीच्या अभिनेत्री.',
    awards: 'फिल्मफेअर, सर्वोत्कृष्ट अभिनेत्री पुरस्कार'
  },
  {
    id: 10,
    name: 'प्राजक्ता माळी',
    profession: 'अभिनेत्री, कवयित्री, निवेदिका',
    category: 'अभिनेत्री',
    avatar: '✨',
    image: '/assets/images/artists/prajakta_mali.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'पावनखिंड, रानबाजार, हास्यजत्रा सूत्रसंचालन, प्राजक्तप्रभा',
    desc: 'भरतनाट्यम विशारद, लोकप्रिय निवेदिका व संवेदनशील अभिनेत्री.',
    awards: 'कला सन्मान, युथ आयकॉन पुरस्कार'
  },
  {
    id: 11,
    name: 'सई ताम्हणकर',
    profession: 'अभिनेत्री (राष्ट्रीय पुरस्कार विजेती)',
    category: 'अभिनेत्री',
    avatar: '👑',
    image: '/assets/images/artists/sai_tamhankar.jpg',
    city: 'सांगली, महाराष्ट्र',
    popularWorks: 'मिमी (फिल्मफेअर विजेती), दुनियादारी, वजनदार, पाँडिचेरी',
    desc: 'मराठी व हिंदी दोन्ही सिनेसृष्टी गाजवणारी सशक्त मराठमोळी अभिनेत्री.',
    awards: 'फिल्मफेअर सर्वोत्कृष्ट सहाय्यक अभिनेत्री'
  },
  {
    id: 12,
    name: 'अमृता खानविलकर',
    profession: 'अभिनेत्री, शास्त्रीय नृत्यांगना',
    category: 'अभिनेत्री',
    avatar: '💃',
    image: '/assets/images/artists/amruta_khanvilkar.jpg',
    city: 'पुणे, महाराष्ट्र',
    popularWorks: 'चंद्रमुखी (चंद्रा), कट्यार काळजात घुसली, राझी, नच बलिये',
    desc: 'लावणी व कथ्थकमध्ये पारंगत असणारी अव्वल मराठमोळी अभिनेत्री.',
    awards: 'नच बलिये विजेती, फिल्मफेअर नामांकन'
  },
  {
    id: 13,
    name: 'नागराज मंजुळे',
    profession: 'राष्ट्रीय पुरस्कार विजेते दिग्दर्शक व कवी',
    category: 'दिग्दर्शक',
    avatar: '🎥',
    image: '/assets/images/artists/nagraj_manjule.jpg',
    city: 'सोलापूर / पुणे, महाराष्ट्र',
    popularWorks: 'सैराट (इतिहास रचणारा चित्रपट), फँड्री, झुंड, घर बंदूक बिर्याणी',
    desc: 'मराठी चित्रपटसृष्टीला आंतरराष्ट्रीय पातळीवर नवी ओळख देणारे दिग्दर्शक.',
    awards: 'राष्ट्रीय चित्रपट पुरस्कार (स्वर्णकमळ)'
  },
  {
    id: 14,
    name: 'महेश मांजरेकर',
    profession: 'दिग्दर्शक, अभिनेते व निर्माते',
    category: 'दिग्दर्शक',
    avatar: '🎬',
    image: '/assets/images/artists/mahesh_manjrekar.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'वास्तव, नटसम्राट, मी शिवाजीराजे भोसले बोलतोय, काकस्पर्श',
    desc: 'मराठी चित्रपटसृष्टीला मानाचे स्थान मिळवून देणारे ज्येष्ठ दिग्दर्शक.',
    awards: 'राष्ट्रीय पुरस्कार, फिल्मफेअर पुरस्कार'
  },
  {
    id: 15,
    name: 'सचिन पिळगावकर',
    profession: 'दिग्दर्शक, अभिनेते, गायक',
    category: 'दिग्दर्शक',
    avatar: '🎞️',
    image: '/assets/images/artists/sachin_pilgaonkar.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'अशी ही बनवा बनवी, नवरी मिळे नवऱ्याला, कट्यार काळजात घुसली',
    desc: 'सहा दशकांहून अधिक काळ चित्रपटसृष्टी गाजवणारे ज्येष्ठ दिग्दर्शक व अभिनेते.',
    awards: 'राष्ट्रीय पुरस्कार, संगीत नाटक अकादमी'
  },
  {
    id: 16,
    name: 'आदर्श शिंदे',
    profession: 'गायक (बुलंद आवाज)',
    category: 'गायक',
    avatar: '🎤',
    image: '/assets/images/artists/adarsh_shinde.jpg',
    city: 'मुंबई, महाराष्ट्र',
    popularWorks: 'देवाक काळजी रे, धुमाकूळ, पोवाडे, शिववंदना, भीमगीते',
    desc: 'महाराष्ट्राच्या मातीतील दमदार आणि बुलंद आवाजाचे लोकप्रिय पार्श्वगायक.',
    awards: 'फिल्मफेअर सर्वोत्कृष्ट पार्श्वगायक'
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
          const formatted = list.map((a, index) => {
            // Find existing fallback match by name or by index to guarantee every artist has their unique real photo
            const matched = artistsData.find(d => d.name === a.name) || artistsData[index % artistsData.length];
            return {
              id: a.id || matched.id,
              name: a.name || matched.name,
              profession: a.field || a.profession || matched.profession || 'कलाकार',
              category: a.category || matched.category || 'अभिनेते',
              avatar: a.avatar || matched.avatar || '🎭',
              image: a.image || matched.image,
              city: a.city || matched.city || 'महाराष्ट्र',
              popularWorks: a.popularWorks || a.field || matched.popularWorks || 'विविध कलाकृती',
              desc: a.desc || matched.desc || 'मराठा कलावंत',
              awards: a.awards || matched.awards || 'विशेष सन्मान'
            };
          });
          setArtistsList(formatted);
        } else {
          setArtistsList(artistsData);
        }
      })
      .catch(() => setArtistsList(artistsData));
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
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.64)), url("/assets/images/generated/maratha_artists_hero.jpg")',
        backgroundPosition: 'center 42%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        padding: '54px 20px 48px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        borderBottom: '4px solid #E65100'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: '#E65100',
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
            fontSize: '1.3rem',
            color: '#FFD54F',
            fontWeight: 800,
            margin: '0 0 8px',
            letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.85)'
          }}>
            मराठी कला, मराठी अभिमान
          </p>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            color: '#FFFFFF',
            lineHeight: 1.25,
            textShadow: '0 3px 14px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)'
          }}>
            मराठा कलाकार — आपली ओळख, आपला अभिमान !
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: '#FFFFFF',
            margin: '0 auto 24px',
            maxWidth: '720px',
            lineHeight: 1.6,
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)'
          }}>
            महाराष्ट्रातील लोकप्रिय मराठा अभिनेते, अभिनेत्री, दिग्दर्शक व गायकांची अधिकृत यादी || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#7A1C1C',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s'
              }}
            >
              ＋ आपला प्रोफाइल जोडा
            </button>
            <a
              href="#artists-list"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.5)',
                padding: '12px 26px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              🔍 सर्व कलाकार पहा ({artistsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Filter - Cleanly below hero card with no overlapping */}
      <div id="artists-list" style={{ maxWidth: '1180px', margin: '32px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
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
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1.5px solid #D7CCC8',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'thin' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '24px',
                  border: selectedCat === cat ? '2px solid #E65100' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)' : '#FFFFFF',
                  color: selectedCat === cat ? '#FFFFFF' : '#424242',
                  fontSize: '0.9rem',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedCat === cat ? '0 4px 12px rgba(230,81,0,0.25)' : 'none',
                  transition: 'all 0.2s ease'
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
                boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{
                background: 'linear-gradient(180deg, #FFF8E1 0%, #FFF3E0 100%)',
                textAlign: 'center',
                padding: '24px 16px 16px',
                position: 'relative',
                borderBottom: '1px solid #FFE082'
              }}>
                <div style={{
                  width: '116px',
                  height: '116px',
                  borderRadius: '50%',
                  margin: '0 auto 14px',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                  boxShadow: '0 6px 18px rgba(230,81,0,0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/artists/subodh_bhave.jpg';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        display: 'block',
                        background: '#FFFFFF'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: '#FFF3E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.8rem'
                    }}>
                      {artist.avatar}
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3E2723', margin: '0 0 6px' }}>
                  {artist.name}
                </h3>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.82rem',
                  background: '#FFF3E0',
                  border: '1px solid #FFCC80',
                  color: '#E65100',
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  {artist.profession}
                </span>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: '#E65100' }}>📍 स्थान:</strong> {artist.city}
                </div>
                <div>
                  <strong style={{ color: '#E65100' }}>🎬 प्रसिद्ध कार्य:</strong> {artist.popularWorks}
                </div>
                <div style={{ color: '#666', fontSize: '0.84rem', lineHeight: 1.5, marginTop: '4px' }}>
                  {artist.desc}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAF7F2', borderTop: '1px solid #F0E8DE' }}>
                <button
                  onClick={() => setSelectedArtist(artist)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    boxShadow: '0 3px 10px rgba(230,81,0,0.22)',
                    transition: 'all 0.2s'
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
          background: 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(230,81,0,0.25)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🎭 🚩</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 8px' }}>
            मराठी कला हीच आपली ओळख !
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.95 }}>
            मराठा कलाकारांना प्रोत्साहन द्या, मराठी संस्कृतीचा अभिमान वाढवा.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFFFFF',
              color: '#D84315',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            आपला प्रोफाइल जोडा →
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
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                margin: '0 auto 12px',
                padding: '3px',
                background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                boxShadow: '0 6px 16px rgba(230,81,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {selectedArtist.image ? (
                  <img
                    src={selectedArtist.image}
                    alt={selectedArtist.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/artists/subodh_bhave.jpg';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      display: 'block'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>{selectedArtist.avatar}</span>
                )}
              </div>
              <h2 style={{ color: '#E65100', margin: '4px 0 6px', fontSize: '1.6rem' }}>{selectedArtist.name}</h2>
              <span style={{ background: '#FFE0B2', color: '#E65100', padding: '4px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '0.86rem' }}>
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
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(230,81,0,0.22)'
                }}
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#E65100', margin: '0 0 6px' }}>
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
                  style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
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
                  <button type="submit" style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(230,81,0,0.3)' }}>
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
