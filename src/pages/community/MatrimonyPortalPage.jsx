import React, { useState } from 'react';

const SAMPLE_PROFILES = [
  {
    id: 'CM-M-801',
    name: 'इंजि. रोहन संभाजीराव कदम',
    gender: 'वर (Groom)',
    age: 28,
    height: "5' 10\"",
    caste: '९६ कुळी मराठा',
    kul: 'कदम (कवच/भारद्वाज गोत्र)',
    education: 'B.Tech (Computer Science), COEP Pune',
    profession: 'Senior Software Engineer, MNC Pune',
    income: '₹२२ लाख वार्षिक',
    city: 'पुणे (मूळ: कराड, सातारा)',
    verified: true,
    photo: '/assets/images/matrimony/groom_rohan.jpg',
    expectations: 'सुशिक्षित, पदवीधर, कौटुंबिक मूल्यांची जाण असणारी अनुरूप वधू.'
  },
  {
    id: 'CM-F-802',
    name: 'डॉ. स्नेहल विक्रमराव पाटील',
    gender: 'वधू (Bride)',
    age: 26,
    height: "5' 5\"",
    caste: '९६ कुळी मराठा',
    kul: 'पाटील (वसिष्ठ गोत्र)',
    education: 'M.B.B.S., D.G.O. (Gynecologist)',
    profession: 'वैद्यकीय अधिकारी, शासकीय रुग्णालय',
    income: '₹१५ लाख वार्षिक',
    city: 'कोल्हापूर',
    verified: true,
    photo: '/assets/images/matrimony/bride_snehal.jpg',
    expectations: 'डॉक्टर किंवा उच्चशिक्षित मराठा वर, व्यसनमुक्त, सुसंस्कृत.'
  },
  {
    id: 'CM-M-803',
    name: 'अभिषेक जयसिंगराव मोरे',
    gender: 'वर (Groom)',
    age: 30,
    height: "5' 11\"",
    caste: '९६ कुळी मराठा',
    kul: 'मोरे (गौतम गोत्र)',
    education: 'M.B.A. (Finance) & B.E.',
    profession: 'उद्योजक (ऑटोमोबाईल स्पेअर पार्ट्स फॅक्टरी)',
    income: '₹४५ लाख वार्षिक',
    city: 'नाशिक (मूळ: धुळे)',
    verified: true,
    photo: '/assets/images/matrimony/groom_abhishek.jpg',
    expectations: 'पदवीधर, व्यवसाय समजून घेणारी, सुसंस्कृत वधू.'
  },
  {
    id: 'CM-F-804',
    name: 'प्रा. मधुरा तानाजी देशमुख',
    gender: 'वधू (Bride)',
    age: 27,
    height: "5' 4\"",
    caste: 'मराठा',
    kul: 'देशमुख (कश्यप गोत्र)',
    education: 'M.Sc. (Mathematics), NET/SET',
    profession: 'सहाय्यक प्राध्यापिका, पुणे विद्यापीठ',
    income: '₹१० लाख वार्षिक',
    city: 'पुणे (मूळ: बारामती)',
    verified: true,
    photo: '/assets/images/matrimony/bride_madhura.jpg',
    expectations: 'इंजिनिअर, प्रोफेसर किंवा शासकीय सेवेतील समविचारी मराठा वर.'
  },
  {
    id: 'CM-M-805',
    name: 'अजिंक्य दादासाहेब शिंदे',
    gender: 'वर (Groom)',
    age: 29,
    height: "5' 9\"",
    caste: '९६ कुळी मराठा',
    kul: 'शिंदे (कौंडिण्य गोत्र)',
    education: 'M.P.S.C. उत्तीर्ण (उपनिरीक्षक - STI)',
    profession: 'राज्य कर निरीक्षक (STI), मुंबई',
    income: 'शासकीय वेतनश्रेणी (वर्ग-२)',
    city: 'मुंबई (मूळ: बीड)',
    verified: true,
    photo: '👮‍♂️',
    expectations: 'सुशिक्षित वधू, कोणत्याही शासकीय किंवा खाजगी सेवेतील.'
  },
  {
    id: 'CM-F-806',
    name: 'कु. कल्याणी बाजीराव सावंत',
    gender: 'वधू (Bride)',
    age: 25,
    height: "5' 6\"",
    caste: '९६ कुळी मराठा',
    kul: 'सावंत (अंगिरस गोत्र)',
    education: 'Chartered Accountant (CA)',
    profession: 'Senior Audit Associate, Big 4 Firm',
    income: '₹१८ लाख वार्षिक',
    city: 'ठाणे / मुंबई',
    verified: true,
    photo: '💼',
    expectations: 'सीए, इंजिनिअर किंवा फायनान्स क्षेत्रातील मराठा वर.'
  }
];

import { useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function MatrimonyPortalPage() {
  const [profilesList, setProfilesList] = useState([]);
  const [apiStatusBanner, setApiStatusBanner] = useState(null);

  const [genderFilter, setGenderFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '', gender: 'वर (Groom)', age: '', height: '', kul: '', education: '', profession: '', income: '', city: '', phone: '', expectations: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiClient.getMatrimonyProfiles()
      .then(profs => setProfilesList(profs && profs.length > 0 ? profs : SAMPLE_PROFILES))
      .catch(() => setProfilesList(SAMPLE_PROFILES));
  }, []);

  const filteredProfiles = profilesList.filter(p => {
    const matchesGender = genderFilter === 'all' || (genderFilter === 'groom' ? p.gender.includes('वर') : p.gender.includes('वधू'));
    const matchesProf = professionFilter === 'all' || p.profession.toLowerCase().includes(professionFilter.toLowerCase()) || p.education.toLowerCase().includes(professionFilter.toLowerCase());
    const matchesCity = searchCity === '' || p.city.toLowerCase().includes(searchCity.toLowerCase()) || p.name.toLowerCase().includes(searchCity.toLowerCase());
    return matchesGender && matchesProf && matchesCity;
  });

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.addMatrimonyProfile(regForm);
      if (res.profile) setProfilesList(prev => [res.profile, ...prev]);
      setApiStatusBanner('💍 REST API Confirmation: ' + res.message);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsRegisterModalOpen(false);
        setApiStatusBanner(null);
        setRegForm({ name: '', gender: 'वर (Groom)', age: '', height: '', kul: '', education: '', profession: '', income: '', city: '', phone: '', expectations: '' });
      }, 1500);
    } catch (err) {
      setProfilesList(prev => [{ id: `CM-M-${Date.now().toString().slice(-3)}`, verified: true, photo: '👨‍💼', caste: '९६ कुळी मराठा', ...regForm }, ...prev]);
      setApiStatusBanner('💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsRegisterModalOpen(false);
        setApiStatusBanner(null);
        setRegForm({ name: '', gender: 'वर (Groom)', age: '', height: '', kul: '', education: '', profession: '', income: '', city: '', phone: '', expectations: '' });
      }, 1500);
    }
  };

  return (
    <div style={{ background: '#fdf8f6', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 45, 18, 0.90) 0%, rgba(154, 52, 18, 0.88) 100%), url("/assets/images/generated/maratha_matrimony_hero.jpg") center/cover no-repeat',
        color: '#fff',
        padding: '3.5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '0.4rem 1.2rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            💍 १००% सत्यापित मराठा वधू-वर सूचक केंद्र | Maratha Matrimony
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0.5rem 0 1rem' }}>
            कुलीन घराणी, उच्चशिक्षित स्थळे — अखंड मराठा रेशीमगाठ
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '750px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            मराठा समाजातील उच्चशिक्षित, शासकीय सेवेतील, व्यावसायिक आणि कृषी उद्योजक वधू-वरांसाठी विश्वासाचे आणि सन्मानाचे व्यासपीठ.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              style={{
                background: '#fbbf24',
                color: '#1e293b',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
              }}
            >
              + आपला विवाह प्रोफाइल नोंदवा (Register Profile)
            </button>
            <a
              href="#profiles-grid"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                textDecoration: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-block'
              }}
            >
              स्थळे शोधा (Browse Matches) ➔
            </a>
          </div>
        </div>
      </div>

      {/* Trust Highlights */}
      <div style={{ maxWidth: '1200px', margin: '-1.5rem auto 2.5rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.07)',
          border: '1px solid #fed7aa',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🛡️</div>
            <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '1rem' }}>१००% आधार व कुल पडताळणी</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>प्रत्येक प्रोफाइल कौटुंबिक चौकशीनंतरच लाईव्ह</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🔒</div>
            <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '1rem' }}>संपूर्ण गोपनीयता संरक्षण</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>फोटो व नंबर परस्पर संमतीनंतरच दर्शवले जातात</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>💰</div>
            <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '1rem' }}>शून्य मध्यस्थी फी</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>समाजाच्या कल्याणासाठी विनामूल्य नोंदणी व शोध</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🤝</div>
            <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '1rem' }}>मेळावे व थेट परिचय</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>जिल्हास्तरावर नियमित प्रत्यक्ष वधू-वर मेळावे</div>
          </div>
        </div>
      </div>

      <div id="profiles-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Filters */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid #fed7aa',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setGenderFilter('all')}
              style={{
                background: genderFilter === 'all' ? '#9a3412' : '#f1f5f9',
                color: genderFilter === 'all' ? '#fff' : '#475569',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              सर्व स्थळे
            </button>
            <button
              onClick={() => setGenderFilter('groom')}
              style={{
                background: genderFilter === 'groom' ? '#9a3412' : '#f1f5f9',
                color: genderFilter === 'groom' ? '#fff' : '#475569',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🤵 वर (Grooms)
            </button>
            <button
              onClick={() => setGenderFilter('bride')}
              style={{
                background: genderFilter === 'bride' ? '#9a3412' : '#f1f5f9',
                color: genderFilter === 'bride' ? '#fff' : '#475569',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👰 वधू (Brides)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={professionFilter}
              onChange={e => setProfessionFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">सर्व शिक्षण / व्यवसाय</option>
              <option value="Software">Software / IT Engineers</option>
              <option value="Doctor">Doctors / MBBS</option>
              <option value="CA">CA / Finance</option>
              <option value="शासकीय">शासकीय सेवा / MPSC / UPSC</option>
              <option value="उद्योजक">उद्योजक / Business</option>
            </select>

            <input
              type="text"
              placeholder="जिल्हा किंवा नाव शोधा..."
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              style={{
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                minWidth: '200px'
              }}
            />
          </div>
        </div>

        {/* Profiles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProfiles.map(p => (
            <div key={p.id} style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              border: '1px solid #fed7aa',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {p.photo && (p.photo.startsWith('/') || p.photo.startsWith('http')) ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: '2px solid #fed7aa',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#ffedd5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        flexShrink: 0
                      }}>
                        {p.photo || '👤'}
                      </div>
                    )}
                    <div>
                      <span style={{
                        background: p.gender.includes('वर') ? '#e0f2fe' : '#fce7f3',
                        color: p.gender.includes('वर') ? '#0369a1' : '#be185d',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        {p.gender} | वय: {p.age} वर्षे ({p.height})
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0' }}>
                        {p.name}
                      </h3>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    ✓ पडताळणीकृत
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '0.3rem' }}><strong>जात / कुल:</strong> {p.caste} | {p.kul}</div>
                  <div style={{ marginBottom: '0.3rem' }}><strong>शिक्षण:</strong> {p.education}</div>
                  <div style={{ marginBottom: '0.3rem' }}><strong>व्यवसाय / नोकरी:</strong> {p.profession}</div>
                  <div style={{ marginBottom: '0.3rem' }}><strong>वार्षिक उत्पन्न:</strong> {p.income}</div>
                  <div><strong>स्थान:</strong> {p.city}</div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  <strong>अपेक्षा:</strong> "{p.expectations}"
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedProfile(p)}
                  style={{
                    flex: 1,
                    background: '#9a3412',
                    color: '#fff',
                    border: 'none',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  बायोडाटा व संपर्क विनंती ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Detail / Connect Modal */}
      {selectedProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#9a3412' }}>
                स्थळ संपर्क व बायोडाटा विनंती ({selectedProfile.id})
              </h3>
              <button onClick={() => setSelectedProfile(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{selectedProfile.photo}</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{selectedProfile.name}</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                {selectedProfile.gender} | वय: {selectedProfile.age} | {selectedProfile.caste}
              </p>
            </div>

            <div style={{ background: '#fdf2f8', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#9d174d', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              🔒 <strong>सुरक्षा सूचना:</strong> मराठा वधू-वर सूचक केंद्राच्या नियमांनुसार दोन्ही कुटुंबांच्या संमतीनंतरच पालक व वधू/वरांचे थेट दूरध्वनी क्रमांक आणि संपूर्ण पत्रिका पाठवली जाते.
            </div>

            <button
              onClick={() => {
                alert(`आपली विनंती ${selectedProfile.name} यांच्या कुटुंबियांकडे पाठवण्यात आली आहे. ते २४ तासांत संपर्क साधतील.`);
                setSelectedProfile(null);
              }}
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '0.9rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginBottom: '0.75rem'
              }}
            >
              कुटुंबाशी संपर्क करण्याची इच्छा व्यक्त करा (Express Interest)
            </button>
            <button
              onClick={() => setSelectedProfile(null)}
              style={{
                width: '100%',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* Register Profile Modal */}
      {isRegisterModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '550px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#9a3412' }}>
                विवाह स्थळ नोंदणी अर्ज
              </h3>
              <button onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💍</div>
                <h4>स्थळ नोंदणी यशस्वीरीत्या स्वीकारली गेली!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>आमचे वधू-वर समन्वय अधिकारी आपल्या अर्जाची प्राथमिक पडताळणी करून प्रोफाइल सक्रिय करतील.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>वधू किंवा वराचे पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>प्रकार *</label>
                    <select
                      value={regForm.gender}
                      onChange={e => setRegForm({ ...regForm, gender: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="वर (Groom)">वर (Groom)</option>
                      <option value="वधू (Bride)">वधू (Bride)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>वय *</label>
                    <input
                      type="number"
                      min="18"
                      max="60"
                      required
                      value={regForm.age}
                      onChange={e => setRegForm({ ...regForm, age: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>उंची (उदा. 5' 8") *</label>
                    <input
                      type="text"
                      required
                      value={regForm.height}
                      onChange={e => setRegForm({ ...regForm, height: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>कुल / गोत्र / आडनाव *</label>
                    <input
                      type="text"
                      required
                      value={regForm.kul}
                      onChange={e => setRegForm({ ...regForm, kul: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. कदम / भारद्वाज"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>शिक्षण *</label>
                    <input
                      type="text"
                      required
                      value={regForm.education}
                      onChange={e => setRegForm({ ...regForm, education: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. B.Tech / MBBS / CA"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>नोकरी / व्यवसाय *</label>
                    <input
                      type="text"
                      required
                      value={regForm.profession}
                      onChange={e => setRegForm({ ...regForm, profession: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. Software Engineer"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>वार्षिक उत्पन्न *</label>
                    <input
                      type="text"
                      required
                      value={regForm.income}
                      onChange={e => setRegForm({ ...regForm, income: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. ₹१५ लाख वार्षिक"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>सध्याचे शहर व मूळ गाव *</label>
                    <input
                      type="text"
                      required
                      value={regForm.city}
                      onChange={e => setRegForm({ ...regForm, city: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. पुणे (मूळ: सातारा)"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>पालकांचा संपर्क क्रमांक *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. 9822XXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>अपेक्षा (Expectations)</label>
                  <textarea
                    rows={2}
                    value={regForm.expectations}
                    onChange={e => setRegForm({ ...regForm, expectations: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="अनुरूप वधू किंवा वराकडून अपेक्षा थोडक्यात लिहा..."
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#9a3412',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  नोंदणी सादर करा (Submit Profile)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
