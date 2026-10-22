-- Member-uploaded pictures: profile photos and post photos.
-- Stored in the database so they are part of the normal backup.
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  kind TEXT NOT NULL,            -- profile | post
  mime TEXT NOT NULL,
  bytes BYTEA NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media (owner_id, kind);

-- '/media/<id>' of the member's profile photo, or NULL.
ALTER TABLE members ADD COLUMN IF NOT EXISTS photo TEXT;
