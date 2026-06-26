/**
 * Normalize Excel row keys and field values from Projects_Case_Studies workbook.
 */

import { inferState } from "./project-site-profile.mjs";

const COL = {
  client: "Client Name",
  location: " Location: {CITY}, {STATE}, India",
  capacityMw: "Capacity MW",
  automaticRobots: "Automatic Robots",
  semiAutomaticRobots: "Semi-Automatic Robots",
  arrayType: " Array type:  (fixed-tilt / single-axis tracker / mixed / rooftop )",
  commissioning: "Commissioning / year",
  soiling: "Soiling / environment",
  omChallenge: "O&M challenge before Taypro",
  waterLabour: "Water / labour constraints",
  robotSystem: "Robot / system (e.g. GLYDE, GLYDE-X, HELYX, NYUMA)",
  cleaningMode: "Cleaning mode (automatic / semi-automatic / mixed)",
  procurement: "Procurement model(CAPEX purchase / Opex service / both)",
  monitoring: "Monitoring / operations: {OPERATIONS} (e.g. NECTYR fleet visibility, cycle scheduling)",
  outcomes: "Operational outcomes",
  highlight: "What to highlight in the case study",
  categories:
    "Include on the project\n  (choose one or more: Automatic, Semi-Automatic, Capex)",
  primaryKeyword: "Primary keyword",
  secondaryKeywords: "Secondary keywords",
  waterSaved: "Water Saved/Year",
  generation: "Additional Units Generated/Year",
  co2: "CO2 Saved/Year",
};

function cell(row, key) {
  const v = row[key];
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function parseState(location) {
  const parts = location.split(",").map((p) => p.trim());
  const last =
    parts.length >= 2
      ? parts[parts.length - 1].replace(/India/i, "").trim()
      : "";
  return inferState(location, last);
}

export function excelSerialToDisplayYear(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1900 && n <= 2100) return String(Math.round(n));
  if (n > 30000 && n < 80000) {
    const ms = (n - 25569) * 86400 * 1000;
    const y = new Date(ms).getUTCFullYear();
    if (y >= 1990 && y <= 2100) return String(y);
  }
  return "";
}

function formatLitres(n) {
  const v = Number(String(n).replace(/,/g, ""));
  if (!Number.isFinite(v) || v <= 0) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")} million litres`;
  if (v >= 1000) return `${Math.round(v / 1000)} thousand litres`;
  return `${Math.round(v)} litres`;
}

function formatKwh(n) {
  const v = Number(String(n).replace(/,/g, ""));
  if (!Number.isFinite(v) || v <= 0) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace(/\.00$/, "")} GWh`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")} MWh`;
  return `${Math.round(v)} kWh`;
}

function formatTons(n) {
  const v = Number(String(n).replace(/,/g, ""));
  if (!Number.isFinite(v) || v <= 0) return "";
  return `${Math.round(v).toLocaleString("en-IN")} metric tons`;
}

export function normalizeXlsxRow(row) {
  const location = cell(row, COL.location);
  const capacityRaw = cell(row, COL.capacityMw);
  const capacityMw = capacityRaw.replace(/[^\d.]/g, "") || capacityRaw;
  const state = parseState(location);

  return {
    clientName: cell(row, COL.client),
    location,
    state,
    capacityMw,
    automaticRobots: cell(row, COL.automaticRobots),
    semiAutomaticRobots: cell(row, COL.semiAutomaticRobots),
    arrayType: cell(row, COL.arrayType) || "Utility-scale ground mount",
    commissioningYear: excelSerialToDisplayYear(cell(row, COL.commissioning)),
    soiling: cell(row, COL.soiling),
    omChallenge: cell(row, COL.omChallenge),
    waterLabour: cell(row, COL.waterLabour),
    robotSystem: cell(row, COL.robotSystem),
    cleaningMode: cell(row, COL.cleaningMode),
    procurement: cell(row, COL.procurement),
    monitoring: cell(row, COL.monitoring),
    outcomes: cell(row, COL.outcomes),
    highlight: cell(row, COL.highlight),
    categoriesCell: cell(row, COL.categories),
    primaryKeyword: cell(row, COL.primaryKeyword),
    secondaryKeywords: cell(row, COL.secondaryKeywords),
    waterSavedDisplay: formatLitres(cell(row, COL.waterSaved)),
    generationDisplay: formatKwh(cell(row, COL.generation)),
    co2Display: formatTons(cell(row, COL.co2)),
  };
}

export const LEGACY_LOCATION_MATCHERS = [
  { slug: "agar-solar-project", match: (loc, mw) => /agar/i.test(loc) && Number(mw) === 200 },
  { slug: "agar-solar-project", match: (loc, mw) => /agar/i.test(loc) && Number(mw) === 250 },
  { slug: "banda-solar-project", match: (loc, mw) => /banda/i.test(loc) && Number(mw) === 70 },
  {
    slug: "yadgir-solar-project-50-mw",
    match: (loc, mw) => /yadgir/i.test(loc) && Number(mw) === 50,
  },
  {
    slug: "soyegaon-solar-project",
    match: (loc, mw) => /soyegaon/i.test(loc) && Number(mw) === 100,
  },
];

export function findLegacySlug(location, capacityMw) {
  const mw = Number(capacityMw);
  for (const entry of LEGACY_LOCATION_MATCHERS) {
    if (entry.match(location, mw)) return entry.slug;
  }
  return null;
}

export { COL };
