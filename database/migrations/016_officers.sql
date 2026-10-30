-- Officer mentors for MPSC / UPSC students: profiles approved by an admin (member_id NULL = added by an admin,
-- no account), an accepting switch, and guidance requests the officer (or an admin) accepts or declines.
CREATE TABLE IF NOT EXISTS officers (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  service_status TEXT NOT NULL,
  batch_year INTEGER,
  post TEXT NOT NULL,
  department TEXT,
  city TEXT NOT NULL,
  exams TEXT NOT NULL,
  intro TEXT,
  phone TEXT NOT NULL,
  accepting BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS officers_one_per_member ON officers (member_id) WHERE member_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS officer_requests (
  id TEXT PRIMARY KEY,
  officer_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  exam TEXT NOT NULL,
  stage TEXT NOT NULL,
  question TEXT NOT NULL,
  mode TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS officer_requests_one_open ON officer_requests (officer_id, member_id) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS officer_requests_officer ON officer_requests (officer_id);
CREATE INDEX IF NOT EXISTS officer_requests_member ON officer_requests (member_id, created_at);
