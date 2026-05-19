#!/usr/bin/env node
/** Rebrand legacy Model-A/B/T names in locale page JSON (not blog/projects). */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const SKIP = new Set(["blog.json", "authors.json", "projects.json", "projects-filter.json"]);

const rules = [
  [/Taypro Model-T/g, "Taypro GLYDE-X"],
  [/Taypro Model-B/g, "Taypro HELYX"],
  [/Taypro Model-A/g, "Taypro GLYDE"],
  [/Model-T\b/g, "GLYDE-X"],
  [/Model-B\b/g, "HELYX"],
  [/Model-A\b/g, "GLYDE"],
  [/MODEL A\b/g, "GLYDE"],
  [/MODEL B\b/g, "HELYX"],
  [/MODEL T\b/g, "GLYDE-X"],
  [/Model A\b/g, "GLYDE"],
  [/Model B\b/g, "HELYX"],
  [/Model T\b/g, "GLYDE-X"],
];

for (const loc of ["hi", "ar", "ja", "bn"]) {
  const dir = join(root, "messages/pages", loc);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json") && !SKIP.has(f))) {
    const path = join(dir, file);
    let s = readFileSync(path, "utf8");
    const before = s;
    for (const [from, to] of rules) s = s.replace(from, to);
    if (s !== before) {
      writeFileSync(path, s);
      console.log("rebranded", loc, file);
    }
  }
}

console.log("rebrand-legacy-models-locales done");
