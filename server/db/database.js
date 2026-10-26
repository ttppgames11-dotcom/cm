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
  let i = 0;
  return sql
    .replace(/datetime\('now'\)/gi, "to_char(now(), 'YYYY-MM-DD HH24:MI:SS')")
    .replace(/date\('now'\)/gi, "to_char(now(), 'YYYY-MM-DD')")
    .replace(/\bLIKE\b/g, 'ILIKE')
    .replace(/\?/g, () => `$${++i}`);
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

  if (fs.existsSync(SCHEMA_FILE)) {
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    sqliteDb.run(schemaSql);
  }

  // Ensure hierarchical columns
  const extraColumns = ['photo', 'country_id', 'state_id', 'district_id', 'taluka_id', 'village_id', 'taluka', 'village', 'kul'];
  for (const col of extraColumns) {
    try {
      sqliteDb.run(`ALTER TABLE members ADD COLUMN ${col} TEXT;`);
    } catch (_) {}
  }

  try {
    sqliteDb.run('ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;');
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
    `);
  } catch (_) {}

  saveDatabase();
  return sqliteDb;
}

export function saveDatabase() {
  if (isPostgres) return; // PostgreSQL persists automatically
  if (!sqliteDb) return;
  try {
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err.message);
  }
}

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

export async function runQuery(sql, params = []) {
  if (isPostgres) {
    const pool = await getDatabase();
    const res = await pool.query(toPgSql(sql), params);
    return { success: true, rowCount: res.rowCount };
  } else {
    const db = await getSqliteDb();
    db.run(sql, params);
    saveDatabase();
    return { success: true };
  }
}

export async function all(sql, params = []) {
  if (isPostgres) {
    const pool = await getDatabase();
    const res = await pool.query(toPgSql(sql), params);
    return res.rows;
  } else {
    const db = await getSqliteDb();
    const stmt = db.prepare(sql);
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
