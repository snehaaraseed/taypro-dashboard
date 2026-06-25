"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
      <div className="rounded-lg bg-gradient-to-r from-[#f5f8fb] to-[#eef3f8] border border-gray-100 px-3 py-2.5 mb-3">
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

      <Link
        href="/contact"
        className="inline-flex w-full items-center justify-center rounded-md bg-[#052638] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0c3d56]"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
