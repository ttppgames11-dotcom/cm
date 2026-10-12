# Backend Improvements & Pending Requirements

This document tracks backend API enhancements, database schema improvements, and future roadmap items identified during the Flutter mobile Referrals and 1-to-1 Meetings feature implementations.

---

## 1-to-1 Business Meetings (१-टू-१ व्यवसाय बैठका)

### 1. Store a Real ISO 8601 Start Time Field
- **Current Limitation**: The backend stores meeting date and time as free-text strings (`date` e.g., `"२० ऑक्टोबर २०२६"`, `time` e.g., `"सकाळी १०:००"`). The mobile app must maintain tolerant heuristics to parse Marathi textual numerals, ISO dates, and English formats.
- **Requirement**: Add a standardized `startTime` / `start_time` column (ISO 8601 UTC timestamp, e.g. `2026-10-20T04:30:00Z`) and duration field (`durationMinutes`, default 30 or 60). This enables accurate calendar synchronization (.ics, Google Calendar), timezone handling, and database-level temporal queries.

### 2. Implement Requested / Accepted / Declined State Workflow
- **Current Limitation**: When `POST /sangam/meetings` is called, the meeting is immediately inserted with status `"Confirmed"`. The recipient cannot accept or decline.
- **Requirement**: Introduce a proper peer-to-peer meeting workflow:
  - `POST /sangam/meetings` initializes the meeting with status `"requested"` (विनंती).
  - Recipient receives an action notification and can call `PUT /sangam/meetings/:id/accept` (transitions to `"confirmed"`) or `PUT /sangam/meetings/:id/decline` with optional reason (transitions to `"declined"`).
  - Both parties can subsequently reschedule (`"rescheduled"`) or cancel (`"cancelled"`).

### 3. Automated Reminders Before the Meeting
- **Current Limitation**: No scheduled notifications exist once a meeting is booked.
- **Requirement**: Implement a cron scheduler (or message queue worker) to send automated push notifications, in-app alerts, and SMS/WhatsApp reminders to both participants:
  - 24 hours before the meeting.
  - 1 hour before the meeting (including the online meeting link or venue address).

### 4. Link Meetings to Regional Chapters (मंडळे)
- **Current Limitation**: Meetings are strictly member-to-member and not linked to chapter chapters/sangams.
- **Requirement**: Add `chapterId` and `chapterName` to `meetings` table. This allows chapter leaders and admins to view chapter meeting activity metrics, foster localized networking, and reward active members during monthly chapter meets.

### 5. Include Company / Business Name in Member Search Results
- **Current Limitation**: `GET /members?search=<text>&limit=10` returns general member profile fields. Company details are not consistently indexed in search queries.
- **Requirement**: Include `company` and `companyName` in `GET /members` search projection and full-text search index, allowing members to search not only by person name and profession, but also by firm/company name.

### 6. Action Button Fallback for Legacy Backend Support (404/405 Handling)
- **Status & Client Behavior**: `PUT /sangam/meetings/:id` (reschedule) and `PUT /sangam/meetings/:id/status` (cancel/complete) endpoints have been implemented in `backend/routes/sangam.routes.js`. On the mobile app, if a server returns `404` or `405` (e.g. during phased backend rollout or legacy environments), the app automatically handles this by disabling and hiding the "वेळ बदला" (Reschedule) and "रद्द करा" (Cancel) buttons gracefully without crashing.

---

## Business Referrals (रेफरल ट्रॅकर)

### 1. Dedicated Referral Detail Endpoint with Audit/Status History
- **Current Limitation**: Currently, there is no `GET /sangam/referrals/:id` endpoint and no status audit trail. The app must load the list and extract the item.
- **Requirement**: Provide `GET /sangam/referrals/:id` that returns full referral details along with complete `statusHistory` entries:
  ```json
  {
    "status": "contacted",
    "updatedAt": "2026-10-09T10:30:00Z",
    "updatedBy": "user_id_123",
    "note": "Called client, scheduled demo"
  }
  ```

