import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function HaryanaStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="haryana" locale={locale} />;
}
