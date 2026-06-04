import { countWords, sanitizeText } from "./sanitize-client-names.mjs";
import { buildSiteProfile, inferState } from "./project-site-profile.mjs";
import { buildUniqueNarrativeSections } from "./project-unique-narrative.mjs";

/** Quality-first minimum; avoid padding with repetitive sections. */
const MIN_WORD_COUNT = 900;

function buildCtx(row, blocklist) {
  const capacityMw = sanitizeText(row.capacityMw, blocklist);
  let location = sanitizeText(row.location, blocklist);
  if (!location) {
    const stateHint = sanitizeText(inferState(row.location, row.state), blocklist);
    location = stateHint
      ? `${stateHint} – ${capacityMw} MW solar plant`
      : `${capacityMw} MW utility-scale solar plant`;
  }
  const state = sanitizeText(inferState(location, row.state), blocklist);
  return {
    location,
    capacityMw,
    state,
    robotSystem: sanitizeText(row.robotSystem, blocklist),
    cleaningMode: sanitizeText(row.cleaningMode, blocklist),
    procurement: sanitizeText(row.procurement, blocklist),
    monitoring: sanitizeText(row.monitoring, blocklist),
    soiling: sanitizeText(row.soiling, blocklist),
    omChallenge: sanitizeText(row.omChallenge, blocklist),
    waterLabour: sanitizeText(row.waterLabour, blocklist),
    outcomes: sanitizeText(row.outcomes, blocklist),
    highlight: sanitizeText(row.highlight, blocklist),
    arrayType: sanitizeText(row.arrayType, blocklist),
    arrayLower: sanitizeText(row.arrayType, blocklist).toLowerCase(),
    year: sanitizeText(row.commissioningYear, blocklist),
    waterSaved: row.waterSavedDisplay,
    generation: row.generationDisplay,
    co2: row.co2Display,
    profile: buildSiteProfile({
      ...row,
      location,
      state,
      capacityMw,
    }),
  };
}

/**
 * Build long-form case study HTML (h2/h3 only; page template supplies h1).
 * Each site is written from its own fingerprint + Excel facts — no shared boilerplate essay.
 */
export function buildProjectHtml(row, blocklist) {
  const c = buildCtx(row, blocklist);
  let html = buildUniqueNarrativeSections(c).filter(Boolean).join("\n");
  html = sanitizeText(html, blocklist);
  const words = countWords(html);
  return html;
}

export function getProjectHtmlWordCount(row, blocklist) {
  return countWords(buildProjectHtml(row, blocklist));
}

export function buildMetaDescription(row, blocklist) {
  const c = buildCtx(row, blocklist);
  const parts = [
    `${c.capacityMw} MW`,
    c.location,
    c.robotSystem || "Taypro robots",
    c.cleaningMode || "robotic cleaning",
    c.profile.totalRobots ? `${c.profile.totalRobots} robots` : "",
    c.waterSaved ? `saves ${c.waterSaved}` : "",
    c.generation ? `+${c.generation}/yr` : "",
  ].filter(Boolean);
  const desc = parts.join(" · ").replace(/\s+/g, " ");
  return desc.length > 160 ? `${desc.slice(0, 157)}...` : desc;
}

export function buildTitle(row, blocklist) {
  const location = sanitizeText(row.location, blocklist);
  const capacityMw = sanitizeText(row.capacityMw, blocklist);
  return `${location} – ${capacityMw} MW`;
}

export { MIN_WORD_COUNT, countWords };
