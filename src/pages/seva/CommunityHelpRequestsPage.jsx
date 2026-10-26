import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HELP_CATEGORIES = [
  { id: 'all', label: 'सर्व गरजा', icon: '🤝' },
  { id: 'food_essentials', label: 'अन्नधान्य व जीवनावश्यक', icon: '🍞' },
  { id: 'education_careers', label: 'शिक्षण व शिष्यवृत्ती', icon: '🎓' },
  { id: 'accommodation_relocation', label: 'निवारा व स्थलांतर', icon: '🏠' },
  { id: 'practical_help', label: 'स्वयंसेवक व प्रत्यक्ष मदत', icon: '💪' },
  { id: 'medical_aid', label: 'औषधोपचार व साहाय्य', icon: '🩺' },
];

const MAHARASHTRA_DISTRICTS = [
  'सर्व', 'पुणे', 'मुंबई', 'ठाणे', 'नाशिक', 'छत्रपती संभाजीनगर', 'कोल्हापूर', 'सातारा', 'सांगली',
  'सोलापूर', 'नागपूर', 'अमरावती', 'नांदेड', 'जळगाव', 'अहमदनगर', 'लातूर', 'रत्नागिरी', 'सिंधुदुर्ग'
];

export default function CommunityHelpRequestsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'create'
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showOfferModal, setShowOfferModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Multi-need Request Form
  const [form, setForm] = useState({
    title: '',
    category: 'food_essentials',
    description: '',
    items: [{ need: '', qty: '' }],
    location: '',
    city: 'पुणे',
    district: 'पुणे',
    requesterName: user?.name || '',
    requesterPhone: user?.phone || '',
    urgency: 'moderate'
  });

  // Offer Form
  const [offerForm, setOfferForm] = useState({
    helperName: user?.name || '',
    helperPhone: user?.phone || '',
    offeredItems: '',
    note: 'मी या गरजेसाठी मनापासून मदत करण्यास तयार आहे.'
  });

  useEffect(() => {
    loadHelpRequests();
  }, [selectedCategory, selectedDistrict]);

  const loadHelpRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDistrict !== 'सर्व') params.district = selectedDistrict;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.emergency.getHelpRequests(params);
      const list = res?.data?.helpRequests || res?.helpRequests || [];
      setHelpRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading help requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { need: '', qty: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated.length ? updated : [{ need: '', qty: '' }] });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      alert('कृपया गरजेची सविस्तर माहिती लिहा.');
      return;
    }
    const filteredItems = form.items.filter(item => item.need.trim().length > 0);
    setSubmitting(true);
    try {
      await api.emergency.createHelpRequest({
        ...form,
        itemsNeeded: filteredItems
      });
      alert('🤝 आपली मदत विनंती यशस्वीरीत्या नोंदवली गेली! समन्वयकांकडून संपर्क साधला जाईल.');
      setActiveTab('browse');
      setForm({
        title: '',
        category: 'food_essentials',
        description: '',
        items: [{ need: '', qty: '' }],
        location: '',
        city: 'पुणे',
        district: 'पुणे',
        requesterName: user?.name || '',
        requesterPhone: user?.phone || '',
        urgency: 'moderate'
      });
      loadHelpRequests();
    } catch (err) {
      alert(err.message || 'विनंती नोंदवताना त्रुटी.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerForm.helperPhone.trim()) {
      alert('कृपया आपला संपर्क नंबर प्रविष्ट करा.');
      return;
    }
    setSubmitting(true);
    try {
      await api.emergency.offerHelp(showOfferModal.id, offerForm);
      alert('❤️ मदतीचा हात पुढे केल्याबद्दल धन्यवाद! समन्वयकांमार्फत संबंधित कुटुंबाशी आपला संपर्क घडवून आणला जाईल.');
      setShowOfferModal(null);
      loadHelpRequests();
    } catch (err) {
      alert(err.message || 'मदत नोंदवताना त्रुटी.');
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'urgent') {
      return <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>⚡ तातडीचे (Urgent)</span>;
    }
    if (urgency === 'moderate') {
      return <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>⏳ मध्यम (Moderate)</span>;
    }
    return <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>🌱 लवचिक (Flexible)</span>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'assistance_offered':
        return <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>🤝 साहाय्य देऊ केले</span>;
      case 'in_progress':
        return <span style={{ background: '#FEF9C3', color: '#854D0E', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>🏃 प्रक्रियेत आहे</span>;
      case 'fulfilled':
        return <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>✅ मदत पूर्ण झाली</span>;
      default:
        return <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>📢 प्रकाशित</span>;
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)', color: '#fff', padding: '40px 20px 50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>🚩 कनेक्ट मराठा समाज साहाय्य</span>
                <span>•</span>
                <span>मदतीची गरज · मदतीचा हात</span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '4px 0 8px', letterSpacing: '0.5px' }}>
                🤝 समाज मदत व साहाय्य नेटवर्क (Community Help)
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.02rem', maxWidth: '750px', lineHeight: 1.5 }}>
                अन्नधान्य, शिक्षण, निवारा किंवा प्रत्यक्ष मदतीची गरज असणाऱ्या समाज बांधवांना आणि मदतीचा हात पुढे करणाऱ्या दात्यांना एकत्र जोडणारे व्यासपीठ.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  background: activeTab === 'create' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  color: activeTab === 'create' ? '#1E3A8A' : '#FFFFFF',
                  border: '1.5px solid #FFFFFF',
                  padding: '12px 22px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}>
                ✍️ मदतीची गरज आहे (I Need Help)
              </button>

              <button
                onClick={() => setActiveTab('browse')}
                style={{
                  background: activeTab === 'browse' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  color: activeTab === 'browse' ? '#1E3A8A' : '#FFFFFF',
                  border: '1.5px solid #FFFFFF',
                  padding: '12px 22px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}>
                ❤️ मदतीचा हात (I Can Help)
              </button>
            </div>
          </div>

          {/* Module Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Link to="/emergency" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🚨 १. आपत्कालीन अलर्ट
            </Link>
            <Link to="/seva/help-requests" style={{ background: '#FFFFFF', color: '#1E3A8A', padding: '6px 14px', borderRadius: '16px', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none' }}>
              🤝 २. मदत विनंत्या व साहाय्य
            </Link>
            <Link to="/community/services" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🛠️ ३. सेवा देवाणघेवाण (Exchange)
            </Link>
            <Link to="/blood" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🩸 ४. २४×७ रक्त SOS
            </Link>
          </div>

        </div>
      </div>

      {/* 2. Main Content */}
      <div style={{ maxWidth: '1200px', margin: '-24px auto 0', padding: '0 16px' }}>

        {activeTab === 'create' ? (
          /* Create Request View */
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E3A8A', margin: '0 0 6px' }}>
                ✍️ मदत विनंती नोंदवा (Submit Help Request)
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                आपल्याला किंवा आपल्या भागातील गरजू कुटुंबाला आवश्यक असणाऱ्या मदतीची तपशीलवार नोंद करा. एकाच अर्जात एकापेक्षा जास्त गरजा नोंदवू शकता.
              </p>
            </div>

            {/* Financial Help Advisory Notice */}
            <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', color: '#1E40AF', marginBottom: '20px', lineHeight: 1.5 }}>
              🛡️ <strong>आर्थिक साहाय्य नियमावली:</strong> फसवणूक टाळण्यासाठी थेट वैयक्तिक बँक खाती सार्वजनिकपणे प्रसिद्ध केली जात नाहीत. आर्थिक मदतीची विनंती आल्यास स्थानिक मराठा मंडळ/अधिकृत समन्वयकांमार्फत खात्री करूनच निधीचा समन्वय साधला जातो.
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>गरजेचे मुख्य शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. पूरबाधित कुटुंबांसाठी धान्य किट साहाय्य, किंवा शिक्षणासाठी पुस्तके"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>श्रेणी (Category) *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                    <option value="food_essentials">🍞 अन्नधान्य व किराणा (Food & Essentials)</option>
                    <option value="education_careers">🎓 शिक्षण, फी व पुस्तके (Education & Careers)</option>
                    <option value="accommodation_relocation">🏠 निवारा व तात्पुरते स्थलांतर (Accommodation)</option>
                    <option value="practical_help">💪 स्वयंसेवक व प्रत्यक्ष मदत (Volunteers)</option>
                    <option value="medical_aid">🩺 औषधोपचार साहाय्य (Medical Aid)</option>
                    <option value="other">🤝 इतर सामाजिक साहाय्य (Other Help)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>तातडीची पातळी (Urgency)</label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                    <option value="urgent">तातडीचे (Urgent - पुढील २४-४८ तासात)</option>
                    <option value="moderate">मध्यम (Moderate - आठवड्याभरात)</option>
                    <option value="flexible">लवचिक (Flexible - यथावकाश)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>गरजेचे सविस्तर वर्णन *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="परिस्थिती काय आहे? कुणाला मदत हवी आहे? सविस्तर लिहा..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                />
              </div>

              {/* Multi-item Requirements Builder */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
                    📦 नेमक्या वस्तू / मदतीच्या गरजांची यादी (Multi-Item Needs):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{ background: '#1E3A8A', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    + नवीन बाब जोडा
                  </button>
                </div>

                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder={`उदा. किराणा किट, १० वी पुस्तके (${idx + 1})`}
                      value={item.need}
                      onChange={(e) => handleItemChange(idx, 'need', e.target.value)}
                      style={{ flex: 2, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                    <input
                      type="text"
                      placeholder="प्रमाण / संख्या (उदा. ५ किट)"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: '#EF4444', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा *</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                    {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>तालुका / शहर *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. कराड, हवेली, वैजापूर"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>आपले नाव *</label>
                  <input
                    type="text"
                    required
                    value={form.requesterName}
                    onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={form.requesterPhone}
                    onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: '#1E3A8A',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}>
                  {submitting ? 'नोंद होत आहे...' : '🤝 मदत विनंती प्रकाशित करा'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '14px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                  रद्द करा
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Browse Requests View */
          <div>
            {/* Filter Card */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                {HELP_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      background: selectedCategory === cat.id ? '#1E3A8A' : '#F8FAFC',
                      color: selectedCategory === cat.id ? '#FFFFFF' : '#334155',
                      border: selectedCategory === cat.id ? '1.5px solid #1E3A8A' : '1px solid #E2E8F0',
                      padding: '8px 16px',
                      borderRadius: '24px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
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

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>📍 जिल्हा:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                    {MAHARASHTRA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '2 1 320px' }}>
                  <input
                    type="text"
                    placeholder="शोध (उदा. पुस्तके, रेशन, कराड)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={loadHelpRequests}
                    style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    शोध 🔍
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Requests */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                मदतीची गरज असणाऱ्या समाज बंधू-भगिनींची यादी ({helpRequests.length})
              </h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                <div>मदत विनंत्या लोड होत आहेत...</div>
              </div>
            ) : helpRequests.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤝</div>
                <h3 style={{ margin: '0 0 6px', color: '#1E293B' }}>निवडलेल्या विभागात सध्या कोणतीही प्रलंबित विनंती नाही.</h3>
                <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto 20px' }}>
                  आपण स्वतः गरजू कुटुंबासाठी मदत विनंती नोंदवू शकता किंवा इतरांना मदतीचा हात देऊ शकता.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  style={{ background: '#1E3A8A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 800, cursor: 'pointer' }}>
                  ✍️ नवीन मदत विनंती नोंदवा
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {helpRequests.map(reqItem => (
                  <div
                    key={reqItem.id}
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
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {getUrgencyBadge(reqItem.urgency)}
                          {getStatusBadge(reqItem.status)}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                          {new Date(reqItem.created_at || Date.now()).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.4 }}>
                        {reqItem.title}
                      </h3>

                      <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 14px', lineHeight: 1.6 }}>
                        {reqItem.description}
                      </p>

                      {/* Multi-item items list */}
                      {Array.isArray(reqItem.itemsNeededParsed) && reqItem.itemsNeededParsed.length > 0 && (
                        <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #EDF2F7' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                            📦 आवश्यक बाबी (Items Needed):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {reqItem.itemsNeededParsed.map((it, i) => (
                              <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
                                • {it.need} {it.qty ? `(${it.qty})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                        <div>📍 <strong>स्थान:</strong> {reqItem.location}, {reqItem.city} ({reqItem.district})</div>
                        <div>👤 <strong>विनंतीकर्ता:</strong> {reqItem.requester_name} ({reqItem.requester_phone || 'गोपनीय'})</div>
                      </div>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        onClick={() => setShowOfferModal(reqItem)}
                        style={{
                          width: '100%',
                          background: '#1E3A8A',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}>
                        <span>❤️</span>
                        <span>मदतीचा हात देऊ करा (Offer Help)</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Offer Help Modal */}
      {showOfferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1E3A8A' }}>
                ❤️ मदतीचा हात देऊ करा (Offer Assistance)
              </h3>
              <button onClick={() => setShowOfferModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '14px' }}>
              मदत संदर्भ: <strong>{showOfferModal.title}</strong> ({showOfferModal.city})
            </p>

            <form onSubmit={handleOfferSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपले पूर्ण नाव *</label>
                <input
                  type="text"
                  required
                  value={offerForm.helperName}
                  onChange={(e) => setOfferForm({ ...offerForm, helperName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपला संपर्क नंबर *</label>
                <input
                  type="tel"
                  required
                  placeholder="१० अंकी नंबर"
                  value={offerForm.helperPhone}
                  onChange={(e) => setOfferForm({ ...offerForm, helperPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>आपण कोणत्या बाबी देऊ शकता? (वस्तू/साहाय्य)</label>
                <input
                  type="text"
                  placeholder="उदा. ५ रेशन किट, किंवा शैक्षणिक पुस्तके"
                  value={offerForm.offeredItems}
                  onChange={(e) => setOfferForm({ ...offerForm, offeredItems: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>संदेश / समन्वय सूचना</label>
                <textarea
                  rows="2"
                  value={offerForm.note}
                  onChange={(e) => setOfferForm({ ...offerForm, note: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: '#1E3A8A',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'नोंद होत आहे...' : '🤝 मदत निश्चित करा'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
