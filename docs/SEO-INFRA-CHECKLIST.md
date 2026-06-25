# SEO infrastructure checklist (Cloudflare + nginx)

Apply after deploying code fixes. SiteOne audit items that cannot be resolved in the Next.js app alone.

## Cloudflare (dashboard)

1. **SSL/TLS** → Overview: **Full (strict)** with valid origin certificate (`scripts/install-cloudflare-origin-cert.sh` on nginx host).
2. **SSL/TLS** → Edge Certificates: enable **HSTS** (include subdomains, preload optional after verification).
3. **SSL/TLS** → Minimum TLS Version: **TLS 1.2** (disables TLS 1.0/1.1 flagged by SiteOne).
4. **Speed** → Optimization: enable **Brotli** compression.
5. **Scrape Shield**: disable **Email Address Obfuscation** for `taypro.in` (prevents `/cdn-cgi/l/email-protection` 404s in crawlers).
6. **Caching** → Cache Rules: respect origin `s-maxage=3600` on HTML; cache immutable `/_next/static/*` and `/uploads/*` at edge.
7. **Security** → Transform Rules (optional): add `X-Content-Type-Options: nosniff` if not present on HTML responses.

Or via API (does not modify DNS records):

```bash
node scripts/audit-cloudflare-seo-settings.mjs
node scripts/audit-cloudflare-seo-settings.mjs --apply
```

## nginx (production host)

```bash
bash scripts/install-cloudflare-origin-cert.sh
bash scripts/install-nginx-proxy-cache.sh
bash scripts/install-nginx-performance.sh
bash scripts/install-nginx-security-headers.sh
```

- Confirm `deploy/nginx/static-public-direct.conf` serves `/tayprorobots/`, `/tayproasset/`, `/360-degree-images/` from disk.
- After CMS image/link fixes: `sudo rm -rf /var/cache/nginx/taypro/*`

## Verification

```bash
npm run seo:test-seo-fixes
node scripts/audit-live-seo.mjs
npm run seo:compare-siteone -- seo-audit-inputs/siteone-full-report.json seo-audit-inputs/siteone-full-report-v2.json
```

Re-run SiteOne full crawl after deploy and compare JSON reports.
