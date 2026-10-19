-- ========================================================
-- 004: referral codes, reference IDs, and referral tracking
-- All statements are additive and idempotent.
-- ========================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_members_reference_id ON members(reference_id);
CREATE INDEX IF NOT EXISTS idx_members_referral_id ON members(referral_id);

-- Ensure referrals table has member registration columns
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'member_registration';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referral_id TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_id TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_referral_id TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_name TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_referral_id TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_phone TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_district TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_city TEXT;
