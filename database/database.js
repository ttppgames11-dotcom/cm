import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const DB_FILE = path.join(__dirname, 'connect_maratha.db');

// Load environment variables from repo root and current working directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// Dynamically load pg if available in the environment (installed in Docker / production)
let pg = null;
try {
  const pgModule = await import('pg');
  pg = pgModule?.default || pgModule;
  if (pg?.types?.setTypeParser) {
    // Return PostgreSQL bigint (int8) as plain numbers
    pg.types.setTypeParser(20, (v) => parseInt(v, 10));
  }
} catch (e) {
  // pg optional locally, will use SQLite fallback
}

const DATABASE_URL = process.env.DATABASE_URL;

let pool = null;
let ready = null;
let sqliteDb = null;
let SQL = null;

/**
 * Translate SQLite-flavoured SQL into PostgreSQL:
 *  - `?` placeholders            -> `$1, $2, ...`
 *  - datetime('now')             -> current timestamp string 'YYYY-MM-DD HH24:MI:SS'
 *  - date('now')                 -> current date string 'YYYY-MM-DD'
 *  - LIKE                        -> ILIKE (case-insensitive)
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
  if (!DATABASE_URL || !pg) return null;
  if (!pool) {
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
    pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error:', err.message));
  }
  return pool;
}

/**
 * Applies pending SQL files from database/migrations in order, inside transactions,
 * and records applied migrations in schema_migrations table.
 */
export async function runMigrations() {
  const p = getPool();
  if (!p) return;
  const client = await p.connect();
  try {
    await client.query('SELECT pg_advisory_lock(727001)');
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())'
    );
    const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
    if (fs.existsSync(MIGRATIONS_DIR)) {
      const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
      for (const file of files) {
        if (done.has(file)) continue;
        try {
          await client.query('BEGIN');
          await client.query(fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.warn(`Migration ${file} notice: ${err.message}`);
        }
      }
    }

    // Safe Schema Auto-Migration: Ensure referral and reference columns exist without data loss
    await client.query(`
      ALTER TABLE members ADD COLUMN IF NOT EXISTS reference_id TEXT;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_id TEXT;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS referred_by TEXT;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
      CREATE INDEX IF NOT EXISTS idx_members_reference_id ON members(reference_id);
      CREATE INDEX IF NOT EXISTS idx_members_referral_id ON members(referral_id);

      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'member_registration';
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referral_id TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reference_id TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_id TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_referral_id TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_name TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_id TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_referral_id TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_name TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_phone TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_district TEXT;
      ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_city TEXT;
    `).catch((migErr) => {
      console.warn('Referrals table auto-migration notice:', migErr.message);
    });
  } finally {
    await client.query('SELECT pg_advisory_unlock(727001)').catch(() => {});
    client.release();
  }
}

/**
 * Connects to PostgreSQL if DATABASE_URL is set; otherwise initializes SQLite (sql.js).
 */
export async function getDatabase() {
  if (DATABASE_URL && pg) {
    if (!ready) {
      ready = (async () => {
        const p = getPool();
        await runMigrations().catch((err) => console.warn('Migrations initialization notice:', err.message));
        return p;
      })().catch((err) => {
        ready = null;
        throw err;
      });
    }
    return ready;
  }

  // SQLite fallback
  if (sqliteDb) return sqliteDb;

  const initSqlJs = (await import('sql.js')).default;
  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      sqliteDb = new SQL.Database(fileBuffer);
    } catch (err) {
      sqliteDb = new SQL.Database();
    }
  } else {
    sqliteDb = new SQL.Database();
  }

  if (fs.existsSync(SCHEMA_FILE)) {
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    sqliteDb.run(schemaSql);
  }

  try {
    const tableInfo = sqliteDb.exec("PRAGMA table_info(members);");
    if (tableInfo && tableInfo[0] && tableInfo[0].values) {
      const existingCols = tableInfo[0].values.map((row) => row[1]);
      if (!existingCols.includes('reference_id')) sqliteDb.run("ALTER TABLE members ADD COLUMN reference_id TEXT;");
      if (!existingCols.includes('referral_id')) sqliteDb.run("ALTER TABLE members ADD COLUMN referral_id TEXT;");
      if (!existingCols.includes('referred_by')) sqliteDb.run("ALTER TABLE members ADD COLUMN referred_by TEXT;");
      if (!existingCols.includes('total_referrals')) sqliteDb.run("ALTER TABLE members ADD COLUMN total_referrals INTEGER DEFAULT 0;");
    }
  } catch (_) {}

  saveDatabase();
  return sqliteDb;
}

export function saveDatabase() {
  if (DATABASE_URL && pg) return;
  if (!sqliteDb) return;
  try {
    const data = sqliteDb.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch (err) {
    console.error('Error saving SQLite database:', err.message);
  }
}

/**
 * Runs a transactional sequence. `fn` receives { runQuery, all, get }.
 */
export async function transaction(fn) {
  if (DATABASE_URL && pg) {
    const p = await getDatabase();
    const client = await p.connect();
    const q = (sql, params = []) => client.query(toPgSql(sql), params);
    const tx = {
      runQuery: async (sql, params = []) => {
        const r = await q(sql, params);
        return { success: true, rowCount: r.rowCount };
      },
      all: async (sql, params = []) => (await q(sql, params)).rows,
      get: async (sql, params = []) => (await q(sql, params)).rows[0] || null,
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

  const db = await getDatabase();
  db.run('BEGIN TRANSACTION;');
  try {
    const result = await fn({ runQuery, all, get });
    db.run('COMMIT;');
    saveDatabase();
    return result;
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }
}

export async function runQuery(sql, params = []) {
  if (DATABASE_URL && pg) {
    const p = await getDatabase();
    const result = await p.query(toPgSql(sql), params);
    return { success: true, rowCount: result.rowCount };
  }
  const db = await getDatabase();
  db.run(sql, params);
  saveDatabase();
  return { success: true };
}

export async function all(sql, params = []) {
  if (DATABASE_URL && pg) {
    const p = await getDatabase();
    const result = await p.query(toPgSql(sql), params);
    return result.rows;
  }
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  if (params && params.length > 0) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

export async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function closeDatabase() {
  if (pool) await pool.end();
  pool = null;
  ready = null;
  sqliteDb = null;
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
