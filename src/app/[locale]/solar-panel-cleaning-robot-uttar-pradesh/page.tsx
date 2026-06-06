import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";

export default async function UttarPradeshStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="uttarPradesh" locale={locale} />;
}
