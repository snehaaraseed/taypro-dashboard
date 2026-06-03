#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const path = join(import.meta.dirname, "../messages/pages/en/solar-system.json");
const data = JSON.parse(readFileSync(path, "utf8"));
const p = data.SolarSystemPage;

p.meta.description =
  "Compare every Taypro Solar Panel Cleaning Robot: HELYX, NYUMA, GLYDE, NYUMA-X, GLYDE-X, plus Taypro OPEX and Console. Waterless cleaning, AI scheduling, TÜV NORD certified, pan-India support.";
p.meta.keywords = p.meta.keywords.map((k) =>
  k.replace(/Model-A vs Model-B vs Model-T/, "HELYX GLYDE NYUMA robot lineup")
);
p.meta.openGraphDescription =
  "Choose the right robot for your plant, HELYX semi-automatic, NYUMA and GLYDE for fixed-tilt, NYUMA-X and GLYDE-X for single-axis trackers, plus OPEX and Console.";
p.meta.openGraphImageAlt =
  "Taypro Solar Panel Cleaning Robots, HELYX, NYUMA, GLYDE, NYUMA-X, GLYDE-X";
p.meta.twitterDescription =
  "Five Taypro cleaning robots for fixed-tilt and tracker plants, PBT single-pass and patented dual-pass microfiber options.";

p.schema.collectionPage.description =
  "Taypro robots: HELYX (pick-and-place), NYUMA and GLYDE (fixed-tilt automatic), NYUMA-X and GLYDE-X (tracker automatic), plus OPEX and Console.";

p.schema.itemList.items = {
  helyx: {
    description:
      "Semi-automatic pick-and-place waterless cleaning with single-pass PBT for scattered and distributed utility plants.",
  },
  glyde: {
    description:
      "Fully autonomous waterless cleaning with patented dual-pass airflow and microfiber for fixed and seasonal-tilt utility plants.",
  },
  nyuma: {
    description:
      "Fully autonomous single-pass PBT waterless cleaning for fixed and seasonal-tilt utility-scale plants.",
  },
  glydeX: {
    description:
      "Autonomous tracker robot with patented dual-pass microfiber and flexible 360° bridge.",
  },
  nyumaX: {
    description:
      "Autonomous tracker robot with single-pass PBT cleaning and flexible body for single-axis tables.",
  },
  tayproOpex: p.schema.itemList.items.tayproOpex,
  tayproConsole: p.schema.itemList.items.tayproConsole,
  miny: p.schema.itemList.items.miny,
  cradyl: p.schema.itemList.items.cradyl,
};

p.intro.p2LinkAutomatic = "GLYDE automatic robot";
p.intro.p2LinkModelB = "HELYX";
p.intro.p2LinkModelT = "GLYDE-X";
p.productGrid.subtitle =
  "Five robot platforms, one fleet portal, two commercial models, pick the plant fit and cleaning technology that match your site.";

p.productGrid.robotHighlights = {
  helyx: {
    eyebrow: "Semi-Automatic · Pick & Place",
    bullet0: "Single-pass PBT, no dual-pass, no microfiber",
    bullet1: "~1 MW in ~2 hours, portable across blocks",
    bullet2: "Scattered and distributed utility plants",
  },
  glyde: {
    eyebrow: "Fully Autonomous · Dual-Pass",
    bullet0: "Patented dual-pass microfiber (air + microfiber)",
    bullet1: "Up to 3,600 modules per charge, AI/ML scheduling",
    bullet2: "Fixed / seasonal-tilt utility-scale plants",
  },
  nyuma: {
    eyebrow: "Fully Autonomous · PBT",
    bullet0: "Single-pass UV-stable PBT brush",
    bullet1: "Up to 2.2 km per charge, AI/ML scheduling",
    bullet2: "Fixed / seasonal-tilt utility-scale plants",
  },
  glydeX: {
    eyebrow: "Tracker · Dual-Pass",
    bullet0: "Patented dual-pass microfiber on trackers",
    bullet1: "Flexible body and 360° bridge",
    bullet2: "Single-axis tracker plants",
  },
  nyumaX: {
    eyebrow: "Tracker · PBT",
    bullet0: "Single-pass PBT, same family as NYUMA",
    bullet1: "Flexible body for tracker tables",
    bullet2: "Single-axis tracker plants",
  },
};

