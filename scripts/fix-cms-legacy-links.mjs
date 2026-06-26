#!/usr/bin/env node
/**
 * Rewrite legacy internal hrefs in CMS HTML to canonical paths.
 *
 * Usage:
 *   node scripts/fix-cms-legacy-links.mjs --audit
 *   node scripts/fix-cms-legacy-links.mjs --dry-run
 *   node scripts/fix-cms-legacy-links.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadHrefRewrites, rewriteText } from "./cms-href-rewrites.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const auditOnly = process.argv.includes("--audit");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const HREF_REWRITES = loadHrefRewrites();

function decodeCfEmail(encoded) {
  const key = parseInt(encoded.slice(0, 2), 16);
  let email = "";
  for (let i = 2; i < encoded.length; i += 2) {
    email += String.fromCharCode(parseInt(encoded.slice(i, i + 2), 16) ^ key);
  }
  return email;
}

/** Replace stale Cloudflare email-obfuscation anchors (404 when obfuscation is off). */
function stripCloudflareEmailObfuscation(html) {
  if (!html || !html.includes("email-protection")) {
    return { html, count: 0 };
  }
  let count = 0;
  const out = html.replace(
    /<a\b([^>]*?)href=(["'])\/cdn-cgi\/l\/email-protection[^"']*\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, before, quote, after, inner) => {
      count++;
      const cfMatch = match.match(/data-cfemail=(["'])([^"']+)\1/i);
      const email = cfMatch ? decodeCfEmail(cfMatch[2]) : inner.replace(/<[^>]+>/g, "").trim();
      if (email.includes("@")) {
        return `<a${before}href=${quote}mailto:${email}${quote}${after}>${inner}</a>`;
      }
      return email || inner.replace(/<[^>]+>/g, "").trim();
    }
  );
  return { html: out, count };
}

/** Wrap bare Taypro sales phone numbers in tel: links (best-practices audit). */
function wrapBarePhoneNumbers(html) {
  if (!html || (!html.includes("80438") && !html.includes("08043843569"))) {
    return { html, count: 0 };
  }
  const variants = ["+91 80438 43569", "+918043843569", "08043843569"];
  let out = html;
  let count = 0;

  for (const display of variants) {
    if (!out.includes(display)) continue;
    const chunks = out.split(display);
    let rebuilt = chunks[0] ?? "";
    for (let i = 1; i < chunks.length; i++) {
      const tail = rebuilt.slice(-120);
      if (
        tail.includes('href="tel:') ||
        tail.includes("href='tel:") ||
        /<a\b[^>]*$/i.test(tail)
      ) {
        rebuilt += display;
      } else {
        count++;
        rebuilt += `<a href="tel:+918043843569">${display}</a>`;
      }
      rebuilt += chunks[i];
    }
    out = rebuilt;
  }

  return { html: out, count };
}

function sanitizeCmsHtml(html) {
  if (!html) return { html, count: 0 };
  const link = rewriteText(html, HREF_REWRITES);
  const email = stripCloudflareEmailObfuscation(link.text);
  const phone = wrapBarePhoneNumbers(email.html);
  return { html: phone.html, count: link.count + email.count + phone.count };
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(`CMS database not found: ${dbPath}`);
    process.exit(1);
  }
  const db = new Database(dbPath);
  let total = 0;
  for (const table of ["blogs", "projects"]) {
    const rows = db.prepare(`SELECT id, slug, content FROM ${table}`).all();
    for (const row of rows) {
      const { html, count } = sanitizeCmsHtml(row.content);
      if (count === 0) continue;
      total += count;
      console.log(`${table}/${row.slug}: ${count} link rewrite(s)`);
      if (!auditOnly && !dryRun) {
        if (!html || !html.trim()) {
          console.warn(`  skip ${table}/${row.slug}: rewrite would empty content`);
          continue;
        }
        db.prepare(`UPDATE ${table} SET content = ? WHERE id = ?`).run(html, row.id);
      }
    }
  }
  console.log(
    auditOnly
      ? `Audit: ${total} rewrite(s) needed`
      : dryRun
        ? `Dry run: would apply ${total} rewrite(s)`
        : `Applied ${total} rewrite(s)`
  );
}

main();
