import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, isValidPhone, cleanPhone, isValidBloodGroup } from '../utils/validator.js';

const router = Router();

// GET /api/members/stats/summary
// Public aggregated statistics
router.get('/stats/summary', (req, res) => {
  const members = db.getCollection('members');
  const businesses = db.getCollection('businesses');
  const donors = db.getCollection('bloodDonors');
  const groups = db.getCollection('groups');

  const districtCount = new Set(members.map(m => m.district).filter(Boolean)).size;
  const verifiedCount = members.filter(m => m.verified).length;

  return sendSuccess(res, 'एकत्रित सांख्यिकी माहिती', {
    totalMembers: members.length,
    verifiedMembers: verifiedCount,
    activeMandals: groups.length,
    districtSpread: districtCount,
    bloodDonorsCount: donors.length,
    registeredBusinesses: businesses.length
  });
});

// GET /api/members/notifications
// Authenticated user notifications
router.get('/notifications', authenticateToken, (req, res) => {
  const allNotifications = db.getCollection('notifications');
  const userNotifs = allNotifications.filter(n => !n.recipientId || n.recipientId === req.user.id);

  if (userNotifs.length === 0) {
    // Generate default welcome notification
    const defaultNotif = {
      id: `NOTIF-${Date.now()}`,
      recipientId: req.user.id,
      title: 'अखिल भारतीय मराठा महासंघात आपले स्वागत आहे!',
      message: 'आपले डिजिटल ओळखपत्र तयार झाले आहे. प्रोफाइल पूर्ण करून विविध सेवांचा लाभ घ्या.',
      type: 'welcome',
      read: false,
      timestamp: new Date().toISOString()
    };
    db.insert('notifications', defaultNotif);
    userNotifs.push(defaultNotif);
  }

  return sendSuccess(res, 'सूचना यादी प्राप्त झाली', {
    notifications: userNotifs,
    unreadCount: userNotifs.filter(n => !n.read).length
  });
});

// GET /api/members/messages
// Authenticated fetch conversations
router.get('/messages', authenticateToken, (req, res) => {
  const messages = db.getCollection('messages');
  const userMsgs = messages.filter(m => m.senderId === req.user.id || m.recipientId === req.user.id);

  return sendSuccess(res, 'संदेश यादी प्राप्त झाली', {
    messages: userMsgs,
    count: userMsgs.length
  });
});

// POST /api/members/messages
// Send direct peer-to-peer or chapter message
router.post('/messages', authenticateToken, (req, res) => {
  const recipientId = sanitize(req.body.recipientId);
  const subject = sanitize(req.body.subject) || 'सामान्य संदेश';
  const message = sanitize(req.body.message);
  const attachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];

  if (!recipientId || !message) {
    return sendError(res, 'कृपया प्राप्तकर्ता व संदेश प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  if (message.length < 2) {
    return sendError(res, 'संदेश किमान २ अक्षरांचा असावा.', 'MESSAGE_TOO_SHORT', 400);
  }

  const newMsg = {
    id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: req.user.id,
    senderName: req.user.name,
    recipientId,
    subject,
    message,
    attachments,
    read: false,
    timestamp: new Date().toISOString()
  };

  db.insert('messages', newMsg);
  db.addAuditLog('SEND_MESSAGE', req.user.id, { recipientId });

  return sendSuccess(res, 'संदेश यशस्वीरीत्या पाठवला गेला!', { message: newMsg }, 201);
});

