#!/usr/bin/env node
/** Wrapper for generate-editorial-calendar.ts */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync(
  "npx",
  [
    "tsx",
    "--require",
    "./scripts/preload-stub-server-only.cjs",
    "scripts/generate-editorial-calendar.ts",
  ],
  { cwd: root, stdio: "inherit" }
);
process.exit(r.status ?? 1);
