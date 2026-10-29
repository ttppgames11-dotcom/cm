-- Job alerts: a member's saved district + category (NULL = any), up to 3 each; new matching jobs notify them.
-- Safe to run twice.

CREATE TABLE IF NOT EXISTS job_alerts (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  district TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS job_alerts_one_each ON job_alerts (member_id, coalesce(lower(district), ''), coalesce(lower(category), ''));
CREATE INDEX IF NOT EXISTS job_alerts_member ON job_alerts (member_id);
