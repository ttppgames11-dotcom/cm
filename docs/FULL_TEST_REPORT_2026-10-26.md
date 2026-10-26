# Full test report: 2026-10-26

Method: started the real backend on port 5000, ran the existing test scripts, sent about 70 direct HTTP probes (auth, CRM roles, public exposure, validation), and built the frontend to a temp folder. Databases were backed up first and restored afterwards (170 members, as before). Not done: no browser click-through of the frontend pages, and no load test.

## Results at a glance
| Area | Result |
|---|---|
| Backend starts, `/api/health` | Pass |
| Frontend production build | Pass (18.6 s). Main bundle 453 KB (95 KB gzip), was 7.5 MB. Routes are lazy-loaded now |
| Login without password | Pass (400) |
| Old master and default passwords | Pass (401). New staff passwords work |
| Rate limiter | Pass: 15 login/register tries per 10 min, then 429 |
| CRM access by role (superadmin, CEO, district, taluka, center manager) | Pass: each sees only its own scope; CEO and district admin get 403 on `assign-role`; district admin gets 403 on money transactions; taluka admin blocked from other centers |
| Open CRM and admin GETs | Pass: all now return 401 without a token |
| `register` role, VIP and ID self-grant | Pass for role and tier (forced to `member` / `Basic`) |
| Donation validation (negative amount) | Pass (`INVALID_AMOUNT`) |
| Public PII and spoofing | **Fail** (see below) |
| Existing scripts | 3 of 4 fail, mostly stale tests (see below) |

## Real problems found (fix first)
| # | Severity | Finding | Evidence |
|---|---|---|---|
| 1 | Critical | **`POST /api/auth/google` trusts the email in the request.** Anyone can get a valid login token for any member by sending that member's email. The token's role claim is not honored by the admin routes (admin/users returned 403), so it is member-level takeover, not admin takeover | 200 with a token for `yashrajdyp@gmail.com` |
| 2 | Critical | **Messages can be read and sent as anyone.** The user ID comes from the `x-user-id` header, with no login | `GET /api/messages` and `POST /api/messages` with the header: 200 and 201 |
| 3 | High | **`GET /api/members` is public** and returns email, phone and role for every member (176 rows incl. staff). `/members/:id` and `/members/:id/card` are public too | 200 without token |
| 4 | High | **`GET /api/realtime/stream` is public** (live feed of database changes) | Connected without token |
| 5 | High | **Registration accepts invalid data.** Email `notanemail` and phone `12` returned 201 and a token | Probe |
| 6 | High | **Registration lets users choose their own member ID** (`id: "M1"` was accepted) | Probe |
| 7 | Medium | `PATCH /businesses/:id/moderation` returns 500 (`no such column: status`) instead of 401; the SQLite schema and the code disagree | Probe |
| 8 | Medium | Role data disagrees between stores: `M474782` is `superadmin` in the SQLite/login response but `member` in `db.json`. Users get mixed results depending on which store a route reads | `/members/:id/card` vs `db.json` |
| 9 | Medium | CRM staff `CM-DIST-0022` has district सातारा but is bound to the Pune district center, so it sees Pune data | CRM probe |
| 10 | Medium | Three staff accounts (`CM-CHAP-0033`, `CM-SEVA-0044`, `CM-FIN-0055`) have statewide access; `CM-BR-0011` shares a taluka unit with `CM-TAL-0077` | Earlier checks |
| 11 | Low | `/api/businesses/my`, `/api/notifications`, `/api/donations` return 404 (routes are elsewhere or missing) | Probe |

## Existing test scripts
| Script | Result | Reading |
|---|---|---|
| `test-all-apis.mjs` | Crashed (`Cannot read properties of undefined (reading 'id')`) | Early step fails, probably register response shape changed |
| `test-security-and-load.mjs` | 14 passed, 3 failed | Script/iframe/event-handler tags are not stripped from input in the tested endpoint. Check whether output is escaped on display (React escapes by default) |
| `test-validation.mjs` | 4 passed, 10 failed | Several failures are stale (tests expect old messages or send short passwords). Real gaps: invalid email/phone on register, rating > 5, negative donation on the old route, invalid PAN, underage matrimony, invalid role on assign-role. Review each |
| `test-routes.mjs` | All failed (`undefined`) | It requests the frontend on a port that is not running. Not a real failure |

## Data (from the earlier audit, still open)
Mock and seeded data, fake phone numbers, missing images and audio, and generated quiz and college data are listed in `docs/MOCK_DATA_AUDIT_2026-10-26.md`. Nothing there was changed.

## Fixed in this session
- Weak default passwords on 10 staff accounts replaced with random ones (`backend/data/staff_credentials.txt`, git-ignored).
- Branch code collision in `crmOperations.routes.js`.

## Suggested next steps
1. Verify Google ID tokens server-side (`google-auth-library`) or disable `/auth/google`.
2. Require login on `/messages` and take the user from the token only; protect `/members`, `/members/:id`, `/card` and the realtime stream.
3. Validate email, phone, name and ID format on register; ignore client-supplied IDs.
4. Fix the `businesses` moderation query and add the missing column to the schema.
5. Pick one source of truth for members and roles.
6. Update the four test scripts, and add them to CI.
