/** Shared Google Translate helpers for locale JSON backfill scripts. */

export const TARGET_LOCALES = ["hi", "ar", "ja", "bn"];

export const PLACEHOLDER_PATTERN = /\{[^}]+\}|\$\{[^}]+\}/g;

export const PROTECTED_TERMS = [
  "Taypro",
  "TAYPRO",
  "GLYDE",
  "GLYDE-X",
  "NYUMA",
  "NYUMA-X",
  "HELYX",
  "NECTYR",
  "ORION",
  "MINY",
  "CRADYL",
  "TÜV NORD",
  "NEXTracker",
  "Gamechanger",
  "Solabot",
  "Aegeus",
  "Skilancer",
  "Opex",
  "OPEX",
  "SECI",
  "DVC",
  "IPP",
  "CPSU",
  "C&I",
  "O&M",
  "CAPEX",
  "SCADA",
  "PR",
  "MW",
  "GW",
  "kWh",
  "MWh",
  "Wp",
  "RFQ",
  "ESG",
  "SOP",
  "SLA",
  "TCO",
  "ROI",
  "LTE",
  "Wi-Fi",
  "LoRa",
  "LoRaWAN",
  "PBT",
  "IP55",
  "IP65",
  "AMC",
  "INR",
  "UVPBT",
  "Mercom India",
  "EPC World",
  "Energetica India",
  "Saur Energy",
  "TimesTech",
  "Live Mint",
  "service@taypro.in",
  "Vayu Solar",
];

const SKIP_KEY =
  /(?:Href|href|Url|url|Path|path|Slug|slug|Keywords|keyword\d+|Image|image|src|Src)$/i;

const INTENTIONAL_EN = [
  /^https?:\/\//i,
  /^\/[\w/-]+$/,
  /^[+\d\s.,₹$€£%°–—, \-:(){}[\]/\\|]+$/,
  /^(Taypro|GLYDE|HELYX|NYUMA|NECTYR|MINY|CRADYL|TÜV NORD|Opex|OPEX)$/i,
  /^LTE|Wi-Fi|LoRa|LoRaWAN|RF mesh|CAPEX|Opex$/i,
  /^MW$|^kW$|^kWh$|^Wp$|^IP\d+$/i,
];

export function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    const pathKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, pathKey));
    } else {
      keys.push(pathKey);
    }
  }
  return keys;
}

export function getAtPath(obj, dotPath) {
  const parts = dotPath.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

export function pathParts(dotPath) {
  return dotPath.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
}

/** Deepest prefix where locale leaf type disagrees with English (e.g. string vs object). */
export function findStructureConflict(locData, enData, dotPath) {
  const parts = pathParts(dotPath);
  let locCur = locData;
  let enCur = enData;

  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i];
    const enVal = enCur?.[p];
    const locVal = locCur?.[p];

    if (enVal !== undefined && locVal !== undefined) {
      const enObj = enVal && typeof enVal === "object";
      const locObj = locVal && typeof locVal === "object";
      if (typeof locVal === "string" && enObj && !Array.isArray(enVal)) {
        return parts.slice(0, i + 1).join(".");
      }
      if (Array.isArray(locVal) && enObj && !Array.isArray(enVal)) {
        return parts.slice(0, i + 1).join(".");
      }
    }

    if (locCur == null || typeof locCur !== "object") break;
    if (enCur == null || typeof enCur !== "object") break;
    locCur = locCur[p];
    enCur = enCur[p];
  }

  return null;
}

export async function translateTree(node, locale, dotPath = "", copyEn = false) {
  if (typeof node === "string") {
    const key = leafKeyFromPath(dotPath);
    if (!shouldBackfillString(dotPath, key, node) || copyEn) return node;
    return translateOne(node, locale);
  }
  if (Array.isArray(node)) {
    const out = [];
    for (let i = 0; i < node.length; i += 1) {
      out.push(
        await translateTree(node[i], locale, dotPath ? `${dotPath}[${i}]` : `[${i}]`, copyEn)
      );
    }
    return out;
  }
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      const next = dotPath ? `${dotPath}.${k}` : k;
      out[k] = await translateTree(v, locale, next, copyEn);
    }
    return out;
  }
  return node;
}

function leafKeyFromPath(dotPath) {
  return dotPath.split(/[.[\]]/).filter(Boolean).pop() ?? "";
}

export function countStringLeaves(node) {
  if (typeof node === "string") return 1;
  if (Array.isArray(node)) return node.reduce((n, v) => n + countStringLeaves(v), 0);
  if (node && typeof node === "object") {
    return Object.values(node).reduce((n, v) => n + countStringLeaves(v), 0);
  }
  return 0;
}

export function setAtPath(obj, dotPath, value) {
  const parts = pathParts(dotPath);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    const nextPart = parts[i + 1];
    if (!Object.prototype.hasOwnProperty.call(cur, p) || cur[p] == null) {
      cur[p] = /^\d+$/.test(nextPart) ? [] : {};
    } else if (typeof cur[p] === "string") {
      throw new TypeError(
        `Cannot set nested key ${dotPath}: parent ${p} is a string (${JSON.stringify(cur[p]).slice(0, 40)})`
      );
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

export function shouldBackfillString(dotPath, key, value) {
  if (typeof value !== "string" || value.length < 1) return false;
  if (SKIP_KEY.test(key)) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return false;
  if (value.startsWith("/") && !value.includes(" ")) return false;
  if (INTENTIONAL_EN.some((re) => re.test(value.trim()))) return false;
  if (dotPath.endsWith(".keywords") || /\.keyword\d+$/.test(dotPath)) return false;
  return true;
}

export function maskTerms(input) {
  const tokens = [];
  let output = input;

  output = output.replace(PLACEHOLDER_PATTERN, (m) => {
    const t = `__PH_${tokens.length}__`;
    tokens.push([t, m]);
    return t;
  });

  for (const term of PROTECTED_TERMS) {
    if (!output.includes(term)) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    output = output.replace(regex, (m) => {
      const t = `__TERM_${tokens.length}__`;
      tokens.push([t, m]);
      return t;
    });
  }

  return { masked: output, tokens };
}

export function unmaskTerms(input, tokens) {
  let out = input;
  for (const [token, value] of tokens) {
    out = out.replaceAll(token, value);
  }
  return out;
}

const translateCache = new Map();

export async function translateOne(text, targetLocale, attempt = 0) {
  const cacheKey = `${targetLocale}::${text}`;
  if (translateCache.has(cacheKey)) return translateCache.get(cacheKey);

  const { masked, tokens } = maskTerms(text);
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: targetLocale,
    dt: "t",
    q: masked,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (attempt < 5) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      return translateOne(text, targetLocale, attempt + 1);
    }
    throw err;
  }

  if (!res.ok) {
    if (attempt < 5 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return translateOne(text, targetLocale, attempt + 1);
    }
    throw new Error(`translate ${targetLocale} failed: ${res.status}`);
  }

  const data = await res.json();
  const translated =
    Array.isArray(data?.[0]) && Array.isArray(data[0][0])
      ? data[0].map((seg) => (Array.isArray(seg) ? seg[0] ?? "" : "")).join("")
      : "";
  const out = unmaskTerms(translated || text, tokens);
  translateCache.set(cacheKey, out);
  await new Promise((r) => setTimeout(r, 80));
  return out;
}
