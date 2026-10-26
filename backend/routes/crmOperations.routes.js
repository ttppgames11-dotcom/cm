import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { all, get, runQuery } from '../../database/database.js';
import { resolveScope, geoFilterForScope } from '../utils/crmScope.js';
import { sanitize, isValidEmail, isValidPhone, cleanPhone } from '../utils/validator.js';

const router = Router();

// Helper: Filter records by geographical scope
// strict: a record that lacks the field being filtered on is excluded (used for scoped, non-platform users,
// so records with no taluka/district can never leak into someone else's view).
function filterByScope(records = [], { scope = 'pradesh', division, district, taluka, branchId, strict = false }) {
  if (!strict && (scope === 'pradesh' || (!division && !district && !taluka && !branchId))) {
    return records;
  }
  const mismatch = (recordValue, wanted) => {
    if (!wanted) return false;
    if (!recordValue) return strict;
    return String(recordValue).toLowerCase() !== String(wanted).toLowerCase();
  };
  return records.filter(r => {
    if (branchId && r.branchId && String(r.branchId) !== String(branchId)) return false;
    if (mismatch(r.taluka, taluka)) return false;
    if (mismatch(r.district, district)) return false;
    if (mismatch(r.division, division)) return false;
    return true;
  });
}

// Account scope for the signed-in user, resolved from the database (never from the request query).
function accountScope(req) {
  return resolveScope(db.findById('members', req.user?.id));
}

// Reject users with no CRM access; platform admins pass, everyone else gets a geographic filter.
function requireScope(req, res) {
  const sc = accountScope(req);
  if (sc.kind === 'none') {
    sendError(res, 'या विभागासाठी आपल्याकडे प्रवेश नाही.', 'NO_CRM_ACCESS', 403);
    return null;
  }
  const geo = geoFilterForScope(sc);
  if (!geo) {
    sendError(res, 'आपल्या खात्याला भौगोलिक कार्यक्षेत्र निश्चित नाही.', 'NO_GEO_SCOPE', 403);
    return null;
  }
  return { sc, geo };
}

function rowInGeo(row, geo) {
  if (geo.unrestricted) return true;
  return filterByScope([row], { ...geo, strict: true }).length === 1;
}

import crypto from 'crypto';

