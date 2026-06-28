import "server-only";

import { computeExampleScenarios } from "@/lib/roi-calculator/example-scenarios";
import { resolveRoiCalculation } from "@/lib/roi-calculator/calculate-roi-core";
import { buildExampleRoiInput } from "@/lib/roi-calculator/default-scenario";
import { resolveRoiMarket } from "@/lib/roi-calculator/market-profiles";

function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/** Deterministic ROI bands, same engine as the public calculator (India / en). */
export function buildResearchRoiReferenceTable(): string {
  const { market, scenarios } = computeExampleScenarios("en");

  const capexRows = scenarios
    .map(({ capacityMw, result }) => {
      return `<tr>
  <td>${capacityMw} MW fixed-tilt</td>
  <td>${formatInr(result.totalInvestmentRequired)}</td>
  <td>${formatInr(result.totalMoneySavedAnnually)}</td>
  <td>${result.roiTimeline.toFixed(1)} yrs</td>
  <td>${formatInr(result.net20YearSavings)}</td>
</tr>`;
    })
    .join("\n");

  const opex50Input = buildExampleRoiInput(50, market);
  opex50Input.procurementModel = "opex";
  opex50Input.cleaningCyclesPerMonth = 5;
  const opex50 = resolveRoiCalculation(opex50Input, market);
  const opexAnnual = opex50.opex?.annualOpex ?? 0;

  return `<h2>Reference economics (Taypro ROI calculator, India, illustrative)</h2>
<p>These figures come from Taypro&apos;s deterministic ROI engine for <strong>ground-mount fixed-tilt</strong> plants at default India tariffs, not from web search. Use them as directional TCO bands; site-specific soiling and labour rates will differ.</p>
<table>
<thead>
<tr><th>Scenario</th><th>CAPEX investment</th><th>Annual savings</th><th>Payback</th><th>20-yr net savings</th></tr>
</thead>
<tbody>
${capexRows}
</tbody>
</table>
<p><strong>Managed Opex (50 MW, 5 cycles/month):</strong> approx ${formatInr(opexAnnual)}/year operating cost vs manual baseline in the calculator model. Compare models in the <a href="/solar-panel-cleaning-robot-price-calculator">ROI calculator</a> and <a href="/solar-cleaning-capex-vs-opex">CAPEX vs Opex guide</a>.</p>
<p><em>Assumptions: India market profile, automatic robots, 545 Wp modules, default ground-mount tariff ${market.defaultTariffGround} ${market.currency}/kWh.</em></p>`;
}

export function buildResearchRoiPromptBlock(): string {
  const { scenarios } = computeExampleScenarios("en");
  const lines = [
    "DETERMINISTIC ROI BANDS (you may reference these exact figures; do not invent alternate payback numbers):",
  ];
  for (const { capacityMw, result } of scenarios) {
    lines.push(
      `- ${capacityMw} MW CAPEX: investment ${formatInr(result.totalInvestmentRequired)}, annual savings ${formatInr(result.totalMoneySavedAnnually)}, payback ${result.roiTimeline.toFixed(1)} years, 20-yr net ${formatInr(result.net20YearSavings)}`
    );
  }
  return lines.join("\n");
}
