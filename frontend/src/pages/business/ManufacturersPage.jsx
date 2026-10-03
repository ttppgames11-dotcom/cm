import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const mfgData = [
  // --- १. मशीनरी (Machinery) ---
  {
    id: 'MFG-MAC-01',
    name: 'श्रीशक्ती प्रिसिजन इंजिनिअरिंग प्रा. लि.',
    sector: 'मशीनरी मॅन्युफॅक्चरिंग',
    category: 'मशीनरी',
    city: 'भोसरी MIDC, पुणे',
    products: 'CNC लेथ मशीन, इंडस्ट्रियल गिअर्स, हायड्रॉलिक प्रेसेस',
    export: '२०+ देशांत थेट निर्यात (जर्मनी, यूएई, अमेरिका)',
    employees: '३५०+ कामगार',
    icon: '⚙️',
    image: '/assets/images/mfg-cnc-machining.jpg',
    cert: 'ISO 9001:2015',
    capacity: '५०० युनिट्स/वर्ष'
  },
  {
    id: 'MFG-MAC-02',
    name: 'महालक्ष्मी ॲग्रो इक्विपमेंट्स & ट्रॅक्टर्स',
    sector: 'कृषी यंत्रसामग्री उत्पादन',
    category: 'मशीनरी',
    city: 'दिंडोरी रोड, नाशिक',
    products: 'रोटाव्हेटर, ट्रॅक्टर ट्रॉली, डिस्क हॅरो, सीड ड्रिल मशिन',
    export: 'संपूर्ण महाराष्ट्र, कर्नाटक, मध्य प्रदेश व गुजरात',
    employees: '१९०+ कामगार',
    icon: '🚜',
    image: '/assets/images/mfg-agro-machinery.jpg',
    cert: 'Agri Govt Approved',
    capacity: '१,५०० कृषी अवजारे/महिना'
  },
  {
    id: 'MFG-MAC-03',
    name: 'स्वाभिमान हेवी इंजिनिअरिंग & फॅब्रिकेशन',
    sector: 'अवजड यांत्रिकी & क्रेन उत्पादन',
    category: 'मशीनरी',
    city: 'वाळूज MIDC, छत्रपती संभाजीनगर',
    products: '३० टन ओव्हरहेड क्रेन, इंडस्ट्रियल बॉयलर्स, हेवी स्ट्रक्चर्स',
    export: 'भारतीय रेल्वे, L&T व जेएसपीएल पुरवठादार',
    employees: '४२०+ कामगार',
    icon: '🏗️',
    image: '/assets/images/mfg-heavy-engineering.jpg',
    cert: 'IBR & ISO Certified',
    capacity: '५,००० टन स्टील फॅब्रिकेशन'
  },

  // --- २. ऑटोमोबाईल (Automobiles) ---
  {
    id: 'MFG-AUTO-01',
    name: 'सह्याद्री ऑटोमोटिव्ह & रोबोटिक्स प्रा. लि.',
    sector: 'ऑटो पार्ट्स & चेसिस सिस्टिम्स',
    category: 'ऑटोमोबाईल',
    city: 'चाकण MIDC, पुणे',
    products: 'ऑटोमेटेड वेल्डिंग पार्ट्स, इंजिन वॉल्व्ह, सस्पेन्शन सिस्टिम्स',
    export: 'टाटा मोटर्स, महिंद्रा व बजाज यांचे टियर-१ OEM पुरवठादार',
    employees: '५००+ कामगार',
    icon: '🚗',
    image: '/assets/images/mfg-pune-auto-ancillary.jpg',
    cert: 'IATF 16949',
    capacity: '२५ लाख स्पेअर पार्ट्स/वर्ष'
  },
  {
    id: 'MFG-AUTO-02',
    name: 'श्री विनायक हेवी कास्टिंग्स & फाउंड्री',
    sector: 'कास्ट आयर्न & ऑटो फाउंड्री',
    category: 'ऑटोमोबाईल',
    city: 'शिरोली इंडस्ट्रियल एरिया, कोल्हापूर',
    products: 'ऑटो ट्रान्समिशन हाउसिंग, ब्रेक ड्रम्स, पंप बॉडीज, हेवी कास्टिंग',
    export: 'किर्लोस्कर, कमिन्स व युरोपियन मशीन बिल्डर्स',
    employees: '३८०+ फाउंड्री कामगार',
    icon: '🔥',
    image: '/assets/images/mfg-kolhapur-foundry.jpg',
    cert: 'Foundry Standard Grade',
    capacity: '१,८०० टन मोल्टन कास्टिंग/महिना'
  },
  {
    id: 'MFG-AUTO-03',
    name: 'गरुड ऑटो टेक & गिअर मॅन्युफॅक्चरर्स',
    sector: 'ऑटोमोबाईल गिअरबॉक्सेस',
    category: 'ऑटोमोबाईल',
    city: 'रांजणगाव MIDC, पुणे',
    products: 'प्रिसिजन ऑटोमोबाईल ट्रान्समिशन गिअर्स, क्लच प्लेट्स, एक्सल',
    export: 'महिंद्रा, मारुती सुझुकी व आंतरराष्ट्रीय एक्सपोर्ट',
    employees: '३१०+ तंत्रज्ञ',
    icon: '🚘',
    image: '/assets/images/mfg-auto-robotics.jpg',
    cert: 'ISO/TS 16949',
    capacity: '१२ लाख गिअर सेट्स/वर्ष'
  },

  // --- ३. इलेक्ट्रिकल (Electrical) ---
  {
    id: 'MFG-ELEC-01',
    name: 'विजय पॉवर ट्रान्सफॉर्मर्स & ग्रिड्स प्रा. लि.',
    sector: 'इलेक्ट्रिकल उपकरणे & ट्रान्सफॉर्मर्स',
    category: 'इलेक्ट्रिकल',
    city: 'अंबड MIDC, नाशिक',
    products: 'हाय व्होल्टेज पॉवर ट्रान्सफॉर्मर, सबस्टेशन पॅनेल्स, इन्व्हर्टर',
    export: 'महावितरण, टाटा पॉवर व आफ्रिकन ऊर्जा प्रकल्प',
    employees: '२८०+ तंत्रज्ञ व कामगार',
    icon: '⚡',
    image: '/assets/images/mfg-electrical-transformers.jpg',
    cert: 'CPRI Tested',
    capacity: '१,२०० MVA क्षमता'
  },
  {
    id: 'MFG-ELEC-02',
    name: 'शिवशक्ती केबल्स & इलेक्ट्रिकल स्वीचगिअर्स',
    sector: 'इंडस्ट्रियल केबल्स & पॅनेल्स',
    category: 'इलेक्ट्रिकल',
    city: 'पिंपरी-चिंचवड MIDC, पुणे',
    products: 'LT/HT आर्मर्ड पॉवर केबल्स, कंट्रोल पॅनेल्स, MCB स्विचगिअर्स',
    export: 'स्मार्ट सिटी प्रकल्प व इंडस्ट्रियल प्लांट्स',
    employees: '१९०+ कामगार',
    icon: '🔌',
    image: '/assets/images/mfg-electrical-cables.jpg',
    cert: 'ISI & CPRI Approved',
    capacity: '५,००० किमी केबल/वर्ष'
  },

  // --- ४. प्लास्टिक (Plastic) ---
  {
    id: 'MFG-PLAS-01',
    name: 'शिवनेरी पॉलिमर्स & पाईप्स प्रा. लि.',
    sector: 'प्लास्टिक & इरिगेशन पॅकेजिंग',
    category: 'प्लास्टिक',
    city: 'कुपवाड MIDC, सांगली',
    products: 'ISI मार्क ठिबक सिंचन पाईप्स, HDPE ड्रम्स, मोल्डेड क्रेट्स',
    export: 'महाराष्ट्र, गोवा, कर्नाटक व केनिया-आफ्रिका',
    employees: '२२०+ कामगार',
    icon: '📦',
    image: '/assets/images/mfg-plastic-pipes.jpg',
    cert: 'ISI & ISO 14001',
    capacity: '१,००० टन पॉलिमर उत्पादन'
  },
  {
    id: 'MFG-PLAS-02',
    name: 'सह्याद्री मोल्ड्स & इंडस्ट्रियल प्लास्टिक पॅकेजिंग',
    sector: 'प्लास्टिक इंजेक्शन मोल्डिंग',
    category: 'प्लास्टिक',
    city: 'चाकण टप्पा-२, पुणे',
    products: 'इंडस्ट्रियल प्लॅस्टिक घटक, फूड ग्रेड पॅकेजिंग बॉटल्स व कॅरी ट्रे',
    export: 'एफएमसीजी कंपन्या व फार्मा पॅकेजिंग सप्लायर',
    employees: '१६०+ कामगार',
    icon: '🧪',
    image: '/assets/images/mfg-plastic-molding.jpg',
    cert: 'FDA Food Grade & ISO 9001',
    capacity: '३,५०० टन मोल्डिंग क्षमता'
  },

  // --- ५. केमिकल (Chemical) ---
  {
    id: 'MFG-CHEM-01',
    name: 'तारापूर केमिकल्स & फार्मा इंटरमीडिएट्स',
    sector: 'औद्योगिक केमिकल्स & फार्मास्युटिकल्स',
    category: 'केमिकल',
    city: 'तारापूर MIDC, पालघर / ठाणे',
    products: 'स्पेशालिटी केमिकल्स, API सॉल्व्हेंट्स, इंडस्ट्रियल ॲसिड्स',
    export: 'सन फार्मा, सिप्ला व युरोपीय फार्मा कंपन्या',
    employees: '२३०+ केमिस्ट व कामगार',
    icon: '🧪',
    image: '/assets/images/mfg-chemical-pharma.jpg',
    cert: 'GMP & REACH Compliant',
    capacity: '२,५०० किलो लिटर/महिना'
  },
  {
    id: 'MFG-CHEM-02',
    name: 'रोहा ऑरगॅनिक केमिकल्स & पिगमेंट मॅन्युफॅक्चरर्स',
    sector: 'ऑरगॅनिक केमिकल्स & डायज',
    category: 'केमिकल',
    city: 'रोहा MIDC, रायगड',
    products: 'इंडस्ट्रियल पिगमेंट्स, रेझिन्स, वॉटर ट्रीटमेंट केमिकल्स',
    export: 'टेक्सटाईल, पेंट्स व कोटिंग इंडस्ट्रीज',
    employees: '१७५+ कामगार',
    icon: '🔬',
    image: '/assets/images/mfg-chemical-plant.jpg',
    cert: 'ISO 14001:2015',
    capacity: '१,२०० टन केमिकल्स/महिना'
  },

  // --- ६. फूड & बेव्हरेज (Food & Beverages) ---
  {
    id: 'MFG-FOOD-01',
    name: 'नेचर प्युअर ॲग्रो फूड्स & डेअरी प्रॉडक्ट्स',
    sector: 'फूड प्रोसेसिंग & डेअरी प्लांट्स',
    category: 'फूड & बेव्हरेज',
    city: 'शिरोली MIDC, कोल्हापूर',
    products: 'शुद्ध तूप प्रोसेसिंग, काजू प्रक्रिया, फ्रूट पल्प व मसाले',
    export: 'यूरोप, कॅनडा व आखाती देशांत पॅकेज्ड एक्सपोर्ट',
    employees: '२५०+ शेतकरी व कामगार',
    icon: '🌾',
    image: '/assets/images/mfg-dairy-foods.jpg',
    cert: 'FSSAI & US FDA',
    capacity: '५० टन दैनिक प्रक्रिया'
  },
  {
    id: 'MFG-FOOD-02',
    name: 'सह्याद्री ॲग्रो फूड्स & फ्रूट प्रोसेसिंग प्लांट',
    sector: 'अन्नावर प्रक्रिया & फ्रोजन फूड्स',
    category: 'फूड & बेव्हरेज',
    city: 'मोहोळ MIDC, सोलापूर / नाशिक',
    products: 'टोमॅटो प्युरी, फ्रोजन भाज्या, डाळिंब दाणे व ज्यूस कॉन्सन्ट्रेट',
    export: 'दुबई, युनायटेड किंगडम व देशांतर्गत रीटेल ब्रँड्स',
    employees: '२१०+ कामगार',
    icon: '🍇',
    image: '/assets/images/mfg-food-processing.jpg',
    cert: 'FSSAI Central License & HACCP',
    capacity: '८० टन दैनिक प्रोसेसिंग'
  },

  // --- ७. टेक्सटाईल (Textiles) ---
  {
    id: 'MFG-TEX-01',
    name: 'मराठा टेक्सटाईल्स & यार्न मिल्स प्रा. लि.',
    sector: 'कापड उद्योग & कॉटन स्पिनिंग',
    category: 'टेक्सटाईल',
    city: 'इचलकरंजी (मँचेस्टर ऑफ महाराष्ट्र)',
    products: 'प्रीमियम कॉटन फॅब्रिक, पॉवरलूम सूत, डेनिम व होजिअरी',
    export: 'रेमंड, अरविंद मिल्स व बांगलादेश, व्हिएतनाम एक्सपोर्ट',
    employees: '४५०+ कुशल विणकर व तंत्रज्ञ',
    icon: '🧵',
    image: '/assets/images/mfg-textile-weaving.jpg',
    cert: 'OEKO-TEX Certified',
    capacity: '१.५ लाख मीटर कापड दैनिक'
  },
  {
    id: 'MFG-TEX-02',
    name: 'सोलापूर चादर & टेरी टॉवेल मॅन्युफॅक्चरर्स',
    sector: 'जॅकॉर्ड चादरी व होम टेक्सटाईल',
    category: 'टेक्सटाईल',
    city: 'अक्कलकोट रोड MIDC, सोलापूर',
    products: 'GI टॅग्ड सोलापूरी चादरी, टेरी कॉटन टॉवेल्स, बेडशीट्स',
    export: 'अमेरिका, गल्फ देश व संपूर्ण भारतीय बाजारपेठ',
    employees: '२८०+ कामगार',
    icon: '🧶',
    image: '/assets/images/mfg-textile-fabric.jpg',
    cert: 'GI Tag & ISO 9001',
    capacity: '२५,००० चादरी/महिना'
  },

  // --- ८. इतर (Others - Solar, Packaging, Steel) ---
  {
    id: 'MFG-OTH-01',
    name: 'स्वराज्य सोलर पॉवर & ग्रीन एनर्जी सिस्टिम्स',
    sector: 'सौर ऊर्जा उपकरणे & बॅटऱ्या',
    category: 'इतर',
    city: 'कुर्डुवाडी MIDC, सोलापूर',
    products: 'सोलर रूफटॉप पॅनेल्स, इनव्हर्टर, लिथियम बॅटरी पॅक्स व सोलर पंप',
    export: 'कुसुम योजना व औद्योगिक रूफटॉप प्लांट्स',
    employees: '१६०+ कामगार',
    icon: '☀️',
    image: '/assets/images/mfg-solar-panels.jpg',
    cert: 'MNRE & BIS Approved',
    capacity: '५० MW पॅनेल उत्पादन/वर्ष'
  },
  {
    id: 'MFG-OTH-02',
    name: 'शिवमुद्रा पेपर & कोरुगेटेड बॉक्सेस इंडस्ट्रीज',
    sector: 'औद्योगिक पॅकेजिंग & पेपर प्रॉडक्ट्स',
    category: 'इतर',
    city: 'तासगाव MIDC, सांगली',
    products: 'हेवी ड्युटी कोरुगेटेड बॉक्सेस, फ्रूट एक्सपोर्ट पॅकेजिंग, कार्टन्स',
    export: 'द्राक्ष व डाळिंब निर्यातदार शेतकरी आणि कंपन्या',
    employees: '१४०+ कामगार',
    icon: '📦',
    image: '/assets/images/mfg-cardboard-packaging.jpg',
    cert: 'Eco-Friendly Recycled Mark',
    capacity: '२,००० टन बॉक्सेस/महिना'
  },
  {
    id: 'MFG-OTH-03',
    name: 'स्वराज्य स्टील अँड अलॉय्स',
    sector: 'धातू व अवजड स्टील फॅब्रिकेशन',
    category: 'इतर',
    city: 'कुर्डुवाडी MIDC, सोलापूर',
    products: 'स्ट्रक्चरल गर्डर्स, सोलर माउंटिंग स्ट्रक्चर्स, इंडस्ट्रियल शेड्स',
    export: 'महाराष्ट्र व भारतभर वितरण',
    employees: '९०+ कामगार',
    icon: '🏗️',
    image: '/assets/images/mfg-steel-alloys.jpg',
    cert: 'ISO 9001:2015',
    capacity: '३,५०० टन स्टील फॅब्रिकेशन'
  }
];

