import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const orgsData = [
  // 1. सामाजिक (Social)
  {
    id: 1,
    name: 'अखिल भारतीय मराठा महासंघ',
    category: 'सामाजिक',
    established: '१९८१',
    hq: 'मुंबई / पुणे, महाराष्ट्र',
    presence: 'अखिल भारत व ३६ जिल्हे',
    members: '३५ लाख+ सदस्य',
    focus: 'मराठा आरक्षण, आर्थिक व शैक्षणिक हक्क, समाज प्रबोधन व न्याय हक्क लढा',
    icon: '🚩',
    contact: '+91 22 2430 1674'
  },
  {
    id: 2,
    name: 'मराठा क्रांती मोर्चा समन्वय समिती',
    category: 'सामाजिक',
    established: '२०१६',
    hq: 'पुणे, महाराष्ट्र',
    presence: 'संपूर्ण महाराष्ट्र व परराज्य',
    members: '५८ मूक मोर्चे समन्वयक',
    focus: 'मराठा आरक्षण न्यायालयीन पाठपुरावा, सारथी संस्था स्वायत्तता, वसतिगृहे व विद्यार्थी हक्क',
    icon: '✊',
    contact: '+91 98220 55443'
  },
  {
    id: 3,
    name: 'मराठा सेवा संघ',
    category: 'सामाजिक',
    established: '१९९०',
    hq: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    presence: 'संपूर्ण भारत व ३६ जिल्हे',
    members: '१५ लाख+ सदस्य',
    focus: 'शिव-शाहू-फुले-आंबेडकर विचारप्रसार, जिजाऊ ब्रिगेड, संभाजी ब्रिगेड कक्ष',
    icon: '⚔️',
    contact: '+91 240 233 4455'
  },
  {
    id: 4,
    name: 'छत्रपती संभाजी महाराज प्रतिष्ठान',
    category: 'सामाजिक',
    established: '२००४',
    hq: 'पुणे, महाराष्ट्र',
    presence: 'पुणे, सातारा, कोल्हापूर',
    members: '२ लाख+ कार्यकर्ते',
    focus: 'गडकिल्ले संवर्धन, बलिदान मास प्रबोधन, ग्रंथालय व स्पर्धा परीक्षा अभ्यासिका',
    icon: '🏰',
    contact: '+91 94220 66778'
  },

  // 2. शैक्षणिक (Educational)
  {
    id: 5,
    name: 'मराठा शिक्षण संस्था महासंघ',
    category: 'शैक्षणिक',
    established: '१९९५',
    hq: 'कोल्हापूर, महाराष्ट्र',
    presence: '२२ जिल्हे',
    members: '२५०+ शिक्षण संस्था',
    focus: 'वसतिगृहे, गरजू विद्यार्थ्यांना मोफत शिक्षण व स्पर्धा परीक्षा केंद्र',
    icon: '🎓',
    contact: '+91 231 265 1234'
  },
  {
    id: 6,
    name: 'सारथी विद्यार्थी कृती समिती',
    category: 'शैक्षणिक',
    established: '२०१९',
    hq: 'पुणे, महाराष्ट्र',
    presence: '३६ जिल्हे',
    members: '८५,०००+ विद्यार्थी',
    focus: 'सारथी फेलोशिप, यूपीएससी/एमपीएससी मोफत प्रशिक्षण व परदेशी शिष्यवृत्ती पाठपुरावा',
    icon: '📚',
    contact: '+91 20 2567 8901'
  },
  {
    id: 7,
    name: 'श्री शिवाजी शिक्षण प्रसारक मंडळ',
    category: 'शैक्षणिक',
    established: '१९६२',
    hq: 'अमरावती / विदर्भ',
    presence: 'विदर्भ व मराठवाडा',
    members: '१२०+ शाळा व महाविद्यालये',
    focus: 'ग्रामीण भागातील शेतकरी कुटुंबातील पाल्यांना दर्जेदार तांत्रिक व उच्च शिक्षण',
    icon: '🏫',
    contact: '+91 721 256 3344'
  },
  {
    id: 8,
    name: 'मराठा विद्यार्थी वसतिगृह फेडरेशन',
    category: 'शैक्षणिक',
    established: '२००१',
    hq: 'छत्रपती संभाजीनगर',
    presence: 'राज्यव्यापी',
    members: '४०+ मराठा वसतिगृहे',
    focus: 'शहरात शिक्षणासाठी येणाऱ्या मराठा विद्यार्थ्यांसाठी माफक दरात भोजन व निवासाची सोय',
    icon: '🏢',
    contact: '+91 240 248 9911'
  },

  // 3. युवक (Youth)
  {
    id: 9,
    name: 'मराठा युवा मंच',
    category: 'युवक',
    established: '२०१२',
    hq: 'पुणे, महाराष्ट्र',
    presence: '३६ जिल्हे',
    members: '८ लाख+ युवक',
    focus: 'युवा रोजगार, करिअर मेन्टॉरशिप, रक्तदान शिबिरे व गड-किल्ले स्वच्छता',
    icon: '⚡',
    contact: '+91 98220 99887'
  },
  {
    id: 10,
    name: 'संभाजी ब्रिगेड युवा आघाडी',
    category: 'युवक',
    established: '१९९९',
    hq: 'पुणे / मुंबई, महाराष्ट्र',
    presence: 'राज्यव्यापी ३५०+ तालुके',
    members: '१२ लाख+ युवा कार्यकर्ते',
    focus: 'इतिहास रक्षण, शेतकऱ्यांच्या प्रश्नांवर आंदोलन, युवा नेतृत्व विकास व प्रबोधन',
    icon: '🔥',
    contact: '+91 20 2445 6789'
  },
  {
    id: 11,
    name: 'अखिल भारतीय मराठा विद्यार्थी व युवक महासंघ',
    category: 'युवक',
    established: '२०१५',
    hq: 'नाशिक, महाराष्ट्र',
    presence: 'उत्तर महाराष्ट्र व मराठवाडा',
    members: '३.५ लाख+ युवक',
    focus: 'स्टार्टअप मार्गदर्शन, कौशल्य विकास कार्यशाळा व पोलिस/सैन्य भरती पूर्वतयारी वर्ग',
    icon: '🎯',
    contact: '+91 253 234 5678'
  },
  {
    id: 12,
    name: 'शिवराय युथ फोर्स महाराष्ट्र',
    category: 'युवक',
    established: '२०१८',
    hq: 'सातारा, महाराष्ट्र',
    presence: 'पश्चिम महाराष्ट्र',
    members: '१.५ लाख+ युवा सैनिक',
    focus: 'शिवचरित्र प्रसार, आपत्ती व्यवस्थापन पथके, रक्तदान व गडकोट संवर्धन मोहीम',
    icon: '🛡️',
    contact: '+91 91580 44556'
  },

  // 4. महिला (Women)
  {
    id: 13,
    name: 'जिजाऊ ब्रिगेड (महिला आघाडी)',
    category: 'महिला',
    established: '२००२',
    hq: 'सिंदखेड राजा / बुलढाणा',
    presence: 'महाराष्ट्र व राष्ट्रीय शाखा',
    members: '६ लाख+ महिला भगिनी',
    focus: 'जिजाऊंचे संस्कार, स्त्री प्रबोधन, हुंडाबंदी, स्त्रीभ्रूणहत्या विरोध व कायदेशीर साहाय्य',
    icon: '👑',
    contact: '+91 7262 245 111'
  },
  {
    id: 14,
    name: 'मराठा महिला विकास संघटना',
    category: 'महिला',
    established: '२००८',
    hq: 'नाशिक, महाराष्ट्र',
    presence: '२८ जिल्हे',
    members: '४ लाख+ भगिनी',
    focus: 'महिला बचत गट सक्षमीकरण, कायदेशीर मदत, महिला उद्योग उभारणी व कौशल्य विकास',
    icon: '🌸',
    contact: '+91 98500 11223'
  },
  {
    id: 15,
    name: 'ताराबाई मराठा महिला उद्योजिका मंच',
    category: 'महिला',
    established: '२०१७',
    hq: 'कोल्हापूर, महाराष्ट्र',
    presence: 'दक्षिण महाराष्ट्र व मुंबई',
    members: '५०,०००+ महिला उद्योजक',
    focus: 'मराठा महिलांचे गृहउद्योग, फूड प्रोसेसिंग, वस्त्रोद्योग व ऑनलाइन बाजारपेठ जोडणी',
    icon: '✨',
    contact: '+91 231 254 7890'
  },
  {
    id: 16,
    name: 'अहिल्या-जिजाऊ सखी मंच',
    category: 'महिला',
    established: '२०२०',
    hq: 'पुणे, महाराष्ट्र',
    presence: 'पुणे, सोलापूर, सातारा',
    members: '८०,०००+ सदस्या',
    focus: 'एकल व विधवा महिला पुनर्वसन, आरोग्य तपासणी शिबिरे व मोफत समुपदेशन',
    icon: '🕊️',
    contact: '+91 98224 88776'
  },

  // 5. व्यावसायिक (Business & Entrepreneurs)
  {
    id: 17,
    name: 'मराठा उद्योग व्यवसाय संघ (MUVS)',
    category: 'व्यावसायिक',
    established: '२०१५',
    hq: 'मुंबई / ठाणे, महाराष्ट्र',
    presence: 'राज्यव्यापी व जागतिक',
    members: '५०,०००+ उद्योजक',
    focus: 'B2B बिझनेस नेटवर्किंग, स्टार्टअप सीड फंडिंग, शासकीय योजना व ग्लोबल एक्स्पोर्ट',
    icon: '💼',
    contact: '+91 22 2580 4455'
  },
  {
    id: 18,
    name: 'मराठा चेंबर ऑफ कॉमर्स अँड इंडस्ट्रीज (MCCI)',
    category: 'व्यावसायिक',
    established: '२००५',
    hq: 'पुणे, महाराष्ट्र',
    presence: 'महाराष्ट्र, दुबई, अमेरिका',
    members: '३५,०००+ व्यावसायिक',
    focus: 'औद्योगिक प्रकल्प मार्गदर्शन, व्हेन्चर कॅपिटल, एमएसएमई लोन व आंतरराष्ट्रीय परिषद',
    icon: '🌐',
    contact: '+91 20 2605 9876'
  },
  {
    id: 19,
    name: 'अण्णासाहेब पाटील उद्योजक मंच',
    category: 'व्यावसायिक',
    established: '२०१८',
    hq: 'नवी मुंबई, महाराष्ट्र',
    presence: '३६ जिल्हे',
    members: '१.२ लाख+ लाभार्थी',
    focus: 'अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज योजना साहाय्य, बँक लोन मंजुरी पाठपुरावा',
    icon: '📈',
    contact: '+91 22 2788 1234'
  },
  {
    id: 20,
    name: 'मराठा कृषी-औद्योगिक विकास महामंडळ',
    category: 'व्यावसायिक',
    established: '२०१३',
    hq: 'सांगली / जालना',
    presence: 'पश्चिम महाराष्ट्र व मराठवाडा',
    members: '२२,०००+ शेतकरी उद्योजक',
    focus: 'फळ प्रक्रिया उद्योग, कोल्ड स्टोरेज नेटवर्किंग, थेट निर्यात व कृषी मूल्यवर्धन',
    icon: '🌾',
    contact: '+91 233 232 4455'
  },

  // 6. सांस्कृतिक (Cultural & Heritage)
  {
    id: 21,
    name: 'मराठा सांस्कृतिक परिषद',
    category: 'सांस्कृतिक',
    established: '२००२',
    hq: 'सातारा, महाराष्ट्र',
    presence: 'अखिल महाराष्ट्र',
    members: '२ लाख+ कार्यकर्ते',
    focus: 'शिवजयंती महामहोत्सव समन्वय, गड-किल्ले संवर्धन व शाहिरी परंपरा जतन',
    icon: '🪘',
    contact: '+91 94220 33221'
  },
  {
    id: 22,
    name: 'श्री शिवराज्याभिषेक दिनोत्सव सेवा समिती',
    category: 'सांस्कृतिक',
    established: '१९९६',
    hq: 'दुर्गराज रायगड / महाड',
    presence: 'अखिल भारत व विश्व',
    members: '५ लाख+ शिवभक्त',
    focus: '६ जून भव्य शिवराज्याभिषेक सोहळा आयोजन, पालखी सोहळा व शिवकालीन इतिहास जतन',
    icon: '🚩',
    contact: '+91 2145 222 345'
  },
  {
    id: 23,
    name: 'अखिल भारतीय मराठी शाहिरी परिषद',
    category: 'सांस्कृतिक',
    established: '१९८८',
    hq: 'कोल्हापूर, महाराष्ट्र',
    presence: 'संपूर्ण महाराष्ट्र',
    members: '१,५००+ शाहीर व कलावंत',
    focus: 'शिवकालीन पोवाडा, डफ-तुणतुणे वादन, शाहिरी प्रशिक्षण वर्ग व ऐतिहासिक नाटक मंचन',
    icon: '🎭',
    contact: '+91 231 262 1199'
  },
  {
    id: 24,
    name: 'मराठा इतिहास संशोधन मंडळ',
    category: 'सांस्कृतिक',
    established: '१९७५',
    hq: 'पुणे, महाराष्ट्र',
    presence: 'महाराष्ट्र व लंडन अभिलेखागार',
    members: '५००+ इतिहास संशोधक',
    focus: 'मोडी लिपी दस्तऐवज संशोधन, शिवकालीन अस्सल कागदपत्रांचे प्रकाशन व व्याख्यानमाला',
    icon: '📜',
    contact: '+91 20 2447 5511'
  },

  // 7. क्रीडा (Sports)
  {
    id: 25,
    name: 'मराठा क्रीडा प्रोत्साहन मंडळ',
    category: 'क्रीडा',
    established: '२०१६',
    hq: 'सांगली, महाराष्ट्र',
    presence: 'महाराष्ट्र व राष्ट्रीय',
    members: '१ लाख+ खेळाडू',
    focus: 'कुस्ती, कबड्डी, मल्लखांब खेळाडूंना आर्थिक मदत, डाएट किट व ऑलिम्पिक तयारी',
    icon: '🤼',
    contact: '+91 97650 88776'
  },
  {
    id: 26,
    name: 'महाराष्ट्र कुस्तीगीर मराठा परिषद',
    category: 'क्रीडा',
    established: '२००३',
    hq: 'कोल्हापूर (कुस्तीची पंढरी)',
    presence: 'कोल्हापूर, सांगली, सातारा, पुणे',
    members: '१५,०००+ मल्ल व वस्ताद',
    focus: 'पारंपरिक तालीम संवर्धन, हिंदकेसरी व महाराष्ट्र केसरी मल्लांना स्पॉन्सरशिप व वैद्यकीय विमा',
    icon: '🏆',
    contact: '+91 231 264 8833'
  },
  {
    id: 27,
    name: 'शिवकालीन युद्धकला व मर्दानी खेळ महासंघ',
    category: 'क्रीडा',
    established: '२०१०',
    hq: 'पुणे, महाराष्ट्र',
    presence: '२६ जिल्हे',
    members: '४०,०००+ खेळाडू',
    focus: 'दांडपट्टा, तलवारबाजी, लाठीकाठी, भालाफेक यांचे प्रशिक्षण व शालेय क्रीडा स्पर्धा मान्यता',
    icon: '🗡️',
    contact: '+91 98223 11445'
  },
  {
    id: 28,
    name: 'सह्याद्री ट्रेकर्स व माउंटेनिअरिंग असोसिएशन',
    category: 'क्रीडा',
    established: '२०१४',
    hq: 'ठाणे / नाशिक, महाराष्ट्र',
    presence: 'सह्याद्री पर्वत रांगा',
    members: '२५,०००+ गिर्यारोहक',
    focus: 'किल्ले प्रदक्षिणा, रॉक क्लाइंबिंग, पर्यावरणपूरक ट्रेकिंग व दुर्ग संवर्धन मोहीम',
    icon: '🧗',
    contact: '+91 22 2533 8899'
  },

  // 8. इतर (Other / Specialized)
  {
    id: 29,
    name: 'मराठा लीगल फोरम (कायदेविषयक साहाय्य कक्ष)',
    category: 'इतर',
    established: '२०१७',
    hq: 'मुंबई उच्च न्यायालय / पुणे',
    presence: 'सर्व जिल्हा न्यायालये',
    members: '३,०००+ विधीज्ञ व वकील',
    focus: 'गरजू मराठा बांधवांना मोफत कायदेशीर सल्ला, आरक्षण कायदेशीर लढाई व जनहित याचिका',
    icon: '⚖️',
    contact: '+91 22 2267 4433'
  },
  {
    id: 30,
    name: 'मराठा डॉक्टर्स असोसिएशन (आरोग्य सेवा)',
    category: 'इतर',
    established: '२०११',
    hq: 'पुणे / छत्रपती संभाजीनगर',
    presence: 'महाराष्ट्रभर १०,०००+ डॉक्टर',
    members: '१०,०००+ मराठा डॉक्टर्स',
    focus: 'मोफत ग्रामीण आरोग्य शिबिरे, कॅन्सर तपासणी, रक्तदान महाअभियान व आपत्कालीन मदत',
    icon: '🩺',
    contact: '+91 20 2553 7700'
  },
  {
    id: 31,
    name: 'मराठा शेतकरी समन्वय मंच',
    category: 'इतर',
    established: '२०१५',
    hq: 'बीड / लातूर / परभणी',
    presence: 'मराठवाडा व विदर्भ',
    members: '३ लाख+ शेतकरी कुटुंबे',
    focus: 'दुष्काळ मदत, शेतकरी आत्महत्याग्रस्त कुटुंबांचे पुनर्वसन व हमीभाव मिळवण्यासाठी लढा',
    icon: '🚜',
    contact: '+91 2442 223 990'
  },
  {
    id: 32,
    name: 'ग्लोबल मराठा डायस्पोरा कौन्सिल (आंतरराष्ट्रीय)',
    category: 'इतर',
    established: '२०१९',
    hq: 'लंडन / न्यू जर्सी / दुबई',
    presence: '२५+ देश (परदेशस्थ मराठा मंडळे)',
    members: '१.५ लाख+ अनिवासी मराठा',
    focus: 'परदेशात शिवजयंती उत्सव, मराठी भाषा संवर्धन, परदेशी उच्च शिक्षण व नोकरी मार्गदर्शन',
    icon: '✈️',
    contact: '+44 20 7946 0991'
  }
];

