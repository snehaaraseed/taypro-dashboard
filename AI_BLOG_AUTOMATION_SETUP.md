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

**Blog writer** — max **1 published post per day**, at a **random time between 9:00 AM and 3:00 PM IST**. Each run: picks an **SEO keyword** (CSV queue) → **category** matched to that keyword → **CMS author** best matched to keyword + category via **expertise tags** (set in `/admin/authors`, or inferred from role/bio) → Gemini proposes **5 titles** (code picks one unique) → writes the post in that author’s voice (`published: true`).

**Translations** — run in the **evening** (after the writer window), up to 10 published blogs (hi/ar/ja/bn). New posts are not translated immediately on publish.

Set in `.env.production`:

```
BLOG_AUTOMATION_MIN_DAYS=1
BLOG_TRANSLATION_MAX_PER_DAY=10
GEMINI_CALL_DELAY_MS=5000
```

**Rate limits:** Blog and translations use `gemini-3.1-flash-lite` by default. After every Gemini `generateContent` call the app waits **`GEMINI_CALL_DELAY_MS`** (default **5 seconds**) to stay under free-tier **15 RPM**. Set `GEMINI_CALL_DELAY_MS=0` to disable. A full evening run (10 blogs × 4 locales × 2 calls ≈ 80 API calls) adds on the order of **~7–8 minutes** of delay-only wait, plus API time (~1.5–2 h total cron time is normal).

**Server crontab (host clock is UTC; use explicit UTC offsets — `CRON_TZ` in user crontab is ignored on some Ubuntu images):**

```bash
# Blog writer: random 9:00–15:00 IST (IST = UTC+5:30)
30,35,40,45,50,55 3 * * * /var/www/taypro-dashboard/scripts/cron-generate-blog.sh
*/5 4-8 * * * /var/www/taypro-dashboard/scripts/cron-generate-blog.sh
0,5,10,15,20,25,30 9 * * * /var/www/taypro-dashboard/scripts/cron-generate-blog.sh

# Translations: 18:00 IST = 12:30 UTC
30 12 * * * /var/www/taypro-dashboard/scripts/cron-translate-blogs-daily.sh
```

The bash script still sets `TZ=Asia/Kolkata` for the random 9:00–15:00 window and daily cap checks.

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

Keeps **8 weekly** compressed rotations (`copytruncate`, `su ubuntu ubuntu`).

### CMS blog translations (daily only, max 10 blogs)

Published English blogs are translated into **hi, ar, ja, bn** once per day:

- **`BLOG_TRANSLATION_MAX_PER_DAY`** (default `10`) — max published EN blogs per run (safe for 500 RPD / 15 RPM free tier with `GEMINI_CALL_DELAY_MS=5000`)
- Each selected blog is translated into **all missing** target locales in one pass
- If **Gemini quota** is exceeded, the run **stops for the day**; remaining blogs are picked up on the next cron (no hourly retries)

From the app directory after deploy:

```bash
npm run cms:translate-blogs-daily
```

**Manual trigger:**

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
2. Check log: `tail -50 /var/www/taypro-dashboard/logs/blog-translation-daily.log`
3. If you see `Permission denied` on `/var/log/blog-translation-daily.log`, deploy the latest `cron-translate-blogs-daily.sh` (uses `logs/` under the app).
4. Manual test: `npm run cms:translate-blogs-daily`

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