// GET /api/members
// List all registered members with search and filters
router.get('/', (req, res) => {
  const { search, district, profession, bloodGroup, limit = 50, page = 1 } = req.query;
  let members = db.getCollection('members').map(m => {
    const copy = { ...m };
    delete copy.password_hash;
    return copy;
  });

  if (district && district !== 'सर्व') {
    members = members.filter(m => (m.district || '').toLowerCase() === district.toLowerCase());
  }

  if (profession && profession !== 'सर्व') {
    members = members.filter(m => (m.profession || '').toLowerCase().includes(profession.toLowerCase()));
  }

  if (bloodGroup && bloodGroup !== 'सर्व') {
    members = members.filter(m => (m.bloodGroup || '').toLowerCase() === bloodGroup.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    members = members.filter(m => 
      (m.name || '').toLowerCase().includes(q) ||
      (m.city || '').toLowerCase().includes(q) ||
      (m.district || '').toLowerCase().includes(q) ||
      (m.profession || '').toLowerCase().includes(q) ||
      (m.kul || '').toLowerCase().includes(q) ||
      (m.id || '').toLowerCase().includes(q)
    );
  }

  const start = (Number(page) - 1) * Number(limit);
  const paginated = members.slice(start, start + Number(limit));

  return sendSuccess(res, 'सदस्य यादी प्राप्त झाली', {
    members: paginated,
    total: members.length,
    page: Number(page),
    limit: Number(limit)
  });
});

// GET /api/members/:id/card
// Generate and return digital member ID card data & royal certificate metadata
router.get('/:id/card', authenticateToken, (req, res) => {
  const member = db.findById('members', req.params.id);
  if (!member) {
    return sendError(res, 'सदस्य सापडला नाही.', 'MEMBER_NOT_FOUND', 404);
  }

  const cardData = {
    memberId: member.id,
    name: member.name,
    avatar: member.avatar || '👤',
    kul: member.kul || '९६ कुळी मराठा',
    gotra: member.gotra || 'भारद्वाज',
    district: member.district || 'पुणे',
    chapter: `${member.district || 'पुणे'} जिल्हा शाखा`,
    issueDate: member.joined || '२०२६-०१-०१',
    validThru: 'आजीवन सदस्यत्व (Lifetime Membership)',
    tier: member.tier || 'Gold Member',
    seal: 'शिवकालीन राजमुद्रा प्रमाणित',
    qrVerificationToken: `VERIFIED-${member.id}-${Buffer.from(member.name).toString('base64').slice(0, 10)}`,
    motto: 'प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते।'
  };

  return sendSuccess(res, 'डिजिटल सदस्य ओळखपत्र डेटा', { cardData });
});

// GET /api/members/:id
// Get full profile details by Member ID
router.get('/:id', authenticateToken, (req, res) => {
  const member = db.findById('members', req.params.id);
  if (!member) {
    return sendError(res, 'सदस्य प्रोफाइल सापडले नाही.', 'MEMBER_NOT_FOUND', 404);
  }

  const safe = { ...member };
  delete safe.password_hash;

  return sendSuccess(res, 'सदस्य तपशील प्राप्त झाला', { member: safe });
});

// PUT /api/members/:id
// Update personal bio, address, profession, contact visibility
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return sendError(res, 'आपणास ही प्रोफाइल बदलण्याची परवानगी नाही.', 'FORBIDDEN', 403);
  }

  const allowedFields = ['name', 'phone', 'city', 'district', 'taluka', 'profession', 'business', 'education', 'skills', 'about', 'avatar', 'kul', 'gotra', 'bloodGroup', 'privacy'];
  const updates = {};

  if (req.body.phone !== undefined) {
    const cleaned = cleanPhone(req.body.phone);
    if (cleaned && !isValidPhone(cleaned)) {
      return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }
    updates.phone = cleaned;
  }

  if (req.body.bloodGroup !== undefined && req.body.bloodGroup) {
    if (!isValidBloodGroup(req.body.bloodGroup)) {
      return sendError(res, 'कृपया वैध रक्तगट निवडा.', 'INVALID_BLOOD_GROUP', 400);
    }
    updates.bloodGroup = sanitize(req.body.bloodGroup);
  }

  for (const f of allowedFields) {
    if (req.body[f] !== undefined && f !== 'phone' && f !== 'bloodGroup') {
      updates[f] = typeof req.body[f] === 'string' ? sanitize(req.body[f]) : req.body[f];
    }
  }

  const updated = db.update('members', req.params.id, updates);
  if (!updated) {
    return sendError(res, 'सदस्य सापडला नाही.', 'MEMBER_NOT_FOUND', 404);
  }

  const safe = { ...updated };
  delete safe.password_hash;
  db.addAuditLog('PROFILE_UPDATE', req.user.id, { memberId: req.params.id });

  return sendSuccess(res, 'प्रोफाइल यशस्वीरीत्या अपडेट करण्यात आली!', { member: safe });
});

export default router;
