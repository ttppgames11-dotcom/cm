import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'doctors' | 'services' | 'hotels' | 'information' | 'roles'
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

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
  const [itemSearch, setItemSearch] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'addUser' | 'editUser' | 'addDoctor' | 'editDoctor' | 'addService' | 'editService' | 'addHotel' | 'editHotel' | 'addInfo' | 'editInfo'
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
        apiClient.getAdminUsers({ search: userSearch, role: userRoleFilter, verified: userVerifiedFilter }).catch(() => ({ users: [], stats: {} })),
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
      console.error('Superadmin load error:', err);
      showToast('माहिती लोड करताना अडचण आली.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userRoleFilter, userVerifiedFilter]);

  // Handle user search on enter or debounce
  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    apiClient.getAdminUsers({ search: userSearch, role: userRoleFilter, verified: userVerifiedFilter })
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

  const handleOpenEditUser = (u) => {
    setActiveItem(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'member',
      district: u.district || 'पुणे',
      taluka: u.taluka || '',
      kul: u.kul || '',
      gotra: u.gotra || '',
      tier: u.tier || 'Gold',
      profession: u.profession || '',
      business: u.business || '',
      verified: Boolean(u.verified),
      password: ''
    });
    setModalType('editUser');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'addUser') {
        const res = await apiClient.createAdminUser(formData);
        if (res.success) {
          showToast(`वापरकर्ता "${formData.name}" यशस्वीरीत्या तयार झाला!`);
          setModalType(null);
          loadAllData();
        } else {
          showToast(res.message || 'वापरकर्ता तयार करता आला नाही.', 'error');
        }
      } else if (modalType === 'editUser') {
        const res = await apiClient.updateAdminUser(activeItem.id, formData);
        if (res.success) {
          showToast(`वापरकर्ता "${formData.name}" माहिती अद्यतनित झाली!`);
          setModalType(null);
          loadAllData();
        } else {
          showToast(res.message || 'अद्ययावत करण्यात त्रुटी.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'सर्व्हर त्रुटी.', 'error');
    }
  };

  const handleToggleVerification = async (u) => {
    try {
      const nextStatus = !u.verified;
      const res = await apiClient.updateAdminUser(u.id, { verified: nextStatus });
      if (res.success) {
        showToast(`वापरकर्ता ${u.name} ची स्थिती ${nextStatus ? 'प्रमाणित (Verified)' : 'अ-प्रमाणित'} केली.`);
        setUsers(users.map(item => item.id === u.id ? { ...item, verified: nextStatus, verificationStatus: nextStatus ? 'प्रमाणित (Verified)' : 'नाकारले / प्रलंबित' } : item));
      }
    } catch (err) {
      showToast('पडताळणी बदलता आली नाही.', 'error');
    }
  };

  const handleQuickRoleChange = async (u, newRole) => {
    try {
      const res = await apiClient.assignAdminRole(u.id, newRole, u.district || 'महाराष्ट्र', 'SuperAdmin Console Update');
      if (res.success) {
        showToast(`भूमिका यशस्वीरीत्या "${newRole}" मध्ये बदलली!`);
        setUsers(users.map(item => item.id === u.id ? { ...item, role: newRole } : item));
      } else {
        showToast(res.message || 'भूमिका बदलता आली नाही.', 'error');
      }
    } catch (err) {
      showToast('भूमिका बदलताना त्रुटी.', 'error');
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`तुम्हाला नक्की वापरकर्ता "${u.name}" (ID: ${u.id}) कायमस्वरूपी काढून टाकायचा आहे का?`)) {
      return;
    }
    try {
      const res = await apiClient.deleteAdminUser(u.id);
      if (res.success) {
        showToast(`वापरकर्ता "${u.name}" काढण्यात आला.`);
        setUsers(users.filter(item => item.id !== u.id));
      } else {
        showToast(res.message || 'हटवता आले नाही.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'हटवताना त्रुटी आली.', 'error');
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
      hospital: 'सह्याद्री सुपर स्पेशालिटी हॉस्पिटल',
      city: 'पुणे',
      district: 'पुणे',
      phone: '',
      experience: '१०+ वर्षे',
      consultationFee: '₹६००'
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
        } else {
          showToast(res.message || 'त्रुटी आली.', 'error');
        }
      } else {
        const res = await apiClient.updateAdminDoctor(activeItem.id, formData);
        if (res.success) {
          showToast(`डॉक्टर "${formData.name}" अद्यतनित केले!`);
          setModalType(null);
          loadAllData();
        }
      }
    } catch (err) {
      showToast(err.message || 'त्रुटी.', 'error');
    }
  };

  const handleDeleteDoctor = async (d) => {
    if (!window.confirm(`तुम्हाला नक्की डॉक्टर "${d.name}" काढायचे आहेत का?`)) return;
    try {
      const res = await apiClient.deleteAdminDoctor(d.id);
      if (res.success) {
        showToast('डॉक्टर काढण्यात आले.');
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
      category: 'कायदेशीर सल्ला व वकील',
      location: 'पुणे',
      phone: '',
      rating: '4.9 ★',
      experience: '८+ वर्षे',
      pricing: 'कामाच्या स्वरूपानुसार',
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
      experience: s.experience || '',
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
      category: 'मराठा इतिहास व वारसा',
      author: user?.name || 'संपादकीय मंडळ',
      summary: '',
      content: '',
      tags: 'इतिहास, गडकिल्ले, संस्कृती',
      image_url: '/assets/images/real-raigad-panoramic.jpg',
      featured: true
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
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      image_url: item.image_url || '',
      featured: Boolean(item.featured)
    });
    setModalType('editInfo');
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()) : formData.tags
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
    <div className="superadmin-page" style={{ background: '#0F172A', color: '#F8FAFC', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Toast Notification */}
      {feedback && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          padding: '14px 22px',
          borderRadius: '12px',
          background: feedback.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFFFFF',
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Royal Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 80%, #7C3AED 100%)',
        padding: '36px 24px',
        borderBottom: '2px solid rgba(255, 215, 0, 0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid #F59E0B', borderRadius: '30px', padding: '4px 14px', fontSize: '0.8rem', color: '#FDE68A', marginBottom: '10px' }}>
              <span>👑 सर्वोच्च नियामक कन्सोल (SuperAdmin Supreme Console)</span>
              <span>•</span>
              <span>अमर्याद अधिकार (Full Access)</span>
            </div>
            <h1 style={{ margin: '4px 0 8px 0', fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              सर्वोच्च प्रशासकीय व्यवस्थापन केंद्र
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
              वापरकर्ते, भूमिका, डॉक्टर्स, सेवा, हॉटेल्स आणि महासंघ माहितीवरील संपूर्ण CRUD नियंत्रण.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/admin/cms"
              className="btn"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000', fontWeight: '800', border: 'none', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none' }}>
              🎨 CMS वेबसाइट एडिटर
            </Link>
            <Link
              to="/crm"
              className="btn btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none' }}>
              🚩 CRM पोर्टल
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>👥 एकूण वापरकर्ते (Users)</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#38BDF8', marginTop: '4px' }}>{userStats.total || users.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>प्रमाणित: {userStats.verifiedMembers || 0}</div>
          </div>
          <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>👑 SuperAdmins & Heads</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FBBF24', marginTop: '4px' }}>
              {(userStats.superadmins || 0) + (userStats.admins || 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>जिल्हाप्रमुख: {userStats.districtHeads || 0}</div>
          </div>
          <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>🩺 नोंदणीकृत डॉक्टर्स</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#34D399', marginTop: '4px' }}>{doctors.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>आरोग्य सल्लागार</div>
          </div>
          <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>🛠️ सेवा व प्रदाते (Services)</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#A78BFA', marginTop: '4px' }}>{services.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>स्थानिक व्यावसायिक</div>
          </div>
          <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>🏨 हॉटेल्स व लॉजिंग</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#F472B6', marginTop: '4px' }}>{hotels.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>पर्यटन व आदरातिथ्य</div>
          </div>
          <div style={{ background: '#1E293B', padding: '18px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>📖 माहिती व ज्ञानकोश</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FB923C', marginTop: '4px' }}>{information.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>ऐतिहासिक व व्यवसाय लेख</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
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
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? '#4338CA' : '#1E293B',
                color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              <span>{tab.label}</span>
              <span style={{ background: activeTab === tab.id ? '#6366F1' : '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <form onSubmit={handleUserSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '550px' }}>
                <input
                  type="text"
                  placeholder="नाव, फोन, ई-मेल, जिल्हा किंवा कुळानुसार शोधा..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: '#1E293B', border: '1px solid #334155', color: '#FFF' }}
                />
                <button type="submit" style={{ padding: '10px 18px', background: '#3B82F6', border: 'none', color: '#FFF', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  शोधा
                </button>
              </form>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontSize: '0.85rem' }}>
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
                  style={{ padding: '10px 14px', borderRadius: '8px', background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontSize: '0.85rem' }}>
                  <option value="all">सर्व पडताळणी स्थिती</option>
                  <option value="true">✅ प्रमाणित (Verified)</option>
                  <option value="false">⏳ प्रलंबित (Pending)</option>
                </select>

                <button
                  onClick={handleOpenAddUser}
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: 700,
                    padding: '10px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                  <span>➕ नवीन वापरकर्ता जोडा</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div style={{ background: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '14px 16px' }}>वापरकर्ता (User)</th>
                    <th style={{ padding: '14px 16px' }}>संपर्क व ईमेल</th>
                    <th style={{ padding: '14px 16px' }}>स्थान व कुळ</th>
                    <th style={{ padding: '14px 16px' }}>भूमिका (Role)</th>
                    <th style={{ padding: '14px 16px' }}>पडताळणी</th>
                    <th style={{ padding: '14px 16px' }}>श्रेणी (Tier)</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                        कोणताही वापरकर्ता सापडला नाही.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.92rem' }}>
                            {u.role === 'superadmin' ? '👑 ' : u.role === 'admin' ? '🏛️ ' : '👤 '}
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {u.id}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ color: '#E2E8F0' }}>📞 {u.phone}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>✉️ {u.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ color: '#E2E8F0' }}>📍 {u.district || 'महाराष्ट्र'}{u.taluka ? `, ${u.taluka}` : ''}</div>
                          <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>कुळ: {u.kul || '९६ कुळी'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={u.role || 'member'}
                            onChange={(e) => handleQuickRoleChange(u, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: u.role === 'superadmin' ? '#4C1D95' : u.role === 'admin' ? '#1E3A8A' : '#334155',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#FFF',
                              fontSize: '0.8rem',
                              fontWeight: 700
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
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() => handleToggleVerification(u)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              border: 'none',
                              background: u.verified ? '#065F46' : '#7F1D1D',
                              color: u.verified ? '#6EE7B7' : '#FCA5A5',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="पडताळणी बदलण्यासाठी क्लिक करा">
                            {u.verified ? '✅ प्रमाणित' : '⏳ प्रलंबित'}
                          </button>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#312E81', color: '#C7D2FE', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            {u.tier || 'Gold'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              style={{ padding: '6px 12px', background: '#3B82F6', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}
                              title="माहिती संपादित करा">
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === user?.id || u.id === 'CM-SUPER-001'}
                              style={{
                                padding: '6px 10px',
                                background: (u.id === user?.id || u.id === 'CM-SUPER-001') ? '#475569' : '#DC2626',
                                border: 'none',
                                color: '#FFF',
                                borderRadius: '6px',
                                cursor: (u.id === user?.id || u.id === 'CM-SUPER-001') ? 'not-allowed' : 'pointer',
                                fontSize: '0.78rem'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#FFFFFF' }}>🩺 डॉक्टर्स व वैद्यकीय तज्ज्ञ व्यवस्थापन</h3>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>वेबसाइटवरील अधिकृत मराठा डॉक्टर्स सूची संपादन, जोडणे व व्यवस्थापन.</p>
              </div>
              <button
                onClick={handleOpenAddDoctor}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#FFF', fontWeight: 700, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                ➕ नवीन डॉक्टर जोडा
              </button>
            </div>

            <div style={{ background: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '14px 16px' }}>नाव व पदवी</th>
                    <th style={{ padding: '14px 16px' }}>विशेषज्ञता (Specialty)</th>
                    <th style={{ padding: '14px 16px' }}>हॉस्पिटल व शहर</th>
                    <th style={{ padding: '14px 16px' }}>संपर्क</th>
                    <th style={{ padding: '14px 16px' }}>अनुभव / फी</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>कोणतेही डॉक्टर उपलब्ध नाहीत.</td></tr>
                  ) : (
                    doctors.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#FFF' }}>{d.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>{d.degree || 'M.B.B.S.'}</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#E2E8F0' }}>{d.specialty}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{d.hospital}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>📍 {d.city}</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#34D399' }}>📞 {d.phone}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{d.experience || '५+ वर्षे'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#FCD34D' }}>{d.consultationFee || '₹५००'}</div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditDoctor(d)}
                              style={{ padding: '6px 12px', background: '#3B82F6', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(d)}
                              style={{ padding: '6px 10px', background: '#DC2626', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#FFFFFF' }}>🛠️ सेवा व सेवा प्रदाते व्यवस्थापन (Services & Providers)</h3>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>स्थानिक व्यावसायिक (कायदेशीर, सीए, इंटिरिअर, सोलर, प्लंबिंग, इ.) जोडा व संपादित करा.</p>
              </div>
              <button
                onClick={handleOpenAddService}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#FFF', fontWeight: 700, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                ➕ नवीन सेवा प्रदाता जोडा
              </button>
            </div>

            <div style={{ background: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '14px 16px' }}>नाव / संस्था</th>
                    <th style={{ padding: '14px 16px' }}>सेवा प्रकार (Category)</th>
                    <th style={{ padding: '14px 16px' }}>स्थान</th>
                    <th style={{ padding: '14px 16px' }}>संपर्क</th>
                    <th style={{ padding: '14px 16px' }}>रेटिंग / दर</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>कोणतीही सेवा उपलब्ध नाही.</td></tr>
                  ) : (
                    services.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#FFF' }}>{s.name}</td>
                        <td style={{ padding: '14px 16px', color: '#A78BFA' }}>{s.category}</td>
                        <td style={{ padding: '14px 16px' }}>📍 {s.location}</td>
                        <td style={{ padding: '14px 16px', color: '#38BDF8' }}>📞 {s.phone}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{s.rating || '4.8 ★'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.pricing || 'उचित दर'}</div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditService(s)}
                              style={{ padding: '6px 12px', background: '#3B82F6', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteService(s)}
                              style={{ padding: '6px 10px', background: '#DC2626', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#FFFFFF' }}>🏨 हॉटेल्स, रिसॉर्ट्स व लॉजिंग व्यवस्थापन</h3>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>मराठा पर्यटन व आदरातिथ्य नेटवर्कमधील हॉटेल्स थेट डेटाबेसमध्ये जोडा व संपादित करा.</p>
              </div>
              <button
                onClick={handleOpenAddHotel}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#FFF', fontWeight: 700, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                ➕ नवीन हॉटेल जोडा
              </button>
            </div>

            <div style={{ background: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '14px 16px' }}>हॉटेल नाव</th>
                    <th style={{ padding: '14px 16px' }}>शहर / जिल्हा</th>
                    <th style={{ padding: '14px 16px' }}>प्रकार व रेटिंग</th>
                    <th style={{ padding: '14px 16px' }}>खोल्या (Rooms)</th>
                    <th style={{ padding: '14px 16px' }}>दर श्रेणी (Price)</th>
                    <th style={{ padding: '14px 16px' }}>संपर्क</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>कोणतेही हॉटेल नोंदणीकृत नाही.</td></tr>
                  ) : (
                    hotels.map(h => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#FFF' }}>
                          🏨 {h.name}
                        </td>
                        <td style={{ padding: '14px 16px' }}>📍 {h.city}, {h.district}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: '#F472B6' }}>{h.category}</span>
                          <div style={{ fontSize: '0.75rem', color: '#FCD34D' }}>⭐ {h.star_rating || 4.5} Star</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{h.rooms_count} खोल्या</td>
                        <td style={{ padding: '14px 16px', color: '#6EE7B7' }}>{h.price_range}</td>
                        <td style={{ padding: '14px 16px', color: '#38BDF8' }}>📞 {h.phone}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditHotel(h)}
                              style={{ padding: '6px 12px', background: '#3B82F6', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteHotel(h)}
                              style={{ padding: '6px 10px', background: '#DC2626', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#FFFFFF' }}>📖 माहिती व ज्ञानकोश लेख व्यवस्थापन (Information CRUD)</h3>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>संस्कृती, इतिहास, किल्ले, उद्योग योजना व संशोधन लेख थेट प्रकाशित करा.</p>
              </div>
              <button
                onClick={handleOpenAddInfo}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#FFF', fontWeight: 700, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>
                ➕ नवीन माहिती लेख जोडा
              </button>
            </div>

            <div style={{ background: '#1E293B', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '14px 16px' }}>शीर्षक (Title)</th>
                    <th style={{ padding: '14px 16px' }}>विभाग (Category)</th>
                    <th style={{ padding: '14px 16px' }}>लेखक (Author)</th>
                    <th style={{ padding: '14px 16px' }}>टॅग्ज</th>
                    <th style={{ padding: '14px 16px' }}>दिनांक</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {information.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>कोणताही लेख उपलब्ध नाही.</td></tr>
                  ) : (
                    information.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.92rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.summary?.slice(0, 70)}...</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#FB923C' }}>{item.category}</td>
                        <td style={{ padding: '14px 16px', color: '#E2E8F0' }}>✍️ {item.author}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                            {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: '#64748B' }}>
                          {item.created_at?.split('T')[0] || '२०२६'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditInfo(item)}
                              style={{ padding: '6px 12px', background: '#3B82F6', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
                              ✏️ संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteInfo(item)}
                              style={{ padding: '6px 10px', background: '#DC2626', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
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
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#FFFFFF' }}>🛡️ पद व अधिकार मॅट्रिक्स (Roles & Access Control)</h3>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>महासंघातील प्रत्येक पदाचे अधिकार, कार्यकक्षा व नियमन रचना.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {rolesMatrix.map((r, idx) => (
                <div key={idx} style={{ background: '#1E293B', borderRadius: '12px', padding: '22px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FBBF24' }}>{r.titleMarathi}</span>
                    <span style={{ background: '#312E81', color: '#C7D2FE', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {r.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '14px' }}>
                    📍 <strong>कार्यकक्षा:</strong> {r.scope}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>अधिकार (Permissions):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {r.permissions?.map((p, pIdx) => (
                        <span key={pIdx} style={{ background: '#0F172A', border: '1px solid #334155', color: '#E2E8F0', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
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
          UNIVERSAL MODALS
      ========================================================================= */}
      {modalType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#1E293B',
            borderRadius: '16px',
            border: '1px solid #475569',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#FFF'
          }}>
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
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
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* User Form */}
            {(modalType === 'addUser' || modalType === 'editUser') && (
              <form onSubmit={handleSaveUser}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>पूर्ण नाव *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>फोन नंबर (१० अंकी) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>ई-मेल</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>
                      {modalType === 'addUser' ? 'पासवर्ड (Default: password123)' : 'नवीन पासवर्ड (बदलायचा असल्यास)'}
                    </label>
                    <input
                      type="password"
                      placeholder={modalType === 'addUser' ? 'password123' : 'रिकामे सोडा जर बदलायचा नसेल'}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>भूमिका (Role) *</label>
                    <select
                      value={formData.role || 'member'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>श्रेणी (Tier)</label>
                    <select
                      value={formData.tier || 'Gold'}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Patron">Patron</option>
                      <option value="Royal Patron">Royal Patron</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>तालुका</label>
                    <input
                      type="text"
                      value={formData.taluka || ''}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>कुळ / ९६ कुळ</label>
                    <input
                      type="text"
                      value={formData.kul || ''}
                      onChange={(e) => setFormData({ ...formData, kul: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.verified || false}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      />
                      <span>✅ डिजिटल ओळखपत्र प्रमाणित (Verified) करा</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    style={{ padding: '10px 18px', background: '#334155', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#FFF', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}>
                    जतन करा (Save)
                  </button>
                </div>
              </form>
            )}

            {/* Doctor Form */}
            {(modalType === 'addDoctor' || modalType === 'editDoctor') && (
              <form onSubmit={handleSaveDoctor}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>डॉक्टरचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>पदवी (Degree)</label>
                    <input
                      type="text"
                      value={formData.degree || ''}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>विशेषज्ञता (Specialty)</label>
                    <input
                      type="text"
                      value={formData.specialty || ''}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>हॉस्पिटल नाव</label>
                    <input
                      type="text"
                      value={formData.hospital || ''}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>शहर / जिल्हा</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>संपर्क नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>फी (Consultation Fee)</label>
                    <input
                      type="text"
                      value={formData.consultationFee || ''}
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '9px 16px', background: '#334155', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '9px 20px', background: '#10B981', border: 'none', color: '#FFF', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Service Form */}
            {(modalType === 'addService' || modalType === 'editService') && (
              <form onSubmit={handleSaveService}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>सेवा प्रदाता नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>सेवा प्रकार (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>स्थान (Location)</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>संपर्क नंबर</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>दर / फी (Pricing)</label>
                    <input
                      type="text"
                      value={formData.pricing || ''}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '9px 16px', background: '#334155', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '9px 20px', background: '#10B981', border: 'none', color: '#FFF', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Hotel Form */}
            {(modalType === 'addHotel' || modalType === 'editHotel') && (
              <form onSubmit={handleSaveHotel}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>हॉटेलचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>शहर</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>हॉटेल प्रकार (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>स्टार रेटिंग (Star Rating)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.star_rating || 4.5}
                      onChange={(e) => setFormData({ ...formData, star_rating: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>दर श्रेणी (Price Range)</label>
                    <input
                      type="text"
                      value={formData.price_range || ''}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>संपर्क फोन</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '9px 16px', background: '#334155', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '9px 20px', background: '#10B981', border: 'none', color: '#FFF', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}

            {/* Information Article Form */}
            {(modalType === 'addInfo' || modalType === 'editInfo') && (
              <form onSubmit={handleSaveInfo}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>लेखाचे शीर्षक *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>विभाग (Category)</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>लेखक (Author)</label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>संक्षिप्त सारांश (Summary)</label>
                  <textarea
                    rows="2"
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>सविस्तर मजकूर (Full Content)</label>
                  <textarea
                    rows="4"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>टॅग्ज (Tags, स्वल्पविरामाने वेगळे करा)</label>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#FFF' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ padding: '9px 16px', background: '#334155', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>रद्द करा</button>
                  <button type="submit" style={{ padding: '9px 20px', background: '#10B981', border: 'none', color: '#FFF', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}>जतन करा</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
