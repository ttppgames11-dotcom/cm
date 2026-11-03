# Run Connect Maratha on your own PC (local testing)

Nothing here touches the live site or the VPS. It uses a throw-away database in Docker on your PC (port 55432).

## One-time
1. Start **Docker Desktop** and wait until it says the engine is running.
2. In `E:\community_mobile_main` check out the website branch that has all the CRM pages: `git checkout feat/crm-dashboards-website`.
3. In `E:\community_mobile` stay on `Abhay_app` (or `main`, which has the same CRM backend).

## Every time (PowerShell, in `E:\community_mobile`)
```
.\local\local-dev.ps1 up         # database + tables + test accounts (first time downloads PostgreSQL)
.\local\local-dev.ps1 backend    # opens a window; wait about 30 seconds for http://localhost:5000/api/health
.\local\local-dev.ps1 frontend   # opens a window; then open http://localhost:3000/crm/dashboard
```
Log in with the password `password123` and an e-mail from the list printed by `up` (admin@local.test, ceo@local.test,
state@, branch@, division@, district@, taluka@, staff@, free1@, free2@ — all `@local.test`).

## Other commands
`.\local\local-dev.ps1 status` shows what runs; `down` stops the database; `reset` throws the data away and starts fresh.

## What to try
- `admin@local.test`: `/crm/dashboard` (roll-up by level, click a unit), `/crm/units` (create, edit, archive, change owner).
- `district@local.test`: the District dashboard (summary, team, activities); add `free1@local.test` as staff, create the yearly plan, mark an activity done.
- `staff@local.test`: the staff desk (read-only unit, can record activities).
- `ceo@local.test`: everything, read only.

## The area section (Step 6)
- The local database has Maharashtra with two districts (Pune, Satara) and three talukas, plus a few sample members, businesses, jobs, events and tickets in them.
- The local District unit covers Pune and the local Taluka unit covers Haveli. Open the unit card (or a dashboard) to see the **क्षेत्र (Area)** counts.
- As `admin@local.test` or the owner above a unit, edit a district or taluka unit and pick another place; the counts follow.
- Counts for businesses, jobs, events and tickets are matched by the typed district name, so they say "जिल्ह्याच्या नावानुसार".

`password123` works only because the local script starts the backend with `ALLOW_DEV_LOGIN_FALLBACK=true`; the live server never does.
