# Google Search Console closed loop (weekly)

Blog automation can **read real Search Console performance** and refresh `data/seo-gsc-boost.json` so the writer prioritizes queries you already rank for (striking distance, low CTR, high impressions).

## What it does

1. **Weekly cron** calls `POST /api/automation/sync-gsc`
2. Service account pulls **query** dimension (last 28 days by default)
3. Scores Taypro-relevant queries (same filters as keyword CSV)
4. Writes:
   - `data/seo-gsc-boost.json` → `keywords[]` for `pickSeoKeywordBrief()`
   - `data/gsc-latest-report.json` → full snapshot for editorial prompts
5. Next blog runs: **queue → GSC boost → random pool**, and Gemini sees top GSC lines in `formatEditorialContextPrompt()`

This is **closed-loop feedback** without paid SEO tools. It does **not** auto-rewrite old posts (only steers **new** topics).

## One-time setup

### 1. Google Cloud

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select project  
2. **APIs & Services → Enable APIs** → enable **Google Search Console API**  
3. **IAM → Service Accounts** → Create → JSON key → download (keep secret)

### 2. Search Console access

1. [Search Console](https://search.google.com/search-console) → your property (`https://taypro.in/` or `sc-domain:taypro.in`)  
2. **Settings → Users and permissions → Add user**  
3. Add the service account email (`....@....iam.gserviceaccount.com`) as **Full** or **Restricted** (Restricted is enough for read-only API)

### 3. Environment (production)

```bash
# Exact site URL as shown in GSC → Settings (copy property URL)
GSC_SITE_URL=sc-domain:taypro.in

# Path to downloaded JSON key (do not commit the file)
GSC_SERVICE_ACCOUNT_PATH=/var/www/taypro-dashboard/secrets/gsc-service-account.json

# Optional tuning
GSC_LOOKBACK_DAYS=28
GSC_MIN_IMPRESSIONS=15
GSC_BOOST_MAX_KEYWORDS=15
```

Alternative: inline JSON (avoid on disk):

```bash
GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

Add the key file to `.gitignore` if stored under the repo.

### 4. Test

```bash
curl -s -H "Authorization: Bearer $AUTOMATION_CRON_SECRET" \
  http://localhost:3000/api/automation/sync-gsc

curl -X POST -H "Authorization: Bearer $AUTOMATION_CRON_SECRET" \
  http://localhost:3000/api/automation/sync-gsc
```

Check `data/seo-gsc-boost.json` and `data/gsc-latest-report.json`.

## Weekly cron (server)

```bash
# Monday 06:30 IST (UTC crontab example — adjust for your host)
30 1 * * 1 /var/www/taypro-dashboard/scripts/cron-sync-gsc-boost.sh
```

Or add to `package.json` locally:

```bash
npm run gsc:sync   # if wired; production uses curl script above
```

## Manual fallback

If API is not set up, you can still paste queries into `data/seo-gsc-boost.json` under `keywords` (unchanged).

## Limits

| Topic | Note |
|--------|------|
| **Lag** | GSC data is often 2–3 days behind; sync uses end date = today − 3 days |
| **Not indexing API** | This does not submit URLs; use GSC UI or Indexing API separately |
| **No auto-edit** | Existing posts are not rewritten; only **new** blog keyword choice improves |
| **Property match** | `GSC_SITE_URL` must match the GSC property string exactly |

## Security

- Never commit service account JSON  
- Use the same `AUTOMATION_CRON_SECRET` as blog cron  
- Scope is read-only: `webmasters.readonly`
