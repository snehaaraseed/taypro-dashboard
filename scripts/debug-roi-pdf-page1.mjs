import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function toDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

globalThis.fetch = async (input) => {
  const url = String(input).split("?")[0];
  const rel = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "");
  const filePath = path.join(root, "public", rel);
  if (!fs.existsSync(filePath)) return { ok: false, status: 404 };
  const buf = fs.readFileSync(filePath);
  return {
    ok: true,
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  };
};

function logY(pdf, label) {
  console.log(
    `${label}: page=${pdf.getCurrentPageInfo().pageNumber} total=${pdf.getNumberOfPages()}`
  );
}

async function main() {
  const { registerRoiPdfFonts } = await import(
    "../src/lib/roi-calculator/pdf-fonts.ts"
  );
  const { buildRoiPdfDocument } = await import(
    "../src/lib/roi-calculator/build-roi-pdf.ts"
  );
  const { calculateRoi } = await import(
    "../src/lib/roi-calculator/calculate-roi-core.ts"
  );
  const { resolveRoiMarket } = await import(
    "../src/lib/roi-calculator/market-profiles.ts"
  );
  const { buildExampleRoiInput } = await import(
    "../src/lib/roi-calculator/default-scenario.ts"
  );
  const { formatRoiPdfMoney, formatRoiNumber } = await import(
    "../src/lib/roi-calculator/format-roi.ts"
  );
  const {
    drawBrandHeader,
    drawDisclaimerBanner,
    drawEnvironmentalCards,
    drawKpiStrip,
    drawNarrativeCallout,
    drawPaybackTimeline,
    drawSavingsBreakdownChart,
    drawSectionHeading,
    setActivePdfLetterheads,
    setActivePdfDocTitle,
    SAVINGS_CHART_COLORS,
    PDF_CONTENT_TOP,
  } = await import("../src/lib/roi-calculator/pdf-visuals.ts");

  const { default: jsPDF } = await import("jspdf");

  const market = resolveRoiMarket("en", null);
  const input = buildExampleRoiInput(200, market);
  const results = calculateRoi(input, market);
  const letterheadDir = path.join(root, "public/tayproasset/pdf-letterhead");
  const letterheads = {
    universal: toDataUrl(path.join(letterheadDir, "letterhead_universal.png")),
    minimal: toDataUrl(path.join(letterheadDir, "LetterHead.png")),
  };

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);
  setActivePdfLetterheads(letterheads);
  setActivePdfDocTitle("Price & ROI Calculator Report");

  const formatMoney = (n) => formatRoiPdfMoney(n, market, "en");
  const formatNumber = (n, d) => formatRoiNumber(n, market, "en", d);
  const totalSaved = results.totalMoneySavedAnnually;

  let y = drawBrandHeader(pdf, {
    title: "Price & ROI Calculator Report",
    plantName: "Test Plant",
    generatedOn: "Generated on Jun 22, 2026",
    regionLine: "Market / region: India",
  });
  logY(pdf, `after header (y~${Math.round(y)})`);

  y = drawDisclaimerBanner(pdf, "Indicative estimate only", y);
  logY(pdf, `after notice (y~${Math.round(y)})`);

  y = drawKpiStrip(pdf, y, [
    { label: "Investment", value: formatMoney(results.totalInvestmentRequired) },
    { label: "Payback", value: `${formatNumber(results.roiTimeline)} years` },
    { label: "Savings", value: formatMoney(results.totalMoneySavedAnnually) },
    { label: "20yr", value: formatMoney(1) },
  ]);
  logY(pdf, `after KPI (y~${Math.round(y)})`);

  y = drawNarrativeCallout(pdf, "Narrative " + "x".repeat(200), y);
  logY(pdf, `after narrative (y~${Math.round(y)})`);

  y = drawPaybackTimeline(
    pdf,
    y,
    "Payback",
    results.roiTimeline,
    20,
    "years",
    "Payback",
    "Horizon",
    formatNumber
  );
  logY(pdf, `after payback (y~${Math.round(y)})`);

  y = drawSavingsBreakdownChart(
    pdf,
    y,
    "Savings",
    [
      { label: "L", amount: results.annualCostLabourSaved, color: SAVINGS_CHART_COLORS.labour },
      { label: "W", amount: results.annualCostWaterSaved, color: SAVINGS_CHART_COLORS.water },
      { label: "E", amount: results.annualCostEnergyGain, color: SAVINGS_CHART_COLORS.energy },
    ],
    totalSaved,
    formatMoney
  );
  logY(pdf, `after savings chart (y~${Math.round(y)})`);

  y = drawSectionHeading(pdf, "Environmental impact", y);
  y = drawEnvironmentalCards(pdf, y, [
    { shortLabel: "Water", value: "1", detail: "L" },
    { shortLabel: "Carbon", value: "2", detail: "kg" },
  ]);
  logY(pdf, `after env cards (y~${Math.round(y)}) BEFORE addPage`);

  pdf.addPage();
  console.log(`after addPage for details: total=${pdf.getNumberOfPages()}`);
}

main();
