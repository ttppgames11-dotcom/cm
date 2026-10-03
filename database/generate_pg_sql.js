import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  const db = await getDatabase();
  const outPath = path.join(__dirname, 'migrations', '004_location_hierarchy.sql');
  const stream = fs.createWriteStream(outPath, { encoding: 'utf8' });

  function write(str) {
    return new Promise(resolve => {
      if (!stream.write(str)) stream.once('drain', resolve);
      else resolve();
    });
  }

  await write('-- Migration 004: Hierarchical Locations (PostgreSQL)\n');
  await write('BEGIN;\n\n');

  await write('CREATE TABLE IF NOT EXISTS countries (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  code TEXT UNIQUE NOT NULL\n);\n\n');
  await write('CREATE TABLE IF NOT EXISTS states (\n  id TEXT PRIMARY KEY,\n  country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL\n);\nCREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);\n\n');
  await write('CREATE TABLE IF NOT EXISTS districts (\n  id TEXT PRIMARY KEY,\n  state_id TEXT NOT NULL REFERENCES states(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL\n);\nCREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);\n\n');
  await write('CREATE TABLE IF NOT EXISTS talukas (\n  id TEXT PRIMARY KEY,\n  district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  code TEXT NOT NULL\n);\nCREATE INDEX IF NOT EXISTS idx_talukas_district_id ON talukas(district_id);\n\n');
  await write('CREATE TABLE IF NOT EXISTS villages (\n  id TEXT PRIMARY KEY,\n  taluka_id TEXT NOT NULL REFERENCES talukas(id) ON DELETE CASCADE,\n  name TEXT NOT NULL,\n  code TEXT\n);\nCREATE INDEX IF NOT EXISTS idx_villages_taluka_id ON villages(taluka_id);\nCREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);\n\n');

  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS country_id TEXT;\n');
  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS state_id TEXT;\n');
  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS district_id TEXT;\n');
  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS taluka_id TEXT;\n');
  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS village_id TEXT;\n');
  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS taluka TEXT;\n');
  await write('ALTER TABLE members ADD COLUMN IF NOT EXISTS village TEXT;\n\n');

  function esc(s) {
    if (s === null || s === undefined) return 'NULL';
    return "'" + String(s).replace(/'/g, "''") + "'";
  }

  // Countries
  const countries = db.exec('SELECT id, name, code FROM countries')[0].values;
  for (const [id, name, code] of countries) {
    await write(`INSERT INTO countries (id, name, code) VALUES (${esc(id)}, ${esc(name)}, ${esc(code)}) ON CONFLICT (id) DO NOTHING;\n`);
  }

  // States
  const states = db.exec('SELECT id, country_id, name, code FROM states')[0].values;
  for (const [id, country_id, name, code] of states) {
    await write(`INSERT INTO states (id, country_id, name, code) VALUES (${esc(id)}, ${esc(country_id)}, ${esc(name)}, ${esc(code)}) ON CONFLICT (id) DO NOTHING;\n`);
  }

  // Districts
  const districts = db.exec('SELECT id, state_id, name, code FROM districts')[0].values;
  for (const [id, state_id, name, code] of districts) {
    await write(`INSERT INTO districts (id, state_id, name, code) VALUES (${esc(id)}, ${esc(state_id)}, ${esc(name)}, ${esc(code)}) ON CONFLICT (id) DO NOTHING;\n`);
  }

  // Talukas
  const talukas = db.exec('SELECT id, district_id, name, code FROM talukas')[0].values;
  for (const [id, district_id, name, code] of talukas) {
    await write(`INSERT INTO talukas (id, district_id, name, code) VALUES (${esc(id)}, ${esc(district_id)}, ${esc(name)}, ${esc(code)}) ON CONFLICT (id) DO NOTHING;\n`);
  }

  // Villages in batches of 500
  const villages = db.exec('SELECT id, taluka_id, name, code FROM villages')[0].values;
  const batchSize = 500;
  for (let i = 0; i < villages.length; i += batchSize) {
    const chunk = villages.slice(i, i + batchSize);
    const rows = chunk.map(([id, taluka_id, name, code]) => `(${esc(id)}, ${esc(taluka_id)}, ${esc(name)}, ${esc(code)})`).join(',\n');
    await write(`INSERT INTO villages (id, taluka_id, name, code) VALUES\n${rows}\nON CONFLICT (id) DO NOTHING;\n`);
  }

  await write('\nCOMMIT;\n');
  stream.end();
  console.log('Done! Generated 004_location_hierarchy.sql with size:', fs.statSync(outPath).size);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
