# SEO Content Audit — Detailed Task List

> Companion to `SEO_AUDIT_REPORT.md`. That report tracks technical / metadata SEO.
> This document tracks **on-page content** issues found in the May 2026 audit, with one actionable task per problem.
>
> **Audit date:** 2026-05-13
> **Scope:** All public marketing routes — `/`, `/company`, `/contact`, `/cleaning-technology`, `/solar-panel-cleaning-robot-price-calculator`, `/sitemap`, legal pages, `/solar-panel-cleaning-system/*`, `/projects/*`, `/blog/*`, `/authors`.
>
> **How to use:** Tasks are grouped by priority. Each task has a unique ID (`SEO-XXX`), exact file paths, what's wrong, what to do, and an acceptance check. Tackle in order — P0 → P1 → P2.

---

## Priority legend

- **P0** — Broken, duplicate, or actively damaging. Mechanical fixes, no content debate. Ship first.
- **P1** — Material ranking / E-E-A-T gaps. Requires copywriting or editorial decisions.
- **P2** — Polish, schema, internal-link plumbing. High ROI but lower urgency than P0/P1.

Status options for each task: `[ ] todo` · `[~] in progress` · `[x] done` · `[-] skipped`.

---

## P0 — Broken / damaging (fix first)

### `SEO-001` — Fix broken `/projects/yadgir-solar-project` link in `additionalProjects`

- **Status:** `[x]` Yadgir `href` → `yadgir-solar-project-50-mw`; same fix in `projects` array; Soyegaon spelling → Maharashtra.
- **Where:** `src/app/data.ts` — `additionalProjects` array (used by `/projects/automatic`, `/projects/semi-automatic`, `/projects/capex`).
- **Problem:** One card's `href` is `/projects/yadgir-solar-project`. The actual route is `/projects/yadgir-solar-project-50-mw`. This causes a 404 on three category pages.
- **Fix:** Update the entry's `href` to `/projects/yadgir-solar-project-50-mw`. While in `data.ts`, also fix the typo `Maharastra` → `Maharashtra` in the Soyegaon card title.
- **Acceptance:** Click the Yadgir card on `/projects/automatic`, `/projects/semi-automatic`, and `/projects/capex` — all 200.

### `SEO-002` — Remove duplicate `<h1>` on `/company`

- **Status:** `[x]` Demoted "Who we are" eyebrow to `<p>`.
- **Where:** `src/app/company/page.tsx`.
- **Problem:** Two `<h1>` elements rendered — *"Who we are"* (eyebrow) and *"Engineers of a sustainable future"* (real title).
- **Fix:** Demote the eyebrow to `<p>` or `<span>` with the same styling. Keep the main headline as the only `<h1>`.
- **Acceptance:** Page has exactly one `<h1>`.

### `SEO-003` — Fix duplicate H1+H2 on legal pages

- **Status:** `[x]` Renamed the duplicate `<h2>` to "Overview" on all three pages.
- **Where:**
  - `src/app/privacy-policy/page.tsx`
  - `src/app/cookie-policy/page.tsx`
  - `src/app/terms-of-service/page.tsx`
- **Problem:** Each page renders `<h1>Privacy Policy</h1>` immediately followed by `<h2>Privacy Policy</h2>` (same string on all three).
- **Fix:** Replace each duplicate `<h2>` with either nothing or a meaningful section heading like *"Overview"* or *"What this policy covers"*.
- **Acceptance:** No legal page has matching H1 + first H2 strings.

### `SEO-004` — Unify "Last Updated" semantics on legal pages

- **Status:** `[x]` Replaced `new Date()` with static `LAST_UPDATED` constants. Privacy keeps "Effective Date" + new "Last Updated"; Cookie & Terms use "Last Updated".
- **Where:** Same three files as `SEO-003`.
- **Problem:** Privacy shows hard-coded `01-07-2020`. Cookie and Terms render `new Date()` which always says "today" — that's misleading to users and crawlers.
- **Fix:** Add a `const LAST_UPDATED = "YYYY-MM-DD"` constant near the top of each file and render that as the "Last Updated" string. Use the real date of the most recent policy revision. Commit revisions whenever the policy changes.
- **Acceptance:** Each legal page shows a static, accurate revision date matching the actual policy state.

### `SEO-005` — Fix inverted heading hierarchy on category project pages

- **Status:** `[x]` Card titles `<h3>`; dates `<p>`; distinct outline per page.
- **Where:**
  - `src/app/projects/automatic/page.tsx`
  - `src/app/projects/semi-automatic/page.tsx`
  - `src/app/projects/capex/page.tsx`
