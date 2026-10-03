import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/apiClient';

const INSPIRATIONAL_FIGURES = [
  {
    name: 'राष्ट्रमाता राजमाता जिजाऊ मासाहेब',
    title: 'स्वराज्य प्रेरिका, नीतीशास्त्रज्ञ व मार्गदर्शक',
    desc: 'छत्रपती शिवाजी महाराजांना स्वराज्याची प्रेरणा देणाऱ्या, न्यायप्रिय व कुशल प्रशासक राजमाता. स्वराज्याचा संकल्प जिजाऊंच्या संस्कारांतून साकार झाला.',
    image: '/assets/images/real-jijabai-statue.jpg',
    fallbackImg: '/assets/images/real-jijabai-lal-mahal.jpg',
    tag: 'स्वराज्य प्रेरिका',
    period: '१५९८ – १६७४'
  },
  {
    name: 'महारानी ताराबाई भोसले',
    title: 'मुघल सत्ता निष्प्रभ करणारी पराक्रमी रणरागिणी',
    desc: 'छत्रपती राजाराम महाराजांनंतर मराठा साम्राज्याची धुरा समर्थपणे सांभाळत मुघल बादशहा औरंगजेबाला जेरीस आणणाऱ्या पराक्रमी सेनानी व राज्यकर्ती.',
    image: '/assets/images/maharani-tarabai.webp',
    fallbackImg: '/assets/images/real-tarabai-portrait.jpg',
    tag: 'रणरागिणी',
    period: '१६७५ – १७६१'
  },
  {
    name: 'पुण्यश्लोक अहिल्याबाई होळकर',
    title: 'धर्मरक्षक, मुत्सद्दी व आदर्श लोककल्याणकारी राणी',
    desc: 'संपूर्ण भारतात मंदिरे, घाट, विहिरी व धर्मशाळा बांधून आदर्श लोककल्याणकारी कारभार करणाऱ्या, शेतकऱ्यांना पाठबळ देणाऱ्या तत्वज्ञानी राज्यकर्ती.',
    image: '/assets/images/real-ahilyabai-holkar.jpg',
    fallbackImg: '/assets/images/real-ahilyabai-color-painting.jpg',
    tag: 'लोककल्याणकारी',
    period: '१७२५ – १७९५'
  },
  {
    name: 'डॉ. आनंदीबाई जोशी',
    title: 'भारतातील पहिल्या महिला डॉक्टर (M.D.)',
    desc: 'कठीण परिस्थितीत अमेरिकेत जाऊन वैद्यकीय पदवी संपादन करून भारतीय महिलांसाठी आधुनिक आरोग्य शिक्षणाचा मार्ग खुला करणाऱ्या विदुषी.',
    image: '/assets/images/real-anandibai-joshi-historical.jpg',
    fallbackImg: '/assets/images/historical-anandibai-joshi.jpg',
    tag: 'वैद्यकीय प्रणेत्या',
    period: '१८६५ – १८८७'
  }
];

