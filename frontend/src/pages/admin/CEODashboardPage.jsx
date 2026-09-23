import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const scopeProfiles = {
  maharashtra: {
    badge: 'EXECUTIVE OVERVIEW • MAHARASHTRA STATE',
    title: '📊 मराठा समाज व व्यवसाय संगम — राज्यस्तरीय CEO Dashboard',
    sub: 'एकूण ६ महसूल विभाग, ३६ जिल्हे, ३५८ तालुके व ३,२००+ शाखांचे एकत्रित नियंत्रण केंद्र',
    revenue: '₹ १८४.६ कोटी (Cr)',
    members: '२४,८२०',
    businesses: '८,४२१',
    mandals: '१८४',
    active: '१७,४२०',
    referrals: '३२,८४१',
    jobs: '४,२८०',
    events: '३२८',
    notice: 'सध्या आपण राज्य अध्यक्ष (महाराष्ट्र राज्य) म्हणून सर्व ३६ जिल्हे, ६ विभाग व १८४ व्यवसाय मंडळांचा एकत्रित डेटा पाहत आहात.'
  },
  pune_div: {
    badge: 'DIVISIONAL EXECUTIVE • PUNE DIVISION',
    title: '🏢 पुणे विभाग — विभागीय अध्यक्ष नियंत्रण केंद्र',
    sub: 'पुणे, सातारा, कोल्हापूर, सांगली, सोलापूर — ५ जिल्ह्यांचे थेट पर्यवेक्षण',
    revenue: '₹ ४८.२ कोटी (Cr)',
    members: '१२,४००',
    businesses: '३,९१०',
    mandals: '४२',
    active: '८,८५०',
    referrals: '१४,२९०',
    jobs: '१,८५०',
    events: '११२',
    notice: 'सध्या आपण विभागीय अध्यक्ष (पुणे विभाग) म्हणून पश्चिम महाराष्ट्रातील ५ जिल्ह्यांचा थेट डेटा पाहत आहात.'
  },
  sangli_dist: {
    badge: 'DISTRICT EXECUTIVE • SANGLI DISTRICT',
    title: '📍 सांगली जिल्हा — जिल्हा अध्यक्ष डॅशबोर्ड',
    sub: '१० तालुके, ४ व्यवसाय चॅप्टर्स, ११०+ शाखा व स्थानिक उपक्रम',
    revenue: '₹ १४.८ कोटी (Cr)',
    members: '३,२५०',
    businesses: '८९०',
    mandals: '१०',
    active: '२,३००',
    referrals: '४,१२०',
    jobs: '४९०',
    events: '३४',
    notice: 'सध्या आपण जिल्हा अध्यक्ष (सांगली जिल्हा) म्हणून जिल्ह्यातील सर्व शाखा व मंडळांचे काम पाहत आहात.'
  }
};

