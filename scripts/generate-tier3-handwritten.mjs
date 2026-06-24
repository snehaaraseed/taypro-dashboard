/**
 * Generate tier-3 handwritten case studies (50–60 MW priority batch).
 */
import fs from "fs";
import { countWords } from "./lib/sanitize-client-names.mjs";
import {
  nectyrCadenceGroundHtml,
  semiCadenceHtml,
  seasonalCalendarHtml,
} from "./lib/handwritten-site-config.mjs";
import { TIER3_SITES } from "./lib/handwritten-tier3-site-config.mjs";
import {
  PERFORMANCE_METHODOLOGY_HREF,
  projectPeerHref,
} from "./lib/handwritten-link-helpers.mjs";
import { buildTier3DeepEditorial } from "./lib/tier3-editorial-deep.mjs";
import { TIER3_LONGFORM } from "./lib/tier3-longform.mjs";

const outDir = "content/handwritten-case-studies";

function rpmw(s) {
  if (s.lowSemiNote) return "—";
  const t = s.auto + s.semi;
  return t ? `~${(t / s.mw).toFixed(2)}` : "—";
}

function robotRows(s) {
  if (s.lowSemiNote) {
    return `<tr><td>Automatic robots</td><td>—</td></tr>
<tr><td>Semi-automatic robots</td><td>NYUMA programme (workbook: 1 unit; validate fleet scope with commissioning records)</td></tr>
<tr><td>Total fleet</td><td>Inspection-led semi-automatic</td></tr>`;
  }
  if (!s.auto && s.semi) {
    return `<tr><td>Automatic robots</td><td>—</td></tr>
<tr><td>Semi-automatic robots</td><td>${s.semi}</td></tr>
<tr><td>Total fleet</td><td>${s.semi} NYUMA portables</td></tr>`;
  }
  return `<tr><td>Automatic robots</td><td>${s.auto || "—"}</td></tr>
<tr><td>Semi-automatic robots</td><td>${s.semi || "—"}</td></tr>
<tr><td>Total fleet</td><td>${s.auto + s.semi} robots</td></tr>`;
}

function closingBrief(s) {
  const name = s.title.split(",")[0].trim();
  return `
<h2>Technical committee closing brief for ${name}</h2>
<p>Attach row maps, ${s.nectyr ? "NECTYR samples" : "inspection samples"}, and conservative <strong>${s.energyUplift || `${s.gwh} GWh`}</strong> / <strong>${s.co2}&nbsp;tCO₂e</strong> stress tests. <strong>${s.water} litres</strong> water avoided should use the same assumptions as generation slides.</p>
<p>Scheduled cycles and weather-aware holds—roughly <strong>3–10 dry cycles per month</strong> on automatic peers, weather permitting—not daily plant-wide washing. Read <a href="/cleaning-technology">cleaning technology</a> and <a href="${PERFORMANCE_METHODOLOGY_HREF}">performance methodology</a>.</p>
<p>Compare peers linked above; request layout review via <a href="/contact">contact</a> when row maps are preliminary.</p>

<h2>Finance workshop agenda</h2>
<p>Validate manual baseline; agree PR normalization; review ${s.nectyr ? "NECTYR holds and completion" : "inspection cadence"}; align ESG water and carbon on one assumption set; budget spares and training through year five.</p>
`;
}