const FOCUS_AREAS = [
  {
    id: 'finance',
    title: 'आर्थिक स्वावलंबन व बचत गट',
    en: 'Financial Independence & SHGs',
    image: '/assets/images/women-shg-finance.jpg',
    icon: '💰',
    desc: 'महिला बचत गटांना बिनव्याजी कर्ज, वित्तीय साक्षरता, मायक्रो फायनान्स आणि लघुउद्योग मार्गदर्शन. ग्रामीण व शहरी महिलांचे स्वबळावर सक्षमीकरण.',
    stats: '१२,५००+ सक्रिय बचत गट',
    actionText: 'कर्ज व योजना माहिती ➔'
  },
  {
    id: 'education',
    title: 'उच्च शिक्षण व कौशल्य प्रशिक्षण',
    en: 'Higher Education & Skill Tech',
    image: '/assets/images/women-higher-education.jpg',
    icon: '🎓',
    desc: 'मोफत स्पर्धा परीक्षा (MPSC/UPSC) मार्गदर्शन, IT व कोडिंग स्किल्स, व्यावसायिक प्रशिक्षण आणि मराठा विद्यार्थिनींसाठी शिष्यवृत्ती साहाय्य.',
    stats: '४५,०००+ विद्यार्थिनी लाभार्थ्या',
    actionText: 'शिष्यवृत्ती अर्ज ➔'
  },
  {
    id: 'health',
    title: 'महिला आरोग्य व सुरक्षितता',
    en: 'Health, Wellness & Safety',
    image: '/assets/images/women-health-wellness.jpg',
    icon: '🏥',
    desc: 'कॅन्सर स्क्रिनिंग, सुदृढ माता-बाल संगोपन शिबिरे, मोफत सॅनिटरी पॅड्स आणि मुलींसाठी स्वसंरक्षण (लाठी-काठी, ज्युडो-कराटे) विशेष प्रशिक्षण.',
    stats: '२५०+ मोफत आरोग्य शिबिरे',
    actionText: 'शिबिर वेळापत्रक ➔'
  },
  {
    id: 'legal',
    title: 'कायदेशीर सल्ला व हक्क संरक्षण',
    en: 'Free Legal Aid & Rights',
    image: '/assets/images/women-legal-counseling.jpg',
    icon: '⚖️',
    desc: 'अनुभवी मराठा महिला वकिलांचे मोफत मार्गदर्शन, कौटुंबिक न्यायालय साहाय्य, मालमत्ता व वारसा हक्क संरक्षण आणि गोपनीय कायदेशीर सल्ला.',
    stats: '३,२००+ सोडवलेले प्रश्न',
    actionText: 'वकिलांशी संपर्क ➔'
  },
  {
    id: 'leadership',
    title: 'राजकीय व सामाजिक नेतृत्व',
    en: 'Leadership & Governance',
    image: '/assets/images/women-leadership-summit.jpg',
    icon: '🏛️',
    desc: 'ग्रामपंचायत, पंचायत समिती, जिल्हा परिषद व सहकार क्षेत्रात महिलांना सक्रिय सहभागासाठी नेतृत्व विकास कार्यशाळा व प्रशासकीय मार्गदर्शन.',
    stats: '१,८००+ महिला लोकप्रतिनिधी',
    actionText: 'नेतृत्व कार्यशाळा ➔'
  },
  {
    id: 'entrepreneurship',
    title: 'महिला उद्योजकता विकास',
    en: 'Women Entrepreneurship Hub',
    image: '/assets/images/women-entrepreneur-hub.jpg',
    icon: '🚀',
    desc: 'गृहउद्योग, फूड प्रोसेसिंग, ऑरगॅनिक शेती, टेक्सटाईल आणि ई-कॉमर्सद्वारे मराठा महिलांच्या स्थानिक उत्पादनांना राष्ट्रीय व जागतिक बाजारपेठ.',
    stats: '५,०००+ महिला उद्योजक',
    actionText: 'उद्योजक नोंदणी ➔'
  }
];