const CEO_DETAILED_MANDAL_REPORTS = [
  {
    id: 'MNDL-2026-001',
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '19',
    userId: 'ADM-04',
    leader: 'तानाजी विठ्ठलराव जाधव',
    name: 'पुणे – शिवनेरी व्यवसाय मंडळ',
    state: 'महाराष्ट्र',
    district: 'पुणे',
    city: 'पुणे',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 48,
    refs: '१,४२०',
    rev: '₹८.४ कोटी',
    revNumeric: 84000000,
    grade: 'A+ Elite',
    growth: '+१६.२%'
  },
  {
    id: 'MNDL-2026-002',
    year: '2026',
    month: '09',
    week: 'Week 38',
    day: '18',
    userId: 'CM-10292',
    leader: 'प्रवीण संभाजी भोसले',
    name: 'मुंबई – दादर व्यवसाय मंडळ',
    state: 'महाराष्ट्र',
    district: 'मुंबई उपनगर',
    city: 'मुंबई',
    division: 'कोकण विभाग',
    members: 45,
    refs: '१,२९०',
    rev: '₹९.१ कोटी',
    revNumeric: 91000000,
    grade: 'A+ Elite',
    growth: '+१८.४%'
  },
  {
    id: 'MNDL-2026-003',
    year: '2026',
    month: '09',
    week: 'Week 37',
    day: '12',
    userId: 'CM-10315',
    leader: 'अनिरुद्ध भालचंद्र पाटील',
    name: 'पिंपरी-चिंचवड औद्योगिक मंडळ',
    state: 'महाराष्ट्र',
    district: 'पुणे',
    city: 'पिंपरी-चिंचवड',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 55,
    refs: '१,८९०',
    rev: '₹१२.५ कोटी',
    revNumeric: 125000000,
    grade: 'A+ Platinum',
    growth: '+२१.०%'
  },
  {
    id: 'MNDL-2026-004',
    year: '2026',
    month: '08',
    week: 'Week 35',
    day: '28',
    userId: 'CM-10293',
    leader: 'आनंदराव विठ्ठल दिघे',
    name: 'ठाणे – आनंद दिघे व्यापार संगम',
    state: 'महाराष्ट्र',
    district: 'ठाणे',
    city: 'ठाणे',
    division: 'कोकण विभाग',
    members: 50,
    refs: '१,५४०',
    rev: '₹१०.८ कोटी',
    revNumeric: 108000000,
    grade: 'A+ Platinum',
    growth: '+१४.८%'
  },
  {
    id: 'MNDL-2026-005',
    year: '2026',
    month: '08',
    week: 'Week 32',
    day: '08',
    userId: 'CM-10295',
    leader: 'उदयराज बाळासाहेब सावंत',
    name: 'कोल्हापूर – शाहू महाराज व्यापार मंडळ',
    state: 'महाराष्ट्र',
    district: 'कोल्हापूर',
    city: 'कोल्हापूर',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 46,
    refs: '१,३५०',
    rev: '₹८.९ कोटी',
    revNumeric: 89000000,
    grade: 'A Grade',
    growth: '+१३.२%'
  },
  {
    id: 'MNDL-2026-006',
    year: '2026',
    month: '07',
    week: 'Week 28',
    day: '15',
    userId: 'CM-10294',
    leader: 'दिग्विजय यशवंत कदम',
    name: 'सातारा – क्रांतिसिंह नाना पाटील संगम',
    state: 'महाराष्ट्र',
    district: 'सातारा',
    city: 'सातारा',
    division: 'पश्चिम महाराष्ट्र विभाग',
    members: 42,
    refs: '१,१८०',
    rev: '₹७.२ कोटी',
    revNumeric: 72000000,
    grade: 'A Grade',
    growth: '+१२.०%'
  },
  {
    id: 'MNDL-2026-007',
    year: '2026',
    month: '06',
    week: 'Week 24',
    day: '19',
    userId: 'ADM-02',
    leader: 'तानाजी गायकवाड',
    name: 'नाशिक – गोदावरी कृषी औद्योगिक मंडळ',
    state: 'महाराष्ट्र',
    district: 'नाशिक',
    city: 'नाशिक',
    division: 'उत्तर महाराष्ट्र विभाग',
    members: 38,
    refs: '९८०',
    rev: '₹६.५ कोटी',
    revNumeric: 65000000,
    grade: 'B+ Gold',
    growth: '+११.५%'
  },
  {
    id: 'MNDL-2026-008',
    year: '2026',
    month: '05',
    week: 'Week 20',
    day: '14',
    userId: 'ADM-01',
    leader: 'दिग्विजय कदम (संभाजीनगर)',
    name: 'संभाजीनगर – देवगिरी ऑटो क्लस्टर',
    state: 'महाराष्ट्र',
    district: 'छत्रपती संभाजीनगर',
    city: 'छत्रपती संभाजीनगर',
    division: 'मराठवाडा विभाग',
    members: 36,
    refs: '८९०',
    rev: '₹५.८ कोटी',
    revNumeric: 58000000,
    grade: 'B+ Gold',
    growth: '+१०.२%'
  },
  {
    id: 'MNDL-2025-009',
    year: '2025',
    month: '11',
    week: 'Week 46',
    day: '15',
    userId: 'ADM-02',
    leader: 'विश्वासराव मोरे',
    name: 'नागपूर – दीक्षाभूमी व्यापार महासंघ',
    state: 'महाराष्ट्र',
    district: 'नागपूर',
    city: 'नागपूर',
    division: 'विदर्भ विभाग',
    members: 34,
    refs: '७६०',
    rev: '₹५.२ कोटी',
    revNumeric: 52000000,
    grade: 'B+ Gold',
    growth: '+९.८%'
  },
  {
    id: 'MNDL-2025-010',
    year: '2025',
    month: '09',
    week: 'Week 38',
    day: '19',
    userId: 'CM-10420',
    leader: 'धनंजय संभाजी भोसले',
    name: 'बेळगाव – सीमाभाग मराठी व्यापार परिषद',
    state: 'कर्नाटक (सीमाभाग)',
    district: 'बेळगाव',
    city: 'बेळगाव',
    division: 'सीमाभाग विभाग',
    members: 32,
    refs: '६८०',
    rev: '₹४.५ कोटी',
    revNumeric: 45000000,
    grade: 'B Grade',
    growth: '+८.४%'
  },
  {
    id: 'MNDL-2024-011',
    year: '2024',
    month: '12',
    week: 'Week 50',
    day: '20',
    userId: 'CM-10420',
    leader: 'धनंजय संभाजी भोसले',
    name: 'गोवा – कोकण किनारपट्टी व्यापार संगम',
    state: 'गोवा',
    district: 'उत्तर गोवा',
    city: 'पणजी',
    division: 'कोकण-गोवा विभाग',
    members: 28,
    refs: '५२०',
    rev: '₹३.८ कोटी',
    revNumeric: 38000000,
    grade: 'B Grade',
    growth: '+७.५%'
  }
];

