import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  BarChart3,
  Briefcase,
  Code2,
  Cpu,
  Factory,
  Globe2,
  MapPin,
  Rocket,
  Search,
  Send,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { tayproTrustedByStatsStrip } from "@/app/data";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import {
  jobDisplayTitle,
  jobOpeningSlug,
  listOpenJobOpenings,
} from "@/lib/erpnext/job-openings";
import { formatLocaleDate } from "@/i18n/format-date";

export const revalidate = 300;

const STAT_LABEL_KEYS = [
  "statsStrip.robotCapacityDeployed",
  "statsStrip.panelsCleanedAnnually",
  "statsStrip.waterSavedAnnually",
  "statsStrip.robotsManufacturedPerMonth",
] as const;

const WHY_JOIN_KEYS = [
  { key: "impact", icon: Globe2 },
  { key: "technology", icon: Cpu },
  { key: "growth", icon: Rocket },
  { key: "ownership", icon: Users },
] as const;

const TEAM_KEYS = [
  { key: "engineering", icon: Wrench },
  { key: "software", icon: Code2 },
  { key: "manufacturing", icon: Factory },
  { key: "field", icon: MapPin },
  { key: "operations", icon: BarChart3 },
  { key: "business", icon: Briefcase },
] as const;

const BENEFIT_KEYS = [
  "impact",
  "learning",
  "ownership",
  "travel",
  "manufacturing",
  "team",
] as const;

const PROCESS_KEYS = [
  { key: "apply", icon: Send, step: "01" },
  { key: "review", icon: Search, step: "02" },
  { key: "interviews", icon: UserCheck, step: "03" },
  { key: "offer", icon: Rocket, step: "04" },
] as const;

