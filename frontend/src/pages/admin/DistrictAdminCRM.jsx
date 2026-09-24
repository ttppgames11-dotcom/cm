import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DISTRICT_DATA = {
  pune: {
    name: 'पुणे जिल्हा (Pune)',
    coordinator: 'आनंदराव देशमुख (जिल्हा समन्वयक)',
    contact: '+91 98765 00022',
    totalMembers: '१२,४५०',
    verifiedBiz: '३,१८०',
    pendingVerifications: 18,
    bloodDonors: '१,८२०',
    mandalsCount: 38,
    talukas: ['हवेली', 'पुणे शहर', 'बारामती', 'शिरूर', 'जुन्नर', 'मावळ', 'खेड'],
    talukaStats: [
      { taluka: 'हवेली', members: '३,४२०', biz: '९२०', donors: '४८०', mandals: 11 },
      { taluka: 'पुणे शहर', members: '४,१५०', biz: '१,२४०', donors: '६५०', mandals: 14 },
      { taluka: 'बारामती', members: '१,८५०', biz: '३९०', donors: '२८०', mandals: 5 },
      { taluka: 'शिरूर', members: '१,१२०', biz: '२१०', donors: '१६०', mandals: 3 },
      { taluka: 'जुन्नर', members: '९८०', biz: '१६०', donors: '१३०', mandals: 2 },
      { taluka: 'मावळ', members: '५३०', biz: '१४०', donors: '७०', mandals: 2 },
      { taluka: 'खेड', members: '४००', biz: '१२०', donors: '५०', mandals: 1 }
    ],
    mandals: [
      { id: 'M-PN-01', name: 'पुणे – शिवनेरी व्यवसाय मंडळ', taluka: 'हवेली / शिवाजीनगर', president: 'राजेंद्र मोहिते', members: 48, meetDay: 'दर बुधवारी स. ७:३०', venue: 'हॉटेल प्राइड, पुणे' },
      { id: 'M-PN-02', name: 'पिंपरी-चिंचवड औद्योगिक संगम', taluka: 'हवेली / PCMC', president: 'सचिन जगताप', members: 55, meetDay: 'दर शुक्रवारी स. ७:४५', venue: 'ऑटो क्लस्टर, चिंचवड' },
      { id: 'M-PN-03', name: 'बारामती ॲग्रो-बिझनेस फोरम', taluka: 'बारामती', president: 'सुप्रिया साळुंखे', members: 36, meetDay: 'दर मंगळवारी स. ८:००', venue: 'कृषी विज्ञान केंद्र हॉल' },
      { id: 'M-PN-04', name: 'शिरूर MIDC मराठा उद्योजक मंडळ', taluka: 'शिरूर', president: 'दिलीप तांबडे', members: 32, meetDay: 'दर गुरुवारी स. ८:३०', venue: 'MIDC असोसिएशन हॉल' }
    ]
  },
  satara: {
    name: 'सातारा जिल्हा (Satara)',
    coordinator: 'विक्रमसिंह भोसले (जिल्हा समन्वयक)',
    contact: '+91 98220 11223',
    totalMembers: '८,६२०',
    verifiedBiz: '१,४२०',
    pendingVerifications: 9,
    bloodDonors: '१,२४०',
    mandalsCount: 22,
    talukas: ['सातारा', 'कराड', 'वाई', 'पाटण', 'जावळी', 'फलटण'],
    talukaStats: [
      { taluka: 'सातारा', members: '३,१००', biz: '५२०', donors: '४५०', mandals: 8 },
      { taluka: 'कराड', members: '२,६५०', biz: '४६०', donors: '३९०', mandals: 7 },
      { taluka: 'वाई', members: '१,०५०', biz: '१६०', donors: '१६०', mandals: 3 },
      { taluka: 'फलटण', members: '९८०', biz: '१४०', donors: '१३०', mandals: 2 },
      { taluka: 'पाटण', members: '४८०', biz: '८०', donors: '६०', mandals: 1 },
      { taluka: 'जावळी', members: '३६०', biz: '६०', donors: '५०', mandals: 1 }
    ],
    mandals: [
      { id: 'M-ST-01', name: 'सातारा अजिंक्यतारा व्यापारी मंडळ', taluka: 'सातारा', president: 'प्रशांत कदम', members: 42, meetDay: 'दर गुरुवारी स. ८:००', venue: 'हॉटेल मराठा पॅलेस' },
      { id: 'M-ST-02', name: 'कराड कृष्णा-कोयना संगम मंडळ', taluka: 'कराड', president: 'दिग्विजय कदम', members: 38, meetDay: 'दर बुधवारी स. ७:३०', venue: 'कराड क्लब ऑडिटोरियम' }
    ]
  },
  kolhapur: {
    name: 'कोल्हापूर जिल्हा (Kolhapur)',
    coordinator: 'संजयराव पाटील (जिल्हा समन्वयक)',
    contact: '+91 98230 44556',
    totalMembers: '९,८४०',
    verifiedBiz: '१,९५०',
    pendingVerifications: 12,
    bloodDonors: '१,५६०',
    mandalsCount: 28,
    talukas: ['करवीर', 'हातकणंगले', 'शिरोळ', 'राधानगरी', 'कागल', 'पन्हाळा'],
    talukaStats: [
      { taluka: 'करवीर', members: '३,८००', biz: '८१०', donors: '६२०', mandals: 12 },
      { taluka: 'हातकणंगले', members: '२,६००', biz: '५३०', donors: '४२०', mandals: 7 },
      { taluka: 'कागल', members: '१,२००', biz: '२४०', donors: '२१०', mandals: 4 },
      { taluka: 'शिरोळ', members: '१,१००', biz: '२१०', donors: '१६०', mandals: 3 },
      { taluka: 'पन्हाळा', members: '६००', biz: '९०', donors: '८०', mandals: 1 },
      { taluka: 'राधानगरी', members: '५४०', biz: '७०', donors: '७०', mandals: 1 }
    ],
    mandals: [
      { id: 'M-KL-01', name: 'कोल्हापूर राजर्षी शाहू उद्योजक मंडळ', taluka: 'करवीर', president: 'उदयराज सावंत', members: 46, meetDay: 'दर बुधवारी स. ७:३०', venue: 'हॉटेल सयाजी, कोल्हापूर' },
      { id: 'M-KL-02', name: 'इचलकरंजी वस्त्रोद्योग मंडळ', taluka: 'हातकणंगले', president: 'महेश घोरपडे', members: 40, meetDay: 'दर शुक्रवारी स. ८:००', venue: 'टेक्सटाईल हॉल' }
    ]
  },
  sangli: {
    name: 'सांगली जिल्हा (Sangli)',
    coordinator: 'दिलीपराव मोहिते (जिल्हा समन्वयक)',
    contact: '+91 98233 77889',
    totalMembers: '६,७००',
    verifiedBiz: '१,१००',
    pendingVerifications: 6,
    bloodDonors: '८९०',
    mandalsCount: 16,
    talukas: ['मिरज', 'तासगाव', 'वाळवा', 'शिराळा', 'खानापूर'],
    talukaStats: [
      { taluka: 'मिरज', members: '२,८००', biz: '५१०', donors: '३९०', mandals: 7 },
      { taluka: 'वाळवा', members: '१,६००', biz: '२८०', donors: '२२०', mandals: 4 },
      { taluka: 'तासगाव', members: '१,१५०', biz: '१६०', donors: '१४०', mandals: 3 },
      { taluka: 'शिराळा', members: '६००', biz: '८०', donors: '८०', mandals: 1 },
      { taluka: 'खानापूर', members: '५५०', biz: '७०', donors: '६०', mandals: 1 }
    ],
    mandals: [
      { id: 'M-SG-01', name: 'सांगली-मिरज कृषी व्यापार संगम', taluka: 'मिरज', president: 'अमित पवार', members: 35, meetDay: 'दर मंगळवारी स. ८:००', venue: 'मर्चंट्स असोसिएशन हॉल' }
    ]
  }
};

