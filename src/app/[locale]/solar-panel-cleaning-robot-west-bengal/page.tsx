import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function WestBengalStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="westBengal" locale={locale} />;
}
