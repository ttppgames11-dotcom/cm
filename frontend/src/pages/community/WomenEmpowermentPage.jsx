import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/apiClient';

const INSPIRATIONAL_FIGURES = [
  {
    name: 'राष्ट्रमाता राजमाता जिजाऊ मासाहेब',
    title: 'स्वराज्य प्रेरिका, नीतीशास्त्रज्ञ व मार्गदर्शक',
    desc: 'छत्रपती शिवाजी महाराजांना स्वराज्याची प्रेरणा देणाऱ्या, न्यायप्रिय व कुशल प्रशासक राजमाता. स्वराज्याचा संकल्प जिजाऊंच्या संस्कारांतून साकार झाला.',
    image: '/assets/images/real-jijabai-statue.jpg',
    fallbackImg: '/assets/images/real-jijabai-lal-mahal.jpg',
    tag: 'स्वराज्य प्रेरिका',
    period: '१५९८ – १६७४'
  },
  {
    name: 'महारानी ताराबाई भोसले',
    title: 'मुघल सत्ता निष्प्रभ करणारी पराक्रमी रणरागिणी',
    desc: 'छत्रपती राजाराम महाराजांनंतर मराठा साम्राज्याची धुरा समर्थपणे सांभाळत मुघल बादशहा औरंगजेबाला जेरीस आणणाऱ्या पराक्रमी सेनानी व राज्यकर्ती.',
    image: '/assets/images/maharani-tarabai.webp',
    fallbackImg: '/assets/images/real-tarabai-portrait.jpg',
    tag: 'रणरागिणी',
    period: '१६७५ – १७६१'
  },
  {
    name: 'पुण्यश्लोक अहिल्याबाई होळकर',
    title: 'धर्मरक्षक, मुत्सद्दी व आदर्श लोककल्याणकारी राणी',
    desc: 'संपूर्ण भारतात मंदिरे, घाट, विहिरी व धर्मशाळा बांधून आदर्श लोककल्याणकारी कारभार करणाऱ्या, शेतकऱ्यांना पाठबळ देणाऱ्या तत्वज्ञानी राज्यकर्ती.',
    image: '/assets/images/real-ahilyabai-holkar.jpg',
    fallbackImg: '/assets/images/real-ahilyabai-color-painting.jpg',
    tag: 'लोककल्याणकारी',
    period: '१७२५ – १७९५'
  },
  {
    name: 'डॉ. आनंदीबाई जोशी',
    title: 'भारतातील पहिल्या महिला डॉक्टर (M.D.)',
    desc: 'कठीण परिस्थितीत अमेरिकेत जाऊन वैद्यकीय पदवी संपादन करून भारतीय महिलांसाठी आधुनिक आरोग्य शिक्षणाचा मार्ग खुला करणाऱ्या विदुषी.',
    image: '/assets/images/real-anandibai-joshi-historical.jpg',
    fallbackImg: '/assets/images/historical-anandibai-joshi.jpg',
    tag: 'वैद्यकीय प्रणेत्या',
    period: '१८६५ – १८८७'
  }
];

const SUCCESS_STORIES = [
  {
    name: 'पद्मश्री राहीबाई सोमा पोपेरे (बीजमाता)',
    location: 'अकोले, अहमदनगर',
    field: 'गावरान बियाणे संवर्धन व सेंद्रिय शेती',
    achievement: 'गावरान बियाण्यांची बँक स्थापन करून हजारो एकर शेती विषमुक्त केली व देशभरातील महिला शेतकऱ्यांना स्वावलंबी बनवले.',
    badge: 'पद्मश्री कृषी प्रणेत्या',
    image: '/assets/images/real-rahibai-popere.jpg'
  },
  {
    name: 'अॅड. इंदिरा जयसिंग (वरिष्ठ विधिज्ञ)',
    location: 'मुंबई / नवी दिल्ली',
    field: 'महिला हक्क व कायदेशीर संरक्षण',
    achievement: 'सर्वोच्च न्यायालयात कौटुंबिक हिंसाचार प्रतिबंधक कायदा आणि महिलांच्या मालमत्ता हक्कांच्या लढ्यात ऐतिहासिक योगदान.',
    badge: 'ज्येष्ठ विधीतज्ज्ञ',
    image: '/assets/images/real-indira-jaising-advocate.jpg'
  },
  {
    name: 'श्रीमती अश्विनी भिडे (भा.प्र.से. / IAS)',
    location: 'मुंबई / सांगली',
    field: 'प्रशासकीय नेतृत्व व पायाभूत सुविधा',
    achievement: 'मुंबई मेट्रो रेल कॉर्पोरेशन (MMRC) च्या व्यवस्थापकीय संचालक म्हणून मेट्रो-३ भूमिगत प्रकल्पाचे यशस्वी व धडाडीचे नेतृत्व.',
    badge: 'वरिष्ठ सनदी अधिकारी (IAS)',
    image: '/assets/images/real-ashwini-bhide-ias.jpg'
  },
  {
    name: 'पद्मश्री कल्पना सरोज (कमानी ट्यूब्स)',
    location: 'अकोला / मुंबई',
    field: 'औद्योगिक नेतृत्व व उद्योजकता',
    achievement: 'अत्यंत प्रतिकूल परिस्थितीतून पुढे येऊन बंद पडलेली कमानी ट्यूब्स कंपनी पुनरुज्जीवित करत शेकडो कोटींचे साम्राज्य उभे केले.',
    badge: 'पद्मश्री उद्योगपती',
    image: '/assets/images/real-kalpana-saroj.jpg'
  }
];

