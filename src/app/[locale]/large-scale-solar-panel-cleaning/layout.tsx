import { generateBuyerIntentMetadata } from "@/lib/seo/buyer-intent-metadata";
import type { BuyerIntentPageId } from "@/lib/seo/buyer-intent-pages-config";

const PAGE_ID = "largeScale" satisfies BuyerIntentPageId;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateBuyerIntentMetadata(PAGE_ID, locale);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
