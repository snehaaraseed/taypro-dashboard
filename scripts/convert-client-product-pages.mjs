#!/usr/bin/env node
/** One-off: strip use client + useMemo from product pages (run manually if needed). */
import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/app/[locale]/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers/page.tsx",
  "src/app/[locale]/solar-panel-cleaning-system/solar-panel-cleaning-service/page.tsx",
];

for (const rel of files) {
  let s = readFileSync(rel, "utf8");
  s = s.replace(/^"use client";\n\n/, "");
  s = s.replace(
    /import \{ useTranslations \} from "next-intl";\nimport \{ useMemo \} from "react";\n/,
    'import { getTranslations } from "next-intl/server";\n'
  );
  s = s.replace(
    /import \{ useTranslations \} from "next-intl";\n/,
    'import { getTranslations } from "next-intl/server";\n'
  );
  s = s.replace(/import \{ useMemo \} from "react";\n/, "");
  writeFileSync(rel, s);
  console.log("patched imports", rel);
}
