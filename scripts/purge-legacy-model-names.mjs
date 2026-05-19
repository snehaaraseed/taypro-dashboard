#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const dirs = [
  join(root, "messages/pages/en"),
  join(root, "messages"),
];

function transform(s) {
  return s
    .replace(/Model-A/g, "GLYDE")
    .replace(/Model-B/g, "HELYX")
    .replace(/Model-T/g, "GLYDE-X")
    .replace(/MODEL-A/g, "GLYDE")
    .replace(/MODEL-B/g, "HELYX")
    .replace(/MODEL-T/g, "GLYDE-X")
    .replace(/Model-A, B, or T/gi, "HELYX, NYUMA, GLYDE, NYUMA-X, or GLYDE-X")
    .replace(/Model-A, B or T/gi, "HELYX, NYUMA, GLYDE, NYUMA-X, or GLYDE-X")
    .replace(/Model-A \/ B \/ T/g, "GLYDE / HELYX / GLYDE-X")
    .replace(/Model-A \/ B \/ T or OPEX/g, "Taypro robots or OPEX")
    .replace(/GLYDE, B, or GLYDE-X/g, "HELYX, NYUMA, GLYDE, NYUMA-X, or GLYDE-X");
}

for (const dir of dirs) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const path = join(dir, file);
    const out = transform(readFileSync(path, "utf8"));
    if (out !== readFileSync(path, "utf8")) {
      writeFileSync(path, out);
      console.log("updated", path);
    }
  }
}

// data.ts faqs block
const dataPath = join(root, "src/app/data.ts");
writeFileSync(dataPath, transform(readFileSync(dataPath, "utf8")));
console.log("updated data.ts");