### 2. Authorization Rules: Receiver & Admin Status Updates Only
- **Current Limitation**: Any user with a token can theoretically call `PUT /sangam/referrals/:id/status`.
- **Requirement**: Restrict `PUT /sangam/referrals/:id/status` so that only the assigned receiver (`recipientId`) or an admin user is authorized to transition the referral status. Return `403 FORBIDDEN` for other members.

### 3. Store `clientConsent` Boolean Field in Schema
- **Current Limitation**: The app requires the giver to verify that the client has agreed to be contacted, but the backend does not persist this consent flag.
- **Requirement**: Add `clientConsent` (boolean, required `true` on creation) to `POST /sangam/referrals` payload and store it in the database for compliance and audit logging.

### 4. Normalized Status Codes instead of Localized Marathi Text Strings
- **Current Limitation**: Stored statuses in database are inconsistent Marathi/English strings (e.g., `"नवीन (New)"`, `"Proposal"`, `"Won"`, `"यशस्वी क्लोज (Success)"`), requiring custom heuristic regex classification in client apps.
- **Requirement**: Standardize backend status enum to fixed machine-readable keys:
  - `new`
  - `contacted`
  - `closed_won`
  - `closed_lost`
  The client and server should format localized display labels independently.

### 5. Mutual Confirmation for Final Closed Value
- **Current Limitation**: When closing a deal, the receiver alone submits the final deal value.
- **Requirement**: Introduce a two-party confirmation workflow where:
  1. The receiver proposes the closing value.
  2. The giver receives an approval request to confirm or adjust the recorded business value before it counts toward the member's official network score.

### 6. Notifications to Giver on Status Changes
- **Current Limitation**: Currently, only the recipient receives a notification on creation if `recipientId` is provided. The giver is not notified when status progresses.
- **Requirement**: Send in-app push and notification records to the giver whenever the referral transitions status (e.g., when the lead is marked "संपर्क साधला" or "यशस्वी क्लोज").

### 7. Automated Reminders for Uncontacted Referrals (48-Hour SLA)
- **Current Limitation**: No automated follow-up mechanism exists for inactive leads.
- **Requirement**: Implement a cron worker that checks referrals in `new` status. If not moved to `contacted` within 48 hours of creation, send reminder notifications to the receiver to ensure quick response times.

### 8. Personal Member Stats Endpoint
- **Current Limitation**: Member stats (given count, received count, closed count, and total closed value) must be computed on the client side from the user's fetched list. `/sangam/metrics` only returns aggregate statistics for the entire community network.
- **Requirement**: Provide `GET /sangam/referrals/stats/me` returning:
  ```json
  {
    "givenCount": 12,
    "receivedCount": 8,
    "closedCount": 5,
    "totalClosedValue": 1250000.0
  }
  ```

---

## Builders & Developers (मराठा बिल्डर्स व डेव्हलपर्स)

### 1. Separate Builder Profile Model from Projects
- **Current Limitation**: Currently, `GET /builders` returns individual project records where developer company metadata (`developer`, `ownerName`, `phone`, `city`, `flatsDelivered`, `discountForMembers`) is duplicated across each project entry. The mobile client must group records dynamically by developer name.
- **Requirement**: Create a dedicated `builders` or `developers` entity/collection separate from `projects`:
  - `Builder`: `id`, `name` (developer brand), `ownerName`, `ownerId`, `officeAddress`, `headquarterCity`, `phone`, `email`, `website`, `flatsDelivered`, `establishedYear`, `logoUrl`, `verifiedStatus`, `discountAgreementId`.
  - `Project`: `id`, `builderId`, `projectName`, `location`, `city`, `configuration`, `projectType` (`flats` | `villas` | `plots`), `priceRange`, `possessionDate`, `reraNumber`, `reraApproved`, `amenities`, `images`, `brochureUrl`.
  - Add relational endpoints: `GET /builders`, `GET /builders/:id`, `GET /builders/:id/projects`, and `POST /builders/:id/projects`.

