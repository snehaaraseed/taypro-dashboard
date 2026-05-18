import { Link } from "@/i18n/navigation";
import { ContactEmailLink } from "@/app/components/ContactEmailLink";
import { Container } from "@/app/components/Container";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import NotFoundCTAs from "@/app/components/NotFoundCTAs";

export type NotFoundContentLabels = {
  breadcrumbHome: string;
  breadcrumbNotFound: string;
  eyebrow: string;
  title: string;
  description: string;
  reassurance: string;
  linksHeading: string;
  linkHome: string;
  linkContact: string;
  linkSitemap: string;
  linkProjects: string;
  linkBlog: string;
  linkCalculator: string;
  reportLabel: string;
  reportHint: string;
  reportSubject: string;
  reportBody: string;
  reportEmailLink: string;
  ctaQuote: string;
  ctaQuoteTopic: string;
  ctaQuoteTitle: string;
  ctaQuoteSubtitle: string;
};

type NotFoundContentProps = {
  labels: NotFoundContentLabels;
};

const linkCardClass =
  "flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-[#052638] font-medium shadow-sm hover:border-[#A8C117]/60 hover:shadow-md transition";

export default function NotFoundContent({ labels }: NotFoundContentProps) {
  const breadcrumbs = [
    { name: labels.breadcrumbHome, href: "/" },
    { name: labels.breadcrumbNotFound, href: "" },
  ];

  const quickLinks = [
    { href: "/" as const, label: labels.linkHome },
    { href: "/contact" as const, label: labels.linkContact },
    { href: "/site-map" as const, label: labels.linkSitemap },
    { href: "/projects" as const, label: labels.linkProjects },
    { href: "/blog" as const, label: labels.linkBlog },
    {
      href: "/solar-panel-cleaning-robot-price-calculator#calculator" as const,
      label: labels.linkCalculator,
    },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full bg-white py-14 sm:py-20">
        <Container size="narrow">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[#A8C117] text-sm sm:text-base font-semibold tracking-wide uppercase mb-3">
              {labels.eyebrow}
            </p>
            <h1 className="text-[#052638] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
              {labels.title}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-3">
              {labels.description}
            </p>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
              {labels.reassurance}
            </p>
            <NotFoundCTAs
              quoteLabel={labels.ctaQuote}
              quoteTopic={labels.ctaQuoteTopic}
              quoteTitle={labels.ctaQuoteTitle}
              quoteSubtitle={labels.ctaQuoteSubtitle}
              contactLabel={labels.linkContact}
            />
          </div>
        </Container>
      </section>

      <section className="w-full bg-[#f4f7f9] py-12 sm:py-16 border-t border-gray-100">
        <Container size="narrow">
          <h2 className="text-[#052638] text-xl sm:text-2xl font-semibold mb-6 text-center">
            {labels.linksHeading}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkCardClass}>
                  <span>{item.label}</span>
                  <span className="text-[#A8C117] shrink-0" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-6 text-center">
            <p className="text-[#052638] font-medium mb-2">{labels.reportLabel}</p>
            <p className="text-gray-500 text-sm mb-4">{labels.reportHint}</p>
            <ContactEmailLink
              mailbox="service"
              subject={labels.reportSubject}
              body={labels.reportBody}
              className="inline-flex items-center justify-center min-h-[44px] text-[#A8C117] font-medium hover:underline"
            >
              {labels.reportEmailLink}
            </ContactEmailLink>
          </div>
        </Container>
      </section>
    </>
  );
}
