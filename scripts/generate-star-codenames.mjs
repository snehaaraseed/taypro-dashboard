#!/usr/bin/env node
/**
 * Build data/project-star-codenames.json — ordered pool for project codenames.
 *
 * Order (short → long):
 *   1. One-word proper star names (shortest first)
 *   2. Multi-word Bayer designations (shortest first)
 *   3. HD catalog IDs (HD 100001, HD 100002, …) when the named pool is exhausted
 *
 *   node scripts/generate-star-codenames.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "data", "project-star-codenames.json");

const BRIGHT_STARS = [
  "Sirius", "Canopus", "Arcturus", "Vega", "Capella", "Rigel", "Procyon",
  "Betelgeuse", "Achernar", "Hadar", "Altair", "Acrux", "Aldebaran", "Antares",
  "Spica", "Pollux", "Fomalhaut", "Deneb", "Mimosa", "Regulus", "Adhara",
  "Shaula", "Castor", "Gacrux", "Bellatrix", "Elnath", "Miaplacidus", "Alnilam",
  "Alnitak", "Alnair", "Alioth", "Mirfak", "Dubhe", "Wezen", "Alkaid",
  "Sargas", "Avior", "Menkalinan", "Atria", "Alhena", "Peacock", "Mirzam",
  "Alphard", "Polaris", "Hamal", "Algieba", "Diphda", "Mizar", "Nunki",
  "Mirach", "Alpheratz", "Saiph", "Kochab", "Rasalhague", "Algol", "Denebola",
  "Alphecca", "Mintaka", "Sadr", "Schedar", "Naos", "Almach", "Enif",
  "Scheat", "Sabik", "Phecda", "Merak", "Izar", "Ankaa", "Caph", "Ruchbah",
  "Megrez", "Menkar", "Zosma", "Rastaban", "Eltanin", "Kaus Australis",
  "Vindemiatrix", "Sulafat", "Ascella", "Zubenelgenubi", "Unukalhai", "Zubeneschamali",
  "Markab", "Algenib", "Alcyone", "Atlas", "Electra", "Maia",
  "Merope", "Taygeta", "Celaeno", "Sterope", "Pleione",
];

const GREEK = [
  "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta",
  "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho",
  "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega",
];

/** IAU constellation genitive forms (subset + extended for Bayer names). */
const CONSTELLATION_GENITIVE = [
  "Andromedae", "Antliae", "Apodis", "Aquarii", "Aquilae", "Arae", "Arietis",
  "Aurigae", "Bootis", "Caeli", "Camelopardalis", "Cancri", "Canum Venaticorum",
  "Canis Majoris", "Canis Minoris", "Capricorni", "Carinae", "Cassiopeiae",
  "Centauri", "Cephei", "Ceti", "Chamaeleontis", "Circini", "Columbae",
  "Comae Berenices", "Coronae Australis", "Coronae Borealis", "Corvi", "Crateris",
  "Crucis", "Cygni", "Delphini", "Doradus", "Draconis", "Equulei", "Eridani",
  "Fornacis", "Geminorum", "Gruis", "Herculis", "Horologii", "Hydrae",
  "Hydrus", "Indi", "Lacertae", "Leonis", "Leonis Minoris", "Leporis", "Librae",
  "Lupi", "Lyncis", "Lyrae", "Mensae", "Microscopii", "Monocerotis", "Muscae",
  "Normae", "Octantis", "Ophiuchi", "Orionis", "Pavonis", "Pegasi", "Persei",
  "Phoenicis", "Pictoris", "Piscis Austrini", "Piscium", "Puppis", "Pyxidis",
  "Reticuli", "Sagittae", "Sagittarii", "Scorpii", "Sculptoris", "Scuti",
  "Serpentis", "Sextantis", "Tauri", "Telescopii", "Trianguli", "Trianguli Australis",
  "Tucanae", "Ursae Majoris", "Ursae Minoris", "Velorum", "Virginis", "Volantis",
  "Vulpeculae",
];

const HD_POOL_SIZE = 5000;
const HD_START = 100001;

function uniqueOrdered(names) {
  const seen = new Set();
  const out = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

function sortShortestFirst(names) {
  return [...names].sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  });
}

function buildPool() {
  const oneWord = uniqueOrdered(BRIGHT_STARS).filter((name) => !name.includes(" "));
  const multiWordBright = uniqueOrdered(BRIGHT_STARS).filter((name) =>
    name.includes(" ")
  );

  const bayer = [];
  for (const constellation of CONSTELLATION_GENITIVE) {
    for (const greek of GREEK) {
      bayer.push(`${greek} ${constellation}`);
    }
  }

  const properNames = [
    ...sortShortestFirst(oneWord),
    ...sortShortestFirst(multiWordBright),
    ...sortShortestFirst(uniqueOrdered(bayer)),
  ];

  const hd = [];
  for (let n = 0; n < HD_POOL_SIZE; n++) {
    hd.push(`HD ${HD_START + n}`);
  }

  return [...properNames, ...hd];
}

const pool = buildPool();
const oneWord = pool.filter((n) => !n.startsWith("HD ") && !n.includes(" "));
const multiWord = pool.filter((n) => !n.startsWith("HD ") && n.includes(" "));
const hd = pool.filter((n) => n.startsWith("HD "));

const payload = {
  version: 2,
  generatedAt: new Date().toISOString(),
  count: pool.length,
  tiers: {
    oneWord: oneWord.length,
    multiWord: multiWord.length,
    hd: hd.length,
  },
  names: pool,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${pool.length} star codenames to ${outPath}`);
console.log(
  `  Tier 1 (one-word, short→long): ${oneWord.length} — first: ${oneWord.slice(0, 5).join(", ")}`
);
console.log(
  `  Tier 2 (multi-word, short→long): ${multiWord.length} — first: ${multiWord.slice(0, 3).join(", ")}`
);
console.log(`  Tier 3 (HD catalog): ${hd.length} — first: ${hd[0]}, last: ${hd[hd.length - 1]}`);
