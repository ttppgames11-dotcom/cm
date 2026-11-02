import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS, levelLabel, childLevels, canEditUnit, canManageAbove, ownerQuery, unitPayload, breadcrumb
} from './crmUnitsHelp.js';

const writer = { readOnly: false, canCreateUnits: true, canCreateState: false };

test('levels are in ladder order with Marathi labels', () => {
  assert.deepEqual(LEVELS.map((l) => l.value), ['state', 'branch', 'division', 'district', 'taluka']);
  assert.equal(levelLabel('district'), 'जिल्हा');
  assert.equal(levelLabel('state'), 'राज्य');
  assert.equal(levelLabel('village'), 'village');
  assert.equal(levelLabel(undefined), '');
});

test('childLevels gives the one level directly below', () => {
  assert.deepEqual(childLevels('state', writer), ['branch']);
  assert.deepEqual(childLevels('branch', writer), ['division']);
  assert.deepEqual(childLevels('district', writer), ['taluka']);
  assert.deepEqual(childLevels('taluka', writer), []);
});

test('childLevels at the top needs canCreateState', () => {
  assert.deepEqual(childLevels(null, { ...writer, canCreateState: true }), ['state']);
  assert.deepEqual(childLevels(null, writer), []);
});

test('childLevels is empty for read only or missing permissions', () => {
  assert.deepEqual(childLevels('state', { ...writer, readOnly: true }), []);
  assert.deepEqual(childLevels('state', { readOnly: false, canCreateUnits: false }), []);
  assert.deepEqual(childLevels('state', undefined), []);
});

test('canEditUnit needs write rights and an active unit', () => {
  assert.equal(canEditUnit({ status: 'active' }, { permissions: writer }), true);
  assert.equal(canEditUnit({ status: 'archived' }, { permissions: writer }), false);
  assert.equal(canEditUnit({ status: 'active' }, { permissions: { ...writer, readOnly: true } }), false);
  assert.equal(canEditUnit({ status: 'active' }, null), false);
});

test('canManageAbove is true only for someone above the unit', () => {
  const owner = { scopeKind: 'unit', unit: { id: 'U-B1', path: '/U-S/U-B1/' }, permissions: writer };
  assert.equal(canManageAbove({ id: 'U-D1', path: '/U-S/U-B1/U-D1/' }, owner), true);
  assert.equal(canManageAbove({ id: 'U-B1', path: '/U-S/U-B1/' }, owner), false);
  assert.equal(canManageAbove({ id: 'U-B10', path: '/U-S/U-B10/' }, owner), false);
  const admin = { scopeKind: 'global', permissions: writer };
  assert.equal(canManageAbove({ id: 'U-S', path: '/U-S/' }, admin), true);
  const ceo = { scopeKind: 'global', permissions: { ...writer, readOnly: true } };
  assert.equal(canManageAbove({ id: 'U-S', path: '/U-S/' }, ceo), false);
  assert.equal(canManageAbove({ id: 'U-S', path: '/U-S/' }, { scopeKind: 'none', permissions: writer }), false);
});

test('ownerQuery tells a phone from a member id', () => {
  assert.deepEqual(ownerQuery(' 98765-00021 '), { phone: '9876500021' });
  assert.deepEqual(ownerQuery('98765 00021'), { phone: '9876500021' });
  assert.deepEqual(ownerQuery('+91 98765 00021'), { phone: '9876500021' });
  assert.deepEqual(ownerQuery(' M4521 '), { member: 'M4521' });
  assert.deepEqual(ownerQuery(''), {});
  assert.deepEqual(ownerQuery(undefined), {});
});

test('unitPayload trims, drops empty values and builds the owner', () => {
  assert.deepEqual(
    unitPayload({ level: 'branch', parentId: 'U-S', name: '  Pune  ', address: '  ', owner: ' M4521 ', junk: 1 }),
    { level: 'branch', parent_id: 'U-S', name: 'Pune', owner: { member: 'M4521' } }
  );
  assert.deepEqual(unitPayload({ level: 'state', name: 'Maharashtra', address: 'Mumbai', owner: '9876500021' }),
    { level: 'state', name: 'Maharashtra', address: 'Mumbai', owner: { phone: '9876500021' } });
  assert.deepEqual(unitPayload({ name: ' New name ', address: ' Road 1 ' }), { name: 'New name', address: 'Road 1' });
});

test('breadcrumb lists the chain above the unit, then the unit', () => {
  assert.deepEqual(breadcrumb({ name: 'Pune' }, [{ name: 'Maharashtra' }, { name: 'Pune Branch' }]), ['Maharashtra', 'Pune Branch', 'Pune']);
  assert.deepEqual(breadcrumb({ name: 'Pune' }), ['Pune']);
  assert.deepEqual(breadcrumb(null), []);
});

