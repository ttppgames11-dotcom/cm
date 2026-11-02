-- CRM units: a ladder State > Branch > Division > District > Taluka built on the community_centers table, each unit
-- with one owner (a member). Old front-desk centres keep level NULL and are not part of the ladder.
CREATE TABLE IF NOT EXISTS community_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT,
  division TEXT,
  district TEXT,
  taluka TEXT,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS owner_id TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS community_centers_parent ON community_centers (parent_id);
CREATE INDEX IF NOT EXISTS community_centers_path ON community_centers (path text_pattern_ops);
CREATE UNIQUE INDEX IF NOT EXISTS community_centers_unit_name
  ON community_centers ((COALESCE(parent_id, '')), lower(name), level) WHERE level IS NOT NULL;

ALTER TABLE members ADD COLUMN IF NOT EXISTS unit_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS unit_role TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS members_one_unit_owner ON members (unit_id) WHERE unit_role = 'owner';
