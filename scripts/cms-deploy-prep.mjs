#!/usr/bin/env node
/**
 * One-shot idempotent CMS steps during production deploy (single Node boot).
 */
import { spawnSync } from "node:child_process";

const steps = [
  "cms:migrate-extras",
  "cms:sync-published-topics",
  "cms:reconcile-migrations",
  "cms:migrate-image-alt",
  "cms:migrate-seo-keyword",
  "cms:migrate-scheduled-publish",
  "cms:fix-slug-locale-unique",
];

for (const step of steps) {
  console.log(`\n▶ npm run ${step}`);
  const r = spawnSync("npm", ["run", step], {
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("\n✅ cms:deploy-prep complete");
