import React, { useEffect, useState, useRef } from "react";
import "./AwardsPage.css";

const categories = [
  ["Business", "उद्योग व व्यापार", "🤝", "उद्योग, उत्पादन, तंत्रज्ञान आणि स्टार्टअप क्षेत्रातील उल्लेखनीय व प्रेरणादायी योगदान."],
  ["Social", "सामाजिक कार्य", "👥", "दुष्काळ निवारण, शिक्षण, आरोग्य आणि गोरगरीब समाजबांधवांसाठी निस्वार्थ सेवा."],
  ["Legal", "विधी व न्याय", "⚖️", "संविधान रक्षण, कायदेशीर मार्गदर्शन आणि सामान्यांना न्याय मिळवून देणारे कार्य."],
  ["Financial", "वित्त व पतसंस्था", "💰", "वित्तीय सेवा, सूक्ष्म पतपुरवठा आणि सहकार क्षेत्रातील आदर्श पारदर्शक व्यवस्थापन."],
  ["Political", "राजकीय नेतृत्व", "🏛️", "लोकाभिमुख नेतृत्व, समाजविकास आणि जनहिताचे प्रश्न मांडणारे लोकप्रतिनिधी."],
  ["Media", "माध्यमे व पत्रकारिता", "📹", "सत्य, निर्भीड व संशोधनात्मक पत्रकारिता आणि समाजप्रबोधन करणारे माध्यमकर्मी."],
  ["Entertainment", "कला व चित्रपट", "🎭", "मराठी नाटक, चित्रपट, संगीत, लोककला आणि संस्कृती संवर्धनातील उल्लेखनीय योगदान."],
  ["Agricultural", "कृषी व शेती", "🌾", "आधुनिक शेती, प्रक्रिया उद्योग आणि शेतकरी सक्षमीकरणातील दीपस्तंभ शेतकरी."],
  ["Government Officials", "सनदी अधिकारी", "⭐", "प्रशासकीय सुधारणा, तत्पर व लोकाभिमुख पारदर्शक सेवा देणारे सनदी अधिकारी."],
  ["Small Businessmen", "लघु उद्योजक", "🏪", "कष्टाळू वृत्ती, ग्राहकांची विश्वासार्हता आणि शून्यातून विश्व निर्माण करणारे स्थानिक व्यावसायिक."],
  ["Bankers", "बँकिंग व सहकार", "🏦", "ग्राहकसेवा, शेती कर्ज सुलभता आणि बँकिंग क्षेत्रात प्रामाणिक कार्य करणारे बँकर्स."],
  ["Investors", "गुंतवणूकदार", "📈", "मराठा तरुणांच्या नवनवीन स्टार्टअप्सवर विश्वास ठेवून त्यांना भांडवली पाठबळ देणारे गुंतवणूकदार."],
  ["Women's Empowerment", "महिला सक्षमीकरण", "🌸", "विविध क्षेत्रांत आदर्श उभा करून हजारो भगिनींना स्वावलंबी बनवणाऱ्या रणरागिणी."]
];

const categoryPhotos = [
  "/assets/images/cat-business-award.jpg",
  "/assets/images/cat-social-help.jpg",
  "/assets/images/cat-legal-court.jpg",
  "/assets/images/cat-financial-growth.jpg",
  "/assets/images/cat-politics-speech.jpg",
  "/assets/images/cat-media-camera.jpg",
  "/assets/images/cat-cinema-arts.jpg",
  "/assets/images/cat-agriculture-field.jpg",
  "/assets/images/cat-govt-officer.jpg",
  "/assets/images/cat-small-retail.jpg",
  "/assets/images/cat-banking-finance.jpg",
  "/assets/images/cat-investors-growth.jpg",
  "/assets/images/cat-women-leadership.jpg"
];

