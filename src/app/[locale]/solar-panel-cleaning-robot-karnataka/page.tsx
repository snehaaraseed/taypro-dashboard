import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function KarnatakaStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="karnataka" locale={locale} />;
}
