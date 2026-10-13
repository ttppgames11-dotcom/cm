import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminReferralReport,
  exportReferralsToCSV,
  MAHARASHTRA_DISTRICTS,
  DISTRICT_TALUKAS,
  KNOWN_OFFICIAL_REFERRERS
} from '../../services/referralService';

export default function SuperAdminDashboardPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'referrals' | 'doctors' | 'services' | 'hotels' | 'information' | 'roles' | 'opportunities'
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const handleQuickAdminLogin = async () => {
    try {
      showToast('Admin खात्यात लॉगिन करत आहे...', 'success');
      const res = await login('admin@connectmaratha.org', 'password123');
      if (res && (res.success || res.member)) {
        showToast('यशस्वी! Admin अधिकार प्राप्त झाले.', 'success');
        setTimeout(() => loadAllData(), 300);
      } else {
        showToast('लॉगिन अयशस्वी झाले.', 'error');
      }
    } catch (e) {
      showToast('लॉगिन त्रुटी: ' + e.message, 'error');
    }
  };

  // Data states
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [information, setInformation] = useState([]);
  const [rolesMatrix, setRolesMatrix] = useState([]);
  const [jobApps, setJobApps] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userVerifiedFilter, setUserVerifiedFilter] = useState('all');

  // Referral Filter & Reporting states
  const [refSearch, setRefSearch] = useState('');
  const [refDistrict, setRefDistrict] = useState('all');
  const [refTaluka, setRefTaluka] = useState('all');
  const [refRole, setRefRole] = useState('all');
  const [refTimeframe, setRefTimeframe] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [refStartDate, setRefStartDate] = useState('');
  const [refEndDate, setRefEndDate] = useState('');
  const [refStatus, setRefStatus] = useState('all'); // 'all' | 'active' | 'pending'
  const [refReferrerId, setRefReferrerId] = useState('all');
  const [referralReportData, setReferralReportData] = useState(() => getAdminReferralReport());

  const refreshReferralReport = () => {
    try {
      const data = getAdminReferralReport({
        search: refSearch,
        district: refDistrict,
        taluka: refTaluka,
        role: refRole,
        timeframe: refTimeframe,
        startDate: refStartDate,
        endDate: refEndDate,
        status: refStatus,
        referrerId: refReferrerId
      });
      setReferralReportData(data);
    } catch (e) {
      console.warn('Referral report loading error:', e);
    }
  };

  useEffect(() => {
    refreshReferralReport();
  }, [refSearch, refDistrict, refTaluka, refRole, refTimeframe, refStartDate, refEndDate, refStatus, refReferrerId]);

  useEffect(() => {
    const handleUpdate = () => refreshReferralReport();
    window.addEventListener('cm_referral_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cm_referral_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refSearch, refDistrict, refTaluka, refRole, refTimeframe, refStartDate, refEndDate, refStatus, refReferrerId]);

  const handleResetReferralFilters = () => {
    setRefSearch('');
    setRefDistrict('all');
    setRefTaluka('all');
    setRefRole('all');
    setRefTimeframe('all');
    setRefStartDate('');
    setRefEndDate('');
    setRefStatus('all');
    setRefReferrerId('all');
  };

  // Modals state
  const [modalType, setModalType] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState({});

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Initial data loader
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, docsRes, srvsRes, htlsRes, infoRes, rolesRes, appsRes, enqsRes] = await Promise.all([
        apiClient.getAdminUsers({
          search: userSearch,
          role: userRoleFilter,
          verified: userVerifiedFilter
        }).catch(() => ({ users: [], stats: {} })),
        apiClient.getAdminDoctors().catch(() => []),
        apiClient.getAdminServices().catch(() => []),
        apiClient.getAdminHotels().catch(() => []),
        apiClient.getAdminInformation().catch(() => []),
        apiClient.getRolesMatrix().catch(() => []),
        api.admin.getJobApplications().catch(() => ({ applications: [] })),
        api.admin.getEnquiriesSummary().catch(() => ({ enquiries: [] }))
      ]);

      setUsers(usersRes.users || []);
      setUserStats(usersRes.stats || {});
      setDoctors(docsRes || []);
      setServices(srvsRes || []);
      setHotels(htlsRes || []);
      setInformation(infoRes || []);
      setRolesMatrix(rolesRes || []);
      setJobApps(appsRes.applications || []);
      setEnquiries(enqsRes.enquiries || []);
    } catch (err) {
      console.error('Admin load error:', err);
      showToast('माहिती लोड करताना अडचण आली.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userRoleFilter, userVerifiedFilter]);

  // Fast 1-Second Real-Time Polling to reflect added/registered users immediately
  useEffect(() => {
    const pollInterval = setInterval(() => {
      apiClient.getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
        verified: userVerifiedFilter
      }).then(res => {
        if (res && res.users) {
          setUsers(res.users);
          if (res.stats) setUserStats(res.stats);
        }
      }).catch(() => {});
    }, 1000);
    return () => clearInterval(pollInterval);
  }, [userSearch, userRoleFilter, userVerifiedFilter]);

  // Handle user search
  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    apiClient.getAdminUsers({
      search: userSearch,
      role: userRoleFilter,
      verified: userVerifiedFilter
    })
      .then(res => {
        setUsers(res.users || []);
        setUserStats(res.stats || {});
      })
      .catch(() => showToast('शोधताना त्रुटी आली.', 'error'));
  };

  // -------------------------------------------------------------
  // USER CRUD ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'password123',
      role: 'member',
      district: 'पुणे',
      taluka: 'हवेली',
      kul: '९६ कुळी मराठा',
      gotra: 'कश्यप',
      tier: 'Gold',
      profession: 'व्यावसायिक',
      business: '',
      verified: true
    });
    setModalType('addUser');
  };

  const handleOpenViewUser = async (u) => {
    setActiveItem(u);
    setModalType('viewUser');
    try {
      const full = await apiClient.getAdminUser(u.id);
      if (full) {
        setActiveItem(prev => ({
          ...prev,
          ...full,
          phone: full.phone || full.mobile || prev.phone,
          email: full.email || prev.email,
          rawEmail: full.email || prev.rawEmail
        }));
      }
    } catch (err) {
      console.warn('Could not fetch real-time full details:', err);
    }
  };

  const handleOpenEditUser = (u) => {
    setActiveItem(u);
    setFormData({
      name: u.name || '',
      email: u.rawEmail || u.email || '',
      phone: u.phone || '',
      role: u.role || 'member',
      district: u.district || 'पुणे',
      taluka: u.taluka || '',
      kul: u.kul || '९६ कुळी मराठा',
      gotra: u.gotra || '',
      tier: u.tier || 'Gold',
      profession: u.profession || 'व्यवसायिक / नोकरी',
      business: u.business || '',
      verified: Boolean(u.verified)
    });
    setModalType('editUser');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'addUser') {
        const res = await apiClient.createAdminUser(formData);
        if (res.success || res.member || res.user) {
          showToast(`वापरकर्ता "${formData.name}" यशस्वीरित्या नोंदवला गेला! लॉगिन पासवर्ड: ${formData.password || 'password123'}`);
          setModalType(null);
          // Immediate refresh
          loadAllData();
        } else {
          showToast(res.message || 'वापरकर्ता तयार करता आला नाही.', 'error');
        }
      } else {
        const res = await apiClient.updateAdminUser(activeItem.id, formData);
        if (res.success || res.user || res.member) {
          showToast(`वापरकर्ता "${formData.name}" माहिती अद्यतनित झाली!`);
          setModalType(null);
          loadAllData();
        } else {
          showToast(res.message || 'अद्यतन करता आले नाही.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'सर्व्हर त्रुटी आली.', 'error');
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`तुम्हाला नक्की "${u.name}" (ID: ${u.id}) हा वापरकर्ता काढायचा आहे का?`)) return;
    try {
      const res = await apiClient.deleteAdminUser(u.id);
      if (res.success) {
        showToast(`वापरकर्ता "${u.name}" यशस्वीरित्या हटवला.`);
        setUsers(users.filter(x => x.id !== u.id));
      } else {
        showToast(res.message || 'वापरकर्ता हटवता आला नाही.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'त्रुटी आली.', 'error');
    }
  };

  const handleToggleVerification = async (u) => {
    const newStatus = !u.verified;
    try {
      await apiClient.updateAdminUser(u.id, { verified: newStatus, verified_profile: newStatus ? 1 : 0 });
      showToast(`वापरकर्ता "${u.name}" चे स्टेटस ${newStatus ? 'प्रमाणित (Verified)' : 'प्रलंबित (Pending)'} करण्यात आले.`);
      setUsers(users.map(item => item.id === u.id ? { ...item, verified: newStatus } : item));
    } catch (err) {
      showToast('पडताळणी स्टेटस बदलता आले नाही.', 'error');
    }
  };

  const handleQuickRoleChange = async (u, newRole) => {
    try {
      await apiClient.assignAdminRole(u.id, newRole, u.district || 'महाराष्ट्र', 'Admin कन्सोलवरून थेट बदल');
      showToast(`वापरकर्ता "${u.name}" ची भूमिका बदलून "${newRole}" केली.`);
      setUsers(users.map(item => item.id === u.id ? { ...item, role: newRole } : item));
    } catch (err) {
      showToast('भूमिका बदलण्यात अयशस्वी.', 'error');
    }
  };

  // -------------------------------------------------------------
  // DOCTORS CRUD ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddDoctor = () => {
    setFormData({
      name: '',
      degree: 'M.B.B.S., M.D.',
      specialty: 'हृदयरोग तज्ज्ञ (Cardiologist)',
      hospital: 'सह्याद्री हॉस्पिटल',
      city: 'पुणे',
      district: 'पुणे',
      phone: '',
      experience: '१०+ वर्षे',
      consultationFee: '₹५००'
    });
    setModalType('addDoctor');
  };

  const handleOpenEditDoctor = (d) => {
    setActiveItem(d);
    setFormData({
      name: d.name || '',
      degree: d.degree || '',
      specialty: d.specialty || '',
      hospital: d.hospital || '',
      city: d.city || '',
      district: d.district || '',
      phone: d.phone || '',
      experience: d.experience || '',
      consultationFee: d.consultationFee || ''
    });
    setModalType('editDoctor');
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'addDoctor') {
        const res = await apiClient.createAdminDoctor(formData);
        if (res.success) {
          showToast(`डॉक्टर "${formData.name}" जोडण्यात आले!`);
          setModalType(null);
          loadAllData();
        }
      } else {
        const res = await apiClient.updateAdminDoctor(activeItem.id, formData);
        if (res.success) {
          showToast(`डॉक्टर "${formData.name}" माहिती अद्यतनित झाली!`);
          setModalType(null);
          loadAllData();
        }
      }
    } catch (err) {
      showToast(err.message || 'त्रुटी.', 'error');
    }
  };

  const handleDeleteDoctor = async (d) => {
    if (!window.confirm(`तुम्हाला नक्की डॉ. "${d.name}" काढायचे आहेत का?`)) return;
    try {
      const res = await apiClient.deleteAdminDoctor(d.id);
      if (res.success) {
        showToast('डॉक्टर यशस्वीरित्या काढण्यात आले.');
        setDoctors(doctors.filter(item => item.id !== d.id));
      }
    } catch (err) {
      showToast('हटवता आले नाही.', 'error');
    }
  };

  // -------------------------------------------------------------
  // SERVICES CRUD ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddService = () => {
    setFormData({
      name: '',
      category: 'कायदेशीर सल्लागार (Legal Advocate)',
      location: 'पुणे',
      phone: '',
      rating: '4.9 ★',
      pricing: 'वाजवी दर',
      description: ''
    });
    setModalType('addService');
  };

  const handleOpenEditService = (s) => {
    setActiveItem(s);
    setFormData({
      name: s.name || '',
      category: s.category || '',
      location: s.location || '',
      phone: s.phone || '',
      rating: s.rating || '',
      pricing: s.pricing || '',
      description: s.description || ''
    });
    setModalType('editService');
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'addService') {
        const res = await apiClient.createAdminService(formData);
        if (res.success) {
          showToast(`सेवा "${formData.name}" जोडण्यात आली!`);
          setModalType(null);
          loadAllData();
        }
      } else {
        const res = await apiClient.updateAdminService(activeItem.id, formData);
        if (res.success) {
          showToast(`सेवा "${formData.name}" अद्यतनित झाली!`);
          setModalType(null);
          loadAllData();
        }
      }
    } catch (err) {
      showToast(err.message || 'त्रुटी.', 'error');
    }
  };

  const handleDeleteService = async (s) => {
    if (!window.confirm(`तुम्हाला नक्की सेवा "${s.name}" काढायची आहे का?`)) return;
    try {
      const res = await apiClient.deleteAdminService(s.id);
      if (res.success) {
        showToast('सेवा काढून टाकली.');
        setServices(services.filter(item => item.id !== s.id));
      }
    } catch (err) {
      showToast('हटवता आले नाही.', 'error');
    }
  };

  // -------------------------------------------------------------
  // HOTELS CRUD ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddHotel = () => {
    setFormData({
      name: '',
      city: 'पुणे',
      district: 'पुणे',
      category: 'हेरिटेज रिसॉर्ट',
      star_rating: 4.8,
      address: '',
      phone: '',
      website: '',
      rooms_count: 25,
      price_range: '₹२,००० - ₹५,०००'
    });
    setModalType('addHotel');
  };

  const handleOpenEditHotel = (h) => {
    setActiveItem(h);
    setFormData({
      name: h.name || '',
      city: h.city || '',
      district: h.district || '',
      category: h.category || '',
      star_rating: h.star_rating || 4.5,
      address: h.address || '',
      phone: h.phone || '',
      website: h.website || '',
      rooms_count: h.rooms_count || 10,
      price_range: h.price_range || ''
    });
    setModalType('editHotel');
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'addHotel') {
        const res = await apiClient.createAdminHotel(formData);
        if (res.success) {
          showToast(`हॉटेल "${formData.name}" जोडण्यात आले!`);
          setModalType(null);
          loadAllData();
        }
      } else {
        const res = await apiClient.updateAdminHotel(activeItem.id, formData);
        if (res.success) {
          showToast(`हॉटेल "${formData.name}" अद्यतनित झाले!`);
          setModalType(null);
          loadAllData();
        }
      }
    } catch (err) {
      showToast(err.message || 'त्रुटी.', 'error');
    }
  };

  const handleDeleteHotel = async (h) => {
    if (!window.confirm(`तुम्हाला नक्की हॉटेल "${h.name}" काढायचे आहे का?`)) return;
    try {
      const res = await apiClient.deleteAdminHotel(h.id);
      if (res.success) {
        showToast('हॉटेल काढून टाकले.');
        setHotels(hotels.filter(item => item.id !== h.id));
      }
    } catch (err) {
      showToast('हटवता आले नाही.', 'error');
    }
  };

  // -------------------------------------------------------------
  // INFORMATION CRUD ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddInfo = () => {
    setFormData({
      title: '',
      category: 'इतिहास व संस्कृती',
      author: 'प्रशासक मंडळ',
      summary: '',
      content: '',
      tags: 'इतिहास, गडकोट'
    });
    setModalType('addInfo');
  };

  const handleOpenEditInfo = (item) => {
    setActiveItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || '',
      author: item.author || '',
      summary: item.summary || '',
      content: item.content || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || ''
    });
    setModalType('editInfo');
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
      };

      if (modalType === 'addInfo') {
        const res = await apiClient.createAdminInformation(payload);
        if (res.success) {
          showToast(`माहिती लेख "${formData.title}" जोडण्यात आला!`);
          setModalType(null);
          loadAllData();
        }
      } else {
        const res = await apiClient.updateAdminInformation(activeItem.id, payload);
        if (res.success) {
          showToast(`माहिती लेख "${formData.title}" अद्यतनित झाला!`);
          setModalType(null);
          loadAllData();
        }
      }
    } catch (err) {
      showToast(err.message || 'त्रुटी.', 'error');
    }
  };

  const handleDeleteInfo = async (item) => {
    if (!window.confirm(`तुम्हाला नक्की लेख "${item.title}" काढायचा आहे का?`)) return;
    try {
      const res = await apiClient.deleteAdminInformation(item.id);
      if (res.success) {
        showToast('माहिती लेख काढण्यात आला.');
        setInformation(information.filter(i => i.id !== item.id));
      }
    } catch (err) {
      showToast('हटवता आले नाही.', 'error');
    }
  };

  return (
    <div className="superadmin-page" style={{ background: '#FFFDF9', color: '#1E293B', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Notification */}
      {feedback && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          padding: '16px 24px',
          borderRadius: '12px',
          background: feedback.type === 'error' ? '#DC2626' : '#EA580C',
          color: '#FFFFFF',
          fontWeight: 800,
          boxShadow: '0 10px 30px rgba(234, 88, 12, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '2px solid #FFFFFF'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
          <span style={{ fontSize: '0.95rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* Top Banner (White & Orange Theme) */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)',
        padding: '36px 24px',
        borderBottom: '2.5px solid #EA580C',
        boxShadow: '0 4px 20px rgba(234, 88, 12, 0.08)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EA580C', borderRadius: '30px', padding: '6px 18px', fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '12px', boxShadow: '0 2px 10px rgba(234, 88, 12, 0.3)' }}>
              <span>👑 केंद्रीय ॲडमिन कन्सोल (Admin Supreme Console)</span>
              <span>•</span>
              <span>थेट डेटाबेस रिअल-टाइम नियंत्रण</span>
            </div>
            <h1 style={{ margin: '4px 0 8px 0', fontSize: '2.2rem', fontWeight: 900, color: '#431407', letterSpacing: '-0.5px' }}>
              केंद्रीय प्रशासकीय व्यवस्थापन केंद्र (Admin Management Hub)
            </h1>
            <p style={{ margin: 0, color: '#9A3412', fontSize: '1rem', fontWeight: 700 }}>
              सर्व ३६ जिल्हे, वापरकर्ते, भूमिका, डॉक्टर्स, सेवा, हॉटेल्स आणि Connect Maratha माहितीवरील संपूर्ण रीअल-टाइम CRUD नियंत्रण.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/admin/cms"
              className="btn"
              style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#FFFFFF', fontWeight: '900', border: 'none', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)' }}>
              🎨 CMS वेबसाइट एडिटर
            </Link>
            <Link
              to="/crm"
              className="btn btn-outline"
              style={{ background: '#FFFFFF', border: '2px solid #EA580C', color: '#EA580C', fontWeight: '800', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none' }}>
              🚩 CRM पोर्टल
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Admin Quick Access Bar */}
        {(!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'ceo')) && (
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #EA580C',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '26px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 25px rgba(234, 88, 12, 0.12)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EA580C', fontWeight: 900, fontSize: '1.1rem' }}>
                <span>👑 प्रशासकीय अधिकार (Admin Authorization)</span>
              </div>
              <div style={{ color: '#475569', fontSize: '0.95rem', marginTop: '6px', maxWidth: '850px', lineHeight: 1.5, fontWeight: 600 }}>
                सध्या तुम्ही {user ? `"${user.name}" (${user.role || 'member'})` : 'अतिथी (Guest)'} म्हणून कन्सोल पाहत आहात. वापरकर्ते बदलणे/हटवणे आणि डेटाबेस थेट अपडेट करण्यासाठी Admin खाते आवश्यक आहे.
              </div>
            </div>
            <button
              onClick={handleQuickAdminLogin}
              style={{
                background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.95rem',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(234, 88, 12, 0.35)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              <span>⚡</span>
              <span>Admin म्हणून थेट १-क्लिक लॉगिन करा</span>
            </button>
          </div>
        )}

        {/* Top Metric Cards - Bright White & Orange with High-Contrast Bold Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {/* TOTAL USERS CARD (PRIMARY HIGHLIGHT) */}
          <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '2.5px solid #EA580C', boxShadow: '0 8px 25px rgba(234, 88, 12, 0.12)' }}>
            <div style={{ fontSize: '0.9rem', color: '#EA580C', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
              👥 एकूण नोंदणीकृत वापरकर्ते (Total Users)
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#EA580C', marginTop: '4px', letterSpacing: '-0.5px' }}>
              {userStats.total || users.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px', fontWeight: 700 }}>
              थेट डेटाबेस रिअल-टाइम संख्या
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.9rem', color: '#9A3412', fontWeight: 800 }}>✅ प्रमाणित सभासद (Verified)</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#16A34A', marginTop: '4px', letterSpacing: '-0.5px' }}>
              {userStats.verifiedMembers || users.filter(u => u.verified).length}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>ओळखपत्र प्रमाणित</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.9rem', color: '#9A3412', fontWeight: 800 }}>⏳ प्रलंबित पडताळणी (Pending)</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#DC2626', marginTop: '4px', letterSpacing: '-0.5px' }}>
              {userStats.pendingVerifications || users.filter(u => !u.verified).length}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>छाननी प्रक्रियेत</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.9rem', color: '#9A3412', fontWeight: 800 }}>👑 मुख्य ॲडमिन व प्रमुख</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#D97706', marginTop: '4px', letterSpacing: '-0.5px' }}>
              {(userStats.superadmins || 0) + (userStats.admins || 0)}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>जिल्हाप्रमुख: {userStats.districtHeads || 0}</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.9rem', color: '#9A3412', fontWeight: 800 }}>🩺 नोंदणीकृत डॉक्टर्स</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#2563EB', marginTop: '4px', letterSpacing: '-0.5px' }}>{doctors.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>आरोग्य सल्लागार</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.9rem', color: '#9A3412', fontWeight: 800 }}>🛠️ सेवा व प्रदाते (Services)</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#7C3AED', marginTop: '4px', letterSpacing: '-0.5px' }}>{services.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>स्थानिक व्यावसायिक</div>
          </div>

          {/* REFERRALS INTELLIGENCE CARD */}
          <div 
            onClick={() => setActiveTab('referrals')}
            style={{ 
              background: '#FFFFFF', 
              padding: '22px', 
              borderRadius: '16px', 
              border: activeTab === 'referrals' ? '2.5px solid #EA580C' : '1.5px solid #FED7AA', 
              boxShadow: activeTab === 'referrals' ? '0 8px 25px rgba(234, 88, 12, 0.2)' : '0 4px 15px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
            <div style={{ fontSize: '0.9rem', color: '#EA580C', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🤝 एकूण रेफरल शिफारसी
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#EA580C', marginTop: '4px', letterSpacing: '-0.5px' }}>
              {referralReportData.stats.total}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#16A34A', marginTop: '4px', fontWeight: 700 }}>
              सक्रिय: {referralReportData.stats.activeCount} | ₹{referralReportData.stats.totalBonusPaid} वितरित
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #FED7AA', paddingBottom: '14px', marginBottom: '26px', overflowX: 'auto' }}>
          {[
            { id: 'users', label: '👥 वापरकर्ते (Users CRUD)', count: users.length },
            { id: 'opportunities', label: '💼 नोकऱ्या व लीड्स (Jobs & Leads)', count: jobApps.length + enquiries.length },
            { id: 'referrals', label: '🤝 रेफरल अहवाल (Referral Intelligence)', count: referralReportData.filtered.length },
            { id: 'doctors', label: '🩺 डॉक्टर्स (Doctors)', count: doctors.length },
            { id: 'services', label: '🛠️ सेवा व प्रदाते (Services)', count: services.length },
            { id: 'hotels', label: '🏨 हॉटेल्स व लॉजिंग (Hotels)', count: hotels.length },
            { id: 'information', label: '📖 माहिती लेख (Information)', count: information.length },
            { id: 'roles', label: '🛡️ भूमिका मॅट्रिक्स (Roles Matrix)', count: rolesMatrix.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 22px',
                borderRadius: '10px',
                border: activeTab === tab.id ? '2px solid #EA580C' : '1.5px solid #FED7AA',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #EA580C, #C2410C)' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#7C2D12',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(234, 88, 12, 0.25)' : 'none'
              }}>
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.id ? '#FFFFFF' : '#FFF7ED',
                color: activeTab === tab.id ? '#EA580C' : '#EA580C',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                fontWeight: 900,
                border: activeTab === tab.id ? 'none' : '1px solid #FED7AA'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* =========================================================================
            TAB 1: USERS MANAGEMENT (CRUD)
        ========================================================================= */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
              <form onSubmit={handleUserSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '550px' }}>
                <input
                  type="text"
                  placeholder="नाव, फोन, ई-मेल, जिल्हा किंवा कुळानुसार शोधा..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1.5px solid #FED7AA',
                    color: '#1E293B',
                    fontWeight: 700,
                    outline: 'none',
                    fontSize: '0.92rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)'
                  }}>
                  शोधा
                </button>
              </form>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ padding: '11px 16px', borderRadius: '10px', background: '#FFFFFF', border: '1.5px solid #FED7AA', color: '#1E293B', fontWeight: 800, fontSize: '0.88rem', outline: 'none' }}>
                  <option value="all">सर्व भूमिका (All Roles)</option>
                  <option value="superadmin">👑 SuperAdmin</option>
                  <option value="admin">🏛️ Admin / CEO</option>
                  <option value="district_admin">📍 जिल्हा प्रमुख</option>
                  <option value="chapter_president">💼 चॅप्टर अध्यक्ष</option>
                  <option value="seva_helpdesk">🩺 सेवा हेल्पडेस्क</option>
                  <option value="member">👤 सामान्य सदस्य</option>
                </select>

                <select
                  value={userVerifiedFilter}
                  onChange={(e) => setUserVerifiedFilter(e.target.value)}
                  style={{ padding: '11px 16px', borderRadius: '10px', background: '#FFFFFF', border: '1.5px solid #FED7AA', color: '#1E293B', fontWeight: 800, fontSize: '0.88rem', outline: 'none' }}>
                  <option value="all">सर्व पडताळणी स्थिती</option>
                  <option value="true">✅ प्रमाणित (Verified)</option>
                  <option value="false">⏳ प्रलंबित (Pending)</option>
                </select>

                <button
                  onClick={handleOpenAddUser}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    padding: '11px 22px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.92rem',
                    boxShadow: '0 4px 18px rgba(234, 88, 12, 0.35)'
                  }}>
                  <span>➕ नवीन वापरकर्ता जोडा</span>
                </button>
              </div>
            </div>

            {/* Users Table (Bright High-Contrast Theme) */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>वापरकर्ता (User)</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>संपर्क व ईमेल</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>स्थान व कुळ</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>भूमिका (Role)</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>पडताळणी</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>श्रेणी</th>
                    <th style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 900 }}>कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontWeight: 800, fontSize: '1.05rem' }}>
                        कोणताही वापरकर्ता सापडला नाही.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div 
                            onClick={() => handleOpenViewUser(u)}
                            style={{ fontWeight: 900, color: '#EA580C', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            title="संपूर्ण प्रोफाइल तपशील पाहण्यासाठी क्लिक करा">
                            <span>{u.role === 'superadmin' ? '👑 ' : u.role === 'admin' ? '🏛️ ' : '👤 '}</span>
                            <span style={{ textDecoration: 'underline', color: '#0F172A' }}>{u.name}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px', fontWeight: 700 }}>आयडी: {u.id}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '0.92rem' }}>📞 {u.phone}</div>
                          <div style={{ fontSize: '0.85rem', color: '#EA580C', fontWeight: 700, marginTop: '2px' }}>✉️ {u.email}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 800 }}>📍 {u.district || 'महाराष्ट्र'}{u.taluka ? `, ${u.taluka}` : ''}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, marginTop: '2px' }}>कुळ: {u.kul || '९६ कुळी'}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <select
                            value={u.role || 'member'}
                            onChange={(e) => handleQuickRoleChange(u, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#FFF7ED',
                              border: '1.5px solid #FED7AA',
                              color: '#9A3412',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              outline: 'none'
                            }}>
                              <option value="superadmin">👑 superadmin</option>
                              <option value="ceo">🦅 ceo</option>
                              <option value="admin">🏛️ admin</option>
                              <option value="district_admin">📍 district_admin</option>
                              <option value="chapter_president">💼 chapter_president</option>
                              <option value="seva_helpdesk">🩺 seva_helpdesk</option>
                              <option value="member">👤 member</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <button
                            onClick={() => handleToggleVerification(u)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: 'none',
                              background: u.verified ? '#DCFCE7' : '#FEE2E2',
                              color: u.verified ? '#166534' : '#991B1B',
                              fontSize: '0.8rem',
                              fontWeight: 900,
                              cursor: 'pointer'
                            }}
                            title="पडताळणी बदलण्यासाठी क्लिक करा">
                            {u.verified ? '✅ प्रमाणित' : '⏳ प्रलंबित'}
                          </button>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#EA580C', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                            {u.tier || 'Gold'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenViewUser(u)}
                              style={{ padding: '8px 14px', background: '#EA580C', border: 'none', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}
                              title="संपूर्ण तपशील पहा">
                              👁️ तपशील
                            </button>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              style={{ padding: '8px 14px', background: '#FFF7ED', border: '1.5px solid #FED7AA', color: '#9A3412', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}
                              title="माहिती संपादित करा">
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === user?.id || u.id === 'CM-SUPER-001'}
                              style={{
                                padding: '8px 12px',
                                background: (u.id === user?.id || u.id === 'CM-SUPER-001') ? '#E2E8F0' : '#FEE2E2',
                                border: '1px solid #FECACA',
                                color: (u.id === user?.id || u.id === 'CM-SUPER-001') ? '#94A3B8' : '#DC2626',
                                borderRadius: '8px',
                                cursor: (u.id === user?.id || u.id === 'CM-SUPER-001') ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 900
                              }}
                              title="वापरकर्ता हटवा">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: REFERRAL REPORTS & AUDIT INTELLIGENCE (राज्यव्यापी रेफरल अहवाल)
        ========================================================================= */}
        {activeTab === 'referrals' && (
          <div>
            {/* Header with Title and Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', color: '#431407', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🤝</span>
                  <span>राज्यव्यापी रेफरल बुद्धिमत्ता व ऑडिट अहवाल</span>
                </h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', fontWeight: 600 }}>
                  शहर, जिल्हा, तालुका, कालावधी (आज / आठवडा / महिना), भूमिका, सभासदत्व व शिफारसकर्ता आयडीनुसार अचूक विश्लेषण.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetReferralFilters}
                  style={{
                    background: '#FFF7ED',
                    border: '1.5px solid #FED7AA',
                    color: '#EA580C',
                    fontWeight: 900,
                    padding: '10px 18px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                  <span>🔄</span>
                  <span>फिल्टर्स रीसेट करा</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportReferralsToCSV(referralReportData.filtered);
                    showToast('📥 रेफरल अहवाल CSV फाईल यशस्वीरित्या डाउनलोड झाली!', 'success');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    padding: '11px 22px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                  <span>📥</span>
                  <span>एक्सेल / CSV अहवाल डाउनलोड करा ({referralReportData.filtered.length})</span>
                </button>
              </div>
            </div>

            {/* Filter Console Box */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #FED7AA',
              padding: '22px',
              marginBottom: '26px',
              boxShadow: '0 4px 20px rgba(234, 88, 12, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#9A3412', fontWeight: 900, fontSize: '1rem' }}>
                <span>🎯</span>
                <span>रेफरल डेटा फिल्टर्स (Advanced Filters)</span>
              </div>

              {/* Grid of filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                {/* 1. Search Query */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    🔍 मोफत शोध (नाव / फोन / आयडी)
                  </label>
                  <input
                    type="text"
                    placeholder="शोधण्यासाठी टाईप करा..."
                    value={refSearch}
                    onChange={(e) => setRefSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 2. District / City Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    🏙️ जिल्हा / शहर (City / District)
                  </label>
                  <select
                    value={refDistrict}
                    onChange={(e) => {
                      setRefDistrict(e.target.value);
                      setRefTaluka('all');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}>
                    <option value="all">सर्व जिल्हे / शहरे (All Districts)</option>
                    {MAHARASHTRA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Taluka Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    📍 तालुका (Taluka)
                  </label>
                  <select
                    value={refTaluka}
                    onChange={(e) => setRefTaluka(e.target.value)}
                    disabled={refDistrict === 'all'}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: refDistrict === 'all' ? '#F1F5F9' : '#FFF7ED',
                      fontSize: '0.9rem',
                      color: refDistrict === 'all' ? '#94A3B8' : '#1E293B',
                      fontWeight: 700,
                      cursor: refDistrict === 'all' ? 'not-allowed' : 'pointer',
                      boxSizing: 'border-box'
                    }}>
                    <option value="all">{refDistrict === 'all' ? 'सर्व तालुके (प्रथम जिल्हा निवडा)' : 'सर्व तालुके (All Talukas)'}</option>
                    {refDistrict !== 'all' && (DISTRICT_TALUKAS[refDistrict] || []).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Roles Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    💼 सभासद भूमिका (Role)
                  </label>
                  <select
                    value={refRole}
                    onChange={(e) => setRefRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}>
                    <option value="all">सर्व भूमिका (All Roles)</option>
                    <option value="member">सामान्य सभासद (Member)</option>
                    <option value="entrepreneur">उद्योजक (Entrepreneur)</option>
                    <option value="business">व्यावसायिक (Business)</option>
                    <option value="professional">नोकरदार/तज्ज्ञ (Professional)</option>
                    <option value="chapter_president">शाखा अध्यक्ष (Chapter President)</option>
                    <option value="district_admin">जिल्हा ॲडमिन (District Admin)</option>
                    <option value="student">विद्यार्थी / युवा (Student)</option>
                  </select>
                </div>

                {/* 5. Timeframe Shortcuts (Today / Week / Month / All) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    📅 कालावधी (Timeframe)
                  </label>
                  <select
                    value={refTimeframe}
                    onChange={(e) => setRefTimeframe(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}>
                    <option value="all">सर्व काळ (All Time)</option>
                    <option value="today">⚡ आज (Today)</option>
                    <option value="week">📅 चालू आठवडा (This Week - 7 Days)</option>
                    <option value="month">🗓️ चालू महिना (This Month)</option>
                    <option value="custom">🎯 विशिष्ट तारीख मर्यादा (Custom Range)</option>
                  </select>
                </div>

                {/* 6. Date Range Start (Only active / visible when custom, or anytime) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    🗓️ तारीख पासून (Start Date)
                  </label>
                  <input
                    type="date"
                    value={refStartDate}
                    onChange={(e) => {
                      setRefStartDate(e.target.value);
                      if (refTimeframe !== 'custom') setRefTimeframe('custom');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.88rem',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 7. Date Range End */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    🗓️ तारीख पर्यंत (End Date)
                  </label>
                  <input
                    type="date"
                    value={refEndDate}
                    onChange={(e) => {
                      setRefEndDate(e.target.value);
                      if (refTimeframe !== 'custom') setRefTimeframe('custom');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.88rem',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 8. Specific Referrer ID Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    🪪 शिफारसकर्ता आयडी (Referrer ID)
                  </label>
                  <select
                    value={refReferrerId}
                    onChange={(e) => setRefReferrerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}>
                    <option value="all">सर्व शिफारसकर्ते (All Referrers)</option>
                    {KNOWN_OFFICIAL_REFERRERS.map(k => (
                      <option key={k.id} value={k.id}>{k.id} - {k.name} ({k.district})</option>
                    ))}
                  </select>
                </div>

                {/* 9. Subscription Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '5px' }}>
                    ⚡ सदस्यत्व स्थिती (Subscription)
                  </label>
                  <select
                    value={refStatus}
                    onChange={(e) => setRefStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      background: '#FFF7ED',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}>
                    <option value="all">सर्व स्थिती (All Status)</option>
                    <option value="active">✅ सक्रिय व सशुल्क (Active Paid)</option>
                    <option value="pending">⏳ प्रलंबित सदस्यत्व (Pending Subscription)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Result Key Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '26px' }}>
              <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '2px solid #EA580C', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.08)' }}>
                <div style={{ fontSize: '0.84rem', color: '#EA580C', fontWeight: 900 }}>📊 एकूण रेफरल शिफारसी</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
                  {referralReportData.stats.total}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>फिल्टर केलेल्या नोंदी</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.84rem', color: '#16A34A', fontWeight: 900 }}>✅ सक्रिय सशुल्क सभासद</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
                  {referralReportData.stats.activeCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>शुल्क भरलेले व सत्यापित</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.84rem', color: '#DC2626', fontWeight: 900 }}>⏳ प्रलंबित सदस्यत्व</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
                  {referralReportData.stats.pendingCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>नोंदणी पूर्ण, शुल्क बाकी</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.84rem', color: '#9A3412', fontWeight: 900 }}>💰 वितरित कमिशन (बोनस)</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
                  ₹{referralReportData.stats.totalBonusPaid.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>₹१०० प्रति सक्रिय सदस्य</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.84rem', color: '#D97706', fontWeight: 900 }}>⌛ प्रलंबित देय रक्कम</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>
                  ₹{referralReportData.stats.pendingBonus.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>सक्रिय झाल्यावर जमा होईल</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.84rem', color: '#2563EB', fontWeight: 900 }}>📈 यशस्विता दर (Conversion)</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#2563EB', marginTop: '4px' }}>
                  {referralReportData.stats.conversionRate}%
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>सक्रिय सदस्य रूपांतरण</div>
              </div>
            </div>

            {/* SECTION 1: TOP REFERRERS LEADERBOARD */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #FED7AA',
              padding: '24px',
              marginBottom: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#431407', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span>
                    <span>अव्वल शिफारसकर्ते लीडरबोर्ड (Top Referrers Performance)</span>
                  </h4>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem', fontWeight: 600 }}>
                    सध्याच्या फिल्टरनुसार सर्वाधिक नवीन सभासद आणणारे आघाडीचे शिफारसकर्ते.
                  </p>
                </div>
                <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '4px 14px', borderRadius: '20px', fontSize: '0.84rem', fontWeight: 900 }}>
                  एकूण {referralReportData.topReferrers.length} सक्रिय शिफारसकर्ते
                </span>
              </div>

              {referralReportData.topReferrers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontWeight: 700 }}>
                  या फिल्टर अंतर्गत कोणतेही शिफारसकर्ते आढळले नाहीत.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA' }}>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>रँक</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>शिफारसकर्ता तपशील</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>जिल्हा / शहर</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}>एकूण रेफरल्स</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}>सक्रिय</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}>प्रलंबित</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}>कमाई (₹)</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'right' }}>कृती</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralReportData.topReferrers.map((tr, idx) => {
                        const rankMedal = idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
                        const isSelected = refReferrerId === tr.referrerId;
                        return (
                          <tr key={tr.referrerId} style={{ borderBottom: '1px solid #FED7AA', background: isSelected ? '#FFF7ED' : idx % 2 === 0 ? '#FFFFFF' : '#FAFAF9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 900, color: idx < 3 ? '#EA580C' : '#64748B', fontSize: '0.95rem' }}>
                              {rankMedal}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 900, color: '#1E293B' }}>{tr.referrerName}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#EA580C', fontSize: '0.82rem', background: '#FFF7ED', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FED7AA' }}>
                                  {tr.referrerId}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '0.88rem' }}>
                              📍 {tr.district}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#1E293B', fontSize: '1.05rem' }}>
                              {tr.total}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 9px', borderRadius: '12px', fontWeight: 900, fontSize: '0.82rem' }}>
                                {tr.active}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <span style={{ background: '#FEF3C7', color: '#B45309', padding: '3px 9px', borderRadius: '12px', fontWeight: 900, fontSize: '0.82rem' }}>
                                {tr.pending}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#EA580C', fontSize: '1rem' }}>
                              ₹{tr.earnings.toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={() => setRefReferrerId('all')}
                                  style={{
                                    background: '#EA580C',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 900,
                                    cursor: 'pointer'
                                  }}>
                                  फिल्टर काढा ✕
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setRefReferrerId(tr.referrerId)}
                                  style={{
                                    background: '#FFF7ED',
                                    color: '#EA580C',
                                    border: '1.5px solid #FED7AA',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 900,
                                    cursor: 'pointer'
                                  }}>
                                  यांचा डेटा पहा 🔍
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 2: DETAILED REFERRAL AUDIT LEDGER TABLE */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #FED7AA',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#431407', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span>
                    <span>सविस्तर रेफरल नोंदी ऑडिट नोंदवही (Referral Audit Ledger)</span>
                  </h4>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem', fontWeight: 600 }}>
                    निवडलेल्या निकषांनुसार प्रत्येक नवीन सदस्याची आणि त्याच्या शिफारसकर्त्याची नोंद.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '6px 14px', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 900 }}>
                    एकूण {referralReportData.filtered.length} नोंदी
                  </span>
                </div>
              </div>

              {referralReportData.filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#FFF7ED', borderRadius: '12px', border: '1.5px dashed #FED7AA' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#431407', fontWeight: 900, fontSize: '1.15rem' }}>कोणत्याही नोंदी आढळल्या नाहीत</h4>
                  <p style={{ margin: '0 0 16px 0', color: '#64748B', fontSize: '0.9rem' }}>कृपया फिल्टर निकष बदला किंवा रीसेट करा.</p>
                  <button
                    type="button"
                    onClick={handleResetReferralFilters}
                    style={{ background: '#EA580C', color: '#FFFFFF', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>
                    फिल्टर्स रीसेट करा
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                    <thead>
                      <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA' }}>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>#</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>नोंदणी तारीख</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>नवीन सभासद (Referee)</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>स्थान (शहर/जिल्हा, तालुका)</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>भूमिका</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900 }}>शिफारसकर्ता (Referrer)</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}>सदस्यत्व स्थिती</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center' }}>कमिशन स्थिती</th>
                        <th style={{ padding: '12px 14px', color: '#7C2D12', fontSize: '0.85rem', fontWeight: 900, textAlign: 'right' }}>कृती</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralReportData.filtered.map((item, idx) => {
                        const isPaid = item.status === 'active';
                        return (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #FED7AA', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF9' }}>
                            <td style={{ padding: '14px', color: '#64748B', fontWeight: 800, fontSize: '0.85rem' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '14px', fontSize: '0.85rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {item.registeredAt || item.date || 'नुकतेच'}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: 900, color: '#1E293B', fontSize: '0.95rem' }}>{item.refereeName}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.82rem', color: '#64748B' }}>
                                <span>📞 {item.refereePhone}</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FED7AA' }}>
                                  {item.refereeId}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.88rem' }}>📍 {item.district || 'महाराष्ट्र'}</div>
                              <div style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>तालुका: {item.taluka || 'सर्व'}</div>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                                {item.role === 'entrepreneur' ? 'उद्योजक' :
                                 item.role === 'business' ? 'व्यावसायिक' :
                                 item.role === 'professional' ? 'प्रोेशनल' :
                                 item.role === 'chapter_president' ? 'शाखा अध्यक्ष' :
                                 item.role === 'district_admin' ? 'जिल्हा ॲडमिन' :
                                 item.role === 'student' ? 'विद्यार्थी' : 'सभासद'}
                              </span>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.88rem' }}>{item.referrerName}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#EA580C', fontSize: '0.8rem', background: '#FFF7ED', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FED7AA' }}>
                                  {item.referrerId}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({item.referrerDistrict || 'महाराष्ट्र'})</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>
                              {isPaid ? (
                                <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <span>✓</span>
                                  <span>सक्रिय सशुल्क</span>
                                </span>
                              ) : (
                                <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <span>⏳</span>
                                  <span>नोंदणी प्रलंबित</span>
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>
                              {isPaid ? (
                                <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '4px 10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 900 }}>
                                  ₹१०० जमा (Paid)
                                </span>
                              ) : (
                                <span style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}>
                                  ₹१०० प्रलंबित (Pending)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.refereeId || item.refereePhone);
                                  showToast(`📋 सभासद आयडी (${item.refereeId}) कॉपी केला!`, 'success');
                                }}
                                title="सभासद आयडी कॉपी करा"
                                style={{
                                  background: '#FFF7ED',
                                  border: '1px solid #FED7AA',
                                  color: '#EA580C',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 800,
                                  fontSize: '0.78rem'
                                }}>
                                📋 कॉपी
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: DOCTORS MANAGEMENT (CRUD)
        ========================================================================= */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#431407', fontWeight: 900 }}>🩺 डॉक्टर्स व वैद्यकीय तज्ज्ञ व्यवस्थापन</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', fontWeight: 600 }}>वेबसाइटवरील अधिकृत मराठा डॉक्टर्स सूची संपादन, जोडणे व व्यवस्थापन.</p>
              </div>
              <button
                onClick={handleOpenAddDoctor}
                style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.92rem', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)' }}>
                ➕ नवीन डॉक्टर जोडा
              </button>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>नाव व पदवी</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>विशेषज्ञता</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>हॉस्पिटल व शहर</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>संपर्क</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>अनुभव / फी</th>
                    <th style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 900 }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontWeight: 800 }}>कोणतेही डॉक्टर उपलब्ध नाहीत.</td></tr>
                  ) : (
                    doctors.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.98rem' }}>{d.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#EA580C', fontWeight: 700 }}>{d.degree || 'M.B.B.S.'}</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 800 }}>{d.specialty}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 800 }}>{d.hospital}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>📍 {d.city}</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#EA580C', fontWeight: 900 }}>📞 {d.phone}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 800 }}>{d.experience || '५+ वर्षे'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 800 }}>{d.consultationFee || '₹५००'}</div>
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditDoctor(d)}
                              style={{ padding: '8px 14px', background: '#FFF7ED', border: '1.5px solid #FED7AA', color: '#9A3412', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(d)}
                              style={{ padding: '8px 12px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: SERVICES & PROVIDERS (CRUD)
        ========================================================================= */}
        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#431407', fontWeight: 900 }}>🛠️ सेवा व सेवा प्रदाते व्यवस्थापन (Services & Providers)</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', fontWeight: 600 }}>स्थानिक व्यावसायिक (कायदेशीर, सीए, इंटिरिअर, सोलर, प्लंबिंग, इ.) जोडा व संपादित करा.</p>
              </div>
              <button
                onClick={handleOpenAddService}
                style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.92rem', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)' }}>
                ➕ नवीन सेवा प्रदाता जोडा
              </button>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>नाव / संस्था</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>सेवा प्रकार</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>स्थान</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>संपर्क</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>रेटिंग / दर</th>
                    <th style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 900 }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontWeight: 800 }}>कोणतीही सेवा उपलब्ध नाही.</td></tr>
                  ) : (
                    services.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 18px', fontWeight: 900, color: '#0F172A' }}>{s.name}</td>
                        <td style={{ padding: '16px 18px', color: '#EA580C', fontWeight: 800 }}>{s.category}</td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 700 }}>📍 {s.location}</td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 900 }}>📞 {s.phone}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 800 }}>{s.rating || '4.8 ★'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>{s.pricing || 'उचित दर'}</div>
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditService(s)}
                              style={{ padding: '8px 14px', background: '#FFF7ED', border: '1.5px solid #FED7AA', color: '#9A3412', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteService(s)}
                              style={{ padding: '8px 12px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: HOTELS & HOSPITALITY (CRUD)
        ========================================================================= */}
        {activeTab === 'hotels' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#431407', fontWeight: 900 }}>🏨 हॉटेल्स, रिसॉर्ट्स व लॉजिंग व्यवस्थापन</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', fontWeight: 600 }}>मराठा पर्यटन व आदरातिथ्य नेटवर्कमधील हॉटेल्स थेट डेटाबेसमध्ये जोडा व संपादित करा.</p>
              </div>
              <button
                onClick={handleOpenAddHotel}
                style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.92rem', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)' }}>
                ➕ नवीन हॉटेल जोडा
              </button>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>हॉटेल नाव</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>शहर / जिल्हा</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>प्रकार व रेटिंग</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>खोल्या</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>दर श्रेणी</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>संपर्क</th>
                    <th style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 900 }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontWeight: 800 }}>कोणतेही हॉटेल नोंदणीकृत नाही.</td></tr>
                  ) : (
                    hotels.map(h => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 18px', fontWeight: 900, color: '#0F172A' }}>🏨 {h.name}</td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 800 }}>📍 {h.city}, {h.district}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{ color: '#EA580C', fontWeight: 800 }}>{h.category}</span>
                          <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>⭐ {h.star_rating || 4.5} Star</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 800 }}>{h.rooms_count} खोल्या</td>
                        <td style={{ padding: '16px 18px', color: '#16A34A', fontWeight: 900 }}>{h.price_range}</td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 900 }}>📞 {h.phone}</td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditHotel(h)}
                              style={{ padding: '8px 14px', background: '#FFF7ED', border: '1.5px solid #FED7AA', color: '#9A3412', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteHotel(h)}
                              style={{ padding: '8px 12px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: INFORMATION ARTICLES (CRUD)
        ========================================================================= */}
        {activeTab === 'information' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#431407', fontWeight: 900 }}>📖 माहिती व ज्ञानकोश लेख व्यवस्थापन (Information CRUD)</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', fontWeight: 600 }}>संस्कृती, इतिहास, किल्ले, उद्योग योजना व संशोधन लेख थेट प्रकाशित करा.</p>
              </div>
              <button
                onClick={handleOpenAddInfo}
                style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.92rem', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)' }}>
                ➕ नवीन माहिती लेख जोडा
              </button>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>शीर्षक (Title)</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>विभाग</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>लेखक</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>टॅग्ज</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>दिनांक</th>
                    <th style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 900 }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {information.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontWeight: 800 }}>कोणताही लेख उपलब्ध नाही.</td></tr>
                  ) : (
                    information.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.98rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{item.summary?.slice(0, 70)}...</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#EA580C', fontWeight: 900 }}>{item.category}</td>
                        <td style={{ padding: '16px 18px', color: '#0F172A', fontWeight: 800 }}>✍️ {item.author}</td>
                        <td style={{ padding: '16px 18px', color: '#64748B', fontWeight: 700 }}>
                          {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
                        </td>
                        <td style={{ padding: '16px 18px', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                          {item.created_at?.split('T')[0] || '२०२६'}
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditInfo(item)}
                              style={{ padding: '8px 14px', background: '#FFF7ED', border: '1.5px solid #FED7AA', color: '#9A3412', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteInfo(item)}
                              style={{ padding: '8px 12px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: ROLES & PERMISSIONS MATRIX
        ========================================================================= */}
        {activeTab === 'roles' && (
          <div>
            <div style={{ marginBottom: '26px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', color: '#431407', fontWeight: 900 }}>🛡️ पद व अधिकार मॅट्रिक्स (Roles & Access Control)</h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>Connect Maratha मधील प्रत्येक पदाचे अधिकार, कार्यकक्षा व नियमन रचना.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {rolesMatrix.map((r, idx) => (
                <div key={idx} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#431407' }}>{r.titleMarathi}</span>
                    <span style={{ background: '#EA580C', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900 }}>
                      {r.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px', fontWeight: 700 }}>
                    <span style={{ color: '#EA580C' }}>📍 कार्यकक्षा:</span> {r.scope}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>अधिकार (Permissions):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {r.permissions?.map((p, pIdx) => (
                        <span key={pIdx} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#EA580C', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                          🔑 {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: OPPORTUNITIES, JOBS & CLIENT LEADS HUB
        ========================================================================= */}
        {activeTab === 'opportunities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Top Stat Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 800 }}>एकूण नोकरी अर्ज (Applications)</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#EA580C', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {jobApps.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700 }}>राज्यभरातून प्राप्त अर्ज</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 800 }}>मुलाखतीसाठी निवड (Shortlisted)</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#15803D', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {jobApps.filter(a => a.status?.includes('Shortlist')).length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>अंतिम निवड प्रक्रियेत</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 800 }}>ग्राहक Enquiries व B2B Leads</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#C2410C', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  {enquiries.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700 }}>व्यावसायिक कोटेशन्स सुरू</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 800 }}>सक्रिय संधी (Live Opportunities)</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '4px 0', fontFamily: 'Baloo 2' }}>
                  १२८+
                </div>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700 }}>पोर्टलवर थेट उपलब्ध</div>
              </div>
            </div>

            {/* 1. Job Applications Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.35rem', color: '#431407', fontFamily: 'Baloo 2', fontWeight: 900 }}>
                    💼 नोकरी अर्ज व उमेदवार यादी (Candidate Applications)
                  </h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
                    Connect Maratha Jobs Portal द्वारे महाराष्ट्रातील कंपन्यांसाठी आलेले सर्व अधिकृत उमेदवारांचे अर्ज.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    to="/jobs"
                    target="_blank"
                    style={{ background: '#FFF7ED', color: '#EA580C', border: '1.5px solid #FED7AA', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}
                  >
                    Jobs Portal थेट पहा ➔
                  </Link>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                      <th style={{ padding: '12px 14px' }}>अर्ज क्र.</th>
                      <th style={{ padding: '12px 14px' }}>उमेदवाराचे नाव</th>
                      <th style={{ padding: '12px 14px' }}>पद (Job Title)</th>
                      <th style={{ padding: '12px 14px' }}>कंपनी</th>
                      <th style={{ padding: '12px 14px' }}>जिल्हा</th>
                      <th style={{ padding: '12px 14px' }}>मोबाईल</th>
                      <th style={{ padding: '12px 14px' }}>शिक्षण व सारांश</th>
                      <th style={{ padding: '12px 14px' }}>स्थिती (Status)</th>
                      <th style={{ padding: '12px 14px' }}>तारीख</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobApps.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                          सध्या कोणताही नोकरी अर्ज नोंद झालेला नाही.
                        </td>
                      </tr>
                    ) : (
                      jobApps.map(app => (
                        <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#C2410C' }}>{app.id}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1E293B' }}>{app.applicantName}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#431407' }}>{app.jobTitle}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{app.company}</td>
                          <td style={{ padding: '12px 14px', color: '#1E293B' }}>{app.district || 'पुणे'}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{app.applicantPhone || '-'}</td>
                          <td style={{ padding: '12px 14px', color: '#64748B', maxWidth: '200px' }}>{app.resumeUrl}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: app.status?.includes('Shortlist') ? '#DCFCE7' : '#FEF3C7',
                              color: app.status?.includes('Shortlist') ? '#15803D' : '#92400E',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 900
                            }}>
                              {app.status || 'Applied'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '0.8rem' }}>
                            {new Date(app.appliedAt).toLocaleDateString('mr-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Client Enquiries & B2B Leads Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.35rem', color: '#431407', fontFamily: 'Baloo 2', fontWeight: 900 }}>
                    🏢 ग्राहक Enquiries व B2B व्यावसायिक Leads
                  </h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
                    राज्यभरातील ग्राहकांनी नोंदवलेल्या थेट व्यावसायिक गरजा आणि व्यावसायिकांचे प्रतिसाद.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    to="/leads"
                    target="_blank"
                    style={{ background: '#FFF7ED', color: '#EA580C', border: '1.5px solid #FED7AA', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}
                  >
                    Leads Portal थेट पहा ➔
                  </Link>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', color: '#9A3412', borderBottom: '2px solid #FED7AA' }}>
                      <th style={{ padding: '12px 14px' }}>क्र.</th>
                      <th style={{ padding: '12px 14px' }}>गरजेचे स्वरूप (Requirement)</th>
                      <th style={{ padding: '12px 14px' }}>उद्योग श्रेणी</th>
                      <th style={{ padding: '12px 14px' }}>जिल्हा / शहर</th>
                      <th style={{ padding: '12px 14px' }}>अंदाजे बजेट</th>
                      <th style={{ padding: '12px 14px' }}>ग्राहक नाव</th>
                      <th style={{ padding: '12px 14px' }}>मोबाईल</th>
                      <th style={{ padding: '12px 14px' }}>कोटेशन्स</th>
                      <th style={{ padding: '12px 14px' }}>स्थिती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                          सध्या कोणतीही ग्राहक Enquiry नोंद झालेली नाही.
                        </td>
                      </tr>
                    ) : (
                      enquiries.map(enq => (
                        <tr key={enq.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#C2410C' }}>{enq.id}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1E293B', maxWidth: '240px' }}>{enq.title}</td>
                          <td style={{ padding: '12px 14px', color: '#78350F', fontWeight: 800 }}>{enq.category}</td>
                          <td style={{ padding: '12px 14px', color: '#1E293B' }}>{enq.city || enq.district}</td>
                          <td style={{ padding: '12px 14px', color: '#15803D', fontWeight: 900 }}>{enq.budget || 'चर्चेनुसार'}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{enq.clientName || 'सभासद'}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{enq.phone || '-'}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#EA580C' }}>
                            {enq.quotesCount || (enq.quotes ? enq.quotes.length : 0)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 900
                            }}>
                              ● {enq.status || 'सक्रिय'}
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
        )}
      </div>

      {/* =========================================================================
          UNIVERSAL MODALS (CLEAN BRIGHT WHITE & ORANGE THEME)
      ========================================================================= */}
      {modalType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #EA580C',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            color: '#1E293B'
          }}>
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FED7AA', paddingBottom: '16px', marginBottom: '22px' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#431407' }}>
                {modalType === 'viewUser' && `🪪 वापरकर्ता संपूर्ण तपशील: ${activeItem?.name}`}
                {modalType === 'addUser' && '➕ नवीन वापरकर्ता तयार करा (Live DB)'}
                {modalType === 'editUser' && `✏️ वापरकर्ता संपादन: ${activeItem?.name}`}
                {modalType === 'addDoctor' && '🩺 नवीन डॉक्टर जोडा'}
                {modalType === 'editDoctor' && `✏️ डॉक्टर संपादन: ${activeItem?.name}`}
                {modalType === 'addService' && '🛠️ नवीन सेवा प्रदाता जोडा'}
                {modalType === 'editService' && `✏️ सेवा संपादन: ${activeItem?.name}`}
                {modalType === 'addHotel' && '🏨 नवीन हॉटेल जोडा'}
                {modalType === 'editHotel' && `✏️ हॉटेल संपादन: ${activeItem?.name}`}
                {modalType === 'addInfo' && '📖 नवीन माहिती लेख जोडा'}
                {modalType === 'editInfo' && `✏️ लेख संपादन: ${activeItem?.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', color: '#EA580C', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {/* VIEW USER DETAILS MODAL */}
            {modalType === 'viewUser' && activeItem && (
              <div>
                {/* Header Profile Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1.5px solid #FED7AA',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px'
                }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    boxShadow: '0 4px 15px rgba(234,88,12,0.35)'
                  }}>
                    {activeItem.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#431407' }}>{activeItem.name}</h4>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '6px', fontWeight: 700 }}>
                      <span style={{ color: '#EA580C' }}>सदस्य आयडी:</span> <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0F172A' }}>{activeItem.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#FFFFFF', border: '1px solid #FED7AA', color: '#EA580C', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                        भूमिका: {activeItem.role || 'member'}
                      </span>
                      <span style={{ background: '#FFFFFF', border: '1px solid #FED7AA', color: '#D97706', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                        श्रेणी: {activeItem.tier || 'Gold'}
                      </span>
                      <span style={{ background: activeItem.verified ? '#DCFCE7' : '#FEE2E2', color: activeItem.verified ? '#166534' : '#991B1B', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 900 }}>
                        {activeItem.verified ? '✅ प्रमाणित सदस्य' : '⏳ पडताळणी प्रलंबित'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Section Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  
                  {/* Section 1: Contact & Account */}
                  <div style={{ background: '#FFFDF9', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#EA580C', marginBottom: '12px' }}>
                      📱 संपर्क व खाते माहिती
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#64748B' }}>मोबाईल:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.phone || 'उपलब्ध नाही'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>ई-मेल:</strong> <span style={{ color: '#EA580C', fontWeight: 800 }}>{activeItem.email || 'उपलब्ध नाही'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>नोंदणी दिनांक:</strong> <span style={{ color: '#0F172A', fontWeight: 700 }}>{activeItem.joined || activeItem.createdAt?.split('T')[0] || '२०२६'}</span></div>
                    </div>
                  </div>

                  {/* Section 2: Social & Cultural */}
                  <div style={{ background: '#FFFDF9', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#EA580C', marginBottom: '12px' }}>
                      🚩 सामाजिक व कुळ माहिती
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#64748B' }}>९६ कुळ:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.kul || '९६ कुळी मराठा'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>गोत्र / देवक:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.gotra || 'नोंद नाही'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>जिल्हा:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.district || 'महाराष्ट्र'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>तालुका / शहर:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.taluka || activeItem.city || activeItem.district || 'पुणे'}</span></div>
                    </div>
                  </div>

                  {/* Section 3: Professional */}
                  <div style={{ background: '#FFFDF9', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#EA580C', marginBottom: '12px' }}>
                      💼 व्यावसायिक व शैक्षणिक
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#64748B' }}>व्यवसाय / क्षेत्र:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.profession || 'व्यवसायिक / नोकरी'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>कंपनी / प्रतिष्ठान:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.business || 'नोंद नाही'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>रक्तगट:</strong> <span style={{ color: '#DC2626', fontWeight: 900 }}>{activeItem.bloodGroup || 'O+'}</span></div>
                    </div>
                  </div>

                  {/* Section 4: Governance & Verification */}
                  <div style={{ background: '#FFFDF9', padding: '18px', borderRadius: '14px', border: '1.5px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#EA580C', marginBottom: '12px' }}>
                      🛡️ प्रशासकीय पडताळणी शेरा
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#64748B' }}>पडताळणी अधिकारी:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.verifiedBy || 'मध्यवर्ती प्रशासक मंडळ'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>शेरा (Remarks):</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.verificationRemarks || 'कागदपत्र पडताळणी पूर्ण झाली'}</span></div>
                      <div><strong style={{ color: '#64748B' }}>अधिकार व्याप्ती:</strong> <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeItem.assignedScope || activeItem.district || 'महाराष्ट्र'}</span></div>
                    </div>
                  </div>

                </div>

                {/* Modal Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '2px solid #FED7AA', paddingTop: '18px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleVerification(activeItem);
                      setActiveItem({ ...activeItem, verified: !activeItem.verified });
                    }}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: activeItem.verified ? '#DC2626' : '#16A34A',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                    {activeItem.verified ? '❌ प्रमाणपत्र रद्द करा' : '✅ अधिकृत प्रमाणित करा'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditUser(activeItem)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                    ✏️ माहिती संपादन
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    style={{
                      padding: '12px 22px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                    बंद करा
                  </button>
                </div>
              </div>
            )}

            {/* USER ADD/EDIT FORM */}
            {(modalType === 'addUser' || modalType === 'editUser') && (
              <form onSubmit={handleSaveUser}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>पूर्ण नाव *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="उदा. राहुल पाटील"
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>फोन नंबर (१० अंकी लॉगिन आयडी) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="उदा. 9876543210"
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>ई-मेल</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="उदा. rahul@example.com"
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>
                      {modalType === 'addUser' ? 'लॉगिन पासवर्ड (Default: password123)' : 'नवीन पासवर्ड'}
                    </label>
                    <input
                      type="password"
                      placeholder={modalType === 'addUser' ? 'password123' : 'रिकामे सोडा जर बदलायचा नसेल'}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>भूमिका (Role) *</label>
                    <select
                      value={formData.role || 'member'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 800, outline: 'none' }}>
                      <option value="member">👤 member (सामान्य सदस्य)</option>
                      <option value="chapter_president">💼 chapter_president (चॅप्टर अध्यक्ष)</option>
                      <option value="district_admin">📍 district_admin (जिल्हा प्रमुख)</option>
                      <option value="seva_helpdesk">🩺 seva_helpdesk (मदत कक्ष)</option>
                      <option value="admin">🏛️ admin (Connect Maratha व्यवस्थापक)</option>
                      <option value="ceo">🦅 ceo (मुख्य कार्यकारी अधिकारी)</option>
                      <option value="superadmin">👑 superadmin (सर्वोच्च प्रशासक)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>श्रेणी (Tier)</label>
                    <select
                      value={formData.tier || 'Gold'}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 800, outline: 'none' }}>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Patron">Patron</option>
                      <option value="Royal Patron">Royal Patron</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="उदा. पुणे"
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>तालुका</label>
                    <input
                      type="text"
                      value={formData.taluka || ''}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                      placeholder="उदा. हवेली"
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>कुळ / ९६ कुळ</label>
                    <input
                      type="text"
                      value={formData.kul || ''}
                      onChange={(e) => setFormData({ ...formData, kul: e.target.value })}
                      placeholder="उदा. ९६ कुळी मराठा"
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800 }}>
                      <input
                        type="checkbox"
                        checked={formData.verified || false}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#EA580C' }}
                      />
                      <span>✅ डिजिटल ओळखपत्र प्रमाणित करा</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    style={{ padding: '12px 22px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#475569', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '12px 26px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 18px rgba(234, 88, 12, 0.35)' }}>
                    डेटाबेसमध्ये जतन करा (Save)
                  </button>
                </div>
              </form>
            )}

            {/* Doctor Form */}
            {(modalType === 'addDoctor' || modalType === 'editDoctor') && (
              <form onSubmit={handleSaveDoctor}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>डॉक्टरचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>पदवी (Degree)</label>
                    <input
                      type="text"
                      value={formData.degree || ''}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>विशेषज्ञता (Specialty)</label>
                    <input
                      type="text"
                      value={formData.specialty || ''}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>हॉस्पिटल नाव</label>
                    <input
                      type="text"
                      value={formData.hospital || ''}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>शहर / जिल्हा</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>संपर्क नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>फी (Consultation Fee)</label>
                    <input
                      type="text"
                      value={formData.consultationFee || ''}
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '12px 20px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#475569', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, borderRadius: '10px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Service Form */}
            {(modalType === 'addService' || modalType === 'editService') && (
              <form onSubmit={handleSaveService}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>सेवा प्रदाता नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>सेवा प्रकार (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>स्थान (Location)</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>संपर्क नंबर</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>दर / फी (Pricing)</label>
                    <input
                      type="text"
                      value={formData.pricing || ''}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '12px 20px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#475569', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, borderRadius: '10px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Hotel Form */}
            {(modalType === 'addHotel' || modalType === 'editHotel') && (
              <form onSubmit={handleSaveHotel}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>हॉटेलचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>शहर</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>हॉटेल प्रकार (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>स्टार रेटिंग</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.star_rating || 4.5}
                      onChange={(e) => setFormData({ ...formData, star_rating: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>दर श्रेणी (Price Range)</label>
                    <input
                      type="text"
                      value={formData.price_range || ''}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>संपर्क फोन</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '12px 20px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#475569', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, borderRadius: '10px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Information Article Form */}
            {(modalType === 'addInfo' || modalType === 'editInfo') && (
              <form onSubmit={handleSaveInfo}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>लेखाचे शीर्षक *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>विभाग (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>लेखक (Author)</label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>संक्षिप्त सारांश (Summary)</label>
                  <textarea
                    rows="2"
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>सविस्तर मजकूर (Full Content)</label>
                  <textarea
                    rows="4"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#431407', fontWeight: 800, marginBottom: '6px' }}>टॅग्ज (स्वल्पविरामाने वेगळे करा)</label>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '12px 20px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#475569', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', border: 'none', color: '#FFFFFF', fontWeight: 900, borderRadius: '10px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
