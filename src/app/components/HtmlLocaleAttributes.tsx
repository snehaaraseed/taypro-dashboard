"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { LOCALE_LABELS, type TayproLocale } from "@/i18n/markets";

/** Syncs <html lang/dir> after hydration without forcing dynamic SSR in layouts. */
export function HtmlLocaleAttributes() {
  const locale = useLocale() as TayproLocale;
  const { dir } = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
