"use client";

import dynamic from "next/dynamic";

const ROITayproCalculator = dynamic(() => import("@/app/components/ROICalculator"), {
  loading: () => (
    <div
      className="min-h-[320px] flex items-center justify-center rounded-xl bg-[#052638]/5"
      aria-busy="true"
      aria-label="Loading calculator"
    >
      <p className="animate-pulse text-[#27415c] text-sm">Loading calculator…</p>
    </div>
  ),
  ssr: false,
});

type ROICalculatorEmbedProps = {
  className?: string;
  /** Show directional-estimate disclaimer (dedicated calculator page) */
  showDisclaimer?: boolean;
};

/**
 * Consistent embedded ROI calculator shell — matches home & dedicated calculator page.
 * Always place inside a `<Container>` on the host page.
 */
export function ROICalculatorEmbed({
  className = "",
  showDisclaimer = false,
}: ROICalculatorEmbedProps) {
  return (
    <div className={className}>
      <div className="max-w-4xl mx-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg ring-1 ring-gray-200/80 overflow-hidden">
        <ROITayproCalculator hideTitle />
      </div>
      {showDisclaimer ? (
        <p className="mt-4 text-center text-[#5c6f82] text-sm max-w-2xl mx-auto leading-relaxed">
          <strong className="text-[#27415c]">Note:</strong> ROI is based on
          representative Taypro deployment assumptions. Contact us for a formal
          quote and plant-specific model.
        </p>
      ) : null}
    </div>
  );
}

export default ROICalculatorEmbed;
