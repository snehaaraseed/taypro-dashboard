"use client";

import { useMemo } from "react";
import { sanitizeBlogHtml } from "@/lib/security/sanitize-html";

interface InsightReportContentProps {
  content: string;
  className?: string;
}

function wrapCmsTables(html: string): string {
  if (!/<table[\s>]/i.test(html)) return html;
  return html.replace(
    /<table[\s\S]*?<\/table>/gi,
    (table) => `<div class="cms-table-wrap">${table}</div>`
  );
}

export function InsightReportContent({
  content,
  className = "",
}: InsightReportContentProps) {
  const safeHtml = useMemo(
    () => wrapCmsTables(sanitizeBlogHtml(content)),
    [content]
  );

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      suppressHydrationWarning
    />
  );
}
