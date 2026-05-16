import type { TayproLocale } from "./markets";

const LOCALE_TAGS: Record<TayproLocale, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ar: "ar",
  ja: "ja-JP",
  bn: "bn-BD",
};

export function formatLocaleDate(
  locale: string,
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const tag = LOCALE_TAGS[locale as TayproLocale] ?? "en-IN";
  try {
    return new Date(iso).toLocaleDateString(tag, options);
  } catch {
    return iso;
  }
}

export function formatLocaleDateShort(
  locale: string,
  iso: string
): string {
  return formatLocaleDate(locale, iso, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
