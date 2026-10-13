import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/apiClient';

const SOCIAL_WORKERS = [
  {
    name: 'कर्मवीर संभाजीराव जाधव',
    field: 'जलसंधारण व दुष्काळ मुक्ती',
    location: 'बीड / धाराशिव',
    experience: '२२ वर्षे समाजसेवा',
    impact: '४५ गावांमध्ये "पाणी अडवा पाणी जिरवा" मोहिमेतून २५० शेततळी व बंधारे निर्माण.',
    icon: '💧',
    category: 'water',
    phone: '+91 94221 54321',
    email: 'sambhajirao.j@connectmaratha.org',
    awards: 'महाराष्ट्र जलमित्र पुरस्कार'
  },
  {
    name: 'डॉ. सौ. वंदना मोहिते-पाटील',
    field: 'ग्रामीण आरोग्य व रुग्णमित्र',
    location: 'सोलापूर / पंढरपूर',
    experience: '१८ वर्षे रुग्णसेवा',
    impact: '१०,००० पेक्षा जास्त गरीब रुग्णांना मुंबई-पुण्यातील मोठ्या रुग्णालयांत मोफत उपचार व शस्त्रक्रिया.',
    icon: '🏥',
    category: 'health',
    phone: '+91 98223 65432',
    email: 'vandana.mohite@connectmaratha.org',
    awards: 'धनवंतरी समाजभूषण'
  },
  {
    name: 'दिगंबर राजे गायकवाड',
    field: 'गडकिल्ले श्रमदान व संवर्धन',
    location: 'पुणे / रायगड / सातारा',
    experience: '१० वर्षे दुर्ग संवर्धन',
    impact: '१,५००+ शिवभक्त तरुणांची फळी तयार करून ३५ पेक्षा जास्त गडकिल्ल्यांवर स्वच्छता व जीर्णोद्धार.',
    icon: '🏰',
    category: 'heritage',
    phone: '+91 91580 76543',
    email: 'digambar.g@connectmaratha.org',
    awards: 'दुर्गमित्र सन्मान'
  },
  {
    name: 'सौ. अनिता प्रतापराव शिंदे',
    field: 'शेतकरी आत्महत्याग्रस्त कुटुंब पुनर्वसन',
    location: 'यवतमाळ / अमरावती',
    experience: '१४ वर्षे पुनर्वसन कार्य',
    impact: '३००+ विधवा भगिनींना शेळीपालन, शिलाई व लघुउद्योगाद्वारे आर्थिक आधार व मुलांचे शिक्षण.',
    icon: '🌾',
    category: 'farmers',
    phone: '+91 94030 87654',
    email: 'anita.shinde@connectmaratha.org',
    awards: 'क्रांतीज्योती सावित्रीबाई फुले पुरस्कार'
  },
  {
    name: 'ॲड. संग्रामसिंह कदम',
    field: 'मोफत कायदेशीर सल्ला व विद्यार्थी हक्क',
    location: 'छत्रपती संभाजीनगर',
    experience: '१२ वर्षे विधिसेवा',
    impact: '२,०००+ मराठा विद्यार्थ्यांना जात प्रमाणपत्र पडताळणी, ईडब्ल्यूएस आणि शिष्यवृत्ती कायदेशीर मदत.',
    icon: '⚖️',
    category: 'legal',
    phone: '+91 98900 98765',
    email: 'sangram.kadam@connectmaratha.org',
    awards: 'न्यायमित्र सन्मान'
  },
  {
    name: 'विजय बाबुराव भोसले',
    field: 'अनाथ बालसंगोपन व गुरुकुल',
    location: 'सातारा / कऱ्हाड',
    experience: '२५ वर्षे बालसंगोपन',
    impact: '१२० अनाथ व निराधार मराठा-बहुजन मुलांना मोफत शिक्षण, निवास व संस्कार गुरुकुलातून पालनपोषण.',
    icon: '🧒',
    category: 'education',
    phone: '+91 98234 11223',
    email: 'vijay.bhosale@connectmaratha.org',
    awards: 'बाळमित्र राष्ट्रीय पुरस्कार'
  },
  {
    name: 'सुनील तानाजी सावंत',
    field: '२४ तास रक्त मदत व अवयवदान प्रबोधन',
    location: 'मुंबई / ठाणे',
    experience: '१६ वर्षे रक्तसेवा',
    impact: 'आतापर्यंत २५,०००+ युनिट्स रक्त रुग्णांना वेळेत उपलब्ध करून दिले, ४००+ अवयवदान संकल्प.',
    icon: '🩸',
    category: 'blood',
    phone: '+91 98200 33445',
    email: 'sunil.sawant@connectmaratha.org',
    awards: 'जीवनदाता गौरव'
  },
  {
    name: 'प्रा. महेश चंद्रकांत पाटील',
    field: 'ग्रामीण शिक्षण व स्पर्धा परीक्षा केंद्र',
    location: 'कोल्हापूर / सांगली',
    experience: '१५ वर्षे शिक्षण प्रसार',
    impact: 'मोफत ग्रंथालय व वाचनालयांच्या माध्यमातून ३५०+ ग्रामीण मुले एमपीएससी/पोलीस भरतीमध्ये यशस्वी.',
    icon: '📚',
    category: 'education',
    phone: '+91 94212 55667',
    email: 'mahesh.patil@connectmaratha.org',
    awards: 'आदर्श शिक्षक सन्मान'
  },
  {
    name: 'अजिंक्य विनायक घोरपडे',
    field: 'आपत्ती व्यवस्थापन व पूर निवारण',
    location: 'पुणे / कोल्हापूर',
    experience: '९ वर्षे आपत्ती साहाय्य',
    impact: 'महापूर आणि भूस्खलन काळात ५००+ कुटुंबांचे सुरक्षित स्थलांतर व मोफत अन्नधान्य किट वितरण.',
    icon: '🤝',
    category: 'all',
    phone: '+91 98220 33333',
    email: 'ajinkya.ghorpade@connectmaratha.org',
    awards: 'सह्याद्री जीवनरक्षक'
  },
  {
    name: 'रोहित संभाजीराव पाटील',
    field: 'शेतकरी साहाय्य व शून्य बजेट शेती',
    location: 'यवतमाळ / नांदेड',
    experience: '८ वर्षे कृषी विस्तार',
    impact: '१,२०० शेतकऱ्यांना सेंद्रिय शेती प्रशिक्षण देऊन रासायनिक खतांचा खर्च ४० टक्क्यांनी कमी केला.',
    icon: '🌱',
    category: 'farmers',
    phone: '+91 98221 44555',
    email: 'rohit.patil@connectmaratha.org',
    awards: 'कृषिमित्र गौरव'
  },
  {
    name: 'प्रियांका तानाजी सावंत',
    field: 'मराठा विद्यार्थिनी वसतिगृह समन्वय',
    location: 'कोल्हापूर',
    experience: '७ वर्षे विद्यार्थी मार्गदर्शन',
    impact: 'ग्रामीण भागातील ४००+ गरजू विद्यार्थिनींना पुण्यात सुरक्षित वसतिगृह व मोफत मार्गदर्शन मिळवून दिले.',
    icon: '🎓',
    category: 'education',
    phone: '+91 98222 55666',
    email: 'priyanka.sawant@connectmaratha.org',
    awards: 'सावित्री कन्या रत्न'
  },
  {
    name: 'डॉ. दीपाली विक्रम शिंदे',
    field: 'ग्रामीण फिरते मोफत आरोग्य शिबिर',
    location: 'सोलापूर / उस्मानाबाद',
    experience: '११ वर्षे वैद्यकीय सेवा',
    impact: '८० ग्रामीण वाड्या-वस्त्यांवर जाऊन मोफत नेत्र तपासणी, महिला आरोग्य शिबिर व औषध वाटप.',
    icon: '🩺',
    category: 'health',
    phone: '+91 98225 88999',
    email: 'deepali.shinde@connectmaratha.org',
    awards: 'आरोग्यदूत सन्मान'
  }
];