const SUCCESS_STORIES = [
  {
    name: 'सौ. सुवर्णा संभाजी जाधव',
    location: 'सातारा',
    field: 'जैविक शेती व दुग्धप्रक्रिया',
    achievement: 'वार्षिक ₹८५ लाखांची उलाढाल, ३५ ग्रामीण महिलांना कायमस्वरूपी रोजगार उपलब्ध करून दिला.',
    badge: 'यशस्वी कृषी उद्योजिका',
    image: '/assets/images/story-suvarna-jadhav.jpg'
  },
  {
    name: 'अॅड. प्रज्ञा विक्रम पाटील',
    location: 'पुणे',
    field: 'कायदेशीर साहाय्य कक्ष',
    achievement: '१,२०० पेक्षा जास्त पीडित महिलांना कौटुंबिक व मालमत्ता हक्कांतून मोफत न्याय मिळवून दिला.',
    badge: 'समाजभूषण विधिज्ञ',
    image: '/assets/images/women-legal-counseling.jpg'
  },
  {
    name: 'कु. कल्याणी धनंजय मोहिते',
    location: 'कोल्हापूर',
    field: 'एमपीएससी उत्तीर्ण (उपजिल्हाधिकारी)',
    achievement: 'Connect Maratha अभ्यास केंद्रातून मार्गदर्शन घेऊन राज्यात ५ वी रँक पटकावून उपजिल्हाधिकारी पदी निवड.',
    badge: 'प्रशासकीय अधिकारी',
    image: '/assets/images/story-kalyani-mohite.jpg'
  },
  {
    name: 'सौ. वैशाली राजेंद्र कदम',
    location: 'छत्रपती संभाजीनगर',
    field: 'मसाले व खाद्यपदार्थ निर्यात',
    achievement: 'जिजाऊ बचत गटाच्या माध्यमातून दुबई, लंडन आणि अमेरिकेत अस्सल मराठमोळे मसाले व डाळी निर्यात सुरू.',
    badge: 'ग्लोबल एक्स्पोर्टर',
    image: '/assets/images/women-entrepreneur-hub.jpg'
  }
];

