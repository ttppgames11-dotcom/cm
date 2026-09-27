import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './sangam.css';

const ENHANCED_CHAPTERS = [
  {
    id: 'CH01',
    slug: 'pune-shivneri-vyavsay-mandal',
    name: 'Pune Shivneri Business Mandal',
    marathiName: 'पुणे – शिवनेरी व्यवसाय मंडळ',
    city: 'पुणे',
    district: 'पुणे',
    territory: 'शिवाजीनगर / कोथरूड / बाणेर',
    meetingDay: 'दर बुधवार',
    meetingTime: 'सकाळी ७:१५ वाजता',
    venue: 'हॉटेल प्रेसिडेंट, प्रभात रोड, पुणे',
    capacity: 40,
    currentMembers: 32,
    openSeats: 8,
    visitors: 19,
    monthlyBusiness: 4875000,
    monthlyOpportunities: 47,
    totalClosedValue: 18500000,
    openCategories: ['आर्किटेक्ट', 'चार्टर्ड अकाउंटंट (CA)', 'सोलर एनर्जी कन्सल्टंट', 'कॉर्पोरेट वकील', 'डिजिटल मार्केटिंग']
  },
  {
    id: 'CH02',
    slug: 'kolhapur-raigad-vyavsay-mandal',
    name: 'Kolhapur Raigad Business Mandal',
    marathiName: 'कोल्हापूर – रायगड व्यवसाय मंडळ',
    city: 'कोल्हापूर',
    district: 'कोल्हापूर',
    territory: 'ताराबाई पार्क / शाहूपुरी',
    meetingDay: 'दर शुक्रवार',
    meetingTime: 'सकाळी ७:४५ वाजता',
    venue: 'हॉटेल सयाजी, कोल्हापूर',
    capacity: 35,
    currentMembers: 26,
    openSeats: 9,
    visitors: 14,
    monthlyBusiness: 3410000,
    monthlyOpportunities: 38,
    totalClosedValue: 14600000,
    openCategories: ['सिव्हिल कॉन्ट्रॅक्टर', 'अ‍ॅग्रो एक्सपोर्टर', 'हॉस्पिटॅलिटी / केटरिंग', 'इंटीरियर डिझायनर', 'वेअरहाऊसिंग']
  },
  {
    id: 'CH03',
    slug: 'nashik-jijau-vyavsay-sangam',
    name: 'Nashik Jijau Business Sangam',
    marathiName: 'नाशिक – जिजाऊ व्यवसाय संगम',
    city: 'नाशिक',
    district: 'नाशिक',
    territory: 'गंगापूर रोड / कॉलेज रोड',
    meetingDay: 'दर मंगळवार',
    meetingTime: 'सकाळी ७:०० वाजता',
    venue: 'हॉटेल एक्सप्रेस इन, पाथर्डी फाटा, नाशिक',
    capacity: 40,
    currentMembers: 34,
    openSeats: 6,
    visitors: 23,
    monthlyBusiness: 6240000,
    monthlyOpportunities: 58,
    totalClosedValue: 22400000,
    openCategories: ['फार्मा मॅन्युफॅक्चरर', 'पॅकेजिंग इंडस्ट्री', 'सीए / टॅक्स कन्सल्टंट', 'ऑटोमोबाईल सर्व्हिस', 'इव्हेंट मॅनेजमेंट']
  },
  {
    id: 'CH04',
    slug: 'mumbai-thane-pratapgad-mandal',
    name: 'Mumbai-Thane Pratapgad Mandal',
    marathiName: 'ठाणे – प्रतापगड व्यवसाय मंडळ',
    city: 'ठाणे',
    district: 'ठाणे / मुंबई',
    territory: 'घोडबंदर रोड / वागळे इस्टेट',
    meetingDay: 'दर गुरुवार',
    meetingTime: 'सकाळी ७:३० वाजता',
    venue: 'द ठाणे क्लब, तीन हात नाका, ठाणे',
    capacity: 45,
    currentMembers: 38,
    openSeats: 7,
    visitors: 27,
    monthlyBusiness: 7850000,
    monthlyOpportunities: 64,
    totalClosedValue: 29800000,
    openCategories: ['रिअल इस्टेट ब्रोकर', 'लॉजिस्टिक्स & फ्लीट', 'आयटी सॉफ्टवेअर', 'इंटिरियर टर्नकी', 'फायनान्शिअल प्लॅनर']
  },
  {
    id: 'CH05',
    slug: 'sambhajinagar-devgiri-mandal',
    name: 'Chh. Sambhajinagar Devgiri Mandal',
    marathiName: 'छ. संभाजीनगर – देवगिरी व्यवसाय मंडळ',
    city: 'छत्रपती संभाजीनगर',
    district: 'छत्रपती संभाजीनगर',
    territory: 'जालना रोड / वाळूज MIDC',
    meetingDay: 'दर शनिवार',
    meetingTime: 'सकाळी ८:०० वाजता',
    venue: 'हॉटेल रामा इंटरनॅशनल, जालना रोड',
    capacity: 35,
    currentMembers: 25,
    openSeats: 10,
    visitors: 16,
    monthlyBusiness: 3150000,
    monthlyOpportunities: 31,
    totalClosedValue: 11900000,
    openCategories: ['ऑटो कंपोनंट्स', 'सोलर इन्स्टॉलेशन', 'अन्न प्रक्रिया', 'हॉस्पिटल इक्विपमेंट्स', 'लेबर कॉन्ट्रॅक्टर']
  },
  {
    id: 'CH06',
    slug: 'nagpur-bhosale-sangam',
    name: 'Nagpur Bhosale Business Sangam',
    marathiName: 'नागपूर – भोसले व्यवसाय संगम',
    city: 'नागपूर',
    district: 'नागपूर',
    territory: 'धरमपेठ / वर्धा रोड / बुटीबोरी MIDC',
    meetingDay: 'दर सोमवार',
    meetingTime: 'सकाळी ७:३० वाजता',
    venue: 'हॉटेल सेंटर पॉईंट, रामदासपेठ, नागपूर',
    capacity: 35,
    currentMembers: 24,
    openSeats: 11,
    visitors: 15,
    monthlyBusiness: 2980000,
    monthlyOpportunities: 29,
    totalClosedValue: 10500000,
    openCategories: ['मायनिंग इक्विपमेंट्स', 'लॉजिस्टिक्स & गोडाऊन', 'सॉफ्टवेअर डेव्हलपमेंट', 'औद्योगिक बांधकाम', 'कापूस व जिनिंग']
  }
];