// Secure Collision-Proof ID Generator
function generateSecureId(prefix = 'ID') {
  const timeHex = Date.now().toString(36);
  const randomHex = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${timeHex}-${randomHex}`.toUpperCase();
}

// Strict Helper for mapping district to division - Reject invalid or empty districts
function getDivisionForDistrict(district) {
  if (!district) return null;
  const d = String(district).trim();
  if (['पुणे', 'सातारा', 'सांगली', 'कोल्हापूर', 'सोलापूर'].includes(d)) return 'पुणे विभाग';
  if (['मुंबई', 'मुंबई उपनगर', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग'].includes(d)) return 'कोकण विभाग';
  if (['नाशिक', 'अहमदनगर', 'धुळे', 'जळगाव', 'नंदुरबार'].includes(d)) return 'नाशिक विभाग';
  if (['छत्रपती संभाजीनगर', 'जालना', 'बीड', 'परभणी', 'नांदेड', 'उस्मानाबाद', 'धाराशिव', 'लातूर', 'हिंगोली'].includes(d)) return 'छत्रपती संभाजीनगर विभाग';
  if (['अमरावती', 'अकोला', 'बुलढाणा', 'यवतमाळ', 'वाशीम'].includes(d)) return 'अमरावती विभाग';
  if (['नागपूर', 'वर्धा', 'भंडारा', 'गोंदिया', 'चंद्रपूर', 'गडचिरोली'].includes(d)) return 'नागपूर विभाग';
  return null;
}

const CRM_ALLOWED_ROLES = [
  'superadmin', 'admin', 'ceo', 'state_admin', 'pradesh_admin', 'division_admin',
  'district_admin', 'taluka_admin', 'branch_admin', 'branch_head', 'center_manager',
  'center_admin', 'center_staff', 'seva_helpdesk', 'helpdesk_admin', 'chapter_president'
];

function requireCrmRole(req, res) {
  const role = req.user?.role?.toLowerCase();
  if (!role || !CRM_ALLOWED_ROLES.includes(role)) {
    sendError(res, 'आपल्याकडे CRM ऑपरेशन्ससाठी अधिकृत प्रशासकीय परवानगी नाही.', 'FORBIDDEN_ROLE', 403);
    return false;
  }
  return true;
}

/**
 * 🚩 1. GET /api/crm/unified-dashboard
 * One Master Aggregated View according to the 12 Golden Rules
 */
router.get('/unified-dashboard', authenticateToken, (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    let scope, division, district, taluka, branchId, strict;
    if (gate.geo.unrestricted) {
      // Platform admins may pick any scope through the query
      scope = req.query.scope || (req.user?.role?.includes('division') ? 'division' :
        req.user?.role?.includes('district') ? 'district' :
          req.user?.role?.includes('taluka') ? 'taluka' :
            req.user?.role?.includes('branch') ? 'branch' : 'pradesh');
      division = req.query.division || null;
      district = req.query.district || null;
      taluka = req.query.taluka || null;
      branchId = req.query.branchId || null;
      strict = false;
    } else {
      // Everyone else is pinned to their own area; query parameters are ignored
      ({ scope, division = null, district = null, taluka = null } = gate.geo);
      branchId = null;
      strict = true;
    }

    const queryFilter = { scope, division, district, taluka, branchId, strict };

    const allMembers = db.getCollection('members') || [];
    const allBusinesses = db.getCollection('businesses') || [];
    const allJobs = db.getCollection('jobs') || [];
    const allTickets = db.getCollection('tickets') || [];
    const allCenters = db.getCollection('communityCenters') || [];
    const allEvents = db.getCollection('events') || [];
    const allOrgUnits = db.getCollection('organizationUnits') || [];

    // Filter by geographical scope
    const scopedMembers = filterByScope(allMembers, queryFilter);
    const scopedBusinesses = filterByScope(allBusinesses, queryFilter);
    const scopedJobs = filterByScope(allJobs, queryFilter);
    const scopedTickets = filterByScope(allTickets, queryFilter);
    const scopedCenters = filterByScope(allCenters, queryFilter);
    const scopedEvents = filterByScope(allEvents, queryFilter);

    // Calculate aggregated KPIs
    const totalMembers = scopedMembers.length;
    const activeMembers = scopedMembers.filter(m => m.status !== 'inactive' && m.verified !== false).length;
    const pendingKyc = scopedMembers.filter(m => !m.verified || m.verificationStatus?.includes('प्रलंबित')).length;
    const totalBusinesses = scopedBusinesses.length;
    const verifiedPartners = scopedBusinesses.filter(b => b.verifiedPartner || b.verified).length;
    const activeJobs = scopedJobs.filter(j => j.status !== 'closed').length;

    // Tickets breakdown
    const openTickets = scopedTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
    const escalatedTickets = scopedTickets.filter(t => t.status === 'Escalated' || t.currentOwnerLevel === scope).length;
    const criticalTickets = scopedTickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;

    // Centers operational summary
    const todayVisitors = scopedCenters.reduce((sum, c) => sum + (Number(c.todayVisitors) || 0), 0);
    const dailyCollection = scopedCenters.reduce((sum, c) => sum + (Number(c.dailyCollection) || 0), 0);

    // B. Actionable Work Queue (Today's Priorities for current level)
    const workQueue = {
      pendingKycList: scopedMembers.filter(m => !m.verified).slice(0, 8).map(m => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        district: m.district,
        taluka: m.taluka,
        date: m.created_at || m.joined
      })),
      urgentTicketsList: scopedTickets
        .filter(t => t.status !== 'Closed')
        .sort((a, b) => (b.priority === 'Critical' ? 1 : 0) - (a.priority === 'Critical' ? 1 : 0))
        .slice(0, 8),
      recentB2BLeads: scopedBusinesses
        .filter(b => b.b2bEnabled || b.verifiedPartner)
        .slice(0, 6)
        .map(b => ({
          id: b.id,
          name: b.name,
          category: b.category,
          district: b.district,
          contact: b.phone
        }))
    };

    // C. Exceptions & SLA Alerts
    const exceptions = [];
    if (criticalTickets > 0) {
      exceptions.push({
        id: 'EXC-CRIT-01',
        title: 'तातडीच्या आपत्कालीन तक्रारी (Critical Tickets)',
        count: criticalTickets,
        severity: 'high',
        message: `${criticalTickets} तक्रारींना त्वरित हस्तक्षेपाची गरज आहे.`
      });
    }
    if (pendingKyc > 15) {
      exceptions.push({
        id: 'EXC-KYC-02',
        title: 'KYC पडताळणी अनुशेष (KYC Backlog)',
        count: pendingKyc,
        severity: 'medium',
        message: 'स्थानिक केंद्रात १५ पेक्षा अधिक ओळखपत्रे पडताळणी प्रलंबित आहेत.'
      });
    }

    // D. Subordinate Units Performance
    let subordinateUnits = [];
    if (scope === 'pradesh') {
      const divisionNames = ['पुणे विभाग', 'कोकण विभाग', 'नाशिक विभाग', 'छत्रपती संभाजीनगर विभाग', 'अमरावती विभाग', 'नागपूर विभाग'];
      subordinateUnits = divisionNames.map(divName => {
        const divMembers = allMembers.filter(m => m.division === divName || (m.district && getDivisionForDistrict(m.district) === divName));
        const divCenters = allCenters.filter(c => c.division === divName);
        return {
          id: divName,
          name: divName,
          type: 'division',
          membersCount: divMembers.length,
          centersCount: divCenters.length,
          dailyCollection: divCenters.reduce((s, c) => s + (Number(c.dailyCollection) || 0), 0),
          status: 'सक्रिय'
        };
      });
    } else if (scope === 'division') {
      const divisionDistricts = allMembers
        .filter(m => !division || m.division === division || getDivisionForDistrict(m.district) === division)
        .map(m => m.district)
        .filter(Boolean);
      const uniqueDistricts = [...new Set(divisionDistricts)];
      subordinateUnits = uniqueDistricts.map(dist => {
        const distMembers = allMembers.filter(m => m.district === dist);
        const distCenters = allCenters.filter(c => c.district === dist);
        return {
          id: dist,
          name: dist,
          type: 'district',
          membersCount: distMembers.length,
          centersCount: distCenters.length,
          status: 'सक्रिय'
        };
      });
    } else if (scope === 'district') {
      const distTalukas = allMembers
        .filter(m => !district || m.district === district)
        .map(m => m.taluka)
        .filter(Boolean);
      const uniqueTalukas = [...new Set(distTalukas)];
      subordinateUnits = uniqueTalukas.map(tal => {
        const talMembers = allMembers.filter(m => m.taluka === tal);
        const talCenters = allCenters.filter(c => c.taluka === tal);
        return {
          id: tal,
          name: tal,
          type: 'taluka',
          membersCount: talMembers.length,
          centersCount: talCenters.length,
          status: 'सक्रिय'
        };
      });
    } else if (scope === 'taluka') {
      subordinateUnits = allOrgUnits
        .filter(u => u.type === 'branch' && (!taluka || u.taluka === taluka))
        .map(b => ({
          id: b.id,
          name: b.name,
          type: 'branch',
          membersCount: b.activeMembersCount || 150,
          status: 'सक्रिय'
        }));
    }

    return sendSuccess(res, 'Unified CRM Dashboard Data Fetched Successfully', {
      scope,
      queryFilter,
      kpis: {
        totalMembers,
        activeMembers,
        pendingKyc,
        totalBusinesses,
        verifiedPartners,
        activeJobs,
        openTickets,
        escalatedTickets,
        criticalTickets,
        todayVisitors,
        dailyCollection,
        centersCount: scopedCenters.length,
        eventsCount: scopedEvents.length
      },
      workQueue,
      exceptions,
      subordinateUnits,
      recentTickets: scopedTickets.slice(0, 10),
      recentEvents: scopedEvents.slice(0, 5),
      communityCenters: scopedCenters
    });
  } catch (err) {
    console.error('[CRM Dashboard Error]:', err);
    return sendError(res, 'डॅशबोर्ड डेटा लोड करताना तांत्रिक अडचण आली.', 'DASHBOARD_ERROR', 500);
  }
});

/**
 * 🎫 2. Unified Ticket Operations (Persisted in SQL Database)
 */
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    let { scope, division, district, taluka } = req.query;
    const { status, priority, category } = req.query;
    // Scoped users are pinned to their own area, whatever the query says
    if (!gate.geo.unrestricted) ({ scope, division = undefined, district = undefined, taluka = undefined } = gate.geo);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        ticket_number TEXT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'General',
        subcategory TEXT,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'New',
        district TEXT,
        taluka TEXT,
        division TEXT,
        assigned_center_id TEXT,
        assigned_staff_id TEXT,
        current_owner_level TEXT DEFAULT 'taluka',
        requester_id TEXT,
        requester_name TEXT,
        requester_phone TEXT,
        sla_hours INTEGER DEFAULT 72,
        resolution_notes TEXT,
        audit_trail TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT
      )
    `);

    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (priority) { sql += ' AND priority = ?'; params.push(priority); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (district) { sql += ' AND district = ?'; params.push(district); }
    sql += ' ORDER BY created_at DESC';

    let tickets = await all(sql, params);
    if (!tickets || tickets.length === 0) {
      tickets = db.getCollection('tickets') || [];
      tickets = filterByScope(tickets, { scope, division, district, taluka });
      if (status) tickets = tickets.filter(t => t.status === status);
      if (priority) tickets = tickets.filter(t => t.priority === priority);
      if (category) tickets = tickets.filter(t => t.category === category);
    }

    tickets = tickets.filter(t => rowInGeo(t, gate.geo));
    return sendSuccess(res, 'Tickets fetched', {
      total: tickets.length,
      tickets
    });
  } catch (err) {
    return sendError(res, 'Error fetching tickets', 'TICKETS_FETCH_ERROR', 500);
  }
});