export default function WomenEmpowermentPage() {
  const { showToast } = useToast();

  // Navigation Tabs: 'directory', 'marketplace', 'shgs', 'schemes', 'mentors', 'my_cases'
  const [activeTab, setActiveTab] = useState('directory');

  // Live Data States
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [products, setProducts] = useState([]);
  const [shgs, setShgs] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [myHelpCases, setMyHelpCases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [entCategory, setEntCategory] = useState('all');
  const [entDistrict, setEntDistrict] = useState('all');
  const [entSearch, setEntSearch] = useState('');
  const [onlyShg, setOnlyShg] = useState(false);

  const [productCat, setProductCat] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [shgDistrict, setShgDistrict] = useState('all');
  const [prgType, setPrgType] = useState('all');
  const [mentorField, setMentorField] = useState('all');

  // Modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isRegisterEntModalOpen, setIsRegisterEntModalOpen] = useState(false);
  const [isRegisterShgModalOpen, setIsRegisterShgModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [bookingMentorModal, setBookingMentorModal] = useState(null);

  // Forms
  const [helpForm, setHelpForm] = useState({
    name: '',
    phone: '',
    district: 'पुणे',
    category: 'कौटुंबिक व कायदेशीर सल्ला',
    urgency: 'सामान्य',
    description: '',
    preferredTime: 'सकाळी ११ ते दुपारी २'
  });

  const [entForm, setEntForm] = useState({
    name: '',
    businessName: '',
    category: 'खाद्यपदार्थ व कृषी प्रक्रिया',
    subCategory: '',
    district: 'पुणे',
    city: '',
    description: '',
    productsServices: '',
    contactPhone: '',
    whatsapp: '',
    email: '',
    shgName: '',
    isShg: false,
    employeesCount: 1,
    annualTurnover: ''
  });

  const [shgForm, setShgForm] = useState({
    shgName: '',
    presidentName: '',
    secretaryName: '',
    phone: '',
    district: 'पुणे',
    taluka: '',
    village: '',
    membersCount: 10,
    bankName: 'बँक ऑफ महाराष्ट्र',
    bankBranch: '',
    monthlySavings: '₹५०० / महिना',
    activityType: 'खाद्यपदार्थ व कृषी प्रक्रिया'
  });

  const [productForm, setProductForm] = useState({
    sellerName: '',
    productName: '',
    category: 'कृषी व खाद्यपदार्थ',
    price: '',
    unit: 'प्रति किलो',
    district: 'पुणे',
    photo: '',
    description: '',
    contactPhone: '',
    whatsapp: ''
  });

  const [mentorBookingForm, setMentorBookingForm] = useState({
    applicantName: '',
    phone: '',
    district: 'पुणे',
    topic: 'उद्योग उभारणी व बँकिंग कर्ज मार्गदर्शन',
    preferredDate: '',
    preferredTime: 'दुपारी २ ते ५',
    notes: ''
  });

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ents, prds, shgList, prgs, mnts] = await Promise.all([
        apiClient.getWomenEntrepreneurs({
          category: entCategory,
          district: entDistrict,
          search: entSearch,
          isShg: onlyShg ? '1' : ''
        }),
        apiClient.getWomenProducts({ category: productCat, search: productSearch }),
        apiClient.getWomenShgs({ district: shgDistrict }),
        apiClient.getWomenPrograms({ type: prgType }),
        apiClient.getWomenMentors({ field: mentorField })
      ]);
      setEntrepreneurs(ents || []);
      setProducts(prds || []);
      setShgs(shgList || []);
      setPrograms(prgs || []);
      setMentors(mnts || []);

      apiClient.getWomenHelpRequests()
        .then(res => setMyHelpCases(Array.isArray(res) ? res : []))
        .catch(() => setMyHelpCases([]));
    } catch (err) {
      console.error('Error fetching women data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [entCategory, entDistrict, onlyShg, productCat, shgDistrict, prgType, mentorField]);

  // Submit Confidential Help Request
  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addWomenHelpRequest({
        name: helpForm.name,
        contactPhone: helpForm.phone,
        district: helpForm.district,
        category: helpForm.category,
        urgency: helpForm.urgency,
        description: helpForm.description,
        preferredTime: helpForm.preferredTime
      });

      showToast('🌸 आपली मदत विनंती सुरक्षितरीत्या दाखल झाली! समन्वयकांकडून लवकरच संपर्क केला जाईल.', 'success');
      setIsHelpModalOpen(false);
      setHelpForm({
        name: '',
        phone: '',
        district: 'पुणे',
        category: 'कौटुंबिक व कायदेशीर सल्ला',
        urgency: 'सामान्य',
        description: '',
        preferredTime: 'सकाळी ११ ते दुपारी २'
      });
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + (err.message || 'विनंती अयशस्वी'), 'error');
    }
  };

  // Submit Entrepreneur Registration
  const handleEntSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addWomenEntrepreneur(entForm);
      showToast('🎉 महिला उद्योजक नोंदणी यशस्वीरीत्या पूर्ण झाली!', 'success');
      setIsRegisterEntModalOpen(false);
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + (err.message || 'नोंदणी अयशस्वी'), 'error');
    }
  };

  // Submit SHG Registration
  const handleShgSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addWomenShg(shgForm);
      showToast('🎉 महिला बचत गट महासंघात यशस्वीरीत्या नोंदवला गेला!', 'success');
      setIsRegisterShgModalOpen(false);
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + (err.message || 'नोंदणी अयशस्वी'), 'error');
    }
  };

  // Submit Product Marketplace Listing
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addWomenProduct(productForm);
      showToast('🎉 उत्पादन यशस्वीरित्या महिला बाजारात सूचीबद्ध झाले!', 'success');
      setIsAddProductModalOpen(false);
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + (err.message || 'नोंदणी अयशस्वी'), 'error');
    }
  };

  // Submit Mentor Session Booking
  const handleMentorBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingMentorModal) return;
    try {
      await apiClient.bookWomenMentor({
        mentorId: bookingMentorModal.id,
        mentorName: bookingMentorModal.name,
        applicantName: mentorBookingForm.applicantName,
        phone: mentorBookingForm.phone,
        district: mentorBookingForm.district,
        topic: mentorBookingForm.topic,
        preferredDate: mentorBookingForm.preferredDate,
        preferredTime: mentorBookingForm.preferredTime,
        notes: mentorBookingForm.notes
      });
      showToast(`✓ मेंटॉर ${bookingMentorModal.name} यांच्यासोबत मार्गदर्शन सत्र निश्चित झाले!`, 'success');
      setBookingMentorModal(null);
    } catch (err) {
      showToast('त्रुटी: ' + (err.message || 'सत्र बुकिंग अयशस्वी'), 'error');
    }
  };

  return (
    <div style={{ background: '#FAF5EE', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* 1. HERO BANNER */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1240px',
        margin: '1.25rem auto 0',
        padding: '0 1rem'
      }}>
        <div style={{
          width: '100%',
          height: 'clamp(240px, 32vw, 380px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 16px 36px -10px rgba(0,0,0,0.18)',
          border: '2px solid rgba(251, 207, 232, 0.7)',
          position: 'relative'
        }}>
          <img
            src="/assets/images/women-empowerment-hero.jpg"
            alt="मराठा महिला सक्षमीकरण: कर्तृत्व, शौर्य आणि सन्मान"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'cover',
              objectPosition: 'center 22%'
            }}
          />
        </div>
      </div>

      {/* 2. EMERGENCY HELPLINE & QUICK ACTION BUTTONS */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto 2.5rem', padding: '0 1rem' }}>
        <div style={{
          background: '#ffffff',
          color: '#1e293b',
          padding: '1.5rem 2.5rem',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          boxShadow: '0 12px 30px -5px rgba(159, 18, 57, 0.12)',
          flexWrap: 'wrap',
          border: '2px solid #FBCFE8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FDF2F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              border: '2px solid #F472B6',
              flexShrink: 0
            }}>
              🚨
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                २४×७ मराठा महिला आणीबाणी हेल्पलाइन व समुपदेशन
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#9f1239', letterSpacing: '1px', lineHeight: 1.15 }}>
                9090 112 112
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '3px' }}>
                गोपनीय कायदेशीर संरक्षण • सुरक्षितता साहाय्य • समुपदेशन व जिल्हा समन्वयक कक्ष
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.9rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 8px 18px rgba(190, 24, 93, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔒 गोपनीय मदत मागा ➔
            </button>

            <button
              onClick={() => setIsRegisterEntModalOpen(true)}
              style={{
                background: '#FFF1F2',
                color: '#be185d',
                border: '1.5px solid #F43F5E',
                padding: '0.9rem 1.4rem',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              + उद्योजक नोंदणी 🌸
            </button>

            <button
              onClick={() => setIsRegisterShgModalOpen(true)}
              style={{
                background: '#f0fdf4',
                color: '#15803d',
                border: '1.5px solid #86efac',
                padding: '0.9rem 1.4rem',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              + बचत गट नोंदणी 🤝
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN PORTAL INTERACTIVE SUITE */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Navigation Tabs (All 6 Concepts) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {[
            { id: 'directory', label: '👩‍💼 महिला उद्योजक निर्देशिका', count: entrepreneurs.length },
            { id: 'marketplace', label: '🛍️ महिला बाजारपेठ व उत्पादने', count: products.length },
            { id: 'shgs', label: '🤝 महिला बचत गट (SHGs)', count: shgs.length },
            { id: 'schemes', label: '📜 कौशल्य प्रशिक्षण व सरकारी योजना', count: programs.length },
            { id: 'mentors', label: '🎓 अनुभवी मेंटॉर व मार्गदर्शक', count: mentors.length },
            { id: 'my_cases', label: '📁 माझी दाखल मदत प्रकरणे', count: myHelpCases.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: activeTab === tab.id ? '#be185d' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#475569',
                borderRadius: '10px 10px 0 0',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: activeTab === tab.id ? '#fff' : '#0f172a',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.74rem'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: ENTREPRENEURS DIRECTORY ────────────────────────── */}
        {activeTab === 'directory' && (
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              marginBottom: '24px',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <form onSubmit={e => { e.preventDefault(); loadData(); }} style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  placeholder="उद्योजक, व्यवसायाचे नाव किंवा उत्पादन शोधा..."
                  value={entSearch}
                  onChange={e => setEntSearch(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
                <button
                  type="submit"
                  style={{ background: '#be185d', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  शोधा
                </button>
              </form>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={entCategory}
                  onChange={e => setEntCategory(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 600 }}
                >
                  <option value="all">सर्व व्यवसाय श्रेणी</option>
                  <option value="खाद्यपदार्थ">खाद्यपदार्थ व कृषी प्रक्रिया</option>
                  <option value="वस्त्रोद्योग">वस्त्रोद्योग व फॅशन</option>
                  <option value="IT">IT व व्यावसायिक सेवा</option>
                  <option value="आरोग्य">आरोग्य व निसर्गोपचार</option>
                  <option value="गृहउद्योग">गृहउद्योग व हस्तकला</option>
                </select>

                <select
                  value={entDistrict}
                  onChange={e => setEntDistrict(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 600 }}
                >
                  <option value="all">सर्व जिल्हे (महाराष्ट्र)</option>
                  <option value="पुणे">पुणे</option>
                  <option value="सातारा">सातारा</option>
                  <option value="कोल्हापूर">कोल्हापूर</option>
                  <option value="नाशिक">नाशिक</option>
                  <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
                  <option value="मुंबई">मुंबई</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700, color: '#be185d', cursor: 'pointer' }}>
                  <input type="checkbox" checked={onlyShg} onChange={e => setOnlyShg(e.target.checked)} />
                  केवळ बचत गट (SHG)
                </label>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>माहिती लोड होत आहे...</div>
            ) : entrepreneurs.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                सध्या कोणताही महिला उद्योजक आढळला नाही.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {entrepreneurs.map(ent => (
                  <div
                    key={ent.id}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#FDF2F8' }}>
                        <img
                          src={ent.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'}
                          alt={ent.business_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.95)', color: '#9f1239', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                            {ent.category}
                          </span>
                          {ent.is_shg === 1 && (
                            <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                              🤝 बचत गट
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '18px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: 'Baloo 2' }}>
                          {ent.business_name}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#be185d', fontWeight: 700, marginBottom: '6px' }}>
                          उद्योजिका: {ent.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                          📍 {ent.taluka ? `${ent.taluka}, ` : ''}{ent.district}
                          {ent.annual_turnover && ` • टर्नओव्हर: ${ent.annual_turnover}`}
                        </div>
                        <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                          {ent.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '12px 18px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '10px' }}>
                      <a
                        href={`tel:${ent.contact_phone}`}
                        style={{ flex: 1, background: '#be185d', color: '#fff', textAlign: 'center', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        📞 संपर्क ({ent.contact_phone})
                      </a>
                      {ent.whatsapp && (
                        <a
                          href={`https://wa.me/91${ent.whatsapp}?text=नमस्कार, मी कनेक्ट मराठा महिला कक्षातून संपर्क करत आहे.`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ background: '#25D366', color: '#fff', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: WOMEN MARKETPLACE & PRODUCTS ───────────────────── */}
        {activeTab === 'marketplace' && (
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 24px',
              border: '1px solid #E2E8F0',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                  🛍️ मराठा महिला उत्पादने थेट ग्राहक बाजारपेठ (Direct B2C / B2B)
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  शुद्ध सेंद्रिय हळद, अस्सल रेशमी येवला पैठणी, गावरान मसाले व गृहउद्योग उत्पादने थेट उत्पादक भगिनींकडून खरेदी करा.
                </div>
              </div>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                style={{
                  background: '#be185d',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                + माझे उत्पादन विका (List Product)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {products.map(prd => (
                <div
                  key={prd.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img src={prd.photo} alt={prd.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: '#be185d',
                        color: '#fff',
                        fontWeight: 900,
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                      }}>
                        {prd.price} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>({prd.unit})</span>
                      </span>
                    </div>

                    <div style={{ padding: '16px' }}>
                      <span style={{ background: '#FCE7F3', color: '#9F1239', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {prd.category}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px', fontFamily: 'Baloo 2' }}>
                        {prd.product_name}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' }}>
                        विक्रेता: <strong>{prd.seller_name}</strong> • 📍 {prd.district}
                      </div>
                      <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                        {prd.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
                    <a
                      href={`tel:${prd.contact_phone}`}
                      style={{
                        flex: 1,
                        background: '#be185d',
                        color: '#fff',
                        textAlign: 'center',
                        padding: '8px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.84rem'
                      }}
                    >
                      📞 ऑर्डर करा ({prd.contact_phone})
                    </a>
                    <a
                      href={`https://wa.me/91${prd.whatsapp || prd.contact_phone}?text=मी ${prd.product_name} बद्दल चौकशी करत आहे.`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#25D366',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.84rem'
                      }}
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: SELF-HELP GROUPS (SHGs) FEDERATION ─────────────── */}
        {activeTab === 'shgs' && (
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 24px',
              border: '1px solid #E2E8F0',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#15803d', fontFamily: 'Baloo 2' }}>
                  🤝 मराठा महिला बचत गट महासंघ (SHG Federation & Banking)
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  गावोगावी कार्यरत असणाऱ्या महिला बचत गटांचे संघटन, बँक लिंकेज, खेळते भांडवल व शासकीय अनुदान साहाय्य.
                </div>
              </div>

              <button
                onClick={() => setIsRegisterShgModalOpen(true)}
                style={{
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                + नवीन बचत गट नोंदणी
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {shgs.map(s => (
                <div
                  key={s.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 800 }}>
                        {s.id} • {s.members_count || 10} महिला सदस्य
                      </span>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                        {s.loan_status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px', fontFamily: 'Baloo 2' }}>
                      {s.shg_name}
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, marginBottom: '8px' }}>
                      अध्यक्ष: {s.president_name} {s.secretary_name ? `• सचिव: ${s.secretary_name}` : ''}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '10px' }}>
                      📍 {s.village ? `${s.village}, ` : ''}{s.taluka}, {s.district}
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
                      🏭 <strong>उद्योग:</strong> {s.activity_type}<br />
                      🏦 <strong>बँक:</strong> {s.bank_name} ({s.bank_branch})<br />
                      💰 <strong>बचत:</strong> {s.monthly_savings}
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <a
                      href={`tel:${s.phone}`}
                      style={{
                        display: 'block',
                        background: '#15803d',
                        color: '#fff',
                        textAlign: 'center',
                        padding: '8px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      📞 अध्यक्ष संपर्क ({s.phone})
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: TRAINING & SCHEMES ─────────────────────────────── */}
        {activeTab === 'schemes' && (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['all', 'scheme', 'training', 'workshop'].map(type => (
                <button
                  key={type}
                  onClick={() => setPrgType(type)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #CBD5E1',
                    background: prgType === type ? '#be185d' : '#fff',
                    color: prgType === type ? '#fff' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  {type === 'all' ? 'सर्व योजना व प्रशिक्षणे' : type === 'scheme' ? '🏛️ सरकारी योजना व अनुदान' : type === 'training' ? '💻 कौशल्य व IT प्रशिक्षण' : '🎯 कार्यशाळा व मेळावे'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {programs.map(prg => (
                <div
                  key={prg.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{
                        background: prg.type === 'scheme' ? '#FEF3C7' : '#FCE7F3',
                        color: prg.type === 'scheme' ? '#92400E' : '#9F1239',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.78rem'
                      }}>
                        {prg.type === 'scheme' ? '🏛️ शासकीय योजना' : '💻 प्रशिक्षण कार्यक्रम'} • {prg.category || 'कौशल्य विकास'}
                      </span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px', fontFamily: 'Baloo 2' }}>
                        {prg.title}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#64748b' }}>
                        प्रदाता: <strong>{prg.provider}</strong> | कार्यक्षेत्र: {prg.district}
                      </div>
                    </div>

                    {prg.deadline && (
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                        ⏳ मुदत: {prg.deadline}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {prg.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '10px' }}>
                    {prg.eligibility && (
                      <div style={{ fontSize: '0.84rem' }}>
                        <strong style={{ color: '#0f172a' }}>📋 पात्रता निकष:</strong><br />
                        <span style={{ color: '#475569' }}>{prg.eligibility}</span>
                      </div>
                    )}
                    {prg.benefits && (
                      <div style={{ fontSize: '0.84rem' }}>
                        <strong style={{ color: '#16a34a' }}>🎁 मिळणारे लाभ:</strong><br />
                        <span style={{ color: '#475569' }}>{prg.benefits}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                    <div style={{ fontSize: '0.86rem', color: '#64748b' }}>
                      📞 हेल्पलाइन: <strong>{prg.contact_phone || '1800-120-8040'}</strong>
                    </div>

                    <a
                      href={prg.apply_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#be185d',
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}
                    >
                      अधिक माहिती व अर्ज करा ➔
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: MENTORS & DIRECTORY ────────────────────────────── */}
        {activeTab === 'mentors' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {mentors.map(m => (
                <div
                  key={m.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                      <img
                        src={m.photo}
                        alt={m.name}
                        style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FBCFE8' }}
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                          {m.name}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: '#be185d', fontWeight: 700, marginTop: '2px' }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          अनुभव: {m.experience}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 14px' }}>
                      {m.about}
                    </p>

                    <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#334155', marginBottom: '16px' }}>
                      🕒 उपलब्ध वेळ: <strong>{m.available_modes}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setBookingMentorModal(m)}
                      style={{
                        flex: 1,
                        background: '#be185d',
                        color: '#fff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer'
                      }}
                    >
                      🗓️ १-ऑन-१ मार्गदर्शन सत्र बुक करा
                    </button>
                    <a
                      href={`tel:${m.contact_phone}`}
                      style={{
                        background: '#FDF2F8',
                        color: '#be185d',
                        border: '1px solid #FBCFE8',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.86rem'
                      }}
                    >
                      📞 कॉल
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: MY CONFIDENTIAL HELP CASES ─────────────────────── */}
        {activeTab === 'my_cases' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                  📁 माझी दाखल मदत प्रकरणे (Confidential Cases)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  आपण महिला समन्वय कक्षाकडे नोंदवलेल्या अर्जांची सद्यस्थिती व नियुक्त अधिकारी तपशील.
                </p>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(true)}
                style={{ background: '#be185d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer' }}
              >
                + नवीन प्रकरण दाखल करा
              </button>
            </div>

            {myHelpCases.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', color: '#64748b' }}>
                आपण अद्याप कोणतीही मदत विनंती दाखल केलेली नाही.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myHelpCases.map(c => (
                  <div key={c.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FDFCFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 800, color: '#be185d' }}>#{c.case_number || c.id}</span>
                          <span style={{ background: '#FCE7F3', color: '#9F1239', padding: '2px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 700 }}>
                            {c.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 700, marginTop: '6px' }}>
                          {c.description}
                        </div>
                      </div>

                      <span style={{
                        background: c.status?.includes('सोडवले') ? '#DCFCE7' : '#FEF3C7',
                        color: c.status?.includes('सोडवले') ? '#15803D' : '#92400E',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        {c.status}
                      </span>
                    </div>

                    <div style={{ marginTop: '12px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
                      📍 <strong>समन्वयक:</strong> {c.assigned_coordinator || 'महिला समन्वय कक्ष (प्रतीक्षेत)'} • 📞 {c.coordinator_phone || '1800-120-9900'}<br />
                      📝 <strong>सद्य प्रगती:</strong> {c.counselor_notes || 'प्रकरण प्राथमिक पडताळणी अंतर्गत आहे.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. HISTORICAL INSPIRATIONS & REAL STORIES */}
      <div style={{ maxWidth: '1240px', margin: '4rem auto 0', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ background: '#FCE7F3', color: '#BE185D', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
            प्रेरणास्थान
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1e293b', margin: '0.5rem 0 0.5rem', fontFamily: 'Baloo 2' }}>
            ऐतिहासिक मराठा कर्तृत्ववान स्त्रिया
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
            स्वराज्य, प्रशासन आणि समाजसुधारणेमध्ये युगप्रवर्तक योगदान देणाऱ्या मराठा वीरांगना.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          {INSPIRATIONAL_FIGURES.map((fig, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 24px -4px rgba(0,0,0,0.08)', border: '1px solid #FBCFE8', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '220px', background: '#FDF2F8', overflow: 'hidden' }}>
                <img src={fig.image} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 70%)' }} />
                <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.92)', color: '#9d174d', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 800 }}>
                  {fig.tag}
                </span>
                <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', color: '#fff' }}>
                  <div style={{ fontSize: '0.78rem', color: '#FCE7F3', fontWeight: 600 }}>{fig.period}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>{fig.name}</h3>
                </div>
              </div>
              <div style={{ padding: '1.25rem', flex: 1 }}>
                <div style={{ fontSize: '0.88rem', color: '#be185d', fontWeight: 700, marginBottom: '0.5rem' }}>{fig.title}</div>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>{fig.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 12px 28px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1.5rem', fontFamily: 'Baloo 2', textAlign: 'center' }}>
            🌟 समकालीन मराठा कर्तृत्ववान महिलांच्या यशोगाथा
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {SUCCESS_STORIES.map((story, idx) => (
              <div key={idx} style={{ background: '#FDFCFB', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E8E5E0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '210px', position: 'relative', overflow: 'hidden', background: '#F1F5F9' }}>
                  <img src={story.image} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#FCE7F3', color: '#9D174D', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                    {story.badge}
                  </div>
                </div>
                <div style={{ padding: '1.25rem', flex: 1 }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>{story.name}</h4>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>📍 {story.location} | {story.field}</div>
                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>"{story.achievement}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: CONFIDENTIAL HELP REQUEST ──────────────────────────── */}
      {isHelpModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#be185d', fontFamily: 'Baloo 2' }}>
                  🔒 गोपनीय महिला साहाय्य व समुपदेशन अर्ज
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>आपली माहिती पूर्णपणे सुरक्षित व गोपनीय ठेवली जाते.</div>
              </div>
              <button onClick={() => setIsHelpModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleHelpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.3rem' }}>आपले नाव *</label>
                <input
                  type="text"
                  required
                  value={helpForm.name}
                  onChange={e => setHelpForm({ ...helpForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  placeholder="उदा. सौ. स्नेहल संभाजी भोसले"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={helpForm.phone}
                    onChange={e => setHelpForm({ ...helpForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा *</label>
                  <select
                    value={helpForm.district}
                    onChange={e => setHelpForm({ ...helpForm, district: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    {['पुणे', 'सातारा', 'कोल्हापूर', 'सांगली', 'सोलापूर', 'नाशिक', 'छत्रपती संभाजीनगर', 'मुंबई', 'ठाणे'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.3rem' }}>मदतीचे स्वरूप *</label>
                <select
                  value={helpForm.category}
                  onChange={e => setHelpForm({ ...helpForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="कौटुंबिक व कायदेशीर सल्ला">कौटुंबिक व कायदेशीर सल्ला (Legal Aid)</option>
                  <option value="आर्थिक साहाय्य व उद्योग कर्ज">आर्थिक साहाय्य व उद्योग कर्ज (Bank / SHG Loan)</option>
                  <option value="बचत गट समस्या व अनुदान">बचत गट समस्या व अनुदान (SHG Help)</option>
                  <option value="मानसिक समुपदेशन व आरोग्य">मानसिक समुपदेशन व आरोग्य (Counseling)</option>
                  <option value="रोजगार व कौशल्य प्रशिक्षण">रोजगार व कौशल्य प्रशिक्षण (Jobs & Skills)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.3rem' }}>अडचणीचा तपशील *</label>
                <textarea
                  rows={3}
                  required
                  value={helpForm.description}
                  onChange={e => setHelpForm({ ...helpForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  placeholder="आपली अडचण किंवा आवश्यक मार्गदर्शन सविस्तर लिहा..."
                />
              </div>

              <button
                type="submit"
                style={{ background: '#be185d', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                गोपनीय अर्ज सादर करा (Submit Securely)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REGISTER ENTREPRENEUR ───────────────────────── */}
      {isRegisterEntModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '540px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#be185d', fontFamily: 'Baloo 2' }}>
                🌸 महिला उद्योजक नोंदणी
              </h3>
              <button onClick={() => setIsRegisterEntModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEntSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>उद्योजिकेचे नाव *</label>
                <input
                  type="text"
                  required
                  value={entForm.name}
                  onChange={e => setEntForm({ ...entForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. सौ. रोहिणी मोरे"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>व्यवसायाचे नाव *</label>
                <input
                  type="text"
                  required
                  value={entForm.businessName}
                  onChange={e => setEntForm({ ...entForm, businessName: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. शिवमुद्रा फूड्स"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>श्रेणी *</label>
                  <select
                    value={entForm.category}
                    onChange={e => setEntForm({ ...entForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="खाद्यपदार्थ व कृषी प्रक्रिया">खाद्यपदार्थ व कृषी प्रक्रिया</option>
                    <option value="वस्त्रोद्योग व फॅशन">वस्त्रोद्योग व फॅशन</option>
                    <option value="IT व व्यावसायिक सेवा">IT व व्यावसायिक सेवा</option>
                    <option value="आरोग्य व निसर्गोपचार">आरोग्य व निसर्गोपचार</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा *</label>
                  <input
                    type="text"
                    required
                    value={entForm.district}
                    onChange={e => setEntForm({ ...entForm, district: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. पुणे"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                <input
                  type="tel"
                  required
                  value={entForm.contactPhone}
                  onChange={e => setEntForm({ ...entForm, contactPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. 9822XXXXXX"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>व्यवसायाचे वर्णन *</label>
                <textarea
                  rows={2}
                  required
                  value={entForm.description}
                  onChange={e => setEntForm({ ...entForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <button
                type="submit"
                style={{ background: '#be185d', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                नोंदणी पूर्ण करा
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: REGISTER SHG ─────────────────────────────────── */}
      {isRegisterShgModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '540px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#15803d', fontFamily: 'Baloo 2' }}>
                🤝 महिला बचत गट नोंदणी
              </h3>
              <button onClick={() => setIsRegisterShgModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleShgSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>बचत गटाचे नाव *</label>
                <input
                  type="text"
                  required
                  value={shgForm.shgName}
                  onChange={e => setShgForm({ ...shgForm, shgName: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. जिजाऊ महिला स्वावलंबन बचत गट"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>अध्यक्ष नाव *</label>
                  <input
                    type="text"
                    required
                    value={shgForm.presidentName}
                    onChange={e => setShgForm({ ...shgForm, presidentName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={shgForm.phone}
                    onChange={e => setShgForm({ ...shgForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा *</label>
                  <input
                    type="text"
                    required
                    value={shgForm.district}
                    onChange={e => setShgForm({ ...shgForm, district: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>तालुका *</label>
                  <input
                    type="text"
                    required
                    value={shgForm.taluka}
                    onChange={e => setShgForm({ ...shgForm, taluka: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>उद्योग / व्यवसाय प्रकार *</label>
                <input
                  type="text"
                  required
                  value={shgForm.activityType}
                  onChange={e => setShgForm({ ...shgForm, activityType: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. गावरान हळद प्रक्रिया व मसाले निर्मिती"
                />
              </div>
              <button
                type="submit"
                style={{ background: '#15803d', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                बचत गट नोंदणी करा
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: ADD PRODUCT MARKETPLACE ──────────────────────── */}
      {isAddProductModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#be185d', fontFamily: 'Baloo 2' }}>
                🛍️ महिला बाजारात उत्पादन जोडा
              </h3>
              <button onClick={() => setIsAddProductModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>उत्पादनाचे नाव *</label>
                <input
                  type="text"
                  required
                  value={productForm.productName}
                  onChange={e => setProductForm({ ...productForm, productName: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. अस्सल येवला पैठणी साडी"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>किंमत (₹) *</label>
                  <input
                    type="text"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. ₹५५०"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>युनिट *</label>
                  <input
                    type="text"
                    required
                    value={productForm.unit}
                    onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="प्रति नग / किलो"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>विक्रेता / ब्रँड नाव *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sellerName}
                    onChange={e => setProductForm({ ...productForm, sellerName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={productForm.contactPhone}
                    onChange={e => setProductForm({ ...productForm, contactPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>उत्पादनाचे वर्णन</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <button
                type="submit"
                style={{ background: '#be185d', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                उत्पादन बाजारात जोडा
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: BOOK MENTOR SESSION ──────────────────────────── */}
      {bookingMentorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#be185d', fontFamily: 'Baloo 2' }}>
                  🗓️ मार्गदर्शन सत्र निश्चित करा
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  मार्गदर्शक: <strong>{bookingMentorModal.name}</strong> ({bookingMentorModal.title})
                </div>
              </div>
              <button onClick={() => setBookingMentorModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleMentorBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>आपले पूर्ण नाव *</label>
                <input
                  type="text"
                  required
                  value={mentorBookingForm.applicantName}
                  onChange={e => setMentorBookingForm({ ...mentorBookingForm, applicantName: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="उदा. प्रियांका मोहिते"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={mentorBookingForm.phone}
                    onChange={e => setMentorBookingForm({ ...mentorBookingForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा *</label>
                  <input
                    type="text"
                    required
                    value={mentorBookingForm.district}
                    onChange={e => setMentorBookingForm({ ...mentorBookingForm, district: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>मार्गदर्शनाचा मुख्य विषय *</label>
                <input
                  type="text"
                  required
                  value={mentorBookingForm.topic}
                  onChange={e => setMentorBookingForm({ ...mentorBookingForm, topic: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem' }}>थोडक्यात पार्श्वभूमी व प्रश्न</label>
                <textarea
                  rows={2}
                  value={mentorBookingForm.notes}
                  onChange={e => setMentorBookingForm({ ...mentorBookingForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="आपल्याला मेंटॉर्कडून कोणत्या मुद्द्यांवर सल्ला हवा आहे?"
                />
              </div>
              <button
                type="submit"
                style={{ background: '#be185d', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                सत्र नोंदणी निश्चित करा
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
