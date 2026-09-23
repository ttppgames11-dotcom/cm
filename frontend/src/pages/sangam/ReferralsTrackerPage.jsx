import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const INITIAL_REFERRALS = [
  {
    id: 'REF-2026-091',
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '19',
    userId: 'CM-10291',
    userName: 'राजेश कदम',
    state: 'महाराष्ट्र',
    city: 'पुणे',
    prospect: 'सह्याद्री ॲग्रो फूड्स प्रायव्हेट लिमिटेड',
    category: 'अन्न प्रक्रिया व पॅकेजिंग',
    requirement: 'नवीन सोलर कोल्ड स्टोरेजसाठी ३० HP चिलर युनिट व वेअरहाऊस डिझाइन कंत्राट.',
    estimatedValue: 850000,
    actualValue: 850000,
    status: 'Won',
    recipient: 'संजय माने (माने इंजिनिअरिंग)',
    date: '2026-09-19'
  },
  {
    id: 'REF-2026-088',
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '18',
    userId: 'CM-4081',
    userName: 'सुनील साळुंखे',
    state: 'महाराष्ट्र',
    city: 'मुंबई',
    prospect: 'मराठा लॉजिस्टिक्स कॉर्पोरेशन',
    category: 'वाहतूक व पुरवठा साखळी',
    requirement: 'जेएनपीटी ते चाकण दरम्यान ५० ट्रेलर वाहनांची वार्षिक ट्रान्सपोर्ट लीज.',
    estimatedValue: 2400000,
    actualValue: 0,
    status: 'Proposal',
    recipient: 'अमोल शिंदे (शिंदे फ्लीट)',
    date: '2026-09-18'
  },
  {
    id: 'REF-2026-075',
    year: '2026',
    month: '09',
    week: 'Week 37',
    day: '14',
    userId: 'CM-9012',
    userName: 'विकास पाटील',
    state: 'महाराष्ट्र',
    city: 'कोल्हापूर',
    prospect: 'राजाराम इंजिनिअरिंग वर्क्स',
    category: 'औद्योगिक उत्पादन व लेथ',
    requirement: 'सीएनसी मशीनिंगसाठी उच्च दर्जाचे अलॉय स्टील बिलेट्सचा ३ महिन्यांचा सप्लाय.',
    estimatedValue: 620000,
    actualValue: 0,
    status: 'Qualified',
    recipient: 'दीपक चव्हाण (चव्हाण मेटल्स)',
    date: '2026-09-14'
  },
  {
    id: 'REF-2026-062',
    year: '2026',
    month: '08',
    week: 'Week 34',
    day: '22',
    userId: 'CM-3309',
    userName: 'अमित मोरे',
    state: 'महाराष्ट्र',
    city: 'ठाणे',
    prospect: 'शिवम बिल्डकॉन',
    category: 'बांधकाम व रिअल इस्टेट',
    requirement: 'घोडबंदर रोड येथील ३२ मजली टॉवरसाठी स्ट्रक्चरल स्टील व आरएमसी कॉंक्रिट पुरवठा.',
    estimatedValue: 4500000,
    actualValue: 4500000,
    status: 'Won',
    recipient: 'नितीन जाधव (जाधव इन्फ्रा)',
    date: '2026-08-22'
  },
  {
    id: 'REF-2026-054',
    year: '2026',
    month: '08',
    week: 'Week 32',
    day: '08',
    userId: 'CM-7712',
    userName: 'सचिन घोरपडे',
    state: 'महाराष्ट्र',
    city: 'सातारा',
    prospect: 'कृष्णा व्हॅली ॲग्रिकल्चरल ट्रस्ट',
    category: 'शिक्षण व कौशल्य विकास',
    requirement: 'विद्यार्थ्यांसाठी १२० कॉम्प्युटर लॅब नेटवर्किंग व क्लाउड सर्व्हर सेटअप.',
    estimatedValue: 980000,
    actualValue: 0,
    status: 'Contacted',
    recipient: 'गणेश मोहिते (मोहिते आयटी सोल्युशन्स)',
    date: '2026-08-08'
  },
  {
    id: 'REF-2026-041',
    year: '2026',
    month: '07',
    week: 'Week 29',
    day: '16',
    userId: 'CM-10291',
    userName: 'राजेश कदम',
    state: 'महाराष्ट्र',
    city: 'नाशिक',
    prospect: 'गोदावरी वाइनरी & रिसॉर्ट',
    category: 'हॉस्पिटॅलिटी व पर्यटन',
    requirement: 'कॉर्पोरेट इव्हेंट ऑडिओ-व्हिज्युअल व डिजिटल मार्केटिंग कंत्राट.',
    estimatedValue: 350000,
    actualValue: 350000,
    status: 'Won',
    recipient: 'प्रशांत पवार (पवार मीडिया)',
    date: '2026-07-16'
  },
  {
    id: 'REF-2026-033',
    year: '2026',
    month: '06',
    week: 'Week 25',
    day: '20',
    userId: 'CM-8812',
    userName: 'तानाजी गायकवाड',
    state: 'कर्नाटक (सीमाभाग)',
    city: 'बेळगाव',
    prospect: 'कर्नाटक मराठा चेंबर सदस्य फर्म',
    category: 'टेक्सटाइल व वस्त्रोद्योग',
    requirement: '५००० मीटर कॉटन खादी व वर्दी कापड घाऊक खरेदी ऑर्डर.',
    estimatedValue: 720000,
    actualValue: 720000,
    status: 'Won',
    recipient: 'अजिंक्य भोसले (भोसले टेक्स्टाइल्स)',
    date: '2026-06-20'
  },
  {
    id: 'REF-2025-112',
    year: '2025',
    month: '11',
    week: 'Week 47',
    day: '25',
    userId: 'CM-4081',
    userName: 'सुनील साळुंखे',
    state: 'महाराष्ट्र',
    city: 'नागपूर',
    prospect: 'विदर्भ ऑरेंज प्रोसेसिंग युनिट',
    category: 'अन्न प्रक्रिया व पॅकेजिंग',
    requirement: 'संत्रा ज्यूस बॉटलिंग लाईन व ऑटोमॅटिक लेबलिंग प्लांट इन्स्टॉलेशन.',
    estimatedValue: 1800000,
    actualValue: 1800000,
    status: 'Won',
    recipient: 'संजय माने (माने इंजिनिअरिंग)',
    date: '2025-11-25'
  },
  {
    id: 'REF-2025-089',
    year: '2025',
    month: '09',
    week: 'Week 37',
    day: '12',
    userId: 'CM-2204',
    userName: 'महेश इंगळे',
    state: 'महाराष्ट्र',
    city: 'छत्रपती संभाजीनगर',
    prospect: 'ऑरिक ऑटो कंपोनंट्स',
    category: 'ऑटोमोटिव्ह',
    requirement: 'प्रिसिजन डाय कास्टिंग मोल्ड्स सप्लाय व मेंटेनन्स वार्षिक करार.',
    estimatedValue: 1450000,
    actualValue: 1450000,
    status: 'Won',
    recipient: 'दीपक चव्हाण (चव्हाण मेटल्स)',
    date: '2025-09-12'
  },
  {
    id: 'REF-2025-045',
    year: '2025',
    month: '04',
    week: 'Week 16',
    day: '18',
    userId: 'CM-6102',
    userName: 'दीपाली सावंत',
    state: 'गुजरात',
    city: 'सुरत',
    prospect: 'सुरत डायमंड क्लस्टर लॉजिस्टिक्स',
    category: 'सुरक्षा व मौल्यवान माल वाहतूक',
    requirement: 'सशस्त्र सुरक्षा व्हॅन व जीपीएस ट्रॅकिंग एस्कॉर्ट सेवा.',
    estimatedValue: 950000,
    actualValue: 950000,
    status: 'Won',
    recipient: 'तानाजी गायकवाड (शिवराय सिक्युरिटी)',
    date: '2025-04-18'
  },
  {
    id: 'REF-2024-077',
    year: '2024',
    month: '10',
    week: 'Week 42',
    day: '15',
    userId: 'CM-10291',
    userName: 'राजेश कदम',
    state: 'महाराष्ट्र',
    city: 'पुणे',
    prospect: 'पुणे मेट्रो फेज २ उपकंत्राटदार',
    category: 'इन्फ्रास्ट्रक्चर',
    requirement: 'मेट्रो पिलर फॅब्रिकेशन व हेवी क्रेन भाडे करार (६ महिने).',
    estimatedValue: 3200000,
    actualValue: 3200000,
    status: 'Won',
    recipient: 'नितीन जाधव (जाधव इन्फ्रा)',
    date: '2024-10-15'
  },
  {
    id: 'REF-2024-032',
    year: '2024',
    month: '03',
    week: 'Week 11',
    day: '12',
    userId: 'CM-3309',
    userName: 'अमित मोरे',
    state: 'महाराष्ट्र',
    city: 'सोलापूर',
    prospect: 'सोलापूर चादर व टॉवेल असोसिएशन',
    category: 'निर्यात व लॉजिस्टिक्स',
    requirement: 'मध्य पूर्वेसाठी ४० फूट कंटेनर एक्सपोर्ट क्लिअरन्स व सी फ्रेट.',
    estimatedValue: 1100000,
    actualValue: 1100000,
    status: 'Won',
    recipient: 'अमोल शिंदे (शिंदे फ्लीट)',
    date: '2024-03-12'
  }
];

