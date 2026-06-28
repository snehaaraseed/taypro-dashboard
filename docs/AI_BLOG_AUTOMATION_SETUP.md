# AI Blog Automation System - Setup & Usage Guide

## Overview

This system automatically generates unique, SEO-optimized blog posts daily about solar panel cleaning robots and solar power plant operations & maintenance. Generated blogs are **published automatically** (English live). Review in `/admin/blogs` and edit or unpublish if needed.

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   The `GEMINI_API_KEY` has been added to `.env.local`. Make sure it's set:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   AUTOMATION_CRON_SECRET=long-random-secret-for-cron-only
   # Optional: pause after each Gemini text call (default 5000 ms; 0 = off). Helps 15 RPM free tier.
   GEMINI_CALL_DELAY_MS=5000
   # Text models: FREE TIER ONLY (see src/lib/gemini/free-tier-models.ts)
   # GEMINI_BLOG_MODEL=gemini-3.1-flash-lite
   # GEMINI_BLOG_RETRY_MODEL=gemini-3.1-flash-lite-preview
   # GEMINI_TRANSLATION_MODEL=gemini-3.1-flash-lite
   # Optional: global minimum body word count (overrides tier floors — leave unset for tier-based defaults)
   # BLOG_MIN_WORD_COUNT=1800
   # Author byline: rotate (default hybrid), expertise, or random
   # BLOG_AUTHOR_PICK=rotate
   # BLOG_AUTHOR_ROTATE_DAYS=7
   # Images: default library (no paid Imagen). Paid AI heroes only if you opt in:
   # BLOG_IMAGE_MODE=hybrid
   # BLOG_IMAGE_ALLOW_PAID=true
   ```

## Usage

### Manual Trigger

**Generate a blog manually:**
```bash
curl -X POST http://localhost:3000/api/automation/generate-blog \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

**Check if blog created today:**
```bash
curl http://localhost:3000/api/automation/generate-blog
```

### Automated daily schedule (production)

**Blog writer** — max **1 published post per IST calendar day**, at a **random time between 9:00 AM and 3:00 PM IST**. Yesterday’s publish time does not block today’s run. Each run: picks an **SEO keyword** (`data/seo-blog-queue.json` first, then `data/seo-gsc-boost.json`, then scored CSV pool) → **category** matched to that keyword → **CMS author** best matched to keyword + category via **expertise tags** (set in `/admin/authors`, or inferred from role/bio) → Gemini proposes **5 titles** (code picks one unique) → writes the post in that author’s voice → **structure validation** (Quick answer H2, PAA H2, word count, FAQs, comparison tables) with up to **3 attempts** (retry uses outline pass + alternate **free** model ID) → (`published: true`).

**Word-count tiers** (automation; leave `BLOG_MIN_WORD_COUNT` unset on prod):

| Tier | Min words | Target | When |
|------|-----------|--------|------|
| **pillar** | 1,800 | 2,000–2,400 | Comparison/cost/vendor angles, Tier B keywords (5k+ vol or brush/washing clusters) |
| **standard** | 1,200 | 1,400–1,800 | Default O&M bridge posts |
| **narrow** | 900 | 1,000–1,400 | Frequency guides, checklists, Tier C long-tail (50 vol bucket) |

Tier is resolved from editorial `angleId`, GSC volume/competition, and keyword patterns. Verify with `npm run seo:test-word-count-tier`.

**Author rotation (default):** `BLOG_AUTHOR_PICK=rotate` skips authors who bylined a post in the last `BLOG_AUTHOR_ROTATE_DAYS` (default 7) when an expertise match exists. Among equally qualified authors (same expertise tier), automation prefers whoever has the **fewest published English posts** so bylines stay balanced over time.

