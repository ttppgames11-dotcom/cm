# Connect Maratha — Database Layer (PostgreSQL)

This directory contains the self-contained database engine, schema, and seed datasets for Connect Maratha.

## 📁 Files & Directories
- `connect_maratha.db` — legacy SQLite file, only used as the source for `migrate-from-sqlite.js`.
- `schema.sql` — Relational schema definition (22 tables including members, businesses, referrals, events, donations, oral history, and quiz questions).
- `database.js` — SQL.js query abstraction (`runQuery`, `all`, `get`, `saveDatabase`).
- `seed.js` — Data seeder populating initial members, businesses, campaigns, and metrics.
- `quiz_meta/` — Question pools and categorization metadata.

## 🚀 Commands
To re-run database seeding:
```bash
node seed.js
# or from root
npm run db:seed
```
