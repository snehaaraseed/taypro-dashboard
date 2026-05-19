#!/usr/bin/env node
/**
 * Translate model-a / nyuma / nyuma-x locales by reusing strings already
 * translated on model-t / model-b (same English → same translation).
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];

/** Localized SEO meta (unique vs GLYDE-X / model-t). */
const NYUMA_X_META_BY_LOCALE = {
  ar: {
    title: "روبوت تنظيف ألواح PBT لأجهزة التتبع أحادية المحور — Taypro NYUMA-X",
    description:
      "Taypro NYUMA-X هو روبوت تنظيف ألواح شمسية بدون ماء بتمريرة واحدة بتقنية PBT، مصمم لمزارع التتبع أحادية المحور. إزالة غبار بنسبة 99%+ لكل دورة، حتى 3600 وحدة لكل شحنة، مرونة ±15°، متوافق مع NEXTracker وGamechanger، بوابة أسطول NECTYR، معتمد من TÜV NORD.",
    openGraphDescription:
      "NYUMA-X: تنظيف مستقل بتمريرة واحدة PBT لأجهزة التتبع أحادية المحور. إزالة غبار 99%+، مراقبة NECTYR، متوافق مع NEXTracker وGamechanger.",
    openGraphImageAlt: "روبوت Taypro NYUMA-X PBT لتنظيف ألواح التتبع الشمسية",
    twitterDescription:
      "Taypro NYUMA-X: روبوت تتبع بتمريرة واحدة PBT. 3600 وحدة لكل شحنة، بوابة أسطول NECTYR، متوافق مع NEXTracker وGamechanger.",
    openGraphTitle: "روبوت تنظيف ألواح PBT لأجهزة التتبع أحادية المحور — Taypro NYUMA-X",
    twitterTitle: "روبوت تنظيف ألواح PBT لأجهزة التتبع أحادية المحور — Taypro NYUMA-X",
    keywords: [
      "روبوت تنظيف PBT للتتبع الشمسي",
      "روبوت تنظيف تتبع بتمريرة واحدة",
      "تنظيف ألواح شمسية متتبع أحادي المحور",
      "روبوت تنظيف متتبع أحادي المحور",
      "روبوت تنظيف NEXTracker",
      "روبوت تنظيف Gamechanger للمتتبعات",
      "روبوت تنظيف ألواح على نطاق المرافق",
      "نظام تنظيف أوتوماتيكي للمتتبعات",
      "Taypro NYUMA-X",
    ],
  },
  hi: {
    title: "PBT ट्रैकर सोलर पैनल सफाई रोबोट — Taypro NYUMA-X",
    description:
      "Taypro NYUMA-X एकल-अक्ष ट्रैकर खेतों के लिए जल रहित PBT सिंगल-पास सोलर पैनल क्लीनिंग रोबोट है। प्रति रन 99%+ धूल हटाना, प्रति चार्ज 3,600 मॉड्यूल तक, ±15° फ्लेक्स, NEXTracker और Gamechanger संगत, NECTYR फ्लीट पोर्टल, TÜV NORD प्रमाणित।",
    openGraphDescription:
      "NYUMA-X: एकल-अक्ष ट्रैकर्स के लिए PBT सिंगल-पास स्वायत्त सफाई। 99%+ धूल हटाना, NECTYR निगरानी, NEXTracker और Gamechanger संगत।",
    openGraphImageAlt: "Taypro NYUMA-X PBT ट्रैकर सोलर पैनल क्लीनिंग रोबोट",
    twitterDescription:
      "Taypro NYUMA-X: PBT सिंगल-पास ट्रैकर रोबोट। प्रति चार्ज 3,600 मॉड्यूल, NECTYR फ्लीट पोर्टल, NEXTracker और Gamechanger संगत।",
    openGraphTitle: "PBT ट्रैकर सोलर पैनल सफाई रोबोट — Taypro NYUMA-X",
    twitterTitle: "PBT ट्रैकर सोलर पैनल सफाई रोबोट — Taypro NYUMA-X",
    keywords: [
      "PBT ट्रैकर सोलर सफाई रोबोट",
      "सिंगल-पास ट्रैकर सोलर सफाई रोबोट",
      "सिंगल-अक्ष ट्रैकर सोलर पैनल सफाई",
      "सिंगल-अक्ष ट्रैकर सोलर सफाई रोबोट",
      "NEXTracker सोलर सफाई रोबोट",
      "Gamechanger ट्रैकर सफाई रोबोट",
      "यूटिलिटी स्केल सोलर पैनल सफाई रोबोट",
      "ट्रैकर स्वचालित सोलर पैनल सफाई सिस्टम",
      "Taypro NYUMA-X",
    ],
  },
  ja: {
    title: "PBTトラッカー用ソーラーパネル清掃ロボット — Taypro NYUMA-X",
    description:
      "Taypro NYUMA-X は、単軸トラッカー発電所向けの水を使わない PBT シングルパスソーラーパネル清掃ロボットです。1回の走行で99%以上の塵除去、1充電で最大3,600モジュール、±15°フレックス、NEXTrackerおよびGamechanger互換、NECTYRフリートポータル、TÜV NORD認定。",
    openGraphDescription:
      "NYUMA-X：単軸トラッカー向けPBTシングルパス自律清掃。99%以上の塵除去、NECTYR監視、NEXTrackerおよびGamechanger互換。",
    openGraphImageAlt: "Taypro NYUMA-X PBTトラッカーソーラーパネル清掃ロボット",
    twitterDescription:
      "Taypro NYUMA-X：PBTシングルパストラッカーロボット。1充電で3,600モジュール、NECTYRフリートポータル、NEXTrackerおよびGamechanger互換。",
    openGraphTitle: "PBTトラッカー用ソーラーパネル清掃ロボット — Taypro NYUMA-X",
    twitterTitle: "PBTトラッカー用ソーラーパネル清掃ロボット — Taypro NYUMA-X",
    keywords: [
      "PBTトラッカー ソーラー洗浄ロボット",
      "シングルパス トラッカー ソーラー洗浄ロボット",
      "単軸トラッカー ソーラーパネル洗浄",
      "単軸トラッカー ソーラー洗浄ロボット",
      "NEXTracker ソーラー洗浄ロボット",
      "Gamechanger トラッカー洗浄ロボット",
      "ユーティリティ規模 ソーラーパネル洗浄ロボット",
      "トラッカー向け自動ソーラーパネル洗浄システム",
      "Taypro NYUMA-X",
    ],
  },
  bn: {
    title: "PBT ট্র্যাকার সোলার প্যানেল পরিষ্কারের রোবট — Taypro NYUMA-X",
    description:
      "Taypro NYUMA-X হল একক-অক্ষ ট্র্যাকার খামারের জন্য জলবিহীন PBT সিঙ্গল-পাস সোলার প্যানেল ক্লিনিং রোবট। প্রতি রানে 99%+ ধুলো অপসারণ, প্রতি চার্জে 3,600 মডিউল পর্যন্ত, টেবিলের মধ্যে ±15° ফ্লেক্স, NEXTracker এবং Gamechanger সামঞ্জস্যপূর্ণ, NECTYR ফ্লিট পোর্টাল, TÜV NORD প্রত্যয়িত।",
    openGraphDescription:
      "NYUMA-X: একক-অক্ষ ট্র্যাকারের জন্য PBT সিঙ্গল-পাস স্বায়ত্তশাসিত পরিষ্কার। 99%+ ধুলো অপসারণ, NECTYR মনিটরিং, NEXTracker এবং Gamechanger সামঞ্জস্যপূর্ণ।",
    openGraphImageAlt: "Taypro NYUMA-X PBT ট্র্যাকার সোলার প্যানেল ক্লিনিং রোবট",
    twitterDescription:
      "Taypro NYUMA-X: PBT সিঙ্গল-পাস ট্র্যাকার রোবট। প্রতি চার্জ 3,600 মডিউল, NECTYR ফ্লিট পোর্টাল, NEXTracker এবং Gamechanger সামঞ্জস্যপূর্ণ।",
    openGraphTitle: "PBT ট্র্যাকার সোলার প্যানেল পরিষ্কারের রোবট — Taypro NYUMA-X",
    twitterTitle: "PBT ট্র্যাকার সোলার প্যানেল পরিষ্কারের রোবট — Taypro NYUMA-X",
    keywords: [
      "PBT ট্র্যাকার সোলার পরিষ্কার রোবট",
      "সিঙ্গল-পাস ট্র্যাকার সোলার পরিষ্কার রোবট",
      "সিঙ্গেল-অক্ষ ট্র্যাকার সোলার প্যানেল পরিষ্কার",
      "ট্র্যাকার সোলার প্যানেল পরিষ্কার রোবট",
      "NEXTracker সোলার পরিষ্কার রোবট",
      "Gamechanger ট্র্যাকার পরিষ্কার রোবট",
      "PBT সোলার প্যানেল পরিষ্কার রোবট ট্র্যাকার",
      "ইউটিলিটি স্কেল সোলার প্যানেল পরিষ্কার রোবট",
      "Taypro NYUMA-X",
    ],
  },
};

