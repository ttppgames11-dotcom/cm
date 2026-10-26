# B2B Opportunities (`/leads`) Backend and Live Updates: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the website's `/leads` page work end to end (logged-in members post requirements, others send quotes) and push changes to every open page live with Server-Sent Events.

**Architecture:** A new `enquiry` feature in the Spring Boot API (controller → service → JdbcTemplate repository), with two tables created on first use. The service publishes Spring events; an AFTER_COMMIT listener hands them to a shared `common/live` SSE hub that fans them out to connected browsers. The React page gains a "My requirements" tab and a small `EventSource` hook.

**Tech Stack:** Java 17, Spring Boot 3.3.5 (Spring MVC `SseEmitter`, JdbcTemplate, `@TransactionalEventListener`), PostgreSQL 16 (embedded for tests), JUnit 5, MockMvc, `java.net.http.HttpClient`; React 18 + Vite, Node 24's built-in `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-24-b2b-leads-realtime-design.md`

## Global Constraints

- Backend work happens in `E:\community_mobile` on branch `Abhay_app`. Website work happens in `E:\community_mobile_main` on a branch off `main`. Pushes use the GitHub account abhayGond02.
- Package-by-feature: `com.connectmaratha.api.enquiry.{controller,service,repository,dto,event}`; shared code goes in `com.connectmaratha.api.common.live`.
- Errors are `{ success: false, code, error }`, thrown as `ApiException(HttpStatus, code, message)` (handled by `GlobalExceptionHandler`), with Marathi text followed by English in brackets.
- Codes: `VALIDATION_ERROR` 400, `ENQUIRY_NOT_FOUND` 404, `OWN_ENQUIRY` 403, `ENQUIRY_CLOSED` 409, `NOT_OWNER` 403, `ADMIN_ONLY` 403, `RATE_LIMIT_EXCEEDED` 429.
- Limits: 10 requirements per member per 24 h; 30 quotes per member per hour; 5 live streams per IP; 500 live streams in total. List at most 100 items.
- SSE: `retry: 5000`, first event `connected`, heartbeat comment every 25 s (`app.live.heartbeat-seconds`), stream timeout 30 min. Events `enquiry.created` (public card) and `enquiry.updated` (`{ id, status, quotesCount }`).
- No phone number, quote amount or member id in any public reply or live event.
- Do not touch Node (`backend/`), the deploy scripts, or other features' behaviour. The existing 62 tests and the Node comparison (`PARITY: compared 458 replies, 0 differ`) must stay green.
- Admin = `Roles.isAdmin(user)` (admin, superadmin, ceo).
- Status values are exactly `open` and `closed`. The page labels are exactly `सक्रिय (Open)` and `पूर्ण (Closed)`.

## Review Focus

- **An expired or broken token in the browser while browsing `/leads`:** the list must still load (200, `isMine: false`), not fail with 403. Test in Task 4.
- **A phone typed with spaces, dashes or +91** (`"+91 98221-44550"`, `"098221 44550"`): accepted, and stored without spaces or dashes. Tests in Tasks 4 and 5.
- **Filters sent as `सर्व` or as an empty string** by another caller or an older page: treated as "all". Test in Task 4.
- **The same requirement arriving twice** (reload plus live event), or a live requirement outside the current filters: no duplicate card, and nothing is added outside the filter. Test in Task 9.
- **Quoting a requirement that was closed while the quote form was open:** 409 `ENQUIRY_CLOSED`, nothing saved, count unchanged. Test in Task 5.

---

## File Structure

**Backend (`E:\community_mobile`)**

| File | Responsibility |
|---|---|
| `database/migrations/008_enquiries.sql` | Record of the two tables (identical to the Java copy) |
| `backend-java/.../common/schema/LazyTables.java` (modify) | `ENQUIRY_TABLES` SQL + `ensureEnquiryTables()` |
| `backend-java/.../common/live/LiveUpdates.java` | Interface: subscribe to a channel, publish an event |
| `backend-java/.../common/live/SseLiveUpdates.java` | In-memory SSE hub: limits, heartbeat, background sending |
| `backend-java/.../enquiry/repository/{EnquiryRow,QuoteRow,EnquiryRepository}.java` | Rows and all SQL |
| `backend-java/.../enquiry/dto/EnquirySchemas.java` | Validation rules + phone normalisation |
| `backend-java/.../enquiry/dto/EnquiryJson.java` | Public card, quote, mine, admin and update shapes |
| `backend-java/.../enquiry/service/{EnquiryService,PostingLimiter}.java` | Rules, transactions, events; per-member limits |
| `backend-java/.../enquiry/event/{EnquiryCreated,EnquiryUpdated,EnquiryLiveRelay}.java` | Events and the AFTER_COMMIT relay |
| `backend-java/.../enquiry/controller/{EnquiryController,EnquiryAdminController}.java` | HTTP endpoints |
| `backend-java/.../auth/service/AuthService.java` (modify) | Account deletion removes enquiries and quotes |
| `backend-java/src/main/resources/application.yml` (modify) | `app.live.heartbeat-seconds` |

(`...` = `src/main/java/com/connectmaratha/api`. Tests mirror the packages under `src/test/java/com/connectmaratha/api`.)

**Website (`E:\community_mobile_main\frontend\src`)**

| File | Responsibility |
|---|---|
| `pages/business/enquiryList.js` + `.test.js` | Pure list logic: labels, filters, add/update, "new quote for me" |
| `services/directApi.js` (modify) | `apiUrl(path)` for the live API origin |
| `services/api.js` (modify) | `enquiries.mine()`, `enquiries.setStatus()` |
| `hooks/useEnquiryStream.js` | The `EventSource` hook |
| `pages/business/BusinessLeadsPortalPage.jsx` (modify) | Login gate, card states, "My requirements" tab, live wiring |

Commands: backend tests run from `E:\community_mobile\backend-java` (`mvn -q -B test -Dtest=<Class>`; quiet output, so success = exit code 0 and no `FAIL`/`ERROR` lines). Website commands run from `E:\community_mobile_main\frontend`.

---

### Task 1: The two tables

**Files:**
- Create: `database/migrations/008_enquiries.sql`
- Modify: `backend-java/src/main/java/com/connectmaratha/api/common/schema/LazyTables.java`
- Test: `backend-java/src/test/java/com/connectmaratha/api/common/schema/EnquiryTablesTest.java`

**Interfaces:**
- Produces: `LazyTables.ensureEnquiryTables()` (public, idempotent, safe to call on every request); `LazyTables.ENQUIRY_TABLES` (package-private `static final String`).

- [ ] **Step 1: Write the failing test** (`@SpringBootTest`, extends `PostgresTestBase`, autowire `LazyTables tables`, `JdbcTemplate jdbc`)

