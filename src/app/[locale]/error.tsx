"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-white">
      <div className="max-w-lg w-full text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#A8C117] mb-3">
          Taypro
        </p>
        <h1 className="text-3xl font-semibold text-[#052638] mb-3">
          {t("errorTitle")}
        </h1>
        <p className="text-gray-600 mb-8">{t("errorBody")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-[#052638] px-5 py-3 text-sm font-medium text-white hover:bg-[#0c3d56]"
          >
            {t("errorReload")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-[#052638] hover:bg-gray-50"
          >
            {t("breadcrumbHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