**Models (v2 — Gemma only):** Blog, translation, project improve, and **Search grounding (SERP/facts/discovery)** all use **`gemma-4-31b-it`** (retry: **`gemma-4-26b-a4b-it`**). Gemma 4 supports the `googleSearch` grounding tool via the Gemini API at the **1,500 RPD/key** free tier, so grounding is no longer throttled by the ~20 RPD Gemini 2.5 Flash ceiling. Gemini Flash is not used in automation.

```
GEMINI_API_KEY=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_BLOG_MODEL=gemma-4-31b-it
GEMINI_BLOG_RETRY_MODEL=gemma-4-26b-a4b-it
GEMINI_TRANSLATION_MODEL=gemma-4-31b-it
GEMINI_TRANSLATION_RETRY_MODEL=gemma-4-26b-a4b-it
BLOG_PIPELINE_MAX_OUTER_ATTEMPTS=2
BLOG_HYBRID_FALLBACK_ATTEMPTS=0
BLOG_CRON_MAX_FAIL_POSTS=3
GEMINI_RESERVED_GEMMA_CALLS_BLOG=40
```

**Editorial calendar:** `npm run seo:generate-editorial-calendar` writes `data/editorial-calendar.json` (90 days). Weekly cron: `taypro-editorial-calendar` (Sunday 02:00 IST).

**Persistent state:** `.runtime/blog-cron/editorial-state.json` stores cross-cron rejections. **Evergreen fallback:** `data/evergreen-fallback-catalog.json` when primary+backup fail.

**Models:** All text generation uses **Google AI Studio free tier** Gemma 4 (`gemma-4-31b-it` / `gemma-4-26b-a4b-it`). Paid model IDs in env are ignored with a console warning.

**GSC closed loop (recommended):** Weekly `POST /api/automation/sync-gsc` pulls Search Console query data and refreshes `data/seo-gsc-boost.json` + `data/gsc-latest-report.json`. Setup: `docs/GSC_API_CLOSED_LOOP.md`. On production after deploy: `npm run ops:install-gsc-cron` (or `bash scripts/install-gsc-sync-cron.sh`). Logs: `logs/gsc-sync.log`. Manual fallback: paste queries into `seo-gsc-boost.json` `keywords` array.

**Translations** — run in the **evening** (after the writer window), up to 10 published blogs (hi/ar/ja/bn). Queue prioritizes **newest English posts first** (by `publishDate`). English posts are already structure-validated at publish; locale copies only get light sanity checks (non-empty fields, FAQ count).

Set in `.env.production`:

```
BLOG_AUTOMATION_MIN_DAYS=1
BLOG_TRANSLATION_MAX_PER_DAY=10
GEMINI_CALL_DELAY_MS=5000
```

**Rate limits:** Blog and translations use `gemini-3.1-flash-lite` by default. After every Gemini `generateContent` call the app waits **`GEMINI_CALL_DELAY_MS`** (default **5 seconds**) to stay under free-tier **15 RPM**. Set `GEMINI_CALL_DELAY_MS=0` to disable. A full evening run (10 blogs × 4 locales × 2 calls ≈ 80 API calls) adds on the order of **~7–8 minutes** of delay-only wait, plus API time (~1.5–2 h total cron time is normal).

**Blog writer retries (validation / Gemini quality):**

| Env | Default | Purpose |
|-----|---------|---------|
| `BLOG_PIPELINE_MAX_OUTER_ATTEMPTS` | `3` | New topic/contract tries when validation or uniqueness rejects a draft (production should keep ≥3) |
| `BLOG_PIPELINE_MAX_INPLACE_EXPANSIONS` | `4` | In-place expand/append passes when the draft is too short before validation |
| `BLOG_CRON_MAX_FAIL_POSTS` | `2` | Failed cron POSTs before giving up for the day |

Structure validation failures (too short, missing H2s/links) now trigger a **new outer attempt** with a different editorial contract — not a single fail-and-stop.

**Blog writer schedule**

