#!/usr/bin/env node
/**
 * Shared legacy href rewrite pairs for CMS + messages fix scripts.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export const LOCALES = ["hi", "ar", "ja", "bn"];
export const SITE = "https://taypro.in";

export function loadHrefRewrites() {
  const raw = execSync(
    `npx tsx -e "import { buildCmsHrefRewritePairs } from './src/lib/seo/cms-href-rewrites.ts'; console.log(JSON.stringify(buildCmsHrefRewritePairs()));"`,
    { cwd: root, encoding: "utf8" }
  );
  return JSON.parse(raw);
}

export function rewriteText(text, pairs) {
  if (!text || !text.includes("/")) return { text, count: 0 };
  let out = text;
  let count = 0;

  for (const [from, to] of pairs) {
    const replacements = [
      [`href="${from}"`, `href="${to}"`],
      [`href='${from}'`, `href='${to}'`],
      [`href="${from}/"`, `href="${to}"`],
      [`href='${from}/'`, `href='${to}'`],
      [`"${SITE}${from}"`, `"${SITE}${to}"`],
      [`'${SITE}${from}'`, `'${SITE}${to}'`],
      [`"${SITE}${from}/"`, `"${SITE}${to}"`],
      [`'${SITE}${from}/'`, `'${SITE}${to}'`],
    ];

    for (const loc of LOCALES) {
      replacements.push(
        [`href="/${loc}${from}"`, `href="/${loc}${to}"`],
        [`href='/${loc}${from}'`, `href='/${loc}${to}'`],
        [`"${SITE}/${loc}${from}"`, `"${SITE}/${loc}${to}"`],
        [`'${SITE}/${loc}${from}'`, `'${SITE}/${loc}${to}'`]
      );
    }

    for (const [needle, next] of replacements) {
      if (out.includes(needle)) {
        const parts = out.split(needle);
        out = parts.join(next);
        count += parts.length - 1;
      }
    }
  }

  return { text: out, count };
}

/** Remove trailing slashes from internal taypro hrefs (Next.js 308 otherwise). */
export function stripInternalHrefTrailingSlashes(text) {
  if (!text || !text.includes("/")) return text;

  let out = text.replace(
    /href=(["'])(\/[^"'#?]+?)\/\1/g,
    (_match, quote, path) => {
      const trimmed =
        path.length <= 1 || !path.endsWith("/") ? path : path.slice(0, -1);
      return `href=${quote}${trimmed}${quote}`;
    }
  );

  out = out.replace(
    /href=(["'])https:\/\/taypro\.in(\/[^"'#?]+?)\/\1/gi,
    (_match, quote, path) => {
      const trimmed =
        path.length <= 1 || !path.endsWith("/") ? path : path.slice(0, -1);
      return `href=${quote}https://taypro.in${trimmed}${quote}`;
    }
  );

  return out;
}
