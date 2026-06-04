/** Shared cadence snippets — aligned with EDITORIAL-PRODUCT-FACTS.md */

/** Ground-mount GLYDE / mixed (not tracker sites). */
export const nectyrCadenceGroundHtml = `<h2>Cleaning cadence: scheduled cycles and weather-aware holds</h2>
<p>Taypro <strong>GLYDE</strong> automatic fleets do <strong>not</strong> run a naive “every module, every night” wash. Each unit is assigned to a ground-mount array with a docking station and executes <strong>scheduled waterless cycles</strong> in block-wise windows—typically <strong>post-sunset or pre-sunrise</strong>, outside peak generation—configured in <a href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app">NECTYR</a>. Plant studies set how many runs occur per month; utility programmes commonly align with roughly <strong>3–10 dry-cleaning cycles per month</strong>, often denser in peak dust season (for example 6–10) and lighter in quieter months, as described on <a href="/cleaning-technology">cleaning technology</a> and <a href="/solar-panel-cleaning-system/solar-panel-cleaning-service">cleaning service</a> pages.</p>
<p><strong>AI- and ML-informed scheduling</strong> in NECTYR combines weather forecasts, rain probability, wind limits, and fleet telemetry. After effective rain, robots often <strong>stand down</strong> to avoid redundant passes; after dust fronts, schedules tighten so performance ratio recovers before the next revenue-critical period. Operators see the same weather context used for wind holds—overrides should be informed, not blind.</p>
<p>Each completed GLYDE run is a <strong>dual-pass waterless cycle</strong> on fixed tables, with dust removal quoted <strong>per completed cycle</strong> under <a href="/performance-methodology">performance methodology</a>—not nameplate efficiency gain and not guaranteed daily coverage of the full DC footprint.</p>`;

export const nectyrCadenceTrackerHtml = `<h2>Cleaning cadence: scheduled cycles and weather-aware holds</h2>
<p><strong>GLYDE-X</strong> tracker robots follow <strong>scheduled waterless cycles</strong> in block-wise windows aligned with tracker stow and OEM guidance—configured in <a href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app">NECTYR</a>. Programmes commonly align with roughly <strong>3–10 dry-cleaning cycles per month</strong>, weather and stow permitting, as described on <a href="/cleaning-technology">cleaning technology</a>.</p>
<p>NECTYR combines weather forecasts, wind limits, and fleet telemetry. After effective rain, robots often <strong>stand down</strong>; stow-limited nights are logged separately from wind holds. Each completed run is a <strong>dual-pass waterless cycle</strong> per <a href="/performance-methodology">performance methodology</a>.</p>`;

/** @deprecated use nectyrCadenceGroundHtml or nectyrCadenceTrackerHtml */
export const nectyrCadenceHtml = nectyrCadenceGroundHtml;

export const semiCadenceHtml = `<h2>Cleaning cadence: planned portable cycles and weather holds</h2>
<p><strong>NYUMA semi-automatic</strong> coverage on this site is driven by <strong>published weekly block plans</strong>, supervisor prioritisation, and inspection sign-off—not continuous daily washing of every hectare. Technicians execute waterless brush cycles when wind, rain, and site conditions are safe; <strong>wind holds</strong> apply, and passes are skipped or deferred after effective rain when glass is already rinsed.</p>
<p>Seasonal soiling still dictates intensity: busier months concentrate portables on downwind edges, haul-road strings, and blocks with the steepest inverter trends—often comparable in <em>frequency philosophy</em> to the <strong>3–10 cycles per month</strong> band used on automatic peers, without implying one robot pass per module per night. See <a href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system">semi-automatic systems</a> and <a href="/cleaning-technology">cleaning technology</a>.</p>`;

export const seasonalCalendarHtml = `<h2>Seasonal operating calendar</h2>
<p><strong>Jan–Feb:</strong> review brush wear and cycle plans; validate wind and rain hold rules in NECTYR or inspection logs. <strong>Mar–Jun:</strong> peak dust—scheduled cycle density increases on priority blocks (weather permitting), often toward the <strong>6–10 cycles per month</strong> class for automatic fleets; not nightly coverage of every module. <strong>Monsoon transition:</strong> stand down or lighten cycles after effective rain; inspection-heavy weeks where appropriate. <strong>Post-monsoon:</strong> re-walk paths after vegetation or civil works; update block timers before the next approved cleaning window.</p>`;

