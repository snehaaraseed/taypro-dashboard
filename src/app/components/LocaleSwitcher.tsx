"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, type TayproLocale } from "@/i18n/markets";
import { routing } from "@/i18n/routing";
import { trackLocaleChange } from "@/lib/analytics/track-event";

function localeCode(locale: TayproLocale): string {
  return locale.toUpperCase();
}

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as TayproLocale;
  const pathname = usePathname();
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function selectLocale(next: TayproLocale) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    trackLocaleChange({
      fromLocale: locale,
      toLocale: next,
      pagePath: pathname,
    });
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${t("label")}, ${localeCode(locale)}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="inline-flex items-center gap-1 rounded-md border border-white/25 bg-[#052638]/80 px-2 py-1.5 text-white/90 hover:border-[#A8C117]/60 hover:text-white focus:border-[#A8C117] focus:outline-none focus:ring-1 focus:ring-[#A8C117] transition-colors min-h-[36px] min-w-[36px] justify-center"
      >
        <Languages className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-[11px] font-semibold tracking-wide uppercase leading-none">
          {localeCode(locale)}
        </span>
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-label={t("label")}
        hidden={!open}
        className={`absolute right-0 z-[60] mt-1.5 min-w-[9.5rem] overflow-hidden rounded-lg border border-white/15 bg-[#052638] py-1 shadow-lg shadow-black/30 ${
          open ? "" : "hidden"
        }`}
      >
          {routing.locales.map((code) => {
            const loc = code as TayproLocale;
            const { native } = LOCALE_LABELS[loc];
            const selected = loc === locale;
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectLocale(loc)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-[#A8C117]/15 text-[#A8C117]"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <span className="w-6 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                    {localeCode(loc)}
                  </span>
                  <span className="flex-1">{native}</span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
    </div>
  );
}

