-- ============================================================================
-- Connect Maratha: Migration 001 - Hierarchical Administrative Locations
-- Target: PostgreSQL 14+ / Compatible with SQLite 3.35+
-- Hierarchy: Country -> State -> District -> Taluka / Sub-District -> Village
-- Source: Government of India Local Government Directory (LGD)
-- ============================================================================

-- 1. Countries
CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);

-- 2. States
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);

-- 3. Districts
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

-- 4. Talukas (Sub-Districts / Tehsils)
CREATE TABLE IF NOT EXISTS talukas (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_talukas_district_id ON talukas(district_id);

-- 5. Villages
CREATE TABLE IF NOT EXISTS villages (
  id TEXT PRIMARY KEY,
  taluka_id TEXT NOT NULL REFERENCES talukas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT
);
CREATE INDEX IF NOT EXISTS idx_villages_taluka_id ON villages(taluka_id);
CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);

-- 6. Add hierarchical location references to members table (backward-compatible)
-- ALTER TABLE members ADD COLUMN country_id TEXT;
-- ALTER TABLE members ADD COLUMN state_id TEXT;
-- ALTER TABLE members ADD COLUMN district_id TEXT;
-- ALTER TABLE members ADD COLUMN taluka_id TEXT;
-- ALTER TABLE members ADD COLUMN village_id TEXT;
-- ALTER TABLE members ADD COLUMN taluka TEXT;
-- ALTER TABLE members ADD COLUMN village TEXT;
