-- CRM unit activities: the yearly plan of each unit (12 types, one per month), each marked done only with proof
-- (head count and a note). unit_id points at a ladder unit in community_centers (migration 017).
CREATE TABLE IF NOT EXISTS crm_activities (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 0,
  attendee_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_activities_unit_year ON crm_activities (unit_id, year);
