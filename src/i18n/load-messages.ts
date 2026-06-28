import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { CLIENT_MESSAGE_PAGE_FILES } from "./client-message-namespaces";
import { pageModulesForPathname } from "./route-message-modules";

/** Resolve messages dir when PM2 cwd is `.next/standalone`. */
function resolveMessagesRoot(): string {
  const candidates = [
    join(process.cwd(), "messages"),
    join(process.cwd(), "..", "messages"),
    join(process.cwd(), "..", "..", "messages"),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, "en.json"))) return dir;
  }
  return candidates[0];
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (
      sv &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      out[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>
      );
    } else {
      out[key] = sv;
    }
  }
  return out;
}

async function mergePageModules(
  messages: Record<string, unknown>,
  pagesDir: string,
  label: string
): Promise<Record<string, unknown>> {
  let merged = messages;
  try {
    const files = await readdir(pagesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();
    for (const file of jsonFiles) {
      try {
        const pageRaw = await readFile(join(pagesDir, file), "utf8");
        const pageMessages = JSON.parse(pageRaw) as Record<string, unknown>;
        merged = deepMerge(merged, pageMessages);
      } catch (err) {
        console.error(
          `[i18n] Skipping invalid page messages ${label}/${file}:`,
          err instanceof Error ? err.message : err
        );
      }
    }
  } catch {
    // Directory missing or unreadable
  }
  return merged;
}

async function mergeSelectedPageModules(
  messages: Record<string, unknown>,
  locale: string,
  files: string[]
): Promise<Record<string, unknown>> {
  const root = resolveMessagesRoot();
  let merged = messages;

  for (const file of files) {
    if (locale !== "en") {
      const enPath = join(root, "pages", "en", file);
      if (existsSync(enPath)) {
        try {
          const enRaw = await readFile(enPath, "utf8");
          merged = deepMerge(
            merged,
            JSON.parse(enRaw) as Record<string, unknown>
          );
        } catch (err) {
          console.error(
            `[i18n] Skipping invalid page messages en/${file}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    }

    const localePath = join(root, "pages", locale, file);
    if (existsSync(localePath)) {
      try {
        const localeRaw = await readFile(localePath, "utf8");
        merged = deepMerge(
          merged,
          JSON.parse(localeRaw) as Record<string, unknown>
        );
      } catch (err) {
        console.error(
          `[i18n] Skipping invalid page messages ${locale}/${file}:`,
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  return merged;
}

const clientMessagesCache = new Map<string, Record<string, unknown>>();

/** Base locale JSON + page modules needed by client-side widgets (cached per locale). */
export async function loadMessagesForClient(
  locale: string
): Promise<Record<string, unknown>> {
  const cached = clientMessagesCache.get(locale);
  if (cached) {
    return cached;
  }

  const root = resolveMessagesRoot();
  const basePath = join(root, `${locale}.json`);
  const baseRaw = await readFile(basePath, "utf8");
  let messages = JSON.parse(baseRaw) as Record<string, unknown>;
  messages = await mergeSelectedPageModules(
    messages,
    locale,
    [...CLIENT_MESSAGE_PAGE_FILES]
  );
  clientMessagesCache.set(locale, messages);
  return messages;
}

/** Load base locale JSON + only page modules required for the request path. */
export async function loadMessagesForPath(
  locale: string,
  logicalPathname?: string
): Promise<Record<string, unknown>> {
  if (!logicalPathname?.trim()) {
    return loadMessages(locale);
  }

  const root = resolveMessagesRoot();
  const basePath = join(root, `${locale}.json`);
  const baseRaw = await readFile(basePath, "utf8");
  let messages = JSON.parse(baseRaw) as Record<string, unknown>;
  const files = pageModulesForPathname(logicalPathname);
  messages = await mergeSelectedPageModules(messages, locale, files);
  return messages;
}

const fullMessagesCache = new Map<string, Record<string, unknown>>();

/**
 * Load base locale JSON + page modules; non-English locales fall back to en page files.
 *
 * Cached per locale: this is now the server message source for statically
 * rendered pages (see `i18n/request.ts`), so it runs once per locale at build
 * / revalidate time rather than per request.
 */
export async function loadMessages(
  locale: string
): Promise<Record<string, unknown>> {
  const cached = fullMessagesCache.get(locale);
  if (cached) {
    return cached;
  }

  const root = resolveMessagesRoot();
  const basePath = join(root, `${locale}.json`);
  const baseRaw = await readFile(basePath, "utf8");
  let messages = JSON.parse(baseRaw) as Record<string, unknown>;

  if (locale !== "en") {
    messages = await mergePageModules(
      messages,
      join(root, "pages", "en"),
      "en"
    );
  }

  messages = await mergePageModules(
    messages,
    join(root, "pages", locale),
    locale
  );

  fullMessagesCache.set(locale, messages);
  return messages;
}
