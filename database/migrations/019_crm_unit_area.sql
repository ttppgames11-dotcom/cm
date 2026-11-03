-- CRM unit places: a district or taluka unit points at a real place of the master location list (districts / talukas),
-- chosen by id. Other levels have none; their area is the sum of the units below them. Both columns are optional.
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS area_district_id TEXT;
ALTER TABLE community_centers ADD COLUMN IF NOT EXISTS area_taluka_id TEXT;
