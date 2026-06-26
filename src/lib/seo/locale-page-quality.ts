import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { ACTIVE_LOCALES, type TayproLocale } from "@/i18n/markets";
import { routing } from "@/i18n/routing";

const LOCALE_SCRIPTS: Record<Exclude<TayproLocale, "en">, RegExp> = {
  hi: /[\u0900-\u097F]/,
  ar: /[\u0600-\u06FF]/,
  ja: /[\u3040-\u30ff\u4e00-\u9faf]/,
  bn: /[\u0980-\u09FF]/,
};

const INTENTIONAL_ENGLISH = [
  /^https?:\/\//i,
  /^[+\d\s.,₹$€£%°–, \-:(){}[\]/\\]+$/,
  /^(Taypro|GLYDE|HELYX|NYUMA|NECTYR|MINY|CRADYL|TÜV NORD|Opex|OPEX)$/i,
  /^LTE|Wi-Fi|LoRa|LoRaWAN|RF mesh|CAPEX|Opex$/i,
  /^MW$|^kW$|^kWh$|^Wp$|^IP\d+$/i,
  /^PT\d+H$/,
  /^kg CO/i,
  /^Model-A$|^Model-B$|^Model-T$/i,
  /^GLYDE-X$|^NYUMA-X$/,
];

/** Minimum share of locale-script strings on weighted visible content paths. */
export const LOCALE_TRANSLATION_STRICT_PCT = 40;

const WEIGHTED_SEGMENT =
  /(?:^|\.)(meta|hero|prose|stats|cards|faq|proseSecondary)(?:\.|\[|$)/;

function isWeightedContentPath(dotPath: string): boolean {
  return WEIGHTED_SEGMENT.test(dotPath);
}

function resolveMessagesPagesRoot(): string {
  const candidates = [
    join(process.cwd(), "messages", "pages"),
    join(process.cwd(), "..", "messages", "pages"),
    join(process.cwd(), "..", "..", "messages", "pages"),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, "en", "home.json"))) return dir;
  }
  return candidates[0];
}

const MESSAGES_PAGES_ROOT = resolveMessagesPagesRoot();

function leaves(
  obj: unknown,
  prefix = ""
): { path: string; value: string }[] {
  const out: { path: string; value: string }[] = [];
  if (typeof obj === "string") out.push({ path: prefix, value: obj });
  else if (Array.isArray(obj))
    obj.forEach((v, i) => out.push(...leaves(v, `${prefix}[${i}]`)));
  else if (obj && typeof obj === "object")
    for (const [k, v] of Object.entries(obj))
      out.push(...leaves(v, prefix ? `${prefix}.${k}` : k));
  return out;
}

function getAtPath(obj: unknown, dotPath: string): unknown {
  const parts = dotPath.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function isIntentionalEnglish(s: string): boolean {
  if (!s || s.length < 2) return true;
  return INTENTIONAL_ENGLISH.some((re) => re.test(s.trim()));
}

function hasLocaleScript(s: string, locale: Exclude<TayproLocale, "en">): boolean {
  return LOCALE_SCRIPTS[locale].test(s);
}

function classifyString(
  enVal: string,
  locVal: string,
  locale: Exclude<TayproLocale, "en">
): "skip" | "identical_en" | "intentional" | "translated" | "english_like" | "other" {
  if (enVal.length < 2) return "skip";
  if (locVal === enVal) return "identical_en";
  if (isIntentionalEnglish(locVal)) return "intentional";
  if (hasLocaleScript(locVal, locale)) return "translated";
  const latin = (locVal.match(/[a-zA-Z]/g) || []).length;
  const total = locVal.replace(/\s/g, "").length;
  if (total > 0 && latin / total > 0.55) return "english_like";
  return "other";
}

export type LocalePageQuality = {
  pctStrict: number;
  translated: number;
  meaningful: number;
};

export function measureLocalePageQuality(
  module: string,
  locale: TayproLocale
): LocalePageQuality | null {
  if (locale === routing.defaultLocale) {
    return { pctStrict: 100, translated: 0, meaningful: 0 };
  }

  const enPath = join(MESSAGES_PAGES_ROOT, "en", `${module}.json`);
  const locPath = join(MESSAGES_PAGES_ROOT, locale, `${module}.json`);
  if (!existsSync(enPath) || !existsSync(locPath)) return null;

  const en = JSON.parse(readFileSync(enPath, "utf8")) as unknown;
  const lo = JSON.parse(readFileSync(locPath, "utf8")) as unknown;
  const enMap = new Map(leaves(en).map((x) => [x.path, x.value]));

  let translated = 0;
  let meaningful = 0;

  for (const [path, enVal] of enMap) {
    if (typeof enVal !== "string" || enVal.length < 4) continue;
    if (!isWeightedContentPath(path)) continue;
    const locVal = getAtPath(lo, path);
    if (typeof locVal !== "string") continue;

    const c = classifyString(
      enVal,
      locVal,
      locale as Exclude<TayproLocale, "en">
    );
    if (c === "skip") continue;
    if (c === "translated") {
      translated++;
      meaningful++;
    } else if (c !== "intentional") {
      meaningful++;
    }
  }

  const pctStrict =
    meaningful > 0 ? Math.round((100 * translated) / meaningful) : 0;

  return { pctStrict, translated, meaningful };
}

export function isLocalePageSubstantivelyTranslated(
  module: string,
  locale: TayproLocale,
  threshold = LOCALE_TRANSLATION_STRICT_PCT
): boolean {
  if (locale === routing.defaultLocale) return true;
  const quality = measureLocalePageQuality(module, locale);
  if (!quality) return false;
  return quality.pctStrict >= threshold;
}

export function getTranslatedLocalesForModule(module: string): TayproLocale[] {
  const locales: TayproLocale[] = [routing.defaultLocale as TayproLocale];
  for (const locale of ACTIVE_LOCALES) {
    if (locale === routing.defaultLocale) continue;
    if (isLocalePageSubstantivelyTranslated(module, locale)) {
      locales.push(locale);
    }
  }
  return locales;
}
