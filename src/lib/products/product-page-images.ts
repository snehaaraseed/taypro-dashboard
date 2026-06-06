import {
  getProduct,
  getProductHeroAspectRatio,
  productAltText,
  productImagePresentation,
  type ProductId,
} from "@/lib/products/catalog";

const DEFAULT_SITE_URL = "https://taypro.in";

export function productPageImages(id: ProductId) {
  const product = getProduct(id);
  return {
    hero: product.imagePath,
    schema: product.imagePath,
    og: product.imagePath,
  };
}

export function getProductImageUrl(
  id: ProductId,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
): string {
  const path = getProduct(id).imagePath;
  return path.startsWith("http") ? path : `${siteUrl}${path}`;
}

export function getProductHeroAlt(id: ProductId): string {
  const product = getProduct(id);
  return productAltText(product.itemName, product.marketingName);
}

export function getProductHeroLayout(id: ProductId) {
  return {
    aspectRatio: getProductHeroAspectRatio(id),
    presentation: productImagePresentation(id),
  };
}
