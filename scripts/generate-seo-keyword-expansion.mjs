#!/usr/bin/env node
/**
 * Generate ~1,000 programmatic B2B solar O&M / cleaning keywords for India.
 * Merged into blog automation via data/seo-keywords-expansion.json.
 *
 * Run: node scripts/generate-seo-keyword-expansion.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(root, "data", "seo-keywords.csv");
const outPath = path.join(root, "data", "seo-keywords-expansion.json");

const RELEVANT =
  /solar|photovoltaic|\bpv\b|panel|module|inverter|tracker|clean|robot|maintenance|soil|wash|waterless|automatic|plant|farm|utility|commercial|rooftop|residential|performance ratio|om\b|o&m|price|cost|manufacturer|supplier|equipment|system|power|energy|dry clean|bifacial|monocrystalline|mw\b|opex|capex|scada|soiling|module/i;
const EXCLUDE =
  /near me|san diego|sydney|diy\b|cleaning jobs|cleaning license|gutter and|student project|pdf download|ppt\b|thesis|stock price|share price|ipo\b|wikipedia|meaning of|what is the meaning|sunlight panels|washing machine|for home use only/i;

function loadExistingCsvKeywords() {
  const set = new Set();
  if (!fs.existsSync(csvPath)) return set;
  const text = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/).slice(3)) {
    const kw = line.split("\t")[0]?.trim().toLowerCase();
    if (kw && kw !== "keyword") set.add(kw);
  }
  return set;
}

function normalize(kw) {
  return kw.toLowerCase().replace(/\s+/g, " ").trim();
}

function passes(kw) {
  const k = normalize(kw);
  if (k.length < 8 || k.length > 90) return false;
  if (!RELEVANT.test(k)) return false;
  if (EXCLUDE.test(k)) return false;
  return true;
}

function addKeyword(map, kw, meta) {
  const key = normalize(kw);
  if (!passes(key)) return;
  if (map.has(key)) return;
  map.set(key, { keyword: key, ...meta });
}

function combine(map, parts, meta) {
  const phrase = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  addKeyword(map, phrase, meta);
}

// --- Seed lists (generic queries people actually type) ---

const INDIA = ["india", "in india", "india utility scale", "indian solar plants"];

const STATES = [
  "rajasthan",
  "gujarat",
  "madhya pradesh",
  "maharashtra",
  "karnataka",
  "andhra pradesh",
  "telangana",
  "tamil nadu",
  "uttar pradesh",
  "punjab",
  "haryana",
  "delhi ncr",
];

const SOLAR_PARKS = [
  "bhadla solar park",
  "khavda solar park",
  "pavagada solar park",
  "rewa solar park",
];

const PLANT_SCALES = [
  "utility scale",
  "utility-scale",
  "large scale",
  "mw scale",
  "50 mw",
  "100 mw",
  "250 mw",
  "500 mw",
  "solar farm",
  "solar power plant",
  "ground mount",
  "ground-mounted",
];

const PLANT_TYPES = [
  "fixed tilt",
  "fixed-tilt",
  "single axis tracker",
  "single-axis tracker",
  "tracker-based",
  "bifacial",
  "monofacial",
  "distributed solar",
  "scattered blocks",
  "irregular layout",
];

const SEGMENTS = [
  "utility scale solar plant",
  "utility scale solar farm",
  "commercial solar plant",
  "industrial solar plant",
  "commercial rooftop solar",
  "industrial rooftop solar",
  "warehouse rooftop solar",
  "factory rooftop solar",
  "institutional rooftop solar",
  "residential rooftop solar",
  "housing society rooftop solar",
  "canopy solar installation",
  "carport solar panels",
  "c&i solar portfolio",
];

const CLEANING_CORE = [
  "solar panel cleaning",
  "solar module cleaning",
  "pv panel cleaning",
  "pv module cleaning",
  "photovoltaic panel cleaning",
  "solar array cleaning",
  "solar plant cleaning",
  "solar farm cleaning",
  "module surface cleaning",
  "panel washing",
  "dry cleaning solar panels",
  "waterless solar panel cleaning",
  "waterless module cleaning",
  "robotic solar panel cleaning",
  "automatic solar panel cleaning",
  "autonomous solar panel cleaning",
  "semi automatic solar panel cleaning",
  "solar cleaning robot",
  "solar panel cleaning robot",
  "pv cleaning robot",
  "automatic solar cleaning system",
  "solar panel cleaning system",
  "solar module cleaning system",
  "solar cleaning machine",
  "solar panel cleaning equipment",
  "solar cleaning equipment",
  "portable solar cleaning machine",
  "mobile solar cleaning robot",
];

const TECH_FEATURES = [
  "microfiber brush",
  "pbt brush",
  "soft nylon brush",
  "scratch free cleaning",
  "dual pass cleaning",
  "single pass cleaning",
  "air wash cleaning",
  "airflow cleaning",
  "brushless cleaning",
  "tracker compatible cleaning",
  "row to row transfer",
  "autonomous docking",
  "rail track transfer",
  "rf mesh communication",
  "fleet management portal",
  "scada integration",
  "performance ratio monitoring",
  "soiling loss detection",
  "generation baseline software",
  "block level monitoring",
];

const OM_TOPICS = [
  "solar plant o&m",
  "solar o&m services",
  "solar plant maintenance",
  "solar asset management",
  "solar operations and maintenance",
  "pv plant o&m",
  "solar farm maintenance",
  "preventive maintenance solar plant",
  "corrective maintenance solar plant",
  "solar plant performance ratio",
  "performance ratio improvement",
  "soiling loss solar panels",
  "soiling loss calculation",
  "energy yield loss dust",
  "dust accumulation solar panels",
  "cleaning frequency solar plant",
  "cleaning schedule solar farm",
  "solar panel cleaning frequency",
  "optimal cleaning interval",
  "manual vs robotic cleaning",
  "robot vs manual solar cleaning",
  "cleaning robot tco",
  "solar cleaning opex model",
  "pay per panel cleaning",
  "solar cleaning capex vs opex",
  "managed solar cleaning service",
  "solar cleaning service contract",
  "amc solar cleaning robot",
  "solar cleaning roi",
  "solar cleaning payback period",
];

const COMPARISON_INTENTS = [
  "cost comparison",
  "price comparison",
  "vs manual cleaning",
  "vs sprinkler system",
  "vs brush cleaning",
  "vs water cleaning",
  "tco analysis",
  "lifecycle cost",
  "opex comparison",
];

const QUESTION_PREFIXES = [
  "how often to clean",
  "how to clean",
  "how much does",
  "what is the cost of",
  "best way to clean",
  "is robotic cleaning worth",
  "which solar cleaning",
  "when to clean",
  "why clean solar panels",
];

const BRANDED = [
  "taypro solar cleaning robot",
  "taypro glyde robot",
  "taypro helyx robot",
  "taypro nyuma robot",
  "taypro miny rooftop robot",
  "taypro cradyl docking station",
  "taypro nectyr fleet portal",
  "taypro orion plant intelligence",
  "glyde automatic solar robot",
  "helyx semi automatic solar robot",
  "nyuma pbt brush robot",
  "tracker compatible glyde-x robot",
  "waterless autonomous solar robot india",
  "taypro glyde-x tracker robot",
  "taypro nyuma-x tracker robot",
  "taypro autonomous solar cleaning system",
  "taypro waterless cleaning robot india",
  "taypro solar cleaning service india",
  "taypro pay per panel cleaning",
  "taypro opex solar cleaning model",
  "taypro utility scale cleaning robot",
  "taypro rooftop cleaning robot",
  "taypro fleet management solar cleaning",
  "taypro orion scada integration",
  "taypro nectyr robot scheduling",
  "glyde solar panel cleaning robot india",
  "helyx solar cleaning robot india",
  "nyuma solar module cleaning robot",
  "miny compact rooftop cleaning robot",
  "cradyl solar robot docking station",
  "nectyr solar fleet portal",
  "orion solar plant intelligence platform",
  "taypro cradyl row transfer system",
  "taypro automatic cleaning robot price india",
  "taypro solar robot amc india",
];

const EQUIPMENT_BRIDGE = [
  "solar panel manufacturers india o&m",
  "pv module supplier plant maintenance",
  "solar inverter maintenance cleaning",
  "string combiner maintenance solar",
  "solar tracker maintenance cleaning",
  "module degradation cleaning impact",
  "bifacial gain soiling loss",
  "longi module cleaning compatibility",
  "trina solar module cleaning robot",
  "jinko module cleaning guidelines",
];

function generate(map) {
  // 1) Core cleaning × segment × india
  for (const clean of CLEANING_CORE) {
    addKeyword(map, `${clean} india`, {
      volumeBucket: 5000,
      competition: "Medium",
      competitionIndex: 45,
      cluster: "utility_cleaning_robot",
    });
    for (const seg of SEGMENTS) {
      addKeyword(map, `${clean} for ${seg}`, {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 18,
        cluster: seg.includes("rooftop") || seg.includes("residential")
          ? "rooftop_ci_cleaning"
          : "utility_cleaning_robot",
      });
      combine(map, [clean, seg, "india"], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 15,
        cluster: "utility_cleaning_robot",
      });
    }
  }

  // 2) Plant scale + type + cleaning
  for (const scale of PLANT_SCALES) {
    for (const clean of [
      "solar panel cleaning robot",
      "automatic solar cleaning",
      "waterless solar cleaning",
      "solar o&m cleaning",
    ]) {
      combine(map, [clean, scale, "india"], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 20,
        cluster: "utility_cleaning_robot",
      });
    }
    for (const ptype of PLANT_TYPES) {
      combine(map, [`${ptype} solar panel cleaning`], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 12,
        cluster: "tracker_cleaning",
      });
      combine(map, [`solar cleaning robot`, ptype, "plant india"], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 14,
        cluster: "tracker_cleaning",
      });
    }
  }

  // 3) O&M and soiling long-tails
  for (const topic of OM_TOPICS) {
    addKeyword(map, `${topic} india`, {
      volumeBucket: 500,
      competition: "Low",
      competitionIndex: 10,
      cluster: "utility_om_soiling",
    });
    for (const state of STATES) {
      combine(map, [topic, state], {
        volumeBucket: 50,
        competition: "Low",
        competitionIndex: 8,
        cluster: "regional_india",
      });
    }
  }

  // 4) Question-style (PAA)
  for (const q of QUESTION_PREFIXES) {
    for (const obj of [
      "solar panels on utility plant",
      "solar panels on rooftop",
      "solar farm panels",
      "solar modules in india",
      "solar cleaning robots",
    ]) {
      combine(map, [q, obj], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 12,
        cluster: "utility_om_soiling",
      });
    }
  }

  // 5) Regional + parks
  for (const state of STATES) {
    for (const clean of [
      "solar panel cleaning robot",
      "solar cleaning service",
      "solar plant cleaning",
      "automatic solar panel cleaning system",
    ]) {
      combine(map, [clean, state], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 14,
        cluster: "regional_india",
      });
      combine(map, [clean, state, "india"], {
        volumeBucket: 500,
        competition: "Low",
        competitionIndex: 12,
        cluster: "regional_india",
      });
    }
  }
  for (const park of SOLAR_PARKS) {
    for (const clean of [
      "solar panel cleaning",
      "robotic solar cleaning",
      "solar o&m",
    ]) {
      combine(map, [clean, park], {
        volumeBucket: 50,
        competition: "Low",
        competitionIndex: 6,
        cluster: "regional_india",
      });
    }
  }

  // 6) Tech feature long-tails
  for (const tech of TECH_FEATURES) {
    combine(map, [`solar panel cleaning`, tech, "india"], {
      volumeBucket: 50,
      competition: "Low",
      competitionIndex: 8,
      cluster: "utility_cleaning_robot",
    });
    combine(map, [`utility scale solar`, tech], {
      volumeBucket: 50,
      competition: "Low",
      competitionIndex: 8,
      cluster: "software_monitoring",
    });
  }

  // 7) OPEX / finance
  for (const base of [
    "solar panel cleaning opex model",
    "pay per panel cleaned solar",
    "solar cleaning robot leasing",
    "managed robotic solar cleaning",
    "no upfront capex solar cleaning",
    "solar cleaning service opex",
    "robotic cleaning contract solar plant",
  ]) {
    addKeyword(map, `${base} india`, {
      volumeBucket: 500,
      competition: "Low",
      competitionIndex: 15,
      cluster: "opex_finance",
    });
    for (const cmp of COMPARISON_INTENTS) {
      combine(map, [`solar cleaning robot`, cmp], {
        volumeBucket: 50,
        competition: "Low",
        competitionIndex: 10,
        cluster: "opex_finance",
      });
    }
  }

  // 8) Rooftop / C&I / residential (user target)
  const rooftopPhrases = [
    "rooftop solar panel cleaning",
    "rooftop solar cleaning robot",
    "commercial building solar cleaning",
    "warehouse solar panel cleaning",
    "factory rooftop solar cleaning",
    "industrial shed solar cleaning",
    "school rooftop solar maintenance",
    "hospital rooftop solar cleaning",
    "mall rooftop solar panel cleaning",
    "office building solar panel cleaning",
    "residential society solar cleaning",
    "apartment rooftop solar cleaning",
    "compact solar cleaning robot rooftop",
    "lightweight solar cleaning robot",
  ];
  for (const phrase of rooftopPhrases) {
    addKeyword(map, `${phrase} india`, {
      volumeBucket: 500,
      competition: "Low",
      competitionIndex: 16,
      cluster: "rooftop_ci_cleaning",
    });
  }

  // 9) Equipment bridge (manufacturer / price researchers)
  for (const bridge of EQUIPMENT_BRIDGE) {
    addKeyword(map, bridge, {
      volumeBucket: 500,
      competition: "Low",
      competitionIndex: 22,
      cluster: "equipment_bridge",
    });
  }
  for (const equip of [
    "pv module price",
    "solar panel price",
    "solar inverter price",
    "solar tracker cost",
    "module cleaning cost per mw",
  ]) {
    combine(map, [equip, "utility plant india o&m"], {
      volumeBucket: 5000,
      competition: "High",
      competitionIndex: 70,
      cluster: "equipment_bridge",
    });
  }

  // 10) Branded (smaller set)
  for (const b of BRANDED) {
    addKeyword(map, b, {
      volumeBucket: 50,
      competition: "Low",
      competitionIndex: 5,
      cluster: "branded_taypro",
    });
  }

  // 11) Certification / compliance
  const certs = [
    "tuv nord certified solar cleaning robot",
    "nise approved solar cleaning system",
    "ul certified solar cleaning robot india",
    "module manufacturer approved cleaning robot",
    "longi approved solar cleaning robot",
    "trina solar approved cleaning system",
    "jinko solar compatible cleaning robot",
    "bifacial module safe cleaning robot",
    "iec certified solar cleaning equipment",
    "iso certified solar o&m robot india",
    "module warranty safe cleaning robot",
    "panel oem approved cleaning method",
    "utility scale certified cleaning robot",
    "tracker plant certified cleaning system",
    "rooftop certified solar cleaning robot",
  ];
  for (const c of certs) {
    addKeyword(map, c, {
      volumeBucket: 50,
      competition: "Low",
      competitionIndex: 8,
      cluster: "certification_compliance",
    });
  }

  // 12) Programmatic grid: cleaning verb × plant context × modifier
  const verbs = ["cleaning", "washing", "maintenance", "o&m"];
  const contexts = [
    "utility solar plant",
    "solar power project",
    "pv power plant",
    "renewable energy plant",
    "ground mount pv plant",
    "tracker solar project",
    "rooftop pv system",
    "commercial solar installation",
  ];
  const modifiers = [
    "best practices",
    "cost",
    "price",
    "schedule",
    "frequency",
    "automation",
    "robotics",
    "water consumption",
    "labour cost",
    "downtime",
  ];
  for (const v of verbs) {
    for (const ctx of contexts) {
      for (const m of modifiers) {
        combine(map, [`solar panel ${v}`, m, ctx, "india"], {
          volumeBucket: 50,
          competition: "Low",
          competitionIndex: 10,
          cluster: "utility_om_soiling",
        });
      }
    }
  }

  // 13) Software / monitoring
  const software = [
    "solar plant monitoring software",
    "solar o&m software india",
    "solar asset performance monitoring",
    "solar fleet management software",
    "robot cleaning fleet dashboard",
    "solar scada o&m integration",
    "soiling loss monitoring software",
    "pr benchmarking solar plant",
    "block level solar analytics",
    "cleaning robot telemetry",
  ];
  for (const s of software) {
    addKeyword(map, s, {
      volumeBucket: 500,
      competition: "Low",
      competitionIndex: 18,
      cluster: "software_monitoring",
    });
  }
}

const existing = loadExistingCsvKeywords();
const map = new Map();
generate(map);

// Remove any already in Keyword Planner CSV
for (const key of [...map.keys()]) {
  if (existing.has(key)) map.delete(key);
}

let keywords = [...map.values()];

// Balanced cap: reserve slots per cluster, then fill to 1000 by score
const CLUSTER_MIN = {
  branded_taypro: 40,
  software_monitoring: 40,
  certification_compliance: 25,
  opex_finance: 30,
  equipment_bridge: 40,
  rooftop_ci_cleaning: 120,
  regional_india: 80,
  tracker_cleaning: 40,
  utility_om_soiling: 80,
  utility_cleaning_robot: 505,
};

function rowScore(k) {
  return k.volumeBucket * 10 - k.competitionIndex;
}

const byCluster = new Map();
for (const k of keywords) {
  const list = byCluster.get(k.cluster) ?? [];
  list.push(k);
  byCluster.set(k.cluster, list);
}
for (const list of byCluster.values()) {
  list.sort((a, b) => rowScore(b) - rowScore(a));
}

const picked = new Map();
function takeFromCluster(cluster, max) {
  const list = byCluster.get(cluster) ?? [];
  let n = 0;
  for (const k of list) {
    if (picked.size >= 1000) break;
    if (n >= max) break;
    if (picked.has(k.keyword)) continue;
    picked.set(k.keyword, k);
    n++;
  }
}

for (const [cluster, min] of Object.entries(CLUSTER_MIN)) {
  takeFromCluster(cluster, min);
}
// Fill remainder by global score
const remainder = keywords
  .filter((k) => !picked.has(k.keyword))
  .sort((a, b) => rowScore(b) - rowScore(a));
for (const k of remainder) {
  if (picked.size >= 1000) break;
  picked.set(k.keyword, k);
}
keywords = [...picked.values()];

const clusters = {};
for (const k of keywords) {
  clusters[k.cluster] = (clusters[k.cluster] || 0) + 1;
}

const output = {
  description:
    "Programmatic B2B solar O&M / cleaning keywords (India). Merged after Keyword Planner CSV; excludes duplicates and filtered junk.",
  generatedAt: new Date().toISOString(),
  targetCount: 1000,
  count: keywords.length,
  clusters,
  keywords,
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Wrote ${keywords.length} expansion keywords → ${outPath}`);
console.log("Clusters:", clusters);
console.log(`Skipped ${existing.size} existing CSV keywords (overlap removed)`);
