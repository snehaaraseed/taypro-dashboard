import type { jsPDF } from "jspdf";

const FONT_REGULAR = "Montserrat-Regular.ttf";
const FONT_BOLD = "Montserrat-Bold.ttf";

let fontCache: { regular: string; bold: string } | null = null;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function loadFontCache(): Promise<{ regular: string; bold: string }> {
  if (fontCache) return fontCache;
  const [regular, bold] = await Promise.all([
    fetch("/fonts/Montserrat-Regular.ttf").then((r) => {
      if (!r.ok) throw new Error("Montserrat-Regular.ttf not found");
      return r.arrayBuffer();
    }),
    fetch("/fonts/Montserrat-Bold.ttf").then((r) => {
      if (!r.ok) throw new Error("Montserrat-Bold.ttf not found");
      return r.arrayBuffer();
    }),
  ]);
  fontCache = {
    regular: bufferToBase64(regular),
    bold: bufferToBase64(bold),
  };
  return fontCache;
}

/** Embed Montserrat (matches Taypro quotation PDFs). Call once per jsPDF instance. */
export async function registerRoiPdfFonts(pdf: jsPDF): Promise<void> {
  const fonts = await loadFontCache();
  pdf.addFileToVFS(FONT_REGULAR, fonts.regular);
  pdf.addFileToVFS(FONT_BOLD, fonts.bold);
  pdf.addFont(FONT_REGULAR, "Montserrat", "normal");
  pdf.addFont(FONT_BOLD, "Montserrat", "bold");
}

export const PDF_FONT_FAMILY = "Montserrat";

export function pdfSetFont(
  pdf: jsPDF,
  style: "normal" | "bold" = "normal"
): void {
  pdf.setFont(PDF_FONT_FAMILY, style);
}
