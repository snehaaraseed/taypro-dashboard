import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Brain,
  CalendarClock,
  ClipboardList,
  Radar,
  Sparkles,
} from "lucide-react";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";

const PILLAR_KEYS = ["0", "1", "2"] as const;
const LOOP_STEP_KEYS = ["0", "1", "2", "3", "4"] as const;
const LOOP_STEP_ICONS: LucideIcon[] = [Radar, CalendarClock, Sparkles, ClipboardList, Brain];

type LoopStepContent = { title: string; description: string };

function getLoopStepContent(
  raw: string | LoopStepContent | undefined
): LoopStepContent {
  if (!raw) return { title: "", description: "" };
  if (typeof raw === "string") return { title: raw, description: "" };
  return {
    title: raw.title,
    description: raw.description ?? "",
  };
}

function getLoopClosingTagline(closing: string): string {
  const commaIndex = closing.indexOf(",");
  return commaIndex >= 0 ? closing.slice(commaIndex + 1).trim() : closing;
}

export default async function HomePlatformSection() {
  const t = await getTranslations("Home.platform");
  const loopSteps = LOOP_STEP_KEYS.map((key, idx) => ({
    key,
    idx,
    icon: LOOP_STEP_ICONS[idx],
    ...getLoopStepContent(
      t.raw(`loopSteps.${key}`) as string | LoopStepContent | undefined
    ),
  }));
  const loopClosing = t("loopClosing");
  const loopClosingTagline = getLoopClosingTagline(loopClosing);

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
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#A8C117]/50 text-[#A8C117] text-sm font-semibold hover:bg-[#A8C117]/10 hover:border-[#A8C117] transition-colors"
                >
                  {t(`pillars.${key}.link`)}
                </Link>
              </article>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll animation="fadeInUp" className="max-w-6xl mx-auto mb-12">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 md:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute left-8 top-0 bottom-8 w-px bg-gradient-to-b from-[#A8C117]/50 via-[#A8C117]/20 to-transparent lg:hidden"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-[3.75rem] hidden h-px bg-gradient-to-r from-transparent via-[#A8C117]/35 to-transparent lg:block"
              aria-hidden
            />

            <ol className="grid grid-cols-1 gap-5 pl-6 md:grid-cols-2 md:gap-6 md:pl-0 xl:grid-cols-5 xl:gap-4">
              {loopSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.key} className="relative">
                    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#A8C117]/35 hover:bg-white/[0.06] lg:pt-14">
                      <div className="absolute -left-[1.125rem] top-7 hidden h-2.5 w-2.5 rounded-full border-2 border-[#052638] bg-[#A8C117] lg:hidden" />
                      <div className="mb-4 flex items-center gap-3 lg:absolute lg:left-1/2 lg:top-0 lg:mb-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#A8C117]/30 bg-[#052638] shadow-[0_0_0_4px_rgba(5,38,56,0.85)] ring-1 ring-[#A8C117]/20">
                          <Icon className="h-5 w-5 text-[#A8C117]" aria-hidden />
                        </span>
                        <span className="text-[#A8C117]/90 text-xs font-bold tracking-[0.22em] lg:hidden">
                          {String(step.idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mb-1 hidden text-[#A8C117]/70 text-[0.65rem] font-bold tracking-[0.24em] lg:block">
                        {String(step.idx + 1).padStart(2, "0")}
                      </p>
                      <h3 className="text-white font-semibold text-lg leading-tight mb-2">
                        {step.title}
                      </h3>
                      {step.description ? (
                        <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 border-t border-white/10 pt-8 text-center md:mt-10 md:pt-10">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
                {loopSteps.map((step, idx) => (
                  <span key={step.key} className="inline-flex items-center gap-2">
                    <span className="rounded-full border border-[#A8C117]/25 bg-[#A8C117]/10 px-3 py-1 text-[#A8C117] text-xs font-semibold uppercase tracking-wider">
                      {step.title}
                    </span>
                    {idx < loopSteps.length - 1 ? (
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-white/35"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                ))}
              </div>
              {loopClosingTagline ? (
                <p className="text-gray-400 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                  {loopClosingTagline}
                </p>
              ) : null}
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll
          animation="fadeInUp"
          className="max-w-4xl mx-auto rounded-2xl border border-gray-200/80 bg-[#f4f7f9] p-6 md:p-8 shadow-sm"
        >
          <p className="mb-3 inline-flex items-center rounded-full border border-[#A8C117]/25 bg-[#A8C117]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a8f00]">
            {t("investorEyebrow")}
          </p>
          <h3 className="text-[#052638] font-semibold text-xl md:text-2xl mb-3">
            {t("investorTitle")}
          </h3>
          <p className="text-[#27415c] text-sm md:text-base leading-relaxed mb-5">
            {t("investorBody")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/company#investors"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-[#A8C117] text-[#052638] text-sm font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("investorCtaCompany")}
            </Link>
            <Link
              href="/technology/ai-intelligence"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#052638] text-sm font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition-colors"
            >
              {t("investorCtaAi")}
            </Link>
            <Link
              href={ORION_PRODUCT_PATH}
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#052638] text-sm font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition-colors"
            >
              {t("investorCtaOrion")}
            </Link>
          </div>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
