import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function TamilNaduStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="tamilNadu" locale={locale} />;
}