- **Problem:** Each card uses `<h4>` for the project title and `<h2>` for the (hover-only) date. Outline order is broken and `<h2>` is wasted on trivial content.
- **Fix:** Card title → `<h3>` (under the page's single `<h1>`). Date → `<p>` or `<span>`, no heading.
- **Acceptance:** Outline reads H1 → H3 per card; no `<h2>` on hover-revealed dates.

### `SEO-006` — Resolve duplicate "How it works" H2 on Model-A

- **Status:** `[x]` Renamed the second H2 to "Inside a Model-A cleaning cycle — step by step".
- **Where:** `src/app/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system/page.tsx`.
- **Problem:** *"How Does an Automatic Solar Panel Cleaning Robot Work?"* appears as `<h2>` twice (top of page and just before the FAQ).
- **Fix:** Keep the top section as the canonical answer. Rename the lower one to a distinct intent — e.g. *"What happens during a single Model-A cleaning cycle?"* — or delete it if the content is redundant.
- **Acceptance:** Each `<h2>` string appears at most once on the page.

### `SEO-007` — Align hero video and `VideoObjectSchema` on `/`

- **Status:** `[x]` Pointed schema at the hero video ID (`y9iRhH2bLwY`) and matching thumbnail.
- **Where:**
  - `src/app/home/page.tsx` (`VideoObjectSchema` props)
  - `src/app/home/HomePageInteractive.tsx` (hero `<iframe>` URL)
- **Problem:** Hero iframe and `VideoObjectSchema` reference **different YouTube IDs**. The video rich result points to a video that isn't visible above the fold.
- **Fix:** Decide which is the canonical product video, then make both use the same YouTube ID (and the same thumbnail / `uploadDate`).
- **Acceptance:** Visiting `/` and viewing source shows the same video ID in the iframe `src` and in the JSON-LD `contentUrl` / `embedUrl`.

---

## P1 — High-value content gaps

### `SEO-010` — Rewrite Banda case study with quantified results + product link

- **Status:** `[x]` CMS body includes GLYDE/NYUMA deployment, 160 robots, water saved, GWh recovered, and product/CAPEX internal links.
- **Where:** `src/app/projects/banda-solar-project/page.tsx` (`BlogContent` HTML string).
- **Problem:** Reads like a template. No specific yield/PR/kWh numbers. Metadata mentions **160 robots** but body never says so. No link to Model-A / Model-B / OPEX.
- **Fix:** Rewrite into a real case study with these sections:
  1. **The site** — location, MW, panel type, plot layout, soiling conditions.
  2. **The problem** — water cost / availability, manual labour issues, soiling losses pre-Taypro.
  3. **The Taypro solution** — exact model deployed (e.g. Model-A), robot count (160), commercial mode (CAPEX / OPEX), Console use.
  4. **Results** — before/after PR or yield uplift %, kWh recovered, water saved (litres/yr), payback months. Use real, defensible numbers; mark as "estimated" if not measured.
  5. **What's next** — expansion plans, Console reporting cadence.
- **Add internal links** in body to: `/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system` (or whichever model), `/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`, `/solar-panel-cleaning-robot-price-calculator`.
- **Also fix:** The overview image `alt` is currently `prefix + first 50 chars of overview + "..."`. Replace with a real descriptive alt.
- **Acceptance:** Page has ≥ 700 words, ≥ 3 internal links to product pages, at least one quantified metric in the body.

### `SEO-011` — Rewrite Soyegaon case study with quantified results + product link

- **Status:** `[x]` CMS content enriched (same structure as Banda); verify live metrics on deploy.
- **Where:** `src/app/projects/soyegaon-solar-project/page.tsx`.
- **Problem:** ~600-750 words but most are boilerplate ("Maharashtra's network", "advanced technology"). Same template gaps as Banda.
- **Fix:** Apply the same five-section structure from `SEO-010`. Identify the actual Taypro model deployed, robot count, and any measured improvements. Fix the truncated overview image alt.
- **Acceptance:** Same as `SEO-010`.

### `SEO-012` — Rewrite Yadgir 50 MW case study with quantified results + product link

- **Status:** `[x]` CMS content enriched with quantified field metrics and product links.
- **Where:** `src/app/projects/yadgir-solar-project-50-mw/page.tsx`.
- **Problem:** Same template gaps. *"Performance & Efficiency"* section asserts performance with zero numbers.
- **Fix:** Same five-section structure. Fix the truncated overview image alt.
- **Acceptance:** Same as `SEO-010`.

### `SEO-013` — Rewrite Agar 250 MW case study with quantified results + product link

- **Status:** `[x]` CMS content enriched (200 MW / 272 robots narrative, product links).
- **Where:** `src/app/projects/agar-solar-project/page.tsx`.
- **Problem:** Highest-capacity story on the site but currently reads as buzzwords (AI-powered, energy storage integration) without specifics. Fix this one first if you want the most credible flagship case study.
- **Fix:** Same five-section structure. Fix the truncated overview image alt.
- **Acceptance:** Same as `SEO-010`.

### `SEO-014` — Expand `/projects/automatic` from 80-word grid to a real category page

- **Status:** `[ ]`
- **Where:** `src/app/projects/automatic/page.tsx`.
- **Problem:** ~80 words of body copy. One sentence + a 4-card grid. No internal link to Model-A. Targets the keyword "automatic solar panel cleaning robot projects" without supporting content.
- **Fix:**
  1. Add 350-500 words of intro that explains: what *automatic* deployments mean, who buys them, typical plant size, the commercial story.
  2. Add a clear contextual link to `/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system` (Model-A) in the first paragraph.
  3. Add a short closing section *"Want Model-A on your plant?"* with a link to the lead form / calculator.
  4. Render the breadcrumb trail as Home → **Projects** → Automatic (currently the middle "Projects" crumb is missing — see `SEO-040`).
- **Acceptance:** Page has ≥ 400 words and ≥ 2 internal links to the Model-A page or calculator.

### `SEO-015` — Expand `/projects/semi-automatic` from 80-word grid

- **Status:** `[ ]`
- **Where:** `src/app/projects/semi-automatic/page.tsx`.
- **Problem:** Same gap as `SEO-014`. No link to Model-B (`/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system`).
- **Fix:** Mirror `SEO-014` structure, but for semi-automatic / pick-and-place plants. Link to Model-B.
- **Acceptance:** Same as `SEO-014`.

### `SEO-016` — Expand `/projects/capex` from 80-word grid and explain CAPEX vs OPEX

- **Status:** `[ ]`
- **Where:** `src/app/projects/capex/page.tsx`.
- **Problem:** Same gap. Plus there's no body content explaining what CAPEX means versus the OPEX service. Buyers comparing models need this on the page they land on.
- **Fix:** Add intro explaining CAPEX deployments and when they make sense; add a clear contrast paragraph linking to `/solar-panel-cleaning-system/solar-panel-cleaning-service` (OPEX).
- **Acceptance:** Page has ≥ 400 words, explains CAPEX vs OPEX, links to OPEX route.

### `SEO-017` — Expand Console page with safe, indexable capability copy

- **Status:** `[x]` Added two new H2 sections ("How Taypro Console fits into your solar O&M workflow", "Schedules, rest zones, and cleaning windows — explained"). Added internal links to hub, OPEX, and ROI calculator.
- **Where:** `src/app/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app/page.tsx`.
- **Problem:** ~900-1,300 words (shortest in the product family). Only **3** internal links (Model-A/B/T) — no OPEX, no hub, no calculator, no projects. Targets *"solar robot fleet monitoring"* / *"solar SCADA"* style queries but doesn't have enough indexable copy.
- **Fix:** Add new H2 sections that you're comfortable being public:
  - *"Block-level vs robot-level view"*
  - *"Schedules and rest zones"*
  - *"Alerts and reports"*
  - *"Role-based access"*
  - *"Integration with O&M workflows"*
  
  Each section 100-200 words. Add contextual links to OPEX, hub, calculator, and 1-2 case studies. Avoid publishing screenshots / details that are user-guide level.
- **Acceptance:** Page has ≥ 1,800 words and ≥ 6 internal links spread across at least 4 distinct routes.

### `SEO-018` — Split OPEX FAQ bank to remove unverifiable / off-topic claims

- **Status:** `[x]` Removed `cleaningServiceFaqs` from OPEX page (both visual accordion and `FAQPageSchema`); deleted the unused export from `data.ts`. Only procurement-relevant `opexServiceFaqs` remain.
- **Where:**
  - `src/app/solar-panel-cleaning-system/solar-panel-cleaning-service/page.tsx`
  - `src/app/data.ts` (`cleaningServiceFaqs`)
- **Problem:** OPEX page concatenates `opexServiceFaqs` + `cleaningServiceFaqs` (8 + 7 = 15 entries) into one `FAQPage` JSON-LD. The second bank contains **NTPC 10-year study**, **DISCOM penalty ₹ amounts**, specific yield % claims, and award anecdotes. Two risks: (a) YMYL / legally-defensible claims published as structured data, (b) topical drift dilutes intent.
- **Fix:**
  1. Audit each item in `cleaningServiceFaqs` for substantiation. Anything not defensible → remove or rewrite as a general statement.
  2. Keep `FAQPageSchema` to procurement-relevant questions only (cost, cadence, contract length, what's measured, what's reported).
  3. Move corporate-marketing content (awards, certifications, NTPC story) to a narrative section on the page or to `/company`. It should not be in FAQ JSON-LD.
- **Acceptance:** `FAQPageSchema` on OPEX page contains only procurement / service questions. No raw numeric claims about third-party studies in the JSON-LD.

### `SEO-019` — De-cannibalise the solar product silo (one primary keyword per URL)

- **Status:** `[x]` Rewrote `title` / `description` / `keywords` on all six layouts, leading each with a distinct primary intent. Also stripped trailing `| Taypro` (root template was doubling it).
- **Where:**
  - `src/app/solar-panel-cleaning-system/layout.tsx` and each child layout under `solar-panel-cleaning-system/*/layout.tsx`.
- **Problem:** Hub and all five children stack overlapping keywords ("solar panel cleaning robot India", etc.) in `keywords`, `title`, and `description`. They compete with each other in SERPs.
- **Fix:** Assign each URL one primary query and ladder secondary queries below it:
  - Hub → *"solar panel cleaning robot in India"* (category / decision page).
  - Model-A → *"automatic solar panel cleaning robot"* + *"waterless robot"*.
  - Model-B → *"semi-automatic solar panel cleaning robot"* + *"pick-and-place"*.
  - Model-T → *"solar panel cleaning robot for single-axis trackers"*.
  - OPEX → *"robotic solar cleaning service"* + *"pay per panel"*.
  - Console → *"solar robot fleet monitoring software"* + *"solar O&M portal"*.
  
  Rewrite each layout's `title` + `description` to lead with its assigned primary query. Move secondary keywords into the body + image alts only.
- **Acceptance:** No two layouts in the silo lead with the same primary keyword in `title`. Each `description` reflects a distinct intent.

### `SEO-020` — Resolve blog cannibalisation pairs

- **Status:** `[ ]`
- **Where:**
  - `src/app/blog/what-are-the-different-types-of-solar-panels/metadata.json` + `content.html`
  - `src/app/blog/understanding-different-types-of-solar-panels/metadata.json` + `content.html`
  - `src/app/blog/what-is-solar-panel-efficiency/metadata.json` + `content.html`
  - `src/app/blog/what-is-the-solar-panel-efficiency-in-2025/metadata.json` + `content.html`
  - `next.config.ts` (for 301)
- **Problem:** Two near-duplicate intent pairs:
  - "Types of solar panels" × 2 slugs.
  - "Solar panel efficiency" × 2 slugs (one with year).
- **Fix:** For each pair:
  1. Pick the canonical winner (typically the more comprehensive / better-ranking one).
  2. Rewrite the loser as a deeper child piece linked from the winner, **or** delete it and add a 301 redirect from the loser's slug to the winner's slug in `next.config.ts`.
  3. Inside the winner, add an explicit internal link to the surviving child piece (if not deleted).
- **Acceptance:** Each pair resolves to exactly one canonical URL for its primary query; loser is either deleted + redirected or repositioned with a distinct intent.

### `SEO-021` — Convert 36 blog posts from `<strong>` section titles to real `<h2>`

- **Status:** `[ ]`
- **Where:** 36 of 50 `src/app/blog/<slug>/content.html` files (those reported with `H2 = 0`).
- **Problem:** Visual section titles are styled `<p><strong>...</strong></p>`. The TOC in `src/app/blog/[slug]/page.tsx` only picks up `<h2>` / `<h3>`, so these posts have no anchors, no in-page TOC, and weaker SERP outline signals.
- **Fix:** In each affected `content.html`, convert visible section titles to proper `<h2>` (or `<h3>` for nested subsections). Don't change the wording — only the tag. Bonus: add a meaningful `id` attribute (kebab-case of the heading text) on each new `<h2>` for stable anchor links.
- **Slugs affected (36):** All posts where the audit showed `H2 = 0` — i.e. everything except the 14 posts that already use `<h2>`. The award post `mint-tech4good-awards-2024-...` is the inverse case (uses `<h3>` but no `<h2>`) — also fix.
- **Acceptance:** Every published post has ≥ 1 `<h2>` matching its visible section structure. The in-page TOC populates correctly on each.

### `SEO-022` — Trim 26 blog meta descriptions to ≤ 200 chars

- **Status:** `[ ]`
- **Where:** `src/app/blog/<slug>/metadata.json` for the 26 posts whose `description` exceeds 200 characters.
- **Problem:** SERP snippet risks truncation. Optimal range is ~150-180 chars.
- **Fix:** Rewrite each long description to ~150-180 chars: primary keyword once + clear value prop + (optional) year. Don't keyword stuff.
- **How to find them quickly:** `for f in src/app/blog/*/metadata.json; do desc=$(jq -r .description "$f"); len=${#desc}; if [ "$len" -gt 200 ]; then echo "$len $f"; fi; done` (run from repo root).
- **Acceptance:** No `metadata.json` has `description.length > 200`.

### `SEO-023` — Decide authorship policy; remove orphan `yogesh` profile or attribute posts

- **Status:** `[ ]`
- **Where:**
  - `src/app/blog/<slug>/metadata.json` (all 50)
  - `src/app/data/blogAuthors.ts` + `src/app/data/blogAuthors.store.json`
  - `src/app/blog/author/[authorSlug]/page.tsx`
- **Problem:** All 50 posts list `Taypro Team` as author. The stored profile `yogesh` is referenced nowhere, so `/blog/author/yogesh` 404s. Bios are ~120 chars — too short for E-E-A-T signals.
- **Fix (choose A or B):**
  - **A — Single team byline:** Delete the `yogesh` author from `blogAuthors.store.json`. Expand `taypro-team` bio to 250-400 chars. Add credentials (years in solar O&M, patents held, plants served).
  - **B — Real author attribution:** Pick a real person for each post (e.g. engineering posts → `yogesh`, news → `taypro-team`). Update `author` in each `metadata.json` accordingly. Expand both bios to 250-400 chars. Add `linkedInUrl` to each profile.
- **Acceptance:** No author profile is orphaned. Every public author has bio ≥ 250 chars, role, avatar, and (where applicable) a LinkedIn URL.

### `SEO-024` — Backfill `updatedAt` and start using it on refreshes

- **Status:** `[ ]`
- **Where:** All 50 `src/app/blog/<slug>/metadata.json`.
- **Problem:** `updatedAt` is missing on every post. The page falls back to `publishDate` for "Last updated", which is dishonest after a real refresh. Also weakens `dateModified` in `Article` JSON-LD.
- **Fix:** Add an `updatedAt` field with the same value as `publishDate` for now. Update it to the real revision date **whenever** you materially edit a post (e.g. when you do `SEO-021`, `SEO-022`, `SEO-025`).
- **Acceptance:** Every published `metadata.json` has an `updatedAt` field. The article JSON-LD `dateModified` matches it.

### `SEO-025` — Refresh year-anchored / outdated blog posts for 2026

- **Status:** `[ ]`
- **Where:** `src/app/blog/<slug>/content.html` for posts referencing 2023/2024 as the latest year or with year in the title.
- **Problem:** As of 2026-05-13, several posts read as stale:
  - **2023 references (4):** `cost-benefit-analysis-of-solar-panel-cleaning-services-in-india`, `indias-solar-energy-boom-in-2024-what-it-means-for-you-and-the-planet`, `innovations-in-solar-cleaning-systems-what-indias-top-farms-are-using`, `what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels`.
  - **Year-in-title (treat as evergreen, just verify):** `new-solar-panel-technologies-2025`, `solar-panel-maintenance-checklist-2025`, `top-15-solar-power-plants-in-india`, `what-is-the-solar-panel-efficiency-in-2025`, `indias-solar-energy-boom-in-2024-...`.
- **Fix:** For each, refresh stats / examples to 2025-2026 data, add an explicit intro line *"Updated for 2026"*, and bump `updatedAt`. For the 2024 boom post specifically, decide whether to:
  1. Refresh and rename to *"India's solar energy boom in 2026"* (with 301 from old slug),
  2. Reframe as a retrospective ("How India's 2024 solar boom played out"), or
  3. Retire and redirect.
- **Acceptance:** No published post references 2023 as the latest year. Year-in-title posts either updated for 2026 or retired with redirect.

### `SEO-026` — Add manual editorial internal links to the three "0 internal links" posts

- **Status:** `[ ]`
- **Where:**
  - `src/app/blog/how-ai-can-improve-solar-energy-output/content.html`
  - `src/app/blog/solar-panel-installation-cost-for-utility-scale-in-india/content.html`
  - `src/app/blog/taypro-wins-historic-patent-for-revolutionary-solar-panel-cleaning-system/content.html`
- **Problem:** Source HTML contains zero internal links. Value relies entirely on `addInternalLinking()` auto-wrapping keywords. The patent / news piece in particular should explicitly cite product pages.
- **Fix:** Add 2-3 deliberate contextual links in each post:
  - AI post → link to `/cleaning-technology` and Model-A page.
  - Installation cost post → link to ROI calculator + OPEX service page.
  - Patent post → link to `/solar-panel-cleaning-system` hub + `/cleaning-technology` + the relevant Model page.
- **Acceptance:** Each post's source HTML has ≥ 2 manual `<a href="/...">` to pillar pages.

---

## P2 — Polish, schema, internal-link plumbing

### `SEO-030` — Wire `BreadcrumbListSchema` into all routes with visible breadcrumbs

- **Status:** `[x]` Already emitted via `Breadcrumbs.tsx` (audit was wrong on this point). Fixed a real bug: schema now omits the `item` field on the current-page crumb instead of emitting `https://taypro.in` (just the site root).
- **Where:**
  - `src/app/components/StructuredData.tsx` (already exports `BreadcrumbListSchema`).
  - Every page that renders `<Breadcrumbs>` — product, project, blog routes.
- **Problem:** The component exists but is **not imported by any product/project/blog page**, despite all of them rendering breadcrumbs UI.
- **Fix:** Either (a) emit `BreadcrumbListSchema` inside the `Breadcrumbs` component so it ships with every breadcrumb instance, or (b) import and render it on each route. Option (a) is one change for site-wide coverage.
- **Acceptance:** Every page with a visible breadcrumb has a matching `BreadcrumbList` in JSON-LD.

### `SEO-031` — Add `Article` + `Place` JSON-LD to case studies

- **Status:** `[x]` `ArticleSchema` + `PlaceSchema` on Banda, Soyegaon, Yadgir 50 MW, Agar case study pages.
- **Where:** Each of `src/app/projects/{banda,soyegaon,yadgir-solar-project-50-mw,agar}-solar-project/page.tsx`.
- **Problem:** Case studies are perfect candidates for `Article` (with `datePublished`, `dateModified`, `image`, `author`) and optionally `Place` with the project's geo coordinates and locality. Currently only `BreadcrumbList`.
- **Fix:** Use `ArticleSchema` from `StructuredData.tsx`. Add a `Place` JSON-LD with `name`, `geo.latitude`, `geo.longitude`, `address.addressLocality`, `address.addressRegion`.
- **Acceptance:** Each case study page emits both `Article` and `Place` JSON-LD.

### `SEO-032` — Add `ItemList` JSON-LD to category project pages

- **Status:** `[x]` `ItemListSchema` with per-route `scriptId` on automatic, semi-automatic, capex category pages.
- **Where:** `src/app/projects/{automatic,semi-automatic,capex}/page.tsx`.
- **Problem:** Each renders 4 cards but emits no `ItemList`.
- **Fix:** Use `ItemListSchema` (already in `StructuredData.tsx`) populated from the same source array as the grid.
- **Acceptance:** Each category page emits an `ItemList` whose `itemListElement[].url` matches the cards.

### `SEO-033` — Rescue ROI calculator from internal-link orphan status

- **Status:** `[x]` Added a "How this calculator works" section with methodology copy, six contextual internal links (cleaning technology, Model-A/B/T, OPEX, hub), and a `OpenLeadModalButton` CTA.
- **Where:** `src/app/solar-panel-cleaning-robot-price-calculator/page.tsx` + `src/app/components/ROICalculator.tsx`.
- **Problem:** Zero `<Link>` / contextual internal links in body. Page is an orphan once a visitor lands on it.
- **Fix:** Add:
  1. A short *"How this calculator works"* methodology block (100-150 words) below the calculator UI explaining inputs, assumptions, and limitations.
  2. Contextual links in that block to `/cleaning-technology`, `/solar-panel-cleaning-system` hub, and Model-A / OPEX pages.
  3. A *"Want a tailored quote?"* CTA that opens the lead modal (use `OpenLeadModalButton`).
- **Acceptance:** Page has ≥ 3 internal links in body content.

### `SEO-034` — Rewrite `/contact` H1 to match query intent

- **Status:** `[x]` H1 is now "Contact Taypro about Solar Panel Cleaning Robots". Existing tagline kept as a sub-line; "Let's work together" moved to `<h2>`.
- **Where:** `src/app/contact/page.tsx`.
- **Problem:** Current H1 is *"The future of energy begins now"* — brand poetry, doesn't match "Contact Taypro" intent.
- **Fix:** Set H1 to something like *"Contact Taypro about solar panel cleaning robots"* (or a tighter variant). Keep the existing tagline as an `<h2>` or styled sub-heading.
- **Acceptance:** H1 contains either "Contact Taypro" or "Talk to Taypro".

### `SEO-035` — Add editorial copy + `/authors` link to `/blog` index

- **Status:** `[x]` Intro paragraph + link to `/authors` above the grid (`blog/page.tsx`).
- **Where:** `src/app/blog/page.tsx`.
- **Problem:** Page is just `<h1>Blogs</h1>` + grid. No editorial framing, no link to `/authors`.
- **Fix:** Above the grid, add 2-4 sentences explaining who the blog is for, what topics it covers, and how often it's updated. Include a visible link to `/authors`. Optionally add a small "Latest from <author>" or "Featured topics" strip.
- **Acceptance:** `/blog` index has a paragraph of editorial copy (50-100 words) and an `<a href="/authors">`.

### `SEO-036` — Plan pagination / "load more" for `/blog`

- **Status:** `[x]` Server-side pagination: 12 posts per page, `?page=N`, Previous/Next nav; per-page canonical URL in `generateMetadata`.
- **Where:** `src/app/blog/page.tsx` + `src/app/blog/BlogList.tsx`.
- **Problem:** Currently renders all 50 posts on one route. Still healthy at this size; will dilute crawl depth and UX as the archive grows.
- **Fix:** Implement either:
  - Numbered pagination (`/blog`, `/blog/page/2`, etc.) with `rel="next"` / `rel="prev"`, or
  - Client-side "Load more" that keeps the first 12-18 in SSR HTML for crawlers.
- **Acceptance:** First-page HTML loads in <100 KB of post markup; remaining posts crawlable via pagination links.

### `SEO-037` — Add `/blog` contextual links from product pages

- **Status:** `[x]` "Further reading" in-body links on hub, Model-A/B/T, OPEX, Console pages (audit slug pairings).
- **Where:** Each page under `src/app/solar-panel-cleaning-system/*/page.tsx`.
- **Problem:** The whole product silo has **zero** outbound links to `/blog`. Topical authority lost.
- **Fix:** On each product page, add 1-2 in-body contextual links to highly relevant explainers. Suggested pairings:
  - Hub → *the-complete-guide-to-solar-panel-maintenance*, *cost-benefit-analysis-of-solar-panel-cleaning-services-in-india*.
  - Model-A → *how-does-a-solar-panel-cleaning-robot-work*, *benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant*.
  - Model-B → *what-are-the-different-methods-used-for-solar-panel-cleaning*.
  - Model-T → *seasonal-solar-panel-maintenance-tips-a-comprehensive-guide*.
  - OPEX → *cost-benefit-analysis-of-solar-panel-cleaning-services-in-india*, *why-solar-power-plants-need-robotic-cleaning-for-maximum-roi*.
  - Console → *the-role-of-data-analytics-in-solar-panel-cleaning-improving-efficiency-with-taypro*, *beyond-cleaning-how-automated-systems-can-monitor-solar-panel-performance*.
- **Acceptance:** Each product page has ≥ 1 manual contextual link to a relevant blog post.

### `SEO-038` — Replace `Product360Viewer` frame-index alt text

- **Status:** `[x]` Added `productLabel` prop. Each caller (Model-A/B/T) now passes its full model description, e.g. *"Taypro Model-A — Automatic Solar Panel Cleaning Robot"*.
- **Where:** `src/app/components/Product360Viewer.tsx`.
- **Problem:** Alt text is `360-degree view - Frame N`. Weak for image search and accessibility.
- **Fix:** Accept a `modelName` and `productLabel` prop (e.g. *"Model-A automatic solar panel cleaning robot"*) and render alt as `${modelName} — 360° view (frame N of M)`. Update each caller (Model-A/B/T pages) to pass the right label.
- **Acceptance:** Sampled alt strings include the model name and a meaningful view description.

### `SEO-039` — Rename asset and update reference: Model-B page using `taypro-opex.jpg`

- **Status:** `[x]` Switched Model-B hero to the existing `taypro-modelBcopy.png` asset (and improved its alt). The OPEX asset remains in place for the actual OPEX usage in `data.ts`.
- **Where:**
  - `src/app/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system/page.tsx`
  - `public/tayprorobots/taypro-opex.jpg` (or wherever the asset lives).
- **Problem:** Hero of Model-B references `taypro-opex.jpg`. Confusing for asset audits and weakens model-specific image-search signals.
- **Fix:** Either rename the file to `taypro-model-b.jpg` and update the import, or swap to an actually-Model-B image.
- **Acceptance:** No `_opex_` filename used on the Model-B page.

### `SEO-040` — Fix breadcrumb trails on category project pages

- **Status:** `[x]` Home → Projects (`/projects`) → category on automatic, semi-automatic, capex pages.
- **Where:** `src/app/projects/{automatic,semi-automatic,capex}/page.tsx`.
- **Problem:** Breadcrumb skips "Projects" and goes Home → Automatic (current crumb has `href: ""`).
- **Fix:** Render Home → **Projects** → Automatic (with the middle crumb linking to `/projects`).
- **Acceptance:** Breadcrumb on each category page has three crumbs and the middle one navigates to `/projects`.

### `SEO-041` — Fix typos in `/sitemap` page title attributes

- **Status:** `[x]` Fixed both "CLeaning" and "Cleanign" occurrences.
- **Where:** `src/app/sitemap/page.tsx`.
- **Problem:** `title` attributes include "CLeaning", "Cleanign".
- **Fix:** Search the file for both misspellings and replace with "Cleaning".
- **Acceptance:** No occurrences of "CLeaning" or "Cleanign" remain in the file.

### `SEO-042` — Plan competitor / category comparison content

- **Status:** `[x]` Published `/compare/*` routes (robot vs manual, Taypro vs Solabot, Taypro vs Skilancer, waterless vs water) with `ComparisonLandingPage` + `comparisons.json`.
- **Where:** New routes or in-page sections on the product family.
- **Problem:** No third-party vendor comparison anywhere on the site. Only Taypro vs manual cleaning, or Taypro model vs Taypro model. Commercial SERPs frequently surface "X vs Y" queries.
- **Fix (requires editorial / legal review):** Decide on the safest approach:
  - **A — Category framing without naming competitors:** Add an H2 section on the hub titled *"How Taypro compares to other robotic cleaning approaches"* with category-level pros/cons (water vs waterless, hire vs buy, generic O&M vs robotic).
  - **B — Named comparison pages:** Build dedicated `/compare/taypro-vs-<competitor>` routes with sourced, factual comparisons. Higher reward but legal-sensitive.
- **Acceptance:** At least one comparison section exists on the hub OR one comparison page is published.

### `SEO-043` — Refresh shortest blog posts (~< 1,300 words) for depth

- **Status:** `[ ]`
- **Where:** `src/app/blog/<slug>/content.html` for the shortest posts:
  - `indias-solar-energy-boom-in-2024-...` (~772 words)
  - `taypro-wins-historic-patent-...` (~897 words)
  - `what-is-the-solar-panel-efficiency-in-2025` (~1,139 words)
  - `solar-panel-maintenance-checklist-2025` (~1,188 words)
  - `how-to-make-solar-panels-more-efficient` (~1,198 words)
- **Problem:** Not failing a hard word-count floor, but thin compared to competing top-of-page results in the same queries.
- **Fix:** Add 2-3 new H2 sections per post: real-world examples, step-by-step procedures, FAQs, image diagrams where possible. Bump `updatedAt`.
- **Acceptance:** Each listed post reaches ≥ 1,500 words and has ≥ 4 `<h2>` sections.

### `SEO-044` — Fix double `| Taypro` in document titles

- **Status:** `[x]` Stripped `| Taypro` from i18n meta titles via `scripts/strip-title-brand-suffix.mjs`; fixed hardcoded layout titles and project OG double-brand.
- **Where:** `src/app/[locale]/layout.tsx` (`title.template`), all `messages/pages/*/meta.title` keys ending with `| Taypro`, hardcoded layout titles, OG title concatenation in `projects/[slug]/page.tsx` and `performance-and-test-methodology/page.tsx`.
- **Problem:** Layout appends `| Taypro` to titles that already include the brand → Google rewrites stuffed titles.
- **Fix:** Strip `| Taypro` from i18n `meta.title` strings; let template add suffix once. Fix manual OG `| Taypro` appenders.
- **Acceptance:** Rendered `<title>` on `/`, hub, `/site-map`, `/company`, one project slug — exactly one `| Taypro`.

### `SEO-045` — Legacy WordPress URL 301 redirects

- **Status:** `[x]` Added redirects in `next.config.ts` + `deploy/nginx/legacy-static-deny.conf` for nginx-layer fallback.
- **Where:** `next.config.ts`, `deploy/nginx/legacy-static-deny.conf`.
- **Problem:** `taypro-basic/`, `industrial_solar_panel_cleaning_system.html`, `/news/*`, `/contact/` still indexed from old site.
- **Fix:** 301 map: `taypro-basic` → HELYX; `industrial_solar_*` → hub; `/news/:path*` → `/blog/:path*`; `/contact/` → `/contact`. Delete stale static files on server.
- **Acceptance:** `curl -I` on each legacy URL returns 301 to canonical Next.js route.

### `SEO-046` — Google Search Console legacy URL cleanup

- **Status:** `[ ]` (manual post-deploy)
- **Where:** Google Search Console → URL Inspection, Removals, Sitemaps.
- **Problem:** Indexed legacy URLs persist after 301s until Google recrawls.
- **Fix:** After deploy: URL Inspection on each legacy URL; request removal for `taypro-basic/` and `industrial_solar_panel_cleaning_system.html`; resubmit `sitemap.xml`; monitor Page indexing 2–4 weeks.
- **Acceptance:** GSC shows 301 redirect target for each legacy URL; no new 404s for legacy paths.

---

## Suggested execution order

1. **Sprint 1 — P0 batch** (`SEO-001` … `SEO-007`). Mechanical, no copy debate.
2. **Sprint 2 — Case studies** (`SEO-010` … `SEO-013`). Highest ranking ROI per hour.
3. **Sprint 3 — Project category pages** (`SEO-014` … `SEO-016`).
4. **Sprint 4 — Blog hygiene bulk pass** (`SEO-021`, `SEO-022`, `SEO-024`).
5. **Sprint 5 — Blog cannibalisation + authorship + refresh** (`SEO-020`, `SEO-023`, `SEO-025`, `SEO-026`).
6. **Sprint 6 — Product silo content depth** (`SEO-017`, `SEO-018`, `SEO-019`).
7. **Sprint 7 — Schema + internal-link plumbing** (`SEO-030` … `SEO-033`, `SEO-037`, `SEO-040`).
8. **Sprint 8 — Polish + comparison content** (`SEO-034` … `SEO-036`, `SEO-038`, `SEO-039`, `SEO-041`, `SEO-042`, `SEO-043`).

---

## Quick-reference: file → task map

| File | Tasks |
|------|-------|
| `src/app/data.ts` | `SEO-001` (Yadgir href), `SEO-018` (OPEX FAQ split) |
| `src/app/company/page.tsx` | `SEO-002` |
| `src/app/privacy-policy/page.tsx` | `SEO-003`, `SEO-004` |
| `src/app/cookie-policy/page.tsx` | `SEO-003`, `SEO-004` |
| `src/app/terms-of-service/page.tsx` | `SEO-003`, `SEO-004` |
| `src/app/projects/automatic/page.tsx` | `SEO-005`, `SEO-014`, `SEO-032`, `SEO-040` |
| `src/app/projects/semi-automatic/page.tsx` | `SEO-005`, `SEO-015`, `SEO-032`, `SEO-040` |
| `src/app/projects/capex/page.tsx` | `SEO-005`, `SEO-016`, `SEO-032`, `SEO-040` |
| `src/app/projects/banda-solar-project/page.tsx` | `SEO-010`, `SEO-031` |
| `src/app/projects/soyegaon-solar-project/page.tsx` | `SEO-011`, `SEO-031` |
| `src/app/projects/yadgir-solar-project-50-mw/page.tsx` | `SEO-012`, `SEO-031` |
| `src/app/projects/agar-solar-project/page.tsx` | `SEO-013`, `SEO-031` |
| `src/app/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system/page.tsx` | `SEO-006`, `SEO-037` |
| `src/app/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system/page.tsx` | `SEO-037`, `SEO-039` |
| `src/app/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers/page.tsx` | `SEO-037` |
| `src/app/solar-panel-cleaning-system/solar-panel-cleaning-service/page.tsx` | `SEO-018`, `SEO-037` |
| `src/app/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app/page.tsx` | `SEO-017`, `SEO-037` |
| `src/app/solar-panel-cleaning-system/**/layout.tsx` | `SEO-019` |
| `src/app/home/page.tsx` + `HomePageInteractive.tsx` | `SEO-007` |
| `src/app/contact/page.tsx` | `SEO-034` |
| `src/app/solar-panel-cleaning-robot-price-calculator/page.tsx` + `components/ROICalculator.tsx` | `SEO-033` |
| `src/app/blog/<slug>/content.html` (36 files) | `SEO-021` |
| `src/app/blog/<slug>/metadata.json` (26 files) | `SEO-022` |
| `src/app/blog/<slug>/metadata.json` (all 50) | `SEO-024` |
| `src/app/blog/page.tsx` + `BlogList.tsx` | `SEO-035`, `SEO-036` |
| `src/app/blog/{4-slugs}` | `SEO-020` |
| `src/app/blog/{3-slugs}/content.html` | `SEO-026` |
| `src/app/blog/{outdated-slugs}/content.html` | `SEO-025`, `SEO-043` |
| `src/app/data/blogAuthors.ts` + `blogAuthors.store.json` | `SEO-023` |
| `src/app/components/StructuredData.tsx` + `Breadcrumbs.tsx` | `SEO-030` |
| `src/app/components/Product360Viewer.tsx` | `SEO-038` |
| `src/app/sitemap/page.tsx` | `SEO-041` |
| (new routes / sections) | `SEO-042` |

---

**Document maintenance:** When a task is finished, change its `[ ]` to `[x]` and add a one-line note with the commit SHA or PR link. When new content issues are found, append them as `SEO-100+` to keep the original numbering stable.
