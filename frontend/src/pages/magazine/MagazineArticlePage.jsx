import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FEATURED_ARTICLES, CURRENT_ISSUE, MAGAZINE_CATEGORIES } from '../../data/magazineData';
import '../../styles/magazine.css';

export default function MagazineArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Find article by slug or fallback to first article
  const article = FEATURED_ARTICLES.find(a => a.slug === slug) || FEATURED_ARTICLES[0];

  // Related articles (excluding current)
  const relatedArticles = FEATURED_ARTICLES.filter(a => a.id !== article.id).slice(0, 3);

  // Track scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(`${article.title} - Connect Maratha Magazine`);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="cm-mag-full-wrapper" style={{ background: '#FFF8F0', minHeight: '100vh' }}>
      
      {/* Top Reading Progress Bar */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${readingProgress}%`,
          height: '4px',
          background: 'linear-gradient(90deg, #F4511E 0%, #E65100 50%, #FFB74D 100%)',
          zIndex: 9999,
          transition: 'width 0.1s ease'
        }}
      />

      {/* Breadcrumb & Subnav Header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '2px solid #FFCC80',
        padding: '12px 24px',
        boxShadow: '0 2px 10px rgba(230, 81, 0, 0.06)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#64748B', fontWeight: 700 }}>
            <Link to="/magazine" style={{ color: '#E65100', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🚩 CONNECT मराठा MAGAZINE</span>
            </Link>
            <span>›</span>
            <span style={{ color: '#9A3412' }}>{article.category}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link 
              to="/magazine" 
              className="cm-pill-btn-secondary"
              style={{ padding: '6px 16px', fontSize: '0.82rem' }}
            >
              ← मॅगझिन मुख्यपृष्ठ
            </Link>
            <Link 
              to="/magazine/reader" 
              className="cm-pill-btn-primary"
              style={{ padding: '6px 18px', fontSize: '0.82rem' }}
            >
              📖 १० पानी अंक वाचा
            </Link>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px 80px' }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Full Editorial Body */}
          <article style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '2px solid #FFB74D',
            boxShadow: '0 12px 36px -8px rgba(230, 81, 0, 0.12), 0 2px 8px rgba(0,0,0,0.03)',
            padding: '36px 40px',
            overflow: 'hidden'
          }}>
            
            {/* Category Badge & Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #F4511E 0%, #E65100 100%)',
                color: '#FFFFFF',
                padding: '5px 16px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.4px',
                boxShadow: '0 3px 10px rgba(230, 81, 0, 0.25)'
              }}>
                {article.category}
              </span>

              <div style={{ display: 'flex', gap: '14px', color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>⏱️ {article.readTime} वाचन</span>
                <span>👁️ {article.views || "१०,०००+"} वाचक</span>
              </div>
            </div>

            {/* Article Headline */}
            <h1 style={{
              fontSize: 'clamp(1.75rem, 2.6vw, 2.35rem)',
              fontWeight: 900,
              color: '#1E293B',
              lineHeight: 1.3,
              margin: '0 0 16px',
              letterSpacing: '-0.4px'
            }}>
              {article.title}
            </h1>

            {/* Author Attribution Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: '#FFF8F0',
              borderRadius: '14px',
              border: '1.5px solid #FFE0B2',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '12px'
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
                  fontSize: '1rem',
                  boxShadow: '0 3px 8px rgba(230, 81, 0, 0.25)'
                }}>
                  ✍️
                </span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>{article.author}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>प्रकाशित तारीख: {article.publishedDate}</div>
                </div>
              </div>

              {/* Share Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a 
                  href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <span>📲 WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  style={{
                    background: '#FFFFFF',
                    color: '#1E293B',
                    border: '1.5px solid #CBD5E1',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? "✓ कॉपी केले!" : "🔗 लिंक"}
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div style={{
              borderRadius: '18px',
              overflow: 'hidden',
              marginBottom: '28px',
              boxShadow: '0 10px 28px -6px rgba(0,0,0,0.12)',
              border: '2px solid #FFE0B2',
              position: 'relative'
            }}>
              <img 
                src={article.image} 
                alt={article.title}
                style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.75) 100%)',
                padding: '16px 20px',
                color: '#FFF2E6',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                📷 Connect Maratha विशेष संपादकीय छायाचित्र
              </div>
            </div>

            {/* Key Takeaways Box */}
            {article.keyPoints && article.keyPoints.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #FFF9F2 0%, #FFF1E0 100%)',
                borderRadius: '16px',
                border: '2px solid #FFCC80',
                padding: '22px 26px',
                marginBottom: '32px',
                boxShadow: '0 4px 14px rgba(230, 81, 0, 0.06)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#C73800',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  marginBottom: '14px'
                }}>
                  <span>📌</span>
                  <span>या लेखातील ५ महत्त्वाचे निष्कर्ष (Key Takeaways):</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {article.keyPoints.map((pt, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.94rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                      <span style={{ color: '#E65100', fontWeight: 900, fontSize: '1rem', marginTop: '-1px' }}>✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Excerpt Lead Paragraph */}
            <p style={{
              fontSize: '1.15rem',
              lineHeight: 1.8,
              color: '#0F172A',
              fontWeight: 700,
              marginBottom: '24px',
              borderLeft: '4px solid #E65100',
              paddingLeft: '18px',
              fontStyle: 'normal'
            }}>
              {article.excerpt}
            </p>

            {/* Article Content Paragraphs */}
            <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#334155', fontWeight: 500 }}>
              {article.fullBody ? (
                article.fullBody.map((para, i) => (
                  <p key={i} style={{ marginBottom: '20px' }}>{para}</p>
                ))
              ) : (
                <p style={{ marginBottom: '20px' }}>{article.content || article.excerpt}</p>
              )}
            </div>

            {/* Editorial Footer & Call to Action */}
            <div style={{
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '2px solid #FFE0B2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>विषय टॅग्स:</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {(article.tags || ["उद्योजकता", "महाराष्ट्र", "Startup"]).map((t, idx) => (
                    <span key={idx} style={{ background: '#FFEFE5', color: '#C73800', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a 
                  href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cm-pill-btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.88rem', background: '#25D366' }}
                >
                  WhatsApp शेअर करा ➔
                </a>
              </div>
            </div>

          </article>

          {/* Right Column: Sidebar Widgets */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* 1. Monthly Magazine Highlight Card */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
              borderRadius: '20px',
              border: '2px solid #FFB74D',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(230, 81, 0, 0.1)',
              textAlign: 'center'
            }}>
              <span style={{
                background: '#FFE8D6',
                color: '#C73800',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '10px'
              }}>
                ⭐ नोव्हेंबर २०२६ अंक
              </span>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#1E293B', margin: '0 0 8px' }}>
                १० पानांचे संपूर्ण डिजिटल मॅगझिन
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '0 0 16px', lineHeight: 1.4 }}>
                युवा उद्योजक, स्टार्टअप्स, करिअर आणि शिवकालीन व्यवस्थापनाचा सचित्र विशेषांक.
              </p>

              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 18px rgba(199, 56, 0, 0.25)',
                marginBottom: '16px',
                border: '2px solid #FFFFFF'
              }}>
                <img 
                  src={CURRENT_ISSUE.coverImage} 
                  alt="Connect Maratha Magazine November 2026"
                  style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <Link 
                to="/magazine/reader"
                className="cm-pill-btn-primary"
                style={{ width: '100%', padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <span>📖 अंक वाचा (Open Reader)</span>
                <span>➔</span>
              </Link>
            </div>

            {/* 2. Related Articles */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #FFE0B2',
              padding: '22px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)'
            }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1E293B', margin: '0 0 16px', borderBottom: '2px solid #FFE0B2', paddingBottom: '8px' }}>
                संबंधित महत्त्वाचे लेख (Related)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {relatedArticles.map((rel) => (
                  <Link 
                    key={rel.id} 
                    to={`/magazine/article/${rel.slug}`}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      textDecoration: 'none',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '10px',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FFF3E6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '70px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #FFCC80' }}>
                      <img src={rel.image} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#E65100', fontWeight: 800, textTransform: 'uppercase' }}>
                        {rel.category}
                      </span>
                      <h5 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1E293B', margin: '2px 0 0', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rel.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Become a Contributor Box */}
            <div style={{
              background: 'linear-gradient(135deg, #FF7043 0%, #E65100 100%)',
              borderRadius: '20px',
              padding: '24px',
              color: '#FFFFFF',
              boxShadow: '0 10px 24px rgba(230, 81, 0, 0.35)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>✍️</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 6px', color: '#FFFFFF' }}>
                आपले लिखाण प्रसिद्ध करा
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#FFF2E6', lineHeight: 1.5, margin: '0 0 16px' }}>
                आपल्याकडे व्यवसाय विचार, यशोगाथा किंवा मार्गदर्शक लेख आहे का? Connect Maratha वर लिखाण प्रसिद्ध करण्याचे खुले आमंत्रण!
              </p>
              <Link 
                to="/magazine#contributor-section"
                style={{
                  display: 'inline-block',
                  background: '#FFFFFF',
                  color: '#C73800',
                  fontWeight: 900,
                  fontSize: '0.84rem',
                  padding: '9px 20px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                लेखक म्हणून नोंदणी करा ➔
              </Link>
            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}

