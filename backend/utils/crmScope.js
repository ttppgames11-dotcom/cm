// CRM unit hierarchy: levels, scope resolution and the yearly activity catalogue.
// State -> Branch -> Division/Jilha -> District -> Taluka. Units are stored in the "communityCenters" collection.
import { db } from '../db/realtimeDb.js';
import { GLOBAL_ROLES, isDisabled } from './accounts.js';

export const LEVELS = ['state', 'branch', 'division', 'district', 'taluka'];
export const LEVEL_LABELS = {
  state: 'राज्य (State)',
  branch: 'शाखा (Branch)',
  division: 'विभाग / जिल्हा (Division)',
  district: 'जिल्हा (District)',
  taluka: 'तालुका (Taluka)'
};
export const OWNER_ROLE_BY_LEVEL = {
  state: 'state_admin',
  branch: 'branch_admin',
  division: 'division_admin',
  district: 'district_admin',
  taluka: 'taluka_admin'
};
// Role aliases acceptable for unit ownership
export const OWNER_ROLES = [
  'state_admin', 'branch_admin', 'branch_head', 'division_admin', 'district_admin', 'taluka_admin', 'center_manager', 'center_admin'
];
export const STAFF_ROLE = 'center_staff';

export const ACTIVITY_TYPES = [

  { key: 'health_checkup', mr: 'आरोग्य तपासणी', en: 'Health checkup', icon: '🩺', defaultTarget: 200 },
  { key: 'blood_donation', mr: 'रक्तदान', en: 'Blood donation', icon: '🩸', defaultTarget: 100 },
  { key: 'job_fair', mr: 'रोजगार मेळावा', en: 'Job fair', icon: '💼', defaultTarget: 300 },
  { key: 'business_expo', mr: 'व्यवसाय प्रदर्शन', en: 'Business expo', icon: '🏪', defaultTarget: 150 },
  { key: 'job_business_consultancy', mr: 'रोजगार/व्यवसाय मार्गदर्शन', en: 'Job and business consultancy', icon: '🧭', defaultTarget: 100 },
  { key: 'matrimony', mr: 'वधू-वर मेळावा', en: 'Matrimony', icon: '💍', defaultTarget: 250 },
  { key: 'education_consultancy', mr: 'शिक्षण मार्गदर्शन', en: 'Education consultancy', icon: '🎓', defaultTarget: 150 },
  { key: 'childrens_games', mr: 'बालकल्याण क्रीडा', en: "Children's welfare games", icon: '⚽', defaultTarget: 120 },
  { key: 'spiritual', mr: 'अध्यात्मिक उपक्रम', en: 'Spiritual activities', icon: '🕉️', defaultTarget: 200 },
  { key: 'mahila_bachat_gat', mr: 'महिला बचत गट', en: 'Mahila bachat gat', icon: '👩‍🌾', defaultTarget: 60 },
  { key: 'krushi_sabha', mr: 'कृषी सभा', en: 'Krushi sabha', icon: '🌾', defaultTarget: 150 },
  { key: 'food_expo', mr: 'अन्न प्रदर्शन', en: 'Food expo', icon: '🍲', defaultTarget: 200 }
];
export const ACTIVITY_TYPE_KEYS = ACTIVITY_TYPES.map(t => t.key);
export const STORED_STATUSES = ['planned', 'in_progress', 'done'];

export const levelIndex = (level) => LEVELS.indexOf(level);

export function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function unitsCollection() {
  return db.getCollection('communityCenters');
}

export function getUnit(id) {
  if (!id) return null;
  return db.findById('communityCenters', id);
}

// A unit created by the hierarchy endpoints has a valid level. Older seeded centers do not.
export function isHierarchyUnit(u) {
  return !!u && LEVELS.includes(u.level);
}

export function isDescendantOf(unit, ancestorId) {
  return !!unit && Array.isArray(unit.ancestorIds) && unit.ancestorIds.includes(ancestorId);
}

export function descendantsOf(unitId, units = unitsCollection()) {
  return units.filter(u => isDescendantOf(u, unitId));
}

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

