import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

globalThis.fetch = async (input) => {
  const rel = String(input).split("?")[0].replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "");
  const buf = fs.readFileSync(path.join(root, "public", rel));
  return { ok: true, async arrayBuffer() { return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength); } };
};

const toDataUrl = (f) => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;

async function main() {
  const { registerRoiPdfFonts } = await import("../src/lib/roi-calculator/pdf-fonts.ts");
  const { calculateRoi } = await import("../src/lib/roi-calculator/calculate-roi-core.ts");
  const { resolveRoiMarket } = await import("../src/lib/roi-calculator/market-profiles.ts");
  const { buildDefaultInteractiveFormData } = await import("../src/lib/roi-calculator/default-scenario.ts");
  const { formatRoiPdfMoney, formatRoiNumber } = await import("../src/lib/roi-calculator/format-roi.ts");
  const visuals = await import("../src/lib/roi-calculator/pdf-visuals.ts");
  const { default: jsPDF } = await import("jspdf");

  const en = JSON.parse(fs.readFileSync(path.join(root, "messages/pages/en/price-calculator.json"), "utf8")).PriceCalculatorPage.calculator;
  const market = resolveRoiMarket("en", null);
  const form = buildDefaultInteractiveFormData(market);
  const results = calculateRoi({ ...form, moduleCapacityWp: form.moduleCapacity, plantType: form.plantType, installationType: form.installationType, automationLevel: form.automationLevel }, market);
  const net20 = results.totalMoneySavedAnnually * 20 * 0.9 - results.totalInvestmentRequired;
  const plantLabel = en.pdfDefaultPlantNameMw.replace("{capacity}", formatRoiNumber(form.plantCapacityMW, market, "en"));
  const pdfMoney = (n) => formatRoiPdfMoney(n, market, "en");
  const narrative = en.pdfSummaryNarrative.replace("{payback}", formatRoiNumber(results.roiTimeline, market, "en")).replace("{annualSavings}", pdfMoney(results.totalMoneySavedAnnually)).replace("{investment}", pdfMoney(results.totalInvestmentRequired)).replace("{net20YearSavings}", pdfMoney(net20, market, "en")).replace("{years}", en.yearsUnit);

  visuals.setActivePdfLetterheads({ universal: toDataUrl(path.join(root, "public/tayproasset/pdf-letterhead/letterhead_universal.png")), minimal: toDataUrl(path.join(root, "public/tayproasset/pdf-letterhead/LetterHead.png")) });
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);

  let y = visuals.drawBrandHeader(pdf, { title: en.pdfTitle, plantName: plantLabel, generatedOn: en.pdfGeneratedOn.replace("{date}", "Jun 22, 2026"), regionLine: "Market / region: India" });
  console.log("header", y);
  y = visuals.drawDisclaimerBanner(pdf, en.pdfDisclaimerShort, y); console.log("notice", y);
  y = visuals.drawKpiStrip(pdf, y, [{ label: en.highlightInvestment, value: pdfMoney(results.totalInvestmentRequired) }, { label: en.paybackTimeline, value: "1.15 years" }, { label: en.annualSavings, value: pdfMoney(results.totalMoneySavedAnnually) }, { label: en.result20YearNetSavings, value: pdfMoney(net20, market, "en") }]); console.log("kpi", y);
  y = visuals.drawNarrativeCallout(pdf, narrative, y); console.log("narrative", y);
  y = visuals.drawPaybackTimeline(pdf, y, en.pdfChartPaybackTitle, results.roiTimeline, 20, en.yearsUnit, en.pdfChartPaybackLabel, en.pdfChartHorizonLabel, (n, d) => formatRoiNumber(n, market, "en", d)); console.log("payback", y);
  y = visuals.drawSavingsBreakdownChart(pdf, y, en.pdfChartSavingsTitle, [{ label: "L", amount: results.annualCostLabourSaved, color: [0, 51, 73] }, { label: "W", amount: results.annualCostWaterSaved, color: [0, 102, 102] }, { label: "E", amount: results.annualCostEnergyGain, color: [140, 198, 63] }], results.totalMoneySavedAnnually, pdfMoney); console.log("savings", y);
  y = visuals.drawSectionHeading(pdf, en.pdfEnvironmentalImpact, y);
  y = visuals.drawEnvironmentalCards(pdf, y, [{ shortLabel: "w", value: formatRoiNumber(results.waterSavedAnnually, market, "en"), detail: en.pdfEnvWaterDetail }, { shortLabel: "c", value: formatRoiNumber(results.annualCarbonSavings, market, "en"), detail: en.pdfEnvCarbonDetail }]);
  console.log("env end", y, "page", pdf.getCurrentPageInfo().pageNumber, "bottom", visuals.PDF_CONTENT_BOTTOM_COVER);
}

main();
