import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MAHARASHTRA_DISTRICTS = [
  'सर्व', 'पुणे', 'मुंबई', 'मुंबई उपनगर', 'ठाणे', 'नाशिक', 'सातारा', 'कोल्हापूर',
  'छत्रपती संभाजीनगर', 'नागपूर', 'सोलापूर', 'अहमदनगर', 'सांगली', 'जळगाव',
  'अमरावती', 'नांदेड', 'लातूर', 'धुळे', 'रत्नागिरी', 'सिंधुदुर्ग', 'रायगड'
];

const CATEGORIES = [
  { id: 'all', label: 'सर्व व्यवसाय', icon: '🏢' },
  { id: 'it', label: 'IT व सॉफ्टवेअर', icon: '💻' },
  { id: 'restaurant', label: 'भोजनालय / रेस्टॉरंट', icon: '🍛' },
  { id: 'realestate', label: 'रिअल इस्टेट व बांधकाम', icon: '🏗️' },
  { id: 'manufacturing', label: 'उत्पादन व उद्योग', icon: '⚙️' },
  { id: 'travel', label: 'प्रवास, पर्यटन व ट्रेक', icon: '🚌' },
  { id: 'services', label: 'व्यावसायिक सेवा', icon: '🤝' }
];

export default function BusinessDirectoryPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // New business form state
  const [formData, setFormData] = useState({
    name: '',
    owner: user?.name || '',
    cat: 'it',
    city: 'पुणे',
    district: 'पुणे',
    phone: '',
    whatsapp: '',
    website: '',
    hours: 'सकाळी ९ ते संध्याकाळी ७',
    servicesText: '',
    offers: ''
  });

  useEffect(() => {
    loadBusinesses();
  }, [selectedCat, selectedDistrict]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const res = await api.businesses.getAll({
        cat: selectedCat !== 'all' ? selectedCat : undefined,
        district: selectedDistrict !== 'सर्व' ? selectedDistrict : undefined,
        search: searchQuery || undefined
      });
      if (res && res.businesses) {
        setBusinesses(res.businesses);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBusinesses();
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      const services = formData.servicesText.split(',').map(s => s.trim()).filter(Boolean);
      const payload = { ...formData, services };
      const res = await api.businesses.create(payload);
      if (res && res.business) {
        alert('व्यवसाय यशस्वीरित्या जोडला गेला! 🚩');
        setBusinesses([res.business, ...businesses]);
        setShowAddModal(false);
        setFormData({
          name: '',
          owner: user?.name || '',
          cat: 'it',
          city: 'पुणे',
          district: 'पुणे',
          phone: '',
          whatsapp: '',
          website: '',
          hours: 'सकाळी ९ ते संध्याकाळी ७',
          servicesText: '',
          offers: ''
        });
      }
    } catch (err) {
      alert('व्यवसाय जोडताना त्रुटी: ' + err.message);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!showReviewModal) return;

    try {
      await api.businesses.addReview(showReviewModal.id, {
        member_name: user?.name || 'मराठा बांधव',
        rating: reviewRating,
        text: reviewText
      });
      alert('आपला अभिप्राय यशस्वीरित्या नोंदवला गेला!');
      setShowReviewModal(null);
      setReviewText('');
      loadBusinesses();
    } catch (err) {
      alert('अभिप्राय नोंदवताना त्रुटी: ' + err.message);
    }
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              🏛️ मराठा उद्योग व व्यापारी निर्देशिका
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              मराठा बिझनेस डिरेक्टरी (Business Directory)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              महाराष्ट्रासह जगभरातील मराठा उद्योजकांची सत्यापित निर्देशिका. एकमेकांना व्यवसाय द्या आणि मराठा अर्थव्यवस्था सक्षम करा.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ background: '#fff', color: '#C73800', border: 'none', padding: '12px 24px', fontWeight: 800, borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            + आपला व्यवसाय जोडा
          </button>
        </div>

        {/* Filter Controls: Search & Dropdowns */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 2, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="व्यवसायाचे नाव, सेवा किंवा कीवर्ड शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  background: '#fff'
                }}>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>📍 जिल्हा: {d}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: '#C73800',
                border: 'none',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
              शोधा 🔍
            </button>
          </form>

          {/* Industry Category Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px', paddingBottom: '4px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: selectedCat === cat.id ? '2px solid #C73800' : '1px solid #E5E7EB',
                  background: selectedCat === cat.id ? '#FFF3E0' : '#F9FAFB',
                  color: selectedCat === cat.id ? '#C73800' : '#4B5563',
                  fontWeight: selectedCat === cat.id ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Business Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            व्यवसाय माहिती लोड होत आहे... ⏳
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '60px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏬</div>
            <h2>कोणताही व्यवसाय आढळला नाही</h2>
            <p>कृपया वेगळा जिल्हा किंवा वर्गवारी निवडून पहा किंवा आपला व्यवसाय सर्वप्रथम जोडा!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
            {businesses.map(b => (
              <div
                key={b.id}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '2.4rem', background: '#FFF8F2', padding: '10px', borderRadius: '12px' }}>
                        {b.photo || '🏢'}
                      </span>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: '#1F2937', fontWeight: 700 }}>
                          {b.name}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          मालक: <strong>{b.owner}</strong> | 📍 {b.city} ({b.district})
                        </div>
                      </div>
                    </div>
                    <div style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 8px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                      ⭐ {b.rating ? Number(b.rating).toFixed(1) : '4.8'}
                    </div>
                  </div>

                  {/* Special Offer Badge */}
                  {b.offers && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '14px' }}>
                      🎁 सवलत: {b.offers}
                    </div>
                  )}

                  {/* Services Tags */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '6px', fontWeight: 600 }}>उपलब्ध सेवा:</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {b.services && b.services.map((s, idx) => (
                        <span key={idx} style={{ background: '#F3F4F6', color: '#374151', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Working hours */}
                  {b.hours && (
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '14px' }}>
                      ⏰ वेळ: {b.hours}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {b.whatsapp && (
                    <a
                      href={`https://wa.me/91${b.whatsapp.replace(/\D/g, '')}?text=जय शिवराय, मी कनेक्ट मराठा बिझनेस डिरेक्टरीवरून संपर्क करत आहे.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ flex: 1, background: '#25D366', color: '#fff', padding: '8px 12px', borderRadius: '6px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                      💬 WhatsApp
                    </a>
                  )}

                  {b.phone && (
                    <a
                      href={`tel:${b.phone}`}
                      className="btn"
                      style={{ flex: 1, background: '#C73800', color: '#fff', padding: '8px 12px', borderRadius: '6px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                      📞 कॉल करा
                    </a>
                  )}

                  <button
                    onClick={() => setShowReviewModal(b)}
                    style={{ background: '#F3F4F6', border: 'none', padding: '8px 12px', borderRadius: '6px', color: '#4B5563', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    title="अभिप्राय नोंदवा">
                    ⭐ अभिप्राय
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Register Business */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0, color: '#C73800', fontFamily: 'Baloo 2' }}>
                  🚩 आपला व्यवसाय नोंदवा
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateBusiness}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>व्यवसायाचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="उदा. राजगड इंजिनिअरिंग, सह्याद्री टूर्स"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>मालक / प्रतिनिधी नाव *</label>
                    <input
                      type="text"
                      required
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>वर्गवारी (Category)</label>
                    <select
                      value={formData.cat}
                      onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                      <option value="it">IT व सॉफ्टवेअर</option>
                      <option value="restaurant">भोजनालय / कॅटरिंग</option>
                      <option value="manufacturing">उत्पादन (Manufacturing)</option>
                      <option value="realestate">बांधकाम / रिअल इस्टेट</option>
                      <option value="travel">प्रवास व पर्यटन</option>
                      <option value="services">व्यावसायिक सेवा</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>शहर *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>जिल्हा *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                      {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>फोन नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876500000"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>व्हॉट्सअ‍ॅप नंबर</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="9876500000"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>उपलब्ध सेवा (कॉमा वापरून लिहा)</label>
                  <input
                    type="text"
                    value={formData.servicesText}
                    onChange={(e) => setFormData({ ...formData, servicesText: e.target.value })}
                    placeholder="उदा. वेब डिझाईन, SEO, मोबाइल अ‍ॅप, कन्सल्टिंग"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>मराठा समाज सदस्यांसाठी विशेष सवलत/ऑफर</label>
                  <input
                    type="text"
                    value={formData.offers}
                    onChange={(e) => setFormData({ ...formData, offers: e.target.value })}
                    placeholder="उदा. समाज बांधवांना १०% सवलत किंवा मोफत सल्ला"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ background: '#F3F4F6', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    नोंदणी करा 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Review */}
        {showReviewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px' }}>
              <h3 style={{ margin: '0 0 12px', color: '#C73800' }}>⭐ {showReviewModal.name} बद्दल अभिप्राय</h3>
              <form onSubmit={handleAddReview}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>रेटिंग (Stars):</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                    <option value="5">⭐⭐⭐⭐⭐ (५/५ उत्कृष्ट)</option>
                    <option value="4">⭐⭐⭐⭐ (४/५ खूप चांगले)</option>
                    <option value="3">⭐⭐⭐ (३/५ चांगले)</option>
                    <option value="2">⭐⭐ (२/५ सुधारणा हवी)</option>
                    <option value="1">⭐ (१/५ असमाधानकारक)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>आपला अनुभव लिहा:</label>
                  <textarea
                    rows="3"
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="उत्कृष्ट काम, वेळेत सेवा आणि दर्जेदार गुणवत्ता..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowReviewModal(null)} style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>रद्द</button>
                  <button type="submit" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700 }}>नोंदवा</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
