// Pure helpers for the CRM units page (no React, so they are tested with `node --test src/pages/crm/crmUnitsHelp.test.js`).

// The unit ladder, top to bottom.
export const LEVELS = [
  { value: 'state', label: 'राज्य' },
  { value: 'branch', label: 'शाखा' },
  { value: 'division', label: 'विभाग' },
  { value: 'district', label: 'जिल्हा' },
  { value: 'taluka', label: 'तालुका' }
];

// The Marathi name of a level; an unknown code is shown as it is.
export function levelLabel(code) {
  if (!code) return '';
  return LEVELS.find((l) => l.value === code)?.label || code;
}

// The levels this member may create under a unit of `level` (null = at the top): only the one directly below,
// and only with write rights. The server checks it again.
export function childLevels(level, permissions) {
  if (!permissions || permissions.readOnly) return [];
  if (!level) return permissions.canCreateState ? ['state'] : [];
  if (!permissions.canCreateUnits) return [];
  const i = LEVELS.findIndex((l) => l.value === level);
  return i >= 0 && i < LEVELS.length - 1 ? [LEVELS[i + 1].value] : [];
}

// May this member edit the name and address of the unit?
export function canEditUnit(unit, me) {
  return !!(unit && me?.permissions && !me.permissions.readOnly && unit.status !== 'archived');
}

// Is this member above the unit (so may archive it or change its owner)? A unit's own owner is not.
export function canManageAbove(unit, me) {
  if (!unit || !me?.permissions || me.permissions.readOnly) return false;
  if (me.scopeKind === 'global') return true;
  if (me.scopeKind === 'unit' && me.unit?.path && unit.path) {
    return unit.id !== me.unit.id && unit.path.startsWith(me.unit.path);
  }
  return false;
}

// What the "find member" box holds: a 10 digit phone (spaces, dashes and +91 allowed) or a member id.
export function ownerQuery(text) {
  const t = String(text ?? '').trim();
  if (!t) return {};
  const compact = t.replace(/[\s-]/g, '');
  const phone = compact.match(/^(?:\+?91)?(\d{10})$/);
  return phone ? { phone: phone[1] } : { member: t };
}

// The body for creating or editing a unit: only known fields, trimmed, empty ones left out.
export function unitPayload(form) {
  const out = {};
  const put = (key, value) => {
    const v = typeof value === 'string' ? value.trim() : value;
    if (v) out[key] = v;
  };
  put('level', form.level);
  put('parent_id', form.parentId);
  put('name', form.name);
  put('address', form.address);
  const owner = ownerQuery(form.owner);
  if (owner.phone || owner.member) out.owner = owner;
  return out;
}

// The names from the top down to the unit, for the breadcrumb.
export function breadcrumb(unit, ancestors = []) {
  if (!unit) return [];
  return [...ancestors.map((a) => a.name), unit.name];
}

// May this member add and remove the staff of the unit? An admin, or the owner on their own unit.
export function canManageStaff(unit, me) {
  if (!unit || !me?.permissions?.canManageStaff) return false;
  return me.scopeKind === 'global' || (me.scopeKind === 'unit' && me.unit?.id === unit.id);
}

// Free seats in a team: max minus the staff, never below zero.
export function staffSlotsLeft(team) {
  if (!team) return 0;
  return Math.max(0, (team.max ?? 10) - (team.staff || []).length);
}