const categories = [
  'सर्व श्रेणी',
  'मशीनरी',
  'ऑटोमोबाईल',
  'इलेक्ट्रिकल',
  'प्लास्टिक',
  'केमिकल',
  'फूड & बेव्हरेज',
  'टेक्सटाईल',
  'इतर'
];

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState(mfgData);
  const [selectedCat, setSelectedCat] = useState('सर्व श्रेणी');
  const [searchQuery, setSearchQuery] = useState('');
  const [b2bModal, setB2bModal] = useState(false);
  const [selectedMfg, setSelectedMfg] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getManufacturers().then((liveData) => {
      if (liveData && liveData.length > 0) {
        // Collect existing default names to avoid duplication
        const defaultNames = new Set(mfgData.map(m => m.name.trim().toLowerCase()));

        // Filter and map only genuinely new/distinct companies from backend
        const newLive = [];
        liveData.forEach((m, idx) => {
          const compName = (m.companyName || m.name || '').trim();
          if (compName && !defaultNames.has(compName.toLowerCase())) {
            let cat = m.category || '';
            if (!cat || cat.includes('मशीन') || cat.includes('मशिन')) cat = 'मशीनरी';
            else if (cat.includes('ऑटो')) cat = 'ऑटोमोबाईल';
            else if (cat.includes('इलेक्ट्रिक')) cat = 'इलेक्ट्रिकल';
            else if (cat.includes('प्लास्टिक')) cat = 'प्लास्टिक';
            else if (cat.includes('केमिकल')) cat = 'केमिकल';
            else if (cat.includes('फूड') || cat.includes('अन्न') || cat.includes('डेअरी')) cat = 'फूड & बेव्हरेज';
            else if (cat.includes('टेक्सटाईल') || cat.includes('कापड')) cat = 'टेक्सटाईल';
            else cat = 'इतर';

            // Pick a matching specific category image
            let fallbackImg = '/assets/images/mfg-cnc-machining.jpg';
            if (cat === 'ऑटोमोबाईल') fallbackImg = '/assets/images/mfg-auto-robotics.jpg';
            else if (cat === 'इलेक्ट्रिकल') fallbackImg = '/assets/images/mfg-electrical-cables.jpg';
            else if (cat === 'प्लास्टिक') fallbackImg = '/assets/images/mfg-plastic-pipes.jpg';
            else if (cat === 'केमिकल') fallbackImg = '/assets/images/mfg-chemical-plant.jpg';
            else if (cat === 'फूड & बेव्हरेज') fallbackImg = '/assets/images/mfg-food-processing.jpg';
            else if (cat === 'टेक्सटाईल') fallbackImg = '/assets/images/mfg-textile-weaving.jpg';
            else if (cat === 'इतर') fallbackImg = '/assets/images/mfg-steel-alloys.jpg';

            newLive.push({
              id: m.id || `LIVE-MFG-${idx}`,
              name: compName,
              sector: m.industry || m.sector || 'उत्पादक उद्योग',
              category: cat,
              city: m.district ? `${m.district}, महाराष्ट्र` : (m.location || m.city || 'पुणे, महाराष्ट्र'),
              products: m.products || 'औद्योगिक उत्पादने व स्पेअर पार्ट्स',
              export: m.turnover ? `वार्षिक उलाढाल: ${m.turnover}` : (m.export || 'महाराष्ट्र व भारतभर वितरण'),
              employees: m.employees ? (typeof m.employees === 'number' ? `${m.employees}+ कामगार` : m.employees) : '५०+ कामगार',
              icon: m.icon || '🏭',
              image: m.image || fallbackImg,
              cert: m.cert || 'ISO 9001:2015',
              capacity: m.capacity || 'औद्योगिक उत्पादन क्षमता',
              contact: m.contact || m.phone || ''
            });
          }
        });

        // Combine deduplicated live items with rich mfgData
        setManufacturers([...newLive, ...mfgData]);
      }
    }).catch(() => {
      // In case of API failure, mfgData remains in state
    });
  }, []);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = manufacturers.filter((m) => {
    const itemCat = (m.category || '').replace('मशिनरी', 'मशीनरी').trim();
    const selCat = selectedCat.replace('मशिनरी', 'मशीनरी').trim();
    const matchCat = selCat === 'सर्व श्रेणी' || itemCat === selCat || (selCat === 'मशीनरी' && itemCat.includes('मशीन'));
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (m.name || '').toLowerCase().includes(q) ||
      (m.sector || '').toLowerCase().includes(q) ||
      (m.products || '').toLowerCase().includes(q) ||
      (m.city || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="manufacturers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner with Normal Translucent Overlay for clear image visibility */}
      <section style={{
        position: 'relative',
        minHeight: '410px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '2px solid #CFD8DC'
      }}>
        {/* Background Image Container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/assets/images/generated/maratha_manufacturers_hero.jpg")',
          backgroundPosition: 'center 40%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.02)'
        }} />

        {/* NORMAL, GENTLE TRANSLUCENT OVERLAY (IMAGE IS CLEARLY VISIBLE) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(38, 50, 56, 0.45) 0%, rgba(55, 71, 79, 0.35) 50%, rgba(20, 30, 35, 0.50) 100%)',
          backdropFilter: 'blur(1px)'
        }} />

        {/* Soft bottom vignette for readable contrast */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)'
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '980px',
          margin: '0 auto',
          padding: '50px 20px',
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
            <span>मेड इन मराठा — फॉर द वर्ल्ड</span>
          </div>

          <p style={{
            fontSize: '1.25rem',
            color: '#FFE082',
            fontWeight: 700,
            margin: '0 0 8px',
            textShadow: '0 2px 8px rgba(0,0,0,0.85)'
          }}>
            मराठा उद्योग, मराठा अभिमान !
          </p>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            fontFamily: 'Baloo 2, sans-serif',
            lineHeight: 1.25,
            color: '#FFFFFF',
            textShadow: '0 3px 12px rgba(0,0,0,0.9)'
          }}>
            मराठा मॅन्युफॅक्चरर्स & इंडस्ट्री हब
          </h1>

          <p style={{
            fontSize: '1.1rem',
            margin: '0 auto 24px',
            maxWidth: '720px',
            lineHeight: 1.55,
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0,0,0,0.85)',
            fontWeight: 500
          }}>
            गुणवत्तापूर्ण उत्पादन, जागतिक ओळख — मराठा मॅन्युफॅक्चरिंगचा एक नवा विश्वास || जय भवानी ! जय शिवाजी !
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedMfg(null); setB2bModal(true); }}
              style={{
                background: '#FFD54F',
                color: '#263238',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
              }}
            >
              ＋ कंपनी नोंदणी / B2B लीड्स
            </button>
          </div>
        </div>
      </section>

      {/* Stats - Placed cleanly below hero (no overlapping) */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px 24px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
          border: '1px solid #EADBCE',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>२,५००+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>नोंदणीकृत कंपन्या</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>५००+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>शहरांमध्ये विस्तार</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>१ लाख+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>रोजगार निर्मिती</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>१००+</div>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>देशांमध्ये निर्यात</span>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #EADBCE', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="कंपनी नाव, उत्पादन, श्रेणी, शहर शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1.5px solid #D7CCC8',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '14px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '2px solid #37474F' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#37474F' : '#FFFFFF',
                  color: selectedCat === cat ? '#FFFFFF' : '#424242',
                  fontSize: '0.88rem',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category count & results header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#263238', margin: 0, fontFamily: 'Baloo 2, sans-serif' }}>
            {selectedCat === 'सर्व श्रेणी' ? 'सर्व नोंदणीकृत मॅन्युफॅक्चरर्स' : `${selectedCat} उत्पादक उद्योग`}
          </h2>
          <span style={{ fontSize: '0.88rem', background: '#ECEFF1', color: '#37474F', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>
            {filtered.length} कंपन्या उपलब्ध
          </span>
        </div>

        {/* Manufacturing Cards */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '24px' }}>
            {filtered.map((m) => (
              <div
                key={m.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #D7CCC8',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Manufacturer Plant Image */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '190px',
                  background: '#ECEFF1',
                  overflow: 'hidden'
                }}>
                  <img
                    src={m.image || '/assets/images/mfg-heavy-engineering.jpg'}
                    alt={m.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Sector Tag */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(38, 50, 56, 0.90)',
                    color: '#FFFFFF',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {m.sector}
                  </span>

                  {/* Category Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#FFD54F',
                    color: '#263238',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {m.category}
                  </span>
                </div>

                {/* Title & City */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#263238', margin: '0 0 3px', lineHeight: 1.35 }}>
                        {m.name}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#546E7A', fontWeight: 500 }}>
                        📍 {m.city}
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div style={{ fontSize: '0.88rem', color: '#37474F', background: '#F5F5F5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #EEEEEE' }}>
                    <strong style={{ color: '#263238', display: 'block', marginBottom: '2px', fontSize: '0.82rem' }}>⚙️ मुख्य उत्पादने:</strong>
                    {m.products}
                  </div>

                  {/* Export & Capacity */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginTop: '2px' }}>
                    <div style={{ background: '#ECEFF1', padding: '8px 10px', borderRadius: '6px' }}>
                      <span style={{ color: '#546E7A', display: 'block' }}>क्षमता / प्रमाण</span>
                      <strong style={{ color: '#263238' }}>{m.capacity || 'औद्योगिक क्षमता'}</strong>
                    </div>
                    <div style={{ background: '#E8F5E9', padding: '8px 10px', borderRadius: '6px' }}>
                      <span style={{ color: '#2E7D32', display: 'block' }}>प्रमाणपत्र</span>
                      <strong style={{ color: '#1B5E20' }}>{m.cert || 'ISO Certified'}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#455A64', marginTop: '4px' }}>
                    <strong>🌍 विस्तार:</strong> {m.export}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#455A64' }}>
                    <strong>👥 मनुष्यबळ:</strong> <span style={{ color: '#2E7D32', fontWeight: 700 }}>{m.employees}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ padding: '12px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                  <button
                    onClick={() => { setSelectedMfg(m); setB2bModal(true); }}
                    style={{
                      width: '100%',
                      background: '#263238',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      boxShadow: '0 3px 8px rgba(38,50,56,0.25)',
                      transition: 'background 0.2s'
                    }}
                  >
                    🤝 B2B चौकशी / कोटेशन मागवा
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px dashed #B0BEC5',
            marginTop: '20px'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🏭</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#37474F', margin: '0 0 8px' }}>
              या श्रेणीमध्ये सध्या कोणतेही मॅन्युफॅक्चरर्स आढळले नाहीत
            </h3>
            <p style={{ color: '#78909C', fontSize: '0.92rem', margin: '0 0 20px' }}>
              आपला स्वतःचा कारखाना किंवा उत्पादन उद्योग असेल तर लगेच नोंदणी करा.
            </p>
            <button
              onClick={() => { setSelectedMfg(null); setB2bModal(true); }}
              style={{
                background: '#FFD54F',
                color: '#263238',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ＋ नवीन मॅन्युफॅक्चरर जोडा
            </button>
          </div>
        )}
      </div>

      {/* Modal: B2B Enquiry / Add Company */}
      {b2bModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setB2bModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#37474F', margin: '0 0 6px' }}>
              {selectedMfg ? `${selectedMfg.name} — B2B ट्रेड चौकशी` : 'कंपनी नोंदणी करा'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              Connect Maratha B2B ट्रेड नेटवर्कशी थेट संपर्क.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🤝</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>चौकशी यशस्वीरित्या पाठवली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>कंपनीचे विक्री प्रतिनिधी २४ तासांत संपर्क करतील.</p>
                <button
                  onClick={() => { setB2bModal(false); setSubmitted(false); }}
                  style={{ background: '#37474F', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquiry}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="आपले / कंपनीचे नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input required type="tel" placeholder="मोबाईल नंबर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input required placeholder="शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <textarea required placeholder="आपली गरज / उत्पादनांची विचारणा (Quantity & Specifications) *" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#37474F', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'पाठवत आहे...' : 'चौकशी पाठवा'}
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
