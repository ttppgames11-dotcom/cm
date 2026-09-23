import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const INSPIRATIONAL_FIGURES = [
  {
    name: 'राष्ट्रमाता राजमाता जिजाऊ मासाहेब',
    title: 'स्वराज्य प्रेरिका व मार्गदर्शक',
    desc: 'छत्रपती शिवाजी महाराजांना स्वराज्याची प्रेरणा देणाऱ्या, न्यायप्रिय व कुशल प्रशासक राजमाता.',
    icon: '👑',
    tag: 'स्वराज्य प्रेरिका'
  },
  {
    name: 'महारानी ताराबाई भोसले',
    title: 'मुघल सत्ता निष्प्रभ करणारी रणरागिणी',
    desc: 'छत्रपती राजाराम महाराजांनंतर मराठा साम्राज्याची धुरा सांभाळत मुघल बादशहा औरंगजेबाला जेरीस आणणाऱ्या पराक्रमी महाराणी.',
    icon: '⚔️',
    tag: 'रणरागिणी'
  },
  {
    name: 'पुण्यश्लोक अहिल्याबाई होळकर',
    title: 'धर्मरक्षक व लोककल्याणकारी राज्यकर्ती',
    desc: 'संपूर्ण भारतात मंदिरे, धर्मशाळा, घाट व विहिरी बांधून आदर्श लोककल्याणकारी कारभार करणाऱ्या तत्वज्ञानी राणी.',
    icon: '🛕',
    tag: 'लोककल्याणकारी'
  },
  {
    name: 'डॉ. आनंदीबाई जोशी',
    title: 'भारतातील पहिल्या महिला डॉक्टर',
    desc: 'कठीण परिस्थितीत अमेरिकेत जाऊन वैद्यकीय पदवी संपादन करून भारतीय महिलांसाठी वैद्यकीय शिक्षणाचा मार्ग खुला करणाऱ्या विदुषी.',
    icon: '🩺',
    tag: 'वैद्यकीय प्रणेत्या'
  }
];

const FOCUS_AREAS = [
  {
    id: 'finance',
    title: 'आर्थिक स्वावलंबन व बचत गट',
    en: 'Financial Independence & SHGs',
    icon: '💰',
    desc: 'महिला बचत गटांना बिनव्याजी कर्ज, वित्तीय साक्षरता, मायक्रो फायनान्स आणि लघुउद्योग मार्गदर्शन.',
    stats: '१२,५००+ सक्रिय बचत गट'
  },
  {
    id: 'education',
    title: 'उच्च शिक्षण व कौशल्य प्रशिक्षण',
    en: 'Higher Education & Skill Tech',
    icon: '🎓',
    desc: 'मोफत स्पर्धा परीक्षा मार्गदर्शन, संगणक/डिजिटल कोर्सेस आणि मराठा मुलींसाठी शिष्यवृत्ती साहाय्य.',
    stats: '४५,०००+ विद्यार्थिनी लाभार्थ्या'
  },
  {
    id: 'health',
    title: 'महिला आरोग्य व सुरक्षितता',
    en: 'Health, Wellness & Safety',
    icon: '🏥',
    desc: 'कॅन्सर स्क्रिनिंग, सुदृढ माता-बाल संगोपन शिबिरे, मोफत सॅनिटरी पॅड्स आणि स्वसंरक्षण (कराटे/लाठी) प्रशिक्षण.',
    stats: '२५०+ आरोग्य शिबिरे'
  },
  {
    id: 'legal',
    title: 'कायदेशीर सल्ला व हक्क संरक्षण',
    en: 'Free Legal Aid & Rights',
    icon: '⚖️',
    desc: 'अनुभवी मराठा महिला वकिलांचे मोफत मार्गदर्शन, कौटुंबिक न्यायालय साहाय्य आणि मालमत्ता हक्कांची माहिती.',
    stats: '३,२००+ सोडवलेले प्रश्न'
  },
  {
    id: 'leadership',
    title: 'राजकीय व सामाजिक नेतृत्व',
    en: 'Leadership & Governance',
    icon: '🏛️',
    desc: 'ग्रामपंचायत, पंचायत समिती, जिल्हा परिषद व सहकार क्षेत्रात महिलांना सक्रिय सहभागासाठी नेतृत्व कार्यशाळा.',
    stats: '१,८००+ महिला लोकप्रतिनिधी'
  },
  {
    id: 'entrepreneurship',
    title: 'महिला उद्योजकता विकास',
    en: 'Women Entrepreneurship Hub',
    icon: '🚀',
    desc: 'गृहउद्योग, फूड प्रोसेसिंग, गारमेंट्स आणि ई-कॉमर्सद्वारे मराठा महिलांच्या उत्पादनांना राज्यव्यापी बाजारपेठ.',
    stats: '५,०००+ महिला उद्योजक'
  }
];