function flattenStrings(obj, out = new Map(), path = "") {
  if (typeof obj === "string") {
    const prev = out.get(obj);
    if (!prev) out.set(obj, []);
    out.get(obj).push(path);
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenStrings(v, out, `${path}[${i}]`));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const p = path ? `${path}.${k}` : k;
      flattenStrings(v, out, p);
    }
  }
  return out;
}

function buildTranslationMap(sourcePage) {
  const enMap = flattenStrings(sourcePage);
  const translationMap = new Map();
  for (const [english, paths] of enMap) {
    if (english.trim().length < 2) continue;
    if (!translationMap.has(english)) translationMap.set(english, english);
  }
  return translationMap;
}

function applyMapToPage(page, translationMap) {
  return JSON.parse(
    JSON.stringify(page, (_, v) => {
      if (typeof v === "string" && translationMap.has(v)) {
        return translationMap.get(v);
      }
      return v;
    })
  );
}

/** Map NYUMA-X English copy to GLYDE-X English for reusing model-t translations. */
function enToModelTEquivalent(text) {
  return text
    .replace(/Taypro NYUMA-X/g, "Taypro GLYDE-X")
    .replace(/\bNYUMA-X\b/g, "GLYDE-X")
    .replace(/\bNYUMA\b/g, "GLYDE")
    .replace(/single-pass/gi, "dual-pass")
    .replace(/Single-pass/g, "Dual-pass")
    .replace(/PBT Tracker/g, "Dual-Pass Tracker")
    .replace(/PBT brush or PBT/gi, "microfiber or PBT")
    .replace(/PBT brush/gi, "microfiber")
    .replace(/100% Waterless single-pass Cleaning/g, "100% Waterless Dual-Pass Cleaning")
    .replace(/single-pass Cleaning — PBT brush or PBT/g, "Dual-Pass Cleaning — Microfiber or PBT")
    .replace(/single-pass dry cleaning/g, "dual-pass dry cleaning")
    .replace(/waterless single-pass/gi, "waterless dual-pass")
    .replace(/a single-pass cleaning cycle/g, "a dual-pass cleaning cycle")
    .replace(/waterless single-pass cleaning cycle/g, "waterless dual-pass cleaning cycle");
}

