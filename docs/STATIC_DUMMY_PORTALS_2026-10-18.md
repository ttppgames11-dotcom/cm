# Static / dummy portals: what they show now and what to add

Found by scanning every page in `frontend/src/pages` for data typed into the code (not loaded from the API). **Backend** below means an endpoint already exists in `backend/routes`, so only the page needs wiring. "Needs API" means the backend work is also missing.

## A. Should be live but is dummy (highest priority)

| Page | Today | What to add |
|---|---|---|
| `member/NotificationsPage` | `DEFAULT_NOTIFICATIONS` list | Backend: `notifications` collection exists. Load per user, mark read, push new ones via realtime |
| `member/DigitalMemberCardPage` | Card built from local data only | Load member + QR from `/api/members/:id/card`; QR that opens a public "verify member" page |
| `sangam/BusinessSangamPage` | `HISTORIC_CHAPTERS` + `cmdb` local | Chapters, members and meetings from `/api/sangam/*`; chapter join requests |
| `admin/SevaHelpdeskCRM` | `INITIAL_BLOOD_REQUESTS`, `REGISTERED_DONORS`, hospital aid, scholarships | Backend: blood requests/donors and scholarships exist. Wire them, add status updates and donor call log |
| `admin/CEODashboardPage` | `CEO_DETAILED_MANDAL_REPORTS` | Needs API: real counts per division/district from members, referrals, tickets. Add date range and CSV export |
| `jobs/ServiceBookingPage` | `PROVIDERS_BY_CATEGORY` | Backend: `/api/services` exists. Real providers, booking requests, provider reviews |
| `community/NewsAnnouncementsPage` | `DEFAULT_NEWS` | Backend: `news` collection exists. Admin posts announcements, push to members |
| `community/MarathaNewsMediaPage` | `newsChannels` | Needs API (channel list) or keep static but add admin-editable list in Site Content Editor |
| `culture/BooksLiteraturePage` | `booksData` | Backend: `/api/books` exists. Wire it, add book reviews and "suggest a book" |
| `culture/MarathiMoviesPage` | local list | Backend: `/api/movies` exists. Wire it, add ratings |
| `community/MovementsPage` | `DEFAULT_MOVEMENTS` | Needs API: events/movements list with admin editor |
| `governance/AchieversPage` | `ACHIEVERS_DATA` | Needs API: members can nominate an achiever, admin approves |
| `network/MaharashtraNetworkPage` | `DEFAULT_NETWORK_DIVISIONS` | Derive division/district/taluka counts from the members table and the location tables |

## B. Mixed: has API calls but falls back to built-in sample data

| Page | What to add |
|---|---|
| `community/BloodHelpPortalPage`, `seva/EmergencyAlertNetworkPage` | Show real requests only. Realtime push for new SOS, nearby-donor matching by district |
| `donation/DonationsPage` | Real campaigns, payment gateway (Razorpay) with receipts and 80G certificate PDF |
| `business/BusinessDirectoryPage` (+ `defaultBusinesses.js`) | Remove sample businesses, add owner verification and reviews |
| `community/WomenEmpowermentPage`, `PoliticalLeadersPartiesPage`, `CommunityOralHistoryPage` | Admin editor + member submissions with moderation |
| `directory/PeopleDirectoryPage` | Search by profession/district, "connect" requests |
| `sangam/MeetingsPortalPage` | Calendar invites, attendance check-in by QR |
| `member/MemberDashboardPage`, `member/UserProfilePage`, `member/RegisterWizardPage` | Profile completeness meter, photo upload to `/api/media`, Aadhaar-free KYC options |
| `admin/PradeshAdminCRM`, `DivisionAdminCRM` | Real roll-ups from the API instead of built-in division list |

## C. Reference content that is fine as static (but could be editable)

History, forts (350+), calendar, quiz, heritage map, symbols, temples, food culture, dialects, Granthalaya, Dnyankosh, knowledge graph, Shivkal festivals, About/Vision/Objectives/Why join, Privacy, Terms. These are content, not live data.
Improvement: move the large `src/data/*` files to JSON files fetched on demand, and add an admin editor so non-developers can correct entries.

## D. New portals worth adding
1. **Scholarship application tracker** (apply, upload documents, status).
2. **Member grievance / ticket tracking** for members (admins already have tickets).
3. **Event ticketing** with QR check-in.
4. **Mentorship matching** (professionals to students).
5. **Local help map** (nearest blood donors, hospitals, community centers).
6. **Payments and receipts** for membership fees and donations.

## E. Hardcoded logins removed in this change
- `AuthContext.jsx`: built-in officer accounts, master passwords and the forged local token. All logins now go to the server.
- `CRMLoginPage.jsx`: the clickable cards that showed every role's ID and password, and the local password check.
- `CRMRoleHubPage.jsx`: "demo login" buttons. They now open the real login.
- `SuperAdminDashboardPage.jsx`: one-click `admin@connectmaratha.org / password123` login.
- `AdminERPPage.jsx`: "1-click SuperAdmin" button.
- Default password `password123` when an admin creates a user (`SuperAdminDashboardPage`, `SuperAdminPage`, `apiClient.createAdminUser`). A password of at least 8 characters is now required.

Not changed: `referralService.js` still has a built-in list of official referrer IDs (not logins). Replace it with a server lookup when convenient.
