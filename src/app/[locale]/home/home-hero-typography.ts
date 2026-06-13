/**
 * Hero text sizing — SSR-computed clamp from line length (no client JS, no reload flash).
 */
export const HERO_HEADLINE_FONT = { minPx: 11, maxPx: 60, absoluteMaxPx: 96 };
export const HERO_SUBHEAD_FONT = { minPx: 8, maxPx: 16, absoluteMaxPx: 24 };

/** Readable mobile sizes when lines wrap (sm+ uses fit-to-width vars). */
export const HERO_HEADLINE_MOBILE_CLAMP = "clamp(1.5rem, 6.5vw, 2.25rem)";
export const HERO_SUBHEAD_MOBILE_CLAMP = "clamp(0.9375rem, 3.5vw, 1.0625rem)";

/** Montserrat semibold average glyph width ≈ 0.55em */
const CHAR_WIDTH_EM = 0.55;

type HeroFontBounds = {
  minPx: number;
  absoluteMaxPx: number;
};

/**
 * Fit-to-width clamp from the longest line length (full-width containers).
 */
export function computeHeroFitClamp(
  longestLineLength: number,
  bounds: HeroFontBounds,
  horizontalPaddingPx = 0
): string {
  const { minPx, absoluteMaxPx } = bounds;
  if (longestLineLength <= 0) {
    return `clamp(${minPx}px, 3.5vw, ${absoluteMaxPx}px)`;
  }

  const divisor = longestLineLength * CHAR_WIDTH_EM;
  if (horizontalPaddingPx > 0) {
    return `clamp(${minPx}px, calc((100vw - ${horizontalPaddingPx}px) / ${divisor}), ${absoluteMaxPx}px)`;
  }
  return `clamp(${minPx}px, calc(100vw / ${divisor}), ${absoluteMaxPx}px)`;
}

/** Fit-to-width using container query units (padded inner containers). */
export function computeHeroFitCqi(
  longestLineLength: number,
  bounds: HeroFontBounds
): string {
  const { minPx, absoluteMaxPx } = bounds;
  if (longestLineLength <= 0) {
    return `clamp(${minPx}px, 2cqi, ${absoluteMaxPx}px)`;
  }
  const cqi = (100 / (longestLineLength * CHAR_WIDTH_EM)).toFixed(3);
  return `clamp(${minPx}px, ${cqi}cqi, ${absoluteMaxPx}px)`;
}

export function longestLineLength(...lines: string[]): number {
  return Math.max(0, ...lines.map((line) => line.length));
}

/** CJK / full-width glyphs render ~1em wide vs ~0.55em for Latin in Montserrat. */
function isWideScriptChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (
    (code >= 0x3000 && code <= 0x9fff) ||
    (code >= 0xff00 && code <= 0xffef) ||
    (code >= 0x3040 && code <= 0x30ff)
  );
}

/** Line length in Latin-equivalent units for fit-to-width clamp. */
export function weightedLongestLineLength(...lines: string[]): number {
  const wideToLatin = 1 / CHAR_WIDTH_EM;
  const weights = lines.map((line) => {
    let units = 0;
    for (const char of line) {
      units += isWideScriptChar(char) ? wideToLatin : 1;
    }
    return units;
  });
  return Math.max(0, ...weights);
}
