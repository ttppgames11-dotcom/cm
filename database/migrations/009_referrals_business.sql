-- Referrals: which of the receiver's businesses a referral is for. The Java API runs this same SQL on first use (LazyTables.REFERRAL_COLUMNS).
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS business_id TEXT;
