import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BusinessLeadsPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [selectedCategory, setSelectedCategory] = useState('सर्व');
  const [search, setSearch] = useState('');

  // Quote Submission Modal
  const [quotingEnquiry, setQuotingEnquiry] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    businessName: user?.business || '',
    ownerName: user?.name || '',
    phone: user?.phone || '',
    quoteAmount: '',
    proposalNotes: ''
  });
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // New Enquiry Modal
  const [showNewEnquiryModal, setShowNewEnquiryModal] = useState(false);
  const [newEnquiryForm, setNewEnquiryForm] = useState({
    title: '',
    clientName: user?.name || '',
    phone: user?.phone || '',
    category: 'इंटेरियर व बांधकाम',
    city: 'पुणे',
    district: 'पुणे',
    budget: '',
    description: ''
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  useEffect(() => {
    loadEnquiries();
  }, [selectedDistrict, selectedCategory]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.enquiries.getAll({
        district: selectedDistrict !== 'सर्व' ? selectedDistrict : undefined,
        category: selectedCategory !== 'सर्व' ? selectedCategory : undefined
      });
      if (res && res.enquiries) {
        setEnquiries(res.enquiries);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quotingEnquiry) return;
    if (!user) {
      alert('कोटेशन सादर करण्यासाठी कृपया आधी लॉगिन करा.');
      navigate(`/login?redirect=${encodeURIComponent('/leads')}`);
      return;
    }

    try {
      await api.enquiries.submitQuote(quotingEnquiry.id, quoteForm);
      setQuoteSuccess(true);
      setTimeout(() => {
        setQuoteSuccess(false);
        setQuotingEnquiry(null);
        loadEnquiries();
      }, 1800);
    } catch (err) {
      alert('कोटेशन सादर करताना त्रुटी: ' + (err.message || 'काहीतरी चूक झाली'));
    }
  };

  const handleNewEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmittingEnquiry(true);
    try {
      await api.enquiries.create(newEnquiryForm);
      alert('नवीन ग्राहक Enquiry यशस्वीरीत्या प्रसिद्ध झाली! 🚩');
      setShowNewEnquiryModal(false);
      setNewEnquiryForm({
        title: '',
        clientName: user?.name || '',
        phone: user?.phone || '',
        category: 'इंटेरियर व बांधकाम',
        city: 'पुणे',
        district: 'पुणे',
        budget: '',
        description: ''
      });
      loadEnquiries();
    } catch (err) {
      alert('Enquiry प्रसिद्ध करताना त्रुटी: ' + (err.message || 'काहीतरी चूक झाली'));
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const filteredEnquiries = enquiries.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.city && item.city.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '36px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>

        {/* 1. Header Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 12px 30px rgba(67, 20, 7, 0.15)',
          background: '#431407'
        }}>
          <img
            src="/assets/images/business-growth-banner.jpg"
            alt="Business Growth Banner"
            style={{
              width: '100%',
              height: '240px',
              objectFit: 'cover',
              opacity: 0.35,
              display: 'block'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 36px',
            color: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: '#EA580C', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 900 }}>
                ● LIVE COMMERCIAL RADAR
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                महाराष्ट्र B2B व्यवसाय दालन
              </span>
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', fontFamily: 'Baloo 2', fontWeight: 900 }}>
              🏢 ग्राहक Enquiries व B2B व्यावसायिक Leads
            </h1>
            <p style={{ margin: 0, maxWidth: '750px', fontSize: '0.98rem', color: '#FED7AA', lineHeight: 1.5 }}>
              महाराष्ट्रभरातील कॉर्पोरेट खरेदीदार, संस्था व वैयक्तिक ग्राहकांच्या थेट व्यावसायिक गरजा. आपल्या व्यवसायाची उत्पादने व सेवा सादर करून थेट ग्राहकांशी संपर्क साधा.
            </p>
          </div>
        </div>

        {/* 2. Top Bar & Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          background: '#FFFFFF',
          padding: '18px 24px',
          borderRadius: '16px',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              placeholder="शहर, उद्योग किंवा कामाचे स्वरूप शोधा..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowNewEnquiryModal(true)}
              style={{
                background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              <span>➕</span>
              <span>नवीन Enquiry नोंदवा</span>
            </button>
            <Link
              to="/business/directory"
              style={{
                background: '#FFF7ED',
                color: '#C2410C',
                border: '1.5px solid #FED7AA',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              🏢 सर्व व्यवसायांची डिरेक्टरी
            </Link>
          </div>
        </div>

        {/* 3. Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#78350F', alignSelf: 'center', marginRight: '6px' }}>
            📍 जिल्हा निवडा:
          </span>
          {['सर्व', 'पुणे', 'मुंबई', 'नाशिक', 'कोल्हापूर', 'छत्रपती संभाजीनगर', 'सातारा', 'नागपूर'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              style={{
                background: selectedDistrict === d ? '#EA580C' : '#FFFFFF',
                color: selectedDistrict === d ? '#FFFFFF' : '#475569',
                border: selectedDistrict === d ? '1px solid #EA580C' : '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* 4. Enquiries Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <p style={{ fontWeight: 800 }}>ग्राहक Enquiries लोड होत आहेत...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '50px 20px',
            textAlign: 'center',
            border: '1.5px dashed #CBD5E1'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ margin: '0 0 8px', color: '#334155', fontFamily: 'Baloo 2' }}>कोणतीही Enquiry उपलब्ध नाही</h3>
            <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '16px' }}>
              आपण निवडलेल्या फिल्टर्सनुसार सध्या कोणतीही ग्राहक विचारणा नाही.
            </p>
            <button
              onClick={() => { setSelectedDistrict('सर्व'); setSelectedCategory('सर्व'); setSearch(''); }}
              style={{ background: '#EA580C', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              सर्व Enquiries पहा
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
            {filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1.5px solid #FFEDD5',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 800
                  }}>
                    {enq.category || 'व्यावसायिक लीड'}
                  </span>
                  <span style={{
                    background: enq.status === 'पूर्ण (Closed)' ? '#F1F5F9' : '#DCFCE7',
                    color: enq.status === 'पूर्ण (Closed)' ? '#64748B' : '#15803D',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 800
                  }}>
                    ● {enq.status || 'सक्रिय (Open)'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontFamily: 'Baloo 2', color: '#1E293B', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {enq.title}
                </h3>

                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
                  {enq.description}
                </p>

                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FED7AA', marginBottom: '18px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#78350F', fontWeight: 700 }}>📍 ठिकाण:</span>
                    <strong style={{ color: '#1E293B' }}>{enq.city || enq.district}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#78350F', fontWeight: 700 }}>💰 अंदाजे बजेट:</span>
                    <strong style={{ color: '#C2410C' }}>{enq.budget || 'चर्चेनुसार'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#78350F', fontWeight: 700 }}>👤 ग्राहक / संपर्क:</span>
                    <span style={{ color: '#475569' }}>{enq.clientName || 'सत्यापित सभासद'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    कोटेशन्स: <strong>{enq.quotesCount || (enq.quotes ? enq.quotes.length : 0)}</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (!user) {
                        sessionStorage.setItem('cm_login_redirect', '/leads');
                        navigate(`/login?redirect=${encodeURIComponent('/leads')}`);
                        return;
                      }
                      setQuotingEnquiry(enq);
                      setQuoteForm({
                        businessName: user?.business || '',
                        ownerName: user?.name || '',
                        phone: user?.phone || '',
                        quoteAmount: '',
                        proposalNotes: ''
                      });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.2)'
                    }}
                  >
                    कोटेशन / प्रतिसाद द्या ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL: Submit Quotation
      ========================================================================= */}
      {quotingEnquiry && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setQuotingEnquiry(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {quoteSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontSize: '1.4rem', color: '#15803D', margin: '0 0 8px' }}>
                  कोटेशन यशस्वीरीत्या सादर झाले!
                </h3>
                <p style={{ color: '#475569', fontSize: '0.92rem' }}>
                  ग्राहकाला आपल्या प्रस्तावाची माहिती पाठवण्यात आली आहे. ते लवकरच आपल्याशी संपर्क साधतील.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C', marginBottom: '4px' }}>
                  COMMERCIAL PROPOSAL
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontFamily: 'Baloo 2', color: '#431407' }}>
                  कोटेशन सादर करा
                </h3>
                <div style={{ fontSize: '0.86rem', color: '#64748B', marginBottom: '16px' }}>
                  {quotingEnquiry.title} ({quotingEnquiry.city})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      आपल्या व्यवसायाचे / फर्मचे नाव *
                    </label>
                    <input
                      type="text"
                      required
                      value={quoteForm.businessName}
                      onChange={(e) => setQuoteForm({ ...quoteForm, businessName: e.target.value })}
                      placeholder="उदा. सह्याद्री इंटेरियर्स प्रायव्हेट लिमिटेड"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        संपर्क व्यक्ती *
                      </label>
                      <input
                        type="text"
                        required
                        value={quoteForm.ownerName}
                        onChange={(e) => setQuoteForm({ ...quoteForm, ownerName: e.target.value })}
                        placeholder="नाव"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        मोबाईल नंबर *
                      </label>
                      <input
                        type="tel"
                        required
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                        placeholder="१० अंकी मोबाईल"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      आपले अंदाजे कोटेशन / रक्कम (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      value={quoteForm.quoteAmount}
                      onChange={(e) => setQuoteForm({ ...quoteForm, quoteAmount: e.target.value })}
                      placeholder="उदा. ₹४,५०,००० (किंवा दर प्रति चौरस फूट)"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      कामाचा प्रस्ताव व अनुभव तपशील
                    </label>
                    <textarea
                      rows="3"
                      value={quoteForm.proposalNotes}
                      onChange={(e) => setQuoteForm({ ...quoteForm, proposalNotes: e.target.value })}
                      placeholder="आपण हे काम कसे व किती वेळेत पूर्ण करू शकता..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  🚀 कोटेशन सादर करा
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Post New Requirement
      ========================================================================= */}
      {showNewEnquiryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowNewEnquiryModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <form onSubmit={handleNewEnquirySubmit}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C', marginBottom: '4px' }}>
                POST BUSINESS LEAD
              </div>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.35rem', fontFamily: 'Baloo 2', color: '#431407' }}>
                नवीन व्यावसायिक Enquiry नोंदवा
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    गरजेचे शीर्षक (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEnquiryForm.title}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, title: e.target.value })}
                    placeholder="उदा. ५० टन स्टील मटेरियल सप्लाय (नाशिक)"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      क्षेत्र / उद्योग श्रेणी *
                    </label>
                    <select
                      value={newEnquiryForm.category}
                      onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    >
                      <option value="इंटेरियर व बांधकाम">इंटेरियर व बांधकाम</option>
                      <option value="वित्त व कर सल्लागार">वित्त व कर सल्लागार</option>
                      <option value="औद्योगिक उत्पादन व सप्लाय">औद्योगिक उत्पादन व सप्लाय</option>
                      <option value="आयटी व सॉफ्टवेअर">आयटी व सॉफ्टवेअर</option>
                      <option value="कृषी प्रक्रिया व पॅकेजिंग">कृषी प्रक्रिया व पॅकेजिंग</option>
                      <option value="इतर व्यावसायिक सेवा">इतर व्यावसायिक सेवा</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      जिल्हा / शहर *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEnquiryForm.city}
                      onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, city: e.target.value, district: e.target.value })}
                      placeholder="उदा. पुणे"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      आपले नाव *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEnquiryForm.clientName}
                      onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, clientName: e.target.value })}
                      placeholder="नाव"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      मोबाईल नंबर *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newEnquiryForm.phone}
                      onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, phone: e.target.value })}
                      placeholder="१० अंकी मोबाईल"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    अंदाजे बजेट / बजेट मर्यादा
                  </label>
                  <input
                    type="text"
                    value={newEnquiryForm.budget}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, budget: e.target.value })}
                    placeholder="उदा. ₹५,००,००० - ₹१०,००,०००"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    गरजेचा संपूर्ण तपशील (Specification) *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={newEnquiryForm.description}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, description: e.target.value })}
                    placeholder="कामाचे स्वरूप, मुदत व आवश्यक अटी तपशीलवार लिहा..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingEnquiry}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: submittingEnquiry ? 'wait' : 'pointer'
                }}
              >
                {submittingEnquiry ? 'नोंदणी करत आहे...' : '📢 Enquiry प्रसिद्ध करा'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