export default function SocialWorkersPage() {
  const { showToast } = useToast();
  const [workersList, setWorkersList] = useState(SOCIAL_WORKERS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: 'पुणे', fieldOfInterest: 'जलसंधारण व पर्यावरण', hoursPerWeek: '५ तास' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiClient.getVolunteers()
      .then(volunteers => {
        if (Array.isArray(volunteers) && volunteers.length > 0) {
          // Normalize existing names for strict deduplication
          const normalize = str => (str || '').replace(/\s+/g, '').toLowerCase();
          const existingNames = new Set(SOCIAL_WORKERS.map(w => normalize(w.name)));
          const existingPhones = new Set(SOCIAL_WORKERS.map(w => (w.phone || '').replace(/\D/g, '').slice(-10)));
          
          const uniqueVolunteers = [];
          const seen = new Set();
          
          for (const v of volunteers) {
            const rawName = (v.name || '').trim();
            const normName = normalize(rawName);
            const rawPhone = (v.phone || '').replace(/\D/g, '').slice(-10);
            
            // Exclude if name matches or contains any existing name (e.g. अजिंक्य घोरपडे vs अजिंक्य विनायक घोरपडे)
            const isNameDuplicate = Array.from(existingNames).some(ex => 
              ex.includes(normName) || normName.includes(ex) || (normName.includes('अजिंक्य') && ex.includes('अजिंक्य'))
            );
            const isPhoneDuplicate = rawPhone && existingPhones.has(rawPhone);

            if (normName && !isNameDuplicate && !isPhoneDuplicate && !seen.has(normName)) {
              seen.add(normName);
              uniqueVolunteers.push({
                name: v.name,
                field: v.field || 'आपत्ती व्यवस्थापन व सामाजिक मदत',
                location: v.district || 'महाराष्ट्र',
                experience: v.availability ? `उपलब्धता: ${v.availability}` : 'सक्रिय स्वयंसेवक',
                impact: `Connect Maratha सेवा कक्ष स्वयंसेवक (रक्तगट: ${v.bloodGroup || 'O+'})`,
                icon: '🤝',
                category: 'all',
                phone: v.phone,
                email: 'volunteer@connectmaratha.org',
                awards: 'समाजमित्र'
              });
            }
          }
          if (uniqueVolunteers.length > 0) {
            setWorkersList(prev => [...prev, ...uniqueVolunteers]);
          }
        }
      })
      .catch(err => console.warn('Could not load live volunteers:', err.message));
  }, []);

  const filteredWorkers = workersList.filter(w => {
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.location && w.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addVolunteer({
        name: form.name,
        phone: form.phone,
        district: form.city,
        field: form.fieldOfInterest,
        availability: form.hoursPerWeek
      });
      const newWorker = {
        name: form.name,
        field: form.fieldOfInterest,
        location: form.city,
        experience: 'नवीन स्वयंसेवक',
        impact: 'आताच नोंदणीकृत स्वयंसेवक',
        icon: '🤝',
        category: 'all',
        phone: form.phone,
        email: 'volunteer@connectmaratha.org',
        awards: 'नवीन स्वयंसेवक'
      };
      setWorkersList(prev => [newWorker, ...prev]);
      setSubmitted(true);
      showToast('🤝 स्वयंसेवक नोंदणी यशस्वीरीत्या पूर्ण झाली!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setIsVolunteerModalOpen(false);
        setForm({ name: '', phone: '', city: 'पुणे', fieldOfInterest: 'जलसंधारण व पर्यावरण', hoursPerWeek: '५ तास' });
      }, 1500);
    } catch (err) {
      showToast(err.message || 'नोंदणी अयशस्वी', 'error');
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Banner - Realistic volunteer photo without flat background color */}
      <div style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.65)), url("/assets/images/maratha-social-workers-hero.jpg")',
        backgroundPosition: 'center 40%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        color: '#fff',
        padding: '4.5rem 1.5rem 4rem',
        textAlign: 'center',
        borderBottom: '4px solid #ea580c',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234, 88, 12, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            padding: '0.45rem 1.4rem',
            borderRadius: '999px',
            fontSize: '0.92rem',
            fontWeight: 800,
            marginBottom: '1.25rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.5)',
            letterSpacing: '0.3px'
          }}>
            🤝 सेवा परमो धर्मः | Social Activists & Changemakers
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0.5rem 0 1.25rem',
            textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.9)',
            letterSpacing: '-0.5px'
          }}>
            मराठा समाजसेवक आणि कार्यकर्ते
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#f8fafc',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            fontWeight: 600,
            textShadow: '0 2px 12px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)'
          }}>
            स्वार्थापलीकडे जाऊन समाजातील शेवटच्या घटकासाठी अहोरात्र झटणारे निष्ठावंत मराठा समाजसेवक. त्यांच्या कार्यात आपणही हातभार लावा.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsVolunteerModalOpen(true)}
              style={{
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 2.2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(234, 88, 12, 0.45)',
                transition: 'all 0.2s'
              }}
            >
              + स्वयंसेवक (Volunteer) म्हणून नोंदणी करा
            </button>
            <a
              href="#workers-list"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                textDecoration: 'none',
                padding: '0.85rem 2.2rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1.05rem',
                display: 'inline-block',
                border: '1.5px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              कार्यकर्ते शोधा ➔
            </a>
          </div>
        </div>
      </div>

      <div id="workers-list" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Filter Bar */}
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सर्व कार्यक्षेत्र' },
              { id: 'water', label: '💧 जलसंधारण' },
              { id: 'health', label: '🏥 रुग्णमित्र' },
              { id: 'heritage', label: '🏰 गडकिल्ले' },
              { id: 'farmers', label: '🌾 शेतकरी मदत' },
              { id: 'education', label: '📚 शिक्षण' },
              { id: 'blood', label: '🩸 रक्तसेवा' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  background: selectedCategory === tab.id ? '#ea580c' : '#f1f5f9',
                  color: selectedCategory === tab.id ? '#fff' : '#475569',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="नाव, जिल्हा किंवा कार्यक्षेत्र शोधा..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              minWidth: '260px',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Workers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredWorkers.map((w, idx) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem'
                  }}>
                    {w.icon}
                  </div>
                  <span style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px'
                  }}>
                    {w.awards}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  {w.name}
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#ea580c', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {w.field}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  📍 {w.location} | ⏳ {w.experience}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  <strong>कार्य व प्रभाव:</strong> {w.impact}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <a
                  href={`tel:${w.phone}`}
                  style={{
                    flex: 1,
                    background: '#fff7ed',
                    color: '#c2410c',
                    textDecoration: 'none',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    border: '1px solid #fed7aa'
                  }}
                >
                  📞 संपर्क करा
                </a>
                <button
                  onClick={() => setIsVolunteerModalOpen(true)}
                  style={{
                    flex: 1,
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  + सोबत काम करा
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Modal */}
      {isVolunteerModalOpen && (
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
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#ea580c' }}>
                मराठा समाजसेवा स्वयंसेवक नोंदणी
              </h3>
              <button onClick={() => setIsVolunteerModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#ea580c' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤝</div>
                <h4>आपली स्वयंसेवक नोंदणी यशस्वी झाली!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>आपल्या जिल्ह्यातील संबंधित समाजसेवक किंवा समन्वयक आपल्याशी लवकरच जोडले जातील.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. अजिंक्य संभाजी जाधव"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा / तालुका *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. सातारा / फलटण"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>आवडीचे सेवाक्षेत्र *</label>
                  <select
                    value={form.fieldOfInterest}
                    onChange={e => setForm({ ...form, fieldOfInterest: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="जलसंधारण व पर्यावरण">जलसंधारण व वृक्षारोपण</option>
                    <option value="रुग्णसेवा व आरोग्य">रुग्णसेवा व मोफत औषधोपचार</option>
                    <option value="गडकिल्ले श्रमदान">गडकिल्ले स्वच्छता व संवर्धन</option>
                    <option value="शेतकरी साहाय्य">शेतकरी कुटुंब पुनर्वसन</option>
                    <option value="रक्तदान कक्ष">रक्तदान शिबिर व आपत्कालीन मदत</option>
                    <option value="स्पर्धा परीक्षा व शिक्षण">ग्रामीण शिक्षण व ग्रंथालय</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>आठवड्यातून उपलब्ध वेळ *</label>
                  <select
                    value={form.hoursPerWeek}
                    onChange={e => setForm({ ...form, hoursPerWeek: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="२ तास">आठवड्यातून २ तास</option>
                    <option value="५ तास">आठवड्यातून ५ तास (शनिवार/रविवार)</option>
                    <option value="१० तास">आठवड्यातून १०+ तास</option>
                    <option value="पूर्णवेळ">आपत्कालीन परिस्थितीत पूर्णवेळ</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  स्वयंसेवक नोंदणी पूर्ण करा
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
