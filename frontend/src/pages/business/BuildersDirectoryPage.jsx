import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export const initialBuildersData = [
  {
    id: 'BLD-PUNE-01',
    name: 'साई इन्फ्रा कन्स्ट्रक्शन्स',
    developer: 'सचिनराव कदम-पाटील',
    specialty: 'लक्झरी २ व ३ बीएचके स्काय होम्स व पेंटहाऊस',
    category: 'गृहनिर्माण',
    city: 'पुणे (कोथरूड व बाणेर)',
    projects: 'साई हाइट्स (कोथरूड), साई प्रेस्टीज (बाणेर-बालेवाडी)',
    experience: '१८+ वर्षे',
    rera: 'MAHARERA: P52100018942',
    icon: '🏢',
    phone: '+91 98220 11445',
    priceRange: '₹८५ लाख ते ₹२.२५ कोटी',
    units: '२४०+ लक्झरी फ्लॅट्स हस्तांतरित',
    image: '/assets/images/real-estate-pune-apartments.jpg',
    amenities: ['ऑलिम्पिक साइज पूल', 'क्लबहाऊस व जिम', 'मराठा वास्तू सौंदर्य', 'EV चार्जिंग स्टेशन'],
    badge: 'पुणे प्रीमियर बिल्डर',
    discount: 'मराठा महासंघ सदस्यांसाठी थेट ३% विशेष सवलत',
    desc: 'पुणे शहरातील विश्वासार्ह व दर्जेदार गृहप्रकल्प उभारणीतील अग्रगण्य मराठा ब्रँड. वेळेवर ताबा व १००% कायदेशीर पारदर्शकता.'
  },
  {
    id: 'BLD-KOL-02',
    name: 'शिवनेरी रॉयल व्हिला व लँडमार्क',
    developer: 'हणमंतराव भोसले (अध्यक्ष)',
    specialty: 'हेरिटेज रॉयल व्हिला व रो-हाउसेस',
    category: 'लक्झरी प्रोजेक्ट्स',
    city: 'कोल्हापूर (ताराबाई पार्क व रंकाळा)',
    projects: 'शिवनेरी व्हिला (ताराबाई पार्क), शिवनेरी प्राईम (रंकाळा रोड)',
    experience: '२२+ वर्षे',
    rera: 'MAHARERA: P52800022331',
    icon: '🏰',
    phone: '+91 94220 55667',
    priceRange: '₹७५ लाख ते ₹१.९० कोटी',
    units: '१२०+ स्वतंत्र व्हिला व बंगलो',
    image: '/assets/images/real-estate-kolhapur-villas.jpg',
    amenities: ['खाजगी गार्डन', 'सोलर रूफटॉप सिस्टीम', 'विशाल व्हरांडा', '२४x७ सुरक्षा व सीसीटीव्ही'],
    badge: 'रॉयल हेरिटेज क्लासिक',
    discount: 'मोफत इटालियन फ्लोअरिंग व मॉड्युलर किचन पॅकेज',
    desc: 'पारंपरिक भक्कम पाया आणि आधुनिक वास्तुकलेचा संगम साधणारे कोल्हापूरचे नामांकित लक्झरी व्हिला व टाउनशिप बिल्डर्स.'
  },
  {
    id: 'BLD-NSK-03',
    name: 'राजवीर कमर्शियल हब व कॉर्पोरेट बे',
    developer: 'राजेंद्र गायकवाड',
    specialty: 'कॉर्पोरेट ऑफिस स्पेसेस, आयटी पार्क व रिटेल मॉल्स',
    category: 'व्यावसायिक प्रकल्प',
    city: 'नाशिक (गंगापूर रोड व कॉलेज रोड)',
    projects: 'राजवीर बिझनेस बे (गंगापूर रोड), राजवीर कॅपिटल (कॉलेज रोड)',
    experience: '१४+ वर्षे',
    rera: 'MAHARERA: P51600034120',
    icon: '🏬',
    phone: '+91 98500 77889',
    priceRange: '₹४५ लाख ते ₹१.८५ कोटी',
    units: '८५+ कॉर्पोरेट ऑफिस युनिट्स',
    image: '/assets/images/real-estate-nashik-commercial.jpg',
    amenities: ['हाय-स्पीड लिफ्ट्स', 'डबल हाइट्स लॉबी', 'मल्टी-लेव्हल पार्किंग', 'सेंट्रल एसी प्रोव्हिजन'],
    badge: 'नाशिक बिझनेस हब',
    discount: 'स्टार्टअप व मराठा तरुणांसाठी पहिल्या वर्षात शून्य मेंटेनन्स',
    desc: 'नाशिकच्या मध्यवर्ती भागात आधुनिक कॉर्पोरेट ऑफिसेस, बँक स्पेसेस आणि सीए/डॉक्टर क्लिनिकसाठी प्राइम लोकेशन्स.'
  },
  {
    id: 'BLD-MUM-04',
    name: 'महादेव सी-व्ह्यू टॉवर्स व इन्फ्रा',
    developer: 'चंद्रकांत जाधव-देशमुख',
    specialty: 'सी-फेसिंग ४० मजली आयकॉनिक स्काय स्क्रॅपर्स',
    category: 'गृहनिर्माण',
    city: 'नवी मुंबई (खारघर व सीबीडी बेलापूर)',
    projects: 'महादेव ओशन क्रेस्ट (खारघर), महादेव स्काय बे (नेरूळ)',
    experience: '२६+ वर्षे',
    rera: 'MAHARERA: P51800045671',
    icon: '🌊',
    phone: '+91 98200 88990',
    priceRange: '₹१.४० कोटी ते ₹४.८० कोटी',
    units: '३५०+ प्रीमियम सी-फेसिंग फ्लॅट्स',
    image: '/assets/images/real-estate-navi-mumbai.jpg',
    amenities: ['रुफटॉप इन्फिनिटी पूल', 'स्काय लाउंज व जॅक्युझी', 'पॉडियम जॉगिंग ट्रॅक', 'स्मार्ट ऑटोमेशन होम्स'],
    badge: 'एमएमआर लक्झरी टॉवर्स',
    discount: 'स्टॅम्प ड्युटी व रजिस्ट्रेशन शुल्कात ५०% थेट सहकार्य',
    desc: 'मुंबई महानगर प्रदेशातील (MMR) अग्रगण्य हाय-राइज लक्झरी डेव्हलपर; जागतिक वास्तुविशारदांनी साकारलेले आलिशान टॉवर्स.'
  },
  {
    id: 'BLD-NGP-05',
    name: 'भूमी ग्रीन हेरिटेज मेगा टाउनशिप',
    developer: 'नितीन मोहिते-पाटील',
    specialty: '५० एकर हरित एकात्मिक टाउनशिप व NA प्लॉट्स',
    category: 'टाउनशिप',
    city: 'नागपूर (मिहान व वर्धा रोड लगत)',
    projects: 'भूमी ग्रीन सिटी (मिहान लगत), भूमी गोल्ड व्हॅली (वर्धा रोड)',
    experience: '१९+ वर्षे',
    rera: 'MAHARERA: P50500012984',
    icon: '🌆',
    phone: '+91 97650 44332',
    priceRange: '₹३२ लाख ते ₹१.१५ कोटी',
    units: '४००+ निवासी प्लॉट्स व स्वतंत्र व्हिला',
    image: '/assets/images/projects/proj_maratha_heights.jpg',
    amenities: ['१०० फूट मुख्य रस्ते', 'भूमिगत वीज व ड्रेनेज', 'क्लबहाऊस व शाळा', 'नैसर्गिक सरोवर व जॉगिंग ट्रॅक'],
    badge: 'विदर्भ नं. १ टाउनशिप',
    discount: 'शेतकरी कुटुंब व माजी सैनिकांसाठी बुकिंगवर ₹१ लाख सूट',
    desc: 'विदर्भातील सर्वात मोठी हरित एकात्मिक टाउनशिप; मिहान, एम्स व मेट्रो स्टेशनपासून अवघ्या ५ मिनिटांच्या अंतरावर.'
  },
  {
    id: 'BLD-CSMB-06',
    name: 'जगदंब इंडस्ट्रियल पार्क व वेअरहाउसिंग',
    developer: 'बाळासाहेब शिंदे',
    specialty: 'लॉजिस्टिक हब्स, PEB शेड्स व मॅन्युफॅक्चरिंग युनिट्स',
    category: 'इंडस्ट्रियल',
    city: 'छत्रपती संभाजीनगर (वाळूज व शेंद्रा DMIC)',
    projects: 'जगदंब इंडस्ट्रियल बे (वाळूज), जगदंब लॉजिस्टिक्स पार्क (शेंद्रा)',
    experience: '१६+ वर्षे',
    rera: 'MAHARERA: P51500078901',
    icon: '🏗️',
    phone: '+91 94230 66554',
    priceRange: '₹९५ लाख ते ₹५.५० कोटी',
    units: '४५+ औद्योगिक युनिट्स व शेड्स',
    image: '/assets/images/real-estate-aurangabad-plots.jpg',
    amenities: ['हेवी व्हेईकल ट्रॅफिक लेन्स', 'हाय-टेन्शन पॉवर लाईन', 'इंडस्ट्रियल सांडपाणी प्रक्रिया', 'कामगार निवास संकुल'],
    badge: 'DMIC इंडस्ट्रियल झोन',
    discount: 'मराठा लघुउद्योजकांसाठी मोफत एमआयडीसी एनओसी व कायदेशीर साहाय्य',
    desc: 'ऑटोमोबाइल, फार्मा आणि इंजिनिअरिंग उद्योगांसाठी आधुनिक प्री-इंजिनिअर्ड इंडस्ट्रियल शेड्स व सुरक्षित वेअरहाउस संकुल.'
  },
  {
    id: 'BLD-THN-07',
    name: 'वीर सॉलिटेअर लक्झरी स्कायलाइन्स',
    developer: 'अजितराव कदम',
    specialty: 'प्रीमियम हाय-राइज ३ व ४ बीएचके क्लब होम्स',
    category: 'लक्झरी प्रोजेक्ट्स',
    city: 'ठाणे (घोडबंदर रोड व माजिवडा)',
    projects: 'वीर सॉलिटेअर (घोडबंदर रोड), वीर प्राईड (माजिवडा जंक्शन)',
    experience: '१७+ वर्षे',
    rera: 'MAHARERA: P51700099432',
    icon: '💎',
    phone: '+91 98900 22113',
    priceRange: '₹१.७५ कोटी ते ₹३.६० कोटी',
    units: '२८०+ लक्झरी युनिट्स',
    image: '/assets/images/projects/proj_shivneri.jpg',
    amenities: ['येऊर हिल्स व्ह्यू', '४-स्तरीय क्लबहाऊस', 'इनडोअर बॅडमिंटन कोर्ट', 'रुफटॉप बारबेक्यू लाउंज'],
    badge: 'ठाणे प्रीमियम लक्झरी',
    discount: '१०:९० पेमेंट योजना व ०% ईएमआय सुरू होईपर्यंत मोफत मुक्काम',
    desc: 'येऊर टेकड्यांच्या सान्निध्यात प्रदूषणमुक्त वातावरणात निसर्ग आणि आधुनिक विलासी जगण्याचा अप्रतिम मिलाफ.'
  },
  {
    id: 'BLD-SAT-08',
    name: 'स्वराज दुर्ग व्हॅली इको रेसिडेन्सी',
    developer: 'महेशराव चव्हाण',
    specialty: 'निसर्गरम्य व्हॅली व्ह्यू परवडणारी दर्जेदार घरे',
    category: 'गृहनिर्माण',
    city: 'सातारा (अजिंक्यतारा पायथा व गोडोली)',
    projects: 'स्वराज हाइट्स (अजिंक्यतारा पायथा), स्वराज गौरव (गोडोली)',
    experience: '१२+ वर्षे',
    rera: 'MAHARERA: P52700033118',
    icon: '🚩',
    phone: '+91 98224 99001',
    priceRange: '₹२८ लाख ते ₹७२ लाख',
    units: '१६०+ आनंददायी घरे',
    image: '/assets/images/projects/proj_swarajya.jpg',
    amenities: ['अजिंक्यतारा व्ह्यू', 'मुलांसाठी क्रीडांगण', 'वृद्धांसाठी कट्टा व मंदिर', 'रेन वॉटर हार्वेस्टिंग'],
    badge: 'सातारा विश्वासाचे नाव',
    discount: 'मराठा व शेतकरी कुटुंबांसाठी अंतर्गत फर्निचर व्हाउचर मोफत',
    desc: 'छत्रपतींच्या सातारा भूमीत प्रत्येकाला स्वतःचे हक्काचे व दर्जेदार घर देणारा १००% कायदेशीर व रेरा नोंदणीकृत गृहप्रकल्प.'
  }
];

