#!/usr/bin/env node
/**
 * SEO priority fixes: ROI legacy names, locale sync from EN product JSON, meta hints.
 */
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];
const productFiles = [
  "glyde.json",
  "helyx.json",
  "glyde-x.json",
  "nyuma.json",
  "nyuma-x.json",
];

function patch(path, rules) {
  const full = join(root, path);
  let s = readFileSync(full, "utf8");
  for (const [from, to] of rules) {
    s = s.replace(from, to);
  }
  writeFileSync(full, s);
  console.log("patched", path);
}

// ROI, GLYDE
patch("messages/pages/en/glyde.json", [
  [
    /TAYPRO's Model A Automatic Solar Panel Cleaning Robot/g,
    "TAYPRO's GLYDE Automatic Solar Panel Cleaning Robot",
  ],
  [/Also, Model A reduces/g, "Also, GLYDE reduces"],
  [
    /What Is the ROI for Installing the Automatic Solar Panel Cleaning Robot GLYDE\?/g,
    "What Is the ROI for Installing the Taypro GLYDE Automatic Solar Panel Cleaning Robot?",
  ],
]);

// ROI, NYUMA
patch("messages/pages/en/nyuma.json", [
  [
    /TAYPRO's Model A Automatic Solar Panel Cleaning Robot/g,
    "TAYPRO's NYUMA Automatic Solar Panel Cleaning Robot",
  ],
  [/Also, Model A reduces/g, "Also, NYUMA reduces"],
]);

// GLYDE meta: dual-pass in title (flagship owns generic automatic + dual-pass)
patch("messages/pages/en/glyde.json", [
  [
    /"title": "Automatic Solar Panel Cleaning Robot, Taypro GLYDE \(Waterless, AI\)"/,
    '"title": "Dual-Pass Automatic Solar Panel Cleaning Robot, Taypro GLYDE (Waterless, AI)"',
  ],
  [
    /"openGraphTitle": "Automatic Solar Panel Cleaning Robot, Taypro GLYDE \(Waterless, AI\)"/,
    '"openGraphTitle": "Dual-Pass Automatic Solar Panel Cleaning Robot, Taypro GLYDE (Waterless, AI)"',
  ],
  [
    /"twitterTitle": "Automatic Solar Panel Cleaning Robot, Taypro GLYDE \(Waterless, AI\)"/,
    '"twitterTitle": "Dual-Pass Automatic Solar Panel Cleaning Robot, Taypro GLYDE (Waterless, AI)"',
  ],
  [
    /"openGraphDescription": "Taypro GLYDE: Automatic Solar Panel Cleaning Robot for utility-scale plants\. Autonomous waterless dual-pass cleaning/,
    '"openGraphDescription": "Taypro GLYDE: patented dual-pass microfiber Automatic Solar Panel Cleaning Robot for utility-scale plants. Autonomous waterless cleaning',
  ],
]);

// NYUMA meta, PBT differentiation
const nyumaMeta = JSON.parse(
  readFileSync(join(root, "messages/pages/en/nyuma.json"), "utf8")
);
Object.assign(nyumaMeta.NyumaPage.meta, {
  title:
    "PBT Automatic Solar Panel Cleaning Robot, Taypro NYUMA (Waterless, AI)",
  description:
    "Taypro NYUMA is a fully autonomous PBT single-pass Automatic Solar Panel Cleaning Robot for fixed and seasonal-tilt utility plants. Waterless AI/ML dry cleaning removes 99%+ dust per cycle, up to 3,600 modules per charge, NECTYR fleet portal, TÜV NORD certified, same-day pan-India support.",
  keywords: [
    "PBT solar panel cleaning robot",
    "PBT automatic solar panel cleaning robot",
    "single-pass solar panel cleaning robot",
    "single-pass automatic solar cleaning robot",
    "waterless PBT solar cleaning robot",
    "fixed tilt PBT cleaning robot",
    "automatic solar panel cleaning robot India",
    "autonomous solar panel cleaning robot",
    "utility scale solar cleaning robot",
    "TÜV NORD certified solar cleaning robot",
    "Taypro NYUMA",
  ],
  openGraphTitle:
    "PBT Automatic Solar Panel Cleaning Robot, Taypro NYUMA",
  openGraphDescription:
    "Taypro NYUMA: PBT single-pass automatic cleaning for utility fixed-tilt plants. 99%+ dust removal per cycle, up to 3,600 modules per charge, NECTYR fleet monitoring, TÜV NORD certified.",
  openGraphImageAlt:
    "Taypro NYUMA PBT automatic solar panel cleaning robot",
  twitterTitle:
    "PBT Automatic Solar Panel Cleaning Robot, Taypro NYUMA",
  twitterDescription:
    "Taypro NYUMA: autonomous waterless PBT single-pass cleaning, 99%+ dust removal per cycle, NECTYR-connected fleet portal.",
});
writeFileSync(
  join(root, "messages/pages/en/nyuma.json"),
  `${JSON.stringify(nyumaMeta, null, 2)}\n`
);
console.log("patched messages/pages/en/nyuma.json (meta)");

