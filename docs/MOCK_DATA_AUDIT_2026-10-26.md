# Mock / seeded / dummy data and format issues: audit 2026-10-26

Read-only scan of `backend/db.json`, `database/connect_maratha.db`, `database/seed*.js`, `backend/routes`, and `frontend/src`. Nothing was changed. The home page was not touched.

Not checked: the large `frontend/src/data/*` datasets line by line, `server/`, `src/`, `react_version/` (stale copies), and whether any page actually renders the fallback data at runtime.

## 1. Test / placeholder accounts in the live data

| Where | What | Fix |
|---|---|---|
| `members` (JSON and SQLite, 170 rows each) | 12 built-in staff accounts with fake phones `98765000xx` / `9822099999` and `*@connectmaratha.com` mailboxes: `CM-SUPER-001`, `CM-ADMIN-001`, `CM-CEO-0088`, `CM-DIV-0011`, `CM-DIST-0022`, `CM-TAL-0077`, `CM-BR-0011`, `CC-MGR-0099`, `CM-CHAP-0033`, `CM-SEVA-0044`, `CM-FIN-0055`, plus `connectAdmin` | Replace with real officers or delete before launch. Check each has a strong, non-default password |
| `members` | `M8121` has phone `9999988881` | Delete or correct |
| `volunteers` | phone `+917777777777` | Correct |
| `serviceBookings`, `builderInquiries`, `hotelBookings`, `manufacturerInquiries`, `doctorAppointments`, `matrimonyInterests` | 5 rows each with phone `+919876543210` (30 rows) | Test submissions: delete |
| `staff` (6), `organizationUnits` (16), `communityCenters` | contact phones `98765000xx` | Real numbers needed |
| `auth.routes.js:161-162`, `frontend/src/services/referralService.js` | `KNOWN_OFFICIAL_REFERRERS`: 8 invented referrers (`CM-PUN-0842` ... `CM-OFFICIAL-2026`) with phones `98220119xx` and `18001231674`. Registration still resolves referral codes against this list | Replace with a server lookup of real members |
| `realtimeDb.js:219` | `KNOWN_DEFAULTS` list of default passwords (`password123`, `admin1674`, `ceo1674`...) is used to flag accounts | Good as a guard. Confirm no member still has one of these hashes |
| `AdminShell.jsx:285`, `DigitalMemberCardPage.jsx:57,1361`, `MemberDashboardPage.jsx:103` | Fallback member ID `CM-MH-9876543210` / `9876543210` shown when a member is missing | Show an empty state instead |

## 2. Seeded sample content shown as if real

**Database collections (`backend/db.json`):**

| Collection | Rows | Problem |
|---|---|---|
| `builders` | 23 | 5 have RERA no. `P521000XXXXX`. The `directories.routes.js:828` code also writes this placeholder for any new builder with no RERA |
| `books` | 12 | 4 images missing: `book_shriman_yogi.jpg`, `book_chhaava.jpg`, `book_rau.jpg`, `book_sabhasad.jpg` |
| `speakers` | 8 | All 8 photos missing (`nitin_bangude.jpg`, `shiviratna_shete.jpg`, `namdevrao_jadhav.jpg`, `pravin_gaikwad.jpg`...) |
| `news` | 6 | 3 images missing: `sangam.jpg`, `sarthi.jpg`, `forts.jpg` |
| `information` | 11 | 1 image missing: `generated/business_sangam_hero.jpg` |
| `dairy`, `socialWorkers` | 6 / 5 | Landlines in mixed formats (`0231-2652200`, `+91 22 2372 1122`) next to 10-digit mobiles |
| Seeded in bulk | ~600 rows | doctors 24, bloodRequests 24, bloodDonors 24, matrimony 20, grievances 18, volunteers 19, womenHelp 18, bankLoans 22, businesses 18, businessReviews 18, referrals 19, meetings 17, events 18, eventRsvps 18, donations 18, jobs 18, serviceBookings 23, speakerBookings 18, hotels 11 and more. Counts like 18-24 per collection point to generated test data. Decide per collection which rows are real |
| `auditLogs` / `notifications` / `otpCodes` / `tokenBlacklist` | 933 / 94 / 19 / 18 | Test-run noise. Clear before launch (OTP and blacklist entries are runtime state) |

**SQLite (`database/connect_maratha.db`):**

| Table | Problem |
|---|---|
| `quiz_questions` (26,000) | Machine-generated. 11,985 start with a tag like `[ऐतिहासिक संदर्भ संच 501] (प्रल्हाद निराजी विशेष):`. Only 2,068 distinct option sets. `year` is `1674` on 13,960 rows (54%). Correct answer is `option_a` on 65% (17,052). All marked `verified` and cite "State Gazetteers" with no `source_url`. Players will spot the pattern. `database/quiz_meta/stats.json` and README say 20,500, the DB has 26,000 |
| `maharashtra_colleges` (720) | Template data: 36 districts x 20 rows. Every college in a district shares one invented website (`https://pune-edu.mahacolleges.in`). All 720 phones are invented (`०२12-200246`, `०२13-200369`: mixed Devanagari and ASCII digits, sequential). Images are 1 of ~20 generic campus pictures, not the real college. Fees, rankings and "NAAC A++" claims are unverified |
| `seed.js` and `sevaEmergency.routes.js` | `seedDefaultSevaData()` inserts a sample emergency (EMG-1001, a highway accident) and sample help requests automatically when `emergency_cases` is empty. This will show a fake live emergency on a fresh production database |
| `seed.js` | Seeds members, businesses, groups, posts, campaigns, events, referrals and jobs only when the members table is empty. Never run it against production |

## 3. Frontend data that is typed into the code (not loaded from the API)

