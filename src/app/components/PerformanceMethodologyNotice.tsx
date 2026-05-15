import { PerformanceMethodologyLink } from "./PerformanceMethodologyLink";

type PerformanceMethodologyNoticeProps = {
  variant?: "light" | "dark";
  className?: string;
};

/** Compact disclosure block placed near pages that cite 99%+ dust-removal figures. */
export function PerformanceMethodologyNotice({
  variant = "light",
  className = "",
}: PerformanceMethodologyNoticeProps) {
  const styles =
    variant === "dark"
      ? "border-white/20 bg-white/5 text-white/90"
      : "border-gray-200 bg-[#f8fafb] text-[#27415c]";

  return (
    <aside
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles} ${className}`}
      aria-label="Performance claim disclosure"
    >
      <p>
        <strong className={variant === "dark" ? "text-white" : "text-[#052638]"}>
          About performance figures:
        </strong>{" "}
        References to &ldquo;99%+&rdquo; on this site describe{" "}
        <em>dust removed from the module surface per automated pass or cycle</em>
        , not a guarantee of panel conversion efficiency or total plant output.
        Recovery of energy lost to soiling depends on baseline soiling, cleaning
        cadence, weather, and plant design. See our{" "}
        <PerformanceMethodologyLink
          className={
            variant === "dark"
              ? "text-[#A8C117] font-medium underline-offset-4 hover:underline"
              : undefined
          }
        />{" "}
        for how Taypro validates and quotes results.
      </p>
    </aside>
  );
}
