-- Business Sangam chapters and their seats (join requests). The Java API runs this same SQL on first use (LazyTables.CHAPTER_TABLES).
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT, district TEXT, area TEXT,
  meeting_day TEXT, meeting_time TEXT, venue TEXT, coordinator_id TEXT, max_seats INTEGER,
  status TEXT NOT NULL DEFAULT 'open', created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS chapter_seats (
  id TEXT PRIMARY KEY, chapter_id TEXT NOT NULL, business_id TEXT NOT NULL, member_id TEXT NOT NULL,
  message TEXT, status TEXT NOT NULL, decided_by TEXT, created_at TEXT, updated_at TEXT);
-- One waiting or approved seat per business (across all chapters), and per member in each chapter.
CREATE UNIQUE INDEX IF NOT EXISTS chapter_seats_one_per_business ON chapter_seats (business_id) WHERE status IN ('waiting', 'approved');
CREATE UNIQUE INDEX IF NOT EXISTS chapter_seats_one_per_member ON chapter_seats (chapter_id, member_id) WHERE status IN ('waiting', 'approved');
