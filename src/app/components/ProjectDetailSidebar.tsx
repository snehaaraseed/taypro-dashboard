"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import OpenLeadModalButton from "./OpenLeadModalButton";

export function ProjectDetailSidebar() {
  const t = useTranslations("ProjectDetailPage");

  return (
    <div className="sticky top-24 space-y-5">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#052638] to-[#0c3c57] p-6 text-white">
        <p className="text-xs uppercase tracking-wider text-[#A8C117] mb-2">
          {t("sidebarEyebrow")}
        </p>
        <h3 className="text-xl font-semibold leading-tight mb-3">
          {t("sidebarTitle")}
        </h3>
        <p className="text-sm text-slate-100 mb-5 leading-relaxed">
          {t("sidebarBody")}
        </p>
        <OpenLeadModalButton
          topic={t("leadTopic")}
          title={t("leadTitle")}
          subtitle={t("leadSubtitle")}
          className="inline-flex w-full items-center justify-center rounded-md bg-[#A8C117] px-4 py-2.5 text-sm font-semibold text-[#052638] hover:bg-[#bfd63a] transition-colors"
        >
          {t("leadCta")}
        </OpenLeadModalButton>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wider text-[#A8C117] mb-2">
          {t("sidebarToolsEyebrow")}
        </p>
        <h3 className="text-base font-semibold text-[#052638] mb-2">
          {t("sidebarToolsTitle")}
        </h3>
        <p className="text-sm text-[#27415c] mb-4 leading-relaxed">
          {t("sidebarToolsBody")}
        </p>
        <Link
          href="/solar-panel-cleaning-robot-price-calculator"
          className="inline-flex w-full items-center justify-center rounded-md border border-[#052638] px-4 py-2.5 text-sm font-medium text-[#052638] hover:bg-[#052638] hover:text-white transition-colors"
        >
          {t("sidebarToolsCta")}
        </Link>
      </div>

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5a8f00] hover:text-[#052638] transition-colors px-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {t("backToProjects")}
      </Link>
    </div>
  );
}
