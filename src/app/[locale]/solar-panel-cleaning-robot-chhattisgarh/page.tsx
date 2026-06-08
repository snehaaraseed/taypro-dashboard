import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function ChhattisgarhStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="chhattisgarh" locale={locale} />;
}
