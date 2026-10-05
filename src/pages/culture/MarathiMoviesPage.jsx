import React, { useState } from 'react';

const moviesData = [
  {
    id: 1,
    title: 'राजा शिवाजी (Raja Shivaji)',
    year: '२०२५-२६',
    category: 'शिवचरित्र',
    rating: '⭐ ५.०',
    genre: 'ऐतिहासिक महागाथा, युद्ध, स्वाभिमान',
    cast: 'रितेश देशमुख (दिग्दर्शन व मुख्य भूमिका), जेनेलिया देशमुख, संजय दत्त',
    desc: 'छत्रपती शिवाजी महाराजांच्या अखंड पराक्रमाची आणि स्वराज्य स्थापनेची भव्य आंतरराष्ट्रीय स्तरावरील महागाथा.',
    badge: 'भव्य आगामी',
    trailerId: '3CXt4GtjLmc'
  },
  {
    id: 2,
    title: 'छावा (Chhaava)',
    year: '२०२४',
    category: 'ऐतिहासिक',
    rating: '⭐ ४.७',
    genre: 'ऐतिहासिक, युद्ध, शौर्यगाथा',
    cast: 'विकी कौशल, रश्मिका मंदाना, अक्षय खन्ना',
    desc: 'छत्रपती संभाजी महाराजांच्या अजिंक्य शौर्य आणि स्वराज्यासाठीच्या अतुलनीय बलिदानाची भव्य ऐतिहासिक महागाथा.',
    badge: 'नवीन प्रदर्शित',
    trailerId: '77vRyWNqZjM'
  },
  {
    id: 3,
    title: 'संभाजी महाराज',
    year: '२०२३',
    category: 'शिवचरित्र',
    rating: '⭐ ४.६',
    genre: 'ऐतिहासिक, चरित्रात्मक',
    cast: 'अमोल कोल्हे, प्राजक्ता गायकवाड',
    desc: 'स्वराज्याचे दुसरे छत्रपती संभाजीराजे यांचे पराक्रम आणि मुघल आक्रमणांविरुद्धचा अफाट संघर्ष.',
    badge: 'सुपरहिट',
    trailerId: 'ssGDtv1j8jQ'
  },
  {
    id: 4,
    title: 'मी शिवाजीराजे भोसले बोलतोय',
    year: '२००९',
    category: 'प्रेरणादायी',
    rating: '⭐ ९.०',
    genre: 'प्रेरणादायी, सामाजिक, स्वाभिमान',
    cast: 'महेश मांजरेकर, सचिन खेडेकर, मकरंद अनासपुरे',
    desc: 'मराठी माणसाला स्वतःच्या स्वाभिमानाची आणि शिवरायांच्या विचारांची जाणीव करून देणारा ऐतिहासिक मैलाचा दगड.',
    badge: 'ऑल टाईम क्लासिक',
    trailerId: 'A3sl_BWrZSI'
  },
  {
    id: 5,
    title: 'नटसम्राट',
    year: '२०१६',
    category: 'ड्रामा',
    rating: '⭐ ९.१',
    genre: 'कौटुंबिक, ड्रामा, भावूक',
    cast: 'नाना पाटेकर, मेधा मांजरेकर, विक्रम गोखले',
    desc: 'वि. वा. शिरवाडकरांच्या अजरामर नाटकावर आधारित, अभिनयाची सर्वोच्च उंची गाठणारा चित्रपट.',
    badge: 'राष्ट्रीय पुरस्कार',
    trailerId: 'DCXDyIsPEN8'
  },
  {
    id: 6,
    title: 'सैराट',
    year: '२०१६',
    category: 'ड्रामा',
    rating: '⭐ ८.८',
    genre: 'रोमँटिक, वास्तववादी, म्युझिकल',
    cast: 'रिंकू राजगुरू, आकाश ठोसर',
    desc: 'मराठी चित्रपटसृष्टीचा इतिहास बदलून ₹१०० कोटींचा गल्ला जमवणारा जगप्रसिद्ध चित्रपट.',
    badge: '१०० कोटी ब्लॉकबस्टर',
    trailerId: 'iShPI_JF524'
  },
  {
    id: 7,
    title: 'फर्जंद',
    year: '२०१८',
    category: 'युद्ध',
    rating: '⭐ ४.३',
    genre: 'ऐतिहासिक, गनिमी कावा, युद्ध',
    cast: 'अंकित मोहन, चिन्मय मांडलेकर, प्रसाद ओक',
    desc: 'कोंडाजी फर्जंद आणि अवघ्या ६० मावळ्यांनी पन्हाळा किल्ला जिंकून स्वराज्यात आणल्याची रोमहर्षक कथा.',
    badge: 'शिवराज अष्टक',
    trailerId: 'n5tcTFTUDH8'
  },
  {
    id: 8,
    title: 'पानिपत',
    year: '२०१९',
    category: 'युद्ध',
    rating: '⭐ ४.४',
    genre: 'ऐतिहासिक, महायुद्ध',
    cast: 'अर्जुन कपूर, कृती सॅनन, संजय दत्त',
    desc: '१७६१ चे पानिपतचे तिसरे महायुद्ध आणि सदाशिवराव भाऊंच्या नेतृत्वाखालील मराठ्यांचा अद्वितीय पराक्रम.',
    badge: 'महायुद्ध',
    trailerId: 'zpXnmy-6w1g'
  },
  {
    id: 9,
    title: 'बाजीराव मस्तानी',
    year: '२०१५',
    category: 'बायोग्राफी',
    rating: '⭐ ४.५',
    genre: 'ऐतिहासिक, प्रेमकथा, युद्ध',
    cast: 'रणवीर सिंग, दीपिका पदुकोण, प्रियांका चोप्रा',
    desc: 'अपराजित योद्धा श्रीमंत बाजीराव पेशवे यांच्या ४१ लढाया आणि अतुलनीय शौर्याची भव्य रूपेरी गाथा.',
    badge: 'भव्य महागाथा',
    trailerId: 'eHOc-4D7MjY'
  },
  {
    id: 10,
    title: 'वेड (Ved)',
    year: '२०२४',
    category: 'रोमँटिक',
    rating: '⭐ ८.२',
    genre: 'कौटुंबिक, म्युझिकल, ड्रामा',
    cast: 'रितेश देशमुख, जेनेलिया देशमुख, अशोक सराफ',
    desc: 'प्रेम, कुटुंब आणि क्रिकेट यावर आधारित सर्वाधिक कमाई करणारा नवा कौटुंबिक चित्रपट.',
    badge: 'सुपरहिट २०२४',
    trailerId: 'Al2Gtph9ytI'
  },
  {
    id: 11,
    title: 'वाळवी',
    year: '२०२४',
    category: 'कॉमेडी',
    rating: '⭐ ८.५',
    genre: 'डार्क कॉमेडी, थ्रिलर',
    cast: 'स्वप्नील जोशी, अनिता दाते, सुबोध भावे',
    desc: 'उत्कृष्ट पटकथा आणि अनपेक्षित वळणांनी युक्त मराठीतील वेगळ्या धाटणीचा थरारपट.',
    badge: 'सर्वोत्कृष्ट चित्रपट',
    trailerId: 'hm0s7r3kRKw'
  }
];