p.decisionGuide.cards = {
  card0: {
    title: "Fixed-tilt, patented dual-pass",
    body: "Want Taypro's core dual-pass microfiber technology on fixed or seasonal-tilt arrays? GLYDE delivers fully autonomous cleaning with AI scheduling.",
    cta: "See GLYDE",
  },
  card1: {
    title: "Fixed-tilt, PBT platform",
    body: "Prefer a fully autonomous PBT single-pass platform on the same plant types? NYUMA is built for reliable daily dry cleaning without microfiber.",
    cta: "See NYUMA",
  },
  card2: {
    title: "Scattered or distributed plants",
    body: "HELYX is semi-automatic pick-and-place with single-pass PBT, ideal when crews move one robot across multiple blocks.",
    cta: "See HELYX",
  },
  card3: {
    title: "Single-axis tracker, dual-pass",
    body: "GLYDE-X pairs patented dual-pass microfiber with a flexible body for horizontal single-axis tracker plants.",
    cta: "See GLYDE-X",
  },
  card4: {
    title: "Single-axis tracker, PBT",
    body: "NYUMA-X delivers single-pass PBT cleaning on trackers with the same flexible-body platform class as GLYDE-X.",
    cta: "See NYUMA-X",
  },
  card5: {
    title: "Prefer outcomes, not assets?",
    body: "Taypro OPEX delivers robotic cleaning as a monthly service, with reports in Taypro Console.",
    cta: "See Taypro OPEX",
  },
};

p.comparison.title = "Compare Taypro cleaning robots";
p.comparison.subtitle =
  "Five hardware platforms across plant type, cleaning technology, autonomy, and connectivity.";
p.comparison.tableHeaders = {
  criteria: "Criteria",
  helyx: "HELYX",
  glyde: "GLYDE",
  nyuma: "NYUMA",
  glydeX: "GLYDE-X",
  nyumaX: "NYUMA-X",
};
p.comparison.rows = {
  row0: {
    criterion: "Plant type",
    helyx: "Scattered / distributed fixed-tilt",
    glyde: "Fixed / seasonal-tilt utility-scale",
    nyuma: "Fixed / seasonal-tilt utility-scale",
    glydeX: "Single-axis tracker",
    nyumaX: "Single-axis tracker",
  },
  row1: {
    criterion: "Autonomy",
    helyx: "Semi-automatic (pick & place)",
    glyde: "Fully autonomous",
    nyuma: "Fully autonomous",
    glydeX: "Fully autonomous",
    nyumaX: "Fully autonomous",
  },
  row2: {
    criterion: "Cleaning technology",
    helyx: "Single-pass PBT brush",
    glyde: "Patented dual-pass microfiber",
    nyuma: "Single-pass PBT brush",
    glydeX: "Patented dual-pass microfiber",
    nyumaX: "Single-pass PBT brush",
  },
  row3: {
    criterion: "Cleaning rate",
    helyx: "~1 MW in ~2 hours per unit",
    glyde: "Up to 3,600 modules per charge",
    nyuma: "Up to 2.2 km (~3,600 modules) per charge",
    glydeX: "Row-by-row, tracker-synchronised",
    nyumaX: "Row-by-row, tracker-synchronised",
  },
  row4: {
    criterion: "Commercial model",
    helyx: "CAPEX + AMC",
    glyde: "CAPEX + AMC",
    nyuma: "CAPEX + AMC",
    glydeX: "CAPEX + AMC",
    nyumaX: "CAPEX + AMC",
  },
  row5: {
    criterion: "Taypro Console",
    helyx: "Operator-led with Console reporting",
    glyde: "LTE, Wi-Fi, RF mesh, LoRa, LoRaWAN",
    nyuma: "LTE, Wi-Fi, RF mesh, LoRa, LoRaWAN",
    glydeX: "LTE, Wi-Fi, RF mesh, LoRa, LoRaWAN",
    nyumaX: "LTE, Wi-Fi, RF mesh, LoRa, LoRaWAN",
  },
};

p.brushComparison.robotTitle = "Taypro cleaning robots (HELYX / NYUMA / GLYDE / OPEX)";

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("rebrand-solar-system-hub done");
