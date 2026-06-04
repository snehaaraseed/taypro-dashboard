/**
 * Per-site fingerprint and scale/mode classification for unique narratives.
 */

const INDIAN_STATES = [
  ["madhya pradesh", "Madhya Pradesh"],
  ["maharashtra", "Maharashtra"],
  ["karnataka", "Karnataka"],
  ["rajasthan", "Rajasthan"],
  ["uttar pradesh", "Uttar Pradesh"],
  ["gujarat", "Gujarat"],
  ["gujrat", "Gujarat"],
  ["tamil nadu", "Tamil Nadu"],
  ["telangana", "Telangana"],
  ["andhra pradesh", "Andhra Pradesh"],
  ["punjab", "Punjab"],
  ["haryana", "Haryana"],
  ["delhi", "Delhi"],
];

/** District / city hints when state is omitted in the location cell. */
const DISTRICT_STATE_HINTS = [
  [/ahmadnagar|nandur|sangli|yavatmal|kolhapur|solapur|pune|nashik/i, "Maharashtra"],
  [/agar|ujjain|indore|gwalior|dewas/i, "Madhya Pradesh"],
  [/yadgir|ballari|belagavi|mysuru/i, "Karnataka"],
  [/banda|lucknow|agra|meerut/i, "Uttar Pradesh"],
  [/jodhpur|jaipur|bikaner|akhadana/i, "Rajasthan"],
  [/chennai|coimbatore/i, "Tamil Nadu"],
  [/soyegaon/i, "Maharashtra"],
];

export function inferState(location, parsedState) {
  const loc = String(location || "");
  const low = loc.toLowerCase();
  if (parsedState && parsedState.length > 2 && parsedState !== "?") {
    if (/gujrat/i.test(parsedState)) return "Gujarat";
    if (/rajasthan/i.test(parsedState)) return "Rajasthan";
    return parsedState;
  }
  for (const [needle, name] of INDIAN_STATES) {
    if (low.includes(needle)) return name;
  }
  for (const [re, name] of DISTRICT_STATE_HINTS) {
    if (re.test(loc)) return name;
  }
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].replace(/india/i, "").trim();
    if (last.length > 3 && !/^\d/.test(last)) return last;
  }
  return "";
}

export function classifyScale(mw) {
  const n = Number(mw);
  if (!Number.isFinite(n) || n <= 0) return "unknown";
  if (n < 15) return "compact";
  if (n < 75) return "mid";
  if (n < 150) return "large";
  return "mega";
}

export function classifyFleet(row) {
  const auto = Number(row.automaticRobots) || 0;
  const semi = Number(row.semiAutomaticRobots) || 0;
  if (auto > 0 && semi > 0) return "mixed";
  if (auto > 0) return "automatic";
  if (semi > 0) return "semi-automatic";
  return "unspecified";
}

export function robotsPerMw(row) {
  const mw = Number(row.capacityMw);
  const total =
    (Number(row.automaticRobots) || 0) + (Number(row.semiAutomaticRobots) || 0);
  if (!mw || !total) return null;
  return Math.round((total / mw) * 10) / 10;
}

export function isTrackerArray(arrayType) {
  return /tracker|single-axis/i.test(String(arrayType || ""));
}

export function isNectyrMonitoring(monitoring) {
  return /nectyr|fleet visibility|automated cycle/i.test(String(monitoring || ""));
}

export function siteFingerprint(row) {
  return [
    row.location,
    row.capacityMw,
    row.automaticRobots,
    row.semiAutomaticRobots,
    row.robotSystem,
    row.cleaningMode,
    row.arrayType,
    row.procurement,
  ].join("|");
}

export function hashSeed(...parts) {
  const s = parts.join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Populated at import time from workbook duplicate detection. */
let workbookBoilerplate = null;

/** Mark phrases repeated across many rows (exact match) so we rewrite them per site. */
export function setWorkbookBoilerplate(phrases) {
  workbookBoilerplate = phrases;
}

export function buildBoilerplateSetFromRows(normalizedRows, minCount = 8) {
  const counts = new Map();
  const fields = [
    "soiling",
    "omChallenge",
    "waterLabour",
    "monitoring",
    "highlight",
  ];
  for (const row of normalizedRows) {
    for (const f of fields) {
      const t = String(row[f] || "").trim().toLowerCase();
      if (t.length > 25) counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return new Set(
    [...counts.entries()].filter(([, c]) => c >= minCount).map(([t]) => t)
  );
}

/** Detect only exact workbook duplicates — unique site copy is preserved and expanded. */
export function isBoilerplateField(text) {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return true;
  if (workbookBoilerplate?.has(t)) return true;
  return false;
}

export function buildSiteProfile(row) {
  const state = inferState(row.location, row.state);
  const scale = classifyScale(row.capacityMw);
  const fleetMode = classifyFleet(row);
  const rpm = robotsPerMw(row);
  const fingerprint = siteFingerprint(row);
  const seed = hashSeed(fingerprint);
  return {
    state,
    scale,
    fleetMode,
    rpm,
    fingerprint,
    seed,
    tracker: isTrackerArray(row.arrayType),
    nectyr: isNectyrMonitoring(row.monitoring),
    autoCount: Number(row.automaticRobots) || 0,
    semiCount: Number(row.semiAutomaticRobots) || 0,
    totalRobots:
      (Number(row.automaticRobots) || 0) +
      (Number(row.semiAutomaticRobots) || 0),
  };
}