const FAQ_KEYS = ["0", "1", "2", "3", "4", "5"] as const;

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CareersPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const careersFaqs = FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  let jobs: Awaited<ReturnType<typeof listOpenJobOpenings>> = [];
  let loadError = false;

  try {
    jobs = await listOpenJobOpenings();
  } catch (error) {
    loadError = true;
    console.error("Careers listing ERPNext error:", error);
  }

  return (
    <>
      <FAQPageSchema faqs={careersFaqs} />
      <Breadcrumbs items={breadcrumbs} />

      <section className="bg-[#052638] px-4 py-14 text-white sm:px-6 md:py-20">
        <Container className="max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mb-5 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mb-8 text-base leading-relaxed text-gray-300 md:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#open-positions"
              className="inline-flex justify-center rounded-lg bg-[#A8C117] px-6 py-3 text-sm font-semibold text-[#052638] transition-colors hover:bg-[#b3cf3d]"
            >
              {t("hero.cta")}
            </a>
            <Link
              href="/company"
              title={t("hero.ctaSecondaryTitle")}
              className="inline-flex justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </Container>
      </section>

      <section
        id="open-positions"
        className="scroll-mt-24 bg-white px-4 py-14 sm:px-6 md:py-20"
        aria-labelledby="open-positions-heading"
      >
        <Container className="max-w-4xl">
          <AnimateOnScroll animation="fadeInUp" className="mb-10">
            <h2
              id="open-positions-heading"
              className="mb-3 text-2xl font-semibold text-[#052638] md:text-3xl"
            >
              {t("listHeading")}
            </h2>
            <p className="text-base leading-relaxed text-[#27415c]">
              {t("listIntro")}
            </p>
          </AnimateOnScroll>

          {loadError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
              {t("emptyBody")}
            </p>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-[#f4f7f9] p-8 text-center">
              <h3 className="mb-2 text-xl font-semibold text-[#052638]">
                {t("emptyTitle")}
              </h3>
              <p className="mb-6 text-[#27415c]">{t("emptyBody")}</p>
              <OpenLeadModalButton
                source="careers_empty"
                topic={t("leadModal.topic")}
                title={t("leadModal.title")}
                subtitle={t("leadModal.subtitle")}
                leadIntent={t("leadModal.topic")}
                formPrompt={t("leadModal.formPrompt")}
                showMessageField
                messageLabel={t("leadModal.messageLabel")}
                messagePlaceholder={t("leadModal.messagePlaceholder")}
                submitLabel={t("leadModal.submitLabel")}
                thankYouTitle={t("leadModal.thankYouTitle")}
                thankYouMessage={t("leadModal.thankYouMessage")}
                analyticsFormType="careers_application"
                className="inline-flex justify-center rounded-lg bg-[#052638] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0a3a4a]"
              >
                {t("contactCta")}
              </OpenLeadModalButton>
            </div>
          ) : (
            <ul className="space-y-4">
              {jobs.map((job) => {
                const slug = jobOpeningSlug(job);
                const title = jobDisplayTitle(job);
                const meta = [job.department, job.location, job.employment_type]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li key={job.name}>
                    <AnimateOnScroll animation="fadeInUp">
                      <article className="rounded-xl border border-gray-200 p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-[#052638]">
                              <Link
                                href={`/careers/${slug}`}
                                className="transition-colors hover:text-[#5a8f00]"
                              >
                                {title}
                              </Link>
                            </h3>
                            {meta ? (
                              <p className="mt-1 text-sm text-[#5a8f00]">{meta}</p>
                            ) : null}
                            {job.posted_on ? (
                              <p className="mt-2 text-xs text-gray-500">
                                {t("postedOn", {
                                  date: formatLocaleDate(locale, job.posted_on),
                                })}
                              </p>
                            ) : null}
                          </div>
                          <Link
                            href={`/careers/${slug}`}
                            className="inline-flex shrink-0 justify-center rounded-lg border border-[#052638] px-5 py-2.5 text-sm font-medium text-[#052638] transition-colors hover:bg-[#052638]/5"
                          >
                            {t("viewRole")}
                          </Link>
                        </div>
                      </article>
                    </AnimateOnScroll>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-[#f4f7f9] px-4 py-14 sm:px-6 md:py-20" aria-labelledby="careers-stats-heading">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
              {t("statsStrip.eyebrow")}
            </p>
            <h2
              id="careers-stats-heading"
              className="text-2xl font-semibold text-[#052638] md:text-3xl"
            >
              {t("statsStrip.heading")}
            </h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[...tayproTrustedByStatsStrip].map((stat, idx) => (
              <AnimateOnScroll key={stat.label} animation="fadeInUp" delay={idx * 80}>
                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center shadow-sm">
                  <p className="mb-2 text-2xl font-semibold tabular-nums text-[#5a8f00] sm:text-3xl md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="text-xs leading-snug text-[#27415c] sm:text-sm">
                    {t(STAT_LABEL_KEYS[idx])}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:py-20" aria-labelledby="why-join-heading">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
              {t("whyJoin.eyebrow")}
            </p>
            <h2
              id="why-join-heading"
              className="mb-4 text-2xl font-semibold text-[#052638] md:text-4xl"
            >
              {t("whyJoin.heading")}
            </h2>
            <p className="text-base leading-relaxed text-[#27415c] md:text-lg">
              {t("whyJoin.body")}
            </p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {WHY_JOIN_KEYS.map(({ key, icon: Icon }, idx) => (
              <AnimateOnScroll key={key} animation="fadeInUp" delay={idx * 70}>
                <article className="h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6">
                  <Icon className="mb-4 h-9 w-9 text-[#5a8f00]" aria-hidden />
                  <h3 className="mb-2 text-lg font-semibold text-[#052638]">
                    {t(`whyJoin.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#27415c] md:text-base">
                    {t(`whyJoin.${key}.body`)}
                  </p>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f4f7f9] px-4 py-14 sm:px-6 md:py-20" aria-labelledby="teams-heading">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
              {t("teams.eyebrow")}
            </p>
            <h2
              id="teams-heading"
              className="mb-4 text-2xl font-semibold text-[#052638] md:text-4xl"
            >
              {t("teams.heading")}
            </h2>
            <p className="text-base leading-relaxed text-[#27415c] md:text-lg">
              {t("teams.body")}
            </p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_KEYS.map(({ key, icon: Icon }, idx) => (
              <AnimateOnScroll key={key} animation="fadeInUp" delay={idx * 60}>
                <article className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <Icon className="mb-4 h-8 w-8 text-[#A8C117]" aria-hidden />
                  <h3 className="mb-2 text-lg font-semibold text-[#052638]">
                    {t(`teams.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#27415c]">
                    {t(`teams.${key}.body`)}
                  </p>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:py-20" aria-labelledby="life-heading">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <AnimateOnScroll animation="fadeInLeft">
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
                <Image
                  src="/tayprosolarfirm/banda-project.jpg"
                  alt={t("life.imageAlt")}
                  width={800}
                  height={520}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimateOnScroll>
            <div>
              <AnimateOnScroll animation="fadeInRight" className="mb-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
                  {t("life.eyebrow")}
                </p>
                <h2
                  id="life-heading"
                  className="mb-4 text-2xl font-semibold text-[#052638] md:text-3xl"
                >
                  {t("life.heading")}
                </h2>
                <p className="text-base leading-relaxed text-[#27415c]">
                  {t("life.body")}
                </p>
              </AnimateOnScroll>
              <ul className="space-y-5">
                {BENEFIT_KEYS.map((key, idx) => (
                  <AnimateOnScroll key={key} animation="fadeInRight" delay={idx * 50}>
                    <li className="border-l-2 border-[#A8C117] pl-4">
                      <h3 className="font-semibold text-[#052638]">
                        {t(`life.benefits.${key}.title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#27415c] md:text-base">
                        {t(`life.benefits.${key}.body`)}
                      </p>
                    </li>
                  </AnimateOnScroll>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#052638] px-4 py-14 text-white sm:px-6 md:py-20" aria-labelledby="process-heading">
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
              {t("process.eyebrow")}
            </p>
            <h2
              id="process-heading"
              className="mb-4 text-2xl font-semibold md:text-4xl"
            >
              {t("process.heading")}
            </h2>
            <p className="text-base leading-relaxed text-gray-300 md:text-lg">
              {t("process.body")}
            </p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_KEYS.map(({ key, icon: Icon, step }, idx) => (
              <AnimateOnScroll key={key} animation="fadeInUp" delay={idx * 80}>
                <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-widest text-[#A8C117]">
                      {step}
                    </span>
                    <Icon className="h-6 w-6 text-[#A8C117]" aria-hidden />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{t(`process.${key}.title`)}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">
                    {t(`process.${key}.body`)}
                  </p>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f4f7f9] px-4 py-14 sm:px-6 md:py-16">
        <Container className="max-w-3xl text-center">
          <AnimateOnScroll animation="fadeInUp">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#A8C117]">
              {t("generalCta.eyebrow")}
            </p>
            <h2 className="mb-4 text-2xl font-semibold text-[#052638] md:text-3xl">
              {t("generalCta.heading")}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-[#27415c]">
              {t("generalCta.body")}
            </p>
            <OpenLeadModalButton
              source="careers_general"
              topic={t("leadModal.topic")}
              title={t("generalCta.heading")}
              subtitle={t("leadModal.subtitle")}
              leadIntent={t("leadModal.topic")}
              formPrompt={t("leadModal.formPrompt")}
              showMessageField
              messageLabel={t("leadModal.messageLabel")}
              messagePlaceholder={t("leadModal.messagePlaceholder")}
              submitLabel={t("leadModal.submitLabel")}
              thankYouTitle={t("leadModal.thankYouTitle")}
              thankYouMessage={t("leadModal.thankYouMessage")}
              analyticsFormType="careers_application"
              className="inline-flex justify-center rounded-lg bg-[#052638] px-8 py-3 font-medium text-white transition-colors hover:bg-[#0a3a4a]"
            >
              {t("generalCta.button")}
            </OpenLeadModalButton>
          </AnimateOnScroll>
        </Container>
      </section>

      <FaqSection
        id="careers-faq-heading"
        title={t("faq.heading")}
        subtitle={t("faq.subtitle")}
        faqs={careersFaqs}
        tone="white"
      />
    </>
  );
}