function translateNyumaXPage(enNx, enT, trT, map, fixFn) {
  function resolve(enNxStr) {
    if (map.has(enNxStr)) return fixFn(map.get(enNxStr));
    const alt = enToModelTEquivalent(enNxStr);
    if (alt !== enNxStr && map.has(alt)) return fixFn(map.get(alt));
    return fixFn(enNxStr);
  }

  function walk(nx, et, tt) {
    if (typeof nx === "string" && typeof et === "string" && typeof tt === "string") {
      // Reuse model-t locale copy at the same path, then rebrand to NYUMA-X / single-pass.
      return fixFn(tt);
    }
    if (Array.isArray(nx) && Array.isArray(et) && Array.isArray(tt)) {
      return nx.map((v, i) => walk(v, et[i], tt[i]));
    }
    if (nx && et && tt && typeof nx === "object" && typeof et === "object") {
      const out = {};
      for (const k of Object.keys(nx)) {
        if (k in et && k in tt) out[k] = walk(nx[k], et[k], tt[k]);
        else if (typeof nx[k] === "string") out[k] = resolve(nx[k]);
        else out[k] = nx[k];
      }
      return out;
    }
    return nx;
  }

  return walk(enNx, enT, trT);
}

function mergeTranslationMaps(...maps) {
  const merged = new Map();
  for (const m of maps) {
    for (const [en, tr] of m) {
      if (tr !== en) merged.set(en, tr);
    }
  }
  return merged;
}

function loadPage(loc, file, pageKey) {
  return JSON.parse(readFileSync(join(root, `messages/pages/${loc}/${file}`), "utf8"))[
    pageKey
  ];
}

function rebrand(text) {
  return text
    .replace(/Taypro Model-A/g, "Taypro GLYDE")
    .replace(/Taypro Model-B/g, "Taypro HELYX")
    .replace(/Taypro Model-T/g, "Taypro GLYDE-X")
    .replace(/Model-A\b/g, "GLYDE")
    .replace(/Model-B\b/g, "HELYX")
    .replace(/Model-T\b/g, "GLYDE-X")
    .replace(/Taypro Console/g, "NECTYR");
}