const categories = [
  'सर्व संघटना',
  'सामाजिक',
  'शैक्षणिक',
  'युवक',
  'महिला',
  'व्यावसायिक',
  'सांस्कृतिक',
  'क्रीडा',
  'इतर'
];

export default function MarathaOrganizationsPage() {
  const [orgs, setOrgs] = useState(orgsData);
  const [selectedCat, setSelectedCat] = useState('सर्व संघटना');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getOrganizations().then((liveData) => {
      if (liveData && liveData.length > 0) {
        const mapped = liveData.map((o) => ({
          id: o.id,
          name: o.name,
          category: o.category || 'सामाजिक',
          established: o.regNo || o.established || 'नोंदणीकृत',
          hq: o.city ? `${o.city}, महाराष्ट्र` : (o.hq || 'महाराष्ट्र'),
          presence: o.district ? `${o.district} व इतर जिल्हे` : (o.presence || 'महाराष्ट्र'),
          members: o.president ? `अध्यक्ष: ${o.president}` : (o.members || 'सक्रिय सदस्य'),
          focus: o.workScope || o.focus || 'सामाजिक, शैक्षणिक व सांस्कृतिक कार्य',
          icon: o.logo || o.icon || '🚩',
          contact: o.contact || '+91 98220 99887'
        }));
        // Merge registered live organizations at top without removing categorized defaults
        setOrgs((prev) => {
          const liveIds = new Set(mapped.map((m) => m.id));
          const unmanaged = prev.filter((p) => !liveIds.has(p.id));
          return [...mapped, ...unmanaged];
        });
      }
    }).catch(() => {});
  }, []);

  const handleAddOrg = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const name = form.elements['name'].value;
    const cat = form.elements['category'].value;
    const city = form.elements['city'].value;
    const est = form.elements['est']?.value;
    const phone = form.elements['phone'].value;
    const scope = form.elements['scope']?.value;

    try {
      const res = await apiClient.addOrganization({
        name,
        regNo: est || 'संस्था क्र. MH-2026',
        president: 'संस्थापक अध्यक्ष',
        city,
        district: city,
        contact: phone.replace(/\D/g, '').slice(-10) || '9822011223',
        workScope: scope || cat
      });
      const created = res.data?.organization || res.organization || {
        id: `ORG-${Date.now().toString().slice(-4)}`,
        name,
        category: cat,
        established: est || '२०२६',
        hq: `${city}, महाराष्ट्र`,
        presence: 'महाराष्ट्र',
        members: 'सक्रिय सभासद',
        focus: scope || 'सामाजिक व शैक्षणिक कार्य',
        icon: '🚩',
        contact: phone
      };
      setOrgs((prev) => [created, ...prev]);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'नोंदणी करताना त्रुटी आली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = orgs.filter((org) => {
    const matchCat = selectedCat === 'सर्व संघटना' || org.category === selectedCat;
    const matchSearch =
      (org.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.hq || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.focus || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="organizations-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(30, 15, 10, 0.45) 0%, rgba(139, 20, 20, 0.62) 60%, rgba(20, 10, 10, 0.78) 100%), url("/assets/images/maratha-kranti-morcha.jpg") center 35%/cover no-repeat',
        color: '#FFFFFF',
        padding: '64px 20px 56px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.45)'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 213, 79, 0.4)',
            padding: '6px 18px',
            borderRadius: '24px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '14px',
            color: '#FFD54F',
            letterSpacing: '0.5px'
          }}>
            🚩 CONNECT मराठा — एक लढा! एक संघर्ष! एक समाज! | सर्वधर्म समभाव
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: '#FFE082',
            fontWeight: 700,
            margin: '0 0 8px',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            संघटित मराठा ! सशक्त मराठा !!
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            color: '#FFFFFF',
            textShadow: '0 3px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)'
          }}>
            मराठा संघटना – एकत्र येऊ, प्रगती करू !
          </h1>
          <p style={{
            fontSize: '1.12rem',
            color: '#F8FAFC',
            margin: '0 auto 24px',
            maxWidth: '720px',
            lineHeight: 1.6,
            textShadow: '0 2px 8px rgba(0,0,0,0.85)'
          }}>
            सन्मान, स्वाभिमान आणि हक्कासाठी मराठा समाज एकत्र आहे. महाराष्ट्रातील सर्व अधिकृत संघटनांची सूची.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)',
                color: '#8B1414',
                border: 'none',
                padding: '13px 28px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              ＋ आपली संघटना नोंदवा
            </button>
            <a
              href="#orgs-list"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '13px 26px',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              नोंदणीकृत संघटना पहा ({orgsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div id="orgs-list" style={{ maxWidth: '1180px', margin: '24px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          border: '1px solid #EADBCE'
        }}>
          <input
            type="text"
            placeholder="संघटना नाव, कार्यक्षेत्र किंवा मुख्यालय शोधा..."
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
            {categories.map((cat) => {
              const count = cat === 'सर्व संघटना' 
                ? orgs.length 
                : orgs.filter((o) => o.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '24px',
                    border: selectedCat === cat ? '2px solid #B71C1C' : '1.5px solid #E2D9D2',
                    background: selectedCat === cat ? 'linear-gradient(135deg, #B71C1C 0%, #880E4F 100%)' : '#FFFFFF',
                    color: selectedCat === cat ? '#FFFFFF' : '#333333',
                    fontSize: '0.9rem',
                    fontWeight: selectedCat === cat ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: selectedCat === cat ? '0 4px 12px rgba(183,28,28,0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    background: selectedCat === cat ? 'rgba(255,255,255,0.25)' : '#F0EAE1',
                    color: selectedCat === cat ? '#FFFFFF' : '#8B1414',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px dashed #D7CCC8',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚩</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 8px' }}>
              या वर्गवारीत सध्या संघटना आढळली नाही
            </h4>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px' }}>
              आपण आपल्या अधिकृत मराठा संघटनेची येथे विनामूल्य नोंदणी करू शकता.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#B71C1C',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ＋ संघटना नोंदणी करा
            </button>
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((org) => (
            <div
              key={org.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8DFD8',
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                padding: '24px 20px',
                borderBottom: '1px solid #EF9A9A',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: '#B71C1C',
                  color: '#FFD54F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: '0 4px 10px rgba(183,28,28,0.2)'
                }}>
                  {org.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 4px' }}>
                    {org.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: '#D32F2F', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {org.category} • स्था: {org.established}
                  </span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div>
                  <strong>📍 मुख्यालय:</strong> {org.hq}
                </div>
                <div>
                  <strong>🌍 विस्तार:</strong> {org.presence}
                </div>
                <div>
                  <strong>👥 सदस्य संख्या:</strong> <span style={{ color: '#2E7D32', fontWeight: 700 }}>{org.members}</span>
                </div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: '4px' }}>
                  <strong>उद्दिष्ट:</strong> {org.focus}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedOrg(org)}
                  style={{
                    flex: 1,
                    background: '#B71C1C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  संघटना माहिती
                </button>
                <button
                  onClick={() => alert(`${org.name} संपर्क: ${org.contact}`)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #B71C1C',
                    background: '#FFFFFF',
                    color: '#B71C1C',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📞 संपर्क
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Statistics Banner */}
      <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #B71C1C 0%, #7F0000 100%)',
          borderRadius: '16px',
          padding: '40px 24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 20px', color: '#FFD54F' }}>
            संघटित मराठा, सक्षम मराठा, समृद्ध मराठा
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>५००+</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>नोंदणीकृत संघटना</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>१ लाख+</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>सक्रिय पदाधिकारी</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>३६</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>जिल्ह्यांमध्ये प्रत्यक्ष उपस्थिती</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>१</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>एकच ध्येय — समाजहित व प्रगती</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Org Detail */}
      {selectedOrg && (
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
              onClick={() => setSelectedOrg(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedOrg.icon}</span>
              <div>
                <h2 style={{ color: '#B71C1C', margin: '0 0 4px', fontSize: '1.4rem' }}>{selectedOrg.name}</h2>
                <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '3px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}>
                  {selectedOrg.category} • स्थापना: {selectedOrg.established}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>मुख्यालय:</strong> {selectedOrg.hq}</div>
              <div><strong>विस्तार:</strong> {selectedOrg.presence}</div>
              <div><strong>सदस्य:</strong> {selectedOrg.members}</div>
              <div><strong>ध्येय व उपक्रम:</strong> {selectedOrg.focus}</div>
              <div><strong>अधिकृत संपर्क:</strong> {selectedOrg.contact}</div>
            </div>
            <button
              onClick={() => setSelectedOrg(null)}
              style={{ width: '100%', marginTop: '20px', background: '#B71C1C', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Organization */}
      {showAddModal && (
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
              onClick={() => { setShowAddModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 6px' }}>
              🚩 आपली संघटना नोंदवा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              Connect Maratha व्यासपीठावर आपल्या संघटनेचा अधिकृत समावेश करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>संघटना नोंदणी प्राप्त झाली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>पडताळणी समितीकडून तपासणीनंतर अधिकृत मान्यता दिली जाईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddOrg}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input name="name" required placeholder="संघटनेचे पूर्ण नाव *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select name="category" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      {categories.filter(c => c !== 'सर्व संघटना').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input name="city" required placeholder="मुख्यालय / शहर *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input name="est" placeholder="स्थापना वर्ष" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input name="phone" required type="tel" placeholder="अध्यक्ष / सचिव मोबाईल *" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <textarea name="scope" placeholder="संघटनेची मुख्य ध्येये व कार्यक्षेत्र" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'नोंदणी सादर करत आहे...' : 'संघटना नोंदणी सादर करा'}
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
