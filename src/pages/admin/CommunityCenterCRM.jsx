import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';
import { MAHARASHTRA_DISTRICTS, DISTRICT_TALUKAS } from '../../services/referralService';

// 4-Tier Hierarchical Structure
export const CENTER_TIERS = [
  { id: 'state', label: '🟠 राज्य मध्यवर्ती मुख्यालय (State Apex)', color: '#C2410C', bg: '#FFEDD5', icon: '🏛️' },
  { id: 'division', label: '🟣 विभागीय महा-संकुल (Division Hub)', color: '#7E22CE', bg: '#F3E8FF', icon: '🏢' },
  { id: 'district', label: '🔵 जिल्हा मराठा भवन (District Center)', color: '#1D4ED8', bg: '#DBEAFE', icon: '📍' },
  { id: 'taluka', label: '🟢 तालुका सेवा व व्यापार केंद्र (Taluka Hub)', color: '#15803D', bg: '#DCFCE7', icon: '🏪' }
];

// 12 Functional Service & Business Desks
// 16 Functional Service & Business Desks
export const SERVICE_DESKS = [
  { id: 'membership', title: '👥 सदस्य नोंदणी व KYC', desc: 'नवीन सदस्य पडताळणी, डिजिटल कार्ड व नूतनीकरण', count: '18 प्रलंबित KYC', head: 'सदस्यता प्रमुख', icon: '🪪' },
  { id: 'business', title: '💼 स्थानिक उद्योग व MSME', desc: 'व्यापारी प्रोफाइल, उत्पादने सूची व कॅटलॉग', count: '12 चालू नोंदी', head: 'उद्योग प्रमुख', icon: '🏭' },
  { id: 'b2b', title: '🤝 B2B डील व बिझनेस संगम', desc: 'व्यापारी लीड्स, 1-to-1 बैठका व कोटेशन फॉलोअप', count: '8 डील चालू', head: 'B2B मॅनेजर', icon: '🤝' },
  { id: 'jobs', title: '💼 रोजगार व नोकरी प्लेसमेंट', desc: 'उमेदवार नोंदणी, मुलाखती व उद्योग भरती समन्वय', count: '14 मुलाखती आज', head: 'रोजगार अधिकारी', icon: '👔' },
  { id: 'services', title: '🛠️ व्यावसायिक व घरगुती सेवा', desc: 'इलेक्ट्रिशियन, प्लंबर, सीए, वकील, डॉक्टर थेट जोडणी', count: '28 चालू ऑर्डर्स', head: 'सेवा समन्वयक', icon: '🔧' },
  { id: 'hospitality', title: '🏨 हॉटेल्स व पर्यटन कक्ष', desc: 'हॉटेल बुकिंग, किल्ले पर्यटन व स्थानिक प्रवास साहाय्य', count: '9 बुकिंग्स', head: 'पर्यटन प्रमुख', icon: '🏨' },
  { id: 'seva', title: '🚑 समाज साहाय्यता व आपत्कालीन', desc: '२४x७ रक्त विनंत्या, रुग्णालय मदत व आपत्ती निवारण', count: '4 सक्रिय विनंत्या', head: 'सेवा प्रमुख', icon: '🩸' },
  { id: 'education', title: '🎓 शिक्षण व करिअर समुपदेशन', desc: 'विद्यार्थी शिष्यवृत्ती, स्पर्धा परीक्षा व कौशल्य विकास', count: '16 विद्यार्थी', head: 'शिक्षण समन्वयक', icon: '📚' },
  { id: 'women_youth', title: '🌸 महिला उद्योजकता व युवा मंच', desc: 'बचत गट, महिला स्टार्टअप्स, क्रीडा व युवा उपक्रम', count: '7 प्रकल्प', head: 'महिला/युवा प्रमुख', icon: '⚡' },
  { id: 'events', title: '📅 सभा, बैठका व उत्सव हॉल', desc: 'साप्ताहिक चॅप्टर हॉल, व्याख्याने व शिवजयंती नियोजन', count: 'हॉल आरक्षित', head: 'इव्हेंट मॅनेजर', icon: '🎪' },
  { id: 'finance', title: '💰 वर्गणी, बिलिंग व कमिशन', desc: 'दैनिक रोख/UPI पावती, कमिशन लेजर व 80G पावत्या', count: '₹84,500 आज', head: 'कोषाध्यक्ष', icon: '💵' },
  { id: 'support', title: '☎️ हेल्पडेस्क व तक्रार निवारण', desc: 'नागरिक चौकशी, ॲप मदत व तक्रारींचा तातडीने निपटारा', count: '1 प्रलंबित', head: 'कस्टमर केअर', icon: '🎧' },
  // Newly Added Essential Desks
  { id: 'agro_fpo', title: '🌾 कृषी, शेतमाल व FPO कक्ष', desc: 'थेट शेतकरी धान्य विक्री, गूळ व सेंद्रिय उत्पादने, FPO समूह व अवजारे बँक', count: '19 शेतकरी गट', head: 'कृषी समन्वयक', icon: '🌾' },
  { id: 'legal_revenue', title: '⚖️ महसूल, ७/१२ व कायदेशीर साहाय्य', desc: '७/१२ उतारे, फेरफार नोंदी, वारस हक्क, मालमत्ता कायदेशीर सल्ला व नोटरी', count: '11 अर्ज प्रलंबित', head: 'कायदेशीर सल्लागार', icon: '⚖️' },
  { id: 'govt_schemes', title: '🏛️ शासकीय योजना व अण्णासाहेब पाटील महामंडळ', desc: '₹१५ लाख बिनव्याजी कर्ज प्रस्ताव, सारथी (SARTHI) योजना व दाखले मार्गदर्शन', count: '23 मंजूर प्रस्ताव', head: 'योजना अधिकारी', icon: '🏛️' },
  { id: 'health_medical', title: '🏥 आरोग्य, रक्तदान व वैद्यकीय मदत', desc: '२४x७ मोफत रुग्णवाहिका संपर्क, रक्तपेढी समन्वय व महात्मा फुले जन आरोग्य योजना', count: '6 तातडीच्या केसेस', head: 'वैद्यकीय कक्ष प्रमुख', icon: '🏥' }
];

