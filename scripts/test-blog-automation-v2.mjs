#!/usr/bin/env node
/** Wrapper for test-blog-automation-v2.ts */
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
    "scripts/test-blog-automation-v2.ts",
  ],
  { cwd: root, stdio: "inherit", env: process.env }
);
process.exit(r.status ?? 1);
