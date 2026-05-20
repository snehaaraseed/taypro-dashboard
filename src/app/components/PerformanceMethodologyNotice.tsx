import { getTranslations } from "next-intl/server";
import { PerformanceMethodologyLink } from "./PerformanceMethodologyLink";

type PerformanceMethodologyNoticeProps = {
  variant?: "light" | "dark";
  className?: string;
};

/** Compact disclosure block placed near pages that cite 99%+ dust-removal figures. */
export async function PerformanceMethodologyNotice({
  variant = "light",
  className = "",
}: PerformanceMethodologyNoticeProps) {
  const t = await getTranslations("PerformanceMethodology");

  const styles =
    variant === "dark"
      ? "border-white/20 bg-white/5 text-white/90"
      : "border-gray-200 bg-[#f8fafb] text-[#27415c]";

  const linkClassName =
    variant === "dark"
      ? "text-[#A8C117] font-medium underline-offset-4 hover:underline"
      : undefined;

  return (
    <aside
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles} ${className}`}
      aria-label={t("noticeAriaLabel")}
    >
      <p>
        <strong className={variant === "dark" ? "text-white" : "text-[#052638]"}>
          {t("noticeStrong")}
        </strong>{" "}
        {t("noticeBeforeEm")}
        <em>{t("noticeEm")}</em>
        {t("noticeBeforeLink")}
        <PerformanceMethodologyLink
          className={linkClassName}
          label={t("linkLabel")}
          title={t("linkTitle")}
        />
        {t("noticeAfterLink")}
      </p>
    </aside>
  );
}
