-- Speakers and mentors: profiles approved by an admin (member_id NULL = added by an admin, no account)
-- and talk / guidance requests that the speaker (or an admin) accepts or declines.
CREATE TABLE IF NOT EXISTS speakers (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  topics TEXT NOT NULL,
  intro TEXT,
  phone TEXT NOT NULL,
  offers_talks BOOLEAN NOT NULL DEFAULT true,
  offers_guidance BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS speakers_one_per_member ON speakers (member_id) WHERE member_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS speaker_requests (
  id TEXT PRIMARY KEY,
  speaker_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  event_date DATE,
  place TEXT,
  event_type TEXT,
  audience INTEGER,
  topic TEXT,
  mode TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS speaker_requests_one_open ON speaker_requests (speaker_id, member_id) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS speaker_requests_speaker ON speaker_requests (speaker_id);
CREATE INDEX IF NOT EXISTS speaker_requests_member ON speaker_requests (member_id, created_at);
