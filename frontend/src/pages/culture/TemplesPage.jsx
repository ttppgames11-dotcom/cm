import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_TEMPLES = [
  {
    id: 't1',
    name: 'कुलस्वामिनी श्री तुळजाभवानी माता',
    category: 'kuldaivat',
    categoryLabel: 'कुलदैवत व शक्तिपीठ',
    place: 'तुळजापूर, धाराशिव',
    aartiTimes: 'काकड आरती: ५:३० AM · महापूजा: १२:०० PM · शेजारती: ९:३० PM',
    desc: 'छत्रपती शिवाजी महाराज व भोसले घराण्याची कुलस्वामिनी. छत्रपती शिवरायांना भवानी तलवार प्रदान करून हिंदवी स्वराज्य स्थापनेचा आशीर्वाद देणारी आई जगदंबा. साडेतीन शक्तिपीठांपैकी संपूर्ण पीठ.',
    history: 'राष्ट्रकूट आणि कदंब काळापासूनचे प्राचीन देवस्थान. छत्रपती शिवरायांनी १६६२ मध्ये येथे येऊन सुवर्ण पादुका व छत्र अर्पण केले होते.',
    icon: '🚩',
    image: '/assets/images/real-tuljabhavani-temple.jpg',
    darshanStatus: 'सुलभ दर्शन सुरू (२४ तास मंदिर परिसर खुला)'
  },
  {
    id: 't2',
    name: 'श्री जगदीश्वर मंदिर व शिवराय समाधी',
    category: 'shivkalin',
    categoryLabel: 'शिवकालीन राजधानी देवस्थान',
    place: 'किल्ले रायगड (दुर्गराज)',
    aartiTimes: 'प्रातः आरती: ७:०० AM · संध्या आरती: ६:३० PM',
    desc: 'छत्रपती शिवरायांनी राजधानी रायगडावर स्वतःच्या देखरेखीखाली बांधलेले भव्य महादेवाचे मंदिर. मंदिराच्या प्रवेश पायरीवर "सेवेचे ठायी तत्पर हिरोजी इंदुलकर" ही ऐतिहासिक अक्षरे कोरलेली आहेत.',
    history: '१६७४ च्या राज्याभिषेकापूर्वी या मंदिराची प्रतिष्ठापना झाली. मंदिरासमोरच छत्रपती शिवाजी महाराजांचे पवित्र समाधी स्मारक आहे.',
    icon: '🛕',
    image: '/assets/images/real-jagdishwar-temple.jpg',
    darshanStatus: 'रोपवे व पायरी मार्गे दर्शन सुरू'
  },
  {
    id: 't3',
    name: 'श्री शंभू महादेव मंदिर',
    category: 'kuldaivat',
    categoryLabel: 'भोसले कुलदैवत',
    place: 'शिखर शिंगणापूर, सातारा',
    aartiTimes: 'अभिषेक: ६:०० AM · दुपार पूजा: १२:३० PM · आरती: ८:०० PM',
    desc: 'समस्त मराठा घराण्यांचे आणि भोसले वंशाचे आद्य कुलदैवत. शहाजीराजे भोसले, मालोजीराजे आणि छत्रपती शिवरायांचे निस्सीम श्रद्धास्थान.',
    history: 'मालोजीराजे भोसले यांनी येथे भव्य तलाव व पायऱ्या बांधून देवस्थानाचा जिर्णोद्धार केला होता. चैत्र शुद्ध अष्टमीला भव्य कावड यात्रा भरते.',
    icon: '🔱',
    image: '/assets/images/real-shikhar-shingnapur.jpg',
    darshanStatus: 'थेट दर्शन व अभिषेक व्यवस्था उपलब्ध'
  },
  {
    id: 't4',
    name: 'श्री खंडोबा देवस्थान (येळकोट येळकोट जय मल्हार)',
    category: 'kuldaivat',
    categoryLabel: 'महाराष्ट्राचे कुलदैवत',
    place: 'जेजुरी (जयद्री), पुणे',
    aartiTimes: 'काकड आरती: ५:०० AM · पंचामृत पूजा: ११:०० AM · शेजारती: ९:०० PM',
    desc: 'महाराष्ट्राचे लाडके कुलदैवत, मावळ्यांचे आराध्य आणि सोन्याची जेजुरी. भंडारा उधळून मराठा योद्धे रणांगणात "येळकोट येळकोट जय मल्हार"चा गजर करत असत.',
    history: '१६६२ मध्ये छत्रपती शिवाजी महाराज आणि शहाजीराजे भोसले यांची ऐतिहासिक भेट जेजुरीच्या भूमीवर झाली होती. पेशवे काळात मंदिराचे भव्य तटबंदीयुक्त रूप साकारले.',
    icon: '☀️',
    image: '/assets/images/real-jejuri-khandoba.jpg',
    darshanStatus: 'भंडारा दर्शन व पालखी सोहळा नियमित सुरू'
  },
  {
    id: 't5',
    name: 'श्री अंबाबाई (महालक्ष्मी) महापीठ',
    category: 'shaktipeeth',
    categoryLabel: 'साडेतीन शक्तिपीठ',
    place: 'करवीर पीठ, कोल्हापूर',
    aartiTimes: 'काकड आरती: ५:०० AM · अभिषेक: ८:३० AM · महाआरती: १२:०० PM',
    desc: 'महाराष्ट्रातील प्रमुख शक्तिपीठ. छत्रपती ताराबाई यांनी कोल्हापूर मराठा गादी स्थापन केल्यानंतर हे संस्थानचे प्रमुख श्रद्धास्थान राहिले.',
    history: 'चालुक्य व शिलाहार कालीन हेमाडपंथी स्थापत्य. वर्षातून दोनदा थेट सूर्यकिरणे देवीच्या मुखावर पडणारा किरणोत्सव जगप्रसिद्ध आहे.',
    icon: '🌸',
    image: '/assets/images/real-kolhapur-mahalaxmi.jpg',
    darshanStatus: 'ई-पास व थेट दर्शन रांग उपलब्ध'
  },
  {
    id: 't6',
    name: 'श्री जोतिबा देवस्थान (केदारलिंग)',
    category: 'kuldaivat',
    categoryLabel: 'दक्षिण महाराष्ट्र कुलदैवत',
    place: 'वाडी रत्नागिरी, कोल्हापूर',
    aartiTimes: 'काकड आरती: ५:३० AM · मुख्य पूजा: १२:०० PM · शेजारती: १०:०० PM',
    desc: 'गुलालाची उधळण आणि "चांगभलं"चा जयघोष! कोल्हापूरच्या छत्रपती घराण्याचे व लाखो मराठा सरदारांचे कुलदैवत.',
    history: '१७३० मध्ये राणोजी शिंदे यांनी सध्याच्या मंदिराचा जिर्णोद्धार केला. चैत्र पौर्णिमेला लाखो भाविकांच्या उपस्थितीत भव्य सासनकाठी सोहळा होतो.',
    icon: '✨',
    image: '/assets/images/real-jotiba-wadi-ratnagiri.jpg',
    darshanStatus: 'सासनकाठी दर्शन व गुलाल अर्पण सुरू'
  },
  {
    id: 't7',
    name: 'श्री रायरेश्वर मंदिर (स्वराज्य प्रतिज्ञा स्थळ)',
    category: 'shivkalin',
    categoryLabel: 'स्वराज्य प्रतिज्ञा तीर्थ',
    place: 'रायरेश्वर पठार, भोर, पुणे',
    aartiTimes: 'नित्य पूजा: ७:०० AM · आरती: ७:०० PM',
    desc: '२६ एप्रिल १६४५ रोजी १६ वर्षांच्या शिवरायांनी मावळ्यांसह रक्ताचा अभिषेक करून हिंदवी स्वराज्य स्थापनेची पवित्र शपथ घेतलेली ऐतिहासिक भूमी.',
    history: 'सह्याद्रीच्या पठारावर वसलेले अतिप्राचीन स्वयंभू शिवमंदिर. येथे स्वराज्याचा पहिला संकल्प सिद्धीस गेला.',
    icon: '⚔️',
    image: '/assets/images/real-raireshwar-temple.jpg',
    darshanStatus: 'पठार ट्रेक व दर्शन नियमित सुरू'
  },
  {
    id: 't8',
    name: 'श्री भीमाशंकर ज्योतिर्लिंग',
    category: 'jyotirlinga',
    categoryLabel: '१२ ज्योतिर्लिंगांपैकी एक',
    place: 'भीमाशंकर, खेड, पुणे',
    aartiTimes: 'काकड आरती: ४:३० AM · महापूजा: १२:०० PM · संध्या आरती: ७:३० PM',
    desc: 'भीमा नदीचे उगमस्थान आणि सह्याद्रीच्या घनदाट अरण्यातील स्वयंभू ज्योतिर्लिंग. मराठा पेशव्यांच्या काळातील भव्य हेमाडपंथी शिखर.',
    history: 'नाना फडणवीस यांनी या मंदिराचे भव्य शिखर व सभामंडप उभारला. चिमाजी आप्पा यांनी वसईच्या युद्धात पोर्तुगिजांकडून जिंकलेली महाकाय घंटा येथे अर्पण केली.',
    icon: '🔔',
    image: '/assets/images/real-bhimashankar-temple.jpg',
    darshanStatus: 'व्हीआयपी व सर्वसामान्य दर्शन पास उपलब्ध'
  },
  {
    id: 't9',
    name: 'श्री घृष्णेश्वर ज्योतिर्लिंग',
    category: 'jyotirlinga',
    categoryLabel: '१२ वे ज्योतिर्लिंग व भोसले मूळ',
    place: 'वेरूळ, छत्रपती संभाजीनगर',
    aartiTimes: 'प्रातः आरती: ५:३० AM · भोग पूजा: १२:०० PM · आरती: ८:०० PM',
    desc: 'छत्रपती शिवाजी महाराजांचे पूर्वज मालोजीराजे भोसले व बाबाजीराजे भोसले यांच्या मूळ गाव वेरूळ येथील १२ वे ज्योतिर्लिंग.',
    history: 'मालोजीराजे भोसले यांनी येथे कमळ तळे बांधले व मंदिराचा जिर्णोद्धार केला. पुढे पुण्यश्लोक अहिल्याबाई होळकरांनी मंदिराचे संपूर्ण पुनर्निर्माण लाल दगडात केले.',
    icon: '🪔',
    image: '/assets/images/real-grishneshwar-temple.jpg',
    darshanStatus: 'सुलभ दर्शन व अभिषेक सुरू'
  },
  {
    id: 't10',
    name: 'श्री त्र्यंबकेश्वर ज्योतिर्लिंग',
    category: 'jyotirlinga',
    categoryLabel: 'ब्रह्म, विष्णू, महेश स्वरूप',
    place: 'त्र्यंबकेश्वर, नाशिक',
    aartiTimes: 'काकड आरती: ५:३० AM · माध्यान्ह पूजा: १:०० PM · शेजारती: ९:०० PM',
    desc: 'गोदावरी नदीचे उगमस्थान. येथे शिवलिंगात ब्रह्मा, विष्णू आणि महेश या तीनही देवांचे त्रिमुखी स्वरूप विराजमान आहे.',
    history: 'श्रीमंत नानासाहेब पेशवे यांनी १७५५ ते १७८६ दरम्यान काळ्या पाषाणात हे अत्यंत कलाकुसरयुक्त भव्य मंदिर नव्याने बांधून पूर्ण केले.',
    icon: '🌊',
    image: '/assets/images/real-trimbakeshwar.jpg',
    darshanStatus: 'कालसर्प व महापूजा नोंदणी सुरू'
  },
  {
    id: 't11',
    name: 'श्री रेणुका माता महापीठ (माहूर)',
    category: 'shaktipeeth',
    categoryLabel: 'साडेतीन शक्तिपीठ',
    place: 'माहूर गड, नांदेड',
    aartiTimes: 'काकड आरती: ५:०० AM · नैवेद्य व महापूजा: १२:०० PM · शेजारती: ९:०० PM',
    desc: 'साडेतीन शक्तिपीठांपैकी प्रमुख पूर्ण पीठ. भगवान परशुरामांची जन्मभूमी व माता रेणुकेचे जागृत देवस्थान. मराठा सरदारांचे श्रद्धास्थान.',
    history: 'राष्ट्रकूट आणि यादव काळापासून प्रसिद्ध. छत्रपती शिवाजी महाराजांचे सरदार व होळकर-शिंदे घराण्यांनी या मंदिरास देणग्या दिल्या होत्या.',
    icon: '🌸',
    image: '/assets/images/real-renukadevi-mahur.jpg',
    darshanStatus: 'थेट दर्शन व पायरी/वाहनाने सुलभ प्रवेश'
  },
  {
    id: 't12',
    name: 'श्री सप्तशृंगी माता (अर्धे शक्तिपीठ)',
    category: 'shaktipeeth',
    categoryLabel: 'साडेतीन शक्तिपीठ',
    place: 'सप्तशृंग गड, वणी, नाशिक',
    aartiTimes: 'काकड आरती: ५:३० AM · पंचामृत अभिषेक: ८:०० AM · शेजारती: ९:३० PM',
    desc: 'महाराष्ट्रातील साडेतीन शक्तिपीठांपैकी अर्धे पीठ. सह्याद्रीच्या सात शिखरांच्या कुशीत विराजमान असलेली १८ हातांची भव्य महिषासुरमर्दिनी.',
    history: 'छत्रपती शिवाजी महाराज सुरत मोहिमेवरून परतताना येथे देवीच्या दर्शनास आले होते व नवस फेडून सोन्याचे अलंकार अर्पण केले होते.',
    icon: '🌺',
    image: '/assets/images/real-saptashrungi-temple.jpg',
    darshanStatus: 'फ्युनिक्युलर ट्रॉली व दर्शन रांग सुरू'
  },
  {
    id: 't13',
    name: 'किल्ले प्रतापगड श्री भवानी माता मंदिर',
    category: 'shivkalin',
    categoryLabel: 'शिवकालीन राजधानी देवस्थान',
    place: 'किल्ले प्रतापगड, महाबळेश्वर, सातारा',
    aartiTimes: 'प्रातः पूजा: ७:०० AM · संध्या आरती: ६:३० PM',
    desc: 'अफझलखानाच्या वधानंतर छत्रपती शिवाजी महाराजांनी नेपाळमधील गंडकी नदीतून खास शाळिग्राम पाषाण आणवून प्रतापगडावर स्वतः स्थापन केलेले भवानी मातेचे मंदिर.',
    history: '१६६१ मध्ये छत्रपती शिवरायांनी स्वतः मंदिराची उभारणी केली. मंदिराच्या गाभाऱ्यात अखंड ज्योत तेवत असून शिवरायांची भवानी तलवार येथे ठेवली जात असे.',
    icon: '🚩',
    image: '/assets/images/real-pratapgad-bhavani.jpg',
    darshanStatus: 'गडावर सुलभ पायी दर्शन सुरू'
  }
];

