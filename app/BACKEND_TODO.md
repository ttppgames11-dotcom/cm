# Backend Improvements & Pending Requirements (Sangam Referrals)

This document tracks backend API enhancements and database schema requirements identified during the Flutter mobile Referrals implementation.

---

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