const SUCCESS_STORIES = [
  {
    name: 'सौ. सुवर्णा संभाजी जाधव',
    location: 'सातारा',
    field: 'जैविक शेती व दुग्धप्रक्रिया',
    achievement: 'वार्षिक ₹८५ लाखांची उलाढाल, ३५ ग्रामीण महिलांना कायमस्वरूपी रोजगार.',
    badge: 'यशस्वी कृषी उद्योजिका'
  },
  {
    name: 'अॅड. प्रज्ञा विक्रम पाटील',
    location: 'पुणे',
    field: 'कायदेशीर साहाय्य कक्ष',
    achievement: '१,२०० पेक्षा जास्त पीडित महिलांना मोफत न्याय व हक्क मिळवून दिले.',
    badge: 'समाजभूषण विधिज्ञ'
  },
  {
    name: 'कु. कल्याणी धनंजय मोहिते',
    location: 'कोल्हापूर',
    field: 'एमपीएससी उत्तीर्ण (उपजिल्हाधिकारी)',
    achievement: 'Connect Maratha अभ्यास केंद्रातून मार्गदर्शन घेऊन राज्यात ५ वी रँक.',
    badge: 'प्रशासकीय अधिकारी'
  },
  {
    name: 'सौ. वैशाली राजेंद्र कदम',
    location: 'छत्रपती संभाजीनगर',
    field: 'मसाले व खाद्यपदार्थ निर्यात',
    achievement: 'जिजाऊ बचत गटाच्या माध्यमातून दुबई व लंडनमध्ये मसाले निर्यात सुरू.',
    badge: 'ग्लोबल एक्स्पोर्टर'
  }
];

import { useToast } from '../../context/ToastContext';
import dataStore from '../../services/dataStore';