export default function TemplesPage() {
  const [temples, setTemples] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_temples_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge images and also include any new default temples (like Mahur, Saptashrungi, Pratapgad)
          const merged = parsed.map(item => {
            const def = DEFAULT_TEMPLES.find(d => d.id === item.id);
            return {
              ...item,
              image: item.image || (def ? def.image : '')
            };
          });

          // Append any newly added default temples not in user's saved list
          DEFAULT_TEMPLES.forEach(def => {
            if (!merged.some(m => m.id === def.id)) {
              merged.push(def);
            }
          });

          return merged;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEMPLES;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'kuldaivat',
    categoryLabel: 'कुलदैवत',
    place: '',
    aartiTimes: '',
    desc: '',
    history: '',
    icon: '🛕',
    image: '',
    darshanStatus: 'दर्शन नियमित सुरू'
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_temples_list', JSON.stringify(temples));
    } catch (e) {
      console.error(e);
    }
  }, [temples]);

  const filteredTemples = temples.filter(t => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const matchesQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      name: '',
      category: 'kuldaivat',
      categoryLabel: 'कुलदैवत',
      place: '',
      aartiTimes: 'काकड आरती: ६:०० AM · शेजारती: ९:०० PM',
      desc: '',
      history: '',
      icon: '🛕',
      image: '',
      darshanStatus: 'दर्शन नियमित सुरू'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditItem(t);
    setFormData({
      name: t.name,
      category: t.category,
      categoryLabel: t.categoryLabel,
      place: t.place,
      aartiTimes: t.aartiTimes || '',
      desc: t.desc,
      history: t.history || '',
      icon: t.icon || '🛕',
      image: t.image || '',
      darshanStatus: t.darshanStatus || 'दर्शन सुरू'
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('हे मंदिर रेकॉर्ड हटवायचे आहे का?')) {
      setTemples(temples.filter(t => t.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व मंदिरे मूळ अधिकृत डेटावर रीसेट करायची आहेत का?')) {
      setTemples(DEFAULT_TEMPLES);
      localStorage.setItem('cm_temples_list', JSON.stringify(DEFAULT_TEMPLES));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.place.trim()) {
      alert('कृपया मंदिराचे नाव आणि ठिकाण प्रविष्ट करा.');
      return;
    }

    if (editItem) {
      setTemples(temples.map(t => t.id === editItem.id ? { ...t, ...formData } : t));
    } else {
      const newTemple = {
        id: 't_' + Date.now(),
        ...formData
      };
      setTemples([newTemple, ...temples]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{
          borderRadius: '24px',
          padding: '40px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 20px 50px rgba(61,13,13,0.2)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1E0606'
        }}>
          {/* Prominent Authentic Temple Background Image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/assets/images/real-ellora-kailash.jpg)',
              backgroundPosition: 'center 35%',
              backgroundSize: 'cover',
              opacity: 0.65,
              filter: 'saturate(1.15) contrast(1.05)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Light Ambient Overlay - clearly shows temple while keeping text readable */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(28, 6, 6, 0.72) 0%, rgba(45, 10, 10, 0.55) 55%, rgba(20, 4, 4, 0.45) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1.5px solid #FFD700', padding: '6px 18px', borderRadius: '24px', marginBottom: '14px' }}>
                <span style={{ color: '#FFD700', fontSize: '1.1rem' }}>🚩</span>
                <span style={{ color: '#FFF', fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  आध्यात्मिक अधिष्ठान • कुलदैवत व तीर्थक्षेत्र महादालन
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                margin: '0 0 10px',
                color: '#FFF',
                lineHeight: 1.2,
                textShadow: '0 3px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)'
              }}>
                शिवकालीन मंदिरे, कुलदैवते व तीर्थक्षेत्रे
              </h1>
              <p style={{ color: '#FFF8F0', fontSize: '1.05rem', maxWidth: '780px', margin: 0, lineHeight: 1.65, fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>
                तुळजापूर भवानी, रायगड जगदीश्वर, शिखर शिंगणापूर ते जेजुरी — स्वराज्याला आध्यात्मिक बळ देणारी पवित्र श्रद्धास्थाने.
                येथे सर्व माहिती <strong>रिअल-टाइम</strong> संपादनक्षम (Fully Editable) आहे.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleOpenAdd}
                style={{
                  background: 'linear-gradient(135deg, #DD8A2E 0%, #C9701C 100%)',
                  color: '#2A0606',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                <span>➕</span> नवीन मंदिर जोडा
              </button>
              <button
                onClick={handleResetDefaults}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFF',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                ↺ मूळ डेटा रीसेट
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1.5px solid rgba(221,138,46,0.5)',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 700 }}>नोंदवलेली देवस्थाने</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{temples.length} मंदिरे</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 700 }}>कुलदैवत स्थाने</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {temples.filter(t => t.category === 'kuldaivat').length}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 700 }}>ज्योतिर्लिंग व शक्तीपीठे</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {temples.filter(t => t.category === 'jyotirlinga' || t.category === 'shaktipeeth').length}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 700 }}>थेट आरती व दर्शन वेळा</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>सक्रिय ✓</div>
            </div>
          </div>
        </div>

        {/* Ahilyabai Holkar Temple Restoration Heritage Showcase */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E6DDCE',
          boxShadow: '0 6px 20px rgba(61,13,13,0.06)',
          overflow: 'hidden',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 220px) 1fr'
        }}>
          <div style={{
            position: 'relative',
            background: '#1A0808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '170px',
            maxHeight: '210px',
            overflow: 'hidden'
          }}>
            <img
              src="/assets/images/real-ahilyabai-holkar.jpg"
              alt="पुण्यश्लोक अहिल्याबाई होळकर"
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '200px' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '6px 8px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              color: '#FFD700',
              fontSize: '0.75rem',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              पुण्यश्लोक अहिल्याबाई होळकर
            </div>
          </div>

          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div>
              <span style={{
                background: '#FDF3E6',
                color: '#C9701C',
                padding: '3px 10px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                🏛️ ऐतिहासिक मंदिर जीर्णोद्धाराचा सुवर्ण वारसा
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '1.35rem',
              color: '#3D0D0D',
              margin: '8px 0 6px',
              lineHeight: 1.3
            }}>
              काशी विश्वनाथ ते सोमनाथ — मराठा साम्राज्याचे धर्मरक्षण कार्य
            </h2>
            <p style={{ color: '#5C534B', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 10px' }}>
              मुघल व आक्रमकांच्या आघाताने उद्ध्वस्त झालेली हिंदू तीर्थक्षेत्रे पुन्हा वैभवाने उभी करण्याचे ऐतिहासिक कार्य पुण्यश्लोक राजमाता अहिल्याबाई होळकर यांनी केले.
              त्यांनी <strong>काशी विश्वनाथ</strong>, <strong>सोमनाथ</strong>, <strong>गया</strong>, <strong>बद्रीनाथ</strong>, <strong>केदारनाथ</strong>, <strong>अयोध्या</strong>, <strong>हरिद्वार</strong> ते दक्षिणेतील <strong>रामेश्वरम</strong>पर्यंत शेकडो मंदिरे, घाट, धर्मशाळा आणि अन्नछत्रे स्वखर्चाने उभारली.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#FAF6F0', border: '1px solid #E6DDCE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#3D0D0D', fontWeight: 700 }}>
                📍 काशी विश्वनाथ मंदिर पुनर्निर्माण (१७८०)
              </span>
              <span style={{ background: '#FAF6F0', border: '1px solid #E6DDCE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#3D0D0D', fontWeight: 700 }}>
                📍 सोमनाथ मंदिर जिर्णोद्धार (१७८३)
              </span>
              <span style={{ background: '#FAF6F0', border: '1px solid #E6DDCE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#3D0D0D', fontWeight: 700 }}>
                📍 नर्मदा महेश्वर घाट व धर्मशाळा
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Filters & Search Bar */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सर्व देवस्थाने' },
              { id: 'kuldaivat', label: '🚩 कुलदैवते' },
              { id: 'jyotirlinga', label: '🔱 ज्योतिर्लिंगे' },
              { id: 'shaktipeeth', label: '🌸 शक्तिपीठे' },
              { id: 'shivkalin', label: '🛕 शिवकालीन मंदिरे' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: activeCategory === cat.id ? '2px solid #DD8A2E' : '1px solid #E6DDCE',
                  background: activeCategory === cat.id ? '#3D0D0D' : '#FAF6F0',
                  color: activeCategory === cat.id ? '#FFD700' : '#5C534B',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="मंदिर किंवा शहर शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E6DDCE',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
              🔍
            </span>
          </div>
        </div>

        {/* Temples Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {filteredTemples.map((t) => (
            <div
              key={t.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 8px 24px rgba(61,13,13,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                maxWidth: '420px',
                width: '100%'
              }}>
              <div>
                {/* Authentic Temple Image Header */}
                {t.image && (
                  <div style={{
                    width: '100%',
                    height: '210px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '14px',
                    background: '#1A0E08',
                    position: 'relative',
                    boxShadow: 'inset 0 0 12px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Blurred Ambient Background so no awkward black empty borders */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-10px',
                        backgroundImage: `url(${t.image})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        filter: 'blur(16px) brightness(0.4)',
                        transform: 'scale(1.1)',
                        zIndex: 0
                      }}
                    />

                    {/* Main Image Fitted Completely Without Cropping */}
                    <img
                      src={t.image}
                      alt={t.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '210px',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '8px 12px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 2
                    }}>
                      <span style={{ color: '#FFF', fontSize: '0.78rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>📍 {t.place}</span>
                      <span style={{
                        background: '#DD8A2E',
                        color: '#2A0606',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                      }}>
                        {t.categoryLabel || t.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Header with Icon & Category (shown if no image or complement) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#FDF3E6',
                    border: '1px solid #DD8A2E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}>
                    {t.icon}
                  </div>
                  {!t.image && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{
                        background: '#FAF0E6',
                        color: '#C9701C',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '14px'
                      }}>
                        {t.categoryLabel || t.category}
                      </span>
                    </div>
                  )}
                </div>

                <h3 style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#3D0D0D',
                  margin: '0 0 6px',
                  lineHeight: 1.3
                }}>
                  {t.name}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  color: '#DD8A2E',
                  fontWeight: 700,
                  marginBottom: '10px'
                }}>
                  <span>📍 {t.place}</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#5C534B', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {t.desc}
                </p>

                {t.history && (
                  <div style={{
                    background: '#FAF6F0',
                    borderLeft: '3px solid #DD8A2E',
                    padding: '10px 14px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.84rem',
                    color: '#3D0D0D',
                    lineHeight: 1.5,
                    marginBottom: '14px'
                  }}>
                    <strong>इतिहास व महत्त्व:</strong> {t.history}
                  </div>
                )}

                {t.aartiTimes && (
                  <div style={{
                    background: '#FFFDF9',
                    border: '1px dashed #DD8A2E',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#8A1C1C',
                    fontWeight: 600,
                    marginBottom: '14px'
                  }}>
                    🪔 <strong>आरती वेळा:</strong> {t.aartiTimes}
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 700, marginBottom: '16px' }}>
                  ● {t.darshanStatus || 'सुलभ दर्शन उपलब्ध'}
                </div>
              </div>

              {/* Card Actions: Edit & Delete */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                borderTop: '1px solid #E6DDCE'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#C9701C',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    ✏️ संपादित करा
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #E6DDCE',
                      color: '#991B1B',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    🗑️
                  </button>
                </div>

                <Link
                  to="/events"
                  style={{
                    color: '#3D0D0D',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}>
                  उत्सव कॅलेंडर →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredTemples.length === 0 && (
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            border: '1px dashed #DD8A2E',
            color: '#666',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
            <h3 style={{ color: '#3D0D0D' }}>कोणतेही मंदिर आढळले नाही</h3>
            <p>कृपया शोध शब्द बदला किंवा नवीन मंदिर रेकॉर्ड जोडा.</p>
          </div>
        )}

        {/* Modal for Add / Edit Temple */}
        {modalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '2px solid #DD8A2E'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
                color: '#FFF',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', margin: 0 }}>
                  {editItem ? '✏️ मंदिर माहिती संपादित करा' : '➕ नवीन मंदिर / देवस्थान जोडा'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    मंदिराचे अधिकृत नाव *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="उदा. श्री तुळजाभवानी माता मंदिर"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      श्रेणी *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const labels = {
                          kuldaivat: 'कुलदैवत',
                          jyotirlinga: 'ज्योतिर्लिंग',
                          shaktipeeth: 'शक्तिपीठ',
                          shivkalin: 'शिवकालीन मंदिर'
                        };
                        setFormData({ ...formData, category: cat, categoryLabel: labels[cat] || 'देवस्थान' });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="kuldaivat">कुलदैवत (Kuldaivat)</option>
                      <option value="jyotirlinga">ज्योतिर्लिंग (Jyotirlinga)</option>
                      <option value="shaktipeeth">शक्तिपीठ (Shaktipeeth)</option>
                      <option value="shivkalin">शिवकालीन मंदिर (Shivkalin)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      चिन्ह (Emoji Icon)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    स्थान / शहर व जिल्हा *
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="उदा. तुळजापूर, धाराशिव"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    प्रतिमा / छायाचित्र मार्ग (Image URL / Path)
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="उदा. /assets/images/real-tuljabhavani-temple.jpg"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    आरती वेळा व दिनक्रम
                  </label>
                  <input
                    type="text"
                    value={formData.aartiTimes}
                    onChange={(e) => setFormData({ ...formData, aartiTimes: e.target.value })}
                    placeholder="उदा. काकड आरती: ५:३० AM · महापूजा: १२:०० PM · शेजारती: ९:०० PM"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    माहिती व वैशिष्ट्ये (Description) *
                  </label>
                  <textarea
                    rows="3"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="देवस्थानाचे स्वरूप, मावळ्यांचे नाते व वैशिष्ट्ये..."
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    ऐतिहासिक संदर्भ व जीर्णोद्धार
                  </label>
                  <textarea
                    rows="2"
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    placeholder="छत्रपती शिवराय, अहिल्याबाई होळकर किंवा पेशवेकालीन संदर्भ..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '10px 18px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 24px', background: '#DD8A2E', color: '#2A0606', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    {editItem ? 'बदल जतन करा ✓' : 'मंदिर जोडा ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