```java
@Test
void migrationFileMatchesTheJavaCopy() throws Exception {
    String file = Files.readString(Path.of("..", "database", "migrations", "008_enquiries.sql"), UTF_8);
    assertThat(normalise(file)).isEqualTo(normalise(LazyTables.ENQUIRY_TABLES));
}
// normalise: strip BOM, drop lines starting with "--", collapse all whitespace runs to one space, trim

@Test
void tablesAreCreatedOnceAndEnforceTheRules() {
    tables.ensureEnquiryTables();
    tables.ensureEnquiryTables(); // second call is a no-op
    jdbc.update("INSERT INTO enquiries (id, member_id, title, category, district) VALUES ('ENQ-T1','M1','Title','IT','Pune')");
    assertThat(jdbc.queryForObject("SELECT status FROM enquiries WHERE id='ENQ-T1'", String.class)).isEqualTo("open");
    assertThatThrownBy(() -> jdbc.update("UPDATE enquiries SET status='done' WHERE id='ENQ-T1'"))
        .isInstanceOf(DataIntegrityViolationException.class);
    String quote = "INSERT INTO enquiry_quotes (id, enquiry_id, member_id, business_name, phone) VALUES (?, 'ENQ-T1', 'M2', 'B', '9822144550')";
    jdbc.update(quote, "QT-1");
    assertThatThrownBy(() -> jdbc.update(quote, "QT-2")).isInstanceOf(DuplicateKeyException.class);
    jdbc.update("DELETE FROM enquiries WHERE id='ENQ-T1'");
    assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiry_quotes WHERE enquiry_id='ENQ-T1'", Integer.class)).isZero();
}
```

- [ ] **Step 2: Run it and check it fails.** Run `mvn -q -B test -Dtest=EnquiryTablesTest`. Expected: compilation error, `cannot find symbol ... ensureEnquiryTables`.

- [ ] **Step 3: Write the SQL and the guard.** `008_enquiries.sql` holds exactly the SQL in spec §4 (both tables, three indexes), with one leading `--` comment line. In `LazyTables`, add `ENQUIRY_TABLES` (the same statements as a text block) and `ensureEnquiryTables()`, using a new `AtomicBoolean enquiryTablesReady` exactly like `ensureSupportTickets()`. One `jdbc.execute(ENQUIRY_TABLES)` runs all the statements.

- [ ] **Step 4: Run it and check it passes.** Run `mvn -q -B test -Dtest=EnquiryTablesTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add database/migrations/008_enquiries.sql backend-java/src/main/java/com/connectmaratha/api/common/schema/LazyTables.java backend-java/src/test/java/com/connectmaratha/api/common/schema/EnquiryTablesTest.java
git commit -m "feat(backend-java): enquiry tables, created on first use (migration 008)"
```

---

### Task 2: The live-update hub (`common/live`)

**Files:**
- Create: `backend-java/src/main/java/com/connectmaratha/api/common/live/LiveUpdates.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/common/live/SseLiveUpdates.java`
- Modify: `backend-java/src/main/resources/application.yml` (under `app:` add `live: heartbeat-seconds: ${LIVE_HEARTBEAT_SECONDS:25}`)
- Create (test helper): `backend-java/src/test/java/com/connectmaratha/api/common/live/SseTestClient.java`
- Create (test-only controller): `backend-java/src/test/java/com/connectmaratha/api/common/live/LiveProbeController.java` (`GET /api/test/live` → `return live.subscribe("test", req, res);`)
- Test: `backend-java/src/test/java/com/connectmaratha/api/common/live/SseLiveUpdatesTest.java`

**Interfaces:**
- Produces:
  - `interface LiveUpdates { SseEmitter subscribe(String channel, HttpServletRequest req, HttpServletResponse res) throws IOException; void publish(String channel, String eventName, Object payload); }`
    `subscribe` returns `null` after writing the 429 reply itself (see Step 3). A controller simply returns its result. `publish` returns immediately.
  - `SseLiveUpdates` (`@Component`) also has `public int connectionCount()` and `public void disconnectAll()` (for tests).
  - `SseTestClient` (test helper, public): `static SseTestClient open(int port, String path)` (returns once headers arrive, whatever the status); `int status()`; `String contentType()`; `String awaitLine(Predicate<String> match, Duration timeout)` (returns the first matching line, or fails the test with the lines seen); `boolean noLineWithin(Predicate<String> match, Duration window)`; `close()`. It is built on `HttpClient.sendAsync(..., BodyHandlers.ofLines())`, with a reader thread that drains lines into a `LinkedBlockingQueue`. `close()` closes the line stream.

- [ ] **Step 1: Write the failing test** (`@SpringBootTest(webEnvironment = RANDOM_PORT, properties = "app.live.heartbeat-seconds=1")`, extends `PostgresTestBase`, `@LocalServerPort int port`, autowire `SseLiveUpdates live`, `RateLimitFilter rateLimit`. In `@AfterEach`, close the clients, then `live.disconnectAll()` and `rateLimit.reset()`.)

```java
@Test
void streamStartsWithConnectedThenDeliversEventsAndHeartbeats() {
    SseTestClient c = SseTestClient.open(port, "/api/test/live");
    assertThat(c.status()).isEqualTo(200);
    assertThat(c.contentType()).startsWith("text/event-stream");
    c.awaitLine(l -> l.equals("retry:5000"), Duration.ofSeconds(3));
    c.awaitLine(l -> l.equals("event:connected"), Duration.ofSeconds(3));
    live.publish("test", "demo", Map.of("n", 1));
    c.awaitLine(l -> l.equals("event:demo"), Duration.ofSeconds(3));
    c.awaitLine(l -> l.equals("data:{\"n\":1}"), Duration.ofSeconds(3));
    c.awaitLine(l -> l.startsWith(":"), Duration.ofSeconds(3)); // heartbeat comment
}

@Test
void sixthStreamFromOneIpIsRefusedWith429() {
    for (int i = 0; i < 5; i++) assertThat(SseTestClient.open(port, "/api/test/live").status()).isEqualTo(200);
    SseTestClient sixth = SseTestClient.open(port, "/api/test/live");
    assertThat(sixth.status()).isEqualTo(429);
    assertThat(sixth.contentType()).startsWith("application/json");
    sixth.awaitLine(l -> l.contains("\"code\":\"RATE_LIMIT_EXCEEDED\""), Duration.ofSeconds(3));
}

@Test
void closedStreamsAreForgotten() throws Exception {
    SseTestClient c = SseTestClient.open(port, "/api/test/live");
    c.awaitLine(l -> l.equals("event:connected"), Duration.ofSeconds(3));
    c.close();
    // the next heartbeat (1 s) fails to send and drops it
    await().atMost(Duration.ofSeconds(5)).until(() -> live.connectionCount() == 0);
}
```
(If Awaitility is not on the test classpath, poll `connectionCount()` in a loop of 50 × 100 ms instead.)

