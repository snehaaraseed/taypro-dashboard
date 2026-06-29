/**
 * Montserrat in jsPDF cannot render ₹ (U+20B9); it often appears as a stray "1".
 * Normalize currency and other glyphs before any PDF text measurement or drawing.
 */
export function sanitizePdfText(text: string): string {
  return text
    .replace(/\u20B9/g, "Rs. ")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/\u2026/g, "...");
}
