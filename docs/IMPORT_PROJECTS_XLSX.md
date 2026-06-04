# Import project case studies from Excel

Bulk-import utility-scale case studies from `Projects_Case_Studies_filled.xlsx` into `data/cms.sqlite` as **English drafts** (`published = 0`). Each case study is **editorial HTML** (~1,200–2,000 words): a short site snapshot, environment, challenge, deployment, operations, results, and closing (`h2`/`h3` only; the page template supplies the title `h1`). No repetitive filler blocks.

**Content source:** copy is assembled in Node by `scripts/lib/project-html-builder.mjs` from your Excel row data (location, MW, soiling, robots, outcomes, metrics, etc.). This path does **not** call Gemini or any other AI API. For one-off AI drafts, use `/admin/projects/generate` separately—that is unrelated to this importer.

## Prerequisites

- Workbook path (default: `~/Downloads/Projects_Case_Studies_filled.xlsx` or set `PROJECTS_XLSX`)
- Local or server `data/cms.sqlite` with CMS migrations applied (`projects.author` column — migration `0008_project_author.sql`)
- Authors seeded in `authors` table (`/admin/authors`) for random bylines

## Commands

```bash
# Preview first 5 rows (no DB writes)
npm run cms:import-projects-xlsx -- --dry-run --limit 5

# Full local import (skips existing English slugs)
PROJECTS_XLSX=/path/to/Projects_Case_Studies_filled.xlsx npm run cms:import-projects-xlsx

# Overwrite existing legacy projects (Agar, Banda, Soyegaon, Yadgir) and matching slugs
npm run cms:import-projects-xlsx -- --force-update

# Single slug test
npm run cms:import-projects-xlsx -- --dry-run --slug agar-solar-project
```

Report written to `data/import-projects-report.json`.

## Production workflow

1. **Backup CMS DB** on the server (`scripts/deploy-cms-safe.sh` snapshot before deploy/import).
2. Copy workbook to server, e.g. `data/imports/Projects_Case_Studies_filled.xlsx`.
3. **Dry-run** on server copy or staging DB:
   ```bash
   PROJECTS_XLSX=/var/www/taypro-dashboard/data/imports/Projects_Case_Studies_filled.xlsx \
   CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite \
   npm run cms:import-projects-xlsx -- --dry-run --limit 5
   ```
4. **Full import** (drafts):
   ```bash
   PROJECTS_XLSX=/var/www/taypro-dashboard/data/imports/Projects_Case_Studies_filled.xlsx \
   CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite \
   npm run cms:import-projects-xlsx
   ```
5. **Admin QA**: review drafts at `/admin/projects` — check overview chips, category tags (`Automatic`, `Semi-Automatic`, `Capex`), hero image, no client names in body.
6. **Publish** projects from admin when ready.
7. **Translate** published projects:
   ```bash
   CMS_TRANSLATE_BASE_URL=https://taypro.in CMS_TRANSLATE_SESSION="admin-auth=..." \
   npm run cms:translate:projects
   ```
8. **Revalidate**: restart PM2 or redeploy so ISR picks up new `/projects/{slug}` pages.

## Pre-deploy bundle

```bash
npm run cms:prepare-deploy
```

See `docs/PRE-DEPLOY-CHECKLIST.md` for slug cleanup, redirects, publish, and author alignment.

## Behaviour

- **Deterministic copy only** — long-form HTML from the import script; not Gemini-generated.
- **Per-site uniqueness** — each case study is built from that row’s fingerprint (location, MW, fleet counts, metrics, systems). Repeated Excel phrases are rewritten per site; unique Excel fields are expanded into dedicated paragraphs. Section titles include the plant name.
- **No client names** anywhere public: title, description, HTML body, image alt, detail chips. Full IPP names + curated tokens are stripped; mis-tagged place names in the client column (e.g. Nashik) are **not** removed from copy. Run `npm run cms:verify-projects-no-clients` after import.
- **Title**: `{Location} – {MW} MW` (page H1); body uses **h2/h3 only**.
- **Authors**: random pick from eligible CMS authors (same pool as blog automation).
- **Images**: scored rotation from `public/tayproasset`, `public/tayprorobots`, uploads, OG presets.
- **Legacy slugs**: Agar, Banda, Soyegaon, Yadgir map to existing slugs; skipped unless `--force-update`.
- **Authors**: Import assigns by **slug hash** from the `authors` table (excludes Taypro Team / Suraj). Local DBs with only `Yogesh` in `authors` will set every project to Yogesh—run `npm run cms:seed-authors` then `npm run cms:assign-project-authors` on **both** local and production for a matching roster. Use `--preserve-author` on import if you must not overwrite production bylines.

## Flags

| Flag | Effect |
|------|--------|
| `--dry-run` | Build report only, no SQLite writes |
| `--limit N` | Process first N data rows |
| `--force-update` | UPDATE existing `en` rows instead of skip |
| `--preserve-author` | With `--force-update`, keep existing `projects.author` (use when refreshing copy only) |
| `--strict` | Fail row if client token remains after sanitize |
| `--slug name` | Process only rows that resolve to this slug |
