import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  const { calculateRoi } = await import("../src/lib/roi-calculator/calculate-roi-core.ts");
  const { resolveRoiMarket } = await import("../src/lib/roi-calculator/market-profiles.ts");
  const { buildDefaultInteractiveFormData } = await import(
    "../src/lib/roi-calculator/default-scenario.ts"
  );
  const { formatRoiPdfMoney, formatRoiNumber } = await import(
    "../src/lib/roi-calculator/format-roi.ts"
  );
  const { default: jsPDF } = await import("jspdf");

  const en = JSON.parse(
    fs.readFileSync(path.join(root, "messages/pages/en/price-calculator.json"), "utf8")
  ).PriceCalculatorPage.calculator;
  const market = resolveRoiMarket("en", null);
  const form = buildDefaultInteractiveFormData(market);
  const results = calculateRoi(
    {
      ...form,
      moduleCapacityWp: form.moduleCapacity,
      plantType: form.plantType,
      installationType: form.installationType,
      automationLevel: form.automationLevel,
    },
    market
  );
  const moduleCount = Math.round((form.plantCapacityMW * 1000) / (form.moduleCapacity / 1000));
  const net20 = results.net20YearSavings;
  const plantLabel = "tesadada";
  const pdfMoney = (n) => formatRoiPdfMoney(n, market, "en");
  const generatedOn = new Intl.DateTimeFormat(market.formatLocale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const letterheadDir = path.join(root, "public/tayproasset/pdf-letterhead");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await registerRoiPdfFonts(pdf);

  const orig = pdf.text.bind(pdf);
  pdf.text = function (text, ...rest) {
    const p = pdf.getCurrentPageInfo().pageNumber;
    const label = String(Array.isArray(text) ? text[0] : text).slice(0, 48);
    if (
      label.includes("Inputs") ||
      label.includes("Key modelling") ||
      label.includes("Next steps") ||
      label.includes("Disclaimer") ||
      label.includes("Environmental")
    ) {
      console.log(`TEXT p${p}`, label, "y", rest[rest.length - 2] ?? rest[0]);
    }
    return orig(text, ...rest);
  };

  buildRoiPdfDocument({
    pdf,
    autoTable: () => {},
    letterheads: {
      universal: toDataUrl(path.join(letterheadDir, "letterhead_universal.png")),
      minimal: toDataUrl(path.join(letterheadDir, "LetterHead.png")),
    },
    market,
    results,
    moduleCount,
    soilingRecoveryPercent: "85%",
    formatMoney: pdfMoney,
    formatNumber: (n, d) => formatRoiNumber(n, market, "en", d),
    labels: {
      title: en.pdfTitle,
      generatedOn: en.pdfGeneratedOn.replace("{date}", generatedOn),
      generatedFor: en.pdfGeneratedFor.replace("{name}", plantLabel),
      plantName: plantLabel,
      plantDetail: `${en.plantTypeGroundMount} · ${formatRoiNumber(form.plantCapacityMW, market, "en")} MW`,
      region: en.pdfRegion,
      regionName: en.regionIndia,
      disclaimerShort: en.pdfDisclaimerShort,
      summaryNarrative: en.pdfSummaryNarrative
        .replace("{payback}", formatRoiNumber(results.roiTimeline, market, "en"))
        .replace("{annualSavings}", pdfMoney(results.totalMoneySavedAnnually))
        .replace("{investment}", pdfMoney(results.totalInvestmentRequired))
        .replace("{net20YearSavings}", pdfMoney(net20, market, "en"))
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
      contactPhone: en.pdfContactPhone,
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
      net20YearSavingsFormatted: pdfMoney(net20, market, "en"),
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
    },
    inputRows: [
      { label: en.plantName, value: plantLabel },
      { label: en.plantType, value: en.plantTypeGroundMount },
      { label: en.installationType, value: en.installationFixedTilt },
      { label: en.automationLevel, value: en.automationAutomatic },
      { label: en.pdfPlantCapacityMw, value: String(form.plantCapacityMW) },
      {
        label: `${en.pdfElectricityTariff} (INR/kWh)`,
        value: String(form.electricityTariff),
      },
      { label: en.pdfModuleCapacity, value: String(form.moduleCapacity) },
    ],
  });

  console.log("total pages", pdf.getNumberOfPages());
}

main();
