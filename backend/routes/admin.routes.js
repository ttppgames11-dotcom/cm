import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, isValidEmail, isValidPhone, cleanPhone } from '../utils/validator.js';

const router = Router();

// GET /api/admin/metrics
// Real-time ERP analytics (membership growth, revenue, district ranks)
router.get('/metrics', authenticateToken, requireRole('admin', 'ceo', 'superadmin', 'district_admin'), (req, res) => {
  const members = db.getCollection('members');
  const businesses = db.getCollection('businesses');
  const referrals = db.getCollection('referrals');
  const donations = db.getCollection('donations');
  const jobs = db.getCollection('jobs');
  const bloodRequests = db.getCollection('bloodRequests');

  const totalReferralValue = referrals.reduce((sum, r) => sum + (Number(r.value || r.actualValue || r.estimatedValue) || 0), 0);
  const totalDonationValue = donations.reduce((sum, d) => sum + (Number(d.amount || d.donatedAmount) || 0), 0);

  // District distribution
  const districtDistribution = {};
  for (const m of members) {
    const dist = m.district || 'इतर';
    districtDistribution[dist] = (districtDistribution[dist] || 0) + 1;
  }

  const now = Date.now();
  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
  const activeUsersNow = members.filter(m => m.last_active_at && (now - new Date(m.last_active_at).getTime() <= FIFTEEN_MINUTES_MS)).length;

  const metrics = {
    overview: {
      totalRegisteredMembers: members.length,
      activeUsersNow: activeUsersNow,
      verifiedMembersCount: members.filter(m => m.verified).length,
      pendingVerificationsCount: members.filter(m => !m.verified).length,
      registeredBusinessesCount: businesses.length,
      totalBusinessExchangedINR: totalReferralValue,
      totalDonationsCollectedINR: totalDonationValue,
      openJobPostingsCount: jobs.length,
      activeBloodSOSCount: bloodRequests.length
    },
    topDistricts: Object.entries(districtDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([district, count]) => ({ district, count })),
    systemHealth: '100% कार्यक्षम (Operational)',
    timestamp: new Date().toISOString()
  };

  return sendSuccess(res, 'प्रशासकीय ईआरपी मेट्रिक्स', { metrics });
});

// GET /api/admin/audit-logs
// Immutable security audit trail of logins, updates, role changes
router.get('/audit-logs', authenticateToken, requireRole('admin', 'ceo', 'superadmin'), (req, res) => {
  const logs = db.getCollection('auditLogs');
  return sendSuccess(res, 'सुरक्षा व कार्यप्रणाली ऑडिट लॉग्स', {
    auditLogs: logs.slice(0, 100),
    totalCount: logs.length
  });
});

// POST /api/admin/verify-member/:id
// Approve or reject member ID verification with remarks
router.post('/verify-member/:id', authenticateToken, requireRole('admin', 'ceo', 'chapter_president', 'district_admin'), (req, res) => {
  const member = db.findById('members', req.params.id);
  if (!member) {
    return sendError(res, 'सदस्य सापडला नाही.', 'MEMBER_NOT_FOUND', 404);
  }

  const { status, remarks } = req.body; // status: 'approved' | 'rejected'
  if (status === undefined || status === null) {
    return sendError(res, 'कृपया पडताळणी स्थिती (approved / rejected) प्रविष्ट करा.', 'MISSING_STATUS', 400);
  }

  const isApproved = status === 'approved' || status === true;
  const cleanRemarks = remarks ? String(remarks).trim() : 'कागदपत्र पडताळणी पूर्ण झाली';

  const updated = db.update('members', req.params.id, {
    verified: isApproved,
    verificationStatus: isApproved ? 'प्रमाणित (Verified)' : 'नाकारले (Rejected)',
    verifiedBy: req.user.name,
    verificationRemarks: cleanRemarks,
    verifiedAt: new Date().toISOString()
  });

  db.addAuditLog('VERIFY_MEMBER', req.user.id, { memberId: req.params.id, status, remarks: cleanRemarks });

  // Send notification to the member
  db.insert('notifications', {
    recipientId: req.params.id,
    title: isApproved ? '✅ डिजिटल ओळखपत्र प्रमाणित झाले!' : '⚠️ ओळखपत्र पडताळणी सूचना',
    message: isApproved 
      ? `अभिनंदन! आपले मराठा महासंघ डिजिटल ओळखपत्र ${req.user.name} यांच्याद्वारे प्रमाणित करण्यात आले आहे.`
      : `आपली पडताळणी प्रलंबित आहे: ${cleanRemarks}`,
    type: 'verification',
    read: false,
    timestamp: new Date().toISOString()
  });

  return sendSuccess(res, isApproved ? 'सदस्य ओळखपत्र यशस्वीरीत्या प्रमाणित करण्यात आले!' : 'सदस्य पडताळणी अद्यतनित झाली.', {
    member: updated
  });
});

