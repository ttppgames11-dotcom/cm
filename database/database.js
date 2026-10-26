import pg from 'pg';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from repo root and backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });
dotenv.config();

// PostgreSQL BigInt parser: returns numbers instead of strings for COUNT/SUM
pg.types.setTypeParser(20, (v) => parseInt(v, 10));

const DATABASE_URL = process.env.DATABASE_URL || '';
const isPostgres = Boolean(DATABASE_URL && DATABASE_URL.startsWith('postgres'));

// ── 1. PostgreSQL Translation & Driver ───────────────────────────

let pgPool = null;
let pgReady = null;

export function toPgSql(sql) {
  const converted = sql
    .replace(/datetime\('now'\)/gi, "to_char(now(), 'YYYY-MM-DD HH24:MI:SS')")
    .replace(/date\('now'\)/gi, "to_char(now(), 'YYYY-MM-DD')")
    // SQLite LIKE is case-insensitive for ASCII; ILIKE keeps that behaviour on Postgres
    .replace(/\bLIKE\b/g, 'ILIKE');

  // Number `?` placeholders, skipping any `?` that appears inside a quoted literal
  let out = '';
  let i = 0;
  let quote = null;
  for (const ch of converted) {
    if (quote) {
      if (ch === quote) quote = null;
      out += ch;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      out += ch;
    } else if (ch === '?') {
      out += `$${++i}`;
    } else {
      out += ch;
    }
  }
  return out;
}

