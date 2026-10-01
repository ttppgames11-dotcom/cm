# Connect Maratha — Production Go / No-Go Audit

**Verdict: NO-GO.** The app cannot be submitted to Google Play production yet. Several blockers are
external to the code (signing key, production API/DB, privacy policy, Play Console). Code-level
blockers found in this audit were fixed where possible and are listed as PASS with their evidence.

Date of audit: 24 Sep 2026. Scope: Flutter app (`E:\community_mobile\app`) and Node.js/PostgreSQL API
(`E:\cm-web\cm`, branch `feature/postgres`, committed locally, **not pushed**).

## How this was verified (and what was not)

| Evidence | Result |
|---|---|
| Backend integration tests (`npm test --prefix backend`, 16 tests: auth, authz, refresh rotation, suspension, report/block/moderation, donations disabled, error leakage, brute-force limit, **account deletion end-to-end**) | 16 / 16 pass on a local Docker PostgreSQL |
| `flutter analyze lib` | No issues |
| Release AAB build (`flutter build appbundle --release`) | see "Build result" at the bottom |
| Flutter widget tests (`flutter test`) | **NOT run** (run was declined during the session). Existing tests use `LocalAuthRepository`/demo data and the login/register screens were changed, so they must be re-run and updated |
| Testing on a physical device with the new build (login, register, Google, delete account, offline) | **NOT done** |
| Production API, production database, backups/restore, Firebase, Play Console | **Do not exist / not accessible** |

A build that compiles is not evidence of readiness; only the rows marked PASS below have direct evidence.

---

## 1. PASS

| # | Item | Evidence |
|---|---|---|
| 1 | Separate dev/staging/prod configuration; release refuses to start with HTTP, localhost or LAN API | `app/lib/core/config/api_config.dart` (`validate()`), called first in `main.dart` |
| 2 | Cleartext HTTP disabled in release, allowed only in debug builds | `android/app/src/main/AndroidManifest.xml` (`usesCleartextTraffic="false"`), `src/debug/AndroidManifest.xml` |
| 3 | No secrets in the Flutter app (only a public Google *web client ID* via `--dart-define`) | grep of `lib/` |
| 4 | Central API client: timeouts, error mapping (offline, timeout, 4xx, 429, 5xx, malformed JSON), no body logging | `app/lib/core/network/api_client.dart` |
| 5 | Tokens in Android Keystore-backed secure storage, never SharedPreferences | `core/storage/secure_token_store.dart`; legacy profile prefs cleared on logout |
| 6 | 15-min access token + rotating refresh token, reuse detection, server-side logout, `logout-all`, suspended accounts blocked instantly, roles read from DB per request | `backend/middleware/auth.js`, test "refresh token rotation…", "suspended members…" |
| 7 | Brute-force/rate limiting on login/register/refresh and general API | `backend/middleware/security.js`, test "login brute force…" |
| 8 | Server-side authorization on every write; identity taken from the token, never the body; role/tier cannot be self-assigned; contact details private | `backend/routes/*.js`, tests "members cannot use staff/admin endpoints…", "member contact details are private" |
| 9 | Account deletion (backend): re-auth + typed confirmation, single transaction, documented retention/anonymisation | `backend/routes/auth.routes.js`, `docs/ACCOUNT_DELETION.md`, test "account deletion end-to-end" |
| 10 | Report / block / moderation queue / suspend / audit log (backend) | `community.routes.js`, `admin.routes.js`, test "report + block + moderation flow" |
| 11 | Fake payment endpoint disabled (no fake 80G receipts); anonymous donors masked server-side | `donations.routes.js`, test "donations cannot be faked" |
| 12 | Safe error handler: no stack traces or internal messages returned; reference ID logged | `middleware/errorHandler.js`, test "errors never leak internals" |
| 13 | DB schema changes are numbered migrations, never applied at production startup | `database/migrations/`, `database/database.js`, `docs/PRODUCTION_RUNBOOK.md` |
| 14 | Demo/fake code removed from the release path: demo login chip, fake OTP tab/step, "abhay/123", fake security toggles, fake "OTP sent" toast, demo profile fallback | `login_screen.dart`, `register_screen.dart`, `security_privacy_screen.dart`, `current_user_provider.dart` |
| 15 | Permissions minimised to `INTERNET` (photos via system picker, camera via intent — no CAMERA/storage permission) | `AndroidManifest.xml` (merged manifest to be re-checked after build) |
| 16 | Release signing never falls back to the debug key; key files git-ignored | `android/app/build.gradle.kts`, `android/.gitignore`, `key.properties.example` |
| 17 | Version set to 1.0.0+1 | `pubspec.yaml` |

## 2. FAIL (release blockers)