// GET /api/admin/roles-matrix
// Fetch role eligibility matrix, permissions, and scope thresholds
router.get('/roles-matrix', authenticateToken, (req, res) => {
  const matrix = [
    {
      role: 'superadmin',
      titleMarathi: 'सर्वोच्च प्रशासक (SuperAdmin)',
      permissions: ['ALL_PERMISSIONS', 'SYSTEM_CONFIG', 'AUDIT_LOG_FULL'],
      scope: 'संपूर्ण महासंघ भारत'
    },
    {
      role: 'ceo',
      titleMarathi: 'मुख्य कार्यकारी अधिकारी (CEO / प्रदेशाध्यक्ष)',
      permissions: ['STATE_ANALYTICS', 'ASSIGN_DISTRICT_HEAD', 'FINANCIAL_REPORTS', 'POLICY_DECISIONS'],
      scope: 'महाराष्ट्र राज्य'
    },
    {
      role: 'district_admin',
      titleMarathi: 'जिल्हा अध्यक्ष / समन्वयक (District Head)',
      permissions: ['VERIFY_MEMBERS', 'APPROVE_CHAPTERS', 'DISTRICT_EVENTS', 'DISPUTE_RESOLUTION'],
      scope: 'जिल्हा कार्यक्षेत्र'
    },
    {
      role: 'chapter_president',
      titleMarathi: 'तालुका / मंडल अध्यक्ष (Chapter President)',
      permissions: ['CHAPTER_MEETINGS', 'LOCAL_MEMBER_ONBOARDING', 'CHAPTER_REFERRALS'],
      scope: 'तालुका / शहर मंडल'
    },
    {
      role: 'seva_helpdesk',
      titleMarathi: 'सेवा व मदत कक्ष प्रतिनिधी (Seva Helpdesk)',
      permissions: ['BLOOD_DISPATCH', 'GRIEVANCE_INTAKE', 'WOMEN_HELP_COORDINATION'],
      scope: '२४x७ मदत कक्ष'
    },
    {
      role: 'member',
      titleMarathi: 'अधिकृत मराठा महासंघ सदस्य',
      permissions: ['DIGITAL_CARD', 'COMMUNITY_POST', 'SANGAM_REFERRAL', 'EVENT_RSVP'],
      scope: 'वैयक्तिक प्रोफाइल'
    }
  ];

  return sendSuccess(res, 'भूमिका व अधिकार पात्रता मॅट्रिक्स', { rolesMatrix: matrix });
});