router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'General',
      subcategory = '',
      priority = 'Medium',
      district = 'पुणे',
      taluka = 'हवेली',
      division = 'पुणे विभाग',
      assignedCenterId = 'CC-HAV-001',
      requesterName = req.user?.name || 'नागरिक',
      requesterPhone = req.user?.phone || '9822000000'
    } = req.body;

    if (!title || !description) {
      return sendError(res, 'शीर्षक व तपशील आवश्यक आहे.', 'VALIDATION_ERROR', 400);
    }

    const newId = generateSecureId('TKT');

    await runQuery(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        ticket_number TEXT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'General',
        subcategory TEXT,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'New',
        district TEXT,
        taluka TEXT,
        division TEXT,
        assigned_center_id TEXT,
        assigned_staff_id TEXT,
        current_owner_level TEXT DEFAULT 'taluka',
        requester_id TEXT,
        requester_name TEXT,
        requester_phone TEXT,
        sla_hours INTEGER DEFAULT 72,
        resolution_notes TEXT,
        audit_trail TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT
      )
    `);

    const slaHours = priority === 'Critical' ? 4 : priority === 'High' ? 24 : 72;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO tickets (id, ticket_number, title, description, category, subcategory, priority, status, district, taluka, division, assigned_center_id, assigned_staff_id, current_owner_level, requester_id, requester_name, requester_phone, sla_hours, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, ?, ?, 'STF-001', 'taluka', ?, ?, ?, ?, ?, ?)
    `, [newId, newId, title, description, category, subcategory, priority, district, taluka, division, assignedCenterId, req.user?.id || 'GUEST', requesterName, requesterPhone, slaHours, now, now]);

    const created = await get('SELECT * FROM tickets WHERE id = ?', [newId]);

    // Mirror to realtimeDb
    db.insert('tickets', { ...created, id: newId });

    return sendSuccess(res, 'Ticket created successfully and stored in database', { ticket: created });
  } catch (err) {
    return sendError(res, 'Error creating ticket: ' + err.message, 'TICKET_CREATE_ERROR', 500);
  }
});

// Escalate Ticket (Taluka -> District -> Division -> State)
router.patch('/tickets/:id/escalate', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const gate = requireScope(req, res);
    if (!gate) return;

    const { id } = req.params;
    const { reason = 'स्थानिक पातळीवर अनिर्णित राहिल्यामुळे वरिष्ठ स्तरावर वर्ग.' } = req.body;

    let ticket = await get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      const tickets = db.getCollection('tickets') || [];
      ticket = tickets.find(t => t.id === id);
    }

    if (!ticket) {
      return sendError(res, 'तिकीट सापडले नाही.', 'TICKET_NOT_FOUND', 404);
    }

    // Verify geographic scope
    if (!rowInGeo(ticket, gate.geo)) {
      return sendError(res, 'हे तिकीट आपल्या कार्यक्षेत्राबाहेर असल्याने एस्केलेट करता येत नाही.', 'OUT_OF_SCOPE', 403);
    }

    const currentLevel = ticket.current_owner_level || ticket.currentOwnerLevel || 'taluka';
    const nextLevel = currentLevel === 'taluka' ? 'district' :
      currentLevel === 'district' ? 'division' : 'state';

    const now = new Date().toISOString();
    let auditTrail = [];
    try {
      auditTrail = typeof ticket.audit_trail === 'string' ? JSON.parse(ticket.audit_trail) : (ticket.auditTrail || []);
    } catch (e) {
      auditTrail = [];
    }

    auditTrail.push({
      action: 'ESCALATED',
      fromLevel: currentLevel,
      toLevel: nextLevel,
      by: req.user?.name || 'अधिकृत अधिकारी',
      role: req.user?.role || 'center_manager',
      timestamp: now,
      reason
    });

    await runQuery(`
      UPDATE tickets
      SET current_owner_level = ?, status = 'Escalated', audit_trail = ?, updated_at = ?
      WHERE id = ?
    `, [nextLevel, JSON.stringify(auditTrail), now, id]);

    // Mirror to realtimeDb
    const ramTicket = (db.getCollection('tickets') || []).find(t => t.id === id);
    if (ramTicket) {
      ramTicket.currentOwnerLevel = nextLevel;
      ramTicket.status = 'Escalated';
      ramTicket.updated_at = now;
      ramTicket.auditTrail = auditTrail;
      db.save();
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [id]);
    return sendSuccess(res, `तिकीट यशस्वीरित्या ${nextLevel.toUpperCase()} स्तरावर वर्ग केले.`, updated || { ...ticket, currentOwnerLevel: nextLevel, status: 'Escalated' });
  } catch (err) {
    console.error('Escalation error:', err);
    return sendError(res, 'एस्केलेशन करताना त्रुटी आली: ' + err.message, 'ESCALATE_ERROR', 500);
  }
});

