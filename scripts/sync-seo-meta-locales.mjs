#!/usr/bin/env node
/**
 * Sync optimized SEO meta (title, description, OG) to hi/ar/bn/ja page JSON files.
 * English (en) is the source of truth — run after editing messages/pages/en/*.json meta.
 */
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const ROOT = join(process.cwd(), "messages/pages");
const LOCALES = ["hi", "ar", "bn", "ja"];

const PATCHES = {
  "home.json": {
    path: ["Home", "meta"],
    locales: {
      hi: {
        title: "सोलर पैनल सफाई रोबोट | वॉटरलेस और स्वायत्त",
        description:
          "भारत के अग्रणी वॉटरलेस सोलर पैनल सफाई रोबोट, यूटिलिटी-स्केल प्लांटों के लिए। GLYDE और NYUMA से खोई generation वापस पाएं। आज कोटेशन लें।",
        ogTitle: "सोलर पैनल सफाई रोबोट | वॉटरलेस और स्वायत्त",
        ogDescription:
          "भारतीय यूटिलिटी प्लांटों के लिए वॉटरलेस सोलर सफाई रोबोट। डुअल-पास शुष्क सफाई, NECTYR फ्लीट, पैन-India सेवा।",
        twitterTitle: "सोलर पैनल सफाई रोबोट | वॉटरलेस और स्वायत्त",
        twitterDescription:
          "भारत में यूटिलिटी-स्केल सोलर फार्मों के लिए स्वायत्त वॉटरलेस सोलर पैनल सफाई रोबोट।",
      },
      ar: {
        title: "روبوتات تنظيف الألواح الشمسية | بدون ماء ومستقلة",
        description:
          "روبوتات تنظيف ألواح شمسية بدون ماء للمحطات على نطاق المرافق في الهند. استعد الإنتاج المفقود مع GLYDE وNYUMA. اطلب عرض سعر اليوم.",
        ogTitle: "روبوتات تنظيف الألواح الشمسية | بدون ماء ومستقلة",
        ogDescription:
          "روبوتات تنظيف شمسية بدون ماء للمحطات الهندية. تنظيف جاف ثنائي المرور، أسطول NECTYR، خدمة على مستوى الهند.",
        twitterTitle: "روبوتات تنظيف الألواح الشمسية | بدون ماء ومستقلة",
        twitterDescription:
          "روبوتات تنظيف ألواح شمسية مستقلة بدون ماء لمزارع الطاقة الشمسية على نطاق المرافق في الهند.",
      },
      bn: {
        title: "সোলার প্যানেল পরিষ্কার রোবট | জলবিহীন ও স্বায়ত্তশাসিত",
        description:
          "ভারতের শীর্ষ জলবিহীন সোলার প্যানেল পরিষ্কার রোবট, ইউটিলিটি-স্কেল প্ল্যান্টের জন্য। GLYDE ও NYUMA দিয়ে হারানো উৎপাদন ফিরে পান। আজই কোটেশন নিন।",
        ogTitle: "সোলার প্যানেল পরিষ্কার রোবট | জলবিহীন ও স্বায়ত্তশাসিত",
        ogDescription:
          "ভারতীয় ইউটিলিটি প্ল্যান্টের জন্য জলবিহীন সোলার পরিষ্কার রোবট। ডুয়াল-পাস শুষ্ক পরিষ্কার, NECTYR ফ্লিট, সারা ভারতে সেবা।",
        twitterTitle: "সোলার প্যানেল পরিষ্কার রোবট | জলবিহীন ও স্বায়ত্তশাসিত",
        twitterDescription:
          "ভারতে ইউটিলিটি-স্কেল সোলার ফার্মের জন্য স্বায়ত্তশাসিত জলবিহীন সোলার প্যানেল পরিষ্কার রোবট।",
      },
      ja: {
        title: "ソーラーパネル洗浄ロボット | 水なし・自律型",
        description:
          "インドの大規模発電所向け水なしソーラーパネル洗浄ロボット。GLYDEとNYUMAで失われた発電量を回復。今すぐ見積もりを依頼。",
        ogTitle: "ソーラーパネル洗浄ロボット | 水なし・自律型",
        ogDescription:
          "インドの大規模向け水なしソーラー洗浄。デュアルパス乾式洗浄、NECTYRフリート、全国サービス。",
        twitterTitle: "ソーラーパネル洗浄ロボット | 水なし・自律型",
        twitterDescription:
          "インドの大規模ソーラーファーム向け自律型水なしソーラーパネル洗浄ロボット。",
      },
    },
  },
  "company.json": {
    path: ["CompanyPage", "meta"],
    locales: {
      hi: {
        title: "हमारे बारे में | सोलर पैनल सफाई रोबोट निर्माता",
        description:
          "Pune में Made-in-India सोलर पैनल सफाई रोबोट निर्माता। GLYDE, NYUMA, NECTYR फ्लीट सॉफ़्टवेयर, पैन-India सेवा। हमारी leadership से मिलें।",
        openGraphDescription:
          "Taypro Chakan, Pune से स्वायत्त सोलर सफाई रोबोट — डुअल-पास वॉटरलेस तकनीक और राष्ट्रव्यापी तैनाती सहायता।",
      },
      ar: {
        title: "من نحن | مصنع روبوتات تنظيف الألواح الشمسية",
        description:
          "مصنع هندي لروبوتات تنظيف الألواح الشمسية في Pune. GLYDE وNYUMA وبرنامج أسطول NECTYR، خدمة على مستوى الهند. تعرف على فريق القيادة.",
        openGraphDescription:
          "Taypro تطور روبوتات تنظيف شمسية مستقلة من Chakan, Pune — تقنية جافة ثنائية المرور ودعم نشر على مستوى الهند.",
      },
      bn: {
        title: "আমাদের সম্পর্কে | সোলার প্যানেল পরিষ্কার রোবট প্রস্তুতকারক",
        description:
          "Pune-এ Made-in-India সোলার প্যানেল পরিষ্কার রোবট প্রস্তুতকারক। GLYDE, NYUMA, NECTYR ফ্লিট সফটওয়্যার, সারা ভারতে সেবা। আমাদের নেতৃত্ব দলের সাথে পরিচিত হন।",
        openGraphDescription:
          "Taypro Chakan, Pune থেকে স্বায়ত্তশাসিত সোলার পরিষ্কার রোবট — ডুয়াল-পাস জলবিহীন প্রযুক্তি ও জাতীয় স্থাপনা সহায়তা।",
      },
      ja: {
        title: "会社概要 | ソーラーパネル洗浄ロボットメーカー",
        description:
          "PuneのMade-in-Indiaソーラーパネル洗浄ロボットメーカー。GLYDE、NYUMA、NECTYRフリート、全国サービス。経営チームをご紹介。",
        openGraphDescription:
          "TayproはChakan, Puneから自律型ソーラー洗浄ロボットを開発 — デュアルパス水なし技術と全国展開サポート。",
      },
    },
  },
  "solar-system.json": {
    path: ["SolarSystemPage", "meta"],
    locales: {
      hi: {
        title: "भारत में सोलर पैनल सफाई रोबोट और सिस्टम",
        description:
          "GLYDE, NYUMA, HELYX और ट्रैकर रोबोट की तुलना करें। वॉटरलेस सफाई, TÜV NORD प्रमाणित, पैन-India सहायता। आज अपना मॉडल चुनें।",
        openGraphTitle: "भारत में सोलर पैनल सफाई रोबोट और सिस्टम",
        twitterTitle: "भारत में सोलर पैनल सफाई रोबोट और सिस्टम",
      },
      ar: {
        title: "روبوتات وأنظمة تنظيف الألواح الشمسية في الهند",
        description:
          "قارن GLYDE وNYUMA وHELYX وروبوتات التتبع. تنظيف بدون ماء، معتمد TÜV NORD، دعم على مستوى الهند. اختر طرازك اليوم.",
        openGraphTitle: "روبوتات وأنظمة تنظيف الألواح الشمسية في الهند",
        twitterTitle: "روبوتات وأنظمة تنظيف الألواح الشمسية في الهند",
      },
      bn: {
        title: "ভারতে সোলার প্যানেল পরিষ্কার রোবট ও সিস্টেম",
        description:
          "GLYDE, NYUMA, HELYX ও ট্র্যাকার রোবট তুলনা করুন। জলবিহীন পরিষ্কার, TÜV NORD সার্টিফাইড, সারা ভারতে সহায়তা। আজই মডেল বেছে নিন।",
        openGraphTitle: "ভারতে সোলার প্যানেল পরিষ্কার রোবট ও সিস্টেম",
        twitterTitle: "ভারতে সোলার প্যানেল পরিষ্কার রোবট ও সিস্টেম",
      },
      ja: {
        title: "インドのソーラーパネル洗浄ロボットとシステム",
        description:
          "GLYDE、NYUMA、HELYX、トラッカーロボットを比較。水なし洗浄、TÜV NORD認証、全国サポート。今すぐモデルを選ぶ。",
        openGraphTitle: "インドのソーラーパネル洗浄ロボットとシステム",
        twitterTitle: "インドのソーラーパネル洗浄ロボットとシステム",
      },
    },
  },
  "robot-price-india.json": {
    path: ["RobotPriceIndiaPage", "meta"],
    locales: {
      hi: {
        title: "सोलर पैनल सफाई रोबोट कीमत India | ROI गाइड",
        description:
          "भारत में सोलर पैनल सफाई रोबोट कीमत: CAPEX बैंड, लागत कारक और ROI। खरीद vs Opex की तुलना। साइट-विशिष्ट कोटेशन लें।",
        openGraphTitle: "भारत में सोलर पैनल सफाई रोबोट कीमत | लागत गाइड",
        twitterTitle: "भारत में सोलर पैनल सफाई रोबोट कीमत",
      },
      ar: {
        title: "سعر روبوت تنظيف الألواح الشمسية India | دليل ROI",
        description:
          "سعر روبوت تنظيف الألواح الشمسية في الهند: نطاقات CAPEX وعوامل التكلفة وROI. قارن الشراء مقابل Opex. احصل على عرض سعر لموقعك.",
        openGraphTitle: "سعر روبوت تنظيف الألواح الشمسية في الهند | دليل التكلفة",
        twitterTitle: "سعر روبوت تنظيف الألواح الشمسية في الهند",
      },
      bn: {
        title: "সোলার প্যানেল পরিষ্কার রোবট মূল্য India | ROI গাইড",
        description:
          "ভারতে সোলার প্যানেল পরিষ্কার রোবটের মূল্য: CAPEX ব্যান্ড, খরচের কারণ ও ROI। ক্রয় বনাম Opex তুলনা। সাইট-নির্দিষ্ট কোটেশন নিন।",
        openGraphTitle: "ভারতে সোলার প্যানেল পরিষ্কার রোবটের মূল্য | খরচ গাইড",
        twitterTitle: "ভারতে সোলার প্যানেল পরিষ্কার রোবটের মূল্য",
      },
      ja: {
        title: "ソーラーパネル洗浄ロボット価格 India | ROIガイド",
        description:
          "インドのソーラーパネル洗浄ロボット価格：CAPEX帯、コスト要因、ROI。購入 vs Opexを比較。サイト別見積もりを取得。",
        openGraphTitle: "インドのソーラーパネル洗浄ロボット価格 | コストガイド",
        twitterTitle: "インドのソーラーパネル洗浄ロボット価格",
      },
    },
  },
};

function setNested(obj, keys, value) {
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    cur = cur[keys[i]];
  }
  Object.assign(cur[keys[keys.length - 1]], value);
}

let updated = 0;
for (const [file, { path, locales }] of Object.entries(PATCHES)) {
  for (const loc of LOCALES) {
    const filePath = join(ROOT, loc, file);
    const raw = JSON.parse(await readFile(filePath, "utf8"));
    setNested(raw, path, locales[loc]);
    await writeFile(filePath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
    updated++;
    console.log(`Updated ${loc}/${file}`);
  }
}
console.log(`\nDone: ${updated} files updated.`);