// PUT /api/admin/assign-role
// Assign chapter president, district head, or seva desk roles
router.put('/assign-role', authenticateToken, requireRole('admin', 'ceo', 'superadmin'), (req, res) => {
  const { memberId, newRole, assignedScope, remarks } = req.body;
  if (!memberId || !newRole) {
    return sendError(res, 'कृपया सदस्य आयडी आणि नवीन पद प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const validRoles = ['superadmin', 'ceo', 'admin', 'district_admin', 'chapter_president', 'seva_helpdesk', 'member'];
  if (!validRoles.includes(newRole)) {
    return sendError(res, `अवैध पद/भूमिका. वैध पदे: ${validRoles.join(', ')}`, 'INVALID_ROLE', 400);
  }

  const member = db.findById('members', memberId);
  if (!member) {
    return sendError(res, 'सदस्य सापडला नाही.', 'MEMBER_NOT_FOUND', 404);
  }

  const updated = db.update('members', memberId, {
    role: newRole,
    assignedScope: assignedScope ? String(assignedScope).trim() : (member.district || 'पुणे'),
    roleAssignedBy: req.user.name,
    roleAssignedAt: new Date().toISOString()
  });

  db.addAuditLog('ASSIGN_ROLE', req.user.id, { memberId, newRole, assignedScope, remarks });

  db.insert('notifications', {
    recipientId: memberId,
    title: '🎖️ महासंघ नवीन जबाबदारी व पद नियुक्ती',
    message: `आपणास महासंघामध्ये "${newRole}" पदाची जबाबदारी सोपवण्यात आली आहे. कार्यक्षेत्र: ${assignedScope || 'महाराष्ट्र'}.`,
    type: 'role_assignment',
    read: false,
    timestamp: new Date().toISOString()
  });

  return sendSuccess(res, `सदस्य ${member.name} यांना "${newRole}" पद यशस्वीरीत्या बहाल करण्यात आले!`, {
    member: updated
  });
});

// GET /api/admin/reports/export
// Export Excel/CSV reports of members, businesses, or donations
router.get('/reports/export', authenticateToken, requireRole('admin', 'ceo', 'district_admin'), (req, res) => {
  const { type = 'members', format = 'json' } = req.query;

  let dataset = [];
  if (type === 'members') dataset = db.getCollection('members');
  else if (type === 'businesses') dataset = db.getCollection('businesses');
  else if (type === 'donations') dataset = db.getCollection('donations');
  else if (type === 'referrals') dataset = db.getCollection('referrals');

  return sendSuccess(res, `${type} अहवाल डेटा तयार झाला आहे`, {
    type,
    recordCount: dataset.length,
    generatedAt: new Date().toISOString(),
    records: dataset
  });
});

// ==========================================
// SITE CONTENT & CMS MANAGEMENT (/api/admin/site-content)
// ==========================================
// GET /api/admin/site-content
router.get('/site-content', (req, res) => {
  const content = db.getSiteContent();
  return sendSuccess(res, 'वेबसाइट डेटा व मांडणी', { siteContent: content, content });
});

// PUT /api/admin/site-content
router.put('/site-content', authenticateToken, requireRole('admin', 'ceo', 'superadmin', 'district_admin'), (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return sendError(res, 'कृपया अद्ययावत करण्यासाठी वैध डेटा पाठवा.', 'INVALID_PAYLOAD', 400);
  }

  const updated = db.updateSiteContent(updates);
  db.addAuditLog('UPDATE_SITE_CONTENT', req.user?.id || 'ADMIN', {
    sections: Object.keys(updates),
    adminName: req.user?.name || 'व्यवस्थापक'
  });

  return sendSuccess(res, 'वेबसाइट डेटा यशस्वीरीत्या अद्यतनित व जतन करण्यात आला!', { siteContent: updated, content: updated });
});

// PUT /api/admin/site-content/:section
router.put('/site-content/:section', authenticateToken, requireRole('admin', 'ceo', 'superadmin', 'district_admin'), (req, res) => {
  const { section } = req.params;
  const sectionData = req.body;

  if (!sectionData || typeof sectionData !== 'object') {
    return sendError(res, 'कृपया वैध सेक्शन डेटा पाठवा.', 'INVALID_PAYLOAD', 400);
  }

  const current = db.getSiteContent();
  const updatedSection = {
    ...current[section],
    ...sectionData
  };

  const updated = db.updateSiteContent({ [section]: updatedSection });
  db.addAuditLog('UPDATE_SITE_SECTION', req.user?.id || 'ADMIN', {
    section,
    adminName: req.user?.name || 'व्यवस्थापक'
  });

  return sendSuccess(res, `सेक्शन "${section}" अद्यतनित झाले!`, {
    section,
    data: updated[section],
    siteContent: updated
  });
});

// POST /api/admin/site-content/reset
router.post('/site-content/reset', authenticateToken, requireRole('admin', 'ceo', 'superadmin'), (req, res) => {
  const defaults = db.getDefaultSiteContent();
  db.data.siteContent = defaults;
  db.save();
  db.syncSiteContentToSqlite(defaults);

  db.addAuditLog('RESET_SITE_CONTENT', req.user?.id || 'ADMIN', {
    adminName: req.user?.name || 'व्यवस्थापक'
  });

  return sendSuccess(res, 'वेबसाइट डेटा पूर्ववत (Default) करण्यात आला.', { siteContent: defaults });
});

// =========================================================================
// SUPERADMIN & ADMIN: USER MANAGEMENT CRUD (/api/admin/users)
// =========================================================================

// GET /api/admin/users - List all users with filtering & statistics
router.get('/users', authenticateToken, requireRole('superadmin', 'admin', 'ceo', 'district_admin'), (req, res) => {
  const { search, role, verified, district, tier, active, online } = req.query;
  let members = db.getCollection('members');
  const now = Date.now();
  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

  // Formatting helper for user activity timestamp
  const formatLastActive = (iso) => {
    if (!iso) return 'काही वेळापूर्वी';
    const diffMs = now - new Date(iso).getTime();
    if (diffMs < 0 || diffMs < 2 * 60 * 1000) return 'आत्ताच सक्रिय (Online Now)';
    const mins = Math.floor(diffMs / (60 * 1000));
    if (mins < 60) return `${mins} मिनिटांपूर्वी`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} तासांपूर्वी`;
    const days = Math.floor(hours / 24);
    return `${days} दिवसांपूर्वी`;
  };

  // Filter for active/online users if requested
  if (active === 'true' || online === 'true' || active === true) {
    members = members.filter(m => {
      if (!m.last_active_at) return false;
      return (now - new Date(m.last_active_at).getTime()) <= FIFTEEN_MINUTES_MS;
    });
  }

  if (role && role !== 'all') {
    members = members.filter(m => (m.role || 'member').toLowerCase() === role.toLowerCase());
  }

  if (verified !== undefined && verified !== 'all') {
    const isV = verified === 'true' || verified === true;
    members = members.filter(m => Boolean(m.verified) === isV);
  }

  if (district && district !== 'all') {
    members = members.filter(m => (m.district || '').toLowerCase().includes(district.toLowerCase()));
  }

  if (tier && tier !== 'all') {
    members = members.filter(m => (m.tier || '').toLowerCase() === tier.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    members = members.filter(m => 
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q) ||
      (m.district || '').toLowerCase().includes(q) ||
      (m.taluka || '').toLowerCase().includes(q) ||
      (m.kul || '').toLowerCase().includes(q) ||
      (m.id || '').toLowerCase().includes(q)
    );
  }

  // Safe members with online status tags
  const safeMembers = members.map(({ password_hash, ...m }) => {
    const isOnline = m.last_active_at ? (now - new Date(m.last_active_at).getTime() <= FIFTEEN_MINUTES_MS) : false;
    return {
      ...m,
      isOnline,
      lastActiveFormatted: formatLastActive(m.last_active_at)
    };
  });

  // Quick stats
  const allMembers = db.getCollection('members');
  const activeCount = allMembers.filter(m => m.last_active_at && (now - new Date(m.last_active_at).getTime() <= FIFTEEN_MINUTES_MS)).length;

  const stats = {
    total: allMembers.length,
    activeUsersNow: activeCount,
    superadmins: allMembers.filter(m => m.role === 'superadmin').length,
    admins: allMembers.filter(m => m.role === 'admin' || m.role === 'ceo').length,
    districtHeads: allMembers.filter(m => m.role === 'district_admin').length,
    chapterPresidents: allMembers.filter(m => m.role === 'chapter_president').length,
    verifiedMembers: allMembers.filter(m => m.verified).length,
    pendingVerifications: allMembers.filter(m => !m.verified).length
  };

  return sendSuccess(res, 'वापरकर्ते यादी प्राप्त झाली', {
    users: safeMembers,
    count: safeMembers.length,
    activeCount,
    stats
  });
});

// POST /api/admin/users - Superadmin creates a new user
router.post('/users', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const { name, email, phone, password, role, district, taluka, kul, gotra, tier, profession, business, verified } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'कृपया नाव आणि संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  if (!isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const existingPhone = db.findOne('members', m => m.phone === cleanedPhone || m.phone === `+91 ${cleanedPhone}`);
  if (existingPhone) {
    return sendError(res, 'हा फोन नंबर अगोदरच नोंदणीकृत आहे.', 'PHONE_EXISTS', 409);
  }

  const cleanRole = sanitize(role) || 'member';
  const isVerified = verified === true || verified === 'true';

  const salt = bcrypt.genSaltSync(8);
  const passwordHash = bcrypt.hashSync(password || 'password123', salt);

  const newMember = {
    id: `CM-96K-${Date.now().toString().slice(-5)}`,
    name: cleanName,
    email: sanitize(email) || `${cleanedPhone}@connectmaratha.org`,
    phone: cleanedPhone,
    password_hash: passwordHash,
    avatar: '👤',
    city: sanitize(district) || 'पुणे',
    district: sanitize(district) || 'पुणे',
    taluka: sanitize(taluka) || 'हवेली',
    state: 'महाराष्ट्र',
    country: 'भारत',
    kul: sanitize(kul) || '९६ कुळी मराठा',
    gotra: sanitize(gotra) || 'भारद्वाज',
    profession: sanitize(profession) || 'व्यावसायिक',
    business: sanitize(business) || '',
    tier: sanitize(tier) || 'Gold',
    role: cleanRole,
    verified: isVerified,
    verificationStatus: isVerified ? 'प्रमाणित (Verified)' : 'पडताळणी प्रलंबित',
    verifiedBy: isVerified ? req.user.name : null,
    joined: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  db.insert('members', newMember);
  db.addAuditLog('SUPERADMIN_CREATE_USER', req.user.id, {
    newUserId: newMember.id,
    newUserName: cleanName,
    role: cleanRole
  });

  const { password_hash, ...safeResult } = newMember;
  return sendSuccess(res, 'नवीन वापरकर्ता यशस्वीरीत्या तयार करण्यात आला!', { user: safeResult }, 201);
});

// GET /api/admin/users/:id - Get specific user profile details
router.get('/users/:id', authenticateToken, requireRole('superadmin', 'admin', 'ceo', 'district_admin'), (req, res) => {
  const member = db.findById('members', req.params.id);
  if (!member) {
    return sendError(res, 'वापरकर्ता सापडला नाही.', 'USER_NOT_FOUND', 404);
  }
  const { password_hash, ...safeUser } = member;
  return sendSuccess(res, 'वापरकर्ता तपशील', { user: safeUser });
});

// PUT /api/admin/users/:id - Superadmin updates any user
router.put('/users/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const member = db.findById('members', req.params.id);
  if (!member) {
    return sendError(res, 'वापरकर्ता सापडला नाही.', 'USER_NOT_FOUND', 404);
  }

  const updates = { ...req.body };
  delete updates.id;

  if (updates.name) updates.name = sanitize(updates.name);
  if (updates.email) updates.email = sanitize(updates.email);
  if (updates.phone) updates.phone = cleanPhone(updates.phone);
  if (updates.district) updates.district = sanitize(updates.district);
  if (updates.taluka) updates.taluka = sanitize(updates.taluka);
  if (updates.kul) updates.kul = sanitize(updates.kul);
  if (updates.gotra) updates.gotra = sanitize(updates.gotra);
  if (updates.tier) updates.tier = sanitize(updates.tier);
  if (updates.profession) updates.profession = sanitize(updates.profession);
  if (updates.business) updates.business = sanitize(updates.business);

  if (updates.password) {
    const salt = bcrypt.genSaltSync(8);
    updates.password_hash = bcrypt.hashSync(updates.password, salt);
    delete updates.password;
  }

  if (updates.verified !== undefined) {
    updates.verified = Boolean(updates.verified);
    updates.verificationStatus = updates.verified ? 'प्रमाणित (Verified)' : 'नाकारले / प्रलंबित';
  }

  const updated = db.update('members', req.params.id, updates);
  db.addAuditLog('SUPERADMIN_UPDATE_USER', req.user.id, {
    targetUserId: req.params.id,
    updatedFields: Object.keys(updates)
  });

  const { password_hash, ...safeResult } = updated;
  return sendSuccess(res, 'वापरकर्ता माहिती अद्यतनित करण्यात आली!', { user: safeResult });
});

// DELETE /api/admin/users/:id - Superadmin deletes a user
router.delete('/users/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const { id } = req.params;
  const member = db.findById('members', id);

  if (!member) {
    return sendError(res, 'वापरकर्ता सापडला नाही.', 'USER_NOT_FOUND', 404);
  }

  // Prevent self-deletion or deletion of root superadmin
  if (id === req.user.id) {
    return sendError(res, 'तुम्ही तुमचे स्वतःचे खाते हटवू शकत नाही.', 'CANNOT_DELETE_SELF', 400);
  }

  if (id === 'CM-SUPER-001') {
    return sendError(res, 'मूळ सर्वोच्च प्रशासक (Root SuperAdmin) खाते हटवता येत नाही.', 'ROOT_PROTECTED', 403);
  }

  db.remove('members', id);
  db.addAuditLog('SUPERADMIN_DELETE_USER', req.user.id, {
    deletedUserId: id,
    deletedUserName: member.name
  });

  return sendSuccess(res, `वापरकर्ता "${member.name}" यशस्वीरीत्या काढून टाकण्यात आला.`, { deletedId: id });
});

// =========================================================================
// SUPERADMIN & ADMIN: DOCTORS CRUD (/api/admin/doctors)
// =========================================================================
router.get('/doctors', authenticateToken, requireRole('superadmin', 'admin', 'ceo'), (req, res) => {
  const doctors = db.getCollection('doctors');
  return sendSuccess(res, 'डॉक्टर्स यादी', { doctors, count: doctors.length });
});

router.post('/doctors', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const { name, specialty, degree, hospital, city, district, phone, experience, consultationFee, avatar } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'कृपया डॉक्टरचे नाव व फोन नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const newDoc = {
    id: `DOC-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    specialty: sanitize(specialty) || 'जनरल फिजिशियन',
    degree: sanitize(degree) || 'M.B.B.S.',
    hospital: sanitize(hospital) || 'सह्याद्री हॉस्पिटल',
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || sanitize(city) || 'पुणे',
    phone: cleanedPhone,
    experience: sanitize(experience) || '१०+ वर्षे',
    consultationFee: sanitize(consultationFee) || '₹५००',
    avatar: avatar || '🩺',
    verified: true,
    created_at: new Date().toISOString()
  };

  db.insert('doctors', newDoc);
  db.addAuditLog('SUPERADMIN_ADD_DOCTOR', req.user.id, { doctorId: newDoc.id, name: cleanName });

  return sendSuccess(res, 'डॉक्टर यशस्वीरीत्या जोडण्यात आले!', { doctor: newDoc }, 201);
});

