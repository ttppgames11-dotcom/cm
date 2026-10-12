import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ACHIEVERS_DATA = [
  {
    id: 'suhas-patil',
    name: 'डॉ. सुहास पाटील',
    role: 'फाउंडर, Cirrus Logic · सिलिकॉन व्हॅली',
    field: 'tech',
    fame: '🏆 Hall of Fame',
    tags: ['AI & Semis', 'ग्लोबल मराठा', 'US / Silicon Valley'],
    coverImg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'सिलिकॉन व्हॅलीतील जागतिक कीर्तीचे सेमीकंडक्टर उद्योजक. अमेरिकेत TiE (The Indus Entrepreneurs) ची सह-स्थापना करून हजारो भारतीय तंत्रज्ञान तरुणांना जागतिक उद्योजक बनवले.',
    contribution: 'सेमीकंडक्टर चिप डिझाईन, शिक्षण निधी, आयआयटी खडकपूर सिस्टीम्स लॅब.',
    badge: '✓ Verified Global Profile'
  },
  {
    id: 'db-shekatkar',
    name: 'लेफ्टनंट जनरल डी. बी. शेकटकर',
    role: 'संरक्षण रणनीतीकार व युद्ध तज्ज्ञ',
    field: 'defence',
    fame: '🏆 Param Vishisht Seva',
    tags: ['भारतीय सेना', 'संरक्षण सुधारणा', 'मराठा लाईट इन्फंट्री'],
    coverImg: 'https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: "भारतीय लष्कराच्या आधुनिकीकरणासाठी नेमलेल्या ऐतिहासिक 'शेकटकर समिती'चे अध्यक्ष. कारगिल युद्ध व ईशान्य भारतातील दहशतवादविरोधी कारवायांमध्ये अतुलनीय नेतृत्व.",
    contribution: 'भारतीय सैन्याची पुनर्रचना अहवाल, मराठा रेजिमेंट गौरव, युवा सैनिकी मार्गदर्शन.',
    badge: '✓ Verified Defence Legend'
  },
  {
    id: 'anita-bhosale',
    name: 'डॉ. अनिता भोसले',
    role: 'इस्रो शास्त्रज्ञ (ISRO Space Mission)',
    field: 'women',
    fame: '🏆 Women Leader',
    tags: ['महिला कर्तृत्व', 'चांद्रयान / गगनयान', 'Space Science'],
    coverImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'चांद्रयान-३ आणि आदित्य L1 मोहिमांमध्ये अंतराळ उड्डाण नियंत्रण व नेव्हिगेशन सिस्टीम्सवर काम करणाऱ्या आघाडीच्या शास्त्रज्ञ. ग्रामीण विद्यार्थिनींना विज्ञानात करिअर करण्यासाठी प्रेरणा.',
    contribution: 'इस्रो सॅटेलाईट ट्रॅजेक्टरी सॉफ्टवेअर, महिला STEM करिअर मार्गदर्शन.',
    badge: '✓ Verified ISRO Profile'
  },
  {
    id: 'khashaba-jadhav',
    name: 'खाशाबा जाधव (मरणोत्तर)',
    role: 'स्वतंत्र भारताचे पहिले वैयक्तिक ऑलिम्पिक पदकाचे मानकरी',
    field: 'sports',
    fame: '🏆 Olympic Legend',
    tags: ['हेलसिंकी ऑलिम्पिक १९५२', 'कुस्ती (Wrestling)', 'कराड / सातारा'],
    coverImg: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
    bio: '१९५२ च्या हेलसिंकी ऑलिम्पिकमध्ये कुस्तीत कांस्यपदक जिंकून भारताचा तिरंगा आंतरराष्ट्रीय मंचावर पहिल्यांदा वैयक्तिक स्पर्धेत फडकवला. कोल्हापूरच्या तालमीची ताकद जगाला दाखवली.',
    contribution: 'भारतीय क्रीडा इतिहासाचा सुवर्णक्षण, कुस्तीपटूंसाठी आदर्श.',
    badge: '✓ National Sports Immortal'
  },
  {
    id: 'babasaheb-kalyani',
    name: 'बाबासाहेब कल्याणी',
    role: 'अध्यक्ष व व्यवस्थापकीय संचालक, भारत फोर्ज',
    field: 'business',
    fame: '🏆 Industry Leader',
    tags: ['उद्योग व मॅन्युफॅक्चरिंग', 'डिफेन्स हार्डवेअर', 'पद्मभूषण'],
    coverImg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    bio: 'जगातील सर्वांत मोठी फोर्जिंग कंपनी म्हणून भारत फोर्जला जागतिक स्तरावर नेणारे विख्यात उद्योगपती. भारतीय तोफखाना व संरक्षण उपकरणांच्या स्वदेशी उत्पादनात क्रांती.',
    contribution: 'मेक इन इंडिया, अताग तोफ (ATAGS), हजारो तरुणांना रोजगार.',
    badge: '✓ Verified Industry Profile'
  },
  {
    id: 'rajesh-kadam',
    name: 'राजेश कदम',
    role: 'CEO, FinTech Global Innovations · लंडन व दुबई',
    field: 'global',
    fame: '🏆 Global Maratha',
    tags: ['ग्लोबल मराठा', 'UK & UAE', 'फिनटेक व व्हेंचर कॅपिटल'],
    coverImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    bio: "लंडन आणि दुबईत कार्यरत असणारे आंतरराष्ट्रीय वित्तीय सल्लागार व व्हेंचर कॅपिटलिस्ट. महाराष्ट्रातील ग्रामीण भागातील स्टार्टअप्ससाठी ५० कोटींचा 'सह्याद्री एंजेल फंड' स्थापन केला.",
    contribution: 'आंतरराष्ट्रीय विस्तार, स्टार्टअप गुंतवणूक, CM Business Sangam मेन्टॉर.',
    badge: '✓ Verified Global Member'
  },
  {
    id: 'raghunath-mashelkar',
    name: 'डॉ. रघुनाथ माशेलकर',
    role: 'ज्येष्ठ शास्त्रज्ञ व CSIR चे माजी महासंचालक',
    field: 'tech',
    fame: '🏆 Padma Vibhushan',
    tags: ['विज्ञानातील नोबेल तुल्य', 'इन्व्हेंशन भारत', 'पुणे'],
    coverImg: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: "अमेरिकेत हळदीचे पेटंट भारताच्या नावे जिंकून भारताचा पारंपारिक बौद्धिक अधिकार जागतिक मंचावर सिद्ध करणारे महान शास्त्रज्ञ. 'समावेशक नाविन्यता' (Inclusive Innovation) चे प्रणेते.",
    contribution: "CSIR संशोधन क्रांती, बौद्धिक संपदा अधिकार, 'आनंद सायन्स फाऊंडेशन'.",
    badge: '✓ Eminent Scientist'
  },
  {
    id: 'rahi-sarnobat',
    name: 'राही सरनोबत',
    role: 'आशियाई क्रीडा सुवर्णपदक विजेती ऑलिम्पियन नेमबाज',
    field: 'sports',
    fame: '🏆 Asian Gold Champion',
    tags: ['२५मी पिस्तूल शुटिंग', 'अर्जुन पुरस्कार', 'कोल्हापूर'],
    coverImg: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'आशियाई खेळात २५ मीटर पिस्तूल नेमबाजीत सुवर्णपदक जिंकणारी पहिली भारतीय महिला खेळाडू. जागतिक चषक (ISSF World Cup) सुवर्णपदक पटकावून कोल्हापूरचे नाव जगात अजरामर केले.',
    contribution: 'आंतरराष्ट्रीय नेमबाजी सुवर्णपदके, क्रीडा प्रबोधिनी युवा मार्गदर्शन.',
    badge: '✓ Verified Sports Star'
  }
];

