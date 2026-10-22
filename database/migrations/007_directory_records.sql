-- Builders and dairy records (previously kept in backend/db.json). One row per record;
-- data holds the record exactly as the API returns it (JSON text). Only creates a new table.
CREATE TABLE IF NOT EXISTS directory_records (
  collection TEXT NOT NULL,   -- builders | builderInquiries | dairy | dairyProducts | dairyEnquiries | dairyRegistrations
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  seq BIGINT NOT NULL,        -- newest record = highest number
  PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS idx_directory_records_order ON directory_records (collection, seq);
