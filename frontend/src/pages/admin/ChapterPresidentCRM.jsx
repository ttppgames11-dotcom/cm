import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CHAPTER_DATA = {
  shivneri: {
    name: 'पुणे – शिवनेरी व्यवसाय मंडळ (Chapter)',
    president: 'राजेंद्र मोहिते (चॅप्टर अध्यक्ष)',
    contact: '+91 98221 44550',
    meetingDay: 'दर बुधवारी स. ७:३० वाजता',
    venue: 'हॉटेल प्राइड एक्झिक्युटिव्ह, शिवाजीनगर, पुणे',
    membersCount: 48,
    totalBiz: '₹८.४ कोटी',
    referralsCount: '१,४२०',
    oneToOneCount: '६८०',
    attendanceRate: '९४%',
    nextMeetingDate: '२४ सप्टें २०२६ (स. ७:३०)',
    meetingAgenda: 'पायाभूत सुविधा व आयटी उद्योगातील थेट B2B संधी'
  },
  dadar: {
    name: 'मुंबई – दादर व्यापार संगम (Chapter)',
    president: 'प्रमोद सावंत (चॅप्टर अध्यक्ष)',
    contact: '+91 98200 99881',
    meetingDay: 'दर गुरुवारी स. ७:३० वाजता',
    venue: 'कोहिनूर हॉल, दादर पश्चिम, मुंबई',
    membersCount: 45,
    totalBiz: '₹९.१ कोटी',
    referralsCount: '१,२९०',
    oneToOneCount: '५९०',
    attendanceRate: '९१%',
    nextMeetingDate: '२५ सप्टें २०२६ (स. ७:३०)',
    meetingAgenda: 'निर्यात व्यापार, लॉजिस्टिक्स व FMCG साखळी'
  },
  pcmc: {
    name: 'पिंपरी-चिंचवड औद्योगिक मंडळ (Chapter)',
    president: 'सचिन जगताप (चॅप्टर अध्यक्ष)',
    contact: '+91 98500 22334',
    meetingDay: 'दर शुक्रवारी स. ७:४५ वाजता',
    venue: 'ऑटो क्लस्टर ऑडिटोरियम, चिंचवड',
    membersCount: 55,
    totalBiz: '₹१२.५ कोटी',
    referralsCount: '१,८९०',
    oneToOneCount: '८२०',
    attendanceRate: '९६%',
    nextMeetingDate: '२६ सप्टें २०२६ (स. ७:४५)',
    meetingAgenda: 'ऑटोमोबाईल व्हेंडर पुरवठा व CNC जॉब वर्क्स'
  }
};

const INITIAL_REFERRALS = [
  { id: 'REF-201', giver: 'अमोल जाधव (IT Solutions)', receiver: 'विक्रम पाटील (Civil Construction)', requirement: 'नवीन कमर्शियल कॉम्प्लेक्सचे ERP व CCTV नेटवर्क', amount: '₹४.५ लाख', date: '१८ सप्टें २०२६', status: 'Closed Won' },
  { id: 'REF-202', giver: 'महेश शिंदे (CA & Tax)', receiver: 'उदयराज सावंत (Auto Components)', requirement: 'कंपनी व्हॅल्यूएशन व GST इन्व्हेस्टमेंट ऑडिट', amount: '₹१.२ लाख', date: '१८ सप्टें २०२६', status: 'In Discussion' },
  { id: 'REF-203', giver: 'सुप्रिया साळुंखे (Organic Foods)', receiver: 'अविनाश भोसले (Hotelier)', requirement: '३ हॉटेल्ससाठी दरमहा सेंद्रिय मसाले व धान्य पुरवठा', amount: '₹२.८ लाख / महिना', date: '१७ सप्टें २०२६', status: 'Closed Won' },
  { id: 'REF-204', giver: 'प्रशांत कदम (Legal Advisor)', receiver: 'दिलीप मोहिते (Agri Logistics)', requirement: 'एमआयडीसी जमीन खरेदी कायदेशीर पडताळणी', amount: '₹८५,०००', date: '१६ सप्टें २०२६', status: 'Open' },
  { id: 'REF-205', giver: 'विजय साने (Architect)', receiver: 'अमोल जाधव (IT Solutions)', requirement: 'आर्किटेक्चर स्टुडिओसाठी क्लाउड सर्व्हर सेटअप', amount: '₹९५,०००', date: '१५ सप्टें २०२६', status: 'In Discussion' }
];

