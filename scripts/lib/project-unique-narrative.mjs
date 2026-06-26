/**
 * Editorial case study prose — one coherent story per site, no repeated filler blocks.
 */

import { isBoilerplateField } from "./project-site-profile.mjs";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function p(text) {
  return `<p>${escapeHtml(text)}</p>`;
}

export function h2(text) {
  return `<h2>${escapeHtml(text)}</h2>`;
}

export function h3(text) {
  return `<h3>${escapeHtml(text)}</h3>`;
}

export function ul(items) {
  const lis = items.filter(Boolean).map((i) => `<li>${escapeHtml(i)}</li>`);
  return lis.length ? `<ul>${lis.join("")}</ul>` : "";
}

function pick(seed, offset, variants) {
  if (!variants.length) return variants[0] || "";
  return variants[(seed + offset) % variants.length];
}

function humanizeMode(mode) {
  const m = String(mode || "").toLowerCase();
  if (/mixed/i.test(m)) return "mixed automatic and semi-automatic";
  if (/semi/i.test(m)) return "semi-automatic";
  if (/automatic/i.test(m)) return "automatic";
  return mode || "robotic";
}

function humanizeProcurement(proc) {
  const p = String(proc || "").toLowerCase();
  if (/opex|service/i.test(p)) return "a Opex service model";
  if (/capex|purchase/i.test(p)) return "a CAPEX purchase";
  if (/both/i.test(p)) return "a combined CAPEX and Opex arrangement";
  return proc || "CAPEX";
}

/** Weave a single Excel field into 1–2 flowing paragraphs (no per-sentence spam). */
function proseFromField(text, c, context) {
  if (!text || isBoilerplateField(text)) return [];
  const clean = text
    .replace(/;\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/([a-z])\s+([A-Z])/g, "$1. $2");
  const body = clean.endsWith(".") ? clean : `${clean}.`;
  return [
    p(
      `${context} ${body} For the ${c.capacityMw} MW ${c.arrayLower} plant at ${c.location}, that directly informed fleet size, cycle frequency, and how completion is reported to plant leadership.`
    ),
  ];
}

function fleetSummary(c) {
  const { autoCount, semiCount, totalRobots, rpm } = c.profile;
  const parts = [];
  if (autoCount) parts.push(`${autoCount} automatic`);
  if (semiCount) parts.push(`${semiCount} semi-automatic`);
  const fleet =
    parts.length > 0
      ? `${parts.join(" and ")} robots (${totalRobots} total)`
      : `${totalRobots || "Taypro"} robots`;
  const rpmNote = rpm ? `, about ${rpm} robots per MW` : "";
  return `${fleet} using ${c.robotSystem || "Taypro systems"}${rpmNote}`;
}

function productLinksHtml(robotSystem, cleaningMode) {
  const links = [];
  const sys = (robotSystem || "").toLowerCase();
  const mode = (cleaningMode || "").toLowerCase();
  if (/glyde-x|tracker|single-axis/i.test(sys) || /tracker/i.test(mode)) {
    links.push(
      '<a href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers">GLYDE-X for trackers</a>'
    );
  }
  if (/glyde|nyuma|automatic/i.test(sys) || /automatic/i.test(mode)) {
    links.push(
      '<a href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system">automatic cleaning systems</a>'
    );
  }
  if (/helyx|semi/i.test(sys) || /semi/i.test(mode)) {
    links.push(
      '<a href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system">HELYX semi-automatic systems</a>'
    );
  }
  if (/opex|service/i.test(sys)) {
    links.push(
      '<a href="/solar-panel-cleaning-system/solar-panel-cleaning-service">cleaning service (Opex)</a>'
    );
  }
  links.push(
    '<a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a>',
    '<a href="/cleaning-technology">how Taypro cleaning works</a>'
  );
  return `<p>Related resources: ${[...new Set(links)].join(" · ")}.</p>`;
}

