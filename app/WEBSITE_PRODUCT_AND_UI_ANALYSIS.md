# Connect Maratha — Website Product & UI/UX Analysis

**Scope of this document:** a deep, source-verified UI/UX and product analysis of the existing web application at `E:\new project`, produced to guide (not yet implement) the native Flutter mobile rebuild at `E:\community_mobile\app`. No Flutter code was written or modified while producing this document, and nothing in `E:\new project` was changed. Every claim below is grounded in the actual HTML/CSS/JS source — where the source doesn't say enough to decide something, it is explicitly marked **"Needs product decision."**

Sources inspected: all 72 `cm-*.html` pages + `index.html`, the full `assets/css/style.css` (5,561 lines), all four JS files (`app.js`, `cm-connect.js`, `cm-admin.js`, `cm-data.js`, ~7,500 lines combined), and the `assets/images/` folder. `prototypes_backup/` (29 superseded page copies) and `scratch/` were excluded as non-current.

---

## 1. Executive Summary

Connect Maratha (कनेक्ट मराठा) is a **100% client-side prototype** — there is no backend, no real API, and no real database anywhere in the current code. A single in-browser object called `CMDB` (`assets/js/cm-data.js`) simulates a full backend by seeding demo data into one `localStorage` blob (`cm_db_v1`) and exposing ~90 CRUD-like functions that the rest of the JS calls. This is confirmed by a code comment in `cm-data.js` itself and by the total absence of `fetch`/`XHR`/`axios` anywhere except one external QR-image URL. Authentication is cosmetic: any non-empty password is accepted, role is self-selected, and the dashboard silently auto-logs in a demo profile if no session exists at all (`app.js`, dashboard personalization block) — there is no real route guarding anywhere in the web app.

The product is actually **three loosely-related things wearing one skin**:
1. A **Maratha history/culture encyclopedia** — ~35 static long-form content pages (forts, rulers, warriors, symbols, timelines), the single largest content mass in the codebase.
2. A **community + business-networking social app** — profiles, groups, feed, messaging, business directory, a BNI-style referral/"Business Sangam" CRM suite, events, donations, jobs, services.
3. An **internal back-office** — a ~30-view admin CRM (`cm-admin.html`) and a CEO/executive metrics dashboard (`cm-ceo-dashboard.html`), both openly accessible with no login gate.

A structurally important finding: the site actually ships **three visually and structurally different header/shell systems** (see §5.9 and §12.1) — the main "mega site-header + mega-footer" used by most content/directory pages, a condensed app-shell header with no footer used by the "Business Sangam" CRM cluster, and a completely separate `.navbar` component (with a different color theme) used by the Referrals and CEO Dashboard pages. This is strong evidence the CRM/referral/CEO-dashboard features were built as a separate module bolted onto the main site, and it should inform how the Flutter app's navigation is structured (see §7).

The visual identity is a **saffron/orange palette**, not the maroon-dominant palette one might expect from the class names — confirmed directly from the single `:root` block in `style.css` (§5.1). Several CSS variables are misleading: `--gold-300`, `--gold-400`, `--saffron-50`, `--paper-2` all literally resolve to `#FFFFFF`, and `--ink`, `--maroon-800`, `--success`, and `--danger` all resolve to the identical `#E65100`. This is evidence of an incomplete rebrand pass, not intentional design, and the Flutter design system should deliberately clean this up rather than port it verbatim (see §5.1, §13).

Mobile support in the existing site is thin and inconsistent: there is a real, JS-injected hamburger drawer (`initMobileDrawer`/`initMobileNavigation` in `app.js`) that works on every page, but it exists in **two overlapping, slightly different implementations** in the same file, a `.bottom-nav` CSS component is fully styled but **never actually placed in any current page's HTML**, and only 5 of the ~72 pages have any page-specific responsive `@media` rule at all — everything else depends entirely on the shared stylesheet's grid auto-collapse behavior.

---

## 2. Product Understanding

**What it is:** a Marathi-language (`lang="mr"`) digital platform for the Maratha community, "अखिल भारतीय मराठा डिजिटल महासंघ." It bundles a cultural/historical knowledge base with a member social network and a business-networking/referral system, run entirely as a client-side demo with simulated data.

**Who uses it (as modeled by the demo data, `demoUserProfiles` in `app.js`):**
- **General Member** — the default consumer: browses content, joins groups, posts to the feed, messages other members.
- **Business Owner** — additionally lists a business, gives/receives referrals, joins a "Business Mandal" (chapter).
- **Service Provider** — offers bookable services (consulting, legal, trekking guides, etc.).
- **Karyakarta/Coordinator** — a volunteer/organizer role; no distinct UI is actually gated to this role anywhere in the code (it exists as a login dropdown option only).
- **Admin** (`cm-admin.html`) and **CEO/Executive** (`cm-ceo-dashboard.html`) — internal back-office roles, both currently open with no auth gate and an explicit "Demo — no login required" banner on the admin console.

**Core data entities** (from `cm-data.js`'s seeded collections): Member, Business, Group, GroupPost, FeedPost, Campaign (donation), Event, Conversation, Chapter ("Business Mandal"), ProfessionSeat, ChapterMember, OneToOneMeeting, BusinessApplication, SevaRequest (welfare), Volunteer, Lead, Opportunity (referral CRM), Subscription, plus a large finance/ledger cluster (FundAccount, Commission, ExpenseLedger, FinanceApproval, TransactionLedger) that only the admin console touches. "Referral" itself is referenced by CRUD function names (`listReferrals`, `createReferral`, etc.) but has no seeded demo rows — its shape is inferred from usage, not from seed data.

**What is real functionality vs. decoration:** genuinely interactive, JS-wired features include the registration stepper, login/demo-login, group/feed post+comment+like, business review submission, referral CRM with a 5-stage pipeline, service/event booking with a generated QR e-ticket, donation with a receipt ID, a knowledge-graph explorer (`cm-heritage-map.html`), and filterable directories (`cm-forts-map.html`, `cm-dnyankosh.html`, `cm-historical-dates.html`). Decorative-only elements include the homepage stat counters (hardcoded "350+ forts," "25,420 active members," etc. — not computed from any dataset), the CEO dashboard's 8 macro-metric tiles (hardcoded, inconsistent with the page's own dynamically-computed district drill-down section), and most of the ~35 heritage pages, which are pure static prose with no interactivity beyond scroll and an occasional lightbox/tab.

---

## 3. Complete Module Map

Grouping the 72 pages by actual function (not by filename), with the header-shell family each belongs to (see §5.9/§12.1):

| # | Module | Pages | Shell family |
|---|---|---|---|
| 1 | **Authentication** | cm-login, cm-register | Mega header (public) |
| 2 | **Home / Landing** | index.html, cm-home.html | Mega header, own embedded styles |
| 3 | **Dashboard** | cm-dashboard | Mega header |
| 4 | **Community** (feed, groups, people directory, messaging) | cm-community, cm-groups, cm-group-detail, cm-directory-people, cm-messages | Mega header (community/groups/directory) → condensed shell (group-detail, messages) |
| 5 | **People Directories** (curated showcases) | cm-professionals, cm-leaders, cm-achievers | Mega header |
| 6 | **Business Directory** | cm-business-directory, cm-business-profile, cm-list-business | Mega header (directory/list-business) → condensed shell (business-profile) |
| 7 | **Business Sangam (referral/CRM suite)** | cm-business-sangam, cm-business-membership-application, cm-business-opportunities, cm-my-business-mandal, cm-chapter-detail, cm-one-to-one-meetings | Condensed shell, no footer |
| 8 | **Referral Engine** | cm-referrals, cm-referral-detail, cm-create-referral | **Separate `.navbar` shell** (own component) |
| 9 | **Events & Donations** | cm-events, cm-campaign-detail, cm-donation | Mega header (events/donation) → condensed shell (campaign-detail) |
| 10 | **Jobs & Services** | cm-jobs, cm-services | Mega header |
| 11 | **Search** | cm-search | Mega header, own embedded styles, own hardcoded KB array |
| 12 | **Profile & Membership** | cm-profile, cm-profile-edit, cm-membership | Condensed shell (profile, profile-edit) → Mega header (membership) |
| 13 | **Culture/Heritage Content Library** | ~35 pages (see §4.2) | Mega header |
| 14 | **Admin / Back-office** | cm-admin | Own `.admin-shell` component |
| 15 | **CEO Dashboard** | cm-ceo-dashboard | **Separate `.navbar` shell**, dark indigo theme |
| 16 | **Support / Misc** | cm-contact, cm-community-safety, cm-news, cm-more, cm-search | Mega header |

