#!/usr/bin/env node
/** Wrapper for run-pagespeed-audit.ts (loads .env.local, stubs server-only). */
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.local", ".env.production", ".env"]) {
  const envPath = path.join(root, file);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const r = spawnSync(
  "npx",
  [
    "tsx",
    "--require",
    "./scripts/preload-stub-server-only.cjs",
    "scripts/run-pagespeed-audit.ts",
    ...process.argv.slice(2),
  ],
  { cwd: root, stdio: "inherit", env: process.env }
);
process.exit(r.status ?? 1);
