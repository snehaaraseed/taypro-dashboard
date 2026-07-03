"use client";

import { useLocale } from "next-intl";
import { BreadcrumbListSchema } from "@/app/components/StructuredData";

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const locale = useLocale();
  return <BreadcrumbListSchema items={items} locale={locale} />;
}