/**
 * Work out what the signed-in account may see and do. The account is read fresh from the
 * database; nothing here trusts the role stored in the token.
 *
 * kind:
 *   global      superadmin / admin: everything, read and write
 *   global_read ceo: everything, read only
 *   unit        account bound to a unit as owner or staff
 *   geo         older district/taluka/division/branch admins that have no unit: units in their area
 *   none        no CRM access
 */
export function resolveScope(account) {
  if (!account || isDisabled(account)) return { kind: 'none', account };
  const role = String(account.role || '').toLowerCase();
  if (GLOBAL_ROLES.includes(role)) return { kind: 'global', canWrite: true, account };
  if (role === 'ceo') return { kind: 'global_read', canWrite: false, account };

  if (account.unitId) {
    const unit = getUnit(account.unitId);
    // The role has to match the binding: if a platform admin changes an owner/staff role to something else,
    // the unit access is withdrawn with it.
    const isOwner = account.unitRole === 'owner';
    const roleOk = isOwner ? OWNER_ROLES.includes(role) : role === STAFF_ROLE;
    if (unit && isHierarchyUnit(unit) && unit.status !== 'archived' && roleOk) {
      return { kind: 'unit', unit, unitRole: isOwner ? 'owner' : 'staff', account };
    }
    return { kind: 'none', account };
  }

  // Statewide functional roles (finance, emergency seva)
  if (['finance_officer', 'finance', 'seva_helpdesk', 'helpdesk_admin'].includes(role)) {
    return { kind: 'global_read', canWrite: true, role, account };
  }

  // Chapter presidents and geographic administrators
  if ([
    'division_admin', 'district_admin', 'taluka_admin', 'branch_admin',
    'branch_head', 'center_manager', 'center_admin', 'chapter_president', 'chapter'
  ].includes(role)) {
    return { kind: 'geo', role, account };
  }
  return { kind: 'none', account };
}

function geoMatches(scope, unit) {
  const a = scope.account;
  switch (scope.role) {
    case 'division_admin': return !!a.division && sameText(unit.division, a.division);
    case 'district_admin': return !!a.district && sameText(unit.district, a.district);
    case 'taluka_admin':
    case 'center_manager':
    case 'center_admin':
      return !!a.district && !!a.taluka && sameText(unit.district, a.district) && sameText(unit.taluka, a.taluka);
    case 'branch_admin':
    case 'branch_head':
    case 'chapter_president':
    case 'chapter':
      return !!a.district && sameText(unit.district, a.district) && (!a.taluka || sameText(unit.taluka, a.taluka));
    default: return false;
  }
}


export function canViewUnit(scope, unit) {
  if (!unit) return false;
  if (scope.kind === 'global' || scope.kind === 'global_read') return true;
  if (scope.kind === 'unit') {
    if (unit.id === scope.unit.id) return true;
    // Owners see their unit and everything below it. Staff see only their own unit.
    return scope.unitRole === 'owner' && isDescendantOf(unit, scope.unit.id);
  }
  if (scope.kind === 'geo') return geoMatches(scope, unit);
  return false;
}

// Owner of the unit or of any unit above it (or a platform admin): may edit the unit and create children/owner.
export function canManageUnit(scope, unit) {
  if (!unit) return false;
  if (scope.kind === 'global') return true;
  if (scope.kind === 'unit' && scope.unitRole === 'owner') {
    return unit.id === scope.unit.id || isDescendantOf(unit, scope.unit.id);
  }
  return false;
}

// Strictly above: used for replacing a unit's owner (owners may not replace themselves).
export function canManageAbove(scope, unit) {
  if (!unit) return false;
  if (scope.kind === 'global') return true;
  return scope.kind === 'unit' && scope.unitRole === 'owner' && isDescendantOf(unit, scope.unit.id);
}

// Staff accounts of a unit are managed by that unit's own owner (or a platform admin) only.
export function canManageStaff(scope, unit) {
  if (!unit) return false;
  if (scope.kind === 'global') return true;
  return scope.kind === 'unit' && scope.unitRole === 'owner' && scope.unit.id === unit.id;
}

// Who may plan / log / complete activities for a unit.
export function canWriteActivities(scope, unit) {
  if (!unit) return false;
  if (scope.kind === 'global') return true;
  if (scope.kind === 'unit') {
    if (scope.unit.id === unit.id) return true; // owner or staff of this very unit
    return scope.unitRole === 'owner' && isDescendantOf(unit, scope.unit.id);
  }
  if (scope.kind === 'geo') return geoMatches(scope, unit);
  return false;
}