export default function ReferralsTrackerPage() {
  const [referrals, setReferrals] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_referrals_tracker_data');
      return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
    } catch (e) {
      return INITIAL_REFERRALS;
    }
  });

  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Universal 7-Dimensional Filter State
  const [filters, setFilters] = useState({
    year: 'all',
    month: 'all',
    week: 'all',
    day: 'all',
    userId: 'all',
    state: 'all',
    city: 'all',
    status: 'all',
    search: ''
  });

  // Extract unique options from current data
  const filterOptions = useMemo(() => {
    const years = Array.from(new Set(referrals.map(r => r.year))).sort().reverse();
    const months = Array.from(new Set(referrals.map(r => r.month))).sort();
    const weeks = Array.from(new Set(referrals.map(r => r.week))).sort();
    const days = Array.from(new Set(referrals.map(r => r.day))).sort();
    const userIds = Array.from(new Set(referrals.map(r => r.userId))).sort();
    const states = Array.from(new Set(referrals.map(r => r.state))).sort();
    const cities = Array.from(new Set(referrals.map(r => r.city))).sort();

    return { years, months, weeks, days, userIds, states, cities };
  }, [referrals]);

  // Apply all 7 filters + status + search
  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      if (filters.year !== 'all' && r.year !== filters.year) return false;
      if (filters.month !== 'all' && r.month !== filters.month) return false;
      if (filters.week !== 'all' && r.week !== filters.week) return false;
      if (filters.day !== 'all' && r.day !== filters.day) return false;
      if (filters.userId !== 'all' && r.userId !== filters.userId) return false;
      if (filters.state !== 'all' && r.state !== filters.state) return false;
      if (filters.city !== 'all' && r.city !== filters.city) return false;
      if (filters.status !== 'all' && r.status.toLowerCase() !== filters.status.toLowerCase()) return false;

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const match =
          r.id.toLowerCase().includes(q) ||
          (r.prospect && r.prospect.toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.requirement && r.requirement.toLowerCase().includes(q)) ||
          (r.userName && r.userName.toLowerCase().includes(q)) ||
          (r.userId && r.userId.toLowerCase().includes(q)) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (r.recipient && r.recipient.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [referrals, filters]);

  // Real-time aggregates computed strictly from filtered results
  const metrics = useMemo(() => {
    const total = filteredReferrals.length;
    const won = filteredReferrals.filter(r => r.status === 'Won').length;
    const totalRevenue = filteredReferrals.reduce((sum, r) => {
      const val = r.status === 'Won' ? (Number(r.actualValue || r.estimatedValue) || 0) : 0;
      return sum + val;
    }, 0);
    const pipelineValue = filteredReferrals.reduce((sum, r) => sum + (Number(r.estimatedValue) || 0), 0);
    const avgTicket = total > 0 ? Math.round(pipelineValue / total) : 0;

    return { total, won, totalRevenue, pipelineValue, avgTicket };
  }, [filteredReferrals]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      year: 'all',
      month: 'all',
      week: 'all',
      day: 'all',
      userId: 'all',
      state: 'all',
      city: 'all',
      status: 'all',
      search: ''
    });
  };

  const handleStatusUpdate = (id, newStatus) => {
    const updated = referrals.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          actualValue: newStatus === 'Won' ? (r.actualValue || r.estimatedValue) : r.actualValue
        };
      }
      return r;
    });
    setReferrals(updated);
    try {
      localStorage.setItem('cm_referrals_tracker_data', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ['Year,Month,Week,Day,User ID,User Name,State,City,Referral ID,Prospect,Category,Estimated Value (INR),Actual Value (INR),Status,Recipient,Date'];
    const rows = filteredReferrals.map(r =>
      `"${r.year}","${r.month}","${r.week}","${r.day}","${r.userId}","${r.userName || ''}","${r.state}","${r.city}","${r.id}","${(r.prospect || '').replace(/"/g, '""')}","${(r.category || '').replace(/"/g, '""')}",${r.estimatedValue || 0},${r.actualValue || 0},"${r.status}","${(r.recipient || '').replace(/"/g, '""')}","${r.date || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `connect_maratha_referrals_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'all').length + (filters.search ? 1 : 0);

  return (
    <div style={{ background: '#FFFDF9', minHeight: 'calc(100vh - 100px)', padding: '32px 20px', fontFamily: "'Segoe UI', Roboto, sans-serif", color: '#431407' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Header Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #FED7AA',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFF7ED', padding: '4px 12px', borderRadius: '100px', border: '1px solid #FFEDD5', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🤝 बिझनेस संगम महा-अहवाल व ट्रॅकर
              </span>
              <span style={{ fontSize: '0.78rem', background: '#EA580C', color: '#FFF', padding: '1px 8px', borderRadius: '10px', fontWeight: 700 }}>
                7-Filter Enabled
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: '#7C2D12', margin: 0, letterSpacing: '-0.5px' }}>
              व्यवसाय संदर्भ व देवाणघेवाण महा-अहवाल
            </h1>
            <p style={{ margin: '6px 0 0', color: '#9A3412', fontSize: '0.95rem' }}>
              वर्ष, महिना, आठवडा, दिवस, युझर आयडी, राज्य व शहरासह सर्वसमावेशक व्यावसायिक लीड ट्रॅकिंग.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={exportCSV}
              style={{
                background: '#FFF7ED',
                color: '#C2410C',
                border: '1.5px solid #EA580C',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.1)'
              }}>
              📥 अहवाल एक्सपोर्ट (CSV)
            </button>

            <Link
              to="/referrals/create"
              style={{
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '0.92rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}>
              ➕ नवीन संदर्भ नोंदवा
            </Link>
          </div>
        </div>

        {/* Real-Time Aggregate KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #FED7AA', boxShadow: '0 2px 8px rgba(234,88,12,0.06)' }}>
            <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase' }}>एकूण फिल्टर केलेले संदर्भ</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C2410C', marginTop: '6px' }}>{metrics.total}</div>
            <div style={{ fontSize: '0.78rem', color: '#7C2D12', marginTop: '4px' }}>सर्व टप्प्यातील सक्रिय रेकॉर्ड्स</div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #FED7AA', boxShadow: '0 2px 8px rgba(234,88,12,0.06)' }}>
            <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase' }}>यशस्वी सौदे (Closed Won)</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EA580C', marginTop: '6px' }}>{metrics.won}</div>
            <div style={{ fontSize: '0.78rem', color: '#7C2D12', marginTop: '4px' }}>यशस्वी रूपांतरण दर: {metrics.total > 0 ? Math.round((metrics.won / metrics.total) * 100) : 0}%</div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #FED7AA', boxShadow: '0 2px 8px rgba(234,88,12,0.06)' }}>
            <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase' }}>यशस्वी उलाढाल मूल्य (Revenue)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9A3412', marginTop: '6px' }}>
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#7C2D12', marginTop: '4px' }}>पूर्ण झालेल्या सौद्यांचे उत्पन्न</div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #FED7AA', boxShadow: '0 2px 8px rgba(234,88,12,0.06)' }}>
            <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 700, textTransform: 'uppercase' }}>एकूण पायपलाईन मूल्य (Pipeline)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C2410C', marginTop: '6px' }}>
              ₹{metrics.pipelineValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#7C2D12', marginTop: '4px' }}>सरासरी तिकीट: ₹{metrics.avgTicket.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* 7-Dimensional Universal Filter Console */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '22px 24px',
          border: '1.5px solid #FDBA74',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C2D12' }}>🔍 ७-मितीय तपशीलवार फिल्टर्स (7-Dimensional Filters)</span>
              {activeFiltersCount > 0 && (
                <span style={{ background: '#FFEDD5', color: '#C2410C', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #FDBA74' }}>
                  {activeFiltersCount} फिल्टर्स सक्रिय
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  style={{
                    background: '#FFF7ED',
                    color: '#EA580C',
                    border: '1px solid #FDBA74',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  🔄 सर्व फिल्टर्स क्लिअर करा
                </button>
              )}

              {/* View Toggle */}
              <div style={{ display: 'inline-flex', background: '#FFF7ED', padding: '3px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    background: viewMode === 'table' ? '#EA580C' : 'transparent',
                    color: viewMode === 'table' ? '#FFFFFF' : '#9A3412',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  📊 सारणी अहवाल (Table)
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    background: viewMode === 'cards' ? '#EA580C' : 'transparent',
                    color: viewMode === 'cards' ? '#FFFFFF' : '#9A3412',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  🗂️ पायपलाईन कार्ड्स (Cards)
                </button>
              </div>
            </div>
          </div>

          {/* Filter Grid: 7 Dimensions + Search + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            
            {/* 1. Year */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                📅 वर्ष (Year)
              </label>
              <select
                value={filters.year}
                onChange={e => handleFilterChange('year', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व वर्षे (All)</option>
                {filterOptions.years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* 2. Month */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                📆 महिना (Month)
              </label>
              <select
                value={filters.month}
                onChange={e => handleFilterChange('month', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व महिने (All)</option>
                {filterOptions.months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 3. Week */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                🗓️ आठवडा (Week)
              </label>
              <select
                value={filters.week}
                onChange={e => handleFilterChange('week', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व आठवडे (All)</option>
                {filterOptions.weeks.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* 4. Day */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                ☀️ दिवस (Day)
              </label>
              <select
                value={filters.day}
                onChange={e => handleFilterChange('day', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व दिवस (All)</option>
                {filterOptions.days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 5. User ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                👤 युझर आयडी (User ID)
              </label>
              <select
                value={filters.userId}
                onChange={e => handleFilterChange('userId', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व सदस्य (All)</option>
                {filterOptions.userIds.map(uid => (
                  <option key={uid} value={uid}>{uid}</option>
                ))}
              </select>
            </div>

            {/* 6. State */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                🚩 राज्य (State)
              </label>
              <select
                value={filters.state}
                onChange={e => handleFilterChange('state', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व राज्ये (All)</option>
                {filterOptions.states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 7. City */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                🏙️ शहर (City)
              </label>
              <select
                value={filters.city}
                onChange={e => handleFilterChange('city', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व शहरे (All)</option>
                {filterOptions.cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status / Stage */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                🏷️ स्थिती (Status)
              </label>
              <select
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem', fontWeight: 600 }}>
                <option value="all">सर्व स्थिती (All)</option>
                <option value="New">New (नवीन)</option>
                <option value="Contacted">Contacted (संपर्क)</option>
                <option value="Qualified">Qualified (पात्र)</option>
                <option value="Proposal">Proposal (प्रस्ताव)</option>
                <option value="Won">Won (यशस्वी)</option>
              </select>
            </div>

            {/* Search Box */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', marginBottom: '4px' }}>
                🔎 शोध (Search Keyword / Lead / Category)
              </label>
              <input
                type="text"
                placeholder="ग्राहक नाव, श्रेणी, आवश्यकता किंवा युझर शोधा..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#431407', fontSize: '0.88rem' }}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.9rem', color: '#9A3412', fontWeight: 600 }}>
          <div>
            दर्शवित आहे: <strong>{filteredReferrals.length}</strong> नोंदी (एकूण {referrals.length} पैकी)
          </div>
          <div style={{ fontSize: '0.82rem', color: '#C2410C' }}>
            * सर्व नोंदी स्थानिकरित्या स्वयंचलित सुरक्षित राहतात व तात्काळ बदल स्वीकारतात.
          </div>
        </div>

        {/* TABULAR DETAILED REPORT VIEW */}
        {viewMode === 'table' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #FED7AA',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', borderBottom: '2px solid #FDBA74', color: '#7C2D12' }}>
                    <th style={{ padding: '14px 12px', fontWeight: 800 }}>वर्ष (Year)</th>
                    <th style={{ padding: '14px 10px', fontWeight: 800 }}>महिना (Month)</th>
                    <th style={{ padding: '14px 10px', fontWeight: 800 }}>आठवडा (Week)</th>
                    <th style={{ padding: '14px 10px', fontWeight: 800 }}>दिवस (Day)</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800 }}>युझर आयडी (User ID)</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800 }}>राज्य (State)</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800 }}>शहर (City)</th>
                    <th style={{ padding: '14px 14px', fontWeight: 800 }}>संदर्भ क्र. & ग्राहक</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800 }}>उद्योग श्रेणी</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800, textAlign: 'right' }}>अपेक्षित मूल्य</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800 }}>सद्यस्थिती</th>
                    <th style={{ padding: '14px 12px', fontWeight: 800, textAlign: 'center' }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan="12" style={{ padding: '48px', textAlign: 'center', color: '#9A3412', background: '#FFFDF9' }}>
                        निवडलेल्या निकषांनुसार कोणतेही व्यवसाय संदर्भ आढळले नाहीत.
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((r, idx) => (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: '1px solid #FED7AA',
                          background: idx % 2 === 0 ? '#FFFFFF' : '#FFFDF9',
                          transition: 'background 0.2s ease'
                        }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#C2410C' }}>{r.year}</td>
                        <td style={{ padding: '12px 10px', color: '#7C2D12' }}>{r.month}</td>
                        <td style={{ padding: '12px 10px', color: '#7C2D12' }}>{r.week}</td>
                        <td style={{ padding: '12px 10px', color: '#7C2D12' }}>{r.day}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#FFF7ED', color: '#C2410C', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, border: '1px solid #FED7AA', fontSize: '0.8rem' }}>
                            {r.userId}
                          </span>
                          <div style={{ fontSize: '0.74rem', color: '#9A3412', marginTop: '2px' }}>{r.userName}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#431407', fontWeight: 600 }}>{r.state}</td>
                        <td style={{ padding: '12px', color: '#431407', fontWeight: 600 }}>{r.city}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#7C2D12' }}>{r.prospect}</div>
                          <div style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 600 }}>{r.id}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.requirement}
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#431407' }}>{r.category}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#7C2D12' }}>
                          ₹{Number(r.estimatedValue || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            background: r.status === 'Won' ? '#FFEDD5' : '#FFF7ED',
                            color: r.status === 'Won' ? '#C2410C' : '#EA580C',
                            border: `1px solid ${r.status === 'Won' ? '#EA580C' : '#FDBA74'}`
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <select
                            value={r.status}
                            onChange={e => handleStatusUpdate(r.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #FDBA74',
                              background: '#FFF7ED',
                              color: '#C2410C',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Won">Won 🎉</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CARDS PIPELINE VIEW */}
        {viewMode === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {filteredReferrals.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', padding: '48px', textAlign: 'center', borderRadius: '16px', border: '1.5px dashed #FED7AA', color: '#9A3412' }}>
                निवडलेल्या निकषांनुसार कोणतेही संदर्भ उपलब्ध नाहीत.
              </div>
            ) : (
              filteredReferrals.map(ref => (
                <div
                  key={ref.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #FED7AA',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                  <div>
                    {/* Multi-Dimensional Tag Pill */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', background: '#FFF7ED', color: '#C2410C', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid #FED7AA' }}>
                        {ref.id}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#FFEDD5', color: '#7C2D12', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {ref.year} • {ref.month} • {ref.week} • D{ref.day}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#FFF7ED', color: '#EA580C', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        👤 {ref.userId}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#FFF7ED', color: '#9A3412', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        📍 {ref.city}, {ref.state}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#7C2D12', margin: '0 0 6px', fontWeight: 800 }}>
                      {ref.prospect}
                    </h3>
                    <p style={{ color: '#555', fontSize: '0.88rem', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {ref.requirement}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#9A3412', marginBottom: '12px' }}>
                      उद्योग श्रेणी: <strong>{ref.category}</strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #FED7AA', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#9A3412' }}>अपेक्षित मूल्य</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C2410C' }}>
                        ₹{Number(ref.estimatedValue || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        background: ref.status === 'Won' ? '#FFEDD5' : '#FFF7ED',
                        color: ref.status === 'Won' ? '#C2410C' : '#EA580C',
                        border: '1px solid #FDBA74'
                      }}>
                        {ref.status}
                      </span>

                      {ref.status !== 'Won' && (
                        <button
                          onClick={() => handleStatusUpdate(ref.id, 'Won')}
                          style={{
                            background: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}>
                          🎉 Won
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