router.put('/doctors/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const doc = db.findById('doctors', req.params.id);
  if (!doc) {
    return sendError(res, 'डॉक्टर सापडले नाहीत.', 'DOCTOR_NOT_FOUND', 404);
  }

  const updates = { ...req.body };
  delete updates.id;
  if (updates.name) updates.name = sanitize(updates.name);
  if (updates.phone) updates.phone = cleanPhone(updates.phone);

  const updated = db.update('doctors', req.params.id, updates);
  db.addAuditLog('SUPERADMIN_UPDATE_DOCTOR', req.user.id, { doctorId: req.params.id });

  return sendSuccess(res, 'डॉक्टर माहिती अद्यतनित करण्यात आली!', { doctor: updated });
});

router.delete('/doctors/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const doc = db.findById('doctors', req.params.id);
  if (!doc) {
    return sendError(res, 'डॉक्टर सापडले नाहीत.', 'DOCTOR_NOT_FOUND', 404);
  }

  db.remove('doctors', req.params.id);
  db.addAuditLog('SUPERADMIN_DELETE_DOCTOR', req.user.id, { doctorId: req.params.id, name: doc.name });

  return sendSuccess(res, `डॉक्टर "${doc.name}" यादीतून काढून टाकण्यात आले.`, { deletedId: req.params.id });
});

