# Deployment Content Preservation

**Status:** Configured for CMS database + upload gallery

## Single deploy command

```bash
./deploy.sh              # routine
./deploy.sh --fast       # routine (skip npm install when lockfile unchanged)
./deploy.sh --swap-only  # re-swap after a failed cutover
```

**Do not run** `scripts/deploy-cms-safe.sh` directly — it is an internal helper.

## What is protected

| Asset | How |
|-------|-----|
| `data/cms.sqlite` | Never rsync'd from laptop; staging build **symlinks** live DB |
| `public/uploads/` | Never rsync'd from laptop; staging build **symlinks** live gallery |
| GSC OAuth tokens / boost JSON | Excluded from rsync unless `DEPLOY_UPLOAD_GSC_FROM_LOCAL=1` |
| `.env.production` | Never rsync'd; patched on server via `patch-production-gsc-env.sh` |

## How `./deploy.sh` works (zero-downtime)

1. **CMS baseline** — save blog/project/author/gallery counts (site stays live)
2. **Rsync code** — excludes DB, uploads, secrets, env
3. **Staging build** in `.release-build/` — symlinks to live `cms.sqlite` + `uploads`
4. **Atomic swap** (~10s) — branded 503 maintenance page, PM2 cutover, metrics assert, rollback on failure

Site stays **fully live** during sync and build (~6–15 min). Users only see maintenance during the swap window.

## Verification after deploy

```bash
ssh ubuntu@13.204.129.120 "sqlite3 /var/www/taypro-dashboard/data/cms.sqlite \"SELECT locale, COUNT(*) FROM blogs GROUP BY locale;\""
ssh ubuntu@13.204.129.120 "find /var/www/taypro-dashboard/public/uploads -type f | wc -l"
```

Server should also have `/tmp/taypro-cms-metrics-before.json` and matching counts after swap.