| Setting | Default | Purpose |
|---------|---------|---------|
| `GEMINI_QUOTA_SOFT_START_MINUTES` | `30` | Writer starts at **00:30 Pacific** (~**1:00 PM IST**) after RPD reset at midnight PT (~12:30 IST) |
| `GEMINI_GROUNDING_MODEL` | `gemma-4-31b-it` | Search grounding (SERP + facts + discovery) via Gemma 4 googleSearch tool (~1,500 RPD/key) |
| `GEMINI_BLOG_MODEL` | `gemma-4-31b-it` | Plan, sections, FAQ, expand, repair (~1500 RPD/key) |
| `GEMINI_TRANSLATION_MODEL` | `gemma-4-31b-it` | CMS translation + project improve (shared Gemma pool after blog done) |
| `GEMINI_SERP_MAX_CALLS_PER_BLOG` | `2` | Max grounding calls per blog (1 SERP + 1 fact) |
| `BLOG_RANK_JUDGE` | `true` | Gemma LLM-as-judge rank-readiness gate after the heuristic scorecard. Set `false` to disable. Fail-safe: if the judge call errors, it never blocks publishing. |
| `BLOG_JUDGE_MIN_SCORE` | `70` | Minimum judge score (0-100) to publish. Drafts below this are rejected and retried with the next brief. |
| `BLOG_INLINE_CITATIONS` | `true` | Add grounded inline citations + a "Sources and further reading" section from Google Search grounding. Set `false` to disable. |

When grounding RPD is hit, the blog **continues without live SERP/facts** (fallback brief). The LLM-judge and inline citations both degrade gracefully (judge fails open; citations append only what grounding returned, or skip). Cron `quotaExhausted` hold applies only when the **Gemma text-model** quota is exhausted.

**Quality pipeline (post-draft, before publish):** uniqueness gates → heuristic rank-readiness scorecard → **Gemma LLM-judge** (vs. live SERP context) → **inline grounded citations** → images → schedule. Judge/citation failures are retryable (`Rank-readiness gate failed` → new brief).

**Server crontab:**

```bash
# Blog writer + translation recovery (00:30 Pacific soft start in cron-generate-blog.sh)
*/5 * * * * /var/www/taypro-dashboard/scripts/cron-generate-blog.sh

# Scheduled publish (separate installer)
# ... install-scheduled-publish-cron.sh

# GSC boost refresh: Monday 06:30 IST = 01:00 UTC
0 1 * * 1 /var/www/taypro-dashboard/scripts/cron-sync-gsc-boost.sh
```

Re-install after deploy: `bash scripts/install-blog-automation-cron.sh`

After deploy, run once if needed: `npm run cms:sync-published-topics` (adds `published_topics.h2_outline` / `content_fingerprint`).

**Cron logs**

| Log | Default path |
|-----|----------------|
| Blog writer | `/var/log/blog-automation.log` (override: `BLOG_AUTOMATION_LOG`) |
| Translations | `$ROOT/logs/blog-translation-daily.log` (override: `BLOG_TRANSLATION_LOG`) |

Do **not** use `/var/log/blog-translation-daily.log` unless the file exists and `ubuntu` can write to it (Permission denied breaks the cron).

**Log rotation (production)** — nginx rotates automatically; Taypro cron + PM2 logs do not unless you install:

```bash
cd /var/www/taypro-dashboard
npm run ops:install-logrotate   # installs scripts/logrotate/taypro.conf → /etc/logrotate.d/taypro
```

Keeps **7 daily** compressed rotations (`copytruncate`, `su ubuntu ubuntu`).

### CMS blog translations (daily only, max 10 items)

Published English blogs/projects are translated into **hi, ar, ja, bn** once per day:

