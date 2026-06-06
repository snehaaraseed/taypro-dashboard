import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function extractObjectArrays(src, names) {
  const out = {};
  for (const name of names) {
    const re = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`, "m");
    const m = src.match(re);
    if (!m) {
      out[name] = null;
      continue;
    }
    const block = m[1];
    const items = [];
    const itemRe = /\{([\s\S]*?)\}(?=,\s*\{|\s*\]|$)/g;
    let im;
    while ((im = itemRe.exec(block))) {
      const obj = {};
      const chunk = im[1];
      const strRe =
        /(question|answer|title|description|body|name|text|label|value|criterion|manual|modelB|modelA|modelT|t|opex|capex):\s*(["'`])((?:\\.|(?!\2).)*)\2/g;
      let sm;
      while ((sm = strRe.exec(chunk))) {
        obj[sm[1]] = sm[3]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"');
      }
      if (Object.keys(obj).length) items.push(obj);
    }
    out[name] = items;
  }
  return out;
}

const pages = [
  [
    "semi-automatic-solar-panel-cleaning-system",
    "helyx",
    ["helyxUsps", "helyxFeatures", "helyxSpecs", "helyxSteps", "helyxFaqs"],
  ],
  [
    "automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    "glyde-x",
    ["glydeXUsps", "glydeXFeatures", "glydeXSpecs", "glydeXSteps", "glydeXFaqs"],
  ],
  [
    "automatic-cleaning-robot-monitoring-app",
    "nectyr",
    ["consoleFaqs", "capabilityCards"],
  ],
  [
    "solar-panel-cleaning-service",
    "cleaning-service",
    ["opexServiceFaqs", "opexHowToSteps", "plantStudyFactors"],
  ],
];

for (const [dir, slug, arrays] of pages) {
  const file = join(
    root,
    "src/app/[locale]/solar-panel-cleaning-system",
    dir,
    "page.tsx"
  );
  const src = readFileSync(file, "utf8");
  const data = extractObjectArrays(src, arrays);
  writeFileSync(
    join(root, "scripts", `extracted-${slug}.json`),
    JSON.stringify(data, null, 2)
  );
  console.log(
    slug,
    Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v?.length ?? 0]))
  );
}
