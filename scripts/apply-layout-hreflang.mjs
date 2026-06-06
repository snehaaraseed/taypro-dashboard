#!/usr/bin/env node
/**
 * One-time helper: convert `export const metadata` in locale layouts to
 * `export const generateMetadata = defineLocalizedMetadata(...)`.
 * Run manually if adding new layouts; core routes are already converted in repo.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const layouts = [
  ["src/app/[locale]/company/layout.tsx", "/company"],
  ["src/app/[locale]/contact/layout.tsx", "/contact"],
  ["src/app/[locale]/projects/layout.tsx", "/projects"],
  ["src/app/[locale]/projects/automatic/layout.tsx", "/projects/automatic"],
  ["src/app/[locale]/projects/semi-automatic/layout.tsx", "/projects/semi-automatic"],
  ["src/app/[locale]/projects/capex/layout.tsx", "/projects/capex"],
  ["src/app/[locale]/projects/opex/layout.tsx", "/projects/opex"],
  ["src/app/[locale]/solar-panel-cleaning-system/layout.tsx", "/solar-panel-cleaning-system"],
  [
    "src/app/[locale]/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system/layout.tsx",
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  ],
  [
    "src/app/[locale]/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system/layout.tsx",
    "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
  ],
  [
    "src/app/[locale]/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers/layout.tsx",
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
  ],
  [
    "src/app/[locale]/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app/layout.tsx",
    "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
  ],
  [
    "src/app/[locale]/solar-panel-cleaning-system/solar-panel-cleaning-service/layout.tsx",
    "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  ],
  [
    "src/app/[locale]/solar-panel-cleaning-robot-price-calculator/layout.tsx",
    "/solar-panel-cleaning-robot-price-calculator",
  ],
  ["src/app/[locale]/blog/layout.tsx", "/blog"],
  ["src/app/[locale]/contact/thank-you/layout.tsx", "/contact"],
];

for (const [rel, internalPath] of layouts) {
  const file = join(root, rel);
  let src = readFileSync(file, "utf8");
  if (src.includes("defineLocalizedMetadata")) {
    console.log("skip", rel);
    continue;
  }
  if (!src.includes("export const metadata:")) {
    console.log("no metadata export", rel);
    continue;
  }

  if (!src.includes('from "@/lib/seo/with-hreflang"')) {
    src = src.replace(
      'import type { Metadata } from "next";',
      'import type { Metadata } from "next";\nimport { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";'
    );
  }

  src = src.replace(
    /export const metadata: Metadata = \{/,
    `export const generateMetadata = defineLocalizedMetadata("${internalPath}", () => ({`
  );

  const lastAlt = src.lastIndexOf("alternates:");
  if (lastAlt === -1) {
    console.log("no alternates", rel);
    continue;
  }
  const altStart = src.indexOf("{", lastAlt);
  let depth = 0;
  let altEnd = altStart;
  for (let i = altStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") depth--;
    if (depth === 0) {
      altEnd = i + 1;
      break;
    }
  }
  const beforeAlt = src.slice(0, lastAlt).replace(/,\s*$/, "");
  const afterAlt = src.slice(altEnd).replace(/^\s*,\s*/, "");
  src = beforeAlt + (afterAlt.startsWith("}") ? "" : ",") + afterAlt;

  src = src.replace(/\};\s*\n\nexport default function/, "}));\n\nexport default function");

  writeFileSync(file, src);
  console.log("updated", rel);
}
