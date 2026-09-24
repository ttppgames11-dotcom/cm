/** Trims and length-limits a user supplied string. Returns '' for non-strings. */
export function str(value, max = 500) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

/** Integer clamped to [min, max]; returns `fallback` when not a number. */
export function int(value, { min = 0, max = 1_000_000, fallback = min } = {}) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export const bad = (res, error, code = 'INVALID_INPUT') =>
  res.status(400).json({ success: false, code, error });
