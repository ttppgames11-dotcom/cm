# Account deletion and data retention

Users can permanently delete their account from the mobile app
(Profile → Security & Privacy → Delete account). The API endpoint is:

    DELETE /api/auth/account
    Authorization: Bearer <access token>
    { "confirm": "DELETE", "password": "<current password>" }      # password accounts
    { "confirm": "DELETE", "idToken": "<fresh Google ID token>" }  # Google accounts

The caller must re-authenticate and type the confirmation word. Everything runs in
one database transaction, so a failure leaves the account untouched.

## What happens to each kind of data

| Data | Action | Why |
|---|---|---|
| Profile (`members`), sessions (`refresh_tokens`) | **Deleted** | Personal data |
| Posts, comments, likes, group memberships | **Deleted** (counters corrected) | User generated content |
| Event RSVPs, notifications, blocks | **Deleted** (RSVP counts corrected) | Personal data |
| Business listings + reviews, job posts + applications | **Deleted** | Owned by the user |
| Referrals, meetings involving other members | **Anonymised** (`deleted` / "Deleted member") | The other party's record must stay intact |
| Donation records | **Anonymised** (name, phone removed; amount, campaign, transaction id kept) | Financial/accounting record |
| Quiz leaderboard entries | **Anonymised** ("Deleted user") | Leaderboard integrity |
| Moderation reports made by the user | Reporter anonymised | Keep safety history |
| Reports about the user | Closed as `target_deleted` | Nothing left to moderate |
| Audit log entries | User name anonymised, IDs kept; a `account_deleted` entry (member id only) is added | Accountability |

Events created by the user stay (public information) with `creator_id` cleared.

## Not covered by this endpoint (operational)

- **Database backups** still contain the deleted data until they expire. Keep
  backup retention short (e.g. 30 days) and state it in the privacy policy.
- The legacy JSON collections in `backend/db.json` (blood requests, matrimony,
  grievances, etc.) record `submittedBy` but are not removed automatically.
  Move them to PostgreSQL before launch so they can be deleted with the account.
- Oral-history entries (`data_oral_history.json`) carry a free-text contributor name.

## Verified by

`npm test --prefix backend` → "account deletion end-to-end" (creates content in
every table, deletes the account, asserts the session, content, listings are gone,
shared records are anonymised and the phone number can be registered again).
