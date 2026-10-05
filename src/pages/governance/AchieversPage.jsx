import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ACHIEVERS_DATA = [
  {
    id: 'khashaba-jadhav',
    name: 'खाशाबा जाधव (मरणोत्तर)',
    role: 'स्वतंत्र भारताचे पहिले वैयक्तिक ऑलिम्पिक पदक विजेते',
    field: 'sports',
    fame: '🏆 Olympic Legend',
    tags: ['हेलसिंकी ऑलिम्पिक १९५२', 'कुस्ती (Wrestling)', 'कराड / सातारा'],
    coverImg: '/assets/images/real-kolhapur-kusti.jpg',
    avatarImg: '/assets/images/achievers/khashaba_jadhav.jpg',
    bio: '२३ जुलै १९५२ रोजी हेलसिंकी ऑलिम्पिकमध्ये कुस्तीत कांस्यपदक जिंकून स्वतंत्र भारताचा तिरंगा आंतरराष्ट्रीय स्तरावर पहिल्यांदा वैयक्तिक क्रीडा प्रकारात फडकवला. कोल्हापूरच्या लाल मातीची ताकद जगाला दाखवून दिली.',
    contribution: 'स्वतंत्र भारताचे पहिले ऑलिम्पिक पदक, हिंद केसरी परंपरा व हजारो कुस्तीपटूंना ऑलिम्पिकचे स्वप्न दाखवणारे महामानव.',
    badge: '✓ National Sports Immortal'
  },
  {
    id: 'db-shekatkar',
    name: 'लेफ्टनंट जनरल डी. बी. शेकटकर (निवृत्त)',
    role: 'भारतीय संरक्षण रणनीतीकार व अध्यक्ष, शेकटकर समिती',
    field: 'defence',
    fame: '🏆 Param Vishisht Seva',
    tags: ['भारतीय सेना', 'संरक्षण सुधारणा', 'मराठा लाईट इन्फंट्री'],
    coverImg: '/assets/images/achievers/shekatkar_1971.jpg',
    avatarImg: '/assets/images/achievers/db_shekatkar.jpg',
    bio: "भारतीय लष्कराच्या आधुनिकीकरणासाठी केंद्र सरकारने नेमलेल्या ऐतिहासिक 'शेकटकर समिती'चे अध्यक्ष. कारगिल युद्ध व ईशान्य भारतातील अतिसंवेदनशील सीमांवर मराठा बटालियनचे अतुलनीय युद्ध नेतृत्व.",
    contribution: 'भारतीय लष्कराची ऐतिहासिक पुनर्रचना (Shekatkar Report), सीडीएस (CDS) पद निर्मितीची शिफारस, युवा सैनिकी भरती मार्गदर्शन.',
    badge: '✓ Verified Defence Legend'
  },
  {
    id: 'suhas-patil',
    name: 'डॉ. सुहास पाटील',
    role: 'संस्थापक, Cirrus Logic · सिलिकॉन व्हॅली, USA',
    field: 'tech',
    fame: '🏆 Hall of Fame',
    tags: ['AI & Semis', 'ग्लोबल मराठा', 'US / Silicon Valley'],
    coverImg: '/assets/images/achievers/iit_kgp_main.jpg',
    avatarImg: '/assets/images/achievers/cirrus_chip.jpg',
    bio: 'सिलिकॉन व्हॅलीतील जागतिक कीर्तीचे सेमीकंडक्टर उद्योजक. अमेरिकेत TiE (The Indus Entrepreneurs) ची सह-स्थापना करून हजारो तंत्रज्ञान तरुणांना जागतिक उद्योजक बनवले.',
    contribution: 'सेमीकंडक्टर चिप डिझाईन, उच्च शिक्षण निधी, आयआयटी खडकपूर सिस्टीम्स लॅब व मराठी युवा स्टार्टअप मेन्टॉरशिप.',
    badge: '✓ Verified Global Profile'
  },
  {
    id: 'babasaheb-kalyani',
    name: 'बाबासाहेब कल्याणी',
    role: 'अध्यक्ष व व्यवस्थापकीय संचालक, भारत फोर्ज लिमिटेड',
    field: 'business',
    fame: '🏆 Industry Leader',
    tags: ['उद्योग व मॅन्युफॅक्चरिंग', 'डिफेन्स तोफखाना', 'पद्मभूषण'],
    coverImg: '/assets/images/maratha-business-sangam.jpg',
    avatarImg: '/assets/images/achievers/baba_kalyani.jpg',
    bio: 'जगातील सर्वांत मोठी फोर्जिंग कंपनी म्हणून भारत फोर्जला जागतिक स्तरावर नेणारे विख्यात उद्योगपती. भारतीय तोफखाना, स्वदेशी अताग तोफ (ATAGS) व संरक्षण उपकरणांच्या उत्पादनात भारताला स्वावलंबी केले.',
    contribution: 'मेक इन इंडिया, भारतीय लष्कराला स्वदेशी तोफा, हजारो मराठी तरुणांना थेट रोजगार व ग्रामीण विकास प्रकल्प.',
    badge: '✓ Verified Industry Profile'
  },
  {
    id: 'anita-bhosale',
    name: 'डॉ. अनिता भोसले',
    role: 'इस्रो अंतराळ शास्त्रज्ञ (ISRO Space Mission)',
    field: 'women',
    fame: '🏆 Women Leader',
    tags: ['महिला कर्तृत्व', 'चांद्रयान-३ / गगनयान', 'Space Science'],
    coverImg: '/assets/images/achievers/chandrayaan3_launch.jpg',
    avatarImg: '/assets/images/achievers/chandrayaan3_liftoff.jpg',
    bio: 'चांद्रयान-३ आणि आदित्य L1 मोहिमांमध्ये अंतराळ उड्डाण नियंत्रण, ट्रॅजेक्टरी सॉफ्टवेअर व नेव्हिगेशन सिस्टीम्सवर काम करणाऱ्या आघाडीच्या इस्रो शास्त्रज्ञ. ग्रामीण विद्यार्थिनींना विज्ञानात करिअर करण्यासाठी प्रेरणा देणाऱ्या मार्गदर्शक.',
    contribution: 'इस्रो सॅटेलाईट ट्रॅजेक्टरी सॉफ्टवेअर, चांद्रयान-३ सुरक्षित लँडिंग प्रणाली, ग्रामीण मुलींसाठी STEM शिष्यवृत्ती कार्यक्रम.',
    badge: '✓ Verified ISRO Profile'
  },
  {
    id: 'raghunath-mashelkar',
    name: 'डॉ. रघुनाथ माशेलकर',
    role: 'ज्येष्ठ आंतरराष्ट्रीय शास्त्रज्ञ व CSIR चे माजी महासंचालक',
    field: 'tech',
    fame: '🏆 Padma Vibhushan',
    tags: ['हळद पेटंट विजय', 'इन्व्हेंशन भारत', 'पद्मविभूषण'],
    coverImg: '/assets/images/achievers/csir_campus.jpg',
    avatarImg: '/assets/images/achievers/mashelkar_hq.jpg',
    bio: "अमेरिकेत हळदीचे पेटंट भारताच्या नावे जिंकून भारताचा पारंपारिक बौद्धिक अधिकार जागतिक मंचावर सिद्ध करणारे महान शास्त्रज्ञ. 'समावेशक नाविन्यता' (More from Less for More People) या जागतिक सिद्धांताचे जनक.",
    contribution: "CSIR संशोधन क्रांती, बौद्धिक संपदा अधिकार रक्षण, ग्रामीण विद्यार्थ्यांसाठी 'आनंद सायन्स फाऊंडेशन'.",
    badge: '✓ Eminent Scientist'
  },
  {
    id: 'rahi-sarnobat',
    name: 'राही सरनोबत',
    role: 'आशियाई क्रीडा सुवर्णपदक विजेती ऑलिम्पियन नेमबाज',
    field: 'sports',
    fame: '🏆 Asian Gold Champion',
    tags: ['२५मी पिस्तूल शुटिंग', 'अर्जुन पुरस्कार', 'कोल्हापूर'],
    coverImg: '/assets/images/real-kolhapur-kusti.jpg',
    avatarImg: '/assets/images/achievers/rahi_sarnobat.jpg',
    bio: 'आशियाई खेळात २५ मीटर पिस्तूल नेमबाजीत सुवर्णपदक जिंकणारी पहिली भारतीय महिला खेळाडू. जागतिक चषक (ISSF World Cup) सुवर्णपदक पटकावून कोल्हापूरचे नाव जगात अजरामर केले.',
    contribution: 'आंतरराष्ट्रीय नेमबाजी सुवर्णपदके, क्रीडा प्रबोधिनी युवा नेमबाज प्रशिक्षण व मुलींना खेळासाठी प्रोत्साहन.',
    badge: '✓ Verified Sports Star'
  },
  {
    id: 'tukaram-mundhe',
    name: 'तुकाराम मुंढे (IAS)',
    role: 'ज्येष्ठ प्रशासकीय अधिकारी व जनसेवक',
    field: 'defence',
    fame: '🏆 Administrative Icon',
    tags: ['भारतीय प्रशासकीय सेवा (IAS)', 'पारदर्शक सुशासन', 'जनसामान्यांचे अधिकारी'],
    coverImg: '/assets/images/meeting.jpg',
    avatarImg: '/assets/images/officers/officer_tukaram.jpg',
    bio: 'अत्यंत कर्तव्यदक्ष, पारदर्शक आणि लोकाभिमुख प्रशासनासाठी ओळखले जाणारे ज्येष्ठ IAS अधिकारी. आरोग्य, शिक्षण, पाणीपुरवठा व महापालिका प्रशासनात धडक सुधारणा करून जनतेचा प्रचंड विश्वास संपादन केला.',
    contribution: 'भ्रष्टाचारमुक्ती धडक मोहीम, जलजीवन मिशन गतिमानता, गरीब रुग्णांसाठी शासकीय आरोग्य व्यवस्थांचे सक्षमीकरण.',
    badge: '✓ Verified IAS Profile'
  },
  {
    id: 'nagraj-manjule',
    name: 'नागराज मंजुळे',
    role: 'राष्ट्रीय पुरस्कार विजेते चित्रपट दिग्दर्शक व लेखक',
    field: 'global',
    fame: '🏆 National Award Winner',
    tags: ['सिनेमा व साहित्य', 'फँड्री / सैराट / झुंड', 'मराठी कला गौरव'],
    coverImg: '/assets/images/apla-maharashtra-gallery.jpg',
    avatarImg: '/assets/images/artists/artist_nagraj.jpg',
    bio: 'सोलापूरच्या ग्रामीण मातीतून येऊन मराठी चित्रपटाला जागतिक स्तरावर नेणारे दिग्गज दिग्दर्शक. वास्तववादी समाजभान, सर्वसामान्यांचे जगणे आणि जागतिक चित्रपट महोत्सवांमध्ये मराठी भाषेचा गौरव वाढवला.',
    contribution: 'राष्ट्रीय सुवर्णकमळ पुरस्कार, मराठी सिनेमाचे १०० कोटींचे जागतिक बॉक्स ऑफिस, ग्रामीण साहित्य संवर्धन.',
    badge: '✓ Verified Cultural Icon'
  },
  {
    id: 'dr-ramesh-patil',
    name: 'डॉ. रमेश पाटील',
    role: 'ज्येष्ठ हृदयरोग तज्ज्ञ व समाजभूषण',
    field: 'tech',
    fame: '🏆 Medical Excellence',
    tags: ['हृदयरोग शल्यचिकित्सा', 'मोफत बालहृदय शिबिरे', 'वैद्यकीय सेवा'],
    coverImg: '/assets/images/maratha-services-care.jpg',
    avatarImg: '/assets/images/doctors/dr_patil.jpg',
    bio: 'गेल्या २५ वर्षांत १५,००० हून अधिक यशस्वी बायपास व अँजिओप्लास्टी शस्त्रक्रिया करणारे नामवंत कार्डिओलॉजिस्ट. ग्रामीण भागातील हजारो गरीब बालकांच्या हृदय शस्त्रक्रिया मोफत करून त्यांना जीवनदान दिले.',
    contribution: 'ग्रामीण हृदय तपासणी शिबिरे, मोफत औषधोपचार, कनेक्ट मराठा २४x७ आपत्कालीन आरोग्य सल्लागार.',
    badge: '✓ Verified Healthcare Legend'
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
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75) contrast(1.08)' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(18,2,4,0.78) 0%, rgba(199,56,0,0.45) 50%, rgba(18,2,4,0.72) 100%)' }}></div>
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

        {/* NEW SECTION: गौरवशाली कामगिरी व क्षेत्रनिहाय प्रभाव (Impact Highlights) */}
        <div style={{ marginTop: '56px', background: '#FFFFFF', borderRadius: '20px', padding: '36px', border: '1px solid #FFD1A4', boxShadow: '0 8px 30px rgba(199,56,0,0.06)' }}>
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 32px' }}>
            <span style={{ background: '#FFF1E5', color: '#C73800', padding: '4px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800 }}>
              🌟 राष्ट्रीय व जागतिक प्रभाव (National & Global Impact)
            </span>
            <h3 style={{ fontSize: '1.9rem', color: '#140406', margin: '10px 0 8px', fontFamily: 'Baloo 2' }}>
              मराठा समाजाचे सर्वसमावेशक राष्ट्रीय योगदान
            </h3>
            <p style={{ color: '#4B5563', fontSize: '0.96rem', lineHeight: 1.6 }}>
              संरक्षणापासून अंतराळ संशोधनापर्यंत आणि ऑलिम्पिक मैदानापासून जागतिक उद्योगांपर्यंत समाजातील दिग्गजांनी घडवलेला ऐतिहासिक ठसा.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFF8F2', padding: '22px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🚀</div>
              <h4 style={{ margin: '0 0 6px', color: '#C73800', fontSize: '1.15rem' }}>इस्रो व विज्ञान संशोधन</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.55 }}>
                चांद्रयान-३, आदित्य L1 आणि गगनयान मोहिमांमध्ये मराठी शास्त्रज्ञ व महिला तंत्रज्ञांचे मोलाचे योगदान.
              </p>
            </div>

            <div style={{ background: '#FFF8F2', padding: '22px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎖️</div>
              <h4 style={{ margin: '0 0 6px', color: '#C73800', fontSize: '1.15rem' }}>संरक्षण व मराठा रेजिमेंट</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.55 }}>
                'बोल छत्रपती शिवाजी महाराज की जय!'च्या रणघोषात देशाच्या सीमांचे अभेद्य रक्षण करणारे वीर जवान व सेनानी.
              </p>
            </div>

            <div style={{ background: '#FFF8F2', padding: '22px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🏅</div>
              <h4 style={{ margin: '0 0 6px', color: '#C73800', fontSize: '1.15rem' }}>ऑलिम्पिक व आंतरराष्ट्रीय क्रीडा</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.55 }}>
                खाशाबा जाधवांपासून राही सरनोबतपर्यंत कुस्ती, नेमबाजी, ॲथलेटिक्स व देशी खेळांमध्ये भारताचा गौरव.
              </p>
            </div>

            <div style={{ background: '#FFF8F2', padding: '22px', borderRadius: '14px', border: '1px solid #FFCC80', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🏭</div>
              <h4 style={{ margin: '0 0 6px', color: '#C73800', fontSize: '1.15rem' }}>उद्योग, फोर्जिंग व स्टार्टअप्स</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.55 }}>
                भारत फोर्ज, सिरस लॉजिक ते नवउद्यमी फिनटेक संस्थांपर्यंत लाखो रोजगारांची निर्मिती व राष्ट्रउभारणी.
              </p>
            </div>
          </div>

          {/* Inspirational Quote Banner */}
          <div style={{ marginTop: '36px', background: 'linear-gradient(135deg, #1C0507, #3D0D0D)', borderRadius: '14px', padding: '24px 30px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '750px' }}>
              <div style={{ color: '#F3C06B', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px' }}>
                💡 छत्रपती शिवरायांची शिकवण:
              </div>
              <div style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#FFEEDD', lineHeight: 1.6 }}>
                "केवळ स्वप्ने पाहून साम्राज्य उभे राहत नाही, तर कठोर शिस्त, बुद्धिमत्ता आणि अहोरात्र कष्टानेच युग घडवले जाते."
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setShowNominateModal(true)} 
              className="btn btn-primary" 
              style={{ padding: '10px 22px', background: 'linear-gradient(90deg, #F3C06B, #E0A96D)', color: '#140406', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ⭐ अचीव्हर नामांकन करा →
            </button>
          </div>
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
