import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CMDB from '../../services/cmdb';

// ==========================================
// ENTERPRISE ROLE DEFINITIONS (WHITE & ORANGE THEME)
// ==========================================
const ROLES = {
  super_admin: {
    id: 'super_admin',
    name: 'केंद्रीय सुपर ॲडमिन (Super Admin)',
    badge: '👑 ALL ACCESS',
    color: '#ea580c',
    description: 'सर्व ३६ जिल्हे, वित्त, डेटाबेस, ऑडिट व सुरक्षा नियंत्रण',
    allowedViews: ['dashboard', 'reports', 'ceo', 'district', 'members', 'chapter', 'referrals', 'businesses', 'leads', 'seva', 'scholarships', 'finance', 'approvals', 'audit', 'admins', 'settings'],
  },
  ceo: {
    id: 'ceo',
    name: 'कार्याध्यक्ष / राज्य अध्यक्ष (Executive CEO)',
    badge: '🦅 STATE EXECUTIVE',
    color: '#c2410c',
    description: 'राज्यस्तरीय ₹ Cr व्यवसाय वृद्धी, ६ विभाग, B2B deal pipelines',
    allowedViews: ['ceo', 'reports', 'dashboard', 'chapters', 'referrals', 'businesses', 'finance', 'leads'],
  },
  district_admin: {
    id: 'district_admin',
    name: 'जिल्हा समन्वयक (District President)',
    badge: '📍 DISTRICT LEVEL',
    color: '#ea580c',
    description: 'जिल्ह्यातील सदस्य पडताळणी, तालुका समन्वय व तक्रार निवारण कक्ष',
    allowedViews: ['district', 'reports', 'members', 'businesses', 'chapters', 'seva'],
  },
  chapter_president: {
    id: 'chapter_president',
    name: 'चॅप्टर अध्यक्ष (Chapter President)',
    badge: '💼 CHAPTER B2B',
    color: '#f97316',
    description: 'रेफरल स्लिप्स, १-ते-१ भेटी, TYFCB प्रत्यक्ष व्यवसाय व उपस्थिती',
    allowedViews: ['chapter', 'reports', 'referrals', 'businesses', 'leads'],
  },
  seva_head: {
    id: 'seva_head',
    name: 'समाज साहाय्य समन्वयक (Seva Helpdesk)',
    badge: '🩺 24x7 SEVA',
    color: '#c2410c',
    description: '२४x७ आपत्कालीन रक्तदाता समन्वय, रुग्ण साहाय्य व विद्यार्थी शिष्यवृत्ती',
    allowedViews: ['seva', 'reports', 'scholarships', 'members'],
  },
  finance_officer: {
    id: 'finance_officer',
    name: 'वित्त व ऑडिट अधिकारी (Finance & Audit)',
    badge: '📒 AUDIT & LEDGER',
    color: '#9a3412',
    description: 'Section 8 वित्तीय ऑडिट, वर्गणी महसूल, देणगी पावत्या व व्हाउचर मंजुरी',
    allowedViews: ['finance', 'reports', 'approvals', 'audit', 'dashboard'],
  }
};

const NAVIGATION_GROUPS = [
  {
    group: 'मुख्य नियंत्रण व अहवाल (Core & Reports)',
    items: [
      { id: 'dashboard', label: '📊 केंद्रीय डॅशबोर्ड', icon: '📊' },
      { id: 'reports', label: '📈 तपशीलवार महा-अहवाल केंद्र (7-Filter Reports)', icon: '📈' },
      { id: 'ceo', label: '🦅 CEO Macro Dashboard (Cr)', icon: '🦅' },
    ]
  },
  {
    group: 'समुदाय व पडताळणी (Community)',
    items: [
      { id: 'district', label: '📍 जिल्हा पडताळणी कक्ष (KYC)', icon: '📍' },
      { id: 'members', label: '👥 सदस्य निर्देशिका (360°)', icon: '👥' },
    ]
  },
  {
    group: 'व्यवसाय संगम (Business)',
    items: [
      { id: 'chapter', label: '💼 चॅप्टर अध्यक्ष डेस्क', icon: '💼' },
      { id: 'referrals', label: '🤝 रेफरल इंजिन (TYFCB)', icon: '🤝' },
      { id: 'businesses', label: '🏢 व्यवसाय नोंदी', icon: '🏢' },
      { id: 'leads', label: '🎯 CRM Leads & Deals', icon: '🎯' },
    ]
  },
  {
    group: 'सेवा व साहाय्य (Seva)',
    items: [
      { id: 'seva', label: '🩸 २४x७ आपत्कालीन रक्तपेढी', icon: '🩸' },
      { id: 'scholarships', label: '🎓 विद्यार्थी शिक्षण साहाय्य', icon: '🎓' },
    ]
  },
  {
    group: 'वित्त व ऑडिट (Finance)',
    items: [
      { id: 'finance', label: '📒 आर्थिक अहवाल व लेजर', icon: '📒' },
      { id: 'approvals', label: '✅ व्हाउचर मंजुरी (Approvals)', icon: '✅' },
    ]
  },
  {
    group: 'प्रशासन व सुरक्षा (Admin & Security)',
    items: [
      { id: 'admins', label: '🛡️ व्यवस्थापक व भूमिका (Admins)', icon: '🛡️' },
      { id: 'audit', label: '🗂️ Audit Trail & Logs', icon: '🗂️' },
      { id: 'settings', label: '⚙️ सिस्टीम कॉन्फिगरेशन', icon: '⚙️' }
    ]
  }
];

