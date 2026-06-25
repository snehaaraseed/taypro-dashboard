import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Calculator,
  Factory,
  Headphones,
  LayoutGrid,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import {
  PRODUCT_CATALOG,
  type ProductId,
} from "@/lib/products/catalog";

const SEO_PRODUCT_ORDER: ProductId[] = [
  "glyde",
  "nyuma",
  "helyx",
  "glydeX",
  "nyumaX",
];

const ACTION_CARDS = [
  {
    key: "hub",
    href: "/solar-panel-cleaning-system",
    icon: LayoutGrid,
    titleKey: "hubCardTitle",
    descriptionKey: "hubCardDescription",
    linkKey: "hubLink",
  },
  {
    key: "service",
    href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    icon: Sparkles,
    titleKey: "serviceCardTitle",
    descriptionKey: "serviceCardDescription",
    linkKey: "serviceLink",
  },
  {
    key: "calculator",
    href: "/solar-panel-cleaning-robot-price-calculator",
    icon: Calculator,
    titleKey: "calculatorCardTitle",
    descriptionKey: "calculatorCardDescription",
    linkKey: "calculatorLink",
  },
] as const;

const TRUST_ITEMS: { key: "trustMadeIn" | "trustDeployment" | "trustSupport"; icon: LucideIcon }[] =
  [
    { key: "trustMadeIn", icon: Factory },
    { key: "trustDeployment", icon: MapPin },
    { key: "trustSupport", icon: Headphones },
  ];

export default async function HomeSeoProse() {
  const t = await getTranslations("Home.seoProse");

  const products = SEO_PRODUCT_ORDER.map((id) => PRODUCT_CATALOG[id]);

  return (
    <section
      className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-b from-white via-[#f8fafb] to-[#f4f7f9] py-14 md:py-20"
      aria-labelledby="home-seo-prose-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#A8C117]/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#052638]/5 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <AnimateOnScroll animation="fadeInUp" className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#5a8f00]">
            {t("eyebrow")}
          </p>
          <h2
            id="home-seo-prose-heading"
            className="mb-5 text-3xl font-semibold leading-tight text-[#052638] md:text-4xl"
          >
            {t("heading")}
          </h2>
          <p className="text-base leading-relaxed text-[#27415c] md:text-lg">
            {t("intro")}
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fadeInUp" delay={60} className="mb-10 md:mb-12">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-[#5a7a8f]">
            {t("productsEyebrow")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={product.href}
                className="inline-flex items-center rounded-full border border-[#052638]/12 bg-white px-4 py-1.5 text-sm font-semibold tracking-wide text-[#052638] shadow-sm transition-colors hover:border-[#A8C117]/60 hover:bg-[#A8C117]/10"
              >
                {product.itemName}
              </Link>
            ))}
          </div>
        </AnimateOnScroll>

        <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:mb-12 md:grid-cols-3 md:gap-6">
          {ACTION_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <AnimateOnScroll key={card.key} animation="fadeInUp" delay={80 + idx * 60}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all hover:border-[#A8C117]/50 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#052638]/5 text-[#052638] transition-colors group-hover:bg-[#A8C117]/15 group-hover:text-[#5a8f00]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="pt-1.5 font-semibold leading-snug text-[#052638]">
                      {t(card.titleKey)}
                    </h3>
                  </div>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-[#27415c]">
                    {t(card.descriptionKey)}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5a8f00] transition-all group-hover:gap-2.5">
                    {t(card.linkKey)}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll animation="fadeInUp" delay={260}>
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-gray-200/80 bg-white/70 px-6 py-4 text-sm text-[#5a7a8f] backdrop-blur-sm">
            {TRUST_ITEMS.map(({ key, icon: Icon }) => (
              <span key={key} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#5a8f00]" aria-hidden />
                {t(key)}
              </span>
            ))}
          </div>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
