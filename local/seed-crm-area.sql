-- LOCAL TESTING ONLY. Places for the CRM area section: a few master locations (Maharashtra with two districts and three
-- talukas), the places of the local district and taluka units, and sample members, businesses, jobs, events and tickets in
-- them. Run after seed-crm.sql. Safe to run again: it replaces its own rows (ids start with LOC).

-- The ticket table is normally created by the backend on first use; the same definition is repeated here so the sample
-- tickets can be added before the backend has ever run.
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY, source TEXT DEFAULT 'helpdesk', title TEXT NOT NULL,
  description TEXT NOT NULL, category TEXT, subcategory TEXT, priority TEXT,
  district TEXT, taluka TEXT, division TEXT, assigned_center_id TEXT,
  current_owner_level TEXT DEFAULT 'taluka', status TEXT DEFAULT 'New',
  requester_id TEXT, requester_name TEXT, requester_phone TEXT, requester_email TEXT,
  language TEXT, sla_hours INTEGER, audit_trail TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);

DELETE FROM support_tickets WHERE id LIKE 'LOC-%';
DELETE FROM events WHERE id LIKE 'LOC-%';
DELETE FROM jobs WHERE id LIKE 'LOC-%';
DELETE FROM businesses WHERE id LIKE 'LOC-%';
DELETE FROM members WHERE id LIKE 'LOC-M%';
DELETE FROM talukas WHERE id LIKE 'LOC%';
DELETE FROM districts WHERE id LIKE 'LOC%';
DELETE FROM states WHERE id = '27' AND country_id = 'LOCC';
DELETE FROM countries WHERE id = 'LOCC';

INSERT INTO countries (id, name, code) VALUES ('LOCC', 'India (local test)', 'LOCC');
INSERT INTO states (id, country_id, name, code) VALUES ('27', 'LOCC', 'Maharashtra / महाराष्ट्र', '27');
INSERT INTO districts (id, state_id, name, code) VALUES
  ('LOCD1', '27', 'Pune / पुणे', 'LOCD1'),
  ('LOCD2', '27', 'Satara / सातारा', 'LOCD2');
INSERT INTO talukas (id, district_id, name, code) VALUES
  ('LOCT1', 'LOCD1', 'Pune City / पुणे शहर', 'LOCT1'),
  ('LOCT2', 'LOCD1', 'Haveli / हवेली', 'LOCT2'),
  ('LOCT3', 'LOCD2', 'Karad / कराड', 'LOCT3');

-- The places of the local units: the district unit covers Pune, the taluka unit covers Haveli.
UPDATE community_centers SET area_district_id = 'LOCD1', area_taluka_id = NULL WHERE id = 'UNIT-LOC-D';
UPDATE community_centers SET area_district_id = 'LOCD1', area_taluka_id = 'LOCT2' WHERE id = 'UNIT-LOC-T';

INSERT INTO members (id, name, email, phone, password_hash, role, tier, district_id, taluka_id, joined, created_at) VALUES
  ('LOC-M1', 'Sample Member Pune 1',   'm1@local.test', '9000000011', 'x', 'member', 'Gold', 'LOCD1', NULL,    to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-M2', 'Sample Member Haveli',   'm2@local.test', '9000000012', 'x', 'member', 'Gold', 'LOCD1', 'LOCT2', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-M3', 'Sample Member Karad',    'm3@local.test', '9000000013', 'x', 'member', 'Gold', 'LOCD2', 'LOCT3', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')),
  ('LOC-M4', 'Sample Member Satara',   'm4@local.test', '9000000014', 'x', 'member', 'Gold', 'LOCD2', NULL,    to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD'));

-- Typed districts, as real posters type them: English, Marathi, with spaces and capitals.
INSERT INTO businesses (id, name, district) VALUES
  ('LOC-B1', 'Local Shop Pune',      'Pune'),
  ('LOC-B2', 'Local Shop पुणे',       'पुणे'),
  ('LOC-B3', 'Local Shop Satara',    ' SATARA ');
INSERT INTO jobs (id, title, district) VALUES
  ('LOC-J1', 'Local Job Pune',   'Pune'),
  ('LOC-J2', 'Local Job Satara', 'Satara');
INSERT INTO events (id, title, district) VALUES
  ('LOC-E1', 'Local Event Pune',   'पुणे'),
  ('LOC-E2', 'Local Event Satara', 'Satara');
INSERT INTO support_tickets (id, title, description, district, taluka, status) VALUES
  ('LOC-T1', 'Local Ticket Pune open',      'local test', 'Pune',   NULL,     'New'),
  ('LOC-T2', 'Local Ticket Pune resolved',  'local test', 'Pune',   NULL,     'Resolved'),
  ('LOC-T3', 'Local Ticket Karad open',     'local test', 'Satara', 'Karad',  'New');