function getPgPool() {
  if (!pgPool) {
    console.log(`🔌 Connecting to PostgreSQL backend database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
    pgPool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
    pgPool.on('error', (err) => console.error('Unexpected Postgres pool error:', err.message));
  }
  return pgPool;
}

// ── 2. SQLite Fallback Driver ───────────────────────────────────

const DB_FILE = path.join(__dirname, 'connect_maratha.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

let sqliteDb = null;
let SQL = null;

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      sqliteDb = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing SQLite db file, creating new database:', err.message);
      sqliteDb = new SQL.Database();
    }
  } else {
    sqliteDb = new SQL.Database();
  }

  // Ensure older existing tables have necessary columns before applying schema
  const safeAlter = (tbl, col, type = 'TEXT') => {
    try { sqliteDb.run(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type};`); } catch (_) {}
  };

  safeAlter('organizations', 'district', 'TEXT');
  safeAlter('organizations', 'type', 'TEXT');
  safeAlter('organizations', 'state', 'TEXT');
  safeAlter('organizations', 'is_verified', 'INTEGER DEFAULT 0');

  safeAlter('social_workers', 'district', 'TEXT');
  safeAlter('social_workers', 'specializations', 'TEXT');
  safeAlter('social_workers', 'is_verified', 'INTEGER DEFAULT 0');
  safeAlter('social_workers', 'member_id', 'TEXT');

  // CRM unit hierarchy + staff-managed accounts
  for (const col of ['tier', 'partner_name', 'level', 'parent_id', 'owner_id']) safeAlter('community_centers', col, 'TEXT');
  safeAlter('community_centers', 'ancestor_ids', "TEXT DEFAULT '[]'");
  safeAlter('community_centers', 'staff_ids', "TEXT DEFAULT '[]'");
  safeAlter('members', 'status', "TEXT DEFAULT 'active'");
  safeAlter('members', 'unit_id', 'TEXT');
  safeAlter('members', 'unit_role', 'TEXT');
  safeAlter('members', 'token_version', 'INTEGER DEFAULT 0');

  if (fs.existsSync(SCHEMA_FILE)) {
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    try {
      sqliteDb.run(schemaSql);
    } catch (err) {
      // Execute statement by statement ignoring already existing indexes/columns
      const stmts = schemaSql.split(';');
      for (const s of stmts) {
        const trimmed = s.trim();
        if (trimmed) {
          try { sqliteDb.run(trimmed); } catch (_) {}
        }
      }
    }
  }

  // Ensure hierarchical columns
  const extraColumns = ['photo', 'country_id', 'state_id', 'district_id', 'taluka_id', 'village_id', 'taluka', 'village', 'kul', 'referred_by', 'vip_number'];
  for (const col of extraColumns) {
    safeAlter('members', col, 'TEXT');
  }
  try { sqliteDb.run('ALTER TABLE members ADD COLUMN is_vip INTEGER DEFAULT 0;'); } catch (_) {}
  safeAlter('members', 'verified_profile', 'INTEGER DEFAULT 0');

  try {
    sqliteDb.run('ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;');
  } catch (_) {}
  try {
    sqliteDb.run('ALTER TABLE posts ADD COLUMN is_premium INTEGER DEFAULT 0;');
  } catch (_) {}
  try {
    sqliteDb.run('ALTER TABLE posts ADD COLUMN premium_number TEXT;');
  } catch (_) {}
  try {
    sqliteDb.run('ALTER TABLE community_centers ADD COLUMN premium_number TEXT;');
  } catch (_) {}

  try {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        owner_id TEXT,
        kind TEXT,
        mime TEXT,
        bytes BLOB,
        size INTEGER,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS center_activities (
        id TEXT PRIMARY KEY,
        center_id TEXT,
        type TEXT,
        visitor_name TEXT,
        phone TEXT,
        purpose TEXT,
        desk TEXT,
        payer_name TEXT,
        category TEXT,
        amount REAL DEFAULT 0,
        payment_mode TEXT,
        receipt_number TEXT,
        collected_by TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        ticket_number TEXT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'General',
        subcategory TEXT,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'New',
        district TEXT,
        taluka TEXT,
        division TEXT,
        assigned_center_id TEXT,
        assigned_staff_id TEXT,
        current_owner_level TEXT DEFAULT 'taluka',
        requester_id TEXT,
        requester_name TEXT,
        requester_phone TEXT,
        sla_hours INTEGER DEFAULT 72,
        resolution_notes TEXT,
        audit_trail TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS finance_vouchers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        submitted_by TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        remarks TEXT,
        created_at TEXT
      );
    `);
  } catch (_) {}

  saveDatabase();
  return sqliteDb;
}

// sql.js keeps the whole database in memory and can only persist by exporting the
// entire file. Doing that synchronously on every query blocked the event loop, so
// writes are coalesced: at most one export per SAVE_DEBOUNCE_MS, written atomically.
const SAVE_DEBOUNCE_MS = 500;
let saveTimer = null;

function writeDatabaseFile() {
  if (!sqliteDb) return;
  try {
    const buffer = Buffer.from(sqliteDb.export());
    const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmpFile, buffer);
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err.message);
  }
}

export function saveDatabase() {
  if (isPostgres) return; // PostgreSQL persists automatically
  if (process.env.DISABLE_LOCAL_DISK_STORAGE === 'true') return; // Skip saving to local disk
  if (!sqliteDb || saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    writeDatabaseFile();
  }, SAVE_DEBOUNCE_MS);
}

// Flush any pending write immediately (used on shutdown and by scripts)
export function saveDatabaseNow() {
  if (isPostgres || process.env.DISABLE_LOCAL_DISK_STORAGE === 'true') return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  writeDatabaseFile();
}

process.on('beforeExit', saveDatabaseNow);
process.on('exit', () => { if (saveTimer) saveDatabaseNow(); });

// ── 3. Unified Interface (all, get, runQuery, transaction) ───────

export async function getDatabase() {
  if (isPostgres) {
    if (!pgReady) {
      pgReady = (async () => {
        const pool = getPgPool();
        await pool.query('SELECT 1');
        console.log('✅ PostgreSQL live database connected successfully!');
        return pool;
      })().catch((err) => {
        pgReady = null;
        console.error('❌ PostgreSQL connection error:', err.message);
        throw err;
      });
    }
    return pgReady;
  }
  return await getSqliteDb();
}

export async function runQuery(sql, params = [], shouldSave = true) {
  const sanitizedParams = (Array.isArray(params) ? params : [params]).map(p => (p === undefined ? null : p));
  if (isPostgres) {
    const pool = await getDatabase();
    const res = await pool.query(toPgSql(sql), sanitizedParams);
    return { success: true, rowCount: res.rowCount };
  } else {
    const db = await getSqliteDb();
    db.run(sql, sanitizedParams);
    if (shouldSave) {
      saveDatabase();
    }
    return { success: true };
  }
}

export async function all(sql, params = []) {
  const sanitizedParams = (Array.isArray(params) ? params : [params]).map(p => (p === undefined ? null : p));
  if (isPostgres) {
    const pool = await getDatabase();
    const res = await pool.query(toPgSql(sql), sanitizedParams);
    return res.rows;
  } else {
    const db = await getSqliteDb();
    const stmt = db.prepare(sql);
    if (sanitizedParams && sanitizedParams.length > 0) {
      stmt.bind(sanitizedParams);
    }
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

export async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function transaction(fn) {
  if (isPostgres) {
    const pool = await getDatabase();
    const client = await pool.connect();
    const q = (sql, params = []) => client.query(toPgSql(sql), params);
    const tx = {
      runQuery: async (sql, params) => {
        const r = await q(sql, params);
        return { success: true, rowCount: r.rowCount };
      },
      all: async (sql, params) => (await q(sql, params)).rows,
      get: async (sql, params) => (await q(sql, params)).rows[0] || null,
    };
    try {
      await client.query('BEGIN');
      const result = await fn(tx);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } else {
    return await fn({ runQuery, all, get });
  }
}

export async function closeDatabase() {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    pgReady = null;
  }
}

export default {
  getDatabase,
  saveDatabase,
  closeDatabase,
  runQuery,
  all,
  get,
  transaction,
  toPgSql
};