function openingSection(c) {
  const mode = humanizeMode(c.cleaningMode);
  const proc = humanizeProcurement(c.procurement);
  const year = c.year ? `, commissioned in ${c.year}` : "";
  const state = c.profile.state ? ` in ${c.profile.state}` : "";
  const seed = c.profile.seed;

  const lede = pick(seed, 0, [
    `The ${c.location} solar plant is a ${c.capacityMw} MW ${c.arrayLower} installation where recurring dust and uneven manual washing were eroding performance ratio. Taypro deployed ${fleetSummary(c)} to run predictable, waterless cleaning cycles without scaling night labour to match plant size.`,
    `Operators at ${c.location} manage ${c.capacityMw} MW of ${c.arrayLower} capacity${state}. Before robotics, cleaning could not keep pace with soiling between planned washes; today ${fleetSummary(c)} supports ${mode} dry cleaning under ${proc}.`,
    `This case study explains how ${c.location} (${c.capacityMw} MW) uses Taypro ${mode} cleaning on ${c.arrayLower} arrays — fleet scale, operating model, and reported water and generation outcomes for peer plants in ${c.profile.state || "India"}.`,
  ]);

  const snapshot = ul([
    `${c.capacityMw} MW · ${c.arrayType}`,
    c.profile.totalRobots
      ? `Fleet: ${fleetSummary(c)}`
      : `Systems: ${c.robotSystem || "Taypro"}`,
    `Cleaning: ${mode}`,
    `Commercial: ${humanizeProcurement(c.procurement)}`,
    c.profile.nectyr
      ? "Operations: NECTYR fleet visibility and scheduled cycles"
      : "Operations: scheduled cycles with field inspection reports",
    c.year ? `Commissioning: ${c.year}` : null,
  ]);

  return [
    p(lede),
    snapshot,
    p(
      `The sections below follow how the plant was run in the field — environment, O&M constraints, deployment choices, daily operations, and measured results${year}.`
    ),
  ];
}

function environmentSection(c) {
  const blocks = [h2(`Environment and soiling at ${c.location}`)];
  if (c.soiling && !isBoilerplateField(c.soiling)) {
    blocks.push(
      ...proseFromField(
        c.soiling,
        c,
        `Dust and weather at this site are characterised by:`
      )
    );
  } else {
    blocks.push(
      p(
        `${c.profile.state || "Regional"} dust and dry spells drive soiling on the ${c.capacityMw} MW array. Fine particles build on module glass between cycles; downwind rows and roads often show PR dips before the centre of the plant.`
      )
    );
  }
  blocks.push(
    p(
      `Robotic cleaning here prioritises frequency and logged block coverage rather than occasional deep washes. That approach fits ${c.arrayLower} layouts where manual crews could not repeat often enough to hold soiling loss flat through pre-monsoon months.`
    )
  );
  return blocks;
}

function challengeSection(c) {
  const blocks = [h2("O&M before Taypro")];
  if (c.omChallenge && !isBoilerplateField(c.omChallenge)) {
    blocks.push(
      ...proseFromField(
        c.omChallenge,
        c,
        "The main operational challenge was:"
      )
    );
  } else if (c.profile.scale === "mega" || c.profile.scale === "large") {
    blocks.push(
      p(
        `At ${c.capacityMw} MW, manual washing could not cover the full footprint on a repeatable schedule. Crew logistics, water tankers, and night safety windows did not scale with block count, and supervisors lacked block-level proof of which strings were actually cleaned.`
      )
    );
  } else {
    blocks.push(
      p(
        `For a ${c.capacityMw} MW ${c.profile.scale} plant, intermittent manual cleaning consumed budget without stabilising PR. The team needed a programme that could run on schedule without adding permanent night labour.`
      )
    );
  }
  if (c.waterLabour && !isBoilerplateField(c.waterLabour)) {
    blocks.push(
      ...proseFromField(
        c.waterLabour,
        c,
        "Water and labour limits added pressure:"
      )
    );
  } else {
    blocks.push(
      p(
        `Water logistics for wet washing and reliance on contracted labour made it hard to increase cleaning frequency when dust load spiked — a common constraint in ${c.profile.state || "the region"}.`
      )
    );
  }
  return blocks;
}

function deploymentSection(c) {
  const mode = humanizeMode(c.cleaningMode);
  const proc = humanizeProcurement(c.procurement);
  const blocks = [
    h2("Taypro deployment"),
    p(
      `Taypro installed ${fleetSummary(c)} for ${mode} waterless cleaning across ${c.arrayLower} blocks. Procurement followed ${proc}; brushes and traverse speeds were aligned with module OEM cleaning guidance.`
    ),
  ];

  if (c.highlight && !isBoilerplateField(c.highlight)) {
    const h = c.highlight.replace(/\s+/g, " ").trim();
    const hb = h.endsWith(".") ? h : `${h}.`;
    blocks.push(
      p(
        `Deployment emphasis: ${hb} Commissioning prioritised high-soiling blocks first, charging layout, and clear completion reporting to leadership.`
      )
    );
  }

  const sys = (c.robotSystem || "").toLowerCase();
  if (/glyde/i.test(sys)) {
    blocks.push(
      p(
        `GLYDE-class automatic units cover repeatable rows with standardised docking and night routes. Semi-automatic units, where deployed, close gaps near irregular geometry or zones still being onboarded.`
      )
    );
  }
  if (/nyuma/i.test(sys) && !/glyde/i.test(sys)) {
    blocks.push(
      p(
        `NYUMA systems on this plant are sized for dependable autonomy at ${c.capacityMw} MW without over-sizing spares — appropriate for the row layout and dust abrasiveness on site.`
      )
    );
  }
  if (/helyx/i.test(sys)) {
    blocks.push(
      p(
        `HELYX semi-automatic coverage supports blocks where full autonomy is not yet practical, so the plant avoids dusty pockets while automatic paths expand.`
      )
    );
  }

  if (c.monitoring && !isBoilerplateField(c.monitoring)) {
    blocks.push(
      p(
        `Monitoring and operations: ${c.monitoring.replace(/\s+/g, " ").trim()}`
      )
    );
  } else if (c.profile.nectyr) {
    blocks.push(
      p(
        `Day staff use fleet dashboards to see which blocks finished overnight, when wind holds paused runs, and which assets need brush or drive checks — reducing reliance on anecdotal crew reports.`
      )
    );
  } else {
    blocks.push(
      p(
        `Cycles run to a published weekly plan with inspection sign-off, which suits the current scale before full fleet dashboards are required on every block.`
      )
    );
  }

  return blocks;
}

