import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import {
  PRESS_COVERAGE,
  type PressCoverageItem,
  type PressCoverageKind,
} from "@/lib/seo/press-coverage";

const SECTION_ORDER: PressCoverageKind[] = [
  "interview",
  "market",
  "award",
  "news",
];

const SECTION_LABEL_KEYS: Record<PressCoverageKind, string> = {
  interview: "sectionInterviews",
  market: "sectionMarket",
  award: "sectionAwards",
  news: "sectionNews",
};

function groupCoverage(items: PressCoverageItem[]) {
  const groups = new Map<PressCoverageKind, PressCoverageItem[]>();
  for (const kind of SECTION_ORDER) {
    groups.set(kind, []);
  }
  for (const item of items) {
    groups.get(item.kind)?.push(item);
  }
  return SECTION_ORDER.filter((kind) => (groups.get(kind)?.length ?? 0) > 0).map(
    (kind) => ({ kind, items: groups.get(kind)! })
  );
}

function CoverageCard({
  item,
  readLabel,
}: {
  item: PressCoverageItem;
  readLabel: string;
}) {
  return (
    <article className="border border-gray-200 rounded-xl p-6 shadow-sm">
      <p className="text-sm text-[#5a8f00] font-medium mb-2">
        {item.outlet}
        {item.date ? (
          <span className="text-gray-400 font-normal"> · {item.date}</span>
        ) : null}
      </p>
      <h3 className="text-[#052638] font-semibold text-xl mb-3 leading-snug">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#5a8f00] transition-colors inline-flex items-start gap-2"
        >
          {item.title}
          <ExternalLink className="w-4 h-4 shrink-0 mt-1" aria-hidden />
        </a>
      </h3>
      <p className="text-[#27415c] text-base leading-relaxed mb-4">{item.summary}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#5a8f00] font-medium hover:underline text-sm"
      >
        {readLabel}
      </a>
    </article>
  );
}

export default async function PressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PressPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const sections = groupCoverage(PRESS_COVERAGE);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <section className="bg-[#052638] text-white py-14 md:py-20 px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-4">
            {t("hero.eyebrow")}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-5">
            {t("hero.title")}
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <AnimateOnScroll animation="fadeInUp" className="mb-10">
            <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
              {t("listHeading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed">{t("listIntro")}</p>
          </AnimateOnScroll>

          <div className="space-y-14">
            {sections.map(({ kind, items }) => (
              <section key={kind} aria-labelledby={`press-section-${kind}`}>
                <h3
                  id={`press-section-${kind}`}
                  className="text-[#052638] font-semibold text-lg md:text-xl mb-6 pb-2 border-b border-gray-200"
                >
                  {t(SECTION_LABEL_KEYS[kind])}
                </h3>
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={item.url}>
                      <AnimateOnScroll animation="fadeInUp">
                        <CoverageCard
                          item={item}
                          readLabel={t("readArticle", { outlet: item.outlet })}
                        />
                      </AnimateOnScroll>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <AnimateOnScroll animation="fadeInUp" className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/company"
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-[#052638] text-white font-medium hover:bg-[#0a3a4a] transition-colors"
            >
              {t("companyCta")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638]/5 transition-colors"
            >
              {t("contactCta")}
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>
    </>
  );
}
