import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function MadhyaPradeshStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="madhyaPradesh" locale={locale} />;
}
