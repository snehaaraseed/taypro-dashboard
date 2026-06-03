import { CradylProductPage } from "@/app/components/CradylProductPage";

export default async function CradylProductRoutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CradylProductPage locale={locale} />;
}
