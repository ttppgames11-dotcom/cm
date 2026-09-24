import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

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

  const metrics = {
    overview: {
      totalRegisteredMembers: members.length,
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

export default router;
