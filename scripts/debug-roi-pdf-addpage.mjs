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

async function main() {
  const { registerRoiPdfFonts } = await import("../src/lib/roi-calculator/pdf-fonts.ts");
  const { buildRoiPdfDocument } = await import("../src/lib/roi-calculator/build-roi-pdf.ts");
  const { calculateRoi } = await import("../src/lib/roi-calculator/calculate-roi-core.ts");
  const { resolveRoiMarket } = await import("../src/lib/roi-calculator/market-profiles.ts");
  const { buildExampleRoiInput } = await import("../src/lib/roi-calculator/default-scenario.ts");
  const { formatRoiPdfMoney, formatRoiNumber } = await import("../src/lib/roi-calculator/format-roi.ts");
  const visuals = await import("../src/lib/roi-calculator/pdf-visuals.ts");
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const origAddPage = jsPDF.prototype.addPage;
  jsPDF.prototype.addPage = function (...args) {
    console.log("addPage() -> total will be", this.getNumberOfPages() + 1);
    console.trace("  at");
    return origAddPage.apply(this, args);
  };

  const market = resolveRoiMarket("en", null);
  const input = buildExampleRoiInput(200, market);
  const results = calculateRoi(input, market);
  const moduleCount = Math.round((input.plantCapacityMW * 1000) / (input.moduleCapacityWp / 1000));
  const net20YearSavings =
    results.totalMoneySavedAnnually * 20 * 0.9 - results.totalInvestmentRequired;

  const en = JSON.parse(
    fs.readFileSync(path.join(root, "messages/pages/en/price-calculator.json"), "utf8")
  ).PriceCalculatorPage.calculator;

  const letterheadDir = path.join(root, "public/tayproasset/pdf-letterhead");
  const letterheads = {
    universal: toDataUrl(path.join(letterheadDir, "letterhead_universal.png")),
    minimal: toDataUrl(path.join(letterheadDir, "LetterHead.png")),
  };

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);

  const payback = formatRoiNumber(results.roiTimeline, market, "en");
  const labels = {
    title: en.pdfTitle,
    generatedOn: "Generated on Jun 22, 2026 at 3:45 PM",
    generatedFor: "Generated for: Jaisalmer Solar Park",
    plantName: "Jaisalmer Solar Park",
    region: en.pdfRegion,
    regionName: "India",
    disclaimerShort: en.pdfDisclaimerShort,
    summaryNarrative: en.pdfSummaryNarrative
      .replace("{payback}", payback)
      .replace("{annualSavings}", formatRoiPdfMoney(results.totalMoneySavedAnnually, market, "en"))
      .replace("{investment}", formatRoiPdfMoney(results.totalInvestmentRequired, market, "en"))
      .replace("{net20YearSavings}", formatRoiPdfMoney(net20YearSavings, market, "en"))
      .replace("{years}", en.yearsUnit),
    inputs: en.pdfInputs,
    assumptions: en.pdfAssumptions,
    environmentalImpact: en.pdfEnvironmentalImpact,
    disclaimerHeading: en.pdfDisclaimerHeading,
    disclaimerBody: en.pdfDisclaimerBody,
    nextSteps: en.pdfNextSteps,
    nextStepsBody: en.pdfNextStepsBody,
    contactHeading: en.pdfContactHeading,
    contactWebsite: en.pdfContactWebsite,
    contactEmail: en.pdfContactEmail,
    contactPhone: en.pdfContactContactPhone ?? en.pdfContactPhone,
    websiteUrl: "taypro.in",
    salesEmail: "sales@taypro.in",
    salesPhone: "+91 80438 43569",
    parameter: en.pdfParameter,
    value: en.pdfValue,
    highlightInvestment: en.highlightInvestment,
    paybackTimeline: en.paybackTimeline,
    annualSavings: en.annualSavings,
    yearsUnit: en.yearsUnit,
    result20YearNetSavings: en.result20YearNetSavings,
    pdfCarbonUnit: en.pdfCarbonUnit,
    pdfGridEmissionUnit: en.pdfGridEmissionUnit,
    litersUnit: en.litersUnit,
    assumptionModuleCount: en.pdfAssumptionModuleCount,
    assumptionCleaningCycles: en.pdfAssumptionCleaningCycles,
    assumptionLabourPerModule: en.pdfAssumptionLabourPerModule,
    assumptionWaterPerModule: en.pdfAssumptionWaterPerModule,
    assumptionSpecificYield: en.pdfAssumptionSpecificYield,
    assumptionSoilingRecovery: en.pdfAssumptionSoilingRecovery,
    assumptionGridEmission: en.pdfAssumptionGridEmission,
    assumption20YearRetention: en.pdfAssumption20YearRetention,
    net20YearSavingsFormatted: formatRoiPdfMoney(net20YearSavings, market, "en"),
    pdfChartSavingsTitle: en.pdfChartSavingsTitle,
    pdfChartPaybackTitle: en.pdfChartPaybackTitle,
    pdfChartLabourShort: en.pdfChartLabourShort,
    pdfChartWaterShort: en.pdfChartWaterShort,
    pdfChartEnergyShort: en.pdfChartEnergyShort,
    pdfChartPaybackLabel: en.pdfChartPaybackLabel,
    pdfChartHorizonLabel: en.pdfChartHorizonLabel,
    pdfEnvWaterShort: en.pdfEnvWaterShort,
    pdfEnvCarbonShort: en.pdfEnvCarbonShort,
    pdfEnvWaterDetail: en.pdfEnvWaterDetail,
    pdfEnvCarbonDetail: en.pdfEnvCarbonDetail,
  };

  const inputRows = [
    { label: en.plantName, value: "Jaisalmer Solar Park" },
    { label: en.plantType, value: en.plantTypeGroundMount },
    { label: en.installationType, value: en.installationFixedTilt },
    { label: en.automationLevel, value: en.automationAutomatic },
    { label: en.pdfPlantCapacityMw, value: "200" },
    { label: `${en.pdfElectricityTariff} (${market.currency}/kWh)`, value: "4.5" },
    { label: en.pdfModuleCapacity, value: "550" },
  ];

  buildRoiPdfDocument({
    pdf,
    autoTable,
    letterheads,
    market,
    results,
    moduleCount,
    soilingRecoveryPercent: "85%",
    formatMoney: (n) => formatRoiPdfMoney(n, market, "en"),
    formatNumber: (n, d) => formatRoiNumber(n, market, "en", d),
    labels,
    inputRows,
  });

  console.log("Final pages:", pdf.getNumberOfPages());
  console.log(
    "BOTTOM limits: cover",
    visuals.PDF_CONTENT_BOTTOM_COVER,
    "inner",
    visuals.PDF_CONTENT_BOTTOM_INNER
  );
}

main();
