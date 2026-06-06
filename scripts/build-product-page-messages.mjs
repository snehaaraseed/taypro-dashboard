/**
 * Builds messages/pages/{locale}/*.json for product pages from extracted arrays
 * plus inline UI copy defined here (sync with page.tsx).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["en", "hi", "ar", "ja", "bn"];

function loadExtracted(slug) {
  return JSON.parse(
    readFileSync(join(root, "scripts", `extracted-${slug}.json`), "utf8")
  );
}

function toIndexed(arr, mapFn = (x) => x) {
  const o = {};
  arr.forEach((item, i) => {
    o[String(i)] = mapFn(item);
  });
  return o;
}

function buildModelB(extracted) {
  return {
    HelyxPage: {
      meta: {
        title:
          "Semi-Automatic Solar Panel Cleaning Robot, Taypro Model-B (Pick-and-Place)",
        description:
          "Taypro Model-B is a 39 kg pick-and-place, semi-automatic Solar Panel Cleaning Robot. Counter-rotating PBT brushes remove 99%+ dust in a single waterless pass, clean a 1 MW plant in under 2 hours, run up to 3 km on a single charge, TÜV NORD certified, built for fixed-tilt and seasonal-tilt plants.",
        openGraphDescription:
          "Pick-and-place Solar Panel Cleaning Robot. 39 kg, waterless, dual counter-rotating PBT brushes, 99%+ dust removal in a single pass, 3 km per charge, TÜV NORD certified.",
        openGraphImageAlt:
          "Taypro Semi-Automatic Solar Panel Cleaning Robot Model-B, Pick-and-place type, waterless",
        twitterDescription:
          "39 kg pick-and-place Solar Panel Cleaning Robot. Waterless, dual counter-rotating PBT brushes, 99%+ dust removal per pass, TÜV NORD certified.",
      },
      breadcrumbs: {
        robots: "Solar Panel Cleaning Robots",
        current: "Semi-Automatic Solar Panel Cleaning Robot",
      },
      schema: {
        productName: "Semi-Automatic Solar Panel Cleaning Robot - Model-B",
        productDescription:
          "Taypro Model-B is a 39 kg pick-and-place, semi-automatic Solar Panel Cleaning Robot. Counter-rotating UV-stable PBT brushes remove 99%+ dust in a single pass, clean a 1 MW plant in under 2 hours, run up to 3 km on a single charge, TÜV NORD certified, and built for fixed tilt, seasonal tilt and horizontal single-axis tracker plants.",
        offersPrice: "Contact for pricing",
        howToName:
          "How to clean solar panels with the Taypro Model-B Semi-Automatic Solar Panel Cleaning Robot",
        howToDescription:
          "Step-by-step deployment of the Taypro Model-B pick-and-place semi-automatic solar panel cleaning robot, from lifting the robot onto the first row through recharging at the docking station.",
      },
      hero: {
        title: "Semi-Automatic Solar Panel Cleaning Robot, Model-B",
        subtitleBefore: "A 39 kg pick-and-place, waterless Solar Panel Cleaning Robot engineered for utility-scale solar power plants. Dual counter-rotating UV-stable PBT brushes lift over",
        subtitleStrong: "99% of dust in a single pass",
        subtitleAfter:
          ", cleaning a 1 MW block in under 2 hours and running up to 3 km on a single charge, operable by any two-person site team.",
        imgAlt:
          "Taypro Model-B, Semi-Automatic Solar Panel Cleaning Robot, pick-and-place waterless cleaner for utility-scale solar plants",
        ctaText: "Request a quote",
      },
      usps: toIndexed(extracted.helyxUsps),
      features: toIndexed(extracted.helyxFeatures),
      specs: toIndexed(extracted.helyxSpecs),
      steps: toIndexed(extracted.helyxSteps),
      faqs: toIndexed(extracted.helyxFaqs),
    },
    Common: { breadcrumbHome: "Home" },
  };
}

// Write en only from extraction; other locales filled by translate script or copy
for (const locale of locales) {
  const dir = join(root, "messages", "pages", locale);
  mkdirSync(dir, { recursive: true });
}

const modelB = buildModelB(loadExtracted("helyx"));
writeFileSync(
  join(root, "messages/pages/en/helyx.json"),
  JSON.stringify(modelB, null, 2)
);
console.log("Wrote en/helyx.json");
