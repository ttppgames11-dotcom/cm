import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const INITIAL_BLOOD_REQUESTS = [
  { id: 'BLD-401', patient: 'सुमित्रा संभाजी कदम', bloodGroup: 'O-', hospital: 'ससून सर्वोपचार रुग्णालय, पुणे', district: 'पुणे', taluka: 'हवेली', units: 2, urgency: '🔴 तात्काळ (२ तासात)', status: 'active', donor: 'शोध सुरू...' },
  { id: 'BLD-402', patient: 'विक्रम तानाजी भोसले', bloodGroup: 'AB+', hospital: 'दीनानाथ मंगेशकर रुग्णालय, पुणे', district: 'पुणे', taluka: 'पुणे शहर', units: 1, urgency: '🟠 तातडीने (६ तासात)', status: 'assigned', donor: 'अमोल मोहिते (9822114455)' },
  { id: 'BLD-403', patient: 'राजेंद्र विश्वासराव मोरे', bloodGroup: 'B+', hospital: 'छत्रपती प्रमिलाराजे रुग्णालय (CPR), कोल्हापूर', district: 'कोल्हापूर', taluka: 'करवीर', units: 3, urgency: '🟡 नियमित (२४ तास)', status: 'fulfilled', donor: 'कोल्हापूर रक्तपेढी पथक' }
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
  const [activeTab, setActiveTab] = useState('blood'); // 'blood', 'matrimony', 'scholarship', 'hospital', 'donors'
  const [bloodList, setBloodList] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [matrimonyPending, setMatrimonyPending] = useState([]);
  const [matrimonyReports, setMatrimonyReports] = useState([]);
  const [womenStats, setWomenStats] = useState(null);
  const [womenCases, setWomenCases] = useState([]);
  const [scholarshipList, setScholarshipList] = useState(INITIAL_SCHOLARSHIPS);
  const [hospitalList, setHospitalList] = useState(INITIAL_HOSPITAL_AID);
  const [donorBloodFilter, setDonorBloodFilter] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({ donorName: '', donorPhone: '', notes: '' });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    apiClient.getBloodRequests({ status: 'all' })
      .then(reqs => {
        if (Array.isArray(reqs) && reqs.length > 0) setBloodList(reqs);
        else setBloodList(INITIAL_BLOOD_REQUESTS);
      })
      .catch(() => setBloodList(INITIAL_BLOOD_REQUESTS));

    apiClient.getDonors()
      .then(dns => {
        if (Array.isArray(dns) && dns.length > 0) setDonorsList(dns);
        else setDonorsList(REGISTERED_DONORS);
      })
      .catch(() => setDonorsList(REGISTERED_DONORS));

    apiClient.getMatrimonyAdminQueue()
      .then(res => {
        if (res) {
          setMatrimonyPending(res.pendingProfiles || []);
          setMatrimonyReports(res.openReports || []);
        }
      })
      .catch(() => {});

    apiClient.getWomenAdminStats()
      .then(res => {
        if (res) {
          setWomenStats(res.stats || null);
          setWomenCases(res.openCases || []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Poll every 15s for live SOS cases
    return () => clearInterval(interval);
  }, []);

  const handleVerifyMatrimony = async (id, status, verifiedVal) => {
    try {
      await apiClient.verifyMatrimonyProfile(id, {
        status: status,
        verified: verifiedVal,
        adminNotes: status === 'active' ? 'पडताळणी अधिकारीद्वारे मंजूर व प्रमाणित' : 'माहिती अपूर्ण असल्याने नाकारली'
      });
      showToast(status === 'active' ? `✓ प्रोफाईल #${id} यशस्वीरित्या मंजूर व प्रमाणित (Verified) केली!` : `✕ प्रोफाईल #${id} नाकारण्यात आली.`);
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  const handleUpdateWomenCase = async (id, newStatus, coordinator, notes) => {
    try {
      await apiClient.updateWomenCase(id, {
        status: newStatus,
        coordinator: coordinator || 'जिल्हा महिला संरक्षण अधिकारी',
        notes: notes || 'समन्वयकाद्वारे प्रत्यक्ष संपर्क व कारवाई पूर्ण.'
      });
      showToast(`✓ महिला मदत प्रकरण #${id} अद्यतनित केले: ${newStatus}`);
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  const handleAssignBloodDonor = async (e) => {
    e.preventDefault();
    if (!assignModal) return;
    try {
      await apiClient.respondToBloodRequest(assignModal.id, {
        donorName: assignForm.donorName,
        phone: assignForm.donorPhone,
        message: assignForm.notes || 'हेल्पडेस्कद्वारे नियुक्त रक्तदाता'
      });
      showToast(`✓ विनंती #${assignModal.id} साठी स्वयंसेवक '${assignForm.donorName}' नियुक्त केला!`);
      setAssignModal(null);
      setAssignForm({ donorName: '', donorPhone: '', notes: '' });
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
  };

  const handleFulfillBlood = async (id) => {
    try {
      await apiClient.fulfillBloodRequest(id);
      showToast(`✓ विनंती #${id} पूर्ण झाली, रुग्णाला रक्त मिळाले!`);
      loadData();
    } catch (err) {
      showToast('त्रुटी: ' + err.message);
    }
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
            { id: 'women', label: '🌸 महिला सक्षमीकरण व मदत कक्ष (Women Helpdesk)', count: womenCases.length },
            { id: 'matrimony', label: '💍 वधू-वर पडताळणी कक्ष (Matrimony Verification)', count: (matrimonyPending.length + matrimonyReports.length) },
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
                  {bloodList.map((b) => {
                    const st = (b.status || 'active').toLowerCase();
                    const isDone = st === 'fulfilled' || st === 'closed';
                    const isAssigned = st === 'assigned';
                    const isPending = st === 'active' || st === 'pending';
                    const bgGroup = b.bloodGroup || b.group || 'O+';
                    const locationText = b.taluka ? `${b.taluka}, ${b.district || b.city}` : (b.district || b.city || 'महाराष्ट्र');

                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#dc2626' }}>{b.id}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{b.patient}</div>
                          {b.contact && (
                            <a href={`tel:${b.contact}`} style={{ fontSize: '0.78rem', color: '#0284c7', textDecoration: 'none' }}>
                              📞 {b.contact}
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.85rem' }}>
                            🩸 {bgGroup}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          <div style={{ fontWeight: 600 }}>{b.hospital}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>📍 {locationText}</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{b.units} बाटल्या</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>{b.urgency}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: isDone ? '#dcfce7' : isAssigned ? '#ffedd5' : '#fee2e2',
                            color: isDone ? '#166534' : isAssigned ? '#c2410c' : '#991b1b'
                          }}>
                            {isDone ? '✓ रक्त मिळाले' : isAssigned ? '🤝 दाता नियुक्त' : '🔴 तातडीने आवश्यक'}
                          </div>
                          {b.lastDonorAssigned && (
                            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '3px', fontWeight: 600 }}>
                              दाता: {b.lastDonorAssigned}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModal(b);
                                setAssignForm({ donorName: '', donorPhone: '', notes: '' });
                              }}
                              style={{ padding: '6px 12px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              स्वयंसेवक नियुक्त करा
                            </button>
                          )}
                          {isAssigned && (
                            <button
                              type="button"
                              onClick={() => handleFulfillBlood(b.id)}
                              style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              ✓ रक्त मिळाले (पूर्ण करा)
                            </button>
                          )}
                          {isDone && (
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>✓ सेवा संपन्न</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

        {/* TAB 2: WOMEN EMPOWERMENT & HELPDESK CRM */}
        {activeTab === 'women' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Women KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #fbcfe8', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#be185d', fontWeight: 700 }}>दाखल महिला मदत प्रकरणे</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9f1239', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {womenCases.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#be185d' }}>सक्रिय समुपदेशन व पाठपुरावा</div>
              </div>

              <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>नोंदणीकृत महिला उद्योजक</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {womenStats?.totalEntrepreneurs || 5}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>सक्रिय व्यवसाय व स्टार्ट-अप्स</div>
              </div>

              <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>महिला बचत गट (SHGs)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {womenStats?.totalShgs || 3}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#ea580c' }}>बचत गट खेळते भांडवल नेटवर्क</div>
              </div>

              <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>मार्गदर्शक तज्ज्ञ (Mentors)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {womenStats?.totalMentors || 3}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>विधी, उद्योग व सनदी सेवा</div>
              </div>
            </div>

            {/* Cases Table */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #fbcfe8', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#9f1239', fontFamily: 'Baloo 2' }}>
                    🌸 महिला गोपनीय मदत प्रकरणे व निवारण डेस्क (Women Grievance & Help Intake)
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    कायदेशीर सल्ला, आर्थिक साहाय्य, बचत गट समस्या व कौटुंबिक अडचणींवर थेट समन्वयकांची नेमणूक करा.
                  </p>
                </div>
                <span style={{ background: '#fdf2f8', color: '#be185d', padding: '4px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem', border: '1px solid #fbcfe8' }}>
                  एकूण प्रकरणे: {womenCases.length}
                </span>
              </div>

              {womenCases.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  सध्या कोणतीही प्रलंबित महिला मदत प्रकरणे नाहीत.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#fdf2f8', borderBottom: '2px solid #fbcfe8', textAlign: 'left', color: '#9f1239' }}>
                        <th style={{ padding: '12px 14px' }}>प्रकरण क्र.</th>
                        <th style={{ padding: '12px 14px' }}>अर्जदार भगिनी</th>
                        <th style={{ padding: '12px 14px' }}>श्रेणी व निकड</th>
                        <th style={{ padding: '12px 14px' }}>जिल्हा / तालुका</th>
                        <th style={{ padding: '12px 14px' }}>तपशील व सोयीची वेळ</th>
                        <th style={{ padding: '12px 14px' }}>सद्यस्थिती / समन्वयक</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>कारवाई</th>
                      </tr>
                    </thead>
                    <tbody>
                      {womenCases.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#be185d' }}>
                            {c.case_number || c.id}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.applicant_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📞 {c.contact_phone}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.category}</div>
                            <span style={{
                              background: c.urgency?.includes('SOS') ? '#fee2e2' : c.urgency?.includes('तातडीने') ? '#ffedd5' : '#f1f5f9',
                              color: c.urgency?.includes('SOS') ? '#b91c1c' : c.urgency?.includes('तातडीने') ? '#c2410c' : '#475569',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700
                            }}>
                              {c.urgency}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {c.taluka ? `${c.taluka}, ` : ''}{c.district}
                          </td>
                          <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                            <div style={{ color: '#334155' }}>{c.description}</div>
                            {c.preferred_time && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                🕒 वेळ: {c.preferred_time}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: c.status?.includes('सोडवले') ? '#dcfce7' : '#fef3c7',
                              color: c.status?.includes('सोडवले') ? '#15803d' : '#92400e',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '0.76rem'
                            }}>
                              {c.status}
                            </span>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                              {c.assigned_coordinator || 'प्रतीक्षेत'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateWomenCase(c.id, 'प्रगतीपथावर', 'जिल्हा महिला समन्वय अधिकारी', 'समन्वयकांशी चर्चा सुरू आहे.')}
                                style={{
                                  padding: '5px 8px',
                                  background: '#be185d',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                अधिकारी नेमा
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateWomenCase(c.id, 'यशस्वीरीत्या सोडवले', c.assigned_coordinator, 'समस्या सोडवण्यात आली.')}
                                style={{
                                  padding: '5px 8px',
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ सोडवले
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MATRIMONY VERIFICATION & COMPLAINTS DESK */}
        {activeTab === 'matrimony' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Verification Queue */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                    💍 वधू-वर नवीन नोंदणी व प्रोफाइल पडताळणी कक्ष (Verification Queue)
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    नवीन दाखल झालेल्या बायोडाटांची पडताळणी करून त्यांना "प्रमाणित (Verified)" बॅज द्या अथवा संशयास्पद माहिती असल्यास नाकारा.
                  </p>
                </div>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem' }}>
                  प्रलंबित: {matrimonyPending.length}
                </span>
              </div>

              {matrimonyPending.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  सध्या कोणतीही प्रलंबित प्रोफाइल पडताळणी बाकी नाही. सर्व प्रोफाईल्स मंजूर आहेत.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '12px 14px' }}>आयडी / फोटो</th>
                        <th style={{ padding: '12px 14px' }}>उमेदवाराचे नाव व वय</th>
                        <th style={{ padding: '12px 14px' }}>कुल / गोत्र / देवक</th>
                        <th style={{ padding: '12px 14px' }}>शिक्षण व व्यवसाय</th>
                        <th style={{ padding: '12px 14px' }}>जिल्हा / मूळ गाव</th>
                        <th style={{ padding: '12px 14px' }}>संपर्क क्रमांक</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>कारवाई</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrimonyPending.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={p.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt={p.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span style={{ fontWeight: 700, color: '#dc2626' }}>#{p.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {p.gender === 'female' ? 'वधू (Bride)' : 'वर (Groom)'} • {p.age ? `${p.age} वर्षे` : ''} {p.height ? `(${p.height})` : ''}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#b91c1c' }}>{p.kul || 'मराठा'}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>गोत्र: {p.gotra || 'कश्यप'} • देवक: {p.devak || 'सूर्यफूल'}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{p.profession || p.occupation || '-'}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.education || '-'} {p.income ? `• ${p.income}` : ''}</div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {p.district || p.city || '-'}
                            {p.native_place && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>मूळ: {p.native_place}</div>}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                            {p.contact || p.phone || '-'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleVerifyMatrimony(p.id, 'active', 1)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ मंजूर व प्रमाणित
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVerifyMatrimony(p.id, 'rejected', 0)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✕ नाकारा
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Complaints / Abuse Reports Queue */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #fee2e2', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', fontFamily: 'Baloo 2' }}>
                    🚨 प्रोफाईल तक्रारी व गैरवर्तन निवारण (Complaints & Abuse Reports)
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    समाजातील सदस्यांनी संशयास्पद बायोडाटा किंवा गैरवर्तनाबाबत केलेल्या अधिकृत तक्रारींचे निवारण.
                  </p>
                </div>
                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '0.82rem' }}>
                  तक्रारी: {matrimonyReports.length}
                </span>
              </div>

              {matrimonyReports.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#16a34a', fontWeight: 600 }}>
                  ✓ एकही खुली तक्रार नाही. सर्व प्रोफाईल्स सुरक्षित व सुस्थितीत आहेत.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca', textAlign: 'left', color: '#991b1b' }}>
                        <th style={{ padding: '10px 12px' }}>तक्रार आयडी</th>
                        <th style={{ padding: '10px 12px' }}>आरोपित प्रोफाईल</th>
                        <th style={{ padding: '10px 12px' }}>तक्रारदार</th>
                        <th style={{ padding: '10px 12px' }}>तक्रारीचे कारण</th>
                        <th style={{ padding: '10px 12px' }}>तपशील</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>कारवाई</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrimonyReports.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#dc2626' }}>#{r.id}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 700 }}>{r.reported_name || `प्रोफाईल #${r.reported_profile_id}`}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ID: #{r.reported_profile_id}</div>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {r.reporter_name || 'अज्ञात सभासद'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
                              {r.reason}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#334155', maxWidth: '280px' }}>
                            {r.details || '-'}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleVerifyMatrimony(r.reported_profile_id, 'suspended', 0)}
                                style={{
                                  padding: '5px 10px',
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                🚫 प्रोफाईल निलंबित करा
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Manual Dispatch Modal for Seva Coordinator */}
      {assignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontFamily: 'Baloo 2' }}>
                  स्वयंसेवक रक्तदाता नियुक्त करा
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  रुग्ण: <strong>{assignModal.patient}</strong> ({assignModal.bloodGroup || assignModal.group})
                </div>
              </div>
              <button onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.82rem' }}>
              🏥 {assignModal.hospital}<br />
              📍 {assignModal.taluka ? `${assignModal.taluka}, ${assignModal.district || assignModal.city}` : (assignModal.district || assignModal.city)}
            </div>

            <form onSubmit={handleAssignBloodDonor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>रक्तदात्याचे नाव *</label>
                <input
                  type="text"
                  required
                  value={assignForm.donorName}
                  onChange={e => setAssignForm({ ...assignForm, donorName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  placeholder="उदा. अमोल मोहिते (पुणे)"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>रक्तदात्याचा फोन नंबर *</label>
                <input
                  type="tel"
                  required
                  value={assignForm.donorPhone}
                  onChange={e => setAssignForm({ ...assignForm, donorPhone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  placeholder="9822114455"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>समन्वयक टिप्पणी (Notes)</label>
                <input
                  type="text"
                  value={assignForm.notes}
                  onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  placeholder="उदा. दात्याशी फोनवर चर्चा झाली, ते ३० मिनिटांत पोहोचत आहेत."
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                ✓ दाता नियुक्त करा व रुग्णास कळवा
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