### 2. Image and Media Upload
- **Current Limitation**: The current records have no image fields; the mobile app renders avatar placeholders using the company's first letter and gradient banners.
- **Requirement**: Integrate image and media uploads (e.g. AWS S3 / Cloudflare R2 / local CDN):
  - Builder profile logo and founder/president photo.
  - Project elevation banners, master layout plans, and sample flat photos.
  - PDF project brochure and sanction plan attachments with size/MIME verification and thumbnail generation.

### 3. Verified RERA Numbers (State RERA Registry Verification)
- **Current Limitation**: `reraApproved` is currently a self-reported flag, or loosely set when a `reraNumber` string is supplied without automated registry lookup.
- **Requirement**: Implement verification with the MahaRERA (Maharashtra Real Estate Regulatory Authority) registry:
  - Validate the RERA registration number format (e.g., `P521000...`).
  - Integrate an automated background job or administrative verification queue to confirm project registration status, promoter name, and completion deadline directly against the official portal.
  - Store `reraVerificationStatus` (`pending` | `verified` | `rejected`), `verifiedAt`, and a direct link to the MahaRERA project disclosure sheet.

### 4. Signed Member-Discount Agreement per Builder
- **Current Limitation**: `discountForMembers` is a simple text or percentage field without formal contractual backing.
- **Requirement**: Track an official signed agreement/MOU between the Maratha Chamber / Mahasangh and the builder:
  - Store agreement metadata: `agreementNumber`, `signedDate`, `expiryDate`, `signedDocumentUrl` (signed PDF contract), `discountPercentage`, and `applicableProjects` (all or specific developments).
  - Enable display of a "Verified Member Discount" seal with terms and conditions popup in the client app.

### 5. Enquiry List and Lead Management for Builders
- **Current Limitation**: When a customer submits an enquiry via `POST /builders/:id/enquiries`, the inquiry is recorded in `builderInquiries` and an in-app notification is sent, but there is no dedicated management endpoint for the builder or their sales team to track inquiries.
- **Requirement**: Build a builder lead management API:
  - `GET /builders/:id/enquiries` (authenticated for project owner or builder sales rep) with filtering by date, preferred city, and status.
  - `PUT /builders/:id/enquiries/:enquiryId/status` to update lead state (`new` -> `contacted` -> `site_visit_scheduled` -> `booked` -> `closed`).
  - Webhook or automated SMS/WhatsApp alerts to the builder's sales desk when an enquiry is lodged.

### 6. Backend Pagination, Search, and Filtering
- **Current Limitation**: The current `GET /builders` endpoint returns all records in a single payload. The mobile app implements client-side pagination (20 items at a time), search, and filtering by city and project type.
- **Requirement**: Implement server-side pagination, search indexing, and multi-parameter filtering:
  - Query parameters: `page`, `limit` (default 20, max 100), `city`, `projectType`, `minPrice`, `maxPrice`, `reraOnly=true`, and `search` (full-text index on developer, project name, location).
  - Response metadata: `{ builders: [...], pagination: { page: 1, limit: 20, totalRecords: 85, totalPages: 5, hasNext: true } }`.

---

## Dairy & Milk Collection Centres (दूध व संकलन केंद्र)

### 1. Verified Centres (प्रमाणित संकलन केंद्रे)
- **Current Limitation**: Centres are created with `verified: false` by default, but there is no verification audit workflow or registry integration (e.g. FSSAI / Dairy Cooperative Department license verification).
- **Requirement**: Implement an admin verification workflow:
  - Store `fssaiLicenseNumber`, `verificationStatus` (`pending` | `verified` | `rejected`), `verifiedAt`, and `verifiedByAdminId`.
  - Provide admin endpoints to approve/reject collection centres.
  - Return a `verified` badge flag in `GET /dairy` and `GET /dairy/:id` so mobile clients can display an official verification trust badge.

