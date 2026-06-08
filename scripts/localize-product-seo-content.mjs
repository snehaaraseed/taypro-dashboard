#!/usr/bin/env node
/**
 * Localizes glydeVsNyuma / glydeXVsNyumaX blocks and differentiated product copy
 * for hi, ar, bn, ja. Run: node scripts/localize-product-seo-content.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["hi", "ar", "bn", "ja"];

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

function assignDefined(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      assignDefined(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

const glydeVsNyuma = {
  hi: {
    eyebrow: "सही Taypro रोबोट चुनें",
    title: "GLYDE vs NYUMA: आपके प्लांट के लिए कौन-सा स्वचालित रोबोट?",
    subtitle:
      "दोनों रोबोट पूर्ण स्वायत्त, वॉटरलेस हैं और NECTYR से प्रबंधित होते हैं। GLYDE Taypro का पेटेंटेड डुअल-पास माइक्रोफाइबर फ्लैगशिप है; NYUMA capex-कुशल फिक्स्ड-टिल्ट फ्लीट के लिए PBT सिंगल-पास प्लेटफ़ॉर्म है।",
    criterion: "मानदंड",
    glydeHeader: "GLYDE (डुअल-पास माइक्रोफाइबर)",
    nyumaHeader: "NYUMA (सिंगल-पास PBT)",
    row0: {
      criterion: "सफाई तकनीक",
      glyde: "पेटेंटेड डुअल-पास: एयरफ़्लो धूल ढीली करता है, माइक्रोफाइबर वाइप पूरा करता है",
      nyuma: "सिंगल-पास काउंटर-रोटेटिंग PBT ब्रश ड्रम — कम चलने वाले consumables",
    },
    row1: {
      criterion: "सबसे उपयुक्त",
      glyde: "फ्लैगशिप फिक्स्ड-टिल्ट पंक्तियाँ जहाँ प्रति चक्र अधिकतम धूल उठान प्राथमिकता है",
      nyuma: "दोहराए जाने वाले फिक्स्ड-टिल्ट ब्लॉक जहाँ PBT capex और ब्रश अर्थशास्त्र RFQ जीतते हैं",
    },
    row2: {
      criterion: "चिपचिपी / सीमेंटitious सोइलिंग",
      glyde: "डुअल-पास मिश्रित शुष्क और चिपचिपी धूल पर层 में उत्कृष्ट",
      nyuma: "शुष्क रेगिस्तानी धूल के लिए आदर्श; भारी सीमेंटitious सोइलिंग पर अतिरिक्त चक्र शेड्यूल करें",
    },
    row3: {
      criterion: "Consumable प्रोफ़ाइल",
      glyde: "सेल्फ-क्लीनिंग माइक्रोफाइबर ड्रम, विस्तारित सेवा अंतराल",
      nyuma: "UV-स्थिर PBT ब्रश, फ़ील्ड-रिप्लेसेबल ब्रिसल कार्ट्रिज",
    },
    row4: {
      criterion: "प्रति चार्ज रेंज",
      glyde: "2.2 km तक (~3,600 मॉड्यूल)",
      nyuma: "2.2 km तक (~3,600 मॉड्यूल)",
    },
    row5: {
      criterion: "typical deployments",
      glyde: "Bachau DVC-स्केल automatic-first फिक्स्ड-टिल्ट फ्लीट",
      nyuma: "Akhadana-स्केल और mixed-fleet PBT automatic कार्यक्रम",
    },
    row6: {
      criterion: "इंस्टॉल के बाद श्रम",
      glyde: "शून्य — पूर्ण स्वायत्त दैनिक चक्र",
      nyuma: "शून्य — पूर्ण स्वायत्त दैनिक चक्र",
    },
    row7: {
      criterion: "फ्लीट मॉनिटरिंग",
      glyde: "NECTYR — LTE, Wi-Fi, RF mesh, LoRa, या LoRaWAN",
      nyuma: "NECTYR — LTE, Wi-Fi, RF mesh, LoRa, या LoRaWAN",
    },
    crossSellLead: "बिखरे ब्लॉकों के लिए pick-and-place विकल्प? देखें ",
    linkHelyx: "HELYX",
    crossSellMid: "। सिंगल-अक्ष ट्रैकर? तुलना करें ",
    linkTracker: "GLYDE-X और NYUMA-X",
    crossSellSuffix: "।",
  },
  ar: {
    eyebrow: "اختيار روبوت Taypro المناسب",
    title: "GLYDE مقابل NYUMA: أي روبوت آلي يناسب محطتك؟",
    subtitle:
      "كلا الروبوتين مستقل بالكامل، بدون ماء، ويُداران من NECTYR. GLYDE هو flagship Taypro ببراءة dual-pass microfiber؛ NYUMA منصة PBT single-pass لأساطيل fixed-tilt فعّالة من حيث CAPEX.",
    criterion: "المعيار",
    glydeHeader: "GLYDE (Dual-Pass Microfiber)",
    nyumaHeader: "NYUMA (Single-Pass PBT)",
    row0: {
      criterion: "تقنية التنظيف",
      glyde: "Dual-pass patented: تيار هواء يفك الغبار، microfiber يكمل المسح",
      nyuma: "أسطوانة فرش PBT دوّارة single-pass — consumables أقل",
    },
    row1: {
      criterion: "الأفضل لـ",
      glyde: "صفوف fixed-tilt flagship حيث أقصى رفع للغبار لكل دورة أولوية",
      nyuma: "كتل fixed-tilt متكررة حيث اقتصاديات PBT وCAPEX تفوز في RFQ",
    },
    row2: {
      criterion: "التلوث اللزج / الإسمنتي",
      glyde: "Dual-pass ممتاز على طبقات غبار جافة ولزجة",
      nyuma: "مثالي للغبار الصحراوي الجاف؛ جدولة دورات إضافية عند تلوث إسمنتي شديد",
    },
    row3: {
      criterion: "ملف الاستهلاكيات",
      glyde: "أسطوانة microfiber self-cleaning بفترات خدمة ممتدة",
      nyuma: "فرش PBT مقاومة UV مع cartridges قابلة للاستبدال ميدانياً",
    },
    row4: {
      criterion: "المدى لكل شحنة",
      glyde: "حتى 2.2 km (~3,600 وحدة)",
      nyuma: "حتى 2.2 km (~3,600 وحدة)",
    },
    row5: {
      criterion: "نشرات نموذجية",
      glyde: "أساطيل fixed-tilt automatic-first بحجم Bachau DVC",
      nyuma: "برامج PBT automatic بحجم Akhadana وأساطيل مختلطة",
    },
    row6: {
      criterion: "العمالة بعد التركيب",
      glyde: "صفر — دورات يومية مستقلة بالكامل",
      nyuma: "صفر — دورات يومية مستقلة بالكامل",
    },
    row7: {
      criterion: "مراقبة الأسطول",
      glyde: "NECTYR عبر LTE أو Wi-Fi أو RF mesh أو LoRa أو LoRaWAN",
      nyuma: "NECTYR عبر LTE أو Wi-Fi أو RF mesh أو LoRa أو LoRaWAN",
    },
    crossSellLead: "تحتاج pick-and-place للكتل المتفرقة؟ راجع ",
    linkHelyx: "HELYX",
    crossSellMid: ". trackers أحادية المحور؟ قارن ",
    linkTracker: "GLYDE-X و NYUMA-X",
    crossSellSuffix: ".",
  },
  bn: {
    eyebrow: "সঠিক Taypro রোবট বেছে নিন",
    title: "GLYDE vs NYUMA: আপনার প্ল্যান্টের জন্য কোন স্বয়ংক্রিয় রোবট?",
    subtitle:
      "দুটি রোবটই সম্পূর্ণ স্বায়ত্তশাসিত, জলহীন এবং NECTYR থেকে পরিচালিত। GLYDE হল Taypro-র পেটেন্টেড dual-pass microfiber flagship; NYUMA capex-কার্যকর fixed-tilt ফ্লিটের জন্য PBT single-pass প্ল্যাটফর্ম।",
    criterion: "মানদণ্ড",
    glydeHeader: "GLYDE (Dual-Pass Microfiber)",
    nyumaHeader: "NYUMA (Single-Pass PBT)",
    row0: {
      criterion: "পরিষ্কার প্রযুক্তি",
      glyde: "পেটেন্টেড dual-pass: airflow ধুলো ঢিলা করে, microfiber wipe সম্পন্ন করে",
      nyuma: "Single-pass counter-rotating PBT brush drum — কম consumables",
    },
    row1: {
      criterion: "সবচেয়ে উপযুক্ত",
      glyde: "Flagship fixed-tilt সারি যেখানে প্রতি cycle সর্বোচ্চ dust lift অগ্রাধিকার",
      nyuma: "পুনরাবৃত্ত fixed-tilt ব্লক যেখানে PBT capex ও brush economics RFQ জয় করে",
    },
    row2: {
      criterion: "আঠালো / সিমেন্টitious soiling",
      glyde: "Dual-pass মিশ্র শুষ্ক ও আঠালো ধুলোতে উৎকৃষ্ট",
      nyuma: "শুষ্ক মরুভূমির ধুলোর জন্য আদর্শ; ভারী সিমেন্টitious soiling হলে extra cycle",
    },
    row3: {
      criterion: "Consumable প্রোফাইল",
      glyde: "Self-cleaning microfiber drum, extended service intervals",
      nyuma: "UV-stable PBT brush, field-replaceable bristle cartridges",
    },
    row4: {
      criterion: "প্রতি charge রেঞ্জ",
      glyde: "২.২ km পর্যন্ত (~৩,৬০০ মডিউল)",
      nyuma: "২.২ km পর্যন্ত (~৩,৬০০ মডিউল)",
    },
    row5: {
      criterion: "সাধারণ deployment",
      glyde: "Bachau DVC-স্কেল automatic-first fixed-tilt ফ্লিট",
      nyuma: "Akhadana-স্কেল ও mixed-fleet PBT automatic প্রোগ্রাম",
    },
    row6: {
      criterion: "ইনস্টলের পর শ্রম",
      glyde: "শূন্য — সম্পূর্ণ স্বায়ত্তশাসিত দৈনিক cycle",
      nyuma: "শূন্য — সম্পূর্ণ স্বায়ত্তশাসিত দৈনিক cycle",
    },
    row7: {
      criterion: "ফ্লিট মনিটরিং",
      glyde: "NECTYR — LTE, Wi-Fi, RF mesh, LoRa, বা LoRaWAN",
      nyuma: "NECTYR — LTE, Wi-Fi, RF mesh, LoRa, বা LoRaWAN",
    },
    crossSellLead: "ছড়িয়ে থাকা ব্লকের জন্য pick-and-place? দেখুন ",
    linkHelyx: "HELYX",
    crossSellMid: "। single-axis tracker? তুলনা করুন ",
    linkTracker: "GLYDE-X ও NYUMA-X",
    crossSellSuffix: "।",
  },
  ja: {
    eyebrow: "最適なTayproロボットの選び方",
    title: "GLYDE vs NYUMA：固定式プラントに合う自動ロボットは？",
    subtitle:
      "両ロボットとも完全自律・無水で、NECTYRから管理します。GLYDEはTaypro特許のデュアルパスマイクロファイバーフラッグシップ、NYUMAはCAPEX効率の良い固定式フリート向けPBTシングルパスプラットフォームです。",
    criterion: "比較項目",
    glydeHeader: "GLYDE（デュアルパス・マイクロファイバー）",
    nyumaHeader: "NYUMA（シングルパスPBT）",
    row0: {
      criterion: "清掃技術",
      glyde: "特許デュアルパス：気流で塵を浮かせ、マイクロファイバーで拭き上げ",
      nyuma: "シングルパス逆回転PBTブラシドラム — 消耗品が少ない",
    },
    row1: {
      criterion: "最適な用途",
      glyde: "サイクルあたり最大の除塵が優先される固定式フラッグシップ列",
      nyuma: "PBTのCAPEXとブラシ経済性がRFQで勝つ反復固定式ブロック",
    },
    row2: {
      criterion: "付着性／セメント系汚れ",
      glyde: "乾燥と付着性の混合層でデュアルパスが優位",
      nyuma: "乾燥砂漠塵に最適；セメント系汚れが強い場合は追加サイクル",
    },
    row3: {
      criterion: "消耗品プロファイル",
      glyde: "セルフクリーニングマイクロファイバードラム、長い保守間隔",
      nyuma: "UV安定PBTブラシ、現場交換可能なブラシカートリッジ",
    },
    row4: {
      criterion: "1充電あたりの走行",
      glyde: "最大2.2 km（約3,600モジュール）",
      nyuma: "最大2.2 km（約3,600モジュール）",
    },
    row5: {
      criterion: "代表的な導入例",
      glyde: "Bachau DVC規模の自動優先固定式フリート",
      nyuma: "Akhadana規模および混合PBT自動プログラム",
    },
    row6: {
      criterion: "設置後の人員",
      glyde: "ゼロ — 完全自律の日次サイクル",
      nyuma: "ゼロ — 完全自律の日次サイクル",
    },
    row7: {
      criterion: "フリート監視",
      glyde: "NECTYR（LTE / Wi-Fi / RF mesh / LoRa / LoRaWAN）",
      nyuma: "NECTYR（LTE / Wi-Fi / RF mesh / LoRa / LoRaWAN）",
    },
    crossSellLead: "分散ブロック向けpick-and-placeは ",
    linkHelyx: "HELYX",
    crossSellMid: " を参照。単軸トラッカーは ",
    linkTracker: "GLYDE-XとNYUMA-X",
    crossSellSuffix: " を比較。",
  },
};

const glydeXVsNyumaX = {
  hi: {
    eyebrow: "ट्रैकर रोबोट तुलना",
    title: "GLYDE-X vs NYUMA-X: कौन-सा ट्रैकर रोबोट specify करें?",
    subtitle:
      "दोनों रोबोट NEXTracker, Gamechanger और समकक्ष single-axis टेबल ±15° inter-table flex के साथ पार करते हैं। GLYDE-X पेटेंटेड dual-pass microfiber; NYUMA-X capex-sensitive tracker programmes के लिए single-pass PBT।",
    criterion: "मानदंड",
    glydeXHeader: "GLYDE-X (Dual-Pass)",
    nyumaXHeader: "NYUMA-X (Single-Pass PBT)",
    row0: {
      criterion: "सफाई तंत्र",
      glydeX: "Dual-pass microfiber — mixed soiling के लिए airflow + wipe",
      nyumaX: "Single-pass PBT brush — शुष्क tracker dust belts के लिए",
    },
    row1: {
      criterion: "Tracker संगतता",
      glydeX: "NEXTracker, Gamechanger, -52° से +52° module tilt",
      nyumaX: "NEXTracker, Gamechanger, -52° से +52° module tilt",
    },
    row2: {
      criterion: "Inter-table flex",
      glydeX: "±15° body articulation, validated bridge kits",
      nyumaX: "±15° body articulation, validated bridge kits",
    },
    row3: {
      criterion: "Operating weight",
      glydeX: "26 kg compact tracker chassis",
      nyumaX: "26 kg compact tracker chassis",
    },
    row4: {
      criterion: "प्रति चार्ज रेंज",
      glydeX: "2.2 km तक (~3,600 modules)",
      nyumaX: "2.2 km तक (~3,600 modules)",
    },
    row5: {
      criterion: "मालिक कब चुनते हैं",
      glydeX: "Premium tracker rows — रात में maximum dust lift",
      nyumaX: "बड़ी tracker fleets — PBT capex और brush service economics",
    },
    row6: {
      criterion: "Autonomy & scheduling",
      glydeX: "Fully autonomous, NECTYR AI weather-aware scheduling",
      nyumaX: "Fully autonomous, NECTYR AI weather-aware scheduling",
    },
    row7: {
      criterion: "Fixed-tilt विकल्प",
      glydeX: "Fixed-tilt dual-pass के लिए GLYDE देखें",
      nyumaX: "Fixed-tilt PBT के लिए NYUMA देखें",
    },
    crossSellLead: "Fixed-tilt robots की तुलना: ",
    linkGlyde: "GLYDE vs NYUMA",
    crossSellMid: "। Semi-automatic deployment? देखें ",
    linkHelyx: "HELYX",
    crossSellSuffix: "।",
  },
  ar: {
    eyebrow: "مقارنة روبوتات التتبع",
    title: "GLYDE-X مقابل NYUMA-X: أي روبوت tracker تحدد؟",
    subtitle:
      "كلا الروبوتين يعبران NEXTracker وGamechanger وجداول single-axis المماثلة بمرونة ±15° بين الجداول. GLYDE-X يستخدم dual-pass microfiber patented؛ NYUMA-X PBT single-pass لبرامج tracker حساسة لـ CAPEX.",
    criterion: "المعيار",
    glydeXHeader: "GLYDE-X (Dual-Pass)",
    nyumaXHeader: "NYUMA-X (Single-Pass PBT)",
    row0: {
      criterion: "آلية التنظيف",
      glydeX: "Dual-pass microfiber — airflow + wipe للتلوث المختلط",
      nyumaX: "فرش PBT single-pass — محسّن لأحزمة غبار tracker الجافة",
    },
    row1: {
      criterion: "توافق Tracker",
      glydeX: "NEXTracker, Gamechanger, ميل -52° إلى +52°",
      nyumaX: "NEXTracker, Gamechanger, ميل -52° إلى +52°",
    },
    row2: {
      criterion: "مرونة بين الجداول",
      glydeX: "±15° articulation مع bridge kits معتمدة",
      nyumaX: "±15° articulation مع bridge kits معتمدة",
    },
    row3: {
      criterion: "الوزن التشغيلي",
      glydeX: "26 kg هيكل tracker مدمج",
      nyumaX: "26 kg هيكل tracker مدمج",
    },
    row4: {
      criterion: "المدى لكل شحنة",
      glydeX: "حتى 2.2 km (~3,600 وحدة)",
      nyumaX: "حتى 2.2 km (~3,600 وحدة)",
    },
    row5: {
      criterion: "متى يختارها المالكون",
      glydeX: "صفوف tracker premium تحتاج أقصى رفع غبار لكل دورة ليلية",
      nyumaX: "أساطيل tracker كبيرة تفضّل اقتصاديات PBT وCAPEX",
    },
    row6: {
      criterion: "الاستقلالية والجدولة",
      glydeX: "مستقل بالكامل، جدولة AI عبر NECTYR",
      nyumaX: "مستقل بالكامل، جدولة AI عبر NECTYR",
    },
    row7: {
      criterion: "بديل fixed-tilt",
      glydeX: "راجع GLYDE لتنظيف fixed-tilt dual-pass",
      nyumaX: "راجع NYUMA لتنظيف fixed-tilt PBT",
    },
    crossSellLead: "قارن روبوتات fixed-tilt: ",
    linkGlyde: "GLYDE vs NYUMA",
    crossSellMid: ". تفضّل نشر semi-automatic؟ راجع ",
    linkHelyx: "HELYX",
    crossSellSuffix: ".",
  },
  bn: {
    eyebrow: "ট্র্যাকার রোবট তুলনা",
    title: "GLYDE-X vs NYUMA-X: কোন ট্র্যাকার রোবট specify করবেন?",
    subtitle:
      "দুটি রোবটই NEXTracker, Gamechanger ও সমতুল্য single-axis টেবিল ±15° inter-table flex-এ অতিক্রম করে। GLYDE-X পেটেন্টেড dual-pass microfiber; NYUMA-X capex-sensitive tracker programmes-এর জন্য single-pass PBT।",
    criterion: "মানদণ্ড",
    glydeXHeader: "GLYDE-X (Dual-Pass)",
    nyumaXHeader: "NYUMA-X (Single-Pass PBT)",
    row0: {
      criterion: "পরিষ্কার প্রক্রিয়া",
      glydeX: "Dual-pass microfiber — mixed soiling-এ airflow + wipe",
      nyumaX: "Single-pass PBT brush — শুষ্ক tracker dust belts-এর জন্য",
    },
    row1: {
      criterion: "Tracker সামঞ্জস্য",
      glydeX: "NEXTracker, Gamechanger, -52° থেকে +52° module tilt",
      nyumaX: "NEXTracker, Gamechanger, -52° থেকে +52° module tilt",
    },
    row2: {
      criterion: "Inter-table flex",
      glydeX: "±15° body articulation, validated bridge kits",
      nyumaX: "±15° body articulation, validated bridge kits",
    },
    row3: {
      criterion: "Operating weight",
      glydeX: "26 kg compact tracker chassis",
      nyumaX: "26 kg compact tracker chassis",
    },
    row4: {
      criterion: "প্রতি charge রেঞ্জ",
      glydeX: "২.২ km পর্যন্ত (~৩,৬০০ মডিউল)",
      nyumaX: "২.২ km পর্যন্ত (~৩,৬০০ মডিউল)",
    },
    row5: {
      criterion: "মালিক কখন বেছে নেন",
      glydeX: "Premium tracker সারি — রাতে maximum dust lift",
      nyumaX: "বড় tracker ফ্লিট — PBT capex ও brush service economics",
    },
    row6: {
      criterion: "Autonomy & scheduling",
      glydeX: "Fully autonomous, NECTYR AI weather-aware scheduling",
      nyumaX: "Fully autonomous, NECTYR AI weather-aware scheduling",
    },
    row7: {
      criterion: "Fixed-tilt বিকল্প",
      glydeX: "Fixed-tilt dual-pass-এর জন্য GLYDE দেখুন",
      nyumaX: "Fixed-tilt PBT-এর জন্য NYUMA দেখুন",
    },
    crossSellLead: "Fixed-tilt রোবট তুলনা: ",
    linkGlyde: "GLYDE vs NYUMA",
    crossSellMid: "। Semi-automatic deployment? দেখুন ",
    linkHelyx: "HELYX",
    crossSellSuffix: "।",
  },
  ja: {
    eyebrow: "トラッカーロボット比較",
    title: "GLYDE-X vs NYUMA-X：どのトラッカーロボットを指定する？",
    subtitle:
      "両ロボットともNEXTracker、Gamechanger、同等の単軸テーブルをテーブル間±15°の可動で走行。GLYDE-Xは特許デュアルパスマイクロファイバー、NYUMA-XはCAPEX重視のトラッカープログラム向けシングルパスPBT。",
    criterion: "比較項目",
    glydeXHeader: "GLYDE-X（デュアルパス）",
    nyumaXHeader: "NYUMA-X（シングルパスPBT）",
    row0: {
      criterion: "清掃機構",
      glydeX: "デュアルパスマイクロファイバー — 混合汚れ向け気流＋拭き",
      nyumaX: "シングルパスPBTブラシ — 乾燥トラッカー塵ベルト向け",
    },
    row1: {
      criterion: "トラッカー互換",
      glydeX: "NEXTracker、Gamechanger、-52°〜+52°モジュール傾斜",
      nyumaX: "NEXTracker、Gamechanger、-52°〜+52°モジュール傾斜",
    },
    row2: {
      criterion: "テーブル間可動",
      glydeX: "±15°ボディ可動、検証済みブリッジキット",
      nyumaX: "±15°ボディ可動、検証済みブリッジキット",
    },
    row3: {
      criterion: "運用重量",
      glydeX: "26 kgコンパクトトラッカーシャシ",
      nyumaX: "26 kgコンパクトトラッカーシャシ",
    },
    row4: {
      criterion: "1充電あたりの走行",
      glydeX: "最大2.2 km（約3,600モジュール）",
      nyumaX: "最大2.2 km（約3,600モジュール）",
    },
    row5: {
      criterion: "選ばれる場面",
      glydeX: "夜間サイクルで最大除塵が必要なプレミアムトラッカー列",
      nyumaX: "PBTのCAPEXとブラシ保守経済性を優先する大規模トラッカーフリート",
    },
    row6: {
      criterion: "自律性とスケジュール",
      glydeX: "完全自律、NECTYRのAI天候連動スケジュール",
      nyumaX: "完全自律、NECTYRのAI天候連動スケジュール",
    },
    row7: {
      criterion: "固定式の代替",
      glydeX: "固定式デュアルパスはGLYDEを参照",
      nyumaX: "固定式PBTはNYUMAを参照",
    },
    crossSellLead: "固定式ロボット比較：",
    linkGlyde: "GLYDE vs NYUMA",
    crossSellMid: "。半自動展開は ",
    linkHelyx: "HELYX",
    crossSellSuffix: " を参照。",
  },
};

function buildComparePageSection(locale, pageKey, source) {
  const s = source[locale];
  const rows = {};
  for (let i = 0; i < 8; i++) {
    const row = s[`row${i}`];
    const leftKey = pageKey === "glydeVsNyuma" ? "glyde" : "glydeX";
    const rightKey = pageKey === "glydeVsNyuma" ? "nyuma" : "nyumaX";
    rows[String(i)] = {
      factor: row.criterion,
      [leftKey]: row[leftKey],
      [rightKey]: row[rightKey],
    };
  }
  return {
    meta: {
      title: s.title.replace("?", locale === "ja" ? "？" : "?"),
      description: s.subtitle.slice(0, 155) + (s.subtitle.length > 155 ? "…" : ""),
    },
    hero: {
      eyebrow: s.eyebrow,
      title: s.title,
      lead: s.subtitle,
    },
    intro:
      pageKey === "glydeVsNyuma"
        ? s.subtitle
        : s.subtitle,
    tableHeading:
      pageKey === "glydeVsNyuma"
        ? `GLYDE vs NYUMA — ${locale === "hi" ? "संक्षेप" : locale === "ar" ? "نظرة عامة" : locale === "bn" ? "এক নজরে" : "一覧"}`
        : `GLYDE-X vs NYUMA-X — ${locale === "hi" ? "संक्षेप" : locale === "ar" ? "نظرة عامة" : locale === "bn" ? "এক নজরে" : "一覧"}`,
    columns: {
      leftLabel: pageKey === "glydeVsNyuma" ? s.glydeHeader : s.glydeXHeader,
      rightLabel: pageKey === "glydeVsNyuma" ? s.nyumaHeader : s.nyumaXHeader,
    },
    rows,
    faq: {
      "0": {
        q:
          pageKey === "glydeVsNyuma"
            ? locale === "hi"
              ? "क्या GLYDE और NYUMA एक ही प्लांट में चल सकते हैं?"
              : locale === "ar"
                ? "هل يمكن تشغيل GLYDE و NYUMA في نفس المحطة؟"
                : locale === "bn"
                  ? "GLYDE ও NYUMA একই প্ল্যান্টে চলতে পারে?"
                  : "GLYDEとNYUMAを同一プラントで運用できますか？"
            : locale === "hi"
              ? "क्या GLYDE-X और NYUMA-X को arrays flat park करना होता है?"
              : locale === "ar"
                ? "هل يحتاج GLYDE-X و NYUMA-X إلى ركن المصفوفات مسطحاً؟"
                : locale === "bn"
                  ? "GLYDE-X ও NYUMA-X-এর arrays flat park করতে হয়?"
                  : "GLYDE-XとNYUMA-Xはアレイをフラットに停める必要がありますか？",
        a:
          pageKey === "glydeVsNyuma"
            ? locale === "hi"
              ? "हाँ। mixed fleets common हैं — GLYDE high-soiling blocks पर, NYUMA PBT-specified rows पर। NECTYR दोनों को एक portal से schedule करता है।"
              : locale === "ar"
                ? "نعم. الأساطيل المختلطة شائعة — GLYDE على الكتل عالية التلوث، NYUMA على الصفوف المحددة PBT. NECTYR يجدول كليهما من بوابة واحدة."
                : locale === "bn"
                  ? "হ্যাঁ। mixed fleet সাধারণ — GLYDE high-soiling ব্লকে, NYUMA PBT-specified সারিতে। NECTYR এক পোর্টাল থেকে schedule করে।"
                  : "はい。混在フリートは一般的です。高汚染ブロックにGLYDE、PBT指定列にNYUMA。NECTYRが一つのポータルから両方をスケジュールします。"
            : locale === "hi"
              ? "नहीं। दोनों -52° से +52° tilt पर clean करते हैं और production hours के बाद NECTYR tracker-aware routing से चलते हैं।"
              : locale === "ar"
                ? "لا. كلاهما ينظف من ميل -52° إلى +52° ويعمل بعد ساعات الإنتاج بتوجيه tracker-aware في NECTYR."
                : locale === "bn"
                  ? "না। দুটিই -52° থেকে +52° tilt-এ clean করে এবং production hours-এর পর NECTYR tracker-aware routing-এ চলে।"
                  : "いいえ。両方とも-52°〜+52°の傾斜で清掃し、生産時間外にNECTYRのトラッカー連動ルーティングで稼働します。",
      },
      "1": {
        q:
          pageKey === "glydeVsNyuma"
            ? locale === "hi"
              ? "Rajasthan dust के लिए कौन बेहतर?"
              : locale === "ar"
                ? "أيهما أفضل لغبار Rajasthan؟"
                : locale === "bn"
                  ? "Rajasthan ধুলোর জন্য কোনটি ভাল?"
                  : "Rajasthanの塵にはどちらが向く？"
            : locale === "hi"
              ? "कौन-सा tracker robot fixed-tilt GLYDE या NYUMA से match करता है?"
              : locale === "ar"
                ? "أي روبوت tracker يطابق GLYDE أو NYUMA fixed-tilt؟"
                : locale === "bn"
                  ? "কোন tracker রোবট fixed-tilt GLYDE বা NYUMA-র সাথে মেলে?"
                  : "固定式GLYDE/NYUMAに対応するトラッカーロボットは？",
        a:
          pageKey === "glydeVsNyuma"
            ? locale === "hi"
              ? "दोनों शुष्क desert dust handle करते हैं। adhesive/mixed layers पर GLYDE चुनें; PBT capex economics dominate करें तो NYUMA।"
              : locale === "ar"
                ? "كلاهما يتعامل مع الغبار الصحراوي الجاف. اختر GLYDE عند طبقات لزجة/مختلطة؛ NYUMA عندما تسود اقتصاديات PBT."
                : locale === "bn"
                  ? "দুটিই শুষ্ক মরুভূমির ধুলো সামলায়। আঠালো/mixed layer-এ GLYDE; PBT capex economics প্রাধান্য হলে NYUMA।"
                  : "両方とも乾燥砂漠塵に対応。付着性・混合層ならGLYDE、PBTのCAPEX経済性が優先ならNYUMA。"
            : locale === "hi"
              ? "GLYDE-X dual-pass microfiber को trackers पर extend करता है; NYUMA-X PBT single-pass platform extend करता है। fixed-tilt guide पर GLYDE vs NYUMA देखें।"
              : locale === "ar"
                ? "GLYDE-X يوسّع dual-pass microfiber للـ trackers؛ NYUMA-X يوسّع منصة PBT single-pass. راجع GLYDE vs NYUMA للـ fixed-tilt."
                : locale === "bn"
                  ? "GLYDE-X dual-pass microfiber tracker-এ extend করে; NYUMA-X PBT single-pass platform extend করে। fixed-tilt-এ GLYDE vs NYUMA দেখুন।"
                  : "GLYDE-Xはデュアルパスをトラッカーへ、NYUMA-XはPBTシングルパスを拡張。固定式はGLYDE vs NYUMAガイドを参照。",
      },
    },
  };
}

const glydePatches = {
  hi: {
    breadcrumbs: { automaticRobot: "GLYDE — Dual-Pass Automatic Robot" },
    usps: {
      eyebrow: "GLYDE — पेटेंटेड Dual-Pass Robot",
      items: {
        item0: "पेटेंटेड Dual-Pass Dust Lift",
        item1: "Self-Cleaning Microfiber Drum",
        item2: "3,600 Modules Per Charge तक",
        item3: "10–15 m/min Utility-Scale Speed",
        item4: "Frame-Mounted — Zero Glass Load",
        item5: "NECTYR Fleet Portal (LTE / Wi-Fi / RF / LoRa)",
        item6: "AI Weather-Aware Scheduling",
        item7: "TÜV NORD Field-Validated Build",
      },
    },
    overview: {
      p3: "GLYDE का पेटेंटेड dual-pass तंत्र high-speed airflow को self-cleaning microfiber drum के साथ जोड़ता है — पहला pass शुष्क धूल उठाता है, दूसरा बिना पानी/डिटर्जेंट wipe पूरा करता है। Edge और obstacle detection हर panel boundary map करता है; surface-undulation tracking row-by-row brush pressure consistent रखता है। Battery-aware logic assigned array पूरी clean होने तक ensure करता है — station पर 180 km/hr gusts तक rated।",
    },
    featuresLongForm: {
      weather: {
        body: "GLYDE का scheduler dual-pass cycle commit करने से पहले wind, rain probability, humidity और post-storm dust rebound तौलता है — बारिश के बाद wasted runs skip करता है और haboob/construction dust के बाद recovery nights prioritize करता है।",
      },
      edge: {
        body: "Millimetre-class edge sensors और continuous obstacle scanning GLYDE को हमेशा module frame पर रखते हैं — 10–15 m/min dual-pass cleaning imperfect utility tables पर critical।",
      },
      build: {
        body: "IP65-sealed electronics, C3 corrosion-class hardware और enclosed wiring harness dual-pass drivetrain को Rajasthan heat, Gujarat dust और coastal monsoon humidity में protect करते हैं।",
      },
      connectivity: {
        bodyAfterLoRa:
          " जहाँ remote blocks के लिए low-power, long-range links उपयुक्त हैं। NECTYR से dual-pass cycles schedule करें, firmware push करें, हर run audit करें — docking telemetry charge state, brush wear और fault codes real time में।",
      },
    },
    advantagesSection: {
      energy: {
        body: "Daily dual-pass cleaning dusty sites पर module transmissivity high रखती है — site teams अक्सर fortnightly manual washing vs 4–8% PR recovery model करते हैं (site-dependent)।",
      },
      waterless: {
        body: "GLYDE का airflow-plus-microfiber cycle 99%+ surface dust zero water, tankers या discharge compliance के साथ हटाता है — water-stressed districts के लिए ideal।",
      },
      autonomous: {
        body: "Commissioning के बाद GLYDE post-production hours में बिना row crews चलता है — NECTYR में AI scheduling cadence, skip logic और fleet health handle करता है।",
      },
      cost: {
        body: "Dual-pass automation recurring labour, water और night-shift safety costs replace करता है; अधिकांश utility owners 12–18 months में payback model करते हैं।",
      },
      safe: {
        body: "GLYDE केवल module frame पर non-abrasive microfiber contact के साथ travel करता है — micro-crack, reflectance और ARC preservation के लिए lab-tested।",
      },
    },
    installSection: {
      p2: "GLYDE array commissioning आमतौर पर प्रति block कुछ घंटे से दो दिन: shadow-free docking, dual-pass calibration, NECTYR onboarding — कोई module/railing modification नहीं।",
      p3: "Multi-block plants में full fleet rollout कुछ दिन ले सकता है। Handover के बाद robots autonomous — Taypro same-day breakdown SLA और NECTYR remote diagnostics।",
    },
    cycleNarrative: {
      steps: {
        s3: "⦿ Dual-pass head activate — airflow शुष्क धूल ढीली करता है, self-cleaning microfiber drum 10–15 m/min zero water पर wipe पूरा करता है",
        s7: "⦿ Fault detection brush load, battery state, drivetrain telemetry monitor — anomalies safe stop और NECTYR alerts trigger",
        s8: "⦿ Obstacle handling, microfiber self-cleaning, row-adaptive speed control assigned array में dual-pass quality consistent रखते हैं",
      },
    },
    servicePromise: {
      cards: {
        card0: {
          body: "GLYDE AMC में scheduled brush inspection, dual-pass calibration checks और soiling class के अनुसार consumable planning।",
        },
        card1: {
          body: "NECTYR पहले dock-level telemetry receive करता है — Taypro engineers अधिकांश GLYDE faults over-the-air resolve करते हैं।",
        },
        card2: {
          body: "Site visit पर Taypro pan-India same-day response target करता है — GLYDE drivetrain और brush modules के regional spares।",
        },
      },
    },
    indianConditions: {
      cards: {
        card0: {
          body: "Rajasthan, Gujarat, MP dust belts में GLYDE की nightly dual-pass cadence IPPs को PR hold करने में मदद करती है जब manual crews fortnightly wash ही कर पाते हैं।",
        },
        card2: {
          body: "Module washing के लिए water allocations Indian states में tighten हो रहे हैं — GLYDE tankers हटाता है dual-pass quality preserve करते हुए।",
        },
      },
      linkNyuma: "PBT automatic NYUMA robot",
    },
    howToSection: {
      subtitle:
        "GLYDE row पर operators के बिना end-to-end चलता है। प्रत्येक TR-150 patented dual-pass cycle execute करता है — नीचे workflow HowTo structured data और deployed plants के field SOPs से match करता है।",
      steps: {
        step0: {
          text: "प्रत्येक GLYDE TR-150 एक fixed-tilt या seasonal-tilt array को shadow-free dock के साथ permanently assign — integrated lithium-ion charging, dual-pass head और frame rails commissioning पर एक बार calibrate।",
        },
        step1: {
          text: "NECTYR GLYDE को production hours के बाहर schedule करता है। AI logic soiling forecasts, rain skip rules और fleet history तौलता है ताकि dual-pass cycles तभी चलें जब PR recover हो।",
        },
        step2: {
          text: "Scheduled time पर GLYDE undock, inter-table bridges traverse, module frame पर travel — edge sensors dual-pass run में glass पर zero load ensure।",
        },
        step4: {
          text: "Battery-aware routing safe distance limit; GLYDE dock lock — dual-pass cycles के बीच 180 km/hr gusts rated stow।",
        },
        step5: {
          textBeforeConnectivity:
            "Dual-pass telemetry — brush load, cycle time, dust-lift flags — sync NECTYR over ",
        },
      },
    },
    faq: {
      productSpecific: {
        item2: {
          question: "GLYDE, NYUMA और GLYDE-X में क्या अंतर है?",
          answer:
            "GLYDE fixed-tilt utility rows के लिए Taypro का dual-pass microfiber automatic robot है। NYUMA capex-efficient fixed-tilt fleets के लिए single-pass PBT alternative। GLYDE-X dual-pass platform single-axis trackers पर। तीनों NECTYR से connect — plant type और cleaning technology preference से चुनें।",
        },
      },
      sharedFromData: {
        item0: { question: "Installation के बाद GLYDE की monitoring कौन करता है?" },
        item3: {
          question: "Plant production के सापेक्ष GLYDE कब clean करता है?",
        },
      },
    },
    projects: {
      tagline:
        "GLYDE deployments में dual-pass commissioning, NECTYR onboarding और India में same-day breakdown support।",
    },
    trustStats: {
      subtitle:
        "GLYDE fleets Bachau DVC, Neneva tracker companion sites और 5,000+ MW Taypro-managed capacity पर — dual-pass robots Taypro का flagship fixed-tilt platform।",
    },
  },
};

// Re-use EN product names in breadcrumbs for ar/bn/ja where mixed technical copy is standard on site
const nyumaPatches = {
  hi: {
    breadcrumbs: { automaticRobot: "NYUMA — PBT Automatic Robot" },
    usps: {
      eyebrow: "NYUMA — Single-Pass PBT Robot",
      items: {
        item0: "Single-Pass PBT Brush Cleaning",
        item1: "UV-Stable Bristle Cartridges",
        item2: "3,600 Modules Per Charge तक",
        item3: "10–15 m/min Row Speed",
        item4: "Frame-Mounted — Zero Glass Load",
        item5: "NECTYR Fleet Portal (LTE / Wi-Fi / RF / LoRa)",
        item6: "Capex-Efficient Automatic Fleet",
        item7: "TÜV NORD Field-Validated Build",
      },
    },
    overview: {
      p3: "NYUMA का counter-rotating PBT brush drum single waterless pass में dry dust lift करता है — no airflow stage, कम consumables, field में straightforward brush replacement। Edge detection और surface-undulation tracking contact module frame पर, glass पर never। Battery-aware routing assigned row finish करके shadow-free dock return — seasonal-tilt tables 45° तक।",
    },
    featuresLongForm: {
      aiCleaning: {
        title: "AI-Enabled Waterless Single-Pass Cleaning",
        body: "NYUMA AI/ML-driven pressure और speed logic single-pass PBT brush drum पर apply करता है — one continuous sweep 99%+ dry dust automated run में zero water, detergent, abrasive glass contact के साथ हटाता है।",
      },
      microfiber: {
        title: "Self-Cleaning PBT Brush Drum",
        body: "UV-stable PBT bristles desert heat में stiffness maintain; self-cleaning drum embedded dust modules के बीच clear — consumable swaps field-serviceable robot row से हटाए बिना।",
      },
      weather: {
        body: "NYUMA scheduler rain-washed days skip और post-storm dust rebound detect होने पर extra runs add — PBT brush life optimize PR stable रखते हुए।",
      },
      edge: {
        body: "Edge-mapping sensors और obstacle detection NYUMA को 10–15 m/min single-pass runs पर frame पर रखते हैं — uneven undulation seasonal-tilt tables पर essential।",
      },
      build: {
        body: "Sealed IP65 electronics और C3 corrosion protection PBT drivetrain को abrasive dust ingress से shield — Indian damp-heat/dry-heat cycles validated।",
      },
      connectivity: {
        bodyAfterLoRa:
          " जहाँ remote blocks के लिए low-power links suit। Mixed NYUMA fleets NECTYR से — single-pass cycles schedule, brush-hour counters track, O&M audit logs download।",
      },
    },
    advantagesSection: {
      energy: {
        body: "Consistent single-pass PBT cleaning manual washes के बीच common 5–25% soiling drift prevent — owners high-soiling sites पर 4–8% PR uplift model।",
      },
      waterless: {
        body: "NYUMA dry PBT brush से dust remove — zero litres/module, no tanker logistics, water-scarce districts में no discharge risk।",
      },
      autonomous: {
        body: "One-time dock install के बाद NYUMA autonomously deploy — operators NECTYR में cadence remotely, night crews row पर नहीं।",
      },
      cost: {
        body: "Single-pass PBT economics dual-pass vs upfront consumable complexity reduce — predictable dry dust large fixed-tilt fleets attractive।",
      },
      safe: {
        body: "NYUMA module frame पर lab-validated PBT contact pressure — daily cycles micro-crack, reflectance, ARC integrity tested।",
      },
    },
    installSection: {
      p2: "NYUMA commissioning: dock placement, PBT brush calibration, NECTYR onboarding — typically hours to two days/array, no structural changes।",
      p3: "Multi-block full-fleet rollout up to a week। Post-handover autonomous — Taypro same-day support, remote diagnostics।",
    },
    cycleNarrative: {
      steps: {
        s3: "⦿ PBT brush drum single waterless pass — counter-rotating bristles 10–15 m/min dry dust lift, no water/detergent",
        s7: "⦿ Brush-load और battery telemetry fault detection — anomalies controlled stop और NECTYR notification",
        s8: "⦿ Self-cleaning brush action, adaptive row speed assigned array में single-pass quality uniform",
      },
    },
    servicePromise: {
      cards: {
        card0: {
          body: "NYUMA AMC brush-hour tracking, scheduled PBT cartridge inspection, site dust loading aligned spare planning।",
        },
        card1: {
          body: "Most NYUMA incidents NECTYR remote triage — firmware, schedule, telemetry over-the-air before truck roll।",
        },
        card2: {
          body: "Physical interventions same-day pan-India stocked PBT consumables, drivetrain spares।",
        },
      },
    },
    indianConditions: {
      cards: {
        card0: {
          body: "NYUMA automatic fleets high-soiling belts — Akhadana-scale deployments PBT robots cadence sustain जब wet washing pace नहीं रख सकता।",
        },
        card2: {
          body: "Single-pass dry cleaning tanker dependency eliminate — state water boards module washing restrict जहाँ critical।",
        },
      },
      linkGlyde: "dual-pass GLYDE robot",
    },
    howToSection: {
      subtitle:
        "NYUMA autonomous single-pass PBT cleaning row crews के बिना execute। Workflow HowTo structured data और NYUMA automatic fleets nightly cycle mirror।",
      steps: {
        step0: {
          text: "Each NYUMA unit one array dedicated dock, self-contained lithium-ion — PBT brush calibration, frame pairing commissioning once।",
        },
        step1: {
          text: "Operators NYUMA NECTYR through schedule। Weather-aware logic rain-washed skip, post-storm PBT runs dust rebound highest prioritize।",
        },
        step2: {
          text: "NYUMA scheduled time module frame self-deploy — edge/obstacle mapping PBT drum frame पर, glass never।",
        },
        step4: {
          text: "Real-time battery monitoring completable distance cap; NYUMA dock return 180 km/hr gusts lock next single-pass से पहले।",
        },
        step5: {
          textBeforeConnectivity:
            "Single-pass cycle logs — brush hours, distance, charge — upload NECTYR over ",
        },
      },
    },
    faq: {
      productSpecific: {
        item2: {
          question: "NYUMA, GLYDE और NYUMA-X में अंतर?",
          answer:
            "NYUMA fixed-tilt utility plants single-pass PBT automatic। GLYDE same plant type dual-pass microfiber flagship। NYUMA-X PBT platform single-axis trackers extend। सभी NECTYR — mounting structure और brush technology preference से pick।",
        },
      },
      sharedFromData: {
        item0: { question: "Installation के बाद NYUMA monitoring?" },
        item3: { question: "Production के सापेक्ष NYUMA कब clean?" },
      },
    },
    projects: {
      tagline:
        "NYUMA programmes PBT brush commissioning, NECTYR fleet onboarding, pan-India same-day support।",
    },
    trustStats: {
      subtitle:
        "NYUMA automatic fleets Akhadana-scale blocks, mixed-fleet programmes 5,000+ MW Taypro-managed Indian utility capacity।",
    },
  },
};

const glydeXPatches = {
  hi: {
    breadcrumbs: { current: "GLYDE-X — Dual-Pass Tracker Robot" },
    hero: { title: "GLYDE-X — Dual-Pass Tracker Solar Panel Cleaning Robot" },
    usps: {
      "0": {
        title: "Dual-Pass Tracker Native Design",
        description:
          "NEXTracker, Gamechanger, equivalent horizontal single-axis tables — retrofitted fixed-tilt chassis नहीं।",
      },
      "1": {
        title: "±15° Inter-Table Articulation",
        description:
          "±15° body flex inter-table angle mismatch cross; bridge kits continuous cleaning paths।",
      },
      "2": {
        title: "Full Tracker Tilt Range (-52° to +52°)",
        description:
          "-52° to +52° module tilt clean — morning-to-evening tracker travel, arrays flat park crews के लिए नहीं।",
      },
      "3": {
        title: "100% Waterless Dual-Pass Cleaning",
        description:
          "Patented dual-pass microfiber 99%+ dry/adhesive tracker dust lift — no water, detergent, run-off।",
      },
      "4": {
        title: "Tracker-Aware Autonomous Navigation",
        description:
          "Edge, obstacle, tracker-angle sensing GLYDE-X moving tables safely traverse production hours के बाद।",
      },
      "5": {
        title: "NECTYR Tracker Fleet Scheduling",
        description:
          "Fleet telemetry {connectivity} — NECTYR tracker-synchronised cycles, stow-aware cleaning windows।",
      },
      "6": {
        title: "2.2 km Tracker Run Per Charge",
        description:
          "2.2 km (~3,600 modules) per charge autonomous shadow-free tracker dock return।",
      },
      "7": {
        title: "TÜV NORD Tracker Field Validation",
        description:
          "TÜV NORD IP55 plus sandstorm/damp-heat testing Indian tracker belts।",
      },
    },
    certifications: {
      card0Title: "TÜV NORD Tracker Validation",
      card0Body:
        "IP55 protection tracker-specific damp-heat, dry-heat performance testing independently certified।",
      card1Title: "Sandstorm & Dust-Belt Testing",
      card1Body:
        "12 sandstorm events/year 10 g/m² loading simulated — Rajasthan/Gujarat tracker O&M conditions।",
      card2Title: "Panel-Safe Dual-Pass Contact",
      card2Body:
        "Micro-crack, reflectance, ARC preservation daily dual-pass tracker modules tested।",
    },
  },
};

const nyumaXPatches = {
  hi: {
    breadcrumbs: { current: "NYUMA-X — PBT Tracker Robot" },
    hero: { title: "NYUMA-X — PBT Single-Pass Tracker Cleaning Robot" },
    usps: {
      "0": {
        title: "Single-Pass PBT for Trackers",
        description:
          "Single-axis tracker farms purpose-built — NEXTracker, Gamechanger, peer OEM geometries compatible।",
      },
      "1": {
        title: "±15° Bridge & Table Flex",
        description:
          "Body ±15° inter-table misalignment traverse brush contact module frame maintain।",
      },
      "2": {
        title: "Steep Tilt Tracker Coverage",
        description:
          "-52° to +52° tracker tilt — steep morning/evening angles daytime shutdown बिना clean।",
      },
      "3": {
        title: "100% Waterless Single-Pass PBT Cleaning",
        description:
          "Counter-rotating PBT bristles 99%+ dry tracker dust one pass — no water, detergent, run-off।",
      },
      "4": {
        title: "Stow-Aware Autonomous Routing",
        description:
          "AI edge/angle detection tracker stow positions, row undulation autonomous night cycles adapt।",
      },
      "5": {
        title: "NECTYR PBT Fleet Telemetry",
        description:
          "Remote fleet {connectivity} NECTYR — tracker-aware schedules, post-storm recovery runs।",
      },
      "6": {
        title: "Long-Range Tracker Battery Cycle",
        description:
          "Single charge 2.2 km tracker run (~3,600 modules) self-docking solar-assisted recharge।",
      },
      "7": {
        title: "TÜV NORD PBT Tracker Certification",
        description:
          "TÜV NORD IP55 abrasive tracker dust, Indian monsoon humidity validated।",
      },
    },
    certifications: {
      card0Title: "TÜV NORD PBT Tracker Certification",
      card0Body:
        "IP55 enclosure tracker-field damp-heat, dry-heat, vibration profiles validated।",
      card1Title: "Desert Soiling Endurance",
      card1Body:
        "PBT brush life high-loading dust cycles Thar-edge tracker plants representative validated।",
      card2Title: "ARC-Safe PBT Contact",
      card2Body:
        "Single-pass PBT pressure micro-crack, optical reflectance, ARC preservation trackers tested।",
    },
    nyumaXVsNyuma: {
      row3: { nyumaX: "Waterless single-pass PBT brush drum" },
    },
  },
};

const compareGuides = {
  hi: {
    glydeVsNyuma: "GLYDE vs NYUMA fixed-tilt robots",
    glydeXVsNyumaX: "GLYDE-X vs NYUMA-X tracker robots",
  },
  ar: {
    glydeVsNyuma: "GLYDE vs NYUMA — روبوتات fixed-tilt",
    glydeXVsNyumaX: "GLYDE-X vs NYUMA-X — روبوتات tracker",
  },
  bn: {
    glydeVsNyuma: "GLYDE vs NYUMA fixed-tilt রোবট",
    glydeXVsNyumaX: "GLYDE-X vs NYUMA-X tracker রোবট",
  },
  ja: {
    glydeVsNyuma: "GLYDE vs NYUMA 固定式ロボット",
    glydeXVsNyumaX: "GLYDE-X vs NYUMA-X トラッカーロボット",
  },
};

const siteMapCompareIntro = {
  hi: "GLYDE vs NYUMA, GLYDE-X vs NYUMA-X, robotic vs manual, Taypro vs Solabot, Aegeus, Skilancer, Vayu Solar, और waterless vs water-based comparison pages।",
  ar: "صفحات مقارنة GLYDE vs NYUMA و GLYDE-X vs NYUMA-X والروبوت vs اليدوي وTaypro vs Solabot وAegeus وSkilancer وVayu Solar وwaterless vs water-based.",
  bn: "GLYDE vs NYUMA, GLYDE-X vs NYUMA-X, robotic vs manual, Taypro vs Solabot, Aegeus, Skilancer, Vayu Solar, এবং waterless vs water-based comparison pages।",
  ja: "GLYDE vs NYUMA、GLYDE-X vs NYUMA-X、ロボットvs手作業、Taypro vs Solabot、Aegeus、Skilancer、Vayu Solar、無水vs水洗の比較ページ。",
};

// For ar/bn/ja product patches: apply glyde/nyuma/glyde-x/nyuma-x with locale-specific overview and key sections
// ar/bn/ja use translated glydeVsNyuma blocks; differentiated body uses EN technical mix where full translation omitted for tracker/x products

function applyLocale(locale) {
  const gvn = glydeVsNyuma[locale];
  const gxv = glydeXVsNyumaX[locale];

  for (const file of ["glyde.json", "nyuma.json"]) {
    const rel = `messages/pages/${locale}/${file}`;
    const data = loadJson(rel);
    const pageKey = file === "glyde.json" ? "GlydePage" : "NyumaPage";
    data[pageKey].glydeVsNyuma = gvn;
    const patch = file === "glyde.json" ? glydePatches[locale] : nyumaPatches[locale];
    if (patch) assignDefined(data[pageKey], patch);
    saveJson(rel, data);
  }

  for (const file of ["glyde-x.json", "nyuma-x.json"]) {
    const rel = `messages/pages/${locale}/${file}`;
    const data = loadJson(rel);
    const pageKey = file === "glyde-x.json" ? "GlydeXPage" : "NyumaXPage";
    data[pageKey].glydeXVsNyumaX = gxv;
    const patch =
      file === "glyde-x.json" ? glydeXPatches[locale] : nyumaXPatches[locale];
    if (patch) assignDefined(data[pageKey], patch);
    saveJson(rel, data);
  }

  const comparisonsRel = `messages/pages/${locale}/comparisons.json`;
  const comparisons = {
    ComparisonsPage: {
      glydeVsNyuma: buildComparePageSection(locale, "glydeVsNyuma", glydeVsNyuma),
      glydeXVsNyumaX: buildComparePageSection(
        locale,
        "glydeXVsNyumaX",
        glydeXVsNyumaX
      ),
    },
  };
  saveJson(comparisonsRel, comparisons);

  const solarRel = `messages/pages/${locale}/solar-system.json`;
  if (fs.existsSync(path.join(ROOT, solarRel))) {
    const solar = loadJson(solarRel);
    assignDefined(solar.SolarSystemPage.compareGuides, compareGuides[locale]);
    saveJson(solarRel, solar);
  }

  const siteMapRel = `messages/pages/${locale}/site-map.json`;
  if (fs.existsSync(path.join(ROOT, siteMapRel))) {
    const siteMap = loadJson(siteMapRel);
    if (siteMap.SiteMapPage?.sections) {
      siteMap.SiteMapPage.sections.compareIntro = siteMapCompareIntro[locale];
    }
    saveJson(siteMapRel, siteMap);
  }
}

// Extend ar/bn/ja with glyde/nyuma patches derived from hi structure + locale glydeVsNyuma text tone
// For ar, bn, ja we apply glydeVsNyuma/glydeXVsNyumaX fully; glyde/nyuma differentiated patches for ar/bn/ja use condensed locale blocks

const glydePatchesAr = {
  overview: {
    p3: "يجمع GLYDE آلية dual-pass patented بين airflow عالي السرعة وأسطوانة microfiber self-cleaning — المرور الأول يرفع الغبار الجاف والثاني يكمل المسح بدون ماء. Edge/obstacle detection يرسم حدود كل panel؛ surface-undulation tracking يحافظ على ضغط ثابت. Battery-aware logic يضمن إكمال المصفوفة قبل self-dock — rated لعواصف 180 km/hr.",
  },
  featuresLongForm: {
    weather: {
      body: "جدول GLYDE يوزن الرياح والمطر والرطوبة وrebound الغبار قبل dual-pass — يتخطى runs بعد المطر وي prioritizes ليالي recovery بعد haboob.",
    },
    connectivity: {
      bodyAfterLoRa:
        " حيث تناسب روابط low-power remote blocks. جدولة dual-pass وfirmware وaudit من NECTYR — telemetry dock charge state وbrush wear وfault codes.",
    },
  },
  usps: {
    eyebrow: "GLYDE — Dual-Pass Robot Patented",
    items: {
      item0: "Dual-Pass Dust Lift Patented",
      item1: "Microfiber Drum Self-Cleaning",
      item6: "جدولة AI حسب الطقس",
    },
  },
};

const glydePatchesBn = {
  overview: {
    p3: "GLYDE-র পেটেন্টেড dual-pass উচ্চ-গতির airflow ও self-cleaning microfiber drum একত্র করে — প্রথম pass শুষ্ক ধুলো তোলে, দ্বিতীয় wipe জল/ডিটারজেন্ট ছাড়াই। Edge/obstacle detection প্রতিটি panel boundary map করে; battery-aware logic assigned array সম্পূর্ণ clean করে self-dock — 180 km/hr gusts rated।",
  },
  featuresLongForm: {
    connectivity: {
      bodyAfterLoRa:
        " যেখানে remote blocks-এ low-power links উপযুক্ত। NECTYR থেকে dual-pass schedule, firmware, audit — docking telemetry real time।",
    },
  },
};

const glydePatchesJa = {
  overview: {
    p3: "GLYDEの特許デュアルパスは高速気流とセルフクリーニングマイクロファイバードラムを組み合わせ、第1パスで乾燥塵を浮かせ第2パスで水なし拭き上げ。エッジ・障害物検知でパネル境界をマップし、表面うねり追従で列ごとにブラシ圧を一定に。バッテリー連動ロジックで割当アレイ完了後に自己ドック — 180 km/hr gusts対応。",
  },
  featuresLongForm: {
    connectivity: {
      bodyAfterLoRa:
        " で遠隔ブロック向け低電力長距離リンクに対応。NECTYRからデュアルパススケジュール、FW更新、監査 — ドックテレメトリで充電・ブラシ摩耗・故障コードをリアルタイム表示。",
    },
  },
};

const nyumaPatchesAr = {
  overview: {
    p3: "أسطوانة فرش PBT دوّارة في NYUMA ترفع الغبار الجاف في pass واحد بدون ماء — بدون مرحلة airflow وconsumables أقل. Edge detection يبقي الاتصال على frame وليس الزجاج. Battery-aware routing يعيد robot إلى dock shadow-free حتى 45° seasonal tilt.",
  },
  featuresLongForm: {
    aiCleaning: {
      title: "تنظيف Single-Pass PBT بدون ماء مع AI",
      body: "NYUMA يطبق منطق AI/ML للضغط والسرعة على أسطوانة PBT single-pass — sweep واحد يزيل 99%+ غبار جاف بدون ماء أو detergent.",
    },
  },
};

const nyumaPatchesBn = {
  overview: {
    p3: "NYUMA-র counter-rotating PBT brush drum এক waterless pass-এ শুষ্ক ধুলো তোলে — airflow stage নেই, কম consumables। Edge detection contact frame-এ রাখে, glass-এ নয়। Battery-aware routing shadow-free dock-এ ফেরে — seasonal-tilt 45° পর্যন্ত।",
  },
  featuresLongForm: {
    aiCleaning: {
      title: "AI-Enabled Waterless Single-Pass Cleaning",
      body: "NYUMA single-pass PBT brush drum-এ AI/ML pressure/speed logic — এক continuous sweep 99%+ dry dust, zero water।",
    },
  },
};

const nyumaPatchesJa = {
  overview: {
    p3: "NYUMAの逆回転PBTブラシドラムは1回の無水パスで乾燥塵を除去 — 気流段なし、消耗品が少ない。エッジ検知でフレーム接触を維持しガラスには載せない。バッテリー連動で割当列完了後シャドウフリードックへ — 季節傾斜45°まで。",
  },
  featuresLongForm: {
    aiCleaning: {
      title: "AI対応無水シングルパス清掃",
      body: "NYUMAはAI/MLの圧力・速度ロジックをシングルパスPBTドラムに適用 — 1回の連続スweepで99%超の乾燥塵を水なしで除去。",
    },
  },
};

glydePatches.ar = glydePatchesAr;
glydePatches.bn = glydePatchesBn;
glydePatches.ja = glydePatchesJa;
nyumaPatches.ar = nyumaPatchesAr;
nyumaPatches.bn = nyumaPatchesBn;
nyumaPatches.ja = nyumaPatchesJa;

// Tracker product USP/cert patches for ar/bn/ja — mirror EN differentiated titles with locale intro
for (const loc of ["ar", "bn", "ja"]) {
  glydeXPatches[loc] = {
    ...glydeXPatches.hi,
    hero: {
      title:
        loc === "ar"
          ? "GLYDE-X — Dual-Pass Tracker Solar Panel Cleaning Robot"
          : loc === "bn"
            ? "GLYDE-X — Dual-Pass Tracker Solar Panel Cleaning Robot"
            : "GLYDE-X — デュアルパストラッカー太陽パネル清掃ロボット",
    },
    usps: {
      "3": {
        title:
          loc === "ja"
            ? "100% 無水デュアルパス清掃"
            : "100% Waterless Dual-Pass Cleaning",
        description:
          loc === "ar"
            ? "Dual-pass microfiber patented يرفع 99%+ غبار tracker جاف/لزج — بدون ماء أو runoff."
            : loc === "bn"
              ? "পেটেন্টেড dual-pass microfiber 99%+ tracker dust lift — জল/run-off ছাড়াই।"
              : "特許デュアルパスマイクロファイバーで99%超の乾燥・付着塵を除去 — 水・排水なし。",
      },
    },
  };
  nyumaXPatches[loc] = {
    ...nyumaXPatches.hi,
    hero: {
      title:
        loc === "ja"
          ? "NYUMA-X — PBTシングルパストラッカー清掃ロボット"
          : "NYUMA-X — PBT Single-Pass Tracker Cleaning Robot",
    },
    usps: {
      "3": {
        title:
          loc === "ja"
            ? "100% 無水シングルパスPBT清掃"
            : "100% Waterless Single-Pass PBT Cleaning",
        description:
          loc === "ar"
            ? "فرش PBT دوّارة single-pass يرفع 99%+ غبار tracker جاف — بدون ماء."
            : loc === "bn"
              ? "Counter-rotating PBT 99%+ dry tracker dust one pass — জল ছাড়াই।"
              : "逆回転PBTで99%超の乾燥トラッカー塵を1パスで除去 — 水なし。",
      },
    },
  };
}

// Fix hi glyde row2 typo (removed erroneous character)
glydeVsNyuma.hi.row2.glyde =
  "डुअल-पास मिश्रित शुष्क और चिपचिपी धूल की परतों पर उत्कृष्ट";

for (const locale of LOCALES) {
  applyLocale(locale);
}

console.log(
  `Localized product SEO content for: ${LOCALES.join(", ")} (comparison blocks, differentiated copy, compare pages)`
);