export default function AwardFunctionPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    category: "उद्योग व व्यापार",
    district: "",
    achievements: ""
  });

  const slides = [
    {
      title: "कर्तृत्वाचा गौरव. यशाचा महामहोत्सव.",
      subtitle: "कनेक्ट मराठा राष्ट्रीय पुरस्कार सोहळा २०२७",
      image: "/assets/images/cm-awards-hero-royal-stage.jpg"
    },
    {
      title: "भव्य सुवर्ण पुरस्कार वितरण सोहळा",
      subtitle: "छत्रपती शिवरायांच्या प्रेरणेने अखंड सन्मान",
      image: "/assets/images/cm-awards-hero-royal-stage.jpg"
    },
    {
      title: "उद्योग, नेतृत्व आणि समाजसेवेचा ऐतिहासिक सत्कार",
      subtitle: "फेब्रुवारी २०२७ | मुंबई, महाराष्ट्र",
      image: "/assets/images/cm-awards-grand-trophy-stage.jpg"
    },
    {
      title: "अखंड महाराष्ट्रातील गुणवंतांचा राष्ट्रीय गौरव",
      subtitle: "१००+ मानाचे पुरस्कार | सर्व सहभागींना सहभाग प्रमाणपत्र",
      image: "/assets/images/award-gala-stage.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Scroll Reveal Animations (WIVA inspired WOW/AOS effect)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const revealElements = document.querySelectorAll(".wiva-reveal, .wiva-reveal-left, .wiva-reveal-right, .wiva-reveal-scale, .wiva-stagger");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filter]);

  const filteredCategories =
    filter === "All"
      ? categories
      : categories.filter(item => item[0] === filter || item[1] === filter);

  const updateForm = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="awards-page">

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="awards-topline">
        <span>🚩 <strong>ताजी घोषणा:</strong> कनेक्ट मराठा राष्ट्रीय पुरस्कार २०२७ — अधिकृत महासन्मान सोहळा</span>
        <span className="topline-date">फेब्रुवारी २०२७ · मुंबई, महाराष्ट्र</span>
      </div>

      {/* BALANCED 2-COLUMN HERO SECTION */}
      <section className="awards-hero" id="home">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-background ${
              activeSlide === index ? "active" : ""
            }`}
            style={{
              backgroundImage: `url(${slide.image})`
            }}
          />
        ))}

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-flag">🚩</span>
            <span>कनेक्ट मराठा प्रस्तुत • अधिकृत महासन्मान सोहळा २०२७</span>
          </div>

          <h1 key={activeSlide} className="hero-title">
            {slides[activeSlide].title}
          </h1>

          <h2 className="hero-subtitle">
            {slides[activeSlide].subtitle}
          </h2>

          <p className="hero-description">
            महाराष्ट्राच्या सर्व ३६ जिल्ह्यांतील कर्तृत्ववान उद्योजक, सामाजिक कार्यकर्ते, 
            शेतकरी, सनदी अधिकारी व कर्तबगार भगिनींचा मुंबई येथे होणारा ऐतिहासिक राष्ट्रीय महासन्मान सोहळा.
          </p>

          <div className="hero-buttons">
            <button
              className="gold-button"
              onClick={() => setShowForm(true)}
            >
              🎯 अधिकृत नामांकन दाखल करा ➔
            </button>

            <button
              className="outline-button"
              onClick={() => setShowPoster(true)}
            >
              📜 अधिकृत पोस्टर पहा 🔍
            </button>
          </div>

          <div className="hero-metrics-grid">
            <div className="metric-chip">
              <span className="chip-icon">🏆</span>
              <div>
                <strong>१००+</strong>
                <small>सुवर्ण पुरस्कार</small>
              </div>
            </div>

            <div className="metric-chip">
              <span className="chip-icon">🎖️</span>
              <div>
                <strong>१३</strong>
                <small>अधिकृत प्रवर्ग</small>
              </div>
            </div>

            <div className="metric-chip">
              <span className="chip-icon">📜</span>
              <div>
                <strong>सर्व सहभागींना</strong>
                <small>सहभाग प्रमाणपत्र</small>
              </div>
            </div>

            <div className="metric-chip">
              <span className="chip-icon">📍</span>
              <div>
                <strong>मुंबई</strong>
                <small>फेब्रुवारी २०२७</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={activeSlide === index ? "selected" : ""}
              onClick={() => setActiveSlide(index)}
              title={`स्लाईड ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* STATS COUNTER STRIP */}
      <section className="awards-stats wiva-reveal">
        {[
          ["१००+", "राज्यस्तरीय सुवर्ण पुरस्कार"],
          ["१३", "सर्वसमावेशक वर्गवाऱ्या"],
          ["३६", "जिल्ह्यांतून थेट सहभाग"],
          ["१००%", "सहभागींसाठी अधिकृत गौरव प्रमाणपत्र"]
        ].map(([number, label]) => (
          <div className="stat" key={label}>
            <strong>{number}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* ABOUT SECTION */}
      <section className="awards-about" id="about">
        <div className="about-image wiva-reveal-left">
          <div className="about-image-card">
            <img
              src="/assets/images/cm-awards-grand-convention-hall.jpg"
              alt="Connect Maratha Grand Banquet Convention Hall"
            />
          </div>
        </div>

        <div className="about-content wiva-reveal-right">
          <span className="gold-eyebrow">संस्थेचा ध्यास व सोहळ्याचे उद्दिष्ट</span>
          <h2>
            कर्तृत्वाला हक्काचे व्यासपीठ.
            <em> गुणवत्तेला राजमान्यता.</em>
          </h2>

          <p>
            <strong>Connect Maratha (कनेक्ट मराठा)</strong> द्वारे आयोजित 
            <strong> कनेक्ट मराठा पुरस्कार सोहळा २०२७</strong> हा केवळ एक सन्मान सोहळा नसून, 
            अखंड महाराष्ट्राच्या सामाजिक, आर्थिक व व्यावसायिक प्रगतीमध्ये ऐतिहासिक योगदान देणाऱ्या 
            प्रत्येक मराठा शिलेदाराचा राष्ट्रीय पातळीवर होणारा शाही गौरव आहे.
          </p>

          <p>
            छत्रपती शिवाजी महाराजांच्या समतावादी, उद्यमशील आणि प्रजाहितदक्ष विचारांना अनुसरून 
            १३ विविध क्षेत्रांतील सर्वोत्कृष्ट शिलेदारांना हा पुरस्कार बहाल केला जाईल. उपस्थित सर्व अधिकृत 
            सहभागींना मानाचे सहभाग प्रमाणपत्र (Participation Certificate) देऊन गौरविण्यात येईल.
          </p>

          <button
            className="text-link"
            onClick={() => setShowForm(true)}
          >
            सोहळ्यात सहभागासाठी आताच नोंदणी करा ➔
          </button>
        </div>
      </section>

      {/* CEREMONY EXPERIENCE */}
      <section className="experience-section" id="experience">
        <div className="section-heading wiva-reveal">
          <span className="gold-eyebrow">महासोहळ्याची भव्यता व सन्मान</span>
          <h2>एक अविस्मरणीय <em>शाही अनुभव</em></h2>
          <p>परंपरा, संस्कृती, आधुनिक नेटवर्किंग आणि सन्मानाचा सुवर्ण संगम.</p>
        </div>

        <div className="experience-grid wiva-stagger">
          {[
            ["शाही सुवर्ण सन्मान सोहळा", "सुवर्ण पदक, मराठा सन्मान ट्रॉफी व शिवकालीन गौरव मानपत्र वितरण.", "/assets/images/cm-award-trophy-stage-first.jpg", "card-trophy-stage"],
            ["B2B व्यावसायिक नेटवर्किंग", "राज्यभरातील ५,०००+ उद्योजक, सनदी अधिकारी व मार्गदर्शकांसोबत संवाद आणि व्यवसाय सहकार्य.", "/assets/images/cm-awards-b2b-networking-premium.jpg", ""],
            ["थेट राष्ट्रीय मीडिया कव्हरेज", "प्रमुख वृत्तवाहिन्या, कॅमेरा क्रू, पत्रकार मुलाखती व डिजिटल माध्यमांवर थेट प्रसारण.", "/assets/images/cm-awards-media-press-premium.jpg", ""]
          ].map(([title, desc, photo, customClass], i) => (
            <article className={`experience-card ${customClass}`} key={title}>
              <div className="experience-card-img-wrapper">
                <img src={photo} alt={title} />
              </div>
              <div className="experience-card-content">
                <small>०{i + 1} / कनेक्ट मराठा २०२७</small>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 13 CATEGORIES SECTION */}
      <section className="categories-section" id="categories">
        <div className="section-heading wiva-reveal">
          <span className="gold-eyebrow">अधिकृत पुरस्कार प्रवर्ग</span>
          <h2>१३ प्रमुख <em>पुरस्कार वर्गवाऱ्या</em></h2>
          <p>खालील योग्य वर्गवारीत आपले अथवा आपल्या सहकाऱ्यांचे नाव निवडून अधिकृत अर्ज दाखल करा.</p>
        </div>

        <div className="category-filters wiva-reveal">
          <button
            className={filter === "All" ? "selected" : ""}
            onClick={() => setFilter("All")}
          >
            सर्व वर्गवाऱ्या (१३)
          </button>

          {categories.map(item => (
            <button
              key={item[0]}
              className={filter === item[0] ? "selected" : ""}
              onClick={() => setFilter(item[0])}
            >
              <span>{item[2]}</span> {item[1]}
            </button>
          ))}
        </div>

        <div className="category-grid wiva-stagger">
          {filteredCategories.map(item => {
            const index = categories.indexOf(item);

            return (
              <article className="category-card" key={item[0]}>
                <div className="category-image">
                  <img
                    src={categoryPhotos[index] || "/assets/images/cat-business-award.jpg"}
                    alt={item[1]}
                    loading="lazy"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="category-info">
                  <div className="category-header">
                    <span className="category-icon">{item[2]}</span>
                    <span className="category-tag">{item[0]}</span>
                  </div>
                  <h3>{item[1]}</h3>
                  <p>{item[3]}</p>

                  <button onClick={() => {
                    setForm({ ...form, category: `${item[1]} (${item[0]})` });
                    setShowForm(true);
                  }}>
                    या वर्गवारीत नामांकन दाखल करा ➔
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* DIGNITARIES SECTION */}
      <section className="guests-section" id="guests">
        <div className="section-heading wiva-reveal">
          <span className="gold-eyebrow">प्रमुख पाहुणे व निवड समिती</span>
          <h2>महासन्मान अतिथी व <em>मान्यवर</em></h2>
          <p>महाराष्ट्राचे वरिष्ठ सनदी अधिकारी, कायदेतज्ज्ञ व उद्योग जगतातील मान्यवरांची प्रमुख उपस्थिती.</p>
        </div>

        <div className="guest-grid wiva-stagger">
          {[
            {
              role: "प्रमुख पाहुणे",
              name: "मा. मुख्यमंत्री, महाराष्ट्र राज्य",
              status: "मंत्रालय, मुंबई (आमंत्रित / पुष्टी प्रलंबित)",
              highlight: "महाराष्ट्र शासन प्रमुख",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M14 10v11M12 2L2 7h20L12 2z" />
                </svg>
              ),
              colorClass: "guest-icon-govt"
            },
            {
              role: "विशेष अतिथी",
              name: "विशेष निमंत्रित कॅबिनेट मंत्री",
              status: "उद्योग व सहकार विभाग, महाराष्ट्र शासन",
              highlight: "उद्योग व सहकार धोरण",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ),
              colorClass: "guest-icon-minister"
            },
            {
              role: "उद्योग विश्व",
              name: "अग्रगण्य उद्योगपती व कॉर्पोरेट नेते",
              status: "महाराष्ट्र चेंबर ऑफ कॉमर्स आणि BSE प्रतिनिधी",
              highlight: "औद्योगिक विकास व रोजगार निर्मिती",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              ),
              colorClass: "guest-icon-corp"
            },
            {
              role: "ज्युरी पॅनेल",
              name: "मा. निवृत्त न्यायाधीश व वरिष्ठ सनदी अधिकारी",
              status: "स्वतंत्र, पारदर्शक व निष्पक्ष निवड मंडळ प्रमुख",
              highlight: "सत्य, न्याय व पारदर्शक मूल्यमापन",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M6 8l6-5 6 5M3 13l3-5 3 5a3 3 0 0 1-6 0zM15 13l3-5 3 5a3 3 0 0 1-6 0z" />
                </svg>
              ),
              colorClass: "guest-icon-jury"
            }
          ].map((item) => (
            <div className="guest-card" key={item.role}>
              <div className="guest-header-accent" />
              <div className="guest-card-body">
                <span className="guest-role-tag">{item.role}</span>
                <div className={`guest-icon-emblem ${item.colorClass}`}>
                  {item.icon}
                </div>
                <h3>{item.name}</h3>
                <p className="guest-desc">{item.status}</p>
                <div className="guest-highlight-pill">
                  <span className="pill-dot" />
                  {item.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POSTER & EVENT PASS SECTION */}
      <section className="poster-section" id="poster">
        <div className="poster-content wiva-reveal-left">
          <span className="poster-eyebrow">
            📍 तारीख व अधिकृत ठिकाण
          </span>
          <h2>या भव्य सोहळ्याचे <em>साक्षीदार व्हा</em></h2>
          <p className="poster-tagline">
            महाराष्ट्रातील ५,०००+ उद्योजक, मान्यवर व सनदी अधिकाऱ्यांच्या उपस्थितीत होणारा ऐतिहासिक सन्मान सोहळा.
          </p>

          <div className="event-meta-grid">
            <div className="meta-card">
              <span className="meta-card-label">सोहळा ठिकाण</span>
              <span className="meta-card-val">प्रतिष्ठित वातानुकूलित सभागृह, मुंबई, महाराष्ट्र</span>
            </div>

            <div className="meta-card">
              <span className="meta-card-label">तारीख व वेळ</span>
              <span className="meta-card-val">फेब्रुवारी २०२७ | सकाळी १०:०० ते सायं. ६:००</span>
            </div>

            <div className="meta-card">
              <span className="meta-card-label">सहभाग</span>
              <span className="meta-card-val">सर्व अधिकृत उपस्थितांना डिजिटल सहभाग प्रमाणपत्र</span>
            </div>
          </div>

          <div className="poster-actions">
            <button
              className="gold-button main-nom-btn"
              onClick={() => setShowForm(true)}
            >
              नामांकन अर्ज दाखल करा ➔
            </button>
            <button
              className="poster-zoom-btn"
              onClick={() => setShowPoster(true)}
            >
              पूर्ण पोस्टर पहा 🔍
            </button>
          </div>
        </div>

        <div className="poster-preview-card wiva-reveal-right" onClick={() => setShowPoster(true)} title="क्लिक करून पूर्ण पोस्टर पहा">
          <div className="preview-top-badge">
            <span>अधिकृत पुरस्कार पोस्टर</span>
            <span className="zoom-hint">झूम 🔍</span>
          </div>
          <div className="preview-img-container">
            <img
              src="/assets/images/cm-awards-official-user-banner.jpg"
              alt="Connect Maratha Awards Official"
            />
          </div>
          <div className="preview-footer-strip">
            <span>🏆 कनेक्ट मराठा राष्ट्रीय पुरस्कार २०२७</span>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION (गौरव क्षण) */}
      <section className="gallery-section" id="gallery">
        <div className="section-heading wiva-reveal">
          <span className="gold-eyebrow">ऐतिहासिक क्षणचित्रे</span>
          <h2>सोहळ्याचे <em>गौरव क्षण</em></h2>
          <p>Connect Maratha महाअधिवेशन व सन्मान सोहळ्यातील अविस्मरणीय आठवणी.</p>
        </div>

        <div className="gallery-grid wiva-stagger">
          {[
            {
              src: "/assets/images/cm-gaurav-stage-grand-indoor.jpg",
              title: "शाही सुवर्ण सन्मान सोहळा मंच"
            },
            {
              src: "/assets/images/cm-gaurav-pheta-crowd.jpg",
              title: "भगवे फेटे व मराठा उद्योजक महामेळावा"
            },
            {
              src: "/assets/images/cm-gaurav-shivaji-dias.jpg",
              title: "छत्रपती शिवराय साक्ष व सन्मान सोहळा"
            }
          ].map((item, index) => (
            <div className="gallery-item-card" key={index}>
              <img
                src={item.src}
                alt={item.title}
              />
              <div className="gallery-caption-overlay">
                <span>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POSTER MODAL (ZOOM VIEW) */}
      {showPoster && (
        <div className="modal-backdrop" onClick={() => setShowPoster(false)}>
          <div className="poster-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowPoster(false)} title="बंद करा">
              ×
            </button>
            <div className="modal-header-tag">
              🚩 कनेक्ट मराठा राष्ट्रीय पुरस्कार सोहळा २०२७ — अधिकृत बॅनर
            </div>
            <img
              src="/assets/images/cm-awards-official-user-banner.jpg"
              alt="Connect Maratha Official Awards Poster"
            />
          </div>
        </div>
      )}

      {/* NOMINATION MODAL (MARATHI) */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="nomination-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => {
              setShowForm(false);
              setSubmitted(false);
            }} title="बंद करा">
              ×
            </button>

            {submitted ? (
              <div className="success-message">
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎉</div>
                <h2>आपले नामांकन यशस्वीरीत्या दाखल झाले!</h2>
                <p>
                  Connect Maratha निवड समिती लवकरच आपल्याशी अधिकृत संपर्क साधेल. जय शिवराय!
                </p>
                <button className="gold-button" onClick={() => {
                  setSubmitted(false);
                  setShowForm(false);
                }}>
                  खिडकी बंद करा
                </button>
              </div>
            ) : (
              <>
                <span className="gold-eyebrow">कनेक्ट मराठा राष्ट्रीय पुरस्कार सोहळा २०२७</span>
                <h2>अधिकृत नामांकन अर्ज</h2>
                <p className="modal-desc">खालील माहिती अचूक भरा. निवड समितीद्वारे अर्जांची पारदर्शक छाननी केली जाईल.</p>

                <form onSubmit={submitForm}>
                  <label>
                    उमेदवाराचे / संस्थेचे पूर्ण नाव *
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={updateForm} 
                      placeholder="उदा. राजेश विष्णू देशमुख"
                      required 
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      मोबाईल नंबर *
                      <input 
                        name="phone" 
                        type="tel" 
                        value={form.phone} 
                        onChange={updateForm} 
                        placeholder="९८XXXXXXXX"
                        required 
                      />
                    </label>

                    <label>
                      ई-मेल (Email)
                      <input 
                        name="email" 
                        type="email" 
                        value={form.email} 
                        onChange={updateForm} 
                        placeholder="example@gmail.com"
                      />
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      पुरस्कार वर्गवारी *
                      <select name="category" value={form.category} onChange={updateForm}>
                        {categories.map(item => (
                          <option key={item[0]} value={`${item[1]} (${item[0]})`}>
                            {item[1]} — ({item[0]})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      जिल्हा *
                      <input 
                        name="district" 
                        value={form.district} 
                        onChange={updateForm} 
                        placeholder="उदा. पुणे / मुंबई / सातारा / कोल्हापूर"
                        required 
                      />
                    </label>
                  </div>

                  <label>
                    उल्लेखनीय कामगिरी व सामाजिक योगदान थोडक्यात *
                    <textarea
                      name="achievements"
                      value={form.achievements}
                      onChange={updateForm}
                      rows="4"
                      placeholder="आपल्या व्यवसायाचा / समाजकार्याचा प्रवास, मिळालेले यश आणि समाजाला झालेला फायदा थोडक्यात नमूद करा..."
                      required
                    />
                  </label>

                  <button className="gold-button submit-btn" type="submit">
                    🏆 नामांकन अर्ज सादर करा ➔
                  </button>

                  <small className="form-note">
                    * प्रत्येक अधिकृत अर्जदारास व सहभागी व्यक्तीस सोहळ्यात अधिकृत सहभाग प्रमाणपत्र दिले जाईल.
                  </small>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
