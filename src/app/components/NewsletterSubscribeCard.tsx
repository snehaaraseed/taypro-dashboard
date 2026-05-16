"use client";

import { useTranslations } from "next-intl";

interface NewsletterSubscribeCardProps {
  className?: string;
  compact?: boolean;
}

export function NewsletterSubscribeCard({
  className = "",
  compact = false,
}: NewsletterSubscribeCardProps) {
  const t = useTranslations("BlogPage.newsletter");

  const wrapperClass = compact
    ? "rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
    : "rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm";

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div className="rounded-lg bg-gradient-to-r from-[#f5f8fb] to-[#eef3f8] border border-gray-100 px-3 py-2.5 mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 items-center rounded-full bg-[#052638] px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            {t("badge")}
          </span>
          <span className="text-[11px] text-[#0c3c57]/80 font-medium">
            {t("frequency")}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#052638] mt-2 leading-snug">
          {t("title")}
        </p>
        <p className="text-xs text-gray-600 mt-1">{t("description")}</p>
      </div>

      <div
        className={`w-full rounded-lg overflow-hidden bg-white border border-gray-100 ${
          compact ? "h-[240px]" : "h-[255px]"
        }`}
      >
        <iframe
          src="https://app.taypro.in/newsletter"
          title={t("iframeTitle")}
          className="w-full h-full"
          style={{
            border: "none",
            marginTop: "-28px",
            height: "calc(100% + 28px)",
          }}
        />
      </div>
    </div>
  );
}