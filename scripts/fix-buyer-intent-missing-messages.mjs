#!/usr/bin/env node
/**
 * Adds missing buyer-intent translation keys surfaced during ISR static generation.
 * - ManufacturerIndiaPage.projects.*
 * - PlantDataIntelligencePage.pillars.pillarN.tag|link
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["en", "ar", "hi", "ja", "bn"];

const MANUFACTURER_PROJECTS = {
  en: {
    eyebrow: "MW-scale references",
    heading: "Taypro-manufactured robot deployments in India",
    subheading:
      "Named utility projects with GLYDE and tracker fleets from the Indian OEM.",
  },
  ar: {
    eyebrow: "مراجع على نطاق MW",
    heading: "عمليات نشر روبوتات مصنّعة من Taypro في الهند",
    subheading:
      "مشاريع مرافق مسماة بأساطيل GLYDE والمتتبعات من الشركة المصنعة الهندية.",
  },
  hi: {
    eyebrow: "MW-स्तरीय संदर्भ",
    heading: "भारत में Taypro-निर्मित रोबोट तैनाती",
    subheading:
      "भारतीय OEM से GLYDE और ट्रैकर बेड़े वाली नामित उपयोगिता परियोजनाएँ।",
  },
  ja: {
    eyebrow: "MW規模の実績",
    heading: "インドにおけるタイプロ製ロボットの導入",
    subheading:
      "インドOEMによるGLYDEおよびトラッカー艦隊を備えた公益事業プロジェクト。",
  },
  bn: {
    eyebrow: "MW-স্কেল রেফারেন্স",
    heading: "ভারতে Taypro-নির্মিত রোবট স্থাপনা",
    subheading:
      "ভারতীয় OEM থেকে GLYDE এবং ট্র্যাকার ফ্লিট সহ নামযুক্ত ইউটিলিটি প্রকল্প।",
  },
};

const PLANT_PILLAR_EXTRAS = {
  en: {
    pillar0: { tag: "Execution proof", link: "ORION platform page" },
    pillar1: { tag: "Live today", link: "NECTYR product page" },
    pillar2: { tag: "Predictive O&M", link: "AI intelligence hub" },
  },
  ar: {
    pillar0: { tag: "إثبات التنفيذ", link: "صفحة منصة ORION" },
    pillar1: { tag: "متاح اليوم", link: "صفحة منتج NECTYR" },
    pillar2: { tag: "التشغيل والصيانة التنبؤية", link: "مركز الذكاء الاصطناعي" },
  },
  hi: {
    pillar0: { tag: "निष्पादन प्रमाण", link: "ORION प्लेटफ़ॉर्म पेज" },
    pillar1: { tag: "आज लाइव", link: "NECTYR उत्पाद पृष्ठ" },
    pillar2: { tag: "पूर्वानुमानित O&M", link: "AI इंटेलिजेंस हब" },
  },
  ja: {
    pillar0: { tag: "実行証跡", link: "ORIONプラットフォーム" },
    pillar1: { tag: "本日稼働中", link: "NECTYR製品ページ" },
    pillar2: { tag: "予測型O&M", link: "AIインテリジェンス" },
  },
  bn: {
    pillar0: { tag: "এক্সিকিউশন প্রমাণ", link: "ORION প্ল্যাটফর্ম পেজ" },
    pillar1: { tag: "আজ লাইভ", link: "NECTYR পণ্য পৃষ্ঠা" },
    pillar2: { tag: "ভবিষ্যদ্বাণীমূলক O&M", link: "AI ইন্টেলিজেন্স হাব" },
  },
};

function patchManufacturer(locale) {
  const file = path.join(
    ROOT,
    "messages/pages",
    locale,
    "solar-cleaning-robot-manufacturer-india.json"
  );
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const page = data.ManufacturerIndiaPage;
  if (!page.projects) {
    page.projects = MANUFACTURER_PROJECTS[locale];
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`  + ManufacturerIndiaPage.projects (${locale})`);
  }
}

function patchPlantData(locale) {
  const file = path.join(
    ROOT,
    "messages/pages",
    locale,
    "solar-plant-data-intelligence.json"
  );
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pillars = data.PlantDataIntelligencePage.pillars;
  const extras = PLANT_PILLAR_EXTRAS[locale];
  let changed = false;
  for (const key of ["pillar0", "pillar1", "pillar2"]) {
    if (!pillars[key].tag) {
      pillars[key].tag = extras[key].tag;
      changed = true;
    }
    if (!pillars[key].link) {
      pillars[key].link = extras[key].link;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`  + PlantDataIntelligencePage.pillars tag/link (${locale})`);
  }
}

console.log("Patching buyer-intent missing messages...");
for (const locale of LOCALES) {
  patchManufacturer(locale);
  patchPlantData(locale);
}
console.log("Done.");
