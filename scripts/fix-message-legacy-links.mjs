#!/usr/bin/env node
/**
 * Rewrite legacy internal hrefs in messages/*.json and src/app/data.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadHrefRewrites, rewriteText } from "./cms-href-rewrites.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const auditOnly = process.argv.includes("--audit");
const dryRun = process.argv.includes("--dry-run");

function walkJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJsonFiles(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function main() {
  const pairs = loadHrefRewrites();
  let total = 0;
  const targets = [
    ...walkJsonFiles(path.join(root, "messages")),
    path.join(root, "src/app/data.ts"),
  ];

  for (const file of targets) {
    const before = fs.readFileSync(file, "utf8");
    const { text: after, count } = rewriteText(before, pairs);
    if (count === 0) continue;
    total += count;
    console.log(`${path.relative(root, file)}: ${count} rewrite(s)`);
    if (!auditOnly && !dryRun) {
      fs.writeFileSync(file, after);
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