function commissioningSection(c) {
  return [
    h2("Commissioning and handover"),
    p(
      `Commissioning at ${c.location} walked every planned path on ${c.arrayLower} rows, validated end-of-row turns, wind holds, and parking/charging placement so deadhead time stayed low across ${c.capacityMw} MW.`
    ),
    p(
      `Local technicians trained on start/stop, brush inspection, and fault handling before field teams demobilised. Handover included path maps, hold rules, and spare reorder levels sized for ${c.profile.totalRobots || "the"} on-site fleet.`
    ),
    p(
      `Robotic cleaning was added to the existing O&M calendar next to vegetation control and inverter maintenance — owned by the same leads who already tracked PR and washing spend.`
    ),
  ];
}

function operationsSection(c) {
  const seed = c.profile.seed;
  return [
    h2("Day-to-day operations"),
    p(
      pick(seed, 2, [
        `Night crews execute planned blocks; day crews reconcile completion against SCADA trends. Missed cycles are treated like inverter defects — logged, rescheduled, and reviewed in weekly meetings.`,
        `Wind holds are mandatory: the plant accepts short delays when anemometers trip rather than risking modules or robots during gusts.`,
        `Block priority favours downwind strings and access-road edges where dust returns fastest, so limited robot hours target the highest marginal MWh recovery first.`,
      ])
    ),
    p(
      `Brush wear, battery health, and firmware updates follow Taypro preventive maintenance guidance. Tier-one technicians resolve most stops locally; remote support handles exceptions without flying specialists for every alert.`
    ),
  ];
}

function resultsSection(c) {
  const bullets = [];
  if (c.waterSaved) {
    bullets.push(
      `About ${c.waterSaved} of water avoided annually versus wet-wash baselines (site-reported).`
    );
  }
  if (c.generation) {
    bullets.push(
      `About ${c.generation} of additional clean generation per year linked to improved cleaning discipline (site-reported; validate against curtailment).`
    );
  }
  if (c.co2) {
    bullets.push(
      `Roughly ${c.co2} CO₂ equivalent when grid factors are applied to recovered generation.`
    );
  }
  if (c.profile.autoCount) {
    bullets.push(
      `${c.profile.autoCount} automatic robot${c.profile.autoCount > 1 ? "s" : ""} on repeatable rows.`
    );
  }
  if (c.profile.semiCount) {
    bullets.push(
      `${c.profile.semiCount} semi-automatic robot${c.profile.semiCount > 1 ? "s" : ""} for irregular blocks or ramp-up zones.`
    );
  }

  const blocks = [
    h2("Results and impact"),
  ];

  if (c.outcomes && !isBoilerplateField(c.outcomes)) {
    const o = c.outcomes.replace(/\s+/g, " ").trim();
    blocks.push(
      p(
        `Operators report: ${o} Finance and O&M at ${c.location} review these figures alongside SCADA PR — not as a substitute for plant-level attribution, but as a consistent year-on-year cleaning baseline.`
      )
    );
  } else {
    blocks.push(
      p(
        `After deployment, the plant cites steadier cleaning cadence, fewer emergency manual crews, and clearer accountability for which blocks were cleaned each week.`
      )
    );
  }

  if (bullets.length) blocks.push(ul(bullets));

  blocks.push(
    p(
      `Water savings reduce tanker and groundwater dependence; generation and carbon figures should be modelled with your tariff, curtailment, and disclosure methodology before board or lender packs.`
    )
  );

  return blocks;
}

