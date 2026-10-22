-- Columns the meeting endpoints write (booking: location; reschedule and status: updated_at)
-- but no earlier migration created. Only adds columns; existing rows keep their data.
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS updated_at TEXT;
