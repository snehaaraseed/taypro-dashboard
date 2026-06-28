import type { ProductHeroHighlight } from "@/app/components/ProductHero";
import type { ProductPageHeroBackground } from "@/lib/cms/product-page-hero-background";

type TranslateFn = (key: string) => string;

export function buildProductHeroHighlights(t: TranslateFn): ProductHeroHighlight[] {
  return [0, 1, 2].map((i) => ({
    value: t(`hero.highlights.stat${i}.value`),
    label: t(`hero.highlights.stat${i}.label`),
  }));
}

export function productHeroBackgroundCredit(background: ProductPageHeroBackground) {
  if (background.projectHref && background.projectTitle) {
    return {
      title: background.projectTitle,
      href: background.projectHref,
    };
  }
  return undefined;
}

export type ProductHeroSecondaryAnchor =
  | "#product-tour"
  | "#product-video"
  | "#deployments"
  | "#register-interest";

export function productHeroSecondaryCta(
  t: TranslateFn,
  href: ProductHeroSecondaryAnchor
) {
  return {
    label: t("hero.secondaryCta.label"),
    href,
  };
}
