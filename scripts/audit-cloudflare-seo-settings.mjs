#!/usr/bin/env node
/**
 * Read (and optionally apply) Cloudflare zone settings for SiteOne SEO.
 * Does NOT touch DNS records.
 *
 * Usage:
 *   node scripts/audit-cloudflare-seo-settings.mjs
 *   node scripts/audit-cloudflare-seo-settings.mjs --apply
 *
 * Env: Cloudflare_API_Token (or CLOUDFLARE_API_TOKEN), optional CF_ZONE_NAME=taypro.in
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const apply = process.argv.includes("--apply");
const zoneName = process.env.CF_ZONE_NAME || "taypro.in";

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const token =
  process.env.Cloudflare_API_Token ||
  process.env.CLOUDFLARE_API_TOKEN ||
  process.env.CF_API_TOKEN;

if (!token) {
  console.error("Missing Cloudflare_API_Token in .env.local");
  process.exit(1);
}

const API = "https://api.cloudflare.com/client/v4";

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(JSON.stringify(data.errors || data));
  }
  return data;
}

const DESIRED = {
  ssl: "strict",
  min_tls_version: "1.2",
  tls_1_3: "on",
  brotli: "on",
  email_obfuscation: "off",
  always_use_https: "on",
  automatic_https_rewrites: "on",
  security_header: {
    strict_transport_security: {
      enabled: true,
      max_age: 31536000,
      include_subdomains: true,
      preload: false,
      nosniff: true,
    },
  },
};

async function main() {
  const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  const zone = zones.result?.[0];
  if (!zone) {
    console.error(`Zone not found: ${zoneName}`);
    process.exit(1);
  }

  console.log(`Zone: ${zone.name} (${zone.id})`);
  console.log(apply ? "Mode: apply" : "Mode: audit only");
  console.log("");

  let changes = 0;
  for (const [setting, desired] of Object.entries(DESIRED)) {
    const current = await cf(`/zones/${zone.id}/settings/${setting}`);
    const value = current.result?.value;
    const same = JSON.stringify(value) === JSON.stringify(desired);
    console.log(`${setting}: ${JSON.stringify(value)}${same ? " ✓" : " → " + JSON.stringify(desired)}`);

    if (!same && apply) {
      await cf(`/zones/${zone.id}/settings/${setting}`, {
        method: "PATCH",
        body: JSON.stringify({ value: desired }),
      });
      changes += 1;
      console.log(`  applied`);
    }
  }

  console.log("");
  if (apply) {
    console.log(`Done. ${changes} setting(s) updated. DNS records were not modified.`);
  } else {
    console.log("Run with --apply to patch divergent settings (DNS untouched).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