function buildHtml(slug, s) {
  const peers = s.peers
    .map(
      ([ps, label, note]) =>
        `<p><strong> Versus <a href="${projectPeerHref(ps)}">${label}</a>:</strong> ${note}.</p>`
    )
    .join("\n");
  const cadence = s.nectyr ? nectyrCadenceGroundHtml : semiCadenceHtml;
  const ops = s.nectyr
    ? `<h2>NECTYR operations and accountability</h2>
<p>NECTYR provides fleet visibility, automated cycle scheduling, and alerts—not a plant-wide clean-now button. Supervisors review completion maps, wind and rain holds, and idle trends weekly in dust season.</p>`
    : `<h2>Operations rhythm with inspection-led accountability</h2>
<p>Published weekly block plans and inspection sign-off drive accountability. Technicians own brush care, holds, and dated reschedules when telematics are not the primary layer.</p>`;

  return `<h2>Executive summary</h2>
<p>The ${s.title} plant is a ${s.mw}&nbsp;MW ground-mounted utility asset in ${s.state}. ${s.fleetPitch} Taypro implemented ${s.mode} waterless cleaning under <a href="/projects/capex">CAPEX</a>.</p>
<p>Operations report roughly <strong>${s.water} litres of water saved per year</strong>, about <strong>${s.energyUplift || `${s.gwh}&nbsp;GWh`} of additional clean generation</strong>, and <strong>${s.co2}&nbsp;metric tons CO₂ equivalent</strong> (site-reported; validate with your SCADA).</p>
<p>Robotic cleaning means <strong>scheduled cycles and weather-aware holds</strong>—not flooding modules on a daily wash calendar.</p>

<h2>Site statistics at a glance</h2>
<table>
<thead><tr><th>Metric</th><th>Reported value</th></tr></thead>
<tbody>
<tr><td>Nameplate capacity</td><td>${s.mw}&nbsp;MW</td></tr>
<tr><td>State / region</td><td>${s.state}</td></tr>
${robotRows(s)}
<tr><td>Robots per MW</td><td>${rpmw(s)}</td></tr>
<tr><td>Primary systems</td><td>${s.product}</td></tr>
<tr><td>Cleaning mode</td><td>${s.mode}</td></tr>
<tr><td>Procurement</td><td>CAPEX</td></tr>
<tr><td>Monitoring</td><td>${s.nectyr ? "NECTYR" : "Inspection-led plans"}</td></tr>
${s.year ? `<tr><td>Commissioning</td><td>${s.year}</td></tr>` : ""}
<tr><td>Water saved</td><td>~${s.water} litres / year</td></tr>
<tr><td>Generation uplift</td><td>~${s.energyUplift || `${s.gwh} GWh`} / year</td></tr>
<tr><td>CO₂ equivalent</td><td>~${s.co2}&nbsp;metric tons / year</td></tr>
</tbody>
</table>

<h2>Fleet design at ${s.mw}&nbsp;MW</h2>
<p>${s.fleetPitch}</p>
<p>${s.unique}</p>

${ops}
${cadence}

<h2>Commissioning and handover</h2>
<p>Commissioning sequenced high-soiling blocks first, validated geometry and docking or staging, and trained technicians on waterless compliance and hold rules.</p>

${buildTier3DeepEditorial(slug, s)}
${seasonalCalendarHtml}

<h2>Peer benchmarking</h2>
${peers}
<p>Browse <a href="/projects">all projects</a>, <a href="/projects/chhayan-rajasthan-150-mw">mid-scale peers</a>, and <a href="/projects/soyegaon-solar-project">tier-2 references</a>.</p>

${s.extra || ""}
${TIER3_LONGFORM[slug] || ""}
${closingBrief(s)}

<h2>Operations FAQ</h2>
<h3>How are cycles scheduled?</h3>
<p>${s.nectyr ? "NECTYR weather-aware block timers on automatic rows plus NYUMA weekly plans on portable zones" : "Weekly NYUMA block plans and inspection sign-off"}—not a daily wash of the full plant.</p>
<h3>What should lenders review?</h3>
<p>Water statistics, ${s.nectyr ? "NECTYR hold logs" : "inspection sheets"}, training records, and GWh stress tests at 50% and 75% attribution.</p>

<h2>Conclusion</h2>
<p>${s.title} demonstrates ${s.mw}&nbsp;MW robotic cleaning with reported ${s.water} litres water saved, ${s.gwh}&nbsp;GWh, and ${s.co2}&nbsp;tCO₂e—validated locally. Use peer links when building procurement packs.</p>
`;
}

for (const [slug, site] of Object.entries(TIER3_SITES)) {
  const html = buildHtml(slug, site);
  fs.writeFileSync(`${outDir}/${slug}.html`, html);
  console.log("wrote", slug, countWords(html), "words");
}
