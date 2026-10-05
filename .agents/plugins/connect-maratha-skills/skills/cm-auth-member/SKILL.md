---
name: cm-auth-member
description: >-
  Procedures, validation standards, and architectural rules for authentication, member registration wizard, JWT tokens, and authorization in Connect Maratha.
---

# Connect Maratha Auth & Member Management Skill

Use this skill when modifying authentication logic, registration wizard steps, security validation, or user profile state.

## Architecture

- **Frontend Auth Context**: `frontend/src/context/AuthContext.jsx` manages `user`, `login`, `register`, `logout`, and token storage in `localStorage` (`cm_jwt_token`, `cm_user_data`, `cm_logged_in`).
- **Registration Wizard**: `frontend/src/pages/member/RegisterWizardPage.jsx` guides members through personal info, interests, and profile setup.
- **Backend Auth Routes**: `backend/routes/auth.routes.js` provides REST endpoints for login, registration, token verification, and password reset.
- **Security & Validation**:
  - `backend/utils/validator.js` for payload sanitization.
  - `backend/middleware/auth.js` for JWT verification.

## Testing Auth Flow

1. Default test credentials:
   - Identifier: `9822012345` or `CM-96K-0001`
   - Password: `password123` or `admin123`
2. Run backend API tests:
   ```bash
   node test-all-apis.mjs
   ```
