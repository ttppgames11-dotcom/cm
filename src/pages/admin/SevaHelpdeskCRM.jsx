import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const INITIAL_BLOOD_REQUESTS = [
  { id: 'BLD-401', patient: 'सुमित्रा संभाजी कदम', group: 'O- Negative', hospital: 'ससून सर्वोपचार रुग्णालय, पुणे', units: '२ युनिट्स', urgency: '🔴 तात्काळ (२ तासात)', status: 'Pending', donor: 'शोध सुरू...' },
  { id: 'BLD-402', patient: 'विक्रम तानाजी भोसले', group: 'AB+ Positive', hospital: 'दीनानाथ मंगेशकर रुग्णालय, पुणे', units: '१ युनिट', urgency: '🟠 तातडीने (६ तासात)', status: 'Assigned', donor: 'अमोल मोहिते (9822114455)' },
  { id: 'BLD-403', patient: 'राजेंद्र विश्वासराव मोरे', group: 'B+ Positive', hospital: 'छत्रपती प्रमिलाराजे रुग्णालय (CPR), कोल्हापूर', units: '३ युनिट्स', urgency: '🟡 नियमित (२४ तास)', status: 'Fulfilled', donor: 'कोल्हापूर रक्तपेढी पथक' },
  { id: 'BLD-404', patient: 'अनिता दीपक जगताप', group: 'A+ Positive', hospital: 'जिल्हा शासकीय रुग्णालय, सातारा', units: '२ युनिट्स', urgency: '🔴 तात्काळ (२ तासात)', status: 'Assigned', donor: 'सचिन पवार (9855223311)' }
];

const INITIAL_SCHOLARSHIPS = [
  { id: 'EDU-801', student: 'ज्ञानेश्वर विठ्ठल शिंदे', course: 'B.Tech (Computer Engineering) COEP पुणे', amount: '₹३५,०००', income: '₹८०,००० / वर्ष', status: 'Approved' },
  { id: 'EDU-802', student: 'रोहिणी बाजीराव जाधव', course: 'MBBS (प्रथम वर्ष), BJ मेडिकल कॉलेज, पुणे', amount: '₹६०,०००', income: '₹६५,००० / वर्ष', status: 'Pending' },
  { id: 'EDU-803', student: 'अविनाश मारुती सावंत', course: 'UPSC / MPSC स्पर्धा परीक्षा अकादमी, दिल्ली', amount: '₹२५,०००', income: '₹९०,००० / वर्ष', status: 'Approved' },
  { id: 'EDU-804', student: 'प्रणाली लक्ष्मण पाटील', course: 'Diploma in Agriculture, कराड', amount: '₹१८,०००', income: '₹५०,००० / वर्ष', status: 'Under Scrutiny' }
];

const INITIAL_HOSPITAL_AID = [
  { id: 'MED-101', patient: 'तानाजी विठ्ठल जाधव', hospital: 'केईएम रुग्णालय, मुंबई', requirement: 'ICU बेड व व्हेंटिलेटर समन्वय', district: 'मुंबई', status: 'सक्रिय', volunteer: 'प्रमोद सावंत' },
  { id: 'MED-102', patient: 'शारदा संभाजी गायकवाड', hospital: 'सह्याद्री सुपरस्पेशालिटी, पुणे', requirement: 'हृदय शस्त्रक्रिया आर्थिक सवलत पत्र', district: 'पुणे', status: 'मंजूर', volunteer: 'आनंदराव देशमुख' },
  { id: 'MED-103', patient: 'दत्तात्रय रामराव मोहिते', hospital: 'सिव्हिल हॉस्पिटल, सोलापूर', requirement: 'आपत्कालीन कार्डिॲक ॲम्ब्युलन्स', district: 'सोलापूर', status: 'पूर्ण झाले', volunteer: 'सोलापूर पथक' }
];

