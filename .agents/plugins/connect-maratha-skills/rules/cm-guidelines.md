# Connect Maratha Development Guidelines

## Coding & Architectural Conventions
1. **Monorepo Architecture**: Keep frontend code strictly inside `frontend/` and backend code in `backend/`.
2. **API Proxying**: In local development, always ensure client requests call `/api/*` so they can be routed correctly by Vite or Docker's Nginx proxy.
3. **Database Operations**: Do not hardcode filesystem paths for SQLite; use relative paths from the project root or environment variables.
4. **Bilingual Support**: UI components frequently combine Marathi and English typography. Respect Baloo 2 and Inter fonts without overwriting localized strings.