// Update Ticket Status (In_Progress / Resolved / Closed)
router.patch('/tickets/:id/status', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const gate = requireScope(req, res);
    if (!gate) return;

    const { id } = req.params;
    const { status, note = '' } = req.body;

    const allowedStatuses = ['New', 'In_Progress', 'Resolved', 'Closed', 'Escalated'];
    if (!status || !allowedStatuses.includes(status)) {
      return sendError(res, 'अवैध किंवा रिक्त स्टेटस. योग्य स्टेटस निवडा.', 'VALIDATION_ERROR', 400);
    }

    let ticket = await get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      const tickets = db.getCollection('tickets') || [];
      ticket = tickets.find(t => t.id === id);
    }

    if (!ticket) return sendError(res, 'तिकीट सापडले नाही.', 'TICKET_NOT_FOUND', 404);

    // Verify geographic scope
    if (!rowInGeo(ticket, gate.geo)) {
      return sendError(res, 'हे तिकीट आपल्या कार्यक्षेत्राबाहेर असल्याने बदल करता येत नाही.', 'OUT_OF_SCOPE', 403);
    }

    const now = new Date().toISOString();
    let auditTrail = [];
    try {
      auditTrail = typeof ticket.audit_trail === 'string' ? JSON.parse(ticket.audit_trail) : (ticket.auditTrail || []);
    } catch (e) {
      auditTrail = [];
    }

    auditTrail.push({
      action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
      by: req.user?.name || 'अधिकारी',
      role: req.user?.role || 'staff',
      timestamp: now,
      note
    });

    await runQuery(`
      UPDATE tickets
      SET status = ?, audit_trail = ?, updated_at = ?
      WHERE id = ?
    `, [status, JSON.stringify(auditTrail), now, id]);

    // Mirror to realtimeDb
    const ramTicket = (db.getCollection('tickets') || []).find(t => t.id === id);
    if (ramTicket) {
      ramTicket.status = status;
      ramTicket.updated_at = now;
      ramTicket.auditTrail = auditTrail;
      db.save();
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [id]);
    return sendSuccess(res, `स्थिती यशस्वीरित्या बदलली: ${status}`, updated || { ...ticket, status });
  } catch (err) {
    return sendError(res, 'स्थिती बदलताना त्रुटी आली: ' + err.message, 'STATUS_ERROR', 500);
  }
});

/**
 * 🏢 3. Community Center Operations
 */
router.get('/community-centers', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    const { tier, district, division } = req.query;

    await runQuery(`
      CREATE TABLE IF NOT EXISTS community_centers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        district TEXT,
        taluka TEXT,
        division TEXT,
        address TEXT,
        manager_name TEXT,
        manager_phone TEXT,
        today_visitors INTEGER DEFAULT 0,
        daily_collection REAL DEFAULT 0,
        status TEXT DEFAULT 'सक्रिय',
        created_at TEXT
      )
    `);

    let sql = 'SELECT * FROM community_centers WHERE 1=1';
    const params = [];
    if (district) { sql += ' AND district = ?'; params.push(district); }
    if (division) { sql += ' AND division = ?'; params.push(division); }

    let centers = await all(sql, params);

    // Auto seed default centers if table is empty
    if (!centers || centers.length === 0) {
      const defaultCenters = [
        { id: 'CC-HAV-001', name: 'हवेली तालुका मराठा संपर्क केंद्र', code: 'HAV-01', district: 'पुणे', taluka: 'हवेली', division: 'पुणे विभाग', address: 'शिवाजीनगर, पुणे', managerName: 'राजेश कदम', managerPhone: '9822123456' },
        { id: 'CC-KOT-002', name: 'कोथरूड संपर्क व सहाय्यता केंद्र', code: 'KOT-02', district: 'पुणे', taluka: 'पुणे शहर', division: 'पुणे विभाग', address: 'कोथरूड स्टँड जवळ, पुणे', managerName: 'प्रवीण मोरे', managerPhone: '9822654321' },
        { id: 'CC-SAT-003', name: 'सातारा जिल्हा मध्यवर्ती केंद्र', code: 'SAT-01', district: 'सातारा', taluka: 'सातारा', division: 'पुणे विभाग', address: 'राजवाडा चौक, सातारा', managerName: 'तानाजी सावंत', managerPhone: '9822789012' },
        { id: 'CC-KOL-004', name: 'कोल्हापूर शाहू मध्यवर्ती केंद्र', code: 'KOL-01', district: 'कोल्हापूर', taluka: 'करवीर', division: 'पुणे विभाग', address: 'दसरा चौक, कोल्हापूर', managerName: 'विक्रमसिंह घोरपडे', managerPhone: '9822345678' }
      ];

      for (const dc of defaultCenters) {
        await runQuery(`
          INSERT INTO community_centers (id, name, code, district, taluka, division, address, manager_name, manager_phone, today_visitors, daily_collection, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'सक्रिय', ?)
        `, [dc.id, dc.name, dc.code, dc.district, dc.taluka, dc.division, dc.address, dc.managerName, dc.managerPhone, new Date().toISOString()]);
      }

      centers = await all(sql, params);
    }

    centers = centers.filter(c => rowInGeo(c, gate.geo));
    return sendSuccess(res, 'Centers fetched from database', { total: centers.length, centers });
  } catch (err) {
    return sendError(res, 'Error fetching centers: ' + err.message, 'CENTERS_FETCH_ERROR', 500);
  }
});