**Key grouping decision:** Business Sangam (#7) and the Referral Engine (#8) are functionally one BNI-style referral-networking feature, but they are built as two separate shells. For Flutter, treat them as a single "Business Networking" module with one consistent navigation shell — the shell-fragmentation in the web app is a defect to fix, not a pattern to preserve. Likewise, the CEO Dashboard (#15) and Admin (#14) are both unauthenticated back-office tools; recommend keeping them out of the consumer mobile app's primary IA entirely (see §19).

---

## 4. Complete Screen Inventory

### 4.1 Functional-module pages (37 pages)

Legend — **CMDB**: page content is rendered dynamically from the simulated database (little/no static markup to reference); **Static**: content is hand-authored HTML; **Mixed**: some sections dynamic, some static.

| Page | Purpose | Role | Primary action | Key components | Data source | Mobile destination | Separate screen? |
|---|---|---|---|---|---|---|---|
| cm-login.html | Sign in | any | Login submit / demo login | form, role select, demo button | Static | Auth flow | Yes (built, Phase 2) |
| cm-register.html | Sign up | any | 5-step stepper submit | stepper, OTP demo, tier cards | Static+CMDB writes | Auth flow | Yes (built, Phase 2) |
| index.html | Marketing/portal home | any | Register / Login / Explore | hero switcher, 70-link sitemap, stat glass, empire history sections | Static | Home | Collapse with cm-home.html (§4.3) |
| cm-home.html | Marketing/portal home (alt skin) | any | Register / Login / Explore | same content, shared CSS classes (not own embedded styles) | Static | Home | Collapse with index.html |
| cm-dashboard.html | Authenticated landing | member | Quick actions, logout | ID card, KPI strip, quick-grid, booked-services list | Mixed (session-seeded) | Home tab | Yes (built, Phase 2) |
| cm-community.html | Social feed | member | Create post | composer, `#cmFeedRoot` | CMDB | Community tab | Yes |
| cm-groups.html | Browse groups | member | Create group (stub) | location/interest grids | CMDB | Community → Groups | Yes |
| cm-group-detail.html | One group's posts/members | member | Post to group / join | loading shell, group-post composer | CMDB (shell only) | Community → Group detail | Yes |
| cm-directory-people.html | Member search/directory | member/visitor | Search members | search+tabs, group preview, member grid | CMDB | Community → People | Yes |
| cm-messages.html | Inbox + thread | member | Send message | 2-col list+thread (only page with its own responsive breakpoint, 760px) | CMDB | Messages tab | Yes |
| cm-professionals.html | Bookable expert directory | member | Book consultation | search+tabs, static profile cards, booking modal trigger | Static+modal | Business → Professionals, or Services | Could merge into Services |
| cm-leaders.html | Community leaders showcase | member | View profile | search+tabs, real `<img>` avatar cards | Static | Community → Leaders | Reusable "people grid" component |
| cm-achievers.html | Hall of Fame showcase | member | Nominate / view profile | own embedded CSS, filter+search, real `<img>` avatar cards | Static (self-contained JS) | Community → Achievers | Reusable "people grid" component |
| cm-business-directory.html | Browse businesses | member | Search/filter businesses | stat-strip, search+tabs, `data-dynamic` grid | CMDB | Business tab | Yes |
| cm-business-profile.html | One business's detail | member | Call/book/review/share | hero, stats bar, hours, reviews, gallery, share dropdown (extensive own CSS) | CMDB (shell only) | Business → Detail | Yes |
| cm-list-business.html | Submit a business listing | business owner | Submit form | form+file upload | CMDB write | Business → Add listing | Yes |
| cm-business-sangam.html | Referral-networking hub | business owner | Navigate to sub-features | hero CTAs, dynamic stats | CMDB (shell only) | Business Networking home | Yes |
| cm-business-membership-application.html | Chapter membership application | business owner | Submit application | fully dynamic form | CMDB | Business Networking → Apply | Yes |
| cm-business-opportunities.html | Opportunity/lead CRM | business owner | Manage pipeline | fully dynamic | CMDB | Business Networking → Opportunities | Yes |
| cm-my-business-mandal.html | My chapter's dashboard | business owner | View chapter stats | fully dynamic | CMDB | Business Networking → My Chapter | Yes |
| cm-chapter-detail.html | One chapter's detail | business owner | Apply / view seats | fully dynamic | CMDB | Business Networking → Chapter detail | Yes |
| cm-one-to-one-meetings.html | Schedule 1-to-1 meetings | business owner | Request meeting | fully dynamic | CMDB | Business Networking → Meetings | Yes |
| cm-referrals.html | Referral pipeline tracker | business owner | Give referral | KPI banner, pipeline tabs, referral list | CMDB | Business Networking → Referrals | Yes |
| cm-referral-detail.html | One referral's pipeline | business owner | Update status | 5-stage visual pipeline, `prompt()`-based close | CMDB | Business Networking → Referral detail | Yes |
| cm-create-referral.html | Give a new referral | business owner | Submit referral | 7-field form | CMDB write | Business Networking → New referral | Could be a form flow, not full screen |
| cm-events.html | Browse/register events | member | Register (get QR ticket) | category tabs, static event list, registration form | Static+CMDB | Events tab | Yes |
| cm-campaign-detail.html | One donation campaign | member | Donate | loading shell | CMDB (shell only) | Donations → Campaign detail | Yes |
| cm-donation.html | Browse donation campaigns | member | Donate | category tabs, `data-dynamic` grid, transparency stats | CMDB | Donations tab (or under Events) | Yes |
| cm-jobs.html | Job board | member | Apply | search+tabs, static job list | Static | Jobs tab (or under Services) | Could merge into Services |
| cm-services.html | Bookable service catalog | member | Book service | animated hero stats, search+9 tabs, service cards, custom-request form | Static+modal | Services tab | Yes |
| cm-search.html | Global knowledge search | any | Search | search hero, quick chips, results grid (860px breakpoint), own hardcoded 20-item KB | Static (dual system) | Search tab | Yes |
| cm-news.html | News/press feed | any | Browse (read-only) | category tabs, static list, media-partner cards | Static | Discover → News | Could merge into Discover |
| cm-more.html | Full sitemap (~38 tiles) | any | Navigate anywhere | icon-tile grid | Static | Not a screen — becomes the Discover/More tab's structure itself | No — becomes IA, not a screen |
| cm-contact.html | Contact/grievance form | any | Submit | form+dropdown, emergency-safety notice | Static | Profile/Settings → Contact | Yes (simple form) |
| cm-community-safety.html | Emergency safety info | any | Call helpline | static info page | Static | Profile/Settings → Safety, or Home banner | Yes (simple content) |
| cm-profile.html | View own/other profile | member | (dynamic) | loading shell | CMDB (shell only) | Profile tab | Yes |
| cm-profile-edit.html | Edit own profile | member | Save profile | large form, self-ID disclaimer, no footer | CMDB write | Profile → Edit | Yes |
| cm-membership.html | Tier pricing plans | member | Choose tier (non-functional in source) | 4 pricing cards | Static | Profile → Membership | Yes |
| cm-admin.html | Back-office CRM (~30 views) | admin | Manage everything | sidebar shell, ~30 admin views, own CSS | CMDB (dedicated `cm-admin.js`) | **Out of consumer app** — see §19 | Separate app/tool, not a mobile screen |
| cm-ceo-dashboard.html | Executive metrics | executive | View metrics (read-only) | gradient header, macro tiles, dynamic district drill-down, top-mandals table | Mixed (partially hardcoded) | **Out of consumer app** — see §19 | Separate app/tool, not a mobile screen |

### 4.2 Heritage/Culture content pages (~35 pages) — one reusable template

Full read confirmed a single common template shared by ~30 of these pages: topbar → mega header → breadcrumb → war-cry quote → hero (`.hero-website-grid`: eyebrow/H1/tagline/stat-glass left, `.hero-real-card` photo+badge right) → a decorative Rajmudra SVG seal (copy-pasted verbatim across nearly every page) → a sequence of content sections (data tables, info-card grids, photo galleries, `.battle-card` treatises, `.researcher-card` scholar quotes, pull-quotes) → a "Related pages" 2-3 card row → a bibliography/sources notice → the standard mega-footer.

**Recommendation: build ONE Flutter "Heritage Detail Screen" driven by structured content data** (JSON/Dart data files per article — hero image, stat tiles, ordered content blocks, related-article IDs), not 35 hand-built screens. This directly matches the earlier `FLUTTER_MIGRATION_ANALYSIS.md`'s recommendation and is now confirmed page-by-page.

Pages that genuinely deviate and need their own screen/widget (not the generic template):
- **cm-forts-map.html** — filterable/searchable fort directory (search + 6 district chips + 5 category tabs over a fort-card grid). → a **Forts Directory** screen (filter chips + grid), separate from the article template.
- **cm-heritage-map.html** — an interactive "knowledge graph" explorer (7 entity buttons rewriting a connected-entities panel via `loadGraphEntity()`). → a bespoke **Knowledge Explorer** screen; the most "app-like" heritage page in the set.
- **cm-historical-dates.html** — a calendar/timeline widget (time-slice buttons, era pills, a date picker) with no `.hero` at all. → a bespoke **Timeline** screen.
- **cm-dnyankosh.html** — a filterable 11-category encyclopedia index grid. → an **Encyclopedia Index** screen (filter chips + grid), feeding into the generic article template for each entry.

A secondary "lighter" sub-tier of the template exists (`cm-culture`, `cm-dnyankosh`, `cm-education`, `cm-maratha-navy`, `cm-mavale`, `cm-swarajya-administration`, `cm-temples` use a compact `.hero.short` with less content) versus "flagship" pages (`cm-shivaji-maharaj`, `cm-history`, `cm-warriors`, individual fort/ruler biography pages) with the full two-column hero and much deeper content — the Flutter article template should support both a "short" and "long" content-length variant of the same layout, not force every article to look identically dense.

### 4.3 Home — index.html vs cm-home.html

These are **near-duplicate content with two different visual skins**, not two different screens: same hero copy, same 4 hardcoded stat numbers ("350+ forts," "25,420 active members," "2,540+ businesses"), same section order and content through the "legendary leaders" section. `index.html` has its own ~430-line embedded `<style>` block with a nicer animated multi-layer hero and an extra "70-portal sitemap" section; `cm-home.html` has no embedded styles and reuses the same shared class vocabulary (`.hero-website-grid`, `.hero-real-card`, `.stats-glass`) as every inner heritage page, making it structurally more consistent with the rest of the site.

**Recommendation:** collapse these into a single Flutter Home screen spec. Base the structure on `cm-home.html` (shared vocabulary = more consistent design system), but the hero-image-switcher interaction and the "full sitemap as navigation" idea from `index.html` are both worth keeping conceptually (see §9).

Note: `index.html`'s own sitemap links to `cm-home.html` labeled "🏡 युझर सोशल फीड" (user social feed) — implying `cm-home.html` is *conceptually* meant to be the logged-in user's feed-home, but as authored it contains identical static marketing content, not a feed. This is a naming/intent mismatch in the source, not a feature to replicate.

---

## 5. Existing Visual Design Analysis (from `assets/css/style.css`, verified line-by-line)

### 5.1 Color Palette — actual `:root` values, and why not to port them verbatim

```
--bg: #FFFFFF          --paper: #FFFFFF        --paper-2: #FFFFFF      --paper-3: #FFF3E0
--maroon-950: #C73800   --maroon-900: #D84315   --maroon-800: #E65100   --maroon-700: #F4511E
--ink: #E65100          --ink-soft: #D84315     --ink-2: #C73800        --text-sec: #D84315
--gold-300: #FFFFFF     --gold-400: #FFFFFF     --gold-500: #F4511E     --gold-600: #E65100    --gold-700: #BF360C
--saffron-50: #FFFFFF   --saffron-100: #FFE0B2  --saffron-400: #FF7043  --saffron-500: #F4511E --saffron-600: #E65100 --saffron-700: #BF360C
--muted: #D84315        --line: #FFCC80         --success: #E65100      --danger: #E65100
--shadow-sm/md/lg: rgba(244,81,30, .08/.12/.16), 8-24px blur
--radius/-sm/-lg: 12px / 8px / 18px
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
```

This is genuinely the current brand palette (confirmed only one `:root` block exists — no theme override, no dark mode). But it is **internally broken**: `--gold-300/400` and `--saffron-50` are white, not gold; `--paper-2` is also white despite implying a distinct surface tone; `--ink`, `--maroon-800`, `--success`, and `--danger` are all the *same* `#E65100` — meaning success and error states currently share one color, and there's no way to visually distinguish them from the design tokens alone. Buttons even have a live contrast bug from this: `.btn-primary` sets `color: var(--maroon-800)` (`#E65100`, dark orange) as text on an orange gradient background (`#FF4500→#FF6A3C`) — low-contrast text on a similar-hue background, almost certainly an unintended side-effect of a find/replace pass during a rebrand.

Separately, a real "golden-tan" accent color — `rgba(233,196,106,…)` — is used **30+ times** throughout the file (modal borders, drawer shadows, glow effects) but has **no matching named CSS variable at all**. This is the actual gold accent the design wants; the `--gold-*` variables don't deliver it.

**Recommendation for Flutter (`AppColors`, detailed in §13):** define a small, clean, deduplicated palette — 3–4 real orange/maroon shades, a true gold-tan accent (`#E9C46A`-ish, matching the undeclared `rgba(233,196,106,…)`), off-white/cream surfaces, and **separate, distinct** semantic success/warning/error colors (green/amber/red) rather than porting the current collapsed scheme. This preserves the brand's genuine saffron/maroon identity while fixing a real, demonstrable defect rather than replicating it.

### 5.2 Typography

- **Font imports** (`style.css` line 1, Google Fonts): `Baloo 2` (400–800), `Inter` (400–700), `Tiro Devanagari Marathi` (regular+italic), `Cormorant Garamond` (italic 500–700), `Cinzel` (500–800), `Cinzel Decorative` (700/900).
- **Body text**: `'Inter', sans-serif`, line-height 1.6.
- **Headings (h1–h6)**: `'Baloo 2', sans-serif`, line-height 1.25 — but h1–h3 are overridden to `'Tiro Devanagari Marathi', 'Baloo 2', serif` — i.e., **Devanagari/Marathi headline text uses the Devanagari-optimized font first**, with Baloo 2 as Latin/fallback. This matters directly for Flutter: use `google_fonts` with `Tiro Devanagari Marathi` for Marathi headline text and `Baloo 2` for any Latin brand wordmark, not a single font for everything.
- `Cinzel` is used only for small Latin "royal" badges/labels (`.font-royal`); `Cormorant Garamond` italic is used for eyebrow/pull-quote text (`.serif-italic`) — both minor, low-priority to port.
- No formal type scale exists — heading sizes are ad hoc `rem`/`clamp()` values per component (hero H1 `clamp(2.1rem,5vw,3.4rem)`, section H2 `1.5rem`, card H3/H4 `1.1–1.3rem`, body copy `0.88–1.02rem`, secondary/meta text `0.78–0.98rem`, badges `0.7–0.85rem`). **Recommendation:** define a real Material 3-style type scale for Flutter (`AppTypography`, §13) rather than porting the ad hoc sizing.

### 5.3 Spacing

No spacing tokens are defined in CSS at all — spacing is ad hoc but converges on a soft 4px-multiple rhythm: 4/6/8/10/12/14/16/18/20/22/24/28/32px recur constantly (card padding 14–24px, form fields 11–12px, grid gaps mostly 12–18px, page gutter `clamp(16px,2vw,24px)`). **Recommendation:** formalize this into an explicit 4pt or 8pt `AppSpacing` scale for Flutter (§13) — the underlying rhythm is usable, it just was never named.

### 5.4 Border Radius

`--radius`/`--radius-sm`/`--radius-lg` (12/8/18px) exist but are **inconsistently applied** — most components hardcode their own literal px value instead of using the variables (e.g., `.field input` uses literal `8px` not `var(--radius-sm)`). In practice, real usage clusters around: 6px (small buttons), 8px (inputs), 10px (buttons/toasts), 12px (cards — the dominant value), 14–16px (panels, modals), 18–20px (hero/feature cards), and 50%/999px (avatars, true pills). **Recommendation:** Flutter's `AppRadius` should pick one canonical small/medium/large/pill scale (e.g., 8/12/16/999) and apply it *consistently* via component themes — fixing the inconsistency, not porting it.

### 5.5 Shadows

Three shadow tokens exist and are used fairly consistently for **elevation state** (not per-component variety): `--shadow-sm` = resting state for nearly every card type; `--shadow-md` = hover state; `--shadow-lg` = toasts, modals, and a few "hero-emphasis" elements. However, many one-off shadows bypass the tokens entirely and use a *different* rgba tint (`rgba(199,56,0,…)`, `rgba(233,196,106,…)`) than the tokens' own `rgba(244,81,30,…)` — another sign of inconsistent evolution. **Recommendation:** Flutter's `AppElevation` should standardize on one shadow tint and 2–3 elevation levels (resting/raised/floating), used via `Material`/`Card` elevation rather than hand-rolled `BoxShadow`s per widget.

### 5.6 Buttons, Inputs, Cards, Navigation, Modals, Toasts, Chips

- **Buttons:** only `.btn-primary`, `.btn-maroon`, `.btn-outline`, `.btn-glass`, `.btn-sm`, `.btn-block` exist. **There is no secondary/ghost button style and no disabled-state style anywhere in the CSS** — this is a real gap the Flutter `AppButton` needs to fill, not a pattern to search for and fail to find. Hover uses `translateY` lift + shadow growth + (on primary) a diagonal "shine sweep" animation — none of this works on touch and needs press-state (scale-down/ripple) equivalents in Flutter.
- **Inputs:** a single consistent `.field` pattern (label above, 11-12px padding, 1px `--line` border, 8px radius) — but **three different, inconsistent focus-ring treatments** exist across the file (plain outline, colored outline+offset, and a `box-shadow` ring) and **no error/invalid-state styling exists anywhere**. Flutter's `InputDecorationTheme` should define one focus state and add a real error state, since the source has none to copy.
- **Cards:** ~15 distinct card classes (`.feature-card`, `.form-card`, `.profile-card`, `.info-box-card`, `.price-card`, `.list-row`, `.service-card`, `.battle-card`, `.researcher-card`, `.kpi-card`, etc.) all follow one shared idiom underneath the different names: `1px solid var(--line)` border, `--shadow-sm` resting, 12–20px radius, lift+shadow on hover. This idiom is the right target for a single, parametrized Flutter `AppCard`.
- **Navigation:** the sticky `.site-header` cascades through 3–4 overriding definitions in the file (the last one wins: solid maroon/orange, 82px tall, `.desktop-nav` visible only ≥992px). The mobile drawer (`.mobile-nav-drawer`, slides in from the right, 320px/88vw) is real and functional (JS-injected on every page), but the `.bottom-nav` component, while fully styled (5-tab flex row + raised center FAB), is **never placed in any current page's live HTML** — it's dead CSS, not a working pattern to port.
- **Modals:** center-screen overlay dialogs (`.cm-modal`/`.cm-modal-box`, max-width ~520px, scale+fade entrance), not bottom sheets — there is no mobile-adapted modal variant in the source at all.
- **Toasts:** top-right stacking snackbar-style toasts, 3.5s auto-dismiss, but the JS only truly distinguishes **2 states** (success vs. everything else) despite call sites passing `'info'` and `'error'` — no dedicated error styling exists.
- **Badges/chips/pills:** radius varies wildly (4px rectangular tags → 16px chips → 999px true pills) with no single canonical shape, and several status-pill color variants (`confirmed`/`pending`/`completed`) have **collapsed to nearly identical colors** due to the same palette flattening noted in §5.1.

### 5.7 Breakpoints

Two structurally meaningful thresholds: **~768px** (hover-lift effects are explicitly disabled here via `transform:none !important` — this is the real "we know this might be touch" breakpoint) and **~991-992px** (desktop nav ↔ mobile drawer switch point). Everything else (420/480/500/560/576/600/640/700/720/860/900/1199/1200/1360/1440/1600/1920px) is fine-tuning of spacing/type size only, not structural layout change. For a phone-first Flutter app, only the 768px "disable hover-lift, use press states" signal is directly relevant; the rest can be ignored.

### 5.8 Grid patterns

`.grid-2/3/4` (CSS Grid, collapsing to 2-col at ≤900px and 1-col at ≤560px) and several `auto-fit, minmax(...)` grids (naturally responsive, no breakpoint needed) dominate. This maps cleanly to Flutter `GridView`/`Wrap` with responsive `crossAxisCount`.

### 5.9 The three-shell problem (structural, not just visual)

Confirmed directly in the screen inventory (§4.1): most pages use the full "mega header + mega footer," the Business Sangam cluster uses a condensed header with **no footer at all**, and the Referral Engine + CEO Dashboard use an entirely separate `.navbar.container` component with a **different color theme** (dark indigo `#1a237e` on the CEO dashboard, vs. the site-wide maroon/saffron everywhere else). This is the clearest signal in the whole codebase that these were built as separate modules at different times. **For Flutter, this must not become three different navigation shells** — one consistent `Scaffold`/`AppBar`/bottom-nav shell should serve the entire authenticated app (see §7–8).

### 5.10 What's brand identity vs. desktop-layout accident

**Brand identity worth preserving:** the maroon/saffron/gold warm color family (once cleaned up per §5.1), the Baloo 2 + Tiro Devanagari Marathi + Inter type pairing, generous card radius (12-18px) and soft warm shadows, the Rajmudra seal motif and war-cry banner strips (used as cultural framing device, not just decoration), the warm-toned imagery style.

**Desktop-layout accidents that should NOT be ported:** the mega-nav dropdown flyout, the 4-column mega-footer (a mobile app has no footer in the desktop sense — its content becomes a "More/Settings" destination instead), multi-column data tables (§12), hover-triggered share dropdowns, the always-on ember/particle canvas and cursor-glow effects, and the desktop hero's two-column `.hero-website-grid` layout (needs to become a single scrolling column on mobile).

---

## 6. Existing UX Analysis (by module)

For each module: what does the source actually show/prioritize today, and what does that imply for mobile.

**Home/Landing:** Today prioritizes, top to bottom: hero tagline → CTA buttons (join/login/search) → 4 decorative stats → a hero-switcher widget → "today in history" → a large encyclopedia-style scroll of empire history content → services teaser → (index.html only) a 70-link sitemap. For a returning/authenticated user this is entirely wrong-first content — it's a first-time-visitor marketing page, not a home dashboard. The actual "returning user" experience today is `cm-dashboard.html`, which is the right basis for a mobile Home (see §9).

**Dashboard:** Prioritizes identity (ID card with member ID/tier/QR) → KPI strip (network size, referrals, generated business) → quick actions (give referral, book 1-to-1, find business, post job, book service, attend event) → chapter/mandal summary → a 12-item icon quick-grid → recent activity (3 hardcoded items) → membership tier → logout. This is a business-networking-first dashboard (referrals/mandal/1-to-1 dominate the top), which only makes sense for the "business owner" persona — a general member's dashboard should likely lead with community/content, not referral KPIs (see §9, "Needs product decision").

**Community (feed/groups/directory/messages):** Goal = stay connected with other members. Feed and group-post composers are simple single-textarea forms; likes/comments are per-post toggle+count, no threading. Messages is a classic two-pane inbox+thread (the one page in the whole site with an explicit mobile breakpoint, collapsing to a single pane <760px) — the correct mobile pattern is exactly what the source already does: list screen → tap → full-screen thread, back to list.

**Business Directory/Profile:** Goal = find and trust a business fast. The business-profile page (fully CMDB-rendered) is the richest single page in the codebase by CSS volume — hero, rating, hours-with-open/closed-badge, tag chips, review cards, photo gallery, share dropdown, related businesses. Primary action should be "contact" (call/WhatsApp — a working `wa.me` deep link already exists) with review/save as secondary, not buried equally among many actions.

**Business Networking (Sangam + Referrals):** Goal = a BNI-style structured referral economy — give/receive referrals, track a pipeline (5 stages: New→Contacted→Qualified→Proposal→Won/Lost), schedule 1-to-1s, belong to a local chapter with limited seats-per-profession. This is a genuinely deep B2B feature set, more CRM than social app. Its current mobile-worthiness is low (`prompt()`/`alert()`-based status updates, no responsive markup at all) — needs the most rework of any module if kept in scope (see §19).

**Events/Donations:** Goal = discover and register/donate quickly. Events registration culminates in a QR e-ticket (currently via a live third-party HTTP image service — replace with local generation, see §11). Donations shows a transparency stat-strip (total collected/disbursed/completed) as trust-building context before the campaign list — worth preserving that trust framing on mobile.

**Jobs/Services:** Goal = book or apply quickly. Services is the more developed of the two (animated stat hero, 9-category filter, verified-provider badges, rating, price tag) — Jobs is comparatively thin (5 static hardcoded listings, non-functional apply buttons in source). Both share one booking-modal pattern (name/phone/city/date/time) worth unifying into one Flutter booking flow.

**Culture/Heritage:** Goal = read/reference, occasionally explore (forts-map, heritage-map, historical-dates). This is scroll-and-read content, not an app in the interactive sense — full-screen detail pages with a strong hero image and scannable section headers are the right pattern, not cards/lists.

**Profile:** Goal = manage identity. Profile-edit is a long single-page form (no stepper) covering identity, location, profession, skills, interests, and a repeated "self-identification only, no caste certificate" disclaimer — an important trust/compliance statement to preserve verbatim in the Flutter edit screen.

**Admin/CEO:** Goal = internal operations reporting and record management — 30 admin views and a metrics dashboard, both read/write-table-heavy, both openly accessible today with no auth. Not a mobile-consumer UX pattern at all (see §19).

---

## 7. Mobile Information Architecture

The existing site's true information architecture, once the three-shell fragmentation (§5.9) is resolved into one consistent structure, is:

```
Public (unauthenticated)
├── Home (marketing/landing)
├── Login / Register / Forgot Password        [built — Phase 2]
└── Heritage/Culture content (readable without login — no page in the source gates this content)

Authenticated
├── Home / Dashboard                          [built — Phase 2]
├── Community
│   ├── Feed
│   ├── Groups (list → detail)
│   ├── People directory (members / professionals / leaders / achievers)
│   └── Messages (inbox → thread)
├── Business
│   ├── Directory (list → profile)
│   ├── List your business
│   └── Business Networking (Sangam + Referrals, unified)
│       ├── My Chapter / Chapter detail
│       ├── Referrals (pipeline → detail → create)
│       ├── Opportunities
│       └── 1-to-1 Meetings
├── Discover
│   ├── Events (list → register)
│   ├── Donations (list → campaign detail)
│   ├── Jobs
│   ├── Services (catalog → book)
│   ├── Heritage/Culture (article template + Forts directory + Knowledge explorer + Timeline + Encyclopedia index)
│   └── News
├── Search (global)
└── Profile
    ├── View / Edit
    ├── Membership tiers
    ├── Contact / Safety
    └── Logout
```

**Why not force everything into 5 bottom-nav tabs:** the source genuinely has ~16 functional modules plus a 35-page content library. Collapsing all of it into 5 flat tabs would either overload each tab or hide clearly-distinct functionality (business networking is not "community," heritage content is not "business"). Instead:

- **Primary bottom navigation (5 tabs):** Home, Community, Business, Discover, Profile — chosen because these are the 5 destinations a member would return to *most often* and that map to genuinely distinct mental models (identity/dashboard, social, commerce/networking, browse/consume, self). This matches what's already implemented in Phase 2's shell (`app_shell.dart`), with "Discover" as a rename/expansion of the current "Messages" placeholder tab — **Messages moves under Community** (it's conceptually "talking to other members," same as feed/groups/directory) rather than owning a top-level tab, since message volume in this app (member-to-member only, no business chat) doesn't justify permanent bottom-nav real estate the way it would in a dedicated messaging app. **Needs product decision:** confirm this reprioritization versus keeping Messages as its own tab.
- **Secondary navigation:** within each primary tab, a top app bar + (where the source has one) a horizontal tab/segment row or filter-chip row (Community: Feed/Groups/People segments; Discover: Events/Donations/Jobs/Services/Heritage/News segments) — this directly mirrors the source's own `.tabs[data-tabs]` pattern, just rendered as native `TabBar`/`SegmentedButton` instead of CSS tabs.
- **Business Networking** is nested inside the Business tab (not its own bottom-nav tab) because it's a sub-audience feature (business owners specifically), matching how the source itself gates the "Business Sangam" hub behind Business Directory-adjacent navigation, not the main nav bar.
- **Heritage/Culture content** is nested inside Discover, not its own tab, despite being the largest page count — because it's *reference* content a member dips into occasionally, not a daily-use destination, matching its own site's "अधिक विभाग" (More section) placement in the desktop mega-nav today.
- **Deep-link requirements:** business profile, referral detail, campaign detail, event detail, heritage article, and profile-by-ID all need to be reachable by ID-based deep link (`connectmaratha://business/CM-BIZ-1` style) both for push-notification targeting later and for share-link flows (the source already builds WhatsApp share links pointing at these exact pages).
- **Auth vs. unauthenticated routes:** matches what Phase 2 already built — `/login`, `/register`, `/forgot-password` public; everything else behind the auth redirect. One addition worth flagging: the source's heritage/culture content is **never gated** behind login on any page — worth deciding whether the Flutter app should allow a "browse without account" mode for the content library specifically (**Needs product decision**).

---

## 8. Recommended Navigation

- **Bottom navigation bar** (5 items, Material 3 `NavigationBar`, already scaffolded in Phase 2): Home · Community · Business · Discover · Profile.
- **Within-tab secondary nav:** `TabBar`/`SegmentedButton` for Community (Feed/Groups/People) and Discover (Events/Donations/Jobs/Services/Heritage/News) — replacing the source's CSS `.tabs[data-tabs]` pattern 1:1 in intent.
- **Search:** a persistent search entry point — recommend a search icon in the Home/Discover app bars opening a dedicated full-screen Search destination (matches `cm-search.html`'s role as a global cross-entity search), not a permanent bottom-nav tab (search is a *task*, not a *place* a user returns to sit in).
- **Global/settings navigation:** the source's "More" sitemap (`cm-more.html`, ~38 links) should NOT become a literal 38-item menu in Flutter — its actual links decompose entirely into the primary/secondary nav above plus Profile (Contact, Safety, Membership, Logout). No standalone "More" destination is needed once the IA above is followed — this is a case where the web app's flat link-dump should be replaced, not preserved.
- **Drawer:** not needed given the 5-tab + in-tab-segment structure covers everything; avoid re-introducing the source's hamburger drawer pattern, which existed on the web only because desktop-style top nav has no room for a persistent bottom bar.
- **Module relationships:** Business Directory and Business Networking share the Business tab but are distinct enough to need their own top-level segment/tab-bar entry within it (Directory / My Network) rather than being flattened together.
- **Authenticated vs unauthenticated:** unchanged from Phase 2's `redirect` logic — public routes (`/login`, `/register`, `/forgot-password`) plus (pending the product decision above) a possible public "browse heritage content" allowance.

---

## 9. Home Screen Concept

Basing this on `cm-dashboard.html` (the actual "returning user" experience in the source, not the marketing home — see §6), with explicit content-hierarchy and clear flags where the source doesn't provide enough to decide.

**Recommended hierarchy, most → least important:**
1. **Personalized greeting** — "नमस्कार, {शॉर्ट नाव}! 👋" — real, from session (already implemented Phase 2).
2. **Identity card** — member ID, name, tier badge, QR — real, from session (already implemented Phase 2; QR should become a locally-generated code per §11, not the source's third-party HTTP image).
3. **Primary quick actions** — the 3-6 things a member does most: per the source's own "जलद कृती" bar, referral-giving, business search, service booking, event browsing. **Needs product decision:** the source's quick-action bar is business-owner-centric (referrals/1-to-1/business search dominate); a general-member-first ordering would likely lead with Community/Events/Services instead — confirm which persona the Home screen should default to, or whether it should personalize by role.
4. **KPI strip** (network size, referrals given, business generated) — genuinely useful *only* for business-owner-role users; general members have no equivalent stats in the source. **Needs product decision:** show conditionally by role, replace with community-relevant stats for general members, or omit entirely for v1.
5. **Recent activity** — the source shows exactly 3 hardcoded items (a donation confirmation, a connection accepted, an event registration) with no real feed logic behind it. **Needs product decision:** this needs a real activity-log data source before it can be anything but decorative; mark as a stub for now, do not invent additional "notification" content beyond what the source demonstrates.
6. **Chapter/Mandal summary card** — again business-owner-specific; general members have nothing equivalent. Same product decision as #4.
7. **Quick-grid of destinations** (profile, connections, referrals, 1-to-1, messages, feed, groups, events, donations, saved forts, saved articles, business) — the source's 12-item icon grid is really just secondary navigation dressed as content; in Flutter this should be trimmed to the destinations *not* already reachable via bottom nav/tab-bar (mostly redundant once §7's IA is in place) rather than duplicated wholesale.
8. **Membership tier card** — low priority, links to the (currently non-functional-in-source) pricing page.

**Explicitly not real / not to invent:** the marketing homepage's "350+ forts / 25,420 active members / 2,540 businesses / अटकेपार" stat row is decorative copy, not live data anywhere in the source — do not surface these as if they were real platform metrics on the authenticated Home screen. Any home-screen stat must trace to an actual data source in the eventual backend, or be clearly marked as a stub during UI development.

---

## 10. Module-by-Module Mobile UI Recommendations

*(Only modules with enough source material to make a concrete recommendation are detailed; Admin/CEO are addressed in §19 instead, since the first recommendation for them is a scope decision, not a UI pattern.)*

**Authentication** — *(already implemented, Phase 2)* full-screen forms, stepper for registration, bottom-sheet-style forgot-password flow. No change recommended.

**Home/Dashboard** — *(already implemented, Phase 2, foundation only)* single scrolling column; ID card as a hero element; horizontal-scroll KPI strip; primary CTA = whatever §9's product decision lands on. Empty state: not applicable (dashboard always has a session by the time it's reachable). Loading state: skeleton shimmer on ID card + KPI strip while session/profile loads.

**Community — Feed:** vertical `ListView` of post cards (avatar, name, timestamp, text, like/comment counts), floating "compose" action (FAB or persistent top composer bar), pull-to-refresh. Empty state: matches source's tone ("अद्याप कोणतीही पोस्ट नाही") with an illustration + "Write the first post" CTA. Comments: expand inline (matches source's toggle pattern) rather than a separate screen, given comment volume is expected to be low.

**Community — Groups:** two horizontally-scrollable or tabbed sections (My City / My Interests) of group cards → tap → full-screen Group Detail (posts feed, scoped to that group, same composer pattern as main feed). Search/filter via a top search bar, not the source's CSS-only tabs.

**Community — People Directory (members/professionals/leaders/achievers):** ONE reusable "People Grid" screen/widget parametrized by category (matches the source's near-identical structure across `cm-directory-people`, `cm-professionals`, `cm-leaders`, `cm-achievers`) — search bar + filter chips + card grid (avatar, name, role/specialty, city, primary CTA which varies: connect / book / view profile / nominate). Detail: full-screen Profile view.

**Community — Messages:** exactly the source's own two-pane→single-pane collapse, done natively: conversation list screen → tap → full-screen thread with a message composer pinned to the bottom, standard chat-bubble list, `SafeArea`+keyboard-avoiding padding. This is the one module where the source's mobile behavior needs the *least* reinterpretation.

**Business — Directory:** search bar + category filter chips + card grid (photo/icon, name, category, rating, city) → tap → full-screen Business Profile. Business Profile: hero photo, name+category+rating, a sticky/prominent "Call · WhatsApp · Directions" action row (source already has working `wa.me` deep links — reuse this), then tabbed or sectioned content (About/Hours, Reviews, Gallery) rather than the source's single long scroll, since the source page is genuinely dense. Primary CTA = contact; secondary = save/bookmark (source has a working bookmark toggle) and share (native share sheet, replacing the source's custom dropdown).

**Business Networking (Sangam + Referrals, unified module):** given this is the least mobile-adapted part of the source (zero responsive markup, `prompt()`/`alert()`-driven interactions), recommend the heaviest UI reinterpretation here: Referral pipeline as a horizontally-scrollable Kanban-lite (stage columns) OR a simple filterable list with a status chip (simpler, more mobile-appropriate — recommend this over Kanban for phone width); referral detail as a vertical stepper showing the 5-stage progression with tap-to-advance status buttons (replacing the source's `prompt()`); 1-to-1 meetings as a simple scheduling list+form, not a calendar UI (source doesn't build a calendar either). Chapter/Mandal detail: a profile-style screen (stats, meeting schedule, open-seats list, member roster).

**Events:** card list (date badge, title, venue) with category filter chips → tap → detail + register form → QR ticket confirmation screen (replace source's third-party QR image URL with `qr_flutter`, generated on-device). Empty state and loading state: not present in source, design fresh (skeleton list cards).

**Donations:** category filter chips + campaign card grid (cover image, progress bar, collected/target) → tap → campaign detail (description, transparency numbers, donate CTA) → amount entry (source uses a raw `prompt()` for amount on one page and a proper modal on another — use the modal/bottom-sheet pattern consistently) → receipt confirmation. Preserve the transparency stat-strip pattern (source explicitly frames this as a trust-building disclosure).

**Jobs & Services:** recommend merging into one "Services & Jobs" destination under Discover given their near-identical card+booking-modal pattern in the source and Jobs' comparative thinness (5 static, mostly non-functional listings) — a single filterable list + unified booking bottom sheet (name/phone/city/date/time, matching the source's actual booking-modal fields) serves both.

**Search:** a single search field at the top of a dedicated Search screen, with quick-suggestion chips (matches source) and category-grouped results below (matches source's `result-card` category-tag pattern). **Needs product decision:** the source runs two separate, inconsistent search systems (a hardcoded 20-item static KB and a CMDB-driven "unified search" mount point) — the Flutter version needs one real search implementation, not two, once real data exists.

**Heritage/Culture:** full-screen article template (hero image, title, tag/stat row, sectioned content blocks rendered from structured data, related-articles row at the end) — see §4.2. Forts Directory, Knowledge Explorer, and Timeline get their own bespoke (but still template-consistent) screens as noted in §4.2.

**Profile:** view screen (avatar, name, tier, stats, edit button) → edit screen as a single scrollable form (matches source — no stepper needed here, unlike registration) with the self-identification disclaimer preserved verbatim. Membership as a horizontally-scrollable tier-comparison card set (source's 4-card grid, adapted to horizontal scroll on phone width rather than a cramped 4-column grid).

---

## 11. Asset Migration Analysis

**Local image assets found** (`E:\new project\assets\images\`, 30 files total):

| File | Used on | Bundle into Flutter? |
|---|---|---|
| `logo.png` | Every single page (header + footer) | **Yes — bundle.** The one true brand asset; needed offline, at app-icon/splash/header scale. |
| `real-raigad-panoramic.jpg` | Generic hero banner reused across ~10+ *functional* pages (community, directory, business-directory, events, donation, education, etc.) — not fort-specific despite the filename | **Reconsider.** It's currently doing double duty as a generic "community" hero image, not a fort photo. Recommend replacing this reuse with either a proper generic community hero asset or per-module imagery — don't blindly bundle it into unrelated modules just because the source does. |
| `maratha-hero.jpg`, `maratha-samrajya.jpg` | Home hero(s) | **Yes — bundle**, if kept as the Home hero image. |
| The 25 remaining `real-*.jpg/png` files (forts, rulers, battles, maps, statues — e.g. `real-panhala-fort.jpg`, `real-shivaji-portrait.jpg`, `real-raigad-mahadarwaja.jpg`, etc.) | Heritage/culture article pages, each used by 3-9 specific articles | **Yes — bundle.** These are genuine, specific, content-accurate photography for static reference content that should work offline (§4.2's "heritage content is read-offline-friendly" recommendation from the earlier migration analysis holds). Total local image payload is modest (30 files, a few MB) — safe to bundle for the content-library module. |

**External image sources found** (grep-confirmed, 15 files reference them, 68 total occurrences):
- `wallpapercave.com/wp/wp4518353.jpg` — reused site-wide, always captioned as an "authentic Shivaji Maharaj portrait," but is actually sourced from a generic wallpaper aggregator, not a museum/archive. **Flag explicitly to stakeholders**: this is a licensing/authenticity concern independent of the Flutter rebuild — do not silently re-host or re-use this image; source a properly licensed replacement.
- `upload.wikimedia.org/...` — legitimate Wikimedia Commons sourcing, used on the home page and one Shivaji Maharaj gallery. Fine to keep network-loaded (Commons is stable/CDN-backed) or re-download under its actual Commons license if bundling is preferred.
- `images.unsplash.com/...` — generic stock photography for service-category icons (IT/legal/etc.) and for the `cm-leaders.html`/`cm-achievers.html` people cards (all person photos on those two pages are Unsplash stock, not real member photos). **These must stay network-loaded** (`CachedNetworkImage`, with placeholder/error builders) — they are explicitly placeholder content standing in for future real user-generated photos, not brand assets to bundle.
- `api.qrserver.com` — not an image asset but a live third-party QR-generation HTTP service, called from `cm-connect.js` for event e-tickets. **Do not port this as a network dependency** — replace with the `qr_flutter` package for on-device generation (also avoids leaking ticket data to a third party, per the JS-audit's finding).

**Icons:** the source uses **emoji as its icon system almost everywhere** (nav icons, category icons, quick-action icons, status icons) — real `<img>`/SVG icons are rare (one inline SVG for the Rajmudra seal, one SVG warning-circle for the business-not-found state, one SVG map-placeholder icon). **Recommendation:** replace emoji icons with a real Flutter icon set (Material Symbols as the base, supplemented by 1-2 bespoke SVG icons for culturally-specific marks like the Rajmudra seal) — emoji rendering is inconsistent across Android OEM skins and looks unpolished in a "premium" native app; this is squarely a "desktop shortcut, not brand identity" pattern per §5.10.

**Migration asset list (concrete):** bundle `logo.png` + a curated subset of the 25 heritage `real-*` photos (per-article, not blanket) + the Rajmudra SVG (recreate as a proper vector asset) into Flutter's `assets/` folder; leave all Unsplash/wallpapercave/Wikimedia references as network-loaded placeholders (with the wallpapercave one flagged for replacement); do not bundle `real-raigad-panoramic.jpg`'s generic non-heritage reuse — source or design proper imagery per functional module instead.

---

## 12. Responsive/Mobile Problems in the Existing Website

Confirmed directly from the source (not assumed):

1. **Three inconsistent navigation shells** (§5.9) — must collapse to one consistent shell in Flutter, not be preserved as three different screen "modes."
2. **Multi-column data tables** (`.data-table` — ministers list, empire timeline, top-mandals leaderboard, etc.) with no responsive treatment found anywhere in the CSS for tables specifically. → Flutter replacement: card-per-row lists (label/value stacked) instead of horizontally-scrolling tables, which are a poor touch experience.
3. **Wide multi-column grids with no/incomplete mobile collapse** — several grids only collapse at ≤900px or rely purely on `auto-fit,minmax()` without a true single-column phone treatment (e.g., `.footer-grid`, `.hero-website-grid`'s 1.2fr/0.8fr split). → Flutter: single-column stacking by default on phone widths, not "collapse from 4 to 2."
4. **Hover-triggered interactions with no confirmed tap fallback** — the business-profile share dropdown (`.biz-share-dropdown:hover`) and the desktop mega-nav flyout (`.nav-dropdown:hover`, explicitly disabled below 992px in JS) — → Flutter: explicit tap-to-open (`PopupMenuButton`/bottom sheet for share; the mega-flyout simply doesn't need a mobile equivalent since its content decomposes into the tab structure per §8).
5. **Fixed-width/desktop-oriented layouts:** `.mobile-nav-drawer` is 320px/88vw (fine), but several dashboard/CRM layouts (business-profile stats bar, hero two-column grid, admin sidebar) assume desktop width and only partially adapt.
6. **Small controls:** native `<select>` dropdowns for role/category/interest pickers throughout — on mobile these should become `DropdownButtonFormField`/bottom-sheet pickers with larger tap targets, not literal `<select>` equivalents.
7. **Blocking `alert()`/`confirm()`/`prompt()` dialogs interleaved with toasts** (logout confirmation, referral status "Won" amount entry, RSVP flows) — these block the JS thread on web and have no native-feeling mobile equivalent; every instance needs an explicit Flutter dialog/bottom-sheet/snackbar decision (already reflected in Phase 2's logout confirmation dialog as the right pattern).
8. **Always-on, non-reduced-motion-aware canvas animation** (the ember/particle background, `initEmberCanvas`) — runs indefinitely with no visibility-pause, no `prefers-reduced-motion` check, and per-particle `shadowBlur` (relatively expensive). → Flutter: simplify significantly or drop, and respect `MediaQuery.disableAnimations`.
9. **Two duplicate, overlapping hamburger-drawer JS implementations** in `app.js` — a sign of unmaintained tech debt, not something to replicate; Flutter needs exactly one nav implementation (already the case in Phase 2's `AppShell`).
10. **No loading-state system anywhere** — because everything is synchronous localStorage, the source never had to design for network latency. A real backend will introduce it; Flutter needs skeleton/shimmer states designed fresh for every list/detail screen (see §10 per-module notes).
11. **Auth is not actually gated** — `cm-dashboard.html` auto-seeds a demo session if none exists; there is no redirect-to-login guard anywhere in the source JS. Already correctly *not* replicated in Phase 2 (real `redirect` logic in `go_router`).
12. **Toast system only truly has 2 states** despite 3 semantic intents (success/info/error) being used in call sites — Flutter needs true 3+-state snackbar semantics, not a port of the source's collapsed 2-state system.

---

## 13. Flutter Design System Proposal

*(Proposal only — not implemented in this task, per instructions.)*

**AppColors** — a small, deduplicated palette derived from but fixing §5.1's issues:
- `maroon900` `#8A2500`-ish (deepened from the source's `#C73800`/`#D84315` cluster, kept as the "ink"/heading-on-light color)
- `orange600` `#E65100`, `orange500` `#F4511E` (the two genuinely distinct oranges the source actually uses for primary actions/accents)
- `gold` `#E9C46A` (the real accent color already used 30+ times via undeclared `rgba(233,196,106,…)` — finally given a name)
- `cream`/`paper` `#FFF8F2`-ish and pure white as the two real surface tones (replacing the source's collapsed `--paper/-2/-3`)
- `line` `#FFCC80` (kept, it's a real distinct value in the source)
- Separate, genuinely distinct `success` (green), `warning` (amber), `error` (red) — fixing the source's collapsed success=danger=ink bug.

**AppTypography** — `google_fonts` package: `Baloo2` for display/headline weights, `TiroDevanagariMarathi` for Marathi body/headline text specifically (matches the source's own font-priority order for Devanagari), `Inter` for UI chrome/Latin body text. A real Material 3 type scale (display/headline/title/body/label × large/medium/small) replacing the source's ad hoc sizing.

**AppSpacing** — an explicit 4px-based scale (4/8/12/16/20/24/32/40/48) formalizing the rhythm already implicit in the source's ad hoc values.

**AppRadius** — `sm` 8, `md` 12, `lg` 20, `pill` 999 — one canonical scale (fixing §5.4's inconsistency), applied via `CardTheme`/`ButtonTheme`/`InputDecorationTheme` centrally, not per-widget.

**AppElevation** — 3 levels (resting/raised/floating) mapped to Material elevation + one standardized shadow tint (fixing §5.5's inconsistent shadow-tint issue).

**AppIcons** — Material Symbols as the base icon set, replacing the source's emoji-as-icon pattern (§11) everywhere except deliberately-kept cultural motifs (🚩 as a rare, intentional brand accent might be acceptable in specific spots — a product/design call, not a blanket rule).

**Reusable components** (§14 gives detail): `AppButton`, `AppTextField`, `AppCard`, `AppAvatar`, `AppChip`, `AppHeader`, `AppSectionHeader`, `AppBottomNavigation` (already exists as `AppShell`'s `NavigationBar` from Phase 2 — formalize into a named, reusable widget), `AppSearchBar`, `AppListItem`, `AppEmptyState`, `AppLoadingState`, `AppErrorState`, `AppDialog`, `AppBottomSheet`.

---

## 14. Reusable Component Proposal

| Component | Purpose | Visual style | Where used |
|---|---|---|---|
| **AppButton** | One button widget with `primary`/`secondary`/`outline`/`text` variants and a `disabled` state (filling the gap noted in §5.6 — the source has none) | Filled gradient-free solid orange (primary), outlined maroon (secondary/outline), text-only (tertiary); 12px radius, 48dp min height | Everywhere — forms, cards, CTAs |
| **AppTextField** | Standard form field with label, hint, error text, focus ring (one consistent style, fixing §5.6's 3-inconsistent-styles issue) | 8px radius, 1px line border, single focus-ring treatment | All forms (login, register, profile-edit, referral, listing, contact) |
| **AppCard** | The single underlying card idiom behind the source's ~15 differently-named card classes (§5.6) | 12-20px radius, 1px line border, `AppElevation.resting`, optional hero image slot, optional badge slot | Feed posts, business cards, event cards, heritage article previews, people-grid cards |
| **AppAvatar** | Circular member/business photo with graceful fallback (initials) | Circular, tier-badge overlay slot (for member tier), size variants sm/md/lg | ID card, people grids, feed posts, profile |
| **AppChip** | One canonical pill/filter-chip shape (fixing §5.6/§5.12's radius inconsistency), selectable and static variants | 999px pill, selected = filled gold/orange, unselected = outlined | Category filters (Community/Discover tabs), status pills (referral pipeline, booking status), tags |
| **AppHeader** | The one consistent top app bar for the whole authenticated app (fixing §5.9's three-shell problem) | Solid maroon/orange, title + optional back/search/action icons | Every screen |
| **AppSectionHeader** | Eyebrow + title + optional "see all" link, matching the source's `.section-head` pattern | Small caps eyebrow, bold title, right-aligned link | Home sections, Discover sections, module landing screens |
| **AppBottomNavigation** | The 5-tab bottom nav (formalized from Phase 2's inline `NavigationBar`) | Material 3 `NavigationBar`, gold indicator | App shell |
| **AppSearchBar** | Consistent search input with clear button | Rounded, embedded search icon, matches source's `.search-row` intent | Community/People, Business Directory, Discover, global Search |
| **AppListItem** | The list-row idiom (source's `.list-row`: thumb/icon + title + meta + trailing action) | Leading icon/avatar slot, title/subtitle, trailing chevron or action | Jobs list, News list, notifications, settings |
| **AppEmptyState** | Icon + heading + subtext + optional CTA — formalizing the source's ad hoc empty-state pattern into one reusable widget instead of one-off text | Centered, illustration/icon, consistent copy tone | Every list/grid screen |
| **AppLoadingState** | Skeleton/shimmer placeholders — genuinely new, since the source has none (§12.10) | Shimmering gray blocks matching the target content's shape | Every screen with async data once a backend exists |
| **AppErrorState** | "Something went wrong" + retry — genuinely new, since the source has none | Icon + message + retry button | Every screen with async data |
| **AppDialog** | Centered confirm/alert dialog (replacing raw `alert()`/`confirm()`) | Rounded, 2-button footer | Logout confirm, delete/cancel confirmations |
| **AppBottomSheet** | Mobile-native replacement for the source's centered modal (§5.6) for anything form-like or action-list-like | Rounded top corners, drag handle | Booking forms, donation-amount entry, share sheet, filter pickers |

---

## 15. Animation/Motion Principles

- **Purposeful, not decorative-by-default.** The source's always-on ember/particle canvas and cursor-glow (§12.8) are exactly the kind of "generic template flair" the brief warns against — drop the particle canvas, drop cursor-glow entirely (it's explicitly desktop-hover-only in the source anyway, so it has literally no mobile equivalent to port).
- **Count-up stat animation:** worth keeping conceptually (a genuinely nice, cheap effect — `IntersectionObserver`-triggered, 1200ms cubic-ease in the source) — implement as a lightweight `AnimatedBuilder`/`TweenAnimationBuilder` counter, triggered once when scrolled into view, not on every rebuild.
- **Card entrance:** the source's generic `[data-reveal]` fade/slide-in-on-scroll is a reasonable, subtle pattern — a light staggered fade+slide for list/grid items on first load is appropriate; do not apply it to every rebuild/scroll (the source itself only reveals once, with a 2.5s failsafe timeout — good defensive pattern to keep conceptually).
- **Press states, not hover states.** Every `:hover` lift/shadow-grow effect becomes a tap-down scale/ripple (`InkWell` default splash, or a subtle `AnimatedScale` to ~0.97 on press) — never attempt to simulate hover on a touch device.
- **Page transitions:** use Flutter/Material's platform-default transitions (slide-in on Android) rather than inventing custom ones — the source has no page-transition choreography to match since it's server-rendered-page navigation.
- **Respect reduced motion.** The source does have one correct precedent (`prefers-reduced-motion` disables `[data-reveal]` and ken-burns effects) — Flutter should check `MediaQuery.of(context).disableAnimations` / `AccessibilityFeatures` equivalently and disable non-essential motion.
- **Loading states get motion, not spinners-only** — skeleton shimmer (§14 `AppLoadingState`) is a more "premium" feel than a bare `CircularProgressIndicator` for content-shaped placeholders; reserve spinners for short, indeterminate actions (button-in-flight states, already the pattern used in Phase 2's login/register).

---

## 16. Accessibility Considerations

- **Touch targets:** the source has no minimum-target-size discipline (`.btn-sm` padding is 6×14px, well under Android's 48dp guidance) — Flutter buttons/chips/icon-buttons must enforce a 48dp minimum regardless of visual size.
- **Color contrast:** fix the `.btn-primary` text-on-background contrast bug identified in §5.1 (dark-orange text on an orange gradient) — use white/near-white text on all filled-orange buttons in Flutter.
- **Semantic color meaning:** since source `success`/`danger` collapsed to the same color (§5.1), status pills/badges currently carry *no* actual color-coded meaning — Flutter must give success/warning/error genuinely distinct, accessible-contrast colors so status is legible without reading text.
- **Text legibility for Devanagari:** ensure the chosen Marathi font (`Tiro Devanagari Marathi`) renders at a minimum comfortable size (the source drops to 14px body text at ≤420px — likely too small for Devanagari script's higher stroke density; consider a slightly higher minimum, e.g. 15-16px body, for Flutter).
- **Icon-only buttons need labels:** the source's emoji-icon quick-actions/nav items have no `aria-label` equivalents in several places — every Flutter `IconButton`/icon-only tap target needs a `Semantics`/`tooltip` label (Marathi + English where helpful).
- **Reduced motion:** covered in §15 — treat as an accessibility requirement, not just a nicety.
- **Safe areas:** the source has zero notion of device safe-areas (it's a website) — every Flutter screen needs proper `SafeArea` handling, already correctly done in Phase 2's screens.
- **Forms need real validation feedback:** the source has no input error-state styling at all (§5.6) — every Flutter form field needs a clear, non-color-only (icon + text) error indication for screen-reader and colorblind users.

---

## 17. Backend-Ready UI/Data Architecture Recommendations

This mirrors and extends the architecture already established in Phase 1/2 (`AuthRepository`/`LocalAuthRepository`/`AuthLocalDataSource` pattern) to every future module:

```
Flutter UI (screens/widgets)
      ↓
Controller / state (ChangeNotifier or, once modules multiply, Riverpod — re-evaluate per Phase 2's own note once several features need shared async state)
      ↓
Repository (abstract interface per module: CommunityRepository, BusinessRepository, EventsRepository, DonationsRepository, HeritageRepository, ReferralRepository, ...)
      ↓
Data source — LOCAL NOW (a per-module LocalDataSource seeded with demo data mirroring CMDB's actual shapes from §2, e.g. bundled JSON/Dart data for heritage content, in-memory/SharedPreferences-backed demo lists for community/business content)
      ↓
Data source — REMOTE LATER (a matching RemoteDataSource hitting a real API, swapped in behind the same repository interface with zero UI/controller changes)
```

Concrete recommendations:
- **One repository interface per module**, matching the module map in §3 (`CommunityRepository`, `BusinessRepository`, `ReferralRepository`, `EventsRepository`, `DonationsRepository`, `HeritageRepository`, etc.) — never let a screen reach into a data source directly, mirroring the discipline already established for auth.
- **Model the demo/local data after `CMDB`'s actual field shapes** (§2's condensed schema) — this gives a realistic first-draft schema for the eventual backend, exactly as the original `FLUTTER_MIGRATION_ANALYSIS.md` recommended, now cross-checked against the live JS audit rather than assumed.
- **Heritage content is a special case:** it's static reference content, not user-generated/transactional data — model it as bundled structured data (JSON/Dart assets) from day one, not a "local data source pretending to be an API," since it will likely stay bundled-with-occasional-CMS-update rather than becoming a live API resource the same way community/business data will.
- **State management:** Phase 2 deliberately deferred adding Riverpod, using a hand-rolled `ChangeNotifier` + `InheritedNotifier`. Recommend revisiting this once ~2-3 more modules (Community, Business, Discover) are underway and genuinely need shared, cross-screen async state — at that point Riverpod (or a similarly lightweight equivalent) earns its place; don't add it speculatively now.
- **Do not port CMDB's monolithic-single-object pattern** — the source's biggest architectural weakness is that every feature reaches directly into one giant shared `CMDB` object with ~90 functions; Flutter's per-module repository separation is a deliberate improvement, not a 1:1 port.

---

## 18. Recommended Implementation Phases

*(Sequencing recommendation only — no implementation in this task.)*

- **Phase 1 — done:** project foundation, theme, routing skeleton.
- **Phase 2 — done:** authentication (login/register/forgot-password/local session), main app shell with bottom nav placeholders.
- **Phase 3 (recommended next):** flesh out Home/Dashboard per §9's resolved product decisions, and build the Profile module (view/edit/membership/contact/safety) — both are self-contained, don't depend on other modules, and directly extend what Phase 2 already started.
- **Phase 4:** Community module (Feed, Groups, People directory, Messages) — the largest genuinely social feature set; establishes the `AppCard`/`AppListItem`/`AppEmptyState` component library (§14) that later phases reuse.
- **Phase 5:** Business Directory + Business Profile — reuses Phase 4's list/detail/card patterns; introduces the contact-action pattern (call/WhatsApp) and review/rating UI.
- **Phase 6:** Business Networking (Sangam + Referrals, unified per §7) — the most mobile-UX-reinterpretation-heavy module (§10); sequenced after Directory since it depends on the same business-entity model.
- **Phase 7:** Discover — Events, Donations, Jobs/Services (merged per §10), News — a cluster of similar list→detail→action patterns, efficient to batch together.
- **Phase 8:** Heritage/Culture content library — the generic article template (§4.2) plus the 4 bespoke screens (Forts Directory, Knowledge Explorer, Timeline, Encyclopedia Index); large in page count but structurally simple once the template exists.
- **Phase 9:** Global Search — deferred until enough modules exist to search across meaningfully.
- **Admin/CEO tooling:** recommend explicitly excluding from the phased consumer-app roadmap — see §19's scope question.

Each phase should, per Phase 1/2's own established convention, end with `dart format` + `flutter analyze` clean, a real device build/run, and only then proceed.

---

## 19. Open Questions / Product Decisions

Collected from throughout this document, for explicit confirmation before implementation:

1. **Home screen persona:** should Home/Dashboard default to the source's business-owner-centric content (referrals/mandal/KPIs), a general-member-centric layout instead, or personalize by role? (§9)
2. **"Recent activity" feed:** the source has no real activity-log logic behind its 3 hardcoded items — build a real one, or ship a stub/omit for v1? (§9)
3. **Should Messages be its own bottom-nav tab or live under Community?** (§7) — recommended: under Community, but confirm.
4. **Should heritage/culture content be browsable without an account?** The source never gates it; confirm whether the Flutter app should allow this too. (§7)
5. **Admin console and CEO dashboard — in scope for the mobile app at all?** Both are internal back-office tools, currently unauthenticated in the source, structurally and visually inconsistent with the rest of the app (§5.9). Recommend treating these as a **separate internal tool** (possibly a Flutter web/desktop build, or simply out of scope) rather than mobile screens — confirm.
6. **wallpapercave.com "Shivaji Maharaj portrait"** — a licensing/authenticity concern independent of Flutter; needs a properly sourced replacement regardless of platform. (§11)
7. **Business Networking (Sangam/Referrals) scope** — this is a deep, CRM-like B2B feature set; confirm it's meant for the general consumer mobile app v1, or could be deferred/simplified given its current near-zero mobile adaptation in the source. (§6, §10)
8. **Payment/membership tiers** — `cm-membership.html`'s tier buttons are non-functional in the source (no payment gateway anywhere in the codebase, matching the earlier migration analysis's finding); confirm whether real payment integration is in scope for whichever phase implements Profile/Membership.
9. **Donation payment** — same as above; the source's donation flow generates a fake receipt with no real payment gateway call anywhere.
10. **Notifications** — the source has zero push/in-app notification system; if wanted, this is new product scope, not a port.
11. **Search architecture** — the source runs two inconsistent search systems (static hardcoded KB vs. a CMDB-driven mount point); needs one real decision once real data exists. (§10)
12. **Offline strategy** — confirmed only the heritage content is meaningfully "offline-friendly" content; confirm whether community/business/messaging screens need any offline read-cache behavior beyond what a chosen backend/BaaS provides natively.

---

## 20. Final UI/UX Principles for the Flutter Project

1. **This is a native mobile product inspired by the web app's identity and functionality — not a mobile-shaped copy of it.** Every screen should be designed for how a phone is actually held and used, not for how the equivalent desktop page was laid out.
2. **Fix, don't port, the source's design-token inconsistencies** — the collapsed color palette (§5.1), the missing button/error states (§5.6), the inconsistent radius/shadow usage (§5.4/§5.5) are defects in the source, not brand identity to preserve.
3. **One consistent navigation shell for the whole app**, resolving the source's three-shell fragmentation (§5.9) — a user should never feel like they left the app when moving between Community, Business, and Business Networking.
4. **Spacious, single-column-first layouts.** Replace every multi-column desktop grid/table with a stacked, scannable mobile layout (§12).
5. **Tap, not hover.** Every interaction the source expresses via `:hover` needs a deliberate tap/press equivalent, not an omission (§12.4, §15).
6. **Real, distinct semantic color** for success/warning/error — never let two different meanings share one hex value again (§5.1, §16).
7. **Design loading, empty, and error states for every async screen from scratch** — the source has almost none of these to copy, because it never needed them (§12.10, §14).
8. **Subtle, purposeful motion only** — count-up stats and gentle entrance reveals are worth keeping in spirit; always-on particle/cursor effects are not (§15).
9. **Preserve genuine cultural/brand identity deliberately** — the Rajmudra motif, the warm maroon/saffron/gold family (cleaned up), the Baloo 2 + Tiro Devanagari Marathi + Inter type pairing, the self-identification/no-caste-certificate trust language — these are real product identity, not decoration, and should survive the redesign intact.
10. **Never invent functionality, statistics, or content the source doesn't actually have** — where the source is silent or merely decorative (home-page stat counters, CEO dashboard hardcoded tiles, recent-activity feed), this document marks it "Needs product decision" rather than quietly filling the gap, and the Flutter implementation should do the same.

---

## Verification: nothing else was modified

This analysis was produced entirely through read-only inspection (`Read`, `Grep`, `Bash` file listing, and read-only research agents) of `E:\new project`. No `Write`/`Edit` tool call targeted any path under `E:\new project` at any point. No file under `E:\community_mobile\app\lib` was created, modified, or deleted. The only files produced across this analysis work are this document and its earlier companion, `E:\community_mobile\app\FLUTTER_UI_UX_ANALYSIS.md` (both contain the same completed 20-section analysis; this file is the copy at the path requested for this deliverable).
