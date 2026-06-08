import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function DelhiStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="delhi" locale={locale} />;
}