Static fallbacks found: `DEFAULT_NOTIFICATIONS`, `DEFAULT_NEWS`, `DEFAULT_MOVEMENTS`, `DEFAULT_TEMPLES`, `DEFAULT_PROJECTS`, `DEFAULT_CAMPAIGNS` (donations), `DEFAULT_FALLBACK_PROVIDERS` (service booking), `DEFAULT_CONVERSATIONS` (messages), `DEFAULT_NETWORK_DIVISIONS`, `DEFAULT_MEMBERS` + `INITIAL_SCHEDULED_MEETINGS` + `INITIAL_PAST_MEETINGS` (Sangam meetings), `INITIAL_REFERRALS` (referral tracker), `INITIAL_BLOOD_REQUESTS` / `INITIAL_SCHOLARSHIPS` / `INITIAL_HOSPITAL_AID` (Seva helpdesk), `INITIAL_COMMUNITY_STORIES`, `INITIAL_FALLBACK_CONTENT`, `defaultBusinesses.js`. `services/dataStore.js` is dead code with more sample doctors, blood requests and matrimony.

Examples that look real but are not: invented members "राजेश पाटील", "सुप्रिया मोहिते", referral `REF-2026-091` worth ₹8,50,000 ("Won"), notification "₹५,००,००० business referral received", meeting `MTG-881` with a phone `98221 44550`.

Existing list with more detail: `docs/STATIC_DUMMY_PORTALS_2026-10-18.md`. Items there are still open.

**Placeholders and test values in UI text:** `P52100018942` RERA (BuildersDirectoryPage), `XXXXX` masks in BloodHelp / CommunityCenterCRM / FinanceLedger, `XXXXXXXX` on ContactPage, `9876500000` in BusinessDirectory / Jobs / Governance / Events, `you@example.com` / `rahul@example.com` / `patil@example.com` in form placeholders, "Coming Soon" labels in SuperAdminPage (Bank & Finance).

**Remote stock images** in `CommunityCentersPortalPage` (9), `AchieversPage`, `AboutPage`, `InteractiveHeritageMapPage`, `WomenEmpowermentPage`, `SevaHelpdeskCRM`: hotlinked and can break or show the wrong person.

## 4. Incorrect format / missing data

| Issue | Evidence |
|---|---|
| Members without contact data | 134 of 170 have no phone, 140 of 170 have no email (dup key `''` x90 phones, x140 emails). Imported or partial records, so lookups by phone and email collide |
| Members without a password | 155 of 170 in `db.json` have no `password_hash` (the live SQLite had 84 of 87 earlier). They cannot log in and can be taken over by anyone who sets a reset |
| Mixed member ID formats | `M####` (149), `M######` (8), `CM-…-###`, `CC-MGR-####`, `connectAdmin`. No single rule, and the vanity IDs collide with the random `M######` generator |
| Location data missing | Members have `district_id`, `taluka_id`, `village_id` = null. SQLite `countries`, `states`, `districts`, `talukas`, `villages` are all **0 rows** while the README advertises 44,810 villages and 360 talukas |
| Empty tables that pages expect | SQLite `doctors`, `builders`, `blood_*`, `movies`, `speakers`, `officers`, `jobs`, `campaigns`, `grievances`, `dairy`, `manufacturers` are all 0 rows. The data exists only in `db.json`. Two stores disagree |
| Empty collections | `quizQuestions` 0 in JSON, `territoryOfficers` 0, `branches` 0, `branchActivities` 0, `unitActivities` 0 |
| Phone format | No rule: `+919876543210`, `98221 44550`, `+91 98220 99999`, `0231-2652200`, Devanagari digits. Registration should normalise to 10 digits starting 6-9 |
| Duplicate/timestamped assets | `frontend/assets/images/generated/*_17900….jpg` copies beside each hero image |
| Missing audio | `culture.routes.js` points the 6 dialect samples to `/assets/audio/*.mp3`. The `assets/audio` folder does not exist |
| Env | Root `.env` holds only `VITE_API_TARGET`. No `JWT_SECRET`, SMTP or DB variables are set locally. `nodemailer` is still not in `backend/package.json`, so reset emails cannot send |
| Repo | `backend/db.json` and `database/connect_maratha.db` hold real member PII. They are in `.gitignore` and staged for deletion, but remain in git history. 3 app copies (`src/`, `server/`, `react_version/`) are stale |

## 5. Checklist before shipping

- [ ] Delete or replace the 12 built-in staff accounts. Set real phones, emails and strong passwords
- [ ] Remove `KNOWN_OFFICIAL_REFERRERS` (backend and `referralService.js`) and resolve referrals from the members table
- [ ] Remove the 30 test rows with `+919876543210`, `+917777777777`, `9999988881`
- [ ] Decide per collection: keep real rows, delete the generated ones (section 2 list)
- [ ] Clear `auditLogs`, `notifications`, `otpCodes`, `tokenBlacklist`
- [ ] Stop `seedDefaultSevaData()` and `seed.js` from running in production
- [ ] Replace RERA `P521000XXXXX` with a real number or "not provided"
- [ ] Add the 16 missing image files (books 4, speakers 8, news 3, information 1) or point to existing ones
- [ ] Add or remove the dialect audio files
- [ ] Rebuild the quiz without the `[संच N]` tags and fix the answer and year skew, or label it as practice content
- [ ] Replace the 720 template colleges with sourced data, or hide the page until then
- [ ] Load the district / taluka / village tables, or remove the location validation
- [ ] Normalise phone numbers and IDs in one validator used by register, admin create and import
- [ ] Replace frontend `DEFAULT_*` / `INITIAL_*` fallbacks with empty states
- [ ] Set `JWT_SECRET`, SMTP and DB variables; add `nodemailer`
- [ ] Purge `backend/db.json` and the `.db` from git history, and rotate secrets