export default function CEODashboardPage() {
  const [selectedRole, setSelectedRole] = useState('state_president');
  const [selectedArea, setSelectedArea] = useState('maharashtra');

  // 7-Dimensional Universal Filters
  const [filters, setFilters] = useState({
    year: 'all',
    month: 'all',
    week: 'all',
    day: 'all',
    userId: '',
    state: 'all',
    city: 'all',
    search: ''
  });

  const currentProfile = scopeProfiles[selectedArea] || scopeProfiles.maharashtra;

  // Filter evaluation
  const filteredReports = CEO_DETAILED_MANDAL_REPORTS.filter(r => {
    if (filters.year !== 'all' && r.year !== filters.year) return false;
    if (filters.month !== 'all' && r.month !== filters.month) return false;
    if (filters.week !== 'all' && r.week !== filters.week) return false;
    if (filters.day !== 'all' && r.day !== filters.day) return false;
    if (filters.state !== 'all' && r.state !== filters.state) return false;
    if (filters.city !== 'all' && r.city !== filters.city) return false;
    if (filters.userId && !r.userId.toLowerCase().includes(filters.userId.toLowerCase()) && !r.leader.toLowerCase().includes(filters.userId.toLowerCase())) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.district.toLowerCase().includes(q) || r.division.toLowerCase().includes(q) || r.leader.toLowerCase().includes(q);
    }
    return true;
  });

  const resetFilters = () => {
    setFilters({
      year: 'all',
      month: 'all',
      week: 'all',
      day: 'all',
      userId: '',
      state: 'all',
      city: 'all',
      search: ''
    });
  };

  const exportCSV = () => {
    const headers = ['अहवाल क्र.', 'वर्ष (Year)', 'महिना (Month)', 'आठवडा (Week)', 'दिवस (Day)', 'युझर आयडी', 'मंडळ अध्यक्ष', 'मंडळाचे नाव', 'राज्य (State)', 'शहर (City)', 'विभाग', 'सदस्य संख्या', 'संदर्भ', 'महसूल (Turnover)', 'कामगिरी दर्जा'];
    const rows = filteredReports.map(r => [
      r.id, r.year, r.month, r.week, r.day, r.userId, `"${r.leader}"`, `"${r.name}"`, `"${r.state}"`, `"${r.city}"`, `"${r.division}"`, r.members, `"${r.refs}"`, `"${r.rev}"`, `"${r.grade}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CEO_Dashboard_Report_${filters.year}_${filters.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: '60px', color: '#431407' }}>
      
      {/* TOP ROLE SWITCHER BAR (WHITE & ORANGE ONLY) */}
      <div style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', padding: '12px 24px' }}>
        <div className="wrap" style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🦅</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                CONNECT MARATHA — CEO MACRO ENTERPRISE CRM
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 600 }}>
                राज्यस्तरीय व्यावसायिक व संघटनात्मक नियंत्रण कक्ष (White & Orange Enterprise Suite)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: '#c2410c', color: '#fff', padding: '4px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800 }}>
              🦅 अधिकृत CEO भूमिका
            </span>
            <Link to="/crm" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              🔄 CRM भूमिका पोर्टल
            </Link>
            <Link to="/admin" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              👑 सुपर ॲडमिन
            </Link>
            <Link to="/crm/district" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              📍 जिल्हा समन्वयक
            </Link>
            <Link to="/crm/chapter" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              💼 चॅप्टर अध्यक्ष
            </Link>
            <Link to="/crm/helpdesk" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FFFFFF', color: '#ea580c', border: '1.5px solid #ea580c', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              🩺 समाज साहाय्यता
            </Link>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 0' }}>
        
        {/* Breadcrumb / Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Link to="/" style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 700 }}>🏠 होम</Link>
            <span style={{ margin: '0 8px', color: '#fed7aa' }}>›</span>
            <Link to="/admin" style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 700 }}>प्रशासकीय नियंत्रण</Link>
            <span style={{ margin: '0 8px', color: '#fed7aa' }}>›</span>
            <span style={{ color: '#7c2d12', fontWeight: 800 }}>कार्याध्यक्ष (CEO) डॅशबोर्ड व ७-आयामी अहवाल</span>
          </div>
          <Link to="/reports" style={{ padding: '7px 16px', background: '#ea580c', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none', fontWeight: 800, fontSize: '0.84rem' }}>
            📈 केंद्रीय महा-अहवाल केंद्र उघडा →
          </Link>
        </div>

        {/* Scope Control Bar */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #ea580c',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ⚡ RBAC + Organizational Scope Engine (अधिकार क्षेत्र नियंत्रण)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c2d12', marginTop: '2px', fontFamily: 'Baloo 2' }}>
                सक्रिय भूमिका व अधिकार क्षेत्र (Active Role + Scope Engine)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>भूमिका (Role)</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #fed7aa', background: '#fff7ed', color: '#431407', fontWeight: 700, fontSize: '0.88rem' }}
                >
                  <option value="state_president">🚩 राज्य अध्यक्ष (State President)</option>
                  <option value="divisional_president">🏢 विभागीय अध्यक्ष (Divisional President)</option>
                  <option value="district_president">📍 जिल्हा अध्यक्ष (District President)</option>
                  <option value="taluka_president">🌾 तालुका अध्यक्ष (Taluka President)</option>
                  <option value="chapter_president">💼 चॅप्टर अध्यक्ष (Chapter President)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9a3412', display: 'block', marginBottom: '3px' }}>अधिकार क्षेत्र (Scope)</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #fed7aa', background: '#fff7ed', color: '#431407', fontWeight: 700, fontSize: '0.88rem' }}
                >
                  <option value="maharashtra">महाराष्ट्र राज्य (Maharashtra State)</option>
                  <option value="pune_div">पुणे विभाग (Pune Division)</option>
                  <option value="sangli_dist">सांगली जिल्हा (Sangli District)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.88rem', color: '#9a3412', borderTop: '1px dashed #fed7aa', paddingTop: '10px', fontWeight: 600 }}>
            👁️ <strong>थेट माहिती:</strong> {currentProfile.notice}
          </div>
        </div>

        {/* Macro Summary Header (White and Orange Theme) */}
        <div style={{
          background: '#fff7ed',
          border: '2px solid #ea580c',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{
                background: '#ea580c',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                {currentProfile.badge}
              </span>
              <h1 style={{ color: '#7c2d12', margin: '12px 0 6px', fontFamily: 'Baloo 2', fontSize: '1.9rem' }}>
                {currentProfile.title}
              </h1>
              <p style={{ color: '#9a3412', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                {currentProfile.sub}
              </p>
            </div>

            <div style={{ textAlign: 'right', background: '#FFFFFF', border: '2px solid #ea580c', padding: '16px 24px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.82rem', color: '#9a3412', fontWeight: 700 }}>अधिकार क्षेत्रातील एकूण व्यवसाय उलाढाल</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ea580c', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>
                {currentProfile.revenue}
              </div>
            </div>
          </div>

          {/* 7 Macro KPIs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '14px',
            marginTop: '24px'
          }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>नोंदणीकृत सदस्य</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.members}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>↑ १२% वाढ</small>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>नोंदणीकृत व्यवसाय</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.businesses}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>↑ ९% वाढ</small>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>सक्रिय व्यवसाय मंडळे</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.mandals}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>३६ जिल्ह्यांत</small>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>सक्रिय सदस्य</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.active}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>७०% सहभाग</small>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>एकूण संदर्भ (Referrals)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.referrals}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>८८% यशस्वी</small>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>रोजगार संधी (Jobs)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.jobs}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>भरती सुरू</small>
            </div>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #fed7aa', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 700 }}>आयोजित कार्यक्रम</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.events}</div>
              <small style={{ color: '#c2410c', fontWeight: 800 }}>राज्यव्यापी</small>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7-DIMENSIONAL UNIVERSAL FILTER BAR (WHITE & ORANGE)                       */}
        {/* ========================================================================= */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #ea580c',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed #fed7aa', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔍</span>
              <strong style={{ color: '#7c2d12', fontSize: '0.96rem' }}>
                CEO बहुआयामी अहवाल फिल्टर्स (Year, Month, Week, Day, User ID, State, City):
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={resetFilters}
                style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ea580c', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
              >
                🔄 रीसेट करा
              </button>
              <button
                type="button"
                onClick={exportCSV}
                style={{ background: '#ea580c', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
              >
                📥 CSV एक्सपोर्ट
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>📅 वर्ष (Year)</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="all">सर्व वर्षे</option>
                <option value="2026">२०२६</option>
                <option value="2025">२०२५</option>
                <option value="2024">२०२४</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>🗓️ महिना (Month)</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="all">सर्व महिने</option>
                <option value="09">०९ - सप्टेंबर</option>
                <option value="08">०८ - ऑगस्ट</option>
                <option value="07">०७ - जुलै</option>
                <option value="06">०६ - जून</option>
                <option value="05">०५ - मे</option>
                <option value="11">११ - नोव्हेंबर</option>
                <option value="12">१२ - डिसेंबर</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>📆 आठवडा (Week)</label>
              <select
                value={filters.week}
                onChange={(e) => setFilters({ ...filters, week: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="all">सर्व आठवडे</option>
                <option value="Week 38">Week 38</option>
                <option value="Week 37">Week 37</option>
                <option value="Week 35">Week 35</option>
                <option value="Week 32">Week 32</option>
                <option value="Week 28">Week 28</option>
                <option value="Week 24">Week 24</option>
                <option value="Week 20">Week 20</option>
                <option value="Week 46">Week 46</option>
                <option value="Week 50">Week 50</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>☀️ दिवस (Day)</label>
              <select
                value={filters.day}
                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="all">सर्व दिवस</option>
                {['19', '18', '15', '14', '12', '08', '20', '28'].map(d => (
                  <option key={d} value={d}>तारीख {d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>👤 युझर आयडी (User ID)</label>
              <input
                type="text"
                placeholder="CM / ADM आयडी..."
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>🚩 राज्य (State)</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="all">सर्व राज्ये</option>
                <option value="महाराष्ट्र">महाराष्ट्र</option>
                <option value="कर्नाटक (सीमाभाग)">कर्नाटक (सीमाभाग)</option>
                <option value="गोवा">गोवा</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', marginBottom: '3px' }}>🏙️ शहर (City)</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '7px', color: '#431407', fontSize: '0.84rem', fontWeight: 700 }}
              >
                <option value="all">सर्व शहरे</option>
                <option value="पुणे">पुणे</option>
                <option value="मुंबई">मुंबई</option>
                <option value="पिंपरी-चिंचवड">पिंपरी-चिंचवड</option>
                <option value="ठाणे">ठाणे</option>
                <option value="कोल्हापूर">कोल्हापूर</option>
                <option value="सातारा">सातारा</option>
                <option value="नाशिक">नाशिक</option>
                <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
                <option value="नागपूर">नागपूर</option>
                <option value="बेळगाव">बेळगाव</option>
                <option value="पणजी">पणजी</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="🔎 मंडळाचे नाव, विभाग, किंवा जिल्हा शोधा..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', color: '#431407', fontSize: '0.86rem', fontWeight: 600 }}
          />
        </div>

        {/* Detailed Formatted Top Mandals & Macro Report Table */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', border: '2px solid #fed7aa', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Baloo 2', color: '#7c2d12', fontSize: '1.35rem' }}>
                🏆 तपशीलवार व्यवसाय मंडळे व महसूल महा-अहवाल (Mandal Performance Ledger)
              </h3>
              <p style={{ margin: '4px 0 0', color: '#9a3412', fontSize: '0.86rem', fontWeight: 600 }}>
                वर्ष, महिना, आठवडा, दिवस, युझर आयडी, राज्य व शहर वर्गीकरणानुसार उच्च कामगिरी अहवाल
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', background: '#fff7ed', padding: '4px 12px', borderRadius: '12px', border: '1px solid #ea580c' }}>
              फिल्टर निकाल: {filteredReports.length} मंडळे
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#9a3412' }}>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>अहवाल क्र.</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>वर्ष (Year)</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>महिना (Month)</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>आठवडा (Week)</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>दिवस (Day)</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>युझर आयडी व प्रमुख</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>राज्य (State)</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>शहर / जिल्हा</th>
                  <th style={{ padding: '12px 14px' }}>मंडळाचे नाव व विभाग</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>सदस्य संख्या</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>संदर्भ देवाणघेवाण</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>व्युत्पन्न महसूल</th>
                  <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>कामगिरी दर्जा</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ padding: '40px', textAlign: 'center', color: '#9a3412' }}>
                      निवडलेल्या ७ फिल्टर्सनुसार कोणतेही मंडळ आढळले नाही. कृपया फिल्टर्स रीसेट करा.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c', whiteSpace: 'nowrap' }}>{m.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>{m.year}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#9a3412' }}>{m.month}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7c2d12' }}>{m.week}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>तारीख {m.day}</td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.78rem' }}>{m.userId}</span>
                        <div style={{ fontWeight: 700, color: '#7c2d12' }}>{m.leader}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#431407', fontWeight: 700 }}>{m.state}</td>
                      <td style={{ padding: '12px 14px', color: '#7c2d12', fontWeight: 700 }}>{m.city}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <strong style={{ color: '#431407' }}>{m.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#9a3412' }}>{m.division}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7c2d12' }}>{m.members} सदस्य</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c' }}>{m.refs}</td>
                      <td style={{ padding: '12px 14px', color: '#ea580c', fontWeight: 900, whiteSpace: 'nowrap', fontSize: '0.92rem' }}>
                        {m.rev}
                      </td>
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
                          {m.grade} ({m.growth})
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
