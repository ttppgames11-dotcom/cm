import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Helper: Filter records by geographical scope
function filterByScope(records = [], { scope = 'pradesh', division, district, taluka, branchId }) {
  if (scope === 'pradesh' || (!division && !district && !taluka && !branchId)) {
    return records;
  }
  return records.filter(r => {
    if (branchId && r.branchId && String(r.branchId) !== String(branchId)) return false;
    if (taluka && r.taluka && String(r.taluka).toLowerCase() !== String(taluka).toLowerCase()) return false;
    if (district && r.district && String(r.district).toLowerCase() !== String(district).toLowerCase()) return false;
    if (division && r.division && String(r.division).toLowerCase() !== String(division).toLowerCase()) return false;
    return true;
  });
}

// Helper for mapping district to division
function getDivisionForDistrict(district) {
  if (!district) return 'पुणे विभाग';
  const d = String(district).trim();
  if (['पुणे', 'सातारा', 'सांगली', 'कोल्हापूर', 'सोलापूर'].includes(d)) return 'पुणे विभाग';
  if (['मुंबई', 'मुंबई उपनगर', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग'].includes(d)) return 'कोकण विभाग';
  if (['नाशिक', 'अहमदनगर', 'धुळे', 'जळगाव', 'नंदुरबार'].includes(d)) return 'नाशिक विभाग';
  if (['छत्रपती संभाजीनगर', 'जालना', 'बीड', 'परभणी', 'नांदेड', 'उस्मानाबाद', 'धाराशिव', 'लातूर', 'हिंगोली'].includes(d)) return 'छत्रपती संभाजीनगर विभाग';
  if (['अमरावती', 'अकोला', 'बुलढाणा', 'यवतमाळ', 'वाशीम'].includes(d)) return 'अमरावती विभाग';
  return 'नागपूर विभाग';
}

/**
 * 🚩 1. GET /api/crm/unified-dashboard
 * One Master Aggregated View according to the 12 Golden Rules
 */
router.get('/unified-dashboard', authenticateToken, (req, res) => {
  try {
    const scope = req.query.scope || (req.user?.role?.includes('division') ? 'division' :
                  req.user?.role?.includes('district') ? 'district' :
                  req.user?.role?.includes('taluka') ? 'taluka' :
                  req.user?.role?.includes('branch') ? 'branch' : 'pradesh');

    const division = req.query.division || req.user?.division || null;
    const district = req.query.district || req.user?.district || null;
    const taluka = req.query.taluka || req.user?.taluka || null;
    const branchId = req.query.branchId || null;

    const queryFilter = { scope, division, district, taluka, branchId };

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
 * 🎫 2. Unified Ticket Operations
 */
router.get('/tickets', authenticateToken, (req, res) => {
  try {
    const { scope, division, district, taluka, status, priority, category } = req.query;
    let tickets = db.getCollection('tickets') || [];

    tickets = filterByScope(tickets, { scope, division, district, taluka });

    if (status) tickets = tickets.filter(t => t.status === status);
    if (priority) tickets = tickets.filter(t => t.priority === priority);
    if (category) tickets = tickets.filter(t => t.category === category);

    return sendSuccess(res, 'Tickets fetched', {
      total: tickets.length,
      tickets
    });
  } catch (err) {
    return sendError(res, 'Error fetching tickets', 'TICKETS_FETCH_ERROR', 500);
  }
});

router.post('/tickets', authenticateToken, (req, res) => {
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

    const tickets = db.getCollection('tickets') || [];
    const newId = `TKT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(tickets.length + 1).padStart(4, '0')}`;

    const newTicket = {
      id: newId,
      ticketNumber: newId,
      title,
      description,
      category,
      subcategory,
      priority,
      district,
      taluka,
      division,
      assignedCenterId,
      assignedStaffId: 'STF-001',
      currentOwnerLevel: 'taluka',
      status: 'New',
      requesterId: req.user?.id || 'GUEST',
      requesterName,
      requesterPhone,
      slaHours: priority === 'Critical' ? 4 : priority === 'High' ? 24 : 72,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      auditTrail: [
        {
          action: 'CREATED',
          by: req.user?.name || 'नागरिक',
          role: req.user?.role || 'member',
          timestamp: new Date().toISOString(),
          note: 'नवीन तक्रार / मागणी नोंदवली गेली.'
        }
      ]
    };

    tickets.unshift(newTicket);
    db.save();

    return sendSuccess(res, 'तिकीट यशस्वीरित्या नोंदवले गेले.', newTicket, 201);
  } catch (err) {
    return sendError(res, 'तिकीट नोंदवताना त्रुटी आली.', 'TICKET_CREATE_ERROR', 500);
  }
});

// Escalate Ticket (Taluka -> District -> Division -> State)
router.patch('/tickets/:id/escalate', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'स्थानिक पातळीवर अनिर्णित राहिल्यामुळे वरिष्ठ स्तरावर वर्ग.' } = req.body;

    const tickets = db.getCollection('tickets') || [];
    const ticket = tickets.find(t => t.id === id);

    if (!ticket) {
      return sendError(res, 'तिकीट सापडले नाही.', 'TICKET_NOT_FOUND', 404);
    }

    const currentLevel = ticket.currentOwnerLevel || 'taluka';
    const nextLevel = currentLevel === 'taluka' ? 'district' :
                      currentLevel === 'district' ? 'division' : 'state';

    ticket.currentOwnerLevel = nextLevel;
    ticket.status = 'Escalated';
    ticket.updated_at = new Date().toISOString();
    ticket.auditTrail = ticket.auditTrail || [];
    ticket.auditTrail.push({
      action: 'ESCALATED',
      fromLevel: currentLevel,
      toLevel: nextLevel,
      by: req.user?.name || 'अधिकृत अधिकारी',
      role: req.user?.role || 'center_manager',
      timestamp: new Date().toISOString(),
      reason
    });

    db.save();

    return sendSuccess(res, `तिकीट यशस्वीरित्या ${nextLevel.toUpperCase()} स्तरावर वर्ग केले.`, ticket);
  } catch (err) {
    console.error('Escalation error:', err);
    return sendError(res, 'एस्केलेशन करताना त्रुटी आली.', 'ESCALATE_ERROR', 500);
  }
});

// Update Ticket Status (In_Progress / Resolved / Closed)
router.patch('/tickets/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    if (!status) return sendError(res, 'नवीन स्टेटस आवश्यक आहे.', 'VALIDATION_ERROR', 400);

    const tickets = db.getCollection('tickets') || [];
    const ticket = tickets.find(t => t.id === id);

    if (!ticket) return sendError(res, 'तिकीट सापडले नाही.', 'TICKET_NOT_FOUND', 404);

    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    ticket.auditTrail = ticket.auditTrail || [];
    ticket.auditTrail.push({
      action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
      by: req.user?.name || 'अधिकारी',
      role: req.user?.role || 'staff',
      timestamp: new Date().toISOString(),
      note
    });

    db.save();

    return sendSuccess(res, `स्थिती यशस्वीरित्या बदलली: ${status}`, ticket);
  } catch (err) {
    return sendError(res, 'स्थिती बदलताना त्रुटी आली.', 'STATUS_ERROR', 500);
  }
});

