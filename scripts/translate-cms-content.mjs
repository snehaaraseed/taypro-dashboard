#!/usr/bin/env node
/**
 * Backfill CMS translations via local admin API or direct import on server.
 *
 * Usage (on server with app running and admin cookie):
 *   CMS_TRANSLATE_BASE_URL=https://taypro.in \
 *   CMS_TRANSLATE_SESSION="admin-auth=..." \
 *   node scripts/translate-cms-content.mjs --blogs --limit 5
 *
 * Or call from deploy hook after publish.
 */

const base = process.env.CMS_TRANSLATE_BASE_URL || "http://localhost:3000";
const cookie = process.env.CMS_TRANSLATE_SESSION || "";

const args = process.argv.slice(2);
const blogs = args.includes("--blogs") || !args.includes("--projects-only");
const projects = args.includes("--projects") || args.includes("--projects-only");
const force = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const limit =
  limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : undefined;

const res = await fetch(`${base}/api/admin/translate/backfill`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
  },
  body: JSON.stringify({
    blogs,
    projects,
    force,
    ...(Number.isFinite(limit) ? { limit } : {}),
  }),
});

const text = await res.text();
console.log(res.status, text);

if (!res.ok) process.exit(1);
