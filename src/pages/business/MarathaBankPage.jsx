import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import apiClient from '../../services/apiClient';

export default function MarathaBankPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' | 'loans' | 'societies' | 'institute'

  // Modals
  const [accountModal, setAccountModal] = useState(false);
  const [loanModal, setLoanModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [courseModal, setCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Data
  const [schemes, setSchemes] = useState([]);
  const [creditSocieties, setCreditSocieties] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Loan Application Form
  const [loanForm, setLoanForm] = useState({
    schemeName: 'अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज योजना',
    loanAmount: '५०००००',
    purpose: 'नवीन मशिनरी खरेदी व व्यवसाय विस्तार',
    businessName: '',
    annualIncome: '₹५ लाख',
    contact: user?.phone || '',
    city: 'पुणे',
    district: 'पुणे'
  });

  // Account Form
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    aadharOrPan: '',
    accountType: 'बचत खाते (Savings Account - ३.५०%)',
    city: 'पुणे'
  });

  // Course Form
  const [courseForm, setCourseForm] = useState({
    studentName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    courseTitle: 'शेअर बाजार ट्रेडिंग कोर्स',
    qualification: 'पदवीधर'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Banking Data
  const fetchBankData = async () => {
    try {
      setLoading(true);
      const res = api.directories ? await api.directories.getBankLoans() : await apiClient.fetchJson('/bank/loans');
      if (res && res.data) {
        setSchemes(res.data.schemes || []);
        setCreditSocieties(res.data.creditSocieties || []);
        setMyApplications(res.data.myApplications || []);
      }
    } catch (err) {
      console.warn('Could not fetch bank data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, [user]);

  // Handle Loan Apply
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('कृपया कर्ज अर्जासाठी प्रथम लॉग-इन करा.');
      return;
    }
    try {
      const payload = {
        schemeName: loanForm.schemeName,
        loanAmount: Number(loanForm.loanAmount.replace(/[^0-9]/g, '')) || 500000,
        purpose: loanForm.purpose,
        businessName: loanForm.businessName || 'स्वयंरोजगार प्रकल्प',
        annualIncome: loanForm.annualIncome,
        contact: loanForm.contact || user.phone,
        city: loanForm.city,
        district: loanForm.district
      };

      if (api.directories) {
        await api.directories.applyBankLoan(payload);
      } else {
        await apiClient.fetchJson('/bank/loans', { method: 'POST', body: JSON.stringify(payload) });
      }

      setLoanModal(false);
      showToast('✓ कर्ज अर्ज यशस्वीरीत्या सादर केला गेला! कागदपत्र पडताळणी सुरू झाली आहे.');
      await fetchBankData();
      setActiveTab('loans');
    } catch (err) {
      alert(err.message || 'कर्ज अर्ज सादर करताना त्रुटी आली.');
    }
  };

  // Handle Account Opening
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      if (api.directories) {
        await api.directories.applyBankAccount(accountForm);
      } else {
        await apiClient.fetchJson('/bank/accounts/apply', { method: 'POST', body: JSON.stringify(accountForm) });
      }
      setAccountModal(false);
      showToast('✓ बँक खाते उघडण्याचा अर्ज प्राप्त! आमचे प्रतिनिधी KYC भेटीसाठी संपर्क करतील.');
    } catch (err) {
      alert(err.message || 'खाते अर्ज नोंदवताना त्रुटी आली.');
    }
  };

  // Handle Course Enrollment
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (api.directories) {
        await api.directories.enrollInstituteCourse(courseForm);
      } else {
        await apiClient.fetchJson('/bank/institute/enroll', { method: 'POST', body: JSON.stringify(courseForm) });
      }
      setCourseModal(false);
      showToast('✓ फायनान्स कोर्स प्रवेश निश्चित झाला! २५% मराठा शिष्यवृत्ती लागू झाली.');
    } catch (err) {
      alert(err.message || 'प्रवेश नोंदणी करताना त्रुटी आली.');
    }
  };

  // Interest Rates Table
  const interestRates = [
    { type: 'बचत खाते (Savings Account)', rate: '३.५०%' },
    { type: '१ वर्ष मुदत ठेव (1 Year FD)', rate: '६.७५%' },
    { type: '२ वर्ष मुदत ठेव (2 Year FD)', rate: '७.२५%' },
    { type: '३ वर्ष मुदत ठेव (3 Year FD)', rate: '७.७५%' },
    { type: '५ वर्ष मुदत ठेव (5 Year FD)', rate: '८.२५%' }
  ];

  // Banking Loans
  const loans = [
    { title: 'अण्णासाहेब पाटील बिनव्याजी कर्ज', desc: '१२% व्याज परतावा, स्वयंरोजगारासाठी ₹१५ लाखांपर्यंत', icon: '🏛️', rate: '०% प्रभावी व्याज', category: 'स्वयंरोजगार' },
    { title: 'व्यवसाय व उद्योग कर्ज', desc: 'व्यवसाय वाढ, मशिनरी व खेळत्या भांडवलासाठी', icon: '💼', rate: '९.२५% पासून', category: 'व्यवसाय' },
    { title: 'कृषी व ॲग्रो प्रोसेसिंग कर्ज', desc: 'कोल्ड स्टोरेज, पॅकिंग व कृषी उद्योगासाठी विशेष योजना', icon: '🌾', rate: '४.००% सवलत', category: 'कृषी' },
    { title: 'गृह समृद्धी कर्ज', desc: 'स्वप्नातील घरासाठी किमान प्रक्रिया शुल्क व दीर्घ मुदत', icon: '🏡', rate: '८.४०% पासून', category: 'गृह कर्ज' },
    { title: 'वाहन व व्यावसायिक ट्रान्सपोर्ट कर्ज', desc: 'कमर्शियल वाहने, ट्रक्स व फ्लीट फायनान्स', icon: '🚗', rate: '८.७५% पासून', category: 'वाहन' },
    { title: 'उच्च शिक्षण कर्ज', desc: 'देश-विदेशातील शिक्षणासाठी विनातारण पत', icon: '🎓', rate: '७.५०% पासून', category: 'शिक्षण' }
  ];

  // Financial Institute Courses
  const courses = [
    { id: 1, title: 'शेअर बाजार ट्रेडिंग & F&O कोर्स', level: 'मूलभूत ते प्रगत स्तर (Basic to Pro)', duration: '२ महिने', icon: '📈', highlights: 'टेक्निकल ॲनालिसिस, फ्युचर्स & ऑप्शन्स, लाईव्ह मार्केट प्रॅक्टिस' },
    { id: 2, title: 'म्युच्युअल फंड & वेल्थ मॅनेजमेंट', level: 'SIP, SWP आणि पोर्टफोलिओ व्यवस्थापन', duration: '१ महिना', icon: '📊', highlights: 'फंड सिलेक्शन, रिस्क मॅनेजमेंट, निवृत्ती नियोजन' },
    { id: 3, title: 'बँकिंग, क्रेडिट & फायनान्स ऑपरेशन्स', level: 'क्रेडिट, फायनान्स व्यवहार आणि लोन प्रोसेसिंग', duration: '२ महिने', icon: '🏛️', highlights: 'बँक ऑपरेशन्स, लोन प्रोसेसिंग, १००% प्लेसमेंट सहाय्य' },
    { id: 4, title: 'विमा व जोखीम व्यवस्थापन सल्लागार', level: 'जीवन व सामान्य विमा संपूर्ण प्रशिक्षण', duration: '१.५ महिने', icon: '🛡️', highlights: 'IRDAI परीक्षा तयारी, पॉलिसी मॅपिंग, बिझनेस ग्रोथ' }
  ];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '70px', color: '#1F2937' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#14532D',
          color: '#FEF08A',
          border: '1.5px solid #22C55E',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          fontWeight: 800,
          fontSize: '0.94rem'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Header Selector */}
      <div style={{ background: '#261C14', padding: '12px 20px', borderBottom: '2px solid #EA580C' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ color: '#FEF08A', fontWeight: 800, fontSize: '0.95rem' }}>
            🚩 CONNECT मराठा — अर्थ व समृद्धी विभाग (Banking, Credit & Wealth)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'bank', label: '🏦 मराठा बँक' },
              { id: 'loans', label: '💰 कर्ज योजना व महामंडळ' },
              { id: 'societies', label: '🤝 पतसंस्था महाजाल' },
              { id: 'institute', label: '🎓 फायनान्शियल इन्स्टिट्यूट' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: activeTab === tab.id ? '#EA580C' : 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #14532D 0%, #166534 50%, #15803D 100%)',
        color: '#FFFFFF',
        padding: '48px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '5px 18px',
            borderRadius: '20px',
            fontSize: '0.86rem',
            fontWeight: 800,
            marginBottom: '14px',
            color: '#FEF08A'
          }}>
            स्वावलंबन • समृद्धी • आर्थिक स्वायत्तता
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            मराठा सहकारी बँक व वित्त कक्ष
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#BBF7D0', margin: '0 0 24px', lineHeight: 1.5 }}>
            मराठी माणसाच्या घामाच्या पैशाला सर्वोत्तम सुरक्षा, सर्वाधिक व्याजदर (८.२५% पर्यंत) आणि उद्योग उभारणीसाठी सुलभ भांडवल.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setAccountModal(true)}
              style={{
                background: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontSize: '0.98rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}>
              ⚡ डिजिटल खाते उघडा
            </button>
            <button
              onClick={() => {
                setSelectedScheme(schemes[0] || null);
                setLoanModal(true);
              }}
              style={{
                background: '#FEF08A',
                color: '#14532D',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontSize: '0.98rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}>
              📝 कर्ज योजनेसाठी अर्ज करा
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TAB 1: BANKING OVERVIEW & ACCOUNTS                        */}
      {/* ========================================================= */}
      {activeTab === 'bank' && (
        <div style={{ maxWidth: '1240px', margin: '40px auto 0', padding: '0 20px' }}>
          {/* 4 Pillars Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px'
          }}>
            {[
              { title: '१००% सुरक्षित', sub: 'DICGC विमा संरक्षित ठेवी', icon: '🔒', color: '#15803D' },
              { title: 'विश्वासार्हता', sub: 'महाराष्ट्रात २५०+ शाखा नेटवर्क', icon: '🤝', color: '#0369A1' },
              { title: 'सर्वोच्च परतावा', sub: '८.२५% पर्यंत मुदत ठेव व्याजदर', icon: '📈', color: '#C2410C' },
              { title: 'हक्काची साथ', sub: 'मराठा नवउद्योजकांना तत्पर वित्त', icon: '🚩', color: '#B91C1C' }
            ].map((p, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '22px',
                boxShadow: '0 4px 14px rgba(67, 20, 7, 0.05)',
                border: '1px solid #FED7AA',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '2rem' }}>{p.icon}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: p.color, margin: '8px 0 4px' }}>{p.title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>{p.sub}</p>
              </div>
            ))}
          </div>

          {/* Accounts & FD Rates Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Accounts Types */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #FED7AA', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', margin: '0 0 16px' }}>
                खाती आणि ठेवी (Deposit Products)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', background: '#F0FDF4', borderRadius: '10px', borderLeft: '4px solid #16A34A' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: 800, color: '#15803D' }}>मराठा बचत खाते</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>सुलभ बचत, RuPay प्लॅटिनम डेबिट कार्ड, ३.५०% वार्षिक व्याज.</p>
                </div>
                <div style={{ padding: '14px', background: '#FFFBEB', borderRadius: '10px', borderLeft: '4px solid #F59E0B' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: 800, color: '#B45309' }}>मराठा चालू खाते (Current Account)</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>व्यावसायिकांसाठी सर्वोत्तम, अमर्यादित व्यवहार, ओव्हरड्राफ्ट व POS सुविधा.</p>
                </div>
                <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '10px', borderLeft: '4px solid #2563EB' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: 800, color: '#1D4ED8' }}>मराठा मुदत ठेव (Fixed Deposit)</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>८.२५% पर्यंत व्याजदर, ज्येष्ठ नागरिकांना ०.५०% अतिरिक्त परतावा.</p>
                </div>
              </div>
            </div>

            {/* Interest Rates */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #FED7AA', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9A3412', margin: '0 0 6px' }}>
                मुदत ठेव व्याजदर (FD Annual Rates)
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '0 0 16px' }}>
                मराठी माणसाच्या घामाच्या पैशाला सर्वोत्तम परतावा
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#C2410C' }}>ठेवीचा कालावधी</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#C2410C' }}>वार्षिक व्याजदर</th>
                  </tr>
                </thead>
                <tbody>
                  {interestRates.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#334155' }}>{r.type}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>{r.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => setAccountModal(true)}
                style={{
                  width: '100%',
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '18px'
                }}>
                मुदत ठेव (FD) सुरू करा →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LOANS & ANNABHAU PATIL SCHEMES                     */}
      {/* ========================================================= */}
      {activeTab === 'loans' && (
        <div style={{ maxWidth: '1240px', margin: '40px auto 0', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7C2D12', margin: '0 0 4px' }}>
                💰 मराठा कर्ज योजना व महामंडळ अर्थसहाय्य
              </h2>
              <p style={{ margin: 0, color: '#9A3412', fontSize: '0.92rem' }}>
                अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळ व सहयोगी बँकांच्या माध्यमातून उद्योजकतेला पाठबळ.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedScheme(schemes[0] || null);
                setLoanModal(true);
              }}
              style={{
                background: '#EA580C',
                color: '#FFF',
                padding: '11px 22px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}>
              + नवीन कर्ज अर्ज करा
            </button>
          </div>

          {/* Schemes Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {loans.map((ln, idx) => (
              <div key={idx} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #FED7AA',
                boxShadow: '0 4px 14px rgba(67, 20, 7, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '2rem' }}>{ln.icon}</span>
                    <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                      {ln.rate}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800, color: '#7C2D12' }}>
                    {ln.title}
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                    {ln.desc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLoanForm(prev => ({ ...prev, schemeName: ln.title }));
                    setLoanModal(true);
                  }}
                  style={{
                    width: '100%',
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '1.5px solid #EA580C',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}>
                  कर्ज अर्ज करा →
                </button>
              </div>
            ))}
          </div>

          {/* User's Submitted Applications (if any) */}
          {myApplications.length > 0 && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #FED7AA', marginBottom: '40px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#7C2D12', fontSize: '1.2rem', fontWeight: 800 }}>
                📋 माझे सादर केलेले कर्ज अर्ज ({myApplications.length})
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {myApplications.map(app => (
                  <div key={app.id} style={{
                    background: '#FAF7F2',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <strong style={{ color: '#7C2D12', fontSize: '1rem' }}>{app.schemeName}</strong>
                      <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '2px' }}>
                        अर्ज क्र.: {app.id} • प्रकल्प: {app.businessName} • रक्कम: ₹{Number(app.loanAmount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        background: (app.status || '').includes('मंजूर') ? '#DCFCE7' : '#FEF3C7',
                        color: (app.status || '').includes('मंजूर') ? '#15803D' : '#B45309',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.82rem'
                      }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CREDIT SOCIETIES DIRECTORY (पतसंस्था महाजाल)         */}
      {/* ========================================================= */}
      {activeTab === 'societies' && (
        <div style={{ maxWidth: '1240px', margin: '40px auto 0', padding: '0 20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7C2D12', margin: '0 0 4px' }}>
              🤝 मराठा नागरी सहकारी बँका व पतसंस्था महाजाल
            </h2>
            <p style={{ margin: 0, color: '#9A3412', fontSize: '0.92rem' }}>
              महाराष्ट्राच्या कानाकोपऱ्यातील अग्रगण्य मराठा पतसंस्थांची थेट संपर्क माहिती व ठेवी/कर्ज सेवा.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {(creditSocieties.length ? creditSocieties : [
              { id: 'PAT-01', name: 'राजमाता जिजाऊ ग्रामीण बिगरशेती सहकारी पतसंस्था', city: 'पुणे', branches: 14, deposits: '₹१४० कोटी', rating: 'A+', contact: '+91 98221 44550' },
              { id: 'PAT-02', name: 'छत्रपती शिवाजी महाराज नागरी सहकारी बँक लि.', city: 'कोल्हापूर', branches: 28, deposits: '₹४५० कोटी', rating: 'A++', contact: '+91 98230 45566' },
              { id: 'PAT-03', name: 'स्वराज्य महिला औद्योगिक व कृषी पतसंस्था', city: 'सातारा', branches: 8, deposits: '₹७५ कोटी', rating: 'A+', contact: '+91 98224 88712' },
              { id: 'PAT-04', name: 'अखिल मराठा मल्टिस्टेट को-ऑपरेटिव्ह क्रेडिट सोसायटी', city: 'नाशिक', branches: 22, deposits: '₹३१० कोटी', rating: 'A+', contact: '+91 98902 33441' }
            ]).map(pat => (
              <div key={pat.id} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #FED7AA',
                boxShadow: '0 4px 14px rgba(67, 20, 7, 0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800 }}>
                    ऑडिट वर्ग: {pat.rating}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                    📍 {pat.city}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.08rem', fontWeight: 800, color: '#7C2D12' }}>
                  {pat.name}
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '14px', lineHeight: 1.5 }}>
                  एकूण शाखा: <strong>{pat.branches}</strong> • ठेवी: <strong>{pat.deposits}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:${pat.contact}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: '#16A34A',
                      color: '#FFF',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.84rem'
                    }}>
                    📞 संपर्क ({pat.contact})
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FINANCIAL INSTITUTE & WEALTH COURSES                */}
      {/* ========================================================= */}
      {activeTab === 'institute' && (
        <div style={{ maxWidth: '1240px', margin: '40px auto 0', padding: '0 20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E3A8A', margin: '0 0 4px' }}>
              🎓 मराठा फायनान्शियल इन्स्टिट्यूट (Financial Mastery)
            </h2>
            <p style={{ margin: 0, color: '#3B82F6', fontSize: '0.92rem' }}>
              शेअर बाजार, म्युच्युअल फंड आणि बँकिंगमधील व्यावसायिक करिअरसाठी तज्ज्ञांचे थेट मार्गदर्शन.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {courses.map(crs => (
              <div key={crs.id} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #BFDBFE',
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '2rem' }}>{crs.icon}</span>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                      कालावधी: {crs.duration}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800, color: '#1E3A8A' }}>
                    {crs.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700, marginBottom: '8px' }}>
                    {crs.level}
                  </div>
                  <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    {crs.highlights}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourse(crs);
                    setCourseForm(prev => ({ ...prev, courseTitle: crs.title }));
                    setCourseModal(true);
                  }}
                  style={{
                    width: '100%',
                    background: '#1D4ED8',
                    color: '#FFF',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}>
                  प्रवेश निश्चित करा (२५% शिष्यवृत्ती) →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: LOAN APPLICATION MODAL                           */}
      {/* ========================================================= */}
      {loanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '540px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#7C2D12', fontSize: '1.3rem', fontWeight: 800 }}>
                📝 मराठा कर्ज अर्ज सादर करा
              </h3>
              <button onClick={() => setLoanModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.88rem' }}>
              {loanForm.schemeName}
            </p>

            <form onSubmit={handleLoanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                  प्रकल्प / व्यवसायाचे नाव *
                </label>
                <input
                  required
                  placeholder="उदा. सह्याद्री ॲग्रो फूड्स / शिवकृपा इंजिनिअरिंग"
                  value={loanForm.businessName}
                  onChange={e => setLoanForm({ ...loanForm, businessName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    अपेक्षित कर्ज रक्कम (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="उदा. 500000"
                    value={loanForm.loanAmount}
                    onChange={e => setLoanForm({ ...loanForm, loanAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem', fontWeight: 700, color: '#166534' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    वार्षिक उत्पन्न *
                  </label>
                  <input
                    required
                    placeholder="उदा. ₹४.५ लाख"
                    value={loanForm.annualIncome}
                    onChange={e => setLoanForm({ ...loanForm, annualIncome: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                  कर्जाचा मुख्य उद्देश (Purpose) *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="उदा. नवीन सोलर चिलर युनिट खरेदी व खेळत्या भांडवलासाठी..."
                  value={loanForm.purpose}
                  onChange={e => setLoanForm({ ...loanForm, purpose: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    संपर्क मोबाईल नंबर *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="उदा. 9822144550"
                    value={loanForm.contact}
                    onChange={e => setLoanForm({ ...loanForm, contact: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    जिल्हा / शहर *
                  </label>
                  <input
                    required
                    placeholder="उदा. पुणे"
                    value={loanForm.city}
                    onChange={e => setLoanForm({ ...loanForm, city: e.target.value, district: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#EA580C',
                  color: '#FFF',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                कर्ज अर्ज सबमिट करा ✓
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DIGITAL ACCOUNT OPENING MODAL                    */}
      {/* ========================================================= */}
      {accountModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#166534', fontSize: '1.3rem', fontWeight: 800 }}>
                ⚡ मराठा बँक डिजिटल खाते उघडा
              </h3>
              <button onClick={() => setAccountModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.88rem' }}>
              घरबसल्या ५ मिनिटांत डिजिटल खाते उघडा व ८.२५% पर्यंत व्याज मिळवा.
            </p>

            <form onSubmit={handleAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                required
                placeholder="पूर्ण नाव *"
                value={accountForm.name}
                onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <input
                required
                type="tel"
                placeholder="१० अंकी मोबाईल नंबर *"
                value={accountForm.phone}
                onChange={e => setAccountForm({ ...accountForm, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <input
                required
                placeholder="आधार क्रमांक / पॅन क्रमांक *"
                value={accountForm.aadharOrPan}
                onChange={e => setAccountForm({ ...accountForm, aadharOrPan: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <select
                value={accountForm.accountType}
                onChange={e => setAccountForm({ ...accountForm, accountType: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem', background: '#FFFFFF' }}>
                <option value="बचत खाते (Savings Account - ३.५०%)">बचत खाते (Savings Account - ३.५०%)</option>
                <option value="चालू खाते (Current Account)">चालू खाते (Current Account)</option>
                <option value="मुदत ठेव (Fixed Deposit - ८.२५% पर्यंत)">मुदत ठेव (Fixed Deposit - ८.२५% पर्यंत)</option>
              </select>
              <input
                required
                placeholder="शहर / जिल्हा *"
                value={accountForm.city}
                onChange={e => setAccountForm({ ...accountForm, city: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <button
                type="submit"
                style={{
                  background: '#16A34A',
                  color: '#FFF',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                खाते उघडण्यासाठी अर्ज करा ✓
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: COURSE ENROLLMENT MODAL                          */}
      {/* ========================================================= */}
      {courseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#1E3A8A', fontSize: '1.3rem', fontWeight: 800 }}>
                🎓 {courseForm.courseTitle}
              </h3>
              <button onClick={() => setCourseModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>
            <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.88rem' }}>
              मराठा विद्यार्थ्यांना २५% विशेष शिष्यवृत्ती सवलत उपलब्ध.
            </p>

            <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                required
                placeholder="विद्यार्थ्याचे नाव *"
                value={courseForm.studentName}
                onChange={e => setCourseForm({ ...courseForm, studentName: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <input
                required
                type="tel"
                placeholder="मोबाईल नंबर *"
                value={courseForm.phone}
                onChange={e => setCourseForm({ ...courseForm, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <input
                type="email"
                placeholder="ईमेल आयडी"
                value={courseForm.email}
                onChange={e => setCourseForm({ ...courseForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <input
                placeholder="शिक्षण / पदवी (उदा. B.Com, MBA, १२ वी)"
                value={courseForm.qualification}
                onChange={e => setCourseForm({ ...courseForm, qualification: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
              />
              <button
                type="submit"
                style={{
                  background: '#1D4ED8',
                  color: '#FFF',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                प्रवेश निश्चित करा ✓
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