/**
 * 🏢 3. Community Center Operations
 */
router.get('/community-centers', (req, res) => {
  try {
    const { tier, district, division } = req.query;
    let centers = db.getCollection('communityCenters') || [];

    if (tier) centers = centers.filter(c => c.tier === tier);
    if (district) centers = centers.filter(c => c.district === district);
    if (division) centers = centers.filter(c => c.division === division);

    return sendSuccess(res, 'Centers fetched', { total: centers.length, centers });
  } catch (err) {
    return sendError(res, 'Error fetching centers', 'CENTERS_FETCH_ERROR', 500);
  }
});

// Front Desk Visitor Check-In
router.post('/community-centers/:id/checkin', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { visitorName, phone, purpose = 'सामान्य चौकशी', desk = 'फ्रंट डेस्क' } = req.body;

    const centers = db.getCollection('communityCenters') || [];
    const center = centers.find(c => c.id === id);

    if (!center) return sendError(res, 'केंद्र सापडले नाही.', 'CENTER_NOT_FOUND', 404);

    center.todayVisitors = (Number(center.todayVisitors) || 0) + 1;
    
    const activities = db.getCollection('centerActivities') || [];
    activities.unshift({
      id: `ACT-${Date.now()}`,
      centerId: id,
      type: 'CHECK_IN',
      visitorName: visitorName || 'अभ्यागत नागरिक',
      phone: phone || '',
      purpose,
      desk,
      timestamp: new Date().toISOString()
    });

    db.save();

    return sendSuccess(res, 'अभ्यागत नोंद यशस्वी!', {
      centerId: id,
      todayVisitors: center.todayVisitors
    });
  } catch (err) {
    return sendError(res, 'अभ्यागत नोंद करताना अडचण आली.', 'CHECKIN_ERROR', 500);
  }
});

// Daily Ledger Transaction (Revenue/Collection)
router.post('/community-centers/:id/transaction', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payerName, category = 'सदस्यता वर्गणी', paymentMode = 'UPI / रोख' } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return sendError(res, 'वैध रक्कम आवश्यक आहे.', 'VALIDATION_ERROR', 400);

    const centers = db.getCollection('communityCenters') || [];
    const center = centers.find(c => c.id === id);

    if (!center) return sendError(res, 'केंद्र सापडले नाही.', 'CENTER_NOT_FOUND', 404);

    center.dailyCollection = (Number(center.dailyCollection) || 0) + numAmount;

    const activities = db.getCollection('centerActivities') || [];
    activities.unshift({
      id: `TXN-${Date.now()}`,
      centerId: id,
      type: 'FINANCE_RECEIPT',
      payerName: payerName || 'देणगीदार / सभासद',
      category,
      amount: numAmount,
      paymentMode,
      collectedBy: req.user?.name || 'वित्त रोखपाल',
      timestamp: new Date().toISOString()
    });

    db.save();

    return sendSuccess(res, 'पावती नोंद यशस्वी!', {
      centerId: id,
      dailyCollection: center.dailyCollection,
      receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`
    });
  } catch (err) {
    return sendError(res, 'पावती नोंद करताना अडचण आली.', 'TXN_ERROR', 500);
  }
});

/**
 * 👥 4. Staff Master Operations
 */
router.get('/staff', (req, res) => {
  try {
    const { centerId, department } = req.query;
    let staff = db.getCollection('staff') || [];

    if (centerId) staff = staff.filter(s => s.centerId === centerId);
    if (department) staff = staff.filter(s => s.department === department);

    return sendSuccess(res, 'Staff roster fetched', { total: staff.length, staff });
  } catch (err) {
    return sendError(res, 'Error fetching staff roster', 'STAFF_FETCH_ERROR', 500);
  }
});

/**
 * 🏛️ 5. Organization Units Master
 */
router.get('/organization-units', (req, res) => {
  try {
    const { type, parentId } = req.query;
    let units = db.getCollection('organizationUnits') || [];

    if (type) units = units.filter(u => u.type === type);
    if (parentId) units = units.filter(u => u.parentId === parentId);

    return sendSuccess(res, 'Organization units fetched', { total: units.length, units });
  } catch (err) {
    return sendError(res, 'Error fetching units', 'UNITS_FETCH_ERROR', 500);
  }
});

export default router;
