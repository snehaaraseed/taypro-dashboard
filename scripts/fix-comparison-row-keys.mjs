#!/usr/bin/env node
/** Fix comparison-table row keys where modelT/modelB were wrongly renamed to robot. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function fixComparisonRows(data, section, productKey) {
  const block = data[Object.keys(data)[0]]?.[section];
  if (!block) return data;
  for (const key of Object.keys(block)) {
    if (!key.startsWith("row")) continue;
    const row = block[key];
    if (row && typeof row === "object" && "robot" in row && "glyde" in row) {
      row[productKey] = row.robot;
      delete row.robot;
    }
    if (row && typeof row === "object" && "robot" in row && "nyuma" in row) {
      row[productKey] = row.robot;
      delete row.robot;
    }
  }
  return data;
}

for (const locale of ["en", "hi", "ar", "ja", "bn"]) {
  const dir = join(root, "messages/pages", locale);

  const helyxPath = join(dir, "helyx.json");
  if (existsSync(helyxPath)) {
    const data = JSON.parse(readFileSync(helyxPath, "utf8"));
    const ns = Object.keys(data)[0];
    fixComparisonRows({ [ns]: data[ns] }, "helyxVsGlyde", "helyx");
    writeFileSync(helyxPath, JSON.stringify(data, null, 2) + "\n");
    console.log("fixed helyx", locale);
  }

  const glydeXPath = join(dir, "glyde-x.json");
  if (existsSync(glydeXPath)) {
    const data = JSON.parse(readFileSync(glydeXPath, "utf8"));
    const ns = Object.keys(data)[0];
    fixComparisonRows({ [ns]: data[ns] }, "glydeXVsGlyde", "glydeX");
    writeFileSync(glydeXPath, JSON.stringify(data, null, 2) + "\n");
    console.log("fixed glyde-x", locale);
  }

  const nyumaXPath = join(dir, "nyuma-x.json");
  if (existsSync(nyumaXPath)) {
    const data = JSON.parse(readFileSync(nyumaXPath, "utf8"));
    const ns = Object.keys(data)[0];
    fixComparisonRows({ [ns]: data[ns] }, "nyumaXVsNyuma", "nyumaX");
    writeFileSync(nyumaXPath, JSON.stringify(data, null, 2) + "\n");
    console.log("fixed nyuma-x", locale);
  }
}

console.log("fix-comparison-row-keys done");