- [ ] **Step 2: Run it and check it fails.** Run `mvn -q -B test -Dtest=SseLiveUpdatesTest`. Expected: compilation error (`LiveUpdates` not found).

- [ ] **Step 3: Implement `SseLiveUpdates implements LiveUpdates`**
  - Constructor: `(ObjectMapper json, @Value("${app.live.heartbeat-seconds:25}") long heartbeatSeconds)`. Constants: `MAX_PER_IP = 5`, `MAX_TOTAL = 500`, `TIMEOUT_MS = 30 * 60 * 1000L`, `RETRY_MS = 5000`.
  - **Threading:** one single-thread `ScheduledExecutorService` (daemon thread `live-updates`) does all sending, both published events and the heartbeat (`scheduleAtFixedRate`, sending `SseEmitter.event().comment("ping")`). With a single thread, sends to one emitter never overlap. `@PreDestroy` completes all emitters and shuts the executor down.
  - **subscribe:** compute the IP with `ClientIp.of(req)`. If that IP already has 5 streams or the total is 500: set status 429, content type `application/json;charset=UTF-8`, write `{"success":false,"code":"RATE_LIMIT_EXCEEDED","error":"खूप जास्त लाइव्ह कनेक्शन्स उघडले आहेत. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा (Too many live connections, try again later)."}` with the injected `ObjectMapper`, and return `null`. Writing it here is necessary: normal error handling cannot render JSON for an `Accept: text/event-stream` request. Otherwise create `new SseEmitter(TIMEOUT_MS)`, register it, remove it in `onCompletion`/`onTimeout`/`onError`, and send `SseEmitter.event().reconnectTime(RETRY_MS).name("connected").data("{}")` (Spring buffers a send made before the emitter is returned).
  - **publish:** serialise the payload once with the injected `ObjectMapper` (the app's configured mapper: raw UTF-8, JS-style numbers), then submit one task that sends `event().name(eventName).data(json)` to every emitter on that channel. Any send that throws drops that emitter.
  - **State:** `ConcurrentHashMap<String, Set<Stream>>` per channel, where `Stream` holds the emitter and its IP; per-IP counts are derived from it.

- [ ] **Step 4: Run it and check it passes.** Run `mvn -q -B test -Dtest=SseLiveUpdatesTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add backend-java/src/main/java/com/connectmaratha/api/common/live backend-java/src/main/resources/application.yml backend-java/src/test/java/com/connectmaratha/api/common/live
git commit -m "feat(backend-java): shared SSE live-update hub with limits and heartbeat"
```

---

### Task 3: Enquiry data access

**Files:**
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/repository/EnquiryRow.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/repository/QuoteRow.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/repository/EnquiryRepository.java`
- Test: `backend-java/src/test/java/com/connectmaratha/api/enquiry/repository/EnquiryRepositoryTest.java`

**Interfaces:**
- Consumes: `LazyTables.ensureEnquiryTables()` (Task 1). Every public repository method calls it first.
- Produces:
  - `record EnquiryRow(String id, String memberId, String title, String description, String category, String city, String district, String budget, String clientName, String phone, String status, Instant createdAt, Instant updatedAt, Instant closedAt, int quotesCount, boolean quotedByMe)`
  - `record QuoteRow(String id, String enquiryId, String memberId, String businessName, String ownerName, String phone, String quoteAmount, String proposalNotes, Instant createdAt, Instant updatedAt)`
  - `EnquiryRepository` (`@Repository`, constructor `(JdbcTemplate, LazyTables)`):
    - `boolean exists(String id)`, `boolean quoteExists(String id)`: for `Ids.millis`
    - `void insert(EnquiryRow e)`: writes id, memberId and the text fields. Status starts `open`. The database sets the dates. Counts are ignored
    - `Optional<EnquiryRow> find(String id, String viewerId)`: `viewerId` may be null, in which case `quotedByMe` is false
    - `List<EnquiryRow> list(String district, String category, String viewerId, int limit)`: a null filter means all. Open first, then `created_at` newest, then `id` descending
    - `List<EnquiryRow> listByMember(String memberId)` and `List<EnquiryRow> listAll()`: newest first
    - `List<QuoteRow> quotesFor(Collection<String> enquiryIds)`: newest `updated_at` first. Empty input gives an empty list without a query
    - `Optional<QuoteRow> findQuote(String enquiryId, String memberId)`
    - `boolean upsertQuote(QuoteRow q)`: true = inserted, false = updated. An update keeps the existing `id` and `created_at` and sets `updated_at = now()`
    - `int countQuotes(String enquiryId)`
    - `void setStatus(String id, String status)`: `closed_at = now()` when closed, `NULL` when open; `updated_at = now()`

- [ ] **Step 1: Write the failing tests** (`@SpringBootTest`, extends `PostgresTestBase`. In `@BeforeEach`, call `tables.ensureEnquiryTables()`, then `jdbc.update("DELETE FROM enquiries")`. The helper `row(id, member, district, category, status)` builds an `EnquiryRow` with title `"T " + id`. To set dates, use `jdbc.update("UPDATE enquiries SET created_at = ? WHERE id = ?", Timestamp.from(t), id)`.)

```java
@Test void listPutsOpenFirstThenNewest()          // A open (old), B open (new), C closed (newest) → B, A, C
@Test void filtersMatchExactlyAndNullMeansAll()   // list("Pune", null, ...) only Pune; list(null, "IT", ...) only IT; list(null, null, ...) all
@Test void limitCapsTheList()                     // 3 rows, list(null, null, null, 2).size() == 2
@Test void countsQuotesAndKnowsWhoQuoted()        // quotes by M2 and M3 → quotesCount 2; quotedByMe true for "M2", false for "M9" and null
@Test void upsertQuoteInsertsThenUpdatesKeepingIdAndCreatedAt() {
    assertThat(repo.upsertQuote(quote("QT-1", "ENQ-1", "M2", "10000"))).isTrue();
    QuoteRow first = repo.findQuote("ENQ-1", "M2").orElseThrow();
    assertThat(repo.upsertQuote(quote("QT-2", "ENQ-1", "M2", "12000"))).isFalse();
    QuoteRow second = repo.findQuote("ENQ-1", "M2").orElseThrow();
    assertThat(second.id()).isEqualTo("QT-1");
    assertThat(second.quoteAmount()).isEqualTo("12000");
    assertThat(second.createdAt()).isEqualTo(first.createdAt());
    assertThat(repo.countQuotes("ENQ-1")).isEqualTo(1);
}
@Test void setStatusRecordsAndClearsClosedAt()    // closed → closedAt not null, status "closed"; open → closedAt null
@Test void quotesForReturnsOnlyRequestedEnquiries() // quotes on ENQ-1 and ENQ-2; quotesFor(List.of("ENQ-1")) only ENQ-1's; quotesFor(List.of()) empty
```

- [ ] **Step 2: Run them and check they fail.** Run `mvn -q -B test -Dtest=EnquiryRepositoryTest`. Expected: compilation error.

- [ ] **Step 3: Implement the repository.** SQL notes:
  - Nullable parameters must be cast, because PostgreSQL cannot type a bare `? IS NULL`: `(CAST(? AS TEXT) IS NULL OR e.district = ?)`.
  - `quotesCount` is `(SELECT COUNT(*) FROM enquiry_quotes q WHERE q.enquiry_id = e.id)`.
  - `quotedByMe` is `EXISTS (SELECT 1 FROM enquiry_quotes q WHERE q.enquiry_id = e.id AND q.member_id = CAST(? AS TEXT))`.
  - Order by `(e.status = 'open') DESC, e.created_at DESC, e.id DESC`.
  - Upsert: `INSERT ... ON CONFLICT (enquiry_id, member_id) DO UPDATE SET business_name = EXCLUDED.business_name, owner_name = EXCLUDED.owner_name, phone = EXCLUDED.phone, quote_amount = EXCLUDED.quote_amount, proposal_notes = EXCLUDED.proposal_notes, updated_at = now() RETURNING (xmax = 0) AS inserted`.
  - Map timestamps with `rs.getTimestamp(col).toInstant()` (null-safe for `closed_at`).

- [ ] **Step 4: Run them and check they pass.** Run `mvn -q -B test -Dtest=EnquiryRepositoryTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add backend-java/src/main/java/com/connectmaratha/api/enquiry/repository backend-java/src/test/java/com/connectmaratha/api/enquiry/repository
git commit -m "feat(backend-java): enquiry repository (list, quotes upsert, status)"
```

---

### Task 4: Post and list requirements

**Files:**
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/dto/EnquirySchemas.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/dto/EnquiryJson.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/service/PostingLimiter.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/event/EnquiryCreated.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/service/EnquiryService.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/controller/EnquiryController.java`
- Test: `backend-java/src/test/java/com/connectmaratha/api/enquiry/EnquiryEndpointsTest.java`

**Interfaces:**
- Consumes: `EnquiryRepository`, `EnquiryRow` (Task 3); `MemberRepository.findById` (`Member.getName()`, `getPhone()`); `SchemaValidator.check(Map, Map<String, Rule>, boolean allowUnknown, List)`; `Ids.millis(String, Predicate<String>)`; `CurrentUser` (`id()`); `@RequireAuth`; `JsonBody.read(req)`.
- Produces:
  - `EnquirySchemas.ENQUIRY` (`Map<String, Rule>`): `title` required min 3 max 150 · `category` required max 100 · `district` required max 100 · `city` max 100 · `budget` max 50 · `description` max 2000 · `clientName` max 100 · `phone` `Rule.string().format("phone")`
  - `static Map<String, Object> EnquirySchemas.normalizePhone(Map<String, Object> body)`: returns a copy in which a String `phone` has its spaces and dashes removed
  - `static Map<String, Object> EnquiryJson.card(EnquiryRow r, String viewerId)`: keys in order `id, title, description, category, city, district, budget, clientName, status, quotesCount, createdAt` (`Instant.toString()`), then `isMine` (`viewerId` equals `memberId`) and `quotedByMe` (`r.quotedByMe()`). Never a phone or member id
  - `PostingLimiter` (`@Component`): `void checkPost(String memberId)` (the 11th within a 24 h fixed window → 429 `RATE_LIMIT_EXCEEDED`, `"खूप जास्त मागण्या पोस्ट केल्या आहेत. कृपया उद्या पुन्हा प्रयत्न करा (Too many requirements today)."`); `void checkQuote(String memberId)` (the 31st within 1 h → 429, `"खूप जास्त कोटेशन्स पाठवली आहेत. कृपया एका तासानंतर पुन्हा प्रयत्न करा (Too many quotes, try again in an hour)."`); `void reset()`. Each check counts the attempt it allows. The model is `SubmissionLimiter`
  - `record EnquiryCreated(Map<String, Object> card)`
  - `EnquiryService`: `Map<String, Object> list(CurrentUser viewer, String district, String category)`; `@Transactional Map<String, Object> create(CurrentUser user, Map<String, Object> body)`
  - `EnquiryController` (`@RequestMapping("/api/enquiries")`): `GET ""` → `list` (optional login); `POST ""` (`@RequireAuth`) → 201 `create`

- [ ] **Step 1: Write the failing tests.** Fixture: `@SpringBootTest @AutoConfigureMockMvc`, extends `PostgresTestBase`. In `@BeforeEach`: `limiter.reset(); rateLimit.reset(); tables.ensureEnquiryTables(); jdbc.update("DELETE FROM enquiries");`. Helpers: `member(id, name, phone)` = `INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING`; `token(id, role)` = `"Bearer " + jwt.generate(id, "Test", role, "Gold")`; `postEnquiry(token, Map body)` and `getList(token, query)` wrap MockMvc. A valid body is `{title: "पुण्यात ऑफिस इंटेरियर 🏢", category: "इंटेरियर व बांधकाम", district: "पुणे", city: "पुणे", budget: "₹ 2 लाख", description: "५०० चौ. फूट"}`.

```java
@Test void postingNeedsLogin()                           // POST without token → 401
@Test void postValidatesFields()                         // no title → 400 VALIDATION_ERROR; "verified": true extra → 400; title "ab" → 400; description 2001 chars → 400; phone "12345" → 400
@Test void postSavesWithProfileDefaultsAndNormalisedPhone() {
    member("M7001", "Test Poster", "9822144550");
    // 201; enquiry.clientName "Test Poster"; isMine true; quotedByMe false; status "open"; quotesCount 0; title round-trips with the emoji
    // DB: SELECT phone FROM enquiries → "9822144550"
    // second post with "phone": "+91 98221-44551" → DB phone "+919822144551"
}
@Test void publicListNeverShowsPhones()                  // after a post, raw GET /api/enquiries body contains the title but not "9822144550"
@Test void listFlagsMineForTheViewer()                   // M7001's token → isMine true on own card; M7002's token → false; no token → false
@Test void brokenOrExpiredTokenStillGetsTheList()        // Review Focus: "Authorization: Bearer not.a.token" → 200, count 1, isMine false
@Test void allFilterValuesMeanEverything()               // Review Focus: two posts in different districts; ?district=सर्व and ?district= (empty) both → count 2; ?district=नाशिक → only that one
@Test void eleventhPostInADayIsRefused()                 // 3 invalid posts first (400, not counted), then 10 valid → 201 each, 11th → 429 RATE_LIMIT_EXCEEDED
@Test void listIsCappedAt100() // 101 rows inserted through the repository → count 100
```

- [ ] **Step 2: Run them and check they fail.** Run `mvn -q -B test -Dtest=EnquiryEndpointsTest`. Expected: compilation error.

- [ ] **Step 3: Implement the service and controller**
  - `list`: treat `district`/`category` as null when empty or `सर्व`. `viewerId` is `viewer == null ? null : viewer.id()`. Call `repo.list(..., 100)`, map each row with `EnquiryJson.card(row, viewerId)`, and reply `{ success: true, count, enquiries }`.
  - `create`, in this order:
    1. `normalizePhone`, then `SchemaValidator.check(body, ENQUIRY, false, null)`, so invalid requests are not counted.
    2. `limiter.checkPost(user.id())`.
    3. Look up the member. `clientName` defaults to the member's name, else `"सदस्य"`. `phone` defaults to the member's profile phone.
    4. Store trimmed text, with empty optional values as null.
    5. `id = Ids.millis("ENQ-", repo::exists)`, then `repo.insert`, then `row = repo.find(id, user.id())`.
    6. `publisher.publishEvent(new EnquiryCreated(EnquiryJson.card(row, null)))`.
    7. Reply `{ success: true, message: "तुमची मागणी प्रसिद्ध झाली! (Your requirement is live.)", enquiry: card(row, user.id()) }`.

- [ ] **Step 4: Run them and check they pass.** Run `mvn -q -B test -Dtest=EnquiryEndpointsTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add backend-java/src/main/java/com/connectmaratha/api/enquiry backend-java/src/test/java/com/connectmaratha/api/enquiry/EnquiryEndpointsTest.java
git commit -m "feat(backend-java): post and list business requirements (/api/enquiries)"
```

---

### Task 5: Quotes, "mine", status and the admin summary

**Files:**
- Modify: `enquiry/dto/EnquirySchemas.java`, `enquiry/dto/EnquiryJson.java`, `enquiry/service/EnquiryService.java`, `enquiry/controller/EnquiryController.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/event/EnquiryUpdated.java`
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/controller/EnquiryAdminController.java`
- Test: `backend-java/src/test/java/com/connectmaratha/api/enquiry/EnquiryEndpointsTest.java` (add)

**Interfaces:**
- Consumes: Tasks 3 and 4; `Roles.isAdmin(CurrentUser)`.
- Produces:
  - `EnquirySchemas.QUOTE`: `businessName` required min 2 max 150 · `phone` required, `format("phone")` · `ownerName` max 100 · `quoteAmount` max 50 · `proposalNotes` max 2000
  - `EnquirySchemas.STATUS`: `status` required, `oneOf("open", "closed")`
  - `EnquiryJson.quote(QuoteRow)`: keys `id, businessName, ownerName, phone, quoteAmount, proposalNotes, createdAt, updatedAt`
  - `EnquiryJson.mine(EnquiryRow, List<QuoteRow>)`: `card(row, row.memberId())`, plus `phone`, plus `quotes`
  - `EnquiryJson.admin(EnquiryRow)`: the card fields without `isMine`/`quotedByMe`, plus `phone`, plus `memberId`
  - `EnquiryJson.update(String id, String status, int quotesCount)`: ordered `{ id, status, quotesCount }`
  - `record EnquiryUpdated(String id, String status, int quotesCount)`
  - `EnquiryService`: `record QuoteResult(boolean created, Map<String, Object> reply)`; `@Transactional QuoteResult quote(CurrentUser user, String enquiryId, Map<String, Object> body)`; `Map<String, Object> mine(CurrentUser user)`; `@Transactional Map<String, Object> setStatus(CurrentUser user, String enquiryId, Map<String, Object> body)`; `Map<String, Object> adminSummary(CurrentUser user)`
  - Controller (all `@RequireAuth`): `POST /{id}/quote` (201 when `created`, else 200), `GET /mine`, `PUT /{id}/status`; `EnquiryAdminController`: `GET /api/admin/enquiries-summary`

- [ ] **Step 1: Write the failing tests** (add to `EnquiryEndpointsTest`. Members: poster M7001, businesses M7002 and M7003, admin role via `token("M7009", "admin")`.)

```java
@Test void quoteRules() {
    // poster quotes own → 403 OWN_ENQUIRY; quote on "ENQ-missing" → 404 ENQUIRY_NOT_FOUND; no businessName → 400 VALIDATION_ERROR
    // M7002 first quote → 201, updated false; again with new amount → 200, updated true
    // GET /api/enquiries → quotesCount 1 for that card
}
@Test void quoteOnClosedRequirementIsRefusedAndNothingSaved()  // Review Focus: poster closes; M7002 quotes → 409 ENQUIRY_CLOSED; quotesCount stays 0
@Test void quotePhoneWithSpacesIsAccepted()                     // Review Focus: "phone": "098221 44550" → 201; stored "09822144550"
@Test void listShowsQuotedByMe()                                // after M7002 quotes: M7002 sees quotedByMe true, M7003 false
@Test void mineShowsQuotesWithPhonesOnlyToTheOwner() {
    // poster GET /mine → enquiries[0].phone present; quotes[0].businessName/phone/quoteAmount present
    // M7002 GET /mine → count 0 (it is not their requirement)
    // public GET /api/enquiries raw body contains neither the quote phone nor the quote amount
}
@Test void onlyPosterOrAdminChangesStatus()  // M7002 → 403 NOT_OWNER; poster "closed" → 200 status closed; "closed" again → 200; admin "open" → 200; "done" → 400
@Test void adminSummaryIsAdminOnlyAndIncludesPhones() // no token → 401; member → 403 ADMIN_ONLY; admin → 200 with enquiries[0].phone, memberId, quotesCount
@Test void thirtyFirstQuoteInAnHourIsRefused() // 31 requirements by M7001 inserted through the repository; M7002 quotes 30 → OK, 31st → 429 RATE_LIMIT_EXCEEDED
```

- [ ] **Step 2: Run them and check they fail.** Run `mvn -q -B test -Dtest=EnquiryEndpointsTest`. Expected: the new tests fail with 404 (endpoints missing) or compilation errors.

- [ ] **Step 3: Implement**
  - **`quote`**, in this order:
    1. `normalizePhone` and validate `QUOTE` (strict).
    2. Find the requirement, or 404 `ENQUIRY_NOT_FOUND` `"ही मागणी आढळली नाही (Requirement not found)."`.
    3. Poster quoting → 403 `OWN_ENQUIRY` `"स्वतःच्या मागणीवर कोटेशन देता येत नाही (You cannot quote on your own requirement)."`.
    4. Closed → 409 `ENQUIRY_CLOSED` `"ही मागणी बंद झाली आहे (This requirement is closed)."`.
    5. `limiter.checkQuote`.
    6. Upsert with `Ids.millis("QT-", repo::quoteExists)`. `ownerName` defaults to the member's name, else `"सदस्य"`.
    7. `count = repo.countQuotes`, then `publishEvent(new EnquiryUpdated(id, status, count))`.
    8. Reply `{ success: true, message, updated: !created, quote }`. The message is `"कोटेशन पाठवले! (Quote sent.)"` for a new quote, or `"कोटेशन अपडेट केले! (Quote updated.)"` for an update.
  - **`setStatus`:**
    1. Validate `STATUS` (strict).
    2. Find, or 404.
    3. If the caller is neither the poster nor an admin → 403 `NOT_OWNER` `"फक्त मागणी करणारा सदस्य किंवा प्रशासक हे बदलू शकतात (Only the poster or an admin can change this)."`.
    4. `repo.setStatus`, then publish `EnquiryUpdated`.
    5. Reply `{ success: true, enquiry: card(row, user.id()) }`.
  - **`mine`:** `listByMember`, then `quotesFor` (all ids in one call), grouped by `enquiryId`. Reply `{ success, count, enquiries }`.
  - **`adminSummary`:** a non-admin gets 403 `ADMIN_ONLY` `"फक्त प्रशासकांना परवानगी आहे. (Admins only)"`; an admin gets `{ success, count, enquiries: listAll() mapped with admin() }`.

- [ ] **Step 4: Run them and check they pass.** Run `mvn -q -B test -Dtest=EnquiryEndpointsTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add backend-java/src/main/java/com/connectmaratha/api/enquiry backend-java/src/test/java/com/connectmaratha/api/enquiry/EnquiryEndpointsTest.java
git commit -m "feat(backend-java): quotes, my requirements, status and admin summary"
```

---

### Task 6: Live events for enquiries

**Files:**
- Create: `backend-java/src/main/java/com/connectmaratha/api/enquiry/event/EnquiryLiveRelay.java`
- Modify: `backend-java/src/main/java/com/connectmaratha/api/enquiry/controller/EnquiryController.java`
- Test: `backend-java/src/test/java/com/connectmaratha/api/enquiry/EnquiryStreamTest.java`

**Interfaces:**
- Consumes: `LiveUpdates`, `SseTestClient`, `SseLiveUpdates.disconnectAll()` (Task 2); `EnquiryCreated` and `EnquiryUpdated` (Tasks 4 and 5); `EnquiryJson.update(...)` (Task 5).
- Produces:
  - `EnquiryLiveRelay` (`@Component`): `public static final String CHANNEL = "enquiries"`. `@TransactionalEventListener(phase = AFTER_COMMIT) void created(EnquiryCreated e)` → `live.publish(CHANNEL, "enquiry.created", e.card())`. `@TransactionalEventListener(phase = AFTER_COMMIT) void updated(EnquiryUpdated e)` → `live.publish(CHANNEL, "enquiry.updated", EnquiryJson.update(e.id(), e.status(), e.quotesCount()))`
  - `GET /api/enquiries/stream` (no login): `return live.subscribe(EnquiryLiveRelay.CHANNEL, req, res);`

- [ ] **Step 1: Write the failing tests** (`@SpringBootTest(webEnvironment = RANDOM_PORT)`, extends `PostgresTestBase`. Members M7101 (poster, phone 9822144599) and M7102. HTTP calls use `java.net.http.HttpClient` with a JSON body and a `Bearer` token. In `@AfterEach`: close the clients, then `live.disconnectAll(); limiter.reset(); rateLimit.reset();`.)

```java
@Test void newRequirementArrivesLiveWithoutPhone() {
    SseTestClient c = SseTestClient.open(port, "/api/enquiries/stream");
    c.awaitLine(l -> l.equals("event:connected"), Duration.ofSeconds(3));
    // M7101 POSTs a valid requirement with "phone": "9822144599"
    c.awaitLine(l -> l.equals("event:enquiry.created"), Duration.ofSeconds(3));
    String data = c.awaitLine(l -> l.startsWith("data:"), Duration.ofSeconds(3));
    assertThat(data).contains("\"title\":").contains("\"isMine\":false").doesNotContain("9822144599").doesNotContain("M7101");
}
@Test void quoteArrivesAsUpdatedCount()      // after M7102 quotes: "event:enquiry.updated" then data with "\"quotesCount\":1" and "\"status\":\"open\""
@Test void statusChangeArrivesLive()         // poster closes: data contains "\"status\":\"closed\""
@Test void rejectedPostSendsNothing()        // POST with no title → 400; c.noLineWithin(l -> l.equals("event:enquiry.created"), Duration.ofSeconds(2)) is true
@Test void sixthStreamFromOneIpIsRefused()   // 5 × 200, 6th status 429
```

- [ ] **Step 2: Run them and check they fail.** Run `mvn -q -B test -Dtest=EnquiryStreamTest`. Expected: FAIL (the stream path returns 404 or 405).

- [ ] **Step 3: Implement the relay and the stream endpoint** (signatures in Interfaces). Because of AFTER_COMMIT, a rolled-back or rejected request publishes nothing.

- [ ] **Step 4: Run them and check they pass.** Run `mvn -q -B test -Dtest=EnquiryStreamTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add backend-java/src/main/java/com/connectmaratha/api/enquiry backend-java/src/test/java/com/connectmaratha/api/enquiry/EnquiryStreamTest.java
git commit -m "feat(backend-java): live enquiry events over SSE (/api/enquiries/stream)"
```

---

### Task 7: Account deletion removes requirements and quotes

**Files:**
- Modify: `backend-java/src/main/java/com/connectmaratha/api/auth/service/AuthService.java` (the `tx.executeWithoutResult` block of account deletion, before `DELETE FROM members`)
- Test: `backend-java/src/test/java/com/connectmaratha/api/auth/AuthEndpointsTest.java` (extend `appDeleteAccountRemovesTheMemberAndTheirContent`)

**Interfaces:**
- Consumes: `LazyTables.ensureEnquiryTables()` (test setup only).

- [ ] **Step 1: Extend the test.** Before the deletion calls: `tables.ensureEnquiryTables()`; insert requirement `ENQ-D1` by M8030 and `ENQ-D2` by M8099; insert quote `QT-D1` by M8099 on `ENQ-D1`, and quote `QT-D2` by M8030 on `ENQ-D2`. After the successful deletion, assert:

```java
assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiries WHERE member_id = 'M8030'", Integer.class)).isZero();
assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiry_quotes WHERE member_id = 'M8030'", Integer.class)).isZero();
assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiry_quotes WHERE enquiry_id = 'ENQ-D1'", Integer.class)).isZero();
assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiries WHERE id = 'ENQ-D2'", Integer.class)).isEqualTo(1);
```

- [ ] **Step 2: Run it and check it fails.** Run `mvn -q -B test -Dtest=AuthEndpointsTest`. Expected: FAIL on the first new assertion (expected 0 but was 1).

- [ ] **Step 3: Implement.** Inside the transaction, so it is atomic with the member deletion: run `SELECT to_regclass('public.enquiries') IS NOT NULL`. When it is true, run `DELETE FROM enquiry_quotes WHERE member_id = ?` and then `DELETE FROM enquiries WHERE member_id = ?`. The cascade removes the quotes on the member's requirements. The existence check keeps a missing table from aborting the PostgreSQL transaction.

- [ ] **Step 4: Run it and check it passes.** Run `mvn -q -B test -Dtest=AuthEndpointsTest`. Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add backend-java/src/main/java/com/connectmaratha/api/auth/service/AuthService.java backend-java/src/test/java/com/connectmaratha/api/auth/AuthEndpointsTest.java
git commit -m "feat(backend-java): account deletion also removes requirements and quotes"
```

---

### Task 8: Ship the backend

**Files:**
- Modify: `backend-java/README.md` (new section "New features (not in Node)": the 7 endpoints from spec §5, the stream, and the `enquiry/` and `common/live/` packages)

- [ ] **Step 1: Run the full suite.** Run `mvn -q -B clean test`. Expected: exit 0, and the output contains `PARITY: compared 458 replies, 0 differ`.
- [ ] **Step 2: Update the README and commit.** `git add backend-java/README.md docs/superpowers && git commit -m "docs: enquiry feature and plan"`, then `git push origin Abhay_app`.
- [ ] **Step 3: Open the PR to `main`** (in `E:\community_mobile_main`):

```bash
git checkout main && git pull --ff-only origin main
git checkout -b feat/leads-backend
git checkout Abhay_app -- backend-java database/migrations/008_enquiries.sql docs/superpowers
git commit -m "feat: B2B opportunities backend with live updates (/api/enquiries)"
git push -u origin feat/leads-backend
git checkout main
```
This checkout is sparse (it does not show `backend-java`), so `git checkout Abhay_app -- ...` may print a sparse-checkout warning. Confirm with `git diff --cached --stat` before committing that the files are staged. Afterwards, check that `git diff --stat Abhay_app feat/leads-backend -- backend-java` prints nothing. Give the user the PR link `https://github.com/ttppgames11-dotcom/cm/pull/new/feat/leads-backend`.

- [ ] **Step 4 (user):** Merge the PR, then run `git pull` and `powershell -ExecutionPolicy Bypass -File .\deploy\deploy-java.ps1`, typing `YES`, at a quiet time.
- [ ] **Step 5: Check the live API.**
  - `curl -s https://api.connectmaratha.com/api/enquiries` prints `{"success":true,"count":0,"enquiries":[]}`.
  - `curl -s -o /dev/null -w '%{http_code}' https://api.connectmaratha.com/api/admin/enquiries-summary` prints `401`.
  - `curl -sN --max-time 30 https://api.connectmaratha.com/api/enquiries/stream` shows `retry:5000`, `event:connected`, and a `:ping` line within 25 s. That last one proves Cloudflare passes the stream through.

---

### Task 9: Website list logic (pure functions)

**Files:**
- Create: `frontend/src/pages/business/enquiryList.js`
- Test: `frontend/src/pages/business/enquiryList.test.js`

Work in `E:\community_mobile_main` on a new branch: `git checkout main && git pull --ff-only origin main && git checkout -b feat/leads-website`.

**Interfaces:**
- Produces (ES module, no React):
  - `STATUS_LABELS = { open: 'सक्रिय (Open)', closed: 'पूर्ण (Closed)' }`; `statusLabel(status)` (unknown → the open label)
  - `matchesFilters(card, { district, category })`: `'सर्व'`, `''` or `undefined` means all
  - `addEnquiry(list, card, filters)`: returns `[card, ...list]`, or **the same array** when the id is already present or the card does not match
  - `updateEnquiry(list, update)`: returns a new array with `{ status, quotesCount }` merged into the card with `update.id`, or **the same array** when the id is absent
  - `concernsMe(list, update)`: the card exists and `isMine`; `isNewQuoteForMe(list, update)`: `concernsMe` and `update.quotesCount > (card.quotesCount ?? 0)`. Call these with the list **before** applying the update

- [ ] **Step 1: Write the failing tests** (`import { test } from 'node:test'; import assert from 'node:assert/strict';`)

```js
test('labels', () => { assert.equal(statusLabel('closed'), 'पूर्ण (Closed)'); assert.equal(statusLabel('x'), 'सक्रिय (Open)'); });
test('all-filters', () => { /* सर्व, '' and undefined match any card; 'पुणे' matches only district पुणे */ });
test('add prepends a new matching card', () => { /* addEnquiry([b], a, {}) deepEqual [a, b] */ });
test('add ignores a duplicate id and a card outside the filter', () => {
  const list = [{ id: 'E1', district: 'पुणे', category: 'IT' }];
  assert.equal(addEnquiry(list, { id: 'E1', district: 'पुणे', category: 'IT' }, {}), list);
  assert.equal(addEnquiry(list, { id: 'E2', district: 'नाशिक', category: 'IT' }, { district: 'पुणे' }), list);
});
test('update merges status and count only', () => { /* other fields unchanged; unknown id returns the same array */ });
test('new quote for me only when mine and the count went up', () => {
  const list = [{ id: 'E1', isMine: true, quotesCount: 1 }, { id: 'E2', isMine: false, quotesCount: 0 }];
  assert.equal(isNewQuoteForMe(list, { id: 'E1', status: 'open', quotesCount: 2 }), true);
  assert.equal(isNewQuoteForMe(list, { id: 'E1', status: 'closed', quotesCount: 1 }), false);
  assert.equal(isNewQuoteForMe(list, { id: 'E2', status: 'open', quotesCount: 1 }), false);
  assert.equal(concernsMe(list, { id: 'E1', status: 'closed', quotesCount: 1 }), true);
});
```

- [ ] **Step 2: Run them and check they fail.** Run `node --test src/pages/business/enquiryList.test.js`. Expected: FAIL (`Cannot find module ... enquiryList.js`).
- [ ] **Step 3: Implement `enquiryList.js`** with the signatures above.
- [ ] **Step 4: Run them and check they pass.** Run `node --test src/pages/business/enquiryList.test.js`. Expected: `# fail 0`.
- [ ] **Step 5: Commit.** `git add frontend/src/pages/business/enquiryList.js frontend/src/pages/business/enquiryList.test.js && git commit -m "feat(website): leads list logic for live updates"`

---

### Task 10: API helpers and the live-stream hook

**Files:**
- Modify: `frontend/src/services/directApi.js`
- Modify: `frontend/src/services/api.js` (the `enquiries` block)
- Create: `frontend/src/hooks/useEnquiryStream.js`

**Interfaces:**
- Produces:
  - `export function apiUrl(path)` in `directApi.js`: returns `'https://api.connectmaratha.com' + path` on `www.connectmaratha.com` and `connectmaratha.com`, otherwise `path`. It reuses the module's existing `API_ORIGIN` and `LIVE_HOSTS`
  - `api.enquiries.mine()` → `request('/enquiries/mine')`; `api.enquiries.setStatus(id, status)` → `request('/enquiries/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) })`
  - `export function useEnquiryStream({ onCreated, onUpdated, onReconnect })` → `{ connected }`

- [ ] **Step 1: Install the website's dependencies** (the main checkout has no `node_modules`). Run `npm install`. Expected: it finishes without `ERR!`. If it creates `frontend/package-lock.json`, leave that file uncommitted: the repository does not track one for the frontend.
- [ ] **Step 2: Implement the helpers and the hook.** The hook:
  - Opens `new EventSource(apiUrl('/api/enquiries/stream'))` once on mount.
  - On the `connected` event, sets `connected = true` and calls `onReconnect()` on every `connected` **after the first**.
  - Parses `enquiry.created` and `enquiry.updated` with `JSON.parse(e.data)` and passes them to the handlers.
  - `onerror` sets `connected = false`. The browser retries by itself.
  - Keeps the handlers in refs, so re-renders never reopen the stream.
  - Closes the stream on unmount, and does nothing when `typeof EventSource === 'undefined'`.
- [ ] **Step 3: Build.** Run `npm run build`. Expected: `✓ built in`, with no errors.
- [ ] **Step 4: Commit.** `git add frontend/src/services/directApi.js frontend/src/services/api.js frontend/src/hooks/useEnquiryStream.js && git commit -m "feat(website): apiUrl helper, enquiry API calls and live-stream hook"`

---

### Task 11: The `/leads` page

**Files:**
- Modify: `frontend/src/pages/business/BusinessLeadsPortalPage.jsx`

**Interfaces:**
- Consumes: `statusLabel`, `addEnquiry`, `updateEnquiry`, `concernsMe`, `isNewQuoteForMe` (Task 9); `useEnquiryStream`, `api.enquiries.mine`, `api.enquiries.setStatus` (Task 10); `useToast().showToast(message, type)` from `context/ToastContext`.

- [ ] **Step 1: Make the changes** (spec §8, items 1–5):
  1. **Login before posting.** The "new requirement" button, when there is no `user`, shows the same alert pattern as quoting and `navigate('/login?redirect=' + encodeURIComponent('/leads'))`.
  2. **Status.** Every status display uses `statusLabel(enq.status)`, and closed checks become `enq.status === 'closed'`.
  3. **Card actions.** `isMine` shows a "तुमची मागणी" badge with no quote button; `closed` shows no quote button; `quotedByMe` makes the button read "कोटेशन अपडेट करा"; otherwise the existing button stays.
  4. **Tabs.** "सर्व संधी" (all) and, for logged-in users only, "माझ्या मागण्या". The second loads `api.enquiries.mine()` and lists each requirement with its status label and a Close/Reopen button (`setStatus(id, status === 'open' ? 'closed' : 'open')`, then reload "mine" and the list). Each quote shows business name, owner, `<a href={'tel:' + q.phone}>`, amount, notes and `new Date(q.updatedAt).toLocaleString('mr-IN')`. With no quotes, it shows "अद्याप कोटेशन नाही".
  5. **Live updates.** Use `useEnquiryStream`, and keep refs to the latest `enquiries` list and filters:
     - **`onCreated(card)`:** `setEnquiries(l => addEnquiry(l, card, filtersRef.current))`.
     - **`onUpdated(u)`:** read `enquiriesRef.current` first. If `isNewQuoteForMe`, call `showToast('नवीन कोटेशन मिळाले!', 'success')`. If `concernsMe`, reload "mine". Then `setEnquiries(l => updateEnquiry(l, u))`. Do not put side effects inside the state updater: StrictMode runs updaters twice, which would show two toasts.
     - **`onReconnect`:** `loadEnquiries`.
     - **Header indicator.** A green "● लाइव्ह" when `connected`, otherwise a grey "● जोडत आहे…".
- [ ] **Step 2: Build.** Run `npm run build`. Expected: `✓ built in`, with no errors.
- [ ] **Step 3: Smoke-test locally against the live API** (after Task 8 is deployed). Run `$env:VITE_API_TARGET='https://api.connectmaratha.com'; npm run dev` and open `http://localhost:5173/leads`. The list loads and the "● लाइव्ह" dot turns green. Stop the server.
- [ ] **Step 4: Commit.** `git add frontend/src/pages/business/BusinessLeadsPortalPage.jsx && git commit -m "feat(website): live B2B opportunities page with My requirements tab"`

---

### Task 12: Ship the website

- [ ] **Step 1: Push and open the PR.** `git push -u origin feat/leads-website`, then give the user the PR link (`https://github.com/ttppgames11-dotcom/cm/pull/new/feat/leads-website`). Return to `main` with `git checkout main`.
- [ ] **Step 2 (user):** Merge the PR. Vercel publishes it.
- [ ] **Step 3: Two-browser check on the live site** (member A in one browser, member B in a private window):
  1. A posts a requirement. Within about 2 s it appears on B's open `/leads` page without a refresh.
  2. B quotes. A sees "नवीन कोटेशन मिळाले!" and the quote, with B's phone, under "माझ्या मागण्या". The card's quote count shows 1 on both screens.
  3. A closes it. B's card turns "पूर्ण (Closed)" and loses its quote button.
  4. On A's card, the badge reads "तुमची मागणी" and there is no quote button.
  5. The SuperAdmin dashboard lists the requirement.
- [ ] **Step 4: Rollback, if needed.** Revert the website PR on GitHub. For the backend, revert the backend PR and run `deploy-java.ps1` again. The tables stay, which does no harm.
