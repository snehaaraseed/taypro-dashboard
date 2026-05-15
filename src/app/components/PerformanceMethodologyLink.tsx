import Link from "next/link";
import {
  PERFORMANCE_METHODOLOGY_PATH,
  PERFORMANCE_METHODOLOGY_TITLE,
} from "@/lib/seo/performance-methodology";

type PerformanceMethodologyLinkProps = {
  className?: string;
  /** Shown link text; defaults to a short label. */
  label?: string;
};

/** Inline link to the performance & test methodology page (for footnotes next to 99% claims). */
export function PerformanceMethodologyLink({
  className = "text-[#5a8f00] font-medium underline-offset-4 hover:underline",
  label = "performance & test methodology",
}: PerformanceMethodologyLinkProps) {
  return (
    <Link
      href={PERFORMANCE_METHODOLOGY_PATH}
      title={PERFORMANCE_METHODOLOGY_TITLE}
      className={className}
    >
      {label}
    </Link>
  );
}

/** Superscript-style footnote marker linking to methodology. */
export function PerformanceMethodologyFootnote({
  className,
}: {
  className?: string;
}) {
  return (
    <sup className={className ?? "text-[0.65em] font-normal ml-0.5"}>
      <Link
        href={PERFORMANCE_METHODOLOGY_PATH}
        title={PERFORMANCE_METHODOLOGY_TITLE}
        className="text-[#5a8f00] hover:underline underline-offset-2"
        aria-label={`${PERFORMANCE_METHODOLOGY_TITLE} (footnote)`}
      >
        *
      </Link>
    </sup>
  );
}