| # | Item / file | Problem | Impact | Fix | Owner |
|---|---|---|---|---|---|
| F1 | `android/app/src/main/res/mipmap-*/ic_launcher.png` | Still the default Flutter icon | Play listing/review rejection, unprofessional | Generate branded adaptive icon (`flutter_launcher_icons`) | Flutter/design |
| F2 | Release keystore | None exists; `android/key.properties` missing → AAB is **unsigned** | Cannot upload to Play | Generate upload key, keep it outside the repo, enrol in Play App Signing, back it up | DevOps / Play Console |
| F3 | Production API + DB | Do not exist. Default prod URL `https://api.connectmaratha.com` is a **placeholder I did not verify** | App cannot log in in production | Provision host + managed PostgreSQL + TLS, set env vars per runbook, confirm domain | DevOps |
| F4 | Privacy policy | No published URL (`ApiConfig.privacyPolicyUrl` is a placeholder) | Mandatory for Play; Data Safety mismatch risk | Publish policy matching the data table in section 5 | Legal / Play Console |
| F5 | Crash reporting | Hook only (`core/diagnostics/error_reporter.dart`); no SDK/DSN configured | Blind to production crashes/ANRs | Add Sentry/Crashlytics, tag env + version, scrub PII | Flutter/DevOps |
| F6 | Community/UGC in the app | Feed, "create post" and groups use **local static data** (`features/community/data/community_data.dart`); nothing reaches the backend, and there is no Report/Block UI. The backend UGC safety APIs exist and are tested but the app does not use them | If posts become visible to others: Play UGC policy violation. Today the feature is not real | Either remove posting from v1, or wire the feed to `/api/community/*` and add Report/Block/Hide UI | Flutter |
| F7 | Seed/demo data | Admin `M1001` and 7 other members with password `password123` exist in the dev DB | Trivial admin takeover if ever seeded into production | Never run `seed.js` in production; create the first admin manually | Backend/DevOps |
| F8 | `google_fonts` fetches fonts from Google at runtime (no bundled fonts) | Sends users' IPs to Google (must be in Data Safety/privacy policy), and text renders in fallback fonts offline | Privacy disclosure + offline UX | Bundle the Mukta/Playfair fonts as assets and set `GoogleFonts.config.allowRuntimeFetching = false` | Flutter |
| F9 | Existing Flutter widget tests | Not run; tests reference removed demo behaviour | Regressions unknown | Run `flutter test`, update tests | Flutter |

## 3. NEEDS ACTION

| # | Item | What is needed | Owner |
|---|---|---|---|
| N1 | **Final application ID.** I set `com.connectmaratha.app` (namespace + package). This is irreversible after the first Play upload | Confirm or change it *now*; also update Google OAuth Android client to this package + signing SHA-1 | Owner decision |
| N2 | Target API 36 | See "Build result". The requirement date in the project report could not be verified by me; check Play Console → App content | Flutter/Play Console |
| N3 | Google Sign-In | Backend + app are implemented (server-verified ID token; unknown Google account → "user not found, please register" popup → registers from the verified token). Needs a Google Cloud project: Web client ID (`GOOGLE_CLIENT_IDS` on the API and `--dart-define=GOOGLE_WEB_CLIENT_ID=…` in the app) and an Android client for the final package + SHA-1. **Untested with real Google.** | DevOps |
| N4 | Account deletion UI | Implemented (Profile → Security & Privacy → Delete account) but **not run on a device**. Play also requires a public web URL/instructions for deletion in the Data Safety form | Flutter QA + Play Console |
| N5 | API versioning | Routes are unversioned (`/api/...`). Add `/api/v1` alias before shipping the mobile client | Backend |
| N6 | Foreign keys | Schema has no FK constraints; integrity is enforced in code (deletion test passes). Add FKs in a reviewed migration | Backend/DB |
| N7 | Legacy JSON collections (`backend/db.json`: doctors, blood requests, matrimony, grievances, volunteers, women help, builders, bank loans) | Now auth-protected and owner-filtered, but file-based: not durable, not backed up, not deleted with the account. Migrate to PostgreSQL or disable for v1 | Backend |
| N8 | Email/SMS service | No password reset, no OTP, no email verification. "Forgot password" tells users to contact support. Google login is refused for emails registered with a password (prevents account takeover) | Product/Backend |
| N9 | Backups + restore drill | Documented in `docs/PRODUCTION_RUNBOOK.md`; **nothing verified** | DevOps |
| N10 | Offline / weak-network / airplane-mode / back-navigation / cold-start tests | Manual on a physical device | QA |
| N11 | Reviewer account | Create a stable production account (not `M1001`), put credentials + steps in Play Console → App access | Play Console |
| N12 | Third-party assets | `assets/` (34 MB) contains photos of historical figures/forts/warriors and app imagery with no recorded licences; web repo also has leader/artist/doctor photos | Legal/Design |
| N13 | Play Console: Data Safety, content rating, target audience, ads declaration, store listing/screenshots, closed testing (12 testers × 14 days if a personal account created after 13 Nov 2023) | Complete; listing must not claim donations, OTP, biometric lock, matrimony/loan features that are not live | Play Console |
| N14 | iOS | `ios/` exists but was not audited (bundle ID, privacy manifest, Sign in with Apple requirement when offering Google login). Not part of this Android release | Flutter |
| N15 | Push notifications / deep links | Not implemented (no Firebase, no intent filters). Do not advertise them | — |