export default function WomenEmpowermentPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [helpForm, setHelpForm] = useState({ name: '', phone: '', city: '', needType: 'आर्थिक', description: '' });
  const [joinForm, setJoinForm] = useState({ name: '', phone: '', email: '', city: '', occupation: '', interest: 'मार्गदर्शक / मेंटॉर' });
  const [submitted, setSubmitted] = useState(false);

  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addWomenHelpRequest({
        name: helpForm.name,
        subject: `${helpForm.name} (${helpForm.needType}) - ${helpForm.city}`,
        category: helpForm.needType,
        description: helpForm.description,
        phone: helpForm.phone
      });
      setSubmitted(true);
      showToast('🚨 मदत व मार्गदर्शनाची विनंती यशस्वीरीत्या नोंदवली गेली!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setIsHelpModalOpen(false);
        setHelpForm({ name: '', phone: '', city: '', needType: 'आर्थिक', description: '' });
      }, 1500);
    } catch (err) {
      showToast(err.message || 'विनंती अयशस्वी', 'error');
    }
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
    <div style={{ background: '#FBF5EC', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* Premium Hero Banner Displaying the Beautiful Historical & Empowerment Artwork */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1240px',
        margin: '1.5rem auto 0',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)',
        border: '2px solid rgba(251, 207, 232, 0.6)'
      }}>
        <img
          src="/assets/images/women-empowerment-hero.jpg"
          alt="मराठा सक्षमीकरण: कर्तृत्व, शौर्य आणि सन्मान"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* 24/7 Helpline & Empowerment Bar - Positioned cleanly below the banner */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto 2.5rem', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{
          background: '#ffffff',
          color: '#1e293b',
          padding: '1.5rem 2.5rem',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          boxShadow: '0 12px 30px -5px rgba(159, 18, 57, 0.12)',
          flexWrap: 'wrap',
          border: '2px solid #FBCFE8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FDF2F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              border: '2px solid #F472B6',
              flexShrink: 0
            }}>
              🚨
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                २४×७ मराठा महिला आणीबाणी हेल्पलाइन
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#9f1239', letterSpacing: '1px', lineHeight: 1.15 }}>
                9090 112 112
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '3px' }}>
                कायदेशीर संरक्षण • सुरक्षितता साहाय्य • मोफत समुपदेशन कक्ष
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.95rem 2rem',
                borderRadius: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '1.05rem',
                boxShadow: '0 8px 18px rgba(190, 24, 93, 0.35)',
                transition: 'transform 0.2s'
              }}
            >
              तातडीची मदत मागा ➔
            </button>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              style={{
                background: '#FFF1F2',
                color: '#be185d',
                border: '1.5px solid #F43F5E',
                padding: '0.95rem 1.8rem',
                borderRadius: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
            >
              चळवळीत सहभागी व्हा 🌸
            </button>
          </div>
        </div>
      </div>

      {/* Inspirational Historical Maratha Women Section with Real Portraits */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 3.5rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {INSPIRATIONAL_FIGURES.map((fig, idx) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 12px 24px -4px rgba(0,0,0,0.08)',
              border: '1px solid #FBCFE8',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              {/* Historical Figure Portrait Image */}
              <div style={{ position: 'relative', height: '220px', background: '#FDF2F8', overflow: 'hidden' }}>
                <img
                  src={fig.image}
                  alt={fig.name}
                  onError={(e) => {
                    if (fig.fallbackImg && e.target.src !== fig.fallbackImg) {
                      e.target.src = fig.fallbackImg;
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    transition: 'transform 0.3s'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)'
                }} />

                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '0.75rem',
                  background: 'rgba(255,255,255,0.92)',
                  color: '#9d174d',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  {fig.tag}
                </span>

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '14px',
                  right: '14px',
                  color: '#fff'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#FCE7F3', fontWeight: 600 }}>
                    {fig.period}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    {fig.name}
                  </h3>
                </div>
              </div>

              {/* Content Box */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#be185d', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {fig.title}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                    {fig.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Six Core Pillars with Rich Real Photos */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            background: '#FCE7F3',
            color: '#BE185D',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            सामूहिक प्रगतीची ६ दालने
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1e293b', margin: '0.5rem 0 0.5rem', fontFamily: 'Baloo 2' }}>
            सक्षमीकरणाचे ६ मुख्य स्तंभ (Core Pillars)
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            मराठा महिलांना स्वावलंबी बनवण्यासाठी आर्थिक, शैक्षणिक, आरोग्य, नेतृत्व, कायदेशीर आणि औद्योगिक आघाड्यांवर एकात्मिक कार्यप्रणाली.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.75rem',
          marginBottom: '4.5rem'
        }}>
          {FOCUS_AREAS.map((area) => (
            <div key={area.id} style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.25s, box-shadow 0.25s'
            }}>
              <div>
                {/* Pillar Card Image with Stats Overlay */}
                <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                  <img
                    src={area.image}
                    alt={area.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%)'
                  }} />

                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '14px',
                    fontSize: '0.82rem',
                    background: '#BE185D',
                    color: '#fff',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '999px',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {area.stats}
                  </span>

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {area.icon}
                  </div>
                </div>

                {/* Pillar Card Details */}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    {area.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.85rem' }}>
                    {area.en}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
                    {area.desc}
                  </p>
                </div>
              </div>

              {/* Card Footer Button */}
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <button
                  onClick={() => setIsHelpModalOpen(true)}
                  style={{
                    width: '100%',
                    background: '#FDF2F8',
                    color: '#be185d',
                    border: '1.5px solid #FBCFE8',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {area.actionText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Success Stories with Real Portraits & District Highlights */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '2.75rem 2rem',
          boxShadow: '0 12px 28px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0',
          marginBottom: '4.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🌟 प्रेरणादायी प्रवास
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0.3rem 0 0', fontFamily: 'Baloo 2' }}>
                मराठा कर्तृत्ववान महिलांच्या यशोगाथा
              </h2>
            </div>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 14px rgba(190, 24, 93, 0.3)'
              }}
            >
              + आपली यशोगाथा पाठवा
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {SUCCESS_STORIES.map((story, idx) => (
              <div key={idx} style={{
                background: '#FDFCFB',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid #E8E5E0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Story Image */}
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={story.image}
                    alt={story.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#FCE7F3',
                    color: '#9D174D',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    {story.badge}
                  </div>
                </div>

                {/* Story Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
                      {story.name}
                    </h4>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 600 }}>
                      📍 {story.location} | {story.field}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                      "{story.achievement}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Callout with Modern Layout */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          borderRadius: '24px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', fontFamily: 'Baloo 2' }}>
            तुम्हीही मराठा स्त्रीशक्तीच्या चळवळीत सहभागी व्हा!
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', maxWidth: '720px', margin: '0 auto 2.25rem', lineHeight: 1.65 }}>
            मार्गदर्शक (मेंटॉर) म्हणून मराठा तरुणींना करिअर मार्गदर्शन करा, महिला बचत गटांना व्यवसाय सहकार्य द्या किंवा गरजू भगिनींना कायदेशीर व वैद्यकीय साहाय्य देण्यासाठी नोंदणी करा.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
                color: '#fff',
                border: 'none',
                padding: '1rem 2.2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(190, 24, 93, 0.4)'
              }}
            >
              सहभागी व्हा / मेंटॉर व्हा ➔
            </button>
            <Link
              to="/community"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                textDecoration: 'none',
                padding: '1rem 2.2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
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
          background: 'rgba(0,0,0,0.65)',
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
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#be185d' }}>
                मदत व मार्गदर्शन विनंती अर्ज
              </h3>
              <button onClick={() => setIsHelpModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>आपली विनंती यशस्वीरित्या नोंदवली गेली!</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>आमची महिला हेल्पलाइन टीम २४ तासांत आपल्याशी संपर्क करेल.</p>
              </div>
            ) : (
              <form onSubmit={handleHelpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={helpForm.name}
                    onChange={e => setHelpForm({ ...helpForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="उदा. स्नेहा संभाजी देशमुख"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={helpForm.phone}
                    onChange={e => setHelpForm({ ...helpForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>जिल्हा / शहर *</label>
                  <input
                    type="text"
                    required
                    value={helpForm.city}
                    onChange={e => setHelpForm({ ...helpForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="उदा. पुणे / सातारा / कोल्हापूर"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>मदतीचे स्वरूप *</label>
                  <select
                    value={helpForm.needType}
                    onChange={e => setHelpForm({ ...helpForm, needType: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  >
                    <option value="आर्थिक">आर्थिक साहाय्य / बचत गट कर्ज</option>
                    <option value="कायदेशीर">कायदेशीर सल्ला व हक्क संरक्षण</option>
                    <option value="आरोग्य">आरोग्य / वैद्यकीय मदत</option>
                    <option value="शिक्षण">उच्च शिक्षण / शिष्यवृत्ती</option>
                    <option value="उद्योजकता">नवीन उद्योग / व्यवसाय मार्गदर्शन</option>
                    <option value="सुरक्षितता">कौटुंबिक समस्या / सुरक्षा कक्ष</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>तपशील</label>
                  <textarea
                    rows={3}
                    value={helpForm.description}
                    onChange={e => setHelpForm({ ...helpForm, description: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="आपली अडचण किंवा प्रश्न थोडक्यात लिहा..."
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#be185d',
                    color: '#fff',
                    border: 'none',
                    padding: '0.95rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '1rem',
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
          background: 'rgba(0,0,0,0.65)',
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
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#be185d' }}>
                सक्षमीकरण चळवळीत सहभागी व्हा
              </h3>
              <button onClick={() => setIsJoinModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>नोंदणीबद्दल मनःपूर्वक धन्यवाद!</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>आपल्या सहभागामुळे समाजात सकारात्मक बदल घडून येईल.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>नाव *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.name}
                    onChange={e => setJoinForm({ ...joinForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="उदा. प्रियांका कदम"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={joinForm.phone}
                    onChange={e => setJoinForm({ ...joinForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>शहर / जिल्हा *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.city}
                    onChange={e => setJoinForm({ ...joinForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    placeholder="उदा. पुणे / मुंबई / नाशिक"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>सहभागाची भूमिका *</label>
                  <select
                    value={joinForm.interest}
                    onChange={e => setJoinForm({ ...joinForm, interest: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
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
                    padding: '0.95rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '1rem',
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
