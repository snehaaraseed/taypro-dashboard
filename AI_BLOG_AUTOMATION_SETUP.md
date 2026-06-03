# AI Blog Automation System - Setup & Usage Guide

## Overview

This system automatically generates unique, SEO-optimized blog posts daily about solar panel cleaning robots and solar power plant operations & maintenance. Generated blogs are saved as **drafts** for manual review before publishing.

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

### Automated Daily Execution

#### Option 1: Server Cron Job (Recommended)

If you have SSH access to your server:

1. **Edit crontab:**
   ```bash
   crontab -e
   ```

2. **Add daily job (runs at 9 AM):**
   ```bash
   0 9 * * * curl -X POST https://taypro.in/api/automation/generate-blog -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
   ```

3. **Or with logging:**
   ```bash
   0 9 * * * curl -X POST https://taypro.in/api/automation/generate-blog -H "Authorization: Bearer $AUTOMATION_CRON_SECRET" >> /var/log/blog-automation.log 2>&1
   ```

#### Option 2: External Cron Service

Use services like:
- **cron-job.org** (free tier available)
- **EasyCron**
- **UptimeRobot** (monitoring + cron)

**Setup:**
1. Create account on chosen service
2. Add new cron job
3. URL: `https://taypro.in/api/automation/generate-blog`
4. Method: POST with header `Authorization: Bearer <AUTOMATION_CRON_SECRET>`
5. Schedule: Daily at your preferred time (e.g., 9:00 AM)

#### Option 3: Vercel Cron (if deployed on Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/automation/generate-blog",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### CMS translation auto-resume (hourly)

When Gemini quota is exceeded, failed blog/project locales are stored in `translation_queue` and retried automatically.

**Server cron (recommended):**

```bash
# Every hour — drain up to 8 pending locale jobs per run
0 * * * * /var/www/taypro-dashboard/scripts/cron-retry-translations.sh
```

Or from the app directory after deploy:

```bash
npm run cms:retry-translations
```

**Manual trigger:**

```bash
curl -X POST "https://taypro.in/api/automation/retry-translations?reconcile=true" \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

`?reconcile=true` also enqueues any published posts that are missing translations. Logs: `/var/log/translation-queue.log`.

## Workflow

1. **Automation runs** → Blog generated and saved as draft (`published: false`)
2. **You review** → Check the blog in `/admin/blogs` (drafts are visible)
3. **You edit if needed** → Update title, description, or content
4. **You publish** → Change `published: true` in admin panel
5. **Blog goes live** → Visible on public blog listing

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

## Troubleshooting

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
- Update prompts in `src/lib/aiService.ts` if necessary

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
