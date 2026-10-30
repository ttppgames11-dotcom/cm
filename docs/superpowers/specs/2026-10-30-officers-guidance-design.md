# Civil services guidance: officer mentors for MPSC / UPSC students (design)

Date: 2026-10-30. Status: awaiting review.

## Goal

Make the "⭐ सनदी अधिकारी स्पर्धा परीक्षा केंद्र" page (`/officers`) real: serving and retired officers from the community become guidance mentors for students preparing for MPSC / UPSC. Members apply and an admin approves (which includes checking that the person really is an officer). Admins can also add officers who have no account. Logged-in students send a guidance request; the officer (or the admin, for officers without an account) accepts or declines, with bell notifications both ways. Officers have an "accepting requests" switch for busy periods. Website only; the app comes later.

## Decisions taken with the user

- Purpose: guidance for MPSC / UPSC students (option A).
- The same rules as speakers (option A): admin approval; admin-added officers without an account whose requests go to all admins; the officer's phone shared only after acceptance; students must be logged in; 5 requests per 24 hours, one open request per officer; the built-in sample cards removed for an empty state.
- An "accepting requests" switch (option A): when off, the card stays visible but new requests are refused; open requests can still be answered.
- A separate `officer` feature copying the `speaker` pattern (approach 1); the speaker code is not touched.

## Findings in the current code

