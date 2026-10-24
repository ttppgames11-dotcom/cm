-- B2B opportunities (/leads): requirements and their quotes. The Java API runs this same SQL on first use (LazyTables.ENQUIRY_TABLES).
CREATE TABLE IF NOT EXISTS enquiries (
  id          TEXT PRIMARY KEY,
  member_id   TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  city        TEXT,
  district    TEXT NOT NULL,
  budget      TEXT,
  client_name TEXT,
  phone       TEXT,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_enquiries_member  ON enquiries (member_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS enquiry_quotes (
  id             TEXT PRIMARY KEY,
  enquiry_id     TEXT NOT NULL REFERENCES enquiries (id) ON DELETE CASCADE,
  member_id      TEXT NOT NULL,
  business_name  TEXT NOT NULL,
  owner_name     TEXT,
  phone          TEXT NOT NULL,
  quote_amount   TEXT,
  proposal_notes TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enquiry_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_enquiry_quotes_member ON enquiry_quotes (member_id);
