import { getTranslations } from "next-intl/server";
import { computeExampleScenarios } from "@/lib/roi-calculator/default-scenario";
import {
  formatRoiCurrency,
  formatRoiNumber,
} from "@/lib/roi-calculator/format-roi";

type RoiExampleScenariosProps = {
  locale: string;
};

export async function RoiExampleScenarios({ locale }: RoiExampleScenariosProps) {
  const t = await getTranslations({
    locale,
    namespace: "PriceCalculatorPage.exampleScenarios",
  });
  const tCalc = await getTranslations({
    locale,
    namespace: "PriceCalculatorPage.calculator",
  });
  const { market, scenarios } = computeExampleScenarios(locale);

  return (
    <section
      className="mt-8 max-w-4xl mx-auto"
      aria-labelledby="roi-example-scenarios-heading"
    >
      <h2
        id="roi-example-scenarios-heading"
        className="text-[#052638] font-semibold text-xl sm:text-2xl mb-2 text-center"
      >
        {t("heading")}
      </h2>
      <p className="text-[#5c6f82] text-sm sm:text-base text-center max-w-2xl mx-auto mb-6 leading-relaxed">
        {t("subheading")}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <article
            key={scenario.capacityMw}
            className="rounded-xl border border-gray-200 bg-[#f8fafb] p-5 shadow-sm"
          >
            <h3 className="text-[#052638] font-semibold text-lg mb-4">
              {t("scenarioTitle", { capacityMw: scenario.capacityMw })}
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                <dt className="text-[#27415c]">{tCalc("highlightInvestment")}</dt>
                <dd className="text-[#052638] font-semibold text-right">
                  {formatRoiCurrency(
                    scenario.result.totalInvestmentRequired,
                    market,
                    locale
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                <dt className="text-[#27415c]">{tCalc("paybackTimeline")}</dt>
                <dd className="text-[#052638] font-semibold text-right">
                  {formatRoiNumber(scenario.result.roiTimeline, market, locale)}{" "}
                  {tCalc("yearsUnit")}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                <dt className="text-[#27415c]">{tCalc("annualSavings")}</dt>
                <dd className="text-[#052638] font-semibold text-right">
                  {formatRoiCurrency(
                    scenario.result.totalMoneySavedAnnually,
                    market,
                    locale
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#27415c]">{tCalc("resultAnnualisedRoi")}</dt>
                <dd className="text-[#052638] font-semibold text-right">
                  {formatRoiNumber(
                    scenario.result.annualisedROI,
                    market,
                    locale
                  )}{" "}
                  %
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[#5c6f82] text-xs leading-relaxed">
              {t("assumptions", {
                capacityMw: scenario.capacityMw,
                tariff: scenario.input.electricityTariff,
                currency: market.currency,
                moduleWp: scenario.input.moduleCapacityWp,
              })}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-center text-[#5c6f82] text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
        {t("disclaimer")}
      </p>
    </section>
  );
}
