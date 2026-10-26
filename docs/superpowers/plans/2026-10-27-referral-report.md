# Admin Referral Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One admin-only page that shows what business the community has done through referrals: headline numbers, stage counts, and the top referrers and receivers, for a chosen period.

**Architecture:** A read-only endpoint in the existing `sangam` feature (controller, service, JdbcTemplate repository running grouped SQL over `referrals`), admin-only. On the website a self-contained report panel is shown at the top of the admin Referrals view and replaces the existing admin report page that shows invented referrals.

**Tech Stack:** Java 17, Spring Boot 3.3.5, JdbcTemplate, PostgreSQL (embedded for tests), MockMvc; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-referral-report-design.md`

## Global Constraints

- Backend on `Abhay_app` in `E:\community_mobile`; website on a branch off `main` in `E:\community_mobile_main`. Pushes as abhayGond02. No new table or column; the endpoint only reads.
- Route `GET /api/admin/referrals/report?period=30d|90d|all` (default `all`): `@RequireAuth` (401 without a login), then `Roles.isAdmin` (403 `ADMIN_ONLY`, `"फक्त प्रशासकांना परवानगी आहे. (Admins only)"`), then the period (400 `VALIDATION_ERROR` for any other value).
- Definitions (spec §3): *Won* = status `Won` or `Deal Won`; *Lost* = `Lost`; *Open* = every other status including NULL; `given = won + lost + open`. `winRate` = won ÷ (won + lost) × 100 rounded to one decimal, `null` when won + lost = 0. `wonValue` = sum of `value` of won referrals (NULL counts as 0). Period: `created_at >= to_char(now() - N days, 'YYYY-MM-DD HH24:MI:SS')` (N = 30 or 90, no limit for `all`); rows with NULL `created_at` are left out of a limited period.
- `byStatus`: always the six rows New, Contacted, Qualified, Proposal, Won, Lost in that order (count 0 when none; `Deal Won` counted under `Won`), then `Other` (every other status, NULL included).
- Top lists: at most 10, ordered by won value, then won count, then total, then member id (all descending except the id); members with no referrals in the period do not appear; the name is the current `members.name`, falling back to the name stored on the referral. Reply keys exactly as in spec §4. Nothing from the customer (name, phone, email, notes) or the referral title appears in the reply.
- Existing 145 backend tests and the Node comparison (`PARITY: compared 441 replies, 0 differ`) stay green; this feature does not touch Node-compared endpoints.
- Test member ids for this feature use `M97xx`; the report test empties the `referrals` table in `@BeforeEach` (the report is global, and other test classes seed their own rows).

## Review Focus

- **A member with no referrals, or a period with none:** the numbers are 0, `winRate` is `null` (the page shows "—"), the six stage rows still appear, the top lists are empty. Test in Task 1.
- **Old status words** (`Deal Won`, `In Progress`, NULL): `Deal Won` counts as won everywhere; the others are open and show under `Other`. Test in Task 1.
- **A referral just inside and just outside the period** (5, 45 and 200 days old): included or left out correctly for 30d, 90d and all. Test in Task 2.
- **Privacy:** the raw reply holds none of the seeded customer names, phones, emails, notes or titles, and a member who is not an admin gets nothing. Tests in Tasks 1 and 2.
- **A giver or receiver missing from `members`** (deleted account): still listed, with the stored name. Test in Task 2. (Website: a failed load shows the server's message, never zeros as if real.)

---

## File Structure

| File | Responsibility |
|---|---|
| `backend-java/.../sangam/repository/ReferralReportRepository.java` (create) | The grouped SQL: summary, stage counts, top givers, top receivers |
| `backend-java/.../sangam/service/ReferralReportService.java` (create) | Admin check, period parsing, status grouping, win rate, reply shape |
| `backend-java/.../sangam/controller/ReferralReportController.java` (create) | The route |
| `backend-java/src/test/.../sangam/ReferralReportTest.java` (create) | All backend tests |
| `frontend/src/pages/admin/referralReport.js` + `.test.js` (create) | Pure helpers |
| `frontend/src/pages/admin/reports/ReferralReportPanel.jsx` (create) | The report panel (own styling, no imports from AdminShell) |
| `frontend/src/pages/admin/AdminShell.jsx` (modify) | Panel at the top of `ReferralsView`; `/b2b/referrals/report` route shows the panel; cards read the real field names |
| `backend-java/README.md` (modify) | The endpoint |

(`...` = `src/main/java/com/connectmaratha/api` or `src/test/java/com/connectmaratha/api`.) Backend tests: `E:\community_mobile\.superpowers\sdd\2026-10-26-referrals\jt.sh <TestClass>` prints `exit 0: N tests, 0 failures, 0 errors` on success; `jt.sh ALL` runs everything. Website commands run in `E:\community_mobile_main\frontend`; test files are run by name (`node --test <file>`).

---

### Task 1: Access, headline numbers and stages

**Files:** Create `ReferralReportRepository.java`, `ReferralReportService.java`, `ReferralReportController.java`, `ReferralReportTest.java`.

**Interfaces:**
- Produces `ReferralReportRepository` (`@Repository`, constructor `(JdbcTemplate)`): `record Summary(long given, long won, long lost, double wonValue)`; `record StatusCount(String status, long count)` (status as stored; NULL as ""); `record TopMember(String memberId, String name, long total, long won, double wonValue)`; `Summary summary(Integer days)`; `List<StatusCount> statusCounts(Integer days)`; `List<TopMember> topGivers(Integer days, int limit)`; `List<TopMember> topReceivers(Integer days, int limit)`. `days` = null means no period limit.
- Produces `ReferralReportService.report(CurrentUser user, String period)` → the reply map of spec §4; `ReferralReportService.daysOf(String period)` → `Integer` (30, 90, or null for `all`/missing), throws `ApiException` 400 `VALIDATION_ERROR` otherwise (`"अवैध कालावधी (Invalid period)."`).
- Produces `ReferralReportController`: `GET /api/admin/referrals/report` (`@RequireAuth`), param `period` optional.
- In this task the service fills `summary` and `byStatus`; `topReferrers` and `topReceivers` return empty lists until Task 2.

- [ ] **Step 1: Write the failing tests** (`ReferralReportTest`: `@SpringBootTest @AutoConfigureMockMvc`, extends `PostgresTestBase`; helpers like `ReferralEndpointsTest`: `token(id, role)`, a `referral(id, giverId, recipientId, status, value, createdAt)` inserting a row with customer data `client_name 'Secret Customer'`, `client_phone '9822144550'`, `client_email 'secret@example.com'`, `notes 'private note'`, `title 'Secret title'`; members `M9701`..`M9704`, admin `M9709`; `@BeforeEach`: `DELETE FROM referrals`, insert the members `ON CONFLICT DO NOTHING`).

```java
@Test void reportNeedsALoginAndAnAdmin()          // no token → 401; member → 403 ADMIN_ONLY; role admin, superadmin and ceo → 200
@Test void unknownPeriodIsRefused()               // ?period=7d and ?period=year → 400 VALIDATION_ERROR (admin); missing period → 200 with "period":"all"
@Test void emptyReportHasZerosAndNoWinRate()      // Review Focus: no referrals → summary all 0, winRate null, byStatus has the six words in order + Other, all 0, topReferrers/topReceivers empty arrays
@Test void numbersFollowTheDefinitions()          // rows: Won 1000, Deal Won 500, Lost 300 (value ignored), New, Contacted, NULL status, 'In Progress' → given 7, won 2, lost 1, open 4, wonValue 1500.0, winRate 66.7
@Test void winRateIsAWholeNumberWhenExact()       // 1 Won + 1 Lost → winRate 50.0 (JSON 50.0 or 50); 2 Won, 0 Lost → 100.0
@Test void stageCountsGroupOldWords()             // same rows as numbersFollowTheDefinitions: byStatus New 1, Contacted 1, Qualified 0, Proposal 0, Won 2 (Won + Deal Won), Lost 1, Other 2 (NULL + In Progress)
@Test void replyHoldsNoCustomerData()             // Review Focus: raw body of a populated report does not contain "Secret", "9822144550", "secret@example.com", "private note"
```

- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralReportTest` → compile error (classes missing).
- [ ] **Step 3: Implement** repository (one `SELECT COUNT(*), COUNT(*) FILTER (WHERE status IN ('Won','Deal Won')), COUNT(*) FILTER (WHERE status = 'Lost'), COALESCE(SUM(value) FILTER (WHERE status IN ('Won','Deal Won')), 0) FROM referrals WHERE <period>`; a `GROUP BY status` query; the period condition `(CAST(? AS INTEGER) IS NULL OR created_at >= to_char(now() - make_interval(days => CAST(? AS INTEGER)), 'YYYY-MM-DD HH24:MI:SS'))` with `days` bound twice), service and controller per Interfaces. The admin check comes before the period check. `byStatus` assembled in Java per the Global Constraints. Top-list methods may return empty lists for now.
- [ ] **Step 4: Run** `jt.sh ReferralReportTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): admin referral report: access, numbers and stages`

