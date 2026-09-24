import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

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

/**
 * Applies pending SQL files from database/migrations in filename order, each
 * inside its own transaction, and records them in schema_migrations.
 * Migrations are additive; nothing here ever drops or truncates data.
 */
export async function runMigrations() {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('SELECT pg_advisory_lock(727001)');
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())'
    );
    const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
    const applied = [];
    for (const file of files) {
      if (done.has(file)) continue;
      try {
        await client.query('BEGIN');
        await client.query(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        applied.push(file);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
    return applied;
  } finally {
    await client.query('SELECT pg_advisory_unlock(727001)').catch(() => {});
    client.release();
  }
}

/**
 * Connects to the database. Outside production, pending migrations are applied
 * automatically. In production the schema is only changed by an explicit
 * `npm run migrate` (or DB_AUTO_MIGRATE=true), never as a startup side effect.
 */
export async function getDatabase() {
  if (!ready) {
    ready = (async () => {
      const p = getPool();
      const auto =
        process.env.DB_AUTO_MIGRATE === 'true' ||
        (process.env.NODE_ENV !== 'production' && process.env.DB_AUTO_MIGRATE !== 'false');
      if (auto) await runMigrations();
      else await p.query('SELECT 1');
      return p;
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

/**
 * Runs `fn` inside a single transaction. `fn` receives { runQuery, all, get }
 * bound to that transaction; any thrown error rolls everything back.
 */
export async function transaction(fn) {
  const p = await getDatabase();
  const client = await p.connect();
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
  runMigrations,
  transaction,
  getPool,
  saveDatabase,
  closeDatabase,
  runQuery,
  all,
  get
};