const INITIAL_MEMBERS = [
  { id: 'M-10291', name: 'तानाजी विठ्ठलराव जाधव', taluka: 'हवेली', district: 'pune', profession: 'शेतीमाल प्रक्रिया व निर्यात', applyDate: '१९ सप्टें २०२६', status: 'प्रलंबित', idCardType: 'Aadhaar + Voting' },
  { id: 'M-10292', name: 'प्रवीण संभाजी जगताप', taluka: 'पुणे शहर', district: 'pune', profession: 'सिव्हिल कॉन्ट्रॅक्टर', applyDate: '१९ सप्टें २०२६', status: 'प्रलंबित', idCardType: 'Aadhaar' },
  { id: 'M-10293', name: 'सुप्रिया सचिन साळुंखे', taluka: 'बारामती', district: 'pune', profession: 'महिला बचतगट प्रमुख व केटरिंग', applyDate: '१८ सप्टें २०२६', status: 'प्रलंबित', idCardType: 'Aadhaar + PAN' },
  { id: 'M-10294', name: 'दिग्विजय यशवंत कदम', taluka: 'कराड', district: 'satara', profession: 'ट्रान्सपोर्ट व लॉजिस्टिक', applyDate: '१८ सप्टें २०२६', status: 'प्रलंबित', idCardType: 'Aadhaar' },
  { id: 'M-10295', name: 'उदयराज बाळासाहेब सावंत', taluka: 'करवीर', district: 'kolhapur', profession: 'ऑटोमोबाईल सर्व्हिस सेंटर', applyDate: '१७ सप्टें २०२६', status: 'प्रलंबित', idCardType: 'Aadhaar' },
  { id: 'M-10296', name: 'अमित विश्वासराव पवार', taluka: 'मिरज', district: 'sangli', profession: 'द्राक्ष बागायतदार व कोल्ड स्टोरेज', applyDate: '१६ सप्टें २०२६', status: 'प्रलंबित', idCardType: 'Aadhaar + 7/12' }
];

