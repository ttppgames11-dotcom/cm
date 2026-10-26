import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'सर्व सेवा', icon: '🛠️' },
  { id: 'home_repairs', label: 'इलेक्ट्रिशियन व घरगुती दुरुस्ती', icon: '⚡' },
  { id: 'healthcare', label: 'आरोग्य व वैद्यकीय सेवा', icon: '🩺' },
  { id: 'education', label: 'शिक्षक, ट्यूटर व करिअर', icon: '🎓' },
  { id: 'transport', label: 'ड्रायव्हर्स व वाहतूक', icon: '🚗' },
  { id: 'legal_finance', label: 'वकील, सीए व कर सल्लागार', icon: '⚖️' },
  { id: 'technology', label: 'सॉफ्टवेअर, डिझाइन व आयटी', icon: '💻' },
  { id: 'agriculture', label: 'कृषी, ट्रॅक्टर व शेती सेवा', icon: '🌾' },
  { id: 'events_volunteers', label: 'इव्हेंट, केटरिंग व स्वयंसेवक', icon: '🤝' },
  { id: 'b2b_consulting', label: 'B2B उद्योग व कन्सल्टिंग', icon: '💼' }
];

const MAHARASHTRA_DISTRICTS = [
  'सर्व', 'पुणे', 'मुंबई', 'ठाणे', 'नाशिक', 'छत्रपती संभाजीनगर', 'कोल्हापूर', 'सातारा', 'सांगली',
  'सोलापूर', 'नागपूर', 'अमरावती', 'नांदेड', 'जळगाव', 'अहमदनगर', 'लातूर', 'रत्नागिरी', 'सिंधुदुर्ग'
];

