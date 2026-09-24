// One-off: copies every table from the legacy SQLite file (connect_maratha.db)
// into PostgreSQL. Safe to re-run: existing rows (same primary key) are kept.
//   docker compose up -d && npm run migrate:sqlite --prefix database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import { getPool, getDatabase, closeDatabase } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQLITE_FILE = process.argv[2] || path.join(__dirname, 'connect_maratha.db');

const q = (name) => `"${name.replace(/"/g, '""')}"`;

async function main() {
  if (!fs.existsSync(SQLITE_FILE)) throw new Error(`SQLite file not found: ${SQLITE_FILE}`);
  const SQL = await initSqlJs();
  const sqlite = new SQL.Database(fs.readFileSync(SQLITE_FILE));
  await getDatabase(); // creates the Postgres tables
  const pool = getPool();

  const tables = sqlite
    .exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")[0]
    ?.values.map((r) => r[0]) ?? [];

  for (const table of tables) {
    const res = sqlite.exec(`SELECT * FROM ${q(table)}`)[0];
    if (!res) { console.log(`${table}: 0 rows`); continue; }
    const cols = res.columns;
    const insert = `INSERT INTO ${q(table)} (${cols.map(q).join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) ON CONFLICT DO NOTHING`;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const row of res.values) await client.query(insert, row);
      await client.query('COMMIT');
      console.log(`${table}: ${res.values.length} rows`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`${table}: ${err.message}`);
    } finally {
      client.release();
    }
  }
  await closeDatabase();
}

main().then(() => console.log('Done.')).catch((e) => { console.error(e.message); process.exit(1); });