// How an activity's status looks (Marathi label and colours); an unknown status is shown as planned.
export const ACTIVITY_STATUSES = {
  planned: { label: 'नियोजित', bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
  in_progress: { label: 'सुरू आहे', bg: '#FEF9C3', fg: '#854D0E', border: '#FDE68A' },
  done: { label: 'पूर्ण', bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
  overdue: { label: 'मुदत संपली', bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' }
};

export function activityStatus(status) {
  return ACTIVITY_STATUSES[status] || ACTIVITY_STATUSES.planned;
}

// The proof sent when an activity is marked done: the head count as a number, the note, an optional photo link.
export function completionPayload(form) {
  const out = {};
  const count = String(form.attendeeCount ?? '').trim();
  if (count !== '' && Number.isFinite(Number(count))) out.attendee_count = Number(count);
  const notes = String(form.notes ?? '').trim();
  if (notes) out.notes = notes;
  const photo = String(form.photoUrl ?? '').trim();
  if (photo) out.photo_url = photo;
  return out;
}

// The body of "create the yearly plan": the year and the targets that are whole numbers of zero or more.
export function planPayload(year, targets) {
  const out = {};
  Object.entries(targets || {}).forEach(([type, value]) => {
    const text = String(value ?? '').trim();
    if (text === '') return;
    const n = Number(text);
    if (Number.isInteger(n) && n >= 0) out[type] = n;
  });
  return { year, targets: out };
}

// May this member plan and record the unit's activities? An admin, or the owner or staff on their own unit.
export function canWriteActivities(unit, me) {
  if (!unit || !me?.permissions?.canWriteActivities) return false;
  return me.scopeKind === 'global' || ((me.scopeKind === 'unit' || me.scopeKind === 'staff') && me.unit?.id === unit.id);
}

// "3/12 पूर्ण · 12/12 प्रकार", or a note when the year has no plan yet.
export function progressLabel(progress) {
  if (!progress || !progress.total) return 'आराखडा नाही';
  return `${progress.done}/${progress.total} पूर्ण · ${progress.typesCovered}/${progress.typesRequired || 12} प्रकार नियोजित · ${progress.typesDone || 0} प्रकार पूर्ण`;
}

// The status the edit form starts with: the stored one (an overdue activity that was started stays "in progress").
export function editableStatus(activity) {
  const stored = activity?.storedStatus ?? activity?.status;
  return stored === 'in_progress' ? 'in_progress' : 'planned';
}

// A percentage as a whole number from 0 to 100 (anything that is not a number is 0), for a progress bar.
export function pctBar(pct) {
  const n = Number(pct);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// "2/12 प्रकार पूर्ण": how many of the 12 activity types the unit has finished at least once.
export function coverageLabel(own) {
  if (!own) return '—';
  return `${own.typesDone || 0}/12 प्रकार पूर्ण`;
}

// One table row of a roll-up: the unit and its own numbers, zeros where a number is missing.
export function rollupRow(entry) {
  const own = entry?.own || {};
  const unit = entry?.unit || {};
  return {
    id: unit.id,
    name: unit.name,
    levelLabel: levelLabel(unit.level),
    done: own.done || 0,
    total: own.total || 0,
    coveragePct: own.coveragePct || 0,
    completionPct: own.completionPct || 0,
    overdue: own.overdue || 0,
    achieved: own.achievedTotal || 0,
    target: own.targetTotal || 0
  };
}

// The name of the level just below a unit of this level ("शाखा" under a state), for a dashboard's child table.
export function childLevelLabel(level) {
  return { state: 'शाखा', branch: 'विभाग', division: 'जिल्हे', district: 'तालुके' }[level] || '';
}

const OWNER_DASHBOARDS = {
  state: { title: 'राज्य अध्यक्ष डॅशबोर्ड', icon: '🏛️', color: '#4f46e5' },
  branch: { title: 'शाखाध्यक्ष डॅशबोर्ड', icon: '🏢', color: '#c026d3' },
  division: { title: 'विभागीय अध्यक्ष डॅशबोर्ड', icon: '🗺️', color: '#7c3aed' },
  district: { title: 'जिल्हा अध्यक्ष डॅशबोर्ड', icon: '📍', color: '#0284c7' },
  taluka: { title: 'तालुका अध्यक्ष डॅशबोर्ड', icon: '🏘️', color: '#16a34a' }
};

// Which dashboard a person gets, from the /me answer: owners by the level of their unit, staff on their unit's desk,
// admin and CEO the top view. Nothing (null) for someone with no CRM access.
export function dashboardFor(me) {
  if (!me || me.scopeKind === 'none') return null;
  const base = { childLabel: '', readOnly: false, showRollup: false, canManageUnits: false };
  if (me.scopeKind === 'global') {
    if (me.permissions?.readOnly) {
      return { ...base, key: 'ceo', title: 'कार्याध्यक्ष (केवळ पाहणे)', icon: '👁️', color: '#2563eb', readOnly: true, showRollup: true };
    }
    return { ...base, key: 'admin', title: 'सर्वोच्च प्रशासक (CRM)', icon: '🛡️', color: '#ea580c', showRollup: true, canManageUnits: true };
  }
  if (me.scopeKind === 'staff') {
    return { ...base, key: 'staff', title: 'केंद्र कर्मचारी डेस्क', icon: '🧑‍💼', color: '#059669', readOnly: true };
  }
  const level = me.unit?.level;
  const d = OWNER_DASHBOARDS[level];
  if (me.scopeKind === 'unit' && d) {
    return { ...base, key: level, ...d, childLabel: childLevelLabel(level), canManageUnits: true };
  }
  return null;
}

// Where /crm sends a person: the dashboard, or nowhere when they have no CRM access.
export function crmHome(me) {
  return dashboardFor(me) ? '/crm/dashboard' : null;
}
