#!/usr/bin/env node
/**
 * Embeds optimized Taypro assets into deploy/maintenance/index.html.
 * Run: npm run build:maintenance
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const maintDir = join(root, "deploy/maintenance");
const assetsDir = join(maintDir, "assets");

function dataUri(filename, mime) {
  const buf = readFileSync(join(assetsDir, filename));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const logoUri = dataUri("taypro-logo.png", "image/png");
const faviconUri = dataUri("favicon.png", "image/png");

let html = readFileSync(join(maintDir, "index.template.html"), "utf8");
html = html.replaceAll("__LOGO_DATA_URI__", logoUri);
html = html.replaceAll("__FAVICON_DATA_URI__", faviconUri);
writeFileSync(join(maintDir, "index.html"), html);
console.log("Wrote deploy/maintenance/index.html");
