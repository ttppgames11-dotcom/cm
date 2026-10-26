// CRM hierarchy, user management and yearly-activity API tests.
//
// Run against a SCRATCH copy of backend/ + database/ (the test creates users and units):
//   SUPERADMIN_BOOTSTRAP_PASSWORD=... JWT_SECRET=... PORT=5000 node server.js     (in the scratch backend/)
//   CM_TEST_SUPERADMIN_PASSWORD=... node test-crm-hierarchy.mjs
// Optional: CM_API_BASE (default http://localhost:5000/api), CM_TEST_SUPERADMIN_ID (default CM-SUPER-001).
// Each request carries its own X-Forwarded-For so the login rate limiter (15 per IP) does not interfere.

const BASE = process.env.CM_API_BASE || 'http://localhost:5000/api';
const SUPER_ID = process.env.CM_TEST_SUPERADMIN_ID || 'CM-SUPER-001';
const SUPER_PW = process.env.CM_TEST_SUPERADMIN_PASSWORD;

let ipCounter = 10;
async function request(endpoint, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json', 'X-Forwarded-For': `10.77.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}` };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, data: {}, error: err.message };
  }
}

let passed = 0;
let failed = 0;
function assert(cond, name, extra) {
  if (cond) { console.log(`✅ PASS: ${name}`); passed++; }
  else { console.error(`❌ FAIL: ${name}`, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400)); failed++; }
}

const runId = Date.now().toString().slice(-6);
let phoneSeq = 0;
const newPhone = () => `9${runId}${String(phoneSeq++).padStart(3, '0')}`.slice(0, 10);
const PW = 'Test-Pass-2026';
const PW2 = 'Another-Pass-2027';

async function login(identifier, password) {
  const r = await request('/auth/login', { method: 'POST', body: { identifier, password } });
  return { ...r, token: r.data?.token, member: r.data?.member };
}

const created = { users: [], units: [] };
async function makeUnit(token, level, parentId, name, extra = {}) {
  const phone = newPhone();
  const r = await request('/crm-hierarchy/units', {
    method: 'POST', token,
    body: { level, parentId, name, ...extra, owner: { name: `${name} मालक`, phone, password: PW } }
  });
  if (r.ok) { created.units.push(r.data.data.unit.id); created.users.push(r.data.data.owner.id); }
  return { ...r, unit: r.data?.data?.unit, owner: r.data?.data?.owner, phone };
}