### 2. Image and Media Upload for Products and Centres
- **Current Limitation**: Neither dairy centres nor retail products currently support image URLs. The mobile client renders emoji icons and colored tiles for products and avatar monograms for centres.
- **Requirement**: Support image and document uploads (via S3 / Cloudflare R2 / local CDN):
  - Collection centre photos (chilling plant, testing lab, collection counter).
  - Product pack shot images, ingredient labels, and certification marks.
  - Quality certificate and lab test report PDF downloads.

### 3. Centre Owner Screen to View Farmer Registrations
- **Current Limitation**: `POST /dairy/:id/registrations` stores farmer registrations in the database, but there is no owner-facing API to manage or download registered farmers.
- **Requirement**: Add dedicated centre owner endpoints:
  - `GET /dairy/:id/registrations` (authenticated: centre owner or admin only) returning farmer registrations with date, village, phone, cattle count, milk type, and expected daily litres.
  - Status management: `PUT /dairy/:id/registrations/:registrationId` (status: `pending` | `approved` | `rejected` | `active`).
  - Export registered farmers list to CSV/Excel for route pickup planning.

### 4. "My Registrations" Screen for Farmers
- **Current Limitation**: Farmers who register with a collection centre cannot view their active and past registrations on their profile.
- **Requirement**: Provide `GET /dairy/my-registrations` (authenticated):
  - Returns all centres where the logged-in member has registered.
  - Includes registration status, submission date, expected collection timing (morning/evening), and contact details of the centre head.

### 5. Live Milk Rates with Timestamp / Updated Date
- **Current Limitation**: `milkRateCow` and `milkRateBuffalo` are currently static string/numeric fields with no last-updated timestamp. The app displays a disclaimer note "दर बदलू शकतात" (Rates may vary).
- **Requirement**: Support dynamic daily/weekly milk rate tracking:
  - Add `ratesUpdatedAt` (ISO 8601 timestamp), `fatSnfRateChartUrl`, and rate history table (`dairy_rate_history`).
  - Allow centre owners to update rates daily via `PUT /dairy/:id/rates` with automated SMS/push notification broadcasts to registered farmers.

### 6. Order Tracking and Payments (Not Built)
- **Current Limitation**: When a customer places a product enquiry via `POST /dairy/products/:id/enquiries`, it only records an enquiry and sends a notification. There is no e-commerce order processing, checkout, or payment gateway.
- **Requirement**: Build a complete dairy order and subscription system:
  - Cart, daily/alternate-day milk delivery subscription schedule, and one-time order checkout.
  - Integration with payment gateway (UPI / Razorpay) for advance wallet recharges and order payments.
  - Delivery dispatch tracking with delivery agent assignment and live status (`ordered` -> `processing` -> `out_for_delivery` -> `delivered`).

### 7. Backend Pagination & Server-side Filtering
- **Current Limitation**: `GET /dairy` and `GET /dairy/products` currently return all records. Mobile clients perform client-side filtering by kind, district, and search query.
- **Requirement**: Add server-side pagination and indexed filters:
  - Query parameters: `page`, `limit` (default 20, max 100), `kind` (`centre` | `brand`), `district`, `taluka`, `search`, and `sort` (by registered farmers or name).
  - Response metadata: `{ dairy: [...], pagination: { page: 1, limit: 20, total: 42, totalPages: 3, hasNext: true } }`.

### 8. Action Button Fallback for Legacy Backend Support (404/405 Handling)
- **Status & Client Behavior**: `POST /dairy/:id/registrations` and `POST /dairy/products/:id/enquiries` are fully supported by the updated backend. However, if deployed against a legacy backend or if the server returns HTTP `404` or `405`, the mobile client automatically hides the "नोंदणी करा" (Register) and "ऑर्डर / चौकशी" (Order / Enquire) action buttons and preserves the "कॉल करा" (Call) button only, preventing user disruption.