---

### Task 2: Period and the top lists

**Files:** Modify `ReferralReportRepository.java`, `ReferralReportService.java`; test `ReferralReportTest.java` (add).

**Interfaces:** Consumes Task 1. Fills `topReferrers` (`{ memberId, name, given, won, wonValue }`) and `topReceivers` (`{ memberId, name, received, won, wonValue }`) with `limit` 10.

- [ ] **Step 1: Write the failing tests** (add to `ReferralReportTest`)

```java
@Test void periodFilterUsesTheGivenDate()          // Review Focus: rows dated 5, 45 and 200 days ago (created_at as 'YYYY-MM-DD HH24:MI:SS' text) plus one with NULL created_at → 30d given 1, 90d given 2, all given 4
@Test void topReferrersAreOrderedByWonValueThenCounts() // M9701 gave 3 (won 2000 total), M9702 gave 5 (won 2000 total, 1 won), M9703 gave 1 (won 9000) → order M9703, then M9701 (more won), then M9702; given/won/wonValue exact
@Test void topReceiversMirrorThat()                // by recipient with received/won/wonValue; a member who only gave does not appear
@Test void topListsAreCappedAtTen()                // 12 different givers → exactly 10 returned, the two weakest left out
@Test void namesComeFromMembersWithAStoredFallback() // Review Focus: giver "M9704" renamed in members → current name shown; a referral whose giver M9799 is not in members shows the stored giver_name
@Test void periodAlsoLimitsTheTopLists()           // an old (200 days) won referral by M9701 is absent from the 30d topReferrers
```

