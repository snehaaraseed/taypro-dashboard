import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import NotFoundContent from "@/app/components/NotFoundContent";
import { renderRecoveryNotFound } from "@/app/components/renderRecoveryNotFound";
import { buildNotFoundLabels } from "@/lib/not-found-labels";
import {
  resolveNotFoundRecovery,
  shouldShowRecoveryNotFound,
} from "@/lib/url-recovery";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFoundPage.meta");

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: true },
  };
}

export default async function NotFoundPage() {
  const locale = await getLocale();
  const headerStore = await headers();
  const logicalPath =
    headerStore.get("x-logical-pathname") ??
    headerStore.get("x-pathname") ??
    "";

  if (logicalPath) {
    const recoveryContext = await resolveNotFoundRecovery(logicalPath, locale);
    if (shouldShowRecoveryNotFound(recoveryContext)) {
      return renderRecoveryNotFound(locale, recoveryContext);
    }
  }

  const t = await getTranslations("NotFoundPage");
  const labels = buildNotFoundLabels((key) => t(key));

  return <NotFoundContent labels={labels} />;
}
