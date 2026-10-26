-- Meetings: Offline or Online, and who must answer a Requested meeting. The Java API runs this same SQL on first use (LazyTables.MEETING_COLUMNS).
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS awaiting_id TEXT;
