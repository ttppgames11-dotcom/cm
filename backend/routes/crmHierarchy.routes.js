// CRM unit hierarchy: State -> Branch -> Division -> District -> Taluka.
// Every unit has one owner login and any number of staff logins. All scope checks happen here, on the server.
import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize } from '../utils/validator.js';
import {
  createMemberAccount, findJsonAccount, publicAccount, setPassword, setDisabled, validatePassword, isDisabled
} from '../utils/accounts.js';
import {
  LEVELS, LEVEL_LABELS, OWNER_ROLE_BY_LEVEL, STAFF_ROLE, ACTIVITY_TYPES, ACTIVITY_TYPE_KEYS, STORED_STATUSES,
  levelIndex, getUnit, unitsCollection, isHierarchyUnit, isDescendantOf, descendantsOf, resolveScope,
  canViewUnit, canManageUnit, canManageAbove, canManageStaff, canWriteActivities, visibleUnits,
  activitiesCollection, withStatus, computeProgress, todayIST
} from '../utils/crmScope.js';

const router = Router();

// Resolve the account from the database on every request, so a role change or disable applies at once.
function withScope(req, res, next) {
  const account = db.findById('members', req.user?.id);
  const scope = resolveScope(account);
  if (scope.kind === 'none') {
    return sendError(res, 'या विभागासाठी आपल्याकडे प्रवेश नाही (No CRM unit access for this account).', 'NO_CRM_ACCESS', 403);
  }
  req.scope = scope;
  next();
}
const guard = [authenticateToken, withScope];

const isoDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) && !Number.isNaN(Date.parse(v));
const safeUrl = (v) => {
  const s = String(v || '').trim();
  if (!s) return '';
  return /^(https?:\/\/|\/)[^\s<>"']*$/i.test(s) ? s.slice(0, 500) : null;
};
const toCount = (v, max = 10000000) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.floor(n) : null;
};

function unitView(u, units = unitsCollection()) {
  const owner = u.ownerId ? db.findById('members', u.ownerId) : null;
  const parent = u.parentId ? getUnit(u.parentId) : null;
  const staffIds = Array.isArray(u.staffIds) ? u.staffIds : [];
  return {
    ...u,
    levelLabel: LEVEL_LABELS[u.level] || u.level,
    parentName: parent?.name || null,
    owner: owner ? { id: owner.id, name: owner.name, phone: owner.phone, email: owner.email, disabled: isDisabled(owner) } : null,
    staffCount: staffIds.length,
    childCount: units.filter(c => c.parentId === u.id).length
  };
}

function accountView(m) {
  const safe = publicAccount(m);
  return {
    id: safe.id, name: safe.name, phone: safe.phone, email: safe.email, role: safe.role,
    unitId: safe.unitId || null, unitRole: safe.unitRole || null, disabled: isDisabled(m),
    district: safe.district, taluka: safe.taluka, createdAt: safe.created_at
  };
}

// ---------------------------------------------------------------------------------------------
// Catalogue + current account
// ---------------------------------------------------------------------------------------------

router.get('/activity-types', authenticateToken, (req, res) => {
  return sendSuccess(res, 'वार्षिक १२ उपक्रम', { types: ACTIVITY_TYPES, levels: LEVELS, levelLabels: LEVEL_LABELS });
});

