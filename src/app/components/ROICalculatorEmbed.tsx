"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const ROITayproCalculator = dynamic(() => import("@/app/components/ROICalculator"), {
  loading: () => <ROICalculatorLoading />,
});

function ROICalculatorLoading() {
  const t = useTranslations("PriceCalculatorPage.embed");
  return (
    <div
      className="min-h-[320px] flex items-center justify-center rounded-xl bg-[#052638]/5"
      aria-busy="true"
      aria-label={t("loadingAria")}
    >
      <p className="animate-pulse text-[#27415c] text-sm">{t("loading")}</p>
    </div>
  );
}

type ROICalculatorEmbedProps = {
  className?: string;
  /** Show directional-estimate disclaimer (dedicated calculator page) */
  showDisclaimer?: boolean;
};

/**
 * Consistent embedded ROI calculator shell, matches home & dedicated calculator page.
 * Always place inside a `<Container>` on the host page.
 */
export function ROICalculatorEmbed({
  className = "",
  showDisclaimer = false,
}: ROICalculatorEmbedProps) {
  const t = useTranslations("PriceCalculatorPage.embed");

  return (
    <div className={className}>
      <div className="max-w-4xl mx-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg ring-1 ring-gray-200/80 overflow-hidden">
        <ROITayproCalculator hideTitle />
      </div>
      {showDisclaimer ? (
        <p className="mt-4 text-center text-[#5c6f82] text-sm max-w-2xl mx-auto leading-relaxed">
          <strong className="text-[#27415c]">{t("disclaimerNote")}</strong>{" "}
          {t("disclaimerBody")}
        </p>
      ) : null}
    </div>
  );
}

export default ROICalculatorEmbed;