function regionalSection(c) {
  const state = c.profile.state;
  if (!state) {
    return [
      h2("Regional operating notes"),
      p(
        `Local dust, wind, and access conditions at ${c.location} set the cleaning calendar. Paths were validated on this layout before production cycles — peer plants should compare block drawings and SCADA history, not only nameplate MW.`
      ),
    ];
  }
  const notes = {
    "Madhya Pradesh": `Central India heat and semi-arid belts mean sharp soiling swings; pre-monsoon weeks often need the densest robot utilisation.`,
    Maharashtra: `Agricultural dust, road grit, and humidity cycles influence how often robots can run without holds.`,
    Karnataka: `Mixed dry spells and short rains make logged completion data valuable when explaining PR month to month.`,
    Rajasthan: `Arid exposure and water scarcity strengthen the business case for dry robotic programmes.`,
    "Uttar Pradesh": `Plain dust and post-harvest particulate load affect downwind strings first.`,
    Gujarat: `Coastal and inland dust patterns require disciplined brush care and wind-aware scheduling.`,
    "Tamil Nadu": `Operators balance coastal film dust inland particulate where applicable.`,
  };
  const note =
    notes[state] ||
    `${state} operating conditions shaped cycle frequency and hold rules at this plant.`;

  return [
    h2(`Operating in ${state}`),
    p(`${note} At ${c.location} (${c.capacityMw} MW), those patterns are reflected in the block priority queue and seasonal review meetings.`),
    p(
      `Peer plants in the same state should still validate paths on their own rows — robot count per MW here is ${c.profile.rpm ? `about ${c.profile.rpm}` : "layout-specific"}, not a universal target.`
    ),
  ];
}

function commercialSection(c) {
  const proc = humanizeProcurement(c.procurement);
  return [
    h2("Commercial and ownership"),
    p(
      `The plant procured robots under ${proc}. Finance amortises hardware against avoided washing cost${c.waterSaved ? ` (about ${c.waterSaved} water annually)` : ""}${c.generation ? ` and site-reported uplift near ${c.generation}` : ""}.`
    ),
    p(
      `Payback modelling should use local tariff, curtailment, and real row counts — not generic robots-per-MW tables. Taypro commissioning and spares support reduce ramp risk while assets stay on the plant balance sheet unless an Opex service model is chosen elsewhere in the portfolio.`
    ),
  ];
}

function performanceSection(c) {
  return [
    h2("Performance ratio and cleaning discipline"),
    p(
      `Soiling loss on ${c.arrayLower} strings often appears in inverter data before modules look dirty from the access road. Weekly PR reviews at ${c.location} now include which blocks robots cleaned, so teams separate soiling effects from equipment faults faster.`
    ),
    p(
      `Edge rows and downwind haul roads remain the first strings to dip; the priority queue reflects that. When a block is logged complete and PR is still soft, O&M checks brush wear or path obstructions before replacing strings.`
    ),
    p(
      `Dry brushing at night avoids midday water sprays that stress glass temperatures. Wind holds are enforced so robots pause rather than risk modules or assets during gusts — delays are logged, not hidden.`
    ),
  ];
}

function scaleSection(c) {
  if (c.profile.scale !== "mega" && c.profile.scale !== "large") return [];
  return [
    h3(`Operating at ${c.capacityMw} MW scale`),
    p(
      `Cleaning at this scale is a continuous programme: ${c.profile.totalRobots} robots must cover enough hectares each night that marginal MWh recovered justifies fleet OPEX. Planners sequence by expected soiling return, not equal row counts.`,
    ),
    p(
      `Charging, parking, and spare hubs were placed to limit drive time between blocks. Leadership tracks robot utilisation alongside inverter availability during March–June dust peaks.`,
    ),
  ];
}

function closingSection(c) {
  const mode = humanizeMode(c.cleaningMode);
  return [
    h2("Applying this reference to your plant"),
    p(
      `Use ${c.location} as a field benchmark for ${c.capacityMw} MW, ${mode} cleaning, and ${c.profile.totalRobots || "fleet"} robots on ${c.arrayLower} arrays — not as generic copy. Bring your block layout, tariff, and soiling history to technical review and the ROI calculator before capital approval.`
    ),
    p(
      `If you operate a similar plant in ${c.profile.state || "India"}, compare fleet density${c.profile.rpm ? ` (~${c.profile.rpm} robots per MW here)` : ""}, monitoring approach, and reported metrics with your own SCADA baselines before procurement sign-off.`
    ),
    productLinksHtml(c.robotSystem, c.cleaningMode),
  ];
}

/**
 * Build editorial case study sections (h2/h3 only).
 */
export function buildUniqueNarrativeSections(c) {
  return [
    ...openingSection(c),
    ...environmentSection(c),
    ...challengeSection(c),
    ...deploymentSection(c),
    ...scaleSection(c),
    ...commissioningSection(c),
    ...operationsSection(c),
    ...performanceSection(c),
    ...resultsSection(c),
    ...commercialSection(c),
    ...regionalSection(c),
    ...closingSection(c),
  ].filter(Boolean);
}