- **`CMS_TRANSLATION_MAX_PER_DAY`** / **`BLOG_TRANSLATION_MAX_PER_DAY`** (default `10`) — max items per run (safe for 500 RPD / 15 RPM free tier with `GEMINI_CALL_DELAY_MS=5000`)
- Cron **fire-and-forgets** a background worker (`scripts/run-daily-cms-translations.ts`) — not limited by HTTP/curl timeouts
- Each queue item retries until **all locales succeed**; the run advances to the next item only after completion (or a permanent source error)
- The run **stops early only when Gemini quota is exceeded**; otherwise it processes the full daily queue (up to 10)
- Structured JSON lines are appended to `$ROOT/logs/blog-translation-daily.log` (`worker_start`, `item_completed`, `item_quota_stop`, `worker_done`, …)

From the app directory after deploy:

```bash
# Same as cron — dispatches background worker
npm run cms:translate-blogs-daily

# Foreground (blocks until done; useful for debugging)
CMS_TRANSLATION_FOREGROUND=1 npm run cms:translate-blogs-daily

# Run worker directly
npm run cms:translate-blogs-daily:worker
```

**Legacy HTTP trigger** (can time out on long runs — prefer worker above):

```bash
curl -X POST "http://127.0.0.1:3000/api/automation/retry-translations" \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

Translation log: `$ROOT/logs/blog-translation-daily.log` (see table above).

## Workflow

1. **Automation runs** → Blog generated and **published** (`published: true`, English live)
2. **You review daily** → Check `/admin/blogs` or the live post; edit, unpublish, or delete if needed
3. **Evening cron** → Translates up to 10 published posts missing locale versions

## Testing

### Test Topic Generation

```bash
# Test the endpoint
curl -X POST http://localhost:3000/api/automation/generate-blog \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "message": "Blog generated successfully and saved as draft",
  "blog": {
    "title": "...",
    "slug": "...",
    "url": "/blog/...",
    "adminUrl": "/admin/blogs",
    "status": "draft",
    "category": "..."
  }
}
```

### Verify Draft Creation

1. Go to `/admin/blogs`
2. Look for the newly created blog (should show as draft)
3. Review content, title, and description
4. Edit if needed
5. Publish when ready

### Test Uniqueness

The system prevents duplicate topics and near-duplicate drafts by:
- Tracking automation history in SQLite `published_topics` (title, slug, SEO keyword, H2 outline, content fingerprint)
- Cross-checking all English CMS blogs (drafts included)
- Title/slug overlap, meta description similarity, H2 outline overlap, keyword similarity, and content fingerprint match
- Retrying up to 3 times when content is too generic or too similar

**Backfill topic metadata from existing blogs:**
```bash
node scripts/sync-published-topics.mjs
```

Optional tuning via environment variables:
- `BLOG_SIMILARITY_THRESHOLD` (default `0.52`)
- `BLOG_H2_OVERLAP_THRESHOLD` (default `0.60`)

## File Structure

```
taypro-dashboard/
├── data/
│   └── cms.sqlite                     # published_topics + blogs tables
├── scripts/
│   └── sync-published-topics.mjs      # Backfill topic tracking metadata
├── src/
│   ├── lib/
│   │   ├── aiService.ts               # Gemini API integration
│   │   ├── cms/topicService.ts        # published_topics tracking
│   │   ├── seo/blog-knowledge-context.ts  # Product KB + proof stats + llms.txt + related posts
│   │   ├── seo/blog-similarity.ts     # H2/fingerprint/keyword similarity
│   │   ├── seo/blog-uniqueness.ts     # Pre-save duplicate gate
│   │   ├── topicCategories.ts         # Predefined topic categories
│   │   ├── topicTracker.ts            # Re-exports topicService
│   │   └── productKnowledge.ts        # Product specs (prevents hallucinations)
│   └── app/
│       └── api/
│           └── automation/
│               └── generate-blog/
│                   └── route.ts       # Main automation endpoint
└── .env.local                          # Contains GEMINI_API_KEY
```

## Configuration

### Topic Categories

Edit `src/lib/topicCategories.ts` to:
- Add new categories
- Modify existing categories
- Update keywords

### Product Knowledge Base

Edit `src/lib/productKnowledge.ts` to:
- Update product specifications
- Add new products/services
- Ensure accuracy (prevents AI hallucinations)

**Live knowledge pack (Phase 1):** Each generation also loads:
- `TAYPRO_PUBLIC_PROOF` from `src/lib/marketing/public-proof-stats.ts` (homepage-aligned stats)
- Trimmed `public/llms.txt` (site routes and positioning)
- Short excerpts from 2 most relevant **published** English blogs (consistency, not copying)

Update proof stats in `public-proof-stats.ts` when marketing numbers change; `llms.txt` when major routes/products change.

### AI Overview / snippet structure (blog posts)

Prompt rules live in `src/lib/seo/content-quality.ts` (`AI_OVERVIEW_SNIPPET_RULES`) and are injected in `generateBlogContent` (`src/lib/aiService.ts`):

- **Answer-first** opening paragraph after a short intro
- **Quick answer** H2 with 3–5 specific bullets
- **Question-shaped H2** with a direct answer paragraph (not a full FAQ section in HTML)
- **JSON `faqs`** for `FAQPage` schema; `faqs[0]` must align with the Quick answer
- **Comparison intent** (from Keyword Planner): mandatory HTML `<table>` via `formatSeoPromptBlock` in `src/lib/seo/keyword-stats.ts`

Topic titles bias toward People Also Ask patterns (X vs Y, how often, how much, is it worth it).

### Author expertise matching

1. Tag each author in **`/admin/authors`** (expertise lanes) or run `npm run cms:backfill-author-expertise` after deploy.
2. Automation plan: `src/lib/cms/blog-automation-context.ts` (`planBlogAutomation`).
3. Matching logic: `src/lib/cms/blog-author-expertise.ts` (keyword + category → tags → best author).

## Troubleshooting

### Translations Not Running (cron)

1. Confirm crontab: `30 12 * * * .../cron-translate-blogs-daily.sh` (18:00 IST).
2. Check log: `tail -100 /var/www/taypro-dashboard/logs/blog-translation-daily.log` — look for `DISPATCHED`, `worker_start`, `item_completed`, `worker_done`.
3. If you see `skip` / `already_running`, a previous worker is still running (normal on long runs).
4. If you see `curl: (52)` or `curl: (28)`, deploy the latest cron script (uses background worker, not HTTP).
5. Foreground debug: `CMS_TRANSLATION_FOREGROUND=1 npm run cms:translate-blogs-daily`

### Blog Not Generating

1. **Check API Key:**
   ```bash
   echo $GEMINI_API_KEY  # Should show the key
   ```

2. **Check Logs:**
   - Server logs will show errors
   - Check console for "Error in POST /api/automation/generate-blog"

3. **Verify Endpoint:**
   ```bash
   curl http://localhost:3000/api/automation/generate-blog
   ```

### Duplicate Topics

- System automatically retries if duplicates or near-duplicates are detected
- Inspect `published_topics` in `data/cms.sqlite` or run `node scripts/sync-published-topics.mjs`
- Lower `BLOG_SIMILARITY_THRESHOLD` if legitimate posts are rejected too often

### Content Quality Issues

- Review generated drafts before publishing
- Edit content in admin panel if needed
- Tune shared rules in `src/lib/seo/content-quality.ts` and `src/lib/aiService.ts` if necessary

## Security Notes

- The automation endpoint is publicly accessible
- Consider adding API key authentication for production
- Or restrict access via firewall/nginx rules

## Future Enhancements

- Email notification when draft is created
- Content quality scoring
- A/B testing different prompts
- Image generation/selection
- Multi-language support

## Support

For issues or questions:
1. Check server logs
2. Review `published_topics` in `data/cms.sqlite`
3. Test endpoint manually
4. Verify environment variables
