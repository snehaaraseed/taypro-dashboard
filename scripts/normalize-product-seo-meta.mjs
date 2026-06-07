#!/usr/bin/env node
/**
 * Normalize product page SEO meta: shorter titles/descriptions, remove keywords arrays.
 * Patches EN then syncs hi/ar/bn/ja.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(process.cwd(), "messages/pages");
const LOCALES = ["hi", "ar", "bn", "ja"];

/** file -> [namespace path..., meta patch for EN] */
const PRODUCT_FILES = {
  "glyde.json": {
    ns: ["GlydePage", "meta"],
    en: {
      title: "Automatic Solar Panel Cleaning Robot | GLYDE",
      description:
        "Waterless dual-pass GLYDE robot for utility plants. 99%+ dust removal, TÜV NORD certified, pan-India support. Request a quote.",
      openGraphTitle: "Automatic Solar Panel Cleaning Robot | GLYDE",
      twitterTitle: "Automatic Solar Panel Cleaning Robot | GLYDE",
    },
    locales: {
      hi: {
        title: "स्वचालित सोलर पैनल सफाई रोबोट | GLYDE",
        description:
          "यूटिलिटी प्लांटों के लिए वॉटरलेस डुअल-पास GLYDE रोबोट। 99%+ धूल हटाना, TÜV NORD प्रमाणित, पैन-India सहायता। कोटेशन लें।",
        openGraphTitle: "स्वचालित सोलर पैनल सफाई रोबोट | GLYDE",
        twitterTitle: "स्वचालित सोलर पैनल सफाई रोबोट | GLYDE",
      },
      ar: {
        title: "روبوت تنظيف ألواح شمسية أوتوماتيكي | GLYDE",
        description:
          "روبوت GLYDE بدون ماء ثنائي المرور للمحطات. إزالة 99%+ للغبار، معتمد TÜV NORD، دعم على مستوى الهند. اطلب عرض سعر.",
        openGraphTitle: "روبوت تنظيف ألواح شمسية أوتوماتيكي | GLYDE",
        twitterTitle: "روبوت تنظيف ألواح شمسية أوتوماتيكي | GLYDE",
      },
      bn: {
        title: "স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | GLYDE",
        description:
          "ইউটিলিটি প্ল্যান্টের জন্য জলবিহীন ডুয়াল-পাস GLYDE রোবট। ৯৯%+ ধুলো অপসারণ, TÜV NORD সার্টিফাইড। কোটেশন নিন।",
        openGraphTitle: "স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | GLYDE",
        twitterTitle: "স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | GLYDE",
      },
      ja: {
        title: "自動ソーラーパネル洗浄ロボット | GLYDE",
        description:
          "大規模向け水なしデュアルパスGLYDE。99%+除塵、TÜV NORD認証、全国サポート。見積もりを依頼。",
        openGraphTitle: "自動ソーラーパネル洗浄ロボット | GLYDE",
        twitterTitle: "自動ソーラーパネル洗浄ロボット | GLYDE",
      },
    },
  },
  "nyuma.json": {
    ns: ["NyumaPage", "meta"],
    en: {
      title: "Automatic Solar Panel Cleaning Robot | NYUMA",
      description:
        "Waterless PBT single-pass NYUMA for fixed-tilt utility plants. 99%+ dust removal, NECTYR fleet, TÜV NORD certified. Get a quote.",
      openGraphTitle: "Automatic Solar Panel Cleaning Robot | NYUMA",
      twitterTitle: "Automatic Solar Panel Cleaning Robot | NYUMA",
    },
    locales: {
      hi: {
        title: "स्वचालित सोलर पैनल सफाई रोबोट | NYUMA",
        description:
          "फिक्स्ड-टिल्ट यूटिलिटी प्लांटों के लिए वॉटरलेस PBT NYUMA। 99%+ धूल हटाना, NECTYR फ्लीट, TÜV NORD। कोटेशन लें।",
        openGraphTitle: "स्वचालित सोलर पैनल सफाई रोबोट | NYUMA",
        twitterTitle: "स्वचालित सोलर पैनल सफाई रोबोट | NYUMA",
      },
      ar: {
        title: "روبوت تنظيف ألواح شمسية أوتوماتيكي | NYUMA",
        description:
          "NYUMA PBT أحادي المرور بدون ماء للمحطات. إزالة 99%+ للغبار، أسطول NECTYR، TÜV NORD. اطلب عرض سعر.",
        openGraphTitle: "روبوت تنظيف ألواح شمسية أوتوماتيكي | NYUMA",
        twitterTitle: "روبوت تنظيف ألواح شمسية أوتوماتيكي | NYUMA",
      },
      bn: {
        title: "স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | NYUMA",
        description:
          "ফিক্সড-টিল্ট প্ল্যান্টের জন্য জলবিহীন PBT NYUMA। ৯৯%+ ধুলো, NECTYR ফ্লিট। কোটেশন নিন।",
        openGraphTitle: "স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | NYUMA",
        twitterTitle: "স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | NYUMA",
      },
      ja: {
        title: "自動ソーラーパネル洗浄ロボット | NYUMA",
        description:
          "固定傾斜向け水なしPBT NYUMA。99%+除塵、NECTYRフリート、TÜV NORD。見積もり依頼。",
        openGraphTitle: "自動ソーラーパネル洗浄ロボット | NYUMA",
        twitterTitle: "自動ソーラーパネル洗浄ロボット | NYUMA",
      },
    },
  },
  "glyde-x.json": {
    ns: ["GlydeXPage", "meta"],
    en: {
      title: "Tracker Solar Panel Cleaning Robot | GLYDE-X",
      description:
        "Dual-pass GLYDE-X for single-axis trackers. 99%+ dust removal, NEXTracker compatible, TÜV NORD certified. Request a quote.",
      openGraphTitle: "Tracker Solar Panel Cleaning Robot | GLYDE-X",
      twitterTitle: "Tracker Solar Panel Cleaning Robot | GLYDE-X",
    },
    locales: {
      hi: {
        title: "ट्रैकर सोलर पैनल सफाई रोबोट | GLYDE-X",
        description:
          "सिंगल-एक्सिस ट्रैकर्स के लिए डुअल-पास GLYDE-X। 99%+ धूल, NEXTracker संगत, TÜV NORD। कोटेशन लें।",
        openGraphTitle: "ट्रैकर सोलर पैनल सफाई रोबोट | GLYDE-X",
        twitterTitle: "ट्रैकर सोलर पैनल सफाई रोबोट | GLYDE-X",
      },
      ar: {
        title: "روبوت تنظيف متتبع | GLYDE-X",
        description:
          "GLYDE-X ثنائي المرور للمتتبعات أحادية المحور. إزالة 99%+ للغبار، متوافق NEXTracker. اطلب عرض سعر.",
        openGraphTitle: "روبوت تنظيف متتبع | GLYDE-X",
        twitterTitle: "روبوت تنظيف متتبع | GLYDE-X",
      },
      bn: {
        title: "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট | GLYDE-X",
        description:
          "সিঙ্গল-অ্যাক্সিস ট্র্যাকারের জন্য GLYDE-X। ৯৯%+ ধুলো, NEXTracker সামঞ্জস্য। কোটেশন নিন।",
        openGraphTitle: "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট | GLYDE-X",
        twitterTitle: "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট | GLYDE-X",
      },
      ja: {
        title: "トラッカー用ソーラー洗浄ロボット | GLYDE-X",
        description:
          "単軸トラッカー向けGLYDE-X。99%+除塵、NEXTracker対応、TÜV NORD。見積もり依頼。",
        openGraphTitle: "トラッカー用ソーラー洗浄ロボット | GLYDE-X",
        twitterTitle: "トラッカー用ソーラー洗浄ロボット | GLYDE-X",
      },
    },
  },
  "nyuma-x.json": {
    ns: ["NyumaXPage", "meta"],
    en: {
      title: "Tracker Solar Panel Cleaning Robot | NYUMA-X",
      description:
        "PBT single-pass NYUMA-X for tracker plants. 99%+ dust removal, NECTYR fleet, TÜV NORD certified. Get a quote today.",
      openGraphTitle: "Tracker Solar Panel Cleaning Robot | NYUMA-X",
      twitterTitle: "Tracker Solar Panel Cleaning Robot | NYUMA-X",
    },
    locales: {
      hi: {
        title: "ट्रैकर सोलर पैनल सफाई रोबोट | NYUMA-X",
        description:
          "ट्रैकर प्लांटों के लिए PBT NYUMA-X। 99%+ धूल, NECTYR, TÜV NORD। आज कोटेशन लें।",
        openGraphTitle: "ट्रैकर सोलर पैनल सफाई रोबोट | NYUMA-X",
        twitterTitle: "ट्रैकर सोलर पैनल सफाई रोबोट | NYUMA-X",
      },
      ar: {
        title: "روبوت تنظيف متتبع | NYUMA-X",
        description:
          "NYUMA-X PBT للمتتبعات. إزالة 99%+ للغبار، NECTYR، TÜV NORD. اطلب عرض سعر اليوم.",
        openGraphTitle: "روبوت تنظيف متتبع | NYUMA-X",
        twitterTitle: "روبوت تنظيف متتبع | NYUMA-X",
      },
      bn: {
        title: "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট | NYUMA-X",
        description:
          "ট্র্যাকার প্ল্যান্টের জন্য PBT NYUMA-X। ৯৯%+ ধুলো, NECTYR। আজই কোটেশন নিন।",
        openGraphTitle: "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট | NYUMA-X",
        twitterTitle: "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট | NYUMA-X",
      },
      ja: {
        title: "トラッカー用ソーラー洗浄ロボット | NYUMA-X",
        description:
          "トラッカー向けPBT NYUMA-X。99%+除塵、NECTYR、TÜV NORD。今すぐ見積もり。",
        openGraphTitle: "トラッカー用ソーラー洗浄ロボット | NYUMA-X",
        twitterTitle: "トラッカー用ソーラー洗浄ロボット | NYUMA-X",
      },
    },
  },
  "helyx.json": {
    ns: ["HelyxPage", "meta"],
    en: {
      title: "Semi-Automatic Solar Panel Cleaning Robot | HELYX",
      description:
        "39 kg pick-and-place HELYX for fixed-tilt plants. Waterless PBT, 99%+ dust per pass, TÜV NORD certified. Request a quote.",
    },
    locales: {
      hi: {
        title: "अर्ध-स्वचालित सोलर पैनल सफाई रोबोट | HELYX",
        description:
          "फिक्स्ड-टिल्ट के लिए 39 kg HELYX। वॉटरलेस PBT, 99%+ धूल, TÜV NORD। कोटेशन लें।",
      },
      ar: {
        title: "روبوت تنظيف شبه أوتوماتيكي | HELYX",
        description:
          "HELYX 39 كغ للمحطات الثابتة. PBT بدون ماء، إزالة 99%+ للغبار، TÜV NORD. اطلب عرض سعر.",
      },
      bn: {
        title: "আধা-স্বয়ংক্রিয় সোলার প্যানেল পরিষ্কার রোবট | HELYX",
        description:
          "ফিক্সড-টিল্টের জন্য 39 kg HELYX। জলবিহীন PBT, ৯৯%+ ধুলো, TÜV NORD। কোটেশন নিন।",
      },
      ja: {
        title: "半自動ソーラーパネル洗浄ロボット | HELYX",
        description:
          "固定傾斜向け39kg HELYX。水なしPBT、99%+除塵、TÜV NORD。見積もり依頼。",
      },
    },
  },
  "miny.json": {
    ns: ["MinyPage", "meta"],
    en: {
      title: "Rooftop Solar Panel Cleaning Robot India | MINY",
      description:
        "Compact waterless rooftop cleaning robot for C&I plants in India. MINY coming soon — register interest for launch updates.",
      openGraphTitle: "Rooftop Solar Panel Cleaning Robot | MINY",
      twitterTitle: "Rooftop Solar Panel Cleaning Robot | MINY",
    },
    locales: {
      hi: {
        title: "रूफटॉप सोलर पैनल सफाई रोबोट India | MINY",
        description:
          "भारत में C&I रूफटॉप के लिए कॉम्पैक्ट वॉटरलेस रोबोट। MINY जल्द — रुचि दर्ज करें।",
        openGraphTitle: "रूफटॉप सोलर पैनल सफाई रोबोट | MINY",
        twitterTitle: "रूफटॉप सोलर पैनल सफाई रोबोट | MINY",
      },
      ar: {
        title: "روبوت تنظيف أسطح شمسية India | MINY",
        description:
          "روبوت مدمج بدون ماء للأسطح التجارية في الهند. MINY قريبًا — سجّل اهتمامك.",
        openGraphTitle: "روبوت تنظيف أسطح | MINY",
        twitterTitle: "روبوت تنظيف أسطح | MINY",
      },
      bn: {
        title: "রুফটপ সোলার প্যানেল পরিষ্কার রোবট India | MINY",
        description:
          "ভারতে C&I রুফটপের জন্য কমপ্যাক্ট জলবিহীন রোবট। MINY শীঘ্রই — আগ্রহ নিবন্ধন করুন।",
        openGraphTitle: "রুফটপ সোলার পরিষ্কার রোবট | MINY",
        twitterTitle: "রুফটপ সোলার পরিষ্কার রোবট | MINY",
      },
      ja: {
        title: "屋根用ソーラー洗浄ロボット India | MINY",
        description:
          "インドのC&I屋根向けコンパクト水なしロボット。MINY近日公開 — 登録はこちら。",
        openGraphTitle: "屋根用ソーラー洗浄ロボット | MINY",
        twitterTitle: "屋根用ソーラー洗浄ロボット | MINY",
      },
    },
  },
  "cradyl.json": {
    ns: ["CradylPage", "meta"],
    en: {
      title: "Solar Robot Row-Transfer Docking | CRADYL",
      description:
        "CRADYL movable docking for multi-row robot transfer on scattered utility plants. IP65, solar-charged, NECTYR connected. Get a quote.",
      openGraphTitle: "Solar Robot Docking Station | CRADYL",
      twitterTitle: "Solar Robot Docking Station | CRADYL",
    },
    locales: {
      hi: {
        title: "सोलर रोबोट डॉकिंग स्टेशन | CRADYL",
        description:
          "बिखरे यूटिलिटी प्लांटों के लिए CRADYL मूवेबल डॉकिंग। IP65, सोलर-चार्ज, NECTYR। कोटेशन लें।",
        openGraphTitle: "सोलर रोबोट डॉकिंग | CRADYL",
        twitterTitle: "सोलर रोबोट डॉकिंग | CRADYL",
      },
      ar: {
        title: "محطة إرساء روبوتات شمسية | CRADYL",
        description:
          "CRADYL للمحطات الم scattered. IP65، شحن شمسي، NECTYR. اطلب عرض سعر.",
        openGraphTitle: "إرساء روبوت CRADYL",
        twitterTitle: "إرساء روبوت CRADYL",
      },
      bn: {
        title: "সোলার রোবট ডকিং স্টেশন | CRADYL",
        description:
          "ছড়িয়ে পড়া প্ল্যান্টের জন্য CRADYL। IP65, সোলার-চার্জ, NECTYR। কোটেশন নিন।",
        openGraphTitle: "সোলার রোবট ডকিং | CRADYL",
        twitterTitle: "সোলার রোবট ডকিং | CRADYL",
      },
      ja: {
        title: "ソーラーロボットドッキング | CRADYL",
        description:
          "分散型向けCRADYL可動ドック。IP65、ソーラー充電、NECTYR。見積もり依頼。",
        openGraphTitle: "ソーラーロボットドッキング | CRADYL",
        twitterTitle: "ソーラーロボットドッキング | CRADYL",
      },
    },
  },
  "orion.json": {
    ns: ["OrionPage", "meta"],
    en: {
      title: "Solar Plant Intelligence Platform | ORION",
      description:
        "ORION SaaS for solar plant health monitoring, trained on generation data plus Taypro robot field signals. Register for early access.",
      openGraphTitle: "Solar Plant Intelligence | ORION",
      twitterTitle: "Solar Plant Intelligence | ORION",
    },
    locales: {
      hi: {
        title: "सोलर प्लांट इंटेलिजेंस प्लेटफ़ॉर्म | ORION",
        description:
          "ORION: जनरेशन डेटा + Taypro रोबोट सिग्नल पर plant health monitoring। Early access के लिए रजिस्टर करें।",
        openGraphTitle: "सोलर प्लांट इंटेलिजेंस | ORION",
        twitterTitle: "सोलर प्लांट इंटेलिजेंस | ORION",
      },
      ar: {
        title: "منصة ذكاء محطات شمسية | ORION",
        description:
          "ORION لمراقبة صحة المحطة مع بيانات الروبوتات. سجّل للوصول المبكر.",
        openGraphTitle: "ذكاء محطات شمسية | ORION",
        twitterTitle: "ذكاء محطات شمسية | ORION",
      },
      bn: {
        title: "সোলার প্ল্যান্ট ইন্টেলিজেন্স | ORION",
        description:
          "ORION: জেনারেশন ডেটা + রোবট সিগন্যাল। আগাম অ্যাক্সেসের জন্য নিবন্ধন করুন।",
        openGraphTitle: "সোলার প্ল্যান্ট ইন্টেলিজেন্স | ORION",
        twitterTitle: "সোলার প্ল্যান্ট ইন্টেলিজেন্স | ORION",
      },
      ja: {
        title: "ソーラープラントインテリジェンス | ORION",
        description:
          "ORION：発電データとロボット信号による健全性監視。早期アクセス登録。",
        openGraphTitle: "プラントインテリジェンス | ORION",
        twitterTitle: "プラントインテリジェンス | ORION",
      },
    },
  },
  "nectyr.json": {
    ns: ["NectyrPage", "meta"],
    en: {
      title: "Solar Robot Fleet Monitoring Software | NECTYR",
      description:
        "NECTYR portal for Taypro robot fleets: schedules, logs, reports, and health dashboards. Request access after onboarding.",
      openGraphTitle: "Solar Robot Fleet Monitoring | NECTYR",
      twitterTitle: "Solar Robot Fleet Monitoring | NECTYR",
    },
    locales: {
      hi: {
        title: "सोलर रोबोट फ्लीट मॉनिटरिंग | NECTYR",
        description:
          "Taypro रोबोट फ्लीट के लिए NECTYR: शेड्यूल, लॉग, रिपोर्ट, डैशबोर्ड। एक्सेस का अनुरोध करें।",
        openGraphTitle: "रोबोट फ्लीट मॉनिटरिंग | NECTYR",
        twitterTitle: "रोबोट फ्लीट मॉनिटरिंग | NECTYR",
      },
      ar: {
        title: "برنامج مراقبة أسطول الروبوتات | NECTYR",
        description:
          "NECTYR: جداول، سجلات، تقارير ولوحات لأسطول Taypro. اطلب الوصول.",
        openGraphTitle: "مراقبة أسطول الروبوتات | NECTYR",
        twitterTitle: "مراقبة أسطول الروبوتات | NECTYR",
      },
      bn: {
        title: "সোলার রোবট ফ্লিট মনিটরিং | NECTYR",
        description:
          "Taypro ফ্লিটের জন্য NECTYR: শিডিউল, লগ, রিপোর্ট। অ্যাক্সেস অনুরোধ করুন।",
        openGraphTitle: "রোবট ফ্লিট মনিটরিং | NECTYR",
        twitterTitle: "রোবট ফ্লিট মনিটরিং | NECTYR",
      },
      ja: {
        title: "ソーラーロボットフリート監視 | NECTYR",
        description:
          "Tayproフリート向けNECTYR：スケジュール、ログ、レポート。アクセスをリクエスト。",
        openGraphTitle: "フリート監視 | NECTYR",
        twitterTitle: "フリート監視 | NECTYR",
      },
    },
  },
  "cleaning-service.json": {
    ns: ["CleaningServicePage", "meta"],
    en: {
      title: "Solar Panel Cleaning Service | Robotic OPEX",
      description:
        "Monthly robotic cleaning for 10 MW+ utility plants in India. Pay per panel cleaned, waterless cycles, NECTYR reports. Request a quote.",
    },
    locales: {
      hi: {
        title: "सोलर पैनल सफाई सेवा | Robotic OPEX",
        description:
          "10 MW+ यूटिलिटी प्लांटों के लिए मासिक रोबोटिक सफाई। प्रति पैनल भुगतान, NECTYR रिपोर्ट। कोटेशन लें।",
      },
      ar: {
        title: "خدمة تنظيف الألواح الشمسية | OPEX",
        description:
          "تنظيف روبوتي شهري للمحطات 10+ MW. الدفع لكل لوحة، تقارير NECTYR. اطلب عرض سعر.",
      },
      bn: {
        title: "সোলার প্যানেল পরিষ্কার সেবা | Robotic OPEX",
        description:
          "১০ MW+ প্ল্যান্টের মাসিক রোবটিক পরিষ্কার। প্যানেল প্রতি পেমেন্ট, NECTYR রিপোর্ট। কোটেশন নিন।",
      },
      ja: {
        title: "ソーラーパネル清掃サービス | Robotic OPEX",
        description:
          "10MW+向け月次ロボット清掃。パネル単位課金、NECTYRレポート。見積もり依頼。",
      },
    },
  },
};