// =========================================================================
// SUPERADMIN & ADMIN: SERVICES & PROVIDERS CRUD (/api/admin/services)
// =========================================================================
router.get('/services', authenticateToken, requireRole('superadmin', 'admin', 'ceo'), (req, res) => {
  const services = db.getCollection('services');
  return sendSuccess(res, 'सेवा व व्यावसायिक यादी', { services, count: services.length });
});

router.post('/services', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const { name, category, location, phone, rating, experience, pricing, description } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName) {
    return sendError(res, 'कृपया सेवा प्रदात्याचे नाव प्रविष्ट करा.', 'MISSING_NAME', 400);
  }

  const newService = {
    id: `SRV-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    category: sanitize(category) || 'स्थानिक सेवा',
    location: sanitize(location) || 'महाराष्ट्र',
    phone: cleanedPhone || '+91 98220 00000',
    rating: sanitize(rating) || '4.9 ★',
    experience: sanitize(experience) || '५+ वर्षे',
    pricing: sanitize(pricing) || 'कामाच्या स्वरूपानुसार',
    description: sanitize(description) || '',
    created_at: new Date().toISOString()
  };

  db.insert('services', newService);
  db.addAuditLog('SUPERADMIN_ADD_SERVICE', req.user.id, { serviceId: newService.id, name: cleanName });

  return sendSuccess(res, 'नवीन सेवा प्रदाता यशस्वीरीत्या जोडण्यात आला!', { service: newService }, 201);
});

router.put('/services/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const srv = db.findById('services', req.params.id);
  if (!srv) {
    return sendError(res, 'सेवा प्रदाता सापडला नाही.', 'SERVICE_NOT_FOUND', 404);
  }

  const updates = { ...req.body };
  delete updates.id;
  if (updates.name) updates.name = sanitize(updates.name);
  if (updates.phone) updates.phone = cleanPhone(updates.phone);

  const updated = db.update('services', req.params.id, updates);
  db.addAuditLog('SUPERADMIN_UPDATE_SERVICE', req.user.id, { serviceId: req.params.id });

  return sendSuccess(res, 'सेवा माहिती अद्यतनित करण्यात आली!', { service: updated });
});

router.delete('/services/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const srv = db.findById('services', req.params.id);
  if (!srv) {
    return sendError(res, 'सेवा प्रदाता सापडला नाही.', 'SERVICE_NOT_FOUND', 404);
  }

  db.remove('services', req.params.id);
  db.addAuditLog('SUPERADMIN_DELETE_SERVICE', req.user.id, { serviceId: req.params.id, name: srv.name });

  return sendSuccess(res, `सेवा "${srv.name}" काढून टाकण्यात आली.`, { deletedId: req.params.id });
});

// =========================================================================
// SUPERADMIN & ADMIN: HOTELS & HOSPITALITY CRUD (/api/admin/hotels)
// =========================================================================
router.get('/hotels', authenticateToken, requireRole('superadmin', 'admin', 'ceo'), (req, res) => {
  const hotels = db.getCollection('hotels');
  return sendSuccess(res, 'हॉटेल्स यादी', { hotels, count: hotels.length });
});

router.post('/hotels', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const { name, city, district, category, star_rating, address, phone, website, rooms_count, price_range, amenities } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName) {
    return sendError(res, 'कृपया हॉटेलचे नाव प्रविष्ट करा.', 'MISSING_NAME', 400);
  }

  const newHotel = {
    id: `HTL-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || sanitize(city) || 'पुणे',
    category: sanitize(category) || 'हॉटेल व लॉजिंग',
    star_rating: Number(star_rating) || 4.5,
    address: sanitize(address) || 'महाराष्ट्र',
    phone: cleanedPhone || '+91 98220 11000',
    website: sanitize(website) || '',
    rooms_count: Number(rooms_count) || 20,
    price_range: sanitize(price_range) || '₹२,००० - ₹५,०००',
    amenities: Array.isArray(amenities) ? amenities : ['वायफाय', 'पार्किंग', 'भोजनालय'],
    photo: '🏨',
    verified: true,
    created_at: new Date().toISOString()
  };

  db.insert('hotels', newHotel);
  db.addAuditLog('SUPERADMIN_ADD_HOTEL', req.user.id, { hotelId: newHotel.id, name: cleanName });

  return sendSuccess(res, 'नवीन हॉटेल यशस्वीरीत्या जोडण्यात आले!', { hotel: newHotel }, 201);
});

