import { sanitizePdfText } from "@/lib/roi-calculator/pdf-text-sanitize";

export type InsightPdfBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 3 | 4; text: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "table"; headers: string[]; rows: string[][] };

export type InsightPdfSection = {
  title: string;
  blocks: InsightPdfBlock[];
};

export type ParsedInsightReport = {
  intro: InsightPdfBlock[];
  sections: InsightPdfSection[];
};

function normalizeText(text: string): string {
  return sanitizePdfText(text.replace(/\s+/g, " ").trim());
}

function parseTable(table: HTMLTableElement): InsightPdfBlock | null {
  const rows = [...table.querySelectorAll("tr")];
  if (!rows.length) return null;

  const matrix = rows.map((row) =>
    [...row.querySelectorAll("th,td")].map((cell) =>
      normalizeText(cell.textContent ?? "")
    )
  );
  const [first, ...rest] = matrix;
  if (!first?.length) return null;

  const hasHeader = rows[0]?.querySelector("th") !== null;
  return {
    type: "table",
    headers: hasHeader ? first : first.map((_, i) => `Col ${i + 1}`),
    rows: hasHeader ? rest : matrix,
  };
}

function walkElement(el: Element): InsightPdfBlock[] {
  const blocks: InsightPdfBlock[] = [];

  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = normalizeText(node.textContent ?? "");
      if (text) blocks.push({ type: "paragraph", text });
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const child = node as Element;
    const tag = child.tagName.toLowerCase();

    if (tag === "p") {
      const text = normalizeText(child.textContent ?? "");
      if (text) blocks.push({ type: "paragraph", text });
    } else if (tag === "h3" || tag === "h4") {
      const text = normalizeText(child.textContent ?? "");
      if (text) blocks.push({ type: "heading", level: tag === "h3" ? 3 : 4, text });
    } else if (tag === "ul" || tag === "ol") {
      const items = [...child.querySelectorAll(":scope > li")]
        .map((li) => normalizeText(li.textContent ?? ""))
        .filter(Boolean);
      if (items.length) {
        blocks.push({ type: "list", items, ordered: tag === "ol" });
      }
    } else if (tag === "table") {
      const table = parseTable(child as HTMLTableElement);
      if (table) blocks.push(table);
    } else if (tag === "div" && child.classList.contains("cms-table-wrap")) {
      const table = child.querySelector("table");
      if (table) {
        const parsed = parseTable(table as HTMLTableElement);
        if (parsed) blocks.push(parsed);
      } else {
        blocks.push(...walkElement(child));
      }
    } else if (tag === "blockquote") {
      const text = normalizeText(child.textContent ?? "");
      if (text) blocks.push({ type: "paragraph", text });
    } else {
      blocks.push(...walkElement(child));
    }
  }

  return blocks;
}

function blocksFromElements(elements: Element[]): InsightPdfBlock[] {
  const container = document.createElement("div");
  for (const el of elements) {
    container.appendChild(el.cloneNode(true));
  }
  return walkElement(container);
}

/** Parse sanitized insight HTML into PDF sections (browser only). */
export function parseReportHtmlForPdf(html: string): ParsedInsightReport {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.body;
  const sections: InsightPdfSection[] = [];
  const intro: InsightPdfBlock[] = [];

  let currentTitle: string | null = null;
  let introElements: Element[] = [];
  let sectionElements: Element[] = [];

  for (const node of root.childNodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;

    if (el.tagName.toLowerCase() === "h2") {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          blocks: blocksFromElements(sectionElements),
        });
        sectionElements = [];
      } else if (introElements.length) {
        intro.push(...blocksFromElements(introElements));
        introElements = [];
      }

      currentTitle = normalizeText(el.textContent ?? "");
      continue;
    }

    if (currentTitle) sectionElements.push(el);
    else introElements.push(el);
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      blocks: blocksFromElements(sectionElements),
    });
  } else if (introElements.length) {
    intro.push(...blocksFromElements(introElements));
  }

  return { intro, sections };
}
