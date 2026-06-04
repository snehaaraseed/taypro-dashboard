/**
 * Remove client / IPP names from public project copy.
 * Uses full company names + curated tokens only (never strips place names like "Nashik").
 */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeToken(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Spreadsheet rows that are place names mis-tagged as clients — do not blocklist. */
const CLIENT_COLUMN_IGNORE = new Set(
  [
    "bhandup mh",
    "nashik, satana",
    "nashik satana",
  ].map(normalizeToken)
);

/** Known developer / IPP tokens (multi-word or distinctive). Not generic English words. */
const CURATED_CLIENT_TOKENS = [
  "avaada",
  "amplus",
  "acme solar",
  "acme",
  "tata power",
  "tata",
  "first energy private limited",
  "first energy",
  "suntria nagpur",
  "suntria",
  "cleantech",
  "blupine",
  "blu pine",
  "mnm solar",
  "vimal solar",
  "mahindra construction",
  "mahindra",
  "gurudev siddha pitha",
  "indian oil petronnas",
  "indian oil",
  "nlc teras",
  "vishal warehouse",
  "suntric",
  "kuber agro",
  "shri ganesh industries",
  "manasvi enterprises",
  "msedcl",
  "hpcl",
  "shaz packaging",
  "parabot hospitality",
  "avps solar",
];

/** Phrases in Excel highlights/outcomes that embed client references. */
const CLIENT_PHRASE_PATTERNS = [
  /\bsuccessful deployment for\s+\w[\w\s]{0,40}/gi,
  /\bdemonstrating roi for\s+\w[\w\s]{0,40}/gi,
  /\bcase study for\s+\w[\w\s]{0,40}/gi,
  /\bfor\s+avaada\b/gi,
  /\bfor\s+amplus\b/gi,
  /\bfor\s+suntria\b/gi,
  /\bavaada\s+solar\b/gi,
  /\bamplus\s+solar\b/gi,
];

/** Build blocklist from spreadsheet client column + curated tokens. */
export function buildClientBlocklist(clientNames, extra = []) {
  const terms = new Set(CURATED_CLIENT_TOKENS.map(normalizeToken));

  for (const raw of [...clientNames, ...extra]) {
    const n = normalizeToken(raw);
    if (!n || n.length < 2 || CLIENT_COLUMN_IGNORE.has(n)) continue;
    terms.add(n);
    // Add bigrams from multi-word names only (e.g. "first energy", not "first" alone)
    const words = n.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        if (bigram.length >= 8) terms.add(bigram);
      }
      if (words.length >= 3) {
        const trigram = `${words[0]} ${words[1]} ${words[2]}`;
        if (trigram.length >= 12) terms.add(trigram);
      }
    }
  }

  const sorted = [...terms].sort((a, b) => b.length - a.length);
  return {
    fullNames: sorted,
    replaceTerms: sorted,
  };
}

export function sanitizeText(text, blocklistOrBundle) {
  const blocklist = Array.isArray(blocklistOrBundle)
    ? blocklistOrBundle
    : blocklistOrBundle.replaceTerms;
  let out = String(text || "");
  for (const pattern of CLIENT_PHRASE_PATTERNS) {
    out = out.replace(pattern, " ");
  }
  for (const term of blocklist) {
    if (!term) continue;
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
    out = out.replace(re, " ");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

export function rebuildSecondaryKeywords({ state, capacityMw, primaryKeyword }) {
  const parts = [
    primaryKeyword?.trim() || "solar panel cleaning robot India",
    state ? `${state} utility-scale solar cleaning` : "",
    capacityMw ? `${capacityMw} MW solar O&M automation` : "",
    "waterless robotic solar panel cleaning",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Fail if any blocklist term still appears in public copy. */
export function scanForBlockedTokens(text, blocklistOrBundle) {
  const terms = Array.isArray(blocklistOrBundle)
    ? blocklistOrBundle
    : blocklistOrBundle.replaceTerms;
  const hay = normalizeToken(text);
  const matches = [];
  for (const term of terms) {
    if (!term || term.length < 2) continue;
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
    if (re.test(hay)) matches.push(term);
  }
  return { ok: matches.length === 0, matches: [...new Set(matches)] };
}

/** Sanitize all stored project fields before DB write. */
export function sanitizeProjectRecord(record, blocklist) {
  const details =
    typeof record.details === "string"
      ? JSON.parse(record.details)
      : record.details;
  const cleanDetails = Array.isArray(details)
    ? details.map((chip) => sanitizeText(chip, blocklist))
    : details;

  return {
    ...record,
    title: sanitizeText(record.title, blocklist),
    description: sanitizeText(record.description, blocklist),
    content: sanitizeText(record.content, blocklist),
    imageAlt: sanitizeText(record.imageAlt || "", blocklist),
    details: JSON.stringify(cleanDetails),
  };
}

/** Plain-text word count (strips HTML). */
export function countWords(htmlOrText) {
  const plain = String(htmlOrText || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return 0;
  return plain.split(" ").filter(Boolean).length;
}