export default function AchieversPage() {
  const [selectedField, setSelectedField] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [nominateForm, setNominateForm] = useState({ name: '', field: 'tech', contribution: '', contact: '' });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAchievers = ACHIEVERS_DATA.filter((achiever) => {
    const matchesField = selectedField === 'all' || achiever.field === selectedField;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      achiever.name.toLowerCase().includes(q) || 
      achiever.role.toLowerCase().includes(q) || 
      achiever.bio.toLowerCase().includes(q) ||
      achiever.tags.some(t => t.toLowerCase().includes(q));
    return matchesField && matchesSearch;
  });

  const handleNominateSubmit = (e) => {
    e.preventDefault();
    showToast(`⭐ धन्यवाद! '${nominateForm.name}' यांचे नामांकन यशस्वीरीत्या नोंदवले गेले आहे.`);
    setShowNominateModal(false);
    setNominateForm({ name: '', field: 'tech', contribution: '', contact: '' });
  };

  return (
    <div style={{ background: 'var(--paper, #FBF5EC)', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--maroon-950, #140406)',
          color: 'var(--gold-400, #F3C06B)',
          border: '1px solid var(--gold-500, #E0A96D)',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <span>🚩</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOPBAR */}
      <div style={{ background: '#1c0507', color: '#fff', padding: '6px 24px', fontSize: '0.82rem' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🚩 <strong>जय जिजाऊ · जय शिवराय · जय शंभूराजे</strong></span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span>मराठा गौरव व अचीव्हर्स निर्देशिका — ३०+ क्षेत्रांतील कर्तृत्ववान दिग्गज</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>📞 हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
            <span style={{ opacity: 0.6 }}>|</span>
            <Link to="/about" style={{ color: 'var(--gold-400, #F3C06B)', textDecoration: 'none' }}>🏛️ संस्था परिचय</Link>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="hero" style={{ position: 'relative', minHeight: '480px', overflow: 'hidden', display: 'flex', alignItems: 'center', background: '#120204' }}>
        <img 
          src="/assets/images/modern-maratha-achievers.jpg" 
          alt="मराठा गौरव आधुनिक शास्त्रज्ञ उद्योजक व क्रीडापटू" 
          className="hero-bg-img" 
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38)' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 35%, rgba(230,81,0,0.6), rgba(12,2,4,0.95) 85%)' }}></div>
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1300px', margin: '0 auto', padding: '48px 24px', color: '#FFFFFF', width: '100%' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400, #F3C06B)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
            Section 16, 17, 23, 24 & 25 • Master Product Blueprint
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.8rem)', lineHeight: 1.15, color: '#FFFFFF', margin: '8px 0 16px', fontFamily: 'Baloo 2' }}>
            मराठा गौरव व <span style={{ background: 'linear-gradient(90deg, #F3C06B, #FF8C42)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>हॉल ऑफ फेम</span>
          </h1>
          <div style={{ background: 'var(--gold-500, #E0A96D)', width: '80px', height: '4px', margin: '16px 0' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.12rem', maxWidth: '64ch', lineHeight: 1.6 }}>
            विज्ञान, डीप टेक, अंतराळ संशोधन, संरक्षण, प्रशासन, ऑलिम्पिक क्रीडा, उद्योग आणि जागतिक पातळीवर महाराष्ट्राचा झेंडा फडकवणाऱ्या कर्तृत्ववान दिग्गजांचे व्यासपीठ.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
            <a href="#achievers-list" className="btn btn-primary" style={{ padding: '12px 24px', background: 'var(--saffron-600, #C73800)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
              👥 अचीव्हर्स डिरेक्टरी
            </a>
            <a href="#hall-of-fame" className="btn btn-glass" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
              🏆 हॉल ऑफ फेम
            </a>
            <button 
              type="button" 
              onClick={() => setShowNominateModal(true)} 
              className="btn btn-glass" 
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.12)', color: 'var(--gold-400, #F3C06B)', border: '1px solid var(--gold-500, #E0A96D)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              ⭐ नवीन कर्तृत्व नामांकित करा
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* SECTION 17: HALL OF FAME SPOTLIGHT CARD */}
        <section id="hall-of-fame" style={{
          background: 'linear-gradient(135deg, var(--maroon-950, #140406), var(--maroon-900, #3d0d0d))',
          border: '2px solid var(--gold-500, #E0A96D)',
          borderRadius: '20px',
          padding: '36px',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          marginBottom: '48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)', color: 'var(--gold-400, #F3C06B)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Section 17 • Hall of Fame
              </span>
              <span style={{ fontSize: '0.76rem', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                पारदर्शक निकष
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#FFFFFF', marginBottom: '12px', fontFamily: 'Baloo 2' }}>
              Connect Maratha — हॉल ऑफ फेम
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,248,231,0.9)', lineHeight: 1.6, marginBottom: '20px' }}>
              राष्ट्रीय व आंतरराष्ट्रीय पातळीवर अतुलनीय योगदान देणाऱ्या मराठा सुपुत्रांचा आणि सुकन्यांचा सन्मान. या मान्यवरांनी केवळ आपल्या समाजाचेच नव्हे तर संपूर्ण भारत देशाचे नाव जगात उंचावले आहे.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #FFFFFF, #FF8C42)', color: '#140406' }}>🏆 राष्ट्रीय व आंतरराष्ट्रीय पुरस्कार</span>
              <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #FFFFFF, #FF8C42)', color: '#140406' }}>🚀 इस्रो व संरक्षण सेवा</span>
              <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #FFFFFF, #FF8C42)', color: '#140406' }}>🥇 ऑलिम्पिक व आंतरराष्ट्रीय क्रीडा</span>
              <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #FFFFFF, #FF8C42)', color: '#140406' }}>💼 जागतिक उद्योजकता व AI</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ color: 'var(--gold-400, #F3C06B)', marginBottom: '10px', fontSize: '1.1rem' }}>नामांकन व निवड निकष (Induction Criteria)</h4>
            <ul style={{ fontSize: '0.86rem', color: 'rgba(255,248,231,0.85)', lineHeight: 1.7, listStyle: 'none', paddingLeft: 0, margin: 0 }}>
              <li>✓ प्रमाणित सार्वजनिक पुरावे व अधिकृत मान्यता.</li>
              <li>✓ समाजातील नव्या पिढीसाठी दिशादर्शक प्रेरणा.</li>
              <li>✓ कोणत्याही राजकीय पक्षापासून अलिप्त निष्पक्ष मूल्यमापन.</li>
              <li>✓ CM मेन्टॉरशिप प्रणालीद्वारे विद्यार्थ्यांना मार्गदर्शन करण्याची तयारी.</li>
            </ul>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => setShowNominateModal(true)} 
                className="btn btn-primary" 
                style={{ fontSize: '0.86rem', padding: '8px 20px', background: 'var(--saffron-600, #C73800)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                नामांकन अर्ज सादर करा
              </button>
            </div>
          </div>
        </section>

        {/* FILTER & SEARCH BAR */}
        <div id="achievers-list" style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 24px',
          boxShadow: '0 4px 20px rgba(199, 56, 0, 0.06)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सर्व अचीव्हर्स' },
              { id: 'tech', label: '💻 AI, टेक व अंतराळ' },
              { id: 'defence', label: '🎖️ संरक्षण व पोलीस' },
              { id: 'women', label: '👩 महिला कर्तृत्व (Women)' },
              { id: 'business', label: '🏭 उद्योग व स्टार्टअप्स' },
              { id: 'sports', label: '🏅 क्रीडा व ऑलिम्पिक' },
              { id: 'global', label: '🌍 ग्लोबल मराठा (Global)' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedField(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '30px',
                  background: selectedField === tab.id ? 'var(--maroon-900, #3d0d0d)' : '#FAF3E6',
                  border: '1px solid rgba(230,81,0, 0.12)',
                  color: selectedField === tab.id ? 'var(--gold-400, #F3C06B)' : 'var(--maroon-950, #140406)',
                  fontSize: '0.82rem',
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
            placeholder="🔎 नाव, पद किंवा क्षेत्र शोधा..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '30px',
              border: '1px solid var(--gold-500, #E0A96D)',
              background: '#FFFFFF',
              fontSize: '0.86rem',
              minWidth: '240px'
            }}
          />
        </div>

        {/* ACHIEVERS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredAchievers.map((achiever) => (
            <div 
              key={achiever.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid #EFE4D2',
                boxShadow: '0 8px 24px rgba(199, 56, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
            >
              <div style={{ width: '100%', height: '120px', position: 'relative', overflow: 'hidden', background: 'var(--maroon-900, #3d0d0d)' }}>
                <img 
                  src={achiever.coverImg} 
                  alt={achiever.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '0 20px 10px', display: 'flex', gap: '14px', alignItems: 'flex-end', marginTop: '-34px', position: 'relative', zIndex: 2 }}>
                <img 
                  src={achiever.avatarImg} 
                  alt={achiever.name} 
                  style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FFFFFF', boxShadow: '0 4px 12px rgba(199, 56, 0, 0.22)', background: 'var(--maroon-900, #3d0d0d)', flexShrink: 0 }}
                />
                <div>
                  <span style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(90deg, #FFE8D6, #FFD1A4)', color: '#C73800' }}>
                    {achiever.fame}
                  </span>
                  <h4 style={{ color: 'var(--maroon-950, #140406)', fontSize: '1.15rem', margin: '4px 0 2px', fontFamily: 'Baloo 2' }}>
                    {achiever.name}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#666', fontWeight: 700 }}>
                    {achiever.role}
                  </span>
                </div>
              </div>

              <div style={{ padding: '14px 20px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {achiever.tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, background: 'rgba(230,81,0, 0.08)', color: 'var(--maroon-950, #140406)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.55, marginBottom: '14px' }}>
                    {achiever.bio}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '14px' }}>
                    <strong>योगदान:</strong> {achiever.contribution}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F0E6D8', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#F4511E', fontWeight: 700 }}>
                    {achiever.badge}
                  </span>
                  <Link to="/directory" className="btn btn-outline" style={{ fontSize: '0.76rem', padding: '4px 12px', borderRadius: '4px', textDecoration: 'none', border: '1px solid #D1D5DB', color: '#374151' }}>
                    प्रोफाईल पहा
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOMINATE MODAL */}
      {showNominateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#140406', fontFamily: 'Baloo 2' }}>
                ⭐ नवीन कर्तृत्व नामांकित करा (Nomination)
              </h3>
              <button 
                type="button" 
                onClick={() => setShowNominateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleNominateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>मान्यवरांचे पूर्ण नाव:</label>
                <input 
                  type="text" 
                  required
                  placeholder="उदा. डॉ. सचिन सावंत"
                  value={nominateForm.name}
                  onChange={(e) => setNominateForm({ ...nominateForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>कार्यक्षेत्र:</label>
                <select 
                  value={nominateForm.field}
                  onChange={(e) => setNominateForm({ ...nominateForm, field: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                >
                  <option value="tech">💻 AI, टेक व अंतराळ</option>
                  <option value="defence">🎖️ संरक्षण व पोलीस सेवा</option>
                  <option value="women">👩 महिला सक्षमीकरण व नेतृत्व</option>
                  <option value="business">🏭 उद्योग व स्टार्टअप्स</option>
                  <option value="sports">🏅 ऑलिम्पिक व आंतरराष्ट्रीय क्रीडा</option>
                  <option value="global">🌍 ग्लोबल मराठा (NRI)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>प्रमुख योगदान व यश:</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="त्यांचे प्रमुख पुरस्कार, संशोधन, उद्योग किंवा समाजासाठीचे योगदान..."
                  value={nominateForm.contribution}
                  onChange={(e) => setNominateForm({ ...nominateForm, contribution: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>तुमचा संपर्क (Email / Phone):</label>
                <input 
                  type="text" 
                  required
                  placeholder="पडताळणीसाठी आपला फोन नंबर"
                  value={nominateForm.contact}
                  onChange={(e) => setNominateForm({ ...nominateForm, contact: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowNominateModal(false)}
                  style={{ padding: '8px 18px', border: '1px solid #D1D5DB', background: '#F3F4F6', borderRadius: '8px', cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button 
                  type="submit"
                  style={{ padding: '8px 22px', background: 'var(--saffron-600, #C73800)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  नामांकन पाठवा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
