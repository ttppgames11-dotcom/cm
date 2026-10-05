import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminDashboardPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'doctors' | 'services' | 'hotels' | 'information' | 'roles'
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const handleQuickAdminLogin = async () => {
    try {
      showToast('Admin खात्यात लॉगिन करत आहे...', 'success');
      const res = await login('admin@connectmaratha.org', 'password123');
      if (res && (res.success || res.member)) {
        showToast('यशस्वी! Admin अधिकार प्राप्त झाले.', 'success');
        setTimeout(() => loadAllData(), 500);
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

  // Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userVerifiedFilter, setUserVerifiedFilter] = useState('all');
  const [userActiveFilter, setUserActiveFilter] = useState('all'); // 'all' | 'online'

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
      const [usersRes, docsRes, srvsRes, htlsRes, infoRes, rolesRes] = await Promise.all([
        apiClient.getAdminUsers({
          search: userSearch,
          role: userRoleFilter,
          verified: userVerifiedFilter,
          active: userActiveFilter === 'online' ? 'true' : undefined
        }).catch(() => ({ users: [], stats: {} })),
        apiClient.getAdminDoctors().catch(() => []),
        apiClient.getAdminServices().catch(() => []),
        apiClient.getAdminHotels().catch(() => []),
        apiClient.getAdminInformation().catch(() => []),
        apiClient.getRolesMatrix().catch(() => [])
      ]);

      setUsers(usersRes.users || []);
      setUserStats(usersRes.stats || {});
      setDoctors(docsRes || []);
      setServices(srvsRes || []);
      setHotels(htlsRes || []);
      setInformation(infoRes || []);
      setRolesMatrix(rolesRes || []);
    } catch (err) {
      console.error('Admin load error:', err);
      showToast('माहिती लोड करताना अडचण आली.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userRoleFilter, userVerifiedFilter, userActiveFilter]);

  // Fast Real-Time periodic polling (every 4s) to keep live users and data fresh
  useEffect(() => {
    const pollInterval = setInterval(() => {
      apiClient.getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
        verified: userVerifiedFilter,
        active: userActiveFilter === 'online' ? 'true' : undefined
      }).then(res => {
        if (res && res.users) {
          setUsers(res.users);
          if (res.stats) setUserStats(res.stats);
        }
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [userSearch, userRoleFilter, userVerifiedFilter, userActiveFilter]);

  // Handle user search on enter or debounce
  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    apiClient.getAdminUsers({
      search: userSearch,
      role: userRoleFilter,
      verified: userVerifiedFilter,
      active: userActiveFilter === 'online' ? 'true' : undefined
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
        if (res.success || res.user || res.member) {
          showToast(`वापरकर्ता "${formData.name}" यशस्वीरित्या तयार झाला!`);
          setModalType(null);
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
    <div className="superadmin-page" style={{ background: '#0A0A0C', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Toast Notification */}
      {feedback && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          padding: '16px 24px',
          borderRadius: '12px',
          background: feedback.type === 'error' ? '#D32F2F' : '#EA580C',
          color: '#FFFFFF',
          fontWeight: 800,
          boxShadow: '0 10px 35px rgba(234, 88, 12, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '2px solid #FFFFFF'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
          <span style={{ fontSize: '0.95rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* Top Royal Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #18181B 100%)',
        padding: '36px 24px',
        borderBottom: '3px solid #FF6B00',
        boxShadow: '0 8px 32px rgba(255, 107, 0, 0.15)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FF6B00', borderRadius: '30px', padding: '6px 16px', fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '12px', boxShadow: '0 2px 10px rgba(255, 107, 0, 0.4)' }}>
              <span>👑 केंद्रीय ॲडमिन कन्सोल (Admin Supreme Console)</span>
              <span>•</span>
              <span>थेट डेटाबेस नियंत्रण</span>
            </div>
            <h1 style={{ margin: '4px 0 8px 0', fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              केंद्रीय प्रशासकीय व्यवस्थापन केंद्र (Admin Management Hub)
            </h1>
            <p style={{ margin: 0, color: '#FF9E40', fontSize: '1rem', fontWeight: 600 }}>
              सर्व ३६ जिल्हे, वापरकर्ते, भूमिका, डॉक्टर्स, सेवा, हॉटेल्स आणि महासंघ माहितीवरील संपूर्ण रीअल-टाइम CRUD नियंत्रण.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/admin/cms"
              className="btn"
              style={{ background: 'linear-gradient(135deg, #FF6B00, #EA580C)', color: '#FFFFFF', fontWeight: '900', border: '2px solid #FFFFFF', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(255, 107, 0, 0.35)' }}>
              🎨 CMS वेबसाइट एडिटर
            </Link>
            <Link
              to="/crm"
              className="btn btn-outline"
              style={{ background: '#18181B', border: '2px solid #FF6B00', color: '#FFFFFF', fontWeight: '800', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none' }}>
              🚩 CRM पोर्टल
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Admin Quick Access Bar */}
        {(!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'ceo')) && (
          <div style={{
            background: '#1A1510',
            border: '2px solid #FF6B00',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '26px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 25px rgba(255, 107, 0, 0.2)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8C00', fontWeight: 900, fontSize: '1.1rem' }}>
                <span>👑 प्रशासकीय अधिकार (Admin Authorization)</span>
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '0.95rem', marginTop: '6px', maxWidth: '850px', lineHeight: 1.5, fontWeight: 500 }}>
                सध्या तुम्ही {user ? `"${user.name}" (${user.role || 'member'})` : 'अतिथी (Guest)'} म्हणून कन्सोल पाहत आहात. वापरकर्ते बदलणे/हटवणे आणि डेटाबेस थेट अपडेट करण्यासाठी Admin खाते आवश्यक आहे.
              </div>
            </div>
            <button
              onClick={handleQuickAdminLogin}
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #EA580C)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.95rem',
                padding: '12px 24px',
                borderRadius: '10px',
                border: '2px solid #FFFFFF',
                boxShadow: '0 4px 20px rgba(255, 107, 0, 0.45)',
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

        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#18181B', padding: '20px', borderRadius: '12px', border: '2px solid #FF6B00', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.88rem', color: '#FF9E40', fontWeight: 800 }}>👥 एकूण वापरकर्ते (Total Users)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>{userStats.total || users.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#FFFFFF', marginTop: '4px', fontWeight: 600 }}>प्रमाणित सदस्य: {userStats.verifiedMembers || 0}</div>
          </div>

          <div
            onClick={() => setUserActiveFilter(prev => prev === 'online' ? 'all' : 'online')}
            style={{
              background: userActiveFilter === 'online' ? '#2A1805' : '#18181B',
              padding: '20px',
              borderRadius: '12px',
              border: userActiveFilter === 'online' ? '2.5px solid #FFFFFF' : '2px solid #FF6B00',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(255, 107, 0, 0.25)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.88rem', color: '#FF9E40', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF6B00', display: 'inline-block', boxShadow: '0 0 10px #FF6B00' }}></span>
                🟢 थेट सक्रिय (Active Now)
              </div>
              <span style={{
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: '10px',
                background: '#FF6B00',
                color: '#FFFFFF',
                fontWeight: 900
              }}>
                {userActiveFilter === 'online' ? 'फिल्टर सुरू ✓' : 'Live'}
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>
              {userStats.activeUsersNow ?? users.filter(u => u.isOnline).length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#FF9E40', marginTop: '4px', fontWeight: 600 }}>
              {userActiveFilter === 'online' ? 'केवळ सक्रिय पाहत आहात' : 'थेट डेटाबेस सदस्य'}
            </div>
          </div>

          <div style={{ background: '#18181B', padding: '20px', borderRadius: '12px', border: '2px solid #FF6B00', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.88rem', color: '#FF9E40', fontWeight: 800 }}>👑 मुख्य ॲडमिन व प्रमुख</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>
              {(userStats.superadmins || 0) + (userStats.admins || 0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#FFFFFF', marginTop: '4px', fontWeight: 600 }}>जिल्हाप्रमुख: {userStats.districtHeads || 0}</div>
          </div>

          <div style={{ background: '#18181B', padding: '20px', borderRadius: '12px', border: '2px solid #FF6B00', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.88rem', color: '#FF9E40', fontWeight: 800 }}>🩺 नोंदणीकृत डॉक्टर्स</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>{doctors.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#FFFFFF', marginTop: '4px', fontWeight: 600 }}>आरोग्य सल्लागार</div>
          </div>

          <div style={{ background: '#18181B', padding: '20px', borderRadius: '12px', border: '2px solid #FF6B00', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.88rem', color: '#FF9E40', fontWeight: 800 }}>🛠️ सेवा व प्रदाते (Services)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>{services.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#FFFFFF', marginTop: '4px', fontWeight: 600 }}>स्थानिक व्यावसायिक</div>
          </div>

          <div style={{ background: '#18181B', padding: '20px', borderRadius: '12px', border: '2px solid #FF6B00', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.88rem', color: '#FF9E40', fontWeight: 800 }}>🏨 हॉटेल्स व लॉजिंग</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>{hotels.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#FFFFFF', marginTop: '4px', fontWeight: 600 }}>पर्यटन व आदरातिथ्य</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #FF6B00', paddingBottom: '14px', marginBottom: '26px', overflowX: 'auto' }}>
          {[
            { id: 'users', label: '👥 वापरकर्ते (Users CRUD)', count: users.length },
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
                border: activeTab === tab.id ? '2px solid #FFFFFF' : '2px solid #FF6B00',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #FF6B00, #EA580C)' : '#18181B',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(255, 107, 0, 0.4)' : 'none'
              }}>
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.id ? '#FFFFFF' : '#FF6B00',
                color: activeTab === tab.id ? '#EA580C' : '#FFFFFF',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                fontWeight: 900
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
                    borderRadius: '8px',
                    background: '#18181B',
                    border: '2px solid #FF6B00',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    outline: 'none',
                    fontSize: '0.92rem'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 22px',
                    background: 'linear-gradient(135deg, #FF6B00, #EA580C)',
                    border: '2px solid #FFFFFF',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}>
                  शोधा
                </button>
              </form>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ padding: '11px 16px', borderRadius: '8px', background: '#18181B', border: '2px solid #FF6B00', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', outline: 'none' }}>
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
                  style={{ padding: '11px 16px', borderRadius: '8px', background: '#18181B', border: '2px solid #FF6B00', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', outline: 'none' }}>
                  <option value="all">सर्व पडताळणी स्थिती</option>
                  <option value="true">✅ प्रमाणित (Verified)</option>
                  <option value="false">⏳ प्रलंबित (Pending)</option>
                </select>

                <select
                  value={userActiveFilter}
                  onChange={(e) => setUserActiveFilter(e.target.value)}
                  style={{
                    padding: '11px 16px',
                    borderRadius: '8px',
                    background: userActiveFilter === 'online' ? '#FF6B00' : '#18181B',
                    border: '2px solid #FF6B00',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}>
                  <option value="all">सर्व स्थिती (All Users)</option>
                  <option value="online">🟢 केवळ सक्रिय (Online Now)</option>
                </select>

                <button
                  onClick={handleOpenAddUser}
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00, #EA580C)',
                    border: '2px solid #FFFFFF',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    padding: '11px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.92rem',
                    boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)'
                  }}>
                  <span>➕ नवीन वापरकर्ता जोडा</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div style={{ background: '#18181B', borderRadius: '14px', border: '2px solid #FF6B00', overflowX: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#111113', color: '#FF8C00', borderBottom: '2.5px solid #FF6B00' }}>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>वापरकर्ता (User)</th>
                    <th style={{ padding: '16px 18px', fontWeight: 900 }}>स्थिती (Status)</th>
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
                      <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#FF8C00', fontWeight: 800, fontSize: '1.05rem' }}>
                        कोणताही वापरकर्ता सापडला नाही.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 107, 0, 0.25)' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div 
                            onClick={() => handleOpenViewUser(u)}
                            style={{ fontWeight: 900, color: '#FF8C00', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            title="संपूर्ण प्रोफाइल तपशील पाहण्यासाठी क्लिक करा">
                            <span>{u.role === 'superadmin' ? '👑 ' : u.role === 'admin' ? '🏛️ ' : '👤 '}</span>
                            <span style={{ textDecoration: 'underline', color: '#FFFFFF' }}>{u.name}</span>
                            {u.isOnline && (
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00', display: 'inline-block', boxShadow: '0 0 8px #FF6B00' }} title="ऑनलाइन"></span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', marginTop: '3px', fontWeight: 700 }}>आयडी: {u.id}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#2A1805',
                            border: '1.5px solid #FF6B00',
                            color: '#FFFFFF',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800
                          }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00', display: 'inline-block' }}></span>
                            🟢 थेट सक्रिय
                          </span>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem' }}>📞 {u.phone}</div>
                          <div style={{ fontSize: '0.85rem', color: '#FF8C00', fontWeight: 700, marginTop: '2px' }}>✉️ {u.email}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 800 }}>📍 {u.district || 'महाराष्ट्र'}{u.taluka ? `, ${u.taluka}` : ''}</div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', fontWeight: 700, marginTop: '2px' }}>कुळ: {u.kul || '९६ कुळी'}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <select
                            value={u.role || 'member'}
                            onChange={(e) => handleQuickRoleChange(u, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#111113',
                              border: '1.5px solid #FF6B00',
                              color: '#FFFFFF',
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
                              border: '1.5px solid #FFFFFF',
                              background: u.verified ? '#FF6B00' : '#7F1D1D',
                              color: '#FFFFFF',
                              fontSize: '0.8rem',
                              fontWeight: 900,
                              cursor: 'pointer'
                            }}
                            title="पडताळणी बदलण्यासाठी क्लिक करा">
                            {u.verified ? '✅ प्रमाणित' : '⏳ प्रलंबित'}
                          </button>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{ background: '#111113', border: '1.5px solid #FF6B00', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                            {u.tier || 'Gold'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenViewUser(u)}
                              style={{ padding: '8px 14px', background: '#FF6B00', border: '1px solid #FFFFFF', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}
                              title="संपूर्ण तपशील पहा">
                              👁️ तपशील
                            </button>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              style={{ padding: '8px 14px', background: '#27272A', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}
                              title="माहिती संपादित करा">
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === user?.id || u.id === 'CM-SUPER-001'}
                              style={{
                                padding: '8px 12px',
                                background: (u.id === user?.id || u.id === 'CM-SUPER-001') ? '#333333' : '#DC2626',
                                border: '1px solid #FFFFFF',
                                color: '#FFFFFF',
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
            TAB 2: DOCTORS MANAGEMENT (CRUD)
        ========================================================================= */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 900 }}>🩺 डॉक्टर्स व वैद्यकीय तज्ज्ञ व्यवस्थापन</h3>
                <p style={{ margin: 0, color: '#FF8C00', fontSize: '0.92rem', fontWeight: 700 }}>वेबसाइटवरील अधिकृत मराठा डॉक्टर्स सूची संपादन, जोडणे व व्यवस्थापन.</p>
              </div>
              <button
                onClick={handleOpenAddDoctor}
                style={{ background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.92rem' }}>
                ➕ नवीन डॉक्टर जोडा
              </button>
            </div>

            <div style={{ background: '#18181B', borderRadius: '14px', border: '2px solid #FF6B00', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#111113', color: '#FF8C00', borderBottom: '2.5px solid #FF6B00' }}>
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
                    <tr><td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#FF8C00', fontWeight: 800 }}>कोणतेही डॉक्टर उपलब्ध नाहीत.</td></tr>
                  ) : (
                    doctors.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 107, 0, 0.25)' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 900, color: '#FFFFFF', fontSize: '0.98rem' }}>{d.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', fontWeight: 700 }}>{d.degree || 'M.B.B.S.'}</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 800 }}>{d.specialty}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 800 }}>{d.hospital}</div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', fontWeight: 700 }}>📍 {d.city}</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 900 }}>📞 {d.phone}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 800 }}>{d.experience || '५+ वर्षे'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', fontWeight: 800 }}>{d.consultationFee || '₹५००'}</div>
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditDoctor(d)}
                              style={{ padding: '8px 14px', background: '#27272A', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(d)}
                              style={{ padding: '8px 12px', background: '#DC2626', border: '1px solid #FFFFFF', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
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
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 900 }}>🛠️ सेवा व सेवा प्रदाते व्यवस्थापन (Services & Providers)</h3>
                <p style={{ margin: 0, color: '#FF8C00', fontSize: '0.92rem', fontWeight: 700 }}>स्थानिक व्यावसायिक (कायदेशीर, सीए, इंटिरिअर, सोलर, प्लंबिंग, इ.) जोडा व संपादित करा.</p>
              </div>
              <button
                onClick={handleOpenAddService}
                style={{ background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.92rem' }}>
                ➕ नवीन सेवा प्रदाता जोडा
              </button>
            </div>

            <div style={{ background: '#18181B', borderRadius: '14px', border: '2px solid #FF6B00', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#111113', color: '#FF8C00', borderBottom: '2.5px solid #FF6B00' }}>
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
                    <tr><td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#FF8C00', fontWeight: 800 }}>कोणतीही सेवा उपलब्ध नाही.</td></tr>
                  ) : (
                    services.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 107, 0, 0.25)' }}>
                        <td style={{ padding: '16px 18px', fontWeight: 900, color: '#FFFFFF' }}>{s.name}</td>
                        <td style={{ padding: '16px 18px', color: '#FF8C00', fontWeight: 800 }}>{s.category}</td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 700 }}>📍 {s.location}</td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 900 }}>📞 {s.phone}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 800 }}>{s.rating || '4.8 ★'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', fontWeight: 700 }}>{s.pricing || 'उचित दर'}</div>
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditService(s)}
                              style={{ padding: '8px 14px', background: '#27272A', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteService(s)}
                              style={{ padding: '8px 12px', background: '#DC2626', border: '1px solid #FFFFFF', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
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
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 900 }}>🏨 हॉटेल्स, रिसॉर्ट्स व लॉजिंग व्यवस्थापन</h3>
                <p style={{ margin: 0, color: '#FF8C00', fontSize: '0.92rem', fontWeight: 700 }}>मराठा पर्यटन व आदरातिथ्य नेटवर्कमधील हॉटेल्स थेट डेटाबेसमध्ये जोडा व संपादित करा.</p>
              </div>
              <button
                onClick={handleOpenAddHotel}
                style={{ background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.92rem' }}>
                ➕ नवीन हॉटेल जोडा
              </button>
            </div>

            <div style={{ background: '#18181B', borderRadius: '14px', border: '2px solid #FF6B00', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#111113', color: '#FF8C00', borderBottom: '2.5px solid #FF6B00' }}>
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
                    <tr><td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#FF8C00', fontWeight: 800 }}>कोणतेही हॉटेल नोंदणीकृत नाही.</td></tr>
                  ) : (
                    hotels.map(h => (
                      <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 107, 0, 0.25)' }}>
                        <td style={{ padding: '16px 18px', fontWeight: 900, color: '#FFFFFF' }}>🏨 {h.name}</td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 800 }}>📍 {h.city}, {h.district}</td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{ color: '#FF8C00', fontWeight: 800 }}>{h.category}</span>
                          <div style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700 }}>⭐ {h.star_rating || 4.5} Star</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 800 }}>{h.rooms_count} खोल्या</td>
                        <td style={{ padding: '16px 18px', color: '#FF8C00', fontWeight: 900 }}>{h.price_range}</td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 900 }}>📞 {h.phone}</td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditHotel(h)}
                              style={{ padding: '8px 14px', background: '#27272A', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteHotel(h)}
                              style={{ padding: '8px 12px', background: '#DC2626', border: '1px solid #FFFFFF', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
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
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 900 }}>📖 माहिती व ज्ञानकोश लेख व्यवस्थापन (Information CRUD)</h3>
                <p style={{ margin: 0, color: '#FF8C00', fontSize: '0.92rem', fontWeight: 700 }}>संस्कृती, इतिहास, किल्ले, उद्योग योजना व संशोधन लेख थेट प्रकाशित करा.</p>
              </div>
              <button
                onClick={handleOpenAddInfo}
                style={{ background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.92rem' }}>
                ➕ नवीन माहिती लेख जोडा
              </button>
            </div>

            <div style={{ background: '#18181B', borderRadius: '14px', border: '2px solid #FF6B00', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#111113', color: '#FF8C00', borderBottom: '2.5px solid #FF6B00' }}>
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
                    <tr><td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#FF8C00', fontWeight: 800 }}>कोणताही लेख उपलब्ध नाही.</td></tr>
                  ) : (
                    information.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 107, 0, 0.25)' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 900, color: '#FFFFFF', fontSize: '0.98rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#FF8C00', fontWeight: 600 }}>{item.summary?.slice(0, 70)}...</div>
                        </td>
                        <td style={{ padding: '16px 18px', color: '#FF8C00', fontWeight: 900 }}>{item.category}</td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 800 }}>✍️ {item.author}</td>
                        <td style={{ padding: '16px 18px', color: '#FFFFFF', fontWeight: 700 }}>
                          {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
                        </td>
                        <td style={{ padding: '16px 18px', fontSize: '0.8rem', color: '#FF8C00', fontWeight: 700 }}>
                          {item.created_at?.split('T')[0] || '२०२६'}
                        </td>
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditInfo(item)}
                              style={{ padding: '8px 14px', background: '#27272A', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800 }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteInfo(item)}
                              style={{ padding: '8px 12px', background: '#DC2626', border: '1px solid #FFFFFF', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900 }}>
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
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 900 }}>🛡️ पद व अधिकार मॅट्रिक्स (Roles & Access Control)</h3>
              <p style={{ margin: 0, color: '#FF8C00', fontSize: '0.95rem', fontWeight: 700 }}>महासंघातील प्रत्येक पदाचे अधिकार, कार्यकक्षा व नियमन रचना.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {rolesMatrix.map((r, idx) => (
                <div key={idx} style={{ background: '#18181B', borderRadius: '14px', padding: '24px', border: '2px solid #FF6B00', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>{r.titleMarathi}</span>
                    <span style={{ background: '#FF6B00', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900 }}>
                      {r.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#FFFFFF', marginBottom: '16px', fontWeight: 700 }}>
                    <span style={{ color: '#FF8C00' }}>📍 कार्यकक्षा:</span> {r.scope}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#FF8C00', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>अधिकार (Permissions):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {r.permissions?.map((p, pIdx) => (
                        <span key={pIdx} style={{ background: '#111113', border: '1.5px solid #FF6B00', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
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
      </div>

      {/* =========================================================================
          UNIVERSAL MODALS (WHITE & ORANGE THEME)
      ========================================================================= */}
      {modalType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#141416',
            borderRadius: '16px',
            border: '2.5px solid #FF6B00',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 0 40px rgba(255, 107, 0, 0.35)',
            color: '#FFFFFF'
          }}>
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FF6B00', paddingBottom: '16px', marginBottom: '22px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF' }}>
                {modalType === 'viewUser' && `🪪 वापरकर्ता संपूर्ण तपशील: ${activeItem?.name}`}
                {modalType === 'addUser' && '➕ नवीन वापरकर्ता तयार करा'}
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
                style={{ background: '#FF6B00', border: '1px solid #FFFFFF', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {/* VIEW USER DETAILS MODAL */}
            {modalType === 'viewUser' && activeItem && (
              <div>
                {/* Header Profile Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #27272A 0%, #18181B 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #FF6B00',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px'
                }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#FF6B00',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    boxShadow: '0 4px 15px rgba(255,107,0,0.5)'
                  }}>
                    {activeItem.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF' }}>{activeItem.name}</h4>
                      <span style={{
                        background: '#FF6B00',
                        border: '1px solid #FFFFFF',
                        color: '#FFFFFF',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 900
                      }}>
                        🟢 थेट सक्रिय
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '6px', fontWeight: 700 }}>
                      <span style={{ color: '#FF8C00' }}>सदस्य आयडी:</span> <span style={{ fontFamily: 'monospace', fontWeight: 900 }}>{activeItem.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#111113', border: '1px solid #FF6B00', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                        भूमिका: {activeItem.role || 'member'}
                      </span>
                      <span style={{ background: '#111113', border: '1px solid #FF6B00', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                        श्रेणी: {activeItem.tier || 'Gold'}
                      </span>
                      <span style={{ background: activeItem.verified ? '#FF6B00' : '#7F1D1D', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 900 }}>
                        {activeItem.verified ? '✅ प्रमाणित सदस्य' : '⏳ पडताळणी प्रलंबित'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Section Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  
                  {/* Section 1: Contact & Account */}
                  <div style={{ background: '#18181B', padding: '18px', borderRadius: '10px', border: '1.5px solid #FF6B00' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FF8C00', marginBottom: '12px' }}>
                      📱 संपर्क व खाते माहिती
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#FF8C00' }}>मोबाईल:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.phone || 'उपलब्ध नाही'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>ई-मेल:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.email || 'उपलब्ध नाही'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>शेवटची सक्रियता:</strong> <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{activeItem.lastActiveFormatted || 'काही वेळापूर्वी'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>नोंदणी दिनांक:</strong> <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{activeItem.joined || activeItem.createdAt?.split('T')[0] || '२०२६'}</span></div>
                    </div>
                  </div>

                  {/* Section 2: Social & Cultural */}
                  <div style={{ background: '#18181B', padding: '18px', borderRadius: '10px', border: '1.5px solid #FF6B00' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FF8C00', marginBottom: '12px' }}>
                      🚩 सामाजिक व कुळ माहिती
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#FF8C00' }}>९६ कुळ:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.kul || '९६ कुळी मराठा'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>गोत्र / देवक:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.gotra || 'नोंद नाही'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>जिल्हा:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.district || 'महाराष्ट्र'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>तालुका / शहर:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.taluka || activeItem.city || activeItem.district || 'पुणे'}</span></div>
                    </div>
                  </div>

                  {/* Section 3: Professional */}
                  <div style={{ background: '#18181B', padding: '18px', borderRadius: '10px', border: '1.5px solid #FF6B00' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FF8C00', marginBottom: '12px' }}>
                      💼 व्यावसायिक व शैक्षणिक
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#FF8C00' }}>व्यवसाय / क्षेत्र:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.profession || 'व्यवसायिक / नोकरी'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>कंपनी / प्रतिष्ठान:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.business || 'नोंद नाही'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>रक्तगट:</strong> <span style={{ color: '#FFFFFF', fontWeight: 900 }}>{activeItem.bloodGroup || 'O+'}</span></div>
                    </div>
                  </div>

                  {/* Section 4: Governance & Verification */}
                  <div style={{ background: '#18181B', padding: '18px', borderRadius: '10px', border: '1.5px solid #FF6B00' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FF8C00', marginBottom: '12px' }}>
                      🛡️ प्रशासकीय पडताळणी शेरा
                    </div>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong style={{ color: '#FF8C00' }}>पडताळणी अधिकारी:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.verifiedBy || 'मध्यवर्ती प्रशासक मंडळ'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>शेरा (Remarks):</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.verificationRemarks || 'कागदपत्र पडताळणी पूर्ण झाली'}</span></div>
                      <div><strong style={{ color: '#FF8C00' }}>अधिकार व्याप्ती:</strong> <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{activeItem.assignedScope || activeItem.district || 'महाराष्ट्र'}</span></div>
                    </div>
                  </div>

                </div>

                {/* Modal Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '2px solid #FF6B00', paddingTop: '18px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleVerification(activeItem);
                      setActiveItem({ ...activeItem, verified: !activeItem.verified });
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '8px',
                      border: '2px solid #FFFFFF',
                      background: activeItem.verified ? '#DC2626' : '#FF6B00',
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
                      padding: '12px 18px',
                      borderRadius: '8px',
                      border: '2px solid #FFFFFF',
                      background: 'linear-gradient(135deg, #FF6B00, #EA580C)',
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
                      padding: '12px 20px',
                      borderRadius: '8px',
                      border: '1.5px solid #FF6B00',
                      background: '#18181B',
                      color: '#FFFFFF',
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
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>पूर्ण नाव *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>फोन नंबर (१० अंकी) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>ई-मेल</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>
                      {modalType === 'addUser' ? 'पासवर्ड (Default: password123)' : 'नवीन पासवर्ड'}
                    </label>
                    <input
                      type="password"
                      placeholder={modalType === 'addUser' ? 'password123' : 'रिकामे सोडा जर बदलायचा नसेल'}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>भूमिका (Role) *</label>
                    <select
                      value={formData.role || 'member'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 800, outline: 'none' }}>
                      <option value="member">👤 member (सामान्य सदस्य)</option>
                      <option value="chapter_president">💼 chapter_president (चॅप्टर अध्यक्ष)</option>
                      <option value="district_admin">📍 district_admin (जिल्हा प्रमुख)</option>
                      <option value="seva_helpdesk">🩺 seva_helpdesk (मदत कक्ष)</option>
                      <option value="admin">🏛️ admin (महासंघ व्यवस्थापक)</option>
                      <option value="ceo">🦅 ceo (मुख्य कार्यकारी अधिकारी)</option>
                      <option value="superadmin">👑 superadmin (सर्वोच्च प्रशासक)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>श्रेणी (Tier)</label>
                    <select
                      value={formData.tier || 'Gold'}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 800, outline: 'none' }}>
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
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>तालुका</label>
                    <input
                      type="text"
                      value={formData.taluka || ''}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>कुळ / ९६ कुळ</label>
                    <input
                      type="text"
                      value={formData.kul || ''}
                      onChange={(e) => setFormData({ ...formData, kul: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800 }}>
                      <input
                        type="checkbox"
                        checked={formData.verified || false}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#FF6B00' }}
                      />
                      <span>✅ डिजिटल ओळखपत्र प्रमाणित करा</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    style={{ padding: '12px 20px', background: '#18181B', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}>
                    जतन करा (Save)
                  </button>
                </div>
              </form>
            )}

            {/* Doctor Form */}
            {(modalType === 'addDoctor' || modalType === 'editDoctor') && (
              <form onSubmit={handleSaveDoctor}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>डॉक्टरचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>पदवी (Degree)</label>
                    <input
                      type="text"
                      value={formData.degree || ''}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>विशेषज्ञता (Specialty)</label>
                    <input
                      type="text"
                      value={formData.specialty || ''}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>हॉस्पिटल नाव</label>
                    <input
                      type="text"
                      value={formData.hospital || ''}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>शहर / जिल्हा</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>संपर्क नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>फी (Consultation Fee)</label>
                    <input
                      type="text"
                      value={formData.consultationFee || ''}
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '11px 18px', background: '#18181B', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Service Form */}
            {(modalType === 'addService' || modalType === 'editService') && (
              <form onSubmit={handleSaveService}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>सेवा प्रदाता नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>सेवा प्रकार (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>स्थान (Location)</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>संपर्क नंबर</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>दर / फी (Pricing)</label>
                    <input
                      type="text"
                      value={formData.pricing || ''}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '11px 18px', background: '#18181B', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Hotel Form */}
            {(modalType === 'addHotel' || modalType === 'editHotel') && (
              <form onSubmit={handleSaveHotel}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>हॉटेलचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>शहर</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>हॉटेल प्रकार (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>स्टार रेटिंग</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.star_rating || 4.5}
                      onChange={(e) => setFormData({ ...formData, star_rating: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>दर श्रेणी (Price Range)</label>
                    <input
                      type="text"
                      value={formData.price_range || ''}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>संपर्क फोन</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '11px 18px', background: '#18181B', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Information Article Form */}
            {(modalType === 'addInfo' || modalType === 'editInfo') && (
              <form onSubmit={handleSaveInfo}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>लेखाचे शीर्षक *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>विभाग (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>लेखक (Author)</label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>संक्षिप्त सारांश (Summary)</label>
                  <textarea
                    rows="2"
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>सविस्तर मजकूर (Full Content)</label>
                  <textarea
                    rows="4"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#FF8C00', fontWeight: 800, marginBottom: '6px' }}>टॅग्ज (स्वल्पविरामाने वेगळे करा)</label>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', background: '#18181B', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '11px 18px', background: '#18181B', border: '1.5px solid #FF6B00', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #FF6B00, #EA580C)', border: '2px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