// Front Desk Visitor Check-In
router.post('/community-centers/:id/checkin', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const { id } = req.params;
    const { visitorName, phone, purpose = 'सामान्य चौकशी', desk = 'फ्रंट डेस्क' } = req.body;
    const gate = requireScope(req, res);
    if (!gate) return;
    const centerRow = await get('SELECT * FROM community_centers WHERE id = ?', [id]);
    if (!centerRow || !rowInGeo(centerRow, gate.geo)) {
      return sendError(res, 'कम्युनिटी सेंटर सापडले नाही किंवा आपल्या कार्यक्षेत्रात नाही.', 'CENTER_NOT_FOUND', 404);
    }

    const cleanVisitor = sanitize(visitorName || 'अभ्यागत नागरिक');
    const cleanPhoneVal = phone ? cleanPhone(phone) : '';
    const cleanPurpose = sanitize(purpose);
    const cleanDesk = sanitize(desk);

    const actId = generateSecureId('ACT');
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO center_activities (id, center_id, type, visitor_name, phone, purpose, desk, created_at)
      VALUES (?, ?, 'CHECK_IN', ?, ?, ?, ?, ?)
    `, [actId, id, cleanVisitor, cleanPhoneVal, cleanPurpose, cleanDesk, now]);

    await runQuery(`
      UPDATE community_centers
      SET today_visitors = coalesce(today_visitors, 0) + 1
      WHERE id = ?
    `, [id]);

    const center = await get('SELECT * FROM community_centers WHERE id = ?', [id]);

    // Mirror to realtimeDb
    const ramCenter = (db.getCollection('communityCenters') || []).find(c => c.id === id);
    if (ramCenter) {
      ramCenter.todayVisitors = (Number(ramCenter.todayVisitors) || 0) + 1;
      db.save();
    }

    return sendSuccess(res, 'अभ्यागत नोंद डेटाबेसमध्ये यशस्वीरित्या साठवली!', {
      centerId: id,
      todayVisitors: center?.today_visitors || (Number(ramCenter?.todayVisitors) || 1),
      activityId: actId
    });
  } catch (err) {
    return sendError(res, 'अभ्यागत नोंद करताना अडचण आली: ' + err.message, 'CHECKIN_ERROR', 500);
  }
});

// Daily Ledger Transaction (Revenue/Collection)
// Strictly requires finance_officer, center_manager, superadmin, or admin role
const FINANCE_ALLOWED_ROLES = ['superadmin', 'admin', 'finance_officer', 'finance', 'center_manager', 'center_admin', 'state_admin'];

router.post('/community-centers/:id/transaction', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || !FINANCE_ALLOWED_ROLES.includes(userRole)) {
      return sendError(res, 'आर्थिक पावती नोंदवण्यासाठी केवळ वित्त अधिकारी किंवा केंद्र व्यवस्थापकांना परवानगी आहे.', 'FORBIDDEN_FINANCE_ROLE', 403);
    }

    const { id } = req.params;
    const { amount, payerName, category = 'सदस्यता वर्गणी', paymentMode = 'UPI / रोख', idempotencyKey } = req.body;
    const gate = requireScope(req, res);
    if (!gate) return;
    const centerRow = await get('SELECT * FROM community_centers WHERE id = ?', [id]);
    if (!centerRow || !rowInGeo(centerRow, gate.geo)) {
      return sendError(res, 'कम्युनिटी सेंटर सापडले नाही किंवा आपल्या कार्यक्षेत्रात नाही.', 'CENTER_NOT_FOUND', 404);
    }

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return sendError(res, 'कृपया वैध रक्कम प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }
    // Strict upper limit per transaction: ₹ 5,00,000 to prevent fraud/typos
    if (numAmount > 500000) {
      return sendError(res, 'एका पावतीवर कमाल मर्यादा ₹ ५,००,००० आहे. उच्च रक्कमेसाठी केंद्रीय वित्त विभागाशी संपर्क साधा.', 'AMOUNT_LIMIT_EXCEEDED', 400);
    }

    // Idempotency check if key provided
    if (idempotencyKey) {
      const existingTxn = await get('SELECT * FROM center_activities WHERE id = ?', [idempotencyKey]);
      if (existingTxn) {
        return sendSuccess(res, 'पावती आधीच नोंदवलेली आहे.', {
          centerId: id,
          receiptNumber: existingTxn.receipt_number,
          transactionId: existingTxn.id
        });
      }
    }

    const actId = idempotencyKey || generateSecureId('TXN');
    const receiptNum = `RCPT-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const now = new Date().toISOString();
    const cleanPayer = sanitize(payerName || 'देणगीदार / सभासद');
    const cleanCat = sanitize(category);
    const cleanMode = sanitize(paymentMode);
    const collector = req.user?.name || 'वित्त रोखपाल';

    await runQuery(`
      INSERT INTO center_activities (id, center_id, type, payer_name, category, amount, payment_mode, receipt_number, collected_by, created_at)
      VALUES (?, ?, 'FINANCE_RECEIPT', ?, ?, ?, ?, ?, ?, ?)
    `, [actId, id, cleanPayer, cleanCat, numAmount, cleanMode, receiptNum, collector, now]);

    await runQuery(`
      UPDATE community_centers
      SET daily_collection = coalesce(daily_collection, 0) + ?
      WHERE id = ?
    `, [numAmount, id]);

    const center = await get('SELECT * FROM community_centers WHERE id = ?', [id]);

    // Mirror to realtimeDb
    const ramCenter = (db.getCollection('communityCenters') || []).find(c => c.id === id);
    if (ramCenter) {
      ramCenter.dailyCollection = (Number(ramCenter.dailyCollection) || 0) + numAmount;
      db.save();
    }

    return sendSuccess(res, 'पावती नोंद डेटाबेसमध्ये यशस्वीरित्या साठवली!', {
      centerId: id,
      dailyCollection: center?.daily_collection || (Number(ramCenter?.dailyCollection) || numAmount),
      receiptNumber: receiptNum,
      transactionId: actId
    });
  } catch (err) {
    return sendError(res, 'पावती नोंद करताना अडचण आली: ' + err.message, 'TXN_ERROR', 500);
  }
});



