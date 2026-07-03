#!/usr/bin/env node
/**
 * Purge all Cloudflare edge cache after a full code deploy.
 * Static/marketing pages (company, product, compare, etc.) are not CMS-purged
 * individually — this one-time full purge refreshes them after deploy.
 *
 * Usage: node scripts/purge-cloudflare-on-deploy.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

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
const zoneName = process.env.CF_ZONE_NAME || "taypro.in";

if (!token) {
  console.warn("⚠️  No Cloudflare API token — skip deploy cache purge");
  process.exit(0);
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

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
const zone = zones.result?.[0];
if (!zone) {
  console.error(`Zone not found: ${zoneName}`);
  process.exit(1);
}

await cf(`/zones/${zone.id}/purge_cache`, {
  method: "POST",
  body: JSON.stringify({ purge_everything: true }),
});
console.log(`✅ Cloudflare full cache purge for ${zoneName} (post-deploy static pages)`);
