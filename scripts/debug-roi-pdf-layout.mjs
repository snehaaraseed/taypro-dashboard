import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

function toDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

// Patch fetch for letterhead loading in Node
const letterheadDir = path.join(root, "public/tayproasset/pdf-letterhead");
globalThis.fetch = async (input) => {
  const url = String(input).split("?")[0];
  const rel = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "");
  const filePath = path.join(root, "public", rel);
  if (!fs.existsSync(filePath)) {
    return { ok: false, status: 404 };
  }
  const buf = fs.readFileSync(filePath);
  return {
    ok: true,
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  };
};

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

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const market = resolveRoiMarket("en", null);
  const input = buildExampleRoiInput(200, market);
  const results = calculateRoi(input, market);
  const moduleCount = Math.round((input.plantCapacityMW * 1000) / (input.moduleCapacityWp / 1000));
  const net20YearSavings = results.totalMoneySavedAnnually * 20 * 0.9 - results.totalInvestmentRequired;

  const letterheads = {
    universal: toDataUrl(path.join(letterheadDir, "letterhead_universal.png")),
    minimal: toDataUrl(path.join(letterheadDir, "LetterHead.png")),
  };

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);

  const labels = {
    title: "Price & ROI Calculator Report",
    generatedOn: "Generated on Jun 22, 2026",
    generatedFor: "Generated for: Test Plant",
    plantName: "Test Plant",
    region: "Market / region",
    regionName: "India",
    disclaimerShort:
      "Indicative estimate only — not a formal Taypro quote. Actual results vary by site.",
    summaryNarrative: "Summary narrative placeholder.",
    inputs: "Your inputs",
    assumptions: "Key modelling assumptions",
    environmentalImpact: "Environmental impact",
    disclaimerHeading: "Disclaimer",
    disclaimerBody:
      "All investment, payback, and savings figures in this report are directional estimates based on representative Taypro deployment assumptions for your region (tariffs, labour, water, yield, and soiling recovery). They are not a formal quotation or performance guarantee. Actual payback varies with layout, soiling, cleaning cycle cadence, tracker stow, fleet sizing, and whether you choose CAPEX purchase or Opex. Do not use this PDF as the sole basis for procurement or financial approval without a site-specific Taypro model.",
    nextSteps: "Next steps",
    nextStepsBody:
      "Share this estimate with your O&M or procurement team, then contact Taypro for a site-specific robot count, cycle plan, and formal quotation.",
    contactHeading: "Talk to Taypro",
    contactWebsite: "Website",
    contactEmail: "Email",
    contactPhone: "Phone",
    websiteUrl: "https://taypro.in",
    salesEmail: "sales@taypro.in",
    salesPhone: "+91 80438 43569",
    parameter: "Parameter",
    value: "Value",
    highlightInvestment: "Total Investment Required",
    paybackTimeline: "Return On Investment Timeline",
    annualSavings: "Total Money Saved Annually",
    yearsUnit: "years",
    result20YearNetSavings: "20-Year Net Savings",
    pdfCarbonUnit: "kg CO2/year",
    pdfGridEmissionUnit: "kg CO2/kWh",
    litersUnit: "liters",
    assumptionModuleCount: "Estimated module count",
    assumptionCleaningCycles: "Cleaning cycles per year",
    assumptionLabourPerModule: "Labour cost per module per cycle",
    assumptionWaterPerModule: "Water per module per cycle",
    assumptionSpecificYield: "Specific yield",
    assumptionSoilingRecovery: "Soiling recovery factor",
    assumptionGridEmission: "Grid emission factor",
    assumption20YearRetention: "20-year savings retention",
    net20YearSavingsFormatted: formatRoiPdfMoney(net20YearSavings, market, "en"),
    pdfChartSavingsTitle: "Annual savings breakdown",
    pdfChartPaybackTitle: "Payback timeline",
    pdfChartLabourShort: "Labour",
    pdfChartWaterShort: "Water",
    pdfChartEnergyShort: "Energy",
    pdfChartPaybackLabel: "Est. payback",
    pdfChartHorizonLabel: "Horizon",
    pdfEnvWaterShort: "Water saved",
    pdfEnvCarbonShort: "Carbon saved",
    pdfEnvWaterDetail: "Liters / year",
    pdfEnvCarbonDetail: "kg CO2 / year",
  };

  const en = JSON.parse(
    fs.readFileSync(path.join(root, "messages/pages/en/price-calculator.json"), "utf8")
  ).PriceCalculatorPage.calculator;
  const payback = formatRoiNumber(results.roiTimeline, market, "en");
  const annualSavings = formatRoiPdfMoney(results.totalMoneySavedAnnually, market, "en");
  const investment = formatRoiPdfMoney(results.totalInvestmentRequired, market, "en");
  labels.summaryNarrative = en.pdfSummaryNarrative
    .replace("{payback}", payback)
    .replace("{annualSavings}", annualSavings)
    .replace("{investment}", investment)
    .replace("{net20YearSavings}", labels.net20YearSavingsFormatted)
    .replace("{years}", en.yearsUnit);
  labels.disclaimerBody = en.pdfDisclaimerBody;
  labels.nextStepsBody = en.pdfNextStepsBody;
  labels.disclaimerShort = en.pdfDisclaimerShort;

  const inputRows = [
    { label: en.plantName, value: "Test Plant" },
    { label: en.plantType, value: "Ground mount" },
    { label: en.installationType, value: "Fixed tilt" },
    { label: en.automationLevel, value: "Automatic" },
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

  const out = path.join(root, "tmp-roi-debug.pdf");
  fs.writeFileSync(out, Buffer.from(pdf.output("arraybuffer")));

  const pages = pdf.getNumberOfPages();
  console.log("Pages:", pages);
  console.log("Written:", out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
