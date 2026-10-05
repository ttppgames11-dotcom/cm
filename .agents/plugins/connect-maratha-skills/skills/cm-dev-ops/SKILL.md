---
name: cm-dev-ops
description: >-
  Runbooks and troubleshooting procedures for running, testing, seeding, and deploying Connect Maratha via Docker or local npm workspaces. Use when starting the servers, debugging cross-machine issues, or managing the database.
---

# Connect Maratha Development & Operations Skill

This skill provides step-by-step procedures to run, test, and manage the Connect Maratha monorepo.

## 1. Running with Docker (Recommended for Cross-Machine Portability)

When running the project with Docker:
```bash
# Build and run containers in background
docker compose up -d --build

# View real-time container logs
docker compose logs -f

# Stop containers
docker compose down
```

Services:
- **Frontend Web UI**: http://localhost:3000
- **Backend API Server**: http://localhost:5000/api

## 2. Running Locally with Node.js (Monorepo Workspaces)

```bash
# 1. Install dependencies
npm install

# 2. Seed SQLite database
npm run db:seed

# 3. Start both backend and frontend concurrently
npm run dev:all
```

## 3. Database Management & Seeding

The database relies on `sql.js` (SQLite) with pre-populated records stored under `database/`.
- Seed command: `npm run db:seed`
- Data includes sample members, businesses, matrimonial profiles, and community events.

## 4. API Endpoints Quick Reference

- **Auth Login**: `POST /api/auth/login` (Body: `{ identifier, password }`)
- **Auth Register**: `POST /api/auth/register`
- **Current User Profile**: `GET /api/auth/me` (Header: `Authorization: Bearer <token>`)
- **Members**: `GET /api/members`
- **Businesses**: `GET /api/businesses`