router.get('/me', ...guard, (req, res) => {
  const s = req.scope;
  const unit = s.kind === 'unit' ? unitView(s.unit) : null;
  const unitIdx = s.kind === 'unit' ? levelIndex(s.unit.level) : -1;
  return sendSuccess(res, 'माझे स्कोप', {
    account: accountView(s.account),
    scopeKind: s.kind,
    unit,
    unitRole: s.unitRole || null,
    permissions: {
      canCreateState: s.kind === 'global',
      canCreateUnits: s.kind === 'global' || (s.kind === 'unit' && s.unitRole === 'owner' && unitIdx < LEVELS.length - 1),
      canManageStaff: s.kind === 'global' || (s.kind === 'unit' && s.unitRole === 'owner'),
      canWriteActivities: s.kind !== 'global_read',
      readOnly: s.kind === 'global_read'
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------------------------

router.get('/units', ...guard, (req, res) => {
  const { level, parentId, search } = req.query;
  const all = unitsCollection();
  let list = visibleUnits(req.scope);
  if (level && LEVELS.includes(level)) list = list.filter(u => u.level === level);
  if (parentId) list = list.filter(u => u.parentId === parentId);
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(u => String(u.name || '').toLowerCase().includes(q));
  }
  list.sort((a, b) => levelIndex(a.level) - levelIndex(b.level) || String(a.name).localeCompare(String(b.name)));
  return sendSuccess(res, 'युनिट यादी', { units: list.map(u => unitView(u, all)), count: list.length });
});

router.get('/units/:id', ...guard, (req, res) => {
  const unit = getUnit(req.params.id);
  // 404 for units outside scope too, so ids cannot be probed
  if (!isHierarchyUnit(unit) || !canViewUnit(req.scope, unit)) {
    return sendError(res, 'युनिट सापडले नाही.', 'UNIT_NOT_FOUND', 404);
  }
  const ancestors = (unit.ancestorIds || []).map(getUnit).filter(a => a && canViewUnit(req.scope, a)).map(a => ({ id: a.id, name: a.name, level: a.level }));
  return sendSuccess(res, 'युनिट तपशील', { unit: unitView(unit), ancestors });
});

function geoFromInput(level, input, parent) {
  const pick = (k) => sanitize(input[k]) || (parent ? parent[k] : '') || '';
  const geo = { division: pick('division'), district: pick('district'), taluka: pick('taluka') };
  // A unit above a level has no value for the finer fields
  if (level === 'state' || level === 'branch') {
    geo.division = sanitize(input.division) || '';
    geo.district = sanitize(input.district) || '';
    geo.taluka = sanitize(input.taluka) || '';
  }
  if (level === 'division') { geo.district = ''; geo.taluka = ''; }
  if (level === 'district') { geo.taluka = ''; }
  return geo;
}

router.post('/units', ...guard, async (req, res) => {
  const body = req.body || {};
  const level = String(body.level || '');
  const name = sanitize(body.name);
  if (!LEVELS.includes(level)) return sendError(res, 'अवैध स्तर (level).', 'INVALID_LEVEL', 400);
  if (!name) return sendError(res, 'युनिटचे नाव आवश्यक आहे.', 'MISSING_NAME', 400);

  let parent = null;
  if (level === 'state') {
    if (req.scope.kind !== 'global') {
      return sendError(res, 'राज्य युनिट फक्त सुपर अॅडमिन तयार करू शकतो.', 'FORBIDDEN', 403);
    }
  } else {
    parent = getUnit(body.parentId);
    if (!isHierarchyUnit(parent) || !canViewUnit(req.scope, parent)) {
      return sendError(res, 'पालक युनिट सापडले नाही.', 'PARENT_NOT_FOUND', 404);
    }
    if (!canManageUnit(req.scope, parent)) {
      return sendError(res, 'या पालक युनिटखाली उप-युनिट तयार करण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
    }
    if (levelIndex(level) <= levelIndex(parent.level)) {
      return sendError(res, `"${LEVEL_LABELS[parent.level]}" खाली "${LEVEL_LABELS[level]}" तयार करता येत नाही.`, 'INVALID_LEVEL_ORDER', 400);
    }
  }

  const geo = geoFromInput(level, body, parent);
  if (level === 'division' && !geo.division) geo.division = name;
  if (level === 'district' && !geo.district) geo.district = name;
  if (level === 'taluka' && !geo.taluka) geo.taluka = name;
  if (level === 'taluka' && !geo.district) return sendError(res, 'तालुका युनिटसाठी जिल्हा आवश्यक आहे.', 'MISSING_DISTRICT', 400);

  const siblingClash = unitsCollection().some(u => u.parentId === (parent?.id || null) && u.level === level && String(u.name).toLowerCase() === name.toLowerCase());
  if (siblingClash) return sendError(res, 'याच नावाचे युनिट येथे अगोदरच आहे.', 'UNIT_EXISTS', 409);

  // Check the owner details before anything is written
  const ownerInput = body.owner;
  if (!ownerInput || typeof ownerInput !== 'object') {
    return sendError(res, 'युनिट मालकाचे (owner) नाव, फोन व पासवर्ड आवश्यक आहेत.', 'OWNER_REQUIRED', 400);
  }

  const unitId = `UNIT-${level.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase()}`;
  const ownerRes = await createMemberAccount(
    { ...ownerInput, district: geo.district || ownerInput.district, taluka: geo.taluka || ownerInput.taluka, division: geo.division },
    { role: OWNER_ROLE_BY_LEVEL[level], unitId, unitRole: 'owner', createdBy: req.user.id }
  );
  if (!ownerRes.ok) return sendError(res, ownerRes.error, ownerRes.code, ownerRes.status);

  const unit = db.insert('communityCenters', {
    id: unitId,
    name,
    level,
    tier: level,
    parentId: parent?.id || null,
    ancestorIds: parent ? [...(parent.ancestorIds || []), parent.id] : [],
    ownerId: ownerRes.user.id,
    staffIds: [],
    division: geo.division,
    district: geo.district,
    taluka: geo.taluka,
    address: sanitize(body.address) || '',
    contactPerson: ownerRes.user.name,
    contactPhone: ownerRes.user.phone,
    status: 'सक्रिय (Active)',
    created_at: new Date().toISOString(),
    createdBy: req.user.id
  });
  db.addAuditLog('CRM_UNIT_CREATE', req.user.id, { unitId, level, parentId: unit.parentId, ownerId: ownerRes.user.id });
  return sendSuccess(res, 'युनिट व मालक यशस्वीरीत्या तयार झाले!', { unit: unitView(unit), owner: accountView(ownerRes.user) }, 201);
});

router.put('/units/:id', ...guard, (req, res) => {
  const unit = getUnit(req.params.id);
  if (!isHierarchyUnit(unit) || !canViewUnit(req.scope, unit)) {
    return sendError(res, 'युनिट सापडले नाही.', 'UNIT_NOT_FOUND', 404);
  }
  if (!canManageUnit(req.scope, unit)) {
    return sendError(res, 'हे युनिट बदलण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  }
  const b = req.body || {};
  const updates = {};
  if (b.name !== undefined) {
    const n = sanitize(b.name);
    if (!n) return sendError(res, 'नाव रिकामे असू शकत नाही.', 'MISSING_NAME', 400);
    updates.name = n;
  }
  if (b.address !== undefined) updates.address = sanitize(b.address);
  if (b.status !== undefined) {
    // Only a parent (or a platform admin) may archive a unit, not the unit's own owner
    if (!canManageAbove(req.scope, unit)) return sendError(res, 'स्थिती बदलण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
    updates.status = b.status === 'archived' ? 'archived' : 'सक्रिय (Active)';
  }
  const updated = db.update('communityCenters', unit.id, updates);
  db.addAuditLog('CRM_UNIT_UPDATE', req.user.id, { unitId: unit.id, fields: Object.keys(updates) });
  return sendSuccess(res, 'युनिट अद्ययावत झाले!', { unit: unitView(updated) });
});

// Replace a unit's owner: platform admin or an owner above this unit. Body: { owner:{...new account} } or { userId }.
router.post('/units/:id/owner', ...guard, async (req, res) => {
  const unit = getUnit(req.params.id);
  if (!isHierarchyUnit(unit) || !canViewUnit(req.scope, unit)) {
    return sendError(res, 'युनिट सापडले नाही.', 'UNIT_NOT_FOUND', 404);
  }
  if (!canManageAbove(req.scope, unit)) {
    return sendError(res, 'मालक बदलण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  }
  const b = req.body || {};
  let newOwner;
  if (b.owner && typeof b.owner === 'object') {
    const r = await createMemberAccount(
      { ...b.owner, district: unit.district, taluka: unit.taluka, division: unit.division },
      { role: OWNER_ROLE_BY_LEVEL[unit.level], unitId: unit.id, unitRole: 'owner', createdBy: req.user.id }
    );
    if (!r.ok) return sendError(res, r.error, r.code, r.status);
    newOwner = r.user;
  } else if (b.userId) {
    const existing = db.findById('members', b.userId);
    if (!existing) return sendError(res, 'वापरकर्ता सापडला नाही.', 'USER_NOT_FOUND', 404);
    if (existing.unitId && existing.unitId !== unit.id) {
      return sendError(res, 'हा वापरकर्ता अगोदरच दुसऱ्या युनिटशी जोडलेला आहे.', 'ALREADY_IN_UNIT', 409);
    }
    if (['superadmin', 'admin', 'ceo'].includes(existing.role)) {
      return sendError(res, 'प्लॅटफॉर्म प्रशासकाला युनिट मालक करता येत नाही.', 'INVALID_USER', 400);
    }
    newOwner = db.update('members', existing.id, { role: OWNER_ROLE_BY_LEVEL[unit.level], unitId: unit.id, unitRole: 'owner' });
  } else {
    return sendError(res, 'नवीन मालकाचा तपशील द्या.', 'OWNER_REQUIRED', 400);
  }
  if (unit.ownerId && unit.ownerId !== newOwner.id) {
    const old = db.findById('members', unit.ownerId);
    if (old) {
      db.update('members', old.id, { unitId: null, unitRole: null, role: 'member', tokenVersion: (old.tokenVersion || 0) + 1 });
    }
  }
  const staffIds = (unit.staffIds || []).filter(id => id !== newOwner.id);
  const updated = db.update('communityCenters', unit.id, { ownerId: newOwner.id, staffIds, contactPerson: newOwner.name, contactPhone: newOwner.phone });
  db.addAuditLog('CRM_UNIT_OWNER_CHANGE', req.user.id, { unitId: unit.id, newOwnerId: newOwner.id });
  return sendSuccess(res, 'युनिट मालक बदलला!', { unit: unitView(updated), owner: accountView(newOwner) });
});

// ---------------------------------------------------------------------------------------------
// Staff accounts (owner of the unit only)
// ---------------------------------------------------------------------------------------------

function staffUnitOr404(req, res) {
  const unit = getUnit(req.params.id);
  if (!isHierarchyUnit(unit) || !canViewUnit(req.scope, unit)) {
    sendError(res, 'युनिट सापडले नाही.', 'UNIT_NOT_FOUND', 404);
    return null;
  }
  return unit;
}

router.get('/units/:id/staff', ...guard, (req, res) => {
  const unit = staffUnitOr404(req, res);
  if (!unit) return;
  if (!canManageUnit(req.scope, unit) && !(req.scope.kind === 'unit' && req.scope.unit.id === unit.id)) {
    return sendError(res, 'कर्मचारी यादी पाहण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  }
  const staff = (unit.staffIds || []).map(id => db.findById('members', id)).filter(Boolean).map(accountView);
  const owner = unit.ownerId ? db.findById('members', unit.ownerId) : null;
  return sendSuccess(res, 'कर्मचारी यादी', { staff, owner: owner ? accountView(owner) : null });
});

router.post('/units/:id/staff', ...guard, async (req, res) => {
  const unit = staffUnitOr404(req, res);
  if (!unit) return;
  if (!canManageStaff(req.scope, unit)) {
    return sendError(res, 'फक्त या युनिटचा मालक कर्मचारी खाते तयार करू शकतो.', 'FORBIDDEN', 403);
  }
  if (unit.status === 'archived') return sendError(res, 'हे युनिट संग्रहित आहे.', 'UNIT_ARCHIVED', 400);
  const r = await createMemberAccount(
    { ...(req.body || {}), district: unit.district, taluka: unit.taluka, division: unit.division },
    { role: STAFF_ROLE, unitId: unit.id, unitRole: 'staff', createdBy: req.user.id }
  );
  if (!r.ok) return sendError(res, r.error, r.code, r.status);
  db.update('communityCenters', unit.id, { staffIds: [...(unit.staffIds || []), r.user.id] });
  db.addAuditLog('CRM_STAFF_CREATE', req.user.id, { unitId: unit.id, staffId: r.user.id });
  return sendSuccess(res, 'कर्मचारी खाते तयार झाले!', { staff: accountView(r.user) }, 201);
});

// Update name/phone, reset password, enable/disable a staff member of this unit
router.put('/units/:id/staff/:userId', ...guard, async (req, res) => {
  const unit = staffUnitOr404(req, res);
  if (!unit) return;
  if (!canManageStaff(req.scope, unit)) {
    return sendError(res, 'फक्त या युनिटचा मालक कर्मचारी खाते बदलू शकतो.', 'FORBIDDEN', 403);
  }
  if (!(unit.staffIds || []).includes(req.params.userId)) {
    return sendError(res, 'कर्मचारी सापडला नाही.', 'STAFF_NOT_FOUND', 404);
  }
  const member = db.findById('members', req.params.userId);
  if (!member || member.unitId !== unit.id || member.unitRole !== 'staff') {
    return sendError(res, 'कर्मचारी सापडला नाही.', 'STAFF_NOT_FOUND', 404);
  }
  const b = req.body || {};
  if (b.password !== undefined) {
    const err = validatePassword(b.password);
    if (err) return sendError(res, err, 'WEAK_PASSWORD', 400);
    setPassword(member.id, b.password);
  }
  if (b.disabled !== undefined) setDisabled(member.id, !!b.disabled);
  if (b.name !== undefined && sanitize(b.name)) db.update('members', member.id, { name: sanitize(b.name) });
  db.addAuditLog('CRM_STAFF_UPDATE', req.user.id, { unitId: unit.id, staffId: member.id, fields: Object.keys(b).filter(k => k !== 'password'), passwordReset: b.password !== undefined });
  return sendSuccess(res, 'कर्मचारी खाते अद्ययावत झाले!', { staff: accountView(db.findById('members', member.id)) });
});

// ---------------------------------------------------------------------------------------------
// Yearly activities
// ---------------------------------------------------------------------------------------------

const yearOf = (v) => {
  const y = parseInt(v, 10);
  return Number.isInteger(y) && y >= 2000 && y <= 2100 ? y : new Date().getFullYear();
};

function activityUnitOr404(req, res, unitId) {
  const unit = getUnit(unitId);
  if (!isHierarchyUnit(unit) || !canViewUnit(req.scope, unit)) {
    sendError(res, 'युनिट सापडले नाही.', 'UNIT_NOT_FOUND', 404);
    return null;
  }
  return unit;
}

router.get('/activities', ...guard, (req, res) => {
  const year = yearOf(req.query.year);
  const today = todayIST();
  let units;
  if (req.query.unitId) {
    const unit = activityUnitOr404(req, res, req.query.unitId);
    if (!unit) return;
    units = req.query.includeDescendants === 'true' ? [unit, ...descendantsOf(unit.id).filter(u => canViewUnit(req.scope, u))] : [unit];
  } else {
    units = visibleUnits(req.scope);
  }
  const ids = new Set(units.map(u => u.id));
  let list = activitiesCollection().filter(a => ids.has(a.unitId) && Number(a.year) === year).map(a => withStatus(a, today));
  if (req.query.type && ACTIVITY_TYPE_KEYS.includes(req.query.type)) list = list.filter(a => a.type === req.query.type);
  if (req.query.status) list = list.filter(a => a.status === req.query.status);
  list.sort((a, b) => String(a.scheduledDate).localeCompare(String(b.scheduledDate)));
  const names = new Map(units.map(u => [u.id, u.name]));
  return sendSuccess(res, 'उपक्रम यादी', { activities: list.map(a => ({ ...a, unitName: names.get(a.unitId) })), year, count: list.length });
});

function validateActivityInput(b, { partial = false } = {}) {
  const out = {};
  if (!partial || b.type !== undefined) {
    if (!ACTIVITY_TYPE_KEYS.includes(b.type)) return { error: 'अवैध उपक्रम प्रकार.' };
    out.type = b.type;
  }
  if (!partial || b.scheduledDate !== undefined) {
    if (!isoDate(b.scheduledDate)) return { error: 'कृपया वैध तारीख (YYYY-MM-DD) द्या.' };
    out.scheduledDate = b.scheduledDate;
  }
  if (!partial || b.targetCount !== undefined) {
    const t = toCount(b.targetCount ?? 0);
    if (t === null) return { error: 'लक्ष्य संख्या वैध नाही.' };
    out.targetCount = t;
  }
  if (b.title !== undefined) out.title = sanitize(b.title).slice(0, 200);
  if (b.notes !== undefined) out.notes = sanitize(b.notes).slice(0, 2000);
  if (b.attendeeCount !== undefined && b.attendeeCount !== '') {
    const n = toCount(b.attendeeCount);
    if (n === null) return { error: 'उपस्थिती संख्या वैध नाही.' };
    out.attendeeCount = n;
  }
  if (b.photoUrl !== undefined) {
    const u = safeUrl(b.photoUrl);
    if (u === null) return { error: 'फोटो URL वैध नाही (http/https किंवा / ने सुरू व्हावा).' };
    out.photoUrl = u;
  }
  if (b.status !== undefined) {
    if (!STORED_STATUSES.includes(b.status)) return { error: 'अवैध स्थिती.' };
    out.status = b.status;
  }
  return { value: out };
}

router.post('/activities', ...guard, (req, res) => {
  const b = req.body || {};
  const unit = activityUnitOr404(req, res, b.unitId);
  if (!unit) return;
  if (!canWriteActivities(req.scope, unit)) {
    return sendError(res, 'या युनिटचे उपक्रम नोंदवण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  }
  const v = validateActivityInput(b);
  if (v.error) return sendError(res, v.error, 'INVALID_ACTIVITY', 400);
  const meta = ACTIVITY_TYPES.find(t => t.key === v.value.type);
  const act = db.insert('unitActivities', {
    id: `ACT-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 46656).toString(36).toUpperCase()}`,
    unitId: unit.id,
    year: Number(v.value.scheduledDate.slice(0, 4)),
    title: meta.mr,
    notes: '',
    attendeeCount: 0,
    photoUrl: '',
    ...v.value,
    status: v.value.status === 'done' ? 'planned' : (v.value.status || 'planned'), // "done" only via /complete, which needs proof
    createdBy: req.user.id,
    created_at: new Date().toISOString()
  });
  return sendSuccess(res, 'उपक्रम नोंदवला!', { activity: withStatus(act) }, 201);
});

function activityOr404(req, res) {
  const act = db.findById('unitActivities', req.params.id);
  const unit = act ? getUnit(act.unitId) : null;
  if (!act || !unit || !canViewUnit(req.scope, unit)) {
    sendError(res, 'उपक्रम सापडला नाही.', 'ACTIVITY_NOT_FOUND', 404);
    return {};
  }
  return { act, unit };
}

router.put('/activities/:id', ...guard, (req, res) => {
  const { act, unit } = activityOr404(req, res);
  if (!act) return;
  if (!canWriteActivities(req.scope, unit)) return sendError(res, 'हा उपक्रम बदलण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  const v = validateActivityInput(req.body || {}, { partial: true });
  if (v.error) return sendError(res, v.error, 'INVALID_ACTIVITY', 400);
  if (v.value.status === 'done') return sendError(res, '"पूर्ण" करण्यासाठी पुरावा देऊन complete वापरा.', 'USE_COMPLETE', 400);
  if (act.status === 'done' && v.value.status) return sendError(res, 'पूर्ण झालेला उपक्रम पुन्हा उघडता येत नाही.', 'ALREADY_DONE', 400);
  if (v.value.scheduledDate) v.value.year = Number(v.value.scheduledDate.slice(0, 4));
  const updated = db.update('unitActivities', act.id, v.value);
  return sendSuccess(res, 'उपक्रम अद्ययावत झाला!', { activity: withStatus(updated) });
});

router.post('/activities/:id/complete', ...guard, (req, res) => {
  const { act, unit } = activityOr404(req, res);
  if (!act) return;
  if (!canWriteActivities(req.scope, unit)) return sendError(res, 'हा उपक्रम पूर्ण करण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  const b = req.body || {};
  const v = validateActivityInput({ attendeeCount: b.attendeeCount, notes: b.notes, photoUrl: b.photoUrl }, { partial: true });
  if (v.error) return sendError(res, v.error, 'INVALID_ACTIVITY', 400);
  const attendee = v.value.attendeeCount;
  const notes = v.value.notes ?? act.notes;
  if (attendee === undefined) return sendError(res, 'पुरावा म्हणून उपस्थिती संख्या आवश्यक आहे.', 'PROOF_REQUIRED', 400);
  if (!notes || notes.trim().length < 3) return sendError(res, 'पुरावा म्हणून नोंद (notes) आवश्यक आहे.', 'PROOF_REQUIRED', 400);
  const updated = db.update('unitActivities', act.id, {
    ...v.value,
    notes,
    status: 'done',
    completedAt: new Date().toISOString(),
    completedBy: req.user.id
  });
  db.addAuditLog('CRM_ACTIVITY_COMPLETE', req.user.id, { activityId: act.id, unitId: unit.id });
  return sendSuccess(res, 'उपक्रम पूर्ण म्हणून नोंदवला!', { activity: withStatus(updated) });
});

router.delete('/activities/:id', ...guard, (req, res) => {
  const { act, unit } = activityOr404(req, res);
  if (!act) return;
  // Staff can log and complete, but only owners (or platform admins) can remove an entry
  if (!canManageUnit(req.scope, unit)) return sendError(res, 'हा उपक्रम काढण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  db.delete('unitActivities', act.id);
  return sendSuccess(res, 'उपक्रम काढला.', { deletedId: act.id });
});

// Create the 12 yearly activities for a unit (skips types the unit already has that year).
router.post('/units/:id/plan', ...guard, (req, res) => {
  const unit = activityUnitOr404(req, res, req.params.id);
  if (!unit) return;
  if (!canWriteActivities(req.scope, unit)) return sendError(res, 'या युनिटचा आराखडा तयार करण्याचा अधिकार नाही.', 'FORBIDDEN', 403);
  const year = yearOf(req.body?.year);
  const targets = req.body?.targets && typeof req.body.targets === 'object' ? req.body.targets : {};
  const existing = new Set(activitiesCollection().filter(a => a.unitId === unit.id && Number(a.year) === year).map(a => a.type));
  const created = [];
  ACTIVITY_TYPES.forEach((t, i) => {
    if (existing.has(t.key)) return;
    const target = toCount(targets[t.key] ?? t.defaultTarget);
    const month = String(i + 1).padStart(2, '0'); // one activity per month, January..December
    const act = db.insert('unitActivities', {
      id: `ACT-${Date.now().toString(36).toUpperCase()}${i}${Math.floor(Math.random() * 1296).toString(36).toUpperCase()}`,
      unitId: unit.id,
      year,
      type: t.key,
      title: t.mr,
      scheduledDate: `${year}-${month}-15`,
      targetCount: target ?? t.defaultTarget,
      status: 'planned',
      notes: '',
      attendeeCount: 0,
      photoUrl: '',
      createdBy: req.user.id,
      created_at: new Date().toISOString()
    });
    created.push(withStatus(act));
  });
  return sendSuccess(res, `${created.length} उपक्रम आराखड्यात जोडले.`, { created, year, skipped: ACTIVITY_TYPES.length - created.length }, 201);
});

// ---------------------------------------------------------------------------------------------
// Summary + roll-up
// ---------------------------------------------------------------------------------------------

function unitProgressMap(units, year, today) {
  const ids = new Set(units.map(u => u.id));
  const byUnit = new Map();
  for (const a of activitiesCollection()) {
    if (Number(a.year) !== year || !ids.has(a.unitId)) continue;
    if (!byUnit.has(a.unitId)) byUnit.set(a.unitId, []);
    byUnit.get(a.unitId).push(a);
  }
  return new Map(units.map(u => [u.id, computeProgress(byUnit.get(u.id) || [], today)]));
}

function rollupFor(unit, visible, year, today) {
  const subtree = [unit, ...visible.filter(u => isDescendantOf(u, unit.id))];
  const progress = unitProgressMap(subtree, year, today);
  const own = progress.get(unit.id);
  const agg = { total: 0, planned: 0, in_progress: 0, done: 0, overdue: 0, targetTotal: 0, achievedTotal: 0 };
  let coverageSum = 0;
  for (const u of subtree) {
    const p = progress.get(u.id);
    for (const k of Object.keys(agg)) agg[k] += p[k];
    coverageSum += p.coveragePct;
  }
  return {
    own,
    rollup: {
      ...agg,
      unitsCount: subtree.length,
      avgCoveragePct: Math.round(coverageSum / subtree.length),
      completionPct: agg.total ? Math.round((agg.done / agg.total) * 100) : 0,
      unitsFullyCovered: subtree.filter(u => progress.get(u.id).coveragePct === 100).length
    },
    subtree,
    progress
  };
}

router.get('/summary', ...guard, (req, res) => {
  const year = yearOf(req.query.year);
  const today = todayIST();
  let unit = null;
  if (req.query.unitId) {
    unit = activityUnitOr404(req, res, req.query.unitId);
    if (!unit) return;
  } else if (req.scope.kind === 'unit') {
    unit = req.scope.unit;
  }
  const visible = visibleUnits(req.scope);
  if (!unit) {
    // Platform admin without a unit: summary of every top-level unit
    const roots = visible.filter(u => !u.parentId);
    return sendSuccess(res, 'वार्षिक सारांश', {
      year,
      units: roots.map(r => {
        const x = rollupFor(r, visible, year, today);
        return { unit: unitView(r), own: x.own, rollup: x.rollup };
      })
    });
  }
  const x = rollupFor(unit, visible, year, today);
  const children = visible.filter(u => u.parentId === unit.id).map(c => {
    const cx = rollupFor(c, visible, year, today);
    return { unit: unitView(c), own: cx.own, rollup: cx.rollup };
  });
  return sendSuccess(res, 'वार्षिक सारांश', {
    year,
    unit: unitView(unit),
    own: x.own,
    rollup: x.rollup,
    children,
    activityTypes: ACTIVITY_TYPES
  });
});

// Roll-up by level: one row per visible unit at that level, plus a total for the level
router.get('/rollup', ...guard, (req, res) => {
  const year = yearOf(req.query.year);
  const today = todayIST();
  const visible = visibleUnits(req.scope);
  const levels = req.query.level && LEVELS.includes(req.query.level) ? [req.query.level] : LEVELS;
  const result = levels.map(level => {
    const units = visible.filter(u => u.level === level);
    const rows = units.map(u => {
      const x = rollupFor(u, visible, year, today);
      return { unit: unitView(u), own: x.own, rollup: x.rollup };
    });
    const total = rows.reduce((t, r) => {
      t.total += r.own.total; t.done += r.own.done; t.overdue += r.own.overdue; t.planned += r.own.planned;
      t.in_progress += r.own.in_progress; t.targetTotal += r.own.targetTotal; t.achievedTotal += r.own.achievedTotal;
      t.coverageSum += r.own.coveragePct;
      return t;
    }, { total: 0, done: 0, overdue: 0, planned: 0, in_progress: 0, targetTotal: 0, achievedTotal: 0, coverageSum: 0 });
    return {
      level,
      levelLabel: LEVEL_LABELS[level],
      unitsCount: units.length,
      totals: {
        total: total.total, done: total.done, overdue: total.overdue, planned: total.planned, in_progress: total.in_progress,
        targetTotal: total.targetTotal, achievedTotal: total.achievedTotal,
        avgCoveragePct: units.length ? Math.round(total.coverageSum / units.length) : 0,
        completionPct: total.total ? Math.round((total.done / total.total) * 100) : 0
      },
      units: rows
    };
  }).filter(l => l.unitsCount > 0);
  return sendSuccess(res, 'स्तरानुसार रोल-अप', { year, levels: result });
});

export default router;