const SUCCESS_REFERRALS = [
  {
    id: 'DEAL-01',
    chapter: 'पुणे – शिवनेरी मंडळ',
    from: 'राजेश कदम (कदम कन्स्ट्रक्शन्स)',
    to: 'संजय माने (माने इंजिनिअरिंग)',
    deal: 'औद्योगिक वेअरहाऊस सोलर पीईबी रूफिंग कंत्राट',
    value: '₹२८,५०,०००',
    timeAgo: '२ दिवसांपूर्वी'
  },
  {
    id: 'DEAL-02',
    chapter: 'ठाणे – प्रतापगड मंडळ',
    from: 'अमित मोरे (मोरे इन्फ्रा)',
    to: 'नितीन जाधव (जाधव इंटीरियर्स)',
    deal: '३२ निवासी सदनिकांचे संपूर्ण मॉड्युलर किचन',
    value: '₹४२,००,०००',
    timeAgo: 'काल'
  },
  {
    id: 'DEAL-03',
    chapter: 'नाशिक – जिजाऊ संगम',
    from: 'सचिन घोरपडे (घोरपडे कोल्ड स्टोरेज)',
    to: 'गणेश मोहिते (मोहिते ऑटोमेशन)',
    deal: 'द्राक्ष निर्यात शीतगृह ऑटोमेशन सिस्टीम',
    value: '₹१६,२०,०००',
    timeAgo: '४ दिवसांपूर्वी'
  }
];

function formatCurrency(amount) {
  if (!amount) return '₹०';
  if (amount >= 10000000) {
    return '₹' + (amount / 10000000).toFixed(2) + ' कोटी';
  }
  if (amount >= 100000) {
    return '₹' + (amount / 100000).toFixed(2) + ' लाख';
  }
  return '₹' + amount.toLocaleString('en-IN');
}