- `/officers` is `pages/governance/GovernmentOfficersPage.jsx` (905 lines). It calls `apiClient.getOfficers()` (`GET /api/officers`) and `addOfficer()` (`POST /api/officers`); the live API answers 404: no backend exists in Java or Node.
- The page shows 25 built-in cards of real, well-known officers with photos, under "आपले अभिमानास्पद शासकीय अधिकारी !", many not from the community. Nothing on the page is about exam guidance.
- The speaker feature (`docs/superpowers/specs/2026-10-30-speakers-mentors-design.md`, backend live as PR #48) is the model: `SpeakerRepository` / `SpeakerService` / `SpeakerSchemas` / controllers, `SpeakerTestBase`, `speakersHelp.js`, the speaker modals and the admin `SpeakersView`. Its final review added two rules this feature keeps: a request saves only its own checked fields; linking by phone refuses a phone that two members share (409 `MEMBER_AMBIGUOUS`).

## Scope

In: the two tables, applying / editing / the accepting switch, admin approve / reject / hide / add / link / pause / resume, the public list with filters, guidance requests, accept / decline / cancel, notifications, the rewritten page with tabs, the admin "Officers (अधिकारी)" view, bell links.
Out: the mobile app, photos and ID document uploads (the admin checks by other means), study material and exam dates, group sessions, calendars, payments, ratings, email / SMS / WhatsApp, the Node backend.

## Codes

Stored as codes, shown with Marathi labels by the website.

- Service: `ias` IAS, `ips` IPS, `ifs` IFS, `irs` IRS, `central` इतर केंद्रीय सेवा, `mpsc_1` MPSC वर्ग १, `mpsc_2` MPSC वर्ग २, `mpsc_psi` PSI / STI / ASO, `other` इतर.
- Service status: `serving` 🟢 कार्यरत, `retired` 🔵 निवृत्त.
- Exams: `upsc_cse` UPSC नागरी सेवा, `mpsc_rajyaseva` MPSC राज्यसेवा, `mpsc_group_b` MPSC गट ब, `mpsc_group_c` MPSC गट क, `other_exam` इतर स्पर्धा परीक्षा.
- Stage: `start` सुरुवात, `prelims` पूर्व परीक्षा, `mains` मुख्य परीक्षा, `interview` मुलाखत.
- Mode: `phone` 📞 फोन, `meeting` 🤝 प्रत्यक्ष भेट, `online` 💻 ऑनलाइन.

## Data

Migration `database/migrations/016_officers.sql`, also created on first use through `LazyTables` (`IF NOT EXISTS`).

`officers`: `id` TEXT PRIMARY KEY (`"OFF-" + millis + 4 random`), `member_id` TEXT (NULL = added by an admin), `name` TEXT NOT NULL, `service` TEXT NOT NULL, `service_status` TEXT NOT NULL, `batch_year` INTEGER, `post` TEXT NOT NULL, `department` TEXT, `city` TEXT NOT NULL, `exams` TEXT NOT NULL (comma-separated exam codes), `intro` TEXT, `phone` TEXT NOT NULL, `accepting` BOOLEAN NOT NULL DEFAULT true, `status` TEXT NOT NULL DEFAULT `'pending'`, `reject_reason` TEXT, `hidden` BOOLEAN NOT NULL DEFAULT false, `created_at` / `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now().
- `CREATE UNIQUE INDEX IF NOT EXISTS officers_one_per_member ON officers (member_id) WHERE member_id IS NOT NULL`.

`officer_requests`: `id` TEXT PRIMARY KEY (`"ORQ-…"`), `officer_id` TEXT NOT NULL, `member_id` TEXT NOT NULL, `exam` TEXT NOT NULL, `stage` TEXT NOT NULL, `question` TEXT NOT NULL, `mode` TEXT NOT NULL, `message` TEXT, `status` TEXT NOT NULL DEFAULT `'new'` (`new` / `accepted` / `declined` / `cancelled`), `created_at` / `updated_at`.
- `CREATE UNIQUE INDEX IF NOT EXISTS officer_requests_one_open ON officer_requests (officer_id, member_id) WHERE status = 'new'`; indexes on `officer_id` and `(member_id, created_at)`.
- The student's name and phone are read from `members`, not copied.

Limits: name / post / department / city 100, intro 1000, question 500, message 1000; phone 10 digits after removing spaces and dashes; batch year 1950 to the current year; exams: one or more known codes, no duplicates (stored sorted and comma-separated).

## Rules

- **Applying:** logged in, one profile per member (409 `OFFICER_EXISTS`), starts `pending` with `accepting` true.
- **Editing my profile:** any status; back to `pending`, reason cleared; `accepting` unchanged.
- **The switch:** `PUT /api/officers/mine/accepting` `{accepting}` changes only `accepting` (no re-approval). Admins use `pause` / `resume`.
- **Public list:** `approved` and not `hidden`; never `phone` or `member_id`; includes `accepting`.
- **Sending a request:** logged in; approved and not hidden (404 `OFFICER_NOT_FOUND`); not my own (400 `OWN_PROFILE`); `accepting` (409 `NOT_ACCEPTING`); `exam` one of the officer's exams (400 `EXAM_NOT_OFFERED`); valid `stage`, `mode` and a question (400 `VALIDATION_ERROR`); at most 5 per member in 24 hours (429 `RATE_LIMIT_EXCEEDED`); one open per officer (409 `REQUEST_EXISTS`). Only the request's own fields are saved.
- **Answering:** `accept` / `decline` by the officer's member, or by an admin when the officer has no account; `cancel` by the student; only while `new` (`UPDATE … WHERE status = 'new'`, 0 rows → 409 `ALREADY_ANSWERED`). Works whatever the officer's status, `hidden` or `accepting`.
- **Phones:** the officer's phone only to the student of an `accepted` request (and admins); the student's name and phone only to that request's officer (or admins, for an officer without an account).
- **Admin:** approve, reject (optional reason), hide, unhide, add (approved at once, no account), link (member id or phone; 404 `MEMBER_NOT_FOUND`, 409 `MEMBER_AMBIGUOUS`, 409 `OFFICER_EXISTS`), pause, resume; all need `Roles.isAdmin` (403 otherwise).

## Notifications

`ActivityRepository.notifyMember`, each in its own transaction inside try/catch (a failure never undoes the action).

| Type | To | Title / message |
|---|---|---|
| `officer` | the member | approved: `⭐ तुमचे अधिकारी-मार्गदर्शक प्रोफाइल प्रकाशित झाले` / `आता विद्यार्थी तुम्हाला मार्गदर्शनासाठी विनंती पाठवू शकतात.`; rejected: `⭐ अधिकारी प्रोफाइल मंजूर झाले नाही` / the reason or `कृपया माहिती तपासून पुन्हा अर्ज करा.` |
| `officer_request` | the officer's member | `🧭 नवीन मार्गदर्शन विनंती: {exam label}` / `{student name}: {question, first 80 characters}` |
| `officer_admin` | every admin except the sender (officer without an account) | `⭐ {officer name} साठी नवीन मार्गदर्शन विनंती` / `{student name}: {question}. अधिकाऱ्यांना फोन करून उत्तर द्या.` |
| `officer_reply` | the student | `✅ {officer name} यांनी तुमची विनंती स्वीकारली` / `संपर्क क्रमांक 'माझ्या विनंत्या' मध्ये पहा.`; `❌ {officer name} यांनी तुमची विनंती नाकारली` / `'माझ्या विनंत्या' मध्ये पहा.` |

The server sends the exam label in the request title; exam labels are kept in `OfficerSchemas`.

## Server

A new package `officer/` (`controller`, `service`, `repository`, `dto/OfficerSchemas`), like `speaker/`.

| Method and path | Who | What |
|---|---|---|
| `GET /api/officers?exam=&service=&search=` | anyone | approved, visible officers; `accepting`; for a viewer `mine`, `requested` |
| `GET /api/officers/mine` | logged in | my profile or `null` |
| `POST /api/officers` | logged in | apply |
| `PUT /api/officers/mine` | logged in | edit |
| `PUT /api/officers/mine/accepting` | logged in | `{ accepting }` |
| `POST /api/officers/{id}/requests` | logged in | `{ exam, stage, question, mode, message }` |
| `GET /api/officers/requests/mine` | logged in | requests I sent |
| `GET /api/officers/requests/incoming` | logged in | requests to my profile |
| `PUT /api/officers/requests/{id}` | logged in | `{ action: accept / decline / cancel }` |
| `GET /api/admin/officers` | admin | every officer, pending first, `pending` count |
| `POST /api/admin/officers` | admin | add an officer |
| `PUT /api/admin/officers/{id}` | admin | `{ action: approve / reject / hide / unhide / link / pause / resume, reason?, member? }` |
| `GET /api/admin/officers/requests` | admin | requests for officers without an account |

## Website

`/officers` keeps its hero, colours and card style, with four tabs: ⭐ सर्व अधिकारी, 📋 माझ्या विनंत्या (logged in), 📥 मला आलेल्या विनंत्या (with a profile), 👤 माझे प्रोफाइल (logged in); `?tab=all|mine|incoming|profile`.

- `GovernmentOfficersPage.jsx`: rewritten; the 25 built-in officers removed. Filters: exam, service; search applied with a button / Enter. Empty state: "अजून अधिकारी नाहीत. तुम्ही अधिकारी असाल तर मार्गदर्शक व्हा!" with [अर्ज करा].
- Card: initial, name, service label, 🟢/🔵, post, department, city, exam chips, intro; never a phone. Button per `requestButton`: `login` "लॉगिन करा व मार्गदर्शन मागा", `own` "हे तुमचे प्रोफाइल आहे", `paused` "⏸️ सध्या विनंत्या घेत नाहीत", `requested` "⏳ विनंती पाठवली", `request` "🧭 मार्गदर्शन मागा".
- `OfficerApplyModal.jsx` (new): apply / edit, exams as tick boxes (at least one); also the admin add form (`save`, `heading` props).
- `OfficerRequestModal.jsx` (new): exam (only the officer's), stage, question, mode, message.
- `officersHelp.js` + test (new, `node --test`): the label lists, `label(list, code)`, `examList(codes)`, `requestButton(officer, loggedIn)` (order: login, own, paused, requested, request), `officerPayload`, `requestPayload`, `officerQuery`, request / profile statuses.
- `apiClient.js`: officer calls replace `getOfficers` / `addOfficer`.
- `AdminShell.jsx`: "Officers (अधिकारी)" view (pending first; approve / reject with reason / hide / pause–resume / link; add officer; requests for officers without an account with accept / decline).
- `notificationList.js` (+ test): `officer` → `/officers?tab=profile`, `officer_request` → `/officers?tab=incoming`, `officer_reply` → `/officers?tab=mine`, `officer_admin` → `/admin/officers`; icon ⭐.

## Testing

- `OfficerProfilesTest` and `OfficerRequestsTest` (JUnit on embedded PostgreSQL, like the speaker tests): the speaker rules, plus: the switch off → 409 `NOT_ACCEPTING`, open requests still answerable, the switch does not send the profile back to pending, admin pause / resume; an exam the officer does not offer → 400; unknown service / exam / stage / mode codes → 400; duplicate exams stored once; batch year limits; only the request's own fields saved; linking by a shared phone → 409.
- `officersHelp.test.js`, `notificationList.test.js` with `node --test`; `npm run build`.
- Manual check on the live site after release.

## Release

1. Merge the backend PR. 2. `deploy-java.ps1`. 3. `GET https://api.connectmaratha.com/api/officers` answers 200. 4. Merge the website PR. The speakers website PR also adds a line to the admin menu in `AdminShell.jsx`; whichever is merged second may need that small conflict resolved.