function getMeta(obj, ns) {
  let cur = obj;
  for (const k of ns) cur = cur[k];
  return cur;
}

function patchFile(filePath, ns, patch) {
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  const meta = getMeta(raw, ns);
  Object.assign(meta, patch);
  delete meta.keywords;
  writeFileSync(filePath, `${JSON.stringify(raw, null, 2)}\n`);
}

// site-map EN patch
const siteMapPath = join(ROOT, "en", "site-map.json");
const siteMap = JSON.parse(readFileSync(siteMapPath, "utf8"));
Object.assign(siteMap.SiteMapPage.meta, {
  title: "Sitemap",
  description:
    "Browse all Taypro pages: solar cleaning robots, projects, compare guides, regional guides, and company info.",
  openGraphTitle: "Sitemap",
  twitterTitle: "Sitemap",
});
writeFileSync(siteMapPath, `${JSON.stringify(siteMap, null, 2)}\n`);
console.log("Updated en/site-map.json");

for (const [file, { ns, en, locales }] of Object.entries(PRODUCT_FILES)) {
  patchFile(join(ROOT, "en", file), ns, en);
  console.log(`Updated en/${file}`);
  for (const loc of LOCALES) {
    if (locales[loc]) {
      patchFile(join(ROOT, loc, file), ns, locales[loc]);
      console.log(`Updated ${loc}/${file}`);
    }
  }
}

console.log("\nDone normalizing product SEO meta.");
