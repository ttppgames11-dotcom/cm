import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ensureWebsiteTables, isAdmin, isStaff, cleanMobile, text, newId } from '../utils/websiteTables.js';

// Website helpdesk (unified tickets) and community-centre front desk.
// Mounted at /api/crm and /api/admin/crm.
// Members create tickets and see only their own; staff/admins see and work all.
const router = Router();

const LEVELS = ['taluka', 'district', 'division', 'state'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['New', 'In_Progress', 'Escalated', 'Resolved', 'Closed'];

const requireStaff = (req, res, next) =>
  isStaff(req.user) ? next() : sendError(res, 'फक्त अधिकृत कर्मचाऱ्यांना परवानगी आहे. (Staff only)', 'FORBIDDEN', 403);

function parseTrail(raw) {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Same shape the website already reads (camelCase plus created_at/updated_at).
function toTicket(row) {
  return {
    id: row.id,
    ticketNumber: row.id,
    source: row.source,
    title: row.title,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory || '',
    priority: row.priority,
    district: row.district || '',
    taluka: row.taluka || '',
    division: row.division || '',
    assignedCenterId: row.assigned_center_id || '',
    currentOwnerLevel: row.current_owner_level,
    status: row.status,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterPhone: row.requester_phone || '',
    slaHours: Number(row.sla_hours) || null,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    auditTrail: parseTrail(row.audit_trail),
  };
}

async function loadTicket(id) {
  const row = await get('SELECT * FROM support_tickets WHERE id = ?', [id]);
  return row ? toTicket(row) : null;
}

async function saveTicketChange(ticket, changes, entry) {
  const trail = [...ticket.auditTrail, { ...entry, timestamp: new Date().toISOString() }];
  const now = new Date().toISOString();
  await runQuery(
    'UPDATE support_tickets SET status = ?, current_owner_level = ?, audit_trail = ?, updated_at = ? WHERE id = ?',
    [changes.status ?? ticket.status, changes.currentOwnerLevel ?? ticket.currentOwnerLevel, JSON.stringify(trail), now, ticket.id]
  );
  return loadTicket(ticket.id);
}

// GET /api/crm/tickets?status=&priority=&category=&district=&taluka=&division=
router.get('/tickets', authenticateToken, async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    let sql = 'SELECT * FROM support_tickets WHERE 1=1';
    const params = [];
    if (!isStaff(req.user)) {
      sql += ' AND requester_id = ?';
      params.push(req.user.id);
    }
    for (const [query, column] of [['status', 'status'], ['priority', 'priority'], ['category', 'category'],
      ['district', 'district'], ['taluka', 'taluka'], ['division', 'division']]) {
      if (req.query[query]) {
        sql += ` AND ${column} = ?`;
        params.push(String(req.query[query]));
      }
    }
    sql += ' ORDER BY created_at DESC';
    const tickets = (await all(sql, params)).map(toTicket);
    return sendSuccess(res, 'Tickets fetched', { total: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
});

// POST /api/crm/tickets  { title, description, category?, subcategory?, priority?, district?, taluka?, division?, assignedCenterId?, requesterPhone? }
router.post('/tickets', authenticateToken, async (req, res, next) => {
  try {
    const title = text(req.body?.title, 200);
    const description = text(req.body?.description, 3000);
    if (!title || !description) {
      return sendError(res, 'शीर्षक व तपशील आवश्यक आहे.', 'VALIDATION_ERROR', 400);
    }
    const priority = PRIORITIES.includes(req.body?.priority) ? req.body.priority : 'Medium';
    await ensureWebsiteTables();

    const id = `TKT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${newId('').slice(1)}`;
    const name = req.user.name || text(req.body?.requesterName, 100) || 'नागरिक';
    const now = new Date().toISOString();
    await runQuery(
      `INSERT INTO support_tickets (id, source, title, description, category, subcategory, priority,
         district, taluka, division, assigned_center_id, requester_id, requester_name, requester_phone,
         sla_hours, audit_trail, updated_at)
       VALUES (?, 'helpdesk', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, text(req.body?.category, 60) || 'General', text(req.body?.subcategory, 100), priority,
        text(req.body?.district, 60), text(req.body?.taluka, 60), text(req.body?.division, 60),
        text(req.body?.assignedCenterId, 60), req.user.id, name, cleanMobile(req.body?.requesterPhone),
        priority === 'Critical' ? 4 : priority === 'High' ? 24 : 72,
        JSON.stringify([{ action: 'CREATED', by: name, role: req.user.role || 'member', timestamp: now, note: 'नवीन तक्रार / मागणी नोंदवली गेली.' }]),
        now]
    );
    return sendSuccess(res, 'तिकीट यशस्वीरित्या नोंदवले गेले.', await loadTicket(id), 201);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/crm/tickets/:id/escalate  { reason? }  taluka -> district -> division -> state
router.patch('/tickets/:id/escalate', authenticateToken, requireStaff, async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    const ticket = await loadTicket(req.params.id);
    if (!ticket) return sendError(res, 'तिकीट सापडले नाही.', 'TICKET_NOT_FOUND', 404);
    const from = LEVELS.includes(ticket.currentOwnerLevel) ? ticket.currentOwnerLevel : 'taluka';
    const to = LEVELS[Math.min(LEVELS.indexOf(from) + 1, LEVELS.length - 1)];
    const updated = await saveTicketChange(ticket, { status: 'Escalated', currentOwnerLevel: to }, {
      action: 'ESCALATED', fromLevel: from, toLevel: to, by: req.user.name, role: req.user.role,
      reason: text(req.body?.reason, 500) || 'स्थानिक पातळीवर अनिर्णित राहिल्यामुळे वरिष्ठ स्तरावर वर्ग.',
    });
    return sendSuccess(res, `तिकीट यशस्वीरित्या ${to.toUpperCase()} स्तरावर वर्ग केले.`, updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/crm/tickets/:id/status  { status, note? }
router.patch('/tickets/:id/status', authenticateToken, requireStaff, async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!STATUSES.includes(status)) {
      return sendError(res, `स्टेटस यापैकी असावे: ${STATUSES.join(', ')}`, 'VALIDATION_ERROR', 400);
    }
    await ensureWebsiteTables();
    const ticket = await loadTicket(req.params.id);
    if (!ticket) return sendError(res, 'तिकीट सापडले नाही.', 'TICKET_NOT_FOUND', 404);
    const updated = await saveTicketChange(ticket, { status }, {
      action: `STATUS_CHANGE_TO_${status.toUpperCase()}`, by: req.user.name, role: req.user.role,
      note: text(req.body?.note, 500),
    });
    return sendSuccess(res, `स्थिती यशस्वीरित्या बदलली: ${status}`, updated);
  } catch (err) {
    next(err);
  }
});

// ---------- Community centres ----------
function toCenter(row) {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier || '',
    division: row.division || '',
    district: row.district || '',
    taluka: row.taluka || '',
    address: row.address || '',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    todayVisitors: Number(row.today_visitors) || 0,
    dailyCollection: Number(row.daily_collection) || 0,
  };
}

// Today's visitor count and collection, computed from the activity log.
const CENTER_SELECT = `
  SELECT c.*,
    (SELECT COUNT(*) FROM center_activities a WHERE a.center_id = c.id AND a.type = 'CHECK_IN'
       AND SUBSTR(a.created_at, 1, 10) = SUBSTR(CAST(CURRENT_TIMESTAMP AS TEXT), 1, 10)) AS today_visitors,
    (SELECT COALESCE(SUM(a.amount), 0) FROM center_activities a WHERE a.center_id = c.id AND a.type = 'FINANCE_RECEIPT'
       AND SUBSTR(a.created_at, 1, 10) = SUBSTR(CAST(CURRENT_TIMESTAMP AS TEXT), 1, 10)) AS daily_collection
  FROM community_centers c`;

// GET /api/crm/community-centers?tier=&district=&division=
router.get('/community-centers', async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    let sql = `${CENTER_SELECT} WHERE c.status = 'active'`;
    const params = [];
    for (const key of ['tier', 'district', 'division']) {
      if (req.query[key]) {
        sql += ` AND c.${key} = ?`;
        params.push(String(req.query[key]));
      }
    }
    const centers = (await all(`${sql} ORDER BY c.name`, params)).map(toCenter);
    return sendSuccess(res, 'Centers fetched', { total: centers.length, centers });
  } catch (err) {
    next(err);
  }
});

// POST /api/crm/community-centers  (admin) { name, tier?, division?, district?, taluka?, address?, contactPerson?, phone? }
// Centres start empty; admins add the real ones here.
router.post('/community-centers', authenticateToken, async (req, res, next) => {
  try {
    if (!isAdmin(req.user)) {
      return sendError(res, 'फक्त प्रशासकांना परवानगी आहे. (Admins only)', 'FORBIDDEN', 403);
    }
    const name = text(req.body?.name, 150);
    if (!name) return sendError(res, 'केंद्राचे नाव आवश्यक आहे.', 'VALIDATION_ERROR', 400);
    await ensureWebsiteTables();
    const id = newId('CC');
    await runQuery(
      `INSERT INTO community_centers (id, name, tier, division, district, taluka, address, contact_person, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, text(req.body?.tier, 30), text(req.body?.division, 60), text(req.body?.district, 60),
        text(req.body?.taluka, 60), text(req.body?.address, 300), text(req.body?.contactPerson, 100), text(req.body?.phone, 30)]
    );
    return sendSuccess(res, 'केंद्र जोडले!', { center: await loadCenter(id) }, 201);
  } catch (err) {
    next(err);
  }
});

async function loadCenter(id) {
  const row = await get(`${CENTER_SELECT} WHERE c.id = ?`, [id]);
  return row ? toCenter(row) : null;
}

// POST /api/crm/community-centers/:id/checkin  { visitorName?, phone?, purpose?, desk? }
router.post('/community-centers/:id/checkin', authenticateToken, requireStaff, async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    if (!(await loadCenter(req.params.id))) return sendError(res, 'केंद्र सापडले नाही.', 'CENTER_NOT_FOUND', 404);
    await runQuery(
      `INSERT INTO center_activities (id, center_id, type, person_name, phone, purpose, desk, recorded_by)
       VALUES (?, ?, 'CHECK_IN', ?, ?, ?, ?, ?)`,
      [newId('ACT'), req.params.id, text(req.body?.visitorName, 100) || 'अभ्यागत नागरिक', cleanMobile(req.body?.phone),
        text(req.body?.purpose, 200) || 'सामान्य चौकशी', text(req.body?.desk, 60) || 'फ्रंट डेस्क', req.user.id]
    );
    const center = await loadCenter(req.params.id);
    return sendSuccess(res, 'अभ्यागत नोंद यशस्वी!', { centerId: center.id, todayVisitors: center.todayVisitors });
  } catch (err) {
    next(err);
  }
});

// POST /api/crm/community-centers/:id/transaction  { amount, payerName?, category?, paymentMode? }
router.post('/community-centers/:id/transaction', authenticateToken, requireStaff, async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
      return sendError(res, 'वैध रक्कम आवश्यक आहे.', 'VALIDATION_ERROR', 400);
    }
    await ensureWebsiteTables();
    if (!(await loadCenter(req.params.id))) return sendError(res, 'केंद्र सापडले नाही.', 'CENTER_NOT_FOUND', 404);
    const receiptNumber = newId('RCPT');
    await runQuery(
      `INSERT INTO center_activities (id, center_id, type, person_name, category, amount, payment_mode, recorded_by)
       VALUES (?, ?, 'FINANCE_RECEIPT', ?, ?, ?, ?, ?)`,
      [receiptNumber, req.params.id, text(req.body?.payerName, 100) || 'देणगीदार / सभासद',
        text(req.body?.category, 100) || 'सदस्यता वर्गणी', amount, text(req.body?.paymentMode, 40) || 'UPI / रोख', req.user.id]
    );
    const center = await loadCenter(req.params.id);
    return sendSuccess(res, 'पावती नोंद यशस्वी!', { centerId: center.id, dailyCollection: center.dailyCollection, receiptNumber });
  } catch (err) {
    next(err);
  }
});

export default router;
