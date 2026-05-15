"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  type TayproLocale,
} from "@/i18n/markets";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as TayproLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-white/90">
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={(e) => {
          const next = e.target.value as TayproLocale;
          if (!ACTIVE_LOCALES.includes(next)) return;
          router.replace(pathname, { locale: next });
        }}
        className="rounded-md border border-white/25 bg-[#052638] px-2 py-1.5 text-sm text-white focus:border-[#A8C117] focus:outline-none focus:ring-1 focus:ring-[#A8C117]"
        aria-label={t("label")}
      >
        {routing.locales.map((code) => {
          const loc = code as TayproLocale;
          const { native, english } = LOCALE_LABELS[loc];
          return (
            <option key={code} value={code}>
              {native === english ? native : `${native} (${english})`}
            </option>
          );
        })}
      </select>
    </label>
  );
}
