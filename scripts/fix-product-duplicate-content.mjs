#!/usr/bin/env node
/**
 * De-duplicates product page copy and fixes copy-paste errors (SEO audit fixes).
 * Run: node scripts/fix-product-duplicate-content.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["en", "hi", "ar", "bn", "ja"];

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function saveJson(rel, data) {
  fs.writeFileSync(
    path.join(ROOT, rel),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

const glydeVsNyumaEn = {
  eyebrow: "Choosing the Right Taypro Robot",
  title: "GLYDE vs NYUMA: Which Automatic Robot Fits Your Plant?",
  subtitle:
    "Both robots are fully autonomous, waterless, and managed from NECTYR. GLYDE is Taypro's patented dual-pass microfiber flagship; NYUMA is the PBT single-pass platform for capex-efficient fixed-tilt fleets.",
  criterion: "Criterion",
  glydeHeader: "GLYDE (Dual-Pass Microfiber)",
  nyumaHeader: "NYUMA (Single-Pass PBT)",
  row0: {
    criterion: "Cleaning Technology",
    glyde: "Patented dual-pass: airflow loosens dust, microfiber completes the wipe",
    nyuma: "Single-pass counter-rotating PBT brush drum — fewer moving consumables",
  },
  row1: {
    criterion: "Best For",
    glyde: "Flagship fixed-tilt rows where maximum dust lift per cycle is the priority",
    nyuma: "Repeatable fixed-tilt blocks where PBT capex and brush economics win RFQs",
  },
  row2: {
    criterion: "Sticky / Cementitious Soiling",
    glyde: "Dual-pass excels on mixed dry and adhesive dust layers",
    nyuma: "Ideal for dry desert dust; schedule extra cycles if cementitious soiling is heavy",
  },
  row3: {
    criterion: "Consumable Profile",
    glyde: "Self-cleaning microfiber drum with extended service intervals",
    nyuma: "UV-stable PBT brush with field-replaceable bristle cartridges",
  },
  row4: {
    criterion: "Range Per Charge",
    glyde: "Up to 2.2 km (~3,600 modules)",
    nyuma: "Up to 2.2 km (~3,600 modules)",
  },
  row5: {
    criterion: "Typical Deployments",
    glyde: "Bachau DVC-scale automatic-first fixed-tilt fleets",
    nyuma: "Akhadana-scale and mixed-fleet PBT automatic programmes",
  },
  row6: {
    criterion: "Labour After Install",
    glyde: "Zero — fully autonomous daily cycles",
    nyuma: "Zero — fully autonomous daily cycles",
  },
  row7: {
    criterion: "Fleet Monitoring",
    glyde: "NECTYR via LTE, Wi-Fi, RF mesh, LoRa, or LoRaWAN",
    nyuma: "NECTYR via LTE, Wi-Fi, RF mesh, LoRa, or LoRaWAN",
  },
  crossSellLead: "Need a pick-and-place option for scattered blocks? See ",
  linkHelyx: "HELYX",
  crossSellMid: ". Running single-axis trackers? Compare ",
  linkTracker: "GLYDE-X and NYUMA-X",
  crossSellSuffix: ".",
};

const glydeXVsNyumaXEn = {
  eyebrow: "Tracker Robot Comparison",
  title: "GLYDE-X vs NYUMA-X: Which Tracker Robot Should You Specify?",
  subtitle:
    "Both robots traverse NEXTracker, Gamechanger, and equivalent single-axis tables with ±15° inter-table flex. GLYDE-X uses patented dual-pass microfiber; NYUMA-X uses single-pass PBT for capex-sensitive tracker programmes.",
  criterion: "Criterion",
  glydeXHeader: "GLYDE-X (Dual-Pass)",
  nyumaXHeader: "NYUMA-X (Single-Pass PBT)",
  row0: {
    criterion: "Cleaning Mechanism",
    glydeX: "Dual-pass microfiber — airflow plus wipe for mixed soiling",
    nyumaX: "Single-pass PBT brush — optimised for dry tracker dust belts",
  },
  row1: {
    criterion: "Tracker Compatibility",
    glydeX: "NEXTracker, Gamechanger, -52° to +52° module tilt",
    nyumaX: "NEXTracker, Gamechanger, -52° to +52° module tilt",
  },
  row2: {
    criterion: "Inter-Table Flex",
    glydeX: "±15° body articulation with validated bridge kits",
    nyumaX: "±15° body articulation with validated bridge kits",
  },
  row3: {
    criterion: "Operating Weight",
    glydeX: "26 kg compact tracker chassis",
    nyumaX: "26 kg compact tracker chassis",
  },
  row4: {
    criterion: "Range Per Charge",
    glydeX: "Up to 2.2 km (~3,600 modules)",
    nyumaX: "Up to 2.2 km (~3,600 modules)",
  },
  row5: {
    criterion: "When Owners Choose It",
    glydeX: "Premium tracker rows needing maximum dust lift per night cycle",
    nyumaX: "Large tracker fleets prioritising PBT capex and brush service economics",
  },
  row6: {
    criterion: "Autonomy & Scheduling",
    glydeX: "Fully autonomous, AI weather-aware scheduling via NECTYR",
    nyumaX: "Fully autonomous, AI weather-aware scheduling via NECTYR",
  },
  row7: {
    criterion: "Fixed-Tilt Alternative",
    glydeX: "See GLYDE for fixed-tilt dual-pass cleaning",
    nyumaX: "See NYUMA for fixed-tilt PBT cleaning",
  },
  crossSellLead: "Compare fixed-tilt robots: ",
  linkGlyde: "GLYDE vs NYUMA",
  crossSellMid: ". Prefer semi-automatic deployment? See ",
  linkHelyx: "HELYX",
  crossSellSuffix: ".",
};

function patchGlydeEn(page) {
  page.breadcrumbs.automaticRobot = "GLYDE — Dual-Pass Automatic Robot";
  page.usps.eyebrow = "GLYDE — Patented Dual-Pass Robot";
  page.usps.items = {
    item0: "Patented Dual-Pass Dust Lift",
    item1: "Self-Cleaning Microfiber Drum",
    item2: "Up to 3,600 Modules Per Charge",
    item3: "10–15 m/min Utility-Scale Speed",
    item4: "Frame-Mounted — Zero Glass Load",
    item5: "NECTYR Fleet Portal (LTE / Wi-Fi / RF / LoRa)",
    item6: "AI Weather-Aware Scheduling",
    item7: "TÜV NORD Field-Validated Build",
  };
  page.overview.p3 =
    "GLYDE's patented dual-pass mechanism combines high-speed airflow with a self-cleaning microfiber drum — the first pass lifts dry dust, the second completes the wipe without water or detergent. Edge and obstacle detection maps every panel boundary while surface-undulation tracking keeps brush pressure consistent row-by-row. Battery-aware logic ensures each assigned array is cleaned completely before the robot self-docks — rated for 180 km/hr gusts while locked at the station.";
  page.featuresLongForm.weather.body =
    "GLYDE's scheduler weighs wind speed, rain probability, humidity, and post-storm dust rebound before committing a dual-pass cycle — skipping wasted runs after rain and prioritising recovery nights after haboob or construction dust events.";
  page.featuresLongForm.edge.body =
    "Millimetre-class edge sensors and continuous obstacle scanning keep GLYDE on the module frame at all times — critical when dual-pass cleaning runs at 10–15 m/min across imperfect utility tables.";
  page.featuresLongForm.build.body =
    "IP65-sealed electronics, corrosion-class C3 hardware, and a fully enclosed wiring harness protect the dual-pass drivetrain through Rajasthan heat, Gujarat dust, and coastal monsoon humidity.";
  page.featuresLongForm.connectivity.bodyAfterLoRa =
    " where low-power, long-range links suit remote blocks. Schedule dual-pass cycles, push firmware updates, and audit every cleaning run from NECTYR — docking telemetry covers charge state, brush wear indicators, and fault codes in real time.";
  page.advantagesSection.energy.body =
    "Daily dual-pass cleaning keeps module transmissivity high on dusty sites — site teams commonly model 4–8% PR recovery versus fortnightly manual washing (site-dependent).";
  page.advantagesSection.waterless.body =
    "GLYDE's airflow-plus-microfiber cycle removes over 99% surface dust with zero water, tankers, or discharge compliance — ideal for water-stressed districts.";
  page.advantagesSection.autonomous.body =
    "Once commissioned, GLYDE runs post-production hours without row crews — AI scheduling in NECTYR handles cadence, skip logic, and fleet health.";
  page.advantagesSection.cost.body =
    "Dual-pass automation replaces recurring labour, water, and night-shift safety costs; most utility owners model payback inside 12–18 months.";
  page.advantagesSection.safe.body =
    "GLYDE travels only on the module frame with non-abrasive microfiber contact — lab-tested for micro-crack, reflectance, and ARC preservation.";
  page.installSection.p2 =
    "Commissioning a GLYDE array typically takes a few hours to two days per block: shadow-free docking placement, dual-pass calibration, and NECTYR fleet onboarding — no module or railing modifications.";
  page.installSection.p3 =
    "Multi-block plants may take several days for full fleet rollout. After handover, robots run autonomously with Taypro's same-day breakdown SLA and remote diagnostics through NECTYR.";
  page.cycleNarrative.steps.s3 =
    "⦿ The dual-pass head activates — airflow loosens dry dust, then the self-cleaning microfiber drum completes the wipe at 10–15 m/min with zero water";
  page.cycleNarrative.steps.s7 =
    "⦿ Fault detection monitors brush load, battery state, and drivetrain telemetry — anomalies trigger safe stop and NECTYR alerts";
  page.cycleNarrative.steps.s8 =
    "⦿ Obstacle handling, microfiber self-cleaning, and row-adaptive speed control keep dual-pass quality consistent across the assigned array";
  page.servicePromise.cards.card0.body =
    "GLYDE AMC plans include scheduled brush inspection, dual-pass calibration checks, and consumable planning sized for your soiling class.";
  page.servicePromise.cards.card1.body =
    "NECTYR receives dock-level telemetry first — Taypro engineers resolve most GLYDE faults over-the-air before dispatching field staff.";
  page.servicePromise.cards.card2.body =
    "When a site visit is required, Taypro targets same-day pan-India response with regional spares for GLYDE drivetrain and brush modules.";
  page.indianConditions.cards.card0.body =
    "In Rajasthan, Gujarat, and MP dust belts, GLYDE's nightly dual-pass cadence is how IPPs hold PR when manual crews can only wash fortnightly.";
  page.indianConditions.cards.card2.body =
    "Water allocations for module washing are tightening across Indian states — GLYDE removes tankers entirely while preserving dual-pass cleaning quality.";
  page.indianConditions.linkNyuma = "PBT automatic NYUMA robot";
  page.faq.productSpecific.item2.question =
    "What is the difference between GLYDE, NYUMA, and GLYDE-X?";
  page.faq.productSpecific.item2.answer =
    "GLYDE is Taypro's dual-pass microfiber automatic robot for fixed-tilt utility rows. NYUMA is the single-pass PBT automatic alternative for capex-efficient fixed-tilt fleets. GLYDE-X carries the dual-pass platform to single-axis trackers. All three connect to NECTYR; choose based on plant type and cleaning technology preference.";
  page.glydeVsNyuma = glydeVsNyumaEn;
  page.howToSection.subtitle =
    "GLYDE runs end-to-end without operators on the row. Each assigned TR-150 unit executes a patented dual-pass cycle — the workflow below matches our HowTo structured data and field SOPs at deployed plants.";
  page.howToSection.steps.step0.text =
    "Each GLYDE TR-150 is permanently assigned to one fixed-tilt or seasonal-tilt array with a shadow-free dock. Integrated lithium-ion charging needs no external power — the dual-pass head and frame rails are calibrated once at commissioning.";
  page.howToSection.steps.step1.text =
    "NECTYR schedules GLYDE outside production hours. AI logic weighs soiling forecasts, rain skip rules, and fleet history so dual-pass cycles run only when they will recover PR.";
  page.howToSection.steps.step2.text =
    "At the scheduled time GLYDE undocks, traverses inter-table bridges if configured, and travels along the module frame — edge sensors ensure zero load on glass throughout the dual-pass run.";
  page.howToSection.steps.step4.text =
    "Battery-aware routing limits each run to a safe distance, then GLYDE locks at the dock — rated for 180 km/hr gusts while stowed between dual-pass cycles.";
  page.howToSection.steps.step5.textBeforeConnectivity =
    "Dual-pass telemetry — brush load, cycle time, dust-lift flags — syncs to NECTYR over ";
  page.faq.sharedFromData.item0.question =
    "Who monitors GLYDE after installation?";
  page.faq.sharedFromData.item3.question =
    "When does GLYDE clean relative to plant production?";
  page.projects.tagline =
    "GLYDE deployments include dual-pass commissioning, NECTYR onboarding, and same-day breakdown support across India.";
  page.trustStats.subtitle =
    "GLYDE fleets operate at Bachau DVC, Neneva tracker companion sites, and 5,000+ MW of Taypro-managed capacity — dual-pass robots are Taypro's flagship fixed-tilt platform.";
}

function patchNyumaEn(page) {
  page.breadcrumbs.automaticRobot = "NYUMA — PBT Automatic Robot";
  page.usps.eyebrow = "NYUMA — Single-Pass PBT Robot";
  page.usps.items = {
    item0: "Single-Pass PBT Brush Cleaning",
    item1: "UV-Stable Bristle Cartridges",
    item2: "Up to 3,600 Modules Per Charge",
    item3: "10–15 m/min Row Speed",
    item4: "Frame-Mounted — Zero Glass Load",
    item5: "NECTYR Fleet Portal (LTE / Wi-Fi / RF / LoRa)",
    item6: "Capex-Efficient Automatic Fleet",
    item7: "TÜV NORD Field-Validated Build",
  };
  page.overview.p3 =
    "NYUMA's counter-rotating PBT brush drum lifts dry dust in a single waterless pass — no airflow stage, fewer consumables, and straightforward brush replacement in the field. Edge detection and surface-undulation tracking keep contact on the module frame, never the glass. Battery-aware routing ensures each robot finishes its assigned row before returning to its shadow-free dock, even on seasonal-tilt tables up to 45°.";
  page.featuresLongForm.aiCleaning.title = "AI-Enabled Waterless Single-Pass Cleaning";
  page.featuresLongForm.aiCleaning.body =
    "NYUMA applies AI- and ML-driven pressure and speed logic to a single-pass PBT brush drum — one continuous contact sweep removes over 99% of dry dust per automated run without water, detergent, or abrasive glass contact.";
  page.featuresLongForm.microfiber.title = "Self-Cleaning PBT Brush Drum";
  page.featuresLongForm.microfiber.body =
    "UV-stable PBT bristles maintain stiffness in desert heat while a self-cleaning drum mechanism clears embedded dust between modules — consumable swaps are field-serviceable without removing the robot from the row.";
  page.featuresLongForm.weather.body =
    "NYUMA's scheduler skips cycles when rain has already washed modules and adds post-storm runs when dust rebound is detected — optimising PBT brush life while keeping PR stable.";
  page.featuresLongForm.edge.body =
    "Edge-mapping sensors and obstacle detection keep NYUMA on the frame during single-pass runs at 10–15 m/min — essential on seasonal-tilt tables with uneven undulation.";
  page.featuresLongForm.build.body =
    "Sealed IP65 electronics and C3 corrosion protection shield the PBT drivetrain from abrasive dust ingress — validated for Indian damp-heat and dry-heat cycles.";
  page.featuresLongForm.connectivity.bodyAfterLoRa =
    " where low-power, long-range links suit remote blocks. Operate mixed NYUMA fleets from NECTYR — schedule single-pass cycles, track brush-hour counters, and download audit logs for O&M governance.";
  page.advantagesSection.energy.body =
    "Consistent single-pass PBT cleaning prevents the 5–25% soiling drift common between manual washes — owners often model 4–8% PR uplift on high-soiling sites.";
  page.advantagesSection.waterless.body =
    "NYUMA removes dust with a dry PBT brush only — zero litres per module, no tanker logistics, and no discharge risk in water-scarce districts.";
  page.advantagesSection.autonomous.body =
    "NYUMA deploys autonomously after a one-time dock install — operators manage cadence remotely in NECTYR without night crews on the row.";
  page.advantagesSection.cost.body =
    "Single-pass PBT economics reduce upfront consumable complexity versus dual-pass systems — attractive for large fixed-tilt fleets with predictable dry dust.";
  page.advantagesSection.safe.body =
    "NYUMA rides the module frame with lab-validated PBT contact pressure — tested for micro-crack, reflectance, and ARC integrity under daily cycles.";
  page.installSection.p2 =
    "NYUMA commissioning covers dock placement, PBT brush calibration, and NECTYR onboarding — typically hours to two days per array with no structural plant changes.";
  page.installSection.p3 =
    "Full-fleet rollouts across multi-block plants may take up to a week. Post-handover operation is autonomous with Taypro same-day support and remote diagnostics.";
  page.cycleNarrative.steps.s3 =
    "⦿ The PBT brush drum spins up for a single waterless pass — counter-rotating bristles lift dry dust at 10–15 m/min without water or detergent";
  page.cycleNarrative.steps.s7 =
    "⦿ Brush-load and battery telemetry feed fault detection — anomalies trigger a controlled stop and NECTYR notification";
  page.cycleNarrative.steps.s8 =
    "⦿ Self-cleaning brush action and adaptive row speed keep single-pass quality uniform across the assigned array";
  page.servicePromise.cards.card0.body =
    "NYUMA AMC includes brush-hour tracking, scheduled PBT cartridge inspection, and spare planning aligned to your site's dust loading.";
  page.servicePromise.cards.card1.body =
    "Most NYUMA incidents are triaged remotely via NECTYR — firmware, schedule, and telemetry fixes land over-the-air before a truck roll.";
  page.servicePromise.cards.card2.body =
    "Physical interventions target same-day pan-India resolution with stocked PBT consumables and drivetrain spares.";
  page.indianConditions.cards.card0.body =
    "NYUMA automatic fleets serve high-soiling belts — Akhadana-scale deployments show how PBT robots sustain cadence when wet washing cannot keep pace.";
  page.indianConditions.cards.card2.body =
    "Single-pass dry cleaning eliminates tanker dependency — critical where state water boards restrict module washing allocations.";
  page.indianConditions.linkGlyde = "dual-pass GLYDE robot";
  page.faq.productSpecific.item2.question =
    "What is the difference between NYUMA, GLYDE, and NYUMA-X?";
  page.faq.productSpecific.item2.answer =
    "NYUMA is Taypro's single-pass PBT automatic robot for fixed-tilt utility plants. GLYDE is the dual-pass microfiber flagship for the same plant type. NYUMA-X extends the PBT platform to single-axis trackers. All share NECTYR monitoring — pick based on mounting structure and brush technology preference.";
  page.glydeVsNyuma = glydeVsNyumaEn;
  page.howToSection.subtitle =
    "NYUMA executes autonomous single-pass PBT cleaning without row crews. The workflow below mirrors our HowTo structured data and the nightly cycle run at NYUMA automatic fleets.";
  page.howToSection.steps.step0.text =
    "Each NYUMA unit is assigned to one array with a dedicated dock and self-contained lithium-ion charging — PBT brush calibration and frame pairing happen once at commissioning.";
  page.howToSection.steps.step1.text =
    "Operators schedule NYUMA through NECTYR. Weather-aware logic skips rain-washed days and prioritises post-storm PBT runs when dust rebound is highest.";
  page.howToSection.steps.step2.text =
    "NYUMA self-deploys along the module frame at the scheduled time — edge and obstacle mapping keeps the PBT drum on the frame, never on the glass.";
  page.howToSection.steps.step4.text =
    "Real-time battery monitoring caps each run to a completable distance; NYUMA returns to dock and locks against gusts up to 180 km/hr before the next single-pass cycle.";
  page.howToSection.steps.step5.textBeforeConnectivity =
    "Single-pass cycle logs — brush hours, distance, charge state — upload to NECTYR over ";
  page.faq.sharedFromData.item0.question =
    "Who monitors NYUMA after installation?";
  page.faq.sharedFromData.item3.question =
    "When does NYUMA clean relative to plant production?";
  page.projects.tagline =
    "NYUMA programmes include PBT brush commissioning, fleet onboarding in NECTYR, and pan-India same-day support.";
  page.trustStats.subtitle =
    "NYUMA automatic fleets serve Akhadana-scale blocks and mixed-fleet programmes across 5,000+ MW of Taypro-managed Indian utility capacity.";
}

function patchGlydeXEn(page) {
  page.breadcrumbs.current = "GLYDE-X — Dual-Pass Tracker Robot";
  page.hero.title = "GLYDE-X — Dual-Pass Tracker Solar Panel Cleaning Robot";
  page.usps["0"].title = "Dual-Pass Tracker Native Design";
  page.usps["1"].title = "±15° Inter-Table Articulation";
  page.usps["2"].title = "Full Tracker Tilt Range (-52° to +52°)";
  page.usps["4"].title = "Tracker-Aware Autonomous Navigation";
  page.usps["5"].title = "NECTYR Tracker Fleet Scheduling";
  page.usps["6"].title = "2.2 km Tracker Run Per Charge";
  page.usps["7"].title = "TÜV NORD Tracker Field Validation";
  page.usps["3"] = {
    title: "100% Waterless Dual-Pass Cleaning",
    description:
      "Patented dual-pass microfiber lifts over 99% of dry and adhesive dust on tracker tables — no water, detergent, or run-off.",
  };
  page.usps["0"].description =
    "Built for NEXTracker, Gamechanger, and equivalent horizontal single-axis tables — not a retrofitted fixed-tilt chassis.";
  page.usps["1"].description =
    "±15° body flex crosses inter-table angle mismatch while bridge kits maintain continuous cleaning paths.";
  page.usps["2"].description =
    "Cleans from -52° to +52° module tilt — full morning-to-evening tracker travel without parking arrays flat for crews.";
  page.usps["4"].description =
    "Edge, obstacle, and tracker-angle sensing let GLYDE-X traverse moving tables safely after production hours.";
  page.usps["5"].description =
    "Fleet telemetry over {connectivity} — schedule tracker-synchronised cycles and stow-aware cleaning windows from NECTYR.";
  page.usps["6"].description =
    "Up to 2.2 km (≈3,600 modules) per charge with autonomous return to a shadow-free tracker dock.";
  page.usps["7"].description =
    "TÜV NORD IP55 validation plus sandstorm and damp-heat testing for Indian tracker belts.";
  page.certifications.card0Title = "TÜV NORD Tracker Validation";
  page.certifications.card0Body =
    "Independently certified for IP55 protection with tracker-specific damp-heat and dry-heat performance testing.";
  page.certifications.card1Title = "Sandstorm & Dust-Belt Testing";
  page.certifications.card1Body =
    "Simulated 12 sandstorm events per year at 10 g/m² loading — mirroring Rajasthan and Gujarat tracker O&M conditions.";
  page.certifications.card2Title = "Panel-Safe Dual-Pass Contact";
  page.certifications.card2Body =
    "Micro-crack, reflectance, and ARC preservation testing under daily dual-pass cycles on tracker-mounted modules.";
  page.glydeXVsNyumaX = glydeXVsNyumaXEn;
}

function patchNyumaXEn(page) {
  page.breadcrumbs.current = "NYUMA-X — PBT Tracker Robot";
  page.hero.title = "NYUMA-X — PBT Single-Pass Tracker Cleaning Robot";
  page.usps["0"].title = "Single-Pass PBT for Trackers";
  page.usps["1"].title = "±15° Bridge & Table Flex";
  page.usps["2"].title = "Steep Tilt Tracker Coverage";
  page.usps["4"].title = "Stow-Aware Autonomous Routing";
  page.usps["5"].title = "NECTYR PBT Fleet Telemetry";
  page.usps["6"].title = "Long-Range Tracker Battery Cycle";
  page.usps["7"].title = "TÜV NORD PBT Tracker Certification";
  page.usps["3"] = {
    title: "100% Waterless Single-Pass PBT Cleaning",
    description:
      "Counter-rotating PBT bristles lift over 99% of dry tracker dust in one pass — no water, detergent, or run-off.",
  };
  page.usps["0"].description =
    "Purpose-built for single-axis tracker farms — compatible with NEXTracker, Gamechanger, and peer OEM table geometries.";
  page.usps["1"].description =
    "Body articulates ±15° to traverse inter-table misalignment while maintaining brush contact on the module frame.";
  page.usps["2"].description =
    "Operational across -52° to +52° tracker tilt — cleans steep morning and evening angles without daytime array shutdown.";
  page.usps["4"].description =
    "AI edge and angle detection adapts to tracker stow positions and row undulation during autonomous night cycles.";
  page.usps["5"].description =
    "Remote fleet control via {connectivity} through NECTYR — tracker-aware schedules and post-storm recovery runs.";
  page.usps["6"].description =
    "Single charge covers up to 2.2 km of tracker run (~3,600 modules) before self-docking for solar-assisted recharge.";
  page.usps["7"].description =
    "TÜV NORD certified with IP55 protection validated for abrasive tracker dust and Indian monsoon humidity.";
  page.certifications.card0Title = "TÜV NORD PBT Tracker Certification";
  page.certifications.card0Body =
    "IP55-rated enclosure validated for tracker-field damp-heat, dry-heat, and vibration profiles.";
  page.certifications.card1Title = "Desert Soiling Endurance";
  page.certifications.card1Body =
    "PBT brush life validated under repeated high-loading dust cycles representative of Thar-edge tracker plants.";
  page.certifications.card2Title = "ARC-Safe PBT Contact";
  page.certifications.card2Body =
    "Single-pass PBT pressure tested for micro-crack, optical reflectance, and anti-reflective coating preservation on trackers.";
  page.nyumaXVsNyuma.row3.nyumaX =
    "Waterless single-pass PBT brush drum";
  page.glydeXVsNyumaX = glydeXVsNyumaXEn;
}

// English full patch
const glydeEn = loadJson("messages/pages/en/glyde.json");
patchGlydeEn(glydeEn.GlydePage);
saveJson("messages/pages/en/glyde.json", glydeEn);

const nyumaEn = loadJson("messages/pages/en/nyuma.json");
patchNyumaEn(nyumaEn.NyumaPage);
saveJson("messages/pages/en/nyuma.json", nyumaEn);

const glydeXEn = loadJson("messages/pages/en/glyde-x.json");
patchGlydeXEn(glydeXEn.GlydeXPage);
saveJson("messages/pages/en/glyde-x.json", glydeXEn);

const nyumaXEn = loadJson("messages/pages/en/nyuma-x.json");
patchNyumaXEn(nyumaXEn.NyumaXPage);
saveJson("messages/pages/en/nyuma-x.json", nyumaXEn);

/** Minimal cross-locale fixes: comparison keys + copy-paste error repair (preserve translations). */
function patchLocaleMinimal(locale) {
  const nyumaRel = `messages/pages/${locale}/nyuma.json`;
  if (fs.existsSync(path.join(ROOT, nyumaRel))) {
    const data = loadJson(nyumaRel);
    const page = data.NyumaPage;
    if (page?.featuresLongForm?.aiCleaning?.body?.includes("second sweeps")) {
      page.featuresLongForm.aiCleaning.body =
        locale === "en"
          ? page.featuresLongForm.aiCleaning.body
          : page.featuresLongForm.aiCleaning.body
              .replace(/first pass.*?second sweeps away sticky residue\.?/i, "a single PBT brush pass removes accumulated dry dust")
              .replace(/, the first pass loosens dry dust while the second sweeps away sticky residue/i, "");
    }
    page.glydeVsNyuma = glydeVsNyumaEn;
    saveJson(nyumaRel, data);
  }

  const nyumaXRel = `messages/pages/${locale}/nyuma-x.json`;
  if (fs.existsSync(path.join(ROOT, nyumaXRel))) {
    const data = loadJson(nyumaXRel);
    const page = data.NyumaXPage;
    if (page?.usps?.["3"]?.description?.includes("Two-pass")) {
      page.usps["3"].title =
        locale === "en"
          ? page.usps["3"].title
          : page.usps["3"].title.replace(/two-pass/i, "single-pass");
      page.usps["3"].description =
        "Counter-rotating PBT bristles lift over 99% of dry tracker dust in one pass — no water, detergent, or run-off.";
    }
    page.glydeXVsNyumaX = glydeXVsNyumaXEn;
    saveJson(nyumaXRel, data);
  }

  const glydeRel = `messages/pages/${locale}/glyde.json`;
  if (fs.existsSync(path.join(ROOT, glydeRel))) {
    const data = loadJson(glydeRel);
    data.GlydePage.glydeVsNyuma = glydeVsNyumaEn;
    saveJson(glydeRel, data);
  }

  const glydeXRel = `messages/pages/${locale}/glyde-x.json`;
  if (fs.existsSync(path.join(ROOT, glydeXRel))) {
    const data = loadJson(glydeXRel);
    data.GlydeXPage.glydeXVsNyumaX = glydeXVsNyumaXEn;
    saveJson(glydeXRel, data);
  }
}

for (const locale of LOCALES) {
  if (locale !== "en") patchLocaleMinimal(locale);
}

console.log("Product duplicate-content fixes applied (full: en, minimal: other locales)");
