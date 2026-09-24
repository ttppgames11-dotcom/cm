-- ========================================================
-- 002: account status, refresh tokens, moderation (reports/blocks),
--      ownership columns, and de-duplication constraints.
-- All statements are additive and idempotent.
-- ========================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';   -- active | suspended
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_login_at TEXT;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_member ON refresh_tokens (member_id);

-- Ownership so content can be deleted / moderated per user
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id TEXT;
ALTER TABLE business_reviews ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS poster_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS creator_id TEXT;

-- Moderation state for user generated content
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'visible';           -- visible | hidden
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'visible';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'visible';

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  target_type TEXT NOT NULL,          -- post | comment | member | business
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'open',         -- open | actioned | dismissed
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_once ON reports (reporter_id, target_type, target_id) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- One like / membership / RSVP / review per member
CREATE UNIQUE INDEX IF NOT EXISTS uq_post_likes ON post_likes (post_id, member_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_group_members ON group_members (group_id, member_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_rsvps ON event_rsvps (event_id, member_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_business_reviews ON business_reviews (business_id, member_id);

-- Login identifiers must be unique (case-insensitive email, non-empty phone)
CREATE UNIQUE INDEX IF NOT EXISTS uq_members_email ON members (lower(email)) WHERE email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_members_phone ON members (phone) WHERE phone <> '';

CREATE INDEX IF NOT EXISTS idx_posts_group ON posts (group_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at);
