import { existsSync } from "fs";
import { join } from "path";
import { ACTIVE_LOCALES, type TayproLocale } from "@/i18n/markets";
import { messageModuleStemForPath } from "@/i18n/route-message-modules";
import { routing } from "@/i18n/routing";
import { getTranslatedLocalesForModule } from "./locale-page-quality";

function resolveMessagesPagesRoot(): string {
  const candidates = [
    join(process.cwd(), "messages", "pages"),
    join(process.cwd(), "..", "messages", "pages"),
    join(process.cwd(), "..", "..", "messages", "pages"),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, "en", "home.json"))) return dir;
  }
  return candidates[0];
}

const MESSAGES_PAGES_ROOT = resolveMessagesPagesRoot();

function messageModuleForPath(internalPath: string): string | null {
  return messageModuleStemForPath(internalPath);
}

function hasDedicatedPageMessages(
  locale: TayproLocale,
  messageModule: string
): boolean {
  return getTranslatedLocalesForModule(messageModule).includes(locale);
}

const dedicatedLocalesCache = new Map<string, TayproLocale[]>();

/** Locales with dedicated page JSON (not English-only fallback). */
export function getSitemapLocalesForPath(internalPath: string): TayproLocale[] {
  const messageModule = messageModuleForPath(internalPath);
  if (!messageModule) return [...ACTIVE_LOCALES];

  const cacheKey = messageModule;
  const cached = dedicatedLocalesCache.get(cacheKey);
  if (cached) return cached;

  const locales: TayproLocale[] = [routing.defaultLocale as TayproLocale];
  for (const locale of ACTIVE_LOCALES) {
    if (locale === routing.defaultLocale) continue;
    if (hasDedicatedPageMessages(locale, messageModule)) {
      locales.push(locale);
    }
  }

  dedicatedLocalesCache.set(cacheKey, locales);
  return locales;
}
