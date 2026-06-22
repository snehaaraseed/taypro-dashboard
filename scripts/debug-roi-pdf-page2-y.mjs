import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

globalThis.fetch = async (input) => {
  const url = String(input).split("?")[0];
  const rel = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "");
  const filePath = path.join(root, "public", rel);
  const buf = fs.readFileSync(filePath);
  return {
    ok: true,
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  };
};

async function main() {
  const { registerRoiPdfFonts } = await import("../src/lib/roi-calculator/pdf-fonts.ts");
  const { calculateRoi } = await import("../src/lib/roi-calculator/calculate-roi-core.ts");
  const { resolveRoiMarket } = await import("../src/lib/roi-calculator/market-profiles.ts");
  const { buildExampleRoiInput } = await import("../src/lib/roi-calculator/default-scenario.ts");
  const {
    drawInnerPageLetterhead,
    drawSectionHeading,
    drawPaginatedProse,
    drawContactCta,
    drawLegalDisclaimerSection,
    PDF_CONTENT_TOP,
    PDF_CONTENT_BOTTOM_INNER,
    setActivePdfLetterheads,
    setActivePdfDocTitle,
    BRAND_TEXT,
  } = await import("../src/lib/roi-calculator/pdf-visuals.ts");
  const { PDF_FONT_FAMILY } = await import("../src/lib/roi-calculator/pdf-fonts.ts");
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const letterheadDir = path.join(root, "public/tayproasset/pdf-letterhead");
  const toDataUrl = (f) =>
    `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
  setActivePdfLetterheads({
    universal: toDataUrl(path.join(letterheadDir, "letterhead_universal.png")),
    minimal: toDataUrl(path.join(letterheadDir, "LetterHead.png")),
  });
  setActivePdfDocTitle("test");

  const en = JSON.parse(
    fs.readFileSync(path.join(root, "messages/pages/en/price-calculator.json"), "utf8")
  ).PriceCalculatorPage.calculator;
  const market = resolveRoiMarket("en", null);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);
  pdf.addPage();
  drawInnerPageLetterhead(pdf);
  let y = PDF_CONTENT_TOP;
  const log = (label) =>
    console.log(
      `${label}: y=${Math.round(y)} page=${pdf.getCurrentPageInfo().pageNumber} total=${pdf.getNumberOfPages()}`
    );

  const inputRows = [
    { label: en.plantName, value: "Plant" },
    { label: en.plantType, value: en.plantTypeGroundMount },
    { label: en.installationType, value: en.installationFixedTilt },
    { label: en.automationLevel, value: en.automationAutomatic },
    { label: en.pdfPlantCapacityMw, value: "200" },
    { label: `${en.pdfElectricityTariff} (${market.currency}/kWh)`, value: "4.5" },
    { label: en.pdfModuleCapacity, value: "550" },
  ];

  const tableStyles = {
    theme: "plain",
    headStyles: { fillColor: [0, 51, 73], fontSize: 8, cellPadding: 4, font: PDF_FONT_FAMILY },
    styles: { font: PDF_FONT_FAMILY, fontSize: 8.5, cellPadding: 4 },
    margin: { left: 37, right: 37 },
  };

  y = drawSectionHeading(pdf, en.pdfInputs, y);
  log("after inputs heading");
  autoTable(pdf, {
    startY: y,
    head: [[en.pdfParameter, en.pdfValue]],
    body: inputRows.map((r) => [r.label, r.value]),
    ...tableStyles,
  });
  y = pdf.lastAutoTable.finalY + 12;
  log("after inputs table");

  y = drawSectionHeading(pdf, en.pdfAssumptions, y);
  log("after assumptions heading");
  autoTable(pdf, {
    startY: y,
    head: [[en.pdfParameter, en.pdfValue]],
    body: Array.from({ length: 9 }, (_, i) => [`Row ${i}`, "val"]),
    ...tableStyles,
  });
  y = pdf.lastAutoTable.finalY + 10;
  log("after assumptions table");

  y = drawSectionHeading(pdf, en.pdfNextSteps, y);
  y = drawPaginatedProse(pdf, en.pdfNextStepsBody, y, {
    fontSize: 8.5,
    color: BRAND_TEXT,
    lineHeightFactor: 1.38,
  });
  log("after next steps");

  y = drawContactCta(pdf, y + 6, {
    heading: en.pdfContactHeading,
    website: en.pdfContactWebsite,
    websiteUrl: "taypro.in",
    email: en.pdfContactEmail,
    salesEmail: "sales@taypro.in",
    phone: en.pdfContactPhone,
    salesPhone: "+91 80438 43569",
  });
  log("after CTA");

  y = drawLegalDisclaimerSection(pdf, en.pdfDisclaimerHeading, en.pdfDisclaimerBody, y);
  log("after disclaimer");

  console.log("inner bottom limit:", PDF_CONTENT_BOTTOM_INNER);
  console.log("final pages:", pdf.getNumberOfPages());
}

main();
