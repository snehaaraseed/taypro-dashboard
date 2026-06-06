import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function GujaratStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="gujarat" locale={locale} />;
}