export default function WomenEmpowermentPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [helpForm, setHelpForm] = useState({ name: '', phone: '', city: '', needType: 'आर्थिक', description: '' });
  const [joinForm, setJoinForm] = useState({ name: '', phone: '', email: '', city: '', occupation: '', interest: 'मार्गदर्शक / मेंटॉर' });
  const [submitted, setSubmitted] = useState(false);

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    dataStore.addWomenHelpRequest(helpForm);
    setSubmitted(true);
    showToast('🚨 मदत व मार्गदर्शनाची विनंती नोंदवली गेली!', 'success');
    setTimeout(() => {
      setSubmitted(false);
      setIsHelpModalOpen(false);
      setHelpForm({ name: '', phone: '', city: '', needType: 'आर्थिक', description: '' });
    }, 1500);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('🌸 सक्षमीकरण चळवळीत सहभागाबद्दल धन्यवाद!', 'success');
    setTimeout(() => {
      setSubmitted(false);
      setIsJoinModalOpen(false);
      setJoinForm({ name: '', phone: '', email: '', city: '', occupation: '', interest: 'मार्गदर्शक / मेंटॉर' });
    }, 1500);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #e11d48 100%)',
        color: '#fff',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 1.2rem',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            🌸 राजमाता जिजाऊ महिला सक्षमीकरण अभियान | Women Empowerment
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, margin: '0.5rem 0 1rem', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            मराठा स्त्रीशक्ती — स्वाभिमान, नेतृत्व आणि समृद्धी
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '750px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            स्वराज्याची पायाभरणी राजमाता जिजाऊंच्या संस्कारांतून झाली. मराठा महिलांचे आर्थिक, सामाजिक, शैक्षणिक आणि व्यावसायिक सक्षमीकरण घडवण्यासाठी कनेक्ट मराठा कटिबद्ध आहे.
          </p>

          {/* 24/7 Helpline Card */}
          <div style={{
            background: '#ffffff',
            color: '#1e293b',
            padding: '1.25rem 2rem',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🚨</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                २४×७ महिला आणीबाणी हेल्पलाइन
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#9f1239', letterSpacing: '1px' }}>
                9090 112 112
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                कायदेशीर सल्ला | सुरक्षा साहाय्य | समुपदेशन कक्ष
              </div>
            </div>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: '#be185d',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              तातडीची मदत मागा ➔
            </button>
          </div>
        </div>
      </div>

      {/* Inspirational Historical Maratha Women */}
      <div style={{ maxWidth: '1200px', margin: '-2rem auto 3rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {INSPIRATIONAL_FIGURES.map((fig, idx) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.07)',
              border: '1px solid #fbcfe8',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{fig.icon}</span>
                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    background: '#fce7f3',
                    color: '#9d174d',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontWeight: 700
                  }}>
                    {fig.tag}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.25rem 0 0', color: '#1e293b' }}>
                    {fig.name}
                  </h3>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 600, marginBottom: '0.5rem' }}>
                {fig.title}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {fig.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Six Core Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            सक्षमीकरणाचे ६ मुख्य स्तंभ (Core Pillars)
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            महिलांना स्वावलंबी बनवण्यासाठी आर्थिक, शैक्षणिक, आरोग्य आणि कायदेशीर आघाड्यांवर एकात्मिक कार्यप्रणाली.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {FOCUS_AREAS.map((area) => (
            <div key={area.id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: '#fdf2f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}>
                    {area.icon}
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontWeight: 600
                  }}>
                    {area.stats}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  {area.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.75rem' }}>
                  {area.en}
                </div>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {area.desc}
                </p>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(true)}
                style={{
                  background: '#fdf2f8',
                  color: '#be185d',
                  border: '1px solid #fbcfe8',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  alignSelf: 'flex-start'
                }}
              >
                माहिती व लाभ घ्या ➔
              </button>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '4rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 700, textTransform: 'uppercase' }}>
                प्रेरणादायी प्रवास
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0' }}>
                मराठा कर्तृत्ववान महिलांच्या यशोगाथा
              </h2>
            </div>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              style={{
                background: '#be185d',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + आपली यशोगाथा पाठवा
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {SUCCESS_STORIES.map((story, idx) => (
              <div key={idx} style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: '#fce7f3',
                  color: '#9d174d',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem'
                }}>
                  {story.badge}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
                  {story.name}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  📍 {story.location} | {story.field}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  "{story.achievement}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Callout */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          borderRadius: '24px',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            तुम्हीही मराठा स्त्रीशक्तीच्या चळवळीत सहभागी व्हा!
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto 2rem' }}>
            मेंटॉर म्हणून तरुणींना मार्गदर्शन करा, बचत गटांना सहकार्य करा किंवा गरजवंत बहिणींना कायदेशीर/वैद्यकीय साहाय्य देण्यासाठी नोंदणी करा.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              style={{
                background: '#be185d',
                color: '#fff',
                border: 'none',
                padding: '0.9rem 2rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              सहभागी व्हा / मेंटॉर व्हा ➔
            </button>
            <Link
              to="/community"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                textDecoration: 'none',
                padding: '0.9rem 2rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-block'
              }}
            >
              कम्युनिटी फोरम पहा
            </Link>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {isHelpModalOpen && (
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
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#be185d' }}>
                मदत व मार्गदर्शन विनंती अर्ज
              </h3>
              <button onClick={() => setIsHelpModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <h4>आपली विनंती यशस्वीरित्या नोंदवली गेली!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>आमची महिला हेल्पलाइन टीम २४ तासांत आपल्याशी संपर्क करेल.</p>
              </div>
            ) : (
              <form onSubmit={handleHelpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={helpForm.name}
                    onChange={e => setHelpForm({ ...helpForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. स्नेहा संभाजी देशमुख"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={helpForm.phone}
                    onChange={e => setHelpForm({ ...helpForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा / शहर *</label>
                  <input
                    type="text"
                    required
                    value={helpForm.city}
                    onChange={e => setHelpForm({ ...helpForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. पुणे / सातारा / कोल्हापूर"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मदतीचे स्वरूप *</label>
                  <select
                    value={helpForm.needType}
                    onChange={e => setHelpForm({ ...helpForm, needType: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="आर्थिक">आर्थिक साहाय्य / बचत गट कर्ज</option>
                    <option value="कायदेशीर">कायदेशीर सल्ला व हक्क</option>
                    <option value="आरोग्य">आरोग्य / वैद्यकीय मदत</option>
                    <option value="शिक्षण">उच्च शिक्षण / शिष्यवृत्ती</option>
                    <option value="उद्योजकता">नवीन उद्योग / व्यवसाय मार्गदर्शन</option>
                    <option value="सुरक्षितता">कौटुंबिक समस्या / सुरक्षा</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>तपशील</label>
                  <textarea
                    rows={3}
                    value={helpForm.description}
                    onChange={e => setHelpForm({ ...helpForm, description: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="आपली अडचण किंवा प्रश्न थोडक्यात लिहा..."
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#be185d',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  अर्ज सादर करा (Submit Request)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Join Modal */}
      {isJoinModalOpen && (
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
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#be185d' }}>
                सक्षमीकरण चळवळीत सहभागी व्हा
              </h3>
              <button onClick={() => setIsJoinModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h4>नोंदणीबद्दल मनःपूर्वक धन्यवाद!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>आपल्या सहभागामुळे समाजात सकारात्मक बदल घडून येईल.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>नाव *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.name}
                    onChange={e => setJoinForm({ ...joinForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={joinForm.phone}
                    onChange={e => setJoinForm({ ...joinForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>शहर / जिल्हा *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.city}
                    onChange={e => setJoinForm({ ...joinForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>सहभागाची भूमिका *</label>
                  <select
                    value={joinForm.interest}
                    onChange={e => setJoinForm({ ...joinForm, interest: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="मार्गदर्शक / मेंटॉर">मार्गदर्शक / मेंटॉर (Career / Business Guide)</option>
                    <option value="कायदेशीर सल्लागार">मोफत कायदेशीर सल्लागार (Legal Aid Advocate)</option>
                    <option value="डॉक्टर / आरोग्य सहाय्यक">डॉक्टर / आरोग्य सहाय्यक (Medical Expert)</option>
                    <option value="बचत गट संघटक">बचत गट संघटक (SHG Organizer)</option>
                    <option value="स्वयंसेवक">सक्रिय स्वयंसेवक (Active Volunteer)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#be185d',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  नोंदणी निश्चित करा
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