- [ ] **Step 2: Run and see it fail.** `jt.sh ReferralReportTest` → the new tests fail (lists empty).
- [ ] **Step 3: Implement** `topGivers` and `topReceivers` (grouped by `giver_id` / `recipient_id`, `LEFT JOIN members m`, name `COALESCE(m.name, MAX(r.giver_name))`, the same period condition, `ORDER BY won_value DESC, won DESC, total DESC, member_id`, `LIMIT ?`) and map them in the service.
- [ ] **Step 4: Run** `jt.sh ReferralReportTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): admin referral report: period and top lists`

---

### Task 3: README, full suite, PR branch

**Files:** Modify `backend-java/README.md`.

- [ ] **Step 1: README.** Add the endpoint to "New features (not in Node)" (a row with login = admin, what it returns, the three periods).
- [ ] **Step 2: Run the full suite.** `jt.sh ALL` → `exit 0` and `PARITY: compared 441 replies, 0 differ`.
- [ ] **Step 3: Commit and push** the backend work to `Abhay_app`. Do the PR branch after the final review (so it carries any review fixes), as in the previous plans: in `E:\community_mobile_main` `git checkout main && git pull --ff-only origin main && git checkout -b feat/referral-report-backend && git checkout Abhay_app -- backend-java docs/superpowers`, commit, `git push -u origin feat/referral-report-backend`, back to `main`; confirm `git diff --stat Abhay_app feat/referral-report-backend -- backend-java` prints nothing.
- [ ] **Step 4 (user):** merge, `git pull`, `deploy-java.ps1`. Check from outside: the report without a login is 401; `/api/sangam/referrals/stats`, `/api/businesses` still 200.

---

### Task 4: Website helpers

Work on a new branch off `main` in `E:\community_mobile_main`: `git checkout main && git pull --ff-only origin main && git checkout -b feat/referral-report-website`.

**Files:** Create `frontend/src/pages/admin/referralReport.js`, `frontend/src/pages/admin/referralReport.test.js`.

