import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRoiPdfDebugContext } from "./lib/roi-pdf-debug-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

globalThis.fetch = async (input) => {
  const rel = String(input).split("?")[0].replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "");
  const buf = fs.readFileSync(path.join(root, "public", rel));
  return {
    ok: true,
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  };
};

const toDataUrl = (f) =>
  `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;

async function main() {
  const { registerRoiPdfFonts } = await import("../src/lib/roi-calculator/pdf-fonts.ts");
  const { buildRoiPdfDocument } = await import("../src/lib/roi-calculator/build-roi-pdf.ts");
  const { resolveRoiMarket } = await import("../src/lib/roi-calculator/market-profiles.ts");
  const { buildDefaultInteractiveFormData } = await import(
    "../src/lib/roi-calculator/default-scenario.ts"
  );
  const { formatRoiPdfMoney, formatRoiNumber } = await import(
    "../src/lib/roi-calculator/format-roi.ts"
  );
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const en = JSON.parse(
    fs.readFileSync(path.join(root, "messages/pages/en/price-calculator.json"), "utf8")
  ).PriceCalculatorPage.calculator;
  const market = resolveRoiMarket("en", null);
  const form = buildDefaultInteractiveFormData(market);
  const plantLabel = en.pdfDefaultPlantNameMw.replace(
    "{capacity}",
    formatRoiNumber(form.plantCapacityMW, market, "en")
  );
  const pdfMoney = (n) => formatRoiPdfMoney(n, market, "en");
  const letterheadDir = path.join(root, "public/tayproasset/pdf-letterhead");

  const { results, projection, moduleCount, labels, inputRows, formatPaybackDuration } =
    buildRoiPdfDebugContext({ en, market, form, plantLabel, pdfMoney });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);

  buildRoiPdfDocument({
    pdf,
    autoTable,
    letterheads: {
      universal: toDataUrl(path.join(letterheadDir, "letterhead_universal.png")),
      minimal: toDataUrl(path.join(letterheadDir, "LetterHead.png")),
    },
    market,
    results,
    projection,
    moduleCount,
    formatMoney: pdfMoney,
    formatNumber: (n, d) => formatRoiNumber(n, market, "en", d),
    formatPaybackDuration,
    labels,
    inputRows,
  });

  console.log("Browser-default pages:", pdf.getNumberOfPages());
}

main();
