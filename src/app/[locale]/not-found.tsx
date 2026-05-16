import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NotFoundContent from "@/app/components/NotFoundContent";
import { buildNotFoundLabels } from "@/lib/not-found-labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFoundPage.meta");

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: true },
  };
}

export default async function NotFoundPage() {
  const t = await getTranslations("NotFoundPage");
  const labels = buildNotFoundLabels((key) => t(key));

  return <NotFoundContent labels={labels} />;
}
