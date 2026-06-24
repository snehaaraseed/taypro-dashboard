#!/usr/bin/env node
/**
 * Localize Tier 1 buyer-intent landing pages for hi, ar, ja, bn.
 * Run: node scripts/localize-buyer-intent-pages.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["hi", "ar", "ja", "bn"];
const MODULES = [
  "solar-panel-cleaning-service-india",
  "solar-om-services",
  "solar-cleaning-opex-pricing",
  "solar-panel-cleaning-robot-for-rooftop",
  "solar-panel-cleaning-robot-for-trackers",
  "solar-fleet-monitoring-software",
  "large-scale-solar-panel-cleaning",
  "solar-cleaning-capex-vs-opex",
  "solar-panel-soiling-loss-calculator",
  "solar-cleaning-robot-manufacturer-india",
  "solar-plant-data-intelligence",
  "enterprise-solar-cleaning-partnership",
];

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function saveJson(rel, data) {
  fs.writeFileSync(
    path.join(ROOT, rel),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/** Locale-specific overlays keyed by message module stem */
const OVERLAYS = {
  hi: {
    "solar-panel-cleaning-service-india": {
      ServiceIndiaPage: {
        meta: {
          title: "सोलर पैनल सफाई सेवा भारत | Taypro O&M कंपनी",
          description:
            "भारत की अग्रणी रोबोटिक सोलर पैनल सफाई सेवा। 9 GW+ मासिक सफाई, OPEX या CAPEX रोबोट, पैन-इंडिया कवरेज।",
          openGraphTitle: "सोलर पैनल सफाई सेवा भारत | Taypro",
          openGraphDescription:
            "भारत में रोबोटिक सोलर सफाई: OPEX सेवा, GLYDE फ्लीट, NECTYR रिपोर्टिंग।",
        },
        breadcrumb: "सोलर पैनल सफाई सेवा भारत",
        hero: {
          eyebrow: "राष्ट्रीय सेवा · भारत",
          title:
            "सोलर पैनल सफाई सेवा भारत — रोबोटिक फ्लीट, पैन-इंडिया कवरेज",
          subtitle:
            "Taypro भारत की सबसे बड़ी तैनात रोबोटिक सोलर सफाई कंपनी है: 9 GW+ मासिक सफाई, वॉटरलेस ड्राई साइकिल, IPP/CPSU/C&I के लिए OPEX या CAPEX।",
          ctaPrimary: "सेवा कोटेशन अनुरोध",
          ctaSecondary: "OPEX मूल्य निर्धारण",
        },
        faq: {
          heading: "सोलर सफाई सेवा भारत — FAQ",
          subheading: "IPP, EPC और O&M टीमों के सामान्य प्रश्न।",
        },
        quoteForm: {
          title: "सोलर सफाई सेवा कोटेशन अनुरोध",
        },
      },
    },
    "solar-om-services": {
      SolarOmServicesPage: {
        meta: {
          title: "सोलर O&M सेवाएँ भारत | प्लांट संचालन और रखरखाव",
          description:
            "सोलर प्लांट O&M: रोबोटिक सफाई, NECTYR मॉनिटरिंग, ORION इंटेलिजेंस, SLA-समर्थित प्रतिक्रिया।",
          openGraphTitle: "सोलर O&M कंपनी भारत | Taypro",
          openGraphDescription:
            "50–500 MW प्लांटों के लिए वॉटरलेस रोबोटिक सफाई और फ्लीट सॉफ्टवेयर।",
        },
        breadcrumb: "सोलर O&M सेवाएँ",
        hero: {
          title:
            "यूटिलिटी प्लांटों के लिए सोलर O&M — सफाई, मॉनिटरिंग, इंटेलिजेंस",
          ctaPrimary: "O&M प्रस्ताव अनुरोध",
        },
        faq: { heading: "सोलर O&M सेवाएँ — FAQ" },
      },
    },
    "solar-cleaning-opex-pricing": {
      SolarCleaningOpexPricingPage: {
        meta: {
          title: "सोलर पैनल सफाई लागत भारत | प्रति MW OPEX मूल्य",
          description:
            "प्रति MW सोलर सफाई लागत: मैनुअल vs रोबोटिक, Taypro OPEX ₹0.45–0.70 प्रति पैनल प्रति साइकिल।",
          openGraphTitle: "सोलर सफाई OPEX मूल्य भारत | Taypro",
          openGraphDescription:
            "सोलर पैनल सफाई की लागत कितनी है? OPEX मॉडल और ROI कैलकुलेटर।",
        },
        breadcrumb: "सोलर सफाई OPEX मूल्य",
        hero: {
          title: "प्रति MW सोलर पैनल सफाई लागत — OPEX मूल्य संरचना",
          ctaPrimary: "पूर्ण ROI कैलकुलेटर चलाएँ",
        },
        opexTable: {
          heading: "प्लांट आकार के अनुसार OPEX मासिक लागत (फिक्स्ड टिल्ट, 6 साइकिल/माह)",
        },
      },
    },
    "solar-panel-cleaning-robot-for-rooftop": {
      RooftopCleaningPage: {
        meta: {
          title: "छत सोलर पैनल सफाई रोबोट भारत | वाणिज्यिक C&I",
          description:
            "वाणिज्यिक छतों के लिए Taypro MINY कॉम्पैक्ट रोबोट — वॉटरलेस, स्वायत्त।",
          openGraphTitle: "छत सोलर सफाई रोबोट | Taypro MINY",
          openGraphDescription:
            "वेयरहाउस और औद्योगिक छतों के लिए कॉम्पैक्ट रोबोटिक सफाई।",
        },
        breadcrumb: "छत सोलर सफाई रोबोट",
        hero: {
          title: "छत के लिए सोलर पैनल सफाई रोबोट — वाणिज्यिक और औद्योगिक",
          ctaPrimary: "MINY रोबोट देखें",
        },
      },
    },
    "solar-panel-cleaning-robot-for-trackers": {
      TrackerCleaningPage: {
        meta: {
          title: "सिंगल-एक्सिस ट्रैकर सोलर सफाई रोबोट | GLYDE-X और NYUMA-X",
          description:
            "ट्रैकर-संगत सोलर सफाई रोबोट: GLYDE-X, NYUMA-X, CRADYL रो ट्रांसफर।",
          openGraphTitle: "ट्रैकर सोलर सफाई रोबोट | Taypro",
          openGraphDescription:
            "सिंगल-एक्सिस ट्रैकर के लिए स्वचालित वॉटरलेस सफाई।",
        },
        breadcrumb: "ट्रैकर सोलर सफाई रोबोट",
        hero: {
          title:
            "सिंगल-एक्सिस ट्रैकर के लिए सोलर सफाई रोबोट — भारतीय यूटिलिटी स्केल",
          ctaPrimary: "GLYDE-X vs NYUMA-X तुलना",
        },
      },
    },
    "solar-fleet-monitoring-software": {
      FleetMonitoringPage: {
        meta: {
          title: "सोलर फ्लीट मॉनिटरिंग सॉफ्टवेयर भारत | NECTYR और ORION",
          description:
            "सफाई फ्लीट के लिए NECTYR ऑपरेशंस पोर्टल और ORION प्लांट इंटेलिजेंस।",
          openGraphTitle: "सोलर फ्लीट मॉनिटरिंग | Taypro",
          openGraphDescription:
            "शेड्यूलिंग, कवरेज ऑडिट, AMC टिकट और AI-संचालित एनालिटिक्स।",
        },
        breadcrumb: "सोलर फ्लीट मॉनिटरिंग सॉफ्टवेयर",
        hero: {
          title: "सोलर फ्लीट मॉनिटरिंग सॉफ्टवेयर — बेसिक SCADA से आगे",
          ctaPrimary: "NECTYR देखें",
        },
      },
    },
    "large-scale-solar-panel-cleaning": {
      LargeScaleCleaningPage: {
        meta: {
          title: "बड़े पैमाने पर सोलर पैनल सफाई भारत | 50–500 MW",
          description:
            "MW-स्केल रोबोटिक सफाई: 50–500 MW क्षमता, SECI/DVC संदर्भ।",
          openGraphTitle: "बड़े पैमाने पर सोलर सफाई | Taypro",
          openGraphDescription:
            "100MW+ रोबोटिक सफाई फ्लीट तैनाती और एंटरप्राइज संदर्भ।",
        },
        breadcrumb: "बड़े पैमाने पर सोलर सफाई",
        hero: {
          title: "बड़े पैमाने पर सोलर पैनल सफाई — MW-स्केल रोबोटिक फ्लीट",
          ctaPrimary: "एंटरप्राइज कोटेशन अनुरोध",
        },
      },
    },
  },
  ar: {
    "solar-panel-cleaning-service-india": {
      ServiceIndiaPage: {
        meta: {
          title: "خدمة تنظيف الألواح الشمسية الهند | Taypro",
          description:
            "خدمة تنظيف روبوتية للمحطات الشمسية في الهند. أكثر من 9 جيجاوات شهرياً، OPEX أو CAPEX.",
          openGraphTitle: "خدمة تنظيف الألواح الشمسية الهند | Taypro",
          openGraphDescription: "شركة تنظيف شمسي روبوتية في الهند مع تغطية وطنية.",
        },
        breadcrumb: "خدمة تنظيف الألواح الشمسية الهند",
        hero: {
          title: "خدمة تنظيف الألواح الشمسية في الهند — أسطول روبوتي وطني",
          ctaPrimary: "طلب عرض سعر",
        },
      },
    },
    "solar-om-services": {
      SolarOmServicesPage: {
        meta: {
          title: "خدمات O&M للطاقة الشمسية الهند | Taypro",
          description: "تشغيل وصيانة المحطات: تنظيف روبوتي وNECTYR وORION.",
          openGraphTitle: "شركة O&M شمسية الهند | Taypro",
          openGraphDescription: "خدمات تشغيل وصيانة للمحطات 50–500 ميجاوات.",
        },
        breadcrumb: "خدمات O&M الشمسية",
        hero: { title: "خدمات O&M للمحطات الشمسية — تنظيف ومراقبة وذكاء", ctaPrimary: "طلب مقترح O&M" },
      },
    },
    "solar-cleaning-opex-pricing": {
      SolarCleaningOpexPricingPage: {
        meta: {
          title: "تكلفة تنظيف الألواح الشمسية الهند | تسعير OPEX",
          description: "تكلفة التنظيف لكل ميجاوات: مقارنة يدوي مقابل روبوتي ونطاقات OPEX.",
          openGraphTitle: "تسعير OPEX للتنظيف الشمسي | Taypro",
          openGraphDescription: "كم يكلف تنظيف الألواح الشمسية في الهند؟",
        },
        breadcrumb: "تسعير OPEX للتنظيف الشمسي",
        hero: { title: "تكلفة تنظيف الألواح لكل ميجاوات — هيكل تسعير OPEX", ctaPrimary: "حاسبة ROI" },
      },
    },
    "solar-panel-cleaning-robot-for-rooftop": {
      RooftopCleaningPage: {
        meta: {
          title: "روبوت تنظيف الألواح على الأسطح الهند | MINY",
          description: "روبوت MINY المدمج للأسطح التجارية والصناعية.",
          openGraphTitle: "روبوت تنظيف أسطح شمسية | Taypro",
          openGraphDescription: "تنظيف روبوتي للأسطح التجارية بدون ماء.",
        },
        breadcrumb: "روبوت تنظيف أسطح شمسية",
        hero: { title: "روبوت تنظيف للألواح على الأسطح — تجاري وصناعي", ctaPrimary: "استكشف MINY" },
      },
    },
    "solar-panel-cleaning-robot-for-trackers": {
      TrackerCleaningPage: {
        meta: {
          title: "روبوت تنظيف للمتتبعات أحادية المحور | GLYDE-X وNYUMA-X",
          description: "روبوتات متوافقة مع المتتبعات ومحطة CRADYL للنقل بين الصفوف.",
          openGraphTitle: "روبوت تنظيف متتبعات | Taypro",
          openGraphDescription: "تنظيف تلقائي للمتتبعات أحادية المحور.",
        },
        breadcrumb: "روبوت تنظيف متتبعات",
        hero: { title: "روبوت تنظيف للمتتبعات أحادية المحور — نطاق هندي", ctaPrimary: "مقارنة GLYDE-X وNYUMA-X" },
      },
    },
    "solar-fleet-monitoring-software": {
      FleetMonitoringPage: {
        meta: {
          title: "برنامج مراقبة أسطول شمسي الهند | NECTYR وORION",
          description: "بوابة NECTYR وذكاء ORION للمحطات الشمسية.",
          openGraphTitle: "مراقبة أسطول شمسي | Taypro",
          openGraphDescription: "برنامج مراقبة أداء المحطات وتنظيف الأسطول.",
        },
        breadcrumb: "برنامج مراقبة الأسطول الشمسي",
        hero: { title: "برنامج مراقبة الأسطول الشمسي — أبعد من SCADA", ctaPrimary: "استكشف NECTYR" },
      },
    },
    "large-scale-solar-panel-cleaning": {
      LargeScaleCleaningPage: {
        meta: {
          title: "تنظيف ألواح شمسية واسع النطاق الهند | 50–500 ميجاوات",
          description: "نشر أسطول روبوتي على نطاق الميجاوات مع مراجع SECI/DVC.",
          openGraphTitle: "تنظيف شمسي واسع النطاق | Taypro",
          openGraphDescription: "حلول تنظيف 100 ميجاوات+ في الهند.",
        },
        breadcrumb: "تنظيف ألواح شمسية واسع النطاق",
        hero: { title: "تنظيف واسع النطاق — نشر أسطول روبوتي بالميجاوات", ctaPrimary: "طلب عرض مؤسسي" },
      },
    },
  },
  ja: {
    "solar-panel-cleaning-service-india": {
      ServiceIndiaPage: {
        meta: {
          title: "インドのソーラーパネル清掃サービス | Taypro",
          description: "インド最大級のロボット清掃サービス。月9GW超、OPEX/CAPEX、全国対応。",
          openGraphTitle: "ソーラー清掃サービス インド | Taypro",
          openGraphDescription: "ロボット清掃・OPEX・NECTYRレポート。",
        },
        breadcrumb: "ソーラー清掃サービス インド",
        hero: {
          title: "インドのソーラーパネル清掃サービス — 全国ロボットフリート",
          ctaPrimary: "見積依頼",
        },
      },
    },
    "solar-om-services": {
      SolarOmServicesPage: {
        meta: {
          title: "ソーラーO&Mサービス インド | Taypro",
          description: "清掃・NECTYR監視・ORION。50–500MW向けO&M。",
          openGraphTitle: "ソーラーO&M インド | Taypro",
          openGraphDescription: "発電所運営・保守のワンストップ。",
        },
        breadcrumb: "ソーラーO&Mサービス",
        hero: { title: "ユーティリティ向けソーラーO&M — 清掃・監視・インテリジェンス", ctaPrimary: "O&M提案を依頼" },
      },
    },
    "solar-cleaning-opex-pricing": {
      SolarCleaningOpexPricingPage: {
        meta: {
          title: "ソーラー清掃コスト インド | OPEX価格",
          description: "MW当たり清掃コスト、手作業vsロボット、OPEX単価帯。",
          openGraphTitle: "OPEX清掃価格 インド | Taypro",
          openGraphDescription: "ソーラー清掃の費用とROI計算。",
        },
        breadcrumb: "OPEX清掃価格",
        hero: { title: "MW当たり清掃コスト — OPEX価格体系", ctaPrimary: "ROI計算機" },
      },
    },
    "solar-panel-cleaning-robot-for-rooftop": {
      RooftopCleaningPage: {
        meta: {
          title: "屋根置きソーラー清掃ロボット インド | MINY",
          description: "商業・工業屋根向けコンパクトロボットMINY。",
          openGraphTitle: "屋根ソーラー清掃ロボット | Taypro",
          openGraphDescription: "屋根向け無水ロボット清掃。",
        },
        breadcrumb: "屋根ソーラー清掃ロボット",
        hero: { title: "屋根向けソーラー清掃ロボット — 商業・工業", ctaPrimary: "MINYを見る" },
      },
    },
    "solar-panel-cleaning-robot-for-trackers": {
      TrackerCleaningPage: {
        meta: {
          title: "単軸トラッカー清掃ロボット | GLYDE-X・NYUMA-X",
          description: "トラッカー対応ロボットとCRADYL列間移動。",
          openGraphTitle: "トラッカー清掃ロボット | Taypro",
          openGraphDescription: "単軸トラッカー向け自動清掃。",
        },
        breadcrumb: "トラッカー清掃ロボット",
        hero: { title: "単軸トラッカー向け清掃ロボット — インド大規模", ctaPrimary: "GLYDE-X vs NYUMA-X" },
      },
    },
    "solar-fleet-monitoring-software": {
      FleetMonitoringPage: {
        meta: {
          title: "ソーラーフリート監視ソフト インド | NECTYR・ORION",
          description: "清掃フリートのNECTYRとORIONプラットフォーム。",
          openGraphTitle: "フリート監視ソフト | Taypro",
          openGraphDescription: "SCADAを補完する清掃・監視。",
        },
        breadcrumb: "フリート監視ソフトウェア",
        hero: { title: "ソーラーフリート監視 — SCADAの先へ", ctaPrimary: "NECTYRを見る" },
      },
    },
    "large-scale-solar-panel-cleaning": {
      LargeScaleCleaningPage: {
        meta: {
          title: "大規模ソーラー清掃 インド | 50–500MW",
          description: "MW規模ロボット展開とSECI/DVC実績。",
          openGraphTitle: "大規模ソーラー清掃 | Taypro",
          openGraphDescription: "100MW級清掃ソリューション。",
        },
        breadcrumb: "大規模ソーラー清掃",
        hero: { title: "大規模ソーラー清掃 — MW級ロボット展開", ctaPrimary: "エンタープライズ見積" },
      },
    },
  },
  bn: {
    "solar-panel-cleaning-service-india": {
      ServiceIndiaPage: {
        meta: {
          title: "সোলার প্যানেল পরিষ্কার সেবা ভারত | Taypro",
          description: "ভারতের শীর্ষ রোবোটিক সোলার পরিষ্কার সেবা। ৯ GW+ মাসিক, OPEX বা CAPEX।",
          openGraphTitle: "সোলার পরিষ্কার সেবা ভারত | Taypro",
          openGraphDescription: "রোবোটিক সোলার পরিষ্কার, প্যান-ইন্ডিয়া কভারেজ।",
        },
        breadcrumb: "সোলার প্যানেল পরিষ্কার সেবা ভারত",
        hero: {
          title: "ভারতে সোলার প্যানেল পরিষ্কার সেবা — রোবোটিক ফ্লিট",
          ctaPrimary: "কোটেশন অনুরোধ",
        },
      },
    },
    "solar-om-services": {
      SolarOmServicesPage: {
        meta: {
          title: "সোলার O&M সেবা ভারত | Taypro",
          description: "রোবোটিক পরিষ্কার, NECTYR মনিটরিং, ORION।",
          openGraphTitle: "সোলার O&M কোম্পানি ভারত | Taypro",
          openGraphDescription: "৫০–৫০০ MW প্ল্যান্ট O&M।",
        },
        breadcrumb: "সোলার O&M সেবা",
        hero: { title: "ইউটিলিটি প্ল্যান্টের জন্য সোলার O&M", ctaPrimary: "O&M প্রস্তাব অনুরোধ" },
      },
    },
    "solar-cleaning-opex-pricing": {
      SolarCleaningOpexPricingPage: {
        meta: {
          title: "সোলার পরিষ্কার খরচ ভারত | OPEX মূল্য",
          description: "প্রতি MW খরচ, ম্যানুয়াল বনাম রোবোটিক, OPEX হার।",
          openGraphTitle: "OPEX মূল্য ভারত | Taypro",
          openGraphDescription: "সোলার পরিষ্কারের খরচ কত?",
        },
        breadcrumb: "OPEX মূল্য নির্ধারণ",
        hero: { title: "প্রতি MW সোলার পরিষ্কার খরচ — OPEX কাঠামো", ctaPrimary: "ROI ক্যালকুলেটর" },
      },
    },
    "solar-panel-cleaning-robot-for-rooftop": {
      RooftopCleaningPage: {
        meta: {
          title: "ছাদ সোলার পরিষ্কার রোবোট ভারত | MINY",
          description: "বাণিজ্যিক ছাদের জন্য কমপ্যাক্ট MINY রোবোট।",
          openGraphTitle: "ছাদ সোলার রোবোট | Taypro",
          openGraphDescription: "জলহীন ছাদ পরিষ্কার রোবোট।",
        },
        breadcrumb: "ছাদ সোলার পরিষ্কার রোবোট",
        hero: { title: "ছাদের জন্য সোলার পরিষ্কার রোবোট", ctaPrimary: "MINY দেখুন" },
      },
    },
    "solar-panel-cleaning-robot-for-trackers": {
      TrackerCleaningPage: {
        meta: {
          title: "ট্র্যাকার সোলার পরিষ্কার রোবোট | GLYDE-X ও NYUMA-X",
          description: "সিঙ্গল-অ্যাক্সিস ট্র্যাকার রোবোট ও CRADYL।",
          openGraphTitle: "ট্র্যাকার পরিষ্কার রোবোট | Taypro",
          openGraphDescription: "ট্র্যাকার সাইটে স্বয়ংক্রিয় পরিষ্কার।",
        },
        breadcrumb: "ট্র্যাকার সোলার রোবোট",
        hero: { title: "ট্র্যাকারের জন্য সোলার পরিষ্কার রোবোট", ctaPrimary: "GLYDE-X বনাম NYUMA-X" },
      },
    },
    "solar-fleet-monitoring-software": {
      FleetMonitoringPage: {
        meta: {
          title: "সোলার ফ্লিট মনিটরিং সফটওয়্যার ভারত | NECTYR",
          description: "NECTYR ফ্লিট পোর্টাল ও ORION ইন্টেলিজেন্স।",
          openGraphTitle: "ফ্লিট মনিটরিং | Taypro",
          openGraphDescription: "সোলার প্ল্যান্ট পারফরম্যান্স মনিটরিং।",
        },
        breadcrumb: "ফ্লিট মনিটরিং সফটওয়্যার",
        hero: { title: "সোলার ফ্লিট মনিটরিং — SCADA-র বাইরে", ctaPrimary: "NECTYR দেখুন" },
      },
    },
    "large-scale-solar-panel-cleaning": {
      LargeScaleCleaningPage: {
        meta: {
          title: "বৃহৎ আকারের সোলার পরিষ্কার ভারত | ৫০–৫০০ MW",
          description: "MW-স্কেল রোবোটিক ফ্লিট মোতায়েন।",
          openGraphTitle: "বৃহৎ সোলার পরিষ্কার | Taypro",
          openGraphDescription: "১০০MW+ পরিষ্কার সমাধান।",
        },
        breadcrumb: "বৃহৎ আকারের সোলার পরিষ্কার",
        hero: { title: "বৃহৎ আকারের সোলার পরিষ্কার — MW স্কেল", ctaPrimary: "এন্টারপ্রাইজ কোটেশন" },
      },
    },
  },
};

for (const locale of LOCALES) {
  for (const module of MODULES) {
    const enPath = `messages/pages/en/${module}.json`;
    const enData = loadJson(enPath);
    const overlay = OVERLAYS[locale]?.[module] ?? {};
    const merged = deepMerge(structuredClone(enData), overlay);
    saveJson(`messages/pages/${locale}/${module}.json`, merged);
  }
}

console.log(
  `Localized ${MODULES.length} buyer-intent modules × ${LOCALES.length} locales.`
);
