# Taypro SEO Strategy & Implementation Playbook

**Site:** [taypro.in](https://taypro.in)  
**Source data:** `Keyword Stats 2026-05-18 at 11_43_57.csv` (Google Keyword Planner, India, Apr 2025–Mar 2026, 671 keywords)  
**Last updated:** 2026-05-18  
**Status:** Living document — check tasks off as completed.

---

## How to use this doc

1. Work **top to bottom** within each phase (Foundation → Authority → Scale).
2. Each task has a **checkbox** (`- [ ]`). Change to `- [x]` when done.
3. **Owner** and **target files** are noted where implementation lives in this repo.
4. Do **not** chase high-volume **panel sales** keywords (500k bucket) — Taypro sells **cleaning robots & services**, not PV modules.
5. Re-run Keyword Planner quarterly; append new exports and update [Appendix B](#appendix-b-keyword--url-master-list).

---

## Executive summary

| Insight | Action |
|--------|--------|
| 23 keywords at **50k+** volume are mostly **panel price / solar panels** | Ignore for product SEO |
| **15+ cleaning keywords at 5k** are the core market | Hub + service + model pages |
| **Service cluster** (5k, competition index **18**) = fastest commercial win | Prioritize Opex/service page |
| **Robot cluster** (5k, index **39**) = category ownership | Hub + GLYDE (dual-pass) + NYUMA (PBT) |
| **Brush / washing** (5k, index **95–100**) = manual intent | Comparison **blogs**, not product H1 |
| Semrush legacy URLs (`/solar_panel_cleaning_robot`, etc.) | Add **301 redirects** in `next.config.ts` |
| Export missing semi-auto / tracker / utility seeds | Second Planner download ([§12](#12-second-keyword-planner-export)) |

---

## 1. Goals & KPIs

### Primary goals (12 months)

- [ ] **Top 10** for `solar panel cleaning robot` (India)
- [ ] **Top 5** for `solar panel cleaning service` / `solar cleaning service`
- [ ] **Top 10** for `automatic solar panel cleaning system`
- [ ] **50+ organic leads/month** from calculator + contact (track in CRM/analytics)

### Track weekly (Google Search Console)

- [ ] Impressions & clicks on queries containing: `cleaning`, `robot`, `cleaning service`
- [ ] Average position for [Position Tracking list](#11-position-tracking-keywords)
- [ ] Landing pages: hub, service, Model-A, calculator

### Tools

| Tool | Use |
|------|-----|
| Google Search Console | Real queries, indexing, CTR |
| Google Keyword Planner | Volume buckets (this CSV) |
| Semrush (optional) | KD, gaps, On-Page audits |
| GA4 | Conversions, landing pages |

---

## 2. Site architecture (canonical URLs)

**Rule:** One **primary keyword** per URL. Synonyms go in H2, body, FAQ — not separate pages.

```
/                                    → Brand + robots India (NOT generic "solar panels")
/solar-panel-cleaning-system         → robot, system, cleaning, machine (HUB)
  /automatic-solar-panel-cleaning-system              → GLYDE (dual-pass flagship, fixed-tilt)
  /automatic-solar-panel-cleaning-system-for-single-axis-trackers → GLYDE-X (dual-pass tracker)
  /nyuma-automatic-cleaning-robot                     → NYUMA (PBT single-pass, fixed-tilt)
  /nyuma-x-single-axis-tracker-cleaning-robot         → NYUMA-X (PBT single-pass, tracker)
  /semi-automatic-solar-panel-cleaning-system         → HELYX (semi-auto, distributed)
  /solar-panel-cleaning-service                       → Taypro OPEX (service)
  /automatic-cleaning-robot-monitoring-app            → NECTYR (fleet portal)
/solar-panel-cleaning-robot-price-calculator → cost, price, ROI
/cleaning-technology                 → waterless, dry, dual-pass vs PBT
/projects, /projects/*               → proof, E-E-A-T
/blog                                → brush, how-to, dust, comparisons
/company, /contact                   → trust + conversion
```

**Sitemap reference:** `src/lib/seo/sitemap-config.ts`  
**Internal links reference:** `src/app/utils/internalLinking.ts`  
**Meta keywords reference:** `messages/pages/en/solar-system.json`, `model-a.json`, etc.

---

## 3. Keyword tiers

### Tier A — Money pages (implement first)

| Primary keyword | Vol bucket | Comp index | Canonical URL |
|-----------------|-------------|------------|-----------------|
| solar panel cleaning robot | 5k | 39 | `/solar-panel-cleaning-system` |
| solar panel cleaning system | 5k | 96 | Same hub |
| solar panel cleaning | 5k | 92 | Same hub |
| solar cleaning system | 5k | 98 | Same hub |
| solar panel cleaning machine | 5k | 97 | Same hub |
| automatic solar panel cleaning system | 5k | 92 | `.../automatic-solar-panel-cleaning-system` |
| solar panel cleaning service | 5k | **18** | `.../solar-panel-cleaning-service` |
| solar cleaning service | 5k | **18** | Same service page |
| solar panel cleaning company | 5k | **18** | Same service page |
| pv panel cleaning robot | 5k | 39 | Hub (FAQ section) |
| solar module cleaning robot | 5k | 39 | Hub (FAQ section) |
| solar panel cleaning cost | 500 | 24 | `/solar-panel-cleaning-robot-price-calculator` |

**Hub synonyms (same page, not new URLs):**  
`solar cleaning`, `solar clean`, `solar power cleaning`, `pv panel cleaning`, `solar module cleaning`, `solar plate cleaner`, `automated solar panel cleaning system`, `solar system cleaning`.

### Tier B — Blog & comparison (months 2–12)

| Keyword | Vol | Comp | Content angle |
|---------|-----|------|----------------|
| solar panel cleaning brush | 5k | 100 | Robot vs brush TCO for utility plants |
| solar cleaning brush | 5k | 100 | Same cluster — one definitive post |
| solar panel washing | 5k | 95 | Not home appliances — farm robots |
| solar panel washing machine | 5k | 95 | Disambiguation post |
| solar panel cleaning equipment | 500 | 100 | 10MW+ equipment guide |
| solar panel cleaning kit | 500 | 97 | Rooftop kit vs utility robot |
| dust on solar panels | 500 | 1 | Soiling + PR loss |
| best way to clean solar panels | 50 | 95 | Decision tree by plant size |
| solar panel cleaning frequency | 50 | 5 | O&M scheduling |

### Tier C — Long-tail (FAQ + blog, Planner shows 50 bucket)

- solar panel cleaning robot manufacturers in india  
- solar panel cleaning robot india / price  
- waterless solar panel cleaning robot  
- robotic cleaning of solar panels  
- autonomous solar panel cleaning robot  

### Tier D — Do NOT target as primary pages

- solar panels, solar panel price, photovoltaic panels price (500k)  
- solar panel manufacturers, best solar panels in india (wrong business)  
- solar plant (50k) without cleaning modifier  
- Geo junk: san diego, melbourne, vadodara-only terms  
- Student intent: robot project, pdf, ppt  

---

## 4. Phase 1 — Foundation (Weeks 1–4)

### 4.1 Technical & tracking

- [ ] **GSC:** Verify `taypro.in` property; submit `sitemap.xml`
- [ ] **GA4:** Mark conversions — contact submit, calculator complete, quote CTA clicks
- [ ] **Semrush / Planner:** Update tracked URLs to kebab-case paths (drop underscore legacy URLs)
- [ ] **Position Tracking:** Add keywords from [§11](#11-position-tracking-keywords)

### 4.2 Legacy URL redirects (301)

Add to `next.config.ts` → `redirects()` if any old URLs still receive traffic (check GSC):

| Old path (examples) | New destination |
|---------------------|-----------------|
| `/solar_panel_cleaning_robot` | `/solar-panel-cleaning-system` |
| `/solar_panel_cleaning_system` | `/solar-panel-cleaning-system` |
| `/automatic_solar_panel_cleaning_machine` | `/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system` |
| `/battery_solar_cleaning_machine` | `/solar-panel-cleaning-system` (or relevant model) |
| `/monocrystalline_solar_module_cleaning_robot` | `/solar-panel-cleaning-system` |
| `/taypro-automatic` | `/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system` |
| `/solar_panel_cleaning_robot` | `/solar-panel-cleaning-system` |

- [ ] Audit GSC → Pages → filter 404 / legacy paths  
- [ ] Implement redirects in `next.config.ts`  
- [ ] Test redirects in staging + production  
- [ ] Request indexing of canonical URLs in GSC  

### 4.3 Homepage SEO cleanup

**Do not optimize for:** `automatic cleaning machine`, `automatic mopping machine`, `solar panels` (500k).

- [ ] Confirm meta in `messages/pages/en/home.json` stays solar-robot focused  
- [ ] Remove generic appliance keywords from Semrush On-Page project for `/`  
- [ ] Hero H1: autonomous **solar panel cleaning robots** (already aligned)  
- [x] Add prominent CTA → hub + calculator (+ service)  

### 4.4 Service page (highest ROI — competition index 18)

**URL:** `/solar-panel-cleaning-system/solar-panel-cleaning-service`  
**Files:** `messages/pages/en/cleaning-service.json` (or equivalent page component)

- [x] Expand to **900–1,200 words** of indexable copy (above fold + sections)  
- [x] H1 includes: **solar panel cleaning service**  
- [x] Sections: Opex model, SLA, pan-India support, who it's for (10MW+), who it's not for (residential)  
- [x] FAQ (8 questions) — use Tier A service keywords as questions  
- [x] `FAQPage` schema (pattern: `src/app/[locale]/home/page.tsx`)  
- [x] CTAs → contact + calculator  
- [x] Internal links from hub, homepage, footer  

### 4.5 Hub page

**URL:** `/solar-panel-cleaning-system`  
**Files:** `messages/pages/en/solar-system.json`, hub page component

- [x] **1,000+ words** indexable content (intro, comparison table, robot vs brush section)  
- [x] H1/H2 map: robot, system, cleaning, machine  
- [x] Model comparison table → links to Model-A, B, T, Opex, Console  
- [x] FAQ block (10 Qs) from Tier A synonym cluster  
- [ ] `Product` + `FAQPage` schema (FAQPage done; Product on child pages)  
- [x] Embed product video  
- [ ] Link to 3+ project case studies  

### 4.6 Calculator page

**URL:** `/solar-panel-cleaning-robot-price-calculator` (canonical)  
**Redirects:** `/roi-calculator`, `/solar-panel-cleaning-robot-price`, `/solar-panel-cleaning-cost-calculator`, `/solar-panel-cleaning-robot-roi-calculator` → canonical (`next.config.ts`)  
**Files:** `messages/pages/en/price-calculator.json`, `ROICalculator.tsx`, calculator `page.tsx`

- [x] Single **Price & ROI** tool (no separate price-only calculator)
- [x] Investment-first results + PDF row order
- [x] Opex banner on calculator page → service URL
- [x] FAQ: cost, price, India, payback, CAPEX vs Opex
- [x] Meta targets: `solar panel cleaning cost`, `solar panel cleaning prices`
- [x] Homepage CTA → `#calculator`
- [ ] Hub + all product CTAs → `#calculator` where primary CTA is estimate/price

### 4.7 Internal linking pass

- [x] Homepage → hub, service, calculator  
- [ ] Hub → all child models + service + calculator + technology  
- [x] Each model page → calculator + service + hub  
- [ ] Blog posts use `src/app/utils/internalLinking.ts` keyword map  
- [x] Footer / nav includes hub + service (if not already)  

### 4.8 First blog post (brush trap)

- [ ] Publish: **Solar panel cleaning brush vs robot — total cost for Indian utility plants**  
- [ ] Primary: `solar panel cleaning brush` (5k)  
- [ ] CTA → hub + Model-A + calculator  
- [ ] Internal links per `internalLinking.ts`  

---

## 5. Phase 2 — Authority (Months 2–4)

### 5.1 Product pages depth

**Model-A** — `messages/pages/en/model-a.json`  
- [ ] 800+ words; primary: `automatic solar panel cleaning system`  
- [ ] Specs, TÜV, modules/charge, Console connectivity  
- [ ] FAQ: price → calculator, manufacturer India  

**Model-B** — semi-automatic page  
- [ ] Target: `semi automatic solar panel cleaning robot` (add to Planner export first)  
- [ ] 800+ words; pick-and-place, scattered blocks  

**Model-T** — tracker page  
- [ ] Target: `single axis tracker solar panel cleaning` (add to Planner export)  
- [ ] 800+ words; bridge, 360°, tracker brands  

**Console app page**  
- [ ] Target: monitoring / fleet software keywords  

- [ ] `Product` schema on each model page  
- [ ] Aggregate rating markup if eligible (Semrush idea — verify real reviews)  

### 5.2 Blog calendar (publish 1 per week or use automation + edit)

| # | Status | Target keyword | Title (working) |
|---|--------|----------------|-----------------|
| 1 | [ ] | solar panel cleaning brush | Robot vs brush TCO |
| 2 | [ ] | solar panel cleaning | Complete guide for utility plants (India) |
| 3 | [ ] | solar panel washing machine | Why "washing machine" ≠ farm cleaning robots |
| 4 | [ ] | dust on solar panels | Soiling losses & PR impact in India |
| 5 | [ ] | solar panel cleaning cost | CAPEX vs Opex vs manual labor |
| 6 | [ ] | solar panel cleaning equipment | What 50MW+ sites need |
| 7 | [ ] | solar panel cleaning kit | Rooftop kits vs utility robots |
| 8 | [ ] | best way to clean solar panels | Best method by plant size |
| 9 | [ ] | solar panel cleaning frequency | Scheduling + AI |
| 10 | [ ] | robotic cleaning of solar panels | Technology deep dive |
| 11 | [ ] | manufacturers in india | Buyer's guide for cleaning robots |
| 12 | [ ] | waterless solar panel cleaning | Waterless tech + link to `/cleaning-technology` |

**Automation:** align `src/lib/topicCategories.ts` with ROI, O&M, dust, regional India — avoid generic "solar panels" topics.  
**Files:** `src/lib/aiService.ts`, `src/app/api/automation/generate-blog/route.ts`

- [x] Add SEO blog titles queue (`data/seo-blog-queue.json`, wired in `pickSeoKeywordBrief`)  
- [ ] Human-edit all Tier B posts before publish (optional; automation still auto-publishes)  

### 5.3 E-E-A-T & projects

- [ ] 2 new detailed project write-ups → link from hub  
- [ ] `/company` — patents, team, manufacturing India  
- [ ] `/authors` — expert authors on technical posts  
- [ ] Performance methodology page linked from product specs  

### 5.4 Cleaning technology page

**URL:** `/cleaning-technology`  
- [ ] Target waterless / dry / dual-pass in title, H1, FAQ  
- [ ] Link from hub, Model-A, blogs  

---

## 6. Phase 3 — Scale (Months 5–8)

### 6.1 Content & automation

- [ ] Blog automation: 1 draft/day max (`BLOG_AUTOMATION_MIN_DAYS=1`); random 9:00–15:00 IST  
- [ ] Every auto-post: internal links to hub + one product page  
- [ ] Refresh hub + service quarterly (new GW deployed, new projects)  

### 6.2 Internationalization (prioritized)

- [ ] Translate **hub + service + top 5 blogs** to `hi` (and next priority locale)  
- [ ] hreflang / locale metadata verified  
- [ ] Do **not** translate thin doorway pages  

### 6.3 Link building

- [ ] 2–3 digital PR / industry pieces (O&M, robotics, solar magazines)  
- [ ] Guest post or quote on soiling / robot cleaning  
- [ ] Partner / client case study backlinks to hub  
- [ ] Directory: relevant solar O&M / robotics only (quality > quantity)  

### 6.4 Competitor gap

- [ ] Semrush Keyword Gap vs 2–3 competitors (e.g. domestic cleaning robot brands)  
- [ ] Fill gaps via blog or FAQ — not duplicate URLs  

### 6.5 Avoid

- [ ] **No** 50-city "near me" doorway pages  
- [ ] **No** separate URL per keyword synonym at 5k  
- [ ] **No** chasing `solar panel manufacturers` (5k, wrong intent)  

---

## 7. Phase 4 — Defend & expand (Months 9–12)

- [ ] Q3 content refresh: hub, service, Model-A stats  
- [ ] Second Keyword Planner export merged ([§12](#12-second-keyword-planner-export))  
- [ ] Review GSC: consolidate pages that compete (same query, multiple URLs)  
- [ ] Expand calculator if new price-related keywords appear  
- [ ] Consider **one** commercial landing page only if new keyword has 5k+ vol **and** distinct SERP (rare)  

---

## 8. On-page checklist (every money page)

- [ ] Primary keyword in `<title>` (≤ 60 chars)  
- [ ] Primary keyword in `<h1>` (one H1)  
- [ ] Secondary terms in H2s  
- [ ] Meta description 150–160 chars, includes CTA  
- [ ] 800–1,200 words substantive copy (not keyword stuffing)  
- [ ] 5–10 FAQs with `FAQPage` JSON-LD  
- [ ] `Product` or `Service` schema where appropriate  
- [ ] 3+ internal links to related Taypro pages  
- [ ] Images: WebP, `alt` with natural language  
- [ ] CTA above fold + end of page  
- [ ] Mobile LCP acceptable (lazy-load heavy images)  

---

## 9. Homepage vs Semrush mismatch

Semrush On-Page Checker may still target wrong homepage keywords. **Align tool with strategy:**

| Remove from homepage tracking | Add to homepage tracking |
|------------------------------|--------------------------|
| automatic cleaning machine | solar panel cleaning robot |
| automatic mopping machine | solar panel cleaning robots India |
| solar cleaning services (→ service URL) | Taypro |
| generic solar panels | autonomous solar cleaning |

- [ ] Update Semrush On-Page project  
- [ ] Re-run audit after service + hub expansion  

---

## 10. Codebase quick reference

| Task type | Location |
|-----------|----------|
| Sitemap routes | `src/lib/seo/sitemap-config.ts` |
| 301 redirects | `next.config.ts` → `redirects()` |
| Blog internal links | `src/app/utils/internalLinking.ts` |
| Blog automation topics | `src/lib/topicCategories.ts` |
| AI blog generation | `src/lib/aiService.ts` |
| Product meta EN | `messages/pages/en/solar-system.json`, `model-a.json`, etc. |
| Home meta EN | `messages/pages/en/home.json` |
| SEO component | `src/app/components/SEO.tsx` |
| Structured data | `src/app/components/StructuredData.tsx` |
| LLM site map | `public/llms.txt` |
| Keyword source CSV | `Keyword Stats 2026-05-18 at 11_43_57.csv` (repo root) |

### Optional repo tasks (not started)

- [ ] Create `data/seo-keywords.csv` — scored keywords with `tier`, `url`, `content_type`  
- [x] Create `data/seo-blog-queue.json` — ordered keywords from §5.2  
- [x] Wire blog queue into `pickSeoKeywordBrief()` (automation planning)  
- [ ] Add legacy redirects batch to `next.config.ts`  

---

## 11. Position tracking keywords

**Group P1 — Hub / product**  
`solar panel cleaning robot`  
`solar panel cleaning system`  
`solar panel cleaning`  
`automatic solar panel cleaning system`  
`solar panel cleaning machine`  
`pv panel cleaning robot`  

**Group P2 — Service**  
`solar panel cleaning service`  
`solar cleaning service`  
`solar panel cleaning company`  

**Group P3 — BOFU**  
`solar panel cleaning cost`  
`solar panel cleaning robot price`  
`solar panel cleaning robot india`  

**Group P4 — Content**  
`solar panel cleaning brush`  
`best way to clean solar panels`  
`dust on solar panels`  

- [ ] Add all groups to Semrush Position Tracking (India)  
- [ ] Monthly export & note in this doc (date + top movers)  

---

## 12. Second Keyword Planner export

Seeds missing from first CSV — run Planner again and merge:

```
semi automatic solar panel cleaning robot
single axis tracker solar panel cleaning
utility scale solar panel cleaning robot
solar farm cleaning robot
soiling loss solar plant India
solar O&M cleaning robot
Taypro
dry cleaning solar panels utility
robotic solar panel cleaning system India
waterless solar panel cleaning
```

- [ ] Download merged CSV  
- [ ] Update Appendix B with new rows  
- [ ] Add Model-B / Model-T tasks if volumes justify  

---

## Appendix A — Phase summary timeline

| Phase | When | Focus |
|-------|------|--------|
| 1 Foundation | Weeks 1–4 | Redirects, service page, hub, calculator, internal links, blog #1 |
| 2 Authority | Months 2–4 | Model pages, 12 blogs, schema, projects |
| 3 Scale | Months 5–8 | Automation, i18n, links, gap analysis |
| 4 Defend | Months 9–12 | Refresh, second CSV, consolidate |

---

## Appendix B — Keyword → URL master list

**Volume** = Google Keyword Planner bucket (not exact). **Idx** = competition indexed value (lower = easier).

### Hub — `/solar-panel-cleaning-system`

| Keyword | Vol | Idx |
|---------|-----|-----|
| solar panel cleaning robot | 5k | 39 |
| pv panel cleaning robot | 5k | 39 |
| solar module cleaning robot | 5k | 39 |
| solar panel cleaning | 5k | 92 |
| solar panel cleaning system | 5k | 96 |
| solar cleaning system | 5k | 98 |
| solar panel cleaning machine | 5k | 97 |
| solar cleaning | 5k | 94 |
| solar clean | 5k | 94 |
| solar module cleaning | 5k | 90 |
| pv panel cleaning | 5k | 90 |
| solar power cleaning | 5k | 90 |
| automated solar panel cleaning system | 5k | 92 |
| solar cleaning robot | 500 | 37 |

### Model-A — `.../automatic-solar-panel-cleaning-system`

| Keyword | Vol | Idx |
|---------|-----|-----|
| automatic solar panel cleaning system | 5k | 92 |
| automatic solar panel cleaner | 500 | 91 |
| automatic solar cleaning system | 500 | 93 |
| solar panel cleaning system automatic | 500 | 94 |
| autonomous solar panel cleaning robot | 50 | 14 |
| automatic solar panel cleaning robot | 50 | 57 |

### Service — `.../solar-panel-cleaning-service`

| Keyword | Vol | Idx |
|---------|-----|-----|
| solar panel cleaning service | 5k | 18 |
| solar cleaning service | 5k | 18 |
| solar panel cleaning company | 5k | 18 |
| solar cleaning company | 5k | 18 |
| solar power cleaning service | 5k | 18 |
| solar panel cleaning near me | 500 | 17 |
| solar panel cleaning service near me | 500 | 11 |

### Calculator — `/solar-panel-cleaning-robot-price-calculator`

| Keyword | Vol | Idx |
|---------|-----|-----|
| solar panel cleaning cost | 500 | 24 |
| solar panel cleaning prices | 500 | 24 |
| automatic solar panel cleaning system price | 500 | 95 |
| solar panel cleaning robot price | 50 | 54 |
| solar cleaning robot price | 50 | 19 |

### Blog only — `/blog/[slug]`

| Keyword | Vol | Idx |
|---------|-----|-----|
| solar panel cleaning brush | 5k | 100 |
| solar cleaning brush | 5k | 100 |
| solar panel washing | 5k | 95 |
| solar panel washing machine | 5k | 95 |
| solar panel cleaning equipment | 500 | 100 |
| solar panel cleaning kit | 500 | 97 |
| dust on solar panels | 500 | 1 |
| best way to clean solar panels | 50 | 95 |
| solar panel cleaning frequency | 50 | 5 |

### Do not build pages for

| Keyword | Vol | Reason |
|---------|-----|--------|
| solar panels | 500k | Panel sales |
| solar panel price | 500k | Panel sales |
| solar panel manufacturers | 5k | Module factories |
| best solar panels in india | 5k | Consumer panels |

---

## Appendix C — Monthly review template

Copy into a note each month:

```
Month: ___________

GSC impressions (cleaning cluster): ___
GSC clicks: ___
Top 3 gaining keywords: ___
Top 3 losing keywords: ___
Pages updated this month: ___
Blogs published: ___
Leads from organic (calculator + contact): ___
Next month priority (1–3 tasks from this doc): ___
```

---

## Revision log

| Date | Change |
|------|--------|
| 2026-05-18 | Initial strategy from Keyword Planner CSV (671 kw) |
