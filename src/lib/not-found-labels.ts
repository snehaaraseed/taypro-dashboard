import type { NotFoundContentLabels } from "@/app/components/NotFoundContent";

type NotFoundTranslator = (key: string) => string;

export function buildNotFoundLabels(t: NotFoundTranslator): NotFoundContentLabels {
  return {
    breadcrumbHome: t("breadcrumbHome"),
    breadcrumbNotFound: t("breadcrumbNotFound"),
    eyebrow: t("eyebrow"),
    title: t("title"),
    description: t("description"),
    reassurance: t("reassurance"),
    linksHeading: t("linksHeading"),
    linkHome: t("linkHome"),
    linkContact: t("linkContact"),
    linkSitemap: t("linkSitemap"),
    linkProjects: t("linkProjects"),
    linkBlog: t("linkBlog"),
    linkCalculator: t("linkCalculator"),
    reportLabel: t("reportLabel"),
    reportHint: t("reportHint"),
    reportSubject: t("reportSubject"),
    reportBody: t("reportBody"),
    reportEmailLink: t("reportEmailLink"),
    ctaQuote: t("ctaQuote"),
    ctaQuoteTopic: t("ctaQuoteTopic"),
    ctaQuoteTitle: t("ctaQuoteTitle"),
    ctaQuoteSubtitle: t("ctaQuoteSubtitle"),
  };
}
