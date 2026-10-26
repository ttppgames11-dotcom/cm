# Referral report for admins

**Date:** 2026-10-27
**Status:** design agreed section by section in chat; this document is for final review
**Builds on:** referrals (`docs/superpowers/specs/2026-10-26-referrals-design.md`), `Roles.isAdmin`, the admin shell (`/admin/referrals`).

## 1. Goal

Give admins one page that answers "what business has the community done through referrals?", in numbers the client can quote to members, sponsors and officials:

- how many referrals were given, won, lost and are still open, the win rate and the total won value;
- how the referrals are spread over the stages;
- who the top referrers and top receivers are.

Website only. Node stays the unchanged standby. epay is untouched. No new table or column.

**Success criteria**
1. Only admins (admin, superadmin, ceo) can read the report (401 without login, 403 for a member); an unknown period is a 400.
2. The numbers match the definitions in §3 exactly, for a known set of referrals (tests).
3. The reply never contains a customer name, phone, email, notes or referral title; only counts, values, member ids and member names.
4. The page shows the numbers, with clear empty and error states, inside the existing admin Referrals section.
5. The existing 145 backend tests and the Node comparison stay green.

## 2. Decisions

| Topic | Decision |
|---|---|
| What it answers | A business summary (headline numbers, stage counts, top 10 referrers, top 10 receivers) |
| Who sees it | Admins only, with member names |
| Period | `30d` (last 30 days), `90d`, or `all` (default) |
| Not included | District breakdown, CSV export, public leaderboard, charts |

## 3. Definitions

- **Won** = status `Won` or the old `Deal Won`. **Lost** = `Lost`. **Open** = every other status, including NULL and old words such as `In Progress`.
- **Win rate** = won ÷ (won + lost) as a number between 0 and 100 with one decimal; `null` when nothing has closed (won + lost = 0).
- **Won value** = the sum of `value` over won referrals (NULL values count as 0).
- **Period:** a referral belongs to the period by its `created_at` (stored as text `YYYY-MM-DD HH24:MI:SS`); `30d` and `90d` mean `created_at` at or after now minus 30 or 90 days; `all` has no limit.
- **Stage counts:** one row per status word found among the referrals in the period; the six pipeline words (New, Contacted, Qualified, Proposal, Won, Lost) always appear (count 0 when none), in that order; every other status (including NULL) is added together as `Other`. `Deal Won` is counted under `Won`.
- **Top referrers:** by giver, ordered by won value, then by won count, then by referrals given, then by member id; at most 10. **Top receivers:** the same by recipient. Members with no referrals in the period do not appear. A member's name is the current name in `members`, falling back to the name stored on the referral.

## 4. API

`GET /api/admin/referrals/report?period=30d|90d|all` — login required (`@RequireAuth`) and `Roles.isAdmin`; errors use the usual `{ success:false, code, error }` format: 403 `ADMIN_ONLY`, 400 `VALIDATION_ERROR` for an unknown period.

```
{ "success": true, "period": "all",
  "summary": { "given": 0, "won": 0, "lost": 0, "open": 0, "winRate": null, "wonValue": 0 },
  "byStatus": [ { "status": "New", "count": 0 }, ... , { "status": "Other", "count": 0 } ],
  "topReferrers": [ { "memberId": "M1", "name": "...", "given": 0, "won": 0, "wonValue": 0 } ],
  "topReceivers": [ { "memberId": "M2", "name": "...", "received": 0, "won": 0, "wonValue": 0 } ] }
```

`given = won + lost + open`. The numbers are computed by SQL over `referrals` (grouped queries with bound parameters); the period boundary is computed in the database. The route lives in the `sangam` feature (`ReferralReportController`, logic in `ReferralReportService`, SQL in `ReferralReportRepository`).

## 5. Website

In the existing admin Referrals view (`ReferralsView` in `AdminShell.jsx`, route `/admin/referrals`), a "Report" panel above the list:
- a period selector (Last 30 days / Last 90 days / All time, in Marathi and English) that reloads the report;
- headline tiles: given, won, lost, open, win rate (shown as "—" when `null`), won value in rupees with Indian digit grouping;
- one simple horizontal bar per stage (CSS only, no chart library), widths relative to the largest count;
- two tables, top referrers and top receivers, with the member name, counts and won value;
- states: loading, "no referrals in this period yet", and the server's message when loading fails; nothing fake is shown.

Pure helpers in `frontend/src/pages/admin/referralReport.js` (`formatRupees`, `formatWinRate`, `barWidths`, `PERIODS`) with `node --test` tests.

## 6. Tests

- `ReferralReportTest` (MockMvc, embedded PostgreSQL): admin-only (no token 401, member 403, admin/superadmin/ceo 200); bad period 400; exact numbers for a seeded set (won via `Won` and `Deal Won`, `Lost`, open ones, NULL and `In Progress`); win rate `null` with no closed deals and a decimal otherwise; the six stage rows always present in order with `Other` for the rest; the period filter (rows dated 5, 45 and 200 days ago); top lists ordered by the rules with at most 10; member name from `members` with the stored name as fallback; and the raw reply contains none of the seeded customer names, phones, emails, notes or titles.
- Website: helper tests, `npm run build`, and a live check as admin.

## 7. Release and rollback

Java PR, then `deploy-java.ps1`, then outside checks (report without login: 401; the other endpoints still work); then the website PR. The old admin page simply lacks the panel until the website PR is merged, so the order is safe. Rollback: revert the PRs; no data changed.

## 8. Out of scope

District breakdown (referrals do not carry a district) · CSV or PDF export · a public or member-visible leaderboard · charts · scheduled emails of the report · per-business figures.