const INITIAL_ATTENDANCE = [
  { id: 'ATT-01', member: 'अमोल जाधव', business: 'Cloud ERP & Web Solutions', lastMeeting: 'हजर (Present)', streak: '12 Weeks', score: '100%' },
  { id: 'ATT-02', member: 'विक्रम पाटील', business: 'Civil Infra & Earthmovers', lastMeeting: 'हजर (Present)', streak: '8 Weeks', score: '95%' },
  { id: 'ATT-03', member: 'महेश शिंदे', business: 'Corporate Chartered Accountant', lastMeeting: 'हजर (Present)', streak: '15 Weeks', score: '100%' },
  { id: 'ATT-04', member: 'सुप्रिया साळुंखे', business: 'Sahyadri Organic Agro', lastMeeting: 'पर्यायी प्रतिनिधी (Sub)', streak: '5 Weeks', score: '90%' },
  { id: 'ATT-05', member: 'उदयराज सावंत', business: 'Precision Auto Tech', lastMeeting: 'हजर (Present)', streak: '10 Weeks', score: '95%' },
  { id: 'ATT-06', member: 'प्रशांत कदम', business: 'Advocate & High Court Counsel', lastMeeting: 'गैरहजर (Absent)', streak: '0 Weeks', score: '75%' }
];

const INITIAL_ONE_TO_ONE = [
  { id: '1TO1-01', member1: 'अमोल जाधव', member2: 'महेश शिंदे', date: '१७ सप्टें २०२६', topic: 'IT व फायनान्स क्रॉस-रेफरल धोरण', outcome: '२ क्लायंट्सची शिफारस करण्याचे ठरले' },
  { id: '1TO1-02', member1: 'विक्रम पाटील', member2: 'विजय साने', date: '१६ सप्टें २०२६', topic: 'नवीन रेसिडेन्शियल टॉवर डिझाईन व कंत्राट', outcome: 'संयुक्त बिड सादर करण्याची तयारी' },
  { id: '1TO1-03', member1: 'सुप्रिया साळुंखे', member2: 'अविनाश भोसले', date: '१४ सप्टें २०२६', topic: 'हॉटेल चेनला सेंद्रिय भाजीपाला थेट पुरवठा', outcome: 'वार्षिक एमओयू निश्चित' }
];

const CHAPTER_ROSTER = [
  { id: 'M-SHIV-01', name: 'राजेंद्र मोहिते (अध्यक्ष)', category: 'Industrial Packaging', bizGiven: '₹४२ लाख', bizReceived: '₹६५ लाख', rating: '⭐⭐⭐⭐⭐' },
  { id: 'M-SHIV-02', name: 'अमोल जाधव', category: 'Software & Cloud ERP', bizGiven: '₹२८ लाख', bizReceived: '₹३४ लाख', rating: '⭐⭐⭐⭐⭐' },
  { id: 'M-SHIV-03', name: 'विक्रम पाटील', category: 'Civil Construction', bizGiven: '₹७५ लाख', bizReceived: '₹१.२ कोटी', rating: '⭐⭐⭐⭐⭐' },
  { id: 'M-SHIV-04', name: 'महेश शिंदे', category: 'CA & Tax Audit', bizGiven: '₹१८ लाख', bizReceived: '₹२२ लाख', rating: '⭐⭐⭐⭐' },
  { id: 'M-SHIV-05', name: 'सुप्रिया साळुंखे', category: 'Agro & Food Processing', bizGiven: '₹३० लाख', bizReceived: '₹४० लाख', rating: '⭐⭐⭐⭐⭐' },
  { id: 'M-SHIV-06', name: 'विजय साने', category: 'Architectural Design', bizGiven: '₹३५ लाख', bizReceived: '₹४५ लाख', rating: '⭐⭐⭐⭐' }
];

