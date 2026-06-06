#!/usr/bin/env node
/** Apply Model A/B/T purge to src/ and lib/ TypeScript files. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

const REPLACEMENTS = [
  ["ModelAPage", "GlydePage"],
  ["ModelBPage", "HelyxPage"],
  ["ModelTPage", "GlydeXPage"],
  ["modelBvsModelA", "helyxVsGlyde"],
  ["modelTvsModelA", "glydeXVsGlyde"],
  ["modelASpecific", "productSpecific"],
  ["modelAMetric", "glydeMetric"],
  ["modelBMetric", "helyxMetric"],
  ["modelTMetric", "glydeXMetric"],
  ["modelAMethod", "glydeMethod"],
  ["modelBMethod", "helyxMethod"],
  ["modelTMethod", "glydeXMethod"],
  ["modelAPrefix", "nectyrPrefix"],
  ["modelASuffix", "nectyrSuffix"],
  ["modelAHeader", "glydeHeader"],
  ["modelBHeader", "helyxHeader"],
  ["modelTHeader", "glydeXHeader"],
  ["linkModelA", "linkGlyde"],
  ["linkModelB", "linkHelyx"],
  ["linkModelT", "linkGlydeX"],
  ["modelTImageAlt", "glydeXImageAlt"],
  ["modelTImageTitle", "glydeXImageTitle"],
  ["paragraph2BeforeModelA", "paragraph2BeforeGlyde"],
  ["modelALink", "glydeLink"],
  ["modelTLink", "glydeXLink"],
  ["modelCardsTitle", "productCardsTitle"],
  ["showRobotModelCards", "showRobotProductCards"],
  ["ModelCards", "ProductCards"],
  ["modelBCards", "helyxCards"],
  ["modelTCards", "glydeXCards"],
  ["modelCards", "glydeCards"],
  ["modelAOg", "glydeOg"],
  ["modelBOg", "helyxOg"],
  ["modelTOg", "glydeXOg"],
  ['socialImagesFromPreset("modelA")', 'socialImagesFromPreset("glyde")'],
  ['socialImagesFromPreset("modelB")', 'socialImagesFromPreset("helyx")'],
  ['socialImagesFromPreset("modelT")', 'socialImagesFromPreset("glydeX")'],
  ['sku="MODEL-B"', 'sku="HELYX"'],
  ['sku="MODEL-T"', 'sku="GLYDE-X"'],
  ['id="model-a-', 'id="glyde-'],
  ['id="model-b-', 'id="helyx-'],
  ['id="model-t-', 'id="glyde-x-'],
  ['aria-labelledby="model-a-', 'aria-labelledby="glyde-'],
  ["export default async function ModelTPage", "export default async function GlydeXPage"],
  ["GLYDE: \"modelA\"", "GLYDE: \"glyde\""],
  ["HELYX: \"modelB\"", "HELYX: \"helyx\""],
  ['"GLYDE-X": "modelT"', '"GLYDE-X": "glydeX"'],
  ['i18nNamespace: "ModelBPage"', 'i18nNamespace: "HelyxPage"'],
  ['i18nNamespace: "ModelAPage"', 'i18nNamespace: "GlydePage"'],
  ['i18nNamespace: "ModelTPage"', 'i18nNamespace: "GlydeXPage"'],
  ["Model-B solar cleaning robot projects", "HELYX solar cleaning robot projects"],
  ["/360-degree-images/Model-A/", "/360-degree-images/glyde/"],
  ["/360-degree-images/Model-B/", "/360-degree-images/helyx/"],
  ["/360-degree-images/Model-T/", "/360-degree-images/glyde-x/"],
  ["MODEL-A-", "glyde-"],
  ["modelBvsModelARows", "helyxVsGlydeRows"],
  ["modelTvsModelARows", "glydeXVsGlydeRows"],
  ["MODEL_B_VS_A_ROW_KEYS", "HELYX_VS_GLYDE_ROW_KEYS"],
  ["MODEL_T_VS_A_ROW_KEYS", "GLYDE_X_VS_GLYDE_ROW_KEYS"],
  ["modelBUsps", "helyxUsps"],
  ["modelBFeatures", "helyxFeatures"],
  ["modelBSpecs", "helyxSpecs"],
  ["modelBSteps", "helyxSteps"],
  ["modelBFaqs", "helyxFaqs"],
  ["modelTUsps", "glydeXUsps"],
  ["modelTFeatures", "glydeXFeatures"],
  ["modelTSpecs", "glydeXSpecs"],
  ["modelTSteps", "glydeXSteps"],
  ["modelTFaqs", "glydeXFaqs"],
  ["modelAFeatures", "productFeatures"],
  ["modelAAdvantages", "productAdvantages"],
  ['t("hero.modelA")', 't("hero.glyde")'],
  ['t("hero.modelB")', 't("hero.helyx")'],
  ['t("hero.modelT")', 't("hero.glydeX")'],
  ['t("intro.modelA")', 't("intro.glyde")'],
  ['t("intro.modelB")', 't("intro.helyx")'],
  ['t("intro.modelT")', 't("intro.glydeX")'],
  ['t("platform.modelA")', 't("platform.glyde")'],
  ['t("platform.modelB")', 't("platform.helyx")'],
  ['t("platform.modelT")', 't("platform.glydeX")'],
  ['t("manualVsAutomatic.tableHeaders.modelA")', 't("manualVsAutomatic.tableHeaders.robot")'],
  ['row.modelA', 'row.robot'],
  ['row.modelB', 'row.helyx'],
  ['row.modelT', 'row.glydeX'],
  ['t("manualVsRobotic.modelB")', 't("manualVsRobotic.robot")'],
  ['t("manualVsRobotic.modelT")', 't("manualVsRobotic.robot")'],
  ['modelB: t(`manualVsRobotic', 'robot: t(`manualVsRobotic'],
  ['modelT: t(`manualVsRobotic', 'robot: t(`manualVsRobotic'],
  ['modelB: t(`helyxVsGlyde', 'helyx: t(`helyxVsGlyde'],
  ['modelA: t(`helyxVsGlyde', 'glyde: t(`helyxVsGlyde'],
  ['modelT: t(`glydeXVsGlyde', 'glydeX: t(`glydeXVsGlyde'],
  ['modelA: t(`glydeXVsGlyde', 'glyde: t(`glydeXVsGlyde'],
  ['{row.modelB}', '{row.helyx}'],
  ['{row.modelT}', '{row.glydeX}'],
  ['{row.modelA}', '{row.glyde}'],
  ["HOW DOES MODEL-B WORK", "HOW HELYX WORKS"],
  ["HOW DOES MODEL-T WORK", "HOW GLYDE-X WORKS"],
  ["MODEL-A vs MODEL-B COMPARISON", "HELYX vs GLYDE COMPARISON"],
  ["MODEL-T vs MODEL-A COMPARISON", "GLYDE-X vs GLYDE COMPARISON"],
  ["Model-A automatic solar panel cleaning robot", "GLYDE automatic solar panel cleaning robot"],
  ['tags: ["automatic", "nyuma", "model-a"]', 'tags: ["automatic", "nyuma", "glyde"]'],
  ["modela", "glyde"],
  ["modelb", "helyx"],
  ["modelt", "glyde-x"],
  ["model-a", "glyde"],
  ["model-b", "helyx"],
  ["model-t", "glyde-x"],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "gemini") continue;
      walk(path, files);
    } else if (/\.(tsx?|mjs)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

const dirs = [join(root, "src"), join(root, "scripts")];
const skip = new Set([
  "purge-model-abc-everywhere.mjs",
  "purge-model-abc-src.mjs",
  "purge-legacy-model-names.mjs",
  "rebrand-legacy-models-locales.mjs",
]);

for (const dir of dirs) {
  for (const path of walk(dir)) {
    if (skip.has(path.split("/").pop() ?? "")) continue;
    let s = readFileSync(path, "utf8");
    const before = s;
    for (const [from, to] of REPLACEMENTS) {
      s = s.split(from).join(to);
    }
    if (s !== before) {
      writeFileSync(path, s);
      console.log("updated", path.replace(root + "/", ""));
    }
  }
}

console.log("purge-model-abc-src done");