router.put('/hotels/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const htl = db.findById('hotels', req.params.id);
  if (!htl) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'HOTEL_NOT_FOUND', 404);
  }

  const updates = { ...req.body };
  delete updates.id;
  if (updates.name) updates.name = sanitize(updates.name);
  if (updates.phone) updates.phone = cleanPhone(updates.phone);

  const updated = db.update('hotels', req.params.id, updates);
  db.addAuditLog('SUPERADMIN_UPDATE_HOTEL', req.user.id, { hotelId: req.params.id });

  return sendSuccess(res, 'हॉटेल माहिती अद्यतनित करण्यात आली!', { hotel: updated });
});

router.delete('/hotels/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const htl = db.findById('hotels', req.params.id);
  if (!htl) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'HOTEL_NOT_FOUND', 404);
  }

  db.remove('hotels', req.params.id);
  db.addAuditLog('SUPERADMIN_DELETE_HOTEL', req.user.id, { hotelId: req.params.id, name: htl.name });

  return sendSuccess(res, `हॉटेल "${htl.name}" काढून टाकण्यात आले.`, { deletedId: req.params.id });
});

// =========================================================================
// SUPERADMIN & ADMIN: INFORMATION ARTICLES CRUD (/api/admin/information)
// =========================================================================
router.get('/information', authenticateToken, requireRole('superadmin', 'admin', 'ceo'), (req, res) => {
  const info = db.getCollection('information');
  return sendSuccess(res, 'माहिती व ज्ञानकोश लेख यादी', { information: info, count: info.length });
});

