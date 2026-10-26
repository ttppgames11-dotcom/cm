# Connect Maratha — Unified Database Layer (SQLite / Abhay App Database)

This directory contains the primary relational database engine, schemas, and datasets for **Connect Maratha** (Web Platform & Android Mobile APK / Abhay App).

## 📁 Key Database Files
- `connect_maratha.db` — Primary persistent SQLite database binary (~47 MB).
- `schema.sql` — Complete SQL relational schema (40+ tables covering all domains).
- `database.js` — SQL query abstraction supporting both SQLite (`sql.js`) and production PostgreSQL (`DATABASE_URL`).
- `migrate_json_to_sqlite.js` — Automated sync script ensuring full parity between JSON cache and SQLite database.
- `seed_locations.js` — LGD 44,810+ Maharashtra village, taluka, and district hierarchy.

## 📊 Core Datasets in `connect_maratha.db`
- **44,810 Villages**: Complete Maharashtra LGD government village registry.
- **360 Talukas & 36 Districts**: Complete state administrative divisions.
- **20,500 History Quiz Questions**: Graded across 9 Maratha history eras and 3 difficulty tiers.
- **Community Portals & Directories**:
  - `books` (12 authentic reference volumes)
  - `movies` (12 historical and cultural Marathi films)
  - `speakers` (8 verified motivational orators & Shivcharitrakars)
  - `officers` (8 senior IAS/IPS/IRS administrators)
  - `organizations` (5 leading Maratha apex social bodies)
  - `social_workers` (verified grassroots social reformers)
  - `scholarships` (official government & SARTHI educational schemes)
  - `doctors` (24 verified healthcare specialists across Maharashtra)
  - `blood_requests` & `blood_donors` (live emergency response network)
  - `matrimony_profiles` (verified community matrimonial profiles)
  - `bank_loans`, `dairy`, `manufacturers`, `volunteers`, `grievances`, `builders`

## 🚀 Commands
Sync or re-seed database:
```bash
# Sync all portal tables into connect_maratha.db:
npm run sync --prefix database
# or
node database/migrate_json_to_sqlite.js
```
