-- Blood help: member-owned requests that close, and one donor profile per member.
-- Also created at runtime by LazyTables.ensureBloodTables() (IF NOT EXISTS, safe to run twice).

CREATE TABLE IF NOT EXISTS blood_requests (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 1,
  hospital TEXT,
  city TEXT,
  district TEXT,
  contact_phone TEXT,
  urgency TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  closed_by TEXT,
  closes_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blood_donors (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  city TEXT,
  district TEXT,
  phone TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  last_donated DATE,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS blood_donors_one_per_member ON blood_donors (member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS blood_requests_member ON blood_requests (member_id, created_at);
