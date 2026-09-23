import React, { useState } from 'react';

const moviesData = [
  {
    id: 1,
    title: 'छावा (Chhaava)',
    year: '२०२४',
    category: 'ऐतिहासिक',
    rating: '⭐ ४.७',
    genre: 'ऐतिहासिक, युद्ध, शौर्यगाथा',
    cast: 'विकी कौशल, रश्मिका मंदाना, अक्षय खन्ना',
    desc: 'छत्रपती संभाजी महाराजांच्या अजिंक्य शौर्य आणि स्वराज्यासाठीच्या अतुलनीय बलिदानाची भव्य ऐतिहासिक महागाथा.',
    badge: 'नवीन प्रदर्शित'
  },
  {
    id: 2,
    title: 'संभाजी महाराज',
    year: '२०२३',
    category: 'शिवचरित्र',
    rating: '⭐ ४.६',
    genre: 'ऐतिहासिक, चरित्रात्मक',
    cast: 'अमोल कोल्हे, प्राजक्ता गायकवाड',
    desc: 'स्वराज्याचे दुसरे छत्रपती संभाजीराजे यांचे पराक्रम आणि मुघल आक्रमणांविरुद्धचा अफाट संघर्ष.',
    badge: 'सुपरहिट'
  },
  {
    id: 3,
    title: 'मी शिवाजीराजे भोसले बोलतोय',
    year: '२००९',
    category: 'प्रेरणादायी',
    rating: '⭐ ९.०',
    genre: 'प्रेरणादायी, सामाजिक, स्वाभिमान',
    cast: 'महेश मांजरेकर, सचिन खेडेकर, मकरंद अनासपुरे',
    desc: 'मराठी माणसाला स्वतःच्या स्वाभिमानाची आणि शिवरायांच्या विचारांची जाणीव करून देणारा ऐतिहासिक मैलाचा दगड.',
    badge: 'ऑल टाईम क्लासिक'
  },
  {
    id: 4,
    title: 'नटसम्राट',
    year: '२०१६',
    category: 'ड्रामा',
    rating: '⭐ ९.१',
    genre: 'कौटुंबिक, ड्रामा, भावूक',
    cast: 'नाना पाटेकर, मेधा मांजरेकर, विक्रम गोखले',
    desc: 'वि. वा. शिरवाडकरांच्या अजरामर नाटकावर आधारित, अभिनयाची सर्वोच्च उंची गाठणारा चित्रपट.',
    badge: 'राष्ट्रीय पुरस्कार'
  },
  {
    id: 5,
    title: 'सैराट',
    year: '२०१६',
    category: 'ड्रामा',
    rating: '⭐ ८.८',
    genre: 'रोमँटिक, वास्तववादी, म्युझिकल',
    cast: 'रिंकू राजगुरू, आकाश ठोसर',
    desc: 'मराठी चित्रपटसृष्टीचा इतिहास बदलून ₹१०० कोटींचा गल्ला जमवणारा जगप्रसिद्ध चित्रपट.',
    badge: '१०० कोटी ब्लॉकबस्टर'
  },
  {
    id: 6,
    title: 'फर्जंद',
    year: '२०१८',
    category: 'युद्ध',
    rating: '⭐ ४.३',
    genre: 'ऐतिहासिक, गनिमी कावा, युद्ध',
    cast: 'अंकित मोहन, चिन्मय मांडलेकर, प्रसाद ओक',
    desc: 'कोंडाजी फर्जंद आणि अवघ्या ६० मावळ्यांनी पन्हाळा किल्ला जिंकून स्वराज्यात आणल्याची रोमहर्षक कथा.',
    badge: 'शिवराज अष्टक'
  },
  {
    id: 7,
    title: 'पानिपत',
    year: '२०१९',
    category: 'युद्ध',
    rating: '⭐ ४.४',
    genre: 'ऐतिहासिक, महायुद्ध',
    cast: 'अर्जुन कपूर, कृती सॅनन, संजय दत्त',
    desc: '१७६१ चे पानिपतचे तिसरे महायुद्ध आणि सदाशिवराव भाऊंच्या नेतृत्वाखालील मराठ्यांचा अद्वितीय पराक्रम.',
    badge: 'महायुद्ध'
  },
  {
    id: 8,
    title: 'बाजीराव मस्तानी',
    year: '२०१५',
    category: 'बायोग्राफी',
    rating: '⭐ ४.५',
    genre: 'ऐतिहासिक, प्रेमकथा, युद्ध',
    cast: 'रणवीर सिंग, दीपिका पदुकोण, प्रियांका चोप्रा',
    desc: 'अपराजित योद्धा श्रीमंत बाजीराव पेशवे यांच्या ४१ लढाया आणि अतुलनीय शौर्याची भव्य रूपेरी गाथा.',
    badge: 'भव्य महागाथा'
  },
  {
    id: 9,
    title: 'वेड (Ved)',
    year: '२०२४',
    category: 'रोमँटिक',
    rating: '⭐ ८.२',
    genre: 'कौटुंबिक, म्युझिकल, ड्रामा',
    cast: 'रितेश देशमुख, जेनेलिया देशमुख, अशोक सराफ',
    desc: 'प्रेम, कुटुंब आणि क्रिकेट यावर आधारित सर्वाधिक कमाई करणारा नवा कौटुंबिक चित्रपट.',
    badge: 'सुपरहिट २०२४'
  },
  {
    id: 10,
    title: 'वाळवी',
    year: '२०२४',
    category: 'कॉमेडी',
    rating: '⭐ ८.५',
    genre: 'डार्क कॉमेडी, थ्रिलर',
    cast: 'स्वप्नील जोशी, अनिता दाते, सुबोध भावे',
    desc: 'उत्कृष्ट पटकथा आणि अनपेक्षित वळणांनी युक्त मराठीतील वेगळ्या धाटणीचा थरारपट.',
    badge: 'सर्वोत्कृष्ट चित्रपट'
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

  const filtered = moviesData.filter((m) => {
    const matchCat = selectedCat === 'सर्व' || m.category === selectedCat;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cast.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="marathi-movies-page" style={{ background: '#121212', color: '#E0E0E0', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, #121212 100%), url("/assets/images/generated/maratha_movies_hero.jpg") center/cover no-repeat',
        padding: '50px 20px 30px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(230,81,0,0.25)',
            border: '1px solid rgba(230,81,0,0.5)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '14px',
            color: '#FFB74D'
          }}>
            🎬 मराठी HIT MOVIES — TOP MOVIES
          </div>
          <p style={{ fontSize: '1.2rem', color: '#FFE082', fontWeight: 600, margin: '0 0 8px' }}>
            मराठी कथा, मराठी स्वाभिमान !
          </p>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0 0 12px', color: '#FFFFFF', textShadow: '0 4px 12px rgba(230,81,0,0.4)' }}>
            मनाला भिडणारे मराठी चित्रपट !
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#B0BEC5', margin: '0 auto 20px', maxWidth: '650px' }}>
            ✓ सुपरहिट कथा ✓ दिग्गज कलाकार ✓ हाय क्वालिटी HD ✓ फॅमिली एंटरटेनर
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedMovie(moviesData[0]); setWatchModal(true); }}
              style={{
                background: '#E65100',
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
                boxShadow: '0 4px 16px rgba(230,81,0,0.4)'
              }}
            >
              ▶ आता पहा (छावा ट्रेलर)
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <div style={{ maxWidth: '1180px', margin: '0 auto 30px', padding: '0 16px' }}>
        <div style={{ background: '#1E1E1E', borderRadius: '12px', padding: '18px', border: '1px solid #333' }}>
          <input
            type="text"
            placeholder="चित्रपट, कलाकार किंवा प्रकार शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '8px',
              background: '#2A2A2A',
              border: '1px solid #444',
              color: '#FFFFFF',
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
                  border: selectedCat === cat ? '2px solid #E65100' : '1px solid #444',
                  background: selectedCat === cat ? '#E65100' : '#2A2A2A',
                  color: selectedCat === cat ? '#FFFFFF' : '#B0BEC5',
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
      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {filtered.map((movie) => (
            <div
              key={movie.id}
              style={{
                background: '#1E1E1E',
                borderRadius: '14px',
                border: '1px solid #333',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #3E2723 0%, #BF360C 100%)',
                padding: '30px 20px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <span style={{ fontSize: '3.5rem' }}>🎬</span>
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#E65100',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}>
                  {movie.badge}
                </span>
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#FFD54F',
                  fontSize: '0.82rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 800
                }}>
                  {movie.rating}
                </span>
              </div>

              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {movie.title}
                  </h3>
                  <span style={{ color: '#888', fontSize: '0.84rem' }}>{movie.year}</span>
                </div>
                <div style={{ color: '#FFB74D', fontSize: '0.82rem', fontWeight: 600 }}>
                  {movie.genre}
                </div>
                <div style={{ color: '#90A4AE', fontSize: '0.82rem' }}>
                  <strong>कलाकार:</strong> {movie.cast}
                </div>
                <p style={{ color: '#B0BEC5', fontSize: '0.84rem', lineHeight: 1.5, margin: '6px 0 0' }}>
                  {movie.desc}
                </p>
              </div>

              <div style={{ padding: '14px 18px', background: '#262626', borderTop: '1px solid #333' }}>
                <button
                  onClick={() => { setSelectedMovie(movie); setWatchModal(true); }}
                  style={{
                    width: '100%',
                    background: '#E65100',
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
                    gap: '6px'
                  }}
                >
                  ▶ ट्रेलर पहा & माहिती
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
          textAlign: 'center'
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
              cursor: 'pointer'
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
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#1E1E1E',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            border: '1px solid #444',
            color: '#fff'
          }}>
            <button
              onClick={() => setWatchModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#333', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#fff', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{
              background: '#000000',
              borderRadius: '12px',
              padding: '50px 20px',
              textAlign: 'center',
              marginBottom: '18px',
              border: '1px solid #333'
            }}>
              <span style={{ fontSize: '4rem' }}>🎬</span>
              <div style={{ fontSize: '1.1rem', color: '#FFD54F', marginTop: '10px', fontWeight: 700 }}>
                HD ट्रेलर स्ट्रीमिंग सक्रिय
              </div>
              <p style={{ color: '#888', fontSize: '0.84rem' }}>अधिकृत पार्टनर: YouTube / Zee Studios / Jio Cinema</p>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', color: '#FFB74D' }}>
              {selectedMovie.title} ({selectedMovie.year})
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#BBB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>रेटिंग:</strong> {selectedMovie.rating} | {selectedMovie.genre}</div>
              <div><strong>कलाकार:</strong> {selectedMovie.cast}</div>
              <div><strong>कथा:</strong> {selectedMovie.desc}</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert(`${selectedMovie.title} चा संपूर्ण चित्रपट अधिकृत ओटीटी प्लॅटफॉर्मवर उपलब्ध आहे.`)}
                style={{ flex: 1, background: '#E65100', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                चित्रपट पहा (Watch Now)
              </button>
              <button
                onClick={() => setWatchModal(false)}
                style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
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
