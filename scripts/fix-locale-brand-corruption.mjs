#!/usr/bin/env node
/**
 * Fix BR0टोकन / BR1टोकन corruption from bad Model-* rebrand passes on locale JSON.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];
const BAD = /BR[01]टोकन/g;

const REPLACEMENTS = [
  [/"p2NexStrong": "BR[01]टोकन"/g, '"p2NexStrong": "NEXTracker"'],
  [/"p2GameStrong": "BR[01]टोकन"/g, '"p2GameStrong": "Gamechanger"'],
  [/"linkGlyde": "BR[01]टोकन"/g, '"linkGlyde": "GLYDE"'],
  [/"linkHelyx": "BR[01]टोकन"/g, '"linkHelyx": "HELYX"'],
  [/"linkGlydeX": "BR[01]टोकन"/g, '"linkGlydeX": "GLYDE-X"'],
  [/"name": "BR[01]टोकन"/g, '"name": "NECTYR"'],
  [/"modelA": "BR[01]टोकन"/g, '"modelA": "GLYDE"'],
  [/"modelB": "BR[01]टोकन"/g, '"modelB": "HELYX"'],
  [/"modelT": "BR[01]टोकन"/g, '"modelT": "GLYDE-X"'],
  [/"console": "BR[01]टोकन"/g, '"console": "NECTYR"'],
  [/"modelT": "BR1टोकन BR0टोकन"/g, '"modelT": "NEXTracker Gamechanger"'],
  [/Taypro कंसोल/g, "NECTYR"],
  [/Taypro कंसोल टेलीमेट्री/g, "NECTYR टेलीमेट्री"],
  [/समान Taypro कंसोल स्टैक/g, "समान NECTYR स्टैक"],
];

for (const loc of locales) {
  const dir = join(root, "messages/pages", loc);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const path = join(dir, file);
    let s = readFileSync(path, "utf8");
    if (!BAD.test(s) && !s.includes("Taypro कंसोल")) {
      BAD.lastIndex = 0;
      continue;
    }
    BAD.lastIndex = 0;
    const before = s;
    for (const [from, to] of REPLACEMENTS) {
      s = s.replace(from, to);
    }
    s = s.replace(/BR[01]टोकन/g, "NECTYR");
    if (s !== before) {
      writeFileSync(path, s);
      console.log("fixed", loc, file);
    }
  }
}

console.log("fix-locale-brand-corruption done");