**Interfaces:** Produces (pure ES module): `PERIODS = [{ key: '30d', label: 'गेले ३० दिवस (Last 30 days)' }, { key: '90d', label: 'गेले ९० दिवस (Last 90 days)' }, { key: 'all', label: 'सर्व काळ (All time)' }]`; `formatRupees(n)` → `₹` plus the Indian digit grouping (`125000` → `₹1,25,000`, `0` → `₹0`, non-numbers → `₹0`); `formatWinRate(rate)` → `—` for `null`/`undefined`/non-numbers, else the number with at most one decimal and a percent sign (`66.7` → `66.7%`, `50` → `50%`, `100` → `100%`); `barWidths(byStatus)` → the same rows with `widthPercent` (count ÷ largest count × 100, `0` for every row when the largest is 0); `reportPath(period)` → `/admin/referrals/report?period=<period>` for a known key, else the `all` path.

- [ ] **Step 1: Write the failing test** (`node:test`): `PERIODS` keys in order `['30d','90d','all']`; `formatRupees` for 125000, 0, 999, 1234567, `'abc'`, `undefined`; `formatWinRate` for `null`, `undefined`, `66.7`, `50`, `100`, `0` (→ `0%`); `barWidths` with counts `[2, 4, 0]` → widths `[50, 100, 0]` and with all zero → all `0`; `reportPath('30d')`, `reportPath('bogus')` → the `all` URL.
- [ ] **Step 2: Run and see it fail.** `node --test src/pages/admin/referralReport.test.js` → `Cannot find module`.
- [ ] **Step 3: Implement** the helpers.
- [ ] **Step 4: Run** the same command → `ℹ fail 0`.
- [ ] **Step 5: Commit** `feat(website): referral report helpers`

---

### Task 5: The report panel

**Files:** Create `frontend/src/pages/admin/reports/ReferralReportPanel.jsx`; modify `frontend/src/pages/admin/AdminShell.jsx`.

**Interfaces:** Consumes the helpers (Task 4); `apiClient.get(path)` from `services/apiClient` (returns the JSON reply and throws on an error status).

- [ ] **Step 1: Write the panel.** `ReferralReportPanel` (default export, props: none): holds `period` (default `all`), loads `apiClient.get(reportPath(period))` on mount and whenever the period changes; shows the period selector from `PERIODS`; headline tiles (given, won, lost, open, win rate via `formatWinRate`, won value via `formatRupees`); one CSS bar per `byStatus` row from `barWidths`; two tables (top referrers: name, given, won, won value; top receivers: name, received, won, won value); states: loading, an empty state `या कालावधीत अद्याप कोणताही संदर्भ नाही (No referrals in this period yet)` when `summary.given` is 0, and on failure the server's message (never zeros shown as real). Own inline styles; no imports from `AdminShell`.
- [ ] **Step 2: Wire it in `AdminShell.jsx`.** (a) Import the panel and render it at the top of `ReferralsView`, above the existing title row. (b) Route `/b2b/referrals/report` (currently `B2BReferralFullReport`, which shows three invented referrals) now renders the panel inside a plain container, and the `B2BReferralFullReport` import is removed; the old file is left in place, unused. (c) In `ReferralsView`'s cards read the real field names: `r.giver_name || r.giverName` and `r.recipient_name || r.receiverName`, and the value from `r.value`.
- [ ] **Step 3: Build and test.** `npm run build` → `✓ built in`; `node --test src/pages/admin/referralReport.test.js src/pages/sangam/referralList.test.js src/pages/business/enquiryList.test.js src/pages/business/businessParams.test.js src/services/directApi.test.js` → `ℹ fail 0`. (If the build fails with a memory error free memory and retry; if `cm-data.js` is missing run `git sparse-checkout add frontend/assets/js`.)
- [ ] **Step 4: Commit** `feat(website): admin referral report panel, replacing the page with invented referrals`

---

### Task 6: Ship the website

- [ ] **Step 1:** `git push -u origin feat/referral-report-website`; give the user `https://github.com/ttppgames11-dotcom/cm/pull/new/feat/referral-report-website`; `git checkout main`.
- [ ] **Step 2 (user):** merge it after the Java deploy of Task 3 (before that, the panel shows the server's error message instead of numbers).
- [ ] **Step 3: Live check with the user** (logged in as an admin such as connectAdmin): open `/admin/referrals`; the report panel shows the real totals (they must match `/api/sangam/referrals/stats` for "All time"); switch the period; open `/admin/b2b/referrals/report` and see the same panel instead of invented names; log in as an ordinary member and confirm the report call is refused (the admin area stays closed to them).
- [ ] **Step 4: Rollback if needed:** revert the website PR; revert the backend PR and run `deploy-java.ps1`. No data changed.
