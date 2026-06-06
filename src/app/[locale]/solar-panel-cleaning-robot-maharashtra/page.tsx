import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function MaharashtraStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="maharashtra" locale={locale} />;
}
