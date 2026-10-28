-- Jobs that belong to members and close; applications with a status, one per member per job.
-- Safe to run twice: columns and indexes are only added when missing, and nothing is dropped.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS poster_id TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS job_applications_one_per_member ON job_applications(job_id, member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS job_applications_job ON job_applications(job_id);

-- Jobs already on the board run 30 more days from now.
UPDATE jobs SET closes_at = now() + interval '30 days' WHERE closes_at IS NULL;