const categories = [
  'सर्व',
  'ऐतिहासिक',
  'शिवचरित्र',
  'बायोग्राफी',
  'युद्ध',
  'प्रेरणादायी',
  'ड्रामा',
  'कॉमेडी',
  'कौटुंबिक'
];

export default function MarathiMoviesPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchModal, setWatchModal] = useState(false);
  const [playingMovieId, setPlayingMovieId] = useState(null);

  const filtered = moviesData.filter((m) => {
    const matchCat = selectedCat === 'सर्व' || m.category === selectedCat;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cast.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="marathi-movies-page" style={{ background: '#FAF7F2', color: '#2C1810', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(18, 12, 8, 0.40), rgba(18, 12, 8, 0.58)), url("/assets/images/generated/maratha_movies_hero.jpg")',
        backgroundPosition: 'center 38%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
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
            🎬 मराठी HIT MOVIES — TOP MOVIES
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: '#FFD54F',
            fontWeight: 800,
            margin: '0 0 8px',
            letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.85)'
          }}>
            मराठी कथा, मराठी स्वाभिमान !
          </p>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            color: '#FFFFFF',
            lineHeight: 1.25,
            textShadow: '0 4px 18px rgba(0,0,0,0.98), 0 2px 6px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.9)'
          }}>
            मनाला भिडणारे मराठी चित्रपट !
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: '#FFF8E1',
            margin: '0 auto 24px',
            maxWidth: '680px',
            lineHeight: 1.6,
            fontWeight: 700,
            textShadow: '0 3px 12px rgba(0,0,0,0.98), 0 1px 4px rgba(0,0,0,0.95)'
          }}>
            ✓ सुपरहिट कथा ✓ दिग्गज कलाकार ✓ हाय क्वालिटी HD ✓ फॅमिली एंटरटेनर
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedMovie(moviesData[0]); setWatchModal(true); }}
              style={{
                background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(230,81,0,0.4)',
                transition: 'all 0.2s'
              }}
            >
              ▶ आता पहा (राजा शिवाजी ट्रेलर)
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <div style={{ maxWidth: '1180px', margin: '32px auto 0', padding: '0 16px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #EADBCE', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <input
            type="text"
            placeholder="चित्रपट, कलाकार किंवा प्रकार शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '8px',
              background: '#FAF7F2',
              border: '1.5px solid #D7CCC8',
              color: '#2C1810',
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

      {/* Movies Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto 0', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {filtered.map((movie) => (
            <div
              key={movie.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8DFD8',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Card Header: Video Player when playing, else Poster Header */}
              {playingMovieId === movie.id ? (
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&playsinline=1&rel=0`}
                    title={`${movie.title} ट्रेलर`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  />
                  <button
                    onClick={() => setPlayingMovieId(null)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                      color: '#FFFFFF',
                      border: '1.5px solid #FFFFFF',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      zIndex: 10
                    }}
                    title="व्हिडिओ बंद करा"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                  padding: '30px 20px',
                  textAlign: 'center',
                  position: 'relative',
                  borderBottom: '1px solid #FFCC80'
                }}>
                  <span style={{ fontSize: '3.5rem' }}>🎬</span>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(230,81,0,0.3)'
                  }}>
                    {movie.badge}
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: '#FFFFFF',
                    color: '#E65100',
                    border: '1px solid #FFCC80',
                    fontSize: '0.82rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}>
                    {movie.rating}
                  </span>
                </div>
              )}

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3E2723', margin: 0 }}>
                    {movie.title}
                  </h3>
                  <span style={{ color: '#8D6E63', fontSize: '0.84rem', fontWeight: 600 }}>{movie.year}</span>
                </div>
                <div style={{ color: '#E65100', fontSize: '0.84rem', fontWeight: 700 }}>
                  {movie.genre}
                </div>
                <div style={{ color: '#4E342E', fontSize: '0.84rem' }}>
                  <strong style={{ color: '#D84315' }}>कलाकार:</strong> {movie.cast}
                </div>
                <p style={{ color: '#5D4037', fontSize: '0.85rem', lineHeight: 1.55, margin: '6px 0 0' }}>
                  {movie.desc}
                </p>
              </div>

              <div style={{ padding: '14px 18px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setPlayingMovieId(playingMovieId === movie.id ? null : movie.id);
                  }}
                  style={{
                    flex: 1,
                    background: playingMovieId === movie.id
                      ? 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)'
                      : 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 10px rgba(230,81,0,0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  {playingMovieId === movie.id ? '⏹ व्हिडिओ थांबवा' : '▶ ट्रेलर पहा'}
                </button>
                <button
                  onClick={() => { setSelectedMovie(movie); setWatchModal(true); }}
                  style={{
                    background: '#FFFFFF',
                    color: '#E65100',
                    border: '1.5px solid #FFCC80',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    transition: 'all 0.2s'
                  }}
                  title="संपूर्ण माहिती"
                >
                  ℹ️
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Highlight */}
      <section style={{ maxWidth: '1180px', margin: '50px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #B71C1C 0%, #E65100 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(230,81,0,0.25)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
            मराठी चित्रपट पहा, मराठी कलाकारांना साथ द्या !
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.95 }}>
            मराठी संस्कृती जपा, मराठी सिनेमाचा अभिमान वाढवा !
          </p>
          <button
            onClick={() => { setSelectedMovie(moviesData[0]); setWatchModal(true); }}
            style={{
              background: '#FFFFFF',
              color: '#B71C1C',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            आता पहा ▶
          </button>
        </div>
      </section>

      {/* Modal: Movie Trailer / Info */}
      {watchModal && selectedMovie && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            position: 'relative',
            border: '1px solid #EADBCE',
            color: '#2C1810',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setWatchModal(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: '#F5F5F5',
                border: '1px solid #E0E0E0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: '#424242',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              background: '#000000',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '18px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedMovie.trailerId}?autoplay=1&playsinline=1&rel=0`}
                title={`${selectedMovie.title} ट्रेलर`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', color: '#E65100', fontWeight: 800 }}>
              {selectedMovie.title} ({selectedMovie.year})
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#5D4037', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>रेटिंग:</strong> {selectedMovie.rating} | {selectedMovie.genre}</div>
              <div><strong style={{ color: '#E65100' }}>कलाकार:</strong> {selectedMovie.cast}</div>
              <div><strong>कथा:</strong> {selectedMovie.desc}</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert(`${selectedMovie.title} चा संपूर्ण चित्रपट अधिकृत ओटीटी प्लॅटफॉर्मवर उपलब्ध आहे.`)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(230,81,0,0.3)'
                }}
              >
                चित्रपट पहा (Watch Now)
              </button>
              <button
                onClick={() => setWatchModal(false)}
                style={{
                  background: '#F5F5F5',
                  color: '#424242',
                  border: '1px solid #D7CCC8',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
