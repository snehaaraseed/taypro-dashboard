#!/usr/bin/env node
/**
 * Copy translated page sections from glyde-x → glyde (and derive nyuma / nyuma-x).
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { GLYDE_LOCALE_PACKS } from "./glyde-page-locale-packs.mjs";
import { glydeProductPack } from "./locale-packs/glyde-product.mjs";
import { resolvePack } from "./locale-packs/helpers.mjs";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];

const META_GLYDE = {
  hi: {
    title:
      "डुअल-पास स्वचालित सोलर पैनल सफाई रोबोट, Taypro GLYDE (वॉटरलेस, AI)",
    description:
      "Taypro GLYDE एक पूर्ण स्वायत्त, वॉटरलेस स्वचालित सोलर पैनल सफाई रोबोट है। AI/ML डुअल-पास ड्राई क्लीनिंग प्रति चक्र 99%+ धूल हटाती है, प्रति चार्ज 3,600 मॉड्यूल तक, NECTYR के माध्यम से LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN, TÜV NORD प्रमाणित, पूरे भारत में समान-दिवस ब्रेकडाउन सहायता।",
    openGraphTitle:
      "डुअल-पास स्वचालित सोलर पैनल सफाई रोबोट, Taypro GLYDE",
    openGraphDescription:
      "Taypro GLYDE: यूटिलिटी प्लांट के लिए पेटेंटेड डुअल-पास माइक्रोफाइबर रोबोट। स्वायत्त वॉटरलेस सफाई, प्रति चक्र 99%+ धूल हटाना, NECTYR फ्लीट पोर्टल।",
    openGraphImageAlt:
      "Taypro GLYDE स्वचालित सोलर पैनल सफाई रोबोट, वॉटरलेस, AI",
    twitterTitle: "डुअल-पास स्वचालित सोलर पैनल सफाई रोबोट, Taypro GLYDE",
    twitterDescription:
      "Taypro GLYDE: स्वायत्त वॉटरलेस डुअल-पास सफाई, प्रति चार्ज 3,600 मॉड्यूल, NECTYR कनेक्टिविटी।",
    keywords: [
      "स्वचालित सोलर पैनल सफाई रोबोट",
      "स्वचालित सोलर पैनल सफाई रोबोट भारत",
      "डुअल पास सोलर क्लीनिंग रोबोट",
      "फिक्स्ड टिल्ट सोलर क्लीनिंग रोबोट",
      "यूटिलिटी स्केल सोलर क्लीनिंग रोबोट",
      "Taypro GLYDE",
    ],
  },
  ar: {
    title:
      "روبوت تنظيف ألواح شمسية أوتوماتيكي ثنائي المرور, Taypro GLYDE (بدون ماء، AI)",
    description:
      "Taypro GLYDE روبوت تنظيف ألواح شمسية أوتوماتيكي بالكامل وبدون مياه. تنظيف جاف ثنائي المرور بتقنية AI/ML يزيل أكثر من 99% من الغبار لكل دورة، حتى 3,600 وحدة لكل شحنة، NECTYR عبر LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN، معتمد TÜV NORD.",
    openGraphTitle: "روبوت تنظيف ثنائي المرور, Taypro GLYDE",
    openGraphDescription:
      "GLYDE: روبوت ألياف ميكروية ثنائي المرور لمحطات المرافق. تنظيف ذاتي بدون ماء ومراقبة NECTYR.",
    openGraphImageAlt: "Taypro GLYDE روبوت تنظيف ألواح شمسية أوتوماتيكي",
    twitterTitle: "روبوت تنظيف ثنائي المرور, Taypro GLYDE",
    twitterDescription:
      "GLYDE: تنظيف ثنائي المرور ذاتي، حتى 3,600 وحدة لكل شحنة، NECTYR.",
    keywords: [
      "روبوت تنظيف ألواح شمسية أوتوماتيكي",
      "روبوت تنظيف ثنائي المرور",
      "روبوت تنظيف محطات شمسية",
      "Taypro GLYDE",
    ],
  },
  ja: {
    title:
      "デュアルパス自動ソーラーパネル清掃ロボット, Taypro GLYDE（無水・AI）",
    description:
      "Taypro GLYDEは完全自律・無水の自動ソーラーパネル清掃ロボットです。AI/MLデュアルパス乾式清掃でサイクルあたり99%超のホコリ除去、1充電で最大3,600モジュール、NECTYR経由のLTE/Wi-Fi/RF mesh/LoRa/LoRaWAN、TÜV NORD認証。",
    openGraphTitle: "デュアルパス自動清掃ロボット, Taypro GLYDE",
    openGraphDescription:
      "特許デュアルパスマイクロファイバー。自律無水清掃、NECTYRフリートポータル。",
    openGraphImageAlt: "Taypro GLYDE 自動ソーラーパネル清掃ロボット",
    twitterTitle: "デュアルパス自動清掃ロボット, Taypro GLYDE",
    twitterDescription:
      "GLYDE：自律無水デュアルパス、1充電3,600モジュール、NECTYR。",
    keywords: [
      "自動ソーラーパネル清掃ロボット",
      "デュアルパス ソーラー 清掃 ロボット",
      "固定傾斜 ソーラー 清掃",
      "Taypro GLYDE",
    ],
  },
  bn: {
    title:
      "ডুয়াল-পাস অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট, Taypro GLYDE (জলবিহীন, AI)",
    description:
      "Taypro GLYDE সম্পূর্ণ স্বায়ত্তশাসিত, জলবিহীন অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট। AI/ML ডুয়াল-পাস ড্রাই ক্লিনিং প্রতি চক্রে ৯৯%+ ধূলো সরায়, প্রতি চার্জে ৩,৬০০ মডিউল পর্যন্ত, NECTYR-এর মাধ্যমে LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN, TÜV NORD সনদপ্রাপ্ত।",
    openGraphTitle: "ডুয়াল-পাস অটোমেটিক রোবট, Taypro GLYDE",
    openGraphDescription:
      "পেটেন্টেড ডুয়াল-পাস মাইক্রোফাইবার। স্বায়ত্তশাসিত জলবিহীন পরিষ্কার, NECTYR।",
    openGraphImageAlt: "Taypro GLYDE অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
    twitterTitle: "ডুয়াল-পাস অটোমেটিক রোবট, Taypro GLYDE",
    twitterDescription:
      "GLYDE: স্বায়ত্তশাসিত জলবিহীন ডুয়াল-পাস, NECTYR।",
    keywords: [
      "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
      "ডুয়াল পাস সোলার ক্লিনিং রোবট",
      "ফিক্সড টিল্ট সোলার ক্লিনিং",
      "Taypro GLYDE",
    ],
  },
};

const HERO_GLYDE = {
  hi: {
    h1Line1: "स्वचालित सोलर पैनल सफाई रोबोट, ",
    h1Line2: "Taypro GLYDE",
    leadBeforeStrong: "Taypro GLYDE एक ",
    leadStrong: "स्वचालित सोलर पैनल सफाई रोबोट",
    leadAfterStrong:
      " है जो यूटिलिटी-स्केल सोलर पावर प्लांटों के लिए बनाया गया: स्वायत्त, वॉटरलेस डुअल-पास सफाई, AI/ML शेड्यूलिंग, प्रति चार्ज 3,600 मॉड्यूल तक, फ्लीट कनेक्टिविटी ",
    leadAfterConnectivity:
      " के माध्यम से, और अधिकतम अपटाइम के लिए TÜV NORD–प्रमाणित निर्माण।",
    primaryCta: {
      topic: "GLYDE quote",
      title: "GLYDE कोटेशन का अनुरोध करें",
      subtitle:
        "अपने प्लांट के बारे में बताएं, हमारी टीम GLYDE साइज़िंग और वाणिज्यिक विकल्पों के साथ जवाब देगी।",
      label: "कोटेशन का अनुरोध करें",
    },
    heroImageAlt:
      "यूटिलिटी-स्केल सोलर फार्म पर सोलर पैनल साफ करता Taypro GLYDE स्वचालित रोबोट",
    heroImageTitle: "स्वचालित सोलर पैनल सफाई रोबोट GLYDE, Taypro",
  },
  ar: {
    h1Line1: "روبوت تنظيف ألواح شمسية أوتوماتيكي, ",
    h1Line2: "GLYDE من Taypro",
    leadBeforeStrong: "GLYDE من Taypro هو ",
    leadStrong: "روبوت تنظيف ألواح شمسية أوتوماتيكي",
    leadAfterStrong:
      " لمحطات الطاقة الشمسية على نطاق المرافق: تنظيف ثنائي المرور ذاتي بدون ماء، جدولة AI/ML، حتى 3,600 وحدة لكل شحنة، اتصال الأسطول عبر ",
    leadAfterConnectivity:
      "، وبناء معتمد من TÜV NORD لأقصى وقت تشغيل.",
    primaryCta: {
      topic: "GLYDE quote",
      title: "طلب عرض سعر GLYDE",
      subtitle: "أخبرنا عن محطتك وسيتابع فريقنا بخيارات GLYDE التجارية.",
      label: "طلب عرض سعر",
    },
    heroImageAlt: "روبوت GLYDE يُنظّف ألواحاً في مزرعة شمسية على نطاق المرافق",
    heroImageTitle: "روبوت تنظيف ألواح شمسية أوتوماتيكي GLYDE, Taypro",
  },
  ja: {
    h1Line1: "自動ソーラーパネル清掃ロボット, ",
    h1Line2: "Taypro GLYDE",
    leadBeforeStrong: "Taypro GLYDEは",
    leadStrong: "自動ソーラーパネル清掃ロボット",
    leadAfterStrong:
      "で、ユーティリティ規模の太陽光発電所向け。自律無水デュアルパス清掃、AI/MLスケジューリング、1充電最大3,600モジュール、フリート接続 ",
    leadAfterConnectivity:
      "、TÜV NORD認証ビルドで高い稼働率を実現。",
    primaryCta: {
      topic: "GLYDE quote",
      title: "GLYDE見積もりを依頼",
      subtitle: "プラント情報をお送りください。GLYDEの構成と商談オプションをご案内します。",
      label: "見積もりを依頼",
    },
    heroImageAlt:
      "ユーティリティ規模ソーラーファームでパネルを清掃するTaypro GLYDE自動ロボット",
    heroImageTitle: "自動ソーラーパネル清掃ロボット GLYDE, Taypro",
  },
  bn: {
    h1Line1: "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট, ",
    h1Line2: "Taypro GLYDE",
    leadBeforeStrong: "Taypro GLYDE হল একটি ",
    leadStrong: "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
    leadAfterStrong:
      " ইউটিলিটি-স্কেল সোলার পাওয়ার প্ল্যান্টের জন্য: স্বায়ত্তশাসিত, জলবিহীন ডুয়াল-পাস পরিষ্কার, AI/ML শিডিউলিং, প্রতি চার্জে ৩,৬০০ মডিউল পর্যন্ত, ফ্লিট সংযোগ ",
    leadAfterConnectivity:
      " এর মাধ্যমে, এবং সর্বোচ্চ আপটাইমের জন্য TÜV NORD–যাচাইকৃত বিল্ড।",
    primaryCta: {
      topic: "GLYDE quote",
      title: "GLYDE কোটেশন অনুরোধ",
      subtitle:
        "আপনার প্ল্যান্ট সম্পর্কে জানান, আমাদের দল GLYDE কনফিগারেশন ও বাণিজ্যিক বিকল্প নিয়ে যোগাযোগ করবে।",
      label: "কোটেশন অনুরোধ",
    },
    heroImageAlt:
      "ইউটিলিটি-স্কেল সোলার ফার্মে প্যানেল পরিষ্কার করছে Taypro GLYDE অটোমেটিক রোবট",
    heroImageTitle: "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট GLYDE, Taypro",
  },
};

function mergeTranslatedStructure(enNode, trNode) {
  if (typeof enNode === "string") {
    return typeof trNode === "string" && trNode !== enNode ? trNode : enNode;
  }
  if (Array.isArray(enNode)) {
    return enNode.map((v, i) => mergeTranslatedStructure(v, trNode?.[i]));
  }
  if (enNode && typeof enNode === "object") {
    const out = {};
    for (const k of Object.keys(enNode)) {
      out[k] = mergeTranslatedStructure(enNode[k], trNode?.[k]);
    }
    return out;
  }
  return enNode;
}

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      deepMerge(target[k], v);
    } else target[k] = v;
  }
  return target;
}

function fixNyumaFeatureKeys(page) {
  const fl = page.featuresLongForm;
  if (fl?.["PBT brush"]) {
    fl.microfiber = fl["PBT brush"];
    delete fl["PBT brush"];
  }
  return page;
}

function replaceInStrings(node, replacers) {
  if (typeof node === "string") {
    let s = node;
    for (const [from, to] of replacers) s = s.replace(from, to);
    return s;
  }
  if (Array.isArray(node)) return node.map((v) => replaceInStrings(v, replacers));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = replaceInStrings(v, replacers);
    return out;
  }
  return node;
}

function nyumaFromGlydePage(page) {
  const replacers = [
    [/GLYDE-X/g, "NYUMA"],
    [/\bGLYDE\b/g, "NYUMA"],
    [/डुअल-पास/g, "सिंगल-पास PBT"],
    [/dual-pass/gi, "single-pass PBT"],
    [/Dual-Pass/gi, "PBT"],
    [/डुअल पास/g, "सिंगल-पास PBT"],
    [/microfiber/gi, "PBT brush"],
    [/माइक्रोफाइबर/g, "PBT ब्रश"],
    [/マイクロファイバー/g, "PBTブラシ"],
    [/ميكروفايبر/g, "فرشاة PBT"],
    [/মাইক্রোফাইবার/g, "PBT ব্রাশ"],
    [/デュアルパス/g, "シングルパスPBT"],
    [/ثنائي المرور/g, "أحادي المرور PBT"],
    [/ডুয়াল-পাস/g, "সিঙ্গল-পাস PBT"],
  ];
  return fixNyumaFeatureKeys(replaceInStrings(page, replacers));
}

function nyumaXFromPage(page) {
  const s = JSON.stringify(nyumaFromGlydePage(page));
  return JSON.parse(
    s.replace(/\bNYUMA\b(?!-X)/g, "NYUMA-X").replace(/NYUMA-X-X/g, "NYUMA-X")
  );
}

const OVERVIEW_GLYDE = {
  hi: {
    eyebrow: "यूटिलिटी-स्केल प्लांट के लिए स्वचालित सोलर पैनल सफाई रोबोट",
    title: "Taypro GLYDE स्वचालित सोलर पैनल सफाई रोबोट क्या है?",
    p1BeforeStrong: "",
    p1StrongCategory: "स्वचालित सोलर पैनल सफाई रोबोट",
    p1AfterCategory:
      " श्रेणी पूर्ण स्वायत्त, वॉटरलेस रोबोटों का वर्णन करती है जो टैंकर या रात्रि क्रू के बिना मॉड्यूल साफ करते हैं। Taypro GLYDE यूटिलिटी-स्केल प्लांटों के लिए दैनिक विश्वसनीय सफाई के लिए इंजीनियर किया गया है। एक स्वचालित रन से ",
    p1DustClaimStrong: "99% से अधिक धूल",
    p1AfterDustClaim:
      " हटती है, घूमते, सेल्फ-क्लीनिंग माइक्रोफाइबर ड्रम से, जिससे PR में लगातार सुधार मिलता है (साइट-निर्भर)।",
    p2BeforeStrong: "एक चार्ज पर GLYDE अधिकतम ",
    p2Strong: "2.2 km रनिंग लंबाई, लगभग 3,600 सोलर मॉड्यूल",
    p2AfterStrong:
      " साफ करता है। सफाई चक्र ऊर्जा उत्पादन घंटों के बाहर शेड्यूल करना सर्वोत्तम है और NECTYR से दूरस्थ प्रोग्राम किया जा सकता है।",
    p3: "एडवांस्ड एज और बाधा डिटेक्शन GLYDE को सुरक्षित पैनल पार करने देता है; सतह ट्रैकिंग पंक्ति-दर-पंक्ति मोटर प्रदर्शन समायोजित करती है। रियल-टाइम बैटरी मॉनिटरिंग सुनिश्चित करती है कि रोबोट केवल पूर्ण करने योग्य दूरी कवर करे और डॉकिंग स्टेशन पर लौटे। हल्के ब्रिज पूरे साइट पर निरंतर कवरेज देते हैं।",
  },
  ar: {
    eyebrow: "روبوت تنظيف ألواح شمسية أوتوماتيكي لمحطات المرافق",
    title: "ما هو روبوت Taypro GLYDE؟",
    p1BeforeStrong: "",
    p1StrongCategory: "روبوت تنظيف ألواح شمسية أوتوماتيكي",
    p1AfterCategory:
      " يصف روبوتات مستقلة بالكامل بدون ماء. GLYDE مصمم للتنظيف اليومي الموثوق. تشغيلة واحدة تزيل أكثر من ",
    p1DustClaimStrong: "99% من الغبار",
    p1AfterDustClaim: " بأسطوانة ميكروفايبر ذاتية التنظيف.",
  },
  ja: {
    eyebrow: "ユーティリティ規模向け自動ソーラーパネル清掃ロボット",
    title: "Taypro GLYDE自動清掃ロボットとは",
    p1BeforeStrong: "",
    p1StrongCategory: "自動ソーラーパネル清掃ロボット",
    p1AfterCategory:
      "は完全自律・無水でモジュールを清掃します。GLYDEはユーティリティ規模の日常清掃向け。1回の走行で",
    p1DustClaimStrong: "99%超のホコリ",
    p1AfterDustClaim: "をマイクロファイバードラムで除去します。",
  },
  bn: {
    eyebrow: "ইউটিলিটি-স্কেল প্ল্যান্টের জন্য অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
    title: "Taypro GLYDE অটোমেটিক রোবট কী?",
    p1BeforeStrong: "",
    p1StrongCategory: "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
    p1AfterCategory:
      " শ্রেণী সম্পূর্ণ স্বায়ত্তশাসিত, জলবিহীন রোবট। GLYDE ইউটিলিটি-স্কেল দৈনিক পরিষ্কারের জন্য।",
    p1DustClaimStrong: "৯৯%+ ধূলো",
    p1AfterDustClaim: " মাইক্রোফাইবার ড্রাম দিয়ে সরায়।",
  },
};

const SCHEMA_GLYDE = {
  hi: {
    productName: "स्वचालित सोलर पैनल सफाई रोबोट, GLYDE (Taypro)",
    howToName:
      "स्वचालित सोलर पैनल सफाई रोबोट यूटिलिटी प्लांट कैसे साफ करता है (Taypro GLYDE)",
    howToDescription:
      "Taypro GLYDE का स्वायत्त सफाई चक्र, AI शेड्यूलिंग, डुअल-पास वॉटरलेस सफाई, सेल्फ-डॉकिंग और क्लाउड टेलीमेट्री।",
  },
  ar: {
    productName: "روبوت تنظيف ألواح شمسية أوتوماتيكي, GLYDE (Taypro)",
    howToName:
      "كيف ينظف روبوت Taypro GLYDE أوتوماتيكياً محطة شمسية على نطاق المرافق؟",
    howToDescription:
      "دورة تنظيف ذاتية لـ GLYDE, جدولة AI، تنظيف ثنائي المرور بدون ماء، إرساء ذاتي واتصال سحابي.",
  },
  ja: {
    productName: "自動ソーラーパネル清掃ロボット, GLYDE (Taypro)",
    howToName:
      "自動ソーラーパネル清掃ロボットがユーティリティ規模プラントを清掃する方法（Taypro GLYDE）",
    howToDescription:
      "GLYDEの自律清掃サイクル, AIスケジューリング、デュアルパス無水清掃、セルフドッキング、クラウドテレメトリ。",
  },
  bn: {
    productName: "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট, GLYDE (Taypro)",
    howToName:
      "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট ইউটিলিটি-স্কেল প্ল্যান্ট কীভাবে পরিষ্কার করে (Taypro GLYDE)",
    howToDescription:
      "GLYDE-এর স্বায়ত্তশাসিত পরিষ্কার চক্র, AI শিডিউলিং, ডুয়াল-পাস জলবিহীন পরিষ্কার, সেল্ফ-ডকিং ও ক্লাউড টেলিমেট্রি।",
  },
};

const COPY_SECTIONS = [
  "overview",
  "usps",
  "roiBand",
  "trustStats",
  "servicePromise",
  "callbackCard",
  "certifications",
  "indianConditions",
  "specifications",
  "faq",
  "howToSection",
  "product360",
  "featuresLongForm",
  "manualVsAutomatic",
  "advantagesSection",
  "installSection",
  "roiSection",
  "cycleNarrative",
  "glydeCards",
];

for (const loc of locales) {
  const enA = JSON.parse(
    readFileSync(join(root, "messages/pages/en/glyde.json"), "utf8")
  );
  const hiT = JSON.parse(
    readFileSync(join(root, `messages/pages/${loc}/glyde-x.json`), "utf8")
  );

  let glyde = JSON.parse(JSON.stringify(enA.GlydePage));

  for (const sec of COPY_SECTIONS) {
    if (enA.GlydePage[sec] && hiT.GlydeXPage[sec]) {
      glyde[sec] = mergeTranslatedStructure(
        enA.GlydePage[sec],
        hiT.GlydeXPage[sec]
      );
    }
  }

  deepMerge(glyde.meta, META_GLYDE[loc]);
  deepMerge(glyde.hero, HERO_GLYDE[loc]);
  deepMerge(glyde.overview, OVERVIEW_GLYDE[loc]);

  const USP_ITEMS = {
    hi: {
      eyebrow: "GLYDE, स्वचालित सोलर पैनल सफाई रोबोट",
      title: "मुख्य विशेषताएं",
      items: {
        item0: "उत्कृष्ट सफाई दक्षता (डुअल-पास माइक्रोफाइबर)",
        item1: "मजबूत और टिकाऊ डिज़ाइन",
        item2: "विस्तृत कवरेज, प्रति चार्ज ~3,600 मॉड्यूल",
        item3: "उच्च गति सफाई (10–15 m/min)",
        item4: "एडवांस्ड एज और बाधा डिटेक्शन",
        item5: "मल्टी-लिंक रिमोट मॉनिटरिंग (LTE / Wi-Fi / RF mesh / LoRa)",
        item6: "सेल्फ-क्लीनिंग माइक्रोफाइबर तकनीक",
        item7: "कठोर परिस्थितियों के लिए प्रमाणित और परीक्षित",
      },
    },
    ar: {
      eyebrow: "GLYDE, روبوت تنظيف ألواح شمسية أوتوماتيكي",
      title: "أبرز المزايا",
      items: {
        item0: "كفاءة تنظيف فائقة (ثنائي المرور)",
        item1: "تصميم متين ومتين",
        item2: "تغطية واسعة, حتى 3,600 وحدة/شحنة",
        item3: "تنظيف عالي السرعة",
        item4: "كشف الحواف والعوائق",
        item5: "مراقبة عن بُعد متعددة الروابط",
        item6: "تقنية ميكروفايبر ذاتية التنظيف",
        item7: "معتمد ومُختبر لظروف قاسية",
      },
    },
    ja: {
      eyebrow: "GLYDE, 自動ソーラーパネル清掃ロボット",
      title: "主な特長",
      items: {
        item0: "高い清掃効率（デュアルパス）",
        item1: "堅牢で耐久性の高い設計",
        item2: "広いカバレッジ（1充電約3,600モジュール）",
        item3: "高速清掃",
        item4: "エッジ・障害物検知",
        item5: "LTE/Wi-Fi/RF mesh/LoRa遠隔監視",
        item6: "自己洗浄マイクロファイバー",
        item7: "過酷環境向け認証・試験済み",
      },
    },
    bn: {
      eyebrow: "GLYDE, অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
      title: "মূল বৈশিষ্ট্য",
      items: {
        item0: "উচ্চ পরিষ্কার দক্ষতা (ডুয়াল-পাস)",
        item1: "শক্তিশালী ও টেকসই ডিজাইন",
        item2: "বিস্তৃত কভারেজ, প্রতি চার্জে ~৩,৬০০ মডিউল",
        item3: "দ্রুত পরিষ্কার",
        item4: "এজ ও বাধা শনাক্তকরণ",
        item5: "মাল্টি-লিংক রিমোট মনিটরিং",
        item6: "সেল্ফ-ক্লিনিং মাইক্রোফাইবার",
        item7: "কঠোর অবস্থার জন্য সনদপ্রাপ্ত",
      },
    },
  };
  if (glyde.usps && USP_ITEMS[loc]) {
    deepMerge(glyde.usps, USP_ITEMS[loc]);
  }
  if (glyde.roiBand) {
    glyde.roiBand = {
      title:
        loc === "hi"
          ? "स्वचालित सोलर क्लीनिंग रोबोट लागत और ROI"
          : loc === "ar"
            ? "تكلفة وعائد روبوت التنظيف"
            : loc === "ja"
              ? "自動清掃ロボットのコストとROI"
              : "অটোমেটিক রোবট খরচ ও ROI",
      bodyBeforeSpan: "Taypro ",
      bodySpan: "GLYDE",
      bodyAfterSpan:
        loc === "hi"
          ? " के लिए अपने साइट पर ROI कैलकुलेटर चलाएं।"
          : ", use the ROI calculator for your site.",
    };
  }

  const localePack = GLYDE_LOCALE_PACKS[loc];
  if (localePack) {
    for (const [section, patch] of Object.entries(localePack)) {
      if (patch && typeof patch === "object" && !Array.isArray(patch)) {
        if (glyde[section]) deepMerge(glyde[section], patch);
        else glyde[section] = patch;
      }
    }
  }
  deepMerge(glyde.breadcrumbs, {
    home: loc === "hi" ? "होम" : loc === "ar" ? "الرئيسية" : loc === "ja" ? "ホーム" : "হোম",
    solarPanelCleaningRobots:
      hiT.GlydeXPage.breadcrumbs?.robots ?? glyde.breadcrumbs.solarPanelCleaningRobots,
    automaticRobot:
      loc === "hi"
        ? "स्वचालित सोलर पैनल सफाई रोबोट"
        : loc === "ar"
          ? "روبوت تنظيف ألواح شمسية أوتوماتيكي"
          : loc === "ja"
            ? "自動ソーラーパネル清掃ロボット"
            : "অটোমেটিক সোলার প্যানেল পরিষ্কার রোবট",
  });

  deepMerge(glyde, resolvePack(glydeProductPack.GlydePage, loc));

  const connectivitySummary =
    hiT.GlydeXPage?.shared?.connectivitySummary ??
    hiT.Common?.connectivitySummary ??
    enA.GlydePage?.shared?.connectivitySummary ??
    enA.Common?.connectivitySummary;

  if (glyde.shared) {
    glyde.shared.connectivitySummary = connectivitySummary;
  }

  const schemaLoc = SCHEMA_GLYDE[loc];
  if (hiT.GlydeXPage.schema && schemaLoc) {
    glyde.schema = {
      product: {
        name: schemaLoc.productName,
        description: META_GLYDE[loc].description,
        brand: "Taypro",
        sku: "GLYDE",
        offers: {
          price:
            hiT.GlydeXPage.schema.offersPrice ??
            (loc === "hi"
              ? "मूल्य निर्धारण के लिए संपर्क करें"
              : loc === "ar"
                ? "الاتصال للحصول على التسعير"
                : loc === "ja"
                  ? "価格についてはお問い合わせください"
                  : "মূল্যের জন্য যোগাযোগ করুন"),
          priceCurrency: "INR",
          availabilitySchemaUrl: "https://schema.org/InStock",
        },
      },
      howTo: {
        name: schemaLoc.howToName,
        description: schemaLoc.howToDescription,
        totalTime: "PT2H",
        imagePath: "/tayproasset/taypro-robotImage.png",
      },
    };
  }

  const common = {
    breadcrumbHome:
      loc === "hi" ? "होम" : loc === "ar" ? "الرئيسية" : loc === "ja" ? "ホーム" : "হোম",
    connectivitySummary,
  };

  writeFileSync(
    join(root, `messages/pages/${loc}/glyde.json`),
    JSON.stringify({ GlydePage: glyde, Common: common }, null, 2) + "\n"
  );

  const nyuma = nyumaFromGlydePage(glyde);
  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma.json`),
    JSON.stringify({ NyumaPage: nyuma, Common: common }, null, 2) + "\n"
  );

  let nyumaX = mergeTranslatedStructure(
    JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8"))
      .NyumaXPage,
    hiT.GlydeXPage
  );
  for (const sec of COPY_SECTIONS) {
    if (
      JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8"))
        .NyumaXPage[sec] &&
      hiT.GlydeXPage[sec]
    ) {
      nyumaX[sec] = mergeTranslatedStructure(
        JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8"))
          .NyumaXPage[sec],
        hiT.GlydeXPage[sec]
      );
    }
  }
  nyumaX = nyumaXFromPage(nyumaX);
  if (loc === "hi") {
    deepMerge(nyumaX.meta, {
      title: "PBT ट्रैकर सोलर पैनल सफाई रोबोट, Taypro NYUMA-X",
      description:
        "Taypro NYUMA-X सिंगल-एक्सिस ट्रैकर के लिए PBT सिंगल-पास रोबोट। प्रति रन 99%+ धूल हटाना, NECTYR, NEXTracker और Gamechanger संगत।",
    });
    deepMerge(nyumaX.hero, {
      title: "सिंगल-एक्सिस ट्रैकर सोलर पैनल सफाई रोबोट, NYUMA-X",
    });
  }

  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma-x.json`),
    JSON.stringify({ NyumaXPage: nyumaX, Common: common }, null, 2) + "\n"
  );

  console.log("localized", loc, "glyde + nyuma pages");
}

console.log("copy-shared-section-translations done");