// NYUMA-X meta
const nyumaXMeta = JSON.parse(
  readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8")
);
Object.assign(nyumaXMeta.NyumaXPage.meta, {
  title:
    "PBT Tracker Solar Panel Cleaning Robot, Taypro NYUMA-X",
  description:
    "Taypro NYUMA-X is a waterless PBT single-pass Solar Panel Cleaning Robot for single-axis tracker farms. 99%+ dust removal per run, up to 3,600 modules per charge, ±15° flex, NEXTracker and Gamechanger compatible, NECTYR fleet portal, TÜV NORD certified.",
  openGraphTitle:
    "PBT Tracker Solar Panel Cleaning Robot, Taypro NYUMA-X",
  openGraphDescription:
    "NYUMA-X: PBT single-pass autonomous cleaning for single-axis trackers. 99%+ dust removal, NECTYR monitoring, NEXTracker & Gamechanger compatible.",
  openGraphImageAlt:
    "Taypro NYUMA-X PBT tracker solar panel cleaning robot",
  twitterTitle:
    "PBT Tracker Solar Panel Cleaning Robot, Taypro NYUMA-X",
  twitterDescription:
    "Taypro NYUMA-X: PBT single-pass tracker robot. 3,600 modules per charge, NECTYR fleet portal, NEXTracker & Gamechanger compatible.",
  keywords: [
    "PBT tracker solar cleaning robot",
    "single-pass tracker solar cleaning robot",
    "single axis tracker solar panel cleaning",
    "single-axis tracker solar cleaning robot",
    "tracker solar panel cleaning robot",
    "NEXTracker solar cleaning robot",
    "Gamechanger tracker cleaning robot",
    "PBT solar panel cleaning robot tracker",
    "utility scale solar panel cleaning robot",
    "Taypro NYUMA-X",
  ],
});
writeFileSync(
  join(root, "messages/pages/en/nyuma-x.json"),
  `${JSON.stringify(nyumaXMeta, null, 2)}\n`
);
console.log("patched messages/pages/en/nyuma-x.json (meta)");

// GLYDE-X meta: dual-pass in title
patch("messages/pages/en/glyde-x.json", [
  [
    /"title": "Solar Panel Cleaning Robot for Single-Axis Trackers, Taypro GLYDE-X"/,
    '"title": "Dual-Pass Tracker Solar Panel Cleaning Robot, Taypro GLYDE-X"',
  ],
  [
    /"openGraphTitle": "Solar Panel Cleaning Robot for Single-Axis Trackers, Taypro GLYDE-X"/,
    '"openGraphTitle": "Dual-Pass Tracker Solar Panel Cleaning Robot, Taypro GLYDE-X"',
  ],
  [
    /"twitterTitle": "Solar Panel Cleaning Robot for Single-Axis Trackers, Taypro GLYDE-X"/,
    '"twitterTitle": "Dual-Pass Tracker Solar Panel Cleaning Robot, Taypro GLYDE-X"',
  ],
]);

// Sync EN product pages → locale copies (English body fallback until translated)
for (const file of productFiles) {
  const enPath = join(root, "messages/pages/en", file);
  for (const loc of locales) {
    copyFileSync(enPath, join(root, "messages/pages", loc, file));
    console.log(`synced ${loc}/${file} from en`);
  }
}

console.log("seo-priority-fixes done");
