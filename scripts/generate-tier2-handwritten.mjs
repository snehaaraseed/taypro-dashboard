/**
 * Generate tier-2 handwritten case studies (product-accurate, 3000+ words, no FAQ padding).
 */
import fs from "fs";
import { countWords } from "./lib/sanitize-client-names.mjs";
import {
  TIER2_SITES,
  nectyrCadenceGroundHtml,
  semiCadenceHtml,
  seasonalCalendarHtml,
} from "./lib/handwritten-site-config.mjs";
import { TIER2_LONGFORM } from "./lib/tier2-longform.mjs";
import { buildTier2DeepEditorial } from "./lib/tier2-editorial-deep.mjs";
import { remediationPass2 } from "./lib/handwritten-remediation-pass2.mjs";
import { tier2RemediationBulk } from "./lib/tier2-remediation-bulk.mjs";
import { remediationPass3 } from "./lib/handwritten-remediation-pass3.mjs";
import { remediationPass4 } from "./lib/handwritten-remediation-pass4.mjs";
import { remediationPass5 } from "./lib/handwritten-remediation-pass5.mjs";
import { remediationPass6 } from "./lib/handwritten-remediation-pass6.mjs";
import { remediationPass7 } from "./lib/handwritten-remediation-pass7.mjs";
import { remediationPass8 } from "./lib/handwritten-remediation-pass8.mjs";
import { remediationPass9 } from "./lib/handwritten-remediation-pass9.mjs";
import { remediationPass10 } from "./lib/handwritten-remediation-pass10.mjs";

const outDir = "content/handwritten-case-studies";

function rpmw(s) {
  if (s.semiNote) return "—";
  const t = s.auto + s.semi;
  return t ? `~${(t / s.mw).toFixed(2)}` : "—";
}

function robotRows(s) {
  if (s.semiNote) {
    return `<tr><td>Automatic robots</td><td>—</td></tr>
<tr><td>Semi-automatic robots</td><td>NYUMA programme (count per commissioning records)</td></tr>
<tr><td>Total fleet</td><td>Semi-automatic deployment</td></tr>`;
  }
  return `<tr><td>Automatic robots</td><td>${s.auto || "—"}</td></tr>
<tr><td>Semi-automatic robots</td><td>${s.semi || "—"}</td></tr>
<tr><td>Total fleet</td><td>${s.auto + s.semi} robots</td></tr>`;
}

function execSummary(slug, s) {
  if (slug === "banda-solar-project") {
    return `<p>The ${s.title} plant is a ${s.mw}&nbsp;MW ground-mounted utility asset in ${s.state}. ${s.fleetPitch} Taypro implemented ${s.mode} waterless cleaning under <a href="/projects/capex">CAPEX</a>.</p>`;
  }
  if (slug === "seci-phase-1gujrat-75-mw") {
    return `<p>The ${s.title} plant is a ${s.mw}&nbsp;MW ground-mounted utility asset in ${s.state}. Taypro implemented ${s.mode} waterless cleaning under <a href="/projects/capex">CAPEX</a>—seventy-one GLYDE automatic units (~0.95 robots/MW) with NECTYR scheduling on repeatable ground-mount rows.</p>`;
  }
  return `<p>The ${s.title} plant is a ${s.mw}&nbsp;MW ground-mounted utility asset in ${s.state}. ${s.fleetPitch} Taypro implemented ${s.mode} waterless cleaning under <a href="/projects/capex">CAPEX</a>.</p>`;
}

