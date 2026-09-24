import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

// Load .env from the repo root (and cwd) so the API and the seed/migrate
// scripts all read the same DATABASE_URL.
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// COUNT()/SUM() of integers come back from Postgres as bigint (int8), which
// node-postgres returns as strings by default. The API expects plain numbers.
pg.types.setTypeParser(20, (v) => parseInt(v, 10));

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://cm_user:cm_password@localhost:5442/connect_maratha';

let pool = null;
let ready = null;

/**
 * Translate the SQLite-flavoured SQL used across the routes into PostgreSQL:
 *  - `?` placeholders            -> `$1, $2, ...`
 *  - datetime('now')             -> current timestamp as 'YYYY-MM-DD HH24:MI:SS' text
 *  - date('now')                 -> current date as 'YYYY-MM-DD' text
 *  - LIKE                        -> ILIKE (SQLite's LIKE is case-insensitive)
 * Timestamps stay TEXT columns so API responses keep the exact same format.
 */
export function toPgSql(sql) {
  let i = 0;
  return sql
    .replace(/datetime\('now'\)/gi, "to_char(now(), 'YYYY-MM-DD HH24:MI:SS')")
    .replace(/date\('now'\)/gi, "to_char(now(), 'YYYY-MM-DD')")
    .replace(/\bLIKE\b/g, 'ILIKE')
    .replace(/\?/g, () => `$${++i}`);
}

export function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
    pool.on('error', (err) => console.error('Unexpected Postgres pool error:', err.message));
  }
  return pool;
}

/** Connects and makes sure all tables exist (idempotent). */
export async function getDatabase() {
  if (!ready) {
    ready = (async () => {
      const p = getPool();
      if (fs.existsSync(SCHEMA_FILE)) {
        await p.query(fs.readFileSync(SCHEMA_FILE, 'utf8'));
      }
      return p;
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

/** Kept for backward compatibility: Postgres persists on its own. */
export function saveDatabase() {}

// Helper: Run an INSERT/UPDATE/DELETE query
export async function runQuery(sql, params = []) {
  const p = await getDatabase();
  const result = await p.query(toPgSql(sql), params);
  return { success: true, rowCount: result.rowCount };
}

// Helper: Run a SELECT query and return all matching rows as an array of objects
export async function all(sql, params = []) {
  const p = await getDatabase();
  const result = await p.query(toPgSql(sql), params);
  return result.rows;
}

// Helper: Run a SELECT query and return the first matching row
export async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function closeDatabase() {
  if (pool) await pool.end();
  pool = null;
  ready = null;
}

export default {
  getDatabase,
  getPool,
  saveDatabase,
  closeDatabase,
  runQuery,
  all,
  get
};
