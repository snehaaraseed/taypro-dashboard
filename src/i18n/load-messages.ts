import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

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

/** Load base locale JSON + all page modules from messages/pages/{locale}/*.json */
export async function loadMessages(
  locale: string
): Promise<Record<string, unknown>> {
  const root = resolveMessagesRoot();
  const basePath = join(root, `${locale}.json`);
  const baseRaw = await readFile(basePath, "utf8");
  let messages = JSON.parse(baseRaw) as Record<string, unknown>;

  const pagesDir = join(root, "pages", locale);
  try {
    const files = await readdir(pagesDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();
    for (const file of jsonFiles) {
      try {
        const pageRaw = await readFile(join(pagesDir, file), "utf8");
        const pageMessages = JSON.parse(pageRaw) as Record<string, unknown>;
        messages = deepMerge(messages, pageMessages);
      } catch (err) {
        console.error(
          `[i18n] Skipping invalid page messages ${locale}/${file}:`,
          err instanceof Error ? err.message : err
        );
      }
    }
  } catch {
    // No page overrides for this locale yet
  }

  return messages;
}