function tier2ClosingBrief(s) {
  const name = s.title.split(",")[0].trim();
  return `
<h2>Technical committee closing brief for ${name}</h2>
<p>When your committee signs off on ${s.mw}&nbsp;MW ${s.mode.toLowerCase()} waterless cleaning, attach three evidence types: row maps with block IDs, ${s.nectyr ? "NECTYR completion and hold samples" : "inspection sheets and weekly block plans"}, and conservative stress tests on <strong>${s.gwh}&nbsp;GWh</strong> and <strong>${s.co2}&nbsp;tCO₂e</strong>. ${name} statistics—<strong>${s.water} litres</strong> water avoided—should use the same assumption set as generation slides, not mixed months.</p>
<p>Robotics programmes fail audits when supervisors cannot explain prioritisation: downwind edges and haul-road strings first; interior tables when schedules and weather allow. That is operations research at ${s.mw}&nbsp;MW, not a robots-per-MW slogan copied from brochures.</p>
<p>Brush and drive consumables belong in ten-year CAPEX models alongside hardware. ${s.year ? `Commissioning in ${s.year} ` : ""}should have established hold policies before the first March dust peak. Spare batches arriving late idle machines silently across hundreds of hectares.</p>
<p>Compare peer deployments linked in this case study before copying robot density. ${s.state} logistics, row repeatability, and dust return windows differ from Rajasthan mega plants and Madhya Pradesh mixed fleets alike. Model with <a href="/solar-panel-cleaning-robot-price-calculator#calculator">calculator</a> inputs only after local PR baselines and curtailment history are agreed.</p>
<p>Insurers and lenders increasingly ask for night traffic plans, training attendance, and cleaning evidence—not crew sign-in sheets alone. ${s.nectyr ? "NECTYR exports" : "Inspection discipline"} answers that question when block IDs match finance workshops.</p>
<p>Finally, treat scheduled cycles and weather-aware holds as the operating definition of “clean”: roughly <strong>3–10 dry cycles per month</strong> on automatic peers, weather permitting—not daily flooding of every module. Read <a href="/cleaning-technology">cleaning technology</a> before writing acceptance criteria; read <a href="/performance-methodology">performance methodology</a> before claiming MWh uplift per pass.</p>

<h2>Finance workshop agenda (suggested)</h2>
<p>Agenda item one: validate manual baseline year—tanker litres, wet-wash crew headcount, emergency wash calls. Agenda item two: agree PR and curtailment normalization for <strong>${s.gwh}&nbsp;GWh</strong> attribution bands. Agenda item three: review ${s.nectyr ? "NECTYR hold frequency and completion maps" : "inspection cadence and signed block plans"} for the last dust-season month. Agenda item four: align ESG water and carbon slides on one assumption set.</p>
<p>Agenda item five: confirm spare and training budgets through year five—not only robot purchase price. ${name} at ${s.mw}&nbsp;MW is a multi-year O&amp;M programme; capital without consumables and supervision underestimates true cost.</p>
<p>Close the workshop with peer benchmarks from this page and a layout review request via <a href="/contact">contact</a> if row maps are still preliminary.</p>
`;
}