const INITIAL_GRIEVANCES = [
  { id: 'GRV-01', complainant: 'विक्रम जगदाळे (हवेली)', category: 'डिजिटल कार्ड दुरुस्ती', issue: 'कार्डवरील नाव व जन्मतारखेत चूक दुरुस्त करणेबाबत', date: '१८ सप्टें २०२६', status: 'प्रलंबित' },
  { id: 'GRV-02', complainant: 'सुनील कदम (बारामती)', category: 'व्यवसाय नोंदणी मंजुरी', issue: 'ॲग्रो प्रोसेसिंग फर्मची डिरेक्टरी व्हेरिफिकेशन प्रलंबित', date: '१७ सप्टें २०२६', status: 'तपासणी सुरू' },
  { id: 'GRV-03', complainant: 'रोहित मोहिते (पुणे शहर)', category: 'रक्तपेढी स्वयंसेवक संपर्क', issue: 'हवेली तालुक्यात नवीन १० स्वयंसेवकांची नोंदणी यादी', date: '१६ सप्टें २०२६', status: 'निवारण झाले' }
];

export default function DistrictAdminCRM() {
  const [selectedDistrict, setSelectedDistrict] = useState('pune');
  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc', 'mandals', 'stats', 'grievances'
  const [memberList, setMemberList] = useState(INITIAL_MEMBERS);
  const [grievances, setGrievances] = useState(INITIAL_GRIEVANCES);
  const [searchTerm, setSearchTerm] = useState('');
  const [talukaFilter, setTalukaFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const districtInfo = DISTRICT_DATA[selectedDistrict] || DISTRICT_DATA.pune;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = (id, name) => {
    setMemberList(prev => prev.map(m => m.id === id ? { ...m, status: 'सत्यापित (Approved)' } : m));
    showToast(`✓ सदस्य '${name}' यांचे डिजिटल ओळखपत्र मंजूर झाले आहे!`);
  };

  const handleReject = (id, name) => {
    setMemberList(prev => prev.map(m => m.id === id ? { ...m, status: 'नाकारले (Rejected)' } : m));
    showToast(`✕ अर्ज #${id} नाकारण्यात आला.`);
  };

  const handleResolveGrievance = (id) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: 'निवारण झाले' } : g));
    showToast(`✓ तक्रार #${id} निवारण पूर्ण झाले.`);
  };

  const filteredMembers = memberList.filter(m => {
    const matchDistrict = m.district === selectedDistrict;
    const matchTaluka = talukaFilter === 'all' || m.taluka === talukaFilter;
    const matchSearch = searchTerm === '' ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDistrict && matchTaluka && matchSearch;
  });

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#431407',
          color: '#FED7AA',
          border: '1px solid #EA580C',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          zIndex: 9999,
          fontWeight: 600
        }}>
          {toastMessage}
        </div>
      )}

      {/* TOP ISOLATED HEADER BAR */}
      <div style={{ background: '#FFFFFF', color: '#1E293B', padding: '12px 24px', borderBottom: '1.5px solid #FED7AA' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>📍</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                CONNECT MARATHA — जिल्हा समन्वयक CRM
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#7C2D12' }}>
                स्वतंत्र जिल्हा प्रशासन व सदस्य पडताळणी नियंत्रण कक्ष (District Head CRM)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#EA580C', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.74rem', fontWeight: 800 }}>
              📍 अधिकृत जिल्हा भूमिका
            </span>
            <Link
              to="/crm"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: '#FFF7ED',
                color: '#EA580C',
                border: '1px solid #FED7AA',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              🔄 CRM भूमिका पोर्टल
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px' }}>
        
        {/* DISTRICT HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #EA580C, #D97706, #C2410C)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
              📍 DISTRICT COORDINATOR DASHBOARD
            </span>
            <h1 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              {districtInfo.name} — जिल्हा प्रशासन नियंत्रण केंद्र
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9 }}>
              समन्वयक: <strong>{districtInfo.coordinator}</strong> • संपर्क: {districtInfo.contact} • तालुक्यातील सर्व शाखा व पडताळण्या
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFEDD5' }}>जिल्हा बदला:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setTalukaFilter('all');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="pune">पुणे (Pune)</option>
              <option value="satara">सातारा (Satara)</option>
              <option value="kolhapur">कोल्हापूर (Kolhapur)</option>
              <option value="sangli">सांगली (Sangli)</option>
            </select>
          </div>
        </div>

        {/* 4 TOP DISTRICT KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>जिल्ह्यातील एकूण सदस्य</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0', fontFamily: 'Baloo 2' }}>{districtInfo.totalMembers}</div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>↑ ८.४% मागील महिन्यापेक्षा</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(234,88,12,0.05)' }}>
            <div style={{ fontSize: '0.82rem', color: '#7C2D12', fontWeight: 600 }}>नोंदणीकृत व्यवसाय (Businesses)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EA580C', margin: '4px 0', fontFamily: 'Baloo 2' }}>{districtInfo.verifiedBiz}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{districtInfo.mandalsCount} सक्रिय व्यवसाय मंडळे</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>प्रलंबित ओळखपत्र पडताळण्या</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', margin: '4px 0', fontFamily: 'Baloo 2' }}>{districtInfo.pendingVerifications}</div>
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>तातडीने मंजुरी आवश्यक</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>सक्रिय रक्तदाते स्वयंसेवक</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e11d48', margin: '4px 0', fontFamily: 'Baloo 2' }}>{districtInfo.bloodDonors}</div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>२४x७ आपत्कालीन नेटवर्क</div>
          </div>
        </div>

        {/* DISTRICT MODULE TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #FED7AA', marginBottom: '20px', overflowX: 'auto' }}>
          {[
            { id: 'kyc', label: '📋 ओळखपत्र पडताळणी कक्ष (KYC Queue)', count: filteredMembers.length },
            { id: 'mandals', label: '🏢 व्यवसाय मंडळे व शाखा (Mandals)', count: districtInfo.mandals.length },
            { id: 'stats', label: '📊 तालुकानिहाय सांख्यिकी (Taluka Stats)' },
            { id: 'grievances', label: '📢 तक्रार व साहाय्य निवारण (Grievance)', count: grievances.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#EA580C' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#7C2D12',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#FFEDD5',
                  color: activeTab === tab.id ? '#fff' : '#C2410C',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: KYC VERIFICATION QUEUE */}
        {activeTab === 'kyc' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                  📋 नवीन सदस्य पडताळणी कक्ष (Verification Queue)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  {districtInfo.name} मधील नवीन अर्जदारांच्या कागदपत्रांची पडताळणी करून त्यांना अधिकृत डिजिटल कार्ड जारी करा.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={talukaFilter}
                  onChange={(e) => setTalukaFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                >
                  <option value="all">सर्व तालुके</option>
                  {districtInfo.talukas.map(t => (
                    <option key={t} value={t}>{t} तालुका</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="🔎 नाव, ID किंवा व्यवसाय शोधा..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', minWidth: '220px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '12px 14px' }}>सदस्य आयडी</th>
                    <th style={{ padding: '12px 14px' }}>पूर्ण नाव</th>
                    <th style={{ padding: '12px 14px' }}>तालुका</th>
                    <th style={{ padding: '12px 14px' }}>व्यवसाय / पेशा</th>
                    <th style={{ padding: '12px 14px' }}>कागदपत्रे</th>
                    <th style={{ padding: '12px 14px' }}>अर्ज दिनांक</th>
                    <th style={{ padding: '12px 14px' }}>स्थिती</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        या तालुक्यात/शोधामध्ये प्रलंबित अर्ज सापडले नाहीत.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#EA580C' }}>{m.id}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{m.taluka}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{m.profession}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            📄 {m.idCardType}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.82rem' }}>{m.applyDate}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: m.status.includes('सत्यापित') ? '#dcfce7' : m.status.includes('नाकारले') ? '#fee2e2' : '#fef3c7',
                            color: m.status.includes('सत्यापित') ? '#166534' : m.status.includes('नाकारले') ? '#991b1b' : '#92400e'
                          }}>
                            {m.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {m.status === 'प्रलंबित' ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleApprove(m.id, m.name)}
                                style={{ padding: '5px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✓ मंजूर करा
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(m.id, m.name)}
                                style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✕ नाकारा
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>पूर्ण झाले</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DISTRICT MANDALS & CHAPTERS */}
        {activeTab === 'mandals' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              🏢 {districtInfo.name} अंतर्गत सक्रिय व्यवसाय मंडळे व चॅप्टर्स
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              जिल्ह्यातील स्थानिक उद्योजक संघ, साप्ताहिक संगम बैठका आणि चॅप्टर पदाधिकाऱ्यांचा तपशील.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {districtInfo.mandals.map((m) => (
                <div key={m.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#C2410C', fontFamily: 'Baloo 2' }}>{m.name}</h4>
                    <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>{m.id}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>📍 तालुका/परिसर:</strong> {m.taluka}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>👔 अध्यक्ष:</strong> {m.president} • <strong>सदस्य:</strong> {m.members} उद्योजक
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>⏰ संगम वेळ:</strong> {m.meetDay}
                  </div>
                  <div style={{ fontSize: '0.80rem', color: '#64748b' }}>
                    <strong>🏢 ठिकाण:</strong> {m.venue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TALUKA STATS */}
        {activeTab === 'stats' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              📊 {districtInfo.name} तालुकानिहाय प्रगती अहवाल
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              प्रत्येक तालुक्यातील सदस्य नोंदणी, व्यावसायिक संस्था, सक्रिय रक्तदाते आणि कार्यरत व्यवसाय मंडळांची आकडेवारी.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>तालुका</th>
                  <th style={{ padding: '12px 14px' }}>एकूण सदस्य</th>
                  <th style={{ padding: '12px 14px' }}>नोंदणीकृत व्यवसाय</th>
                  <th style={{ padding: '12px 14px' }}>रक्तदाते स्वयंसेवक</th>
                  <th style={{ padding: '12px 14px' }}>सक्रिय मंडळे</th>
                </tr>
              </thead>
              <tbody>
                {districtInfo.talukaStats.map((ts, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{ts.taluka}</td>
                    <td style={{ padding: '12px 14px', color: '#EA580C', fontWeight: 600 }}>{ts.members}</td>
                    <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 600 }}>{ts.biz}</td>
                    <td style={{ padding: '12px 14px', color: '#e11d48', fontWeight: 600 }}>{ts.donors}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{ts.mandals} शाखा</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: GRIEVANCES */}
        {activeTab === 'grievances' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              📢 {districtInfo.name} स्थानिक तक्रार व साहाय्य निवारण
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              जिल्ह्यातील सदस्यांकडून प्राप्त झालेल्या तक्रारी व दुरुस्ती अर्जांवर त्वरित कार्यवाही करा.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>तक्रार क्र.</th>
                  <th style={{ padding: '12px 14px' }}>अर्जदार / तालुका</th>
                  <th style={{ padding: '12px 14px' }}>विषय / श्रेणी</th>
                  <th style={{ padding: '12px 14px' }}>तपशील</th>
                  <th style={{ padding: '12px 14px' }}>दिनांक</th>
                  <th style={{ padding: '12px 14px' }}>स्थिती</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#EA580C' }}>{g.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{g.complainant}</td>
                    <td style={{ padding: '12px 14px', color: '#C2410C' }}>{g.category}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{g.issue}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.82rem' }}>{g.date}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: g.status === 'निवारण झाले' ? '#dcfce7' : '#fef3c7',
                        color: g.status === 'निवारण झाले' ? '#166534' : '#92400e'
                      }}>
                        {g.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {g.status !== 'निवारण झाले' && (
                        <button
                          type="button"
                          onClick={() => handleResolveGrievance(g.id)}
                          style={{ padding: '5px 10px', background: '#EA580C', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          निवारण करा
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
