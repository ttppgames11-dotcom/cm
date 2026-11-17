import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CURRENT_ISSUE } from '../../data/magazineData';
import '../../styles/magazine.css';

export default function MagazineDigitalReaderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page'), 10);
  const [currentPage, setCurrentPage] = useState(!isNaN(initialPage) && initialPage >= 1 && initialPage <= 10 ? initialPage : 1);
  const totalPages = CURRENT_ISSUE.totalPages || 10;

  useEffect(() => {
    const pageParam = parseInt(searchParams.get('page'), 10);
    if (!isNaN(pageParam) && pageParam >= 1 && pageParam <= 10) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  const pageData = CURRENT_ISSUE.pages.find(p => p.pageNumber === currentPage) || CURRENT_ISSUE.pages[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = CURRENT_ISSUE.pdfUrl;
    link.download = `connect-maratha-magazine-${CURRENT_ISSUE.slug}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================
  // RENDER DEDICATED INDIVIDUAL EDITORIAL LAYOUT FOR EACH OF THE 10 PAGES
  // ============================================================
  const renderEditorialPageContent = () => {
    switch (currentPage) {
      
      // ----------------------------------------------------
      // PAGE 1: COVER STORY (Ultra-Premium Master Editorial Experience)
      // ----------------------------------------------------
      case 1:
        return (
          <div className="cm-page-cover-container" style={{
            background: '#FFFFFF',
            borderRadius: '28px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 24px 64px -16px rgba(230, 81, 0, 0.16), 0 4px 16px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            
            {/* 1. Master Publication Masthead Strip */}
            <div style={{
              background: 'linear-gradient(135deg, #7F1D1D 0%, #C73800 45%, #E65100 100%)',
              padding: '24px 36px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              borderBottom: '4px solid #FFB74D',
              boxShadow: '0 6px 20px rgba(199, 56, 0, 0.25)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    background: '#FBBF24',
                    color: '#78350F',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    ⭐ EXCLUSIVE COVER STORY
                  </span>
                  <span style={{ color: '#FED7AA', fontSize: '0.8rem', fontWeight: 700 }}>
                    नोव्हेंबर २०२६ विशेषांक
                  </span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  CONNECT मराठा MAGAZINE
                </h1>
                <p style={{ color: '#FFE0B2', fontSize: '0.86rem', margin: '3px 0 0', fontWeight: 600 }}>
                  युवा • उद्योजकता • व्यवसाय • संधी • संस्कृती
                </p>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFE0B2', letterSpacing: '0.5px' }}>
                  वर्ष १ | अंक १ (उद्घाटन विशेषांक)
                </span>
                <span style={{
                  background: '#FFFFFF',
                  color: '#C73800',
                  fontWeight: 900,
                  fontSize: '0.84rem',
                  padding: '5px 16px',
                  borderRadius: '9999px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E65100' }}></span>
                  पान १ (कव्हर स्टोरी)
                </span>
              </div>
            </div>

            {/* 2. Cover Story Hero Stage */}
            <div style={{
              position: 'relative',
              height: '460px',
              overflow: 'hidden',
              background: '#0F172A'
            }}>
              <img 
                src="/assets/images/cover-story-maharashtrian-entrepreneur-clean.jpg" 
                alt="मराठा युवा उद्योजक - Connect Maratha Cover Story"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 25%',
                  filter: 'brightness(0.96) contrast(1.05)',
                  transition: 'transform 0.8s ease'
                }}
              />

              {/* Rich Multi-stop Editorial Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.45) 50%, rgba(15, 23, 42, 0.95) 100%)'
              }} />

              {/* Corner Watermark Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: 'rgba(230, 81, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '1.2px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}>
                📸 विशेष संपादकीय मुलाखत
              </div>

              {/* Cover Headlines Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '32px',
                left: '32px',
                right: '32px',
                color: '#FFFFFF'
              }}>
                <span style={{
                  background: '#E65100',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  letterSpacing: '1.2px',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  ⭐ STARTUP MAHARASHTRA SPECIAL
                </span>

                <h1 style={{
                  fontSize: 'clamp(1.85rem, 3.4vw, 2.7rem)',
                  fontWeight: 900,
                  lineHeight: 1.22,
                  margin: '0 0 10px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.4px',
                  textShadow: '0 3px 14px rgba(0,0,0,0.7)'
                }}>
                  {pageData.title}
                </h1>

                <p style={{
                  fontSize: 'clamp(0.98rem, 1.8vw, 1.18rem)',
                  color: '#FED7AA',
                  fontWeight: 700,
                  maxWidth: '820px',
                  margin: 0,
                  lineHeight: 1.5,
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                }}>
                  {pageData.subtitle}
                </p>
              </div>
            </div>

            {/* 3. Main Editorial Body Section */}
            <div style={{ padding: '40px 36px 48px' }}>
              
              {/* Introduction Lead Box */}
              <div style={{
                background: 'linear-gradient(135deg, #FFF9F2 0%, #FFF3E6 100%)',
                borderLeft: '5px solid #E65100',
                borderRadius: '0 16px 16px 0',
                padding: '20px 24px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(230, 81, 0, 0.06)'
              }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 900, color: '#C73800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  संपादकीय प्रस्तावना (Editorial Prologue)
                </span>
                <p style={{
                  fontSize: '1.14rem',
                  lineHeight: 1.75,
                  color: '#0F172A',
                  fontWeight: 700,
                  margin: '8px 0 0'
                }}>
                  सातारा जिल्ह्यातील एका छोट्या गावातून सुरू झालेला हा प्रवास आज संपूर्ण महाराष्ट्रातील तरुणांसाठी दीपस्तंभ ठरला आहे. कोणतीही कौटुंबिक व्यावसायिक पार्श्वभूमी नसताना, केवळ जिद्द आणि कल्पकतेच्या जोरावर तंत्रज्ञान आणि ॲग्री-सप्लाय क्षेत्रात ३०० हून अधिक तरुणांना थेट रोजगार देणारा उद्योग उभा राहिला.
                </p>
              </div>

              {/* 4 Important Statistics Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '34px'
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #FFCC80',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(230, 81, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>🌱</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C73800' }}>₹२०,०००</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>सुरुवातीचे भांडवल</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>स्वबळावर उभारलेली सुरुवात</div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #FFCC80',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(230, 81, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>👥</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C73800' }}>३००+</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>स्थानिक थेट रोजगार</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>ग्रामीण तरुणांना संधी</div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #FFCC80',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(230, 81, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>📈</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C73800' }}>₹५० कोटी</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>वार्षिक उलाढाल टप्पा</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>ॲग्री-सप्लाय नेटवर्क</div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #FFCC80',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(230, 81, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>🎯</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C73800' }}>३६ तालुके</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>विस्तार आराखडा</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>महाराष्ट्रव्यापी पुरवठा</div>
                </div>
              </div>

              {/* 4. Two-Column In-Depth Feature: Story & Supporting Image */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.15fr 0.85fr',
                gap: '36px',
                alignItems: 'start',
                marginBottom: '32px'
              }}>
                {/* Left Text */}
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E293B', marginBottom: '14px', letterSpacing: '-0.3px' }}>
                    पहिल्या १०० ग्राहकांचा शोध आणि घेतलेले धाडसी निर्णय
                  </h3>

                  <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, marginBottom: '18px' }}>
                    "सुरुवातीला आम्हाला कोणीही भांडवल द्यायला तयार नव्हते. आम्ही गावातील शेतकऱ्यांच्या प्रत्यक्ष समस्या समजून घेतल्या आणि त्यांना डिजिटल मार्केटशी जोडले. पहिल्या १०० ग्राहकांना स्वतः फोन करून, दर्जाची खात्री देऊन विश्वास संपादन केला," असे या तरुणाने मुलाखतीत आवर्जून सांगितले.
                  </p>

                  <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, marginBottom: '22px' }}>
                    या अंकात वाचा त्यांचा प्रत्यक्ष संघर्ष, सरकारी योजनांचे (PMEGP/CMEGP) योग्य नियोजन, आणि येत्या ५ वर्षांत महाराष्ट्रातील प्रत्येक तालुक्यात विस्तार करण्याची त्यांची ब्लूप्रिंट.
                  </p>

                  {/* Highlighted Quote Callout */}
                  <blockquote style={{
                    margin: '0',
                    background: '#FFF8F0',
                    borderLeft: '4px solid #C73800',
                    borderRadius: '0 12px 12px 0',
                    padding: '16px 20px',
                    color: '#9A3412',
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}>
                    "व्यवसायामध्ये मोठे भांडवल लागते हा गैरसमज आहे. खरी गरज असते ती प्रामाणिकपणा, चिकाटी आणि ग्राहकाच्या समस्येवर कायमस्वरूपी तोडगा शोधण्याची."
                  </blockquote>
                </div>

                {/* Right Supporting Visual Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '2px solid #FFCC80',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <img 
                      src="/assets/images/agritech-entrepreneur-rural-supply.jpg" 
                      alt="महाराष्ट्रातील ॲग्रो-टेक स्टार्टअप परिसंस्था"
                      style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 100%)',
                      padding: '12px 16px',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      📍 ॲग्रो-टेक आणि स्थानिक शेती प्रक्रिया पुरवठा साखळी
                    </div>
                  </div>

                  {/* Highlights Bullet Box */}
                  <div style={{
                    background: '#FFFDF9',
                    borderRadius: '16px',
                    border: '2px solid #FFE0B2',
                    padding: '20px'
                  }}>
                    <h4 style={{ color: '#C73800', fontWeight: 900, fontSize: '0.92rem', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ⭐ या यशोगाथेतील महत्त्वाचे मुद्दे:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pageData.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                          <span style={{ color: '#E65100', fontSize: '0.95rem' }}>✓</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Author Attribution & Clean Reader Navigation Strip */}
              <div style={{
                marginTop: '36px',
                paddingTop: '24px',
                borderTop: '2px solid #FFE0B2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF7043 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1rem'
                  }}>
                    ✍️
                  </span>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>{pageData.author}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Connect Maratha विशेष संपादकीय डेस्क</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goToNext}
                  style={{
                    background: 'linear-gradient(135deg, #F4511E 0%, #C73800 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    padding: '9px 24px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(230, 81, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>पुढील पान: स्टार्टअप महाराष्ट्र (पान २)</span>
                  <span>➔</span>
                </button>
              </div>

            </div>

          </div>
        );

      // ----------------------------------------------------
      // PAGE 2: STARTUP MAHARASHTRA (Business, Stats & Modern Grids)
      // ----------------------------------------------------
      case 2:
        return (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#FFEFE5', color: '#C73800', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #FFCC80' }}>
                  🚀 STARTUP MAHARASHTRA • विभाग
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#E65100', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#E65100', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान २ / १०
              </span>
            </div>

            {/* Two-Column Grid: Left Article & Right Image/Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '36px', alignItems: 'start', marginBottom: '32px' }}>
              <div>
                <p style={{ fontSize: '1.12rem', color: '#1E293B', fontWeight: 700, lineHeight: 1.8, marginBottom: '20px', borderLeft: '4px solid #E65100', paddingLeft: '16px' }}>
                  आजच्या काळात व्यवसाय सुरू करण्यासाठी कोट्यवधींच्या भांडवलाची गरज नसते. गरज असते ती स्थानिक पातळीवरील न सुटलेल्या समस्येवर शाश्वत उत्तर शोधण्याची.
                </p>
                <div style={{ fontSize: '1.02rem', color: '#334155', lineHeight: 1.85, fontWeight: 500 }}>
                  {pageData.content.split('\n\n').map((p, idx) => (
                    <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Right Side: Photo and 5 Highlighted Models */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderRadius: '18px', overflow: 'hidden', border: '2px solid #FFCC80', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                  <img src={pageData.image} alt="Startup Maharashtra" style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
                </div>

                <div style={{ background: '#FFF8F0', borderRadius: '18px', border: '2px solid #FFE0B2', padding: '22px' }}>
                  <h4 style={{ color: '#C73800', fontWeight: 900, fontSize: '0.94rem', margin: '0 0 12px', textTransform: 'uppercase' }}>
                    💡 निवडक ५ प्रॅक्टिकल बिझनेस मॉडेल्स:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pageData.highlights.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #FFE0B2', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E65100', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>मार्गदर्शक: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: बिझनेस ब्लूप्रिंट ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 3: BUSINESS BLUEPRINT (Zero-Budget Marketing & Step-by-Step Growth Playbook)
      // ----------------------------------------------------
      case 3:
        return (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '28px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 24px 64px -16px rgba(230, 81, 0, 0.16), 0 4px 16px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            {/* 1. Header Masthead Strip */}
            <div style={{
              background: 'linear-gradient(135deg, #9A3412 0%, #C73800 50%, #EA580C 100%)',
              padding: '24px 36px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              borderBottom: '4px solid #FFB74D'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    background: '#FBBF24',
                    color: '#78350F',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    📐 BUSINESS BLUEPRINT • व्यवसाय मार्गदर्शक
                  </span>
                  <span style={{ color: '#FED7AA', fontSize: '0.8rem', fontWeight: 700 }}>
                    नोव्हेंबर २०२६ आवृत्ती
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.55rem, 2.8vw, 2.15rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ color: '#FFE0B2', fontSize: '0.94rem', margin: '4px 0 0', fontWeight: 700 }}>
                  {pageData.subtitle}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: '#FFFFFF',
                  color: '#C73800',
                  fontWeight: 900,
                  fontSize: '0.86rem',
                  padding: '6px 18px',
                  borderRadius: '9999px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E65100' }}></span>
                  पान ३ / १०
                </span>
              </div>
            </div>

            {/* 2. Visual Hero & Lead Playbook Grid */}
            <div style={{ padding: '36px 36px 44px' }}>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 0.9fr',
                gap: '32px',
                alignItems: 'center',
                marginBottom: '36px'
              }}>
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #FFF9F2 0%, #FFF3E6 100%)',
                    borderLeft: '5px solid #E65100',
                    borderRadius: '0 16px 16px 0',
                    padding: '18px 22px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 14px rgba(230, 81, 0, 0.05)'
                  }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#C73800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      महत्त्वाचा नियम (The Golden Rule)
                    </span>
                    <p style={{ fontSize: '1.08rem', lineHeight: 1.7, color: '#0F172A', fontWeight: 700, margin: '6px 0 0' }}>
                      "बहुतेक नवीन उद्योजक उत्पादन बनवण्यात वेळ घालवतात, पण विक्रीवर पुरेसे लक्ष देत नाहीत. उत्पादन कितीही उत्कृष्ट असले तरी ते ग्राहकापर्यंत पोहोचले नाही तर व्यवसाय टिकू शकत नाही."
                    </p>
                  </div>

                  <p style={{ fontSize: '1.02rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, margin: 0 }}>
                    कोणत्याही मोठ्या जाहिरातींचा खर्च न करता, शून्य रुपयात स्थानिक ग्राहकांचा विश्वास संपादन करून व्यवसायाला सुरुवातीचा वेग (Traction) कसा मिळवून द्यायचा, याची ही ५ खात्रीशीर पावले आहेत.
                  </p>
                </div>

                {/* High-Resolution Strategy Visual */}
                <div style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '2.5px solid #FFCC80',
                  boxShadow: '0 12px 30px rgba(230, 81, 0, 0.15)',
                  position: 'relative'
                }}>
                  <img 
                    src="/assets/images/business-strategy-zero-budget.jpg" 
                    alt="Zero Budget Marketing Strategy" 
                    style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.88) 100%)',
                    padding: '12px 18px',
                    color: '#FFFFFF'
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FED7AA' }}>
                      🎯 बिझनेस स्ट्रॅटेजी & कस्टमर अ‍ॅक्विझिशन वर्कशॉप
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. The 5 Strategic Step Cards */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏆</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                    झिरो-बजेट मार्केटिंगची ५ सुवर्णसूत्रे (5-Step Action Playbook)
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {pageData.highlights.map((step, idx) => {
                    const stepTitles = [
                      "WhatsApp Business व कॅटलॉग",
                      "Google My Business स्थानिक रँकिंग",
                      "रेफरल लूप & समाधानी ग्राहक",
                      "मोफत सॅम्पलिंग आणि प्रत्यक्ष रिव्ह्यूज",
                      "सोशल मीडिया व खरी प्रामाणिक कथा"
                    ];
                    return (
                      <div key={idx} style={{
                        background: '#FFFDF9',
                        borderRadius: '16px',
                        border: '2px solid #FFE0B2',
                        padding: '18px 20px',
                        boxShadow: '0 4px 14px rgba(230, 81, 0, 0.05)',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{
                              background: '#C73800',
                              color: '#FFFFFF',
                              fontWeight: 900,
                              fontSize: '0.72rem',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              letterSpacing: '0.6px'
                            }}>
                              STEP ०{idx + 1}
                            </span>
                            <span style={{ color: '#E65100', fontWeight: 900, fontSize: '0.82rem' }}>
                              सूत्र {idx + 1}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E293B', margin: '0 0 6px', lineHeight: 1.35 }}>
                            {stepTitles[idx] || step}
                          </h4>

                          <p style={{ color: '#475569', fontSize: '0.86rem', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                            {step}
                          </p>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #FFE0B2', fontSize: '0.76rem', color: '#15803D', fontWeight: 800 }}>
                          ✓ थेट आजच सुरू करा
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Practical Implementation Guide Box */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '2px solid #FFCC80',
                padding: '24px 28px',
                marginBottom: '28px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.03)'
              }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#C73800', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📌</span> पहिल्या १०० ग्राहकांसाठी प्रत्यक्ष कृती आराखडा (Tactical Checklist):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                    <span style={{ color: '#E65100', fontWeight: 900 }}>१.</span>
                    <span>आपल्या पहिल्या २० मित्रांना व नातेवाईकांना नमुना देऊन प्रामाणिक रिव्ह्यू मागून घ्या.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                    <span style={{ color: '#E65100', fontWeight: 900 }}>२.</span>
                    <span>गुगल मॅप्सवर ५-स्टार रिव्ह्यूज गोळा करा; स्थानिक शोधात थेट टॉपवर या.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                    <span style={{ color: '#E65100', fontWeight: 900 }}>३.</span>
                    <span>प्रत्येक समाधानी ग्राहकाला त्याच्या २ मित्रांना रेफर करण्यासाठी विशेष डिस्काउंट कूपन द्या.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                    <span style={{ color: '#E65100', fontWeight: 900 }}>४.</span>
                    <span>सोशल मीडियावर रोज प्रॉडक्ट मेकिंगचा छोटा व्हिडिओ रील शेअर करा.</span>
                  </div>
                </div>
              </div>

              {/* 5. Author Attribution & Navigation Footer */}
              <div style={{
                paddingTop: '20px',
                borderTop: '2px solid #FFE0B2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF7043 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.95rem'
                  }}>
                    📊
                  </span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B' }}>{pageData.author}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Connect Maratha बिझनेस स्ट्रॅटेजी विभाग</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goToNext}
                  style={{
                    background: 'linear-gradient(135deg, #F4511E 0%, #C73800 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    padding: '8px 22px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(230, 81, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>पुढील पान: युवा शक्ती & AI (पान ४)</span>
                  <span>➔</span>
                </button>
              </div>

            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 4: YOUTH POWER (Technology, AI, Future Skills)
      // ----------------------------------------------------
      case 4:
        return (
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF9F2 100%)',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#E0F2FE', color: '#0369A1', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #BAE6FD' }}>
                  ⚡ YOUTH POWER & FUTURE SKILLS
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#0284C7', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#0284C7', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान ४ / १०
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ borderRadius: '18px', overflow: 'hidden', border: '2px solid #BAE6FD', boxShadow: '0 10px 24px rgba(2, 132, 199, 0.15)' }}>
                <img src={pageData.image} alt="Youth AI Tech" style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '14px' }}>
                  आर्टिफिशियल इंटेलिजन्समुळे नोकऱ्या जाणार नाहीत, तर AI वापरणाऱ्या व्यक्ती इतरांच्या पुढे निघून जातील!
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pageData.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#FFFFFF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BAE6FD', fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                      <span style={{ color: '#0284C7', fontWeight: 900 }}>⚡</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: '#F0F9FF', borderRadius: '18px', border: '2px solid #BAE6FD', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#1E293B', fontWeight: 500 }}>
                {pageData.content.split('\n\n').map((p, idx) => (
                  <p key={idx} style={{ marginBottom: '14px' }}>{p}</p>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>टेक कन्सल्टंट: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: महिला उद्योजिका ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 5: WOMEN IN BUSINESS (Inspiring Stories, Food Brands, Global Exports)
      // ----------------------------------------------------
      case 5:
        return (
          <div style={{
            background: '#FFFDF9',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#FDF2F8', color: '#BE185D', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #FBCFE8' }}>
                  🌸 WOMEN IN BUSINESS • महिला नेतृत्व
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#BE185D', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#BE185D', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान ५ / १०
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '36px', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <blockquote style={{ fontSize: '1.1rem', color: '#831843', fontWeight: 700, fontStyle: 'italic', borderLeft: '4px solid #DB2777', paddingLeft: '18px', margin: '0 0 20px', lineHeight: 1.7 }}>
                  "आम्ही चवीशी कधीही तडजोड केली नाही. जुन्या पद्धतीचे खलबत्त्यात कुटलेले मसाले आणि आधुनिक हवाबंद झिप-लॉक पॅकेजिंग यामुळे परदेशातील अनिवासी महाराष्ट्रीयन बांधवांकडून प्रचंड मागणी आली."
                </blockquote>
                <div style={{ fontSize: '1.04rem', lineHeight: 1.85, color: '#334155', fontWeight: 500 }}>
                  {pageData.content.split('\n\n').map((p, idx) => (
                    <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ borderRadius: '18px', overflow: 'hidden', border: '2px solid #FBCFE8', boxShadow: '0 8px 24px rgba(190, 24, 93, 0.12)' }}>
                  <img src={pageData.image} alt="Women Entrepreneurs" style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ background: '#FFF1F2', borderRadius: '16px', border: '1.5px solid #FECDD3', padding: '20px' }}>
                  <h4 style={{ color: '#BE185D', fontWeight: 900, fontSize: '0.92rem', margin: '0 0 10px' }}>
                    🏆 या यशोगाथेतील महत्त्वाचे टप्पे:
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pageData.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#4C0519' }}>
                        <span style={{ color: '#E11D48' }}>✔</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>संपादकीय मुलाखत: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: पैसा आणि प्रगती ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 6: MONEY & WEALTH (Financial Literacy, Cash-Flow, 5 Rules)
      // ----------------------------------------------------
      case 6:
        return (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#ECFDF5', color: '#047857', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #A7F3D0' }}>
                  💰 MONEY & WEALTH • आर्थिक साक्षरता
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#047857', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#047857', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान ६ / १०
              </span>
            </div>

            {/* Financial Highlights Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ background: '#F0FDF4', borderRadius: '16px', border: '1.5px solid #BBF7D0', padding: '18px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>📊</span>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#065F46', margin: '0 0 4px' }}>गल्ला vs निव्वळ नफा</h4>
                <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0 }}>१००% पारदर्शक हिशोब</p>
              </div>
              <div style={{ background: '#F0FDF4', borderRadius: '16px', border: '1.5px solid #BBF7D0', padding: '18px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>🏦</span>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#065F46', margin: '0 0 4px' }}>३०% राखीव फंड</h4>
                <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0 }}>इमर्जन्सी ऑपरेटिंग भांडवल</p>
              </div>
              <div style={{ background: '#F0FDF4', borderRadius: '16px', border: '1.5px solid #BBF7D0', padding: '18px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>💳</span>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#065F46', margin: '0 0 4px' }}>१५ दिवसांची कमाल उधारी</h4>
                <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0 }}>कॅश-फ्लो सुरक्षितता</p>
              </div>
            </div>

            {/* In-depth Financial Content */}
            <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, marginBottom: '24px' }}>
              {pageData.content.split('\n\n').map((p, idx) => (
                <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
              ))}
            </div>

            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>आर्थिक सल्लागार: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: जिल्हा व्यवसाय वेध ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 7: DISTRICT BUSINESS FOCUS (36 Districts, Industrial Clusters, MIDC)
      // ----------------------------------------------------
      case 7:
        return (
          <div style={{
            background: '#FFFDF9',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#FFF7ED', color: '#EA580C', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #FFEDD5' }}>
                  📍 DISTRICT BUSINESS FOCUS • ३६ जिल्हे वेध
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#EA580C', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#EA580C', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान ७ / १०
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ borderRadius: '18px', overflow: 'hidden', border: '2px solid #FFE0B2', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <img src={pageData.image} alt="District Business Hub" style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', margin: '0 0 12px' }}>
                  जिल्हा क्लस्टर संधी आणि शासकीय सबसिडी:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pageData.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                      <span style={{ color: '#EA580C' }}>🚩</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, marginBottom: '24px' }}>
              {pageData.content.split('\n\n').map((p, idx) => (
                <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
              ))}
            </div>

            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>प्रतिनिधी मंडळ: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: करिअर & कौशल्य ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 8: CAREER & FUTURE (Modern Degree, Logistics, Renewable Energy)
      // ----------------------------------------------------
      case 8:
        return (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#EEF2FF', color: '#4F46E5', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #C7D2FE' }}>
                  🎓 CAREER & FUTURE • पदवीनंतर काय?
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#4F46E5', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#4F46E5', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान ८ / १०
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
              {pageData.highlights.map((h, i) => (
                <div key={i} style={{ background: '#EEF2FF', borderRadius: '16px', border: '1.5px solid #C7D2FE', padding: '18px' }}>
                  <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '6px' }}>🚀</span>
                  <p style={{ color: '#312E81', fontSize: '0.9rem', fontWeight: 800, margin: 0, lineHeight: 1.45 }}>{h}</p>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, marginBottom: '24px' }}>
              {pageData.content.split('\n\n').map((p, idx) => (
                <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
              ))}
            </div>

            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>करिअर कौन्सिलर: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: शिवरायांचे व्यवस्थापनशास्त्र ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 9: HISTORY TO FUTURE (Maratha Heritage, Forts, Navy, Shivaji Maharaj)
      // ----------------------------------------------------
      case 9:
        return (
          <div style={{
            background: 'linear-gradient(145deg, #FFFDF7 0%, #FFF8EE 100%)',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#FFEFE5', color: '#C73800', fontWeight: 900, fontSize: '0.78rem', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #FFCC80' }}>
                  🚩 HISTORY TO FUTURE • मराठा वारसा
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>
                  {pageData.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#C73800', fontWeight: 700, margin: 0 }}>
                  {pageData.subtitle}
                </p>
              </div>
              <span style={{ background: '#C73800', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem', padding: '5px 16px', borderRadius: '9999px' }}>
                पान ९ / १०
              </span>
            </div>

            <div style={{ position: 'relative', height: '280px', borderRadius: '18px', overflow: 'hidden', marginBottom: '28px', border: '2px solid #FFCC80' }}>
              <img src={pageData.image} alt="Maratha Heritage Management" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', color: '#FFFFFF' }}>
                <span style={{ background: '#E65100', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase' }}>
                  शिवकालीन व्यवस्थापन
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '6px 0 0' }}>
                  दुर्ग, आरमार, स्वतंत्र चलन आणि शेतकऱ्यांचे आर्थिक संरक्षण
                </h3>
              </div>
            </div>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500, marginBottom: '24px' }}>
              {pageData.content.split('\n\n').map((p, idx) => (
                <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
              ))}
            </div>

            <div style={{ paddingTop: '18px', borderTop: '2px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
              <span>इतिहास संशोधन कक्ष: <strong style={{ color: '#1E293B' }}>{pageData.author}</strong></span>
              <span onClick={goToNext} style={{ color: '#E65100', cursor: 'pointer', fontWeight: 900 }}>पुढील पान: कनेक्ट & ग्रो ➔</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // PAGE 10: CONNECT & GROW (Closing Page, Networking, Call to Action)
      // ----------------------------------------------------
      case 10:
        return (
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF3E6 100%)',
            borderRadius: '24px',
            border: '2.5px solid #FFB74D',
            boxShadow: '0 20px 48px -12px rgba(230, 81, 0, 0.16)',
            padding: '40px',
            overflow: 'hidden'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 32px' }}>
              <span style={{ background: '#FFEFE5', color: '#C73800', fontWeight: 900, fontSize: '0.82rem', padding: '5px 18px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1.5px solid #FFCC80', display: 'inline-block', marginBottom: '12px' }}>
                🤝 CONNECT & GROW • अंतिम पान (CLOSING EDITION)
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', fontWeight: 900, color: '#1E293B', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
                {pageData.title}
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#C73800', fontWeight: 700, margin: 0 }}>
                {pageData.subtitle}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              {pageData.highlights.map((h, i) => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', border: '2px solid #FFE0B2', padding: '20px', boxShadow: '0 4px 14px rgba(230, 81, 0, 0.08)' }}>
                  <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '8px' }}>⭐</span>
                  <p style={{ color: '#1E293B', fontSize: '0.94rem', fontWeight: 800, margin: 0, lineHeight: 1.45 }}>{h}</p>
                </div>
              ))}
            </div>

            {/* Inspiring Closing Pitch Box */}
            <div style={{ background: 'linear-gradient(135deg, #E65100 0%, #C73800 100%)', borderRadius: '20px', padding: '32px', color: '#FFFFFF', textAlign: 'center', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 8px' }}>
                महाराष्ट्राच्या नव्या पिढीचा विचार, व्यवसाय आणि प्रगतीचा आवाज!
              </h3>
              <p style={{ fontSize: '0.98rem', color: '#FED7AA', maxWidth: '640px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Connect Maratha मासिकाच्या पुढील अंकात सहभागी होण्यासाठी, जाहिरात देण्यासाठी किंवा आपला लेख पाठवण्यासाठी आजच आमच्याशी संपर्क साधा.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/magazine#contributor-section"
                  style={{ background: '#FFFFFF', color: '#C73800', fontWeight: 900, fontSize: '0.92rem', padding: '10px 24px', borderRadius: '9999px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
                >
                  पुढील अंकात सहभागी व्हा ➔
                </Link>
                <Link
                  to="/magazine"
                  style={{ background: 'rgba(0,0,0,0.25)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', padding: '10px 22px', borderRadius: '9999px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)' }}
                >
                  मुख्य मुखपृष्ठावर जा
                </Link>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B', fontWeight: 700 }}>
              🚩 जय जिजाऊ • जय शिवराय • जय शंभूराजे! | Connect Maratha Publications © २०२६
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cm-mag-full-wrapper" style={{ background: '#FFF8F0', minHeight: '100vh', color: '#1E293B' }}>
      
      {/* ============================================================
          1. TOP LUXURY TOOLBAR (Connect Maratha Warm Theme)
          ============================================================ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#FFFFFF',
        borderBottom: '2.5px solid #FFCC80',
        boxShadow: '0 4px 20px rgba(230, 81, 0, 0.08)',
        padding: '12px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Back to Magazine & Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link 
              to="/magazine" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 800,
                background: '#FFEFE5',
                color: '#C73800',
                border: '1.5px solid #FFB74D',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>←</span>
              <span>मॅगझिन मुखपृष्ठ</span>
            </Link>

            <div style={{ borderLeft: '2px solid #FFE0B2', paddingLeft: '14px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#C73800', display: 'block' }}>
                CONNECT MARATHA DIGITAL READER
              </span>
              <h1 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {CURRENT_ISSUE.month} • वर्ष १ | अंक १
              </h1>
            </div>
          </div>

          {/* Center Navigation: Current Page, Dropdown, Prev / Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid #FFB74D',
                background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                color: currentPage === 1 ? '#94A3B8' : '#C73800',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              ◀ मागील
            </button>

            {/* Page Selection Dropdown */}
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '2px solid #FFB74D',
                background: '#FFFDF9',
                color: '#1E293B',
                fontWeight: 800,
                fontSize: '0.86rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {CURRENT_ISSUE.pages.map((p) => (
                <option key={p.pageNumber} value={p.pageNumber}>
                  पान {p.pageNumber} / {totalPages}: {p.categoryTitle}
                </option>
              ))}
            </select>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid #FFB74D',
                background: currentPage === totalPages ? '#F1F5F9' : '#E65100',
                color: currentPage === totalPages ? '#94A3B8' : '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(230, 81, 0, 0.2)'
              }}
            >
              पुढील ▶
            </button>
          </div>

          {/* Right Action: Download PDF */}
          <div>
            <button
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #F4511E 0%, #C73800 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(230, 81, 0, 0.28)'
              }}
            >
              <span>📥</span>
              <span>डिजिटल PDF प्रत</span>
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================
          2. READING PROGRESS INDICATOR
          ============================================================ */}
      <div style={{
        maxWidth: '1200px',
        margin: '18px auto 0',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748B' }}>
            वाचन प्रगती:
          </span>
          <div style={{ width: '160px', height: '6px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${(currentPage / totalPages) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #F4511E, #E65100)' }} />
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#C73800' }}>
            {Math.round((currentPage / totalPages) * 100)}% (पान {currentPage} / {totalPages})
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
          कीबोर्ड शॉर्टकट: <strong>◀ डावा बाण</strong> / <strong>▶ उजवा बाण</strong>
        </div>
      </div>

      {/* ============================================================
          3. MAIN CURRENT EDITORIAL PAGE CONTAINER
          ============================================================ */}
      <main style={{ maxWidth: '1200px', margin: '20px auto 40px', padding: '0 20px' }}>
        {renderEditorialPageContent()}
      </main>

      {/* ============================================================
          4. PREMIUM EDITORIAL MAGAZINE NAVIGATION (Interactive Table of Contents)
          ============================================================ */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto 70px',
        padding: '0 20px'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFDFB 60%, #FFF8F1 100%)',
          borderRadius: '28px',
          border: '2.5px solid #FFCC80',
          padding: '36px 36px 44px',
          boxShadow: '0 20px 50px -15px rgba(230, 81, 0, 0.12), 0 4px 16px rgba(0,0,0,0.03)'
        }}>
          
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px', borderBottom: '2px solid #FFE0B2', paddingBottom: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFEFE5', border: '1.5px solid #FFB74D', padding: '4px 14px', borderRadius: '9999px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}>🚩</span>
                <span style={{ color: '#C73800', fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                  EDITORIAL INDEX • अनुक्रमणिका
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900, color: '#1E293B', margin: '4px 0 6px', letterSpacing: '-0.3px' }}>
                मॅगझिनमधील सर्व विभाग
              </h2>
              <p style={{ fontSize: '0.98rem', color: '#64748B', fontWeight: 600, margin: 0 }}>
                तुमच्या आवडीचा विषय निवडा आणि थेट त्या पानावर जा.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9A3412', background: '#FFF3E0', padding: '6px 16px', borderRadius: '9999px', border: '1px solid #FFCC80' }}>
                सध्या चालू: <strong>पान {currentPage} / १०</strong>
              </span>
            </div>
          </div>

          {/* Interactive Layout: Page 1 Featured Card + 9 Responsive Grid Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* FEATURED LARGE CARD: PAGE 1 (Cover Story) */}
            {(() => {
              const p1 = CURRENT_ISSUE.pages[0];
              const isSelected = currentPage === 1;
              return (
                <div 
                  onClick={() => setCurrentPage(1)}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' 
                      : '#FFFFFF',
                    borderRadius: '24px',
                    border: isSelected ? '3px solid #E65100' : '2px solid #FFCC80',
                    boxShadow: isSelected 
                      ? '0 16px 36px -6px rgba(230, 81, 0, 0.28)' 
                      : '0 8px 24px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 380px) 1fr',
                    alignItems: 'stretch',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(230, 81, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isSelected 
                      ? '0 16px 36px -6px rgba(230, 81, 0, 0.28)' 
                      : '0 8px 24px rgba(0,0,0,0.05)';
                  }}
                >
                  {/* Photo Column */}
                  <div style={{ position: 'relative', minHeight: '220px', overflow: 'hidden' }}>
                    <img 
                      src={p1.image} 
                      alt={p1.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.8) 100%)' }} />
                    <span style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: '#E65100',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      padding: '4px 14px',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                      letterSpacing: '1px'
                    }}>
                      ⭐ FEATURED COVER STORY
                    </span>
                  </div>

                  {/* Content Column */}
                  <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '1.8rem',
                          fontWeight: 900,
                          color: isSelected ? '#C73800' : '#E65100',
                          lineHeight: 1,
                          fontFamily: 'serif'
                        }}>
                          01
                        </span>
                        <span style={{
                          background: isSelected ? '#C73800' : '#FFEFE5',
                          color: isSelected ? '#FFFFFF' : '#C73800',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          letterSpacing: '0.6px'
                        }}>
                          {p1.category}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.38rem', fontWeight: 900, color: '#1E293B', margin: '0 0 8px', lineHeight: 1.35 }}>
                        {p1.title}
                      </h3>

                      <p style={{ color: '#475569', fontSize: '0.92rem', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                        {p1.subtitle}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1.5px solid rgba(230, 81, 0, 0.15)' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#64748B' }}>
                        {isSelected ? '✓ सध्या हे पान उघडे आहे' : 'वाचण्यासाठी क्लिक करा'}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        color: '#C73800'
                      }}>
                        <span>अंक उघडा</span>
                        <span style={{ fontSize: '1rem' }}>➔</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* REMAINING 9 PAGES IN A RESPONSIVE EDITORIAL GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {CURRENT_ISSUE.pages.slice(1).map((p) => {
                const isSelected = currentPage === p.pageNumber;
                const formattedNum = p.pageNumber < 10 ? `0${p.pageNumber}` : `${p.pageNumber}`;

                return (
                  <div
                    key={p.pageNumber}
                    onClick={() => setCurrentPage(p.pageNumber)}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)' 
                        : '#FFFFFF',
                      borderRadius: '20px',
                      border: isSelected ? '2.5px solid #E65100' : '2px solid #FFE0B2',
                      boxShadow: isSelected 
                        ? '0 12px 28px -6px rgba(230, 81, 0, 0.25)' 
                        : '0 6px 18px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 14px 28px -6px rgba(230, 81, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isSelected 
                        ? '0 12px 28px -6px rgba(230, 81, 0, 0.25)' 
                        : '0 6px 18px rgba(0,0,0,0.04)';
                    }}
                  >
                    {/* Card Thumbnail Image */}
                    <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                      <img 
                        src={p.image} 
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.75) 100%)' }} />

                      {/* Large Page Number Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: isSelected ? '#C73800' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        padding: '3px 10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        fontFamily: 'serif'
                      }}>
                        {formattedNum}
                      </span>

                      {/* Category Tag on bottom right of image */}
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(4px)',
                        color: '#FED7AA',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase'
                      }}>
                        {p.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{
                          color: '#C73800',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {p.categoryTitle}
                        </span>

                        <h4 style={{
                          fontSize: '1.02rem',
                          fontWeight: 800,
                          color: '#1E293B',
                          margin: '0 0 8px',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {p.title}
                        </h4>
                      </div>

                      {/* Card Footer Arrow Strip */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid #FFE0B2',
                        fontSize: '0.78rem',
                        fontWeight: 800
                      }}>
                        <span style={{ color: isSelected ? '#C73800' : '#64748B' }}>
                          {isSelected ? 'सध्या निवडलेले पान' : `पान ${p.pageNumber} वाचा`}
                        </span>
                        <span style={{
                          color: '#E65100',
                          fontSize: '0.92rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ➔
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