export default function ChapterPresidentCRM() {
  const [selectedChapter, setSelectedChapter] = useState('shivneri');
  const [activeTab, setActiveTab] = useState('referrals'); // 'referrals', 'attendance', 'onetoone', 'roster'
  const [referrals, setReferrals] = useState(INITIAL_REFERRALS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [oneToOneList, setOneToOneList] = useState(INITIAL_ONE_TO_ONE);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [newSlip, setNewSlip] = useState({ giver: '', receiver: '', requirement: '', amount: '' });
  const [toastMessage, setToastMessage] = useState(null);

  const chapterInfo = CHAPTER_DATA[selectedChapter] || CHAPTER_DATA.shivneri;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateSlip = (e) => {
    e.preventDefault();
    const slipId = 'REF-' + Math.floor(206 + Math.random() * 800);
    const slipObj = {
      id: slipId,
      giver: newSlip.giver,
      receiver: newSlip.receiver,
      requirement: newSlip.requirement,
      amount: newSlip.amount || 'किंमत प्रलंबित',
      date: 'आज',
      status: 'Open'
    };
    setReferrals([slipObj, ...referrals]);
    showToast(`✓ नवीन रेफरल स्लिप #${slipId} यशस्वीरीत्या जारी झाली!`);
    setShowSlipModal(false);
    setNewSlip({ giver: '', receiver: '', requirement: '', amount: '' });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`स्लिप #${id} ची स्थिती '${newStatus}' म्हणून अद्यतनित केली.`);
  };

  const handleToggleAttendance = (id, status) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, lastMeeting: status } : a));
    showToast(`हजेरी अद्यतनित: ${status}`);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#86efac',
          border: '1px solid #16a34a',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 600
        }}>
          {toastMessage}
        </div>
      )}

      {/* TOP ISOLATED HEADER BAR */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '12px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>💼</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#f8fafc', fontFamily: 'Baloo 2' }}>
                CONNECT MARATHA — चॅप्टर अध्यक्ष CRM
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                स्थानिक व्यवसाय मंडळ, साप्ताहिक संगम व रेफरल नियंत्रण कक्ष (Chapter President CRM)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#16a34a', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.74rem', fontWeight: 800 }}>
              💼 अधिकृत चॅप्टर भूमिका
            </span>
            <Link
              to="/crm"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
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
        
        {/* CHAPTER HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #15803d, #16a34a)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(21, 128, 61, 0.2)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
              💼 CHAPTER PRESIDENT EXECUTIVE DESK
            </span>
            <h1 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              {chapterInfo.name} — चॅप्टर व्यवस्थापन केंद्र
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9 }}>
              अध्यक्ष: <strong>{chapterInfo.president}</strong> • {chapterInfo.meetingDay} • {chapterInfo.venue}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
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
              <option value="shivneri">पुणे – शिवनेरी व्यवसाय मंडळ</option>
              <option value="dadar">मुंबई – दादर व्यापार संगम</option>
              <option value="pcmc">पिंपरी-चिंचवड औद्योगिक मंडळ</option>
            </select>

            <button
              type="button"
              onClick={() => setShowSlipModal(true)}
              style={{
                padding: '8px 16px',
                background: '#facc15',
                color: '#713f12',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ➕ नवीन रेफरल स्लिप
            </button>
          </div>
        </div>

        {/* 4 TOP CHAPTER KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>एकूण देवाणघेवाण झालेला व्यवसाय</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', margin: '4px 0', fontFamily: 'Baloo 2' }}>{chapterInfo.totalBiz}</div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>↑ १२.५% यंदाच्या तिमाहीत</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>सक्रिय B2B रेफरल्स (TYFCB)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0', fontFamily: 'Baloo 2' }}>{chapterInfo.referralsCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{chapterInfo.membersCount} सक्रिय व्यावसायिक सदस्य</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>१-ते-१ व्यावसायिक भेटी</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>{chapterInfo.oneToOneCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700 }}>उच्च नेटवर्किंग दर</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>साप्ताहिक संगम हजेरी दर</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>{chapterInfo.attendanceRate}</div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>उत्कृष्ट सातत्य</div>
          </div>
        </div>

        {/* UPCOMING MEETING ANNOUNCEMENT BOX */}
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
              📢 पुढील साप्ताहिक संगम बैठक (Next Meeting)
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>
              {chapterInfo.nextMeetingDate} • {chapterInfo.venue}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px' }}>
              <strong>मुख्य अजेंडा:</strong> {chapterInfo.meetingAgenda}
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('सर्व सदस्यांना SMS/WhatsApp आठवण पाठवली!')}
            style={{
              padding: '8px 16px',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            📲 सदस्यांना रिमाइंडर पाठवा
          </button>
        </div>

        {/* CHAPTER MODULE TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto' }}>
          {[
            { id: 'referrals', label: '🤝 रेफरल स्लिप्स (TYFCB)', count: referrals.length },
            { id: 'attendance', label: '📅 साप्ताहिक बैठक हजेरी (Attendance)', count: attendance.length },
            { id: 'onetoone', label: '🤝 १-ते-१ भेटी नोंदी (1-to-1 Meetings)', count: oneToOneList.length },
            { id: 'roster', label: '👥 चॅप्टर सदस्य सूची (Member Roster)', count: CHAPTER_ROSTER.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#16a34a' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#475569',
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
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: activeTab === tab.id ? '#fff' : '#0f172a',
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

        {/* TAB 1: REFERRALS */}
        {activeTab === 'referrals' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              🤝 चॅप्टर अंतर्गत रेफरल स्लिप्स (TYFCB Business Slips)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              सदस्यांनी एकमेकांना दिलेल्या थेट व्यावसायिक संधी, चौकशी आणि प्रत्यक्षात पूर्ण झालेले सौदे (Closed Deals).
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '12px 14px' }}>स्लिप आयडी</th>
                    <th style={{ padding: '12px 14px' }}>देणारा सदस्य (Giver)</th>
                    <th style={{ padding: '12px 14px' }}>घेणारा सदस्य (Receiver)</th>
                    <th style={{ padding: '12px 14px' }}>व्यवसाय / आवश्यकता</th>
                    <th style={{ padding: '12px 14px' }}>अंदाजे मूल्य</th>
                    <th style={{ padding: '12px 14px' }}>दिनांक</th>
                    <th style={{ padding: '12px 14px' }}>स्थिती (Status)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती (Change Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#15803d' }}>{r.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.giver}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#ea580c' }}>{r.receiver}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{r.requirement}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#15803d' }}>{r.amount}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.82rem' }}>{r.date}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: r.status === 'Closed Won' ? '#dcfce7' : r.status === 'In Discussion' ? '#fef3c7' : '#ffedd5',
                          color: r.status === 'Closed Won' ? '#166534' : r.status === 'In Discussion' ? '#92400e' : '#c2410c'
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                        >
                          <option value="Open">Open</option>
                          <option value="In Discussion">In Discussion</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              📅 साप्ताहिक बैठक हजेरी व्यवस्थापन (Meeting Attendance Matrix)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              चॅप्टरच्या साप्ताहिक बैठकीतील सदस्यांची हजेरी, सातत्य (Streak) व प्रतिनिधी नोंद.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>सदस्य नाव</th>
                  <th style={{ padding: '12px 14px' }}>व्यवसाय / फर्म</th>
                  <th style={{ padding: '12px 14px' }}>मागील बैठक उपस्थिती</th>
                  <th style={{ padding: '12px 14px' }}>सलग उपस्थिती (Streak)</th>
                  <th style={{ padding: '12px 14px' }}>हजेरी दर</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>आजची हजेरी नोंदवा</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{a.member}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{a.business}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: a.lastMeeting.includes('Present') ? '#dcfce7' : a.lastMeeting.includes('Sub') ? '#fef3c7' : '#fee2e2',
                        color: a.lastMeeting.includes('Present') ? '#166534' : a.lastMeeting.includes('Sub') ? '#92400e' : '#991b1b'
                      }}>
                        {a.lastMeeting}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 700 }}>{a.streak}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{a.score}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(a.id, 'हजर (Present)')}
                          style={{ padding: '4px 8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(a.id, 'पर्यायी प्रतिनिधी (Sub)')}
                          style={{ padding: '4px 8px', background: '#eab308', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          S
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(a.id, 'गैरहजर (Absent)')}
                          style={{ padding: '4px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: 1-TO-1 MEETINGS */}
        {activeTab === 'onetoone' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              🤝 १-ते-१ व्यावसायिक भेटी नोंदी (One-to-One Collaboration Log)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              चॅप्टर सदस्यांनी आपापसातील व्यवसाय समजून घेण्यासाठी घेतलेल्या विशेष १-ते-१ बैठकांचा इतिहास.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>भेट आयडी</th>
                  <th style={{ padding: '12px 14px' }}>सदस्य १</th>
                  <th style={{ padding: '12px 14px' }}>सदस्य २</th>
                  <th style={{ padding: '12px 14px' }}>दिनांक</th>
                  <th style={{ padding: '12px 14px' }}>चर्चेचा विषय</th>
                  <th style={{ padding: '12px 14px' }}>निष्पन्न (Outcome)</th>
                </tr>
              </thead>
              <tbody>
                {oneToOneList.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ea580c' }}>{m.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.member1}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.member2}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.82rem' }}>{m.date}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{m.topic}</td>
                    <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 600 }}>{m.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: MEMBER ROSTER */}
        {activeTab === 'roster' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              👥 {chapterInfo.name} सदस्य नामावली (Member Performance Roster)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              चॅप्टर सदस्यांचे अधिकृत व्यवसाय प्रकार, देवाणघेवाण व्यवसाय आणि परफॉर्मन्स रेटिंग.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>सदस्य आयडी</th>
                  <th style={{ padding: '12px 14px' }}>नाव</th>
                  <th style={{ padding: '12px 14px' }}>व्यावसायिक श्रेणी</th>
                  <th style={{ padding: '12px 14px' }}>दिलेला व्यवसाय (Given)</th>
                  <th style={{ padding: '12px 14px' }}>मिळालेला व्यवसाय (Received)</th>
                  <th style={{ padding: '12px 14px' }}>रेटिंग</th>
                </tr>
              </thead>
              <tbody>
                {CHAPTER_ROSTER.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#15803d' }}>{r.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{r.name}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{r.category}</td>
                    <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 700 }}>{r.bizGiven}</td>
                    <td style={{ padding: '12px 14px', color: '#ea580c', fontWeight: 700 }}>{r.bizReceived}</td>
                    <td style={{ padding: '12px 14px' }}>{r.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL: CREATE NEW REFERRAL SLIP */}
        {showSlipModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                ➕ नवीन रेफरल स्लिप जारी करा (Create TYFCB Slip)
              </h3>
              <form onSubmit={handleCreateSlip}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>देणारा सदस्य (Giver):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. अमोल जाधव (IT)"
                    value={newSlip.giver}
                    onChange={(e) => setNewSlip({ ...newSlip, giver: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>मिळणारा सदस्य (Receiver):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. विक्रम पाटील (Civil)"
                    value={newSlip.receiver}
                    onChange={(e) => setNewSlip({ ...newSlip, receiver: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>आवश्यकता / प्रोजेक्ट तपशील:</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="क्लायंटची आवश्यकता, कॉन्टॅक्ट व कामाचे स्वरूप..."
                    value={newSlip.requirement}
                    onChange={(e) => setNewSlip({ ...newSlip, requirement: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>अंदाजे डील मूल्य (Value in ₹):</label>
                  <input
                    type="text"
                    placeholder="उदा. ₹२.५ लाख"
                    value={newSlip.amount}
                    onChange={(e) => setNewSlip({ ...newSlip, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSlipModal(false)}
                    style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    स्लिप नोंदवा ➔
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
