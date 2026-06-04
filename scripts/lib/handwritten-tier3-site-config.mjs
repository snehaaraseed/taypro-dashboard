/** Tier 3 priority sites (<75 MW) — stats from Projects_Case_Studies workbook. */

import { TIER3_REMAINING_SITES } from "./handwritten-tier3-remaining.mjs";

const TIER3_CORE_SITES = {
  "yadgir-solar-project-50-mw": {
    title: "Yadgir, Karnataka",
    mw: 50,
    state: "Karnataka",
    auto: 96,
    semi: 19,
    year: "2022",
    product: "GLYDE, NYUMA",
    mode: "Mixed automatic + semi-automatic",
    nectyr: true,
    water: "7 million",
    gwh: "1.88",
    co2: "930",
    region:
      "Karnataka dry-season dust with high row kilometres on a fifty-megawatt table",
    fleetPitch:
      "Ninety-six GLYDE automatic robots plus nineteen NYUMA semi-automatic units—115 machines on 50&nbsp;MW (~2.30 robots/MW)—one of Taypro’s highest coverage-intensity fifty-megawatt mixed programmes.",
    unique:
      "Yadgir shows that fifty megawatts can carry more robots per MW than many seventy-five or one-hundred megawatt peers when dust return windows and row repeatability demand logged coverage—not a universal density rule.",
    peers: [
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, 54+36 mixed)", "similar mixed split at larger nameplate"],
      ["kmf-karnataka-75-mw", "KMF (75&nbsp;MW, 85 automatic)", "Karnataka automatic-first contrast"],
      ["chhayan-rajasthan-150-mw", "Chhayan (150&nbsp;MW, 25 automatic)", "lower robots/MW automatic reference"],
    ],
    extra: `<h2>High robots/MW governance at fifty megawatts</h2>
<p>Supervisors run enterprise-grade NECTYR triage: downwind blocks first, spare batches before March, weekly idle-minute reviews. Finance should not copy 2.30 robots/MW without row maps and SCADA proof.</p>`,
  },
  "deoria-60-mw": {
    title: "Deoria, Uttar Pradesh",
    mw: 60,
    state: "Uttar Pradesh",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2023",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "8.4 million",
    gwh: "2.25",
    co2: "1,116",
    region:
      "eastern Uttar Pradesh dust and water stress on a sixty-megawatt ground-mount table",
    fleetPitch:
      "NYUMA semi-automatic waterless programme under CAPEX—the workbook row lists one semi-automatic unit on sixty megawatts; validate full portable fleet scope and block-coverage plan with commissioning records, not robot count alone.",
    unique: `Deoria is a low robots/MW semi-automatic story: prioritised block coverage and inspection discipline can report strong water and GWh outcomes without automatic density—compare <a href="/projects/khanak-50-mw">Khanak (50&nbsp;MW, ten portables)</a> and mega-scale semi-automatic peers.`,
    peers: [
      ["khanak-50-mw", "Khanak (50&nbsp;MW, ten NYUMA semi-automatic)", "similar portable-first philosophy"],
      ["banda-solar-project", "Banda (70&nbsp;MW, 160 mixed)", "high-intensity contrast"],
      ["seci-phase-2gujrat-75-mw", "SECI Phase 2 (75&nbsp;MW, inspection-led NYUMA)", "Gujarat semi-automatic sibling"],
    ],
    extra: `<h2>Sixty megawatts with inspection-led accountability</h2>
<p>Weekly block plans and signed inspection rounds are the proof layer. Model <strong>8.4&nbsp;million litres</strong> and <strong>2.25&nbsp;GWh</strong> with conservative attribution—do not assume nightly plant-wide passes.</p>`,
  },
  "prayagraj-uttar-pradesh-50-mw": {
    title: "Prayagraj, Uttar Pradesh",
    mw: 50,
    state: "Uttar Pradesh",
    auto: 52,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Fully automatic",
    nectyr: true,
    water: "7 million",
    gwh: "1.88",
    co2: "930",
    region:
      "Prayagraj-region dust and Ganga-belt humidity swings on repeatable ground-mount rows",
    fleetPitch:
      "Fifty-two GLYDE automatic robots (~1.04 robots/MW) with NECTYR from 2024 commissioning—automatic-first on fifty megawatts without a semi-automatic tranche.",
    unique: `Prayagraj is the automatic-only fifty-megawatt reference in Uttar Pradesh—compare <a href="/projects/yadgir-solar-project-50-mw">Yadgir mixed high density</a> and <a href="/projects/khanak-50-mw">Khanak semi-automatic</a> before copying fleet splits.`,
    peers: [
      ["yadgir-solar-project-50-mw", "Yadgir (50&nbsp;MW, 96+19 mixed)", "mixed high-intensity contrast"],
      ["kmf-karnataka-75-mw", "KMF (75&nbsp;MW, 85 automatic)", "automatic peer at seventy-five MW"],
      ["seci-phase-1gujrat-75-mw", "SECI Phase 1 (71 automatic)", "similar automatic philosophy"],
    ],
    extra: `<h2>Automatic-first in Prayagraj region</h2>
<p>Establish NECTYR block timers and weather holds at handover; review completion weekly with inverter availability through the first full dust season after 2024.</p>`,
  },
  "maya-gujrat-50-mw": {
    title: "Maya, Gujarat",
    mw: 50,
    state: "Gujarat",
    auto: 44,
    semi: 50,
    year: "2026",
    product: "GLYDE, NYUMA",
    mode: "Mixed automatic + semi-automatic",
    nectyr: true,
    water: "7 million",
    gwh: "1.88",
    co2: "930",
    region:
      "Gujarat arid dust on a fifty-megawatt table with balanced automatic and portable split",
    fleetPitch:
      "Forty-four GLYDE automatic robots plus fifty NYUMA semi-automatic units—ninety-four machines on 50&nbsp;MW (~1.88 robots/MW) with a near-balanced mixed fleet and NECTYR on automatic rows.",
    unique:
      "Maya is unusual: semi-automatic count equals or exceeds automatic GLYDE units—portable insurance and irregular blocks likely dominate O&amp;M rhythm alongside NECTYR-scheduled automatic cycles.",
    peers: [
      ["seci-1-50-mw", "SECI-1 (50&nbsp;MW, 44+50 mixed)", "similar balanced mixed split"],
      ["panshina-gujrat-75-mw", "Panshina (75&nbsp;MW, 91+3 automatic-majority)", "Gujarat automatic-heavy contrast"],
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, 54+36 mixed)", "larger mixed reference"],
    ],
    extra: `<h2>Balanced mixed fleet coordination</h2>
<p>Publish one O&amp;M calendar: GLYDE completion in NECTYR plus NYUMA inspection sheets for portable zones. Rotate crews so mixed fleets do not silo during 2026 commissioning.</p>`,
  },
  "khanak-50-mw": {
    title: "Khanak",
    mw: 50,
    state: "India",
    auto: 0,
    semi: 10,
    year: "2021",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "7 million",
    gwh: "1.88",
    co2: "930",
    region:
      "site-specific dust exposure with water-scarce wet-wash logistics on a fifty-megawatt table",
    fleetPitch:
      "Ten NYUMA semi-automatic portables (~0.20 robots/MW) under CAPEX—weekly block plans and inspection sign-off as the primary accountability layer since 2021 commissioning.",
    unique: `Khanak proves fifty megawatts can run portable-first waterless programmes with disciplined scheduling—compare <a href="/projects/deoria-60-mw">Deoria</a> and <a href="/projects/akhadana-rajasthan-360-mw">Akhadana mega semi-automatic</a> for scale contrasts.`,
    peers: [
      ["deoria-60-mw", "Deoria (60&nbsp;MW, inspection-led NYUMA)", "low robots/MW semi-automatic"],
      ["bhadlarajasthan-300-mw", "Bhadla (300&nbsp;MW, 40 semi-automatic)", "semi-automatic at larger scale"],
      ["yadgir-solar-project-50-mw", "Yadgir (50&nbsp;MW, 115 mixed)", "high-intensity fifty MW contrast"],
    ],
    extra: `<h2>Ten portables on fifty megawatts</h2>
<p>Prioritise downwind and high marginal MWh blocks; document brush IDs on inspection sheets. Upgrade path to NECTYR when telematics arrive—block IDs first, dashboards second.</p>`,
  },
  "seci-1-50-mw": {
    title: "SECI-1",
    mw: 50,
    state: "India",
    auto: 44,
    semi: 50,
    year: "",
    product: "GLYDE, NYUMA",
    mode: "Mixed automatic + semi-automatic",
    nectyr: true,
    water: "7 million",
    gwh: "1.88",
    co2: "930",
    region:
      "fifty-megawatt SECI-programme table with balanced GLYDE and NYUMA deployment",
    fleetPitch:
      "Forty-four GLYDE automatic units plus fifty NYUMA semi-automatic machines—ninety-four robots on 50&nbsp;MW (~1.88 robots/MW)—balanced mixed fleet with NECTYR on automatic rows.",
    unique:
      "SECI-1 at fifty megawatts mirrors Maya’s balanced split: procurement committees should read both as mixed-programme references, not automatic-only brochures.",
    peers: [
      ["maya-gujrat-50-mw", "Maya Gujarat (50&nbsp;MW, 44+50 mixed)", "Gujarat balanced mixed peer"],
      ["seci-phase-1gujrat-75-mw", "SECI Phase 1 (75&nbsp;MW, 71 automatic)", "larger SECI automatic reference"],
      ["seci-phase-2gujrat-75-mw", "SECI Phase 2 (75&nbsp;MW, inspection-led NYUMA)", "SECI semi-automatic sibling"],
    ],
    extra: `<h2>SECI fifty-megawatt mixed programme</h2>
<p>Filter NECTYR alerts to misses and idle trends on forty-four GLYDE units; maintain portable inspection discipline on fifty NYUMA zones—one calendar for electrical and robotic O&amp;M.</p>`,
  },

  "rajkot-gujrat-25-mw": {
    title: "Rajkot, Gujarat",
    mw: 25,
    state: "Gujarat",
    auto: 51,
    semi: 3,
    year: "2026",
    product: "GLYDE, NYUMA",
    mode: "Mixed automatic + semi-automatic",
    nectyr: true,
    water: "3.5 million",
    energyUplift: "937.5 MWh",
    gwh: "0.94",
    co2: "465",
    region: "Gujarat arid dust on a twenty-five-megawatt ground-mount table",
    fleetPitch:
      "Fifty-one GLYDE automatic robots plus three NYUMA semi-automatic units—fifty-four machines on 25&nbsp;MW (~2.16 robots/MW)—high automatic density for the nameplate class.",
    unique:
      "Rajkot shows twenty-five megawatts can carry more GLYDE units than many fifty-megawatt automatic-only peers when row repeatability and dust return windows demand logged coverage.",
    peers: [
      ["panshina-gujrat-75-mw", "Panshina (75&nbsp;MW, 91+3 mixed)", "Gujarat mixed reference"],
      ["maya-gujrat-50-mw", "Maya (50&nbsp;MW, 44+50 mixed)", "balanced mixed at fifty MW"],
      ["kmf-karnataka-75-mw", "KMF (75&nbsp;MW, 85 automatic)", "automatic-only contrast"],
    ],
    extra: `<h2>High GLYDE density at twenty-five megawatts</h2>
<p>Fifty-one automatic units require docking cartography and NECTYR alert triage before 2026 dust season—three portables cover irregular blocks only.</p>`,
  },

  "chennai-10-mw": {
    title: "Chennai, Tamil Nadu",
    mw: 10,
    state: "Tamil Nadu",
    auto: 0,
    semi: 2,
    year: "2024",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "coastal-influenced soiling and humidity on a ten-megawatt table",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.20 robots/MW) with inspection-led weekly block plans since 2024 commissioning.",
    unique: `Chennai illustrates humid-coastal portable-first coverage at ten megawatts—compare <a href="/projects/khopoli-25-mw">Khopoli automatic micro-utility</a> and <a href="/projects/yadgir-solar-project-50-mw">Yadgir high-density mixed</a> for scale contrasts.`,
    peers: [
      ["khanak-50-mw", "Khanak (50&nbsp;MW, ten portables)", "larger portable-first reference"],
      ["nathdwara-74-mw", "Nathdwara (~7.4&nbsp;MW, three portables)", "Rajasthan semi-automatic micro scale"],
      ["deoria-60-mw", "Deoria (60&nbsp;MW, inspection-led)", "low robots/MW contrast"],
    ],
    extra: `<h2>Coastal humidity and portable holds</h2>
<p>Wind and rain holds matter as much as dust fronts; document skipped cycles after effective rain in inspection logs.</p>`,
  },

  "yavatmal-kupti-14-mw": {
    title: "Yavatmal, Kupti",
    mw: 14,
    state: "Maharashtra",
    auto: 0,
    semi: 5,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "2 million",
    energyUplift: "525 MWh",
    gwh: "0.525",
    co2: "260",
    region: "Maharashtra red-soil and seasonal dust on a fourteen-megawatt table",
    fleetPitch:
      "Five NYUMA semi-automatic portables (~0.36 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Kupti sits between ten-megawatt portable programmes and fifty-megawatt mixed fleets—five portables on fourteen megawatts need strict block prioritisation.",
    peers: [
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "smaller Tamil Nadu contrast"],
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, mixed)", "Maharashtra mixed at scale"],
      ["khanak-50-mw", "Khanak (50&nbsp;MW, ten portables)", "portable-first fifty MW"],
    ],
    extra: `<h2>Five portables on fourteen megawatts</h2>
<p>Prioritise downwind blocks; track brush wear in dust-season hours; pair <strong>2 million litres</strong> with <strong>525 MWh</strong> at conservative attribution.</p>`,
  },

  "nathdwara-74-mw": {
    title: "Nathdwara, Rajasthan",
    mw: 7.4,
    state: "Rajasthan",
    auto: 0,
    semi: 3,
    year: "2023",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1 million",
    energyUplift: "277.5 MWh",
    gwh: "0.278",
    co2: "138",
    region: "Rajasthan dust on a sub-ten-megawatt ground-mount table (nameplate slug reflects programme grouping)",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.41 robots/MW on 7.4&nbsp;MW reported nameplate) with inspection-led accountability since 2023.",
    unique:
      "Validate nameplate versus field layout in procurement packs—statistics in this case study follow workbook nameplate and reported operational outcomes.",
    peers: [
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "similar micro-scale portable"],
      ["bhadlarajasthan-300-mw", "Bhadla (300&nbsp;MW, forty portables)", "Rajasthan semi-automatic at scale"],
      ["chhayan-rajasthan-150-mw", "Chhayan (150&nbsp;MW, automatic)", "Rajasthan automatic contrast"],
    ],
    extra: `<h2>Micro-utility semi-automatic discipline</h2>
<p>Three portables succeed with weekly queues visible to O&amp;M and finance—not anecdotal cleaning claims.</p>`,
  },

  "haryana-149-mw": {
    title: "Haryana",
    mw: 14.9,
    state: "Haryana",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2021",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "2.1 million",
    energyUplift: "558.8 MWh",
    gwh: "0.559",
    co2: "277",
    region: "Haryana dust and agricultural vicinity soiling on a sub-fifteen-megawatt table",
    fleetPitch:
      "NYUMA semi-automatic programme under CAPEX—workbook lists one semi-automatic unit; validate portable fleet scope and block-coverage plan with commissioning records.",
    unique:
      "Haryana demonstrates low robots/MW semi-automatic outcomes on sub-fifteen-megawatt nameplate—prioritisation and inspection evidence matter more than robot count.",
    peers: [
      ["deoria-60-mw", "Deoria (60&nbsp;MW, inspection-led)", "Uttar Pradesh low-density semi-automatic"],
      ["khanak-50-mw", "Khanak (50&nbsp;MW, ten portables)", "portable-first contrast"],
      ["prayagraj-uttar-pradesh-50-mw", "Prayagraj (50&nbsp;MW, fifty-two automatic)", "automatic fifty MW contrast"],
    ],
    extra: `<h2>Inspection-led coverage in Haryana</h2>
<p>Model <strong>2.1&nbsp;million litres</strong> and <strong>558.8&nbsp;MWh</strong> with conservative attribution—weekly block plans must be auditable.</p>`,
  },

  "khopoli-25-mw": {
    title: "Khopoli, Maharashtra",
    mw: 2.5,
    state: "Maharashtra",
    auto: 16,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Fully automatic",
    nectyr: true,
    water: "350 thousand",
    energyUplift: "93.8 MWh",
    gwh: "0.094",
    co2: "47",
    region: "Western Maharashtra industrial corridor dust on a 2.5&nbsp;MW automatic table",
    fleetPitch:
      "Sixteen GLYDE automatic robots on 2.5&nbsp;MW (~6.4 robots/MW)—micro-utility automatic density with NECTYR from 2024 commissioning.",
    unique:
      "Khopoli is a micro-utility automatic reference: slug may read twenty-five megawatts but reported nameplate is 2.5&nbsp;MW—always validate MW and row maps in contracts.",
    peers: [
      ["chakan-vi-25-mw", "Chakan-VI (2.5&nbsp;MW, twelve GLYDE)", "Pune industrial belt peer"],
      ["chennai-10-mw", "Chennai (10&nbsp;MW, portable)", "semi-automatic contrast"],
      ["chhayan-rajasthan-150-mw", "Chhayan (150&nbsp;MW, automatic)", "mid-scale automatic reference"],
    ],
    extra: `<h2>Sixteen GLYDE units on 2.5&nbsp;MW</h2>
<p>High robots/MW at micro scale demands spare discipline and NECTYR completion review—idle minutes are costly on small nameplates.</p>`,
  },

  "chakan-vi-25-mw": {
    title: "Chakan-VI, Maharashtra",
    mw: 2.5,
    state: "Maharashtra",
    auto: 12,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Fully automatic",
    nectyr: true,
    water: "350 thousand",
    energyUplift: "93.8 MWh",
    gwh: "0.094",
    co2: "47",
    region: "Chakan industrial belt particulate on a 2.5&nbsp;MW automatic table",
    fleetPitch:
      "Twelve GLYDE automatic robots on 2.5&nbsp;MW (~4.8 robots/MW) with NECTYR scheduling from 2024 commissioning.",
    unique:
      "Chakan-VI pairs with Khopoli as Maharashtra micro-automatic peers—compare docking placement and night-window logistics on repeatable short rows.",
    peers: [
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "higher robots/MW micro automatic"],
      ["sungazing-25-mw", "Sungazing (2.5&nbsp;MW, five portables)", "semi-automatic micro contrast"],
      ["kmf-karnataka-75-mw", "KMF (75&nbsp;MW, eighty-five automatic)", "utility-scale automatic"],
    ],
    extra: `<h2>Chakan micro-automatic habits</h2>
<p>Establish block timers and weather holds at handover; review completion weekly through the first dust season.</p>`,
  },

  "sungazing-25-mw": {
    title: "Sungazing",
    mw: 2.5,
    state: "India",
    auto: 0,
    semi: 5,
    year: "2025",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "350 thousand",
    energyUplift: "93.8 MWh",
    gwh: "0.094",
    co2: "47",
    region: "site-specific dust on a 2.5&nbsp;MW portable-first table",
    fleetPitch:
      "Five NYUMA semi-automatic portables on 2.5&nbsp;MW (~2.0 robots/MW) with inspection-led plans from 2025 commissioning.",
    unique:
      "Sungazing contrasts Khopoli and Chakan-VI automatic micro programmes—five portables prove waterless coverage without GLYDE on every row.",
    peers: [
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "automatic micro peer"],
      ["chakan-vi-25-mw", "Chakan-VI (2.5&nbsp;MW, twelve GLYDE)", "automatic micro peer"],
      ["nathdwara-74-mw", "Nathdwara (~7.4&nbsp;MW, three portables)", "semi-automatic micro"],
    ],
    extra: `<h2>Five portables on 2.5&nbsp;MW (2025)</h2>
<p>Publish weekly block queues; document brush IDs; pair micro-scale statistics with conservative MWh attribution.</p>`,
  },

  "nayveli-10-mw": {
    title: "Nayveli, Tamil Nadu",
    mw: 10,
    state: "Tamil Nadu",
    auto: 3,
    semi: 0,
    year: "2023",
    product: "GLYDE",
    mode: "Fully automatic",
    nectyr: true,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Tamil Nadu coastal-influenced dust and humidity on a ten-megawatt table",
    fleetPitch:
      "Three GLYDE automatic robots on 10&nbsp;MW (~0.30 robots/MW) with NECTYR scheduling from 2023 commissioning—compact automatic footprint on repeatable rows.",
    unique: `Nayveli is the ten-megawatt automatic reference in Tamil Nadu—compare <a href="/projects/chennai-10-mw">Chennai semi-automatic portables</a> and <a href="/projects/yavatmal-kupti-14-mw">Kupti fourteen-megawatt portables</a> for mode contrasts.`,
    peers: [
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "semi-automatic Tamil Nadu peer"],
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "micro automatic density contrast"],
      ["prayagraj-uttar-pradesh-50-mw", "Prayagraj (50&nbsp;MW, fifty-two automatic)", "automatic at larger scale"],
    ],
    extra: `<h2>Three GLYDE units on ten megawatts</h2>
<p>Low robots/MW succeeds when rows are repeatable and NECTYR proves completion—do not copy Yadgir density without maps.</p>`,
  },

  "nashik-shinde-10-mw": {
    title: "Nashik-Shinde, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Nashik district agricultural and road dust on a ten-megawatt ground-mount table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Nashik-Shinde typifies Maharashtra ten-megawatt portable clusters—four machines cover prioritised blocks, not uniform nightly hectares.",
    peers: [
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW, four portables)", "Ahmadnagar cluster peer"],
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "smaller portable count"],
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, mixed)", "Maharashtra mixed at scale"],
    ],
    extra: `<h2>Nashik district portable discipline</h2>
<p>Wind holds after dust fronts; rain skips documented on inspection sheets; pair <strong>1.4 million litres</strong> with <strong>375 MWh</strong> at conservative attribution.</p>`,
  },

  "sangali-kontya-bobladtikondi-10-mw": {
    title: "Sangali-Kontya Boblad/Tikondi, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Sangli district dust and agricultural film on a ten-megawatt table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with inspection-led weekly coverage on the Boblad/Tikondi table.",
    unique:
      "Sangli-Kontya shows how ten-megawatt tables in western Maharashtra standardise on four-portable programmes with shared statistics bands in the workbook—validate each site with local SCADA.",
    peers: [
      ["nashik-shinde-10-mw", "Nashik-Shinde (10&nbsp;MW, four portables)", "Maharashtra ten MW peer"],
      ["ahmadnagar-kharda-10-mw", "Ahmadnagar Kharda (10&nbsp;MW, four portables)", "Ahmadnagar cluster peer"],
      ["khanak-50-mw", "Khanak (50&nbsp;MW, ten portables)", "larger portable-first reference"],
    ],
    extra: `<h2>Sangli ten-megawatt block prioritisation</h2>
<p>Downwind strings and haul-road edges lead weekly queues; interior blocks cycle when marginal MWh per pass remains above finance thresholds.</p>`,
  },

  "ahmadnagar-masale-10-mw": {
    title: "Ahmadnagar-Masale, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Ahmadnagar district semi-arid dust on the Masale ten-megawatt table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with published weekly block plans since commissioning.",
    unique:
      "Masale is one of several Ahmadnagar ten-megawatt portable programmes—procurement should treat each site as geographically distinct even when statistics match in the workbook.",
    peers: [
      ["ahmadnagar-kharda-10-mw", "Ahmadnagar Kharda (10&nbsp;MW)", "sibling Ahmadnagar cluster"],
      ["ahmadnagar-jalalpur-10-mw", "Ahmadnagar Jalalpur (10&nbsp;MW)", "sibling Ahmadnagar cluster"],
      ["nashik-shinde-10-mw", "Nashik-Shinde (10&nbsp;MW)", "Nashik portable peer"],
    ],
    extra: `<h2>Ahmadnagar Masale inspection cadence</h2>
<p>Weekly sign-off visible to finance; brush wear tracked in dust-season hours; vegetation cuts trigger map updates before next portable pass.</p>`,
  },

  "ahmadnagar-kharda-10-mw": {
    title: "Ahmadnagar-Kharda, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Ahmadnagar district dust on the Kharda ten-megawatt ground-mount table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with inspection-led accountability.",
    unique:
      "Kharda shares the four-portable ten-megawatt pattern with Masale and Jalalpur—owners should still require site-specific row maps and SCADA correlation workshops.",
    peers: [
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["ahmadnagar-balwandi-10-mw", "Ahmadnagar Balwandi (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["yavatmal-kupti-14-mw", "Yavatmal Kupti (14&nbsp;MW, five portables)", "nearby fourteen MW portable"],
    ],
    extra: `<h2>Kharda portable staging and drive time</h2>
<p>Staging minimises deadhead between block groups; poor staging silently destroys portable productivity at ten megawatts.</p>`,
  },

  "ahmadnagar-jalalpur-10-mw": {
    title: "Ahmadnagar-Jalalpur, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Ahmadnagar district agricultural vicinity dust on the Jalalpur ten-megawatt table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Jalalpur highlights agricultural-vicinity soiling on ten-megawatt portable programmes—elevate downwind blocks when harvest or road traffic increases film soiling.",
    peers: [
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["soyegaon-solar-project", "Soyegaon (100&nbsp;MW, mixed)", "Maharashtra mixed at scale"],
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "smaller portable count"],
    ],
    extra: `<h2>Jalalpur agricultural dust fronts</h2>
<p>After harvest exposure, tighten weekly block priorities; after effective rain, inspection-walk blocks rain rinsed unevenly before rescheduling portables.</p>`,
  },

  "ahmadnagar-balwandi-10-mw": {
    title: "Ahmadnagar-Balwandi, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Ahmadnagar district dust on the Balwandi ten-megawatt table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with inspection-led waterless coverage.",
    unique:
      "Balwandi completes the Ahmadnagar ten-megawatt portable cluster narrative alongside Masale, Kharda, Jalalpur, and Nanduri Dumala—compare outcomes, not just robot counts.",
    peers: [
      ["ahmadnagar-nanduri-dumala-10-mw", "Ahmadnagar Nanduri Dumala (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["nashik-shinde-10-mw", "Nashik-Shinde (10&nbsp;MW)", "Nashik peer"],
    ],
    extra: `<h2>Balwandi lender evidence</h2>
<p>Attach sample inspection weeks and downwind SCADA trends with <strong>1.4 million litres</strong> and <strong>375 MWh</strong> on one assumption set.</p>`,
  },

  "ahmadnagar-nanduri-dumala-10-mw": {
    title: "Ahmadnagar-Nanduri Dumala, Maharashtra",
    mw: 10,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.4 million",
    energyUplift: "375 MWh",
    gwh: "0.375",
    co2: "186",
    region: "Ahmadnagar district dust on the Nanduri Dumala ten-megawatt table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans and signed inspection rounds.",
    unique:
      "Nanduri Dumala is the eastern Ahmadnagar cluster reference—four portables on ten megawatts with the same reported statistics band as peers; local PR slopes still require site-specific attribution.",
    peers: [
      ["ahmadnagar-balwandi-10-mw", "Ahmadnagar Balwandi (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["ahmadnagar-kharda-10-mw", "Ahmadnagar Kharda (10&nbsp;MW)", "Ahmadnagar cluster"],
      ["yavatmal-kupti-14-mw", "Yavatmal Kupti (14&nbsp;MW, five portables)", "fourteen MW portable"],
    ],
    extra: `<h2>Nanduri Dumala operations calendar</h2>
<p>Integrate portable weeks with inverter availability meetings; document partial passes honestly for trustworthy SCADA narratives.</p>`,
  },

  "sonar-bangla-14-mw": {
    title: "Sonar Bangla",
    mw: 1.4,
    state: "India",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2023",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "196 thousand",
    energyUplift: "52.5 MWh",
    gwh: "0.0525",
    co2: "26",
    region: "sub-two-megawatt ground-mount dust on a micro-utility table",
    fleetPitch:
      "One NYUMA semi-automatic portable on 1.4&nbsp;MW reported nameplate—validate block-coverage scope with commissioning records; weekly inspection-led plans drive outcomes, not robot density.",
    unique:
      "Sonar Bangla is a micro-utility semi-automatic reference: one portable can still report meaningful water and MWh when blocks are prioritised and weather holds are logged honestly.",
    peers: [
      ["dakuni-14-mw", "Dakuni (1.4&nbsp;MW, one portable)", "workbook twin statistics"],
      ["mangrol-12-mw", "Mangrol (1.2&nbsp;MW, two portables)", "two-portable micro contrast"],
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE automatic)", "automatic micro-utility contrast"],
    ],
    extra: `<h2>Micro-utility inspection evidence</h2>
<p>Publish weekly block IDs and skipped-cycle reasons; pair <strong>196 thousand litres</strong> and <strong>52.5 MWh</strong> with conservative attribution in lender refresh packs.</p>`,
  },

  "dakuni-14-mw": {
    title: "Dakuni",
    mw: 1.4,
    state: "India",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2023",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "196 thousand",
    energyUplift: "52.5 MWh",
    gwh: "0.0525",
    co2: "26",
    region: "sub-two-megawatt dust on a micro-utility portable programme",
    fleetPitch:
      "One NYUMA semi-automatic portable (~0.71 robots/MW on 1.4&nbsp;MW) with inspection-led weekly block plans since 2023 commissioning.",
    unique:
      "Dakuni mirrors Sonar Bangla in reported statistics—copy operations discipline (block queue, inspection sheets), not geography, when benchmarking micro portable programmes.",
    peers: [
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW, one portable)", "twin statistics band"],
      ["apex-nagpur-13-mw", "APEX Nagpur (1.3&nbsp;MW, five GLYDE automatic)", "automatic micro contrast"],
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "larger portable programme"],
    ],
    extra: `<h2>Dakuni portable-first accountability</h2>
<p>Supervisors treat one machine as a coverage queue, not a plant-wide nightly wash—document weather holds after rain and wind events.</p>`,
  },

  "mangrol-12-mw": {
    title: "Mangrol",
    mw: 1.2,
    state: "India",
    auto: 0,
    semi: 2,
    year: "2023",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "168 thousand",
    energyUplift: "45 MWh",
    gwh: "0.045",
    co2: "22",
    region: "sub-two-megawatt table with two portable machines",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~1.67 robots/MW on 1.2&nbsp;MW reported nameplate) with weekly block plans and signed inspection rounds.",
    unique:
      "Mangrol adds a second portable versus Sonar Bangla/Dakuni twins—compare deadhead routing and brush wear when scaling micro programmes.",
    peers: [
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW, one portable)", "single-portable micro"],
      ["dakuni-14-mw", "Dakuni (1.4&nbsp;MW, one portable)", "single-portable micro"],
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "automatic micro density"],
    ],
    extra: `<h2>Two portables on 1.2&nbsp;MW</h2>
<p>Rotate machines across downwind blocks; attach <strong>168 thousand litres</strong> and <strong>45 MWh</strong> to the same assumption set finance uses for ROI stress tests.</p>`,
  },

  "apex-nagpur-13-mw": {
    title: "APEX Nagpur",
    mw: 1.3,
    state: "Maharashtra",
    auto: 5,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Automatic",
    nectyr: true,
    water: "182 thousand",
    energyUplift: "48.8 MWh",
    gwh: "0.0488",
    co2: "24",
    region: "Nagpur-vicinity dust on a sub-two-megawatt automatic GLYDE table",
    fleetPitch:
      "Five GLYDE automatic robots (~3.85 robots/MW on 1.3&nbsp;MW reported nameplate) with NECTYR scheduled cycles and weather-aware holds from 2024 commissioning.",
    unique:
      "APEX Nagpur is the automatic micro-utility contrast to Sonar Bangla/Dakuni portable twins—high robots/MW on small nameplate demands docking discipline and spare batches, not anecdotal wash frequency.",
    peers: [
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "higher automatic density peer"],
      ["chakan-vi-25-mw", "Chakan-VI (2.5&nbsp;MW, twelve GLYDE)", "2.5&nbsp;MW automatic peer"],
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW, one portable)", "semi-automatic micro contrast"],
    ],
    extra: `<h2>NECTYR on sub-two-megawatt automatic rows</h2>
<p>Log completion, idle minutes, and wind holds weekly; do not market plant-wide nightly washing—scheduled cycles (~3–10/month typical) define utility programmes.</p>`,
  },

  "nashik-satyagaon-9-mw": {
    title: "Nashik-Satyagaon, Maharashtra",
    mw: 9,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.3 million",
    energyUplift: "337.5 MWh",
    gwh: "0.3375",
    co2: "167",
    region: "Nashik district dust and haul-road film on a nine-megawatt portable table",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.44 robots/MW) with weekly block plans and inspection sign-off on nine megawatts.",
    unique:
      "Satyagaon is the Nashik nine-megawatt portable reference—four machines on nine megawatts share the workbook statistics band with Sangli nine-megawatt peers; local PR slopes still need site-specific attribution.",
    peers: [
      ["nashik-dongagaon-8-mw", "Nashik-Dongagaon (8&nbsp;MW, three portables)", "Nashik cluster"],
      ["nashik-shinde-10-mw", "Nashik-Shinde (10&nbsp;MW, four portables)", "Nashik ten MW peer"],
      ["sangali-kognoli-9-mw", "Sangli-Kognoli (9&nbsp;MW, four portables)", "nine MW Sangli peer"],
    ],
    extra: `<h2>Nashik nine-megawatt block queue</h2>
<p>Publish portable weeks beside inverter availability; prioritise downwind blocks after dust fronts; pair <strong>1.3 million litres</strong> with <strong>337.5 MWh</strong> at fifty and seventy-five percent attribution.</p>`,
  },

  "nashik-dongagaon-8-mw": {
    title: "Nashik-Dongagaon, Maharashtra",
    mw: 8,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.1 million",
    energyUplift: "300 MWh",
    gwh: "0.3",
    co2: "149",
    region: "Nashik district agricultural-vicinity dust on an eight-megawatt table",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.38 robots/MW) with weekly block plans and inspection-led accountability.",
    unique:
      "Dongagaon sits between Nashik seven-megawatt three-portable sites and Satyagaon four-portable nine-megawatt coverage—tune block maps after civil or row changes.",
    peers: [
      ["nashik-kolam-bk-8-mw", "Nashik-Kolam BK (8&nbsp;MW, three portables)", "Nashik twin statistics"],
      ["nashik-satyagaon-9-mw", "Nashik-Satyagaon (9&nbsp;MW, four portables)", "Nashik nine MW"],
      ["nashik-shinde-10-mw", "Nashik-Shinde (10&nbsp;MW, four portables)", "ten MW Nashik peer"],
    ],
    extra: `<h2>Dongagaon portable staging</h2>
<p>Minimise deadhead between blocks; document partial passes honestly for trustworthy SCADA workshops with electrical O&amp;M.</p>`,
  },

  "nashik-kolam-bk-8-mw": {
    title: "Nashik-Kolam BK, Maharashtra",
    mw: 8,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.1 million",
    energyUplift: "300 MWh",
    gwh: "0.3",
    co2: "149",
    region: "Nashik district dust on the Kolam BK eight-megawatt portable programme",
    fleetPitch:
      "Three NYUMA semi-automatic portables with weekly inspection rounds—the workbook statistics band matches Dongagaon and Dharashiv eight-megawatt peers.",
    unique:
      "Kolam BK is a Nashik cluster diligence anchor—validate local layout and inverter strings before copying 300&nbsp;MWh stress tests from peer tables.",
    peers: [
      ["nashik-dongagaon-8-mw", "Nashik-Dongagaon (8&nbsp;MW)", "Nashik cluster"],
      ["dharashiv-naldurg-8-mw", "Dharashiv-Naldurg (8&nbsp;MW)", "eight MW portable peer"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "Ahmadnagar eight MW"],
    ],
    extra: `<h2>Kolam BK inspection calendar</h2>
<p>Integrate portable weeks with monthly SCADA correlation—skipped cycles after effective rain are weather outcomes, not O&amp;M failures.</p>`,
  },

  "dharashiv-naldurg-8-mw": {
    title: "Dharashiv-Naldurg, Maharashtra",
    mw: 8,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.1 million",
    energyUplift: "300 MWh",
    gwh: "0.3",
    co2: "149",
    region: "Dharashiv district dust on an eight-megawatt semi-automatic table",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.38 robots/MW) with weekly block plans and signed inspection evidence.",
    unique:
      "Naldurg extends the eight-megawatt portable statistics band east of Nashik—compare brush wear and downwind prioritisation with Kolam BK and Sasewadi in lender packs.",
    peers: [
      ["nashik-kolam-bk-8-mw", "Nashik-Kolam BK (8&nbsp;MW)", "eight MW twin band"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "Ahmadnagar eight MW"],
      ["solapur-gulwanchi-7-mw", "Solapur-Gulwanchi (7&nbsp;MW, three portables)", "seven MW portable"],
    ],
    extra: `<h2>Naldurg downwind prioritisation</h2>
<p>Elevate blocks on prevailing dust fronts; attach <strong>1.1 million litres</strong> and <strong>300 MWh</strong> to inspection sample weeks finance recognises.</p>`,
  },

  "ahmadnagar-sasewadi-8-mw": {
    title: "Ahmadnagar-Sasewadi, Maharashtra",
    mw: 8,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.1 million",
    energyUplift: "300 MWh",
    gwh: "0.3",
    co2: "149",
    region: "Ahmadnagar district agricultural-vicinity dust on an eight-megawatt portable table",
    fleetPitch:
      "Three NYUMA semi-automatic portables with weekly block plans—the Ahmadnagar eight-megawatt band sits below the four-portable ten-megawatt cluster.",
    unique:
      "Sasewadi bridges Ahmadnagar ten-megawatt four-portable programmes and Nashik eight-megawatt triplets—harvest and haul-road film may tighten weekly queues.",
    peers: [
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW, four portables)", "ten MW cluster"],
      ["ahmadnagar-mandavgan-8-mw", "Ahmadnagar Mandavgan (8&nbsp;MW)", "Ahmadnagar eight MW peer"],
      ["nashik-kolam-bk-8-mw", "Nashik-Kolam BK (8&nbsp;MW)", "Nashik eight MW twin band"],
    ],
    extra: `<h2>Sasewadi agricultural dust fronts</h2>
<p>After harvest exposure, tighten block priorities; document portable holds alongside <strong>300 MWh</strong> attribution assumptions.</p>`,
  },

  "sangali-kognoli-9-mw": {
    title: "Sangli-Kognoli, Maharashtra",
    mw: 9,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.3 million",
    energyUplift: "337.5 MWh",
    gwh: "0.3375",
    co2: "167",
    region: "Sangli district dust on a nine-megawatt four-portable programme",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.44 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Kognoli shares the nine-megawatt four-portable statistics band with Nashik Satyagaon and Sangli Palaskhel—local O&amp;M still owns block maps and SCADA proof.",
    peers: [
      ["sangali-palaskhel-9-mw", "Sangli-Palaskhel (9&nbsp;MW)", "Sangli nine MW twin"],
      ["sangali-kontya-bobladtikondi-10-mw", "Sangli Boblad/Tikondi (10&nbsp;MW)", "Sangli ten MW"],
      ["nashik-satyagaon-9-mw", "Nashik-Satyagaon (9&nbsp;MW)", "Nashik nine MW peer"],
    ],
    extra: `<h2>Kognoli Sangli portable rhythm</h2>
<p>Rotate crews across four machines; track brush wear in dust season; pair lender evidence with <strong>337.5 MWh</strong> stress tests.</p>`,
  },

  "sangali-palaskhel-9-mw": {
    title: "Sangli-Palaskhel, Maharashtra",
    mw: 9,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.3 million",
    energyUplift: "337.5 MWh",
    gwh: "0.3375",
    co2: "167",
    region: "Sangli district haul-road and agricultural dust on nine megawatts",
    fleetPitch:
      "Four NYUMA semi-automatic portables with weekly inspection-led block coverage on nine megawatts.",
    unique:
      "Palaskhel is the western Sangli nine-megawatt reference—compare with Kognoli and Benapura/Renavi peers before copying portable density.",
    peers: [
      ["sangali-kognoli-9-mw", "Sangli-Kognoli (9&nbsp;MW)", "Sangli nine MW"],
      ["sangali-benapurarenavi-9-mw", "Sangli-Benapura/Renavi (9&nbsp;MW)", "Sangli nine MW"],
      ["nashik-satyagaon-9-mw", "Nashik-Satyagaon (9&nbsp;MW)", "Nashik nine MW"],
    ],
    extra: `<h2>Palaskhel lender pack contents</h2>
<p>Include sample inspection weeks, downwind SCADA trends, and <strong>1.3 million litres</strong> on one conservative assumption set.</p>`,
  },

  "solapur-gulwanchi-7-mw": {
    title: "Solapur-Gulwanchi, Maharashtra",
    mw: 7,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "980 thousand",
    energyUplift: "262.5 MWh",
    gwh: "0.2625",
    co2: "130",
    region: "Solapur district dust on a seven-megawatt portable table",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.43 robots/MW) with weekly block plans and inspection accountability.",
    unique:
      "Gulwanchi anchors the seven-megawatt statistics band (980 thousand litres, 262.5 MWh)—compare Nashik Hiswal and Beed seven-megawatt peers in diligence, not robot brochures.",
    peers: [
      ["nashik-shinde-10-mw", "Nashik-Shinde (10&nbsp;MW, four portables)", "Nashik larger portable"],
      ["dharashiv-naldurg-8-mw", "Dharashiv-Naldurg (8&nbsp;MW)", "eight MW step-up"],
      ["yavatmal-kupti-14-mw", "Yavatmal Kupti (14&nbsp;MW, five portables)", "fourteen MW portable"],
    ],
    extra: `<h2>Gulwanchi seven-megawatt operations</h2>
<p>Three portables need visible weekly queues to electrical O&amp;M; pair <strong>980 thousand litres</strong> with <strong>262.5 MWh</strong> at fifty percent attribution in finance workshops.</p>`,
  },

  "sangali-benapurarenavi-9-mw": {
    title: "Sangli-Benapura/Renavi, Maharashtra",
    mw: 9,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.3 million",
    energyUplift: "337.5 MWh",
    gwh: "0.3375",
    co2: "167",
    region: "Sangli district Benapura/Renavi nine-megawatt portable coverage",
    fleetPitch:
      "Four NYUMA semi-automatic portables (~0.44 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Benapura/Renavi completes the Sangli nine-megawatt quartet with Palaskhel and Kognoli—statistics band matches Nashik Satyagaon; block maps remain site-specific.",
    peers: [
      ["sangali-palaskhel-9-mw", "Sangli-Palaskhel (9&nbsp;MW)", "Sangli nine MW"],
      ["sangali-kognoli-9-mw", "Sangli-Kognoli (9&nbsp;MW)", "Sangli nine MW"],
      ["nashik-satyagaon-9-mw", "Nashik-Satyagaon (9&nbsp;MW)", "Nashik nine MW peer"],
    ],
    extra: `<h2>Benapura/Renavi portable coordination</h2>
<p>Rotate four machines across downwind blocks; attach <strong>337.5 MWh</strong> and <strong>1.3 million litres</strong> to inspection sample weeks in annual ESG refresh.</p>`,
  },

  "ahmadnagar-takali-dhokeshwar-9-mw": {
    title: "Ahmadnagar-Takali Dhokeshwar, Maharashtra",
    mw: 9,
    state: "Maharashtra",
    auto: 0,
    semi: 4,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.3 million",
    energyUplift: "337.5 MWh",
    gwh: "0.3375",
    co2: "167",
    region: "Ahmadnagar district dust on a nine-megawatt four-portable table",
    fleetPitch:
      "Four NYUMA semi-automatic portables with weekly inspection-led block coverage on nine megawatts.",
    unique:
      "Takali Dhokeshwar is the Ahmadnagar nine-megawatt portable reference—compare ten-megawatt four-portable cluster sites and Nashik nine-megawatt peers before copying density.",
    peers: [
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW)", "ten MW cluster"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "eight MW Ahmadnagar"],
      ["sangali-benapurarenavi-9-mw", "Sangli-Benapura/Renavi (9&nbsp;MW)", "nine MW statistics band"],
    ],
    extra: `<h2>Takali Dhokeshwar harvest dust fronts</h2>
<p>Tighten weekly queues after agricultural exposure; document rain skips as weather outcomes in lender packs.</p>`,
  },

  "nashik-hiswal-bk-7-mw": {
    title: "Nashik-Hiswal BK, Maharashtra",
    mw: 7,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "980 thousand",
    energyUplift: "262.5 MWh",
    gwh: "0.2625",
    co2: "130",
    region: "Nashik district Hiswal BK seven-megawatt portable programme",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.43 robots/MW) with weekly block plans and inspection accountability.",
    unique:
      "Hiswal BK shares the seven-megawatt statistics band with Solapur Gulwanchi and Beed Babhal Gaon—validate local inverter strings before stress tests.",
    peers: [
      ["solapur-gulwanchi-7-mw", "Solapur-Gulwanchi (7&nbsp;MW)", "seven MW twin band"],
      ["beed-babhal-gaon-7-mw", "Beed-Babhal Gaon (7&nbsp;MW)", "seven MW peer"],
      ["nashik-dongagaon-8-mw", "Nashik-Dongagaon (8&nbsp;MW)", "Nashik cluster"],
    ],
    extra: `<h2>Hiswal BK block queue visibility</h2>
<p>Publish portable weeks beside electrical O&amp;M meetings; pair <strong>262.5 MWh</strong> at fifty and seventy-five percent attribution.</p>`,
  },

  "beed-babhal-gaon-7-mw": {
    title: "Beed-Babhal Gaon, Maharashtra",
    mw: 7,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "980 thousand",
    energyUplift: "262.5 MWh",
    gwh: "0.2625",
    co2: "130",
    region: "Beed district dust on a seven-megawatt semi-automatic table",
    fleetPitch:
      "Three NYUMA semi-automatic portables with weekly inspection rounds on seven megawatts.",
    unique:
      "Babhal Gaon extends the seven-megawatt portable band into Beed—compare Nashik Hiswal and Yavatmal Ghonsi (two-portable seven MW) for coverage contrasts.",
    peers: [
      ["nashik-hiswal-bk-7-mw", "Nashik-Hiswal BK (7&nbsp;MW)", "seven MW twin band"],
      ["yavatmal-ghonsi-7-mw", "Yavatmal Ghonsi (7&nbsp;MW, two portables)", "seven MW two-portable"],
      ["hingoli-shiwani-bk-6-mw", "Hingoli-Shiwani BK (6&nbsp;MW)", "six MW step-down"],
    ],
    extra: `<h2>Babhal Gaon downwind prioritisation</h2>
<p>Elevate blocks on prevailing dust fronts; honest partial-pass logs build trustworthy SCADA workshops.</p>`,
  },

  "hingoli-shiwani-bk-6-mw": {
    title: "Hingoli-Shiwani BK, Maharashtra",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Hingoli district dust on a six-megawatt portable table",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.50 robots/MW) with weekly block plans and signed inspection evidence.",
    unique:
      "Shiwani BK anchors the six-megawatt statistics band (840 thousand litres, 225 MWh)—between five-megawatt two-portable sites and seven-megawatt triplets.",
    peers: [
      ["yavatmal-dhanorakh-6-mw", "Yavatmal Dhanorakh (6&nbsp;MW)", "six MW Yavatmal"],
      ["beed-babhal-gaon-7-mw", "Beed-Babhal Gaon (7&nbsp;MW)", "seven MW step-up"],
      ["muddapur-5-mw", "Muddapur (5&nbsp;MW)", "five MW contrast"],
    ],
    extra: `<h2>Shiwani BK six-megawatt rhythm</h2>
<p>Three portables on six megawatts need deadhead discipline; pair water and MWh on one finance assumption set.</p>`,
  },

  "ahmadnagar-mandavgan-8-mw": {
    title: "Ahmadnagar-Mandavgan, Maharashtra",
    mw: 8,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.1 million",
    energyUplift: "300 MWh",
    gwh: "0.3",
    co2: "149",
    region: "Ahmadnagar district Mandavgan eight-megawatt portable programme",
    fleetPitch:
      "Three NYUMA semi-automatic portables on the eight-megawatt workbook statistics band with weekly inspection sign-off.",
    unique:
      "Mandavgan pairs with Nagalwadi and Sasewadi as Ahmadnagar eight-megawatt triplets below the nine- and ten-megawatt portable clusters.",
    peers: [
      ["ahmadnagar-nagalwadi-8-mw", "Ahmadnagar-Nagalwadi (8&nbsp;MW)", "Ahmadnagar eight MW"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "Ahmadnagar eight MW"],
      ["ahmadnagar-takali-dhokeshwar-9-mw", "Takali Dhokeshwar (9&nbsp;MW)", "nine MW Ahmadnagar"],
    ],
    extra: `<h2>Mandavgan inspection calendar</h2>
<p>Integrate portable weeks with monthly SCADA correlation—skipped cycles after effective rain are weather outcomes.</p>`,
  },

  "ahmadnagar-nagalwadi-8-mw": {
    title: "Ahmadnagar-Nagalwadi, Maharashtra",
    mw: 8,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "1.1 million",
    energyUplift: "300 MWh",
    gwh: "0.3",
    co2: "149",
    region: "Ahmadnagar district agricultural-vicinity dust on eight megawatts",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.38 robots/MW) with weekly block plans.",
    unique:
      "Nagalwadi shares 300 MWh / 1.1 million litre band with Mandavgan and Nashik eight-megawatt peers—local PR slopes still require site proof.",
    peers: [
      ["ahmadnagar-mandavgan-8-mw", "Ahmadnagar-Mandavgan (8&nbsp;MW)", "Ahmadnagar eight MW"],
      ["nashik-kolam-bk-8-mw", "Nashik-Kolam BK (8&nbsp;MW)", "Nashik eight MW"],
      ["dharashiv-naldurg-8-mw", "Dharashiv-Naldurg (8&nbsp;MW)", "eight MW portable"],
    ],
    extra: `<h2>Nagalwadi agricultural dust</h2>
<p>After harvest fronts, tighten block priorities; attach lender evidence to inspection sample weeks.</p>`,
  },

  "yavatmal-ghonsi-7-mw": {
    title: "Yavatmal, Ghonsi",
    mw: 7,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "980 thousand",
    energyUplift: "262.5 MWh",
    gwh: "0.2625",
    co2: "130",
    region: "Yavatmal district red-soil dust on a seven-megawatt two-portable programme",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.29 robots/MW) with weekly block plans—the seven-megawatt statistics band matches three-portable peers; coverage discipline matters more than machine count.",
    unique:
      "Ghonsi seven-megawatt uses two portables versus three on Hiswal/Babhal—compare brush wear and block prioritisation when benchmarking seven-megawatt outcomes.",
    peers: [
      ["yavatmal-kupti-14-mw", "Yavatmal Kupti (14&nbsp;MW, five portables)", "Yavatmal larger programme"],
      ["nashik-hiswal-bk-7-mw", "Nashik-Hiswal BK (7&nbsp;MW, three portables)", "seven MW three-portable"],
      ["yavatmal-dhanorakh-6-mw", "Yavatmal Dhanorakh (6&nbsp;MW)", "Yavatmal six MW"],
    ],
    extra: `<h2>Ghonsi two-portable seven-megawatt coverage</h2>
<p>Two machines must run a strict downwind queue; pair <strong>262.5 MWh</strong> with conservative attribution in finance workshops.</p>`,
  },

  "thakkar-chemical-1-mw": {
    title: "Thakkar Chemical",
    mw: 1,
    state: "Maharashtra",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2022",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "140 thousand",
    energyUplift: "37.5 MWh",
    gwh: "0.0375",
    co2: "19",
    region: "industrial-vicinity one-megawatt micro-utility dust",
    fleetPitch:
      "One NYUMA semi-automatic portable on 1&nbsp;MW reported nameplate with inspection-led weekly block plans since 2022 commissioning.",
    unique:
      "Thakkar Chemical is a one-megawatt industrial micro portable reference—twin statistics to Thakkar Cotton; operations discipline matters more than robots/MW.",
    peers: [
      ["thakkar-cotton-1-mw", "Thakkar Cotton (1&nbsp;MW)", "twin statistics"],
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW)", "sub-two MW portable"],
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "automatic micro contrast"],
    ],
    extra: `<h2>Thakkar Chemical inspection evidence</h2>
<p>Weekly block IDs and weather holds; pair <strong>140 thousand litres</strong> and <strong>37.5 MWh</strong> at conservative attribution.</p>`,
  },

  "thakkar-cotton-1-mw": {
    title: "Thakkar Cotton",
    mw: 1,
    state: "Maharashtra",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2022",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "140 thousand",
    energyUplift: "37.5 MWh",
    gwh: "0.0375",
    co2: "19",
    region: "one-megawatt micro-utility portable programme",
    fleetPitch:
      "One NYUMA semi-automatic portable with inspection accountability since 2022—validate block scope with commissioning records.",
    unique:
      "Thakkar Cotton mirrors Thakkar Chemical in reported outcomes—copy inspection cadence, not site name, when framing micro portable ROI.",
    peers: [
      ["thakkar-chemical-1-mw", "Thakkar Chemical (1&nbsp;MW)", "twin statistics"],
      ["mangrol-12-mw", "Mangrol (1.2&nbsp;MW, two portables)", "two-portable micro"],
      ["dakuni-14-mw", "Dakuni (1.4&nbsp;MW)", "sub-two MW portable"],
    ],
    extra: `<h2>Thakkar Cotton portable-first accountability</h2>
<p>One machine is a coverage queue, not plant-wide nightly washing—document skipped cycles after rain and wind.</p>`,
  },

  "chakan-vii-2-mw": {
    title: "Chakan-VII",
    mw: 2,
    state: "Maharashtra",
    auto: 9,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Automatic",
    nectyr: true,
    water: "280 thousand",
    energyUplift: "75 MWh",
    gwh: "0.075",
    co2: "37",
    region: "Chakan industrial corridor dust on a two-megawatt automatic GLYDE table",
    fleetPitch:
      "Nine GLYDE automatic robots (~4.5 robots/MW on 2&nbsp;MW reported nameplate) with NECTYR scheduled cycles and weather-aware holds from 2024 commissioning.",
    unique: `Chakan-VII is extreme automatic density on micro nameplate—compare <a href="/projects/chakan-vi-25-mw">Chakan-VI (2.5&nbsp;MW, twelve GLYDE)</a> and <a href="/projects/khopoli-25-mw">Khopoli (2.5&nbsp;MW, sixteen GLYDE)</a> before copying robots/MW.`,
    peers: [
      ["chakan-vi-25-mw", "Chakan-VI (2.5&nbsp;MW, twelve GLYDE)", "Chakan automatic peer"],
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "2.5&nbsp;MW automatic"],
      ["apex-nagpur-13-mw", "APEX Nagpur (1.3&nbsp;MW, five GLYDE)", "smaller automatic micro"],
    ],
    extra: `<h2>Chakan-VII NECTYR on two megawatts</h2>
<p>Log completion, idle minutes, and wind holds weekly; docking and spare batches matter at ~4.5 robots/MW—scheduled cycles (~3–10/month typical), not daily plant-wide wash claims.</p>`,
  },

  "hariwansh-nagpur-07-mw": {
    title: "Hariwansh Nagpur",
    mw: 0.7,
    state: "Maharashtra",
    auto: 3,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Automatic",
    nectyr: true,
    water: "98 thousand",
    energyUplift: "26.3 MWh",
    gwh: "0.0263",
    co2: "13",
    region: "Nagpur-vicinity sub-one-megawatt automatic GLYDE programme",
    fleetPitch:
      "Three GLYDE automatic robots (~4.3 robots/MW on 0.7&nbsp;MW reported nameplate) with NECTYR from 2024 commissioning.",
    unique:
      "Hariwansh Nagpur is sub-one-megawatt automatic density—validate nameplate versus field layout; contrast portable micro peers Sonar Bangla and Thakkar programmes.",
    peers: [
      ["apex-nagpur-13-mw", "APEX Nagpur (1.3&nbsp;MW, five GLYDE)", "Nagpur automatic peer"],
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW, one portable)", "semi-automatic micro"],
      ["parliament-delhi-07-mw", "Parliament Delhi (0.7&nbsp;MW)", "sub-one MW peer slug"],
    ],
    extra: `<h2>Hariwansh Nagpur micro automatic discipline</h2>
<p>Three GLYDE units on 0.7&nbsp;MW demand spare batches and completion logs—NECTYR holds after wind events belong in lender evidence packs.</p>`,
  },

  "muddapur-5-mw": {
    title: "Muddapur, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2023",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "five-megawatt ground-mount dust with a single portable coverage queue",
    fleetPitch:
      "One NYUMA semi-automatic portable on 5&nbsp;MW reported nameplate since 2023—validate block-coverage scope with commissioning records; weekly inspection plans drive outcomes.",
    unique:
      "Muddapur is the five-megawatt single-portable reference in the workbook band—compare two-portable peers (Sawana, Adegaon) before copying robots/MW.",
    peers: [
      ["yavatmal-sawana-5-mw", "Yavatmal Sawana (5&nbsp;MW, two portables)", "two-portable five MW"],
      ["hingoli-shiwani-bk-6-mw", "Hingoli-Shiwani BK (6&nbsp;MW)", "six MW step-up"],
      ["khanak-50-mw", "Khanak (50&nbsp;MW, ten portables)", "portable-first at scale"],
    ],
    extra: `<h2>Muddapur five-megawatt inspection discipline</h2>
<p>One machine requires strict downwind block prioritisation; pair <strong>187.5 MWh</strong> with conservative attribution—not plant-wide nightly wash claims.</p>`,
  },

  "yavatmal-sawana-5-mw": {
    title: "Yavatmal, Sawana",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Yavatmal district red-soil dust on a five-megawatt two-portable table",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Sawana anchors the Yavatmal five-megawatt statistics band (700 thousand litres, 187.5 MWh)—local PR slopes still need site-specific SCADA proof.",
    peers: [
      ["yavatmal-adegaon-5-mw", "Yavatmal Adegaon (5&nbsp;MW)", "Yavatmal five MW band"],
      ["yavatmal-dhanorakh-6-mw", "Yavatmal Dhanorakh (6&nbsp;MW)", "six MW Yavatmal"],
      ["yavatmal-ghonsi-7-mw", "Yavatmal Ghonsi (7&nbsp;MW)", "seven MW Yavatmal"],
    ],
    extra: `<h2>Sawana portable queue</h2>
<p>Rotate two machines across downwind blocks; document brush wear in dust-season hours.</p>`,
  },

  "yavatmal-adegaon-5-mw": {
    title: "Yavatmal, Adegaon",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Yavatmal district seasonal dust on the Adegaon five-megawatt programme",
    fleetPitch:
      "Two NYUMA semi-automatic portables with weekly inspection-led block coverage on five megawatts.",
    unique:
      "Adegaon shares the workbook five-megawatt band with Sawana and Mhasola—copy operations rhythm, not geography, in diligence packs.",
    peers: [
      ["yavatmal-sawana-5-mw", "Yavatmal Sawana (5&nbsp;MW)", "five MW band"],
      ["yavatmal-mhasola-5-mw", "Yavatmal Mhasola (5&nbsp;MW)", "five MW band"],
      ["muddapur-5-mw", "Muddapur (5&nbsp;MW, one portable)", "single-portable contrast"],
    ],
    extra: `<h2>Adegaon downwind prioritisation</h2>
<p>Elevate blocks on prevailing dust fronts; pair water and MWh on one finance assumption set.</p>`,
  },

  "yavatmal-mhasola-5-mw": {
    title: "Yavatmal, Mhasola",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Yavatmal district dust on the Mhasola five-megawatt portable programme",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.40 robots/MW) with signed inspection rounds each week.",
    unique:
      "Mhasola completes the Yavatmal five-megawatt triplet with Sawana and Adegaon—validate layout before stress tests.",
    peers: [
      ["yavatmal-sawana-5-mw", "Yavatmal Sawana (5&nbsp;MW)", "Yavatmal five MW"],
      ["yavatmal-kupti-14-mw", "Yavatmal Kupti (14&nbsp;MW)", "larger Yavatmal programme"],
      ["hingoli-shiwani-bk-6-mw", "Hingoli-Shiwani BK (6&nbsp;MW)", "six MW portable"],
    ],
    extra: `<h2>Mhasola inspection evidence</h2>
<p>Attach sample inspection weeks with <strong>700 thousand litres</strong> and <strong>187.5 MWh</strong> at fifty percent attribution.</p>`,
  },

  "sangli-madgyal-5-mw": {
    title: "Sangli-Madgyal, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli district dust on a five-megawatt two-portable table",
    fleetPitch:
      "Two NYUMA semi-automatic portables with weekly block plans on five megawatts.",
    unique:
      "Madgyal is the Sangli five-megawatt portable entry—compare nine- and ten-megawatt Sangli programmes before copying density.",
    peers: [
      ["sangali-benapurarenavi-9-mw", "Sangli-Benapura/Renavi (9&nbsp;MW)", "Sangli at scale"],
      ["sangali-bhagyanagarbhakuchwadi-5-mw", "Sangli Bhagyanagar (5&nbsp;MW)", "five MW Sangli band"],
      ["snagali-belondgi-bellundagi-5-mw", "Belondgi Bellundagi (5&nbsp;MW)", "five MW Sangli"],
    ],
    extra: `<h2>Madgyal Sangli portable rhythm</h2>
<p>Minimise deadhead between blocks; honest partial-pass logs for SCADA workshops.</p>`,
  },

  "sangali-bhagyanagarbhakuchwadi-5-mw": {
    title: "Sangli-Bhagyanagar (Bhakuchwadi), Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Bhagyanagar vicinity dust on five megawatts",
    fleetPitch:
      "Two NYUMA semi-automatic portables on the five-megawatt workbook statistics band with weekly inspection sign-off.",
    unique:
      "Bhagyanagar (Bhakuchwadi) shares 187.5 MWh reporting with Madgyal and Karewadi—block maps remain site-specific.",
    peers: [
      ["sangli-madgyal-5-mw", "Sangli-Madgyal (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-karewadi-5-mw", "Sangli-Karewadi (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-kognoli-9-mw", "Sangli-Kognoli (9&nbsp;MW)", "nine MW Sangli"],
    ],
    extra: `<h2>Bhagyanagar haul-road film</h2>
<p>Prioritise blocks on haul-road dust fronts after dry spells; document rain skips as weather outcomes.</p>`,
  },

  "snagali-belondgi-bellundagi-5-mw": {
    title: "Sangli-Belondgi (Bellundagi), Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Belondgi/Bellundagi five-megawatt portable coverage",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans.",
    unique:
      "Belondgi (Bellundagi) slug reflects workbook spelling—operations mirror other Sangli five-megawatt two-portable peers.",
    peers: [
      ["sangli-madgyal-5-mw", "Sangli-Madgyal (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-bhagyanagarbhakuchwadi-5-mw", "Bhagyanagar (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-palaskhel-9-mw", "Sangli-Palaskhel (9&nbsp;MW)", "nine MW reference"],
    ],
    extra: `<h2>Belondgi lender pack</h2>
<p>Include inspection sample weeks with <strong>187.5 MWh</strong> stress tests at fifty and seventy-five percent attribution.</p>`,
  },

  "ahmadnagar-ranjanwadi-5-mw": {
    title: "Ahmadnagar-Ranjanwadi, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Ahmadnagar district dust on the Ranjanwadi five-megawatt table",
    fleetPitch:
      "Two NYUMA semi-automatic portables with weekly inspection-led accountability on five megawatts.",
    unique:
      "Ranjanwadi opens the Ahmadnagar five-megawatt cluster—below eight- and ten-megawatt portable programmes in the same district.",
    peers: [
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "eight MW Ahmadnagar"],
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW)", "ten MW cluster"],
      ["yavatmal-sawana-5-mw", "Yavatmal Sawana (5&nbsp;MW)", "five MW statistics band"],
    ],
    extra: `<h2>Ranjanwadi agricultural dust</h2>
<p>Tighten weekly queues after harvest exposure; pair portable weeks with inverter availability meetings.</p>`,
  },

  "yavatmal-dhanorakh-6-mw": {
    title: "Yavatmal, Dhanorakh",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Yavatmal district dust on a six-megawatt three-portable programme",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.50 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Dhanorakh anchors the six-megawatt statistics band (840 thousand litres, 225 MWh) with Hingoli and Nashik Boygaon peers.",
    peers: [
      ["hingoli-shiwani-bk-6-mw", "Hingoli-Shiwani BK (6&nbsp;MW)", "six MW twin band"],
      ["nashik-boygaon-6-mw", "Nashik-Boygaon (6&nbsp;MW)", "six MW Nashik"],
      ["yavatmal-sawana-5-mw", "Yavatmal Sawana (5&nbsp;MW)", "five MW step-down"],
    ],
    extra: `<h2>Dhanorakh six-megawatt portable queue</h2>
<p>Three portables need visible weekly block IDs to electrical O&amp;M; document partial passes honestly.</p>`,
  },

  "ahmadnagar-supa-6-mw": {
    title: "Ahmadnagar-Supa, Maharashtra",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Ahmadnagar district agricultural-vicinity dust on six megawatts",
    fleetPitch:
      "Three NYUMA semi-automatic portables on the six-megawatt workbook band with weekly inspection rounds.",
    unique:
      "Supa bridges Ahmadnagar five-megawatt two-portable sites and eight-megawatt triplets—harvest dust may tighten block priorities.",
    peers: [
      ["ahmadnagar-ranjanwadi-5-mw", "Ahmadnagar-Ranjanwadi (5&nbsp;MW)", "five MW Ahmadnagar"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "eight MW step-up"],
      ["ahmadnagar-karhe-6-mw", "Ahmadnagar-Karhe (6&nbsp;MW)", "six MW Ahmadnagar peer"],
    ],
    extra: `<h2>Supa inspection calendar</h2>
<p>Integrate portable weeks with monthly SCADA correlation—pair <strong>225 MWh</strong> on one assumption set.</p>`,
  },

  "nashik-boygaon-6-mw": {
    title: "Nashik-Boygaon, Maharashtra",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Nashik district dust on a six-megawatt portable table",
    fleetPitch:
      "Three NYUMA semi-automatic portables with weekly block plans and signed inspection evidence.",
    unique:
      "Boygaon extends the six-megawatt band into Nashik—compare seven- and eight-megawatt cluster sites in the same district.",
    peers: [
      ["nashik-hiswal-bk-7-mw", "Nashik-Hiswal BK (7&nbsp;MW)", "Nashik seven MW"],
      ["nashik-dongagaon-8-mw", "Nashik-Dongagaon (8&nbsp;MW)", "Nashik eight MW"],
      ["yavatmal-dhanorakh-6-mw", "Yavatmal Dhanorakh (6&nbsp;MW)", "six MW statistics band"],
    ],
    extra: `<h2>Boygaon Nashik portable rhythm</h2>
<p>Three machines on six megawatts—minimise deadhead; attach lender evidence to inspection sample weeks.</p>`,
  },

  "bhusawal-06-mw": {
    title: "Bhusawal, Maharashtra",
    mw: 0.6,
    state: "Maharashtra",
    auto: 4,
    semi: 0,
    year: "",
    product: "GLYDE",
    mode: "Automatic",
    nectyr: true,
    water: "84 thousand",
    energyUplift: "22.5 MWh",
    gwh: "0.0225",
    co2: "11",
    region: "sub-one-megawatt automatic GLYDE dust programme",
    fleetPitch:
      "Four GLYDE automatic robots (~6.7 robots/MW on 0.6&nbsp;MW reported nameplate) with NECTYR scheduled cycles and weather-aware holds.",
    unique:
      "Bhusawal is among the highest robots/MW micro automatic programmes—validate nameplate and docking layout before copying density from Khopoli or Chakan-VII.",
    peers: [
      ["satara-05-mw", "Satara (0.5&nbsp;MW slug)", "sub-one MW peer"],
      ["apex-nagpur-13-mw", "APEX Nagpur (1.3&nbsp;MW, five GLYDE)", "Nagpur automatic"],
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW, one portable)", "semi-automatic micro"],
    ],
    extra: `<h2>Bhusawal micro automatic NECTYR</h2>
<p>Log completion and wind holds weekly; scheduled cycles (~3–10/month typical)—not plant-wide nightly washing marketing.</p>`,
  },

  "bhuldhana-1-mw": {
    title: "Bhuldhana, Maharashtra",
    mw: 1,
    state: "Maharashtra",
    auto: 2,
    semi: 0,
    year: "2024",
    product: "GLYDE",
    mode: "Automatic",
    nectyr: true,
    water: "140 thousand",
    energyUplift: "37.5 MWh",
    gwh: "0.0375",
    co2: "19",
    region: "one-megawatt automatic GLYDE micro-utility table",
    fleetPitch:
      "Two GLYDE automatic robots (~2.0 robots/MW on 1&nbsp;MW reported nameplate) with NECTYR from 2024 commissioning.",
    unique:
      "Bhuldhana contrasts Thakkar one-megawatt portable programmes—automatic micro with moderate density versus single-portable inspection-led coverage.",
    peers: [
      ["thakkar-chemical-1-mw", "Thakkar Chemical (1&nbsp;MW, one portable)", "semi-automatic one MW"],
      ["chakan-vii-2-mw", "Chakan-VII (2&nbsp;MW, nine GLYDE)", "high-density automatic micro"],
      ["mangrol-12-mw", "Mangrol (1.2&nbsp;MW, two portables)", "semi-automatic micro"],
    ],
    extra: `<h2>Bhuldhana one-megawatt automatic habits</h2>
<p>NECTYR completion reviews with spare discipline; pair <strong>140 thousand litres</strong> and <strong>37.5 MWh</strong> at conservative attribution.</p>`,
  },

  "sangali-karewadi-5-mw": {
    title: "Sangli-Karewadi, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Karewadi five-megawatt portable dust programme",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Karewadi completes the Sangli five-megawatt band alongside Madgyal and Bhagyanagar—187.5 MWh reporting requires site-specific SCADA proof.",
    peers: [
      ["sangli-madgyal-5-mw", "Sangli-Madgyal (5&nbsp;MW)", "five MW Sangli"],
      ["snagali-belondgi-bellundagi-5-mw", "Belondgi (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-kognoli-9-mw", "Sangli-Kognoli (9&nbsp;MW)", "nine MW Sangli"],
    ],
    extra: `<h2>Karewadi portable queue</h2>
<p>Rotate two machines across downwind blocks; document brush wear through dust season.</p>`,
  },

  "sangali-morale-ped-5-mw": {
    title: "Sangli-Morale Ped, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Morale Ped haul-road and agricultural dust on five megawatts",
    fleetPitch:
      "Two NYUMA semi-automatic portables with weekly inspection-led block coverage.",
    unique:
      "Morale Ped mirrors other Sangli five-megawatt two-portable peers—compare nine-megawatt four-portable programmes before copying density.",
    peers: [
      ["sangali-karewadi-5-mw", "Sangli-Karewadi (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-shirasgaon-5-mw", "Sangli-Shirasgaon (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-benapurarenavi-9-mw", "Sangli-Benapura/Renavi (9&nbsp;MW)", "nine MW reference"],
    ],
    extra: `<h2>Morale Ped downwind blocks</h2>
<p>Prioritise haul-road film after dry spells; pair <strong>700 thousand litres</strong> with conservative MWh attribution.</p>`,
  },

  "sangali-shirasgaon-5-mw": {
    title: "Sangli-Shirasgaon, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Shirasgaon five-megawatt semi-automatic table",
    fleetPitch:
      "Two NYUMA semi-automatic portables on the workbook five-megawatt statistics band.",
    unique:
      "Shirasgaon is a Sangli five-megawatt diligence anchor—inspection sheets remain the proof layer versus robot brochures.",
    peers: [
      ["sangali-madgule-5-mw", "Sangli-Madgule (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-lingivare-5-mw", "Sangli-Lingivare (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-kontya-bobladtikondi-10-mw", "Sangli Boblad/Tikondi (10&nbsp;MW)", "ten MW Sangli"],
    ],
    extra: `<h2>Shirasgaon inspection evidence</h2>
<p>Attach sample inspection weeks with <strong>187.5 MWh</strong> at fifty and seventy-five percent stress tests.</p>`,
  },

  "sangali-madgule-5-mw": {
    title: "Sangli-Madgule, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Madgule district dust on five megawatts",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.40 robots/MW) with signed inspection rounds each week.",
    unique:
      "Madgule extends the Sangli five-megawatt cluster—minimise deadhead between blocks for trustworthy partial-pass logs.",
    peers: [
      ["sangali-shirasgaon-5-mw", "Sangli-Shirasgaon (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-bhagyanagarbhakuchwadi-5-mw", "Bhagyanagar (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-palaskhel-9-mw", "Sangli-Palaskhel (9&nbsp;MW)", "nine MW"],
    ],
    extra: `<h2>Madgule SCADA workshops</h2>
<p>Monthly inverter correlation with inspection timestamps—honest weather skips after rain.</p>`,
  },

  "sangali-lingivare-5-mw": {
    title: "Sangli-Lingivare, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Sangli Lingivare five-megawatt portable programme",
    fleetPitch:
      "Two NYUMA semi-automatic portables with weekly block plans and inspection accountability.",
    unique:
      "Lingivare closes batch coverage of Sangli five-megawatt two-portable sites—local PR slopes still need downwind string proof.",
    peers: [
      ["sangali-morale-ped-5-mw", "Sangli-Morale Ped (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-karewadi-5-mw", "Sangli-Karewadi (5&nbsp;MW)", "five MW Sangli"],
      ["solapur-gulwanchi-7-mw", "Solapur-Gulwanchi (7&nbsp;MW)", "seven MW step-up"],
    ],
    extra: `<h2>Lingivare lender pack</h2>
<p>Include downwind SCADA trends with <strong>187.5 MWh</strong> on one assumption set.</p>`,
  },

  "ahmadnagar-najik-chincholi-5-mw": {
    title: "Ahmadnagar-Najik Chincholi, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Ahmadnagar Najik Chincholi agricultural-vicinity dust on five megawatts",
    fleetPitch:
      "Two NYUMA semi-automatic portables on the Ahmadnagar five-megawatt workbook band.",
    unique:
      "Najik Chincholi opens the Ahmadnagar five-megawatt cluster extension beyond Ranjanwadi—harvest dust may tighten weekly portable queues.",
    peers: [
      ["ahmadnagar-ranjanwadi-5-mw", "Ahmadnagar-Ranjanwadi (5&nbsp;MW)", "five MW Ahmadnagar"],
      ["ahmadnagar-nimgaon-5-mw", "Ahmadnagar-Nimgaon (5&nbsp;MW)", "five MW Ahmadnagar"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "eight MW step-up"],
    ],
    extra: `<h2>Najik Chincholi harvest fronts</h2>
<p>Tighten block priorities after agricultural exposure; document portable holds alongside water statistics.</p>`,
  },

  "ahmadnagar-nimgaon-5-mw": {
    title: "Ahmadnagar-Nimgaon, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Ahmadnagar Nimgaon five-megawatt portable table",
    fleetPitch:
      "Two NYUMA semi-automatic portables with weekly inspection-led accountability.",
    unique:
      "Nimgaon shares 187.5 MWh reporting with Shirapur and Gunore peers—validate layout before lender stress tests.",
    peers: [
      ["ahmadnagar-shirapur-5-mw", "Ahmadnagar-Shirapur (5&nbsp;MW)", "five MW Ahmadnagar peer"],
      ["ahmadnagar-gunore-5-mw", "Ahmadnagar-Gunore (5&nbsp;MW)", "five MW Ahmadnagar peer"],
      ["ahmadnagar-takali-dhokeshwar-9-mw", "Takali Dhokeshwar (9&nbsp;MW)", "nine MW Ahmadnagar"],
    ],
    extra: `<h2>Nimgaon inspection calendar</h2>
<p>Integrate portable weeks with inverter availability meetings; partial passes recorded honestly.</p>`,
  },

  "ahmadnagar-gunore-5-mw": {
    title: "Ahmadnagar-Gunore, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Ahmadnagar Gunore district dust on five megawatts",
    fleetPitch:
      "Two NYUMA semi-automatic portables (~0.40 robots/MW) with weekly block plans.",
    unique:
      "Gunore is a central Ahmadnagar five-megawatt reference—below eight-megawatt triplets and ten-megawatt four-portable cluster sites.",
    peers: [
      ["ahmadnagar-nimgaon-5-mw", "Ahmadnagar-Nimgaon (5&nbsp;MW)", "five MW Ahmadnagar"],
      ["ahmadnagar-kelwad-bk-5-mw", "Ahmadnagar-Kelwad BK (5&nbsp;MW)", "five MW Ahmadnagar"],
      ["ahmadnagar-masale-10-mw", "Ahmadnagar Masale (10&nbsp;MW)", "ten MW cluster"],
    ],
    extra: `<h2>Gunore portable rhythm</h2>
<p>Two machines, visible weekly queue to O&amp;M—pair water and MWh on one finance assumption set.</p>`,
  },

  "ahmadnagar-kelwad-bk-5-mw": {
    title: "Ahmadnagar-Kelwad BK, Maharashtra",
    mw: 5,
    state: "Maharashtra",
    auto: 0,
    semi: 2,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "700 thousand",
    energyUplift: "187.5 MWh",
    gwh: "0.1875",
    co2: "93",
    region: "Ahmadnagar Kelwad BK five-megawatt semi-automatic coverage",
    fleetPitch:
      "Two NYUMA semi-automatic portables with signed inspection rounds on five megawatts.",
    unique:
      "Kelwad BK completes a five-megawatt Ahmadnagar set with Najik Chincholi and Gunore—block maps remain site-specific despite shared statistics.",
    peers: [
      ["ahmadnagar-durgaon-5-mw", "Ahmadnagar-Durgaon (5&nbsp;MW)", "five MW Ahmadnagar peer"],
      ["ahmadnagar-kharatwadi-5-mw", "Ahmadnagar-Kharatwadi (5&nbsp;MW)", "five MW Ahmadnagar peer"],
      ["ahmadnagar-supa-6-mw", "Ahmadnagar-Supa (6&nbsp;MW)", "six MW step-up"],
    ],
    extra: `<h2>Kelwad BK downwind prioritisation</h2>
<p>Elevate downwind blocks in dust season; attach lender evidence to inspection sample weeks.</p>`,
  },

  "sangali-asangi-jat-6-mw": {
    title: "Sangli-Asangi Jat, Maharashtra",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Sangli Asangi Jat six-megawatt portable programme",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.50 robots/MW) with weekly block plans and inspection sign-off.",
    unique:
      "Asangi Jat brings the six-megawatt statistics band into Sangli—compare five-megawatt two-portable peers and nine-megawatt four-portable sites.",
    peers: [
      ["sangali-karewadi-5-mw", "Sangli-Karewadi (5&nbsp;MW)", "five MW Sangli"],
      ["sangali-benapurarenavi-9-mw", "Sangli-Benapura/Renavi (9&nbsp;MW)", "nine MW Sangli"],
      ["ahmadnagar-supa-6-mw", "Ahmadnagar-Supa (6&nbsp;MW)", "six MW statistics band"],
    ],
    extra: `<h2>Asangi Jat six-megawatt queue</h2>
<p>Three portables on 225&nbsp;MWh band—minimise deadhead; document weather holds after rain.</p>`,
  },

  "ahmadnagar-karhe-6-mw": {
    title: "Ahmadnagar-Karhe, Maharashtra",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Ahmadnagar Karhe six-megawatt dust table",
    fleetPitch:
      "Three NYUMA semi-automatic portables on the six-megawatt workbook band with weekly inspection rounds.",
    unique:
      "Karhe pairs with Supa and Sakegaon as Ahmadnagar six-megawatt triplets—between five-megawatt twins and seven-megawatt programmes.",
    peers: [
      ["ahmadnagar-supa-6-mw", "Ahmadnagar-Supa (6&nbsp;MW)", "six MW Ahmadnagar"],
      ["ahmadnagar-sakegaon-6-mw", "Ahmadnagar-Sakegaon (6&nbsp;MW)", "six MW Ahmadnagar"],
      ["ahmadnagar-ranjanwadi-5-mw", "Ahmadnagar-Ranjanwadi (5&nbsp;MW)", "five MW step-down"],
    ],
    extra: `<h2>Karhe inspection sign-off</h2>
<p>Weekly block IDs visible to finance; pair <strong>840 thousand litres</strong> with <strong>225 MWh</strong> stress tests.</p>`,
  },

  "ahmadnagar-sakegaon-6-mw": {
    title: "Ahmadnagar-Sakegaon, Maharashtra",
    mw: 6,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "840 thousand",
    energyUplift: "225 MWh",
    gwh: "0.225",
    co2: "112",
    region: "Ahmadnagar Sakegaon agricultural-vicinity dust on six megawatts",
    fleetPitch:
      "Three NYUMA semi-automatic portables with weekly block plans and inspection accountability.",
    unique:
      "Sakegaon completes Ahmadnagar six-megawatt coverage with Karhe and Supa—harvest fronts may tighten portable queues.",
    peers: [
      ["ahmadnagar-karhe-6-mw", "Ahmadnagar-Karhe (6&nbsp;MW)", "six MW Ahmadnagar"],
      ["ahmadnagar-velapur-7-mw", "Ahmadnagar-Velapur (7&nbsp;MW)", "seven MW step-up"],
      ["yavatmal-dhanorakh-6-mw", "Yavatmal Dhanorakh (6&nbsp;MW)", "six MW Yavatmal"],
    ],
    extra: `<h2>Sakegaon portable weeks</h2>
<p>Integrate portable schedule with monthly SCADA correlation—skipped cycles after effective rain are weather outcomes.</p>`,
  },

  "yavatmal-undarni-7-mw": {
    title: "Yavatmal, Undarni",
    mw: 7,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "980 thousand",
    energyUplift: "262.5 MWh",
    gwh: "0.2625",
    co2: "130",
    region: "Yavatmal Undarni seven-megawatt red-soil dust programme",
    fleetPitch:
      "Three NYUMA semi-automatic portables (~0.43 robots/MW) with weekly block plans on seven megawatts.",
    unique:
      "Undarni is the Yavatmal seven-megawatt three-portable reference—compare Ghonsi (two portables on seven MW) for coverage discipline contrasts.",
    peers: [
      ["yavatmal-ghonsi-7-mw", "Yavatmal Ghonsi (7&nbsp;MW, two portables)", "two-portable seven MW"],
      ["nashik-hiswal-bk-7-mw", "Nashik-Hiswal BK (7&nbsp;MW)", "seven MW twin band"],
      ["yavatmal-dhanorakh-6-mw", "Yavatmal Dhanorakh (6&nbsp;MW)", "six MW Yavatmal"],
    ],
    extra: `<h2>Undarni seven-megawatt operations</h2>
<p>Three portables on <strong>262.5 MWh</strong> band—visible weekly queue to electrical O&amp;M and finance.</p>`,
  },

  "ahmadnagar-velapur-7-mw": {
    title: "Ahmadnagar-Velapur, Maharashtra",
    mw: 7,
    state: "Maharashtra",
    auto: 0,
    semi: 3,
    year: "",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "980 thousand",
    energyUplift: "262.5 MWh",
    gwh: "0.2625",
    co2: "130",
    region: "Ahmadnagar Velapur seven-megawatt portable table",
    fleetPitch:
      "Three NYUMA semi-automatic portables on the seven-megawatt workbook statistics band with inspection sign-off.",
    unique:
      "Velapur opens Ahmadnagar seven-megawatt triplets (Wadner, Majampur, Wanjoli peers)—between six-megawatt Supa and eight-megawatt Sasewadi.",
    peers: [
      ["ahmadnagar-wadner-bk-7-mw", "Ahmadnagar-Wadner BK (7&nbsp;MW)", "seven MW Ahmadnagar peer"],
      ["ahmadnagar-sasewadi-8-mw", "Ahmadnagar-Sasewadi (8&nbsp;MW)", "eight MW step-up"],
      ["beed-babhal-gaon-7-mw", "Beed-Babhal Gaon (7&nbsp;MW)", "seven MW twin band"],
    ],
    extra: `<h2>Velapur Ahmadnagar seven-megawatt rhythm</h2>
<p>Pair <strong>980 thousand litres</strong> with <strong>262.5 MWh</strong> at fifty percent attribution in lender workshops.</p>`,
  },

  "parliament-delhi-07-mw": {
    title: "Parliament Delhi",
    mw: 0.7,
    state: "Delhi",
    auto: 0,
    semi: 2,
    year: "2024",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "98 thousand",
    energyUplift: "26.3 MWh",
    gwh: "0.0263",
    co2: "13",
    region: "urban-influenced sub-one-megawatt dust on a parliamentary-vicinity micro table",
    fleetPitch:
      "Two NYUMA semi-automatic portables on 0.7&nbsp;MW reported nameplate since 2024—validate block scope with commissioning records; weekly inspection plans drive outcomes.",
    unique:
      "Parliament Delhi is a sub-one-megawatt semi-automatic contrast to Hariwansh Nagpur automatic micro—urban soiling and security-sensitive O&amp;M coordination matter in operations narratives.",
    peers: [
      ["hariwansh-nagpur-07-mw", "Hariwansh Nagpur (0.7&nbsp;MW, three GLYDE)", "automatic micro peer"],
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW)", "portable micro"],
      ["thakkar-chemical-1-mw", "Thakkar Chemical (1&nbsp;MW)", "one MW portable"],
    ],
    extra: `<h2>Parliament Delhi micro portable discipline</h2>
<p>Two portables on 0.7&nbsp;MW—inspection-led block IDs and weather holds; not plant-wide nightly wash claims.</p>`,
  },

  "vasai-05-mw": {
    title: "Vasai, Maharashtra",
    mw: 0.5,
    state: "Maharashtra",
    auto: 0,
    semi: 1,
    lowSemiNote: true,
    year: "2022",
    product: "NYUMA",
    mode: "Semi-automatic",
    nectyr: false,
    water: "70 thousand",
    energyUplift: "18.8 MWh",
    gwh: "0.0188",
    co2: "9",
    region: "coastal-influenced sub-one-megawatt portable programme",
    fleetPitch:
      "One NYUMA semi-automatic portable on 0.5&nbsp;MW reported nameplate since 2022—inspection-led weekly block plans with humidity-aware holds.",
    unique:
      "Vasai illustrates coastal-influenced micro portable coverage—compare Satara automatic extreme density and Parliament Delhi two-portable 0.7&nbsp;MW.",
    peers: [
      ["satara-05-mw", "Satara (0.5&nbsp;MW, twelve GLYDE)", "automatic micro contrast"],
      ["chennai-10-mw", "Chennai (10&nbsp;MW, two portables)", "coastal portable reference"],
      ["sonar-bangla-14-mw", "Sonar Bangla (1.4&nbsp;MW)", "portable micro"],
    ],
    extra: `<h2>Vasai humidity and portable holds</h2>
<p>Wind and rain holds matter alongside dust; pair <strong>70 thousand litres</strong> and <strong>18.8 MWh</strong> at conservative attribution.</p>`,
  },

  "satara-05-mw": {
    title: "Satara, Maharashtra",
    mw: 0.5,
    state: "Maharashtra",
    auto: 12,
    semi: 0,
    year: "2026",
    product: "GLYDE",
    mode: "Automatic",
    nectyr: true,
    water: "70 thousand",
    energyUplift: "18.8 MWh",
    gwh: "0.0188",
    co2: "9",
    region: "sub-one-megawatt automatic GLYDE programme with very high robots/MW",
    fleetPitch:
      "Twelve GLYDE automatic robots (~24 robots/MW on 0.5&nbsp;MW reported nameplate) with NECTYR from 2026 commissioning—validate docking layout and nameplate before copying density.",
    unique:
      "Satara is among the highest robots/MW programmes in the workbook—docking maps, spare batches, and completion logs matter more than marketing wash frequency.",
    peers: [
      ["bhusawal-06-mw", "Bhusawal (0.6&nbsp;MW, four GLYDE)", "automatic micro"],
      ["vasai-05-mw", "Vasai (0.5&nbsp;MW, one portable)", "semi-automatic micro contrast"],
      ["khopoli-25-mw", "Khopoli (2.5&nbsp;MW, sixteen GLYDE)", "automatic micro-utility"],
    ],
    extra: `<h2>Satara micro automatic NECTYR (2026)</h2>
<p>Log completion, idle minutes, and wind holds weekly—scheduled cycles (~3–10/month typical), not plant-wide nightly washing.</p>`,
  },
};

export const TIER3_SITES = {
  ...TIER3_CORE_SITES,
  ...TIER3_REMAINING_SITES,
};
