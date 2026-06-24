import BuyerIntentLandingPage from "@/app/components/BuyerIntentLandingPage";
import type { BuyerIntentPageId } from "@/lib/seo/buyer-intent-pages-config";

const PAGE_ID = "plantDataIntelligence" satisfies BuyerIntentPageId;

export default async function BuyerIntentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BuyerIntentLandingPage pageId={PAGE_ID} locale={locale} />;
}
