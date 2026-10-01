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

export default {
  getDatabase,
  saveDatabase,
  runQuery,
  all,
  get
};
