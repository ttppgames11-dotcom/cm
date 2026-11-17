import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/magazine.css';

export default function MagazineLandingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Modals state
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentReaderPage, setCurrentReaderPage] = useState(1);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Magazine Advertisement');

  // Forms state
  const [adForm, setAdForm] = useState({ name: '', businessName: '', mobile: '', email: '', adType: 'Magazine Advertisement', message: '' });
  const [adSubmitting, setAdSubmitting] = useState(false);
  const [adSuccess, setAdSuccess] = useState(false);
  const [adError, setAdError] = useState('');

  const [contributorForm, setContributorForm] = useState({ name: '', district: '', profession: '', email: '', mobile: '', writingInterest: '' });
  const [contributorSubmitting, setContributorSubmitting] = useState(false);
  const [contributorSuccess, setContributorSuccess] = useState(false);
  const [contributorError, setContributorError] = useState('');

  // Scroll listener for sticky navbar elevation and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPos > 40);
      setShowBackToTop(scrollPos > 450);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for GPU-accelerated scroll-reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cm-active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const revealElements = document.querySelectorAll('.cm-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // 10 Magazine Explore Categories
  const categories = [
    {
      id: 1,
      title: "युवा उद्योजक",
      sub: "नवीन उद्योजक आणि त्यांचे व्यवसाय",
      img: "/assets/images/yuva-udyojak-card-perfect.jpg",
      description: "महाराष्ट्रातील ३० वर्षांखालील तरुण उद्योजक ज्यांनी स्वतःच्या हिमतीवर शेती, तंत्रज्ञान आणि उत्पादन क्षेत्रात नवा आदर्श घडवला."
    },
    {
      id: 2,
      title: "Startup Maharashtra",
      sub: "Startup, Innovation व नव्या कल्पना",
      img: "/assets/images/startup-maharashtra-hd.jpg",
      description: "कमी भांडवलात सुरू होणाऱ्या बिझनेस आयडियाज, एंजल इनव्हेस्टमेंट, सरकारी सबसिडी (CMEGP/PMEGP) आणि इनक्युबेशन मार्गदर्शन."
    },
    {
      id: 3,
      title: "Business Blueprint",
      sub: "व्यवसाय सुरू व मोठा कसा करावा?",
      img: "/assets/images/business-blueprint-hd.jpg",
      description: "व्यवसाय नोंदणी, जीएसटी, ट्रेडमार्क, झिरो बजेट मार्केटिंग आणि ग्राहक मिळवण्याची ५ पावले."
    },
    {
      id: 4,
      title: "महिला उद्योजिका",
      sub: "महिला नेतृत्व व यशस्वी गृहउद्योग",
      img: "/assets/images/women-entrepreneur-hub.jpg",
      description: "पारंपारिक उत्पादनांना आधुनिक पॅकेजिंग देऊन कॉर्पोरेट व जागतिक बाजारपेठ मिळवणाऱ्या मराठमोळ्या महिलांची यशोगाथा."
    },
    {
      id: 5,
      title: "पैसा आणि प्रगती",
      sub: "गुंतवणूक, नफा व आर्थिक साक्षरता",
      img: "/assets/images/paisa-ani-pragati-hd.jpg",
      description: "गल्ला आणि निव्वळ नफा यातील फरक, व्यवसायातील रोख प्रवाह (Cashflow) आणि सुरक्षित गुंतवणुकीचे मूलभूत नियम."
    },
    {
      id: 6,
      title: "जिल्हा व्यवसाय",
      sub: "स्थानिक उद्योग व जिल्हा बाजारपेठ",
      img: "/assets/images/maratha-business-sangam.jpg",
      description: "महाराष्ट्रातील प्रत्येक जिल्ह्यातील स्थानिक उत्पादने, एमआयडीसी क्लस्टर आणि ग्रामीण भागातील व्यावसायिक संधी."
    },
    {
      id: 7,
      title: "युवा करिअर",
      sub: "कौशल्य, करिअर व आधुनिक नोकऱ्या",
      img: "/assets/images/yuva-career-tech-hd.jpg",
      description: "पारंपारिक पदवीनंतर हाय-डिमांड टेक व नॉन-टेक करिअर्स, डेटा ॲनालिटिक्स, लॉजिस्टिक्स आणि कौशल्यवृद्धी."
    },
    {
      id: 8,
      title: "मराठा वारसा",
      sub: "शिवकालीन व्यवस्थापन व मराठा वारसा",
      img: "/assets/images/maratha-varsa-hd.jpg",
      description: "छत्रपती शिवरायांचे दुर्गव्यवस्थापन, आरमार निर्मिती, स्वतंत्र चलन आणि आजच्या उद्योजकांसाठी बिझनेस गव्हर्नन्सचे धडे."
    },
    {
      id: 9,
      title: "Success Stories",
      sub: "शून्यातून निर्माण केलेल्या यशोगाथा",
      img: "/assets/images/success-stories-hd.jpg",
      description: "कोणत्याही भांडवलाशिवाय जिद्दीच्या जोरावर कोट्यवधींची उलाढाल करणाऱ्या महाराष्ट्रातील प्रेरणादायी व्यक्तींचे संघर्ष."
    },
    {
      id: 10,
      title: "Future Maharashtra",
      sub: "AI, तंत्रज्ञान आणि भविष्यातील संधी",
      img: "/assets/images/future-maharashtra-hd.jpg",
      description: "स्थानिक उद्योगांमध्ये AI ऑटोमेशनचा वापर, ई-कॉमर्स विस्तार आणि आधुनिक तंत्रज्ञानाचे भविष्य."
    }
  ];

  // Articles
  const articles = [
    {
      id: 'art-1',
      title: "कमी भांडवलात सुरू करता येणारे ५ हाय-प्रॉफिट स्टार्टअप्स",
      category: "Startup Maharashtra",
      author: "संपादकीय मंडळ, Connect Maratha",
      date: "१२ नोव्हेंबर २०२६",
      readTime: "५ मिनिटे",
      image: "/assets/images/startup-maharashtra-hd.jpg",
      excerpt: "₹२५,००० ते ₹५०,००० मध्ये स्वतःचा व्यवसाय कसा सुरू करावा? स्थानिक कच्च्या मालावर प्रक्रिया करून हायपरलोकल डिलिव्हरी व डिजिटल सर्व्हिसेसचे प्रॅक्टिकल मॉडेल्स.",
      content: "आजच्या काळात व्यवसाय सुरू करण्यासाठी कोट्यवधींच्या भांडवलाची गरज नसते. ॲग्रो-व्हॅल्यू ॲडिशन, हायपरलोकल डिलिव्हरी नेटवर्क, क्लाउड किचन, डिजिटल मार्केटिंग कन्सल्टिंग आणि वेस्ट-टू-वेल्थ हे ५ उद्योग अत्यंत कमी गुंतवणुकीत दरमहा ₹४०,००० ते ₹१ लाखांपर्यंत नियमित उत्पन्न देऊ शकतात."
    },
    {
      id: 'art-2',
      title: "किचनपासून कॉर्पोरेटपर्यंत: कोल्हापूरच्या मसाले उद्योगाची जागतिक भरारी",
      category: "महिला उद्योजिका",
      author: "स्नेहल सावंत",
      date: "१० नोव्हेंबर २०२६",
      readTime: "४ मिनिटे",
      image: "/assets/images/women-entrepreneur-hub.jpg",
      excerpt: "पारंपारिक चवीला आधुनिक पॅकेजिंग आणि FSSAI लायसन्स जोडून थेट परदेशी ग्राहकांपर्यंत पोहोचवण्याची प्रेरणादायी गोष्ट.",
      content: "पुण्यातील तीन गृहिणींनी एकत्र येऊन सुरू केलेला घरगुती मसाल्यांचा आणि खाद्यपदार्थांचा ब्रँड आज अमेरिका आणि लंडनपर्यंत निर्यात होत आहे. बचत गटांचे नेटवर्क आणि ई-कॉमर्सचा वापर करून महिलांनी स्वतःच्या पायावर उभे राहण्याचा हा प्रेरणादायी प्रवास."
    },
    {
      id: 'art-3',
      title: "माझा पहिला ₹१ लाख नफा: व्यवसायातील कॅश-फ्लो कसा मॅनेज करावा?",
      category: "पैसा आणि प्रगती",
      author: "सीए अनिकेत पाटील",
      date: "८ नोव्हेंबर २०२६",
      readTime: "६ मिनिटे",
      image: "/assets/images/paisa-ani-pragati-hd.jpg",
      excerpt: "गल्ला आणि निव्वळ नफा यातील फरक ओळखा, कर्जाच्या सापळ्यातून दूर राहून कॅश-फ्लो सकारात्मक कसा ठेवावा?",
      content: "व्यवसाय सुरू झाल्यावर येणारा पैसा हा संपूर्ण नफा नसतो. बिझनेस अकाउंट वेगळे ठेवणे, नफ्यातील ३०% रक्कम पुन्हा व्यवसायात गुंतवणे आणि इमरजन्सी फंड तयार करणे यामुळे व्यवसाय मंदीच्या काळातही सुरक्षित कसा राहतो, हे समजून घ्या."
    },
    {
      id: 'art-4',
      title: "शिवरायांचे व्यवस्थापनशास्त्र: दुर्ग, आरमार आणि आर्थिक स्वावलंबन",
      category: "मराठा वारसा",
      author: "इतिहास अभ्यासक मंडळ",
      date: "५ नोव्हेंबर २०२६",
      readTime: "७ मिनिटे",
      image: "/assets/images/maratha-varsa-hd.jpg",
      excerpt: "छत्रपती शिवरायांनी रयतेचे राज्य उभारताना व्यापाराला दिलेले संरक्षण आणि आधुनिक बिझनेस गव्हर्नन्सचे धडे.",
      content: "शिवरायांनी केवळ लढाया जिंकल्या नाहीत, तर स्वराज्याचे स्वतंत्र चलन, आरमार निर्मिती, व्यापारी बंदरांचा विकास आणि शेतकऱ्यांना कर्जमुक्ती देऊन एक स्वावलंबी अर्थव्यवस्था निर्माण केली."
    }
  ];

  // Ad Plans
  const adPlans = [
    {
      title: "Magazine Advertisement",
      tag: "प्रिंट + डिजिटल",
      price: "₹७,५००",
      desc: "१० पानी अंकात पूर्ण किंवा अर्ध्या पानाची हाय-क्वालिटी प्रिंट व डिजिटल जाहिरात.",
      features: ["१०,०००+ वाचक संख्या", "डिजिटल आवृत्तीत कायमस्वरूपी स्थान", "सोशल मीडिया प्रमोशन"]
    },
    {
      title: "Sponsored Articles",
      tag: "कथा स्वरूप जाहिरात",
      price: "₹२,९९९",
      desc: "आपल्या उद्योग, ब्रँड व प्रवासाची सविस्तर यशोगाथा विशेष लेख स्वरूपात प्रकाशित.",
      features: ["८००+ शब्दांचा संपादकीय लेख", "फोटो व कंपनी संपर्क तपशील", "Google SEO इंडेक्सिंग"],
      featured: true
    },
    {
      title: "Business Listings",
      tag: "प्रीमियम डिरेक्टरी",
      price: "₹४९९ / वर्ष",
      desc: "Connect Maratha च्या अधिकृत बिझनेस नेटवर्क व डिरेक्टरीमध्ये थेट नोंदणी.",
      features: ["लोगो, नाव व कार्यक्षेत्र", "थेट WhatsApp चॅट लिंक", "१ वर्षाची व्हॅलिडिटी"]
    },
    {
      title: "Brand Partnerships",
      tag: "वार्षिक भागीदारी",
      price: "₹२५,०००",
      desc: "Connect Maratha च्या संपूर्ण डिजिटल व प्रिंट परिसंस्थेचे वार्षिक अधिकृत भागीदार.",
      features: ["प्रत्येक अंकातील जाहिरात स्लॉट", "इव्हेंट स्पॉन्सरशिप कव्हरेज", "VIP नेटवर्किंग प्रवेश"]
    }
  ];

  // Previous Issues
  const previousIssues = [
    {
      month: "ऑक्टोबर २०२६",
      title: "अ‍ॅग्रो-टेक व निर्यात क्रांती",
      theme: "शेती प्रक्रिया व शेतकरी ते ग्लोबल मार्केट",
      pages: "१० पाने",
      cover: "/assets/images/agrotech-kranti-hd.jpg"
    },
    {
      month: "सप्टेंबर २०२६",
      title: "महिला शक्ती व स्टार्टअप्स",
      theme: "गृहउद्योग ते मॅन्युफॅक्चरिंग ब्रँड",
      pages: "१० पाने",
      cover: "/assets/images/women-entrepreneur-hub.jpg"
    },
    {
      month: "ऑगस्ट २०२६",
      title: "स्वातंत्र्य व स्वराज्य विशेषांक",
      theme: "महाराष्ट्रातील ऐतिहासिक उद्योग वारसा",
      pages: "१० पाने",
      cover: "/assets/images/maratha-varsa-hd.jpg"
    }
  ];

  const scrollTo = (id) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openArticle = (article) => {
    setActiveArticle(article);
    setArticleModalOpen(true);
  };

  const handleAdSubmit = (e) => {
    e.preventDefault();
    setAdError('');
    if (!adForm.name.trim() || !adForm.businessName.trim() || !adForm.mobile.trim()) {
      setAdError('कृपया सर्व आवश्यक माहिती प्रविष्ट करा.');
      return;
    }
    if (!/^\d{10}$/.test(adForm.mobile.replace(/[^0-9]/g, ''))) {
      setAdError('कृपया वैध १० अंकी मोबाइल क्रमांक प्रविष्ट करा.');
      return;
    }
    setAdSubmitting(true);
    setTimeout(() => {
      setAdSubmitting(false);
      setAdSuccess(true);
      setTimeout(() => {
        setAdSuccess(false);
        setAdModalOpen(false);
        setAdForm({ name: '', businessName: '', mobile: '', email: '', adType: 'Magazine Advertisement', message: '' });
      }, 3500);
    }, 900);
  };

  const handleContributorSubmit = (e) => {
    e.preventDefault();
    setContributorError('');
    if (!contributorForm.name.trim() || !contributorForm.district.trim() || !contributorForm.mobile.trim()) {
      setContributorError('कृपया सर्व आवश्यक माहिती प्रविष्ट करा.');
      return;
    }
    if (!/^\d{10}$/.test(contributorForm.mobile.replace(/[^0-9]/g, ''))) {
      setContributorError('कृपया वैध १० अंकी मोबाइल क्रमांक प्रविष्ट करा.');
      return;
    }
    setContributorSubmitting(true);
    setTimeout(() => {
      setContributorSubmitting(false);
      setContributorSuccess(true);
      setTimeout(() => {
        setContributorSuccess(false);
        setContributorForm({ name: '', district: '', profession: '', email: '', mobile: '', writingInterest: '' });
      }, 3500);
    }, 900);
  };

  return (
    <div className="cm-mag-full-wrapper">

      {/* ============================================================
          1. COMPACT SINGLE-LINE MAGAZINE SUB-NAVBAR
          ============================================================ */}
      <nav className={`cm-mag-subnav ${isScrolled ? 'cm-scrolled' : ''}`}>
        <div className="cm-mag-subnav-inner">
          <div className="cm-mag-brand">
            <span style={{ fontSize: '1.35rem' }}>🚩</span>
            <div className="cm-mag-brand-title">
              CONNECT मराठा <span>MAGAZINE</span>
            </div>
          </div>

          <ul className="cm-mag-nav-links">
            <li>
              <span 
                className={`cm-mag-nav-link ${activeNav === 'home' ? 'active' : ''}`}
                onClick={() => scrollTo('hero-section')}
                style={{ cursor: 'pointer' }}
              >
                मुख्यपृष्ठ
              </span>
            </li>
            <li>
              <span 
                className={`cm-mag-nav-link ${activeNav === 'cover-story' ? 'active' : ''}`}
                onClick={() => scrollTo('cover-story-section')}
                style={{ cursor: 'pointer' }}
              >
                Cover Story
              </span>
            </li>
            <li>
              <span 
                className={`cm-mag-nav-link ${activeNav === 'categories' ? 'active' : ''}`}
                onClick={() => scrollTo('categories-section')}
                style={{ cursor: 'pointer' }}
              >
                विभाग (Sections)
              </span>
            </li>
            <li>
              <span 
                className={`cm-mag-nav-link ${activeNav === 'latest-issue' ? 'active' : ''}`}
                onClick={() => scrollTo('latest-issue-section')}
                style={{ cursor: 'pointer' }}
              >
                चालू अंक
              </span>
            </li>
            <li>
              <span 
                className={`cm-mag-nav-link ${activeNav === 'advertise' ? 'active' : ''}`}
                onClick={() => scrollTo('advertise-section')}
                style={{ cursor: 'pointer' }}
              >
                जाहिरात (Advertise)
              </span>
            </li>
            <li>
              <span 
                className={`cm-mag-nav-link ${activeNav === 'contributor' ? 'active' : ''}`}
                onClick={() => scrollTo('contributor-section')}
                style={{ cursor: 'pointer' }}
              >
                लेखक नोंदणी
              </span>
            </li>
          </ul>

          <div>
            <button 
              onClick={() => navigate('/magazine/reader')}
              className="cm-nav-btn-compact"
              style={{ cursor: 'pointer' }}
            >
              <span>📖 अंक वाचा (Read Issue)</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================
          2. EXACT HERO SECTION & THREE FEATURED CARDS (100% CRISP VECTOR UI)
          ============================================================ */}
      <section id="hero-section" className="cm-hero-pixel-perfect">
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Main Hero Banner: Harmonious Full-Background Layout with Right Image & Left Vector Content */}
          <div className="cm-hero-main-card">
            
            {/* Ambient Floating Glow behind Hero */}
            <div className="cm-hero-ambient-glow" />

            {/* Background Artwork Layer: full natural cover right-aligned */}
            <div className="cm-hero-artwork-bg">
              <img 
                src="/assets/images/user-reader-fort-full.jpg" 
                alt="मराठमोळी वाचक तरुणी, रायगड किल्ला आणि कनेक्ट मराठा मॅगझिन" 
                className="cm-hero-artwork-bg-img"
              />
              <div className="cm-hero-bg-overlay" />
            </div>

            {/* Left Content Side: Crisp vector typography and active buttons */}
            <div className="cm-hero-content-side">
              
              <div className="cm-hero-pill-badge">
                <span className="cm-badge-icon">📖</span>
                <span>CONNECT मराठा • DIGITAL & PRINT MAGAZINE</span>
              </div>

              <h1 className="cm-hero-title-h1">
                CONNECT मराठा <br />
                <span className="cm-hero-title-gradient">MAGAZINE</span>
              </h1>

              <p className="cm-hero-tagline-p">
                युवा • उद्योजकता • व्यवसाय • संधी • संस्कृती
              </p>

              <p className="cm-hero-desc-p">
                महाराष्ट्राच्या नव्या पिढीचा विचार, व्यवसाय आणि प्रगतीचा आवाज.
              </p>

              {/* Two Functional CTA Buttons */}
              <div className="cm-hero-actions-row">
                <button 
                  onClick={() => navigate('/magazine/reader')}
                  className="cm-hero-primary-cta"
                  id="cm-hero-read-btn"
                >
                  <span>📖 पहिला अंक वाचा</span>
                  <span className="cm-arrow">➔</span>
                </button>

                <button 
                  onClick={() => scrollTo('advertise-section')}
                  className="cm-hero-secondary-cta"
                  id="cm-hero-ad-btn"
                >
                  <span>🤝 जाहिरात व भागीदारी</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="cm-hero-stats-line">
                <div className="cm-hero-stat-item">
                  <span className="cm-stat-emoji">👥</span>
                  <div>
                    <strong className="cm-stat-b">10+</strong>
                    <span className="cm-stat-s">संपादकीय विभाग</span>
                  </div>
                </div>

                <div className="cm-hero-stat-separator" />

                <div className="cm-hero-stat-item">
                  <span className="cm-stat-emoji">📖</span>
                  <div>
                    <strong className="cm-stat-b">100+</strong>
                    <span className="cm-stat-s">प्रेरणादायी कथा</span>
                  </div>
                </div>

                <div className="cm-hero-stat-separator" />

                <div className="cm-hero-stat-item">
                  <span className="cm-stat-emoji">🏆</span>
                  <div>
                    <strong className="cm-stat-b">महाराष्ट्रव्यापी</strong>
                    <span className="cm-stat-s">उद्योजक व्यासपीठ</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Clickable zone on the right image for reading the magazine */}
            <div 
              className="cm-hero-right-click-zone"
              onClick={() => navigate('/magazine/reader')}
              title="१० पानांचा संपूर्ण डिजिटल अंक वाचण्यासाठी क्लिक करा"
            />

          </div>

          {/* 3 High-Definition, Crystal Clear Featured Bottom Cards */}
          <div className="cm-hero-bottom-grid cm-reveal">
            
            {/* Card 1: युवा उद्योजक विशेषांक */}
            <div 
              className="cm-perfect-card cm-stagger-1"
              style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
              onClick={() => navigate('/magazine/reader')}
            >
              <div className="cm-card-photo-box">
                <img src="/assets/images/user-yuva-udyojak-visheshank.jpg" alt="युवा उद्योजक विशेषांक" />
              </div>
              <div className="cm-card-text-box">
                <h3 className="cm-card-main-heading">
                  युवा उद्योजक <br />
                  <span>विशेषांक</span>
                </h3>
                <p className="cm-card-summary">
                  स्वप्न मोठं ठेवा... उद्योजक बना!
                </p>
                <button 
                  type="button"
                  className="cm-card-action-btn"
                  style={{ position: 'relative', zIndex: 20, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/magazine/reader');
                  }}
                >
                  <span>अंक वाचा (पान १)</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

            {/* Card 2: Startup Maharashtra */}
            <div 
              className="cm-perfect-card cm-stagger-2"
              style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
              onClick={() => navigate('/magazine/reader')}
            >
              <div className="cm-card-photo-box">
                <img src="/assets/images/startup-maharashtra-hd.jpg" alt="Startup Maharashtra" />
              </div>
              <div className="cm-card-text-box">
                <h3 className="cm-card-main-heading">
                  Startup <br />
                  <span>Maharashtra</span>
                </h3>
                <p className="cm-card-summary">
                  नव्या कल्पना, नवे स्टार्ट-अप, नवीन महाराष्ट्र!
                </p>
                <button 
                  type="button"
                  className="cm-card-action-btn"
                  style={{ position: 'relative', zIndex: 20, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/magazine/reader');
                  }}
                >
                  <span>अंक वाचा (पान २)</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

            {/* Card 3: मराठा वारसा */}
            <div 
              className="cm-perfect-card cm-stagger-3"
              style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
              onClick={() => navigate('/magazine/reader')}
            >
              <div className="cm-card-photo-box">
                <img src="/assets/images/maratha-varsa-hd.jpg" alt="मराठा वारसा" />
              </div>
              <div className="cm-card-text-box">
                <h3 className="cm-card-main-heading">
                  मराठा वारसा
                </h3>
                <p className="cm-card-summary">
                  इतिहास, संस्कृती आणि अभिमानाची परंपरा.
                </p>
                <button 
                  type="button"
                  className="cm-card-action-btn"
                  style={{ position: 'relative', zIndex: 20, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/magazine/reader');
                  }}
                >
                  <span>अंक वाचा (पान ९)</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          3. MUKHYA AAKARSHAN STRIP
          ============================================================ */}
      <section className="cm-mukhya-strip cm-reveal">
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          
          <div className="cm-mukhya-header">
            <div className="cm-mukhya-badge">
              <span>🌟</span>
              <span>मुख्य आकर्षण • विशेष संपादकीय विभाग</span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.96rem', margin: '8px 0 0', fontWeight: 600 }}>
              महाराष्ट्राच्या प्रगतीची नवी दिशा — वाचा, प्रेरित व्हा आणि स्वतःचा व्यवसाय घडवा
            </p>
          </div>

          <div className="cm-mukhya-grid">
            
            {/* 1. महिला उद्योजिका */}
            <div 
              className="cm-strip-card"
              onClick={() => {
                setActiveArticle({
                  title: "महिला उद्योजिका: स्वकर्तृत्वाने घडवलेले व्यवसाय साम्राज्य",
                  category: "महिला उद्योजिका",
                  author: "संपादकीय मंडळ, Connect Maratha",
                  date: "नोव्हेंबर २०२६",
                  readTime: "५ मिनिटे",
                  image: "/assets/images/women-entrepreneur-hub.jpg",
                  keyPoints: [
                    "बचत गट ते आंतरराष्ट्रीय निर्यात ब्रँड्स",
                    "FSSAI, पॅकेजिंग व ई-कॉमर्सद्वारे विक्री",
                    "महिलांसाठी विशेष शासकीय कर्ज व अनुदान योजना"
                  ],
                  content: "पारंपारिक कला, अन्नप्रक्रिया, वस्त्रोद्योग आणि तंत्रज्ञान क्षेत्रात यशस्वी झेप घेणाऱ्या मराठमोळ्या महिलांची यशोगाथा आणि उद्योग वाढीसाठी महिला उद्योजक केंद्राचे सहकार्य."
                });
                setArticleModalOpen(true);
              }}
            >
              <img src="/assets/images/women-entrepreneur-hub.jpg" alt="महिला उद्योजिका" />
              <div className="cm-strip-overlay">
                <div className="cm-strip-content-wrap">
                  <span className="cm-strip-category-tag">नेतृत्व</span>
                  <span className="cm-strip-title">महिला उद्योजिका</span>
                </div>
                <span className="cm-strip-arrow">➔</span>
              </div>
            </div>

            {/* 2. ॲग्री-टेक व ग्रामीण उद्योग */}
            <div 
              className="cm-strip-card"
              onClick={() => {
                setActiveArticle({
                  title: "ॲग्रो-टेक क्रांती: शेती प्रक्रिया व आधुनिक ग्रामीण उद्योग",
                  category: "ॲग्रो-टेक व ग्रामीण उद्योग",
                  author: "संपादकीय मंडळ, Connect Maratha",
                  date: "नोव्हेंबर २०२६",
                  readTime: "६ मिनिटे",
                  image: "/assets/images/agrotech-kranti-hd.jpg",
                  keyPoints: [
                    "शेतकरी ते थेट जागतिक बाजारपेठ (FPO मॉडेल)",
                    "फळप्रक्रिया, कोल्ड-स्टोरेज व पॅकेजिंग क्लस्टर्स",
                    "स्मार्ट ड्रिप आणि ड्रोन तंत्रज्ञानाचा शेतीत वापर"
                  ],
                  content: "महाराष्ट्रातील शेतीमालाला आधुनिक प्रक्रिया आणि ब्रँडिंग जोडून शेतकऱ्यांच्या मुलांनी सुरू केलेल्या यशस्वी ॲग्रो-स्टार्टअप्स आणि अन्नप्रक्रिया उद्योगांची संपूर्ण यशोगाथा."
                });
                setArticleModalOpen(true);
              }}
            >
              <img src="/assets/images/agrotech-kranti-hd.jpg" alt="ॲग्रो-टेक क्रांती" />
              <div className="cm-strip-overlay">
                <div className="cm-strip-content-wrap">
                  <span className="cm-strip-category-tag">शेती व प्रक्रिया</span>
                  <span className="cm-strip-title">ॲग्रो-टेक क्रांती</span>
                </div>
                <span className="cm-strip-arrow">➔</span>
              </div>
            </div>

            {/* 3. पैसा आणि प्रगती */}
            <div 
              className="cm-strip-card"
              onClick={() => {
                setActiveArticle({
                  title: "पैसा आणि प्रगती: व्यवसायातील आर्थिक साक्षरता व भांडवल नियोजन",
                  category: "पैसा आणि प्रगती",
                  author: "आर्थिक सल्लागार मंडळ",
                  date: "नोव्हेंबर २०२६",
                  readTime: "६ मिनिटे",
                  image: "/assets/images/paisa-ani-pragati-hd.jpg",
                  keyPoints: [
                    "गल्ला आणि निव्वळ नफा यातील सूक्ष्म फरक",
                    "वर्किंग कॅपिटल आणि कॅश-फ्लो पॉझिटिव्ह ठेवण्याची सूत्रे",
                    "व्यवसाय वाढीसाठी बँक कर्ज व भांडवल नियोजन"
                  ],
                  content: "व्यवसाय सुरू झाल्यावर येणारा पैसा हा संपूर्ण नफा नसतो. बिझनेस अकाउंट वेगळे ठेवणे, नफ्यातील ठरावीक रक्कम पुन्हा व्यवसायात गुंतवणे आणि सुरक्षित भांडवल उभारणीचे मूलभूत नियम."
                });
                setArticleModalOpen(true);
              }}
            >
              <img src="/assets/images/paisa-ani-pragati-hd.jpg" alt="पैसा आणि प्रगती" />
              <div className="cm-strip-overlay">
                <div className="cm-strip-content-wrap">
                  <span className="cm-strip-category-tag">आर्थिक साक्षरता</span>
                  <span className="cm-strip-title">पैसा आणि प्रगती</span>
                </div>
                <span className="cm-strip-arrow">➔</span>
              </div>
            </div>

            {/* 4. युवा करिअर व तंत्रज्ञान */}
            <div 
              className="cm-strip-card"
              onClick={() => {
                setActiveArticle({
                  title: "युवा करिअर: AI, तंत्रज्ञान व आधुनिक नोकऱ्यांमधील संधी",
                  category: "युवा करिअर",
                  author: "करिअर समुपदेशन मंडळ",
                  date: "नोव्हेंबर २०२६",
                  readTime: "५ मिनिटे",
                  image: "/assets/images/yuva-career-tech-hd.jpg",
                  keyPoints: [
                    "पारंपारिक पदवीनंतर हाय-डिमांड टेक करिअर्स",
                    "आर्टिफिशिअल इंटेलिजन्स (AI) व डेटा ॲनालिटिक्स",
                    "मराठी तरुणांसाठी कौशल्यवृद्धी व जागतिक संधी"
                  ],
                  content: "तंत्रज्ञान युगात तरुणांसाठी उपलब्ध नव्या नोकऱ्या, कौशल्य विकास (Skill Development) आणि जागतिक पातळीवर संधी मिळवण्यासाठी आवश्यक पूर्वतयारी."
                });
                setArticleModalOpen(true);
              }}
            >
              <img src="/assets/images/yuva-career-tech-hd.jpg" alt="युवा करिअर व तंत्रज्ञान" />
              <div className="cm-strip-overlay">
                <div className="cm-strip-content-wrap">
                  <span className="cm-strip-category-tag">कौशल्य विकास</span>
                  <span className="cm-strip-title">युवा करिअर & Tech</span>
                </div>
                <span className="cm-strip-arrow">➔</span>
              </div>
            </div>

            {/* 5. जिल्हा उद्योग व सहकार्य नेटवर्क */}
            <div 
              className="cm-strip-card"
              onClick={() => {
                setActiveArticle({
                  title: "महाराष्ट्र बिझनेस संगम: जिल्हा उद्योग व सहकार्य नेटवर्क",
                  category: "जिल्हा उद्योग",
                  author: "Connect Maratha Network",
                  date: "नोव्हेंबर २०२६",
                  readTime: "५ मिनिटे",
                  image: "/assets/images/maratha-business-sangam.jpg",
                  keyPoints: [
                    "३६ जिल्ह्यांमधील स्थानिक MIDC संधी",
                    "उद्योजकांचे परस्परांमधील व्यावसायिक सहकार्य व रेफरल्स",
                    "ग्रामीण भागातील उद्योग क्लस्टर्स व बाजारपेठ"
                  ],
                  content: "महाराष्ट्रातील प्रत्येक जिल्ह्यातील स्थानिक उत्पादने, एमआयडीसी क्लस्टर आणि ग्रामीण भागातील व्यावसायिक संधींचे एकसंध नेटवर्क. संपूर्ण राज्यातील उद्योजकांना एकत्र आणणारे व्यासपीठ."
                });
                setArticleModalOpen(true);
              }}
            >
              <img src="/assets/images/maratha-business-sangam.jpg" alt="महाराष्ट्र बिझनेस संगम" />
              <div className="cm-strip-overlay">
                <div className="cm-strip-content-wrap">
                  <span className="cm-strip-category-tag">बिझनेस नेटवर्क</span>
                  <span className="cm-strip-title">जिल्हा उद्योग संगम</span>
                </div>
                <span className="cm-strip-arrow">➔</span>
              </div>
            </div>

            {/* 6. Maratha Management Science Card */}
            <div 
              className="cm-strip-card"
              onClick={() => {
                setActiveArticle({
                  title: "शिवकालीन व्यवस्थापनशास्त्र: आधुनिक उद्योजकतेची २५ सोनेरी सूत्रे",
                  category: "मराठा व्यवस्थापनशास्त्र",
                  author: "Connect Maratha Editorial Desk",
                  date: "नोव्हेंबर २०२६",
                  readTime: "७ मिनिटे",
                  image: "/assets/images/maratha-vyavasthapan-hd.jpg",
                  keyPoints: [
                    "दुर्ग व्यवस्थापन ते आधुनिक कॉर्पोरेट स्ट्रॅटेजी व रिस्क मॅनेजमेंट",
                    "अष्टप्रधान मंडळ: प्रभावी डेलिगेशन व टीम लीडरशिपचे धडे",
                    "शून्य भांडवलातून स्वराज्य उभारणी — आजच्या स्टार्टअप्ससाठी प्रेरणा",
                    "आर्थिक शिस्त, जलसंधारण आणि रयतेच्या कल्याणाचा शाश्वत व्यवसाय दृष्टिकोन"
                  ],
                  content: "छत्रपती शिवाजी महाराजांनी स्थापन केलेले स्वराज्य हे केवळ लष्करी विजय नसून ते उत्कृष्ट प्रशासन, संसाधन नियोजन (Resource Management) आणि आर्थिक दूरदृष्टीचे जागतिक उदाहरण होते. आधुनिक उद्योजकांनी आपल्या व्यवसायात ही मूल्ये कशी अमलात आणावीत याचे सविस्तर विश्लेषण."
                });
                setArticleModalOpen(true);
              }}
            >
              <img src="/assets/images/maratha-vyavasthapan-hd.jpg" alt="मराठा व्यवस्थापनशास्त्र" />
              <div className="cm-strip-overlay">
                <div className="cm-strip-content-wrap">
                  <span className="cm-strip-category-tag">व्यवस्थापन विचार</span>
                  <span className="cm-strip-title">मराठा व्यवस्थापन</span>
                </div>
                <span className="cm-strip-arrow">➔</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          4. FEATURED COVER STORY (Two-Column Editorial Section)
          ============================================================ */}
      <section id="cover-story-section" className="cm-reveal" style={{ padding: '34px 24px 44px', background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF0DE 100%)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 50%, #FFEFE0 100%)',
            borderRadius: '20px',
            border: '2px solid #FFB74D',
            boxShadow: '0 12px 32px -8px rgba(230, 81, 0, 0.16), 0 3px 10px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1.25fr 0.75fr',
            height: '320px',
            alignItems: 'stretch',
            width: '100%'
          }}>
            {/* Left Editorial Text */}
            <div style={{ padding: '28px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  color: '#C73800',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, #FFEFE5 0%, #FFDEC7 100%)',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  border: '1.5px solid #FFB74D'
                }}>
                  ⭐ युवा उद्योजक विशेषांक • नोव्हेंबर २०२६
                </span>
              </div>

              <h2 style={{
                fontSize: 'clamp(1.35rem, 1.8vw, 1.6rem)',
                fontWeight: 900,
                color: '#1E293B',
                lineHeight: 1.25,
                margin: '0 0 10px',
                letterSpacing: '-0.3px'
              }}>
                एका छोट्या कल्पनेतून मोठा व्यवसाय कसा उभा कराल?
              </h2>

              <p style={{
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: 1.55,
                margin: '0 0 14px',
                fontWeight: 500,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                कोणतीही कौटुंबिक व्यावसायिक पार्श्वभूमी नसताना, केवळ कल्पकता आणि चिकाटीच्या जोरावर ग्रामीण महाराष्ट्रातील तरुणाने तंत्रज्ञान व शेती सप्लाय क्षेत्रात ३०० हून अधिक जणांना रोजगार देणारा उद्योग उभा केला. पहिल्या १०० ग्राहकांचा शोध आणि घेतलेले कठीण निर्णय याबद्दलची थेट मुलाखत.
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                marginBottom: '16px',
                color: '#64748B',
                fontSize: '0.78rem',
                fontWeight: 600
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#E65100' }}>✍️</span> संपादकीय मंडळ, Connect Maratha
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#E65100' }}>⏱️</span> ७ मिनिटे वाचन
                </span>
              </div>

              <div>
                <button 
                  onClick={() => navigate('/magazine/reader')}
                  className="cm-card-action-btn"
                  style={{
                    padding: '7px 22px',
                    fontSize: '0.84rem',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 12px rgba(199, 56, 0, 0.3)',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span>संपूर्ण कव्हर स्टोरी वाचा (पान १)</span>
                  <span style={{ fontSize: '0.88rem' }}>➔</span>
                </button>
              </div>
            </div>

            {/* Right: Clean authentic Maharashtrian Entrepreneur Photo in Modern Warm Office */}
            <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#FFF5EB' }}>
              <img 
                src="/assets/images/cover-story-maharashtrian-entrepreneur-clean.jpg" 
                alt="मराठी युवा उद्योजक - Connect Maratha Cover Story" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
              />
              {/* Subtle Gradient Shade on Left Edge */}
              <div style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: '40px',
                background: 'linear-gradient(90deg, rgba(255, 253, 249, 0.85) 0%, transparent 100%)',
                pointerEvents: 'none'
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. EXPLORE ALL 10 MAGAZINE PILLARS
          ============================================================ */}
      <section id="categories-section" className="cm-reveal" style={{
        padding: '75px 24px 85px',
        background: 'linear-gradient(180deg, #FFF3E6 0%, #FFEAD4 50%, #FFF8F1 100%)',
        borderTop: '2.5px solid #FFCC80',
        borderBottom: '2.5px solid #FFCC80'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '46px' }}>
            <span style={{ 
              color: '#FFFFFF', 
              fontWeight: 900, 
              fontSize: '0.85rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #F4511E 0%, #E65100 100%)',
              padding: '6px 20px',
              borderRadius: '9999px',
              display: 'inline-block',
              boxShadow: '0 4px 14px rgba(230, 81, 0, 0.25)'
            }}>
              MAGAZINE SECTIONS
            </span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 3.8vw, 2.75rem)', fontWeight: 900, color: '#1E293B', margin: '12px 0 10px', letterSpacing: '-0.3px' }}>
              मॅगझिनचे १० प्रमुख विभाग
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', fontWeight: 600 }}>
              महाराष्ट्राच्या आर्थिक, सामाजिक, शैक्षणिक आणि सांस्कृतिक विकासाला दिशा देणारे विशेष स्तंभ.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {categories.map((cat, catIdx) => {
              // Direct mapping to the 10 reader pages:
              // 1: Cover Story (page 1)
              // 2: Startup Maharashtra (page 2)
              // 3: Business Blueprint (page 3)
              // 4: Women in Business (page 5)
              // 5: Money & Wealth (page 6)
              // 6: District Business (page 7)
              // 7: Youth Career (page 8)
              // 8: Maratha Varsa (page 9)
              // 9: Success Stories (page 1)
              // 10: Future Maharashtra (page 4)
              const pageMapping = [1, 2, 3, 5, 6, 7, 8, 9, 1, 4];
              const targetPage = pageMapping[catIdx] || (catIdx + 1);

              return (
                <div 
                  key={cat.id} 
                  className="cm-cat-card-grid"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/magazine/reader?page=${targetPage}`)}
                  title={`${cat.title} - पान ${targetPage} वाचा`}
                >
                  <img src={cat.img} alt={cat.title} />
                  <div className="cm-cat-card-overlay">
                    <h4 className="cm-cat-card-title">{cat.title}</h4>
                    <p className="cm-cat-sub">{cat.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================
          6. TRENDING STORIES
          ============================================================ */}
      <section className="cm-reveal" style={{ padding: '70px 24px 85px', maxWidth: '1440px', margin: '0 auto', background: '#FFF8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '34px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ 
              color: '#C73800', 
              fontWeight: 800, 
              fontSize: '0.8rem', 
              letterSpacing: '1.2px', 
              textTransform: 'uppercase',
              background: '#FFE8D6',
              padding: '4px 14px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '8px',
              border: '1.5px solid #FFB74D',
              boxShadow: '0 2px 8px rgba(230, 81, 0, 0.1)'
            }}>
              ⭐ TOP EDITORIAL PICKS
            </span>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.45rem)', fontWeight: 900, color: '#1E293B', margin: '4px 0 0', letterSpacing: '-0.3px' }}>
              या आठवड्यातील ट्रेंडिंग लेख
            </h2>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/magazine/reader')}
            style={{ 
              color: '#FFFFFF', 
              fontWeight: 800, 
              fontSize: '0.92rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 22px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #F4511E 0%, #E65100 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(230, 81, 0, 0.28)',
              transition: 'all 0.25s ease'
            }}
          >
            सर्व लेख पहा ➔
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '28px',
          alignItems: 'stretch'
        }}>
          {/* Main Large Featured Story Card */}
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #FFB74D',
              overflow: 'hidden',
              boxShadow: '0 12px 32px -6px rgba(230, 81, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onClick={() => navigate('/magazine/reader?page=2')}
          >
            <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={articles[0].image} 
                alt={articles[0].title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'linear-gradient(135deg, #F4511E 0%, #C73800 100%)',
                color: '#FFFFFF',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.4px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.25)'
              }}>
                {articles[0].category}
              </span>
            </div>

            <div style={{ padding: '26px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.38rem', fontWeight: 900, color: '#1E293B', lineHeight: 1.35, margin: '0 0 10px' }}>
                {articles[0].title}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 18px', flex: 1, fontWeight: 500 }}>
                {articles[0].excerpt}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1.5px solid #FFE0B2', fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                <span>✍️ {articles[0].author}</span>
                <span>⏱️ {articles[0].readTime}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/magazine/reader?page=2');
                }}
                className="cm-card-action-btn"
                style={{ 
                  marginTop: '16px', 
                  padding: '9px 24px', 
                  fontSize: '0.88rem',
                  borderRadius: '9999px',
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 14px rgba(199, 56, 0, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <span>संपूर्ण लेख वाचा</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          {/* 3 Smaller Stories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
            {articles.slice(1, 4).map((art, idx) => {
              // art-2 is Women in Business -> page 5
              // art-3 is Money & Wealth -> page 6
              // art-4 is Maratha Varsa -> page 9
              const articlePageMap = {
                'art-2': 5,
                'art-3': 6,
                'art-4': 9
              };
              const targetPage = articlePageMap[art.id] || 1;

              return (
                <div 
                  key={art.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.8px solid #FFB74D',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    height: '136px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(230, 81, 0, 0.08)',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={() => navigate(`/magazine/reader?page=${targetPage}`)}
                >
                  <div style={{ width: '150px', height: '100%', flexShrink: 0, overflow: 'hidden' }}>
                    <img 
                      src={art.image} 
                      alt={art.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{ padding: '14px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ color: '#E65100', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {art.category}
                    </span>
                    <h4 style={{ 
                      fontSize: '1.02rem', 
                      fontWeight: 800, 
                      color: '#1E293B', 
                      margin: '3px 0 6px', 
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {art.title}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>⏱️ {art.readTime}</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/magazine/reader?page=${targetPage}`);
                        }}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#E65100', 
                          fontSize: '0.82rem', 
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        वाचा ➔
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================
          7. LATEST MONTHLY ISSUE & ARCHIVES
          ============================================================ */}
      <section id="latest-issue-section" className="cm-reveal" style={{
        padding: '75px 24px 90px',
        background: 'linear-gradient(135deg, #FFEFE0 0%, #FFE2C6 50%, #FFF3E6 100%)',
        borderTop: '2.5px solid #FFCC80',
        borderBottom: '2.5px solid #FFCC80'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDFB 60%, #FFF5EB 100%)',
            borderRadius: '24px',
            border: '2px solid #FFB74D',
            padding: '42px 48px',
            boxShadow: '0 20px 50px -15px rgba(230, 81, 0, 0.22)',
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.1fr',
            gap: '48px',
            alignItems: 'center',
            marginBottom: '60px'
          }}>
            {/* Left Realistic 3D Magazine Cover Mockup */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 24px 48px -12px rgba(199, 56, 0, 0.35), 0 8px 18px rgba(0,0,0,0.12)',
                  border: '3px solid #FFFFFF',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'linear-gradient(145deg, #881337 0%, #7F1D1D 40%, #C73800 100%)',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease'
                }}
                onClick={() => navigate('/magazine/reader')}
              >
                {/* Embedded Magazine Header */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 75%, transparent 100%)',
                  padding: '16px 14px 28px',
                  zIndex: 2,
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '1.5px', color: '#FDE68A', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                    🚩 डिजिटल व प्रिंट मासिक
                  </span>
                  <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0', letterSpacing: '0.5px' }}>
                    CONNECT मराठा <span style={{ color: '#FDBA74' }}>MAGAZINE</span>
                  </h3>
                </div>

                <img 
                  src="/assets/images/user-reader-fort-full.jpg" 
                  alt="Connect Maratha Magazine November 2026 Issue" 
                  style={{ width: '100%', height: '410px', objectFit: 'cover', display: 'block' }}
                />

                {/* Magazine Foot Banner */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(0deg, rgba(127, 29, 29, 0.96) 0%, rgba(199, 56, 0, 0.88) 70%, transparent 100%)',
                  padding: '24px 16px 16px',
                  zIndex: 2,
                  textAlign: 'left'
                }}>
                  <span style={{ 
                    background: '#FBBF24', 
                    color: '#7F1D1D', 
                    fontSize: '0.68rem', 
                    fontWeight: 900, 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    नोव्हेंबर २०२६ विशेषांक
                  </span>
                  <p style={{ color: '#FFFFFF', fontSize: '0.94rem', fontWeight: 800, margin: '6px 0 0', lineHeight: 1.25 }}>
                    “एका छोट्या कल्पनेतून मोठा व्यवसाय कसा उभा कराल?”
                  </p>
                  <p style={{ color: '#FED7AA', fontSize: '0.74rem', margin: '4px 0 0', fontWeight: 600 }}>
                    १० पाने सविस्तर डिजिटल आवृत्ती • मोफत वाचा ➔
                  </p>
                </div>
              </div>

              <p style={{ marginTop: '16px', color: '#78350F', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📖</span> नोव्हेंबर २०२६ अंक • पूर्ण १० पाने हाय-डेफिनिशन डिजिटल एडिशन
              </p>
            </div>

            {/* Right Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div>
                <span style={{
                  background: 'linear-gradient(135deg, #FFEFE5 0%, #FFE5D4 100%)',
                  color: '#C73800',
                  padding: '5px 16px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  border: '1.2px solid rgba(230, 81, 0, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ⭐ LATEST MONTHLY EDITION
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.35rem)', fontWeight: 900, color: '#1E293B', margin: '14px 0 14px', lineHeight: 1.25, letterSpacing: '-0.3px' }}>
                CONNECT मराठा MAGAZINE <span style={{ color: '#C73800' }}>(नोव्हेंबर २०२६)</span>
              </h2>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 24px', fontWeight: 500 }}>
                या पहिल्या अंकात वाचा: कमी भांडवलातील ५ स्टार्टअप्स, पहिल्या १०० ग्राहकांसाठी झिरो-बजेट मार्केटिंग, महिलांचे फूड ब्रँड्स आणि शिवरायांचे आधुनिक बिझनेस गव्हर्नन्स.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '28px',
                background: '#FFFFFF',
                padding: '18px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(230, 81, 0, 0.18)',
                boxShadow: '0 4px 14px rgba(230, 81, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span style={{ color: '#E65100', fontSize: '1.1rem' }}>✓</span> पान १: कव्हर स्टोरी मुलाखत
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span style={{ color: '#E65100', fontSize: '1.1rem' }}>✓</span> पान २: स्टार्टअप महाराष्ट्र
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span style={{ color: '#E65100', fontSize: '1.1rem' }}>✓</span> पान ३: बिझनेस ब्लूप्रिंट
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span style={{ color: '#E65100', fontSize: '1.1rem' }}>✓</span> पान ४-१०: करिअर, पैसा व वारसा
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={() => navigate('/magazine/reader')}
                  className="cm-card-action-btn"
                  style={{
                    padding: '11px 26px',
                    fontSize: '0.94rem',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 16px rgba(199, 56, 0, 0.3)',
                    gap: '8px'
                  }}
                >
                  <span>📖 अंक वाचा (Open Reader)</span>
                  <span>➔</span>
                </button>

                <button 
                  onClick={() => scrollTo('contributor-section')}
                  style={{
                    padding: '10px 22px',
                    fontSize: '0.9rem',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    color: '#C73800',
                    fontWeight: 800,
                    border: '1.5px solid rgba(230, 81, 0, 0.35)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <span>पुढील अंकात सहभागी व्हा</span>
                </button>
              </div>

            </div>
          </div>

          {/* Previous Issues */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ color: '#E65100', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                MAGAZINE ARCHIVES
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', margin: '4px 0 0' }}>
                मागील विशेषांक (Previous Issues)
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {previousIssues.map((issue, idx) => {
                // October (Agrotech / Startup) -> page 2
                // September (Women in Business) -> page 5
                // August (Maratha Varsa / Swarajya) -> page 9
                const archivePageMap = [2, 5, 9];
                const targetPage = archivePageMap[idx] || 1;

                return (
                  <div 
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid rgba(230, 81, 0, 0.15)',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                      transition: 'all 0.25s ease'
                    }}
                    onClick={() => navigate(`/magazine/reader?page=${targetPage}`)}
                    title={`${issue.title} - पान ${targetPage} उघडा`}
                  >
                    <div style={{ 
                      width: '90px', 
                      height: '115px', 
                      flexShrink: 0, 
                      borderRadius: '10px', 
                      overflow: 'hidden', 
                      border: '1.2px solid rgba(230, 81, 0, 0.25)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <img 
                        src={issue.cover} 
                        alt={issue.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ 
                        color: '#C73800', 
                        fontSize: '0.74rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase',
                        background: '#FFEFE5',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        {issue.month}
                      </span>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#1E293B', margin: '3px 0 3px', lineHeight: 1.3 }}>{issue.title}</h4>
                      <p style={{ color: '#64748B', fontSize: '0.8rem', margin: '0 0 6px', lineHeight: 1.35, fontWeight: 500 }}>{issue.theme}</p>
                      <span style={{ color: '#C73800', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>अंक पहा (पान {targetPage}) ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          8. ADVERTISE WITH CONNECT MARATHA
          ============================================================ */}
      <section id="advertise-section" className="cm-reveal" style={{
        padding: '85px 24px',
        background: 'linear-gradient(180deg, #FFF0DE 0%, #FFE5C8 50%, #FFF8F0 100%)',
        borderTop: '2.5px solid #FFCC80',
        borderBottom: '2.5px solid #FFCC80'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ 
              color: '#FFFFFF', 
              fontWeight: 900, 
              fontSize: '0.85rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #F4511E 0%, #E65100 100%)',
              padding: '6px 20px',
              borderRadius: '9999px',
              display: 'inline-block',
              boxShadow: '0 4px 14px rgba(230, 81, 0, 0.25)'
            }}>
              GROW WITH CONNECT MARATHA
            </span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4vw, 2.85rem)', fontWeight: 900, color: '#1E293B', margin: '14px 0 12px', letterSpacing: '-0.3px' }}>
              तुमचा व्यवसाय महाराष्ट्रापर्यंत पोहोचवा!
            </h2>
            <p style={{ color: '#475569', fontSize: '1.08rem', maxWidth: '680px', margin: '0 auto', fontWeight: 600 }}>
              Connect Maratha च्या लाखो वाचक, तरुण उद्योजक आणि व्यावसायिक नेटवर्कच्या माध्यमातून आपल्या ब्रँडची जाहिरात करा.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '26px'
          }}>
            {adPlans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`cm-ad-pricing-card ${plan.featured ? 'featured' : ''}`}
                style={{
                  border: plan.featured ? '2.5px solid #E65100' : '1.8px solid #FFB74D',
                  boxShadow: plan.featured ? '0 16px 36px -6px rgba(230, 81, 0, 0.3)' : '0 8px 24px rgba(230, 81, 0, 0.08)'
                }}
              >
                {plan.featured && (
                  <span style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #F4511E 0%, #C73800 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    padding: '4px 16px',
                    borderRadius: '999px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(230, 81, 0, 0.35)'
                  }}>
                    सर्वाधिक लोकप्रिय
                  </span>
                )}

                <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#1E293B', margin: '0 0 4px' }}>
                  {plan.title}
                </h3>

                <span style={{ color: '#E65100', fontWeight: 800, fontSize: '0.84rem', marginBottom: '14px', display: 'block' }}>
                  {plan.tag}
                </span>

                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '2.3rem', fontWeight: 900, color: '#E65100' }}>{plan.price}</span>
                </div>

                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 20px', minHeight: '44px', fontWeight: 500 }}>
                  {plan.desc}
                </p>

                <div style={{ borderTop: '1.5px solid #FFE0B2', paddingTop: '16px', marginBottom: '24px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} style={{ fontSize: '0.88rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <span style={{ color: '#E65100', fontWeight: 900 }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedPlan(plan.title);
                    setAdForm(prev => ({ ...prev, adType: plan.title }));
                    const target = document.getElementById('ad-enquiry-form');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const nameInput = target.querySelector('input');
                      if (nameInput) setTimeout(() => nameInput.focus(), 600);
                    }
                  }}
                  className={plan.featured ? "cm-pill-btn-primary" : "cm-pill-btn-secondary"}
                  style={{ width: '100%', padding: '12px 18px', fontSize: '0.95rem', cursor: 'pointer', position: 'relative', zIndex: 10 }}
                >
                  Enquire Now (चौकशी करा)
                </button>
              </div>
            ))}
          </div>

          {/* DEDICATED INLINE ADVERTISEMENT ENQUIRY FORM */}
          <div 
            id="ad-enquiry-form"
            style={{
              marginTop: '44px',
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '2.5px solid #E65100',
              padding: '36px 32px',
              boxShadow: '0 20px 45px -10px rgba(230, 81, 0, 0.22)',
              maxWidth: '860px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ 
                color: '#C73800', 
                fontWeight: 800, 
                fontSize: '0.82rem', 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                background: '#FFE8D6',
                padding: '4px 16px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '8px',
                border: '1.5px solid #FFB74D'
              }}>
                📢 ADVERTISEMENT & PARTNERSHIP ENQUIRY
              </span>
              <h3 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.95rem)', fontWeight: 900, color: '#1E293B', margin: '4px 0 6px' }}>
                <span style={{ color: '#E65100' }}>{selectedPlan}</span> साठी अधिकृत चौकशी फॉर्म
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0 auto', maxWidth: '580px', fontWeight: 500 }}>
                आपली माहिती नोंदवा; आमचे ब्रँड प्रतिनिधी २४ तासांत दरपत्रक व संपूर्ण तपशीलांसह आपल्याशी संपर्क करतील.
              </p>
            </div>

            <form onSubmit={handleAdSubmit}>
              {adError && (
                <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 700 }}>
                  ⚠️ {adError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    आपले नाव *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="उदा. अमित पाटील"
                    value={adForm.name}
                    onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    व्यवसायाचे किंवा ब्रँडचे नाव *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="उदा. सह्याद्री ॲग्रो प्रॉडक्ट्स"
                    value={adForm.businessName}
                    onChange={(e) => setAdForm({ ...adForm, businessName: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    मोबाइल नंबर (१० अंक) *
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="उदा. 98XXXXXXXX"
                    value={adForm.mobile}
                    onChange={(e) => setAdForm({ ...adForm, mobile: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    ईमेल पत्ता (ऐच्छिक)
                  </label>
                  <input 
                    type="email"
                    placeholder="उदा. contact@mybusiness.com"
                    value={adForm.email}
                    onChange={(e) => setAdForm({ ...adForm, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  निवडलेली जाहिरात योजना *
                </label>
                <select
                  value={adForm.adType}
                  onChange={(e) => {
                    setAdForm({ ...adForm, adType: e.target.value });
                    setSelectedPlan(e.target.value);
                  }}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', background: '#FFF', fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', boxSizing: 'border-box' }}
                >
                  <option value="Magazine Advertisement">Magazine Advertisement (प्रिंट + डिजिटल - ₹७,५००)</option>
                  <option value="Sponsored Articles">Sponsored Articles (कथा स्वरूप जाहिरात - ₹२,९९९)</option>
                  <option value="Business Listings">Business Listings (प्रीमियम डिरेक्टरी - ₹४९९ / वर्ष)</option>
                  <option value="Brand Partnerships">Brand Partnerships (वार्षिक भागीदारी - ₹२५,०००)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  आपल्या गरजेबद्दल काही विशेष सांगायचे असल्यास (पर्यायी)
                </label>
                <textarea 
                  rows="3"
                  placeholder="उदा. आम्हाला आमच्या नवीन उत्पादनाची जाहिरात पुढील अंकात पहिल्या पानावर किंवा विशेष स्तंभात करायची आहे..."
                  value={adForm.message}
                  onChange={(e) => setAdForm({ ...adForm, message: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={adSubmitting}
                  className="cm-pill-btn-primary"
                  style={{ flex: '1 1 220px', padding: '13px 24px', fontSize: '1rem', cursor: 'pointer', textAlign: 'center' }}
                >
                  {adSubmitting ? 'नोंदणी करत आहे...' : 'चौकशी पाठवा (Submit Enquiry)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`नमस्कार! मला Connect Maratha Magazine मधील "${adForm.adType || selectedPlan}" जाहिरात योजनेबद्दल चौकशी करायची आहे.`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  style={{
                    background: '#25D366',
                    color: '#FFF',
                    border: 'none',
                    padding: '13px 24px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  <span>💬 थेट WhatsApp वर बोला</span>
                </button>
              </div>
            </form>

            {adSuccess && (
              <div style={{ marginTop: '20px', color: '#15803D', fontWeight: 800, fontSize: '1rem', background: '#DCFCE7', border: '1.5px solid #86EFAC', padding: '14px 18px', borderRadius: '10px', textAlign: 'center' }}>
                ✓ धन्यवाद! आपली चौकशी यशस्वीरित्या नोंदवली गेली आहे. आमची टीम लवकरच आपल्याशी संपर्क करेल.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================
          9. CONTRIBUTOR & WRITERS SECTION
          ============================================================ */}
      <section id="contributor-section" className="cm-reveal" style={{ padding: '30px 24px 44px', maxWidth: '1440px', margin: '0 auto', background: '#FFF8F0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 50%, #FFEFE0 100%)',
          borderRadius: '20px',
          border: '2px solid #FFB74D',
          padding: '24px 32px',
          boxShadow: '0 12px 32px -8px rgba(230, 81, 0, 0.14), 0 2px 8px rgba(0,0,0,0.02)',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Left Column: Inspiring Pitch & Editorial Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{
              color: '#C73800',
              fontWeight: 800,
              fontSize: '0.74rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #FFEFE5 0%, #FFDEC7 100%)',
              padding: '4px 12px',
              borderRadius: '9999px',
              width: 'fit-content',
              marginBottom: '8px',
              border: '1.5px solid #FFB74D',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(230, 81, 0, 0.1)'
            }}>
              ✍️ BECOME A CONTRIBUTOR • जिल्हा प्रतिनिधी व लेखक
            </span>

            <h2 style={{ fontSize: 'clamp(1.45rem, 2.2vw, 1.85rem)', fontWeight: 900, color: '#1E293B', margin: '0 0 8px', lineHeight: 1.22, letterSpacing: '-0.3px' }}>
              तुमची गोष्ट, तुमचा विचार,<br /><span style={{ color: '#E65100' }}>महाराष्ट्रापर्यंत पोहोचवा!</span>
            </h2>

            <p style={{ color: '#475569', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 12px', fontWeight: 500 }}>
              आपल्याकडे एखादा व्यवसाय विचार, शेती प्रक्रिया यशोगाथा किंवा मार्गदर्शक लेख आहे का? महाराष्ट्रातील तरुण उद्योजक, लेखक आणि ३६ जिल्ह्यांमधील प्रतिनिधींना आपले लिखाण प्रसिद्ध करण्याचे खुले आमंत्रण आहे.
            </p>

            {/* Compact Benefit Checkpoints */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.82rem' }}>
                <span style={{ color: '#E65100', background: '#FFEFE5', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', border: '1px solid #FFCC80' }}>✓</span>
                <span>१०,०००+ उद्योजक व वाचकांपर्यंत थेट पोहोच</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.82rem' }}>
                <span style={{ color: '#E65100', background: '#FFEFE5', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', border: '1px solid #FFCC80' }}>✓</span>
                <span>Connect Maratha अधिकृत लेखक म्हणून बायलाइन व प्रोफाइल</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.82rem' }}>
                <span style={{ color: '#E65100', background: '#FFEFE5', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', border: '1px solid #FFCC80' }}>✓</span>
                <span>जिल्हा प्रतिनिधी (District Correspondent) पदाची संधी</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Proportionate Registration Form Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '2px solid #FFB74D',
            padding: '20px 24px',
            boxShadow: '0 8px 24px rgba(230, 81, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#1E293B', margin: '0 0 2px' }}>
              लेखक व प्रतिनिधी नोंदणी फॉर्म
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.74rem', margin: '0 0 10px', fontWeight: 500 }}>
              माहिती भरा; आमचे संपादकीय मंडळ २४ तासांत संपर्क करेल.
            </p>

            <form onSubmit={handleContributorSubmit}>
              {contributorError && (
                <div style={{ padding: '6px 10px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                  ⚠️ {contributorError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                    पूर्ण नाव *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="उदा. राहुल पाटील"
                    value={contributorForm.name}
                    onChange={(e) => setContributorForm({ ...contributorForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#E65100'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                    जिल्हा (District) *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="उदा. पुणे / कोल्हापूर"
                    value={contributorForm.district}
                    onChange={(e) => setContributorForm({ ...contributorForm, district: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#E65100'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                    WhatsApp किंवा फोन *
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="उदा. 98xxxxxxxx"
                    value={contributorForm.mobile}
                    onChange={(e) => setContributorForm({ ...contributorForm, mobile: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#E65100'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                    व्यवसाय / पदवी
                  </label>
                  <input 
                    type="text" 
                    placeholder="उदा. उद्योजक / प्राध्यापक"
                    value={contributorForm.profession}
                    onChange={(e) => setContributorForm({ ...contributorForm, profession: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#E65100'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                  आपल्या लिखाणाची आवड किंवा कथेची थोडक्यात माहिती...
                </label>
                <textarea 
                  rows="2"
                  placeholder="उदा. ॲग्रो-स्टार्टअप यशोगाथा किंवा उद्योग मार्गदर्शन..."
                  value={contributorForm.writingInterest}
                  onChange={(e) => setContributorForm({ ...contributorForm, writingInterest: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '7px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E65100'}
                  onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>

              <button
                type="submit"
                disabled={contributorSubmitting}
                className="cm-pill-btn-primary"
                style={{ width: '100%', padding: '8px 18px', fontSize: '0.85rem', borderRadius: '9999px' }}
              >
                <span>{contributorSubmitting ? 'नोंदणी करत आहे...' : 'Join as Contributor (सहभागी व्हा)'}</span>
                <span>➔</span>
              </button>
            </form>

            {contributorSuccess && (
              <div style={{ marginTop: '10px', color: '#15803D', fontWeight: 700, fontSize: '0.82rem', background: '#DCFCE7', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                ✓ धन्यवाद! आपली माहिती यशस्वीरित्या नोंदवली गेली आहे.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          INTERACTIVE 10-PAGE DIGITAL READER MODAL
          ============================================================ */}
      {readerOpen && typeof document !== "undefined" && createPortal(
        <div className="cm-modal-backdrop">
          <div className="cm-modal-window" style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div>
                <span style={{ color: '#E65100', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  CONNECT मराठा • DIGITAL READER
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E293B', margin: '2px 0 0' }}>
                  नोव्हेंबर २०२६ अंक (पान {currentReaderPage} / १०)
                </h3>
              </div>
              <button 
                onClick={() => setReaderOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontWeight: 800, cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ minHeight: '360px', background: '#FFF9F3', borderRadius: '14px', border: '1px solid rgba(230,81,0,0.15)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'inline-block', background: '#E65100', color: '#FFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, width: 'fit-content', marginBottom: '10px' }}>
                {currentReaderPage === 1 && "PAGE 01 • COVER STORY"}
                {currentReaderPage === 2 && "PAGE 02 • STARTUP MAHARASHTRA"}
                {currentReaderPage === 3 && "PAGE 03 • BUSINESS BLUEPRINT"}
                {currentReaderPage === 4 && "PAGE 04 • YOUTH POWER"}
                {currentReaderPage === 5 && "PAGE 05 • WOMEN IN BUSINESS"}
                {currentReaderPage === 6 && "PAGE 06 • MONEY & WEALTH"}
                {currentReaderPage === 7 && "PAGE 07 • DISTRICT BUSINESS"}
                {currentReaderPage === 8 && "PAGE 08 • CAREER & FUTURE"}
                {currentReaderPage === 9 && "PAGE 09 • HISTORY TO FUTURE"}
                {currentReaderPage === 10 && "PAGE 10 • CONNECT & GROW"}
              </div>

              <h4 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E293B', margin: '0 0 12px' }}>
                {currentReaderPage === 1 && "शून्यातून स्वराज्य – एका मराठा तरुणाचा ₹५० कोटींचा स्टार्टअप प्रवास"}
                {currentReaderPage === 2 && "कमी भांडवलात सुरू करता येणारे ५ हाय-प्रॉफिट स्टार्टअप मॉडेल्स"}
                {currentReaderPage === 3 && "पहिल्या १०० ग्राहकांपर्यंत कसे पोहोचावे? (Zero Budget Marketing)"}
                {currentReaderPage === 4 && "AI च्या युगात घरबसल्या दरमहा ₹५०,०००+ कमवण्याची आधुनिक कौशल्ये"}
                {currentReaderPage === 5 && "किचनपासून कॉर्पोरेटपर्यंत: मराठमोळ्या महिलांचा ब्रँडेड फूड ब्रँड"}
                {currentReaderPage === 6 && "माझा पहिला ₹१ लाख नफा: व्यवसायातील कॅश-फ्लो व आर्थिक नियोजन"}
                {currentReaderPage === 7 && "जिल्हा फोकस: पुणे व छत्रपती संभाजीनगर – ॲग्रो, ऑटो आणि नव्या संधी"}
                {currentReaderPage === 8 && "पदवी संपली, पुढे काय? हाय-डिमांड टेक आणि नॉन-टेक करिअर्स"}
                {currentReaderPage === 9 && "शिवरायांचे व्यवस्थापनशास्त्र: दुर्ग, आरमार आणि आर्थिक स्वावलंबन"}
                {currentReaderPage === 10 && "Connect Maratha इकोसिस्टम, आगामी इव्हेंट्स आणि थेट नेटवर्किंग"}
              </h4>

              <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.75 }}>
                {currentReaderPage === 1 && "सातारा जिल्ह्यातील एका छोट्या गावातून सुरू झालेला हा प्रवास आज संपूर्ण महाराष्ट्रातील तरुणांसाठी दीपस्तंभ ठरला आहे. कोणतीही कौटुंबिक व्यावसायिक पार्श्वभूमी नसताना, केवळ जिद्द आणि कल्पकतेच्या जोरावर ३०० हून अधिक तरुणांना थेट रोजगार देणारा उद्योग उभा राहिला."}
                {currentReaderPage === 2 && "ॲग्रो-व्हॅल्यू ॲडिशन, हायपरलोकल डिलिव्हरी नेटवर्क, क्लाउड किचन, डिजिटल मार्केटिंग कन्सल्टिंग आणि वेस्ट-टू-वेल्थ हे ५ उद्योग अत्यंत कमी गुंतवणुकीत दरमहा उत्तम उत्पन्न देऊ शकतात."}
                {currentReaderPage === 3 && "बहुतेक नवीन उद्योजक उत्पादन बनवण्यात वेळ घालवतात, पण विक्रीवर लक्ष देत नाहीत. WhatsApp Business कॅटलॉग, स्थानिक सोशल कम्युनिटीज आणि गुगल प्रोफाइलचा वापर करून शून्य रुपयात पहिल्या १०० ग्राहकांचा पाया कसा रचावा."}
                {currentReaderPage >= 4 && "संपादकीय विश्लेषणाचा भाग: सविस्तर मुलाखती, व्यावसायिक डेटा, शासकीय सबसिडी व कर्ज योजनांची माहिती वाचण्यासाठी पुढील पानांवर क्लिक करा."}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
              <button 
                onClick={() => setCurrentReaderPage(prev => Math.max(1, prev - 1))}
                disabled={currentReaderPage === 1}
                className="cm-pill-btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                ⬅️ मागील पान
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pg => (
                  <button
                    key={pg}
                    onClick={() => setCurrentReaderPage(pg)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: pg === currentReaderPage ? '2px solid #E65100' : '1px solid #CBD5E1',
                      background: pg === currentReaderPage ? '#E65100' : '#FFFFFF',
                      color: pg === currentReaderPage ? '#FFFFFF' : '#1E293B',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {pg}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentReaderPage(prev => Math.min(10, prev + 1))}
                disabled={currentReaderPage === 10}
                className="cm-pill-btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                पुढील पान ➡️
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================
          ARTICLE PREVIEW MODAL
          ============================================================ */}
      {articleModalOpen && activeArticle && typeof document !== "undefined" && createPortal(
        <div 
          className="cm-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setArticleModalOpen(false)}
        >
          <div 
            className="cm-modal-window"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '28px 24px',
              position: 'relative',
              zIndex: 100000000,
              boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.5)',
              border: '2px solid #E65100'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: '#E65100', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {activeArticle.category}
              </span>
              <button 
                onClick={() => setArticleModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', width: '34px', height: '34px', borderRadius: '50%', fontWeight: 800, cursor: 'pointer', color: '#64748B', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.3, margin: '0 0 10px' }}>
              {activeArticle.title}
            </h3>

            <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '0.85rem', marginBottom: '18px' }}>
              <span>✍️ {activeArticle.author}</span>
              <span>📅 {activeArticle.date}</span>
              <span>⏱️ {activeArticle.readTime}</span>
            </div>

            <img 
              src={activeArticle.image} 
              alt={activeArticle.title}
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px', marginBottom: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
            />

            {/* Key highlights bullet points */}
            {activeArticle.keyPoints && activeArticle.keyPoints.length > 0 && (
              <div style={{ background: '#FFF7ED', border: '1.5px solid #FDBA74', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#C2410C', fontSize: '1.05rem', fontWeight: 800 }}>
                  📌 या विशेषांकातील महत्त्वाचे मुद्दे:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#431407', fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {activeArticle.keyPoints.map((point, index) => (
                    <li key={index} style={{ marginBottom: '6px' }}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            <p style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '24px' }}>
              {activeArticle.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button 
                onClick={() => {
                  const text = encodeURIComponent(`वाचा Connect Maratha Magazine: ${activeArticle.title} - https://connectmaratha.com/magazine`);
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                style={{ background: '#25D366', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>📲 WhatsApp शेअर करा</span>
              </button>

              <button 
                onClick={() => setArticleModalOpen(false)}
                className="cm-pill-btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================
          ADVERTISEMENT ENQUIRY MODAL (Full Functional Form)
          ============================================================ */}
      {adModalOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="cm-modal-backdrop" 
          onClick={() => setAdModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="cm-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px 26px',
              position: 'relative',
              zIndex: 100000000,
              boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.5)',
              border: '2.5px solid #E65100'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: '#E65100', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                जाहिरात व भागीदारी नोंदणी
              </span>
              <button 
                type="button"
                onClick={() => setAdModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', width: '34px', height: '34px', borderRadius: '50%', fontWeight: 800, cursor: 'pointer', color: '#64748B', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', margin: '0 0 6px' }}>
              {selectedPlan} साठी चौकशी फॉर्म
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 18px' }}>
              आपली माहिती नोंदवा, आमचे प्रतिनिधी २४ तासांत दरपत्रक व तपशीलांसह संपर्क करतील.
            </p>

            <form onSubmit={handleAdSubmit}>
              {adError && (
                <div style={{ padding: '8px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', marginBottom: '12px', fontSize: '0.88rem', fontWeight: 700 }}>
                  ⚠️ {adError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input 
                  type="text"
                  required
                  placeholder="आपले नाव *"
                  value={adForm.name}
                  onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
                <input 
                  type="text"
                  required
                  placeholder="व्यवसायाचे नाव *"
                  value={adForm.businessName}
                  onChange={(e) => setAdForm({ ...adForm, businessName: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input 
                  type="tel"
                  required
                  placeholder="मोबाइल नंबर (१० अंक) *"
                  value={adForm.mobile}
                  onChange={(e) => setAdForm({ ...adForm, mobile: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
                <input 
                  type="email"
                  placeholder="ईमेल पत्ता"
                  value={adForm.email}
                  onChange={(e) => setAdForm({ ...adForm, email: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <select
                  value={adForm.adType}
                  onChange={(e) => setAdForm({ ...adForm, adType: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' }}
                >
                  <option value="Magazine Advertisement">Magazine Advertisement (प्रिंट + डिजिटल - ₹७,५००)</option>
                  <option value="Sponsored Articles">Sponsored Articles (कथा स्वरूप जाहिरात - ₹२,९९९)</option>
                  <option value="Business Listings">Business Listings (प्रीमियम डिरेक्टरी - ₹४९९)</option>
                  <option value="Brand Partnerships">Brand Partnerships (वार्षिक भागीदारी - ₹२५,०००)</option>
                </select>
              </div>

              <textarea 
                rows="3"
                placeholder="आपल्या गरजेबद्दल काही विशेष सांगायचे असल्यास..."
                value={adForm.message}
                onChange={(e) => setAdForm({ ...adForm, message: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={adSubmitting}
                  className="cm-pill-btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  {adSubmitting ? 'नोंदणी करत आहे...' : 'चौकशी पाठवा (Submit)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`नमस्कार! मला Connect Maratha Magazine मधील "${adForm.adType}" योजनेबद्दल माहिती हवी आहे.`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  style={{ background: '#25D366', color: '#FFF', border: 'none', padding: '12px 18px', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer' }}
                >
                  WhatsApp
                </button>
              </div>
            </form>

            {adSuccess && (
              <div style={{ marginTop: '16px', color: '#15803D', fontWeight: 700, fontSize: '0.95rem', background: '#DCFCE7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                ✓ धन्यवाद! आपली चौकशी यशस्वीरित्या नोंदवली गेली आहे. आमची टीम लवकरच संपर्क करेल.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================
          BACK TO TOP BUTTON
          ============================================================ */}
      <button 
        type="button"
        aria-label="Back to Top"
        className={`cm-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="वर जा (Back to Top)"
      >
        ▲
      </button>

    </div>
  );
}
