import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PERFORMANCE_METHODOLOGY_PATH } from "@/lib/seo/performance-methodology";

type PerformanceMethodologyLinkProps = {
  className?: string;
  label: string;
  title: string;
};

/** Inline link to the performance & test methodology page (for footnotes next to 99% claims). */
export function PerformanceMethodologyLink({
  className = "text-[#5a8f00] font-medium underline underline-offset-4 hover:no-underline",
  label,
  title,
}: PerformanceMethodologyLinkProps) {
  return (
    <Link href={PERFORMANCE_METHODOLOGY_PATH} title={title} className={className}>
      {label}
    </Link>
  );
}

/** Superscript-style footnote marker linking to methodology. */
export async function PerformanceMethodologyFootnote({
  className,
}: {
  className?: string;
}) {
  const t = await getTranslations("PerformanceMethodology");

  return (
    <sup className={className ?? "text-[0.65em] font-normal ml-0.5"}>
      <Link
        href={PERFORMANCE_METHODOLOGY_PATH}
        title={t("linkTitle")}
        className="text-[#5a8f00] underline underline-offset-2 hover:no-underline"
        aria-label={t("footnoteAriaLabel")}
      >
        *
      </Link>
    </sup>
  );
}
