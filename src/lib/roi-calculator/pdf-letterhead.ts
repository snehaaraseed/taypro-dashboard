/** ERP letterheads, PDF uses downscaled JPEGs; PNG masters stay for print templates. */
export const LETTERHEAD_UNIVERSAL_SRC =
  "/tayproasset/pdf-letterhead/letterhead_universal-pdf.jpg";
export const LETTERHEAD_MINIMAL_SRC =
  "/tayproasset/pdf-letterhead/LetterHead-pdf.jpg";

export type TayproPdfLetterheadSet = {
  universal: string;
  minimal: string;
};

let letterheadLoadPromise: Promise<TayproPdfLetterheadSet> | null = null;

/** Bust in-browser letterhead cache when assets change. */
const LETTERHEAD_CACHE_VERSION = "20250624-pdf-jpeg";

async function fetchLetterheadDataUrl(path: string): Promise<string> {
  const response = await fetch(`${path}?v=${LETTERHEAD_CACHE_VERSION}`);
  if (!response.ok) {
    throw new Error(`Failed to load Taypro letterhead: ${path}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to decode letterhead: ${path}`));
    reader.readAsDataURL(blob);
  });
}

/** Load universal + minimal letterheads once per session (full-page A4 artwork). */
export function loadTayproLetterheadsForPdf(): Promise<TayproPdfLetterheadSet> {
  if (!letterheadLoadPromise) {
    letterheadLoadPromise = Promise.all([
      fetchLetterheadDataUrl(LETTERHEAD_UNIVERSAL_SRC),
      fetchLetterheadDataUrl(LETTERHEAD_MINIMAL_SRC),
    ]).then(([universal, minimal]) => ({ universal, minimal }));
  }
  return letterheadLoadPromise;
}
