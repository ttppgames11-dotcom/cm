// Builders and dairy records, stored in the database (table directory_records) instead of
// the old db.json file: every write is its own row (no lost writes when two people submit at
// once) and the data is part of the normal database backup.
// Each record is kept exactly as the API sends it (JSON text), so replies are unchanged.
// On first use, records still in db.json are copied in once; the file itself is left as it is.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { all, get, runQuery } from '../../database/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_FILE = path.join(__dirname, '../db.json');

export const COLLECTIONS = ['builders', 'builderInquiries', 'dairy', 'dairyProducts', 'dairyEnquiries', 'dairyRegistrations'];

let ready = null;
let seqCounter = 0;

/** Newest records get the highest number (lists are newest first, like the old unshift). */
function nextSeq() {
  seqCounter = (seqCounter + 1) % 1000;
  return Date.now() * 1000 + seqCounter;
}

async function setup() {
  await runQuery(`CREATE TABLE IF NOT EXISTS directory_records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    seq BIGINT NOT NULL,
    PRIMARY KEY (collection, id))`);
  await runQuery('CREATE INDEX IF NOT EXISTS idx_directory_records_order ON directory_records (collection, seq)');

  let legacy = {};
  try {
    legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8')) || {};
  } catch {
    legacy = {};
  }
  for (const collection of COLLECTIONS) {
    const items = Array.isArray(legacy[collection]) ? legacy[collection] : [];
    if (items.length === 0) continue;
    const have = await get('SELECT COUNT(*) AS n FROM directory_records WHERE collection = ?', [collection]);
    if (Number(have?.n) > 0) continue; // already copied
    // The file lists newest first: the first item gets the highest number.
    const base = Date.now() * 1000;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || item.id === undefined || item.id === null) continue;
      await runQuery(
        'INSERT INTO directory_records (collection, id, data, seq) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING',
        [collection, String(item.id), JSON.stringify(item), base - i]
      );
    }
    console.log(`Directory store: copied ${items.length} ${collection} record(s) from db.json`);
  }
}

export function ensureStore() {
  if (!ready) {
    ready = setup().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

/** All records of a collection, newest first. */
export async function listRecords(collection) {
  await ensureStore();
  const rows = await all('SELECT data FROM directory_records WHERE collection = ? ORDER BY seq DESC', [collection]);
  return rows.map((r) => JSON.parse(r.data));
}

export async function findRecord(collection, id) {
  await ensureStore();
  const row = await get('SELECT data FROM directory_records WHERE collection = ? AND id = ?', [collection, String(id)]);
  return row ? JSON.parse(row.data) : undefined;
}

export async function insertRecord(collection, item) {
  await ensureStore();
  await runQuery(
    'INSERT INTO directory_records (collection, id, data, seq) VALUES (?, ?, ?, ?)',
    [collection, String(item.id), JSON.stringify(item), nextSeq()]
  );
}

/**
 * prefix + the last 4 digits of the current time (as before, e.g. BLD-4821); if that id is
 * taken, the next free number is used instead of creating a duplicate.
 */
export async function freeShortId(collection, prefix) {
  let n = Number(Date.now().toString().slice(-4));
  for (let i = 0; i < 10000; i++) {
    const id = prefix + String((n + i) % 10000).padStart(4, '0');
    if (!(await findRecord(collection, id))) return id;
  }
  return prefix + Date.now();
}
