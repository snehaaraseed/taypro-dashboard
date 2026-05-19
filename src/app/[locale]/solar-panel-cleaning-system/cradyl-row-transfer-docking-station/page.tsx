import { ComingSoonProductPage } from "@/app/components/ComingSoonProductPage";
import { comingSoonProducts } from "@/lib/product-coming-soon";

export default async function CradylProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const product = comingSoonProducts.find((p) => p.id === "cradyl");
  if (!product) {
    throw new Error("CRADYL product config missing");
  }
  return <ComingSoonProductPage product={product} locale={locale} />;
}