/**
 * 👥 4. Staff Master Operations (Connected to SQLite + Realtime Cache)
 */
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    const { centerId, department, role, district } = req.query;
    let sql = 'SELECT * FROM staff WHERE 1=1';
    const params = [];

    if (district) {
      sql += ' AND lower(district) = ?';
      params.push(String(district).toLowerCase());
    }
    if (role) {
      sql += ' AND lower(role) = ?';
      params.push(String(role).toLowerCase());
    }

    const rows = (await all(sql, params)).filter(r => rowInGeo(r, gate.geo));
    if (rows && rows.length > 0) {
      return sendSuccess(res, 'प्रशासकीय कर्मचारी यादी', { total: rows.length, staff: rows });
    }

    // Fallback to in-memory collection
    let staff = db.getCollection('staff') || [];
    if (centerId) staff = staff.filter(s => s.centerId === centerId);
    if (department) staff = staff.filter(s => s.department === department);
    staff = staff.filter(s => rowInGeo(s, gate.geo));

    return sendSuccess(res, 'Staff roster fetched', { total: staff.length, staff });
  } catch (err) {
    return sendError(res, 'Error fetching staff roster: ' + err.message, 'STAFF_FETCH_ERROR', 500);
  }
});

router.post('/staff', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const { name, email, phone, role = 'staff', branchId, district, division, taluka } = req.body;
    if (!name || !phone) return sendError(res, 'नाव आणि फोन नंबर आवश्यक आहे.', 'FIELDS_REQUIRED', 400);

    const cleanPhoneNum = cleanPhone(phone);
    if (!cleanPhoneNum || !isValidPhone(cleanPhoneNum)) {
      return sendError(res, 'वैध १० अंकी मोबाईल नंबर आवश्यक आहे.', 'INVALID_PHONE', 400);
    }
    if (email && !isValidEmail(email)) {
      return sendError(res, 'वैध ईमेल पत्ता आवश्यक आहे.', 'INVALID_EMAIL', 400);
    }

    const ALLOWED_STAFF_ROLES = ['manager', 'cashier', 'operator', 'clerk', 'coordinator', 'staff', 'officer', 'counselor'];
    const staffRole = ALLOWED_STAFF_ROLES.includes(String(role).toLowerCase()) ? String(role).toLowerCase() : 'staff';

    const gate = requireScope(req, res);
    if (!gate) return;
    if (gate.sc.kind === 'global_read') return sendError(res, 'केवळ वाचन अधिकार.', 'READ_ONLY', 403);

    // Enforce valid district and geography
    const assignedDistrict = district ? String(district).trim() : null;
    if (!assignedDistrict) {
      return sendError(res, 'कर्मचाऱ्याचा जिल्हा निवडणे अनिवार्य आहे.', 'DISTRICT_REQUIRED', 400);
    }
    const resolvedDivision = division || getDivisionForDistrict(assignedDistrict);
    if (!resolvedDivision) {
      return sendError(res, 'अवैध किंवा अपूर्ण जिल्हा निवडला आहे.', 'INVALID_DISTRICT', 400);
    }

    if (!rowInGeo({ district: assignedDistrict, division: resolvedDivision, taluka }, gate.geo)) {
      return sendError(res, 'आपल्या कार्यक्षेत्राबाहेर नोंद करता येत नाही.', 'OUT_OF_SCOPE', 403);
    }

    const staffId = generateSecureId('STF');
    const now = new Date().toISOString();
    const cleanName = sanitize(name);

    await runQuery(`
      INSERT INTO staff (id, name, email, phone, role, branch_id, district, division, taluka, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [staffId, cleanName, email ? String(email).trim() : '', cleanPhoneNum, staffRole, branchId || '', assignedDistrict, resolvedDivision, taluka || '', now]);

    const created = { id: staffId, name: cleanName, email: email || '', phone: cleanPhoneNum, role: staffRole, branchId, district: assignedDistrict, division: resolvedDivision, taluka, status: 'active', createdAt: now };
    db.insert('staff', created);

    return sendSuccess(res, 'कर्मचारी यशस्वीरीत्या नोंदवला गेला!', { staff: created }, 201);
  } catch (err) {
    return sendError(res, 'कर्मचारी नोंदवताना त्रुटी: ' + err.message, 'STAFF_CREATE_ERROR', 500);
  }
});

/**
 * 🏢 5. Branch Operations
 */
router.get('/branches', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    const { district, division } = req.query;
    let sql = 'SELECT * FROM branches WHERE 1=1';
    const params = [];
    if (district) { sql += ' AND lower(district) = ?'; params.push(String(district).toLowerCase()); }
    if (division) { sql += ' AND lower(division) = ?'; params.push(String(division).toLowerCase()); }
    sql += ' ORDER BY name ASC';

    let rows = await all(sql, params);
    if (!rows || rows.length === 0) {
      const defaultBranches = [
        { id: 'BR-PUN-01', name: 'मध्यवर्ती पुणे शाखा', code: 'PUN-HQ', division: 'पुणे विभाग', district: 'पुणे', taluka: 'हवेली', address: 'शिवाजीनगर, पुणे', phone: '+91 20 2553 1122', manager_name: 'संदीप जगदाळे' },
        { id: 'BR-MUM-02', name: 'मुंबई उपनगर सेवा केंद्र', code: 'MUM-SUB', division: 'कोकण विभाग', district: 'मुंबई उपनगर', taluka: 'अंधेरी', address: 'दादर पूर्व, मुंबई', phone: '+91 22 2410 4455', manager_name: 'प्रिया शिर्के' },
        { id: 'BR-SAT-03', name: 'सातारा जिल्हा समन्वय केंद्र', code: 'SAT-01', division: 'पुणे विभाग', district: 'सातारा', taluka: 'सातारा', address: 'राजवाडा, सातारा', phone: '+91 2162 233445', manager_name: 'विजय मोरे' },
        { id: 'BR-CSN-04', name: 'संभाजीनगर विभागीय कार्यालय', code: 'CSN-01', division: 'छत्रपती संभाजीनगर विभाग', district: 'छत्रपती संभाजीनगर', taluka: 'संभाजीनगर', address: 'क्रांती चौक, छ. संभाजीनगर', phone: '+91 240 234 5678', manager_name: 'नितीन देशमुख' }
      ];
      for (const b of defaultBranches) {
        await runQuery(
          'INSERT OR IGNORE INTO branches (id, name, code, division, district, taluka, address, phone, manager_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "active", ?)',
          [b.id, b.name, b.code, b.division, b.district, b.taluka, b.address, b.phone, b.manager_name, new Date().toISOString()]
        );
      }
      rows = await all(sql, params);
    }

    const filtered = (rows || []).filter(r => rowInGeo(r, gate.geo));
    return sendSuccess(res, 'शाखा यादी', { branches: filtered, count: filtered.length });
  } catch (err) {
    return sendError(res, 'शाखा यादी मिळवताना त्रुटी: ' + err.message, 'BRANCHES_ERROR', 500);
  }
});

router.post('/branches', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const { name, code, division, district, taluka, address, managerName, phone } = req.body;
    if (!name || !district) return sendError(res, 'शाखेचे नाव आणि जिल्हा आवश्यक आहेत.', 'FIELDS_REQUIRED', 400);
    const gate = requireScope(req, res);
    if (!gate) return;
    if (gate.sc.kind === 'global_read') return sendError(res, 'केवळ वाचन अधिकार.', 'READ_ONLY', 403);

    const resolvedDiv = division || getDivisionForDistrict(district);
    if (!resolvedDiv) return sendError(res, 'अवैध जिल्हा किंवा विभाग निवडला आहे.', 'INVALID_DISTRICT', 400);

    if (!rowInGeo({ district, division: resolvedDiv, taluka }, gate.geo)) {
      return sendError(res, 'आपल्या कार्यक्षेत्राबाहेर नोंद करता येत नाही.', 'OUT_OF_SCOPE', 403);
    }

    const branchId = generateSecureId('BR');
    const branchCode = code ? sanitize(code) : `BRC-${branchId.split('-').slice(1).join('-')}`;
    const now = new Date().toISOString();
    const cleanBranchName = sanitize(name);

    await runQuery(`
      INSERT INTO branches (id, name, code, division, district, taluka, address, manager_name, phone, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [branchId, cleanBranchName, branchCode, resolvedDiv, district, taluka || '', address || '', managerName || '', phone || '', now]);

    const created = { id: branchId, name: cleanBranchName, code: branchCode, division: resolvedDiv, district, taluka, address, managerName, phone, status: 'active', createdAt: now };
    db.insert('branches', created);

    return sendSuccess(res, 'शाखा यशस्वीरीत्या स्थापन करण्यात आली!', { branch: created }, 201);
  } catch (err) {
    return sendError(res, 'शाखा जोडताना त्रुटी: ' + err.message, 'BRANCH_CREATE_ERROR', 500);
  }
});

