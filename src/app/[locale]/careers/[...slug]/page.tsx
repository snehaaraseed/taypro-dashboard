import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import CareersApplyForm from "@/app/components/CareersApplyForm";
import {
  careersJobPath,
  getJobOpeningByRoute,
  getJobOpeningByRouteAnyStatus,
  isJobOpeningOpen,
  jobDisplayTitle,
  joinCareerSlugSegments,
} from "@/lib/erpnext/job-openings";
import { ErpNextError } from "@/lib/erpnext/client";
import { JobPostingSchema } from "@/lib/seo/job-posting-schema";
import { sanitizeBlogHtml } from "@/lib/security/sanitize-html";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";

export const revalidate = 300;

type CareersDetailParams = {
  locale: string;
  slug: string[];
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function resolveJobForRoute(routeKey: string) {
  const openJob = await getJobOpeningByRoute(routeKey);
  if (openJob) {
    return { job: openJob, isOpen: true as const };
  }

  const anyStatusJob = await getJobOpeningByRouteAnyStatus(routeKey);
  if (anyStatusJob && !isJobOpeningOpen(anyStatusJob)) {
    return { job: anyStatusJob, isOpen: false as const };
  }

  return { job: null, isOpen: false as const };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CareersDetailParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const routeKey = joinCareerSlugSegments(slug);
  const t = await getTranslations({ locale, namespace: "CareersPage.detail" });

  try {
    const { job, isOpen } = await resolveJobForRoute(routeKey);
    if (!job) return {};
    if (!isOpen) {
      return {
        robots: { index: false, follow: true },
      };
    }

    const title = jobDisplayTitle(job);
    const description =
      (job.description ? stripHtml(job.description).slice(0, 160) : null) ||
      t("metaDescriptionFallback", { title });

    const path = careersJobPath(job);

    return withHreflang(path, locale, {
      title: `${title} | Careers | Taypro`,
      description,
      openGraph: {
        title: `${title} | Taypro Careers`,
        description,
        url: `${SITE_URL}${path}`,
        type: "website",
      },
    });
  } catch {
    return {};
  }
}

export default async function CareersDetailPage({
  params,
}: {
  params: Promise<CareersDetailParams>;
}) {
  const { locale, slug } = await params;
  const routeKey = joinCareerSlugSegments(slug);
  const t = await getTranslations({ locale, namespace: "CareersPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  let resolved: Awaited<ReturnType<typeof resolveJobForRoute>>;

  try {
    resolved = await resolveJobForRoute(routeKey);
  } catch (error) {
    if (error instanceof ErpNextError) {
      console.error("Careers detail ERPNext error:", error.message);
    } else {
      console.error("Careers detail error:", error);
    }
    notFound();
  }

  if (!resolved.job) {
    notFound();
  }

  if (!resolved.isOpen) {
    permanentRedirect("/careers");
  }

  const job = resolved.job;
  const title = jobDisplayTitle(job);
  const meta = [job.department, job.location, job.employment_type, job.company]
    .filter(Boolean)
    .join(" · ");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.current"), href: "/careers" },
    { name: title, href: "" },
  ];

  const descriptionHtml = job.description
    ? sanitizeBlogHtml(job.description)
    : "";
  const plainDescription =
    (job.description ? stripHtml(job.description) : null) ||
    t("detail.metaDescriptionFallback", { title });
  const jobUrl = `${SITE_URL}${careersJobPath(job)}`;

  return (
    <>
      <JobPostingSchema
        job={job}
        description={plainDescription}
        url={jobUrl}
        siteUrl={SITE_URL}
      />
      <Breadcrumbs items={breadcrumbs} />

      <section className="bg-[#052638] px-4 py-14 text-white sm:px-6 md:py-16">
        <Container className="max-w-3xl">
          <Link
            href="/careers"
            className="mb-6 inline-block text-sm text-[#A8C117] hover:underline"
          >
            ← {t("detail.backToCareers")}
          </Link>
          <h1 className="mb-4 text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>
          {meta ? (
            <p className="text-base text-gray-300">{meta}</p>
          ) : null}
        </Container>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:py-20">
        <Container className="max-w-3xl">
          {descriptionHtml ? (
            <AnimateOnScroll animation="fadeInUp" className="mb-12">
              <div
                className="prose prose-lg max-w-none text-[#27415c] prose-headings:text-[#052638] prose-a:text-[#5a8f00]"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </AnimateOnScroll>
          ) : null}

          <AnimateOnScroll animation="fadeInUp">
            <div className="rounded-xl border border-gray-200 bg-[#f4f7f9] p-6 md:p-8">
              <h2 className="sr-only">{t("detail.applySection")}</h2>
              <CareersApplyForm jobOpeningName={job.name} jobTitle={title} />
            </div>
          </AnimateOnScroll>
        </Container>
      </section>
    </>
  );
}
