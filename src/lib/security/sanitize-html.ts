import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "hr",
  "span",
  "div",
];

const ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "class",
  "id",
  "colspan",
  "rowspan",
  "loading",
];

/** Strip scripts/event handlers from CMS HTML before render. */
export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

/** Press release body: DOMPurify + strip H1 (page template renders the headline). */
export function sanitizePressReleaseHtml(html: string): string {
  const cleaned = sanitizeBlogHtml(html)
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
    .replace(/\[TBD\]/gi, "")
    .replace(/\[INSERT[^\]]*\]/gi, "")
    .replace(/lorem ipsum/gi, "")
    .trim();
  return cleaned;
}