router.post('/information', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const { title, category, author, summary, content, tags, image_url, featured } = req.body;
  const cleanTitle = sanitize(title);

  if (!cleanTitle) {
    return sendError(res, 'कृपया लेखाचे शीर्षक प्रविष्ट करा.', 'MISSING_TITLE', 400);
  }

  const newArticle = {
    id: `INFO-${Date.now().toString().slice(-4)}`,
    title: cleanTitle,
    category: sanitize(category) || 'मराठा इतिहास व वारसा',
    author: sanitize(author) || req.user.name,
    summary: sanitize(summary) || '',
    content: sanitize(content) || '',
    tags: Array.isArray(tags) ? tags : ['माहिती', 'इतिहास'],
    image_url: sanitize(image_url) || '/assets/images/real-raigad-panoramic.jpg',
    featured: featured ? 1 : 0,
    created_at: new Date().toISOString()
  };

  db.insert('information', newArticle);
  db.addAuditLog('SUPERADMIN_ADD_INFO', req.user.id, { articleId: newArticle.id, title: cleanTitle });

  return sendSuccess(res, 'नवीन माहिती लेख यशस्वीरीत्या जोडण्यात आला!', { article: newArticle }, 201);
});

router.put('/information/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const item = db.findById('information', req.params.id);
  if (!item) {
    return sendError(res, 'माहिती लेख सापडला नाही.', 'INFO_NOT_FOUND', 404);
  }

  const updates = { ...req.body };
  delete updates.id;
  if (updates.title) updates.title = sanitize(updates.title);

  const updated = db.update('information', req.params.id, updates);
  db.addAuditLog('SUPERADMIN_UPDATE_INFO', req.user.id, { articleId: req.params.id });

  return sendSuccess(res, 'माहिती लेख अद्यतनित करण्यात आला!', { article: updated });
});

router.delete('/information/:id', authenticateToken, requireRole('superadmin', 'admin'), (req, res) => {
  const item = db.findById('information', req.params.id);
  if (!item) {
    return sendError(res, 'माहिती लेख सापडला नाही.', 'INFO_NOT_FOUND', 404);
  }

  db.remove('information', req.params.id);
  db.addAuditLog('SUPERADMIN_DELETE_INFO', req.user.id, { articleId: req.params.id, title: item.title });

  return sendSuccess(res, `माहिती लेख "${item.title}" काढून टाकण्यात आला.`, { deletedId: req.params.id });
});

export default router;