/**
 * ⚡ 6. Branch Activities
 */
router.get('/branch-activities', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    const { branchId } = req.query;
    let sql = 'SELECT * FROM branch_activities WHERE 1=1';
    const params = [];
    if (branchId) { sql += ' AND branch_id = ?'; params.push(branchId); }
    sql += ' ORDER BY created_at DESC LIMIT 50';

    const rows = await all(sql, params);
    return sendSuccess(res, 'शाखा उपक्रम यादी', { activities: rows || [], count: (rows || []).length });
  } catch (err) {
    return sendError(res, 'उपक्रम यादी मिळवताना त्रुटी: ' + err.message, 'ACTIVITIES_ERROR', 500);
  }
});

router.post('/branch-activities', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const { branchId, type, description, amount } = req.body;
    if (!branchId || !type) return sendError(res, 'शाखा आणि उपक्रमाचा प्रकार आवश्यक आहे.', 'FIELDS_REQUIRED', 400);
    const gate = requireScope(req, res);
    if (!gate) return;
    const branchRow = await get('SELECT * FROM branches WHERE id = ?', [branchId]);
    if (!branchRow || gate.sc.kind === 'global_read' || !rowInGeo(branchRow, gate.geo)) {
      return sendError(res, 'शाखा सापडली नाही किंवा आपल्या कार्यक्षेत्रात नाही.', 'BRANCH_NOT_FOUND', 404);
    }

    const actId = generateSecureId('ACT');
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO branch_activities (id, branch_id, type, description, amount, logged_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [actId, branchId, sanitize(type), sanitize(description || ''), Math.min(Math.max(0, Number(amount) || 0), 500000), req.user?.name || 'CRM Staff', now]);

    return sendSuccess(res, 'शाखा उपक्रम यशस्वीरीत्या नोंदवला गेला!', { activityId: actId }, 201);
  } catch (err) {
    return sendError(res, 'उपक्रम नोंदवताना त्रुटी: ' + err.message, 'ACTIVITY_LOG_ERROR', 500);
  }
});

/**
 * 🛡️ 7. Territory Officers
 */
router.get('/territory-officers', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    const { district, level } = req.query;
    let sql = 'SELECT * FROM territory_officers WHERE status = "active"';
    const params = [];
    if (district) { sql += ' AND lower(district) = ?'; params.push(String(district).toLowerCase()); }
    if (level) { sql += ' AND lower(territory_level) = ?'; params.push(String(level).toLowerCase()); }
    sql += ' ORDER BY officer_name ASC';

    let rows = await all(sql, params);
    if (!rows || rows.length === 0) {
      const defaults = [
        { id: 'TO-PUN-01', officer_name: 'अमोल तुकाराम जाधव', phone: '+91 98220 11924', territory_level: 'district', district: 'पुणे', division: 'पुणे विभाग', jurisdiction: 'संपूर्ण पुणे जिल्हा' },
        { id: 'TO-SAT-02', officer_name: 'प्रियंका सुरेश शिर्के', phone: '+91 94212 33009', territory_level: 'district', district: 'सातारा', division: 'पुणे विभाग', jurisdiction: 'सातारा व पाटण' },
        { id: 'TO-NSK-03', officer_name: 'निलेश भगवान देशमुख', phone: '+91 98900 77361', territory_level: 'district', district: 'नाशिक', division: 'नाशिक विभाग', jurisdiction: 'नाशिक शहर व ग्रामीण' }
      ];
      for (const d of defaults) {
        await runQuery(
          'INSERT OR IGNORE INTO territory_officers (id, officer_name, phone, territory_level, district, division, jurisdiction, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, "active", ?)',
          [d.id, d.officer_name, d.phone, d.territory_level, d.district, d.division, d.jurisdiction, new Date().toISOString()]
        );
      }
      rows = await all(sql, params);
    }

    const filtered = (rows || []).filter(r => rowInGeo(r, gate.geo));
    return sendSuccess(res, 'क्षेत्रीय अधिकारी यादी', { officers: filtered, count: filtered.length });
  } catch (err) {
    return sendError(res, 'क्षेत्रीय अधिकारी यादी मिळवताना त्रुटी: ' + err.message, 'OFFICERS_ERROR', 500);
  }
});

