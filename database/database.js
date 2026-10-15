import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'connect_maratha.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

let db = null;
let SQL = null;

export async function getDatabase() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing db file, creating new database:', err.message);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Ensure tables exist
  if (fs.existsSync(SCHEMA_FILE)) {
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    db.run(schemaSql);
  }

  // Ensure meetings table has location and updated_at columns
  const meetingColumns = ['location', 'updated_at'];
  for (const col of meetingColumns) {
    try {
      db.run('ALTER TABLE meetings ADD COLUMN ' + col + ' TEXT;');
    } catch (_) {
      // Column already exists
    }
  }

  // Ensure members table has hierarchical location columns and photo
  const locationColumns = ['country_id', 'state_id', 'district_id', 'taluka_id', 'village_id', 'taluka', 'village', 'photo'];
  for (const col of locationColumns) {
    try {
      db.run(`ALTER TABLE members ADD COLUMN ${col} TEXT;`);
    } catch (_) {
      // Column already exists
    }
  }

  // Ensure members table has referral columns
  const referralColumns = [
    { name: 'reference_id', def: 'TEXT' },
    { name: 'referral_id', def: 'TEXT' },
    { name: 'referred_by', def: 'TEXT' },
    { name: 'total_referrals', def: 'INTEGER DEFAULT 0' }
  ];
  for (const col of referralColumns) {
    try {
      db.run(`ALTER TABLE members ADD COLUMN ${col.name} ${col.def};`);
    } catch (_) {
      // Column already exists
    }
  }

  // Ensure every existing member has a unique reference_id & referral_id
  try {
    const unassigned = db.exec("SELECT id FROM members WHERE reference_id IS NULL OR reference_id = ''");
    if (unassigned.length > 0 && unassigned[0].values) {
      for (const row of unassigned[0].values) {
        const id = row[0];
        const numPart = String(id).replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000);
        const refId = `REF-96K-${numPart}`;
        db.run("UPDATE members SET reference_id = ?, referral_id = ?, total_referrals = COALESCE(total_referrals, 0) WHERE id = ?", [refId, refId, id]);
      }
    }
  } catch (_) {}

  // Ensure media table exists for secure isolated file/blob storage
  try {
    db.run([
      'CREATE TABLE IF NOT EXISTS media (',
      '  id TEXT PRIMARY KEY,',
      '  owner_id TEXT NOT NULL,',
      '  kind TEXT NOT NULL,',
      '  mime TEXT NOT NULL,',
      '  bytes BLOB NOT NULL,',
      '  size INTEGER NOT NULL,',
      '  created_at TEXT NOT NULL',
      ');',
      'CREATE INDEX IF NOT EXISTS idx_media_owner ON media (owner_id);',
      'CREATE INDEX IF NOT EXISTS idx_media_kind ON media (kind);'
    ].join('\n'));
  } catch (_) {}

  saveDatabase();
  return db;
}

export function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err.message);
  }
}

// Helper: Run an INSERT/UPDATE/DELETE query
export async function runQuery(sql, params = []) {
  const database = await getDatabase();
  database.run(sql, params);
  saveDatabase();
  return { success: true };
}

// Helper: Run a SELECT query and return all matching rows as an array of objects
export async function all(sql, params = []) {
  const database = await getDatabase();
  const stmt = database.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: Run a SELECT query and return the first matching row
export async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}


/**
 * Runs fn inside a single transaction. fn receives { runQuery, all, get }
 * bound to that transaction; any thrown error rolls everything back.
 */
export async function transaction(fn) {
  const database = await getDatabase();
  database.run('BEGIN TRANSACTION');
  const tx = {
    runQuery: async (sql, params = []) => {
      database.run(sql, params);
      return { success: true };
    },
    all: async (sql, params = []) => {
      const stmt = database.prepare(sql);
      if (params && params.length > 0) stmt.bind(params);
      const results = [];
      while (stmt.step()) results.push(stmt.getAsObject());
      stmt.free();
      return results;
    },
    get: async (sql, params = []) => {
      const rows = await tx.all(sql, params);
      return rows.length > 0 ? rows[0] : null;
    }
  };
  try {
    const result = await fn(tx);
    database.run('COMMIT');
    saveDatabase();
    return result;
  } catch (err) {
    try { database.run('ROLLBACK'); } catch (_) {}
    throw err;
  }
}

export default {
  getDatabase,
  saveDatabase,
  transaction,
  runQuery,
  all,
  get
};
