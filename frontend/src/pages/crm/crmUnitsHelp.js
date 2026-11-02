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