router.post('/territory-officers', authenticateToken, async (req, res) => {
  try {
    if (!requireCrmRole(req, res)) return;
    const { officerName, phone, email, territoryLevel = 'taluka', district, division, taluka, jurisdiction } = req.body;
    if (!officerName || !phone || !district) return sendError(res, 'अधिकाऱ्याचे नाव, फोन आणि जिल्हा आवश्यक आहे.', 'FIELDS_REQUIRED', 400);

    const cleanPhoneNum = cleanPhone(phone);
    if (!cleanPhoneNum || !isValidPhone(cleanPhoneNum)) {
      return sendError(res, 'वैध १० अंकी मोबाईल नंबर आवश्यक आहे.', 'INVALID_PHONE', 400);
    }
    if (email && !isValidEmail(email)) {
      return sendError(res, 'वैध ईमेल पत्ता आवश्यक आहे.', 'INVALID_EMAIL', 400);
    }

    const resolvedDiv = division || getDivisionForDistrict(district);
    if (!resolvedDiv) return sendError(res, 'अवैध जिल्हा निवडला आहे.', 'INVALID_DISTRICT', 400);

    const gate = requireScope(req, res);
    if (!gate) return;
    if (gate.sc.kind === 'global_read') return sendError(res, 'केवळ वाचन अधिकार.', 'READ_ONLY', 403);

    if (!rowInGeo({ district, division: resolvedDiv, taluka }, gate.geo)) {
      return sendError(res, 'आपल्या कार्यक्षेत्राबाहेर नियुक्ती करता येत नाही.', 'OUT_OF_SCOPE', 403);
    }

    const toId = generateSecureId('TO');
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO territory_officers (id, officer_name, phone, email, territory_level, division, district, taluka, jurisdiction, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [toId, sanitize(officerName), cleanPhoneNum, email ? String(email).trim() : '', territoryLevel, resolvedDiv, district, taluka || '', sanitize(jurisdiction || ''), now]);

    return sendSuccess(res, 'क्षेत्रीय अधिकारी यशस्वीरीत्या नियुक्त केला गेला!', { officerId: toId }, 201);
  } catch (err) {
    return sendError(res, 'क्षेत्रीय अधिकारी नोंदवताना त्रुटी: ' + err.message, 'OFFICER_CREATE_ERROR', 500);
  }
});

/**
 * 🏛️ 8. Organization Units Master
 */
router.get('/organization-units', authenticateToken, (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;
    const { type, parentId } = req.query;
    let units = db.getCollection('organizationUnits') || [];

    if (type) units = units.filter(u => u.type === type);
    if (parentId) units = units.filter(u => u.parentId === parentId);
    units = units.filter(u => rowInGeo(u, gate.geo));

    return sendSuccess(res, 'Organization units fetched', { total: units.length, units });
  } catch (err) {
    return sendError(res, 'Error fetching units', 'UNITS_FETCH_ERROR', 500);
  }
});

/**
 * 🤝 9. CRM Member Referrals Registry (12 Golden Columns)
 * SNo, Member ID, Name, Referral ID, Referral Name, Joining Date, Click Here, Mobile No, Email, Package, Activ.Date, Status
 */
router.get('/member-referrals', authenticateToken, async (req, res) => {
  try {
    const gate = requireScope(req, res);
    if (!gate) return;

    const rows = await all(`
      SELECT 
        mr.*,
        m.email as referee_email,
        m.tier as referee_package,
        m.joined as referee_joined,
        m.created_at as referee_created_at,
        m.phone as referee_full_phone
      FROM member_referrals mr
      LEFT JOIN members m ON mr.referee_id = m.id
      ORDER BY mr.created_at DESC
    `);

    const directRows = await all(`
      SELECT id, name, phone, email, tier, district, taluka, created_at, joined, referred_by
      FROM members
      WHERE referred_by IS NOT NULL AND referred_by != ''
      ORDER BY created_at DESC
    `);

    const map = new Map();
    for (const r of rows) {
      const refereeId = r.referee_id || r.id;
      map.set(refereeId, {
        id: r.id,
        memberId: refereeId,
        refereeId: refereeId,
        name: r.referee_name,
        refereeName: r.referee_name,
        referralId: r.referrer_id,
        referrerId: r.referrer_id,
        referralName: r.referrer_name || 'Connect Maratha सभासद',
        referrerName: r.referrer_name || 'Connect Maratha सभासद',
        joiningDate: (r.referee_joined || r.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        mobileNo: r.referee_full_phone || r.referee_phone || '-',
        email: r.referee_email || '-',
        package: r.referee_package || 'Basic (प्राथमिक)',
        activDate: (r.referee_created_at || r.created_at || r.referee_joined || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        status: r.status === 'active' || !r.status ? 'Active' : r.status,
        district: r.district || 'महाराष्ट्र',
        taluka: r.taluka || '',
        created_at: r.created_at
      });
    }

    for (const m of directRows) {
      if (!map.has(m.id)) {
        map.set(m.id, {
          id: `REF-${m.id}`,
          memberId: m.id,
          refereeId: m.id,
          name: m.name,
          refereeName: m.name,
          referralId: m.referred_by,
          referrerId: m.referred_by,
          referralName: 'Connect Maratha सभासद',
          referrerName: 'Connect Maratha सभासद',
          joiningDate: (m.joined || m.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          mobileNo: m.phone || '-',
          email: m.email || '-',
          package: m.tier || 'Basic (प्राथमिक)',
          activDate: (m.created_at || m.joined || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          status: 'Active',
          district: m.district || 'महाराष्ट्र',
          taluka: m.taluka || '',
          created_at: m.created_at
        });
      }
    }

    const referrals = Array.from(map.values())
      .filter(r => rowInGeo(r, gate.geo))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .map((r, i) => ({ ...r, sno: i + 1 }));

    return sendSuccess(res, 'Member referrals fetched successfully', { total: referrals.length, referrals });

  } catch (err) {
    return sendError(res, 'Error fetching member referrals: ' + err.message, 'REFERRALS_FETCH_ERROR', 500);
  }
});

export default router;