async function main() {
  console.log('🚀 Starting CRM hierarchy, user-management and activity tests...\n');

  const health = await request('/health');
  if (!health.ok) { console.error('⚠️ Backend is not running on', BASE); process.exit(2); }
  if (!SUPER_PW) { console.error('⚠️ Set CM_TEST_SUPERADMIN_PASSWORD'); process.exit(2); }

  // ───────────────────────── 1. Login hardening ─────────────────────────
  console.log('— Login hardening —');
  for (const bad of ['password123', 'admin1674', 'superadmin1674', 'admin123']) {
    const r = await login(SUPER_ID, bad);
    assert(r.status === 401, `master/default password "${bad}" is rejected`, r.data);
  }
  assert((await request('/auth/login', { method: 'POST', body: { identifier: SUPER_ID } })).status === 400, 'login without a password is rejected');
  assert((await login('9876500000', 'superadmin1674')).status === 401, 'old hardcoded official profile no longer logs in');
  const sa = await login(SUPER_ID, SUPER_PW);
  assert(sa.ok && sa.token && sa.member?.role === 'superadmin', 'superadmin logs in with the real password', sa.data);
  assert(!JSON.stringify(sa.data).includes('password_hash'), 'login response has no password_hash');
  const S = sa.token;

  // ───────────────────────── 2. Users: create / role / reset / disable ─────────────────────────
  console.log('\n— Admin user management —');
  const base = { name: `Test User ${runId}`, phone: newPhone(), role: 'member' };
  let r = await request('/admin/users', { method: 'POST', token: S, body: base });
  assert(r.status === 400, 'create user without a password is rejected (no default password)', r.data);
  r = await request('/admin/users', { method: 'POST', token: S, body: { ...base, password: 'short' } });
  assert(r.status === 400, 'create user with a 5-char password is rejected', r.data);
  r = await request('/admin/users', { method: 'POST', token: S, body: { ...base, password: PW, role: 'galactic_emperor' } });
  assert(r.status === 400, 'create user with an unknown role is rejected', r.data);
  r = await request('/admin/users', { method: 'POST', token: S, body: { ...base, password: PW } });
  assert(r.status === 201 && r.data?.data?.user?.id, 'superadmin creates a user with a valid password', r.data);
  const u1 = r.data?.data?.user;
  if (u1) created.users.push(u1.id);
  assert(u1 && !('password_hash' in u1) && !('tokenVersion' in u1), 'created user response hides password_hash/tokenVersion', u1);
  r = await request('/admin/users', { method: 'POST', token: S, body: { ...base, name: 'Dup', password: PW } });
  assert(r.status === 409, 'duplicate phone is rejected', r.data);

  let l = await login(base.phone, PW);
  assert(l.ok && l.member?.role === 'member', 'new user logs in with phone + password', l.data);
  assert((await login(base.phone, 'password123')).status === 401, 'new user cannot log in with password123');
  assert((await login(base.phone, 'wrong-password')).status === 401, 'new user cannot log in with a wrong password');
  const u1Token = l.token;
  let me = await request('/auth/me', { token: u1Token });
  assert(me.ok && me.data?.member?.id === u1?.id, '/auth/me works for an admin-created user', me.data);
  assert((await request('/admin/users', { method: 'POST', token: u1Token, body: { ...base, phone: newPhone(), password: PW } })).status === 403, 'a normal member cannot create users');

  // mass assignment must not let a PUT inject privileged fields
  r = await request(`/admin/users/${u1.id}`, { method: 'PUT', token: S, body: { name: 'Renamed', password_hash: 'x', unitId: 'UNIT-FAKE', tokenVersion: 99 } });
  assert(r.ok, 'PUT users/:id accepts a plain rename', r.data);
  const fresh = await request(`/admin/users/${u1.id}`, { token: S });
  assert(fresh.data?.data?.user?.name === 'Renamed' && !fresh.data?.data?.user?.unitId, 'PUT ignores unitId / password_hash / tokenVersion', fresh.data);
  assert((await login(base.phone, PW)).ok, 'password still works after the mass-assignment attempt');

  // role change takes effect on the existing token straight away
  r = await request(`/admin/users/${u1.id}`, { method: 'PUT', token: S, body: { role: 'district_admin' } });
  assert(r.ok && r.data?.data?.user?.role === 'district_admin', 'superadmin edits the role', r.data);
  l = await login(base.phone, PW);
  assert(l.member?.role === 'district_admin', 'next login returns the new role', l.data);
  r = await request(`/admin/users/${u1.id}`, { method: 'PUT', token: S, body: { role: 'superadmin' } });
  assert(r.ok, 'superadmin may grant superadmin');
  r = await request(`/admin/users/${u1.id}`, { method: 'PUT', token: S, body: { role: 'member' } });
  assert(r.ok, 'role can be set back to member');

  // reset password
  const oldToken = (await login(base.phone, PW)).token;
  r = await request(`/admin/users/${u1.id}/reset-password`, { method: 'POST', token: S, body: { password: 'tiny' } });
  assert(r.status === 400, 'reset-password rejects a short password', r.data);
  r = await request(`/admin/users/${u1.id}/reset-password`, { method: 'POST', token: S, body: { password: PW2 } });
  assert(r.ok, 'superadmin resets the password', r.data);
  assert((await login(base.phone, PW)).status === 401, 'old password stops working');
  assert((await login(base.phone, PW2)).ok, 'new password works');
  assert((await request('/auth/me', { token: oldToken })).status === 401, 'session issued before the reset is revoked');

  // disable / enable
  const liveToken = (await login(base.phone, PW2)).token;
  r = await request(`/admin/users/${u1.id}/status`, { method: 'POST', token: S, body: { disabled: true } });
  assert(r.ok && r.data?.data?.user?.status === 'disabled', 'superadmin disables the user', r.data);
  assert((await login(base.phone, PW2)).status === 403, 'disabled user cannot log in');
  assert((await request('/auth/me', { token: liveToken })).status === 403, 'disabled user token is refused');
  r = await request(`/admin/users/${u1.id}/status`, { method: 'POST', token: S, body: { disabled: false } });
  assert(r.ok, 'superadmin re-enables the user');
  assert((await login(base.phone, PW2)).ok, 'enabled user logs in again');
  assert((await request(`/admin/users/${SUPER_ID}/status`, { method: 'POST', token: S, body: { disabled: true } })).status === 400, 'superadmin cannot disable themselves');

  // profile edit and account deletion need proof of ownership
  const noAuthPut = await request(`/members/${u1.id}`, { method: 'PUT', body: { name: 'Hijacked' } });
  assert(noAuthPut.status === 401, 'anonymous PUT /members/:id is refused', noAuthPut.data);
  const otherPut = await request(`/members/${SUPER_ID}`, { method: 'PUT', token: (await login(base.phone, PW2)).token, body: { name: 'Hijacked' } });
  assert(otherPut.status === 403, "a member cannot edit someone else's profile", otherPut.data);
  const delBody = (extra) => ({ method: 'DELETE', body: { identifier: base.phone, confirm: 'DELETE', ...extra } });
  assert((await request('/auth/delete-account', delBody({}))).status === 401, 'delete-account without a password is refused');
  assert((await request('/auth/delete-account', delBody({ password: 'wrong-password' }))).status === 401, 'delete-account with a wrong password is refused');
  assert((await request('/auth/delete-account', { method: 'DELETE', body: { identifier: u1.id.slice(0, 8), confirm: 'DELETE', password: PW2 } })).status !== 200 || (await login(base.phone, PW2)).ok, 'a partial id does not match another account');
  assert((await login(base.phone, PW2)).ok, 'account still exists after the refused deletions');

  // ───────────────────────── 3. Hierarchy creation ─────────────────────────
  console.log('\n— Unit hierarchy —');
  const tag = `${runId}`;
  const st = await makeUnit(S, 'state', null, `महाराष्ट्र ${tag}`);
  assert(st.status === 201 && st.unit?.level === 'state' && st.owner?.role === 'state_admin', 'superadmin creates a state unit with an owner', st.data);
  const st2 = await makeUnit(S, 'state', null, `कर्नाटक ${tag}`);
  assert(st2.status === 201, 'superadmin creates a second state', st2.data);
  const noOwner = await request('/crm-hierarchy/units', { method: 'POST', token: S, body: { level: 'branch', parentId: st.unit.id, name: 'No owner' } });
  assert(noOwner.status === 400, 'a unit without owner details is rejected', noOwner.data);
  const weakOwner = await request('/crm-hierarchy/units', { method: 'POST', token: S, body: { level: 'branch', parentId: st.unit.id, name: 'Weak', owner: { name: 'W', phone: newPhone(), password: '1234567' } } });
  assert(weakOwner.status === 400, 'an owner with a 7-char password is rejected', weakOwner.data);
  assert(!(await request('/crm-hierarchy/units', { token: S })).data.data.units.some(u => u.name === 'Weak'), 'no half-created unit is left behind after a rejected owner');

  const stOwner = await login(st.phone, PW);
  assert(stOwner.ok && stOwner.member?.unitId === st.unit.id, 'state owner logs in and carries the unit id', stOwner.data);
  const SO = stOwner.token;
  assert((await makeUnit(SO, 'state', null, `अवैध राज्य ${tag}`)).status === 403, 'a state owner cannot create another state');

  const br = await makeUnit(SO, 'branch', st.unit.id, `पुणे शाखा ${tag}`);
  assert(br.status === 201 && br.unit?.parentId === st.unit.id, 'state owner creates a branch below the state', br.data);
  const dv = await makeUnit((await login(br.phone, PW)).token, 'division', br.unit.id, `पुणे विभाग ${tag}`, { division: `पुणे विभाग ${tag}` });
  assert(dv.status === 201, 'branch owner creates a division', dv.data);
  const DVO = (await login(dv.phone, PW)).token;
  const di = await makeUnit(DVO, 'district', dv.unit.id, `पुणे ${tag}`, { district: `पुणे ${tag}` });
  assert(di.status === 201 && di.unit.division, 'division owner creates a district (division inherited)', di.data);
  const DIO = (await login(di.phone, PW)).token;
  const ta1 = await makeUnit(DIO, 'taluka', di.unit.id, `हवेली ${tag}`, { taluka: `हवेली ${tag}` });
  const ta2 = await makeUnit(DIO, 'taluka', di.unit.id, `मावळ ${tag}`, { taluka: `मावळ ${tag}` });
  assert(ta1.status === 201 && ta2.status === 201, 'district owner creates two talukas', [ta1.data, ta2.data]);
  assert(ta1.unit.ancestorIds.length === 4 && ta1.unit.ancestorIds[0] === st.unit.id, 'taluka keeps its full ancestor chain', ta1.unit);
  const T1O = (await login(ta1.phone, PW)).token;
  const T2O = (await login(ta2.phone, PW)).token;

  const wrongOrder = await request('/crm-hierarchy/units', { method: 'POST', token: T1O, body: { level: 'district', parentId: ta1.unit.id, name: 'x', owner: { name: 'x', phone: newPhone(), password: PW } } });
  assert(wrongOrder.status === 400, 'a district cannot be created under a taluka', wrongOrder.data);
  const cross = await request('/crm-hierarchy/units', { method: 'POST', token: T1O, body: { level: 'taluka', parentId: ta2.unit.id, name: 'Sneaky', owner: { name: 'x', phone: newPhone(), password: PW } } });
  assert([403, 404].includes(cross.status), 'a taluka owner cannot create a unit under another taluka', cross.data);
  const otherStateChild = await makeUnit(DIO, 'branch', st2.unit.id, 'Sneaky2');
  assert([403, 404].includes(otherStateChild.status), 'a district owner cannot create a unit under another state', otherStateChild.data);
  const dupSibling = await makeUnit(DIO, 'taluka', di.unit.id, `हवेली ${tag}`, { taluka: 'x' });
  assert(dupSibling.status === 409, 'duplicate sibling name is rejected', dupSibling.data);

  // ───────────────────────── 4. Staff accounts ─────────────────────────
  console.log('\n— Staff accounts —');
  const staffPhone = newPhone();
  let s1 = await request(`/crm-hierarchy/units/${ta1.unit.id}/staff`, { method: 'POST', token: T1O, body: { name: 'Staff One', phone: staffPhone, password: PW } });
  assert(s1.status === 201 && s1.data?.data?.staff?.role === 'center_staff', 'taluka owner creates a staff login', s1.data);
  const staff1 = s1.data?.data?.staff;
  if (staff1) created.users.push(staff1.id);
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}/staff`, { method: 'POST', token: T1O, body: { name: 'NoPw', phone: newPhone() } })).status === 400, 'staff without a password is rejected');
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}/staff`, { method: 'POST', token: T2O, body: { name: 'Intruder', phone: newPhone(), password: PW } })).status === 404, "another taluka's owner cannot create staff here");
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}/staff`, { method: 'POST', token: DIO, body: { name: 'Parent', phone: newPhone(), password: PW } })).status === 403, "a parent owner cannot create staff in a child unit (own unit only)");
  const stf = await login(staffPhone, PW);
  assert(stf.ok && stf.member?.unitRole === 'staff' && stf.member?.unitId === ta1.unit.id, 'staff logs in bound to the taluka unit', stf.data);
  const ST = stf.token;
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}/staff`, { method: 'POST', token: ST, body: { name: 'Staff2', phone: newPhone(), password: PW } })).status === 403, 'staff cannot create staff');
  assert([403, 404].includes((await makeUnit(ST, 'taluka', di.unit.id, 'StaffUnit')).status), 'staff cannot create units under the district');
  assert((await makeUnit(ST, 'taluka', ta1.unit.id, 'StaffUnit2')).status === 403, 'staff cannot create units under their own unit either');
  const staffOfOther = await request(`/crm-hierarchy/units/${ta2.unit.id}/staff`, { token: ST });
  assert(staffOfOther.status === 404, 'staff cannot list another unit\'s staff', staffOfOther.data);
  assert((await request('/admin/users', { token: ST })).status === 403, 'staff cannot open the admin users list');

  // ───────────────────────── 5. Scope ─────────────────────────
  console.log('\n— Scope enforcement —');
  const ids = async (token) => (await request('/crm-hierarchy/units', { token })).data?.data?.units?.map(u => u.id) || [];
  const sSuper = await ids(S);
  assert([st, br, dv, di, ta1, ta2, st2].every(x => sSuper.includes(x.unit.id)), 'superadmin sees every unit');
  const sState = await ids(SO);
  assert([st, br, dv, di, ta1, ta2].every(x => sState.includes(x.unit.id)) && !sState.includes(st2.unit.id), 'state owner sees own state tree and not the other state');
  const sDist = await ids(DIO);
  assert(sDist.length === 3 && sDist.includes(di.unit.id) && sDist.includes(ta1.unit.id) && sDist.includes(ta2.unit.id), 'district owner sees district + talukas only', sDist);
  const sT2 = await ids(T2O);
  assert(sT2.length === 1 && sT2[0] === ta2.unit.id, 'taluka-2 owner sees only taluka 2', sT2);
  const sStaff = await ids(ST);
  assert(sStaff.length === 1 && sStaff[0] === ta1.unit.id, 'staff sees only their own unit', sStaff);
  const sSt2 = await ids((await login(st2.phone, PW)).token);
  assert(sSt2.length === 1 && sSt2[0] === st2.unit.id, 'other state owner sees only the other state', sSt2);
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}`, { token: T2O })).status === 404, 'taluka-2 owner gets 404 for taluka 1');
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}`, { method: 'PUT', token: T2O, body: { name: 'Hacked' } })).status === 404, 'taluka-2 owner cannot edit taluka 1');
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}`, { method: 'PUT', token: ST, body: { name: 'Hacked' } })).status === 403, 'staff cannot rename their unit');
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}`, { method: 'PUT', token: T1O, body: { address: 'नवा पत्ता' } })).ok, 'owner can edit own unit address');
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}`, { method: 'PUT', token: T1O, body: { status: 'archived' } })).status === 403, 'an owner cannot archive their own unit');

  const plain = await login(base.phone, PW2);
  assert((await request('/crm-hierarchy/units', { token: plain.token })).status === 403, 'a plain member has no CRM access');
  assert((await request('/crm-hierarchy/units')).status === 401, 'unauthenticated request is refused');

  // a district admin only sees members of their own district in the admin users list
  const duAll = await request('/admin/users', { token: S });
  const duOwn = await request('/admin/users', { token: DIO });
  assert(duOwn.ok && duOwn.data.data.users.every(u => u.district === di.unit.district) && duOwn.data.data.users.length < duAll.data.data.users.length, 'district admin sees only their own district in /admin/users', duOwn.data?.data?.users?.length);
  assert((await request(`/admin/users/${stOwner.member.id}`, { token: DIO })).status === 404, 'district admin cannot open a member of another district');

  // legacy endpoints share the same scope
  const legacy = async (token) => (await request('/admin/community-centers', { token })).data?.data?.centers?.map(c => c.id) || [];
  const lSuper = await legacy(S);
  assert(lSuper.includes(ta1.unit.id) && lSuper.includes(ta2.unit.id), 'legacy /admin/community-centers lists units for superadmin');
  const lT2 = await legacy(T2O);
  assert(lT2.includes(ta2.unit.id) && !lT2.includes(ta1.unit.id), 'legacy /admin/community-centers is scoped for a taluka owner', lT2);
  assert((await request(`/admin/community-centers/${ta1.unit.id}`, { method: 'PUT', token: T2O, body: { address: 'x' } })).status === 404, 'legacy PUT on another taluka is refused');
  assert((await request('/admin/community-centers', { method: 'POST', token: T2O, body: { name: 'Rogue', district: 'पुणे' } })).status === 403, 'legacy POST by a taluka owner is refused');
  assert((await request('/admin/center-action', { method: 'POST', token: T2O, body: { centerId: ta1.unit.id, actionType: 'visitor_checkin' } })).status === 404, 'legacy center-action on another taluka is refused');
  assert((await request('/admin/center-action', { method: 'POST', token: T1O, body: { centerId: ta1.unit.id, actionType: 'visitor_checkin' } })).ok, 'legacy center-action on own unit works');
  assert((await request(`/admin/community-centers/${ta1.unit.id}`, { method: 'DELETE', token: T1O })).status === 403, 'owner cannot delete a center through the legacy route');
  const dash = await request('/crm/unified-dashboard?scope=pradesh', { token: T1O });
  assert(dash.ok && dash.data?.data?.communityCenters !== undefined, 'unified-dashboard answers for a taluka owner');
  assert(!(dash.data?.data?.communityCenters || []).some(c => c.id === ta2.unit.id), 'unified-dashboard ignores ?scope=pradesh for a scoped user', dash.data?.data?.communityCenters?.map(c => c.id));

  // ───────────────────────── 6. Activities ─────────────────────────
  console.log('\n— Yearly activities —');
  const year = new Date().getFullYear();
  const types = (await request('/crm-hierarchy/activity-types', { token: S })).data?.data?.types || [];
  assert(types.length === 12 && types.every(t => t.mr && t.en && t.key), 'catalogue has the 12 activities with Marathi labels', types.length);
  assert((await request(`/crm-hierarchy/units/${ta1.unit.id}/plan`, { method: 'POST', token: T2O, body: { year } })).status === 404, 'taluka-2 owner cannot create a plan for taluka 1');
  r = await request(`/crm-hierarchy/units/${ta1.unit.id}/plan`, { method: 'POST', token: ST, body: { year, targets: { blood_donation: 150 } } });
  assert(r.status === 201 && r.data?.data?.created?.length === 12, 'staff generates the 12-activity yearly plan', r.data);
  const planned = r.data?.data?.created || [];
  assert(planned.find(a => a.type === 'blood_donation')?.targetCount === 150, 'custom target is applied');
  assert(new Set(planned.map(a => a.type)).size === 12, 'plan has each of the 12 types once');
  r = await request(`/crm-hierarchy/units/${ta1.unit.id}/plan`, { method: 'POST', token: ST, body: { year } });
  assert(r.status === 201 && r.data?.data?.created?.length === 0 && r.data?.data?.skipped === 12, 'planning twice does not duplicate', r.data);

  const act = planned.find(a => a.type === 'health_checkup');
  assert((await request(`/crm-hierarchy/activities/${act.id}/complete`, { method: 'POST', token: ST, body: {} })).status === 400, 'completing without proof is rejected');
  assert((await request(`/crm-hierarchy/activities/${act.id}/complete`, { method: 'POST', token: ST, body: { attendeeCount: 50, notes: 'ok', photoUrl: 'javascript:alert(1)' } })).status === 400, 'javascript: photo URL is rejected');
  assert((await request(`/crm-hierarchy/activities/${act.id}/complete`, { method: 'POST', token: T2O, body: { attendeeCount: 5, notes: 'sneaky proof' } })).status === 404, 'another taluka cannot complete this activity');
  assert((await request(`/crm-hierarchy/activities/${act.id}`, { method: 'PUT', token: T2O, body: { notes: 'x' } })).status === 404, 'another taluka cannot edit this activity');
  assert((await request(`/crm-hierarchy/activities/${act.id}`, { method: 'PUT', token: ST, body: { status: 'done' } })).status === 400, 'status=done through PUT is refused (proof required)');
  r = await request(`/crm-hierarchy/activities/${act.id}`, { method: 'PUT', token: ST, body: { status: 'in_progress' } });
  assert(r.ok && r.data?.data?.activity?.status !== 'done', 'staff moves an activity to in_progress', r.data);
  r = await request(`/crm-hierarchy/activities/${act.id}/complete`, { method: 'POST', token: ST, body: { attendeeCount: 120, notes: 'हवेली आरोग्य शिबीर यशस्वी', photoUrl: 'https://example.com/photo.jpg' } });
  assert(r.ok && r.data?.data?.activity?.status === 'done' && r.data.data.activity.attendeeCount === 120, 'staff completes an activity with proof', r.data);
  assert((await request(`/crm-hierarchy/activities/${act.id}`, { method: 'DELETE', token: ST })).status === 403, 'staff cannot delete an activity');

  const past = await request('/crm-hierarchy/activities', { method: 'POST', token: T1O, body: { unitId: ta1.unit.id, type: 'food_expo', scheduledDate: `${year}-01-01`, targetCount: 30 } });
  assert(past.ok, 'owner logs an extra activity', past.data);
  const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 3);
  const pd = pastDate.toISOString().slice(0, 10);
  const od = await request('/crm-hierarchy/activities', { method: 'POST', token: T1O, body: { unitId: ta1.unit.id, type: 'krushi_sabha', scheduledDate: pd, targetCount: 40 } });
  assert(od.ok && od.data?.data?.activity?.status === 'overdue' && od.data.data.activity.rawStatus === 'planned', 'a past, unfinished activity shows as overdue', od.data);
  assert((await request('/crm-hierarchy/activities', { method: 'POST', token: T2O, body: { unitId: ta1.unit.id, type: 'food_expo', scheduledDate: `${year}-05-05`, targetCount: 1 } })).status === 404, 'another taluka cannot log an activity here');
  assert((await request('/crm-hierarchy/activities', { method: 'POST', token: ST, body: { unitId: ta1.unit.id, type: 'bogus', scheduledDate: `${year}-05-05` } })).status === 400, 'unknown activity type is rejected');
  assert((await request('/crm-hierarchy/activities', { method: 'POST', token: ST, body: { unitId: ta1.unit.id, type: 'food_expo', scheduledDate: 'tomorrow' } })).status === 400, 'bad date is rejected');
  assert((await request(`/crm-hierarchy/activities/${od.data.data.activity.id}`, { method: 'DELETE', token: T1O })).ok, 'owner deletes an activity');

  const list = await request(`/crm-hierarchy/activities?unitId=${ta1.unit.id}&year=${year}`, { token: ST });
  assert(list.ok && list.data.data.count >= 13 && list.data.data.activities.some(a => a.status === 'done'), 'activity list returns plan + extras', list.data?.data?.count);
  assert((await request(`/crm-hierarchy/activities?unitId=${ta1.unit.id}&year=${year}`, { token: T2O })).status === 404, 'activity list of another taluka is refused');
  const t2all = await request(`/crm-hierarchy/activities?year=${year}`, { token: T2O });
  assert(t2all.ok && t2all.data.data.activities.every(a => a.unitId === ta2.unit.id), 'unfiltered activity list only contains own-unit rows');

  // ───────────────────────── 7. Summary + roll-up ─────────────────────────
  console.log('\n— Summary and roll-up —');
  r = await request(`/crm-hierarchy/summary?unitId=${ta1.unit.id}&year=${year}`, { token: T1O });
  assert(r.ok && r.data.data.own.done === 1 && r.data.data.own.typesCovered === 1 && r.data.data.own.coveragePct === 8, 'taluka summary: 1 of 12 types covered (8%)', r.data?.data?.own);
  assert(r.data.data.own.achievedTotal === 120, 'summary counts attendees as achieved', r.data?.data?.own);
  assert(r.data.data.own.byType.health_checkup.done === 1, 'summary has a per-type breakdown');
  r = await request(`/crm-hierarchy/summary?unitId=${di.unit.id}&year=${year}`, { token: DIO });
  assert(r.ok && r.data.data.rollup.done === 1 && r.data.data.rollup.unitsCount === 3 && r.data.data.own.total === 0, 'district roll-up includes the taluka', r.data?.data?.rollup);
  assert(r.data.data.children.length === 2 && r.data.data.children.some(c => c.rollup.done === 1), 'district summary lists child units with their progress');
  r = await request(`/crm-hierarchy/summary?year=${year}`, { token: SO });
  assert(r.ok && r.data.data.rollup.done === 1 && r.data.data.rollup.unitsCount === 6, 'state roll-up sums the whole tree', r.data?.data?.rollup);
  r = await request(`/crm-hierarchy/summary?year=${year}`, { token: T2O });
  assert(r.ok && r.data.data.rollup.done === 0 && r.data.data.rollup.unitsCount === 1, "taluka-2 summary does not include taluka 1's work", r.data?.data?.rollup);
  assert((await request(`/crm-hierarchy/summary?unitId=${ta1.unit.id}`, { token: T2O })).status === 404, "taluka-2 owner cannot request taluka 1's summary");
  r = await request(`/crm-hierarchy/rollup?year=${year}`, { token: SO });
  const lv = r.data?.data?.levels || [];
  assert(r.ok && lv.map(x => x.level).join() === 'state,branch,division,district,taluka', 'roll-up by level lists all five levels', lv.map(x => x.level));
  assert(lv.find(x => x.level === 'taluka')?.totals.done === 1 && lv.find(x => x.level === 'state')?.unitsCount === 1, 'roll-up by level has totals per level');
  r = await request(`/crm-hierarchy/rollup?year=${year}&level=taluka`, { token: T2O });
  assert(r.ok && r.data.data.levels.length === 1 && r.data.data.levels[0].unitsCount === 1, 'roll-up by level is scoped for a taluka owner', r.data?.data);

  // ───────────────────────── 8. Staff lifecycle + role fresh-check ─────────────────────────
  console.log('\n— Staff lifecycle —');
  r = await request(`/crm-hierarchy/units/${ta1.unit.id}/staff/${staff1.id}`, { method: 'PUT', token: T2O, body: { disabled: true } });
  assert(r.status === 404, "another taluka's owner cannot disable this staff member");
  r = await request(`/crm-hierarchy/units/${ta1.unit.id}/staff/${staff1.id}`, { method: 'PUT', token: T1O, body: { password: PW2 } });
  assert(r.ok, 'owner resets a staff password', r.data);
  assert((await login(staffPhone, PW)).status === 401 && (await login(staffPhone, PW2)).ok, 'staff password reset works');
  assert((await request('/crm-hierarchy/units', { token: ST })).status === 401, 'staff token from before the reset is revoked');
  const ST2 = (await login(staffPhone, PW2)).token;
  r = await request(`/crm-hierarchy/units/${ta1.unit.id}/staff/${staff1.id}`, { method: 'PUT', token: T1O, body: { disabled: true } });
  assert(r.ok, 'owner disables a staff member');
  assert((await request('/crm-hierarchy/units', { token: ST2 })).status === 403, 'disabled staff is locked out immediately');
  assert((await login(staffPhone, PW2)).status === 403, 'disabled staff cannot log in');
  // owner role moved out of scope by superadmin
  const demote = await request(`/admin/users/${ta2.owner.id}`, { method: 'PUT', token: S, body: { role: 'member' } });
  assert(demote.ok, 'superadmin edits an owner role');
  assert((await request('/crm-hierarchy/units', { token: T2O })).status === 403, 'unit access is withdrawn when the owner role is changed away');
  const restore = await request(`/admin/users/${ta2.owner.id}`, { method: 'PUT', token: S, body: { role: 'taluka_admin' } });
  assert(restore.ok && (await request('/crm-hierarchy/units', { token: T2O })).status === 200, 'restoring the role restores access');

  // ───────────────────────── Cleanup ─────────────────────────
  for (const id of created.units) await request(`/crm-hierarchy/units/${id}`, { method: 'PUT', token: S, body: { status: 'archived' } });
  for (const id of created.users) await request(`/admin/users/${id}`, { method: 'DELETE', token: S });

  console.log(`\n══════════ Result: ${passed} passed, ${failed} failed ══════════`);
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error('Test run crashed:', err); process.exit(2); });
