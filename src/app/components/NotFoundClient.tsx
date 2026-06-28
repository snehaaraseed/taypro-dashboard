"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import NotFoundContent from "@/app/components/NotFoundContent";
import { buildNotFoundLabels } from "@/lib/not-found-labels";
import type { DynamicBlog } from "@/app/api/blog/list/route";
import type { RecoveryResult } from "@/lib/url-recovery/types";

type RecoveryResponse = {
  show?: boolean;
  suggestion?: RecoveryResult;
  similarBlogs?: DynamicBlog[];
  currentBlogSlug?: string;
};

/**
 * Client not-found renderer. Translations/locale come from the intl provider
 * context (no server `headers()`), so the not-found boundary stays statically
 * renderable. The "did you mean" recovery is fetched client-side as a
 * progressive enhancement from `/api/url-recovery`.
 */
export default function NotFoundClient() {
  const t = useTranslations("NotFoundPage");
  const locale = useLocale();
  const labels = buildNotFoundLabels((key) => t(key));
  const [recovery, setRecovery] = useState<RecoveryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = window.location.pathname;
    const url = `/api/url-recovery?path=${encodeURIComponent(
      path
    )}&locale=${encodeURIComponent(locale)}`;

    fetch(url, { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RecoveryResponse | null) => {
        if (!cancelled && data?.show) {
          setRecovery(data);
        }
      })
      .catch(() => {
        // Recovery is a progressive enhancement; ignore failures.
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const didYouMeanHref =
    recovery?.suggestion?.kind === "suggest"
      ? recovery.suggestion.destination
      : undefined;

  return (
    <NotFoundContent
      labels={labels}
      didYouMeanHref={didYouMeanHref}
      similarBlogs={recovery?.similarBlogs}
      currentBlogSlug={recovery?.currentBlogSlug}
    />
  );
}