const categories = [
  'सर्व बिल्डर्स',
  'गृहनिर्माण',
  'लक्झरी प्रोजेक्ट्स',
  'व्यावसायिक प्रकल्प',
  'टाउनशिप',
  'इंडस्ट्रियल'
];

export default function BuildersDirectoryPage() {
  const [builders, setBuilders] = useState(initialBuildersData);
  const [selectedCat, setSelectedCat] = useState('सर्व बिल्डर्स');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getBuilders().then((liveData) => {
      if (liveData && liveData.length > 0) {
        // Dedup live data by project name or developer name
        const seen = new Set();
        const uniqueLive = [];
        liveData.forEach(item => {
          const key = (item.developer || item.projectName || item.name || '').trim().toLowerCase();
          if (key && !seen.has(key)) {
            seen.add(key);
            uniqueLive.push(item);
          }
        });

        if (uniqueLive.length >= 4) {
          const mapped = uniqueLive.map((b, idx) => ({
            id: b.id || `BLD-LIVE-${idx}`,
            name: b.developer || b.name || 'कन्स्ट्रक्शन्स',
            developer: b.developer || b.name || 'मराठा बिल्डर्स',
            specialty: b.configuration || b.specialty || 'गृहनिर्माण व लक्झरी प्रकल्प तज्ज्ञ',
            category: b.category || 'गृहनिर्माण',
            city: b.location || b.city || 'महाराष्ट्र',
            projects: b.projectName ? `${b.projectName} (${b.location || ''})` : (b.projects || 'चालू प्रकल्प'),
            experience: b.experience || '१५+ वर्षे',
            rera: b.rera || (b.reraApproved ? 'MAHARERA Approved' : 'नोंदणीकृत'),
            icon: b.icon || '🏢',
            phone: b.phone || '+91 98220 11445',
            priceRange: b.priceRange || '₹६५ लाख ते ₹२ कोटी',
            units: b.units || '१५०+ फ्लॅट्स',
            image: b.image || (initialBuildersData[idx % initialBuildersData.length]?.image) || '/assets/images/real-estate-pune-apartments.jpg',
            amenities: b.amenities || ['क्लबहाऊस', 'पार्किंग', 'सुरक्षा', 'सोलर वॉटर'],
            badge: b.badge || 'रेरा अधिकृत',
            discount: b.discountForMembers || b.discount || 'मराठा महासंघ सदस्यांसाठी विशेष सवलत',
            desc: b.desc || 'विश्वासार्ह व दर्जेदार गृहप्रकल्प उभारणीतील अग्रगण्य मराठा ब्रँड.'
          }));
          setBuilders(mapped);
        }
      }
    }).catch(() => {});
  }, []);

  const handleAddBuilder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const devName = form.elements['developer'].value;
    const cat = form.elements['category'].value;
    const city = form.elements['city'].value;
    const rera = form.elements['rera'].value;
    const phone = form.elements['phone'].value;
    const projects = form.elements['projects'].value;

    try {
      const res = await apiClient.addBuilder({
        projectName: projects || `${devName} हाइट्स`,
        developer: devName,
        location: city,
        category: cat,
        configuration: cat,
        phone: phone.replace(/\D/g, '').slice(-10) || '9822011223'
      });
      const created = res.data?.project || res.project || {
        id: `BLD-${Date.now().toString().slice(-4)}`,
        name: devName,
        developer: devName,
        specialty: cat,
        category: cat,
        city: city,
        projects: projects || `${devName} हाइट्स`,
        experience: 'नवीन नोंदणी',
        rera: rera || 'नोंदणीकृत',
        icon: '🏢',
        phone: phone,
        priceRange: 'दर चौकशीसाठी उपलब्ध',
        units: 'नवीन बुकिंग सुरू',
        image: '/assets/images/real-estate-pune-apartments.jpg',
        amenities: ['पार्किंग', 'सुरक्षा', 'पाणीपुरवठा'],
        badge: 'नवे प्रकल्प',
        discount: 'प्रारंभिक बुकिंगवर विशेष सवलत',
        desc: 'Connect Maratha नेटवर्कवर नव्याने नोंदणीकृत विकासक.'
      };
      setBuilders((prev) => [created, ...prev]);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'नोंदणी करताना त्रुटी आली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = builders.filter((b) => {
    const matchCat = selectedCat === 'सर्व बिल्डर्स' || b.category === selectedCat;
    const matchSearch =
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.developer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.projects || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="builders-directory-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '70px' }}>
      
      {/* HERO BANNER - LIGHT, TRANSLUCENT OVERLAY FOR CLEAR IMAGE VISIBILITY */}
      <section style={{
        position: 'relative',
        minHeight: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '2px solid #EADBCE'
      }}>
        {/* Background Image Container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/assets/images/generated/maratha_builders_hero.jpg")',
          backgroundPosition: 'center 40%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.02)'
        }} />

        {/* LIGHT, GENTLE GRADIENT OVERLAY (NOT DARK, IMAGE IS CLEARLY VISIBLE) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(74, 16, 5, 0.45) 0%, rgba(191, 54, 12, 0.35) 50%, rgba(30, 10, 5, 0.50) 100%)',
          backdropFilter: 'blur(1px)'
        }} />

        {/* Soft bottom vignette for readable contrast */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)'
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '920px',
          margin: '0 auto',
          padding: '45px 20px',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 213, 79, 0.6)',
            padding: '6px 18px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '14px',
            color: '#FFD54F',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}>
            <span>🚩 CONNECT मराठा</span>
            <span style={{ color: '#FFFFFF', opacity: 0.6 }}>|</span>
            <span>बांधकाम व रिअल इस्टेट महासंघ</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.9rem, 3.8vw, 2.85rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            fontFamily: 'Baloo 2, sans-serif',
            lineHeight: 1.25,
            color: '#FFFFFF',
            textShadow: '0 3px 12px rgba(0,0,0,0.85)'
          }}>
            मराठा बिल्डर्स – विश्वास, गुणवत्ता आणि भव्य निर्माण
          </h1>

          <p style={{
            fontSize: '1.08rem',
            margin: '0 auto 22px',
            maxWidth: '680px',
            lineHeight: 1.55,
            color: '#FFF8E1',
            textShadow: '0 2px 8px rgba(0,0,0,0.85)',
            fontWeight: 500
          }}>
            घर हे केवळ स्वप्न नाही, ती स्वाभिमानाची वास्तू आहे! महाराष्ट्रातील नामांकित, रेरा-मान्यताप्राप्त मराठा विकासक व दर्जेदार गृहप्रकल्प.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#4A1005',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.98rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s'
              }}
            >
              ＋ आपला प्रकल्प जोडा
            </button>
            <a
              href="#builders-list"
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.65)',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 800,
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
              }}
            >
              🏛️ सर्व बिल्डर्स यादी ({builders.length})
            </a>
          </div>
        </div>
      </section>

      {/* Search & Categories Bar */}
      <div id="builders-list" style={{ maxWidth: '1220px', margin: '30px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '22px 26px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid #EADBCE'
        }}>
          {/* Search Box */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.6 }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="बिल्डरचे नाव, प्रकल्प, शहर (उदा. पुणे, कोल्हापूर, नाशिक, ठाणे, खारघर) शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 44px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2D7CD',
                  fontSize: '0.98rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FAF7F2'
                }}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  background: selectedCat === cat ? '#BF360C' : '#F5EFE6',
                  color: selectedCat === cat ? '#FFFFFF' : '#5D4037',
                  border: selectedCat === cat ? '1px solid #BF360C' : '1px solid #E0D3C5',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat} {selectedCat === cat && `(${filtered.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BUILDERS CARDS GRID - RICH LAYOUT WITH AUTHENTIC REAL PROJECT PHOTOS */}
      <section style={{ maxWidth: '1220px', margin: '38px auto 0', padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#3E1F16', margin: '0 0 4px', fontFamily: 'Baloo 2' }}>
              📍 उपलब्ध बांधकाम प्रकल्प व विकासक
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#7D6A5D' }}>
              प्रत्येक प्रकल्पाची स्वतंत्र माहिती, खरी छायाचित्रे व थेट विकासक संपर्क.
            </p>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#BF360C', fontWeight: 800, background: '#FBE9E7', padding: '6px 14px', borderRadius: '20px' }}>
            एकूण: {filtered.length} प्रकल्प
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '26px'
        }}>
          {filtered.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E6D9CC',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(62, 31, 22, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Card Image Banner */}
              <div style={{ position: 'relative', height: '200px', background: '#2B1712', overflow: 'hidden' }}>
                <img
                  src={b.image}
                  alt={b.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => {
                    e.target.src = '/assets/images/real-estate-pune-apartments.jpg';
                  }}
                />

                {/* Subtle Image Gradient */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(30,10,5,0.85) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)'
                }} />

                {/* Location Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#BF360C',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  📍 {b.city}
                </div>

                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#FEF3C7',
                  color: '#92400E',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  border: '1px solid #FDE68A'
                }}>
                  {b.category}
                </div>

                {/* Project Title on Image */}
                <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                  <div style={{ color: '#FFD54F', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    🏆 {b.badge}
                  </div>
                  <h3 style={{
                    margin: '3px 0 0',
                    fontFamily: 'Baloo 2',
                    fontSize: '1.24rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1.25,
                    textShadow: '0 2px 6px rgba(0,0,0,0.9)'
                  }}>
                    {b.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                
                {/* Developer & Tagline */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.86rem', color: '#BF360C', fontWeight: 800, marginBottom: '2px' }}>
                    ✨ {b.specialty}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    विकासक: <strong>{b.developer}</strong> • अनुभव: {b.experience}
                  </div>
                </div>

                {/* Key Details Box */}
                <div style={{
                  background: '#FAF7F2',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  fontSize: '0.82rem',
                  border: '1px solid #EEDBCE',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>प्रकल्प:</span>
                    <strong style={{ color: '#1F2937', textAlign: 'right' }}>{b.projects}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>अंदाजे किंमत:</span>
                    <strong style={{ color: '#047857' }}>{b.priceRange}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>RERA मान्यता:</span>
                    <span style={{ color: '#15803D', fontWeight: 800, fontSize: '0.78rem' }}>{b.rera}</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                {b.amenities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {b.amenities.slice(0, 3).map((am, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#F3E8FF',
                          color: '#6B21A8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}
                      >
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                )}

                {/* Member Benefit Callout */}
                <div style={{
                  marginTop: 'auto',
                  background: '#FFFBEB',
                  border: '1px dashed #F59E0B',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: '#B45309',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}>
                  🎁 {b.discount}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedBuilder(b)}
                    style={{
                      flex: 1,
                      background: '#BF360C',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      boxShadow: '0 3px 8px rgba(191, 54, 12, 0.25)'
                    }}
                  >
                    तपशील पहा
                  </button>
                  <button
                    onClick={() => alert(`${b.name} (${b.developer}) यांच्याशी संपर्क साधण्यासाठी थेट कॉल क्रमांक: ${b.phone}`)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #BF360C',
                      background: '#FFFFFF',
                      color: '#BF360C',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.88rem'
                    }}
                  >
                    📞 कॉल
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Highlight Callout */}
      <section style={{ maxWidth: '1220px', margin: '42px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #A82E06 0%, #D84315 50%, #E65100 100%)',
          borderRadius: '20px',
          padding: '38px 28px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(168, 46, 6, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 10px', fontFamily: 'Baloo 2' }}>
            आपल्या बांधकाम प्रकल्पाची नोंदणी Connect Maratha वर करा
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 22px', opacity: 0.95, lineHeight: 1.5 }}>
            हजारो मराठा कुटुंबे व गुंतवणूकदारांपर्यंत आपला प्रकल्प पोहोचवा. विश्वासार्हता वाढवा आणि थेट ग्राहक मिळवा.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFD54F',
              color: '#3E1F16',
              border: 'none',
              padding: '13px 32px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
            }}
          >
            ＋ आपला प्रकल्प नोंदवा (मोफत)
          </button>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedBuilder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Modal Image Header */}
            <div style={{ position: 'relative', height: '180px', background: '#2D140D' }}>
              <img
                src={selectedBuilder.image}
                alt={selectedBuilder.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
              <button
                onClick={() => setSelectedBuilder(null)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '14px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
              <div style={{ position: 'absolute', bottom: '14px', left: '20px', right: '20px' }}>
                <span style={{ background: '#FFD54F', color: '#4A1005', padding: '2px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
                  {selectedBuilder.category}
                </span>
                <h2 style={{ color: '#FFFFFF', margin: '4px 0 0', fontSize: '1.4rem', fontFamily: 'Baloo 2' }}>
                  {selectedBuilder.name}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', fontSize: '0.92rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>विकासक प्रमुख:</strong> {selectedBuilder.developer} ({selectedBuilder.experience})</div>
              <div><strong>स्थान व शहर:</strong> {selectedBuilder.city}</div>
              <div><strong>प्रमुख प्रकल्प:</strong> {selectedBuilder.projects}</div>
              <div><strong>किंमत श्रेणी:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>{selectedBuilder.priceRange}</span></div>
              <div><strong>MahaRERA नोंदणी:</strong> <span style={{ color: '#15803D', fontWeight: 700 }}>{selectedBuilder.rera}</span></div>
              <div style={{ background: '#FAF7F2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #EEDBCE', fontSize: '0.86rem' }}>
                <strong>परिचय:</strong> {selectedBuilder.desc}
              </div>
              <div style={{ background: '#FFFBEB', padding: '10px 12px', borderRadius: '8px', border: '1px dashed #F59E0B', color: '#B45309', fontWeight: 700, fontSize: '0.86rem' }}>
                🎁 {selectedBuilder.discount}
              </div>
              <div><strong>थेट संपर्क:</strong> <a href={`tel:${selectedBuilder.phone}`} style={{ color: '#BF360C', fontWeight: 800 }}>{selectedBuilder.phone}</a></div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${selectedBuilder.phone}`}
                  style={{
                    flex: 1,
                    background: '#BF360C',
                    color: '#fff',
                    textAlign: 'center',
                    textDecoration: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}
                >
                  📞 थेट संपर्क साधा
                </a>
                <button
                  onClick={() => setSelectedBuilder(null)}
                  style={{
                    background: '#F3F4F6',
                    color: '#4B5563',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowAddModal(false); setSubmitted(false); }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#BF360C', margin: '0 0 4px', fontFamily: 'Baloo 2' }}>
              🏗️ मराठा बिल्डर्स / डेव्हलपर नोंदणी
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '0 0 16px' }}>
              आपले कन्स्ट्रक्शन फर्म व प्रकल्प Connect Maratha नेटवर्कवर लिस्ट करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3.2rem' }}>🎉</span>
                <h3 style={{ color: '#15803D', margin: '10px 0' }}>प्रकल्प माहिती यशस्वीरीत्या नोंदवली गेली!</h3>
                <p style={{ color: '#4B5563', fontSize: '0.9rem' }}>रेरा व फर्म पडताळणीनंतर प्रकल्प मुख्य पोर्टलवर प्रदर्शित होईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#BF360C', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '12px' }}
                >
                  पूर्ण झाले
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddBuilder}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input name="developer" required placeholder="फर्म / कंपनीचे नाव *" style={{ padding: '11px', borderRadius: '8px', border: '1.5px solid #D1D5DB' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select name="category" style={{ padding: '11px', borderRadius: '8px', border: '1.5px solid #D1D5DB', background: '#fff' }}>
                      {categories.filter(c => c !== 'सर्व बिल्डर्स').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input name="city" required placeholder="शहर (उदा. पुणे) *" style={{ padding: '11px', borderRadius: '8px', border: '1.5px solid #D1D5DB' }} />
                  </div>
                  <input name="rera" placeholder="MahaRERA नोंदणी क्रमांक" style={{ padding: '11px', borderRadius: '8px', border: '1.5px solid #D1D5DB' }} />
                  <input name="phone" required type="tel" placeholder="अधिकृत संपर्क मोबाइल नंबर *" style={{ padding: '11px', borderRadius: '8px', border: '1.5px solid #D1D5DB' }} />
                  <input name="projects" placeholder="चालू / पूर्ण प्रकल्पांची नावे" style={{ padding: '11px', borderRadius: '8px', border: '1.5px solid #D1D5DB' }} />
                  <button type="submit" disabled={isSubmitting} style={{ background: '#BF360C', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'नोंदणी करत आहे...' : 'फर्म सबमिट करा'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