export function visibleUnits(scope) {
  // Archived units drop out of lists, summaries and roll-ups (they stay reachable by id for owners above)
  return unitsCollection().filter(u => isHierarchyUnit(u) && u.status !== 'archived' && canViewUnit(scope, u));
}

/**
 * Geographic filter for the older CRM endpoints (filterByScope in crmOperations.routes.js).
 * Returns null when the account has no data access at all.
 */
export function geoFilterForScope(scope) {
  if (scope.kind === 'global' || scope.kind === 'global_read') return { unrestricted: true };
  const a = scope.account;
  if (scope.kind === 'unit') {
    const u = scope.unit;
    switch (u.level) {
      case 'state': return { unrestricted: true };
      case 'division': return u.division ? { scope: 'division', division: u.division } : null;
      case 'district': return u.district ? { scope: 'district', division: u.division || null, district: u.district } : null;
      case 'taluka': return u.district && u.taluka ? { scope: 'taluka', district: u.district, taluka: u.taluka } : null;
      case 'branch':
        if (u.taluka && u.district) return { scope: 'taluka', district: u.district, taluka: u.taluka };
        if (u.district) return { scope: 'district', district: u.district };
        return null;
      default: return null;
    }
  }
  if (scope.kind === 'geo') {
    if (scope.role === 'division_admin' && a.division) return { scope: 'division', division: a.division };
    if (['district_admin', 'branch_admin', 'branch_head', 'chapter_president', 'chapter'].includes(scope.role) && a.district) {
      if (a.taluka) return { scope: 'taluka', district: a.district, taluka: a.taluka };
      return { scope: 'district', district: a.district };
    }
    if (a.district && a.taluka) return { scope: 'taluka', district: a.district, taluka: a.taluka };
    if (a.district) return { scope: 'district', district: a.district };
  }
  return null;
}


// ---- Activities ----------------------------------------------------------------------------

export function activitiesCollection() {
  return db.getCollection('unitActivities');
}

// planned / in_progress become overdue once the scheduled date has passed.
export function effectiveStatus(act, today = todayIST()) {
  if (act.status === 'done') return 'done';
  if (act.scheduledDate && String(act.scheduledDate).slice(0, 10) < today) return 'overdue';
  return act.status === 'in_progress' ? 'in_progress' : 'planned';
}

export function withStatus(act, today = todayIST()) {
  return { ...act, rawStatus: act.status, status: effectiveStatus(act, today) };
}

export function emptyProgress() {
  return {
    total: 0, planned: 0, in_progress: 0, done: 0, overdue: 0,
    targetTotal: 0, achievedTotal: 0, typesCovered: 0, typesRequired: ACTIVITY_TYPES.length,
    coveragePct: 0, completionPct: 0, byType: Object.fromEntries(ACTIVITY_TYPE_KEYS.map(k => [k, { total: 0, done: 0, overdue: 0, target: 0, achieved: 0 }]))
  };
}

// Aggregate a list of activities (already filtered to one year / one set of units).
export function computeProgress(activities, today = todayIST()) {
  const p = emptyProgress();
  for (const raw of activities) {
    const st = effectiveStatus(raw, today);
    p.total++;
    p[st]++;
    p.targetTotal += Number(raw.targetCount) || 0;
    const bt = p.byType[raw.type] || (p.byType[raw.type] = { total: 0, done: 0, overdue: 0, target: 0, achieved: 0 });
    bt.total++;
    bt.target += Number(raw.targetCount) || 0;
    if (st === 'done') {
      p.achievedTotal += Number(raw.attendeeCount) || 0;
      bt.done++;
      bt.achieved += Number(raw.attendeeCount) || 0;
    }
    if (st === 'overdue') bt.overdue++;
  }
  p.typesCovered = ACTIVITY_TYPE_KEYS.filter(k => p.byType[k].done > 0).length;
  p.coveragePct = Math.round((p.typesCovered / ACTIVITY_TYPES.length) * 100);
  p.completionPct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  return p;
}
