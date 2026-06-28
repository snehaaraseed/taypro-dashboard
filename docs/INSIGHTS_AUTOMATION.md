# Insights — Monthly Deep Research Reports

One **unique, research-backed report** publishes on the **1st of every month** at `/insights/solar-cleaning-research-{month}-{year}`.

This is **not** static playbook content or GSC dashboard exports. Each report is a **3,500–5,500 word** procurement intelligence brief for utility-scale solar cleaning buyers in India.

## What gets published

| Field | Example |
|-------|---------|
| URL | `/insights/solar-cleaning-research-june-2026` |
| Schedule | 1st of month, 10:00 IST |
| Uniqueness | **One report per calendar month** (`period: 2026-06`) |
| Topic | Rotates through 12 curated deep-dive subjects |

## Research pipeline (same rigour as blog automation)

1. **4× Google Search grounding** (`gemma-4-31b-it` via the googleSearch tool)
   - Live SERP analysis (competitor angles, PAA, gaps)
   - Fact pass: general industry stats
   - Fact pass: MNRE/CEA/regulatory
   - Fact pass: field operations & deployments
2. **Editorial plan** — 10–12 specific H2 sections for that month’s topic. The planner is fed the H2 themes of any **prior edition of the same topic** and told to take a distinctly fresh angle (the 12-topic queue rotates annually).
3. **Section writer** — Gemma 4 31B writes in 6+ chunks (~320–480 words per H2), with continuity
4. **Deterministic ROI table** — Taypro calculator bands (50 MW / 200 MW)
5. **Sources appendix** — URIs from grounding metadata
6. **Structural validator (fail-closed)** — min 3,500 words, 10+ H2s, 6+ external citations, all planned sections present
7. **Cross-edition uniqueness** — body keyword overlap and H2 overlap are compared against prior editions of the same topic; a near-duplicate is rejected and re-written
8. **LLM quality judge** — Gemma scores the full report (depth, specificity, factual grounding, decision-usefulness) against the live SERP context; reports below the bar are re-written and, if still weak, withheld rather than published

Steps 2–8 run for up to **2 attempts** (grounding from step 1 is reused), so a weak first draft is regenerated before publishing.

## Setup

```bash
npm run cms:migrate-insights
npm run ops:install-insights-cron   # production
```

## Generate manually

```bash
curl -X POST "http://127.0.0.1:3000/api/automation/generate-research-insight" \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

Optional topic override (still one slug per month):

```bash
curl -X POST ".../generate-research-insight?topic=roboticVsManual" \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

Status:

```bash
curl "http://127.0.0.1:3000/api/automation/generate-research-insight" \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

## Category Pulse (retired)

The thin GSC-stats "Category Pulse" report is **disabled** — Insights is curated to a single deep, human-readable research report per month. The `generate-category-pulse` route still exists (dormant, manual-only) but is no longer triggered by the monthly cron, and the hub no longer shows a Category Pulse filter.

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `RESEARCH_INSIGHT_MIN_WORDS` | 3500 | Structural validator min word count |
| `RESEARCH_INSIGHT_MIN_SOURCES` | 6 | Min external citations |
| `RESEARCH_INSIGHT_MIN_H2` | 10 | Min H2 sections |
| `RESEARCH_GROUNDING_MAX_CALLS` | 4 | Grounding passes per report |
| `RESEARCH_INSIGHT_JUDGE` | `true` | Set `false` to disable the LLM quality judge |
| `RESEARCH_JUDGE_MIN_SCORE` | 72 | Min judge score (0–100) to publish |
| `RESEARCH_EDITION_BODY_THRESHOLD` | 0.5 | Body keyword overlap above this = duplicate |
| `RESEARCH_EDITION_H2_THRESHOLD` | 0.6 | H2 overlap above this = duplicate |
| `AUTOMATION_CRON_SECRET` | Required | Cron auth |

Generation takes **10–25 minutes** (cron timeout: 30 min).

## Admin

`/admin/insights` — list, edit, unpublish. Delete a report before regenerating the same month with `?force=true`.
