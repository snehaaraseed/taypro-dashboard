import StateSolarLandingPage from "@/app/components/StateSolarLandingPage";
import type { StateLandingId } from "@/lib/seo/state-landing-config";

export default async function RajasthanStateLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StateSolarLandingPage stateId="rajasthan" locale={locale} />;
}
