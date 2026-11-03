-- LOCAL TESTING ONLY. Test accounts, a unit ladder (State > Branch > Division > District > Taluka) with owners and
-- staff, and a few activities, so every CRM page has something to show. Safe to run again: it replaces its own rows.
-- Log in on the website with the e-mail below and the password "password123" (works only when the backend runs with
-- ALLOW_DEV_LOGIN_FALLBACK=true, which the local script sets; the live server never does).

DELETE FROM crm_activities WHERE unit_id LIKE 'UNIT-LOC-%';
DELETE FROM crm_unit_members WHERE member_id LIKE 'LOC-%';
DELETE FROM community_centers WHERE id LIKE 'UNIT-LOC-%';
DELETE FROM members WHERE id LIKE 'LOC-%';

INSERT INTO members (id, name, email, phone, password_hash, role, tier, joined, created_at) VALUES
  ('LOC-ADMIN',  'Local Admin',        'admin@local.test',    '9000000001', 'x', 'admin',  'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-CEO',    'Local CEO',          'ceo@local.test',      '9000000002', 'x', 'ceo',    'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-STATE',  'State Owner',        'state@local.test',    '9000000003', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-BRANCH', 'Branch Owner',       'branch@local.test',   '9000000004', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-DIV',    'Division Owner',     'division@local.test', '9000000005', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-DIST',   'District Owner',     'district@local.test', '9000000006', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-TAL',    'Taluka Owner',       'taluka@local.test',   '9000000007', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-STAFF',  'District Staff',     'staff@local.test',    '9000000008', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-FREE1',  'Free Member One',    'free1@local.test',    '9000000009', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-FREE2',  'Free Member Two',    'free2@local.test',    '9000000010', 'x', 'member', 'Gold', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD'));

INSERT INTO community_centers (id, name, level, parent_id, path, owner_id, state, division, district, taluka, status, created_by) VALUES
  ('UNIT-LOC-S', 'महाराष्ट्र राज्य (लोकल)', 'state',    NULL,         '/UNIT-LOC-S/', 'LOC-STATE', 'महाराष्ट्र', NULL, NULL, NULL, 'active', 'LOC-ADMIN'),
  ('UNIT-LOC-B', 'पुणे शाखा (लोकल)',        'branch',   'UNIT-LOC-S', '/UNIT-LOC-S/UNIT-LOC-B/', 'LOC-BRANCH', 'महाराष्ट्र', NULL, NULL, NULL, 'active', 'LOC-ADMIN'),
  ('UNIT-LOC-V', 'पुणे विभाग (लोकल)',       'division', 'UNIT-LOC-B', '/UNIT-LOC-S/UNIT-LOC-B/UNIT-LOC-V/', 'LOC-DIV', 'महाराष्ट्र', 'पुणे विभाग (लोकल)', NULL, NULL, 'active', 'LOC-ADMIN'),
  ('UNIT-LOC-D', 'पुणे जिल्हा (लोकल)',      'district', 'UNIT-LOC-V', '/UNIT-LOC-S/UNIT-LOC-B/UNIT-LOC-V/UNIT-LOC-D/', 'LOC-DIST', 'महाराष्ट्र', 'पुणे विभाग (लोकल)', 'पुणे जिल्हा (लोकल)', NULL, 'active', 'LOC-ADMIN'),
  ('UNIT-LOC-T', 'हवेली तालुका (लोकल)',     'taluka',   'UNIT-LOC-D', '/UNIT-LOC-S/UNIT-LOC-B/UNIT-LOC-V/UNIT-LOC-D/UNIT-LOC-T/', 'LOC-TAL', 'महाराष्ट्र', 'पुणे विभाग (लोकल)', 'पुणे जिल्हा (लोकल)', 'हवेली तालुका (लोकल)', 'active', 'LOC-ADMIN');

INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES
  ('LOC-STATE',  'UNIT-LOC-S', 'owner'),
  ('LOC-BRANCH', 'UNIT-LOC-B', 'owner'),
  ('LOC-DIV',    'UNIT-LOC-V', 'owner'),
  ('LOC-DIST',   'UNIT-LOC-D', 'owner'),
  ('LOC-TAL',    'UNIT-LOC-T', 'owner'),
  ('LOC-STAFF',  'UNIT-LOC-D', 'staff');

-- Activities of this year: the district has a mix (one done with proof, one started, one planned); the taluka has two done.
INSERT INTO crm_activities (id, unit_id, year, type, title, scheduled_date, target_count, attendee_count, notes, status, completed_at, completed_by, created_by) VALUES
  ('ACT-LOC-1', 'UNIT-LOC-D', EXTRACT(YEAR FROM now())::int, 'blood_donation',  'रक्तदान',        make_date(EXTRACT(YEAR FROM now())::int, 1, 10), 100, 85, 'Blood camp done (local test)', 'done', now(), 'LOC-STAFF', 'LOC-DIST'),
  ('ACT-LOC-2', 'UNIT-LOC-D', EXTRACT(YEAR FROM now())::int, 'job_fair',        'रोजगार मेळावा', make_date(EXTRACT(YEAR FROM now())::int, 1, 20), 300, 0, NULL, 'in_progress', NULL, NULL, 'LOC-DIST'),
  ('ACT-LOC-3', 'UNIT-LOC-D', EXTRACT(YEAR FROM now())::int, 'health_checkup',  'आरोग्य तपासणी', make_date(EXTRACT(YEAR FROM now())::int, 12, 15), 200, 0, NULL, 'planned', NULL, NULL, 'LOC-DIST'),
  ('ACT-LOC-4', 'UNIT-LOC-T', EXTRACT(YEAR FROM now())::int, 'spiritual',       'अध्यात्मिक उपक्रम', make_date(EXTRACT(YEAR FROM now())::int, 1, 5), 50, 60, 'Satsang done (local test)', 'done', now(), 'LOC-TAL', 'LOC-TAL'),
  ('ACT-LOC-5', 'UNIT-LOC-T', EXTRACT(YEAR FROM now())::int, 'krushi_sabha',    'कृषी सभा',       make_date(EXTRACT(YEAR FROM now())::int, 1, 12), 80, 70, 'Farmers meeting done (local test)', 'done', now(), 'LOC-TAL', 'LOC-TAL');
