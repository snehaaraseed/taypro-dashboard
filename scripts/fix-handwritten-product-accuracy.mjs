/**
 * Align handwritten case studies with Taypro product facts:
 * scheduled weather-aware cycles, ground vs tracker cadence.
 */
import fs from "fs";
import path from "path";
import {
  nectyrCadenceGroundHtml,
  nectyrCadenceTrackerHtml,
  semiCadenceHtml,
} from "./lib/handwritten-site-config.mjs";

const dir = "content/handwritten-case-studies";
const TRACKER_SLUG = "neneva-gujrat-250-mw";

const CADENCE_RE =
  /<h2>Cleaning cadence:[\s\S]*?(?=<h2>)/;

const replacements = [
  [
    /<p><strong>Jan–Feb:<\/strong> brush wear review; validate holds after storms\. <strong>Mar–Jun:<\/strong> peak dust—maximise night windows and track completion daily\. <strong>Monsoon transition:<\/strong> lighter passes when rain rinses modules; respect saturated soils near roads\. <strong>Post-monsoon:<\/strong> re-walk paths after vegetation or civil changes; update maps before production nights\.<\/p>/g,
    `<p><strong>Jan–Feb:</strong> review brush wear and cycle plans; validate wind and rain hold rules in NECTYR or inspection logs. <strong>Mar–Jun:</strong> peak dust—scheduled cycle density increases on priority blocks (often <strong>6–10 per month</strong> class on automatic peers; site-specific), not nightly coverage of every module. <strong>Monsoon transition:</strong> stand down or lighten cycles after effective rain. <strong>Post-monsoon:</strong> re-walk paths after vegetation or civil works; update block timers before the next approved cleaning window.</p>`,
  ],
  [/nightly throughput/g, "scheduled-cycle throughput"],
  [/autonomic paths/gi, "scheduled GLYDE paths"],
  [/autonomic night paths/g, "scheduled GLYDE paths"],
  [/GLYDE and <strong>GLYDE-X<\/strong> fleets/g, "<strong>GLYDE</strong> fleets"],
  [
    /Taypro <strong>GLYDE<\/strong> and <strong>GLYDE-X<\/strong> fleets/g,
    "Taypro <strong>GLYDE</strong> fleets",
  ],
  [
    /\(GLYDE on ground mount; GLYDE-X on trackers with stow-aware logic\)/g,
    "on fixed ground-mount tables",
  ],
];

function cadenceForSlug(slug) {
  if (slug === TRACKER_SLUG) return nectyrCadenceTrackerHtml + "\n\n";
  const semiSlugs = new Set([
    "akhadana-rajasthan-360-mw",
    "bhadlarajasthan-300-mw",
    "seci-phase-2gujrat-75-mw",
  ]);
  if (semiSlugs.has(slug)) return semiCadenceHtml + "\n\n";
  return nectyrCadenceGroundHtml + "\n\n";
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const slug = file.replace(".html", "");
  const fp = path.join(dir, file);
  let html = fs.readFileSync(fp, "utf8");
  for (const [re, rep] of replacements) {
    html = html.replace(re, rep);
  }
  if (CADENCE_RE.test(html) && slug !== TRACKER_SLUG) {
    const hasGlydeX =
      html.includes("GLYDE-X") &&
      !html.includes("tracker") &&
      !html.includes("GLYDE-X</strong> tracker");
    if (hasGlydeX || html.includes("GLYDE</strong> and <strong>GLYDE-X")) {
      html = html.replace(CADENCE_RE, cadenceForSlug(slug));
    }
  }
  if (slug === TRACKER_SLUG && CADENCE_RE.test(html)) {
    html = html.replace(CADENCE_RE, nectyrCadenceTrackerHtml + "\n\n");
  }
  fs.writeFileSync(fp, html);
  console.log("fixed", slug);
}