const REGISTERED_DONORS = [
  { id: 'DNR-01', name: 'अमोल मोहिते', group: 'O- Negative', district: 'पुणे', contact: '9822114455', lastDonation: '३ महिन्यांपूर्वी', ready: true },
  { id: 'DNR-02', name: 'सचिन पवार', group: 'A+ Positive', district: 'सातारा', contact: '9855223311', lastDonation: '५ महिन्यांपूर्वी', ready: true },
  { id: 'DNR-03', name: 'उमेश शिंदे', group: 'AB- Negative', district: 'पुणे', contact: '9866332211', lastDonation: '६ महिन्यांपूर्वी', ready: true },
  { id: 'DNR-04', name: 'गणेश भोसले', group: 'B+ Positive', district: 'कोल्हापूर', contact: '9844556677', lastDonation: '४ महिन्यांपूर्वी', ready: true },
  { id: 'DNR-05', name: 'राहुल सावंत', group: 'O+ Positive', district: 'सांगली', contact: '9877112233', lastDonation: '२ महिन्यांपूर्वी', ready: false }
];

export default function SevaHelpdeskCRM() {
  const [activeTab, setActiveTab] = useState('blood'); // 'blood', 'scholarship', 'hospital', 'donors'
  const [bloodList, setBloodList] = useState(INITIAL_BLOOD_REQUESTS);
  const [scholarshipList, setScholarshipList] = useState(INITIAL_SCHOLARSHIPS);
  const [hospitalList, setHospitalList] = useState(INITIAL_HOSPITAL_AID);
  const [donorBloodFilter, setDonorBloodFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAssignBloodDonor = (id) => {
    setBloodList(prev => prev.map(b => b.id === id ? { ...b, status: 'Assigned', donor: 'सक्रिय स्वयंसेवक नियुक्त' } : b));
    showToast(`✓ विनंती #${id} साठी स्वयंसेवक रक्तदाता नियुक्त केला!`);
  };

  const handleFulfillBlood = (id) => {
    setBloodList(prev => prev.map(b => b.id === id ? { ...b, status: 'Fulfilled' } : b));
    showToast(`✓ विनंती #${id} पूर्ण झाली, रुग्णाला रक्त मिळाले!`);
  };

  const handleApproveScholarship = (id, student) => {
    setScholarshipList(prev => prev.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
    showToast(`✓ विद्यार्थी '${student}' यांची शैक्षणिक शिष्यवृत्ती मंजूर झाली!`);
  };

  const handleRejectScholarship = (id) => {
    setScholarshipList(prev => prev.map(s => s.id === id ? { ...s, status: 'Rejected' } : s));
    showToast(`✕ शिष्यवृत्ती अर्ज #${id} नाकारण्यात आला.`);
  };

  const filteredDonors = donorBloodFilter === 'all'
    ? REGISTERED_DONORS
    : REGISTERED_DONORS.filter(d => d.group === donorBloodFilter);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#fca5a5',
          border: '1px solid #dc2626',
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
            <span style={{ fontSize: '1.4rem' }}>🩺</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#f8fafc', fontFamily: 'Baloo 2' }}>
                CONNECT MARATHA — समाज साहाय्यता कक्ष CRM
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                २४x७ आपत्कालीन रक्तपेढी, रुग्ण साहाय्य व शिष्यवृत्ती नियंत्रण कक्ष (Seva Helpdesk CRM)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#dc2626', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.74rem', fontWeight: 800 }}>
              🩺 अधिकृत सेवा भूमिका
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
        
        {/* SEVA HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #991b1b, #dc2626)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(220, 38, 38, 0.2)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
              🩺 24x7 EMERGENCY SEVA HELPDESK
            </span>
            <h1 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              समाज साहाय्यता व आपत्कालीन समन्वय कक्ष
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9 }}>
              समन्वयक: <strong>सुभाषराव मोरे (सेवा प्रमुख)</strong> • २४x७ राज्यव्यापी आपत्कालीन मदत व रुग्णालय नेटवर्क
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => showToast('🚨 सर्व जिल्हा स्वयंसेवक प्रमुखांना तातडीचा रेड अलर्ट SMS पाठवला!')}
              style={{
                padding: '10px 18px',
                background: '#fef08a',
                color: '#854d0e',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🚨 आपत्कालीन रेड अलर्ट ब्रॉडकास्ट
            </button>
          </div>
        </div>

        {/* 4 TOP SEVA KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>तातडीच्या रक्त विनंत्या (Active)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {bloodList.filter(b => b.status === 'Pending').length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>तातकाळ प्रतिसाद आवश्यक</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>यशस्वी रक्त पुरवठा (Fulfilled)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', margin: '4px 0', fontFamily: 'Baloo 2' }}>३,४२०</div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>या वर्षातील एकूण मदत</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>शिष्यवृत्ती अर्ज छाननी</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {scholarshipList.filter(s => s.status !== 'Approved').length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>उच्च शिक्षण निधी वाटप</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>सक्रिय रुग्णालय साहाय्य प्रकरणे</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>{hospitalList.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ICU व ॲम्ब्युलन्स साहाय्य</div>
          </div>
        </div>

        {/* SEVA MODULE TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto' }}>
          {[
            { id: 'blood', label: '🩸 २४x७ आपत्कालीन रक्तपेढी (Blood Requests)', count: bloodList.length },
            { id: 'scholarship', label: '🎓 शैक्षणिक शिष्यवृत्ती (Scholarships)', count: scholarshipList.length },
            { id: 'hospital', label: '🏥 रुग्णालय व बेड समन्वय (Medical Aid)', count: hospitalList.length },
            { id: 'donors', label: '🔍 आपत्कालीन रक्तदाते शोधक (Donor Finder)', count: REGISTERED_DONORS.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#dc2626' : 'transparent',
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

        {/* TAB 1: BLOOD REQUESTS */}
        {activeTab === 'blood' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              🩸 २४x७ आपत्कालीन रक्त विनंत्या (Emergency Blood Requests Desk)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              रुग्णालयांकडून थेट दाखल झालेल्या आपत्कालीन विनंत्यांवर तात्काळ स्वयंसेवक रक्तदाते नियुक्त करा.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '12px 14px' }}>विनंती आयडी</th>
                    <th style={{ padding: '12px 14px' }}>रुग्णाचे नाव</th>
                    <th style={{ padding: '12px 14px' }}>रक्तगट (Blood Group)</th>
                    <th style={{ padding: '12px 14px' }}>रुग्णालय व शहर</th>
                    <th style={{ padding: '12px 14px' }}>आवश्यक युनिट्स</th>
                    <th style={{ padding: '12px 14px' }}>तातडीची पातळी</th>
                    <th style={{ padding: '12px 14px' }}>स्थिती व नियुक्त रक्तदाता</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodList.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#dc2626' }}>{b.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{b.patient}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.85rem' }}>
                          🩸 {b.group}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{b.hospital}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{b.units}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700 }}>{b.urgency}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: b.status === 'Fulfilled' ? '#dcfce7' : b.status === 'Assigned' ? '#ffedd5' : '#fee2e2',
                          color: b.status === 'Fulfilled' ? '#166534' : b.status === 'Assigned' ? '#c2410c' : '#991b1b'
                        }}>
                          {b.status}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>{b.donor}</div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {b.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleAssignBloodDonor(b.id)}
                            style={{ padding: '5px 10px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            स्वयंसेवक नियुक्त करा
                          </button>
                        )}
                        {b.status === 'Assigned' && (
                          <button
                            type="button"
                            onClick={() => handleFulfillBlood(b.id)}
                            style={{ padding: '5px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✓ रक्त मिळाले (पूर्ण)
                          </button>
                        )}
                        {b.status === 'Fulfilled' && (
                          <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>✓ सेवा संपन्न</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOLARSHIPS */}
        {activeTab === 'scholarship' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              🎓 विद्यार्थी उच्च शिक्षण शिष्यवृत्ती छाननी कक्ष (Scholarships Scrutiny)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              आर्थिकदृष्ट्या दुर्बल घटकातील गुणवंत मराठा विद्यार्थ्यांचे शैक्षणिक अर्ज तपासा व साहाय्य मंजूर करा.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>अर्ज आयडी</th>
                  <th style={{ padding: '12px 14px' }}>विद्यार्थ्याचे नाव</th>
                  <th style={{ padding: '12px 14px' }}>अभ्यासक्रम / संस्था</th>
                  <th style={{ padding: '12px 14px' }}>कुटुंबाचे वार्षिक उत्पन्न</th>
                  <th style={{ padding: '12px 14px' }}>शिष्यवृत्ती मागणी रक्कम</th>
                  <th style={{ padding: '12px 14px' }}>स्थिती</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>कृती</th>
                </tr>
              </thead>
              <tbody>
                {scholarshipList.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ea580c' }}>{s.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{s.student}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{s.course}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{s.income}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#16a34a' }}>{s.amount}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: s.status === 'Approved' ? '#dcfce7' : s.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: s.status === 'Approved' ? '#166534' : s.status === 'Rejected' ? '#991b1b' : '#92400e'
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {s.status !== 'Approved' && s.status !== 'Rejected' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleApproveScholarship(s.id, s.student)}
                            style={{ padding: '5px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✓ मंजूर करा
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectScholarship(s.id)}
                            style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✕ नाकारा
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>प्रक्रिया पूर्ण</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: HOSPITAL AID */}
        {activeTab === 'hospital' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
              🏥 रुग्णालय बेड, ICU व ॲम्ब्युलन्स समन्वय (Medical Emergency Assistance)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              गंभीर आजारी रुग्णांसाठी थेट सहकार्य कक्ष, सवलतीचे उपचार व आपत्कालीन वाहने.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>प्रकरण क्र.</th>
                  <th style={{ padding: '12px 14px' }}>रुग्ण नाव</th>
                  <th style={{ padding: '12px 14px' }}>रुग्णालय व जिल्हा</th>
                  <th style={{ padding: '12px 14px' }}>साहाय्याचे स्वरूप</th>
                  <th style={{ padding: '12px 14px' }}>नियुक्त स्वयंसेवक</th>
                  <th style={{ padding: '12px 14px' }}>स्थिती</th>
                </tr>
              </thead>
              <tbody>
                {hospitalList.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#dc2626' }}>{h.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{h.patient}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{h.hospital} ({h.district})</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{h.requirement}</td>
                    <td style={{ padding: '12px 14px', color: '#ea580c', fontWeight: 600 }}>{h.volunteer}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: h.status === 'पूर्ण झाले' ? '#dcfce7' : '#ffedd5',
                        color: h.status === 'पूर्ण झाले' ? '#166534' : '#c2410c'
                      }}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: DONOR FINDER */}
        {activeTab === 'donors' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                  🔍 आपत्कालीन रक्तदाते स्वयंसेवक शोधक (Donor Network Finder)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  रक्तगट निवडून त्वरित उपलब्ध असलेल्या नोंदणीकृत स्वयंसेवकांशी थेट संपर्क साधा.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>रक्तगट फिल्टर:</label>
                <select
                  value={donorBloodFilter}
                  onChange={(e) => setDonorBloodFilter(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="all">सर्व रक्तगट</option>
                  <option value="O- Negative">O- Negative (दुर्मीळ)</option>
                  <option value="AB- Negative">AB- Negative (दुर्मीळ)</option>
                  <option value="A+ Positive">A+ Positive</option>
                  <option value="B+ Positive">B+ Positive</option>
                  <option value="O+ Positive">O+ Positive</option>
                </select>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>स्वयंसेवक आयडी</th>
                  <th style={{ padding: '12px 14px' }}>नाव</th>
                  <th style={{ padding: '12px 14px' }}>रक्तगट</th>
                  <th style={{ padding: '12px 14px' }}>जिल्हा</th>
                  <th style={{ padding: '12px 14px' }}>संपर्क क्रमांक</th>
                  <th style={{ padding: '12px 14px' }}>मागील रक्तदान</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>थेट संपर्क</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#dc2626' }}>{d.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{d.name}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        {d.group}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{d.district}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{d.contact}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{d.lastDonation}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => showToast(`📞 स्वयंसेवक ${d.name} यांना आपत्कालीन संपर्क केला जात आहे...`)}
                        style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        📞 संपर्क साधा
                      </button>
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
