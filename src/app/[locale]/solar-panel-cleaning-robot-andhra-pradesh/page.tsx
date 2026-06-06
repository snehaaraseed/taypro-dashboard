import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function AndhraPradeshStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="andhraPradesh" locale={locale} />;
}
