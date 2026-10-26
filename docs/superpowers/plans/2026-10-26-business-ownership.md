# Business Ownership (edit, hide, assign owner) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link each directory business to its owner so the owner (and admins) can edit and hide it, and so a later referrals feature can offer only business owners as receivers.

**Architecture:** Extend the existing `business` feature in the Spring Boot API: native-SQL repository methods on the columns `owner_id` and `status` that already exist (no migration), ownership rules in `BusinessService`, new routes in `BusinessController`. The website directory page gains owner controls.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Data JPA native queries, JUnit 5 + MockMvc on embedded PostgreSQL; React 18 + Vite, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-26-business-ownership-design.md`

## Global Constraints

- Backend on branch `Abhay_app` in `E:\community_mobile`; website on a branch off `main` in `E:\community_mobile_main`. Pushes as abhayGond02.
- No schema change and no migration: `businesses.owner_id` and `businesses.status` already exist. `status` is `visible` or `hidden`; empty or any other value counts as visible.
- Admin = `Roles.isAdmin(CurrentUser)` (admin, superadmin, ceo). Errors are `ApiException` → `{ success:false, code, error }`, Marathi then English text.
- Codes: `NOT_OWNER` 403, `ADMIN_ONLY` 403, `VALIDATION_ERROR` 400, `MEMBER_NOT_FOUND` 404; a missing business is the existing `ApiException.plain(NOT_FOUND, "व्यवसाय सापडला नाही.")`.
- `owner_id` is always the logged-in member, never read from a request body. `PUT /api/businesses/{id}` cannot change `id`, `owner_id`, `status`, `rating`.
- The existing reply shapes for list, detail and create stay as they are, except: hidden businesses are left out of the list; a hidden business's detail is 404 except for its owner and admins; `isMine` is added to each business **only when the request carries a valid login** (absent otherwise, so anonymous replies still equal Node's; this amends spec §5, which said "false when logged out", and the spec is edited to match in Task 1).
- Route `/api/businesses/mine` must not be shadowed by `/{id}`.
- Existing 98 backend tests and the Node comparison (`PARITY: compared 458 replies`) stay green, except the deliberate change in Task 4.
- Test member ids for this feature use the range `M95xx` (other tests use M00xx, M10xx, M20xx, M50xx, M70xx, M80xx, M81xx, M94xx, M99xx).

## Review Focus

- **A broken or expired token while browsing the directory:** the public list still loads (200) with no `isMine`. Test in Task 1.
- **A hidden business reached by its direct link** by a logged-out visitor or another member: 404, same message as a missing one. Test in Task 1.
- **Editing with a field set to empty text** (`name: ""`, `cat: "  "`): 400, nothing saved. Test in Task 2.
- **The body tries to set `owner_id`, `status`, `rating` or `id` on add or edit:** ignored. Tests in Tasks 1 and 2.
- **The website sends `cat=undefined` / `district=undefined`** when "all" is chosen (the page does today): must not filter by the text "undefined". Test in Task 5.

---

## File Structure

| File | Responsibility |
|---|---|
| `backend-java/.../business/repository/BusinessRepository.java` (modify) | Visible-only search, insert with owner, `findByOwner`, update, status, owner |
| `backend-java/.../business/dto/BusinessJson.java` (modify) | `business(Business, String viewerId)` adds `isMine` when logged in |
| `backend-java/.../business/service/BusinessService.java` (modify) | Ownership rules, edit, visibility, mine, assign owner |
| `backend-java/.../business/controller/BusinessController.java` (modify) | `CurrentUser` on routes; PUT, visibility, mine |
| `backend-java/.../business/controller/BusinessAdminController.java` (create) | `PUT /api/admin/businesses/{id}/owner` |
| `backend-java/src/test/.../business/BusinessOwnershipTest.java` (create) | All new behaviour |
| `backend-java/src/test/.../parity/NodeParityTest.java` (modify) | Businesses scenario: creates move to the Java-only test |
| `frontend/src/pages/business/businessParams.js` + test (create) | Pure helper: list query without "all" filters |
| `frontend/src/services/api.js` (modify) | `businesses.mine()`, `businesses.setVisibility()` |
| `frontend/src/pages/business/BusinessDirectoryPage.jsx` (modify) | Login gate, edit, hide/show, my-businesses filter |

(`...` = `src/main/java/com/connectmaratha/api` or `src/test/java/com/connectmaratha/api`.) Backend tests: `E:\community_mobile\.superpowers\sdd\2026-10-24-b2b-leads-realtime\jt.sh <TestClass>` prints a one-line summary (`exit 0: N tests, 0 failures, 0 errors` = pass); `jt.sh ALL` runs everything. Website commands run in `E:\community_mobile_main\frontend`.

---

### Task 1: Owned businesses: add, list, detail, mine

**Files:**
- Modify: `BusinessRepository.java`, `BusinessJson.java`, `BusinessService.java`, `BusinessController.java`
- Modify: `docs/superpowers/specs/2026-10-26-business-ownership-design.md` (the `isMine` sentence in §5: present only when logged in)
- Test: `backend-java/src/test/java/com/connectmaratha/api/business/BusinessOwnershipTest.java`

**Interfaces:**
- Produces:
  - `BusinessRepository.insertBusiness(...)` gains a last parameter `@Param("ownerId") String ownerId` and writes `owner_id` and `status = 'visible'`.
  - `BusinessRepository.search(cat, district, search)` now also excludes `status = 'hidden'`.
  - `List<Business> BusinessRepository.findByOwner(@Param("ownerId") String ownerId)`: native, newest `created_at` first, hidden included.
  - `BusinessJson.business(Business b, String viewerId)`: today's map plus `isMine` (boolean) only when `viewerId != null`; the old one-argument `business(Business)` stays and adds nothing.
  - `BusinessService`: `list(CurrentUser viewer, String cat, String district, String search)`; `detail(CurrentUser viewer, String id)`; `@Transactional create(CurrentUser user, Map<String,Object> body)`; `mine(CurrentUser user)` → `{ success, count, businesses }`.
  - Controller: `GET ""` and `GET "/{id}"` take `CurrentUser` (optional login); `POST ""` is `@RequireAuth`; `GET "/mine"` is `@RequireAuth`.

- [ ] **Step 1: Write the failing tests** (`@SpringBootTest @AutoConfigureMockMvc`, extends `PostgresTestBase`; helpers like `EnquiryEndpointsTest`: `member(id, name)`, `token(id, role)`, JSON via `ObjectMapper`; in `@BeforeEach`: `DELETE FROM business_reviews; DELETE FROM businesses WHERE name LIKE 'Zo%'; limiter/rateLimit resets`. Test businesses are named `Zo<something>` so cleanup is targeted. Members `M9501` (owner), `M9502` (other), `M9509` (admin role).)

```java
@Test void addingNeedsALogin()                       // POST without token → 401
@Test void addRecordsTheLoggedInMemberAsOwner()      // 201; body also sends "owner_id":"M9502","status":"hidden","rating":1,"id":"X1" → DB row: owner_id 'M9501', status 'visible', rating 5.0, id not 'X1'; reply business.owner_id "M9501"
@Test void addStillRequiresNameOwnerAndCategory()    // missing owner → 400 with the existing message "व्यवसायाचे नाव, मालकाचे नाव आणि वर्गवारी आवश्यक आहे."
@Test void listAndDetailFlagMineOnlyWhenLoggedIn()   // M9501's token → isMine true; M9502 → false; no token → key absent
@Test void brokenTokenStillGetsThePublicList()       // Review Focus: "Bearer not.a.token" → 200, count ≥ 1, no isMine key
@Test void hiddenBusinessIsLeftOutOfTheList()        // UPDATE ... SET status='hidden' → list without it; a status NULL row still listed
@Test void hiddenBusinessDetailIsHiddenExceptFromOwnerAndAdmin() // Review Focus: logged out → 404 "व्यवसाय सापडला नाही."; M9502 → 404; M9501 → 200; M9509 (admin) → 200
@Test void mineListsMyBusinessesIncludingHiddenNewestFirst()     // M9501 has 2 (one hidden) → count 2, newest first; M9502 → count 0; no token → 401
```

- [ ] **Step 2: Run them and check they fail.** `jt.sh BusinessOwnershipTest`. Expected: compilation errors or failures (401 expected but 201, 404 on `/mine`).
- [ ] **Step 3: Implement** per Interfaces. Service rules: `create` keeps today's validation, id (`Ids.twoDigit("B", businesses::existsById)`) and photo logic, ignores any `owner_id`/`status`/`rating`/`id` in the body, passes `user.id()` as owner; `detail` returns 404 (the existing message) for a hidden business unless the viewer owns it or `Roles.isAdmin(viewer)`; `list` passes `viewerId` to `BusinessJson`. Update the spec sentence about `isMine`.
- [ ] **Step 4: Run them and check they pass.** `jt.sh BusinessOwnershipTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): businesses record their owner; hidden ones are left out; /mine`

---

### Task 2: Edit and hide/show

**Files:**
- Modify: `BusinessRepository.java`, `BusinessService.java`, `BusinessController.java`
- Test: `BusinessOwnershipTest.java` (add)

**Interfaces:**
- Consumes: Task 1 (`BusinessJson.business(b, viewerId)`, service/controller signatures).
- Produces:
  - Repository (all `@Modifying(clearAutomatically = true, flushAutomatically = true)` native): `updateBusiness(id, name, owner, cat, city, district, phone, whatsapp, website, hours, services, offers)` writing all twelve; `setStatus(id, status)`.
  - `BusinessService`: `@Transactional Map<String,Object> update(CurrentUser user, String id, Map<String,Object> body)`; `@Transactional Map<String,Object> setVisibility(CurrentUser user, String id, Map<String,Object> body)`.
  - Controller (`@RequireAuth`): `PUT /{id}` → 200; `PUT /{id}/visibility` → 200.

- [ ] **Step 1: Write the failing tests**

```java
@Test void ownerEditsOnlyTheFieldsSent()          // M9501 PUT {"phone":"9800000001","services":["A","B"]} → 200 message "व्यवसाय अद्ययावत केला गेला! (Business updated.)"; DB phone changed, services '["A","B"]', name/owner/cat/city unchanged; reply business.phone
@Test void adminCanEditToo()                       // M9509 → 200
@Test void otherMemberCannotEdit()                 // M9502 → 403 NOT_OWNER, DB unchanged; no token → 401; unknown id → 404 "व्यवसाय सापडला नाही."
@Test void emptyRequiredFieldIsRejected()          // Review Focus: {"name":""} → 400, {"cat":"  "} → 400 (existing message), DB unchanged
@Test void protectedFieldsCannotBeChanged()        // Review Focus: {"owner_id":"M9502","status":"hidden","rating":1,"id":"X9","name":"Zo Renamed"} → 200; DB owner_id/status/rating/id unchanged, name changed
@Test void ownerHidesAndShowsAgain()               // visibility {"hidden":true} → 200, status 'hidden', list/detail(logged out) exclude it; {"hidden":false} → 'visible' and listed again
@Test void visibilityNeedsABooleanAndTheRightPerson() // {"hidden":"yes"} → 400 VALIDATION_ERROR; {} → 400; M9502 → 403 NOT_OWNER; admin → 200
```

- [ ] **Step 2: Run them and check they fail.** `jt.sh BusinessOwnershipTest`. Expected: the new tests fail with 404/405 (routes missing).
- [ ] **Step 3: Implement.** `update`: find or 404; owner (`user.id().equals(b.getOwnerId())`) or `Roles.isAdmin` else `ApiException.forbidden("NOT_OWNER", "फक्त व्यवसायाचा मालक किंवा प्रशासक हे बदलू शकतात (Only the owner or an admin can change this).")`; for each of `name`, `owner`, `cat` present in the body and not `Js.truthy` → 400 with the existing create message; absent fields keep the stored value (read from the entity); `services` only when the key is present (existing `servicesJson`); reply `{ success:true, message, business }`. `setVisibility`: body must be exactly `{ hidden: boolean }` (Boolean value required; use `SchemaValidator` with `Rule.bool().required()` and unknown fields rejected) → `status` `hidden`/`visible`; reply `{ success:true, business }`.
- [ ] **Step 4: Run them and check they pass.** `jt.sh BusinessOwnershipTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): owners and admins can edit and hide a business`

---

### Task 3: Admin assigns an owner

**Files:**
- Modify: `BusinessRepository.java` (`setOwner(id, ownerId)`, `@Modifying` native), `BusinessService.java`
- Create: `.../business/controller/BusinessAdminController.java`
- Test: `BusinessOwnershipTest.java` (add)

**Interfaces:**
- Produces: `BusinessService.assignOwner(CurrentUser admin, String id, Map<String,Object> body)` → `{ success, business }` (`@Transactional`); `PUT /api/admin/businesses/{id}/owner` (`@RequireAuth`).

- [ ] **Step 1: Write the failing test**

```java
@Test void adminAssignsAnOwnerWhoCanThenEdit() {
    // M9502 → 403 ADMIN_ONLY; no token → 401; admin with unknown member "M0000" → 404 MEMBER_NOT_FOUND;
    // admin with unknown business → 404; admin with {} → 400 VALIDATION_ERROR
    // admin assigns M9502 → 200, DB owner_id 'M9502', reply business.owner_id; M9502 can now PUT an edit (200) and M9501 gets 403
}
```

- [ ] **Step 2: Run it and check it fails.** `jt.sh BusinessOwnershipTest` → FAIL (404 route).
- [ ] **Step 3: Implement.** Admin check as `EnquiryService.adminSummary` does (403 `ADMIN_ONLY`, `"फक्त प्रशासकांना परवानगी आहे. (Admins only)"`); body `{ memberId: string required }` via `SchemaValidator`; member checked with `MemberRepository.existsById`; 404 `MEMBER_NOT_FOUND` `"सदस्य आढळला नाही (Member not found)."`.
- [ ] **Step 4: Run it and check it passes.** `jt.sh BusinessOwnershipTest` → `exit 0`.
- [ ] **Step 5: Commit** `feat(backend-java): admins can assign a business to a member`

---

### Task 4: Node comparison, README, full suite, PR

**Files:**
- Modify: `NodeParityTest.java` (the `businesses` scenario, ~lines 701-717), `backend-java/README.md`

**Interfaces:**
- Consumes: Tasks 1-3. Produces: nothing further.

- [ ] **Step 1: Run the full suite and read the failure.** `jt.sh ALL`. Expected: the `businesses` parity scenario differs (Java answers 401 to the unauthenticated `POST /api/businesses` calls).
- [ ] **Step 2: Fix the scenario.** The unauthenticated creates (including "create missing fields") are replaced by creating the businesses directly in each server's database through the existing `jdbc` access in that scenario (insert rows with ids/names the lists and the detail request use, `owner_id` NULL, `status` 'visible'), so list, detail and review requests still compare Node to Java; the create behaviour is covered by `BusinessOwnershipTest` instead. If the scenario has no direct database handle for Node's side, both servers already share one embedded database (`NodeParityTest`), so one `jdbc.update` serves both.
- [ ] **Step 3: README.** Under "Deliberate differences from Node" add: adding a business needs a login and records the owner; hidden businesses are left out; `isMine` appears for logged-in viewers. Under "New features (not in Node)" add the five new routes. 
- [ ] **Step 4: Run the full suite.** `jt.sh ALL`. Expected: `exit 0` with `PARITY: compared N replies, 0 differ`.
- [ ] **Step 5: Commit and push** `feat(backend-java): business ownership in the Node comparison, README`; then in `E:\community_mobile_main`: `git checkout main && git pull --ff-only origin main && git checkout -b feat/business-ownership-backend && git checkout Abhay_app -- backend-java docs/superpowers` (sparse-checkout warning expected), commit, `git push -u origin feat/business-ownership-backend`, return to `main`. Verify `git diff --stat Abhay_app feat/business-ownership-backend -- backend-java` prints nothing. Give the user the PR link.
- [ ] **Step 6 (user):** merge, `git pull`, `deploy-java.ps1`. Then check from outside: `GET /api/businesses` still 200 and lists the live business; `POST /api/businesses` without a login → 401; `GET /api/businesses/mine` without a login → 401.

---

### Task 5: Website helper and API calls

**Files:**
- Create: `frontend/src/pages/business/businessParams.js`, `frontend/src/pages/business/businessParams.test.js`
- Modify: `frontend/src/services/api.js` (the `businesses` block)

Work in `E:\community_mobile_main` on a new branch: `git checkout main && git pull --ff-only origin main && git checkout -b feat/business-ownership-website`.

**Interfaces:**
- Produces: `listParams({ cat, district })` (ES module): returns an object without `cat` when it is `'all'`, `''` or missing, and without `district` when it is `'सर्व'`, `''` or missing; `api.businesses.mine()` → `request('/businesses/mine')`; `api.businesses.setVisibility(id, hidden)` → `PUT /businesses/{id}/visibility` with body `{ hidden }`.

- [ ] **Step 1: Write the failing test** (`node:test`)

```js
test('all filters are left out, so "undefined" is never sent', () => {   // Review Focus
  assert.deepEqual(listParams({ cat: 'all', district: 'सर्व' }), {});
  assert.deepEqual(listParams({}), {});
  assert.deepEqual(listParams({ cat: 'it', district: 'पुणे' }), { cat: 'it', district: 'पुणे' });
  assert.deepEqual(listParams({ cat: 'all', district: 'नाशिक' }), { district: 'नाशिक' });
  assert.deepEqual(listParams({ cat: '', district: '' }), {});
});
```

- [ ] **Step 2: Run it and check it fails.** `node --test src/pages/business/businessParams.test.js` → FAIL (`Cannot find module`).
- [ ] **Step 3: Implement** `listParams` and the two API calls.
- [ ] **Step 4: Run it and check it passes.** Same command → `ℹ fail 0`.
- [ ] **Step 5: Commit** `feat(website): business list params helper and ownership API calls`

---

### Task 6: Directory page

**Files:**
- Modify: `frontend/src/pages/business/BusinessDirectoryPage.jsx`

**Interfaces:**
- Consumes: `listParams`, `api.businesses.update/mine/setVisibility` (Task 5); reply fields `isMine`, `status`.

- [ ] **Step 1: Make the changes** (spec §6):
  1. `loadBusinesses` calls `api.businesses.getAll(listParams({ cat: selectedCat, district: selectedDistrict }))`.
  2. "Add a business" asks logged-out visitors to log in (same alert + `navigate('/login?redirect=...')` pattern as `BusinessLeadsPortalPage`) and returns to `/business`.
  3. A business with `isMine` shows an "✏ संपादित करा" button that opens the existing add modal with that business's values (services joined into `servicesText`) and saves through `api.businesses.update`; the saved business replaces the card in the list.
  4. A business with `isMine` shows a "लपवा" / "पुन्हा दाखवा" toggle calling `api.businesses.setVisibility(id, hidden)`.
  5. For logged-in members a "माझे व्यवसाय" filter button loads `api.businesses.mine()` and shows hidden ones with a "लपवलेला" mark; the existing filters return to the public list.
  6. The page's built-in sample businesses (`DEFAULT_BUSINESSES`) never show edit controls (no `isMine`).
- [ ] **Step 2: Build.** `npm run build` → `✓ built in`. (If memory allocation fails, close other programs and retry; if `cm-data.js` is missing run `git sparse-checkout add frontend/assets/js`.)
- [ ] **Step 3: Run the website tests.** `node --test src/pages/business/ src/services/` → `ℹ fail 0`.
- [ ] **Step 4: Commit** `feat(website): owners can edit and hide their business in the directory`

---

### Task 7: Ship the website

- [ ] **Step 1: Push and open the PR.** `git push -u origin feat/business-ownership-website`; give the user `https://github.com/ttppgames11-dotcom/cm/pull/new/feat/business-ownership-website`; `git checkout main`.
- [ ] **Step 2 (user):** merge it right after the Java deploy of Task 4 (between the two, the old add form would get a 401).
- [ ] **Step 3: Live check with the user:** log in, add a business (it shows "✏ संपादित करा" and "लपवा"); edit its phone and see it change; hide it and confirm it vanishes from a logged-out window; show it again; "माझे व्यवसाय" lists it.
- [ ] **Step 4: Rollback if needed:** revert the website PR; for the backend revert its PR and run `deploy-java.ps1`. No data changes need undoing.