export default function AdminERPPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect role from route
  const getInitialRole = () => {
    const p = location.pathname;
    if (p.includes('/district')) return 'district_admin';
    if (p.includes('/chapter')) return 'chapter_president';
    if (p.includes('/helpdesk') || p.includes('/seva')) return 'seva_head';
    if (p.includes('/ceo')) return 'ceo';
    return 'super_admin';
  };

  const [activeRole, setActiveRole] = useState(getInitialRole());
  const [activeView, setActiveView] = useState(() => {
    const p = location.pathname;
    if (p.includes('/reports')) return 'reports';
    if (p.includes('/district')) return 'district';
    if (p.includes('/chapter')) return 'chapter';
    if (p.includes('/helpdesk') || p.includes('/seva')) return 'seva';
    if (p.includes('/ceo')) return 'ceo';
    return 'dashboard';
  });

  const [selectedScope, setSelectedScope] = useState('maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('pune');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleRoleNavigate = (roleId) => {
    if (roleId === 'ceo') {
      navigate('/crm/ceo');
    } else if (roleId === 'district_admin') {
      navigate('/crm/district');
    } else if (roleId === 'chapter_president') {
      navigate('/crm/chapter');
    } else if (roleId === 'seva_head') {
      navigate('/crm/helpdesk');
    } else {
      setActiveRole(roleId);
    }
  };

  // Modals States
  const [selectedApplicantDossier, setSelectedApplicantDossier] = useState(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);

  // 1. SUPER ADMIN DATA
  const [adminUsers, setAdminUsers] = useState([
    { id: 'ADM-01', name: 'डॉ. विजयसिंह मोहिते-पाटील', email: 'vmp@connectmaratha.org', phone: '+91 98220 11223', role: 'super_admin', roleName: 'केंद्रीय सुपर ॲडमिन', scope: 'संपूर्ण महाराष्ट्र राज्य', lastLogin: 'आत्ताच (Active)', twoFa: 'सक्रिय (SMS + TOTP)', status: 'Active' },
    { id: 'ADM-02', name: 'अशोकराव संभाजी जगताप', email: 'ashok.j@connectmaratha.org', phone: '+91 94223 44556', role: 'ceo', roleName: 'कार्याध्यक्ष (Executive CEO)', scope: '६ महसूल विभाग', lastLogin: '१२ मिनिटांपूर्वी', twoFa: 'सक्रिय (TOTP)', status: 'Active' },
    { id: 'ADM-03', name: 'दिलीपराव यशवंत कदम', email: 'pune.dist@connectmaratha.org', phone: '+91 98901 22334', role: 'district_admin', roleName: 'पुणे जिल्हा समन्वयक', scope: 'पुणे जिल्हा (हवेली, बारामती, इ.)', lastLogin: '३० मिनिटांपूर्वी', twoFa: 'सक्रिय (SMS)', status: 'Active' },
    { id: 'ADM-04', name: 'तानाजी विठ्ठलराव जाधव', email: 'shivneri.b2b@connectmaratha.org', phone: '+91 97654 33221', role: 'chapter_president', roleName: 'शिवनेरी चॅप्टर अध्यक्ष', scope: 'पुणे शिवनेरी B2B', lastLogin: '१ तासापूर्वी', twoFa: 'सक्रिय (SMS)', status: 'Active' },
    { id: 'ADM-05', name: 'डॉ. नीलेश सावंत (M.D.)', email: 'seva.help@connectmaratha.org', phone: '+91 98230 99887', role: 'seva_head', roleName: 'समाज साहाय्य प्रमुख', scope: 'राज्य आपत्कालीन रक्तपेढी', lastLogin: '५ मिनिटांपूर्वी', twoFa: 'सक्रिय (TOTP)', status: 'Active' },
    { id: 'ADM-06', name: 'सीए मंदार कुलकर्णी (FCA)', email: 'audit@connectmaratha.org', phone: '+91 98221 77665', role: 'finance_officer', roleName: 'मुख्य वित्त व ऑडिट अधिकारी', scope: 'Sec 8 ट्रेझरी व लेजर', lastLogin: '२ तासांपूर्वी', twoFa: 'सक्रिय (Hardware Key)', status: 'Active' }
  ]);

  const [systemSettings, setSystemSettings] = useState({
    membershipFee: 500,
    chapterAnnualFee: 12000,
    dpdpConsentRetentionYears: 3,
    emergencySmsGateway: true,
    aiKycAutoConfidenceThreshold: 85,
    maintenanceMode: false
  });

  // 2. EXECUTIVE CEO DATA
  const [divisionsData, setDivisionsData] = useState([
    { id: 'div-pune', name: 'पुणे विभाग (Western Maharashtra)', vpName: 'उदयसिंह पाटील', districts: 'पुणे, सातारा, कोल्हापूर, सांगली, सोलापूर', members: '१२,४५०', chapters: 68, revenueCr: 58.4, targetCr: 60.0, yoyGrowth: '+१६.४%', rating: 'A+ Platinum' },
    { id: 'div-konkan', name: 'कोकण विभाग (Mumbai, MMR & Coastal)', vpName: 'प्रवीण संभाजी भोसले', districts: 'मुंबई शहर, उपनगर, ठाणे, पालघर, रायगड, रत्नागिरी, सिंधुदुर्ग', members: '८,९२०', chapters: 52, revenueCr: 62.1, targetCr: 65.0, yoyGrowth: '+१८.२%', rating: 'A+ Platinum' },
    { id: 'div-nashik', name: 'नाशिक विभाग (North Maharashtra)', vpName: 'तानाजी गायकवाड', districts: 'नाशिक, अहमदनगर, धुळे, जळगाव, नंदुरबार', members: '४,१५०', chapters: 28, revenueCr: 28.5, targetCr: 30.0, yoyGrowth: '+११.८%', rating: 'A Grade' },
    { id: 'div-csn', name: 'छत्रपती संभाजीनगर विभाग (Marathwada)', vpName: 'दिग्विजय कदम', districts: 'संभाजीनगर, जालना, बीड, परभणी, नांदेड, उस्मानाबाद, लातूर, हिंगोली', members: '३,४००', chapters: 22, revenueCr: 21.2, targetCr: 25.0, yoyGrowth: '+१४.१%', rating: 'A Grade' },
    { id: 'div-amravati', name: 'अमरावती विभाग (West Vidarbha)', vpName: 'गजानन देशमुख', districts: 'अमरावती, अकोला, यवतमाळ, बुलढाणा, वाशिम', members: '२,१००', chapters: 14, revenueCr: 12.6, targetCr: 15.0, yoyGrowth: '+९.५%', rating: 'B+ Gold' },
    { id: 'div-nagpur', name: 'नागपूर विभाग (East Vidarbha)', vpName: 'विश्वासराव मोरे', districts: 'नागपूर, वर्धा, भंडारा, गोंदिया, चंद्रपूर, गडचिरोली', members: '१,८००', chapters: 11, revenueCr: 10.8, targetCr: 12.0, yoyGrowth: '+८.७%', rating: 'B+ Gold' }
  ]);

  const [strategicDeals, setStrategicDeals] = useState([
    { id: 'DEAL-901', name: 'महाराष्ट्र कृषी निर्यात महासंघ (Cold Chain Logistics)', sector: 'Agri-Processing & Cold Chain', partner: 'महाराष्ट्र सहकार विभाग व खाजगी निर्यातदार', valueCr: '₹२४.५ Cr', stage: 'MoU Signed', lead: 'अशोकराव जगताप (CEO)', progress: 75 },
    { id: 'DEAL-902', name: 'मराठा उद्योग भवन — नवी मुंबई (Tech Hub)', sector: 'Commercial Real Estate & Coworking', partner: 'CIDCO & शिवनेरी इन्व्हेस्टमेंट ट्रस्ट', valueCr: '₹५२.० Cr', stage: 'DPR Approved', lead: 'डॉ. विजयसिंह मोहिते-पाटील', progress: 50 },
    { id: 'DEAL-903', name: 'सह्याद्री ग्रीन एनर्जी सोलर पार्क (१५ MW)', sector: 'Renewable Clean Energy', partner: 'महावितरण व ५० शेतकरी समूह', valueCr: '₹१८.२ Cr', stage: 'Commercial Tender', lead: 'दिलीपराव कदम', progress: 90 },
    { id: 'DEAL-904', name: 'युवा मराठा ग्लोबल स्किल्स व रोजगार करार', sector: 'EdTech & Vocational Placement', partner: 'जर्मन-इंडो स्किल कौन्सिल', valueCr: '₹६.५ Cr', stage: 'Operational', lead: 'तानाजी जाधव', progress: 100 }
  ]);

  // 3. DISTRICT COORDINATOR DATA
  const [talukaSummary, setTalukaSummary] = useState([
    { taluka: 'हवेली (Pune Rural)', incharge: 'संदीप जगताप', members: 3420, pendingKyc: 18, mandals: 16, rating: 'उत्कृष्ट' },
    { taluka: 'पुणे शहर मध्य (City Core)', incharge: 'अजित मोहिते', members: 4210, pendingKyc: 24, mandals: 22, rating: 'उत्कृष्ट' },
    { taluka: 'बारामती (Baramati)', incharge: 'तानाजी सावंत', members: 1840, pendingKyc: 6, mandals: 10, rating: 'उत्तम' },
    { taluka: 'शिरूर (Shirur MIDC)', incharge: 'संजय थोरात', members: 1620, pendingKyc: 11, mandals: 8, rating: 'उत्तम' },
    { taluka: 'मावळ (Maval & Talegaon)', incharge: 'गणेश घारे', members: 1360, pendingKyc: 7, mandals: 6, rating: 'मध्यम' }
  ]);

  const [members, setMembers] = useState([
    {
      id: 'M-10291',
      name: 'तानाजी विठ्ठलराव जाधव',
      fatherName: 'विठ्ठलराव तुकाराम जाधव',
      mobile: '+91 98221 44550',
      email: 'tanaji.j@agrifarm.in',
      taluka: 'हवेली',
      village: 'उरुळी कांचन',
      district: 'pune',
      profession: 'शेतीमाल प्रक्रिया व निर्यात',
      company: 'सह्याद्री ॲग्रो फूड्स प्रा. लि.',
      annualTurnover: '₹१.८ कोटी',
      applyDate: '१९ सप्टें २०२६, ०९:३० AM',
      status: 'प्रलंबित',
      idCardType: 'Aadhaar + Voting + 7/12',
      aadhaarMasked: 'XXXX-XXXX-4829',
      voterId: 'MT/42/240/019283',
      businessRegNo: 'UDYAM-MH-26-0048123',
      address: 'प्लॉट नं. १४, शिवकृपा कॉलनी, उरुळी कांचन, हवेली, पुणे ४१२२०२',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      notes: 'कागदपत्रे सुस्पष्ट आहेत. स्थानिक मंडळ प्रमुखांची शिफारस जोडली आहे.'
    },
    {
      id: 'M-10292',
      name: 'प्रवीण संभाजी जगताप',
      fatherName: 'संभाजी बाबुराव जगताप',
      mobile: '+91 94220 99881',
      email: 'pravin.jagtap@infra.com',
      taluka: 'पुणे शहर मध्य',
      village: 'सदाशिव पेठ',
      district: 'pune',
      profession: 'सिव्हिल कॉन्ट्रॅक्टर',
      company: 'जगताप इन्फ्राकॉन & बिल्डर्स',
      annualTurnover: '₹४.२ कोटी',
      applyDate: '१९ सप्टें २०२६, १०:१५ AM',
      status: 'प्रलंबित',
      idCardType: 'Aadhaar + PWD Contractor License',
      aadhaarMasked: 'XXXX-XXXX-9102',
      voterId: 'MT/42/241/887123',
      businessRegNo: 'PWD-MH-CL2-8819',
      address: 'फ्लॅट ४०२, शिवमुद्रा रेसिडेन्सी, सदाशिव पेठ, पुणे ४११०३०',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      notes: 'PWD परवाना वर्ग-२ अपलोड केला आहे.'
    },
    {
      id: 'M-10293',
      name: 'सुप्रिया सचिन साळुंखे',
      fatherName: 'सचिन आनंदराव साळुंखे',
      mobile: '+91 97654 11220',
      email: 'supriya.foods@gmail.com',
      taluka: 'बारामती',
      village: 'माळेगाव',
      district: 'pune',
      profession: 'महिला बचतगट प्रमुख व केटरिंग',
      company: 'राजमाता महिला गृहउद्योग',
      annualTurnover: '₹६५ लाख',
      applyDate: '१८ सप्टें २०२६',
      status: 'सत्यापित',
      idCardType: 'Aadhaar + PAN + FSSAI',
      aadhaarMasked: 'XXXX-XXXX-3341',
      voterId: 'MT/42/245/661902',
      businessRegNo: 'FSSAI-1152402900018',
      address: 'माळेगाव बुद्रुक, बारामती, पुणे ४१३११५',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      notes: 'KYC संपूर्ण मंजूर. डिजिटल ओळखपत्र जारी करण्यात आले.'
    },
    {
      id: 'M-10294',
      name: 'दिग्विजय यशवंत कदम',
      fatherName: 'यशवंत रामचंद्र कदम',
      mobile: '+91 98900 33441',
      email: 'kadam.trans@rediffmail.com',
      taluka: 'कराड',
      village: 'मलकापूर',
      district: 'satara',
      profession: 'ट्रान्सपोर्ट व लॉजिस्टिक',
      company: 'यशवंत रोडलाईन्स',
      annualTurnover: '₹२.१ कोटी',
      applyDate: '१८ सप्टें २०२६',
      status: 'प्रलंबित',
      idCardType: 'Aadhaar + GST',
      aadhaarMasked: 'XXXX-XXXX-6721',
      voterId: 'MT/43/210/118239',
      businessRegNo: '27AAFPK1290C1Z4',
      address: 'मलकापूर फाटा, कराड, सातारा ४१५५३९',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      notes: 'GST नंबर वैध आहे. रस्ता परिवहन महासंघ सदस्य.'
    },
    {
      id: 'M-10295',
      name: 'उदयराज बाळासाहेब सावंत',
      fatherName: 'बाळासाहेब संभाजी सावंत',
      mobile: '+91 98229 55667',
      email: 'uday.auto@gmail.com',
      taluka: 'करवीर',
      village: 'शिरोली MIDC',
      district: 'kolhapur',
      profession: 'ऑटोमोबाईल सर्व्हिस सेंटर',
      company: 'सावंत ऑटोवर्क्स & स्पेअर्स',
      annualTurnover: '₹१.१ कोटी',
      applyDate: '१७ सप्टें २०२६',
      status: 'सत्यापित',
      idCardType: 'Aadhaar + Shop Act',
      aadhaarMasked: 'XXXX-XXXX-1129',
      voterId: 'MT/44/220/998124',
      businessRegNo: 'KMC-SHOP-2024-991',
      address: 'शिरोली एमआयडीसी, करवीर, कोल्हापूर ४१६१२२',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      notes: 'सर्व कागदपत्रे तपासली गेली.'
    }
  ]);

  const [grievances, setGrievances] = useState([
    { id: 'GRV-301', complainant: 'तानाजी शिंदे (शेतकरी)', taluka: 'हवेली', category: 'महसूल / ७/१२ फेरफार अडचण', priority: '🔴 उच्च', officer: 'संदीप जगताप', status: 'तपासणीत', date: '१८ सप्टें २०२६' },
    { id: 'GRV-302', complainant: 'सुप्रिया मोहिते (विद्यार्थिनी)', taluka: 'पुणे शहर', category: 'जात वैधता प्रमाणपत्र (Caste Validity)', priority: '🔴 उच्च', officer: 'अजित मोहिते', status: 'उघडे', date: '१९ सप्टें २०२६' },
    { id: 'GRV-303', complainant: 'महेश कदम (उद्योजक)', taluka: 'शिरूर MIDC', category: 'स्थानिक औद्योगिक वीज समस्या', priority: '🟡 मध्यम', officer: 'संजय थोरात', status: 'निकाली', date: '१६ सप्टें २०२६' }
  ]);

  // 4. CHAPTER PRESIDENT DATA
  const [chapterDetails, setChapterDetails] = useState({
    name: 'पुणे – शिवनेरी व्यवसाय मंडळ (Shivneri Chapter)',
    president: 'तानाजी विठ्ठलराव जाधव',
    vicePresident: 'विक्रम संभाजी पाटील',
    treasurer: 'सीए महेश शिंदे',
    meetingSchedule: 'दर गुरुवारी सकाळी ०७:३० ते ०९:०० (Breakfast Meeting)',
    venue: 'हॉटेल प्राईड एक्झिक्युटिव्ह, शिवाजीनगर, पुणे',
    totalMembers: 48,
    ytdBusinessCr: 8.4,
    weeklyAttendancePct: 94,
    oneToOneMeetings: 680
  });

  const [referrals, setReferrals] = useState([
    {
      id: 'REF-201',
      giver: 'अमोल जाधव (IT Cloud & Software)',
      receiver: 'विक्रम पाटील (Civil Construction)',
      clientName: 'श्री. राजेश बांदल',
      clientCompany: 'बांदल रेसिडेन्सी LLP',
      clientPhone: '+91 98220 55112',
      requirement: 'नवीन ५ मजली कमर्शियल कॉम्प्लेक्सचे स्ट्रक्चरल डिझाईन व सिव्हिल कंत्राट',
      amount: '₹४.५ लाख',
      numericValue: 450000,
      refType: 'Chapter Internal',
      temperature: '🔴 Hot Deal',
      date: '१८ सप्टें २०२६',
      stage: 'Closed Won (TYFCB)',
      status: 'Closed Won',
      tyfcbAmount: '₹४,५०,०००'
    },
    {
      id: 'REF-202',
      giver: 'महेश शिंदे (CA & Tax Advisory)',
      receiver: 'उदयराज सावंत (Auto Components)',
      clientName: 'सचिन गायकवाड',
      clientCompany: 'गायकवाड प्रीसिजन टूल्स',
      clientPhone: '+91 94221 88990',
      requirement: 'कंपनी व्हॅल्यूएशन, प्रायव्हेट लिमिटेड रूपांतरण व GST इन्व्हेस्टमेंट ऑडिट',
      amount: '₹१.२ लाख',
      numericValue: 120000,
      refType: 'Outside Network',
      temperature: '🟠 Warm Opportunity',
      date: '१८ सप्टें २०२६',
      stage: 'Proposal Submitted',
      status: 'In Discussion',
      tyfcbAmount: '—'
    },
    {
      id: 'REF-203',
      giver: 'सुप्रिया साळुंखे (Organic Foods)',
      receiver: 'अविनाश भोसले (Hotelier & Banquets)',
      clientName: 'अविनाश भोसले (स्वतःचे हॉटेल)',
      clientCompany: 'हॉटेल शिवनेरी पॅलेस (३ शाखा)',
      clientPhone: '+91 97654 77110',
      requirement: '३ हॉटेल्ससाठी दरमहा सेंद्रिय मसाले, शुद्ध तूप व गावरान धान्य पुरवठा करार',
      amount: '₹२.८ लाख / महिना',
      numericValue: 280000,
      refType: 'Chapter Internal',
      temperature: '🔴 Hot Deal',
      date: '१७ सप्टें २०२६',
      stage: 'Closed Won (TYFCB)',
      status: 'Closed Won',
      tyfcbAmount: '₹२,८०,०००'
    }
  ]);

  const [oneToOneMeetings, setOneToOneMeetings] = useState([
    { id: '1TO1-81', member1: 'अमोल जाधव (IT)', member2: 'विक्रम पाटील (Civil)', date: '१५ सप्टें २०२६', place: 'हॉटेल प्राईड', synergy: 'स्मार्ट होम ऑटोमेशन व सिव्हिल इंटिग्रेशनमध्ये संयुक्त बोली सादर करणे', verified: 'होय' },
    { id: '1TO1-82', member1: 'महेश शिंदे (CA)', member2: 'सुप्रिया साळुंखे (Organic)', date: '१४ सप्टें २०२६', place: 'कॅफे फर्ग्युसन', synergy: 'महिला उद्योजक नाबार्ड अनुदान व FSSAI सबसिडी प्रस्ताव तयार करणे', verified: 'होय' }
  ]);

  const [newReferralForm, setNewReferralForm] = useState({
    giver: 'तानाजी जाधव (सह्याद्री ॲग्रो)',
    receiver: 'विक्रम पाटील (Civil Construction)',
    clientName: '',
    clientPhone: '',
    clientCompany: '',
    requirement: '',
    amount: '',
    temperature: '🔴 Hot Deal',
    refType: 'Chapter Internal'
  });

  // 5. SEVA HELPDESK DATA
  const [bloodRequests, setBloodRequests] = useState([
    {
      id: 'BLD-401',
      patient: 'सुमित्रा संभाजी कदम',
      ageGender: '५८ वर्षे / महिला',
      group: 'O- Negative (दुर्मीळ)',
      rhFactor: 'Rh Negative',
      hospital: 'ससून सर्वोपचार रुग्णालय, पुणे',
      wardBed: 'ICU वॉर्ड ३, बेड नं. १२',
      city: 'पुणे',
      units: '२ युनिट्स PRBC',
      urgency: '🔴 तात्काळ (२ तासात)',
      reason: 'आपत्कालीन कार्डियाक बायपास शस्त्रक्रिया',
      contactPerson: 'अमोल कदम (मुलगा)',
      contactPhone: '+91 98221 66554',
      status: 'Pending',
      statusText: 'रक्तदाता शोध सुरू...',
      donor: 'शोध सुरू...',
      dispatcher: 'डॉ. नीलेश सावंत'
    },
    {
      id: 'BLD-402',
      patient: 'विक्रम तानाजी भोसले',
      ageGender: '३२ वर्षे / पुरुष',
      group: 'AB+ Positive',
      rhFactor: 'Rh Positive',
      hospital: 'दीनानाथ मंगेशकर रुग्णालय, पुणे',
      wardBed: 'ऑर्थोपेडिक वॉर्ड, बेड ८',
      city: 'पुणे',
      units: '१ युनिट प्लेटलेट्स',
      urgency: '🟠 तातडीने (६ तासात)',
      reason: 'रस्ता अपघात – फ्रॅक्चर सर्जरी',
      contactPerson: 'संदीप भोसले (भाऊ)',
      contactPhone: '+91 94220 33221',
      status: 'Assigned',
      statusText: 'रक्तदाता रवाना झाला',
      donor: 'अमोल मोहिते (+91 98221 14455)',
      dispatcher: 'डॉ. नीलेश सावंत'
    },
    {
      id: 'BLD-403',
      patient: 'राजेंद्र विश्वासराव मोरे',
      ageGender: '४५ वर्षे / पुरुष',
      group: 'B+ Positive',
      rhFactor: 'Rh Positive',
      hospital: 'CPR शासकीय रुग्णालय, कोल्हापूर',
      wardBed: 'मेडिसिन वॉर्ड ५, बेड २२',
      city: 'कोल्हापूर',
      units: '३ युनिट्स संपूर्ण रक्त',
      urgency: '🟡 नियमित (२४ तास)',
      reason: 'थॅलेसेमिया नियमित रक्त संक्रमण',
      contactPerson: 'राजश्री मोरे (पत्नी)',
      contactPhone: '+91 98901 88776',
      status: 'Fulfilled',
      statusText: 'रक्त उपलब्ध झाले (यशस्वी)',
      donor: 'कोल्हापूर मराठा रक्तपेढी पथक',
      dispatcher: 'तानाजी सावंत'
    }
  ]);

  const [scholarships, setScholarships] = useState([
    {
      id: 'SCH-101',
      studentName: 'अनिकेत संभाजी पाटील',
      nativeDistrict: 'सातारा (पाटण)',
      courseCollege: 'COEP पुणे – बी.टेक (कॉम्प्युटर सायन्स)',
      academicScore: '९८.२% MHT-CET',
      familyIncome: '₹६५,००० / वर्ष (अल्पभूधारक शेतकरी)',
      sanctionedAmount: '₹३५,०००',
      sponsorTrust: 'मराठा विद्याप्रसारक निधी पुणे',
      status: 'Approved',
      statusText: 'मंजूर (फी थेट कॉलेजला अदा)'
    },
    {
      id: 'SCH-102',
      studentName: 'प्रियांका विलासराव मोहिते',
      nativeDistrict: 'बीड (आष्टी)',
      courseCollege: 'बी.जे. शासकीय मेडिकल कॉलेज, पुणे – MBBS',
      academicScore: '६४०/७२० NEET-UG',
      familyIncome: '₹८०,००० / वर्ष (ऊसतोड कामगार कुटुंब)',
      sanctionedAmount: '₹५०,०००',
      sponsorTrust: 'छत्रपती संभाजी महाराज शिक्षण निधी',
      status: 'Approved',
      statusText: 'मंजूर (वसतिगृह व पुस्तक निधी)'
    }
  ]);

  const [bloodDispatchForm, setBloodDispatchForm] = useState({
    patient: '',
    group: 'O- Negative',
    hospital: '',
    city: 'पुणे',
    units: '१ युनिट',
    urgency: '🔴 तात्काळ (२ तासात)',
    reason: '',
    contactPerson: '',
    contactPhone: ''
  });

  // 6. FINANCE & AUDIT DATA
  const [financialSummary, setFinancialSummary] = useState({
    totalCorpusCr: 4.82,
    annualSubscriptionLakhs: 124.5,
    fortConservationLakhs: 85.4,
    scholarshipFundLakhs: 62.8,
    disbursedExpensesLakhs: 42.3,
    netBalanceCr: 6.24,
    panTaxExemption: 'Section 80G / 12A Valid till 2028',
    bankAccount: 'State Bank of India — Shivajinagar Branch (A/C: 40912800192)'
  });

  const [vouchers, setVouchers] = useState([
    {
      id: 'VCH-801',
      year: '2026',
      month: '09',
      week: 'Week 38',
      day: '19',
      userId: 'ADM-02',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      raisedBy: 'प्रवीण जगताप (किल्ले संवर्धन समिती प्रमुख)',
      dept: 'दुर्ग संवर्धन व इतिहास विभाग',
      category: 'राजगड व तोरणा दुर्ग संवर्धन साहित्य व फलक',
      amount: '₹१,२५,०००',
      vendorName: 'सह्याद्री मेटल क्राफ्ट्स, पुणे',
      billNo: 'INV-SMC-2026-89',
      supportingDoc: 'राजगड_संवर्धन_जीएसटी_बिल.pdf',
      status: 'Pending Approval',
      level: 'Level 2 (Finance Sign-off Required)'
    },
    {
      id: 'VCH-802',
      year: '2026',
      month: '09',
      week: 'Week 38',
      day: '18',
      userId: 'ADM-05',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      raisedBy: 'डॉ. नीलेश सावंत (समाज साहाय्य)',
      dept: '२४x७ आपत्कालीन रुग्ण व रक्तपेढी कक्ष',
      category: 'इमर्जन्सी रुग्णवाहिका इंधन व ऑक्सिजन सिलिंडर बिल',
      amount: '₹४२,५००',
      vendorName: 'पुणे गॅसेस & मेडिकेअर सर्व्हिसेस',
      billNo: 'PGM-7712',
      supportingDoc: 'मेडीकेअर_सिलिंडर_पावती.pdf',
      status: 'Pending Approval',
      level: 'Level 1 (Auditor Verified)'
    },
    {
      id: 'VCH-803',
      year: '2026',
      month: '09',
      week: 'Week 38',
      day: '17',
      userId: 'ADM-04',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      raisedBy: 'तानाजी जाधव (शिवनेरी चॅप्टर)',
      dept: 'व्यवसाय संगम B2B मंच',
      category: 'राज्यस्तरीय मराठा उद्योजक परिषद सभागृह ॲडव्हान्स',
      amount: '₹२,५०,०००',
      vendorName: 'हॉटेल प्राईड एक्झिक्युटिव्ह, पुणे',
      billNo: 'ADV-REC-0012',
      supportingDoc: 'हॉटेल_प्राईड_ॲडव्हान्स_पावती.pdf',
      status: 'Approved & Paid',
      level: 'Signed & Disbursed (NEFT UTR: 991283019)'
    }
  ]);

  const [donations80G, setDonations80G] = useState([
    { receiptNo: '80G-2026-089', year: '2026', month: '09', week: 'Week 38', day: '18', userId: 'CM-10291', state: 'महाराष्ट्र', city: 'सोलापूर', donorName: 'श्री. विजयराव संभाजीराव मोहिते', pan: 'AAAPM1290K', amount: '₹५,००,०००', cause: 'किल्ले संवर्धन व ऐतिहासिक संशोधन निधी', utr: 'SBI991200189', date: '१८ सप्टें २०२६', certStatus: 'जारी केले (Generated)' },
    { receiptNo: '80G-2026-088', year: '2026', month: '09', week: 'Week 38', day: '16', userId: 'CM-10293', state: 'महाराष्ट्र', city: 'पुणे', donorName: 'सौ. अनुराधा जयसिंगराव कदम', pan: 'ABEPK8812L', amount: '₹१,५०,०००', cause: 'मराठा विद्यार्थी उच्च शिक्षण शिष्यवृत्ती', utr: 'HDFC77120991', date: '१६ सप्टें २०२६', certStatus: 'जारी केले (Generated)' },
    { receiptNo: '80G-2026-087', year: '2026', month: '09', week: 'Week 37', day: '12', userId: 'CM-10292', state: 'महाराष्ट्र', city: 'ठाणे', donorName: 'मे. जगताप इन्फ्राकॉन प्रा. लि.', pan: 'AACJ88190P', amount: '₹१०,००,०००', cause: 'Section 8 कॉर्पस फंड व रुग्ण साहाय्य', utr: 'ICIC88129011', date: '१२ सप्टें २०२६', certStatus: 'जारी केले (Generated)' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'नवीन सदस्य पडताळणी मंजूर', actor: 'जिल्हा समन्वयक (पुणे)', target: 'M-10293 सुप्रिया साळुंखे', time: '१० मिनिटांपूर्वी', clearance: 'District Level' },
    { id: 2, action: 'रेफरल व्यवहार पूर्ण (TYFCB)', actor: 'चॅप्टर अध्यक्ष (शिवनेरी)', target: 'REF-201 (₹४.५ लाख)', time: '२२ मिनिटांपूर्वी', clearance: 'Chapter B2B' },
    { id: 3, action: 'आपत्कालीन रक्तदाता नियुक्त', actor: 'सेवा समन्वयक', target: 'BLD-402 विक्रम भोसले', time: '४५ मिनिटांपूर्वी', clearance: '24x7 Seva' },
    { id: 4, action: 'Section 8 वार्षिक लेजर ऑडिट निर्यात', actor: 'केंद्रीय सुपर ॲडमिन', target: 'FY 2025-26 Ledger', time: '२ तासांपूर्वी', clearance: 'Super Admin' }
  ]);

  // ==========================================
  // 7. UNIVERSAL MASTER REPORTS (YEAR, MONTH, WEEK, DAY, USER ID, STATE, CITY)
  // ==========================================
  const INITIAL_DETAILED_REPORTS = [
    {
      id: 'REP-2026-001',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '19',
      dayName: 'शनिवार',
      dateFormatted: '१९ सप्टें २०२६',
      userId: 'CM-10291',
      userName: 'तानाजी विठ्ठलराव जाधव',
      role: 'उद्योग प्रतिनिधी (Agri Export)',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Referrals',
      title: 'सह्याद्री ॲग्रो फूड्स — बी२बी कृषी निर्यात कंत्राट',
      amount: '₹४,५०,०००',
      amountNumeric: 450000,
      status: 'यशस्वी (Completed)',
      officer: 'तानाजी जाधव (Chapter President)',
      notes: 'TYFCB यशस्वीरीत्या पूर्ण. ५ शेतकरी उत्पादक कंपन्यांशी पुरवठा करार.'
    },
    {
      id: 'REP-2026-002',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '18',
      dayName: 'शुक्रवार',
      dateFormatted: '१८ सप्टें २०२६',
      userId: 'CM-10292',
      userName: 'प्रवीण संभाजी जगताप',
      role: 'किल्ले संवर्धन प्रमुख',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'पुणे शहर मध्य',
      category: 'Finance',
      title: 'राजगड व तोरणा दुर्ग संवर्धन साहित्य व माहिती फलक खर्च',
      amount: '₹१,२५,०००',
      amountNumeric: 125000,
      status: 'मंजूर (Approved)',
      officer: 'सीए मंदार कुलकर्णी (Auditor)',
      notes: 'Section 8 अंतर्गत अधिकृत जीएसटी बिलांची पडताळणी पूर्ण.'
    },
    {
      id: 'REP-2026-003',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '18',
      dayName: 'शुक्रवार',
      dateFormatted: '१८ सप्टें २०२६',
      userId: 'ADM-01',
      userName: 'डॉ. विजयसिंह मोहिते-पाटील',
      role: 'केंद्रीय सुपर ॲडमिन',
      state: 'महाराष्ट्र',
      city: 'सोलापूर',
      taluka: 'माळशिरस',
      category: 'Finance',
      title: 'किल्ले संवर्धन व ऐतिहासिक संशोधन निधी — ८०जी देणगी पावती',
      amount: '₹५,००,०००',
      amountNumeric: 500000,
      status: 'यशस्वी (Completed)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: '80G(5)(vi) करसवलत प्रमाणपत्र जारी (SBI UTR: 991200189).'
    },
    {
      id: 'REP-2026-004',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '17',
      dayName: 'गुरुवार',
      dateFormatted: '१७ सप्टें २०२६',
      userId: 'CM-10293',
      userName: 'सुप्रिया सचिन साळुंखे',
      role: 'महिला उद्योजक',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'बारामती',
      category: 'Referrals',
      title: 'राजमाता महिला गृहउद्योग — हॉटेल्ससाठी सेंद्रिय मसाले पुरवठा',
      amount: '₹२,८०,०००',
      amountNumeric: 280000,
      status: 'यशस्वी (Completed)',
      officer: 'तानाजी जाधव',
      notes: '३ हॉटेल शाखांशी वार्षिक पुरवठा करार निश्चित.'
    },
    {
      id: 'REP-2026-005',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '17',
      dayName: 'गुरुवार',
      dateFormatted: '१७ सप्टें २०२६',
      userId: 'CM-10294',
      userName: 'दिग्विजय यशवंत कदम',
      role: 'लॉजिस्टिक उद्योजक',
      state: 'महाराष्ट्र',
      city: 'सातारा',
      taluka: 'कराड',
      category: 'Membership',
      title: 'नवीन कॉर्पोरेट सभासद पडताळणी (KYC Complete)',
      amount: '₹१२,०००',
      amountNumeric: 12000,
      status: 'सत्यापित (Verified)',
      officer: 'दिलीपराव कदम (District In-charge)',
      notes: 'GST व PWD परवाना तपासला. डिजिटल कार्ड सक्रिय.'
    },
    {
      id: 'REP-2026-006',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '16',
      dayName: 'बुधवार',
      dateFormatted: '१६ सप्टें २०२६',
      userId: 'ADM-05',
      userName: 'डॉ. नीलेश सावंत',
      role: 'समाज साहाय्य प्रमुख',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Seva',
      title: 'आपत्कालीन २४x७ रुग्णवाहिका इंधन व ऑक्सिजन सिलिंडर वाटप',
      amount: '₹४२,५००',
      amountNumeric: 42500,
      status: 'मंजूर (Approved)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: 'पुणे व ससून रुग्णालयातील गरजू रुग्णांसाठी मोफत ऑक्सिजन साहाय्य.'
    },
    {
      id: 'REP-2026-007',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '15',
      dayName: 'मंगळवार',
      dateFormatted: '१५ सप्टें २०२६',
      userId: 'CM-10301',
      userName: 'अनिकेत संभाजी पाटील',
      role: 'विद्यार्थी (B.Tech CS)',
      state: 'महाराष्ट्र',
      city: 'सातारा',
      taluka: 'पाटण',
      category: 'Scholarships',
      title: 'COEP पुणे – कॉम्प्युटर सायन्स उच्च शिक्षण शिष्यवृत्ती मंजूर',
      amount: '₹३५,०००',
      amountNumeric: 35000,
      status: 'मंजूर (Approved)',
      officer: 'डॉ. नीलेश सावंत',
      notes: '९८.२% MHT-CET गुणवंत अल्पभूधारक शेतकरी कुटुंबातील विद्यार्थी.'
    },
    {
      id: 'REP-2026-008',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 37',
      day: '12',
      dayName: 'शनिवार',
      dateFormatted: '१२ सप्टें २०२६',
      userId: 'CM-10295',
      userName: 'उदयराज बाळासाहेब सावंत',
      role: 'ऑटोमोबाईल उद्योजक',
      state: 'महाराष्ट्र',
      city: 'कोल्हापूर',
      taluka: 'करवीर',
      category: 'Referrals',
      title: 'सावंत ऑटोवर्क्स — MIDC व्हेंडर सप्लाय करार',
      amount: '₹१,२०,०००',
      amountNumeric: 120000,
      status: 'यशस्वी (Completed)',
      officer: 'तानाजी जाधव',
      notes: 'कोल्हापूर चॅप्टरमार्फत थेट खरेदी करार.'
    },
    {
      id: 'REP-2026-009',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 37',
      day: '10',
      dayName: 'गुरुवार',
      dateFormatted: '१० सप्टें २०२६',
      userId: 'ADM-02',
      userName: 'अशोकराव संभाजी जगताप',
      role: 'कार्याध्यक्ष (CEO)',
      state: 'महाराष्ट्र',
      city: 'मुंबई',
      taluka: 'मुंबई शहर',
      category: 'Governance',
      title: 'महाराष्ट्र कृषी निर्यात महासंघ — कोल्ड चेन प्रकल्प धोरण करार',
      amount: '₹२४,५०,००,०००',
      amountNumeric: 245000000,
      status: 'सत्यापित (Verified)',
      officer: 'अशोकराव जगताप (CEO)',
      notes: 'महाराष्ट्र सहकार विभाग व शेतकरी उत्पादक कंपन्यांशी संयुक्त करार.'
    },
    {
      id: 'REP-2026-010',
      year: '2026',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 36',
      day: '05',
      dayName: 'शनिवार',
      dateFormatted: '०५ सप्टें २०२६',
      userId: 'CM-10302',
      userName: 'प्रियांका विलासराव मोहिते',
      role: 'वैद्यकीय विद्यार्थिनी (MBBS)',
      state: 'महाराष्ट्र',
      city: 'छत्रपती संभाजीनगर',
      taluka: 'आष्टी',
      category: 'Scholarships',
      title: 'बी.जे. शासकीय मेडिकल कॉलेज MBBS वसतिगृह व शैक्षणिक अनुदान',
      amount: '₹५०,०००',
      amountNumeric: 50000,
      status: 'मंजूर (Approved)',
      officer: 'डॉ. नीलेश सावंत',
      notes: '६४०/७२० NEET-UG गुणवंत ऊसतोड कामगार कुटुंबातील विद्यार्थिनी.'
    },
    {
      id: 'REP-2026-011',
      year: '2026',
      month: '08',
      monthName: 'ऑगस्ट',
      week: 'Week 35',
      day: '28',
      dayName: 'शुक्रवार',
      dateFormatted: '२८ ऑग २०२६',
      userId: 'CM-10315',
      userName: 'अनिरुद्ध भालचंद्र पाटील',
      role: 'इन्फ्रास्ट्रक्चर कंत्राटदार',
      state: 'महाराष्ट्र',
      city: 'ठाणे',
      taluka: 'कल्याण',
      category: 'Finance',
      title: 'ठाणे आनंद दिघे व्यवसाय मंडळ — वार्षिक कॉर्पस फंड वर्गणी जमा',
      amount: '₹२,००,०००',
      amountNumeric: 200000,
      status: 'यशस्वी (Completed)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: 'वार्षिक चॅप्टर नोंदणी व सेक्शन ८ निधी वाटप.'
    },
    {
      id: 'REP-2026-012',
      year: '2026',
      month: '08',
      monthName: 'ऑगस्ट',
      week: 'Week 34',
      day: '20',
      dayName: 'गुरुवार',
      dateFormatted: '२० ऑग २०२६',
      userId: 'CM-10420',
      userName: 'धनंजय संभाजी भोसले',
      role: 'सीमाभाग समन्वयक',
      state: 'कर्नाटक (सीमाभाग)',
      city: 'बेळगाव',
      taluka: 'बेळगाव शहर',
      category: 'Governance',
      title: 'कर्नाटक सीमाभाग मराठी शाळा ग्रंथालय व सांस्कृतिक केंद्र अनुदान',
      amount: '₹१,७५,०००',
      amountNumeric: 175000,
      status: 'मंजूर (Approved)',
      officer: 'अशोकराव जगताप (CEO)',
      notes: 'बेळगाव, निपाणी, खानापूर भागातील १० मराठी शाळांना डिजिटल संच वाटप.'
    },
    {
      id: 'REP-2026-013',
      year: '2026',
      month: '08',
      monthName: 'ऑगस्ट',
      week: 'Week 32',
      day: '08',
      dayName: 'शनिवार',
      dateFormatted: '०८ ऑग २०२६',
      userId: 'CM-10291',
      userName: 'तानाजी विठ्ठलराव जाधव',
      role: 'चॅप्टर अध्यक्ष',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Referrals',
      title: 'शिवनेरी चॅप्टर — हॉटेल व फूड चेन संयुक्त पुरवठा डील',
      amount: '₹६,२०,०००',
      amountNumeric: 620000,
      status: 'यशस्वी (Completed)',
      officer: 'तानाजी जाधव',
      notes: 'अविनाश भोसले व सह्याद्री ॲग्रो यांच्यात वार्षिक सामंजस्य करार.'
    },
    {
      id: 'REP-2026-014',
      year: '2026',
      month: '07',
      monthName: 'जुलै',
      week: 'Week 28',
      day: '15',
      dayName: 'बुधवार',
      dateFormatted: '१५ जुलै २०२६',
      userId: 'ADM-06',
      userName: 'सीए मंदार कुलकर्णी',
      role: 'वित्त व ऑडिट अधिकारी',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'पुणे शहर मध्य',
      category: 'Finance',
      title: 'प्रथम तिमाही (Q1) सेक्शन ८ अधिकृत वित्तीय विवरण व कर ऑडिट',
      amount: '₹४८,२०,०००',
      amountNumeric: 4820000,
      status: 'सत्यापित (Verified)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: 'इनकम टॅक्स रिटर्न व ८०जी नियमांनुसार पूर्ण ऑडिट रिपोर्ट सादर.'
    },
    {
      id: 'REP-2026-015',
      year: '2026',
      month: '06',
      monthName: 'जून',
      week: 'Week 24',
      day: '19',
      dayName: 'शुक्रवार',
      dateFormatted: '१९ जून २०२६',
      userId: 'ADM-05',
      userName: 'डॉ. नीलेश सावंत',
      role: 'समाज साहाय्य प्रमुख',
      state: 'महाराष्ट्र',
      city: 'नाशिक',
      taluka: 'नाशिक शहर',
      category: 'Seva',
      title: 'शिवराज्याभिषेक महोत्सवानिमित्त भव्य ५०० युनिट्स रक्तदान महाशिबीर',
      amount: '₹८५,०००',
      amountNumeric: 85000,
      status: 'यशस्वी (Completed)',
      officer: 'डॉ. नीलेश सावंत',
      notes: 'नाशिक सिव्हिल हॉस्पिटल व मराठा रक्तपेढी संयुक्त उपक्रम.'
    },
    {
      id: 'REP-2026-016',
      year: '2026',
      month: '05',
      monthName: 'मे',
      week: 'Week 20',
      day: '14',
      dayName: 'गुरुवार',
      dateFormatted: '१४ मे २०२६',
      userId: 'CM-10292',
      userName: 'प्रवीण संभाजी जगताप',
      role: 'इन्फ्रा उद्योजक',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Referrals',
      title: 'जगताप इन्फ्रा — बांदल रेसिडेन्सी कमर्शियल स्ट्रक्चर कंत्राट',
      amount: '₹४,५०,०००',
      amountNumeric: 450000,
      status: 'यशस्वी (Completed)',
      officer: 'तानाजी जाधव',
      notes: '५ मजली इमारतीचे स्ट्रक्चरल ऑडिट व सिव्हिल काम पूर्ण.'
    },
    {
      id: 'REP-2026-017',
      year: '2026',
      month: '04',
      monthName: 'एप्रिल',
      week: 'Week 16',
      day: '10',
      dayName: 'शुक्रवार',
      dateFormatted: '१० एप्रिल २०२६',
      userId: 'ADM-03',
      userName: 'दिलीपराव यशवंत कदम',
      role: 'जिल्हा समन्वयक',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Membership',
      title: 'जिल्हास्तरीय २५०+ नवीन तरुण उद्योजक सभासद नोंदणी मोहीम',
      amount: '₹१,२५,०००',
      amountNumeric: 125000,
      status: 'सत्यापित (Verified)',
      officer: 'दिलीपराव कदम',
      notes: 'हवेली, बारामती व शिरूर तालुक्यातील युवकांना ओळखपत्र वाटप.'
    },
    {
      id: 'REP-2026-018',
      year: '2026',
      month: '03',
      monthName: 'मार्च',
      week: 'Week 12',
      day: '22',
      dayName: 'रविवार',
      dateFormatted: '२२ मार्च २०२६',
      userId: 'CM-10294',
      userName: 'दिग्विजय यशवंत कदम',
      role: 'लॉजिस्टिक उद्योजक',
      state: 'महाराष्ट्र',
      city: 'सातारा',
      taluka: 'कराड',
      category: 'Referrals',
      title: 'यशवंत रोडलाईन्स — पश्चिम महाराष्ट्र कृषी वाहतूक महाकरार',
      amount: '₹३,६०,०००',
      amountNumeric: 360000,
      status: 'यशस्वी (Completed)',
      officer: 'दिलीपराव कदम',
      notes: 'दैनिक भाजीपाला व धान्य मालवाहतूक करार.'
    },
    {
      id: 'REP-2026-019',
      year: '2026',
      month: '02',
      monthName: 'फेब्रुवारी',
      week: 'Week 8',
      day: '19',
      dayName: 'गुरुवार',
      dateFormatted: '१९ फेब्रु २०२६',
      userId: 'ADM-01',
      userName: 'डॉ. विजयसिंह मोहिते-पाटील',
      role: 'केंद्रीय सुपर ॲडमिन',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'जुन्नर',
      category: 'Finance',
      title: 'शिवजयंती विशेष — शिवनेरी गड परिसर स्वच्छता व संवर्धन निधी',
      amount: '₹३,५०,०००',
      amountNumeric: 350000,
      status: 'मंजूर (Approved)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: 'पुरातत्व विभाग सहकार्याने माहिती फलक व पिण्याच्या पाण्याचे नियोजन.'
    },
    {
      id: 'REP-2026-020',
      year: '2026',
      month: '01',
      monthName: 'जानेवारी',
      week: 'Week 4',
      day: '26',
      dayName: 'सोमवार',
      dateFormatted: '२६ जाने २०२६',
      userId: 'CM-10293',
      userName: 'सुप्रिया सचिन साळुंखे',
      role: 'महिला उद्योग प्रमुख',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'बारामती',
      category: 'Governance',
      title: 'प्रजासत्ताक दिन — मराठा महिला बचतगट प्रदर्शन व विक्री संगम',
      amount: '₹१,८०,०००',
      amountNumeric: 180000,
      status: 'यशस्वी (Completed)',
      officer: 'अशोकराव जगताप (CEO)',
      notes: '४० महिला उद्योजकांनी उत्पादनांचे स्टॉल्स लावले.'
    },
    {
      id: 'REP-2025-021',
      year: '2025',
      month: '11',
      monthName: 'नोव्हेंबर',
      week: 'Week 46',
      day: '15',
      dayName: 'शनिवार',
      dateFormatted: '१५ नोव्हें २०२५',
      userId: 'ADM-02',
      userName: 'अशोकराव संभाजी जगताप',
      role: 'कार्याध्यक्ष (CEO)',
      state: 'महाराष्ट्र',
      city: 'नागपूर',
      taluka: 'नागपूर शहर',
      category: 'Governance',
      title: 'विदर्भ विभागीय उद्योग परिषद — ५००+ मराठी उद्योजक महामेळावा',
      amount: '₹८,५०,०००',
      amountNumeric: 850000,
      status: 'यशस्वी (Completed)',
      officer: 'अशोकराव जगताप (CEO)',
      notes: 'पूर्व विदर्भातील खाण, ऊर्जा व कृषी उद्योजकांचा सहभाग.'
    },
    {
      id: 'REP-2025-022',
      year: '2025',
      month: '09',
      monthName: 'सप्टेंबर',
      week: 'Week 38',
      day: '19',
      dayName: 'शुक्रवार',
      dateFormatted: '१९ सप्टें २०२५',
      userId: 'CM-10291',
      userName: 'तानाजी विठ्ठलराव जाधव',
      role: 'उद्योग प्रतिनिधी',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Finance',
      title: 'वार्षिक सर्वसाधारण सभा (AGM) व आर्थिक ताळेबंद २०२४-२५ मंजुरी',
      amount: '₹१,४५,००,०००',
      amountNumeric: 14500000,
      status: 'सत्यापित (Verified)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: 'सर्व संचालकांनी ऑडिट केलेल्या आर्थिक हिशोबाला एकमुखाने मंजुरी दिली.'
    },
    {
      id: 'REP-2025-023',
      year: '2025',
      month: '06',
      monthName: 'जून',
      week: 'Week 24',
      day: '06',
      dayName: 'शुक्रवार',
      dateFormatted: '०६ जून २०२५',
      userId: 'ADM-01',
      userName: 'डॉ. विजयसिंह मोहिते-पाटील',
      role: 'केंद्रीय सुपर ॲडमिन',
      state: 'महाराष्ट्र',
      city: 'रायगड',
      taluka: 'महाड',
      category: 'Finance',
      title: 'शिवराज्याभिषेक सोहळा २०२५ — रायगड संवर्धन व शिवभक्त महाप्रसाद निधी',
      amount: '₹१५,००,०००',
      amountNumeric: 1500000,
      status: 'यशस्वी (Completed)',
      officer: 'सीए मंदार कुलकर्णी',
      notes: 'लाखो शिवभक्तांसाठी पाणी, अन्नदान व आपत्कालीन वैद्यकीय कक्ष नियोजन.'
    },
    {
      id: 'REP-2024-024',
      year: '2024',
      month: '12',
      monthName: 'डिसेंबर',
      week: 'Week 50',
      day: '20',
      dayName: 'शुक्रवार',
      dateFormatted: '२० डिसें २०२४',
      userId: 'CM-10420',
      userName: 'धनंजय संभाजी भोसले',
      role: 'गोवा समन्वयक',
      state: 'गोवा',
      city: 'पणजी',
      taluka: 'तिसवाडी',
      category: 'Membership',
      title: 'गोवा राज्य मराठा समाज चॅप्टर स्थापना व २०० सदस्य नोंदणी',
      amount: '₹१,००,०००',
      amountNumeric: 100000,
      status: 'सत्यापित (Verified)',
      officer: 'अशोकराव जगताप (CEO)',
      notes: 'गोवा व कोकण किनारपट्टी व्यापारी नेटवर्कचे उद्घाटन.'
    },
    {
      id: 'REP-2024-025',
      year: '2024',
      month: '08',
      monthName: 'ऑगस्ट',
      week: 'Week 34',
      day: '15',
      dayName: 'गुरुवार',
      dateFormatted: '१५ ऑग २०२४',
      userId: 'ADM-05',
      userName: 'डॉ. नीलेश सावंत',
      role: 'समाज साहाय्य प्रमुख',
      state: 'गुजरात',
      city: 'सुरत',
      taluka: 'सुरत शहर',
      category: 'Seva',
      title: 'सुरत मराठा मंडळ — आपत्कालीन मदत व रुग्ण साहाय्यता निधी वाटप',
      amount: '₹७५,०००',
      amountNumeric: 75000,
      status: 'मंजूर (Approved)',
      officer: 'डॉ. नीलेश सावंत',
      notes: 'गुजरात राज्यातील मराठी बांधवांसाठी आपत्कालीन मदत केंद्र सुरू.'
    }
  ];

  const [detailedReports, setDetailedReports] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_detailed_reports_master');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse cm_detailed_reports_master from localStorage', e);
    }
    return INITIAL_DETAILED_REPORTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_detailed_reports_master', JSON.stringify(detailedReports));
    } catch (e) {
      console.error('Failed to save cm_detailed_reports_master to localStorage', e);
    }
  }, [detailedReports]);

  // Universal 7-Dimensional Filter State
  const [reportFilters, setReportFilters] = useState({
    year: 'all',
    month: 'all',
    week: 'all',
    day: 'all',
    userId: '',
    state: 'all',
    city: 'all',
    category: 'all',
    search: ''
  });

  // Modals for Detailed Reports
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [newReportForm, setNewReportForm] = useState({
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '19',
    userId: 'CM-10291',
    userName: '',
    role: 'सदस्य',
    state: 'महाराष्ट्र',
    city: 'पुणे',
    taluka: 'हवेली',
    category: 'Finance',
    title: '',
    amount: '₹५०,०००',
    status: 'मंजूर (Approved)',
    notes: ''
  });

  // Filter evaluation logic
  const filteredDetailedReports = detailedReports.filter(r => {
    if (reportFilters.year !== 'all' && r.year !== reportFilters.year) return false;
    if (reportFilters.month !== 'all' && r.month !== reportFilters.month) return false;
    if (reportFilters.week !== 'all' && r.week !== reportFilters.week) return false;
    if (reportFilters.day !== 'all' && r.day !== reportFilters.day) return false;
    if (reportFilters.state !== 'all' && r.state !== reportFilters.state) return false;
    if (reportFilters.city !== 'all' && r.city !== reportFilters.city) return false;
    if (reportFilters.category !== 'all' && r.category !== reportFilters.category) return false;
    if (reportFilters.userId && !r.userId.toLowerCase().includes(reportFilters.userId.toLowerCase()) && !r.userName.toLowerCase().includes(reportFilters.userId.toLowerCase())) {
      return false;
    }
    if (reportFilters.search) {
      const q = reportFilters.search.toLowerCase();
      const match = (r.title || '').toLowerCase().includes(q) ||
                    (r.id || '').toLowerCase().includes(q) ||
                    (r.userName || '').toLowerCase().includes(q) ||
                    (r.userId || '').toLowerCase().includes(q) ||
                    (r.city || '').toLowerCase().includes(q) ||
                    (r.notes || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const resetReportFilters = () => {
    setReportFilters({
      year: 'all',
      month: 'all',
      week: 'all',
      day: 'all',
      userId: '',
      state: 'all',
      city: 'all',
      category: 'all',
      search: ''
    });
    showToast('सर्व ७ फिल्टर्स रीसेट झाले.');
  };

  const exportReportsToCSV = () => {
    const headers = [
      'अहवाल क्र. (Report ID)',
      'वर्ष (Year)',
      'महिना (Month)',
      'आठवडा (Week)',
      'दिवस (Day)',
      'तारीख (Formatted Date)',
      'युझर आयडी (User ID)',
      'नाव (User Name)',
      'भूमिका (Role)',
      'राज्य (State)',
      'शहर (City)',
      'तालुका (Taluka)',
      'प्रवर्ग (Category)',
      'तपशील (Title)',
      'रक्कम / मूल्य (Amount)',
      'स्थिती (Status)',
      'अधिकारी (Verifying Officer)'
    ];

    const rows = filteredDetailedReports.map(r => [
      r.id,
      r.year,
      r.month,
      r.week,
      r.day,
      `"${r.dateFormatted || ''}"`,
      r.userId,
      `"${r.userName}"`,
      `"${r.role || ''}"`,
      `"${r.state}"`,
      `"${r.city}"`,
      `"${r.taluka || ''}"`,
      r.category,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${r.amount || ''}"`,
      `"${r.status}"`,
      `"${r.officer || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ConnectMaratha_MasterReport_${reportFilters.year}_${reportFilters.month}_${reportFilters.week}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📥 ${filteredDetailedReports.length} नोंदींचा तपशीलवार अहवाल CSV डाऊनलोड झाला.`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleAddReportSubmit = (e) => {
    e.preventDefault();
    if (!newReportForm.title || !newReportForm.userName) {
      showToast('कृपया शीर्षक आणि युझर नाव प्रविष्ट करा.');
      return;
    }
    const id = `REP-${newReportForm.year}-${String(detailedReports.length + 1).padStart(3, '0')}`;
    const entry = {
      ...newReportForm,
      id,
      monthName: newReportForm.month,
      dayName: 'नोंद',
      dateFormatted: `${newReportForm.day}/${newReportForm.month}/${newReportForm.year}`,
      officer: currentRoleConfig.name
    };
    setDetailedReports(prev => [entry, ...prev]);
    setIsAddReportModalOpen(false);
    showToast(`✓ नवीन अहवाल नोंद '${id}' यशस्वीरित्या तयार झाली.`);
    setNewReportForm({
      year: '2026',
      month: '09',
      week: 'Week 38',
      day: '19',
      userId: 'CM-10291',
      userName: '',
      role: 'सदस्य',
      state: 'महाराष्ट्र',
      city: 'पुणे',
      taluka: 'हवेली',
      category: 'Finance',
      title: '',
      amount: '₹५०,०००',
      status: 'मंजूर (Approved)',
      notes: ''
    });
  };

  const handleUpdateReportSubmit = (e) => {
    e.preventDefault();
    if (!editingReport) return;
    setDetailedReports(prev => prev.map(r => r.id === editingReport.id ? editingReport : r));
    setEditingReport(null);
    showToast(`✓ अहवाल क्र. '${editingReport.id}' अद्ययावत झाला.`);
  };

  const handleDeleteReport = (id) => {
    if (window.confirm(`आपण खात्रीपूर्वक अहवाल '${id}' हटवू इच्छिता?`)) {
      setDetailedReports(prev => prev.filter(r => r.id !== id));
      showToast(`🗑️ अहवाल '${id}' हटवला गेला.`);
      if (selectedReportDetail?.id === id) setSelectedReportDetail(null);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentRoleConfig = ROLES[activeRole] || ROLES.super_admin;
  const isViewAllowed = currentRoleConfig.allowedViews.includes(activeView);

  const handleRoleChange = (newRoleKey) => {
    setActiveRole(newRoleKey);
    const roleCfg = ROLES[newRoleKey];
    if (!roleCfg.allowedViews.includes(activeView)) {
      setActiveView(roleCfg.allowedViews[0] || 'dashboard');
    }
    showToast(`भूमिका बदलली: ${roleCfg.name}`);
  };

  const handleApproveMember = (id, name) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'सत्यापित' } : m));
    setAuditLogs(prev => [{ id: Date.now(), action: 'सदस्य ओळखपत्र मंजूर', actor: currentRoleConfig.name, target: `${id} ${name}`, time: 'आत्ताच', clearance: currentRoleConfig.badge }, ...prev]);
    showToast(`✓ सदस्य '${name}' यांना अधिकृत डिजिटल ओळखपत्र मंजूर झाले.`);
    setSelectedApplicantDossier(null);
  };

  const handleRejectMember = (id, name, reason = 'कागदपत्रे अपूर्ण') => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'नाकारले', notes: `नाकारण्याचे कारण: ${reason}` } : m));
    setAuditLogs(prev => [{ id: Date.now(), action: 'सदस्य अर्ज नाकारला', actor: currentRoleConfig.name, target: `${id} ${name} (${reason})`, time: 'आत्ताच', clearance: currentRoleConfig.badge }, ...prev]);
    showToast(`✕ सदस्य '${name}' यांचा अर्ज नाकारला गेला (${reason}).`);
    setSelectedApplicantDossier(null);
  };

  const handleRequestReupload = (id, name) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'फेरपडताळणी आवश्यक' } : m));
    setAuditLogs(prev => [{ id: Date.now(), action: 'कागदपत्रे फेरअपलोड विनंती', actor: currentRoleConfig.name, target: `${id} ${name}`, time: 'आत्ताच', clearance: currentRoleConfig.badge }, ...prev]);
    showToast(`⚠️ सदस्य '${name}' यांना कागदपत्रे फेरअपलोड करण्याची विनंती पाठवली.`);
    setSelectedApplicantDossier(null);
  };

  const handleCreateReferral = (e) => {
    e.preventDefault();
    if (!newReferralForm.clientName || !newReferralForm.requirement) {
      showToast('कृपया ग्राहकाचे नाव आणि व्यवसायाची माहिती भरा.');
      return;
    }
    const newRef = {
      id: `REF-${200 + referrals.length + 1}`,
      giver: newReferralForm.giver,
      receiver: newReferralForm.receiver,
      clientName: newReferralForm.clientName,
      clientCompany: newReferralForm.clientCompany || 'वैयक्तिक',
      clientPhone: newReferralForm.clientPhone || '+91 XXXXX XXXXX',
      requirement: newReferralForm.requirement,
      amount: newReferralForm.amount ? `₹${newReferralForm.amount}` : 'अपेक्षित',
      refType: newReferralForm.refType,
      temperature: newReferralForm.temperature,
      date: '१९ सप्टें २०२६',
      stage: 'Slip Given',
      status: 'In Discussion',
      tyfcbAmount: '—'
    };
    setReferrals([newRef, ...referrals]);
    setIsReferralModalOpen(false);
    showToast(`✓ नवीन रेफरल स्लिप #${newRef.id} यशस्वीरीत्या जारी झाली!`);
  };

  const handleDispatchBlood = (e) => {
    e.preventDefault();
    if (!bloodDispatchForm.patient || !bloodDispatchForm.hospital) {
      showToast('कृपया रुग्णाचे नाव आणि रुग्णालय भरा.');
      return;
    }
    const newBld = {
      id: `BLD-${400 + bloodRequests.length + 1}`,
      patient: bloodDispatchForm.patient,
      ageGender: 'वय माहित नाही',
      group: bloodDispatchForm.group,
      rhFactor: bloodDispatchForm.group.includes('-') ? 'Rh Negative' : 'Rh Positive',
      hospital: bloodDispatchForm.hospital,
      wardBed: 'इमर्जन्सी रिसेप्शन',
      city: bloodDispatchForm.city,
      units: bloodDispatchForm.units,
      urgency: bloodDispatchForm.urgency,
      reason: bloodDispatchForm.reason || 'आपत्कालीन उपचार',
      contactPerson: bloodDispatchForm.contactPerson || 'रुग्ण नातेवाईक',
      contactPhone: bloodDispatchForm.contactPhone || '+91 98XXX XXXXX',
      status: 'Assigned',
      statusText: 'रक्तदाता पथक रवाना',
      donor: 'पुणे मध्य स्वयंसेवक पथक',
      dispatcher: currentRoleConfig.name
    };
    setBloodRequests([newBld, ...bloodRequests]);
    setIsBloodModalOpen(false);
    showToast(`🚨 आपत्कालीन रक्त विनंती #${newBld.id} नोंदवली!`);
  };

  const handleApproveVoucher = (voucher) => {
    setVouchers(prev => prev.map(v => v.id === voucher.id ? { ...v, status: 'Approved & Paid', level: 'Signed & Disbursed (NEFT UTR Generated)' } : v));
    showToast(`✓ व्हाउचर #${voucher.id} (${voucher.amount}) अधिकृतपणे मंजूर झाले.`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', color: '#1c1917', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOAST NOTIFICATION (WHITE & ORANGE) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#FFFFFF',
          color: '#c2410c',
          border: '2px solid #ea580c',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(234, 88, 12, 0.25)',
          zIndex: 99999,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🛡️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT ENTERPRISE SIDEBAR (WHITE WITH ORANGE ACCENTS) */}
      <aside style={{
        width: sidebarCollapsed ? '72px' : '280px',
        background: '#FFFFFF',
        borderRight: '2px solid #fed7aa',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(234, 88, 12, 0.04)'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff7ed' }}>
          {!sidebarCollapsed && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🚩</span>
                <span style={{ fontWeight: 900, letterSpacing: '0.5px', color: '#7c2d12', fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>
                  CONNECT <span style={{ color: '#ea580c' }}>मराठा</span>
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#c2410c', marginTop: '2px', fontWeight: 800 }}>ENTERPRISE CRM CONSOLE</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: '#FFFFFF', border: '1px solid #fed7aa', color: '#c2410c', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? '➡️' : '⬅️'}
          </button>
        </div>

        {/* Active Role Quick Card */}
        {!sidebarCollapsed && (
          <div style={{ padding: '14px 18px', background: '#fff7ed', margin: '12px 16px', borderRadius: '10px', border: '1.5px solid #fdba74' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#ea580c', color: '#FFFFFF' }}>
                {currentRoleConfig.badge}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 700 }}>सक्रिय भूमिका</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c2d12', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentRoleConfig.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '2px', lineHeight: 1.3 }}>
              {currentRoleConfig.description}
            </div>
          </div>
        )}

        {/* Navigation Modules Tree */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 0' }}>
          {NAVIGATION_GROUPS.map((grp) => {
            return (
              <div key={grp.group} style={{ marginBottom: '14px' }}>
                {!sidebarCollapsed && (
                  <div style={{ padding: '6px 20px', fontSize: '0.68rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {grp.group}
                  </div>
                )}
                {grp.items.map((item) => {
                  const allowed = currentRoleConfig.allowedViews.includes(item.id);
                  const active = activeView === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: sidebarCollapsed ? '12px 0' : '9px 20px',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        cursor: 'pointer',
                        fontSize: '0.86rem',
                        fontWeight: active ? 800 : 600,
                        color: active ? '#FFFFFF' : allowed ? '#431407' : '#9ca3af',
                        background: active ? '#ea580c' : 'transparent',
                        borderLeft: active ? '4px solid #9a3412' : '4px solid transparent',
                        transition: 'all 0.15s',
                        borderRadius: active ? '0 8px 8px 0' : '0'
                      }}
                      title={!allowed ? '🔒 उच्चाधिकार मंजुरी आवश्यक' : item.label}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                      {!sidebarCollapsed && (
                        <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      )}
                      {!sidebarCollapsed && !allowed && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>🔒</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Back to Public Web Link */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid #ffedd5', background: '#fff7ed' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#c2410c',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
          >
            <span>🏠</span>
            {!sidebarCollapsed && <span>मुख्य पोर्टलवर जा</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN VIEW AREA (WHITE BACKGROUND) */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: '#FFFFFF' }}>
        
        {/* EXECUTIVE TOP BAR (WHITE WITH ORANGE ACCENTS) */}
        <header style={{
          height: '68px',
          background: '#FFFFFF',
          borderBottom: '2px solid #fed7aa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          gap: '20px',
          flexShrink: 0
        }}>
          {/* Left: Global Search & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.88rem', color: '#9a3412', fontWeight: 600 }}>
              CRM / <strong style={{ color: '#ea580c' }}>{activeView.toUpperCase()}</strong>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔎 शोध (सदस्य, कंपनी, रेफरल ID...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '20px',
                  padding: '7px 16px 7px 32px',
                  fontSize: '0.82rem',
                  color: '#431407',
                  width: '280px',
                  outline: 'none',
                  fontWeight: 600
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '7px', fontSize: '0.8rem', color: '#ea580c' }}>🔍</span>
            </div>
          </div>

          {/* Right: Role Switcher & Scope Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Role Gateway & Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/crm"
                style={{
                  background: '#fff7ed',
                  color: '#c2410c',
                  border: '1.5px solid #fdba74',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🔄</span> CRM भूमिका पोर्टल
              </Link>
              <label style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 800 }}>भूमिका बदला:</label>
              <select
                value={activeRole}
                onChange={(e) => handleRoleNavigate(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  color: '#ea580c',
                  border: '1.5px solid #ea580c',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {Object.values(ROLES).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Scope Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 800 }}>क्षेत्र:</label>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  color: '#7c2d12',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <option value="maharashtra">🌐 संपूर्ण महाराष्ट्र राज्य</option>
                <option value="pune_div">🏛️ पुणे विभाग (५ जिल्हे)</option>
                <option value="konkan_div">🏛️ कोकण विभाग (७ जिल्हे)</option>
                <option value="dist_pune">📍 पुणे जिल्हा</option>
                <option value="dist_satara">📍 सातारा जिल्हा</option>
                <option value="dist_kolhapur">📍 कोल्हापूर जिल्हा</option>
              </select>
            </div>

            {/* Quick Actions Bell */}
            <div
              onClick={() => showToast('सर्व नोटिफिकेशन्स अद्ययावत आहेत.')}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Notifications"
            >
              🔔
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY (WHITE & ORANGE ONLY) */}
        <main style={{ padding: '28px', flexGrow: 1, background: '#FFFFFF' }}>
          
          {/* RBAC PERMISSION BARRIER */}
          {!isViewAllowed ? (
            <div style={{
              background: '#fff7ed',
              border: '2px dashed #ea580c',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              maxWidth: '680px',
              margin: '40px auto'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🔒</div>
              <h2 style={{ fontSize: '1.6rem', color: '#7c2d12', margin: '0 0 8px', fontFamily: 'Baloo 2' }}>
                सुरक्षा मर्यादा: या विभागासाठी उच्चाधिकार मंजुरी आवश्यक
              </h2>
              <p style={{ color: '#9a3412', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 24px' }}>
                आपण सध्या <strong>{currentRoleConfig.name}</strong> या भूमिकेत आहात. या विभागातील ऑपरेशन्ससाठी आपल्याकडे सुरक्षा क्लिअरन्स नाही.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleRoleChange('super_admin')}
                  style={{ padding: '10px 20px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  👑 सुपर ॲडमिन मोडमध्ये स्विच करा
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView(currentRoleConfig.allowedViews[0])}
                  style={{ padding: '10px 20px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← मान्य पृष्ठावर परत जा
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* VIEW 1: SUPER ADMIN DASHBOARD                                             */}
              {/* ========================================================================= */}
              {activeView === 'dashboard' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h1 style={{ fontSize: '1.8rem', margin: '0 0 4px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                        📊 केंद्रीय नियंत्रण डॅशबोर्ड (Ecosystem Master Command)
                      </h1>
                      <div style={{ color: '#9a3412', fontSize: '0.88rem', fontWeight: 600 }}>
                        ३६ जिल्हे, ६ महसूल विभाग, १८४ व्यवसाय संगम मंडळे आणि २४,८२०+ सदस्यांचे थेट व्यवस्थापन
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => showToast('डेटाबेस बॅकअप यशस्वीरीत्या तयार झाला.')} style={{ background: '#FFFFFF', border: '1.5px solid #ea580c', color: '#ea580c', padding: '8px 16px', borderRadius: '8px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 700 }}>
                        💾 बॅकअप तयार करा
                      </button>
                      <button onClick={() => showToast('वार्षिक अहवाल डाऊनलोड सुरू झाला...')} style={{ background: '#ea580c', border: 'none', color: '#FFFFFF', padding: '8px 18px', borderRadius: '8px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 800 }}>
                        📥 वार्षिक अहवाल (PDF)
                      </button>
                    </div>
                  </div>

                  {/* 4 Macro KPI Cards (White & Orange) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                    <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1.5px solid #fed7aa', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)' }}>
                      <div style={{ fontSize: '0.82rem', color: '#9a3412', fontWeight: 700 }}>एकूण नोंदणीकृत सदस्य</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>२४,८२०</div>
                      <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>↑ १२.५% या महिन्यात वाढ (KYC 89%)</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1.5px solid #fed7aa', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)' }}>
                      <div style={{ fontSize: '0.82rem', color: '#9a3412', fontWeight: 700 }}>एकूण निर्माण झालेला व्यापार (TYFCB)</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>₹१८४.६ कोटी</div>
                      <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>१८४ व्यवसाय मंडळांमधून थेट व्यवहार</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1.5px solid #fed7aa', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)' }}>
                      <div style={{ fontSize: '0.82rem', color: '#9a3412', fontWeight: 700 }}>सत्यापित व्यवसाय नोंदी (Directory)</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>८,४२१</div>
                      <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>३२ प्रमुख उद्योग क्षेत्रांत पडताळणी पूर्ण</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1.5px solid #fed7aa', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)' }}>
                      <div style={{ fontSize: '0.82rem', color: '#9a3412', fontWeight: 700 }}>आपत्कालीन सेवा मदत कॉल्स (24x7)</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>१,८९०</div>
                      <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>९८.४% यशस्वी निराकरण</div>
                    </div>
                  </div>

                  {/* System & Operations Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                    {/* Live Operations Feed */}
                    <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                          ⚡ थेट ऑपरेशन्स फीड (Live Action Stream)
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#FFFFFF', background: '#ea580c', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                          ● LIVE
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {auditLogs.map((log) => (
                          <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#7c2d12' }}>{log.action}</div>
                              <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>लक्ष्य: {log.target} • {log.actor}</div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700 }}>{log.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Security & Compliance */}
                    <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '12px', border: '1.5px solid #fed7aa' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                        🛡️ सुरक्षा, DPDP २०२३ व डेटाबेस आरोग्य
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ffedd5', paddingBottom: '8px' }}>
                          <span style={{ color: '#9a3412' }}>डेटाबेस एनक्रिप्शन:</span>
                          <span style={{ color: '#ea580c', fontWeight: 800 }}>✓ AES-256 GCM Active</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ffedd5', paddingBottom: '8px' }}>
                          <span style={{ color: '#9a3412' }}>DPDP Act 2023 Consent Audit:</span>
                          <span style={{ color: '#ea580c', fontWeight: 800 }}>✓ 100% Compliant</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ffedd5', paddingBottom: '8px' }}>
                          <span style={{ color: '#9a3412' }}>सर्व्हर लेटन्सी (Mumbai DC):</span>
                          <span style={{ color: '#c2410c', fontWeight: 800 }}>२४ ms • Uptime 99.98%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ffedd5', paddingBottom: '8px' }}>
                          <span style={{ color: '#9a3412' }}>डॉक्युमेंट मीडिया बकेट:</span>
                          <span style={{ color: '#7c2d12', fontWeight: 700 }}>१४२ GB / ५०० GB वापरले</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9a3412' }}>दैनिक सुरक्षित बॅकअप:</span>
                          <span style={{ color: '#ea580c', fontWeight: 800 }}>०२:०० AM यशस्वी</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 2: EXECUTIVE CEO MACRO DASHBOARD                                     */}
              {/* ========================================================================= */}
              {activeView === 'ceo' && (
                <div>
                  {/* Hero Banner (Orange Gradient) */}
                  <div style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', borderRadius: '14px', padding: '26px', color: '#FFFFFF', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <span style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                          EXECUTIVE CEO OVERVIEW — STATE LEVEL
                        </span>
                        <h1 style={{ margin: '8px 0 4px', fontSize: '1.9rem', fontFamily: 'Baloo 2', color: '#FFFFFF' }}>
                          🦅 मराठा समाज व व्यवसाय संगम — CEO Executive Suite
                        </h1>
                        <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem' }}>
                          ६ महसूल विभाग, ३६ जिल्हे आणि राज्यस्तरीय ₹१००+ कोटी व्यवसाय वृद्धी नियंत्रण केंद्र
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>राज्यस्तरीय पूर्ण झालेला व्यापार</div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'Baloo 2' }}>₹ १८४.६ कोटी (Cr)</div>
                        <div style={{ fontSize: '0.78rem', color: '#fff7ed', fontWeight: 700 }}>वार्षिक उद्दिष्ट: ₹२५० Cr (७३.८% पूर्ण)</div>
                      </div>
                    </div>
                  </div>

                  {/* 6 Revenue Divisions Table */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', padding: '22px', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontFamily: 'Baloo 2', color: '#7c2d12' }}>
                      🏛️ ६ प्रशासकीय महसूल विभाग — व्यापार, सदस्य व मंडळ कामगिरी
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                            <th style={{ padding: '12px 14px' }}>विभाग (Division)</th>
                            <th style={{ padding: '12px 14px' }}>विभागीय उपाध्यक्ष</th>
                            <th style={{ padding: '12px 14px' }}>जिल्हे समाविष्ट</th>
                            <th style={{ padding: '12px 14px' }}>सक्रिय सदस्य</th>
                            <th style={{ padding: '12px 14px' }}>B2B चॅप्टर्स</th>
                            <th style={{ padding: '12px 14px' }}>व्यापार (Cr)</th>
                            <th style={{ padding: '12px 14px' }}>वाढ YoY</th>
                            <th style={{ padding: '12px 14px' }}>कामगिरी श्रेणी</th>
                          </tr>
                        </thead>
                        <tbody>
                          {divisionsData.map((d) => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#7c2d12' }}>{d.name}</td>
                              <td style={{ padding: '12px 14px', color: '#431407' }}>{d.vpName}</td>
                              <td style={{ padding: '12px 14px', color: '#9a3412', fontSize: '0.8rem' }}>{d.districts}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7c2d12' }}>{d.members}</td>
                              <td style={{ padding: '12px 14px' }}>{d.chapters}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#ea580c' }}>₹{d.revenueCr} Cr</td>
                              <td style={{ padding: '12px 14px', color: '#c2410c', fontWeight: 800 }}>{d.yoyGrowth}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ background: '#fff7ed', border: '1px solid #ea580c', color: '#ea580c', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                                  {d.rating}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Strategic B2B Projects & MoUs */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', padding: '22px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontFamily: 'Baloo 2', color: '#7c2d12' }}>
                      🤝 राज्यस्तरीय उच्च मूल्य B2B प्रकल्प व सामंजस्य करार (Strategic MoUs)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                      {strategicDeals.map((deal) => (
                        <div key={deal.id} style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 800 }}>{deal.id} • {deal.sector}</span>
                            <span style={{ fontSize: '0.72rem', background: '#FFFFFF', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: '4px', color: '#7c2d12', fontWeight: 700 }}>
                              {deal.stage}
                            </span>
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px', fontFamily: 'Baloo 2' }}>
                            {deal.name}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#9a3412', marginBottom: '10px' }}>
                            भागीदार: <strong>{deal.partner}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.84rem', color: '#7c2d12' }}>प्रकल्प मूल्य:</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c' }}>{deal.valueCr}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#FFFFFF', borderRadius: '4px', overflow: 'hidden', border: '1px solid #fed7aa' }}>
                            <div style={{ width: `${deal.progress}%`, height: '100%', background: '#ea580c' }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9a3412', marginTop: '6px', fontWeight: 700 }}>
                            <span>नेते: {deal.lead}</span>
                            <span>{deal.progress}% पूर्ण</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 3: DISTRICT COORDINATOR & KYC DESK                                   */}
              {/* ========================================================================= */}
              {(activeView === 'district' || activeView === 'members') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', margin: '0 0 4px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                        📍 जिल्हा पडताळणी कक्ष व सदस्यत्व मंजुरी (District KYC Queue)
                      </h2>
                      <div style={{ color: '#9a3412', fontSize: '0.86rem', fontWeight: 600 }}>
                        तालुकानिहाय नवीन अर्जदारांची कागदपत्रे पडताळणी, ओळखपत्र मंजुरी व स्थानिक साहाय्यता
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        style={{ background: '#FFFFFF', border: '1.5px solid #ea580c', color: '#ea580c', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        <option value="pune">📍 पुणे जिल्हा (Pune)</option>
                        <option value="satara">📍 सातारा जिल्हा (Satara)</option>
                        <option value="kolhapur">📍 कोल्हापूर जिल्हा (Kolhapur)</option>
                      </select>
                      <button
                        onClick={() => showToast('जिल्हा सदस्यत्व यादी डाऊनलोड झाली.')}
                        style={{ background: '#ea580c', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.84rem' }}
                      >
                        📥 यादी डाऊनलोड
                      </button>
                    </div>
                  </div>

                  {/* Taluka Operational Performance Grid */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', padding: '18px', marginBottom: '22px' }}>
                    <div style={{ fontWeight: 800, color: '#7c2d12', marginBottom: '12px', fontSize: '0.92rem' }}>
                      🏛️ {selectedDistrict.toUpperCase()} जिल्हा — तालुक्यातील कामकाजाचा संक्षिप्त आढावा
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {talukaSummary.map((t, idx) => (
                        <div key={idx} style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#7c2d12' }}>{t.taluka}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9a3412', margin: '4px 0' }}>समन्वयक: {t.incharge}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '6px' }}>
                            <span style={{ color: '#431407' }}>सदस्य: <strong>{t.members}</strong></span>
                            <span style={{ color: '#ea580c', fontWeight: 800 }}>प्रलंबित: {t.pendingKyc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Member KYC Table */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '14px 20px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#7c2d12' }}>
                        📋 नवीन अर्जदारांची पडताळणी सूची ({selectedDistrict.toUpperCase()})
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 800 }}>
                        एकूण अर्ज: {members.filter(m => m.district === selectedDistrict).length}
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412', background: '#fff7ed' }}>
                            <th style={{ padding: '12px 14px' }}>सदस्य आयडी</th>
                            <th style={{ padding: '12px 14px' }}>नाव व संपर्क</th>
                            <th style={{ padding: '12px 14px' }}>तालुका व गाव</th>
                            <th style={{ padding: '12px 14px' }}>व्यवसाय / उद्योग</th>
                            <th style={{ padding: '12px 14px' }}>कागदपत्रे तपशील</th>
                            <th style={{ padding: '12px 14px' }}>स्थिती</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती (Actions)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.filter(m => m.district === selectedDistrict).map((m) => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c' }}>
                                {m.id}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 800, color: '#7c2d12' }}>{m.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{m.mobile}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ color: '#431407', fontWeight: 600 }}>{m.taluka}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{m.village}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ color: '#431407' }}>{m.profession}</div>
                                <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>{m.company}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ background: '#fff7ed', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #fed7aa', display: 'inline-block', color: '#7c2d12', fontWeight: 600 }}>
                                  📄 {m.idCardType}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '2px' }}>आधार: {m.aadhaarMasked}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: m.status === 'सत्यापित' ? '#fff7ed' : '#FFFFFF',
                                  border: '1px solid #ea580c',
                                  color: '#ea580c'
                                }}>
                                  {m.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedApplicantDossier(m)}
                                    style={{ padding: '4px 8px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    🔍 डोसिअर
                                  </button>
                                  {m.status === 'प्रलंबित' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleApproveMember(m.id, m.name)}
                                        style={{ padding: '4px 8px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                      >
                                        ✓ मंजूर
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRejectMember(m.id, m.name)}
                                        style={{ padding: '4px 8px', background: '#FFFFFF', color: '#c2410c', border: '1px solid #c2410c', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                      >
                                        ✕ नाकारा
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 4: CHAPTER PRESIDENT DESK & B2B REFERRALS                            */}
              {/* ========================================================================= */}
              {(activeView === 'chapter' || activeView === 'referrals') && (
                <div>
                  <div style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', borderRadius: '14px', padding: '24px', color: '#FFFFFF', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <span style={{ background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                        BNI-STYLE BUSINESS SANGAM DESK
                      </span>
                      <h2 style={{ margin: '8px 0 4px', fontSize: '1.7rem', fontFamily: 'Baloo 2', color: '#FFFFFF' }}>
                        {chapterDetails.name}
                      </h2>
                      <div style={{ fontSize: '0.88rem', opacity: 0.95 }}>
                        अध्यक्ष: <strong>{chapterDetails.president}</strong> • साप्ताहिक उपस्थिती: <strong>{chapterDetails.weeklyAttendancePct}%</strong> • 1-to-1 भेटी: <strong>{chapterDetails.oneToOneMeetings}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReferralModalOpen(true)}
                      style={{ background: '#FFFFFF', color: '#ea580c', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      + नवीन रेफरल स्लिप जारी करा
                    </button>
                  </div>

                  {/* Chapter Key Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>पूर्ण झालेला एकूण व्यापार (YTD)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>₹{chapterDetails.ytdBusinessCr} कोटी</div>
                      <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>TYFCB धन्यवाद स्लिप्समधून</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>सक्रिय व्यावसायिक सदस्य</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>{chapterDetails.totalMembers} उद्योजक</div>
                      <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>४८ स्वतंत्र उद्योग प्रवर्गांचे प्रतिनिधित्व</div>
                    </div>
                  </div>

                  {/* Referral Slips Table */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '16px 20px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', fontWeight: 800, color: '#7c2d12', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🤝 व्यवसाय रेफरल स्लिप नोंदवही (Referral Slips & TYFCB Log)</span>
                      <span style={{ fontSize: '0.8rem', color: '#ea580c' }}>एकूण नोंदी: {referrals.length}</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                            <th style={{ padding: '12px 14px' }}>स्लिप आयडी</th>
                            <th style={{ padding: '12px 14px' }}>रेफरल देणारा (Giver)</th>
                            <th style={{ padding: '12px 14px' }}>स्वीकारणारा (Receiver)</th>
                            <th style={{ padding: '12px 14px' }}>ग्राहक व व्यवसायाचे स्वरूप</th>
                            <th style={{ padding: '12px 14px' }}>अपेक्षित मूल्य</th>
                            <th style={{ padding: '12px 14px' }}>सध्याची स्थिती</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrals.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c' }}>{r.id}</td>
                              <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{r.giver}</td>
                              <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{r.receiver}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 700, color: '#431407' }}>{r.clientName} ({r.clientCompany})</div>
                                <div style={{ fontSize: '0.78rem', color: '#9a3412' }}>{r.requirement}</div>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#ea580c' }}>{r.amount}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: '#fff7ed',
                                  border: '1px solid #ea580c',
                                  color: '#ea580c'
                                }}>
                                  {r.status === 'Closed Won' ? `✓ व्यवहार संपन्न (${r.tyfcbAmount})` : '💬 चर्चेत / मीटिंग सुरू'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 5: SEVA HELPDESK & BLOOD CONNECT                                     */}
              {/* ========================================================================= */}
              {(activeView === 'seva' || activeView === 'scholarships') && (
                <div>
                  <div style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', borderRadius: '14px', padding: '24px', color: '#FFFFFF', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <span style={{ background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                        24x7 STATEWIDE SEVA HELPDESK
                      </span>
                      <h2 style={{ margin: '8px 0 4px', fontSize: '1.7rem', fontFamily: 'Baloo 2', color: '#FFFFFF' }}>
                        🩸 २४x७ आपत्कालीन रक्तपेढी व रुग्ण साहाय्य समन्वय कक्ष
                      </h2>
                      <div style={{ fontSize: '0.88rem', opacity: 0.95 }}>
                        महाराष्ट्रातील सर्व रुग्णालयांतील बांधवांसाठी तत्काळ रक्तपुरवठा व विद्यार्थी साहाय्य
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBloodModalOpen(true)}
                      style={{ background: '#FFFFFF', color: '#ea580c', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🚨 तात्काळ रक्त विनंती नोंदवा
                    </button>
                  </div>

                  {/* Active Blood Requests Queue */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '16px 20px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', fontWeight: 800, color: '#7c2d12', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📋 सक्रिय रक्त साहाय्य विनंत्या (Emergency Blood Queue)</span>
                      <span style={{ fontSize: '0.78rem', color: '#ea580c' }}>सक्रिय केसेस: {bloodRequests.length}</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                            <th style={{ padding: '12px 14px' }}>केस आयडी</th>
                            <th style={{ padding: '12px 14px' }}>रुग्णाचे नाव व वय</th>
                            <th style={{ padding: '12px 14px' }}>रक्तगट</th>
                            <th style={{ padding: '12px 14px' }}>रुग्णालय व शहर</th>
                            <th style={{ padding: '12px 14px' }}>गरज</th>
                            <th style={{ padding: '12px 14px' }}>सध्याची स्थिती</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bloodRequests.map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c' }}>{b.id}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 800, color: '#7c2d12' }}>{b.patient}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{b.ageGender} • {b.contactPhone}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ background: '#fff7ed', border: '1px solid #ea580c', color: '#ea580c', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                  {b.group}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ color: '#431407', fontWeight: 600 }}>{b.hospital}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{b.wardBed}</div>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7c2d12' }}>{b.units}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: '#fff7ed',
                                  border: '1px solid #ea580c',
                                  color: '#ea580c'
                                }}>
                                  {b.statusText}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                {b.status !== 'Fulfilled' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBloodRequests(prev => prev.map(x => x.id === b.id ? { ...x, status: 'Fulfilled', statusText: 'रक्त उपलब्ध झाले (यशस्वी)' } : x));
                                      showToast(`✓ केस #${b.id} यशस्वीरीत्या पूर्ण झाली.`);
                                    }}
                                    style={{ padding: '5px 12px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    ✓ पूर्ण झाले
                                  </button>
                                ) : (
                                  <span style={{ color: '#ea580c', fontSize: '0.78rem', fontWeight: 800 }}>✓ पूर्ण</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 6: FINANCE & AUDIT                                                   */}
              {/* ========================================================================= */}
              {(activeView === 'finance' || activeView === 'approvals' || activeView === 'audit') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', margin: '0 0 4px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                        📒 वित्तीय अहवाल, व्हाउचर मंजुरी व लेजर (Section 8 Non-Profit Treasury)
                      </h2>
                      <div style={{ color: '#9a3412', fontSize: '0.86rem', fontWeight: 600 }}>
                        ८०जी करसवलत देणग्या, किल्ले संवर्धन निधी, वार्षिक सभासद वर्गणी व सनदी लेखापाल (CA) ऑडिट ट्रेल
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('📥 अधिकृत CA वार्षिक वित्तीय अहवाल डाऊनलोड झाला.')}
                      style={{ background: '#ea580c', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.84rem' }}
                    >
                      📥 CA ऑडिट अहवाल (PDF)
                    </button>
                  </div>

                  {/* Non-Profit Balance Sheet Snapshot */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>एकूण कॉर्पस फंड (Corpus Fund)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>₹{financialSummary.totalCorpusCr} कोटी</div>
                      <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>SBI सुरक्षित मुदत ठेव (FD)</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>दुर्ग संवर्धन समर्पित निधी</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>₹{financialSummary.fortConservationLakhs} लाख</div>
                      <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>८०जी करसवलत देणग्यांमधून</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1.5px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>विद्यार्थी शिक्षण साहाय्य निधी</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>₹{financialSummary.scholarshipFundLakhs} लाख</div>
                      <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>शिष्यवृत्ती व वसतिगृह वाटप</div>
                    </div>
                  </div>

                  {/* Vouchers & Financial Ledger Table with 7-Dimensional Formatting */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '16px 20px', background: '#fff7ed', borderBottom: '1.5px solid #fed7aa', fontWeight: 800, color: '#7c2d12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '1rem' }}>✅ खर्च व्हाउचर मंजुरी रांग (Expense Vouchers with 7-D Filter Metadata)</span>
                        <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 600 }}>वर्ष, महिना, आठवडा, दिवस, युझर आयडी, राज्य व शहरासह प्रमाणित लेजर</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#ea580c', background: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', border: '1px solid #ea580c' }}>
                        प्रलंबित: {vouchers.filter(v => v.status.includes('Pending')).length}
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>व्हाउचर क्र.</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>वर्ष (Year)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>महिना (Month)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>आठवडा (Week)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>दिवस (Day)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>युझर आयडी / अधिकारी</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>राज्य (State)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>शहर (City)</th>
                            <th style={{ padding: '12px 14px' }}>खर्चाचा तपशील व विभाग</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>रक्कम</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>स्थिती</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>कृती</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vouchers.map(v => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c', whiteSpace: 'nowrap' }}>{v.id}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>{v.year}</td>
                              <td style={{ padding: '12px 14px', color: '#9a3412', fontWeight: 700 }}>{v.month} (सप्टें)</td>
                              <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{v.week}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>तारीख {v.day}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.78rem' }}>{v.userId}</span>
                                <div style={{ fontWeight: 800, color: '#7c2d12' }}>{v.raisedBy}</div>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#431407', fontWeight: 700 }}>{v.state}</td>
                              <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{v.city}</td>
                              <td style={{ padding: '12px 14px', color: '#431407' }}>
                                <div>{v.category}</div>
                                <small style={{ color: '#9a3412' }}>{v.dept} • {v.vendorName}</small>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#ea580c', whiteSpace: 'nowrap' }}>{v.amount}</td>
                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: '#fff7ed',
                                  border: '1px solid #ea580c',
                                  color: '#ea580c'
                                }}>
                                  {v.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                {v.status.includes('Pending') ? (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveVoucher(v)}
                                    style={{ padding: '5px 12px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    ✓ मंजुरी द्या
                                  </button>
                                ) : (
                                  <span style={{ color: '#ea580c', fontSize: '0.78rem', fontWeight: 800 }}>✓ अदा केले</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 80G Tax Exemption Donations Ledger */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '16px 20px', background: '#fff7ed', borderBottom: '1.5px solid #fed7aa', fontWeight: 800, color: '#7c2d12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '1rem' }}>🛡️ आयकर कलम ८०जी देणगी लेजर (80G Donations Detailed Register)</span>
                        <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 600 }}>वर्ष, महिना, आठवडा, दिवस, युझर आयडी, राज्य व शहर वर्गीकरण</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#ea580c', background: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', border: '1px solid #ea580c' }}>
                        ३ देणग्या नोंद
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>पावती क्र.</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>वर्ष (Year)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>महिना (Month)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>आठवडा (Week)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>दिवस (Day)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>युझर आयडी व दाता</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>राज्य (State)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>शहर (City)</th>
                            <th style={{ padding: '12px 14px' }}>निधीचे कारण (Cause)</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>रक्कम</th>
                            <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>८०जी प्रमाणपत्र</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations80G.map(d => (
                            <tr key={d.receiptNo} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c', whiteSpace: 'nowrap' }}>{d.receiptNo}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>{d.year}</td>
                              <td style={{ padding: '12px 14px', color: '#9a3412', fontWeight: 700 }}>{d.month} (सप्टें)</td>
                              <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{d.week}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>तारीख {d.day}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.78rem' }}>{d.userId}</span>
                                <div style={{ fontWeight: 800, color: '#7c2d12' }}>{d.donorName}</div>
                                <small style={{ color: '#9a3412' }}>PAN: {d.pan}</small>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#431407', fontWeight: 700 }}>{d.state}</td>
                              <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{d.city}</td>
                              <td style={{ padding: '12px 14px', color: '#431407' }}>{d.cause}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#ea580c', whiteSpace: 'nowrap' }}>{d.amount}</td>
                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, background: '#fff7ed', border: '1px solid #ea580c', color: '#ea580c' }}>
                                  ✓ {d.certStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 7: ADMINS LIST                                                       */}
              {/* ========================================================================= */}
              {activeView === 'admins' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', margin: '0 0 14px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                    🛡️ व्यवस्थापक व भूमिका व्यवस्थापन (RBAC Admin Accounts)
                  </h2>
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                            <th style={{ padding: '12px 14px' }}>आयडी</th>
                            <th style={{ padding: '12px 14px' }}>नाव व संपर्क</th>
                            <th style={{ padding: '12px 14px' }}>भूमिका (Role)</th>
                            <th style={{ padding: '12px 14px' }}>क्षेत्र (Scope)</th>
                            <th style={{ padding: '12px 14px' }}>सुरक्षा</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c' }}>{u.id}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 800, color: '#7c2d12' }}>{u.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{u.email}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, background: '#ea580c', color: '#FFFFFF' }}>
                                  {u.roleName}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#431407', fontWeight: 600 }}>{u.scope}</td>
                              <td style={{ padding: '12px 14px', color: '#ea580c', fontWeight: 800 }}>✓ {u.twoFa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 8: SETTINGS                                                          */}
              {/* ========================================================================= */}
              {activeView === 'settings' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', margin: '0 0 14px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                    ⚙️ सिस्टीम कॉन्फिगरेशन व धोरण नियंत्रण
                  </h2>
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', padding: '24px', maxWidth: '680px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ffedd5', paddingBottom: '10px' }}>
                        <span style={{ color: '#7c2d12', fontWeight: 700 }}>वार्षिक सभासद वर्गणी:</span>
                        <strong style={{ color: '#ea580c' }}>₹{systemSettings.membershipFee} / वर्ष</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ffedd5', paddingBottom: '10px' }}>
                        <span style={{ color: '#7c2d12', fontWeight: 700 }}>B2B चॅप्टर वार्षिक नोंदणी शुल्क:</span>
                        <strong style={{ color: '#ea580c' }}>₹{systemSettings.chapterAnnualFee.toLocaleString()} / वर्ष</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#7c2d12', fontWeight: 700 }}>२४x७ आपत्कालीन SMS गेटवे:</span>
                        <strong style={{ color: '#ea580c' }}>✓ ACTIVE (Online)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 9: BUSINESSES & LEADS                                                */}
              {/* ========================================================================= */}
              {(activeView === 'businesses' || activeView === 'leads') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', margin: '0 0 4px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                        🏢 व्यवसाय नोंदी व CRM B2B Leads
                      </h2>
                      <div style={{ color: '#9a3412', fontSize: '0.86rem', fontWeight: 600 }}>
                        महाराष्ट्रातील ८,४२१+ मराठी व्यावसायिकांच्या नोंदी, B2B लीड्स आणि औद्योगिक संधी
                      </div>
                    </div>
                    <Link
                      to="/business/directory"
                      style={{ padding: '8px 18px', background: '#ea580c', color: '#FFFFFF', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '0.84rem' }}
                    >
                      सार्वजनिक निर्देशिकेत उघडा →
                    </Link>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW 10: UNIVERSAL 7-DIMENSIONAL REPORTS CENTER (YEAR, MONTH, WEEK, DAY, USER ID, STATE, CITY) */}
              {/* ========================================================================= */}
              {activeView === 'reports' && (
                <div>
                  {/* Top Header & Export Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff7ed', border: '1px solid #ea580c', padding: '4px 12px', borderRadius: '20px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c' }}>
                          ⚡ 7-DIMENSIONAL ENTERPRISE REPORTING ENGINE
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.75rem', margin: '0 0 6px', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                        📈 तपशीलवार महा-अहवाल केंद्र (Universal Detailed Reports)
                      </h2>
                      <div style={{ color: '#9a3412', fontSize: '0.9rem', fontWeight: 600, maxWidth: '850px', lineHeight: 1.5 }}>
                        वर्ष (Year), महिना (Month), आठवडा (Week), दिवस (Day), युझर आयडी (User ID), राज्य (State), शहर (City) — सर्व ३६ जिल्हे, अर्थ, B2B संदर्भ, KYC, व सेवा नोंदींचा बहुआयामी लेजर.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setIsAddReportModalOpen(true)}
                        style={{ background: '#ea580c', color: '#FFFFFF', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        ➕ नवीन अहवाल नोंद
                      </button>
                      <button
                        type="button"
                        onClick={exportReportsToCSV}
                        style={{ background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', padding: '9px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        📥 CSV अहवाल
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintReport}
                        style={{ background: '#fff7ed', color: '#9a3412', border: '1.5px solid #fed7aa', padding: '9px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.86rem' }}
                      >
                        🖨️ प्रिंट (Print)
                      </button>
                    </div>
                  </div>

                  {/* Category Pills Switcher */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '18px' }}>
                    {[
                      { id: 'all', label: '📑 सर्व एकत्रित अहवाल', count: detailedReports.length },
                      { id: 'Finance', label: '💰 आर्थिक लेजर व ८०जी', count: detailedReports.filter(r => r.category === 'Finance').length },
                      { id: 'Referrals', label: '🤝 B2B संदर्भ व व्यवहार', count: detailedReports.filter(r => r.category === 'Referrals').length },
                      { id: 'Membership', label: '👥 सदस्य नोंदणी व KYC', count: detailedReports.filter(r => r.category === 'Membership').length },
                      { id: 'Seva', label: '🩸 २४x७ सेवा व आपत्कालीन', count: detailedReports.filter(r => r.category === 'Seva').length },
                      { id: 'Scholarships', label: '🎓 उच्च शिक्षण शिष्यवृत्ती', count: detailedReports.filter(r => r.category === 'Scholarships').length },
                      { id: 'Governance', label: '🏛️ धोरणात्मक व प्रशासन', count: detailedReports.filter(r => r.category === 'Governance').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setReportFilters(prev => ({ ...prev, category: tab.id }))}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '20px',
                          border: reportFilters.category === tab.id ? '2px solid #ea580c' : '1px solid #fed7aa',
                          background: reportFilters.category === tab.id ? '#ea580c' : '#FFFFFF',
                          color: reportFilters.category === tab.id ? '#FFFFFF' : '#7c2d12',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{tab.label}</span>
                        <span style={{
                          background: reportFilters.category === tab.id ? '#FFFFFF' : '#fff7ed',
                          color: reportFilters.category === tab.id ? '#ea580c' : '#9a3412',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* ========================================================================= */}
                  {/* THE UNIVERSAL 7-DIMENSIONAL FILTER BAR (WHITE & ORANGE ONLY)              */}
                  {/* ========================================================================= */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '2px solid #ea580c',
                    borderRadius: '14px',
                    padding: '20px',
                    marginBottom: '22px',
                    boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed #fed7aa', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔍</span>
                        <strong style={{ color: '#7c2d12', fontSize: '0.96rem' }}>
                          बहुआयामी फिल्टर पॅनल (7-Dimensional Detailed Filters):
                        </strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>
                          सक्रिय निकाल: <strong>{filteredDetailedReports.length} नोंदी</strong>
                        </span>
                        <button
                          type="button"
                          onClick={resetReportFilters}
                          style={{
                            background: '#fff7ed',
                            color: '#ea580c',
                            border: '1px solid #ea580c',
                            borderRadius: '6px',
                            padding: '4px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          🔄 फिल्टर्स रीसेट करा
                        </button>
                      </div>
                    </div>

                    {/* 7 Filter Selectors Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                      {/* Filter 1: YEAR */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          📅 १. वर्ष (Year)
                        </label>
                        <select
                          value={reportFilters.year}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, year: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        >
                          <option value="all">सर्व वर्षे (All Years)</option>
                          <option value="2026">२०२६ (2026 Current)</option>
                          <option value="2025">२०२५ (2025 Previous)</option>
                          <option value="2024">२०२४ (2024 Archive)</option>
                        </select>
                      </div>

                      {/* Filter 2: MONTH */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          🗓️ २. महिना (Month)
                        </label>
                        <select
                          value={reportFilters.month}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, month: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        >
                          <option value="all">सर्व महिने (All Months)</option>
                          <option value="09">०९ - सप्टेंबर (Sep)</option>
                          <option value="08">०८ - ऑगस्ट (Aug)</option>
                          <option value="07">०७ - जुलै (Jul)</option>
                          <option value="06">०६ - जून (Jun)</option>
                          <option value="05">०५ - मे (May)</option>
                          <option value="04">०४ - एप्रिल (Apr)</option>
                          <option value="03">०३ - मार्च (Mar)</option>
                          <option value="02">०२ - फेब्रुवारी (Feb)</option>
                          <option value="01">०१ - जानेवारी (Jan)</option>
                          <option value="12">१२ - डिसेंबर (Dec)</option>
                          <option value="11">११ - नोव्हेंबर (Nov)</option>
                          <option value="10">१० - ऑक्टोबर (Oct)</option>
                        </select>
                      </div>

                      {/* Filter 3: WEEK */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          📆 ३. आठवडा (Week)
                        </label>
                        <select
                          value={reportFilters.week}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, week: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        >
                          <option value="all">सर्व आठवडे (All Weeks)</option>
                          <option value="Week 38">Week 38 (चालू आठवडा)</option>
                          <option value="Week 37">Week 37</option>
                          <option value="Week 36">Week 36</option>
                          <option value="Week 35">Week 35</option>
                          <option value="Week 34">Week 34</option>
                          <option value="Week 32">Week 32</option>
                          <option value="Week 28">Week 28</option>
                          <option value="Week 24">Week 24</option>
                          <option value="Week 20">Week 20</option>
                          <option value="Week 16">Week 16</option>
                          <option value="Week 12">Week 12</option>
                          <option value="Week 8">Week 8</option>
                          <option value="Week 4">Week 4</option>
                          <option value="Week 1">Week 1</option>
                        </select>
                      </div>

                      {/* Filter 4: DAY */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          ☀️ ४. दिवस (Day)
                        </label>
                        <select
                          value={reportFilters.day}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, day: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        >
                          <option value="all">सर्व दिवस (All Days)</option>
                          {['19', '18', '17', '16', '15', '14', '12', '10', '08', '06', '05', '04', '03', '02', '01', '20', '22', '24', '26', '28', '30', '31'].map(d => (
                            <option key={d} value={d}>तारीख {d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filter 5: USER ID / NAME */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          👤 ५. युझर आयडी (User ID)
                        </label>
                        <input
                          type="text"
                          placeholder="CM-10291 किंवा नाव..."
                          value={reportFilters.userId}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, userId: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        />
                      </div>

                      {/* Filter 6: STATE */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          🚩 ६. राज्य (State)
                        </label>
                        <select
                          value={reportFilters.state}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, state: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        >
                          <option value="all">सर्व राज्ये (All States)</option>
                          <option value="महाराष्ट्र">महाराष्ट्र (Maharashtra)</option>
                          <option value="कर्नाटक (सीमाभाग)">कर्नाटक - सीमाभाग (Belgaum/Karwar)</option>
                          <option value="गोवा">गोवा (Goa)</option>
                          <option value="गुजरात">गुजरात (Gujarat)</option>
                        </select>
                      </div>

                      {/* Filter 7: CITY */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                          🏙️ ७. शहर / जिल्हा (City)
                        </label>
                        <select
                          value={reportFilters.city}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, city: e.target.value }))}
                          style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px 10px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                        >
                          <option value="all">सर्व शहरे (All Cities)</option>
                          <option value="पुणे">पुणे (Pune)</option>
                          <option value="मुंबई">मुंबई (Mumbai)</option>
                          <option value="ठाणे">ठाणे (Thane)</option>
                          <option value="सातारा">सातारा (Satara)</option>
                          <option value="कोल्हापूर">कोल्हापूर (Kolhapur)</option>
                          <option value="नाशिक">नाशिक (Nashik)</option>
                          <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
                          <option value="सोलापूर">सोलापूर (Solapur)</option>
                          <option value="नागपूर">नागपूर (Nagpur)</option>
                          <option value="रायगड">रायगड (Raigad)</option>
                          <option value="बेळगाव">बेळगाव (Belgaum)</option>
                          <option value="पणजी">पणजी (Panaji - Goa)</option>
                          <option value="सुरत">सुरत (Surat)</option>
                        </select>
                      </div>
                    </div>

                    {/* Search query input */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="🔎 शीर्षक, व्यवहार तपशील, अधिकारी किंवा टीप मधील शब्द शोधा..."
                        value={reportFilters.search}
                        onChange={(e) => setReportFilters(prev => ({ ...prev, search: e.target.value }))}
                        style={{ flex: 1, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                      />
                      {reportFilters.search && (
                        <button
                          type="button"
                          onClick={() => setReportFilters(prev => ({ ...prev, search: '' }))}
                          style={{ background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          ✕ क्लिअर
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Real-time Filtered KPI Aggregates */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                    <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>एकूण फिल्टर केलेल्या नोंदी</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>
                        {filteredDetailedReports.length} <span style={{ fontSize: '0.9rem', color: '#9a3412' }}>नोंदी</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 700 }}>
                        {reportFilters.year === 'all' ? 'सर्व वर्षांमधील' : `${reportFilters.year} मधील`}
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>एकूण आर्थिक / निधी उलाढाल</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>
                        ₹{filteredDetailedReports.reduce((acc, r) => acc + (r.amountNumeric || 0), 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 700 }}>व्यवहार व देणग्यांची बेरीज</div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>सक्रिय युझर आयडी (Unique)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>
                        {new Set(filteredDetailedReports.map(r => r.userId)).size} <span style={{ fontSize: '0.9rem', color: '#9a3412' }}>व्यक्ती / अधिकारी</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 700 }}>पडताळणी झालेले सभासद</div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>भौगोलिक व्याप्ती</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2' }}>
                        {new Set(filteredDetailedReports.map(r => r.city)).size} <span style={{ fontSize: '0.9rem', color: '#9a3412' }}>शहरे</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 700 }}>
                        {new Set(filteredDetailedReports.map(r => r.state)).size} राज्ये समाविष्ट
                      </div>
                    </div>
                  </div>

                  {/* Detailed Formatted Reports Table */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #fed7aa', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '14px 20px', background: '#fff7ed', borderBottom: '1.5px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#7c2d12', fontSize: '0.95rem' }}>
                        📋 तपशीलवार बहुआयामी लेजर तक्ता (Detailed Formatted Master Ledger)
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ea580c' }}>
                        दाखवत आहे: {filteredDetailedReports.length} पैकी {filteredDetailedReports.length} नोंदी
                      </span>
                    </div>

                    {filteredDetailedReports.length === 0 ? (
                      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
                        <h4 style={{ color: '#7c2d12', margin: '0 0 6px', fontFamily: 'Baloo 2', fontSize: '1.2rem' }}>
                          निवडलेल्या ७ फिल्टर्सनुसार कोणतीही नोंद आढळली नाही
                        </h4>
                        <p style={{ color: '#9a3412', fontSize: '0.86rem', maxWidth: '500px', margin: '0 auto 16px' }}>
                          वर्ष, महिना, आठवडा, दिवस, युझर आयडी, राज्य अथवा शहराचे फिल्टर बदलून पुन्हा प्रयत्न करा.
                        </p>
                        <button
                          type="button"
                          onClick={resetReportFilters}
                          style={{ padding: '8px 18px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.84rem' }}
                        >
                          सर्व फिल्टर्स रीसेट करा
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>अहवाल क्र.</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>वर्ष (Year)</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>महिना (Month)</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>आठवडा (Week)</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>दिवस (Day)</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>युझर आयडी व नाव</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>राज्य (State)</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>शहर (City)</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>प्रवर्ग (Category)</th>
                              <th style={{ padding: '12px 14px' }}>तपशील व कार्य</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>रक्कम / मूल्य</th>
                              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>स्थिती</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>कृती</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDetailedReports.map(r => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                                {/* 1. Report ID */}
                                <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c', whiteSpace: 'nowrap' }}>
                                  {r.id}
                                </td>

                                {/* 2. Year */}
                                <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407', whiteSpace: 'nowrap' }}>
                                  {r.year}
                                </td>

                                {/* 3. Month */}
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', padding: '2px 7px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
                                    {r.month} ({r.monthName || r.month})
                                  </span>
                                </td>

                                {/* 4. Week */}
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>
                                  {r.week}
                                </td>

                                {/* 5. Day */}
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontWeight: 800, color: '#431407' }}>{r.day}</div>
                                  <small style={{ color: '#9a3412', fontSize: '0.72rem' }}>{r.dayName || ''}</small>
                                </td>

                                {/* 6. User ID & Name */}
                                <td style={{ padding: '12px 14px', minWidth: '160px' }}>
                                  <div style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.8rem' }}>{r.userId}</div>
                                  <div style={{ fontWeight: 700, color: '#7c2d12' }}>{r.userName}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#9a3412' }}>{r.role}</div>
                                </td>

                                {/* 7. State */}
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 700, color: '#431407' }}>
                                  {r.state}
                                </td>

                                {/* 8. City */}
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontWeight: 700, color: '#7c2d12' }}>{r.city}</div>
                                  {r.taluka && <div style={{ fontSize: '0.72rem', color: '#9a3412' }}>ता. {r.taluka}</div>}
                                </td>

                                {/* 9. Category */}
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    background: '#fff7ed',
                                    border: '1px solid #ea580c',
                                    color: '#ea580c'
                                  }}>
                                    {r.category}
                                  </span>
                                </td>

                                {/* 10. Title / Details */}
                                <td style={{ padding: '12px 14px', minWidth: '220px' }}>
                                  <div style={{ fontWeight: 700, color: '#431407' }}>{r.title}</div>
                                  {r.notes && <div style={{ fontSize: '0.75rem', color: '#9a3412', marginTop: '2px' }}>{r.notes}</div>}
                                </td>

                                {/* 11. Amount / Value */}
                                <td style={{ padding: '12px 14px', fontWeight: 900, color: '#ea580c', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                  {r.amount || '—'}
                                </td>

                                {/* 12. Status */}
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    background: r.status.includes('यशस्वी') || r.status.includes('Completed') || r.status.includes('Approved') || r.status.includes('मंजूर') || r.status.includes('Verified') ? '#fff7ed' : '#FFFFFF',
                                    border: '1px solid #ea580c',
                                    color: '#ea580c'
                                  }}>
                                    ✓ {r.status}
                                  </span>
                                </td>

                                {/* 13. Actions */}
                                <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button
                                      type="button"
                                      title="तपशील पहा"
                                      onClick={() => setSelectedReportDetail(r)}
                                      style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}
                                    >
                                      👁️
                                    </button>
                                    <button
                                      type="button"
                                      title="संपादन करा"
                                      onClick={() => setEditingReport({ ...r })}
                                      style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      title="हटवा"
                                      onClick={() => handleDeleteReport(r.id)}
                                      style={{ background: '#FFFFFF', border: '1px solid #ea580c', color: '#ea580c', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: APPLICANT KYC DOSSIER (WHITE & ORANGE)                           */}
      {/* ========================================================================= */}
      {selectedApplicantDossier && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(67, 20, 7, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #ea580c',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c' }}>सदस्य KYC संपूर्ण पडताळणी डोसिअर</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                  {selectedApplicantDossier.name} ({selectedApplicantDossier.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicantDossier(null)}
                style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <img
                  src={selectedApplicantDossier.photoUrl}
                  alt={selectedApplicantDossier.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #ea580c' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                <div><span style={{ color: '#9a3412' }}>वडिलांचे/पतीचे नाव:</span> <strong>{selectedApplicantDossier.fatherName}</strong></div>
                <div><span style={{ color: '#9a3412' }}>मोबाईल:</span> <strong>{selectedApplicantDossier.mobile}</strong></div>
                <div><span style={{ color: '#9a3412' }}>पत्ता:</span> <span>{selectedApplicantDossier.address}</span></div>
                <div><span style={{ color: '#9a3412' }}>उद्योग/कंपनी:</span> <strong style={{ color: '#ea580c' }}>{selectedApplicantDossier.company}</strong></div>
                <div><span style={{ color: '#9a3412' }}>आधार (मास्क):</span> <strong>{selectedApplicantDossier.aadhaarMasked}</strong></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #fed7aa', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => handleRequestReupload(selectedApplicantDossier.id, selectedApplicantDossier.name)}
                style={{ padding: '9px 16px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                ⚠️ फेरअपलोड विनंती
              </button>
              <button
                type="button"
                onClick={() => handleRejectMember(selectedApplicantDossier.id, selectedApplicantDossier.name)}
                style={{ padding: '9px 16px', background: '#FFFFFF', color: '#c2410c', border: '1.5px solid #c2410c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                ✕ अर्ज नाकारा
              </button>
              <button
                type="button"
                onClick={() => handleApproveMember(selectedApplicantDossier.id, selectedApplicantDossier.name)}
                style={{ padding: '9px 20px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                ✓ डिजिटल ओळखपत्र मंजूर करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEW REFERRAL SLIP (WHITE & ORANGE)                               */}
      {/* ========================================================================= */}
      {isReferralModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(67, 20, 7, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #ea580c',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '26px',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                🤝 नवीन व्यवसाय रेफरल स्लिप जारी करा
              </h3>
              <button onClick={() => setIsReferralModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>रेफरल देणारा सदस्य (Giver):</label>
                <input
                  type="text"
                  value={newReferralForm.giver}
                  onChange={(e) => setNewReferralForm({ ...newReferralForm, giver: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>स्वीकारणारा सदस्य (Receiver):</label>
                <input
                  type="text"
                  value={newReferralForm.receiver}
                  onChange={(e) => setNewReferralForm({ ...newReferralForm, receiver: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>ग्राहकाचे नाव:</label>
                  <input
                    type="text"
                    value={newReferralForm.clientName}
                    onChange={(e) => setNewReferralForm({ ...newReferralForm, clientName: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>अपेक्षित मूल्य (₹):</label>
                  <input
                    type="text"
                    value={newReferralForm.amount}
                    onChange={(e) => setNewReferralForm({ ...newReferralForm, amount: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>कामाचे स्वरूप (Requirement):</label>
                <textarea
                  rows="3"
                  value={newReferralForm.requirement}
                  onChange={(e) => setNewReferralForm({ ...newReferralForm, requirement: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600, resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsReferralModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ स्लिप जारी करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EMERGENCY BLOOD DISPATCH (WHITE & ORANGE)                        */}
      {/* ========================================================================= */}
      {isBloodModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(67, 20, 7, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #ea580c',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '26px',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                🚨 आपत्कालीन रक्त विनंती व स्वयंसेवक डिस्पॅच
              </h3>
              <button onClick={() => setIsBloodModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchBlood} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>रुग्णाचे पूर्ण नाव:</label>
                  <input
                    type="text"
                    value={bloodDispatchForm.patient}
                    onChange={(e) => setBloodDispatchForm({ ...bloodDispatchForm, patient: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>रक्तगट:</label>
                  <select
                    value={bloodDispatchForm.group}
                    onChange={(e) => setBloodDispatchForm({ ...bloodDispatchForm, group: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 700 }}
                  >
                    <option value="O- Negative">O- Negative</option>
                    <option value="O+ Positive">O+ Positive</option>
                    <option value="A+ Positive">A+ Positive</option>
                    <option value="B+ Positive">B+ Positive</option>
                    <option value="AB+ Positive">AB+ Positive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#9a3412', display: 'block', marginBottom: '4px', fontWeight: 700 }}>रुग्णालयाचे नाव व शहर:</label>
                <input
                  type="text"
                  value={bloodDispatchForm.hospital}
                  onChange={(e) => setBloodDispatchForm({ ...bloodDispatchForm, hospital: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsBloodModalOpen(false)}
                  style={{ padding: '9px 16px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  🚨 स्वयंसेवक पाठवा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT ENTRY DETAIL INSPECTOR (WHITE & ORANGE)                     */}
      {/* ========================================================================= */}
      {selectedReportDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(67, 20, 7, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #ea580c',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c' }}>
                  अहवाल तपशील (Report Details) • {selectedReportDetail.id}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                  {selectedReportDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportDetail(null)}
                style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px', fontSize: '0.86rem' }}>
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.74rem' }}>१. वर्ष (Year):</span>
                <strong style={{ color: '#431407', fontSize: '1rem' }}>{selectedReportDetail.year}</strong>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.74rem' }}>२. महिना (Month):</span>
                <strong style={{ color: '#431407', fontSize: '1rem' }}>{selectedReportDetail.month} ({selectedReportDetail.monthName || selectedReportDetail.month})</strong>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.74rem' }}>३. आठवडा (Week):</span>
                <strong style={{ color: '#431407', fontSize: '1rem' }}>{selectedReportDetail.week}</strong>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.74rem' }}>४. दिवस (Day):</span>
                <strong style={{ color: '#431407', fontSize: '1rem' }}>तारीख {selectedReportDetail.day} ({selectedReportDetail.dayName || ''})</strong>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.74rem' }}>५. युझर आयडी व नाव:</span>
                <strong style={{ color: '#ea580c', display: 'block' }}>{selectedReportDetail.userId}</strong>
                <span style={{ color: '#7c2d12', fontWeight: 700 }}>{selectedReportDetail.userName}</span>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.74rem' }}>६. राज्य व शहर:</span>
                <strong style={{ color: '#431407' }}>{selectedReportDetail.state}</strong>
                <div style={{ color: '#7c2d12' }}>{selectedReportDetail.city} {selectedReportDetail.taluka ? `(ता. ${selectedReportDetail.taluka})` : ''}</div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #fed7aa', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>प्रवर्ग (Category):</span>
                <span style={{ background: '#fff7ed', border: '1px solid #ea580c', color: '#ea580c', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  {selectedReportDetail.category}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>रक्कम / मूल्य:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c' }}>
                  {selectedReportDetail.amount}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>स्थिती (Status):</span>
                <span style={{ color: '#ea580c', fontWeight: 800 }}>✓ {selectedReportDetail.status}</span>
              </div>
              {selectedReportDetail.officer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9a3412', fontWeight: 700 }}>पडताळणी अधिकारी:</span>
                  <span style={{ color: '#7c2d12', fontWeight: 700 }}>{selectedReportDetail.officer}</span>
                </div>
              )}
              {selectedReportDetail.notes && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #fed7aa' }}>
                  <span style={{ color: '#9a3412', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>ऑडिट टीप:</span>
                  <p style={{ margin: '4px 0 0', color: '#431407', fontSize: '0.86rem', lineHeight: 1.5 }}>{selectedReportDetail.notes}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingReport({ ...selectedReportDetail });
                  setSelectedReportDetail(null);
                }}
                style={{ padding: '8px 16px', background: '#fff7ed', color: '#ea580c', border: '1px solid #ea580c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.84rem' }}
              >
                ✏️ संपादन करा
              </button>
              <button
                type="button"
                onClick={() => setSelectedReportDetail(null)}
                style={{ padding: '8px 20px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.84rem' }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT REPORT RECORD (WHITE & ORANGE)                                */}
      {/* ========================================================================= */}
      {editingReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(67, 20, 7, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #ea580c',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                ✏️ अहवाल नोंद संपादन ({editingReport.id})
              </h3>
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>वर्ष (Year)</label>
                  <select
                    value={editingReport.year}
                    onChange={(e) => setEditingReport({ ...editingReport, year: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>महिना (Month)</label>
                  <select
                    value={editingReport.month}
                    onChange={(e) => setEditingReport({ ...editingReport, month: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>आठवडा (Week)</label>
                  <input
                    type="text"
                    value={editingReport.week}
                    onChange={(e) => setEditingReport({ ...editingReport, week: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>दिवस (Day)</label>
                  <input
                    type="text"
                    value={editingReport.day}
                    onChange={(e) => setEditingReport({ ...editingReport, day: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>युझर आयडी (User ID)</label>
                  <input
                    type="text"
                    value={editingReport.userId}
                    onChange={(e) => setEditingReport({ ...editingReport, userId: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>युझरचे नाव (Name)</label>
                  <input
                    type="text"
                    value={editingReport.userName}
                    onChange={(e) => setEditingReport({ ...editingReport, userName: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>राज्य (State)</label>
                  <input
                    type="text"
                    value={editingReport.state}
                    onChange={(e) => setEditingReport({ ...editingReport, state: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>शहर (City)</label>
                  <input
                    type="text"
                    value={editingReport.city}
                    onChange={(e) => setEditingReport({ ...editingReport, city: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>प्रवर्ग (Category)</label>
                  <select
                    value={editingReport.category}
                    onChange={(e) => setEditingReport({ ...editingReport, category: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="Finance">Finance</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Membership">Membership</option>
                    <option value="Seva">Seva</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>तपशील / शीर्षक (Title)</label>
                <input
                  type="text"
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 10px', color: '#431407', fontSize: '0.86rem', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>रक्कम (Amount)</label>
                  <input
                    type="text"
                    value={editingReport.amount}
                    onChange={(e) => setEditingReport({ ...editingReport, amount: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>स्थिती (Status)</label>
                  <select
                    value={editingReport.status}
                    onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="यशस्वी (Completed)">यशस्वी (Completed)</option>
                    <option value="मंजूर (Approved)">मंजूर (Approved)</option>
                    <option value="सत्यापित (Verified)">सत्यापित (Verified)</option>
                    <option value="प्रलंबित (Pending)">प्रलंबित (Pending)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>टीप (Notes)</label>
                <textarea
                  rows={2}
                  value={editingReport.notes || ''}
                  onChange={(e) => setEditingReport({ ...editingReport, notes: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  style={{ padding: '8px 16px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 22px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW DETAILED REPORT ENTRY (WHITE & ORANGE)                     */}
      {/* ========================================================================= */}
      {isAddReportModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(67, 20, 7, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #ea580c',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c' }}>
                  ७-आयामी लेजर प्रणाली (7-Dimensional Entry)
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                  ➕ नवीन अहवाल नोंद दाखल करा
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>१. वर्ष (Year)</label>
                  <select
                    value={newReportForm.year}
                    onChange={(e) => setNewReportForm({ ...newReportForm, year: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>२. महिना (Month)</label>
                  <select
                    value={newReportForm.month}
                    onChange={(e) => setNewReportForm({ ...newReportForm, month: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>३. आठवडा (Week)</label>
                  <input
                    type="text"
                    value={newReportForm.week}
                    placeholder="Week 38"
                    onChange={(e) => setNewReportForm({ ...newReportForm, week: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>४. दिवस (Day)</label>
                  <input
                    type="text"
                    value={newReportForm.day}
                    placeholder="19"
                    onChange={(e) => setNewReportForm({ ...newReportForm, day: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>५. युझर आयडी (User ID)</label>
                  <input
                    type="text"
                    placeholder="CM-10291"
                    value={newReportForm.userId}
                    onChange={(e) => setNewReportForm({ ...newReportForm, userId: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>युझरचे नाव (Name)</label>
                  <input
                    type="text"
                    placeholder="उदा. तानाजी विठ्ठलराव जाधव"
                    value={newReportForm.userName}
                    onChange={(e) => setNewReportForm({ ...newReportForm, userName: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>६. राज्य (State)</label>
                  <select
                    value={newReportForm.state}
                    onChange={(e) => setNewReportForm({ ...newReportForm, state: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="महाराष्ट्र">महाराष्ट्र</option>
                    <option value="कर्नाटक (सीमाभाग)">कर्नाटक (सीमाभाग)</option>
                    <option value="गोवा">गोवा</option>
                    <option value="गुजरात">गुजरात</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>७. शहर (City)</label>
                  <input
                    type="text"
                    placeholder="उदा. पुणे"
                    value={newReportForm.city}
                    onChange={(e) => setNewReportForm({ ...newReportForm, city: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>प्रवर्ग (Category)</label>
                  <select
                    value={newReportForm.category}
                    onChange={(e) => setNewReportForm({ ...newReportForm, category: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="Finance">Finance</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Membership">Membership</option>
                    <option value="Seva">Seva</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>तपशील / शीर्षक (Title)</label>
                <input
                  type="text"
                  placeholder="उदा. शिवनेरी चॅप्टर — कृषी निर्यात कंत्राट"
                  value={newReportForm.title}
                  onChange={(e) => setNewReportForm({ ...newReportForm, title: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 10px', color: '#431407', fontSize: '0.86rem', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>रक्कम (Amount)</label>
                  <input
                    type="text"
                    placeholder="उदा. ₹१,५०,०००"
                    value={newReportForm.amount}
                    onChange={(e) => setNewReportForm({ ...newReportForm, amount: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>स्थिती (Status)</label>
                  <select
                    value={newReportForm.status}
                    onChange={(e) => setNewReportForm({ ...newReportForm, status: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="मंजूर (Approved)">मंजूर (Approved)</option>
                    <option value="यशस्वी (Completed)">यशस्वी (Completed)</option>
                    <option value="सत्यापित (Verified)">सत्यापित (Verified)</option>
                    <option value="प्रलंबित (Pending)">प्रलंबित (Pending)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>ऑडिट टीप (Notes)</label>
                <textarea
                  rows={2}
                  placeholder="अहवालासंदर्भात अतिरिक्त माहिती..."
                  value={newReportForm.notes}
                  onChange={(e) => setNewReportForm({ ...newReportForm, notes: e.target.value })}
                  style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '6px 8px', color: '#431407', fontSize: '0.84rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddReportModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 22px', background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ➕ नोंद दाखल करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
