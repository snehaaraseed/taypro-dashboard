#!/usr/bin/env node
/**
 * One-off: rebrand EN product message files (Model-A/B/T → GLYDE/HELYX/GLYDE-X).
 * Does not rename JSON keys (GlydePage, modelA, etc.).
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function apply(path, rules) {
  let s = readFileSync(join(root, path), "utf8");
  for (const [from, to] of rules) {
    s = s.replace(from, to);
  }
  writeFileSync(join(root, path), s);
  console.log("updated", path);
}

// GLYDE (was glyde)
apply("messages/pages/en/glyde.json", [
  [/Taypro Model-A/g, "Taypro GLYDE"],
  [/Model-A(?= [a-z])/g, "GLYDE"],
  [/Model-A(?=\s)/g, "GLYDE"],
  [/Model-A\./g, "GLYDE."],
  [/Model-A,/g, "GLYDE,"],
  [/Model-A\?/g, "GLYDE?"],
  [/Model-A:/g, "GLYDE:"],
  [/Model-A\)/g, "GLYDE)"],
  [/Model-A"/g, 'GLYDE"'],
  [/Model-A\//g, "GLYDE/"],
  [/, Model-A/g, ", GLYDE"],
  [/Model-A vs/g, "GLYDE vs"],
  [/Model-A and/g, "GLYDE and"],
  [/Model-A or/g, "GLYDE or"],
  [/Model-A\]/g, "GLYDE]"],
  [/Model-A\b/g, "GLYDE"],
  [/Model-B/g, "HELYX"],
  [/Model-T/g, "GLYDE-X"],
  [/2-panel portrait/gi, "fixed-tilt"],
  [/two-panel/gi, "fixed-tilt"],
  [/2-panel/gi, "fixed-tilt"],
]);

// HELYX (was helyx)
apply("messages/pages/en/helyx.json", [
  [/Taypro Model-B/g, "Taypro HELYX"],
  [/Model-B\b/g, "HELYX"],
  [/Model-A\b/g, "GLYDE"],
  [/Model-T\b/g, "GLYDE-X"],
  [/horizontal single-axis tracker plants/gi, "single-axis tracker plants (see GLYDE-X or NYUMA-X)"],
  [/2-panel portrait/gi, "fixed-tilt"],
  [/two-panel/gi, "fixed-tilt"],
  [/2-panel/gi, "fixed-tilt"],
]);

// GLYDE-X (was glyde-x)
apply("messages/pages/en/glyde-x.json", [
  [/Taypro Model-T/g, "Taypro GLYDE-X"],
  [/Model-T\b/g, "GLYDE-X"],
  [/Model-A\b/g, "GLYDE"],
  [/Model-B\b/g, "HELYX"],
  [/2-panel/gi, "fixed-tilt"],
  [/1-panel/gi, "single-axis tracker"],
  [/one-panel/gi, "single-axis tracker"],
]);

console.log("rebrand-product-messages done");