export default function BusinessSangamPage() {
  const [chapters] = useState(ENHANCED_CHAPTERS);
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeVisitorModal, setActiveVisitorModal] = useState(null);
  const [visitorForm, setVisitorForm] = useState({ name: '', phone: '', business: '', category: '' });
  const [visitorSuccess, setVisitorSuccess] = useState(false);

  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralForm, setReferralForm] = useState({ from: '', toChapter: 'CH01', clientName: '', requirement: '', value: '' });
  const [referralSuccess, setReferralSuccess] = useState(false);

  // Totals
  const totalStats = chapters.reduce(
    (acc, ch) => {
      acc.members += ch.currentMembers;
      acc.business += ch.totalClosedValue;
      acc.opportunities += ch.monthlyOpportunities;
      return acc;
    },
    { members: 0, business: 0, opportunities: 0 }
  );

  // Filtered Chapters
  const filteredChapters = chapters.filter((ch) => {
    const matchCity = selectedCity === 'ALL' || ch.city.includes(selectedCity) || ch.district.includes(selectedCity);
    if (!matchCity) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const hay = `${ch.marathiName} ${ch.name} ${ch.city} ${ch.territory} ${ch.openCategories.join(' ')}`.toLowerCase();
    return hay.includes(q);
  });

  const handleVisitorSubmit = (e) => {
    e.preventDefault();
    if (!visitorForm.name || !visitorForm.phone) return;
    setVisitorSuccess(true);
    setTimeout(() => {
      setVisitorSuccess(false);
      setActiveVisitorModal(null);
      setVisitorForm({ name: '', phone: '', business: '', category: '' });
    }, 3000);
  };

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    if (!referralForm.clientName || !referralForm.requirement) return;
    setReferralSuccess(true);
    setTimeout(() => {
      setReferralSuccess(false);
      setReferralModalOpen(false);
      setReferralForm({ from: '', toChapter: 'CH01', clientName: '', requirement: '', value: '' });
    }, 3000);
  };

  return (
    <div className="sangam-page-wrapper">
      
      {/* 1. Live Business Ticker */}
      <div className="sangam-ticker-bar">
        <div className="sangam-ticker-content">
          <span className="sangam-ticker-badge">⚡ LIVE B2B TICKER</span>
          <span>
            <strong>पुणे शिवनेरी:</strong> ₹२८.५ लाखांचा सोलर करार पूर्ण • <strong>ठाणे प्रतापगड:</strong> ₹४२ लाखांचे मॉड्युलर किचन कंत्राट • <strong>नाशिक जिजाऊ:</strong> ₹१६.२ लाखांचे शीतगृह ऑटोमेशन
          </span>
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
          <span>📞 B2B हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
          <Link to="/meetings" style={{ color: '#FDE68A', textDecoration: 'underline' }}>१-टू-१ बैठका</Link>
        </div>
      </div>

      {/* 2. Royal & High-Impact Hero Banner */}
      <section className="sangam-hero">
        <div className="sangam-hero-inner">
          <div className="sangam-hero-eyebrow">
            <span>🚩</span>
            <span>अखिल भारतीय मराठा व्यवसाय महासंघ • BNI-Style Networking Hub</span>
          </div>

          <h1 className="sangam-hero-title">
            ओळखीतून संबंध • संबंधातून विश्वास • <span>विश्वासातून व्यवसाय</span>
          </h1>

          <p className="sangam-hero-desc">
            महाराष्ट्रातील मराठा उद्योजक, व्यावसायिक, तंत्रज्ञ आणि व्यापाऱ्यांचे एकमेकांना दर्जेदार व्यवसाय संधी देणारे, दर आठवड्याला प्रत्यक्ष भेटणारे आणि पारदर्शक CRM द्वारे कोट्यवधींचा व्यापार वाढवणारे सर्वोच्च नेटवर्किंग व्यासपीठ.
          </p>

          <div className="sangam-hero-actions">
            <button
              onClick={() => setReferralModalOpen(true)}
              className="sangam-btn-primary"
            >
              <span>🤝</span>
              <span>नवीन व्यवसाय संधी (रेफरल) द्या</span>
            </button>
            <Link to="/meetings" className="sangam-btn-secondary">
              <span>☕</span>
              <span>१-टू-१ बैठका पोर्टल</span>
            </Link>
            <Link to="/referrals" className="sangam-btn-secondary">
              <span>📊</span>
              <span>रेफरल ट्रॅकर व CRM</span>
            </Link>
            <Link to="/business/directory" className="sangam-btn-secondary">
              <span>🔎</span>
              <span>उद्योग निर्देशिका (5,000+ व्यवसाय)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Executive KPI Stat Ribbon */}
      <section className="sangam-stats-ribbon">
        <div className="sangam-stats-container">
          <div className="sangam-stat-box">
            <div className="sangam-stat-val">{formatCurrency(totalStats.business)}</div>
            <div className="sangam-stat-lbl">एकूण बंद झालेला व्यवसाय (Closed Business)</div>
          </div>
          <div className="sangam-stat-box">
            <div className="sangam-stat-val" style={{ color: '#C2410C' }}>{chapters.length}</div>
            <div className="sangam-stat-lbl">सक्रिय व्यवसाय मंडळे (Active Chapters)</div>
          </div>
          <div className="sangam-stat-box">
            <div className="sangam-stat-val" style={{ color: '#047857' }}>{totalStats.members}+</div>
            <div className="sangam-stat-lbl">सक्रिय सदस्य व्यावसायिक (Verified Members)</div>
          </div>
          <div className="sangam-stat-box">
            <div className="sangam-stat-val" style={{ color: '#D97706' }}>{totalStats.opportunities}+</div>
            <div className="sangam-stat-lbl">या महिन्यातील व्यवसाय संधी (Monthly Referrals)</div>
          </div>
        </div>
      </section>

      {/* 4. Main Body: Active Chapters Directory */}
      <main className="sangam-shell">

        {/* Section Header */}
        <div className="sangam-section-title-wrap">
          <div>
            <h2 className="sangam-sec-h2">
              <span>🏢</span>
              <span>सक्रिय स्थानिक व्यवसाय मंडळे (Chapters Directory)</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>
              आपल्या परिसरातील मंडळात पाहुणे म्हणून उपस्थित राहून आपल्या व्यवसायासाठी शेकडो रेफरल्स मिळवा.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C2410C' }}>
              एकूण {filteredChapters.length} मंडळे उपलब्ध
            </span>
          </div>
        </div>

        {/* City Filter Pills & Search */}
        <div className="sangam-filter-bar">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
            {[
              { id: 'ALL', label: 'सर्व शहरे (All)' },
              { id: 'पुणे', label: 'पुणे (Pune)' },
              { id: 'ठाणे', label: 'मुंबई / ठाणे (Mumbai)' },
              { id: 'कोल्हापूर', label: 'कोल्हापूर (Kolhapur)' },
              { id: 'नाशिक', label: 'नाशिक (Nashik)' },
              { id: 'संभाजीनगर', label: 'छ. संभाजीनगर' },
              { id: 'नागपूर', label: 'नागपूर (Nagpur)' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedCity(pill.id)}
                className={`sangam-filter-pill ${selectedCity === pill.id ? 'active' : ''}`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="मंडळ, क्षेत्र किंवा उद्योग शोधा..."
            className="sangam-search-input"
          />
        </div>

        {/* Chapters Cards Grid */}
        <div className="sangam-chapters-grid">
          {filteredChapters.map((ch) => (
            <div key={ch.id} className="sangam-chapter-card">
              <div>
                <div className="sangam-ch-header">
                  <div>
                    <h3 className="sangam-ch-title">{ch.marathiName}</h3>
                    <div className="sangam-ch-meta">
                      📍 {ch.territory} ({ch.city})
                    </div>
                  </div>
                  <span className="sangam-open-pill">
                    {ch.openSeats} जागा शिल्लक
                  </span>
                </div>

                {/* Meeting Time & Venue Box */}
                <div className="sangam-details-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span><strong>बैठक वार व वेळ:</strong></span>
                    <span style={{ color: '#C2410C', fontWeight: 800 }}>{ch.meetingDay} • {ch.meetingTime}</span>
                  </div>
                  <div><strong>स्थान:</strong> {ch.venue}</div>
                  <div style={{ marginTop: '4px', color: '#047857', fontWeight: 700 }}>
                    या महिन्यातील बंद व्यवसाय: {formatCurrency(ch.monthlyBusiness)}
                  </div>
                </div>

                {/* Open Category Seats */}
                <div className="sangam-categories-wrap">
                  <span className="sangam-cat-label">नवीन उपलब्ध उद्योग जागा (Open Categories):</span>
                  <div className="sangam-cat-chips">
                    {ch.openCategories.map((cat, i) => (
                      <span key={i} className="sangam-cat-chip">
                        + {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sangam-card-actions">
                <button
                  onClick={() => {
                    setActiveVisitorModal(ch);
                    setVisitorForm({ name: '', phone: '', business: '', category: ch.openCategories[0] || '' });
                  }}
                  className="sangam-btn-primary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  पाहुणे म्हणून या (Visitor Pass)
                </button>
                <Link
                  to={`/business/mandal?chapter=${encodeURIComponent(ch.id)}`}
                  className="sangam-btn-secondary"
                  style={{ background: '#F1F5F9', color: '#1E293B', borderColor: '#CBD5E1', padding: '10px 14px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  तपशील
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 5. How Business Sangam Works (4 Core Pillars) */}
        <section style={{ marginBottom: '50px' }}>
          <div className="sangam-section-title-wrap">
            <div>
              <h2 className="sangam-sec-h2">
                <span>⚙️</span>
                <span>व्यवसाय संगम कसे कार्य करते? (४ आधारस्तंभ)</span>
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>
                जागतिक दर्जाची BNI बिझनेस मॉडेल कार्यप्रणाली, जी मराठा उद्योजकांच्या विश्वासावर आधारलेली आहे.
              </p>
            </div>
          </div>

          <div className="sangam-workflow-grid">
            <div className="sangam-workflow-card">
              <div className="sangam-wf-icon">🔒</div>
              <h3 className="sangam-wf-title">१. एक उद्योग – एक सदस्य</h3>
              <p className="sangam-wf-desc">
                एका मंडळात एकाच उद्योगाचा एकच अधिकृत सदस्य असतो. उदा. जर मंडळात एक चार्टर्ड अकाउंटंट असेल तर दुसरा सीए घेतला जात नाही. त्यामुळे मंडळातील सर्व रेफरल्स एकाच सदस्याला मिळतात.
              </p>
            </div>

            <div className="sangam-workflow-card">
              <div className="sangam-wf-icon">🥞</div>
              <h3 className="sangam-wf-title">२. साप्ताहिक नाश्ता बैठक</h3>
              <p className="sangam-wf-desc">
                दर आठवड्याला सकाळी ७:१५ वाजता सर्व सदस्य शिस्तबद्ध नाश्ता बैठकीत एकत्र येतात. प्रत्येक उद्योजकाला स्वतःचा व्यवसाय सादर करण्यासाठी ६० सेकंदांचा 'पिच टाइम' मिळतो.
              </p>
            </div>

            <div className="sangam-workflow-card">
              <div className="sangam-wf-icon">☕</div>
              <h3 className="sangam-wf-title">३. एक-ते-एक (1-to-1) संवाद</h3>
              <p className="sangam-wf-desc">
                आठवड्यादरम्यान दोन सदस्य वैयक्तिक भेटून एकमेकांच्या कामाची पद्धती, क्लायंट प्रोफाईल आणि नेटवर्क समजून घेतात; ज्यामुळे खात्रीशीर व मोठे रेफरल्स देणे शक्य होते.
              </p>
            </div>

            <div className="sangam-workflow-card">
              <div className="sangam-wf-icon">📈</div>
              <h3 className="sangam-wf-title">४. पारदर्शक CRM व मूल्य</h3>
              <p className="sangam-wf-desc">
                प्रत्येक संधी (Lead), संपर्क आणि बंद झालेला व्यवसाय (Closed Business) ॲपमध्ये पारदर्शकपणे नोंदवला जातो. प्रत्येक सदस्याचा बिझनेस स्कोरकार्ड थेट डॅशबोर्डवर दिसतो.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Success Stories / Closed Deals Hall of Fame */}
        <section className="sangam-success-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#C2410C' }}>
                यशस्वी व्यापार साक्ष (Verified Closed Deals)
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', color: '#7C1D05', fontWeight: 900 }}>
                मराठा बांधवांमधील थेट कोट्यवधींचा व्यापार
              </h3>
            </div>
            <Link to="/referrals" style={{ color: '#C2410C', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'underline' }}>
              सर्व व्यवहार ट्रॅकर पहा →
            </Link>
          </div>

          <div className="sangam-success-grid">
            {SUCCESS_REFERRALS.map((deal) => (
              <div key={deal.id} className="sangam-deal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>
                  <span>{deal.chapter}</span>
                  <span>{deal.timeAgo}</span>
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#1E293B', fontWeight: 800 }}>{deal.deal}</h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                  <strong>रेफरल देणारे:</strong> {deal.from}<br />
                  <strong>स्वीकारणारे:</strong> {deal.to}
                </div>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 12px', borderRadius: '8px', color: '#047857', fontWeight: 800, fontSize: '0.95rem', display: 'inline-block' }}>
                  करार मूल्य: {deal.value}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 7. VISITOR PASS MODAL */}
      {activeVisitorModal && (
        <div className="sangam-modal-overlay">
          <div className="sangam-modal-box">
            <button onClick={() => setActiveVisitorModal(null)} className="sangam-modal-close">✕</button>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#C2410C' }}>
              पाहुणे उपस्थिती पास (Visitor Guest Pass)
            </span>
            <h3 style={{ margin: '6px 0', fontSize: '1.35rem', color: '#7C1D05', fontWeight: 900 }}>
              {activeVisitorModal.marathiName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '18px' }}>
              बैठक: {activeVisitorModal.meetingDay} {activeVisitorModal.meetingTime} • {activeVisitorModal.venue}
            </p>

            {visitorSuccess ? (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>🎟️</span>
                <h4 style={{ margin: '8px 0 4px', color: '#065F46', fontSize: '1.15rem', fontWeight: 800 }}>आपला व्हिजिटर पास मंजूर झाला आहे!</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>
                  आपल्या व्हॉट्सॲप क्रमांकावर बैठक निमंत्रण आणि लोकेशन पाठवले गेले आहे. पुढील बैठकीत आपले स्वागत आहे!
                </p>
              </div>
            ) : (
              <form onSubmit={handleVisitorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>आपले पूर्ण नाव:</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.name}
                    onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                    placeholder="उदा. राहुल बाजीराव कदम"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>व्हॉट्सॲप मोबाईल नंबर:</label>
                  <input
                    type="tel"
                    required
                    value={visitorForm.phone}
                    onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                    placeholder="उदा. 98220XXXXX"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>व्यवसाय / कंपनीचे नाव:</label>
                  <input
                    type="text"
                    value={visitorForm.business}
                    onChange={(e) => setVisitorForm({ ...visitorForm, business: e.target.value })}
                    placeholder="उदा. कदम इंजिनिअरिंग सोल्युशन्स"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>उद्योग श्रेणी (Industry Category):</label>
                  <select
                    value={visitorForm.category}
                    onChange={(e) => setVisitorForm({ ...visitorForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {activeVisitorModal.openCategories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                    <option value="इतर">इतर उद्योग</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="sangam-btn-primary"
                  style={{ marginTop: '8px', justifyContent: 'center' }}
                >
                  मोफत व्हिजिटर पास बुक करा →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 8. QUICK REFERRAL MODAL */}
      {referralModalOpen && (
        <div className="sangam-modal-overlay">
          <div className="sangam-modal-box">
            <button onClick={() => setReferralModalOpen(false)} className="sangam-modal-close">✕</button>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>
              नवीन रेफरल फॉर्म (Submit Business Opportunity)
            </span>
            <h3 style={{ margin: '6px 0', fontSize: '1.35rem', color: '#1E293B', fontWeight: 900 }}>
              मराठा बांधवाला व्यवसाय संधी द्या
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '18px' }}>
              आपल्या संपर्कातील क्लायंट किंवा प्रोजेक्टची गरज नोंदवा. संबंधित मंडळातील प्रमाणित सदस्याला ही संधी दिली जाईल.
            </p>

            {referralSuccess ? (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>🤝</span>
                <h4 style={{ margin: '8px 0 4px', color: '#065F46', fontSize: '1.15rem', fontWeight: 800 }}>रेफरल यशस्वीरीत्या पाठवला गेला!</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>
                  रेफरल ट्रॅकरवर या संधीचा स्टेटस 'नवीन' म्हणून जोडला गेला आहे.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReferralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>लक्ष्यित मंडळ (Target Chapter):</label>
                  <select
                    value={referralForm.toChapter}
                    onChange={(e) => setReferralForm({ ...referralForm, toChapter: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.marathiName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>संभाव्य क्लायंट / कंपनीचे नाव:</label>
                  <input
                    type="text"
                    required
                    value={referralForm.clientName}
                    onChange={(e) => setReferralForm({ ...referralForm, clientName: e.target.value })}
                    placeholder="उदा. सह्याद्री फूड्स प्रा. लि."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>कामाचे स्वरूप व आवश्यकता (Requirement):</label>
                  <textarea
                    rows={3}
                    required
                    value={referralForm.requirement}
                    onChange={(e) => setReferralForm({ ...referralForm, requirement: e.target.value })}
                    placeholder="उदा. नवीन फॅक्टरीसाठी ५० टन क्षमतेचे एसी व चिलर प्लांट इन्स्टॉलेशन कंत्राट..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  ></textarea>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>अंदाजे करार मूल्य (Estimated Deal Value):</label>
                  <input
                    type="text"
                    value={referralForm.value}
                    onChange={(e) => setReferralForm({ ...referralForm, value: e.target.value })}
                    placeholder="उदा. ₹१५,००,०००"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  className="sangam-btn-primary"
                  style={{ marginTop: '8px', justifyContent: 'center' }}
                >
                  रेफरल पाठवा (Submit Referral) →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