export default function CommunityServicesExchangePage() {
  const { user } = useAuth();

  const [listingType, setListingType] = useState('available'); // 'available' (सेवा देऊ शकतो) | 'needed' (सेवा हवी आहे)
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [selectedPriceMode, setSelectedPriceMode] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const [form, setForm] = useState({
    name: user?.name || '',
    category: 'home_repairs',
    listingType: 'available',
    priceMode: 'fixed',
    serviceMode: 'in_person',
    location: '',
    city: 'पुणे',
    district: 'पुणे',
    phone: user?.phone || '',
    experience: '५+ वर्षे अनुभव',
    description: '',
    hourlyRate: 'वाजवी दर / मोफत',
    availabilityHours: 'सकाळी ९ ते संध्याकाळी ७'
  });

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    requesterName: user?.name || '',
    requesterPhone: user?.phone || '',
    message: 'मला आपल्या सेवेबद्दल विचारणा करायची आहे.'
  });

  useEffect(() => {
    loadServices();
  }, [listingType, selectedCategory, selectedDistrict, selectedPriceMode]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (listingType !== 'सर्व') params.listingType = listingType;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDistrict !== 'सर्व') params.city = selectedDistrict;
      if (selectedPriceMode !== 'सर्व') params.priceMode = selectedPriceMode;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.emergency.getServicesExchange(params);
      const list = res?.data?.services || res?.services || [];
      setServices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading services exchange:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.name.trim()) {
      alert('कृपया सेवेचे नाव आणि वर्णन लिहा.');
      return;
    }
    setSubmitting(true);
    try {
      await api.emergency.postServiceListing(form);
      alert('🛠️ सेवा नोंदणी यशस्वीरीत्या प्रसिद्ध झाली!');
      setShowCreateModal(false);
      loadServices();
    } catch (err) {
      alert(err.message || 'नोंदणी करताना त्रुटी.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.requesterPhone.trim()) {
      alert('कृपया आपला संपर्क नंबर प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      await api.emergency.sendServiceInquiry(showInquiryModal.id, inquiryForm);
      alert('📩 आपली चौकशी सेवा प्रदात्याकडे पाठवली गेली आहे!');
      setShowInquiryModal(null);
    } catch (err) {
      alert(err.message || 'चौकशी पाठवताना त्रुटी.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)', color: '#fff', padding: '40px 20px 50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>🚩 कनेक्ट मराठा सेवा देवाणघेवाण</span>
                <span>•</span>
                <span>स्थानिक कौशल्य व सेवा नेटवर्क</span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '4px 0 8px', letterSpacing: '0.5px' }}>
                🛠️ सेवा देवाणघेवाण केंद्र (Community Services Exchange)
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.02rem', maxWidth: '750px', lineHeight: 1.5 }}>
                आपल्याला आवश्यक असणाऱ्या सेवा शोधा किंवा आपली व्यावसायिक कौशल्ये व मोफत समाज सेवा नोंदवून गरजूंना मदत करा.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setForm({ ...form, listingType: 'needed' });
                  setShowCreateModal(true);
                }}
                style={{
                  background: '#FFFFFF',
                  color: '#0F766E',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                📥 सेवा हवी आहे नोंदवा
              </button>

              <button
                onClick={() => {
                  setForm({ ...form, listingType: 'available' });
                  setShowCreateModal(true);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  border: '1.5px solid #FFFFFF',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}>
                📤 माझी सेवा यादी करा
              </button>
            </div>
          </div>

          {/* Module Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Link to="/emergency" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🚨 १. आपत्कालीन अलर्ट
            </Link>
            <Link to="/seva/help-requests" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🤝 २. मदत विनंत्या व साहाय्य
            </Link>
            <Link to="/community/services" style={{ background: '#FFFFFF', color: '#0F766E', padding: '6px 14px', borderRadius: '16px', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
              🛠️ ३. सेवा देवाणघेवाण (Exchange)
            </Link>
            <Link to="/blood" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🩸 ४. २४×७ रक्त SOS
            </Link>
          </div>

        </div>
      </div>

      {/* 2. Main Body */}
      <div style={{ maxWidth: '1200px', margin: '-24px auto 0', padding: '0 16px' }}>

        {/* Mode Selector & Filter Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
          
          {/* Two-sided Switcher */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '2px solid #F1F5F9', paddingBottom: '14px' }}>
            <button
              onClick={() => setListingType('available')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: listingType === 'available' ? '#0F766E' : '#F1F5F9',
                color: listingType === 'available' ? '#fff' : '#475569',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
              <span>📤</span>
              <span>उपलब्ध सेवा प्रदाते (Services Available)</span>
            </button>

            <button
              onClick={() => setListingType('needed')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: listingType === 'needed' ? '#0F766E' : '#F1F5F9',
                color: listingType === 'needed' ? '#fff' : '#475569',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
              <span>📥 सेवांची आवश्यकता / मागण्या (Services Needed)</span>
            </button>
          </div>

          {/* Categories Pill Scroll */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px' }}>
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? '#0F766E' : '#F8FAFC',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#334155',
                  border: selectedCategory === cat.id ? '1.5px solid #0F766E' : '1px solid #E2E8F0',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>📍 जिल्हा:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>💰 प्रकार:</span>
              <select
                value={selectedPriceMode}
                onChange={(e) => setSelectedPriceMode(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}>
                <option value="सर्व">सर्व प्रकार (All)</option>
                <option value="free">मोफत समाज साहाय्य (Free)</option>
                <option value="fixed">निश्चित दर (Fixed)</option>
                <option value="hourly">प्रति तास दर (Hourly)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '2 1 280px' }}>
              <input
                type="text"
                placeholder="कौशल्य, सेवेचे नाव किंवा परिसर शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
              />
              <button
                onClick={loadServices}
                style={{ background: '#0D9488', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                शोध 🔍
              </button>
            </div>
          </div>

        </div>

        {/* Listings Grid Header */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {listingType === 'available' ? 'उपलब्ध सेवा प्रदाते व व्यावसायिक' : 'सदस्यांनी नोंदवलेल्या सेवा मागण्या'} ({services.length})
          </h2>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
            <div>सेवा निर्देशिका लोड होत आहे...</div>
          </div>
        ) : services.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛠️</div>
            <h3 style={{ margin: '0 0 6px', color: '#1E293B' }}>निवडलेल्या विभागात सध्या कोणतीही नोंदणी नाही.</h3>
            <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto 20px' }}>
              आपण प्रथम सेवा प्रदाता किंवा सेवेची आवश्यकता नोंदवून या सुविधेची सुरुवात करू शकता.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{ background: '#0F766E', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 800, cursor: 'pointer' }}>
              + नवीन सेवा नोंदवा
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {services.map(srv => (
              <div
                key={srv.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: srv.priceMode === 'free' ? '#DCFCE7' : '#FEF3C7',
                      color: srv.priceMode === 'free' ? '#166534' : '#92400E',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {srv.priceMode === 'free' ? '🌱 मोफत समाज साहाय्य' : `💰 ${srv.hourlyRate || 'वाजवी दर'}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 700, background: '#F0FDFA', padding: '2px 8px', borderRadius: '10px' }}>
                      {srv.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                    {srv.name}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {srv.description}
                  </p>

                  <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                    <div>📍 <strong>परिसर:</strong> {srv.location || srv.city} ({srv.city})</div>
                    <div>⭐ <strong>अनुभव / पत:</strong> {srv.experience || 'प्रमाणित'} • {srv.rating || '५.० ★'}</div>
                    <div>👤 <strong>प्रदाता / संपर्क:</strong> {srv.providerName || srv.name} ({srv.phone || 'उपलब्ध'})</div>
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => setShowInquiryModal(srv)}
                    style={{
                      width: '100%',
                      background: '#0F766E',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                    <span>📩</span>
                    <span>संपर्क व चौकशी करा (Inquire)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Service Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F766E' }}>
                {form.listingType === 'needed' ? '📥 सेवेची आवश्यकता नोंदवा' : '📤 आपली सेवा यादी करा'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>नोंदणी प्रकार *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="lType"
                      checked={form.listingType === 'available'}
                      onChange={() => setForm({ ...form, listingType: 'available' })}
                    />
                    <span>मी सेवा पुरवू शकतो (Available)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="lType"
                      checked={form.listingType === 'needed'}
                      onChange={() => setForm({ ...form, listingType: 'needed' })}
                    />
                    <span>मला सेवा हवी आहे (Needed)</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>सेवेचे नाव / शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. घरगुती वायरिंग दुरुस्ती किंवा दहावी गणित शिकवणी"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>श्रेणी *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}>
                    {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.label}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>दर / मोफत साहाय्य</label>
                  <select
                    value={form.priceMode}
                    onChange={(e) => setForm({ ...form, priceMode: e.target.value, hourlyRate: e.target.value === 'free' ? 'मोफत समाज साहाय्य' : form.hourlyRate })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}>
                    <option value="fixed">वाजवी निश्चित दर (Fixed)</option>
                    <option value="free">मोफत समाज साहाय्य (Free)</option>
                    <option value="hourly">ताशी दर (Hourly)</option>
                    <option value="quote_requested">कोटेशननुसार (Quote)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>सेवेचे सविस्तर वर्णन *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="कामाचे स्वरूप, अटी किंवा कौशल्याचा तपशील लिहा..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा / शहर *</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value, district: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}>
                    {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>स्थानिक परिसर / रस्ता</label>
                  <input
                    type="text"
                    placeholder="उदा. कोथरूड, स्वारगेट"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>संपर्क क्रमांक *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>अपेक्षित दर / मोबदला</label>
                  <input
                    type="text"
                    placeholder="उदा. ₹३००/तास किंवा वाजवी दर"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: '#0F766E',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'नोंद होत आहे...' : '🛠️ सेवा प्रसिद्ध करा'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F766E' }}>
                📩 सेवा चौकशी पाठवा (Send Inquiry)
              </h3>
              <button onClick={() => setShowInquiryModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '14px' }}>
              सेवा संदर्भ: <strong>{showInquiryModal.name}</strong> ({showInquiryModal.city})
            </p>

            <form onSubmit={handleInquirySubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपले नाव *</label>
                <input
                  type="text"
                  required
                  value={inquiryForm.requesterName}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, requesterName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपला संपर्क नंबर *</label>
                <input
                  type="tel"
                  required
                  value={inquiryForm.requesterPhone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, requesterPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपला संदेश / सेवेची वेळ</label>
                <textarea
                  rows="3"
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: '#0F766E',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'पाठवत आहे...' : '📩 चौकशी पाठवा'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
