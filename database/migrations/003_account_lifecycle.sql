-- 003: support for account deletion and re-authentication rules.
ALTER TABLE members ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'password';  -- password | google
ALTER TABLE quiz_submissions ADD COLUMN IF NOT EXISTS member_id TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON post_comments (author_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations (donor_id);
