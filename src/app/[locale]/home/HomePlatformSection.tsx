import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";

const PILLAR_KEYS = ["0", "1", "2"] as const;
const LOOP_STEP_KEYS = ["0", "1", "2", "3", "4"] as const;

export default async function HomePlatformSection() {
  const t = await getTranslations("Home.platform");

  return (
    <section
      className="py-14 md:py-20 bg-[#052638] border-y border-white/10"
      aria-labelledby="home-platform-heading"
    >
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
            {t("eyebrow")}
          </p>
          <h2
            id="home-platform-heading"
            className="text-white font-semibold text-3xl md:text-4xl mb-4 leading-tight"
          >
            {t("heading")}
          </h2>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            {t("subtitle")}
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12">
          {PILLAR_KEYS.map((key, idx) => (
            <AnimateOnScroll key={key} animation="fadeInUp" delay={idx * 80}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 hover:border-[#A8C117]/40 transition-colors">
                <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
                  {t(`pillars.${key}.tag`)}
                </p>
                <h3 className="text-white font-semibold text-xl mb-3">
                  {t(`pillars.${key}.title`)}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {t(`pillars.${key}.body`)}
                </p>
                <Link
                  href={t(`pillars.${key}.href`)}
                  className="text-[#A8C117] text-sm font-medium hover:underline underline-offset-4"
                >
                  {t(`pillars.${key}.link`)}
                </Link>
              </article>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll animation="fadeInUp" className="max-w-4xl mx-auto mb-12">
          <ol className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-2 text-center">
            {LOOP_STEP_KEYS.map((key, idx) => (
              <li
                key={key}
                className="flex items-center gap-2 sm:flex-col sm:min-w-[4.5rem]"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#A8C117]/20 text-[#A8C117] text-sm font-semibold shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-white/90 text-sm font-medium">
                  {t(`loopSteps.${key}`)}
                </span>
                {idx < LOOP_STEP_KEYS.length - 1 && (
                  <span
                    className="hidden sm:inline text-[#A8C117]/60 text-lg mx-1 last:hidden"
                    aria-hidden
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="text-center text-gray-400 text-sm mt-6">{t("loopClosing")}</p>
        </AnimateOnScroll>

        <AnimateOnScroll
          animation="fadeInUp"
          className="max-w-4xl mx-auto rounded-2xl border border-[#A8C117]/30 bg-[#0a3a4a]/80 p-6 md:p-8"
        >
          <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wider mb-2">
            {t("investorEyebrow")}
          </p>
          <h3 className="text-white font-semibold text-xl md:text-2xl mb-3">
            {t("investorTitle")}
          </h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-5">
            {t("investorBody")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/company#investors"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-lg bg-[#A8C117] text-[#052638] text-sm font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("investorCtaCompany")}
            </Link>
            <Link
              href={ORION_PRODUCT_PATH}
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("investorCtaOrion")}
            </Link>
          </div>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
