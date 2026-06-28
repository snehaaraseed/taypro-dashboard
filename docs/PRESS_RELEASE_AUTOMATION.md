# Press Release Automation

Semi-automated press release pipeline for Taypro: AI drafts releases from a milestone queue, hosts them at `/press/releases/[slug]` with NewsArticle schema + RSS feed, and an admin tracker produces per-site pre-filled content for human submission while logging backlinks.

## Overview

| Step | What happens |
|------|----------------|
| 1. Queue | Add milestones to `data/press-release-queue.json` |
| 2. Generate | Cron or manual trigger calls `/api/automation/generate-press-release` |
| 3. Review | Human reviews draft in `/admin/press` |
| 4. Publish | Toggle publish → live at `/press/releases/{slug}` + RSS |
| 5. Submit | Copy per-site content from admin → paste into free PR sites |
| 6. Track | Log external URL + dofollow/nofollow status in submission matrix |

Backlinks come from **external sites** linking back to taypro.in — not from hosting the release alone.

## Setup

```bash
npm run cms:migrate-press
```

Requires existing env (no new vars):

- `AUTOMATION_CRON_SECRET` — cron auth
- `GEMINI_API_KEY` (+ optional `_2`…`_10`) — AI drafting
- `NEXT_PUBLIC_SITE_URL` — canonical URLs, RSS, sitemap

## Queue format

Topics can be added from **`/admin/press` → Add topic** (recommended) or by editing `data/press-release-queue.json` directly on the server.

```json
{
  "items": [
    {
      "id": "unique-key",
      "angle": "product_launch",
      "titleHint": "Headline suggestion",
      "summary": "One-line summary for AI context",
      "facts": ["Verified fact 1", "Verified fact 2"],
      "quoteAttribution": "Yogesh Kudale, Co-Founder & CEO, Taypro",
      "status": "pending"
    }
  ]
}
```

Angles: `product_launch`, `milestone`, `award`, `partnership`, `deployment`.

After generation, item `status` becomes `done`.

## Manual trigger

```bash
curl -X POST http://localhost:3000/api/automation/generate-press-release \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

Status:

```bash
curl http://localhost:3000/api/automation/generate-press-release \
  -H "Authorization: Bearer $AUTOMATION_CRON_SECRET"
```

Options:

- `?queueId=mds-launch-2026` — specific queue item
- `?force=true` — regenerate (only if no existing release for that queue key, or delete first)

## Submission targets

Curated outlets in `data/press-targets.json` (solar trade press + free PR directories). Each target defines:

- `submitUrl` / `emailTo`
- `fields` — which release fields to map (`title`, `summary`, `body`, etc.)
- `dofollow` — expected backlink type (verify manually)

Edit this file to add/remove targets. Restart not required (loaded per request).

## Admin workflow

1. Open `/admin/press`
2. Click **Add topic** — fill headline hint, summary, verified facts (one per line), angle
3. Click **Generate** on that row (or **Generate next** for FIFO)
4. Review draft → **Edit** if needed → **Publish**
5. Expand **Submissions** → **Copy** per site → paste and submit externally
6. Log **external URL** + backlink type when live

To run a topic again after it was generated, click **Requeue** (note: generation is blocked if a release already exists for that queue id unless you delete the old release first).

**Export all** copies a text bundle for every target at once.

## Public URLs

| URL | Purpose |
|-----|---------|
| `/press` | Hub (announcements + third-party coverage) |
| `/press/releases/{slug}` | Official release (NewsArticle schema) |
| `/feed/press.xml` | RSS for PR aggregators |

Submit the RSS URL when PR sites ask for a feed.

## Cron (production)

```bash
bash scripts/install-press-release-cron.sh
```

Runs daily at 08:00 server time. No-ops when queue is empty.

Log: `$ROOT/logs/press-cron.log` (override: `PRESS_CRON_LOG`).

## What is NOT automated

- Form submission to external PR sites (CAPTCHA, ToS, bot detection)
- Daily spam releases — queue is milestone/event driven only

## Measuring ROI

In `/admin/press`, the header shows **live backlinks** count (submissions with `status: live`). Each live row should have an `externalUrl` you can audit in GSC or Ahrefs later.