## 4. NOT APPLICABLE (feature does not exist)

Location data and permission handling; background location; push notifications/FCM; deep links; in-app
payments/wallet/commission; microphone/contacts/camera *permission*; ads; subscription billing.
(If any of these are added later, re-run this audit for that area first.)

## 5. Data actually collected (for Privacy Policy and Play Data Safety — draft)

Derived from `RegisterFormData`, `/api/auth/*`, `members` table and `AuthLocalDataSource`; **not guessed**.

| Data | Where it goes | Purpose | Notes |
|---|---|---|---|
| Name, phone, email | API → PostgreSQL `members` | Account, login | Email optional if phone given |
| Password | API (bcrypt hash only) | Login | Never stored in plain text |
| City, district, profession, business, education, skills, interests, about | API → `members` | Community profile | User-entered |
| Member ID, tier, role | API | Membership | |
| Google account email + name + ID token | Google → API (verified, token not stored) | Google Sign-In | Only if used |
| Auth tokens | Device Keystore; refresh-token hash in DB | Session | |
| Cached display profile (name, tier, phone, city) | Device SharedPreferences (cleared on logout/delete) | Fast start | |
| Profile photo | Chosen with system picker; **not uploaded** in this build | — | Re-check if upload is added |
| IP address | Sent to the API host and (until fonts are bundled) to Google Fonts | Security/rate limiting | Disclose |
| Analytics / crash reports | **None yet** | — | Update when a crash SDK is added |
| Location, contacts, device identifiers, ads | **Not collected** | — | |

Data is encrypted in transit only when the production API uses HTTPS (required by the release build).
Users can request deletion in-app (see N4).

## 6. Blocker check (spec section 30)

| Blocker | Status |
|---|---|
| App crashes on startup | Not observed in debug; release not run on device |
| Login/reviewer access fails | Backend PASS; reviewer account missing (N11) |
| Production API unavailable | **YES (F3)** |
| Privacy policy / Data Safety mismatch | **YES (F4)** |
| Account deletion missing/broken | Backend PASS; UI untested (N4) |
| Critical UGC safety gap | **YES (F6)** unless posting is removed or wired |
| Financial defect | No — donations disabled, no wallet |
| Release-blocking security issue | Fixed in code; F7 remains for data |
| Incorrect package/signing | **YES (N1, F2)** |
| Unsafe DB migration | No — additive migrations, runbook |
| Production build points to development API | No — release build refuses non-HTTPS/private hosts |
| Debug/test functionality exposed | Removed from release path; `LocalAuthRepository`/`DemoAccounts` remain in `lib/` for tests only |
| Backend authorization vulnerability | Fixed and covered by tests |

## 7. Recommended order to reach GO

1. Confirm the application ID (N1) → generate upload key (F2) → set up Google Cloud OAuth (N3).
2. Provision staging + production API/DB, run migrations, remove seed data, create the admin (F3, F7, N9).
3. Decide UGC scope (F6); bundle fonts (F8); branded icon (F1); crash SDK (F5).
4. Run `flutter test`, fix (F9); device QA including delete-account and offline (N4, N10).
5. Publish privacy policy (F4); complete Play Console forms, reviewer account, closed testing (N11, N13).
6. Rebuild `flutter build appbundle --release` with production settings, sign, upload to internal testing.

---

## Build result

_(filled in below after the release build finished)_

---

## Update after Flutter audit (24 Sep 2026)

- `flutter analyze`: no issues. `flutter test`: **57/57 pass** (includes `test/backend_integration_test.dart`, which drives the real repositories against the running Node/PostgreSQL API: register, wrong password, unknown user, token expiry + refresh rotation, feed create/like/report/block/delete, logout invalidation, account deletion; it fails if the API is unreachable).
- Debug APK built. **Release AAB built** (`app/build/app/outputs/bundle/release/app-release.aab`, 58.2 MB): package `com.connectmaratha.app`, versionName 1.0.0 / versionCode 1, minSdk 23, **targetSdk 36**, only `INTERNET` permission, cleartext off, backup off. **Unsigned** (no `android/key.properties`).
- F6 (UGC) is now wired: community feed + member directory load from the secured API with loading/empty/error/retry states, and posts/members have Report, Block and (own posts) Delete. Not yet exercised on a physical device.
- F9 resolved (tests updated/passing). Two real home-screen layout overflows introduced earlier were fixed.
- Still open: F1 icon, F2 keystore, F3 production API/DB (prod URL is a placeholder), F4 privacy policy URL, F5 crash reporting, F7 seed data, F8 bundled fonts, N1 confirm application ID, N3 Google Cloud setup, device QA.