function buildHtml(slug, s) {
  const peers = s.peers
    .map(
      ([ps, label, note]) =>
        `<p><strong> Versus <a href="/projects/${ps}">${label}</a>:</strong> ${note}.</p>`
    )
    .join("\n");
  const cadence = s.nectyr ? nectyrCadenceGroundHtml : semiCadenceHtml;
  const ops = s.nectyr
    ? `<h2>NECTYR operations and accountability</h2>
<p>NECTYR provides fleet visibility, <strong>automated cycle scheduling</strong>, and alert management—not a “clean now” button for the whole plant. Day supervisors review completion maps, wind and rain holds, and idle trends; scheduled cycles run in approved windows; missed blocks are rescheduled before month-end PR surprises.</p>
<p>Weekly meetings tie cleaning KPIs to inverter availability. Wind holds use the same weather context shown in the dashboard; brush PM follows Taypro intervals.</p>`
    : `<h2>Operations rhythm with inspection-led accountability</h2>
<p>Operations rely on <strong>published weekly block plans</strong> and inspection sign-off. Technicians own start/stop, brush care, and path updates when civil works shift rows. Missed blocks get dated reschedules—discipline matters because telematics are not the primary layer on this phase.</p>`;

  return `<h2>Executive summary</h2>
${execSummary(slug, s)}
<p>Operations report roughly <strong>${s.water} litres of water saved per year</strong>, about <strong>${s.gwh}&nbsp;GWh of additional clean generation</strong>, and <strong>${s.co2}&nbsp;metric tons CO₂ equivalent</strong> (site-reported; validate with your SCADA). This case study links to Taypro products, <a href="/performance-methodology">performance methodology</a>, and peer deployments for owners sizing mid-scale programmes.</p>
<p>Robotic cleaning here means <strong>scheduled cycles and weather-aware holds</strong>—not flooding modules on a daily wash calendar. Read the cadence section before modelling robots/MW from brochures alone.</p>

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
<tr><td>Procurement</td><td>CAPEX (plant-owned)</td></tr>
<tr><td>Monitoring</td><td>${s.nectyr ? "NECTYR fleet visibility, cycle scheduling, alerts" : "Manual cycle scheduling; periodic inspection reports"}</td></tr>
${s.year ? `<tr><td>Commissioning (robotics)</td><td>${s.year}</td></tr>` : ""}
<tr><td>Water saved (reported)</td><td>~${s.water} litres / year</td></tr>
<tr><td>Generation uplift (reported)</td><td>~${s.gwh}&nbsp;GWh / year</td></tr>
<tr><td>CO₂ equivalent (reported)</td><td>~${s.co2}&nbsp;metric tons / year</td></tr>
</tbody>
</table>
<p>Figures are site-reported. Pair with <a href="/cleaning-technology">cleaning technology</a> when writing acceptance criteria.</p>

<h2>Fleet design at ${s.mw}&nbsp;MW</h2>
<p>${s.fleetPitch}</p>
<p>${s.unique}</p>
<p>Procurement is <a href="/projects/capex">CAPEX</a>. Compare <a href="/solar-panel-cleaning-system">system overview</a>, <a href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system">GLYDE automatic</a>, and <a href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system">semi-automatic</a> pages with your row maps before copying robot density.</p>

${ops}

${cadence}

<h2>Commissioning and handover</h2>
<p>Commissioning sequenced high-soiling blocks first, validated end-of-row geometry, cable zones, and inverter-yard buffers, and placed docking or staging to limit deadhead time. Technicians trained on waterless brush compliance, fault codes, and hold rules; handover included path maps, escalation paths, and spare thresholds for local dust abrasiveness.</p>

${buildTier2DeepEditorial(slug, s)}

${seasonalCalendarHtml}

<h2>Peer benchmarking</h2>
${peers}
<p>Browse <a href="/projects">all projects</a>, <a href="/projects/automatic">automatic</a>, <a href="/projects/semi-automatic">semi-automatic</a>, and <a href="/projects/capex">CAPEX</a> galleries.</p>

${s.extra || ""}
${TIER2_LONGFORM[slug] || ""}

<h2>Utility O&amp;M integration</h2>
<p>Robotic cleaning belongs on the master O&amp;M calendar beside vegetation control, thermal scans, and inverter PM—not as a side contractor. ${s.nectyr ? "NECTYR" : "Inspection"} evidence should appear in the same weekly meeting as availability and curtailment reviews.</p>
<p>Owners benchmarking ${s.title.split(",")[0].trim()} should bring row maps, manual baseline wash costs, and conservative GWh attribution—not MW totals alone. Contact Taypro via <a href="/contact">contact</a> after reviewing <a href="/projects">peer projects</a> and the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">calculator</a>.</p>

${remediationPass2[slug] || ""}
${tier2RemediationBulk[slug] || ""}
${tier2ClosingBrief(s)}
${remediationPass3[slug] || ""}
${remediationPass4[slug] || ""}
${remediationPass5[slug] || ""}
${remediationPass6[slug] || ""}
${remediationPass7[slug] || ""}
${remediationPass8[slug] || ""}
${remediationPass9[slug] || ""}
${remediationPass10[slug] || ""}

<h2>Operations FAQ</h2>
<h3>How are cycles scheduled?</h3>
<p>Through NECTYR weather-aware block timers on automatic rows, or weekly portable plans on semi-automatic zones—not a daily wash of the full plant.</p>
<h3>What should lenders review?</h3>
<p>Water statistics, ${s.nectyr ? "NECTYR hold logs and completion maps" : "inspection sheets and signed block plans"}, training records, and conservative GWh stress tests at 50% and 75% attribution.</p>
<h3>Who should not copy this robot count?</h3>
<p>Owners without comparable row repeatability, dust return windows, or ${s.state} logistics—model with your maps, not MW alone.</p>

<h2>Conclusion</h2>
<p>${s.title} demonstrates mid-scale utility robotic cleaning with ${s.mode}, CAPEX ownership, and reported ${s.water} litres water saved, ${s.gwh}&nbsp;GWh, and ${s.co2}&nbsp;tCO₂e—validated locally. Use peer links above when building your procurement pack.</p>
`;
}

for (const [slug, site] of Object.entries(TIER2_SITES)) {
  const html = buildHtml(slug, site);
  const path = `${outDir}/${slug}.html`;
  fs.writeFileSync(path, html);
  console.log("wrote", slug, countWords(html), "words");
}