function glydeFix(text) {
  return rebrand(text)
    .replace(/GLYDE-X/g, "GLYDE")
    .replace(/NYUMA-X/g, "NYUMA")
    .replace(/सिंगल-एक्सिस ट्रैकर्स/g, "फिक्स्ड और सीज़नल-टिल्ट")
    .replace(/single-axis tracker/gi, "fixed and seasonal-tilt")
    .replace(/Single-Axis Tracker/gi, "Fixed-Tilt")
    .replace(/tracker plant/gi, "fixed-tilt plant")
    .replace(/ट्रैकर/g, "फिक्स्ड-टिल्ट")
    .replace(/NEXTracker और Gamechanger संगत/g, "यूटिलिटी-स्केल फिक्स्ड-टिल्ट प्लांट")
    .replace(/±15° flex between tables/gi, "continuous row coverage")
    .replace(/टेबलों के बीच ±15° फ्लेक्स/g, "निरंतर पंक्ति कवरेज");
}

function nyumaFix(text) {
  return glydeFix(text)
    .replace(/\bGLYDE\b/g, "NYUMA")
    .replace(/डुअल-पास/g, "सिंगल-पास PBT")
    .replace(/dual-pass/gi, "single-pass PBT")
    .replace(/Dual-Pass/gi, "PBT")
    .replace(/microfiber/gi, "PBT brush")
    .replace(/माइक्रोफाइबर/g, "PBT ब्रश");
}

/** Tracker NYUMA-X: keep single-axis tracker copy; rebrand GLYDE-X → NYUMA-X only. */
function nyumaXFix(text) {
  return text
    .replace(/Taypro Model-T/g, "Taypro NYUMA-X")
    .replace(/Model-T\b/g, "NYUMA-X")
    .replace(/TAYPRO GLYDE-X/g, "TAYPRO NYUMA-X")
    .replace(/Taypro GLYDE-X/g, "Taypro NYUMA-X")
    .replace(/\bGLYDE-X\b/g, "NYUMA-X")
    .replace(/The Innovation Behind the GLYDE-X/g, "The Innovation Behind the NYUMA-X")
    .replace(/dual-pass/gi, "single-pass")
    .replace(/Dual-Pass/gi, "PBT")
    .replace(/Two-pass/gi, "Single-pass")
    .replace(/two-pass/gi, "single-pass")
    .replace(/डुअल-पास/g, "सिंगल-पास PBT")
    .replace(/ডুয়াল-পাস/g, "সিঙ্গল-পাস PBT")
    .replace(/تنظيف مزدوج بدون ماء بنسبة 100%/g, "تنظيف بتمريرة واحدة PBT بدون ماء بنسبة 100%")
    .replace(/تنظيف مزدوج بدون ماء عبر الصف/g, "تنظيف بتمريرة واحدة بدون ماء عبر الصف")
    .replace(/دورة التنظيف المزدوجة/g, "دورة التنظيف بتمريرة واحدة PBT")
    .replace(/دورة تنظيف مزدوجة المسار/g, "دورة تنظيف بتمريرة واحدة PBT")
    .replace(/التنظيف المزدوج — ألياف دقيقة أو PBT/g, "التنظيف بتمريرة واحدة PBT — فرشاة PBT")
    .replace(/التنظيف المزدوج/g, "التنظيف بتمريرة واحدة PBT")
    .replace(/التنظيف الجاف المزدوج/g, "التنظيف الجاف بتمريرة واحدة PBT")
    .replace(/تنفيذ دورة تنظيف ذات تمرير مزدوج/g, "تنفيذ دورة تنظيف بتمريرة واحدة")
    .replace(/تمريرة مزدوجة/g, "تمريرة واحدة PBT")
    .replace(/تمرير مزدوج/g, "تمريرة واحدة")
    .replace(/في كل دورة تمرير مزدوج/g, "في كل دورة تمريرة واحدة")
    .replace(/ذات المسار المزدوج/g, "بتمريرة واحدة PBT")
    .replace(/ثنائي المسار/g, "بتمريرة واحدة PBT")
    .replace(/ممر مزدوج/g, "ممر بتمريرة واحدة PBT")
    .replace(/ألياف دقيقة/g, "فرشاة PBT")
    .replace(/デュアルパス/g, "シングルパス")
    .replace(/二重パス/g, "シングルパス")
    .replace(/二回洗浄/g, "シングルパス洗浄")
    .replace(/デュアルパス洗浄/g, "シングルパスPBT洗浄")
    .replace(/100%無水デュアルパス洗浄/g, "100%無水シングルパスPBT洗浄")
    .replace(/microfiber/gi, "PBT brush")
    .replace(/माइक्रोफाइबर/g, "PBT ब्रश")
    .replace(/الألياف الدقيقة/g, "فرشاة PBT")
    .replace(/Taypro Console/g, "NECTYR")
    .replace(/NYUMA-X-X/g, "NYUMA-X");
}

