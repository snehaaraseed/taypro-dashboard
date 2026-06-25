# Taypro marketing dashboard

Next.js 16 app for [taypro.in](https://taypro.in) — product pages, CMS (blogs/projects), SEO automation, and admin.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common commands

| Command | Purpose |
|---------|---------|
| `npm run validate` | i18n, image audit, ROI/SEO tests, TypeScript, lint |
| `npm run build` | Production build |
| `./deploy.sh` | Production deploy — zero-downtime, CMS-safe (see `docs/DEPLOYMENT_CONTENT_PRESERVATION.md`) |
| `npm run cms:deploy-prep` | Pre-deploy CMS checks |
| `npm run cms:deploy-prep` | Pre-deploy CMS checks |
|cd /tmp/siteone-crawler && ./siteone-crawler \
  --url=https://taypro.in/ \
  --extra-columns='Title(60),Description(80),Keywords(40)' \
  --show-inline-criticals \
  --show-inline-warnings \
  --result-storage=file \
  --output-html-report='/Users/yogesh/TayproWebsite/taypro-dashboard/seo-audit-inputs/siteone-full-report.html' \
  --output-json-file='/Users/yogesh/TayproWebsite/taypro-dashboard/seo-audit-inputs/siteone-full-report.json' \
  --output-text-file='/Users/yogesh/TayproWebsite/taypro-dashboard/seo-audit-inputs/siteone-full-report.txt' |  ``` SiteOne SEO audit command |
## Documentation

See **[docs/README.md](./docs/README.md)** for SEO, deploy, GSC, blog automation, and CMS guides.

## Layout

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js routes and components |
| `messages/` | i18n JSON (5 locales) |
| `public/` | Static assets |
| `scripts/` | CMS, SEO, deploy, and validation tooling |
| `data/` | Local CMS SQLite + SEO state (not all committed) |
| `content/` | Handwritten case-study source files |
| `deploy/` | nginx snippets |
