import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';

// 4-Tier Hierarchical Structure
export const CENTER_TIERS = [
  { id: 'state', label: '🟠 राज्य मध्यवर्ती मुख्यालय (State Apex)', color: '#C2410C', bg: '#FFEDD5', icon: '🏛️' },
  { id: 'division', label: '🟣 विभागीय महा-संकुल (Division Hub)', color: '#7E22CE', bg: '#F3E8FF', icon: '🏢' },
  { id: 'district', label: '🔵 जिल्हा मराठा भवन (District Center)', color: '#1D4ED8', bg: '#DBEAFE', icon: '📍' },
  { id: 'taluka', label: '🟢 तालुका सेवा व व्यापार केंद्र (Taluka Hub)', color: '#15803D', bg: '#DCFCE7', icon: '🏪' }
];

// 12 Functional Service & Business Desks
const SERVICE_DESKS = [
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
  { id: 'support', title: '☎️ हेल्पडेस्क व तक्रार निवारण', desc: 'नागरिक चौकशी, ॲप मदत व तक्रारींचा तातडीने निपटारा', count: '1 प्रलंबित', head: 'कस्टमर केअर', icon: '🎧' }
];

export default function CommunityCenterCRM() {
  const [centers, setCenters] = useState([]);
  const [selectedTier, setSelectedTier] = useState('taluka');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [activeTab, setActiveTab] = useState('desk'); // 'desk', 'pipeline', 'desks', 'hotels', 'roles', 'collection'
  const [pipelineFilter, setPipelineFilter] = useState('b2b'); // 'kyc', 'b2b', 'jobs', 'services'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

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
      const list = data || [];
      setCenters(list);
      
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
        {/* 3. TODAY'S LIVE COMMERCE & SERVICE METRICS (8 KPI CARDS) */}
        {/* ============================================================ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Visitors */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>आजचे अभ्यागत (Visitors)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
              {currentCenter.todayVisitors || 42}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700 }}>👥 प्रत्यक्ष काउंटरवर भेट</div>
          </div>

          {/* Card 2: Revenue */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>आजची प्रत्यक्ष जमा (Revenue)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
              ₹{(currentCenter.dailyCollection || 84500).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 700 }}>💰 रोख + UPI लेजर</div>
          </div>

          {/* Card 3: KYC Pending */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>प्रलंबित KYC छाननी</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginTop: '2px' }}>
              {currentCenter.kycPending || 18}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#C2410C', fontWeight: 700 }}>🪪 स्मार्ट कार्ड वाटप</div>
          </div>

          {/* Card 4: Active Members */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>नोंदणीकृत सभासद</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563EB', marginTop: '2px' }}>
              {(currentCenter.activeMembers || 2840).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1D4ED8', fontWeight: 700 }}>✓ स्थानिक सभासद परिवार</div>
          </div>

          {/* Card 5: B2B Leads */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>B2B संगम व्यवहार</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7E22CE', marginTop: '2px' }}>
              18
            </div>
            <div style={{ fontSize: '0.74rem', color: '#6B21A8', fontWeight: 700 }}>🤝 ₹१४.२ लाख उलाढाल</div>
          </div>

          {/* Card 6: Job Interviews */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>रोजगार मुलाखती (Jobs)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284C7', marginTop: '2px' }}>
              14
            </div>
            <div style={{ fontSize: '0.74rem', color: '#0369A1', fontWeight: 700 }}>👔 ८ उमेदवार निवडले</div>
          </div>

          {/* Card 7: Local Services */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>स्थानिक सेवा ऑर्डर्स</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
              28
            </div>
            <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700 }}>🔧 इलेक्ट्रिशियन/वकील/CA</div>
          </div>

          {/* Card 8: Hotel & Tourism */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>हॉटेल्स व पर्यटन</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
              9
            </div>
            <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>🏨 किल्ले टूर बुकिंग्स</div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MAIN NAVIGATION TABS */}
        {/* ============================================================ */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '2px solid #E2E8F0', marginBottom: '22px', paddingBottom: '2px' }}>
          {[
            { id: 'desk', label: '🧑‍💼 काउंटर व अभ्यागत (Front Desk)' },
            { id: 'pipeline', label: '📋 "माझे कार्य प्रवाह" (My Pipelines)' },
            { id: 'desks', label: '🛠️ १२ व्यावसायिक सेवा कक्ष (12 Desks)' },
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
                        <div key={i} style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', fontWeight: 700 }}>
                          {it}
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
        {/* TAB 3: 12 DEPARTMENT SERVICE DESKS */}
        {/* ============================================================ */}
        {activeTab === 'desks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  🏢 कम्युनिटी सेंटरमधील १२ मुख्य सेवा व व्यापार कक्ष
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  प्रत्येक कक्षाची स्वतंत्र जबाबदारी, नियुक्त समन्वयक व थेट ग्राहक सेवा
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {SERVICE_DESKS.map((d) => (
                <div key={d.id} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                      onClick={() => showToast(`${d.title} कक्षाचे ऑपरेशन्स उघडले`)}
                      style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      उघडा →
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
                      onClick={() => showToast(`केंद्रावर ${h.name} बुकिंग इनक्वायरी नोंदवली!`)}
                      style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      थेट बुक करा
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

      </div>
    </div>
  </div>
);
}
