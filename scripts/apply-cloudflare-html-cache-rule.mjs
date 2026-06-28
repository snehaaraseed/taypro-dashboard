#!/usr/bin/env node
/**
 * Add (or ensure) Cloudflare Cache Rule for marketing HTML on taypro.in.
 * Respects origin Cache-Control s-maxage=3600; skips /api, /admin, /_next.
 *
 * Usage:
 *   node scripts/apply-cloudflare-html-cache-rule.mjs
 *   node scripts/apply-cloudflare-html-cache-rule.mjs --purge
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const purge = process.argv.includes("--purge");
const zoneName = process.env.CF_ZONE_NAME || "taypro.in";
const HTML_RULE_DESC = "Cache marketing HTML (respect origin s-maxage)";

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

const HTML_RULE = {
  action: "set_cache_settings",
  action_parameters: {
    browser_ttl: { mode: "respect_origin" },
    cache: true,
    edge_ttl: { mode: "respect_origin" },
  },
  description: HTML_RULE_DESC,
  enabled: true,
  expression: `(http.request.method eq "GET") and (not starts_with(http.request.uri.path, "/admin")) and (not starts_with(http.request.uri.path, "/api")) and (not starts_with(http.request.uri.path, "/_next/"))`,
};

async function main() {
  const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  const zone = zones.result?.[0];
  if (!zone) {
    console.error(`Zone not found: ${zoneName}`);
    process.exit(1);
  }

  const rulesets = await cf(`/zones/${zone.id}/rulesets`);
  const cacheRuleset = rulesets.result?.find(
    (r) => r.phase === "http_request_cache_settings" && r.kind === "zone"
  );
  if (!cacheRuleset) {
    throw new Error("No zone cache ruleset found");
  }

  const detail = await cf(`/zones/${zone.id}/rulesets/${cacheRuleset.id}`);
  const rules = [...(detail.result.rules || [])];
  const existing = rules.find((r) => r.description === HTML_RULE_DESC);

  if (existing) {
    console.log(`HTML cache rule already present (${existing.id})`);
  } else {
    const created = await cf(
      `/zones/${zone.id}/rulesets/${cacheRuleset.id}/rules`,
      {
        method: "POST",
        body: JSON.stringify(HTML_RULE),
      }
    );
    console.log(`Created HTML cache rule: ${created.result?.id}`);
  }

  if (purge) {
    await cf(`/zones/${zone.id}/purge_cache`, {
      method: "POST",
      body: JSON.stringify({ purge_everything: true }),
    });
    console.log("Purged entire Cloudflare cache for zone");
  } else {
    console.log("Run with --purge to purge Cloudflare cache after rule change");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