function walkPage(page, fixFn) {
  const walk = (o) => {
    if (typeof o === "string") return fixFn(o);
    if (Array.isArray(o)) return o.map(walk);
    if (o && typeof o === "object") {
      const n = {};
      for (const [k, v] of Object.entries(o)) n[k] = walk(v);
      return n;
    }
    return o;
  };
  return walk(page);
}

for (const loc of locales) {
  const enT = loadPage("en", "model-t.json", "ModelTPage");
  const enB = loadPage("en", "model-b.json", "ModelBPage");
  const enConsole = loadPage("en", "taypro-console.json", "TayproConsolePage");
  const hiT = loadPage(loc, "model-t.json", "ModelTPage");
  const hiB = loadPage(loc, "model-b.json", "ModelBPage");
  const hiConsole = loadPage(loc, "taypro-console.json", "TayproConsolePage");

  const enToHi = new Map();
  function addPairs(enPage, trPage) {
    const enFlat = flattenStrings(enPage);
    const trFlat = flattenStrings(trPage);
    for (const [en, paths] of enFlat) {
      const trPath = paths[0];
      const trVal = trPath
        ? trPath.split(".").reduce((o, key) => {
            if (key.includes("[")) {
              const [k, idx] = key.split("[");
              return o[k][parseInt(idx, 10)];
            }
            return o[key];
          }, trPage)
        : en;
      if (typeof trVal === "string" && trVal !== en) enToHi.set(en, trVal);
    }
  }

  // Simpler: walk both trees in parallel
  function pairWalk(enNode, trNode, map) {
    if (typeof enNode === "string" && typeof trNode === "string") {
      if (enNode !== trNode) map.set(enNode, trNode);
      return;
    }
    if (Array.isArray(enNode) && Array.isArray(trNode)) {
      enNode.forEach((v, i) => pairWalk(v, trNode[i], map));
      return;
    }
    if (
      enNode &&
      trNode &&
      typeof enNode === "object" &&
      typeof trNode === "object"
    ) {
      for (const k of Object.keys(enNode)) {
        if (k in trNode) pairWalk(enNode[k], trNode[k], map);
      }
    }
  }

  const map = new Map();
  pairWalk(enT, hiT, map);
  pairWalk(enB, hiB, map);
  pairWalk(enConsole, hiConsole, map);

  const enA = JSON.parse(readFileSync(join(root, "messages/pages/en/model-a.json"), "utf8"));
  const enNyuma = JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma.json"), "utf8"));
  const enNyumaX = JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8"));

  let glydePage = applyMapToPage(enA.ModelAPage, map);
  glydePage = walkPage(glydePage, glydeFix);

  let nyumaPage = applyMapToPage(enNyuma.NyumaPage, map);
  nyumaPage = walkPage(nyumaPage, nyumaFix);

  let nyumaXPage = translateNyumaXPage(
    enNyumaX.NyumaXPage,
    enT,
    hiT,
    map,
    nyumaXFix
  );

  const metaOverride = NYUMA_X_META_BY_LOCALE[loc];
  if (metaOverride) {
    Object.assign(nyumaXPage.meta, metaOverride);
  }

  const common = enA.Common
    ? applyMapToPage(enA.Common, map)
    : { breadcrumbHome: map.get("Home") || "Home" };

  writeFileSync(
    join(root, `messages/pages/${loc}/model-a.json`),
    JSON.stringify({ ModelAPage: glydePage, Common: common }, null, 2) + "\n"
  );
  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma.json`),
    JSON.stringify({ NyumaPage: nyumaPage, Common: common }, null, 2) + "\n"
  );
  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma-x.json`),
    JSON.stringify(
      { NyumaXPage: nyumaXPage, Common: common },
      null,
      2
    ) + "\n"
  );

  // Rebrand model-b/t/console from packs
  for (const file of ["model-b.json", "model-t.json", "taypro-console.json"]) {
    const data = JSON.parse(readFileSync(join(root, `messages/pages/${loc}/${file}`), "utf8"));
    const key = Object.keys(data).find((k) => k.endsWith("Page"));
    if (key) data[key] = walkPage(data[key], rebrand);
    writeFileSync(join(root, `messages/pages/${loc}/${file}`), JSON.stringify(data, null, 2) + "\n");
  }

  console.log(loc, "model-a/nyuma/nyuma-x translated via string match");
}

console.log("translate-product-pages-by-match done");
