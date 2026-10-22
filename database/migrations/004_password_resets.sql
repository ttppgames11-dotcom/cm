-- 004: forgot-password by email OTP.
-- One active request per email. The OTP and the reset token are stored only
-- as hashes; rows are deleted once used, on expiry, or with the account.
CREATE TABLE IF NOT EXISTS password_resets (
  email TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  reset_token_hash TEXT,
  reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_member ON password_resets (member_id);