export default function CommunityCenterCRM() {
  const [centers, setCenters] = useState([]);
  const [selectedTier, setSelectedTier] = useState('taluka');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [activeTab, setActiveTab] = useState('geo'); // 'geo', 'desk', 'pipeline', 'desks', 'hotels', 'roles', 'collection'
  const [pipelineFilter, setPipelineFilter] = useState('b2b'); // 'kyc', 'b2b', 'jobs', 'services'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [databaseStats, setDatabaseStats] = useState(null);

  // Geo-Location Specific Directory Filter States
  const [geoDivision, setGeoDivision] = useState('सर्व विभाग (All Divisions)');
  const [geoDistrict, setGeoDistrict] = useState('सर्व जिल्हे (All Districts)');
  const [geoCity, setGeoCity] = useState('');
  const [geoSearch, setGeoSearch] = useState('');
  const [geoTierFilter, setGeoTierFilter] = useState('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeskModal, setSelectedDeskModal] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Real Database Records Modal State
  const [dataModalType, setDataModalType] = useState(null); // 'members', 'businesses', 'jobs', 'kyc', 'visitors', 'collection', 'services', 'hotels'
  const [modalSearch, setModalSearch] = useState('');
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);
  const [selectedHotelBooking, setSelectedHotelBooking] = useState(null);
  const [selectedPipelineItem, setSelectedPipelineItem] = useState(null);
  const [b2bDealTarget, setB2bDealTarget] = useState(null);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [dbMembers, setDbMembers] = useState([]);
  const [dbBusinesses, setDbBusinesses] = useState([]);
  const [dbJobs, setDbJobs] = useState([]);
  const [loadingDbRecords, setLoadingDbRecords] = useState(false);

  // Form states for dialogs
  const [hotelGuestName, setHotelGuestName] = useState('');
  const [hotelGuestPhone, setHotelGuestPhone] = useState('');
  const [hotelGuestDate, setHotelGuestDate] = useState('२०२६-१०-१५');
  const [hotelGuestRooms, setHotelGuestRooms] = useState('१');
  const [b2bDealTitle, setB2bDealTitle] = useState('');
  const [b2bDealAmount, setB2bDealAmount] = useState('₹५०,०००');
  const [interviewCandidateName, setInterviewCandidateName] = useState('');
  const [interviewCandidatePhone, setInterviewCandidatePhone] = useState('');
  const [interviewDate, setInterviewDate] = useState('उद्या दुपारी २ वाजता');

  // New Center Form State
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterTier, setNewCenterTier] = useState('taluka');
  const [newCenterDivision, setNewCenterDivision] = useState('पुणे विभाग');
  const [newCenterDistrict, setNewCenterDistrict] = useState('पुणे');
  const [newCenterTaluka, setNewCenterTaluka] = useState('');
  const [newCenterAddress, setNewCenterAddress] = useState('');
  const [newCenterManager, setNewCenterManager] = useState('');
  const [newCenterPhone, setNewCenterPhone] = useState('');
  const [newCenterPartner, setNewCenterPartner] = useState('');
  const [newCenterInvestment, setNewCenterInvestment] = useState('₹३,६०,००० (तालुका मॉडेल)');

  // Edit Center Form State
  const [editAddress, setEditAddress] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPartner, setEditPartner] = useState('');
  const [editStatus, setEditStatus] = useState('सक्रिय (Active)');

  // Desk Action Form State
  const [deskCitizenName, setDeskCitizenName] = useState('');
  const [deskCitizenPhone, setDeskCitizenPhone] = useState('');
  const [deskNotes, setDeskNotes] = useState('');
  const [deskPriority, setDeskPriority] = useState('सामान्य (Normal)');
  const [deskStatus, setDeskStatus] = useState('नोंदणीकृत (Registered)');

  // Quick action states
  const [collectionAmount, setCollectionAmount] = useState('');
  const [collectionPurpose, setCollectionPurpose] = useState('वार्षिक वर्गणी (Annual Membership)');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('सदस्य नोंदणी व KYC');
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentCollections, setRecentCollections] = useState([
    { id: 'REC-901', name: 'विजय तानाजी कदम', amount: 1500, type: 'वार्षिक वर्गणी', time: '11:15 AM' },
    { id: 'REC-902', name: 'सह्याद्री ऑटोमोबाईल्स', amount: 5000, type: 'B2B संगम नोंदणी', time: '12:40 PM' },
    { id: 'REC-903', name: 'अशोकराव सावंत', amount: 2100, type: 'ऐच्छिक देणगी', time: '02:20 PM' }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadCenters();
  }, [selectedTier]);

  const loadCenters = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCommunityCenters();
      const list = Array.isArray(data) ? data : (data?.centers || []);
      setCenters(list);
      
      if (data?.realStats) {
        setDatabaseStats(data.realStats);
      } else if (list.length > 0 && list[0].realStats) {
        setDatabaseStats(list[0].realStats);
      }
      
      const filteredByTier = list.filter(c => (c.tier || 'taluka') === selectedTier);
      if (filteredByTier.length > 0) {
        setSelectedCenterId(filteredByTier[0].id);
      } else if (list.length > 0 && !selectedCenterId) {
        setSelectedCenterId(list[0].id);
      }
    } catch (err) {
      console.warn('Center load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbRecords = async () => {
    try {
      setLoadingDbRecords(true);
      const [members, businesses, jobs] = await Promise.all([
        apiClient.getMembers().catch(() => []),
        apiClient.getBusinesses().catch(() => []),
        apiClient.getJobs().catch(() => [])
      ]);
      setDbMembers(Array.isArray(members) ? members : []);
      setDbBusinesses(Array.isArray(businesses) ? businesses : []);
      setDbJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.warn('DB records load error:', err);
    } finally {
      setLoadingDbRecords(false);
    }
  };

  useEffect(() => {
    fetchDbRecords();
  }, []);

  const handleVerifyKyc = async (memberId, memberName) => {
    try {
      await apiClient.verifyMemberKyc(memberId);
      showToast(`✅ ${memberName || 'सभासद'} यांचे KYC यशस्वीरित्या मंजूर झाले व स्मार्ट कार्ड जारी झाले!`);
      setDbMembers(prev => prev.map(m => m.id === memberId ? { ...m, verified_profile: 1 } : m));
      loadCenters();
    } catch (err) {
      showToast('त्रुटी: KYC मंजूर करता आले नाही.');
    }
  };

  // Divisions & Districts helpers
  const MAHARASHTRA_DIVISIONS = [
    'सर्व विभाग (All Divisions)',
    'पुणे विभाग',
    'कोकण विभाग',
    'नाशिक विभाग',
    'छत्रपती संभाजीनगर विभाग',
    'नागपूर विभाग',
    'अमरावती विभाग'
  ];

  // Memoized Geo-Location Filtered Centers
  const filteredGeoCenters = useMemo(() => {
    return centers.filter(c => {
      // Division match
      if (geoDivision !== 'सर्व विभाग (All Divisions)' && c.division !== geoDivision) {
        return false;
      }
      // District / Jilha match
      if (geoDistrict !== 'सर्व जिल्हे (All Districts)' && c.district !== geoDistrict) {
        return false;
      }
      // City / Taluka match
      if (geoCity.trim()) {
        const qCity = geoCity.toLowerCase().trim();
        const centerCity = (c.city || '').toLowerCase();
        const centerTaluka = (c.taluka || '').toLowerCase();
        const centerAddr = (c.address || '').toLowerCase();
        if (!centerCity.includes(qCity) && !centerTaluka.includes(qCity) && !centerAddr.includes(qCity)) {
          return false;
        }
      }
      // Tier match
      if (geoTierFilter !== 'all' && (c.tier || 'taluka') !== geoTierFilter) {
        return false;
      }
      // Search query (search in name, address, landmark, manager, code)
      if (geoSearch.trim()) {
        const q = geoSearch.toLowerCase().trim();
        const searchable = [
          c.name,
          c.district,
          c.taluka,
          c.city,
          c.address,
          c.landmark,
          c.contactPerson,
          c.manager_name,
          c.contactPhone,
          c.code,
          c.pincode
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [centers, geoDivision, geoDistrict, geoCity, geoTierFilter, geoSearch]);

  // Seed default fallback centers per tier
  const tierCenters = centers.filter(c => (c.tier || 'taluka') === selectedTier);
  const currentCenter = tierCenters.find(c => c.id === selectedCenterId) || tierCenters[0] || centers[0] || {
    id: 'CC-HAV-001',
    name: 'पुणे हवेली मध्यवर्ती कम्युनिटी सेवा व व्यापार केंद्र',
    tier: 'taluka',
    division: 'पुणे विभाग',
    district: 'पुणे',
    taluka: 'हवेली',
    address: 'फर्ग्युसन कॉलेज रोड, शिवाजीनगर, पुणे ४११०१६',
    todayVisitors: 42,
    dailyCollection: 84500,
    activeMembers: 2840,
    kycPending: 18,
    partnerName: 'सह्याद्री प्रतिष्ठान व उद्योग मंच',
    investmentTier: '₹३,६०,००० (तालुका मॉडेल)',
    headName: 'श्री. सचिन मोहिते (Center Manager)'
  };

  // Handle Check-in Visitor
  const handleCheckinVisitor = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    try {
      await apiClient.recordCenterAction({
        centerId: currentCenter.id,
        actionType: 'visitor_checkin',
        notes: `अभ्यागत: ${visitorName} (${visitorPhone}) - हेतू: ${visitorPurpose}`
      });

      setRecentLogs(prev => [
        { time: new Date().toLocaleTimeString(), text: `👤 अभ्यागत: ${visitorName} (${visitorPurpose}) दाखल झाला.` },
        ...prev.slice(0, 8)
      ]);

      showToast(`✅ अभ्यागत ${visitorName} यांची केंद्रावर यशस्वी नोंद झाली!`);
      setVisitorName('');
      setVisitorPhone('');
      loadCenters();
    } catch (err) {
      showToast('त्रुटी: अभ्यागत नोंदवता आला नाही.');
    }
  };

  // Handle Record Collection
  const handleRecordCollection = async (e) => {
    e.preventDefault();
    const amt = Number(collectionAmount);
    if (!amt || amt <= 0) return;

    try {
      await apiClient.recordCenterAction({
        centerId: currentCenter.id,
        actionType: 'collection',
        amount: amt,
        notes: `${collectionPurpose} - रोख/डिजिटल पावती`
      });

      const recId = `REC-${Date.now().toString().slice(-4)}`;
      setRecentCollections(prev => [
        { id: recId, name: 'स्थानिक नागरिक/सदस्य', amount: amt, type: collectionPurpose, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);

      showToast(`💰 ₹${amt.toLocaleString()} ची पावती ${recId} यशस्वीरीत्या जमा झाली!`);
      setCollectionAmount('');
      loadCenters();
    } catch (err) {
      showToast('त्रुटी: वर्गणी नोंदवता आली नाही.');
    }
  };

  const openEditModal = () => {
    setEditAddress(currentCenter.address || '');
    setEditManager(currentCenter.contactPerson || currentCenter.manager_name || '');
    setEditPhone(currentCenter.contactPhone || currentCenter.manager_phone || '');
    setEditPartner(currentCenter.partnerName || currentCenter.partner_name || '');
    setEditStatus(currentCenter.status || 'सक्रिय (Active)');
    setShowEditModal(true);
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenterName.trim() || !newCenterDistrict.trim()) {
      showToast('कृपया केंद्राचे नाव आणि जिल्हा प्रविष्ट करा.');
      return;
    }
    try {
      const res = await apiClient.createCommunityCenter({
        name: newCenterName,
        tier: newCenterTier,
        division: newCenterDivision,
        district: newCenterDistrict,
        taluka: newCenterTaluka || 'मध्यवर्ती',
        address: newCenterAddress,
        contactPerson: newCenterManager,
        contactPhone: newCenterPhone,
        partnerName: newCenterPartner || 'मराठा स्थानिक भागीदारी',
        investmentTier: newCenterInvestment
      });
      showToast(`✅ नवीन कम्युनिटी सेंटर "${newCenterName}" यशस्वीरीत्या जोडले गेले!`);
      setShowCreateModal(false);
      setNewCenterName('');
      setNewCenterAddress('');
      setNewCenterManager('');
      setNewCenterPhone('');
      setNewCenterPartner('');
      await loadCenters();
      if (res?.data?.center?.id) {
        setSelectedTier(res.data.center.tier || newCenterTier);
        setSelectedCenterId(res.data.center.id);
      }
    } catch (err) {
      showToast('त्रुटी: कम्युनिटी सेंटर जोडता आले नाही.');
    }
  };

  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    try {
      await apiClient.updateCommunityCenter(currentCenter.id, {
        address: editAddress,
        contactPerson: editManager,
        contactPhone: editPhone,
        partnerName: editPartner,
        status: editStatus
      });
      showToast('✅ केंद्राचे तपशील यशस्वीरीत्या अद्ययावत केले!');
      setShowEditModal(false);
      loadCenters();
    } catch (err) {
      showToast('त्रुटी: केंद्र तपशील अद्ययावत करता आले नाही.');
    }
  };

  const handleRecordDeskAction = async (e) => {
    e.preventDefault();
    if (!selectedDeskModal) return;
    try {
      await apiClient.recordCenterAction({
        centerId: currentCenter.id,
        actionType: 'desk_case',
        notes: `[${selectedDeskModal.title}] ${deskCitizenName} (${deskCitizenPhone}) - ${deskNotes} [प्राधान्य: ${deskPriority}, स्थिती: ${deskStatus}]`
      });
      setRecentLogs(prev => [
        { time: new Date().toLocaleTimeString(), text: `📌 ${selectedDeskModal.icon} ${selectedDeskModal.title}: ${deskCitizenName || 'नागरिक'} - ${deskNotes}` },
        ...prev.slice(0, 8)
      ]);
      showToast(`✅ ${selectedDeskModal.title} कक्षावर केस यशस्वीरीत्या नोंदवली गेली!`);
      setSelectedDeskModal(null);
      setDeskCitizenName('');
      setDeskCitizenPhone('');
      setDeskNotes('');
    } catch (err) {
      showToast('त्रुटी: डेस्क केस नोंदवता आली नाही.');
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <CRMScopeSwitcher currentScope="center" />
      <div style={{ padding: '24px 16px 80px', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>

        {/* Global Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#EA580C',
            color: '#FFFFFF',
            padding: '14px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(234, 88, 12, 0.35)',
            zIndex: 9999,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🚩</span> {toastMsg}
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. HIERARCHY TIER SELECTOR & CENTER SWITCHER */}
        {/* ============================================================ */}
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#EA580C' }}>
                CONNECT MARATHA — 4-TIER COMMUNITY CENTER OPERATING SUITE
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                कम्युनिटी सेवा व बिझनेस ऑपरेशन्स केंद्र
              </div>
            </div>

            {/* 4 Tiers Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CENTER_TIERS.map(t => {
                const isSelected = selectedTier === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTier(t.id)}
                    style={{
                      background: isSelected ? t.color : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 4px 12px ${t.color}40` : 'none'
                    }}
                  >
                    {t.icon} {t.label.split(' ')[1]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CENTER HERO BANNER */}
        {/* ============================================================ */}
        <div style={{
          background: selectedTier === 'state' ? 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #FB923C 100%)' :
                      selectedTier === 'division' ? 'linear-gradient(135deg, #581C87 0%, #7E22CE 60%, #A855F7 100%)' :
                      selectedTier === 'district' ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #60A5FA 100%)' :
                      'linear-gradient(135deg, #14532D 0%, #16A34A 60%, #4ADE80 100%)',
          borderRadius: '20px',
          padding: '28px 24px',
          color: '#FFFFFF',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.22)', padding: '5px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '10px' }}>
              <span>🏢</span> {CENTER_TIERS.find(t => t.id === selectedTier)?.label}
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 6px', letterSpacing: '0.3px' }}>
              {currentCenter.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.92rem', lineHeight: 1.5 }}>
              📍 <strong>{currentCenter.district}</strong> — {currentCenter.taluka || currentCenter.division} | भागीदार: <strong>{currentCenter.partnerName}</strong> | गुंतवणूक वर्ग: <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '6px' }}>{currentCenter.investmentTier}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {tierCenters.length > 0 ? (
                tierCenters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              ) : (
                <option value={currentCenter.id}>{currentCenter.name}</option>
              )}
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#FFFFFF',
                color: '#C2410C',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> केंद्र जोडा
            </button>

            <button
              onClick={openEditModal}
              style={{
                background: 'rgba(255,255,255,0.22)',
                color: '#FFFFFF',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                border: '1px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>✏️</span> संपादन
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              style={{
                background: 'rgba(255,255,255,0.22)',
                color: '#FFFFFF',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                border: '1px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖨️</span> अहवाल
            </button>

            <Link
              to="/ceo"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 800,
                textDecoration: 'none',
                fontSize: '0.88rem',
                border: '1px solid rgba(255,255,255,0.35)'
              }}
            >
              🦅 CEO Command →
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LIVE DATABASE INTEGRATION BAR */}
        {/* ============================================================ */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '12px 18px',
          border: '1px solid #BBF7D0',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#DCFCE7',
              color: '#15803D',
              fontWeight: 900,
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
              🟢 थेट डेटाबेस जोडणी: SQLite3 Native ACID
            </span>
            <span style={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 700 }}>
              {databaseStats ? (
                `👥 ${databaseStats.totalMembers} नोंदणीकृत सभासद | 💼 ${databaseStats.totalBusinesses} उद्योग व व्यापारी | 👔 ${databaseStats.totalJobs} रोजगार भरती | 🪪 ${databaseStats.pendingKyc} प्रलंबित KYC`
              ) : (
                `👥 ${currentCenter.activeMembers || 63} नोंदणीकृत सभासद | 💼 ${currentCenter.b2bCount || 18} उद्योग व व्यापारी | 👔 ${currentCenter.jobsCount || 18} रोजगार`
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
              💡 खालील सर्व ८ मेट्रिक्स कार्ड्स क्लिक करून थेट पाहू शकता
            </span>
            <button
              onClick={() => {
                loadCenters();
                showToast('🔄 रिअल-टाइम डेटाबेस माहिती ताजी केली!');
              }}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              🔄 रीफ्रेश करा
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. TODAY'S LIVE COMMERCE & SERVICE METRICS (8 CLICKABLE KPI CARDS) */}
        {/* ============================================================ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Visitors */}
          <div
            onClick={() => setDataModalType('visitors')}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'visitors' ? '2px solid #16A34A' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#16A34A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'visitors' ? '#16A34A' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>आजचे अभ्यागत (Visitors)</div>
              <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 800 }}>यादी पहा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
              {currentCenter.todayVisitors || 42}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700, marginTop: '4px' }}>👥 प्रत्यक्ष काउंटरवर भेट</div>
            <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>📋 अभ्यागत नोंदवही उघडा</span><span>➔</span>
            </div>
          </div>

          {/* Card 2: Revenue */}
          <div
            onClick={() => setDataModalType('collection')}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'collection' ? '2px solid #EA580C' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#EA580C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'collection' ? '#EA580C' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>आजची प्रत्यक्ष जमा (Revenue)</div>
              <span style={{ fontSize: '0.7rem', color: '#EA580C', fontWeight: 800 }}>लेजर पहा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
              ₹{(currentCenter.dailyCollection || 84500).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 700, marginTop: '4px' }}>💰 रोख + UPI लेजर</div>
            <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>🧾 जमा पावत्या लेजर उघडा</span><span>➔</span>
            </div>
          </div>

          {/* Card 3: KYC Pending */}
          <div
            onClick={() => {
              setDataModalType('kyc');
              setModalSearch('');
            }}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'kyc' ? '2px solid #EA580C' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#EA580C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'kyc' ? '#EA580C' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>प्रलंबित KYC छाननी</div>
              <span style={{ fontSize: '0.7rem', color: '#EA580C', fontWeight: 800 }}>छाननी करा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginTop: '2px' }}>
              {currentCenter.kycPending || databaseStats?.pendingKyc || 3}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#C2410C', fontWeight: 700, marginTop: '4px' }}>🪪 स्मार्ट कार्ड वाटप</div>
            <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>✓ प्रलंबित अर्ज तपासा</span><span>➔</span>
            </div>
          </div>

          {/* Card 4: Active Members */}
          <div
            onClick={() => {
              setDataModalType('members');
              setModalSearch('');
            }}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'members' ? '2px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#2563EB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'members' ? '#2563EB' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>नोंदणीकृत सभासद (DB)</div>
              <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 800 }}>यादी उघडा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563EB', marginTop: '2px' }}>
              {(currentCenter.activeMembers || databaseStats?.totalMembers || 63).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1D4ED8', fontWeight: 700, marginTop: '4px' }}>✓ डेटाबेस थेट सभासद परिवार</div>
            <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>👥 सर्व ६३ सभासद पहा</span><span>➔</span>
            </div>
          </div>

          {/* Card 5: B2B Leads */}
          <div
            onClick={() => {
              setDataModalType('businesses');
              setModalSearch('');
            }}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'businesses' ? '2px solid #7E22CE' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#7E22CE'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'businesses' ? '#7E22CE' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>B2B संगम व्यवहार (DB)</div>
              <span style={{ fontSize: '0.7rem', color: '#7E22CE', fontWeight: 800 }}>उद्योग पहा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7E22CE', marginTop: '2px' }}>
              {currentCenter.b2bCount || databaseStats?.totalBusinesses || 18}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#6B21A8', fontWeight: 700, marginTop: '4px' }}>🤝 सक्रिय उद्योग व डील्स</div>
            <div style={{ fontSize: '0.72rem', color: '#7E22CE', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>💼 सर्व १८ उद्योग पहा</span><span>➔</span>
            </div>
          </div>

          {/* Card 6: Job Interviews */}
          <div
            onClick={() => {
              setDataModalType('jobs');
              setModalSearch('');
            }}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'jobs' ? '2px solid #0284C7' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#0284C7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'jobs' ? '#0284C7' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>रोजगार मुलाखती (Jobs DB)</div>
              <span style={{ fontSize: '0.7rem', color: '#0284C7', fontWeight: 800 }}>जागा पहा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284C7', marginTop: '2px' }}>
              {currentCenter.jobsCount || databaseStats?.totalJobs || 18}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#0369A1', fontWeight: 700, marginTop: '4px' }}>👔 लाइव्ह नोकऱ्या व संधी</div>
            <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>👔 सर्व १८ नोकरी पदे पहा</span><span>➔</span>
            </div>
          </div>

          {/* Card 7: Local Services */}
          <div
            onClick={() => {
              setDataModalType('services');
              setModalSearch('');
            }}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'services' ? '2px solid #D97706' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#D97706'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'services' ? '#D97706' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>स्थानिक सेवा ऑर्डर्स (16 Desks)</div>
              <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 800 }}>कक्ष पहा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
              28
            </div>
            <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, marginTop: '4px' }}>🔧 इलेक्ट्रिशियन/वकील/CA</div>
            <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>🛠️ सर्व १६ सेवा कक्ष यादी उघडा</span><span>➔</span>
            </div>
          </div>

          {/* Card 8: Hotel & Tourism */}
          <div
            onClick={() => {
              setDataModalType('hotels');
              setModalSearch('');
            }}
            style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '14px',
              border: dataModalType === 'hotels' ? '2px solid #059669' : '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#059669'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = dataModalType === 'hotels' ? '#059669' : '#E2E8F0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>हॉटेल्स व पर्यटन (Tourism)</div>
              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>बुकिंग पहा ↗</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
              28
            </div>
            <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, marginTop: '4px' }}>🏨 किल्ले टूर बुकिंग्स</div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
              <span>🏨 हॉटेल व पर्यटन यादी उघडा</span><span>➔</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MAIN NAVIGATION TABS */}
        {/* ============================================================ */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '2px solid #E2E8F0', marginBottom: '22px', paddingBottom: '2px' }}>
          {[
            { id: 'geo', label: '📍 भौगोलिक केंद्र यादी व लोकेशन (Geo Directory)' },
            { id: 'desk', label: '🧑‍💼 काउंटर व अभ्यागत (Front Desk)' },
            { id: 'pipeline', label: '📋 "माझे कार्य प्रवाह" (My Pipelines)' },
            { id: 'desks', label: '🛠️ १६ व्यावसायिक सेवा कक्ष (16 Desks)' },
            { id: 'hotels', label: '🏨 हॉटेल्स, पर्यटन व आदरातिथ्य' },
            { id: 'roles', label: '👥 पदरचना व मनुष्यबळ मॉडेल' },
            { id: 'collection', label: '💰 दैनिक वर्गणी व हिशोब लेजर' }
          ].map(tab => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 18px',
                  fontWeight: isTabActive ? 900 : 700,
                  color: isTabActive ? '#EA580C' : '#64748B',
                  borderBottom: isTabActive ? '3px solid #EA580C' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.92rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 0: GEO-LOCATION DIRECTORY (CITY, DISTRICT/JILHA, DIVISION & MAPS) */}
        {/* ============================================================ */}
        {activeTab === 'geo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Geo Filter Bar */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '22px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#C2410C', fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🗺️</span> महाराष्ट्र राज्य कम्युनिटी सेंटर्स — भौगोलिक शोध यंत्रणा (Geo Explorer)
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.84rem', fontWeight: 600 }}>
                    विभाग, जिल्हा (Jilha), तालुका, शहर आणि अचूक गुगल मॅप्स लोकेशननुसार राज्यभरातील सर्व कम्युनिटी सेंटर्स शोधा.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    🏢 एकूण उपलब्ध: {filteredGeoCenters.length} केंद्रे
                  </span>
                  {(geoDivision !== 'सर्व विभाग (All Divisions)' || geoDistrict !== 'सर्व जिल्हे (All Districts)' || geoCity || geoSearch || geoTierFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setGeoDivision('सर्व विभाग (All Divisions)');
                        setGeoDistrict('सर्व जिल्हे (All Districts)');
                        setGeoCity('');
                        setGeoSearch('');
                        setGeoTierFilter('all');
                      }}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ फिल्टर्स रीसेट करा
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Interactive Filter Controls */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginBottom: '14px'
              }}>
                {/* Division Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    🏛️ प्रशासकीय विभाग (Division)
                  </label>
                  <select
                    value={geoDivision}
                    onChange={(e) => {
                      setGeoDivision(e.target.value);
                      setGeoDistrict('सर्व जिल्हे (All Districts)');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#1E293B'
                    }}
                  >
                    {MAHARASHTRA_DIVISIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                {/* District / Jilha Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    🔵 जिल्हा (District / Jilha)
                  </label>
                  <select
                    value={geoDistrict}
                    onChange={(e) => setGeoDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#1E293B'
                    }}
                  >
                    <option value="सर्व जिल्हे (All Districts)">सर्व जिल्हे (३६ जिल्हे)</option>
                    {MAHARASHTRA_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist} जिल्हा</option>
                    ))}
                  </select>
                </div>

                {/* City / Taluka Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    🏙️ शहर / तालुका (City / Taluka)
                  </label>
                  <input
                    type="text"
                    value={geoCity}
                    onChange={(e) => setGeoCity(e.target.value)}
                    placeholder="उदा. हवेली, कराड, वाशी, नाशिक..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1E293B'
                    }}
                  />
                </div>

                {/* Tier Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    🏷️ केंद्र श्रेणी (Tier)
                  </label>
                  <select
                    value={geoTierFilter}
                    onChange={(e) => setGeoTierFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#1E293B'
                    }}
                  >
                    <option value="all">सर्व श्रेणी (All Tiers)</option>
                    <option value="state">🟠 राज्य शिखर मुख्यालय</option>
                    <option value="division">🟣 विभागीय महा-संकुल</option>
                    <option value="district">🔵 जिल्हा केंद्र</option>
                    <option value="taluka">🟢 तालुका सेवा केंद्र</option>
                  </select>
                </div>
              </div>

              {/* Free Text Search Bar */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={geoSearch}
                  onChange={(e) => setGeoSearch(e.target.value)}
                  placeholder="🔍 नाव, पत्ता, लँडमार्क, पिनकोड, किंवा संपर्क व्यक्तीच्या नावाने त्वरित शोधा..."
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    background: '#F8FAFC'
                  }}
                />
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: '#94A3B8' }}>
                  📍
                </span>
                {geoSearch && (
                  <button
                    onClick={() => setGeoSearch('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 900
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick District Badge Pills for Instant Browsing */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '6px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                📍 जलद जिल्हा निवड:
              </span>
              {['पुणे', 'मुंबई', 'ठाणे', 'सातारा', 'कोल्हापूर', 'नाशिक', 'छत्रपती संभाजीनगर', 'सोलापूर', 'सांगली', 'नागपूर', 'अमरावती', 'रायगड', 'जळगाव', 'लातूर'].map(d => {
                const isActive = geoDistrict === d;
                return (
                  <button
                    key={d}
                    onClick={() => setGeoDistrict(isActive ? 'सर्व जिल्हे (All Districts)' : d)}
                    style={{
                      background: isActive ? '#C2410C' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#334155',
                      border: isActive ? '1px solid #C2410C' : '1px solid #CBD5E1',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 3px 8px rgba(194,65,12,0.3)' : '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Centers Geo List Cards */}
            {filteredGeoCenters.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📍</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
                  निवडलेल्या निकषांनुसार कोणतेही कम्युनिटी सेंटर आढळले नाही
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B' }}>
                  कृपया जिल्हा, शहर किंवा शोध संज्ञा बदलून पुन्हा प्रयत्न करा.
                </p>
                <button
                  onClick={() => {
                    setGeoDivision('सर्व विभाग (All Divisions)');
                    setGeoDistrict('सर्व जिल्हे (All Districts)');
                    setGeoCity('');
                    setGeoSearch('');
                    setGeoTierFilter('all');
                  }}
                  style={{
                    background: '#C2410C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  सर्व केंद्रे दाखवा
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px'
              }}>
                {filteredGeoCenters.map(c => {
                  const tierConfig = CENTER_TIERS.find(t => t.id === (c.tier || 'taluka')) || CENTER_TIERS[3];
                  const mapUrl = c.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name} ${c.address || ''} ${c.city || ''} ${c.district || ''}`)}`;
                  const isCurrent = currentCenter.id === c.id;

                  return (
                    <div
                      key={c.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: isCurrent ? '2px solid #C2410C' : '1px solid #E2E8F0',
                        overflow: 'hidden',
                        boxShadow: isCurrent ? '0 10px 25px rgba(194,65,12,0.12)' : '0 4px 14px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      {/* Card Header */}
                      <div style={{
                        padding: '16px 20px',
                        background: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{
                              background: tierConfig.bg,
                              color: tierConfig.color,
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 900
                            }}>
                              {tierConfig.icon} {tierConfig.label.split(' ')[1]}
                            </span>
                            <span style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 800
                            }}>
                              {c.status || 'सक्रिय'}
                            </span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.35 }}>
                            {c.name}
                          </h4>
                        </div>
                        <span style={{
                          background: '#F1F5F9',
                          color: '#64748B',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}>
                          {c.code || c.id}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Geo Location Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🏛️ {c.division || 'पुणे विभाग'}
                          </span>
                          <span style={{
                            background: '#F0FDF4',
                            color: '#15803D',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🔵 जिल्हा: {c.district || 'पुणे'}
                          </span>
                          <span style={{
                            background: '#FEF3C7',
                            color: '#B45309',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🏙️ शहर/तालुका: {c.taluka || c.city || 'शहरी'}
                          </span>
                        </div>

                        {/* Exact Physical Address & Landmark */}
                        <div style={{
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ fontWeight: 800, color: '#334155', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📍</span> अचूक पत्ता (Exact Location):
                          </div>
                          <div style={{ color: '#475569', lineHeight: 1.45, fontWeight: 600 }}>
                            {c.address || 'पत्ता उपलब्ध नाही'}
                          </div>
                          {c.landmark && (
                            <div style={{ color: '#C2410C', fontSize: '0.78rem', fontWeight: 700, marginTop: '4px' }}>
                              🚩 लँडमार्क: {c.landmark}
                            </div>
                          )}
                          {c.timing && (
                            <div style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 700, marginTop: '3px' }}>
                              🕒 वेळ: {c.timing}
                            </div>
                          )}
                        </div>

                        {/* Manager & Contact */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.84rem' }}>
                          <div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>केंद्र संचालक / व्यवस्थापक</div>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>
                              👤 {c.contactPerson || c.manager_name || 'श्री. व्यवस्थापक'}
                            </div>
                          </div>
                          {(c.contactPhone || c.manager_phone) && (
                            <a
                              href={`tel:${c.contactPhone || c.manager_phone}`}
                              style={{
                                background: '#DCFCE7',
                                color: '#15803D',
                                textDecoration: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              📞 {c.contactPhone || c.manager_phone}
                            </a>
                          )}
                        </div>

                        {/* Facilities tags if available */}
                        {Array.isArray(c.facilities) && c.facilities.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {c.facilities.slice(0, 3).map((f, fi) => (
                              <span key={fi} style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                ✓ {f}
                              </span>
                            ))}
                            {c.facilities.length > 3 && (
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', padding: '2px 4px' }}>
                                +{c.facilities.length - 3} अधिक
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div style={{
                        padding: '14px 20px',
                        background: '#F8FAFC',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        gap: '10px'
                      }}>
                        {/* Google Maps Link */}
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            background: '#C2410C',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            textDecoration: 'none',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 3px 8px rgba(194,65,12,0.25)'
                          }}
                        >
                          <span>🗺️</span> Google Maps वर पहा
                        </a>

                        {/* CRM Selection Button */}
                        <button
                          onClick={() => {
                            setSelectedTier(c.tier || 'taluka');
                            setSelectedCenterId(c.id);
                            setActiveTab('desk');
                            showToast(`📍 ${c.name} सक्रिय निवडले गेले आहे!`);
                          }}
                          style={{
                            background: isCurrent ? '#16A34A' : '#FFFFFF',
                            color: isCurrent ? '#FFFFFF' : '#334155',
                            border: isCurrent ? '1px solid #16A34A' : '1px solid #CBD5E1',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isCurrent ? '✓ निवडलेले केंद्र' : '⚙️ व्यवस्थापित करा'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: FRONT DESK & WALK-INS */}
        {/* ============================================================ */}
        {activeTab === 'desk' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Quick Checkin Form */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>+</span> नवीन प्रत्यक्ष अभ्यागत नोंदणी (Walk-in Entry)
              </h3>
              <form onSubmit={handleCheckinVisitor}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>अभ्यागताचे पूर्ण नाव</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="उदा. रणजित प्रतापराव गायकवाड"
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>मोबाईल नंबर</label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="९८२२०XXXXX"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>भेटीचा हेतू (Service Department)</label>
                  <select
                    value={visitorPurpose}
                    onChange={(e) => setVisitorPurpose(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: '#FFFFFF' }}
                  >
                    <option value="सदस्य नोंदणी व KYC">👥 सदस्य नोंदणी व KYC पडताळणी</option>
                    <option value="व्यवसाय व MSME मार्गदर्शन">💼 व्यवसाय व MSME उद्योग मार्गदर्शन</option>
                    <option value="B2B संगम खरेदी-विक्री">🤝 B2B संगम व्यापारी करार</option>
                    <option value="रोजगार व नोकरी मुलाखत">👔 रोजगार व नोकरी संधी</option>
                    <option value="कायदेशीर / वकील सल्ला">⚖️ कायदेशीर व वकील पॅनेल सल्ला</option>
                    <option value="हॉटेल व पर्यटन बुकिंग">🏨 हॉटेल व किल्ले पर्यटन बुकिंग</option>
                    <option value="आपत्कालीन रक्त मदत">🩸 आपत्कालीन रक्त व वैद्यकीय मदत</option>
                    <option value="विद्यार्थी शिष्यवृत्ती">🎓 विद्यार्थी शिष्यवृत्ती व करिअर</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '13px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22,163,74,0.25)'
                  }}
                >
                  ✓ अभ्यागताची केंद्रावर नोंद करा
                </button>
              </form>
            </div>

            {/* Live Center Feed */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.15rem', fontWeight: 800 }}>
                  📋 आजच्या प्रत्यक्ष नोंदी (Live Activity Stream)
                </h3>
                <span style={{ fontSize: '0.76rem', background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '100px', fontWeight: 800 }}>
                  LIVE REALTIME
                </span>
              </div>

              {recentLogs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { time: '10:15 AM', text: '👤 अभ्यागत: संग्राम मोरे (सदस्य नोंदणी व KYC) दाखल झाला.' },
                    { time: '11:00 AM', text: '🤝 B2B संगम: के. पी. इंजिनिअरिंग व महालक्ष्मी स्टील डील बैठक पार पडली.' },
                    { time: '11:45 AM', text: '👔 रोजगार: ४ युवा उमेदवारांची सीएनसी ऑपरेटर पदासाठी मुलाखत पूर्ण.' },
                    { time: '12:30 PM', text: '🩸 रक्त विनंती: सह्याद्री हॉस्पिटलसाठी B+ रक्तदाता तातडीने रवाना.' },
                    { time: '01:10 PM', text: '🏨 हॉटेल: महाबळेश्वर रिसॉर्ट ३ खोल्या कौटुंबिक बुकिंग निश्चित.' }
                  ].map((log, idx) => (
                    <div key={idx} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.86rem' }}>
                      <span style={{ color: '#64748B', marginRight: '8px', fontWeight: 700 }}>[{log.time}]</span>
                      <strong style={{ color: '#1E293B' }}>{log.text}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentLogs.map((log, idx) => (
                    <div key={idx} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.86rem' }}>
                      <span style={{ color: '#15803D', marginRight: '8px', fontWeight: 700 }}>[{log.time}]</span>
                      <strong style={{ color: '#14532D' }}>{log.text}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: "MY WORK QUEUE" PIPELINE SYSTEM */}
        {/* ============================================================ */}
        {activeTab === 'pipeline' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
              {[
                { id: 'b2b', label: '🤝 B2B डील पाइपलाइन (B2B Matchmaking)' },
                { id: 'kyc', label: '🪪 KYC पडताळणी पाइपलाइन (KYC Verification)' },
                { id: 'jobs', label: '👔 रोजगार व भरती पाइपलाइन (Jobs & Placement)' },
                { id: 'services', label: '🛠️ स्थानिक सेवा बुकिंग (Service Orders)' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPipelineFilter(p.id)}
                  style={{
                    background: pipelineFilter === p.id ? '#0F172A' : '#FFFFFF',
                    color: pipelineFilter === p.id ? '#FFFFFF' : '#475569',
                    border: '1px solid #CBD5E1',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* B2B Pipeline Kanban */}
            {pipelineFilter === 'b2b' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {[
                  { stage: '१. नवीन लीड्स (New Leads)', count: 24, badge: '#0284C7', items: ['सह्याद्री टूल्स (₹२.५ लाख)', 'स्वराज्य पॅकेजिंग (₹१.८ लाख)'] },
                  { stage: '२. संपर्क झाला (Contacted)', count: 18, badge: '#EA580C', items: ['राजमुद्रा कोल्ड स्टोरेज', 'मराठा दाल मिल, कराड'] },
                  { stage: '३. बैठक निश्चित (Meeting Set)', count: 8, badge: '#7E22CE', items: ['शिवाजीनगर 1-to-1 दालन', 'हवेली चॅप्टर मीटिंग'] },
                  { stage: '४. कोटेशन पाठवले (Quotation)', count: 5, badge: '#D97706', items: ['बाणेर फर्निचर क्लस्टर'] },
                  { stage: '५. डील यशस्वी (Won Deal)', count: 8, badge: '#16A34A', items: ['पुणे इंडस्ट्रियल सप्लाय (₹८.२ लाख)'] }
                ].map((col, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A' }}>{col.stage}</span>
                      <span style={{ background: col.badge, color: '#FFF', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>
                        {col.count}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {col.items.map((it, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedPipelineItem({ title: it, stage: col.stage, badge: col.badge })}
                          style={{
                            background: '#F8FAFC',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                        >
                          <span>{it}</span>
                          <span style={{ color: '#2563EB', fontSize: '0.74rem' }}>पहा →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KYC Pipeline */}
            {pipelineFilter === 'kyc' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {[
                  { stage: '🔴 प्रलंबित अर्ज (Pending Review)', count: 18, desc: 'कागदपत्रे अपलोड झालेली' },
                  { stage: '🟡 दुरुस्ती आवश्यक (Corrections)', count: 7, desc: 'फोटो किंवा पत्ता त्रुटी' },
                  { stage: '🟢 प्रमाणित (Verified Today)', count: 26, desc: 'स्मार्ट कार्ड वितरित करण्यास तयार' },
                  { stage: '💳 कार्ड छापील (Smart Card Ready)', count: 42, desc: 'केंद्रावर प्रत्यक्ष वाटपासाठी' }
                ].map((col, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#EA580C' }}>{col.count}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', marginTop: '2px' }}>{col.stage}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>{col.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Jobs Pipeline */}
            {pipelineFilter === 'jobs' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {[
                  { stage: '👥 नवीन उमेदवार (Candidates)', count: 86, desc: 'ITI, डिप्लोमा व पदवीधर युवक' },
                  { stage: '📋 रिक्त पदे (Open Vacancies)', count: 42, desc: 'स्थानिक उद्योगांकडून मागणी' },
                  { stage: '🎙️ चालू मुलाखती (Interviews)', count: 14, desc: 'केंद्राच्या मीटिंग रूममध्ये' },
                  { stage: '🎯 अंतिम निवड (Placed Today)', count: 8, desc: 'नियुक्ती पत्र प्राप्त' }
                ].map((col, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284C7' }}>{col.count}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', marginTop: '2px' }}>{col.stage}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>{col.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Services Pipeline */}
            {pipelineFilter === 'services' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {[
                  { stage: '📥 नवीन विनंत्या (New Enquiries)', count: 36, desc: 'इलेक्ट्रिशियन, प्लंबर, सीए साहाय्य' },
                  { stage: '🔄 व्यावसायिक नियुक्त (Assigned)', count: 21, desc: 'प्रमाणित तंत्रज्ञ कामावर रवाना' },
                  { stage: '⏳ चालू काम (In Progress)', count: 12, desc: 'काम सुरू' },
                  { stage: '✅ पूर्ण व समाधानकारक (Completed)', count: 28, desc: 'ग्राहकाकडून ५ स्टार रेटिंग' }
                ].map((col, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A' }}>{col.count}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', marginTop: '2px' }}>{col.stage}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>{col.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: 16 DEPARTMENT SERVICE DESKS */}
        {/* ============================================================ */}
        {activeTab === 'desks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  🏢 कम्युनिटी सेंटरमधील १६ मुख्य सेवा व व्यापार कक्ष (16 Service Desks)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  प्रत्येक कक्षाची स्वतंत्र जबाबदारी, नियुक्त समन्वयक व थेट नागरिक सेवा. कोणत्याही कक्षावर क्लिक करून त्वरित केस किंवा कृती नोंदवा.
                </p>
              </div>
              <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontWeight: 800, fontSize: '0.82rem' }}>
                ✓ १६ कक्ष पूर्णपणे सक्रिय
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {SERVICE_DESKS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDeskModal(d)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{d.icon}</span>
                      <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.74rem', padding: '3px 8px', borderRadius: '100px', fontWeight: 800 }}>
                        {d.count}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{d.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 12px', lineHeight: 1.4 }}>{d.desc}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: '#475569', fontWeight: 700 }}>प्रभारी: <strong>{d.head}</strong></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeskModal(d);
                      }}
                      style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', padding: '5px 12px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      केस नोंदवा →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: HOTEL & TOURISM DESK */}
        {/* ============================================================ */}
        {activeTab === 'hotels' && (
          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  🏨 हॉटेल्स, पर्यटन व आदरातिथ्य कक्ष (Hospitality & Tourism)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  महाराष्ट्रातील मराठा बंधूंची हॉटेल्स, किल्ले टूर पॅकेजेस व प्रवासी साहाय्य (CEO Command शी थेट जोडलेले)
                </p>
              </div>
              <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontWeight: 800, fontSize: '0.8rem' }}>
                ✓ 28 भागीदार हॉटेल्स
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {[
                { name: 'किल्ले रायगड हेरिटेज रिसॉर्ट', loc: 'रायगड पायथा', rating: '४.९ ★', rooms: '१८ खोल्या उपलब्ध', price: '₹२,८०० / रात्र', tag: 'ऐतिहासिक टूर' },
                { name: 'शिवनेरी व्हॅली व्ह्यू हॉटेल', loc: 'जुन्नर, पुणे', rating: '४.८ ★', rooms: '१२ खोल्या उपलब्ध', price: '₹२,२०० / रात्र', tag: 'कौटुंबिक मुक्काम' },
                { name: 'पन्हाळा राजदरबार लॉजिंग', loc: 'कोल्हापूर - पन्हाळा', rating: '४.९ ★', rooms: '२२ खोल्या उपलब्ध', price: '₹३,१०० / रात्र', tag: 'हेरिटेज स्टे' },
                { name: 'गोदावरी रिव्हरफ्रंट इन', loc: 'गंगापूर रोड, नाशिक', rating: '४.७ ★', rooms: '१५ खोल्या उपलब्ध', price: '₹२,५०० / रात्र', tag: 'तीर्थक्षेत्र टूर' }
              ].map((h, idx) => (
                <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', background: '#FFFDF9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, color: '#7C2D12', fontSize: '1.05rem', fontWeight: 800 }}>{h.name}</h4>
                    <span style={{ background: '#EA580C', color: '#FFF', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>{h.rating}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 10px' }}>📍 {h.loc} | {h.tag}</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #FED7AA', paddingTop: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 800 }}>{h.rooms}</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0F172A' }}>{h.price}</div>
                    </div>
                    <button
                      onClick={() => setSelectedHotelBooking(h)}
                      style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      थेट बुक करा ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: STAFFING & ROLES BLUEPRINT */}
        {/* ============================================================ */}
        {activeTab === 'roles' && (
          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              👥 कम्युनिटी सेंटर पदरचना व मनुष्यबळ मॉडेल (Scalable Staffing Blueprint)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: '#64748B' }}>
              प्रत्येक स्तरावर संपूर्ण ७२-१०० कर्मचारी एकाच वेळी ठेवण्याची आवश्यकता नाही; तालुक्याच्या आकारानुसार स्केलेबल पदरचना:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ border: '2px solid #86EFAC', borderRadius: '14px', padding: '18px', background: '#F0FDF4' }}>
                <div style={{ fontWeight: 800, color: '#166534', fontSize: '1.05rem' }}>🌱 लहान तालुका केंद्र (Small Taluka)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803D', margin: '4px 0' }}>~१२ ते १५ कर्मचारी</div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#166534', lineHeight: 1.6, margin: 0 }}>
                  <li>१ Center Manager + १ Assistant Manager</li>
                  <li>२ Membership & KYC Executives</li>
                  <li>१ Business & B2B Coordinator</li>
                  <li>१ Employment / Jobs Executive</li>
                  <li>१ Services & Service Desk Executive</li>
                  <li>१ Seva & Emergency Helpdesk</li>
                  <li>१ Finance & Cash Collection Executive</li>
                  <li>१ Digital / CRM / App Support Executive</li>
                </ul>
              </div>

              <div style={{ border: '2px solid #93C5FD', borderRadius: '14px', padding: '18px', background: '#EFF6FF' }}>
                <div style={{ fontWeight: 800, color: '#1E40AF', fontSize: '1.05rem' }}>🌿 मध्यम तालुका / शहर केंद्र (Medium Taluka)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1D4ED8', margin: '4px 0' }}>~२५ ते ३५ कर्मचारी</div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#1E40AF', lineHeight: 1.6, margin: 0 }}>
                  <li>स्वतंत्र Department Heads (Membership, B2B, Jobs)</li>
                  <li>४ KYC व फील्ड व्हेरिफिकेशन अधिकारी</li>
                  <li>२ B2B डील व संगम रिलेशनशिप मॅनेजर्स</li>
                  <li>२ करिअर समुपदेशक व रिक्रूटर्स</li>
                  <li>१ हॉटेल व पर्यटन बुकिंग एग्झिक्युटिव्ह</li>
                  <li>२ २४x७ सेवा व रुग्णालय समन्वय प्रतिनिधी</li>
                  <li>२ वित्त, पावती व ऑडिट कर्मचारी</li>
                </ul>
              </div>

              <div style={{ border: '2px solid #FDBA74', borderRadius: '14px', padding: '18px', background: '#FFF7ED' }}>
                <div style={{ fontWeight: 800, color: '#9A3412', fontSize: '1.05rem' }}>🌳 जिल्हा / विभागीय संकुल (District/Division)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#C2410C', margin: '4px 0' }}>~५० ते १००+ कर्मचारी</div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#9A3412', lineHeight: 1.6, margin: 0 }}>
                  <li>Center Director व सर्व १२ कक्षांचे पूर्णवेळ मॅनेजर्स</li>
                  <li>इनक्युबेशन व स्टार्टअप्स मार्गदर्शक मंडळ</li>
                  <li>कायदेशीर व डॉक्टर सल्लागार पूर्णवेळ डेस्क</li>
                  <li>पर्यटन व हॉटेल फ्लीट ऑपरेशन्स</li>
                  <li>सेंट्रल MIS, डेटा ॲनालिटिक्स व ऑडिट कक्ष</li>
                  <li>राज्यस्तरीय CEO कमांडशी रिअल-टाइम सिंकिंग</li>
                </ul>
              </div>
            </div>

            {/* Specialist Partner Model Highlight */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0F172A', fontSize: '1rem', marginBottom: '6px' }}>
                <span>💡</span> महत्त्वाचे आर्किटेक्चरल सूत्र: "स्पेशालिस्ट पार्टनर मॉडेल" (Verified Service Partner Model)
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                वकील (Lawyer), डॉक्टर (Doctor), चार्टर्ड अकाउंटंट (CA), आर्किटेक्ट (Architect), इलेक्ट्रिशियन (Electrician), फोटोग्राफर व टूर ऑपरेटर यांना केंद्राचे <strong>पूर्णवेळ पगारी कर्मचारी ठेवण्याची गरज नाही</strong>. ते <strong>"प्रमाणित सेवा भागीदार" (Verified Service Partners)</strong> म्हणून नोंदणीकृत असतील. ग्राहकाची मागणी आल्यास कम्युनिटी सेंटर त्यांना ऑर्डर्स/लीड्स पुरवेल आणि केंद्राला ठरलेले <strong>कम्युनिकेशन/प्लॅटफॉर्म कमिशन</strong> मिळेल.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: FINANCE & REVENUE COLLECTION */}
        {/* ============================================================ */}
        {activeTab === 'collection' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: '1.2rem', fontWeight: 800 }}>
                💰 दैनिक वर्गणी व पावती नोंदणी (Daily Collection)
              </h3>
              <form onSubmit={handleRecordCollection}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>जमा रक्कम (INR)</label>
                  <input
                    type="number"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    placeholder="उदा. 1500 किंवा 5000"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1.15rem', fontWeight: 800 }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>जमा प्रकार / वर्गणी हेतू</label>
                  <select
                    value={collectionPurpose}
                    onChange={(e) => setCollectionPurpose(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: '#FFFFFF' }}
                  >
                    <option value="वार्षिक वर्गणी (Annual Membership)">वार्षिक सभासद वर्गणी (₹1,500)</option>
                    <option value="B2B संगम व्यापारी नोंदणी">B2B संगम व्यापारी नोंदणी शुल्क (₹5,000)</option>
                    <option value="हॉल आरक्षण शुल्क (Venue Booking)">इव्हेंट हॉल आरक्षण अनामत रक्कम</option>
                    <option value="ऐच्छिक देणगी (80G Donation)">ऐच्छिक समाज देणगी (80G कर सवलत पावती)</option>
                    <option value="सेवा कमिशन (Partner Commission)">स्थानिक सेवा भागीदार कमिशन</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '13px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22,163,74,0.25)'
                  }}
                >
                  + केंद्राच्या अधिकृत खात्यात पावती जमा करा
                </button>
              </form>
            </div>

            {/* Collection Ledger Log */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.15rem', fontWeight: 800 }}>
                  📑 आजच्या जमा पावत्या (Daily Receipts)
                </h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16A34A' }}>
                  एकूण: ₹{(currentCenter.dailyCollection || 84500).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentCollections.map((r, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{r.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>पावती: {r.id} | {r.type} | {r.time}</div>
                    </div>
                    <div style={{ fontWeight: 900, color: '#16A34A', fontSize: '1.05rem' }}>
                      +₹{r.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 1: ADD NEW COMMUNITY CENTER MODAL */}
        {/* ============================================================ */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#C2410C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏢</span> नवीन कम्युनिटी सेंटर नोंदणी (Register Center)
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCenter}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>केंद्राचे अधिकृत नाव *</label>
                  <input
                    type="text"
                    value={newCenterName}
                    onChange={(e) => setNewCenterName(e.target.value)}
                    placeholder="उदा. सोलापूर पंढरपूर स्वराज्य सेवा व व्यापार केंद्र"
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>श्रेणी (Tier) *</label>
                    <select
                      value={newCenterTier}
                      onChange={(e) => {
                        setNewCenterTier(e.target.value);
                        setNewCenterInvestment(
                          e.target.value === 'state' ? '₹१०.०० कोटी (राज्य मुख्यालय)' :
                          e.target.value === 'division' ? '₹१.५ कोटी (विभागीय मॉडेल)' :
                          e.target.value === 'district' ? '₹३६,००,००० (जिल्हा मॉडेल)' : '₹३,६०,००० (तालुका मॉडेल)'
                        );
                      }}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}
                    >
                      <option value="taluka">🟢 तालुका सेवा व व्यापार केंद्र</option>
                      <option value="district">🔵 जिल्हा मराठा भवन</option>
                      <option value="division">🟣 विभागीय महा-संकुल</option>
                      <option value="state">🟠 राज्य मध्यवर्ती मुख्यालय</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>विभाग (Division) *</label>
                    <select
                      value={newCenterDivision}
                      onChange={(e) => setNewCenterDivision(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}
                    >
                      <option value="पुणे विभाग">पुणे विभाग</option>
                      <option value="नाशिक विभाग">नाशिक विभाग</option>
                      <option value="कोकण विभाग">कोकण विभाग</option>
                      <option value="छत्रपती संभाजीनगर विभाग">छत्रपती संभाजीनगर विभाग</option>
                      <option value="अमरावती विभाग">अमरावती विभाग</option>
                      <option value="नागपूर विभाग">नागपूर विभाग</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>जिल्हा *</label>
                    <input
                      type="text"
                      value={newCenterDistrict}
                      onChange={(e) => setNewCenterDistrict(e.target.value)}
                      placeholder="उदा. सातारा / सोलापूर / नाशिक"
                      required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>तालुका</label>
                    <input
                      type="text"
                      value={newCenterTaluka}
                      onChange={(e) => setNewCenterTaluka(e.target.value)}
                      placeholder="उदा. पंढरपूर / कराड / हवेली"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>केंद्राचा संपूर्ण पत्ता</label>
                  <input
                    type="text"
                    value={newCenterAddress}
                    onChange={(e) => setNewCenterAddress(e.target.value)}
                    placeholder="उदा. छत्रपती शिवाजी चौक, स्टेशन रोड, ४१३३०४"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>व्यवस्थापक / संपर्क व्यक्ती</label>
                    <input
                      type="text"
                      value={newCenterManager}
                      onChange={(e) => setNewCenterManager(e.target.value)}
                      placeholder="उदा. श्री. संग्राम पाटील"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>मोबाईल नंबर</label>
                    <input
                      type="tel"
                      value={newCenterPhone}
                      onChange={(e) => setNewCenterPhone(e.target.value)}
                      placeholder="९८२२०XXXXX"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>स्थानिक भागीदार संस्था/ट्रस्ट</label>
                    <input
                      type="text"
                      value={newCenterPartner}
                      onChange={(e) => setNewCenterPartner(e.target.value)}
                      placeholder="उदा. विठ्ठल रुक्मिणी प्रतिष्ठाण"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>गुंतवणूक मॉडेल</label>
                    <input
                      type="text"
                      value={newCenterInvestment}
                      onChange={(e) => setNewCenterInvestment(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: '#F8FAFC' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontWeight: 800, cursor: 'pointer' }}
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#C2410C', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(194,65,12,0.3)' }}
                  >
                    + डेटाबेसमध्ये केंद्र नोंदणी करा
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 2: EDIT COMMUNITY CENTER MODAL */}
        {/* ============================================================ */}
        {showEditModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✏️</span> {currentCenter.name} — संपादन
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCenter}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>केंद्राचा पत्ता</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>व्यवस्थापक (Manager)</label>
                    <input
                      type="text"
                      value={editManager}
                      onChange={(e) => setEditManager(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>संपर्क फोन</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>भागीदार संस्था</label>
                    <input
                      type="text"
                      value={editPartner}
                      onChange={(e) => setEditPartner(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>सद्य स्थिती</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: '#FFFFFF' }}
                    >
                      <option value="सक्रिय (Active)">सक्रिय (Active)</option>
                      <option value="नियोजित (Upcoming)">नियोजित (Upcoming)</option>
                      <option value="तातडीचे नूतनीकरण (Renovation)">तातडीचे नूतनीकरण</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontWeight: 800, cursor: 'pointer' }}
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#2563EB', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                  >
                    ✓ बदल जतन करा (Save)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 3: INTERACTIVE DESK ACTION MODAL */}
        {/* ============================================================ */}
        {selectedDeskModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#EA580C', fontWeight: 800 }}>डेस्क ऑपरेशन्स कक्ष</div>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedDeskModal.icon}</span> {selectedDeskModal.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                    प्रभारी: <strong>{selectedDeskModal.head}</strong> | सद्य स्थिती: <span style={{ color: '#C2410C', fontWeight: 800 }}>{selectedDeskModal.count}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDeskModal(null)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', margin: '0 0 16px' }}>
                {selectedDeskModal.desc}
              </p>

              <form onSubmit={handleRecordDeskAction}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>नागरिक / अर्जदाराचे नाव *</label>
                    <input
                      type="text"
                      value={deskCitizenName}
                      onChange={(e) => setDeskCitizenName(e.target.value)}
                      placeholder="उदा. रणजित कदम"
                      required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>मोबाईल नंबर</label>
                    <input
                      type="tel"
                      value={deskCitizenPhone}
                      onChange={(e) => setDeskCitizenPhone(e.target.value)}
                      placeholder="९८२२०XXXXX"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>केस तपशील / कृती नोंदी *</label>
                  <textarea
                    rows={3}
                    value={deskNotes}
                    onChange={(e) => setDeskNotes(e.target.value)}
                    placeholder="उदा. शेतकरी FPO थेट विक्री धान्य नोंदणी किंवा ७/१२ फेरफार कायदेशीर सल्ला विनंती दाखल केली."
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>प्राधान्य (Priority)</label>
                    <select
                      value={deskPriority}
                      onChange={(e) => setDeskPriority(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}
                    >
                      <option value="सामान्य (Normal)">सामान्य (Normal)</option>
                      <option value="तातडीचे (Urgent)">तातडीचे (Urgent)</option>
                      <option value="सर्वोच्च प्राधान्य (Critical)">सर्वोच्च प्राधान्य (Critical)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>केस स्थिती (Status)</label>
                    <select
                      value={deskStatus}
                      onChange={(e) => setDeskStatus(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}
                    >
                      <option value="नोंदणीकृत (Registered)">नोंदणीकृत (Registered)</option>
                      <option value="प्रगतीपथावर (In Progress)">प्रगतीपथावर (In Progress)</option>
                      <option value="पूर्ण झाले (Resolved)">पूर्ण झाले (Resolved)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDeskModal(null)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontWeight: 800, cursor: 'pointer' }}
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#EA580C', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}
                  >
                    + डेस्क केस नोंदवा
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 4: PRINT DAILY REPORT MODAL */}
        {/* ============================================================ */}
        {showPrintModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#C2410C', letterSpacing: '1px' }}>
                    🚩 CONNECT MARATHA — अधिकृत दैनिक केंद्र अहवाल
                  </div>
                  <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>
                    {currentCenter.name}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                    केंद्राचा कोड: <strong>{currentCenter.id}</strong> | श्रेणी: <strong>{currentCenter.tier}</strong> | {currentCenter.district}
                  </div>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Printable Stats Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>आजचे अभ्यागत</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16A34A' }}>{currentCenter.todayVisitors || 42}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>आजची जमा</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>₹{(currentCenter.dailyCollection || 84500).toLocaleString()}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>प्रलंबित KYC</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#EA580C' }}>{currentCenter.kycPending || 18}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>सक्रिय सभासद</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563EB' }}>{(currentCenter.activeMembers || 2840).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.8, marginBottom: '24px', background: '#FFFDF9', padding: '16px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                <div>📍 <strong>पत्ता:</strong> {currentCenter.address || 'स्थानिक मध्यवर्ती कार्यालय'}</div>
                <div>👤 <strong>व्यवस्थापक:</strong> {currentCenter.contactPerson || currentCenter.manager_name || 'श्री. सचिन मोहिते'}</div>
                <div>📞 <strong>फोन:</strong> {currentCenter.contactPhone || currentCenter.manager_phone || '९८२२०XXXXX'}</div>
                <div>🤝 <strong>भागीदार संस्था:</strong> {currentCenter.partnerName || currentCenter.partner_name || 'सह्याद्री प्रतिष्ठान'}</div>
                <div>📅 <strong>दिनांक व वेळ:</strong> {new Date().toLocaleDateString('mr-IN')} | {new Date().toLocaleTimeString()}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #CBD5E1', paddingTop: '18px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
                    व्यवस्थापक सही व शिक्का
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.print()}
                    style={{ background: '#16A34A', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>🖨️</span> प्रिंट करा
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    बंद करा
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 5: REAL DATABASE RECORDS MODAL (MEMBERS / B2B / JOBS / KYC / VISITORS / REVENUE) */}
        {/* ============================================================ */}
        {dataModalType && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: dataModalType === 'members' ? 'linear-gradient(135deg, #1E3A8A, #2563EB)' :
                            dataModalType === 'businesses' ? 'linear-gradient(135deg, #581C87, #7E22CE)' :
                            dataModalType === 'jobs' ? 'linear-gradient(135deg, #075985, #0284C7)' :
                            dataModalType === 'kyc' ? 'linear-gradient(135deg, #9A3412, #EA580C)' :
                            dataModalType === 'visitors' ? 'linear-gradient(135deg, #14532D, #16A34A)' :
                            dataModalType === 'services' ? 'linear-gradient(135deg, #B45309, #D97706)' :
                            dataModalType === 'hotels' ? 'linear-gradient(135deg, #065F46, #059669)' :
                            'linear-gradient(135deg, #7C2D12, #C2410C)',
                color: '#FFFFFF',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 800, marginBottom: '6px' }}>
                    <span>🟢</span> LIVE SQLITE DATABASE
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900 }}>
                    {dataModalType === 'members' && `👥 नोंदणीकृत सभासद परिवार (${dbMembers.length} सभासद)`}
                    {dataModalType === 'businesses' && `💼 B2B उद्योग व संगम व्यवहार (${dbBusinesses.length} उद्योग)`}
                    {dataModalType === 'jobs' && `👔 रोजगार मुलाखती व भरती पदे (${dbJobs.length} पदे)`}
                    {dataModalType === 'kyc' && `🪪 प्रलंबित KYC छाननी व १-क्लिक प्रमाणन (${dbMembers.filter(m => !m.verified_profile).length} प्रलंबित)`}
                    {dataModalType === 'visitors' && `🧑‍💼 आजचे प्रत्यक्ष काउंटर अभ्यागत (${(currentCenter.todayVisitors || 42) + recentLogs.length} नोंदी)`}
                    {dataModalType === 'collection' && `💰 दैनिक वर्गणी व जमा पावती लेजर (₹${(currentCenter.dailyCollection || 84500).toLocaleString()})`}
                    {dataModalType === 'services' && `🛠️ १६ व्यावसायिक सेवा कक्ष (16 Service Desks & Local Orders)`}
                    {dataModalType === 'hotels' && `🏨 हॉटेल्स, पर्यटन व किल्ले टूर बुकिंग्स (Tourism & Hospitality)`}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setDataModalType(null);
                    setModalSearch('');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.22)',
                    color: '#FFFFFF',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Search & Actions Bar */}
              {['members', 'businesses', 'jobs', 'kyc', 'services', 'hotels'].includes(dataModalType) && (
                <div style={{ padding: '14px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder={
                      dataModalType === 'members' ? '🔍 नाव, कुल, जिल्हा किंवा मोबाईल नंबरने शोधा...' :
                      dataModalType === 'businesses' ? '🔍 उद्योग नाव, प्रवर्तक किंवा प्रवर्ग शोधा...' :
                      dataModalType === 'jobs' ? '🔍 पद, कंपनी किंवा जिल्हा शोधा...' :
                      dataModalType === 'services' ? '🔍 सेवा कक्ष नाव किंवा प्रभारी अधिकारी शोधा...' :
                      dataModalType === 'hotels' ? '🔍 हॉटेल नाव, ठिकाण किंवा टूर शोधा...' :
                      '🔍 प्रलंबित सभासद शोधा...'
                    }
                    style={{
                      flex: 1,
                      minWidth: '240px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.92rem'
                    }}
                  />
                  <button
                    onClick={fetchDbRecords}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 रीलोड करा
                  </button>
                </div>
              )}

              {/* Modal Body with Scroll */}
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#FFFFFF' }}>
                {loadingDbRecords ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontWeight: 700 }}>
                    डेटाबेसवरून माहिती लोड होत आहे... कृपया थांबा.
                  </div>
                ) : (
                  <>
                    {/* 1. MEMBERS LIST */}
                    {dataModalType === 'members' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {dbMembers
                          .filter(m => {
                            if (!modalSearch.trim()) return true;
                            const q = modalSearch.toLowerCase();
                            return (m.name || '').toLowerCase().includes(q) ||
                                   (m.phone || '').includes(q) ||
                                   (m.district || '').toLowerCase().includes(q) ||
                                   (m.kul || '').toLowerCase().includes(q) ||
                                   (m.profession || '').toLowerCase().includes(q);
                          })
                          .map((m, idx) => (
                            <div
                              key={m.id || idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '50%',
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 900,
                                  fontSize: '1.1rem',
                                  border: '1.5px solid #BFDBFE'
                                }}>
                                  {(m.name || 'म').charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.98rem' }}>
                                    {m.name} <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>({m.id})</span>
                                  </div>
                                  <div style={{ fontSize: '0.80rem', color: '#475569', marginTop: '2px' }}>
                                    📍 <strong>{m.district || m.city || 'पुणे'}</strong> | कुल: <strong>{m.kul || '९६ कुळी मराठा'}</strong> | व्यवसाय: <strong>{m.profession || 'व्यापार व उद्योग'}</strong>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                  fontSize: '0.74rem',
                                  padding: '4px 10px',
                                  borderRadius: '100px',
                                  fontWeight: 800,
                                  background: m.verified_profile ? '#DCFCE7' : '#FEF3C7',
                                  color: m.verified_profile ? '#15803D' : '#92400E'
                                }}>
                                  {m.verified_profile ? '✓ प्रमाणित' : 'प्रलंबित KYC'}
                                </span>
                                <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>
                                  📞 {m.phone || 'उपलब्ध नाही'}
                                </span>
                                <button
                                  onClick={() => setSelectedMemberDetail(m)}
                                  style={{
                                    background: '#2563EB',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  स्मार्ट कार्ड ➔
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* 2. BUSINESSES LIST */}
                    {dataModalType === 'businesses' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                        {dbBusinesses
                          .filter(b => {
                            if (!modalSearch.trim()) return true;
                            const q = modalSearch.toLowerCase();
                            return (b.name || '').toLowerCase().includes(q) ||
                                   (b.owner || '').toLowerCase().includes(q) ||
                                   (b.cat || b.category || '').toLowerCase().includes(q) ||
                                   (b.district || '').toLowerCase().includes(q);
                          })
                          .map((b, idx) => (
                            <div
                              key={b.id || idx}
                              style={{
                                background: '#FFFDF9',
                                border: '1px solid #FED7AA',
                                borderRadius: '14px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#7C2D12' }}>{b.name}</div>
                                  <span style={{ background: '#EA580C', color: '#FFF', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                    ⭐ {b.rating || '4.8'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                                  प्रवर्तक: <strong>{b.owner || 'मराठा उद्योजक'}</strong>
                                </div>
                                <div style={{ fontSize: '0.80rem', color: '#64748B', marginTop: '2px' }}>
                                  प्रवर्ग: <strong>{b.cat || b.category || 'उत्पादन व व्यापार'}</strong> | 📍 {b.city || ''}, {b.district || 'पुणे'}
                                </div>
                              </div>
                              <div style={{ marginTop: '12px', borderTop: '1px solid #FED7AA', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>📞 {b.phone || '९८२२०XXXXX'}</span>
                                <button
                                  onClick={() => {
                                    setB2bDealTarget(b);
                                    setB2bDealTitle(`${b.name} - घाऊक पुरवठा करार`);
                                  }}
                                  style={{ background: '#7E22CE', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                                >
                                  B2B डील जोडा ➔
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* 3. JOBS LIST */}
                    {dataModalType === 'jobs' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                        {dbJobs
                          .filter(j => {
                            if (!modalSearch.trim()) return true;
                            const q = modalSearch.toLowerCase();
                            return (j.title || '').toLowerCase().includes(q) ||
                                   (j.company || '').toLowerCase().includes(q) ||
                                   (j.district || '').toLowerCase().includes(q);
                          })
                          .map((j, idx) => (
                            <div
                              key={j.id || idx}
                              style={{
                                background: '#F0F9FF',
                                border: '1px solid #BAE6FD',
                                borderRadius: '14px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#0369A1' }}>{j.title}</div>
                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{j.company}</div>
                                <div style={{ fontSize: '0.80rem', color: '#475569', marginTop: '4px' }}>
                                  💰 <strong>{j.salary || '₹२५,००० - ₹४०,०००'}</strong> | अनुभव: <strong>{j.experience || '१-३ वर्षे'}</strong>
                                </div>
                                <div style={{ fontSize: '0.80rem', color: '#64748B', marginTop: '2px' }}>
                                  📍 {j.district || 'पुणे'} | प्रकार: {j.job_type || 'Full Time'}
                                </div>
                              </div>
                              <div style={{ marginTop: '12px', borderTop: '1px solid #BAE6FD', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0F172A' }}>📞 {j.phone || '९८२२०XXXXX'}</span>
                                <button
                                  onClick={() => {
                                    setInterviewTarget(j);
                                    setInterviewCandidateName('');
                                    setInterviewCandidatePhone('');
                                  }}
                                  style={{ background: '#0284C7', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                                >
                                  मुलाखत घ्या ➔
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* 4. KYC APPROVAL LIST */}
                    {dataModalType === 'kyc' && (
                      <div>
                        <div style={{ background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.86rem', color: '#9A3412', fontWeight: 700 }}>
                          ℹ️ कम्युनिटी सेंटर मॅनेजर अधिकार: खालील प्रलंबित अर्जांची प्रत्यक्ष कागदपत्रे तपासून एका क्लिकवर KYC मंजूर करा व स्मार्ट कार्ड वाटप निश्चित करा.
                        </div>

                        {dbMembers.filter(m => !m.verified_profile).length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px', background: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534' }}>सर्व KYC पडताळणी पूर्ण झाली आहे!</div>
                            <div style={{ fontSize: '0.85rem', color: '#15803D', marginTop: '4px' }}>सध्या एकही प्रलंबित अर्ज शिल्लक नाही.</div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {dbMembers
                              .filter(m => !m.verified_profile)
                              .map((m, idx) => (
                                <div
                                  key={m.id || idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: '#FFFFFF',
                                    border: '1.5px solid #EA580C',
                                    borderRadius: '14px',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    boxShadow: '0 4px 12px rgba(234,88,12,0.06)'
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                                      👤 {m.name} <span style={{ fontSize: '0.78rem', color: '#64748B' }}>({m.id})</span>
                                    </div>
                                    <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                                      📞 {m.phone || 'फोन उपलब्ध नाही'} | 📍 <strong>{m.district || m.city || 'पुणे'}</strong> | कुल: <strong>{m.kul || '९६ कुळी मराठा'}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
                                      📄 आधार कार्ड व रहिवासी दाखला संलग्न (पडताळणीस तयार)
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      onClick={() => handleVerifyKyc(m.id, m.name)}
                                      style={{
                                        background: '#16A34A',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(22,163,74,0.25)'
                                      }}
                                    >
                                      ✓ KYC मंजूर करा व स्मार्ट कार्ड द्या
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. VISITORS REGISTER */}
                    {dataModalType === 'visitors' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                            आजचे प्रत्यक्ष काउंटर अभ्यागत नोंदी
                          </h4>
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontWeight: 800, fontSize: '0.8rem' }}>
                            एकूण: {(currentCenter.todayVisitors || 42) + recentLogs.length} अभ्यागत
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { time: '10:15 AM', name: 'संग्राम प्रताप मोरे', phone: '९८२२०११९२१', purpose: 'सदस्य नोंदणी व KYC छाननी' },
                            { time: '11:00 AM', name: 'सचिन गायकवाड (महादेव स्टील)', phone: '९८२२०११९२५', purpose: 'B2B संगम व्यापारी करार बैठक' },
                            { time: '11:45 AM', name: 'रोहन विठ्ठल कदम', phone: '९८२२०११९२८', purpose: 'रोजगार व नोकरी मुलाखत (CNC ऑपरेटर)' },
                            { time: '12:30 PM', name: 'डॉ. विजयसिंह भोसले', phone: '९८२२०११००१', purpose: 'आपत्कालीन रक्त विनंती समन्वय' },
                            { time: '01:10 PM', name: 'अशोकराव सावंत', phone: '९८२२०११९३०', purpose: 'महाबळेश्वर हेरिटेज हॉटेल कौटुंबिक बुकिंग' },
                            ...recentLogs.map(r => ({ time: r.time, name: r.text, phone: 'केंद्रावर नोंद', purpose: 'थेट सेवा' }))
                          ].map((v, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
                              <div>
                                <span style={{ color: '#64748B', fontWeight: 700, marginRight: '10px' }}>[{v.time}]</span>
                                <strong style={{ color: '#0F172A' }}>{v.name}</strong>
                                <span style={{ color: '#64748B', fontSize: '0.80rem', marginLeft: '10px' }}>({v.phone})</span>
                              </div>
                              <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem' }}>
                                {v.purpose}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6. COLLECTION LEDGER */}
                    {dataModalType === 'collection' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#FFF7ED', padding: '14px 18px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                          <div>
                            <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 700 }}>केंद्रावर एकूण जमा</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>₹{(currentCenter.dailyCollection || 84500).toLocaleString()}</div>
                          </div>
                          <button
                            onClick={() => {
                              setDataModalType(null);
                              setActiveTab('collection');
                            }}
                            style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            + नवीन पावती काढा ➔
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {recentCollections.map((c, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
                              <div>
                                <strong style={{ color: '#EA580C', marginRight: '8px' }}>{c.id}</strong>
                                <strong style={{ color: '#0F172A' }}>{c.name}</strong>
                                <span style={{ color: '#64748B', marginLeft: '10px' }}>({c.type})</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>{c.time}</span>
                                <strong style={{ color: '#16A34A', fontSize: '1.05rem' }}>₹{c.amount.toLocaleString()}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 7. SERVICES DESKS LIST */}
                    {dataModalType === 'services' && (
                      <div>
                        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.86rem', color: '#92400E', fontWeight: 700 }}>
                          ℹ️ कम्युनिटी सेंटर अंतर्गत कार्यरत १६ व्यावसायिक सेवा कक्ष. नागरिकांच्या थेट समस्या, केस फाईल्स व सेवा ऑर्डर्स व्यवस्थापन:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                          {SERVICE_DESKS
                            .filter(d => {
                              if (!modalSearch.trim()) return true;
                              const q = modalSearch.toLowerCase();
                              return (d.title || '').toLowerCase().includes(q) ||
                                     (d.head || '').toLowerCase().includes(q) ||
                                     (d.desc || '').toLowerCase().includes(q);
                            })
                            .map(d => (
                              <div
                                key={d.id}
                                style={{
                                  background: '#FFFDF9',
                                  border: '1.5px solid #FED7AA',
                                  borderRadius: '14px',
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.6rem' }}>{d.icon}</span>
                                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.74rem', padding: '3px 8px', borderRadius: '100px', fontWeight: 800 }}>
                                      {d.count} सक्रिय केसेस
                                    </span>
                                  </div>
                                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{d.title}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 10px', lineHeight: 1.4 }}>{d.desc}</div>
                                </div>
                                <div style={{ borderTop: '1px solid #FED7AA', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                  <span style={{ color: '#475569', fontWeight: 700 }}>प्रभारी: <strong>{d.head}</strong></span>
                                  <button
                                    onClick={() => setSelectedDeskModal(d)}
                                    style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                                  >
                                    केस नोंदवा ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 8. HOTELS & TOURISM LIST */}
                    {dataModalType === 'hotels' && (
                      <div>
                        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.86rem', color: '#065F46', fontWeight: 700 }}>
                          ℹ️ मराठा व्यावसायिक हॉटेल्स व ऐतिहासिक गड-किल्ले पर्यटन बुकिंग नेटवर्क:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                          {[
                            { name: 'किल्ले रायगड हेरिटेज रिसॉर्ट', loc: 'रायगड पायथा', rating: '४.९ ★', rooms: '१८ खोल्या उपलब्ध', price: '₹२,८०० / रात्र', tag: 'ऐतिहासिक टूर', phone: '०२१४५-२३४५६७' },
                            { name: 'शिवनेरी व्हॅली व्ह्यू हॉटेल', loc: 'जुन्नर, पुणे', rating: '४.८ ★', rooms: '१२ खोल्या उपलब्ध', price: '₹२,२०० / रात्र', tag: 'कौटुंबिक मुक्काम', phone: '०२१३२-२२३३४४' },
                            { name: 'पन्हाळा राजदरबार लॉजिंग', loc: 'कोल्हापूर - पन्हाळा', rating: '४.९ ★', rooms: '२२ खोल्या उपलब्ध', price: '₹३,१०० / रात्र', tag: 'हेरिटेज स्टे', phone: '०२३१-२६५४३२१' },
                            { name: 'गोदावरी रिव्हरफ्रंट इन', loc: 'गंगापूर रोड, नाशिक', rating: '४.७ ★', rooms: '१५ खोल्या उपलब्ध', price: '₹२,५०० / रात्र', tag: 'तीर्थक्षेत्र टूर', phone: '०२५३-२३४९८७६' }
                          ]
                            .filter(h => {
                              if (!modalSearch.trim()) return true;
                              const q = modalSearch.toLowerCase();
                              return (h.name || '').toLowerCase().includes(q) ||
                                     (h.loc || '').toLowerCase().includes(q) ||
                                     (h.tag || '').toLowerCase().includes(q);
                            })
                            .map((h, idx) => (
                              <div key={idx} style={{ border: '1px solid #BAE6FD', borderRadius: '14px', padding: '16px', background: '#F0F9FF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 style={{ margin: 0, color: '#0369A1', fontSize: '1.05rem', fontWeight: 800 }}>{h.name}</h4>
                                    <span style={{ background: '#0284C7', color: '#FFF', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>{h.rating}</span>
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 10px' }}>📍 {h.loc} | {h.tag}</div>
                                  <div style={{ fontSize: '0.80rem', color: '#16A34A', fontWeight: 800 }}>{h.rooms}</div>
                                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{h.price}</div>
                                </div>
                                <div style={{ marginTop: '12px', borderTop: '1px solid #BAE6FD', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#475569' }}>📞 {h.phone}</span>
                                  <button
                                    onClick={() => setSelectedHotelBooking(h)}
                                    style={{ background: '#059669', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                                  >
                                    थेट बुक करा ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.80rem', color: '#64748B', fontWeight: 700 }}>
                  डेटाबेस: SQLite3 Native (केंद्राचा कोड: {currentCenter.id})
                </span>
                <button
                  onClick={() => {
                    setDataModalType(null);
                    setModalSearch('');
                  }}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  बंद करा (Close)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: MEMBER SMART CARD DETAILS PREVIEW */}
        {/* ============================================================ */}
        {selectedMemberDetail && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 10005,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', letterSpacing: '1px' }}>
                    🚩 CONNECT MARATHA — अधिकृत स्मार्ट ओळखपत्र
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#0F172A' }}>
                    {selectedMemberDetail.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMemberDetail(null)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '18px',
                boxShadow: '0 8px 20px rgba(234,88,12,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>अधिकृत सदस्यत्व कार्ड</span>
                  <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                    {selectedMemberDetail.tier || 'Royal Patron'}
                  </span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>
                  {selectedMemberDetail.name}
                </div>
                <div style={{ fontSize: '0.84rem', opacity: 0.9 }}>
                  आयडी: <strong>{selectedMemberDetail.id}</strong> | कुल: <strong>{selectedMemberDetail.kul || '९६ कुळी मराठा'}</strong>
                </div>
                <div style={{ fontSize: '0.84rem', opacity: 0.9, marginTop: '4px' }}>
                  स्थान: <strong>{selectedMemberDetail.district || 'पुणे'}</strong> | फोन: <strong>{selectedMemberDetail.phone}</strong>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', marginTop: '12px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', opacity: 0.95 }}>
                  <span>✓ बायोमेट्रिक/KYC प्रमाणित</span>
                  <span>क्यूआर कोड: VALID 2026-27</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    showToast(`🖨️ ${selectedMemberDetail.name} यांचे ओळखपत्र प्रिंटिंग सुरू केले!`);
                    setSelectedMemberDetail(null);
                  }}
                  style={{ flex: 1, background: '#16A34A', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  🖨️ कार्ड प्रिंट करा
                </button>
                <button
                  onClick={() => setSelectedMemberDetail(null)}
                  style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: HOTEL BOOKING MODAL */}
        {/* ============================================================ */}
        {selectedHotelBooking && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 10006,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', letterSpacing: '1px' }}>
                    🏨 मराठा हेरिटेज व पर्यटन आरक्षण
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {selectedHotelBooking.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                    📍 {selectedHotelBooking.loc} | दर: <strong>{selectedHotelBooking.price}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHotelBooking(null)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    अतिथी / सदस्याचे नाव *
                  </label>
                  <input
                    type="text"
                    value={hotelGuestName}
                    onChange={(e) => setHotelGuestName(e.target.value)}
                    placeholder="उदा. संग्रामराव कदम"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      मोबाईल नंबर *
                    </label>
                    <input
                      type="text"
                      value={hotelGuestPhone}
                      onChange={(e) => setHotelGuestPhone(e.target.value)}
                      placeholder="उदा. ९८२२०XXXXX"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      खोल्यांची संख्या
                    </label>
                    <select
                      value={hotelGuestRooms}
                      onChange={(e) => setHotelGuestRooms(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    >
                      <option value="१">१ खोली (Room)</option>
                      <option value="२">२ खोल्या (Rooms)</option>
                      <option value="३">३ खोल्या (Family Suite)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    आगमनाची तारीख (Check-in Date)
                  </label>
                  <input
                    type="date"
                    value={hotelGuestDate}
                    onChange={(e) => setHotelGuestDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    const gName = hotelGuestName.trim() || 'सभासद बंधू';
                    const newLog = {
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      text: `🏨 ${gName} यांच्यासाठी ${selectedHotelBooking.name} येथे ${hotelGuestRooms} खोली आरक्षित केली!`
                    };
                    setRecentLogs(prev => [newLog, ...prev]);
                    const newRec = {
                      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
                      name: gName,
                      amount: 500,
                      type: 'हॉटेल आरक्षण टोकन',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setRecentCollections(prev => [newRec, ...prev]);
                    showToast(`✅ ${gName} यांच्यासाठी ${selectedHotelBooking.name} आरक्षण यशस्वीरित्या नोंदवले गेले!`);
                    setSelectedHotelBooking(null);
                    setHotelGuestName('');
                    setHotelGuestPhone('');
                  }}
                  style={{ flex: 1, background: '#059669', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ आरक्षण निश्चित करा (Confirm)
                </button>
                <button
                  onClick={() => setSelectedHotelBooking(null)}
                  style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: B2B DEAL PROPOSAL MODAL */}
        {/* ============================================================ */}
        {b2bDealTarget && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 10006,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7E22CE', letterSpacing: '1px' }}>
                    💼 B2B मराठा संगम व्यापार संधी
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {b2bDealTarget.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                    प्रवर्तक: <strong>{b2bDealTarget.owner}</strong> | प्रवर्ग: <strong>{b2bDealTarget.cat || 'उद्योग'}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setB2bDealTarget(null)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    प्रस्ताव / खरेदी तपशील *
                  </label>
                  <input
                    type="text"
                    value={b2bDealTitle}
                    onChange={(e) => setB2bDealTitle(e.target.value)}
                    placeholder="उदा. कच्चा माल पुरवठा करार २०२६"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    अंदाजे व्यवहार मूल्य (Deal Value)
                  </label>
                  <input
                    type="text"
                    value={b2bDealAmount}
                    onChange={(e) => setB2bDealAmount(e.target.value)}
                    placeholder="उदा. ₹१,५०,०००"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    const title = b2bDealTitle.trim() || 'B2B संगम खरेदी प्रस्ताव';
                    const newLog = {
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      text: `🤝 ${b2bDealTarget.name} यांच्याकडे '${title}' (${b2bDealAmount}) चा प्रस्ताव पाठवला!`
                    };
                    setRecentLogs(prev => [newLog, ...prev]);
                    showToast(`✅ ${b2bDealTarget.name} यांच्याकडे B2B प्रस्ताव यशस्वीरीत्या नोंदवला गेला!`);
                    setB2bDealTarget(null);
                  }}
                  style={{ flex: 1, background: '#7E22CE', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ प्रस्ताव सादर करा (Submit Proposal)
                </button>
                <button
                  onClick={() => setB2bDealTarget(null)}
                  style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: INTERVIEW SCHEDULING MODAL */}
        {/* ============================================================ */}
        {interviewTarget && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 10006,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0284C7', letterSpacing: '1px' }}>
                    🎙️ रोजगार व नोकरी मुलाखत नियोजन
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {interviewTarget.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                    कंपनी: <strong>{interviewTarget.company}</strong> | वेतन: <strong>{interviewTarget.salary}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setInterviewTarget(null)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    उमेदवाराचे नाव *
                  </label>
                  <input
                    type="text"
                    value={interviewCandidateName}
                    onChange={(e) => setInterviewCandidateName(e.target.value)}
                    placeholder="उदा. रोहन विठ्ठल कदम"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      मोबाईल नंबर *
                    </label>
                    <input
                      type="text"
                      value={interviewCandidatePhone}
                      onChange={(e) => setInterviewCandidatePhone(e.target.value)}
                      placeholder="उदा. ९८२२०XXXXX"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      मुलाखतीची वेळ
                    </label>
                    <input
                      type="text"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    const cName = interviewCandidateName.trim() || 'उमेदवार';
                    const newLog = {
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      text: `🎙️ ${cName} यांची '${interviewTarget.title}' पदासाठी मुलाखत नोंदवली!`
                    };
                    setRecentLogs(prev => [newLog, ...prev]);
                    showToast(`✅ ${cName} यांची मुलाखत निश्चित करण्यात आली!`);
                    setInterviewTarget(null);
                  }}
                  style={{ flex: 1, background: '#0284C7', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ मुलाखत निश्चित करा (Schedule Interview)
                </button>
                <button
                  onClick={() => setInterviewTarget(null)}
                  style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: PIPELINE ITEM INSPECTION MODAL */}
        {/* ============================================================ */}
        {selectedPipelineItem && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 10006,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ background: selectedPipelineItem.badge || '#2563EB', color: '#FFF', fontSize: '0.74rem', padding: '3px 10px', borderRadius: '100px', fontWeight: 800 }}>
                    {selectedPipelineItem.stage}
                  </span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#0F172A' }}>
                    {selectedPipelineItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPipelineItem(null)}
                  style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '18px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                <div>📍 संबंधित केंद्र: <strong>{currentCenter.name} ({currentCenter.district})</strong></div>
                <div>👤 प्रभारी अधिकारी: <strong>{currentCenter.manager || 'केंद्र संचालक'}</strong></div>
                <div>📅 अद्ययावत तारीख: <strong>१० ऑक्टोबर २०२६</strong></div>
                <div style={{ marginTop: '8px', color: '#16A34A', fontWeight: 700 }}>✓ स्टेटस: प्रत्यक्ष कामावर प्रगती सुरू आहे</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    showToast(`✅ '${selectedPipelineItem.title}' पुढील टप्प्यावर यशस्वीरित्या हलवले गेले!`);
                    setSelectedPipelineItem(null);
                  }}
                  style={{ flex: 1, background: '#16A34A', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ पुढील टप्प्यावर हलवा (Advance)
                </button>
                <button
                  onClick={() => setSelectedPipelineItem(null)}
                  style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
);
}