test('canManageStaff is true for an admin and for the owner on their own unit only', async () => {
  const { canManageStaff } = await import('./crmUnitsHelp.js');
  const admin = { scopeKind: 'global', permissions: { canManageStaff: true } };
  const owner = { scopeKind: 'unit', unit: { id: 'U-D1' }, permissions: { canManageStaff: true } };
  assert.equal(canManageStaff({ id: 'U-D1' }, admin), true);
  assert.equal(canManageStaff({ id: 'U-D1' }, owner), true);
  assert.equal(canManageStaff({ id: 'U-T1' }, owner), false);
  assert.equal(canManageStaff({ id: 'U-D1' }, { scopeKind: 'staff', unit: { id: 'U-D1' }, permissions: { canManageStaff: false } }), false);
  assert.equal(canManageStaff({ id: 'U-D1' }, { scopeKind: 'global', permissions: { canManageStaff: false } }), false);
  assert.equal(canManageStaff(null, admin), false);
  assert.equal(canManageStaff({ id: 'U-D1' }, null), false);
});

test('staffSlotsLeft counts the free seats and never goes below zero', async () => {
  const { staffSlotsLeft } = await import('./crmUnitsHelp.js');
  assert.equal(staffSlotsLeft({ staff: [1, 2, 3], max: 10 }), 7);
  assert.equal(staffSlotsLeft({ staff: new Array(10).fill(0), max: 10 }), 0);
  assert.equal(staffSlotsLeft({ staff: new Array(12).fill(0), max: 10 }), 0);
  assert.equal(staffSlotsLeft({ staff: [], max: 10 }), 10);
  assert.equal(staffSlotsLeft(null), 0);
});

test('activityStatus has Marathi labels and falls back to planned', async () => {
  const { activityStatus } = await import('./crmUnitsHelp.js');
  assert.equal(activityStatus('overdue').label, 'मुदत संपली');
  assert.equal(activityStatus('done').label, 'पूर्ण');
  assert.equal(activityStatus('in_progress').label, 'सुरू आहे');
  assert.equal(activityStatus('planned').label, 'नियोजित');
  assert.equal(activityStatus('weird').label, 'नियोजित');
  assert.equal(activityStatus(undefined).label, 'नियोजित');
});

test('completionPayload sends the head count as a number and drops an empty photo', async () => {
  const { completionPayload } = await import('./crmUnitsHelp.js');
  assert.deepEqual(completionPayload({ attendeeCount: ' 40 ', notes: ' ok done ', photoUrl: '' }), { attendee_count: 40, notes: 'ok done' });
  assert.deepEqual(completionPayload({ attendeeCount: 5, notes: 'abc', photoUrl: ' https://x.com/a.jpg ' }),
    { attendee_count: 5, notes: 'abc', photo_url: 'https://x.com/a.jpg' });
  assert.equal(completionPayload({ attendeeCount: '', notes: 'abc' }).attendee_count, undefined);
});

test('planPayload keeps only whole numbers of zero or more', async () => {
  const { planPayload } = await import('./crmUnitsHelp.js');
  assert.deepEqual(planPayload(2090, { blood_donation: '120', job_fair: '', x: -5, y: 'abc', z: 0 }),
    { year: 2090, targets: { blood_donation: 120, z: 0 } });
  assert.deepEqual(planPayload(2091, undefined), { year: 2091, targets: {} });
});

test('canWriteActivities is true for an admin and for the owner or staff on their own unit', async () => {
  const { canWriteActivities } = await import('./crmUnitsHelp.js');
  const perm = { canWriteActivities: true };
  assert.equal(canWriteActivities({ id: 'U-D1' }, { scopeKind: 'global', permissions: perm }), true);
  assert.equal(canWriteActivities({ id: 'U-D1' }, { scopeKind: 'unit', unit: { id: 'U-D1' }, permissions: perm }), true);
  assert.equal(canWriteActivities({ id: 'U-D1' }, { scopeKind: 'staff', unit: { id: 'U-D1' }, permissions: perm }), true);
  assert.equal(canWriteActivities({ id: 'U-T1' }, { scopeKind: 'unit', unit: { id: 'U-D1' }, permissions: perm }), false);
  assert.equal(canWriteActivities({ id: 'U-D1' }, { scopeKind: 'global', permissions: { canWriteActivities: false } }), false);
  assert.equal(canWriteActivities(null, { scopeKind: 'global', permissions: perm }), false);
  assert.equal(canWriteActivities({ id: 'U-D1' }, null), false);
});

test('progressLabel shows done of total and the types covered', async () => {
  const { progressLabel } = await import('./crmUnitsHelp.js');
  assert.equal(progressLabel({ total: 12, done: 3, typesCovered: 12, typesRequired: 12 }), '3/12 पूर्ण · 12/12 प्रकार');
  assert.equal(progressLabel({ total: 0, done: 0, typesCovered: 0, typesRequired: 12 }), 'आराखडा नाही');
  assert.equal(progressLabel(null), 'आराखडा नाही');
});