/** Tier 2 + priority legacy slugs with verified Excel stats */
export const TIER2_SITES = {
  "soyegaon-solar-project": {
    title: "Soyegaon, Maharashtra",
    mw: 100,
    state: "Maharashtra",
    auto: 54,
    semi: 36,
    year: "2024",
    product: "GLYDE, NYUMA",
    mode: "Mixed automatic + semi-automatic",
    nectyr: true,
    water: "14 million",
    gwh: "3.75",
    co2: "1,860",
    region:
      "semi-arid Maharashtra with agricultural dust, seasonal haze, and bird-droppings pressure on select blocks",
    fleetPitch:
      "Fifty-four GLYDE automatic robots anchor scheduled dual-pass cycles on repeatable rows; thirty-six NYUMA semi-automatic units cover transitions, irregular tables, and blocks still onboarding to full scheduled GLYDE paths—a 90-machine mixed fleet at ~0.90 robots/MW.",
    unique:
      "Soyegaon sits between Agar’s 200&nbsp;MW mixed intensity and Chhayan’s smaller automatic-only reference: at 100&nbsp;MW it shows how Maharashtra agricultural vicinities need both NECTYR-scheduled GLYDE and portable NYUMA insurance.",
    peers: [
      ["agar-solar-project", "Agar (200&nbsp;MW, 265+7 mixed)", "higher automatic share at larger nameplate"],
      ["chhayan-rajasthan-150-mw", "Chhayan (150&nbsp;MW, 25 automatic)", "automatic-only mid-scale contrast"],
      ["seci-2-200-mw", "SECI-2 (200&nbsp;MW, 103+76 mixed)", "similar mixed split philosophy"],
    ],
    extra: `<h2>Maharashtra agricultural vicinity and bird-droppings risk</h2>
<p>Soyegaon’s soiling mix includes agricultural film and bird-droppings pockets that standard PR aggregates can hide. NECTYR block priorities should elevate those strings when telemetry or IV trends flag localized loss—scheduled GLYDE cycles on repeatable rows plus NYUMA passes on problem tables.</p>
<p>Monsoon weeks may reduce automatic cycle counts while inspections confirm rain-rinsed blocks; supervisors document skipped cycles as weather outcomes, not fleet failures.</p>
<h2>Mixed-fleet weekly governance</h2>
<p>Publish which blocks are GLYDE-only versus NYUMA-required; rotate technicians between NECTYR supervision and portable coverage weeks. Finance reviews should pair 14&nbsp;million litres and 3.75&nbsp;GWh claims with hold logs and semi-automatic inspection samples.</p>`,
  },
  "banda-solar-project": {
    title: "Banda, Uttar Pradesh",
    mw: 70,
    state: "Uttar Pradesh",
    auto: 106,
    semi: 54,
    year: "2024",
    product: "GLYDE, NYUMA",
    mode: "Mixed automatic + semi-automatic",
    nectyr: true,
    water: "9.8 million",
    gwh: "2.63",
    co2: "1,302",
    region:
      "Bundelkhand-class aridity on the 70&nbsp;MW table—high dust, acute water stress, and remote labour logistics",
    fleetPitch:
      "One hundred six GLYDE automatic units plus fifty-four NYUMA semi-automatic machines—160 robots on 70&nbsp;MW (~2.29 robots/MW)—reflect an owner decision to prioritise cycle frequency and logged coverage over minimising capital units on paper.",
    unique:
      "Banda is a coverage-intensity story: robot count is higher than many 200&nbsp;MW peers because row kilometres and dust return windows demanded more scheduled automatic passes plus semi-automatic gap-fill, not because 70&nbsp;MW mechanically requires 160 machines on every site.",
    peers: [
      ["agar-solar-project", "Agar (200&nbsp;MW, 272 mixed)", "similar high-intensity mixed philosophy at larger scale"],
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, 54+36 mixed)", "Maharashtra mixed reference"],
      ["kmf-karnataka-75-mw", "KMF Karnataka (75&nbsp;MW, 85 automatic)", "automatic-only contrast at similar tariff class"],
    ],
    extra: `<h2>Bundelkhand water stress and tanker OPEX</h2>
<p>Banda’s 9.8&nbsp;million litres avoided should be modelled against historical tanker spend and wet-wash crew costs on 70&nbsp;MW—not against a hypothetical daily wash programme that the site could not sustain anyway.</p>
<h2>High robots/MW governance</h2>
<p>With 160 machines, spare logistics and NECTYR alert triage must be enterprise-grade: brush batches before March, named owners for map updates, and weekly reviews of idle minutes versus completion on priority blocks.</p>`,
  },
  "kmf-karnataka-75-mw": {
    title: "KMF, Karnataka",
    mw: 75,
    state: "Karnataka",
    auto: 85,
    semi: 0,
    year: "2025",
    product: "GLYDE",
    mode: "Fully automatic",
    nectyr: true,
    water: "10.5 million",
    gwh: "2.81",
    co2: "1,395",
    region:
      "Karnataka dry-season dust with occasional red-soil particulate and moderate-to-high seasonal soiling",
    fleetPitch:
      "Eighty-five GLYDE automatic robots (~1.13 robots/MW) on repeatable ground-mount rows—automatic-first with NECTYR from 2025 commissioning, no semi-automatic gap tranche in this phase.",
    unique:
      "KMF shows that 75&nbsp;MW can carry automatic density above Bachau’s 0.57 robots/MW when rows support autonomic paths end to end—compare before assuming all 75&nbsp;MW plants should look like SECI Phase semi-automatic peers.",
    peers: [
      ["seci-phase-1gujrat-75-mw", "SECI Phase 1 Gujarat (75&nbsp;MW, 71 GLYDE)", "closest automatic peer"],
      ["panshina-gujrat-75-mw", "Panshina Gujarat (75&nbsp;MW, 91+3 mixed)", "mixed Gujarat reference"],
      ["chhayan-rajasthan-150-mw", "Chhayan (150&nbsp;MW, 25 automatic)", "lower robots/MW automatic reference"],
    ],
    extra: `<h2>Karnataka red-soil particulate and brush PM</h2>
<p>Red-soil particulate can increase brush wear versus pure sand—PM intervals should be local. Eighty-five GLYDE units depend on NECTYR weather holds during coastal-influenced humidity spikes as well as dry-season dust.</p>
<h2>2025 commissioning habits</h2>
<p>Establish block timers, hold policies, and spare lead times at handover—smaller fleets than Banda but higher automatic share per MW.</p>`,
  },
  "seci-phase-1gujrat-75-mw": {
    title: "SECI Phase 1, Gujarat",
    mw: 75,
    state: "Gujarat",
    auto: 71,
    semi: 0,
    year: "",
    product: "GLYDE",
    mode: "Fully automatic",
    nectyr: true,
    water: "10.5 million",
    gwh: "2.81",
    co2: "1,395",
    region: "Gujarat arid dust corridors on a 75&nbsp;MW SECI-phase ground-mount table",
    fleetPitch:
      "Seventy-one GLYDE automatic units (~0.95 robots/MW) with NECTYR scheduling—automatic-first on repeatable rows without a semi-automatic tranche in this workbook row.",
    unique:
      "SECI Phase 1 pairs with Phase 2 on the same programme family: Phase 1 is the NECTYR automatic reference; Phase 2 is the inspection-led semi-automatic contrast on identical nameplate class.",
    peers: [
      ["seci-phase-2gujrat-75-mw", "SECI Phase 2 Gujarat (75&nbsp;MW, semi-automatic NYUMA)", "sibling phase, different fleet philosophy"],
      ["bachau-dvc-gujrat-300-mw", "Bachau DVC (300&nbsp;MW, 172 automatic)", "mega-scale Gujarat automatic"],
      ["panshina-gujrat-75-mw", "Panshina (75&nbsp;MW, 91+3 mixed)", "mixed 75&nbsp;MW peer"],
    ],
    extra: `<h2>SECI Phase 1 as the automatic sibling</h2>
<p>Procurement committees comparing SECI phases should read Phase 1 and Phase 2 together: 71 GLYDE machines with NECTYR versus Phase 2 inspection-led NYUMA—same 75&nbsp;MW class, different accountability layers.</p>`,
  },
  "seci-phase-2gujrat-75-mw": {
    title: "SECI Phase 2, Gujarat",
    mw: 75,
    state: "Gujarat",
    auto: 0,
    semi: 0,
    semiNote: true,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "10.5 million",
    gwh: "2.81",
    co2: "1,395",
    region: "Gujarat arid exposure with water-scarce wet-wash logistics on a 75&nbsp;MW SECI-phase table",
    fleetPitch:
      "NYUMA semi-automatic waterless programme under CAPEX—weekly block plans and inspection sign-off as the primary accountability layer (workbook row lists semi-automatic mode without a published machine count; validate fleet size with commissioning records).",
    unique:
      "Phase 2 proves the same 75&nbsp;MW SECI context can choose portable semi-automatic coverage when automatic path maturity or capital phasing differs from Phase 1—compare sibling outcomes, not robot brochures.",
    peers: [
      ["seci-phase-1gujrat-75-mw", "SECI Phase 1 (75&nbsp;MW, 71 GLYDE + NECTYR)", "automatic sibling"],
      ["bhadlarajasthan-300-mw", "Bhadla (300&nbsp;MW, 40 semi-automatic)", "semi-automatic at larger scale"],
      ["akhadana-rajasthan-360-mw", "Akhadana (360&nbsp;MW, 80 semi-automatic)", "mega semi-automatic reference"],
    ],
    extra: `<h2>Inspection evidence pack for lenders</h2>
<p>Provide sample weekly block plans, inspection sign-offs, and SCADA trends on downwind blocks after portable cycles—Phase 2’s proof model differs from Phase 1 NECTYR exports but must be equally auditable.</p>
<h2>Upgrade path to NECTYR</h2>
<p>When telematics arrive, block IDs on inspection sheets should map cleanly to dashboard blocks—discipline first, dashboards second.</p>`,
  },
  "panshina-gujrat-75-mw": {
    title: "Panshina, Gujarat",
    mw: 75,
    state: "Gujarat",
    auto: 91,
    semi: 3,
    year: "2025",
    product: "GLYDE, NYUMA",
    mode: "Mixed (automatic majority)",
    nectyr: true,
    water: "10.5 million",
    gwh: "2.81",
    co2: "1,395",
    region: "Gujarat high-dust 75&nbsp;MW ground mount with water and remote-labour constraints",
    fleetPitch:
      "Ninety-one GLYDE automatic robots plus three NYUMA semi-automatic units (~1.25 robots/MW)—automatic-heavy mixed fleet with NECTYR from 2025 commissioning; portables are insurance on irregular blocks, not a parallel wash crew.",
    unique:
      "Panshina is the automatic-majority 75&nbsp;MW template: three semi-automatic machines are gap-fill, not a second programme—finance should model GLYDE scheduled cycles as the core O&amp;M rhythm.",
    peers: [
      ["kmf-karnataka-75-mw", "KMF Karnataka (75&nbsp;MW, 85 automatic)", "automatic-only peer"],
      ["seci-phase-1gujrat-75-mw", "SECI Phase 1 (71 automatic)", "similar automatic density"],
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, 54+36 mixed)", "more balanced mixed split"],
    ],
    extra: `<h2>Three portables as gap-fill only</h2>
<p>Finance should not budget three NYUMA units as a second cleaning programme—they cover irregular geometry while 91 GLYDE machines execute NECTYR-scheduled dual-pass cycles on the repeatable table.</p>
<h2>Gujarat 2025 automatic-majority playbook</h2>
<p>Align with Bachau-style governance on map updates and weather holds at smaller nameplate—91 robots still need spare batches before dust season.</p>`,
  },
};
