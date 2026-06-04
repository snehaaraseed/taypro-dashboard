# Pre-deploy checklist — CMS projects (129 workbook + 4 legacy)

Run on **local** first, then repeat on **production** `cms.sqlite` after backup (`scripts/deploy-cms-safe.sh`).

## One command (local)

```bash
npm run cms:prepare-deploy
```

Use `--skip-publish` if you want drafts for final admin click-through. Use `--dry-run` to print steps only.

## Production import (all draft)

After code + `content/handwritten-case-studies/` are on the server and the workbook is at `data/imports/Projects_Case_Studies_filled.xlsx`:

```bash
cd /var/www/taypro-dashboard
./scripts/deploy-cms-safe.sh stop
PROJECTS_XLSX=/var/www/taypro-dashboard/data/imports/Projects_Case_Studies_filled.xlsx \
CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite \
npm run cms:import-production-draft
./scripts/deploy-cms-safe.sh start
```

Re-run prepare only (no xlsx): `npm run cms:import-production-draft -- --skip-import`

Publish when QA is done: `CMS_SQLITE=... npm run cms:publish-projects`

## What the pipeline does

1. Seed `authors` from `scripts/author-profiles.json`
2. Apply all handwritten HTML to CMS `content`
3. Legacy four: Excel metadata (`--force-update --preserve-author`) then re-apply handwritten body
4. Deterministic `projects.author` per slug (same on local + prod if same pool)
5. Unpublish alias slugs; rename `-12-mw` / `-03-mw` → valid slugs
6. Rotate hero images
7. Dedupe repeated “Operations evidence summary” blocks; re-apply HTML
8. Product-accuracy pass
9. Publish all indexable English projects (125 after aliases held draft)
10. Verify word count + no client names

## Production

```bash
# On server after backup
CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite npm run cms:prepare-deploy
```

Deploy bundle: `data/cms.sqlite`, `content/handwritten-case-studies/`, app build with `next.config.ts` redirects.

Then:

```bash
CMS_TRANSLATE_BASE_URL=https://taypro.in CMS_TRANSLATE_SESSION="..." npm run cms:translate:projects
pm2 restart taypro-dashboard
```

## Held draft (not in sitemap)

- `akhadana-360-mw`, `bhadla-300-mw`, `apex-13-mw`, `hariwansh-07-mw` → 301 to canonical slugs
- `maharashtra-1-mw` → validate or delete in admin

## Still manual / post-v1

- **Translations** — after English publish
- **Place schema** — only 4 flagship slugs in `projectPlaceSchema.ts` (optional expansion)
- **Spot-check** 10–15 projects in `/admin/projects` before announcing
